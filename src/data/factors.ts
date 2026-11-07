// Coefficients used by the estimator. Every value carries its source and the
// date it refers to, so the UI can show where a number came from.

export interface Source {
  label: string;
  url: string;
  /** Date the figure refers to or was published (YYYY-MM or YYYY-MM-DD). */
  date: string;
}

export interface QueryPreset {
  id: string;
  label: string;
  whPerQuery: number;
  note: string;
  source?: Source;
}

export const SOURCES = {
  google: {
    label:
      'Google, "Measuring the environmental impact of delivering AI at Google Scale" (arXiv:2508.15734)',
    url: 'https://arxiv.org/abs/2508.15734',
    date: '2025-08',
  },
  altman: {
    label: 'Sam Altman, "The Gentle Singularity" (blog)',
    url: 'https://blog.samaltman.com/the-gentle-singularity',
    date: '2025-06-10',
  },
  epoch: {
    label: 'Epoch AI, "How much energy does ChatGPT use?"',
    url: 'https://epoch.ai/gradient-updates/how-much-energy-does-chatgpt-use',
    date: '2025-02-07',
  },
  luccioni: {
    label:
      'Luccioni, Jernite, Strubell, "Power Hungry Processing: Watts Driving the Cost of AI Deployment?" (arXiv:2311.16863)',
    url: 'https://arxiv.org/abs/2311.16863',
    date: '2023-11',
  },
  h100: {
    label: 'NVIDIA H100 Tensor Core GPU datasheet (SXM: BF16 dense ≈ 989 TFLOPS, TDP 700 W)',
    url: 'https://www.nvidia.com/en-us/data-center/h100/',
    date: '2023',
  },
  jpCo2: {
    label: '環境省「算定方法・排出係数一覧」（電気事業者別排出係数・全国平均係数）',
    url: 'https://policies.env.go.jp/earth/ghg-santeikohyo/calc.html',
    date: '2026-07 更新分を参照（年度は要確認）',
  },
  jpPrice: {
    label: '全国家庭電気製品公正取引協議会「新電力料金目安単価」31円/kWh（税込）',
    url: 'https://www.eftc.or.jp/qa/',
    date: '2022-07-22 改定',
  },
} satisfies Record<string, Source>;

/** Energy per text query presets (Wh). */
export const QUERY_PRESETS: QueryPreset[] = [
  {
    id: 'gemini',
    label: 'Gemini 中央値 0.24 Wh',
    whPerQuery: 0.24,
    note: 'Gemini Apps テキストプロンプトの中央値（2025年5月計測）。PUE・待機機器・ホストCPU込み。',
    source: SOURCES.google,
  },
  {
    id: 'chatgpt',
    label: 'ChatGPT 平均 0.34 Wh',
    whPerQuery: 0.34,
    note: 'OpenAI CEO による平均クエリの公表値。算定範囲・対象モデルは非公開。',
    source: SOURCES.altman,
  },
  {
    id: 'epoch',
    label: 'GPT-4o 推計 0.3 Wh',
    whPerQuery: 0.3,
    note: '典型的な GPT-4o クエリ（出力約500トークン）の外部推計。',
    source: SOURCES.epoch,
  },
  {
    id: 'heavy',
    label: '長文・推論モデル（仮定）5 Wh',
    whPerQuery: 5,
    note: '長い入力や推論（thinking）モデルは1回あたり数Wh〜数十Whとの外部推計がある。ここでは仮定値として 5 Wh を置く。',
  },
];

/** Image generation: 2.907 kWh per 1,000 images (average across models tested). */
export const IMAGE_WH = 2.907;

export const DEFAULT_CO2_KG_PER_KWH = 0.42;
export const DEFAULT_YEN_PER_KWH = 31;

/** Everyday comparisons. These are assumptions, not sourced figures. */
export const COMPARISONS = {
  ledBulbW: 8, // LED 電球（60W形相当）の消費電力の目安
  smartphoneChargeWh: 15, // スマートフォン1回のフル充電（バッテリー容量 + 充電ロス）の目安
};

export interface ModelPreset {
  id: string;
  label: string;
  activeParamsB: number;
}

/** Active parameter counts (billions). Closed-model sizes are not public, so these are size classes. */
export const MODEL_PRESETS: ModelPreset[] = [
  { id: 'small', label: '小型（アクティブ 8B）', activeParamsB: 8 },
  { id: 'medium', label: '中型（アクティブ 70B）', activeParamsB: 70 },
  { id: 'large', label: '大型（アクティブ 200B・仮定）', activeParamsB: 200 },
];

export interface HardwareAssumptions {
  /** Peak dense BF16 throughput per accelerator (TFLOPS). */
  peakTflops: number;
  /** Accelerator power (W). */
  gpuWatts: number;
  /** Utilization of peak FLOPS during prefill (input tokens), 0-1. */
  prefillUtil: number;
  /** Utilization of peak FLOPS during decode (output tokens), 0-1. */
  decodeUtil: number;
  /** Multiplier for host CPU, DRAM, networking and idle capacity. */
  serverOverhead: number;
  /** Data center power usage effectiveness. */
  pue: number;
}

export const DEFAULT_HARDWARE: HardwareAssumptions = {
  peakTflops: 989,
  gpuWatts: 700,
  prefillUtil: 0.4,
  decodeUtil: 0.1,
  serverOverhead: 1.5,
  pue: 1.1,
};
