/**
 * Geometría del radar: 0° es "al frente" (arriba) y los ángulos crecen en sentido horario.
 */

const FULL_TURN = 360;

export function normalizeAngle(angleDeg) {
  return ((angleDeg % FULL_TURN) + FULL_TURN) % FULL_TURN;
}

export function polarToPoint(angleDeg, radius) {
  const radians = (normalizeAngle(angleDeg) * Math.PI) / 180;
  return { x: radius * Math.sin(radians), y: -radius * Math.cos(radians) };
}
