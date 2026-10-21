// node tools/blueprint-kit/cues.mjs <project-folder>  ->  <project>/cues.json
// Loads the project's root page with HyperFrames' runtime (as tools/cloud-render/render-slice.mjs does), lets every
// plate build its timeline, and writes the kit's sound cues (BP.CUES: typed characters, set letters, pen strokes,
// stamps, slides, whooshes, plate exits, in score seconds). Re-run after any timing change, then sfx.py.
// Needs the installed Chrome and `npm install` in tools/blueprint-kit once.
import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';
const proj = path.resolve(process.argv[2] || '.');
const page = path.join(proj, 'index.html');
const src = fs.readFileSync(page, 'utf8');
const pkg = fs.existsSync(path.join(proj, 'package.json')) ? fs.readFileSync(path.join(proj, 'package.json'), 'utf8') : '';
const ver = (pkg.match(/hyperframes@(\d+\.\d+\.\d+)/) || [])[1] || '0.8.162';
const res = await fetch(`https://cdn.jsdelivr.net/npm/hyperframes@${ver}/dist/hyperframe.runtime.iife.js`);
if (!res.ok) { console.log(`could not fetch the HyperFrames ${ver} runtime: HTTP ${res.status}`); process.exit(1); }
const rt = await res.text(), at = src.search(/<\/head>/i);
const open = path.join(proj, '.cues-index.html');
fs.writeFileSync(open, src.slice(0, at) + `<script data-hyperframes-runtime="1">${rt}</script>\n` + src.slice(at));
process.on('exit', () => fs.rmSync(open, { force: true }));
const br = await chromium.launch({ channel: 'chrome', headless: true, args: ['--allow-file-access-from-files'] });
const p = await br.newPage({ viewport: { width: 1920, height: 1080 } });
const errs = [];
p.on('pageerror', (e) => errs.push(String(e)));
p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + open, { waitUntil: 'domcontentloaded' });
await p.waitForFunction(() => window.__player && typeof window.__player.renderSeek === 'function' && window.__player.getDuration() > 0, null, { timeout: 120000, polling: 100 });
await p.evaluate(async () => { window.__player.renderSeek(0); await document.fonts.ready; });
await p.waitForTimeout(500);
const cues = await p.evaluate(() => window.BP.CUES);
await br.close();
fs.writeFileSync(path.join(proj, 'cues.json'), JSON.stringify(cues));
const n = {};
for (const c of cues) n[c.k] = (n[c.k] || 0) + 1;
console.log('cues', cues.length, JSON.stringify(n), '->', path.join(proj, 'cues.json'));
if (errs.length) console.log('PAGE ERRORS:\n' + [...new Set(errs)].slice(0, 20).join('\n'));
