// Frame assembly + live player + offline hooks. Every frame is a pure function of song time t.
function renderFrame(t) {
  beginFrame();
  const k = SHOTS.findIndex((s) => t >= s.a && t < s.b);
  const sh = SHOTS[k < 0 ? (t < SHOTS[0].a ? 0 : SHOTS.length - 1) : k];
  try { sh.fn(t); } catch (e) { console.error('shot', e && e.stack || e); }
  present();
}
const params = new URLSearchParams(location.search);
window.__frameJPEG = (t, q = .93) => { renderFrame(t); return outC.toDataURL('image/jpeg', q); };
window.__ready = (typeof PRELOAD === 'function' ? PRELOAD() : Promise.resolve()).then(() => true);
if (!params.has('offline')) {
  const audio = document.getElementById('a');
  const T0 = parseFloat(params.get('a') || 62.5), T1 = parseFloat(params.get('b') || 124);
  audio.currentTime = params.has('t') ? parseFloat(params.get('t')) : T0;
  (function loop() { let t = audio.currentTime || T0; if (t >= T1) { audio.currentTime = T0; t = T0; } renderFrame(t); requestAnimationFrame(loop); })();
  const toggle = () => audio.paused ? audio.play() : audio.pause();
  outC.onclick = toggle;
  window.addEventListener('keydown', (e) => { if (e.code === 'Space') { e.preventDefault(); toggle(); } });
}
