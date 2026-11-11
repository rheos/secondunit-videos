// Shared by render.mjs, check.mjs and compare.mjs: find the film, read its config and clock, verify the audio pin,
// open its page in Chrome. Every path in a film's config is relative to the film folder (where film.config.js is).
import fs from 'fs'; import path from 'path'; import vm from 'vm'; import crypto from 'crypto'; import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

export const ENGINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Pull --name value / --flag options out of argv; the rest stay positional.
export function parseArgs(argv, flags = []) {
  const opt = {}, pos = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) { const k = a.slice(2); if (flags.includes(k)) opt[k] = true; else opt[k] = argv[++i]; }
    else pos.push(a);
  }
  return { opt, pos };
}

// The film folder: --film DIR, else $FILM_DIR, else the current folder.
export function loadFilm(dir) {
  dir = path.resolve(dir || process.env.FILM_DIR || '.');
  const cfgFile = path.join(dir, 'film.config.js');
  if (!fs.existsSync(cfgFile)) throw new Error(`no film.config.js in ${dir} (run from a film folder or pass --film DIR)`);
  const ctx = vm.createContext({ console });
  vm.runInContext(fs.readFileSync(cfgFile, 'utf8'), ctx, { filename: cfgFile });
  const film = vm.runInContext('FILM', ctx);
  vm.runInContext(fs.readFileSync(path.join(ENGINE, 'js/clock.js'), 'utf8'), ctx, { filename: 'clock.js' });
  const clockFile = path.join(dir, film.clock || 'clock.js');
  vm.runInContext(fs.readFileSync(clockFile, 'utf8'), ctx, { filename: clockFile });
  const clock = vm.runInContext('CLOCK', ctx);
  return { dir, film, clock, fps: clock.fps, page: path.join(dir, film.page || 'film.html'), size: film.size || [1920, 1080] };
}

// The song this film is timed to, after checking it is the pinned file. Returns null if the file is missing.
export function audioPath(F, { required = false } = {}) {
  const a = F.clock.audio || {}; if (!a.file) { if (required) throw new Error('clock has no audio.file'); return null; }
  const file = path.join(F.dir, a.file);
  if (!fs.existsSync(file)) { if (required) throw new Error(`audio missing: ${file} (gitignored; copy it in and check the sha256 in the film README)`); return null; }
  if (a.sha256) {
    const got = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
    if (got !== a.sha256) throw new Error(`audio pin mismatch: ${file}\n  pinned ${a.sha256}\n  file   ${got}\nThe clock (beats, words, cuts) was timed to the pinned file; re-time before using another.`);
  }
  return file;
}

// Chrome with the GPU flags every film has rendered with, one page per worker, the film page opened offline.
// CL_GPU=0 draws on the CPU instead: slower, but bit-exact from page to page (GPU canvas can differ by one level on a
// few pixels between two pages drawing the same frame), so compare.mjs uses it for proofs.
export async function openBrowser() {
  const gpu = process.env.CL_GPU !== '0';
  return chromium.launch({ channel: process.env.CL_CHANNEL || 'chrome', headless: true,
    args: gpu ? ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'] : ['--disable-gpu', '--disable-accelerated-2d-canvas'] });
}
export async function openPage(b, pageFile, size, qs, errs) {
  const p = await b.newPage({ viewport: { width: size[0], height: size[1] } });
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); }); p.on('pageerror', (e) => errs.push(String(e)));
  await p.goto('file://' + pageFile + '?offline=1' + (qs ? '&' + qs : '')); await p.evaluate(() => window.__ready);
  return p;
}
export const writeDataURL = (file, url) => fs.writeFileSync(file, Buffer.from(url.split(',')[1], 'base64'));

// Event frames for review: the first frame of every cut and of every sung line, from the page's own shot list.
export async function eventFrames(page, fps, kinds) {
  const info = await page.evaluate(() => window.__film ? window.__film() : null);
  if (!info) throw new Error('page has no window.__film() (not a cleanline page?)');
  const out = new Map(); const first = (t) => Math.ceil(t * fps - 1e-6);
  if (kinds.includes('cuts')) for (const s of info.shots) out.set(first(s.t0), { ...(out.get(first(s.t0)) || {}), cut: s.key || s.mode });
  if (kinds.includes('lines')) for (const l of info.lines) out.set(first(l[0]), { ...(out.get(first(l[0])) || {}), line: true });
  return [...out.entries()].sort((a, b) => a[0] - b[0]).map(([f, tag]) => ({ f, ...tag }));
}
