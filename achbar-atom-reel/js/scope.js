// Oscilloscope, after Airplane on the Highway (bobwiseman-airplane-scope): a 1960s lab tube with an etched
// graticule, a green P31 beam that blooms and leaves a dimming afterglow, amber readouts. Drawn in 2D with
// 'lighter' compositing so crossing strokes add like light. Pure functions of the time they are given.
'use strict';
const PH = { g: [93, 255, 116], a: [255, 174, 58], glass: '#030806', bez: '#1a1c1b' };
const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${cl(a)})`;
// the tube: bezel, dark glass, graticule. k = power-on (0 dot, .5 line, 1 full)
function tube(cx, cy, w, h, k = 1, o = {}) {
  const kw = cl(k / .5), kh = cl((k - .5) / .5), ww = Math.max(4, w * eo(kw)), hh = Math.max(4, h * eo(kh));
  const r = 46;
  X.save();
  if (o.bezel !== false) { X.fillStyle = PH.bez; X.beginPath(); X.roundRect(cx - w / 2 - 40, cy - h / 2 - 40, w + 80, h + 80, r + 30); X.fill(); X.strokeStyle = 'rgba(255,255,255,.08)'; X.lineWidth = 2; X.stroke(); }
  X.fillStyle = PH.glass; X.beginPath(); X.roundRect(cx - w / 2, cy - h / 2, w, h, r); X.fill();
  X.beginPath(); X.roundRect(cx - ww / 2, cy - hh / 2, ww, hh, Math.min(r, hh / 2)); X.clip();
  X.fillStyle = 'rgba(40,120,60,.10)'; X.fillRect(cx - w / 2, cy - h / 2, w, h);
  // graticule: 10 x 8 divisions, minor ticks on the axes
  const dx = w / 10, dy = h / 8; X.beginPath();
  for (let i = 1; i < 10; i++) { X.moveTo(cx - w / 2 + i * dx, cy - h / 2); X.lineTo(cx - w / 2 + i * dx, cy + h / 2); }
  for (let j = 1; j < 8; j++) { X.moveTo(cx - w / 2, cy - h / 2 + j * dy); X.lineTo(cx + w / 2, cy - h / 2 + j * dy); }
  X.strokeStyle = 'rgba(150,200,170,.13)'; X.lineWidth = 1.2; X.stroke(); X.beginPath();
  for (let i = 0; i <= 50; i++) { const x = cx - w / 2 + i * dx / 5; X.moveTo(x, cy - 6); X.lineTo(x, cy + 6); }
  for (let j = 0; j <= 40; j++) { const y = cy - h / 2 + j * dy / 5; X.moveTo(cx - 6, y); X.lineTo(cx + 6, y); }
  X.strokeStyle = 'rgba(150,200,170,.2)'; X.stroke();
  X.restore();
}
// glass vignette and faint scan flicker, drawn last inside the tube
function tubeGlass(cx, cy, w, h, t) {
  X.save(); X.beginPath(); X.roundRect(cx - w / 2, cy - h / 2, w, h, 46); X.clip();
  const g = X.createRadialGradient(cx, cy, Math.min(w, h) * .3, cx, cy, Math.max(w, h) * .62);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.55)'); X.fillStyle = g; X.fillRect(cx - w / 2, cy - h / 2, w, h);
  X.globalAlpha = .04 + .02 * Math.sin(t * 50); X.fillStyle = '#000'; for (let y = cy - h / 2; y < cy + h / 2; y += 4) X.fillRect(cx - w / 2, y, w, 1.5);
  X.restore();
}
// one beam stroke: wide faint bloom, body, white-hot core. a = intensity
function beam(pts, a = 1, c = PH.g, w = 2.6) {
  if (pts.length < 2 || a < .01) return;
  X.save(); X.globalCompositeOperation = 'lighter'; X.lineCap = 'round'; X.lineJoin = 'round';
  const go = (lw, col) => { X.beginPath(); pts.forEach((p, i) => (i ? X.lineTo(p[0], p[1]) : X.moveTo(p[0], p[1]))); X.lineWidth = lw; X.strokeStyle = col; X.stroke(); };
  go(w * 7, rgba(c, a * .07)); go(w * 3, rgba(c, a * .22)); go(w, rgba(c, a * .9)); go(w * .4, `rgba(235,255,235,${cl(a * .7)})`);
  X.restore();
}
function beamDot(x, y, r = 5, a = 1, c = PH.g) {
  X.save(); X.globalCompositeOperation = 'lighter';
  const g = X.createRadialGradient(x, y, 0, x, y, r * 6); g.addColorStop(0, rgba([235, 255, 235], a)); g.addColorStop(.18, rgba(c, a * .8)); g.addColorStop(1, rgba(c, 0));
  X.fillStyle = g; X.beginPath(); X.arc(x, y, r * 6, 0, TAU); X.fill(); X.restore();
}
// phosphor text (amber by default): glow pass then body
function ptxt(str, x, y, o = {}) {
  const c = o.c || PH.a, a = o.alpha ?? 1;
  X.save(); X.globalCompositeOperation = 'lighter';
  X.shadowColor = rgba(c, .9 * a); X.shadowBlur = o.blur ?? 14;
  txt(str, x, y, { fam: FT.m, weight: 700, ...o, color: rgba(c, .95 * a), alpha: 1 });
  X.restore();
}
