// audit.spec.mjs's word contract, plus the backing singer's syllables (js/common/bv-onsets.js) and face checks,
// for looks/woodcut-end-bv.html. Run from the project folder:
//   node work/motion-lab/audit.mjs looks/woodcut-end-bv.html 308 331 --spec js/woodcut/bv-audit.spec.mjs
import fs from 'fs';
import { events as wordEvents, tolerance } from '../../audit.spec.mjs';
// read the onsets from the page's own data file, so the spec and the drawing can't disagree
const src = fs.readFileSync(new URL('../common/bv-onsets.js', import.meta.url), 'utf8');
const BV = new Function(src + '; return BV;')();
export const events = { ...wordEvents };
for (const o of BV) o.syl.forEach((y, k) => { events[`bv#${o.n}.${k}`] = [Math.floor(y.s * 24 + 1e-6)]; });
export { tolerance };
const hit = (a, b) => a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3];
const boxes = (log, kind, name) => log.filter(r => r.kind === kind && r.name === name);
export const checks = [
  {
    name: 'her syllables off every face',
    test: (log) => {
      const faces = boxes(log, 'box', 'face').map(r => r.box);
      const bad = [...boxes(log, 'text', 'bv syllable'), ...boxes(log, 'box', 'bv hold')].find(r => faces.some(f => hit(r.box, f)));
      return bad ? `"${bad.str || 'hold rule'}" overlaps a face` : true;
    },
  },
  {
    name: 'lead captions off every face (her roundel included)',
    test: (log) => {
      const faces = boxes(log, 'box', 'face').map(r => r.box);
      const bad = boxes(log, 'text', 'woodcut caption').find(r => faces.some(f => hit(r.box, f)));
      return bad ? `"${bad.str}" overlaps a face` : true;
    },
  },
  {
    name: 'her syllables never touch a lead caption',
    test: (log) => {
      const lead = boxes(log, 'text', 'woodcut caption').map(r => r.box);
      const bad = boxes(log, 'text', 'bv syllable').find(r => lead.some(b => hit(r.box, b)));
      return bad ? `"${bad.str}" touches a lead caption` : true;
    },
  },
];
