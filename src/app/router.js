/**
 * Enrutador por hash (#/ruta/:param), compatible con GitHub Pages.
 */

export function matchRoute(routes, hash) {
  const path = (hash || '').replace(/^#/, '') || '/';
  const parts = path.split('/').filter(Boolean);
  for (const route of routes) {
    const pattern = route.path.split('/').filter(Boolean);
    if (pattern.length !== parts.length) continue;
    const params = {};
    const matched = pattern.every((seg, i) => {
      if (seg.startsWith(':')) {
        params[seg.slice(1)] = decodeURIComponent(parts[i]);
        return true;
      }
      return seg === parts[i];
    });
    if (matched) return { route, params };
  }
  return null;
}
