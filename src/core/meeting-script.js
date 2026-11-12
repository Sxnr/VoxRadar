/**
 * Reunión de demostración simulada: una junta de vecinos que organiza una once
 * de fin de año. Incluye habla superpuesta y pausas largas para poder recorrer
 * las tres tareas críticas (T1, T2 y T3) sin audio real.
 */

const SECOND = 1000;

function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
}

const speakers = [
  { id: 'p1', label: 'Persona 1', angleDeg: 0, hue: 'cielo' },
  { id: 'p2', label: 'Persona 2', angleDeg: 70, hue: 'lila' },
  { id: 'p3', label: 'Persona 3', angleDeg: 140, hue: 'menta' },
  { id: 'p4', label: 'Persona 4', angleDeg: 220, hue: 'durazno' },
  { id: 'p5', label: 'Persona 5', angleDeg: 295, hue: 'rosa' },
];

// [id, hablante, inicio (s), fin (s), texto]
const lines = [
  ['u01', 'p1', 0, 6, 'Bueno, empecemos. Hoy tenemos que decidir la fecha de la once de fin de año.'],
  ['u02', 'p2', 7, 12, 'Yo propongo el sábado 20, porque el 27 mucha gente sale de viaje.'],
  ['u03', 'p3', 11.5, 16, '¿El 20? Ese día hay feria en la plaza.'],
  ['u04', 'p4', 12.5, 17, 'Podríamos hacerlo en la tarde, después de la feria.'],
  ['u05', 'p1', 18, 24, 'Ordenémonos un poco. ¿Quién está de acuerdo con el sábado 20 en la tarde?'],
  ['u06', 'p5', 25, 29, 'Yo estoy de acuerdo, pero hay que ver quién trae qué.'],
  ['u07', 'p2', 29.5, 34, 'Yo puedo llevar las bebidas.'],
  ['u08', 'p3', 30.5, 33.5, 'Y yo me encargo del pan amasado.'],
  ['u09', 'p4', 36, 42, 'Falta definir el lugar. La sede está ocupada hasta las seis.'],
  ['u10', 'p1', 42.5, 47, 'Entonces empezamos a las siete en la sede.'],
  ['u11', 'p3', 47.5, 50, 'Me parece bien.'],
  ['u12', 'p5', 56, 62, 'Otra cosa: hay que avisarles a los vecinos que no vinieron hoy.'],
  ['u13', 'p2', 62.5, 68, 'Yo mando un mensaje al grupo de WhatsApp.'],
  ['u14', 'p4', 63.5, 67, 'Y yo pego un aviso en el almacén.'],
  ['u15', 'p1', 70, 76, 'Perfecto. ¿Alguien más quiere agregar algo antes de cerrar?'],
  ['u16', 'p1', 84, 90, 'Bueno, muchas gracias a todos. Nos vemos el sábado 20 a las siete.'],
];

const utterances = lines.map(([id, speakerId, start, end, text]) => ({
  id,
  speakerId,
  start: start * SECOND,
  end: end * SECOND,
  text,
}));

export const DEMO_MEETING = deepFreeze({
  title: 'Junta de vecinos (demostración)',
  durationMs: 92 * SECOND,
  speakers,
  utterances,
});
