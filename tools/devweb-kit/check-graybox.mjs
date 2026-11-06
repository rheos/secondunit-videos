// Light checks for a devweb gray box: no browser, no render. Built on episode 6.
// Every anchor resolves to a real word occurrence; camera keys are in order and inside the film; the frame (projected by
// camera-check.mjs) meets the DP framing rules and motion targets; overlays have time and margins; no on-screen string
// uses a banned term; imports resolve.
//
// An episode's check-graybox.mjs (copy templates/check-graybox.mjs) calls checkGraybox, adds its own checks with the
// `check` it gets back, prints, and exits 1 on any fail.
//
// What the episode must have: vo/words.json, timeline.js (exports ANCHORS as { name: [word, n, offset, expected time] }
// and T), world.js with its KEYS between `// KEYS-BEGIN` and `// KEYS-END`, overlays.js, parts.js, index.html and
// stations/*.js, each exporting build and update.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { loadEpisode, loadOverlays, cameraReport, textW } from "./camera-check.mjs";

// opts: end (expected film length in s), banned (RegExp of words that may not reach the screen), noRed (the episode
// never uses the failure red), noHarness (Blink wears no harness: Robin, 2026-11-04), moving ([min, max] share of
// frames the camera moves, default 0.27-0.36), fov ([min, max], default 30-40)
export async function checkGraybox(root, SET, opts = {}) {
  const { VO, TL, T, KEYS, END } = await loadEpisode(root);
  const { ANCHORS } = TL;
  const [movMin, movMax] = opts.moving || [0.27, 0.36], [fovMin, fovMax] = opts.fov || [30, 40];

  const fails = [];
  const check = (ok, msg) => { if (!ok) fails.push(msg); };
  if (opts.end != null) check(Math.abs(END - opts.end) < 1e-6, `film end is ${END}, expected ${opts.end}`);

  // ---------- anchors ----------
  for (const [name, [word, n, off, expect]] of Object.entries(ANCHORS)) {
    const t = VO.w(word, n) + off;
    check(Math.abs(t - expect) <= 0.011, `anchor ${name}: ${word}#${n}+${off} = ${t.toFixed(3)}, expected ${expect}`);
    check(t >= 0 && t <= END, `anchor ${name} outside the film`);
  }

  // ---------- camera keys, lifted from world.js as written ----------
  KEYS.forEach((k, i) => {
    check(Math.abs(k[0] - k[4]) <= 0.011, `K${i + 1}: ${k[0].toFixed(3)} is not ${k[4]}`);
    check(i === 0 ? k[0] <= 0 : k[0] >= 0 && k[0] <= END, `K${i + 1} outside the film`);
    check(k[1].concat(k[2]).every(Number.isFinite) && k[3] >= fovMin && k[3] <= fovMax, `K${i + 1}: bad pose or fov`);
    check(k[1][2] > k[2][2] + 2, `K${i + 1}: the camera isn't in front of the set`);
    check(k[5] in SET.SUBJECTS, `K${i + 1}: no subject "${k[5]}"`);
    if (i) check(k[0] > KEYS[i - 1][0], `K${i + 1} out of order`);
  });
  check(KEYS[0][0] <= 0 && KEYS[1][0] > 0 && Math.abs(KEYS[KEYS.length - 1][0] - END) < 1e-6, "keys don't span the film");

  // ---------- the frame, by projection (camera-check.mjs: the kit's io and drift, lookAt, fov) ----------
  // DP framing rules and the look bible's motion targets, measured on every 60 fps frame
  const CAM = await cameraReport(root, KEYS, VO, SET);
  check(CAM.moving >= movMin && CAM.moving <= movMax, `camera moves in ${(100 * CAM.moving).toFixed(1)} % of frames, target about 30 %`);
  check(CAM.firstMove <= 3, `the hook has no camera move in its first 3 s (first at ${CAM.firstMove.toFixed(2)})`);
  check(CAM.longestHold / 60 <= 2.0, `the camera holds dead still for ${(CAM.longestHold / 60).toFixed(2)} s`);
  check(CAM.longestStill / 60 <= 2.5, `no camera move for ${(CAM.longestStill / 60).toFixed(2)} s`);
  for (const m of CAM.moves.filter((m) => m.kind === "move")) {
    check(m.frames >= 20, `move K${m.i + 1}->K${m.i + 2} at ${m.a.toFixed(2)} lasts ${m.frames} f: a snap`);
    check(m.peak <= 70, `move K${m.i + 1}->K${m.i + 2} at ${m.a.toFixed(2)} peaks at ${m.peak.toFixed(0)} px/f`);
  }
  check(CAM.rule1.length === 0, `rule 1, the visor sliced at rest: ${CAM.rule1.join("; ")}`);
  check(CAM.inShot >= 0.75, `rule 2: the visor is whole in shot ${(100 * CAM.inShot).toFixed(1)} % of the film`);
  check(CAM.gapMax <= 6, `rule 2: the visor is out for ${CAM.gapMax.toFixed(2)} s (to ${CAM.gapAt.toFixed(2)})`);
  check(CAM.rule3.length === 0, `rule 3, Blink not whole on its beats: ${CAM.rule3.join("; ")}`);
  check(CAM.rule4.length === 0, `rule 4, overlays: ${CAM.rule4.join("; ")}`);
  check(CAM.ruleCentre.length === 0, `a prop subject sits outside 30-60 % of the frame height: ${CAM.ruleCentre.join("; ")}`);
  check(CAM.ruleEmpty.length === 0, `a resting frame is mostly empty: ${CAM.ruleEmpty.join("; ")}`);
  check(CAM.border.length === 0, `a prop edge sits on a frame edge: ${CAM.border.join("; ")}`);
  check(CAM.ovEdge >= 40, `an overlay phrase sits ${CAM.ovEdge.toFixed(0)} px from a frame edge`);
  check(CAM.rule5.length === 0, `rule 5, subject at an edge: ${CAM.rule5.join("; ")}`);

  // ---------- overlays: where they sit against the picture is rule 4 above; here, their timing and side margins ----------
  const OV = loadOverlays(root, VO);
  let minMargin = 9e9;
  OV.forEach(({ lines, at, gone }, i) => {
    check(gone > at + 0.5, `overlay "${lines[0][0]}" is on for ${(gone - at).toFixed(2)} s`);
    if (i) check(at >= OV[i - 1].gone, `overlay "${lines[0][0]}" lands before "${OV[i - 1].lines[0][0]}" is gone`);
    for (const [s, x, base, size] of lines) {
      const hw = textW(s, size) / 2, margin = Math.min(x - hw, 1080 - x - hw);
      minMargin = Math.min(minMargin, margin);
      check(margin >= 48, `overlay "${s}" has a ${margin.toFixed(0)} px margin`);
      check(base <= 1774 - 24 && base - 0.74 * size >= 60, `overlay "${s}" runs into the lockup or off the top`);
    }
  });

  // ---------- what can reach the screen: every string literal in the stations, overlays, parts and page ----------
  const stationDir = join(root, "stations");
  const stationFiles = readdirSync(stationDir).filter((f) => f.endsWith(".js")).map((f) => join("stations", f));
  const onScreen = [...stationFiles, "overlays.js", "parts.js", "index.html", "world.js"];
  for (const f of onScreen) {
    const text = readFileSync(join(root, f), "utf8").replace(/^\s*\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "").replace(/<!--[\s\S]*?-->/g, "");
    if (opts.banned) for (const m of text.matchAll(/"((?:[^"\\\n]|\\.)*)"|'((?:[^'\\\n]|\\.)*)'|`((?:[^`\\]|\\.)*)`/g)) {
      const s = m[1] ?? m[2] ?? m[3];
      const hit = s.match(opts.banned);
      check(!hit, `${f}: on-screen string uses "${hit && hit[0]}": ${s.slice(0, 60)}`);
    }
    if (opts.noRed) check(!/#e0675a/i.test(text), `${f}: uses the red`);
    if (opts.noHarness) check(!/makeHarness|harness\.|carabiner/i.test(text.replace(/\/\/.*$/gm, "")), `${f}: still builds a harness`);
  }
  // notes and stickers: no quote marks inside the drawn text
  for (const f of stationFiles) for (const m of readFileSync(join(root, f), "utf8").matchAll(/text\(g, "([^"]*)"/g)) check(!/["'‘’“”]/.test(m[1].replace(/'(?=\w)/g, "")), `${f}: quote marks in "${m[1]}"`);

  // ---------- static checks: nothing here runs in a browser, so catch dead names and bad imports now ----------
  const files = ["world.js", "parts.js", ...stationFiles];
  const exportsOf = (file) => {
    const text = readFileSync(file, "utf8"), names = new Set();
    for (const m of text.matchAll(/export (?:async )?function (\w+)/g)) names.add(m[1]);
    for (const line of text.split("\n").filter((l) => l.startsWith("export const"))) for (const m of line.matchAll(/(?:export const|,)\s*(\w+)\s*=/g)) names.add(m[1]);
    return names;
  };
  for (const f of files) {
    const text = readFileSync(join(root, f), "utf8");
    for (const m of text.matchAll(/import \{([^}]+)\} from "(\.[^"]+)"/g)) {
      const target = resolve(dirname(join(root, f)), m[2]);
      check(existsSync(target), `${f}: no file ${m[2]}`);
      if (existsSync(target)) { const ex = exportsOf(target); m[1].split(",").map((s) => s.trim()).filter(Boolean).forEach((nm) => check(ex.has(nm), `${f}: ${m[2]} has no export ${nm}`)); }
    }
    for (const m of text.matchAll(/import \* as \w+ from "(\.[^"]+)"/g)) check(existsSync(resolve(dirname(join(root, f)), m[1])), `${f}: no file ${m[1]}`);
    for (const m of text.matchAll(/\bT\.(\w+)/g)) check(m[1] in T, `${f}: T.${m[1]} isn't defined`);
    check(!/https?:\/\//.test(text.replace(/\/\/.*$/gm, "")), `${f}: has a URL`);
  }
  for (const f of stationFiles) {
    const ex = exportsOf(join(root, f));
    check(ex.has("build") && ex.has("update"), `${f} lacks build/update`);
    check(!/from "\.\/(?!\.)/.test(readFileSync(join(root, f), "utf8")), `${f} imports another station`);
  }

  return { fails, check, VO, TL, T, KEYS, END, CAM, OV, minMargin, stationFiles, anchors: Object.keys(ANCHORS).length };
}

// the lines every episode prints; an episode with its own facts to report prints its own instead
export function printSummary(G) {
  const { CAM } = G, moves = CAM.moves.filter((m) => m.kind === "move");
  console.log(`${G.anchors} anchors, ${G.KEYS.length} camera keys (${moves.length} moves), film ${G.END} s`);
  console.log(`camera: moving ${(100 * CAM.moving).toFixed(1)} % of frames, drifting ${(100 * CAM.drift).toFixed(1)} %, longest dead hold ${(CAM.longestHold / 60).toFixed(2)} s, longest without a move ${(CAM.longestStill / 60).toFixed(2)} s`);
  console.log(`Blink: visor whole in shot ${(100 * CAM.inShot).toFixed(1)} %, longest absence ${CAM.gapMax.toFixed(2)} s; slices in passing ${CAM.slices.length}, at rest ${CAM.rule1.length}`);
  console.log(`overlays: ${G.OV.length}, smallest side margin ${G.minMargin.toFixed(0)} px, collisions ${CAM.rule4.length}`);
}
export function verdict(fails) {
  if (fails.length) { console.log(`FAIL (${fails.length})`); fails.forEach((f) => console.log("  " + f)); process.exit(1); }
  console.log("PASS");
}
