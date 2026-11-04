// Snow bus, the brief as numbers for tools/motion-lab/audit.mjs. Song frames at 24 fps.
// The bus stays in frame in the wide shots, never sinks below the street, the lights hold from f108 and it starts to
// roll on f172 (7.1 s on twos is drawing 85, frame 170, first moved drawing 172); the cuts land on their frames.
export const events = { cut60: [60], cut120: [120], lightsOn: [108], rollStart: [172] };
export const tolerance = [2, 2];
const val = (log, n) => (log.find((r) => r.kind === 'value' && r.name === n) || {}).v;
export const checks = [
  { name: 'bus never below the street', test: (log) => { const v = val(log, 'busY'); return v === undefined || v < .08 || `body ${v} m off its rest`; } },
];
