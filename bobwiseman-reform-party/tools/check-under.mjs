// Under-table probe (draft 16, Robin: "I'd like to not see under the table"). Scans camAt(t) (with hover) at a step and
// reports, merged into ranges:
//   LOW    the camera under TOP + .25 inside the table's footprint plus a margin (table-local, so the turns count)
//   UNDER  the camera under the table top (TOP + .02) with any part of the table top's edge on screen within 40 m
// The driver's hole shots (camera inside .8 m of the hole's centre, under TOP + .6) are the one exception.
// PAGE=looks/dali.html node tools/check-under.mjs [t0=0] [t1=268.9] [step=.1] [margin=1.2]
import { chromium } from 'playwright';
const [t0 = 0, t1 = 268.9, step = .1, mg = 1.2] = process.argv.slice(2, 6).map(Number);
const b = await chromium.launch({ channel: 'chrome', headless: true }); const p = await b.newPage();
await p.goto('file://' + process.cwd() + '/' + (process.env.PAGE || 'looks/dali.html') + '?offline=1'); await p.evaluate(() => window.__ready);
const rows = await p.evaluate(([t0, t1, step, mg]) => { const out = [];
  for (let i = 0; t0 + i * step <= t1 + 1e-9; i++) { const t = t0 + i * step; const c = camAt(t);
    const yw = yaw(t), dx = c.x - carX(t), dz = c.z - carZ(t), lx = dx * Math.cos(yw) + dz * Math.sin(yw), lz = -dx * Math.sin(yw) + dz * Math.cos(yw);
    const hole = Math.hypot(lx, lz) < .8 && c.y < TOP + .6; if (hole) continue;
    if (Math.abs(lx) < TL + mg && Math.abs(lz) < TD + mg && c.y < TOP + .25) out.push([t, 'LOW', `y ${c.y.toFixed(2)} local ${lx.toFixed(1)},${lz.toFixed(1)}`]);
    if (c.y < TOP + .02 && Math.hypot(dx, dz) < 40) { C = c; CP = Math.cos(C.p); SP = Math.sin(C.p); CX = carX(t); CZ = carZ(t); YAW = yw; let vis = 0;
      for (let k = 0; k <= 16; k++) for (const [sx, sz] of [[1, 1], [1, -1]]) { const u = -1 + k / 8; for (const q of [PL(u * TL, TOP, sz * TD), PL(sx * TL, TOP, u * TD)]) if (q[2] > .3 && q[0] > 0 && q[0] < W && q[1] > 0 && q[1] < H) vis++; }
      if (vis) out.push([t, 'UNDER', `y ${c.y.toFixed(2)} pitch ${c.p.toFixed(2)} dist ${Math.hypot(dx, dz).toFixed(1)} (${vis} edge pts)`]); } }
  return out; }, [t0, t1, step, mg]);
await b.close();
const by = {}; for (const r of rows) (by[r[1]] = by[r[1]] || []).push(r);
const lines = []; for (const k in by) { const L = by[k]; let s = L[0][0], e = s, info = L[0][2], n = 1;
  const fl = () => lines.push([s, `${k.padEnd(6)} ${s.toFixed(1)}-${e.toFixed(1)}  ${n} frames  (${info})`]);
  for (let i = 1; i < L.length; i++) { if (L[i][0] - e > step * 1.5) { fl(); s = L[i][0]; info = L[i][2]; n = 0; } e = L[i][0]; n++; } fl(); }
lines.sort((a, b2) => a[0] - b2[0]);
console.log(`under-table probe ${t0}-${t1} step ${step}: ${rows.length} frames, ${lines.length} ranges\n` + lines.map((l) => l[1]).join('\n'));
