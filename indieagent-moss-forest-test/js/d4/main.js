// d4 frame assembly and the offline hooks.
const cv = document.getElementById('c'); cv.width = W; cv.height = H; const X = cv.getContext('2d'); X.imageSmoothingQuality = 'high';
const PROBE = (typeof ML !== 'undefined' && ML.probe) || { on: false, text() {}, box() {}, event() {}, edge() {}, value() {} };
buildGiant(); buildMoss(); uploadGeo();
const PL = { back: bakeBack(), front: bakeFront() };
const TILES = (() => { const a = []; for (let k = 0; k < 6; k++) { const c = canvas(256, 139), g = c.getContext('2d'), d = g.createImageData(256, 139); for (let i = 0; i < 256 * 139; i++) { const q = 128 + (h2(i, k, 301) - .5) * 190; d.data[i * 4] = d.data[i * 4 + 1] = d.data[i * 4 + 2] = q; d.data[i * 4 + 3] = 255; } g.putImageData(d, 0, 0); a.push(c); } return a; })();
const SUNV = [.6, .62, -.5];
const CAM_W = (t) => { const k = t * .012; return { eye: [-10.2 + k * 6, 3.3, 16.2 - k * 12], at: [.2, 2.6, 0], fov: .5 }; };
function camera(c) { return { P: M.persp(c.fov, W / H, .5, 80), V: M.look(c.eye, c.at) }; }
function drawFrame(t) {
  const f = Math.round(t * FPS), dx = -2.4 * t, dxF = -5.2 * t;
  X.setTransform(1, 0, 0, 1, 0, 0); X.globalCompositeOperation = 'source-over'; X.globalAlpha = 1;
  X.drawImage(PL.back, -PX + dx * .5, -PY);
  const p = poseG(t), parts = partMatrices(p, drawT(t));
  const r = renderGiant(parts, camera(CAM_W(drawT(t))), { L: SUNV, glow: 0, ray: 0, rayP: [0, 0, 0], seed: Math.floor(drawT(t) * 12) * 0 + 3 });
  X.drawImage(r.c, 0, 0, W, H);
  X.drawImage(PL.front, -PX + dxF * .5, -PY);
  X.save(); X.globalCompositeOperation = 'overlay'; X.globalAlpha = .055 * 2.2; X.drawImage(TILES[Math.floor(f / 2) * 7 % 6], 0, 0, W, H); X.restore();
}
window.drawFrame = drawFrame;
window.__frameJPEG = (t, q = .92) => { drawFrame(clamp(t, 0, DUR - 1e-6)); return q >= 1 ? cv.toDataURL('image/png') : cv.toDataURL('image/jpeg', q); };
window.__ready = Promise.resolve(true);
