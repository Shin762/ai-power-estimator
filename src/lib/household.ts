import { AREAS, NATIONAL_DC, YEARS, dcAreaShare, type GridAssumptions, type Year } from '../data/grid';

export interface Mitigation {
  /** Share of DC peak load shifted out of the area peak (load shifting / demand response), 0-1. */
  loadShift: number;
  /** Share of DC load sited where the grid has spare capacity (regional distribution), 0-1. */
  distributed: number;
}

export const NO_MITIGATION: Mitigation = { loadShift: 0, distributed: 0 };

export interface HouseholdInput {
  areaId: string;
  year: Year;
  householdKwhPerMonth: number;
  /** DC additions in the area, kW. */
  dcKw: number;
}

export interface HouseholdImpact {
  /** Network tariff increase from the general-burden share of reinforcement, 円/kWh. */
  gridYenPerKwh: number;
  /** Capacity cost increase spread over all area demand, 円/kWh. */
  capacityYenPerKwh: number;
  yenPerKwh: number;
  yenPerMonth: number;
  yenPerYear: number;
  /** Area-wide annual cost borne by all customers, 円/年. */
  areaYenPerYear: number;
  /** DC load as a share of the area peak, 0-1. */
  dcPeakShare: number;
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Default DC additions for an area and year (kW), from the national OCCTO figure and the area proxy share. */
export function defaultDcKw(areaId: string, year: Year): number {
  const i = YEARS.indexOf(year);
  return NATIONAL_DC.peakManKw[i] * 1e4 * dcAreaShare(areaId);
}

/**
 * Household bill increase attributable to DC additions in one area.
 *
 * grid:     dcKw × cost/kW × siting factor × general share × annual rate ÷ area kWh
 * capacity: capacity price × elasticity × peak-coincident dcKw ÷ area kWh
 *
 * Wholesale energy price effects are not modelled.
 */
export function estimateHousehold(input: HouseholdInput, a: GridAssumptions, m: Mitigation): HouseholdImpact {
  const area = AREAS.find((x) => x.id === input.areaId);
  const i = YEARS.indexOf(input.year);
  if (!area || i < 0) throw new Error(`unknown area or year: ${input.areaId} ${input.year}`);

  const areaKwh = area.energyMillionKwh[i] * 1e6;
  const dcKw = Math.max(0, input.dcKw);

  const sitingFactor = 1 - clamp01(m.distributed) * (1 - clamp01(a.welcomeZoneCostRatio));
  const gridAnnual = dcKw * a.gridCostYenPerKw * sitingFactor * clamp01(a.generalShare) * a.annualCostRate;

  const peakKw = dcKw * clamp01(a.peakCoincidence) * (1 - clamp01(m.loadShift));
  const capacityAnnual = (area.capacityYenPerKw ?? 0) * a.capacityElasticity * peakKw;

  const gridYenPerKwh = areaKwh > 0 ? gridAnnual / areaKwh : 0;
  const capacityYenPerKwh = areaKwh > 0 ? capacityAnnual / areaKwh : 0;
  const yenPerKwh = gridYenPerKwh + capacityYenPerKwh;
  const yenPerMonth = yenPerKwh * input.householdKwhPerMonth;

  return {
    gridYenPerKwh,
    capacityYenPerKwh,
    yenPerKwh,
    yenPerMonth,
    yenPerYear: yenPerMonth * 12,
    areaYenPerYear: gridAnnual + capacityAnnual,
    dcPeakShare: dcKw / (area.peakSenKw[i] * 1e3),
  };
}
