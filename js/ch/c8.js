// js/ch/c8.js · STORM AT DAWN (153.400 - 186.200) · instrumental break + verse 4 · look: storm (silver-grey mono)
// One location: bare hills under a lightning storm at first light. The break is driven by the drums (lightning
// in the clouds on every hard hit, bolts on the biggest); the verse lands its images on the sung words.
// Handoffs: c7's burning sky breaks up into storm clouds, so we open inside the rolling clouds with the last
// warmth draining out of them; we end with the sun tearing through the storm and flaring into c9's blaze.
(() => {
  const A = 153.4, Z = 186.2;
  const tHands = when('hands', 166), tEmbers = when('embers', 167), tEyes = when('eyes', 168), tGold = when('gold', 168.8);
  const tRattle = when('rattle', 170), tHums = when('hums', 170.6), tDesert = when('desert', 171.4);
  const tLightning = when('lightning', 173.5), tHills = when('hills', 174.4), tDawn = when('dawn', 175.2);
  const tFire = when('fire', 176.3), tBelong = when('belong', 178);
  const tFoot = when('footsteps', 180), tUnspun = when('unspun', 181.4), tDreams = when('dreams', 182.8), tBegun = when('begun', 184.6);
  const STRIKE = tLightning + .05; // the bolt hits the far hill

  // colour mix that also takes rgb() strings (so mixes can nest)
  const rgbOf = (c) => c[0] === '#' ? [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)) : c.match(/[\d.]+/g).slice(0, 3).map(Number);
  const mx = (a, b, k) => { const A_ = rgbOf(a), B_ = rgbOf(b), q = clamp(k); return `rgb(${A_.map((v, i) => Math.round(lerp(v, B_[i], q))).join(',')})`; };

  const HZ = 1250; // horizon (world y)
  const RIM = 'rgba(214,224,240,.9)';

  // ---------- the drums ----------
  // hard hits in the break (F('perc') local peaks): flickers on all of them, bolts on the biggest
  const HITS = [], BOLTS = [];
  { const P_ = FEAT.perc, fps = FEAT.fps; let last = -9;
    for (let i = Math.floor(A * fps) + 1; i < Math.floor(166 * fps); i++) {
      if (P_[i] > P_[i - 1] && P_[i] >= P_[i + 1] && P_[i] > .84 && i / fps - last > .3) { HITS.push(i / fps); last = i / fps; if (P_[i] > 1.05) BOLTS.push(i / fps); } } }
  // a lightning envelope: the main flash plus a fainter re-strike 70 ms later
  const flickAt = (t, c) => Math.max(hit(t, c, 16), .55 * hit(t, c + .07, 22));
  const flicker = (t, list = HITS) => { let m = 0; for (const c of list) if (t >= c && t < c + .6) m = Math.max(m, flickAt(t, c)); return m; };
  const lastOf = (t, list) => { let r = -1; for (let i = 0; i < list.length; i++) if (list[i] <= t) r = i; return r; };
  const fastPulse = (t, decay = 7) => { const b = FEAT.fast; let lo = 0, hi = b.length - 1; if (t < b[0]) return 0;
    while (lo < hi) { const m = (lo + hi + 1) >> 1; if (b[m] <= t) lo = m; else hi = m - 1; } return Math.exp(-decay * (t - b[lo])); };
  // the dawn behind the storm grows over the chapter
  const dawnK = (t) => kf(t, [[A, .1], [tDawn, .35], [tDreams, .5], [Z, 1]], ease.inOut);

  // ---------- the sky ----------
  // rolling storm cumulus: banks of lobes with pale tops catching the dawn and dark bellies
  function cloudBank(t, seed, y, thick, speed, top, belly, n, lite = 0) {
    const r = rng(seed), span = 5600, x0 = -2000;
    const topC = lite > .01 ? mx(top, '#d6dbe2', lite * .22) : top, midC = mx(belly, topC, .45);
    for (let i = 0; i < n; i++) {
      const cs = seed * 131 + i * 17, L = thick * (4.5 + r() * 4.5), bx = ((r() * span + t * speed * (.7 + .6 * r())) % span + span) % span + x0, by = y + (r() - .5) * thick * .9, hh = thick * (1.0 + r() * .9), drift = t * .06;
      // a torn, flat-bottomed storm bank: a ragged heaped top over a long flat base, the ends shredding downwind
      const N = 44, topE = [], botE = [];
      for (let k = 0; k <= N; k++) { const u = k / N, env = Math.pow(Math.sin(Math.PI * u), .55), x = bx + (u - .5) * L;
        const lift = hh * env * (.35 + .65 * noise1(u * 5 + cs + drift, 7)) + hh * .18 * env * (noise1(u * 17 + cs, 8) - .5);
        topE.push([x + (1 - env) * thick * .6, by - lift]);
        botE.push([x + (1 - env) * thick * .9, by + thick * .06 * (noise1(u * 9 + cs, 9) - .5) - (1 - env) * hh * .25]); }
      s.fillStyle = vgrad(s, by - hh, by + thick * .1, [[0, topC], [.45, midC], [.8, belly], [1, mx(belly, '#000000', .25)]]);
      s.beginPath(); topE.forEach(([px, py], k) => k ? s.lineTo(px, py) : s.moveTo(px, py)); for (let k = N; k >= 0; k--) s.lineTo(botE[k][0], botE[k][1]); s.closePath(); s.fill();
      // streaks inside the bank (wind-combed, lighter above, darker below) so the strokes have direction to follow
      for (let k = 0; k < 7; k++) { const u0 = .08 + hash(cs + k * 5) * .6, u1 = Math.min(.95, u0 + .2 + hash(cs + k * 5 + 1) * .3), yy = by - hh * (.1 + .6 * hash(cs + k * 5 + 2)) * Math.sin(Math.PI * (u0 + u1) / 2);
        stroke(s, [[bx + (u0 - .5) * L, yy], [bx + (u1 - .5) * L, yy + thick * .04]], k & 1 ? mx(midC, topC, .3) : mx(belly, midC, .6), thick * (.04 + .04 * hash(cs + k)), 'round'); }
      // wisps: scud torn off the base and the leeward end, trailing downwind
      for (let k = 0; k < 6; k++) { const u = k < 3 ? .75 + k * .09 : .15 + hash(cs + k * 3) * .6, px = bx + (u - .5) * L, py = by + thick * (.02 + .12 * hash(cs + k * 3 + 1)), wl = thick * (1.2 + 1.8 * hash(cs + k * 3 + 2)), sway = Math.sin(t * .7 + k + i) * thick * .05;
        s.globalAlpha = .55; taper(s, [px, py], [px + wl, py + sway + thick * .1], thick * .08, thick * .01, k < 3 ? midC : belly); s.globalAlpha = 1; }
    }
  }
  // the whole storm: a dark vault, a pale dawn band at the horizon, 3 cloud decks in parallax.
  // warm 0..1 keeps c7's burning colour in it (the handoff); lite = lightning inside the clouds
  function stormSky(t, o = {}) {
    const { warm = 0, lite = 0, hz = HZ, speed = 1, dawn = dawnK(t) } = o;
    const top = mx('#15171c', '#3a120e', warm), mid = mx('#3c4048', '#8a2c18', warm), low = mx(mx('#80868e', '#b7b2a6', dawn), '#e0782a', warm);
    s.fillStyle = vgrad(s, hz - 1700, hz, [[0, top], [.62, mid], [1, low]]); s.fillRect(-2000, hz - 4000, 6000, 4000);
    glow(SC + 200, hz - 40, 1300, `rgba(235,225,200,${.07 + .12 * dawn})`);
    // turbulence behind the decks: soft dark and pale billows so the whole vault churns
    const r = rng(820);
    for (let i = 0; i < 16; i++) { const bx = ((r() * 5200 + t * (18 + r() * 30) * speed) % 5200) - 1600, by = hz - 200 - r() * 1600, br = 300 + r() * 500, dk = r() > .45;
      const c = dk ? mx(top, '#000000', .2) : mx(mid, low, .5); const [cr, cg, cb] = rgbOf(c);
      s.fillStyle = rgrad(s, bx, by, 0, br, [[0, `rgba(${cr},${cg},${cb},.7)`], [1, `rgba(${cr},${cg},${cb},0)`]]); s.fillRect(bx - br, by - br, br * 2, br * 2); }
    const deck = (k) => mx(['#262a31', '#383d45', '#50555d'][k], ['#4a1a12', '#7a2a16', '#a8401c'][k], warm);
    const tops = (k) => mx(mx(['#6a7079', '#8a9098', '#a8aeb4'][k], '#c9ccd0', dawn * .5), ['#a8401c', '#d8642a', '#f08a38'][k], warm);
    cloudBank(t, 811, hz - 1250, 260, 26 * speed, tops(0), deck(0), 7, lite);
    cloudBank(t, 812, hz - 820, 200, 44 * speed, tops(1), deck(1), 8, lite * .8);
    cloudBank(t, 813, hz - 420, 140, 70 * speed, tops(2), deck(2), 9, lite * .6);
    if (lite > .01) { s.save(); s.globalAlpha = .07 * clamp(lite); s.fillStyle = rgrad(s, SC, hz - 900, 0, 1500, [[0, '#d8dee8'], [1, 'rgba(160,170,190,0)']]); s.fillRect(-1000, hz - 2600, 4000, 2600); s.restore(); }
  }
  // bare hills: rounded folds, no plants; far = paler (haze), near = dark
  function hill(y, amp, freq, seed, c, x0 = -1400, x1 = 3400) {
    s.beginPath(); s.moveTo(x0, y + 3000);
    for (let x = x0; x <= x1; x += 24) s.lineTo(x, y - amp * noise1(x * freq, seed) - amp * .35 * noise1(x * freq * 2.7, seed + 5));
    s.lineTo(x1, y + 3000); s.closePath(); s.fillStyle = c; s.fill();
  }
  const hillY = (x, y, amp, freq, seed) => y - amp * noise1(x * freq, seed) - amp * .35 * noise1(x * freq * 2.7, seed + 5);
  function hills(t, o = {}) {
    const { hz = HZ, dawn = dawnK(t), lite = 0 } = o;
    const L = (c) => mx(c, '#b8bec6', clamp(lite * .15));
    hill(hz + 10, 150, .0016, 21, L(mx('#5a5f66', '#707279', dawn)));
    hill(hz + 70, 120, .0022, 22, L(mx('#3c4046', '#4a4b50', dawn)));
    hill(hz + 150, 90, .003, 23, L('#2a2c31'));
  }
  // wind-driven sand across the ground, to screen right
  function sand(t, y0, y1, k, seed = 5, speed = 900) {
    if (k <= .01) return;
    const r = rng(seed);
    for (let i = 0; i < 46; i++) { const y = lerp(y0, y1, r()), L = 120 + r() * 300, x = ((r() * 3800 + t * speed * (.6 + r() * .8)) % 3800) - 1000, a = (.12 + .2 * r()) * k;
      stroke(s, [[x, y], [x + L, y - L * .03]], `rgba(170,168,160,${a})`, 3 + r() * 5); }
  }
  // a lightning bolt from (x0, y0) to (x1, y1): jagged midpoint path + branches, light layer (and a pale trace in the paint)
  function boltPath(x0, y0, x1, y1, seed, rough = .22) {
    let pts = [[x0, y0], [x1, y1]]; const r = rng(seed);
    for (let lvl = 0; lvl < 6; lvl++) { const nx = []; for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
      nx.push(a, [(a[0] + b[0]) / 2 + (r() - .5) * L * rough * 2, (a[1] + b[1]) / 2 + (r() - .5) * L * rough * .6]); } nx.push(pts[pts.length - 1]); pts = nx; }
    return pts;
  }
  function bolt(x0, y0, x1, y1, seed, k, w = 6) {
    if (k <= .02) return;
    const pts = boltPath(x0, y0, x1, y1, seed), r = rng(seed + 99);
    const br = []; for (let b = 0; b < 4; b++) { const i = 8 + Math.floor(r() * (pts.length - 24)), p = pts[i], L = Math.hypot(x1 - x0, y1 - y0) * (.15 + r() * .2), a = Math.atan2(y1 - y0, x1 - x0) + (r() > .5 ? 1 : -1) * (.5 + r() * .5);
      br.push(boltPath(p[0], p[1], p[0] + Math.cos(a) * L, p[1] + Math.sin(a) * L, seed * 7 + b, .3)); }
    stroke(s, pts, `rgba(220,226,236,${.8 * clamp(k)})`, w * 1.2);
    for (const b of br) stroke(f, b, `rgba(200,212,255,${.45 * k})`, w * .45);
    stroke(f, pts, `rgba(170,190,255,${.1 * k})`, w * 3); stroke(f, pts, `rgba(240,244,255,${.95 * k})`, w);
    glow(x1, y1, 140 * k, `rgba(210,220,255,${.16 * k})`);
  }
  // bolts in the break: each big hit throws one somewhere across the sky (seeded by its index)
  function breakBolts(t, y1, xa = 200, xb = 1720) {
    const i = lastOf(t, BOLTS); if (i < 0) return 0;
    const c = BOLTS[i], k = flickAt(t, c); if (k < .03) return 0;
    const x = lerp(xa, xb, hash(i * 17 + 3)), xe = x + (hash(i * 5 + 1) - .5) * 360;
    bolt(x, -700, xe, y1 + (hash(i * 3) - .5) * 60, 700 + i, k, 5);
    return k;
  }

  // ---------- the rattlesnake (after c3's) ----------
  const SN = { body: '#57504a', dark: '#1c1a18', pale: '#a8a292', belly: '#2c2826', head: '#46403a' };
  function snakeBody(pts, w) {
    stroke(s, pts.map(([x, y]) => [x + w * .08, y + w * .28]), SN.belly, w * 1.02);
    stroke(s, pts, SN.body, w);
    stroke(s, pts.map(([x, y]) => [x - w * .05, y - w * .22]), 'rgba(226,222,214,.3)', w * .22);
    for (let i = 2; i < pts.length - 1; i += 3) { const [x, y] = pts[i], [x2, y2] = pts[i + 1], a = Math.atan2(y2 - y, x2 - x), d = w * .42;
      s.save(); s.translate(x, y - w * .08); s.rotate(a); s.fillStyle = SN.pale; s.beginPath(); s.moveTo(-d * 1.25, 0); s.lineTo(0, -d * .95); s.lineTo(d * 1.25, 0); s.lineTo(0, d * .95); s.fill();
      s.fillStyle = SN.dark; s.beginPath(); s.moveTo(-d, 0); s.lineTo(0, -d * .72); s.lineTo(d, 0); s.lineTo(0, d * .72); s.fill(); s.restore(); }
  }
  function snakeHead(t, hs, tongueK) {
    s.fillStyle = '#4a4238'; s.beginPath(); s.moveTo(-.6 * hs, .08 * hs); s.quadraticCurveTo(.2 * hs, .3 * hs, .82 * hs, .1 * hs); s.lineTo(.8 * hs, .04 * hs); s.lineTo(-.6 * hs, .02 * hs); s.fill();
    s.beginPath(); s.moveTo(-.5 * hs, -.2 * hs); s.quadraticCurveTo(-.25 * hs, -.55 * hs, .25 * hs, -.46 * hs); s.quadraticCurveTo(.75 * hs, -.34 * hs, 1.0 * hs, -.08 * hs);
    s.quadraticCurveTo(1.07 * hs, .04 * hs, .96 * hs, .1 * hs); s.lineTo(.2 * hs, .14 * hs); s.quadraticCurveTo(-.2 * hs, .3 * hs, -.5 * hs, .2 * hs); s.closePath(); s.fillStyle = SN.head; s.fill();
    stroke(s, [[.95 * hs, -.1 * hs], [.45 * hs, -.3 * hs], [-.35 * hs, -.3 * hs]], SN.pale, hs * .07);
    stroke(s, [[.42 * hs, -.12 * hs], [-.3 * hs, .05 * hs]], SN.dark, hs * .12);
    dot(s, .45 * hs, -.16 * hs, hs * .075, '#ddd6c0'); stroke(s, [[.45 * hs, -.22 * hs], [.45 * hs, -.1 * hs]], '#0c0806', hs * .03);
    if (tongueK > 0) { const L = hs * (.5 + .5 * Math.abs(Math.sin(t * 22))) * tongueK, b = [1.0 * hs, .08 * hs], e = [b[0] + L, b[1] + L * .12];
      stroke(s, [b, e], '#5a1a14', hs * .045); stroke(s, [e, [e[0] + hs * .18, e[1] - hs * .1]], '#5a1a14', hs * .03); stroke(s, [e, [e[0] + hs * .18, e[1] + hs * .12]], '#5a1a14', hs * .03); }
  }
  // (x, y) ground under the coil, sc coil radius; the tail stands up on the wind side (screen right) with the rattle
  function snake(t, x, y, sc, o = {}) {
    const { rear = .4, rattle = 0, dir = -1, tongueK = 0, wind = 1 } = o, w = sc * .2;
    s.fillStyle = 'rgba(20,20,24,.45)'; s.beginPath(); s.ellipse(x + sc * .2, y + sc * .1, sc * 1.3, sc * .42, 0, 0, TAU); s.fill();
    const loop = (r0, r1, y0, y1, a0, a1) => { const p = []; for (let i = 0; i <= 40; i++) { const u = i / 40, a = a0 + (a1 - a0) * u, rr = lerp(r0, r1, u); p.push([x + dir * Math.cos(a) * rr, lerp(y0, y1, u) + Math.sin(a) * rr * .4]); } return p; };
    const outer = loop(sc, sc * .8, y - w * .3, y - w * .7, Math.PI * .92, Math.PI * 2.75);
    const inner = loop(sc * .76, sc * .42, y - w * .8, y - w * 1.5, Math.PI * .75, Math.PI * 2.4);
    snakeBody(outer, w); snakeBody(inner, w * .92);
    // the tail rises and leans into the wind; the rattle blurs when it shakes
    const tb = outer[0], lean = wind * .25, tailTop = [tb[0] - dir * sc * .12 + lean * sc * .3, tb[1] - sc * .42];
    stroke(s, [tb, [tb[0] - dir * sc * .1 + lean * sc * .1, tb[1] - sc * .18], tailTop], SN.body, w * .5);
    const rb = Math.sin(t * 150) * .6 + (hash(Math.floor(t * 48)) - .5), amp = sc * .1 * rattle;
    for (let gI = -1; gI <= 1; gI++) { const ox = gI * amp + rb * amp * .4; s.globalAlpha = gI ? .4 : .95;
      for (let k = 0; k < 6; k++) { const cx = tailTop[0] + ox * (k + 1) / 6 + lean * k * sc * .03, cy = tailTop[1] - sc * (.02 + k * .075), rw = sc * (.08 - k * .009);
        s.fillStyle = '#403a32'; s.beginPath(); s.ellipse(cx, cy + sc * .015, rw * 1.1, sc * .045, lean, 0, TAU); s.fill();
        s.fillStyle = k % 2 ? '#bdb6a4' : '#e0dacb'; s.beginPath(); s.ellipse(cx, cy, rw, sc * .04, lean, 0, TAU); s.fill(); } }
    s.globalAlpha = 1;
    // the buzz: a faint shiver of light around the rattle when it goes hard
    if (rattle > .6) for (let k = 0; k < 3; k++) stroke(f, bez([tailTop[0] + sc * .1, tailTop[1] - sc * .2], [tailTop[0] + sc * .3, tailTop[1] - sc * (.3 + k * .12)], [tailTop[0] + sc * .5, tailTop[1] - sc * (.1 + k * .15)], [tailTop[0] + sc * (.8 + k * .2), tailTop[1] - sc * (.25 + k * .1)], 12),
      `rgba(220,226,236,${.12 * (rattle - .6) * (1 - k * .25)})`, 3);
    const pe = inner[inner.length - 1], hp = [pe[0] + dir * sc * .4, pe[1] - sc * (.5 + .7 * rear)];
    snakeBody(bez(pe, [pe[0] - dir * sc * .45, pe[1] - sc * .35], [hp[0] - dir * sc * .45, hp[1] + sc * .25], hp, 14), w * .8);
    s.save(); s.translate(hp[0], hp[1]); s.scale(dir, 1); s.rotate(-.1 + rear * .1); snakeHead(t, sc * .4, tongueK); s.restore();
    return { head: hp, tail: tailTop };
  }

  // ---------- his gloved hands, cupped together, glowing from inside like embers ----------
  // (x, y) = the hollow of the cupped palms, sc ~ one hand's length. Black leather, fingers together and
  // curled up at the sides, the duster sleeves coming up from below. heat 0..1 lights the coal in the palms
  // and the cracks in the leather.
  function cupped(t, x, y, sc, heat, wind) {
    const leather = '#141316', sheen = '#50525a', coat = '#1c1b1f';
    const breathe = .78 + .22 * Math.sin(t * 3.1) + .12 * snoise(t * 5, 83);
    // his chest below the hands: the dark duster and vest, shoulders off frame
    s.fillStyle = '#18171b'; s.beginPath(); s.moveTo(x - sc * 2.4, y + sc * 4); s.lineTo(x - sc * 2.1, y + sc * 1.25); s.quadraticCurveTo(x, y + sc * .72, x + sc * 2.1, y + sc * 1.25); s.lineTo(x + sc * 2.4, y + sc * 4); s.fill();
    s.fillStyle = '#0f0e11'; s.beginPath(); s.moveTo(x - sc * .35, y + sc * 4); s.lineTo(x - sc * .2, y + sc * .95); s.lineTo(x + sc * .2, y + sc * .95); s.lineTo(x + sc * .35, y + sc * 4); s.fill();
    for (const d of [-1, 1]) {
      // forearm in the sleeve, then the cuff fringe streaming downwind
      const wr = [x + d * sc * .5, y + sc * .32], el = [x + d * sc * 1.25, y + sc * 2.3];
      taper(s, el, wr, sc * .5, sc * .3, coat);
      for (let k = 0; k < 6; k++) { const bx = wr[0] + (k / 5 - .5) * sc * .55 + d * sc * .12, by = wr[1] + sc * .28 + Math.abs(k / 5 - .5) * sc * .1, sw = (wind * .45 + snoise(t * 1.3 + k * .7 + d * 3, 81) * .25) * sc;
        taper(s, [bx, by], [bx + sw, by + sc * (.35 + .15 * hash(k + d * 9))], sc * .07, sc * .02, '#18171b'); }
      // the palm: a rounded pad sloping into the hollow
      s.fillStyle = leather; s.beginPath(); s.ellipse(x + d * sc * .3, y + sc * .08, sc * .44, sc * .3, d * -.35, 0, TAU); s.fill();
      taper(s, wr, [x + d * sc * .32, y + sc * .12], sc * .28, sc * .3, leather);
      // four fingers pressed together, rising at the outer side and curling in over the hollow
      for (let i = 0; i < 4; i++) { const q = i / 3;
        const base = [x + d * sc * lerp(.74, .36, q), y - sc * lerp(.0, .16, q)];
        const tip = [x + d * sc * lerp(.5, .16, q) + snoise(t * .7 + i + d, 82) * sc * .015, y - sc * lerp(.62, .58, q) * (1 - .12 * Math.abs(q - .4))];
        const pts = bez(base, [base[0] + d * sc * .12, base[1] - sc * .3], [tip[0] + d * sc * .16, tip[1] - sc * .06], tip, 12);
        stroke(s, pts, leather, sc * lerp(.17, .15, q));
        stroke(s, pts.slice(1, 8).map(([px, py]) => [px - d * sc * .04, py - sc * .02]), 'rgba(80,82,90,.6)', sc * .022);
        stroke(s, [[pts[5][0] - sc * .06, pts[5][1]], [pts[5][0] + sc * .06, pts[5][1] + sc * .02]], '#08080a', sc * .02);
        // cool sky rim along each finger's back, so the fingers read one by one against the dark
        stroke(f, pts.slice(2, 12).map(([px, py]) => [px + d * sc * .07, py - sc * .01]), `rgba(200,210,230,${.16 + .08 * q})`, sc * .018);
        // and the warm glow licking up the inside of each finger
        stroke(f, pts.slice(3, 11).map(([px, py]) => [px - d * sc * .06, py + sc * .01]), `rgba(255,140,50,${.22 * heat})`, sc * .03); }
      // the thumb along the front rim
      const tb = [x + d * sc * .58, y + sc * .18], tt = [x + d * sc * .14, y - sc * .04];
      stroke(s, bez(tb, [tb[0] - d * sc * .1, tb[1] - sc * .12], [tt[0] + d * sc * .12, tt[1] + sc * .02], tt, 10), leather, sc * .15);
      stroke(s, bez([tb[0], tb[1] - sc * .08], [tb[0] - d * sc * .1, tb[1] - sc * .18], [tt[0] + d * sc * .14, tt[1] - sc * .04], [tt[0], tt[1] - sc * .06], 10), sheen, sc * .024);
    }
    if (heat <= .01) return;
    // the coal held in the hollow: a bed of embers between the thumbs
    const r = rng(333);
    s.fillStyle = mx('#2a1410', '#9a4418', heat); s.beginPath(); s.ellipse(x, y - sc * .04, sc * .32, sc * .12, 0, 0, TAU); s.fill();
    for (let i = 0; i < 12; i++) { const ex = x + (r() - .5) * sc * .55, ey = y - sc * .04 + (r() - .5) * sc * .16, er = sc * (.03 + .04 * r()), hk = heat * breathe * (.5 + .5 * noise1(t * 2.4 + i * 1.3, 85));
      dot(s, ex, ey, er, mx('#6a2a10', '#ffb050', hk)); dot(f, ex, ey, er * .8, `rgba(255,${150 + 80 * hk | 0},70,${.7 * hk})`); }
    glow(x, y - sc * .05, sc * 1.3 * heat, `rgba(255,110,30,${.26 * heat * breathe})`);
    glow(x, y - sc * .06, sc * .5 * heat, `rgba(255,205,130,${.4 * heat * breathe})`);
    // light spilling up the inner faces of the fingers
    for (const d of [-1, 1]) glow(x + d * sc * .32, y - sc * .3, sc * .35 * heat, `rgba(255,130,40,${.2 * heat})`);
    // the leather itself cracked like a cooling coal, glowing through the cracks
    const c = rng(444);
    for (let k = 0; k < 10; k++) { const d = k & 1 ? 1 : -1, cx = x + d * sc * (.2 + c() * .55), cy = y + sc * (-.5 + c() * .75), a0 = c() * TAU, L = sc * (.06 + c() * .09);
      const pts = [[cx, cy]]; let a = a0, px = cx, py = cy; for (let j = 0; j < 3; j++) { a += (c() - .5) * 1.6; px += Math.cos(a) * L; py += Math.sin(a) * L; pts.push([px, py]); }
      const hk = heat * breathe * (.35 + .65 * noise1(t * 1.7 + k * 2.3, 86));
      stroke(s, pts, mx('#1a0c08', '#8a3612', hk), sc * .028);
      stroke(f, pts, `rgba(255,110,30,${.2 * hk})`, sc * .045); stroke(f, pts, `rgba(255,${170 + 60 * hk | 0},90,${.5 * hk})`, sc * .012); }
  }

  // ---------- the shots ----------

  // 1 · c7's burning sky breaks up into storm clouds rolling over the bare hills; the warmth drains out,
  // lightning starts flickering inside the clouds on the drum hits. The camera cranes down to the ridge.
  function roll(t, lt, dur) {
    const cy = kf(lt, [[0, 380], [dur, 1020]], ease.inOut), z = kf(lt, [[0, 1.15], [dur, .92]], ease.inOut);
    frame(SC + kf(lt, [[0, -80], [dur, 40]]), cy, pick(z, z * .78), kf(lt, [[0, .04], [dur, 0]]));
    const warm = 1 - ease.inOut(inv(A - .1, A + 2.6, t)), lite = flicker(t);
    stormSky(t, { warm, lite, speed: 2.2 });
    const bk = breakBolts(t, HZ - 60);
    hills(t, { lite });
    // him, tiny on the ridge at the end of the crane: the next shot's subject set up here
    const rx = SC + 180, ry = hillY(rx, HZ + 150, 90, .003, 23);
    wyrd(t, rx, ry + 4, 150, { view: 'sil', guitar: 'play', wind: 1, rim: null });
    sand(t, HZ + 120, HZ + 700, .6, 31, 1300);
    paintSet({ sat: lerp(.12, .75, warm), tint: [lerp(.9, 1, warm), lerp(.92, .7, warm), lerp(1, .5, warm)], tintK: .15 + .15 * warm, bloom: 1.3 + .15 * lite });
  }

  // 2 · he stands on the ridge and plays into the storm, duster whipping; bolts on the biggest hits
  function ridgeShot(t, lt, dur) {
    const z = kf(lt, [[0, .95], [dur, 1.12]], ease.inOut), sh = shake(t, 5 * flicker(t, BOLTS));
    frame(kf(lt, [[0, SC - 60], [dur, SC + 30]]) + sh[0], kf(lt, [[0, 1000], [dur, 1040]]) + sh[1], pick(z, z * .74));
    const lite = flicker(t);
    stormSky(t, { lite, speed: 1.6 });
    const bk = breakBolts(t, HZ - 20, 300, 1650);
    hill(HZ + 20, 120, .0016, 41, mx('#5a5f66', '#aab0b8', lite * .12));
    // the ridge he stands on: a bare hump across the lower frame
    const top = 1400;
    s.fillStyle = mx('#26282d', '#4a4d54', lite * .12); s.beginPath(); s.moveTo(-1400, 3200); s.lineTo(-1400, top + 260);
    for (let x = -1400; x <= 3400; x += 30) s.lineTo(x, top + 260 * Math.pow(Math.abs(x - SC) / 1300, 1.6) + (noise1(x * .01, 42) - .5) * 18);
    s.lineTo(3400, 3200); s.fill();
    stroke(f, [[SC - 500, top + 36], [SC - 150, top + 6], [SC + 150, top + 6], [SC + 500, top + 36]], `rgba(210,220,240,${.04 + .14 * lite})`, 4);
    sand(t, top - 60, top + 140, .8, 32, 1500);
    const gust = .85 + .25 * snoise(t * 1.4, 43);
    const ro = { guitar: 'play', wind: gust, rim: RIM, lit: .06 + .2 * lite, turn: .1 };
    wyrd(t, SC, top + 4, 560, ro); occlude(() => wyrd(t, SC, top + 4, 560, { ...ro, sil: true, rim: null, g: f })); wyrd(t, SC, top + 4, 560, ro);
    paintSet({ bloom: 1.3 + .15 * lite });
  }

  // 3 · low heroic angle up at him (his storm footage): the clouds race behind, the camera rolls with the gusts
  function whipShot(t, lt, dur) {
    const z = kf(lt, [[0, 1.0], [dur, 1.18]], ease.inOut), sh = shake(t, 7 * flicker(t, BOLTS));
    frame(SC + kf(lt, [[0, 40], [dur, -30]]) + sh[0], kf(lt, [[0, 1080], [dur, 1030]]) + sh[1], pick(z, z * .52), kf(lt, [[0, -.05], [dur, .03]]) + snoise(t * .7, 44) * .012);
    const lite = flicker(t);
    stormSky(t, { lite: lite * .6, speed: 3.2, hz: 1700 });
    const bk = breakBolts(t, 1500, 250, 1700);
    s.fillStyle = '#1e2024'; s.fillRect(-1400, 1850, 4800, 1400);
    const gust = .95 + .3 * snoise(t * 1.8, 45);
    const wo = { guitar: 'play', wind: gust, rim: RIM, lit: .05 + .15 * lite, turn: .15 };
    wyrd(t, SC - 60, 1900, 1350, wo); occlude(() => wyrd(t, SC - 60, 1900, 1350, { ...wo, sil: true, rim: null, g: f })); wyrd(t, SC - 60, 1900, 1350, wo);
    paintSet({ bloom: 1.3 + .15 * lite });
  }

  // 4 · the break winds down: he lets the guitar hang and the heat starts in his free hand; the camera
  // tilts down onto it and pushes in, and the glow carries the cut to the hands close-up
  function kindle(t, lt, dur) {
    const x = SC + 40, y = 1760, h = 1200;
    const k = ease.inOut(inv(0, dur, lt));
    const hx = x - 10.5 * h / 100 - 2 * h / 100, hy = y - 44 * h / 100; // his screen-left hand (arms down)
    frame(lerp(x - 40, hx + 40, k), lerp(y - h * .62, hy, k), pick(lerp(1.0, 1.9, ease.in(k)), lerp(.66, 1.45, ease.in(k))));
    const lite = flicker(t) * (1 - k);
    stormSky(t, { lite, speed: 1.4, hz: 1500 });
    hill(1500, 140, .0016, 51, '#50555c'); hill(1560, 100, .0024, 52, '#34373d');
    s.fillStyle = '#26282d'; s.fillRect(-1400, 1700, 4800, 1600);
    sand(t, 1680, 1900, .7, 33, 1300);
    const J = wyrd(t, x, y, h, { guitar: 'hang', arms: 'down', wind: .9, rim: RIM, lit: .08 + .3 * lite, turn: -.1 });
    const heat = ease.in(inv(0, dur, lt));
    if (heat > .01) { const [px, py] = J.handL; glow(px, py, 260 * heat, `rgba(255,120,40,${.45 * heat})`); glow(px, py, 70 * heat, `rgba(255,210,140,${.7 * heat})`);
      sparks(t, px, py - 10, 60, 260, 14, heat, 91); }
    paintSet({ sat: .12 + .35 * heat });
  }

  // 5 · "hands ... embers": his gloved hands raised against the storm, glowing from inside like coals
  function handsShot(t, lt, dur) {
    const z = kf(lt, [[0, 1.05], [dur, 1.28]], ease.inOut);
    frame(SC + kf(lt, [[0, -20], [dur, 20]]), kf(lt, [[0, 1010], [dur, 960]]), pick(z, z * .75), kf(lt, [[0, .05], [dur, -.02]]));
    stormSky(t, { speed: 1.2, hz: 1900, lite: .25 * flicker(t + 0) });
    const heat = clamp(.45 + .35 * ease.out(inv(tHands - .2, tHands + .5, t)) + .5 * hit(t, tEmbers, 2.2) + .15 * fastPulse(t, 6));
    const wind = .8 + .2 * snoise(t, 86);
    cupped(t, SC, 1000 + 8 * Math.sin(t * TAU / 4.2), 330, heat, wind);
    // ember sparks lifting off the palms into the wind
    sparks(t, SC + 30, 960, 200, 700, 30, .4 + .6 * heat, 92);
    paintSet({ sat: .5 + .15 * hit(t, tEmbers, 2), bloom: 1.4 + .3 * heat });
  }

  // 6 · "eyes ... gold": veiled close-up, singing; his ONE eye opens ember-gold under the brim (approved window)
  function goldShot(t, lt, dur) {
    const x = SC, y = 2100, h = 1500, headY = y - h * .905;
    const zoom = kf(lt, [[0, 1.8], [dur, 2.1]], ease.inOut);
    frame(x + pick(10, 60), headY + h * kf(lt, [[0, .13], [dur, .1]]), pick(zoom, zoom * .6));
    const lite = .5 * hit(t, tEyes - .25, 9);
    stormSky(t, { speed: 1.8, hz: headY + 900, lite });
    if (lite > .05) bolt(x - 520, headY - 1500, x - 640, headY + 700, 881, lite * 1.6, 5);
    const open = ease.out(inv(tEyes - .1, tGold + .05, t)) * (1 + .25 * hit(t, tGold, 3));
    wyrd(t, x, y, h, { turn: -.18, sing: 1, eye: open, wind: .6, lit: .1 + .3 * lite, guitar: 'none', arms: 'down', rim: 'rgba(200,210,226,.5)' });
    paintSet({ sat: .12 + .4 * clamp(open) * eyeGate(t), bloom: 1.3 + .4 * clamp(open) });
  }

  // 7 · "rattle ... hums ... desert": a rattlesnake coiled on a rock shakes its rattle into the wind;
  // on "desert" the camera cranes up off it to the far hills, where the strike is coming
  function rattleShot(t, lt, dur) {
    const up = ease.inOut(inv(tDesert - .1, tDesert + 1.5, t));
    const z = lerp(kf(lt, [[0, 1.75], [dur * .5, 2.0]], ease.out), .95, up);
    frame(kf(lt, [[0, SC + 60], [dur, SC - 10]]), lerp(1380, 1080, up), pick(z, z * .78), kf(lt, [[0, .03], [dur, -.02]]));
    const lite = .6 * flicker(t, [tRattle - .02, tHums + .5, tDesert + .3]);
    stormSky(t, { speed: 1.5, lite });
    hills(t, { lite });
    s.fillStyle = vgrad(s, HZ + 150, 2200, [[0, '#34363b'], [1, '#1c1d20']]); s.fillRect(-1400, HZ + 150, 4800, 2400);
    sand(t, 1260, 1700, .9, 34, 1500);
    // the rock
    s.fillStyle = '#3e3f44'; s.beginPath(); s.ellipse(SC, 1500, 400, 110, 0, 0, TAU); s.fill();
    s.fillStyle = '#6a6c72'; s.beginPath(); s.ellipse(SC - 30, 1470, 360, 80, -.04, 0, TAU); s.fill();
    stroke(f, [[SC - 320, 1420], [SC + 250, 1402]], 'rgba(210,220,240,.1)', 5);
    const rat = clamp(.45 + hit(t, tRattle, 2.5) + .7 * hit(t, tHums, 1.2) + .35 * fastPulse(t, 8) + .3 * F('perc', t, 1), 0, 1.4);
    snake(t, SC + 10, 1460, 240, { rear: .5 + .1 * Math.sin(t * 1.3), rattle: rat, dir: -1, tongueK: hit(t, tHums + .1, 3) + .6 * hit(t, tDesert, 3), wind: 1 });
    paintSet({ bloom: 1.3 + .4 * lite });
  }

  // 8 · "lightning ... hills ... dawn": seen from behind him, a bolt strikes the far hill (one restrained flash),
  // the strike sets the hilltop burning, and the dawn opens along the horizon
  function strikeShot(t, lt, dur) {
    const z = kf(lt, [[0, .9], [dur, 1.08]], ease.inOut), sh = shake(t, 10 * hit(t, STRIKE, 5));
    frame(kf(lt, [[0, SC - 40], [dur, SC + 80]]) + sh[0], 1040 + sh[1], pick(z, z * .76));
    const k = flickAt(t, STRIKE), k2 = .7 * flickAt(t, STRIKE + .22);
    const L = Math.max(k, k2, .4 * flicker(t, [tHills]));
    stormSky(t, { speed: 1.4, lite: L * .5 });
    const PX = SC + 260, PY = hillY(PX, HZ - 30, 260, .0012, 61);
    hill(HZ - 30, 260, .0012, 61, mx('#2c3036', '#7a8088', L * .2));
    hill(HZ + 80, 110, .0024, 62, mx('#1e2024', '#4a4e56', L * .3));
    s.fillStyle = vgrad(s, HZ + 150, 2200, [[0, '#2a2c30'], [1, '#141518']]); s.fillRect(-1400, HZ + 150, 4800, 2400);
    bolt(PX - 180, -700, PX, PY + 6, 901, k, 7); bolt(PX + 120, -700, PX + 10, PY + 6, 902, k2, 5);
    // the hilltop catches: fire tongues and a glow that grows, smoke tearing off in the wind
    const burn = ease.out(inv(STRIKE, STRIKE + 1.6, t));
    if (burn > 0) { for (let i = 0; i < 9; i++) { const fx = PX + (i - 4) * 12 * (.4 + burn), fy = hillY(fx, HZ - 30, 260, .0012, 61) + 4;
        ember(t, fx, fy, (30 + 50 * noise1(t * 3 + i * 3, 63)) * burn, { eyes: 0, seed: i + 60, hue: .4, lit: burn }); }
      glow(PX, PY, 380 * burn, `rgba(255,120,40,${.3 * burn})`); glow(PX, PY - 10, 90 * burn, `rgba(255,220,150,${.6 * burn})`);
      sparks(t, PX, PY - 20, 160, 420, 20, burn, 64); }
    // dawn along the horizon
    const dw = ease.inOut(inv(tDawn - .6, tDawn + .8, t));
    glow(SC - 300, HZ - 40, 900, `rgba(240,225,190,${.12 * dw})`);
    sand(t, HZ + 200, 1900, .7, 35, 1200);
    const bo = { view: 'back', guitar: 'hang', wind: .95, rim: RIM, lit: .05 + .15 * L };
    wyrd(t, SC - 230, 1720, 620, bo); occlude(() => wyrd(t, SC - 230, 1720, 620, { ...bo, sil: true, rim: null, g: f }));
    // the flash: restrained, one frame hot then gone (never a white frame past 2 frames)
    flash(.08 * hit(t, STRIKE, 30), '#e8eef8');
    paintSet({ sat: .12 + .3 * burn, bloom: 1.3 + .1 * L });
  }

  // 9 · "fire ... belong": the strike's fire runs down off the hill across the ground toward him and
  // stops at his boots; the camera tracks down with it
  function runShot(t, lt, dur) {
    const bx = SC + 150, by = 1560, h = 820;
    const head = ease.inOut(inv(tFire - .1, tBelong + .05, t)); // the fire front 0..1 along its path
    const push = ease.inOut(inv(tBelong - .9, Z, t));
    frame(lerp(SC - 40, bx - 40, push), lerp(1200, 1360, push), pick(lerp(.9, 1.25, push), lerp(.7, 1.0, push)));
    stormSky(t, { speed: 1.2 });
    const PX = pick(SC - 480, SC - 760);
    hill(HZ - 30, 200, .0012, 71, '#4a4e55'); hill(HZ + 70, 100, .0024, 72, '#2e3035');
    s.fillStyle = vgrad(s, HZ + 140, 2200, [[0, '#2c2e32'], [1, '#141518']]); s.fillRect(-1400, HZ + 140, 4800, 2400);
    const hy = hillY(PX, HZ - 30, 200, .0012, 71);
    glow(PX, hy, 300, 'rgba(255,120,40,.22)'); for (let i = 0; i < 5; i++) ember(t, PX + (i - 2) * 22, hy + 2, 30 + 20 * noise1(t * 3 + i, 73), { eyes: 0, seed: 70 + i, hue: .4 });
    // the path the fire takes: down the hill, a long S across the flat, into his boots
    const path = bez([PX, hy + 10], [PX + 150, HZ + 300], [bx - 620, by - 40], [bx - 70, by + 6], 60);
    const n = 44;
    for (let i = 0; i < n; i++) { const u = i / (n - 1); if (u > head) break;
      const [px, py] = at(path, u), persp = lerp(.35, 1.1, u), since = (head - u) * 2.2, alive = Math.exp(-since * 1.2);
      stroke(s, [at(path, Math.max(0, u - 1 / n)), [px, py]], '#161412', 8 * persp);
      const fh = (22 + 60 * noise1(t * 3.3 + i * 1.7, 74)) * persp * (.25 + .75 * alive) * (1 + .5 * hit(t, tBelong, 2) * (u > .9));
      ember(t, px, py, fh, { eyes: 0, seed: i + 100, hue: .35 + .2 * (1 - alive), lit: .5 + .5 * alive });
      if (i % 4 === 0) glow(px, py, 90 * persp * (.4 + .6 * alive), `rgba(255,110,30,${.16 * (.4 + .6 * alive)})`); }
    // the front itself: brighter, and a spray of sparks where it runs
    if (head > 0 && head < 1) { const [fx, fy] = at(path, head); glow(fx, fy, 150, 'rgba(255,170,80,.45)'); sparks(t, fx, fy, 60, 200, 10, .9, 75); }
    const arrived = ease.out(inv(tBelong - .15, tBelong + .6, t));
    if (arrived > 0) { glow(bx, by, 420 * arrived, `rgba(255,110,30,${.2 * arrived})`);
      for (let i = 0; i < 7; i++) { const a = Math.PI * (1.02 + i / 6 * .96), fx = bx + Math.cos(a) * 110, fy = by + 12 + Math.sin(a) * -18; ember(t, fx, fy, (26 + 30 * noise1(t * 4 + i, 76)) * arrived, { eyes: 0, seed: 120 + i, hue: .3, lit: arrived }); } }
    sand(t, HZ + 200, 1900, .5, 36, 1100);
    const warmth = clamp(.1 + .6 * arrived + .25 * head);
    wyrd(t, bx, by, h, { turn: -.3, sing: .7, guitar: 'hang', wind: .8, lit: .05 + .3 * warmth, rim: `rgba(255,170,100,${.5 + .4 * warmth})` });
    paintSet({ sat: .22 + .35 * warmth, bloom: 1.3 + .3 * warmth });
  }

  // 10 · "footsteps vanished ... unspun": he walks away toward the dawn; behind him the wind fills his
  // footprints with sand, nearest first, until the trail is gone
  function printsShot(t, lt, dur) {
    frame(SC + kf(lt, [[0, -30], [dur, 30]]), kf(lt, [[0, 1330], [dur, 1270]]), pick(kf(lt, [[0, 1.0], [dur, 1.1]]), kf(lt, [[0, .78], [dur, .86]])));
    stormSky(t, { speed: 1.3 });
    glow(SC + 80, HZ - 20, 800, `rgba(240,228,200,${.14 + .1 * dawnK(t)})`);
    hill(HZ - 10, 130, .0015, 81, '#5e636a'); hill(HZ + 50, 70, .0028, 82, '#44474d');
    s.fillStyle = vgrad(s, HZ + 60, 2200, [[0, '#6a6c70'], [.4, '#4a4b4f'], [1, '#2a2b2e']]); s.fillRect(-1400, HZ + 60, 4800, 2400);
    // perspective ground: depth d, lateral X; screen y = horizon + 520 / d
    const Y0 = HZ + 60, G = 560, P_ = (X, d) => [SC + X / d, Y0 + G / d];
    const stepT = .41, t0 = 179.9, d0 = 1.25, speed = .4; // his depth grows as he walks off
    const dAt = (tt) => d0 + (tt - t0) * speed;
    const dNow = dAt(t);
    // his footprints: one per step, alternating sides; the wind erases them from the camera side inward
    for (let kk = -12; ; kk++) { const tk = t0 + kk * stepT; if (tk > t) break; const dk = dAt(tk); if (dk < .38) continue;
      const side = (kk & 1) ? 1 : -1, [px, py] = P_(side * 34 + snoise(kk * .3, 83) * 20, dk);
      const vanishAt = tFoot + .15 + (dk - .38) * 1.1, gone = smooth(inv(vanishAt, vanishAt + .7, t));
      if (gone >= 1) continue;
      const rx = 52 / dk, ry = 18 / dk;
      s.globalAlpha = 1 - gone; s.fillStyle = '#26272a'; s.beginPath(); s.ellipse(px, py, rx, ry, 0, 0, TAU); s.fill();
      s.fillStyle = '#8e9094'; s.beginPath(); s.ellipse(px, py - ry * .7, rx * .9, ry * .45, 0, 0, TAU); s.fill(); s.globalAlpha = 1;
      // the sand running into it
      if (gone > 0) stroke(s, [[px - rx * 3, py + ry * .2], [px + rx * 2, py]], `rgba(150,150,148,${.5 * (1 - gone)})`, ry * 1.2);
    }
    // a sheet of blowing sand sweeps up the trail
    const sweep = inv(tFoot, tUnspun + .6, t);
    if (sweep > 0 && sweep < 1) { const ds = lerp(.4, dNow, sweep), [, sy] = P_(0, ds); sand(t, sy - 80 / ds, sy + 120 / ds, 1.2, 37, 1600); }
    sand(t, HZ + 100, 2000, .5, 38, 1200);
    const [wx, wy] = P_(0, dNow);
    const hh = 1150 / dNow;
    s.fillStyle = 'rgba(28,29,32,.85)'; s.beginPath(); s.ellipse(wx - hh * .02, wy + hh * .03, hh * .22, hh * .045, 0, 0, TAU); s.fill();
    const wo = { view: 'back', guitar: 'hang', walk: t * 1.22, wind: .95, rim: 'rgba(235,228,210,.7)', lit: .08 };
    wyrd(t, wx, wy, hh, wo); occlude(() => wyrd(t, wx, wy, hh, { ...wo, sil: true, rim: null, g: f }));
    paintSet({ sat: .14 });
  }

  // 11 · "dreams ... begun": the sun breaks through the storm behind him on the ridge; the clouds tear
  // open, rays fall across the hills, and the push into the sun flares the frame into c9's blaze
  function sunShot(t, lt, dur) {
    const SX = SC + 170, SY = HZ - 210;
    const open = ease.inOut(inv(tDreams - .3, tBegun, t)), flare = ease.in(inv(tBegun - .2, Z, t));
    const z = kf(lt, [[0, .88], [dur * .55, .98], [dur, 1.35]], ease.inOut);
    frame(lerp(SC, SX, flare * .8), lerp(1060, SY + 60, flare * .7), pick(z, z * .76));
    stormSky(t, { speed: 1.2 });
    // the sun behind the storm: a gold core the clouds peel away from
    const sunA = .25 + .75 * open;
    glow(SX, SY, 1300 * (.5 + .5 * open + flare), `rgba(255,160,70,${.16 * sunA + .12 * flare})`);
    dot(s, SX, SY, 120 + 40 * flare, mx('#9a9690', '#ffd890', sunA)); dot(s, SX, SY, 80, mx('#b0aca4', '#fff0c8', sunA));
    glow(SX, SY, 260, `rgba(255,220,160,${.4 * sunA})`);
    // the cloud curtain over the sun, tearing open to both sides
    for (const d of [-1, 1]) { const off = d * (140 + 900 * open);
      s.save(); s.translate(off, -open * 60 * (d > 0 ? 1 : .5));
      cloudBank(t, 830 + (d > 0 ? 1 : 0), SY - 30, 230, 10, mx('#5a5e66', '#d8b890', open * .6), '#2a2d33', 4);
      s.restore(); }
    // rays down through the tear
    if (open > .02) { f.save(); f.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 9; i++) { const a = Math.PI * (1.08 + i / 8 * .84) + snoise(t * .3 + i, 101) * .03, L = 2400, w = .03 + .025 * hash(i + 7);
        f.fillStyle = `rgba(255,210,150,${(.05 + .05 * hash(i)) * open * (1 + flare)})`; f.beginPath(); f.moveTo(SX, SY);
        f.lineTo(SX + Math.cos(a - w) * L, SY + Math.sin(a - w) * L); f.lineTo(SX + Math.cos(a + w) * L, SY + Math.sin(a + w) * L); f.fill(); }
      f.restore(); }
    hill(HZ + 10, 150, .0016, 21, mx('#4a4e55', '#7a6a58', open * .5));
    // the ridge he stands on, a dark hump; light running along its crest
    const top = 1420;
    s.fillStyle = '#1c1d21'; s.beginPath(); s.moveTo(-1400, 3200); s.lineTo(-1400, top + 300);
    for (let x = -1400; x <= 3400; x += 30) s.lineTo(x, top + 300 * Math.pow(Math.abs(x - (SC - 140)) / 1300, 1.6) + (noise1(x * .01, 102) - .5) * 18);
    s.lineTo(3400, 3200); s.fill();
    stroke(f, [[SC - 600, top + 44], [SC - 140, top + 4], [SC + 300, top + 34]], `rgba(255,200,140,${.15 + .35 * open})`, 5);
    sand(t, top - 60, top + 150, .6, 39, 1400);
    const so = { guitar: 'play', wind: .8, turn: -.1, lit: .05, rim: `rgba(255,${200 - 40 * open | 0},${150 - 60 * open | 0},.95)` };
    wyrd(t, SC - 140, top + 4, 640, so); occlude(() => wyrd(t, SC - 140, top + 4, 640, { ...so, sil: true, rim: null, g: f }));
    wyrd(t, SC - 140, top + 4, 640, { ...so, g: s, rim: so.rim, lit: .05 });
    // the blaze: warm light floods in from the sun (not a white frame), colour returns for c9
    const g = flare * flare;
    glow(SX, SY, 2400 * g, `rgba(255,120,40,${.22 * g})`);
    flash(.1 * g, "#ff8a38");
    paintSet({ sat: .15 + .5 * open + .5 * flare, tint: [1, lerp(.92, .78, open), lerp(1, .55, open)], tintK: .15 + .15 * open, bloom: 1.3 + .3 * open + .25 * flare, flowK: 1.3 + .6 * flare, boil: 9 + 3 * flare });
  }

  chapter('storm', A, Z, [
    [A, roll, { xin: .8 }],
    [156.62, ridgeShot],
    [160.64, whipShot],
    [163.84, kindle],
    [tHands - .2, handsShot, { paint: { ...LOOK.storm, sat: .5 } }],
    [tEyes - .25, goldShot],
    [tRattle - .3, rattleShot],
    [tLightning - .25, strikeShot],
    [tFire - .25, runShot],
    [179.9, printsShot],
    [tDreams - .2, sunShot],
  ], { paint: LOOK.storm });
})();
