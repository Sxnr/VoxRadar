/**
 * Pantalla 4 · ¿Qué me perdí? (T2, D3): los últimos 2 minutos agrupados por hablante.
 * Se toma una "foto" al entrar para que la lista no se mueva mientras se lee.
 */
import { h } from '../dom.js';
import { icons } from '../icons.js';
import { createHeader } from '../components/header.js';
import { missedGroups, formatClock, MISSED_WINDOW_MS } from '../../core/history.js';
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
    : h('p', { className: 'card empty', text: 'Todavía nadie ha dicho nada. Vuelve en un rato: aquí verás lo que se conversó.' });
  const count = groups.reduce((n, g) => n + g.items.length, 0);
  const people = new Set(groups.map((g) => g.speakerId)).size;
  const summary = groups.length
    ? h('p', { className: 'missed-summary' }, h('strong', { text: `${count} intervenciones` }), ` de ${people} ${people === 1 ? 'persona' : 'personas'}. Toca una frase para leerla en grande.`)
    : null;
  const back = h('button', { type: 'button', className: 'btn btn-primary btn-xl', onClick: () => navigate('/radar') }, icons.back(), 'Volver al radar');
  const element = h(
    'div',
    { className: 'screen screen-missed' },
    createHeader({ title: 'Te ponemos al día', subtitle: `Lo que se dijo en los últimos ${MISSED_WINDOW_MS / 60000} minutos (hasta el ${formatClock(state.t)})`, onBack: () => navigate('/radar'), backLabel: 'Radar' }),
    summary,
    body,
    h('div', { className: 'dock' }, back),
  );
  return { element, focus: element.querySelector('.missed-item') ?? back };
}
