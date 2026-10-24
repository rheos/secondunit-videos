// node cues.mjs  ->  assets/cues.json
// Opens the film with ?cues=1, draws every frame on the 24 fps grid so each shot reports its animation events
// (cue / segc / cueWhen in js/kit.js), and writes them as [{k, t, size}] in film seconds for tools/sfx-bank/bank.py.
// Re-run after any timing change, then bank.py and mix.sh.
import { chromium } from 'playwright';
import fs from 'fs';
const b = await chromium.launch({ channel: 'chrome', headless: true });
const p = await b.newPage({ viewport: { width: 1080, height: 1080 } });
const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + process.cwd() + '/index.html?offline=1&cues=1'); await p.evaluate(() => window.__ready);
const cues = await p.evaluate(() => { const n = Math.round(13 * BAR * FPS); for (let i = 0; i < n; i++) drawFrame(i / FPS); return window.__cues(); });
await b.close();
fs.writeFileSync('assets/cues.json', JSON.stringify(cues, null, 0).replace(/\},\{/g, '},\n{') + '\n');
const n = {}; for (const c of cues) n[c.k] = (n[c.k] || 0) + 1;
console.log('cues', cues.length, JSON.stringify(n), '-> assets/cues.json');
if (errs.length) { console.log('PAGE ERRORS:\n' + [...new Set(errs)].join('\n')); process.exit(1); }
