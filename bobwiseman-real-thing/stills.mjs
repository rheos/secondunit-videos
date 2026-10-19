// node stills.mjs t1 t2 ... -> out/stills/s_<t>.jpg (full size), plus a 4-wide contact sheet out/stills/sheet.jpg
import { chromium } from 'playwright'; import fs from 'fs'; import { execSync } from 'child_process';
const ts = process.argv.slice(2).map(Number); fs.mkdirSync('out/stills', { recursive: true });
const b = await chromium.launch({ channel: 'chrome', headless: true }); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
const errs = []; p.on('pageerror', (e) => errs.push(String(e))); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + process.cwd() + '/' + (process.env.PAGE || 'index.html') + '?offline=1'); await p.evaluate(() => window.__ready);
const files = [];
for (const t of ts) { const u = await p.evaluate((t) => window.__frameJPEG(t, .9), t); const f = `out/stills/s_${t.toFixed(2)}.jpg`; fs.writeFileSync(f, Buffer.from(u.split(',')[1], 'base64')); files.push(f); }
await b.close(); if (errs.length) console.log('ERRORS', [...new Set(errs)].join('\n'));
const cols = 4, rows = Math.ceil(files.length / cols);
execSync(`ffmpeg -y -loglevel error ${files.map((f) => `-i ${f}`).join(' ')} -filter_complex "${files.map((_, i) => `[${i}]scale=480:270[v${i}]`).join(';')};${files.map((_, i) => `[v${i}]`).join('')}xstack=inputs=${files.length}:layout=${files.map((_, i) => `${(i % cols) * 480}_${Math.floor(i / cols) * 270}`).join('|')}:fill=black" out/stills/sheet.jpg`);
console.log('sheet', files.length);
