import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  PAUSE_MS,
  activeUtterancesAt,
  activeSpeakerIdsAt,
  primarySpeakerAt,
  visibleText,
  turnStateAt,
  isPauseStarted,
  recentCaptionsAt,
  isMeetingOver,
} from '../../src/core/simulation.js';
import { DEMO_MEETING } from '../../src/core/meeting-script.js';

const meeting = {
  durationMs: 20000,
  speakers: [
    { id: 'a', label: 'Persona 1', angleDeg: 0 },
    { id: 'b', label: 'Persona 2', angleDeg: 90 },
  ],
  utterances: [
    { id: 'u1', speakerId: 'a', start: 0, end: 4000, text: 'uno dos tres cuatro' },
    { id: 'u2', speakerId: 'b', start: 3000, end: 6000, text: 'hola a todos' },
    { id: 'u3', speakerId: 'a', start: 10000, end: 12000, text: 'final' },
  ],
};

describe('activeUtterancesAt', () => {
  test('returns utterances whose interval contains t', () => {
    const ids = activeUtterancesAt(meeting, 3500).map((u) => u.id);
    assert.deepEqual(ids, ['u1', 'u2']);
  });

  test('treats end as exclusive', () => {
    assert.deepEqual(activeUtterancesAt(meeting, 4000).map((u) => u.id), ['u2']);
  });

  test('returns empty array during silence', () => {
    assert.deepEqual(activeUtterancesAt(meeting, 8000), []);
  });
});

describe('active and primary speakers', () => {
  test('lists unique active speaker ids', () => {
    assert.deepEqual(activeSpeakerIdsAt(meeting, 3500), ['a', 'b']);
  });

  test('primary speaker is the one who started first', () => {
    assert.equal(primarySpeakerAt(meeting, 3500), 'a');
  });

  test('primary speaker is null when nobody speaks', () => {
    assert.equal(primarySpeakerAt(meeting, 8000), null);
  });
});

describe('visibleText', () => {
  const utt = meeting.utterances[0];

  test('is empty before the utterance starts', () => {
    assert.equal(visibleText(utt, -1), '');
  });

  test('reveals words proportionally to elapsed time', () => {
    assert.equal(visibleText(utt, 2000), 'uno dos');
  });

  test('shows at least the first word once started', () => {
    assert.equal(visibleText(utt, 0), 'uno');
  });

  test('shows full text after the end', () => {
    assert.equal(visibleText(utt, 9999), 'uno dos tres cuatro');
  });
});

describe('turnStateAt', () => {
  test('is libre before anyone has spoken', () => {
    assert.equal(turnStateAt({ ...meeting, utterances: [] }, 0), 'libre');
  });

  test('is hablando while someone speaks', () => {
    assert.equal(turnStateAt(meeting, 1000), 'hablando');
  });

  test('stays hablando during a short gap', () => {
    assert.equal(turnStateAt(meeting, 6000 + PAUSE_MS - 1), 'hablando');
  });

  test('becomes libre after the pause threshold', () => {
    assert.equal(turnStateAt(meeting, 6000 + PAUSE_MS), 'libre');
  });

  test('accepts a custom pause threshold', () => {
    assert.equal(turnStateAt(meeting, 6500, 400), 'libre');
  });
});

describe('isPauseStarted', () => {
  test('detects transition from hablando to libre', () => {
    assert.equal(isPauseStarted('hablando', 'libre'), true);
  });

  test('ignores other transitions', () => {
    assert.equal(isPauseStarted('libre', 'libre'), false);
    assert.equal(isPauseStarted('libre', 'hablando'), false);
    assert.equal(isPauseStarted('hablando', 'hablando'), false);
  });
});

describe('recentCaptionsAt', () => {
  test('returns started utterances in order with visible text', () => {
    const captions = recentCaptionsAt(meeting, 5000);
    assert.deepEqual(
      captions.map((c) => [c.id, c.speakerId, c.text]),
      [
        ['u1', 'a', 'uno dos tres cuatro'],
        ['u2', 'b', 'hola a'],
      ],
    );
  });

  test('limits the number of captions', () => {
    const captions = recentCaptionsAt(meeting, 11000, 1);
    assert.deepEqual(captions.map((c) => c.id), ['u3']);
  });

  test('returns empty list before the meeting starts', () => {
    assert.deepEqual(recentCaptionsAt(meeting, -10), []);
  });
});

describe('isMeetingOver', () => {
  test('is false before duration and true after', () => {
    assert.equal(isMeetingOver(meeting, 19999), false);
    assert.equal(isMeetingOver(meeting, 20000), true);
  });
});

describe('DEMO_MEETING data integrity', () => {
  test('every utterance references an existing speaker', () => {
    const ids = new Set(DEMO_MEETING.speakers.map((s) => s.id));
    for (const u of DEMO_MEETING.utterances) assert.ok(ids.has(u.speakerId), u.id);
  });

  test('every utterance has a positive duration inside the meeting', () => {
    for (const u of DEMO_MEETING.utterances) {
      assert.ok(u.end > u.start, u.id);
      assert.ok(u.end <= DEMO_MEETING.durationMs, u.id);
    }
  });

  test('includes overlapping speech and at least one long pause', () => {
    const overlap = DEMO_MEETING.utterances.some((u) => activeUtterancesAt(DEMO_MEETING, u.start).length > 1);
    assert.ok(overlap);
    const sorted = [...DEMO_MEETING.utterances].sort((x, y) => x.start - y.start);
    const hasPause = sorted.some((u, i) => i > 0 && u.start - Math.max(...sorted.slice(0, i).map((p) => p.end)) >= 3000);
    assert.ok(hasPause);
  });

  test('is frozen to prevent mutation', () => {
    assert.ok(Object.isFrozen(DEMO_MEETING));
    assert.ok(Object.isFrozen(DEMO_MEETING.utterances));
    assert.ok(Object.isFrozen(DEMO_MEETING.utterances[0]));
  });
});
