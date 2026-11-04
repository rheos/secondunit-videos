// Moss forest d4, the brief as numbers for tools/motion-lab/audit.mjs. Song frames at 24 fps.
export const events = { lidOpen: [178], plantL: [320], plantR: [342], cut86: [86], cut154: [154], cut216: [216] };
export const tolerance = 0;
const val = (log, n) => (log.find((r) => r.kind === 'value' && r.name === n) || {}).v;
export const checks = [
  { name: 'feet planted (0 slide while down)', test: (log) => { const v = val(log, 'footSlide'); return v === undefined || v === 0 || `a planted foot moved ${v} m`; } },
  { name: 'planted feet on the floor', test: (log) => { const v = val(log, 'feetOnFloor'); return v === undefined || v < .001 || `foot ${v} m off the floor`; } },
];
