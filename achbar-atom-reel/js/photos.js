// Archival prints. US government public-domain photographs and drawings (assets/pd/manifest.json). Photos are
// shown as they are: no recolouring or filters, only a paper mount, framing, a slow push-in, an iris or a clip.
// A drawing is first shown as scanned; only then may it turn into light linework on the blueprint (lineArt).
// The schematic annotations around them are drawn on top, crisp, by the shots.
'use strict';
const IMG = {};
const PD = ['trinity', 'eniac-beck-snyder', 'atoms-for-peace-stamp', 'breactor-pile', 'trinity-haer-fireball', 'trinity-haer-bomb', 'la-602'];
function loadImgs() {
  return Promise.all(PD.map((k) => new Promise((res) => {
    const i = new Image(); i.onload = () => { IMG[k] = i; res(); }; i.onerror = () => { console.error('missing image ' + k); res(); }; i.src = 'assets/pd/' + k + '.jpg';
  })));
}
// crop windows (u0, v0, u1, v1) per image: the drawings' scans carry film borders and grey scales we leave out
const CROP = { 'breactor-pile': [.075, .176, .935, .86], 'la-602': [.08, .30, .92, .70] };
const crop = (key) => CROP[key] || [0, 0, 1, 1];
// frame size of a print of width w
const printH = (key, w) => { const im = IMG[key], c = crop(key); return im ? w * (im.height * (c[3] - c[1])) / (im.width * (c[2] - c[0])) : w * .6; };
// screen point of image point (u, v) (0..1) in a print centred at cx, cy of width w with push-in z about focus (fx, fy)
function printPt(key, cx, cy, w, u, v, o = {}) {
  const h = printH(key, w), z = o.z || 1, fx = o.fx ?? .5, fy = o.fy ?? .5;
  return [cx - w / 2 + fx * w + (u - fx) * w * z, cy - h / 2 + fy * h + (v - fy) * h * z];
}
// o: {alpha, z, fx, fy, mount (px), iris: {x, y, r} in screen coords, clip: [x, y, w, h] in screen coords, rot, lines}
function print(key, cx, cy, w, o = {}) {
  const im = IMG[key]; if (!im) return;
  const h = printH(key, w), z = o.z || 1, fx = o.fx ?? .5, fy = o.fy ?? .5, m = o.mount ?? 14;
  X.save(); X.globalAlpha = cl(o.alpha ?? 1);
  if (o.iris) { X.beginPath(); X.arc(o.iris.x, o.iris.y, Math.max(0, o.iris.r), 0, TAU); X.clip(); }
  if (o.clip) { X.beginPath(); X.rect(...o.clip); X.clip(); }
  X.translate(cx, cy); X.rotate(o.rot || 0);
  if (m > 0) { X.fillStyle = 'rgba(0,0,0,.35)'; X.fillRect(-w / 2 - m + 10, -h / 2 - m + 14, w + 2 * m, h + 2 * m); X.fillStyle = '#efece3'; X.fillRect(-w / 2 - m, -h / 2 - m, w + 2 * m, h + 2 * m); }
  X.beginPath(); X.rect(-w / 2, -h / 2, w, h); X.clip();
  const dw = w * z, dh = h * z, c = crop(key), src = o.lines ? lineArt(key) : im;
  if (o.lines) X.globalCompositeOperation = 'lighter';
  X.drawImage(src, c[0] * src.width, c[1] * src.height, (c[2] - c[0]) * src.width, (c[3] - c[1]) * src.height, -w / 2 + fx * w - fx * dw, -h / 2 + fy * h - fy * dh, dw, dh);
  X.restore();
}
// The same scan as light lines on black (paper inverted away, contrast up): composited with 'lighter' onto the
// navy, the drawing's own linework becomes the blueprint. Cached per image.
const LINES = {};
function lineArt(key) {
  if (LINES[key]) return LINES[key];
  const im = IMG[key], c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const g = c.getContext('2d');
  g.filter = 'grayscale(1) invert(1) contrast(2.6) brightness(.85)'; g.drawImage(im, 0, 0);
  g.filter = 'none'; g.globalCompositeOperation = 'multiply'; g.fillStyle = '#c9c6ff'; g.fillRect(0, 0, c.width, c.height);
  return (LINES[key] = c);
}
