"use client";

import type { FlatComplexity, FlatRateSuggestion } from "@/lib/mims/flat-rate-scope";
import {
  FLAT_COMPLEXITY_OPTIONS,
  FLAT_REVISION_OPTIONS,
  getFlatRateTemplate,
} from "@/lib/mims/flat-rate-scope";

type FlatRateScopePanelProps = {
  role: string;
  laborDayRate: number;
  unitCount: number;
  estimatedDays: number;
  unitDerivedDays: number;
  complexity: FlatComplexity;
  revisionRounds: number;
  projectFee: string;
  suggestion: FlatRateSuggestion | null;
  onScopeChange: (patch: {
    flatUnitCount?: number;
    flatEstimatedDays?: number;
    flatComplexity?: FlatComplexity;
    flatRevisionRounds?: number;
  }) => void;
  onProjectFeeChange: (fee: string) => void;
};

function fmt(n: number): string {
  return n.toLocaleString("en-US");
}

export function FlatRateScopePanel({
  role,
  laborDayRate,
  unitCount,
  estimatedDays,
  unitDerivedDays,
  complexity,
  revisionRounds,
  projectFee,
  suggestion,
  onScopeChange,
  onProjectFeeChange,
}: FlatRateScopePanelProps) {
  const template = getFlatRateTemplate(role);
  if (!template) return null;

  const dayAnchorPreview = Math.round(estimatedDays * laborDayRate);

  return (
    <div
      style={{
        marginTop: 4,
        marginBottom: 14,
        padding: "14px 16px",
        borderRadius: 14,
        border: "1px solid rgba(232,197,122,0.22)",
        background: "rgba(232,197,122,0.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          marginBottom: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Scope & estimate</div>
          <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>
            Edit the fields below — your suggested fee updates live.
          </div>
        </div>
        <span className="badge gold" style={{ fontSize: 10, letterSpacing: "0.06em", flexShrink: 0 }}>
          Editable
        </span>
      </div>

      {suggestion && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 14,
            padding: "12px 14px",
            borderRadius: 12,
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 11,
                color: "var(--text-3)",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Suggested range
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.03em", marginTop: 4 }}>
              ${fmt(suggestion.floor)} – ${fmt(suggestion.stretch)}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 4, lineHeight: 1.45 }}>
              Target ${fmt(suggestion.target)} · {suggestion.summary}
            </div>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ width: "auto", padding: "10px 14px", fontSize: 13, flexShrink: 0 }}
            onClick={() => onProjectFeeChange(String(suggestion.target))}
          >
            Use ${fmt(suggestion.target)}
          </button>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
          marginBottom: 14,
        }}
      >
        <ScopeCounter
          label={`# of ${template.unitLabelPlural}`}
          value={unitCount}
          step={1}
          min={1}
          max={200}
          onChange={(v) => onScopeChange({ flatUnitCount: v })}
        />
        <ScopeCounter
          label="Working days"
          value={estimatedDays}
          step={0.5}
          min={0.5}
          max={60}
          onChange={(v) => onScopeChange({ flatEstimatedDays: v })}
        />
      </div>

      <p className="helper" style={{ marginTop: -6, marginBottom: 14 }}>
        Day-rate anchor: {estimatedDays} day{estimatedDays !== 1 ? "s" : ""} × ${fmt(laborDayRate)}/day ≈ $
        {fmt(dayAnchorPreview)}.
        {unitDerivedDays !== estimatedDays
          ? ` Deliverables suggest ~${unitDerivedDays} day${unitDerivedDays !== 1 ? "s" : ""} — bump working days if research, meetings, or rewrites need more.`
          : " Bump working days for research, meetings, or extra rewrites."}
      </p>

      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 8, fontWeight: 500 }}>
          Complexity
        </div>
        <div className="chips">
          {FLAT_COMPLEXITY_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`chip${complexity === opt.id ? " active" : ""}`}
              onClick={() => onScopeChange({ flatComplexity: opt.id })}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 4 }}>
        <div style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 8, fontWeight: 500 }}>
          Revision rounds included
        </div>
        <div className="chips">
          {FLAT_REVISION_OPTIONS.map((n) => (
            <button
              key={n}
              type="button"
              className={`chip${revisionRounds === n ? " active" : ""}`}
              onClick={() => onScopeChange({ flatRevisionRounds: n })}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <label
        style={{
          display: "block",
          fontSize: 13,
          fontWeight: 500,
          color: "var(--text-2)",
          marginBottom: 6,
          marginTop: 14,
        }}
      >
        Your project fee
      </label>
      <input
        type="text"
        inputMode="decimal"
        placeholder={suggestion ? `e.g. ${suggestion.target}` : "e.g. 3500"}
        value={projectFee}
        onChange={(e) => onProjectFeeChange(e.target.value)}
        style={{
          width: "100%",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: 14,
          color: "var(--text)",
          fontSize: 15,
          fontFamily: "inherit",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}

function ScopeCounter({
  label,
  value,
  step,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  step: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  const dec = () => onChange(Math.max(min, Math.round((value - step) * 2) / 2));
  const inc = () => onChange(Math.min(max, Math.round((value + step) * 2) / 2));
  const display = step < 1 ? value.toFixed(1).replace(/\.0$/, "") : String(value);

  return (
    <div
      style={{
        padding: "12px 12px",
        borderRadius: 12,
        border: "1px solid var(--border)",
        background: "var(--surface)",
      }}
    >
      <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 8, fontWeight: 600 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <button type="button" className="icon-btn" onClick={dec} aria-label={`Decrease ${label}`}>
          −
        </button>
        <span style={{ fontSize: 18, fontWeight: 700, minWidth: 36, textAlign: "center" }}>{display}</span>
        <button type="button" className="icon-btn" onClick={inc} aria-label={`Increase ${label}`}>
          +
        </button>
      </div>
    </div>
  );
}
