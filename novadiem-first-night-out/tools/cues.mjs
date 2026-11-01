// cues.mjs · write a scene's sound cues to assets/<scene>_cues.json: node tools/cues.mjs creek
// The scene reports them itself (S.cues()), from the same curves it draws with.
import fs from 'fs';
import { launch, openLook } from '../../tools/motion-lab/frames.mjs';
const name = process.argv[2] || 'creek';
const browser = await launch();
const { p, errors } = await openLook(browser, `${name}.html?w=640`, { width: 640, height: 360 });
const [cues, end] = await p.evaluate(() => [window.S.cues(), window.S.END]);
await browser.close();
if (errors.length) { console.log(errors.join('\n')); process.exit(1); }
fs.mkdirSync('assets', { recursive: true });
fs.writeFileSync(`assets/${name}_cues.json`, JSON.stringify({ end, cues }, null, 1));
const count = {}; for (const c of cues) count[c.k] = (count[c.k] || 0) + 1;
console.log(`assets/${name}_cues.json: ${cues.length} cues`, JSON.stringify(count));
