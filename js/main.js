// Live player + offline hooks (check.mjs / render.mjs call window.__frameJPEG after awaiting window.__ready).
// Canvas text only uses a webfont once it has loaded, so __ready waits for every face the shots draw with.
const canvas = document.getElementById('c');
const Look = GL.init(canvas, LOOK.frag, LOOK.uniforms);
const params = new URLSearchParams(location.search);
const FACES = ['900 100px Archivo', '700 100px Archivo', '400 100px Archivo', '400 100px "JetBrains Mono"', '700 100px "JetBrains Mono"',
  'italic 400 100px "Instrument Serif"', '400 100px "Instrument Serif"'];
window.__frameJPEG = (t, q = .92) => { renderFrame(t); return canvas.toDataURL('image/jpeg', q); };
window.__ready = Promise.all(FACES.map((f) => document.fonts.load(f))).then(() => document.fonts.ready).then(() => {
  const missing = FACES.filter((f) => !document.fonts.check(f));
  if (missing.length) console.error('fonts missing: ' + missing.join(', '));
  return true;
});
if (!params.has('offline')) window.__ready.then(() => {
  const audio = document.getElementById('a'), A = LOOK.span[0], B = LOOK.span[1];
  audio.currentTime = params.has('t') ? parseFloat(params.get('t')) : A;
  (function loop() { let t = audio.currentTime; if (t >= B) { audio.currentTime = t = A; } renderFrame(Math.min(t, DUR - .01)); requestAnimationFrame(loop); })();
  const toggle = () => audio.paused ? audio.play() : audio.pause();
  canvas.onclick = toggle;
  window.addEventListener('keydown', (e) => { if (e.code === 'Space') { e.preventDefault(); toggle(); } if (e.code === 'ArrowLeft') audio.currentTime = A; });
});
