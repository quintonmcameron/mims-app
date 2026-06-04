/**
 * When false, the app behaves as today: no paywall, no deal limits.
 * Flip to true only after Petty Apartment LLC is filed, legal is reviewed,
 * and Stripe env vars are set in Vercel.
 */
export const BILLING_ENFORCEMENT_ENABLED = false;

/** Free completed deal analyses before subscription is required. */
export const FREE_DEAL_LIMIT = 2;

export const SUBSCRIPTION_PRICE_MONTHLY_USD = 10;
export const SUBSCRIPTION_PLAN_LABEL = "$10 per month";

const COMPLETED_DEALS_KEY = "mimsCompletedDeals";
const SUBSCRIPTION_KEY = "mimsSubscription";
const DEVICE_ID_KEY = "mimsDeviceId";

export type SubscriptionRecord = {
  active: boolean;
  updatedAt: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  /** ISO date — subscription access ends after this if not renewed. */
  currentPeriodEnd?: string;
};

export function getOrCreateDeviceId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `mims-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

export function getCompletedDealCount(): number {
  if (typeof window === "undefined") return 0;
  const raw = localStorage.getItem(COMPLETED_DEALS_KEY);
  const n = raw ? parseInt(raw, 10) : 0;
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

/** Call once when a deal analysis finishes successfully. */
export function recordCompletedDeal(): number {
  const next = getCompletedDealCount() + 1;
  if (typeof window !== "undefined") {
    localStorage.setItem(COMPLETED_DEALS_KEY, String(next));
  }
  return next;
}

export function getSubscription(): SubscriptionRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SUBSCRIPTION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SubscriptionRecord;
  } catch {
    return null;
  }
}

export function activateSubscription(partial: Omit<SubscriptionRecord, "active" | "updatedAt"> = {}): void {
  if (typeof window === "undefined") return;
  const record: SubscriptionRecord = {
    active: true,
    updatedAt: new Date().toISOString(),
    ...partial,
  };
  localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(record));
}

export function clearSubscription(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SUBSCRIPTION_KEY);
}

export function hasActiveSubscription(): boolean {
  const sub = getSubscription();
  if (!sub?.active) return false;
  if (sub.currentPeriodEnd) {
    const end = new Date(sub.currentPeriodEnd);
    if (!Number.isNaN(end.getTime()) && end < new Date()) return false;
  }
  return true;
}

export function freeDealsRemaining(): number {
  if (hasActiveSubscription()) return FREE_DEAL_LIMIT;
  return Math.max(0, FREE_DEAL_LIMIT - getCompletedDealCount());
}

/** True if the user may start or run another deal analysis. */
export function canRunDealAnalysis(): boolean {
  if (!BILLING_ENFORCEMENT_ENABLED) return true;
  if (hasActiveSubscription()) return true;
  return getCompletedDealCount() < FREE_DEAL_LIMIT;
}

export function needsSubscription(): boolean {
  if (!BILLING_ENFORCEMENT_ENABLED) return false;
  return !canRunDealAnalysis();
}

export function billingStatusLabel(): string {
  if (hasActiveSubscription()) return `MIMS Pro · ${SUBSCRIPTION_PLAN_LABEL}`;
  const left = freeDealsRemaining();
  if (left === 0) return "Free trials used — subscribe to continue";
  if (left === 1) return "1 free deal analysis left";
  return `${left} free deal analyses left`;
}
