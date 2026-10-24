// Round 3, wood-B: the caption contract (every word on its onset, from ../../audit.spec.mjs) plus one more check:
// captions stay off faces. The page reports every head it draws as a 'r3b face' box (r3bHead in r3b-main.js);
// no 'woodcut caption' box may overlap one on any frame.
//   node work/motion-lab/audit.mjs looks/woodcut-r3b.html 165.0 261.4583 --spec js/woodcut/r3b-audit.spec.mjs
export { events, tolerance } from '../../audit.spec.mjs';
const hit = (a, b) => a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3];
export const checks = [{
  name: 'captions off faces',
  test: (log) => {
    const faces = log.filter(r => r.kind === 'box' && r.name === 'r3b face').map(r => r.box);
    for (const r of log) if (r.kind === 'text' && r.name === 'woodcut caption') for (const f of faces) if (hit(r.box, f)) return `"${r.str}" over a face`;
    return true;
  },
}];
