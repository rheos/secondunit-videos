// Look test (2026-10-19): the drawing style of Kevin Ngo's robot-arm GIF, laid over the same shot code.
// Only with ?look=arm (ink2.js stands down then). Read off full-size crops of that GIF:
//   1. one ink for every outline, deep navy, heavy and even (no pressure, no colour borrowed from the fill);
//   2. flat fills with a dry-brush speckle, no modelling inside objects;
//   3. the fill sits a little off its line (down and right), so a sliver of paper shows along the upper edges;
//   4. shadows are coloured-pencil hatching cast on the paper, down and to the right, never on the objects;
//   5. inside an object, at most a few light pencil streaks instead of ink hatching.
// ?ground=plain also swaps the film's diagonal stripe ground for plain cream paper, as in the GIF.
'use strict';
const ARM = /[?&]look=arm(&|$)/.test(location.search);
const ARM_PLAIN = /[?&]ground=plain(&|$)/.test(location.search);
const ARM_INK = '#25264a';
let armMask = null, armMaskCtx = null;

function armInit(ctx) {
  if (!ARM) return;
  const HEX = /^#[0-9a-f]{6}$/i;
  const lum = (h) => { const r = parseInt(h.slice(1, 3), 16) / 255, g = parseInt(h.slice(3, 5), 16) / 255, b = parseInt(h.slice(5, 7), 16) / 255; return .2126 * r + .7152 * g + .0722 * b; };
  const isMain = () => X === ctx;
  const scaleNow = () => { const m = ctx.getTransform(); return Math.hypot(m.a, m.b) || 1; };

  // object silhouettes for the cast shadows, drawn with the same transforms as the film canvas
  armMask = document.createElement('canvas'); armMask.width = W; armMask.height = H; armMaskCtx = armMask.getContext('2d');

  // shape bounds on Path2D (PE/PP/PR are consts), so big grounds can be told from objects
  const P2 = Path2D.prototype, grow = (p, x0, y0, x1, y1) => { const b = p._bb || (p._bb = [1e9, 1e9, -1e9, -1e9]); b[0] = Math.min(b[0], x0); b[1] = Math.min(b[1], y0); b[2] = Math.max(b[2], x1); b[3] = Math.max(b[3], y1); };
  for (const m of ['moveTo', 'lineTo']) { const f = P2[m]; P2[m] = function (x, y) { grow(this, x, y, x, y); return f.call(this, x, y); }; }
  { const f = P2.ellipse; P2.ellipse = function (cx, cy, rx, ry, ...r) { const k = Math.max(Math.abs(rx), Math.abs(ry)); grow(this, cx - k, cy - k, cx + k, cy + k); return f.call(this, cx, cy, rx, ry, ...r); }; }
  { const f = P2.arc; P2.arc = function (cx, cy, rr, ...r) { grow(this, cx - rr, cy - rr, cx + rr, cy + rr); return f.call(this, cx, cy, rr, ...r); }; }
  { const f = P2.rect; P2.rect = function (x, y, w, h) { grow(this, Math.min(x, x + w), Math.min(y, y + h), Math.max(x, x + w), Math.max(y, y + h)); return f.call(this, x, y, w, h); }; }
  { const f = P2.addPath; P2.addPath = function (...a) { this._nobb = true; return f.apply(this, a); }; }
  const devW = (bb) => { const m = ctx.getTransform(); return Math.abs((bb[2] - bb[0]) * m.a) + Math.abs((bb[3] - bb[1]) * m.c); };

  // the pen: record polylines so a thick limb stroke can also go into the shadow mask
  const o = {}; for (const m of ['beginPath', 'moveTo', 'lineTo', 'closePath']) o[m] = ctx[m].bind(ctx);
  const PEN = []; let penBad = false;
  ctx.beginPath = () => { PEN.length = 0; penBad = false; o.beginPath(); };
  ctx.moveTo = (x, y) => { PEN.push([[x, y]]); o.moveTo(x, y); };
  ctx.lineTo = (x, y) => { if (!PEN.length) PEN.push([[x, y]]); else PEN[PEN.length - 1].push([x, y]); o.lineTo(x, y); };
  ctx.closePath = () => { const s = PEN[PEN.length - 1]; if (s) s.closed = true; o.closePath(); };
  for (const m of ['arc', 'ellipse', 'quadraticCurveTo', 'bezierCurveTo', 'rect', 'arcTo']) { if (!ctx[m]) continue; const f = ctx[m].bind(ctx); ctx[m] = (...a) => { penBad = true; f(...a); }; }

  // grain: speckle and dry-brush streaks, anchored to the screen so they hold still under moving objects
  const grain = document.createElement('canvas'); grain.width = grain.height = 256; const g = grain.getContext('2d'); const r = M32(4242);
  for (let i = 0; i < 2600; i++) { const s = .8 + r() * 1.6; g.fillStyle = r() < .62 ? `rgba(255,252,240,${.10 + r() * .22})` : `rgba(20,20,50,${.05 + r() * .09})`; g.fillRect(r() * 256, r() * 256, s, s); }
  g.lineCap = 'round';
  for (let i = 0; i < 70; i++) { const x = r() * 256, y = r() * 256, l = 10 + r() * 30, a = -.5 + r() * .3; g.strokeStyle = `rgba(255,250,236,${.06 + r() * .1})`; g.lineWidth = .8 + r(); g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
  const grainPat = ctx.createPattern(grain, 'repeat');

  // ---------- ink ----------
  const _stroke = stroke;
  stroke = function (col, w, a = 1) {
    if (!isMain()) return _stroke(col, w, a);
    const sc = scaleNow(), sw = w * sc;
    // thick strokes (limbs, poles) are solid objects: they cast shadows too
    if (sw >= 4 && !penBad && PEN.length && a > .6) {
      const m = ctx.getTransform(); armMaskCtx.setTransform(m); armMaskCtx.lineWidth = w; armMaskCtx.lineCap = 'round'; armMaskCtx.lineJoin = 'round'; armMaskCtx.strokeStyle = '#000';
      armMaskCtx.beginPath(); for (const s of PEN) { s.forEach(([x, y], i) => (i ? armMaskCtx.lineTo(x, y) : armMaskCtx.moveTo(x, y))); } armMaskCtx.stroke();
    }
    if (col === C.ink) {
      // one heavy, even navy line; the kit's faint second pass becomes a slightly lighter echo
      // thick ink strokes are a limb's outline under its colour: keep the width, only the colour changes;
      // hairlines (strings, faint construction) stay light; everything else becomes the heavy even line
      if (sw > 6) return _stroke(ARM_INK, w, a);
      const target = (a < .7 || sw < 1.3) ? Math.min(2.2, Math.max(1.4, sw * 1.5)) : Math.min(7, Math.max(4.6, sw * 2.6));
      return _stroke(ARM_INK, target / sc, a < .7 ? a * .8 : Math.min(1, a));
    }
    return _stroke(col, w, a);
  };

  // ---------- fills: off the line, grainy, and remembered for the shadow mask ----------
  const _fillP = fillP;
  fillP = function (p, col, a = 1) {
    if (!isMain()) return _fillP(p, col, a);
    const object = a >= .6 && p._bb && !p._nobb && devW(p._bb) < W * .7 && HEX.test(col) && lum(col) > .05;
    if (!object) return _fillP(p, col, a);
    const m = ctx.getTransform();
    ctx.save(); ctx.setTransform(m.a, m.b, m.c, m.d, m.e + 1.6, m.f + 3.0);     // the misregistered fill
    _fillP(p, col, a);
    ctx.clip(p); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.fillStyle = grainPat; ctx.fillRect(0, 0, W, H);
    ctx.restore();
    armMaskCtx.setTransform(m); armMaskCtx.fillStyle = '#000'; armMaskCtx.fill(p);
  };

  // ---------- inside an object: a few light pencil streaks, not ink hatching ----------
  hatch = function (shape, cx, cy, rad, ang, sp, col = C.ink, w = 1, a = .75, cres) {
    if (!isMain() || col !== C.ink) return;
    X.save(); X.clip(shape);
    const ca = Math.cos(ang), sa = Math.sin(ang), nx = -sa, ny = ca;
    X.beginPath();
    for (let k = -rad; k <= rad; k += sp * 3.2) {
      if (R() < .45) continue;
      const o2 = k + jit(sp), px = cx + nx * o2, py = cy + ny * o2, s0 = rnd(-rad, 0), s1 = s0 + rnd(rad * .3, rad);
      X.moveTo(px + ca * s0, py + sa * s0); X.lineTo(px + ca * s1, py + sa * s1);
    }
    _stroke('#fffaf0', w * 1.4, .22); X.restore();
  };

  if (ARM_PLAIN) {
    const cream = '#f3eddc';
    stripes = function () { X.fillStyle = cream; X.fillRect(-W, -H, 3 * W, 3 * H); illDress(); };
    paper = function () { X.fillStyle = cream; X.fillRect(-W, -H, 3 * W, 3 * H); illDress(); };
  }
}

// After the shot is drawn: hatch the shadow (silhouettes moved down-right, minus the silhouettes themselves)
// onto the paper, in blue-violet coloured pencil, cross-hatched where it is near the object.
let armHatchA = null, armHatchB = null;
function armHatchCanvas(seed, ang, sp, alpha, broken) {
  const c = document.createElement('canvas'); c.width = W; c.height = H; const h = c.getContext('2d'); const r = M32(seed);
  h.lineCap = 'round';
  const ca = Math.cos(ang), sa = Math.sin(ang), D = W * 1.3;
  for (let k = -D; k < D; k += sp * (.7 + r() * .6)) {
    const x0 = W / 2 - sa * k, y0 = H / 2 + ca * k;
    h.strokeStyle = `rgba(108,104,170,${alpha * (.6 + r() * .4)})`; h.lineWidth = 1.1 + r() * .9;
    h.beginPath(); let t = -D; h.moveTo(x0 + ca * t, y0 + sa * t);
    while (t < D) {           // a pencil line that lifts now and then
      t += 30 + r() * 60;
      if (r() < broken) { t += 6 + r() * 14; h.moveTo(x0 + ca * t, y0 + sa * t); }
      else h.lineTo(x0 + ca * t + (r() - .5) * 1.5, y0 + sa * t + (r() - .5) * 1.5);
    }
    h.stroke();
  }
  return c;
}
function armPre() { if (!ARM || !armMaskCtx) return; armMaskCtx.setTransform(1, 0, 0, 1, 0, 0); armMaskCtx.clearRect(0, 0, W, H); }
function armPost(ctx, mode) {
  if (!ARM || !armMask || mode !== 'ill') return;
  if (!armHatchA) { armHatchA = armHatchCanvas(77, -1.05, 6.5, .85, .12); armHatchB = armHatchCanvas(78, .35, 8, .6, .2); }
  const L = document.createElement('canvas'); L.width = W; L.height = H; const l = L.getContext('2d');
  const shadow = (src, dx, dy) => {
    const S = document.createElement('canvas'); S.width = W; S.height = H; const s = S.getContext('2d');
    s.drawImage(armMask, dx, dy); s.globalCompositeOperation = 'destination-out'; s.drawImage(armMask, 0, 0);
    s.globalCompositeOperation = 'source-in'; s.drawImage(src, 0, 0); return S;
  };
  l.drawImage(shadow(armHatchA, 74, 52), 0, 0);              // the long cast shadow, single hatch
  l.drawImage(shadow(armHatchB, 28, 20), 0, 0);         // denser cross-hatch close to the object
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(L, 0, 0); ctx.restore();
}
