// Writes cues.json with no browser: node write-cues.mjs (run from this folder)
// Loads the voice words, timeline.js, cues.js and overlays.js the way check-graybox.mjs does, adds the overlay slams the
// page pushes itself (index.html: slam() cues at + 0.16), sorts by time, prints the count per kind.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const d = JSON.parse(readFileSync(join(root, "vo/words.json"), "utf8"));
const find = (word, n = 1) => { const m = d.words.filter((x) => x[0] === word.toLowerCase()); if (m.length < n) throw new Error(`no '${word}' #${n}`); return m[n - 1]; };
globalThis.VO = { END: d.end, w: (word, n) => find(word, n)[1], e: (word, n) => find(word, n)[2] };
globalThis.window = globalThis;
const TL = await import(pathToFileURL(join(root, "timeline.js")).href);
new Function(readFileSync(join(root, "cues.js"), "utf8"))();
new Function(readFileSync(join(root, "overlays.js"), "utf8"))();

const cues = window.CUES(VO.w, TL.T, TL);
for (const o of window.OVERLAYS(VO.w)) if (o.big) cues.push({ k: "slam", t: +(o.at + 0.16).toFixed(3) });
cues.sort((a, b) => a.t - b.t);
writeFileSync(join(root, "cues.json"), JSON.stringify(cues));

const n = {};
for (const c of cues) n[c.k] = (n[c.k] || 0) + 1;
console.log("cues", cues.length, JSON.stringify(n), "->", join(root, "cues.json"));
if (process.argv.includes("--list")) cues.forEach((c) => console.log(c.t.toFixed(2), c.k, c.d || ""));
