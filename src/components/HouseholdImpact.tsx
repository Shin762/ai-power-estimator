import { useState } from 'react';
import {
  AREAS,
  DEFAULT_GRID_ASSUMPTIONS,
  DEFAULT_HOUSEHOLD_KWH_PER_MONTH,
  GRID_SOURCES,
  YEARS,
  dcAreaShare,
  type GridAssumptions,
  type Year,
} from '../data/grid';
import { NO_MITIGATION, defaultDcKw, estimateHousehold, type Mitigation } from '../lib/household';
import { NumberField, SelectField, ShareSlider, SourceLink, Stat, fmt } from './ui';

export function HouseholdImpact() {
  const [areaId, setAreaId] = useState('tokyo');
  const [year, setYear] = useState<Year>(2035);
  const [householdKwh, setHouseholdKwh] = useState(DEFAULT_HOUSEHOLD_KWH_PER_MONTH);
  const [dcOverrideManKw, setDcOverrideManKw] = useState<number | null>(null);
  const [mitigation, setMitigation] = useState<Mitigation>({ loadShift: 0.3, distributed: 0.5 });
  const [a, setA] = useState<GridAssumptions>(DEFAULT_GRID_ASSUMPTIONS);

  const area = AREAS.find((x) => x.id === areaId)!;
  const estimatedManKw = defaultDcKw(areaId, year) / 1e4;
  const dcManKw = dcOverrideManKw ?? estimatedManKw;
  const input = { areaId, year, householdKwhPerMonth: householdKwh, dcKw: dcManKw * 1e4 };

  const before = estimateHousehold(input, a, NO_MITIGATION);
  const after = estimateHousehold(input, a, mitigation);
  const saved = before.yenPerMonth - after.yenPerMonth;

  const setAField = (k: keyof GridAssumptions) => (v: number) => setA((x) => ({ ...x, [k]: v }));

  return (
    <section className="panel">
      <div className="inputs">
        <p className="note">
          データセンターの新増設で増える電力需要が、送配電網の増強費と供給力確保の費用（容量市場）を通じて、家庭の電気料金にどれだけ上乗せされうるかを概算します。
        </p>
        <div className="grid">
          <SelectField
            label="エリア"
            value={areaId}
            options={AREAS.map((x) => ({ value: x.id, label: x.label }))}
            onChange={(v) => {
              setAreaId(v);
              setDcOverrideManKw(null);
            }}
          />
          <SelectField
            label="対象年度"
            value={year}
            options={YEARS.map((y) => ({ value: y, label: `${y}年度` }))}
            onChange={(v) => {
              setYear(v);
              setDcOverrideManKw(null);
            }}
          />
          <NumberField
            label="世帯の月間使用量"
            value={householdKwh}
            onChange={setHouseholdKwh}
            unit="kWh/月"
            step={10}
            hint="既定値 260 kWh は大手電力会社が料金比較に使う標準的な家庭の目安（仮定）。検針票の値に置き換えてください。"
          />
          <NumberField
            label="エリアのデータセンター追加需要"
            value={Math.round(dcManKw * 10) / 10}
            onChange={setDcOverrideManKw}
            unit="万kW"
            step={10}
            hint={
              <>
                {area.hasIndividualDc ? (
                  <>
                    推計値 {fmt(estimatedManKw)} 万kW = 全国のデータセンター個別計上値 × エリア配分 {fmt(dcAreaShare(areaId) * 100, 1)}
                    %。配分は「産業用その他」の需要の伸び（2026→2035年度）による代理推計で、半導体工場などの影響も含む。
                  </>
                ) : (
                  <>このエリアは OCCTO の想定でデータセンター・半導体工場の個別計上がないため、推計値は 0。誘致を想定する場合は値を入力してください。</>
                )}{' '}
                出典: <SourceLink source={GRID_SOURCES.occtoDemand} />
              </>
            }
          />
        </div>
        {dcOverrideManKw !== null && (
          <button type="button" className="reset" onClick={() => setDcOverrideManKw(null)}>
            推計値に戻す
          </button>
        )}

        <h3 className="subhead">対策シナリオ</h3>
        <div className="grid">
          <ShareSlider
            label="負荷シフト"
            value={mitigation.loadShift}
            onChange={(v) => setMitigation((m) => ({ ...m, loadShift: v }))}
            hint="AI企業がピーク時間帯の計算を夜間や再エネ余剰時間帯に移す割合。供給力確保の費用が下がる。"
          />
          <ShareSlider
            label="地方分散"
            value={mitigation.distributed}
            onChange={(v) => setMitigation((m) => ({ ...m, distributed: v }))}
            hint="系統に空き容量のある地点（地方型データセンター・エッジ）に置く割合。送配電網の増強費が下がる。"
          />
        </div>

        <details className="advanced">
          <summary>試算の前提（公的な数値がない仮定値）</summary>
          <div className="grid">
            <NumberField
              label="系統増強単価"
              value={a.gridCostYenPerKw}
              onChange={setAField('gridCostYenPerKw')}
              unit="円/kW"
              step={10000}
              hint="仮定。データセンター1kWあたりの変電所・送電線の増強費。"
            />
            <NumberField
              label="一般負担率"
              value={a.generalShare}
              onChange={setAField('generalShare')}
              step={0.05}
              hint="仮定。増強費のうち託送料金で全需要家が負担する割合（残りはデータセンター側の工事費負担金）。"
            />
            <NumberField
              label="年経費率"
              value={a.annualCostRate}
              onChange={setAField('annualCostRate')}
              step={0.01}
              hint="仮定。投資額に対する毎年の減価償却・事業報酬・維持費の割合。"
            />
            <NumberField
              label="空き容量地点の増強費比率"
              value={a.welcomeZoneCostRatio}
              onChange={setAField('welcomeZoneCostRatio')}
              step={0.05}
              hint="仮定。地方分散した分の増強費が既定の何倍で済むか。"
            />
            <NumberField
              label="容量価格の需要弾力性"
              value={a.capacityElasticity}
              onChange={setAField('capacityElasticity')}
              step={0.1}
              hint="仮定。ピーク需要が1%増えたとき、容量市場の価格が何%上がるか。"
            />
            <NumberField
              label="ピーク同時率"
              value={a.peakCoincidence}
              onChange={setAField('peakCoincidence')}
              step={0.05}
              hint="仮定。データセンターは24時間ほぼ一定で動くため、既定は1（ピーク時にも全量が重なる）。"
            />
          </div>
          <p className="note">
            容量市場の価格は {area.capacityYenPerKw ? `${fmt(area.capacityYenPerKw)} 円/kW` : '対象外（沖縄）'}（{area.label}
            エリア、2029年度）。出典: <SourceLink source={GRID_SOURCES.capacityMarket} />
          </p>
          <button type="button" className="reset" onClick={() => setA(DEFAULT_GRID_ASSUMPTIONS)}>
            前提を既定値に戻す
          </button>
        </details>
      </div>

      <div className="outputs">
        <p className="headline">
          家庭の電気代 <strong>+{fmt(after.yenPerMonth, 1)} 円/月</strong>
          <span className="muted">（対策なし +{fmt(before.yenPerMonth, 1)} 円/月）</span>
        </p>
        <CompareBars before={before.yenPerMonth} after={after.yenPerMonth} />
        <div className="stats">
          <Stat label="対策による抑制" value={fmt(saved, 1)} unit="円/月" sub={`年間 ${fmt(saved * 12, 0)} 円`} />
          <Stat label="単価の上昇" value={fmt(after.yenPerKwh, 3)} unit="円/kWh" sub={`送配電 ${fmt(after.gridYenPerKwh, 3)} ／ 容量 ${fmt(after.capacityYenPerKwh, 3)}`} />
          <Stat
            label="エリア全体の負担"
            value={fmt(after.areaYenPerYear / 1e8, 1)}
            unit="億円/年"
            sub={`対策なし ${fmt(before.areaYenPerYear / 1e8, 1)} 億円/年`}
          />
          <Stat
            label="ピーク需要に占める割合"
            value={fmt(before.dcPeakShare * 100, 1)}
            unit="%"
            sub={`${area.label}エリアの最大需要 ${fmt(area.peakSenKw[YEARS.indexOf(year)] / 10)} 万kW`}
          />
        </div>
        <p className="note">
          計算式: 送配電分 = 追加需要 × 増強単価 × 立地係数 × 一般負担率 × 年経費率 ÷ エリア需要電力量。容量分 = 容量価格 × 弾力性 ×
          ピークに重なる追加需要 ÷ エリア需要電力量。家庭の負担 = 単価の上昇 × 月間使用量。
        </p>
        <p className="note">
          卸電力価格の上昇、データセンター以外の要因（資材費・人件費など）は含みません。2026年11月からの託送料金改定（8社で5年間 約8,845億円の増収申請）は主に資材費・労務費の上昇によるもので、この試算の「データセンター由来の分」とは別物です。参照:{' '}
          <SourceLink source={GRID_SOURCES.takusou} />
        </p>
      </div>
    </section>
  );
}

function CompareBars({ before, after }: { before: number; after: number }) {
  const max = Math.max(before, after);
  if (max <= 0) return null;
  const rows = [
    { label: '対策なし', value: before, className: 'c2' },
    { label: '対策あり', value: after, className: 'c1' },
  ];
  return (
    <div className="compare-bars">
      {rows.map((r) => (
        <div key={r.label} className="compare-row">
          <span className="compare-label">{r.label}</span>
          <div className="compare-track">
            <div className={`seg ${r.className}`} style={{ width: `${(r.value / max) * 100}%` }} />
          </div>
          <span className="compare-value">{fmt(r.value, 1)} 円</span>
        </div>
      ))}
    </div>
  );
}
