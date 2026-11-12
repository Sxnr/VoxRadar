/**
 * Subtítulos por hablante (D2): un bloque por intervención con el nombre antes del texto,
 * en lugar de un texto continuo que mezcla voces.
 */
import { h, replaceChildren } from '../dom.js';

function captionKey(captions) {
  return captions.map((c) => `${c.id}:${c.text.length}:${c.live}`).join('|');
}

export function createCaptions() {
  const list = h('ol', { className: 'captions-list' });
  const element = h(
    'section',
    { className: 'captions', 'aria-label': 'Subtítulos recientes' },
    h('h2', { className: 'section-label', text: 'Subtítulos' }),
    list,
  );
  let lastKey = '';

  function update({ captions, labelOf, hueOf }) {
    const key = captionKey(captions);
    if (key === lastKey) return;
    lastKey = key;
    if (captions.length === 0) {
      replaceChildren(list, h('li', { className: 'caption caption-empty', text: 'Aún nadie ha hablado.' }));
      return;
    }
    replaceChildren(
      list,
      captions.map((c) =>
        h(
          'li',
          { className: `caption spk-${hueOf(c.speakerId)}`, dataset: { live: String(c.live) } },
          h('span', { className: 'caption-who' }, h('span', { className: 'chip-dot', 'aria-hidden': 'true' }), labelOf(c.speakerId)),
          h('p', { className: 'caption-text', text: c.text }),
        ),
      ),
    );
  }

  return { element, update };
}
