// 181.5 - 206.0  the chant. The ministry as a machine, cut on the beat: constructivist posters, the
// typebar basket, stamps, gears in a kaleidoscope, a top-down sea of hats, pneumatic tubes and ticker
// tape. One word per beat (WE / GOT). Panels hold four beats, then three, two, one; from ~199.5 the
// grey cracks and blue sky leaks in from the edges.
(() => {
  const B = FEAT.beats;
  const iWE = lastBeat(182.51);                       // the first "we" lands on this beat
  const bt = (t) => lastBeat(t);
  const word = (t) => t < 182.5 ? 'AND' : ((bt(t) - iWE) % 2 === 0 ? 'WE' : 'GOT');
  const wordOf = (k) => ((k - iWE) % 2 === 0 ? 'WE' : 'GOT');
  const since = (t) => t - B[Math.max(0, bt(t))];
  const BLACK = '#1d1c19', MID = '#8a8b7e', DARK = '#3d4140', PALE = '#d6cfb4';
  const FUT = 'Futura, "Gill Sans", sans-serif';
  // the pinball-cel drawing style (pnc.html): rounded, airbrushed, chrome and brass, deco ornament
  const K = window.PNC_ON ? window.PNCK : null;
  const glint = (cx, cy, r, a0 = Math.PI * 1.05, a1 = Math.PI * 1.45, w = .06) => { s.beginPath(); s.arc(cx, cy, r, a0, a1); s.lineWidth = Math.max(1, r * w); s.lineCap = 'round'; s.strokeStyle = 'rgba(255,250,235,.6)'; s.stroke(); };
  // a pinball mushroom bumper seen from above-front: a skirt, a glossy cap and a star
  function bumper(x, y, r) {
    K.blob([[x - r * 1.15, y + r * .35], [x + r * 1.15, y + r * .35], [x + r * 1.1, y + r * .7], [x - r * 1.1, y + r * .7]], STEEL_D, 1.2);
    K.ball(x, y, r, CREAM, 1.2); K.star(x, y + r * .05, r * .45, BRASS, 1);
  }

  // ---- helpers ----
  function bold(str, x, y, size, { color = INK, align = 'center', rot = 0, alpha = 1, spacing = 0, base = 'alphabetic', max = 0 } = {}) {
    if (max) { s.save(); s.font = `bold ${Math.round(size)}px ${FUT}`; const wd = s.measureText(str).width + spacing * str.length; s.restore(); if (wd > max) { spacing *= max / wd; size *= max / wd; } }
    withT(() => { s.translate(x, y); s.rotate(rot); s.globalAlpha *= alpha; s.fillStyle = color; s.textAlign = align; s.textBaseline = base;
      s.font = `bold ${Math.round(size)}px ${FUT}`; if (spacing) s.letterSpacing = spacing + 'px'; s.fillText(str, 0, 0); });
  }
  function clipRect(x, y, w, h) { s.beginPath(); s.rect(x, y, w, h); s.clip(); }
  function gear(cx, cy, r, n, rot, c = MID, hole = true) {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = rot + i / n * TAU, d = TAU / n;
      pts.push([cx + Math.cos(a) * r * .84, cy + Math.sin(a) * r * .84], [cx + Math.cos(a + d * .12) * r, cy + Math.sin(a + d * .12) * r],
        [cx + Math.cos(a + d * .42) * r, cy + Math.sin(a + d * .42) * r], [cx + Math.cos(a + d * .54) * r * .84, cy + Math.sin(a + d * .54) * r * .84]);
    }
    shape(pts, c, Math.max(2, r * .016));
    if (K) {
      glint(cx, cy, r * .78);
      if (!hole) return;
      s.beginPath(); s.arc(cx, cy, r * .62, 0, TAU); s.lineWidth = Math.max(1, r * .01); s.strokeStyle = K.dark(c, .55); s.stroke();
      for (let i = 0; i < 5; i++) { const a = rot + i / 5 * TAU, p0 = [cx + Math.cos(a) * r * .2, cy + Math.sin(a) * r * .2], p1 = [cx + Math.cos(a) * r * .62, cy + Math.sin(a) * r * .62];
        K.tube(p0, [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2], p1, r * .04, r * .03, K.light(c, .1), 1); }
      K.ball(cx, cy, r * .2, BRASS, Math.max(1, r * .01)); return;
    }
    if (!hole) return;
    s.beginPath(); s.arc(cx, cy, r * .62, 0, TAU); s.lineWidth = Math.max(1.5, r * .012); s.strokeStyle = INK; s.stroke();
    for (let i = 0; i < 5; i++) { const a = rot + i / 5 * TAU; ink([[cx + Math.cos(a) * r * .2, cy + Math.sin(a) * r * .2], [cx + Math.cos(a) * r * .62, cy + Math.sin(a) * r * .62]], Math.max(3, r * .07)); }
    dot(cx, cy, r * .2, DARK); s.beginPath(); s.arc(cx, cy, r * .2, 0, TAU); s.stroke(); dot(cx, cy, r * .07, CREAM);
  }
  // a clerk's silhouette, feet at (x, y), h px tall
  function tinyMan(x, y, h, c = INK, face = 1, cased = true) {
    const k = h / 1.8;
    line([[x - .07 * k, y], [x - .06 * k, y - .9 * k]], c, .13 * k, 'butt'); line([[x + .09 * k, y], [x + .06 * k, y - .9 * k]], c, .13 * k, 'butt');
    poly([[x - .23 * k, y - 1.45 * k], [x + .21 * k, y - 1.45 * k], [x + .31 * k, y - .42 * k], [x - .31 * k, y - .42 * k]], c);
    dot(x + .03 * k * face, y - 1.6 * k, .13 * k, c);
    s.beginPath(); s.ellipse(x + .03 * k * face, y - 1.69 * k, .25 * k, .05 * k, 0, 0, TAU); s.fillStyle = c; s.fill();
    poly([[x - .1 * k, y - 1.69 * k], [x + .16 * k, y - 1.69 * k], [x + .14 * k, y - 1.88 * k], [x - .08 * k, y - 1.88 * k]], c);
    if (cased) guitarCase(x - .12 * k * face, y - .45 * k, k, { dir: face, col: c, line: false });
  }
  // copy the frame into the centre cell of an n x n grid, then mirror that cell into the rest
  function tile(n) {
    const cv = s.canvas, cw = W / n, chh = H / n, sw = cv.width / n, sh = cv.height / n, m = (n - 1) / 2;
    withT(() => s.drawImage(cv, 0, 0, cv.width, cv.height, m * cw, m * chh, cw, chh));
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
      if (r === m && c === m) continue;
      withT(() => { s.translate(c * cw + cw / 2, r * chh + chh / 2); s.scale((c - m) % 2 ? -1 : 1, (r - m) % 2 ? -1 : 1);
        s.drawImage(cv, m * sw, m * sh, sw, sh, -cw / 2, -chh / 2, cw, chh); });
    }
    for (let i = 1; i < n; i++) { ink([[i * cw, 0], [i * cw, H]], 10); ink([[0, i * chh], [W, i * chh]], 10); }
  }
  // kaleidoscope: keep the wedge [0, th] around (cx, cy) and mirror it all the way round (2m wedges)
  function kaleido(m, cx = W / 2, cy = H / 2) {
    const cv = s.canvas, th = Math.PI / m, R = 2400;
    for (let k = 1; k < 2 * m; k++) withT(() => {
      s.beginPath(); s.moveTo(cx, cy); s.arc(cx, cy, R, k * th - .002, (k + 1) * th + .002); s.closePath(); s.clip();
      s.translate(cx, cy);
      if (k % 2) { s.rotate((k + 1) * th); s.scale(1, -1); } else s.rotate(k * th);
      s.translate(-cx, -cy);
      s.drawImage(cv, 0, 0, cv.width, cv.height, 0, 0, W, H);
    });
  }
  function hub(t, r = 170, inv = false) {
    const p = hit(t, B[Math.max(0, bt(t))], 8), rr = r * (1 + .12 * p);
    if (K) {
      K.fan(W / 2, H / 2, rr + 70, 16, 0, TAU, inv ? ['#3a3934', '#55534a'] : [BRASS, CREAM], 1);
      s.beginPath(); s.arc(W / 2, H / 2, rr, 0, TAU); K.soft(inv ? BLACK : CREAM, W / 2 - rr, H / 2 - rr, W / 2 + rr, H / 2 + rr); s.lineWidth = 1.5; s.strokeStyle = K.LINE; s.stroke();
      for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; K.ball(W / 2 + Math.cos(a) * (rr - 18), H / 2 + Math.sin(a) * (rr - 18), 7, BRASS, .8); }
    } else {
    dot(W / 2, H / 2, rr + 18, inv ? CREAM : INK); dot(W / 2, H / 2, rr, inv ? BLACK : CREAM);
    s.beginPath(); s.arc(W / 2, H / 2, rr - 16, 0, TAU); s.lineWidth = 3; s.strokeStyle = inv ? CREAM : INK; s.stroke();
    }
    const w = word(t);
    bold(w, W / 2, H / 2 + rr * .3, rr * (w.length > 2 ? .72 : .9), { color: inv ? CREAM : INK, max: rr * 1.5 });
  }
  // the grey cracks; sky behind. amt 0..1
  function cracks(t, amt) {
    if (amt <= 0) return;
    const sky = () => vgrad(0, H, [[0, SKY_T], [1, SKY_B]]);
    const R = rng(4471), N = 16;
    for (let i = 0; i < N; i++) {
      const side = Math.floor(R() * 4), u = .08 + R() * .84, len = 260 + R() * 420, w0 = 16 + R() * 26, seg = 7, jit = [];
      for (let j = 0; j < seg * 2 + 4; j++) jit.push(R() - .5);
      const g = clamp((amt - i / N * .7) / .3); if (g <= 0) continue;
      let x = side === 0 ? u * W : side === 1 ? W : side === 2 ? u * W : 0, y = side === 0 ? 0 : side === 1 ? u * H : side === 2 ? H : u * H;
      let a = Math.atan2(H / 2 - y, W / 2 - x) + jit[0] * .9;
      const L = [], Rr = []; const L1 = len * ease.out(g);
      for (let j = 0; j <= seg; j++) {
        const wj = w0 * (1 - j / seg) * (.6 + .4 * g);
        const nx = -Math.sin(a), ny = Math.cos(a);
        L.push([x + nx * wj, y + ny * wj]); Rr.unshift([x - nx * wj * (.5 + jit[j + 2]), y - ny * wj * (.5 + jit[j + 2])]);
        x += Math.cos(a) * L1 / seg; y += Math.sin(a) * L1 / seg; a += jit[j + seg + 2] * .9;
      }
      const pts = L.concat(Rr);
      s.fillStyle = sky(); s.beginPath(); pts.forEach(([px, py], j) => j ? s.lineTo(px, py) : s.moveTo(px, py)); s.closePath(); s.fill();
      s.lineWidth = 3; s.strokeStyle = INK; s.stroke();
    }
    // late: shards break off at the corners, with a cloud in them
    const big = clamp((amt - .6) / .4); if (big <= 0) return;
    const corners = [[0, 0, 1, 1], [W, 0, -1, 1], [W, H, -1, -1], [0, H, 1, -1]];
    corners.forEach(([cx, cy, sx, sy], ci) => {
      const r = big * (260 + 140 * hash(ci + 50)) * (ci % 2 ? 1.25 : 1), pts = [[cx, cy]];
      for (let j = 0; j <= 6; j++) { const a = j / 6 * Math.PI / 2, rr = r * (.75 + .5 * hash(ci * 13 + j)); pts.push([cx + sx * Math.cos(a) * rr * 1.5, cy + sy * Math.sin(a) * rr]); }
      withT(() => { s.beginPath(); pts.forEach(([px, py], j) => j ? s.lineTo(px, py) : s.moveTo(px, py)); s.closePath(); s.fillStyle = sky(); s.fill();
        s.save(); s.clip(); cloud(cx + sx * r * .55, cy + sy * r * .45 + 40, 46 + 20 * big, 90 + ci); s.restore();
        s.beginPath(); pts.forEach(([px, py], j) => j ? s.lineTo(px, py) : s.moveTo(px, py)); s.closePath(); // cloud() leaves its own path behind
        s.lineWidth = window.PNC_ON ? 1.6 : 4; s.strokeStyle = window.PNC_ON ? window.PNCK.LINE : INK; s.stroke(); });
    });
  }

  // ---- panels (each paints the whole frame) ----
  // constructivist poster: sunburst, a gear for a sun, the black diagonal with the word on it, a tiny clerk
  function poster(t, o = {}) {
    const sg = o.flip ? -1 : 1, inv = !!o.inv, k = bt(t), pb = since(t), punch = hit(t, B[Math.max(0, k)], 9);
    const bg = inv ? BLACK : CREAM, fg = inv ? CREAM : BLACK;
    fill(bg);
    const cx = W / 2 - sg * 560, cy = 250;
    if (K) K.fan(cx, cy, 1700, 12, k * TAU / 48, TAU + k * TAU / 48, inv ? ['#2e2d29', '#3a3934'] : [PALE, CREAM], 1.2);
    else for (let i = 0; i < 24; i += 2) { const a = i / 24 * TAU + k * TAU / 48; poly([[cx, cy], [cx + Math.cos(a) * 2600, cy + Math.sin(a) * 2600], [cx + Math.cos(a + TAU / 24) * 2600, cy + Math.sin(a + TAU / 24) * 2600]], inv ? '#2e2d29' : PALE); }
    gear(cx, cy, 215, 14, k * TAU / 28 + ease.out(pb / .15) * TAU / 28, MID);
    // the thin ticker band, scrolling a word per beat
    withT(() => {
      s.translate(W / 2, 880); s.rotate(-.42 * sg);
      shape([[-1500, -44], [1500, -44], [1500, 44], [-1500, 44]], inv ? MID : DARK, 3);
      const off = (k + ease.out(pb / .2)) * 230;
      for (let j = -9; j < 9; j++) bold(wordOf(k - j), -sg * (j * 230 - off % 460 + (k % 2) * 230), 26, 66, { color: CREAM, alpha: .9, max: 200 });
    });
    // the big band and the word
    withT(() => {
      s.translate(W / 2, 560); s.rotate(-.42 * sg);
      shape([[-1500, -175], [1500, -175], [1500, 175], [-1500, 175]], fg, 4);
      // a clerk standing on the band's top edge, upright, tiny against it
      withT(() => { s.translate(-sg * 620, -175); s.rotate(.42 * sg); tinyMan(0, 0, 110, fg, sg); });
      if (K) for (const sx of [-1150, 1150]) K.star(sx, 0, 70, bg === CREAM ? CREAM : BRASS, 1.2);
      const w = word(t), sc = 1 + .22 * punch;
      s.scale(sc, sc); bold(w, sg * 120, 118, w.length > 2 ? 300 : 330, { color: bg, spacing: 6, max: 1100 });
    });
  }
  // the typebar basket: a fan of bars; one swings up to the platen on each beat and types the word
  function typebars(t, o = {}) {
    fill('#2a2925');
    const k = bt(t), pb = since(t), S = [W / 2, 455], N = 31, Rp = 430;
    // the paper on the platen: the chant so far, carriage moving left a word at a time
    shape([[150, 40], [W - 150, 40], [W - 150, 420], [150, 420]], CREAM, 3);
    s.globalAlpha = .3; for (let y = 120; y < 420; y += 70) ink([[200, y], [W - 200, y]], 1.2); s.globalAlpha = 1;
    const words = []; for (let j = Math.max(iWE, k - 8); j <= k; j++) words.push(wordOf(j));
        withT(() => { clipRect(150, 40, W - 300, 380);
      let back = '';   // only whole words, as many as fit between the paper's left margin and the strike point
      for (let j = words.length - 2; j >= 0; j--) { const c = words[j] + (back ? ' ' + back : ''); if (textWidth(c, 120) > W / 2 - 24 - 200) break; back = c; }
      text(back, W / 2 - 24, 240, 120, { align: 'right', alpha: .9 });
      const fresh = clamp(pb / .1);
      text(words[words.length - 1], W / 2 - 4, 240, 120, { align: 'left', alpha: fresh });
    });
    shape([[60, 410], [W - 60, 410], [W - 60, 500], [60, 500]], BLACK, 3);                  // the platen roller
    s.globalAlpha = .35; for (let x = 80; x < W - 60; x += 26) ink([[x, 418], [x, 492]], 1.4); s.globalAlpha = 1;
    shape([[S[0] - 90, 440], [S[0] + 90, 440], [S[0] + 90, 474], [S[0] - 90, 474]], '#55534a', 2);   // the ribbon
    // the bars
    const strike = (k * 7 + 3) % N;
    const theta = pb < .09 ? ease.in(pb / .09) * Math.PI : pb < .2 ? Math.PI : Math.PI * (1 - ease.out((pb - .2) / .3));
    for (let pass = 0; pass < 2; pass++) for (let i = 0; i < N; i++) {
      const isS = i === strike; if ((pass === 1) !== isS) continue;
      const a = .14 + i / (N - 1) * (Math.PI - .28), dx = Math.cos(a), dy = Math.sin(a);
      const pv = [S[0] + dx * Rp, S[1] + dy * Rp], r = Rp + Rp * Math.cos(isS ? theta : 0);
      const tip = [S[0] + dx * r, S[1] + dy * r];
      const wdt = isS ? 15 + 10 * Math.sin(theta) : 14;
      if (K) { K.tube(pv, [(pv[0] + tip[0]) / 2, (pv[1] + tip[1]) / 2], tip, wdt * .55, wdt * .4, isS ? '#c9c7b4' : '#8f8d7d', 1); K.ball(pv[0], pv[1], 10, BRASS, .8); }
      else { line([pv, tip], INK, wdt + 6); line([pv, tip], isS ? '#b9b7a4' : '#8f8d7d', wdt);
      dot(pv[0], pv[1], 10, INK); }
      withT(() => { s.translate(tip[0], tip[1]); s.rotate(a - Math.PI / 2); shape([[-16, -10], [16, -10], [16, 22], [-16, 22]], isS ? CREAM : '#c9c2a8', 2);
        text(isS ? word(t)[0] : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ01234'[i], 0, 15, 22, { font: 'sign', max: 26 }); });
    }
    // the segment that holds the pivots
    s.beginPath(); s.arc(S[0], S[1], Rp, .1, Math.PI - .1); s.lineWidth = 22; s.strokeStyle = INK; s.stroke();
    s.lineWidth = 12; s.strokeStyle = BRASS; s.stroke();
    void o;
  }
  // two stamps, one a side; the left one says WE, the right one GOT; the forms fill up with imprints
  function stamps(t, o = {}) {
    const k = bt(t), inv = !!o.inv;
    for (const side of [0, 1]) withT(() => {
      clipRect(side * W / 2, 0, W / 2, H);
      const light = (side === 0) !== inv;
      s.fillStyle = light ? '#6e6e64' : CREAM; s.fillRect(side * W / 2, 0, W / 2, H);
      const fx0 = side * W / 2 + 90, fw = W / 2 - 180;
      shape([[fx0, 140], [fx0 + fw, 140], [fx0 + fw, 1000], [fx0, 1000]], light ? CREAM : '#a9a898', 3);
      text('FORM WGT-89', fx0 + fw - 20, 182, 26, { font: 'sign', align: 'right', max: fw - 40 });
      s.globalAlpha = .3; for (let y = 240; y < 980; y += 64) ink([[fx0 + 30, y], [fx0 + fw - 30, y]], 1.2); s.globalAlpha = 1;
      const want = side === 0 ? 'WE' : 'GOT';
      for (let j = k - 5; j <= k + 1; j++) {
        if (j < iWE || wordOf(j) !== want) continue;
        const R = rng(j * 31 + side), slot = ((j - iWE) >> 1) % 3, x = fx0 + fw * (.32 + R() * .36), y = 330 + slot * 250 + R() * 60;
        stamp(t, B[j], x, y, want, { size: j === k || j === k + 1 ? 170 : 130, color: INK, rot: (R() - .5) * .5 });
      }
    });
    shape([[W / 2 - 14, 0], [W / 2 + 14, 0], [W / 2 + 14, H], [W / 2 - 14, H]], BLACK, 2);
  }
  // the machine: gears turning a notch on every beat, a duct and a tube canister, for the kaleidoscope
  function machine(t, o = {}) {
    fill(o.inv ? '#2a2925' : DARK);
    const k = bt(t), pb = since(t), step = k + ease.back(pb / .22), cx = W / 2, cy = H / 2;
    // radial duct
    withT(() => { s.translate(cx, cy); s.rotate(.38);
      shape([[200, -90], [1300, -150], [1300, 150], [200, 90]], STEEL, 3);
      for (let x = 260; x < 1300; x += 80) { const h = 90 + (x - 200) * .055; s.beginPath(); s.ellipse(x, 0, h * .3, h, 0, 0, TAU); s.lineWidth = 3; s.strokeStyle = INK; s.stroke(); }
      hatch([[200, 30], [1300, 50], [1300, 150], [200, 90]], .9, 8, 1.2, .45); });
    gear(cx + 520, cy + 150, 230, 16, step * TAU / 32, MID);
    gear(cx + 860, cy + 470, 170, 12, -step * TAU / 24 + .13, '#a7a48f');
    gear(cx + 330, cy + 40, 100, 9, -step * TAU / 18, BRASS);
    gear(cx + 1000, cy + 140, 120, 10, step * TAU / 20, STEEL_D);
    // a canister flying out along the wedge on each beat
    const d = 200 + pb * 1500;
    if (K) { bumper(cx + 700, cy + 330, 64); bumper(cx + 430, cy + 290, 48); withT(() => { s.translate(cx, cy); s.rotate(.18); K.ball(d + 50, 0, 40, STEEL, 1.2); K.ball(d + 140, 0, 30, STEEL, 1); }); return; }
    withT(() => { s.translate(cx, cy); s.rotate(.18);
      shape([[d, -26], [d + 120, -26], [d + 120, 26], [d, 26]], BRASS, 3); ink([[d + 30, -26], [d + 30, 26]], 2); ink([[d + 90, -26], [d + 90, 26]], 2); });
  }
  // a sea of hats from above; on each beat a set of rows lifts its hats: a slip under each with the word
  function hats(t, o = {}) {
    fill('#a7a48f');
    s.globalAlpha = .35; for (let x = 0; x < W; x += 120) ink([[x, 0], [x, H]], 1.3); for (let y = 0; y < H; y += 120) ink([[0, y], [W, y]], 1.3); s.globalAlpha = 1;
    const k = bt(t), pb = since(t), lift = pb < .12 ? ease.out(pb / .12) : 1 - ease.inOut((pb - .3) / .4), w = word(t);
    const sp = 230, list = [];
    for (let r = -1; r < 7; r++) for (let c = -1; c < 10; c++) {
      const x = c * sp + (r % 2 ? sp / 2 : 0) + 50, y = r * 190 + 80;
      if (r === 3 && c === 4) { list.push({ x, y, empty: true }); continue; }
      const up = ((r + k) % 2 === 0) && k >= iWE - 1 ? lift : 0;
      list.push({ x, y, up });
    }
    const draw = ({ x, y, up, empty }) => {
      if (empty) { shape([[x - 60, y - 50], [x + 60, y - 50], [x + 60, y + 50], [x - 60, y + 50]], '#6e6a5a', 2.5); hatch([[x - 60, y - 50], [x + 60, y - 50], [x + 60, y + 50], [x - 60, y + 50]], .8, 10, 1.2, .3); return; }
      if (K) { s.beginPath(); s.ellipse(x, y + 10, 92, 48, 0, 0, TAU); K.soft(COAT, x - 92, y - 38, x + 92, y + 58); s.lineWidth = 1.2; s.strokeStyle = K.dark(COAT, .55); s.stroke(); K.ball(x, y, 34, SKIN, 1); }
      else {
      s.beginPath(); s.ellipse(x, y + 10, 92, 48, 0, 0, TAU); s.fillStyle = COAT; s.fill(); s.lineWidth = 2.5; s.strokeStyle = INK; s.stroke();   // shoulders
      dot(x, y, 34, SKIN); s.beginPath(); s.arc(x, y, 34, 0, TAU); s.stroke(); }
      if (up > .2) withT(() => { s.translate(x, y); s.rotate(-.1); shape([[-38, -16], [38, -16], [38, 16], [-38, 16]], CREAM, 2); text(w, 0, 10, w.length > 2 ? 24 : 28, { font: 'sign', max: 64 }); });
      const hx = x + up * 20, hy = y - up * 95, sc = 1 + up * .3;
      s.globalAlpha = .25 + .1 * up; dot(x + 10 + up * 30, y + 14 + up * 20, 60, INK); s.globalAlpha = 1;
      if (K) { K.ball(hx, hy, 64 * sc, HAT, 1.2); K.ball(hx, hy, 38 * sc, '#55524a', 1); s.beginPath(); s.arc(hx, hy, 42 * sc, 0, TAU); s.lineWidth = 5; s.strokeStyle = '#2a2924'; s.stroke(); return; }
      s.beginPath(); s.arc(hx, hy, 64 * sc, 0, TAU); s.fillStyle = HAT; s.fill(); s.lineWidth = 3; s.strokeStyle = INK; s.stroke();
      s.beginPath(); s.arc(hx, hy, 38 * sc, 0, TAU); s.fillStyle = '#4c4a41'; s.fill(); s.stroke();
      s.beginPath(); s.arc(hx, hy, 42 * sc, 0, TAU); s.lineWidth = 6; s.strokeStyle = '#2a2924'; s.stroke();
      ink([[hx - 14 * sc, hy - 6 * sc], [hx + 14 * sc, hy + 6 * sc]], 3);    // the crease
    };
    list.filter(h => !h.up).forEach(draw); list.filter(h => h.up).forEach(draw);
    void o;
  }
  // a wall of pneumatic tubes; one spits ticker tape that carries the chant, a word per beat
  function tubes(t, o = {}) {
    fill(GREEN_D);
    const k = bt(t), pb = since(t);
    for (let r = 0; r < 7; r++) {
      const y = 90 + r * 150, dir = r % 2 ? -1 : 1;
      s.globalAlpha = .55; s.fillStyle = '#c7d0cf'; s.fillRect(0, y - 34, W, 68); s.globalAlpha = 1;
      ink([[0, y - 34], [W, y - 34]], 3); ink([[0, y + 34], [W, y + 34]], 3);
      if (K) line([[0, y - 22], [W, y - 22]], 'rgba(255,250,235,.5)', 5);
      for (let j = k - 2; j <= k; j++) { const lt = t - B[Math.max(0, j)] - r * .04; if (lt < 0) continue;
        let x = lt * 2600 - 200; if (dir < 0) x = W - x; const cw = 150;
        if (K) { K.ball(x - 30, y, 28, STEEL, 1); K.ball(x + 30, y, 28, STEEL, 1); continue; }
        shape([[x - cw / 2, y - 26], [x + cw / 2, y - 26], [x + cw / 2, y + 26], [x - cw / 2, y + 26]], BRASS, 2.5); ink([[x - cw / 2 + 24, y - 26], [x - cw / 2 + 24, y + 26]], 2); ink([[x + cw / 2 - 24, y - 26], [x + cw / 2 - 24, y + 26]], 2); }
      for (let x = 120; x < W; x += 360) shape([[x - 12, y - 44], [x + 12, y - 44], [x + 12, y + 44], [x - 12, y + 44]], STEEL_D, 2);
    }
    // the mouth and its tape
    const mx = 250, my = 520, flare = 1 + .1 * hit(t, B[Math.max(0, k)], 10);
    const path = (u) => [mx + 90 + u, my + Math.sin(u * .0042 - t * 1.4) * 120 + u * .2];
    const L = 2400;
    const pts = []; for (let u = 0; u <= L; u += 40) pts.push(path(u));
    withT(() => { s.lineCap = 'butt'; s.lineJoin = 'round';
      s.lineWidth = 118; s.strokeStyle = INK; s.beginPath(); pts.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y)); s.stroke();
      s.lineWidth = 110; s.strokeStyle = CREAM; s.stroke(); });
    const speed = 420;
    for (let j = k; j >= Math.max(iWE, k - 14); j--) {
      const u = (t - B[j]) * speed + 120; if (u > L - 60) break;
      const p = path(u), q = path(u + 6), a = Math.atan2(q[1] - p[1], q[0] - p[0]);
      text(wordOf(j), p[0], p[1] + 2, 64, { font: 'type', rot: a, align: 'center', max: 260 });
      withT(() => { s.translate(p[0], p[1]); s.rotate(a); s.globalAlpha = .45; ink([[150, -48], [150, 48]], 1.6); });
    }
    withT(() => { s.translate(mx, my); s.scale(flare, flare);
      shape([[-200, -120], [90, -150], [90, 150], [-200, 120]], BRASS, 4);
      s.beginPath(); s.ellipse(90, 0, 40, 150, 0, 0, TAU); s.fillStyle = '#2a2a24'; s.fill(); s.lineWidth = 4; s.strokeStyle = INK; s.stroke(); });
    void o;
  }
  // low angle: a vast duct over a tiny clerk, and a split-flap panel bolted to the duct flipping the word
  function flap(t, o = {}) {
    fill(CREAM);
    const k = bt(t), sg = o.flip ? -1 : 1;
    if (K) K.fan(W / 2, 1000, 1500, 10, Math.PI, TAU, [PALE, CREAM], 1.2);
    else for (let i = 0; i < 20; i += 2) { const a = Math.PI + i / 40 * Math.PI; poly([[W / 2, 1000], [W / 2 + Math.cos(a) * 2400, 1000 + Math.sin(a) * 2400], [W / 2 + Math.cos(a + Math.PI / 40) * 2400, 1000 + Math.sin(a + Math.PI / 40) * 2400]], PALE); }
    // the duct, sweeping in from the top corner
    withT(() => { s.translate(W / 2, 380); s.rotate(.16 * sg);
      shape([[-1400, -330], [1400, -250], [1400, 250], [-1400, 330]], STEEL, 4);
      for (let x = -1350; x < 1400; x += 150) { const h = 330 - (x + 1400) * .03; s.beginPath(); s.ellipse(x, 0, h * .22, h, 0, 0, TAU); s.lineWidth = 4; s.strokeStyle = INK; s.stroke(); }
      hatch([[-1400, 120], [1400, 90], [1400, 250], [-1400, 330]], .9, 9, 1.4, .5);
      // the panel
      shape([[-430, -210], [430, -210], [430, 210], [-430, 210]], BRASS, 5);
      for (const [bx, by] of [[-400, -180], [400, -180], [400, 180], [-400, 180]]) { if (K) K.ball(bx, by, 12, BRASS, 1); else dot(bx, by, 9, INK); }
      // every cell flips together, early, so the word settles exactly on its beat
      const kf2 = bt(t + .26), w = (word(t + .26) + '   ').slice(0, 3), prev = (word(B[Math.max(0, kf2)] - .05) + '   ').slice(0, 3);
      for (let i = 0; i < 3; i++) splitFlap(t, B[Math.max(0, kf2)] - .26 - i * .03, w[i], -360 + i * 340 * .8, -170, 340, { prev: prev[i] });
    });
    shape([[-20, 960], [W + 20, 960], [W + 20, H + 20], [-20, H + 20]], BLACK, 3);
    tinyMan(W / 2 - sg * 380, 962, 120, BLACK, sg);
  }
  // four panes at once
  function quad(t) {
    const cells = [[typebars, {}], [hats, {}], [machine, { inv: true }], [poster, { flip: true }]];
    cells.forEach(([fn, o], i) => withT(() => { const cx = (i % 2) * W / 2, cy = Math.floor(i / 2) * H / 2; clipRect(cx, cy, W / 2, H / 2); s.translate(cx, cy); s.scale(.5, .5); fn(t, o); }));
    ink([[W / 2, 0], [W / 2, H]], 12); ink([[0, H / 2], [W, H / 2]], 12);
  }

  // ---- shots ----
  const crackAmt = (t) => Math.pow(smooth(inv(199.4, 205.9, t)), 1.3);
  const C = (fn) => function shot(t, lt) { fn(t, lt); cracks(t, crackAmt(t)); };
  function s01poster(t) { poster(t, {}); }
  function s02typebars(t) { typebars(t); }
  function s03stamps(t) { stamps(t); }
  function s04gears(t) { machine(t); kaleido(4); hub(t); }
  function s05hats(t) { hats(t); }
  function s06tubes(t) { tubes(t); }
  function s07flap(t) { flap(t); }
  function s08quad(t) { quad(t); }
  const s09hatsK = C(function (t) { hats(t); kaleido(3); hub(t, 150); });
  const s10poster = C(function (t) { poster(t, { inv: true, flip: true }); });
  const s11stamps = C(function (t) { stamps(t, { inv: true }); });
  const s12gears = C(function (t) { machine(t, { inv: true }); kaleido(6); hub(t, 150, true); });
  const s13typebars = C(function (t) { typebars(t); });
  const s14tile = C(function (t) { poster(t, {}); tile(3); });
  const s15flap = C(function (t) { flap(t, { flip: true }); });
  const s16all = C(function (t) { machine(t); kaleido(8); hub(t, 190); });

  chapter('machine', 181.5, 206.0, [
    [181.5, s01poster], [184.77, s02typebars], [187.70, s03stamps], [190.63, s04gears], [192.87, s05hats],
    [195.07, s06tubes], [196.53, s07flap], [197.97, s08quad], [199.47, s09hatsK],
    [200.90, s10poster], [201.57, s11stamps], [202.23, s12gears], [202.90, s13typebars], [203.57, s14tile], [204.30, s15flap], [205.03, s16all],
  ]);
})();
