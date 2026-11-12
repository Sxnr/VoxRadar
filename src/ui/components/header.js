import { h } from '../dom.js';
import { icons } from '../icons.js';

export function createHeader({ title, subtitle, onBack, backLabel = 'Volver', trailing = null }) {
  const back = onBack
    ? h('button', { type: 'button', className: 'btn btn-ghost btn-back', onClick: onBack }, icons.back(), backLabel)
    : null;
  return h(
    'header',
    { className: 'topbar' },
    back,
    h('div', { className: 'topbar-titles' }, h('h1', { className: 'topbar-title', text: title }), subtitle ? h('p', { className: 'topbar-sub', text: subtitle }) : null),
    trailing,
  );
}
