/**
 * Saludo según la hora del día, para que la pantalla de inicio se sienta cercana.
 */

export function greetingFor(hour) {
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) return 'Hola';
  if (hour >= 5 && hour < 12) return 'Buenos días';
  if (hour >= 12 && hour < 20) return 'Buenas tardes';
  return 'Buenas noches';
}
