// Frame assembly + live player + offline hooks. Every frame is a pure function of song time t.
function renderFrame(t) {
  bindCtx();
  for (const g of [s, f, mk]) { g.setTransform(.5, 0, 0, .5, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none'; }
  ik.setTransform(1, 0, 0, 1, 0, 0); ik.globalAlpha = 1; ik.globalCompositeOperation = 'source-over'; ik.clearRect(0, 0, W, H);
  fill(s, '#f3e7c9'); fill(f, '#000'); fill(mk, '#000');
  let paint = {}; PAINT_FRAME = {};
  for (let k = 0; k < SHOTS.length; k++) {
    const sh = SHOTS[k], nx = SHOTS[k + 1];
    const end = sh.b + (nx && nx.o.xin && Math.abs(nx.a - sh.b) < .01 ? nx.o.xin : 0);
    if (t < sh.a || t >= end) continue;
    const a = sh.o.xin ? smooth((t - sh.a) / sh.o.xin) : 1;
    for (const g of [s, f, ik, mk]) { g.save(); g.globalAlpha = a; }
    try { sh.fn(t, clamp((t - sh.a) / (sh.b - sh.a)), t - sh.a); } catch (e) { console.error(sh.name, e); }
    for (const g of [s, f, ik, mk]) g.restore();
    const pc = typeof sh.o.paint === 'function' ? sh.o.paint(t) : (sh.o.paint || {});
    paint = a >= 1 ? pc : { ...paint, ...Object.fromEntries(Object.entries(pc).map(([key, v]) => [key, typeof v === 'number' ? lerp(paint[key] ?? v, v, a) : v])) };
  }
  Paint.present(t, { ...paint, ...PAINT_FRAME });
}

const canvas = document.getElementById('c'); canvas.width = W; canvas.height = H;
Paint.init(canvas);
const params = new URLSearchParams(location.search);
window.__frameJPEG = (t, q = .93) => { renderFrame(t); return canvas.toDataURL('image/jpeg', q); };
window.__ready = Promise.resolve(true);

if (!params.has('offline')) {
  const audio = document.getElementById('a');
  // ?a=170&b=190 picks the section to loop (default: verse 3); ?t= starts mid-section
  const T0 = parseFloat(params.get('a') || 170), T1 = parseFloat(params.get('b') || 190);
  audio.currentTime = params.has('t') ? parseFloat(params.get('t')) : T0;
  (function loop() { let t = audio.currentTime || T0; if (t >= T1) { audio.currentTime = T0; t = T0; } renderFrame(t); requestAnimationFrame(loop); })();
  const toggle = () => audio.paused ? audio.play() : audio.pause();
  canvas.onclick = toggle;
  window.addEventListener('keydown', (e) => { if (e.code === 'Space') { e.preventDefault(); toggle(); } });
}
