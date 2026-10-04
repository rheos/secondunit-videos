// node patch.mjs <page> <t0> <i0> <i1> <framesDir> [workers]   redraw frames i0..i1-1 of a render (frame i at t0 + i/24)
import { chromium } from 'playwright'; import fs from 'fs';
const [page, a0, s0, s1, dir, wk = '4'] = process.argv.slice(2); const t0 = Number(a0), i0 = Number(s0), i1 = Number(s1), WK = Number(wk);
const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'] });
await Promise.all([...Array(WK)].map(async (_, w) => {
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + process.cwd() + `/${page}.html?offline=1&scale=1`); await p.evaluate(() => window.__ready);
  for (let i = i0 + w; i < i1; i += WK) { const url = await p.evaluate((t) => window.__frameJPEG(t, .92), t0 + i / 24); fs.writeFileSync(`${dir}/f_${String(i).padStart(6, '0')}.jpg`, Buffer.from(url.split(',')[1], 'base64')); }
}));
await b.close(); console.log('patched', i0, i1);
