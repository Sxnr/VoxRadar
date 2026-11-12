/**
 * Guardado local tolerante a fallos: el almacenamiento puede no existir,
 * estar bloqueado (modo privado) o contener datos corruptos.
 */

export function createPersistence(storage, key) {
  function load(fallback) {
    try {
      const raw = storage?.getItem(key);
      return raw == null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  function save(value) {
    try {
      if (!storage) return false;
      storage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  return { load, save };
}
