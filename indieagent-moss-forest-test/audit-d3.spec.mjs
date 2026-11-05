// Moss forest d3, the brief as numbers for tools/motion-lab/audit.mjs. Song frames at 24 fps.
// The giant stays in frame (keep box, built in). Feet never slide while down, planted feet sit on the floor line,
// and the fallboard and both plants land on their frames.
export const events = { lidOpen: [110], plantL: [262], plantR: [302] };
export const tolerance = 0;
const val = (log, n) => (log.find((r) => r.kind === 'value' && r.name === n) || {}).v;
export const checks = [
  { name: 'feet planted (0 px slide while down)', test: (log) => { const v = val(log, 'footSlide'); return v === undefined || v === 0 || `a planted foot moved ${v} px`; } },
  { name: 'planted feet on the floor', test: (log) => { const v = val(log, 'feetOnFloor'); return v === undefined || v < .01 || `foot ${v} px off the floor`; } },
];
