// Page harness: sizes the canvas, exposes the offline hooks for render.mjs/check.mjs, and a live player.
// ?w=1280&h=720 draws straight at 720p (drafts); default 1920x1080. ?a=&b= loop span, ?t= start.
const params = new URLSearchParams(location.search);
const canvas = document.getElementById('c');
canvas.width = Number(params.get('w') || 1920); canvas.height = Number(params.get('h') || 1080);
const G = canvas.getContext('2d');
function renderFrame(t) {
  G.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
  G.globalAlpha = 1; G.globalCompositeOperation = 'source-over'; G.filter = 'none';
  try { drawFrame(G, t); } catch (e) { console.error(e); }
}
window.__frameJPEG = (t, q = .92) => { renderFrame(t); return canvas.toDataURL('image/jpeg', q); };
window.__ready = (window.LOOK_READY || Promise.resolve()).then(() => true);
if (!params.has('offline')) {
  const audio = document.getElementById('a');
  const T0 = parseFloat(params.get('a') || window.LOOK_SPAN?.[0] || 0), T1 = parseFloat(params.get('b') || window.LOOK_SPAN?.[1] || 225);
  audio.currentTime = params.has('t') ? parseFloat(params.get('t')) : T0;
  window.__ready.then(() => (function loop() { let t = audio.currentTime || T0; if (t >= T1) { audio.currentTime = T0; t = T0; } renderFrame(t); requestAnimationFrame(loop); })());
  const toggle = () => audio.paused ? audio.play() : audio.pause();
  canvas.onclick = toggle; window.addEventListener('keydown', (e) => { if (e.code === 'Space') { e.preventDefault(); toggle(); } });
}
