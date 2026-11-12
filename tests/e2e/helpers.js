import { chromium } from 'playwright';
import { startServer } from '../../scripts/serve.js';

const PORT = 5199;
export const BASE = `http://localhost:${PORT}/`;

export async function setup() {
  const server = await startServer(PORT);
  const browser = await chromium.launch();
  return { server, browser };
}

export async function teardown({ server, browser }) {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}

export async function openPage(browser, path = '', { width = 390, height = 844 } = {}) {
  const context = await browser.newContext({ viewport: { width, height }, serviceWorkers: 'block', reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [];
  // Las fuentes externas no son necesarias para las pruebas.
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());
  page.on('pageerror', (error) => errors.push(String(error)));
  page.on('console', (msg) => {
    if (msg.type() === 'error' && !msg.text().includes('net::ERR_FAILED')) errors.push(msg.text());
  });
  await page.goto(BASE + path);
  return { page, context, errors };
}
