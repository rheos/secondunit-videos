// npm run check: is this machine ready to render the segment? Reads segment.json "requires" and tests each thing.
// Prints OK or MISSING per line, with the exact command to fix it on this OS. Exit 0 when ready, 1 when not.
// Safe to run any time: it installs nothing itself.
import fs from 'fs'; import path from 'path'; import os from 'os'; import { execFileSync } from 'child_process'; import { fileURLToPath } from 'url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const seg = JSON.parse(fs.readFileSync(path.join(HERE, 'segment.json'), 'utf8'));
const req = seg.requires || {}, plat = os.platform();
const fix = (o) => o[plat] || o.any || '';
let ready = true;
const line = (ok, what, detail, how) => {
  console.log(`${ok ? 'OK     ' : 'MISSING'} ${what}${detail ? `  (${detail})` : ''}`);
  if (!ok) { ready = false; if (how) console.log(`        fix: ${how}`); }
};

// Node
const nodeMajor = Number(process.versions.node.split('.')[0]), needNode = Number(String(req.node || '20').replace(/\D/g, ''));
line(nodeMajor >= needNode, `Node ${needNode}+`, `found ${process.versions.node}`,
  fix({ darwin: 'brew install node (or https://nodejs.org)', linux: 'install Node from https://nodejs.org or your package manager', win32: 'winget install OpenJS.NodeJS.LTS' }));

// ffmpeg
let ff = null; try { ff = execFileSync('ffmpeg', ['-version'], { encoding: 'utf8' }).split('\n')[0]; } catch {}
if (req.ffmpeg !== false) line(!!ff, 'ffmpeg on the PATH', ff ? ff.replace(/ Copyright.*/, '') : 'not found',
  fix({ darwin: 'brew install ffmpeg', linux: 'sudo apt install ffmpeg (or your distro\'s package)', win32: 'winget install Gyan.FFmpeg' }));

// Playwright, then a browser it can drive
let chromium = null;
try { ({ chromium } = await import('playwright')); line(true, 'playwright (npm)'); }
catch { line(false, 'playwright (npm)', 'not installed', 'npm install'); }
if (chromium) {
  let b = null, which = '';
  try { if (process.env.QUIVER_BROWSER === 'chromium') throw 0; b = await chromium.launch({ channel: 'chrome', headless: true }); which = 'Google Chrome'; }
  catch { try { b = await chromium.launch({ headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }); which = 'Playwright Chromium'; } catch {} }
  line(!!b, 'a browser for rendering', which || 'neither Google Chrome nor Playwright Chromium starts', 'install Google Chrome, or run: npx playwright install chromium');
  if (b && req.webgl2) {
    const p = await b.newPage();
    const gl = await p.evaluate(() => !!document.createElement('canvas').getContext('webgl2'));
    line(gl, 'WebGL2 in that browser', gl ? '' : 'the look\'s finish pass needs it',
      'install Google Chrome (its GPU path); on a headless server, Playwright Chromium with software WebGL usually works');
  }
  if (b) await b.close();
}

// optional and paid steps: listed, not tested
for (const o of seg.optional || []) console.log(`OPTIONAL ${o.what}${o.cost ? `  (cost: ${o.cost})` : ''}${o.options ? `\n        options: ${o.options.join('; ')}` : ''}`);
console.log(ready ? `\nready: npm run render  ->  ${seg.output}` : '\nnot ready: fix the MISSING lines above, then run npm run check again');
process.exit(ready ? 0 : 1);
