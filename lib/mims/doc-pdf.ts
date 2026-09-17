import { DOC_EXPORT_DISCLAIMER } from "@/lib/mims/legal";

export type InvoicePdfLine = {
  item: string;
  qty: string;
  rate: number;
  amount: number;
};

export type InvoicePdfInput = {
  creator: string;
  creatorEmail: string;
  invoiceNumber: string;
  billedToName: string;
  billedToContact: string;
  billedToEmail: string;
  issuedLabel: string;
  dueLabel: string;
  depositPercent: string;
  depositDueLabel: string;
  paymentNote: string;
  lines: InvoicePdfLine[];
};

export type SowPdfRole = {
  label: string;
  note: string;
};

export type SowPdfLine = {
  description: string;
  amount: number;
};

export type SowPdfInput = {
  creator: string;
  client: string;
  version: string;
  docDateLabel: string;
  projectDescription: string;
  roles: SowPdfRole[];
  lineItems: SowPdfLine[];
  usageRights: string;
  revisions: string;
  totalLabel: string;
  depositLabel: string;
  paymentSchedule: string;
  cancellation: string;
};

function fmtMoney(n: number): string {
  const hasCents = Math.round(n * 100) % 100 !== 0;
  return `$${n.toLocaleString("en-US", {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "document"
  );
}

function downloadBytes(bytes: Uint8Array, filename: string) {
  const copy = Uint8Array.from(bytes);
  const blob = new Blob([copy], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function wrapText(
  text: string,
  font: { widthOfTextAtSize: (t: string, size: number) => number },
  size: number,
  maxWidth: number,
): string[] {
  const paragraphs = (text || "—").replace(/\r\n/g, "\n").split("\n");
  const lines: string[] = [];
  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) {
      lines.push("");
      continue;
    }
    const words = paragraph.split(/\s+/);
    let current = "";
    for (const word of words) {
      const next = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(next, size) <= maxWidth) {
        current = next;
      } else {
        if (current) lines.push(current);
        current = word;
      }
    }
    if (current) lines.push(current);
  }
  return lines.length > 0 ? lines : ["—"];
}

type PdfCtx = {
  doc: import("pdf-lib").PDFDocument;
  page: import("pdf-lib").PDFPage;
  font: import("pdf-lib").PDFFont;
  bold: import("pdf-lib").PDFFont;
  rgb: typeof import("pdf-lib").rgb;
  y: number;
  margin: number;
  width: number;
  height: number;
};

async function createDoc(): Promise<Omit<PdfCtx, "page" | "y" | "margin" | "width" | "height">> {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  return { doc, font, bold, rgb };
}

function ensureSpace(ctx: PdfCtx, needed: number) {
  if (ctx.y - needed >= ctx.margin) return;
  ctx.page = ctx.doc.addPage([ctx.width, ctx.height]);
  ctx.y = ctx.height - ctx.margin;
}

function drawText(
  ctx: PdfCtx,
  text: string,
  opts: {
    size?: number;
    bold?: boolean;
    color?: ReturnType<typeof import("pdf-lib").rgb>;
    x?: number;
    maxWidth?: number;
    lineHeight?: number;
  } = {},
) {
  const size = opts.size ?? 10;
  const font = opts.bold ? ctx.bold : ctx.font;
  const color = opts.color ?? ctx.rgb(0.1, 0.1, 0.12);
  const x = opts.x ?? ctx.margin;
  const maxWidth = opts.maxWidth ?? ctx.width - ctx.margin * 2;
  const lineHeight = opts.lineHeight ?? size + 4;
  const lines = wrapText(text, font, size, maxWidth);
  for (const line of lines) {
    ensureSpace(ctx, lineHeight);
    ctx.page.drawText(line || " ", {
      x,
      y: ctx.y - size,
      size,
      font,
      color,
      maxWidth,
    });
    ctx.y -= lineHeight;
  }
}

function drawRule(ctx: PdfCtx) {
  ensureSpace(ctx, 12);
  ctx.page.drawLine({
    start: { x: ctx.margin, y: ctx.y },
    end: { x: ctx.width - ctx.margin, y: ctx.y },
    thickness: 0.75,
    color: ctx.rgb(0.82, 0.82, 0.84),
  });
  ctx.y -= 12;
}

function drawSectionTitle(ctx: PdfCtx, title: string) {
  ctx.y -= 4;
  drawText(ctx, title, { size: 11, bold: true });
  ctx.y -= 2;
}

function drawFooterDisclaimer(ctx: PdfCtx, label: string, freelancerName: string) {
  ensureSpace(ctx, 70);
  ctx.y -= 8;
  drawRule(ctx);
  drawText(ctx, `${label}${freelancerName ? ` · Prepared by ${freelancerName}` : ""} — NOT LEGAL ADVICE`, {
    size: 8,
    bold: true,
    color: ctx.rgb(0.35, 0.35, 0.38),
  });
  drawText(ctx, DOC_EXPORT_DISCLAIMER, {
    size: 7.5,
    color: ctx.rgb(0.45, 0.45, 0.48),
    lineHeight: 10,
  });
}

export async function downloadInvoicePdf(input: InvoicePdfInput): Promise<void> {
  const created = await createDoc();
  const margin = 48;
  const width = 612;
  const height = 792;
  const page = created.doc.addPage([width, height]);
  const ctx: PdfCtx = {
    ...created,
    page,
    y: height - margin,
    margin,
    width,
    height,
  };

  const subtotal = input.lines.reduce((sum, line) => sum + line.amount, 0);
  const depositPercentRaw = input.depositPercent.trim();
  const depositPercent = depositPercentRaw
    ? Math.max(0, Math.min(100, parseFloat(depositPercentRaw) || 0))
    : null;
  const deposit =
    depositPercent != null ? Math.round(subtotal * (depositPercent / 100) * 100) / 100 : null;

  drawText(ctx, "INVOICE", { size: 20, bold: true });
  drawText(ctx, `#${input.invoiceNumber || "MIMS-DRAFT"}`, {
    size: 10,
    color: ctx.rgb(0.4, 0.4, 0.45),
  });
  ctx.y -= 6;

  const rightX = width / 2 + 8;
  const topY = ctx.y;
  drawText(ctx, "Billed to", { size: 8, bold: true, color: ctx.rgb(0.45, 0.45, 0.48) });
  drawText(ctx, input.billedToName || "Client name", { size: 11, bold: true });
  drawText(ctx, input.billedToContact || "Accounts Payable", {
    size: 9,
    color: ctx.rgb(0.4, 0.4, 0.45),
  });
  drawText(ctx, input.billedToEmail || "billing@example.com", {
    size: 9,
    color: ctx.rgb(0.4, 0.4, 0.45),
  });
  const afterLeft = ctx.y;

  ctx.y = topY;
  drawText(ctx, input.creator || "Your Studio", {
    size: 11,
    bold: true,
    x: rightX,
    maxWidth: width - margin - rightX,
  });
  drawText(ctx, input.creatorEmail || "", {
    size: 9,
    color: ctx.rgb(0.4, 0.4, 0.45),
    x: rightX,
    maxWidth: width - margin - rightX,
  });
  drawText(ctx, `Issued  ${input.issuedLabel || "—"}`, {
    size: 9,
    x: rightX,
    maxWidth: width - margin - rightX,
  });
  drawText(ctx, `Due  ${input.dueLabel || "—"}`, {
    size: 9,
    x: rightX,
    maxWidth: width - margin - rightX,
  });
  if (input.depositDueLabel) {
    drawText(ctx, `Deposit due  ${input.depositDueLabel}`, {
      size: 9,
      x: rightX,
      maxWidth: width - margin - rightX,
    });
  }
  ctx.y = Math.min(afterLeft, ctx.y) - 10;
  drawRule(ctx);

  // Table header
  ensureSpace(ctx, 20);
  const colItem = ctx.margin;
  const colQty = width - margin - 180;
  const colRate = width - margin - 110;
  const colAmt = width - margin - 50;
  ctx.page.drawText("Item", { x: colItem, y: ctx.y - 9, size: 8, font: ctx.bold, color: ctx.rgb(0.4, 0.4, 0.45) });
  ctx.page.drawText("Qty", { x: colQty, y: ctx.y - 9, size: 8, font: ctx.bold, color: ctx.rgb(0.4, 0.4, 0.45) });
  ctx.page.drawText("Rate", { x: colRate, y: ctx.y - 9, size: 8, font: ctx.bold, color: ctx.rgb(0.4, 0.4, 0.45) });
  ctx.page.drawText("Amount", { x: colAmt, y: ctx.y - 9, size: 8, font: ctx.bold, color: ctx.rgb(0.4, 0.4, 0.45) });
  ctx.y -= 16;
  drawRule(ctx);

  for (const line of input.lines) {
    const itemLines = wrapText(line.item, ctx.font, 9, colQty - colItem - 8);
    const rowH = Math.max(14, itemLines.length * 12);
    ensureSpace(ctx, rowH + 4);
    let ty = ctx.y - 9;
    for (const il of itemLines) {
      ctx.page.drawText(il, { x: colItem, y: ty, size: 9, font: ctx.font, color: ctx.rgb(0.12, 0.12, 0.14) });
      ty -= 12;
    }
    ctx.page.drawText(line.qty, { x: colQty, y: ctx.y - 9, size: 9, font: ctx.font });
    ctx.page.drawText(fmtMoney(Math.round(line.rate)), { x: colRate, y: ctx.y - 9, size: 9, font: ctx.font });
    ctx.page.drawText(fmtMoney(Math.round(line.amount)), { x: colAmt, y: ctx.y - 9, size: 9, font: ctx.font });
    ctx.y -= rowH + 2;
  }

  ctx.y -= 6;
  drawRule(ctx);
  drawText(ctx, `Subtotal          ${fmtMoney(Math.round(subtotal))}`, { size: 10 });
  if (deposit != null && depositPercent != null) {
    const dueNote = input.depositDueLabel ? `due ${input.depositDueLabel}` : "due now";
    drawText(ctx, `${depositPercent}% deposit (${dueNote})          ${fmtMoney(deposit)}`, { size: 10 });
  }
  drawText(ctx, `Total due          ${fmtMoney(Math.round(subtotal))}`, { size: 12, bold: true });
  ctx.y -= 6;
  drawText(ctx, input.paymentNote.trim() || "—", {
    size: 9,
    color: ctx.rgb(0.4, 0.4, 0.45),
  });

  drawFooterDisclaimer(ctx, "Invoice draft", input.creator);

  const bytes = await ctx.doc.save();
  const slug = slugify(input.billedToName || input.invoiceNumber || "invoice");
  downloadBytes(bytes, `${slug}-invoice.pdf`);
}

export async function downloadSowPdf(input: SowPdfInput): Promise<void> {
  const created = await createDoc();
  const margin = 48;
  const width = 612;
  const height = 792;
  const page = created.doc.addPage([width, height]);
  const ctx: PdfCtx = {
    ...created,
    page,
    y: height - margin,
    margin,
    width,
    height,
  };

  drawText(ctx, "SCOPE OF WORK", { size: 20, bold: true });
  drawText(ctx, `${input.creator || "Your Studio"} × ${input.client || "Client"}`, {
    size: 10,
    color: ctx.rgb(0.4, 0.4, 0.45),
  });
  drawText(ctx, `v${input.version || "1.0"} · ${input.docDateLabel}`, {
    size: 9,
    color: ctx.rgb(0.45, 0.45, 0.48),
  });
  ctx.y -= 6;
  drawRule(ctx);

  drawSectionTitle(ctx, "Project");
  drawText(ctx, input.projectDescription || "—", { size: 10, color: ctx.rgb(0.25, 0.25, 0.28) });

  if (input.roles.length > 0) {
    drawSectionTitle(ctx, "Positions & Roles");
    for (const role of input.roles) {
      drawText(ctx, `${role.label} — ${role.note}`, { size: 10 });
    }
  }

  if (input.lineItems.length > 0) {
    drawSectionTitle(ctx, "Line Items");
    for (const line of input.lineItems) {
      const amount = fmtMoney(Math.round(line.amount));
      const descWidth = width - margin * 2 - 80;
      const descLines = wrapText(line.description, ctx.font, 10, descWidth);
      ensureSpace(ctx, descLines.length * 13 + 2);
      let ty = ctx.y - 10;
      for (const dl of descLines) {
        ctx.page.drawText(dl, {
          x: ctx.margin,
          y: ty,
          size: 10,
          font: ctx.font,
          color: ctx.rgb(0.12, 0.12, 0.14),
        });
        ty -= 13;
      }
      ctx.page.drawText(amount, {
        x: width - margin - 70,
        y: ctx.y - 10,
        size: 10,
        font: ctx.bold,
      });
      ctx.y -= descLines.length * 13 + 2;
    }
  }

  drawSectionTitle(ctx, "Usage rights");
  drawText(ctx, input.usageRights || "—", { size: 10, color: ctx.rgb(0.25, 0.25, 0.28) });

  drawSectionTitle(ctx, "Revisions");
  drawText(ctx, input.revisions || "—", { size: 10, color: ctx.rgb(0.25, 0.25, 0.28) });

  drawSectionTitle(ctx, "Investment");
  drawText(ctx, `Total  ${input.totalLabel}`, { size: 12, bold: true });
  if (input.depositLabel) {
    drawText(ctx, input.depositLabel, { size: 10 });
  }
  drawText(ctx, input.paymentSchedule || "—", {
    size: 9,
    color: ctx.rgb(0.4, 0.4, 0.45),
  });

  drawSectionTitle(ctx, "Cancellation");
  drawText(ctx, input.cancellation || "—", { size: 10, color: ctx.rgb(0.25, 0.25, 0.28) });

  drawFooterDisclaimer(ctx, "Scope of work draft", input.creator);

  const bytes = await ctx.doc.save();
  const slug = slugify(`${input.creator}-${input.client}` || "scope-of-work");
  downloadBytes(bytes, `${slug}-scope-of-work.pdf`);
}
