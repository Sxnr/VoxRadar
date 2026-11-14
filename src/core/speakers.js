/**
 * Nombres de hablantes y descripción de la dirección desde donde hablan.
 */
import { normalizeAngle } from './geometry.js';

export const MAX_NAME_LENGTH = 20;
const UNKNOWN_LABEL = 'Desconocido';

const DIRECTIONS = [
  'al frente',
  'adelante a la derecha',
  'a la derecha',
  'atrás a la derecha',
  'atrás',
  'atrás a la izquierda',
  'a la izquierda',
  'adelante a la izquierda',
];
const SECTOR_DEG = 360 / DIRECTIONS.length;

export function validateName(raw) {
  if (typeof raw !== 'string') return { ok: false, error: 'Escribe un nombre.' };
  const value = raw.trim().replace(/\s+/g, ' ');
  if (value.length === 0) return { ok: false, error: 'Escribe un nombre.' };
  if (value.length > MAX_NAME_LENGTH) {
    return { ok: false, error: `El nombre puede tener hasta ${MAX_NAME_LENGTH} caracteres.` };
  }
  return { ok: true, value };
}

function hasSpeaker(meeting, id) {
  return meeting.speakers.some((s) => s.id === id);
}

export function renameSpeaker(meeting, names, id, raw) {
  if (!hasSpeaker(meeting, id)) return { ok: false, error: 'Ese hablante no existe.' };
  const result = validateName(raw);
  if (!result.ok) return result;
  return { ok: true, names: Object.freeze({ ...names, [id]: result.value }) };
}

export function speakerLabel(meeting, names, id) {
  if (names && typeof names[id] === 'string') return names[id];
  const speaker = meeting.speakers.find((s) => s.id === id);
  return speaker ? speaker.label : UNKNOWN_LABEL;
}

export function sanitizeNames(meeting, raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  return Object.entries(raw).reduce((acc, [id, name]) => {
    if (!hasSpeaker(meeting, id)) return acc;
    const result = validateName(name);
    return result.ok ? { ...acc, [id]: result.value } : acc;
  }, {});
}

export function directionLabel(angleDeg) {
  const index = Math.round(normalizeAngle(angleDeg) / SECTOR_DEG) % DIRECTIONS.length;
  return DIRECTIONS[index];
}

export function initialsOf(name) {
  if (typeof name !== 'string' || name.trim() === '') return '?';
  const words = name.trim().split(/\s+/);
  const numbered = /^persona$/i.test(words[0]) && /^\d+$/.test(words[1] ?? '');
  if (numbered) return `P${words[1]}`;
  return words
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}
