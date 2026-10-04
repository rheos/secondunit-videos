// node export_seams.mjs   writes lossless PNG anchors for the generative windows (window.SEAMS) at 1280x720
import { chromium } from 'playwright'; import fs from 'fs';
const out = '../../out/seams'; fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto('file://' + process.cwd() + '/riso.html?offline=1&scale=0.6667'); await p.evaluate(() => window.__ready);
const seams = await p.evaluate(() => window.SEAMS);
for (const z of seams) for (const [k, t] of [['start', z.a], ['end', z.b]]) {
  const url = await p.evaluate((t) => window.__framePNG(t), t);
  fs.writeFileSync(`${out}/${z.name}_${k}.png`, Buffer.from(url.split(',')[1], 'base64'));
  console.log(`${z.name}_${k}.png  t=${t}  frame=${Math.round(t * 24)}`);
}
await b.close();
