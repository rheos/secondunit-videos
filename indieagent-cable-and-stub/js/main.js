// Timeline: 13 bars of 2.5 s (the drafting-table take at 96 BPM, excerpt 57.561-90.044 s of take-01). drawFrame(t) is pure.
'use strict';
(() => {
  const cv = document.getElementById('c'); const ctx = cv.getContext('2d', { alpha: false }); setCtx(ctx);
  const DUR = 13 * BAR;
  function drawFrame(t) {
    t = cl(t, 0, DUR - 1 / FPS);
    const bar = Math.min(12, Math.floor(t / BAR)), u = (t - bar * BAR) / BAR;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    paper();
    SHOT0 = bar * BAR; SHOTS[bar](u, t);
    // fade with the music at the very end
    const fo = seg(t, DUR - 1.2, DUR - .05); if (fo > 0) { ctx.fillStyle = C.ink; ctx.globalAlpha = fo; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
  }
  window.drawFrame = drawFrame;
  window.__cues = () => [...CUES.values()].sort((a, b) => a.t - b.t || a.k.localeCompare(b.k));
  window.__frameJPEG = (t, q = .92) => { drawFrame(t); return cv.toDataURL('image/jpeg', q); };
  const offline = new URLSearchParams(location.search).has('offline');
  const ready = document.fonts ? document.fonts.load('700 22px "Archivo"').catch(() => 0) : Promise.resolve();
  window.__ready = ready.then(() => { drawFrame(0); return true; });
  if (!offline) {
    const a = document.getElementById('a'), tt = document.getElementById('t'), bb = document.getElementById('b'), s = document.getElementById('s');
    document.getElementById('play').onclick = () => a.paused ? a.play() : a.pause();
    s.oninput = () => { a.currentTime = +s.value; drawFrame(+s.value); };
    const loop = () => { const t = a.currentTime; if (!a.paused) { drawFrame(t); s.value = t; } tt.textContent = t.toFixed(2); bb.textContent = 'bar ' + Math.floor(t / BAR); requestAnimationFrame(loop); };
    ready.then(() => { drawFrame(0); loop(); });
  }
})();
