/**
 * Ayudantes para crear DOM de forma segura (sin innerHTML: todo el texto va por textContent).
 */

const SVG_NS = 'http://www.w3.org/2000/svg';

function applyProps(el, props, isSvg) {
  Object.entries(props).forEach(([key, value]) => {
    if (value === undefined || value === null || value === false) return;
    if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key === 'className') {
      el.setAttribute('class', value);
    } else if (key === 'text') {
      el.textContent = String(value);
    } else if (key === 'dataset') {
      Object.entries(value).forEach(([k, v]) => (el.dataset[k] = v));
    } else if (key === 'value' && !isSvg) {
      el.value = value;
    } else {
      el.setAttribute(key, value === true ? '' : String(value));
    }
  });
}

function appendChildren(el, children) {
  children.flat(Infinity).forEach((child) => {
    if (child === null || child === undefined || child === false) return;
    el.append(child instanceof Node ? child : document.createTextNode(String(child)));
  });
}

export function h(tag, props = {}, ...children) {
  const el = document.createElement(tag);
  applyProps(el, props, false);
  appendChildren(el, children);
  return el;
}

export function s(tag, props = {}, ...children) {
  const el = document.createElementNS(SVG_NS, tag);
  applyProps(el, props, true);
  appendChildren(el, children);
  return el;
}

export function setText(el, value) {
  const text = String(value);
  if (el.textContent !== text) el.textContent = text;
}

export function replaceChildren(el, ...children) {
  el.replaceChildren();
  appendChildren(el, children);
}
