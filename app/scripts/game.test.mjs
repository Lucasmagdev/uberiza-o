import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULTS, STEPS, REFERENCES, PROFILES, calculate, normalizeInputs, normalizeState, initialState, hours } from '../public/engine.js';
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
  const good = { ...initialState('uber'), phase: 'result', completed: 3, inputs: { ...DEFAULTS, actualIncome: 0 } };
  assert.deepEqual(normalizeState(good), good);
});
test('all 27 iFood scenarios use completed deliveries and motorcycle fuel, with total time in the denominator', () => {
  const p = PROFILES.ifood;
  let count = 0;
  for (const h of p.steps[0].options) for (const d of p.steps[1].options) for (const k of p.steps[2].options) {
    const r = calculate({ ...p.defaults, hours: h.value, deliveries: d.value, km: k.value }, 'ifood');
    close(r.income, d.value * 7.5); close(r.fuel, k.value / 55.3 * 6.42);
    close(r.balance, r.income - r.fuel); close(r.perHour, r.balance / h.value);
    assert.equal(r.activeHours, null); assert.equal(r.idleHours, null);
    count++;
  }
  assert.equal(count, 27);
});
test('iFood actual repasse overrides delivery estimate, including zero and negative net balances', () => {
  const r = calculate({ ...PROFILES.ifood.defaults, actualIncome: 180, otherCosts: 25 }, 'ifood');
  close(r.income, 180); close(r.balance, 180 - 120 / 55.3 * 6.42 - 25);
  assert.equal(calculate({ actualIncome: 0 }, 'ifood').income, 0);
  assert.ok(calculate({ deliveries: 0 }, 'ifood').balance < 0);
  assert.equal(calculate({ km: 0, deliveries: 0 }, 'ifood').balance, 0);
  assert.equal(calculate({ deliveries: 18, deliveryRate: 10 }, 'ifood').income, 180);
});
test('fresh platform selection isolates car and motorcycle inputs, with safe module defaults', () => {
  assert.equal(initialState().phase, 'select'); assert.equal(initialState().platform, null);
  const uber = initialState('uber'), ifood = initialState('ifood');
  uber.inputs.actualIncome = 800; uber.inputs.efficiency = 8;
  assert.equal(ifood.inputs.actualIncome, null); assert.equal(ifood.inputs.efficiency, 55.3);
  assert.equal(initialState('uber').inputs.actualIncome, null);
  assert.deepEqual(normalizeInputs(null, 'ifood'), PROFILES.ifood.defaults);
  assert.equal(normalizeInputs({ deliveries: -5, efficiency: 0 }, 'ifood').deliveries, 0);
  assert.equal(normalizeInputs({ deliveries: 18.5 }, 'ifood').deliveries, 18);
  assert.deepEqual(normalizeState({ ...ifood, platform: 'unknown' }), initialState());
  assert.equal(normalizeState({ ...ifood, phase: 'result', completed: 3 }).platform, 'ifood');
});
