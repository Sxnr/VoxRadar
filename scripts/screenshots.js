/**
 * Genera capturas de las 7 pantallas (para el informe y el README).
 * Uso: npm run screenshots  →  docs/capturas/*.png
 */
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { chromium } from 'playwright';
import { startServer } from './serve.js';

const PORT = 5188;
const BASE = `http://localhost:${PORT}/`;
const OUT = resolve(fileURLToPath(new URL('../docs/capturas', import.meta.url)));
const VIEWPORT = { width: 390, height: 844 };

const SHOTS = [
  { file: '1-inicio.png', path: '#/inicio' },
  { file: '2-radar.png', path: '?t=14&congelar=1#/radar' },
  { file: '3-nombre.png', path: '?t=14&congelar=1#/nombre/p3' },
  { file: '4-que-me-perdi.png', path: '?t=40&congelar=1#/perdi' },
  { file: '5-detalle.png', path: '?t=40&congelar=1#/detalle/u02' },
  { file: '7-ajustes.png', path: '#/ajustes' },
];

async function capturePauseAlert(context) {
  const page = await context.newPage();
  await page.goto(`${BASE}?t=48&velocidad=4#/radar`);
  await page.getByRole('button', { name: 'Avisarme en la pausa' }).click();
  await page.getByRole('alertdialog').waitFor({ timeout: 8000 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: resolve(OUT, '6-turno-libre.png') });
  await page.close();
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const server = await startServer(PORT);
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 2, serviceWorkers: 'block' });
  try {
    for (const shot of SHOTS) {
      const page = await context.newPage();
      await page.goto(BASE + shot.path);
      await page.waitForSelector('.screen');
      await page.evaluate(() => document.activeElement?.blur());
      await page.waitForTimeout(400);
      await page.screenshot({ path: resolve(OUT, shot.file) });
      await page.close();
    }
    await capturePauseAlert(context);
    console.log(`Capturas guardadas en ${OUT}`);
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((error) => {
  console.error('No se pudieron generar las capturas:', error);
  process.exitCode = 1;
});
