import { useState } from 'react';
import { DEFAULT_HARDWARE, MODEL_PRESETS, SOURCES, type HardwareAssumptions } from '../data/factors';
import { estimateApi } from '../lib/calc';
import { Results } from './Results';
import { Breakdown, NumberField, SourceLink, fmt } from './ui';

export function ApiEstimator(props: { co2Factor: number; yenPerKwh: number }) {
  const [activeParamsB, setActiveParamsB] = useState(MODEL_PRESETS[1].activeParamsB);
  const [inputTokens, setInputTokens] = useState(1000);
  const [outputTokens, setOutputTokens] = useState(500);
  const [requestsPerMonth, setRequestsPerMonth] = useState(10000);
  const [hw, setHw] = useState<HardwareAssumptions>(DEFAULT_HARDWARE);

  const setHwField = (k: keyof HardwareAssumptions) => (v: number) => setHw((h) => ({ ...h, [k]: v }));
  const r = estimateApi({ activeParamsB, inputTokens, outputTokens, requestsPerMonth }, hw);

  return (
    <section className="panel">
      <div className="inputs">
        <fieldset className="presets">
          <legend>モデル規模</legend>
          {MODEL_PRESETS.map((m) => (
            <label key={m.id} className={`chip ${activeParamsB === m.activeParamsB ? 'on' : ''}`}>
              <input
                type="radio"
                name="model"
                checked={activeParamsB === m.activeParamsB}
                onChange={() => setActiveParamsB(m.activeParamsB)}
              />
              {m.label}
            </label>
          ))}
        </fieldset>
        <div className="grid">
          <NumberField
            label="アクティブパラメータ数"
            value={activeParamsB}
            onChange={setActiveParamsB}
            unit="B"
            hint="MoE はトークンごとに使われる専門家分のみ。商用モデルの規模は非公開のため仮定値。"
          />
          <NumberField label="入力トークン / リクエスト" value={inputTokens} onChange={setInputTokens} unit="tok" step={100} />
          <NumberField label="出力トークン / リクエスト" value={outputTokens} onChange={setOutputTokens} unit="tok" step={100} />
          <NumberField label="月間リクエスト数" value={requestsPerMonth} onChange={setRequestsPerMonth} unit="回" step={1000} />
        </div>

        <details className="advanced">
          <summary>ハードウェア・データセンターの前提</summary>
          <div className="grid">
            <NumberField
              label="GPUピーク性能"
              value={hw.peakTflops}
              onChange={setHwField('peakTflops')}
              unit="TFLOPS"
              hint={<SourceLink source={SOURCES.h100} />}
            />
            <NumberField label="GPU消費電力" value={hw.gpuWatts} onChange={setHwField('gpuWatts')} unit="W" step={50} />
            <NumberField
              label="入力処理（prefill）利用率"
              value={hw.prefillUtil}
              onChange={setHwField('prefillUtil')}
              step={0.05}
              hint="仮定値。まとめて並列計算できるため高め。"
            />
            <NumberField
              label="出力生成（decode）利用率"
              value={hw.decodeUtil}
              onChange={setHwField('decodeUtil')}
              step={0.05}
              hint="仮定値。メモリ帯域律速で低くなりやすい。Epoch AI の推計も約10%を想定。"
            />
            <NumberField
              label="サーバー付帯係数"
              value={hw.serverOverhead}
              onChange={setHwField('serverOverhead')}
              step={0.1}
              hint="ホストCPU・DRAM・待機機器分。Google の内訳ではアクセラレータが全体の約58%。"
            />
            <NumberField label="PUE" value={hw.pue} onChange={setHwField('pue')} step={0.05} hint="データセンター全体の電力 ÷ IT機器の電力。" />
          </div>
          <button type="button" className="reset" onClick={() => setHw(DEFAULT_HARDWARE)}>
            前提を既定値に戻す
          </button>
        </details>
      </div>

      <div className="outputs">
        <p className="headline">
          1リクエストあたり <strong>{fmt(r.whPerRequest)} Wh</strong>
          <span className="muted">（出力1,000トークンあたり {fmt(r.whPer1kOutputTokens)} Wh）</span>
        </p>
        <Breakdown
          parts={[
            { label: '入力', value: r.inputWh, className: 'c1' },
            { label: '出力', value: r.outputWh, className: 'c2' },
          ]}
        />
        <Results kwhPerMonth={r.kwhPerMonth} co2Factor={props.co2Factor} yenPerKwh={props.yenPerKwh} />
        <p className="note">
          計算式: 1トークン ≈ 2 × アクティブパラメータ数 FLOPs。所要時間 = FLOPs ÷（ピーク性能 × 利用率）、電力量 = 所要時間 × GPU消費電力 ×
          サーバー付帯係数 × PUE。KVキャッシュ・バッチ・量子化などは考慮しない粗い推計です。
        </p>
      </div>
    </section>
  );
}
