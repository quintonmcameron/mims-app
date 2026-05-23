#!/usr/bin/env node
/**
 * Generates docs/MIMS-Role-Day-Rates.pdf from lib/mims/role-catalog.ts
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import PDFDocument from "pdfkit";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const catalogPath = path.join(root, "lib", "mims", "role-catalog.ts");
const outDir = path.join(root, "docs");
const outPath = path.join(outDir, "MIMS-Role-Day-Rates.pdf");

const src = fs.readFileSync(catalogPath, "utf8");
const rates = {};
for (const m of src.matchAll(/"([^"]+)":\s*(\d+)/g)) rates[m[1]] = +m[2];
for (const m of src.matchAll(/^\s+([A-Za-z][A-Za-z &']*?):\s*(\d+),?\s*$/gm)) {
  if (!rates[m[1]]) rates[m[1]] = +m[2];
}

const sorted = Object.entries(rates).sort((a, b) => a[0].localeCompare(b[0]));
const fmt = (n) => `$${n.toLocaleString("en-US")}`;
const la = (v) => Math.round((v * 1.25) / 25) * 25;

const groups = [
  {
    title: "Direction & producing",
    match: /^(Director|Co-Director|2nd Unit Director|Producer|Line Producer|Executive Producer|Associate Producer|Creative Producer|Experiential Producer|Event Producer|Post Producer|Supervising Producer|Unit Production Manager|1st AD|2nd AD|3rd AD|4th AD|ADA|2nd Unit 1st AD|2nd Unit 2nd AD|AD)$/,
  },
  {
    title: "Camera & DP",
    match: /^(Director of Photography|2nd Unit DP|Camera Operator|B Camera Operator|Steadicam Operator|Trinity Operator|Technocrane Operator|Drone Operator|FPV Drone Pilot|Aerial Cinematographer|Underwater Camera Operator|Videographer|Additional Photography|Photographer|BTS Photographer|BTS Videographer)$/,
  },
  {
    title: "Camera department",
    match: /^(1st AC|2nd AC|2nd 2nd AC|B Cam 1st AC|B Cam 2nd AC|2nd Unit 1st AC|2nd Unit 2nd AC|Film Loader|Digitech|DIT|Data Manager|VTR|Remote Head Tech|Focus Puller)$/,
  },
  {
    title: "Electric & lighting",
    match: /^(Gaffer|Best Boy Electric|Electric|Lighting Tech|Set Lighting Technician|Chief Lighting Technician|Lighting Designer|Lighting Director|Dimmer Board Operator|DMX Technician|Jib Crane Tech|Underwater Lighting Tech|2nd Unit Electric|2nd Unit Gaffer|Rigging)/,
  },
  {
    title: "Grip",
    match: /^(Key Grip|Best Boy Grip|Grip|Dolly Grip|Rig AC|Crane Operator|Jib Operator|Jib Tech|Gimbal Operator|Underwater Grip|2nd Unit Grip|Grip Assistant|Rigging Grip|Rigging Key Grip)$/,
  },
  {
    title: "Sound",
    match: /^(Sound Mixer|Boom Operator|Utility Sound Tech|Audio Engineer|Post Sound Mixer|Foley Artist|Sound Designer|Composer|Music Supervisor)/,
  },
  {
    title: "Art & wardrobe",
    match: /^(Production Designer|Art Director|Set Designer|Set Decorator|Set Dresser|Prop Master|Prop Stylist|Costume Designer|Hair & Makeup Artist|Stylist|SFX Makeup)/,
  },
  {
    title: "Post & VFX",
    match: /^(Editor|Assistant Editor|Colorist|Color Assistant|Compositor|VFX Artist|VFX Supervisor|Finishing Artist|Live Editor|Post Supervisor|Animation Supervisor|Lead Compositor)$/,
  },
  {
    title: "Design & digital",
    match: /^(Motion Designer|Graphic Designer|UI\/UX Designer|Web Designer|Web Developer|3D Artist|CG Artist|AI Artist|Copywriter|Creative Director|Designer|Digital Designer)$/,
  },
  {
    title: "PA & support",
    match: /^(PA|Office PA|Truck PA|Production Assistant|Production Coordinator|Script Supervisor|Location Manager)$/,
  },
];

const assigned = new Set();
const sections = [];
for (const g of groups) {
  const items = Object.entries(rates)
    .filter(([r]) => g.match.test(r))
    .sort((a, b) => b[1] - a[1]);
  items.forEach(([r]) => assigned.add(r));
  if (items.length) sections.push({ title: g.title, items });
}
const other = Object.entries(rates)
  .filter(([r]) => !assigned.has(r))
  .sort((a, b) => a[0].localeCompare(b[0]));
if (other.length) sections.push({ title: "All other roles", items: other });

fs.mkdirSync(outDir, { recursive: true });

const doc = new PDFDocument({ margin: 50, size: "LETTER" });
const stream = fs.createWriteStream(outPath);
doc.pipe(stream);

const brand = "#0f172a";
const muted = "#64748b";
const line = "#e2e8f0";

function heading(text, size = 14) {
  doc.fillColor(brand).font("Helvetica-Bold").fontSize(size).text(text, { continued: false });
  doc.moveDown(0.35);
}

function body(text, opts = {}) {
  doc.fillColor(muted).font("Helvetica").fontSize(9).text(text, { lineGap: 2, ...opts });
}

function tableHeader() {
  const y = doc.y;
  doc.fillColor("#f8fafc").rect(50, y, 512, 18).fill();
  doc.fillColor(brand).font("Helvetica-Bold").fontSize(8);
  doc.text("Role", 54, y + 5, { width: 280 });
  doc.text("Base", 340, y + 5, { width: 70, align: "right" });
  doc.text("LA expert", 420, y + 5, { width: 130, align: "right" });
  doc.y = y + 22;
}

function tableRow(role, base, laRate, odd) {
  const rowH = 14;
  let y = doc.y;
  if (y > 720) {
    doc.addPage();
    y = 50;
    doc.y = y;
    tableHeader();
    y = doc.y;
  }
  if (odd) doc.fillColor("#fafafa").rect(50, y - 2, 512, rowH).fill();
  doc.fillColor(brand).font("Helvetica").fontSize(8);
  doc.text(role, 54, y, { width: 280, lineBreak: false });
  doc.text(fmt(base), 340, y, { width: 70, align: "right", lineBreak: false });
  doc.text(fmt(laRate), 420, y, { width: 130, align: "right", lineBreak: false });
  doc.y = y + rowH;
}

// Cover
doc.fillColor(brand).font("Helvetica-Bold").fontSize(22).text("MIMS Role Day Rates", 50, 80);
doc.moveDown(0.5);
doc.font("Helvetica").fontSize(11).fillColor(muted);
doc.text("Reference catalog for producer review", { lineGap: 4 });
doc.moveDown(1);
body(
  "Source: MIMS curated role catalog (lib/mims/role-catalog.ts). Base = expert-tier anchor (10+ years), non-union, before rush/usage/client multipliers. LA expert = base × 1.25 (Los Angeles / NYC). Experience scales base 60–100%.",
);
doc.moveDown(1);
body("Generated: " + new Date().toLocaleDateString("en-US", { dateStyle: "long" }));
doc.moveDown(1.5);

heading("Quick anchors", 12);
const anchors = [
  ["Director", 1800],
  ["Executive Producer", 1600],
  ["Director of Photography", 1500],
  ["Producer", 1300],
  ["Editor", 900],
  ["1st AC / Gaffer", 650],
  ["PA", 350],
  ["Intern", 300],
];
anchors.forEach(([label, base], i) => tableRow(label, base, la(base), i % 2 === 0));

doc.addPage();
heading("How the app prices labor", 12);
const bullets = [
  "252 searchable production roles; pick role on the deal screen.",
  "Experience: beginner ~60%, mid ~80%, 5–10 yrs ~90%, expert 100%.",
  "Location: LA/NYC ×1.25 on labor.",
  "Rush + usage load day rate (max +50%): rush +25%, fire +50%; paid digital +25%; TV/CTV/OOH +50%.",
  "Unknown role fallbacks: post $850, design $750, dual $900, shoot $650.",
  "Profile trades: Videographer, Video editor, Photographer, Designer, Developer, Writer, Marketing, Consultant, Other.",
];
bullets.forEach((b) => {
  doc.fillColor(brand).font("Helvetica").fontSize(9).text("•  " + b, { indent: 10, lineGap: 3 });
});
doc.moveDown(1);

for (const section of sections) {
  if (doc.y > 640) doc.addPage();
  doc.moveDown(0.5);
  doc.strokeColor(line).moveTo(50, doc.y).lineTo(562, doc.y).stroke();
  doc.moveDown(0.6);
  heading(`${section.title} (${section.items.length})`, 11);
  tableHeader();
  section.items.forEach(([role, base], i) => tableRow(role, base, la(base), i % 2 === 0));
}

doc.addPage();
heading("Complete A–Z index (" + sorted.length + " roles)", 12);
tableHeader();
sorted.forEach(([role, base], i) => tableRow(role, base, la(base), i % 2 === 0));

doc.end();

stream.on("finish", () => {
  console.log("Wrote", outPath);
  console.log("Roles:", sorted.length);
});
