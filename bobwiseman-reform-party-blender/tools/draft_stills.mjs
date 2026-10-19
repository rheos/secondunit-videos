// Grab draft frames as JPEGs at given frame numbers (frame 1 = t0), for side-by-sides with the Blender build.
//   node tools/draft_stills.mjs <reform-party project dir> <t0> <out dir> <f,f,...>
import fs from 'fs'; import path from 'path'; import { createRequire } from 'module';
const [proj, t0s, outDir, list] = process.argv.slice(2);
const require = createRequire(path.join(path.resolve(proj), 'package.json'));
const { chromium } = require('playwright');
const b = await chromium.launch({ channel: 'chrome', headless: true });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto('file://' + path.resolve(proj) + '/looks/dali.html?offline=1'); await p.evaluate(() => window.__ready);
fs.mkdirSync(outDir, { recursive: true });
for (const f of list.split(',').map(Number)) {
  const url = await p.evaluate((t) => window.__frameJPEG(t, .92), Number(t0s) + (f - 1) / 24);
  fs.writeFileSync(path.join(outDir, 'f' + String(f).padStart(4, '0') + '.jpg'), Buffer.from(url.split(',')[1], 'base64'));
}
await b.close();
