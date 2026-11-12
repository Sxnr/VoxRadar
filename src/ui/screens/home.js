/**
 * Pantalla 1 · Inicio (D6): una sola acción para empezar, sin registro ni configuración.
 */
import { h, s } from '../dom.js';
import { icons } from '../icons.js';

function emblem() {
  return s(
    'svg',
    { className: 'home-emblem', viewBox: '-60 -60 120 120', 'aria-hidden': 'true' },
    s('circle', { className: 'emblem-disc', r: 56 }),
    s('circle', { className: 'emblem-ring', r: 38 }),
    s('circle', { className: 'emblem-ring', r: 20 }),
    s('path', { className: 'emblem-wedge', d: 'M0 0 L19 -52 A56 56 0 0 1 44 -34 Z' }),
    s('circle', { className: 'emblem-me', r: 7 }),
    s('circle', { className: 'emblem-dot emblem-dot-active', cx: 30, cy: -40, r: 7 }),
    s('circle', { className: 'emblem-dot', cx: -42, cy: -14, r: 5 }),
    s('circle', { className: 'emblem-dot', cx: -14, cy: 44, r: 5 }),
  );
}

export function renderHome({ actions, navigate }) {
  const start = h(
    'button',
    { type: 'button', className: 'btn btn-primary btn-xl', onClick: () => actions.start() },
    icons.wave(),
    'Escuchar',
  );
  const element = h(
    'div',
    { className: 'screen screen-home' },
    h(
      'div',
      { className: 'home-hero' },
      emblem(),
      h('p', { className: 'home-kicker', text: 'VoxRadar' }),
      h('h1', { className: 'home-title', text: 'Mira quién habla y no pierdas el hilo.' }),
    ),
    h(
      'ol',
      { className: 'home-steps' },
      h('li', {}, h('strong', { text: 'Pon el teléfono al centro de la mesa.' })),
      h('li', {}, h('strong', { text: 'Toca “Escuchar”.' }), ' El radar te muestra desde dónde viene cada voz.'),
    ),
    start,
    h(
      'button',
      { type: 'button', className: 'btn btn-ghost', onClick: () => navigate('/ajustes') },
      icons.settings(),
      'Ajustes (opcional)',
    ),
    h('p', { className: 'demo-note', text: 'Prototipo: usa una reunión de demostración con voces simuladas.' }),
  );
  return { element, focus: start };
}
