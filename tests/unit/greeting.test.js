import { test } from 'node:test';
import assert from 'node:assert/strict';
import { greetingFor } from '../../src/core/greeting.js';

test('greets according to the hour of the day', () => {
  assert.equal(greetingFor(6), 'Buenos días');
  assert.equal(greetingFor(11), 'Buenos días');
  assert.equal(greetingFor(12), 'Buenas tardes');
  assert.equal(greetingFor(19), 'Buenas tardes');
  assert.equal(greetingFor(20), 'Buenas noches');
  assert.equal(greetingFor(3), 'Buenas noches');
});

test('falls back to a neutral greeting for invalid hours', () => {
  assert.equal(greetingFor(Number.NaN), 'Hola');
  assert.equal(greetingFor(25), 'Hola');
});
