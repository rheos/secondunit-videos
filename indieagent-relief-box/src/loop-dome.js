// The living loop, the dome: the honeycomb curves up and over the world into a dome that turns slowly as one
// piece (McKenna's elf space is enclosed and domed, a room that turns). Seen from inside, looking a little up: each
// cell is a hexagon on the sphere, projected in perspective, so the cells run small and close toward the horizon
// and widen overhead. All columns share one angular width, so turning the dome by two columns closes the loop.
// The cells breathe in slow waves of light; the window-wheel sun hangs at the top as the dome's lantern.

import { RNG } from '../vendor/paper-fox/core/rng.js';
import { glow } from '../vendor/paper-fox/core/piece.js';
import { mix, shade, rgba } from '../vendor/paper-fox/core/color.js';
import { PAL } from './kit.js';

const P = PAL, TAU = Math.PI * 2;
// DOWN rows run on below the horizon, so no bare shell shows above the hills (Robin: no gap in the hex tiles)
const COLS = 96, DA = TAU / COLS, DPHI = DA * 0.86, ROWS = 26, DOWN = 6, PITCH = 0.26, FOCAL = 760;
const CX = 960, CY = 540;

// a direction on the dome (theta round, phi up) to authored screen coordinates, or null when behind the eye
function proj(theta, phi) {
  const x = Math.cos(phi) * Math.sin(theta), y = Math.sin(phi), z = Math.cos(phi) * Math.cos(theta);
  const y1 = y * Math.cos(PITCH) - z * Math.sin(PITCH), z1 = y * Math.sin(PITCH) + z * Math.cos(PITCH);
  if (z1 < 0.08) return null;
  return [CX + FOCAL * x / z1, CY - FOCAL * y1 / z1, z1];
}

// loop: the film's loop length in seconds (passed in: the world module imports this one)
export function addDome(S, loop) {
  const rng = new RNG('dome');
  // a little variation between cells that repeats every two columns, so the dome's two-column turn closes the loop
  const tint = [...Array(2 * (ROWS + DOWN))].map(() => rng.range(-0.04, 0.04));
  S.add({ name: 'dome', z: 6000, render(ctx, t) {
    const turn = DA * 2 * t / loop;
    // the shell behind the cells
    ctx.fillStyle = mix(P.wall, P.pink, 0.18); ctx.fillRect(-600, -500, 3120, 2100);
    ctx.lineJoin = 'round';
    for (let r = 0; r < ROWS + DOWN; r++) {
      const phi = -0.04 + (r - DOWN) * DPHI, off = (r & 1) * DA / 2;
      for (let c = 0; c < COLS; c++) {
        const th = c * DA + off + turn, rel = Math.atan2(Math.sin(th), Math.cos(th));
        if (Math.abs(rel) > 1.35) continue;
        const pts = [];
        let ok = true;
        for (let k = 0; k < 6; k++) {
          const a = Math.PI / 6 + k * Math.PI / 3, q = proj(rel + Math.cos(a) * DA * 0.5, phi + Math.sin(a) * DPHI * 0.62);
          if (!q) { ok = false; break; }
          pts.push(q);
        }
        if (!ok) continue;
        // light from the lantern overhead, and a slow wave of light running round the dome
        // the wave is pinned to where a cell is on screen, not to the cell, so it too comes round each loop
        const wave = 0.5 + 0.5 * Math.sin(TAU * t / 4 - rel * 6 - r / 1.4);
        const lit = 0.18 + 0.5 * Math.min(1, Math.max(-0.15, phi) / 1.1) - 0.25 * Math.abs(rel) / 1.35 + 0.08 * wave + tint[r * 2 + (c & 1)];
        const base = mix(mix(P.wallLight, P.blush, 0.35), '#fff6ea', Math.max(0, lit));
        // each cell an exact raised hexagon: a bevelled rim in the shell's tone, a flat top face set inside it, a
        // bright edge on the sides toward the lantern and a dark edge on the sides away from it
        const cx = pts.reduce((a, q) => a + q[0], 0) / 6, cy = pts.reduce((a, q) => a + q[1], 0) / 6;
        const top = pts.map(([x, y]) => [cx + (x - cx) * 0.8, cy + (y - cy) * 0.8]);
        const poly = (q) => { ctx.beginPath(); q.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); };
        poly(pts); ctx.fillStyle = shade(base, -0.07); ctx.fill();
        poly(top); ctx.fillStyle = base; ctx.fill();
        const w = Math.max(0.6, 2.2 * pts[0][2]);
        ctx.lineWidth = w; ctx.lineJoin = 'miter'; ctx.lineCap = 'butt';
        // vertices 3, 4, 5 are the upper edges (toward the lantern), 0, 1, 2 the lower ones
        ctx.beginPath(); ctx.moveTo(...top[3]); ctx.lineTo(...top[4]); ctx.lineTo(...top[5]); ctx.lineTo(...top[0]);
        ctx.strokeStyle = rgba('#ffffff', 0.8); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(...top[0]); ctx.lineTo(...top[1]); ctx.lineTo(...top[2]); ctx.lineTo(...top[3]);
        ctx.strokeStyle = rgba(shade(base, -0.35), 0.55); ctx.stroke();
        poly(pts); ctx.strokeStyle = rgba(shade(base, -0.28), 0.6); ctx.lineWidth = w * 0.8; ctx.stroke();
      }
    }
    // the lantern's light pooled at the top of the dome
    ctx.save(); ctx.globalCompositeOperation = 'soft-light';
    glow(ctx, CX, -40, 900, '#fff0d8', 0.6);
    ctx.restore();
  } });
}
