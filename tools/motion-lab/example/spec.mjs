// The example's brief as numbers, for audit.mjs. Song frames at 24 fps.
export const events = { land: [24, 48, 72] };
export const tolerance = 0;
export const checks = [
  // squash and stretch keeps the volume readable: never flatter than 0.7 of its height
  { name: 'squash floor', test: (log) => { const s = log.find((r) => r.name === 'squash'); return !s || s.v >= 0.7 || `squashed to ${s.v.toFixed(2)}`; } },
];
