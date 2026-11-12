/**
 * Ajustes de accesibilidad (D5, D6). Todos opcionales: la app funciona sin tocarlos.
 */

export const TEXT_SCALES = Object.freeze([1, 1.25, 1.5, 2]);

export const DEFAULT_SETTINGS = Object.freeze({
  textScale: 1,
  highContrast: false,
  vibration: true,
});

const VALIDATORS = Object.freeze({
  textScale: (v) => TEXT_SCALES.includes(v),
  highContrast: (v) => typeof v === 'boolean',
  vibration: (v) => typeof v === 'boolean',
});

export function updateSetting(settings, key, value) {
  const isValid = VALIDATORS[key];
  if (!isValid) return { ok: false, error: `Ajuste desconocido: ${key}` };
  if (!isValid(value)) return { ok: false, error: `Valor no válido para ${key}` };
  return { ok: true, settings: Object.freeze({ ...settings, [key]: value }) };
}

export function sanitizeSettings(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return DEFAULT_SETTINGS;
  return Object.freeze(
    Object.keys(DEFAULT_SETTINGS).reduce(
      (acc, key) => ({ ...acc, [key]: VALIDATORS[key](raw[key]) ? raw[key] : DEFAULT_SETTINGS[key] }),
      {},
    ),
  );
}
