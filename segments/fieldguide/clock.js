// The segment's clock. No song: a fixed 120 bpm grid stands in for the audio, and every cut sits on a beat.
// Format and helpers: engine/clock.js.
'use strict';
const CLOCK = songClock({
  audio: { file: null, duration: 15 },
  fps: 24,
  beats: Array.from({ length: 30 }, (_, i) => i * 0.5),
});
