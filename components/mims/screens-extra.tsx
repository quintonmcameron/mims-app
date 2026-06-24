"use client";

import type { Dispatch, SetStateAction } from "react";
import {
  BUDGET_OPTIONS,
  DM_OPTIONS,
  LOADING_STEPS,
  PROJECT_OPTIONS,
  RUSH_OPTIONS,
  SOURCE_OPTIONS,
  USAGE_OPTIONS,
  USAGE_HELPER,
} from "@/components/mims/constants";
import { InvoicePreview, SowPreview } from "@/components/mims/documents";
import { ChipGroup, DealItem, IconBack, Seg, TabBar } from "@/components/mims/ui";
import {
  fmt,
  sampleDeals,
  verdictCardStyle,
  type Deal,
  type Recommendation,
  type ScreenId,
} from "@/lib/mims/engine";

const SCORE_CIRC = 2 * Math.PI * 44;

type Props = {
  screen: ScreenId;
  screenClass: (id: ScreenId) => string;
  go: (id: ScreenId) => void;
  showToast: (msg: string) => void;
  startNewDeal: () => void;
  dealStep: number;
  deal: Deal;
  setDeal: Dispatch<SetStateAction<Deal>>;
  dealNext: () => void;
  dealBack: () => void;
  runAnalysis: () => void;
  intelWhy: string;
  setIntelWhy: (v: string) => void;
  intelLtv: string;
  setIntelLtv: (v: string) => void;
  intelRoi: string;
  setIntelRoi: (v: string) => void;
  intelBudget: string;
  setIntelBudget: (v: string) => void;
  loadingStep: number;
  result: Recommendation | null;
  rateDetail: string;
  score: number;
  scoreOffset: number;
  loadSampleDeal: (key: string) => void;
  displayName: string;
  profileRole: string;
};

export function ExtraScreens({
  screen,
  screenClass,
  go,
  showToast,
  startNewDeal,
  dealStep,
  deal,
  setDeal,
  dealNext,
  dealBack,
  runAnalysis,
  intelWhy,
  setIntelWhy,
  intelLtv,
  setIntelLtv,
  intelRoi,
  setIntelRoi,
  intelBudget,
  setIntelBudget,
  loadingStep,
  result,
  rateDetail,
  score,
  scoreOffset,
  loadSampleDeal,
  displayName,
  profileRole,
}: Props) {
  return (
    <>
      <div className={screenClass("new-deal")}>
        <div className="topbar">
          <div className="left">
            <IconBack onClick={() => go("home")} />
          </div>
          <div className="title">New deal</div>
          <div className="right" style={{ fontSize: 12, color: "var(--text-3)" }}>
            {dealStep} / 3
          </div>
        </div>
        <div className="screen-pad">
          <div className="progress" style={{ marginBottom: 20 }}>
            <div style={{ width: `${dealStep * 33.33}%` }} />
          </div>
          {dealStep === 1 && (
            <>
              <h2>Who&apos;s the client?</h2>
              <p className="muted small" style={{ margin: "6px 0 16px" }}>
                Use what you already know about their brand when you answer the next steps.
              </p>
              <div className="field">
                <label>Company or contact name</label>
                <input
                  type="text"
                  value={deal.client}
                  onChange={(e) => setDeal((d) => ({ ...d, client: e.target.value }))}
                />
              </div>
              <div className="field">
                <label>How&apos;d they find you?</label>
                <Seg
                  options={SOURCE_OPTIONS}
                  value={deal.source}
                  onChange={(v) => setDeal((d) => ({ ...d, source: v }))}
                />
              </div>
              <div className="divider" />
              <button type="button" className="btn btn-primary" onClick={dealNext}>
                Continue
              </button>
            </>
          )}
          {dealStep === 2 && (
            <>
              <h2>What&apos;s the work?</h2>
              <ChipGroup
                options={PROJECT_OPTIONS}
                value={deal.project}
                onChange={(v) => setDeal((d) => ({ ...d, project: v as string }))}
              />
              <div className="row">
                <div className="field">
                  <label>Shoot days</label>
                  <input
                    type="number"
                    min={0}
                    value={deal.shootDays}
                    onChange={(e) =>
                      setDeal((d) => ({ ...d, shootDays: Number(e.target.value) }))
                    }
                  />
                </div>
                <div className="field">
                  <label>Edit days</label>
                  <input
                    type="number"
                    min={0}
                    value={deal.editDays}
                    onChange={(e) =>
                      setDeal((d) => ({ ...d, editDays: Number(e.target.value) }))
                    }
                  />
                </div>
              </div>
              <div className="field">
                <label>Deadline tightness</label>
                <Seg options={RUSH_OPTIONS} value={deal.rush} onChange={(v) => setDeal((d) => ({ ...d, rush: v }))} />
              </div>
              <div className="field">
                <label>Usage rights</label>
                <Seg options={USAGE_OPTIONS} value={deal.usage} onChange={(v) => setDeal((d) => ({ ...d, usage: v }))} />
                <div className="helper">{USAGE_HELPER[deal.usage] ?? USAGE_HELPER.organic}</div>
              </div>
              <div className="btn-row">
                <button type="button" className="btn btn-ghost" onClick={dealBack}>
                  Back
                </button>
                <button type="button" className="btn btn-primary" onClick={dealNext}>
                  Continue
                </button>
              </div>
            </>
          )}
          {dealStep === 3 && (
            <>
              <h2>Ask them this</h2>
              <div className="card" style={{ background: "var(--grad-soft)", borderColor: "rgba(232,197,122,0.3)" }}>
                <p style={{ margin: 0, fontSize: 14 }}>
                  &quot;Help me understand the business outcome — what does this video unlock for you in the next 12 months?&quot;
                </p>
              </div>
              <div className="field">
                <label>Why do they need this now?</label>
                <select value={intelWhy} onChange={(e) => setIntelWhy(e.target.value)}>
                  <option value="">— pick one —</option>
                  <option value="launch">Launching a product or service</option>
                  <option value="growth">Growth / paid ads need creative</option>
                </select>
              </div>
              <div className="field">
                <label>LTV or product price</label>
                <input value={intelLtv} onChange={(e) => setIntelLtv(e.target.value)} />
              </div>
              <div className="field">
                <label>Sales to pay for itself</label>
                <input value={intelRoi} onChange={(e) => setIntelRoi(e.target.value)} />
              </div>
              <div className="field">
                <label>Decision maker on the call?</label>
                <Seg options={DM_OPTIONS} value={deal.dm} onChange={(v) => setDeal((d) => ({ ...d, dm: v }))} />
              </div>
              <div className="field">
                <label>Their budget stance</label>
                <Seg
                  options={BUDGET_OPTIONS}
                  value={deal.budgetStance}
                  onChange={(v) => setDeal((d) => ({ ...d, budgetStance: v }))}
                />
              </div>
              <div className="field">
                <label>Their stated budget (if any)</label>
                <input value={intelBudget} onChange={(e) => setIntelBudget(e.target.value)} />
              </div>
              <div className="btn-row">
                <button type="button" className="btn btn-ghost" onClick={dealBack}>
                  Back
                </button>
                <button type="button" className="btn btn-primary" onClick={runAnalysis}>
                  Run analysis
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className={screenClass("loading")}>
        <div className="screen-pad">
          <div className="loading">
            <div className="spinner" />
            <h2>Building your playbook</h2>
            <ul className="loading-steps">
              {LOADING_STEPS.map((label, i) => {
                const stepNum = i + 1;
                const cls =
                  loadingStep > stepNum ? "done" : loadingStep === stepNum ? "active" : "";
                return (
                  <li key={label} className={cls}>
                    <span className="dot" />
                    {i === 1 ? `Researching ${deal.client || "the client"}…` : label}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      {result && (
        <div className={screenClass("deal-result")}>
          <div className="topbar">
            <div className="left">
              <IconBack onClick={() => go("home")} />
            </div>
            <div className="title">{deal.client}</div>
          </div>
          <div className="screen-pad">
            <div className="card center">
              <div className="score-circle">
                <svg viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="44" stroke="#26262F" strokeWidth={8} fill="none" />
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    stroke="url(#scoreGrad)"
                    strokeWidth={8}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={SCORE_CIRC}
                    strokeDashoffset={scoreOffset}
                  />
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#E8C57A" />
                      <stop offset="100%" stopColor="#FF7A66" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="score-label">
                  <div className="score-num">{score}</div>
                  <div className="score-cap">/ 10</div>
                </div>
              </div>
              <h3>{result.headline}</h3>
              <p className="muted small">{result.rationale}</p>
            </div>
            <div className="card" style={{ marginTop: 14 }}>
              <div className="big-num">${fmt(result.target)}</div>
              <p className="muted small">{rateDetail}</p>
            </div>
            <div className="card" style={{ marginTop: 14, ...verdictCardStyle(result.mood) }}>
              <p className="muted small">{result.verdict}</p>
            </div>
            <div className="btn-row" style={{ marginTop: 24 }}>
              <button type="button" className="btn btn-secondary" onClick={() => go("sow")}>
                Build SOW
              </button>
              <button type="button" className="btn btn-primary" onClick={() => go("invoice")}>
                Send invoice
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={screenClass("deals")}>
        <div className="scroll">
          <h1>Pipeline</h1>
          {(["summit", "rivian", "cousin"] as const).map((key) => {
            const s = sampleDeals[key];
            return (
              <DealItem
                key={key}
                initials={s.client.slice(0, 2).toUpperCase()}
                avatarStyle={{ background: "rgba(94,226,160,0.12)", color: "var(--success)" }}
                title={s.client}
                meta={s.scope ?? ""}
                badge={`${s.score}/10`}
                badgeClass="green"
                onClick={() => {
                  loadSampleDeal(key);
                  go("deal-result");
                }}
              />
            );
          })}
        </div>
        <TabBar active={screen} onNavigate={go} />
      </div>

      <div className={screenClass("library")}>
        <div className="scroll">
          <h1>Deal library</h1>
          <div className="card">
            <div className="eyebrow">Practical Deal Guidance</div>
            <h3>Your positioning library</h3>
            <p className="muted small" style={{ margin: "8px 0 0" }}>
              Original MIMS coaching — saved playbooks coming soon.
            </p>
          </div>
        </div>
        <TabBar active={screen} onNavigate={go} />
      </div>

      <div className={screenClass("profile")}>
        <div className="scroll">
          <div className="card center">
            <h2>{displayName}</h2>
            <p className="muted small">{profileRole}</p>
          </div>
          <button type="button" className="card" onClick={() => go("welcome")}>
            Re-take questionnaire
          </button>
        </div>
        <TabBar active={screen} onNavigate={go} />
      </div>

      <div className={screenClass("invoice")}>
        <div className="screen-pad">
          <InvoicePreview />
          <button type="button" className="btn btn-primary" onClick={() => showToast("Demo: invoice sent")}>
            Send
          </button>
        </div>
      </div>

      <div className={screenClass("sow")}>
        <div className="screen-pad">
          <SowPreview />
          <button type="button" className="btn btn-primary" onClick={() => showToast("Demo: SOW sent")}>
            Send for signature
          </button>
        </div>
      </div>
    </>
  );
}
