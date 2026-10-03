// 320.0 - 341.46  his number. The last chant: the two of them small at the road's end, facing a sun the
// size of a clock with no hands. Then silence, and the grey hall: the board flips to 7436912, and his
// chair is empty. The board's amber is the last light.
(() => {
  const HIS = '7436912';
  // the chant's syllables, snapped to the vocal onsets
  const CHANT = [320.0, 320.43, 321.81, 322.39, 323.3, 324.33];

  // the kit leaves random gaps in the rows; fill the front row's so his is the only empty chair in it
  function frontRow() {
    for (const x of [-5.5, -4.4, -3.3, -2.2, -1.1, 1.1, 3.3, 4.4, 5.5]) if (hash(Math.round(x * 10) * 131 + 80) >= .8 && 8 - C.z >= 1) seat(x, 8, true);
  }

  // ---- shots ----
  // 320.0 the last "we've got... time": a wide, high sky; the road ends on a cloud; the two of them, small
  // silhouettes, hand in hand, and a huge low sun. Each "we've got" sends a ring off the sun.
  function horizon(t, lt) {
    fx({ sat: 1 });
    const zm = kf(t, [[320, 1], [326.3, 1.12]], ease.sine);
    s.fillStyle = vgrad(0, 820, [[0, '#2f68ad'], [.65, SKY_B], [1, '#f3d9a6']]); s.fillRect(-20, -20, W + 40, H + 40);
    withT(() => {
      s.translate(W / 2, 700); s.scale(zm, zm); s.translate(-W / 2, -700);
      // the sun: a clock face with no hands
      const sx = W / 2, sy = 640, R = 330;
      for (let i = 0; i < CHANT.length; i++) {
        const u = (t - CHANT[i]) / 2.4; if (u <= 0 || u >= 1) continue;
        s.globalAlpha = (1 - u) * .8; s.beginPath(); s.arc(sx, sy, R + u * 520, 0, TAU); s.lineWidth = 14 * (1 - u) + 2; s.strokeStyle = i % 2 ? ROSE : AMBER; s.stroke(); s.globalAlpha = 1;
      }
      const hold = smooth(inv(325.1, 326.0, t));
      withT(() => { s.globalAlpha = .35 + .3 * hold; s.fillStyle = rgrad(sx, sy, R * .9, R * 2.2, [[0, 'rgba(255,214,140,.9)'], [1, 'rgba(255,214,140,0)']]); s.fillRect(-W, -H, W * 3, H * 3); });
      dot(sx, sy, R, '#f6c25a'); s.lineWidth = 6; s.strokeStyle = INK; s.beginPath(); s.arc(sx, sy, R, 0, TAU); s.stroke();
      s.globalAlpha = .55; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; ink([[sx + Math.cos(a) * R * .8, sy + Math.sin(a) * R * .8], [sx + Math.cos(a) * R * .92, sy + Math.sin(a) * R * .92]], 5); } s.globalAlpha = 1;
      // the cloud sea, cutting the sun
      for (let i = -1; i < 9; i++) cloud(i * 300 + 60 + (i % 2) * 40, 770 + hash(i + 40) * 40, 110 + 30 * hash(i * 5), 1100 + i);
      shape([[-200, 790], [W + 200, 790], [W + 200, 1300], [-200, 1300]], '#efe8d6', 0);
      for (let i = -1; i < 8; i++) cloud(i * 330 + 120, 1100 + hash(i + 60) * 30, 150 + 30 * hash(i * 7), 1200 + i);
      // the road's last stretch, arriving from the left and stopping at the edge
      const rd = [[-120, 905], [400, 860], [760, 832], [880, 828]];
      line(rd, INK, 34); line(rd, '#8a8778', 28); withT(() => { s.setLineDash([16, 16]); line(rd, CREAM, 3); });
      // the two of them, silhouettes from behind, hand in hand
      const gx = 830, gy = 826, k = 78;
      const fig = (x, woman) => {
        ink([[x - .07 * k, gy], [x - .06 * k, gy - .9 * k]], .1 * k); ink([[x + .07 * k, gy], [x + .06 * k, gy - .9 * k]], .1 * k);
        poly(woman ? [[x - .22 * k, gy - .5 * k], [x + .22 * k, gy - .5 * k], [x + .14 * k, gy - 1.38 * k], [x - .14 * k, gy - 1.38 * k]] : [[x - .2 * k, gy - .88 * k], [x + .2 * k, gy - .88 * k], [x + .21 * k, gy - 1.42 * k], [x - .21 * k, gy - 1.42 * k]], INK);
        dot(x, gy - 1.55 * k, .12 * k, INK);
        if (woman) dot(x, gy - 1.7 * k, .07 * k, INK);
        else { s.beginPath(); s.ellipse(x, gy - 1.63 * k, .24 * k, .045 * k, 0, 0, TAU); s.fillStyle = INK; s.fill(); poly([[x - .12 * k, gy - 1.63 * k], [x + .12 * k, gy - 1.63 * k], [x + .1 * k, gy - 1.82 * k], [x - .1 * k, gy - 1.82 * k]], INK);
          const fl = Math.sin(t * 5) * .05 * k; poly([[x - .1 * k, gy - 1.4 * k], [x - .55 * k, gy - 1.32 * k + fl], [x - .5 * k, gy - 1.25 * k + fl], [x - .05 * k, gy - 1.33 * k]], '#2f8f7f'); }
      };
      fig(gx - 26, false); fig(gx + 26, true);
      ink([[gx - 26 + .2 * k, gy - 1.3 * k], [gx, gy - .82 * k], [gx + 26 - .18 * k, gy - 1.3 * k]], .08 * k);   // their joined hands
      poly([[gx - 26 - .44 * k, gy - .75 * k], [gx - 26 - .22 * k, gy - .75 * k], [gx - 26 - .22 * k, gy - .4 * k], [gx - 26 - .44 * k, gy - .4 * k]], INK);   // the case
    });
  }
  // 326.3 silence. Back inside the grey hall: still waiting, still 0004. His chair is empty.
  function hallBack(t, lt) {
    fx({ sat: .32 });
    cam({ x: .6, z: kf(t, [[326.3, -1.4], [328.6, -1.1]], (k) => k), y: -.25, f: 860, vy: 470 });
    room(t); duct(-3.6, -2.1, .5, 0, FAR); duct(2.8, -2.25, .32, 0, FAR, STEEL_D); tube(t); board(t, '0004');
    rows(t, 2.2, 8); frontRow(); horn(t); clock(t, -6.95, -1.0, 16); ticketBox();
  }
  // 328.6 the board, close: NOW SERVING flips to his number (329.0).
  function flip(t, lt) {
    fx({ sat: .32 });
    s.fillStyle = '#3d4140'; s.fillRect(-20, -20, W + 40, H + 40);
    s.globalAlpha = .4; for (let x = 0; x < W; x += 160) ink([[x, 0], [x + 40, H]], 1.2); s.globalAlpha = 1;
    const push = kf(t, [[328.6, 1], [332.6, 1.08]], ease.sine);
    withT(() => {
      s.translate(W / 2, H / 2); s.scale(push, push); s.translate(-W / 2, -H / 2);
      for (const x of [520, 1400]) ink([[x, -20], [x, 230]], 6);
      withT(() => { s.globalAlpha = .5; s.fillStyle = rgrad(W / 2, 560, 100, 900, [[0, 'rgba(240,178,58,.35)'], [1, 'rgba(240,178,58,0)']]); s.fillRect(-W, -H, W * 3, H * 3); });
      shape([[260, 230], [1660, 230], [1660, 900], [260, 900]], BRASS, 5);
      shape([[300, 270], [1620, 270], [1620, 860], [300, 860]], '#1f201c', 3);
      text('NOW SERVING', W / 2, 390, 92, { font: 'sign', color: AMBER, spacing: 8, max: 1320 - 120 });
      const cell = 220, cw = cell * .72, gap = cell * .08, n = 7, x0 = W / 2 - (n * (cw + gap) - gap) / 2;
      splitFlap(t, 329.0, HIS, x0, 500, cell, { prev: '   0004' });
    });
  }
  // 332.6 slow push to his row: the chair is empty, the case gone. The board glows at the end of the
  // hall with his number; everything else goes dark (black by 340.5).
  function empty(t, lt) {
    fx({ sat: .32 });
    const k = ease.inOut(inv(332.6, 340.5, t));
    cam({ x: lerp(1.2, 2.2, k), z: lerp(1.0, 5.9, k), y: lerp(-.3, -.1, k), f: 860, vy: lerp(470, 400, k) });
    room(t); duct(-3.6, -2.1, .5, 0, FAR); duct(2.8, -2.25, .32, 0, FAR, STEEL_D); board(t, HIS);
    rows(t, 2.2, 8); frontRow();
    // the dark comes in; the board's amber stays longest
    const dark = ease.in(inv(335.5, 340.3, t));
    if (dark > 0) {
      const b = P(0, -1.6, 52), c = P(2.2, .9, 8), pool = 1 - ease.in(inv(337.4, 339.9, t));
      // darkness everywhere, thinnest over his chair while it lasts
      withT(() => { const a0 = dark * (1 - pool * .75);
        s.fillStyle = rgrad(c[0], c[1], c[2] * .3, c[2] * 1.6, [[0, `rgba(13,13,11,${a0})`], [1, `rgba(13,13,11,${dark})`]]); s.fillRect(-W, -H, W * 3, H * 3); });
      const glow = 1 - ease.in(inv(338.4, 340.5, t));
      if (glow > 0) withT(() => { s.globalCompositeOperation = 'lighter'; s.globalAlpha = glow * dark;
        s.fillStyle = rgrad(b[0], b[1], 4, 260, [[0, 'rgba(240,178,58,.9)'], [.25, 'rgba(240,178,58,.35)'], [1, 'rgba(240,178,58,0)']]); s.fillRect(-W, -H, W * 3, H * 3); });
    }
    if (t > 340.5) fill('#0d0d0b');
  }

  chapter('his-number', 320.0, DUR, [[320.0, horizon], [326.3, hallBack], [328.6, flip], [332.6, empty]]);
})();
