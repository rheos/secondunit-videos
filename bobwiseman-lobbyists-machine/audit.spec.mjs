// Audit spec for the lobbyists machine (film seconds; the page's t 0 is song 20.0 s).
// The coin's landings must fall on the frames of the words they belong to; times are read from work/cues.js.
import fs from 'fs';
const C = JSON.parse(fs.readFileSync(new URL('./work/cues.js', import.meta.url), 'utf8').replace(/^window\.CUES = /, '').replace(/;\s*$/, ''));
const w = (l, i) => C.lines[l].words[i].t, f = (t) => Math.ceil(t * 24 - 1e-6);
export const events = { slot1: [f(C.hooks[0].again)], board: [f(w(0, 0))], yoyo: [f(w(1, 0))], xylo: [f(w(2, 0))], bulb: [f(w(3, 8))], bucket: [f(w(4, 10))], slot2: [f(C.hooks[1].again)] };
export const tolerance = [1, 1];
