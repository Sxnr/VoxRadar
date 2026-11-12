/**
 * Indicador de turno (D4): dos estados con ícono y texto, y aviso opcional en la pausa.
 */
import { h, setText, replaceChildren } from '../dom.js';
import { icons } from '../icons.js';
import { TURN } from '../../core/simulation.js';

const COPY = {
  [TURN.SPEAKING]: { text: 'Alguien está hablando', icon: icons.wave },
  [TURN.FREE]: { text: 'Turno libre', icon: icons.check },
};

export function createTurnIndicator({ onToggleAlert }) {
  const iconSlot = h('span', { className: 'turn-icon' });
  const label = h('span', { className: 'turn-text' });
  const pill = h('div', { className: 'turn-pill', role: 'status' }, iconSlot, label);
  const alertText = h('span', {});
  const alertButton = h(
    'button',
    { type: 'button', className: 'btn btn-toggle', 'aria-pressed': 'false', onClick: onToggleAlert },
    icons.bell(),
    alertText,
  );
  const element = h('section', { className: 'turn', 'aria-label': 'Turno de palabra' }, pill, alertButton);
  let currentTurn = null;

  function update({ turn, alertArmed }) {
    if (turn !== currentTurn) {
      currentTurn = turn;
      pill.dataset.turn = turn;
      replaceChildren(iconSlot, COPY[turn].icon());
      setText(label, COPY[turn].text);
    }
    alertButton.setAttribute('aria-pressed', String(alertArmed));
    setText(alertText, alertArmed ? 'Te aviso en la pausa' : 'Avisarme en la pausa');
  }

  return { element, update };
}
