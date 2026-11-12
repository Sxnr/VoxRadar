/**
 * Punto de entrada: estado, acciones, reloj de la demostración y enrutamiento.
 */
import { DEMO_MEETING } from './core/meeting-script.js';
import { turnStateAt, isPauseStarted, isMeetingOver, TURN } from './core/simulation.js';
import { renameSpeaker, speakerLabel, sanitizeNames } from './core/speakers.js';
import { updateSetting, sanitizeSettings } from './core/settings.js';
import { parseDemoParams } from './core/params.js';
import { createStore } from './app/store.js';
import { createPersistence } from './app/persistence.js';
import { createClock } from './app/clock.js';
import { matchRoute } from './app/router.js';
import { setText } from './ui/dom.js';
import { renderHome } from './ui/screens/home.js';
import { renderRadar } from './ui/screens/radar.js';
import { renderRename } from './ui/screens/rename.js';
import { renderMissed } from './ui/screens/missed.js';
import { renderDetail } from './ui/screens/detail.js';
import { renderSettings } from './ui/screens/settings.js';
import { renderPauseAlert } from './ui/screens/pause-alert.js';

const VIBRATION_PATTERN = [250, 120, 250];
const meeting = DEMO_MEETING;
const demo = parseDemoParams(window.location.search);

function safeStorage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

const settingsStore = createPersistence(safeStorage(), 'voxradar.settings');
const namesStore = createPersistence(safeStorage(), 'voxradar.names');

const store = createStore({
  t: demo.startMs,
  playing: false,
  names: Object.freeze(sanitizeNames(meeting, namesStore.load({}))),
  settings: sanitizeSettings(settingsStore.load(null)),
  alertArmed: false,
  pauseAlertVisible: false,
});

const app = document.getElementById('app');
const overlayRoot = document.getElementById('overlay-root');
const announcer = document.getElementById('announcer');

function navigate(path) {
  window.location.hash = `#${path}`;
}

function announce(message) {
  setText(announcer, message);
}

function vibrate() {
  try {
    if (store.getState().settings.vibration && 'vibrate' in navigator) navigator.vibrate(VIBRATION_PATTERN);
  } catch {
    /* La vibración es un complemento: si falla, el aviso visual sigue funcionando. */
  }
}

const clock = createClock({
  speed: demo.speed,
  onTick(deltaMs) {
    const state = store.getState();
    if (!state.playing || demo.frozen) return;
    const t = Math.min(meeting.durationMs, state.t + deltaMs);
    const pause = state.alertArmed && isPauseStarted(turnStateAt(meeting, state.t), turnStateAt(meeting, t));
    store.setState({
      t,
      playing: !isMeetingOver(meeting, t),
      ...(pause ? { alertArmed: false, pauseAlertVisible: true } : {}),
    });
    if (pause) vibrate();
  },
});

const actions = {
  start() {
    store.setState({ playing: true });
    navigate('/radar');
  },
  togglePlay() {
    store.setState((s) => ({ playing: !s.playing && !isMeetingOver(meeting, s.t) }));
  },
  restart() {
    store.setState({ t: 0, playing: true, alertArmed: false, pauseAlertVisible: false });
  },
  rename(id, raw) {
    const result = renameSpeaker(meeting, store.getState().names, id, raw);
    if (result.ok) {
      store.setState({ names: result.names });
      namesStore.save(result.names);
    }
    return result;
  },
  setSetting(key, value) {
    const result = updateSetting(store.getState().settings, key, value);
    if (result.ok) {
      store.setState({ settings: result.settings });
      settingsStore.save(result.settings);
    }
    return result;
  },
  toggleAlert() {
    const { alertArmed, t } = store.getState();
    const next = !alertArmed;
    store.setState({ alertArmed: next });
    announce(next ? 'Te avisaré cuando haya una pausa.' : 'Aviso de pausa desactivado.');
    if (next && turnStateAt(meeting, t) === TURN.FREE) announce('Ahora mismo el turno está libre.');
  },
  dismissPause() {
    store.setState({ pauseAlertVisible: false });
  },
};

const labelOf = (state, id) => speakerLabel(meeting, state.names, id);
const hueOf = (id) => meeting.speakers.find((sp) => sp.id === id)?.hue ?? 'cielo';
const ctxBase = { meeting, store, actions, navigate, labelOf, hueOf, announce };

const routes = [
  { path: '/inicio', render: renderHome },
  { path: '/radar', render: renderRadar, autoplay: true },
  { path: '/nombre/:id', render: renderRename },
  { path: '/perdi', render: renderMissed },
  { path: '/detalle/:id', render: renderDetail },
  { path: '/ajustes', render: renderSettings },
];

let screen = null;
let isFirstMount = true;

function mountRoute() {
  const match = matchRoute(routes, window.location.hash);
  if (!match) {
    navigate('/inicio');
    return;
  }
  if (match.route.autoplay && !store.getState().playing && store.getState().t === demo.startMs) {
    store.setState({ playing: !demo.frozen });
  }
  screen = match.route.render({ ...ctxBase, params: match.params });
  app.replaceChildren(screen.element);
  screen.update?.(store.getState());
  window.scrollTo(0, 0);
  if (!isFirstMount && !store.getState().pauseAlertVisible) screen.focus?.focus({ preventScroll: true });
  isFirstMount = false;
}

let overlay = null;
let lastFocus = null;

function syncOverlay(state) {
  if (state.pauseAlertVisible && !overlay) {
    lastFocus = document.activeElement;
    overlay = renderPauseAlert({ onDismiss: actions.dismissPause });
    overlayRoot.replaceChildren(overlay.element);
    app.setAttribute('inert', '');
    overlay.focus.focus();
  } else if (!state.pauseAlertVisible && overlay) {
    overlayRoot.replaceChildren();
    overlay = null;
    app.removeAttribute('inert');
    lastFocus?.focus?.({ preventScroll: true });
  }
}

function applySettings({ settings }) {
  const root = document.documentElement;
  root.style.setProperty('--scale', String(settings.textScale));
  root.dataset.contrast = settings.highContrast ? 'alto' : 'normal';
}

store.subscribe((state, previous) => {
  if (state.settings !== previous.settings) applySettings(state);
  screen?.update?.(state);
  syncOverlay(state);
});

applySettings(store.getState());
window.addEventListener('hashchange', mountRoute);
if (!window.location.hash) history.replaceState(null, '', `${location.pathname}${location.search}#/inicio`);
mountRoute();
clock.start();

if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  navigator.serviceWorker.register('./sw.js').catch((error) => console.warn('[VoxRadar] Sin modo sin conexión:', error));
}

