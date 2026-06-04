#!/usr/bin/env node
/**
 * Fillable launch checklist for MIMS / Petty Apartment LLC.
 * Output: docs/MIMS-Launch-Checklist.pdf
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outPath = path.join(root, "docs", "MIMS-Launch-Checklist.pdf");

const SECTIONS = [
  {
    title: "1. Business — Petty Apartment LLC",
    items: [
      "Form LLC (California, or DE + foreign qualify in CA if attorney recommends)",
      "Obtain EIN from IRS (free online)",
      "Designate registered agent + business mailing address (not personal apartment)",
      "Open LLC bank account in Petty Apartment LLC name",
      "File DBA / fictitious business name for “MIMS” if attorney recommends",
      "Budget California $800 franchise tax (confirm first-year rules with CPA/attorney)",
    ],
  },
  {
    title: "2. Legal — attorney review",
    items: [
      "Hire CA business / technology transactions attorney (SaaS, subscriptions, CCPA)",
      "Attorney reviews Terms of Service (/terms) — arbitration, liability, generated docs",
      "Attorney reviews Privacy Policy (/privacy) — Vercel Analytics, future Stripe",
      "Attorney reviews auto-renewal disclosure (CA Automatic Renewal Law)",
      "Update lib/mims/legal.ts: COMPANY_MAILING_ADDRESS + exact LLC name",
      "Sign vendor DPAs: Vercel, Stripe (+ others when enabled)",
      "Written refund / chargeback policy (1 page internal)",
    ],
  },
  {
    title: "3. Payments — Stripe",
    items: [
      "Stripe account under Petty Apartment LLC (descriptor can say MIMS)",
      "Create $10/month recurring Price in Stripe Dashboard",
      "Add Vercel env: STRIPE_SECRET_KEY, STRIPE_PRICE_ID, NEXT_PUBLIC_APP_URL",
      "Test checkout in Stripe test mode end-to-end",
      "Switch Stripe to live mode when ready",
      "Set BILLING_ENFORCEMENT_ENABLED = true in lib/mims/billing.ts",
    ],
  },
  {
    title: "4. Product — MIMS app",
    items: [
      "Confirm /terms and /privacy render on production URL",
      "Test first-use consent modal + re-accept when LEGAL_VERSION changes",
      "Verify auto-renewal text appears above Subscribe button",
      "Confirm 2 free deals, then paywall (after enforcement enabled)",
      "Optional: Stripe Customer Portal for cancel / manage billing",
    ],
  },
  {
    title: "5. Tax & bookkeeping",
    items: [
      "CPA or accountant for LLC + SaaS subscriptions",
      "Run all MIMS revenue and expenses through LLC bank account only",
      "Understand sales tax / CA obligations for your price point",
    ],
  },
];

const NOTES_LABELS = [
  "Attorney name / contact:",
  "LLC filing date:",
  "Stripe live date:",
  "Other notes:",
];

async function main() {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle("MIMS Launch Checklist");
  pdfDoc.setAuthor("MIMS / Petty Apartment LLC");
  pdfDoc.setSubject("Pre-revenue and paid-launch to-do list");

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 50;
  const lineHeight = 14;
  const checkSize = 12;
  const checkGap = 6;

  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;
  const form = pdfDoc.getForm();
  let fieldIndex = 0;

  const drawText = (text, opts = {}) => {
    const size = opts.size ?? 11;
    const bold = opts.bold ?? false;
    const color = opts.color ?? rgb(0.1, 0.1, 0.12);
    const maxWidth = pageWidth - margin * 2;
    const f = bold ? fontBold : font;

    if (opts.newPageIfNeeded !== false && y < margin + 40) {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    }

    const words = text.split(" ");
    let line = "";
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (f.widthOfTextAtSize(test, size) > maxWidth && line) {
        page.drawText(line, { x: margin, y, size, font: f, color });
        y -= lineHeight;
        line = word;
        if (y < margin + 40) {
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          y = pageHeight - margin;
        }
      } else {
        line = test;
      }
    }
    if (line) {
      page.drawText(line, { x: margin, y, size, font: f, color });
      y -= lineHeight;
    }
  };

  drawText("MIMS Launch Checklist", { size: 20, bold: true });
  y -= 4;
  drawText("Petty Apartment LLC · Product: MIMS", { size: 11, color: rgb(0.35, 0.35, 0.4) });
  y -= 2;
  drawText(
    `Generated ${new Date().toLocaleDateString("en-US", { dateStyle: "long" })} · Check boxes in Preview, Adobe Acrobat, or any PDF reader with forms.`,
    { size: 9, color: rgb(0.45, 0.45, 0.5) },
  );
  y -= 10;
  drawText(
    "Not legal advice. Have a California SaaS attorney review documents before charging customers.",
    { size: 9, color: rgb(0.5, 0.35, 0.2) },
  );
  y -= 16;

  for (const section of SECTIONS) {
    if (y < margin + 120) {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    }
    drawText(section.title, { size: 13, bold: true });
    y -= 6;

    for (const item of section.items) {
      if (y < margin + 50) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin;
      }

      const fieldName = `todo_${fieldIndex++}`;
      const box = form.createCheckBox(fieldName);
      box.addToPage(page, {
        x: margin,
        y: y - 2,
        width: checkSize,
        height: checkSize,
      });

      const textX = margin + checkSize + checkGap;
      const maxWidth = pageWidth - margin - textX;
      const words = item.split(" ");
      let line = "";
      let firstLine = true;
      const f = font;
      const size = 10;

      const flushLine = (textLine) => {
        if (y < margin + 30) {
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          y = pageHeight - margin;
          if (firstLine) {
            box.addToPage(page, {
              x: margin,
              y: y - 2,
              width: checkSize,
              height: checkSize,
            });
          }
        }
        page.drawText(textLine, {
          x: firstLine ? textX : margin + checkSize + checkGap,
          y,
          size,
          font: f,
          color: rgb(0.15, 0.15, 0.18),
        });
        y -= lineHeight;
        firstLine = false;
      };

      for (const word of words) {
        const test = line ? `${line} ${word}` : word;
        if (f.widthOfTextAtSize(test, size) > maxWidth && line) {
          flushLine(line);
          line = word;
        } else {
          line = test;
        }
      }
      if (line) flushLine(line);
      y -= 4;
    }
    y -= 8;
  }

  if (y < margin + 180) {
    page = pdfDoc.addPage([pageWidth, pageHeight]);
    y = pageHeight - margin;
  }

  drawText("Your notes (editable fields)", { size: 13, bold: true });
  y -= 10;

  for (const label of NOTES_LABELS) {
    if (y < margin + 60) {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    }
    page.drawText(label, {
      x: margin,
      y,
      size: 10,
      font: fontBold,
      color: rgb(0.2, 0.2, 0.25),
    });
    y -= lineHeight + 2;

    const fieldName = `note_${fieldIndex++}`;
    const textField = form.createTextField(fieldName);
    textField.setText("");
    textField.addToPage(page, {
      x: margin,
      y: y - 18,
      width: pageWidth - margin * 2,
      height: label.includes("Other") ? 48 : 22,
      borderColor: rgb(0.75, 0.75, 0.8),
      backgroundColor: rgb(0.98, 0.98, 0.99),
    });
    y -= label.includes("Other") ? 58 : 32;
  }

  const bytes = await pdfDoc.save();
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, bytes);
  console.log(`Wrote ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
