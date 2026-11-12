/**
 * Parámetros de la URL para la demostración y las pruebas:
 *   ?velocidad=4   acelera la reunión simulada
 *   ?t=14          empieza en el segundo 14
 *   ?congelar=1    detiene el reloj (capturas y pruebas deterministas)
 */

export const MAX_SPEED = 20;
const MIN_SPEED = 1;
const MAX_START_S = 3600;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function readNumber(params, key, fallback) {
  const raw = params.get(key);
  if (raw === null || raw.trim() === '') return fallback;
  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

export function parseDemoParams(search) {
  const params = new URLSearchParams(search);
  return {
    speed: clamp(readNumber(params, 'velocidad', MIN_SPEED), MIN_SPEED, MAX_SPEED),
    startMs: Math.round(clamp(readNumber(params, 't', 0), 0, MAX_START_S) * 1000),
    frozen: params.get('congelar') === '1',
  };
}
