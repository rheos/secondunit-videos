// still.mjs · save stills from a look page: node tools/still.mjs <page> <out-prefix> <t...> [--width W --height H]
// Writes <out-prefix>_<t>.jpg for each time t (song seconds).
import fs from 'fs';
import path from 'path';
import { launch, openLook, frame, jpegBuffer } from '../../tools/motion-lab/frames.mjs';

const argv = process.argv.slice(2);
const opt = { width: 1920, height: 1080 };
const pos = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i].startsWith('--')) opt[argv[i].slice(2)] = Number(argv[++i]); else pos.push(argv[i]);
}
const [page, prefix, ...ts] = pos;
fs.mkdirSync(path.dirname(prefix), { recursive: true });
const b = await launch();
const { p, errors } = await openLook(b, page, opt);
for (const t of ts) {
  const out = `${prefix}_${Number(t).toFixed(2)}.jpg`;
  fs.writeFileSync(out, jpegBuffer(await frame(p, Number(t), 0.93)));
  console.log(out);
}
await b.close();
if (errors.length) { console.log('PAGE ERRORS\n' + [...new Set(errors)].join('\n')); process.exit(1); }
