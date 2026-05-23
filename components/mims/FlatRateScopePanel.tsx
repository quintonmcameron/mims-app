"use client";

import { useState } from "react";
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
  complexity: FlatComplexity;
  revisionRounds: number;
  projectFee: string;
  suggestion: FlatRateSuggestion | null;
  onScopeChange: (patch: {
    flatUnitCount?: number;
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
  complexity,
  revisionRounds,
  projectFee,
  suggestion,
  onScopeChange,
  onProjectFeeChange,
}: FlatRateScopePanelProps) {
  const [expanded, setExpanded] = useState(false);
  const template = getFlatRateTemplate(role);
  if (!template) return null;

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
        {suggestion && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: expanded ? 12 : 0,
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
                  Target ${fmt(suggestion.target)} · ~{suggestion.estimatedDays} day
                  {suggestion.estimatedDays !== 1 ? "s" : ""} at ${fmt(laborDayRate)}/day
                </div>
                <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 2 }}>{suggestion.summary}</div>
              
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

        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            padding: expanded ? "12px 0 0" : suggestion ? "10px 0 0" : 0,
            border: "none",
            borderTop: expanded || suggestion ? "1px solid var(--border)" : "none",
            background: "transparent",
            color: "var(--gold)",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          <span>{expanded ? "Hide scope" : "Adjust scope"}</span>
          <span style={{ fontSize: 16, lineHeight: 1 }}>{expanded ? "▴" : "▾"}</span>
        </button>

        {expanded && (
          <div style={{ paddingTop: 14 }}>
            <CompactCounter
              label={template.unitLabelPlural}
              value={unitCount}
              onChange={(v) => onScopeChange({ flatUnitCount: v })}
            />

            <div style={{ marginTop: 14 }}>
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

            <div style={{ marginTop: 14 }}>
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
              <p className="helper" style={{ marginTop: 8 }}>
                Extra rounds beyond 2 add ~12% each. Uses the higher of your day-rate equivalent or market per{" "}
                {template.unitLabel}.
              </p>
            </div>
          </div>
        )}

        <div style={{ marginTop: 14 }}>
          <label
            style={{
              display: "block",
              fontSize: 13,
              fontWeight: 500,
              color: "var(--text-2)",
              marginBottom: 6,
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
      </div>
    
  );
}

function CompactCounter({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 8, fontWeight: 500 }}>
        # of {label}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button
          type="button"
          className="icon-btn"
          onClick={() => onChange(Math.max(1, value - 1))}
          aria-label="Decrease"
        >
          −
        </button>
        <span style={{ fontSize: 18, fontWeight: 700, minWidth: 36, textAlign: "center" }}>{value}</span>
        <button
          type="button"
          className="icon-btn"
          onClick={() => onChange(Math.min(200, value + 1))}
          aria-label="Increase"
        >
          +
        </button>
      </div>
    </div>
  );
}
