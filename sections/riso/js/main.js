// Live player + offline hooks (check.mjs / render.mjs call window.__frameJPEG).
const canvas = document.getElementById('c');
const Look = typeof Paint !== 'undefined' ? (canvas.width = RW, canvas.height = RH, Paint.init(canvas), { present: (t, o) => Paint.present(t, o) }) : GL.init(canvas, LOOK.frag, LOOK.uniforms);
const params = new URLSearchParams(location.search);
// v3: placeholder windows (window.SEAMS = [{a, b}]) are a straight crossfade between the two anchor frames,
// to be replaced later by a generative morph between those exact anchors
const comp = document.createElement('canvas'); comp.width = canvas.width; comp.height = canvas.height; const cx2 = comp.getContext('2d');
function frameCanvas(t) {
  const w = (window.SEAMS || []).find((z) => t > z.a + 1e-6 && t < z.b - 1e-6);
  if (!w) { renderFrame(t); return canvas; }
  renderFrame(w.a); cx2.globalAlpha = 1; cx2.drawImage(canvas, 0, 0);
  renderFrame(w.b); cx2.globalAlpha = clamp((t - w.a) / (w.b - w.a)); cx2.drawImage(canvas, 0, 0); cx2.globalAlpha = 1;
  return comp;
}
window.__frameJPEG = (t, q = .92) => frameCanvas(t).toDataURL('image/jpeg', q);
window.__framePNG = (t) => frameCanvas(t).toDataURL('image/png');
window.__ready = Promise.resolve(true);
if (!params.has('offline')) {
  const audio = document.getElementById('a'), A = LOOK.span[0], B = LOOK.span[1];
  audio.currentTime = params.has('t') ? parseFloat(params.get('t')) : A;
  (function loop() { let t = audio.currentTime; if (t >= B) { audio.currentTime = t = A; } renderFrame(Math.min(t, DUR - .01)); requestAnimationFrame(loop); })();
  const toggle = () => audio.paused ? audio.play() : audio.pause();
  canvas.onclick = toggle;
  window.addEventListener('keydown', (e) => { if (e.code === 'Space') { e.preventDefault(); toggle(); } if (e.code === 'ArrowLeft') audio.currentTime = A; });
}
