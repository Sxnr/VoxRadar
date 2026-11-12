/**
 * Pantalla 2 · Radar principal: reúne T1 (quién habla), T2 (botón "¿Qué me perdí?")
 * y T3 (indicador de turno y aviso en la pausa).
 */
import { h, setText, replaceChildren } from '../dom.js';
import { icons } from '../icons.js';
import { createRadarView } from '../components/radar-view.js';
import { createTurnIndicator } from '../components/turn-indicator.js';
import { createCaptions } from '../components/captions.js';
import {
  activeSpeakerIdsAt,
  primarySpeakerAt,
  recentCaptionsAt,
  turnStateAt,
  isMeetingOver,
} from '../../core/simulation.js';
import { directionLabel } from '../../core/speakers.js';
import { formatClock } from '../../core/history.js';

function createNowSpeaking() {
  const who = h('strong', { className: 'now-who' });
  const where = h('span', { className: 'now-where' });
  const element = h('p', { className: 'now', 'aria-hidden': 'true' }, who, where);
  return {
    element,
    update(primary, label) {
      element.dataset.empty = String(!primary);
      setText(who, primary ? label : 'Nadie está hablando');
      setText(where, primary ? directionLabel(primary.angleDeg) : '');
    },
  };
}

function createPlayback(actions) {
  const text = h('span', {});
  const iconSlot = h('span', { className: 'btn-icon-slot' });
  const button = h('button', { type: 'button', className: 'btn btn-ghost btn-compact', onClick: () => actions.togglePlay() }, iconSlot, text);
  let lastPlaying = null;
  return {
    element: button,
    update(playing) {
      if (playing === lastPlaying) return;
      lastPlaying = playing;
      replaceChildren(iconSlot, playing ? icons.pause() : icons.play());
      setText(text, playing ? 'Pausar demo' : 'Reanudar');
    },
  };
}

function createEndBanner(actions) {
  return h(
    'div',
    { className: 'end-banner', role: 'status' },
    h('p', { text: 'La reunión terminó.' }),
    h('button', { type: 'button', className: 'btn btn-secondary', onClick: () => actions.restart() }, icons.restart(), 'Repetir demostración'),
  );
}

export function renderRadar({ meeting, actions, navigate, labelOf, hueOf, announce }) {
  const clock = h('span', { className: 'clock' });
  const playback = createPlayback(actions);
  const settingsBtn = h('button', { type: 'button', className: 'btn btn-ghost btn-compact', onClick: () => navigate('/ajustes') }, icons.settings(), 'Ajustes');
  const radar = createRadarView({ meeting, onSelect: (id) => navigate(`/nombre/${id}`) });
  const turn = createTurnIndicator({ onToggleAlert: () => actions.toggleAlert() });
  const captions = createCaptions();
  const now = createNowSpeaking();
  const endSlot = h('div', {});
  const missedBtn = h('button', { type: 'button', className: 'btn btn-primary btn-xl btn-missed', onClick: () => navigate('/perdi') }, icons.history(), '¿Qué me perdí?');

  const element = h(
    'div',
    { className: 'screen screen-radar' },
    h('header', { className: 'radar-top' }, h('p', { className: 'brand', text: 'VoxRadar' }), clock, playback.element, settingsBtn),
    turn.element,
    h('div', { className: 'radar-stage' }, radar.element, now.element, h('p', { className: 'radar-hint', text: 'Toca un punto para ponerle nombre.' })),
    endSlot,
    captions.element,
    h('div', { className: 'dock' }, missedBtn),
  );

  let lastPrimary;
  let lastOver = null;

  function update(state) {
    const { t } = state;
    const labelFor = (id) => labelOf(state, id);
    const primaryId = primarySpeakerAt(meeting, t);
    const primary = meeting.speakers.find((sp) => sp.id === primaryId) ?? null;
    setText(clock, `${formatClock(t)} · demostración`);
    playback.update(state.playing);
    radar.update({ primaryId, activeIds: activeSpeakerIdsAt(meeting, t), labelOf: labelFor });
    turn.update({ turn: turnStateAt(meeting, t), alertArmed: state.alertArmed });
    now.update(primary, primary ? labelFor(primary.id) : '');
    captions.update({ captions: recentCaptionsAt(meeting, t), labelOf: labelFor, hueOf });
    if (primaryId !== lastPrimary) {
      lastPrimary = primaryId;
      announce(primary ? `Habla ${labelFor(primary.id)}, ${directionLabel(primary.angleDeg)}` : 'Nadie está hablando');
    }
    const over = isMeetingOver(meeting, t);
    if (over !== lastOver) {
      lastOver = over;
      replaceChildren(endSlot, over ? createEndBanner(actions) : null);
    }
  }

  return { element, update, focus: missedBtn };
}
