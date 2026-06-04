"use client";

import { useState } from "react";
import { SubscriptionLegalNotice } from "@/components/mims/SubscriptionLegalNotice";
import {
  BILLING_ENFORCEMENT_ENABLED,
  FREE_DEAL_LIMIT,
  SUBSCRIPTION_PLAN_LABEL,
  SUBSCRIPTION_PRICE_MONTHLY_USD,
  billingStatusLabel,
  getCompletedDealCount,
  getOrCreateDeviceId,
  hasActiveSubscription,
} from "@/lib/mims/billing";

type Props = {
  email?: string;
  compact?: boolean;
  onCheckoutStart?: () => void;
  showToast: (msg: string) => void;
};

export function SubscriptionPanel({ email, compact, onCheckoutStart, showToast }: Props) {
  const [loading, setLoading] = useState(false);
  const subscribed = hasActiveSubscription();
  const completed = getCompletedDealCount();

  const startCheckout = async () => {
    if (!BILLING_ENFORCEMENT_ENABLED) {
      showToast("Subscriptions are not open yet — MIMS is free while we launch");
      return;
    }
    onCheckoutStart?.();
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email?.trim() || undefined,
          deviceId: getOrCreateDeviceId(),
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) {
        showToast(data.error ?? "Checkout is not configured yet");
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      showToast("Could not start checkout");
    } catch {
      showToast("Could not reach checkout — try again");
    } finally {
      setLoading(false);
    }
  };

  if (!BILLING_ENFORCEMENT_ENABLED) {
    return (
      <div className="card">
        <div className="eyebrow" style={{ marginBottom: 6 }}>
          Pricing
        </div>
        <h3 style={{ marginBottom: 6 }}>Free while we launch</h3>
        <p className="muted small" style={{ margin: 0 }}>
          MIMS will eventually be {FREE_DEAL_LIMIT} deals free, then {SUBSCRIPTION_PLAN_LABEL}. Billing is
          not turned on yet — use the app normally with no charge.
        </p>
      </div>
    );
  }

  if (subscribed) {
    return (
      <div className="card">
        <div className="eyebrow" style={{ marginBottom: 6 }}>
          MIMS Pro
        </div>
        <h3 style={{ marginBottom: 6 }}>Subscription active</h3>
        <p className="muted small" style={{ margin: 0 }}>
          {billingStatusLabel()}. Manage billing via the email receipt from Stripe or contact support.
        </p>
      </div>
    );
  }

  return (
    <div className="card" style={compact ? { padding: 16 } : undefined}>
      {!compact ? (
        <>
          <div className="eyebrow" style={{ marginBottom: 6 }}>
            Pricing
          </div>
          <h3 style={{ marginBottom: 8 }}>
            {FREE_DEAL_LIMIT} deals free, then {SUBSCRIPTION_PLAN_LABEL}
          </h3>
          <p className="muted small" style={{ margin: "0 0 16px" }}>
            {completed >= FREE_DEAL_LIMIT
              ? "You've used your free deal analyses. Subscribe to run unlimited deals."
              : billingStatusLabel()}
          </p>
        </>
      ) : null}

      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 8,
          marginBottom: compact ? 12 : 16,
        }}
      >
        <span className="big-num" style={{ fontSize: compact ? 36 : 44 }}>
          ${SUBSCRIPTION_PRICE_MONTHLY_USD}
        </span>
        <span className="muted">/ month</span>
      </div>

      <ul
        className="muted small"
        style={{ margin: "0 0 16px", paddingLeft: 18, lineHeight: 1.6 }}
      >
        <li>Unlimited deal analyses</li>
        <li>Invoice &amp; scope-of-work drafts</li>
        <li>Cancel anytime — no charge after the current period</li>
      </ul>

      <SubscriptionLegalNotice planPrice={SUBSCRIPTION_PLAN_LABEL} billingPeriod="month" />

      <button
        type="button"
        className="btn btn-primary"
        style={{ marginTop: 14 }}
        disabled={loading}
        onClick={startCheckout}
      >
        {loading ? "Opening checkout…" : `Subscribe — ${SUBSCRIPTION_PLAN_LABEL}`}
      </button>
    </div>
  );
}
