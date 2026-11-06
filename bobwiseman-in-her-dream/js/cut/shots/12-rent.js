// 190.7-207.64  "In her dream the rent's not increased and her skirt's not torn at the seam"
// 12a: dusk, later than 11. She walks home to her green front door; a rent notice is taped to it.
// Through the long held "dream" the fanlight lights pane by pane on the beats while a vine climbs the
// frame and opens its flowers. On "rent's" the tall figure on the notice stretches taller (the threat),
// on "not" it is squashed back down, on "increased" it shrinks away; then the sheet peels off, folds
// into a paper bird and flies.
// 12b: close on the side seam of her skirt (no legs): a tear between two gores, cream lining showing
// through; a needle in gold thread cross-stitches it shut, one X per beat from "torn"; on "seam" the
// thread pulls tight; flowers bloom along the mended seam and the skirt swings.
// Colours: dusk violet (ground), leaf (door, leaves), cream (notice, bird, lining, flowers, needle),
// navy (her), gold (fanlight, thread, tape).
(() => {
const T = { dream: 192.14, rents: 198.78, not: 199.2, incr: 199.52, peel: 200.1, fold: 200.32, fly: 200.52,
  cut: 201.3, skirt: 201.43, not2: 202.1, torn: 202.79, seam: 204.41, end: 207.64 };
// the band's pulse here, from the no-vocals stem's onsets (191.47, 192.60, 194.54, 195.72, 196.87, ...)
const BT = (n) => 191.47 + n * .386;
const BEAT = (t0, n) => [...Array(n).keys()].map((i) => t0 + i * .386);
// dusk papers (later than 11's)
const P = { wall: '#57457e', wallDeep: '#46366a', wallDark: '#382b57', lining: C.cream };

// ---- local FK / IK (the kit has no hand-position helper) ----
const DEG = 180 / Math.PI;
function rootM(x, y, s, dir, spec, pose) {
  const h = spec.height || 1;
  return new DOMMatrix().translateSelf(x, y + (pose.bob || 0) * s).scaleSelf(s * h * dir, s * h).rotateSelf((pose.lean || 0) * DEG);
}
const armRoot = (M, near) => M.multiply(new DOMMatrix().translateSelf(near ? 8 : -8, -752));
function ik(M, near, Pt) {
  const L1 = 168, L2 = 190;
  const q = armRoot(M, near).inverse().transformPoint(new DOMPoint(Pt.x, Pt.y));
  let d = clamp(Math.hypot(q.x, q.y), 40, L1 + L2 - .5);
  const a1 = Math.atan2(q.x, q.y) - Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
  return [a1, Math.atan2(q.x - L1 * Math.sin(a1), q.y - L1 * Math.cos(a1)) - a1];
}
const mixP = (a, b, k) => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k) });
// a straight paper strip from a to b, width w, rounded ends
function strip(a, b, w) {
  const dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || .1;
  const p = new Path2D(); const ang = Math.atan2(dy, dx), nx = -dy / L * w / 2, ny = dx / L * w / 2;
  p.moveTo(a.x + nx, a.y + ny); p.lineTo(b.x + nx, b.y + ny); p.arc(b.x, b.y, w / 2, ang + Math.PI / 2, ang - Math.PI / 2, true);
  p.lineTo(a.x - nx, a.y - ny); p.arc(a.x, a.y, w / 2, ang - Math.PI / 2, ang + Math.PI / 2, true); p.closePath(); return p;
}
// a ribbon of constant width along a polyline
function band(pts, w) {
  const L = [], R = []; const n = pts.length;
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    let dx = b.x - a.x, dy = b.y - a.y; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
    L.push([pts[i].x - dy * w / 2, pts[i].y + dx * w / 2]); R.push([pts[i].x + dy * w / 2, pts[i].y - dx * w / 2]);
  }
  return poly(L.concat(R.reverse()));
}

// ---- 12a pieces ----
const DOOR = { x: 1090, y: 150, w: 330, h: 720 };      // arched top, bottom at y + h
const NOTE = { x: 1255, y: 505, w: 220, h: 270 };
// fanlight panes light one at a time on the beats of the held "dream", then the whole light flares
const PANE_AT = [BT(3), BT(6), BT(8), BT(11), BT(14)];     // 192.63 193.79 194.56 195.72 196.87
const FLARE = BT(16);                                      // 197.65
function door(t) {
  const { x, y, w, h } = DOOR, r = w / 2;
  // the frame: pilasters and an arch of the wall's own paper, a shade deeper
  const fr = new Path2D(); fr.moveTo(x - 46, y + h); fr.lineTo(x - 46, y + r); fr.arc(x + r, y + r, r + 46, Math.PI, 0); fr.lineTo(x + w + 46, y + h); fr.closePath();
  cut(fr, P.wallDeep, { sh: .7, lift: .2 });
  // glow spilling from the fanlight onto the wall, a step brighter with each lit pane
  const lit = PANE_AT.reduce((a, at) => a + ss(at - .02, at + .14, t), 0) / PANE_AT.length;
  const flare = bump(t, FLARE - .04, .7);
  const glow = lit * .8 + flare * .45;
  if (glow > 0) { g.save(); g.globalAlpha *= clamp(glow) * .5; const gr = g.createRadialGradient(x + r, y + r, 30, x + r, y + r, 470 + flare * 60);
    gr.addColorStop(0, 'rgba(247,210,126,.95)'); gr.addColorStop(1, 'rgba(247,210,126,0)'); g.fillStyle = gr; g.fill(circle(x + r, y + r, 540)); g.restore(); }
  const d = new Path2D(); d.moveTo(x, y + h); d.lineTo(x, y + r); d.arc(x + r, y + r, r, Math.PI, 0); d.lineTo(x + w, y + h); d.closePath();
  cut(d, C.leaf, { sh: .9, lift: .4, grain: .3 });
  // fanlight: five panes in the arch, each its own cut of warm paper, separated by leaf mullions
  const cx = x + r, cy = y + r + 10, R0 = r - 26, R1 = 34;
  g.save(); g.fillStyle = C.leafDeep; const fan = new Path2D(); fan.moveTo(x + 26, cy); fan.arc(cx, cy, R0, Math.PI, 0); fan.closePath(); g.fill(fan); g.restore();
  for (let i = 0; i < 5; i++) {
    const a0 = Math.PI + Math.PI * i / 5 + .045, a1 = Math.PI + Math.PI * (i + 1) / 5 - .045;
    const pn = new Path2D(); pn.arc(cx, cy, R0 - 6, a0, a1); pn.arc(cx, cy, R1 + 10, a1, a0, true); pn.closePath();
    const on = ss(PANE_AT[i] - .02, PANE_AT[i] + .1, t);
    cut(pn, C.leafDeep, { sh: 0, grain: .15 });
    if (on > 0) {
      const pk = pop(t, PANE_AT[i], .35);
      g.save(); g.translate(cx, cy); g.scale(lerp(.92, 1, pk), lerp(.92, 1, pk)); g.translate(-cx, -cy);
      cut(pn, C.goldPale, { sh: .2, grain: .2, alpha: on }); g.restore();
    }
  }
  cut(circle(cx, cy, R1), C.goldPale, { sh: .3, grain: .2, alpha: lerp(.55, 1, lit) });
  if (flare > 0) { const fp = new Path2D(); fp.moveTo(x + 26, cy); fp.arc(cx, cy, R0, Math.PI, 0); fp.closePath(); cut(fp, '#fff3d0', { sh: 0, grain: 0, alpha: flare * .45 }); }
  // panels, tonal; a gold knob
  for (const [px, py, pw, ph] of [[x + 40, y + r + 50, w / 2 - 58, 170], [x + w / 2 + 18, y + r + 50, w / 2 - 58, 170],
    [x + 40, y + r + 260, w / 2 - 58, 250], [x + w / 2 + 18, y + r + 260, w / 2 - 58, 250]])
    cut(cutRect(px, py, pw, ph, px * .1), C.leafDeep, { sh: 0, grain: .2, alpha: .55 });
  cut(circle(x + w - 46, y + h - 330, 13), C.gold, { sh: .6 });
  // stoop: two steps
  cut(cutRect(x - 70, y + h, w + 140, 22, 31), P.wallDeep, { sh: .7, lift: .2 });
  cut(cutRect(x - 110, y + h + 20, w + 220, 26, 32), P.wallDeep, { sh: .7, lift: .2 });
}
// the vine that climbs the left pilaster during the held "dream"; leaves pop on the beats
const VINE = (() => { const pts = []; for (let i = 0; i <= 40; i++) { const u = i / 40; pts.push({ x: DOOR.x - 46 + Math.sin(u * 9) * 18, y: DOOR.y + DOOR.h + 30 - u * 640 }); } return pts; })();
const LEAVES = BEAT(BT(3), 13).map((at, i) => ({ at, u: .08 + i * .068, side: i % 2 ? 1 : -1 }));
const BLOSSOM = [[BT(9), .36, 1], [BT(12), .6, -1], [FLARE, .9, 1]];
function vine(t) {
  const grow = ss(192.3, 197.6, t); if (grow <= 0) return;
  const n = Math.max(2, Math.round(VINE.length * grow));
  cut(band(VINE.slice(0, n), 9), C.leafDeep, { sh: .5, grain: .15 });
  for (const L of LEAVES) {
    const k = pop(t, L.at, .45); if (k <= 0 || L.u > grow) continue;
    const { x: px, y: py } = VINE[Math.round(L.u * 40)];
    g.save(); g.translate(px, py); g.rotate(L.side * .9 - .2); g.scale(k, k);
    cut(ellipse(L.side * 26, 0, 28, 13), C.leaf, { sh: .6, grain: .2 }); g.restore();
  }
  // flowers open along it on the strong beats, the last one with the fanlight's flare
  for (const [at, u, sd] of BLOSSOM) {
    const k = pop(t, at, .5); if (k <= 0) continue; const { x: px, y: py } = VINE[Math.round(u * 40)];
    g.save(); g.translate(px + sd * 22, py); g.scale(k, k); flower(0, 0, 36, C.cream, C.gold, at * 3 + k * .6); g.restore();
  }
}
// tall cut-paper numerals: each glyph is built from paper strips on a 7-segment frame (a..g), w x h
const SEGS = { '$': 'afgcd', 1: 'bc', 2: 'abged', 4: 'fgbc', 5: 'afgcd', 0: 'abcdef' };
function glyph(ch, x, y, w, h, th, col) {
  const s = SEGS[ch]; const m = h / 2;
  const seg = { a: [[0, 0], [w, 0]], b: [[w, 0], [w, m]], c: [[w, m], [w, h]], d: [[0, h], [w, h]], e: [[0, m], [0, h]], f: [[0, 0], [0, m]], g: [[0, m], [w, m]] };
  const p = new Path2D();
  for (const k of s) { const [[x0, y0], [x1, y1]] = seg[k]; p.addPath(strip({ x: x + x0, y: y + y0 }, { x: x + x1, y: y + y1 }, th)); }
  if (ch === '$') p.addPath(strip({ x: x + w / 2, y: y - th * 1.3 }, { x: x + w / 2, y: y + h + th * 1.3 }, th * .62));
  cut(p, col, { sh: .25, grain: .1 });
}
// the notice in its own coords (origin at its centre). tall: stretch of the figure (1 = rest), small: shrink
function notice(t, tall, small) {
  const { w, h } = NOTE;
  cut(cutRect(-w / 2, -h / 2, w, h, 41, 3), C.cream, { sh: .8, lift: .3, grain: .3 });
  // a header rule, and two lines of small print as bars
  cut(rrect(-74, -h / 2 + 30, 148, 12, 6), C.navy, { sh: 0, grain: .1 });
  g.save(); g.globalAlpha *= .45;
  cut(rrect(-74, h / 2 - 60, 148, 8, 4), C.navy, { sh: 0, grain: 0 }); cut(rrect(-74, h / 2 - 42, 100, 8, 4), C.navy, { sh: 0, grain: 0 });
  g.restore();
  // the figure "$1450", tall numerals standing on a baseline; it stretches up and is squashed back
  const gw = 26, gh = 92, gap = 13, chars = ['$', 1, 4, 5, 0];
  const tot = chars.length * gw + (chars.length - 1) * gap;
  const base = 52;
  g.save(); g.translate(0, base); g.scale(small, tall * small); g.translate(0, -base);
  chars.forEach((ch, i) => glyph(ch, -tot / 2 + i * (gw + gap), base - gh, gw, gh, 10, C.navy));
  g.restore();
}
// a folded-paper bird (the kit bird reads as a hat at this size): long faceted wings, a forked tail
function paperBird(x, y, s, ph, dir = 1) {
  g.save(); g.translate(x, y); g.scale(s * dir, s);
  const f = Math.sin(ph);
  cut(poly([[-6, -2], [22, -2], [-2 - 18 * f, -8 - 70 * f]]), C.creamDeep, { sh: .4, grain: .2 });       // far wing
  cut(poly([[-46, 0], [-74, -20], [-62, 0], [-76, 16], [-36, 6], [8, 10], [40, 2], [62, -6], [40, -6], [6, -12]]), C.cream, { sh: .7, lift: .4 });
  cut(poly([[-16, 0], [20, 0], [-10 - 24 * f, -6 - 84 * f]]), C.cream, { sh: .6, lift: .4, grain: .25 });  // near wing
  g.restore();
}
function tape(x, y, rot) { g.save(); g.translate(x, y); g.rotate(rot); cut(cutRect(-30, -11, 60, 22, x, 2), C.goldPale, { sh: .3, grain: .2, alpha: .85 }); g.restore(); }

SHOT(190.7, T.cut, 'rent-door', (t, k) => {
  sheet(P.wall);
  // dusk: the top of the wall falls into shade
  { const gr = g.createLinearGradient(0, 0, 0, 700); gr.addColorStop(0, 'rgba(30,22,52,.42)'); gr.addColorStop(1, 'rgba(30,22,52,0)');
    g.save(); g.fillStyle = gr; g.fillRect(-10, -10, W + 20, 720); g.restore(); }
  const push = eio(ss(192.6, 198.6, t));
  const zoom = lerp(1, 1.14, push);
  g.save(); g.translate(1060, 520); g.scale(zoom, zoom); g.translate(-1060, -520);
  // a faint coursing of the wall paper, tonal
  g.save(); g.globalAlpha *= .3; for (let r = 0; r < 9; r++) cut(rect(-160, 60 + r * 96, W + 320, 4), P.wallDeep, { sh: 0, grain: 0 }); g.restore();
  // pavement
  cut(cutRect(-160, 905, W + 320, 260, 51, 4), P.wallDark, { sh: .7, lift: .2 });

  door(t);
  vine(t);

  // ---- the notice: stretch on "rent's", squashed on "not", shrinks on "increased", peel, fold, fly ----
  const shiver = bump(t, T.rents - .05, .5);
  const up = pop(t, T.rents, .32) * (1 - ss(T.not - .04, T.not + .06, t));
  const squash = pop(t, T.not, .4);
  const tall = t < T.not ? 1 + .42 * up : lerp(1.42, 1, squash);
  const small = lerp(1, .58, eio(ss(T.incr, T.incr + .45, t)));
  const peel = ss(T.peel, T.fold, t), fold = ss(T.fold, T.fly, t);
  if (t < T.fly) {
    const tl = { x: NOTE.x - NOTE.w / 2 + 10, y: NOTE.y - NOTE.h / 2 + 8 };
    g.save(); g.translate(tl.x, tl.y);
    g.rotate(-.03 + Math.sin(t * 40) * .02 * shiver + peel * .5 + fold * .5);
    g.translate(peel * 30, -peel * 20 - fold * 40);
    g.scale(lerp(1, .25, eio(fold)), lerp(1, .5, eio(fold)));
    g.translate(NOTE.w / 2 - 10, NOTE.h / 2 - 8);
    notice(t, tall, small);
    g.restore();
    tape(tl.x + 4, tl.y - 2, -.6);
    if (peel < .3) tape(NOTE.x + NOTE.w / 2 - 14, NOTE.y - NOTE.h / 2 + 4, .55);
  }
  // the bird it became
  if (t >= T.fly - .02) {
    const f = eo((t - T.fly) / 1.5), ph = (t - T.fly) * 15;
    const bx = lerp(NOTE.x, 1740, f), by = lerp(NOTE.y - 40, 300, f) - Math.pow(Math.sin(f * Math.PI), .6) * 150;
    paperBird(bx, by, lerp(1.1, 1.9, ss(0, .25, f)), ph, 1);
  }

  // ---- her ----
  const ARR = 192.55, X1 = 880, X0 = -220;
  const walkK = clamp((t - 190.7) / (ARR - 190.7));
  const x = lerp(X0, X1, 1 - Math.pow(1 - walkK, 1.6));
  const stride = 2 * Math.PI / (610 * .66);
  const amp = 1 - ss(ARR - .35, ARR + .05, t);
  const pose = POSE.walk((x - X0) * stride, amp);
  const M = rootM(x, 905, .66, 1, CAST.her, pose);
  // worry on "rent's": both hands to her chest; relief as the figure goes; she looks up after the bird
  const worry = ss(T.rents - .25, T.rents + .1, t) * (1 - ss(T.incr + .3, T.peel + .2, t));
  const chestN = M.transformPoint(new DOMPoint(110, -600)), chestF = M.transformPoint(new DOMPoint(90, -620));
  const restN = M.transformPoint(new DOMPoint(30, -390)), restF = M.transformPoint(new DOMPoint(-20, -390));
  if (amp < .01) {
    const watch = ss(T.fly, T.fly + .5, t);
    const upP = M.transformPoint(new DOMPoint(260, -1120));
    const PN = mixP(mixP(restN, chestN, worry), upP, watch * .9);
    const PF = mixP(restF, chestF, worry);
    pose.arms = [ik(M, true, PN), ik(M, false, PF)];
    if (watch > 0) pose.arms[0][1] += Math.sin((t - T.fly) * 12) * .25 * watch;
    // she looks up at the fanlight as it lights, a little nod on each pane
    const nod = PANE_AT.reduce((a, at) => a + bump(t, at, .3), 0) * .04;
    pose.head = lerp(.14 * ss(193.4, 194.4, t) + nod, .45, ss(T.fly, T.fly + .6, t)) - .1 * worry;
    pose.laugh = watch * .5;
    pose.bob = Math.sin((t - ARR) * 1.6) * 3 * ss(ARR, ARR + 1, t);   // a breath
  }
  puppet(x, 905, .66, 1, CAST.her, pose);
  g.restore();
}, { xin: .7, tr: 'wipe' });

// ---- 12b: close on the side seam of her skirt ----
// Three gores meet at two seams; the right seam (S2) is torn. Coordinates before the sway shear.
const S1 = (y) => 560 - (y - 500) * .12;
const S2 = (y) => 1000 + (y - 500) * .06;
const S3 = (y) => 1580 + (y - 500) * .2;
const EDGE = (y) => 300 - (y - 500) * .3;          // the skirt's left outline against the wall
const HEM = (x) => 1028 + 46 * Math.sqrt(Math.abs(Math.sin(Math.PI * x / 118)));
const TEAR = { y0: 455, y1: 885 };                  // 430 px: 40% of the frame height
// one X per beat from "torn": the "/" on the off-beat, the "\" on the beat
const XS = [0, 1, 2, 3].map((i) => {
  const b = BT(29.5 + i); return { a: b, b: b + .193, y: lerp(TEAR.y1 - 52, TEAR.y0 + 52, i / 3) };
});
const BLOOMS = [36, 37, 38, 39, 40, 41].map((n, i) => ({ at: BT(n), y: lerp(TEAR.y1 - 20, TEAR.y0 + 10, i / 5), side: i % 2 ? 1 : -1, r: 50 - i * 2 }));
function gore(xl, xr, overlapR) {
  // a panel between two seam functions, down to the scalloped hem (x sampled across)
  const pts = []; const yT = -120, yB = 1100;
  pts.push([xl(yT), yT], [xr(yT) + overlapR, yT]);
  pts.push([xr(yB) + overlapR, 1040]);
  const x0 = xl(1040), x1 = xr(1040) + overlapR, n = Math.ceil((x1 - x0) / 10);
  for (let i = 0; i <= n; i++) { const x = lerp(x1, x0, i / n); pts.push([x, HEM(x)]); }
  pts.push([x0, 1040]);
  return poly(pts);
}
// even eyelets: centred in each gore, one even row of big and one of small
function eyelets(p, xl, xr) {
  for (const [y, r, sp, off] of [[972, 17, 98, 0], [918, 7, 98, 49]]) {
    const a = xl(y) + 34, b = xr(y) - 34, n = Math.floor((b - a - off) / sp);
    if (n < 0) continue;
    const s0 = a + off + ((b - a - off) - n * sp) / 2;
    for (let i = 0; i <= n; i++) { const x = s0 + i * sp; p.moveTo(x + r, y); p.arc(x, y, r, 0, Math.PI * 2); }
  }
}
function tearPath(openAt) {
  const N = 18, L = [], R = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N, y = lerp(TEAR.y1, TEAR.y0, u), sx = S2(y);
    const w = Math.pow(Math.sin(u * Math.PI), .8) * 40 * openAt(y) + .2;
    const j = (hash(i * 3.1) - .5) * 16 * Math.min(1, w / 12);
    L.push([sx - w + j, y + (hash(i * 5.3) - .5) * 8]); R.push([sx + w * .85 + j * .6, y + (hash(i * 7.7) - .5) * 8]);
  }
  return poly(L.concat(R.reverse()));
}

SHOT(T.cut, T.end, 'rent-seam', (t) => {
  sheet(P.wall);
  { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, 'rgba(30,22,52,.35)'); gr.addColorStop(1, 'rgba(30,22,52,0)');
    g.save(); g.fillStyle = gr; g.fillRect(-10, -10, W + 20, H + 20); g.restore(); }
  // the skirt breathes; after the flowers, a swing of joy on the beats (a shear about the waist, off the top)
  const twirl = ss(BT(37) - .2, BT(38), t);
  const sway = Math.sin(t * 2.2) * 8 + Math.sin((t - BT(37)) * Math.PI / .772) * 34 * twirl;
  const shear = sway / 1100;
  g.save(); g.transform(1, 0, shear, 1, 120 * shear, 0);

  // lining (cream) only ever shows through the tear; the gores on top
  const pA = gore(EDGE, S1, 26), pB = gore(S1, S2, 26), pC = gore(S2, S3, 26), pD = gore(S3, () => 2300, 0);
  eyelets(pA, EDGE, S1); eyelets(pB, S1, S2); eyelets(pC, S2, S3); eyelets(pD, S3, () => W + 300);
  // one navy paper, the gores turned to the light by different amounts (a lit middle gore, a shaded far one)
  cut(pA, '#18224a', { sh: 1, lift: .6, grain: .3, rule: 'evenodd' });
  // a soft fold in the near gore: a darker paper wedge
  cut(poly([[S1(-120) - 150, -120], [S1(-120) - 110, -120], [S1(1040) - 40, 1040], [S1(1040) - 190, 1040]]), C.ink, { sh: .4, grain: .2, alpha: .55 });
  cut(pB, '#25315f', { sh: 1, lift: .3, grain: .3, rule: 'evenodd' });
  cut(pD, '#212c5a', { sh: 1, lift: .3, grain: .3, rule: 'evenodd' });
  cut(pC, C.navy, { sh: 1.1, lift: .4, grain: .3, rule: 'evenodd' });

  // ---- the tear: a jagged hole along S2 showing the cream lining, closing from the bottom as it is stitched ----
  const closed = (y) => {           // 0 = still open, 1 = stitched shut at height y
    let c = 0; for (const s of XS) if (y >= s.y - 50) c = Math.max(c, ss(s.b - .02, s.b + .16, t));
    return c;
  };
  const tight = ss(T.seam - .05, T.seam + .15, t);
  const flutter = 1 + .12 * bump(t, T.skirt, .5);
  const openAt = (y) => (1 - closed(y) * .8) * (1 - tight) * flutter;
  if (tight < 1) {
    const tp = tearPath(openAt);
    g.save(); g.clip(tp);
    cut(rect(0, 0, W, H), P.lining, { sh: 0, grain: .3 });
    // the torn edges cast their shadow onto the lining
    const inv = new Path2D(); inv.addPath(rect(-200, -200, W + 400, H + 400)); inv.addPath(tp);
    cut(inv, C.navy, { sh: 1.1, lift: .2, grain: 0, rule: 'evenodd' });
    g.restore();
  }

  // ---- the gold cross-stitches: thick paper thread, the "/" then the "\" of each X on the beat ----
  const halfW = 46, halfH = 40;
  const pull = tight * .25;                           // on "seam" each X draws in a little
  const ends = [];
  for (const s of XS) {
    const cx = S2(s.y), hw = halfW * (1 - pull);
    const segs = [[{ x: cx - hw, y: s.y + halfH }, { x: cx + hw, y: s.y - halfH }, s.a], [{ x: cx - hw, y: s.y - halfH }, { x: cx + hw, y: s.y + halfH }, s.b]];
    for (const [a, b, at] of segs) {
      const k = eo(clamp((t - at) / .12)); if (k <= 0) continue;
      cut(strip(a, mixP(a, b, k), 15), C.gold, { sh: .6, lift: .1, grain: .2 });
      ends.push({ at, p: mixP(a, b, k) });
    }
  }
  // the needle: cream, long, an eye at the back; it rides the end of the stitch being made
  const nOn = ss(T.not2 - .1, T.not2 + .2, t) * (1 - ss(T.seam + .1, T.seam + .5, t));
  if (nOn > 0) {
    // the needle's point: arriving from the upper right on "not", then each stitch, then away on "seam"
    const evs = [];
    for (const s of XS) { const cx = S2(s.y); evs.push({ at: s.a, a: { x: cx - halfW, y: s.y + halfH }, b: { x: cx + halfW, y: s.y - halfH } });
      evs.push({ at: s.b, a: { x: cx - halfW, y: s.y - halfH }, b: { x: cx + halfW, y: s.y + halfH } }); }
    const home = { x: 1500, y: 260 };
    // th: the direction the point travels (the eye trails behind it)
    let tip = mixP({ x: 1980, y: -60 }, home, eo(ss(T.not2 - .1, T.not2 + .35, t))), th = Math.atan2(320, -480);
    for (let i = 0; i < evs.length; i++) {
      const e = evs[i], prevEnd = i ? evs[i - 1].b : home;
      if (t >= e.at - .16 && t < e.at) { tip = mixP(prevEnd, e.a, eio((t - (e.at - .16)) / .16)); th = Math.atan2(e.a.y - prevEnd.y, e.a.x - prevEnd.x); }
      else if (t >= e.at) { tip = mixP(e.a, e.b, eo(clamp((t - e.at) / .12))); th = Math.atan2(e.b.y - e.a.y, e.b.x - e.a.x); }
    }
    const last = evs[evs.length - 1].b;
    if (t > evs[evs.length - 1].at + .12) { const away = ss(T.seam - .05, T.seam + .4, t);
      tip = mixP(last, { x: last.x + 300, y: last.y - 560 }, eio(away)); th = Math.atan2(-560, 300); }
    const L = 190, eye = { x: tip.x - Math.cos(th) * (L - 18), y: tip.y - Math.sin(th) * (L - 18) };
    // the thread: from the newest stitch end to the needle's eye, a sagging gold band
    const from = ends.length ? ends[ends.length - 1].p : { x: 2100, y: -100 };
    const sag = 60 * (1 - tight);
    const pts = []; for (let i = 0; i <= 16; i++) { const u = i / 16; pts.push({ x: lerp(from.x, eye.x, u), y: lerp(from.y, eye.y, u) + Math.sin(u * Math.PI) * sag }); }
    g.save(); g.globalAlpha *= nOn; cut(band(pts, 9), C.gold, { sh: .5, lift: .3, grain: .15 });
    g.translate(tip.x, tip.y); g.rotate(th);
    const nd = new Path2D(); nd.moveTo(0, 0); nd.quadraticCurveTo(-L * .45, 9, -L, 7); nd.arc(-L, 0, 7, Math.PI / 2, Math.PI * 1.5); nd.quadraticCurveTo(-L * .45, -9, 0, 0);
    nd.moveTo(-L + 31, 0); nd.ellipse(-L + 18, 0, 13, 2.6, 0, 0, Math.PI * 2);
    cut(nd, C.white, { sh: .8, lift: .6, grain: 0, rule: 'evenodd' });
    g.restore();
  }
  // on "seam": a glint where the thread pulls tight
  const gl = bump(t, T.seam, .6);
  if (gl > 0) cut(star4(S2(TEAR.y0) + 34, TEAR.y0 - 30, 46 * gl), C.goldPale, { sh: .2, grain: 0 });

  // ---- flowers bloom along the mended seam on the beats ----
  for (const b of BLOOMS) {
    const k = pop(t, b.at, .5); if (k <= 0) continue;
    const x = S2(b.y) + b.side * 40;
    g.save(); g.translate(x, b.y); g.scale(k, k);
    for (const sd of [-1, 1]) { g.save(); g.rotate(sd * .9 + b.side * .3); cut(ellipse(0, 58, 17, 36), C.leaf, { sh: .5, grain: .2 }); g.restore(); }
    flower(0, 0, b.r, C.cream, C.gold, b.at * 1.7);
    g.restore();
  }
  g.restore();
}, { xin: .3, tr: 'rise' });
})();
