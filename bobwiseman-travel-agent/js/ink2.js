// Ink 2: the drawing-kit upgrade after Kevin Ngo's own line code (2026-10-19). Loaded after kit.js; it wraps the kit
// primitives, so no act file changes. Three things, all on the film's own canvas only (pixel screens, the O'Hara echo
// and the MVU exit canvas keep the old line):
//   1. outlines and hatching take a darker cut of the colour they sit on, not one brown ink for everything;
//   2. ink lines become filled ribbons whose width and darkness follow a pressure curve, tapered at the ends
//      ("a single even fill is the thing that reads as a computer drawing it");
//   3. opaque fills get a wash: light from the upper left, a darker rim pooled inside the edge.
// ?ink=1 turns it off (the draft 15 look), for before/after.
'use strict';
const INK2 = !/[?&]ink=1(&|$)/.test(location.search) && !/[?&]look=arm(&|$)/.test(location.search); // look=arm: js/arm.js draws instead
let INK2_CTX = null;

function ink2Init(ctx) {
  if (!INK2) return;
  INK2_CTX = ctx;

  // ---------- colour ----------
  const HEX = /^#[0-9a-f]{6}$/i;
  const toRGB = (h) => [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255];
  const toHex = (c) => '#' + c.map((v) => Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, '0')).join('');
  const lum = (h) => { const [r, g, b] = toRGB(h); return .2126 * r + .7152 * g + .0722 * b; };
  function hsl(h) {
    const [r, g, b] = toRGB(h), mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
    if (!d) return [0, 0, l];
    const s = d / (1 - Math.abs(2 * l - 1));
    const hh = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return [hh * 60, s, l];
  }
  function fromHSL(H, S, L) {
    const c = (1 - Math.abs(2 * L - 1)) * S, x = c * (1 - Math.abs(((H / 60) % 2) - 1)), m = L - c / 2;
    const [r, g, b] = H < 60 ? [c, x, 0] : H < 120 ? [x, c, 0] : H < 180 ? [0, c, x] : H < 240 ? [0, x, c] : H < 300 ? [x, 0, c] : [c, 0, x];
    return toHex([r + m, g + m, b + m]);
  }
  const mix = (a, b, t) => { const A = toRGB(a), B = toRGB(b); return toHex(A.map((v, i) => v + (B[i] - v) * t)); };
  const TINT = {}, DARK = {};
  // the outline for a fill: same hue, about half as light, a little of the film's brown ink mixed back in
  // (pale fills like cream or skin carry little colour, so their outline stays quiet instead of turning yellow)
  const tintOf = (f) => TINT[f] || (TINT[f] = (() => {
    const [H, S, L] = hsl(f), chroma = S * (1 - Math.abs(2 * L - 1));
    const So = chroma < .25 ? Math.min(S, .32) : Math.min(.62, S * 1.2 + .08);
    return mix(fromHSL((H + 360) % 360, So, Math.max(.17, Math.min(.36, L * .5))), C.ink, chroma < .25 ? .3 : .12);
  })());
  const darkOf = (f) => DARK[f] || (DARK[f] = (() => { const [H, S, L] = hsl(f); return fromHSL((H + 360) % 360, Math.min(1, S * 1.15), L * .7); })());

  // ---------- which fill an outline belongs to: the last opaque fill at this save depth ----------
  let lastFill = null; const fillStack = [];
  const o = {};
  for (const m of ['save', 'restore', 'beginPath', 'moveTo', 'lineTo', 'closePath']) o[m] = ctx[m].bind(ctx);
  ctx.save = () => { fillStack.push(lastFill); o.save(); };
  ctx.restore = () => { if (fillStack.length) lastFill = fillStack.pop(); o.restore(); };

  // ---------- the pen: record the polylines the kit builds, so stroke() can draw them as ribbons ----------
  const PEN = []; let penBad = false;
  ctx.beginPath = () => { PEN.length = 0; penBad = false; o.beginPath(); };
  ctx.moveTo = (x, y) => { PEN.push([[x, y]]); o.moveTo(x, y); };
  ctx.lineTo = (x, y) => { if (!PEN.length) PEN.push([[x, y]]); else PEN[PEN.length - 1].push([x, y]); o.lineTo(x, y); };
  ctx.closePath = () => { const s = PEN[PEN.length - 1]; if (s && s.length > 1) { s.closed = true; } o.closePath(); };
  for (const m of ['arc', 'ellipse', 'quadraticCurveTo', 'bezierCurveTo', 'rect', 'arcTo', 'roundRect']) {
    if (!ctx[m]) continue; const f = ctx[m].bind(ctx); ctx[m] = (...a) => { penBad = true; f(...a); };
  }
  const isMain = () => X === ctx;
  // device-space box of a set of user-space points
  const devBox = (pts) => { const m = ctx.getTransform(); let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const [x, y] of pts) { const X1 = m.a * x + m.c * y + m.e, Y1 = m.b * x + m.d * y + m.f; if (X1 < x0) x0 = X1; if (X1 > x1) x1 = X1; if (Y1 < y0) y0 = Y1; if (Y1 > y1) y1 = Y1; } return [x0, y0, x1, y1]; };
  // a line belongs to the last fill only if it sits on it (its outline, its hatching), not a wire or string drawn after
  function ownedBy(f) {
    if (!f.bb) return true;
    if (penBad || !PEN.length) return false;
    const pts = []; for (const s of PEN) for (const q of s) pts.push(q);
    const b = devBox(pts), m = Math.max(4, .12 * Math.max(f.bb[2] - f.bb[0], f.bb[3] - f.bb[1]));
    return b[0] >= f.bb[0] - m && b[2] <= f.bb[2] + m && b[1] >= f.bb[1] - m && b[3] <= f.bb[3] + m;
  }
  const scaleNow = () => { const m = ctx.getTransform(); return Math.hypot(m.a, m.b) || 1; };

  // its own random stream, so the kit's R() sequence (and every layout that reads it) is unchanged
  let penFD = -1, penN = 0;
  const penRng = () => { if (FD !== penFD || penN > 1e6) { penFD = FD; penN = 0; } penN++; return M32(((FD + 1) * 7919 + DSEED * 131 + penN * 104729) >>> 0); };

  function ribbon(pts, closed, col, w, a, sc) {
    // resample to an even step along the jittered polyline, then soften the corners the jitter made
    if (closed) pts = pts.concat([pts[0]]);
    let L = 0; const cum = [0];
    for (let i = 1; i < pts.length; i++) { L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); cum.push(L); }
    if (L * sc < 6) return false;
    const step = Math.max(1.6 / sc, Math.min(w * .9, 6 / sc)), n = Math.min(1600, Math.max(4, Math.ceil(L / step)));
    const P = []; let j = 1;
    for (let i = 0; i <= n; i++) {
      const s = L * i / n; while (j < cum.length - 1 && cum[j] < s) j++;
      const t = (s - cum[j - 1]) / ((cum[j] - cum[j - 1]) || 1);
      P.push([pts[j - 1][0] + (pts[j][0] - pts[j - 1][0]) * t, pts[j - 1][1] + (pts[j][1] - pts[j - 1][1]) * t]);
    }
    for (let pass = 0; pass < 2; pass++) for (let i = 1; i < P.length - 1; i++) { P[i] = [(P[i - 1][0] + 2 * P[i][0] + P[i + 1][0]) / 4, (P[i - 1][1] + 2 * P[i][1] + P[i + 1][1]) / 4]; }
    // pressure: slow sine sum, an occasional dig, tapered ends; width and darkness go up together
    const r = penRng(), ph1 = r() * 6.28, ph2 = r() * 6.28, f1 = .5 + r() * .7, f2 = 1.3 + r() * 1.4;
    const digAt = r() < .45 ? r() : -9, digW = .08 + r() * .1;
    const per = Math.max(1, L * sc / 140);
    const tap = Math.max(2.2 * w, 7 / sc), startTap = closed ? tap * .6 : tap;
    const pr = new Float32Array(P.length);
    for (let i = 0; i < P.length; i++) {
      const u = i / (P.length - 1), s = u * L;
      let p = .8 + .16 * Math.sin(u * per * f1 * 6.28 + ph1) + .09 * Math.sin(u * per * f2 * 6.28 + ph2);
      p += .28 * Math.exp(-Math.pow((u - digAt) / digW, 2));
      p *= Math.pow(Math.min(1, s / startTap, (L - s) / tap), .55) * .8 + .2;
      pr[i] = p;
    }
    const half = w * .58;
    ctx.fillStyle = col;
    const CH = 9;
    for (let c0 = 0; c0 < P.length - 1; c0 += CH) {
      const c1 = Math.min(P.length - 1, c0 + CH), Lft = [], Rgt = []; let pAvg = 0;
      for (let i = c0; i <= c1; i++) {
        const a0 = P[Math.max(0, i - 1)], a1 = P[Math.min(P.length - 1, i + 1)];
        let nx = -(a1[1] - a0[1]), ny = a1[0] - a0[0]; const nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
        const hw = half * pr[i]; Lft.push([P[i][0] + nx * hw, P[i][1] + ny * hw]); Rgt.push([P[i][0] - nx * hw, P[i][1] - ny * hw]); pAvg += pr[i];
      }
      pAvg /= (c1 - c0 + 1);
      o.beginPath(); o.moveTo(Lft[0][0], Lft[0][1]);
      for (let i = 1; i < Lft.length; i++) o.lineTo(Lft[i][0], Lft[i][1]);
      for (let i = Rgt.length - 1; i >= 0; i--) o.lineTo(Rgt[i][0], Rgt[i][1]);
      o.closePath();
      ctx.globalAlpha = Math.min(1, a * (.74 + .3 * Math.min(1.1, pAvg)));
      ctx.fill();
    }
    // a round nib at each end of an open line
    if (!closed) for (const e of [0, P.length - 1]) { const rr = half * pr[e] * 1.05; if (rr * sc > .6) { o.beginPath(); o.moveTo(P[e][0] + rr, P[e][1]); ctx.ellipse(P[e][0], P[e][1], rr, rr, 0, 0, 6.2832); ctx.globalAlpha = a * .8; ctx.fill(); } }
    return true;
  }

  // ---------- stroke(): tint, then ribbon where it is a hand line ----------
  const _stroke = stroke;
  stroke = function (col, w, a = 1) {
    if (!isMain()) return _stroke(col, w, a);
    let c = col;
    const sc = scaleNow(), sw = w * sc;
    if (col === C.ink && lastFill && ownedBy(lastFill)) c = tintOf(lastFill.col);
    // dashed, curve-built, many-segment (hatching) and thick strokes keep the plain stroke, only tinted
    const hand = HEX.test(c) && lum(c) < .36 && !penBad && PEN.length && PEN.length <= 16 && sw >= .9 && sw <= 4.6 && !ctx.getLineDash().length;
    if (hand) {
      const keep = PEN.map((s) => s.slice()); const closedFlags = PEN.map((s) => !!s.closed);
      ctx.save(); ctx.globalCompositeOperation = ctx.globalCompositeOperation;
      let drew = 0;
      for (let i = 0; i < keep.length; i++) if (keep[i].length > 1 && ribbon(keep[i], closedFlags[i], c, w, a, sc)) drew++;
      ctx.restore(); ctx.globalAlpha = 1;
      if (drew) return;
    }
    _stroke(c, w, a);
  };

  // ---------- shapes remember their bounds, so a fill knows its size (PE/PP/PR are consts: track it on Path2D) ----------
  const P2 = Path2D.prototype, grow = (p, x0, y0, x1, y1) => { const b = p._bb || (p._bb = [1e9, 1e9, -1e9, -1e9]); b[0] = Math.min(b[0], x0); b[1] = Math.min(b[1], y0); b[2] = Math.max(b[2], x1); b[3] = Math.max(b[3], y1); };
  for (const m of ['moveTo', 'lineTo']) { const f = P2[m]; P2[m] = function (x, y) { grow(this, x, y, x, y); return f.call(this, x, y); }; }
  { const f = P2.ellipse; P2.ellipse = function (cx, cy, rx, ry, ...r) { const k = Math.max(Math.abs(rx), Math.abs(ry)); grow(this, cx - k, cy - k, cx + k, cy + k); return f.call(this, cx, cy, rx, ry, ...r); }; }
  { const f = P2.arc; P2.arc = function (cx, cy, rr, ...r) { grow(this, cx - rr, cy - rr, cx + rr, cy + rr); return f.call(this, cx, cy, rr, ...r); }; }
  { const f = P2.rect; P2.rect = function (x, y, w, h) { grow(this, Math.min(x, x + w), Math.min(y, y + h), Math.max(x, x + w), Math.max(y, y + h)); return f.call(this, x, y, w, h); }; }
  // a path built by addPath (shifted() etc.) gets no bounds and so no wash
  { const f = P2.addPath; P2.addPath = function (...a) { this._bb = null; this._nobb = true; return f.apply(this, a); }; }

  // ---------- fillP(): remember the colour, then wash it ----------
  const _fillP = fillP;
  fillP = function (p, col, a = 1) {
    _fillP(p, col, a);
    if (!isMain() || !HEX.test(col) || a < .6) return;
    const L = lum(col); if (L < .1) return;
    const bb = p._bb, hasBB = bb && !p._nobb && bb[2] >= bb[0];
    lastFill = { col, bb: hasBB ? devBox([[bb[0], bb[1]], [bb[2], bb[1]], [bb[0], bb[3]], [bb[2], bb[3]]]) : null };
    if (!hasBB) return;
    const sc = scaleNow(), wPx = (bb[2] - bb[0]) * sc, hPx = (bb[3] - bb[1]) * sc, m = Math.min(wPx, hPx);
    if (m < 14 || wPx * hPx > W * H * .55) return;
    ctx.save(); ctx.clip(p);
    // light from the upper left
    const g = ctx.createLinearGradient(bb[0], bb[1], bb[2], bb[3]);
    g.addColorStop(0, 'rgba(255,250,236,.20)'); g.addColorStop(.45, 'rgba(255,250,236,0)'); g.addColorStop(1, 'rgba(40,24,10,.13)');
    ctx.globalAlpha = a; ctx.fillStyle = g; ctx.fill(p);
    // colour pooled inside the edge, as a wash dries
    const rim = Math.min(m * .2, 16) / sc;
    ctx.strokeStyle = darkOf(col); ctx.lineJoin = 'round';
    ctx.globalAlpha = .1 * a; ctx.lineWidth = rim * 2; ctx.stroke(p);
    ctx.globalAlpha = .14 * a; ctx.lineWidth = rim * .8; ctx.stroke(p);
    ctx.restore(); ctx.globalAlpha = 1;
  };

  // a new frame starts with no fill to borrow from
  const _paper = paper; paper = function (c) { lastFill = null; return _paper(c); };
}
