// The captions' contract for the motion-lab audit (rheos/secondunit-videos tools/motion-lab/audit.mjs):
// every sung word in source/lines.json appears on its onset frame, at most 2 frames early and 1 late.
// The looks fire 'word#<line>.<word>' on a word's first drawn frame (probeWord in js/common/core.js).
// Reads lines.json at run time, so this file quotes nothing. Run one look's range at a time:
//   node <tools>/motion-lab/audit.mjs looks/court.html 261.5 302.75 --spec audit.spec.mjs
import fs from 'fs';
const d = JSON.parse(fs.readFileSync(new URL('./source/lines.json', import.meta.url), 'utf8'));
export const events = {};
for (const l of d.lines) l.words.forEach((w, k) => { events[`word#${l.i}.${k}`] = [Math.floor(w.s * 24 + 1e-6)]; });
export const tolerance = [2, 1];
