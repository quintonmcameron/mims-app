"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import "@/app/mims-prototype.css";
import {
  BUDGET_OPTIONS,
  DEMO_PROFILE,
  DM_OPTIONS,
  EXP_OPTIONS,
  EXTRA_OPTIONS,
  LOADING_STEPS,
  PROJECT_OPTIONS,
  RUSH_OPTIONS,
  SKILL_OPTIONS,
  SOURCE_OPTIONS,
  TRADE_OPTIONS,
  USAGE_OPTIONS,
} from "@/components/mims/constants";
import { InvoicePreview, SowPreview } from "@/components/mims/documents";
import { ExtraScreens } from "@/components/mims/screens-extra";
import { ChipGroup, DealItem, IconBack, Seg, TabBar } from "@/components/mims/ui";
import {
  computeRecommendation,
  defaultDeal,
  defaultProfile,
  fmt,
  sampleDeals,
  tradeLabel,
  verdictCardStyle,
  type Deal,
  type Profile,
  type Recommendation,
  type ScreenId,
} from "@/lib/mims/engine";

function screenClass(current: ScreenId, id: ScreenId) {
  return `screen${current === id ? " active" : ""}`;
}

const SCORE_CIRC = 2 * Math.PI * 44;

export default function MimsPrototype() {
  const [screen, setScreen] = useState<ScreenId>("welcome");
  const [setupStep, setSetupStep] = useState(1);
  const [dealStep, setDealStep] = useState(1);
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [deal, setDeal] = useState<Deal>({
    ...defaultDeal,
    client: "Summit Coffee Co.",
  });
  const [result, setResult] = useState<Recommendation | null>(null);
  const [rateDetail, setRateDetail] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const analysisDealRef = useRef<Deal>(defaultDeal);

  const [setupName, setSetupName] = useState("");
  const [setupEmail, setSetupEmail] = useState("");
  const [setupLocation, setSetupLocation] = useState("");
  const [intelWhy, setIntelWhy] = useState("");
  const [intelLtv, setIntelLtv] = useState("$1,200 LTV");
  const [intelRoi, setIntelRoi] = useState("200 new monthly subscribers");
  const [intelBudget, setIntelBudget] = useState("$6,000–$8,000");

  const displayName = profile.name || "Quinton Cameron";
  const homeFirst = displayName.split(" ")[0];
  const profileRole =
    [tradeLabel(profile.trade), profile.location].filter(Boolean).join(" · ") ||
    "Videographer · Atlanta, GA";

  const go = useCallback((id: ScreenId) => {
    setScreen(id);
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 2400);
  }, []);

  const loadDemoAndGo = useCallback(
    (target: ScreenId) => {
      setProfile({ ...defaultProfile, ...DEMO_PROFILE });
      go(target);
    },
    [go],
  );

  const loadSampleDeal = useCallback(
    (key: string) => {
      const s = sampleDeals[key];
      if (!s) return;
      setDeal((d) => ({ ...d, client: s.client }));
      setResult(s);
      setRateDetail(s.scope ?? "");
    },
    [],
  );

  const applyResult = useCallback((r: Recommendation, scope?: string) => {
    setResult(r);
    setRateDetail(
      scope ??
        `${deal.shootDays} shoot day${deal.shootDays === 1 ? "" : "s"} + ${deal.editDays} edit day${deal.editDays === 1 ? "" : "s"} · ${deal.usage} usage`,
    );
  }, [deal.editDays, deal.shootDays, deal.usage]);

  const setupNext = () => {
    if (setupStep === 1 && !profile.trade) {
      showToast("Pick a trade to continue");
      return;
    }
    if (setupStep === 2 && (!profile.experience || !profile.skill)) {
      showToast("Pick experience and skill level");
      return;
    }
    if (setupStep === 3) {
      setProfile((p) => ({ ...p, location: setupLocation.trim() }));
    }
    setSetupStep((s) => Math.min(4, s + 1));
  };

  const setupBack = () => setSetupStep((s) => Math.max(1, s - 1));

  const finishSetup = () => {
    setProfile((p) => ({
      ...p,
      name: setupName.trim() || "Freelancer",
      email: setupEmail.trim(),
    }));
    go("home");
    showToast("Profile saved · your fair rate is ready");
  };

  const startNewDeal = () => {
    setDealStep(1);
    go("new-deal");
  };

  const dealNext = () => {
    if (dealStep === 1 && !deal.client.trim()) {
      showToast("Add the client name");
      return;
    }
    setDealStep((s) => Math.min(3, s + 1));
  };

  const dealBack = () => setDealStep((s) => Math.max(1, s - 1));

  const runAnalysis = () => {
    const nextDeal: Deal = {
      ...deal,
      why: intelWhy,
      ltv: intelLtv,
      roi: intelRoi,
      budget: intelBudget,
    };
    analysisDealRef.current = nextDeal;
    setDeal(nextDeal);
    setLoadingStep(0);
    go("loading");
  };

  useEffect(() => {
    if (screen !== "loading") return;

    const timeouts: ReturnType<typeof setTimeout>[] = [];
    let step = 0;

    const tick = () => {
      setLoadingStep(step);
      if (step < LOADING_STEPS.length) {
        step += 1;
        timeouts.push(setTimeout(tick, 650));
      } else {
        timeouts.push(
          setTimeout(() => {
            applyResult(computeRecommendation(profile, analysisDealRef.current));
            go("deal-result");
          }, 350),
        );
      }
    };

    timeouts.push(setTimeout(tick, 0));
    return () => timeouts.forEach(clearTimeout);
  }, [screen, profile, deal, applyResult, go]);

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );

  const score = result?.score ?? 8;
  const scoreOffset = SCORE_CIRC * (1 - score / 10);

  return (
    <div className="mims-shell">
      <div className="app">
        {/* Welcome */}
        <div className={screenClass(screen, "welcome")}>
          <div className="screen-pad no-pad-bottom" style={{ padding: 0 }}>
            <div className="welcome-hero">
              <div className="welcome-mark">M</div>
              <div className="eyebrow" style={{ marginBottom: 14 }}>
                MIMS · v0.1
              </div>
              <h1>
                Charge what you&apos;re worth.
                <br />
                Close the deal.
              </h1>
              <p className="muted" style={{ margin: "14px 0 0", fontSize: 15 }}>
                Educational pricing and deal-prep estimates for freelancers.
                <br />
                Built for the people doing the work.
              </p>
            </div>
            <div className="welcome-features">
              {[
                {
                  title: "Fair-market rate, not friend pricing",
                  desc: "Freelance market rate estimates for your trade, experience, and city.",
                  icon: (
                    <path d="M12 1v22M5 8h11.5a3.5 3.5 0 010 7H7.5a3.5 3.5 0 000 7H19" />
                  ),
                },
                {
                  title: "0–10 close-likelihood score",
                  desc: "Honest read on whether this deal is worth your time.",
                  icon: (
                    <>
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7v5l3 2" />
                    </>
                  ),
                },
                {
                  title: "Original deal guidance",
                  desc: "MIMS negotiation coaching — draft talking points you adapt before the meeting.",
                  icon: (
                    <>
                      <path d="M3 7h13M3 12h18M3 17h13" />
                      <path d="M19 4v6M22 7h-6" />
                    </>
                  ),
                },
                {
                  title: "Invoice + SOW in one tap",
                  desc: "Send a real scope of work so nothing's left on the table.",
                  icon: (
                    <>
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                      <path d="M14 2v6h6M9 13h6M9 17h4" />
                    </>
                  ),
                },
              ].map((f) => (
                <div key={f.title} className="feature">
                  <div className="ico">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      {f.icon}
                    </svg>
                  </div>
                  <div>
                    <h4>{f.title}</h4>
                    <p>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: "8px 20px 32px" }}>
              <button type="button" className="btn btn-primary" onClick={() => go("profile-setup")}>
                Set up my profile
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                style={{ marginTop: 10 }}
                onClick={() => loadDemoAndGo("home")}
              >
                Skip — try the demo
              </button>
            </div>
          </div>
        </div>

        {/* Profile setup */}
        <div className={screenClass(screen, "profile-setup")}>
          <div className="topbar">
            <div className="left">
              <IconBack onClick={() => go("welcome")} />
            </div>
            <div className="title">About you</div>
            <div className="right" style={{ fontSize: 12, color: "var(--text-3)" }}>
              {setupStep} / 4
            </div>
          </div>
          <div className="screen-pad">
            <div className="progress" style={{ marginBottom: 20 }}>
              <div style={{ width: `${setupStep * 25}%` }} />
            </div>

            {setupStep === 1 && (
              <>
                <h2>What&apos;s your trade?</h2>
                <p className="muted small" style={{ margin: "6px 0 18px" }}>
                  Pick the one you&apos;re charging for. You can add others later.
                </p>
                <ChipGroup
                  options={TRADE_OPTIONS}
                  value={profile.trade}
                  onChange={(v) => setProfile((p) => ({ ...p, trade: v as string }))}
                />
                <div className="divider" />
                <button type="button" className="btn btn-primary" onClick={setupNext}>
                  Continue
                </button>
              </>
            )}

            {setupStep === 2 && (
              <>
                <h2>How long have you been doing this?</h2>
                <p className="muted small" style={{ margin: "6px 0 18px" }}>
                  Be honest — the rate engine is too.
                </p>
                <ChipGroup
                  options={EXP_OPTIONS}
                  value={profile.experience}
                  onChange={(v) => setProfile((p) => ({ ...p, experience: v as string }))}
                />
                <h3 style={{ marginTop: 24 }}>Your skill level</h3>
                <p className="muted small" style={{ margin: "6px 0 12px" }}>
                  Where would your strongest 3 clients place you?
                </p>
                <ChipGroup
                  options={SKILL_OPTIONS}
                  value={profile.skill}
                  onChange={(v) => setProfile((p) => ({ ...p, skill: v as string }))}
                />
                <div className="divider" />
                <div className="btn-row">
                  <button type="button" className="btn btn-ghost" onClick={setupBack}>
                    Back
                  </button>
                  <button type="button" className="btn btn-primary" onClick={setupNext}>
                    Continue
                  </button>
                </div>
              </>
            )}

            {setupStep === 3 && (
              <>
                <h2>Where do you work?</h2>
                <p className="muted small" style={{ margin: "6px 0 14px" }}>
                  Rates flex by market. Remote-only works too.
                </p>
                <div className="field">
                  <label>City or &quot;Remote&quot;</label>
                  <input
                    type="text"
                    placeholder="e.g. Atlanta, GA · Remote · Brooklyn, NY"
                    value={setupLocation}
                    onChange={(e) => setSetupLocation(e.target.value)}
                  />
                </div>
                <h3 style={{ marginTop: 18 }}>Other skills you offer</h3>
                <p className="muted small" style={{ margin: "6px 0 12px" }}>
                  Selecting more raises your value ceiling on bundled scopes.
                </p>
                <ChipGroup
                  options={EXTRA_OPTIONS}
                  values={profile.extras}
                  multi
                  onChange={(v) =>
                    setProfile((p) => ({ ...p, extras: v as string[] }))
                  }
                />
                <div className="divider" />
                <div className="btn-row">
                  <button type="button" className="btn btn-ghost" onClick={setupBack}>
                    Back
                  </button>
                  <button type="button" className="btn btn-primary" onClick={setupNext}>
                    Continue
                  </button>
                </div>
              </>
            )}

            {setupStep === 4 && (
              <>
                <h2>Finish the profile</h2>
                <p className="muted small" style={{ margin: "6px 0 14px" }}>
                  A few last details so invoices and SOWs look right.
                </p>
                <div className="field">
                  <label>Your name (or business name)</label>
                  <input
                    type="text"
                    placeholder="e.g. Quinton Cameron · QC Films"
                    value={setupName}
                    onChange={(e) => setSetupName(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Email</label>
                  <input
                    type="email"
                    placeholder="you@studio.com"
                    value={setupEmail}
                    onChange={(e) => setSetupEmail(e.target.value)}
                  />
                </div>
                <div className="card" style={{ marginTop: 14 }}>
                  <div className="card-row">
                    <div>
                      <h4 style={{ margin: 0, fontSize: 14 }}>Upload résumé (optional)</h4>
                      <p className="muted small" style={{ margin: "4px 0 0" }}>
                        PDF or text. MIMS uses it to argue your value.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ width: "auto", padding: "10px 14px" }}
                      onClick={() =>
                        showToast('Demo: résumé attached as "resume_q-cameron.pdf"')
                      }
                    >
                      Attach
                    </button>
                  </div>
                </div>
                <div className="divider" />
                <div className="btn-row">
                  <button type="button" className="btn btn-ghost" onClick={setupBack}>
                    Back
                  </button>
                  <button type="button" className="btn btn-primary" onClick={finishSetup}>
                    Finish
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Home */}
        <div className={screenClass(screen, "home")}>
          <div className="topbar">
            <div className="left logo">
              <div className="logo-mark">M</div>
              <span>MIMS</span>
            </div>
            <div className="right">
              <button
                type="button"
                className="icon-btn"
                onClick={() => go("profile")}
                aria-label="Profile"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
                </svg>
              </button>
            </div>
          </div>
          <div className="scroll">
            <div style={{ marginBottom: 20 }}>
              <div className="eyebrow" style={{ marginBottom: 6 }}>
                Hello {homeFirst}
              </div>
              <h1>
                What are we
                <br />
                closing today?
              </h1>
            </div>

            <button
              type="button"
              className="card"
              style={{
                width: "100%",
                textAlign: "left",
                borderColor: "rgba(232,197,122,0.3)",
                background: "var(--grad-soft)",
                padding: 22,
                cursor: "pointer",
              }}
              onClick={startNewDeal}
            >
              <div className="card-row">
                <div>
                  <div className="eyebrow" style={{ marginBottom: 4 }}>
                    New deal
                  </div>
                  <h3 style={{ fontSize: 18 }}>Start a negotiation</h3>
                  <p className="muted small" style={{ margin: "4px 0 0" }}>
                    3 minute questionnaire → your rate + playbook.
                  </p>
                </div>
                <div className="logo-mark" style={{ width: 40, height: 40, borderRadius: 14 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width={18} height={18}>
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>

            <div style={{ marginTop: 28 }}>
              <div className="card-row" style={{ marginBottom: 12 }}>
                <h3>Active deals</h3>
                <button type="button" className="badge" onClick={() => showToast("Demo: filters coming soon")}>
                  All
                </button>
              </div>
              <DealItem
                initials="SC"
                avatarStyle={{ background: "rgba(94,226,160,0.12)", color: "var(--success)" }}
                title="Summit Coffee Co."
                meta="2-day brand video · likelihood 8/10"
                badge="$8,400"
                badgeClass="green"
                onClick={() => {
                  loadSampleDeal("summit");
                  go("deal-result");
                }}
              />
              <DealItem
                initials="RV"
                avatarStyle={{ background: "rgba(232,197,122,0.12)", color: "var(--gold)" }}
                title="Rivian Agency"
                meta="Recurring social cutdowns · likelihood 6/10"
                badge="$3,200/mo"
                badgeClass="gold"
                onClick={() => {
                  loadSampleDeal("rivian");
                  go("deal-result");
                }}
              />
              <DealItem
                initials="CV"
                avatarStyle={{ background: "rgba(255,92,92,0.12)", color: "var(--danger)" }}
                title="Cousin's startup"
                meta="Promo + ads · likelihood 2/10"
                badge="Walk away"
                badgeClass="red"
                onClick={() => {
                  loadSampleDeal("cousin");
                  go("deal-result");
                }}
              />
            </div>

            <div style={{ marginTop: 28 }}>
              <h3 style={{ marginBottom: 12 }}>Quick tools</h3>
              <div className="row">
                <button type="button" className="card" style={{ textAlign: "left", cursor: "pointer" }} onClick={() => go("invoice")}>
                  <div className="logo-mark" style={{ background: "var(--grad-soft)", color: "var(--gold)", marginBottom: 10 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={16} height={16}>
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                      <path d="M14 2v6h6" />
                    </svg>
                  </div>
                  <h4 style={{ fontSize: 14 }}>Invoice</h4>
                  <p className="muted small" style={{ margin: "2px 0 0" }}>Send & track</p>
                </button>
                <button type="button" className="card" style={{ textAlign: "left", cursor: "pointer" }} onClick={() => go("sow")}>
                  <div className="logo-mark" style={{ background: "var(--grad-soft)", color: "var(--gold)", marginBottom: 10 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={16} height={16}>
                      <path d="M9 11l3 3L22 4" />
                      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                    </svg>
                  </div>
                  <h4 style={{ fontSize: 14 }}>Scope of work</h4>
                  <p className="muted small" style={{ margin: "2px 0 0" }}>Lock in deliverables</p>
                </button>
              </div>
            </div>

            <div className="card" style={{ marginTop: 20 }}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>MIMS tip</div>
              <h3 style={{ fontSize: 16 }}>If you&apos;d be relieved when they say no, your stance is right.</h3>
              <p className="muted small" style={{ margin: "8px 0 0" }}>
                Walk away from deals that need you to shrink scope, rate, and dignity at the same time.
              </p>
            </div>
          </div>
          <TabBar active={screen} onNavigate={go} />
        </div>

        <ExtraScreens
          screen={screen}
          screenClass={(id) => screenClass(screen, id)}
          go={go}
          showToast={showToast}
          startNewDeal={startNewDeal}
          dealStep={dealStep}
          deal={deal}
          setDeal={setDeal}
          dealNext={dealNext}
          dealBack={dealBack}
          runAnalysis={runAnalysis}
          intelWhy={intelWhy}
          setIntelWhy={setIntelWhy}
          intelLtv={intelLtv}
          setIntelLtv={setIntelLtv}
          intelRoi={intelRoi}
          setIntelRoi={setIntelRoi}
          intelBudget={intelBudget}
          setIntelBudget={setIntelBudget}
          loadingStep={loadingStep}
          result={result}
          rateDetail={rateDetail}
          score={score}
          scoreOffset={scoreOffset}
          loadSampleDeal={loadSampleDeal}
          displayName={displayName}
          profileRole={profileRole}
        />
      </div>

      <div className={`toast${toastMsg ? " show" : ""}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={18} height={18} style={{ color: "var(--gold)" }}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
        <span>{toastMsg}</span>
      </div>
    </div>
  );
}
