import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
p.on('console', m => console.log(m.type(), m.text())); p.on('pageerror', e => console.log('ERR', String(e)));
const t0 = Date.now(); await p.goto('file://' + process.cwd() + `/index.html?offline=1&scale=${process.argv[2] || 1}`); await p.evaluate(() => window.__ready);
console.log('load ms', Date.now() - t0); await b.close();
