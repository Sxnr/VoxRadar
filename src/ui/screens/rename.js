/**
 * Pantalla 3 · Asignar nombre a un hablante (T1, D1).
 */
import { h, setText } from '../dom.js';
import { icons } from '../icons.js';
import { createHeader } from '../components/header.js';
import { directionLabel, MAX_NAME_LENGTH } from '../../core/speakers.js';

export function renderRename({ meeting, store, actions, navigate, labelOf, params }) {
  const speaker = meeting.speakers.find((sp) => sp.id === params.id);
  if (!speaker) {
    navigate('/radar');
    return { element: h('div', {}) };
  }
  const state = store.getState();
  const input = h('input', {
    id: 'speaker-name',
    className: 'field-input',
    type: 'text',
    autocomplete: 'off',
    maxlength: MAX_NAME_LENGTH * 2,
    value: state.names[speaker.id] ?? '',
    placeholder: 'Ej.: Rosa',
    'aria-describedby': 'name-help name-error',
  });
  const error = h('p', { id: 'name-error', className: 'field-error', role: 'alert' });

  function submit(event) {
    event.preventDefault();
    const result = actions.rename(speaker.id, input.value);
    if (!result.ok) {
      setText(error, result.error);
      input.setAttribute('aria-invalid', 'true');
      input.focus();
      return;
    }
    navigate('/radar');
  }

  const form = h(
    'form',
    { className: 'card form', onSubmit: submit, novalidate: true },
    h('p', { className: 'form-context' }, h('span', { className: `chip spk-${speaker.hue}` }, h('span', { className: 'chip-dot', 'aria-hidden': 'true' }), labelOf(state, speaker.id)), ` · ${directionLabel(speaker.angleDeg)}`),
    h('label', { className: 'field-label', for: 'speaker-name', text: '¿Quién es?' }),
    input,
    h('p', { id: 'name-help', className: 'field-help', text: `Hasta ${MAX_NAME_LENGTH} caracteres. Solo se guarda en este teléfono.` }),
    error,
    h('div', { className: 'form-actions' }, h('button', { type: 'submit', className: 'btn btn-primary' }, icons.check(), 'Guardar'), h('button', { type: 'button', className: 'btn btn-ghost', onClick: () => navigate('/radar') }, 'Cancelar')),
  );

  const element = h('div', { className: 'screen screen-form' }, createHeader({ title: 'Poner nombre', onBack: () => navigate('/radar'), backLabel: 'Radar' }), form);
  return { element, focus: input };
}
