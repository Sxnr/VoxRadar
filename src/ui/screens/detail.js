/**
 * Pantalla 5 · Detalle de una intervención en texto grande (T2, D5).
 */
import { h, setText } from '../dom.js';
import { icons } from '../icons.js';
import { createHeader } from '../components/header.js';
import { findUtterance, formatClock } from '../../core/history.js';
import { directionLabel } from '../../core/speakers.js';

const ZOOM_STEPS = [1, 1.25, 1.5, 2, 2.5];
const DEFAULT_ZOOM_INDEX = 1;

export function renderDetail({ meeting, store, navigate, labelOf, params }) {
  const utterance = findUtterance(meeting, params.id);
  if (!utterance) {
    navigate('/perdi');
    return { element: h('div', {}) };
  }
  const state = store.getState();
  const speaker = meeting.speakers.find((sp) => sp.id === utterance.speakerId);
  const text = h('p', { className: 'detail-text', text: utterance.text });
  const zoomLabel = h('span', { className: 'zoom-label', 'aria-live': 'polite' });
  let zoomIndex = DEFAULT_ZOOM_INDEX;

  function applyZoom(nextIndex) {
    zoomIndex = Math.min(ZOOM_STEPS.length - 1, Math.max(0, nextIndex));
    text.style.setProperty('--zoom', String(ZOOM_STEPS[zoomIndex]));
    setText(zoomLabel, `${Math.round(ZOOM_STEPS[zoomIndex] * 100)}\u00a0%`);
    smaller.disabled = zoomIndex === 0;
    bigger.disabled = zoomIndex === ZOOM_STEPS.length - 1;
  }

  const smaller = h('button', { type: 'button', className: 'btn btn-secondary btn-square', 'aria-label': 'Achicar letra', onClick: () => applyZoom(zoomIndex - 1) }, 'A−');
  const bigger = h('button', { type: 'button', className: 'btn btn-secondary btn-square btn-square-big', 'aria-label': 'Agrandar letra', onClick: () => applyZoom(zoomIndex + 1) }, 'A+');
  applyZoom(DEFAULT_ZOOM_INDEX);

  const element = h(
    'div',
    { className: 'screen screen-detail' },
    createHeader({ title: 'Intervención', subtitle: `Minuto ${formatClock(utterance.start)}`, onBack: () => navigate('/perdi'), backLabel: 'Lista' }),
    h(
      'article',
      { className: `card detail spk-${speaker.hue}` },
      h('p', { className: 'detail-who' }, h('span', { className: 'chip-dot', 'aria-hidden': 'true' }), h('strong', { text: labelOf(state, speaker.id) }), ` · ${directionLabel(speaker.angleDeg)}`),
      text,
    ),
    h('div', { className: 'zoom', role: 'group', 'aria-label': 'Tamaño de letra' }, smaller, zoomLabel, bigger),
    h('div', { className: 'dock' }, h('button', { type: 'button', className: 'btn btn-primary btn-xl', onClick: () => navigate('/radar') }, icons.back(), 'Volver al radar')),
  );
  return { element, focus: bigger };
}
