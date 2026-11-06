// tools/beat-sync config for Bob himself (2026-10-22, Robin: "set up the sync tool so bob can use it"). Uploaded with
// the tool, the teeth code and the clips to his folder as /<folder>/sync/ (files.novadiem.com, R2); linked from the
// round's about text ([label](/<folder>/sync/beat-sync.html?c=config.js), novadiem-files #83). Send posts his grid as
// a note on the round; turn its "Grid: a-b,c,..." ranges back into cells for tools/buh_onsets.py --slots.
const F = '/d23bb3f3f30a1172/sync/';
window.BEATSYNC = {
  title: 'The Reform Party: the chattering teeth',
  intro: 'Pick one of the three runs and press Play (or the space bar). The teeth chatter over the picture exactly as they will in the video. The strip under the picture is the beat: each little box is one sixteenth note, and gold boxes are where the teeth snap shut on a "buh". Click a box to add or remove a buh, or hold the mouse down and drag across several. Click the times along the top of the strip to jump there, and try 0.75 or 0.5 speed to check the start and end of each phrase. "Run earlier" and "Run later" nudge a whole run by one box. When it feels right, press Send to the studio and we will put your timing into the video.',
  storageKey: 'bob-buh-cells',
  scripts: [F + 'core.js', F + 'buh-onsets.js', F + 'buh-grid.js', F + 'buhteeth.js'],
  runs: [
    { label: 'Run 1 (0:35)', off: 35, len: 24, audio: F + 'run1.mp3', video: F + 'run1.mp4' },
    { label: 'Run 2 (1:33)', off: 93, len: 24, audio: F + 'run2.mp3', video: F + 'run2.mp4' },
    { label: 'Run 3 (2:50)', off: 170, len: 22, audio: F + 'run3.mp3', video: F + 'run3.mp4' },
  ],
  step: 60 / 99.4 / 4,
  grid: () => BUH_GRID, ref: () => BUH_REF,
  initialTimes: () => BUH_ONSETS,
  setTimes(ts) { BUH_RUNS.length = 0; for (const o of ts) { const r = BUH_RUNS[BUH_RUNS.length - 1]; if (r && o - r[r.length - 1] <= BUH.runGap) r.push(o); else BUH_RUNS.push([o]); } },
  draw(ctx, t) { window.g = ctx; buhTeeth(t); },
  send: { url: '/d23bb3f3f30a1172/review', round: 70, prefix: 'Buh timing from the sync tool', done: 'Sent. Thank you, we have it.' },
};
