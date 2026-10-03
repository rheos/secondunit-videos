// 133.0 - 170.0  the clouds' convention. Up and out of the ministry into the sky, where the clouds
// sit at a long table with name cards, vote on every "we've got time", picket the smokestacks, and
// go looking for the sun the ministry has filed away. The hall clock becomes the sun.
(() => {
  const SKY_D = '#2a5fa8', CLOUD = '#fbfbf6', CSH = '#a9bfd2', WOOD = '#7a6c56', CLOTH = '#a7ae98';
  const BLUE_INK = '#2d5c9c';

  // ---- sky and cloud helpers ----
  function skyFill(y0 = 0, y1 = H, top = SKY_D) {
    s.fillStyle = vgrad(y0, y1, [[0, top], [.55, SKY_T], [1, SKY_B]]); s.fillRect(-1300, Math.min(y0, -200), W + 2600, Math.max(y1, H) - Math.min(y0, -200) + 400);
  }
  // a scalloped cloud bank: a band of puffs whose bottom runs off below y + depth
  function bank(y, r, seed, drift = 0, { c = '#e9f0f4', lw = 3, depth = 900, a = 1 } = {}) {
    const R = rng(seed), pts = []; let x = -1300 + ((drift % (r * 1.6)) - r * 1.6);
    while (x < W + 1300) { const rr = r * (.7 + R() * .6); pts.push([x, y + (R() - .5) * r * .5, rr]); x += rr * 1.15; }
    withT(() => { s.globalAlpha *= a;
      s.lineWidth = lw; s.strokeStyle = INK; for (const [px, py, rr] of pts) { s.beginPath(); s.arc(px, py, rr, Math.PI, TAU); s.stroke(); }
      s.fillStyle = c; for (const [px, py, rr] of pts) { s.beginPath(); s.arc(px, py, rr - lw * .5, 0, TAU); s.fill(); }
      s.fillRect(-1300, y, W + 2600, depth);
      s.globalAlpha *= .22; s.fillStyle = CSH; s.fillRect(-1300, y + r * .55, W + 2600, depth);
    });
  }
  // a round puffy cloud body centred on (x, y)
  function blob(x, y, r, seed, { c = CLOUD, lw = 5, sq = 1 } = {}) {
    const R = rng(seed), pts = [];
    for (let i = 0; i < 7; i++) { const a = Math.PI + i / 6 * Math.PI; pts.push([x + Math.cos(a) * r * .72, y + Math.sin(a) * r * .5 * sq, r * (.42 + R() * .14)]); }
    for (let i = 0; i < 4; i++) { const u = i / 3 - .5; pts.push([x + u * r * 1.25, y + r * .3 * sq, r * (.4 + R() * .08)]); }
    pts.push([x, y - r * .05, r * .62]);
    s.lineWidth = lw; s.strokeStyle = INK; for (const [px, py, rr] of pts) { s.beginPath(); s.arc(px, py, rr, 0, TAU); s.stroke(); }
    for (const [px, py, rr] of pts) dot(px, py, rr - lw * .5, c);
    withT(() => { s.beginPath(); for (const [px, py, rr] of pts) { s.moveTo(px + rr - lw * .5, py); s.arc(px, py, rr - lw * .5, 0, TAU); } s.clip();
      s.globalAlpha *= .3; s.beginPath(); for (const [px, py, rr] of pts) { s.moveTo(px + r * .1 + rr, py + rr * .42); s.arc(px + r * .1, py + rr * .42, rr, 0, TAU); } s.fillStyle = CSH; s.fill(); s.globalAlpha /= .3;
      s.globalAlpha *= .3; s.beginPath(); for (const [px, py, rr] of pts) { s.moveTo(px - r * .05 + rr * .55, py - rr * .2); s.arc(px - r * .05, py - rr * .2, rr * .55, 0, TAU); } s.fillStyle = '#ffffff'; s.fill(); });
  }
  function fedora(x, y, w, rot = 0) {
    withT(() => { s.translate(x, y); s.rotate(rot);
      shape([[-w * .3, 0], [w * .3, 0], [w * .25, -w * .4], [0, -w * .34], [-w * .25, -w * .4]], HAT, Math.max(1.5, w * .035));
      line([[-w * .3, -w * .08], [w * .3, -w * .08]], '#1c1b18', w * .07, 'butt');
      s.beginPath(); s.ellipse(0, 0, w * .56, w * .09, 0, 0, TAU); s.fillStyle = HAT; s.fill(); s.lineWidth = Math.max(1.5, w * .035); s.strokeStyle = INK; s.stroke(); });
  }
  function mitt(x, y, r) { dot(x, y, r, CLOUD); s.lineWidth = Math.max(1.5, r * .3); s.strokeStyle = INK; s.beginPath(); s.arc(x, y, r, 0, TAU); s.stroke(); }
  // arm from the shoulder; up 0 = hanging, 1 = raised high. side -1 left, 1 right. returns the hand.
  function arm(x, y, r, side, up) {
    const sh = [x + side * r * .78, y + r * .05];
    const hd = [lerp(x + side * r * 1.08, x + side * r * .95, up), lerp(y + r * .6, y - r * 1.3, up)];
    const el = [lerp(sh[0], hd[0], .5) + side * r * .18 * (1 - Math.abs(up - .5) * 2 + .3), lerp(sh[1], hd[1], .5)];
    ink([sh, el, hd], Math.max(3, r * .075)); return hd;
  }
  // a cloud delegate: no face, all personality in the hat, the lean and the arms.
  // o: seed, lean (rad), up [left, right] arm raise, hat (0 none, 1 on), hatLift (px up), hatRot
  function delegate(x, y, r, o = {}) {
    const { seed = 1, lean = 0, up = [0, 0], hat = 1, hatLift = 0, hatRot = 0, c = CLOUD, gavel = null, sign = null } = o;
    withT(() => {
      s.translate(x, y + r * .6); s.rotate(lean); s.translate(-x, -(y + r * .6));
      const hl = arm(x, y, r, -1, up[0]); mitt(hl[0], hl[1], r * .11);
      const hr = arm(x, y, r, 1, up[1]);
      if (gavel !== null) gavelAt(hr[0], hr[1], r * .9, gavel);
      if (sign) placard(hl[0], hl[1], sign, r);
      blob(x, y, r, seed, { c, lw: Math.max(3, r * .04) });
      mitt(hr[0], hr[1], r * .11);
      if (hat) fedora(x + r * .1, y - r * .62 - hatLift, r * .78, -.08 + hatRot);
    });
  }
  function gavelAt(hx, hy, len, ang) {
    withT(() => { s.translate(hx, hy); s.rotate(ang);
      ink([[0, 0], [len * .1, -len * .9]], Math.max(3, len * .06));
      withT(() => { s.translate(len * .1, -len * .9); s.rotate(.11); shape([[-len * .32, -len * .13], [len * .32, -len * .13], [len * .32, len * .13], [-len * .32, len * .13]], WOOD, 3);
        ink([[-len * .22, -len * .13], [-len * .22, len * .13]], 2); ink([[len * .22, -len * .13], [len * .22, len * .13]], 2); }); });
  }
  function placard(hx, hy, str, r) {
    const w = r * 2.3, h = r * .9;
    ink([[hx, hy + r * .2], [hx, hy - r * .9]], Math.max(4, r * .07));
    shape([[hx - w / 2, hy - r * .9 - h], [hx + w / 2, hy - r * .9 - h], [hx + w / 2, hy - r * .9], [hx - w / 2, hy - r * .9]], CREAM, 3);
    text(str, hx, hy - r * .9 - h * .32, r * .3, { font: 'sign', spacing: 2 });
  }
  // a long frontal table on the clouds, cloth to the floor
  function table(cx, ty, w, ch = 150) {
    shape([[cx - w / 2 + 30, ty], [cx + w / 2 - 30, ty], [cx + w / 2, ty + 26], [cx - w / 2, ty + 26]], WOOD, 3);
    shape([[cx - w / 2, ty + 26], [cx + w / 2, ty + 26], [cx + w / 2, ty + 26 + ch], [cx - w / 2, ty + 26 + ch]], CLOTH, 3);
    withT(() => { s.globalAlpha = .4; for (let x = cx - w / 2 + 70; x < cx + w / 2 - 20; x += 90) ink([[x, ty + 40], [x + 6, ty + 20 + ch]], 1.4); });
    for (let x = cx - w / 2 + 8; x < cx + w / 2; x += 16) ink([[x, ty + 26 + ch], [x, ty + 38 + ch]], 2);
  }
  function card(x, y, str, sz = 22) {
    const w = Math.max(sz * 4.2, str.length * sz * .74 + sz * 1.2), h = sz * 1.9;
    shape([[x - w / 2 + 6, y - h], [x + w / 2 - 6, y - h], [x + w / 2, y], [x - w / 2, y]], CREAM, 2.2);
    text(str, x, y - h * .3, sz, { font: 'sign', spacing: 1.5 });
  }
  function banner(cx, y, w, h, str, reveal = 1, sz = 58) {
    const ww = w * reveal; if (ww < 4) return;
    ink([[cx - w / 2 + 40, y], [cx - w / 2 + 120, -60]], 2); ink([[cx + w / 2 - 40, y], [cx + w / 2 - 120, -60]], 2);
    withT(() => {
      s.beginPath(); s.rect(cx - ww / 2 - 60, y - 20, ww + 120, h + 60); s.clip();
      shape([[cx - w / 2 - 50, y], [cx + w / 2 + 50, y], [cx + w / 2 + 10, y + h / 2], [cx + w / 2 + 50, y + h], [cx - w / 2 - 50, y + h], [cx - w / 2 - 10, y + h / 2]], CREAM, 3.5);
      ink([[cx - w / 2 + 10, y + 12], [cx + w / 2 - 10, y + 12]], 1.4); ink([[cx - w / 2 + 10, y + h - 12], [cx + w / 2 - 10, y + h - 12]], 1.4);
      text(str, cx, y + h * .5 + sz * .35, sz, { font: 'sign', spacing: 4 });
    });
    if (reveal < 1) for (const sd of [-1, 1]) { const ex = cx + sd * ww / 2; shape([[ex - 16, y - 8], [ex + 16, y - 8], [ex + 16, y + h + 8], [ex - 16, y + h + 8]], '#d8d0b4', 3); }
  }

  const NAMES = ['CIRRUS', 'NIMBUS', 'STRATUS', 'CHAIR', 'CUMULUS', 'ALTUS', 'CIRRO'];
  // the convention, frontal and symmetric. ty = table top. g = gavel angle for the chair.
  function convention(t, cx, ty, sc, { g = -.4, ups = null, hats = null, lean = 0, cards = true, ch = 95 } = {}) {
    const n = 7, gap = 235 * sc;
    for (let i = 0; i < n; i++) {
      if (i === 3) continue;
      const x = cx + (i - 3) * gap, r = 108 * sc, bob = Math.sin(t * 1.3 + i * 1.7) * 5 * sc;
      const u = ups ? ups(i) : [0, 0], hl = hats ? hats(i) : 0;
      delegate(x, ty - r * .55 + bob, r, { seed: 30 + i, lean: (i < 3 ? .05 : -.05) + lean * (i < 3 ? 1 : -1) + Math.sin(t * .9 + i) * .03, up: u, hatLift: hl * sc, hatRot: hl * .004 * (i < 3 ? -1 : 1) });
    }
    const r = 145 * sc; const u3 = ups ? ups(3) : [0, 0];
    delegate(cx, ty - r * .5 + Math.sin(t * 1.1) * 4 * sc, r, { seed: 77, up: [u3[0], .55], gavel: g, hatLift: (hats ? hats(3) : 0) * sc });
    table(cx, ty, gap * 7.3, ch * sc);
    if (cards) for (let i = 0; i < n; i++) card(cx + (i - 3) * gap + (i === 3 ? -70 * sc : 0), ty + 2, NAMES[i], 19 * sc);
    // the sounding block under the gavel
    shape([[cx + 120 * sc, ty - 2], [cx + 200 * sc, ty - 2], [cx + 196 * sc, ty - 16 * sc], [cx + 124 * sc, ty - 16 * sc]], WOOD, 2);
  }
  // gavel angle: rests raised, slams down at each hit
  function gavelAng(t, hits) {
    let a = -.35;
    for (const h of hits) { if (t > h - .35 && t < h + .6) { a = t < h ? lerp(-.35, -1.1, ease.out(inv(h - .35, h - .12, t))) + (t > h - .12 ? lerp(0, .75 + 1.1 - .35, ease.in(inv(h - .12, h, t))) : 0) : lerp(.4, -.35, ease.out(inv(h, h + .6, t))); } }
    return a;
  }

  // ---- shots ----
  // 133.0  up and out: a cross-section of the ministry, floor after floor, the camera riding a
  // pneumatic canister up the tube, out past the chimneys into the sky where the clouds are gathering.
  function rise(t, lt) {
    const T = 2450 * ease.inOut(inv(133.25, 135.35, t));
    s.translate(0, T);
    skyFill(-3900, -1300);
    // far clouds drifting in to meet
    for (let i = 0; i < 6; i++) { const sd = i % 2 ? 1 : -1, k = ease.out(inv(133.4, 135.5, t));
      const x = 960 + sd * (300 + i * 130) * (1.6 - k * .6), y = -2280 + (hash(i * 7) - .5) * 260 - i * 20;
      delegate(x, y, 60 + hash(i + 3) * 25, { seed: 50 + i, lean: sd * -.1, up: [0, 0] }); }
    bank(-1520, 70, 9, t * 20, { c: '#dfe9f0', depth: 120 });
    // the roof: chimneys and ducts, the ministry's crown
    shape([[-50, -1340], [W + 50, -1340], [W + 50, -1290], [-50, -1290]], '#4d5250', 3);
    for (const [x, h, w] of [[260, 520, 90], [470, 380, 70], [1460, 560, 100], [1690, 420, 70]]) {
      shape([[x - w / 2, -1340], [x + w / 2, -1340], [x + w / 2 - 6, -1340 - h], [x - w / 2 + 6, -1340 - h]], '#6b6a5a', 3);
      shape([[x - w / 2 - 10, -1340 - h - 24], [x + w / 2 + 10, -1340 - h - 24], [x + w / 2 + 10, -1340 - h], [x - w / 2 - 10, -1340 - h]], '#4d5250', 3);
      hatch([[x + 4, -1340], [x + w / 2, -1340], [x + w / 2 - 6, -1340 - h], [x + 4, -1340 - h]], .9, 9, 1.2, .4);
      for (let k = 0; k < 3; k++) { const ph = ((t * .45 + k / 3 + x * .001) % 1); withT(() => { s.globalAlpha = 1 - ph; blob(x + ph * 120, -1380 - h - ph * 260, 30 + ph * 50, x + k, { c: '#9a9c8c', lw: 2.5 }); }); }
    }
    duct2(1180, -1340, 1180, -1640, 34); duct2(760, -1340, 760, -1560, 26); duct2(980, -1340, 980, -1480, 40);
    // the storeys, in section
    for (let k = 0; k < 3; k++) storey(t, -200 - (k + 1) * 380, k);
    // the ceiling slab of the hall with its ducts in section
    shape([[-50, -200], [W + 50, -200], [W + 50, 0], [-50, 0]], '#3d4140', 3); hatch([[-50, -200], [W + 50, -200], [W + 50, -130], [-50, -130]], .8, 14, 1.4, .5);
    for (const x of [300, 700, 1220, 1620]) { s.beginPath(); s.arc(x, -60, 52, 0, TAU); s.fillStyle = STEEL; s.fill(); s.lineWidth = 3; s.strokeStyle = INK; s.stroke(); s.beginPath(); s.arc(x, -60, 30, 0, TAU); s.stroke(); }
    // the hall: tiled wall, the board, the hats
    s.fillStyle = '#8f9886'; s.fillRect(-50, 0, W + 100, 1100);
    withT(() => { s.globalAlpha = .45; for (let y = 0; y < 1100; y += 120) { ink([[0, y], [W, y]], 1.2); for (let x = (y / 120) % 2 ? 120 : 0; x < W; x += 240) ink([[x, y], [x, y + 120]], 1.2); } });
    ink([[760, 0], [760, 150]], 3); ink([[1160, 0], [1160, 150]], 3);
    shape([[560, 150], [1360, 150], [1360, 520], [560, 520]], BRASS, 5); shape([[595, 185], [1325, 185], [1325, 485], [595, 485]], '#1f201c', 3);
    text('NOW SERVING', 960, 262, 64, { font: 'sign', color: AMBER, spacing: 6 });
    text('0004', 960, 450, 170, { font: 'sign', color: AMBER, spacing: 10 });
    for (let row = 0; row < 3; row++) for (let i = 0; i < 9; i++) hatBack(150 + i * 202 + (row % 2) * 101, 720 + row * 130, 1 + row * .25);
    tubeV(t, T);
  }
  function duct2(x0, y0, x1, y1, r) {
    const horiz = y0 === y1;
    if (horiz) { shape([[x0, y0 - r], [x1, y0 - r], [x1, y0 + r], [x0, y0 + r]], STEEL, 2.5); for (let x = x0 + 30; x < x1; x += 46) ink([[x, y0 - r], [x, y0 + r]], 1.4); hatch([[x0, y0 + r * .2], [x1, y0 + r * .2], [x1, y0 + r], [x0, y0 + r]], .9, 7, 1, .4); }
    else { shape([[x0 - r, y0], [x0 + r, y0], [x0 + r, y1], [x0 - r, y1]], STEEL, 2.5); for (let y = y0 - 30; y > y1; y -= 46) ink([[x0 - r, y], [x0 + r, y]], 1.4); s.beginPath(); s.arc(x0, y1, r, Math.PI, TAU); s.fillStyle = STEEL_D; s.fill(); s.lineWidth = 2.5; s.strokeStyle = INK; s.stroke(); }
  }
  function hatBack(x, y, k) {
    shape([[x - 70 * k, y + 120 * k], [x + 70 * k, y + 120 * k], [x + 55 * k, y + 30 * k], [x - 55 * k, y + 30 * k]], COAT, 2);
    dot(x, y + 12 * k, 26 * k, SKIN); s.lineWidth = 2; s.strokeStyle = INK; s.beginPath(); s.arc(x, y + 12 * k, 26 * k, 0, TAU); s.stroke();
    fedora(x, y - 2 * k, 90 * k);
  }
  // one storey of clerks in section: desks, identical men, filing cabinets
  function storey(t, y, k) {
    shape([[-50, y], [W + 50, y], [W + 50, y + 380], [-50, y + 380]], k % 2 ? '#9a9c8c' : '#a7a48f', 3);
    shape([[-50, y + 340], [W + 50, y + 340], [W + 50, y + 380], [-50, y + 380]], '#4d5250', 3);
    hatch([[-50, y + 340], [W + 50, y + 340], [W + 50, y + 380], [-50, y + 380]], .8, 14, 1.2, .5);
    for (let i = 0; i < 7; i++) {
      const x = 130 + i * 250 + (k % 2) * 60;
      if (Math.abs(x - 1500) < 90) continue;
      // cabinet behind
      shape([[x - 110, y + 120], [x - 50, y + 120], [x - 50, y + 340], [x - 110, y + 340]], GREEN, 2); for (let d = 0; d < 3; d++) ink([[x - 100, y + 160 + d * 60], [x - 60, y + 160 + d * 60]], 2);
      // clerk side on at his desk, typing on the beat
      const b = beatPulse(t + i * .2) * 4;
      shape([[x - 10, y + 230], [x + 40, y + 230], [x + 46, y + 300], [x - 14, y + 300]], COAT, 2);
      dot(x + 15, y + 205 - b, 20, SKIN); s.lineWidth = 2; s.strokeStyle = INK; s.beginPath(); s.arc(x + 15, y + 205 - b, 20, 0, TAU); s.stroke();
      fedora(x + 15, y + 192 - b, 66);
      shape([[x + 50, y + 255], [x + 170, y + 255], [x + 170, y + 268], [x + 50, y + 268]], '#5d5a4c', 2);
      ink([[x + 60, y + 268], [x + 60, y + 340]], 3); ink([[x + 160, y + 268], [x + 160, y + 340]], 3);
      shape([[x + 85, y + 255], [x + 140, y + 255], [x + 134, y + 232], [x + 90, y + 232]], '#2e2d28', 2);
      ink([[x + 30, y + 245], [x + 88, y + 245 - b]], 4);
    }
  }
  // the vertical pneumatic tube, a canister riding up it with the camera
  function tubeV(t, T) {
    const x = 1500;
    withT(() => { s.globalAlpha = .55; s.fillStyle = '#c7d0cf'; s.fillRect(x - 26, -1340, 52, 1340); });
    ink([[x - 26, -1340], [x - 26, 0]], 2.5); ink([[x + 26, -1340], [x + 26, 0]], 2.5);
    for (let y = -1300; y < 0; y += 190) shape([[x - 32, y], [x + 32, y], [x + 32, y + 14], [x - 32, y + 14]], BRASS, 2);
    const cy = clamp(540 - T - 60, -1340, -40);
    shape([[x - 20, cy - 50], [x + 20, cy - 50], [x + 20, cy + 50], [x - 20, cy + 50]], BRASS, 2.5); ink([[x - 20, cy - 30], [x + 20, cy - 30]], 2); ink([[x - 20, cy + 30], [x + 20, cy + 30]], 2);
  }

  // 135.48 "the clouds are having a convention": the convention, frontal and symmetric, banner unfurling
  function convene(t, lt) {
    const z = 1 + lt * .012; s.translate(960, 540); s.scale(z, z); s.translate(-960, -540);
    skyFill(-200, 900);
    bank(700, 120, 4, t * 6, { c: '#d5e3ee', lw: 2.5, a: .9 });
    bank(780, 90, 6, -t * 9, { c: '#e7eef3', lw: 2.5 });
    // two towering cumulus pillars frame it
    for (const sd of [-1, 1]) for (let i = 0; i < 5; i++) blob(960 + sd * (820 + (i % 2) * 60), 760 - i * 150, 170 - i * 14, 200 + i + (sd > 0 ? 9 : 0), { c: '#f2f5f4', lw: 4 });
    banner(960, 130, 1250, 110, 'THE CLOUDS ARE HAVING A CONVENTION', ease.inOut(inv(135.5, 138.6, t)), 44);
    const g = gavelAng(t, [138.4]);
    convention(t, 960, 620, 1, { g });
    bank(880, 70, 11, t * 14, { c: '#f4f7f6', lw: 3 });
  }
  // agenda insert: the page on the table, the chair's gavel. Items typed on the words.
  const AG = ['1.  WE\'VE GOT TIME', '2.  WE\'VE GOT TIME', '3.  WE\'VE GOT TIME', '4.  SICK AND TIRED OF MAKING WAY', '5.  THE SUN'];
  function agenda(t, lines, ticks, hits, stampAt) {
    skyFill(-300, 520);
    withT(() => { s.globalAlpha = .9; for (let i = 0; i < 5; i++) blob(200 + i * 380, 300 + (i % 2) * 40, 150, 90 + i, { c: '#eef2f3', lw: 3 }); });
    shape([[-60, 360], [W + 60, 360], [W + 60, H + 60], [-60, H + 60]], '#9a8b70', 4);
    withT(() => { s.globalAlpha = .3; for (let i = 0; i < 9; i++) { const y = 400 + i * 75; line([[-40, y], [W + 40, y + Math.sin(i) * 12]], INK, 1.4); } });
    withT(() => { s.translate(960, 640); s.rotate(-.025);
      shape([[-420, -330], [420, -330], [420, 520], [-420, 520]], CREAM, 3);
      text('CONVENTION OF CLOUDS', 0, -250, 50, { font: 'sign', spacing: 5 });
      text('AGENDA', 0, -190, 30, { font: 'type', spacing: 8 });
      ink([[-340, -165], [340, -165]], 1.6);
      lines.forEach((ln, i) => { if (!ln) return; text(ln, -340, -100 + i * 66, 34, { align: 'left' }); });
      ticks.forEach((tk, i) => { if (tk <= 0) return; const k = clamp(tk); const x0 = 330, y0 = -112 + i * 66; line([[x0 - 30, y0], [x0 - 30 + 18 * Math.min(1, k * 2), y0 + 18 * Math.min(1, k * 2)]].concat(k > .5 ? [[x0 - 12 + 44 * (k - .5) * 2, y0 + 18 - 46 * (k - .5) * 2]] : []), BLUE_INK, 7); });
      if (stampAt) stamp(t, stampAt, 0, 380, 'MOTION CARRIED', { size: 64, color: BLUE_INK, rot: -.08 });
    });
    // the chair's gavel from the right, on a sounding block
    // sounding block: a squat drum on the table
    const bx = 1610, by = 800;
    shape([[bx - 95, by], [bx + 95, by], [bx + 95, by + 46], [bx - 95, by + 46]], '#5a4f40', 3);
    s.beginPath(); s.ellipse(bx, by + 46, 95, 20, 0, 0, Math.PI); s.fillStyle = '#5a4f40'; s.fill(); s.lineWidth = 3; s.strokeStyle = INK; s.stroke();
    s.beginPath(); s.ellipse(bx, by, 95, 20, 0, 0, TAU); s.fillStyle = '#8a7a60'; s.fill(); s.stroke();
    // the chair's arm comes in from the lower right; the gavel pivots in its mitt
    const piv = [1850, 900], L = 250, down = Math.atan2(by - 10 - piv[1], bx - piv[0]);
    const k = gavelAng(t, hits), th = down + clamp((.4 - k) / 1.5) * 1.1;
    withT(() => { s.translate(2010, 1060); blob(0, 0, 210, 81, { lw: 4 }); });
    const hd = [piv[0] + Math.cos(th) * L, piv[1] + Math.sin(th) * L];
    ink([piv, hd], 16);
    withT(() => { s.translate(hd[0], hd[1]); s.rotate(th + Math.PI / 2);
      shape([[-80, -32], [80, -32], [80, 32], [-80, 32]], WOOD, 4); ink([[-55, -32], [-55, 32]], 3); ink([[55, -32], [55, 32]], 3); });
    mitt(piv[0], piv[1], 34);
    for (const h of hits) { const q = hit(t, h, 5); if (q > .02) withT(() => { s.globalAlpha = q; for (let i = 0; i < 3; i++) { s.beginPath(); s.ellipse(bx, by, 130 + i * 60 + (1 - q) * 120, 34 + i * 16, 0, Math.PI * 1.05, Math.PI * 1.95); s.lineWidth = 4; s.strokeStyle = INK; s.stroke(); } }); }
  }
  const typed = (t, a, b, str) => str.slice(0, Math.floor(clamp((t - a) / (b - a)) * str.length + (t >= b ? 99 : 0)));
  // 139.76 first "we've got time": typed onto the agenda, gaveled on "time"
  function item1(t, lt) {
    agenda(t, [typed(t, 139.76, 141.06, AG[0])], [inv(141.07, 141.3, t)], [141.07], 0);
  }
  // 142.82 second: the delegates raise their hands one after another; on "time" every hat lifts
  function vote(t, lt) {
    const z = 1.0 + lt * .01; s.translate(960, 540); s.scale(z, z); s.translate(-960, -540);
    skyFill(-200, 1000);
    bank(820, 140, 21, t * 8, { c: '#dbe7ef', lw: 3 });
    const xs = [430, 960, 1490], nm = ['NIMBUS', 'STRATUS', 'CUMULUS'];
    xs.forEach((x, i) => {
      const t0 = [142.85, 143.3, 143.76][i];
      const u = ease.back(inv(t0, t0 + .35, t)); const hl = 170 * ease.out(inv(144.1, 144.45, t)) * (1 - ease.inOut(inv(145.0, 145.8, t)));
      delegate(x, 560 + Math.sin(t * 1.4 + i * 2) * 8, 210, { seed: 31 + i * 2, up: [0, u], lean: [.06, 0, -.06][i], hatLift: hl + Math.sin(t * 6 + i) * 6 * (hl > 1), hatRot: (hl / 170) * [-.4, .15, .5][i] });
    });
    table(960, 720, 2100, 300);
    xs.forEach((x, i) => card(x, 722, nm[i], 40));
    // tally on the cloth
    const n = (t > 142.85) + (t > 143.3) + (t > 143.76);
    for (let k = 0; k < n; k++) ink([[880 + k * 26, 800], [880 + k * 26, 870]], 6);
    text('AYES', 960, 920, 34, { font: 'sign', color: CREAM, spacing: 6 });
  }
  // 145.90 third: pulled far back. A tiny table in a cathedral of cumulus; the gavel rings the sky.
  function wide(t, lt) {
    skyFill(-100, 1100);
    const sc = .32 - lt * .01;
    for (let i = 0; i < 4; i++) { const k = hit(t, 147.3, 1.4); const R = (lt > 1.4 ? (t - 147.3) * 900 : 0) + i * 160;
      if (t > 147.3 && k > .02) withT(() => { s.globalAlpha = k * (1 - i * .2); s.beginPath(); s.ellipse(960, 690, R, R * .26, 0, 0, TAU); s.lineWidth = 3; s.strokeStyle = '#eef3f6'; s.stroke(); }); }
    for (const sd of [-1, 1]) for (let i = 0; i < 7; i++) { const x = 960 + sd * (560 + (i % 3) * 90 + i * 30), y = 1000 - i * 155; blob(x, y + Math.sin(t * .4 + i) * 6, 230 - i * 22, 300 + i + (sd > 0 ? 20 : 0), { c: i % 2 ? '#f3f6f5' : '#e8eff2', lw: 4 }); }
    bank(980, 160, 41, t * 4, { c: '#e3ecf2', lw: 3 });
    bank(720, 40, 44, t * 3, { c: '#eef3f5', lw: 2, depth: 400 });
    convention(t, 960, 690, sc, { g: gavelAng(t, [147.3]), cards: false });
  }
  // 147.78 "they're sick and tired of making way": the ministry's stacks shove up through the clouds,
  // a grey mail plane barges through.
  function shove(t, lt) {
    skyFill(-100, 900);
    // the plane
    const px = lerp(-400, 2300, inv(148.2, 150.0, t)), py = 230 + Math.sin(t * 3) * 6;
    const push = (cx) => clamp(1 - Math.abs(px - cx) / 300);
    delegate(560 + ease.out(inv(500, 900, px)) * 120, 190 + push(560) * 60 + ease.out(inv(560, 900, px)) * 90, 80, { seed: 61, lean: .4 * ease.out(inv(460, 800, px)), hatLift: 50 * ease.out(inv(460, 700, px)), up: [ease.out(inv(460, 700, px)), 0] });
    plane(px, py);
    // the stacks and the clouds they shove aside
    const up = ease.back(inv(148.0, 148.45, t));
    bank(720, 110, 55, t * 7, { c: '#e2ebf1', lw: 3 });
    const sx = [480, 960, 1440];
    sx.forEach((x, i) => { const h = 260 + (i === 1 ? up * 300 : 0) + i * 20 % 40;
      if (i !== 1) { const d = i === 0 ? -1 : 1; delegate(x + d * 150 + d * up * 80, 610 - (i === 1 ? 0 : 10), 100, { seed: 62 + i, lean: d * .25 * up, up: [i === 0 ? up * .7 : 0, i === 2 ? up * .7 : 0] }); }
      stack(t, x, 900, h, 80);
    });
    // the one that was sitting on the middle stack is thrown up and aside
    const k = ease.out(inv(148.05, 149.3, t));
    delegate(960 + k * 260, 560 - (300 * up) - Math.sin(k * Math.PI) * 120 + k * 120, 100, { seed: 64, lean: k * .8, up: [k, k], hatLift: 40 + k * 220, hatRot: k * 2 });
    bank(900, 90, 57, -t * 10, { c: '#f2f5f6', lw: 3 });
  }
  function stack(t, x, y, h, w) {
    shape([[x - w / 2, y], [x + w / 2, y], [x + w / 2 - 6, y - h], [x - w / 2 + 6, y - h]], '#6b6a5a', 3);
    for (let yy = y - 60; yy > y - h + 20; yy -= 70) ink([[x - w / 2 + 3, yy], [x + w / 2 - 3, yy]], 2);
    hatch([[x + 6, y], [x + w / 2, y], [x + w / 2 - 6, y - h], [x + 6, y - h]], .9, 9, 1.2, .4);
    shape([[x - w / 2 - 12, y - h - 26], [x + w / 2 + 12, y - h - 26], [x + w / 2 + 12, y - h], [x - w / 2 - 12, y - h]], '#4d5250', 3);
    for (let k = 0; k < 3; k++) { const ph = (t * .6 + k / 3 + x * .0013) % 1; withT(() => { s.globalAlpha = (1 - ph) * .9; blob(x + ph * 160, y - h - 60 - ph * 200, 34 + ph * 46, x + k * 3, { c: '#8f9389', lw: 2.5 }); }); }
  }
  function plane(x, y) {
    withT(() => { s.translate(x, y);
      shape([[-170, -40], [120, -40], [190, -10], [190, 20], [-170, 30]], '#7f8b8e', 3);
      for (let i = -130; i < 120; i += 50) ink([[i, -40], [i, 28]], 1.6);
      shape([[-40, -10], [60, -10], [10, 90], [-80, 90]], '#59646a', 3);
      shape([[-170, -40], [-130, -40], [-150, -100], [-200, -100]], '#59646a', 3);
      shape([[-120, -40], [80, -40], [70, -64], [-110, -64]], STEEL, 2.5); // the duct on its back
      for (let i = -100; i < 70; i += 28) ink([[i, -40], [i, -64]], 1.3);
      dot(200, 5, 14, INK); const pr = Math.sin(x * .2); ink([[200, 5 - 70 * pr], [200, 5 + 70 * pr]], 6);
      text('MIN.', -10, 12, 30, { font: 'sign', color: CREAM }); });
  }
  // 149.80 the picket line: delegates crossing the sky with placards
  function picket(t, lt) {
    skyFill(-200, 1000);
    bank(860, 120, 71, t * 12, { c: '#dde8f0', lw: 3 });
    const signs = ['SICK AND TIRED', 'OF MAKING WAY'];
    for (let i = 0; i < 5; i++) {
      const x = -420 + i * 560 + lt * 90, b = beatPulse(t + i * .37, 5);
      if (x < -500 || x > W + 500) continue;
      delegate(x, 640 - b * 18 + Math.sin(t * 2 + i) * 6, 150, { seed: 80 + i, lean: .1 + Math.sin(t * 2.6 + i) * .05, up: [.42, 0], sign: signs[i % 2] });
    }
    bank(990, 90, 73, t * 22, { c: '#f2f5f6', lw: 3 });
  }
  // 152.10 "we've got time": back to the agenda, all three ticked, the motion carried in sky-blue ink
  function carried(t, lt) {
    agenda(t, AG.slice(0, 4), [1, 1, 1, inv(152.6, 152.9, t)], [], 153.27);
  }
  // 155.5 the convention lowers a periscope down through the clouds to the ministry roof far below
  function scope(t, lt) {
    const tip = lerp(980, 2060, ease.inOut(inv(155.9, 158.8, t)));
    const T = Math.max(0, tip - 760) * .95;
    s.translate(0, -T);
    skyFill(-200, 2600, SKY_D);
    // the ministry far below
    const top = 2080;
    shape([[700, top], [1220, top], [1220, 3200], [700, 3200]], '#6b6a5a', 4);
    for (let y = top + 50; y < 3200; y += 70) for (let x = 730; x < 1200; x += 60) shape([[x, y], [x + 34, y], [x + 34, y + 40], [x, y + 40]], hash(x * 3 + y) > .7 ? AMBER : '#3d4140', 1.5);
    hatch([[980, top], [1220, top], [1220, 3200], [980, 3200]], .9, 12, 1.3, .35);
    for (const [x, h] of [[760, 150], [1150, 210], [860, 90]]) stack(t, x, top, h, 46);
    duct2(1020, top, 1020, top - 70, 30);
    shape([[935, top - 10], [985, top - 10], [985, top], [935, top]], '#2a2a24', 2); // the roof hatch
    bank(2400, 120, 91, t * 10, { c: '#c9d6e0', lw: 2.5, a: .8 });
    // the periscope
    shape([[940, 760], [980, 760], [980, tip], [940, tip]], BRASS, 3);
    for (let y = 820; y < tip; y += 160) ink([[940, y], [980, y]], 2);
    shape([[928, tip - 6], [992, tip - 6], [992, tip + 34], [928, tip + 34]], '#7a6334', 3);
    // the convention on its cloud floor up top
    convention(t, 960, 610, .8, { g: -.35, lean: .08 * ease.out(inv(155.6, 157, t)) });
    bank(760, 100, 93, t * 6, { c: '#eef3f5', lw: 3, depth: 200 });
    for (let x = -60; x < W + 120; x += 150) blob(x, 945 + (hash(x) - .5) * 30, 95 + hash(x + 1) * 30, 600 + x, { c: '#e3ebf0', lw: 3 });
    for (const sd of [-1, 1]) for (let i = 0; i < 4; i++) blob(960 + sd * (700 + i * 90), 860 + i * 60, 160 - i * 20, 400 + i + (sd > 0 ? 7 : 0), { c: '#e9f0f3', lw: 3 });
  }
  // 159.53 "they wonder when they're gonna see the sun": the chair at the eyepiece, the others craning
  function peer(t, lt) {
    const z = 1 + lt * .03; s.translate(960, 540); s.scale(z, z); s.translate(-960, -540);
    skyFill(-200, 1000);
    bank(860, 110, 101, t * 6, { c: '#dbe6ee', lw: 3 });
    for (let i = 0; i < 4; i++) { const x = [300, 560, 1500, 1720][i]; delegate(x, 520 + i % 2 * 40, 110, { seed: 110 + i, lean: (x < 960 ? .28 : -.28) + Math.sin(t * 1.6 + i) * .04 }); }
    // the periscope comes up out of the clouds; eyepiece hood at the top
    shape([[1040, 1100], [1120, 1100], [1120, 420], [1040, 420]], BRASS, 4);
    for (let y = 1040; y > 440; y -= 120) ink([[1040, y], [1120, y]], 2.5);
    shape([[870, 340], [1120, 340], [1120, 460], [870, 460]], BRASS, 4);
    s.beginPath(); s.arc(1120, 420, 80, -Math.PI / 2, 0); s.lineTo(1120, 420); s.closePath(); s.fillStyle = BRASS; s.fill(); s.lineWidth = 4; s.strokeStyle = INK; s.stroke();
    shape([[820, 360], [872, 352], [872, 448], [820, 440]], '#3a382f', 3);   // the eyepiece hood
    ink([[790, 530], [1040, 530]], 12); dot(790, 530, 16, '#3a382f'); // the handle the chair holds
    delegate(610, 470 + Math.sin(t * 2) * 4, 170, { seed: 77, lean: .2, up: [0, .18], hatLift: 18, hatRot: .55 });
    bank(980, 80, 103, t * 12, { c: '#f2f5f6', lw: 3 });
  }
  // 161.40 the periscope's view: the ministry archive. One drawer is labelled SUN; it opens on "sun".
  function pov(t, lt) {
    fill('#0d0d0b');
    const R = 470, cx = 960, cy = 540;
    const ox = kf(t, [[161.4, 520], [162.1, -120], [162.45, 0]], ease.inOut), oy = kf(t, [[161.4, -90], [162.45, 0]], ease.inOut);
    withT(() => {
      s.beginPath(); s.arc(cx, cy, R, 0, TAU); s.clip();
      s.fillStyle = '#5c6260'; s.fillRect(0, 0, W, H);
      s.translate(ox, oy);
      for (let r = -4; r <= 4; r++) for (let c = -6; c <= 6; c++) {
        const x = cx + c * 230 - 105, y = cy + r * 150 - 60;
        if (r === 0 && c === 0) continue;
        shape([[x, y], [x + 210, y], [x + 210, y + 130], [x, y + 130]], GREEN, 3);
        shape([[x + 70, y + 30], [x + 140, y + 30], [x + 140, y + 62], [x + 70, y + 62]], CREAM, 2);
        text(String(1000 + Math.floor(hash(r * 31 + c * 7 + 400) * 8999)), x + 105, y + 56, 22, { font: 'type' });
        shape([[x + 85, y + 82], [x + 125, y + 82], [x + 125, y + 96], [x + 85, y + 96]], BRASS, 2);
      }
      // the SUN drawer
      const op = ease.out(inv(162.8, 163.6, t)), x = cx - 105, y = cy - 60, gw = 210 + op * 90, gh = 130 + op * 56;
      const glow = .5 + .5 * Math.sin(t * 9) * (1 - op);
      withT(() => { s.globalAlpha = .5 + glow * .4; line([[x - 4, y - 4], [x + 214, y - 4], [x + 214, y + 134], [x - 4, y + 134], [x - 4, y - 4]], '#fff3c4', 8); });
      if (op > 0) withT(() => { s.globalAlpha = op;
        for (let i = 0; i < 14; i++) { const a = i / 14 * TAU + t * .3; poly([[cx, cy - op * 40], [cx + Math.cos(a) * 900, cy + Math.sin(a) * 900], [cx + Math.cos(a + .12) * 900, cy + Math.sin(a + .12) * 900]], '#fff1c2'); }
        shape([[cx - gw / 2, cy - gh / 2 - op * 50], [cx + gw / 2, cy - gh / 2 - op * 50], [cx + gw / 2 - 20, cy - gh / 2 - op * 50 - 40 * op], [cx - gw / 2 + 20, cy - gh / 2 - op * 50 - 40 * op]], '#fff6d8', 3); });
      shape([[cx - gw / 2, cy - gh / 2 + op * 20], [cx + gw / 2, cy - gh / 2 + op * 20], [cx + gw / 2, cy + gh / 2 + op * 20], [cx - gw / 2, cy + gh / 2 + op * 20]], GREEN, 3);
      shape([[cx - 50, cy - 40 + op * 20], [cx + 50, cy - 40 + op * 20], [cx + 50, cy + 4 + op * 20], [cx - 50, cy + 4 + op * 20]], CREAM, 2.5);
      text('SUN', cx, cy - 6 + op * 20, 36, { font: 'sign', spacing: 4 });
      shape([[cx - 26, cy + 30 + op * 20], [cx + 26, cy + 30 + op * 20], [cx + 26, cy + 46 + op * 20], [cx - 26, cy + 46 + op * 20]], BRASS, 2);
    });
    // the lens: reticle and rim
    withT(() => { s.globalAlpha = .55; ink([[cx - R, cy], [cx - 60, cy]], 2); ink([[cx + 60, cy], [cx + R, cy]], 2); ink([[cx, cy - R], [cx, cy - 60]], 2); ink([[cx, cy + 60], [cx, cy + R]], 2);
      for (let i = -4; i <= 4; i++) if (i) ink([[cx + i * 80, cy - 10], [cx + i * 80, cy + 10]], 2); });
    s.beginPath(); s.arc(cx, cy, R, 0, TAU); s.lineWidth = 16; s.strokeStyle = '#2a2822'; s.stroke(); s.lineWidth = 4; s.strokeStyle = BRASS; s.beginPath(); s.arc(cx, cy, R + 12, 0, TAU); s.stroke();
  }
  // 164.10 "we've got time": the hall clock, ticking and getting nowhere
  const SUNC = [960, 430], SUNR = 270;
  function clockUp(t, lt) {
    s.fillStyle = '#8f9886'; s.fillRect(0, 0, W, H);
    withT(() => { s.globalAlpha = .45; for (let y = -20; y < H; y += 120) { ink([[0, y], [W, y]], 1.2); for (let x = ((y + 20) / 120) % 2 ? 120 : 0; x < W; x += 240) ink([[x, y], [x, y + 120]], 1.2); } });
    duct2(-60, 900, W + 60, 900, 70);
    const [cx, cy] = SUNC, r = SUNR;
    s.beginPath(); s.arc(cx, cy, r + 26, 0, TAU); s.fillStyle = '#3e3c35'; s.fill(); s.lineWidth = 4; s.strokeStyle = INK; s.stroke();
    s.beginPath(); s.arc(cx, cy, r, 0, TAU); s.fillStyle = CREAM; s.fill(); s.lineWidth = 4; s.stroke();
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; ink([[cx + Math.cos(a) * r * .78, cy + Math.sin(a) * r * .78], [cx + Math.cos(a) * r * .93, cy + Math.sin(a) * r * .93]], i % 3 ? 4 : 9); }
    text('MINISTRY TIME', cx, cy + r * .42, 26, { font: 'sign', spacing: 4 });
    const bt = lastBeat(t), spin = ease.in(inv(164.9, 165.33, t)) * TAU * 1.5;
    const h = -Math.PI / 2 + .35 + spin * .08, mi = -Math.PI / 2 + 2.2 + spin, sc = -Math.PI / 2 + bt * TAU / 60;
    ink([[cx, cy], [cx + Math.cos(h) * r * .5, cy + Math.sin(h) * r * .5]], 14);
    ink([[cx, cy], [cx + Math.cos(mi) * r * .74, cy + Math.sin(mi) * r * .74]], 9);
    line([[cx - Math.cos(sc) * r * .15, cy - Math.sin(sc) * r * .15], [cx + Math.cos(sc) * r * .86, cy + Math.sin(sc) * r * .86]], '#7a2a1e', 3.5);
    dot(cx, cy, 14, INK);
  }
  // 165.33 on "time": the clock face is the sun. Twelve rays where the hours were. Pull back to the
  // convention below, every hat in the air.
  function sun(t, lt) {
    const z = lerp(1, .58, ease.out(inv(165.33, 169.6, t)));
    s.translate(SUNC[0], SUNC[1]); s.scale(z, z); s.translate(-SUNC[0], -SUNC[1]);
    skyFill(-900, 1700);
    const [cx, cy] = SUNC, r = SUNR;
    withT(() => { s.globalAlpha = .55; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + lt * .06; poly([[cx + Math.cos(a - .09) * r * 1.15, cy + Math.sin(a - .09) * r * 1.15], [cx + Math.cos(a) * r * 3.6, cy + Math.sin(a) * r * 3.6], [cx + Math.cos(a + .09) * r * 1.15, cy + Math.sin(a + .09) * r * 1.15]], '#f6efcf'); } });
    s.beginPath(); s.arc(cx, cy, r * 1.1, 0, TAU); s.fillStyle = '#f3dc95'; s.fill();
    s.beginPath(); s.arc(cx, cy, r, 0, TAU); s.fillStyle = '#fff6dc'; s.fill(); s.lineWidth = 5; s.strokeStyle = INK; s.stroke();
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + lt * .06; ink([[cx + Math.cos(a) * r * 1.14, cy + Math.sin(a) * r * 1.14], [cx + Math.cos(a) * r * (1.32 + (i % 3 ? 0 : .14)), cy + Math.sin(a) * r * (1.32 + (i % 3 ? 0 : .14))]], i % 3 ? 5 : 9); }
    bank(1180, 150, 121, t * 6, { c: '#d8e5ee', lw: 4, depth: 1200 });
    for (const sd of [-1, 1]) for (let i = 0; i < 5; i++) blob(cx + sd * (980 + i * 120), 1300 - i * 170, 240 - i * 20, 500 + i + (sd > 0 ? 5 : 0), { c: '#eef3f5', lw: 4 });
    const cheer = (i) => { const k = ease.back(inv(165.4 + i * .09, 165.9 + i * .09, t)); return [k * (i % 2 ? .4 : 1), k * (i % 2 ? 1 : .5)]; };
    const hats = (i) => 260 * Math.sin(Math.PI * clamp((t - 166.0 - (i % 3) * .1) / 1.6));
    convention(t, cx, 1420, 1.25, { g: -1.2, ups: cheer, hats });
    bank(1720, 140, 123, -t * 8, { c: '#f2f5f6', lw: 4, depth: 900 });
  }

  chapter('clouds', 133.0, 170.0, [
    [133.0, rise], [135.48, convene], [139.76, item1], [142.82, vote], [145.90, wide], [147.78, shove],
    [149.80, picket], [152.10, carried], [155.50, scope], [159.53, peer], [161.40, pov], [164.10, clockUp],
    [165.33, sun, { fx: { sat: .42 } }],
  ]);
})();
