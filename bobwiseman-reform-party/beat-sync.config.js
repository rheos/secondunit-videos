// tools/beat-sync config for the Reform Party chattering teeth (Bob's note 43, 2026-10-21).
// Open: /tools/beat-sync/beat-sync.html?c=/bobwiseman-reform-party/beat-sync.config.js (server rooted at the repo).
// The clips: assets/runN.mp3 cut from the song at each run's start, assets/runN.mp4 rendered from looks/dali-noteeth.html
// (the film without the teeth) over the same span. Robin's cells come back through tools/buh_onsets.py --slots.
const P = '/bobwiseman-reform-party/';
window.BEATSYNC = {
  title: 'Reform Party: the chattering teeth',
  storageKey: 'rp-buh-cells', // the same store BUH-SYNC.html used, so Robin's grid carries over
  scripts: [P + 'js/common/core.js', P + 'js/dali/buh-onsets.js', P + 'js/dali/buh-grid.js', P + 'js/dali/buhteeth.js'],
  runs: [
    { off: 35, len: 24, audio: P + 'assets/run1.mp3', video: P + 'assets/run1.mp4' },
    { off: 93, len: 24, audio: P + 'assets/run2.mp3', video: P + 'assets/run2.mp4' },
    { off: 170, len: 22, audio: P + 'assets/run3.mp3', video: P + 'assets/run3.mp4' },
  ],
  step: 60 / 99.4 / 4,
  grid: () => BUH_GRID, ref: () => BUH_REF,
  initialTimes: () => BUH_ONSETS,
  // buhteeth.js draws on the global g and reads its runs from BUH_RUNS
  setTimes(ts) { BUH_RUNS.length = 0; for (const o of ts) { const r = BUH_RUNS[BUH_RUNS.length - 1]; if (r && o - r[r.length - 1] <= BUH.runGap) r.push(o); else BUH_RUNS.push([o]); } },
  draw(ctx, t) { window.g = ctx; buhTeeth(t); },
};
