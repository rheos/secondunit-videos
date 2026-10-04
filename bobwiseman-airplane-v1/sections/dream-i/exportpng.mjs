// node exportpng.mjs <page> <t> <out.png> [scale]   one lossless frame straight from the canvas
import { chromium } from 'playwright'; import fs from 'fs'; import path from 'path';
const [page, ts, out, sc = '0.6666667'] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto('file://' + process.cwd() + `/${page}.html?offline=1&scale=${sc}`); await p.evaluate(() => window.__ready);
const url = await p.evaluate((t) => { renderFrame(t); return document.getElementById('c').toDataURL('image/png'); }, Number(ts));
fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, Buffer.from(url.split(',')[1], 'base64')); await b.close(); console.log('wrote', out);
