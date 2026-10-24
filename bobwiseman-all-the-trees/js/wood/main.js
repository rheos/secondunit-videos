// Page driver: a scene registers drawScene(t); this paints a frame and adds the panel finish.
const cv = document.getElementById('c'); cv.width = W; cv.height = H; g = cv.getContext('2d');
initVeneers();
const SHEEN = (() => { const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
  const gr = x.createLinearGradient(0, 0, W, H); gr.addColorStop(0, 'rgba(255,250,235,.10)'); gr.addColorStop(.42, 'rgba(255,250,235,.0)');
  gr.addColorStop(.55, 'rgba(255,250,235,.07)'); gr.addColorStop(.62, 'rgba(255,250,235,0)'); gr.addColorStop(1, 'rgba(40,20,5,.10)');
  x.fillStyle = gr; x.fillRect(0, 0, W, H); return c; })();
function frame(tt) {
  const t = twos(tt);
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.fillStyle = '#2a1a0e'; g.fillRect(0, 0, W, H);
  drawScene(t, tt);
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.drawImage(SHEEN, 0, 0);
  const v = g.createRadialGradient(W / 2, H / 2, H * .5, W / 2, H / 2, H * 1.05); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(30,14,4,.38)');
  g.fillStyle = v; g.fillRect(0, 0, W, H);
  if (typeof FADE === 'function') { const f = FADE(tt); if (f > 0) { g.globalAlpha = f; g.fillStyle = '#000'; g.fillRect(0, 0, W, H); g.globalAlpha = 1; } }
}
window.__frameJPEG = (t, q = .93) => { frame(t); return cv.toDataURL('image/jpeg', q); };
window.__ready = Promise.resolve(true);
const params = new URLSearchParams(location.search);
if (!params.has('offline')) {
  const audio = document.getElementById('a'); const T0 = parseFloat(params.get('a') || 0), T1 = parseFloat(params.get('b') || 160);
  audio.currentTime = T0;
  (function loop() { let t = audio.currentTime || T0; if (t >= T1) { audio.currentTime = T0; t = T0; } frame(t); requestAnimationFrame(loop); })();
  cv.onclick = () => audio.paused ? audio.play() : audio.pause();
}
