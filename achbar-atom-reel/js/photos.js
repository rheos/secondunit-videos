// Archival prints. US government public-domain photographs (assets/pd/manifest.json), shown as they are:
// no recolouring or filters, only a paper mount, framing, a slow push-in and an iris. The schematic
// annotations around them are drawn on top, crisp, by the shots.
'use strict';
const IMG = {};
const PD = ['trinity', 'eniac-beck-snyder', 'atoms-for-peace-stamp'];
function loadImgs() {
  return Promise.all(PD.map((k) => new Promise((res) => {
    const i = new Image(); i.onload = () => { IMG[k] = i; res(); }; i.onerror = () => { console.error('missing image ' + k); res(); }; i.src = 'assets/pd/' + k + '.jpg';
  })));
}
// frame size of a print of width w
const printH = (key, w) => (IMG[key] ? w * IMG[key].height / IMG[key].width : w * .6);
// screen point of image point (u, v) (0..1) in a print centred at cx, cy of width w with push-in z about focus (fx, fy)
function printPt(key, cx, cy, w, u, v, o = {}) {
  const h = printH(key, w), z = o.z || 1, fx = o.fx ?? .5, fy = o.fy ?? .5;
  return [cx - w / 2 + fx * w + (u - fx) * w * z, cy - h / 2 + fy * h + (v - fy) * h * z];
}
// o: {alpha, z, fx, fy, mount (px), iris: {x, y, r} in screen coords, rot}
function print(key, cx, cy, w, o = {}) {
  const im = IMG[key]; if (!im) return;
  const h = printH(key, w), z = o.z || 1, fx = o.fx ?? .5, fy = o.fy ?? .5, m = o.mount ?? 14;
  X.save(); X.globalAlpha = cl(o.alpha ?? 1);
  if (o.iris) { X.beginPath(); X.arc(o.iris.x, o.iris.y, Math.max(0, o.iris.r), 0, TAU); X.clip(); }
  X.translate(cx, cy); X.rotate(o.rot || 0);
  if (m > 0) { X.fillStyle = 'rgba(0,0,0,.35)'; X.fillRect(-w / 2 - m + 10, -h / 2 - m + 14, w + 2 * m, h + 2 * m); X.fillStyle = '#efece3'; X.fillRect(-w / 2 - m, -h / 2 - m, w + 2 * m, h + 2 * m); }
  X.beginPath(); X.rect(-w / 2, -h / 2, w, h); X.clip();
  const dw = w * z, dh = h * z; X.drawImage(im, -w / 2 + fx * w - fx * dw, -h / 2 + fy * h - fy * dh, dw, dh);
  X.restore();
}
