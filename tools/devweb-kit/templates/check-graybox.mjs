// Light checks for the gray box: no browser, no render. Copy to <project>/check-graybox.mjs. Run: node check-graybox.mjs
// The general checks are the kit's (tools/devweb-kit/check-graybox.mjs). Add this episode's own below them.
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { checkGraybox, printSummary, verdict } from "../tools/devweb-kit/check-graybox.mjs";
import * as SET from "./camera-set.mjs";

const root = dirname(fileURLToPath(import.meta.url));
const G = await checkGraybox(root, SET, {
  // end: 79.35,                       // the film's length once the voice is final
  // banned: /\b(word|another)\b/i,    // words that may not reach the screen in this episode
  noHarness: true,                     // Blink wears the harness only when the film shows it working
});
const { check, fails, CAM } = G;

// ---------- this episode's own checks ----------
// check(CAM.panelLow <= 1700, `the panel sinks to ${CAM.panelLow.toFixed(0)}`);

printSummary(G);
verdict(fails);
