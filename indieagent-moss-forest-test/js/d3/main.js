// d3 frame assembly, the live player and the offline hooks (check.mjs, motion-lab render/audit use window.__frameJPEG).
const cv = document.getElementById('c'); cv.width = W; cv.height = H;
const X = cv.getContext('2d');
const PROBE = (typeof ML !== 'undefined' && ML.probe) || { on: false, text() {}, box() {}, event() {}, edge() {}, value() {} };
const ML_prevT = (t) => (Math.round(t * FPS) - 1) / FPS;

const BAKE0 = performance.now();
const P = {
  sky: bakeSky(),
  far: bakeTrees({ seed: 11, floor: 548, trunks: 44, w: [5, 15], haze: 40, branch: 1, leaf: [26, 52], under: 46, pal: PALS.far, trunk: hex('#7d968a'), rim: hex('#fff0c8'), fog: [.56, .5], blur: 3.2, bark: .4, gap: 110 }),
  fmid: bakeTrees({ seed: 23, floor: 566, trunks: 24, w: [10, 24], haze: 26, branch: 2, leaf: [26, 56], under: 34, pal: PALS.fmid, trunk: hex('#5f6e5c'), rim: hex('#fbe6b0'), fog: [.38, .3], blur: 1.8, bark: .7, gap: 150 }),
  mid: bakeTrees({ seed: 37, floor: 584, trunks: 13, w: [22, 40], haze: 14, branch: 3, leaf: [30, 64], under: 26, pal: PALS.mid, trunk: hex('#4a4a38'), rim: hex('#f8dd98'), fog: [.2, .12], blur: .8, gap: 190 }),
  clear: bakeClearing(), near: blurred(bakeNear(), .5),
};
const F = { a: bakeFog(101, 330, 520, 600, 150), b: bakeFog(103, 430, 560, 620, 130), c: bakeFog(107, 500, 590, 640, 120), d: bakeFog(109, 540, 610, 690, 170) };
const GRASS = planGrass(), STRANDS = planStrands(), GRAIN = makeGrain();
bakeGiant();
window.__bakeMs = Math.round(performance.now() - BAKE0);
const GC = canvas(W, H), G = GC.getContext('2d');
const S1 = canvas(320, 180), S2 = canvas(320, 180), S3 = canvas(320, 180), B1 = canvas(320, 180);
const MOTES = (() => { const R0 = rng(121), m = []; for (let i = 0; i < 150; i++) m.push({ x: 360 + R0() * 820, y: 150 + R0() * 500, a: R0() * TAU, b: R0() * TAU, r: .9 + R0() * 1.6 }); return m; })();

function plane(c, r, t, a = 1, dx = 0) { planeT(X, r, t); X.globalAlpha = a; X.drawImage(c, -MX - dx, -MY); X.globalAlpha = 1; X.setTransform(1, 0, 0, 1, 0, 0); }

// light shafts: beams fanning down from the sun; the same field lights the dust motes
const BEAMS = [[1.0, .022, .6], [1.2, .04, 1], [1.38, .018, .55], [1.56, .05, .9], [1.8, .03, .8], [2.02, .045, .7], [2.3, .024, .5]];
const beamI = (i, t) => BEAMS[i][2] * (.72 + .28 * Math.sin(t * .35 + i * 1.7));
function shaftField(x, y, t) {
  const [sx, sy] = sunScreen(t), a = Math.atan2(y - sy, x - sx), d = Math.hypot(x - sx, y - sy); let v = 0;
  BEAMS.forEach(([b, w], i) => { const q = (a - b) / w; v += beamI(i, t) * Math.exp(-q * q); });
  return v * clamp(1.2 - d / 900) * clamp((y - sy) / 80);
}
function shafts(t, L) {
  const s = S1.getContext('2d'), [sx, sy] = sunScreen(t).map((v) => v / 4);
  s.clearRect(0, 0, 320, 180);
  BEAMS.forEach(([b, w], i) => {
    const rg = s.createRadialGradient(sx, sy, 0, sx, sy, 230); rg.addColorStop(0, `rgba(255,244,206,${.9 * beamI(i, t)})`); rg.addColorStop(.25, `rgba(255,240,200,${.55 * beamI(i, t)})`); rg.addColorStop(1, 'rgba(255,236,190,0)');
    s.fillStyle = rg; s.beginPath(); s.moveTo(sx, sy); s.lineTo(sx + Math.cos(b - w) * 300, sy + Math.sin(b - w) * 300); s.lineTo(sx + Math.cos(b + w) * 300, sy + Math.sin(b + w) * 300); s.closePath(); s.fill();
  });
  const q = S2.getContext('2d'); q.clearRect(0, 0, 320, 180); q.filter = 'blur(2.5px)'; q.drawImage(S1, 0, 0); q.filter = 'none';
  X.save(); X.globalCompositeOperation = 'screen'; X.globalAlpha = .62 * L; X.drawImage(S2, 0, 0, W, H); X.restore();
}
function shadeWedges(t, L) {
  const [sx, sy] = sunScreen(t).map((v) => v / 4), q = S3.getContext('2d'); q.filter = 'blur(3px)'; q.fillStyle = '#fff'; q.fillRect(-20, -20, 360, 220);
  for (let i = 0; i < BEAMS.length - 1; i++) {
    const a0 = BEAMS[i][0] + BEAMS[i][1] * 1.4, a1 = BEAMS[i + 1][0] - BEAMS[i + 1][1] * 1.4, rg = q.createRadialGradient(sx, sy, 8, sx, sy, 170);
    rg.addColorStop(0, 'rgb(255,255,255)'); rg.addColorStop(.3, `rgb(${Math.round(255 - 82 * L)},${Math.round(255 - 60 * L)},${Math.round(255 - 66 * L)})`); rg.addColorStop(1, 'rgb(244,246,244)');
    q.fillStyle = rg; q.beginPath(); q.moveTo(sx, sy); q.lineTo(sx + Math.cos(a0) * 300, sy + Math.sin(a0) * 300); q.lineTo(sx + Math.cos(a1) * 300, sy + Math.sin(a1) * 300); q.closePath(); q.fill();
  }
  q.filter = 'none';
  X.save(); X.globalCompositeOperation = 'multiply'; X.drawImage(S3, 0, 0, W, H); X.restore();
}
// the sun itself: behind the mid trunks and the giant, a white core and a wide warm halo
function sunDisc(t, L) {
  const [sx, sy] = sunScreen(t), k = lerp(.7, 1, L);
  let rg = X.createRadialGradient(sx, sy, 0, sx, sy, 90); rg.addColorStop(0, `rgba(255,254,244,${k})`); rg.addColorStop(.3, `rgba(255,250,226,${.92 * k})`); rg.addColorStop(1, 'rgba(255,242,204,0)');
  X.fillStyle = rg; X.fillRect(sx - 90, sy - 90, 180, 180);
  X.save(); X.globalCompositeOperation = 'screen'; rg = X.createRadialGradient(sx, sy, 0, sx, sy, 400); rg.addColorStop(0, `rgba(255,226,170,${.5 * L})`); rg.addColorStop(1, 'rgba(255,214,150,0)'); X.fillStyle = rg; X.fillRect(sx - 400, sy - 400, 800, 800); X.restore();
}
function motes(t, L) {
  X.save(); X.globalCompositeOperation = 'screen';
  for (const m of MOTES) {
    const x = m.x + 16 * Math.sin(t * .31 + m.a) + 4 * t, y = m.y + 12 * Math.sin(t * .23 + m.b) - 2.5 * t, f = clamp(shaftField(x, y, t) * 1.3 - .05) * L;
    if (f < .02) continue;
    X.fillStyle = `rgba(255,246,214,${.9 * f})`; X.beginPath(); X.arc(x, y, m.r, 0, TAU); X.fill();
    X.fillStyle = `rgba(255,236,190,${.22 * f})`; X.beginPath(); X.arc(x, y, m.r * 3.2, 0, TAU); X.fill();
  }
  X.restore();
}
function strands(t, L) {
  planeT(X, 1, t); X.lineCap = 'round';
  for (const s of STRANDS) {
    const sw = 3 * Math.sin(t * .6 + s.ph) + 2 * Math.sin(t * 1.3 + s.ph * 2), lit = clamp(1 - Math.abs(s.x - SUN.x) / 620);
    for (let j = 0; j < s.n; j++) {
      const x = s.x + j * 3.4 - s.n * 1.7, len = s.len * (.65 + .35 * h2(j, s.x | 0, 93)), tx = x + sw * (1 + j * .2), ty = s.y + len;
      const gr = X.createLinearGradient(0, s.y, 0, ty); gr.addColorStop(0, '#22443f'); gr.addColorStop(.45, '#3f7356'); gr.addColorStop(1, css(mixc(hex('#7fae48'), hex('#d4e46e'), lit)));
      X.strokeStyle = gr; X.lineWidth = s.w; X.beginPath(); X.moveTo(x, s.y); X.quadraticCurveTo(x + sw * .3, s.y + len * .5, tx, ty); X.stroke();
      const nt = Math.round(len / 9);
      for (let k = 1; k < nt; k++) { const q = k / nt, qx = lerp(x, tx, q * q) + (h2(k, j, s.x | 0) - .5) * 11, qy = s.y + len * q + (h2(k, j + 3, s.x | 0) - .5) * 8, on = h2(k, j + 7, s.x | 0);
        X.fillStyle = on < .45 ? '#2c5548' : css(mixc(hex('#4f8a4a'), hex('#cfe26a'), lit * q * (.5 + on * .5)));
        X.beginPath(); X.ellipse(qx, qy, 1.2 + on * 1.9, 2 + on * 2.8, (on - .5) * 1.5, 0, TAU); X.fill(); }
      if (lit > .2) { X.strokeStyle = `rgba(255,232,160,${.5 * lit * L})`; X.lineWidth = s.w * .6; X.beginPath(); X.moveTo(x + sw * .55, s.y + len * .72); X.quadraticCurveTo(x + sw * .8, s.y + len * .86, tx, ty); X.stroke(); }
    }
  }
  X.setTransform(1, 0, 0, 1, 0, 0);
}
function grass(t, L) {
  planeT(X, 1.15, t);
  for (const b of GRASS.blades) {
    const a = b.lean + .06 * Math.sin(t * 1.15 + b.ph + b.x * .01), tx = b.x + Math.sin(a) * b.h, ty = b.y - Math.cos(a) * b.h, mx = b.x + Math.sin(a) * b.h * .45;
    X.fillStyle = css(b.c); X.beginPath(); X.moveTo(b.x - b.w / 2, b.y); X.quadraticCurveTo(mx - b.w * .3, b.y - b.h * .5, tx, ty); X.quadraticCurveTo(mx + b.w * .4, b.y - b.h * .5, b.x + b.w / 2, b.y); X.fill();
    if (b.tip) {
      const lit = .35 + .65 * clamp(1 - Math.abs(b.x - SUN.x) / 700);
      X.strokeStyle = `rgba(236,214,128,${.75 * lit * L})`; X.lineWidth = 1.3; X.beginPath(); X.moveTo(lerp(b.x, tx, .55) + 1, lerp(b.y, ty, .55)); X.quadraticCurveTo(lerp(mx, tx, .6), lerp(b.y, ty, .8), tx, ty); X.stroke();
    }
  }
  for (const f of GRASS.flowers) {
    const a = .05 * Math.sin(t * 1.1 + f.ph), tx = f.x + Math.sin(a) * f.h, ty = f.y - f.h;
    X.strokeStyle = '#3f6a3a'; X.lineWidth = 1.4; X.beginPath(); X.moveTo(f.x, f.y); X.lineTo(tx, ty); X.stroke();
    for (let k = 0; k < 5; k++) { const q = k / 5 * TAU; X.fillStyle = css(f.c, .95); X.beginPath(); X.ellipse(tx + Math.cos(q) * f.r * .8, ty + Math.sin(q) * f.r * .6, f.r * .7, f.r * .45, q, 0, TAU); X.fill(); }
    X.fillStyle = '#f0c44a'; X.beginPath(); X.arc(tx, ty, f.r * .35, 0, TAU); X.fill();
  }
  X.setTransform(1, 0, 0, 1, 0, 0);
}

function drawFrame(t) {
  const L = lightK(t);
  X.setTransform(1, 0, 0, 1, 0, 0); X.globalCompositeOperation = 'source-over'; X.globalAlpha = 1;
  plane(P.sky, .03, t);
  { const [sx, sy] = sunScreen(t), rg = X.createRadialGradient(sx, sy, 0, sx, sy, 470);
    rg.addColorStop(0, `rgba(255,252,236,${.95 * L})`); rg.addColorStop(.1, `rgba(255,240,200,${.72 * L})`); rg.addColorStop(.4, `rgba(255,226,170,${.3 * L})`); rg.addColorStop(1, 'rgba(255,236,196,0)');
    X.fillStyle = rg; X.fillRect(0, 0, W, H); }
  plane(P.far, .10, t);
  plane(F.a, .14, t, .6, t * 5);
  plane(P.fmid, .22, t);
  plane(F.b, .30, t, .42, t * 7);
  plane(P.mid, .40, t);
  plane(F.c, .48, t, .34, t * 9);
  shadeWedges(t, L); sunDisc(t, L);
  plane(P.clear, .55, t);
  // the giant, on its own layer so the haze can sit on it
  G.setTransform(1, 0, 0, 1, 0, 0); G.clearRect(0, 0, W, H); planeT(G, .55, t);
  const p = drawGiant(G, t, L);
  G.setTransform(1, 0, 0, 1, 0, 0); G.globalCompositeOperation = 'source-atop';
  { const gx = G.createLinearGradient(0, 0, W, 0); for (let i = 0; i <= 8; i++) gx.addColorStop(i / 8, css(fogRGB(i / 8 * W), .08)); G.fillStyle = gx; G.fillRect(0, 0, W, H);
    const gy = G.createLinearGradient(0, 420, 0, 640); gy.addColorStop(0, css(FOG_WARM, 0)); gy.addColorStop(1, css(FOG_WARM, .2)); G.fillStyle = gy; G.fillRect(0, 0, W, H); }
  G.globalCompositeOperation = 'source-over';
  X.drawImage(GC, 0, 0);
  plane(F.d, .6, t, .58, t * 11);
  shafts(t, L); motes(t, L);
  strands(t, L); plane(P.near, 1, t);
  grass(t, L);
  { const gy = X.createLinearGradient(0, 560, 0, 700); gy.addColorStop(0, css(fogRGB(700), 0)); gy.addColorStop(.5, css(fogRGB(700), .12)); gy.addColorStop(1, css(fogRGB(700), 0)); X.fillStyle = gy; X.fillRect(0, 560, W, 140); }
  // bloom: a small, high-contrast, blurred copy screened back on
  { const b = B1.getContext('2d'); b.clearRect(0, 0, 320, 180); b.filter = 'contrast(2.6) brightness(.82) blur(6px)'; b.drawImage(cv, 0, 0, 320, 180); b.filter = 'none';
    X.save(); X.globalCompositeOperation = 'screen'; X.globalAlpha = .13 * L; X.drawImage(B1, 0, 0, W, H); X.restore(); }
  // the light arc: early frames a touch dimmer and cooler
  X.save(); X.globalCompositeOperation = 'multiply'; X.fillStyle = `rgba(206,216,228,${(1 - L) * .4})`; X.fillRect(0, 0, W, H);
  X.globalCompositeOperation = 'soft-light'; X.globalAlpha = .45; X.drawImage(GRAIN, 0, 0, W, H); X.restore();
  // audit probes, in canvas pixels
  if (PROBE.on || typeof ML !== 'undefined') {
    planeT(X, .55, t);
    const top = Math.min(p.by - 330, toW(p, 0, -400)[1]);
    PROBE.box(X, 'giant', p.bx - 190, top, 380, Math.max(p.fl.y, p.fr.y) - top, { keep: true });
    X.setTransform(1, 0, 0, 1, 0, 0);
    const q = pose(ML_prevT(t)); let slide = 0;
    for (const n of ['fl', 'fr']) if (p[n].down && q[n].down) slide = Math.max(slide, Math.abs(p[n].x - q[n].x), Math.abs(p[n].y - q[n].y));
    PROBE.value('footSlide', slide);
    PROBE.value('feetOnFloor', Math.max(...['fl', 'fr'].filter((n) => p[n].down).map((n) => Math.abs(p[n].y - FLOOR)), 0));
    PROBE.edge('plantL', p.fl.down && t >= T.lPlant, q.fl.down && ML_prevT(t) >= T.lPlant);
    PROBE.edge('plantR', p.fr.down && t >= T.rPlant, q.fr.down && ML_prevT(t) >= T.rPlant);
    PROBE.edge('lidOpen', p.fb >= 1, q.fb >= 1);
  }
}
window.drawFrame = drawFrame;
window.__frameJPEG = (t, q = .92) => { drawFrame(clamp(t, 0, DUR - 1e-6)); return q >= 1 ? cv.toDataURL('image/png') : cv.toDataURL('image/jpeg', q); };
window.__ready = Promise.resolve(true);
const params = new URLSearchParams(location.search);
if (!params.has('offline')) {
  const t0 = parseFloat(params.get('t') || 0), start = performance.now();
  (function loop() { drawFrame((t0 + (performance.now() - start) / 1000) % DUR); requestAnimationFrame(loop); })();
}
