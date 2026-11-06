// The camera, measured without a browser. Copy to <project>/camera-check.mjs beside camera-set.mjs.
//   node camera-check.mjs            the summary and every rule
//   node camera-check.mjs --table    a row every 0.1 s (subject, Blink's visor and body, each overlay on screen)
//   node camera-check.mjs --moves    one row per camera move (this is the supervisor's motion.txt)
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
  console.log(`first camera move at ${R.firstMove.toFixed(2)} s; overlays at least ${R.ovEdge.toFixed(0)} px from an edge or the lockup`);
  console.log(`widest empty frame at rest ${(100 * R.emptyMax).toFixed(0)} % (at ${R.emptyAt.toFixed(2)})`);
  // add this episode's own lists (from camera-set.mjs extras) to this one
  printRules([["subject centre", R.ruleCentre], ["empty width", R.ruleEmpty], ["border", R.border], ["rule 1", R.rule1], ["rule 3", R.rule3], ["rule 4", R.rule4], ["rule 5", R.rule5]]);
}
