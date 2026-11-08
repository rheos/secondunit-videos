// Before/after: draw the same song frames from two pages and measure every pixel. Use it to prove a port or a
// refactor changes nothing, or to show exactly what a fix changed, frame by frame, beside the frozen version.
//   node ../cleanline/bin/compare.mjs --a <old page.html> --b <new page.html> --out <dir> [--events cuts,lines] [--every N] [f ...]
//   options: --qs-a / --qs-b extra query string per page, --film DIR (the film whose clock and events are used: page B's),
//            --rows 6 rows per sheet, --label-a old --label-b new
// Writes <out>/report.json, <out>/report.md (one row per frame: identical, or mean/max difference and pixels changed)
// and <out>/sheet_NN.jpg: A | B | changed pixels (magenta on B dimmed, ringed when few) per row, labelled with time, frame, event and the numbers.
// The pixel check is exact: both canvases' RGBA after drawFrame, hashed in the page; differing frames are then diffed
// pixel by pixel. Contact-sheet tiles are JPEG.
import fs from 'fs'; import path from 'path';
import { parseArgs, loadFilm, openBrowser, openPage, eventFrames } from './film.mjs';

const { opt, pos } = parseArgs(process.argv.slice(2));
const F = loadFilm(opt.film); const fps = F.fps; const [Wd, Ht] = F.size;
const A = path.resolve(opt.a), B = path.resolve(opt.b || F.page), OUT = path.resolve(opt.out || path.join(F.dir, 'out/compare'));
fs.mkdirSync(OUT, { recursive: true });
const errs = { a: [], b: [] };
const br = await openBrowser();
const pa = await openPage(br, A, F.size, opt['qs-a'], errs.a), pb = await openPage(br, B, F.size, opt['qs-b'], errs.b);

// which frames
let frames = pos.map((v) => ({ f: Number(v) }));
if (opt.events) frames = frames.concat(await eventFrames(pb, fps, opt.events.split(',')));
if (opt.every) for (let f = 0; f < F.clock.frames; f += Number(opt.every)) frames.push({ f, every: true });
const byF = new Map(); for (const e of frames) byF.set(e.f, { ...(byF.get(e.f) || {}), ...e }); frames = [...byF.values()].sort((a, b) => a.f - b.f);

// in-page: draw, then hash the composited canvas (the one __frameJPEG reads)
const grab = async (p, t, want) => p.evaluate(async ([t, want]) => {
  const jpg = window.__frameJPEG(t, .85);
  const c = document.getElementById('c') || document.querySelector('canvas');
  const px = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
  const h = [...new Uint8Array(await crypto.subtle.digest('SHA-256', px))].map((v) => v.toString(16).padStart(2, '0')).join('');
  return { jpg: want ? jpg : null, png: null, hash: h };
}, [t, want]);
const png = async (p, t) => p.evaluate((t) => { window.__frameJPEG(t); return (document.getElementById('c') || document.querySelector('canvas')).toDataURL('image/png'); }, t);

// a scratch page that diffs two PNGs and lays out the sheets
const sp = await br.newPage({ viewport: { width: 800, height: 600 } });
await sp.setContent('<canvas id="s"></canvas>');
const diff = (a, b) => sp.evaluate(async ([a, b, W, H]) => {
  const load = (u) => new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.src = u; });
  const [ia, ib] = await Promise.all([load(a), load(b)]);
  const ca = new OffscreenCanvas(W, H).getContext('2d'), cb = new OffscreenCanvas(W, H).getContext('2d');
  ca.drawImage(ia, 0, 0); cb.drawImage(ib, 0, 0);
  const da = ca.getImageData(0, 0, W, H).data, db = cb.getImageData(0, 0, W, H).data;
  // the diff tile: B dimmed to a quarter, every changed pixel in magenta (brighter = bigger change); when only a
  // few pixels change they vanish at tile size, so each one also gets a ring
  const dc = new OffscreenCanvas(W, H), dx = dc.getContext('2d'), out = dx.createImageData(W, H);
  let sum = 0, max = 0, changed = 0; const where = [];
  for (let i = 0; i < da.length; i += 4) {
    let m = 0; for (let k = 0; k < 3; k++) { const d = Math.abs(da[i + k] - db[i + k]); sum += d; if (d > m) m = d; }
    if (m > max) max = m;
    if (m) { changed++; if (where.length < 400) where.push([(i / 4) % W, Math.floor(i / 4 / W), m]); out.data[i] = 255; out.data[i + 1] = 40; out.data[i + 2] = Math.min(255, 120 + m * 16); }
    else { out.data[i] = db[i] * .25; out.data[i + 1] = db[i + 1] * .25; out.data[i + 2] = db[i + 2] * .25; }
    out.data[i + 3] = 255;
  }
  dx.putImageData(out, 0, 0);
  if (changed && changed < 400) { dx.strokeStyle = '#ff3d9a'; dx.lineWidth = 5; for (const [x, y] of where) { dx.beginPath(); dx.arc(x, y, 28, 0, 6.2832); dx.stroke(); } }
  const blob = await dc.convertToBlob({ type: 'image/jpeg', quality: .85 });
  const url = await new Promise((ok) => { const r = new FileReader(); r.onload = () => ok(r.result); r.readAsDataURL(blob); });
  return { mean: sum / (W * H * 3), max, changed: changed / (W * H), pixels: changed, where: where.slice(0, 20), diffJpg: url };
}, [a, b, Wd, Ht]);

const rows = []; const start = Date.now();
for (const e of frames) {
  const t = e.f / fps;
  const [ga, gb] = [await grab(pa, t, true), await grab(pb, t, true)];
  const r = { f: e.f, t: +t.toFixed(4), cut: e.cut || null, line: !!e.line, identical: ga.hash === gb.hash, jpgA: ga.jpg, jpgB: gb.jpg };
  if (!r.identical) { const d = await diff(await png(pa, t), await png(pb, t)); Object.assign(r, { mean: d.mean, max: d.max, changed: d.changed, pixels: d.pixels, where: d.where, diffJpg: d.diffJpg }); }
  else Object.assign(r, { mean: 0, max: 0, changed: 0, pixels: 0 });
  rows.push(r);
  if (rows.length % 25 === 0) console.log(`${rows.length}/${frames.length} ${((Date.now() - start) / 1000).toFixed(0)}s`);
}

// sheets: A | B | diff, ROWS per sheet, 480x270 tiles under a label strip
const ROWS = Number(opt.rows || 6), TW = 480, TH = 270, LH = 22, la = opt['label-a'] || 'A', lb = opt['label-b'] || 'B';
const sheets = [];
for (let s = 0; s * ROWS < rows.length; s++) {
  const part = rows.slice(s * ROWS, (s + 1) * ROWS);
  const url = await sp.evaluate(async ([part, TW, TH, LH, la, lb]) => {
    const load = (u) => new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.src = u; });
    const c = new OffscreenCanvas(TW * 3, part.length * (TH + LH)), g = c.getContext('2d');
    g.fillStyle = '#111'; g.fillRect(0, 0, c.width, c.height);
    for (let i = 0; i < part.length; i++) {
      const r = part[i], y = i * (TH + LH);
      g.font = '13px Menlo, monospace'; g.textBaseline = 'middle'; g.fillStyle = r.identical ? '#9fe0a0' : '#ffb070';
      const ev = [r.cut ? 'cut ' + r.cut : '', r.line ? 'line start' : ''].filter(Boolean).join(' + ');
      const res = r.identical ? 'identical' : `mean ${r.mean.toFixed(4)}  max ${r.max}  ${r.pixels} px`;
      g.fillText(`f${r.f}  ${r.t.toFixed(3)} s  ${ev}   ${la} | ${lb} | changed pixels   ${res}`, 8, y + LH / 2);
      g.drawImage(await load(r.jpgA), 0, y + LH, TW, TH); g.drawImage(await load(r.jpgB), TW, y + LH, TW, TH);
      if (r.diffJpg) g.drawImage(await load(r.diffJpg), TW * 2, y + LH, TW, TH);
      else { g.fillStyle = '#000'; g.fillRect(TW * 2, y + LH, TW, TH); g.fillStyle = '#9fe0a0'; g.fillText('no pixel differs', TW * 2 + 16, y + LH + TH / 2); }
    }
    const blob = await c.convertToBlob({ type: 'image/jpeg', quality: .8 });
    return new Promise((ok) => { const fr = new FileReader(); fr.onload = () => ok(fr.result); fr.readAsDataURL(blob); });
  }, [part, TW, TH, LH, la, lb]);
  const f = path.join(OUT, `sheet_${String(s + 1).padStart(2, '0')}.jpg`); fs.writeFileSync(f, Buffer.from(url.split(',')[1], 'base64')); sheets.push(path.basename(f));
}
await br.close();

const clean = rows.map(({ jpgA, jpgB, diffJpg, ...r }) => r);
const same = clean.filter((r) => r.identical).length;
fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify({ a: A, b: B, qsA: opt['qs-a'] || '', qsB: opt['qs-b'] || '', fps, frames: clean, sheets, errors: errs }, null, 1));
const md = [`# ${la} vs ${lb}: ${clean.length} frames, ${same} identical, ${clean.length - same} differ`, '',
  `- ${la}: \`${path.relative(F.dir, A)}\`${opt['qs-a'] ? ' ?' + opt['qs-a'] : ''}`, `- ${lb}: \`${path.relative(F.dir, B)}\`${opt['qs-b'] ? ' ?' + opt['qs-b'] : ''}`,
  '- mean = mean absolute difference per channel (0-255), max = largest channel difference (0-255), px = pixels that differ (of W x H), at = where (x,y)', '',
  '| frame | time (s) | event | result |', '|---:|---:|---|---|',
  ...clean.map((r) => `| ${r.f} | ${r.t.toFixed(3)} | ${[r.cut ? 'cut ' + r.cut : '', r.line ? 'line start' : ''].filter(Boolean).join(' + ')} | ${r.identical ? 'identical' : `mean ${r.mean.toFixed(4)}, max ${r.max}, ${r.pixels} px${r.where && r.where.length <= 8 ? ' at ' + r.where.map(([x, y]) => x + ',' + y).join(' ') : ''}`} |`)];
fs.writeFileSync(path.join(OUT, 'report.md'), md.join('\n') + '\n');
console.log(`${clean.length} frames: ${same} identical, ${clean.length - same} differ. ${sheets.length} sheets in ${OUT}`);
for (const k of ['a', 'b']) if (errs[k].length) console.log(`ERRORS ${k}:\n` + [...new Set(errs[k])].slice(0, 10).join('\n'));
