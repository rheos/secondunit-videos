// 225.2 - 243.2  OUTRO, leg 3 (Kobe, paper theatre): out of the blank bill paper, the stage fills again: Hiroshige's
// sky and sea, and a Meiji steam train cut from Kuniteru's Takanawa Steam Railway triptych (1879, Met CC0) running
// along the shore on a paper track, left to right; the Pacific Mail steamer from earlier passes out at sea the other
// way; the wave (Hokusai) rears up behind the train on the hit at 226.77 and sinks back. At 243.2 the stage tips
// forward and everything slides off, leaving paper.
(() => {
  const A = 225.2, B = 243.2, T = (x) => onTwos(x, 12);
  function shotShore(t, l) {
    const K = window.PAPERKIT; if (!K || !K.P.train) return;
    const tt = T(t), on = (a, d = .7) => ease.out(inv(a, a + d, tt)), off = ease.in(inv(B - .9, B, tt));
    s.fillStyle = '#f3e7cf'; s.fillRect(0, 0, W, H);
    s.save(); s.translate(0, off * H * 1.1);
    s.save(); s.translate(0, (on(A) - 1) * 600); K.backdrop('ajikawa', [52, 62, 1098, 234], [-10, -10, W + 20, 560]); s.restore();
    s.save(); s.translate(0, (1 - on(A + .2)) * 700); K.backdrop('ajikawa', [52, 294, 1098, 470], [-10, 470, W + 20, 640]); s.restore();
    // the steamer far out, the other way
    if (K.P.ship) K.put('ship', 710, 410, lerp(1700, 300, inv(A, B, t)), 560 + Math.sin(tt * 1.3) * 4, .45, { rot: Math.sin(tt * 1.3) * .02, sh: .5 });
    // Hokusai's wave rears up behind the train on the hit, then sinks
    const w = hit(t, 226.77, .45) * smooth(inv(226.6, 226.9, t));
    if (K.P.wave && w > .01) { s.save(); s.beginPath(); s.rect(0, 0, W, 930); s.clip(); K.put('wave', 300, 560, 600, 930 + (1 - w) * 640, .9, { rot: -.05 + w * .05, sh: .8 }); s.restore(); }
    // the paper track: a long strip with sleepers drawn on it
    s.save(); s.shadowColor = 'rgba(20,16,10,.45)'; s.shadowBlur = 18; s.shadowOffsetY = 10; s.fillStyle = '#5b4632'; s.fillRect(-20, 930, W + 40, 36); s.restore();
    s.fillStyle = K.CREAM; s.fillRect(-20, 926, W + 40, 5);
    for (let i = 0; i < 26; i++) { s.fillStyle = '#3d2f22'; s.fillRect(i * 80 - ((tt * 120) % 80), 938, 40, 22); }
    // the train, left to right, bobbing on its rod; it comes in at A + .8
    const x = lerp(-1800, W + 1900, inv(A + .8, B - .6, t));
    K.put('train', 1146, 552, x, 948 + Math.sin(tt * 9) * 3, 1.85, { rot: Math.sin(tt * 4.5) * .004, sh: 1.1 });
    // puffs of paper steam from the funnel
    for (let k = 0; k < 5; k++) { const a = ((tt * 1.4 + k / 5) % 1); K.paperDisc(x - 140 * 1.85 / 1.85 - 160 - a * 500, 560 - a * 160 - k * 4, 26 + a * 50, '#f2ece0', 0); }
    s.restore();
  }
  chapter('outro-k', A, B, [[A, shotShore]]);
})();
