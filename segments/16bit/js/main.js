// Live player + offline hook (render.mjs calls window.__frame). Opened without ?offline=1 it loops the
// 15 seconds; click or space pauses, left arrow restarts, ?t= starts at a time.
const canvas = document.getElementById('c');
const Look = GL.init(canvas, LOOK.frag, LOOK.uniforms);
const params = new URLSearchParams(location.search);
// q >= 1 returns a lossless PNG: pixel art rings badly under JPEG
window.__frame = (t, q = 1) => { renderFrame(t); return q >= 1 ? canvas.toDataURL('image/png') : canvas.toDataURL('image/jpeg', q); };
window.__seg = { dur: DUR, fps: FPS, size: [canvas.width, canvas.height], shots: SHOTS.map((x) => ({ name: x.name, t0: x.a, t1: x.b })) };
window.__ready = Promise.resolve(true);
if (!params.has('offline')) {
  let t0 = performance.now() / 1000 - (params.has('t') ? parseFloat(params.get('t')) : 0), paused = false, held = 0;
  (function loop() { const t = paused ? held : ((performance.now() / 1000 - t0) % DUR); renderFrame(t); requestAnimationFrame(loop); })();
  const toggle = () => { if (paused) { t0 = performance.now() / 1000 - held; paused = false; } else { held = (performance.now() / 1000 - t0) % DUR; paused = true; } };
  canvas.onclick = toggle;
  window.addEventListener('keydown', (e) => { if (e.code === 'Space') { e.preventDefault(); toggle(); } if (e.code === 'ArrowLeft') { t0 = performance.now() / 1000; held = 0; } });
}
