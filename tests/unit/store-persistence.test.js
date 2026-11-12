import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createStore } from '../../src/app/store.js';
import { createPersistence } from '../../src/app/persistence.js';

describe('createStore', () => {
  test('exposes a frozen initial state', () => {
    const store = createStore({ a: 1 });
    assert.deepEqual(store.getState(), { a: 1 });
    assert.ok(Object.isFrozen(store.getState()));
  });

  test('setState merges a partial object into a new state', () => {
    const store = createStore({ a: 1, b: 2 });
    const before = store.getState();
    store.setState({ b: 3 });
    assert.deepEqual(store.getState(), { a: 1, b: 3 });
    assert.deepEqual(before, { a: 1, b: 2 });
  });

  test('setState accepts an updater function', () => {
    const store = createStore({ count: 1 });
    store.setState((s) => ({ count: s.count + 1 }));
    assert.equal(store.getState().count, 2);
  });

  test('notifies subscribers with new and previous state and supports unsubscribe', () => {
    const store = createStore({ n: 0 });
    const calls = [];
    const unsubscribe = store.subscribe((next, prev) => calls.push([prev.n, next.n]));
    store.setState({ n: 1 });
    unsubscribe();
    store.setState({ n: 2 });
    assert.deepEqual(calls, [[0, 1]]);
  });

  test('a failing subscriber does not stop the others', () => {
    const store = createStore({ n: 0 });
    const seen = [];
    const originalError = console.error;
    console.error = () => {};
    store.subscribe(() => {
      throw new Error('boom');
    });
    store.subscribe((next) => seen.push(next.n));
    store.setState({ n: 5 });
    console.error = originalError;
    assert.deepEqual(seen, [5]);
  });
});

function memoryStorage() {
  const data = new Map();
  return {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => data.set(k, String(v)),
  };
}

describe('createPersistence', () => {
  test('round-trips JSON values', () => {
    const p = createPersistence(memoryStorage(), 'k');
    assert.equal(p.save({ a: 1 }), true);
    assert.deepEqual(p.load({}), { a: 1 });
  });

  test('returns fallback when nothing is stored', () => {
    assert.deepEqual(createPersistence(memoryStorage(), 'k').load({ x: 1 }), { x: 1 });
  });

  test('returns fallback on corrupted JSON', () => {
    const storage = memoryStorage();
    storage.setItem('k', '{no es json');
    assert.deepEqual(createPersistence(storage, 'k').load('fb'), 'fb');
  });

  test('survives missing or throwing storage', () => {
    const throwing = {
      getItem() {
        throw new Error('blocked');
      },
      setItem() {
        throw new Error('blocked');
      },
    };
    assert.equal(createPersistence(null, 'k').load(7), 7);
    assert.equal(createPersistence(null, 'k').save(1), false);
    assert.equal(createPersistence(throwing, 'k').load(7), 7);
    assert.equal(createPersistence(throwing, 'k').save(1), false);
  });
});
