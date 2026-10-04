(() => {
  const { piece, put, sky, backdrop, TINT, E, R, PL, BL } = GK;
  const t0 = performance.now();
  const ball = piece('ball', { w: 400, h: 400 }, (m) => {
    m.f(E(200, 200, 180), ['r', 140, 130, 10, 260, [[0, .95], [.6, .5], [1, .12]]], TINT.rose);
    m.s(E(200, 200, 180), 3);
    m.f(E(200, 120, 60, 30), .2, TINT.sage, .8);
  });
  const sk = sky('dusk', [[0, '#3f7f86'], [.55, '#a9b8a0'], [1, '#e8b48e']], [[500, 300, 600, 140, 'rgba(255,240,225,A)', .5]]);
  console.log('load ms', performance.now() - t0);
  chapter('test', 206, 245, [[206, function test(t) { GK.setStep(t); backdrop(sk); put(ball, 960, 540, 0, 1.4); put(ball, 400, 600, .3, .6); }]]);
})();
