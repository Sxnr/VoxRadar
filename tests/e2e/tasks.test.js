/**
 * Pruebas E2E de las tareas críticas del informe (T1, T2, T3) y de la pantalla de ajustes.
 */
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { setup, teardown, openPage } from './helpers.js';

let env;
before(async () => {
  env = await setup();
});
after(async () => {
  await teardown(env);
});

describe('Pantalla 1 · Inicio', () => {
  test('"Escuchar" lleva al radar y la reunión avanza', async () => {
    const { page, context, errors } = await openPage(env.browser, '?velocidad=10');
    await page.getByRole('button', { name: 'Escuchar' }).click();
    await page.waitForURL(/#\/radar$/);
    await page.waitForFunction(() => !document.querySelector('.clock')?.textContent.startsWith('0:00'));
    assert.deepEqual(errors, []);
    await context.close();
  });
});

describe('T1 · Identificar quién habla', () => {
  test('el radar destaca al hablante principal y su dirección', async () => {
    const { page, context } = await openPage(env.browser, '?t=14&congelar=1#/radar');
    const primary = page.locator('.spk[data-role="primary"]');
    await assert.doesNotReject(primary.waitFor());
    assert.equal(await primary.getAttribute('data-speaker'), 'p3');
    assert.equal(await page.locator('.spk[data-role="secondary"]').count(), 1);
    assert.equal(await page.locator('.now-who').textContent(), 'Persona 3');
    assert.equal(await page.locator('.now-where').textContent(), 'atrás a la derecha');
    await context.close();
  });

  test('tocar un punto permite ponerle nombre y el radar lo muestra', async () => {
    const { page, context } = await openPage(env.browser, '?t=14&congelar=1#/radar');
    await page.locator('.spk[data-speaker="p3"]').click();
    await page.waitForURL(/#\/nombre\/p3$/);
    await page.getByRole('button', { name: 'Guardar' }).click();
    assert.match(await page.locator('.field-error').textContent(), /Escribe un nombre/);
    await page.getByLabel('¿Quién es?').fill('  Rosa  ');
    await page.getByRole('button', { name: 'Guardar' }).click();
    await page.waitForURL(/#\/radar$/);
    assert.equal(await page.locator('.now-who').textContent(), 'Rosa');
    await context.close();
  });

  test('los puntos del radar se pueden activar con el teclado', async () => {
    const { page, context } = await openPage(env.browser, '?t=14&congelar=1#/radar');
    await page.locator('.spk[data-speaker="p1"]').focus();
    await page.keyboard.press('Enter');
    await page.waitForURL(/#\/nombre\/p1$/);
    await context.close();
  });
});

describe('T2 · Recuperar lo que me perdí', () => {
  test('lista lo dicho agrupado por hablante y abre el detalle en grande', async () => {
    const { page, context } = await openPage(env.browser, '?t=40&congelar=1#/radar');
    await page.getByRole('button', { name: '¿Qué me perdí?' }).click();
    await page.waitForURL(/#\/perdi$/);
    const groups = page.locator('.missed-group');
    await groups.first().waitFor();
    assert.ok((await groups.count()) >= 5);
    await page.locator('.missed-item').first().click();
    await page.waitForURL(/#\/detalle\/u01$/);
    assert.equal(await page.locator('.zoom-label').textContent(), '125\u00a0%');
    await page.getByRole('button', { name: 'Agrandar letra' }).click();
    assert.equal(await page.locator('.zoom-label').textContent(), '150\u00a0%');
    await page.getByRole('button', { name: 'Volver al radar' }).click();
    await page.waitForURL(/#\/radar$/);
    await context.close();
  });
});

describe('T3 · Saber cuándo intervenir', () => {
  test('el indicador muestra el estado del turno con texto', async () => {
    const { page, context } = await openPage(env.browser, '?t=52&congelar=1#/radar');
    assert.equal(await page.locator('.turn-pill').getAttribute('data-turn'), 'libre');
    assert.equal(await page.locator('.turn-text').textContent(), 'Turno libre');
    await context.close();
  });

  test('"Avisarme en la pausa" muestra el aviso de turno libre', async () => {
    const { page, context } = await openPage(env.browser, '?t=48&velocidad=4#/radar');
    const toggle = page.getByRole('button', { name: 'Avisarme en la pausa' });
    await toggle.click();
    assert.equal(await page.locator('.btn-toggle').getAttribute('aria-pressed'), 'true');
    const dialog = page.getByRole('alertdialog', { name: 'Turno libre' });
    await dialog.waitFor({ timeout: 8000 });
    await page.getByRole('button', { name: 'Entendido' }).click();
    await dialog.waitFor({ state: 'detached' });
    assert.equal(await page.locator('.btn-toggle').getAttribute('aria-pressed'), 'false');
    await context.close();
  });
});

describe('Pantalla 7 · Ajustes', () => {
  test('el tamaño de texto y el alto contraste se aplican y se recuerdan', async () => {
    const { page, context } = await openPage(env.browser, '#/ajustes');
    await page.getByRole('button', { name: '150\u00a0%' }).click();
    await page.getByLabel('Alto contraste').check();
    await page.reload();
    const fontSize = await page.evaluate(() => getComputedStyle(document.documentElement).fontSize);
    assert.equal(fontSize, '27px');
    assert.equal(await page.evaluate(() => document.documentElement.dataset.contrast), 'alto');
    assert.equal(await page.getByRole('button', { name: '150\u00a0%' }).getAttribute('aria-pressed'), 'true');
    await context.close();
  });
});

describe('Fin de la reunión', () => {
  test('permite repetir la demostración', async () => {
    const { page, context } = await openPage(env.browser, '?t=90&velocidad=10#/radar');
    const restart = page.getByRole('button', { name: 'Repetir demostración' });
    await restart.waitFor({ timeout: 5000 });
    await restart.click();
    await restart.waitFor({ state: 'detached' });
    await context.close();
  });
});
