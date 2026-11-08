// Light checks for the gray box: no browser, no render. Run from anywhere: node check-graybox.mjs
// The general checks are the kit's (tools/devweb-kit/check-graybox.mjs: anchors, camera keys, the DP framing rules and
// motion targets, overlays, banned on-screen terms, imports). Below them, what only this episode has: the strip's end,
// the note, the spout clear of Blink's head, the option panels, and the counter never sharing a frame with day 53 or
// the core's light.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { checkGraybox, verdict } from "../tools/devweb-kit/check-graybox.mjs";
import * as SET from "./camera-set.mjs";

const root = dirname(fileURLToPath(import.meta.url));
const G = await checkGraybox(root, SET, {
  end: 79.35,
  banned: /\b(mode|optional|fts|vector|hybrid|query|param|argument|request log)\b/i,
  noRed: true,
  noHarness: true,
});
const { check, fails, CAM, TL, T, KEYS, END, OV } = G;
const { counterUp, dayLit, coreGlow } = TL;

// ---------- the frame: this episode's own measures (camera-set.mjs extras) ----------
check(CAM.stripCut.length === 0, `the strip's day 53 end is sliced by the frame: ${CAM.stripCut.join("; ")}`);
check(CAM.ruleNote.length === 0, `the note sinks into the bottom chrome: ${CAM.ruleNote.join("; ")}`);
check(CAM.spoutGap >= 20, `the spout's mouth comes within ${CAM.spoutGap.toFixed(0)} px of Blink's head at ${CAM.spoutAt.toFixed(2)}`);
check(CAM.sproutIn <= 0, `Blink's sprout crosses the spout's opening by ${CAM.sproutIn.toFixed(0)} px at ${CAM.sproutAt.toFixed(2)}`);
check(!/lean: -/.test(readFileSync(join(root, "stations/mark.js"), "utf8")), "mark.js leans Blink left, which the bounds check doesn't cover");
// the option panels: a clear gap with the "or" in it
const pv = Object.fromEntries([...readFileSync(join(root, "stations/panels.js"), "utf8").match(/export const PANEL_W[^;]+/)[0].replace("export const ", "").matchAll(/(\w+) = ([-\d.]+)/g)].map((m) => [m[1], +m[2]]));
const gap = pv.R_X - pv.L_X - pv.PANEL_W;
check(gap >= 0.4 + 0.15, `option panels only ${gap.toFixed(2)} apart for a 0.4-wide "or"`);
check(pv.OR_X - 0.2 >= pv.L_X + pv.PANEL_W / 2 + 0.05 && pv.OR_X + 0.2 <= pv.R_X - pv.PANEL_W / 2 - 0.05, `"or" doesn't sit clear inside the gap`);

// ---------- facts on screen ----------
// the counter never shares a frame with day 53 or the core's light
let shared = 0;
for (let t = 0; t <= END; t += 1 / 240) if (counterUp(t) > 0 && (dayLit(t) || coreGlow(t) > 0)) shared++;
check(shared === 0, `the counter shares ${shared} samples with day 53 or the core's light`);
check(coreGlow(T.h19 + 1.85) > 0.9 && coreGlow(T.h19 - 0.5) === 0, "the core's first light isn't on hold 19"); // CORE_LIT 53.3, full by 53.75

const moves = CAM.moves.filter((m) => m.kind === "move");
console.log(`${G.anchors} anchors, ${KEYS.length} camera keys (${moves.length} moves), film ${END} s`);
console.log(`camera: moving ${(100 * CAM.moving).toFixed(1)} % of frames, drifting ${(100 * CAM.drift).toFixed(1)} %, longest dead hold ${(CAM.longestHold / 60).toFixed(2)} s, longest without a move ${(CAM.longestStill / 60).toFixed(2)} s, first move ${CAM.firstMove.toFixed(2)} s`);
console.log(`Blink: visor whole in shot ${(100 * CAM.inShot).toFixed(1)} %, longest absence ${CAM.gapMax.toFixed(2)} s; slices in passing ${CAM.slices.length}, at rest ${CAM.rule1.length}; panel gap ${gap.toFixed(2)}`);
console.log(`spout clears Blink's head by ${CAM.spoutGap.toFixed(0)} px (worst at ${CAM.spoutAt.toFixed(2)}), sprout at rest ${CAM.sproutIn.toFixed(0)} px into the opening (${CAM.sproutLeanIn.toFixed(0)} with a full lean); overlays: ${OV.length}, smallest side margin ${G.minMargin.toFixed(0)} px, collisions ${CAM.rule4.length}; counter/day-53/core shared samples ${shared}`);
verdict(fails);
