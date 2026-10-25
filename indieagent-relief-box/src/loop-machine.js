// The living loop, the machines (draft 8, symmetric). All timing is periodic in LOOP (12 s) so the film loops
// without a seam. The picture is built about a centre line at x = 960: everything off the axis is made for the left
// half and drawn again mirrored (mirrored()), so the right half is its exact reflection, moving in mirror unison.
//
//   the funnel     one faceted octagonal funnel on the axis that feeds itself from both sides: what gathers in the
//                  top swirls down; a stem leaves the bottom and splits into two pipes that turn square corners (out,
//                  up past the lip, in, down) and drop back into the mouth. Eight small solids go round for ever (a lap
//                  every 6 s), turn and turn about down the left and right pipes; inside a pipe the pipe itself swells
//                  in a bulge that travels along it. The funnel glows faintly inside.
//   the consoles   a desk of knobs, a lever, a row of lights and a round screen with a turning shape; a cable from
//                  it droops across to the pipe. One each side.
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
const THROAT = { y: 642, rx: 26, ry: 6 }, SIDES = 8;
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
const RING = 42, RING_COLS = [P.mint, P.butter, P.pink];
function ringClip(c, w) {
  const clip = new Path2D();
  for (let r = c, s0 = r * RING; s0 < DUCT_LEN - 8; r += 3, s0 = r * RING) {
    const seg = DUCT.path.filter((_, i) => ACC[i] >= s0 - 0.01 && ACC[i] <= Math.min(DUCT_LEN, s0 + RING) + 0.01);
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
const ringOf = (sArc) => Math.floor(sArc / RING) % 3;
const barClip = (c, w) => { const p = new Path2D(); for (let x = AXIS - FORK.keep; x < AXIS + FORK.keep; x += 2) if (ringOf(arcAt(AXIS - Math.abs(x + 1 - AXIS), FORK.y)) === c) p.rect(x, FORK.y - w - 8, 2.2, 2 * w + 16); return p; };
const stemClip = (c, w) => { const p = new Path2D(); for (let y = 640; y < FORK.y + w + 2; y += 2) if (ringOf(Math.min(y, FORK.y) - 640) === c) p.rect(AXIS - w - 8, y, 2 * w + 16, 2.2); return p; };
// the fork's box: inside it a passing bulge takes the fork's rings, outside the pipe's own
const FORK_BOX = [AXIS - FORK.keep, 630, 2 * FORK.keep, FORK.y + 60 - 630];
// a stretch of pipe swollen around s0: the same rolled tube, wider in a smooth bump, in the same colour rings
const BULGE = { sigma: 17, amp: 0.45 };
function drawBulge(ctx, s0, amp, clips) {
  // drawn over a long stretch, but only the swollen middle is let through, so the cut ends of the stretch (where its
  // shading turns at the cut) never show; at the clip's edge the swell has already melted back into the pipe
  const span = BULGE.sigma * 5, keep = BULGE.sigma * 2.4, seg = [], ws = [], mid = [];
  DUCT.path.forEach((p, i) => {
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
  const box = new Path2D(); box.rect(...FORK_BOX);
  const outside = new Path2D(); outside.rect(-4000, -4000, 9000, 9000); outside.addPath(box);
  for (const [region, rule, cl] of [[outside, 'evenodd', clips.ring], [box, 'nonzero', clips.fork]]) {
    ctx.save(); ctx.clip(win); ctx.clip(region, rule);
    tube(ctx, seg, ws, RING_COLS[0], o);
    for (let c = 1; c < 3; c++) { ctx.save(); ctx.clip(cl[c]); tube(ctx, seg, ws, RING_COLS[c], o); ctx.restore(); }
    ctx.restore();
  }
}
const SPOUT = DUCT.path[DUCT.path.length - 1];

const ring = (cy, rx, ry, k) => { const a = (k + 0.5) / SIDES * TAU; return [RIM.x + Math.cos(a) * rx, cy + Math.sin(a) * ry]; };
const rimV = (k) => ring(RIM.y, RIM.rx, RIM.ry, k), thrV = (k) => ring(THROAT.y, THROAT.rx, THROAT.ry, k);
// facet tone: the facet's outward direction in plan is the angle of its middle; light comes from the upper left
const facetTone = (k, base) => { const a = (k + 1) / SIDES * TAU, lit = -Math.cos(a) * 0.46 + Math.sin(a) * 0.2; return lit > 0 ? mix(base, '#fffaf0', lit * 0.5) : shade(base, lit * 0.32); };

function drawPipe(g) {
  // flat ends: the top one runs into the fork's stem, the bottom one under the egg-laying tip
  tube(g, DUCT.path, DUCT.w, P.mint, { caps: false });
  // rings of colour along the pipe: the whole pipe is shaded once per colour and clipped to that colour's rings, so
  // the shading runs smoothly through every ring
  for (let c = 1; c < 3; c++) { g.save(); g.clip(ringClip(c, DUCT.w + 6)); tube(g, DUCT.path, DUCT.w, RING_COLS[c], { shadow: false, caps: false }); g.restore(); }
}

// The pipe ends (Robin: "not really fleshy... more like a rubber hose with a bulge of water passing through with no
// attachment... when it comes out it should drop out like a glob of paint into the portal"). The hose just narrows a
// little to a soft open end; the bulge runs right to it and swells it, and a glob of paint comes out: it bulges from
// the opening, hangs on a stretching neck, pinches off, falls as a teardrop, and splashes into the portal in rings.
const HOSE = { len: 10, end: 0.86, back: 40 };   // the end runs 10 past the pipe, narrowing a little; drawn from 40 up
const GLOB = [MK.magenta, MK.cyan, MK.yellow, MK.lime, MK.orange, MK.sky, MK.pink, MK.violet];
// a wet paint fill: a highlight high on the left, the colour, a darker rim, and a specular glint
function paint(ctx, path, col, x, y, r) {
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r * 1.3);
  g.addColorStop(0, mix(col, '#ffffff', 0.55)); g.addColorStop(0.45, col); g.addColorStop(1, shade(col, -0.4));
  ctx.fillStyle = g; ctx.fill(path);
  ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.beginPath(); ctx.ellipse(x - r * 0.35, y - r * 0.38, r * 0.22, r * 0.14, -0.5, 0, TAU); ctx.fill();
}
// the hose's last stretch, drawn again over the pipe from `back` up so the swell can run right to the end: the
// same tube in the same colour rings, narrowing a little to a rounded end. bulges: arc lengths of bulges near the end
function drawHoseEnd(ctx, x, y0, bulges, open, clips) {
  const w = DUCT.w, line = [], ws = [], top = y0 - HOSE.back, n = 16;
  for (let i = 0; i <= n; i++) {
    const y = top + (HOSE.back + HOSE.len) * i / n, sArc = DUCT_LEN + (y - y0);
    const narrow = lerp(1, HOSE.end, E.smooth(Math.max(0, (y - (y0 - 8)) / (HOSE.len + 8))));
    const sw = bulges.reduce((m, [s0, amp]) => Math.max(m, BULGE.amp * amp * Math.exp(-(((sArc - s0) / BULGE.sigma) ** 2))), 0);
    line.push([x, y]); ws.push(w * narrow * (1 + sw));
  }
  const cEnd = Math.floor(DUCT_LEN / RING) % 3, below = new Path2D(); below.rect(x - 60, y0, 120, 60);
  const o = { shadow: false, size: w * 2 };
  // only from the pipe's end down: above it the baked pipe and the bulge (which runs right to the end) show
  ctx.save(); const keep = new Path2D(); keep.rect(x - 80, y0 - 0.5, 160, 120); ctx.clip(keep);
  tube(ctx, line, ws, RING_COLS[0], o);
  for (let c = 1; c < 3; c++) {
    const cl = new Path2D(); cl.addPath(clips.ring[c]); if (c === cEnd) cl.addPath(below);
    ctx.save(); ctx.clip(cl); tube(ctx, line, ws, RING_COLS[c], o); ctx.restore();
  }
  ctx.restore();
  // the open end, seen from a little above: a dark ellipse that stretches as the glob comes out
  const ye = y0 + HOSE.len, rx = ws[n] * (0.5 + 0.35 * open);
  ctx.fillStyle = '#3b2131'; ctx.beginPath(); ctx.ellipse(x, ye + ws[n] * 0.35, rx, rx * 0.32, 0, 0, TAU); ctx.fill();
  return ye + ws[n] * 0.35;
}
// the glob of solid n at u (seconds into its trip): hanging from the end, then falling; null when not out
function drawGlob(ctx, x, ye, u, n, toX) {
  const col = GLOB[n % 8];
  if (u >= 5.28 && u < 5.56) {
    const e = smoothstep(5.28, 5.5, u), r = 3 + 6.5 * e, L = 3 + 9 * smoothstep(5.38, 5.56, u);
    const nw = 8 * (1 - 0.9 * smoothstep(5.44, 5.56, u)), cy = ye + L + r;
    const p = new Path2D();
    p.moveTo(x - nw, ye); p.bezierCurveTo(x - nw, ye + L * 0.6, x - r, cy - r * 0.9, x - r, cy);
    p.arc(x, cy, r, Math.PI, 0, true);
    p.bezierCurveTo(x + r, cy - r * 0.9, x + nw, ye + L * 0.6, x + nw, ye); p.closePath();
    paint(ctx, p, col, x, cy, r);
  } else if (u >= 5.56 && u < 6) {
    const k = (u - 5.56) / 0.44, r = 9.5, y = lerp(ye + 21, RIM.y + 8, k * k), xx = lerp(x, toX, k);
    const rx = r * (0.9 - 0.1 * k), ry = r * (1.05 + 0.35 * k);
    const p = new Path2D();
    p.moveTo(xx, y - ry * 1.75);
    p.bezierCurveTo(xx + rx * 0.35, y - ry * 1.1, xx + rx, y - ry * 0.7, xx + rx, y);
    p.ellipse(xx, y, rx, ry, 0, 0, Math.PI, false);
    p.bezierCurveTo(xx - rx, y - ry * 0.7, xx - rx * 0.35, y - ry * 1.1, xx, y - ry * 1.75); p.closePath();
    paint(ctx, p, col, xx, y, r);
  }
}
// the splash where it lands in the portal: two rings spreading on the surface and a crown of droplets, fading
function drawSplash(ctx, x, y, u, n) {
  if (u >= 0.7) return;
  const col = GLOB[n % 8], k = u / 0.7;
  ctx.save();
  for (const j of [0, 0.35]) {
    const q = Math.min(1, k * 1.2 + j * 0.3) - j * 0.3; if (q <= 0) continue;
    const rx = 5 + 46 * E.out(q);
    ctx.strokeStyle = rgba(col, 0.85 * (1 - q)); ctx.lineWidth = 3 * (1 - q) + 0.8;
    ctx.beginPath(); ctx.ellipse(x, y, rx, rx * 0.24, 0, 0, TAU); ctx.stroke();
  }
  for (let i = 0; i < 6; i++) {
    const a = (i + 0.5) / 6 * TAU, d = 30 * k, h = 26 * k * (1 - k) * 4 * (0.7 + 0.3 * (i % 2));
    const dx = x + Math.cos(a) * d, dy = y + Math.sin(a) * d * 0.24 - h, rr = 2.6 * (1 - k) + 0.6;
    const p = new Path2D(); p.arc(dx, dy, rr, 0, TAU); paint(ctx, p, col, dx, dy, rr);
  }
  ctx.restore();
}

function drawFork(g) {
  const Y = FORK.y, w = DUCT.w, bar = [], stem = [];
  for (let x = AXIS - FORK.half; x <= AXIS + FORK.half + 0.1; x += 4) bar.push([x, Y]);
  for (let y = 640; y <= Y + 0.1; y += 4) stem.push([AXIS, y]);
  // the crossbar: drawn longer than it shows and cut to the middle, so its cut ends (where tube shading turns) never show
  const win = new Path2D(); win.rect(AXIS - FORK.keep, Y - w - 10, 2 * FORK.keep, 2 * w + 20);
  g.save(); g.clip(win);
  tube(g, bar, w, P.mint, { caps: false, shadow: false });
  for (let c = 1; c < 3; c++) { g.save(); g.clip(barClip(c, w)); tube(g, bar, w, RING_COLS[c], { caps: false, shadow: false }); g.restore(); }
  g.restore();
  tube(g, stem, w, P.mint, { shadow: false });
  for (let c = 1; c < 3; c++) { g.save(); g.clip(stemClip(c, w)); tube(g, stem, w, RING_COLS[c], { shadow: false }); g.restore(); }
}
function drawFunnelBack(g) {
  // the funnel's front facets (the ones turned toward us), each a flat cut of clay
  for (let k = 0; k < SIDES; k++) {
    const mid = (k + 1) / SIDES * TAU;
    if (Math.sin(mid) < -0.05) continue;
    clayForm(g, [rimV(k), rimV(k + 1), thrV(k + 1), thrV(k)], facetTone(k, P.butter), { smooth: false, size: 60, sheen: 0.12, round: 0.35 });
  }
  // the throat band and a short octagonal neck down into the pipe
  clayForm(g, [[RIM.x - 30, THROAT.y - 4], [RIM.x + 30, THROAT.y - 4], [RIM.x + 30, THROAT.y + 16], [RIM.x - 30, THROAT.y + 16]], P.pink, { smooth: false, size: 14, sheen: 0.18 });
  // the inside, seen through the mouth: the far facets, lit from inside, in deepening lilac
  const mouth = [...Array(SIDES)].map((_, k) => ring(RIM.y, RIM.rx * 0.93, RIM.ry * 0.93, k));
  g.fillStyle = radial(g, RIM.x, RIM.y + 14, 4, RIM.rx * 0.95, [shade(P.lilac, -0.55), shade(P.lilac, -0.3), mix(P.lilac, '#ffe9d0', 0.25)]);
  g.beginPath(); mouth.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill();
  for (let k = 0; k < SIDES; k++) {                            // inner facet seams converging on the throat
    const [x, y] = mouth[k];
    g.strokeStyle = rgba(shade(P.lilac, -0.35), 0.35); g.lineWidth = 1.4;
    g.beginPath(); g.moveTo(x, y); g.lineTo(RIM.x + (x - RIM.x) * 0.12, RIM.y + 18); g.stroke();
  }
  // the collar's far half: vertices 3..7 and 0 run round the back of the octagon
  const band = (ks) => [...ks.map((k) => ring(RIM.y, RIM.rx * 1.07, RIM.ry * 1.07, k)), ...ks.slice().reverse().map((k) => ring(RIM.y, RIM.rx * 0.93, RIM.ry * 0.93, k))];
  clayForm(g, band([3, 4, 5, 6, 7, 0]), shade(P.pink, 0.04), { smooth: false, size: 16, sheen: 0.15 });
}
function drawFunnelFront(g) {
  // the collar's near half (vertices 7, 0..4), drawn after what drops into the mouth
  const band = (ks) => [...ks.map((k) => ring(RIM.y, RIM.rx * 1.07, RIM.ry * 1.07, k)), ...ks.slice().reverse().map((k) => ring(RIM.y, RIM.rx * 0.93, RIM.ry * 0.93, k))];
  clayForm(g, band([7, 0, 1, 2, 3, 4]), P.pink, { smooth: false, size: 18, sheen: 0.24 });
}

// ---------------- the console ----------------
export const CONSOLE = { knobs: [[520, 912], [548, 906]], lever: [612, 904], screen: [580, 876], lights: [[512, 934], [526, 933], [540, 932], [554, 931], [568, 930], [582, 929]] };
function drawConsole(g) {
  // legs, a slanted desk, a raised screen housing, and the cable to the duct
  tube(g, [[506, 945], [500, 985]], 4, P.slateDeep); tube(g, [[626, 945], [632, 985]], 4, P.slateDeep);
  clayForm(g, [[492, 948], [496, 916], [632, 900], [640, 946]], P.slate, { smooth: false, size: 40, sheen: 0.18 });
  clayForm(g, [[562, 902], [568, 852], [594, 850], [600, 898]], shade(P.slate, -0.05), { smooth: false, size: 24 });
  for (const [x, y] of CONSOLE.knobs) clayForm(g, circle(x, y, 8, 24), P.butter, { sheen: 0.3 });
  tube(g, [[CONSOLE.lever[0] - 8, CONSOLE.lever[1]], [CONSOLE.lever[0] + 8, CONSOLE.lever[1]]], 4, P.slateDeep);
  const cable = [];
  for (let i = 0; i <= 20; i++) { const u = i / 20; cable.push([lerp(636, AXIS - 150, u), lerp(930, 788, u) + 60 * Math.sin(Math.PI * u)]); }
  tube(g, cable, 4, P.lilac);
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
  const pipe = sp('pipe', { x: AXIS - 330, y: 170, w: 360, h: 690 }, drawPipe, { blur: 18 });
  const fork = sp('pipe-fork', { x: AXIS - 160, y: 600, w: 320, h: 250 }, drawFork, { blur: 18 });
  const back = sp('funnel', { x: AXIS - 230, y: 300, w: 460, h: 400 }, drawFunnelBack, { blur: 22 });
  const front = sp('funnel-lip', { x: AXIS - 220, y: 310, w: 440, h: 130 }, drawFunnelFront, { blur: 10 });
  const bw = DUCT.w * (1 + BULGE.amp) + 8, forkClip = (c) => { const p = new Path2D(); p.addPath(barClip(c, bw)); p.addPath(stemClip(c, bw)); return p; };
  const clips = { ring: [null, ringClip(1, bw), ringClip(2, bw)], fork: [null, forkClip(1), forkClip(2)] };
  const consoleS = sp('console', { x: 470, y: 760, w: 380, h: 240 }, drawConsole);
  const instr = sp('instrument', { x: INSTR.x - 80, y: 780, w: 160, h: 220 }, drawInstrumentBase);

  // the funnel: small solids swirl down the mouth, swell along the pipe as it carries them, and drop from the spout
  const KINDS = ['octa', 'cube', 'tetra', 'ico'], COLS = [P.pink, P.butter, P.lilac, P.aqua, P.mint, P.pinkDeep, P.blush, P.butterDeep];
  S.add({ name: 'funnel', z: 1000, shadow: { dx: 10, dy: 18, alpha: 0.4 }, anim: (t) => ({ sx: 1 + 0.006 * cyc(t, 2), sy: 1 + 0.006 * cyc(t, 2), ox: RIM.x, oy: 520 }), render(ctx, t, env) {
    mirrored(ctx, () => drawSprites(ctx, [{ s: pipe }], env.shadow));
    drawSprites(ctx, [{ s: fork, shadow: false }], env.shadow);
    drawSprites(ctx, [{ s: back }], env.shadow);
    const swell = [], late = [];   // swell: [arc length, strength, right side?] of each bulge in a pipe
    const pulse = 0.5 + 0.5 * Math.cos(TAU * mod(t, 0.75) / 0.75);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, RIM.x, RIM.y + 6, 150, '#ffd9b0', 0.14 + 0.06 * pulse); ctx.restore();
    // inside the mouth is Mark's world: deep blue going to black, zigzag rings turning, a burst at the throat, and the
    // solids spiralling down through it, all in his early-Mac colours
    const mouthPts = [...Array(SIDES)].map((_, k) => ring(RIM.y, RIM.rx * 0.93, RIM.ry * 0.93, k));
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
    for (let n = 0; n < 8; n++) {
      const u = mod(t + n * 0.75, 6), kind = KINDS[n % 4], ang = [TAU * t / 3 + n, TAU * t / 2, n];
      if (u < 1.6) continue;                               // inside the mouth: drawn in Mark's world above
      else if (u >= 2.2 && u < 5.4) {                    // carried round the pipe
        const s = DUCT_LEN * (u - 2.2) / 3.2;
        swell.push([s, smoothstep(30, 70, s), n % 2]);   // odd ones take the right pipe
      }                                                    // from 5.3 s it comes out of the hose as paint
    }
    // each glob's splash where it lands, inside the portal
    { const clip = new Path2D(); mouthPts.forEach(([x, y], i) => (i ? clip.lineTo(x, y) : clip.moveTo(x, y))); clip.closePath();
      ctx.save(); ctx.clip(clip);
      for (let n = 0; n < 8; n++) drawSplash(ctx, RIM.x + (n % 2 ? 10 : -10), RIM.y + 8, mod(t + n * 0.75, 6), n);
      ctx.restore(); }
    drawSprites(ctx, [{ s: front }], { ...env.shadow, dx: 3, dy: 5 });
    // the pipe swells as each one passes; a right-side one is drawn reflected
    for (const [s0, amp, right] of swell) if (amp > 0.01) {
      if (!right) drawBulge(ctx, s0, amp, clips);
      else { ctx.save(); ctx.translate(2 * AXIS, 0); ctx.scale(-1, 1); drawBulge(ctx, s0, amp, clips); ctx.restore(); }
    }
    // the hose ends: even ones leave by the left, odd by the right, 5.4 s into the trip (every 1.5 s a side); the end
    // swells as the bulge reaches it, opens as the glob comes out, and the glob drops into the portal
    for (const right of [0, 1]) {
      let open = 0; const near = [];
      for (let n = right; n < 8; n += 2) {
        const u = mod(t + n * 0.75, 6);
        // the bulge carries on past the pipe's end into the hose end (the same speed), then the paint comes out
        if (u >= 4.6 && u < 5.6) near.push([DUCT_LEN * (u - 2.2) / 3.2, 1 - smoothstep(5.4, 5.6, u)]);
        open = Math.max(open, smoothstep(5.28, 5.42, u) * (1 - smoothstep(5.5, 5.62, u)));
      }
      ctx.save();
      if (right) { ctx.translate(2 * AXIS, 0); ctx.scale(-1, 1); }
      const ye = drawHoseEnd(ctx, SPOUT[0], SPOUT[1], near, open, clips);
      for (let n = right; n < 8; n += 2) drawGlob(ctx, SPOUT[0], ye, mod(t + n * 0.75, 6), n, RIM.x - 10);
      ctx.restore();
    }
    for (const f of late) f();
  } });

  // the console: lights in a slow pattern, the knobs' marks, the lever, and a turning shape on the screen
  S.add({ name: 'console', z: 990, shadow: { dx: 8, dy: 14, alpha: 0.42 }, render(ctx, t, env) { mirrored(ctx, () => {
    drawSprites(ctx, [{ s: consoleS }], env.shadow);
    CONSOLE.lights.forEach(([x, y], i) => {
      const on = 0.5 + 0.5 * Math.sin(TAU * (t / 3 + i / 6));
      ctx.fillStyle = mix(shade(P.mint, -0.3), '#fff4c8', on); ctx.beginPath(); ctx.arc(x, y, 3.2, 0, TAU); ctx.fill();
      if (on > 0.7) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, x, y, 9, '#fff1c0', (on - 0.7) * 1.4); ctx.restore(); }
    });
    CONSOLE.knobs.forEach(([x, y], i) => {
      const a = knobAngle(t, i);
      ctx.strokeStyle = shade(P.butter, -0.45); ctx.lineWidth = 2; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.sin(a) * 6, y - Math.cos(a) * 6); ctx.stroke();
    });
    const la = leverAngle(t), [lx, ly] = CONSOLE.lever, tip = [lx + Math.sin(la) * 24, ly - Math.cos(la) * 24];
    ctx.strokeStyle = P.slateDeep; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(...tip); ctx.stroke();
    ctx.fillStyle = P.pinkDeep; ctx.beginPath(); ctx.arc(tip[0], tip[1], 5, 0, TAU); ctx.fill();
    // the screen shows Mark's world: a turning octahedron over a cycling glyph, on black
    const [sx, sy] = CONSOLE.screen;
    markLayer(ctx, sx, sy, 30, 40, (g) => {
      g.fillStyle = MK.ink; g.beginPath(); g.ellipse(sx, sy, 12, 18, 0, 0, TAU); g.fill();
      paintGlyph(g, Math.floor(mod(t, 3) * 2) % 6, sx, sy + 9, 7, MK_RAMP[Math.floor(mod(t, 3) * 2) % 8]);
      paintMarkSolid(g, 'octa', sx, sy - 4, 7, [TAU * t / 6, TAU * t / 12, 0.3], 2);
    });
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
