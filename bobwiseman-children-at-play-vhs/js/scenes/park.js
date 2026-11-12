// scenes/park.js · verse 1, the park at golden hour (world.js + camera.js): the mother's camcorder looks for the
// laughing hider. Built and approved as the look test (draft 2, 2026-11-11).
(function () {
  const T = window.TIMING, S = T.scenes;
  SCENE.add({
    id: 'park', t0: S.park, t1: S.grandma, takes: [T.cut],
    stamp: (t) => ({ date: 'AUG.17 1991', time: t < T.cut ? '5:41PM' : '5:44PM' }),
    camera: (t) => CAMERA.at(t),
    bg: WORLD.bg, shadows: WORLD.shadows, shapes: WORLD.shapes, over: WORLD.crownLight,
    light: { rim: '#ffd890', glow: 'rgba(255,198,120,.85)', glowBlur: 7, rimW: 1.25, sunDir: [0, -1] },
    source: () => ({ x: WORLD.SUN[0], y: WORLD.SUN[1], r: 330, a: 1 }),
    exposure: (cam, s) => {
      const sunIn = s ? Math.max(0, 1 - Math.max(Math.abs(s[0] - 480) / (960 * 0.62), Math.abs(s[1] - 360) / (720 * 0.7))) : 0;
      const shade = Math.max(0, Math.min(1, (cam.cx - 1680) / 160));
      return { bright: 1.0 - 0.1 * sunIn + 0.1 * shade, contrast: 1.05 + 0.04 * sunIn, sat: 1.04 };
    },
  });
})();
