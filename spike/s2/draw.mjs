// Spike S2 draw script (throwaway), runs inside the pinned Playwright image with --network none.
//   node /opt/draw.mjs <page.html> <times-json>   writes /out/sheet.png and prints one JSON line.
import fs from 'fs';
import crypto from 'crypto';
import { chromium } from '/w/node_modules/playwright/index.mjs';

const [page, timesJson] = process.argv.slice(2);
const times = JSON.parse(timesJson);
let sandbox = 'default';
let browser;
try { browser = await chromium.launch({ headless: true }); }
catch (e) { sandbox = 'no-sandbox'; browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] }); }
const p = await browser.newPage({ viewport: { width: 640, height: 360 } });
await p.goto('file:///w/song/' + page);
const fonts = await p.evaluate(() => getComputedStyle(document.body).fontFamily);
await p.screenshot({ path: '/out/sheet.png' });
await browser.close();
const buf = fs.readFileSync('/out/sheet.png');
console.log(JSON.stringify({ bytes: buf.length, sha: crypto.createHash('sha256').update(buf).digest('hex').slice(0, 16),
  times: times.length, sandbox, fontFamily: fonts }));
