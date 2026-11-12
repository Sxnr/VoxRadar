/**
 * Servidor estático mínimo para desarrollo y pruebas E2E (sin dependencias).
 * Uso: node scripts/serve.js [puerto]
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const DEFAULT_PORT = 5173;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
};

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

function resolveSafe(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const target = resolve(join(ROOT, normalize(decoded)));
  if (target !== ROOT && !target.startsWith(ROOT + sep)) return null;
  return target;
}

async function handle(req, res) {
  const target = resolveSafe(req.url === '/' ? '/index.html' : req.url);
  if (!target) {
    res.writeHead(403, SECURITY_HEADERS).end('Prohibido');
    return;
  }
  try {
    const info = await stat(target);
    const file = info.isDirectory() ? join(target, 'index.html') : target;
    const body = await readFile(file);
    res.writeHead(200, { ...SECURITY_HEADERS, 'Content-Type': MIME[extname(file)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404, SECURITY_HEADERS).end('No encontrado');
  }
}

export function startServer(port = DEFAULT_PORT) {
  return new Promise((resolvePromise) => {
    const server = createServer((req, res) => {
      handle(req, res).catch(() => res.writeHead(500).end('Error'));
    });
    server.listen(port, '127.0.0.1', () => resolvePromise(server));
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.argv[2]) || DEFAULT_PORT;
  startServer(port).then(() => console.log(`VoxRadar en http://localhost:${port}`));
}
