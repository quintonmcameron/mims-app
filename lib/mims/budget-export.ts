export type BudgetSectionId =
  | "locations"
  | "camera"
  | "grip-electric"
  | "production-design"
  | "production-essentials"
  | "production"
  | "post-production"
  | "usage"
  | "additional";

export interface BudgetSection {
  id: BudgetSectionId;
  label: string;
  defaultUnit: string;
}

export const BUDGET_SECTIONS: BudgetSection[] = [
  { id: "locations", label: "LOCATIONS", defaultUnit: "Hours" },
  { id: "camera", label: "CAMERA DEPARTMENT", defaultUnit: "DAY(S)" },
  { id: "grip-electric", label: "GRIP & ELECTRIC DEPARTMENT", defaultUnit: "DAY(S)" },
  { id: "production-design", label: "PRODUCTION DESIGN", defaultUnit: "Units" },
  { id: "production-essentials", label: "PRODUCTION ESSENTIALS", defaultUnit: "Units" },
  { id: "production", label: "PRODUCTION", defaultUnit: "DAY(S)" },
  { id: "post-production", label: "POST-PRODUCTION", defaultUnit: "DAY(S)" },
  { id: "usage", label: "USAGE & LICENSING", defaultUnit: "Flat" },
  { id: "additional", label: "ADDITIONAL EXPENSES", defaultUnit: "Flat" },
];

export interface BudgetRow {
  id: string;
  section: BudgetSectionId;
  item: string;
  unit: string;
  rate: number;
  /** MIMS estimate or producer budget (unit × rate when applicable). */
  budget: number;
  /** Actual spend / client-facing total — editable by producer. */
  actual: number;
  notes: string;
  source: "mims" | "manual";
}

export interface CrewSplitBudgetInput {
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
  additionalRoleLines: Array<{
    role: string;
    days: number;
    dayRate: number;
    subtotal: number;
    phase: "shoot" | "post";
  }>;
  usageLicense: number;
  kitFeeTotal: number;
  kitFeeLabel: string;
  additionalCrew: Array<{
    id: string;
    label: string;
    rate: number;
    days: number;
    qty: number;
    total: number;
  }>;
  mediaStorageTotal: number;
  mediaStorageLabel: string;
  ditFeeTotal: number;
  ditDays: number;
  ditDayRate: number;
}

export interface BuildBudgetInput {
  projectTitle: string;
  client: string;
  directedBy: string;
  producedBy: string;
  usageLabel?: string;
  scopeServiceLines?: Array<{ label: string; amount: number }>;
  crewSplit: CrewSplitBudgetInput;
  target: number;
}

function money(n: number): string {
  const hasCents = Math.round(n * 100) % 100 !== 0;
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  });
}

function csvCell(value: string | number): string {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function isGripElectricRole(role: string): boolean {
  const r = role.toLowerCase();
  return ["gaffer", "grip", "electric", "lighting", "best boy", "key grip"].some((k) =>
    r.includes(k),
  );
}

function row(
  id: string,
  section: BudgetSectionId,
  item: string,
  unit: string,
  rate: number,
  budget: number,
  notes = "",
): BudgetRow {
  return {
    id,
    section,
    item,
    unit,
    rate,
    budget,
    actual: budget,
    notes,
    source: "mims",
  };
}

export function buildBudgetRowsFromEstimate(input: BuildBudgetInput): BudgetRow[] {
  const cs = input.crewSplit;
  const rows: BudgetRow[] = [];

  if (cs.pricingMode === "project" && cs.projectSubtotal > 0) {
    rows.push(
      row(
        "mims-project-fee",
        "production",
        `${cs.primaryRole || "Primary role"} · project fee`,
        "Flat",
        cs.projectSubtotal,
        cs.projectSubtotal,
      ),
    );
  }

  if (cs.shootDays > 0 && cs.productionSubtotal > 0) {
    rows.push(
      row(
        "mims-primary-shoot",
        "production",
        cs.primaryRole || "Primary role",
        String(cs.shootDays),
        cs.productionDayRate,
        cs.productionSubtotal,
      ),
    );
  }

  for (const line of cs.additionalRoleLines.filter((l) => l.phase === "shoot")) {
    rows.push(
      row(
        `mims-shoot-${line.role}`,
        "production",
        line.role,
        String(line.days),
        line.dayRate,
        line.subtotal,
      ),
    );
  }

  if (cs.prePro > 0) {
    const preRate =
      cs.preProDays > 0 ? Math.round(cs.prePro / cs.preProDays) : cs.prePro;
    rows.push(
      row(
        "mims-prepro",
        "production",
        "Pre-production & prep",
        cs.preProDays > 0 ? String(cs.preProDays) : "Flat",
        preRate,
        cs.prePro,
      ),
    );
  }

  for (const crew of cs.additionalCrew) {
    const section = isGripElectricRole(crew.label) ? "grip-electric" : "production";
    rows.push(
      row(
        `mims-crew-${crew.id}`,
        section,
        crew.label,
        String(crew.days * crew.qty),
        crew.rate,
        crew.total,
      ),
    );
  }

  if (cs.kitFeeTotal > 0) {
    rows.push(
      row(
        "mims-kit",
        "camera",
        cs.kitFeeLabel || "Equipment / kit rental",
        "Flat",
        cs.kitFeeTotal,
        cs.kitFeeTotal,
      ),
    );
  }

  if (cs.ditFeeTotal > 0) {
    rows.push(
      row(
        "mims-dit",
        "camera",
        "DIT / on-set data management",
        String(cs.ditDays),
        cs.ditDayRate,
        cs.ditFeeTotal,
      ),
    );
  }

  if (cs.mediaStorageTotal > 0) {
    rows.push(
      row(
        "mims-storage",
        "camera",
        cs.mediaStorageLabel || "Media storage & data handling",
        "Flat",
        cs.mediaStorageTotal,
        cs.mediaStorageTotal,
      ),
    );
  }

  if (cs.editDays > 0 && cs.postSubtotal > 0) {
    rows.push(
      row(
        "mims-primary-post",
        "post-production",
        `${cs.primaryRole || "Primary role"} · edit`,
        String(cs.editDays),
        cs.postDayRate,
        cs.postSubtotal,
      ),
    );
  }

  for (const line of cs.additionalRoleLines.filter((l) => l.phase === "post")) {
    rows.push(
      row(
        `mims-post-${line.role}`,
        "post-production",
        line.role,
        String(line.days),
        line.dayRate,
        line.subtotal,
      ),
    );
  }

  for (const svc of input.scopeServiceLines ?? []) {
    if (svc.amount <= 0) continue;
    rows.push(
      row(
        `mims-scope-${svc.label}`,
        "post-production",
        svc.label,
        "Flat",
        svc.amount,
        svc.amount,
      ),
    );
  }

  if (cs.usageLicense > 0) {
    rows.push(
      row(
        "mims-usage",
        "usage",
        `Usage & licensing · ${input.usageLabel || "paid"}`,
        "Flat",
        cs.usageLicense,
        cs.usageLicense,
      ),
    );
  }

  const lineBudget = rows.reduce((sum, r) => sum + r.budget, 0);
  const adjustment = input.target - lineBudget;
  if (Math.abs(adjustment) >= 25) {
    rows.push(
      row(
        "mims-adjustment",
        "additional",
        adjustment > 0 ? "Market / scope pricing adjustment" : "Estimate rounding adjustment",
        "Flat",
        adjustment,
        adjustment,
      ),
    );
  }

  return rows;
}

export function createManualBudgetRow(
  section: BudgetSectionId,
  partial?: Partial<Pick<BudgetRow, "item" | "unit" | "rate" | "budget" | "actual" | "notes">>,
): BudgetRow {
  const defaultUnit = BUDGET_SECTIONS.find((s) => s.id === section)?.defaultUnit ?? "Flat";
  const budget = partial?.budget ?? 0;
  return {
    id: `manual-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    section,
    item: partial?.item ?? "",
    unit: partial?.unit ?? defaultUnit,
    rate: partial?.rate ?? 0,
    budget,
    actual: partial?.actual ?? budget,
    notes: partial?.notes ?? "",
    source: "manual",
  };
}

export function sectionTotal(rows: BudgetRow[], section: BudgetSectionId, field: "budget" | "actual") {
  return rows
    .filter((r) => r.section === section)
    .reduce((sum, r) => sum + (field === "budget" ? r.budget : r.actual), 0);
}

export function grandTotal(rows: BudgetRow[], field: "budget" | "actual") {
  return rows.reduce((sum, r) => sum + (field === "budget" ? r.budget : r.actual), 0);
}

export function budgetToCsv(rows: BudgetRow[], meta: BuildBudgetInput): string {
  const lines: string[] = [];
  lines.push(`${csvCell(meta.projectTitle || meta.client)},,,,`);
  lines.push("Video Budget,,,,");
  lines.push(`${csvCell(`DIRECTED BY ${meta.directedBy}`)},,,${csvCell(`PRODUCED BY ${meta.producedBy}`)},`);
  lines.push("");
  lines.push("Production,Unit,Rate,Budget,Actual / Additional,Notes");

  for (const section of BUDGET_SECTIONS) {
    const sectionRows = rows.filter((r) => r.section === section.id);
    if (sectionRows.length === 0) continue;

    lines.push(`${csvCell(section.label)},,,,,`);
    for (const r of sectionRows) {
      lines.push(
        [
          csvCell(r.item),
          csvCell(r.unit),
          csvCell(money(r.rate)),
          csvCell(money(r.budget)),
          csvCell(money(r.actual)),
          csvCell(r.notes),
        ].join(","),
      );
    }
    lines.push(
      [
        "TOTAL",
        "",
        "",
        csvCell(money(sectionTotal(rows, section.id, "budget"))),
        csvCell(money(sectionTotal(rows, section.id, "actual"))),
        "",
      ].join(","),
    );
    lines.push("");
  }

  lines.push(
    [
      "GRAND TOTAL",
      "",
      "",
      csvCell(money(grandTotal(rows, "budget"))),
      csvCell(money(grandTotal(rows, "actual"))),
      "",
    ].join(","),
  );
  return lines.join("\n");
}

export function budgetToTsv(rows: BudgetRow[], meta: BuildBudgetInput): string {
  return budgetToCsv(rows, meta).replace(/,/g, "\t");
}

export interface BudgetSheetPayload {
  title: string;
  values: (string | number)[][];
  sectionHeaderRows: number[];
  totalRows: number[];
  grandTotalRow: number;
}

/** 2D grid for Google Sheets API (row/col are 0-indexed in returned metadata). */
export function buildBudgetSheetPayload(rows: BudgetRow[], meta: BuildBudgetInput): BudgetSheetPayload {
  const title = `${meta.projectTitle || meta.client || "Production"} Video Budget`;
  const values: (string | number)[][] = [
    [meta.projectTitle || meta.client || "Production", "", "", "", "", ""],
    ["Video Budget", "", "", "", "", ""],
    [`DIRECTED BY ${meta.directedBy}`, "", "", "", `PRODUCED BY ${meta.producedBy}`, ""],
    [],
    ["Production", "Unit", "Rate", "Budget", "Actual / Additional", "Notes"],
  ];
  const sectionHeaderRows: number[] = [];
  const totalRows: number[] = [];

  for (const section of BUDGET_SECTIONS) {
    const sectionRows = rows.filter((r) => r.section === section.id);
    if (sectionRows.length === 0) continue;

    sectionHeaderRows.push(values.length);
    values.push([section.label, "", "", "", "", ""]);

    for (const r of sectionRows) {
      values.push([r.item, r.unit, r.rate, r.budget, r.actual, r.notes]);
    }

    totalRows.push(values.length);
    values.push([
      "TOTAL",
      "",
      "",
      sectionTotal(rows, section.id, "budget"),
      sectionTotal(rows, section.id, "actual"),
      "",
    ]);
    values.push([]);
  }

  const grandTotalRow = values.length;
  values.push([
    "GRAND TOTAL",
    "",
    "",
    grandTotal(rows, "budget"),
    grandTotal(rows, "actual"),
    "",
  ]);

  return { title, values, sectionHeaderRows, totalRows, grandTotalRow };
}

export function downloadBudgetCsv(rows: BudgetRow[], meta: BuildBudgetInput) {
  const csv = budgetToCsv(rows, meta);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const slug = (meta.projectTitle || meta.client || "production")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${slug || "video"}-budget.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function openGoogleSheetsImportHint(): string {
  return "https://docs.google.com/spreadsheets/create";
}
