// node lineup.mjs : out/cast-lineup-1.png, -2.png (full size)
import { createRequire } from 'module'; import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const require = createRequire(process.env.PW_FROM || import.meta.url); const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url)); fs.mkdirSync(path.join(here, 'out'), { recursive: true });
const b = await chromium.launch({ channel: 'chrome', headless: true }); const p = await b.newPage({ viewport: { width: 1280, height: 720 } }); const errs = [];
p.on('pageerror', (e) => errs.push(String(e))); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
await p.goto('file://' + path.join(here, 'lineup.html')); await p.evaluate(() => window.setup());
for (const n of [1, 2, 3]) { const u = await p.evaluate((n) => { window.drawPlate(n); return document.getElementById('c').toDataURL('image/png'); }, n); fs.writeFileSync(path.join(here, 'out', `cast-lineup-${n}.png`), Buffer.from(u.split(',')[1], 'base64')); }
await b.close(); if (errs.length) { console.log(errs.join('\n')); process.exit(1); } console.log('ok');
