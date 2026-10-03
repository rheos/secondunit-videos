// 206.0 - 245.0  late for the boss. The "do do do"s are clock ticks and footsteps: a wall of clocks, a run
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
  function bold(str, x, y, size, { color = INK, align = 'center', rot = 0, alpha = 1, outline = 0 } = {}) {
    withT(() => { s.translate(x, y); s.rotate(rot); s.globalAlpha *= alpha; s.textAlign = align; s.textBaseline = 'alphabetic';
      s.font = `bold ${Math.round(size)}px ${FUT}`;
      if (outline) { s.lineJoin = 'round'; s.lineWidth = outline; s.strokeStyle = INK; s.strokeText(str, 0, 0); }
      s.fillStyle = color; s.fillText(str, 0, 0); });
  }

  // ---- props ----
  // a wall clock: every one shows a different time; all the second hands jump on each "do"
  function clockFace(cx, cy, r, seed, t) {
    dot(cx, cy, r * 1.08, INK); dot(cx, cy, r, CREAM);
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; ink([[cx + Math.cos(a) * r * .78, cy + Math.sin(a) * r * .78], [cx + Math.cos(a) * r * .9, cy + Math.sin(a) * r * .9]], Math.max(1.2, r * (i % 3 ? .03 : .06))); }
    const tk = ticks(t), h = hash(seed * 7 + 1) * TAU, m = hash(seed * 7 + 2) * TAU + tk * TAU / 240, sc = hash(seed * 7 + 3) * TAU + tk * TAU / 12;
    ink([[cx, cy], [cx + Math.sin(h) * r * .48, cy - Math.cos(h) * r * .48]], Math.max(2, r * .09));
    ink([[cx, cy], [cx + Math.sin(m) * r * .72, cy - Math.cos(m) * r * .72]], Math.max(1.5, r * .055));
    line([[cx - Math.sin(sc) * r * .15, cy + Math.cos(sc) * r * .15], [cx + Math.sin(sc) * r * .84, cy - Math.cos(sc) * r * .84]], '#3a2f2a', Math.max(1, r * .025));
    dot(cx, cy, Math.max(2, r * .06), INK);
  }
  // a clerk, side on, walking (face -1 = to the left), briefcase in the near hand
  function clerk(x, z, ph, face = -1) {
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
    const l1 = Math.max(0, st) * (.1 + run * .12) * k, l2 = Math.max(0, -st) * (.1 + run * .12) * k;
    line([[b[0] - .1 * k, b[1] - .95 * k - bob], [b[0] - .1 * k, b[1] - l1]], INK, .13 * k, 'butt');
    line([[b[0] + .1 * k, b[1] - .95 * k - bob], [b[0] + .1 * k, b[1] - l2]], INK, .13 * k, 'butt');
    const sh = b[1] - 1.45 * k - bob, c = mine ? COAT : CLERK;
    if (mine && back) shape([[b[0] + .2 * k, sh + .25 * k], [b[0] + .42 * k, sh + .2 * k], [b[0] + .48 * k, b[1] - .3 * k - bob], [b[0] + .26 * k, b[1] - .28 * k - bob]], '#2b2924', Math.max(1, k * .014));
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
  function glove(x, y, a, sc = 1) {
    withT(() => { s.translate(x, y); s.rotate(a); s.scale(sc, sc);
      shape([[-520, -95], [-120, -80], [-90, 95], [-520, 120]], COAT, 3); hatch([[-520, 20], [-110, 20], [-90, 95], [-520, 120]], .9, 9, 1.4, .45);
      s.beginPath(); s.ellipse(-40, 0, 115, 92, 0, 0, TAU); s.fillStyle = '#3a382f'; s.fill(); s.lineWidth = 3; s.strokeStyle = INK; s.stroke();
      s.beginPath(); s.ellipse(50, -40, 68, 30, -.3, 0, TAU); s.fillStyle = '#3a382f'; s.fill(); s.stroke();
      ink([[-60, -30], [20, -20]], 2); ink([[-70, 20], [10, 30]], 2); });
  }
  // his time card, (0,0) top-left, 480 x 680 before sc. words: the line typed so far.
  const CARD_W = 480, CARD_H = 680;
  const LYR = [['JUST', 212.8], ['TO', 213.16], ['SHOW', 213.6], ['UP', 214.08], ['ON', 214.46], ['TIME', 214.88], ['FOR', 216.06], ['MY', 216.76], ['BOSS', 217.2]];
  function card(t, { late = null, punched = false } = {}) {
    shape([[0, 0], [CARD_W, 0], [CARD_W, CARD_H], [0, CARD_H]], CREAM, 3);
    bold('TIME CARD', 30, 62, 40, { align: 'left' });
    text('MINISTRY OF WAITING', CARD_W - 26, 58, 14, { font: 'sign', align: 'right' });
    text('No. 7 436 912', 30, 118, 34, { align: 'left' });
    ink([[24, 140], [CARD_W - 24, 140]], 2);
    const shown = LYR.filter(([, tw]) => t >= tw).map(([w]) => w);
    text(shown.slice(0, 4).join(' '), 30, 196, 38, { align: 'left' });
    text(shown.slice(4).join(' '), 30, 248, 38, { align: 'left' });
    ink([[24, 276], [CARD_W - 24, 276]], 2);
    text('IN', 150, 312, 22, { font: 'sign' }); text('OUT', 350, 312, 22, { font: 'sign' });
    const days = ['MON', 'TUE', 'WED', 'THU', 'FRI'], ins = ['08:59', '08:58', '09:00', '08:59'], outs = ['17:01', '17:00', '17:02', '17:00'];
    for (let i = 0; i < 5; i++) {
      const y = 330 + i * 64; s.globalAlpha = .4; ink([[24, y], [CARD_W - 24, y]], 1.2); s.globalAlpha = 1;
      text(days[i], 60, y + 44, 22, { font: 'sign' });
      if (i < 4) { text(ins[i], 150, y + 44, 28, { alpha: .8 }); text(outs[i], 350, y + 44, 28, { alpha: .8 }); }
      else if (punched) text('11:47', 150, y + 44, 30, { color: '#2a2622' });
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
      const n = P(xi + 1.6, -.1, ZW); text(String(500 + Math.round(xi / 3.2) * 3), n[0], n[1], n[2] * .26);
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
  // 206.0 "do do do": a wall of clocks, every one telling a different time, all ticking on each "do"
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
      withT(() => { const r = 180, cx = 650, cy = 265; dot(cx, cy, r + 14, BRASS); s.beginPath(); s.arc(cx, cy, r + 14, 0, TAU); s.lineWidth = 3; s.strokeStyle = INK; s.stroke();
        dot(cx, cy, r, CREAM);
        for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; ink([[cx + Math.cos(a) * r * .8, cy + Math.sin(a) * r * .8], [cx + Math.cos(a) * r * .92, cy + Math.sin(a) * r * .92]], i % 3 ? 2.5 : 5);
          text(String(i ? i : 12), cx + Math.sin(i / 12 * TAU) * r * .66, cy - Math.cos(i / 12 * TAU) * r * .66 + 12, 32, { font: 'sign' }); }
        const mins = lerp(47 - 6, 47, ease.out(inv(212.8, 216, t))) + (late ? ease.back(inv(chunk, chunk + .25, t)) * 0 : 0);
        const hA = (11 + mins / 60) / 12 * TAU, mA = mins / 60 * TAU;
        ink([[cx, cy], [cx + Math.sin(hA) * r * .5, cy - Math.cos(hA) * r * .5]], 12);
        ink([[cx, cy], [cx + Math.sin(mA) * r * .76, cy - Math.cos(mA) * r * .76]], 7);
        dot(cx, cy, 12, INK); });
      shape([[400, 520], [900, 520], [900, 600], [400, 600]], BRASS, 3); bold('TIME RECORDER', 650, 576, 44);
      shape([[440, 690], [860, 690], [860, 716], [440, 716]], BLACK, 3);           // the slot
      // the lever on the side, slammed at the chunk
      const lev = t < chunk - .2 ? 0 : t < chunk ? ease.in(inv(chunk - .2, chunk, t)) : 1 - ease.inOut(inv(chunk + .3, chunk + .8, t));
      withT(() => { s.translate(1010, 640); s.rotate(-.9 + lev * 1.3); shape([[-14, 0], [14, 0], [10, -260], [-10, -260]], STEEL_D, 3); dot(0, -270, 34, BLACK); s.beginPath(); s.arc(0, -270, 34, 0, TAU); s.lineWidth = 3; s.strokeStyle = INK; s.stroke(); });
      dot(1010, 640, 22, BRASS);
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
    dot(cx, cy, R * 1.04, INK); dot(cx, cy, R, BRASS);
    for (const [f, c] of [[.86, '#8f7640'], [.74, '#6b5a34']]) { dot(cx, cy, R * f, c); s.beginPath(); s.arc(cx, cy, R * f, 0, TAU); s.lineWidth = 3; s.strokeStyle = INK; s.stroke(); }
    dot(cx, cy, R * .62, BLACK);
    // the grille: slats part like a mouth when he yells
    withT(() => { s.beginPath(); s.arc(cx, cy, R * .62, 0, TAU); s.clip();
      for (let i = -5; i <= 5; i++) { const y = cy + i * R * .11 * (1 + open * .5 * (Math.abs(i) / 5)); const gap = i === 0 ? open : 0;
        if (gap > .1) continue; line([[cx - R * .7, y], [cx + R * .7, y]], STEEL, R * .045); line([[cx - R * .7, y + R * .02], [cx + R * .7, y + R * .02]], INK, R * .008); }
      ink([[cx, cy - R * .62], [cx, cy + R * .62]], R * .02);
    });
    s.beginPath(); s.arc(cx, cy, R * .62, 0, TAU); s.lineWidth = R * .02; s.strokeStyle = INK; s.stroke();
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + .2; dot(cx + Math.cos(a) * R * .93, cy + Math.sin(a) * R * .93, R * .025, INK); }
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
    shape([[x + .2 * k, y - 1.2 * k], [x + .44 * k, y - 1.25 * k], [x + .5 * k, y - .3 * k], [x + .26 * k, y - .28 * k]], '#2b2924', 2);
    line([[x - .1 * k, y - .5 * k], [x - .1 * k, y]], INK, .13 * k, 'butt'); line([[x + .1 * k, y - .5 * k], [x + .1 * k, y]], INK, .13 * k, 'butt');
    shape([[x - .24 * k, y - 1.45 * k], [x + .24 * k, y - 1.45 * k], [x + .33 * k, y - .45 * k], [x - .33 * k, y - .45 * k]], COAT, 2.5);
    hatch([[x - .24 * k, y - 1.45 * k], [x + .24 * k, y - 1.45 * k], [x + .33 * k, y - .45 * k], [x - .33 * k, y - .45 * k]], .9, 7, 1, .3);
    ink([[x - .24 * k, y - 1.38 * k], [x - .4 * k, y - 1.72 * k], [x - .16 * k, y - 1.82 * k]], .09 * k);
    dot(x, y - 1.62 * k, .12 * k, '#b39575'); s.lineWidth = 2; s.strokeStyle = INK; s.beginPath(); s.arc(x, y - 1.62 * k, .12 * k, 0, TAU); s.stroke();
    s.beginPath(); s.ellipse(x, y - 1.71 * k, .25 * k, .05 * k, 0, 0, TAU); s.fillStyle = HAT; s.fill(); s.stroke();
    shape([[x - .13 * k, y - 1.71 * k], [x + .13 * k, y - 1.71 * k], [x + .11 * k, y - 1.9 * k], [x - .11 * k, y - 1.9 * k]], HAT, 2);
  }
  // 227.97 "why are you so late?": into the grille; the words blast out as huge type
  const YELL = [['WHY', snap(228.18)], ['ARE', 228.5], ['YOU', snap(228.64, .06)], ['SO', 228.92], ['LATE?', 229.34]];
  function yell(t, lt) {
    fill(BLACK);
    const v = F('voc', t, 2), last = YELL.filter(([, tw]) => t >= tw).pop(), kick = last ? hit(t, last[1], 8) : 0;
    withT(() => { s.translate((hash(Math.floor(t * 24)) - .5) * 18 * kick, (hash(Math.floor(t * 24) + 5) - .5) * 18 * kick);
      const z = 1 + lt * .06; s.translate(W / 2, H / 2); s.scale(z, z); s.translate(-W / 2, -H / 2);
      horn(W / 2, H / 2, 1250, t, clamp(v * 1.4)); });
    const lay = [[0, 925, 330, 290, 'right'], [0, 995, 330, 290, 'left'], [1, 925, 650, 290, 'right'], [1, 995, 650, 290, 'left'], [2, 960, 1010, 380, 'center']];
    YELL.forEach(([w, tw], i) => {
      if (t < tw) return;
      const k = ease.back(inv(tw, tw + .16, t)), [, x, y, size, al] = lay[i], sc = lerp(1.5, 1, k);
      withT(() => { s.translate(x, y - size * .35); s.scale(sc, sc); s.rotate((hash(i + 3) - .5) * .08);
        bold(w, 0, size * .35, size, { color: CREAM, outline: 26, alpha: clamp(k * 3), align: al }); });
    });
  }
  // 229.9 "do do do": back in the corridor. He has stopped; the crowd parts round him; the letters of the
  // yell lie on the floor. The clocks tick on the "do"s and then, all at once, stop.
  function stand(t, lt) {
    const hx = 15.4, f = lerp(1000, 1250, ease.inOut(inv(229.9, 235.4, t)));
    corridor(t, hx + .3, f);
    // letters raining down and lying on the floor
    const L = 'WHYAREYOUSOLATE?';
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
    glove(W / 2 - 520 - q * 80, 600 + q * 80, .1 - q * .3, .9); glove(W / 2 + 520 + q * 80, 620 + q * 80, Math.PI - .1 + q * .3, .9);
  }
  // 241.9 wide: he turns and strolls off the way he came, no hurry; the birds go up through a crack of sky,
  // carrying a ticker tape with the last line; on the last "I don't care" he lets his ticket go too.
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
    withT(() => { s.translate(tx, ty); s.rotate(-.06 + sway);
      shape([[-430, -38], [430, -38], [430, 38], [-430, 38]], CREAM, 3);
      text("BUT I DON'T CARE", 0, 20, 54, { font: 'type' });
      for (const ex of [-430, 430]) { ink([[ex, -38], [ex * 1.04, -110]], 2); bird(ex * 1.04, -130, 38, t * 2.6 + (ex > 0 ? .4 : 0), 1); } });
    // his ticket, let go on the last line, flutters up and becomes a bird
    if (t >= 243.68) {
      const l = t - 243.68, b = P(hx - .3, .25, 4.7), m = smooth(inv(.25, .7, l));
      const x = b[0] - l * 40 + Math.sin(l * 5) * 30, y = b[1] - l * 160;
      if (m < 1) withT(() => { s.translate(x, y); s.rotate(Math.sin(l * 6) * .8); s.globalAlpha = 1 - m; shape([[-16, -10], [16, -10], [16, 10], [-16, 10]], CREAM, 1.5); });
      if (m > 0) bird(x, y, 26, t * 2.6, m);
    }
  }

  chapter('boss', 206.0, 245.0, [
    [206.0, clocks], [208.43, chase], [212.77, punch], [218.3, hallRun], [224.1, boss], [227.97, yell],
    [229.9, stand], [235.4, tear], [239.94, burst], [241.9, away],
  ]);
})();
