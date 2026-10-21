// Look B: the Satisfied Mind recipe (one real printed object per section). This section's object: a 45 rpm soul single.
// The label is the world: she runs on the spinning label, leaps onto the grooves, and the record carries her round.
const RC = [960, 560], RR = 480, LR = 245;
const label = halftone(2 * LR, 2 * LR, 8, C.must, C.cream, g => { softBlob(g, LR, LR, LR * 1.1, .55); });
const sleeveArt = halftone(760, 760, 11, C.vio, C.cream, g => { softBlob(g, 380, 300, 340, .6);
  g.fillStyle = '#000'; g.beginPath(); g.roundRect(250, 80, 260, 260, 22); g.fill(); });
const felt = (() => { const c = document.createElement('canvas'); c.width = 256; c.height = 256; const g = c.getContext('2d');
  g.fillStyle = '#1c1416'; g.fillRect(0, 0, 256, 256); const R = rng(4);
  for (let i = 0; i < 1800; i++) { g.fillStyle = `rgba(${R() < .5 ? '255,240,220' : '0,0,0'},${.03 + R() * .04})`; g.fillRect(R() * 256, R() * 256, 1 + R() * 2, 1); }
  return X.createPattern(c, 'repeat'); })();

// record angle: 45 rpm, spins up on "never", slows to a stop on the last refrain
function angle(t) {
  const base = .75 * 2 * Math.PI;
  let a = base * (t - 34);
  const up = Math.max(0, Math.min(t, 48) - CUE.never); a += .9 * 2 * Math.PI * up * up / 2 / 5;   // extra spin 42.8-48
  if (t > CUE.no2) { const d = t - CUE.no2, T = 8; const k = Math.min(d, T); a -= base * (k * k / (2 * T)); }
  return a;
}
function needleDrop(t) { return eOut(ramp(t, 38.4, 38.95)); }
function skip(t) { let s = 0; for (const tt of [CUE.once, CUE.twice]) if (t > tt) s += Math.exp(-(t - tt) * 7) * Math.sin((t - tt) * 40); return s; }

function record(t, zoom, focus) {
  const th = angle(t), sk = skip(t);
  X.save(); X.translate(W / 2, H / 2); X.scale(zoom, zoom); X.translate(-focus[0] + sk * 6, -focus[1] + sk * 4);
  // platter shadow + vinyl
  X.fillStyle = 'rgba(0,0,0,.6)'; X.beginPath(); X.arc(RC[0] + 16, RC[1] + 20, RR + 6, 0, 7); X.fill();
  X.fillStyle = '#0d0b0c'; X.beginPath(); X.arc(RC[0], RC[1], RR, 0, 7); X.fill();
  for (let r = LR + 24; r < RR - 8; r += 3.2) { X.strokeStyle = `rgba(255,255,255,${.035 + .03 * Math.sin(r * .37)})`; X.lineWidth = 1; X.beginPath(); X.arc(RC[0], RC[1], r, 0, 7); X.stroke(); }
  for (const r of [LR + 24, RR - 60]) { X.strokeStyle = 'rgba(0,0,0,.9)'; X.lineWidth = 6; X.beginPath(); X.arc(RC[0], RC[1], r, 0, 7); X.stroke(); }
  // scratches from the skips (they turn with the record)
  X.save(); X.translate(RC[0], RC[1]); X.rotate(th);
  for (const [tt, a0] of [[CUE.once, .4], [CUE.twice, 2.3]]) if (t > tt) { X.strokeStyle = 'rgba(245,240,230,.75)'; X.lineWidth = 2.5;
    X.beginPath(); X.arc(0, 0, 400 - (a0 > 1 ? 30 : 0), a0, a0 + .9 * eOut(ramp(t, tt, tt + .12))); X.stroke(); }
  // label (spins); her figure lives on it
  X.save(); X.beginPath(); X.arc(0, 0, LR, 0, 7); X.clip(); X.drawImage(label, -LR, -LR);
  X.strokeStyle = C.ink; X.lineWidth = 3; X.beginPath(); X.arc(0, 0, 62, 0, 7); X.stroke();
  X.globalAlpha = 1 - ramp(t, CUE.no2 - .5, CUE.no2); X.fillStyle = C.ink; X.font = '700 26px "Futura", "Helvetica Neue", sans-serif'; X.textAlign = 'center'; X.fillText('45 RPM', 0, -LR + 58);
  X.font = '600 20px "Futura", sans-serif'; X.fillText('SIDE A', 0, LR - 40); X.globalAlpha = 1;
  X.restore();
  X.fillStyle = '#d8d0c0'; X.beginPath(); X.arc(0, 0, 9, 0, 7); X.fill();
  // carried round once she is on the grooves: drawn in record space
  if (t > 38.6) { const sAng = -Math.PI / 2 - angle(38.6), r = 330;
    X.save(); X.rotate(sAng); X.translate(r, 0); X.rotate(Math.PI / 2);
    if (t < CUE.no2 + 3) woman(X, 0, 0, 135, 0, 1, 0, C.cream); else womanBack(X, 0, 0, 135, C.cream);
    X.restore(); }
  X.restore();
  // her run on the label (screen-fixed at the top while the label turns under her) and the leap out
  if (t < 38.6) { const run = ease(ramp(t, 33.9, 34.4));
    if (t < 37.3) { X.save(); X.translate(RC[0], RC[1] - 62); woman(X, 0, 0, 160, (t - 34) * 2.2, -1, run); X.restore(); }
    else { const k = ease(ramp(t, 37.3, 38.6)); X.save(); X.translate(RC[0], RC[1] - lerp(62, 330, k) - Math.sin(k * Math.PI) * 90);
      woman(X, 0, 0, lerp(160, 135, k), .25, -1, 1 - k, lerp(0,1,k) > .3 ? C.cream : C.ink); X.restore(); }
  }
  // sheen (fixed to the light, not the record)
  const sh = X.createConicGradient(-.6, RC[0], RC[1]); sh.addColorStop(0, 'rgba(255,255,255,0)'); sh.addColorStop(.06, 'rgba(255,255,255,.10)');
  sh.addColorStop(.12, 'rgba(255,255,255,0)'); sh.addColorStop(.5, 'rgba(255,255,255,0)'); sh.addColorStop(.56, 'rgba(255,255,255,.07)'); sh.addColorStop(.62, 'rgba(255,255,255,0)'); sh.addColorStop(1, 'rgba(255,255,255,0)');
  X.save(); X.beginPath(); X.arc(RC[0], RC[1], RR, 0, 7); X.arc(RC[0], RC[1], LR + 4, 0, 7, true); X.fillStyle = sh; X.fill(); X.restore();
  // tonearm
  const nd = needleDrop(t), pv = [RC[0] + 560, RC[1] - 380], arm = lerp(-.25, .02, nd) + sk * .03;
  X.save(); X.translate(pv[0], pv[1]); X.rotate(arm);
  X.fillStyle = '#b8b0a4'; X.beginPath(); X.arc(0, 0, 46, 0, 7); X.fill(); X.fillStyle = '#5a5450'; X.beginPath(); X.arc(0, 0, 22, 0, 7); X.fill();
  X.strokeStyle = '#cfc8bc'; X.lineWidth = 14; X.lineCap = 'round'; X.beginPath(); X.moveTo(0, 0); X.lineTo(-90, 360); X.lineTo(-170, 560); X.stroke();
  X.fillStyle = '#2a2628'; X.save(); X.translate(-170, 560); X.rotate(.4); X.fillRect(-26, -10, 52, 70); X.restore();
  X.restore();
  X.restore();
}
function sleeve(t, words) {
  X.fillStyle = felt; X.fillRect(0, 0, W, H);
  const k = eOut(ramp(t, CUE.calling, CUE.calling + .45)), S = 820, x0 = W / 2 - S / 2 + (1 - k) * 900, y0 = H / 2 - S / 2 + 10, rot = (1 - k) * .2 - .02;
  X.save(); X.translate(x0 + S / 2, y0 + S / 2); X.rotate(rot); X.translate(-S / 2, -S / 2);
  X.fillStyle = 'rgba(0,0,0,.55)'; X.fillRect(18, 22, S, S);
  X.fillStyle = C.cream; X.fillRect(0, 0, S, S); X.drawImage(sleeveArt, 30, 30);
  // the phone: dial ring, swinging cord and receiver
  const sw = Math.sin((t - 46) * 2.6) * .3, ax = 410, ay = 370, L = 300;
  X.strokeStyle = C.cream; X.lineWidth = 9; X.beginPath(); X.arc(410, 240, 62, 0, 7); X.stroke();
  X.strokeStyle = C.ink; X.lineWidth = 6; X.beginPath(); X.moveTo(ax, ay);
  for (let i = 1; i <= 16; i++) { const f = i / 16; X.lineTo(ax + Math.sin(sw) * L * f + Math.sin(i * 1.7) * 14, ay + Math.cos(sw) * L * f); } X.stroke();
  X.save(); X.translate(ax + Math.sin(sw) * L, ay + Math.cos(sw) * L); X.rotate(-sw); X.fillStyle = C.ink; X.beginPath(); X.roundRect(-60, 0, 120, 44, 20); X.fill(); X.restore();
  if (t > CUE.calling) { const r = (t - CUE.calling) % .5 / .5; X.strokeStyle = C.ink; X.lineWidth = 5;
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { X.globalAlpha = (1 - r) * (1 - ramp(t, CUE.no1, CUE.no1 + .3)); X.beginPath(); X.arc(410, 240, 170 + i * 34 + r * 40, s > 0 ? -.5 : Math.PI - .5, s > 0 ? .5 : Math.PI + .5); X.stroke(); } X.globalAlpha = 1; }
  // top band, generic (no real label marks)
  X.fillStyle = C.ink; X.fillRect(0, 0, S, 64); X.fillStyle = C.cream; X.font = '700 30px "Futura", sans-serif'; X.textAlign = 'left'; X.fillText('45 RPM  ·  STEREO', 30, 44);
  // title stamps on the sung words
  const blocks = [["NO ONE'S", CUE.no1, 470, C.must], ['COMING TO', CUE.coming1, 590, C.red], ['THE RESCUE', CUE.rescue1, 710, C.ink]];
  for (const [w, tt, y, col] of blocks) { const a = ramp(t, tt - .02, tt + .12); if (a <= 0) continue;
    const s = lerp(1.35, 1, eOut(a)); X.save(); X.translate(S / 2, y); X.scale(s, s); X.globalAlpha = Math.min(1, a * 2);
    X.fillStyle = col; X.fillRect(-370, -56, 740, 104);
    X.fillStyle = col === C.ink ? C.cream : C.ink; X.font = '900 92px "Futura", "Helvetica Neue", sans-serif'; X.textAlign = 'center'; X.textBaseline = 'middle';
    X.fillText(w, 0, 0); X.restore(); }
  X.restore();
}
function curvedText(str, r, mid, size, col) {
  X.save(); X.font = `800 ${size}px "Futura", sans-serif`; X.fillStyle = col; X.textAlign = 'center'; X.textBaseline = 'middle';
  const total = [...str].reduce((s, ch) => s + X.measureText(ch).width, 0) / r; let a = mid - total / 2;
  for (const ch of str) { const w = X.measureText(ch).width / r; X.save(); X.rotate(a + w / 2); X.translate(0, -r); X.fillText(ch, 0, 0); X.restore(); a += w; }
  X.restore();
}
function render(t) {
  X.setTransform(1, 0, 0, 1, 0, 0);
  if (t >= CUE.calling && t < CUE.no2 - .1) { sleeve(t); }
  else {
    X.fillStyle = felt; X.fillRect(0, 0, W, H);
    let z = 1, f = [W / 2 + 120, H / 2];
    if (t < CUE.once) { z = lerp(1.35, 1.2, ease(ramp(t, 34, 39))); f = [RC[0], RC[1] - 160]; }
    else if (t < CUE.never) { z = 1.0; f = [W / 2 + 140, H / 2 + 20]; }
    else if (t < CUE.calling) { z = lerp(1.0, 2.6, ease(ramp(t, CUE.never, 47.6))); f = [RC[0], RC[1]]; }
    else { z = lerp(.95, 1.1, ramp(t, CUE.no2, CUE.end)); f = [RC[0] + 60, RC[1]]; }
    record(t, z, f);
    if (t >= CUE.no2) {   // the title is printed on the label, one line per word, once the record has slowed
      X.save(); X.translate(W / 2, H / 2); X.scale(z, z); X.translate(-f[0], -f[1]); X.translate(RC[0], RC[1]); X.rotate(angle(t));
      for (const [w, tt, r, mid] of [["NO ONE'S", CUE.no2, 205, 0], ['COMING TO', CUE.coming2, 160, 0], ['THE RESCUE', CUE.rescue2, 205, Math.PI]]) {
        const a = ease(ramp(t, tt, tt + .25)); if (a > 0) { X.globalAlpha = a; curvedText(w, r, mid, 36, C.ink); X.globalAlpha = 1; } }
      X.restore();
    }
    if (t >= CUE.never && t < CUE.calling) { // spin blur on the locked groove
      const k = ramp(t, CUE.never + 1, 47.6) * .5; if (k > 0) { X.fillStyle = `rgba(20,14,16,${k * .3})`; X.fillRect(0, 0, W, H); } }
  }
  const v = X.createRadialGradient(W / 2, H / 2, H * .4, W / 2, H / 2, H * 1.05); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.55)');
  X.fillStyle = v; X.fillRect(0, 0, W, H);
  if (t < 34.2) { X.fillStyle = `rgba(0,0,0,${1 - ramp(t, 33.8, 34.2)})`; X.fillRect(0, 0, W, H); }
}
frameJPEG(render);
