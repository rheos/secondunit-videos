// Light checks for the gray box: no browser, no render. Run from anywhere: node check-graybox.mjs
// Every anchor resolves to a real word occurrence; camera keys are in order and inside the film; the frame (projected by
// camera-check.mjs) meets the DP framing rules and motion targets; no on-screen string uses a banned term; the counter
// never shares a frame with day 53 or the right chute's light; imports resolve.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const d = JSON.parse(readFileSync(join(root, "vo/words.json"), "utf8"));
const find = (word, n = 1) => { const m = d.words.filter((x) => x[0] === word.toLowerCase()); if (m.length < n) throw new Error(`no '${word}' #${n}`); return m[n - 1]; };
globalThis.VO = { END: d.end, w: (word, n) => find(word, n)[1], e: (word, n) => find(word, n)[2] };
const TL = await import(pathToFileURL(join(root, "timeline.js")).href);
const { ANCHORS, T, counterAlpha, dayLit, chuteGlow, rightAfterglow } = TL;

const fails = [];
const check = (ok, msg) => { if (!ok) fails.push(msg); };
const END = d.end;
check(Math.abs(END - 79.35) < 1e-6, `film end is ${END}, expected 79.35`);

// ---------- anchors ----------
for (const [name, [word, n, off, expect]] of Object.entries(ANCHORS)) {
  const t = VO.w(word, n) + off;
  check(Math.abs(t - expect) <= 0.011, `anchor ${name}: ${word}#${n}+${off} = ${t.toFixed(3)}, expected ${expect}`);
  check(t >= 0 && t <= END, `anchor ${name} outside the film`);
}

// ---------- camera keys, lifted from world.js as written ----------
const src = readFileSync(join(root, "world.js"), "utf8");
const block = src.slice(src.indexOf("// KEYS-BEGIN"), src.indexOf("// KEYS-END")).replace("// KEYS-BEGIN", "").replace("export const KEYS =", "return ").replace(/;\s*$/, "");
const KEYS = new Function("w", "VO", "T", block)(VO.w, VO, T);
const { cameraReport, SUBJECTS } = await import(pathToFileURL(join(root, "camera-check.mjs")).href);
KEYS.forEach((k, i) => {
  check(Math.abs(k[0] - k[4]) <= 0.011, `K${i + 1}: ${k[0].toFixed(3)} is not ${k[4]}`);
  check(i === 0 ? k[0] <= 0 : k[0] >= 0 && k[0] <= END, `K${i + 1} outside the film`);
  check(k[1].concat(k[2]).every(Number.isFinite) && k[3] >= 30 && k[3] <= 40, `K${i + 1}: bad pose or fov`);
  check(k[1][2] > k[2][2] + 2, `K${i + 1}: the camera isn't in front of the set`);
  check(k[5] in SUBJECTS, `K${i + 1}: no subject "${k[5]}"`);
  if (i) check(k[0] > KEYS[i - 1][0], `K${i + 1} out of order`);
});
check(KEYS[0][0] <= 0 && KEYS[1][0] > 0 && Math.abs(KEYS[KEYS.length - 1][0] - END) < 1e-6, "keys don't span the film");

// ---------- the frame, by projection (camera-check.mjs: the kit's io and drift, lookAt, fov) ----------
// DP final framing rules (they replace "Blink always whole in frame"), measured on every 60 fps frame:
const CAM = await cameraReport(root, KEYS, VO);
check(CAM.moving >= 0.27 && CAM.moving <= 0.36, `camera moves in ${(100 * CAM.moving).toFixed(1)} % of frames, target about 30 %`);
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
check(CAM.stripCut.length === 0, `the strip's day 53 end is sliced by the frame: ${CAM.stripCut.join("; ")}`);
check(CAM.ruleCentre.length === 0, `a prop subject sits outside 30-60 % of the frame height: ${CAM.ruleCentre.join("; ")}`);
check(CAM.ruleEmpty.length === 0, `a resting frame is mostly empty: ${CAM.ruleEmpty.join("; ")}`);
check(CAM.border.length === 0, `a prop edge sits on a frame edge: ${CAM.border.join("; ")}`);
check(CAM.ruleNote.length === 0, `the note sinks into the bottom chrome: ${CAM.ruleNote.join("; ")}`);
check(CAM.ovEdge >= 40, `an overlay phrase sits ${CAM.ovEdge.toFixed(0)} px from a frame edge`);
check(CAM.rule5.length === 0, `rule 5, subject at an edge: ${CAM.rule5.join("; ")}`);
check(CAM.sproutGap >= 8, `the strip comes within ${CAM.sproutGap.toFixed(0)} px of Blink's sprout at ${CAM.sproutAt.toFixed(2)}`);
check(!/lean: -/.test(readFileSync(join(root, "stations/mark.js"), "utf8")), "mark.js leans Blink left, which the bounds check doesn't cover");
// the option panels: a clear gap with the "or" in it
const pv = Object.fromEntries([...readFileSync(join(root, "stations/panels.js"), "utf8").match(/export const PANEL_W[^;]+/)[0].replace("export const ", "").matchAll(/(\w+) = ([-\d.]+)/g)].map((m) => [m[1], +m[2]]));
const gap = pv.R_X - pv.L_X - pv.PANEL_W;
check(gap >= 0.4 + 0.15, `option panels only ${gap.toFixed(2)} apart for a 0.4-wide "or"`);
check(pv.OR_X - 0.2 >= pv.L_X + pv.PANEL_W / 2 + 0.05 && pv.OR_X + 0.2 <= pv.R_X - pv.PANEL_W / 2 - 0.05, `"or" doesn't sit clear inside the gap`);

// ---------- overlays: width from IBM Plex Sans Bold advances (units per 1000, within 1 % of two measured animatic lines) ----------
// where they sit against the picture is rule 4 above; here, their timing and side margins
const ADV = { A: 640, B: 650, C: 630, D: 680, E: 580, F: 560, G: 680, H: 700, I: 360, J: 540, K: 650, L: 540, M: 830, N: 700, O: 700, P: 620, Q: 700, R: 640, S: 600, T: 590, U: 680, V: 630, W: 930, X: 640, Y: 610, Z: 590, " ": 250, ",": 280 };
const textW = (s, size) => [...s].reduce((a, ch) => a + (ADV[ch] ?? 600), 0) * size * 0.001 - s.length * size * 0.02;
globalThis.window = globalThis;
new Function(readFileSync(join(root, "overlays.js"), "utf8"))();
const OV = window.OVERLAYS(VO.w);
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

// ---------- facts on screen ----------
// the counter never shares a frame with day 53 or the right chute's light
let shared = 0;
for (let t = 0; t <= END; t += 1 / 240) if (counterAlpha(t) > 0 && (dayLit(t) || chuteGlow("R", t) > 0 || rightAfterglow(t) > 0)) shared++;
check(shared === 0, `the counter shares ${shared} samples with day 53 or the right chute light`);
check(chuteGlow("R", T.h19 + 1.2) > 0.9 && chuteGlow("R", T.h19 - 0.5) === 0, "the right chute's first light isn't on hold 19");

// banned terms in anything that can reach the screen: every string literal in the stations, overlays, parts and page
const BANNED = /\b(mode|optional|fts|vector|hybrid|query|param|argument|request log)\b/i;
const stationDir = join(root, "stations");
const stationFiles = readdirSync(stationDir).filter((f) => f.endsWith(".js")).map((f) => join("stations", f));
const onScreen = [...stationFiles, "overlays.js", "parts.js", "index.html", "world.js"];
for (const f of onScreen) {
  const text = readFileSync(join(root, f), "utf8").replace(/^\s*\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "").replace(/<!--[\s\S]*?-->/g, "");
  for (const m of text.matchAll(/"((?:[^"\\\n]|\\.)*)"|'((?:[^'\\\n]|\\.)*)'|`((?:[^`\\]|\\.)*)`/g)) {
    const s = m[1] ?? m[2] ?? m[3];
    const hit = s.match(BANNED);
    check(!hit, `${f}: on-screen string uses "${hit && hit[0]}": ${s.slice(0, 60)}`);
  }
  check(!/#e0675a/i.test(text), `${f}: uses the red`);
  check(!/makeHarness|harness\.|carabiner/i.test(text.replace(/\/\/.*$/gm, "")), `${f}: still builds a harness`);
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

const moves = CAM.moves.filter((m) => m.kind === "move");
console.log(`${Object.keys(ANCHORS).length} anchors, ${KEYS.length} camera keys (${moves.length} moves), film ${END} s`);
console.log(`camera: moving ${(100 * CAM.moving).toFixed(1)} % of frames, drifting ${(100 * CAM.drift).toFixed(1)} %, longest dead hold ${(CAM.longestHold / 60).toFixed(2)} s, longest without a move ${(CAM.longestStill / 60).toFixed(2)} s`);
console.log(`Blink: visor whole in shot ${(100 * CAM.inShot).toFixed(1)} %, longest absence ${CAM.gapMax.toFixed(2)} s; slices in passing ${CAM.slices.length}, at rest ${CAM.rule1.length}; panel gap ${gap.toFixed(2)}`);
console.log(`overlays: ${OV.length}, smallest side margin ${minMargin.toFixed(0)} px, collisions ${CAM.rule4.length}; counter/day-53/right-chute shared samples ${shared}`);
if (fails.length) { console.log(`FAIL (${fails.length})`); fails.forEach((f) => console.log("  " + f)); process.exit(1); }
console.log("PASS");
