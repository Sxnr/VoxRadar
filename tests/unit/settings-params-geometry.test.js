import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_SETTINGS, TEXT_SCALES, updateSetting, sanitizeSettings } from '../../src/core/settings.js';
import { parseDemoParams, MAX_SPEED } from '../../src/core/params.js';
import { normalizeAngle, polarToPoint } from '../../src/core/geometry.js';

describe('settings', () => {
  test('defaults are frozen and accessible', () => {
    assert.ok(Object.isFrozen(DEFAULT_SETTINGS));
    assert.deepEqual(DEFAULT_SETTINGS, { textScale: 1, highContrast: false, vibration: true });
    assert.deepEqual(TEXT_SCALES, [1, 1.25, 1.5, 2]);
  });

  test('updateSetting returns a new object with the change', () => {
    const result = updateSetting(DEFAULT_SETTINGS, 'textScale', 1.5);
    assert.equal(result.ok, true);
    assert.equal(result.settings.textScale, 1.5);
    assert.equal(DEFAULT_SETTINGS.textScale, 1);
  });

  test('updateSetting rejects unknown keys', () => {
    const result = updateSetting(DEFAULT_SETTINGS, 'color', 'rojo');
    assert.equal(result.ok, false);
    assert.match(result.error, /desconocido/);
  });

  test('updateSetting rejects invalid values', () => {
    assert.equal(updateSetting(DEFAULT_SETTINGS, 'textScale', 3).ok, false);
    assert.equal(updateSetting(DEFAULT_SETTINGS, 'highContrast', 'sí').ok, false);
    assert.equal(updateSetting(DEFAULT_SETTINGS, 'vibration', 1).ok, false);
  });

  test('sanitizeSettings merges valid persisted values with defaults', () => {
    const result = sanitizeSettings({ textScale: 2, highContrast: true, vibration: 'x', extra: 1 });
    assert.deepEqual(result, { textScale: 2, highContrast: true, vibration: true });
  });

  test('sanitizeSettings returns defaults for invalid input', () => {
    assert.deepEqual(sanitizeSettings(null), DEFAULT_SETTINGS);
    assert.deepEqual(sanitizeSettings([1, 2]), DEFAULT_SETTINGS);
  });
});

describe('parseDemoParams', () => {
  test('returns defaults for an empty query', () => {
    assert.deepEqual(parseDemoParams(''), { speed: 1, startMs: 0, frozen: false });
  });

  test('parses speed, start time and frozen flag', () => {
    assert.deepEqual(parseDemoParams('?velocidad=4&t=14.5&congelar=1'), { speed: 4, startMs: 14500, frozen: true });
  });

  test('clamps speed and start into safe ranges', () => {
    const result = parseDemoParams(`?velocidad=999&t=-3`);
    assert.equal(result.speed, MAX_SPEED);
    assert.equal(result.startMs, 0);
  });

  test('ignores non-numeric values', () => {
    assert.deepEqual(parseDemoParams('?velocidad=abc&t=<script>'), { speed: 1, startMs: 0, frozen: false });
  });
});

describe('geometry', () => {
  test('normalizeAngle wraps into [0, 360)', () => {
    assert.equal(normalizeAngle(370), 10);
    assert.equal(normalizeAngle(-90), 270);
    assert.equal(normalizeAngle(360), 0);
  });

  test('polarToPoint uses 0° as top and goes clockwise', () => {
    const top = polarToPoint(0, 10);
    const right = polarToPoint(90, 10);
    assert.ok(Math.abs(top.x) < 1e-9 && Math.abs(top.y + 10) < 1e-9);
    assert.ok(Math.abs(right.x - 10) < 1e-9 && Math.abs(right.y) < 1e-9);
  });
});
