// node tools/place_captions.mjs <wide|tall|pan> f0 f1 [f0 f1 ...]   (song frames, half-open)
// Places every lyric label off every face and writes this aspect's table into js/cap-place.js.
//   wide  wood-cap.html (16:9)          tall  wood-9x16-cap.html (9:16)
//   pan   wood-cap.html drawn as vertical.mjs draws a pan-and-scan shot (aspects/9x16/panscan-plan-v1.json),
//         label laid out for the tall frame inside the crop window
// 1. scan: draw each frame (shot + look), read the head boxes the kit reported (FACES), the signs (SIGNS), the shot
// 2. per line, per stretch: the cheapest label spot whose box (+ bleed + clearance) misses every face on every
//    frame of the stretch. A stretch is a shot; it is split only where no single spot stays clear of a moving figure.
//    Cost: narrower layouts, distance from bottom centre (top centre a little dearer), signs covered, moving away
//    from where the label was. No spot at all = a failure, printed, never papered over.
import { chromium } from 'playwright';
import fs from 'fs';
const [key, ...fr] = process.argv.slice(2);
const spans = []; for (let i = 0; i < fr.length; i += 2) spans.push([Number(fr[i]), Number(fr[i + 1])]);
const page = key === 'tall' ? 'wood-9x16-cap' : 'wood-cap';
const SC = 1920 / 1080, CW = 1080 / SC;                                  // pan: the crop window in 16:9 design px
const plan = key === 'pan' ? JSON.parse(fs.readFileSync('aspects/9x16/panscan-plan-v1.json', 'utf8')) : null;
const ss = (u) => u * u * (3 - 2 * u);
function cxAt(t) { // as vertical.mjs
  const k = plan.keys.slice().sort((a, b) => a[0] - b[0]);
  if (t <= k[0][0]) return k[0][1];
  for (let i = 0; i + 1 < k.length; i++) { const [a, ca] = k[i], [b, cb] = k[i + 1]; if (t >= a && t < b) return b - a < .05 ? ca : ca + (cb - ca) * ss((t - a) / (b - a)); }
  return k[k.length - 1][1];
}
const tallish = key !== 'wide', W = tallish ? 1080 : 1920, H = tallish ? 1920 : 1080;
// where a label may go: inside the print's border (30 px) with margin; on a phone also clear of the Reels/Shorts
// top bar, bottom caption bar and right-hand buttons
const AREA = tallish ? { x0: 52, x1: W - 130, y0: 210, y1: 1540 } : { x0: 52, x1: W - 52, y0: 52, y1: H - 52 };
const BLEED = 7, CLEAR = 16, STEP = 12, MIN = 12;   // MIN: shortest stay in one spot, frames

// ---- 1. scan ----
const frames = []; for (const [a, b] of spans) for (let f = a; f < b; f++) frames.push(f);
const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu', '--allow-file-access-from-files'] });
const scan = new Map(); const WK = 4; const t0 = Date.now();
await Promise.all([...Array(WK)].map(async (_, w) => {
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + process.cwd() + `/${page}.html?offline=1`); await p.evaluate(() => window.__ready);
  for (let i = w; i < frames.length; i += WK) {
    const f = frames[i], t = f / 24;
    const r = await p.evaluate(([t, cx, key]) => { if (cx !== null) window.__capCx = cx; return window.__capScan(t, key); }, [t, plan ? cxAt(t) : null, key]);
    if (plan) { const x0 = cxAt(t) - CW / 2; const m = (B) => [(B[0] - x0) * SC, B[1] * SC, (B[2] - x0) * SC, B[3] * SC]; r.faces = r.faces.map(m); r.signs = r.signs.map(m); }
    scan.set(f, r);
  }
}));
await b.close();
console.log(`scanned ${frames.length} frames in ${((Date.now() - t0) / 1000).toFixed(0)} s`);

// ---- 2. place ----
const hit = (a, b2) => a[0] < b2[2] && a[2] > b2[0] && a[1] < b2[3] && a[3] > b2[1];
const area = (a, b2) => Math.max(0, Math.min(a[2], b2[2]) - Math.max(a[0], b2[0])) * Math.max(0, Math.min(a[3], b2[3]) - Math.max(a[1], b2[1]));
function candidates(lays) {
  const C = [];
  lays.forEach(([w, h], n) => {
    for (let x0 = AREA.x0 + BLEED; x0 + w + BLEED <= AREA.x1; x0 += STEP)
      for (let y0 = AREA.y0 + BLEED; y0 + h + BLEED <= AREA.y1; y0 += STEP) C.push({ n, x0, y0, w, h });
    // the exact centre column too, so a centred label is always on the menu
    const xc = Math.round((AREA.x0 + AREA.x1) / 2 - w / 2);
    for (let y0 = AREA.y0 + BLEED; y0 + h + BLEED <= AREA.y1; y0 += STEP) C.push({ n, x0: xc, y0, w, h });
  });
  return C;
}
const clearOf = (c, fs_) => { const r = [c.x0 - BLEED - CLEAR, c.y0 - BLEED - CLEAR, c.x0 + c.w + BLEED + CLEAR, c.y0 + c.h + BLEED + CLEAR];
  return fs_.every((f) => scan.get(f).faces.every((F) => !hit(r, F))); };
const prefBottom = tallish ? 1440 : H - 52, prefTop = tallish ? 230 : 52;
function cost(c, fs_, prev) {
  const cx = c.x0 + c.w / 2, mid = (AREA.x0 + AREA.x1) / 2;
  const dB = Math.abs(prefBottom - (c.y0 + c.h)), dT = Math.abs(c.y0 - prefTop) + 260;
  let k = c.n * 500 + Math.abs(cx - mid) * .6 + Math.min(dB, dT) * 1.0;
  const r = [c.x0 - BLEED, c.y0 - BLEED, c.x0 + c.w + BLEED, c.y0 + c.h + BLEED];
  let sg = 0; for (const f of fs_) for (const S of scan.get(f).signs) sg += area(r, S); k += sg / fs_.length * .25;   // a covered sign costs about as much as a move from top to bottom
  if (prev) k += (prev.n === c.n && prev.x0 === c.x0 && prev.y0 === c.y0) ? -400 : Math.hypot(prev.x0 + prev.w / 2 - cx, prev.y0 + prev.h / 2 - (c.y0 + c.h / 2)) * .5;
  return k;
}
const out = {}; const fails = []; const report = [];
const lines = [...new Set(frames.map((f) => scan.get(f).li).filter((x) => x >= 0))];
let lastLinePos = null;
for (const li of lines) {
  const fl = frames.filter((f) => scan.get(f).li === li);
  const C = candidates(scan.get(fl[0]).lays);
  // stretches: runs of one shot, contiguous frames
  const runs = []; for (const f of fl) { const r = runs[runs.length - 1]; if (r && f === r[r.length - 1] + 1 && scan.get(f).shot === scan.get(r[0]).shot) r.push(f); else runs.push([f]); }
  // raw stretches: grow each while some spot stays clear on every frame of it
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
  // merge any stretch under MIN frames into a neighbour when one spot stays clear for both (no half-second hops)
  for (let changed = true; changed;) {
    changed = false;
    const order = st.map((x, k) => k).filter((k) => st[k].fs.length < MIN).sort((a, b2) => st[a].fs.length - st[b2].fs.length);
    for (const k of order) {
      for (const nb of [k - 1, k + 1]) {
        if (nb < 0 || nb >= st.length) continue;
        const both = st[k].ok.filter((c) => st[nb].ok.includes(c));
        if (both.length) { const lo = Math.min(k, nb); st.splice(lo, 2, { fs: [...st[lo].fs, ...st[lo + 1].fs], ok: both }); changed = true; break; }
      }
      if (changed) break;
    }
  }
  // a short first stretch that ends before the first word is sung: start the label after it instead (at the cut)
  const firstWord = scan.get(fl[0]).w0;
  if (st.length > 1 && st[0].fs.length < MIN && st[0].fs[st[0].fs.length - 1] < firstWord) st.shift();
  let prev = lastLinePos; out[li] = [];
  for (const { fs: fs_, ok } of st) {
    let best = null, bc = Infinity;
    for (const c of ok) { const k = cost(c, fs_, prev); if (k < bc) { bc = k; best = c; } }
    const last = out[li][out[li].length - 1];
    if (last && last[2] === best.n && last[3] === best.x0 && last[4] === best.y0 && last[1] === fs_[0]) last[1] = fs_[fs_.length - 1] + 1;
    else out[li].push([fs_[0], fs_[fs_.length - 1] + 1, best.n, best.x0, best.y0]);
    prev = best;
  }
  lastLinePos = prev;
  report.push(`line ${li}: ` + out[li].map(([a, b2, n, x, y]) => `f${a}-${b2} L${n} @${x},${y}`).join(' | '));
}
console.log(report.join('\n'));
if (fails.length) console.log(`NO CLEAR SPOT on ${fails.length} frames: ${fails.slice(0, 20).join(' ')}`);
// write this aspect's table, keep the others
const file = 'js/cap-place.js';
let all = {}; if (fs.existsSync(file)) all = JSON.parse(fs.readFileSync(file, 'utf8').replace(/^[\s\S]*?const CAP_PLACE = /, '').replace(/;\s*$/, ''));
all[key] = out;
fs.writeFileSync(file, '// GENERATED by tools/place_captions.mjs: per aspect, per lyric line index, [frame0, frame1, layout, x0, y0] in output px.\n' +
  '// Numbers only (no lyric). Re-run the placer after any change to the shots or the lyric timing.\nconst CAP_PLACE = ' + JSON.stringify(all) + ';\n');
console.log('wrote', file, key);
process.exit(fails.length ? 1 : 0);
