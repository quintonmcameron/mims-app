"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

/** All styles in this file — no external CSS. Dynamic layout uses style={{}}. */
const MIMS_CSS = ".mims-shell {\n  --bg: #0b0b0f;\n  --bg-2: #101017;\n  --surface: #15151d;\n  --surface-2: #1b1b25;\n  --elevated: #22222d;\n  --border: #26262f;\n  --border-2: #33333e;\n  --text: #ffffff;\n  --text-2: #b5b5c2;\n  --text-3: #6f6f7e;\n  --gold: #e8c57a;\n  --gold-2: #c9a05e;\n  --coral: #ff7a66;\n  --success: #5ee2a0;\n  --warn: #ffb547;\n  --danger: #ff5c5c;\n  --grad: linear-gradient(135deg, #e8c57a 0%, #ff7a66 100%);\n  --grad-soft: linear-gradient(\n    135deg,\n    rgba(232, 197, 122, 0.18) 0%,\n    rgba(255, 122, 102, 0.18) 100%\n  );\n  --radius: 16px;\n  --radius-sm: 10px;\n  --radius-lg: 22px;\n  --shadow-1:\n    0 1px 0 rgba(255, 255, 255, 0.04) inset, 0 8px 24px rgba(0, 0, 0, 0.35);\n  --shadow-2: 0 20px 60px rgba(0, 0, 0, 0.55);\n  --safe-bottom: env(safe-area-inset-bottom, 0px);\n\n  box-sizing: border-box;\n  -webkit-tap-highlight-color: transparent;\n  margin: 0;\n  padding: 0;\n  min-height: 100vh;\n  background:\n    radial-gradient(\n      1200px 600px at 80% -10%,\n      rgba(255, 122, 102, 0.1),\n      transparent 60%\n    ),\n    radial-gradient(\n      900px 500px at -10% 10%,\n      rgba(232, 197, 122, 0.07),\n      transparent 60%\n    ),\n    var(--bg);\n  color: var(--text);\n  font-family:\n    -apple-system, BlinkMacSystemFont, \"SF Pro Text\", \"Inter\", \"Segoe UI\",\n    system-ui, sans-serif;\n  font-size: 16px;\n  line-height: 1.45;\n  -webkit-font-smoothing: antialiased;\n  overscroll-behavior-y: none;\n  display: flex;\n  justify-content: center;\n}\n\n.mims-shell *,\n.mims-shell *::before,\n.mims-shell *::after {\n  box-sizing: border-box;\n}\n\n@media (min-width: 500px) {\n  .mims-shell {\n    padding: 24px 0;\n    align-items: flex-start;\n  }\n}\n\n.mims-shell .app {\n  width: 100%;\n  max-width: 430px;\n  min-height: 100vh;\n  background: var(--bg);\n  position: relative;\n  overflow: hidden;\n  display: flex;\n  flex-direction: column;\n  border-left: 1px solid rgba(255, 255, 255, 0.04);\n  border-right: 1px solid rgba(255, 255, 255, 0.04);\n}\n\n@media (min-width: 500px) {\n  .mims-shell .app {\n    min-height: calc(100vh - 48px);\n    max-height: 920px;\n    border-radius: 36px;\n    overflow: hidden;\n    box-shadow: var(--shadow-2);\n    border: 1px solid var(--border);\n  }\n}\n\n.mims-shell .topbar {\n  position: sticky;\n  top: 0;\n  z-index: 20;\n  backdrop-filter: blur(20px);\n  -webkit-backdrop-filter: blur(20px);\n  background: rgba(11, 11, 15, 0.75);\n  border-bottom: 1px solid var(--border);\n  padding: 14px 20px;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  min-height: 56px;\n}\n\n.mims-shell .topbar .title {\n  font-size: 16px;\n  font-weight: 600;\n  letter-spacing: -0.01em;\n}\n\n.mims-shell .topbar .left,\n.mims-shell .topbar .right {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  min-width: 36px;\n}\n\n.mims-shell .icon-btn {\n  width: 36px;\n  height: 36px;\n  border-radius: 12px;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  background: var(--surface);\n  border: 1px solid var(--border);\n  color: var(--text-2);\n  cursor: pointer;\n}\n\n.mims-shell .icon-btn:hover {\n  color: var(--text);\n}\n\n.mims-shell .icon-btn svg {\n  width: 18px;\n  height: 18px;\n}\n\n.mims-shell .scroll {\n  flex: 1;\n  overflow-y: auto;\n  overflow-x: hidden;\n  padding: 16px 20px calc(110px + var(--safe-bottom));\n  scroll-behavior: smooth;\n}\n\n.mims-shell .tabbar {\n  position: absolute;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  z-index: 30;\n  backdrop-filter: blur(20px);\n  -webkit-backdrop-filter: blur(20px);\n  background: rgba(11, 11, 15, 0.85);\n  border-top: 1px solid var(--border);\n  padding: 10px 14px calc(14px + var(--safe-bottom));\n  display: grid;\n  grid-template-columns: repeat(4, 1fr);\n  gap: 4px;\n}\n\n.mims-shell .tab {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 4px;\n  padding: 8px 4px;\n  border-radius: 12px;\n  color: var(--text-3);\n  cursor: pointer;\n  font-size: 11px;\n  font-weight: 500;\n  background: transparent;\n  border: none;\n  transition: color 0.15s ease;\n}\n\n.mims-shell .tab svg {\n  width: 22px;\n  height: 22px;\n}\n\n.mims-shell .tab.active {\n  color: var(--text);\n}\n\n.mims-shell .tab.active .tab-ico {\n  background: var(--grad-soft);\n  color: var(--gold);\n}\n\n.mims-shell .tab-ico {\n  width: 32px;\n  height: 32px;\n  border-radius: 10px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  transition: background 0.15s ease;\n}\n\n.mims-shell h1,\n.mims-shell h2,\n.mims-shell h3,\n.mims-shell h4 {\n  margin: 0;\n  letter-spacing: -0.02em;\n}\n\n.mims-shell h1 {\n  font-size: 30px;\n  font-weight: 700;\n  line-height: 1.1;\n}\n\n.mims-shell h2 {\n  font-size: 22px;\n  font-weight: 600;\n  line-height: 1.2;\n}\n\n.mims-shell h3 {\n  font-size: 17px;\n  font-weight: 600;\n}\n\n.mims-shell .eyebrow {\n  font-size: 11px;\n  font-weight: 600;\n  letter-spacing: 0.12em;\n  text-transform: uppercase;\n  color: var(--gold);\n}\n\n.mims-shell .muted {\n  color: var(--text-2);\n}\n\n.mims-shell .dim {\n  color: var(--text-3);\n  font-size: 13px;\n}\n\n.mims-shell .btn {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  gap: 8px;\n  padding: 14px 18px;\n  border-radius: 14px;\n  font-weight: 600;\n  font-size: 15px;\n  border: none;\n  cursor: pointer;\n  width: 100%;\n  transition:\n    transform 0.12s ease,\n    opacity 0.15s ease,\n    background 0.15s ease;\n}\n\n.mims-shell .btn:active {\n  transform: scale(0.98);\n}\n\n.mims-shell .btn-primary {\n  background: var(--grad);\n  color: #1a1306;\n}\n\n.mims-shell .btn-primary:hover {\n  opacity: 0.95;\n}\n\n.mims-shell .btn-secondary {\n  background: var(--surface);\n  color: var(--text);\n  border: 1px solid var(--border);\n}\n\n.mims-shell .btn-ghost {\n  background: transparent;\n  color: var(--text-2);\n  border: 1px solid var(--border);\n}\n\n.mims-shell .btn-row {\n  display: flex;\n  gap: 10px;\n}\n\n.mims-shell .btn-row > .btn {\n  flex: 1;\n}\n\n.mims-shell .card {\n  background: var(--surface);\n  border: 1px solid var(--border);\n  border-radius: var(--radius);\n  padding: 18px;\n  box-shadow: var(--shadow-1);\n}\n\n.mims-shell .card + .card {\n  margin-top: 12px;\n}\n\n.mims-shell .card-row {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 12px;\n}\n\n.mims-shell .field {\n  margin-bottom: 14px;\n}\n\n.mims-shell .field label {\n  display: block;\n  font-size: 13px;\n  font-weight: 500;\n  color: var(--text-2);\n  margin-bottom: 6px;\n}\n\n.mims-shell .field input,\n.mims-shell .field select,\n.mims-shell .field textarea {\n  width: 100%;\n  background: var(--surface);\n  border: 1px solid var(--border);\n  border-radius: 12px;\n  padding: 14px;\n  color: var(--text);\n  font-size: 15px;\n  font-family: inherit;\n  transition: border-color 0.15s ease;\n}\n\n.mims-shell .field input:focus,\n.mims-shell .field select:focus,\n.mims-shell .field textarea:focus {\n  outline: none;\n  border-color: var(--gold);\n}\n\n.mims-shell .field textarea {\n  min-height: 90px;\n  resize: vertical;\n}\n\n.mims-shell .helper {\n  font-size: 12px;\n  color: var(--text-3);\n  margin-top: 6px;\n}\n\n.mims-shell .chips {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 8px;\n}\n\n.mims-shell .chip {\n  padding: 9px 13px;\n  background: var(--surface);\n  border: 1px solid var(--border);\n  border-radius: 999px;\n  font-size: 13px;\n  font-weight: 500;\n  color: var(--text-2);\n  cursor: pointer;\n  transition: all 0.15s ease;\n  user-select: none;\n}\n\n.mims-shell .chip.active {\n  border-color: var(--gold);\n  background: var(--grad-soft);\n  color: var(--gold);\n}\n\n.mims-shell .seg {\n  display: flex;\n  background: var(--surface);\n  border: 1px solid var(--border);\n  border-radius: 12px;\n  padding: 4px;\n  gap: 4px;\n}\n\n.mims-shell .seg button {\n  flex: 1;\n  padding: 10px;\n  border: none;\n  background: transparent;\n  color: var(--text-2);\n  font-weight: 500;\n  font-size: 13px;\n  border-radius: 9px;\n  cursor: pointer;\n}\n\n.mims-shell .seg button.active {\n  background: var(--elevated);\n  color: var(--text);\n  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.04);\n}\n\n.mims-shell .logo {\n  display: inline-flex;\n  align-items: center;\n  gap: 10px;\n  font-weight: 700;\n  letter-spacing: -0.02em;\n}\n\n.mims-shell .logo-mark {\n  width: 28px;\n  height: 28px;\n  border-radius: 8px;\n  background: var(--grad);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  color: #1a1306;\n  font-weight: 800;\n  font-size: 14px;\n}\n\n.mims-shell .screen {\n  display: none;\n  flex-direction: column;\n  min-height: 100%;\n}\n\n.mims-shell .screen.active {\n  display: flex;\n}\n\n.mims-shell .screen-pad {\n  padding: 16px 20px calc(110px + var(--safe-bottom));\n  flex: 1;\n  overflow-y: auto;\n}\n\n.mims-shell .screen-pad.no-pad-bottom {\n  padding-bottom: 24px;\n}\n\n.mims-shell .welcome-hero {\n  padding: 80px 24px 40px;\n  text-align: center;\n  background:\n    radial-gradient(\n      400px 200px at 50% 0%,\n      rgba(255, 122, 102, 0.18),\n      transparent 70%\n    ),\n    radial-gradient(\n      500px 300px at 50% 30%,\n      rgba(232, 197, 122, 0.1),\n      transparent 70%\n    );\n}\n\n.mims-shell .welcome-mark {\n  width: 76px;\n  height: 76px;\n  border-radius: 22px;\n  background: var(--grad);\n  margin: 0 auto 24px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  color: #1a1306;\n  font-weight: 800;\n  font-size: 36px;\n  letter-spacing: -0.04em;\n  box-shadow:\n    0 30px 60px rgba(255, 122, 102, 0.25),\n    0 10px 30px rgba(232, 197, 122, 0.2);\n}\n\n.mims-shell .welcome-hero h1 {\n  font-size: 34px;\n  background: linear-gradient(180deg, #ffffff 0%, #c9c9d4 100%);\n  -webkit-background-clip: text;\n  background-clip: text;\n  color: transparent;\n}\n\n.mims-shell .welcome-features {\n  padding: 0 20px;\n  display: grid;\n  gap: 12px;\n  margin-bottom: 24px;\n}\n\n.mims-shell .feature {\n  display: flex;\n  gap: 14px;\n  align-items: flex-start;\n  padding: 14px 16px;\n  background: var(--surface);\n  border: 1px solid var(--border);\n  border-radius: var(--radius);\n}\n\n.mims-shell .feature .ico {\n  width: 36px;\n  height: 36px;\n  border-radius: 10px;\n  background: var(--grad-soft);\n  color: var(--gold);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex-shrink: 0;\n}\n\n.mims-shell .feature .ico svg {\n  width: 18px;\n  height: 18px;\n}\n\n.mims-shell .feature h4 {\n  font-size: 14px;\n  margin-bottom: 2px;\n}\n\n.mims-shell .feature p {\n  font-size: 13px;\n  color: var(--text-2);\n  margin: 0;\n}\n\n.mims-shell .score-circle {\n  position: relative;\n  width: 180px;\n  height: 180px;\n  margin: 0 auto 8px;\n}\n\n.mims-shell .score-circle svg {\n  width: 100%;\n  height: 100%;\n  transform: rotate(-90deg);\n}\n\n.mims-shell .score-circle .score-label {\n  position: absolute;\n  inset: 0;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  text-align: center;\n}\n\n.mims-shell .score-circle .score-num {\n  font-size: 56px;\n  font-weight: 700;\n  letter-spacing: -0.04em;\n  line-height: 1;\n}\n\n.mims-shell .score-circle .score-cap {\n  font-size: 11px;\n  letter-spacing: 0.14em;\n  color: var(--text-3);\n  text-transform: uppercase;\n  margin-top: 6px;\n}\n\n.mims-shell .big-num {\n  font-size: 44px;\n  font-weight: 700;\n  letter-spacing: -0.03em;\n  background: var(--grad);\n  -webkit-background-clip: text;\n  background-clip: text;\n  color: transparent;\n  line-height: 1;\n}\n\n.mims-shell .badge {\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n  padding: 5px 10px;\n  border-radius: 999px;\n  font-size: 12px;\n  font-weight: 600;\n  background: var(--surface);\n  border: 1px solid var(--border);\n  color: var(--text-2);\n}\n\n.mims-shell .badge.gold {\n  color: var(--gold);\n  border-color: rgba(232, 197, 122, 0.3);\n  background: rgba(232, 197, 122, 0.06);\n}\n\n.mims-shell .badge.green {\n  color: var(--success);\n  border-color: rgba(94, 226, 160, 0.3);\n  background: rgba(94, 226, 160, 0.06);\n}\n\n.mims-shell .badge.warn {\n  color: var(--warn);\n  border-color: rgba(255, 181, 71, 0.3);\n  background: rgba(255, 181, 71, 0.06);\n}\n\n.mims-shell .badge.red {\n  color: var(--danger);\n  border-color: rgba(255, 92, 92, 0.3);\n  background: rgba(255, 92, 92, 0.06);\n}\n\n.mims-shell .progress {\n  height: 6px;\n  background: var(--surface);\n  border-radius: 999px;\n  overflow: hidden;\n  border: 1px solid var(--border);\n}\n\n.mims-shell .progress > div {\n  height: 100%;\n  background: var(--grad);\n  border-radius: 999px;\n  transition: width 0.4s ease;\n}\n\n.mims-shell .tactic {\n  padding: 16px;\n  background: var(--surface);\n  border: 1px solid var(--border);\n  border-radius: var(--radius);\n}\n\n.mims-shell .tactic + .tactic {\n  margin-top: 10px;\n}\n\n.mims-shell .tactic .source {\n  font-size: 11px;\n  letter-spacing: 0.08em;\n  color: var(--gold);\n  text-transform: uppercase;\n  font-weight: 600;\n  margin-bottom: 8px;\n}\n\n.mims-shell .tactic h4 {\n  font-size: 15px;\n  margin-bottom: 6px;\n}\n\n.mims-shell .tactic .quote {\n  margin-top: 10px;\n  padding: 12px 14px;\n  border-left: 2px solid var(--gold);\n  color: var(--text-2);\n  font-style: italic;\n  font-size: 14px;\n  background: rgba(232, 197, 122, 0.04);\n  border-radius: 8px;\n}\n\n.mims-shell .steps {\n  padding: 0;\n  margin: 0;\n  list-style: none;\n  counter-reset: s;\n}\n\n.mims-shell .steps li {\n  counter-increment: s;\n  padding: 8px 0 8px 30px;\n  position: relative;\n  color: var(--text-2);\n  font-size: 14px;\n}\n\n.mims-shell .steps li::before {\n  content: counter(s);\n  position: absolute;\n  left: 0;\n  top: 8px;\n  width: 20px;\n  height: 20px;\n  background: var(--grad-soft);\n  color: var(--gold);\n  border-radius: 6px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-weight: 700;\n  font-size: 11px;\n}\n\n.mims-shell .deal-item {\n  padding: 14px 16px;\n  background: var(--surface);\n  border: 1px solid var(--border);\n  border-radius: var(--radius);\n  display: flex;\n  gap: 12px;\n  align-items: center;\n  cursor: pointer;\n  margin-bottom: 10px;\n  width: 100%;\n  text-align: left;\n  color: inherit;\n  font: inherit;\n}\n\n.mims-shell .deal-item:hover {\n  border-color: var(--border-2);\n}\n\n.mims-shell .deal-item .avatar {\n  width: 42px;\n  height: 42px;\n  border-radius: 12px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-weight: 700;\n  font-size: 16px;\n  flex-shrink: 0;\n}\n\n.mims-shell .deal-item h4 {\n  font-size: 15px;\n}\n\n.mims-shell .deal-item .meta {\n  font-size: 12px;\n  color: var(--text-3);\n}\n\n.mims-shell .doc-preview {\n  background: #fafaf7;\n  color: #1a1a1f;\n  border-radius: 16px;\n  padding: 22px;\n  font-family:\n    \"SF Pro Text\",\n    -apple-system,\n    system-ui,\n    sans-serif;\n  font-size: 13px;\n  line-height: 1.5;\n}\n\n.mims-shell .doc-preview h2 {\n  color: #1a1a1f;\n  font-size: 22px;\n  margin-bottom: 4px;\n}\n\n.mims-shell .doc-preview .doc-head {\n  display: flex;\n  justify-content: space-between;\n  align-items: flex-start;\n  margin-bottom: 18px;\n  padding-bottom: 14px;\n  border-bottom: 1px solid #e6e2d8;\n}\n\n.mims-shell .doc-preview table {\n  width: 100%;\n  border-collapse: collapse;\n  margin: 12px 0;\n}\n\n.mims-shell .doc-preview th,\n.mims-shell .doc-preview td {\n  text-align: left;\n  padding: 8px 4px;\n  font-size: 12px;\n  border-bottom: 1px solid #eee;\n}\n\n.mims-shell .doc-preview th {\n  color: #6f6f6f;\n  font-weight: 600;\n}\n\n.mims-shell .doc-preview .total {\n  border-top: 2px solid #1a1a1f;\n  padding-top: 12px;\n  margin-top: 12px;\n  display: flex;\n  justify-content: space-between;\n  font-weight: 700;\n  font-size: 16px;\n}\n\n.mims-shell .doc-preview .label-sm {\n  font-size: 10px;\n  color: #888;\n  text-transform: uppercase;\n  letter-spacing: 0.1em;\n  font-weight: 600;\n}\n\n.mims-shell .loading {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  text-align: center;\n  padding: 40px 24px;\n  min-height: 480px;\n}\n\n.mims-shell .spinner {\n  width: 56px;\n  height: 56px;\n  border-radius: 50%;\n  background: conic-gradient(\n    from 0deg,\n    transparent,\n    var(--gold),\n    var(--coral),\n    transparent\n  );\n  mask: radial-gradient(circle 22px at center, transparent 99%, black 100%);\n  -webkit-mask: radial-gradient(circle 22px at center, transparent 99%, black 100%);\n  animation: mims-spin 1.2s linear infinite;\n  margin-bottom: 22px;\n}\n\n@keyframes mims-spin {\n  to {\n    transform: rotate(360deg);\n  }\n}\n\n.mims-shell .loading-steps {\n  list-style: none;\n  padding: 0;\n  margin: 0;\n  text-align: left;\n  width: 100%;\n  max-width: 280px;\n}\n\n.mims-shell .loading-steps li {\n  padding: 10px 14px;\n  font-size: 13px;\n  color: var(--text-3);\n  display: flex;\n  align-items: center;\n  gap: 10px;\n}\n\n.mims-shell .loading-steps li.done {\n  color: var(--text);\n}\n\n.mims-shell .loading-steps li.active {\n  color: var(--text);\n}\n\n.mims-shell .loading-steps .dot {\n  width: 14px;\n  height: 14px;\n  border-radius: 50%;\n  background: var(--surface);\n  border: 1px solid var(--border);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex-shrink: 0;\n}\n\n.mims-shell .loading-steps li.done .dot {\n  background: var(--success);\n  border-color: var(--success);\n}\n\n.mims-shell .loading-steps li.active .dot {\n  background: var(--gold);\n  border-color: var(--gold);\n  animation: mims-pulse 1.2s infinite;\n}\n\n@keyframes mims-pulse {\n  0%,\n  100% {\n    box-shadow: 0 0 0 0 rgba(232, 197, 122, 0.4);\n  }\n  50% {\n    box-shadow: 0 0 0 6px rgba(232, 197, 122, 0);\n  }\n}\n\n.mims-shell .toast {\n  position: absolute;\n  left: 20px;\n  right: 20px;\n  top: 70px;\n  background: var(--elevated);\n  border: 1px solid var(--border-2);\n  border-radius: 14px;\n  padding: 12px 14px;\n  z-index: 100;\n  font-size: 14px;\n  display: none;\n  align-items: center;\n  gap: 10px;\n  box-shadow: var(--shadow-2);\n}\n\n.mims-shell .toast.show {\n  display: flex;\n  animation: mims-slide-down 0.25s ease;\n}\n\n@keyframes mims-slide-down {\n  from {\n    transform: translateY(-20px);\n    opacity: 0;\n  }\n}\n\n.mims-shell .divider {\n  height: 1px;\n  background: var(--border);\n  margin: 16px 0;\n}\n\n.mims-shell .row {\n  display: flex;\n  gap: 10px;\n}\n\n.mims-shell .row > * {\n  flex: 1;\n}\n\n.mims-shell .stack-tight > * + * {\n  margin-top: 6px;\n}\n\n.mims-shell .stack > * + * {\n  margin-top: 12px;\n}\n\n.mims-shell .stack-lg > * + * {\n  margin-top: 18px;\n}\n\n.mims-shell .center {\n  text-align: center;\n}\n\n.mims-shell .small {\n  font-size: 13px;\n}\n";


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

interface Profile {
  name: string;
  email: string;
  trade: string;
  experience: string;
  skill: string;
  location: string;
  extras: string[];
}

interface Deal {
  client: string;
  url: string;
  source: string;
  project: string;
  shootDays: number;
  editDays: number;
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
}

interface CrewSplit {
  productionDayRate: number;
  shootDays: number;
  productionSubtotal: number;
  prePro: number;
  postDayRate: number;
  editDays: number;
  postSubtotal: number;
  hasColor: boolean;
  hasSound: boolean;
  colorAlloc: number;
  soundAlloc: number;
  usageLicense: number;
  isMultiRole: boolean;
  isUnion: boolean;
  matchUnionRates: boolean;
  unionPH: number;
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
  isUnion?: boolean;
  matchUnionRates?: boolean;
}

const defaultProfile: Profile = {
  name: "",
  email: "",
  trade: "",
  experience: "",
  skill: "",
  location: "",
  extras: [],
};

const defaultDeal: Deal = {
  client: "",
  url: "",
  source: "referral",
  project: "brand-video",
  shootDays: 2,
  editDays: 3,
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

function computeRecommendation(
  profile: Profile,
  deal: Deal,
  isUnion = false,
  matchUnionRates = false,
): Recommendation {
  // Union commercial scale tiers mapped to experience brackets (T1=most senior)
  const UNION_TIERS: Record<string, number> = {
    "0-1": 350, "1-3": 550, "3-5": 750, "5-10": 1000, "10+": 1500,
  };
  // Independent market tiers: 30% below premium union scale
  const INDEPENDENT_TIERS: Record<string, number> = {
    "0-1": 245, "1-3": 385, "3-5": 525, "5-10": 700, "10+": 1050,
  };

  const exp = profile.experience || "5-10";
  const base = (isUnion || matchUnionRates)
    ? (UNION_TIERS[exp] || 1000)
    : (INDEPENDENT_TIERS[exp] || 700);

  const skillMult =
    { emerging: 0.9, mid: 1.0, senior: 1.15, expert: 1.35 }[
      profile.skill || "senior"
    ] || 1.0;
  const extrasMult = 1 + Math.min(profile.extras.length, 4) * 0.04;

  // Premium loading fee baked into the day rate: rush=25%, fire=50%, paid=25%, broadcast=50%, caps at 50%
  const rushPremium = ({ loose: 0, normal: 0, rush: 0.25, fire: 0.5 } as Record<string, number>)[deal.rush] || 0;
  const usagePremium = ({ organic: 0, paid: 0.25, broadcast: 0.5 } as Record<string, number>)[deal.usage] || 0;
  const premiumLoading = Math.min(rushPremium + usagePremium, 0.5);

  const adjDay = base * skillMult * extrasMult * (1 + premiumLoading);

  // Multi-role: videographer pricing both shoot and edit at the full day rate (two seats)
  const isMultiRole = profile.trade.toLowerCase().includes("videographer") && deal.shootDays > 0 && deal.editDays > 0;
  const postDayRate = isMultiRole ? adjDay : adjDay * 0.75;

  const shoot = deal.shootDays * adjDay;
  const edit = deal.editDays * postDayRate;
  const prePro = adjDay * 0.6;
  const usageLicense =
    deal.usage === "organic"
      ? adjDay * 0.5
      : deal.usage === "paid"
        ? adjDay * 1.5
        : adjDay * 2.5;

  const unionPH = isUnion ? (shoot + edit + prePro) * 0.215 : 0;

  const ltvNum = parseMoney(deal.ltv);
  const roiNum = parseInt((deal.roi || "").replace(/[^0-9]/g, ""), 10);
  const projectedRev = ltvNum && roiNum ? ltvNum * roiNum : 0;

  let valueMult = 1.0;
  if (projectedRev > 1_000_000) valueMult = 2.2;
  else if (projectedRev > 250_000) valueMult = 1.6;
  else if (projectedRev > 50_000) valueMult = 1.25;
  const valuePremium = valueMult > 1.0;

  let target = shoot + edit + prePro + usageLicense + unionPH;
  target = Math.round((target * valueMult) / 50) * 50;
  const floor = Math.round((target * 0.8) / 50) * 50;
  const stretch = Math.round((target * 1.35) / 50) * 50;
  const floorRate = Math.round((target * 0.65) / 50) * 50;
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
  if (deal.why === "vanity") score -= 1;
  if (deal.why === "fundraise" || deal.why === "launch" || deal.why === "growth")
    score += 1;

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
    verdict = `Take the meeting. Anchor at $${fmt(stretch)} (stretch minus contingency), let them negotiate down to your $${fmt(target)} fair rate.`;
  } else if (score >= 6) {
    mood = "ok";
    headline = "Workable — but you'll have to sell value.";
    rationale =
      "They can probably reach your rate, but they're likely to push back. Lead with discovery, not pricing.";
    verdict = `Take the meeting, but don't name a number on the first call. Diagnose, then send the SOW at $${fmt(target)}.`;
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
    productionDayRate: Math.round(adjDay * valueMult),
    shootDays: deal.shootDays,
    productionSubtotal: Math.round(shoot * valueMult),
    prePro: Math.round(prePro * valueMult),
    postDayRate: Math.round(postDayRate * valueMult),
    editDays: deal.editDays,
    postSubtotal: Math.round(edit * valueMult),
    hasColor: profile.extras.includes("color"),
    hasSound: profile.extras.includes("sound"),
    colorAlloc: profile.extras.includes("color") ? Math.round(edit * valueMult * 0.15) : 0,
    soundAlloc: profile.extras.includes("sound") ? Math.round(edit * valueMult * 0.12) : 0,
    usageLicense: Math.round(usageLicense * valueMult),
    isMultiRole,
    isUnion,
    matchUnionRates,
    unionPH: Math.round(unionPH * valueMult),
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
    isUnion,
    matchUnionRates,
  };
}

const sampleDeals: Record<string, Recommendation & { client: string }> =
  {
    summit: {
      client: "Summit Coffee Co.",
      score: 8,
      target: 8400,
      floor: 6800,
      stretch: 11200,
      capacity: 9000,
      mood: "good",
      headline: "Strong fit. Push for the full rate.",
      rationale:
        "Their stated range overlaps your fair rate, decision-maker is on the call, and the work has a clear ROI driver.",
      verdict:
        "Take the meeting. Anchor at $9,800 (stretch minus contingency), let them negotiate down to your $8,400 fair rate.",
      scope: "2 shoot days + 3 edit days · organic usage",
    },
    rivian: {
      client: "Rivian Agency",
      score: 6,
      target: 3200,
      floor: 2600,
      stretch: 4400,
      capacity: 3300,
      mood: "ok",
      headline: "Workable — but you'll have to sell value.",
      rationale:
        "Recurring retainer fits their model, but agency margins squeeze creative budgets. Sell continuity, not discount.",
      verdict:
        "Lock in 3 months at $3,200/mo. Refuse to start under $3,000. If they push for $2,500, walk.",
      scope: "Monthly retainer · 8 social cutdowns/mo",
    },
    atlas: {
      client: "Atlas Climbing Gym",
      score: 7,
      target: 4200,
      floor: 3400,
      stretch: 5800,
      capacity: 4500,
      mood: "ok",
      headline: "Solid. They get it.",
      rationale:
        "Local business, owner is the decision maker, video drives membership signups. Honest budget conversation likely.",
      verdict:
        'Send the SOW at $4,200 with a "good/better/best" — let them pick the better option.',
      scope: "1 shoot day + 2 edit days · 6 cutdowns · organic",
    },
    cousin: {
      client: "Cousin's startup",
      score: 2,
      target: 4800,
      floor: 3800,
      stretch: 6500,
      capacity: 1500,
      mood: "walk",
      headline: "Walk away.",
      rationale:
        'Stated budget ($1,500) is 70% below fair-market floor. No revenue model yet. "Exposure" mentioned twice.',
      verdict:
        "Politely decline. Refer to a junior. Lowering your rate here resets your floor and damages every future negotiation.",
      scope: "1 shoot day + cutdowns · paid usage",
    },
    mode: {
      client: "Mode Studio",
      score: 9,
      target: 12500,
      floor: 10200,
      stretch: 16000,
      capacity: 14000,
      mood: "good",
      headline: "Closed. Send the invoice.",
      rationale: "Agreed on $12,500. SOW signed. Final cut delivered.",
      verdict:
        "Invoice the remaining 50%. Ask for referrals while the work is fresh.",
      scope: "3 shoot days + 5 edit days · paid usage",
    },
  };

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
  { id: "0-1", label: "Less than 1 year" },
  { id: "1-3", label: "1–3 years" },
  { id: "3-5", label: "3–5 years" },
  { id: "5-10", label: "5–10 years" },
  { id: "10+", label: "10+ years" },
];

const SKILL_OPTIONS = [
  { id: "emerging", label: "Emerging" },
  { id: "mid", label: "Mid-level" },
  { id: "senior", label: "Senior" },
  { id: "expert", label: "Expert / specialist" },
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

const SOURCE_OPTIONS = [
  { id: "referral", label: "Referral" },
  { id: "inbound", label: "Cold inbound" },
  { id: "repeat", label: "Repeat" },
  { id: "pitched", label: "I pitched" },
];

const RUSH_OPTIONS = [
  { id: "loose", label: "Loose" },
  { id: "normal", label: "Normal" },
  { id: "rush", label: "Rush" },
];

const USAGE_OPTIONS = [
  { id: "organic", label: "Organic / social" },
  { id: "paid", label: "Paid media" },
  { id: "broadcast", label: "Broadcast / OOH" },
];

const DM_OPTIONS = [
  { id: "yes", label: "Yes" },
  { id: "no", label: "No" },
  { id: "unclear", label: "Unclear" },
];

const BUDGET_OPTIONS = [
  { id: "open", label: "Open" },
  { id: "range", label: "Gave a range" },
  { id: "anchor-low", label: "Anchored low" },
  { id: "hidden", label: "Hiding it" },
];

const COMPANY_SIZE_OPTIONS = [
  { id: "solo", label: "Solopreneur / Startup" },
  { id: "boutique", label: "Boutique (2-20 employees)" },
  { id: "midmarket", label: "Mid-Market (21-200 employees)" },
  { id: "enterprise", label: "Enterprise (200+ employees)" },
];

const NOVA_ROLES = ["1st AC","1st AD","2nd 2nd AC","2nd AC","2nd AD","2nd Unit 1st AC","2nd Unit 1st AD","2nd Unit 2nd AC","2nd Unit 2nd AD","2nd Unit DP","2nd Unit Director","2nd Unit Electric","2nd Unit Gaffer","2nd Unit Grip","3D Artist","3rd AD","4th AD","ADA","AI Artist","Additional Photography","Aerial Cinematographer","Animal Trainer","Animal Wrangler","Animation Supervisor","Animator","Armorer","Art Coordinator","Art Department","Art Director","Art Production Assistant","Art Rigger","Assistant Animator","Assistant Editor","Assistant Electrician","Assistant Lighting Tech","Associate Creative Director","Associate Producer","Associate Production Manager","Audio Engineer","Audio Visual Technician","B Cam 1st AC","B Cam 2nd AC","B Camera Operator","BTS Photographer","BTS Videographer","Best Boy Electric","Best Boy Grip","Boom Operator","Braider","CG Artist","Camera Operator","Casting Assistant","Casting Associate","Casting Director","Chief Lighting Technician","Choreographer","Co-Director","Color Assistant","Color Producer","Colorist","Composer","Compositor","Concept Artist","Content Creator","Copywriter","Costume Assistant","Costume Designer","Crane Operator","Creative Assistant","Creative Director","Creative Producer","Creative Strategist","Cyclo Operator","DIT","DMX Technician","Dancer","Data Manager","Design Assistant","Designer","Digital Designer","Digitech","Dimmer Board Operator","Director","Director of Photography","Director's Assistant","Dolly Grip","Drone Operator","Editor","Electric","Event Producer","Executive Assistant","Executive Producer","Experiential Producer","FPV Drone Pilot","Fabricator","Fashion Assistant","Fashion Designer","Fashion Illustrator","Fashion Intern","Film Loader","Finishing Artist","Fixer","Fixtures Technician","Florist","Focus Puller","Foley Artist","Food Stylist","Gaffer","Garment Production Manager","Gimbal Operator","Graphic Designer","Greensman","Grip","Grip Assistant","Groomer","Hair & Makeup Artist","Hair & Makeup Assistant","Hair Assistant","Hair Stylist","Head Fixtures Technician","Illustrator","Interior Designer","Intern","Intimacy Coordinator","Jib Crane Tech","Jib Operator","Jib Tech","Key Grip","Key Scenic Painter","Layout Artist","Lead Animator","Lead Compositor","Lead Crane Tech","Lead Rigger","Leadman","Lighting Assistant","Lighting Console Programmer","Lighting Designer","Lighting Director","Lighting Tech","Line Producer","Live Editor","Live Show Designer","Location Manager","Location Scout","Lot Best Boy","Makeup Artist","Makeup Assistant","Manicurist","Marketing Coordinator","Marketing Director","Marketing Manager","Motion Designer","Movement Coach","Movement Director","Music Supervisor","Music Supervisor Assistant","Nail Artist","Nail Assistant","Office PA","Omega AR Operator","PA","Packaging Designer","Pattern Maker","Photo Assistant","Photographer","Picture Car Coordinator","Post Producer","Post Production Assistant","Post Production Coordinator","Post Sound Mixer","Post Supervisor","Prep Supervisor","Producer","Product Designer","Production Assistant","Production Coordinator","Production Designer","Production Manager","Production Supervisor","Project Manager","Projection Mapping Specialist","Prop Maker","Prop Master","Prop Stylist","Pyrotechnician","Remote Head Tech","Render Artist","Retoucher","Rig AC","Rigging BBE","Rigging BBG","Rigging Electrician","Rigging Gaffer","Rigging Grip","Rigging Key Grip","SFX Coordinator","SFX Makeup Artist","SFX Supervisor","SFX Technician","Scenic Painter","Script Supervisor","Seamstress","Set Builder","Set Carpenter","Set Decorator","Set Designer","Set Dresser","Set Lighting Technician","Social Media Manager","Social Media Strategist","Sound Designer","Sound Mixer","Spatial Designer","Stage Designer","Steadicam Operator","Storyboard Artist","Streaming Engineer","Stunt Coordinator","Stunt Rigger","Stunt Safety Rigger","Stylist","Stylist Assistant","Supervising Producer","Swing","Switch Board Operator","Tailor","Technical Director","Technocrane Operator","Technocrane Tech","Title Designer","Treatment Designer","Trinity Operator","Truck PA","UI/UX Designer","Underwater Camera Operator","Underwater Grip","Underwater Lighting Tech","Unit Production Manager","Utility Sound Tech","VFX Artist","VFX Supervisor","VTR","Video Growth Engineer","Videographer","Visual Researcher","Web Designer","Web Developer","Writer"];

const DEMO_PROFILE = {
  name: "Quinton Cameron",
  email: "quinton@qcfilms.co",
  trade: "videographer",
  experience: "5-10",
  skill: "senior",
  location: "Atlanta, GA",
  extras: ["color", "sound", "motion"],
};

const LOADING_STEPS = [
  "Pulling 2026 rate benchmarks…",
  "Researching the client…",
  "Estimating budget capacity…",
  "Scoring close-likelihood…",
  "Drafting tactics from Voss + Enns…",
];



const POPULAR_ROLES = ["Director of Photography","Videographer","Editor","Director","1st AC","Gaffer","Producer","Sound Mixer","Colorist","Motion Designer"];

function RoleSearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (role: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query.trim()
    ? NOVA_ROLES.filter((r) => r.toLowerCase().includes(query.toLowerCase())).slice(0, 12)
    : POPULAR_ROLES;

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

  return (
    <div ref={wrapperRef}>
      {value && (
        <div style={{
          display: "flex", alignItems: "center", gap: 10, marginBottom: 10,
          padding: "12px 14px",
          background: "rgba(232,197,122,0.06)",
          border: "1px solid rgba(232,197,122,0.3)",
          borderRadius: 12,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 2 }}>
              Your position
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>{value}</div>
          </div>
          <button
            type="button"
            aria-label="Clear selection"
            onClick={() => { onChange(""); setQuery(""); inputRef.current?.focus(); }}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", padding: 4 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
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
          placeholder={value ? "Search to change position…" : "Search 200+ positions… e.g. Director of Photography"}
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

function IconBack({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="icon-btn" onClick={onClick} aria-label="Back">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M15 6l-6 6 6 6" />
      </svg>
    </button>
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
      label: "Playbook",
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

function InvoicePreview() {
  return (
    <div className="doc-preview">
      <div className="doc-head">
        <div>
          <h2>INVOICE</h2>
          <div className="label-sm" style={{ marginTop: 4 }}>
            #MIMS-2026-0142
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 700 }}>QC Films</div>
          <div style={{ color: "#6F6F6F", fontSize: 12 }}>quinton@qcfilms.co</div>
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
          <div style={{ fontWeight: 600, marginTop: 2 }}>Summit Coffee Co.</div>
          <div style={{ color: "#6F6F6F" }}>Accounts Payable</div>
          <div style={{ color: "#6F6F6F" }}>ap@summitcoffee.com</div>
        </div>
        <div>
          <div className="label-sm">Issued</div>
          <div style={{ marginTop: 2 }}>May 14, 2026</div>
          <div className="label-sm" style={{ marginTop: 8 }}>
            Due
          </div>
          <div>Net 14 · May 28, 2026</div>
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
          <tr>
            <td>Pre-production & creative direction</td>
            <td style={{ textAlign: "right" }}>1</td>
            <td style={{ textAlign: "right" }}>$800</td>
            <td style={{ textAlign: "right" }}>$800</td>
          </tr>
          <tr>
            <td>Shoot day — full crew</td>
            <td style={{ textAlign: "right" }}>2</td>
            <td style={{ textAlign: "right" }}>$1,800</td>
            <td style={{ textAlign: "right" }}>$3,600</td>
          </tr>
          <tr>
            <td>Edit day — picture lock</td>
            <td style={{ textAlign: "right" }}>3</td>
            <td style={{ textAlign: "right" }}>$900</td>
            <td style={{ textAlign: "right" }}>$2,700</td>
          </tr>
          <tr>
            <td>Color + sound</td>
            <td style={{ textAlign: "right" }}>1</td>
            <td style={{ textAlign: "right" }}>$650</td>
            <td style={{ textAlign: "right" }}>$650</td>
          </tr>
          <tr>
            <td>Organic usage license · 12 mo</td>
            <td style={{ textAlign: "right" }}>1</td>
            <td style={{ textAlign: "right" }}>$650</td>
            <td style={{ textAlign: "right" }}>$650</td>
          </tr>
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
        <span>$8,400</span>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 13,
          marginTop: 6,
        }}
      >
        <span style={{ color: "#6F6F6F" }}>50% deposit (due now)</span>
        <span>$4,200</span>
      </div>

      <div className="total">
        <span>Total due</span>
        <span>$8,400</span>
      </div>

      <div
        style={{
          marginTop: 16,
          fontSize: 11,
          color: "#888",
          lineHeight: 1.5,
        }}
      >
        Payment via ACH or wire. Late fees of 1.5%/mo accrue after 30 days.
        Project license activates on final payment.
      </div>
    </div>
  );
}

function SowPreview() {
  return (
    <div className="doc-preview">
      <div className="doc-head">
        <div>
          <h2>SCOPE OF WORK</h2>
          <div className="label-sm" style={{ marginTop: 4 }}>
            QC Films × Summit Coffee Co.
          </div>
        </div>
        <div style={{ textAlign: "right", fontSize: 11, color: "#6F6F6F" }}>
          v1.0 · May 14, 2026
        </div>
      </div>

      <h3 style={{ fontSize: 14, marginBottom: 4 }}>Project</h3>
      <p style={{ fontSize: 12, color: "#444", margin: "0 0 14px" }}>
        &quot;Single Origin&quot; — a 90-second brand video plus six 15-second
        cutdowns to drive 200 new monthly subscribers.
      </p>

      <h3 style={{ fontSize: 14, marginBottom: 6 }}>Deliverables</h3>
      <table>
        <tbody>
          <tr>
            <td>1× hero film</td>
            <td style={{ textAlign: "right" }}>90 sec</td>
          </tr>
          <tr>
            <td>6× social cutdowns</td>
            <td style={{ textAlign: "right" }}>15 sec each</td>
          </tr>
          <tr>
            <td>Raw select reel</td>
            <td style={{ textAlign: "right" }}>included</td>
          </tr>
          <tr>
            <td>Master files + ProRes</td>
            <td style={{ textAlign: "right" }}>delivered via Frame</td>
          </tr>
        </tbody>
      </table>

      <h3 style={{ fontSize: 14, margin: "14px 0 6px" }}>Timeline</h3>
      <table>
        <tbody>
          <tr>
            <td>Pre-pro / shotlist</td>
            <td style={{ textAlign: "right" }}>May 20</td>
          </tr>
          <tr>
            <td>Production (2 days)</td>
            <td style={{ textAlign: "right" }}>May 27–28</td>
          </tr>
          <tr>
            <td>Rough cut</td>
            <td style={{ textAlign: "right" }}>Jun 4</td>
          </tr>
          <tr>
            <td>Picture lock</td>
            <td style={{ textAlign: "right" }}>Jun 11</td>
          </tr>
          <tr>
            <td>Final delivery</td>
            <td style={{ textAlign: "right" }}>Jun 18</td>
          </tr>
        </tbody>
      </table>

      <h3 style={{ fontSize: 14, margin: "14px 0 6px" }}>Revisions</h3>
      <p style={{ fontSize: 12, color: "#444", margin: "0 0 10px" }}>
        Two rounds included on the hero, one round each on the cutdowns.
        Additional rounds: $250 each. Major creative pivots after picture lock
        are re-quoted.
      </p>

      <h3 style={{ fontSize: 14, margin: "14px 0 6px" }}>Usage rights</h3>
      <p style={{ fontSize: 12, color: "#444", margin: "0 0 10px" }}>
        Organic social and owned channels, 12 months. Paid media or broadcast
        usage: +$2,400 license extension.
      </p>

      <h3 style={{ fontSize: 14, margin: "14px 0 6px" }}>Investment</h3>
      <div className="total" style={{ borderColor: "#1A1A1F" }}>
        <span>Total</span>
        <span>$8,400</span>
      </div>
      <div style={{ fontSize: 11, color: "#888", marginTop: 6 }}>
        50% on signing · 50% on final delivery
      </div>

      <h3 style={{ fontSize: 14, margin: "14px 0 6px" }}>Cancellation</h3>
      <p style={{ fontSize: 12, color: "#444", margin: 0 }}>
        Kill fee of 50% if cancelled after pre-production begins. Deposit is
        non-refundable. Force majeure clause applies.
      </p>
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
  loadSampleDeal: (key: string) => void;
  displayName: string;
  profileRole: string;
};

function CrewSplitCard({ cs }: { cs: CrewSplit }) {
  const shootSubtotal = cs.productionSubtotal + cs.prePro;
  const grandTotal = shootSubtotal + cs.postSubtotal + cs.usageLicense;
  const shootPct = grandTotal > 0 ? Math.round((shootSubtotal / grandTotal) * 100) : 0;
  const postPct = grandTotal > 0 ? Math.round((cs.postSubtotal / grandTotal) * 100) : 0;

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
          {cs.isUnion ? (
            <span className="badge gold" style={{ fontSize: 11, letterSpacing: "0.05em" }}>Union Scale</span>
          ) : cs.matchUnionRates ? (
            <span className="badge green" style={{ fontSize: 11, letterSpacing: "0.05em" }}>Cash Equiv.</span>
          ) : null}
          {cs.isMultiRole && <span className="badge gold">Dual-role</span>}
        </div>
      </div>

      {/* Shooting Phase */}
      {cs.shootDays > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
            <span style={sectionLabelStyle}>Shooting Phase</span>
            <span style={{ fontSize: 14, fontWeight: 700 }}>${fmt(shootSubtotal)}</span>
          </div>
          <div style={rowStyle}>
            <div>
              <div style={lineNameStyle}>Camera / Cinematography</div>
              <div style={lineSubStyle}>{cs.shootDays} day{cs.shootDays !== 1 ? "s" : ""} × ${fmt(cs.productionDayRate)}/day</div>
            </div>
            <span style={amountStyle}>${fmt(cs.productionSubtotal)}</span>
          </div>
          <div style={{ ...rowStyle, marginBottom: 10 }}>
            <span style={lineNameStyle}>Pre-production &amp; prep</span>
            <span style={amountStyle}>${fmt(cs.prePro)}</span>
          </div>
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
            <span style={{ fontSize: 14, fontWeight: 700 }}>${fmt(cs.postSubtotal)}</span>
          </div>
          <div style={rowStyle}>
            <div>
              <div style={lineNameStyle}>Editing &amp; assembly</div>
              <div style={lineSubStyle}>{cs.editDays} day{cs.editDays !== 1 ? "s" : ""} × ${fmt(cs.postDayRate)}/day</div>
            </div>
            <span style={amountStyle}>${fmt(cs.postSubtotal - cs.colorAlloc - cs.soundAlloc)}</span>
          </div>
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

      {/* Union P&H */}
      {cs.isUnion && cs.unionPH > 0 && (
        <>
          <div style={{ height: 1, background: "var(--border)", margin: "4px 0 12px" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <span style={lineNameStyle}>Mandatory Union P&amp;H (21.5%)</span>
              <div style={lineSubStyle}>Pension &amp; Health — IATSE/DGA standard</div>
            </div>
            <span style={amountStyle}>${fmt(cs.unionPH)}</span>
          </div>
        </>
      )}

      {/* Multi-role note */}
      {cs.isMultiRole && (
        <div style={{ marginTop: 14, padding: "10px 12px", background: "rgba(232,197,122,0.06)", borderRadius: 10, border: "1px solid rgba(232,197,122,0.15)" }}>
          <p style={{ margin: 0, fontSize: 12, color: "var(--text-3)", lineHeight: 1.5 }}>
            Editing priced at full video editor rate — not the standard 0.75× discount. You&apos;re filling two seats.
          </p>
        </div>
      )}
    </div>
  );
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
  loadSampleDeal,
  displayName,
  profileRole,
}: Props) {
  const [showNegoSheet, setShowNegoSheet] = useState(false);
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
                <label>Website (optional)</label>
                <input
                  type="url"
                  value={deal.url}
                  onChange={(e) => setDeal((d) => ({ ...d, url: e.target.value }))}
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
                  <option value="launch">Launching a new product/service line</option>
                  <option value="agency-switch">Replacing an agency that underperformed</option>
                  <option value="organic-scale">Scaling organic social distribution velocity</option>
                  <option value="paid-push">Paid media ad campaign conversion push</option>
                  <option value="corp-comms">Internal corporate/investor communications</option>
                </select>
              </div>
              <div className="field">
                <label>Company size</label>
                <ChipGroup
                  options={COMPANY_SIZE_OPTIONS}
                  value={intelCompanySize}
                  onChange={(v) => setIntelCompanySize(v as string)}
                />
              </div>
              <div className="field">
                <label>How much total revenue does this client expect to make this year?</label>
                <input value={intelAnnualRevenue} onChange={(e) => setIntelAnnualRevenue(e.target.value)} placeholder="e.g. $500,000 or $10M+" />
              </div>
              <div className="field">
                <label>What is one customer worth to them? (Product Price or Lifetime Value)</label>
                <input value={intelLtv} onChange={(e) => setIntelLtv(e.target.value)} placeholder="e.g. $1,200 if it's a subscription, or a $500 product price" />
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
              <div style={{ marginTop: 10 }}>
                {result.isUnion ? (
                  <span className="badge gold" style={{ letterSpacing: "0.07em", fontSize: 11 }}>
                    UNION AGREEMENT SCALE
                  </span>
                ) : result.matchUnionRates ? (
                  <span className="badge green" style={{ letterSpacing: "0.07em", fontSize: 11 }}>
                    NON-UNION CASH EQUIVALENT
                  </span>
                ) : (
                  <span className="badge" style={{ letterSpacing: "0.07em", fontSize: 11 }}>
                    INDEPENDENT MARKET RATE
                  </span>
                )}
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
                    Bare minimum. Never go below this.
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
            {result.crewSplit && (result.crewSplit.shootDays > 0 || result.crewSplit.editDays > 0) && (
              <CrewSplitCard cs={result.crewSplit} />
            )}
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

          {showNegoSheet && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 50,
                background: "rgba(11,11,15,0.94)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                display: "flex",
                flexDirection: "column",
                overflowY: "auto",
              }}
              onClick={() => setShowNegoSheet(false)}
            >
              <div
                style={{ flex: 1, padding: "20px 20px calc(32px + var(--safe-bottom, 0px))" }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
                  <div>
                    <div className="eyebrow" style={{ marginBottom: 6 }}>Negotiation Cheat Sheet</div>
                    <h2 style={{ margin: 0, fontSize: 20 }}>{deal.client || "This Deal"}</h2>
                  </div>
                  <button
                    type="button"
                    className="icon-btn"
                    style={{ flexShrink: 0, marginLeft: 12 }}
                    onClick={() => setShowNegoSheet(false)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="tactic">
                  <div className="source">01 · The Anchor</div>
                  <p style={{ margin: 0, fontSize: 14, color: "var(--text-2)", lineHeight: 1.65 }}>
                    Lead with your premium Stretch target of{" "}
                    <strong style={{ color: "var(--text)" }}>${fmt(result.stretch)}</strong>.
                    Let them negotiate down toward your Fair Rate of{" "}
                    <strong style={{ color: "var(--gold)" }}>${fmt(result.target)}</strong>{" "}
                    so they feel like they&apos;re getting a massive win.
                  </p>
                </div>

                <div className="tactic" style={{ marginTop: 12 }}>
                  <div className="source">02 · The Value Shield</div>
                  <p style={{ margin: "0 0 10px", fontSize: 14, color: "var(--text-2)", lineHeight: 1.65 }}>
                    If they flinch at the price, immediately pivot to business outcomes. Frame it as an investment:
                  </p>
                  <div className="quote">
                    &ldquo;This campaign fully pays for itself if it brings you just{" "}
                    <strong style={{ color: "var(--text)" }}>
                      {result.breakEvenSales != null ? result.breakEvenSales : "a handful of"}
                    </strong>{" "}
                    new customer{result.breakEvenSales !== 1 ? "s" : ""}. Do you think our content can pull that off over the next 12 months?&rdquo;
                  </div>
                </div>

                <div className="tactic" style={{ marginTop: 12 }}>
                  <div className="source">03 · The Boundary Line</div>
                  <p style={{ margin: 0, fontSize: 14, color: "var(--text-2)", lineHeight: 1.65 }}>
                    Keep your secret Walk-Away Floor of{" "}
                    <strong style={{ color: "var(--coral)" }}>
                      {result.floorRate !== undefined ? `$${fmt(result.floorRate)}` : "your floor rate"}
                    </strong>{" "}
                    close to your chest. If they push the budget below this line, politely decline the project. Never lose money just to book a gig.
                  </p>
                </div>

                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ marginTop: 28 }}
                  onClick={() => setShowNegoSheet(false)}
                >
                  Got it — back to deal
                </button>
              </div>
            </div>
          )}
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
          <h1>The playbook</h1>
          <div className="card">
            <div className="eyebrow">Never Split the Difference</div>
            <h3>The negotiation classic</h3>
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



function screenClass(current: ScreenId, id: ScreenId) {
  return `screen${current === id ? " active" : ""}`;
}

const SCORE_CIRC = 2 * Math.PI * 44;

export default function Page() {
  const [screen, setScreen] = useState<ScreenId>("welcome");
  const [setupStep, setSetupStep] = useState(1);
  const [dealStep, setDealStep] = useState(1);
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [deal, setDeal] = useState<Deal>({
    ...defaultDeal,
    client: "Summit Coffee Co.",
    url: "https://summitcoffee.com",
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
  const [intelLtv, setIntelLtv] = useState("");
  const [intelRoi, setIntelRoi] = useState("");
  const [intelBudget, setIntelBudget] = useState("$6,000–$8,000");
  const [intelAnnualRevenue, setIntelAnnualRevenue] = useState("");
  const [intelCompanySize, setIntelCompanySize] = useState("");
  const [isUnion, setIsUnion] = useState(false);
  const [matchUnionRates, setMatchUnionRates] = useState(false);

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
            applyResult(computeRecommendation(profile, analysisDealRef.current, isUnion, matchUnionRates));
            go("deal-result");
          }, 350),
        );
      }
    };

    timeouts.push(setTimeout(tick, 0));
    return () => timeouts.forEach(clearTimeout);
  }, [screen, profile, deal, applyResult, go, isUnion, matchUnionRates]);

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );

  const score = result?.score ?? 8;
  const scoreOffset = SCORE_CIRC * (1 - score / 10);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: MIMS_CSS }} />
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
                Your AI co-pilot for freelance negotiations.
                <br />
                Built for the people doing the work.
              </p>
            </div>
            <div className="welcome-features">
              {[
                {
                  title: "Fair-market rate, not friend pricing",
                  desc: "Real benchmarks for your trade, experience, and city.",
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
                  title: "Tactics from the best",
                  desc: "Voss, Enns, The Futur — distilled into talking points you can use in the meeting.",
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
                <h2>What&apos;s your position?</h2>
                <p className="muted small" style={{ margin: "6px 0 18px" }}>
                  Pick the role you&apos;re charging for today. Search from 200+ Nova positions.
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
                <h3 style={{ marginTop: 22 }}>Union or non-union?</h3>
                <p className="muted small" style={{ margin: "6px 0 12px" }}>
                  Determines the rate structure and whether the 21.5% P&amp;H fringe loader applies.
                </p>
                <div className="seg">
                  <button
                    type="button"
                    className={!isUnion ? "active" : ""}
                    onClick={() => setIsUnion(false)}
                  >
                    Non-Union
                  </button>
                  <button
                    type="button"
                    className={isUnion ? "active" : ""}
                    onClick={() => setIsUnion(true)}
                  >
                    Union Scale
                  </button>
                </div>
                {!isUnion && (
                  <div
                    role="checkbox"
                    aria-checked={matchUnionRates}
                    tabIndex={0}
                    style={{
                      display: "flex", alignItems: "center", gap: 12, marginTop: 10,
                      padding: "12px 14px",
                      background: matchUnionRates ? "rgba(94,226,160,0.05)" : "var(--surface)",
                      border: `1px solid ${matchUnionRates ? "rgba(94,226,160,0.3)" : "var(--border)"}`,
                      borderRadius: 12, cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                    onClick={() => setMatchUnionRates((v) => !v)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setMatchUnionRates((v) => !v); } }}
                  >
                    <div style={{
                      width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                      border: matchUnionRates ? "none" : "1.5px solid var(--border-2)",
                      background: matchUnionRates ? "var(--grad)" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.15s ease",
                    }}>
                      {matchUnionRates && (
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="#1a1306" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>
                        Match union rates per position
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>
                        Premium scale day rates — no P&amp;H fringe loader
                      </div>
                    </div>
                  </div>
                )}
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
              <div className="eyebrow" style={{ marginBottom: 8 }}>Tip of the day</div>
              <h3 style={{ fontSize: 16 }}>&quot;He who cares less, wins.&quot;</h3>
              <p className="muted small" style={{ margin: "8px 0 0" }}>
                — Blair Enns, <em>Win Without Pitching</em>. If you&apos;d be relieved when they say no, your stance is right.
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
          intelAnnualRevenue={intelAnnualRevenue}
          setIntelAnnualRevenue={setIntelAnnualRevenue}
          intelCompanySize={intelCompanySize}
          setIntelCompanySize={setIntelCompanySize}
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
    </>
  );
}

