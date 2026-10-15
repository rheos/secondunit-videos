// Spike S1 prototype draw.mjs (throwaway, never merged). Runs inside the pinned Playwright image.
//   node draw.mjs <stills|perf> <plan.json>
// Uses openLook and frame from tools/motion-lab/frames.mjs and launches Playwright's Chromium itself.
// Records every canvas font stack the page sets into /out/fonts-used.json. Stdout carries counts only.
import fs from 'fs';
import { launch, openLook, frame, jpegBuffer } from '/src/motion-lab/frames.mjs';

const [mode, planFile] = process.argv.slice(2);
const plan = JSON.parse(fs.readFileSync(planFile, 'utf8'));

const REC = String.raw`(() => {
  const seen = new Set(); Object.defineProperty(self, '__arFonts', { value: seen });
  const norm = (v) => { const m = /(?:^|\s)[\d.]+(?:px|pt|em|rem)(?:\s*\/\s*\S+)?\s+(.+)$/.exec(String(v));
    return m ? m[1].replace(/["']/g, '').replace(/\s+/g, ' ').trim() : '?' + String(v); };
  const wrap = (C) => { if (!C) return; const d = Object.getOwnPropertyDescriptor(C.prototype, 'font'); if (!d || !d.set) return;
    Object.defineProperty(C.prototype, 'font', { configurable: true, enumerable: d.enumerable, get: d.get,
      set(v) { try { seen.add(norm(v)); } catch (e) {} return d.set.call(this, v); } }); };
  wrap(self.CanvasRenderingContext2D); wrap(self.OffscreenCanvasRenderingContext2D);
})();`;

const browser = await launch();
const shim = { newPage: async (o) => { const p = await browser.newPage(o); await p.addInitScript(REC); return p; } };
const stacks = new Set(), errors = [], timing = [];
for (const g of plan.groups) {
  const t0 = Date.now();
  const { p, errors: e } = await openLook(shim, g.page);
  const load = (Date.now() - t0) / 1000, t1 = Date.now();
  for (const it of g.items) {
    const url = await frame(p, it.t, 0.93);
    if (mode === 'stills') fs.writeFileSync(`/out/${it.name}.jpg`, jpegBuffer(url));
  }
  const draw = (Date.now() - t1) / 1000;
  for (const s of await p.evaluate(() => [...self.__arFonts])) stacks.add(s);
  errors.push(...e); await p.close();
  timing.push({ group: g.id, frames: g.items.length, load_s: load, draw_s: draw, s_per_frame: draw / g.items.length });
  console.log(`group ${g.id}: ${g.items.length} frames, ${(draw / g.items.length).toFixed(3)} s/frame, load ${load.toFixed(1)} s`);
}
await browser.close();
fs.writeFileSync('/out/fonts-used.json', JSON.stringify([...stacks].sort(), null, 1));
fs.writeFileSync('/out/page-errors.json', JSON.stringify([...new Set(errors)], null, 1));
fs.writeFileSync('/out/timing.json', JSON.stringify(timing, null, 1));
console.log(`stacks recorded: ${stacks.size}; distinct page errors: ${new Set(errors).size}`);
