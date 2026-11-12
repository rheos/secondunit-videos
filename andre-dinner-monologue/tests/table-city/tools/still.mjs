// still.mjs · save frames as full-size JPEGs named by frame: node tools/still.mjs <page> <out-dir> <frame> [frame ...] [--width 720 --height 1280]
import fs from 'fs';
import { launch, openLook, frame, jpegBuffer, args } from '../../../../tools/motion-lab/frames.mjs';
const [[page, dir, ...frames], o] = args(process.argv.slice(2), { width: 720, height: 1280, fps: 24 });
fs.mkdirSync(dir, { recursive: true });
const browser = await launch();
const { p, errors } = await openLook(browser, page, o);
for (const f of frames) { const out = `${dir}/f${f}.jpg`; fs.writeFileSync(out, jpegBuffer(await frame(p, Number(f) / o.fps, .93))); console.log(out); }
await browser.close();
if (errors.length) { console.log('PAGE ERRORS\n' + [...new Set(errors)].join('\n')); process.exit(1); }
