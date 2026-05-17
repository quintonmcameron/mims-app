import fs from "fs";
import path from "path";

const root = path.resolve(import.meta.dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");

const strip = (src) =>
  src
    .replace(/^"use client";\n?/m, "")
    .replace(/^import[\s\S]*?;\n/gm, "")
    .replace(/^export /gm, "");

const css = read("app/mims-prototype.css");
const engine = strip(read("lib/mims/engine.ts"));
const constants = strip(read("components/mims/constants.ts"));
const ui = strip(read("components/mims/ui.tsx"));
const documents = strip(read("components/mims/documents.tsx"));
const extra = strip(read("components/mims/screens-extra.tsx")).replace(
  /^const SCORE_CIRC = [\s\S]*?;\n\n/,
  "",
);

let page = read("components/mims/MimsPrototype.tsx")
  .replace(/^"use client";\n/, "")
  .replace(/^import[\s\S]*?;\n/gm, "")
  .replace(/export default function MimsPrototype/, "export default function Page");

const extraProps = `        <ExtraScreens
          screen={screen}
          screenClass={(id) => screenClass(screen, id)}
          go={go}
          showToast={showToast}
          startNewDeal={startNewDeal}
          dealStep={dealStep}
          deal={deal}
          setDeal={setDeal}
          dealNext={dealNext}
          dealBack={dealBack}
          runAnalysis={runAnalysis}
          intelWhy={intelWhy}
          setIntelWhy={setIntelWhy}
          intelLtv={intelLtv}
          setIntelLtv={setIntelLtv}
          intelRoi={intelRoi}
          setIntelRoi={setIntelRoi}
          intelBudget={intelBudget}
          setIntelBudget={setIntelBudget}
          loadingStep={loadingStep}
          result={result}
          rateDetail={rateDetail}
          score={score}
          scoreOffset={scoreOffset}
          loadSampleDeal={loadSampleDeal}
          displayName={displayName}
          profileRole={profileRole}
        />`;

page = page.replace(/<ExtraScreens[\s\S]*?\/>/, extraProps);
page = page.replace(
  /return \(\s*\n\s*<div className="mims-shell">/,
  `return (
    <>
      <style dangerouslySetInnerHTML={{ __html: MIMS_CSS }} />
      <div className="mims-shell">`,
);
page = page.replace(
  /(<span>\{toastMsg\}<\/span>\s*\n\s*<\/div>\s*\n\s*<\/div>\s*\n\s*)\);/,
  "$1    </>\n  );",
);

const out = `"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

/** All styles in this file — no external CSS. Dynamic layout uses style={{}}. */
const MIMS_CSS = ${JSON.stringify(css)};

${engine}
${constants}
${ui}
${documents}
${extra}
${page}
`;

fs.writeFileSync(path.join(root, "app/page.tsx"), out);
console.log("Wrote app/page.tsx", out.length);
