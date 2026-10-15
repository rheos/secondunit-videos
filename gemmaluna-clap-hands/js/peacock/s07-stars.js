// 129.2-142.48 CHORUS 3, "time and stars": opens on the clock face, small, which becomes the moon; the rowboat
// sails among the stars. Clap 2 (131.867) the stars join into one pair of constellation hands that clap; clap 3
// (135.9) four constellation pairs across the sky clap together, shooting stars fly off them; clap 4 (139.967)
// two great hands of the Milky Way clap, and the stars shower down. One falling star drops to the middle of the
// frame and swells: it becomes the spotlight on the theatre curtain (verse 3b).
const SPOT0 = { x: 540, y: 1180, r: 240 };   // where the theatre's spotlight opens (the falling star's end)
(() => {
  const [, K2, K3, K4] = CLAPS.slice(8, 12);
  // the hand as stars, open (palm to camera) and in profile; the stars slide between them as the hands close
  // 13 stars each: wrist, thumb, the four fingertips with the valleys between them, back to the wrist
  const OPEN = [[-.38, 0], [-.42, -.35], [-.8, -.82], [-.38, -.92], [-.3, -1.55], [-.2, -1.05], [-.1, -1.72], [0, -1.08], [.1, -1.66], [.2, -1.05], [.3, -1.46], [.4, -.6], [.38, 0]];
  const PROF = [[-.3, 0], [-.35, -.5], [.24, -.95], [-.33, -.9], [-.28, -1.3], [-.21, -1.62], [-.15, -1.72], [-.1, -1.84], [-.04, -1.86], [.02, -1.88], [.11, -1.8], [.17, -1.05], [.14, 0]];
  const TIPS = new Set([2, 4, 6, 8, 10]);
  const starAt = (x, y, r, col = C.goldPale) => { g.fillStyle = col; g.fill(star4(x, y, r)); };
  function constellation(t, cx, cy, sc, k, { rot = 0, milky = 0 } = {}) {
    const lt = t - k, a = ss(k - 1.1, k - .7, t) * (1 - ss(k + .9, k + 1.5, t));
    if (a <= 0) return;
    const d = lt < 0 ? Math.pow(clamp(-lt / .42), .6) : eo(clamp((lt - .06) / .45));
    const q = ss(.14, .58, d), off = lerp(.17, .85, d) * sc, draw = ss(k - 1.1, k - .6, t);
    g.save(); g.translate(cx, cy); g.rotate(rot);
    for (const dir of [-1, 1]) {
      const P = OPEN.map((p, i) => { const x = lerp(PROF[i][0], p[0], q), y = lerp(PROF[i][1], p[1], q); return [dir * off + (dir < 0 ? x : -x) * sc, y * sc]; });
      if (milky) { // the Milky Way runs down the arm from the wrist, out of the frame
        const wx = dir * off, n = 260;
        g.save(); g.globalAlpha *= .1 * a; const band = poly([[wx - .35 * sc, 0], [wx + .35 * sc, 0], [wx + dir * 1.6 * sc + .7 * sc, 3 * sc], [wx + dir * 1.6 * sc - .7 * sc, 3 * sc]]); g.fillStyle = C.tealLight; g.fill(band); g.restore();
        g.save(); g.globalAlpha *= .9 * a;
        for (let i = 0; i < n; i++) { const u = hash(i * 1.3 + dir), v = hash(i * 7.9 + dir) - .5, y = u * 3 * sc, x = wx + dir * 1.6 * sc * u + v * lerp(.6, 1.3, u) * sc; starAt(x, y, 2 + hash(i) * 5, i % 4 ? C.cream : C.goldPale); }
        g.restore();
      }
      g.save(); g.globalAlpha *= .6 * a; g.strokeStyle = C.goldPale; g.lineWidth = Math.max(2, sc * .012); g.lineJoin = 'round';
      const m = Math.max(2, Math.round(P.length * draw));
      g.beginPath(); P.slice(0, m).forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); if (m === P.length) g.closePath(); g.stroke(); g.restore();
      g.save(); g.globalAlpha *= a;
      P.forEach(([x, y], i) => { if (i >= m) return; const tw = .8 + .2 * Math.sin(t * 7 + i * 2 + dir); starAt(x, y, (TIPS.has(i) ? sc * .055 : sc * .035) * tw, i % 3 ? C.goldPale : C.white); });
      g.restore();
    }
    // the burst of stars on contact
    if (lt >= 0 && lt < .7) for (let i = 0; i < 12; i++) { const b = i / 12 * TAU, r = sc * (.2 + 1.4 * eo(lt / .7)); g.save(); g.globalAlpha *= (1 - lt / .7); starAt(Math.cos(b) * r, -sc * 1.1 + Math.sin(b) * r, sc * .06, C.white); g.restore(); }
    g.restore();
  }
  // a shooting star with a tapering trail
  function shooting(t, x0, y0, ang, t0, len = 600) {
    const d = t - t0; if (d < 0 || d > .9) return;
    const u = eo(d / .9), x = x0 + Math.cos(ang) * len * u, y = y0 + Math.sin(ang) * len * u;
    g.save(); g.globalAlpha *= 1 - d / .9; tendril([[x - Math.cos(ang) * 200, y - Math.sin(ang) * 200], [x - Math.cos(ang) * 80, y - Math.sin(ang) * 80], [x, y]], 10, C.goldPale, { sh: 0, grain: 0 }); starAt(x, y, 16, C.white); g.restore();
  }
  const SKY = [...Array(170).keys()].map((i) => [hash(i * 3.7) * 1200 - 60, hash(i * 9.1) * 2600 - 400, 3 + hash(i * 5.3) * 8, hash(i)]);
  const FOUR = [[270, 980, 150, -.35], [810, 930, 140, .35], [300, 1560, 170, -.2], [790, 1520, 160, .25]];
  SHOT(129.2, 142.48, 'stars', (t, k, d) => {
    const cy = kf3(t, [[129.2, 560], [130.8, 960]]);
    g.save(); cam(540, cy, 1.0);
    sheet(C.tealInk);
    for (let i = 0; i < 5; i++) { g.save(); g.globalAlpha *= .45; cut(cloud(200 + i * 220 + Math.sin(t * .15 + i) * 40, 500 + i * 380, 900, 260, i + 60), i % 2 ? C.tealDeep : C.plumDeep, { sh: 0, grain: .3 }); g.restore(); }
    for (const [x, y, r, p] of SKY) { g.save(); g.globalAlpha *= .55 + .45 * Math.sin(t * (1.5 + p * 3) + p * 20); starAt(x, y, r, p > .7 ? C.white : C.goldPale); g.restore(); }
    // the moon: the clock face turning into it
    const mo = ss(129.4, 130.7, t);
    g.save(); g.globalAlpha *= 1 - mo; clockFace(540, 560, 147, t, .3);
    for (const dir of [-1, 1]) clockHand(540, 560, dir * .6, 147 * .62, 147 * .16);
    g.restore();
    g.save(); g.globalAlpha *= mo; halo(540, 560, 147, t * .04, 1, [C.gold, C.cream, C.goldPale, C.gold]); g.restore();
    glow(540, 560, 420, '250,215,140', .25);
    // the rowboat sailing among the stars
    rowboat(lerp(540, 880, ss(129.2, 142.4, t)), lerp(329, 430, ss(129.2, 142.4, t)) + Math.sin(t * 1.3) * 10, lerp(.315, .42, ss(129.2, 131, t)), t * TAU / 1.03, 1);
    // the claps
    constellation(t, 540, 1320, 330, K2);
    for (const [x, y, sc, rot] of FOUR) { constellation(t, x, y, sc, K3, { rot }); for (let j = 0; j < 2; j++) shooting(t, x, y - sc, rot - Math.PI / 2 + (j ? .9 : -.9), K3 + .02 + j * .08, 700); }
    constellation(t, 540, 1360, 340, K4, { milky: 1 });
    // the shower of stars after the great clap; one falls to the middle and swells into the spotlight
    for (let i = 0; i < 46; i++) { const t0 = K4 + .1 + hash(i * 2.2) * 1.6; shooting(t, hash(i * 4.4) * 1200 - 60, -200 + hash(i * 6.6) * 600 + cy - 960, Math.PI / 2 + (hash(i) - .5) * .5, t0, 1600); }
    g.restore();
    const f = ss(141.3, 142.45, t);
    if (f > 0) { const y = lerp(260, SPOT0.y, eio(f)), r = lerp(14, SPOT0.r, ei(f));
      glow(SPOT0.x, y, r * 2.2, '250,215,140', .6 * f);
      g.save(); g.globalAlpha *= .3 + .7 * f; starAt(SPOT0.x, y, r * .4 + 14, C.white); g.restore();
      g.save(); g.globalAlpha *= ei(f); g.fillStyle = C.goldPale; g.fill(circle(SPOT0.x, y, r)); g.restore(); }
  }, { smooth: true });
})();
