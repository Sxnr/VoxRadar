/**
 * Copia los archivos publicables a dist/ (lo que se sube a GitHub Pages).
 */
import { cpSync, rmSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const DIST = resolve(ROOT, 'dist');
const PUBLIC = ['index.html', 'manifest.webmanifest', 'sw.js', 'icons', 'src'];

rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST);
PUBLIC.forEach((entry) => cpSync(resolve(ROOT, entry), resolve(DIST, entry), { recursive: true }));
console.log(`Listo: ${PUBLIC.length} entradas copiadas a dist/`);
