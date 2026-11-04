// The moss forest brief as numbers, for tools/motion-lab/audit.mjs. Song frames at 24 fps.
// The giant stays in frame (keep box, built in). Feet never slide while planted, planted front feet sit on the floor,
// and the step plants and the fallboard land on their frames.
export const events = { plantR: [250], plantL: [290], lidOpen: [110] };
export const tolerance = 0;
const val = (log, n) => (log.find((r) => r.kind === 'value' && r.name === n) || {}).v;
export const checks = [
  { name: 'feet planted (0 px slide while down)', test: (log) => { const v = val(log, 'footSlide'); return v === undefined || v === 0 || `a planted foot moved ${v} px`; } },
  { name: 'planted front feet on the floor', test: (log) => { const v = val(log, 'feetOnFloor'); return v === undefined || v === -Infinity || v === 0 || `foot ${v} px off the floor`; } },
];
