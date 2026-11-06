// The vendor demo's brief as numbers, for audit.mjs. Song frames at 24 fps.
export const events = { dot: [48] };   // the dot arrives at 2.0 s
export const tolerance = 0;
export const checks = [
  // the star is fully drawn by 0.9 s (frame 22) and stays drawn
  { name: 'drawn by 0.9 s', test: (log, { frame }) => { const d = log.find((r) => r.name === 'draw'); return frame < 22 || !d || d.v >= 0.999 || `draw progress ${d.v.toFixed(3)} at frame ${frame}`; } },
  // the elastic pop never swings the dot past 1.4 x (the Penner curve peaks at 1.37)
  { name: 'dot pop', test: (log) => { const s = log.find((r) => r.name === 'dot-scale'); return !s || s.v <= 1.4 || `dot scale ${s.v.toFixed(2)}`; } },
];
