// audit.spec.mjs's word contract, plus the backing singer's syllables (js/common/bv-onsets.js) and face checks,
// for looks/tv-r3c-bv.html. All boxes are program/signal pixels (960x720). Run from the project folder:
//   node work/motion-lab/audit.mjs looks/tv-r3c-bv.html 308 331 --spec js/tv/bv-audit.spec.mjs --safe 0.05
import fs from 'fs';
import { events as wordEvents, tolerance } from '../../audit.spec.mjs';
const src = fs.readFileSync(new URL('../common/bv-onsets.js', import.meta.url), 'utf8');
const BV = new Function(src + '; return BV;')();
export const events = { ...wordEvents };
for (const o of BV) o.syl.forEach((y, k) => { events[`bv#${o.n}.${k}`] = [Math.floor(y.s * 24 + 1e-6)]; });
export { tolerance };
const hit = (a, b) => a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3];
const pick = (log, kind, name) => log.filter(r => r.kind === kind && r.name === name).map(r => r);
const overlap = (as, bs, label) => { const bad = as.find(a => bs.some(b => hit(a.box, b.box))); return bad ? `${bad.str ? `"${bad.str}"` : bad.name} ${label}` : true; };
export const checks = [
  { name: 'her syllables off every face', test: (log) => overlap([...pick(log, 'text', 'bv syllable'), ...pick(log, 'box', 'bv hold')], [...pick(log, 'box', 'face'), ...pick(log, 'box', 'singer face')], 'overlaps a face') },
  { name: 'her box covers no bulletin face', test: (log) => overlap(pick(log, 'box', 'bv inset'), pick(log, 'box', 'face'), 'covers a face') },
  { name: 'her box clear of the teleprinter', test: (log) => overlap(pick(log, 'box', 'bv inset'), pick(log, 'box', 'teleprinter'), 'touches the wire copy') },
  { name: 'wire copy off her face', test: (log) => overlap(pick(log, 'box', 'teleprinter'), pick(log, 'box', 'singer face'), 'overlaps her face') },
];
