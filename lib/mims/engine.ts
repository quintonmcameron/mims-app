import type { CSSProperties } from "react";

export type ScreenId =
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

export type Mood = "good" | "ok" | "soft" | "walk";

export interface Profile {
  name: string;
  email: string;
  trade: string;
  experience: string;
  skill: string;
  location: string;
  extras: string[];
}

export interface Deal {
  client: string;
  source: string;
  project: string;
  shootDays: number;
  editDays: number;
  rush: string;
  usage: string;
  why: string;
  ltv: string;
  roi: string;
  dm: string;
  budgetStance: string;
  budget: string;
}

export interface Recommendation {
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
}

export const defaultProfile: Profile = {
  name: "",
  email: "",
  trade: "",
  experience: "",
  skill: "",
  location: "",
  extras: [],
};

export const defaultDeal: Deal = {
  client: "",
  source: "referral",
  project: "brand-video",
  shootDays: 2,
  editDays: 3,
  rush: "normal",
  usage: "organic",
  why: "",
  ltv: "",
  roi: "",
  dm: "yes",
  budgetStance: "range",
  budget: "",
};

export function tradeLabel(t: string): string {
  const map: Record<string, string> = {
    videographer: "Videographer",
    "video-editor": "Video editor",
    photographer: "Photographer",
    designer: "Designer",
    developer: "Developer",
    writer: "Writer",
    marketer: "Marketing",
    consultant: "Consultant",
    other: "Creative",
  };
  return map[t] || "Videographer";
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

export function fmt(n: number): string {
  return n.toLocaleString("en-US");
}

export function computeRecommendation(
  profile: Profile,
  deal: Deal,
): Recommendation {
  const tradeBase: Record<string, Record<string, number>> = {
    videographer: {
      "0-1": 350,
      "1-3": 600,
      "3-5": 900,
      "5-10": 1200,
      "10+": 1600,
    },
    "video-editor": {
      "0-1": 280,
      "1-3": 480,
      "3-5": 720,
      "5-10": 950,
      "10+": 1300,
    },
    photographer: {
      "0-1": 320,
      "1-3": 550,
      "3-5": 850,
      "5-10": 1150,
      "10+": 1500,
    },
    designer: {
      "0-1": 320,
      "1-3": 500,
      "3-5": 750,
      "5-10": 1000,
      "10+": 1400,
    },
    developer: {
      "0-1": 400,
      "1-3": 700,
      "3-5": 1100,
      "5-10": 1500,
      "10+": 2000,
    },
    writer: {
      "0-1": 220,
      "1-3": 380,
      "3-5": 600,
      "5-10": 800,
      "10+": 1100,
    },
    marketer: {
      "0-1": 280,
      "1-3": 480,
      "3-5": 750,
      "5-10": 1050,
      "10+": 1400,
    },
    consultant: {
      "0-1": 350,
      "1-3": 650,
      "3-5": 1000,
      "5-10": 1400,
      "10+": 1900,
    },
    other: {
      "0-1": 280,
      "1-3": 480,
      "3-5": 720,
      "5-10": 1000,
      "10+": 1400,
    },
  };

  const base =
    (tradeBase[profile.trade] || tradeBase.videographer)[
      profile.experience || "5-10"
    ] || 1200;

  const skillMult =
    { emerging: 0.9, mid: 1.0, senior: 1.15, expert: 1.35 }[
      profile.skill || "senior"
    ] || 1.0;
  const extrasMult = 1 + Math.min(profile.extras.length, 4) * 0.04;
  const rushMult =
    { loose: 0.95, normal: 1.0, rush: 1.2, fire: 1.4 }[deal.rush] || 1.0;
  const usageMult =
    { organic: 1.0, paid: 1.25, broadcast: 1.6 }[deal.usage] || 1.0;

  const adjDay = base * skillMult * extrasMult;

  const shoot = deal.shootDays * adjDay * rushMult * usageMult;
  const editDayRate = adjDay * 0.75;
  const edit = deal.editDays * editDayRate * rushMult;
  const prePro = adjDay * 0.6;
  const usageLicense =
    deal.usage === "organic"
      ? adjDay * 0.5
      : deal.usage === "paid"
        ? adjDay * 1.5
        : adjDay * 2.5;

  let target = shoot + edit + prePro + usageLicense;
  target = Math.round(target / 50) * 50;
  const floor = Math.round((target * 0.8) / 50) * 50;
  const stretch = Math.round((target * 1.35) / 50) * 50;

  const ltvNum = parseMoney(deal.ltv);
  const roiNum = parseInt((deal.roi || "").replace(/[^0-9]/g, ""), 10);
  const projectedRev = ltvNum && roiNum ? ltvNum * roiNum : 0;

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

  return {
    target,
    floor,
    stretch,
    capacity,
    score,
    headline,
    rationale,
    verdict,
    mood,
  };
}

export const sampleDeals: Record<string, Recommendation & { client: string }> =
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

export function verdictCardStyle(mood: Mood): CSSProperties {
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
