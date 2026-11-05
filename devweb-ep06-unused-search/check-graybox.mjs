// Light checks for the gray box: no browser, no render. Run from anywhere: node check-graybox.mjs
// Every anchor resolves to a real word occurrence; camera keys are in order and inside the film; the frame (by projection)
// keeps the set, Blink and the overlays where the plan puts them; no on-screen string uses a banned term; the counter
// never shares a frame with day 53 or the right chute's light; imports resolve.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const d = JSON.parse(readFileSync(join(root, "vo/words.json"), "utf8"));
const find = (word, n = 1) => { const m = d.words.filter((x) => x[0] === word.toLowerCase()); if (m.length < n) throw new Error(`no '${word}' #${n}`); return m[n - 1]; };
globalThis.VO = { END: d.end, w: (word, n) => find(word, n)[1], e: (word, n) => find(word, n)[2] };
const TL = await import(pathToFileURL(join(root, "timeline.js")).href);
const { ANCHORS, T, io, r01, BLINK_X, FOOT_Y, CX, counterAlpha, dayLit, chuteGlow, rightAfterglow } = TL;

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
const KEYS = new Function("w", "VO", block)(VO.w, VO);
let shortestMove = Infinity;
KEYS.forEach((k, i) => {
  check(Math.abs(k[0] - k[4]) <= 0.011, `K${i + 1}: ${k[0].toFixed(3)} is not ${k[4]}`);
  check(k[0] >= 0 && k[0] <= END, `K${i + 1} outside the film`);
  check(k[2][2] === -1.2 && k[2][0] === k[1][0] && k[2][1] === k[1][1] && k[3] === 36, `K${i + 1} target isn't straight ahead`);
  if (i) {
    check(k[0] > KEYS[i - 1][0], `K${i + 1} out of order`);
    const moved = Math.hypot(...[0, 1, 2].map((a) => k[1][a] - KEYS[i - 1][1][a]));
    if (moved > 0.2) shortestMove = Math.min(shortestMove, k[0] - KEYS[i - 1][0]);
    check(moved <= 0.2 || k[0] - KEYS[i - 1][0] >= 0.6, `K${i + 1}: a ${moved.toFixed(2)} move in ${(k[0] - KEYS[i - 1][0]).toFixed(2)} s`);
  }
});
check(KEYS[0][0] === 0 && Math.abs(KEYS[KEYS.length - 1][0] - END) < 1e-6, "keys don't span the film");

// ---------- the frame, by projection (fov 36 at 1080x1920, the kit's io between keys, drift left out: under 2 px) ----------
const F = 960 / Math.tan((18 * Math.PI) / 180);
function camAt(t) {
  let i = 0;
  while (i < KEYS.length - 2 && t > KEYS[i + 1][0]) i++;
  const k = io(r01(t, KEYS[i][0], Math.max(0.001, KEYS[i + 1][0] - KEYS[i][0])));
  return [0, 1, 2].map((a) => KEYS[i][1][a] + (KEYS[i + 1][1][a] - KEYS[i][1][a]) * k);
}
const sx = (c, x, z) => 540 + ((x - c[0]) * F) / (c[2] - z), sy = (c, y, z) => 960 - ((y - c[1]) * F) / (c[2] - z);
const span = (a, b) => (t) => t >= a && t <= b;
// [what, x, z, on-when, left or right edge limit]
const EDGES = [
  ["crate left", CX - 1.22, -1.5, () => true, "L"], ["crate right", CX + 1.22, -1.5, () => true, "R"],
  ["queue's top card", 1.94, -1.1, span(T.h06 + 0.8, T.h08 + 3.0), "R"],
  ["lamp label", 2.05, -1.78, (t) => (t > T.h09 + 0.4 && t < T.h10) || (t > T.h14 && t < T.h16), "R"],
  ["counter", 2.215, -1.1, (t) => counterAlpha(t) > 0.5, "R"],
  ["tray", 2.1, -1.1, span(T.h15 + 0.4, T.h16), "R"],
  ["strip left", -1.5, -1.0, span(T.h16 + 1.2, T.h21), "L"], ["strip right", 1.8, -1.0, span(T.h16 + 1.2, T.h21), "R"],
  ["note left", -1.225, 1.15, span(T.h18 + 0.9, T.h21), "L"],
  ["left panel", -1.32, -0.9, span(T.h24 + 0.6, T.h26), "L"], ["right panel", 1.68, -0.9, span(T.h25 + 0.6, T.h26), "R"],
  ["log", 1.95, -0.8, span(T.h26 + 0.4, T.h27), "R"],
];
const worst = {};
// Blink's whole body, outline included (half-width 1.03 at z 0, calibrated on animatic 03), must stay inside the frame.
// Leans only ever tip it right, pivoting at the foot, which never moves its left edge out: mark.js is checked for that.
let blinkL = 1e9, blinkR = -1e9, n = 0, footMax = -1e9, blinkW = [1e9, 0], sproutGap = 1e9;
for (let t = 0; t <= END; t += 1 / 60, n++) {
  const c = camAt(t);
  for (const [name, x, z, on, side] of EDGES) {
    if (!on(t)) continue;
    const px = sx(c, x, z);
    worst[name] = worst[name] === undefined ? px : side === "L" ? Math.min(worst[name], px) : Math.max(worst[name], px);
  }
  const bl = sx(c, BLINK_X - 1.03, 0), br = sx(c, BLINK_X + 1.03, 0);
  blinkL = Math.min(blinkL, bl); blinkR = Math.max(blinkR, br);
  // the calendar strip's bottom edge must clear the top of Blink's sprout (world y 1.84, measured on animatic 03)
  if (t > T.h16 + 0.2 && t < T.h21 + 0.6) sproutGap = Math.min(sproutGap, sy(c, 1.84, 0) - sy(c, 1.96, -1.0));
  blinkW = [Math.min(blinkW[0], br - bl), Math.max(blinkW[1], br - bl)];
  footMax = Math.max(footMax, sy(c, FOOT_Y, 0.5));
}
for (const [name, , , , side] of EDGES) {
  if (worst[name] === undefined) continue;
  check(side === "L" ? worst[name] >= 8 : worst[name] <= 1072, `${name} reaches x ${worst[name].toFixed(0)}`);
}
check(blinkL >= 8 && blinkR <= 1072, `Blink's body reaches x ${blinkL.toFixed(0)}..${blinkR.toFixed(0)}`);
check(!/lean: -/.test(readFileSync(join(root, "stations/mark.js"), "utf8")), "mark.js leans Blink left, which the bounds check doesn't cover");
check(sproutGap >= 8, `the strip comes within ${sproutGap.toFixed(0)} px of Blink's sprout`);
// the option panels: a clear gap with the "or" in it, both inside the frame (EDGES above)
const pv = Object.fromEntries([...readFileSync(join(root, "stations/panels.js"), "utf8").match(/export const PANEL_W[^;]+/)[0].replace("export const ", "").matchAll(/(\w+) = ([-\d.]+)/g)].map((m) => [m[1], +m[2]]));
const gap = pv.R_X - pv.L_X - pv.PANEL_W;
check(gap >= 0.4 + 0.15, `option panels only ${gap.toFixed(2)} apart for a 0.4-wide "or"`);
check(pv.OR_X - 0.2 >= pv.L_X + pv.PANEL_W / 2 + 0.05 && pv.OR_X + 0.2 <= pv.R_X - pv.PANEL_W / 2 - 0.05, `"or" doesn't sit clear inside the gap`);
check(footMax <= 1765, `Blink's foot reaches y ${footMax.toFixed(0)}, into the lockup at 1774`);

// ---------- overlays: width from IBM Plex Sans Bold advances (units per 1000, within 1 % of two measured animatic lines) ----------
const ADV = { A: 640, B: 650, C: 630, D: 680, E: 580, F: 560, G: 680, H: 700, I: 360, J: 540, K: 650, L: 540, M: 830, N: 700, O: 700, P: 620, Q: 700, R: 640, S: 600, T: 590, U: 680, V: 630, W: 930, X: 640, Y: 610, Z: 590, " ": 250, ",": 280 };
const textW = (s, size) => [...s].reduce((a, ch) => a + (ADV[ch] ?? 600), 0) * size * 0.001 - s.length * size * 0.02;
globalThis.window = globalThis;
new Function(readFileSync(join(root, "overlays.js"), "utf8"))();
const OV = window.OVERLAYS(VO.w);
let minMargin = 9e9, minTop = 9e9, minLow = 9e9;
OV.forEach(({ lines, at, gone }, i) => {
  check(gone > at + 0.5, `overlay "${lines[0][0]}" is on for ${(gone - at).toFixed(2)} s`);
  if (i) check(at >= OV[i - 1].gone, `overlay "${lines[0][0]}" lands before "${OV[i - 1].lines[0][0]}" is gone`);
  for (const [s, x, base, size] of lines) {
    const hw = textW(s, size) / 2, margin = Math.min(x - hw, 1080 - x - hw);
    minMargin = Math.min(minMargin, margin);
    check(margin >= 48, `overlay "${s}" has a ${margin.toFixed(0)} px margin`);
    for (let t = at; t <= gone - 0.1; t += 1 / 60) {
      const c = camAt(t);
      if (base < 400) { // the band above the lid
        let clear = sy(c, 4.71, -1.5) - base;
        const lampX = sx(c, 1.8, -1.8);
        if (lampX > x - hw - 30 && lampX < x + hw + 30) clear = Math.min(clear, sy(c, 4.64, -1.8) - base);
        minTop = Math.min(minTop, clear);
        check(clear >= 8, `overlay "${s}" at ${t.toFixed(2)}: only ${clear.toFixed(0)} px above the lid`);
      } else { // the low zone: right of Blink, under the strip
        const clear = Math.min(x - hw - sx(c, BLINK_X + 1.05, 0), base - 0.75 * size - sy(c, 1.5, -1.0));
        minLow = Math.min(minLow, clear);
        check(clear >= 8, `overlay "${s}" at ${t.toFixed(2)}: ${clear.toFixed(0)} px from Blink or the strip`);
      }
    }
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

console.log(`${Object.keys(ANCHORS).length} anchors, ${KEYS.length} camera keys, shortest move ${shortestMove.toFixed(2)} s, film ${END} s`);
console.log(`frame: ${Object.entries(worst).map(([k, v]) => `${k} ${v.toFixed(0)}`).join(", ")}`);
console.log(`Blink: body x ${blinkL.toFixed(0)}..${blinkR.toFixed(0)} at worst, ${blinkW[0].toFixed(0)}-${blinkW[1].toFixed(0)} px wide, foot down to y ${footMax.toFixed(0)}; strip clears sprout by ${sproutGap.toFixed(0)} px; panel gap ${gap.toFixed(2)}`);
console.log(`overlays: ${OV.length}, smallest side margin ${minMargin.toFixed(0)} px, lid band clear by ${minTop.toFixed(0)}, low zone clear by ${minLow.toFixed(0)}; counter/day-53/right-chute shared samples ${shared}`);
if (fails.length) { console.log(`FAIL (${fails.length})`); fails.forEach((f) => console.log("  " + f)); process.exit(1); }
console.log("PASS");
