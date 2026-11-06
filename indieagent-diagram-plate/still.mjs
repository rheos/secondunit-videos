// still.mjs · write frames of the plate as JPEGs: node still.mjs <t> [<t> ...] [--notext] [--w 1920] [--out out/still]
import fs from 'fs';
import { launch, openLook, frame, jpegBuffer } from '../tools/motion-lab/frames.mjs';
const argv = process.argv.slice(2), times = argv.filter((a) => /^[\d.]+$/.test(a)).map(Number);
const opt = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const notext = argv.includes('--notext'), w = Number(opt('--w', 1920)), out = opt('--out', 'out/still');
fs.mkdirSync('out', { recursive: true });
const b = await launch();
const { p, errors } = await openLook(b, `plate.html?w=${w}${notext ? '&notext=1' : ''}`);
for (const t of times) {
  const t0 = Date.now(), f = `${out}_t${t.toFixed(2)}${notext ? '_notext' : ''}.jpg`;
  fs.writeFileSync(f, jpegBuffer(await frame(p, t, 0.94)));
  console.log(f, Date.now() - t0, 'ms');
}
await b.close();
if (errors.length) { console.log('PAGE ERRORS\n' + errors.join('\n')); process.exit(1); }
