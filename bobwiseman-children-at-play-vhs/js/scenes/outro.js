// scenes/outro.js · the end of the tape. The last take keeps running a breath on the empty tree, then the camcorder
// stops and the rest of the cassette is blank (black here; the TV stage turns blank tape into snow, then STOP, then
// switches the set off). TIMING.tapeEnd is when the recording stops.
(function () {
  const T = window.TIMING, S = T.scenes, R = SCENE.get('reprise');
  SCENE.add({
    id: 'outro', t0: S.outro, t1: S.end,
    stamp: (t) => (t < T.tapeEnd ? R.stamp(t) : null),
    camera: (t) => R.camera(Math.min(t, T.tapeEnd)),
    bg(g, t) { if (t < T.tapeEnd) R.bg(g, t); else { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#000'; g.fillRect(0, 0, 960, 720); g.restore(); } },
    shadows(g, t) { if (t < T.tapeEnd) R.shadows(g, t); },
    shapes(g, t) { if (t < T.tapeEnd) R.shapes(g, t); },
    over(g, t) { if (t < T.tapeEnd) R.over(g, t); },
    light: R.light,
    source: (t) => (t < T.tapeEnd ? R.source(t) : null),
    grade: R.grade,
  });
})();
