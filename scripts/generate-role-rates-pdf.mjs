#!/usr/bin/env node
/**
 * Generates producer review docs from lib/mims/role-catalog.ts:
 *   docs/MIMS-Role-Day-Rates.pdf
 *   docs/MIMS-Role-Day-Rates-Producer-Review.txt  (paste into Google Sheets → Docs)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import PDFDocument from "pdfkit";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const catalogPath = path.join(root, "lib", "mims", "role-catalog.ts");
const outDir = path.join(root, "docs");
const pdfPath = path.join(outDir, "MIMS-Role-Day-Rates.pdf");
const tsvPath = path.join(outDir, "MIMS-Role-Day-Rates-Producer-Review.txt");

const src = fs.readFileSync(catalogPath, "utf8");
const rates = {};
for (const m of src.matchAll(/"([^"]+)":\s*(\d+)/g)) rates[m[1]] = +m[2];
for (const m of src.matchAll(/^\s+([A-Za-z][A-Za-z &']*?):\s*(\d+),?\s*$/gm)) {
  if (!rates[m[1]]) rates[m[1]] = +m[2];
}

const sorted = Object.entries(rates).sort((a, b) => a[0].localeCompare(b[0]));
const fmt = (n) => `$${n.toLocaleString("en-US")}`;

function writeProducerReviewTxt() {
  const lines = [
    "MIMS APP ROLES — PRODUCER REVIEW",
    `Generated ${new Date().toLocaleDateString("en-US", { dateStyle: "long" })}`,
    "",
    "Day rate = expert anchor (10+ yrs), non-union, before rush/usage/client adjustments.",
    "",
    "Role\tDay rate",
  ];
  for (const [role, rate] of sorted) {
    lines.push(`${role}\t${rate}`);
  }
  fs.writeFileSync(tsvPath, lines.join("\n"), "utf8");
}

fs.mkdirSync(outDir, { recursive: true });

const doc = new PDFDocument({ margin: 50, size: "LETTER" });
const stream = fs.createWriteStream(pdfPath);
doc.pipe(stream);

const brand = "#0f172a";
const muted = "#64748b";
const margin = 50;
const tableW = 512;

function tableHeader() {
  const y = doc.y;
  doc.fillColor("#f1f5f9").rect(margin, y, tableW, 18).fill();
  doc.fillColor(brand).font("Helvetica-Bold").fontSize(9);
  doc.text("Role", margin + 6, y + 5, { width: 360, lineBreak: false });
  doc.text("Day rate", margin + 380, y + 5, { width: 120, align: "right", lineBreak: false });
  doc.y = y + 22;
}

function tableRow(role, rate, odd) {
  let y = doc.y;
  if (y > 720) {
    doc.addPage();
    y = 50;
    doc.y = y;
    tableHeader();
    y = doc.y;
  }
  const rowH = 15;
  if (odd) doc.fillColor("#fafafa").rect(margin, y - 2, tableW, rowH).fill();
  doc.fillColor(brand).font("Helvetica").fontSize(9);
  doc.text(role, margin + 6, y, { width: 360, lineBreak: false });
  doc.text(fmt(rate), margin + 380, y, { width: 120, align: "right", lineBreak: false });
  doc.y = y + rowH;
}

doc.fillColor(brand).font("Helvetica-Bold").fontSize(22).text("MIMS App Roles", margin, 72);
doc.moveDown(0.4);
doc.font("Helvetica").fontSize(11).fillColor(muted).text("Producer review · day rates in the app");
doc.moveDown(1);
doc.font("Helvetica").fontSize(9).fillColor(muted).text(
  `${sorted.length} roles · Day rate = expert anchor (10+ yrs), non-union, before rush/usage/client adjustments.`,
  { lineGap: 3 },
);
doc.moveDown(0.5);
doc.text(`Generated ${new Date().toLocaleDateString("en-US", { dateStyle: "long" })}`);
doc.moveDown(1.2);

tableHeader();
sorted.forEach(([role, rate], i) => tableRow(role, rate, i % 2 === 0));

doc.end();
writeProducerReviewTxt();

stream.on("finish", () => {
  console.log("Wrote", pdfPath);
  console.log("Wrote", tsvPath);
  console.log("Roles:", sorted.length);
});
