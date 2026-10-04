// node anchors.mjs <page> <outdir> frame...   lossless PNGs of song frames (frame/24 s) at 1280x720, for anchor checks
import { chromium } from 'playwright'; import fs from 'fs';
const [page, out, ...fr] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto('file://' + process.cwd() + `/${page}.html?offline=1&scale=0.6667`); await p.evaluate(() => window.__ready);
for (const f of fr) { const url = await p.evaluate((t) => window.__framePNG(t), Number(f) / 24); fs.writeFileSync(`${out}/${page}_${f}.png`, Buffer.from(url.split(',')[1], 'base64')); }
await b.close(); console.log('wrote', fr.length);
