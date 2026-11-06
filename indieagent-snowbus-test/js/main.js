// Snow bus frame assembly: three shots over the dusk plates, the bus from the kit renderer, snow and light on top.
const cv = document.getElementById('c'); cv.width = W; cv.height = H; const X = cv.getContext('2d'); X.imageSmoothingQuality = 'high';
const PROBE = (typeof ML !== 'undefined' && ML.probe) || { on: false, text() {}, box() {}, event() {}, edge() {}, value() {} };
buildBus(); buildSnow(); uploadGeo();
const PL = { back: bakeBack(), front: bakeFront() };
PL.soft = (() => { const c = canvas(PLW, PLH), g = c.getContext('2d'); g.filter = 'blur(9px)'; g.drawImage(PL.back, 0, 0); return c; })();
const TILES = makeGrainTiles();
const SUNV = [-.72, .22, .55], CUTS = [60, 120];
function shotOf(f) { return f < CUTS[0] ? 0 : f < CUTS[1] ? 1 : 2; }
function camFor(shot, t) {
  const k = (a, b) => ease.sine(inv(a, b, t));
  if (shot === 0) return { eye: [lerp(-5.2, -4.8, k(0, 2.5)), 2.1, lerp(12.6, 12.1, k(0, 2.5))], at: [-.3, 1.75, 0], fov: .5 };
  if (shot === 1) return { eye: [lerp(9.0, 8.7, k(2.5, 5)), 1.9, lerp(6.6, 6.2, k(2.5, 5))], at: [3.9, 1.65, -.3], fov: .5 };
  const px = lerp(0, BL, ease.inOut(inv(TB.roll0, TB.roll1, t)));
  return { eye: [-4.9 + px * .92, 2.2, lerp(12.2, 12.9, k(7.1, 10))], at: [-.3 + px * .92, 1.75, 0], fov: .5 };
}
function shakeB(t) { const a = 2.6 * smooth(inv(TB.shud0, TB.shud0 + .25, t)) * (1 - smooth(inv(TB.shud1 - .4, TB.shud1, t))) + 1.4 * Math.exp(-Math.max(0, t - TB.roll0) * 5) * (t >= TB.roll0 ? 1 : 0); return [a * (vn2(t * 15, .5, 201) - .5) * 1.8, a * (vn2(t * 17, .5, 203) - .5) * 2.4]; }
function drawFrame(t) {
  const f = Math.round(t * FPS), shot = shotOf(f), td = drawT(t), [sx, sy] = shakeB(td), wide = shot !== 1, dx = -1.8 * t;
  X.setTransform(1, 0, 0, 1, sx, sy); X.globalCompositeOperation = 'source-over'; X.globalAlpha = 1;
  X.drawImage(wide ? PL.back : PL.soft, -PX + dx * .5 + (shot === 1 ? -220 : 0), -PY);
  if (!wide) { X.fillStyle = 'rgba(20,24,60,.2)'; X.fillRect(-20, -20, W + 40, H + 40); }
  if (wide) lamp(t);
  snowfall(t, false);
  const p = poseB(t), parts = partMatrices(p, td), cam = camera(camFor(shot, t));
  const r = renderModel(parts, cam, { L: SUNV, glow: p.glow, seed: 5, shadowAt: [p.x, 1.6, 0], shadowR: 8, fill: [0, .9, .44] });
  X.drawImage(r.c, 0, 0, W, H);
  beams(cam, parts, p.glow);
  if (wide) { powder(cam, p, td); exhaust(cam, p, t); X.drawImage(PL.front, -PX + dx * .9, -PY); }
  snowfall(t, true);
  X.setTransform(1, 0, 0, 1, 0, 0);
  X.save(); X.globalCompositeOperation = 'multiply'; X.fillStyle = 'rgba(190,196,230,.35)'; X.fillRect(0, 0, W, H); X.restore();
  drawGrain(X, TILES, f);
  if (PROBE.on || typeof ML !== 'undefined') {
    if (wide) { const pts = [[-BL / 2 - .3, 0, -1.3], [BL / 2 + .3, 0, 1.3], [-BL / 2, 3.6, 0], [BL / 2, 3.6, 0]].map((w) => project(cam, [w[0] + p.x, w[1], w[2]])), xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]), x0 = Math.min(...xs), y0 = Math.min(...ys); PROBE.box(X, 'bus', x0, y0, Math.max(...xs) - x0, Math.max(...ys) - y0, { keep: true }); }
    const q = poseB(prevT(t));
    PROBE.value('busY', Math.abs(p.by)); PROBE.value('wheelRoll', p.spin - q.spin);
    PROBE.edge('lightsOn', p.glow >= .95, q.glow >= .95); PROBE.edge('rollStart', p.x > .01 && td >= TB.roll0, q.x > .01 && drawT(prevT(t)) >= TB.roll0);
    for (const c of CUTS) PROBE.edge('cut' + c, f >= c, f - 1 >= c);
  }
}
window.drawFrame = drawFrame;
window.__frameJPEG = (t, q = .92) => { drawFrame(clamp(t, 0, DUR - 1e-6)); return q >= 1 ? cv.toDataURL('image/png') : cv.toDataURL('image/jpeg', q); };
window.__ready = Promise.resolve(true);
const params = new URLSearchParams(location.search);
if (!params.has('offline')) { const t0 = parseFloat(params.get('t') || 0), start = performance.now(); (function loop() { drawFrame((t0 + (performance.now() - start) / 1000) % DUR); requestAnimationFrame(loop); })(); }
