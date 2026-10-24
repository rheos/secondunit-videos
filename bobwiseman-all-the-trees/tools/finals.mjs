// node tools/finals.mjs <wide|tall|tallbase|tallcap|tallplain> <seqdir> <outdir> [f0] [f1] [workers]
// Lays the lyric (source/lines.json) over finished 1920x1080 frames of the cut (seqdir/f_%06d.jpg, frame i = song time
// i/24) through finals.html. wide: frames with no line showing are hard-linked unchanged, so only caption frames are
// re-encoded as JPEG. tall: every frame becomes an emblem-book page (1080x1920). tallbase: the page without the verse;
// tallcap: lays the verse on tallbase pages (seqdir = the tallbase folder), linking the rest; tallplain: no verse, centred. Output: outdir/f_%06d.jpg.
import { chromium } from 'playwright';
import fs from 'fs'; import path from 'path';
const [mode, seq, outdir, f0s, f1s, wks] = process.argv.slice(2);
if (!['wide', 'tall', 'tallbase', 'tallcap', 'tallplain'].includes(mode) || !seq || !outdir) { console.error('usage: finals.mjs <wide|tall|tallbase|tallcap|tallplain> <seqdir> <outdir> [f0] [f1] [workers]'); process.exit(2); }
const lines = JSON.parse(fs.readFileSync('source/lines.json', 'utf8')).lines;
const n = fs.readdirSync(seq).filter((f) => /^f_\d{6}\.jpg$/.test(f)).length;
const f0 = Number(f0s || 0), f1 = Number(f1s || n), WK = Number(wks || 4);
fs.mkdirSync(outdir, { recursive: true });
const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--allow-file-access-from-files', '--disable-gpu'] });
let done = 0, linked = 0; const start = Date.now(); const errs = [];
await Promise.all([...Array(WK)].map(async (_, w) => {
  const p = await b.newPage({ viewport: { width: 1080, height: 1080 } });
  p.on('pageerror', (e) => errs.push(String(e)));
  await p.goto('file://' + path.resolve('finals.html')); await p.evaluate(([l, m]) => window.__setup(l, m), [lines, mode]);
  for (let i = f0 + w; i < f1; i += WK) {
    const name = `f_${String(i).padStart(6, '0')}.jpg`, src = path.resolve(seq, name), dst = path.join(outdir, name), t = i / 24;
    if ((mode === 'wide' || mode === 'tallcap') && !(await p.evaluate((t) => window.__showing(t), t))) { fs.rmSync(dst, { force: true }); fs.linkSync(src, dst); linked++; }
    else { const url = await p.evaluate(([s, t]) => window.__compose(s, t), ['file://' + src, t]); fs.writeFileSync(dst, Buffer.from(url.split(',')[1], 'base64')); }
    if (++done % 240 === 0) console.log(`${done}/${f1 - f0} ${((Date.now() - start) / 1000).toFixed(0)}s`);
  }
}));
await b.close();
if (errs.length) { console.log('ERRORS:\n' + [...new Set(errs)].slice(0, 10).join('\n')); process.exit(1); }
console.log(`${mode}: ${done} frames (${linked} linked unchanged) in ${((Date.now() - start) / 1000).toFixed(0)}s -> ${outdir}`);
