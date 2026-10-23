// Look A: Hall of moving portraits. One hall, framings inside it; only the pictures move.
const FW = 420, FH = 540, FY = 470, BORDER = 30;
const PW = FW - 2 * BORDER, PH = FH - 2 * BORDER;
const FR = { cape: 0, start: 620, next: 1180, phone: 1740 };

// photo plates (halftone, cached once)
const plate = {
  cape: halftone(PW, PH, 9, C.teal, C.cream, g => {
    softBlob(g, PW * .5, PH * .42, PW * .5, .55);
    g.fillStyle = '#000'; g.beginPath(); g.arc(PW * .5, PH * .14, 7, 0, 7); g.fill();
    // stage cape on a hanger: hook, hanger bar, high stand-up collar, wide shoulders, flared hem with a sequin trim
    g.strokeStyle = '#000'; g.lineWidth = 6; g.beginPath(); g.moveTo(PW * .5, PH * .1); g.lineTo(PW * .5, PH * .15); g.stroke();
    g.beginPath(); g.moveTo(PW * .5, PH * .15); g.lineTo(PW * .26, PH * .24); g.lineTo(PW * .74, PH * .24); g.closePath(); g.stroke();
    g.beginPath(); g.moveTo(PW * .38, PH * .16); g.lineTo(PW * .62, PH * .16); g.lineTo(PW * .6, PH * .24); g.lineTo(PW * .4, PH * .24); g.fill();
    g.beginPath(); g.moveTo(PW * .4, PH * .23); g.quadraticCurveTo(PW * .22, PH * .24, PW * .2, PH * .3);
    g.lineTo(PW * .1, PH * .88); g.quadraticCurveTo(PW * .5, PH * .94, PW * .9, PH * .88); g.lineTo(PW * .8, PH * .3);
    g.quadraticCurveTo(PW * .78, PH * .24, PW * .6, PH * .23); g.fill();
    g.fillStyle = '#fff'; for (let i = 0; i < 22; i++) { const k = i / 21; g.beginPath(); g.arc(lerp(PW * .12, PW * .88, k), PH * .88 + Math.sin(k * Math.PI) * PH * .05 - 10, 4, 0, 7); g.fill(); }
    g.fillStyle = '#000';
    // a microphone on a stand, right
    g.fillRect(PW * .84, PH * .3, 5, PH * .6); g.beginPath(); g.ellipse(PW * .845, PH * .27, 13, 20, 0, 0, 7); g.fill();
  }),
  room: halftone(PW, PH, 9, C.must, C.cream, g => {
    softBlob(g, PW * .55, PH * .45, PW * .55, .6);
    g.fillStyle = 'rgba(0,0,0,.85)'; g.fillRect(0, PH * .86, PW, 4);
    g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(PW * .06, PH * .12, PW * .22, PH * .34);   // a window
  }),
  next: halftone(PW, PH, 9, C.must, C.cream, g => {
    softBlob(g, PW * .45, PH * .5, PW * .5, .45);
    g.fillStyle = 'rgba(0,0,0,.85)'; g.fillRect(0, PH * .86, PW, 4);
    g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(PW * .66, PH * .2, PW * .2, PH * .66);      // a door
  }),
  phone: halftone(PW, PH, 9, C.vio, C.cream, g => {
    softBlob(g, PW * .5, PH * .32, PW * .45, .55);
    g.fillStyle = '#000'; g.beginPath(); g.roundRect(PW * .34, PH * .1, PW * .32, PH * .32, 14); g.fill();
  }),
};
const damask = (() => { const c = document.createElement('canvas'); c.width = 120; c.height = 120; const g = c.getContext('2d');
  g.fillStyle = C.ox; g.fillRect(0, 0, 120, 120);
  for (const [x, y] of [[30, 30], [90, 90]]) { g.fillStyle = C.oxd; g.beginPath(); g.moveTo(x, y - 30); g.quadraticCurveTo(x + 14, y, x, y + 30); g.quadraticCurveTo(x - 14, y, x, y - 30); g.fill();
    g.fillStyle = '#6e2228'; g.beginPath(); g.arc(x, y, 4, 0, 7); g.fill(); }
  return X.createPattern(c, 'repeat'); })();

function cam(t) {   // returns world centre x and zoom
  if (t < CUE.once) return [lerp(880, 960, ease(ramp(t, 34, 39))), 1.0];
  if (t < CUE.never) return [300, 1.08];
  if (t < CUE.calling) return [lerp(300, -3900, ease(ramp(t, CUE.never, 47.6))), 1.0];
  if (t < CUE.no1 - 0.2) return [FR.phone, 1.5];
  return [lerp(870, 900, ramp(t, CUE.no1, CUE.end)), lerp(.66, .62, ramp(t, CUE.no1, CUE.end))];
}
// which picture lights are on
function lit(t, x) {
  if (t < CUE.no2) return true;
  if (x === FR.next) return true;
  const offs = [[FR.cape, CUE.no2], [FR.start, CUE.coming2], [FR.phone, CUE.rescue2]];
  for (const [fx, tt] of offs) if (fx === x) return t < tt;
  return true;
}
// frame jolt (the knocks on "once" and "twice")
function jolt(t, x) {
  if (x !== FR.cape) return 0;
  let r = 0; for (const [tt, a] of [[CUE.once, -.07], [CUE.twice, .05]]) if (t > tt) r += a * Math.exp(-(t - tt) * 2.5) * Math.cos((t - tt) * 18);
  return r + (t > CUE.twice ? .02 : t > CUE.once ? -.03 : 0);
}
function cracks(ctx, t) {
  const n = t > CUE.twice ? 2 : t > CUE.once ? 1 : 0;
  for (let k = 0; k < n; k++) {
    const R = rng(11 + k * 7), cx = k ? PW * .3 : PW * .62, cy = k ? PH * .6 : PH * .32;
    const grow = eOut(ramp(t, k ? CUE.twice : CUE.once, (k ? CUE.twice : CUE.once) + .25));
    ctx.strokeStyle = 'rgba(255,252,240,.9)'; ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) { let a = i * .8 + R() * .5, px = cx, py = cy, L = (90 + R() * 150) * grow;
      ctx.beginPath(); ctx.moveTo(px, py); for (let s = 0; s < 5; s++) { a += (R() - .5) * .5; px += Math.cos(a) * L / 5; py += Math.sin(a) * L / 5; ctx.lineTo(px, py); } ctx.stroke(); }
  }
}
function picture(ctx, t, x, kind) {
  if (kind === 'cape') { ctx.drawImage(plate.cape, 0, 0); if (x === FR.cape) cracks(ctx, t); }
  if (kind === 'start') {
    ctx.drawImage(plate.room, 0, 0);
    const k = ramp(t, 34.25, 36.85);   // runs out of the right edge
    if (t < 36.95) woman(ctx, lerp(PW * .14, PW * 1.18, k), PH * .86, 250, (t - 34) * 1.7, 1, t < 34.25 ? ease(ramp(t, 33.8, 34.25)) : 1);
  }
  if (kind === 'next') {
    ctx.drawImage(plate.next, 0, 0);
    if (t > 36.75) {
      if (t < CUE.no1) { const k = eOut(ramp(t, 36.75, 38.6)); const run = 1 - ease(ramp(t, 37.8, 38.8));
        woman(ctx, lerp(-PW * .2, PW * .42, k), PH * .86, 250, (t - 34) * 1.7, 1, run); }
      else { const turn = ease(ramp(t, CUE.no1, CUE.no1 + .5));
        if (turn < .5) woman(ctx, PW * .42, PH * .86, 250, 0, 1, 0); else womanBack(ctx, PW * .42, PH * .86, 250); }
    }
  }
  if (kind === 'phone') {
    ctx.drawImage(plate.phone, 0, 0);
    const sw = Math.sin((t - 46) * 2.6) * .32 * Math.exp(-Math.max(0, t - CUE.calling) * .15);
    const ax = PW * .5, ay = PH * .42; ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(ax, ay);
    const L = PH * .42; for (let i = 1; i <= 14; i++) { const f = i / 14, xx = ax + Math.sin(sw) * L * f + Math.sin(i * 1.7) * 9 * (1 - f * .3), yy = ay + Math.cos(sw) * L * f; ctx.lineTo(xx, yy); }
    ctx.stroke(); const rx = ax + Math.sin(sw) * L, ry = ay + Math.cos(sw) * L;
    ctx.save(); ctx.translate(rx, ry); ctx.rotate(-sw); ctx.fillStyle = C.ink; ctx.beginPath(); ctx.roundRect(-34, 0, 68, 26, 12); ctx.fill(); ctx.restore();
    // dial ring
    ctx.strokeStyle = C.cream; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(PW * .5, PH * .26, 34, 0, 7); ctx.stroke();
    if (t > CUE.calling) { const r = (t - CUE.calling) % .5 / .5; ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
      for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { ctx.globalAlpha = 1 - r; ctx.beginPath(); ctx.arc(PW * .5, PH * .26, 90 + i * 22 + r * 30, s > 0 ? -.5 : Math.PI - .5, s > 0 ? .5 : Math.PI + .5); ctx.stroke(); } ctx.globalAlpha = 1; }
  }
}
function drawFrame(ctx, t, x, kind, plaqueText, plaqueAt) {
  const on = lit(t, x);
  ctx.save(); ctx.translate(x, FY); ctx.rotate(jolt(t, x));
  if (on) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, 0, -FH * .25, FH * .9, 'rgba(255,200,130,1)', .22); ctx.restore(); }
  ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fillRect(-FW / 2 + 14, -FH / 2 + 18, FW, FH);   // shadow
  // gilt moulding
  for (let i = 0; i < BORDER; i++) { const k = i / BORDER, s = .55 + .6 * Math.sin(k * Math.PI);
    ctx.strokeStyle = `rgb(${Math.min(255, 196 * s)},${Math.min(255, 152 * s)},${Math.min(255, 72 * s)})`; ctx.lineWidth = 1.2;
    ctx.strokeRect(-FW / 2 + i, -FH / 2 + i, FW - 2 * i, FH - 2 * i); }
  ctx.strokeStyle = C.giltD; ctx.lineWidth = 3; ctx.strokeRect(-PW / 2 - 2, -PH / 2 - 2, PW + 4, PH + 4);
  ctx.save(); ctx.beginPath(); ctx.rect(-PW / 2, -PH / 2, PW, PH); ctx.clip(); ctx.translate(-PW / 2, -PH / 2);
  picture(ctx, t, x, kind);
  ctx.restore();
  if (!on) { ctx.fillStyle = 'rgba(8,3,4,.72)'; ctx.fillRect(-FW / 2 - 4, -FH / 2 - 4, FW + 8, FH + 8); }
  // picture light
  ctx.fillStyle = on ? C.giltL : C.giltD; ctx.fillRect(-60, -FH / 2 - 52, 120, 12); ctx.fillRect(-3, -FH / 2 - 40, 6, 36);
  ctx.restore();
  // plaque
  const py = FY + FH / 2 + 34, bright = plaqueAt != null ? ease(ramp(t, plaqueAt - .05, plaqueAt + .3)) : 0;
  ctx.fillStyle = bright > 0 ? `rgb(${lerp(140, 240, bright)},${lerp(104, 200, bright)},${lerp(48, 110, bright)})` : '#8c6830';
  ctx.fillRect(x - 190, py, 380, 76); ctx.strokeStyle = '#4e3410'; ctx.lineWidth = 4; ctx.strokeRect(x - 190, py, 380, 76);
  if (bright > 0) { ctx.globalAlpha = bright; ctx.fillStyle = C.ink; ctx.font = '600 48px "Copperplate", "Copperplate Gothic Light", serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(plaqueText, x, py + 40); ctx.globalAlpha = 1; }
  if (bright > 0 && bright < 1) glow(ctx, x, py + 26, 220, 'rgba(255,220,150,1)', (1 - bright) * .6);
}
function render(t) {
  const [cx, z] = cam(t);
  X.setTransform(1, 0, 0, 1, 0, 0);
  X.save(); X.translate(W / 2, H / 2); X.scale(z, z); X.translate(-cx, -H / 2);
  const left = cx - W / 2 / z - 600, right = cx + W / 2 / z + 600;
  X.fillStyle = damask; X.fillRect(left, -200, right - left, 1100);
  X.fillStyle = '#7a5428'; X.fillRect(left, 890, right - left, 10);
  X.fillStyle = '#24090c'; X.fillRect(left, 900, right - left, 600);
  // endless cape frames to the left ("it never stops")
  for (let k = 1; k <= 9; k++) { const x = FR.cape - 560 * k; if (x > left && x < right) drawFrame(X, t, x, 'cape'); }
  const ref = t >= CUE.no2 ? [CUE.no2, CUE.coming2, CUE.rescue2] : [CUE.no1, CUE.coming1, CUE.rescue1];
  drawFrame(X, t, FR.cape, 'cape', "NO ONE'S", ref[0]);
  drawFrame(X, t, FR.start, 'start', 'COMING TO', ref[1]);
  drawFrame(X, t, FR.next, 'next', 'THE RESCUE', ref[2]);
  drawFrame(X, t, FR.phone, 'phone');
  X.restore();
  // lights fall as the hall goes dark
  const dark = .25 + .35 * ramp(t, CUE.no2, CUE.end);
  const v = X.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * 1.05); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(0,0,0,${dark + .3})`);
  X.fillStyle = v; X.fillRect(0, 0, W, H);
  if (t < 34.2) { X.fillStyle = `rgba(0,0,0,${1 - ramp(t, 33.8, 34.2)})`; X.fillRect(0, 0, W, H); }
}
frameJPEG(render);
