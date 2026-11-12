// scenes/reprise.js · the last verse: the same park years later at dusk, nobody in it. The camcorder searches the
// way it did in verse 1 (swings, slide, along the bars, whip to the big tree, push in on the trunk's edge), slower,
// and finds no one. The swings move on their own. Robin chose the empty park (2026-11-11).
(function () {
  const S = window.TIMING.scenes;
  const LAUGH = 284.94, LOOKING = 291.25, TRYING = 299.46, FIND = 301.84, HEARS = 306.46, LAUGHING = 308.91, WHERE = 310.82, BE = 316.39;
  const KEYS = [
    [S.reprise, 872, 414, 1.25], [LAUGH, 866, 412, 1.25], [LOOKING, 858, 410, 1.25],
    [LOOKING + 3.6, 1046, 414, 1.3], [TRYING, 1102, 426, 1.62], [FIND, 1152, 440, 1.95], [FIND + 2.6, 1176, 442, 1.9],
    [HEARS, 1560, 470, 1.42], [LAUGHING - 0.2, 1600, 470, 1.4], [LAUGHING + 0.8, 1862, 440, 1.25],
    [WHERE, 1872, 446, 1.3], [BE - 0.6, 1904, 468, 2.55], [BE + 1.2, 1898, 466, 2.6], [S.outro, 1906, 470, 2.62],
  ];
  const FOCUS = [
    [S.reprise, 0.8], [S.reprise + 0.5, 0], [TRYING, 0], [TRYING + 0.4, 2.4], [TRYING + 0.9, 0.3], [FIND + 0.2, 1.3], [FIND + 0.6, 0],
    [LAUGHING + 0.2, 0.6], [LAUGHING + 1.0, 0], [WHERE + 1.5, 0], [WHERE + 2.3, 1.6], [WHERE + 3.0, 0.4], [BE, 0], [S.outro, 0],
  ];
  SCENE.add({
    id: 'reprise', t0: S.reprise, t1: S.outro,
    stamp: () => ({ date: 'JUN.14 1998', time: '8:41PM' }),
    camera: CAMKIT.rig(KEYS, FOCUS, 7, 0.85),
    bg: WORLD.bg, shadows: WORLD.shadowsEmpty, shapes: WORLD.shapesEmpty,
    over(g) {  // dusk: the same golden park, an hour later and years on
      g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
      g.globalCompositeOperation = 'multiply'; g.fillStyle = '#a990b4'; g.fillRect(0, 0, 960, 720);
      const lo = g.createLinearGradient(0, 0, 0, 720);
      lo.addColorStop(0, 'rgba(60,50,110,.35)'); lo.addColorStop(0.55, 'rgba(255,150,90,0)'); lo.addColorStop(1, 'rgba(40,30,60,.35)');
      g.globalCompositeOperation = 'multiply'; g.fillStyle = lo; g.fillRect(0, 0, 960, 720);
      g.restore();
    },
    light: { rim: '#ffb070', glow: 'rgba(255,150,90,.7)', glowBlur: 6, rimW: 1.1, sunDir: [0, -1], strength: 0.8 },
    source: () => ({ x: WORLD.SUN[0], y: WORLD.SUN[1] + 60, r: 260, a: 0.55 }),
    grade: { bright: 1.06, contrast: 1.04, sat: 0.96 },
  });
})();
