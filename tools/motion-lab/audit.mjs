// audit.mjs · check every frame of a look against the brief's numbers.
//
//   node tools/motion-lab/audit.mjs <page> <t0> <t1> [--fps 24] [--spec spec.mjs] [--workers 4]
//                                   [--margin 0.04] [--safe 0.03] [--json out.json]
//
// Draws song frames round(t0*fps) .. round(t1*fps)-1 and reads what the look's ML.probe calls recorded.
// Built-in checks, on every frame:
//   text fits    every probe.text with a container sits inside it, inset by --margin x its shorter side
//   in frame     every probe.box with keep: true sits inside the frame, inset by --safe x each side
// From the spec module (optional), song frames on the 24 fps grid unless --fps says otherwise:
//   export const events = { land: [105, 165, 225] }      each event fires on exactly those frames
//   export const tolerance = 0                            frames of slack for events
//   export const checks = [{ name, test: (log, { t, frame }) => true | 'what is wrong' }]
// Exits 1 when anything fails. Your eye still judges the look; this judges the numbers.
import path from 'path';
import { pathToFileURL } from 'url';
import { launch, openLook, probe, args } from './frames.mjs';
import fs from 'fs';

const [[page, a, b], o] = args(process.argv.slice(2), { fps: 24, spec: '', workers: 4, margin: 0.04, safe: 0.03, json: '', width: 1920, height: 1080 });
if (!page || a === undefined || b === undefined) { console.log('usage: audit.mjs <page> <t0> <t1> [--fps 24] [--spec spec.mjs]'); process.exit(2); }
const spec = o.spec ? await import(pathToFileURL(path.resolve(o.spec)).href) : {};
const f0 = Math.round(Number(a) * o.fps), f1 = Math.round(Number(b) * o.fps);
const frames = [...Array(f1 - f0)].map((_, i) => f0 + i);

const browser = await launch();
const logs = new Map(); const errors = [];
const start = Date.now();
await Promise.all([...Array(Math.min(o.workers, frames.length))].map(async (_, w) => {
  const { p, errors: e } = await openLook(browser, page, o);
  for (let i = w; i < frames.length; i += o.workers) {
    // a frame that throws is a failure of that frame, not the end of the audit
    try { logs.set(frames[i], await probe(p, frames[i] / o.fps)); } catch (err) { errors.push(`frame ${frames[i]}: ${err.message.split('\n')[0]}`); }
  }
  errors.push(...e);
}));
await browser.close();

const results = new Map();   // check name -> { pass, fail: [[frame, msg]] }
const note = (name, frame, msg) => {
  const r = results.get(name) || { pass: 0, fail: [] }; results.set(name, r);
  if (msg === true || msg === undefined) r.pass++; else r.fail.push([frame, msg]);
};
const fmt = (n) => n.toFixed(0);
const fired = {};
let recorded = 0;
for (const fr of frames) {
  const log = logs.get(fr) || [];
  recorded += log.length;
  for (const r of log) {
    if (r.kind === 'text' && r.container) {
      const [x0, y0, x1, y1] = r.box, [c0, d0, c1, d1] = r.container;
      const m = o.margin * Math.min(c1 - c0, d1 - d0);
      const over = Math.max(c0 + m - x0, x1 - (c1 - m), d0 + m - y0, y1 - (d1 - m));
      note(`text fits: ${r.name}`, fr, over <= 0 || `"${r.str}" crosses its margin by ${fmt(over)} px`);
    }
    if (r.kind === 'box' && r.keep) {
      const [x0, y0, x1, y1] = r.box, [W, H] = r.frame, sx = o.safe * W, sy = o.safe * H;
      const over = Math.max(sx - x0, x1 - (W - sx), sy - y0, y1 - (H - sy));
      note(`in frame: ${r.name}`, fr, over <= 0 || `${fmt(over)} px outside the safe area`);
    }
    if (r.kind === 'event') (fired[r.name] ||= []).push(fr);
  }
  for (const c of spec.checks || []) {
    let res; try { res = c.test(log, { t: fr / o.fps, frame: fr }); } catch (e) { res = 'threw ' + e.message; }
    note(c.name, fr, res);
  }
}
const tol = spec.tolerance ?? 0;
for (const [name, want] of Object.entries(spec.events || {})) {
  const got = fired[name] || [];
  for (const w of want.filter((w) => w >= f0 && w < f1)) {
    const near = got.reduce((best, g) => (Math.abs(g - w) < Math.abs(best - w) ? g : best), Infinity);
    note(`event: ${name}`, w, Math.abs(near - w) <= tol || (near === Infinity ? 'never fired' : `fired on ${near} (${near > w ? '+' : ''}${near - w} frames)`));
  }
  for (const g of got) if (!want.some((w) => Math.abs(g - w) <= tol)) note(`event: ${name}`, g, 'fired where the brief has none');
}

console.log(`audit ${page}  frames ${f0}-${f1 - 1} at ${o.fps} fps  ${((Date.now() - start) / 1000).toFixed(0)} s  ${recorded} probe records`);
if (!recorded) console.log('  no probe records: the look never calls ML.probe, so only spec checks ran');
let failed = 0;
for (const [name, r] of [...results].sort()) {
  const ok = r.fail.length === 0; if (!ok) failed++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  (${r.pass} ok${ok ? '' : `, ${r.fail.length} failing`})`);
  for (const [fr, msg] of r.fail.slice(0, 5)) console.log(`        frame ${fr}: ${msg}`);
  if (r.fail.length > 5) console.log(`        ... ${r.fail.length - 5} more`);
}
if (errors.length) { console.log('PAGE ERRORS\n' + [...new Set(errors)].slice(0, 10).join('\n')); failed++; }
if (o.json) fs.writeFileSync(o.json, JSON.stringify(Object.fromEntries(logs), null, 0));
if (!results.size && !failed) { console.log('nothing was checked: add ML.probe calls to the look or checks to a spec'); process.exit(2); }
console.log(failed ? `${failed} check${failed > 1 ? 's' : ''} failed` : 'all checks pass');
process.exit(failed ? 1 : 0);
