// cleanline song clock: the audio is the clock. One object holds the audio pin, the frame grid and every timed list.
//
//   const CLOCK = songClock({
//     audio: { file: '<the song file>', sha256: '...', duration: 180 },  // pinned: render/check refuse another file
//     fps: 24,
//     beats: [t, ...],                          // instants, seconds
//     words: [[t0, t1], ...], lines: [[t0, t1], ...],
//     cues:  { name: [[t0, t1, ...extra], ...] } // every other timed list, same span format
//   });
//
// One format for everything timed: a span is [t0, t1, ...extra] in song seconds, half-open [t0, t1). An instant is a
// bare number. On the frame grid, song frame f covers [f/fps, (f+1)/fps) and a span covers frames [f0, f1).
// Runs in the page and in Node (cleanline/bin loads it with vm to read the pin), so no DOM in here.
'use strict';
function songClock(d) {
  const fps = d.fps || 24, audio = d.audio || {}, duration = audio.duration || 0;
  const frameAt = (t) => Math.floor(t * fps + 1e-6);   // the frame a time falls in
  const timeOf = (f) => f / fps;                       // a frame's start time
  const spanFrames = ([t0, t1]) => [Math.round(t0 * fps), Math.round(t1 * fps)]; // half-open [f0, f1) on the grid
  const beats = (d.beats || []).slice(), words = (d.words || []).slice(), lines = (d.lines || []).slice(), cues = d.cues || {};
  // the span of list that contains t, or null (lists are sorted by start)
  const spanAt = (list, t) => { for (const s of list) { if (t >= s[0] && t < s[1]) return s; if (s[0] > t) break; } return null; };
  // index of the last beat at or before t (-1 before the first)
  const beatIndex = (t) => { let lo = 0, hi = beats.length - 1, k = -1; while (lo <= hi) { const m = (lo + hi) >> 1; if (beats[m] <= t) { k = m; lo = m + 1; } else hi = m - 1; } return k; };
  return {
    fps, audio, duration, frames: Math.round(duration * fps),
    frameAt, timeOf, spanFrames,
    // the drawing a frame shows when drawn on twos (or threes): the first frame of its hold
    heldFrame: (t, hold = 2) => { const f = frameAt(t); return f - (f % hold); },
    beats, words, lines, cues,
    beatIndex,
    sinceBeat: (t) => { const k = beatIndex(t); return k < 0 ? Infinity : t - beats[k]; },
    beatPhase: (t) => { const k = beatIndex(t); if (k < 0 || k + 1 >= beats.length) return 0; return (t - beats[k]) / (beats[k + 1] - beats[k]); },
    wordAt: (t) => spanAt(words, t), lineAt: (t) => spanAt(lines, t),
    cue: (name) => { if (!cues[name]) throw new Error(`clock: no cue list "${name}"`); return cues[name]; },
    cueAt: (name, t) => spanAt(cues[name] || [], t),
    spanAt,
  };
}
if (typeof module === 'object' && module.exports) module.exports = { songClock };
