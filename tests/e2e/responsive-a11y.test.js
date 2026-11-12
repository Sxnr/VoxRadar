/**
 * Diseño adaptable (320–1440 px) y comprobaciones básicas de accesibilidad.
 */
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { setup, teardown, openPage } from './helpers.js';

const ROUTES = ['#/inicio', '?t=14&congelar=1#/radar', '?t=40&congelar=1#/perdi', '#/detalle/u02', '#/nombre/p2', '#/ajustes'];
const WIDTHS = [320, 375, 768, 1440];
const MIN_TAP_PX = 44;

let env;
before(async () => {
  env = await setup();
});
after(async () => {
  await teardown(env);
});

describe('sin desbordamiento horizontal', () => {
  for (const width of WIDTHS) {
    test(`${width}px en todas las pantallas`, async () => {
      for (const route of ROUTES) {
        const { page, context } = await openPage(env.browser, route, { width, height: 800 });
        await page.waitForSelector('.screen');
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        assert.ok(overflow <= 0, `${route} desborda ${overflow}px a ${width}px`);
        await context.close();
      }
    });
  }
});

describe('accesibilidad básica', () => {
  test('todos los botones tienen nombre accesible y miden al menos 44 px', async () => {
    for (const route of ROUTES) {
      const { page, context } = await openPage(env.browser, route);
      await page.waitForSelector('.screen');
      const problems = await page.evaluate((min) => {
        return [...document.querySelectorAll('button')]
          .filter((b) => b.offsetParent !== null)
          .map((b) => {
            const r = b.getBoundingClientRect();
            const name = (b.getAttribute('aria-label') || b.textContent || '').trim();
            return { name, w: r.width, h: r.height };
          })
          .filter((b) => !b.name || b.w < min || b.h < min);
      }, MIN_TAP_PX);
      assert.deepEqual(problems, [], route);
      await context.close();
    }
  });

  test('cada pantalla tiene un título de nivel 1', async () => {
    for (const route of ROUTES.filter((r) => !r.includes('radar'))) {
      const { page, context } = await openPage(env.browser, route);
      await page.waitForSelector('.screen');
      assert.equal(await page.locator('h1').count(), 1, route);
      await context.close();
    }
  });

  test('el cambio de hablante se anuncia para lectores de pantalla', async () => {
    const { page, context } = await openPage(env.browser, '?t=14&congelar=1#/radar');
    await page.waitForSelector('.screen');
    assert.equal(await page.locator('#announcer').textContent(), 'Habla Persona 3, atrás a la derecha');
    await context.close();
  });

  test('el aviso de turno libre atrapa el foco en su botón', async () => {
    const { page, context } = await openPage(env.browser, '?t=48&velocidad=4#/radar');
    await page.getByRole('button', { name: 'Avisarme en la pausa' }).click();
    await page.getByRole('alertdialog').waitFor({ timeout: 8000 });
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement.textContent), 'Entendido');
    await page.keyboard.press('Escape');
    await page.getByRole('alertdialog').waitFor({ state: 'detached' });
    await context.close();
  });
});
