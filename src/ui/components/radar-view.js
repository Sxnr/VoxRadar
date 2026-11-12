/**
 * Pantalla 2 · Radar (D1): cada hablante es un punto en su dirección real.
 * El hablante activo se distingue por tamaño, anillo, ondas y etiqueta, no solo por color.
 */
import { s, setText } from '../dom.js';
import { polarToPoint } from '../../core/geometry.js';
import { directionLabel } from '../../core/speakers.js';

const RADIUS = 110;
const SPEAKER_RADIUS = 80;
const WEDGE_HALF_DEG = 20;
const RINGS = [38, 74, RADIUS];

function wedgePath(angleDeg) {
  const a = polarToPoint(angleDeg - WEDGE_HALF_DEG, RADIUS);
  const b = polarToPoint(angleDeg + WEDGE_HALF_DEG, RADIUS);
  return `M0 0 L${a.x.toFixed(2)} ${a.y.toFixed(2)} A${RADIUS} ${RADIUS} 0 0 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)} Z`;
}

function buildBackdrop() {
  return s(
    'g',
    { className: 'radar-backdrop', 'aria-hidden': 'true' },
    s('circle', { className: 'radar-disc', r: RADIUS }),
    ...RINGS.map((r) => s('circle', { className: 'radar-ring', r })),
    s('line', { className: 'radar-axis', x1: 0, y1: -RADIUS, x2: 0, y2: RADIUS }),
    s('line', { className: 'radar-axis', x1: -RADIUS, y1: 0, x2: RADIUS, y2: 0 }),
    s('text', { className: 'radar-front', x: 0, y: -RADIUS + 14, 'text-anchor': 'middle', text: 'FRENTE' }),
  );
}

function buildCenter() {
  return s(
    'g',
    { className: 'radar-me', 'aria-hidden': 'true' },
    s('circle', { r: 15 }),
    s('text', { y: 5, 'text-anchor': 'middle', text: 'Tú' }),
  );
}

function buildSpeaker(speaker, onSelect) {
  const { x, y } = polarToPoint(speaker.angleDeg, SPEAKER_RADIUS);
  const labelBelow = y < 60;
  const label = s('text', { className: 'spk-label', y: labelBelow ? 30 : -24, 'text-anchor': 'middle' });
  const status = s('text', { className: 'spk-status', y: labelBelow ? 43 : -37, 'text-anchor': 'middle' });
  const group = s(
    'g',
    {
      className: `spk spk-${speaker.hue}`,
      transform: `translate(${x.toFixed(2)} ${y.toFixed(2)})`,
      role: 'button',
      tabindex: 0,
      dataset: { speaker: speaker.id },
    },
    s('circle', { className: 'spk-wave spk-wave-1', r: 16 }),
    s('circle', { className: 'spk-wave spk-wave-2', r: 16 }),
    s('circle', { className: 'spk-hit', r: 24 }),
    s('circle', { className: 'spk-dot', r: 10 }),
    label,
    status,
  );
  const select = () => onSelect(speaker.id);
  group.addEventListener('click', select);
  group.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      select();
    }
  });
  return { group, label, status };
}

function speakerRole(id, primaryId, activeIds) {
  if (id === primaryId) return 'primary';
  return activeIds.includes(id) ? 'secondary' : 'idle';
}

const STATUS_TEXT = { primary: 'HABLA', secondary: 'también habla', idle: '' };

export function createRadarView({ meeting, onSelect }) {
  const wedge = s('path', { className: 'radar-wedge', d: '' });
  const nodes = meeting.speakers.map((sp) => ({ speaker: sp, ...buildSpeaker(sp, onSelect) }));
  const element = s(
    'svg',
    {
      className: 'radar',
      viewBox: `${-RADIUS - 8} ${-RADIUS - 8} ${2 * RADIUS + 16} ${2 * RADIUS + 16}`,
      role: 'group',
      'aria-label': 'Radar de hablantes. Tú estás al centro; arriba es al frente.',
    },
    buildBackdrop(),
    wedge,
    buildCenter(),
    ...nodes.map((n) => n.group),
  );

  function update({ primaryId, activeIds, labelOf }) {
    const primary = meeting.speakers.find((sp) => sp.id === primaryId);
    wedge.setAttribute('d', primary ? wedgePath(primary.angleDeg) : '');
    nodes.forEach(({ speaker, group, label, status }) => {
      const role = speakerRole(speaker.id, primaryId, activeIds);
      group.dataset.role = role;
      setText(label, labelOf(speaker.id));
      setText(status, STATUS_TEXT[role]);
      const speaking = role === 'idle' ? 'en silencio' : 'hablando';
      group.setAttribute(
        'aria-label',
        `${labelOf(speaker.id)}, ${directionLabel(speaker.angleDeg)}, ${speaking}. Cambiar nombre`,
      );
    });
  }

  return { element, update };
}
