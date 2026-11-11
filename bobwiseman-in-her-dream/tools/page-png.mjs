import { chromium } from 'playwright';
import fs from 'fs';
const [page, out] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome', headless: true }); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
await p.goto('file://' + page); await p.waitForFunction(() => window.__ready);
const url = await p.evaluate(() => document.getElementById('c').toDataURL('image/png'));
fs.writeFileSync(out, Buffer.from(url.split(',')[1], 'base64')); await b.close();
