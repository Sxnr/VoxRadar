/**
 * Pantalla 7 · Ajustes (D5, D6): tamaño de texto, alto contraste y vibración. Todo opcional.
 */
import { h } from '../dom.js';
import { createHeader } from '../components/header.js';
import { TEXT_SCALES } from '../../core/settings.js';

function scaleOption(scale, current, onPick) {
  const percent = `${Math.round(scale * 100)}\u00a0%`;
  return h(
    'button',
    { type: 'button', className: 'btn btn-option', 'aria-pressed': String(scale === current), onClick: () => onPick(scale) },
    percent,
  );
}

function toggleRow({ id, title, help, checked, onChange }) {
  const input = h('input', { id, type: 'checkbox', role: 'switch', className: 'switch', checked, onChange: (e) => onChange(e.target.checked) });
  return h(
    'div',
    { className: 'setting-row' },
    h('label', { for: id, className: 'setting-text' }, h('strong', { text: title }), h('span', { className: 'field-help', text: help })),
    input,
  );
}

export function renderSettings({ store, actions, navigate }) {
  const element = h('div', { className: 'screen screen-settings' });
  const goBack = () => {
    const { t, playing } = store.getState();
    navigate(playing || t > 0 ? '/radar' : '/inicio');
  };

  function draw() {
    const { settings } = store.getState();
    element.replaceChildren(
      createHeader({ title: 'Ajustes', subtitle: 'Todos son opcionales', onBack: goBack }),
      h(
        'section',
        { className: 'card', 'aria-labelledby': 'scale-title' },
        h('h2', { id: 'scale-title', className: 'card-title', text: 'Tamaño del texto' }),
        h('div', { className: 'options', role: 'group', 'aria-labelledby': 'scale-title' }, TEXT_SCALES.map((sc) => scaleOption(sc, settings.textScale, (v) => actions.setSetting('textScale', v)))),
        h('p', { className: 'preview', text: 'Así se verá el texto de los subtítulos.' }),
      ),
      h(
        'section',
        { className: 'card' },
        toggleRow({ id: 'opt-contrast', title: 'Alto contraste', help: 'Negro, blanco y amarillo.', checked: settings.highContrast, onChange: (v) => actions.setSetting('highContrast', v) }),
        toggleRow({ id: 'opt-vibration', title: 'Vibrar en la pausa', help: 'Además del aviso en pantalla.', checked: settings.vibration, onChange: (v) => actions.setSetting('vibration', v) }),
      ),
    );
  }

  draw();
  let lastSettings = store.getState().settings;
  return {
    element,
    focus: element.querySelector('.btn-back'),
    update(state) {
      if (state.settings === lastSettings) return;
      lastSettings = state.settings;
      const active = document.activeElement?.id;
      draw();
      if (active) document.getElementById(active)?.focus();
    },
  };
}
