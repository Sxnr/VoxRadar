/**
 * Pantalla 6 · Aviso de turno libre (T3, D4): aparece sobre cualquier pantalla
 * cuando se detecta una pausa y el aviso estaba activado.
 */
import { h } from '../dom.js';
import { icons } from '../icons.js';

export function renderPauseAlert({ onDismiss }) {
  const ok = h('button', { type: 'button', className: 'btn btn-primary btn-xl', onClick: onDismiss }, 'Entendido');
  const element = h(
    'div',
    { className: 'overlay', role: 'alertdialog', 'aria-modal': 'true', 'aria-labelledby': 'pause-title', 'aria-describedby': 'pause-desc' },
    h(
      'div',
      { className: 'overlay-card' },
      h('span', { className: 'overlay-icon' }, h('span', { className: 'overlay-ring', 'aria-hidden': 'true' }), icons.check()),
      h('p', { className: 'overlay-kicker', text: 'Es tu momento' }),
      h('h2', { id: 'pause-title', className: 'overlay-title', text: 'Turno libre' }),
      h('p', { id: 'pause-desc', className: 'overlay-text', text: 'Ahora nadie está hablando. Puedes tomar la palabra sin interrumpir a nadie.' }),
      ok,
    ),
  );
  element.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') onDismiss();
    if (event.key === 'Tab') {
      event.preventDefault();
      ok.focus();
    }
  });
  return { element, focus: ok };
}
