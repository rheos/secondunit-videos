// node dump.mjs <page> <dir> <t0> <n> [scale]   writes frames t0 + i/24 (i < n) as JPEGs exactly as render.mjs draws them
import { chromium } from 'playwright'; import fs from 'fs';
const [page, dir, a0, an, sc = '0.6667'] = process.argv.slice(2); const t0 = Number(a0), n = Number(an);
fs.mkdirSync(dir, { recursive: true });
const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto('file://' + process.cwd() + `/${page}.html?offline=1&scale=${sc}`); await p.evaluate(() => window.__ready);
for (let i = 0; i < n; i++) { const url = await p.evaluate((t) => window.__frameJPEG(t, .92), t0 + i / 24); fs.writeFileSync(`${dir}/f_${String(i).padStart(6, '0')}.jpg`, Buffer.from(url.split(',')[1], 'base64')); }
await b.close(); console.log('dumped', n);
