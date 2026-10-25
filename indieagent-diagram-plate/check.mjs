// check.mjs · the gate before Robin sees a render. Writes out/check/ and prints a report; exits 1 on any failure.
//   node check.mjs [t=14]
// 1. full-size stills at t, with and without words
// 2. every word inside its container with a margin (tags, signs, the title and note bands)
// 3. no two words touch
// 4. words-off contrast: draw the plate without words, then under each word's box count ink pixels (nothing may
//    touch a word) and measure the contrast of the pen against the mean of what is there
// 5. 600x450 crops of the lettering at 1:1
import fs from 'fs';
import { execFileSync } from 'child_process';
import { launch, openLook, frame, jpegBuffer } from '../tools/motion-lab/frames.mjs';

const t = Number(process.argv[2] || 14), MARGIN = 6, PAD = 2, INK_LUM = 110, MIN_CONTRAST = 7;
const dir = 'out/check'; fs.mkdirSync(dir, { recursive: true });
const b = await launch();
const withText = await openLook(b, 'plate.html'), noText = await openLook(b, 'plate.html?notext=1');
fs.writeFileSync(`${dir}/full_t${t}.jpg`, jpegBuffer(await frame(withText.p, t, 0.95)));
fs.writeFileSync(`${dir}/full_t${t}_notext.jpg`, jpegBuffer(await frame(noText.p, t, 0.95)));
const words = await withText.p.evaluate(() => window.__words);
const under = await noText.p.evaluate(([t, words, PAD, INK_LUM]) => {
  window.__draw(t);
  const g = document.getElementById('c').getContext('2d', { willReadFrequently: true });
  const lum = (r, gg, bb) => { const f = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(gg) + 0.0722 * f(bb); };
  return words.map((w) => {
    const [x0, y0, x1, y1] = w.box.map((v, i) => Math.round(v + (i < 2 ? -PAD : PAD)));
    const d = g.getImageData(x0, y0, x1 - x0, y1 - y0).data; let n = 0, ink = 0, L = 0;
    for (let i = 0; i < d.length; i += 4) { n++; L += lum(d[i], d[i + 1], d[i + 2]); if (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2] < INK_LUM) ink++; }
    return { ink, n, meanLum: L / n };
  });
}, [t, words, PAD, INK_LUM]);
await b.close();
const errs = [...withText.errors, ...noText.errors];
if (errs.length) { console.log('PAGE ERRORS', errs); process.exit(1); }

const inkLum = (() => { const h = '#2b2320', f = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(parseInt(h.slice(1, 3), 16)) + 0.7152 * f(parseInt(h.slice(3, 5), 16)) + 0.0722 * f(parseInt(h.slice(5, 7), 16)); })();
const fails = [], rows = [];
words.forEach((w, i) => {
  const [x0, y0, x1, y1] = w.box, c = w.container, u = under[i];
  const margin = c ? Math.min(x0 - c[0], y0 - c[1], c[2] - x1, c[3] - y1) : null;
  const contrast = (u.meanLum + 0.05) / (inkLum + 0.05);
  const touch = words.filter((v, j) => j !== i && !(v.box[0] > x1 || v.box[2] < x0 || v.box[1] > y1 || v.box[3] < y0)).map((v) => v.str);
  const row = { word: w.str, role: w.role, margin: margin?.toFixed(1), inkUnder: u.ink, contrast: contrast.toFixed(1), touches: touch.join(' | ') };
  rows.push(row);
  if (margin !== null && margin < MARGIN) fails.push(`"${w.str}" is ${margin.toFixed(1)} px from its container edge (need ${MARGIN})`);
  if (u.ink > 0) fails.push(`"${w.str}": ${u.ink} ink pixels under the word with words off`);
  if (contrast < MIN_CONTRAST) fails.push(`"${w.str}": contrast ${contrast.toFixed(1)} < ${MIN_CONTRAST}`);
  if (touch.length) fails.push(`"${w.str}" touches ${touch.join(', ')}`);
});
console.table(rows);

// lettering crops at 1:1, 600x450, wherever words sit
const full = `${dir}/full_t${t}.jpg`, crops = [];
const cover = []; for (const w of words) { const cx = (w.box[0] + w.box[2]) / 2, cy = (w.box[1] + w.box[3]) / 2; if (!cover.some(([x, y]) => Math.abs(cx - x) < 300 && Math.abs(cy - y) < 225)) cover.push([cx, cy]); }
cover.forEach(([cx, cy], i) => {
  const x = Math.max(0, Math.min(1920 - 600, Math.round(cx - 300))), y = Math.max(0, Math.min(1080 - 450, Math.round(cy - 225))), f = `${dir}/crop_${String(i).padStart(2, '0')}_${x}x${y}.png`;
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', full, '-vf', `crop=600:450:${x}:${y}`, f]); crops.push(f);
});
console.log(`${words.length} words, ${crops.length} crops in ${dir}`);
if (fails.length) { console.log('FAIL\n' + fails.join('\n')); process.exit(1); }
console.log('PASS: every word inside its container with margin, none touching, nothing under any word, contrast >= ' + MIN_CONTRAST);
