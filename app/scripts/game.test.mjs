import test from 'node:test';
import assert from 'node:assert/strict';
import { ROUNDS, calculate, normalizeState, initialState, normalizeVotes } from '../public/engine.js';

test('all 24 decision paths conserve money, hours and the support distinction', () => {
  let paths = 0;
  for (const a of ROUNDS[0].options) for (const b of ROUNDS[1].options)
    for (const c of ROUNDS[2].options) for (const d of ROUNDS[3].options) {
      const selected = [a, b, c, d];
      const result = calculate(selected.map((o) => o.id));
      assert.equal(result.gross, selected.reduce((s, o) => s + o.gross, 0));
      assert.equal(result.net, result.gross - result.costs);
      assert.equal(result.totalHours, selected.reduce((s, o) => s + o.work + o.wait, 0));
      assert.equal(result.hourly, result.net / result.totalHours);
      assert.equal(result.gap, Math.max(0, 180 - result.net - result.support));
      const alternate = calculate([a.id, b.id, c.id, d.id === 'support' ? 'no-support' : 'support']);
      assert.equal(alternate.net, result.net);
      assert.equal(alternate.hourly, result.hourly);
      assert.equal(Math.abs(alternate.afterAway - result.afterAway), 180);
      paths++;
    }
  assert.equal(paths, 24);
});

test('known route includes waiting and distinguishes day balance from absence costs', () => {
  const r = calculate(['eight', 'wait', 'continue', 'no-support']);
  assert.equal(r.gross, 254);
  assert.equal(r.costs, 88);
  assert.equal(r.net, 166);
  assert.equal(r.totalHours, 11.5);
  assert.equal(r.gap, 14);
  assert.equal(r.afterAway, -14);
});

test('empty account is finite and does not fabricate an hourly wage', () => {
  const r = calculate([]);
  assert.equal(r.net, 0);
  assert.equal(r.totalHours, 0);
  assert.equal(r.hourly, 0);
  assert.equal(calculate(['invalid']).net, 0);
});

test('incomplete or corrupt browser saves recover without skipping the game', () => {
  assert.deepEqual(normalizeState(null), initialState());
  assert.deepEqual(normalizeState({ ...initialState(), phase: 'result', choices: ['eight'] }), initialState());
  assert.deepEqual(normalizeState({ ...initialState(), phase: 'reveal', round: 2, choices: ['eight'] }), initialState());
  const valid = { ...initialState(), phase: 'round', round: 1, choices: ['eight'], selection: 'wait' };
  assert.deepEqual(normalizeState(valid), valid);
  assert.deepEqual(normalizeVotes([-1, 1000, 2.5]), [0, 0, 0]);
});
