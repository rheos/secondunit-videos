// The captions' contract for the motion-lab audit (rheos/secondunit-videos tools/motion-lab/audit.mjs), as in
// bobwiseman-me-and-jimi: every sung word in source/lines.json prints on its onset frame, at most 2 frames early and
// 1 late. js/lyrics/cap.js fires 'word#<line>.<word>' on a word's first drawn frame. Reads lines.json at run time, so
// this file quotes nothing. The hard check: no lyric block touches a face (js/lyrics/faces-*.js), ever.
// Run one look at a time from this folder (see docs/LYRICS.md for the spans):
//   node work/tools/motion-lab/audit.mjs looks/kite-cap.html 0 34 --spec audit.spec.mjs --margin 0
//   node work/tools/motion-lab/audit.mjs looks/kite-9x16-cap.html 4.5 34 --spec audit.spec.mjs --margin 0 --width 720 --height 1280
import fs from 'fs';
const d = JSON.parse(fs.readFileSync(new URL('./source/lines.json', import.meta.url), 'utf8'));
export const events = {};
for (const l of d.lines) l.words.forEach((w, k) => { events[`word#${l.i}.${k}`] = [Math.floor(w.s * 24 + 1e-6)]; });
export const tolerance = [2, 1];
const meet = (a, b) => Math.max(0, Math.min(a[2], b[2]) - Math.max(a[0], b[0])) * Math.max(0, Math.min(a[3], b[3]) - Math.max(a[1], b[1]));
export const checks = [{ name: 'lyric block off faces', test: (log) => {
  const L = log.filter((r) => r.name === 'lyric block'), F = log.filter((r) => r.name === 'face');
  for (const l of L) for (const f of F) { const a = meet(l.box, f.box); if (a > 0) return `lyric block over a face (${a.toFixed(0)} px2 at ${f.box.map((v) => v.toFixed(0)).join(',')})`; }
  return true;
} }];
