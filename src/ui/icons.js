/**
 * Íconos SVG en línea. Siempre acompañan a un texto: nunca transmiten información por sí solos.
 */
import { s } from './dom.js';

function icon(...paths) {
  return s(
    'svg',
    { className: 'icon', viewBox: '0 0 24 24', width: 24, height: 24, 'aria-hidden': 'true', focusable: 'false' },
    ...paths,
  );
}

const stroke = (d) => s('path', { d, fill: 'none', stroke: 'currentColor', 'stroke-width': 2.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });

export const icons = {
  wave: () => icon(stroke('M4 10v4'), stroke('M8 7v10'), stroke('M12 4v16'), stroke('M16 7v10'), stroke('M20 10v4')),
  check: () => icon(stroke('M20 6 9 17l-5-5')),
  back: () => icon(stroke('M15 18 9 12l6-6')),
  settings: () =>
    icon(
      s('circle', { cx: 12, cy: 12, r: 3, fill: 'none', stroke: 'currentColor', 'stroke-width': 2.2 }),
      stroke('M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1'),
    ),
  history: () => icon(stroke('M3 12a9 9 0 1 0 3-6.7L3 8'), stroke('M3 3v5h5'), stroke('M12 7v5l3 3')),
  pause: () => icon(stroke('M9 5v14'), stroke('M15 5v14')),
  play: () => icon(stroke('M7 4l13 8-13 8z')),
  bell: () => icon(stroke('M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9'), stroke('M10.3 21a1.9 1.9 0 0 0 3.4 0')),
  restart: () => icon(stroke('M3 12a9 9 0 1 0 3-6.7L3 8'), stroke('M3 3v5h5')),
  pencil: () => icon(stroke('M12 20h9'), stroke('M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z')),
};
