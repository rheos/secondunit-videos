// What render.mjs reads: the length, frame rate and size, and one call that draws a frame.
'use strict';
window.__seg = { dur: CLOCK.duration, fps: CLOCK.fps, size: [W, H], shots: SHOTS.map((s) => ({ name: s.key, t0: s.t0, t1: s.t1 })) };
window.__frame = (t, q = .93) => window.__frameJPEG(t, q);
