"use client";

import { InstallMimsBanner } from "./install-mims";
import "./mims-layout.css";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

import { AppLegalDisclaimer } from "@/components/mims/AppLegalDisclaimer";
import { DocLegalFooter } from "@/components/mims/DocLegalFooter";
import { FlatRateScopePanel } from "@/components/mims/FlatRateScopePanel";
import { ProductionBudgetPanel } from "@/components/mims/ProductionBudgetPanel";
import type { FlatComplexity } from "@/lib/mims/flat-rate-scope";
import {
  computeDerivedEstimatedDays,
  computeFlatRateSuggestion,
  getDefaultFlatScope,
  isFlatRateEligible,
} from "@/lib/mims/flat-rate-scope";
import {
  APP_TAGLINE,
  LEGAL_VERSION,
  LOADING_STEPS,
  needsLegalReacceptance,
  recordLegalConsent,
} from "@/lib/mims/legal";
import {
  getProjectTypeHelper,
  getProjectTypeMultiplier,
} from "@/lib/mims/project-types";
import {
  MIMS_ROLE_DAY_RATES,
  MIMS_ROLES,
  POPULAR_MIMS_ROLES,
  PRE_PRO_DAY_ROLES,
  getMimsRoleDayRate,
} from "@/lib/mims/role-catalog";

/** Loaded after MIMS_CSS so desktop layout wins over the phone card rules. */
const MIMS_LAYOUT_OVERRIDE = `@media (min-width: 768px),(hover:hover) and (pointer:fine){.mims-shell{padding:0!important;justify-content:stretch!important;align-items:stretch!important;width:100%!important}.mims-shell .app{width:100%!important;max-width:none!important;min-height:100vh!important;max-height:none!important;border-radius:0!important;border:none!important;box-shadow:none!important}}.mims-shell.mims-wide{padding:0!important;justify-content:stretch!important;align-items:stretch!important;width:100%!important}.mims-shell.mims-wide .app{width:100%!important;max-width:none!important;min-height:100vh!important;max-height:none!important;border-radius:0!important;border:none!important;box-shadow:none!important}`;

/** All styles in this file — no external CSS. Dynamic layout uses style={{}}. */
const MIMS_CSS = ".mims-shell {\n  --bg: #0b0b0f;\n  --bg-2: #101017;\n  --surface: #15151d;\n  --surface-2: #1b1b25;\n  --elevated: #22222d;\n  --border: #26262f;\n  --border-2: #33333e;\n  --text: #ffffff;\n  --text-2: #b5b5c2;\n  --text-3: #6f6f7e;\n  --gold: #e8c57a;\n  --gold-2: #c9a05e;\n  --coral: #ff7a66;\n  --success: #5ee2a0;\n  --warn: #ffb547;\n  --danger: #ff5c5c;\n  --grad: linear-gradient(135deg, #e8c57a 0%, #ff7a66 100%);\n  --grad-soft: linear-gradient(\n    135deg,\n    rgba(232, 197, 122, 0.18) 0%,\n    rgba(255, 122, 102, 0.18) 100%\n  );\n  --radius: 16px;\n  --radius-sm: 10px;\n  --radius-lg: 22px;\n  --shadow-1:\n    0 1px 0 rgba(255, 255, 255, 0.04) inset, 0 8px 24px rgba(0, 0, 0, 0.35);\n  --shadow-2: 0 20px 60px rgba(0, 0, 0, 0.55);\n  --safe-bottom: env(safe-area-inset-bottom, 0px);\n\n  box-sizing: border-box;\n  -webkit-tap-highlight-color: transparent;\n  margin: 0;\n  padding: 0;\n  min-height: 100vh;\n  background:\n    radial-gradient(\n      1200px 600px at 80% -10%,\n      rgba(255, 122, 102, 0.1),\n      transparent 60%\n    ),\n    radial-gradient(\n      900px 500px at -10% 10%,\n      rgba(232, 197, 122, 0.07),\n      transparent 60%\n    ),\n    var(--bg);\n  color: var(--text);\n  font-family:\n    -apple-system, BlinkMacSystemFont, \"SF Pro Text\", \"Inter\", \"Segoe UI\",\n    system-ui, sans-serif;\n  font-size: 16px;\n  line-height: 1.45;\n  -webkit-font-smoothing: antialiased;\n  overscroll-behavior-y: none;\n  display: flex;\n  justify-content: center;\n}\n\n.mims-shell *,\n.mims-shell *::before,\n.mims-shell *::after {\n  box-sizing: border-box;\n}\n\n@media (min-width: 500px) and (max-width: 899px) {\n  .mims-shell {\n    padding: 24px 0;\n    align-items: flex-start;\n  }\n}\n\n.mims-shell .app {\n  width: 100%;\n  max-width: 100%;\n  min-height: 100vh;\n  background: var(--bg);\n  position: relative;\n  overflow: hidden;\n  display: flex;\n  flex-direction: column;\n  border-left: 1px solid rgba(255, 255, 255, 0.04);\n  border-right: 1px solid rgba(255, 255, 255, 0.04);\n}\n\n@media (min-width: 500px) and (max-width: 899px) {\n  .mims-shell .app {\n    max-width: 430px;\n    min-height: calc(100vh - 48px);\n    max-height: 920px;\n    border-radius: 36px;\n    overflow: hidden;\n    box-shadow: var(--shadow-2);\n    border: 1px solid var(--border);\n  }\n}\n\n.mims-shell .topbar {\n  position: sticky;\n  top: 0;\n  z-index: 20;\n  backdrop-filter: blur(20px);\n  -webkit-backdrop-filter: blur(20px);\n  background: rgba(11, 11, 15, 0.75);\n  border-bottom: 1px solid var(--border);\n  padding: 14px 20px;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  min-height: 56px;\n}\n\n.mims-shell .topbar .title {\n  font-size: 16px;\n  font-weight: 600;\n  letter-spacing: -0.01em;\n}\n\n.mims-shell .topbar .left,\n.mims-shell .topbar .right {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  min-width: 36px;\n}\n\n.mims-shell .icon-btn {\n  width: 36px;\n  height: 36px;\n  border-radius: 12px;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  background: var(--surface);\n  border: 1px solid var(--border);\n  color: var(--text-2);\n  cursor: pointer;\n}\n\n.mims-shell .icon-btn:hover {\n  color: var(--text);\n}\n\n.mims-shell .icon-btn svg {\n  width: 18px;\n  height: 18px;\n}\n\n.mims-shell .scroll {\n  flex: 1;\n  overflow-y: auto;\n  overflow-x: hidden;\n  padding: 16px 20px calc(110px + var(--safe-bottom));\n  scroll-behavior: smooth;\n}\n\n.mims-shell .tabbar {\n  position: absolute;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  z-index: 30;\n  backdrop-filter: blur(20px);\n  -webkit-backdrop-filter: blur(20px);\n  background: rgba(11, 11, 15, 0.85);\n  border-top: 1px solid var(--border);\n  padding: 10px 14px calc(14px + var(--safe-bottom));\n  display: grid;\n  grid-template-columns: repeat(4, 1fr);\n  gap: 4px;\n}\n\n.mims-shell .tab {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 4px;\n  padding: 8px 4px;\n  border-radius: 12px;\n  color: var(--text-3);\n  cursor: pointer;\n  font-size: 11px;\n  font-weight: 500;\n  background: transparent;\n  border: none;\n  transition: color 0.15s ease;\n}\n\n.mims-shell .tab svg {\n  width: 22px;\n  height: 22px;\n}\n\n.mims-shell .tab.active {\n  color: var(--text);\n}\n\n.mims-shell .tab.active .tab-ico {\n  background: var(--grad-soft);\n  color: var(--gold);\n}\n\n.mims-shell .tab-ico {\n  width: 32px;\n  height: 32px;\n  border-radius: 10px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  transition: background 0.15s ease;\n}\n\n.mims-shell h1,\n.mims-shell h2,\n.mims-shell h3,\n.mims-shell h4 {\n  margin: 0;\n  letter-spacing: -0.02em;\n}\n\n.mims-shell h1 {\n  font-size: 30px;\n  font-weight: 700;\n  line-height: 1.1;\n}\n\n.mims-shell h2 {\n  font-size: 22px;\n  font-weight: 600;\n  line-height: 1.2;\n}\n\n.mims-shell h3 {\n  font-size: 17px;\n  font-weight: 600;\n}\n\n.mims-shell .eyebrow {\n  font-size: 11px;\n  font-weight: 600;\n  letter-spacing: 0.12em;\n  text-transform: uppercase;\n  color: var(--gold);\n}\n\n.mims-shell .muted {\n  color: var(--text-2);\n}\n\n.mims-shell .dim {\n  color: var(--text-3);\n  font-size: 13px;\n}\n\n.mims-shell .btn {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  gap: 8px;\n  padding: 14px 18px;\n  border-radius: 14px;\n  font-weight: 600;\n  font-size: 15px;\n  border: none;\n  cursor: pointer;\n  width: 100%;\n  transition:\n    transform 0.12s ease,\n    opacity 0.15s ease,\n    background 0.15s ease;\n}\n\n.mims-shell .btn:active {\n  transform: scale(0.98);\n}\n\n.mims-shell .btn-primary {\n  background: var(--grad);\n  color: #1a1306;\n}\n\n.mims-shell .btn-primary:hover {\n  opacity: 0.95;\n}\n\n.mims-shell .btn-secondary {\n  background: var(--surface);\n  color: var(--text);\n  border: 1px solid var(--border);\n}\n\n.mims-shell .btn-ghost {\n  background: transparent;\n  color: var(--text-2);\n  border: 1px solid var(--border);\n}\n\n.mims-shell .btn-row {\n  display: flex;\n  gap: 10px;\n}\n\n.mims-shell .btn-row > .btn {\n  flex: 1;\n}\n\n.mims-shell .card {\n  background: var(--surface);\n  border: 1px solid var(--border);\n  border-radius: var(--radius);\n  padding: 18px;\n  box-shadow: var(--shadow-1);\n}\n\n.mims-shell .card + .card {\n  margin-top: 12px;\n}\n\n.mims-shell .card-row {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 12px;\n}\n\n.mims-shell .field {\n  margin-bottom: 14px;\n}\n\n.mims-shell .field label {\n  display: block;\n  font-size: 13px;\n  font-weight: 500;\n  color: var(--text-2);\n  margin-bottom: 6px;\n}\n\n.mims-shell .field input,\n.mims-shell .field select,\n.mims-shell .field textarea {\n  width: 100%;\n  background: var(--surface);\n  border: 1px solid var(--border);\n  border-radius: 12px;\n  padding: 14px;\n  color: var(--text);\n  font-size: 15px;\n  font-family: inherit;\n  transition: border-color 0.15s ease;\n}\n\n.mims-shell .field input:focus,\n.mims-shell .field select:focus,\n.mims-shell .field textarea:focus {\n  outline: none;\n  border-color: var(--gold);\n}\n\n.mims-shell .field textarea {\n  min-height: 90px;\n  resize: vertical;\n}\n\n.mims-shell .helper {\n  font-size: 12px;\n  color: var(--text-3);\n  margin-top: 6px;\n}\n\n.mims-shell .chips {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 8px;\n}\n\n.mims-shell .chip {\n  padding: 9px 13px;\n  background: var(--surface);\n  border: 1px solid var(--border);\n  border-radius: 999px;\n  font-size: 13px;\n  font-weight: 500;\n  color: var(--text-2);\n  cursor: pointer;\n  transition: all 0.15s ease;\n  user-select: none;\n}\n\n.mims-shell .chip.active {\n  border-color: var(--gold);\n  background: var(--grad-soft);\n  color: var(--gold);\n}\n\n.mims-shell .seg {\n  display: flex;\n  background: var(--surface);\n  border: 1px solid var(--border);\n  border-radius: 12px;\n  padding: 4px;\n  gap: 4px;\n}\n\n.mims-shell .seg button {\n  flex: 1;\n  padding: 10px;\n  border: none;\n  background: transparent;\n  color: var(--text-2);\n  font-weight: 500;\n  font-size: 13px;\n  border-radius: 9px;\n  cursor: pointer;\n}\n\n.mims-shell .seg button.active {\n  background: var(--elevated);\n  color: var(--text);\n  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.04);\n}\n\n.mims-shell .logo {\n  display: inline-flex;\n  align-items: center;\n  gap: 10px;\n  font-weight: 700;\n  letter-spacing: -0.02em;\n}\n\n.mims-shell .logo-mark {\n  width: 28px;\n  height: 28px;\n  border-radius: 8px;\n  background: var(--grad);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  color: #1a1306;\n  font-weight: 800;\n  font-size: 14px;\n}\n\n.mims-shell .screen {\n  display: none;\n  flex-direction: column;\n  min-height: 100%;\n}\n\n.mims-shell .screen.active {\n  display: flex;\n}\n\n.mims-shell .screen-pad {\n  padding: 16px 20px calc(110px + var(--safe-bottom));\n  flex: 1;\n  overflow-y: auto;\n}\n\n.mims-shell .screen-pad.no-pad-bottom {\n  padding-bottom: 24px;\n}\n\n.mims-shell .welcome-hero {\n  padding: 80px 24px 40px;\n  text-align: center;\n  background:\n    radial-gradient(\n      400px 200px at 50% 0%,\n      rgba(255, 122, 102, 0.18),\n      transparent 70%\n    ),\n    radial-gradient(\n      500px 300px at 50% 30%,\n      rgba(232, 197, 122, 0.1),\n      transparent 70%\n    );\n}\n\n.mims-shell .welcome-mark {\n  width: 76px;\n  height: 76px;\n  border-radius: 22px;\n  background: var(--grad);\n  margin: 0 auto 24px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  color: #1a1306;\n  font-weight: 800;\n  font-size: 36px;\n  letter-spacing: -0.04em;\n  box-shadow:\n    0 30px 60px rgba(255, 122, 102, 0.25),\n    0 10px 30px rgba(232, 197, 122, 0.2);\n}\n\n.mims-shell .welcome-hero h1 {\n  font-size: 34px;\n  background: linear-gradient(180deg, #ffffff 0%, #c9c9d4 100%);\n  -webkit-background-clip: text;\n  background-clip: text;\n  color: transparent;\n}\n\n.mims-shell .welcome-features {\n  padding: 0 20px;\n  display: grid;\n  gap: 12px;\n  margin-bottom: 24px;\n}\n\n.mims-shell .feature {\n  display: flex;\n  gap: 14px;\n  align-items: flex-start;\n  padding: 14px 16px;\n  background: var(--surface);\n  border: 1px solid var(--border);\n  border-radius: var(--radius);\n}\n\n.mims-shell .feature .ico {\n  width: 36px;\n  height: 36px;\n  border-radius: 10px;\n  background: var(--grad-soft);\n  color: var(--gold);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex-shrink: 0;\n}\n\n.mims-shell .feature .ico svg {\n  width: 18px;\n  height: 18px;\n}\n\n.mims-shell .feature h4 {\n  font-size: 14px;\n  margin-bottom: 2px;\n}\n\n.mims-shell .feature p {\n  font-size: 13px;\n  color: var(--text-2);\n  margin: 0;\n}\n\n.mims-shell .score-circle {\n  position: relative;\n  width: 180px;\n  height: 180px;\n  margin: 0 auto 8px;\n}\n\n.mims-shell .score-circle svg {\n  width: 100%;\n  height: 100%;\n  transform: rotate(-90deg);\n}\n\n.mims-shell .score-circle .score-label {\n  position: absolute;\n  inset: 0;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  text-align: center;\n}\n\n.mims-shell .score-circle .score-num {\n  font-size: 56px;\n  font-weight: 700;\n  letter-spacing: -0.04em;\n  line-height: 1;\n}\n\n.mims-shell .score-circle .score-cap {\n  font-size: 11px;\n  letter-spacing: 0.14em;\n  color: var(--text-3);\n  text-transform: uppercase;\n  margin-top: 6px;\n}\n\n.mims-shell .big-num {\n  font-size: 44px;\n  font-weight: 700;\n  letter-spacing: -0.03em;\n  background: var(--grad);\n  -webkit-background-clip: text;\n  background-clip: text;\n  color: transparent;\n  line-height: 1;\n}\n\n.mims-shell .badge {\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n  padding: 5px 10px;\n  border-radius: 999px;\n  font-size: 12px;\n  font-weight: 600;\n  background: var(--surface);\n  border: 1px solid var(--border);\n  color: var(--text-2);\n}\n\n.mims-shell .badge.gold {\n  color: var(--gold);\n  border-color: rgba(232, 197, 122, 0.3);\n  background: rgba(232, 197, 122, 0.06);\n}\n\n.mims-shell .badge.green {\n  color: var(--success);\n  border-color: rgba(94, 226, 160, 0.3);\n  background: rgba(94, 226, 160, 0.06);\n}\n\n.mims-shell .badge.warn {\n  color: var(--warn);\n  border-color: rgba(255, 181, 71, 0.3);\n  background: rgba(255, 181, 71, 0.06);\n}\n\n.mims-shell .badge.red {\n  color: var(--danger);\n  border-color: rgba(255, 92, 92, 0.3);\n  background: rgba(255, 92, 92, 0.06);\n}\n\n.mims-shell .progress {\n  height: 6px;\n  background: var(--surface);\n  border-radius: 999px;\n  overflow: hidden;\n  border: 1px solid var(--border);\n}\n\n.mims-shell .progress > div {\n  height: 100%;\n  background: var(--grad);\n  border-radius: 999px;\n  transition: width 0.4s ease;\n}\n\n.mims-shell .tactic {\n  padding: 16px;\n  background: var(--surface);\n  border: 1px solid var(--border);\n  border-radius: var(--radius);\n}\n\n.mims-shell .tactic + .tactic {\n  margin-top: 10px;\n}\n\n.mims-shell .tactic .source {\n  font-size: 11px;\n  letter-spacing: 0.08em;\n  color: var(--gold);\n  text-transform: uppercase;\n  font-weight: 600;\n  margin-bottom: 8px;\n}\n\n.mims-shell .tactic h4 {\n  font-size: 15px;\n  margin-bottom: 6px;\n}\n\n.mims-shell .tactic .quote {\n  margin-top: 10px;\n  padding: 12px 14px;\n  border-left: 2px solid var(--gold);\n  color: var(--text-2);\n  font-style: italic;\n  font-size: 14px;\n  background: rgba(232, 197, 122, 0.04);\n  border-radius: 8px;\n}\n\n.mims-shell .steps {\n  padding: 0;\n  margin: 0;\n  list-style: none;\n  counter-reset: s;\n}\n\n.mims-shell .steps li {\n  counter-increment: s;\n  padding: 8px 0 8px 30px;\n  position: relative;\n  color: var(--text-2);\n  font-size: 14px;\n}\n\n.mims-shell .steps li::before {\n  content: counter(s);\n  position: absolute;\n  left: 0;\n  top: 8px;\n  width: 20px;\n  height: 20px;\n  background: var(--grad-soft);\n  color: var(--gold);\n  border-radius: 6px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-weight: 700;\n  font-size: 11px;\n}\n\n.mims-shell .deal-item {\n  padding: 14px 16px;\n  background: var(--surface);\n  border: 1px solid var(--border);\n  border-radius: var(--radius);\n  display: flex;\n  gap: 12px;\n  align-items: center;\n  cursor: pointer;\n  margin-bottom: 10px;\n  width: 100%;\n  text-align: left;\n  color: inherit;\n  font: inherit;\n}\n\n.mims-shell .deal-item:hover {\n  border-color: var(--border-2);\n}\n\n.mims-shell .deal-item .avatar {\n  width: 42px;\n  height: 42px;\n  border-radius: 12px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-weight: 700;\n  font-size: 16px;\n  flex-shrink: 0;\n}\n\n.mims-shell .deal-item h4 {\n  font-size: 15px;\n}\n\n.mims-shell .deal-item .meta {\n  font-size: 12px;\n  color: var(--text-3);\n}\n\n.mims-shell .doc-preview {\n  background: #fafaf7;\n  color: #1a1a1f;\n  border-radius: 16px;\n  padding: 22px;\n  font-family:\n    \"SF Pro Text\",\n    -apple-system,\n    system-ui,\n    sans-serif;\n  font-size: 13px;\n  line-height: 1.5;\n}\n\n.mims-shell .doc-preview h2 {\n  color: #1a1a1f;\n  font-size: 22px;\n  margin-bottom: 4px;\n}\n\n.mims-shell .doc-preview .doc-head {\n  display: flex;\n  justify-content: space-between;\n  align-items: flex-start;\n  margin-bottom: 18px;\n  padding-bottom: 14px;\n  border-bottom: 1px solid #e6e2d8;\n}\n\n.mims-shell .doc-preview table {\n  width: 100%;\n  border-collapse: collapse;\n  margin: 12px 0;\n}\n\n.mims-shell .doc-preview th,\n.mims-shell .doc-preview td {\n  text-align: left;\n  padding: 8px 4px;\n  font-size: 12px;\n  border-bottom: 1px solid #eee;\n}\n\n.mims-shell .doc-preview th {\n  color: #6f6f6f;\n  font-weight: 600;\n}\n\n.mims-shell .doc-preview .total {\n  border-top: 2px solid #1a1a1f;\n  padding-top: 12px;\n  margin-top: 12px;\n  display: flex;\n  justify-content: space-between;\n  font-weight: 700;\n  font-size: 16px;\n}\n\n.mims-shell .doc-preview .label-sm {\n  font-size: 10px;\n  color: #888;\n  text-transform: uppercase;\n  letter-spacing: 0.1em;\n  font-weight: 600;\n}\n\n.mims-shell .loading {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  text-align: center;\n  padding: 40px 24px;\n  min-height: 480px;\n}\n\n.mims-shell .spinner {\n  width: 56px;\n  height: 56px;\n  border-radius: 50%;\n  background: conic-gradient(\n    from 0deg,\n    transparent,\n    var(--gold),\n    var(--coral),\n    transparent\n  );\n  mask: radial-gradient(circle 22px at center, transparent 99%, black 100%);\n  -webkit-mask: radial-gradient(circle 22px at center, transparent 99%, black 100%);\n  animation: mims-spin 1.2s linear infinite;\n  margin-bottom: 22px;\n}\n\n@keyframes mims-spin {\n  to {\n    transform: rotate(360deg);\n  }\n}\n\n.mims-shell .loading-steps {\n  list-style: none;\n  padding: 0;\n  margin: 0;\n  text-align: left;\n  width: 100%;\n  max-width: 280px;\n}\n\n.mims-shell .loading-steps li {\n  padding: 10px 14px;\n  font-size: 13px;\n  color: var(--text-3);\n  display: flex;\n  align-items: center;\n  gap: 10px;\n}\n\n.mims-shell .loading-steps li.done {\n  color: var(--text);\n}\n\n.mims-shell .loading-steps li.active {\n  color: var(--text);\n}\n\n.mims-shell .loading-steps .dot {\n  width: 14px;\n  height: 14px;\n  border-radius: 50%;\n  background: var(--surface);\n  border: 1px solid var(--border);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex-shrink: 0;\n}\n\n.mims-shell .loading-steps li.done .dot {\n  background: var(--success);\n  border-color: var(--success);\n}\n\n.mims-shell .loading-steps li.active .dot {\n  background: var(--gold);\n  border-color: var(--gold);\n  animation: mims-pulse 1.2s infinite;\n}\n\n@keyframes mims-pulse {\n  0%,\n  100% {\n    box-shadow: 0 0 0 0 rgba(232, 197, 122, 0.4);\n  }\n  50% {\n    box-shadow: 0 0 0 6px rgba(232, 197, 122, 0);\n  }\n}\n\n.mims-shell .toast {\n  position: absolute;\n  left: 20px;\n  right: 20px;\n  top: 70px;\n  background: var(--elevated);\n  border: 1px solid var(--border-2);\n  border-radius: 14px;\n  padding: 12px 14px;\n  z-index: 100;\n  font-size: 14px;\n  display: none;\n  align-items: center;\n  gap: 10px;\n  box-shadow: var(--shadow-2);\n}\n\n.mims-shell .toast.show {\n  display: flex;\n  animation: mims-slide-down 0.25s ease;\n}\n\n@keyframes mims-slide-down {\n  from {\n    transform: translateY(-20px);\n    opacity: 0;\n  }\n}\n\n.mims-shell .divider {\n  height: 1px;\n  background: var(--border);\n  margin: 16px 0;\n}\n\n.mims-shell .row {\n  display: flex;\n  gap: 10px;\n}\n\n.mims-shell .row > * {\n  flex: 1;\n}\n\n.mims-shell .stack-tight > * + * {\n  margin-top: 6px;\n}\n\n.mims-shell .stack > * + * {\n  margin-top: 12px;\n}\n\n.mims-shell .stack-lg > * + * {\n  margin-top: 18px;\n}\n\n.mims-shell .center {\n  text-align: center;\n}\n\n.mims-shell .small {\n  font-size: 13px;\n}\n\n@keyframes mims-tick-up {\n  from { opacity: 0; transform: translateY(6px) scale(0.94); }\n  to   { opacity: 1; transform: translateY(0)  scale(1);    }\n}\n\n@keyframes mims-tick-down {\n  from { opacity: 0; transform: translateY(-6px) scale(0.94); }\n  to   { opacity: 1; transform: translateY(0)   scale(1);    }\n}\n\n\n/* desktop-full */\n@media (min-width: 900px) {\n  .mims-shell {\n    padding: 0;\n    align-items: stretch;\n    justify-content: stretch;\n  }\n\n  .mims-shell .app {\n    width: 100%;\n    max-width: none;\n    min-height: 100vh;\n    max-height: none;\n    border-radius: 0;\n    border: none;\n    box-shadow: none;\n  }\n\n  .mims-shell .scroll,\n  .mims-shell .screen-pad {\n    padding-left: clamp(24px, 4vw, 48px);\n    padding-right: clamp(24px, 4vw, 48px);\n  }\n\n  .mims-shell h1 {\n    font-size: 34px;\n  }\n\n  .mims-shell .deal-form-grid,\n  .mims-shell .home-layout,\n  .mims-shell .result-layout {\n    max-width: 1120px;\n    margin-left: auto;\n    margin-right: auto;\n    width: 100%;\n  }\n\n  /* New deal: two columns for paired controls */\n  .mims-shell .deal-form-grid .field-pair {\n    display: grid;\n    grid-template-columns: 1fr 1fr;\n    gap: 16px 20px;\n  }\n\n  .mims-shell .deal-form-grid .field-pair .field {\n    margin-bottom: 0;\n  }\n\n  .mims-shell .deal-form-grid .footprint-grid {\n    grid-template-columns: 1fr 1fr 1fr;\n    gap: 12px;\n  }\n\n  .mims-shell .deal-form-grid .deal-days-row {\n    display: grid;\n    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));\n    gap: 16px 20px;\n  }\n\n  .mims-shell .deal-price-sticky {\n    margin-left: 0 !important;\n    margin-right: 0 !important;\n    border-radius: 14px;\n  }\n\n  /* Home: hero full width; cards in two columns */\n  .mims-shell .home-layout {\n    display: grid;\n    grid-template-columns: 1fr 1fr;\n    gap: 16px 20px;\n  }\n\n  .mims-shell .home-layout .home-hero,\n  .mims-shell .home-layout .home-span-full {\n    grid-column: 1 / -1;\n  }\n\n  /* Deal result: summary + crew split side by side when space allows */\n  .mims-shell .result-layout {\n    display: grid;\n    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);\n    gap: 20px 24px;\n    align-items: start;\n  }\n\n  .mims-shell .result-layout .result-span-full {\n    grid-column: 1 / -1;\n  }\n}\n\n@media (min-width: 1200px) {\n  .mims-shell .scroll,\n  .mims-shell .screen-pad {\n    padding-left: max(48px, calc((100vw - 1120px) / 2));\n    padding-right: max(48px, calc((100vw - 1120px) / 2));\n  }\n}\n";


type ScreenId =
  | "welcome"
  | "profile-setup"
  | "home"
  | "new-deal"
  | "loading"
  | "deal-result"
  | "deals"
  | "library"
  | "profile"
  | "invoice"
  | "sow";

type Mood = "good" | "ok" | "soft" | "walk";

interface GearItem {
  id: string;
  name: string;
  cost: string;
}

interface Profile {
  name: string;
  email: string;
  trade: string;
  experience: string;
  skill: string;
  location: string;
  extras: string[];
  gearLocker: GearItem[];
  resumeLeverageScore?: number;
  resumeClientSignals?: string[];
  resumeLeadershipSignals?: string[];
  resumeMatchedKeywords?: string[];
}

interface Deal {
  client: string;
  url: string;
  publicAudience: string;
  brandMaturity: string;
  pricePoint: string;
  source: string;
  project: string;
  shootDays: number;
  editDays: number;
  preProDays: number;
  pricingMode: "days" | "project";
  projectFee: string;
  flatUnitCount: number;
  flatEstimatedDays: number;
  flatComplexity: FlatComplexity;
  flatRevisionRounds: number;
  rush: string;
  usage: string;
  why: string;
  ltv: string;
  roi: string;
  annualRevenue: string;
  companySize: string;
  dm: string;
  budgetStance: string;
  budget: string;
  scopeNotes: string;
  scopeServices: string[];
  dealRole: string;
  additionalRoles: string[];
  /** Non-primary roles you perform; each billed at this % of its catalog day rate (50 / 60 / 75). */
  additionalRoleChargePct: 50 | 60 | 75;
  additionalCrew: AdditionalCrewEntry[];
  kitFee: string;
  kitFeeCustom: string;
  kitFeeLockerItems: string[];
  kitFeeRate: string;
  mediaStorageProvider: string;
  mediaStorageTier: string;
  chargeDitFee: boolean;
}

interface AdditionalCrewEntry {
  role: string;
  qty: number;
}

interface AdditionalCrewLine {
  id: string;
  label: string;
  rate: number;
  days: number;
  qty: number;
  total: number;
  phase: "shoot" | "post" | "project";
}

interface AdditionalRoleLine {
  role: string;
  days: number;
  dayRate: number;
  subtotal: number;
  phase: "shoot" | "post";
}

interface CrewSplit {
  primaryRole: string;
  productionDayRate: number;
  shootDays: number;
  productionSubtotal: number;
  prePro: number;
  preProDays: number;
  pricingMode: "days" | "project";
  projectSubtotal: number;
  postDayRate: number;
  editDays: number;
  postSubtotal: number;
  additionalRoleLines: AdditionalRoleLine[];
  additionalRolesTotal: number;
  hasColor: boolean;
  hasSound: boolean;
  colorAlloc: number;
  soundAlloc: number;
  usageLicense: number;
  isMultiRole: boolean;
  additionalCrew: AdditionalCrewLine[];
  additionalCrewTotal: number;
  kitFeeTotal: number;
  kitFeeLabel: string;
  mediaStorageTotal: number;
  mediaStorageLabel: string;
  mediaStorageDriveNote: string;
  mediaStorageAmazonHardware: number;
  ditFeeTotal: number;
  ditDays: number;
  ditDayRate: number;
}

interface Recommendation {
  target: number;
  floor: number;
  stretch: number;
  capacity: number;
  score: number;
  headline: string;
  rationale: string;
  verdict: string;
  mood: Mood;
  scope?: string;
  valuePremium?: boolean;
  crewSplit?: CrewSplit;
  floorRate?: number;
  breakEvenSales?: number | null;
}

interface SimMsg {
  role: "client" | "coach";
  objection?: string;
  script?: string[];
  diagnostics?: string[];
}

interface ObjectionEntry {
  id: string;
  label: string;
  script: string[];
  diagnostics: string[];
}

const defaultProfile: Profile = {
  name: "",
  email: "",
  trade: "",
  experience: "",
  skill: "",
  location: "",
  extras: [],
  gearLocker: [],
};

const defaultDeal: Deal = {
  client: "",
  url: "",
  publicAudience: "",
  brandMaturity: "",
  pricePoint: "",
  source: "referral",
  project: "brand-video",
  shootDays: 0,
  editDays: 0,
  preProDays: 0,
  pricingMode: "days",
  projectFee: "",
  flatUnitCount: 12,
  flatEstimatedDays: 3,
  flatComplexity: "clean",
  flatRevisionRounds: 2,
  rush: "normal",
  usage: "organic",
  why: "",
  ltv: "",
  roi: "",
  annualRevenue: "",
  companySize: "",
  dm: "yes",
  budgetStance: "range",
  budget: "",
  scopeNotes: "",
  scopeServices: [],
  dealRole: "",
  additionalRoles: [],
  additionalRoleChargePct: 75,
  additionalCrew: [],
  kitFee: "",
  kitFeeCustom: "",
  kitFeeLockerItems: [],
  kitFeeRate: "0.05",
  mediaStorageProvider: "",
  mediaStorageTier: "",
  chargeDitFee: false,
};

function tradeLabel(t: string): string {
  return t || "Creative";
}

function parseMoney(s: string): number {
  if (!s) return 0;
  const m = s.match(/[\d,]+/g);
  if (!m) return 0;
  const nums = m.map((x) => parseInt(x.replace(/,/g, ""), 10));
  return Math.max(...nums);
}

function parseBudgetTop(s: string): number {
  if (!s) return 0;
  const m = s.match(/[\d,]+/g);
  if (!m) return 0;
  const nums = m.map((x) => parseInt(x.replace(/,/g, ""), 10));
  return Math.max(...nums);
}

function fmt(n: number): string {
  return n.toLocaleString("en-US");
}

function getLocationMarketMultiplier(location: string): number {
  const loc = location.toLowerCase();
  if (!loc || loc.includes("remote")) return 1;

  if (
    ["new york", "nyc", "brooklyn", "los angeles", "la,", "san francisco", "bay area"].some((city) =>
      loc.includes(city)
    )
  ) return 1.25;

  if (
    ["chicago", "miami", "boston", "washington", "dc", "seattle", "oakland", "santa monica"].some((city) =>
      loc.includes(city)
    )
  ) return 1.15;

  if (
    ["atlanta", "austin", "denver", "philadelphia", "portland", "san diego", "nashville", "new orleans"].some((city) =>
      loc.includes(city)
    )
  ) return 1.08;

  return 1;
}

const VETERAN_ROLE_DAY_RATES = MIMS_ROLE_DAY_RATES;

function getVeteranRoleRate(role: string): number {
  const fromCatalog = getMimsRoleDayRate(role);
  if (fromCatalog > 0) return fromCatalog;

  const mode = getRoleDayMode(role);
  if (mode === "post") return 850;
  if (mode === "design") return 750;
  if (mode === "dual") return 900;
  return 650;
}

function getEstimatedBaseDayRate(profile: Profile, role: string): number {
  const veteranBase = getVeteranRoleRate(role || profile.trade);
  const tierMult =
    ({
      beginner: 0.6,
      mid: 0.8,
      expert: 1,
      "0-1": 0.6,
      "1-3": 0.7,
      "3-5": 0.8,
      "5-10": 0.9,
      "10+": 1,
    } as Record<string, number>)[profile.experience || profile.skill || "mid"] ?? 0.8;
  return Math.round((veteranBase * tierMult) / 25) * 25;
}

function getPublicFootprintMultiplier(deal: Deal): number {
  const audienceMult: Record<string, number> = {
    "under-5k": 0.95,
    "5k-25k": 1.0,
    "25k-100k": 1.08,
    "100k-500k": 1.16,
    "500k-1m": 1.25,
    "1m-plus": 1.35,
  };
  const maturityMult: Record<string, number> = {
    new: 0.95,
    local: 1.0,
    growth: 1.1,
    established: 1.2,
    enterprise: 1.35,
  };
  const priceMult: Record<string, number> = {
    low: 0.95,
    mid: 1.0,
    premium: 1.12,
    luxury: 1.25,
    b2b: 1.22,
  };

  const combined =
    (audienceMult[deal.publicAudience] ?? 1) *
    (maturityMult[deal.brandMaturity] ?? 1) *
    (priceMult[deal.pricePoint] ?? 1);

  return Math.max(0.9, Math.min(1.45, combined));
}

function computeRecommendation(profile: Profile, deal: Deal): Recommendation {
  const base = getEstimatedBaseDayRate(profile, deal.dealRole || profile.trade);
  const extrasMult = 1 + Math.min(profile.extras.length, 4) * 0.04;
  const resumeScore = profile.resumeLeverageScore ?? 0;
  const resumeClientCount = profile.resumeClientSignals?.length ?? 0;
  const resumeLeadershipCount = profile.resumeLeadershipSignals?.length ?? 0;
  const resumePremium = Math.min(
    (resumeScore >= 8 ? 0.08 : resumeScore >= 6 ? 0.05 : resumeScore >= 4 ? 0.025 : 0) +
      Math.min(resumeClientCount, 4) * 0.015 +
      Math.min(resumeLeadershipCount, 4) * 0.02,
    0.2,
  );
  const resumeMult = 1 + resumePremium;
  const locationMult = getLocationMarketMultiplier(profile.location);

  // Premium loading fee baked into the day rate: rush=25%, fire=50%, paid=25%, broadcast=50%, caps at 50%
  const rushPremium = ({ loose: 0, normal: 0, rush: 0.25, fire: 0.5 } as Record<string, number>)[deal.rush] || 0;
  const usagePremium = ({ organic: 0, paid: 0.25, broadcast: 0.5 } as Record<string, number>)[deal.usage] || 0;
  const premiumLoading = Math.min(rushPremium + usagePremium, 0.5);

  const multipliers = extrasMult * resumeMult * locationMult * (1 + premiumLoading);
  const adjDay = base * multipliers;

  const primaryRole = deal.dealRole || profile.trade;
  const roleForCalc = primaryRole.toLowerCase();
  const pricingMode = deal.pricingMode === "project" ? "project" : "days";
  const projectFeeNum = parseMoney(deal.projectFee) || 0;
  const isProjectRate = pricingMode === "project" && projectFeeNum > 0;
  const isMultiRole =
    !isProjectRate &&
    roleForCalc.includes("videographer") &&
    deal.shootDays > 0 &&
    deal.editDays > 0;
  const primaryMode = getRoleDayMode(primaryRole);

  const hasPostAdditionalRole = (deal.additionalRoles ?? []).some((role) => {
    const mode = getRoleDayMode(role);
    return mode === "post" || mode === "design";
  });

  let primaryShoot = 0;
  let primaryEdit = 0;
  let projectSubtotal = 0;

  if (isProjectRate) {
    projectSubtotal = projectFeeNum;
  } else if (primaryMode === "post" || primaryMode === "design") {
    primaryEdit = deal.editDays * adjDay;
  } else {
    primaryShoot = deal.shootDays * adjDay;
    if (deal.editDays > 0 && !hasPostAdditionalRole) {
      const primaryPostDayRate =
        isMultiRole || primaryMode === "dual" ? adjDay : adjDay * 0.75;
      primaryEdit = deal.editDays * primaryPostDayRate;
    }
  }

  const preProDays = isProjectRate ? 0 : Math.max(0, deal.preProDays || 0);
  const prePro = preProDays * adjDay;

  const additionalRoleLines: AdditionalRoleLine[] = [];
  let additionalRolesTotal = 0;

  const additionalRoleMult = getAdditionalRoleChargeMult(deal);

  if (!isProjectRate) for (const role of deal.additionalRoles ?? []) {
    if (!role || role === deal.dealRole) continue;
    const mode = getRoleDayMode(role);
    const roleDay = Math.round(
      (getEstimatedBaseDayRate(profile, role) *
        multipliers *
        additionalRoleMult) /
        25,
    ) * 25;

    if (mode === "post" || mode === "design") {
      const subtotal = deal.editDays * roleDay;
      if (subtotal <= 0) continue;
      additionalRoleLines.push({
        role,
        days: deal.editDays,
        dayRate: roleDay,
        subtotal,
        phase: "post",
      });
      additionalRolesTotal += subtotal;
    } else {
      const subtotal = deal.shootDays * roleDay;
      if (subtotal <= 0) continue;
      additionalRoleLines.push({
        role,
        days: deal.shootDays,
        dayRate: roleDay,
        subtotal,
        phase: "shoot",
      });
      additionalRolesTotal += subtotal;
    }
  }

  const shoot = primaryShoot;
  const edit = primaryEdit;
  const postDayRate = deal.editDays > 0 ? primaryEdit / deal.editDays : 0;
  const usageLicense =
    deal.usage === "organic"
      ? 0
      : deal.usage === "paid"
        ? adjDay * 1.5
        : adjDay * 2.5;

  const ltvNum = parseMoney(deal.ltv);
  const roiNum = parseInt((deal.roi || "").replace(/[^0-9]/g, ""), 10);
  const ltvRoiRev = ltvNum && roiNum ? ltvNum * roiNum : 0;

  // Annual revenue bracket → proxy value signal when LTV/ROI aren't filled
  const REV_BRACKET: Record<string, number> = {
    "under-500k": 350_000, "500k-2m": 1_250_000, "2m-10m": 6_000_000,
    "10m-50m": 30_000_000, "50m-plus": 75_000_000,
  };
  const annualRevNum = REV_BRACKET[deal.annualRevenue] || 0;
  const projectedRev = ltvRoiRev || annualRevNum * 0.02;

  // Base value multiplier from projected outcome ROI
  let valueMult = 1.0;
  if (projectedRev > 1_000_000) valueMult = 2.2;
  else if (projectedRev > 250_000) valueMult = 1.6;
  else if (projectedRev > 50_000) valueMult = 1.25;

  // Corporate footprint multiplier — enterprise clients absorb higher creative rates
  const CORP_MULT: Record<string, number> = {
    solo: 0.85, small: 1.0, midmarket: 1.2, enterprise: 1.55,
  };
  const corpMult = CORP_MULT[deal.companySize] || 1.0;
  const publicFootprintMult = getPublicFootprintMultiplier(deal);

  // Strategic intent multiplier — exponential weighting for high-conversion objectives
  const INTENT_MULT: Record<string, number> = {
    "content-presence": 1.0, "campaign-window": 1.15,
    "brand-relaunch": 1.3, "paid-media": 1.45,
  };
  const stratMult = INTENT_MULT[deal.why] || 1.0;
  const projectTypeMult = getProjectTypeMultiplier(deal.project);

  // Composite rate multiplier: outcome value × corporate scale × intent × project format
  const compositeMult = valueMult * corpMult * stratMult * publicFootprintMult * projectTypeMult;
  const valuePremium = compositeMult > 1.0;

  // Kit fee: hardware asset rental — not subject to composite multiplier
  const kitDays = isProjectRate
    ? 1
    : deal.shootDays > 0
      ? deal.shootDays
      : deal.editDays > 0
        ? deal.editDays
        : Math.max(preProDays, 1);
  let kitFeeTotal = 0;
  let kitFeeLabel = "";
  if (deal.kitFee === "basic") {
    kitFeeTotal = 250 * kitDays;
    kitFeeLabel = "Basic Camera & Audio Kit";
  } else if (deal.kitFee === "premium") {
    kitFeeTotal = 750 * kitDays;
    kitFeeLabel = "Premium Cinema & Lighting Package";
  } else if (deal.kitFee === "custom") {
    kitFeeTotal = parseMoney(deal.kitFeeCustom) || 0;
    kitFeeLabel = "Custom Gear Package";
  } else if (deal.kitFee === "locker") {
    const activeItems = profile.gearLocker.filter((g) =>
      deal.kitFeeLockerItems.includes(g.id)
    );
    const activeValue = activeItems.reduce(
      (s, g) => s + (parseFloat(g.cost.replace(/,/g, "")) || 0), 0
    );
    const rateMultiplier = parseFloat(deal.kitFeeRate || "0.05");
    const dailyRate = Math.round((activeValue * rateMultiplier) / 5) * 5;
    const lockerSubtotal = dailyRate * kitDays;
    const customAdd = parseMoney(deal.kitFeeCustom) || 0;
    kitFeeTotal = lockerSubtotal + customAdd;
    const rateLabel = `${Math.round(rateMultiplier * 100)}%`;
    kitFeeLabel = customAdd > 0
      ? `Gear Locker + Custom Add-on`
      : `Gear Locker · ${rateLabel} operator rate · ${kitDays} day${kitDays !== 1 ? "s" : ""}`;
  }

  const additionalCrew = (deal.additionalCrew ?? [])
    .map((entry) => {
      const crewRate =
        getEstimatedBaseDayRate(profile, entry.role) * multipliers;
      return buildAdditionalCrewLine(entry, deal, crewRate);
    })
    .filter((line): line is AdditionalCrewLine => Boolean(line));
  const additionalCrewTotal = additionalCrew.reduce((sum, line) => sum + line.total, 0);

  let mediaStorageTotal = 0;
  let mediaStorageLabel = "";
  let mediaStorageDriveNote = "";
  let mediaStorageAmazonHardware = 0;
  if (deal.mediaStorageProvider === "you" && deal.mediaStorageTier) {
    const tier = MEDIA_STORAGE_TIERS.find((t) => t.id === deal.mediaStorageTier);
    if (tier) {
      mediaStorageTotal = tier.amount;
      mediaStorageDriveNote = tier.driveNote;
      mediaStorageAmazonHardware = tier.amazonHardware;
      const holdingNote =
        deal.editDays > 0 ? " · holding through post" : "";
      mediaStorageLabel = `Media storage & data handling · ${tier.label}${holdingNote}`;
    }
  }

  let ditFeeTotal = 0;
  let ditDays = 0;
  let ditDayRate = 0;
  if (deal.chargeDitFee && deal.shootDays > 0) {
    ditDays = deal.shootDays;
    ditDayRate = Math.round(
      getEstimatedBaseDayRate(profile, "DIT") * multipliers,
    );
    ditFeeTotal = ditDayRate * ditDays;
  }

  const passThroughTotal = kitFeeTotal + additionalCrewTotal + mediaStorageTotal + ditFeeTotal;

  // Scope services: each selected service multiplies the base labor
  const scopeServicesMult = (deal.scopeServices ?? []).reduce(
    (acc, sid) => acc + (SCOPE_SERVICE_OPTIONS.find((s) => s.id === sid)?.mult ?? 0),
    0,
  );

  let laborTarget =
    (isProjectRate ? projectSubtotal : shoot + edit + additionalRolesTotal) +
    prePro +
    usageLicense;
  laborTarget *= (1 + scopeServicesMult);
  laborTarget = Math.round((laborTarget * compositeMult) / 50) * 50;
  const target = laborTarget + passThroughTotal;
  const floor = Math.round((laborTarget * 0.8) / 50) * 50 + passThroughTotal;
  const stretch = Math.round((laborTarget * 1.35) / 50) * 50 + passThroughTotal;
  const floorRate = Math.round((laborTarget * 0.65) / 50) * 50 + passThroughTotal;
  const breakEvenSales = ltvNum > 0 ? Math.ceil(target / ltvNum) : null;

  const stanceCapMult =
    { open: 1.2, range: 1.0, "anchor-low": 0.7, hidden: 0.85 }[
      deal.budgetStance
    ] || 1.0;
  const budgetTop = parseBudgetTop(deal.budget) || 0;
  const capacityFromBudget = budgetTop * 1.15;
  const capacityFromRev =
    projectedRev > 0 ? projectedRev * 0.05 : 0;
  let capacity = Math.max(capacityFromBudget, capacityFromRev) * stanceCapMult;
  if (capacity === 0) capacity = target * 0.9;
  capacity = Math.round(capacity / 100) * 100;

  let score = 5;
  const ratio = capacity / target;
  if (ratio >= 1.2) score += 3;
  else if (ratio >= 1.0) score += 2;
  else if (ratio >= 0.85) score += 1;
  else if (ratio >= 0.7) score -= 1;
  else score -= 3;

  if (deal.dm === "yes") score += 1;
  if (deal.dm === "no") score -= 1;
  if (deal.source === "referral") score += 1;
  if (deal.source === "inbound") score += 1;
  if (deal.source === "pitched") score -= 1;
  if (deal.budgetStance === "open") score += 1;
  if (deal.budgetStance === "hidden") score -= 1;
  if (deal.budgetStance === "anchor-low") score -= 2;
  // Outcome intent scoring
  if (deal.why === "paid-media") score += 1;
  if (deal.why === "campaign-window") score += 1;
  if (deal.why === "brand-relaunch") score += 1;

  // Corporate footprint scoring
  if (deal.companySize === "enterprise") score += 2;
  else if (deal.companySize === "midmarket") score += 1;
  else if (deal.companySize === "solo") score -= 1;
  if (["100k-500k", "500k-1m", "1m-plus"].includes(deal.publicAudience)) score += 1;
  if (["established", "enterprise"].includes(deal.brandMaturity)) score += 1;
  if (["premium", "luxury", "b2b"].includes(deal.pricePoint)) score += 1;

  score = Math.max(1, Math.min(10, score));

  let verdict: string;
  let headline: string;
  let rationale: string;
  let mood: Mood;

  if (score >= 8) {
    mood = "good";
    headline = "Strong fit. Push for the full rate.";
    rationale =
      "Their stated range overlaps your fair rate, and the work has a clear ROI driver.";
    verdict = `Take the meeting. Start with a complete scope near $${fmt(stretch)}, then simplify deliverables only if the client needs to land closer to your $${fmt(target)} fair rate.`;
  } else if (score >= 6) {
    mood = "ok";
    headline = "Workable — but you'll have to sell value.";
    rationale =
      "They can probably reach your rate, but they're likely to push back. Lead with discovery, not pricing.";
    verdict = `Take the meeting, but gather the project details before giving a number. Then send the SOW at $${fmt(target)}.`;
  } else if (score >= 4) {
    mood = "soft";
    headline = "Soft. Worth a conversation, not a discount.";
    rationale =
      "Capacity looks tight or the buyer signals are mixed. Don't lower the price — strip scope instead.";
    verdict = `Offer a smaller package at $${fmt(floor)}. Keep your day rate intact. If they won't move, walk.`;
  } else {
    mood = "walk";
    headline = "Walk away.";
    rationale =
      "They can't afford fair rate, decision-maker is unclear, or signals point to a bad-faith negotiation.";
    verdict = `Politely decline. Lowering your rate here resets your floor and trains them to expect it next time. Refer them out.`;
  }

  const crewSplit: CrewSplit = {
    primaryRole,
    productionDayRate: Math.round(adjDay * compositeMult),
    shootDays: isProjectRate ? 0 : deal.shootDays,
    productionSubtotal: Math.round(shoot * compositeMult),
    prePro: Math.round(prePro * compositeMult),
    preProDays,
    pricingMode,
    projectSubtotal: Math.round(projectSubtotal * compositeMult),
    postDayRate: Math.round(postDayRate * compositeMult),
    editDays: isProjectRate ? 0 : deal.editDays,
    postSubtotal: Math.round((isProjectRate ? 0 : edit) * compositeMult),
    additionalRoleLines: additionalRoleLines.map((line) => ({
      ...line,
      dayRate: Math.round(line.dayRate * compositeMult),
      subtotal: Math.round(line.subtotal * compositeMult),
    })),
    additionalRolesTotal: Math.round(additionalRolesTotal * compositeMult),
    hasColor: profile.extras.some((extra) => extra.toLowerCase().includes("color")),
    hasSound: profile.extras.some((extra) => extra.toLowerCase().includes("sound")),
    colorAlloc: profile.extras.some((extra) => extra.toLowerCase().includes("color")) ? Math.round(edit * compositeMult * 0.15) : 0,
    soundAlloc: profile.extras.some((extra) => extra.toLowerCase().includes("sound")) ? Math.round(edit * compositeMult * 0.12) : 0,
    usageLicense: Math.round(usageLicense * compositeMult),
    isMultiRole,
    additionalCrew,
    additionalCrewTotal,
    kitFeeTotal,
    kitFeeLabel,
    mediaStorageTotal,
    mediaStorageLabel,
    mediaStorageDriveNote,
    mediaStorageAmazonHardware,
    ditFeeTotal,
    ditDays,
    ditDayRate,
  };

  return {
    target,
    floor,
    stretch,
    floorRate,
    breakEvenSales,
    capacity,
    score,
    headline,
    rationale,
    verdict,
    mood,
    valuePremium,
    crewSplit,
  };
}

function verdictCardStyle(mood: Mood): CSSProperties {
  switch (mood) {
    case "good":
      return {
        borderColor: "rgba(94,226,160,0.3)",
        background: "rgba(94,226,160,0.05)",
      };
    case "ok":
      return {
        borderColor: "rgba(232,197,122,0.3)",
        background: "rgba(232,197,122,0.06)",
      };
    case "soft":
      return {
        borderColor: "rgba(255,181,71,0.35)",
        background: "rgba(255,181,71,0.06)",
      };
    case "walk":
      return {
        borderColor: "rgba(255,92,92,0.35)",
        background: "rgba(255,92,92,0.06)",
      };
  }
}

const TRADE_OPTIONS = [
  { id: "videographer", label: "Videographer" },
  { id: "video-editor", label: "Video editor" },
  { id: "photographer", label: "Photographer" },
  { id: "designer", label: "Designer" },
  { id: "developer", label: "Developer" },
  { id: "writer", label: "Writer / copy" },
  { id: "marketer", label: "Marketing" },
  { id: "consultant", label: "Consultant" },
  { id: "other", label: "Other" },
];

const EXP_OPTIONS = [
  { id: "beginner", label: "Beginner" },
  { id: "mid", label: "Mid-level" },
  { id: "expert", label: "Expert" },
];

const EXTRA_OPTIONS = [
  { id: "color", label: "Color grading" },
  { id: "sound", label: "Sound design" },
  { id: "motion", label: "Motion graphics" },
  { id: "directing", label: "Directing" },
  { id: "copy", label: "Copywriting" },
  { id: "strategy", label: "Strategy" },
  { id: "branding", label: "Branding" },
  { id: "social", label: "Social media" },
];

const PROJECT_OPTIONS = [
  { id: "brand-video", label: "Brand video" },
  { id: "commercial", label: "Commercial" },
  { id: "youtube", label: "YouTube Video" },
  { id: "music-video", label: "Music Video" },
  { id: "music-content", label: "Music Content" },
  { id: "event", label: "Event" },
  { id: "ads", label: "Ad campaign" },
  { id: "social", label: "Social cutdowns" },
  { id: "docu", label: "Documentary" },
  { id: "retainer", label: "Monthly retainer" },
];

const PROJECT_VERTICALS = [
  "Album Rollout", "Apparel Design", "BTS", "Branded Content", "Branding",
  "Campaign", "Commercial", "Concert Coverage", "Cover Artwork", "Documentary",
  "E-Commerce Shoot", "Editorial", "Event", "Experiential Production", "Fashion Film",
  "Feature Film", "Interior Design", "Live Performance", "Live Stream", "Logo Animation",
  "Lookbook", "Media Kit", "Merch Design", "Music Video", "Packaging Design",
  "Personal Project", "Podcast", "Poster Design", "Press Photos", "Print",
  "Product Design", "Prop Design", "Red Carpet", "Runway", "Short Film",
  "Social Media Content", "Stage Design", "Storyboard", "Street Styling", "TV Show",
  "Test Shoot", "Tour", "User Generated Content", "Video Installation", "Visualizer",
  "Vlog", "Web Series", "Website", "YouTube Video",
];

const SOURCE_OPTIONS = [
  { id: "referral", label: "Referral" },
  { id: "inbound", label: "Cold inbound" },
  { id: "repeat", label: "Repeat" },
  { id: "pitched", label: "I reached out" },
];

const RUSH_OPTIONS = [
  { id: "loose", label: "Loose" },
  { id: "normal", label: "Normal" },
  { id: "rush", label: "Rush" },
];

const USAGE_OPTIONS = [
  { id: "organic", label: "Organic / owned" },
  { id: "paid", label: "Paid digital ads" },
  { id: "broadcast", label: "TV / CTV / OOH" },
];

const PRICING_MODE_OPTIONS = [
  { id: "days", label: "Day rate" },
  { id: "project", label: "Project / flat" },
];

const USAGE_HELPER: Record<string, string> = {
  organic:
    "Client’s own channels only (social, site, email). No paid ads, TV, streaming commercials, or billboards.",
  paid:
    "Paid placement on digital platforms (Meta, TikTok, YouTube, LinkedIn, etc.). Not TV or OOH.",
  broadcast:
    "TV and streaming/CTV spots, plus out-of-home (billboards, transit, airports). Confirm distribution and license scope with the client.",
};

const DM_OPTIONS = [
  { id: "yes", label: "Yes" },
  { id: "no", label: "No" },
  { id: "unclear", label: "Unclear" },
];

const BUDGET_OPTIONS = [
  { id: "open", label: "Open" },
  { id: "range", label: "Gave a range" },
  { id: "anchor-low", label: "Started low" },
  { id: "hidden", label: "Hiding it" },
];

const COMPANY_SIZE_OPTIONS = [
  { id: "solo", label: "Solo Founder" },
  { id: "small", label: "Small Business [2–20]" },
  { id: "midmarket", label: "Mid-Market [21–200]" },
  { id: "enterprise", label: "Enterprise [201+]" },
];

const ANNUAL_REVENUE_OPTIONS = [
  { id: "under-500k", label: "< $500K" },
  { id: "500k-2m", label: "$500K – $2M" },
  { id: "2m-10m", label: "$2M – $10M" },
  { id: "10m-50m", label: "$10M – $50M" },
  { id: "50m-plus", label: "$50M+" },
];

const PUBLIC_AUDIENCE_OPTIONS = [
  { id: "", label: "Followers / unknown" },
  { id: "under-5k", label: "Under 5K" },
  { id: "5k-25k", label: "5K – 25K" },
  { id: "25k-100k", label: "25K – 100K" },
  { id: "100k-500k", label: "100K – 500K" },
  { id: "500k-1m", label: "500K – 1M" },
  { id: "1m-plus", label: "1M+" },
];

const BRAND_MATURITY_OPTIONS = [
  { id: "", label: "Brand maturity / unknown" },
  { id: "new", label: "New / early-stage" },
  { id: "local", label: "Local / boutique" },
  { id: "growth", label: "Growing brand" },
  { id: "established", label: "Established brand" },
  { id: "enterprise", label: "Enterprise / national" },
];

const PRICE_POINT_OPTIONS = [
  { id: "", label: "Price point / unknown" },
  { id: "low", label: "Low-ticket / budget" },
  { id: "mid", label: "Mid-market" },
  { id: "premium", label: "Premium" },
  { id: "luxury", label: "Luxury / high-ticket" },
  { id: "b2b", label: "B2B / contract value" },
];

const INTENT_OPTIONS = [
  { id: "content-presence", label: "Content presence & market consistency" },
  { id: "paid-media", label: "Paid media acquisition & conversion push" },
  { id: "brand-relaunch", label: "Brand re-launch & corporate repositioning" },
  { id: "campaign-window", label: "Time-sensitive product/campaign window" },
];

/** Samsung T7 portable SSD — Amazon.com reference hardware (Mar 2026). */
type MediaStorageTier = {
  id: string;
  label: string;
  driveNote: string;
  amazonHardware: number;
  amount: number;
};

function mediaStorageBillAmount(amazonHardware: number, markupPct = 0.25): number {
  return Math.round((amazonHardware * (1 + markupPct)) / 25) * 25;
}

const MEDIA_STORAGE_TIERS: MediaStorageTier[] = [
  {
    id: "500gb",
    label: "500 GB",
    driveNote: "Samsung T7 500GB (MU-PC500)",
    amazonHardware: 95,
    amount: 0,
  },
  {
    id: "2tb",
    label: "2 TB",
    driveNote: "Samsung T7 2TB (MU-PC2T0)",
    amazonHardware: 305,
    amount: 0,
  },
  {
    id: "5tb",
    label: "5 TB",
    driveNote: "2× Samsung T7 2TB",
    amazonHardware: 610,
    amount: 0,
  },
].map((tier) => ({
  ...tier,
  amount: mediaStorageBillAmount(tier.amazonHardware),
}));

const MEDIA_STORAGE_PROVIDER_OPTIONS = [
  { id: "client", label: "Client provides" },
  { id: "you", label: "You provide" },
] as const;

const SCOPE_SERVICE_OPTIONS: { id: string; label: string; mult: number }[] = [
  { id: "color",    label: "Color grading",         mult: 0.12 },
  { id: "sound",    label: "Sound design & mix",     mult: 0.10 },
  { id: "motion",   label: "Motion graphics",        mult: 0.15 },
  { id: "multicam", label: "Multi-cam syncing",      mult: 0.08 },
  { id: "script",   label: "Script / copy writing",  mult: 0.06 },
  { id: "dit",      label: "DIT / data management",  mult: 0.05 },
  { id: "drone",    label: "Drone / aerial footage",  mult: 0.12 },
  { id: "captions", label: "Captions & subtitles",   mult: 0.04 },
];

type DayMode = "dual" | "production" | "post" | "design";

function getRoleDayMode(role: string): DayMode {
  if (!role) return "dual";
  const r = role.toLowerCase();

  // Post-production: purely downstream of the shoot
  if (
    ["editor", "colorist", "compositor", "color assistant", "color producer",
     "finishing artist", "render artist", "retoucher", "post sound mixer",
     "foley artist", "vfx artist", "vfx supervisor", "cg artist",
     "sound designer", "composer", "music supervisor", "post supervisor",
     "post production", "lead compositor", "assistant editor"].some((k) => r.includes(k))
  ) return "post";

  // Design / digital asset delivery
  if (
    ["graphic designer", "motion designer", "animator", "illustrator",
     "storyboard artist", "concept artist", "ui/ux designer", "web designer",
     "web developer", "packaging designer", "product designer", "digital designer",
     "layout artist", "treatment designer", "title designer", "visual researcher",
     "projection mapping", "3d artist", "ai artist", "fashion illustrator",
     "social media manager", "social media strategist", "copywriter",
     "video growth engineer", "marketing coordinator", "marketing director",
     "marketing manager", "interior designer", "lead animator",
     "animation supervisor", "assistant animator"].some((k) => r.includes(k))
  ) return "design";

  // Physical production with edit component (shoot day + post)
  if (
    ["videographer", "director of photography", "photographer",
     "aerial cinematographer", "drone operator", "fpv drone pilot",
     "content creator", "b camera operator", "2nd unit dp"].some((k) => r.includes(k))
  ) return "dual";

  // Directors drive the full creative lifecycle
  if (r === "director" || r === "co-director" || r === "2nd unit director") return "dual";

  // Everything else: onset / prep / physical labor only
  return "production";
}

function dealNeedsShootDays(deal: Deal): boolean {
  const primary = deal.dealRole || "";
  const primaryMode = primary ? getRoleDayMode(primary) : null;
  if (primaryMode === "production" || primaryMode === "dual") return true;
  return (deal.additionalRoles ?? []).some((role) => {
    if (!role) return false;
    const m = getRoleDayMode(role);
    return m === "production" || m === "dual";
  });
}

function dealNeedsEditDays(deal: Deal): boolean {
  const primary = deal.dealRole || "";
  const primaryMode = primary ? getRoleDayMode(primary) : null;
  if (primaryMode === "post" || primaryMode === "design" || primaryMode === "dual") return true;
  return (deal.additionalRoles ?? []).some((role) => {
    if (!role) return false;
    const m = getRoleDayMode(role);
    return m === "post" || m === "design";
  });
}

/** Minimum 1 day on each phase so live estimate includes additional roles before days are set. */
function withLivePreviewDays(deal: Deal): Deal {
  if (deal.pricingMode === "project") return deal;
  let shootDays = deal.shootDays;
  let editDays = deal.editDays;
  if (dealNeedsShootDays(deal) && shootDays <= 0) shootDays = 1;
  if (dealNeedsEditDays(deal) && editDays <= 0) editDays = 1;
  if (shootDays === deal.shootDays && editDays === deal.editDays) return deal;
  return { ...deal, shootDays, editDays };
}

function getAdditionalRoleChargeMult(deal: Deal): number {
  const pct = deal.additionalRoleChargePct ?? 75;
  return pct / 100;
}

const MAX_ADDITIONAL_SELF_ROLES = 6;

/** Ensure shoot/edit day counts exist when added roles need them in the estimate. */
function bumpDealDaysForAdditionalRoles(deal: Deal, additionalRoles: string[]): Deal {
  let next: Deal = { ...deal, additionalRoles };
  for (const v of additionalRoles) {
    if (!v) continue;
    const mode = getRoleDayMode(v);
    if (
      (mode === "production" || mode === "dual") &&
      next.shootDays <= 0 &&
      dealNeedsShootDays(next)
    ) {
      next = { ...next, shootDays: 1 };
    }
    if (
      (mode === "post" || mode === "design") &&
      next.editDays <= 0 &&
      dealNeedsEditDays(next)
    ) {
      next = { ...next, editDays: 1 };
    }
  }
  return next;
}

function getAdditionalSelfRoleDayRate(profile: Profile, role: string, deal: Deal): number {
  const full = getAdjustedRoleDayRate(profile, role, deal);
  const mult = getAdditionalRoleChargeMult(deal);
  return Math.round((full * mult) / 25) * 25;
}

function getAdjustedRoleDayRate(profile: Profile, role: string, deal: Deal): number {
  const base = getEstimatedBaseDayRate(profile, role);
  const extrasMult = 1 + Math.min(profile.extras.length, 4) * 0.04;
  const locationMult = getLocationMarketMultiplier(profile.location);
  const rushPremium = ({ loose: 0, normal: 0, rush: 0.25, fire: 0.5 } as Record<string, number>)[deal.rush] || 0;
  const usagePremium = ({ organic: 0, paid: 0.25, broadcast: 0.5 } as Record<string, number>)[deal.usage] || 0;
  const premiumLoading = Math.min(rushPremium + usagePremium, 0.5);
  return Math.round((base * extrasMult * locationMult * (1 + premiumLoading)) / 25) * 25;
}

function getAdditionalCrewDayCount(mode: DayMode, deal: Deal): number {
  if (mode === "post" || mode === "design") return Math.max(deal.editDays, 1);
  if (mode === "dual") return Math.max(deal.shootDays + deal.editDays, 1);
  return Math.max(deal.shootDays, 1);
}

function getAdditionalCrewPhase(mode: DayMode): "shoot" | "post" | "project" {
  if (mode === "post" || mode === "design") return "post";
  if (mode === "dual") return "project";
  return "shoot";
}

function buildAdditionalCrewLine(
  entry: AdditionalCrewEntry,
  deal: Deal,
  dayRate: number,
): AdditionalCrewLine | null {
  if (!entry.role) return null;
  const qty = Math.max(1, Math.min(99, entry.qty || 1));
  const mode = getRoleDayMode(entry.role);
  const days = getAdditionalCrewDayCount(mode, deal);
  const rate = Math.round(dayRate);
  const total = rate * days * qty;
  return {
    id: entry.role,
    label: qty > 1 ? `${entry.role} × ${qty}` : entry.role,
    rate,
    days,
    qty,
    total,
    phase: getAdditionalCrewPhase(mode),
  };
}

const NOVA_ROLES = MIMS_ROLES;

const ADDITIONAL_ROLE_OPTIONS = MIMS_ROLES.map((role) => ({
  id: role,
  label: role,
}));

const ADDITIONAL_ROLE_CHARGE_OPTIONS = [
  { id: "50", label: "50% of day rate" },
  { id: "60", label: "60% of day rate" },
  { id: "75", label: "75% of day rate" },
];

const POPULAR_ROLES = POPULAR_MIMS_ROLES;

function RoleSearchInput({
  value,
  onChange,
  placeholder,
  allowClear,
  excludeRole,
  excludeRoles,
}: {
  value: string;
  onChange: (role: string) => void;
  placeholder?: string;
  allowClear?: boolean;
  excludeRole?: string;
  excludeRoles?: string[];
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const displayValue = open ? query : query || value;

  const excluded = new Set([...(excludeRoles ?? []), ...(excludeRole ? [excludeRole] : [])]);
  const rolePool = excluded.size ? NOVA_ROLES.filter((r) => !excluded.has(r)) : NOVA_ROLES;
  const popularPool = excluded.size ? POPULAR_ROLES.filter((r) => !excluded.has(r)) : POPULAR_ROLES;

  const filtered = query.trim()
    ? rolePool.filter((r) => r.toLowerCase().includes(query.toLowerCase())).slice(0, 12)
    : popularPool;

  useEffect(() => {
    function outside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, []);

  const select = (role: string) => {
    setQuery("");
    onChange(role);
    setOpen(false);
  };

  const commitQuery = () => {
    const q = query.trim();
    if (!q) {
      setQuery("");
      return;
    }
    const exact = MIMS_ROLES.find((r) => r.toLowerCase() === q.toLowerCase());
    if (exact) select(exact);
    else setQuery("");
  };

  return (
    <div ref={wrapperRef}>
      <div style={{ position: "relative" }}>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
          style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", pointerEvents: "none", zIndex: 1 }}
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          placeholder={
            placeholder ??
            (value ? "Search to change position…" : `Search ${MIMS_ROLES.length} positions… e.g. Director of Photography`)
          }
          value={displayValue}
          autoComplete="off"
          onFocus={() => setOpen(true)}
          onBlur={() => {
            window.setTimeout(() => {
              setOpen(false);
              commitQuery();
            }, 120);
          }}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          style={{
            width: "100%",
            background: "var(--surface)",
            border: `1px solid ${open ? "var(--gold)" : value ? "rgba(232,197,122,0.3)" : "var(--border)"}`,
            borderRadius: open ? "12px 12px 0 0" : "12px",
            padding: "14px 14px 14px 42px",
            color: "var(--text)", fontSize: 15, fontFamily: "inherit",
            outline: "none",
            transition: "border-color 0.15s ease",
            boxSizing: "border-box",
          }}
        />
      </div>

      {open && (
        <div style={{
          background: "var(--elevated)",
          border: "1px solid var(--gold)",
          borderTop: "1px solid var(--border)",
          borderRadius: "0 0 12px 12px",
          overflowY: "auto",
          maxHeight: 224,
          boxShadow: "0 16px 40px rgba(0,0,0,0.4)",
        }}>
          {allowClear && value && (
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); select(""); }}
              style={{
                display: "block", width: "100%", textAlign: "left",
                padding: "11px 16px",
                background: "transparent",
                border: "none",
                borderBottom: "1px solid var(--border)",
                color: "var(--text-3)",
                fontSize: 14, cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              No additional role
            </button>
          )}
          {!query.trim() && filtered.length > 0 && (
            <div style={{ padding: "10px 16px 4px", fontSize: 11, color: "var(--text-3)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>
              Popular
            </div>
          )}
          {filtered.length === 0 ? (
            <div style={{ padding: "14px 16px", fontSize: 13, color: "var(--text-3)" }}>
              No match — try a different spelling
            </div>
          ) : filtered.map((role, i) => (
            <button
              key={role}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); select(role); }}
              style={{
                display: "block", width: "100%", textAlign: "left",
                padding: "11px 16px",
                background: "transparent",
                border: "none",
                borderTop: i > 0 ? "1px solid var(--border)" : "none",
                color: "var(--text)",
                fontSize: 14, cursor: "pointer",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(232,197,122,0.07)";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--gold)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--text)";
              }}
            >
              {role}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function AdditionalCrewPicker({
  entries,
  onChange,
  deal,
  profile,
}: {
  entries: AdditionalCrewEntry[];
  onChange: (entries: AdditionalCrewEntry[]) => void;
  deal: Deal;
  profile: Profile;
}) {
  const [pickRole, setPickRole] = useState("");
  const addedRoles = entries.map((e) => e.role);

  const addRole = (role: string) => {
    if (!role || addedRoles.includes(role)) return;
    onChange([...entries, { role, qty: 1 }]);
    setPickRole("");
  };

  const setQty = (role: string, qty: number) => {
    onChange(
      entries.map((e) =>
        e.role === role ? { ...e, qty: Math.max(1, Math.min(99, qty)) } : e,
      ),
    );
  };

  const removeRole = (role: string) => {
    onChange(entries.filter((e) => e.role !== role));
  };

  const lineEstimate = (entry: AdditionalCrewEntry) => {
    const rate = getEstimatedBaseDayRate(profile, entry.role);
    return buildAdditionalCrewLine(entry, deal, rate)?.total ?? 0;
  };

  const crewTotal = entries.reduce((sum, entry) => sum + lineEstimate(entry), 0);

  const qtyBtnStyle: CSSProperties = {
    width: 32,
    height: 32,
    borderRadius: 8,
    border: "1px solid var(--border)",
    background: "var(--surface)",
    color: "var(--text)",
    fontSize: 16,
    lineHeight: 1,
    cursor: "pointer",
    fontFamily: "inherit",
  };

  return (
    <div>
      <RoleSearchInput
        value={pickRole}
        onChange={addRole}
        placeholder="Search crew to add… e.g. Editor, Grip, Gaffer"
        excludeRoles={addedRoles}
      />
      <p className="helper" style={{ marginTop: 6 }}>
        Add each role once, then set how many people you need (e.g. 2 Editors, 3 Grips).
      </p>

      {entries.length > 0 && (
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          {entries.map((entry) => {
            const mode = getRoleDayMode(entry.role);
            const days = getAdditionalCrewDayCount(mode, deal);
            const rate = getEstimatedBaseDayRate(profile, entry.role);
            const subtotal = lineEstimate(entry);
            return (
              <div
                key={entry.role}
                style={{
                  padding: "12px 12px 10px",
                  borderRadius: 12,
                  border: "1px solid rgba(232,197,122,0.22)",
                  background: "rgba(232,197,122,0.04)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{entry.role}</div>
                    <div style={{ fontSize: 11, color: "var(--text-3)" }}>
                      ${fmt(rate)}/day · {days} day{days !== 1 ? "s" : ""} each
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeRole(entry.role)}
                    aria-label={`Remove ${entry.role}`}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--text-3)",
                      cursor: "pointer",
                      fontSize: 18,
                      lineHeight: 1,
                      padding: 4,
                    }}
                  >
                    ×
                  </button>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                      Qty
                    </span>
                    <button
                      type="button"
                      aria-label={`Decrease ${entry.role} count`}
                      onClick={() => setQty(entry.role, entry.qty - 1)}
                      disabled={entry.qty <= 1}
                      style={{ ...qtyBtnStyle, opacity: entry.qty <= 1 ? 0.35 : 1 }}
                    >
                      −
                    </button>
                    <span style={{ minWidth: 20, textAlign: "center", fontSize: 15, fontWeight: 700 }}>{entry.qty}</span>
                    <button
                      type="button"
                      aria-label={`Increase ${entry.role} count`}
                      onClick={() => setQty(entry.role, entry.qty + 1)}
                      disabled={entry.qty >= 99}
                      style={{ ...qtyBtnStyle, opacity: entry.qty >= 99 ? 0.35 : 1 }}
                    >
                      +
                    </button>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--gold)" }}>${fmt(subtotal)}</span>
                </div>
              </div>
            );
          })}
          <div style={{ padding: "9px 12px", borderRadius: 10, background: "rgba(232,197,122,0.05)", border: "1px solid rgba(232,197,122,0.18)" }}>
            <div style={{ fontSize: 11, color: "var(--gold)", fontWeight: 700 }}>
              +${fmt(crewTotal)} estimated crew added
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdditionalRolesPicker({
  roles,
  onRolesChange,
  chargePct,
  onChargePctChange,
  deal,
  profile,
  primaryRole,
}: {
  roles: string[];
  onRolesChange: (roles: string[]) => void;
  chargePct: 50 | 60 | 75;
  onChargePctChange: (pct: 50 | 60 | 75) => void;
  deal: Deal;
  profile: Profile;
  primaryRole: string;
}) {
  const [pickRole, setPickRole] = useState("");
  const previewDeal = withLivePreviewDays(deal);
  const atMax = roles.length >= MAX_ADDITIONAL_SELF_ROLES;

  const addRole = (role: string) => {
    if (!role || role === primaryRole || roles.includes(role) || atMax) return;
    onRolesChange([...roles, role]);
    setPickRole("");
  };

  const removeRole = (role: string) => {
    onRolesChange(roles.filter((r) => r !== role));
  };

  const excludeRoles = [primaryRole, ...roles].filter(Boolean);

  return (
    <div>
      <RoleSearchInput
        value={pickRole}
        onChange={addRole}
        placeholder={
          atMax
            ? `Maximum ${MAX_ADDITIONAL_SELF_ROLES} additional roles`
            : "Search roles you also perform… e.g. Editor, Colorist"
        }
        excludeRoles={excludeRoles}
      />
      <p className="helper" style={{ marginTop: 6 }}>
        Add every hat you wear on this job besides your primary position. Each bills at the rate below (not full day
        rate). Production roles use shoot days; post and design use edit days.
      </p>

      {roles.length > 0 && (
        <>
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            {roles.map((role) => {
              const mode = getRoleDayMode(role);
              const charged = getAdditionalSelfRoleDayRate(profile, role, deal);
              const full = getAdjustedRoleDayRate(profile, role, deal);
              const days =
                mode === "post" || mode === "design"
                  ? previewDeal.editDays
                  : previewDeal.shootDays;
              const phase =
                mode === "post" || mode === "design"
                  ? "edit"
                  : mode === "dual"
                    ? "shoot + edit"
                    : "shoot";
              return (
                <div
                  key={role}
                  style={{
                    padding: "12px 12px 10px",
                    borderRadius: 12,
                    border: "1px solid rgba(232,197,122,0.22)",
                    background: "rgba(232,197,122,0.04)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{role}</div>
                      <div style={{ fontSize: 11, color: "var(--text-3)" }}>
                        ${fmt(charged)}/day ({chargePct}% of ${fmt(full)}) · {days} {phase} day
                        {days !== 1 ? "s" : ""}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeRole(role)}
                      aria-label={`Remove ${role}`}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--text-3)",
                        cursor: "pointer",
                        fontSize: 18,
                        lineHeight: 1,
                        padding: 4,
                      }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 14 }}>
            <label style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 8, display: "block" }}>
              Rate for all additional roles (primary stays full)
            </label>
            <Seg
              options={ADDITIONAL_ROLE_CHARGE_OPTIONS}
              value={String(chargePct)}
              onChange={(v) => onChargePctChange(Number(v) as 50 | 60 | 75)}
            />
            <p className="helper" style={{ marginTop: 8, marginBottom: 0 }}>
              Your primary position is always full MIMS day rate. Every role above bills at {chargePct}% of that
              role&apos;s day rate. 75% is client-friendly; 50% is aggressive when you stack many hats.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function ProjectSearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const displayValue = open ? query : query || value;

  const filtered = query.trim()
    ? PROJECT_VERTICALS.filter((v) => v.toLowerCase().includes(query.toLowerCase()))
    : PROJECT_VERTICALS;

  useEffect(() => {
    function outside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, []);

  const select = (v: string) => {
    setQuery("");
    onChange(v);
    setOpen(false);
  };

  return (
    <div ref={wrapperRef}>
      <div style={{ position: "relative" }}>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
          style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", pointerEvents: "none", zIndex: 1 }}
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          placeholder={value ? "Search to change project type…" : "Search 49 project types… e.g. YouTube Video"}
          value={displayValue}
          autoComplete="off"
          onFocus={() => setOpen(true)}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          style={{
            width: "100%",
            background: "var(--surface)",
            border: `1px solid ${open ? "var(--gold)" : value ? "rgba(232,197,122,0.3)" : "var(--border)"}`,
            borderRadius: open ? "12px 12px 0 0" : "12px",
            padding: "14px 14px 14px 42px",
            color: "var(--text)", fontSize: 15, fontFamily: "inherit",
            outline: "none",
            transition: "border-color 0.15s ease",
            boxSizing: "border-box",
          }}
        />
      </div>
      {open && (
        <div style={{
          background: "var(--elevated)",
          border: "1px solid var(--gold)",
          borderTop: "1px solid var(--border)",
          borderRadius: "0 0 12px 12px",
          overflowY: "auto",
          maxHeight: 224,
          boxShadow: "0 16px 40px rgba(0,0,0,0.4)",
        }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "14px 16px", fontSize: 13, color: "var(--text-3)" }}>
              No match — try a different spelling
            </div>
          ) : filtered.map((v, i) => (
            <button
              key={v}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); select(v); }}
              style={{
                display: "block", width: "100%", textAlign: "left",
                padding: "11px 16px",
                background: "transparent",
                border: "none",
                borderTop: i > 0 ? "1px solid var(--border)" : "none",
                color: "var(--text)",
                fontSize: 14, cursor: "pointer",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(232,197,122,0.07)";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--gold)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--text)";
              }}
            >
              {v}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SpinCounter({
  label,
  value,
  onChange,
  min = 0,
  max = 30,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  const clamp = (n: number) => {
    const clamped = Math.max(min, Math.min(max, n));
    return Math.round(clamped / step) * step;
  };
  const displayValue = Number.isInteger(value) ? value.toString() : value.toFixed(1);
  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-2)", marginBottom: 8 }}>
        {label}
      </div>
      <div
        style={{
          display: "flex", alignItems: "center",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 12, height: 52,
          userSelect: "none", overflow: "hidden",
        }}
        onWheel={(e) => { e.preventDefault(); onChange(clamp(value + (e.deltaY < 0 ? step : -step))); }}
      >
        <button
          type="button"
          onClick={() => onChange(clamp(value - step))}
          disabled={value <= min}
          style={{
            width: 44, height: "100%", background: "transparent", border: "none",
            borderRight: "1px solid var(--border)",
            color: value <= min ? "var(--border-2)" : "var(--text-2)",
            cursor: value <= min ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            transition: "color 0.12s ease",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path d="M5 12h14" />
          </svg>
        </button>
        <div style={{
          flex: 1, textAlign: "center",
          fontSize: 22, fontWeight: 700, letterSpacing: "-0.03em",
          color: value === 0 ? "var(--text-3)" : "var(--text)",
          transition: "color 0.12s ease",
        }}>
          {value === 0 ? "" : displayValue}
        </div>
        <button
          type="button"
          onClick={() => onChange(clamp(value + step))}
          disabled={value >= max}
          style={{
            width: 44, height: "100%", background: "transparent", border: "none",
            borderLeft: "1px solid var(--border)",
            color: value >= max ? "var(--border-2)" : "var(--text-2)",
            cursor: value >= max ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            transition: "color 0.12s ease",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function IconBack({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="icon-btn" onClick={onClick} aria-label="Back">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M15 6l-6 6 6 6" />
      </svg>
    </button>
  );
}

function SkillsMultiSearch({
  values,
  onChange,
}: {
  values: string[];
  onChange: (next: string[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = (query.trim()
    ? NOVA_ROLES.filter((role) => role.toLowerCase().includes(query.toLowerCase()))
    : POPULAR_ROLES
  )
    .filter((role) => !values.includes(role))
    .slice(0, 14);

  useEffect(() => {
    function outside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, []);

  const addSkill = (skill: string) => {
    if (!values.includes(skill)) onChange([...values, skill]);
    setQuery("");
    setOpen(false);
    inputRef.current?.focus();
  };

  const removeSkill = (skill: string) => {
    onChange(values.filter((value) => value !== skill));
  };

  return (
    <div ref={wrapperRef}>
      {values.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
          {values.map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => removeSkill(skill)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                padding: "7px 10px",
                borderRadius: 999,
                border: "1px solid rgba(232,197,122,0.3)",
                background: "rgba(232,197,122,0.07)",
                color: "var(--text)",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {skill}
              <span style={{ color: "var(--gold)", fontSize: 14, lineHeight: 1 }}>×</span>
            </button>
          ))}
        </div>
      )}

      <div style={{ position: "relative" }}>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
          style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", pointerEvents: "none", zIndex: 1 }}
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search 200+ skills and positions…"
          value={query}
          autoComplete="off"
          onFocus={() => setOpen(true)}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          style={{
            width: "100%",
            background: "var(--surface)",
            border: `1px solid ${open ? "var(--gold)" : "var(--border)"}`,
            borderRadius: open ? "12px 12px 0 0" : "12px",
            padding: "14px 14px 14px 42px",
            color: "var(--text)", fontSize: 15, fontFamily: "inherit",
            outline: "none",
            transition: "border-color 0.15s ease",
            boxSizing: "border-box",
          }}
        />
      </div>

      {open && (
        <div style={{
          background: "var(--elevated)",
          border: "1px solid var(--gold)",
          borderTop: "1px solid var(--border)",
          borderRadius: "0 0 12px 12px",
          overflowY: "auto",
          maxHeight: 224,
          boxShadow: "0 16px 40px rgba(0,0,0,0.4)",
        }}>
          {!query.trim() && (
            <div style={{ padding: "10px 16px 4px", fontSize: 11, color: "var(--text-3)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>
              Popular
            </div>
          )}
          {filtered.length === 0 ? (
            <div style={{ padding: "14px 16px", fontSize: 13, color: "var(--text-3)" }}>
              No available match
            </div>
          ) : filtered.map((skill, i) => (
            <button
              key={skill}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); addSkill(skill); }}
              style={{
                display: "block", width: "100%", textAlign: "left",
                padding: "11px 16px",
                background: "transparent",
                border: "none",
                borderTop: i > 0 ? "1px solid var(--border)" : "none",
                color: "var(--text)",
                fontSize: 14, cursor: "pointer",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(232,197,122,0.07)";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--gold)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--text)";
              }}
            >
              {skill}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ChipGroup({
  options,
  value,
  values,
  multi = false,
  onChange,
}: {
  options: { id: string; label: string }[];
  value?: string;
  values?: string[];
  multi?: boolean;
  onChange: (next: string | string[]) => void;
}) {
  return (
    <div className="chips">
      {options.map((opt) => {
        const active = multi
          ? (values ?? []).includes(opt.id)
          : value === opt.id;
        return (
          <div
            key={opt.id}
            role="button"
            tabIndex={0}
            className={`chip${active ? " active" : ""}`}
            onClick={() => {
              if (multi) {
                const set = new Set(values ?? []);
                if (set.has(opt.id)) set.delete(opt.id);
                else set.add(opt.id);
                onChange([...set]);
              } else {
                onChange(opt.id);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                (e.currentTarget as HTMLDivElement).click();
              }
            }}
          >
            {opt.label}
          </div>
        );
      })}
    </div>
  );
}

function Seg({
  options,
  value,
  onChange,
}: {
  options: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="seg">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          className={value === opt.id ? "active" : ""}
          onClick={() => onChange(opt.id)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function TabBar({
  active,
  onNavigate,
}: {
  active: ScreenId;
  onNavigate: (id: ScreenId) => void;
}) {
  const tabs: { id: ScreenId; label: string; icon: ReactNode }[] = [
    {
      id: "home",
      label: "Home",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M3 12L12 3l9 9" />
          <path d="M5 10v10h14V10" />
        </svg>
      ),
    },
    {
      id: "deals",
      label: "Deals",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M8 2v4M16 2v4M3 10h18" />
        </svg>
      ),
    },
    {
      id: "library",
      label: "Library",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M4 19V5a2 2 0 012-2h12v18H6a2 2 0 01-2-2z" />
          <path d="M9 7h6M9 11h6" />
        </svg>
      ),
    },
    {
      id: "profile",
      label: "You",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
        </svg>
      ),
    },
  ];

  return (
    <div className="tabbar">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`tab${active === tab.id ? " active" : ""}`}
          onClick={() => onNavigate(tab.id)}
        >
          <div className="tab-ico">{tab.icon}</div>
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function DealItem({
  initials,
  avatarStyle,
  title,
  meta,
  badge,
  badgeClass,
  onClick,
}: {
  initials: string;
  avatarStyle: CSSProperties;
  title: string;
  meta: string;
  badge: string;
  badgeClass: string;
  onClick: () => void;
}) {
  return (
    <button type="button" className="deal-item" onClick={onClick}>
      <div className="avatar" style={avatarStyle}>
        {initials}
      </div>
      <div style={{ flex: 1 }}>
        <h4>{title}</h4>
        <div className="meta">{meta}</div>
      </div>
      <span className={`badge ${badgeClass}`}>{badge}</span>
    </button>
  );
}

type InvoiceDraft = {
  invoiceNumber: string;
  billedToName: string;
  billedToContact: string;
  billedToEmail: string;
  issuedDate: string;
  dueDate: string;
  terms: string;
  depositPercent: string;
  paymentNote: string;
};

type SowLineItem = {
  id: string;
  description: string;
  amount: number;
};

type SowRoleRow = {
  id: string;
  label: string;
  note: string;
};

type SowDraft = {
  creator: string;
  client: string;
  version: string;
  docDate: string;
  projectDescription: string;
  roles: SowRoleRow[];
  lineItems: SowLineItem[];
  usageRights: string;
  revisions: string;
  total: string;
  depositPercent: string;
  paymentSchedule: string;
  cancellation: string;
};

type InvoiceLine = {
  item: string;
  qty: string;
  rate: number;
  amount: number;
};

function buildScopeServiceLines(deal: Deal, cs: CrewSplit): Array<{ label: string; amount: number }> {
  const scopeBase =
    cs.pricingMode === "project"
      ? cs.projectSubtotal + cs.prePro
      : cs.postSubtotal + cs.productionSubtotal;
  return SCOPE_SERVICE_OPTIONS.filter((s) => (deal.scopeServices ?? []).includes(s.id))
    .map((s) => ({ label: s.label, amount: Math.round(scopeBase * s.mult) }))
    .filter((s) => s.amount > 0);
}

function buildInvoiceLines(deal: Deal, result: Recommendation | null, profile: Profile): InvoiceLine[] {
  const cs = result?.crewSplit;
  const primaryRole = deal.dealRole || profile.trade || "Creative services";
  if (!cs) {
    return [{
      item: `${primaryRole}${deal.project ? ` · ${deal.project}` : ""}`,
      qty: "1",
      rate: result?.target ?? 0,
      amount: result?.target ?? 0,
    }];
  }

  const lines: InvoiceLine[] = [];
  if (cs.pricingMode === "project" && cs.projectSubtotal > 0) {
    lines.push({
      item: `${primaryRole} · project fee (flat)`,
      qty: "1",
      rate: cs.projectSubtotal,
      amount: cs.projectSubtotal,
    });
  }
  if (cs.shootDays > 0 && cs.productionSubtotal > 0) {
    lines.push({
      item: `${primaryRole} production / shoot`,
      qty: String(cs.shootDays),
      rate: cs.productionDayRate,
      amount: cs.productionSubtotal,
    });
  }
  for (const line of cs.additionalRoleLines.filter((l) => l.phase === "shoot")) {
    lines.push({
      item: `${line.role} production / shoot`,
      qty: String(line.days),
      rate: line.dayRate,
      amount: line.subtotal,
    });
  }
  if (cs.prePro > 0) {
    const preQty = cs.preProDays > 0 ? String(cs.preProDays) : "1";
    const preRate = cs.preProDays > 0 ? Math.round(cs.prePro / cs.preProDays) : cs.prePro;
    lines.push({
      item:
        cs.preProDays > 0
          ? `Pre-production & prep (${cs.preProDays} day${cs.preProDays !== 1 ? "s" : ""})`
          : "Pre-production & prep",
      qty: preQty,
      rate: preRate,
      amount: cs.prePro,
    });
  }
  if (cs.editDays > 0 && cs.postSubtotal > 0) {
    const baseLabel =
      getRoleDayMode(primaryRole) === "design"
        ? "Design / working days"
        : "Post-production / edit days";
    lines.push({
      item: `${primaryRole} · ${baseLabel.toLowerCase()}`,
      qty: String(cs.editDays),
      rate: cs.postDayRate,
      amount: cs.postSubtotal,
    });
  }
  for (const line of cs.additionalRoleLines.filter((l) => l.phase === "post")) {
    lines.push({
      item: `${line.role} · post-production / edit days`,
      qty: String(line.days),
      rate: line.dayRate,
      amount: line.subtotal,
    });
  }
  for (const svc of SCOPE_SERVICE_OPTIONS.filter((s) => (deal.scopeServices ?? []).includes(s.id))) {
    const scopeBase =
      cs.pricingMode === "project"
        ? cs.projectSubtotal + cs.prePro
        : cs.postSubtotal + cs.productionSubtotal;
    const amount = Math.round(scopeBase * svc.mult);
    if (amount > 0) lines.push({ item: svc.label, qty: "1", rate: amount, amount });
  }
  for (const crew of cs.additionalCrew) {
    const crewDays = crew.days * crew.qty;
    lines.push({
      item: `Additional crew · ${crew.label}`,
      qty: String(crewDays),
      rate: crew.rate,
      amount: crew.total,
    });
  }
  if (cs.usageLicense > 0) {
    lines.push({
      item: `Usage & licensing rights · ${deal.usage}`,
      qty: "1",
      rate: cs.usageLicense,
      amount: cs.usageLicense,
    });
  }
  if (cs.mediaStorageTotal > 0) {
    lines.push({
      item: cs.mediaStorageLabel || "Media storage & data handling",
      qty: "1",
      rate: cs.mediaStorageTotal,
      amount: cs.mediaStorageTotal,
    });
  }
  if (cs.ditFeeTotal > 0) {
    lines.push({
      item: "DIT / on-set data management",
      qty: String(cs.ditDays),
      rate: cs.ditDayRate,
      amount: cs.ditFeeTotal,
    });
  }
  if (cs.kitFeeTotal > 0) {
    lines.push({
      item: cs.kitFeeLabel || "Equipment / kit rental",
      qty: "1",
      rate: cs.kitFeeTotal,
      amount: cs.kitFeeTotal,
    });
  }

  const lineTotal = lines.reduce((sum, line) => sum + line.amount, 0);
  const target = result?.target ?? lineTotal;
  const adjustment = target - lineTotal;
  if (Math.abs(adjustment) >= 25) {
    lines.push({
      item: adjustment > 0 ? "Market / scope pricing adjustment" : "Estimate rounding adjustment",
      qty: "1",
      rate: adjustment,
      amount: adjustment,
    });
  }
  return lines;
}

function InvoicePreview({ deal, result, profile, draft }: { deal: Deal; result: Recommendation | null; profile: Profile; draft: InvoiceDraft }) {
  const creator = profile.name || "Your Studio";
  const creatorEmail = profile.email || "you@studio.com";
  const lines = buildInvoiceLines(deal, result, profile);
  const subtotal = lines.reduce((sum, line) => sum + line.amount, 0);
  const depositPercent = Math.max(0, Math.min(100, parseFloat(draft.depositPercent) || 0));
  const deposit = Math.round(subtotal * (depositPercent / 100) * 100) / 100;
  const formatMoney = (n: number) => {
    const hasCents = Math.round(n * 100) % 100 !== 0;
    return n.toLocaleString("en-US", {
      minimumFractionDigits: hasCents ? 2 : 0,
      maximumFractionDigits: 2,
    });
  };
  const issued = draft.issuedDate ? new Date(`${draft.issuedDate}T00:00:00`) : new Date("2026-01-01T00:00:00");
  const due = draft.dueDate ? new Date(`${draft.dueDate}T00:00:00`) : issued;
  const dateFmt = (date: Date) => date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="doc-preview">
      <div className="doc-head">
        <div>
          <h2>INVOICE</h2>
          <div className="label-sm" style={{ marginTop: 4 }}>
            #{draft.invoiceNumber || "MIMS-DRAFT"}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 700 }}>{creator}</div>
          <div style={{ color: "#6F6F6F", fontSize: 12 }}>{creatorEmail}</div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
          marginBottom: 14,
        }}
      >
        <div>
          <div className="label-sm">Billed to</div>
          <div style={{ fontWeight: 600, marginTop: 2 }}>{draft.billedToName || deal.client || "Client name"}</div>
          <div style={{ color: "#6F6F6F" }}>{draft.billedToContact || "Accounts Payable"}</div>
          <div style={{ color: "#6F6F6F" }}>{draft.billedToEmail || "billing@example.com"}</div>
        </div>
        <div>
          <div className="label-sm">Issued</div>
          <div style={{ marginTop: 2 }}>{dateFmt(issued)}</div>
          <div className="label-sm" style={{ marginTop: 8 }}>
            Due
          </div>
          <div>{draft.terms || "Net 14"} · {dateFmt(due)}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th style={{ textAlign: "right" }}>Qty</th>
            <th style={{ textAlign: "right" }}>Rate</th>
            <th style={{ textAlign: "right" }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line, index) => (
            <tr key={`${line.item}-${index}`}>
              <td>{line.item}</td>
              <td style={{ textAlign: "right" }}>{line.qty}</td>
              <td style={{ textAlign: "right" }}>${fmt(Math.round(line.rate))}</td>
              <td style={{ textAlign: "right" }}>${fmt(Math.round(line.amount))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 13,
          paddingTop: 8,
        }}
      >
        <span style={{ color: "#6F6F6F" }}>Subtotal</span>
        <span>${fmt(Math.round(subtotal))}</span>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 13,
          marginTop: 6,
        }}
      >
        <span style={{ color: "#6F6F6F" }}>{depositPercent}% deposit (due now)</span>
        <span>${formatMoney(deposit)}</span>
      </div>

      <div className="total">
        <span>Total due</span>
        <span>${fmt(Math.round(subtotal))}</span>
      </div>

      <div
        style={{
          marginTop: 16,
          fontSize: 11,
          color: "#888",
          lineHeight: 1.5,
        }}
      >
        {draft.paymentNote || "Payment via ACH or wire. Late fees of 1.5%/mo accrue after 30 days. Project license activates on final payment."}
      </div>
      <DocLegalFooter />
    </div>
  );
}

function buildSowLineItems(deal: Deal, result: Recommendation | null, profile: Profile): SowLineItem[] {
  const primaryRole = deal.dealRole || profile.trade || "Creative";
  const selectedServices = SCOPE_SERVICE_OPTIONS.filter((s) => (deal.scopeServices ?? []).includes(s.id));
  const cs = result?.crewSplit;
  const lines: SowLineItem[] = [];
  const push = (description: string, amount: number) => {
    if (amount <= 0) return;
    lines.push({ id: `${description}-${amount}-${lines.length}`, description, amount });
  };

  if (!cs) return lines;

  if (cs.pricingMode === "project" && cs.projectSubtotal > 0) {
    push(`${primaryRole} · project fee (flat)`, cs.projectSubtotal);
  }
  if (cs.shootDays > 0 && cs.productionSubtotal > 0) {
    push(
      `${primaryRole} · production / shoot (${cs.shootDays} day${cs.shootDays !== 1 ? "s" : ""})`,
      cs.productionSubtotal,
    );
  }
  cs.additionalRoleLines
    .filter((line) => line.phase === "shoot")
    .forEach((line) => {
      push(
        `${line.role} · production / shoot (${line.days} day${line.days !== 1 ? "s" : ""})`,
        line.subtotal,
      );
    });
  if (cs.prePro > 0) {
    const preLabel =
      cs.preProDays > 0
        ? `Pre-production & prep (${cs.preProDays} day${cs.preProDays !== 1 ? "s" : ""})`
        : "Pre-production & prep";
    push(preLabel, cs.prePro);
  }
  if (cs.editDays > 0 && cs.postSubtotal > 0) {
    push(
      `${primaryRole} · post-production / edit (${cs.editDays} day${cs.editDays !== 1 ? "s" : ""})`,
      cs.postSubtotal,
    );
  }
  cs.additionalRoleLines
    .filter((line) => line.phase === "post")
    .forEach((line) => {
      push(
        `${line.role} · post-production / edit (${line.days} day${line.days !== 1 ? "s" : ""})`,
        line.subtotal,
      );
    });
  const scopeLaborBase =
    cs.pricingMode === "project"
      ? cs.projectSubtotal + cs.prePro
      : cs.postSubtotal + cs.productionSubtotal;
  selectedServices.forEach((svc) => {
    const lineAmt = Math.round(scopeLaborBase * svc.mult);
    push(svc.label, lineAmt);
  });
  if (cs.usageLicense > 0) push("Usage & licensing rights", cs.usageLicense);
  cs.additionalCrew.forEach((crew) => {
    push(
      `Additional crew · ${crew.label} (${crew.qty} × ${crew.days} day${crew.days !== 1 ? "s" : ""})`,
      crew.total,
    );
  });
  if (cs.mediaStorageTotal > 0) push(cs.mediaStorageLabel, cs.mediaStorageTotal);
  if (cs.ditFeeTotal > 0) {
    push(
      `DIT / on-set data management (${cs.ditDays} day${cs.ditDays !== 1 ? "s" : ""})`,
      cs.ditFeeTotal,
    );
  }
  if (cs.kitFeeTotal > 0) push("Equipment / kit rental", cs.kitFeeTotal);
  return lines;
}

function buildSowRoles(deal: Deal, profile: Profile): SowRoleRow[] {
  const primaryRole = deal.dealRole || profile.trade || "Creative";
  const roles: SowRoleRow[] = [
    { id: "primary", label: primaryRole, note: "Primary · full day rate" },
  ];
  (deal.additionalRoles ?? []).forEach((rid) => {
    if (!rid || rid === deal.dealRole) return;
    const rl = ADDITIONAL_ROLE_OPTIONS.find((r) => r.id === rid);
    if (rl) {
      roles.push({
        id: rid,
        label: rl.label,
        note: `Additional role · ${deal.additionalRoleChargePct ?? 75}% of catalog day rate`,
      });
    }
  });
  return roles;
}

function buildDefaultSowDraft(deal: Deal, result: Recommendation | null, profile: Profile): SowDraft {
  const client = deal.client || "Client";
  const creator = profile.name || "Your Studio";
  const total = result?.target ?? 0;
  const depositPercent = 50;
  const deposit = Math.round((total * (depositPercent / 100)) / 50) * 50;
  const usageLabel =
    {
      organic:
        "Organic and owned channels only (social, website, email). No paid media, TV, streaming commercials, or out-of-home. Term: 12 months unless otherwise agreed.",
      paid:
        "Paid digital advertising (e.g. Meta, TikTok, YouTube, LinkedIn). Does not include TV, streaming/CTV, or billboards unless upgraded. Term: 12 months.",
      broadcast:
        "TV, streaming/CTV commercials, and out-of-home (billboards, transit, digital signage). Term: 12 months. Theatrical or all-media buyouts quoted separately.",
    }[deal.usage] ??
    "Organic and owned channels only. Term: 12 months unless otherwise agreed.";
  const projectDescription = `${deal.project ? `${deal.project} production` : "Creative production"} for ${client}.${deal.scopeNotes ? ` ${deal.scopeNotes}` : ""}`;
  const today = new Date().toISOString().slice(0, 10);

  return {
    creator,
    client,
    version: "1.0",
    docDate: today,
    projectDescription,
    roles: buildSowRoles(deal, profile),
    lineItems: buildSowLineItems(deal, result, profile),
    usageRights: usageLabel,
    revisions:
      "Two rounds included on primary deliverables. Additional rounds: $250 each. Major creative pivots after picture lock are repriced.",
    total: total > 0 ? String(total) : "",
    depositPercent: String(depositPercent),
    paymentSchedule:
      total > 0
        ? `$${fmt(deposit)} on signing · $${fmt(total - deposit)} on final delivery`
        : "50% on signing · 50% on final delivery",
    cancellation:
      "Kill fee of 50% if cancelled after pre-production begins. Deposit is non-refundable. Force majeure clause applies.",
  };
}

function SowPreview({ draft }: { draft: SowDraft }) {
  const total = parseFloat(draft.total.replace(/,/g, "")) || 0;
  const docDate = draft.docDate
    ? new Date(`${draft.docDate}T00:00:00`).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="doc-preview">
      <div className="doc-head">
        <div>
          <h2>SCOPE OF WORK</h2>
          <div className="label-sm" style={{ marginTop: 4 }}>
            {draft.creator || "Your Studio"} × {draft.client || "Client"}
          </div>
        </div>
        <div style={{ textAlign: "right", fontSize: 11, color: "#6F6F6F" }}>
          v{draft.version || "1.0"} · {docDate}
        </div>
      </div>

      <h3 style={{ fontSize: 14, marginBottom: 4 }}>Project</h3>
      <p style={{ fontSize: 12, color: "#444", margin: "0 0 14px", whiteSpace: "pre-wrap" }}>
        {draft.projectDescription || "—"}
      </p>

      {draft.roles.length > 0 && (
        <>
          <h3 style={{ fontSize: 14, marginBottom: 6 }}>Positions & Roles</h3>
          <table>
            <tbody>
              {draft.roles.map((role) => (
                <tr key={role.id}>
                  <td>
                    <strong>{role.label}</strong>
                  </td>
                  <td style={{ textAlign: "right", color: "#444" }}>{role.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {draft.lineItems.length > 0 && (
        <>
          <h3 style={{ fontSize: 14, margin: "14px 0 6px" }}>Line Items</h3>
          <table>
            <thead>
              <tr>
                <th>Service</th>
                <th style={{ textAlign: "right" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {draft.lineItems.map((line) => (
                <tr key={line.id}>
                  <td>{line.description}</td>
                  <td style={{ textAlign: "right" }}>${fmt(Math.round(line.amount))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <h3 style={{ fontSize: 14, margin: "14px 0 6px" }}>Usage rights</h3>
      <p style={{ fontSize: 12, color: "#444", margin: "0 0 10px", whiteSpace: "pre-wrap" }}>
        {draft.usageRights || "—"}
      </p>

      <h3 style={{ fontSize: 14, margin: "14px 0 6px" }}>Revisions</h3>
      <p style={{ fontSize: 12, color: "#444", margin: "0 0 10px", whiteSpace: "pre-wrap" }}>
        {draft.revisions || "—"}
      </p>

      <h3 style={{ fontSize: 14, margin: "14px 0 6px" }}>Investment</h3>
      <div className="total" style={{ borderColor: "#1A1A1F" }}>
        <span>Total</span>
        <span>{total > 0 ? `$${fmt(Math.round(total))}` : "—"}</span>
      </div>
      <div style={{ fontSize: 11, color: "#888", marginTop: 6, whiteSpace: "pre-wrap" }}>
        {draft.paymentSchedule || "—"}
      </div>

      <h3 style={{ fontSize: 14, margin: "14px 0 6px" }}>Cancellation</h3>
      <p style={{ fontSize: 12, color: "#444", margin: 0, whiteSpace: "pre-wrap" }}>
        {draft.cancellation || "—"}
      </p>
      <DocLegalFooter />
    </div>
  );
}



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
  intelAnnualRevenue: string;
  setIntelAnnualRevenue: (v: string) => void;
  intelCompanySize: string;
  setIntelCompanySize: (v: string) => void;
  loadingStep: number;
  result: Recommendation | null;
  rateDetail: string;
  score: number;
  scoreOffset: number;
  displayName: string;
  profileRole: string;
  gearLocker: GearItem[];
  profile: Profile;
  leverageScore: number | null;
};

function CrewSplitCard({ cs }: { cs: CrewSplit }) {
  const shootAdditionalTotal = cs.additionalRoleLines
    .filter((line) => line.phase === "shoot")
    .reduce((sum, line) => sum + line.subtotal, 0);
  const postAdditionalTotal = cs.additionalRoleLines
    .filter((line) => line.phase === "post")
    .reduce((sum, line) => sum + line.subtotal, 0);
  const shootSubtotal = cs.productionSubtotal + shootAdditionalTotal + cs.prePro;
  const postPhaseTotal = cs.postSubtotal + postAdditionalTotal;
  const grandTotal =
    cs.projectSubtotal +
    shootSubtotal +
    postPhaseTotal +
    cs.usageLicense +
    cs.kitFeeTotal +
    cs.additionalCrewTotal +
    cs.mediaStorageTotal +
    cs.ditFeeTotal;
  const shootPct = grandTotal > 0 ? Math.round((shootSubtotal / grandTotal) * 100) : 0;
  const postPct = grandTotal > 0 ? Math.round((postPhaseTotal / grandTotal) * 100) : 0;

  const rowStyle: CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 };
  const sectionLabelStyle: CSSProperties = { fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-3)" };
  const lineNameStyle: CSSProperties = { fontSize: 13, color: "var(--text-2)" };
  const lineSubStyle: CSSProperties = { fontSize: 11, color: "var(--text-3)", marginTop: 2 };
  const amountStyle: CSSProperties = { fontSize: 13, fontWeight: 600, color: "var(--text)", flexShrink: 0, marginLeft: 8 };

  return (
    <div className="card" style={{ marginTop: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <span className="eyebrow">Crew split</span>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <span className="badge" style={{ fontSize: 11, letterSpacing: "0.05em" }}>Freelance market</span>
          {cs.isMultiRole && <span className="badge gold">Dual-role</span>}
        </div>
      </div>

      {cs.pricingMode === "project" && cs.projectSubtotal > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
            <span style={sectionLabelStyle}>Project fee</span>
            <span style={{ fontSize: 14, fontWeight: 700 }}>${fmt(cs.projectSubtotal)}</span>
          </div>
          <div style={rowStyle}>
            <div>
              <div style={lineNameStyle}>{cs.primaryRole || "Primary role"}</div>
              <div style={lineSubStyle}>Flat fee for creative labor (not per-day)</div>
            </div>
            <span style={amountStyle}>${fmt(cs.projectSubtotal)}</span>
          </div>
        </div>
      )}

      {cs.shootDays === 0 && cs.prePro > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
            <span style={sectionLabelStyle}>Pre-production</span>
            <span style={{ fontSize: 14, fontWeight: 700 }}>${fmt(cs.prePro)}</span>
          </div>
          <div style={rowStyle}>
            <div>
              <div style={lineNameStyle}>Pre-production &amp; prep</div>
              {cs.preProDays > 0 && (
                <div style={lineSubStyle}>
                  {cs.preProDays} day{cs.preProDays !== 1 ? "s" : ""} × ${fmt(Math.round(cs.prePro / cs.preProDays))}/day
                </div>
              )}
            </div>
            <span style={amountStyle}>${fmt(cs.prePro)}</span>
          </div>
        </div>
      )}

      {/* Shooting Phase */}
      {cs.shootDays > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
            <span style={sectionLabelStyle}>Shooting Phase</span>
            <span style={{ fontSize: 14, fontWeight: 700 }}>${fmt(shootSubtotal)}</span>
          </div>
          <div style={rowStyle}>
            <div>
              <div style={lineNameStyle}>{cs.primaryRole || "Primary role"}</div>
              <div style={lineSubStyle}>{cs.shootDays} day{cs.shootDays !== 1 ? "s" : ""} × ${fmt(cs.productionDayRate)}/day</div>
            </div>
            <span style={amountStyle}>${fmt(cs.productionSubtotal)}</span>
          </div>
          {cs.additionalRoleLines
            .filter((line) => line.phase === "shoot")
            .map((line) => (
              <div key={`${line.role}-shoot`} style={rowStyle}>
                <div>
                  <div style={lineNameStyle}>{line.role}</div>
                  <div style={lineSubStyle}>
                    {line.days} day{line.days !== 1 ? "s" : ""} × ${fmt(line.dayRate)}/day
                  </div>
                </div>
                <span style={amountStyle}>${fmt(line.subtotal)}</span>
              </div>
            ))}
          {cs.prePro > 0 && (
            <div style={{ ...rowStyle, marginBottom: 10 }}>
              <div>
                <div style={lineNameStyle}>Pre-production &amp; prep</div>
                {cs.preProDays > 0 && (
                  <div style={lineSubStyle}>
                    {cs.preProDays} day{cs.preProDays !== 1 ? "s" : ""} × ${fmt(Math.round(cs.prePro / cs.preProDays))}/day
                  </div>
                )}
              </div>
              <span style={amountStyle}>${fmt(cs.prePro)}</span>
            </div>
          )}
          <div className="progress">
            <div style={{ width: `${shootPct}%` }} />
          </div>
          <div style={{ textAlign: "right", fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>{shootPct}% of project</div>
        </div>
      )}

      {cs.shootDays > 0 && cs.editDays > 0 && (
        <div style={{ height: 1, background: "var(--border)", margin: "4px 0 16px" }} />
      )}

      {/* Post-Production Phase */}
      {cs.editDays > 0 && (
        <div style={{ marginBottom: cs.usageLicense > 0 ? 16 : 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
            <span style={sectionLabelStyle}>Post-Production</span>
            <span style={{ fontSize: 14, fontWeight: 700 }}>${fmt(postPhaseTotal)}</span>
          </div>
          {cs.postSubtotal > 0 && (
            <div style={rowStyle}>
              <div>
                <div style={lineNameStyle}>{cs.primaryRole || "Primary role"}</div>
                <div style={lineSubStyle}>
                  {cs.editDays} day{cs.editDays !== 1 ? "s" : ""} × ${fmt(cs.postDayRate)}/day
                </div>
              </div>
              <span style={amountStyle}>${fmt(cs.postSubtotal - cs.colorAlloc - cs.soundAlloc)}</span>
            </div>
          )}
          {cs.additionalRoleLines
            .filter((line) => line.phase === "post")
            .map((line) => (
              <div key={`${line.role}-post`} style={rowStyle}>
                <div>
                  <div style={lineNameStyle}>{line.role}</div>
                  <div style={lineSubStyle}>
                    {line.days} day{line.days !== 1 ? "s" : ""} × ${fmt(line.dayRate)}/day
                  </div>
                </div>
                <span style={amountStyle}>${fmt(line.subtotal)}</span>
              </div>
            ))}
          {cs.hasColor && (
            <div style={rowStyle}>
              <span style={lineNameStyle}>Color grading</span>
              <span style={amountStyle}>${fmt(cs.colorAlloc)}</span>
            </div>
          )}
          {cs.hasSound && (
            <div style={{ ...rowStyle, marginBottom: 10 }}>
              <span style={lineNameStyle}>Sound design &amp; mix</span>
              <span style={amountStyle}>${fmt(cs.soundAlloc)}</span>
            </div>
          )}
          {!cs.hasColor && !cs.hasSound && <div style={{ marginBottom: 4 }} />}
          <div className="progress">
            <div style={{ width: `${postPct}%` }} />
          </div>
          <div style={{ textAlign: "right", fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>{postPct}% of project</div>
        </div>
      )}

      {/* Usage License */}
      {cs.usageLicense > 0 && (
        <>
          <div style={{ height: 1, background: "var(--border)", margin: "4px 0 12px" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={lineNameStyle}>Usage &amp; licensing rights</span>
            <span style={amountStyle}>${fmt(cs.usageLicense)}</span>
          </div>
        </>
      )}

      {/* Media & data */}
      {(cs.mediaStorageTotal > 0 || cs.ditFeeTotal > 0) && (
        <>
          <div style={{ height: 1, background: "var(--border)", margin: "4px 0 12px" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
            <span style={sectionLabelStyle}>Media &amp; Data</span>
            <span style={{ fontSize: 14, fontWeight: 700 }}>
              ${fmt(cs.mediaStorageTotal + cs.ditFeeTotal)}
            </span>
          </div>
          {cs.mediaStorageTotal > 0 && (
            <div style={rowStyle}>
              <div>
                <div style={lineNameStyle}>Media storage &amp; handling</div>
                <div style={lineSubStyle}>
                  {cs.mediaStorageDriveNote || cs.mediaStorageLabel}
                  {cs.mediaStorageAmazonHardware > 0
                    ? ` · ~$${fmt(cs.mediaStorageAmazonHardware)} Samsung SSD on Amazon + ingest`
                    : ""}
                </div>
              </div>
              <span style={amountStyle}>${fmt(cs.mediaStorageTotal)}</span>
            </div>
          )}
          {cs.ditFeeTotal > 0 && (
            <div style={rowStyle}>
              <div>
                <div style={lineNameStyle}>DIT / on-set data management</div>
                <div style={lineSubStyle}>
                  {cs.ditDays} day{cs.ditDays !== 1 ? "s" : ""} × ${fmt(cs.ditDayRate)}/day
                </div>
              </div>
              <span style={amountStyle}>${fmt(cs.ditFeeTotal)}</span>
            </div>
          )}
        </>
      )}

      {/* Equipment / Kit Fee */}
      {cs.kitFeeTotal > 0 && (
        <>
          <div style={{ height: 1, background: "var(--border)", margin: "4px 0 12px" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <span style={lineNameStyle}>Equipment Assets / Kit Rental</span>
              <div style={lineSubStyle}>{cs.kitFeeLabel}</div>
            </div>
            <span style={{ ...amountStyle, color: "var(--gold)" }}>${fmt(cs.kitFeeTotal)}</span>
          </div>
        </>
      )}

      {/* Additional Crew */}
      {cs.additionalCrew.length > 0 && (
        <>
          <div style={{ height: 1, background: "var(--border)", margin: "4px 0 12px" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
            <span style={sectionLabelStyle}>Additional Crew</span>
            <span style={{ fontSize: 14, fontWeight: 700 }}>${fmt(cs.additionalCrewTotal)}</span>
          </div>
          {cs.additionalCrew.map((crew) => (
            <div key={crew.id} style={rowStyle}>
              <div>
                <div style={lineNameStyle}>{crew.label}</div>
                <div style={lineSubStyle}>
                  {crew.qty} × {crew.days} day{crew.days !== 1 ? "s" : ""} × ${fmt(crew.rate)}/day estimated
                </div>
              </div>
              <span style={amountStyle}>${fmt(crew.total)}</span>
            </div>
          ))}
        </>
      )}

      {/* Multi-role note */}
      {cs.isMultiRole && (
        <div style={{ marginTop: 14, padding: "10px 12px", background: "rgba(232,197,122,0.06)", borderRadius: 10, border: "1px solid rgba(232,197,122,0.15)" }}>
          <p style={{ margin: 0, fontSize: 12, color: "var(--text-3)", lineHeight: 1.5 }}>
            Editing priced at full video editor rate — not the standard 0.75× discount. You are filling two seats.
          </p>
        </div>
      )}
    </div>
  );
}

function BookingProtectionCard({ target, crewSplit }: { target: number; crewSplit?: CrewSplit }) {
  const deposit = Math.round((target * 0.5) / 50) * 50;
  const balance = target - deposit;
  const hasShootDays = (crewSplit?.shootDays ?? 0) > 0;
  const laborPenalty = crewSplit
    ? crewSplit.productionSubtotal + crewSplit.prePro
    : Math.round((target * 0.55) / 50) * 50;

  return (
    <div className="card" style={{ marginTop: 14, border: "1px solid rgba(94,226,160,0.2)", background: "rgba(94,226,160,0.025)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(94,226,160,0.1)", border: "1px solid rgba(94,226,160,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth={2}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <span className="eyebrow" style={{ color: "var(--success)" }}>Booking Protection</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        <div style={{ padding: "12px 14px", background: "var(--surface)", borderRadius: 10, border: "1px solid var(--border)" }}>
          <div style={{ fontSize: 10, color: "var(--text-3)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600, marginBottom: 6 }}>Upfront Retainer</div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.03em", color: "var(--success)" }}>${fmt(deposit)}</div>
          <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 3 }}>50% · due on signing</div>
        </div>
        <div style={{ padding: "12px 14px", background: "var(--surface)", borderRadius: 10, border: "1px solid var(--border)" }}>
          <div style={{ fontSize: 10, color: "var(--text-3)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600, marginBottom: 6 }}>Balance Due</div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.03em", color: "var(--text)" }}>${fmt(balance)}</div>
          <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 3 }}>50% · on final delivery</div>
        </div>
      </div>

      <div style={{ padding: "12px 14px", background: "rgba(255,92,92,0.04)", border: "1px solid rgba(255,92,92,0.14)", borderRadius: 10 }}>
        <div style={{ fontSize: 10, color: "var(--danger)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600, marginBottom: 10 }}>Kill Fee Schedule</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: 10, marginBottom: 10, borderBottom: "1px solid rgba(255,92,92,0.1)" }}>
          <div style={{ flex: 1, marginRight: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", marginBottom: 3 }}>
              Inside 72 hrs of {hasShootDays ? "Production Day 1" : "Project Start"}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-3)", lineHeight: 1.55 }}>
              Initial retainer is fully forfeited. Non-refundable.
            </div>
          </div>
          <div style={{ flexShrink: 0, textAlign: "right" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--danger)" }}>${fmt(deposit)}</div>
            <div style={{ fontSize: 10, color: "var(--text-3)" }}>forfeited</div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1, marginRight: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", marginBottom: 3 }}>
              Inside 24 hrs of {hasShootDays ? "Production Day 1" : "Project Start"}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-3)", lineHeight: 1.55 }}>
              100% principal {hasShootDays ? "day-rate labor" : "labor"} penalty applies — billed in addition to forfeited retainer.
            </div>
          </div>
          <div style={{ flexShrink: 0, textAlign: "right" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--danger)" }}>${fmt(laborPenalty)}</div>
            <div style={{ fontSize: 10, color: "var(--text-3)" }}>+ retainer</div>
          </div>
        </div>
      </div>
    </div>
  );
}

const HIGH_VALUE_KEYWORDS = [
  "netflix", "amazon", "disney", "hulu", "apple tv", "hbo", "sony",
  "warner", "universal", "paramount", "nbc", "cbs", "abc", "fox",
  "nike", "adidas", "google", "microsoft", "meta", "facebook",
  "coca-cola", "pepsi", "bmw", "mercedes", "ford", "toyota",
  "mccann", "bbdo", "ogilvy", "wieden", "droga5", "leo burnett",
  "fortune 500", "national commercial", "broadcast",
  "super bowl", "emmy", "oscar", "sundance", "cannes",
  "multi-camera", "director of photography", "lead editor", "executive producer",
  "showrunner", "feature film", "major label", "platinum", "grammy",
  "enterprise", "agency",
];

const LEADERSHIP_KEYWORDS = [
  "director", "creative director", "lead", "senior", "head of", "founder",
  "executive producer", "producer", "showrunner", "supervisor", "manager",
  "department head", "team lead", "principal", "owner",
];

function analyzeProfessionalHighlights(input: {
  recognizableWork: string;
  leadershipWork: string;
  careerHighlights: string;
}): {
  score: number;
  detectedExpTier: string | null;
  detectedSkillTier: string | null;
  matchedKeywords: string[];
  clientSignals: string[];
  leadershipSignals: string[];
  yearsFound: number;
} {
  const text = `${input.recognizableWork} ${input.leadershipWork} ${input.careerHighlights}`;
  const lower = text.toLowerCase();

  const yearPatterns = [
    /(\d+)\+?\s*years?\s+(?:of\s+)?(?:experience|professional|industry)/gi,
    /(\d+)\+\s*years?/gi,
    /over\s+(\d+)\s*years?/gi,
    /more\s+than\s+(\d+)\s*years?/gi,
  ];

  let maxYears = 0;
  for (const pattern of yearPatterns) {
    const matches = [...lower.matchAll(new RegExp(pattern.source, "gi"))];
    for (const m of matches) {
      const y = parseInt(m[1], 10);
      if (!isNaN(y) && y < 50 && y > maxYears) maxYears = y;
    }
  }
  if ((lower.includes("decade") || lower.includes("ten years")) && maxYears < 10) maxYears = 10;

  let detectedExpTier: string | null = null;
  let detectedSkillTier: string | null = null;
  if (maxYears >= 5) { detectedExpTier = "expert"; detectedSkillTier = "expert"; }
  else if (maxYears >= 2) { detectedExpTier = "mid"; detectedSkillTier = "mid"; }
  else if (maxYears >= 1) { detectedExpTier = "beginner"; detectedSkillTier = "beginner"; }

  const matchedKeywords: string[] = [];
  for (const kw of HIGH_VALUE_KEYWORDS) {
    if (lower.includes(kw)) matchedKeywords.push(kw);
  }
  const leadershipSignals: string[] = [];
  for (const kw of LEADERSHIP_KEYWORDS) {
    if (lower.includes(kw)) leadershipSignals.push(kw);
  }
  const clientSignals = matchedKeywords.filter((kw) =>
    !["multi-camera", "director of photography", "lead editor", "executive producer", "showrunner", "feature film", "major label", "platinum", "enterprise", "agency", "national commercial", "broadcast"].includes(kw)
  );

  let score = 3;
  if (maxYears >= 10) score += 3;
  else if (maxYears >= 5) score += 2;
  else if (maxYears >= 3) score += 1;
  score += Math.min(matchedKeywords.length, 4);
  score += Math.min(leadershipSignals.length, 2);
  score = Math.max(1, Math.min(10, score));

  return { score, detectedExpTier, detectedSkillTier, matchedKeywords, clientSignals, leadershipSignals, yearsFound: maxYears };
}

function buildPresetObjections(profile: Profile, leverageScore: number | null): ObjectionEntry[] {
  const trade = profile.trade || "creative professional";
  const exp = profile.experience;
  const levelLabel = exp === "expert" || exp === "10+" || exp === "5-10" ? "expert-level" : exp === "mid" || exp === "3-5" || exp === "1-3" ? "mid-level" : "beginner-level";
  const lv = leverageScore ?? 5;
  const tierLabel = lv >= 8 ? "Lead / Executive" : lv >= 6 ? "Senior" : lv >= 4 ? "Mid-level" : "Emerging";
  const extras = profile.extras.length > 0 ? ` and ${profile.extras.slice(0, 2).join(" / ")} capabilities` : "";
  const resumeProof = [
    ...(profile.resumeClientSignals ?? []).slice(0, 2),
    ...(profile.resumeLeadershipSignals ?? []).slice(0, 2),
  ];
  const resumeLine = resumeProof.length > 0
    ? `Your professional highlights support this position with ${resumeProof.join(" / ")} signal${resumeProof.length !== 1 ? "s" : ""}; use that proof when explaining why the project needs senior-level execution.`
    : null;

  return [
    {
      id: "rate-high",
      label: "Your rate looks too high — can we do a flat package?",
      script: [
        `Given my ${levelLabel} ${trade} work${extras}, this estimate reflects the quality level, timeline pressure, and delivery responsibility attached to this project.`,
        ...(resumeLine ? [resumeLine] : []),
        `If the total feels heavy, move the conversation into scope design. Identify the result they need most, then separate must-have deliverables from items that can wait.`,
        `A cleaner option is to reduce or phase deliverables while keeping the professional rate intact. That protects the work standard and still gives the client a path forward.`,
        `Present a smaller version of the same project, priced with the same rate logic, so the adjustment is about project size rather than the value of your labor.`,
      ],
      diagnostics: [
        "What result would make this project feel successful 90 days from now?",
        "Which deliverable in the current scope feels optional to you right now?",
        "Which business result matters most: more leads, higher conversion, brand trust, or internal launch support?",
      ],
    },
    {
      id: "no-usage",
      label: "We don't have budget for usage rights — can we just buy the raw footage?",
      script: [
        `Standard project delivery includes polished final master assets as produced by a ${tierLabel}-tier ${trade}. Unedited archive files carry a separate transfer fee.`,
        `Usage pricing is tied to where the work appears, how long it runs, and how much commercial benefit the client expects from it.`,
        `Offer a shorter license or narrower channel list if they need a lower starting point. That keeps the first agreement manageable without giving away future commercial use.`,
        `I can structure a 6-month organic-only license at a reduced fee. If the work later moves into paid media, broadcast, or broader distribution, we can price that expanded use separately.`,
      ],
      diagnostics: [
        "Where are you planning to distribute this — owned channels, paid digital ads, or TV/streaming/OOH?",
        "Is paid media something you would want flexibility on in the future, even if it is not in scope today?",
        "A 6-month organic license is roughly half the 12-month fee. Does a shorter term address the budget concern?",
      ],
    },
    {
      id: "volume-discount",
      label: "Can you discount this if we promise high-volume future work?",
      script: [
        `As a ${tierLabel} ${trade}${extras}, I keep one-off project pricing separate from ongoing partnership pricing.`,
        `If there is real volume coming, turn it into a written monthly commitment with a clear start date, deliverable count, and payment schedule.`,
        `That gives the client planning certainty while keeping your current project from being discounted based on work that is not yet confirmed.`,
        `I would rather build a committed 3-month plan around the standard rate than reduce this project for possible future work. Let us define what the monthly scope would include.`,
      ],
      diagnostics: [
        "What does high volume actually mean in practice — how many deliverables per month?",
        "If we structure 3 months at the current rate, what monthly deliverable count can you commit to?",
        "What is the first confirmed project that would initiate this collaboration, and what is your timeline?",
      ],
    },
  ];
}


function generateCustomCounter(input: string, profile: Profile, leverageScore: number | null, result: Recommendation | null, intelLtv: string): SimMsg {
  const r = input.toLowerCase();
  const trade = profile.trade || "creative professional";
  const exp = profile.experience;
  const levelLabel = exp === "expert" || exp === "10+" || exp === "5-10" ? "expert-level" : exp === "mid" || exp === "3-5" || exp === "1-3" ? "mid-level" : "beginner-level";
  const lv = leverageScore ?? 5;
  const tierLabel = lv >= 8 ? "Lead / Executive" : lv >= 6 ? "Senior" : lv >= 4 ? "Mid-level" : "Emerging";
  const extras = profile.extras.length > 0 ? `, with specialized capabilities in ${profile.extras.slice(0, 2).join(" and ")}` : "";
  const resumeProof = [
    ...(profile.resumeClientSignals ?? []).slice(0, 2),
    ...(profile.resumeLeadershipSignals ?? []).slice(0, 2),
  ];
  const resumeLine = resumeProof.length > 0
    ? `Your professional highlights give you proof points to use here: ${resumeProof.join(" / ")}. Tie those examples to reduced risk, better execution, and fewer client-side corrections.`
    : null;

  if (r.includes("too high") || r.includes("expensive") || r.includes("cheaper") || r.includes("discount") || r.includes("lower") || r.includes("budget") || r.includes("afford")) {
    const breakEven = result?.breakEvenSales;
    const ltvNum = parseMoney(intelLtv);
    const roiLine = (breakEven != null && ltvNum > 0)
      ? `Based on the target performance estimate and an average transaction value of $${fmt(ltvNum)}, this project needs about ${breakEven} conversion${breakEven !== 1 ? "s" : ""} to cover the production investment. Use that math to keep the discussion focused on the business result, not just the line-item cost.`
      : `Given my ${levelLabel} ${trade} work${extras}, the rate reflects the project responsibility, delivery standard, and timeline. Bring the conversation back to the result the work is supposed to create.`;
    return {
      role: "coach",
      script: [
        roiLine,
        ...(resumeLine ? [resumeLine] : []),
        `I understand budget alignment is a priority. Before we adjust anything, help me understand: what is the expected outcome from this project, and what would that result be worth to your business?`,
        `Rate hesitation often means the client needs more clarity on what the project is expected to accomplish. Confirm the business goal before changing the scope or cost.`,
        `Offer a scope reduction as the professional alternative to a rate cut. Remove or phase a deliverable before reducing the day rate.`,
      ],
      diagnostics: [
        "What would a successful result from this project be worth to your business in real dollar terms?",
        "Which deliverable in the scope feels optional to you right now?",
        "Is the concern about the total project cost, or about what is included at this investment level?",
      ],
    };
  }
  if (r.includes("future") || r.includes("more work") || r.includes("volume") || r.includes("ongoing") || r.includes("retainer") || r.includes("next project")) {
    return {
      role: "coach",
      script: [
        `As a ${tierLabel} ${trade}${extras}, possible future work should be handled as a separate ongoing agreement, not as a discount on today's project.`,
        ...(resumeLine ? [resumeLine] : []),
        `I am excited about an ongoing collaboration. Let us put a monthly agreement in place with defined deliverables, timing, and payment terms.`,
        `Keep this project priced on its own merits. If they want volume pricing, ask for a clear commitment that both sides can plan around.`,
      ],
      diagnostics: [
        "Can we put a 3-month retainer agreement on paper today at the current rate?",
        "What is the committed monthly deliverable count you would want in a retainer structure?",
        "When does the first confirmed project kick off — what is your actual timeline?",
      ],
    };
  }
  return {
    role: "coach",
    script: [
      `When a client raises a concern, slow the pace and clarify what is underneath it. As a ${tierLabel} ${trade}${extras}, your job is to connect the scope to the result they need.`,
      ...(resumeLine ? [resumeLine] : []),
      `Help me understand what is driving that concern — is it about the total investment, the timeline, or what is included in the scope?`,
      `Strong client communication starts with listening. Ask a clear follow-up question before offering a revised number or revised scope.`,
      `Before making any adjustments, confirm what a successful result looks like and which part of the project is most important to protect.`,
    ],
    diagnostics: [
      "What would a successful outcome from this project be worth to your business?",
      "What is driving the timeline on this decision?",
      "Is there a specific part of the scope that does not feel justified at this investment level?",
    ],
  };
}

function ExtraScreens({
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
  intelAnnualRevenue,
  setIntelAnnualRevenue,
  intelCompanySize,
  setIntelCompanySize,
  loadingStep,
  result,
  rateDetail,
  score,
  scoreOffset,
  displayName,
  profileRole,
  gearLocker,
  profile,
  leverageScore,
}: Props) {
  const lockerKitDays = deal.shootDays > 0 ? deal.shootDays : (deal.editDays > 0 ? deal.editDays : 1);
  const lockerActiveItems = gearLocker.filter((g) => deal.kitFeeLockerItems.includes(g.id));
  const lockerActiveValue = lockerActiveItems.reduce((s, g) => s + (parseFloat(g.cost.replace(/,/g, "")) || 0), 0);
  const lockerRateMultiplier = parseFloat(deal.kitFeeRate || "0.05");
  const lockerDailyRate = Math.round((lockerActiveValue * lockerRateMultiplier) / 5) * 5;
  const lockerTotal = lockerDailyRate * lockerKitDays;

  // Live price anchor — merges in-progress intel fields for a running estimate
  const liveDeal = useMemo(() => ({
    ...deal,
    why: intelWhy,
    companySize: intelCompanySize,
    annualRevenue: intelAnnualRevenue,
    ltv: intelLtv,
    roi: intelRoi,
    budget: intelBudget,
  }), [deal, intelWhy, intelCompanySize, intelAnnualRevenue, intelLtv, intelRoi, intelBudget]);

  const liveEstimate = useMemo(
    () => computeRecommendation(profile, withLivePreviewDays(liveDeal)),
    [profile, liveDeal]
  );

  const baseDay = useMemo(() => {
    return getEstimatedBaseDayRate(profile, deal.dealRole || profile.trade);
  }, [profile.trade, profile.experience, profile.skill, deal.dealRole]);

  const flatRateEligible = isFlatRateEligible(deal.dealRole);

  const laborDayRate = useMemo(() => {
    const loc = getLocationMarketMultiplier(profile.location);
    const rushPremium = ({ loose: 0, normal: 0, rush: 0.25, fire: 0.5 } as Record<string, number>)[deal.rush] || 0;
    const usagePremium = ({ organic: 0, paid: 0.25, broadcast: 0.5 } as Record<string, number>)[deal.usage] || 0;
    const premium = Math.min(rushPremium + usagePremium, 0.5);
    const extrasMult = 1 + Math.min(profile.extras.length, 4) * 0.04;
    return Math.round((baseDay * loc * extrasMult * (1 + premium)) / 25) * 25;
  }, [baseDay, deal.rush, deal.usage, profile.location, profile.extras.length]);

  const flatSuggestion = useMemo(() => {
    if (!flatRateEligible || deal.pricingMode !== "project") return null;
    return computeFlatRateSuggestion(
      deal.dealRole,
      laborDayRate,
      deal.flatUnitCount,
      deal.flatComplexity,
      deal.flatRevisionRounds,
      deal.flatEstimatedDays,
    );
  }, [
    deal.dealRole,
    deal.flatComplexity,
    deal.flatEstimatedDays,
    deal.flatRevisionRounds,
    deal.flatUnitCount,
    deal.pricingMode,
    flatRateEligible,
    laborDayRate,
  ]);

  const flatUnitDerivedDays = useMemo(() => {
    if (!flatRateEligible) return 0;
    return computeDerivedEstimatedDays(deal.dealRole, deal.flatUnitCount, deal.flatComplexity);
  }, [deal.dealRole, deal.flatComplexity, deal.flatUnitCount, flatRateEligible]);

  const prevLiveTotal = useRef(0);
  const tickDir = liveEstimate.target >= prevLiveTotal.current ? "up" : "down";
  prevLiveTotal.current = liveEstimate.target;

  const [showNegoSheet, setShowNegoSheet] = useState(false);
  const [negoTab, setNegoTab] = useState<"blueprint" | "simulator">("blueprint");
  const [simMessages, setSimMessages] = useState<SimMsg[]>([]);
  const [simInput, setSimInput] = useState("");
  const simScrollRef = useRef<HTMLDivElement>(null);
  const [arfOpen, setArfOpen] = useState(false);
  const [arfAmount, setArfAmount] = useState("");
  const [invoiceDraft, setInvoiceDraft] = useState<InvoiceDraft>({
    invoiceNumber: "",
    billedToName: "",
    billedToContact: "Accounts Payable",
    billedToEmail: "",
    issuedDate: "",
    dueDate: "",
    terms: "Net 14",
    depositPercent: "50",
    paymentNote: "Payment via ACH or wire. Late fees of 1.5%/mo accrue after 30 days. Project license activates on final payment.",
  });
  const [sowDraft, setSowDraft] = useState<SowDraft>(() => buildDefaultSowDraft(deal, result, profile));
  const refreshSowFromDeal = useCallback(() => {
    setSowDraft(buildDefaultSowDraft(deal, result, profile));
    showToast("SOW refreshed from deal estimate");
  }, [deal, result, profile, showToast]);
  useEffect(() => {
    const issued = new Date();
    const due = new Date(issued);
    due.setDate(issued.getDate() + 14);
    const toIsoDate = (date: Date) => date.toISOString().slice(0, 10);

    setInvoiceDraft((draft) => {
      if (draft.invoiceNumber || draft.issuedDate || draft.dueDate) return draft;
      return {
        ...draft,
        invoiceNumber: `MIMS-${issued.getFullYear()}-${String(Date.now()).slice(-4)}`,
        issuedDate: toIsoDate(issued),
        dueDate: toIsoDate(due),
      };
    });
  }, []);
  const dayMode = getRoleDayMode(deal.dealRole);

  const handleSimObjection = (obj: ObjectionEntry) => {
    setSimMessages((prev) => [
      ...prev,
      { role: "client", objection: obj.label },
      { role: "coach", script: [...obj.script], diagnostics: [...obj.diagnostics] },
    ]);
    setTimeout(() => { if (simScrollRef.current) simScrollRef.current.scrollTop = simScrollRef.current.scrollHeight; }, 50);
  };

  const handleSimCustom = () => {
    const text = simInput.trim();
    if (!text) return;
    setSimInput("");
    setSimMessages((prev) => [...prev, { role: "client", objection: text }, generateCustomCounter(text, profile, leverageScore, result, intelLtv)]);
    setTimeout(() => { if (simScrollRef.current) simScrollRef.current.scrollTop = simScrollRef.current.scrollHeight; }, 50);
  };

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
        <div className="screen-pad" style={{ paddingTop: 0 }}>
          {/* ── Live Price Anchor Tracker ────────────────────── */}
          {(() => {
            const previewDeal = withLivePreviewDays(liveDeal);
            const pricedDays = dayMode === "production"
              ? previewDeal.shootDays
              : dayMode === "post" || dayMode === "design"
                ? previewDeal.editDays
                : previewDeal.shootDays + previewDeal.editDays;
            const cs = liveEstimate.crewSplit;
            const laborSubtotal = cs
              ? cs.productionSubtotal + cs.postSubtotal + cs.additionalRolesTotal + cs.prePro
              : 0;
            const additionalRoles = (deal.additionalRoles ?? []).filter(
              (r) => r && r !== deal.dealRole,
            );
            const primaryFullDay = deal.dealRole
              ? getAdjustedRoleDayRate(profile, deal.dealRole, deal)
              : laborDayRate;
            const crewRateLines: { role: string; rate: number; kind: "primary" | "additional" }[] = [];
            if (deal.dealRole) {
              crewRateLines.push({
                role: deal.dealRole,
                rate: primaryFullDay,
                kind: "primary",
              });
            }
            for (const role of additionalRoles) {
              crewRateLines.push({
                role,
                rate: getAdditionalSelfRoleDayRate(profile, role, deal),
                kind: "additional",
              });
            }
            const hasAdditionalRoles = additionalRoles.length > 0;
            const usingPreviewDays =
              deal.pricingMode !== "project" &&
              (deal.shootDays <= 0 || deal.editDays <= 0) &&
              (previewDeal.shootDays !== deal.shootDays || previewDeal.editDays !== deal.editDays);
            const pricedDayLabel = Number.isInteger(pricedDays) ? pricedDays.toString() : pricedDays.toFixed(1);
            const pills = ([
              deal.rush === "rush"         && { l: "RUSH",  bg: "rgba(255,181,71,.12)",  bd: "rgba(255,181,71,.35)",  c: "#ffb547" },
              deal.rush === "fire"         && { l: "FIRE",  bg: "rgba(255,92,92,.12)",   bd: "rgba(255,92,92,.35)",   c: "#ff5c5c" },
              deal.usage === "paid"        && { l: "PAID",  bg: "rgba(255,122,102,.12)", bd: "rgba(255,122,102,.35)", c: "#ff7a66" },
              deal.usage === "broadcast"   && { l: "TV",   bg: "rgba(255,122,102,.12)", bd: "rgba(255,122,102,.35)", c: "#ff7a66" },
              (deal.kitFee && deal.kitFee !== "") && { l: "KIT",   bg: "rgba(232,197,122,.12)", bd: "rgba(232,197,122,.35)", c: "#e8c57a" },
              intelCompanySize === "enterprise" && { l: "ENT+",  bg: "rgba(232,197,122,.12)", bd: "rgba(232,197,122,.35)", c: "#e8c57a" },
              intelCompanySize === "midmarket"  && { l: "MKT",   bg: "rgba(201,160,94,.12)",  bd: "rgba(201,160,94,.35)",  c: "#c9a05e" },
              intelWhy === "paid-media"         && { l: "ROI×",  bg: "rgba(94,226,160,.12)",  bd: "rgba(94,226,160,.35)",  c: "#5ee2a0" },
              intelWhy === "brand-relaunch"     && { l: "BRAND", bg: "rgba(94,226,160,.12)",  bd: "rgba(94,226,160,.35)",  c: "#5ee2a0" },
              intelWhy === "campaign-window"    && { l: "CAMP",  bg: "rgba(255,181,71,.12)",  bd: "rgba(255,181,71,.35)",  c: "#ffb547" },
              (deal.shootDays > 0 && deal.editDays > 0) && { l: "DUAL", bg: "rgba(94,226,160,.12)", bd: "rgba(94,226,160,.35)", c: "#5ee2a0" },
              additionalRoles.length > 0 && { l: `+${additionalRoles.length} ROLE`, bg: "rgba(232,197,122,.12)", bd: "rgba(232,197,122,.35)", c: "#e8c57a" },
            ] as (false | { l: string; bg: string; bd: string; c: string })[]).filter((p): p is { l: string; bg: string; bd: string; c: string } => !!p);

            return (
              <div className="deal-price-sticky" style={{
                position: "sticky",
                top: 0,
                zIndex: 15,
                margin: "0 -20px 18px",
                padding: "11px 20px 13px",
                background: "rgba(11,11,15,0.96)",
                backdropFilter: "blur(28px)",
                WebkitBackdropFilter: "blur(28px)",
                borderBottom: "1px solid rgba(232,197,122,0.18)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 0 0 rgba(232,197,122,0)",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}>
                {/* Primary / base rate column */}
                <div style={{ flexShrink: 0 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 4 }}>
                    {hasAdditionalRoles ? "Primary rate" : "Base Rate"}
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
                    <span style={{ fontSize: 18, fontWeight: 700, color: "var(--gold)", letterSpacing: "-0.02em", lineHeight: 1 }}>
                      ${fmt(hasAdditionalRoles ? primaryFullDay : baseDay)}
                    </span>
                    <span style={{ fontSize: 10, color: "var(--text-3)", fontWeight: 500 }}>/day</span>
                    {hasAdditionalRoles ? (
                      <span style={{ fontSize: 9, color: "var(--text-3)", fontWeight: 600, marginLeft: 4 }}>full</span>
                    ) : null}
                  </div>
                  {hasAdditionalRoles ? (
                    <div style={{ marginTop: 4, fontSize: 10, color: "var(--text-3)", lineHeight: 1.45 }}>
                      {crewRateLines
                        .filter((line) => line.kind === "additional")
                        .map((line) => (
                          <div key={line.role}>
                            {line.role}: ${fmt(line.rate)}/day ({deal.additionalRoleChargePct ?? 75}% of day rate)
                          </div>
                        ))}
                    </div>
                  ) : null}
                  {pricedDays > 0 && laborSubtotal > 0 && (
                    <div style={{ marginTop: 4, fontSize: 10, color: "var(--text-3)", whiteSpace: "nowrap" }}>
                      {pricedDayLabel} day{pricedDays === 1 ? "" : "s"}
                      {usingPreviewDays ? " (preview)" : ""} · labor ${fmt(laborSubtotal)}
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div style={{ width: 1, height: 34, background: "var(--border)", flexShrink: 0 }} />

                {/* Active signal pills */}
                <div style={{ flex: 1, display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center" }}>
                  {pills.length === 0 ? (
                    <span style={{ fontSize: 11, color: "var(--text-3)" }}>fill in details to see boosts</span>
                  ) : pills.map((p) => (
                    <span key={p.l} style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.07em", padding: "3px 6px", borderRadius: 5, background: p.bg, border: `1px solid ${p.bd}`, color: p.c }}>
                      {p.l}
                    </span>
                  ))}
                </div>

                {/* Animated estimate column */}
                <div style={{ flexShrink: 0, textAlign: "right" }}>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 4 }}>
                    Est. Total
                  </div>
                  <div
                    key={liveEstimate.target}
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      letterSpacing: "-0.03em",
                      lineHeight: 1,
                      background: "var(--grad)",
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      color: "transparent",
                      animation: `mims-tick-${tickDir} 0.24s cubic-bezier(0.34,1.56,0.64,1)`,
                    }}
                  >
                    ${fmt(liveEstimate.target)}
                  </div>
                </div>
              </div>
            );
          })()}
          {/* ─────────────────────────────────────────────────── */}

          <div className="progress" style={{ marginBottom: 20 }}>
            <div style={{ width: `${dealStep * 33.33}%` }} />
          </div>
          {dealStep === 1 && (
            <div className="deal-form-grid">
              <h2>Who is the client?</h2>
              <p className="muted small" style={{ margin: "6px 0 16px" }}>
                MIMS will research them in the background.
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
                <label>Website or social link (optional)</label>
                <input
                  type="url"
                  placeholder="Website, Instagram, TikTok, YouTube, LinkedIn…"
                  value={deal.url}
                  onChange={(e) => setDeal((d) => ({ ...d, url: e.target.value }))}
                />
              </div>
              <div className="field">
                <label>Public footprint signals</label>
                <p className="helper">
                  Audience and social presence are directional signals only, not verified budget facts. Use them alongside the client&apos;s business model, scope, and actual budget conversation.
                </p>
                <div className="footprint-grid" style={{ display: "grid", gap: 10 }}>
                  <select
                    value={deal.publicAudience}
                    onChange={(e) => setDeal((d) => ({ ...d, publicAudience: e.target.value }))}
                  >
                    {PUBLIC_AUDIENCE_OPTIONS.map((opt) => (
                      <option key={opt.id || "unknown-audience"} value={opt.id}>{opt.label}</option>
                    ))}
                  </select>
                  <select
                    value={deal.brandMaturity}
                    onChange={(e) => setDeal((d) => ({ ...d, brandMaturity: e.target.value }))}
                  >
                    {BRAND_MATURITY_OPTIONS.map((opt) => (
                      <option key={opt.id || "unknown-maturity"} value={opt.id}>{opt.label}</option>
                    ))}
                  </select>
                  <select
                    value={deal.pricePoint}
                    onChange={(e) => setDeal((d) => ({ ...d, pricePoint: e.target.value }))}
                  >
                    {PRICE_POINT_OPTIONS.map((opt) => (
                      <option key={opt.id || "unknown-price"} value={opt.id}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="field">
                <label>How did they find you?</label>
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
            </div>
          )}
          {dealStep === 2 && (
            <div className="deal-form-grid">
              <h2>What is the work?</h2>

              <div className="field" style={{ marginBottom: 18 }}>
                <label>What position do they want you to do?</label>
                <RoleSearchInput
                  value={deal.dealRole}
                  onChange={(v) => {
                    const mode = getRoleDayMode(v);
                    const flatDefaults = getDefaultFlatScope(v);
                    const eligible = isFlatRateEligible(v);
                    setDeal((d) => ({
                      ...d,
                      dealRole: v,
                      additionalRoles: (d.additionalRoles ?? []).filter((r) => r && r !== v),
                      pricingMode: eligible ? d.pricingMode : "days",
                      ...flatDefaults,
                      shootDays:
                        mode === "post" || mode === "design" ? 0 : d.shootDays > 0 ? d.shootDays : 1,
                      editDays:
                        mode === "production" ? 0 : d.editDays > 0 ? d.editDays : mode === "dual" ? 0 : 1,
                    }));
                  }}
                />
              </div>

              <div className="field">
                <label>Additional roles (optional)</label>
                <p className="helper" style={{ marginTop: 0, marginBottom: 10 }}>
                  Hats you wear beyond your primary position — e.g. Cinematographer plus Editor and Colorist. Primary
                  always bills at full rate; roles you add here use the percentage below.
                </p>
                <AdditionalRolesPicker
                  roles={(deal.additionalRoles ?? []).filter(Boolean)}
                  onRolesChange={(additionalRoles) =>
                    setDeal((d) => bumpDealDaysForAdditionalRoles(d, additionalRoles))
                  }
                  chargePct={deal.additionalRoleChargePct ?? 75}
                  onChargePctChange={(additionalRoleChargePct) =>
                    setDeal((d) => ({ ...d, additionalRoleChargePct }))
                  }
                  deal={deal}
                  profile={profile}
                  primaryRole={deal.dealRole}
                />
              </div>

              <div className="field">
                <label>Project Type</label>
                <ProjectSearchInput
                  value={deal.project}
                  onChange={(v) => setDeal((d) => ({ ...d, project: v }))}
                />
                {getProjectTypeHelper(deal.project) ? (
                  <p className="helper">{getProjectTypeHelper(deal.project)}</p>
                ) : null}
              </div>

              <div className="field">
                <label>Additional scope notes</label>
                <textarea
                  value={deal.scopeNotes}
                  onChange={(e) => setDeal((d) => ({ ...d, scopeNotes: e.target.value }))}
                  placeholder="Describe any specific deliverables or goals not covered above…"
                />
              </div>

              {flatRateEligible ? (
                <div className="field" style={{ marginTop: 8 }}>
                  <label>Price your labor</label>
                  <Seg
                    options={PRICING_MODE_OPTIONS}
                    value={deal.pricingMode === "project" ? "project" : "days"}
                    onChange={(v) =>
                      setDeal((d) => ({
                        ...d,
                        pricingMode: v === "project" ? "project" : "days",
                      }))
                    }
                  />
                  <p className="helper">
                    {deal.pricingMode === "project"
                      ? "Flat fee for this deliverable-based role. Scope helper below — kit, crew, and usage still add on."
                      : "Day rate for open-ended work. Switch to flat when deliverables are fixed (frames, pages, etc.)."}
                  </p>
                </div>
              ) : deal.dealRole ? (
                <p className="helper" style={{ marginTop: 8, marginBottom: 4 }}>
                  This role is priced by day rate (production / post days below).
                </p>
              ) : null}

              {flatRateEligible && deal.pricingMode === "project" ? (
                <FlatRateScopePanel
                  role={deal.dealRole}
                  laborDayRate={laborDayRate}
                  unitCount={deal.flatUnitCount}
                  estimatedDays={deal.flatEstimatedDays}
                  unitDerivedDays={flatUnitDerivedDays}
                  complexity={deal.flatComplexity}
                  revisionRounds={deal.flatRevisionRounds}
                  projectFee={deal.projectFee}
                  suggestion={flatSuggestion}
                  onScopeChange={(patch) =>
                    setDeal((d) => {
                      const next = { ...d, ...patch };
                      if (
                        (patch.flatUnitCount !== undefined || patch.flatComplexity !== undefined) &&
                        patch.flatEstimatedDays === undefined
                      ) {
                        next.flatEstimatedDays = computeDerivedEstimatedDays(
                          d.dealRole,
                          next.flatUnitCount,
                          next.flatComplexity,
                        );
                      }
                      return next;
                    })
                  }
                  onProjectFeeChange={(projectFee) => setDeal((d) => ({ ...d, projectFee }))}
                />
              ) : deal.pricingMode !== "project" ? (
              <>
              <div className="deal-days-row" style={{ marginTop: flatRateEligible ? 8 : 18, marginBottom: 14 }}>
                {dayMode === "dual" && (
                  <div className="row">
                    <SpinCounter
                      label="Production Days"
                      value={deal.shootDays}
                      onChange={(v) => setDeal((d) => ({ ...d, shootDays: v }))}
                      step={0.5}
                    />
                    <SpinCounter
                      label="Edit Days"
                      value={deal.editDays}
                      onChange={(v) => setDeal((d) => ({ ...d, editDays: v }))}
                      step={0.5}
                    />
                  </div>
                )}
                {dayMode === "production" && (
                  <SpinCounter
                    label="Production Days"
                    value={deal.shootDays}
                    onChange={(v) => setDeal((d) => ({ ...d, shootDays: v }))}
                    step={0.5}
                  />
                )}
                {dayMode === "post" && (
                  <SpinCounter
                    label="Post-Production Days"
                    value={deal.editDays}
                    onChange={(v) => setDeal((d) => ({ ...d, editDays: v }))}
                    step={0.5}
                  />
                )}
                {dayMode === "design" && (
                  <SpinCounter
                    label="Working Days"
                    value={deal.editDays}
                    onChange={(v) => setDeal((d) => ({ ...d, editDays: v }))}
                    step={0.5}
                  />
                )}
              </div>
              </>
              ) : null}

              {deal.pricingMode !== "project" && (
                <div style={{ marginTop: 4, marginBottom: 14 }}>
                  <SpinCounter
                    label="Pre-production days (optional)"
                    value={deal.preProDays}
                    onChange={(v) => setDeal((d) => ({ ...d, preProDays: v }))}
                    step={0.5}
                  />
                  <p className="helper">
                    {PRE_PRO_DAY_ROLES.has(deal.dealRole)
                      ? `Prep before the shoot (casting, locations, design, etc.) bills at the same $${fmt(Math.round(baseDay))}/day rate as production — listed separately on the invoice.`
                      : "Optional. Use for prep before shoot days (casting, locations, design). Same day rate as production, separate line on the SOW."}
                  </p>
                </div>
              )}

              <div className="field-pair">
                <div className="field">
                  <label>Deadline tightness</label>
                  <Seg options={RUSH_OPTIONS} value={deal.rush} onChange={(v) => setDeal((d) => ({ ...d, rush: v }))} />
                </div>
                <div className="field">
                  <label>Usage rights</label>
                  <Seg options={USAGE_OPTIONS} value={deal.usage} onChange={(v) => setDeal((d) => ({ ...d, usage: v }))} />
                  <div className="helper">{USAGE_HELPER[deal.usage] ?? USAGE_HELPER.organic}</div>
                </div>
              </div>

              <div className="field">
                <label>Additional crew</label>
                <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 10 }}>
                  Optional day-rate estimates for extra crew. Confirm final quotes directly with each crew member.
                </div>
                <AdditionalCrewPicker
                  entries={deal.additionalCrew ?? []}
                  onChange={(additionalCrew) => setDeal((d) => ({ ...d, additionalCrew }))}
                  deal={deal}
                  profile={profile}
                />
              </div>

              <div className="field">
                <label>Media storage &amp; data</label>
                <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 10 }}>
                  Rushes need a home after the shoot. Drives, ingest, and holding for the editor are billed separately from kit rental.
                </div>
                <label style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 8, display: "block" }}>
                  Who provides storage?
                </label>
                <Seg
                  options={MEDIA_STORAGE_PROVIDER_OPTIONS.map((o) => ({ id: o.id, label: o.label }))}
                  value={deal.mediaStorageProvider}
                  onChange={(v) =>
                    setDeal((d) => ({
                      ...d,
                      mediaStorageProvider: v,
                      mediaStorageTier: v === "you" ? d.mediaStorageTier || "500gb" : "",
                    }))
                  }
                />

                {deal.mediaStorageProvider === "you" && (
                  <div style={{ marginTop: 14 }}>
                    <label style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 8, display: "block" }}>
                      Data volume (you provide)
                    </label>
                    <div className="chips" style={{ marginTop: 2 }}>
                      {MEDIA_STORAGE_TIERS.map((tier) => (
                        <div
                          key={tier.id}
                          role="button"
                          tabIndex={0}
                          className={`chip${deal.mediaStorageTier === tier.id ? " active" : ""}`}
                          onClick={() => setDeal((d) => ({ ...d, mediaStorageTier: tier.id }))}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setDeal((d) => ({ ...d, mediaStorageTier: tier.id }));
                            }
                          }}
                        >
                          {tier.label} · ${fmt(tier.amount)}
                          <span style={{ display: "block", fontSize: 10, fontWeight: 500, opacity: 0.85, marginTop: 2 }}>
                            {tier.driveNote} · ~${fmt(tier.amazonHardware)} on Amazon + ingest
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="helper" style={{ marginTop: 8 }}>
                      Pass-through based on Samsung T7 SSD prices on Amazon (~25% for offload, checksum, redundancy, and handoff
                      {deal.editDays > 0 ? " through post" : ""}). 5 TB uses two 2TB drives — Samsung does not sell a single 5TB T7.
                      Client-owned drives can still use the DIT option below.
                    </p>
                  </div>
                )}

                {deal.mediaStorageProvider === "client" && (
                  <p className="helper" style={{ marginTop: 10 }}>
                    No storage line item. You can still bill on-set DIT / data management labor below.
                  </p>
                )}

                {(deal.shootDays > 0 || dayMode === "production" || dayMode === "dual") && (
                  <div style={{ marginTop: 14 }}>
                    <label style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 8, display: "block" }}>
                      DIT / on-set data management
                    </label>
                    <div style={{ display: "flex", gap: 8 }}>
                      {(["no", "yes"] as const).map((choice) => {
                        const isYes = choice === "yes";
                        const isActive = isYes ? deal.chargeDitFee : !deal.chargeDitFee;
                        const ditPreview =
                          deal.shootDays > 0
                            ? getEstimatedBaseDayRate(profile, "DIT") * deal.shootDays
                            : 0;
                        return (
                          <button
                            key={choice}
                            type="button"
                            onClick={() => setDeal((d) => ({ ...d, chargeDitFee: isYes }))}
                            style={{
                              flex: 1,
                              padding: "13px 0",
                              borderRadius: 12,
                              border: `1px solid ${isActive ? (isYes ? "rgba(232,197,122,0.5)" : "var(--border-2)") : "var(--border)"}`,
                              background: isActive ? (isYes ? "var(--grad-soft)" : "var(--surface-2)") : "var(--surface)",
                              color: isActive ? (isYes ? "var(--gold)" : "var(--text)") : "var(--text-3)",
                              fontWeight: 600,
                              fontSize: 14,
                              cursor: "pointer",
                            }}
                          >
                            {isYes
                              ? deal.shootDays > 0
                                ? `Bill DIT · ~$${fmt(ditPreview)}`
                                : "Bill DIT"
                              : "No DIT fee"}
                          </button>
                        );
                      })}
                    </div>
                    {deal.chargeDitFee && deal.shootDays > 0 && (
                      <p className="helper" style={{ marginTop: 8 }}>
                        {deal.shootDays} shoot day{deal.shootDays !== 1 ? "s" : ""} at estimated DIT day rate (ingest, checksum, handoff).
                      </p>
                    )}
                    {deal.chargeDitFee && deal.shootDays <= 0 && (
                      <p className="helper" style={{ marginTop: 8 }}>
                        Add production days above to calculate the DIT line item.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Equipment & Kit Fees */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-2)", marginBottom: 8 }}>Equipment &amp; Kit Fees</div>
                <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 10 }}>Will a kit fee be billed on this deal?</div>

                {/* Binary Yes / No toggle */}
                <div style={{ display: "flex", gap: 8, marginBottom: deal.kitFee === "locker" ? 12 : 0 }}>
                  {(["no", "yes"] as const).map((choice) => {
                    const isYes = choice === "yes";
                    const isActive = isYes ? deal.kitFee === "locker" : deal.kitFee !== "locker";
                    return (
                      <button
                        key={choice}
                        type="button"
                        onClick={() => setDeal((d) => ({
                          ...d,
                          kitFee: isYes ? "locker" : "",
                          kitFeeLockerItems: isYes ? gearLocker.map((g) => g.id) : d.kitFeeLockerItems,
                          kitFeeCustom: isYes ? d.kitFeeCustom : "",
                        }))}
                        style={{
                          flex: 1,
                          padding: "13px 0",
                          borderRadius: 12,
                          border: `1px solid ${isActive ? (isYes ? "rgba(232,197,122,0.5)" : "var(--border-2)") : "var(--border)"}`,
                          background: isActive ? (isYes ? "var(--grad-soft)" : "var(--surface-2)") : "var(--surface)",
                          color: isActive ? (isYes ? "var(--gold)" : "var(--text)") : "var(--text-3)",
                          fontWeight: 600,
                          fontSize: 14,
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {isYes ? "Yes, bill kit" : "No, dry hire"}
                      </button>
                    );
                  })}
                </div>

                {/* Expandable glassmorphic checklist */}
                <div style={{
                  maxHeight: deal.kitFee === "locker" ? 700 : 0,
                  opacity: deal.kitFee === "locker" ? 1 : 0,
                  overflow: "hidden",
                  transition: "max-height 0.38s cubic-bezier(0.4,0,0.2,1), opacity 0.28s ease",
                }}>
                  <div style={{
                    background: "rgba(255,255,255,0.018)",
                    border: "1px solid rgba(232,197,122,0.2)",
                    borderRadius: 14,
                    overflow: "hidden",
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                  }}>
                    {gearLocker.length === 0 ? (
                      <button
                        type="button"
                        onClick={() => go("profile-setup")}
                        style={{ width: "100%", padding: "20px 16px", background: "transparent", border: "none", cursor: "pointer", textAlign: "center" }}
                      >
                        <div style={{ fontSize: 13, color: "var(--text-3)", lineHeight: 1.6 }}>
                          No gear found in your profile locker.{" "}
                          <span style={{ color: "var(--gold)", fontWeight: 600 }}>
                            Click here to add equipment to your profile setup.
                          </span>
                        </div>
                      </button>
                    ) : (
                      <>
                        {/* Daily Rental Rate Factor segmented selector */}
                        <div style={{ padding: "10px 12px 0" }}>
                          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 7 }}>Daily Rental Rate Factor</div>
                          <div style={{ display: "flex", background: "var(--elevated)", borderRadius: 10, overflow: "hidden", border: "1px solid var(--border)" }}>
                            {([
                              { val: "0.03", pct: "3%", desc: "High-Value Cinema" },
                              { val: "0.04", pct: "4%", desc: "Standard Mid-Tier" },
                              { val: "0.05", pct: "5%", desc: "Industry Standard" },
                            ] as const).map(({ val, pct, desc }, idx) => {
                              const isActive = (deal.kitFeeRate || "0.05") === val;
                              return (
                                <button
                                  key={val}
                                  type="button"
                                  onClick={() => setDeal((d) => ({ ...d, kitFeeRate: val }))}
                                  style={{
                                    flex: 1,
                                    padding: "9px 4px 7px",
                                    background: isActive ? "rgba(52,211,153,0.07)" : "transparent",
                                    border: "none",
                                    borderLeft: idx > 0 ? "1px solid var(--border)" : "none",
                                    borderBottom: `2px solid ${isActive ? "#34d399" : "transparent"}`,
                                    cursor: "pointer",
                                    textAlign: "center",
                                    transition: "all 0.18s ease",
                                  }}
                                >
                                  <div style={{ fontSize: 15, fontWeight: 700, color: isActive ? "#34d399" : "var(--text-3)", lineHeight: 1, marginBottom: 3 }}>{pct}</div>
                                  <div style={{ fontSize: 9, fontWeight: 600, color: isActive ? "rgba(52,211,153,0.7)" : "var(--text-3)", letterSpacing: "0.04em", lineHeight: 1.3 }}>{desc}</div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Item checklist */}
                        <div style={{ padding: "10px 12px 4px", display: "grid", gap: 6 }}>
                          {gearLocker.map((item) => {
                            const checked = deal.kitFeeLockerItems.includes(item.id);
                            const itemCost = parseFloat(item.cost.replace(/,/g, "")) || 0;
                            const dailyFee = Math.round(itemCost * lockerRateMultiplier);
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => setDeal((d) => ({
                                  ...d,
                                  kitFeeLockerItems: checked
                                    ? d.kitFeeLockerItems.filter((i) => i !== item.id)
                                    : [...d.kitFeeLockerItems, item.id],
                                }))}
                                style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: checked ? "rgba(232,197,122,0.06)" : "var(--elevated)", border: `1px solid ${checked ? "rgba(232,197,122,0.25)" : "var(--border)"}`, borderRadius: 10, cursor: "pointer", textAlign: "left", transition: "all 0.15s ease" }}
                              >
                                <div style={{ width: 18, height: 18, borderRadius: 6, border: checked ? "none" : "1.5px solid var(--border-2)", background: checked ? "var(--grad)" : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  {checked && (
                                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                                      <path d="M2 6l3 3 5-5" stroke="#1a1306" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  )}
                                </div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: 13, fontWeight: 600, color: checked ? "var(--text)" : "var(--text-2)" }}>{item.name || "Unnamed item"}</div>
                                  <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>
                                    {item.cost ? `$${item.cost}` : "—"} &mdash; ${fmt(dailyFee)}/day
                                  </div>
                                </div>
                                {checked && (
                                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gold)", flexShrink: 0 }}>+${fmt(dailyFee)}/day</div>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Live accumulator row */}
                        {deal.kitFeeLockerItems.length > 0 && (
                          <div style={{ margin: "6px 12px 8px", padding: "8px 12px", background: "rgba(232,197,122,0.06)", borderRadius: 8, border: "1px solid rgba(232,197,122,0.15)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ fontSize: 11, color: "var(--text-3)" }}>
                              Active: <span style={{ color: "var(--text-2)", fontWeight: 600 }}>${fmt(lockerActiveValue)}</span>
                              {" · "}Daily: <span style={{ color: "var(--gold)", fontWeight: 600 }}>${fmt(lockerDailyRate)}</span>
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--gold)" }}>${fmt(lockerTotal)} total</div>
                          </div>
                        )}

                        {/* Custom one-off rental add-on */}
                        <div style={{ padding: "0 12px 12px" }}>
                          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 6 }}>+ Add Custom One-Off Rental</div>
                          <div style={{ display: "flex", alignItems: "center", background: "var(--elevated)", border: "1px solid var(--border-2)", borderRadius: 10, overflow: "hidden" }}>
                            <span style={{ padding: "0 12px", fontSize: 15, fontWeight: 700, color: "var(--gold)", flexShrink: 0 }}>$</span>
                            <input
                              type="number"
                              placeholder="0"
                              value={deal.kitFeeCustom}
                              onChange={(e) => setDeal((d) => ({ ...d, kitFeeCustom: e.target.value }))}
                              style={{ flex: 1, background: "transparent", border: "none", outline: "none", padding: "11px 12px 11px 0", fontSize: 14, color: "var(--text)", fontFamily: "inherit" }}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="btn-row">
                <button type="button" className="btn btn-ghost" onClick={dealBack}>
                  Back
                </button>
                <button type="button" className="btn btn-primary" onClick={dealNext}>
                  Continue
                </button>
              </div>
            </div>
          )}
          {dealStep === 3 && (
            <div className="deal-form-grid">
              <h2>Ask them this</h2>
              <div className="card" style={{ background: "var(--grad-soft)", borderColor: "rgba(232,197,122,0.3)" }}>
                <p style={{ margin: 0, fontSize: 14 }}>
                  Help me understand the business outcome — what does this unlock for you in the next 12 months.
                </p>
              </div>

              <div className="field" style={{ marginTop: 18 }}>
                <label>Why do they need this now?</label>
                <div className="chips" style={{ marginTop: 2 }}>
                  {INTENT_OPTIONS.map((opt) => (
                    <div
                      key={opt.id}
                      role="button"
                      tabIndex={0}
                      className={`chip${intelWhy === opt.id ? " active" : ""}`}
                      onClick={() => setIntelWhy(intelWhy === opt.id ? "" : opt.id)}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setIntelWhy(intelWhy === opt.id ? "" : opt.id); } }}
                    >
                      {opt.label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="field-pair">
                <div className="field">
                  <label>Company size</label>
                  <ChipGroup
                    options={COMPANY_SIZE_OPTIONS}
                    value={intelCompanySize}
                    onChange={(v) => setIntelCompanySize(v as string)}
                  />
                </div>
                <div className="field">
                  <label>Expected annual revenue</label>
                  <ChipGroup
                    options={ANNUAL_REVENUE_OPTIONS}
                    value={intelAnnualRevenue}
                    onChange={(v) => setIntelAnnualRevenue(v as string)}
                  />
                </div>
              </div>

              <div className="field">
                <label>What is one customer worth to them?</label>
                <input
                  value={intelLtv}
                  onChange={(e) => setIntelLtv(e.target.value)}
                  placeholder="e.g. $1,200/subscription or $500 product price"
                />
                <div className="helper">Customer LTV unlocks break-even analysis.</div>
              </div>

              <div className="field-pair">
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
            </div>
          )}
        </div>
      </div>

      <div className={screenClass("loading")}>
        <div className="screen-pad">
          <div className="loading">
            <div className="spinner" />
            <h2>Building your deal guidance</h2>
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
              <div style={{ marginTop: 10 }}>
                <span className="badge" style={{ letterSpacing: "0.07em", fontSize: 11 }}>
                  FREELANCE MARKET RATE
                </span>
              </div>
            </div>
            <div className="card" style={{ marginTop: 14 }}>
              <div className="big-num">${fmt(result.target)}</div>
              <p className="muted small">{rateDetail}</p>
              {result.valuePremium && (
                <>
                  <div style={{ marginTop: 12 }}>
                    <span className="badge gold">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
                        <path d="M6 1l1.3 2.6L10 4.1 8 6l.5 2.8L6 7.5 3.5 8.8 4 6 2 4.1l2.7-.5L6 1z" fill="currentColor"/>
                      </svg>
                      Value Premium Applied
                    </span>
                  </div>
                  <p style={{ margin: "10px 0 0", fontSize: 13, color: "var(--text-3)", lineHeight: 1.5 }}>
                    MIMS upgraded your baseline rate because this client stands to gain a massive financial return from your deliverables. Charge for the value, not just the hours.
                  </p>
                </>
              )}
            </div>
            <div className="card" style={{ marginTop: 14, padding: 0, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                <div style={{ padding: "16px 16px 18px", borderRight: "1px solid var(--border)" }}>
                  <div className="eyebrow" style={{ marginBottom: 10 }}>Negotiation Leverage</div>
                  {result.breakEvenSales != null ? (
                    <>
                      <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1, color: "var(--gold)" }}>
                        {result.breakEvenSales}
                      </div>
                      <p style={{ margin: "8px 0 0", fontSize: 12, color: "var(--text-3)", lineHeight: 1.5 }}>
                        Pays for itself at {result.breakEvenSales} new customer{result.breakEvenSales !== 1 ? "s" : ""}.
                      </p>
                    </>
                  ) : (
                    <p style={{ margin: 0, fontSize: 12, color: "var(--text-3)", lineHeight: 1.5 }}>
                      Add customer LTV above to unlock this.
                    </p>
                  )}
                </div>
                <div style={{ padding: "16px 16px 18px" }}>
                  <div className="eyebrow" style={{ marginBottom: 10 }}>Walk-Away Floor</div>
                  <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1, color: "var(--coral)" }}>
                    {result.floorRate !== undefined ? `$${fmt(result.floorRate)}` : "—"}
                  </div>
                  <p style={{ margin: "8px 0 0", fontSize: 12, color: "var(--text-3)", lineHeight: 1.5 }}>
                    Minimum viable floor. Reduce scope before pricing under this line.
                  </p>
                </div>
              </div>
            </div>
            <button
              type="button"
              className="btn"
              style={{
                marginTop: 14,
                background: "linear-gradient(135deg, #34d399 0%, #059669 100%)",
                color: "#022c22",
                boxShadow: "0 4px 24px rgba(52, 211, 153, 0.22)",
                letterSpacing: "-0.01em",
              }}
              onClick={() => setShowNegoSheet(true)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} style={{ flexShrink: 0 }}>
                <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3v-3z" />
              </svg>
              View negotiation points to make
            </button>
            {result.crewSplit &&
              (result.crewSplit.shootDays > 0 ||
                result.crewSplit.editDays > 0 ||
                result.crewSplit.projectSubtotal > 0 ||
                result.crewSplit.prePro > 0) && (
              <CrewSplitCard cs={result.crewSplit} />
            )}
            {result.crewSplit && (
              <ProductionBudgetPanel
                deal={deal}
                profile={profile}
                target={result.target}
                crewSplit={result.crewSplit}
                scopeServiceLines={buildScopeServiceLines(deal, result.crewSplit)}
                onToast={showToast}
              />
            )}
            <div className="card" style={{ marginTop: 14, ...verdictCardStyle(result.mood) }}>
              <p className="muted small">{result.verdict}</p>
            </div>

            <BookingProtectionCard target={result.target} crewSplit={result.crewSplit} />

            {/* Additional Request Fee drawer */}
            <div style={{ marginTop: 14, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
              <button
                type="button"
                onClick={() => setArfOpen((v) => !v)}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", background: "transparent", border: "none", color: "var(--text)", cursor: "pointer", textAlign: "left" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(232,197,122,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth={2.5}>
                      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>Additional Request Fee</span>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth={2} style={{ transition: "transform 0.2s", transform: arfOpen ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {arfOpen && (
                <div style={{ padding: "0 18px 18px", borderTop: "1px solid var(--border)" }}>
                  <p style={{ fontSize: 12, color: "var(--text-3)", margin: "12px 0 14px", lineHeight: 1.6 }}>
                    Scope creep happens. Use this script to professionally communicate the added fee without apologizing or discounting.
                  </p>

                  {/* Quick-set buttons */}
                  <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
                    {[
                      { label: "½ Day Rate", value: Math.round(((result.crewSplit?.productionDayRate ?? Math.round(result.target * 0.18)) / 2) / 25) * 25 },
                      { label: "Full Day Rate", value: Math.round((result.crewSplit?.productionDayRate ?? Math.round(result.target * 0.18)) / 25) * 25 },
                      { label: "Rush Add-on", value: Math.round(((result.crewSplit?.productionDayRate ?? Math.round(result.target * 0.18)) * 1.5) / 25) * 25 },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setArfAmount(String(preset.value))}
                        style={{ padding: "6px 11px", background: arfAmount === String(preset.value) ? "var(--grad-soft)" : "var(--elevated)", border: `1px solid ${arfAmount === String(preset.value) ? "rgba(232,197,122,0.4)" : "var(--border)"}`, borderRadius: 8, fontSize: 12, fontWeight: 600, color: arfAmount === String(preset.value) ? "var(--gold)" : "var(--text-2)", cursor: "pointer" }}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  {/* Fee input */}
                  <div style={{ display: "flex", alignItems: "center", background: "var(--elevated)", border: "1px solid var(--border-2)", borderRadius: 10, overflow: "hidden", marginBottom: 14 }}>
                    <span style={{ padding: "0 12px", fontSize: 16, fontWeight: 700, color: "var(--gold)", flexShrink: 0 }}>$</span>
                    <input
                      type="number"
                      placeholder="0"
                      value={arfAmount}
                      onChange={(e) => setArfAmount(e.target.value)}
                      style={{ flex: 1, background: "transparent", border: "none", outline: "none", padding: "12px 12px 12px 0", fontSize: 16, fontWeight: 600, color: "var(--text)", fontFamily: "inherit" }}
                    />
                  </div>

                  {/* Script preview */}
                  <div style={{ background: "var(--elevated)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px", marginBottom: 14, position: "relative" }}>
                    <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.75, margin: 0 }}>
                      {`I would be thrilled to execute these new adjustments for you! Since these assets fall outside our initial baseline project track, it will add an Additional Request Fee of `}
                      <span style={{ color: "var(--gold)", fontWeight: 700 }}>
                        {arfAmount && Number(arfAmount) > 0 ? `$${Number(arfAmount).toLocaleString()}` : "[fee amount]"}
                      </span>
                      {` to our final milestone delivery invoice. Let me know if you would like me to adjust the work order to begin!`}
                    </p>
                  </div>

                  {/* Copy button */}
                  <button
                    type="button"
                    onClick={() => {
                      const feeStr = arfAmount && Number(arfAmount) > 0 ? `$${Number(arfAmount).toLocaleString()}` : "[fee amount]";
                      const script = `I would be thrilled to execute these new adjustments for you! Since these assets fall outside our initial baseline project track, it will add an Additional Request Fee of ${feeStr} to our final milestone delivery invoice. Let me know if you would like me to adjust the work order to begin!`;
                      navigator.clipboard.writeText(script).then(() => showToast("ARF script copied to clipboard"));
                    }}
                    style={{ width: "100%", padding: "12px", background: "var(--grad-soft)", border: "1px solid rgba(232,197,122,0.3)", borderRadius: 10, color: "var(--gold)", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                    </svg>
                    Copy script to clipboard
                  </button>
                </div>
              )}
            </div>

            <div className="btn-row" style={{ marginTop: 24 }}>
              <button type="button" className="btn btn-secondary" onClick={() => go("sow")}>
                Build SOW
              </button>
              <button type="button" className="btn btn-primary" onClick={() => go("invoice")}>
                Send invoice
              </button>
            </div>

            <AppLegalDisclaimer />
          </div>

          {showNegoSheet && result && (
            <div
              style={{
                position: "absolute", inset: 0, zIndex: 50,
                background: "rgba(11,11,15,0.97)",
                backdropFilter: "blur(18px)",
                WebkitBackdropFilter: "blur(18px)",
                display: "flex", flexDirection: "column",
              }}
            >
              {/* Fixed header + tab switcher */}
              <div style={{ padding: "20px 20px 0", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                  <div>
                    <div className="eyebrow" style={{ marginBottom: 4 }}>Deal Guidance</div>
                    <h2 style={{ margin: 0, fontSize: 19 }}>{deal.client || "This Deal"}</h2>
                  </div>
                  <button type="button" className="icon-btn" style={{ flexShrink: 0, marginLeft: 12 }} onClick={() => setShowNegoSheet(false)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div style={{ display: "flex", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 4, gap: 4, marginBottom: 16 }}>
                  {(["blueprint", "simulator"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNegoTab(t)}
                      style={{
                        flex: 1, padding: "9px 4px", borderRadius: 9, border: "none",
                        fontSize: 13, fontWeight: 600, fontFamily: "inherit",
                        background: negoTab === t ? "var(--elevated)" : "transparent",
                        color: negoTab === t ? "var(--text)" : "var(--text-3)",
                        cursor: "pointer", transition: "all 0.15s ease",
                      }}
                    >
                      {t === "blueprint" ? "MIMS Blueprint" : "Sim"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Blueprint tab */}
              {negoTab === "blueprint" ? (
                <div style={{ flex: 1, overflowY: "auto", padding: "0 20px calc(28px + var(--safe-bottom, 0px))" }}>
                  <div className="tactic">
                    <div className="source">01 · Use Client Context in the Estimate</div>
                    <div style={{ fontSize: 11, color: "var(--text-3)", letterSpacing: "0.07em", textTransform: "uppercase", fontWeight: 600, margin: "6px 0 10px" }}>MIMS · Client Context</div>
                    <p style={{ margin: 0, fontSize: 14, color: "var(--text-2)", lineHeight: 1.7 }}>
                      Your rate of <strong style={{ color: "var(--gold)" }}>${fmt(result.target)}</strong> was built from{" "}
                      {deal.client ? <><strong style={{ color: "var(--text)" }}>{deal.client}</strong> client profile</> : "this client"}{" "}
                      business size, project stakes, usage needs, and your market position. Keep the discussion connected to the outcome the work is expected to support.
                    </p>
                  </div>

                  {((profile.resumeClientSignals?.length ?? 0) > 0 || (profile.resumeLeadershipSignals?.length ?? 0) > 0) && (
                    <div className="tactic" style={{ marginTop: 12 }}>
                      <div className="source">Professional Highlights</div>
                      <div style={{ fontSize: 11, color: "var(--text-3)", letterSpacing: "0.07em", textTransform: "uppercase", fontWeight: 600, margin: "6px 0 10px" }}>MIMS · Credibility Signal</div>
                      <p style={{ margin: 0, fontSize: 14, color: "var(--text-2)", lineHeight: 1.7 }}>
                        Your professional highlights support a stronger ask with{" "}
                        {[...(profile.resumeClientSignals ?? []).slice(0, 2), ...(profile.resumeLeadershipSignals ?? []).slice(0, 2)].join(", ")}.
                        Use those examples to show the client they are hiring proven judgment, not just execution time.
                      </p>
                    </div>
                  )}

                  <div className="tactic" style={{ marginTop: 12 }}>
                    <div className="source">02 · Connect the Fee to the Business Result</div>
                    <div style={{ fontSize: 11, color: "var(--text-3)", letterSpacing: "0.07em", textTransform: "uppercase", fontWeight: 600, margin: "6px 0 10px" }}>MIMS · Result Math</div>
                    <p style={{ margin: 0, fontSize: 14, color: "var(--text-2)", lineHeight: 1.7 }}>
                      Before adjusting the number, clarify what it would mean for {deal.client || "this business"} if this creative helped produce{" "}
                      {result.breakEvenSales != null
                        ? <><strong style={{ color: "var(--gold)" }}>{result.breakEvenSales}</strong> new customer{result.breakEvenSales !== 1 ? "s" : ""}</>
                        : "measurable revenue growth"}.{" "}
                      Use that business result to explain why the <strong style={{ color: "var(--gold)" }}>${fmt(result.target)}</strong> investment is sized the way it is.
                    </p>
                  </div>

                  <div className="tactic" style={{ marginTop: 12 }}>
                    <div className="source">03 · Clarify the Need Before Scope</div>
                    <div style={{ fontSize: 11, color: "var(--text-3)", letterSpacing: "0.07em", textTransform: "uppercase", fontWeight: 600, margin: "6px 0 10px" }}>MIMS · Scope Check</div>
                    <p style={{ margin: 0, fontSize: 14, color: "var(--text-2)", lineHeight: 1.7 }}>
                      Ask what success should look like 90 days after delivery, then listen for the business priority behind the creative request. Their answer shows which deliverables matter most and which items can be phased if budget becomes tight.
                    </p>
                  </div>

                  <div className="tactic" style={{ marginTop: 12 }}>
                    <div className="source">04 · Keep Scope Tied to Outcome</div>
                    <div style={{ fontSize: 11, color: "var(--text-3)", letterSpacing: "0.07em", textTransform: "uppercase", fontWeight: 600, margin: "6px 0 10px" }}>MIMS · Scope Protection</div>
                    <p style={{ margin: 0, fontSize: 14, color: "var(--text-2)", lineHeight: 1.7 }}>
                      If <strong style={{ color: "var(--gold)" }}>${fmt(result.target)}</strong> feels too high for the client, reduce the project size before reducing the rate logic. The floor is <strong style={{ color: "var(--coral)" }}>${fmt(result.floorRate ?? result.floor)}</strong>; below that, the scope should be simplified.
                    </p>
                  </div>

                  <button type="button" className="btn btn-secondary" style={{ marginTop: 20, marginBottom: 8 }} onClick={() => setShowNegoSheet(false)}>
                    Got it — back to deal
                  </button>
                </div>
              ) : (
                /* Simulator tab */
                <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
                  {/* Message stream */}
                  <div ref={simScrollRef} style={{ flex: 1, overflowY: "auto", padding: "8px 16px 4px" }}>
                    {simMessages.length === 0 ? (
                      <div style={{ padding: "36px 12px", textAlign: "center" }}>
                        <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(52,211,153,0.07)", border: "1px solid rgba(52,211,153,0.18)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth={2}>
                            <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3v-3z" />
                          </svg>
                        </div>
                        <p style={{ margin: 0, fontSize: 13, color: "var(--text-3)", lineHeight: 1.7 }}>
                          Tap a common client concern below,<br />or type your own to get a response draft.
                        </p>
                      </div>
                    ) : simMessages.map((msg, i) => (
                      <div key={i} style={{ marginBottom: 12 }}>
                        {msg.role === "client" ? (
                          <div style={{
                            background: "var(--surface)", border: "1px solid var(--border-2)",
                            borderRadius: "14px 14px 14px 3px", padding: "11px 14px", maxWidth: "88%",
                          }}>
                            <div style={{ fontSize: 10, color: "var(--text-3)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600, marginBottom: 5 }}>Client Concern</div>
                            <p style={{ margin: 0, fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>{msg.objection}</p>
                          </div>
                        ) : (
                          <div style={{
                            background: "rgba(52,211,153,0.04)", border: "1px solid rgba(52,211,153,0.18)",
                            borderRadius: "3px 14px 14px 14px", padding: "13px 15px", marginTop: 8,
                          }}>
                            <div style={{ fontSize: 10, color: "#34d399", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600, marginBottom: 10 }}>Response Draft</div>
                            {msg.script?.map((line, li) => (
                              <p key={li} style={{ margin: li < (msg.script!.length - 1) ? "0 0 9px" : 0, fontSize: 13, color: "var(--text)", lineHeight: 1.7 }}>{line}</p>
                            ))}
                            {msg.diagnostics && msg.diagnostics.length > 0 && (
                              <div style={{ marginTop: 12, padding: "10px 12px", background: "rgba(232,197,122,0.05)", borderRadius: 10, border: "1px solid rgba(232,197,122,0.15)" }}>
                                <div style={{ fontSize: 10, color: "var(--gold)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600, marginBottom: 8 }}>Follow-Up Questions</div>
                                {msg.diagnostics.map((q, qi) => (
                                  <p key={qi} style={{ margin: qi < msg.diagnostics!.length - 1 ? "0 0 6px" : 0, fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>→ {q}</p>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Sticky input area */}
                  <div style={{ flexShrink: 0, borderTop: "1px solid var(--border)", background: "rgba(11,11,15,0.98)", padding: "10px 14px calc(14px + var(--safe-bottom, 0px))" }}>
                    {/* Preset objection chips */}
                    <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 10, marginBottom: 10 }}>
                      {buildPresetObjections(profile, leverageScore).map((obj) => (
                        <button
                          key={obj.id}
                          type="button"
                          onClick={() => handleSimObjection(obj)}
                          style={{
                            flexShrink: 0, padding: "7px 12px",
                            background: "var(--surface)", border: "1px solid var(--border)",
                            borderRadius: 999, fontSize: 12, color: "var(--text-2)",
                            cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
                            transition: "all 0.15s ease",
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(52,211,153,0.45)"; e.currentTarget.style.color = "#34d399"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-2)"; }}
                        >
                          {obj.label}
                        </button>
                      ))}
                    </div>
                    {/* Custom prompt row */}
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input
                        type="text"
                        value={simInput}
                        onChange={(e) => setSimInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter" && simInput.trim()) handleSimCustom(); }}
                        placeholder="Type a client concern…"
                        style={{
                          flex: 1, background: "var(--surface)", border: "1px solid var(--border)",
                          borderRadius: 12, padding: "11px 13px", color: "var(--text)",
                          fontSize: 14, fontFamily: "inherit", outline: "none",
                          transition: "border-color 0.15s ease",
                        }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(52,211,153,0.5)"; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
                      />
                      <button
                        type="button"
                        onClick={handleSimCustom}
                        disabled={!simInput.trim()}
                        style={{
                          width: 42, height: 42, borderRadius: 12, flexShrink: 0, border: "none",
                          background: simInput.trim() ? "var(--grad)" : "var(--surface)",
                          cursor: simInput.trim() ? "pointer" : "default",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: simInput.trim() ? "#1a1306" : "var(--text-3)",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                          <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className={screenClass("deals")}>
        <div className="scroll">
          <h1>Pipeline</h1>
          <div className="card" style={{ textAlign: "center", padding: "24px 18px" }}>
            <h3 style={{ marginBottom: 6 }}>No saved deals yet</h3>
            <p className="muted small" style={{ margin: "0 0 16px" }}>
              Deals you create will appear here once saving is added.
            </p>
            <button type="button" className="btn btn-secondary" onClick={startNewDeal}>
              Start blank deal
            </button>
          </div>
        </div>
        <TabBar active={screen} onNavigate={go} />
      </div>

      <div className={screenClass("library")}>
        <div className="scroll">
          <h1>Deal library</h1>
          <div className="card">
            <div className="eyebrow">Practical Deal Guidance</div>
            <h3>Your positioning library</h3>
          </div>
        </div>
        <TabBar active={screen} onNavigate={go} />
      </div>

      <div className={screenClass("profile")}>
        <div className="scroll">
          <div className="card center">
            <h2>{displayName || "Your profile"}</h2>
            {profileRole && <p className="muted small">{profileRole}</p>}
          </div>
          <button type="button" className="card" onClick={() => go("welcome")}>
            Re-take questionnaire
          </button>
          <p className="helper center" style={{ marginTop: 16 }}>
            <a href="/terms" style={{ color: "var(--gold)", textDecoration: "none" }}>Terms</a>
            {" · "}
            <a href="/privacy" style={{ color: "var(--gold)", textDecoration: "none" }}>Privacy Policy</a>
          </p>
        </div>
        <TabBar active={screen} onNavigate={go} />
      </div>

      <div className={screenClass("invoice")}>
        <div className="screen-pad">
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Invoice editor</div>
            <p className="muted small" style={{ margin: "0 0 14px" }}>
              These fields feed the invoice preview below. Line items come from the current deal estimate.
            </p>
            <div className="field">
              <label>Invoice number</label>
              <input
                value={invoiceDraft.invoiceNumber}
                onChange={(e) => setInvoiceDraft((d) => ({ ...d, invoiceNumber: e.target.value }))}
              />
            </div>
            <div className="field">
              <label>Billed to</label>
              <input
                value={invoiceDraft.billedToName || deal.client}
                onChange={(e) => setInvoiceDraft((d) => ({ ...d, billedToName: e.target.value }))}
                placeholder="Client or company name"
              />
            </div>
            <div className="row">
              <div className="field">
                <label>Contact</label>
                <input
                  value={invoiceDraft.billedToContact}
                  onChange={(e) => setInvoiceDraft((d) => ({ ...d, billedToContact: e.target.value }))}
                  placeholder="Accounts Payable"
                />
              </div>
              <div className="field">
                <label>Billing email</label>
                <input
                  type="email"
                  value={invoiceDraft.billedToEmail}
                  onChange={(e) => setInvoiceDraft((d) => ({ ...d, billedToEmail: e.target.value }))}
                  placeholder="billing@client.com"
                />
              </div>
            </div>
            <div className="row">
              <div className="field">
                <label>Issued date</label>
                <input
                  type="date"
                  value={invoiceDraft.issuedDate}
                  onChange={(e) => setInvoiceDraft((d) => ({ ...d, issuedDate: e.target.value }))}
                />
              </div>
              <div className="field">
                <label>Due date</label>
                <input
                  type="date"
                  value={invoiceDraft.dueDate}
                  onChange={(e) => setInvoiceDraft((d) => ({ ...d, dueDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="row">
              <div className="field">
                <label>Terms</label>
                <input
                  value={invoiceDraft.terms}
                  onChange={(e) => setInvoiceDraft((d) => ({ ...d, terms: e.target.value }))}
                  placeholder="Net 14"
                />
              </div>
              <div className="field">
                <label>Deposit %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={invoiceDraft.depositPercent}
                  onChange={(e) => setInvoiceDraft((d) => ({ ...d, depositPercent: e.target.value }))}
                />
              </div>
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Payment note</label>
              <textarea
                value={invoiceDraft.paymentNote}
                onChange={(e) => setInvoiceDraft((d) => ({ ...d, paymentNote: e.target.value }))}
              />
            </div>
          </div>
          <p className="helper" style={{ marginBottom: 10 }}>
            Preview only. Have an attorney review this invoice before you send it. Sample payment terms below are
            editable — not legal advice.
          </p>
          <InvoicePreview deal={deal} result={result} profile={profile} draft={invoiceDraft} />
          {result?.crewSplit && (
            <ProductionBudgetPanel
              deal={deal}
              profile={profile}
              target={result.target}
              crewSplit={result.crewSplit}
              scopeServiceLines={buildScopeServiceLines(deal, result.crewSplit)}
              onToast={showToast}
            />
          )}
          <button type="button" className="btn btn-primary" onClick={() => showToast("Invoice send flow coming soon")}>
            Send
          </button>
        </div>
      </div>

      <div className={screenClass("sow")}>
        <div className="screen-pad">
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="card-row" style={{ marginBottom: 8 }}>
              <div className="eyebrow">Scope of work editor</div>
              <button type="button" className="badge" onClick={refreshSowFromDeal}>
                Refresh from deal
              </button>
            </div>
            <p className="muted small" style={{ margin: "0 0 14px" }}>
              Edit any section below. The preview updates as you type. Use refresh to pull new line items from your current estimate.
            </p>
            <div className="row">
              <div className="field">
                <label>Your name / studio</label>
                <input
                  value={sowDraft.creator}
                  onChange={(e) => setSowDraft((d) => ({ ...d, creator: e.target.value }))}
                />
              </div>
              <div className="field">
                <label>Client</label>
                <input
                  value={sowDraft.client}
                  onChange={(e) => setSowDraft((d) => ({ ...d, client: e.target.value }))}
                  placeholder={deal.client || "Client name"}
                />
              </div>
            </div>
            <div className="row">
              <div className="field">
                <label>Version</label>
                <input
                  value={sowDraft.version}
                  onChange={(e) => setSowDraft((d) => ({ ...d, version: e.target.value }))}
                  placeholder="1.0"
                />
              </div>
              <div className="field">
                <label>Document date</label>
                <input
                  type="date"
                  value={sowDraft.docDate}
                  onChange={(e) => setSowDraft((d) => ({ ...d, docDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="field">
              <label>Project description</label>
              <textarea
                value={sowDraft.projectDescription}
                onChange={(e) => setSowDraft((d) => ({ ...d, projectDescription: e.target.value }))}
                rows={3}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <div className="label-sm" style={{ marginBottom: 8 }}>Positions & roles</div>
              {sowDraft.roles.map((role, index) => (
                <div key={role.id} className="row" style={{ marginBottom: 8 }}>
                  <div className="field" style={{ marginBottom: 0 }}>
                    <input
                      value={role.label}
                      onChange={(e) =>
                        setSowDraft((d) => ({
                          ...d,
                          roles: d.roles.map((r, i) => (i === index ? { ...r, label: e.target.value } : r)),
                        }))
                      }
                      placeholder="Role name"
                    />
                  </div>
                  <div className="field" style={{ marginBottom: 0 }}>
                    <input
                      value={role.note}
                      onChange={(e) =>
                        setSowDraft((d) => ({
                          ...d,
                          roles: d.roles.map((r, i) => (i === index ? { ...r, note: e.target.value } : r)),
                        }))
                      }
                      placeholder="Primary / Additional"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 14 }}>
              <div className="card-row" style={{ marginBottom: 8 }}>
                <div className="label-sm">Line items</div>
                <button
                  type="button"
                  className="badge"
                  onClick={() =>
                    setSowDraft((d) => ({
                      ...d,
                      lineItems: [
                        ...d.lineItems,
                        { id: `line-${Date.now()}`, description: "", amount: 0 },
                      ],
                    }))
                  }
                >
                  + Add line
                </button>
              </div>
              {sowDraft.lineItems.map((line, index) => (
                <div key={line.id} className="row" style={{ marginBottom: 8, alignItems: "flex-end" }}>
                  <div className="field" style={{ marginBottom: 0, flex: 2 }}>
                    <input
                      value={line.description}
                      onChange={(e) =>
                        setSowDraft((d) => ({
                          ...d,
                          lineItems: d.lineItems.map((l, i) =>
                            i === index ? { ...l, description: e.target.value } : l,
                          ),
                        }))
                      }
                      placeholder="Service description"
                    />
                  </div>
                  <div className="field" style={{ marginBottom: 0, flex: 1 }}>
                    <input
                      type="number"
                      min="0"
                      value={line.amount || ""}
                      onChange={(e) =>
                        setSowDraft((d) => ({
                          ...d,
                          lineItems: d.lineItems.map((l, i) =>
                            i === index ? { ...l, amount: parseFloat(e.target.value) || 0 } : l,
                          ),
                        }))
                      }
                      placeholder="Amount"
                    />
                  </div>
                  <button
                    type="button"
                    className="icon-btn"
                    style={{ flexShrink: 0, marginBottom: 0 }}
                    aria-label="Remove line item"
                    onClick={() =>
                      setSowDraft((d) => ({
                        ...d,
                        lineItems: d.lineItems.filter((_, i) => i !== index),
                      }))
                    }
                  >
                    ×
                  </button>
                </div>
              ))}
              {sowDraft.lineItems.length === 0 && (
                <p className="muted small" style={{ margin: 0 }}>
                  No line items yet. Refresh from deal or add a line manually.
                </p>
              )}
            </div>

            <div className="field">
              <label>Usage rights</label>
              <textarea
                value={sowDraft.usageRights}
                onChange={(e) => setSowDraft((d) => ({ ...d, usageRights: e.target.value }))}
                rows={2}
              />
            </div>
            <div className="field">
              <label>Revisions</label>
              <textarea
                value={sowDraft.revisions}
                onChange={(e) => setSowDraft((d) => ({ ...d, revisions: e.target.value }))}
                rows={2}
              />
            </div>
            <div className="row">
              <div className="field">
                <label>Total ($)</label>
                <input
                  type="number"
                  min="0"
                  value={sowDraft.total}
                  onChange={(e) => setSowDraft((d) => ({ ...d, total: e.target.value }))}
                  placeholder={result?.target ? String(result.target) : "0"}
                />
              </div>
              <div className="field">
                <label>Deposit %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={sowDraft.depositPercent}
                  onChange={(e) => setSowDraft((d) => ({ ...d, depositPercent: e.target.value }))}
                />
              </div>
            </div>
            <div className="field">
              <label>Payment schedule</label>
              <textarea
                value={sowDraft.paymentSchedule}
                onChange={(e) => setSowDraft((d) => ({ ...d, paymentSchedule: e.target.value }))}
                rows={2}
              />
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Cancellation</label>
              <textarea
                value={sowDraft.cancellation}
                onChange={(e) => setSowDraft((d) => ({ ...d, cancellation: e.target.value }))}
                rows={2}
              />
            </div>
          </div>
          <p className="helper" style={{ marginBottom: 10 }}>
            Preview only. Usage, payment, kill-fee, and cancellation language are draft templates — customize with your
            lawyer before sending or signing.
          </p>
          <SowPreview draft={sowDraft} />
          <button type="button" className="btn btn-primary" onClick={() => showToast("SOW signature flow coming soon")}>
            Send for signature
          </button>
        </div>
      </div>
    </>
  );
}



function screenClass(current: ScreenId, id: ScreenId) {
  return `screen${current === id ? " active" : ""}`;
}

const SCORE_CIRC = 2 * Math.PI * 44;

export default function Page() {
  const [screen, setScreen] = useState<ScreenId>("welcome");
  const [setupStep, setSetupStep] = useState(1);
  const [dealStep, setDealStep] = useState(1);
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [deal, setDeal] = useState<Deal>(defaultDeal);
  const [result, setResult] = useState<Recommendation | null>(null);
  const [rateDetail, setRateDetail] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [showSplash, setShowSplash] = useState(true);
  const [splashFading, setSplashFading] = useState(false);
  const [isWide, setIsWide] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const analysisDealRef = useRef<Deal>(defaultDeal);

  const [setupName, setSetupName] = useState("");
  const [setupEmail, setSetupEmail] = useState("");
  const [setupLocation, setSetupLocation] = useState("");
  const [setupGear, setSetupGear] = useState<GearItem[]>([]);
  const [setupAgreed, setSetupAgreed] = useState(false);
  const [leverageScore, setLeverageScore] = useState<number | null>(null);
  const [professionalHighlights, setProfessionalHighlights] = useState({
    recognizableWork: "",
    leadershipWork: "",
    careerHighlights: "",
  });
  const [highlightsResult, setHighlightsResult] = useState<ReturnType<typeof analyzeProfessionalHighlights> | null>(null);
  const totalLockerReplacementValue = profile.gearLocker.reduce(
    (sum, item) => sum + (parseFloat(item.cost.replace(/,/g, "")) || 0), 0
  );
  const [intelWhy, setIntelWhy] = useState("");
  const [intelLtv, setIntelLtv] = useState("");
  const [intelRoi, setIntelRoi] = useState("");
  const [intelBudget, setIntelBudget] = useState("");
  const [intelAnnualRevenue, setIntelAnnualRevenue] = useState("");
  const [intelCompanySize, setIntelCompanySize] = useState("");
  const [needsLegalBanner, setNeedsLegalBanner] = useState(false);
  const [legalBannerAgreed, setLegalBannerAgreed] = useState(false);
  const displayName = profile.name || "";
  const homeFirst = displayName ? displayName.split(" ")[0] : "";
  const profileRole = [tradeLabel(profile.trade), profile.location].filter(Boolean).join(" · ");

  const go = useCallback((id: ScreenId) => {
    setScreen(id);
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 2400);
  }, []);

  const applyResult = useCallback((r: Recommendation, scope?: string) => {
    setResult(r);
    const defaultScope =
      deal.pricingMode === "project" && deal.projectFee
        ? `Project fee $${fmt(parseMoney(deal.projectFee))} · ${deal.usage} usage`
        : [
            deal.shootDays > 0
              ? `${deal.shootDays} shoot day${deal.shootDays === 1 ? "" : "s"}`
              : "",
            deal.editDays > 0
              ? `${deal.editDays} edit day${deal.editDays === 1 ? "" : "s"}`
              : "",
            deal.preProDays > 0
              ? `${deal.preProDays} pre-pro day${deal.preProDays === 1 ? "" : "s"}`
              : "",
            deal.usage ? `${deal.usage} usage` : "",
          ]
            .filter(Boolean)
            .join(" · ");
    setRateDetail(scope ?? defaultScope);
  }, [deal.editDays, deal.preProDays, deal.pricingMode, deal.projectFee, deal.shootDays, deal.usage]);

  const setupNext = () => {
    if (setupStep === 1 && !profile.trade) {
      showToast("Pick a trade to continue");
      return;
    }
    if (setupStep === 2 && !profile.experience) {
      showToast("Pick your current level");
      return;
    }
    if (setupStep === 3) {
      setProfile((p) => ({ ...p, location: setupLocation.trim() }));
    }
    setSetupStep((s) => Math.min(5, s + 1));
  };

  const setupBack = () => setSetupStep((s) => Math.max(1, s - 1));

  const finishSetup = () => {
    const parsedHighlights = analyzeProfessionalHighlights(professionalHighlights);
    const hasHighlights = [
      professionalHighlights.recognizableWork,
      professionalHighlights.leadershipWork,
      professionalHighlights.careerHighlights,
    ].some((value) => value.trim().length > 0);
    if (hasHighlights) {
      setHighlightsResult(parsedHighlights);
      setLeverageScore(parsedHighlights.score);
    }
    setProfile((p) => ({
      ...p,
      name: setupName.trim() || "Freelancer",
      email: setupEmail.trim(),
      gearLocker: setupGear.filter((g) => g.name.trim()),
      ...(parsedHighlights.detectedExpTier ? { experience: parsedHighlights.detectedExpTier } : {}),
      ...(parsedHighlights.detectedSkillTier ? { skill: parsedHighlights.detectedSkillTier } : {}),
      ...(hasHighlights ? {
        resumeLeverageScore: parsedHighlights.score,
        resumeClientSignals: parsedHighlights.clientSignals,
        resumeLeadershipSignals: parsedHighlights.leadershipSignals,
        resumeMatchedKeywords: parsedHighlights.matchedKeywords,
      } : {}),
    }));
    if (typeof window !== "undefined") {
      localStorage.setItem("mimsOnboardingDone", "1");
      recordLegalConsent();
    }
    go("home");
    showToast(hasHighlights ? `Profile saved · Leverage Score ${parsedHighlights.score}/10 applied` : "Profile saved · your fair rate is ready");
  };

  const startNewDeal = () => {
    if (needsLegalReacceptance()) {
      setNeedsLegalBanner(true);
      showToast("Please accept the updated Terms and Privacy Policy below");
      go("home");
      return;
    }
    setDeal(defaultDeal);
    setResult(null);
    setRateDetail("");
    setIntelWhy("");
    setIntelLtv("");
    setIntelRoi("");
    setIntelBudget("");
    setIntelAnnualRevenue("");
    setIntelCompanySize("");
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
      annualRevenue: intelAnnualRevenue,
      companySize: intelCompanySize,
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

  useEffect(() => {
    if (localStorage.getItem("mimsOnboardingDone") === "1") {
      setScreen("home");
    }
    setNeedsLegalBanner(needsLegalReacceptance());
  }, []);

  useEffect(() => {
    if (screen === "home") setNeedsLegalBanner(needsLegalReacceptance());
  }, [screen]);

  useEffect(() => {
    const mqWide = window.matchMedia("(min-width: 768px)");
    const mqDesktop = window.matchMedia("(hover: hover) and (pointer: fine)");
    const apply = () => setIsWide(mqWide.matches || mqDesktop.matches);
    apply();
    mqWide.addEventListener("change", apply);
    mqDesktop.addEventListener("change", apply);
    return () => {
      mqWide.removeEventListener("change", apply);
      mqDesktop.removeEventListener("change", apply);
    };
  }, []);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setSplashFading(true), 2200);
    const hideTimer = setTimeout(() => setShowSplash(false), 3200);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  const score = result?.score ?? 8;
  const scoreOffset = SCORE_CIRC * (1 - score / 10);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: MIMS_CSS }} />
      <style dangerouslySetInnerHTML={{ __html: MIMS_LAYOUT_OVERRIDE }} />
      <div className={`mims-shell${isWide ? " mims-wide" : ""}`}>
      <div className="app">
        {showSplash && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 200,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background:
                "radial-gradient(420px 240px at 50% 35%, rgba(232,197,122,0.12), transparent 70%), radial-gradient(420px 240px at 50% 55%, rgba(255,122,102,0.1), transparent 70%), var(--bg)",
              opacity: splashFading ? 0 : 1,
              transition: "opacity 1s ease",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                width: 86,
                height: 86,
                borderRadius: 26,
                background: "var(--grad)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#1a1306",
                fontSize: 40,
                fontWeight: 900,
                letterSpacing: "-0.06em",
                boxShadow: "0 30px 70px rgba(255,122,102,0.28), 0 12px 36px rgba(232,197,122,0.2)",
                transform: splashFading ? "scale(0.96)" : "scale(1)",
                transition: "transform 1s ease",
              }}
            >
              M
            </div>
            <div
              style={{
                marginTop: 22,
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--gold)",
              }}
            >
              Make it make sense
            </div>
          </div>
        )}
        {/* Welcome */}
        {screen === "welcome" && (
        <div className={screenClass(screen, "welcome")}>
          <div className="screen-pad no-pad-bottom" style={{ padding: 0 }}>
            <div className="welcome-hero">
              <div className="welcome-mark">M</div>
              <div className="eyebrow" style={{ marginBottom: 14 }}>
                MIMS · v0.1
              </div>
              <h1>
                Charge what you are worth.
                <br />
                Close the deal.
              </h1>
              <p className="muted" style={{ margin: "14px 0 0", fontSize: 15 }}>
                {APP_TAGLINE}
                <br />
                Built for independent freelancers doing the work.
              </p>
            </div>
            <div className="welcome-features">
              {[
                {
                  title: "Fair-market rate, not friend pricing",
                  desc: "Freelance market rate estimates for your trade, level, and city — not a guarantee.",
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
                  title: "Original MIMS guidance",
                  desc: "Plain-language prompts for pricing, scope, usage, and client fit.",
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
                onClick={() => {
                  if (typeof window !== "undefined") localStorage.setItem("mimsOnboardingDone", "1");
                  setProfile(defaultProfile);
                  startNewDeal();
                }}
              >
                Skip — start blank deal
              </button>
            </div>
          </div>
        </div>
        )}

        {/* Profile setup */}
        {screen === "profile-setup" && (
        <div className={screenClass(screen, "profile-setup")}>
          <div className="topbar">
            <div className="left">
              <IconBack onClick={() => go("welcome")} />
            </div>
            <div className="title">About you</div>
            <div className="right" style={{ fontSize: 12, color: "var(--text-3)" }}>
              {setupStep} / 5
            </div>
          </div>
          <div className="screen-pad">
            <div className="progress" style={{ marginBottom: 20 }}>
              <div style={{ width: `${setupStep * 20}%` }} />
            </div>

            {setupStep === 1 && (
              <>
                <h2>What is your position?</h2>
                <p className="muted small" style={{ margin: "6px 0 18px" }}>
                  Pick the role you are charging for today. Search the MIMS production role list.
                </p>
                <RoleSearchInput
                  value={profile.trade}
                  onChange={(v) => setProfile((p) => ({ ...p, trade: v }))}
                />
                <div className="divider" style={{ marginTop: 18 }} />
                <button type="button" className="btn btn-primary" onClick={setupNext}>
                  Continue
                </button>
              </>
            )}

            {setupStep === 2 && (
              <>
                <h2>What level are you operating at?</h2>
                <p className="muted small" style={{ margin: "6px 0 18px" }}>
                  Pick the level that best reflects what you can execute today, not just how many years you have been working.
                </p>
                <ChipGroup
                  options={EXP_OPTIONS}
                  value={profile.experience}
                  onChange={(v) => setProfile((p) => ({ ...p, experience: v as string, skill: v as string }))}
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
                  <label>City or Remote</label>
                  <input
                    type="text"
                    placeholder="e.g. Atlanta, GA · Remote · Brooklyn, NY"
                    value={setupLocation}
                    onChange={(e) => setSetupLocation(e.target.value)}
                  />
                </div>
                <h3 style={{ marginTop: 18 }}>Other skills you offer</h3>
                <p className="muted small" style={{ margin: "6px 0 12px" }}>
                  Search and add every role or skill you can credibly cover.
                </p>
                <SkillsMultiSearch
                  values={profile.extras}
                  onChange={(v) => setProfile((p) => ({ ...p, extras: v }))}
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
                    placeholder="e.g. Your Name · Studio Name"
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
                <div style={{ marginTop: 14 }}>
                  <div className="eyebrow" style={{ marginBottom: 8 }}>Professional Highlights</div>
                  <p className="muted small" style={{ margin: "0 0 12px" }}>
                    These answers help MIMS understand what supports a stronger rate.
                  </p>
                  <div className="field">
                    <label>Have you worked with recognizable brands, agencies, studios, or public figures?</label>
                    <textarea
                      value={professionalHighlights.recognizableWork}
                      onChange={(e) => setProfessionalHighlights((h) => ({ ...h, recognizableWork: e.target.value }))}
                      placeholder="Example: Nike campaign, major label artist, agency production, local public figure..."
                    />
                  </div>
                  <div className="field">
                    <label>Have you led teams, departments, crews, or client-facing creative decisions?</label>
                    <textarea
                      value={professionalHighlights.leadershipWork}
                      onChange={(e) => setProfessionalHighlights((h) => ({ ...h, leadershipWork: e.target.value }))}
                      placeholder="Example: led a 5-person crew, directed client creative, managed post workflow..."
                    />
                  </div>
                  <div className="field">
                    <label>What are 2–3 career highlights that make your rate stronger?</label>
                    <textarea
                      value={professionalHighlights.careerHighlights}
                      onChange={(e) => setProfessionalHighlights((h) => ({ ...h, careerHighlights: e.target.value }))}
                      placeholder="Add awards, notable projects, years of experience, outcomes, press, or high-trust work..."
                    />
                  </div>
                  {highlightsResult && leverageScore !== null && (
                    <div style={{
                      padding: "14px 16px",
                      background: "rgba(232,197,122,0.06)",
                      border: "1px solid rgba(232,197,122,0.25)",
                      borderRadius: 14,
                    }}>
                      <div style={{ fontSize: 11, color: "var(--gold)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 3 }}>
                        Leverage Score Applied
                      </div>
                      <div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>
                        MIMS will use these highlights as rate confidence and negotiation support.
                      </div>
                    </div>
                  )}
                </div>
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
            {setupStep === 5 && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--grad-soft)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth={2}>
                      <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" /><line x1="12" y1="12" x2="12" y2="16" /><line x1="10" y1="14" x2="14" y2="14" />
                    </svg>
                  </div>
                  <div>
                    <h2 style={{ margin: 0 }}>Your Production Gear Locker</h2>
                  </div>
                </div>
                <p className="muted small" style={{ margin: "6px 0 20px" }}>
                  Log your equipment and its replacement value. Optional — skip if you travel light.
                </p>

                {/* Gear rows */}
                <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
                  {setupGear.map((item, idx) => (
                    <div key={item.id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input
                        type="text"
                        placeholder="e.g. Sony FX3, Sigma 24-70mm"
                        value={item.name}
                        onChange={(e) => setSetupGear((g) => g.map((r, i) => i === idx ? { ...r, name: e.target.value } : r))}
                        style={{
                          flex: 1, background: "var(--surface)", border: "1px solid var(--border)",
                          borderRadius: 12, padding: "12px 14px", color: "var(--text)", fontSize: 14,
                          fontFamily: "inherit", outline: "none", transition: "border-color 0.15s ease",
                        }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = "var(--gold)"; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
                      />
                      <div style={{ display: "flex", alignItems: "center", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", flexShrink: 0, width: 120 }}>
                        <span style={{ padding: "0 8px 0 12px", fontSize: 14, fontWeight: 600, color: "var(--gold)" }}>$</span>
                        <input
                          type="number"
                          placeholder="0"
                          value={item.cost}
                          onChange={(e) => setSetupGear((g) => g.map((r, i) => i === idx ? { ...r, cost: e.target.value } : r))}
                          style={{
                            width: "100%", background: "transparent", border: "none", outline: "none",
                            padding: "12px 10px 12px 0", fontSize: 14, color: "var(--text)", fontFamily: "inherit",
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setSetupGear((g) => g.filter((_, i) => i !== idx))}
                        style={{ width: 36, height: 36, borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-3)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                        aria-label="Remove"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add row button */}
                <button
                  type="button"
                  onClick={() => setSetupGear((g) => [...g, { id: String(Date.now()), name: "", cost: "" }])}
                  style={{ width: "100%", padding: "12px", background: "transparent", border: "1px dashed var(--border-2)", borderRadius: 12, color: "var(--text-3)", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 18 }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add Gear Item
                </button>

                {/* Running total */}
                {setupGear.some((g) => parseFloat(g.cost) > 0) && (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "var(--grad-soft)", border: "1px solid rgba(232,197,122,0.3)", borderRadius: 12, marginBottom: 18 }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 2 }}>Total Locker Replacement Value</div>
                      <div style={{ fontSize: 11, color: "var(--text-3)" }}>{setupGear.filter((g) => g.name.trim()).length} item{setupGear.filter((g) => g.name.trim()).length !== 1 ? "s" : ""} logged</div>
                    </div>
                    <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.03em", background: "var(--grad)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                      ${setupGear.reduce((s, g) => s + (parseFloat(g.cost.replace(/,/g, "")) || 0), 0).toLocaleString("en-US")}
                    </div>
                  </div>
                )}

                <div className="divider" />

                {/* Legal acknowledgment gate */}
                <button
                  type="button"
                  onClick={() => setSetupAgreed((v) => !v)}
                  style={{
                    width: "100%", display: "flex", alignItems: "flex-start", gap: 12,
                    padding: "14px 16px", marginBottom: 14,
                    background: setupAgreed ? "rgba(232,197,122,0.05)" : "var(--surface)",
                    border: `1px solid ${setupAgreed ? "rgba(232,197,122,0.3)" : "var(--border)"}`,
                    borderRadius: 14, cursor: "pointer", textAlign: "left",
                    transition: "all 0.18s ease",
                  }}
                >
                  <div style={{
                    width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 1,
                    border: setupAgreed ? "none" : "1.5px solid var(--border-2)",
                    background: setupAgreed ? "var(--grad)" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.15s ease",
                  }}>
                    {setupAgreed && (
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="#1a1306" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: setupAgreed ? "var(--text)" : "var(--text-2)", lineHeight: 1.55 }}>
                    I understand that MIMS provides educational pricing and deal-prep estimates only — not legal, financial, tax, accounting, or contract advice, and not a guarantee any client will accept a rate. MIMS is for independent freelance work only. I agree to the <a href="/terms" style={{ color: "var(--gold)", textDecoration: "none" }} onClick={(event) => event.stopPropagation()}>Terms</a> and <a href="/privacy" style={{ color: "var(--gold)", textDecoration: "none" }} onClick={(event) => event.stopPropagation()}>Privacy Policy</a> (version {LEGAL_VERSION}).
                  </p>
                </button>

                <div className="btn-row">
                  <button type="button" className="btn btn-ghost" onClick={setupBack}>
                    Back
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={finishSetup}
                    disabled={!setupAgreed}
                    style={{ opacity: setupAgreed ? 1 : 0.35, cursor: setupAgreed ? "pointer" : "not-allowed", transition: "opacity 0.2s ease" }}
                  >
                    Finish setup
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        )}

        {/* Home */}
        {screen === "home" && (
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
            <div className="home-layout">
            <div className="home-hero" style={{ marginBottom: 20 }}>
              <div className="eyebrow" style={{ marginBottom: 4 }}>
                {homeFirst ? `Hello ${homeFirst}` : "Welcome"}
              </div>
              <p style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 700, color: "#ffffff", letterSpacing: "-0.01em" }}>
                let us make this deal make sense
              </p>
              <h1>What are we doing today?</h1>
            </div>

            {needsLegalBanner && (
              <div
                className="card home-span-full"
                style={{ borderColor: "rgba(232,197,122,0.35)", marginBottom: 4 }}
              >
                <div className="eyebrow" style={{ marginBottom: 8 }}>Terms updated</div>
                <p className="muted small" style={{ margin: "0 0 12px", lineHeight: 1.55 }}>
                  Please confirm you agree to the current Terms and Privacy Policy (version {LEGAL_VERSION}) before
                  starting a new deal.
                </p>
                <button
                  type="button"
                  onClick={() => setLegalBannerAgreed((v) => !v)}
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                    width: "100%",
                    background: "transparent",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 6,
                      flexShrink: 0,
                      marginTop: 1,
                      border: legalBannerAgreed ? "none" : "1.5px solid var(--border-2)",
                      background: legalBannerAgreed ? "var(--grad)" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {legalBannerAgreed ? (
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="#1a1306" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : null}
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: "var(--text-2)", lineHeight: 1.55 }}>
                    I agree to the{" "}
                    <a href="/terms" style={{ color: "var(--gold)", textDecoration: "none" }} onClick={(e) => e.stopPropagation()}>
                      Terms
                    </a>{" "}
                    and{" "}
                    <a href="/privacy" style={{ color: "var(--gold)", textDecoration: "none" }} onClick={(e) => e.stopPropagation()}>
                      Privacy Policy
                    </a>
                    .
                  </p>
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ marginTop: 14 }}
                  disabled={!legalBannerAgreed}
                  onClick={() => {
                    recordLegalConsent();
                    setNeedsLegalBanner(false);
                    setLegalBannerAgreed(false);
                    showToast("Terms accepted");
                  }}
                >
                  Confirm & continue
                </button>
              </div>
            )}

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
                  <h3 style={{ fontSize: 18, color: "#ffffff" }}>Start a deal</h3>
                  <p className="muted small" style={{ margin: "4px 0 0" }}>
                    3 minute questionnaire → your rate + deal guidance.
                  </p>
                </div>
                <div className="logo-mark" style={{ width: 40, height: 40, borderRadius: 14 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width={18} height={18}>
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>

            {!isWide ? <InstallMimsBanner /> : null}

            <div className="home-span-full" style={{ marginTop: 28 }}>
              <div className="card-row" style={{ marginBottom: 12 }}>
                <h3>Active deals</h3>
                <button type="button" className="badge" onClick={() => showToast("Saved deals coming soon")}>
                  All
                </button>
              </div>
              <div className="card" style={{ textAlign: "center", padding: "22px 18px" }}>
                <h4 style={{ marginBottom: 6 }}>No active deals yet</h4>
                <p className="muted small" style={{ margin: "0 0 14px" }}>
                  Start a new deal to calculate a rate and build guidance from your own inputs.
                </p>
                <button type="button" className="btn btn-secondary" onClick={startNewDeal}>
                  Start blank deal
                </button>
              </div>
            </div>

            <div className="home-span-full" style={{ marginTop: 28 }}>
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
            </div>

            <AppLegalDisclaimer className="home-span-full" style={{ marginTop: 28 }} />
          </div>
          <TabBar active={screen} onNavigate={go} />
        </div>
        )}

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
          intelAnnualRevenue={intelAnnualRevenue}
          setIntelAnnualRevenue={setIntelAnnualRevenue}
          intelCompanySize={intelCompanySize}
          setIntelCompanySize={setIntelCompanySize}
          loadingStep={loadingStep}
          result={result}
          rateDetail={rateDetail}
          score={score}
          scoreOffset={scoreOffset}
          displayName={displayName}
          profileRole={profileRole}
          gearLocker={profile.gearLocker}
          profile={profile}
          leverageScore={leverageScore}
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
    </>
  );
}

