// The living loop, the machines (draft 2). All timing is periodic in LOOP (12 s) so the film loops without a seam.
//
//   the funnel     one faceted octagonal funnel that feeds itself: what gathers in the top swirls down; it leaves by
//                  a thick pipe at the bottom that turns square corners (right, up past the lip, left, down) and
//                  drops back in. Eight small solids go round it for ever (a lap every 6 s); in the pipe each shows
//                  as a swelling that travels along it. The funnel glows faintly from inside.
//   the console    a desk of knobs, a lever, a row of lights and a round screen with a turning shape; a cable from
//                  it droops across to the duct's elbow.
//   the instrument three nested rings turning on different axes above a stepped plinth, a small solid hovering
//                  over them; once a loop it lets a cube go.

import { radial, glow } from '../vendor/paper-fox/core/piece.js';
import { mix, shade, rgba } from '../vendor/paper-fox/core/color.js';
import { drawSprites } from '../vendor/paper-fox/core/sprite.js';
import { along } from '../vendor/paper-fox/core/geom.js';
import { lerp, smoothstep, E } from '../vendor/paper-fox/core/ease.js';
import { PAL, CLAY_MAT, CLAY_EDGE, clayForm, tube, steps, dot, chaikin } from './kit.js';
import { LOOP, cyc } from './loop-world.js';
import { drawSolid } from './loop-shapes.js';

const P = PAL, TAU = Math.PI * 2;
const circle = (cx, cy, r, n = 36) => [...Array(n)].map((_, i) => [cx + Math.cos(i / n * TAU) * r, cy + Math.sin(i / n * TAU) * r]);
const mod = (x, m) => ((x % m) + m) % m;
const plen = (pts) => pts.reduce((a, p, i) => i ? a + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0, 0);

// ---------------- the funnel ----------------
// An octagonal funnel cut in flat clay facets, each facet lit by how it turns to the light, with a collar at the
// rim and a band at the throat. The pipe is a thick rolled tube that runs straight and turns square corners with a
// small round fillet: down, right, up past the lip, left, down into the mouth.
export const RIM = { x: 880, y: 372, rx: 190, ry: 46 };
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
export const DUCT = { w: 23, path: squarePath([[880, 640], [880, 800], [1226, 800], [1226, 226], [904, 226], [904, 300]]) };
const DUCT_LEN = plen(DUCT.path);
const SPOUT = DUCT.path[DUCT.path.length - 1];

const ring = (cy, rx, ry, k) => { const a = (k + 0.5) / SIDES * TAU; return [RIM.x + Math.cos(a) * rx, cy + Math.sin(a) * ry]; };
const rimV = (k) => ring(RIM.y, RIM.rx, RIM.ry, k), thrV = (k) => ring(THROAT.y, THROAT.rx, THROAT.ry, k);
// facet tone: the facet's outward direction in plan is the angle of its middle; light comes from the upper left
const facetTone = (k, base) => { const a = (k + 1) / SIDES * TAU, lit = -Math.cos(a) * 0.46 + Math.sin(a) * 0.2; return lit > 0 ? mix(base, '#fffaf0', lit * 0.5) : shade(base, lit * 0.32); };

function drawFunnelBack(g) {
  // the pipe first: it passes behind the funnel on its way round
  tube(g, DUCT.path, DUCT.w, P.mint);
  for (let s = 40; s < DUCT_LEN - 30; s += 46) {               // banded joints along the pipe, square to its run
    const { p, ang } = along(DUCT.path, s / DUCT_LEN), n = [-Math.sin(ang), Math.cos(ang)], t = [Math.cos(ang), Math.sin(ang)], w = DUCT.w + 3;
    clayForm(g, [[p[0] + n[0] * w - t[0] * 4, p[1] + n[1] * w - t[1] * 4], [p[0] + n[0] * w + t[0] * 4, p[1] + n[1] * w + t[1] * 4], [p[0] - n[0] * w + t[0] * 4, p[1] - n[1] * w + t[1] * 4], [p[0] - n[0] * w - t[0] * 4, p[1] - n[1] * w - t[1] * 4]], shade(P.mint, 0.1), { smooth: false, size: 8, sheen: 0.15 });
  }
  // the spout: a square collar at the pipe's end
  clayForm(g, [[SPOUT[0] - 30, SPOUT[1] - 6], [SPOUT[0] + 30, SPOUT[1] - 6], [SPOUT[0] + 26, SPOUT[1] + 10], [SPOUT[0] - 26, SPOUT[1] + 10]], shade(P.mint, 0.12), { smooth: false, size: 14, sheen: 0.2 });
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
  for (let i = 0; i <= 20; i++) { const u = i / 20; cable.push([lerp(636, 872, u), lerp(930, 786, u) + 70 * Math.sin(Math.PI * u)]); }
  tube(g, cable, 4, P.lilac);
}

// ---------------- the instrument ----------------
export const INSTR = { x: 1470, ringY: 800, slider: [[1430, 942], [1470, 942]] };
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
  const sp = (name, box, draw, o = {}) => S.sprite({ name, ...box, res: o.res ?? 1.25, mat: CLAY_MAT, edge: CLAY_EDGE, shadow: { blur: o.blur ?? 18 }, draw });
  const back = sp('funnel', { x: 640, y: 160, w: 660, h: 700 }, drawFunnelBack, { blur: 22 });
  const front = sp('funnel-lip', { x: 670, y: 310, w: 420, h: 130 }, drawFunnelFront, { blur: 10 });
  const lump = sp('lump', { x: -26, y: -26, w: 52, h: 52 }, (g) => clayForm(g, circle(0, 0, 20, 32), shade(P.mint, 0.06), { sheen: 0.3 }), { blur: 6 });
  const consoleS = sp('console', { x: 470, y: 760, w: 430, h: 240 }, drawConsole);
  const instr = sp('instrument', { x: 1390, y: 780, w: 160, h: 220 }, drawInstrumentBase);

  // the funnel: small solids swirl down the mouth, swell along the pipe as it carries them, and drop from the spout
  const KINDS = ['octa', 'cube', 'tetra', 'ico'], COLS = [P.pink, P.butter, P.lilac, P.aqua, P.mint, P.pinkDeep, P.blush, P.butterDeep];
  S.add({ name: 'funnel', z: 1000, shadow: { dx: 10, dy: 18, alpha: 0.4 }, anim: (t) => ({ sx: 1 + 0.006 * cyc(t, 2), sy: 1 + 0.006 * cyc(t, 2), ox: RIM.x, oy: 520 }), render(ctx, t, env) {
    drawSprites(ctx, [{ s: back }], env.shadow);
    const swell = [], late = [];
    const pulse = 0.5 + 0.5 * Math.cos(TAU * mod(t, 0.75) / 0.75);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, RIM.x, RIM.y + 6, 150, '#ffd9b0', 0.14 + 0.06 * pulse); ctx.restore();
    for (let n = 0; n < 8; n++) {
      const u = mod(t + n * 0.75, 6), kind = KINDS[n % 4], col = COLS[n], ang = [TAU * t / 3 + n, TAU * t / 2, n];
      if (u < 1.6) {                                       // spiralling in and down inside the mouth
        const k = u / 1.6, a = n * 1.3 + k * TAU * 1.25, rr = (1 - k) * 0.78 + 0.08;
        drawSolid(ctx, kind, RIM.x + Math.cos(a) * RIM.rx * rr, RIM.y + 8 + Math.sin(a) * RIM.ry * rr + k * 14, 9 * (1 - 0.5 * k), ang, col, { alpha: 1 - smoothstep(0.7, 1, k) });
      } else if (u >= 2.2 && u < 5.4) {                    // carried round the pipe
        const s = DUCT_LEN * (u - 2.2) / 3.2, { p, ang: a } = along(DUCT.path, s / DUCT_LEN);
        swell.push({ s: lump, x: p[0], y: p[1], rot: a, sx: 1.35, sy: 1.22, alpha: smoothstep(0, 30, s) * smoothstep(DUCT_LEN, DUCT_LEN - 30, s) });
      } else if (u >= 5.4) {                               // dropping from the spout into the mouth
        const k = (u - 5.4) / 0.6;
        late.push(() => drawSolid(ctx, kind, lerp(SPOUT[0], RIM.x + 10, k), lerp(SPOUT[1] + 18, RIM.y + 10, E.in(k)), 9, ang, col, { glowK: 0.3 }));
      }
    }
    drawSprites(ctx, [{ s: front }], { ...env.shadow, dx: 3, dy: 5 });
    drawSprites(ctx, swell, { ...env.shadow, alpha: 0 });
    for (const f of late) f();
  } });

  // the console: lights in a slow pattern, the knobs' marks, the lever, and a turning shape on the screen
  S.add({ name: 'console', z: 990, shadow: { dx: 8, dy: 14, alpha: 0.42 }, render(ctx, t, env) {
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
    const [sx, sy] = CONSOLE.screen;
    ctx.fillStyle = radial(ctx, sx - 3, sy - 3, 1, 14, ['#3d4b80', P.navy]); ctx.beginPath(); ctx.ellipse(sx, sy, 12, 18, 0, 0, TAU); ctx.fill();
    drawSolid(ctx, 'octa', sx, sy, 7, [TAU * t / 6, TAU * t / 12, 0.3], '#bfe8ff', { glowK: 0.4, glowColor: '#9fd8ff' });
  } });

  // the instrument: three rings turning on their own axes, a hovering solid, and once a loop a cube let go
  S.add({ name: 'instrument', z: 990, shadow: { dx: 8, dy: 14, alpha: 0.42 }, render(ctx, t, env) {
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
  } });
}
