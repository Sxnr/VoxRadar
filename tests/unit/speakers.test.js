import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  MAX_NAME_LENGTH,
  validateName,
  renameSpeaker,
  speakerLabel,
  directionLabel,
  sanitizeNames,
  initialsOf,
} from '../../src/core/speakers.js';

const meeting = {
  speakers: [
    { id: 'a', label: 'Persona 1', angleDeg: 0 },
    { id: 'b', label: 'Persona 2', angleDeg: 90 },
  ],
};

describe('validateName', () => {
  test('trims and accepts a normal name', () => {
    assert.deepEqual(validateName('  Rosa  '), { ok: true, value: 'Rosa' });
  });

  test('collapses inner whitespace', () => {
    assert.deepEqual(validateName('Don   Luis'), { ok: true, value: 'Don Luis' });
  });

  test('rejects empty names', () => {
    const result = validateName('   ');
    assert.equal(result.ok, false);
    assert.match(result.error, /Escribe un nombre/);
  });

  test('rejects names longer than the limit', () => {
    const result = validateName('x'.repeat(MAX_NAME_LENGTH + 1));
    assert.equal(result.ok, false);
    assert.match(result.error, /20 caracteres/);
  });

  test('rejects non-string input', () => {
    assert.equal(validateName(undefined).ok, false);
    assert.equal(validateName(42).ok, false);
  });
});

describe('renameSpeaker', () => {
  test('returns a new names map without mutating the original', () => {
    const names = Object.freeze({});
    const result = renameSpeaker(meeting, names, 'a', 'Rosa');
    assert.equal(result.ok, true);
    assert.deepEqual(result.names, { a: 'Rosa' });
    assert.deepEqual(names, {});
    assert.ok(Object.isFrozen(result.names));
  });

  test('rejects unknown speakers', () => {
    const result = renameSpeaker(meeting, {}, 'zzz', 'Rosa');
    assert.equal(result.ok, false);
    assert.match(result.error, /no existe/);
  });

  test('propagates validation errors', () => {
    const result = renameSpeaker(meeting, {}, 'a', '');
    assert.equal(result.ok, false);
  });
});

describe('speakerLabel', () => {
  test('prefers the custom name', () => {
    assert.equal(speakerLabel(meeting, { a: 'Rosa' }, 'a'), 'Rosa');
  });

  test('falls back to the default label', () => {
    assert.equal(speakerLabel(meeting, {}, 'b'), 'Persona 2');
  });

  test('handles unknown ids', () => {
    assert.equal(speakerLabel(meeting, {}, 'x'), 'Desconocido');
  });
});

describe('sanitizeNames', () => {
  test('keeps only valid names for known speakers', () => {
    const raw = { a: '  Rosa ', b: '', x: 'Intruso', c: 5 };
    assert.deepEqual(sanitizeNames(meeting, raw), { a: 'Rosa' });
  });

  test('returns empty map for invalid input', () => {
    assert.deepEqual(sanitizeNames(meeting, null), {});
    assert.deepEqual(sanitizeNames(meeting, 'texto'), {});
    assert.deepEqual(sanitizeNames(meeting, ['a']), {});
  });
});

describe('directionLabel', () => {
  const cases = [
    [0, 'al frente'],
    [45, 'adelante a la derecha'],
    [90, 'a la derecha'],
    [135, 'atrás a la derecha'],
    [180, 'atrás'],
    [225, 'atrás a la izquierda'],
    [270, 'a la izquierda'],
    [315, 'adelante a la izquierda'],
    [350, 'al frente'],
    [-90, 'a la izquierda'],
    [450, 'a la derecha'],
  ];
  for (const [angle, expected] of cases) {
    test(`${angle}° → ${expected}`, () => {
      assert.equal(directionLabel(angle), expected);
    });
  }
});

describe('initialsOf', () => {
  test('keeps the number of default labels', () => {
    assert.equal(initialsOf('Persona 3'), 'P3');
  });

  test('uses up to two initials of custom names', () => {
    assert.equal(initialsOf('Rosa'), 'R');
    assert.equal(initialsOf('don luis pérez'), 'DL');
  });

  test('handles empty input', () => {
    assert.equal(initialsOf(''), '?');
    assert.equal(initialsOf(undefined), '?');
  });
});
