import type { HardwareAssumptions } from '../data/factors';

const J_PER_WH = 3600;

export interface ChatUsage {
  queriesPerDay: number;
  whPerQuery: number;
  imagesPerDay: number;
  whPerImage: number;
  daysPerMonth: number;
}

export interface EnergyTotals {
  whPerDay: number;
  kwhPerMonth: number;
  kwhPerYear: number;
}

export function estimateChat(u: ChatUsage): EnergyTotals & { textWhPerDay: number; imageWhPerDay: number } {
  const textWhPerDay = u.queriesPerDay * u.whPerQuery;
  const imageWhPerDay = u.imagesPerDay * u.whPerImage;
  const whPerDay = textWhPerDay + imageWhPerDay;
  const kwhPerMonth = (whPerDay * u.daysPerMonth) / 1000;
  return { textWhPerDay, imageWhPerDay, whPerDay, kwhPerMonth, kwhPerYear: kwhPerMonth * 12 };
}

/**
 * Energy (Wh) to process `tokens` tokens on a model with `activeParamsB`
 * billion active parameters, assuming ~2 FLOPs per active parameter per token.
 */
export function tokenEnergyWh(
  tokens: number,
  activeParamsB: number,
  util: number,
  hw: HardwareAssumptions,
): number {
  if (tokens <= 0 || util <= 0 || hw.peakTflops <= 0) return 0;
  const flops = 2 * activeParamsB * 1e9 * tokens;
  const seconds = flops / (hw.peakTflops * 1e12 * util);
  const joules = seconds * hw.gpuWatts * hw.serverOverhead * hw.pue;
  return joules / J_PER_WH;
}

export interface ApiUsage {
  activeParamsB: number;
  inputTokens: number;
  outputTokens: number;
  requestsPerMonth: number;
}

export function estimateApi(u: ApiUsage, hw: HardwareAssumptions) {
  const inputWh = tokenEnergyWh(u.inputTokens, u.activeParamsB, hw.prefillUtil, hw);
  const outputWh = tokenEnergyWh(u.outputTokens, u.activeParamsB, hw.decodeUtil, hw);
  const whPerRequest = inputWh + outputWh;
  const kwhPerMonth = (whPerRequest * u.requestsPerMonth) / 1000;
  return {
    inputWh,
    outputWh,
    whPerRequest,
    whPer1kOutputTokens: tokenEnergyWh(1000, u.activeParamsB, hw.decodeUtil, hw),
    kwhPerMonth,
    kwhPerYear: kwhPerMonth * 12,
  };
}

export const co2Kg = (kwh: number, kgPerKwh: number) => kwh * kgPerKwh;
export const costYen = (kwh: number, yenPerKwh: number) => kwh * yenPerKwh;
