// Light checks for the gray box: no browser, no render. Run from anywhere: node check-graybox.mjs
// Every camera and station anchor resolves to a real word occurrence, keys are in order and inside the film, the `other`
// 1 and the Aug 27 mark share no frame, and the count clock agrees with the boards.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const d = JSON.parse(readFileSync(join(root, "vo/words.json"), "utf8"));
const find = (word, n = 1) => { const m = d.words.filter((x) => x[0] === word.toLowerCase()); if (m.length < n) throw new Error(`no '${word}' #${n}`); return m[n - 1]; };
globalThis.VO = { END: d.end, w: (word, n) => find(word, n)[1], e: (word, n) => find(word, n)[2] };
const { ANCHORS, BLINK_X, SET_Z, T, io, r01, rows, defaultDigits, shutter, markOn, otherShows, MARK_SPANS } = await import(pathToFileURL(join(root, "timeline.js")).href);

const fails = [];
const check = (ok, msg) => { if (!ok) fails.push(msg); };
const END = d.end;

// station anchors
for (const [name, [word, n, off, expect]] of Object.entries(ANCHORS)) {
  const t = VO.w(word, n) + off;
  check(Math.abs(t - expect) <= 0.011, `anchor ${name}: ${word}#${n}+${off} = ${t.toFixed(3)}, expected ${expect}`);
  check(t >= 0 && t <= END, `anchor ${name} outside the film`);
}

// camera keys: lifted from world.js as written
const src = readFileSync(join(root, "world.js"), "utf8");
const block = src.slice(src.indexOf("// KEYS-BEGIN"), src.indexOf("// KEYS-END")).replace("// KEYS-BEGIN", "").replace("export const KEYS =", "return ").replace(/;\s*$/, "");
const KEYS = new Function("w", "VO", block)(VO.w, VO);
check(KEYS.length === 56, `expected 56 camera keys, got ${KEYS.length}`);
let shortest = Infinity;
KEYS.forEach((k, i) => {
  check(Math.abs(k[0] - k[4]) <= 0.011, `K${i + 1}: ${k[0].toFixed(3)} is not ${k[4]}`);
  check(k[0] >= 0 && k[0] <= END, `K${i + 1} outside the film`);
  check(k[1].length === 3 && k[2].length === 3 && k[3] === 36, `K${i + 1} malformed`);
  check(k[2][2] === -1.2 && k[2][0] === k[1][0] && k[2][1] === k[1][1], `K${i + 1} target isn't straight ahead at z -1.2`);
  if (i) { check(k[0] > KEYS[i - 1][0], `K${i + 1} out of order`); shortest = Math.min(shortest, k[0] - KEYS[i - 1][0]); }
});
check(KEYS[0][0] === 0 && Math.abs(KEYS[55][0] - END) < 1e-6, "keys don't span the film");

// the rule, sampled at 240 Hz: never both, and at least 0.2 s between
let both = 0, gap = Infinity, lastOther = -9, lastMark = -9;
for (let i = 0; i <= END * 240; i++) {
  const t = i / 240, o = otherShows(t), m = markOn(t);
  if (o && m) both++;
  if (o) { gap = Math.min(gap, t - lastMark); lastOther = t; }
  if (m) { gap = Math.min(gap, t - lastOther); lastMark = t; }
}
check(both === 0, `other 1 and Aug 27 mark share ${both} samples`);
check(gap >= 0.195, `other 1 and mark only ${gap.toFixed(3)} s apart`);

// the count clock
[[T.feed1End, 8], [T.feed2End, 22], [T.feed3End, 36], [T.rewindEnd, 0]].forEach(([t, n]) => check(Math.abs(rows(t) - n) < 1e-6, `rows(${t}) = ${rows(t)}, expected ${n}`));
[[0, "36"], [T.b14 - 0.01, "00"], [T.feed1End + 0.2, "08"], [T.feed2End + 0.2, "22"], [T.feed3End + 0.2, "36"], [T.b17 + 0.5, "--"], [T.b20, "36"], [T.b32 + 1, "--"], [T.END, "36"]].forEach(([t, s]) => check(defaultDigits(t) === s, `digits at ${t}: ${defaultDigits(t)}, expected ${s}`));
check(shutter(T.b11) >= 1 && shutter(T.stripIn) >= 1, "shutter not shut before the strip");
check(shutter(T.otherOpen2 - 0.01) >= 1 && shutter(T.otherOpen2 + 0.31) === 0, "shutter wrong around 60.1");

// ---------- the frame, by projection (fov 36 at 1080x1920, the kit's io between keys, drift left out: under 2 px) ----------
const F = 960 / Math.tan((18 * Math.PI) / 180);
function camAt(t) {
  let i = 0;
  while (i < KEYS.length - 2 && t > KEYS[i + 1][0]) i++;
  const k = io(r01(t, KEYS[i][0], Math.max(0.001, KEYS[i + 1][0] - KEYS[i][0])));
  return [0, 1, 2].map((a) => KEYS[i][1][a] + (KEYS[i + 1][1][a] - KEYS[i][1][a]) * k);
}
const sx = (c, x, z) => 540 + ((x - c[0]) * F) / (c[2] - z), sy = (c, y, z) => 960 - ((y - c[1]) * F) / (c[2] - z);
const worst = { crateL: 9e9, paperR: -9e9, blinkL: 9e9, crateT: 9e9, tallyT: 9e9, tagR: -9e9 };
for (let t = 0; t <= END; t += 1 / 60) {
  const c = camAt(t);
  worst.crateL = Math.min(worst.crateL, sx(c, -2.0, -1.2 + SET_Z));
  worst.paperR = Math.max(worst.paperR, sx(c, 1.94, -0.5 + SET_Z));
  worst.blinkL = Math.min(worst.blinkL, sx(c, BLINK_X - 1.05, 0));
  worst.crateT = Math.min(worst.crateT, sy(c, 4.72, -1.2 + SET_Z));
  worst.tallyT = Math.min(worst.tallyT, sy(c, 4.79, -1.0 + SET_Z));
  worst.tagR = Math.max(worst.tagR, sx(c, 2.09, -1.38 + SET_Z));
}
check(worst.crateL >= 16, `crate's left edge reaches x ${worst.crateL.toFixed(0)}`);
check(worst.paperR <= 1068, `head bar's right edge reaches x ${worst.paperR.toFixed(0)}`);
check(worst.blinkL >= 2, `Blink's left edge reaches x ${worst.blinkL.toFixed(0)}`);
check(worst.tagR <= 1068, `build tag reaches x ${worst.tagR.toFixed(0)}`);
check(worst.tallyT >= 16, `tally's top reaches y ${worst.tallyT.toFixed(0)}`);

// overlays: width from IBM Plex Sans Bold advances (units per 1000, within 1 % of BY AUGUST and SHIPPED, on the first animatic)
const ADV = { A: 640, B: 650, C: 630, D: 680, E: 580, F: 560, G: 680, H: 700, I: 360, J: 540, K: 650, L: 540, M: 830, N: 700, O: 700, P: 620, Q: 700, R: 640, S: 600, T: 590, U: 680, V: 630, W: 930, X: 640, Y: 610, Z: 590, " ": 250, ",": 280 };
const textW = (s, size) => [...s].reduce((a, ch) => a + (ADV[ch] ?? 600), 0) * size * 0.001 - s.length * size * 0.02;
globalThis.window = globalThis;
new Function(readFileSync(join(root, "overlays.js"), "utf8"))();
let minMargin = 9e9, minTop = 9e9, minBlink = 9e9;
for (const { lines, at, gone } of window.OVERLAYS(VO.w)) {
  check(gone > at + 0.3, `overlay "${lines[0][0]}" is on for ${(gone - at).toFixed(2)} s`);
  for (const [s, x, base, size] of lines) {
    const hw = textW(s, size) / 2, margin = Math.min(x - hw, 1080 - x - hw);
    minMargin = Math.min(minMargin, margin);
    check(margin >= 48, `overlay "${s}" has a ${margin.toFixed(0)} px margin`);
    for (let t = at; t <= gone - 0.1; t += 1 / 60) {
      const c = camAt(t);
      if (base < 400) { // top zone: clear of the crate and the tally, ring included
        const clear = Math.min(sy(c, 4.72, -1.2 + SET_Z), sy(c, 4.79, -1.0 + SET_Z)) - base;
        minTop = Math.min(minTop, clear);
        check(clear >= 8, `overlay "${s}" at ${t.toFixed(2)}: only ${clear.toFixed(0)} px above the set`);
      } else { // low zone: clear of Blink's right edge
        const clear = x - hw - sx(c, BLINK_X + 1.05, 0);
        minBlink = Math.min(minBlink, clear);
        check(clear >= 4, `overlay "${s}" at ${t.toFixed(2)}: ${clear.toFixed(0)} px from Blink`);
      }
    }
  }
}
console.log(`frame: crate left ${worst.crateL.toFixed(0)}, head bar right ${worst.paperR.toFixed(0)}, Blink left ${worst.blinkL.toFixed(0)}, build tag right ${worst.tagR.toFixed(0)}, crate top ${worst.crateT.toFixed(0)}, tally top ${worst.tallyT.toFixed(0)}`);
console.log(`overlays: smallest side margin ${minMargin.toFixed(0)} px, top zone clear by ${minTop.toFixed(0)}, low zone clear of Blink by ${minBlink.toFixed(0)}`);

// static checks: nothing here runs in a browser, so catch dead names and bad imports now
const stationDir = join(root, "stations");
const files = ["world.js", "parts.js", ...readdirSync(stationDir).filter((f) => f.endsWith(".js")).map((f) => join("stations", f))];
const exportsOf = (file) => new Set([...readFileSync(file, "utf8").matchAll(/export (?:async )?(?:const|function|let) (\w+)/g)].map((m) => m[1]));
for (const f of files) {
  const text = readFileSync(join(root, f), "utf8");
  for (const m of text.matchAll(/import \{([^}]+)\} from "(\.[^"]+)"/g)) {
    const target = resolve(dirname(join(root, f)), m[2]);
    check(existsSync(target), `${f}: no file ${m[2]}`);
    if (existsSync(target)) { const ex = exportsOf(target); m[1].split(",").map((s) => s.trim()).filter(Boolean).forEach((n) => check(ex.has(n), `${f}: ${m[2]} has no export ${n}`)); }
  }
  for (const m of text.matchAll(/\bT\.(\w+)/g)) check(m[1] in T, `${f}: T.${m[1]} isn't defined`);
  check(!/https?:\/\//.test(text.replace(/\/\/.*$/gm, "")), `${f}: has a URL`);
}
for (const f of readdirSync(stationDir).filter((x) => x.endsWith(".js"))) {
  const ex = exportsOf(join(stationDir, f));
  check(ex.has("build") && ex.has("update"), `${f} lacks build/update`);
  check(!/from "\.\/(?!\.)/.test(readFileSync(join(stationDir, f), "utf8")), `${f} imports another station`);
}

console.log(`${Object.keys(ANCHORS).length} station anchors, ${KEYS.length} camera keys, shortest key gap ${shortest.toFixed(2)} s, film ${END} s`);
console.log(`mark spans ${JSON.stringify(MARK_SPANS.map((s) => s.map((x) => +x.toFixed(2))))}; other vs mark: closest ${gap.toFixed(3)} s, overlap samples ${both}`);
if (fails.length) { console.log(`FAIL (${fails.length})`); fails.forEach((f) => console.log("  " + f)); process.exit(1); }
console.log("PASS");
