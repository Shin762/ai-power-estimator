import type { ReactNode } from 'react';
import type { Source } from '../data/factors';

export function NumberField(props: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  unit?: string;
  step?: number;
  min?: number;
  hint?: ReactNode;
}) {
  const { label, value, onChange, unit, step = 1, min = 0, hint } = props;
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <span className="field-input">
        <input
          type="number"
          value={Number.isFinite(value) ? value : ''}
          step={step}
          min={min}
          onChange={(e) => {
            const v = e.target.valueAsNumber;
            onChange(Number.isFinite(v) ? Math.max(min, v) : 0);
          }}
        />
        {unit && <span className="unit">{unit}</span>}
      </span>
      {hint && <span className="hint">{hint}</span>}
    </label>
  );
}

export function Stat(props: { label: string; value: string; unit: string; sub?: string }) {
  return (
    <div className="stat">
      <div className="stat-label">{props.label}</div>
      <div className="stat-value">
        {props.value}
        <span className="stat-unit">{props.unit}</span>
      </div>
      {props.sub && <div className="stat-sub">{props.sub}</div>}
    </div>
  );
}

export function SourceLink({ source }: { source: Source }) {
  return (
    <a href={source.url} target="_blank" rel="noreferrer">
      {source.label}（{source.date}）
    </a>
  );
}

/** Horizontal stacked bar of energy parts. */
export function Breakdown({ parts }: { parts: { label: string; value: number; className: string }[] }) {
  const total = parts.reduce((s, p) => s + p.value, 0);
  if (total <= 0) return null;
  return (
    <div className="breakdown">
      <div className="bar">
        {parts.map((p) => (
          <div key={p.label} className={`seg ${p.className}`} style={{ width: `${(p.value / total) * 100}%` }} />
        ))}
      </div>
      <ul className="legend">
        {parts.map((p) => (
          <li key={p.label}>
            <span className={`swatch ${p.className}`} />
            {p.label} {fmt(p.value)} Wh（{Math.round((p.value / total) * 100)}%）
          </li>
        ))}
      </ul>
    </div>
  );
}

export function fmt(n: number, digits?: number): string {
  if (!Number.isFinite(n)) return '—';
  const d = digits ?? (Math.abs(n) >= 100 ? 0 : Math.abs(n) >= 10 ? 1 : Math.abs(n) >= 1 ? 2 : 3);
  return n.toLocaleString('ja-JP', { minimumFractionDigits: 0, maximumFractionDigits: d });
}
