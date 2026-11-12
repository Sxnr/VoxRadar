/**
 * Reloj de la reunión simulada. Avanza el tiempo según la velocidad de demostración.
 */

export const TICK_MS = 200;

export function createClock({ onTick, speed = 1, tickMs = TICK_MS }) {
  let timer = null;
  let last = 0;

  function loop() {
    const now = performance.now();
    const elapsed = now - last;
    last = now;
    onTick(elapsed * speed);
  }

  return {
    start() {
      if (timer !== null) return;
      last = performance.now();
      timer = setInterval(loop, tickMs);
    },
    stop() {
      clearInterval(timer);
      timer = null;
    },
  };
}
