// tv-A's audit spec: the shared word-onset contract (audit.spec.mjs) plus the round-3 face rule: the wire copy
// (and its paper) never sits over a face in the program, nor over the king's head in the room.
//   node work/motion-lab/audit.mjs looks/tv-r3a.html 0 95.916667 --spec js/tv/r3a-audit.spec.mjs --safe 0.05
export { events, tolerance } from '../../audit.spec.mjs';
const faces = (name) => (log) => { const v = log.filter(r => r.kind === 'value' && r.name === name); return v.every(r => r.v === 0) || `${name}: ${v.map(r => r.v).join(',')}`; };
export const checks = [
  { name: 'faces clear of the wire copy', test: faces('r3a faces under copy') },
  { name: 'king clear of the wire copy', test: faces('r3a king under copy') },
];
