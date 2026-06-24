"use client";

import { useState } from "react";
import {
  LEGAL_VERSION,
  needsFirstLaunchConsent,
  recordLegalConsent,
} from "@/lib/mims/legal";

/**
 * Blocking first-use modal — mount once via LegalConsentGate in root layout.
 * Shown only the first time the user opens the app; re-acceptance uses the in-app banner.
 */
export function LegalConsentModal() {
  const [open, setOpen] = useState(() => needsFirstLaunchConsent());
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const accept = () => {
    setBusy(true);
    recordLegalConsent();
    setOpen(false);
    setBusy(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-consent-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        background: "rgba(11,11,15,0.92)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div
        style={{
          maxWidth: 440,
          width: "100%",
          background: "var(--surface, #15151d)",
          border: "1px solid rgba(232,197,122,0.35)",
          borderRadius: 16,
          padding: "24px 22px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
        }}
      >
        <p
          style={{
            margin: "0 0 8px",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#e8c57a",
          }}
        >
          Before you continue
        </p>
        <h2
          id="legal-consent-title"
          style={{ margin: "0 0 12px", fontSize: 20, letterSpacing: "-0.02em", color: "#ffffff" }}
        >
          Educational estimates only
        </h2>
        <p style={{ margin: "0 0 16px", fontSize: 14, color: "#ffffff", lineHeight: 1.6 }}>
          MIMS helps independent freelancers prepare pricing and deal materials. Outputs are estimates and draft
          templates — not legal, tax, accounting, or contract advice, and not a guarantee any client will accept a
          rate.
        </p>
        <p style={{ margin: "0 0 20px", fontSize: 13, color: "#ffffff", lineHeight: 1.55 }}>
          By selecting <strong>I understand</strong>, you agree to our{" "}
          <a href="/terms" style={{ color: "#e8c57a" }}>
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" style={{ color: "#e8c57a" }}>
            Privacy Policy
          </a>{" "}
          (version {LEGAL_VERSION}).
        </p>
        <button
          type="button"
          onClick={accept}
          disabled={busy}
          style={{
            width: "100%",
            padding: "14px 18px",
            borderRadius: 12,
            border: "none",
            background: "linear-gradient(135deg, #e8c57a 0%, #ff7a66 100%)",
            color: "#1a1306",
            fontWeight: 700,
            fontSize: 15,
            cursor: busy ? "wait" : "pointer",
          }}
        >
          I understand
        </button>
      </div>
    </div>
  );
}
