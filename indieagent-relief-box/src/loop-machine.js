// The living loop, the machines (draft 8, symmetric). All timing is periodic in LOOP (12 s) so the film loops
// without a seam. The picture is built about a centre line at x = 960: everything off the axis is made for the left
// half and drawn again mirrored (mirrored()), so the right half is its exact reflection, moving in mirror unison.
//
//   the funnel     one faceted octagonal funnel on the axis that feeds itself from both sides: what gathers in the
//                  top swirls down; a stem leaves the bottom and splits into two pipes that turn square corners (out,
//                  up past the lip, in, down) and drop back into the mouth. Eight small solids go round for ever (a lap
//                  every 6 s), turn and turn about down the left and right pipes; inside a pipe the pipe itself swells
//                  in a bulge that travels along it. The funnel glows faintly inside.
//   the consoles   a cabinet with a desk and an upright board of varied controls, worked by an operator seen from
//                  behind (no cable: Robin found it distracting). One each side.
//   the instruments three nested rings turning on different axes above a stepped plinth, a small solid hovering
//                  over them; once a loop each lets a cube go. One each side.

import { radial, glow } from '../vendor/paper-fox/core/piece.js';
import { mix, shade, rgba } from '../vendor/paper-fox/core/color.js';
import { drawSprites } from '../vendor/paper-fox/core/sprite.js';
import { along } from '../vendor/paper-fox/core/geom.js';
import { lerp, smoothstep, E } from '../vendor/paper-fox/core/ease.js';
import { PAL, CLAY_MAT, CLAY_EDGE, shadowBlur, clayForm, tube, tubeOutline, steps, dot } from './kit.js';
import { LOOP, cyc } from './loop-world.js';
import { drawSolid } from './loop-shapes.js';
import { MK, MK_RAMP, markLayer, paintMarkSolid, paintBurst, paintGlyph } from './loop-mark.js';

const P = PAL, TAU = Math.PI * 2;
const circle = (cx, cy, r, n = 36) => [...Array(n)].map((_, i) => [cx + Math.cos(i / n * TAU) * r, cy + Math.sin(i / n * TAU) * r]);
const mod = (x, m) => ((x % m) + m) % m;
// draw fn, then again reflected in the centre line
export const AXIS = 960;
export function mirrored(ctx, fn) { fn(); ctx.save(); ctx.translate(2 * AXIS, 0); ctx.scale(-1, 1); fn(); ctx.restore(); }
const plen = (pts) => pts.reduce((a, p, i) => i ? a + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0, 0);

// ---------------- the funnel ----------------
// An octagonal funnel cut in flat clay facets, each facet lit by how it turns to the light, with a collar at the
// rim and a band at the throat. The pipe is a thick rolled tube that runs straight and turns square corners with a
// small round fillet. DUCT is the left pipe: down from the throat, out, up past the lip, in, down into the mouth.
export const RIM = { x: AXIS, y: 372, rx: 190, ry: 46 };
// a hexagon (Robin: orange in the panels too, and six sides so the pipe's three colours go round it evenly)
const THROAT = { y: 642, rx: 26, ry: 6 }, SIDES = 6;
const FILLET = 34;
// a polyline through waypoints whose corners are rounded with a fillet of radius rc and straight between
function squarePath(way, rc = FILLET, step = 6) {
  const out = [way[0]];
  for (let i = 1; i < way.length - 1; i++) {
    const [p, c, n] = [way[i - 1], way[i], way[i + 1]];
    const din = [c[0] - p[0], c[1] - p[1]], dout = [n[0] - c[0], n[1] - c[1]], li = Math.hypot(...din), lo = Math.hypot(...dout);
    const r = Math.min(rc, li / 2, lo / 2), a = [c[0] - din[0] / li * r, c[1] - din[1] / li * r], e = [c[0] + dout[0] / lo * r, c[1] + dout[1] / lo * r];
    out.push(a);
    for (let k = 1; k < 8; k++) { const u = k / 8; out.push([(1 - u) ** 2 * a[0] + 2 * (1 - u) * u * c[0] + u * u * e[0], (1 - u) ** 2 * a[1] + 2 * (1 - u) * u * c[1] + u * u * e[1]]); }
    out.push(e);
  }
  out.push(way[way.length - 1]);
  // resample so things moving along it keep an even speed
  const res = [out[0]];
  for (let i = 1; i < out.length; i++) { const [p, q] = [out[i - 1], out[i]], n = Math.max(1, Math.ceil(Math.hypot(q[0] - p[0], q[1] - p[1]) / step)); for (let k = 1; k <= n; k++) res.push([p[0] + (q[0] - p[0]) * k / n, p[1] + (q[1] - p[1]) * k / n]); }
  return res;
}
export const DUCT = { w: 23, path: squarePath([[AXIS, 640], [AXIS, 800], [AXIS - 266, 800], [AXIS - 266, 226], [AXIS - 56, 226], [AXIS - 56, 300]]) };
const DUCT_LEN = plen(DUCT.path);
// arc length at each point of the pipe, and the colour rings along it (mint is the pipe itself; butter and pink
// rings are laid over it, every third ring each)
const ACC = DUCT.path.reduce((a, p, i) => { a.push(i ? a[i - 1] + Math.hypot(p[0] - DUCT.path[i - 1][0], p[1] - DUCT.path[i - 1][1]) : 0); return a; }, []);
// the pipe's rings: mint, butter and an apricot orange (Robin chose orange for the pipe rings only, 2026-10-25)
// Equal-length rings, a whole number of them along the pipe (Robin: "green yellow orange all the way around..
// equal length segments"), each cut at its exact arc length so neighbours butt with no sliver of the base between.
const RINGS_N = Math.round(DUCT_LEN / 42), RING = DUCT_LEN / RINGS_N, RING_COLS = [P.mint, P.butter, '#f6b27e'];
// the point at arc length s along the pipe
function pointAt(sArc, path = DUCT.path) {
  let i = 1; while (i < ACC.length - 1 && ACC[i] < sArc) i++;
  const k = (sArc - ACC[i - 1]) / Math.max(1e-6, ACC[i] - ACC[i - 1]), a = path[i - 1], b = path[i];
  return [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
}
// path: the pipe as drawn (turned with the frame); the rings stay at their arc lengths along it
function ringClip(c, w, path = DUCT.path) {
  const clip = new Path2D();
  for (let r = c, s0 = r * RING; r < RINGS_N; r += 3, s0 = r * RING) {
    const s1 = Math.min(DUCT_LEN, s0 + RING), a = Math.max(0, s0 - 0.5), b = Math.min(DUCT_LEN, s1 + 0.5);
    const seg = [pointAt(a, path), ...path.filter((_, i) => ACC[i] > a + 0.1 && ACC[i] < b - 0.1), pointAt(b, path)];
    if (seg.length < 2) continue;
    const o = tubeOutline(seg, w, { caps: false });
    clip.moveTo(o[0][0], o[0][1]); for (const q of o.slice(1)) clip.lineTo(q[0], q[1]); clip.closePath();
  }
  return clip;
}
// The fork (Robin: "I don't want to see this seam... it should just be a fork in the pipe"). The two pipes are the
// left pipe drawn twice, once mirrored, so their corners overlapped on the centre line in a seam. The junction is
// drawn once, unmirrored, over both: one straight crossbar running into both branches, the stem coming down into it
// with a rounded end, and the colour rings carried across by arc length along the pipe, the same on both sides.
const FORK = { half: 150, keep: 112, y: 800 };
const arcAt = (x, y) => { let b = 0, bd = Infinity; DUCT.path.forEach((p, i) => { const d = (p[0] - x) ** 2 + (p[1] - y) ** 2; if (d < bd) { bd = d; b = i; } }); return ACC[b]; };
// the colour of a ring at arc length s (mint, butter, pink in turn); the fork's rings: across the bar by the arc
// length of the matching point on the left pipe (so both sides agree), down the stem by its height
const ringOf = (sArc) => Math.min(RINGS_N - 1, Math.floor(sArc / RING)) % 3;
// sc: how much of its width the turning frame shows (the crossbar narrows as the frame turns edge-on)
const barClip = (c, w, sc = 1) => { const p = new Path2D(), a = Math.max(0.02, Math.abs(sc)); for (let x = AXIS - FORK.keep * a; x < AXIS + FORK.keep * a; x += 2) if (ringOf(arcAt(AXIS - Math.abs(x + 1 - AXIS) / a, FORK.y)) === c) p.rect(x, FORK.y - w - 8, 2.2, 2 * w + 16); return p; };
const stemClip = (c, w) => { const p = new Path2D(); for (let y = 640; y < FORK.y + w + 2; y += 2) if (ringOf(Math.min(y, FORK.y) - 640) === c) p.rect(AXIS - w - 8, y, 2 * w + 16, 2.2); return p; };
// the fork's box: inside it a passing bulge takes the fork's rings, outside the pipe's own
const forkBox = (sc = 1) => { const h = Math.max(42, FORK.keep * Math.abs(sc)); return [AXIS - h, 630, 2 * h, FORK.y + 60 - 630]; };
// a stretch of pipe swollen around s0: the same rolled tube, wider in a smooth bump, in the same colour rings
const BULGE = { sigma: 17, amp: 0.45 };
function drawBulge(ctx, s0, amp, clips, path = DUCT.path, sc = 1) {
  // drawn over a long stretch, but only the swollen middle is let through, so the cut ends of the stretch (where its
  // shading turns at the cut) never show; at the clip's edge the swell has already melted back into the pipe
  const span = BULGE.sigma * 5, keep = BULGE.sigma * 2.4, seg = [], ws = [], mid = [];
  path.forEach((p, i) => {
    const d = ACC[i] - s0;
    if (Math.abs(d) <= span) { seg.push(p); ws.push(DUCT.w * (1 + BULGE.amp * amp * Math.exp(-((d / BULGE.sigma) ** 2)))); }
    if (Math.abs(d) <= keep) mid.push(p);
  });
  if (seg.length < 3 || mid.length < 2) return;
  const win = new Path2D(), o0 = tubeOutline(mid, DUCT.w * (1 + BULGE.amp) + 10, { caps: false });
  win.moveTo(o0[0][0], o0[0][1]); for (const q of o0.slice(1)) win.lineTo(q[0], q[1]); win.closePath();
  const o = { shadow: false, caps: false, size: DUCT.w * 2 };
  // outside the fork's box the pipe's own colour rings, inside it the fork's (both symmetric, so a right-side bulge
  // drawn reflected lands on the same colours)
  const box = new Path2D(); box.rect(...forkBox(sc));
  const outside = new Path2D(); outside.rect(-4000, -4000, 9000, 9000); outside.addPath(box);
  for (const [region, rule, cl] of [[outside, 'evenodd', clips.ring], [box, 'nonzero', clips.fork]]) {
    ctx.save(); ctx.clip(win); ctx.clip(region, rule);
    tube(ctx, seg, ws, RING_COLS[0], o);
    for (let c = 1; c < 3; c++) { ctx.save(); ctx.clip(cl[c]); tube(ctx, seg, ws, RING_COLS[c], o); ctx.restore(); }
    ctx.restore();
  }
}
const SPOUT = DUCT.path[DUCT.path.length - 1];

// The funnel turns (Robin: "rotating the opposite direction the portal is... the panels alternating colours"): half a
// turn every 12 s against the portal's whole turn; three panels are half the hexagon, so its three-colour pattern
// comes round at the seam. ph is its turn.
const funnelTurn = (t) => -TAU * 0.5 * t / LOOP;
// The frame of pipes turns too, about the upright axis, the other way (Robin: "the whole outer frame of the funnel
// apparatus also spin, the other way from the funnel"): half a turn every 12 s. The frame is its own mirror image, so
// half a turn brings it back to itself. Each pipe is drawn along its turned path (so it keeps its thickness edge-on);
// the one swinging away passes behind the funnel, the one swinging toward us in front.
const frameTurn = (t) => TAU * 0.5 * t / LOOP;
const warp = (path, sc) => path.map(([x, y]) => [AXIS + (x - AXIS) * sc, y]);
const FACET_COLS = RING_COLS;   // mint, butter, orange, as the pipe; twice round the hexagon
const ring = (cy, rx, ry, k, ph = 0) => { const a = (k + 0.5) / SIDES * TAU + ph; return [RIM.x + Math.cos(a) * rx, cy + Math.sin(a) * ry]; };
const rimV = (k, ph) => ring(RIM.y, RIM.rx, RIM.ry, k, ph), thrV = (k, ph) => ring(THROAT.y, THROAT.rx, THROAT.ry, k, ph);
// facet tone: the facet's outward direction in plan is the angle of its middle; light comes from the upper left and
// stays put while the facets turn through it
const facetTone = (k, base, ph = 0) => { const a = (k + 1) / SIDES * TAU + ph, lit = -Math.cos(a) * 0.46 + Math.sin(a) * 0.2; return lit > 0 ? mix(base, '#fffaf0', lit * 0.5) : shade(base, lit * 0.32); };
// a point on the turned octagon (rx, ry) at angle th, for the collar's two halves
function octAt(cy, rx, ry, th, ph) {
  const u = mod((th - ph) / TAU * SIDES - 0.5, SIDES), k = Math.floor(u), f = u - k;
  const [a, b] = [ring(cy, rx, ry, k, ph), ring(cy, rx, ry, k + 1, ph)];
  return [lerp(a[0], b[0], f), lerp(a[1], b[1], f)];
}
// the collar's half from angle th0 to th1 (far half: PI..2PI, the top of the ellipse; near half: 0..PI)
const collar = (th0, th1, ph) => { const o = [], i = []; for (let q = 0; q <= 32; q++) { const th = lerp(th0, th1, q / 32); o.push(octAt(RIM.y, RIM.rx * 1.07, RIM.ry * 1.07, th, ph)); i.push(octAt(RIM.y, RIM.rx * 0.93, RIM.ry * 0.93, th, ph)); } return [...o, ...i.reverse()]; };

// one pipe along its (turned) path, drawn live
function drawPipe(g, path = DUCT.path) {
  // flat ends: the top one runs into the fork's stem, the bottom one under the egg-laying tip
  tube(g, path, DUCT.w, P.mint, { caps: false });
  // rings of colour along the pipe: the whole pipe is shaded once per colour and clipped to that colour's rings, so
  // the shading runs smoothly through every ring
  for (let c = 1; c < 3; c++) { g.save(); g.clip(ringClip(c, DUCT.w + 6, path)); tube(g, path, DUCT.w, RING_COLS[c], { shadow: false, caps: false }); g.restore(); }
}

// The pipe ends (Robin: "not really fleshy... more like a rubber hose with a bulge of water passing through with no
// attachment... when it comes out it should drop out like a glob of paint into the portal"). The hose just narrows a
// little to a soft open end; the bulge runs right to it and swells it, and a glob of paint comes out: it bulges from
// the opening, hangs on a stretching neck, pinches off, falls as a teardrop, and splashes into the portal in rings.
// Robin, on draft 15: "the birthing membrane should retract to the lip above after it births the glob, and the glob
// must be bigger to justify the bulge, and... just go straight down into the swirling digital portal". So the hose's
// end is a membrane: it pushes out as the bulge arrives, stretches with the glob, and after the glob pinches off it
// draws back up to the lip and closes. The glob grows to the swollen pipe's width and drops straight down, sinking
// into the portal where it splashes. Times are u, seconds into a solid's 6 s trip (the bulge reaches the end at 5.4).
const HOSE = { ext: 15, end: 0.86 };
const GLOB = [MK.magenta, MK.cyan, MK.yellow, MK.lime, MK.orange, MK.sky, MK.pink, MK.violet];
const SURF = RIM.y + 6;            // the portal's surface, where a glob sinks in
const membrane = (u) => smoothstep(4.95, 5.3, u) * (1 - smoothstep(5.62, 5.92, u)) + 0.35 * smoothstep(5.42, 5.6, u) * (1 - smoothstep(5.6, 5.75, u));
// a wet paint fill: a highlight high on the left, the colour, a darker rim, and a specular glint
function paint(ctx, path, col, x, y, r) {
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r * 1.3);
  g.addColorStop(0, mix(col, '#ffffff', 0.55)); g.addColorStop(0.45, col); g.addColorStop(1, shade(col, -0.4));
  ctx.fillStyle = g; ctx.fill(path);
  ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.beginPath(); ctx.ellipse(x - r * 0.35, y - r * 0.38, r * 0.22, r * 0.14, -0.5, 0, TAU); ctx.fill();
}
// the membrane below the lip at y0: out by m (0..1.35) of HOSE.ext, narrowing a little, swollen where a bulge is; when
// drawn back it is just a low dome closing the end. Returns the y of its opening.
function drawHoseEnd(ctx, x, y0, bulges, m, open, clips) {
  const w = DUCT.w, ext = 3 + HOSE.ext * m, line = [], ws = [], n = 12;
  for (let i = 0; i <= n; i++) {
    const y = y0 - 2 + (ext + 2) * i / n, sArc = DUCT_LEN + (y - y0);
    const narrow = lerp(1, HOSE.end, E.smooth(i / n));
    const sw = bulges.reduce((mx, [s0, amp]) => Math.max(mx, BULGE.amp * amp * Math.exp(-(((sArc - s0) / BULGE.sigma) ** 2))), 0);
    line.push([x, y]); ws.push(w * narrow * (1 + sw));
  }
  const cEnd = (RINGS_N - 1) % 3, o = { shadow: false, size: w * 2 };
  ctx.save(); const keep = new Path2D(); keep.rect(x - 80, y0 - 0.5, 160, 120); ctx.clip(keep);
  tube(ctx, line, ws, RING_COLS[cEnd], o);
  ctx.restore();
  // the opening, seen from a little above: dilating for the glob, then shrinking to nothing as the membrane sucks
  // back up (Robin: "the holes should shrink and disappear as it sucks back up")
  const ye = y0 + ext + ws[n] * 0.3, rx = ws[n] * (0.42 * Math.min(1, m) + 0.3 * open) * smoothstep(0.05, 0.45, m);
  if (rx > 0.4) { ctx.fillStyle = '#3b2131'; ctx.beginPath(); ctx.ellipse(x, ye, rx, rx * 0.3 * (0.5 + 0.5 * open), 0, 0, TAU); ctx.fill(); }
  return ye;
}
// the glob of solid n: hanging from the opening and growing, pinching off, falling straight down, sinking in
const GLOB_R = 15;
// ye: where the opening is now (the glob hangs from it); once it falls it keeps its own line down
const DROP_Y = SPOUT[1] + 3 + HOSE.ext * 1.35 + DUCT.w * HOSE.end * 0.3;
function drawGlob(ctx, x, ye, u, n) {
  const col = GLOB[n % 8];
  if (u >= 5.22 && u < 5.62) {
    const e = smoothstep(5.22, 5.5, u), r = 4 + (GLOB_R - 4) * e, L = 2 + 12 * smoothstep(5.42, 5.62, u);
    const nw = 9 * (1 - 0.92 * smoothstep(5.5, 5.62, u)), cy = ye + L + r * 0.92;
    const p = new Path2D();
    p.moveTo(x - nw, ye); p.bezierCurveTo(x - nw, ye + L * 0.6, x - r, cy - r * 0.9, x - r, cy);
    p.arc(x, cy, r, Math.PI, 0, true);
    p.bezierCurveTo(x + r, cy - r * 0.9, x + nw, ye + L * 0.6, x + nw, ye); p.closePath();
    paint(ctx, p, col, x, cy, r);
    return;
  }
  // falling from where it pinched off (5.62) to the surface (6.0), then sinking out of sight below it (to 6.2)
  const v = u < 1 ? u + 6 : u;
  if (v < 5.62 || v >= 6.2) return;
  const y1 = DROP_Y + 14 + GLOB_R, k = Math.min(1, (v - 5.62) / 0.38), y = v < 6 ? lerp(y1, SURF, k * k) : SURF + (v - 6) * 90;
  const rx = GLOB_R * (0.92 - 0.08 * k), ry = GLOB_R * (1.05 + 0.25 * k);
  const p = new Path2D();
  p.moveTo(x, y - ry * 1.6);
  p.bezierCurveTo(x + rx * 0.35, y - ry * 1.05, x + rx, y - ry * 0.7, x + rx, y);
  p.ellipse(x, y, rx, ry, 0, 0, Math.PI, false);
  p.bezierCurveTo(x - rx, y - ry * 0.7, x - rx * 0.35, y - ry * 1.05, x, y - ry * 1.6); p.closePath();
  ctx.save();
  // below the surface it is inside the portal, so only what is still above shows
  const above = new Path2D(); above.rect(x - 60, SURF - 400, 120, 400); ctx.clip(above);
  paint(ctx, p, col, x, y, GLOB_R);
  ctx.restore();
}
// the splash where it sinks into the portal: two rings spreading on the surface and a crown of droplets, fading
function drawSplash(ctx, x, y, u, n) {
  if (u >= 0.7) return;
  const col = GLOB[n % 8], k = u / 0.7;
  for (const j of [0, 0.35]) {
    const q = Math.min(1, k * 1.2 + j * 0.3) - j * 0.3; if (q <= 0) continue;
    const rx = 8 + 52 * E.out(q);
    ctx.strokeStyle = rgba(col, 0.85 * (1 - q)); ctx.lineWidth = 3.5 * (1 - q) + 0.8;
    ctx.beginPath(); ctx.ellipse(x, y, rx, rx * 0.24, 0, 0, TAU); ctx.stroke();
  }
  for (let i = 0; i < 7; i++) {
    const a = (i + 0.5) / 7 * TAU, d = 34 * k, h = 30 * k * (1 - k) * 4 * (0.7 + 0.3 * (i % 2));
    const dx = x + Math.cos(a) * d, dy = y + Math.sin(a) * d * 0.24 - h, rr = 3.2 * (1 - k) + 0.6;
    const p = new Path2D(); p.arc(dx, dy, rr, 0, TAU); paint(ctx, p, col, dx, dy, rr);
  }
}

function drawFork(g, sc = 1) {
  const Y = FORK.y, w = DUCT.w, bar = [], stem = [], a = Math.abs(sc);
  for (let x = AXIS - FORK.half; x <= AXIS + FORK.half + 0.1; x += 4) bar.push([AXIS + (x - AXIS) * a, Y]);
  for (let y = 640; y <= Y + 0.1; y += 4) stem.push([AXIS, y]);
  // the crossbar: drawn longer than it shows and cut to the middle, so its cut ends (where tube shading turns) never
  // show; it narrows to nothing as the frame turns edge-on
  if (a > 0.04) {
    const win = new Path2D(); win.rect(AXIS - FORK.keep * a, Y - w - 10, 2 * FORK.keep * a, 2 * w + 20);
    g.save(); g.clip(win);
    tube(g, bar, w, P.mint, { caps: false, shadow: false });
    for (let c = 1; c < 3; c++) { g.save(); g.clip(barClip(c, w, sc)); tube(g, bar, w, RING_COLS[c], { caps: false, shadow: false }); g.restore(); }
    g.restore();
  }
  tube(g, stem, w, P.mint, { shadow: false });
  for (let c = 1; c < 3; c++) { g.save(); g.clip(stemClip(c, w)); tube(g, stem, w, RING_COLS[c], { shadow: false }); g.restore(); }
}
function drawFunnelBack(g, ph) {
  // the funnel's facets, each a flat cut of clay in alternating colours, far ones first so the near ones cover them
  const order = [...Array(SIDES).keys()].sort((a, b) => Math.sin((a + 1) / SIDES * TAU + ph) - Math.sin((b + 1) / SIDES * TAU + ph));
  for (const k of order) {
    if (Math.sin((k + 1) / SIDES * TAU + ph) < -0.5) continue;
    clayForm(g, [rimV(k, ph), rimV(k + 1, ph), thrV(k + 1, ph), thrV(k, ph)], facetTone(k, FACET_COLS[k % 3], ph), { smooth: false, size: 60, sheen: 0.12, round: 0.35 });
  }
  // the throat band and a short octagonal neck down into the pipe
  // (rounded, Robin: the front of a short round collar, its top and bottom edges following the throat's ellipse)
  const band = [];
  for (let q = 0; q <= 24; q++) { const th = Math.PI * (1 - q / 24); band.push([RIM.x + Math.cos(th) * 31, THROAT.y - 4 + Math.sin(th) * 7]); }
  for (let q = 0; q <= 24; q++) { const th = Math.PI * q / 24; band.push([RIM.x + Math.cos(th) * 29, THROAT.y + 15 + Math.sin(th) * 7]); }
  clayForm(g, band, P.pink, { smooth: true, size: 22, sheen: 0.28, round: 1 });
  // the inside, seen through the mouth: the far facets, lit from inside, in deepening lilac
  const mouth = [...Array(SIDES)].map((_, k) => ring(RIM.y, RIM.rx * 0.93, RIM.ry * 0.93, k, ph));
  g.fillStyle = radial(g, RIM.x, RIM.y + 14, 4, RIM.rx * 0.95, [shade(P.lilac, -0.55), shade(P.lilac, -0.3), mix(P.lilac, '#ffe9d0', 0.25)]);
  g.beginPath(); mouth.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill();
  for (let k = 0; k < SIDES; k++) {                            // inner facet seams converging on the throat
    const [x, y] = mouth[k];
    g.strokeStyle = rgba(shade(P.lilac, -0.35), 0.35); g.lineWidth = 1.4;
    g.beginPath(); g.moveTo(x, y); g.lineTo(RIM.x + (x - RIM.x) * 0.12, RIM.y + 18); g.stroke();
  }
  // the collar's far half, round the back of the octagon
  clayForm(g, collar(Math.PI - 0.05, TAU + 0.05, ph), shade(P.pink, 0.04), { smooth: false, size: 16, sheen: 0.15 });
}
function drawFunnelFront(g, ph) {
  // the collar's near half, drawn after what drops into the mouth
  clayForm(g, collar(-0.05, Math.PI + 0.05, ph), P.pink, { smooth: false, size: 18, sheen: 0.24 });
}

// The funnel machine drifts away toward the sun and back (Robin: "the funnel going further away towards the sun and
// coming back"): once every 12 s it shrinks to about two thirds toward the lantern above it, and returns. The whole
// layer goes (funnel, pipes, fork, hose ends, globs), with its old faint breathing on top.
export const FUNNEL_FAR = { every: 12, s: 0.34, ox: AXIS, oy: 110 };
export function funnelXf(t) {
  const k = 0.5 - 0.5 * Math.cos(TAU * t / FUNNEL_FAR.every), s = (1 + 0.006 * cyc(t, 2)) * (1 - FUNNEL_FAR.s * E.smooth(k));
  return { s, ox: FUNNEL_FAR.ox, oy: FUNNEL_FAR.oy, at: ([x, y]) => [FUNNEL_FAR.ox + (x - FUNNEL_FAR.ox) * s, FUNNEL_FAR.oy + (y - FUNNEL_FAR.oy) * s] };
}

// ---------------- the console ----------------
// After Mark Von Ulrich's control panels (his "machine elves" piece), in our own clay colours. A cabinet stands on the
// floor with a sloping desk on top and an upright board above it (Robin: "on a cabinet with more controls on it, and
// varied controls, not just little squares"). The board: a round meter whose needle swings with the drone's breath, a
// scope screen with a running trace, two turning knobs, a row of chasing lamps. The desk: toggle switches and round
// push buttons, worked by the operator who stands on our side, back to us. The cabinet front: sliders riding up and
// down, small lamps, door panels.
export const PANEL = { x0: 500, x1: 634, y0: 828, y1: 890, desk: 908, cab: 985 };
const METER = [522, 852], SCOPE = [550, 836, 584, 858], KNOBS = [[606, 848], [624, 848]];
const LAMPS = [...Array(9)].map((_, i) => [514 + i * 13.3, 870]);
const TOGGLES = [[516, 882], [530, 882], [544, 882], [588, 882], [602, 882], [616, 882]];
const BUTTONS = [[526, 899], [546, 899], [586, 899], [606, 899]];
const BTN_FILL = ['#f6b27e', P.mint, P.butter, P.lilac];
const SLIDERS = [[512, 918, 952], [524, 918, 952], [608, 918, 952], [620, 918, 952]];
// the presses in each 3 s: [time, hand (0 left, 1 right), control, index]; at 1.6 both hands come down together on
// the two outer push buttons (the old lever's beat); the rest fall on the 3/8 s grid of the machine rhythm
export const PRESSES = [[0.1, 0, 'btn', 1], [0.475, 1, 'tog', 4], [0.85, 0, 'tog', 1], [1.225, 1, 'btn', 3], [1.6, 0, 'btn', 0], [1.6, 1, 'btn', 2], [2.35, 1, 'tog', 3], [2.725, 0, 'tog', 2]];
export const pressAt = ([, , kind, i]) => (kind === 'btn' ? BUTTONS[i] : TOGGLES[i]);
const pressed = (t, kind, i) => PRESSES.reduce((m, p) => (p[2] === kind && p[3] === i ? Math.max(m, Math.exp(-mod(t - p[0], 3) / 0.35)) : m), 0);
// a toggle flips each time it is pressed (once a chord: four flips in 12 s, so it comes back to itself at the seam)
const toggleOn = (t, i) => { const p = PRESSES.find((q) => q[2] === 'tog' && q[3] === i); return p ? (Math.floor((mod(t, LOOP) - p[0] + 3) / 3) + i) % 2 : i % 2; };

function drawConsole(g) {
  const { x0, x1, y0, y1, desk, cab } = PANEL;
  // the cabinet: a box down to the floor, two door panels with handles, a plinth
  clayForm(g, [[x0 + 2, desk], [x1 - 2, desk], [x1 - 2, cab], [x0 + 2, cab]], mix(P.slate, P.lilac, 0.35), { smooth: false, size: 36, sheen: 0.14 });
  for (const [a, b] of [[x0 + 8, (x0 + x1) / 2 - 3], [(x0 + x1) / 2 + 3, x1 - 8]]) {
    clayForm(g, [[a, desk + 6], [b, desk + 6], [b, cab - 10], [a, cab - 10]], mix(P.slate, P.lilac, 0.5), { smooth: false, size: 18, sheen: 0.1 });
  }
  clayForm(g, [[x0 - 2, cab - 6], [x1 + 2, cab - 6], [x1 + 2, cab + 2], [x0 - 2, cab + 2]], P.slateDeep, { smooth: false, size: 10 });
  for (const [x0s, y0s, y1s] of SLIDERS) clayForm(g, [[x0s - 2, y0s], [x0s + 2, y0s], [x0s + 2, y1s], [x0s - 2, y1s]], P.slateDeep, { smooth: false, size: 4, shadow: false });
  // the sloping desk
  clayForm(g, [[x0 - 4, y1 + 2], [x1 + 4, y1 + 2], [x1 + 2, desk + 2], [x0 - 2, desk + 2]], P.slate, { smooth: false, size: 20, sheen: 0.2 });
  // the upright board, leaning back a little, and its face
  clayForm(g, [[x0 + 6, y0], [x1 - 6, y0], [x1 - 2, y1 + 4], [x0 + 2, y1 + 4]], P.slate, { smooth: false, size: 26, sheen: 0.16 });
  clayForm(g, [[x0 + 11, y0 + 5], [x1 - 11, y0 + 5], [x1 - 7, y1 - 1], [x0 + 7, y1 - 1]], mix(P.butter, P.bone, 0.5), { smooth: false, size: 18, sheen: 0.1 });
  // bezels: the meter's round face, the scope's frame, the knobs, the lamps' sockets, the toggles' plates, the buttons' rims
  clayForm(g, circle(METER[0], METER[1], 13, 32), P.slateDeep, { sheen: 0.2 });
  clayForm(g, circle(METER[0], METER[1], 10.5, 32), '#fff6e2', { sheen: 0.1, shadow: false });
  const [sx0, sy0, sx1, sy1] = SCOPE;
  clayForm(g, [[sx0 - 3, sy0 - 3], [sx1 + 3, sy0 - 3], [sx1 + 3, sy1 + 3], [sx0 - 3, sy1 + 3]], P.slateDeep, { smooth: false, size: 10 });
  for (const [x, y] of KNOBS) clayForm(g, circle(x, y, 7.5, 24), '#f6b27e', { sheen: 0.32 });
  for (const [x, y] of LAMPS) clayForm(g, circle(x, y, 3.6, 16), P.slateDeep, { sheen: 0.1, shadow: false });
  for (const [x, y] of TOGGLES) clayForm(g, [[x - 5, y - 6], [x + 5, y - 6], [x + 5, y + 6], [x - 5, y + 6]], shade(P.slate, -0.1), { smooth: false, size: 6, shadow: false });
  BUTTONS.forEach(([x, y]) => clayForm(g, circle(x, y, 8, 24), P.slateDeep, { sheen: 0.15, shadow: false }));
}
// the moving parts, drawn live
function drawPanelKeys(ctx, t) {
  // the meter's needle swings with the drone's breath (8 s), with a flicker on the machine rhythm
  const a = -1.1 + 2.2 * (0.5 + 0.5 * Math.cos(TAU * (t - 6) / 8)) + 0.06 * Math.sin(TAU * t / 0.375);
  ctx.strokeStyle = P.pinkDeep; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(METER[0], METER[1] + 4); ctx.lineTo(METER[0] + Math.sin(a) * 9, METER[1] + 4 - Math.cos(a) * 9); ctx.stroke();
  // the scope: a dark screen with a butter trace, a wave that runs along at the machine rhythm's pace
  const [sx0, sy0, sx1, sy1] = SCOPE;
  ctx.fillStyle = shade(P.slateDeep, -0.35); ctx.fillRect(sx0, sy0, sx1 - sx0, sy1 - sy0);
  ctx.strokeStyle = '#ffe9a0'; ctx.lineWidth = 1.3; ctx.beginPath();
  for (let x = sx0 + 1; x <= sx1 - 1; x += 1) { const u = (x - sx0) / (sx1 - sx0), y = (sy0 + sy1) / 2 + 6.5 * Math.sin(TAU * (u * 2 - t / 0.75)) * (0.6 + 0.4 * Math.cos(TAU * (t - 6) / 8)); x === sx0 + 1 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
  ctx.stroke();
  // the knobs turn, one each way
  KNOBS.forEach(([x, y], i) => {
    const r = (i ? -1 : 1) * TAU * t / 6;
    ctx.strokeStyle = shade('#f6b27e', -0.45); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.sin(r) * 6, y - Math.cos(r) * 6); ctx.stroke();
  });
  // the lamps chase along the row on the machine rhythm
  LAMPS.forEach(([x, y], i) => {
    const on = Math.max(0, 1 - mod(t / 0.375 - i, 9) / 1.5);
    ctx.fillStyle = mix(shade(P.mint, -0.2), '#fff4c8', on); ctx.beginPath(); ctx.arc(x, y, 2.6, 0, TAU); ctx.fill();
    if (on > 0.4) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, x, y, 8, '#fff1c0', on * 0.6); ctx.restore(); }
  });
  // the toggles: a little bat up or down, flipped by the operator; a lit dot over the ones that are on
  TOGGLES.forEach(([x, y], i) => {
    const on = toggleOn(t, i), d = on ? -1 : 1;
    ctx.strokeStyle = P.bone; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + d * 5); ctx.stroke();
    ctx.fillStyle = P.bone; ctx.beginPath(); ctx.arc(x, y + d * 5.5, 2, 0, TAU); ctx.fill();
    ctx.fillStyle = on ? '#ffb070' : shade(P.slate, -0.3); ctx.beginPath(); ctx.arc(x, y - 9, 1.4, 0, TAU); ctx.fill();
  });
  // the push buttons, lit and pushed in when pressed
  BUTTONS.forEach(([x, y], i) => {
    const on = pressed(t, 'btn', i), dip = on > 0.85 ? 1.2 : 0, col = BTN_FILL[i];
    const gr = ctx.createRadialGradient(x - 2, y - 2 + dip, 0.5, x, y + dip, 6.5);
    gr.addColorStop(0, mix(col, '#ffffff', 0.5 + 0.3 * on)); gr.addColorStop(1, shade(col, -0.25 + 0.2 * on));
    ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(x, y + dip, 6.2, 0, TAU); ctx.fill();
    if (on > 0.3) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, x, y, 14, '#fff0c0', 0.5 * on); ctx.restore(); }
  });
  // the cabinet's sliders ride up and down, each its own way, on the drone's breath and the chords
  SLIDERS.forEach(([x, y0s, y1s], i) => {
    const k = 0.5 + 0.45 * Math.sin(TAU * (t / (i % 2 ? 3 : 8) + i * 0.25)), y = lerp(y1s - 4, y0s + 4, k);
    clayForm(ctx, [[x - 5, y - 3], [x + 5, y - 3], [x + 5, y + 3], [x - 5, y + 3]], i % 2 ? P.butter : P.aqua, { smooth: false, size: 5, shadow: false });
  });
}

// ---------------- the instrument ----------------
export const INSTR = { x: 384, ringY: 800, slider: [[344, 942], [384, 942]] };
function drawInstrumentBase(g) {
  steps(g, INSTR.x, 985, { n: 4, w0: 110, w1: 54, h: 13, gap: 1, colors: [P.slateDeep, P.slate, P.lilac] });
  tube(g, [[INSTR.x, 935], [INSTR.x, INSTR.ringY + 6]], 5, P.slate);
  tube(g, INSTR.slider, 3, P.slateDeep, { shadow: false });
}

// the operators' rhythms, shared with the figures that work them
export const knobAngle = (t, i) => (i === 0 ? 0.9 * Math.sin(TAU * t / 3) : -0.5 + 0.5 * Math.sin(TAU * t / 6));
export const leverAngle = (t) => { const q = mod(t, 3); return q < 1.6 ? -0.5 : q < 2.2 ? lerp(-0.5, 0.6, E.outSoft((q - 1.6) / 0.6)) : lerp(0.6, -0.5, E.smooth((q - 2.2) / 0.8)); };
export const sliderK = (t) => 0.5 + 0.45 * Math.sin(TAU * t / 4);

export function addMachines(S) {
  const sp = (name, box, draw, o = {}) => S.sprite({ name, ...box, res: o.res ?? 1.25, mat: CLAY_MAT, edge: CLAY_EDGE, shadow: { blur: shadowBlur(o.blur ?? 18) }, draw });
  const bw = DUCT.w * (1 + BULGE.amp) + 8, forkClip = (c, sc) => { const p = new Path2D(); p.addPath(barClip(c, bw, sc)); p.addPath(stemClip(c, bw)); return p; };
  // each pipe of the turning frame: its turned path and the colour-ring clips its bulges and hose end use
  const framePipe = (sc) => { const path = warp(DUCT.path, sc); return { sc, path, clips: { ring: [null, ringClip(1, bw, path), ringClip(2, bw, path)], fork: [null, forkClip(1, sc), forkClip(2, sc)] } }; };
  const consoleS = sp('console', { x: 470, y: 760, w: 380, h: 240 }, drawConsole);
  const instr = sp('instrument', { x: INSTR.x - 80, y: 780, w: 160, h: 220 }, drawInstrumentBase);

  // the funnel: small solids swirl down the mouth, swell along the pipe as it carries them, and drop from the spout
  const KINDS = ['octa', 'cube', 'tetra', 'ico'], COLS = [P.pink, P.butter, P.lilac, P.aqua, P.mint, P.pinkDeep, P.blush, P.butterDeep];
  S.add({ name: 'funnel', z: 1000, shadow: { dx: 10, dy: 18, alpha: 0.4 }, anim: (t) => { const f = funnelXf(t); return { sx: f.s, sy: f.s, ox: f.ox, oy: f.oy }; }, render(ctx, t, env) {
    // the frame's two pipes this frame: the left one (odd solids take the right) and its mirror; the one swinging away
    // is drawn now, behind the funnel, the other after it
    const th = frameTurn(t), cf = Math.cos(th), sf = Math.sin(th);
    const pipes = [framePipe(cf), framePipe(-cf)], backI = sf >= 0 ? 0 : 1, frontI = 1 - backI;
    const spoutX = (i) => AXIS + (SPOUT[0] - AXIS) * pipes[i].sc;
    // a bulge low in the pipe (in the stem or the crossbar) is drawn after the fork, with the front pipe
    const LOW = 330;
    const bulgesOf = (i, low) => { for (const [s0, amp, right] of swell) if (amp > 0.01 && right === i && (s0 < LOW) === low) drawBulge(ctx, s0, amp, pipes[i].clips, pipes[i].path, pipes[i].sc); };
    const hoseOf = (i) => {
      let open = 0, m = 0; const near = [];
      for (let n = i; n < 8; n += 2) {
        const u = mod(t + n * 0.75, 6);
        // the bulge carries on past the pipe's end into the membrane (the same speed), then the paint comes out
        if (u >= 4.6 && u < 5.6) near.push([DUCT_LEN * (u - 2.2) / 3.2, 1 - smoothstep(5.4, 5.6, u)]);
        open = Math.max(open, smoothstep(5.22, 5.4, u) * (1 - smoothstep(5.56, 5.7, u)));
        m = Math.max(m, membrane(u));
      }
      const ye = drawHoseEnd(ctx, spoutX(i), SPOUT[1], near, m, open, pipes[i].clips);
      // the glob hangs from where the opening is while it is out; once it falls it keeps its own line
      for (let n = i; n < 8; n += 2) drawGlob(ctx, spoutX(i), ye, mod(t + n * 0.75, 6), n);
    };
    const swell = [], late = [];   // swell: [arc length, strength, right side?] of each bulge in a pipe
    for (let n = 0; n < 8; n++) {
      const u = mod(t + n * 0.75, 6);
      if (u >= 2.2 && u < 5.4) { const s0 = DUCT_LEN * (u - 2.2) / 3.2; swell.push([s0, smoothstep(30, 70, s0), n % 2]); }   // odd ones take the right pipe
    }
    drawPipe(ctx, pipes[backI].path);
    bulgesOf(backI, false);
    hoseOf(backI);
    const ph = funnelTurn(t);
    drawFunnelBack(ctx, ph);
    const pulse = 0.5 + 0.5 * Math.cos(TAU * mod(t, 0.75) / 0.75);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, RIM.x, RIM.y + 6, 150, '#ffd9b0', 0.14 + 0.06 * pulse); ctx.restore();
    // inside the mouth is Mark's world: deep blue going to black, zigzag rings turning, a burst at the throat, and the
    // solids spiralling down through it, all in his early-Mac colours
    const mouthPts = [...Array(SIDES)].map((_, k) => ring(RIM.y, RIM.rx * 0.93, RIM.ry * 0.93, k, ph));
    markLayer(ctx, RIM.x, RIM.y, RIM.rx * 2, RIM.ry * 2 + 12, (g) => {
      const clip = new Path2D(); mouthPts.forEach(([x, y], i) => (i ? clip.lineTo(x, y) : clip.moveTo(x, y))); clip.closePath();
      g.save(); g.clip(clip);
      const bg = g.createRadialGradient(RIM.x, RIM.y + 6, 2, RIM.x, RIM.y, RIM.rx);
      bg.addColorStop(0, MK.deep); bg.addColorStop(0.5, MK.blue); bg.addColorStop(1, MK.violet);
      g.fillStyle = bg; g.fillRect(RIM.x - RIM.rx, RIM.y - RIM.ry - 6, RIM.rx * 2, RIM.ry * 2 + 12);
      for (let k = 0; k < 4; k++) {                          // zigzag rings shrinking toward the throat, turning
        const kk = mod(k + t / 1.5, 4) / 4, rx = RIM.rx * (0.9 - 0.75 * kk), ry = RIM.ry * (0.9 - 0.75 * kk), n = 40;
        g.beginPath();
        for (let i = 0; i <= n; i++) { const a = i / n * TAU + TAU * t / LOOP, z = i % 2 ? 0.86 : 1; g.lineTo(RIM.x + Math.cos(a) * rx * z, RIM.y + 6 + Math.sin(a) * ry * z); }
        g.strokeStyle = [MK.magenta, MK.cyan, MK.yellow, MK.lime][k]; g.lineWidth = 1.5; g.stroke();
      }
      paintBurst(g, RIM.x, RIM.y + 8, 14 + 2 * Math.sin(TAU * t / 0.75), 12, TAU * t / 6);
      for (let n = 0; n < 8; n++) {
        const u = mod(t + n * 0.75, 6);
        if (u >= 1.6) continue;
        const k = u / 1.6, a = n * 1.3 + k * TAU * 1.25, rr = (1 - k) * 0.78 + 0.08;
        paintMarkSolid(g, KINDS[n % 4], RIM.x + Math.cos(a) * RIM.rx * rr, RIM.y + 8 + Math.sin(a) * RIM.ry * rr + k * 14, 9 * (1 - 0.5 * k), [TAU * t / 3 + n, TAU * t / 2, n], n);
      }
      g.restore();
    });
    // each glob's splash where it lands, inside the portal
    { const clip = new Path2D(); mouthPts.forEach(([x, y], i) => (i ? clip.lineTo(x, y) : clip.moveTo(x, y))); clip.closePath();
      ctx.save(); ctx.clip(clip);
      for (let n = 0; n < 8; n++) drawSplash(ctx, spoutX(n % 2), SURF, mod(t + n * 0.75, 6), n);
      ctx.restore(); }
    drawFunnelFront(ctx, ph);
    // the front pipe, the fork over both pipes' meeting, the low bulges of both, the front pipe's bulges and hose end
    drawPipe(ctx, pipes[frontI].path);
    drawFork(ctx, cf);
    bulgesOf(0, true); bulgesOf(1, true);
    bulgesOf(frontI, false);
    hoseOf(frontI);
    for (const f of late) f();
  } });

  // the console: lights in a slow pattern, the knobs' marks, the lever, and a turning shape on the screen
  S.add({ name: 'console', z: 990, shadow: { dx: 8, dy: 14, alpha: 0.42 }, render(ctx, t, env) { mirrored(ctx, () => {
    drawSprites(ctx, [{ s: consoleS }], env.shadow);
    drawPanelKeys(ctx, t);
  }); } });

  // the instrument: three rings turning on their own axes, a hovering solid, and once a loop a cube let go
  S.add({ name: 'instrument', z: 990, shadow: { dx: 8, dy: 14, alpha: 0.42 }, render(ctx, t, env) { mirrored(ctx, () => {
    drawSprites(ctx, [{ s: instr }], env.shadow);
    const [a, b] = INSTR.slider, k = sliderK(t);
    ctx.fillStyle = P.butter; ctx.beginPath(); ctx.roundRect(lerp(a[0], b[0], k) - 5, a[1] - 7, 10, 14, 3); ctx.fill();
    const cx = INSTR.x, cy = INSTR.ringY;
    ctx.lineCap = 'round';
    for (const [r, c, rate, axis] of [[44, P.pink, 1, 0], [34, P.mint, -2, 1], [24, P.butter, 3, 2]]) {
      const sq = Math.abs(Math.cos(TAU * rate * t / LOOP)) * 0.9 + 0.1;
      for (const [w, col] of [[7, shade(c, -0.25)], [5, c], [2, mix(c, '#fffaf0', 0.6)]]) {
        ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath();
        if (axis === 0) ctx.ellipse(cx, cy, r * sq, r, 0, 0, TAU);
        else ctx.ellipse(cx, cy, r, r * sq, axis === 1 ? 0 : Math.PI / 4, 0, TAU);
        ctx.stroke();
      }
    }
    drawSolid(ctx, 'octa', cx, cy, 11, [TAU * t / 4, TAU * t / 6, 0], P.lilac, { glowK: 0.5 + 0.2 * cyc(t, 3) });
    const u = mod(t - 7.0, LOOP);
    if (u < 10.5) {
      const grow = smoothstep(0, 0.8, u), f = smoothstep(0.8, 10.5, u);
      drawSolid(ctx, 'cube', cx - 60 * f - 40 * Math.sin(f * 3), cy - 60 * grow - 560 * E.outSoft(f), 13 * grow * (1 - 0.45 * f), [TAU * t / 6, TAU * t / 4, 0.4], P.aqua, { glowK: 1 - smoothstep(0.8, 2.5, u), alpha: 1 - smoothstep(0.82, 1, f) });
    }
  }); } });
}
