/**
 * Funciones puras que describen el estado de la reunión en un instante t (ms).
 */

export const PAUSE_MS = 1500;
export const DEFAULT_CAPTION_LIMIT = 3;

export const TURN = Object.freeze({ SPEAKING: 'hablando', FREE: 'libre' });

const byStart = (a, b) => a.start - b.start;

export function activeUtterancesAt(meeting, t) {
  return meeting.utterances.filter((u) => u.start <= t && t < u.end).sort(byStart);
}

export function activeSpeakerIdsAt(meeting, t) {
  return [...new Set(activeUtterancesAt(meeting, t).map((u) => u.speakerId))];
}

export function primarySpeakerAt(meeting, t) {
  const [first] = activeUtterancesAt(meeting, t);
  return first ? first.speakerId : null;
}

export function visibleText(utterance, t) {
  if (t < utterance.start) return '';
  if (t >= utterance.end) return utterance.text;
  const words = utterance.text.split(' ');
  const progress = (t - utterance.start) / (utterance.end - utterance.start);
  const count = Math.max(1, Math.floor(words.length * progress));
  return words.slice(0, count).join(' ');
}

function lastEndBefore(meeting, t) {
  return meeting.utterances
    .filter((u) => u.end <= t)
    .reduce((latest, u) => Math.max(latest, u.end), Number.NEGATIVE_INFINITY);
}

export function turnStateAt(meeting, t, pauseMs = PAUSE_MS) {
  if (activeUtterancesAt(meeting, t).length > 0) return TURN.SPEAKING;
  const lastEnd = lastEndBefore(meeting, t);
  return t - lastEnd >= pauseMs ? TURN.FREE : TURN.SPEAKING;
}

export function isPauseStarted(previousTurn, nextTurn) {
  return previousTurn === TURN.SPEAKING && nextTurn === TURN.FREE;
}

export function recentCaptionsAt(meeting, t, limit = DEFAULT_CAPTION_LIMIT) {
  return meeting.utterances
    .filter((u) => u.start <= t)
    .sort(byStart)
    .slice(-limit)
    .map((u) => ({ id: u.id, speakerId: u.speakerId, text: visibleText(u, t), live: t < u.end }));
}

export function isMeetingOver(meeting, t) {
  return t >= meeting.durationMs;
}
