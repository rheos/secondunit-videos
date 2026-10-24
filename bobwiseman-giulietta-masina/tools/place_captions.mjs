// node tools/place_captions.mjs <look> <wide|tall> [workers]      look: kite | poster | dream | leader
// Places every lyric caption of that look off every face and writes the table into js/lyrics/cap-place.js.
// Adapted from bobwiseman-me-and-jimi/tools/place_captions.mjs.
//   wide  looks/<look>-cap.html (16:9)      tall  looks/<look>-9x16-cap.html (the pan-and-scan window, 720 x 1280)
// 1. scan: draw every captioned frame of the look (source/lines.json, lines a..b inside the look's span), read the
//    head boxes the look reported (FACES) and the shot
// 2. per line, per stretch: the cheapest spot whose box (+ clearance) misses every face on every frame of the
//    stretch. A stretch is a shot; it is split only where no single spot stays clear of a moving head.
//    Film subtitles stay near the centre line (within 80 px; bottom first, then top, as subtitles do); the poster's snipes may go
//    anywhere on the poster. No spot at all = a failure, printed, never papered over.
import { chromium } from 'playwright';
import fs from 'fs';
const [look, key] = process.argv.slice(2); const WK = Number(process.argv[4] || 3);
const SPAN = { kite: [0, 34], poster: [34, 60], dream: [60, 92.5], leader: [92.5, 139.0458] }[look];
const page = `looks/${look}-${key === 'tall' ? '9x16-' : ''}cap.html`;
const L = JSON.parse(fs.readFileSync('source/lines.json', 'utf8')).lines;
const frames = [];
for (let f = Math.round(SPAN[0] * 24); f < Math.round(SPAN[1] * 24); f++) { const t = f / 24; if (L.some((l) => t >= l.a && t < l.b)) frames.push(f); }
const CLEAR = 14, STEP = 12, MIN = 12;   // MIN: shortest stay in one spot, frames

// ---- 1. scan ----
const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'] });
const scan = new Map(); const t0 = Date.now(); const errs = [];
await Promise.all([...Array(WK)].map(async (_, w) => {
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('pageerror', (e) => errs.push(String(e)));
  await p.goto('file://' + process.cwd() + `/${page}?offline=1`, { waitUntil: 'domcontentloaded', timeout: 600000 }); await p.evaluate(() => window.__ready);
  for (let i = w; i < frames.length; i += WK) scan.set(frames[i], await p.evaluate((t) => window.__capScan(t), frames[i] / 24));
}));
await b.close();
if (errs.length) console.log('PAGE ERRORS', [...new Set(errs)].slice(0, 5));
console.log(`scanned ${frames.length} frames of ${page} in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
if (!frames.length) process.exit(0);
const S0 = scan.get(frames[0]), AREA = S0.area, film = S0.kind === 'film';

// ---- 2. place ----
const hit = (a, b2) => a[0] < b2[2] && a[2] > b2[0] && a[1] < b2[3] && a[3] > b2[1];
function candidates(lays) {
  const C = [];
  lays.forEach(([w, h], n) => {
    const xc = Math.round((AREA[0] + AREA[2]) / 2 - w / 2);
    const xs = film ? [xc, xc - 40, xc + 40, xc - 80, xc + 80] : [...Array(Math.max(0, Math.floor((AREA[2] - AREA[0] - w) / STEP)) + 1)].map((_, k) => AREA[0] + k * STEP).concat([xc]);
    for (const x0 of xs) for (let y0 = AREA[1]; y0 + h <= AREA[3]; y0 += STEP / 2) C.push({ n, x0, y0, w, h });
    for (const x0 of xs) C.push({ n, x0, y0: S0.bottom - h, w, h });   // the default line exactly
  });
  return C;
}
const clearOf = (c, fs_) => { const r = [c.x0 - CLEAR, c.y0 - CLEAR, c.x0 + c.w + CLEAR, c.y0 + c.h + CLEAR];
  return fs_.every((f) => scan.get(f).faces.every((F) => !hit(r, F))); };
function cost(c, prev) {
  const cx = c.x0 + c.w / 2, mid = (AREA[0] + AREA[2]) / 2;
  const dB = Math.abs(S0.bottom - (c.y0 + c.h)), dT = Math.abs(c.y0 - AREA[1]) + (film ? 120 : 260);
  let k = c.n * 500 + Math.abs(cx - mid) * .6 + Math.min(dB, dT) * 1.0;
  if (prev) k += (prev.n === c.n && prev.x0 === c.x0 && prev.y0 === c.y0) ? -400 : Math.hypot(prev.x0 + prev.w / 2 - cx, prev.y0 + prev.h / 2 - (c.y0 + c.h / 2)) * .5;
  return k;
}
const out = {}; const fails = []; const report = [];
const lines = [...new Set(frames.map((f) => scan.get(f).li).filter((x) => x >= 0))];
for (const li of lines) {
  const fl = frames.filter((f) => scan.get(f).li === li);
  const C = candidates(scan.get(fl[0]).lays);
  const runs = []; for (const f of fl) { const r = runs[runs.length - 1]; if (r && f === r[r.length - 1] + 1 && scan.get(f).shot === scan.get(r[0]).shot) r.push(f); else runs.push([f]); }
  const st = [];
  for (const run of runs) {
    let i = 0;
    while (i < run.length) {
      let ok = C.filter((c) => clearOf(c, [run[i]])), j = i + 1;
      if (!ok.length) { fails.push(run[i]); i++; continue; }
      while (j < run.length) { const nx = ok.filter((c) => clearOf(c, [run[j]])); if (!nx.length) break; ok = nx; j++; }
      st.push({ fs: run.slice(i, j), ok }); i = j;
    }
  }
  for (let changed = true; changed;) {
    changed = false;
    const order = st.map((x, k) => k).filter((k) => st[k].fs.length < MIN).sort((a, b2) => st[a].fs.length - st[b2].fs.length);
    for (const k of order) {
      for (const nb of [k - 1, k + 1]) {
        // only within one shot: a caption that must move should move on the cut, not a few frames after it
        if (nb < 0 || nb >= st.length || scan.get(st[k].fs[0]).shot !== scan.get(st[nb].fs[0]).shot) continue;
        const both = st[k].ok.filter((c) => st[nb].ok.includes(c));
        if (both.length) { const lo = Math.min(k, nb); st.splice(lo, 2, { fs: [...st[lo].fs, ...st[lo + 1].fs], ok: both }); changed = true; break; }
      }
      if (changed) break;
    }
  }
  let prev = null; out[li] = [];
  for (const { fs: fs_, ok } of st) {
    let best = null, bc = Infinity;
    for (const c of ok) { const k = cost(c, prev); if (k < bc) { bc = k; best = c; } }
    const last = out[li][out[li].length - 1];
    if (last && last[2] === best.n && last[3] === best.x0 && last[4] === best.y0 && last[1] === fs_[0]) last[1] = fs_[fs_.length - 1] + 1;
    else out[li].push([fs_[0], fs_[fs_.length - 1] + 1, best.n, best.x0, best.y0]);
    prev = best;
  }
  report.push(`line ${li}: ` + out[li].map(([a, b2, n, x, y]) => `f${a}-${b2} L${n} @${x},${y}`).join(' | '));
}
console.log(report.join('\n'));
if (fails.length) console.log(`NO CLEAR SPOT on ${fails.length} frames: ${fails.slice(0, 30).join(' ')}`);
const file = 'js/lyrics/cap-place.js', tab = `${S0.kind}-${key}`;
let all = {}; if (fs.existsSync(file)) all = JSON.parse(fs.readFileSync(file, 'utf8').replace(/^[\s\S]*?const CAP_PLACE = /, '').replace(/;\s*$/, ''));
all[tab] = { ...(all[tab] || {}) };
const F0 = Math.round(SPAN[0] * 24), F1 = Math.round(SPAN[1] * 24);   // a line that crosses into another look keeps that look's stretches
for (const li of lines) all[tab][li] = (all[tab][li] || []).filter((e) => e[1] <= F0 || e[0] >= F1).concat(out[li]).sort((a, b2) => a[0] - b2[0]);
fs.writeFileSync(file, '// GENERATED by tools/place_captions.mjs: per style-aspect, per lyric line index, [frame0, frame1, layout, x0, y0]\n' +
  '// in output px. Numbers only (no lyric). Re-run the placer after any change to the shots, the plan or the lyric timing.\nconst CAP_PLACE = ' + JSON.stringify(all) + ';\n');
console.log('wrote', file, tab, `${((Date.now() - t0) / 1000).toFixed(0)} s`);
process.exit(fails.length ? 1 : 0);
