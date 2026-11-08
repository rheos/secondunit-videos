// Frame driver, after the Romancing the Atom reel: renderFrame(t) draws passage time t from scratch, with the kit's
// RNG reseeded per held drawing on twos so hand-drawn lines boil in pairs. Plates draw on a 2D buffer; the WebGL
// pass (finish.js) pulls any woodcut rectangle as a print and passes everything else through.
'use strict';
const out = document.getElementById('c'); const FINISH = FIN.init(out);
const buf = document.createElement('canvas'); buf.width = W; buf.height = H; X = buf.getContext('2d');
const GD = [0, 1, 2, 3].map((i) => grainCanvas(91 + i, true));
function renderFrame(t) {
  t = Math.min(t, END - 1e-4);
  const f = Math.floor(t * FPS + 1e-6), fd = f - (f & 1);
  FD = fd; DSEED = 7 + PLATES.filter(([a]) => t >= a).length * 13; R = M32((fd * 9301 + DSEED) >>> 0);
  WOOD = null; FLASH = 0; GRAIN = 1; WMIX = 1;
  X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha = 1; X.globalCompositeOperation = 'source-over'; X.setLineDash([]); X.filter = 'none'; X.shadowBlur = 0;
  X.save(); try { drawAt(t); } catch (e) { console.error(e && e.stack || e); } X.restore();
  X.setTransform(1, 0, 0, 1, 0, 0);
  if (GRAIN > 0) { X.globalAlpha = .7 * GRAIN; X.drawImage(GD[f & 3], ((f * 3) % 5) - 6, ((f * 7) % 5) - 6, W + 12, H + 12); X.globalAlpha = 1; }
  FINISH.present(buf, t, WOOD, FLASH, WMIX);
}
window.__frameJPEG = (t, q = .93) => { renderFrame(t); return out.toDataURL('image/jpeg', q); };
const FONTS = ['900 100px Archivo', '800 100px Archivo', '400 100px "JetBrains Mono"', '700 100px "JetBrains Mono"', '400 100px "Instrument Serif"', 'italic 400 100px "Instrument Serif"'];
window.__ready = Promise.all(FONTS.map((f) => document.fonts.load(f))).then(() => document.fonts.ready).then(() => true);
if (!/offline=1/.test(location.search)) {
  const au = new Audio('assets/song.wav'); let t = Number(new URLSearchParams(location.search).get('t') || 0);
  window.__ready.then(() => renderFrame(t));
  const tick = () => { if (!au.paused) { t = au.currentTime; renderFrame(t); } requestAnimationFrame(tick); }; tick();
  out.onclick = () => { if (au.paused) { au.currentTime = t; au.play(); } else au.pause(); };
  addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') t += e.shiftKey ? 1 : .1; if (e.key === 'ArrowLeft') t = Math.max(0, t - (e.shiftKey ? 1 : .1)); if (!au.paused) au.currentTime = t; renderFrame(t); });
}
