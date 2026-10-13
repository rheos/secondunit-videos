// audit.spec.mjs's word contract plus one check for looks/woodcut-r3a.html: captions stay off faces.
// Every figure (and so every face) is painted inside its woodblock, which clips it, so a caption box that never
// overlaps any woodblock box never covers a face. Run from the project folder:
//   node work/motion-lab/audit.mjs looks/woodcut-r3a.html 95.916667 165.083333 --spec js/woodcut/r3a-audit.spec.mjs
export { events, tolerance } from '../../audit.spec.mjs';
const hit = (a, b) => a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3];
export const checks = [{
  name: 'captions off faces (no caption box inside a woodblock)',
  test: (log) => {
    const blocks = log.filter(r => r.kind === 'box' && r.name === 'woodblock').map(r => r.box);
    const bad = log.filter(r => r.kind === 'text' && r.name === 'woodcut caption' && blocks.some(b => hit(r.box, b)));
    return bad.length ? `"${bad[0].str}" overlaps a woodblock` : true;
  },
}];
