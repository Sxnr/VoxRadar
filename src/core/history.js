/**
 * Historial "¿Qué me perdí?": lo dicho en los últimos minutos, agrupado por hablante.
 */
import { visibleText } from './simulation.js';

export const MISSED_WINDOW_MS = 2 * 60 * 1000;

function appendToGroups(groups, item, speakerId) {
  const last = groups.at(-1);
  if (last && last.speakerId === speakerId) {
    return [...groups.slice(0, -1), { ...last, items: [...last.items, item] }];
  }
  return [...groups, { speakerId, items: [item] }];
}

export function missedGroups(meeting, t, windowMs = MISSED_WINDOW_MS) {
  const from = t - windowMs;
  return meeting.utterances
    .filter((u) => u.start <= t && u.end > from)
    .sort((a, b) => a.start - b.start)
    .reduce(
      (groups, u) => appendToGroups(groups, { id: u.id, start: u.start, text: visibleText(u, t) }, u.speakerId),
      [],
    );
}

export function formatClock(ms) {
  const safe = Number.isFinite(ms) && ms > 0 ? ms : 0;
  const totalSeconds = Math.floor(safe / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export function findUtterance(meeting, id) {
  return meeting.utterances.find((u) => u.id === id) ?? null;
}

export function meetingStats(meeting, t) {
  const started = meeting.utterances.filter((u) => u.start <= t);
  return { utterances: started.length, speakers: new Set(started.map((u) => u.speakerId)).size };
}
