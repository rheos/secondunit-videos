// Dump draft 5's own per-frame state (camera, car, sun, poses, prop positions) as JSON, so the Blender build
// renders the same world instead of re-deriving it. Each probe is a file holding one JS expression that
// evaluates to (t) => ({...}); it runs in the page's global scope, so it can call camAt, carX, seatState...
//   node tools/export_state.mjs <reform-party project dir> <t0> <frames> <probe.js> [<probe.js> ...]
// Writes out/state/<probe name>.json: { t0, fps, t: [...], f: [state per frame] }. Run from this folder;
// needs playwright (the project's node_modules) and Chrome.
import fs from 'fs'; import path from 'path'; import { createRequire } from 'module';
const [proj, t0s, nfs, ...probes] = process.argv.slice(2);
const require = createRequire(path.join(path.resolve(proj), 'package.json'));
const { chromium } = require('playwright');
const T0 = Number(t0s), NF = Number(nfs), FPS = 24, times = [...Array(NF).keys()].map((i) => T0 + i / FPS);
const b = await chromium.launch({ channel: 'chrome', headless: true });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
await p.goto('file://' + path.resolve(proj) + '/looks/dali.html?offline=1'); await p.evaluate(() => window.__ready);
fs.mkdirSync('out/state', { recursive: true });
for (const pr of probes) {
  const src = fs.readFileSync(pr, 'utf8');
  const f = await p.evaluate(([src, times]) => { const fn = (0, eval)(src); return times.map((t) => fn(t)); }, [src, times]);
  const name = path.basename(pr, '.js'), out = `out/state/${name}.json`;
  fs.writeFileSync(out, JSON.stringify({ t0: T0, fps: FPS, t: times, f }));
  console.log(out, f.length, 'frames', JSON.stringify(f[0]).slice(0, 160));
}
await b.close(); if (errs.length) console.log('ERRORS', errs.slice(0, 5));
