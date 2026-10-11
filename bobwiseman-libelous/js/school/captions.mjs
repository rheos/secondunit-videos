// Caption check for looks/school.html: node js/school/captions.mjs
// For every frame of the window: every word is on screen from its onset (at most 2 frames early, never late),
// in order; every line stays fully on screen at >= 44 px cap height until the next line starts or 1.2 s after
// its last word ends, whichever is later. Reports the cap heights seen.
import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome', headless: true });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
p.on('pageerror', e => console.log('ERR', String(e)));
await p.goto('file://' + process.cwd() + '/looks/school.html?offline=1'); await p.evaluate(() => window.__ready);
console.log(await p.evaluate(() => {
  const c = document.createElement('canvas'); c.width = 1920; c.height = 1080; const g = c.getContext('2d');
  const bad = []; let frames = 0, minCap = 1e9, maxCap = 0;
  for (let f = 2955; f < 3962; f++) {
    const t = f / 24; frames++;
    drawCaptions(g, t); const d = window.__capDebug;
    SC_LINES.forEach((L) => {
      const until = readUntil(L.i);
      const r = d[L.i];
      if (t >= L.s && t < until) {
        if (!r || r.vis < 1 || r.cap < 44) bad.push([f, L.i, 'unreadable', r ? +r.cap.toFixed(1) : null, r ? r.vis : null]);
        else { minCap = Math.min(minCap, r.cap); maxCap = Math.max(maxCap, r.cap); }
      }
      L.words.forEach((w, k) => {
        const shown = !!r && r.shown.length > k && r.shown[k] === w.w;
        if (t >= w.s && t < until && !shown) bad.push([f, L.i, 'late', w.w]);
        if (r && r.shown.length > k && w.s - t > 2 / 24) bad.push([f, L.i, 'early', w.w]);
      });
      if (r && r.shown.join(' ') !== L.words.slice(0, r.shown.length).map(w => w.w).join(' ')) bad.push([f, L.i, 'order']);
    });
  }
  return JSON.stringify({ frames, problems: bad.length, first: bad.slice(0, 12), capRange: [+minCap.toFixed(1), +maxCap.toFixed(1)] });
}));
await b.close();
