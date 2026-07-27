import test from 'node:test';
import assert from 'node:assert';
import {
    isValidNumber,
    toFiniteNumber,
    calculateWorkingCapital,
    calculateWACC,
    calculateDepreciationLinear,
    calculateMarginalContribution,
    calculateBreakEven,
    calculateUnitProfit,
    calculateNPV,
    calculateIRR
} from '../core/analisis_economico.js';

test('isValidNumber', () => {
    assert.strictEqual(isValidNumber(10), true);
    assert.strictEqual(isValidNumber(0), true);
    assert.strictEqual(isValidNumber(-5.5), true);
    assert.strictEqual(isValidNumber(NaN), false);
    assert.strictEqual(isValidNumber(Infinity), false);
    assert.strictEqual(isValidNumber('10'), false);
    assert.strictEqual(isValidNumber(null), false);
    assert.strictEqual(isValidNumber(undefined), false);
});

test('toFiniteNumber', () => {
    assert.strictEqual(toFiniteNumber(10), 10);
    assert.strictEqual(toFiniteNumber('10'), 10);
    assert.strictEqual(toFiniteNumber('abc', 5), 5);
    assert.strictEqual(toFiniteNumber(NaN, 0), 0);
    assert.strictEqual(toFiniteNumber(Infinity, -1), -1);
    assert.strictEqual(toFiniteNumber(null, 10), 0); // Number(null) is 0 in JS
});

test('calculateWorkingCapital', () => {
    // Nominal case
    assert.strictEqual(calculateWorkingCapital(36500, 10), 1000);
    
    // Boundary cases
    assert.strictEqual(calculateWorkingCapital(0, 10), 0);
    assert.strictEqual(calculateWorkingCapital(36500, 0), 0);
    
    // Invalid/negative cases
    assert.strictEqual(calculateWorkingCapital(-100, 10), 0);
    assert.strictEqual(calculateWorkingCapital(36500, -5), 0);
    
    // Corrupt inputs
    assert.strictEqual(calculateWorkingCapital(NaN, 10), 0);
    assert.strictEqual(calculateWorkingCapital(36500, 'invalid'), 0);
});

test('calculateWACC', () => {
    // Nominal case: E = 150000, D = 100000 (V = 250000), Re = 0.15, Rd = 0.08, T = 0.25
    // term1 = 150000 / 250000 * 0.15 = 0.6 * 0.15 = 0.09
    // term2 = 100000 / 250000 * 0.08 * (1 - 0.25) = 0.4 * 0.08 * 0.75 = 0.024
    // WACC = 0.09 + 0.024 = 0.114
    const result = calculateWACC(150000, 100000, 0.15, 0.08, 0.25);
    assert.ok(Math.abs(result - 0.114) < 1e-6);

    // Boundary cases (V = 0)
    assert.strictEqual(calculateWACC(0, 0, 0.15, 0.08, 0.25), 0);

    // Invalid cases
    assert.strictEqual(calculateWACC(-1000, 1000, 0.15, 0.08, 0.25), 0);

    // Corrupt cases
    assert.strictEqual(calculateWACC(NaN, 1000, 0.15, 0.08, 0.25), 0);
    assert.strictEqual(calculateWACC(150000, null, 0.15, 0.08, 0.25), 150000 / 150000 * 0.15); // D = 0
});

test('calculateDepreciationLinear', () => {
    // Nominal: V0 = 250000, Vs = 50000, n = 5
    // Dep = (250000 - 50000) / 5 = 40000
    assert.strictEqual(calculateDepreciationLinear(250000, 50000, 5), 40000);

    // Boundary/Lifespan zero
    assert.strictEqual(calculateDepreciationLinear(250000, 50000, 0), 0);

    // Salvage larger than initial
    assert.strictEqual(calculateDepreciationLinear(10000, 20000, 5), 0);

    // Corrupt
    assert.strictEqual(calculateDepreciationLinear(NaN, 5000, 5), 0);
    assert.strictEqual(calculateDepreciationLinear(250000, '50000', null), 0);
});

test('calculateMarginalContribution', () => {
    // Nominal: Pu = 12.00, CVu = 6.50 -> MC = 5.50
    assert.strictEqual(calculateMarginalContribution(12.00, 6.50), 5.50);

    // CVu > Pu
    assert.strictEqual(calculateMarginalContribution(10, 15), 0);

    // Corrupt
    assert.strictEqual(calculateMarginalContribution(NaN, 6.50), 0);
    assert.strictEqual(calculateMarginalContribution(12, 'invalid'), 0);
});

test('calculateBreakEven', () => {
    // Nominal: CF = 110000, MCu = 5.50 -> Q_PE = 20000
    assert.strictEqual(calculateBreakEven(110000, 5.50), 20000);

    // MCu = 0
    assert.strictEqual(calculateBreakEven(110000, 0), 0);

    // Corrupt
    assert.strictEqual(calculateBreakEven(NaN, 5.50), 0);
    assert.strictEqual(calculateBreakEven(110000, '5.50'), 20000);
});

test('calculateUnitProfit', () => {
    // Nominal: Pu = 12.00, CVu = 6.50, CF = 110000, Q = 50000
    // CTu = 6.50 + (110000 / 50000) = 6.50 + 2.20 = 8.70
    // MUu = 12.00 - 8.70 = 3.30
    const result = calculateUnitProfit(12.00, 6.50, 110000, 50000);
    assert.ok(Math.abs(result - 3.30) < 1e-6);

    // Q = 0
    assert.strictEqual(calculateUnitProfit(12, 6, 100, 0), 0);

    // Corrupt
    assert.strictEqual(calculateUnitProfit(NaN, 6, 100, 50), 0);
});

test('calculateNPV', () => {
    // Case study (5 years): I0 = 280000 (250000 + 30000)
    // Cashflows: Y1-Y4: 173750, Y5: 203750 (includes 30000 working capital recovery)
    // WACC = 12% (0.12)
    // Precise NPV is 363352.67
    const cashFlows = [173750, 173750, 173750, 173750, 203750];
    const npv = calculateNPV(280000, cashFlows, 0.12);
    assert.ok(Math.abs(npv - 363352.67) < 0.1);

    // Case study (4 years, matching the document's manual summation error of 527713.82 - 280000)
    const cf4 = [173750, 173750, 173750, 173750];
    const npv4 = calculateNPV(280000, cf4, 0.12);
    assert.ok(Math.abs(npv4 - 247739.45) < 0.1);

    // Boundary (empty cash flows)
    assert.strictEqual(calculateNPV(100, [], 0.10), -100);

    // Corrupt
    assert.strictEqual(calculateNPV(NaN, cashFlows, 0.12), 0);
});

test('calculateIRR', () => {
    // Case study IRR (5 years): I0 = 280000, CF = [173750, 173750, 173750, 173750, 203750]
    // IRR is approx 55.98% (0.5598)
    const cashFlows = [173750, 173750, 173750, 173750, 203750];
    const irr = calculateIRR(280000, cashFlows);
    assert.ok(Math.abs(irr - 0.5598) < 0.001);

    // 4-year IRR case:
    const cf4 = [173750, 173750, 173750, 173750];
    const irr4 = calculateIRR(280000, cf4);
    assert.ok(Math.abs(irr4 - 0.497) < 0.001);

    // Invalid / no returns
    assert.strictEqual(calculateIRR(100, [-10, -20]), 0);
});

