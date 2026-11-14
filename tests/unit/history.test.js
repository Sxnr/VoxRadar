import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { MISSED_WINDOW_MS, missedGroups, formatClock, findUtterance, meetingStats } from '../../src/core/history.js';

const meeting = {
  durationMs: 300000,
  speakers: [
    { id: 'a', label: 'Persona 1', angleDeg: 0 },
    { id: 'b', label: 'Persona 2', angleDeg: 90 },
  ],
  utterances: [
    { id: 'old', speakerId: 'b', start: 0, end: 5000, text: 'muy antiguo' },
    { id: 'u1', speakerId: 'a', start: 130000, end: 132000, text: 'primero' },
    { id: 'u2', speakerId: 'a', start: 133000, end: 135000, text: 'segundo' },
    { id: 'u3', speakerId: 'b', start: 136000, end: 138000, text: 'tercero' },
    { id: 'future', speakerId: 'a', start: 200000, end: 201000, text: 'futuro' },
  ],
};

describe('missedGroups', () => {
  test('uses a two minute window by default', () => {
    assert.equal(MISSED_WINDOW_MS, 120000);
  });

  test('groups consecutive utterances by speaker inside the window', () => {
    const groups = missedGroups(meeting, 140000);
    assert.deepEqual(
      groups.map((g) => [g.speakerId, g.items.map((i) => i.id)]),
      [
        ['a', ['u1', 'u2']],
        ['b', ['u3']],
      ],
    );
  });

  test('excludes utterances that ended before the window and future ones', () => {
    const ids = missedGroups(meeting, 140000).flatMap((g) => g.items.map((i) => i.id));
    assert.ok(!ids.includes('old'));
    assert.ok(!ids.includes('future'));
  });

  test('includes the partial text of an utterance in progress', () => {
    const groups = missedGroups(meeting, 137000);
    const last = groups.at(-1).items.at(-1);
    assert.equal(last.id, 'u3');
    assert.equal(last.text, 'tercero');
    assert.equal(last.start, 136000);
  });

  test('returns empty list when nothing was said', () => {
    assert.deepEqual(missedGroups(meeting, -1), []);
  });

  test('accepts a custom window', () => {
    const ids = missedGroups(meeting, 140000, 6000).flatMap((g) => g.items.map((i) => i.id));
    assert.deepEqual(ids, ['u2', 'u3']);
  });
});

describe('formatClock', () => {
  test('formats milliseconds as m:ss', () => {
    assert.equal(formatClock(0), '0:00');
    assert.equal(formatClock(65000), '1:05');
    assert.equal(formatClock(600999), '10:00');
  });

  test('clamps negative and invalid values to zero', () => {
    assert.equal(formatClock(-5000), '0:00');
    assert.equal(formatClock(Number.NaN), '0:00');
  });
});

describe('findUtterance', () => {
  test('returns the utterance by id', () => {
    assert.equal(findUtterance(meeting, 'u2').text, 'segundo');
  });

  test('returns null for unknown ids', () => {
    assert.equal(findUtterance(meeting, 'nope'), null);
  });
});

describe('meetingStats', () => {
  test('counts started utterances and distinct speakers', () => {
    assert.deepEqual(meetingStats(meeting, 136500), { utterances: 4, speakers: 2 });
  });

  test('is zero before anyone speaks', () => {
    assert.deepEqual(meetingStats(meeting, -1), { utterances: 0, speakers: 0 });
  });
});
