// cues.mjs · node tools/cues.mjs [page] [out.json]   (default: loop.html -> out/loop-cues.json)
// Opens the page and writes its cue list (window.FILM.cues()): every event in the loop, for tools/sound.py.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { launch, openLook } from '../../tools/motion-lab/frames.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [page = 'loop.html', out = 'out/loop-cues.json'] = process.argv.slice(2);
const browser = await launch();
const { p, errors } = await openLook(browser, path.join(root, page), { width: 640, height: 360 });
const cues = await p.evaluate(() => window.FILM.cues());
await browser.close();
if (errors.length) { console.log('PAGE ERRORS\n' + errors.join('\n')); process.exit(1); }
fs.mkdirSync(path.dirname(path.join(root, out)), { recursive: true });
fs.writeFileSync(path.join(root, out), JSON.stringify({ loop: 12, cues }, null, 1));
const kinds = {}; for (const c of cues) kinds[c.kind] = (kinds[c.kind] || 0) + 1;
console.log(`${out}: ${cues.length} cues`, kinds);
