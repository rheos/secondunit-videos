// The camera, measured without a browser. The measuring is the kit's (tools/devweb-kit/camera-check.mjs); this
// episode's props are in camera-set.mjs. check-graybox.mjs asserts on what this returns.
//   node camera-check.mjs            the summary and every rule
//   node camera-check.mjs --table    a row every 0.1 s (subject, Blink's visor and body, each overlay on screen)
//   node camera-check.mjs --moves    one row per camera move
import { dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { loadEpisode, cameraReport as report, printTable, printMoves, printMotion, printRules } from "../tools/devweb-kit/camera-check.mjs";
import * as SET from "./camera-set.mjs";

export const { BOX, SUBJECTS } = SET;
export const cameraReport = (root, KEYS, VO) => report(root, KEYS, VO, SET);

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const root = dirname(fileURLToPath(import.meta.url));
  const { VO, KEYS } = await loadEpisode(root);
  const R = await cameraReport(root, KEYS, VO);
  if (process.argv.includes("--table")) printTable(R, SET);
  if (process.argv.includes("--moves")) printMoves(R);
  printMotion(R);
  console.log(`note bottom at most ${R.noteLow.toFixed(0)} (at ${R.noteAt.toFixed(2)}); overlays at least ${R.ovEdge.toFixed(0)} px from an edge or the lockup`);
  console.log(`strip clears the sprout by ${R.sproutGap.toFixed(0)} px (worst at ${R.sproutAt.toFixed(2)})`);
  console.log(`widest empty frame at rest ${(100 * R.emptyMax).toFixed(0)} % (at ${R.emptyAt.toFixed(2)})`);
  printRules([["strip end", R.stripCut], ["subject centre", R.ruleCentre], ["empty width", R.ruleEmpty], ["border", R.border], ["note", R.ruleNote], ["rule 1", R.rule1], ["rule 3", R.rule3], ["rule 4", R.rule4], ["rule 5", R.rule5]]);
}
