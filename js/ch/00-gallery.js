(() => {
  const { put, sky, backdrop } = GK; const P = GP;
  const sk = sky('g', [[0, '#3f7f86'], [.55, '#a9b8a0'], [1, '#e8b48e']], []);
  const pages = [
    () => { put(P.ministry, 20, 40, 0, .85); put(P.jaw, 20 + 600 * .85, 40 + 880 * .85, 0, .85); put(P.machine, 1450, 900, 0, .8);
      put(P.manLeg, 1180, 820, .3, .7); put(P.manCoat, 1180, 820, 0, .7); put(P.manHead, 1182, 724, 0, .7); put(P.manHat, 1189, 664, 0, .7); put(P.manArm, 1183, 736, -.2, .7); put(P.case, 1158, 865, 0, .55); },
    () => { put(P.boss, 500, 1050, 0, .9); put(P.bossJaw, 500, 1050 - 460 * .9, 0, .9); put(P.bossLid, 500 - 224 * .9, 1050 - 700 * .9, -.5, .9); put(P.horn, 1300, 900, 0, .9);
      put(P.wWHY, 1500, 120, 0, .5); put(P.wAREYOU, 1500, 260, 0, .5); put(P.wSOLATE, 1500, 400, 0, .5); },
    () => { put(P.cardBig, 300, 450, 0, 1); put(P.cardTL, 800, 400, -.1); put(P.cardBR, 900, 520, .1); put(P.grip, 1300, 400, 0, 1);
      for (let k = 0; k < 4; k++) { put(P['bird' + k], 1100 + k * 200, 900); put(P['wing' + k], 1100 + k * 200 - 10, 890, -.4); put(P['alarm' + k], 200 + k * 150, 1020); }
      put(P.cogA, 1700, 200); put(P.cogB, 1700, 420); put(P.rod, 1820, 600); },
    () => { put(P.hill, 0, 600); put(P.street, 0, 300); put(P.floor, 0, 0, 0, .5); put(P.lamp, 1800, 600); put(P.ministryFar, 1500, 600); put(P.panel, 960, 540, 0, .3); put(P.stampHead, 300, 1000, 0, .6); put(P.lever, 700, 900); put(P.grip, 1300, 800, 0, -.6, .6); },
  ];
  chapter('gal', 0, 10, pages.map((fn, i) => [i, function g(t) { GK.setStep(t); backdrop(sk); fn(); }]));
})();
