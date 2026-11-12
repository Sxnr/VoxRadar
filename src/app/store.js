/**
 * Almacén de estado mínimo e inmutable con suscripciones.
 */

export function createStore(initialState) {
  let state = Object.freeze({ ...initialState });
  const listeners = new Set();

  function getState() {
    return state;
  }

  function notify(next, previous) {
    listeners.forEach((listener) => {
      try {
        listener(next, previous);
      } catch (error) {
        console.error('[VoxRadar] Error en un suscriptor del estado:', error);
      }
    });
  }

  function setState(update) {
    const partial = typeof update === 'function' ? update(state) : update;
    const previous = state;
    state = Object.freeze({ ...state, ...partial });
    notify(state, previous);
  }

  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  return { getState, setState, subscribe };
}
