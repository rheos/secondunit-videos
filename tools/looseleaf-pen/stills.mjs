// Before/after stills: the film's own line vs the Looseleaf pen, same song times.
// node stills.mjs <outdir> <t1,t2,...> [query, e.g. pen=pencil]
// Writes <outdir>/t<time>_kit.png, _pen.png, and a crop pair of the centre 640x360 at 2x.
import { createRequire } from 'module';
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const require = createRequire(process.env.PW_FROM || import.meta.url);
const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url));
const [out, ts, qs = ''] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const pages = {
  kit: path.resolve(here, '../../bobwiseman-travel-agent/looks/film.html'),
  pen: path.resolve(here, 'ta-pen.html'),
};
const b = await chromium.launch({ channel: 'chrome', headless: true });
const errs = [];
for (const [k, file] of Object.entries(pages)) {
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('pageerror', (e) => errs.push(`${k}: ${e}`)); p.on('console', (m) => m.type() === 'error' && errs.push(`${k}: ${m.text()}`));
  await p.goto(`file://${file}?offline=1${qs ? '&' + qs : ''}`); await p.evaluate(() => window.__ready);
  for (const t of ts.split(',').map(Number)) {
    const url = await p.evaluate((t) => window.__frameJPEG(t, .95), t);
    fs.writeFileSync(`${out}/t${t}_${k}.jpg`, Buffer.from(url.split(',')[1], 'base64'));
  }
  await p.close();
}
await b.close();
if (errs.length) console.log('ERRORS:\n' + [...new Set(errs)].slice(0, 10).join('\n'));
console.log('wrote', out);
