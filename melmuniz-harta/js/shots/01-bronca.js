// 01-bronca (25.0-36.4) "Harta de tu bronca. / ¿De veras no lo ves? / Estoy cansada,"
// Shot 1 (25.0-33.1): the big close profile (In Her Dream 04-sky framing) on grey-blue, the storm cloud
// upper left above her head. "Harta": she tosses her nose up and pulls her head away from the cloud, eye
// shut tight (hmph), and the cloud shrinks a little. "bronca": the cloud jolts and cracks out red-grey
// lightning shards that rain down past the back of her head. "veras": a pair of round paper spectacles
// flips down in front of the cloud; "ves": the lenses fog grey. It doesn't see.
// Shot 2 (33.1-36.4): an iris opens out of the fogged lens onto her full figure at a kitchen table at
// night (grey-blue paper, one pendant lamp). "Estoy": a big sigh, chin propped on her hand. "cansada":
// her head sinks onto her folded arms in three tired steps; the crescent moon in the window droops.
// 02-todos continues in this kitchen from the last frame (set geometry below, keep it in step).
(() => {
const T = {
  harta: 25.081, de: 27.53, tu: 27.98, bronca: 28.244, bEnd: 29.064,
  qDe: 31.02, veras: 31.3, no: 31.8, lo: 32.38, ves: 32.5, vEnd: 33.108,
  estoy: 33.48, cansada: 34.99, cEnd: 35.91,
};
// ---------- small local helpers ----------
const hx = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mix = (a, b, k) => { k = clamp(k); const A = hx(a), B = hx(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], k))).join(',')})`; };
const keys = (t, ks) => {             // piecewise eased keyframes: ks = [[t, value], ...] (value: number or array)
  if (t <= ks[0][0]) return ks[0][1];
  for (let i = 1; i < ks.length; i++) if (t < ks[i][0]) {
    const [t0, a] = ks[i - 1], [t1, b] = ks[i]; const e = eio((t - t0) / (t1 - t0));
    return Array.isArray(a) ? a.map((v, j) => lerp(v, b[j], e)) : lerp(a, b, e);
  }
  return ks[ks.length - 1][1];
};

// ---------- the storm cloud (la bronca): grey-violet paper, no face ----------
// Copied from 00-intro (its LOBES / cloudPath / stormCloud, all lobes grown) so the seam at 25.0 matches.
const CL = { dark: '#4a4458', mid: '#5c566b', hi: '#6b6478', shard: '#8e3b3b', shardBack: '#6b6478' };
const CX = 600, CY = 215, CS0 = .9;    // where 00 leaves it at 25.0 (centre, scale)
const LOBES = [
  [-90, -60, 170], [80, -50, 160], [0, 20, 150], [-220, 0, 130], [220, 10, 130],
  [-330, 30, 100], [330, 30, 100], [-150, -150, 120], [150, -140, 120],
  [-420, 60, 80], [420, 55, 85], [0, -190, 110], [-280, -90, 110],
  [410, -40, 105], [-470, 50, 85], [270, -170, 115], [-330, -170, 105],
  [60, -265, 115], [470, 45, 80], [-200, -260, 95],
];
function cloudPath(t, grow = 0, dy = 0) {
  const p = new Path2D();
  LOBES.forEach(([x, y, r], i) => {
    const cx = x + Math.sin(t * .55 + i * 1.7) * 7, cy = y + Math.cos(t * .5 + i * 2.3) * 5 + dy;
    const rr = r + grow; p.moveTo(cx + rr, cy); p.arc(cx, cy, Math.max(.1, rr), 0, Math.PI * 2);
  });
  return p;
}
function stormCloud(t) {
  let x0 = -230, x1 = 230;
  LOBES.forEach(([x, y, r]) => { if (y > -20) { x0 = Math.min(x0, x - r * .8); x1 = Math.max(x1, x + r * .8); } });
  const slab = rrect(x0 + 20, 22, x1 - x0 - 40, 100, 50);
  const bk = cloudPath(t, 14, 10); bk.addPath(slab);
  cut(bk, CL.dark, { sh: 1.1, lift: 1.2, grain: .28 });
  g.save(); g.beginPath(); g.rect(-900, -700, 1800, 700 + 58); g.clip();
  cut(cloudPath(t, 0, -6), CL.mid, { sh: .5, lift: .3, grain: .26 });
  g.restore();
  const n = Math.max(3, Math.round((x1 - x0) / 120)); const under = new Path2D();
  for (let i = 0; i < n; i++) { const u = (i + .5) / n, bx = lerp(x0 + 50, x1 - 50, u) + Math.sin(t * .6 + i * 2.1) * 5, by = 92 + (i % 2) * 10, br = 58 + hash(i * 4.7) * 18;
    under.moveTo(bx + br, by); under.arc(bx, by, br, 0, Math.PI * 2); }
  cut(under, CL.dark, { sh: .7, lift: .3, grain: .26 });
}
// 00's world: pale sun, far town, two hills, dimmed by the storm
const TOWN = (() => { const p = new Path2D(); let x = 40;
  const hs = [[110, 120], [80, 170], [130, 110], [90, 200], [120, 140], [70, 120], [140, 180], [100, 130]];
  hs.forEach(([w, h], i) => { const y = 905; p.moveTo(x, y); p.lineTo(x, y - h); p.lineTo(x + w / 2, y - h - w * .42); p.lineTo(x + w, y - h); p.lineTo(x + w, y); p.closePath();
    if (i % 3 === 1) p.rect(x + w * .66, y - h - w * .42, 16, 46);
    x += w + 8 + hash(i * 3.3) * 30; });
  return p; })();
const hillPath = (y, amp, ph) => { const p = new Path2D(); p.moveTo(-20, H + 20); p.lineTo(-20, y);
  for (let x = 0; x <= W + 40; x += 40) p.lineTo(x, y + Math.sin(x / 260 + ph) * amp); p.lineTo(W + 40, H + 20); p.closePath(); return p; };
const HILL_BACK = hillPath(905, 24, 1.2), HILL_FRONT = hillPath(975, 18, 3.4);
// one lightning shard: the zigzag bolt every kid knows, cut from red-grey paper, length L
function boltPath(L, seed) {
  const j = (i) => (hash(seed * 13 + i) - .5) * .06;
  return poly([[-.17 + j(1), 0], [.2 + j(2), 0], [.05 + j(3), .38], [.25 + j(4), .38 + j(5)], [-.12 + j(6), 1],
    [-.01 + j(7), .56], [-.22 + j(8), .56 + j(9)]].map(([x, y]) => [x * L, y * L]));
}
// [start (s after "bronca"), x where it breaks out, length, tilt, fall speed]
const SHARDS = [
  [0, 390, 330, .2, 1350], [.1, 650, 300, .12, 1500], [.2, 230, 280, .26, 1300],
  [.36, 520, 320, .16, 1450], [.5, 760, 250, .08, 1350], [.62, 330, 270, .22, 1500],
].map(([d, x, L, tilt, v], i) => ({ d, x, L, tilt, v, path: boltPath(L, i + 1) }));
function shards(t) {
  for (const s of SHARDS) {
    const d = t - T.bronca - s.d; if (d < 0 || d > 1.2) continue;
    const y0 = CY + 70, pk = clamp(back(d / .16), 0, 1.15);          // cracks out of the cloud's underside
    const fall = d > .12 ? (d - .12) * s.v + (d - .12) * (d - .12) * 700 : 0;
    g.save(); g.translate(s.x + fall * Math.sin(s.tilt), y0 + fall); g.rotate(-s.tilt * .7); g.scale(pk, pk);
    g.save(); g.translate(8, 10); cut(s.path, CL.shardBack, { sh: .5, grain: .2 }); g.restore();
    cut(s.path, CL.shard, { sh: .6, lift: .5, grain: .22 });
    g.restore();
  }
}
// the cracks across the cloud's underside on "bronca" (the shards break out of them), in cloud units
function cracks(t) {
  const k = bump(t, T.bronca - .04, .55); if (k <= 0) return;
  g.save(); g.globalAlpha *= clamp(k * 2.2); g.strokeStyle = CL.shard; g.lineWidth = 11; g.lineJoin = 'miter'; g.lineCap = 'round';
  [[-420, -120], [-80, 160], [190, 420]].forEach(([x0, x1], j) => {
    g.beginPath(); for (let i = 0; i <= 6; i++) { const u = i / 6; const x = lerp(x0, x1, u), y = 70 + (i % 2 ? 30 : -6) + hash(j * 9 + i) * 14; i ? g.lineTo(x, y) : g.moveTo(x, y); }
    g.stroke();
  });
  g.restore();
}

// ---------- the spectacles (the cloud doesn't see) ----------
const GL = { lx: 512, rx: 690, y: 206, r: 72, lens: '#c4dbe8', fog: '#8f97a9', rim: C.cream };
function spectacles(t) {
  const inK = eo((t - (T.qDe - .5)) / .45);                       // slide down from above, folded edge-on
  if (inK <= 0) return;
  const flip = t < T.veras ? .07 : clamp(back((t - T.veras) / .38), .07, 1.2);
  const fog = ss(T.ves - .02, T.ves + .42, t);
  const hingeY = GL.y - GL.r - 10, cx = (GL.lx + GL.rx) / 2;
  g.save(); g.translate(0, (1 - inK) * -360);
  g.translate(cx, hingeY); g.scale(1, flip); g.translate(-cx, -hingeY);
  for (const x of [GL.lx, GL.rx]) {
    const lens = circle(x, GL.y, GL.r);
    cut(lens, mix(GL.lens, GL.fog, fog), { sh: .2, grain: .3 });
    if (fog > 0) {          // fog rolls up inside the lens
      g.save(); g.clip(lens);
      for (let i = 0; i < 4; i++) {
        const fy = GL.y + GL.r + 40 - fog * (GL.r * 2.3) + i * 24, fx = x - 52 + i * 34;
        cut(cloud(fx, fy, 120, 86, i * 3 + (x > 600 ? 9 : 0)), mix('#a3aaba', '#c1c6d1', i / 3), { sh: .3, grain: .25, alpha: clamp(fog * 1.5) });
      }
      g.restore();
    }
    if (fog < 1) {          // the glint, gone in the fog
      g.save(); g.globalAlpha *= (1 - fog) * .9; g.strokeStyle = C.white; g.lineCap = 'round'; g.lineWidth = 9;
      g.beginPath(); g.moveTo(x - 38, GL.y - 4); g.lineTo(x - 12, GL.y - 34); g.stroke();
      g.lineWidth = 6; g.beginPath(); g.moveTo(x - 30, GL.y + 18); g.lineTo(x - 2, GL.y - 14); g.stroke();
      g.restore();
    }
    const ring = new Path2D(); ring.arc(x, GL.y, GL.r + 15, 0, Math.PI * 2); ring.moveTo(x + GL.r, GL.y); ring.arc(x, GL.y, GL.r, 0, Math.PI * 2, true);
    cut(ring, GL.rim, { sh: .8, lift: .4, grain: .2, rule: 'evenodd' });
  }
  const br = new Path2D(); br.moveTo(GL.lx + GL.r + 8, GL.y - 14); br.quadraticCurveTo(cx, GL.y - 46, GL.rx - GL.r - 8, GL.y - 14);
  br.lineTo(GL.rx - GL.r - 8, GL.y - 2); br.quadraticCurveTo(cx, GL.y - 30, GL.lx + GL.r + 8, GL.y - 2); br.closePath();
  cut(br, GL.rim, { sh: .6, grain: .15 });
  cut(rrect(GL.lx - GL.r - 40, GL.y - 22, 34, 16, 6), GL.rim, { sh: .5, grain: .15 });
  cut(rrect(GL.rx + GL.r + 6, GL.y - 22, 34, 16, 6), GL.rim, { sh: .5, grain: .15 });
  g.restore();
  // puffs of fog breathing off the lenses on "ves"
  for (let i = 0; i < 5; i++) {
    const d = t - T.ves - .1 - i * .07; if (d < 0 || d > 1.2) continue;
    const k = d / 1.2, x = (i % 2 ? GL.rx : GL.lx) + (hash(i * 3) - .5) * 80, y = GL.y - 50 - k * 110;
    cut(cloud(x + (i % 2 ? 1 : -1) * k * 60, y, 50 + k * 50, 34 + k * 30, i * 5), '#c1c6d1', { sh: .3, grain: .2, alpha: (1 - k) * .9 });
  }
}

// ---------- her big close profile (04-sky's transform), in 00's dimmed world ----------
SHOT(25.0, 33.1, '01-bronca-profile', (t) => {
  const A0 = g.globalAlpha;
  const zoom = 1.26, hx0 = 470 + jit(t, 3), hy0 = -150 + jit(t, 4);
  sheet(C.w3);
  g.save(); g.translate(hx0, hy0); g.scale(zoom, zoom);
  cut(circle(470, 470, 438), '#c3c8d3', { sh: .4, grain: .25 });
  cut(circle(470, 470, 404), C.w4, { sh: .5, grain: .25 });
  g.restore();
  cut(TOWN, C.w2, { sh: .5, grain: .2 });
  cut(HILL_BACK, C.w2, { sh: .6 });
  cut(HILL_FRONT, C.w1, { sh: .7, lift: .2 });
  sheet(C.w0, .42);
  { g.save(); g.globalAlpha *= .55; const sg = g.createRadialGradient(640, 120, 80, 640, 120, 1100);
    sg.addColorStop(0, 'rgba(26,24,40,.85)'); sg.addColorStop(1, 'rgba(26,24,40,0)'); g.fillStyle = sg; g.fillRect(0, 0, W, H); g.restore(); }
  // a lightning flash: the paper pales for an instant, soft, never white
  const flash = bump(t, T.bronca - .02, .25) + bump(t, T.bronca + .34, .18) * .6;
  if (flash > 0) sheet(C.w4, flash * .32);

  // the shards fall behind her head, past the back of it
  shards(t);

  // her: "Harta" = nose up and head pulled away to the right, eye squeezed shut; eases back by the question
  const toss = clamp(back((t - T.harta + .04) / .32), 0, 1.15) * (1 - ss(29.9, 30.9, t));     // a snappy hmph
  const flinch = bump(t, T.bronca + .02, .45);
  const ask = ss(T.veras - .2, T.veras + .4, t) * (1 - ss(T.ves + .4, T.vEnd + .2, t));
  const tilt = -.13 * toss + .03 * flinch - .035 * ask;
  const ox = hx0 + 70 * toss - 16 * ask, oy = hy0 - 22 * toss + 10 * flinch;
  const toHer = () => { g.translate(ox, oy); g.scale(zoom, zoom); g.translate(560, 900); g.rotate(tilt); g.translate(-560, -900); };
  g.save(); toHer(); cut(HEADS.her, C.navy, { sh: 1.2, lift: 1, grain: .3 }); g.restore();
  g.save(); toHer(); g.strokeStyle = C.w3; g.globalAlpha *= .85; g.lineCap = 'round';
  if (toss > .5) { g.lineWidth = 8; g.beginPath(); g.moveTo(684, 448); g.quadraticCurveTo(704, 460, 726, 448); g.stroke();
    g.lineWidth = 5; g.beginPath(); g.moveTo(684, 440); g.lineTo(672, 430); g.stroke(); }          // squeezed shut, a crease at the corner
  else { g.lineWidth = 5; g.beginPath(); g.arc(706, 452, 14, Math.PI * .12, Math.PI * .88); g.stroke(); }
  g.restore();

  // the cloud, in front of the back of her head (as 00 leaves it): it shrinks a little on "Harta",
  // swells on "de tu", and jolts on "bronca" as the cracks open
  const shrink = lerp(1, .9, eo((t - T.harta - .1) / .45)) * (1 - bump(t, T.harta + .05, .3) * .05);
  const swell = bump(t, T.de - .05, .4) * .03 + bump(t, T.tu - .05, .4) * .04 + bump(t, T.bronca - .08, .5) * .07;
  const jolt = bump(t, T.bronca - .05, .7);
  const cs = CS0 * (shrink + swell);
  g.save(); g.translate(CX + jolt * jit(t, 12, 8), CY + Math.sin(t * .7) * 4 + jolt * jit(t, 14, 6)); g.scale(cs, cs);
  stormCloud(t); cracks(t);
  g.restore();
  spectacles(t);
  g.globalAlpha = A0;
}, { xin: .2, tr: 'fade' });

// ---------- the kitchen (set geometry: 02-todos copies this block) ----------
// World units, then one fixed camera: g.translate(W/2, H/2); g.scale(KZ, KZ); g.translate(-KFX, -KFY).
// Floor (world 1000) lands at screen y ~885, above the caption strip.
const KZ = 1.2, KFX = 803, KFY = 712.5;
const S = .78;                 // puppet scale (same as In Her Dream 01-kitchen)
const FLOOR = 1000;
const HX = 700, HY = FLOOR - 270 * S;        // her hip pivot (seated)
const TY = 738, TB = 72;       // table front edge, depth of the top band (naive perspective)
const TX0 = 796, TX1 = 2600;   // table runs out of frame on the right
const LX = 1060, LSY = 330;    // pendant lamp: x, shade top
const WIN = { x: 110, y: 300, w: 300, h: 300 };   // the window (night, the moon)
const KCOL = { wall: C.w2, floor: C.w1, table: C.w0, top: C.w4, cloth: C.w3, chair: C.w0, frame: C.w3, night: C.w0, moon: C.creamDeep };

// her seated body, in hip-local units (hips at 0,0; puppet units, y up is negative). From In Her Dream 01.
const BODICE = blob([[0, -806], [-24, -804], [-50, -790], [-62, -768], [-64, -730], [-62, -680], [-52, -620], [-46, -580],
  [-60, -540], [-48, -510], [36, -510], [56, -545], [44, -580], [52, -630], [70, -676], [68, -712], [56, -750], [40, -784], [22, -804]]
  .map(([x, y]) => [x, y + 540]), .45);
const LAP = blob([[-52, -74], [10, -78], [70, -58], [160, -44], [262, -40], [300, -6], [304, 80], [300, 158], [262, 168], [214, 162],
  [150, 96], [60, 64], [-30, 54], [-60, 18]], .5);
function sitter(x, y, s, col, p, layer) {
  g.save(); g.translate(x, y); g.scale(s, s);
  if (layer !== 'front') {
    g.save(); g.translate(-8, 0); leg(1.5, 1.42, col, null, false); g.restore();
    g.save(); g.translate(8, 0); leg(1.56, 1.5, col, null, false); g.restore();
    if (!p.farFront) { g.save(); g.rotate(p.lean); g.translate(-8, -212); arm(p.far[0], p.far[1], col); g.restore(); }
    cut(LAP, col, { sh: .6, grain: .26, lift: .2 });
    g.save(); g.rotate(p.lean); cut(BODICE, col, { sh: .6, grain: .26, lift: .2 }); g.restore();
  }
  if (layer !== 'back') {
    g.save(); g.rotate(p.lean);
    if (p.farFront) { g.save(); g.translate(-8, -212); arm(p.far[0], p.far[1], col); g.restore(); }
    g.save(); g.translate(10, -250); head('her', null, col, .265, p.head || 0, 0); g.restore();
    g.translate(8, -212); arm(p.near[0], p.near[1], col);
    g.restore();
  }
  g.restore();
}
function chair(col) {
  const x = HX, y = HY + 22;
  cut(cutRect(x - 96, y - 250, 18, 250 + FLOOR - y, 41, 1.5), col, { sh: .6 });
  cut(cutRect(x - 96, y - 250, 60, 16, 42, 1.5), col, { sh: .5 });
  cut(cutRect(x - 96, y - 150, 50, 12, 43, 1.5), col, { sh: .5 });
  cut(cutRect(x + 70, y, 16, FLOOR - y, 44, 1.5), col, { sh: .6 });
  cut(cutRect(x - 100, y - 8, 190, 18, 45, 1.5), col, { sh: .7 });
}
// the wall, floor and window; droop 0..1 tips the crescent moon over and lets it sag
function room(droop) {
  g.save(); g.fillStyle = KCOL.wall; g.fillRect(-3000, -3000, 9000, 9000); g.restore();
  cut(cutRect(-3000, FLOOR, 9000, 2000, 5, 3), KCOL.floor, { sh: .5 });
  cut(cutRect(-3000, FLOOR - 16, 9000, 18, 6, 2), C.w0, { sh: .4, grain: .15 });
  const { x: wx, y: wy, w: ww, h: wh } = WIN;
  cut(cutRect(wx - 24, wy - 24, ww + 48, wh + 48, 21, 2), KCOL.frame, { sh: .8, lift: .2 });
  cut(cutRect(wx, wy, ww, wh, 22, 1.5), KCOL.night, { sh: 0, grain: .3 });
  g.save(); g.clip(rect(wx, wy, ww, wh));
  for (let i = 0; i < 6; i++) cut(star4(wx + 30 + hash(i * 3.7) * 250, wy + 30 + hash(i * 8.1) * 280, 5 + hash(i) * 4), C.w3, { sh: 0, grain: 0 });
  // the moon, in the right pane: a crescent, tips to the left and awake, then it tips over (tips down)
  // and sags low in the pane like a sleepy head
  const mx = wx + ww * .75 + 4 - droop * 8, my = wy + 92 + droop * 78;
  cut(crescent(mx, my, 52, .25, lerp(.12, -1.25, droop)), KCOL.moon, { sh: .5, grain: .15, lift: .2 });
  g.restore();
  cut(rect(wx + ww / 2 - 8, wy, 16, wh), KCOL.frame, { sh: .5, grain: .12 });
  cut(cutRect(wx - 40, wy + wh + 18, ww + 80, 22, 23, 2), KCOL.frame, { sh: .7, lift: .2 });
}
// the pendant lamp and its warm light (on the wall behind, and a cone onto the table)
function lamp(t, glow) {
  const A0 = g.globalAlpha, GY = LSY + 150;
  g.save(); g.globalAlpha = A0 * .5 * glow;
  const gr = g.createRadialGradient(LX, GY, 20, LX, GY, 340);
  gr.addColorStop(0, 'rgba(243,217,160,.85)'); gr.addColorStop(.55, 'rgba(243,217,160,.3)'); gr.addColorStop(1, 'rgba(243,217,160,0)');
  g.fillStyle = gr; g.fill(circle(LX, GY, 340)); g.restore();
  g.save();
  g.translate(LX, -60); g.rotate(Math.sin(t * .9) * .012); g.translate(-LX, 60);
  cut(cutRect(LX - 3, -200, 6, LSY + 200, 31, .8), C.w0, { sh: .4, grain: 0 });
  cut(poly([[LX - 32, LSY], [LX + 32, LSY], [LX + 100, LSY + 76], [LX - 100, LSY + 76]]), C.w0, { sh: .9, lift: .4 });
  cut(ellipse(LX, LSY + 78, 34, 14), C.lamp, { sh: 0, grain: .1 });
  g.restore();
  g.save(); g.globalAlpha = A0 * .24 * glow;
  const cg = g.createLinearGradient(0, LSY + 78, 0, TY);
  cg.addColorStop(0, 'rgba(243,217,160,.95)'); cg.addColorStop(1, 'rgba(243,217,160,.3)');
  g.fillStyle = cg; g.fill(poly([[LX - 92, LSY + 76], [LX + 92, LSY + 76], [LX + 300, TY], [LX - 300, TY - TB * .2]])); g.restore();
}
function kTable() {
  cut(cutRect(TX0 + 40, TY, 30, FLOOR - TY, 51), KCOL.table, { sh: .5 });
  cut(poly([[TX0 + 30, TY - TB], [TX1, TY - TB], [TX1, TY], [TX0, TY]]), KCOL.top, { sh: .5, grain: .2 });
  cut(cutRect(TX0 - 6, TY - 2, TX1 - TX0, 118, 52, 1.5), KCOL.cloth, { sh: .8, lift: .3 });
}
// her poses: [time, lean, head, [nearSh, nearEl], [farSh, farEl]]
// PROP: elbow on the table, cheek on her hand. DOZE: forearms folded on the table top, head down on them
// (In Her Dream's settled doze pose). "cansada" sinks her in three steps, one per syllable.
const PROP = { lean: .2, head: -.3, near: [.92, 2.62], far: [1.0, .62] };
const SIGH = { lean: .08, head: -.2, near: [.86, 2.56], far: [.95, .6] };
const DOZE = { lean: .66, head: -.85, near: [2.0, 3.15], far: [2.2, 2.9 - Math.PI * 2] };
const P = (o) => [o.lean, o.head, o.near, o.far];
const mid = (a, b, k) => a.map((v, i) => Array.isArray(v) ? v.map((w, j) => lerp(w, b[i][j], k)) : lerp(v, b[i], k));
const S1 = mid(P(PROP), P(DOZE), .4), S2 = mid(P(PROP), P(DOZE), .62);
S1[2] = mid(P(PROP), P(DOZE), .85)[2];  // step 1: the propping arm folds down onto the table first
S1[3] = P(PROP)[3];                     // the far arm stays down until the last step
S2[2] = P(DOZE)[2]; S2[3] = P(PROP)[3];
const KPOSE = [
  [33.1, ...P(PROP)], [T.estoy, ...P(PROP)], [T.estoy + .35, ...P(SIGH)], [T.estoy + 1.0, ...P(PROP)],
  [T.cansada - .05, ...mid(P(PROP), P(DOZE), .08)],
  [T.cansada + .22, ...S1], [T.cansada + .3, ...S1],
  [T.cansada + .52, ...S2], [T.cansada + .6, ...S2],
  [T.cansada + .95, ...P(DOZE)],
];
function kPose(t) {
  let i = KPOSE.length - 1; for (let k = 1; k < KPOSE.length; k++) if (t < KPOSE[k][0]) { i = k - 1; break; }
  const A = KPOSE[i], B = KPOSE[Math.min(i + 1, KPOSE.length - 1)];
  const e = A === B ? 1 : eio((t - A[0]) / (B[0] - A[0]));
  const v = mid(A.slice(1), B.slice(1), e);
  // she breathes once she is down
  const br = Math.sin((t - (T.cansada + .95)) * Math.PI * 2 / 3.6) * .014 * ss(T.cansada + .95, T.cansada + 1.4, t);
  return { lean: v[0] + br, head: v[1] - br * 1.1, near: [v[2][0] - br * .9, v[2][1]], far: [v[3][0] - br * .9, v[3][1]] };
}

SHOT(33.1, 36.4, '01-bronca-kitchen', (tt, k, d, t) => {
  const A0 = g.globalAlpha;
  // the iris (main.js) opens out of the fogged right lens; draw the cream rim riding its edge
  const irisK = eio(clamp((t - 33.1) / .6));
  g.save(); g.translate(W / 2, H / 2); g.scale(KZ, KZ); g.translate(-KFX, -KFY);
  const droop = keys(tt, [[T.cansada + .1, 0], [T.cansada + .45, .45], [T.cansada + .8, 1]]);
  room(droop);
  lamp(tt, 1);
  const p = kPose(tt);
  const farFront = tt > T.cansada + .85;      // the far arm comes round in front only as it lands on the table
  chair(KCOL.chair);
  sitter(HX, HY, S, C.navy, { ...p, farFront }, 'back');
  kTable();
  cup(1330, TY - 26, 1.3, C.w3);
  sitter(HX, HY, S, C.navy, { ...p, farFront }, 'front');
  g.restore();
  if (irisK > 0 && irisK < 1 && irisK * 1300 > GL.r) {
    const r = irisK * 1300;    // the lens rim grows out of the real one
    const ring = new Path2D(); ring.arc(GL.rx, GL.y, r, 0, Math.PI * 2); ring.moveTo(GL.rx + r - 17, GL.y); ring.arc(GL.rx, GL.y, Math.max(.1, r - 17), 0, Math.PI * 2, true);
    cut(ring, GL.rim, { sh: .8, lift: .4, grain: .2, rule: 'evenodd' });
  }
  g.globalAlpha = A0;
}, { xin: .6, tr: 'iris', ix: GL.rx, iy: GL.y, smooth: false });
})();
