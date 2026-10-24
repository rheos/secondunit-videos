import { chromium } from 'playwright'; import fs from 'fs';
const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=metal', '--enable-gpu'] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto('file://' + process.cwd() + '/looks/dali.html?offline=1&actors=1'); await p.evaluate(() => window.__ready);
const out = {};
for (let t = 110; t <= 269; t += .5) { const r = await p.evaluate((t) => { render(t); return ACT.list.filter((a) => !a.id.startsWith('burn:') && Math.hypot(a.X - MAN.x, a.Z - MAN.z) < 200).map((a) => [a.id, +a.X.toFixed(2), +a.Z.toFixed(2), a.r]); }, t);
  for (const [id, X, Z, rr] of r) (out[id] = out[id] || []).push([t, X, Z, rr]); }
fs.writeFileSync('out/foreign.json', JSON.stringify(out)); console.log(Object.keys(out).length); await b.close();
