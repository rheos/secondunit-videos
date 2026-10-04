// 203.57 - 245.0  late for the boss, after one look back at her ("I don't want to leave you babe"). The "do do do"s are clock ticks and footsteps: a wall of clocks, a run
// against the crowd, the punch clock and his time card, a corridor with the boss at the end of it. The boss
// is never a person: a loudspeaker horn on a duct with a grille for a mouth, and its words come out as huge
// type. Then the release: a rose stamp on the card, the card torn twice, confetti that turns into birds,
// and he strolls off the other way under a crack of sky.
(() => {
  const VO = FEAT.vonsets;
  const snap = (x, w = .2) => { let best = x, d = w; for (const v of VO) { const e = Math.abs(v - x); if (e < d) { d = e; best = v; } } return best; };
  // the sung "do"s (each one a tick)
  const DO = [206.26, 207.58, 208.08, 208.76, 209.32, 209.98, 211.3, 212.22, 212.66,
    218.3, 219.02, 219.46, 220.08, 220.5, 220.8, 221.74, 221.96, 222.84, 223.54, 223.98,
    229.94, 230.74, 231.26, 231.96, 232.42, 233.12, 233.5, 234.18, 234.72].map((x) => snap(x, .15));
  const FREEZE = 235.0;
  function ticks(t) {
    const tt = Math.min(t, FREEZE); let n = 0; while (n < DO.length && DO[n] <= tt) n++;
    if (!n) return 0; return n - 1 + ease.back(clamp((tt - DO[n - 1]) / .12));
  }
  const tickHit = (t) => { let last = -9; for (const d of DO) if (d <= t) last = d; return t < FREEZE ? hit(t, last, 9) : 0; };
  const BLACK = '#1d1c19', WALL = '#8f9886', CLERK = '#4f4c42';
  const FUT = 'Futura, "Gill Sans", sans-serif';
  // the pinball-cel drawing style (pnc.html): rounded figures, airbrushed volume, glossy brass, deco dials
  const K = window.PNC_ON ? window.PNCK : null;
  const TROUSER = '#4f4b42', SHOE = '#2c2621';
  const glint = (cx, cy, r, w = .05, a0 = Math.PI * 1.05, a1 = Math.PI * 1.45) => { s.beginPath(); s.arc(cx, cy, r, a0, a1); s.lineWidth = Math.max(1, r * w); s.lineCap = 'round'; s.strokeStyle = 'rgba(255,250,235,.6)'; s.stroke(); };
  const disc = (cx, cy, r, c, lw = 1.2) => { s.beginPath(); s.arc(cx, cy, r, 0, TAU); K.soft(c, cx - r, cy - r, cx + r, cy + r); s.lineWidth = lw; s.strokeStyle = K.dark(c, .55); s.stroke(); };
  // PNC: a man seen from the front or back, in local metres (feet at 0,0). st = stride sine.
  function frontFig(lw, { back = false, mine = false, st = 0, run = 0, hold = false, coat = CLERK } = {}) {
    const bob = Math.abs(st) * (.03 + run * .04), l1 = Math.max(0, st) * (.1 + run * .12), l2 = Math.max(0, -st) * (.1 + run * .12);
    for (const [lx, lift] of [[-.1, l1], [.1, l2]]) {
      K.tube([lx, -.95 - bob], [lx * 1.05, -.5 - lift / 2], [lx, -.06 - lift], .085, .065, TROUSER, lw);
      K.blob([[lx - .09, -.08 - lift], [lx + .09, -.08 - lift], [lx + .1, -lift], [lx - .1, -lift]], SHOE, lw);
    }
    const sh = -1.45 - bob;
    for (const sg of [-1, 1]) {
      if (hold && sg < 0) { K.tube([-.2, sh + .1], [-.42, sh - .15], [-.15, sh - .38], .07, .055, coat, lw); K.ball(-.15, sh - .38, .06, SKIN, lw); continue; }
      const a = st * .35 * sg * (1 + run), hd = [sg * (.3 + Math.abs(a) * .2), sh + .64];
      K.tube([sg * .2, sh + .1], [sg * .3, sh + .36], hd, .07, .055, coat, lw); K.ball(hd[0], hd[1], .055, SKIN, lw);
    }
    K.blob([[-.17, sh - .02], [.17, sh - .02], [.24, sh + .12], [.25, sh + .5], [.33, -.45 - bob], [0, -.42 - bob], [-.33, -.45 - bob], [-.25, sh + .5], [-.24, sh + .12]], coat, lw);
    if (!back) { K.blob([[-.08, sh - .01], [.08, sh - .01], [0, sh + .16]], CREAM, lw, false); line([[0, sh + .16], [0, -.5 - bob]], K.dark(coat, .5), lw); for (const yy of [sh + .35, sh + .6]) K.ball(.04, yy, .022, K.dark(coat, .3), lw * .6); }
    const hy = sh - .18;
    if (back) { K.head(0, hy, lw, { back: true }); return; }
    K.blob([[-.11, hy - .11], [.11, hy - .11], [.13, hy + .02], [.08, hy + .13], [-.08, hy + .13], [-.13, hy + .02]], SKIN, lw);
    for (const ex of [-.045, .045]) { s.beginPath(); s.ellipse(ex, hy - .02, .016, .024, 0, 0, TAU); s.fillStyle = '#2a1f1a'; s.fill(); }
    K.ball(0, hy + .035, .04, K.mix(SKIN, '#c0605a', .25), lw);
    K.blob([[-.25, hy - .09], [.25, hy - .09], [.27, hy - .05], [0, hy - .03], [-.27, hy - .05]], HAT, lw);
    K.blob([[-.14, hy - .09], [.14, hy - .09], [.13, hy - .27], [0, hy - .23], [-.13, hy - .27]], HAT, lw);
    s.fillStyle = K.dark(HAT, .5); s.fillRect(-.135, hy - .14, .27, .035);
  }
  function bold(str, x, y, size, { color = INK, align = 'center', rot = 0, alpha = 1, outline = 0, max = 0 } = {}) {
    if (max) { s.save(); s.font = `bold ${Math.round(size)}px ${FUT}`; const wd = s.measureText(str).width + outline; s.restore(); if (wd > max) { outline *= max / wd; size *= max / wd; } }
    withT(() => { s.translate(x, y); s.rotate(rot); s.globalAlpha *= alpha; s.textAlign = align; s.textBaseline = 'alphabetic';
      s.font = `bold ${Math.round(size)}px ${FUT}`;
      if (outline) { s.lineJoin = 'round'; s.lineWidth = outline; s.strokeStyle = INK; s.strokeText(str, 0, 0); }
      s.fillStyle = color; s.fillText(str, 0, 0); });
  }

  // ---- props ----
  // a wall clock: every one shows a different time; all the second hands jump on each "do"
  function clockFace(cx, cy, r, seed, t) {
    if (K) return clockDeco(cx, cy, r, seed, t);
    dot(cx, cy, r * 1.08, INK); dot(cx, cy, r, CREAM);
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; ink([[cx + Math.cos(a) * r * .78, cy + Math.sin(a) * r * .78], [cx + Math.cos(a) * r * .9, cy + Math.sin(a) * r * .9]], Math.max(1.2, r * (i % 3 ? .03 : .06))); }
    const tk = ticks(t), h = hash(seed * 7 + 1) * TAU, m = hash(seed * 7 + 2) * TAU + tk * TAU / 240, sc = hash(seed * 7 + 3) * TAU + tk * TAU / 12;
    ink([[cx, cy], [cx + Math.sin(h) * r * .48, cy - Math.cos(h) * r * .48]], Math.max(2, r * .09));
    ink([[cx, cy], [cx + Math.sin(m) * r * .72, cy - Math.cos(m) * r * .72]], Math.max(1.5, r * .055));
    line([[cx - Math.sin(sc) * r * .15, cy + Math.cos(sc) * r * .15], [cx + Math.sin(sc) * r * .84, cy - Math.cos(sc) * r * .84]], '#3a2f2a', Math.max(1, r * .025));
    dot(cx, cy, Math.max(2, r * .06), INK);
  }
  function clockDeco(cx, cy, r, seed, t) {
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU, a2 = a + TAU / 24; s.beginPath(); s.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      s.lineTo(cx + Math.cos(a2 - .13) * r * 1.3, cy + Math.sin(a2 - .13) * r * 1.3); s.lineTo(cx + Math.cos(a2 + .13) * r * 1.3, cy + Math.sin(a2 + .13) * r * 1.3); s.closePath();
      K.soft(i % 2 ? BRASS : CREAM, cx - r * 1.3, cy - r * 1.3, cx + r * 1.3, cy + r * 1.3); s.lineWidth = .8; s.strokeStyle = K.LINE; s.stroke(); }
    disc(cx, cy, r * 1.04, BRASS, 1); glint(cx, cy, r * .98, .05); disc(cx, cy, r * .88, CREAM, 1);
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; line([[cx + Math.cos(a) * r * .74, cy + Math.sin(a) * r * .74], [cx + Math.cos(a) * r * .84, cy + Math.sin(a) * r * .84]], K.LINE, Math.max(.8, r * (i % 3 ? .015 : .035))); }
    if (r > 70) for (const i of [12, 3, 6, 9]) { const a = -Math.PI / 2 + i / 12 * TAU; text(String(i), cx + Math.cos(a) * r * .6, cy + Math.sin(a) * r * .6 + r * .07, r * .2, { font: 'sign', color: K.LINE, max: r * .3 }); }
    const tk = ticks(t), h = hash(seed * 7 + 1) * TAU, m = hash(seed * 7 + 2) * TAU + tk * TAU / 240, sc = hash(seed * 7 + 3) * TAU + tk * TAU / 12;
    const hand = (a, L, w, c) => { const tip = [cx + Math.sin(a) * L, cy - Math.cos(a) * L], n = [Math.cos(a) * w, Math.sin(a) * w];
      s.beginPath(); s.moveTo(cx + n[0], cy + n[1]); s.lineTo(tip[0], tip[1]); s.lineTo(cx - n[0], cy - n[1]); s.closePath(); s.fillStyle = c; s.fill(); };
    hand(h, r * .46, r * .07, '#3a2e28'); hand(m, r * .7, r * .045, '#3a2e28');
    line([[cx - Math.sin(sc) * r * .15, cy + Math.cos(sc) * r * .15], [cx + Math.sin(sc) * r * .8, cy - Math.cos(sc) * r * .8]], '#6a3a2c', Math.max(.8, r * .018));
    K.ball(cx, cy, Math.max(2, r * .08), BRASS, .8);
  }
  // a clerk, side on, walking (face -1 = to the left), briefcase in the near hand
  function clerk(x, z, ph, face = -1) {
    if (K) {
      const b = P(x, FL, z), k = b[2], sw = Math.sin(ph * TAU) * .3, bob = Math.abs(Math.sin(ph * TAU)) * .03;
      return K.fig(b, k, face, (u) => {
        const lw = 1.3 * u, hip = [0, -.95];
        for (const [a, far] of [[-sw, true], [sw, false]]) { const kn = [Math.sin(a) * .5, -.45], ft = [Math.sin(a) * .9 + .04, -.05];
          K.tube(hip, kn, ft, .1, .07, far ? K.dark(TROUSER, .2) : TROUSER, lw); K.blob([[ft[0] - .07, -.07], [ft[0] + .12, -.08], [ft[0] + .17, -.01], [ft[0] - .08, 0]], SHOE, lw); }
        const sh = -1.45 + bob;
        K.blob([[-.15, sh - .02], [.13, sh - .02], [.2, sh + .1], [.18, sh + .5], [.3, -.45], [0, -.43], [-.3, -.45], [-.2, sh + .5], [-.21, sh + .1]], CLERK, lw);
        K.head(.04, -1.64 + bob, lw);
        const shp = [.02, sh + .12], ang = -sw * .7, hd = [shp[0] + Math.sin(ang) * .6, shp[1] + Math.cos(ang) * .6];
        K.tube(shp, [(shp[0] + hd[0]) / 2 + .02, (shp[1] + hd[1]) / 2], hd, .07, .05, CLERK, lw);
        K.blob([[hd[0] - .18, hd[1] + .03], [hd[0] + .18, hd[1] + .03], [hd[0] + .18, hd[1] + .27], [hd[0] - .18, hd[1] + .27]], '#3a3129', lw, false);
        s.beginPath(); s.arc(hd[0], hd[1] + .03, .05, Math.PI, TAU); s.lineWidth = .025; s.strokeStyle = '#2a221c'; s.stroke();
        K.ball(hd[0], hd[1], .055, SKIN, lw);
      });
    }
    const b = P(x, FL, z), k = b[2], sw = Math.sin(ph * TAU) * .3, bob = Math.abs(Math.sin(ph * TAU)) * .03 * k;
    const hip = [b[0], b[1] - .95 * k];
    for (const a of [-sw, sw]) ink([hip, [hip[0] + Math.sin(a) * .5 * k * face, hip[1] + .5 * k], [hip[0] + Math.sin(a) * .9 * k * face + .04 * k * face, b[1]]], .12 * k);
    const sh = b[1] - 1.45 * k + bob;
    shape([[b[0] - .24 * k, sh], [b[0] + .22 * k, sh], [b[0] + .33 * k, b[1] - .45 * k], [b[0] - .33 * k, b[1] - .45 * k]], CLERK, Math.max(1.2, k * .014));
    hatch([[b[0], sh], [b[0] - .23 * k * face, sh], [b[0] - .33 * k * face, b[1] - .45 * k], [b[0], b[1] - .45 * k]], .9, 6, 1, .35);
    const hx = b[0] + .04 * k * face, hy = sh - .2 * k;
    dot(hx, hy, .12 * k, SKIN); s.lineWidth = Math.max(1, k * .014); s.strokeStyle = INK; s.beginPath(); s.arc(hx, hy, .12 * k, 0, TAU); s.stroke();
    s.beginPath(); s.ellipse(hx, hy - .09 * k, .24 * k, .045 * k, 0, 0, TAU); s.fillStyle = HAT; s.fill(); s.stroke();
    shape([[hx - .13 * k, hy - .09 * k], [hx + .13 * k, hy - .09 * k], [hx + .11 * k, hy - .27 * k], [hx - .11 * k, hy - .27 * k]], HAT, Math.max(1, k * .012));
    const shp = [b[0], sh + .12 * k], ang = -sw * .7 * face, hand = [shp[0] + Math.sin(ang) * .6 * k * face, shp[1] + Math.cos(ang) * .6 * k];
    ink([shp, hand], .09 * k);
    shape([[hand[0] - .17 * k, hand[1] + .02 * k], [hand[0] + .17 * k, hand[1] + .02 * k], [hand[0] + .17 * k, hand[1] + .26 * k], [hand[0] - .17 * k, hand[1] + .26 * k]], '#2e2b25', Math.max(1, k * .012));
  }
  // a man seen from the front (walking toward us) or the back (back: true); mine: his guitar case
  function walker(x, z, ph, { back = false, mine = false, run = 0 } = {}) {
    const b = P(x, FL, z), k = b[2], st = Math.sin(ph * TAU), bob = Math.abs(st) * (.03 + run * .04) * k;
    if (K) { if (mine && back) guitarCase(b[0] + .36 * k, b[1] - .45 * k - bob, k, { fore: .4 }); return K.fig(b, k, 1, (u) => frontFig(1.3 * u, { back, mine, st, run, coat: mine ? COAT : CLERK })); }
    const l1 = Math.max(0, st) * (.1 + run * .12) * k, l2 = Math.max(0, -st) * (.1 + run * .12) * k;
    line([[b[0] - .1 * k, b[1] - .95 * k - bob], [b[0] - .1 * k, b[1] - l1]], INK, .13 * k, 'butt');
    line([[b[0] + .1 * k, b[1] - .95 * k - bob], [b[0] + .1 * k, b[1] - l2]], INK, .13 * k, 'butt');
    const sh = b[1] - 1.45 * k - bob, c = mine ? COAT : CLERK;
    if (mine && back) guitarCase(b[0] + .36 * k, b[1] - .45 * k - bob, k, { fore: .4 }); // seen from behind: end on
    for (const sgn of [-1, 1]) { const a = st * .35 * sgn * (1 + run); ink([[b[0] + sgn * .25 * k, sh + .1 * k], [b[0] + sgn * (.3 + Math.abs(a) * .2) * k, sh + .62 * k]], .09 * k); }
    shape([[b[0] - .24 * k, sh], [b[0] + .24 * k, sh], [b[0] + .32 * k, b[1] - .45 * k - bob], [b[0] - .32 * k, b[1] - .45 * k - bob]], c, Math.max(1.2, k * .014));
    if (!back) { ink([[b[0], sh + .05 * k], [b[0], b[1] - .5 * k - bob]], Math.max(1, k * .012)); shape([[b[0] - .1 * k, sh], [b[0] + .1 * k, sh], [b[0], sh + .14 * k]], CREAM, Math.max(1, k * .01)); }
    else hatch([[b[0] - .24 * k, sh], [b[0] + .24 * k, sh], [b[0] + .32 * k, b[1] - .45 * k - bob], [b[0] - .32 * k, b[1] - .45 * k - bob]], .9, 7, 1, .3);
    const hy = sh - .17 * k;
    dot(b[0], hy, .12 * k, back ? '#b39575' : SKIN); s.lineWidth = Math.max(1, k * .014); s.strokeStyle = INK; s.beginPath(); s.arc(b[0], hy, .12 * k, 0, TAU); s.stroke();
    s.beginPath(); s.ellipse(b[0], hy - .08 * k, .25 * k, .05 * k, 0, 0, TAU); s.fillStyle = HAT; s.fill(); s.stroke();
    shape([[b[0] - .13 * k, hy - .08 * k], [b[0] + .13 * k, hy - .08 * k], [b[0] + .11 * k, hy - .27 * k], [b[0] - .11 * k, hy - .27 * k]], HAT, Math.max(1, k * .012));
  }
  // gloved fist and sleeve; (x, y) = knuckles, a = angle the sleeve comes in from
  function glove(x, y, a, sc = 1) { gripHand(x, y, a, sc * 1.25, { glove: true, sleeve: COAT }); }
  // his time card, (0,0) top-left, 480 x 680 before sc. words: the line typed so far.
  const CARD_W = 480, CARD_H = 680;
  const LYR = [['JUST', 212.8], ['TO', 213.16], ['SHOW', 213.6], ['UP', 214.08], ['ON', 214.46], ['TIME', 214.88], ['FOR', 216.06], ['MY', 216.76], ['BOSS', 217.2]];
  function card(t, { late = null, punched = false } = {}) {
    shape([[0, 0], [CARD_W, 0], [CARD_W, CARD_H], [0, CARD_H]], CREAM, 3);
    bold('TIME CARD', 30, 62, 40, { align: 'left', max: 230 });
    text('MINISTRY OF WAITING', CARD_W - 26, 58, 14, { font: 'sign', align: 'right', max: 170 });
    text('No. 7 436 912', 30, 118, 34, { align: 'left', max: CARD_W - 60 });
    ink([[24, 140], [CARD_W - 24, 140]], 2);
    const shown = LYR.filter(([, tw]) => t >= tw).map(([w]) => w);
    const fitLine = 'ON TIME FOR MY BOSS';   // both lines share one size, fitted to the longer
    text(shown.slice(0, 4).join(' '), 30, 196, 38, { align: 'left', max: CARD_W - 60, fitTo: fitLine });
    text(shown.slice(4).join(' '), 30, 248, 38, { align: 'left', max: CARD_W - 60, fitTo: fitLine });
    ink([[24, 276], [CARD_W - 24, 276]], 2);
    text('IN', 175, 312, 22, { font: 'sign', max: 130 }); text('OUT', 350, 312, 22, { font: 'sign', max: 180 });
    const days = ['MON', 'TUE', 'WED', 'THU', 'FRI'], ins = ['08:59', '08:58', '09:00', '08:59'], outs = ['17:01', '17:00', '17:02', '17:00'];
    for (let i = 0; i < 5; i++) {
      const y = 330 + i * 64; s.globalAlpha = .4; ink([[24, y], [CARD_W - 24, y]], 1.2); s.globalAlpha = 1;
      text(days[i], 60, y + 44, 22, { font: 'sign', max: 66 });
      if (i < 4) { text(ins[i], 175, y + 44, 28, { alpha: .8, max: 130 }); text(outs[i], 350, y + 44, 28, { alpha: .8, max: 180 }); }
      else if (punched) text('11:47', 175, y + 44, 30, { color: '#2a2622', max: 130 });
    }
    ink([[100, 330], [100, 650]], 1.2); ink([[250, 330], [250, 650]], 1.2);
    if (late !== null) stamp(t, late, 300, 590, 'LATE', { size: 92, color: INK, rot: -.16 });
  }

  // the side-on corridor: wall of clocks and doors at z ZW, a duct along the ceiling, floor
  const ZW = 9;
  function corridor(t, camX, f, o = {}) {
    cam({ x: camX, y: 0, z: 0, f, vy: 430 });
    fill('#3d4140');
    const x0 = camX - 40, x1 = camX + 40, tl = P(x0, CE, ZW), br = P(x1, FL, ZW);
    // floor
    s.fillStyle = '#a7a48f'; s.fillRect(-10, br[1], W + 20, H - br[1] + 10);
    s.globalAlpha = .4;
    for (const z of [ZW - 1.5, ZW - 3.2, ZW - 5.2, ZW - 7.6]) { const p = P(0, FL, z); ink([[-10, p[1]], [W + 10, p[1]]], 1.3); }
    for (let x = Math.floor((camX - 30) / 1.4) * 1.4; x < camX + 30; x += 1.4) { const a = P(x, FL, ZW), b = P(x, FL, 1.2); ink([[a[0], a[1]], [b[0], b[1]]], 1.3); }
    s.globalAlpha = 1;
    // the wall, dado rail, skirting
    shape([[tl[0], tl[1]], [br[0], tl[1]], [br[0], br[1]], [tl[0], br[1]]], WALL, 2);
    const dado = P(0, .45, ZW)[1]; s.fillStyle = '#7a8274'; s.fillRect(-10, dado, W + 20, br[1] - dado); ink([[-10, dado], [W + 10, dado]], 3);
    // a crack of sky in the ceiling, if asked
    if (o.sky) o.sky();
    // doors and clocks along the wall
    for (let xi = Math.floor((camX - 14) / 3.2) * 3.2; xi < camX + 14; xi += 3.2) {
      const d0 = P(xi + 1.0, -.75, ZW), d1 = P(xi + 2.2, FL, ZW);
      shape([[d0[0], d0[1]], [d1[0], d0[1]], [d1[0], d1[1]], [d0[0], d1[1]]], '#6b6a5a', 2);
      const g0 = P(xi + 1.15, -.6, ZW), g1 = P(xi + 2.05, .2, ZW); shape([[g0[0], g0[1]], [g1[0], g0[1]], [g1[0], g1[1]], [g0[0], g1[1]]], '#c9c8b0', 1.5);
      const n = P(xi + 1.6, -.1, ZW); text(String(500 + Math.round(xi / 3.2) * 3), n[0], n[1], n[2] * .26, { max: (g1[0] - g0[0]) * .8 });
      const c = P(xi - .1, -1.0, ZW); clockFace(c[0], c[1], .45 * c[2], Math.round(xi * 10), t);
    }
    // ducts along the ceiling, with drops into the wall
    const duct2 = (y, r, z, col) => {
      const a = P(x0, y - r, z), b = P(x1, y + r, z);
      shape([[-20, a[1]], [W + 20, a[1]], [W + 20, b[1]], [-20, b[1]]], col, 2.5);
      hatch([[-20, b[1] - (b[1] - a[1]) * .35], [W + 20, b[1] - (b[1] - a[1]) * .35], [W + 20, b[1]], [-20, b[1]]], .9, 7, 1, .45);
      for (let x = Math.floor((camX - 16) / .8) * .8; x < camX + 16; x += .8) { const p = P(x, y, z); s.beginPath(); s.ellipse(p[0], p[1], r * p[2] * .25, r * p[2], 0, 0, TAU); s.lineWidth = 1.8; s.strokeStyle = INK; s.stroke(); }
    };
    for (let xi = Math.floor((camX - 14) / 9.6) * 9.6 + 4; xi < camX + 14; xi += 9.6) { const a = P(xi - .3, -2.1, ZW - .3), b = P(xi + .3, .2, ZW - .3); shape([[a[0], a[1]], [b[0], a[1]], [b[0], b[1]], [a[0], b[1]]], STEEL_D, 2); hatch([[a[0] + (b[0] - a[0]) * .6, a[1]], [b[0], a[1]], [b[0], b[1]], [a[0] + (b[0] - a[0]) * .6, b[1]]], .9, 6, 1, .4); }
    duct2(-2.05, .45, ZW - .5, STEEL);
    duct2(-1.35, .16, ZW - .2, '#9a9c8c');
  }
  // the crowd flowing left; returns figures for depth sorting
  function crowd(t, camX, speed = 1.05) {
    const out = [], lanes = [[3.5, 0, 4.6], [6.2, 1, 2.7], [7.6, 2, 2.2]];
    for (const [z, ln, gap] of lanes) {
      const shift = speed * (t - 200);
      const i0 = Math.floor((camX - 14 + shift) / gap), i1 = Math.ceil((camX + 14 + shift) / gap);
      for (let i = i0; i <= i1; i++) {
        if (hash(i * 13 + ln * 101) < .3) continue;
        const x = i * gap + (hash(i * 7 + ln) - .5) * .6 - shift;
        out.push({ z, draw: () => clerk(x, z, (t + hash(i + ln * 50)) * 1.15, -1) });
      }
    }
    return out;
  }
  const drawSorted = (figs) => figs.sort((a, b) => b.z - a.z).forEach((f) => f.draw());
  const runner = (x, z, t, face = 1, lean = .13, stride = 2.1) => ({ z, draw: () => withT(() => { const b = P(x, FL, z); s.translate(b[0], b[1]); s.rotate(lean * face); s.translate(-b[0], -b[1]); man(x, z, { walk: 1, ph: t * stride, face }); }) });

  // ---- shots ----
  // 203.57 "I don't want to leave you babe" (Bob's sheet; the vocal stem has it at 203.57-207.2): back in the
  // hall, closer than ch06. He is on his way out with his case; on "leave" he stops and turns back to her at
  // her desk; on "you" she looks up from the typewriter; on "babe" a rose ring off her collar. Then the clock
  // over the way out ticks on the "do"s, he turns away again, and the wall of clocks takes him (207.17).
  const LEAVE_T = snap(204.30, .12), YOU_T = snap(205.23, .12), BABE_T = 205.76, AWAY_T = snap(206.75, .25);
  function leaveClock(cx, cy, r, t) {
    // hands jump only on the "do"s after "babe"; brass deco face as in the clock wall
    const done = DO.filter((d) => d > 206.6 && d <= t), last = done[done.length - 1];
    const tk = last === undefined ? 0 : done.length - 1 + ease.back(clamp((t - last) / .12));
    if (!K) { dot(cx, cy, r, CREAM); s.beginPath(); s.arc(cx, cy, r, 0, TAU); s.lineWidth = 3; s.strokeStyle = INK; s.stroke(); }
    else { disc(cx, cy, r * 1.08, BRASS, 1.2); glint(cx, cy, r * 1.02, .05); disc(cx, cy, r * .9, CREAM, 1); }
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; line([[cx + Math.cos(a) * r * .72, cy + Math.sin(a) * r * .72], [cx + Math.cos(a) * r * .84, cy + Math.sin(a) * r * .84]], K ? K.LINE : INK, i % 3 ? 1.5 : 3.5); }
    const hA = (11 + 44 / 60) / 12 * TAU, mA = (44 + tk * .25) / 60 * TAU, sA = tk / 12 * TAU;   // 11:44, and late
    ink([[cx, cy], [cx + Math.sin(hA) * r * .45, cy - Math.cos(hA) * r * .45]], 9);
    ink([[cx, cy], [cx + Math.sin(mA) * r * .7, cy - Math.cos(mA) * r * .7]], 6);
    line([[cx - Math.sin(sA) * r * .14, cy + Math.cos(sA) * r * .14], [cx + Math.sin(sA) * r * .8, cy - Math.cos(sA) * r * .8]], '#8a2a1e', 2);
    if (K) K.ball(cx, cy, r * .07, BRASS, 1); else dot(cx, cy, 6, INK);
  }
  function leave(t, lt) {
    cam({ x: .1, z: lerp(2.3, 2.75, ease.sine(lt / 3.6)), y: .45, f: 900, vy: 600 });   // a slow push in on the two of them
    room(t); duct(-3.6, -2.1, .5, 0, FAR); duct(2.8, -2.25, .32, 0, FAR, STEEL_D); tube(t); board(t, '0004');
    rows(t);
    // the clock over the way out, hung from the duct on the left; it shakes a little on each tick
    const sh = tickHit(t) * (t > 206.6 ? 1 : 0), cc = P(-3.0, -1.0, 6.0), cr = .42 * cc[2];
    ink([[cc[0], cc[1] - cr * 1.08], [cc[0], P(-3.0, -2.15, 6.0)[1]]], 3);
    withT(() => { s.translate(cc[0], cc[1] - cr); s.rotate(Math.sin((t - 206.6) * 40) * .03 * sh); s.translate(-cc[0], -(cc[1] - cr)); leaveClock(cc[0], cc[1], cr, t); });
    // her, at her desk; she looks up on "you". Her hands stay still on the keys.
    desk(1.75, 5.6, -1);
    const look = smooth(inv(YOU_T - .05, YOU_T + .25, t));
    woman(2.5, 5.6, { seated: true, face: -1, rose: 1, arm: .35, look });
    // him: walking out to the left, stops and turns back on "leave", turns away again when the clock calls
    const back = t >= LEAVE_T && t < AWAY_T;
    const walk = t < LEAVE_T ? 1 - smooth(inv(LEAVE_T - .3, LEAVE_T, t)) : smooth(inv(AWAY_T, AWAY_T + .25, t));
    const x = -1.05 - 1.0 * ease.out(inv(203.4, LEAVE_T, t)) - 1.1 * Math.max(0, t - AWAY_T - .1);
    // on "babe" his near hand reaches out toward her at chest height (once, and held), then drops as he turns away
    const reach = back ? .65 * smooth(inv(BABE_T - .1, BABE_T + .3, t)) * (1 - smooth(inv(AWAY_T - .3, AWAY_T, t))) : 0;
    man(x, 5.6, { face: back ? 1 : -1, walk, ph: (t - 203.0) * 1.15, arm: reach });
    // "babe": one soft rose ring off her collar, and it reaches him
    const a = hit(t, BABE_T, 2.6);
    if (t >= BABE_T && a > .03) { const c = P(2.5, -.15, 5.6); s.globalAlpha = a * .9; s.beginPath(); s.arc(c[0], c[1], 40 + (1 - a) * 900, 0, TAU); s.lineWidth = 8 * a + 2; s.strokeStyle = ROSE; s.stroke(); s.globalAlpha = 1; }
  }
  // 207.17 "do do do": a wall of clocks, every one telling a different time, all ticking on each "do"
  function clocks(t, lt) {
    fill(WALL);
    const zoom = 1 + lt * .025 + tickHit(t) * .012;
    withT(() => {
      s.translate(W / 2, H / 2); s.scale(zoom, zoom); s.translate(-W / 2, -H / 2);
      s.globalAlpha = .35; for (let y = 0; y < H; y += 90) ink([[0, y], [W, y]], 1.2); for (let x = 0; x < W; x += 180) ink([[x, 0], [x, H]], 1.2); s.globalAlpha = 1;
      const R = rng(2061);
      const spots = [[960, 520, 250], [520, 300, 150], [1400, 300, 150], [430, 760, 170], [1490, 760, 170], [130, 520, 110], [1790, 520, 110], [740, 900, 95], [1180, 900, 95], [760, 130, 85], [1160, 130, 85], [150, 150, 80], [1770, 150, 80], [150, 920, 85], [1770, 920, 85]];
      spots.forEach(([x, y, r], i) => { const jx = (R() - .5) * 30, jy = (R() - .5) * 30; ink([[x + jx, y + jy - r * 1.08], [x + jx, y + jy - r * 1.4]], 3); clockFace(x + jx, y + jy, r, i * 17 + 3, t); });
    });
  }
  // 208.43 he runs right, late, against the crowd flowing left; clocks overhead tick on the "do"s
  function chase(t, lt) {
    const hx = 2 + (t - 208.43) * 3.0, camX = hx + .8;
    corridor(t, camX, 1000);
    drawSorted([...crowd(t, camX), runner(hx, 4.7, t)]);
  }
  // 212.77 "just to show up on time for my boss": the punch clock and his card; the line types on as sung
  function punch(t, lt) {
    fill('#59646a');
    s.globalAlpha = .3; for (let y = 0; y < H; y += 120) ink([[0, y], [W, y]], 1.3); s.globalAlpha = 1;
    const chunk = 217.17, sh = hit(t, chunk, 10) * 14 * Math.sin((t - chunk) * 70);
    withT(() => {
      s.translate(sh, 0);
      // the machine
      shape([[300, 40], [1000, 40], [1040, 1100], [260, 1100]], STEEL, 4);
      hatch([[820, 40], [1000, 40], [1040, 1100], [860, 1100]], .9, 9, 1.4, .4);
      shape([[330, 60], [970, 60], [970, 470], [330, 470]], STEEL_D, 3);
      const late = t >= chunk;
      if (K) { for (const [bx, by] of [[345, 75], [955, 75], [345, 455], [955, 455]]) K.ball(bx, by, 11, BRASS, 1); K.fan(650, 265, 205, 16, 0, TAU, [BRASS, CREAM], 1); }
      withT(() => { const r = 180, cx = 650, cy = 265; if (K) { disc(cx, cy, r + 14, BRASS); glint(cx, cy, r + 6, .05); } else dot(cx, cy, r + 14, BRASS); s.beginPath(); s.arc(cx, cy, r + 14, 0, TAU); s.lineWidth = 3; s.strokeStyle = INK; s.stroke();
        dot(cx, cy, r, CREAM);
        for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; ink([[cx + Math.cos(a) * r * .8, cy + Math.sin(a) * r * .8], [cx + Math.cos(a) * r * .92, cy + Math.sin(a) * r * .92]], i % 3 ? 2.5 : 5);
          text(String(i ? i : 12), cx + Math.sin(i / 12 * TAU) * r * .66, cy - Math.cos(i / 12 * TAU) * r * .66 + 12, 32, { font: 'sign', max: 50 }); }
        const mins = lerp(47 - 6, 47, ease.out(inv(212.8, 216, t))) + (late ? ease.back(inv(chunk, chunk + .25, t)) * 0 : 0);
        const hA = (11 + mins / 60) / 12 * TAU, mA = mins / 60 * TAU;
        ink([[cx, cy], [cx + Math.sin(hA) * r * .5, cy - Math.cos(hA) * r * .5]], 12);
        ink([[cx, cy], [cx + Math.sin(mA) * r * .76, cy - Math.cos(mA) * r * .76]], 7);
        if (K) K.ball(cx, cy, 14, BRASS, 1); else dot(cx, cy, 12, INK); });
      shape([[400, 520], [900, 520], [900, 600], [400, 600]], BRASS, 3); bold('TIME RECORDER', 650, 576, 44, { max: 460 });
      shape([[440, 690], [860, 690], [860, 716], [440, 716]], BLACK, 3);           // the slot
      // the lever on the side, slammed at the chunk
      const lev = t < chunk - .2 ? 0 : t < chunk ? ease.in(inv(chunk - .2, chunk, t)) : 1 - ease.inOut(inv(chunk + .3, chunk + .8, t));
      withT(() => { s.translate(1010, 640); s.rotate(-.9 + lev * 1.3); shape([[-14, 0], [14, 0], [10, -260], [-10, -260]], STEEL_D, 3); if (K) K.ball(0, -270, 36, BLACK, 1.2); else { dot(0, -270, 34, BLACK); s.beginPath(); s.arc(0, -270, 34, 0, TAU); s.lineWidth = 3; s.strokeStyle = INK; s.stroke(); } });
      if (K) K.ball(1010, 640, 24, BRASS, 1); else dot(1010, 640, 22, BRASS);
    });
    // the card: in his hand, into the slot, out again with LATE on it
    const tin = 216.06, tout = 217.55;
    let cx = 1220, cy = 170, sc = 1.0, clipY = null;
    if (t >= tin && t < tout) { const k = ease.inOut(inv(tin, tin + .6, t)); cx = lerp(1220, 650 - CARD_W * .82 / 2, k); cy = lerp(170, 420, k); sc = lerp(1, .82, k); clipY = k > .6 ? 690 : null; }
    if (t >= tout) { const k = ease.out(inv(tout, tout + .35, t)); cx = lerp(650 - CARD_W * .82 / 2, 1180, k); cy = lerp(420, 190, k); sc = lerp(.82, 1.02, k); }
    withT(() => {
      if (clipY !== null) { s.beginPath(); s.rect(0, 0, W, clipY); s.clip(); }
      s.translate(cx, cy); s.rotate(t >= tout ? .03 : -.04); s.scale(sc, sc);
      card(t, { late: 217.93, punched: t >= chunk });
    });
    if (clipY === null) glove(cx + CARD_W * sc + 40, cy + CARD_H * sc * .62, Math.PI + .25, .9);
    fx({ flash: hit(t, chunk, 14) * .35 });
  }
  // 218.3 "do do do": low, down the corridor. He runs away from us toward the far end, the crowd
  // comes the other way, and at the end, small, the horn on its duct.
  function hallRun(t, lt) {
    cam({ x: 0, y: .75, z: lt * .6, f: 900, vy: 470 });
    room(t);
    duct(-4.2, -2.0, .6, 0, FAR); duct(4.0, -2.15, .45, 0, FAR, STEEL_D); duct(0, -2.35, .3, 0, FAR, '#9a9c8c');
    // the horn on the far wall
    const hz = 66, hc = P(0, -1.0, hz), hk = hc[2] * 3.2;
    shape([[hc[0] - .25 * hk, P(0, CE, hz)[1]], [hc[0] + .25 * hk, P(0, CE, hz)[1]], [hc[0] + .25 * hk, hc[1]], [hc[0] - .25 * hk, hc[1]]], STEEL, 1.5);
    dot(hc[0], hc[1], 1.0 * hk, BRASS); s.beginPath(); s.arc(hc[0], hc[1], 1.0 * hk, 0, TAU); s.lineWidth = 2; s.strokeStyle = INK; s.stroke();
    dot(hc[0], hc[1], .7 * hk, BLACK);
    for (let i = -2; i <= 2; i++) line([[hc[0] - .6 * hk, hc[1] + i * .18 * hk], [hc[0] + .6 * hk, hc[1] + i * .18 * hk]], STEEL, Math.max(1, .06 * hk));
    // clocks on the left wall, ticking
    for (let z = 10; z < 50; z += 6) { const c = P(-WX + .05, -1.25, z); clockFace(c[0], c[1], .42 * c[2], z * 3, t); }
    const figs = [];
    for (let i = 0; i < 26; i++) {
      const x = [-3.5, -2.2, -1.0, 1.1, 2.3, 3.6][i % 6] + (hash(i * 3) - .5) * .5;
      const z = 60 - (((t - 200) * 1.25 + i * 2.4) % 62);
      if (z - C.z < 1.2) continue;
      figs.push({ z, draw: () => walker(x, z, (t + hash(i)) * 1.2) });
    }
    const mz = C.z + 3.2 + (t - 218.3) * 1.15;
    figs.push({ z: mz, draw: () => walker(1.1, mz, t * 2.1, { back: true, mine: true, run: 1 }) });
    drawSorted(figs);
  }
  // 224.1 "I can hear him yelling right now": the boss. A horn on a duct, a grille for a mouth; he is tiny below.
  function horn(cx, cy, R, t, open) {
    // the duct that feeds it, up and out of frame
    withT(() => { s.translate(cx, cy); s.rotate(-.5);
      shape([[-R * .35, 0], [R * .35, 0], [R * .5, -R * 3], [-R * .5, -R * 3]], STEEL, 4);
      for (let y = -R * .3; y > -R * 3; y -= R * .22) { s.beginPath(); s.ellipse(0, y, R * (.37 - y / R * .045), R * .07, 0, 0, TAU); s.lineWidth = 3; s.strokeStyle = INK; s.stroke(); }
      hatch([[R * .1, 0], [R * .35, 0], [R * .5, -R * 3], [R * .15, -R * 3]], .9, 8, 1.3, .45); });
    if (K) {
      disc(cx, cy, R, BRASS, 2); glint(cx, cy, R * .95, .035);
      for (const [f, c] of [[.86, '#8f7640'], [.74, '#6b5a34']]) { disc(cx, cy, R * f, c, 1.5); glint(cx, cy, R * f * .97, .02, Math.PI * 1.1, Math.PI * 1.35); }
      s.beginPath(); s.arc(cx, cy, R * .62, 0, TAU); s.fillStyle = rgrad(cx, cy, R * .1, R * .62, [[0, '#0e0d0b'], [1, '#2e2b26']]); s.fill();
    } else {
    dot(cx, cy, R * 1.04, INK); dot(cx, cy, R, BRASS);
    for (const [f, c] of [[.86, '#8f7640'], [.74, '#6b5a34']]) { dot(cx, cy, R * f, c); s.beginPath(); s.arc(cx, cy, R * f, 0, TAU); s.lineWidth = 3; s.strokeStyle = INK; s.stroke(); }
    dot(cx, cy, R * .62, BLACK);
    }
    // the grille: slats part like a mouth when he yells
    withT(() => { s.beginPath(); s.arc(cx, cy, R * .62, 0, TAU); s.clip();
      for (let i = -5; i <= 5; i++) { const y = cy + i * R * .11 * (1 + open * .5 * (Math.abs(i) / 5)); const gap = i === 0 ? open : 0;
        if (gap > .1) continue;
        if (K) { K.tube([cx - R * .7, y], [cx, y], [cx + R * .7, y], R * .024, R * .024, STEEL, Math.max(1, R * .004)); line([[cx - R * .7, y - R * .012], [cx + R * .7, y - R * .012]], 'rgba(255,250,235,.45)', R * .008); continue; }
        line([[cx - R * .7, y], [cx + R * .7, y]], STEEL, R * .045); line([[cx - R * .7, y + R * .02], [cx + R * .7, y + R * .02]], INK, R * .008); }
      ink([[cx, cy - R * .62], [cx, cy + R * .62]], R * .02);
    });
    s.beginPath(); s.arc(cx, cy, R * .62, 0, TAU); s.lineWidth = R * .02; s.strokeStyle = INK; s.stroke();
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + .2; if (K) K.ball(cx + Math.cos(a) * R * .93, cy + Math.sin(a) * R * .93, R * .03, BRASS, 1); else dot(cx + Math.cos(a) * R * .93, cy + Math.sin(a) * R * .93, R * .025, INK); }
  }
  function boss(t, lt) {
    fill('#3d4140');
    const v = F('voc', t, 3), open = clamp(v * 1.6);
    // floor in perspective, a vanishing point under the horn
    s.fillStyle = '#a7a48f'; s.fillRect(0, 760, W, H);
    s.globalAlpha = .4; for (let i = -12; i <= 12; i++) ink([[W / 2 + i * 40, 760], [W / 2 + i * 260, H]], 1.3);
    for (const y of [790, 840, 920, 1040]) ink([[0, y], [W, y]], 1.3); s.globalAlpha = 1;
    // side walls
    poly([[0, 0], [380, 180], [380, 760], [0, H]], GREEN); poly([[W, 0], [W - 380, 180], [W - 380, 760], [W, H]], GREEN_D);
    ink([[380, 180], [380, 760]], 2); ink([[W - 380, 180], [W - 380, 760]], 2);
    // sound rings
    const cx = W / 2, cy = 370, R = 380 * (1 + v * .05);
    for (let i = 0; i < 5; i++) { const ph = (t * 1.3 + i / 5) % 1; s.globalAlpha = clamp(v * 1.6) * (1 - ph) * .8; s.beginPath(); s.arc(cx, cy, R * (1.1 + ph * 2.2), 0, TAU); s.lineWidth = 6 * (1 - ph) + 2; s.strokeStyle = INK; s.stroke(); }
    s.globalAlpha = 1;
    horn(cx, cy, R, t, open);
    // the clerks pressed to the walls, and him, small, in the middle, hat held on
    for (let i = 0; i < 4; i++) { tinyClerk(470 + i * 70, 820 - i * 6, 150 - i * 12, 1); tinyClerk(W - 470 - i * 70, 820 - i * 6, 150 - i * 12, -1); }
    withT(() => { const sway = Math.sin(t * 9) * v * 4; s.translate(sway, 0); walkerFlat(W / 2, 1010, 300); });
  }
  function tinyClerk(x, y, h, face) {
    if (K) return K.fig([x, y], h / 1.8, 1, (u) => frontFig(1.3 * u, {}));
    const k = h / 1.8; poly([[x - .22 * k, y - 1.45 * k], [x + .22 * k, y - 1.45 * k], [x + .3 * k, y - .42 * k], [x - .3 * k, y - .42 * k]], CLERK);
    s.lineWidth = 2; s.strokeStyle = INK; s.stroke();
    line([[x - .08 * k, y - .45 * k], [x - .08 * k, y]], INK, .12 * k, 'butt'); line([[x + .08 * k, y - .45 * k], [x + .08 * k, y]], INK, .12 * k, 'butt');
    dot(x + .03 * k * face, y - 1.6 * k, .12 * k, SKIN); s.beginPath(); s.arc(x + .03 * k * face, y - 1.6 * k, .12 * k, 0, TAU); s.stroke();
    s.beginPath(); s.ellipse(x + .03 * k * face, y - 1.69 * k, .24 * k, .045 * k, 0, 0, TAU); s.fillStyle = HAT; s.fill(); s.stroke();
    poly([[x - .1 * k + .03 * k * face, y - 1.69 * k], [x + .16 * k + .03 * k * face, y - 1.69 * k], [x + .14 * k + .03 * k * face, y - 1.88 * k], [x - .08 * k + .03 * k * face, y - 1.88 * k]], HAT);
  }
  // him from behind, flat (feet at x, y), one hand up holding his hat on
  function walkerFlat(x, y, h) {
    const k = h / 1.8;
    if (K) { guitarCase(x + .36 * k, y - .45 * k, k, { fore: .4 }); return K.fig([x, y], k, 1, (u) => frontFig(1.3 * u, { back: true, mine: true, hold: true, coat: COAT })); }
    guitarCase(x + .36 * k, y - .45 * k, k, { fore: .4 });
    line([[x - .1 * k, y - .5 * k], [x - .1 * k, y]], INK, .13 * k, 'butt'); line([[x + .1 * k, y - .5 * k], [x + .1 * k, y]], INK, .13 * k, 'butt');
    shape([[x - .24 * k, y - 1.45 * k], [x + .24 * k, y - 1.45 * k], [x + .33 * k, y - .45 * k], [x - .33 * k, y - .45 * k]], COAT, 2.5);
    hatch([[x - .24 * k, y - 1.45 * k], [x + .24 * k, y - 1.45 * k], [x + .33 * k, y - .45 * k], [x - .33 * k, y - .45 * k]], .9, 7, 1, .3);
    ink([[x - .24 * k, y - 1.38 * k], [x - .4 * k, y - 1.72 * k], [x - .16 * k, y - 1.82 * k]], .09 * k);
    dot(x, y - 1.62 * k, .12 * k, '#b39575'); s.lineWidth = 2; s.strokeStyle = INK; s.beginPath(); s.arc(x, y - 1.62 * k, .12 * k, 0, TAU); s.stroke();
    s.beginPath(); s.ellipse(x, y - 1.71 * k, .25 * k, .05 * k, 0, 0, TAU); s.fillStyle = HAT; s.fill(); s.stroke();
    shape([[x - .13 * k, y - 1.71 * k], [x + .13 * k, y - 1.71 * k], [x + .11 * k, y - 1.9 * k], [x - .11 * k, y - 1.9 * k]], HAT, 2);
  }
  // 227.97 "why you so late?" (Bob's sheet: no "are"): into the grille; the words blast out as huge type.
  // Two rows, WHY YOU / SO LATE?, one size for all four words, fitted so every word (outline included) stays
  // inside the frame with a margin at every frame of its blast, overshoot included: each word scales about
  // its own centre and its scale is capped to the room it has.
  const YELL = [['WHY', snap(228.18)], ['YOU', snap(228.64, .06)], ['SO', 228.92], ['LATE?', 229.34]];
  const YELL_ROWS = [[0, 1], [2, 3]], YELL_GAP = .28, YELL_OUT = 26, YELL_M = 70;   // gap in ems; frame margin px
  let yellLay = null;
  function yellLayout() {
    if (yellLay) return yellLay;
    s.save(); s.font = `bold 100px ${FUT}`; const m100 = YELL.map(([w]) => s.measureText(w)); s.restore();
    const w100 = m100.map((m) => m.width), asc = Math.max(...m100.map((m) => m.actualBoundingBoxAscent)) / 100, desc = Math.max(0, ...m100.map((m) => m.actualBoundingBoxDescent)) / 100;
    // the size at which the wider row fills the frame less the margins, capped so two rows fit the height
    const rowW = YELL_ROWS.map((r) => r.reduce((a, i) => a + w100[i], 0) + 100 * YELL_GAP);
    const size = Math.min(330, 100 * (W - 2 * YELL_M - 2 * YELL_OUT) / Math.max(...rowW) * .9);
    const capH = size * (asc + desc), rowY = [H / 2 - 1.15 * capH + asc * size, H / 2 + .15 * capH + asc * size];   // baselines: two rows a .3 cap gap apart, centred
    const words = [];
    YELL_ROWS.forEach((r, ri) => {
      const tw = r.reduce((a, i) => a + w100[i] * size / 100, 0) + size * YELL_GAP; let x = W / 2 - tw / 2;
      r.forEach((i) => { const w = w100[i] * size / 100; words[i] = { x0: x, cx: x + w / 2, w, base: rowY[ri], cy: rowY[ri] + (desc - asc) * size / 2 }; x += w + size * YELL_GAP; });
    });
    words.forEach((d) => {   // the largest scale at which this word's box (with outline) stays inside the margins
      const hw = d.w / 2 + YELL_OUT / 2, hh = capH / 2 + YELL_OUT / 2;
      d.scMax = Math.min((d.cx - YELL_M) / hw, (W - YELL_M - d.cx) / hw, (d.cy - YELL_M) / hh, (H - YELL_M - d.cy) / hh);
    });
    return (yellLay = { size, capH, asc, desc, words });
  }
  function yell(t, lt) {
    fill(BLACK);
    const v = F('voc', t, 2), last = YELL.filter(([, tw]) => t >= tw).pop(), kick = last ? hit(t, last[1], 8) : 0;
    const shx = (hash(Math.floor(t * 24)) - .5) * 18 * kick, shy = (hash(Math.floor(t * 24) + 5) - .5) * 18 * kick;
    withT(() => { s.translate(shx, shy);
      const z = 1 + lt * .06; s.translate(W / 2, H / 2); s.scale(z, z); s.translate(-W / 2, -H / 2);
      horn(W / 2, H / 2, 1250, t, clamp(v * 1.4)); });
    const L = yellLayout();
    YELL.forEach(([w, tw], i) => {
      if (t < tw) return;
      const k = ease.back(inv(tw, tw + .16, t)), d = L.words[i], rot = (hash(i + 3) - .5) * .06;
      // the shake (<= 9 px) and the small tilt are inside the margin
      const sc = Math.min(lerp(1.5, 1, k), d.scMax - .03);
      withT(() => { s.translate(d.cx + shx * .5, d.cy + shy * .5); s.rotate(rot); s.scale(sc, sc);
        bold(w, 0, d.base - d.cy, L.size, { color: CREAM, outline: YELL_OUT, alpha: clamp(k * 3), align: 'center' }); });
    });
  }
  // 229.9 "do do do": back in the corridor. He has stopped; the crowd parts round him; the letters of the
  // yell lie on the floor. The clocks tick on the "do"s and then, all at once, stop.
  function stand(t, lt) {
    const hx = 15.4, f = lerp(1000, 1250, ease.inOut(inv(229.9, 235.4, t)));
    corridor(t, hx + .3, f);
    // letters raining down and lying on the floor
    const L = 'WHYYOUSOLATE?';
    for (let i = 0; i < L.length; i++) {
      const z = 3.4 + hash(i * 3) * 4.5, x = hx - 6 + hash(i * 5) * 12, t0 = 229.9 + hash(i * 7) * .6;
      const fall = Math.min(1, ((t - t0) * 2.4) ** 2), y = lerp(-3.5, FL, fall), p = P(x, y, z), rot = fall < 1 ? (t - t0) * 6 : (hash(i * 11) - .5) * 1.4;
      withT(() => { s.translate(p[0], p[1]); s.rotate(rot); if (fall >= 1) s.scale(1, .5); bold(L[i], 0, 0, .7 * p[2], { color: CREAM, outline: 6 }); });
    }
    const figs = crowd(t, hx);
    figs.push({ z: 4.7, draw: () => man(hx, 4.7, { face: 1, arm: smooth(inv(231.0, 232.0, t)) * .55, ticket: true }) });
    drawSorted(figs);
  }
  // 235.4 "but I don't care": the card, close. A rose stamp, I DON'T CARE, then he tears it in half.
  function cardAt(t, w0) {
    withT(() => { s.translate(-CARD_W / 2, -CARD_H / 2); card(t, { late: 217.93, punched: true });
      if (w0) stamp(t, 236.8, CARD_W / 2, 420, "I DON'T CARE", { size: 54, color: ROSE, rot: -.2 }); });
  }
  const TEAR = [[0, -340], [30, -250], [-20, -170], [25, -80], [-30, 0], [20, 90], [-15, 170], [30, 260], [0, 345]];
  function tearHalf(side, fn) {
    withT(() => { s.beginPath(); const xe = side < 0 ? -600 : 600; s.moveTo(xe, -400); TEAR.forEach(([x, y]) => s.lineTo(x, y)); s.lineTo(xe, 400); s.closePath(); s.clip(); fn(); });
  }
  function bg(t) {
    fill('#4d5250');
    s.globalAlpha = .3; for (let y = 40; y < H; y += 120) ink([[0, y], [W, y]], 1.4); for (let x = 0; x < W; x += 240) ink([[x, 0], [x, H]], 1.4); s.globalAlpha = 1;
  }
  function tear(t, lt) {
    bg(t);
    const tt = snap(238.12, .25), p = ease.out(inv(tt, tt + .35, t)), cx = W / 2, cy = 545, sc = 1.12;
    if (p <= 0) {
      withT(() => { s.translate(cx, cy); s.scale(sc, sc); s.rotate(-.03); cardAt(t, true); });
      glove(cx - CARD_W * sc / 2 + 10, cy + 300, .2, .85); glove(cx + CARD_W * sc / 2 - 10, cy + 310, Math.PI - .2, .85);
      return;
    }
    for (const side of [-1, 1]) withT(() => {
      s.translate(cx + side * p * 190, cy + p * 30); s.rotate(side * p * .22 - .03); s.scale(sc, sc);
      tearHalf(side, () => cardAt(t, true));
      withT(() => { s.beginPath(); TEAR.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y)); s.lineWidth = 3; s.strokeStyle = INK; s.stroke(); });
    });
    glove(cx - CARD_W * sc / 2 + 10 - p * 190, cy + 300 + p * 40, .2 - p * .2, .85); glove(cx + CARD_W * sc / 2 - 10 + p * 190, cy + 310 + p * 40, Math.PI - .2 + p * .2, .85);
  }
  // 239.94 the third "I don't care": torn again, the pieces burst into confetti, and the confetti flies off as birds
  function bird(x, y, sz, ph, a = 1) {
    const fl = Math.sin(ph * TAU) * .8;
    withT(() => { s.translate(x, y); s.globalAlpha *= a;
      shape([[-sz, -sz * fl], [-sz * .25, -sz * .1], [0, sz * .18], [sz * .25, -sz * .1], [sz, -sz * fl], [sz * .2, sz * .25], [-sz * .2, sz * .25]], CREAM, Math.max(1.5, sz * .07));
      ink([[0, sz * .18], [0, sz * .4]], Math.max(1, sz * .05)); });
  }
  // "what it costs" (Bob's sheet; sung 240.07 "what it", 240.42 "costs", held to ~245): his pay docket for being
  // late pops up out of the torn card, and WHAT IT / COSTS are stamped on it in rose, one stamp per sung beat.
  const DOCK_W = 680, DOCK_H = 486, WHAT_T = snap(240.07, .1), COSTS_T = 240.42;
  // the largest stamp size <= size0 whose rotated imprint box fits maxW x maxH
  function stampFit(word, size0, maxW, maxH, rot) {
    const c = Math.abs(Math.cos(rot)), sn = Math.abs(Math.sin(rot));
    const ext = (sz) => { const bw = textWidth(word, sz, 'stamp') + sz * .6 + sz * .08, bh = sz * 1.25 + sz * .08; return [bw * c + bh * sn, bw * sn + bh * c]; };
    const [ew, eh] = ext(size0); return size0 * Math.min(1, maxW / ew, maxH / eh);
  }
  function docket(t) {
    shape([[0, 0], [DOCK_W, 0], [DOCK_W, DOCK_H], [0, DOCK_H]], CREAM, 3);
    bold('PAY DOCKET', 30, 60, 40, { align: 'left', max: 330 });
    text('MINISTRY OF WAITING', DOCK_W - 26, 56, 14, { font: 'sign', align: 'right', max: 220 });
    text('No. 7 436 912', 30, 108, 30, { align: 'left', max: DOCK_W - 60 });
    ink([[24, 126], [DOCK_W - 24, 126]], 2);
    text('FRI  IN 11:47  LATE  DOCKED 1 HR', 30, 160, 24, { align: 'left', max: DOCK_W - 60 });
    s.globalAlpha = .4; ink([[24, 176], [DOCK_W - 24, 176]], 1.2); s.globalAlpha = 1;
    // two stamp rows in the lower part, each fitted inside its own band with a 30 px margin
    const BAND = 138, rows = [['WHAT IT', WHAT_T, 180, -.07], ['COSTS', COSTS_T, 180 + BAND, .05]];
    for (const [w, t0, y0, rot] of rows) {
      const sz = stampFit(w, 120, DOCK_W - 80, BAND - 18, rot), by = y0 + BAND / 2 + sz * (.95 - .3) / 2;   // imprint box centred in its band
      stamp(t, t0, DOCK_W / 2, by, w, { size: sz, color: ROSE, rot });
    }
  }
  function burst(t, lt) {
    bg(t);
    const t0 = 239.94, m = smooth(inv(240.7, 241.5, t));
    // the four quarters fly apart first
    const q = ease.out(inv(t0, t0 + .3, t));
    if (q < 1) for (let i = 0; i < 4; i++) withT(() => {
      const sx = i % 2 ? 1 : -1, sy = i < 2 ? -1 : 1;
      s.translate(W / 2 + sx * (190 + q * 300), 545 + sy * q * 220); s.rotate(sx * .25 * (1 + q)); s.scale(1.12, 1.12); s.globalAlpha = 1 - q;
      withT(() => { s.beginPath(); s.rect(sx < 0 ? -300 : 0, sy < 0 ? -400 : 0, 300, 400); s.clip(); cardAt(t, true); });
    });
    for (let i = 0; i < 90; i++) {
      const d = hash(i * 3) * .15, l = t - t0 - d; if (l < 0) continue;
      const a = hash(i * 5) * TAU, sp = 500 + hash(i * 7) * 900, drag = (1 - Math.exp(-l * 2.2)) / 2.2;
      let x = W / 2 + Math.cos(a) * sp * drag, y = 545 + Math.sin(a) * sp * drag * .8 + l * l * 30 * (1 - m);
      y -= m * (l - .8) * (160 + hash(i * 11) * 200); x += m * Math.sin(l * 2 + i) * 40;
      const sz = 16 + hash(i * 13) * 22;
      if (m < 1) withT(() => { s.translate(x, y); s.rotate(l * (4 + hash(i) * 6)); s.scale(1, .3 + .7 * Math.abs(Math.sin(l * 7 + i))); s.globalAlpha = 1 - m;
        shape([[-sz * .6, -sz * .4], [sz * .6, -sz * .4], [sz * .6, sz * .4], [-sz * .6, sz * .4]], i % 9 === 0 ? ROSE_L : CREAM, 1.5); });
      if (m > 0) bird(x, y, sz * 1.3, t * 2.4 + hash(i * 17), m);
    }
    // the docket: up out of the torn card, stamped on the sung words, then it drifts up with the birds
    const dp = ease.back(inv(239.94, 240.2, t)), drift = Math.max(0, t - 240.9) * 34;
    if (dp > 0) withT(() => { s.translate(W / 2, 560 - drift); s.rotate(.025); s.scale(.8 + .35 * dp, .8 + .35 * dp); s.globalAlpha = clamp(dp * 4);
      s.translate(-DOCK_W / 2, -DOCK_H / 2); docket(t); });
    glove(W / 2 - 520 - q * 80, 600 + q * 80, .1 - q * .3, .9); glove(W / 2 + 520 + q * 80, 620 + q * 80, Math.PI - .1 + q * .3, .9);
  }
  // 241.9 wide: he turns and strolls off the way he came, no hurry; the birds go up through a crack of sky,
  // carrying a ticker tape with the whole line (BUT I DON'T CARE WHAT IT COSTS); on the last "I don't care" he lets his ticket go too.
  function away(t, lt) {
    const hx = 15.4 - (t - 241.9) * .55, camX = hx - .4;
    const skyHole = () => {
      const c = P(camX + 1.2, CE, ZW), R = 420 + (t - 241.9) * 30, pts = [];
      for (let i = 0; i < 26; i++) { const a = Math.PI + i / 25 * Math.PI, j = .8 + hash(i * 7 + 2) * .4; pts.push([c[0] + Math.cos(a) * R * 1.6 * j, c[1] + 10 + Math.sin(a) * R * .55 * j]); }
      withT(() => { s.beginPath(); pts.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y)); s.closePath(); s.fillStyle = vgrad(0, c[1], [[0, SKY_T], [1, SKY_B]]); s.fill();
        s.save(); s.clip(); cloud(c[0] - 260 + (t - 241.9) * 25, c[1] - 120, 60, 31); cloud(c[0] + 340 + (t - 241.9) * 25, c[1] - 220, 48, 32); s.restore();
        s.lineWidth = 4; s.strokeStyle = INK; s.stroke(); });
    };
    corridor(t, camX, 1000, { sky: skyHole });
    const figs = crowd(t, camX, 1.05);
    figs.push({ z: 4.7, draw: () => withT(() => { const b = P(hx, FL, 4.7); s.translate(b[0], 0); s.scale(-1, 1); s.translate(-b[0], 0);   // mirrored, so he faces left
      man(hx, 4.7, { walk: 1, ph: t * .9, face: 1, arm: .35 * (1 - smooth(inv(243.68, 244.0, t))), ticket: t < 243.68 }); }) });
    drawSorted(figs);
    // the flock going up
    const c = P(camX + 1.2, CE, ZW);
    for (let i = 0; i < 46; i++) {
      const l = t - 240.6 + hash(i * 3) * 1.4, x0 = W / 2 + (hash(i * 5) - .5) * 1700;
      const x = lerp(x0, c[0] + (hash(i * 9) - .5) * 700, smooth(l / 4)), y = 900 - l * (150 + hash(i * 7) * 120);
      if (y < -60) continue; bird(x, y, 22 + hash(i * 13) * 16, t * 2.2 + hash(i), 1);
    }
    // the tape, carried up between two birds
    const ty = lerp(430, 175, ease.inOut(inv(241.9, 245.2, t))), tx = W / 2 - 80, sway = Math.sin(t * 1.7) * .05;
    const TAPE = "BUT I DON'T CARE WHAT IT COSTS", hw = Math.min(700, textWidth(TAPE, 52, 'type') / 2 + 40);   // the tape is sized to its words
    withT(() => { s.translate(tx, ty); s.rotate(-.06 + sway);
      shape([[-hw, -38], [hw, -38], [hw, 38], [-hw, 38]], CREAM, 3);
      text(TAPE, 0, 19, 52, { font: 'type', max: 2 * hw - 60 });
      for (const ex of [-hw, hw]) { ink([[ex, -38], [ex * 1.04, -110]], 2); bird(ex * 1.04, -130, 38, t * 2.6 + (ex > 0 ? .4 : 0), 1); } });
    // his ticket, let go on the last line, flutters up and becomes a bird
    if (t >= 243.68) {
      const l = t - 243.68, b = P(hx - .3, .25, 4.7), m = smooth(inv(.25, .7, l));
      const x = b[0] - l * 40 + Math.sin(l * 5) * 30, y = b[1] - l * 160;
      if (m < 1) withT(() => { s.translate(x, y); s.rotate(Math.sin(l * 6) * .8); s.globalAlpha = 1 - m; shape([[-16, -10], [16, -10], [16, 10], [-16, 10]], CREAM, 1.5); });
      if (m > 0) bird(x, y, 26, t * 2.6, m);
    }
  }

  chapter('boss', 203.57, 245.0, [
    [203.57, leave], [207.17, clocks], [208.43, chase], [212.77, punch], [218.3, hallRun], [224.1, boss], [227.97, yell],
    [229.9, stand], [235.4, tear], [239.94, burst], [241.9, away],
  ]);
})();
