import { describe, expect, it } from 'vitest';
import { DEFAULT_HARDWARE } from '../data/factors';
import { estimateApi, estimateChat, tokenEnergyWh } from './calc';

describe('estimateChat', () => {
  it('sums text and image energy and scales to month/year', () => {
    const r = estimateChat({ queriesPerDay: 10, whPerQuery: 0.3, imagesPerDay: 1, whPerImage: 3, daysPerMonth: 30 });
    expect(r.whPerDay).toBeCloseTo(6);
    expect(r.kwhPerMonth).toBeCloseTo(0.18);
    expect(r.kwhPerYear).toBeCloseTo(2.16);
  });
});

describe('tokenEnergyWh', () => {
  it('returns 0 for zero tokens', () => {
    expect(tokenEnergyWh(0, 70, 0.1, DEFAULT_HARDWARE)).toBe(0);
  });

  it('lands near the ~0.3 Wh public estimates for a 500-token answer on a ~100B model', () => {
    const wh = tokenEnergyWh(500, 100, DEFAULT_HARDWARE.decodeUtil, DEFAULT_HARDWARE);
    expect(wh).toBeGreaterThan(0.2);
    expect(wh).toBeLessThan(0.5);
  });

  it('scales linearly with tokens and parameters', () => {
    const a = tokenEnergyWh(100, 10, 0.1, DEFAULT_HARDWARE);
    expect(tokenEnergyWh(200, 10, 0.1, DEFAULT_HARDWARE)).toBeCloseTo(a * 2);
    expect(tokenEnergyWh(100, 20, 0.1, DEFAULT_HARDWARE)).toBeCloseTo(a * 2);
  });
});

describe('estimateApi', () => {
  it('splits input and output energy', () => {
    const r = estimateApi({ activeParamsB: 70, inputTokens: 1000, outputTokens: 500, requestsPerMonth: 1000 }, DEFAULT_HARDWARE);
    expect(r.whPerRequest).toBeCloseTo(r.inputWh + r.outputWh);
    expect(r.kwhPerMonth).toBeCloseTo((r.whPerRequest * 1000) / 1000);
  });
});
