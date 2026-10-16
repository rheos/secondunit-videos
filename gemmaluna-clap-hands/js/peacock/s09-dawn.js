// 165.0-179.85 BRIDGE 2: dawn on the river (draft 4). Opens on the sun at the spotlight's place and size (the
// curtain's spotlight became it). "shine, shine" (164.98, 166.18): it rises and unfolds a sunflower corona of
// round, curling petals, and a peacock's tail fans open behind it; the camera holds so the fan stays whole. Then
// the camera settles low along the bank with the sun on the upper left third and steps along the bank on the half
// bars. "wait about tomorrow" (169.3-172.8): a sweep of light runs across the river as glints on the ripples and
// the far bank's windows pop lit on the beats as it reaches them: the night city's Nouveau fronts (horseshoe
// windows, iron rails, zinc mansards, the theatre's dome on its drum, the clock tower with its blank dial) waking
// up. The heron on the Metro lamp takes off on "run"; the dial flashes on "time". "salvation army ... in the hole"
// (173.6-176.9): the band floats through the close foreground, the heron flying ahead of it, and on "hole" the
// tuba gulps under. "go to heaven in a little rowboat" (177.46-179.8): the camera comes back to centre, the sun's
// path becomes a ladder, and the rowboat (rimmed in gold, the horseshoe on its bow the right way up, a glint on
// "heaven") climbs it onto the sun and shrinks to a spark at its centre. The last chorus opens on that sun.
const SUN4 = { x: 540, y: 820, R: 420 };   // where the last chorus's sun sits (the dawn pushes in to it)
const DAWN_END = 179.85, DAWN_HZ = 1260;
const dawnSunY = (t) => kf3(t, [[165.0, SUN0.y], [168.8, 760]]);
function dawnSky(t, bright = 0) {
  const bands = [[C.tealDeep, -400], [C.plumDeep, 200], [C.plum, 480], [C.plumLight, 760], [C.creamDeep, 1000], [C.goldPale, 1160]];
  sheet(C.tealDeep);
  bands.forEach(([col, y], i) => cut(poly([[-200, y + Math.sin(t * .2 + i) * 10], ...[...Array(13).keys()].map((j) => [j * 110 - 120, y + Math.sin(j * .9 + i * 2 + t * .15) * 26]), [1400, y], [1400, 2600], [-200, 2600]]), col, { sh: .5, grain: .3 }));
  if (bright > 0) sheet(C.goldPale, .25 * bright);
}
// a peacock's tail fanning open behind the sun (open 0..1)
function peacockFan(x, y, len, open, t) {
  if (open <= 0) return;
  for (let i = 0; i < 15; i++) { const a = -Math.PI / 2 + (i - 7) * lerp(.02, .2, open) + Math.sin(t * 1.2 + i) * .01; feather(x, y, a, len * (1 - Math.abs(i - 7) * .03), open); }
}
// The sun's corona (draft 4; the audit: the sawtooth petals read as a Deco badge). A sunflower: a back row of broad
// petals with round tips that curl alternately left and right, a shorter front row in two papers, a seed disc
// ringed with pearls, a lace ring. Each row is one paper cut. R = outer radius, u = how far it has unfolded.
const DAWN_PETALS = [0, 1].map((row) => [...Array(22).keys()].map((i) => ({
  a: TAU * (i + row * .5) / 22 + (hash(i * 1.7 + row * 4) - .5) * .07,
  L: (row ? .3 : .4) + hash(i * 3.1 + row * 9) * .07,
  c: (i % 2 ? 1 : -1) * (.6 + hash(i * 5.3 + row) * .5),
})));
function dawnPetal(L, w, c) {
  return blob([[-w * .42, 0], [-w * .56, -L * .4], [-w * .34 + c * w * .25, -L * .82], [c * w * .5, -L], [w * .34 + c * w * .25, -L * .84], [w * .55, -L * .42], [w * .42, 0], [0, L * .1]], .55);
}
function dawnCorona(x, y, R, rot = 0, u = 1, { petals = [C.gold, C.goldPale, C.cream], disc = C.goldPale, lace = C.gold } = {}) {
  const layer = (i, fn) => { const k = clamp(u * 4 - i); if (k <= 0) return; g.save(); g.translate(x, y); const s = back(k); g.scale(s, s); fn(); g.restore(); };
  const place = (a, r) => new DOMMatrix().translate(Math.cos(a) * r, Math.sin(a) * r).rotate((a + Math.PI / 2) * 180 / Math.PI);
  layer(0, () => {
    const p = new Path2D(), ribs = new Path2D();
    for (const P of DAWN_PETALS[0]) {
      const a = rot + P.a, L = R * P.L, w = R * .2, m = place(a, R * .56);
      p.addPath(dawnPetal(L, w, P.c), m);
      const rb = new Path2D(); rb.moveTo(0, -L * .1); rb.quadraticCurveTo(P.c * w * .1, -L * .5, P.c * w * .38, -L * .84); ribs.addPath(rb, m);
    }
    cut(p, petals[0], { sh: .8, lift: .4, grain: .2 });
    g.save(); g.strokeStyle = C.goldDeep; g.lineWidth = R * .014; g.lineCap = 'round'; g.globalAlpha *= .6; g.stroke(ribs); g.restore();
  });
  layer(1, () => {
    const pa = new Path2D(), pb = new Path2D();
    DAWN_PETALS[1].forEach((P, i) => (i % 2 ? pb : pa).addPath(dawnPetal(R * P.L, R * .17, P.c), place(rot * 1.3 + P.a, R * .54)));
    cut(pa, petals[1], { sh: .6, lift: .2, grain: .15 }); cut(pb, petals[2], { sh: .6, lift: .2, grain: .15 });
  });
  layer(2, () => {
    cut(circle(0, 0, R * .6), disc, { sh: .7, lift: .2 });
    const pr = new Path2D(); for (let i = 0; i < 30; i++) { const a = rot + TAU * i / 30; pr.moveTo(Math.cos(a) * R * .565 + R * .02, Math.sin(a) * R * .565); pr.arc(Math.cos(a) * R * .565, Math.sin(a) * R * .565, R * .02, 0, TAU); }
    cut(pr, C.gold, { sh: .2, grain: 0 });
  });
  layer(3, () => cut(ringLace(0, 0, R * .5, R * .545, 0), lace, { sh: .4, rule: 'evenodd' }));
}
// The far bank (draft 4; the audit: two windows over a gold curve made a grinning face on every house). The night
// city's Nouveau fronts at dawn: zinc mansards, ogee gables, an arcade of horseshoe windows, the theatre's verdigris
// dome seated on its drum, the clock tower with its blank dial, the Metro's two lily-bud lamps on the quay. Windows
// are single or stacked or in threes (never a pair over a curve); the iron rails run straight across the front and
// curl at the ends. The roofs are rim-lit by the sun behind them. Windows are dark until the light reaches them:
// litAt(x) gives the beat a window at x pops lit on (no litAt: all lit, for the last chorus).
const DAWN_BANK = [
  [-130, 150, 120, 'mansard', 'plumDeep'], [20, 110, 170, 'ogee', 'plum'], [130, 170, 104, 'arcade', 'tealDeep'],
  [300, 140, 92, 'dome', 'plum'], [440, 124, 150, 'mansard', 'plumDeep'], [564, 96, 196, 'ogee', 'tealDeep'],
  [660, 70, 250, 'clock', 'plum'], [730, 170, 116, 'arcade', 'plumDeep'], [900, 130, 160, 'mansard', 'tealDeep'],
  [1030, 110, 188, 'ogee', 'plum'], [1140, 180, 126, 'arcade', 'plumDeep'], [1320, 150, 150, 'mansard', 'tealDeep'],
];
const DAWN_LAMPS = [[330, 1], [750, -1]];   // the Metro's lily-bud lamps on the quay, bending in over the sun's path
const DAWN_DIAL = { x: 695, y: DAWN_HZ - 250 + 36, r: 24 };
const DAWN_HERON_PERCH = [500, DAWN_HZ - 14];   // the heron waits on the quay rail under the rising sun
function dawnFarBank(t, alpha = 1, sweepX = 9999, litAt = null) {
  const HZ = DAWN_HZ;
  if (alpha <= 0) return;
  g.save(); g.globalAlpha *= alpha;
  const groups = {}, add = (col, p) => { (groups[col] = groups[col] || new Path2D()).addPath(p); };
  const roofs = {}, roof = (col, p) => { (roofs[col] = roofs[col] || new Path2D()).addPath(p); };
  const wins = [], rails = new Path2D(), curls = new Path2D();
  const shoe = (x, y, w, h) => { const p = new Path2D(); p.addPath(shoePath(w, h), new DOMMatrix().translate(x, y)); return p; };
  const win = (x, y, w, h, path = null) => wins.push({ x: x + w / 2, y: y + h / 2, p: path || shoe(x, y, w, h) });
  const rail = (x0, x1, y) => {
    rails.rect(x0, y, x1 - x0, 5);
    for (const [sx, xe] of [[-1, x0], [1, x1]]) { curls.moveTo(xe, y + 2); curls.bezierCurveTo(xe + sx * 10, y + 2, xe + sx * 12, y - 10, xe + sx * 4, y - 12); curls.quadraticCurveTo(xe - sx * 2, y - 12, xe, y - 6); }
  };
  const stack = (cx, top, h, w, wh) => { const n = Math.max(1, Math.floor((h - 26) / (wh + 26))); for (let f = 0; f < n; f++) { const y = top + 22 + f * (wh + 26); win(cx - w / 2, y, w, wh); } return n; };
  for (const [x, w, h, kind, colKey] of DAWN_BANK) {
    const col = C[colKey], rc = colKey === 'tealDeep' ? C.plumDeep : C.tealDeep, top = HZ - h;
    add(col, rect(x, top, w, h + 4));
    if (kind === 'mansard') {
      const p = new Path2D(); p.moveTo(x - 6, top + 2); p.bezierCurveTo(x - 2, top - 30, x + w * .1, top - 46, x + w * .28, top - 48); p.lineTo(x + w * .72, top - 48); p.bezierCurveTo(x + w * .9, top - 46, x + w + 2, top - 30, x + w + 6, top + 2); p.closePath(); roof(rc, p);
      const cx = x + w * (.36 + .28 * hash(x * .13)), n = stack(cx, top, h, 30, 52);
      for (let f = 0; f < n; f++) rail(x + 8, x + w - 8, top + 22 + f * 78 + 54);
    } else if (kind === 'ogee') {
      const p = new Path2D(); p.moveTo(x - 4, top + 2); p.bezierCurveTo(x - 4, top - 30, x + w * .44, top - 30, x + w / 2, top - 74); p.bezierCurveTo(x + w * .56, top - 30, x + w + 4, top - 30, x + w + 4, top + 2); p.closePath(); roof(rc, p);
      win(x + w / 2 - 9, top - 36, 18, 18, circle(x + w / 2, top - 27, 9));
      stack(x + w / 2, top, h, 28, 48);
    } else if (kind === 'arcade') {
      const cr = new Path2D(); cr.rect(x - 6, top - 10, w + 12, 12); roof(rc, cr);
      for (let k = 0; k < 3; k++) win(x + w * (k + 1) / 4 - 13, top + 24, 26, 46);
      rail(x + 6, x + w - 6, top + 74);
      for (let k = 0; k < 4; k++) { const cx = x + 14 + k * (w - 28) / 3; curls.moveTo(cx, top - 10); curls.bezierCurveTo(cx - 10, top - 22, cx + 2, top - 34, cx + 8, top - 26); }
    } else if (kind === 'dome') {
      const dx = x + w / 2, dt = top - 44, dw = w * .6;
      add(C.plumDeep, rect(dx - dw / 2, dt, dw, 46));
      for (let k = -1; k <= 1; k++) win(dx + k * dw * .3 - 4, dt + 12, 8, 24, rrect(dx + k * dw * .3 - 4, dt + 12, 8, 24, 4));
      const dome = new Path2D(); dome.ellipse(dx, dt + 2, dw * .56, w * .34, 0, Math.PI, 0); dome.closePath(); roof(C.tealDeep, dome);
      roof(C.tealDeep, rect(dx - 7, dt - w * .34 - 20, 14, 22));
      const fin = new Path2D(); fin.moveTo(dx - 4, dt - w * .34 - 20); fin.lineTo(dx, dt - w * .34 - 44); fin.lineTo(dx + 4, dt - w * .34 - 20); fin.closePath(); rails.addPath(fin);
      for (const k of [-.5, 0, .5]) { curls.moveTo(dx + k * dw * 1.05, dt); curls.quadraticCurveTo(dx + k * dw * .7, dt - w * .3, dx, dt - w * .34 + 2); }
      win(dx - w * .2, top + 22, w * .4, h - 22);   // the theatre's one great horseshoe door
      rail(x + 4, x + w - 4, top + 10);
    } else if (kind === 'clock') {
      const p = new Path2D(); p.moveTo(x - 6, top + 2); p.bezierCurveTo(x, top - 40, x + w * .4, top - 50, x + w / 2, top - 100); p.bezierCurveTo(x + w * .6, top - 50, x + w, top - 40, x + w + 6, top + 2); p.closePath(); roof(rc, p);
      const fin = new Path2D(); fin.moveTo(x + w / 2 - 3, top - 98); fin.lineTo(x + w / 2, top - 124); fin.lineTo(x + w / 2 + 3, top - 98); fin.closePath(); rails.addPath(fin);
      for (let f = 0; f < 3; f++) win(x + w / 2 - 7, top + 80 + f * 54, 14, 34, rrect(x + w / 2 - 7, top + 80 + f * 54, 14, 34, 7));
    }
  }
  for (const c of [C.plum, C.plumDeep, C.tealDeep]) if (groups[c]) cut(groups[c], c, { sh: .4, grain: .2, alpha: .97 });
  for (const c of [C.tealDeep, C.plumDeep]) if (roofs[c]) cut(roofs[c], c, { sh: .3, grain: .15 });
  // the sun behind the town rim-lights every roof
  g.save(); g.strokeStyle = C.goldPale; g.lineWidth = 4; g.globalAlpha *= .75; for (const c in roofs) g.stroke(roofs[c]); g.restore();
  // the windows: dark until the light reaches them, then they pop lit on the beat
  const dark = new Path2D(), lit = new Path2D(), frames = new Path2D(), pops = [];
  for (const W_ of wins) {
    frames.addPath(W_.p);
    const la = litAt ? litAt(W_.x) : (sweepX >= W_.x ? -1e9 : 1e9);
    if (t < la) dark.addPath(W_.p); else if (t - la < .5) { dark.addPath(W_.p); pops.push([W_, t - la]); } else lit.addPath(W_.p);
  }
  g.fillStyle = C.tealInk; g.fill(dark);
  g.fillStyle = C.goldPale; g.fill(lit);
  for (const [W_, d] of pops) { const s = back(clamp(d / .22)); glow(W_.x, W_.y, 70, '250,220,150', .35 * (1 - d / .5)); g.save(); g.translate(W_.x, W_.y); g.scale(s, s); g.translate(-W_.x, -W_.y); g.fillStyle = C.goldPale; g.fill(W_.p); g.restore(); }
  g.save(); g.strokeStyle = C.goldDeep; g.lineWidth = 3; g.stroke(frames); g.restore();
  // iron: straight rails with curled ends, roof cresting, finials, dome ribs
  g.fillStyle = C.gold; g.fill(rails);
  g.save(); g.strokeStyle = C.gold; g.lineWidth = 4; g.lineCap = 'round'; g.stroke(curls); g.restore();
  // the clock tower's dial: blank, its hands gave themselves up to clap at twelve. It flashes gold on "time".
  const D = DAWN_DIAL, fl = bump(t, 172.45, .8), dl = litAt ? clamp((t - 172.45) / .3) : 1;
  cut(circle(D.x, D.y, D.r), C.gold, { sh: .4, grain: 0 });
  cut(circle(D.x, D.y, D.r * .78), dl > 0 ? C.goldPale : C.tealDeep, { sh: 0, grain: 0 });
  if (fl > 0) { glow(D.x, D.y, 150, '252,232,170', .4 * fl); g.save(); g.globalAlpha *= fl; cut(circle(D.x, D.y, D.r * (1 + .25 * fl)), C.cream, { sh: 0, grain: 0 }); g.restore(); }
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; g.fillStyle = C.goldDeep; g.fill(circle(D.x + Math.cos(a) * D.r * .6, D.y + Math.sin(a) * D.r * .6, 2.5)); }
  // the quay: a gold rail along the water, and the Metro's two lamps
  g.fillStyle = C.goldDeep; g.fillRect(-400, HZ - 16, 2000, 4); for (let x = -400; x < 1600; x += 44) g.fillRect(x, HZ - 16, 4, 16);
  for (const [lx, dir] of DAWN_LAMPS) {
    const lt = litAt ? clamp((t - litAt(lx)) / .25) : 1, s = .5, h = 200;
    const st = whipPts([0, 0], [-dir * h * .04, -h * .6], [dir * h * .02, -h * 1.12], [dir * h * .26, -h], 0, 1, 24).map(([px, py]) => [lx + px * s, HZ - 12 + py * s]);
    tendril(st, 9, C.tealInk, { sh: .3, grain: 0 }); tendril(st.map(([px, py]) => [px - dir * 1.5, py]), 2.5, C.gold, { sh: 0, grain: 0 });
    const [bx, by] = st[st.length - 1];
    if (lt > 0) glow(bx, by + 18, 110, '245,200,120', .55 * lt);
    cut(blob([[bx - 9, by + 8], [bx, by + 1], [bx + 9, by + 8], [bx + 7, by + 26], [bx, by + 33], [bx - 7, by + 26]], .7), lt > .5 ? C.goldPale : C.plumLight, { sh: .3, grain: 0 });
    for (const sd of [-1, 1]) { g.save(); g.translate(bx, by + 4); g.rotate(sd * .8); g.fillStyle = C.gold; g.fill(blob([[-3, 0], [0, -12], [3, 0]], .6)); g.restore(); }
  }
  g.restore();
}
// the sun's path: curved ripples, and the ladder of light rising out of it into the sun
function dawnPath(t, alpha = 1) {
  const HZ = DAWN_HZ;
  g.save(); g.globalAlpha *= alpha;
  for (let i = 0; i < 9; i++) { const w = 40 + i * 26, y = HZ + 24 + i * 52; g.strokeStyle = C.goldPale; g.lineWidth = 10; g.lineCap = 'round'; g.globalAlpha = alpha * .8; g.beginPath(); g.moveTo(540 - w, y); g.quadraticCurveTo(540, y + 14 + Math.sin(t * 2 + i) * 4, 540 + w, y); g.stroke(); }
  g.globalAlpha = alpha;
  const lad = eo(clamp((t - 176.6) / 1.4)), sy = dawnSunY(t);
  if (lad > 0) {
    const top = lerp(HZ + 460, sy + 130, lad);
    for (const sd of [-1, 1]) {
      const pts = [[540 + sd * (40 + 8 * 26 + 18), HZ + 24 + 8 * 52 + 140], ...[...Array(9).keys()].reverse().map((i) => [540 + sd * (40 + i * 26 + 10), HZ + 30 + i * 52]), [540 + sd * 44, HZ], [540 + sd * 32, sy + 130]];
      const keep = pts.filter(([, y]) => y >= top - 1); if (keep.length < 2) continue;
      tendril(keep.concat([[keep[keep.length - 1][0], Math.max(top, keep[keep.length - 1][1] - 1)]]), 12, C.gold, { sh: .4, grain: .2 });
    }
    for (let y = HZ - 40; y > Math.max(top, sy + 140); y -= 46) { const w = lerp(44, 32, (HZ - y) / (HZ - sy - 130)); cut(rrect(540 - w, y, w * 2, 9, 4), C.goldPale, { sh: .2, grain: .1, alpha: .85 }); }
  }
  g.restore();
}
// the rowboat with a gold rim (the audit: the plum hull vanished on the plum town) and a horseshoe on its bow, the
// right way up now, twice the size, with a glint on "heaven"
const DAWN_HULL = [[-170, -60], [-120, 20], [120, 20], [180, -70], [150, -60], [-150, -50]];
function dawnBoat(x, y, s, ph, rot, t) {
  g.save(); g.translate(x, y); g.rotate(rot);
  glow(0, -50 * s, 280 * s, '250,225,160', .4);
  g.save(); g.scale(s, s); g.translate(0, -25); g.scale(1.1, 1.3); g.translate(0, 25); cut(blob(DAWN_HULL, .4), C.goldPale, { sh: .5, grain: 0 }); g.restore();
  rowboat(0, 0, s, ph, 1);
  g.scale(s, s); g.translate(-140, -116);
  cut(rect(-5, 44, 10, 46), C.goldDeep, { sh: .4, grain: 0 }); // the shoe is mounted on the stem post like a figurehead
  const hs = new Path2D(); hs.arc(0, 0, 50, -Math.PI * .2, Math.PI * 1.2, false); hs.lineTo(Math.cos(Math.PI * 1.2) * 28, Math.sin(Math.PI * 1.2) * 28); hs.arc(0, 0, 28, Math.PI * 1.2, -Math.PI * .2, true); hs.closePath();
  cut(hs, C.gold, { sh: .6, lift: .2, grain: .1 }); // a real horseshoe, ends turned in, open at the top: U, the luck turned
  for (const a of [-.2, 1.2]) cut(rrect(Math.cos(Math.PI * a) * 39 - 12, Math.sin(Math.PI * a) * 39 - 8, 24, 14, 3), C.goldDeep, { sh: .3, grain: 0 }); // the heels
  g.save(); g.strokeStyle = C.goldPale; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.arc(0, 0, 41, Math.PI * .55, Math.PI * .95); g.stroke(); g.restore();
  for (const a of [.02, .2, .38, .62, .8, .98]) { g.fillStyle = C.plumDeep; g.fill(circle(Math.cos(Math.PI * a) * 39, Math.sin(Math.PI * a) * 39, 4.5)); }
  const gl = bump(t, 178.32, .6);
  if (gl > 0) { glow(-40, -24, 170, '255,246,220', .4 * gl); cut(star4(-40, -24, 74 * gl), C.white, { sh: 0, grain: 0 }); }
  g.restore();
}
(() => {
  const HZ = DAWN_HZ;
  const beats = (window.FEAT && FEAT.beats) || [];
  const nextBeat = (x) => { for (const b of beats) if (b >= x - .02) return b; return x; };
  // the sweep of light crosses the river and the bank left to right; a window pops lit on the first beat after it
  const SW0 = 169.3, SW1 = 172.8, SWX0 = -300, SWX1 = 1400;
  const sweepT = (x) => SW0 + clamp((x - SWX0) / (SWX1 - SWX0)) * (SW1 - SW0);
  const LIT = new Map(), litAt = (x) => { const k = Math.round(x); if (!LIT.has(k)) LIT.set(k, nextBeat(sweepT(x))); return LIT.get(k); };
  // the camera: holds on the sun while the fan opens, then settles low on the bank with the sun on the upper left
  // third and steps along the bank on the half bars; a small tilt down for the band; back to centre for the ladder
  // and the hand-off into the last chorus. It opens on the theatre's last camera (cy 1000, z 1), so the sun starts at
  // the spotlight's exact screen place (540, 1060, r 200), and eases to cy 960 by 166.2 while the fan opens.
  const STEPS = [169.467, 170.467, 171.5, 172.5, 173.533, 174.567, 175.567];
  const camAt = (t) => {
    const home = 1 - ss(176.3, 177.8, t), step = STEPS.reduce((s, b) => s + eo(clamp((t - b) / .3)), 0) * 9 * home;
    return [kf3(t, [[165.0, 540], [168.2, 540], [169.3, 690], [176.3, 690], [177.8, 540]]) + step,
      kf3(t, [[165.0, 1000], [166.2, 960], [168.2, 960], [169.3, 1130], [172.9, 1130], [173.6, 1180], [176.3, 1180], [177.3, 1150], [178.6, 1000], [DAWN_END, 860]]),
      kf3(t, [[165.0, 1.0], [168.2, 1.0], [169.3, .92], [176.3, .96], [177.3, 1.0], [178.6, 1.2], [DAWN_END, 1.4]])];
  };
  const heronAt = (t) => { // [x, y, scale, fold, facing right]
    if (t < 171.4) return [...DAWN_HERON_PERCH, .3, 1, false];
    if (t < 172.6) { const u = (t - 171.4) / 1.2; return [lerp(DAWN_HERON_PERCH[0], -260, ei(u) * .7 + u * .3), DAWN_HERON_PERCH[1] - 110 * eo(u), lerp(.3, .55, u), 1 - ss(171.4, 171.62, t), false]; } // low along the fronts, cream on the dark town
    if (t > 173.2 && t < 176.8) return [120 + 380 * (t - 173.2), 1640 - Math.sin((t - 173.2) * 1.6) * 24, .8, 0, true]; // at band height, flying
    return null;
  };
  SHOT(165.0, DAWN_END, 'dawn', (t, k, d) => {
    const [cx, cy, z] = camAt(t);
    g.save(); cam(cx, cy, z);
    dawnSky(t);
    // the sun: a disc that unfolds into a sunflower corona on "shine", a peacock's tail fanning open behind it
    const sy = dawnSunY(t), u = ss(165.2, 167.4, t);
    glow(540, sy, 700, '250,215,140', .4 + .2 * u);
    const fan = (back(clamp((t - 165.0) / 1.0)) * .55 + back(clamp((t - 166.2) / 1.0)) * .45) * (1 - .14 * ss(168.6, 169.8, t) * (1 - ss(177.4, 179.4, t)));
    peacockFan(540, sy, 560, fan, t);
    dawnCorona(540, sy, 300, t * .04, u);
    cut(circle(540, sy, lerp(SUN0.r, 150, u)), C.goldPale, { sh: .3, grain: .3 });
    // the far bank wakes as the sweep reaches it; the heron waits on the Metro lamp
    const swk = clamp((t - SW0) / (SW1 - SW0)), env = Math.sin(swk * Math.PI), sweepX = lerp(SWX0, SWX1, swk);
    dawnFarBank(t, 1, sweepX, litAt);
    const hr = heronAt(t);
    if (hr && t < 172.6) { const [hx, hy, hsc, fold] = hr; g.save(); g.translate(hx, hy); heron(0, 0, hsc, fold, t * 10); g.restore(); }
    // the river, its ripples, lily pads
    cut(cutRect(-400, HZ, 2000, 1300, 601), C.teal, { sh: .6 });
    for (let i = 0; i < 12; i++) cut(ribbon(-400, 1600, HZ + 20 + i * i * 5, 4 + i * .7, i * 1.3 + t * (.3 + i * .04), 4 + i * .8), C.tealLight, { sh: 0, grain: .2, alpha: .6 });
    for (let i = 0; i < 9; i++) { const lx = ((hash(i * 5.1) * 1600 + t * 12) % 1600) - 150, ly = HZ + 120 + hash(i * 2.7) * 700; cut(ellipse(lx, ly, 46 + i * 3, 14 + i), C.tealDeep, { sh: .3 }); cut(poly([[lx, ly], [lx + 46, ly - 6], [lx + 46, ly + 6]]), C.teal, { sh: 0, grain: 0 }); if (i % 3 === 0) cut(flowerPath(lx - 10, ly - 6, 14, 5, i), C.cream, { sh: .2, grain: 0 }); }
    // the sweep of light: a soft pool and bright whiplash glints riding the ripples (draft 3's ribbons read as sandbars)
    if (env > 0) {
      glow(sweepX, HZ + 280, 600, '250,226,160', .34 * env);
      for (let i = 0; i < 12; i++) {
        const Y = HZ + 20 + i * i * 5, ph = i * 1.3 + t * (.3 + i * .04), wave = 4 + i * .8, gx = sweepX + (i - 5) * 22 + (hash(i * 4.1) - .5) * 140, L = 70 + i * 18;
        const at = (x) => [x, Y + Math.sin((x + 400) / 2000 * 5 + ph) * wave];
        const e = at(gx + L / 2);
        tendril(whipPts(at(gx - L / 2), at(gx - L / 6), at(gx + L / 6), [e[0], e[1] - 3], L * .05, -1, 14), 8 + i * .6, C.white, { sh: 0, grain: 0, alpha: env * (.7 + .3 * Math.sin(t * 11 + i * 2)) });
      }
    }
    dawnPath(t, 1);
    if (env > 0) { // the glints catch the sun's path too, one bright bead per ripple as the light passes it
      g.save(); g.strokeStyle = C.white; g.lineCap = 'round';
      for (let i = 0; i < 9; i++) {
        const w = 40 + i * 26, y = HZ + 24 + i * 52, s = (sweepX - (540 - w)) / (2 * w); if (s < -.1 || s > 1.1) continue;
        const pt = (q) => [540 - w + 2 * w * q, y + 2 * q * (1 - q) * (14 + Math.sin(t * 2 + i) * 4)];
        g.globalAlpha = env * .85; g.lineWidth = 12; g.beginPath(); for (let j = 0; j <= 6; j++) { const q = clamp(s - .14 + j * .047); const [px, py] = pt(q); j ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke();
      }
      g.restore();
    }
    // paper mist low on the water, thinning as the light comes
    const mist = ss(168.8, 170.0, t) * (1 - ss(171.4, 173.0, t));
    if (mist > 0) for (let i = 0; i < 3; i++) { const yb = HZ + 40 + i * 80 - (t - 168.8) * (8 + i * 4); g.save(); g.globalAlpha *= (.42 - i * .1) * mist; cut(poly([[-400, yb + 60], ...[...Array(16).keys()].map((j) => [j * 130 - 400, yb + Math.sin(j * 1.3 + i + t * .4) * 18]), [1700, yb + 60]]), C.cream, { sh: .2, grain: .3 }); g.restore(); }
    // the band floats through the close foreground, the heron flying ahead of it; on "hole" the tuba gulps under
    [[173.4, 'drum', 1700], [173.9, 'tuba', 1820], [174.3, 'tam', 1640]].forEach(([t0, kind, y], i) => {
      const p = clamp((t - t0) / 3.6); if (p <= 0 || p >= 1) return;
      const sink = kind === 'tuba' ? ss(176.45, 177.15, t) : 0, x = lerp(-110, 1490, p);
      if (sink >= 1) return;
      g.save();
      if (sink > 0) { g.beginPath(); g.rect(-600, -600, 3000, y + 108 + 600); g.clip(); }
      g.translate(x, y + Math.sin(t * 2.3 + i) * 12 * (1 - sink) + 300 * sink * sink); g.rotate(Math.sin(t * 1.7 + i) * .12 + (kind === 'drum' ? 0 : i * .3) - .9 * sink);
      if (kind === 'drum') bassDrum(.85); else if (kind === 'tuba') { g.rotate(-.6); tuba(.78); } else tambourine(.9);
      g.restore();
    });
    { const ts = 176.45, xs = lerp(-110, 1490, clamp((ts - 173.9) / 3.6)) + 40; // the gulp's rings
      for (let r = 0; r < 3; r++) { const dd = t - ts - .2 - r * .16; if (dd < 0 || dd > 1.1) continue; const q = dd / 1.1; g.save(); g.globalAlpha *= (1 - q) * .85; g.strokeStyle = r % 2 ? C.goldPale : C.cream; g.lineWidth = lerp(10, 3, q); g.beginPath(); g.ellipse(xs, 1828 + 100, 70 + q * 260, 16 + q * 50, 0, 0, TAU); g.stroke(); g.restore(); } }
    if (hr && t >= 172.6) { const [hx, hy, hsc, fold] = hr;
      g.save(); g.globalAlpha *= .35; g.fillStyle = C.tealDeep; g.fill(ellipse(hx - 60, hy + 130, 130 * hsc / .8, 14)); g.restore(); // its shadow on the water: it is flying
      g.save(); g.translate(hx, hy); g.scale(-1, 1); heron(0, 0, hsc, fold, t * 9); g.restore(); }
    // the rowboat sails up the path, climbs the ladder onto the sun and shrinks to a spark at its centre
    if (t > 177.0) {
      const bx = kf3(t, [[177.0, 300], [178.0, 520], [178.6, 540]]), by = kf3(t, [[177.0, 1760], [178.6, HZ + 6], [179.35, sy + 34], [DAWN_END, sy]]);
      const bs = kf3(t, [[177.0, .95], [178.6, .58], [179.35, .44], [DAWN_END, .02]]), tilt = -.5 * ss(178.6, 179.0, t) * (1 - ss(179.15, 179.55, t));
      dawnBoat(bx, by, bs, t * TAU / 1.03, tilt, t);
      const sp = bump(t, 179.3, .55); // over by the cut, so nothing pops
      if (sp > 0) { glow(540, sy, 220, '255,244,214', .38 * sp); cut(star4(540, sy, 70 * sp), C.white, { sh: 0, grain: 0 }); }
    }
    g.restore();
    sheet(C.goldPale, .35 * (1 - ss(165.0, 165.2, t)));
  }, { xin: .4, tr: 'fade' }); // the curtain's spotlight becomes the sun
})();
