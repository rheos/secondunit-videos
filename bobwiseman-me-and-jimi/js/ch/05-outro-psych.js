// 207.9 - 225.2  OUTRO, leg 2 (the 60s light show): out of the tunnel's black into the liquid light.
// The train streaks across in ink silhouette, its windows full of light show; behind it, on the little stage,
// her silhouette with her guitar (a shape only, no face), seen between the carriages. On the hit at 217.33
// CAFE AU GO GO melts across the sky. At 225.2 the train dives into a 1966 bill, which flips to blank paper.
(() => {
  const C = PSY.C, KEY = PSY.KEY, T = (x) => onTwos(x, 12);
  const A = 207.9, B = 225.2, HIT = 217.33;
  function rc(x, y, w, h, c) { s.fillStyle = c; s.fillRect(x, y, w, h); }
  function her(x, y, sc, t) {
    s.save(); s.translate(x, y); s.scale(sc, sc); s.fillStyle = C.ink;
    const sw = Math.sin(t * 2.1) * 6, nod = beatPulse(t, 8) * 8;
    [[0, -600, 120], [-95, -560, 90], [95, -560, 90], [-120, -470, 75], [120, -470, 75], [-60, -660, 80], [60, -660, 80]].forEach(([hx, hy, r]) => { s.beginPath(); s.arc(hx + sw, hy + nod, r, 0, TAU); s.fill(); });
    s.fillRect(-110 + sw, -520 + nod, 220, 100);
    s.beginPath(); s.moveTo(-120 + sw, -440); s.quadraticCurveTo(sw, -470, 120 + sw, -440); s.lineTo(160, -60); s.lineTo(190, 0); s.lineTo(-190, 0); s.lineTo(-160, -60); s.closePath(); s.fill();
    s.save(); s.translate(30 + sw * .5, -280); s.rotate(-.5); s.fillStyle = C.or; s.beginPath(); s.ellipse(-20, 30, 150, 118, 0, 0, TAU); s.ellipse(110, 20, 100, 84, 0, 0, TAU); s.fill(); s.lineWidth = 10; s.strokeStyle = C.ink; s.stroke();
    s.fillStyle = C.ink; s.fillRect(190, 6, 430, 34); s.fillRect(600, -8, 90, 62); s.restore();
    s.restore();
  }
  function shotLight(t, l) {
    const tt = T(t), melt = .3 + .7 * hit(t, HIT, 1.1) + .2 * inv(A, B, t);
    fx({ melt, beat: beatPulse(t, 5) });
    rc(0, 0, W, H, KEY);
    // out of the black: the tunnel's dark shrinks away in the first half second
    const out = smooth(inv(A, A + .7, t)); if (out < 1) { s.fillStyle = C.ink; s.beginPath(); s.rect(0, 0, W, H); s.ellipse(W / 2, H / 2, 1 + out * 1300, 1 + out * 900, 0, 0, TAU, true); s.fill('evenodd'); }
    // the stage and her, far back
    s.fillStyle = C.pu; s.beginPath(); s.moveTo(560, 1000); s.lineTo(1360, 1000); s.lineTo(1300, 900); s.lineTo(620, 900); s.closePath(); s.fill();
    her(960, 905, .62, t);
    // the train, in front, carriages streaking left to right; the gaps between them show her
    const sp = 1300, CAR = 760, x0 = ((tt - A) * sp) % CAR - CAR;
    for (let c = 0; c < 4; c++) {
      const x = x0 + c * CAR;
      rc(x + 40, 300, CAR - 80, 420, C.ink);
      for (let w = 0; w < 3; w++) rc(x + 80 + w * 210, 360, 170, 200, KEY);
      rc(x + 40, 690, CAR - 80, 30, C.mg);
      s.fillStyle = C.ink; [x + 140, x + CAR - 140].forEach((wx) => { s.beginPath(); s.arc(wx, 740, 46, 0, TAU); s.fill(); });
    }
    rc(0, 780, W, 24, C.ink);
    // the melting name over the sky on the hit
    if (t > HIT - .1) { const k = smooth(inv(HIT - .1, HIT + .6, t)); s.save(); s.globalAlpha = 1; s.font = '900 170px "Superclarendon"'; s.fillStyle = C.or; s.textAlign = 'center'; s.lineWidth = 10; s.strokeStyle = C.ink; const y = 210 + Math.sin(t * 2) * 12; s.strokeText('CAFE AU GO GO', W / 2, y * k + 210 * (1 - k)); s.fillText('CAFE AU GO GO', W / 2, y); s.restore(); }
    // into the 1966 bill: it grows from the centre over the last 1.6 s and fills the frame with paper
    const bill = ease.in(inv(B - 1.6, B, t));
    if (bill > 0) { const w = 200 + bill * 2200, h = w * 1.35; s.save(); s.translate(W / 2, H / 2); s.rotate((1 - bill) * .3); rc(-w / 2, -h / 2, w, h, C.mg); rc(-w / 2 + w * .03, -h / 2 + w * .03, w * .94, h - w * .06, '#f3e7cf'); s.restore(); }
  }
  chapter('outro-p', A, B, [[A, shotLight]]);
})();
