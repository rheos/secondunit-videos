// Frame assembly, live player, offline hooks (hybrid exploration).
// Each frame is a pure function of song time t. A look is drawn to the 2D source `s` and finished by the
// shared shader (look.js) on an offscreen WebGL canvas; that result lands on the visible 2D canvas.
// Inside a transition window both looks are rendered at the same camera and crossfaded: the placeholder
// a generated morph will replace.
const out = document.getElementById('c');
out.width = Math.round(W * RS); out.height = Math.round(H * RS);
const octx = out.getContext('2d');
const glc = document.createElement('canvas');
const Look = GL.init(glc, LOOK.frag, LOOK.uniforms);
const gcv = document.createElement('canvas'); gcv.width = W; gcv.height = H;
Gouache.init(gcv);

function renderLook(name, t) {
  s.setTransform(RS, 0, 0, RS, 0, 0); s.globalAlpha = 1; s.globalCompositeOperation = 'source-over'; s.filter = 'none';
  s.shadowColor = 'rgba(0,0,0,0)'; s.shadowBlur = 0; s.shadowOffsetX = 0; s.shadowOffsetY = 0;
  FX = {};
  s.save(); try { LOOKS[name](t); } catch (e) { console.error(name, e); } s.restore();
  Look.present(t, FX);
}
function renderFrame(t) {
  const st = frameState(t);
  renderLook(st.a, t);
  octx.globalAlpha = 1; octx.drawImage(glc, 0, 0);
  if (st.b && st.k > 0) { renderLook(st.b, t); octx.globalAlpha = st.k; octx.drawImage(glc, 0, 0); octx.globalAlpha = 1; }
}

const params = new URLSearchParams(location.search);
window.__frameJPEG = (t, q = .92) => { renderFrame(t); return out.toDataURL('image/jpeg', q); };
window.__framePNG = (t) => { renderFrame(t); return out.toDataURL('image/png'); };
window.__ready = Promise.resolve(true);
if (!params.has('offline')) {
  const audio = document.getElementById('a'), A = LOOK.span[0], B = LOOK.span[1];
  audio.currentTime = params.has('t') ? parseFloat(params.get('t')) : A;
  (function loop() { let t = audio.currentTime; if (t >= B || t < A - .5) { audio.currentTime = t = A; } renderFrame(Math.min(t, DUR - .01)); requestAnimationFrame(loop); })();
  const toggle = () => audio.paused ? audio.play() : audio.pause();
  out.onclick = toggle;
  window.addEventListener('keydown', (e) => { if (e.code === 'Space') { e.preventDefault(); toggle(); } if (e.code === 'ArrowLeft') audio.currentTime = A; });
}
