// Frame assembly, live player, offline hooks. Frame n is time n/24 exactly.
const canvas = document.getElementById('c'); canvas.width = W; canvas.height = H;
Paint.init(canvas);
const params = new URLSearchParams(location.search);
window.__frameJPEG = (fr, q = .94) => { renderFrame(fr / FPS, fr); return canvas.toDataURL('image/jpeg', q); };
window.__frameAt = (t, q = .92) => { const fr = Math.round(t * FPS); renderFrame(t, fr); return canvas.toDataURL('image/jpeg', q); };
window.__ready = Promise.resolve(true);
if (!params.has('offline')) {
  const audio = document.getElementById('a');
  window.__ready.then(() => (function loop() { const t = audio.currentTime || 0; renderFrame(Math.min(t, END - .04), Math.floor(t * FPS)); requestAnimationFrame(loop); })());
  canvas.onclick = () => (audio.paused ? audio.play() : audio.pause());
  window.addEventListener('keydown', (e) => { if (e.code === 'Space') { e.preventDefault(); audio.paused ? audio.play() : audio.pause(); } if (e.code === 'ArrowLeft') audio.currentTime = Math.max(0, audio.currentTime - 3); });
}
