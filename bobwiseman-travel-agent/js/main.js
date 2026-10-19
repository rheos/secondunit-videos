// Frame driver. renderFrame(t) draws song time t (seconds).
// On twos: the drawing is held for 2 song frames (seeded by the even frame index), grain changes every frame.
// SHOTS (from shots.js) is the cut list: [{t0, t1, mode:'ill'|'sch', draw(p, lt, sh)}], p = 0..1 across the shot.
'use strict';
const SHOTS = buildShots();
const out = document.getElementById('c'); out.width = W; out.height = H; const O = out.getContext('2d');
const buf = document.createElement('canvas'); buf.width = W; buf.height = H; X = buf.getContext('2d');
if (typeof ink2Init === 'function') ink2Init(X); // js/ink2.js: the upgraded line and wash (?ink=1 = draft 15 look)
const GP = [0, 1, 2, 3].map((i) => grainCanvas(11 + i, false)), GD = [0, 1, 2, 3].map((i) => grainCanvas(91 + i, true));
let lastFD = -1, lastShot = null;

function shotAt(t) { for (const s of SHOTS) if (t >= s.t0 && t < s.t1) return s; return SHOTS[SHOTS.length - 1]; }
function renderFrame(t) {
  const f = Math.floor(t * FPS + 1e-6), fd = f - (f & 1), td = fd / FPS;
  const sh = shotAt(Math.max(td, shotAt(t).t0)); // a held drawing never crosses a cut
  if (fd !== lastFD || sh !== lastShot) {
    lastFD = fd; lastShot = sh; FD = fd; DSEED = Math.round(sh.t0 * 97) + 1; R = M32((fd * 9301 + DSEED) >>> 0);
    X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha = 1; X.globalCompositeOperation = 'source-over'; X.setLineDash([]);
    const lt = Math.max(0, td - sh.t0), p = cl(lt / (sh.t1 - sh.t0));
    X.save(); try { sh.draw(p, lt, sh); } catch (e) { console.error(e && e.stack || e); } X.restore();
    X.setTransform(1, 0, 0, 1, 0, 0);
  }
  O.globalAlpha = 1; O.drawImage(buf, 0, 0);
  const G = sh.mode === 'ill' ? GP : GD; O.drawImage(G[f & 3], ((f * 3) % 5) - 6, ((f * 7) % 5) - 6, W + 12, H + 12);
}
window.__frameJPEG = (t, q = .93) => { renderFrame(t); return out.toDataURL('image/jpeg', q); };
window.__ready = Promise.resolve(true);

// Interactive preview (not used by render.mjs): click to play with the song, arrow keys scrub, ?t=SECONDS starts there.
if (!/offline=1/.test(location.search)) {
  const au = new Audio('../assets/song.wav'); const st = Number(new URLSearchParams(location.search).get('t') || 0);
  let t = st; renderFrame(t);
  const tick = () => { if (!au.paused) { t = au.currentTime; renderFrame(t); } requestAnimationFrame(tick); }; tick();
  out.onclick = () => { if (au.paused) { au.currentTime = t; au.play(); } else au.pause(); };
  addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') t += e.shiftKey ? 10 : 1; if (e.key === 'ArrowLeft') t = Math.max(0, t - (e.shiftKey ? 10 : 1)); if (!au.paused) au.currentTime = t; renderFrame(t); });
}
