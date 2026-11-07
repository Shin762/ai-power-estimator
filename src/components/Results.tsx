import { COMPARISONS } from '../data/factors';
import { co2Kg, costYen } from '../lib/calc';
import { fmt, Stat } from './ui';

/** Shared result block: monthly/yearly energy, CO2, cost and everyday comparisons. */
export function Results(props: { kwhPerMonth: number; co2Factor: number; yenPerKwh: number }) {
  const { kwhPerMonth, co2Factor, yenPerKwh } = props;
  const kwhPerYear = kwhPerMonth * 12;
  const whPerMonth = kwhPerMonth * 1000;
  return (
    <>
      <div className="stats">
        <Stat label="月間電力量" value={fmt(kwhPerMonth)} unit="kWh" sub={`年間 ${fmt(kwhPerYear)} kWh`} />
        <Stat
          label="月間CO₂"
          value={fmt(co2Kg(kwhPerMonth, co2Factor) * 1000)}
          unit="g"
          sub={`年間 ${fmt(co2Kg(kwhPerYear, co2Factor))} kg`}
        />
        <Stat
          label="電気代換算（月）"
          value={fmt(costYen(kwhPerMonth, yenPerKwh), 1)}
          unit="円"
          sub={`年間 ${fmt(costYen(kwhPerYear, yenPerKwh), 0)} 円`}
        />
      </div>
      <p className="compare">
        月間の電力量は、LED電球（{COMPARISONS.ledBulbW}W）を約 <strong>{fmt(whPerMonth / COMPARISONS.ledBulbW, 1)} 時間</strong>
        点灯、スマートフォンを約 <strong>{fmt(whPerMonth / COMPARISONS.smartphoneChargeWh, 1)} 回</strong>
        フル充電するのと同程度です。
      </p>
    </>
  );
}
