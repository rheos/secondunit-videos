// Look B v2: a 1960s pull-tab safety book ("What to do in an emergency"). The Satisfied Mind recipe: a printed
// object that works like a toy. Pull tabs, flaps, a pop-up phone. The book promises a rescuer; the song says no one comes.
const P = { paper: '#efe6d0', paperD: '#d9cdb0', red: '#cf3f2d', blue: '#2c4a7a', yel: '#e6b52e', ink: '#1e1a1a', skin: '#3a2a24', wood: '#4a3020' };
const BK = { x0: 160, x1: 1760, y0: 110, y1: 1000, g: 960 };
const PGW = BK.g - BK.x0, PGH = BK.y1 - BK.y0;
const HEAD = '800 64px "Futura", "Helvetica Neue", sans-serif', SUB = '700 34px "Futura", sans-serif', CAP = 'italic 30px "Baskerville", "Georgia", serif';

function pageCanvas(draw) { const c = document.createElement('canvas'); c.width = PGW; c.height = PGH; const g = c.getContext('2d');
  g.fillStyle = P.paper; g.fillRect(0, 0, PGW, PGH); const R = rng(PGW + draw.length);
  for (let i = 0; i < 2500; i++) { g.fillStyle = `rgba(120,90,50,${.025 + R() * .035})`; g.fillRect(R() * PGW, R() * PGH, 1 + R() * 3, 1); }
  draw(g); return c; }
const dots = (() => { const c = document.createElement('canvas'); c.width = c.height = 10; const g = c.getContext('2d'); g.fillStyle = 'rgba(30,26,26,.28)'; g.beginPath(); g.arc(5, 5, 2.1, 0, 7); g.fill(); return X.createPattern(c, 'repeat'); })();
// print a shape twice, offset, for misregistration
function print(g, col, path) { g.save(); g.fillStyle = col; g.translate(2, 1); path(g); g.fill(); g.restore(); g.fillStyle = col; g.globalAlpha = .9; path(g); g.fill(); g.globalAlpha = 1; }
function textC(g, s, x, y, font, col = P.ink) { g.font = font; g.fillStyle = col; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(s, x, y); }
function lines(g, x, y, w, n) { g.fillStyle = 'rgba(30,26,26,.22)'; for (let i = 0; i < n; i++) g.fillRect(x, y + i * 26, w * (i === n - 1 ? .6 : 1), 9); }

// ---- the slot path on spread 1 (right page coords): house door to the garden gate
const SLOT = [[150, 640], [260, 700], [420, 720], [560, 690], [680, 660]];
function slotAt(k) { const n = SLOT.length - 1, f = clamp(k) * n, i = Math.min(n - 1, Math.floor(f)), u = f - i;
  return [lerp(SLOT[i][0], SLOT[i + 1][0], u), lerp(SLOT[i][1], SLOT[i + 1][1], u)]; }

const S1L = pageCanvas(g => {
  textC(g, 'WHAT TO DO', PGW / 2, 120, HEAD, P.red); textC(g, 'IN AN EMERGENCY', PGW / 2, 180, SUB, P.blue);
  textC(g, 'Lesson 4', PGW / 2, 236, CAP); lines(g, 120, 760, PGW - 240, 2);
  // under the two flaps: a coat on a hook, an empty chair
  g.fillStyle = '#e4d8bc'; g.fillRect(110, 450, 260, 220); g.fillRect(430, 450, 260, 220);
  print(g, P.blue, g => { g.beginPath(); g.moveTo(240, 485); g.lineTo(195, 650); g.lineTo(285, 650); g.closePath(); });
  g.fillStyle = P.ink; g.beginPath(); g.arc(240, 482, 7, 0, 7); g.fill();
  print(g, P.yel, g => { g.beginPath(); g.rect(500, 570, 120, 16); g.rect(505, 490, 16, 160); g.rect(602, 586, 14, 64); g.rect(505, 586, 14, 64); });
  textC(g, 'Look in the window.', 240, 640 + 60, CAP); textC(g, 'Knock on the door.', 560, 700, CAP);
  textC(g, '8', PGW / 2, PGH - 26, CAP);
});
const S1R = pageCanvas(g => {
  // sky band, house, garden path, gate
  print(g, P.yel, g => { g.beginPath(); g.arc(640, 170, 70, 0, 7); });
  print(g, P.red, g => { g.beginPath(); g.moveTo(40, 400); g.lineTo(190, 270); g.lineTo(340, 400); g.closePath(); });
  print(g, P.blue, g => { g.beginPath(); g.rect(60, 400, 260, 300); });
  g.fillStyle = P.paper; g.fillRect(110, 450, 70, 70); g.fillStyle = P.ink; g.fillRect(140, 580, 60, 120);
  g.fillStyle = dots; g.fillRect(60, 400, 260, 300);
  print(g, '#5f8a4a', g => { g.beginPath(); g.arc(470, 520, 70, 0, 7); g.arc(540, 480, 55, 0, 7); });
  g.fillStyle = P.ink; g.fillRect(495, 560, 14, 140);
  g.fillStyle = 'rgba(30,26,26,.12)'; g.fillRect(0, 700, PGW, 6);
  // gate
  g.strokeStyle = P.ink; g.lineWidth = 7; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(640 + i * 24, 610); g.lineTo(640 + i * 24, 700); g.stroke(); }
  g.beginPath(); g.moveTo(630, 630); g.lineTo(750, 630); g.moveTo(630, 680); g.lineTo(750, 680); g.stroke();
  // the slot, die-cut through the page
  g.strokeStyle = '#2a2018'; g.lineWidth = 12; g.lineCap = 'round'; g.beginPath(); SLOT.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke();
  g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 2; g.beginPath(); SLOT.forEach(([x, y], i) => i ? g.lineTo(x, y + 6) : g.moveTo(x, y + 6)); g.stroke();
  textC(g, 'Find the way out.', PGW / 2, 790, CAP); textC(g, '9', PGW / 2, PGH - 26, CAP);
});
const S2L = pageCanvas(g => {
  textC(g, 'WHO DO YOU CALL?', PGW / 2, 120, HEAD, P.blue); lines(g, 120, 180, PGW - 240, 2);
  g.strokeStyle = 'rgba(30,26,26,.3)'; g.setLineDash([10, 8]); g.lineWidth = 3; g.strokeRect(220, 640, 360, 30); g.setLineDash([]);
  textC(g, 'Dial slowly and clearly.', PGW / 2, 790, CAP); textC(g, '10', PGW / 2, PGH - 26, CAP);
});
const FLAPS = [[90, 380], [320, 380], [550, 380]], FW2 = 190, FH2 = 220;
const S2R = pageCanvas(g => {
  textC(g, 'WHO COMES TO HELP?', PGW / 2, 110, '800 54px "Futura", sans-serif', P.red);
  for (const [x, y] of FLAPS) { g.fillStyle = '#e4d8bc'; g.fillRect(x, y, FW2, FH2);
    // a dashed "cut here" outline where a helper should be
    g.strokeStyle = 'rgba(30,26,26,.45)'; g.lineWidth = 3; g.setLineDash([9, 7]); g.beginPath();
    g.arc(x + FW2 / 2, y + 50, 22, 0, 7); g.moveTo(x + FW2 / 2 - 34, y + 84); g.lineTo(x + FW2 / 2 + 34, y + 84); g.lineTo(x + FW2 / 2 + 40, y + 190);
    g.lineTo(x + FW2 / 2 - 40, y + 190); g.closePath(); g.stroke(); g.setLineDash([]); }
  textC(g, 'Lift each flap.', PGW / 2, 815, CAP); textC(g, '11', PGW / 2, PGH - 26, CAP);
});

// ---- paper doll on brads: side view, faceless; legs and arms swing on split pins
function doll(ctx, x, y, s, legA, armA, dir = 1, back = false) {
  const parts = [];
  const limb = (px, py, len, w, a) => ctx2 => { ctx2.save(); ctx2.translate(px, py); ctx2.rotate(a); ctx2.beginPath(); ctx2.roundRect(-w / 2, -w / 2, w, len + w / 2, w / 2); ctx2.restore(); };
  parts.push([P.skin, limb(-2, -44, 42, 10, -legA)], [P.skin, limb(0, -80, 30, 9, armA)]);
  parts.push([P.red, g => { g.beginPath(); g.moveTo(-8, -84); g.lineTo(8, -84); g.lineTo(20, -36); g.lineTo(-20, -36); g.closePath(); }]);
  parts.push([P.skin, g => { g.beginPath(); g.ellipse(back ? 0 : 3, -95, 10, 11, 0, 0, 7); }], [P.skin, g => { g.beginPath(); g.arc(back ? 0 : -6, back ? -106 : -101, 6.5, 0, 7); }]);
  parts.push([P.skin, limb(2, -44, 42, 10, legA)], [P.skin, limb(2, -80, 30, 9, -armA)]);
  ctx.save(); ctx.translate(x, y); ctx.scale(dir * s / 100, s / 100);
  ctx.save(); ctx.translate(4, 5); ctx.fillStyle = 'rgba(0,0,0,.25)'; for (const [, f] of parts) { f(ctx); ctx.fill(); } ctx.restore();
  ctx.lineJoin = 'round'; ctx.strokeStyle = '#faf4e4'; ctx.lineWidth = 7; for (const [, f] of parts) { f(ctx); ctx.stroke(); }
  for (const [c, f] of parts) { ctx.fillStyle = c; f(ctx); ctx.fill(); }
  ctx.fillStyle = '#c9a24a'; for (const [bx, by] of [[0, -44], [1, -80]]) { ctx.beginPath(); ctx.arc(bx, by, 3.2, 0, 7); ctx.fill(); }
  ctx.restore();
}
// a hinged flap: k=0 shut (front up), k=1 lifted right over (back showing above the hinge)
function flap(ctx, x, y, w, h, k, front) {
  const c = Math.cos(Math.PI * clamp(k));
  if (c > 0) { const hh = h * c;
    ctx.fillStyle = `rgba(0,0,0,${.18 + .2 * (1 - c)})`; ctx.fillRect(x + 6, y + 8, w, hh + (1 - c) * 30);
    ctx.save(); ctx.translate(x, y); ctx.scale(1, c); front(ctx, w, h); ctx.fillStyle = `rgba(255,255,255,${(1 - c) * .25})`; ctx.fillRect(0, 0, w, h); ctx.restore(); }
  else { const hh = -h * c; ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.fillRect(x + 4, y - hh + 4, w, hh);
    ctx.fillStyle = P.paperD; ctx.fillRect(x, y - hh, w, hh); ctx.fillStyle = `rgba(0,0,0,${.15 * (1 + c)})`; ctx.fillRect(x, y - hh, w, hh); }
}
function flapFace(label, col) { return (g, w, h) => { g.fillStyle = col; g.fillRect(0, 0, w, h); g.fillStyle = dots; g.fillRect(0, 0, w, h);
  g.strokeStyle = P.ink; g.lineWidth = 3; g.strokeRect(10, 10, w - 20, h - 20); textC(g, label, w / 2, h / 2, `800 ${label.length > 2 ? 46 : 90}px "Futura", sans-serif`, P.paper); }; }
function slam(t, tt) { if (t < tt - .18) return 1; return 1 - eOut(ramp(t, tt - .18, tt)); }   // open -> shut, landing on the word

// ---- doll progress along the slot on spread 1: escape, then "it never stops" pulls her back and out again
function slotK(t) {
  if (t < CUE.never) return ease(ramp(t, 34.6, 38.4));
  const loops = [[42.76, 43.5, 44.4], [44.86, 45.4, 46.2], [46.4, 46.8, 47.3]];   // snap back, then out again, faster each time
  for (const [a, b, c] of loops) { if (t >= a && t < b) return 1 - eOut(ramp(t, a, a + .25)); if (t >= b && t < c) return ease(ramp(t, b, c)); }
  return 1;
}
function tab(ctx, x, y, out, label) { ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(x - 6, y + 6, 26 + out, 70);
  ctx.fillStyle = P.yel; ctx.fillRect(x - 10, y, 30 + out, 70); ctx.fillStyle = dots; ctx.fillRect(x - 10, y, 30 + out, 70);
  ctx.save(); ctx.translate(x + 12 + out, y + 35); ctx.rotate(-Math.PI / 2); textC(ctx, label, 0, 0, '800 18px "Futura", sans-serif'); ctx.restore(); }

function spread1(t, showRight = true) {
  X.drawImage(S1L, BK.x0, BK.y0);
  for (const [i, tt, x] of [[0, CUE.once, 110], [1, CUE.twice, 430]]) {
    const k = slam(t, tt); flap(X, BK.x0 + x, BK.y0 + 450, 260, 220, k, flapFace(i ? 'DOOR' : 'WINDOW', i ? P.red : P.blue));
    if (t > tt && t < tt + .5) { const a = 1 - ramp(t, tt, tt + .5); X.fillStyle = `rgba(80,60,40,${a * .35})`;   // dust puff
      for (let d = 0; d < 9; d++) { const ang = d / 9 * 7, r = 30 + (t - tt) * 260; X.beginPath(); X.arc(BK.x0 + x + 130 + Math.cos(ang) * r * 1.4, BK.y0 + 670 + Math.sin(ang) * r * .3, 6, 0, 7); X.fill(); } }
  }
  if (!showRight) return;
  X.drawImage(S1R, BK.g, BK.y0);
  const k = slotK(t), [sx, sy] = slotAt(k), moving = Math.abs(slotK(t + .04) - k) > .002;
  const sw = moving ? Math.sin(t * 14) * .55 : 0;
  doll(X, BK.g + sx, BK.y0 + sy + 4, 210, sw, -sw * .8, slotK(t + .04) >= k ? 1 : -1);
  tab(X, BK.x1, BK.y0 + 640, k * 90, 'PULL');
}
function spread2(t, showLeft = true) {
  if (showLeft) X.drawImage(S2L, BK.x0, BK.y0);
  X.drawImage(S2R, BK.g, BK.y0);
  // pop-up telephone rising from the page on "calling"
  if (showLeft) { const r = eOut(ramp(t, CUE.calling - .1, CUE.calling + .35)) + .04 * Math.sin((t - CUE.calling) * 30) * Math.exp(-(t - CUE.calling) * 5) * (t > CUE.calling);
    const bx = BK.x0 + 400, by = BK.y0 + 650, hh = 380 * clamp(r, 0, 1.1);
    X.fillStyle = 'rgba(0,0,0,.22)'; X.beginPath(); X.moveTo(bx - 180, by); X.lineTo(bx + 180, by); X.lineTo(bx + 230, by + 40); X.lineTo(bx - 130, by + 40); X.fill();
    X.save(); X.translate(bx, by); X.scale(1, hh / 380);
    X.fillStyle = P.ink; X.beginPath(); X.roundRect(-150, -300, 300, 260, 40); X.fill();
    X.fillStyle = P.red; X.beginPath(); X.roundRect(-140, -290, 280, 240, 34); X.fill(); X.fillStyle = dots; X.fillRect(-140, -290, 280, 240);
    X.fillStyle = P.paper; X.beginPath(); X.arc(0, -170, 70, 0, 7); X.fill(); X.fillStyle = P.ink;
    for (let i = 0; i < 10; i++) { const a = i / 10 * 5.2 - 2.4; X.beginPath(); X.arc(Math.cos(a) * 48, -170 + Math.sin(a) * 48, 9, 0, 7); X.fill(); }
    X.fillRect(-14, -40, 28, 40); X.restore();
    // the receiver off the hook, swinging on its cord over the edge of the pop-up
    if (r > .7) { const sw = Math.sin((t - CUE.calling) * 3.2) * .35, ax = bx + 175, ay = by - 200 * hh / 380, L = 200;
      X.strokeStyle = P.ink; X.lineWidth = 5; X.beginPath(); X.moveTo(ax, ay); for (let i = 1; i <= 16; i++) { const f = i / 16; X.lineTo(ax + Math.sin(sw) * L * f + Math.sin(i * 1.8) * 12, ay + Math.cos(sw) * L * f); } X.stroke();
      X.save(); X.translate(ax + Math.sin(sw) * L, ay + Math.cos(sw) * L); X.rotate(-sw); X.fillStyle = P.ink; X.beginPath(); X.roundRect(-55, 0, 110, 38, 18); X.fill(); X.restore();
      const rr = (t - CUE.calling) % .45 / .45; X.strokeStyle = P.red; X.lineWidth = 6; X.globalAlpha = (1 - rr) * (1 - ramp(t, CUE.no1, CUE.no1 + .4));
      for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { X.beginPath(); X.arc(bx, by - 170 * hh / 380, 190 + i * 40 + rr * 40, s > 0 ? -.55 : Math.PI - .55, s > 0 ? .55 : Math.PI + .55); X.stroke(); }
      X.globalAlpha = 1; }
  }
  // the three flaps: lifted one per word on each refrain, every one empty; they drop shut between refrains
  const refr = [[CUE.no1, CUE.coming1, CUE.rescue1], [CUE.no2, CUE.coming2, CUE.rescue2]], words = ["NO ONE'S", 'COMING TO', 'THE RESCUE'];
  FLAPS.forEach(([fx, fy], i) => {
    let k = 0; const o1 = refr[0][i], o2 = refr[1][i];
    if (t >= o1 - .1) k = eOut(ramp(t, o1 - .1, o1 + .25));
    if (t >= 59.6) k = 1 - ease(ramp(t, 59.6, 60.3));
    if (t >= o2 - .1) k = eOut(ramp(t, o2 - .1, o2 + .25));
    const x = BK.g + fx, y = BK.y0 + fy;
    if (k > .05) { const a = clamp(k * 1.5); X.globalAlpha = a; textC(X, words[i], x + FW2 / 2, y + FH2 + 40, '800 30px "Futura", sans-serif', P.red); X.globalAlpha = 1; }
    flap(X, x, y, FW2, FH2, k, flapFace('?', [P.blue, P.yel, P.red][i]));
  });
  // refrain 2: the PULL FOR HELP tab pulls out, and nothing comes along the slot
  const pk = ease(ramp(t, CUE.no2 - .3, CUE.no2 + .6)) - ease(ramp(t, 64.5, 65.3));
  X.strokeStyle = '#2a2018'; X.lineWidth = 12; X.lineCap = 'round'; X.beginPath(); X.moveTo(BK.g + 50, BK.y0 + 770); X.lineTo(BK.x1 - 40, BK.y0 + 770); X.stroke();
  tab(X, BK.x1, BK.y0 + 735, pk * 90, 'PULL');
  // she stands at the start of the empty slot, back turned, through the last refrain
  if (t > CUE.no2 - .3) doll(X, BK.g + 56, BK.y0 + 774, 150, 0, 0, 1, true);
}
function pageTurn(t, a, b) {   // right page of spread 1 turns over onto the left
  const p = ease(ramp(t, a, b));
  spread1(t, false); X.drawImage(S2R, BK.g, BK.y0);
  // pop-up and flaps of spread 2 right are flat at this moment
  if (p < .5) { const w = PGW * Math.cos(p * Math.PI); X.save(); X.translate(BK.g, BK.y0); X.scale(w / PGW, 1); X.drawImage(S1R, 0, 0);
    X.fillStyle = `rgba(0,0,0,${p * .5})`; X.fillRect(0, 0, PGW, PGH); X.restore();
    X.fillStyle = `rgba(0,0,0,${.25 * Math.sin(p * Math.PI)})`; X.fillRect(BK.g + w, BK.y0, 40, PGH); }
  else { const w = -PGW * Math.cos(p * Math.PI); X.save(); X.translate(BK.g, BK.y0); X.scale(-w / PGW, 1); X.drawImage(S2L, -PGW, 0);
    X.fillStyle = `rgba(0,0,0,${(1 - p) * .5})`; X.fillRect(-PGW, 0, PGW, PGH); X.restore(); }
}
function book(t) {
  // table, page block edges, gutter shade
  X.fillStyle = 'rgba(0,0,0,.45)'; X.fillRect(BK.x0 + 18, BK.y0 + 24, BK.x1 - BK.x0, BK.y1 - BK.y0);
  for (let i = 6; i > 0; i--) { X.fillStyle = i % 2 ? '#e8dcc0' : '#cfc2a2'; X.fillRect(BK.x0 - i * 2, BK.y0 + i * 2, BK.x1 - BK.x0 + i * 4, BK.y1 - BK.y0); }
  if (t < 47.3) spread1(t); else if (t < 48.1) pageTurn(t, 47.3, 48.1); else spread2(t);
  const gs = X.createLinearGradient(BK.g - 70, 0, BK.g + 70, 0); gs.addColorStop(0, 'rgba(0,0,0,0)'); gs.addColorStop(.5, 'rgba(60,40,20,.35)'); gs.addColorStop(1, 'rgba(0,0,0,0)');
  X.fillStyle = gs; X.fillRect(BK.g - 70, BK.y0, 140, PGH);
}
function cam(t) {
  if (t < CUE.once - .5) return [lerp(1.3, 1.4, ramp(t, 34, 38.5)), [BK.g + 400, BK.y0 + 560]];
  if (t < CUE.never) return [1.3, [BK.x0 + 420, BK.y0 + 560]];
  if (t < 47.2) return [lerp(1.3, 1.02, ease(ramp(t, CUE.never, 44.2))), [lerp(BK.g + 400, 960, ease(ramp(t, CUE.never, 44.2))), BK.y0 + 520]];
  if (t < CUE.calling) return [1.0, [960, 555]];
  if (t < CUE.no1 - .4) return [1.35, [BK.x0 + 410, BK.y0 + 470]];
  if (t < CUE.no2 - .5) return [1.35, [BK.g + 420, BK.y0 + 480]];
  return [lerp(1.1, 1.0, ramp(t, CUE.no2, CUE.end)), [lerp(BK.g + 260, 960, ramp(t, CUE.no2, CUE.end)), BK.y0 + 500]];
}
const table = (() => { const c = document.createElement('canvas'); c.width = 512; c.height = 512; const g = c.getContext('2d');
  g.fillStyle = P.wood; g.fillRect(0, 0, 512, 512); const R = rng(9);
  for (let i = 0; i < 160; i++) { g.strokeStyle = `rgba(${R() < .5 ? '0,0,0' : '255,220,170'},${.04 + R() * .06})`; g.lineWidth = 1 + R() * 3; g.beginPath(); const y = R() * 512; g.moveTo(0, y); g.bezierCurveTo(170, y + R() * 20 - 10, 340, y + R() * 20 - 10, 512, y); g.stroke(); }
  return X.createPattern(c, 'repeat'); })();
function render(t) {
  X.setTransform(1, 0, 0, 1, 0, 0);
  const [z, [fx, fy]] = cam(t);
  X.save(); X.translate(W / 2, H / 2); X.scale(z, z); X.translate(-fx, -fy);
  X.fillStyle = table; X.fillRect(-600, -600, W + 1200, H + 1200);
  book(t);
  X.restore();
  const v = X.createRadialGradient(W / 2, H / 2, H * .45, W / 2, H / 2, H * 1.1); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.45)');
  X.fillStyle = v; X.fillRect(0, 0, W, H);
  if (t < 34.2) { X.fillStyle = `rgba(0,0,0,${1 - ramp(t, 33.8, 34.2)})`; X.fillRect(0, 0, W, H); }
}
frameJPEG(render);
