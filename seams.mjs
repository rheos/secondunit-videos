// node seams.mjs [outDir] [name ...]   exports the four seam frames as lossless 1280x720 PNGs straight from the render pipeline
// (not from the mp4), for the generated transitions: seamN_start = outgoing look at the window start,
// seamN_end = incoming look at the window end. Frames are song frames on the 24 fps grid.
import { chromium } from 'playwright';
import fs from 'fs';
const SEAMS = { seam1_start: 2565, seam1_end: 2685, seam2_start: 2778, seam2_end: 2898 };
const [OUT = 'out/seams', ...ONLY] = process.argv.slice(2);
fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto('file://' + process.cwd() + '/hybrid.html?offline=1&scale=0.6666666667'); await p.evaluate(() => window.__ready);
for (const [name, f] of Object.entries(SEAMS).filter(([n]) => !ONLY.length || ONLY.includes(n))) {
  const url = await p.evaluate((t) => window.__framePNG(t), f / 24);
  fs.writeFileSync(`${OUT}/${name}.png`, Buffer.from(url.split(',')[1], 'base64'));
  console.log(name, 'frame', f, 't', (f / 24).toFixed(4));
}
await b.close();
