// Regional grid data used by the household bill impact simulator.
// Figures from OCCTO's FY2026 demand outlook (published 2026-01-21) and the
// capacity market main auction for delivery year FY2029 (published 2026-01-20).

import type { Source } from './factors';

export const GRID_SOURCES = {
  occtoDemand: {
    label: '電力広域的運営推進機関「全国及び供給区域ごとの需要想定（2026年度）」表2〜4・別添表1-1',
    url: 'https://www.occto.or.jp/assets/news/juyousoutei/260121_juyousoutei_r1.pdf',
    date: '2026-01-21',
  },
  capacityMarket: {
    label: '電力広域的運営推進機関「容量市場メインオークション約定結果（対象実需給年度：2029年度）」',
    url: 'https://www.meti.go.jp/shingikai/enecho/denryoku_gas/jisedai_kiban/system_review/pdf/110_03_01.pdf',
    date: '2026-01-20',
  },
  takusou: {
    label: '送配電網協議会「一般送配電事業者8社の収入の見通しの変更承認申請について」',
    url: 'https://www.tdgc.jp/information/2026/07/10_1730.html',
    date: '2026-07-10',
  },
} satisfies Record<string, Source>;

export const YEARS = [2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035] as const;
export type Year = (typeof YEARS)[number];

/** National data center additions counted individually by OCCTO (別添表1-1). Semiconductor fabs excluded. */
export const NATIONAL_DC = {
  /** Peak demand, 万kW, FY2026..FY2035. */
  peakManKw: [64, 104, 166, 241, 328, 414, 492, 561, 615, 661],
  /** Energy, 億kWh, FY2026..FY2035. */
  energyOkuKwh: [48, 75, 120, 178, 243, 309, 368, 418, 460, 494],
};

export interface Area {
  id: string;
  label: string;
  /** Annual peak demand (送電端), 千kW, FY2026..FY2035. Winter peak for 北海道・東北・北陸, summer otherwise. */
  peakSenKw: number[];
  /** Energy demand (使用端), 百万kWh, FY2026..FY2035. */
  energyMillionKwh: number[];
  /** 産業用その他 energy, 百万kWh, FY2026 and FY2035. Used to allocate national DC additions to areas. */
  industrial: [number, number];
  /** Whether OCCTO counts DC / fab additions individually in this area. */
  hasIndividualDc: boolean;
  /** Capacity market clearing price for FY2029, 円/kW. null where the market does not apply. */
  capacityYenPerKw: number | null;
}

export const AREAS: Area[] = [
  {
    id: 'hokkaido',
    label: '北海道',
    peakSenKw: [5060, 5090, 5170, 5240, 5390, 5440, 5430, 5420, 5390, 5370],
    energyMillionKwh: [27880, 28087, 28365, 28968, 29812, 30565, 30865, 31100, 31232, 31243],
    industrial: [7953, 12133],
    hasIndividualDc: true,
    capacityYenPerKw: 14972,
  },
  {
    id: 'tohoku',
    label: '東北',
    peakSenKw: [13468, 13445, 13445, 13488, 13472, 13422, 13382, 13332, 13292, 13242],
    energyMillionKwh: [74163, 74480, 74240, 74714, 74768, 74719, 74266, 74016, 73766, 73718],
    industrial: [32789, 34772],
    hasIndividualDc: true,
    capacityYenPerKw: 15111,
  },
  {
    id: 'tokyo',
    label: '東京',
    peakSenKw: [55010, 55270, 55770, 56380, 56990, 57610, 58090, 58480, 58710, 58880],
    energyMillionKwh: [257786, 260308, 263112, 267628, 272156, 277403, 280274, 283058, 285011, 287103],
    industrial: [87190, 116683],
    hasIndividualDc: true,
    capacityYenPerKw: 15111,
  },
  {
    id: 'chubu',
    label: '中部',
    peakSenKw: [23676, 23701, 23655, 23677, 23739, 23798, 23848, 23870, 23880, 23868],
    energyMillionKwh: [121732, 122191, 121656, 122095, 122553, 123508, 123696, 124020, 124193, 124569],
    industrial: [63404, 68603],
    hasIndividualDc: true,
    capacityYenPerKw: 12388,
  },
  {
    id: 'hokuriku',
    label: '北陸',
    peakSenKw: [4910, 4900, 4890, 4880, 4870, 4860, 4850, 4850, 4840, 4830],
    energyMillionKwh: [25665, 25684, 25566, 25520, 25472, 25497, 25381, 25341, 25296, 25320],
    industrial: [12349, 12694],
    hasIndividualDc: false,
    capacityYenPerKw: 12388,
  },
  {
    id: 'kansai',
    label: '関西',
    peakSenKw: [26880, 26932, 26956, 27007, 27097, 27194, 27295, 27520, 27631, 27737],
    energyMillionKwh: [130894, 131440, 131287, 131679, 132277, 133368, 133805, 134946, 135816, 137041],
    industrial: [48484, 56091],
    hasIndividualDc: true,
    capacityYenPerKw: 12388,
  },
  {
    id: 'chugoku',
    label: '中国',
    peakSenKw: [10020, 10020, 10010, 10080, 10110, 10080, 10060, 10090, 10110, 10130],
    energyMillionKwh: [52863, 52794, 52709, 53457, 53636, 53798, 53624, 53805, 53925, 54197],
    industrial: [24779, 28451],
    hasIndividualDc: true,
    capacityYenPerKw: 12388,
  },
  {
    id: 'shikoku',
    label: '四国',
    peakSenKw: [4690, 4640, 4600, 4550, 4500, 4460, 4410, 4370, 4320, 4280],
    energyMillionKwh: [23413, 23242, 22948, 22718, 22491, 22320, 22029, 21801, 21572, 21408],
    industrial: [8823, 8813],
    hasIndividualDc: false,
    capacityYenPerKw: 12388,
  },
  {
    id: 'kyushu',
    label: '九州',
    peakSenKw: [15860, 15910, 15990, 16010, 16030, 16030, 16020, 16010, 15980, 15960],
    energyMillionKwh: [81096, 81846, 82357, 82685, 82922, 83227, 83059, 83077, 82999, 83152],
    industrial: [31047, 34627],
    hasIndividualDc: true,
    capacityYenPerKw: 15112,
  },
  {
    id: 'okinawa',
    label: '沖縄',
    peakSenKw: [1623, 1630, 1637, 1669, 1677, 1684, 1691, 1699, 1706, 1714],
    energyMillionKwh: [7912, 7967, 7981, 8137, 8176, 8232, 8244, 8282, 8318, 8378],
    industrial: [1306, 1472],
    hasIndividualDc: false,
    capacityYenPerKw: null,
  },
];

/**
 * Share of national DC additions allocated to each area. OCCTO publishes the
 * area split only as a chart, so this is a proxy: each area's growth in
 * 産業用その他 energy (FY2026→FY2035) among areas with individually counted
 * DC / fab demand. It also picks up semiconductor fabs and other industry.
 */
export function dcAreaShare(areaId: string): number {
  const growth = (a: Area) => (a.hasIndividualDc ? Math.max(0, a.industrial[1] - a.industrial[0]) : 0);
  const total = AREAS.reduce((s, a) => s + growth(a), 0);
  const area = AREAS.find((a) => a.id === areaId);
  return area && total > 0 ? growth(area) / total : 0;
}

/** Assumptions without a public source. All are adjustable in the UI. */
export interface GridAssumptions {
  /** Grid reinforcement cost per kW of new DC load, 円/kW. */
  gridCostYenPerKw: number;
  /** Share of reinforcement cost recovered from all customers via network tariffs (一般負担), 0-1. */
  generalShare: number;
  /** Annual cost rate (depreciation + return + O&M) on reinforcement investment, 0-1. */
  annualCostRate: number;
  /** Reinforcement cost at sites with spare grid capacity, relative to the default, 0-1. */
  welcomeZoneCostRatio: number;
  /** % rise in capacity price per 1% rise in peak demand. */
  capacityElasticity: number;
  /** Share of DC load that coincides with the area peak before any load shifting, 0-1. */
  peakCoincidence: number;
}

export const DEFAULT_GRID_ASSUMPTIONS: GridAssumptions = {
  gridCostYenPerKw: 100_000,
  generalShare: 0.5,
  annualCostRate: 0.08,
  welcomeZoneCostRatio: 0.3,
  capacityElasticity: 1.0,
  peakCoincidence: 1.0,
};

/** Standard household monthly usage used by major utilities in price comparisons (assumption). */
export const DEFAULT_HOUSEHOLD_KWH_PER_MONTH = 260;
