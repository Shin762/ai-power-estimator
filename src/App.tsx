import { useState } from 'react';
import { ApiEstimator } from './components/ApiEstimator';
import { ChatEstimator } from './components/ChatEstimator';
import { NumberField, SourceLink } from './components/ui';
import { DEFAULT_CO2_KG_PER_KWH, DEFAULT_YEN_PER_KWH, SOURCES } from './data/factors';

type Tab = 'chat' | 'api';

export default function App() {
  const [tab, setTab] = useState<Tab>('chat');
  const [co2Factor, setCo2Factor] = useState(DEFAULT_CO2_KG_PER_KWH);
  const [yenPerKwh, setYenPerKwh] = useState(DEFAULT_YEN_PER_KWH);

  return (
    <main className="app">
      <header>
        <h1>AI電力試算</h1>
        <p className="lead">AIの利用量から、推論にかかる電力量・CO₂排出量・電気代換算を概算します。</p>
      </header>

      <nav className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'chat'} className={tab === 'chat' ? 'on' : ''} onClick={() => setTab('chat')}>
          個人のチャット利用
        </button>
        <button role="tab" aria-selected={tab === 'api'} className={tab === 'api' ? 'on' : ''} onClick={() => setTab('api')}>
          API / トークン単位
        </button>
      </nav>

      {tab === 'chat' ? (
        <ChatEstimator co2Factor={co2Factor} yenPerKwh={yenPerKwh} />
      ) : (
        <ApiEstimator co2Factor={co2Factor} yenPerKwh={yenPerKwh} />
      )}

      <section className="panel common">
        <h2>換算係数</h2>
        <div className="grid">
          <NumberField
            label="CO₂排出係数"
            value={co2Factor}
            onChange={setCo2Factor}
            unit="kg-CO₂/kWh"
            step={0.01}
            hint={
              <>
                既定値 0.42 は日本の全国平均係数（約0.42〜0.44 t-CO₂/MWh）を丸めた目安。実際のデータセンターの所在地・電源構成で大きく変わる（Google は再エネ調達込みで 0.03 g/プロンプトと報告）。参照:{' '}
                <SourceLink source={SOURCES.jpCo2} />
              </>
            }
          />
          <NumberField
            label="電気料金単価"
            value={yenPerKwh}
            onChange={setYenPerKwh}
            unit="円/kWh"
            hint={
              <>
                家庭の電気代に置き換えた場合の目安（利用者が実際に払う金額ではない）。出典: <SourceLink source={SOURCES.jpPrice} />
              </>
            }
          />
        </div>
      </section>

      <footer>
        <h2>前提と注意</h2>
        <ul>
          <li>対象は推論（利用時）の電力のみ。モデルの学習、端末・通信ネットワーク、データ保存の電力は含みません。</li>
          <li>公表値は各社の自己申告または外部推計で、算定範囲が揃っていません。桁感をつかむための概算として使ってください。</li>
          <li>LED電球 8W・スマートフォン充電 15Wh/回 は比較用の仮定値です。</li>
        </ul>
        <h2>出典</h2>
        <ul className="sources">
          {Object.values(SOURCES).map((s) => (
            <li key={s.url}>
              <SourceLink source={s} />
            </li>
          ))}
        </ul>
      </footer>
    </main>
  );
}
