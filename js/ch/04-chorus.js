// 110.0 - 133.0  the first chorus. The NOW SERVING board flips to the chant one row per "we got",
// every typewriter types it, every hat lifts, then the hall folds down flat like a paper set and
// there is sky on every side, until it folds back up and the board says 0004.
(() => {
  const BG = '#1f201c';
  // the big board, face on: brass frame, four rows of flaps
  const ROWS = [[110.30, 'WE GOT', '0003'], [111.97, 'WE GOT', ''], [113.07, 'WE GOT', ''], [114.62, 'WE GOT', '']];
  const TIME_AT = 116.97;
  function bigBoard(t, zoom = 1, shake = 0) {
    fill('#4d5250');
    s.globalAlpha = .3; for (let x = 0; x < W; x += 160) ink([[x, 0], [x, H]], 1.2); s.globalAlpha = 1;
    withT(() => {
      s.translate(W / 2, H / 2 + shake); s.scale(zoom, zoom); s.translate(-W / 2, -H / 2);
      ink([[560, -100], [560, 70]], 4); ink([[1360, -100], [1360, 70]], 4);
      shape([[170, 70], [W - 170, 70], [W - 170, 1030], [170, 1030]], BRASS, 5);
      shape([[200, 100], [W - 200, 100], [W - 200, 1000], [200, 1000]], '#33332c', 2.5);
      text('NOW SERVING', W / 2, 168, 52, { font: 'sign', color: AMBER, spacing: 10 });
      const cell = 156, cw = cell * .72, step = cw + cell * .08, x0 = W / 2 - (11 * step - cell * .08) / 2;
      ROWS.forEach(([t0, str, prev], r) => {
        const y = 222 + r * 192;
        splitFlap(t, t0, str.padEnd(6), x0, y, cell, { cols: 6, prev: prev.padEnd(6) });
        if (r === 3) splitFlap(t, TIME_AT, 'TIME', x0 + 7 * step, y, cell, { cols: 4 });
        else splitFlap(t, 1e9, '', x0 + 7 * step, y, cell, { cols: 4 });
        // the blank sixth-and-seventh cell between words
        splitFlap(t, 1e9, '', x0 + 6 * step, y, cell, { cols: 1 });
      });
    });
  }
  const flipHits = (t) => ROWS.reduce((a, r) => a + hit(t, r[0], 9), 0) + hit(t, TIME_AT, 7);

  // a seated man from behind whose hat lifts (kit seat() keeps its hat on)
  function sitter(x, z, lift, mine = false) {
    const b = P(x, FL, z), k = b[2], w = .42 * k, sy = P(x, .95, z)[1];
    if (b[1] < -50 || k < 2) return;
    ink([[b[0] - w * .8, b[1]], [b[0] - w * .8, sy]], 1.6); ink([[b[0] + w * .8, b[1]], [b[0] + w * .8, sy]], 1.6);
    shape([[b[0] - w, sy - .06 * k], [b[0] + w, sy - .06 * k], [b[0] + w, sy + .02 * k], [b[0] - w, sy + .02 * k]], '#5d5a4c', 1.4);
    const sh = sy - .78 * k;
    shape([[b[0] - w * 1.05, sy], [b[0] + w * 1.05, sy], [b[0] + w * .85, sh], [b[0] - w * .85, sh]], mine ? '#4f4c40' : COAT, 1.8);
    hatch([[b[0] + w * .2, sy], [b[0] + w * 1.05, sy], [b[0] + w * .85, sh], [b[0] + w * .3, sh]], .9, 6, 1, .35);
    dot(b[0], sh - .1 * k, .13 * k, SKIN); s.lineWidth = 1.5; s.strokeStyle = INK; s.beginPath(); s.arc(b[0], sh - .1 * k, .13 * k, 0, TAU); s.stroke();
    const hy = sh - .2 * k - lift * .3 * k, tilt = lift * .25;
    // the arm that raises it
    if (lift > .05) ink([[b[0] + w * .8, sh + .1 * k], [b[0] + w * 1.0, sh - .15 * k - lift * .1 * k], [b[0] + .2 * k, hy + .02 * k]], .07 * k);
    withT(() => { s.translate(b[0], hy); s.rotate(tilt);
      s.beginPath(); s.ellipse(0, 0, .25 * k, .06 * k, 0, 0, TAU); s.fillStyle = HAT; s.fill(); s.lineWidth = 1.5; s.strokeStyle = INK; s.stroke();
      shape([[-.14 * k, 0], [.14 * k, 0], [.12 * k, -.18 * k], [-.12 * k, -.18 * k]], HAT, 1.5); });
    if (mine) { const g = P(x + .5, FL, z - .1); shape([[g[0], g[1]], [g[0] + .18 * k, g[1]], [g[0] + .3 * k, g[1] - .95 * k], [g[0] + .1 * k, g[1] - 1.0 * k]], '#2b2924', 1.6); }
  }
  function crowd(t, lift) {
    for (let z = 56; z >= 8; z -= 2.4) for (const x of [-5.5, -4.4, -3.3, -2.2, -1.1, 1.1, 2.2, 3.3, 4.4, 5.5]) {
      if (z - C.z < 1) continue;
      const mine = Math.abs(x - 2.2) < .01 && Math.abs(z - 8) < .01;
      if (!mine && hash(Math.round(x * 10) * 131 + Math.round(z * 10)) >= .8) { seat(x, z, null); continue; }
      sitter(x, z, lift(x, z), mine);
    }
  }
  // hats go up on the sung syllables and come down slowly
  const HAT_HITS = [118.58, 122.13, 123.60, 124.20, 124.90, 125.70, 127.56, 128.97];
  const hatLift = (t, delay = 0) => { let v = 0; for (const h of HAT_HITS) { const d = t - h - delay; if (d >= 0) v = Math.max(v, d < .18 ? ease.out(d / .18) : Math.exp(-(d - .18) * 2.2)); } return v; };
  // a hanging board in the hall reading WE GOT TIME (world space)
  function hallBoard(t, l1, l2, z = 52, yo = 0) {
    const a = P(-3, -2.25 + yo, z), b = P(3, -.95 + yo, z);
    ink([[P(-2.2, CE + yo, z)[0], P(-2.2, CE + yo, z)[1]], [P(-2.2, -2.25 + yo, z)[0], a[1]]], 2); ink([[P(2.2, CE + yo, z)[0], P(2.2, CE + yo, z)[1]], [P(2.2, -2.25 + yo, z)[0], a[1]]], 2);
    shape([[a[0], a[1]], [b[0], a[1]], [b[0], b[1]], [a[0], b[1]]], BRASS, 3);
    const m = 6 * a[2] / 60; shape([[a[0] + m, a[1] + m], [b[0] - m, a[1] + m], [b[0] - m, b[1] - m], [a[0] + m, b[1] - m]], BG, 2);
    text(l1, (a[0] + b[0]) / 2, a[1] + (b[1] - a[1]) * .4, a[2] * .32, { font: 'sign', color: AMBER });
    text(l2, (a[0] + b[0]) / 2, a[1] + (b[1] - a[1]) * .86, a[2] * .5, { font: 'sign', color: AMBER });
  }

  // ---- shots ----
  // 110.0 the board, face on. One row flips per "we got".
  function flap(t, lt) {
    bigBoard(t, kf(t, [[110, 1.0], [113.93, 1.05]], ease.sine), flipHits(t) * 6);
  }
  // 113.93 the typing pool: three tiers of typewriters, symmetrical, every one typing the chant in unison.
  const POOL = [[114.62, 'WE GOT'], [115.40, ' TIME']];
  function pool(t, lt) {
    fill('#5d5a4c');
    s.globalAlpha = .3; for (let y = 0; y < H; y += 90) ink([[0, y], [W, y]], 1.2); s.globalAlpha = 1;
    let n = 0; for (const [ws, w] of POOL) { if (t < ws) break; n += Math.min(w.length, Math.floor((t - ws) * 14) + 1); }
    const strike = (() => { for (let i = POOL.length - 1; i >= 0; i--) { const d = t - POOL[i][0]; if (d >= 0) return d * 14 < POOL[i][1].length + .5 ? 1 - (d * 14) % 1 : 0; } return 0; })();
    const tiers = [[3, 440, 420], [5, 750, 340], [6, 1065, 280]];
    tiers.forEach(([cnt, y, sc], ti) => {
      const gap = W / cnt;
      for (let i = 0; i < cnt; i++) { const x = gap * (i + .5);
        typewriter(x, y, sc, { strike: strike * (i % 2 ? 1 : .8), paper: { lines: ['WE GOT', (n ? ('WE GOT TIME').slice(0, n) : '')], typed: 6 + n, title: '' } });
      }
    });
  }
  // 116.87 back to the board: TIME flips in under the last WE GOT.
  function board2(t, lt) {
    bigBoard(t, kf(t, [[116.87, 1.05], [118.4, .97]], ease.out), flipHits(t) * 6);
    fx({ flash: hit(t, TIME_AT + .4, 6) * .25 });
  }
  // 118.40 the hall from behind the rows. On "we've got time" every hat in the room lifts at once.
  function hats(t, lt) {
    cam({ x: .4, z: kf(t, [[118.4, 1.4], [122.1, 2.6]], ease.sine), y: -.3, f: 900, vy: 470 });
    room(t); duct(-3.6, -2.1, .5, 0, FAR); duct(2.8, -2.25, .32, 0, FAR, STEEL_D); tube(t);
    hallBoard(t, 'WE GOT', 'TIME');
    clock(t, -6.95, -1.0, 16);
    crowd(t, (x, z) => hatLift(t, (z - 8) * .004));
  }
  // 122.10 the hall folds flat: walls hinge down onto the floor, the ceiling lifts away with the board,
  // the far wall falls back, and there is sky on every side. The hats keep going up on every "got".
  // From 129.4 it folds back up.
  function unfoldHall(t, lt) {
    const open = ease.inOut(inv(122.1, 123.7, t)) * (1 - ease.inOut(inv(129.4, 131.0, t))), th = open * Math.PI / 2, HH = FL - CE;
    cam({ x: .4, z: lerp(2.6, -1.5, smooth(inv(122.1, 126, t)) * (1 - smooth(inv(129.2, 131, t)))), y: lerp(-.3, -1.5, open), f: 900, vy: lerp(470, 400, open) });
    fx({ sky: 1 });
    // sky everywhere
    s.fillStyle = vgrad(0, H, [[0, SKY_T], [1, SKY_B]]); s.fillRect(-20, -20, W + 40, H + 40);
    for (let i = 0; i < 7; i++) cloud(((i * 430 + t * 30 * (1 + hash(i) * .6)) % (W + 700)) - 350, 120 + hash(i + 3) * 520, 70 + 60 * hash(i + 7), 90 + i);
    const q = (pts) => pts.map(([x, y, z]) => { const p = P(x, y, z); return [p[0], p[1]]; });
    const z0 = C.z + .6;
    // far wall: hinged on the floor at z FAR, falls back
    const fw = (x, v) => [x, FL - v * Math.cos(th), FAR + v * Math.sin(th)];
    shape(q([fw(-WX, 0), fw(WX, 0), fw(WX, HH), fw(-WX, HH)]), '#9a9c8c', 2);
    // floor
    shape(q([[-WX, FL, z0], [WX, FL, z0], [WX, FL, FAR], [-WX, FL, FAR]]), '#a7a48f', 2);
    s.globalAlpha = .45;
    for (let z = Math.ceil(z0 / 1.6) * 1.6; z < FAR; z += 1.6) ink(q([[-WX, FL, z], [WX, FL, z]]), 1.3);
    for (let x = -WX; x <= WX; x += 1.4) ink(q([[x, FL, z0], [x, FL, FAR]]), 1.3);
    s.globalAlpha = 1;
    // side walls hinged on the floor edges; v = height up the wall
    const lw = (z, v) => [-WX - v * Math.sin(th), FL - v * Math.cos(th), z], rw = (z, v) => [WX + v * Math.sin(th), FL - v * Math.cos(th), z];
    for (const [wf, col, drawers] of [[lw, GREEN, true], [rw, GREEN_D, false]]) {
      shape(q([wf(z0, 0), wf(FAR, 0), wf(FAR, HH), wf(z0, HH)]), col, 2);
      s.globalAlpha = .55;
      if (drawers) { for (let v = .3; v < HH; v += .62) ink(q([wf(Math.max(z0, 2), v), wf(44, v)]), 1.2); for (let z = Math.max(2, Math.ceil(z0 / 1.3) * 1.3); z < 44; z += 1.3) ink(q([wf(z, .3), wf(z, HH - .2)]), 1.2); }
      else for (let z = 6; z < 50; z += 5) shape(q([wf(z, 0), wf(z + 1.4, 0), wf(z + 1.4, 2.3), wf(z, 2.3)]), '#6b6a5a', 1.5);
      s.globalAlpha = 1;
    }
    // the ceiling (with its ducts) lifts straight up and away, taking the board
    const yo = -open * 26;
    if (open < .98) {
      shape(q([[-WX, CE + yo, z0], [WX, CE + yo, z0], [WX, CE + yo, FAR], [-WX, CE + yo, FAR]]), '#3d4140', 2);
      duct(-3.6, -2.1 + yo, .5, 0, FAR); duct(2.8, -2.25 + yo, .32, 0, FAR, STEEL_D);
    }
    const closing = t > 129.4;
    hallBoard(t, closing ? 'NOW SERVING' : 'WE GOT', closing ? '0004' : 'TIME', 52, yo);
    crowd(t, (x, z) => Math.max(open * .7, hatLift(t, (z - 8) * .004)));
  }
  // 131.0 the board, face on, back to business: NOW SERVING 0004.
  function serving(t, lt) {
    fill('#4d5250');
    s.globalAlpha = .3; for (let x = 0; x < W; x += 160) ink([[x, 0], [x, H]], 1.2); s.globalAlpha = 1;
    const z = kf(t, [[131, 1.08], [133, 1.0]], ease.out);
    withT(() => { s.translate(W / 2, H / 2); s.scale(z, z); s.translate(-W / 2, -H / 2);
      ink([[700, -100], [700, 220]], 4); ink([[1220, -100], [1220, 220]], 4);
      shape([[380, 220], [W - 380, 220], [W - 380, 860], [380, 860]], BRASS, 5);
      shape([[410, 250], [W - 410, 250], [W - 410, 830], [410, 830]], '#33332c', 2.5);
      text('NOW SERVING', W / 2, 340, 64, { font: 'sign', color: AMBER, spacing: 10 });
      const cell = 330, cw = cell * .72, step = cw + cell * .08, x0 = W / 2 - (4 * step - cell * .08) / 2;
      splitFlap(t, 131.6, '0004', x0, 420, cell, { prev: 'TIME' });
    });
  }

  chapter('chorus', 110.0, 133.0, [
    [110.0, flap], [113.93, pool], [116.87, board2], [118.40, hats], [122.10, unfoldHall], [131.0, serving],
  ]);
})();
