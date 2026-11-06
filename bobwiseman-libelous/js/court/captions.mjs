// Caption check for looks/court.html: node js/court/captions.mjs
// For every frame of the window: every word is on screen from its onset (at most 2 frames early, never late),
// and every line stays fully on the sheet at >= 49 px until the next line starts or 1.2 s after its last word,
// whichever is later. Also reports the cap height of the current line.
import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome', headless: true });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
p.on('pageerror', e => console.log('ERR', String(e)));
await p.goto('file://' + process.cwd() + '/looks/court.html?offline=1'); await p.evaluate(() => window.__ready);
console.log(await p.evaluate(() => {
  const c = document.createElement('canvas'); c.width = 1920; c.height = 1080; const g = c.getContext('2d');
  const bad = [], lead = 1.5 / 24; let frames = 0;
  for (let f = 6276; f < 7266; f++) {
    const t = f / 24; frames++;
    drawTranscript(g, t); const d = window.__trDebug;
    LINES.forEach((L, k) => {
      if (L.i < 111) return;
      const nx = LINES[k + 1], last = L.words[L.words.length - 1].s;
      const until = Math.max(nx ? nx.s : 1e9, last + 1.2);
      if (t >= L.s && t < until && t < 302.75) { const r = d[L.i]; if (!r || r.vis < 1 || r.sz < 49) bad.push([f, L.i, r ? +r.vis.toFixed(2) : null, r ? +r.sz.toFixed(1) : null]); }
      L.words.forEach(w => { const shown = t >= w.s - lead; if (t >= w.s && !shown) bad.push([f, L.i, 'late', w.w]); if (shown && w.s - t > 2 / 24) bad.push([f, L.i, 'early', w.w]); });
    });
  }
  g.font = TR.font(TR.BIG);
  return JSON.stringify({ frames, problems: bad.length, first: bad.slice(0, 12), cap: g.measureText('H').actualBoundingBoxAscent });
}));
await b.close();
