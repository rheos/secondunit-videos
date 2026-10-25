// still.mjs · save frames of a page as JPEGs: node tools/still.mjs <page> <out-prefix> <t> [t ...] [--width 1920 --height 1080]
import fs from 'fs';
import path from 'path';
import { launch, openLook, frame, jpegBuffer, args } from '../../tools/motion-lab/frames.mjs';
const [[page, prefix, ...ts], o] = args(process.argv.slice(2), { width: 1920, height: 1080 });
fs.mkdirSync(path.dirname(prefix), { recursive: true });
const browser = await launch();
const { p, errors } = await openLook(browser, page, o);
for (const t of ts) { const f = `${prefix}_${Number(t).toFixed(2)}.jpg`; fs.writeFileSync(f, jpegBuffer(await frame(p, Number(t), .93))); console.log(f); }
await browser.close();
if (errors.length) { console.log('PAGE ERRORS\n' + [...new Set(errors)].join('\n')); process.exit(1); }
