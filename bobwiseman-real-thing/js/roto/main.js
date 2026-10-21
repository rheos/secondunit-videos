// Live player + offline hooks (render.mjs calls window.__frameJPEG). ?t=<s> starts the player there; click or space plays.
const canvas = document.getElementById('c');
const Look = GL.init(canvas, LOOK.frag, LOOK.uniforms);
const params = new URLSearchParams(location.search);
window.__frameJPEG = (t, q = .92) => { drawFrame(t); return canvas.toDataURL('image/jpeg', q); };
window.__ready = Promise.resolve(true);
if (!params.has('offline')) {
  const audio = document.getElementById('a');
  audio.currentTime = params.has('t') ? parseFloat(params.get('t')) : 0;
  (function loop() { drawFrame(Math.min(audio.currentTime, DUR - .01)); requestAnimationFrame(loop); })();
  const toggle = () => audio.paused ? audio.play() : audio.pause();
  canvas.onclick = toggle;
  window.addEventListener('keydown', (e) => { if (e.code === 'Space') { e.preventDefault(); toggle(); } });
}
