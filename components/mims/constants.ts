export const TRADE_OPTIONS = [
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

export const EXP_OPTIONS = [
  { id: "0-1", label: "Less than 1 year" },
  { id: "1-3", label: "1–3 years" },
  { id: "3-5", label: "3–5 years" },
  { id: "5-10", label: "5–10 years" },
  { id: "10+", label: "10+ years" },
];

export const SKILL_OPTIONS = [
  { id: "emerging", label: "Emerging" },
  { id: "mid", label: "Mid-level" },
  { id: "senior", label: "Senior" },
  { id: "expert", label: "Expert / specialist" },
];

export const EXTRA_OPTIONS = [
  { id: "color", label: "Color grading" },
  { id: "sound", label: "Sound design" },
  { id: "motion", label: "Motion graphics" },
  { id: "directing", label: "Directing" },
  { id: "copy", label: "Copywriting" },
  { id: "strategy", label: "Strategy" },
  { id: "branding", label: "Branding" },
  { id: "social", label: "Social media" },
];

export const PROJECT_OPTIONS = [
  { id: "brand-video", label: "Brand video" },
  { id: "event", label: "Event" },
  { id: "ads", label: "Ad campaign" },
  { id: "social", label: "Social cutdowns" },
  { id: "docu", label: "Documentary" },
  { id: "retainer", label: "Monthly retainer" },
];

export const SOURCE_OPTIONS = [
  { id: "referral", label: "Referral" },
  { id: "inbound", label: "Cold inbound" },
  { id: "repeat", label: "Repeat" },
  { id: "pitched", label: "I pitched" },
];

export const RUSH_OPTIONS = [
  { id: "loose", label: "Loose" },
  { id: "normal", label: "Normal" },
  { id: "rush", label: "Rush" },
  { id: "fire", label: "On fire" },
];

export const USAGE_OPTIONS = [
  { id: "organic", label: "Organic / owned" },
  { id: "paid", label: "Paid digital ads" },
  { id: "broadcast", label: "TV / CTV / OOH" },
];

export const USAGE_HELPER: Record<string, string> = {
  organic:
    "Client’s own channels only (social, site, email). No paid ads, TV, streaming commercials, or billboards.",
  paid:
    "Paid placement on digital platforms (Meta, TikTok, YouTube, LinkedIn, etc.). Not TV or OOH.",
  broadcast:
    "TV and streaming/CTV spots, plus out-of-home (billboards, transit, airports). Non-union or union — confirm on set.",
};

export const DM_OPTIONS = [
  { id: "yes", label: "Yes" },
  { id: "no", label: "No" },
  { id: "unclear", label: "Unclear" },
];

export const BUDGET_OPTIONS = [
  { id: "open", label: "Open" },
  { id: "range", label: "Gave a range" },
  { id: "anchor-low", label: "Anchored low" },
  { id: "hidden", label: "Hiding it" },
];

export const DEMO_PROFILE = {
  name: "Quinton Cameron",
  email: "quinton@qcfilms.co",
  trade: "videographer",
  experience: "5-10",
  skill: "senior",
  location: "Atlanta, GA",
  extras: ["color", "sound", "motion"],
};

export const LOADING_STEPS = [
  "Pulling 2026 rate benchmarks…",
  "Researching the client…",
  "Estimating budget capacity…",
  "Scoring close-likelihood…",
  "Drafting tactics from Voss + Enns…",
];
