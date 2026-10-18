// node rstills.mjs <outdir> <t> [t ...]   full-size stills of roto.html at song times (for checks and contact sheets)
import { chromium } from 'playwright'; import fs from 'fs';
const [dir, ...ts] = process.argv.slice(2); fs.mkdirSync(dir, { recursive: true });
const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } }); const errs = [];
p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); p.on('pageerror', e => errs.push(String(e)));
await p.goto('file://' + process.cwd() + '/roto.html?offline=1' + (process.env.QS ? '&' + process.env.QS : '')); await p.evaluate(() => window.__ready);
for (const t of ts) { const u = await p.evaluate((t) => window.__frameJPEG(t, .9), Number(t)); fs.writeFileSync(`${dir}/t_${Number(t).toFixed(2).padStart(7, '0')}.jpg`, Buffer.from(u.split(',')[1], 'base64')); }
await b.close(); if (errs.length) console.log('ERRORS:\n' + [...new Set(errs)].slice(0, 20).join('\n'));
