// node cues.mjs [t0 t1]   -> assets/cues.json: the animation events the page reports (typed characters, kinetic
// letters, leaders) with their times, for sfx.py to voice. Re-run after any timing change, before sfx.py.
import { chromium } from 'playwright';
import fs from 'fs';
const [t0, t1] = [Number(process.argv[2] || 0), Number(process.argv[3] || 118)];
const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu', '--allow-file-access-from-files'] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
const errs = []; p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); p.on('pageerror', e => errs.push(String(e)));
await p.goto('file://' + process.cwd() + '/index.html?offline=1'); await p.evaluate(() => window.__ready);
const cues = await p.evaluate(([a, c]) => window.__collectCues(a, c, 24), [t0, t1]);
await b.close();
fs.writeFileSync('assets/cues.json', JSON.stringify(cues));
const n = {}; for (const c of cues) n[c.k] = (n[c.k] || 0) + 1;
console.log('cues', cues.length, n, 'written assets/cues.json');
if (errs.length) console.log('ERRORS:\n' + [...new Set(errs)].slice(0, 20).join('\n'));
