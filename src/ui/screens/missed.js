/**
 * Pantalla 4 · ¿Qué me perdí? (T2, D3): los últimos 2 minutos agrupados por hablante.
 * Se toma una "foto" al entrar para que la lista no se mueva mientras se lee.
 */
import { h } from '../dom.js';
import { icons } from '../icons.js';
import { createHeader } from '../components/header.js';
import { missedGroups, formatClock } from '../../core/history.js';
import { directionLabel } from '../../core/speakers.js';

function renderGroup(group, { meeting, state, labelOf, navigate }) {
  const speaker = meeting.speakers.find((sp) => sp.id === group.speakerId);
  return h(
    'li',
    { className: `missed-group spk-${speaker.hue}` },
    h('p', { className: 'missed-who' }, h('span', { className: 'chip-dot', 'aria-hidden': 'true' }), h('strong', { text: labelOf(state, speaker.id) }), h('span', { className: 'missed-where', text: ` · ${directionLabel(speaker.angleDeg)}` })),
    h(
      'ul',
      { className: 'missed-items' },
      group.items.map((item) =>
        h(
          'li',
          {},
          h(
            'button',
            { type: 'button', className: 'missed-item', onClick: () => navigate(`/detalle/${item.id}`), 'aria-label': `${formatClock(item.start)}, ${item.text}. Ver en grande` },
            h('time', { className: 'missed-time', text: formatClock(item.start) }),
            h('span', { className: 'missed-text', text: item.text }),
          ),
        ),
      ),
    ),
  );
}

export function renderMissed(ctx) {
  const { meeting, store, navigate } = ctx;
  const state = store.getState();
  const groups = missedGroups(meeting, state.t);
  const body = groups.length
    ? h('ol', { className: 'missed-list' }, groups.map((g) => renderGroup(g, { ...ctx, state })))
    : h('p', { className: 'card empty', text: 'Todavía no se ha dicho nada.' });
  const back = h('button', { type: 'button', className: 'btn btn-primary btn-xl', onClick: () => navigate('/radar') }, icons.back(), 'Volver al radar');
  const element = h(
    'div',
    { className: 'screen screen-missed' },
    createHeader({ title: 'Lo que te perdiste', subtitle: `Últimos 2 minutos, hasta el ${formatClock(state.t)}`, onBack: () => navigate('/radar'), backLabel: 'Radar' }),
    body,
    h('div', { className: 'dock' }, back),
  );
  return { element, focus: element.querySelector('.missed-item') ?? back };
}
