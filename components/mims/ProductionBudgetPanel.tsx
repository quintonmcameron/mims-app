"use client";

import { Fragment, useMemo, useState } from "react";
import {
  BUDGET_SECTIONS,
  budgetToTsv,
  buildBudgetRowsFromEstimate,
  buildBudgetSheetPayload,
  createManualBudgetRow,
  downloadBudgetCsv,
  grandTotal,
  sectionTotal,
  type BudgetRow,
  type BudgetSectionId,
  type BuildBudgetInput,
  type CrewSplitBudgetInput,
} from "@/lib/mims/budget-export";
import { exportBudgetToGoogleSheets, isGoogleSheetsConfigured } from "@/lib/mims/google-sheets";

function fmt(n: number): string {
  const hasCents = Math.round(n * 100) % 100 !== 0;
  return n.toLocaleString("en-US", {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  });
}

interface ProductionBudgetPanelProps {
  deal: {
    client: string;
    project: string;
    usage: string;
    scopeServices?: string[];
  };
  profile: {
    name: string;
    trade: string;
  };
  target: number;
  crewSplit: CrewSplitBudgetInput;
  scopeServiceLines: Array<{ label: string; amount: number }>;
  onToast: (message: string) => void;
}

const MANUAL_SECTIONS: BudgetSectionId[] = [
  "locations",
  "production-design",
  "production-essentials",
  "additional",
];

export function ProductionBudgetPanel({
  deal,
  profile,
  target,
  crewSplit,
  scopeServiceLines,
  onToast,
}: ProductionBudgetPanelProps) {
  const meta: BuildBudgetInput = useMemo(
    () => ({
      projectTitle: deal.project || deal.client || "Production",
      client: deal.client,
      directedBy: profile.name || "—",
      producedBy: profile.name || "—",
      usageLabel: deal.usage,
      scopeServiceLines,
      crewSplit,
      target,
    }),
    [crewSplit, deal.client, deal.project, deal.usage, profile.name, scopeServiceLines, target],
  );

  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<BudgetRow[]>(() => buildBudgetRowsFromEstimate(meta));
  const [directedBy, setDirectedBy] = useState(meta.directedBy);
  const [producedBy, setProducedBy] = useState(meta.producedBy);
  const [sheetsLoading, setSheetsLoading] = useState(false);
  const googleConfigured = isGoogleSheetsConfigured();

  const exportMeta = useMemo(
    () => ({ ...meta, directedBy, producedBy }),
    [directedBy, meta, producedBy],
  );

  const refreshFromEstimate = () => {
    setRows(buildBudgetRowsFromEstimate(meta));
    onToast("Budget refreshed from MIMS estimate");
  };

  const updateRow = (id: string, patch: Partial<BudgetRow>) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        const next = { ...row, ...patch };
        if (patch.rate !== undefined || patch.unit !== undefined) {
          const qty = parseFloat(String(next.unit).replace(/[^\d.]/g, "")) || 0;
          if (qty > 0 && next.rate > 0 && next.source === "manual") {
            next.budget = Math.round(qty * next.rate);
            if (patch.actual === undefined && patch.budget === undefined) {
              next.actual = next.budget;
            }
          }
        }
        return next;
      }),
    );
  };

  const addRow = (section: BudgetSectionId) => {
    setRows((prev) => [...prev, createManualBudgetRow(section)]);
  };

  const removeRow = (id: string) => {
    setRows((prev) => prev.filter((row) => row.id !== id));
  };

  const copyForSheets = async () => {
    await navigator.clipboard.writeText(budgetToTsv(rows, exportMeta));
    onToast("Budget copied — paste into Google Sheets (⌘V / Ctrl+V)");
  };

  const createInGoogleSheets = async () => {
    setSheetsLoading(true);
    try {
      const payload = buildBudgetSheetPayload(rows, exportMeta);
      const url = await exportBudgetToGoogleSheets(payload);
      window.open(url, "_blank", "noopener,noreferrer");
      onToast("Google Sheet created — opening in a new tab");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not create Google Sheet";
      onToast(message);
    } finally {
      setSheetsLoading(false);
    }
  };

  const budgetGrand = grandTotal(rows, "budget");
  const actualGrand = grandTotal(rows, "actual");

  const inputStyle = {
    width: "100%",
    background: "var(--elevated)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: "8px 10px",
    color: "var(--text)",
    fontSize: 12,
    fontFamily: "inherit",
    boxSizing: "border-box" as const,
  };

  return (
    <div className="card" style={{ marginTop: 14, padding: 0, overflow: "hidden" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 18px",
          background: "transparent",
          border: "none",
          color: "var(--text)",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div>
          <span className="eyebrow">Producer budget sheet</span>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--text-3)", lineHeight: 1.5 }}>
            Organize expenses for your client — budget vs. actual columns, export to Google Sheets.
          </p>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--text-3)"
          strokeWidth={2}
          style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div style={{ padding: "0 18px 18px", borderTop: "1px solid var(--border)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 600 }}>Directed by</label>
              <input
                value={directedBy}
                onChange={(e) => setDirectedBy(e.target.value)}
                style={{ ...inputStyle, marginTop: 4 }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 600 }}>Produced by</label>
              <input
                value={producedBy}
                onChange={(e) => setProducedBy(e.target.value)}
                style={{ ...inputStyle, marginTop: 4 }}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "14px 0" }}>
            <button
              type="button"
              className="btn btn-primary"
              style={{ flex: 1, minWidth: 180 }}
              disabled={!googleConfigured || sheetsLoading}
              onClick={createInGoogleSheets}
            >
              {sheetsLoading ? "Creating sheet…" : "Create in Google Sheets"}
            </button>
            <button type="button" className="btn btn-secondary" style={{ flex: 1, minWidth: 140 }} onClick={copyForSheets}>
              Copy for paste
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ flex: 1, minWidth: 140 }}
              onClick={() => {
                downloadBudgetCsv(rows, exportMeta);
                onToast("CSV downloaded — import via File → Import in Sheets");
              }}
            >
              Download CSV
            </button>
            <button type="button" className="btn btn-secondary" style={{ minWidth: 120 }} onClick={refreshFromEstimate}>
              Refresh from estimate
            </button>
          </div>

          {!googleConfigured && (
            <div
              style={{
                marginBottom: 14,
                padding: "12px 14px",
                borderRadius: 10,
                border: "1px solid rgba(232,197,122,0.25)",
                background: "rgba(232,197,122,0.06)",
                fontSize: 12,
                color: "var(--text-2)",
                lineHeight: 1.65,
              }}
            >
              <strong style={{ color: "var(--gold)" }}>One-time Google setup</strong> — add{" "}
              <code style={{ fontSize: 11 }}>NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> to enable live Sheets export:
              <ol style={{ margin: "8px 0 0", paddingLeft: 18 }}>
                <li>Create a project at Google Cloud Console</li>
                <li>Enable the <strong>Google Sheets API</strong></li>
                <li>Create an OAuth <strong>Web client</strong> ID</li>
                <li>Add authorized origins: <code style={{ fontSize: 11 }}>http://localhost:3000</code> and your Vercel URL</li>
                <li>Set the client ID in Vercel env vars and redeploy</li>
              </ol>
            </div>
          )}

          <div style={{ overflowX: "auto", border: "1px solid var(--border)", borderRadius: 12 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 720 }}>
              <thead>
                <tr style={{ background: "var(--elevated)" }}>
                  {["Production", "Unit", "Rate", "Budget", "Actual / Additional", "Notes", ""].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: "10px 8px",
                        color: "var(--text-3)",
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        fontSize: 10,
                        borderBottom: "1px solid var(--border)",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {BUDGET_SECTIONS.map((section) => {
                  const sectionRows = rows.filter((r) => r.section === section.id);
                  const showSection = sectionRows.length > 0 || MANUAL_SECTIONS.includes(section.id);
                  if (!showSection) return null;

                  return (
                    <Fragment key={section.id}>
                      <tr style={{ background: "rgba(255,255,255,0.04)" }}>
                        <td colSpan={7} style={{ padding: "10px 8px", fontWeight: 700, letterSpacing: "0.08em" }}>
                          {section.label}
                          <button
                            type="button"
                            onClick={() => addRow(section.id)}
                            style={{
                              marginLeft: 10,
                              padding: "2px 8px",
                              borderRadius: 6,
                              border: "1px solid var(--border)",
                              background: "var(--surface)",
                              color: "var(--gold)",
                              fontSize: 11,
                              cursor: "pointer",
                            }}
                          >
                            + Add line
                          </button>
                        </td>
                      </tr>
                      {sectionRows.map((row) => (
                        <tr key={row.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                          <td style={{ padding: "8px", minWidth: 160 }}>
                            {row.source === "manual" ? (
                              <input
                                value={row.item}
                                onChange={(e) => updateRow(row.id, { item: e.target.value })}
                                placeholder="Line item"
                                style={inputStyle}
                              />
                            ) : (
                              row.item
                            )}
                          </td>
                          <td style={{ padding: "8px", width: 72 }}>
                            {row.source === "manual" ? (
                              <input
                                value={row.unit}
                                onChange={(e) => updateRow(row.id, { unit: e.target.value })}
                                style={inputStyle}
                              />
                            ) : (
                              row.unit
                            )}
                          </td>
                          <td style={{ padding: "8px", width: 88 }}>
                            {row.source === "manual" ? (
                              <input
                                type="number"
                                value={row.rate || ""}
                                onChange={(e) => updateRow(row.id, { rate: Number(e.target.value) || 0 })}
                                style={inputStyle}
                              />
                            ) : (
                              `$${fmt(row.rate)}`
                            )}
                          </td>
                          <td style={{ padding: "8px", width: 88, fontWeight: 600 }}>${fmt(row.budget)}</td>
                          <td style={{ padding: "8px", width: 100 }}>
                            <input
                              type="number"
                              value={row.actual || ""}
                              onChange={(e) => updateRow(row.id, { actual: Number(e.target.value) || 0 })}
                              style={{ ...inputStyle, borderColor: "rgba(232,197,122,0.35)" }}
                            />
                          </td>
                          <td style={{ padding: "8px", minWidth: 100 }}>
                            <input
                              value={row.notes}
                              onChange={(e) => updateRow(row.id, { notes: e.target.value })}
                              placeholder="Name / status"
                              style={inputStyle}
                            />
                          </td>
                          <td style={{ padding: "8px", width: 32 }}>
                            {row.source === "manual" && (
                              <button
                                type="button"
                                onClick={() => removeRow(row.id)}
                                style={{ background: "none", border: "none", color: "var(--text-3)", cursor: "pointer", fontSize: 16 }}
                                aria-label="Remove row"
                              >
                                ×
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {sectionRows.length > 0 && (
                        <tr style={{ background: "rgba(232,197,122,0.06)" }}>
                          <td colSpan={3} style={{ padding: "8px", fontWeight: 700 }}>
                            TOTAL
                          </td>
                          <td style={{ padding: "8px", fontWeight: 700 }}>${fmt(sectionTotal(rows, section.id, "budget"))}</td>
                          <td style={{ padding: "8px", fontWeight: 700, color: "var(--gold)" }}>
                            ${fmt(sectionTotal(rows, section.id, "actual"))}
                          </td>
                          <td colSpan={2} />
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
                <tr style={{ background: "rgba(255,255,255,0.06)" }}>
                  <td colSpan={3} style={{ padding: "12px 8px", fontWeight: 800, letterSpacing: "0.06em" }}>
                    GRAND TOTAL
                  </td>
                  <td style={{ padding: "12px 8px", fontWeight: 800 }}>${fmt(budgetGrand)}</td>
                  <td style={{ padding: "12px 8px", fontWeight: 800, color: "var(--gold)" }}>${fmt(actualGrand)}</td>
                  <td colSpan={2} />
                </tr>
              </tbody>
            </table>
          </div>

          <p style={{ margin: "12px 0 0", fontSize: 11, color: "var(--text-3)", lineHeight: 1.6 }}>
            Tip: Use <strong style={{ color: "var(--text-2)", fontWeight: 600 }}>Actual / Additional</strong> for what you paid or what the client sees — like your spreadsheet, it can differ from Budget (rate × unit). Add locations, props, and craft services with + Add line.
          </p>
        </div>
      )}
    </div>
  );
}
