import { describe, expect, it } from 'vitest';
import { AREAS, DEFAULT_GRID_ASSUMPTIONS, NATIONAL_DC, dcAreaShare } from '../data/grid';
import { NO_MITIGATION, defaultDcKw, estimateHousehold } from './household';

const base = { areaId: 'tokyo', year: 2035 as const, householdKwhPerMonth: 260, dcKw: 3_500_000 };

describe('dcAreaShare', () => {
  it('sums to 1 across areas and is 0 where OCCTO counts no DC additions', () => {
    const total = AREAS.reduce((s, a) => s + dcAreaShare(a.id), 0);
    expect(total).toBeCloseTo(1);
    expect(dcAreaShare('okinawa')).toBe(0);
    expect(dcAreaShare('tokyo')).toBeGreaterThan(0.5);
  });

  it('allocates the national FY2035 figure', () => {
    const sum = AREAS.reduce((s, a) => s + defaultDcKw(a.id, 2035), 0);
    expect(sum).toBeCloseTo(NATIONAL_DC.peakManKw[9] * 1e4);
  });
});

describe('estimateHousehold', () => {
  it('matches a hand calculation for Tokyo FY2035', () => {
    const r = estimateHousehold(base, DEFAULT_GRID_ASSUMPTIONS, NO_MITIGATION);
    const areaKwh = 287_103e6;
    const grid = (3_500_000 * 100_000 * 0.5 * 0.08) / areaKwh;
    const cap = (15_111 * 3_500_000) / areaKwh;
    expect(r.gridYenPerKwh).toBeCloseTo(grid, 6);
    expect(r.capacityYenPerKwh).toBeCloseTo(cap, 6);
    expect(r.yenPerMonth).toBeCloseTo((grid + cap) * 260, 6);
    expect(r.yenPerYear).toBeCloseTo(r.yenPerMonth * 12);
  });

  it('load shifting reduces only the capacity part', () => {
    const a = estimateHousehold(base, DEFAULT_GRID_ASSUMPTIONS, NO_MITIGATION);
    const b = estimateHousehold(base, DEFAULT_GRID_ASSUMPTIONS, { loadShift: 0.5, distributed: 0 });
    expect(b.gridYenPerKwh).toBeCloseTo(a.gridYenPerKwh);
    expect(b.capacityYenPerKwh).toBeCloseTo(a.capacityYenPerKwh / 2);
  });

  it('regional distribution reduces only the grid part', () => {
    const a = estimateHousehold(base, DEFAULT_GRID_ASSUMPTIONS, NO_MITIGATION);
    const b = estimateHousehold(base, DEFAULT_GRID_ASSUMPTIONS, { loadShift: 0, distributed: 1 });
    expect(b.capacityYenPerKwh).toBeCloseTo(a.capacityYenPerKwh);
    expect(b.gridYenPerKwh).toBeCloseTo(a.gridYenPerKwh * DEFAULT_GRID_ASSUMPTIONS.welcomeZoneCostRatio);
  });

  it('has no capacity cost where the capacity market does not apply', () => {
    const r = estimateHousehold({ ...base, areaId: 'okinawa', dcKw: 10_000 }, DEFAULT_GRID_ASSUMPTIONS, NO_MITIGATION);
    expect(r.capacityYenPerKwh).toBe(0);
    expect(r.gridYenPerKwh).toBeGreaterThan(0);
  });

  it('returns zero impact with no DC load', () => {
    const r = estimateHousehold({ ...base, dcKw: 0 }, DEFAULT_GRID_ASSUMPTIONS, NO_MITIGATION);
    expect(r.yenPerMonth).toBe(0);
  });
});
