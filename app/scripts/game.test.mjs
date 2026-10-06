import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULTS, STEPS, REFERENCES, calculate, normalizeInputs, normalizeState, initialState, hours } from '../public/engine.js';
const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-8, `${actual} != ${expected}`);
test('all 27 scenarios separate total time, earnings, fuel and net hourly balance', () => {
  let count = 0;
  for (const a of STEPS[0].options) for (const b of STEPS[1].options) for (const c of STEPS[2].options) {
    const inputs = { ...DEFAULTS, hours: a.value, idlePercent: b.value, km: c.value };
    const r = calculate(inputs);
    close(r.activeHours + r.idleHours, inputs.hours);
    close(r.income, inputs.hours * (1 - inputs.idlePercent / 100) * 47);
    close(r.fuel, inputs.km / 13.5 * 6.42);
    close(r.balance, r.income - r.fuel);
    close(r.perHour, r.balance / inputs.hours);
    assert.ok(r.perHour < 47);
    count++;
  }
  assert.equal(count, 27);
});
test('BH reference scenario is R$300.80 minus R$85.60, with all eight hours counted', () => {
  const r = calculate();
  close(r.income, 300.8); close(r.fuel, 85.6); close(r.balance, 215.2); close(r.perHour, 26.9);
  assert.equal(hours(r.activeHours), '6h24'); assert.equal(hours(r.idleHours), '1h36');
  assert.equal(REFERENCES.fuel.value, 6.42);
});
test('actual repasse overrides study estimate without another platform fee', () => {
  const r = calculate({ ...DEFAULTS, actualIncome: 300, otherCosts: 30 });
  close(r.income, 300); close(r.balance, 184.4); close(r.perHour, 23.05);
  assert.equal(r.hasActualIncome, true);
  close(calculate({ ...DEFAULTS, actualIncome: 300, idlePercent: 100 }).income, 300);
  assert.equal(calculate({ ...DEFAULTS, actualIncome: 0 }).income, 0);
});
test('zero earnings, fully idle time and negative balances are preserved', () => {
  const r = calculate({ ...DEFAULTS, idlePercent: 100, otherCosts: 30 });
  assert.equal(r.income, 0); close(r.balance, -115.6);
  const zero = calculate({ ...DEFAULTS, km: 0, hourlyRate: 0 });
  assert.equal(zero.balance, 0); assert.equal(zero.perHour, 0);
});
test('invalid inputs and saves recover safely, with no division by zero', () => {
  const inputs = normalizeInputs({ efficiency: 0, hours: 0, fuelPrice: Infinity, actualIncome: '', km: -3 });
  assert.equal(inputs.efficiency, 1); assert.equal(inputs.hours, 0.5); assert.equal(inputs.fuelPrice, 6.42); assert.equal(inputs.actualIncome, null);
  assert.ok(Number.isFinite(calculate(inputs).perHour));
  assert.deepEqual(normalizeInputs(null), DEFAULTS);
  assert.deepEqual(normalizeState({ version: 1, phase: 'result' }), initialState());
  assert.deepEqual(normalizeState({ ...initialState(), phase: 'result', completed: 1 }), initialState());
  const good = { ...initialState(), phase: 'result', completed: 3, inputs: { ...DEFAULTS, actualIncome: 0 } };
  assert.deepEqual(normalizeState(good), good);
});
