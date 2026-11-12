import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { matchRoute } from '../../src/app/router.js';

const routes = [{ path: '/inicio' }, { path: '/nombre/:id' }, { path: '/detalle/:id' }];

describe('matchRoute', () => {
  test('matches static routes', () => {
    assert.equal(matchRoute(routes, '#/inicio').route.path, '/inicio');
  });

  test('extracts and decodes params', () => {
    const match = matchRoute(routes, '#/nombre/p%202');
    assert.equal(match.route.path, '/nombre/:id');
    assert.deepEqual(match.params, { id: 'p 2' });
  });

  test('returns null for unknown or empty paths', () => {
    assert.equal(matchRoute(routes, '#/nada'), null);
    assert.equal(matchRoute(routes, ''), null);
    assert.equal(matchRoute(routes, '#/nombre'), null);
  });
});
