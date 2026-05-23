/**
 * Project-type labor multipliers vs. a neutral corporate/brand baseline (1.0).
 *
 * Benchmarks (2025–2026 market guides):
 * - Social / channel content: ~$3k–$15k per finished piece (~$500–$2k/min)
 * - Corporate / brand video: ~$12k–$50k (~$2k–$5k/min)
 * - Regional commercial: ~$15k–$75k (~$3k–$8k/min)
 *
 * YouTube sits between social cuts and corporate brand work: longer format, often
 * organic channel distribution, lighter crew than broadcast spots. Paid YouTube
 * ads / sponsored integrations are handled separately via usage tier loading.
 */
const PROJECT_TYPE_MULT: Record<string, number> = {
  "youtube video": 0.88,
  vlog: 0.85,
  "web series": 0.92,
  "social media content": 0.82,
  "user generated content": 0.78,
  "test shoot": 0.8,
  "personal project": 0.75,
  podcast: 0.9,
  "live stream": 0.88,
  "branded content": 1.0,
  campaign: 1.05,
  commercial: 1.15,
  "feature film": 1.25,
  "short film": 1.1,
  "music video": 1.05,
  "tv show": 1.2,
  documentary: 1.08,
  "fashion film": 1.12,
};

/** Legacy slug ids from chip pickers (e.g. PROJECT_OPTIONS). */
const PROJECT_SLUG_MULT: Record<string, number> = {
  youtube: 0.88,
  "brand-video": 1.0,
  commercial: 1.15,
  social: 0.82,
  ads: 1.1,
  docu: 1.08,
  event: 0.95,
  retainer: 0.9,
  "music-video": 1.05,
};

const PROJECT_TYPE_HELPER: Record<string, string> = {
  "youtube video":
    "YouTube channel work typically runs ~10–15% below corporate brand video. Default to organic/owned usage; switch to paid if they run YouTube ads or sponsor integrations on other channels.",
};

function normalizeProject(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

export function getProjectTypeMultiplier(project: string): number {
  if (!project) return 1.0;
  const key = normalizeProject(project);
  if (PROJECT_TYPE_MULT[key] !== undefined) return PROJECT_TYPE_MULT[key];
  if (PROJECT_SLUG_MULT[key] !== undefined) return PROJECT_SLUG_MULT[key];
  return 1.0;
}

export function getProjectTypeHelper(project: string): string | undefined {
  if (!project) return undefined;
  return PROJECT_TYPE_HELPER[normalizeProject(project)];
}
