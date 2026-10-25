// The living loop, the machines (draft 2). All timing is periodic in LOOP (12 s) so the film loops without a seam.
//
//   the funnel     one funnel that feeds itself: material gathers in the wide top and swirls down; it leaves by a
//                  duct at the bottom that turns right, climbs past the funnel's lip, turns left over it and drops
//                  back in. Beads go round it for ever (a lap every 6 s, eight beads); in the duct a bead shows as a
//                  swelling that travels along it and lights two windows in the riser. The funnel glows faintly
//                  from inside and breathes.
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
import { drawBead } from './density.js';
import { LOOP, cyc } from './loop-world.js';
import { drawSolid } from './loop-shapes.js';

const P = PAL, TAU = Math.PI * 2;
const circle = (cx, cy, r, n = 36) => [...Array(n)].map((_, i) => [cx + Math.cos(i / n * TAU) * r, cy + Math.sin(i / n * TAU) * r]);
const mod = (x, m) => ((x % m) + m) % m;
const plen = (pts) => pts.reduce((a, p, i) => i ? a + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0, 0);

// ---------------- the funnel ----------------
export const RIM = { x: 880, y: 372, rx: 188, ry: 44 };
const THROAT = [880, 640], TW = 15;
export const DUCT = { w: 15, path: chaikin([[880, 630], [880, 782], [1196, 782], [1196, 246], [906, 246], [906, 296]], 4) };
const DUCT_LEN = plen(DUCT.path);
const SPOUT = DUCT.path[DUCT.path.length - 1];
const WINDOWS = [[1196, 640], [1196, 470]];

// the funnel's wall: concave sides from the rim to the throat
function wall() {
  const L = [], R = [];
  for (let i = 0; i <= 24; i++) {
    const u = i / 24, k = 1 - (1 - u) ** 1.8, hw = lerp(RIM.rx, TW, k), y = lerp(RIM.y, THROAT[1], u);
    L.push([RIM.x - hw, y]); R.push([RIM.x + hw, y]);
  }
  return [...L, ...R.reverse()];
}
const rimPts = (k = 1, from = 0, to = TAU, n = 48) => [...Array(n + 1)].map((_, i) => { const a = from + (to - from) * i / n; return [RIM.x + Math.cos(a) * RIM.rx * k, RIM.y + Math.sin(a) * RIM.ry * k]; });

function drawFunnelBack(g) {
  // the duct first (it passes behind the funnel on its way round), then the funnel
  tube(g, DUCT.path, DUCT.w, P.mint);
  for (let s = 30; s < DUCT_LEN - 20; s += 30) {
    const { p, ang } = along(DUCT.path, s / DUCT_LEN), n = [-Math.sin(ang), Math.cos(ang)];
    g.strokeStyle = rgba(shade(P.mint, -0.3), 0.32); g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(p[0] + n[0] * DUCT.w * 0.9, p[1] + n[1] * DUCT.w * 0.9); g.lineTo(p[0] - n[0] * DUCT.w * 0.9, p[1] - n[1] * DUCT.w * 0.9); g.stroke();
  }
  for (const [x, y] of WINDOWS) {
    clayForm(g, circle(x, y, 22, 32), P.bone, { sheen: 0.25 });
    g.fillStyle = radial(g, x - 4, y - 4, 2, 16, ['#3b4876', P.navy]); g.beginPath(); g.arc(x, y, 15, 0, TAU); g.fill();
  }
  clayForm(g, circle(SPOUT[0], SPOUT[1] + 2, 19, 30), shade(P.mint, 0.08), { sheen: 0.25 });
  dot(g, SPOUT[0], SPOUT[1] + 4, 9, shade(P.mint, -0.6));
  // the funnel: wall, then the dark inside seen through the mouth, then the back of the rim
  clayForm(g, wall(), P.butter, { size: 120, sheen: 0.2 });
  for (let k = 1; k < 7; k++) {                               // thrown rings around the wall
    const u = k / 7, kk = 1 - (1 - u) ** 1.8, hw = lerp(RIM.rx, TW, kk), y = lerp(RIM.y, THROAT[1], u);
    g.strokeStyle = rgba(shade(P.butter, -0.25), 0.35); g.lineWidth = 1.6;
    g.beginPath(); g.ellipse(RIM.x, y, hw, Math.max(2, RIM.ry * hw / RIM.rx), 0, 0.1, Math.PI - 0.1); g.stroke();
  }
  const mouth = rimPts(0.94);
  g.fillStyle = radial(g, RIM.x, RIM.y + 6, 4, RIM.rx, ['#2a2340', '#4a3a52', shade(P.butter, -0.45)]);
  g.beginPath(); mouth.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill();
  const back = [...rimPts(1.06, Math.PI, TAU, 30), ...rimPts(0.93, TAU, Math.PI, 30)];
  clayForm(g, back, shade(P.pink, 0.04), { size: 18, sheen: 0.2, smooth: false });
}
function drawFunnelFront(g) {
  // the front half of the lip, drawn after the beads that drop into the mouth
  const front = [...rimPts(1.06, 0, Math.PI, 30), ...rimPts(0.93, Math.PI, 0, 30)];
  clayForm(g, front, P.pink, { size: 20, sheen: 0.28, smooth: false });
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
  const back = sp('funnel', { x: 640, y: 200, w: 620, h: 640 }, drawFunnelBack, { blur: 22 });
  const front = sp('funnel-lip', { x: 670, y: 310, w: 420, h: 130 }, drawFunnelFront, { blur: 10 });
  const lump = sp('lump', { x: -26, y: -26, w: 52, h: 52 }, (g) => clayForm(g, circle(0, 0, 20, 32), shade(P.mint, 0.06), { sheen: 0.3 }), { blur: 6 });
  const beads = [P.pink, P.butter, P.lilac, P.aqua, P.pinkDeep, P.mint, '#c6d957', P.blush].map((c, i) => sp(`fbead-${i}`, { x: -20, y: -20, w: 40, h: 40 }, (g) => drawBead(g, c), { res: 1.5, blur: 8 }));
  const consoleS = sp('console', { x: 470, y: 760, w: 430, h: 240 }, drawConsole);
  const instr = sp('instrument', { x: 1390, y: 780, w: 160, h: 220 }, drawInstrumentBase);

  // the funnel: glow inside, beads swirling down in the mouth, swellings along the duct, beads dropping from the spout
  S.add({ name: 'funnel', z: 1000, shadow: { dx: 10, dy: 18, alpha: 0.4 }, anim: (t) => ({ sx: 1 + 0.01 * cyc(t, 2), sy: 1 + 0.01 * cyc(t, 2), ox: RIM.x, oy: 520 }), render(ctx, t, env) {
    drawSprites(ctx, [{ s: back }], env.shadow);
    const swirl = [], swell = [], fall = [];
    for (let n = 0; n < 8; n++) {
      const u = mod(t + n * 0.75, 6), b = beads[n];
      if (u < 1.6) {                                       // swirling inward and down inside the mouth
        const k = u / 1.6, a = n * 1.3 + k * TAU * 1.25, rr = (1 - k) * 0.78 + 0.08;
        swirl.push({ s: b, x: RIM.x + Math.cos(a) * RIM.rx * rr, y: RIM.y + 6 + Math.sin(a) * RIM.ry * rr + k * 14, sx: 0.75 - 0.35 * k, sy: 0.75 - 0.35 * k, rot: a * 2, alpha: 1 - smoothstep(0.7, 1, k) });
      } else if (u >= 2.2 && u < 5.4) {                    // travelling the duct
        const s = DUCT_LEN * (u - 2.2) / 3.2, { p, ang } = along(DUCT.path, s / DUCT_LEN);
        swell.push({ s: lump, x: p[0], y: p[1], rot: ang, sx: 1.25, sy: 0.92, alpha: smoothstep(0, 30, s) * smoothstep(DUCT_LEN, DUCT_LEN - 30, s) });
      } else if (u >= 5.4) {                               // dropping from the spout into the mouth
        const k = (u - 5.4) / 0.6;
        fall.push({ s: b, x: lerp(SPOUT[0], RIM.x + 14, k), y: lerp(SPOUT[1] + 14, RIM.y + 8, E.in(k)), rot: k * 3, sx: 0.8, sy: 0.8 });
      }
    }
    // light from inside the funnel, pulsing with each bead that drops in
    const pulse = 0.5 + 0.5 * Math.cos(TAU * mod(t, 0.75) / 0.75);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    glow(ctx, RIM.x, RIM.y + 4, 140, '#ffc9a0', 0.16 + 0.06 * pulse);
    ctx.restore();
    drawSprites(ctx, swirl, { ...env.shadow, alpha: 0 });
    drawSprites(ctx, [{ s: front }], { ...env.shadow, dx: 3, dy: 5 });
    drawSprites(ctx, swell, { ...env.shadow, alpha: 0 });
    for (const [wx, wy] of WINDOWS) for (const it of swell) {   // a window lights as a bead passes behind it
      const d = Math.hypot(it.x - wx, it.y - wy);
      if (d < 26) { ctx.save(); ctx.globalAlpha = 1 - d / 26; ctx.globalCompositeOperation = 'lighter'; glow(ctx, wx, wy, 26, '#bfe8ff', 0.6); ctx.restore(); }
    }
    drawSprites(ctx, fall, { ...env.shadow, dx: 4, dy: 7 });
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
