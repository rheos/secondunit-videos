// Live player + offline hooks (check.mjs / render.mjs call window.__frameJPEG).
const canvas = document.getElementById('c');
const Look = typeof Paint !== 'undefined' ? (canvas.width = RW, canvas.height = RH, Paint.init(canvas), { present: (t, o) => Paint.present(t, o) }) : GL.init(canvas, LOOK.frag, LOOK.uniforms);
const params = new URLSearchParams(location.search);
window.__frameJPEG = (t, q = .92) => { renderFrame(t); return canvas.toDataURL('image/jpeg', q); };
window.__ready = Promise.all(['900 100px "Superclarendon"'].map((f) => document.fonts.load(f))).then(() => true);
if (!params.has('offline')) {
  const audio = document.getElementById('a'), A = LOOK.span[0], B = LOOK.span[1];
  audio.currentTime = params.has('t') ? parseFloat(params.get('t')) : A;
  (function loop() { let t = audio.currentTime; if (t >= B) { audio.currentTime = t = A; } renderFrame(Math.min(t, DUR - .01)); requestAnimationFrame(loop); })();
  const toggle = () => audio.paused ? audio.play() : audio.pause();
  canvas.onclick = toggle;
  window.addEventListener('keydown', (e) => { if (e.code === 'Space') { e.preventDefault(); toggle(); } if (e.code === 'ArrowLeft') audio.currentTime = A; });
}
