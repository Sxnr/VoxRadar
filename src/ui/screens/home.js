/**
 * Pantalla 1 · Inicio (D6): una sola acción para empezar, sin registro ni configuración.
 */
import { h, s } from '../dom.js';
import { icons } from '../icons.js';
import { greetingFor } from '../../core/greeting.js';

function emblem() {
  return s(
    'svg',
    { className: 'home-emblem', viewBox: '-60 -60 120 120', 'aria-hidden': 'true' },
    s('circle', { className: 'emblem-disc', r: 56 }),
    s('circle', { className: 'emblem-ring', r: 38 }),
    s('circle', { className: 'emblem-ring', r: 20 }),
    s('g', { className: 'emblem-sweep' }, s('path', { className: 'emblem-wedge', d: 'M0 0 L19 -52 A56 56 0 0 1 44 -34 Z' })),
    s('circle', { className: 'emblem-me', r: 7 }),
    s('circle', { className: 'emblem-pulse', cx: 30, cy: -40, r: 7 }),
    s('circle', { className: 'emblem-dot emblem-dot-active', cx: 30, cy: -40, r: 7 }),
    s('circle', { className: 'emblem-dot', cx: -42, cy: -14, r: 5 }),
    s('circle', { className: 'emblem-dot', cx: -14, cy: 44, r: 5 }),
  );
}

function step(number, title, detail) {
  return h(
    'li',
    { className: 'home-step' },
    h('span', { className: 'home-step-num', 'aria-hidden': 'true', text: number }),
    h('span', {}, h('strong', { text: title }), detail ? h('span', { className: 'home-step-detail', text: detail }) : null),
  );
}

export function renderHome({ actions, navigate }) {
  const start = h(
    'button',
    { type: 'button', className: 'btn btn-primary btn-xl btn-start', onClick: () => actions.start() },
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
      h('p', { className: 'home-kicker', text: greetingFor(new Date().getHours()) }),
      h('h1', { className: 'home-title' }, 'Mira quién habla ', h('span', { className: 'home-title-accent', text: 'y no pierdas el hilo.' })),
      h('p', { className: 'home-lead', text: 'VoxRadar te muestra desde dónde viene cada voz, te avisa cuando hay una pausa para hablar y te pone al día si te perdiste algo.' }),
    ),
    h(
      'ol',
      { className: 'home-steps' },
      step('1', 'Pon el teléfono al centro de la mesa.', 'Así el radar sabe dónde está cada persona.'),
      step('2', 'Toca “Escuchar”.', 'El punto que crece es quien está hablando.'),
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
