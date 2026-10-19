// Frame driver. renderFrame(t) draws score time t (seconds) from scratch every frame (motion runs on ones),
// with the kit's RNG reseeded per held drawing on twos, so hand-drawn lines boil in pairs like Travel Agent.
// Grain changes every frame. Frames are pure functions of t: they render in parallel and out of order.
'use strict';
const SHOTS = buildShots();
const out = document.getElementById('c'); out.width = W; out.height = H; const O = out.getContext('2d');
const buf = document.createElement('canvas'); buf.width = W; buf.height = H; X = buf.getContext('2d');
const GD = [0, 1, 2, 3].map((i) => grainCanvas(91 + i, true));
function shotAt(t) { for (const s of SHOTS) if (t >= s.t0 && t < s.t1) return s; return SHOTS[SHOTS.length - 1]; }
function renderFrame(t) {
  const f = Math.floor(t * FPS + 1e-6), fd = f - (f & 1), sh = shotAt(t);
  FD = fd; DSEED = Math.round(sh.t0 * 97) + 1; R = M32((fd * 9301 + DSEED) >>> 0);
  X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha = 1; X.globalCompositeOperation = 'source-over'; X.setLineDash([]); X.filter = 'none'; X.shadowBlur = 0;
  X.save(); try { sh.draw(t); } catch (e) { console.error(e && e.stack || e); } X.restore();
  O.globalAlpha = 1; O.drawImage(buf, 0, 0);
  O.globalAlpha = sh.mode === 'scope' ? .5 : 1; O.drawImage(GD[f & 3], ((f * 3) % 5) - 6, ((f * 7) % 5) - 6, W + 12, H + 12); O.globalAlpha = 1;
  const fin = cl((t - 0) / 1.0) * (1 - cl((t - (END - .6)) / .6));   // picture in from black at the top, out at the very end
  if (fin < 1) { O.fillStyle = `rgba(0,0,0,${1 - fin})`; O.fillRect(0, 0, W, H); }
}
window.__frameJPEG = (t, q = .93) => { renderFrame(t); return out.toDataURL('image/jpeg', q); };
const FONTS = ['900 100px Archivo', '800 100px Archivo', '400 100px "JetBrains Mono"', '700 100px "JetBrains Mono"', 'italic 400 100px "Instrument Serif"'];
window.__ready = Promise.all([loadImgs(), ...FONTS.map((f) => document.fonts.load(f))]).then(() => document.fonts.ready).then(() => true);
if (!/offline=1/.test(location.search)) {
  const au = new Audio('assets/song.wav'); let t = Number(new URLSearchParams(location.search).get('t') || 0);
  window.__ready.then(() => renderFrame(t));
  const tick = () => { if (!au.paused) { t = au.currentTime; renderFrame(t); } requestAnimationFrame(tick); }; tick();
  out.onclick = () => { if (au.paused) { au.currentTime = t; au.play(); } else au.pause(); };
  addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') t += e.shiftKey ? 10 : 1; if (e.key === 'ArrowLeft') t = Math.max(0, t - (e.shiftKey ? 10 : 1)); if (!au.paused) au.currentTime = t; renderFrame(t); });
}
