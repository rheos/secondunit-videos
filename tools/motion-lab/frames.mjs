// frames.mjs · open any look page and draw frames from it, through the contract every look under
// mv-projects keeps: window.__ready, and window.__frameJPEG(t, q) returning a JPEG data URL for song time t.
// Used by audit.mjs, views.mjs and render-slice.mjs (SHUTTER).
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

// Playwright from the project you run in (every look has it), else from this folder's own node_modules.
async function playwright() {
  const req = createRequire(import.meta.url);
  let p;
  try { p = req.resolve('playwright', { paths: [process.cwd(), path.dirname(fileURLToPath(import.meta.url))] }); } catch {
    console.error('playwright not found: run from a look folder that has it (npm i -D playwright)'); process.exit(2);
  }
  return (await import(pathToFileURL(p).href)).default;
}

// Local Macs use the installed Chrome with the GPU on; runners use Playwright's Chromium (CR_CHANNEL unset there).
export async function launch() {
  const { chromium } = await playwright();
  const mac = process.platform === 'darwin';
  const channel = process.env.CR_CHANNEL || (mac ? 'chrome' : undefined);
  return chromium.launch({ headless: true, ...(channel ? { channel } : {}),
    args: mac ? ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'] : [] });
}

export async function openLook(browser, page, { width = 1920, height = 1080 } = {}) {
  const p = await browser.newPage({ viewport: { width, height } });
  const errors = [];
  p.on('pageerror', (e) => errors.push(String(e)));
  p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  p.setDefaultTimeout(600000);
  const [file, query = ''] = page.split('?');
  const url = pathToFileURL(path.resolve(file)).href + '?' + ['offline=1', query].filter(Boolean).join('&');
  // domcontentloaded: a look's <audio> points at the song, which may be absent, and can stall the load event
  await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 600000 });
  await p.evaluate(() => window.__ready);
  return { p, errors };
}

export const jpegBuffer = (dataUrl) => Buffer.from(dataUrl.split(',')[1], 'base64');

// One frame as a data URL.
export const frame = (p, t, q = 0.92) => p.evaluate(([t, q]) => window.__frameJPEG(t, q), [t, q]);

// Everything the look's ML.probe calls recorded while drawing time t.
export const probe = (p, t) => p.evaluate(async (t) => {
  window.__probeLog = [];
  try { await window.__frameJPEG(t, 0.3); return window.__probeLog; } finally { window.__probeLog = undefined; }
}, t);

// Average several frames in linear light, inside the page. Used for shutter blur (times spread over
// half a frame) and for onion skins (times spread over a move). Returns a JPEG data URL.
export const average = (p, times, q = 0.92) => p.evaluate(async ([times, q]) => {
  const toLin = new Float32Array(256);
  for (let i = 0; i < 256; i++) { const c = i / 255; toLin[i] = c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }
  const toSrgb = new Uint8ClampedArray(4096);
  for (let i = 0; i < 4096; i++) { const l = i / 4095; toSrgb[i] = Math.round(255 * (l <= 0.0031308 ? l * 12.92 : 1.055 * l ** (1 / 2.4) - 0.055)); }
  let acc = null, cv = null, g = null;
  for (const t of times) {
    const url = await window.__frameJPEG(t, 0.97);
    const bmp = await createImageBitmap(await (await fetch(url)).blob());
    if (!cv) { cv = new OffscreenCanvas(bmp.width, bmp.height); g = cv.getContext('2d', { willReadFrequently: true }); acc = new Float32Array(bmp.width * bmp.height * 3); }
    g.drawImage(bmp, 0, 0);
    const d = g.getImageData(0, 0, cv.width, cv.height).data;
    for (let i = 0, j = 0; i < d.length; i += 4, j += 3) { acc[j] += toLin[d[i]]; acc[j + 1] += toLin[d[i + 1]]; acc[j + 2] += toLin[d[i + 2]]; }
  }
  const out = g.createImageData(cv.width, cv.height), o = out.data, n = times.length;
  for (let i = 0, j = 0; i < o.length; i += 4, j += 3) {
    o[i] = toSrgb[Math.min(4095, (acc[j] / n * 4095) | 0)]; o[i + 1] = toSrgb[Math.min(4095, (acc[j + 1] / n * 4095) | 0)];
    o[i + 2] = toSrgb[Math.min(4095, (acc[j + 2] / n * 4095) | 0)]; o[i + 3] = 255;
  }
  g.putImageData(out, 0, 0);
  const blob = await cv.convertToBlob({ type: 'image/jpeg', quality: q });
  return await new Promise((r) => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(blob); });
}, [times, q]);

// A strobe photo of a move, for onion skins: each pixel takes the frame that differs most from the
// average, so every pose shows at full strength and what holds still is untouched. Older poses fade
// toward the average so the direction reads. Holds every frame in memory: keep it under ~40 frames.
export const strobe = (p, times, q = 0.92) => p.evaluate(async ([times, q]) => {
  const frames = []; let cv = null, g = null;
  for (const t of times) {
    const bmp = await createImageBitmap(await (await fetch(await window.__frameJPEG(t, 0.97))).blob());
    if (!cv) { cv = new OffscreenCanvas(bmp.width, bmp.height); g = cv.getContext('2d', { willReadFrequently: true }); }
    g.drawImage(bmp, 0, 0); frames.push(g.getImageData(0, 0, cv.width, cv.height).data);
  }
  const n = frames.length, len = frames[0].length, mean = new Float32Array(len);
  for (const d of frames) for (let i = 0; i < len; i++) mean[i] += d[i] / n;
  const out = g.createImageData(cv.width, cv.height), o = out.data;
  for (let i = 0; i < len; i += 4) {
    let best = 0, k = 0;
    for (let j = 0; j < n; j++) { const d = frames[j]; const dev = Math.abs(d[i] - mean[i]) + Math.abs(d[i + 1] - mean[i + 1]) + Math.abs(d[i + 2] - mean[i + 2]); if (dev > best) { best = dev; k = j; } }
    const a = n > 1 ? 0.35 + 0.65 * k / (n - 1) : 1, d = frames[k];
    o[i] = mean[i] + (d[i] - mean[i]) * a; o[i + 1] = mean[i + 1] + (d[i + 1] - mean[i + 1]) * a; o[i + 2] = mean[i + 2] + (d[i + 2] - mean[i + 2]) * a; o[i + 3] = 255;
  }
  g.putImageData(out, 0, 0);
  const blob = await cv.convertToBlob({ type: 'image/jpeg', quality: q });
  return await new Promise((r) => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(blob); });
}, [times, q]);

// A 180-degree shutter: n subframes spread over half a frame, centred on t, so the pose at t stays put.
export const shutterTimes = (t, fps, n) => [...Array(n)].map((_, k) => t + ((k + 0.5) / n - 0.5) * (0.5 / fps));
export const blurFrame = (p, t, fps, n, q = 0.92) => (n > 1 ? average(p, shutterTimes(t, fps, n), q) : frame(p, t, q));

// Simple flag parser: positional args plus --name value pairs.
export function args(argv, defaults) {
  const pos = [], o = { ...defaults };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) { const k = argv[i].slice(2); const v = argv[i + 1]; o[k] = typeof defaults[k] === 'number' ? Number(v) : v; i++; } else pos.push(argv[i]);
  }
  return [pos, o];
}
