// 10,000 Miles song clock for the chorus 1 test. Times only, no lyric text (the lyrics stay out of git).
// words: faster-whisper small on the 40-65 s slice of the mix, 2026-11-09 (the first half of the chorus read as music;
// its hits are draft 1's pulses at 43.46, 45.42, 47.30). lines: the two chorus lines.
'use strict';
const CLOCK = songClock({
  audio: { file: 'source/10000-miles.mp3', sha256: '0cc9dd22bb8213d5b696935c6b1ec87cdcab682253decd91f72ef90bdc03c877', duration: 200.07 },
  fps: 24,
  words: [[49.76, 51.02], [51.02, 51.24], [51.24, 51.5], [51.5, 52.26], [54.48, 55.32], [55.32, 56.0], [56.0, 56.66],
          [58.58, 59.24], [59.24, 59.66], [59.66, 60.16], [60.16, 60.4], [60.4, 61.5]],
  lines: [[43.46, 52.26], [54.48, 61.5]],
  beats: [],
  cues: { hits: [43.46, 45.42, 47.30, 49.58, 54.18, 58.96] },
});
