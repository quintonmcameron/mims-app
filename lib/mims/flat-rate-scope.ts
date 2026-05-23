export type FlatComplexity = "rough" | "clean" | "detailed";

export type FlatRateTemplateId = "frames" | "pages" | "assets" | "deliverables";

export interface FlatRateTemplate {
  id: FlatRateTemplateId;
  unitLabel: string;
  unitLabelPlural: string;
  defaultUnits: number;
  hoursPerUnit: Record<FlatComplexity, number>;
  marketPerUnit: Record<FlatComplexity, number>;
}

export interface FlatRateSuggestion {
  floor: number;
  target: number;
  stretch: number;
  estimatedDays: number;
  dayAnchor: number;
  marketAnchor: number;
  summary: string;
}

const HOURS: Record<FlatComplexity, number> = {
  rough: 0.75,
  clean: 1.5,
  detailed: 3,
};

const MARKET: Record<FlatComplexity, number> = {
  rough: 85,
  clean: 175,
  detailed: 350,
};

const TEMPLATES: { match: RegExp; template: FlatRateTemplate }[] = [
  {
    match: /storyboard|concept artist/i,
    template: {
      id: "frames",
      unitLabel: "frame",
      unitLabelPlural: "frames",
      defaultUnits: 12,
      hoursPerUnit: HOURS,
      marketPerUnit: MARKET,
    },
  },
  {
    match: /treatment|pitch deck/i,
    template: {
      id: "pages",
      unitLabel: "page",
      unitLabelPlural: "pages",
      defaultUnits: 8,
      hoursPerUnit: { rough: 1, clean: 2, detailed: 4 },
      marketPerUnit: { rough: 125, clean: 250, detailed: 450 },
    },
  },
  {
    match: /retouch/i,
    template: {
      id: "assets",
      unitLabel: "image",
      unitLabelPlural: "images",
      defaultUnits: 10,
      hoursPerUnit: { rough: 0.25, clean: 0.5, detailed: 1.25 },
      marketPerUnit: { rough: 35, clean: 75, detailed: 150 },
    },
  },
  {
    match: /writer|copywriter|composer|music supervisor/i,
    template: {
      id: "deliverables",
      unitLabel: "deliverable",
      unitLabelPlural: "deliverables",
      defaultUnits: 2,
      hoursPerUnit: { rough: 2, clean: 4, detailed: 8 },
      marketPerUnit: { rough: 350, clean: 750, detailed: 1500 },
    },
  },
  {
    match: /motion|graphic|illustrator|3d artist|ai artist|animator|designer|title designer|layout artist|visual researcher|packaging|product designer|digital designer|render artist|treatment designer/i,
    template: {
      id: "deliverables",
      unitLabel: "deliverable",
      unitLabelPlural: "deliverables",
      defaultUnits: 3,
      hoursPerUnit: { rough: 1.5, clean: 3, detailed: 6 },
      marketPerUnit: { rough: 200, clean: 450, detailed: 900 },
    },
  },
];

const DEFAULT_TEMPLATE: FlatRateTemplate = {
  id: "deliverables",
  unitLabel: "deliverable",
  unitLabelPlural: "deliverables",
  defaultUnits: 4,
  hoursPerUnit: HOURS,
  marketPerUnit: MARKET,
};

/** Roles that commonly quote flat / deliverable fees (not only day rate). */
export function isFlatRateEligible(role: string): boolean {
  if (!role.trim()) return false;
  return getFlatRateTemplate(role) !== null;
}

export function getFlatRateTemplate(role: string): FlatRateTemplate | null {
  if (!role.trim()) return null;
  for (const entry of TEMPLATES) {
    if (entry.match.test(role)) return entry.template;
  }
  return null;
}

export function getDefaultFlatScope(role: string): {
  flatUnitCount: number;
  flatComplexity: FlatComplexity;
  flatRevisionRounds: number;
} {
  const template = getFlatRateTemplate(role);
  return {
    flatUnitCount: template?.defaultUnits ?? DEFAULT_TEMPLATE.defaultUnits,
    flatComplexity: "clean",
    flatRevisionRounds: 2,
  };
}

function roundTo50(n: number): number {
  return Math.round(n / 50) * 50;
}

export function computeFlatRateSuggestion(
  role: string,
  laborDayRate: number,
  unitCount: number,
  complexity: FlatComplexity,
  revisionRounds: number,
): FlatRateSuggestion | null {
  const template = getFlatRateTemplate(role);
  if (!template || laborDayRate <= 0) return null;

  const units = Math.max(1, unitCount);
  const hours = template.hoursPerUnit[complexity] * units;
  const estimatedDays = Math.max(0.5, hours / 8);
  const dayAnchor = estimatedDays * laborDayRate;
  const marketAnchor = units * template.marketPerUnit[complexity];
  const extraRevisions = Math.max(0, revisionRounds - 2);
  const revisionMult = 1 + extraRevisions * 0.12;

  const floor = roundTo50(Math.max(dayAnchor, marketAnchor) * revisionMult);
  const target = roundTo50(floor * 1.18);
  const stretch = roundTo50(floor * 1.38);

  const complexityLabel =
    complexity === "rough" ? "rough" : complexity === "clean" ? "clean" : "detailed";

  return {
    floor,
    target,
    stretch,
    estimatedDays: Math.round(estimatedDays * 10) / 10,
    dayAnchor: roundTo50(dayAnchor),
    marketAnchor: roundTo50(marketAnchor),
    summary: `${units} ${units === 1 ? template.unitLabel : template.unitLabelPlural} · ${complexityLabel} · ${revisionRounds} rev round${revisionRounds !== 1 ? "s" : ""}`,
  };
}

export const FLAT_COMPLEXITY_OPTIONS: { id: FlatComplexity; label: string }[] = [
  { id: "rough", label: "Rough" },
  { id: "clean", label: "Clean" },
  { id: "detailed", label: "Detailed" },
];

export const FLAT_REVISION_OPTIONS = [1, 2, 3] as const;
