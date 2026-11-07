import { useState } from 'react';
import { IMAGE_WH, QUERY_PRESETS, SOURCES } from '../data/factors';
import { estimateChat } from '../lib/calc';
import { Results } from './Results';
import { Breakdown, NumberField, SourceLink, fmt } from './ui';

export function ChatEstimator(props: { co2Factor: number; yenPerKwh: number }) {
  const [presetId, setPresetId] = useState(QUERY_PRESETS[0].id);
  const [customWh, setCustomWh] = useState(QUERY_PRESETS[0].whPerQuery);
  const [queriesPerDay, setQueriesPerDay] = useState(20);
  const [imagesPerDay, setImagesPerDay] = useState(0);
  const [whPerImage, setWhPerImage] = useState(IMAGE_WH);
  const [daysPerMonth, setDaysPerMonth] = useState(30);

  const preset = QUERY_PRESETS.find((p) => p.id === presetId);
  const whPerQuery = preset ? preset.whPerQuery : customWh;
  const r = estimateChat({ queriesPerDay, whPerQuery, imagesPerDay, whPerImage, daysPerMonth });

  return (
    <section className="panel">
      <div className="inputs">
        <fieldset className="presets">
          <legend>1回あたりの電力量（テキスト）</legend>
          {QUERY_PRESETS.map((p) => (
            <label key={p.id} className={`chip ${presetId === p.id ? 'on' : ''}`}>
              <input type="radio" name="preset" checked={presetId === p.id} onChange={() => setPresetId(p.id)} />
              {p.label}
            </label>
          ))}
          <label className={`chip ${presetId === 'custom' ? 'on' : ''}`}>
            <input type="radio" name="preset" checked={presetId === 'custom'} onChange={() => setPresetId('custom')} />
            カスタム
          </label>
        </fieldset>
        {preset ? (
          <p className="note">
            {preset.note}
            {preset.source && (
              <>
                <br />
                出典: <SourceLink source={preset.source} />
              </>
            )}
          </p>
        ) : (
          <NumberField label="1回あたりの電力量" value={customWh} onChange={setCustomWh} unit="Wh" step={0.01} />
        )}

        <div className="grid">
          <NumberField label="1日のテキスト質問回数" value={queriesPerDay} onChange={setQueriesPerDay} unit="回/日" />
          <NumberField label="1日の画像生成枚数" value={imagesPerDay} onChange={setImagesPerDay} unit="枚/日" />
          <NumberField
            label="画像1枚あたりの電力量"
            value={whPerImage}
            onChange={setWhPerImage}
            unit="Wh"
            step={0.1}
            hint={
              <>
                既定値は 88 モデル平均 2.907 kWh/1000枚。モデル・解像度で大きく変わる。出典: <SourceLink source={SOURCES.luccioni} />
              </>
            }
          />
          <NumberField label="月あたり利用日数" value={daysPerMonth} onChange={setDaysPerMonth} unit="日" />
        </div>
      </div>

      <div className="outputs">
        <p className="headline">
          1日あたり <strong>{fmt(r.whPerDay)} Wh</strong>
        </p>
        <Breakdown
          parts={[
            { label: 'テキスト', value: r.textWhPerDay, className: 'c1' },
            { label: '画像', value: r.imageWhPerDay, className: 'c2' },
          ]}
        />
        <Results kwhPerMonth={r.kwhPerMonth} co2Factor={props.co2Factor} yenPerKwh={props.yenPerKwh} />
      </div>
    </section>
  );
}
