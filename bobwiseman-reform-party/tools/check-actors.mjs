// Actor check for the Dali look (Robin, draft 10 audit: nobody passes through anybody, nothing blinks in or out).
// PAGE=looks/dali.html node tools/check-actors.mjs [t0] [t1] [step=0.25] [out.txt]
// Renders each sampled time with ?actors=1, reads what every actor reported through ACT.note (js/dali/actors.js),
// and reports two kinds of failure, merged into time ranges:
//   FADE    a solid actor on screen with alpha or scale under .98 that is not marked cover (it should move in or out)
//   OVERLAP two solid actors on screen closer than the sum of their radii (one passes through the other)
// Exit code 1 if anything fails. Run from the project folder (or a sandbox copy of it).
import { chromium } from 'playwright'; import fs from 'fs';
const [t0 = 0, t1 = 268.9, step = .25] = process.argv.slice(2, 5).map(Number), outFile = process.argv[5];
const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
await p.goto('file://' + process.cwd() + '/' + (process.env.PAGE || 'looks/dali.html') + '?offline=1&actors=1'); await p.evaluate(() => window.__ready);
const fails = [];
for (let t = t0; t <= t1 + 1e-9; t += step) {
  const r = await p.evaluate((t) => { render(t); const out = [];
    const on = ACT.list.map((a) => { const q = P(a.X, a.h / 2, a.Z); if (q[2] < .3) return null; const k = C.f / q[2], rad = a.r * k, hh = a.h * k / 2;
      if (q[0] + rad < 0 || q[0] - rad > W || q[1] + hh < 0 || q[1] - hh > H) return null; return { ...a, px: Math.round(q[0]), py: Math.round(q[1]), size: Math.round(Math.max(rad, hh)) }; }).filter(Boolean);
    for (const a of on) if ((a.a < .98 || a.s < .98) && !a.cover && a.size > 6) out.push(['FADE', a.id, '', `a ${a.a.toFixed(2)} s ${a.s.toFixed(2)} at ${a.px},${a.py}`]);
    const cell = 3, grid = new Map(); for (const a of on) { const key = Math.floor(a.X / cell) + ',' + Math.floor(a.Z / cell); if (!grid.has(key)) grid.set(key, []); grid.get(key).push(a); }
    for (const a of on) { const gx = Math.floor(a.X / cell), gz = Math.floor(a.Z / cell);
      for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) for (const c of grid.get((gx + dx) + ',' + (gz + dz)) || []) {
        if (c === a || c.id <= a.id) continue; const d = Math.hypot(a.X - c.X, a.Z - c.Z), lim = (a.r + c.r) * .9;
        if (d < lim && a.size > 6 && c.size > 6) out.push(['OVERLAP', a.id, c.id, `${d.toFixed(2)} m < ${lim.toFixed(2)} at ${a.px},${a.py}`]); } }
    return { out, n: ACT.list.length }; }, t);
  for (const f of r.out) fails.push([t, ...f]);
}
await b.close();
// merge into ranges per (kind, a, b)
const by = new Map(); for (const [t, kind, a, c, info] of fails) { const key = kind + '|' + a + '|' + c; if (!by.has(key)) by.set(key, []); by.get(key).push([t, info]); }
const lines = []; for (const [key, list] of by) { const [kind, a, c] = key.split('|'); let s = list[0][0], e = s, info = list[0][1];
  const flush = () => lines.push([s, `${kind.padEnd(7)} ${s.toFixed(2)}-${e.toFixed(2)}  ${a}${c ? '  x  ' + c : ''}  (${info})`]);
  for (let i = 1; i < list.length; i++) { if (list[i][0] - e > step * 1.5) { flush(); s = list[i][0]; info = list[i][1]; } e = list[i][0]; } flush(); }
lines.sort((x, y) => x[0] - y[0]);
const text = `actor check ${t0}-${t1} step ${step}: ${lines.length} failing ranges${errs.length ? '\nPAGE ERRORS: ' + [...new Set(errs)].join(' | ') : ''}\n` + lines.map((l) => l[1]).join('\n') + '\n';
if (outFile) fs.writeFileSync(outFile, text); console.log(text.length > 6000 ? text.slice(0, 6000) + '\n... (see ' + (outFile || 'output') + ')' : text);
process.exit(lines.length || errs.length ? 1 : 0);
