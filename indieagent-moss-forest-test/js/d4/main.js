// d4 frame assembly: four cut shots over baked plates, the 3D giant from the kit renderer, flat life on top, grain.
const cv = document.getElementById('c'); cv.width = W; cv.height = H; const X = cv.getContext('2d'); X.imageSmoothingQuality = 'high';
const PROBE = (typeof ML !== 'undefined' && ML.probe) || { on: false, text() {}, box() {}, event() {}, edge() {}, value() {} };
buildGiant(); buildMoss(); uploadGeo();
const PL = { back: bakeBack(), front: bakeFront() };
PL.soft = (() => { const c = canvas(PLW, PLH), g = c.getContext('2d'); g.filter = 'blur(11px)'; g.drawImage(PL.back, 0, 0); return c; })(); // defocus, for close-ups only
const TILES = makeGrainTiles();
const SUNV = [.6, .62, -.5], CUTS = [86, 154, 216];
const lightD4 = (t) => lerp(.6, 1, smooth(t / 12));
function shotOf(f) { return f < CUTS[0] ? 0 : f < CUTS[1] ? 1 : f < CUTS[2] ? 2 : 3; }
function camFor(shot, t) {
  const k = (a, b) => ease.sine(inv(a, b, t));
  if (shot === 0) return { eye: [lerp(-9.0, -8.6, k(0, 3.6)), 3.1, lerp(14.8, 14.3, k(0, 3.6))], at: [.1, 3.2, 0], fov: .5 };
  if (shot === 1) return { eye: [lerp(-5.6, -5.0, k(3.6, 6.4)), 3.5, lerp(6.4, 5.9, k(3.6, 6.4))], at: [-.72, 2.92, .3], fov: .42 };
  if (shot === 2) return { eye: [lerp(-1.9, -1.5, k(6.4, 9)), 2.5, lerp(8.4, 7.5, k(6.4, 9))], at: [.05, 1.86, .5], fov: .42 };
  return { eye: [lerp(-8.8, -9.5, k(9, 15)), 3.1, lerp(14.4, 15.4, k(9, 15))], at: [.15, 3.25, 0], fov: .5 };
}
function shakeD4(t) { let a = 3.2 * smooth(inv(9.05, 9.25, t)) * (1 - smooth(inv(9.7, 10.4, t))) + .8 * smooth(inv(9.7, 10.2, t)) * (1 - smooth(inv(11.6, 12.1, t))); for (const tp of [TG.fl1, TG.rr1]) if (t >= tp) a += 4 * Math.exp(-(t - tp) * 7); return [a * (vn2(t * 15, .5, 201) - .5) * 1.8, a * (vn2(t * 17, .5, 203) - .5) * 2.4]; }
const S1 = canvas(320, 180);
function shafts(t, L) { const sx = 760, sy = 250, q = S1.getContext('2d'); q.clearRect(0, 0, 320, 180); const on = smooth(inv(TL.ray0, 8, t)); [[1.05, .05, 1], [1.33, .03, .7], [1.62, .05, .9], [1.98, .035, .8], [2.3, .03, .55]].forEach(([b, w, a], i) => { const k = a * on * (.75 + .25 * Math.sin(t * .35 + i * 1.7)), rg = q.createRadialGradient(sx / 4, sy / 4, 0, sx / 4, sy / 4, 190); rg.addColorStop(0, `rgba(255,240,196,${.8 * k})`); rg.addColorStop(1, 'rgba(255,232,180,0)'); q.fillStyle = rg; q.beginPath(); q.moveTo(sx / 4, sy / 4); q.lineTo(sx / 4 + Math.cos(b - w) * 300, sy / 4 + Math.sin(b - w) * 300); q.lineTo(sx / 4 + Math.cos(b + w) * 300, sy / 4 + Math.sin(b + w) * 300); q.closePath(); q.fill(); }); X.save(); X.globalCompositeOperation = 'screen'; X.globalAlpha = .34 * L; X.drawImage(S1, 0, 0, W, H); X.restore(); }
function drawFrame(t) {
  const f = Math.round(t * FPS), shot = shotOf(f), L = lightD4(t), td = drawT(t), [sx, sy] = shakeD4(td);
  X.setTransform(1, 0, 0, 1, sx, sy); X.globalCompositeOperation = 'source-over'; X.globalAlpha = 1;
  const wide = shot === 0 || shot === 3, dx = -2.2 * t;
  X.drawImage(wide ? PL.back : PL.soft, -PX + dx * .5 + (shot === 1 ? -130 : shot === 2 ? 60 : 0), -PY);
  if (!wide) { X.fillStyle = 'rgba(10,50,44,.16)'; X.fillRect(-20, -20, W + 40, H + 40); }
  const p = poseG(t), parts = partMatrices(p, td), cam = camera(camFor(shot, t));
  const r = renderModel(parts, cam, { L: SUNV, glow: glowK(t), ray: rayK(t) * (1 - .7 * smooth(inv(8, 11, t))), rayP: M.apply(parts[P_LID], [-1.05, .4, .55]), seed: 3 });
  const gk = glowK(t);
  X.drawImage(r.c, 0, 0, W, H);
  // the glow: light spilling off the panel
  if (gk > .01) { const [gx, gy, q] = project(cam, M.apply(parts[P_BODY], [0, 1.9, .6])), rad = q * 1.9, rg = X.createRadialGradient(gx, gy, 0, gx, gy, rad); rg.addColorStop(0, `rgba(255,170,70,${.34 * gk})`); rg.addColorStop(1, 'rgba(255,170,70,0)'); X.save(); X.globalCompositeOperation = 'screen'; X.fillStyle = rg; X.fillRect(gx - rad, gy - rad, rad * 2, rad * 2); X.restore(); }
  if (wide) { soil(cam, t); for (const [i, tp] of [[0, TG.fl1], [3, TG.rr1]]) dustCloud(X, cam, p.feet[i].x, p.feet[i].z, inv(tp, tp + 1.2, td), 40 + i, .95);
    if (td > 9.7) [[-1.3, 1], [1.3, 1], [-1.3, -.85], [1.3, -.85], [0, 1.2]].forEach(([x, z], i) => dustCloud(X, cam, x, z, inv(9.7 + i * .12, 11.6 + i * .12, td), 60 + i, .72)); }
  bird(cam, parts, t);
  X.setTransform(1, 0, 0, 1, sx, sy);
  if (shot === 1) { const k = rayK(t); if (k > .01) { X.save(); X.globalCompositeOperation = 'screen'; X.globalAlpha = .28 * k; X.fillStyle = '#ffe9b4'; X.beginPath(); X.moveTo(980 - 90 * (1 - k), -30); X.lineTo(1190 - 90 * (1 - k), -30); X.lineTo(610, 760); X.lineTo(250, 760); X.closePath(); X.fill(); X.restore(); } }
  if (wide) { shafts(t, L); flock(t); X.drawImage(PL.front, -PX + dx * .9, -PY); }
  leaves(t);
  X.setTransform(1, 0, 0, 1, 0, 0);
  // the light arc: a cool dim morning that warms as the sun clears; then the grain
  X.save(); X.globalCompositeOperation = 'multiply'; X.fillStyle = `rgba(176,198,214,${(1 - L) * 1.5})`; X.fillRect(0, 0, W, H); X.restore();
  drawGrain(X, TILES, f);
  if (PROBE.on || typeof ML !== 'undefined') {
    if (wide) { const pts = [[-2, 0, -1], [2, 0, 1.6], [-2, 5.2, 0], [2, 5.2, 0]].map((w) => project(cam, [w[0] + p.bx, w[1] * (w[1] > 0 ? (p.by + 3.2) / 5.2 : 0), w[2] + p.bz])), xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]), x0 = Math.min(...xs), y0 = Math.min(...ys); PROBE.box(X, 'giant', x0, y0, Math.max(...xs) - x0, Math.max(...ys) - y0, { keep: true }); }
    const q = poseG(prevT(t)); let slide = 0; p.feet.forEach((a, i) => { const b = q.feet[i]; if (a.down && b.down) slide = Math.max(slide, Math.abs(a.x - b.x), Math.abs(a.z - b.z), Math.abs(a.y - b.y)); });
    PROBE.value('footSlide', slide); PROBE.value('feetOnFloor', Math.max(...p.feet.filter((a) => a.down).map((a) => Math.abs(a.y)), 0));
    PROBE.edge('plantL', p.feet[0].down && t >= TG.fl1, q.feet[0].down && prevT(t) >= TG.fl1); PROBE.edge('plantR', p.feet[3].down && t >= TG.rr1, q.feet[3].down && prevT(t) >= TG.rr1); PROBE.edge('lidOpen', p.fb >= 1, q.fb >= 1);
    for (const c of CUTS) PROBE.edge('cut' + c, f >= c, f - 1 >= c);
  }
}
window.drawFrame = drawFrame;
window.__frameJPEG = (t, q = .92) => { drawFrame(clamp(t, 0, DUR - 1e-6)); return q >= 1 ? cv.toDataURL('image/png') : cv.toDataURL('image/jpeg', q); };
window.__ready = Promise.resolve(true);
const params = new URLSearchParams(location.search);
if (!params.has('offline')) { const t0 = parseFloat(params.get('t') || 0), start = performance.now(); (function loop() { drawFrame((t0 + (performance.now() - start) / 1000) % DUR); requestAnimationFrame(loop); })(); }
