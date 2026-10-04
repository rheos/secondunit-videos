// CUT: a silhouette cut-paper kit. Every figure is black card on a light box.
// sheet(color, fn) is one plane of card: fn draws in ink onto an offscreen layer (holes are cut
// with hole()), then the whole sheet is toned (far planes paler, nearer the glow) and laid on the
// sky. Holes show whatever is behind the sheet, exactly like cut paper on glass.
const INK = '#120a06';
let L = null;
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mixh = (a, b, k) => { const A = hex(a), B = hex(b); return '#' + A.map((v, i) => Math.round(lerp(v, B[i], clamp(k))).toString(16).padStart(2, '0')).join(''); };
const mixPal = (a, b, k) => ({ top: mixh(a.top, b.top, k), bot: mixh(a.bot, b.bot, k), glow: mixh(a.glow, b.glow, k) });
const PAL = {
  amber: { top: '#7e3a14', bot: '#eaa65a', glow: '#fff1c8' },
  rose: { top: '#6a1e3a', bot: '#e98f86', glow: '#ffe6d6' },
  violet: { top: '#1c0c3e', bot: '#9a4a8c', glow: '#ffd2ea' },
  blue: { top: '#08142e', bot: '#41709e', glow: '#d6e8f4' },
  green: { top: '#1c3428', bot: '#a7bd78', glow: '#f6f6cc' },
};
const LAYERS = []; let depthL = 0;
function layerCtx(i) {
  if (!LAYERS[i]) { const c = document.createElement('canvas'); c.width = Math.round(W * RS); c.height = Math.round(H * RS); LAYERS[i] = c.getContext('2d'); }
  return LAYERS[i];
}
function sheet(color, fn, o = {}) {
  const c = layerCtx(depthL++), cw = c.canvas.width, ch = c.canvas.height;
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; c.clearRect(0, 0, cw, ch);
  c.setTransform(s.getTransform()); c.fillStyle = INK; c.strokeStyle = INK; c.lineCap = 'round'; c.lineJoin = 'round';
  const prev = L; L = c;
  try { fn(); } finally { L = prev; }
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1;
  if (color !== INK) { c.globalCompositeOperation = 'source-in'; c.fillStyle = color; c.fillRect(0, 0, cw, ch); }
  c.globalCompositeOperation = 'source-over';
  s.save(); s.setTransform(1, 0, 0, 1, 0, 0); s.globalAlpha = o.alpha ?? 1;
  if (o.rim) s.filter = `drop-shadow(0 0 ${o.rim * RS}px ${o.rimC}) drop-shadow(0 0 ${o.rim * .5 * RS}px ${o.rimC})`;
  s.drawImage(c.canvas, 0, 0); s.restore();
  depthL--;
}

// ---- drawing on the current sheet L ----
function pth(pts) { L.beginPath(); pts.forEach(([x, y], i) => i ? L.lineTo(x, y) : L.moveTo(x, y)); L.closePath(); }
function spth(pts) { const n = pts.length, m = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; L.beginPath(); L.moveTo(...m(pts[n - 1], pts[0]));
  for (let i = 0; i < n; i++) { const q = m(pts[i], pts[(i + 1) % n]); L.quadraticCurveTo(pts[i][0], pts[i][1], q[0], q[1]); } L.closePath(); }
function fp(pts, sm = false) { (sm ? spth : pth)(pts); L.fill(); }
function circ(x, y, r) { L.beginPath(); L.arc(x, y, Math.max(.1, r), 0, TAU); L.fill(); }
function ell(x, y, rx, ry, a = 0) { L.beginPath(); L.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), a, 0, TAU); L.fill(); }
function strk(pts, w) { L.lineWidth = w; L.beginPath(); pts.forEach(([x, y], i) => i ? L.lineTo(x, y) : L.moveTo(x, y)); L.stroke(); }
function qstrk(a, c, b, w) { L.lineWidth = w; L.beginPath(); L.moveTo(...a); L.quadraticCurveTo(...c, ...b); L.stroke(); }
function hole(fn) { L.save(); L.globalCompositeOperation = 'destination-out'; L.fillStyle = '#000'; L.strokeStyle = '#000'; fn(); L.restore(); }
function tf(x, y, a, sc, fn) { L.save(); L.translate(x, y); if (a) L.rotate(a); if (sc !== 1) L.scale(sc, sc); fn(); L.restore(); }
function alpha(a, fn) { const p = L.globalAlpha; L.globalAlpha = p * a; fn(); L.globalAlpha = p; }
function tear(x, y, len, w, a) { tf(x, y, a, 1, () => { L.beginPath(); L.moveTo(0, 0); L.bezierCurveTo(len * .45, -w, len, -w * .95, len, 0); L.bezierCurveTo(len, w * .95, len * .45, w, 0, 0); L.fill(); }); }
function starP(x, y, r, n = 5, inner = .45, rot = -Math.PI / 2) { L.beginPath(); for (let i = 0; i < n * 2; i++) { const a = rot + i * Math.PI / n, rr = i % 2 ? r * inner : r; L[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * rr, y + Math.sin(a) * rr); } L.closePath(); L.fill(); }
function scallop(x, y, r, n, d = .12, rot = 0, ry = r) {
  L.beginPath();
  for (let i = 0; i < n; i++) { const a0 = rot + i / n * TAU, a1 = rot + (i + 1) / n * TAU, am = (a0 + a1) / 2, k = 1 + d * 2;
    if (!i) L.moveTo(x + Math.cos(a0) * r, y + Math.sin(a0) * ry);
    L.quadraticCurveTo(x + Math.cos(am) * r * k, y + Math.sin(am) * ry * k, x + Math.cos(a1) * r, y + Math.sin(a1) * ry); }
  L.closePath(); L.fill();
}
// a spiral curl that starts at (px,py) heading along angle `a` and winds `turns` times
function curl(px, py, r, a, dir, turns, w) {
  const a0 = a - dir * Math.PI / 2, cx = px - Math.cos(a0) * r, cy = py - Math.sin(a0) * r, n = Math.max(6, Math.ceil(turns * 28)), pts = [];
  for (let i = 0; i <= n; i++) { const u = i / n, aa = a0 + dir * u * turns * TAU, rr = r * (1 - u * .82); pts.push([cx + Math.cos(aa) * rr, cy + Math.sin(aa) * rr]); }
  strk(pts, w); return [cx, cy];
}
function almond(x, y, rx, ry) { L.beginPath(); L.moveTo(x - rx, y); L.quadraticCurveTo(x, y - ry * 2, x + rx, y); L.quadraticCurveTo(x, y + ry * 2, x - rx, y); L.closePath(); }

// ---- ornament ----
function rosette(x, y, r, rot, n = 12) {
  scallop(x, y, r, n * 2, .07, rot);
  hole(() => {
    for (let i = 0; i < n; i++) { const a = rot + i / n * TAU; tear(x + Math.cos(a) * r * .3, y + Math.sin(a) * r * .3, r * .46, r * .1, a); }
    for (let i = 0; i < n * 2; i++) { const a = rot + (i + .5) / (n * 2) * TAU; circ(x + Math.cos(a) * r * .87, y + Math.sin(a) * r * .87, r * .045); }
    starP(x, y, r * .2, 8, .5, rot);
  });
  circ(x, y, r * .07);
  L.lineWidth = r * .025; L.beginPath(); L.arc(x, y, r * .79, 0, TAU); L.stroke();
}
function tree(x, y, h, seed, bloom = 0, sway = 0) {
  const R = rng(seed), tw = h * .05, cy = y - h * .66, cr = h * .34;
  fp([[x - tw * 1.6, y], [x - tw * .6, y - h * .3], [x - tw * .4, y - h * .55], [x + tw * .4, y - h * .55], [x + tw * .6, y - h * .3], [x + tw * 1.6, y]]);
  for (let i = 0; i < 4; i++) { const a = -Math.PI / 2 + (i - 1.5) * .55; qstrk([x, y - h * .42], [x + Math.cos(a) * cr * .2, y - h * .55], [x + Math.cos(a) * cr * .6 + sway, cy + Math.sin(a) * cr * .5], tw * .55); }
  const bl = [[0, 0, 1], [-.62, .25, .62], [.62, .22, .66], [-.3, -.42, .6], [.34, -.44, .56]];
  const P = bl.map(([bx, by, br]) => [x + bx * cr + sway * (1 - by), cy + by * cr, cr * br * .72, R() * TAU]);
  for (const [cx, cyy, rr, ro] of P) scallop(cx, cyy, rr, 10, .13, ro);
  hole(() => { for (const [cx, cyy, rr, ro] of P) { const n = 7; for (let k = 0; k < n; k++) { const a = ro + k / n * TAU; tear(cx + Math.cos(a) * rr * .2, cyy + Math.sin(a) * rr * .2, rr * .52, rr * .13, a); } circ(cx, cyy, rr * .08); } });
  if (bloom > 0) {
    for (let k = 0; k < 9; k++) {
      const a = -Math.PI * .95 + k / 8 * Math.PI * .9 + (R() - .5) * .2, b = clamp(bloom * 1.6 - k * .06), px = x + Math.cos(a) * cr * 1.05, py = cy + Math.sin(a) * cr * 1.0;
      if (b <= 0) continue;
      const [ex, ey] = curl(px, py, cr * .32 * b, a, k % 2 ? 1 : -1, 1.1 * b, tw * .4);
      if (b > .6) { const fr = cr * .14 * (b - .6) / .4 * 2.5; rosetteMini(px + Math.cos(a) * cr * .35 * b, py + Math.sin(a) * cr * .35 * b, fr, a + k); }
    }
  }
}
function rosetteMini(x, y, r, rot) { scallop(x, y, r, 8, .2, rot); hole(() => { for (let i = 0; i < 6; i++) { const a = rot + i / 6 * TAU; tear(x + Math.cos(a) * r * .15, y + Math.sin(a) * r * .15, r * .55, r * .16, a); } }); circ(x, y, r * .14); }
function dome(x, y, w, h) {
  L.fillRect(x - w * .5, y - h * .45, w, h * .45 + 2);
  L.beginPath(); L.moveTo(x - w * .55, y - h * .45); L.bezierCurveTo(x - w * .9, y - h * .7, x - w * .1, y - h * .82, x, y - h); L.bezierCurveTo(x + w * .1, y - h * .82, x + w * .9, y - h * .7, x + w * .55, y - h * .45); L.fill();
  strk([[x, y - h], [x, y - h * 1.16]], Math.max(1.5, w * .05)); circ(x, y - h * 1.18, w * .06);
  hole(() => { for (let i = -1; i <= 1; i++) { const wx = x + i * w * .26; L.beginPath(); L.moveTo(wx - w * .07, y - h * .1); L.lineTo(wx - w * .07, y - h * .28); L.quadraticCurveTo(wx, y - h * .36, wx + w * .07, y - h * .28); L.lineTo(wx + w * .07, y - h * .1); L.fill(); } });
}
function minaret(x, y, w, h) { L.fillRect(x - w / 2, y - h, w, h + 2); L.fillRect(x - w, y - h * .72, w * 2, w * .5); ell(x, y - h, w * .7, w * 1.1); strk([[x, y - h], [x, y - h - w * 2]], 1.5); }
// a scalloped paper cloud (a pale sheet) with a row of lace holes
function cloud(x, y, w, seed) {
  const R = rng(seed), n = 5;
  for (let i = 0; i < n; i++) { const u = i / (n - 1), r = w * (.13 + .1 * Math.sin(u * Math.PI)) * (.85 + R() * .3); scallop(x - w / 2 + u * w, y - Math.sin(u * Math.PI) * w * .06, r, 9, .14, R() * TAU); }
  L.fillRect(x - w * .5, y - w * .02, w, w * .1);
  hole(() => { for (let i = 0; i < 7; i++) circ(x - w * .36 + i * w * .12, y + w * .02, w * .018); });
}
function hills(scroll, base, amp, seed, wl = 420) {
  L.beginPath(); L.moveTo(-200, H + 200);
  for (let x = -200; x <= W + 200; x += 20) { const wx = x + scroll; L.lineTo(x, base - amp * (noise1(wx / wl, seed) * .7 + noise1(wx / (wl * .37), seed + 9) * .3)); }
  L.lineTo(W + 200, H + 200); L.closePath(); L.fill();
}
const hillY = (wx, base, amp, seed, wl = 420) => base - amp * (noise1(wx / wl, seed) * .7 + noise1(wx / (wl * .37), seed + 9) * .3);
// row of things placed in world x; scroll moves the world left. fn(x, i, rnd)
function row(scroll, spacing, fn, seed = 0, pad = 400) {
  const i0 = Math.floor((scroll - pad) / spacing), i1 = Math.ceil((scroll + W + pad) / spacing);
  for (let i = i0; i <= i1; i++) { const x = i * spacing - scroll + (hash(i * 31 + seed) - .5) * spacing * .3; fn(x, i, hash(i * 17 + seed * 7)); }
}
// an ornate telegraph pole: onion finial, two arms with scroll brackets. returns the insulator tips.
function pole(x, y, h) {
  const w = Math.max(3, h * .018);
  fp([[x - w * 1.5, y], [x - w, y - h], [x + w, y - h], [x + w * 1.5, y]]);
  L.beginPath(); L.moveTo(x - w * 1.6, y - h); L.bezierCurveTo(x - w * 4.2, y - h - w * 2.6, x - w * .6, y - h - w * 5, x, y - h - w * 8); L.bezierCurveTo(x + w * .6, y - h - w * 5, x + w * 4.2, y - h - w * 2.6, x + w * 1.6, y - h); L.fill();
  const tips = [];
  [[y - h * .9, h * .2], [y - h * .79, h * .15]].forEach(([yy, len], j) => {
    L.fillRect(x - len, yy - w * .5, len * 2, w);
    for (const d of [-1, 1]) {
      curl(x + d * w, yy + w * .4, len * .26, d > 0 ? .25 : Math.PI - .25, d, .9, w * .45);
      for (const f of [.55, 1]) { ell(x + d * len * f, yy - w * 1.1, w * .55, w * 1.1); if (f === 1 && j === 0) tips.push([x + d * len, yy - w * 2]); }
      circ(x + d * len, yy, w * .6);
    }
  });
  return tips;
}
function wires(tipsA, tipsB, sag, w) { for (let i = 0; i < Math.min(tipsA.length, tipsB.length); i++) { const a = tipsA[i], b = tipsB[i]; qstrk(a, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + sag], b, w); } }
// grass and fern tufts along an edge
function tufts(scroll, y, h, seed) {
  row(scroll, 46, (x, i, r) => {
    const hh = h * (.5 + r); L.beginPath(); L.moveTo(x - 9, y + 2);
    for (let k = 0; k < 3; k++) { const tx = x - 6 + k * 6 + (r - .5) * 8, ty = y - hh * (k === 1 ? 1 : .7); L.quadraticCurveTo(tx - 3, y - hh * .3, tx, ty); L.quadraticCurveTo(tx + 1, y - hh * .3, tx + 4, y + 2); }
    L.closePath(); L.fill();
  }, seed, 60);
}
// curling foreground vines rising from an edge
function vines(scroll, y, h, seed, spacing = 330) {
  row(scroll, spacing, (x, i, r) => {
    const hh = h * (.6 + r * .6), lean = (hash(i * 5 + seed) - .5) * .6, sw = Math.max(3, h * .045);
    const top = [x + lean * hh, y - hh];
    qstrk([x, y + 4], [x - lean * hh * .4, y - hh * .5], top, sw);
    curl(top[0], top[1], hh * .16, -Math.PI / 2 + lean, r > .5 ? 1 : -1, 1.3, sw * .8);
    for (let k = 0; k < 4; k++) {
      const u = .25 + k * .17, px = lerp(x, top[0], u) - lean * hh * .2 * Math.sin(u * Math.PI), py = lerp(y, top[1], u), d = k % 2 ? 1 : -1;
      if (k % 2) tear(px, py, hh * .2, hh * .05, -Math.PI / 2 + d * 1.0); else curl(px, py, hh * .08, -Math.PI / 2 + d * .9, d, 1, sw * .55);
    }
  }, seed, 200);
}

// ---- the plane, side view. local units: origin on the road under his middle, facing +x ----
// passes: 'back' = far wing, far engine, far stabiliser (a slightly paler sheet);
// 'body' = fin, fuselage, eye, hinged jaw, tyres; 'wing' = near wing, near engine and prop.
const FUSE = [[300, -178], [288, -236], [214, -276], [60, -284], [-120, -270], [-262, -250], [-348, -244], [-362, -216], [-306, -184], [-232, -138], [-110, -104], [60, -97], [200, -97], [266, -114]];
const EYE = [206, -213, 40, 25];
function prop(cx, cy, R, spin, sx = .32) {
  alpha(.13, () => ell(cx, cy, R * sx, R));
  for (let g = 2; g >= 0; g--) alpha(g ? .3 / g : 1, () => {
    for (let i = 0; i < 3; i++) {
      const a = spin - g * .3 + i * TAU / 3, tx = cx + Math.sin(a) * R * sx, ty = cy + Math.cos(a) * R, nx = -(ty - cy) / R * R * .1, ny = (tx - cx) / (R * sx) * R * .1 * sx;
      L.beginPath(); L.moveTo(cx, cy); L.quadraticCurveTo((cx + tx) / 2 + nx, (cy + ty) / 2 + ny, tx, ty); L.quadraticCurveTo((cx + tx) / 2 - nx * .3, (cy + ty) / 2 - ny * .3, cx, cy); L.fill();
    }
  });
  circ(cx, cy, R * .17);
}
function planeSide(o, pass) {
  const { q = 0, look = [.6, 0], lid = 0, low = 0, brow = [0, 0], open = 0, bob = 0, pitch = 0, hop = 0, rudder = 0 } = o;
  const spin = o.spin ?? q * TAU * 2.3, roll = o.roll ?? q * 11;
  const body = (fn) => { L.save(); L.translate(0, -hop - bob); L.translate(-170, -50); L.rotate(-pitch); L.translate(170, 50); fn(); L.restore(); };
  if (pass === 'back') {
    body(() => {
      fp([[170, -186], [130, -198], [-110, -204], [-176, -197], [-168, -186], [-100, -180], [150, -178]], true);
      ell(-60, -176, 52, 15); prop(-6, -176, 38, spin + 1.3);
      fp([[-262, -238], [-326, -244], [-382, -282], [-350, -280]], true);
    });
    return;
  }
  if (pass === 'wing') {
    body(() => {
      const WG = [[214, -122], [176, -136], [-90, -142], [-200, -132], [-212, -118], [-110, -106], [176, -108]];
      fp(WG, true);
      hole(() => { for (let k = 0; k < 8; k++) tear(-170 + k * 44, -124, 30, 5, 0); circ(190, -122, 4); });
      fp([[200, -114], [196, -64], [80, -70], [64, -112]], true);                 // nacelle slung under the wing, ahead of the tyre
      ell(202, -89, 9, 21);
      hole(() => { for (let k = 0; k < 3; k++) circ(100 + k * 28, -90, 4.5); });
      prop(210, -89, 44, spin, .42);
    });
    return;
  }
  // tyres (they do not bob): black rubber, spoke cut-outs turning, a notched tread
  for (const tx of [120, -170]) {
    circ(tx, -50, 50);
    hole(() => {
      for (let k = 0; k < 5; k++) { const a = roll + k * TAU / 5; tear(tx + Math.cos(a) * 12, -50 + Math.sin(a) * 12, 27, 7.5, a); }
      for (let k = 0; k < 14; k++) { const a = roll + k * TAU / 14; circ(tx + Math.cos(a) * 46, -50 + Math.sin(a) * 46, 3); }
    });
    circ(tx, -50, 9);
  }
  body(() => {
    // fin with filigree, and a hinged rudder
    fp([[-228, -246], [-286, -400], [-312, -420], [-348, -420], [-356, -240]], true);
    tf(-352, -250, rudder, 1, () => fp([[4, -165], [-24, -168], [-40, 4], [-4, 8]], true));
    hole(() => { curl(-300, -300, 34, -Math.PI / 2, 1, 1.2, 6); tear(-330, -260, 70, 9, -Math.PI / 2 - .25); starP(-318, -372, 13, 5, .45); });
    fp(FUSE, true);
    fp([[-250, -214], [-330, -220], [-394, -170], [-350, -164]], true);       // near stabiliser
    // fenders over the tyres
    for (const tx of [120, -170]) { L.beginPath(); L.arc(tx, -50, 64, Math.PI * 1.03, Math.PI * 1.97); L.arc(tx, -50, 56, Math.PI * 1.97, Math.PI * 1.03, true); L.closePath(); L.fill(); }
    hole(() => {
      for (let k = 0; k < 6; k++) circ(-262 + k * 54, -212, 11.5);           // cabin windows
      for (let k = 0; k < 17; k++) { const x = -300 + k * 25; tf(x, -167 + (x + 300) * .03, Math.PI / 4, 1, () => L.fillRect(-4, -4, 8, 8)); } // diamond cheatline
      // the mouth: a smiling slit along the lip line, curling up at the corner
      L.lineWidth = 3.4; L.beginPath(); L.moveTo(296, -147); L.quadraticCurveTo(220, -141, 172, -150); L.stroke();
      curl(172, -150, 7, Math.PI + .5, 1, .6, 3.4);
      // brow: a cut slit; raise lifts it, tilt > 0 drops the front end (cross), < 0 lifts it (worried)
      const [raise, tilt] = brow, by = -248 - raise * 9;
      L.lineWidth = 6; L.beginPath(); L.moveTo(172, by + tilt * 7); L.quadraticCurveTo(206, by - 9, 240, by - tilt * 7 + 2); L.stroke();
    });
    // the eye: an almond cut-out in the windscreen, a pupil on a pin, lids sliding over it
    const [ex, ey, rx, ry] = EYE;
    hole(() => { almond(ex, ey, rx, ry); L.fill(); });
    L.save(); almond(ex, ey, rx, ry); L.clip();
    circ(ex + clamp(look[0], -1.2, 1.2) * rx * .52, ey + clamp(look[1], -1.2, 1.2) * ry * .5, 12.5);
    if (lid > 0) L.fillRect(ex - rx - 2, ey - ry * 1.4, rx * 2 + 4, ry * 2.8 * lid);
    if (low > 0) L.fillRect(ex - rx - 2, ey + ry * 1.4 - ry * 2.8 * low, rx * 2 + 4, ry * 2.8 * low);
    L.restore();
    // the hinged jaw: the chin of the nose swings down on a pin; teeth show in the gap
    if (open > .02) {
      const a = open * .38;
      hole(() => { L.save(); spth(FUSE); L.clip(); L.fillRect(160, -147, 170, 52); L.restore(); });
      for (const x of [214, 236]) { L.beginPath(); L.roundRect(x, -147, 17, 14, 4); L.fill(); }
      L.save(); L.translate(160, -147); L.rotate(a); L.translate(-160, 147);
      L.save(); L.beginPath(); L.rect(160, -147, 170, 52); L.clip(); spth(FUSE); L.fill(); L.restore();
      L.restore();
    }
  });
}

// ---- the plane from above (overhead shot). facing +x; wings span y ----
function planeTop(o) {
  const { q = 0, look = [.3, .7], lid = 0 } = o, spin = q * TAU * 2.3, roll = q * 11;
  for (const tx of [130, -170]) for (const d of [-1, 1]) {
    L.fillRect(tx - 36, d * 62 - 13, 72, 26);
    hole(() => { for (let k = 0; k < 6; k++) { const x = tx - 36 + ((k * 13 + roll * 20) % 78); if (x < tx + 34) L.fillRect(x, d * 62 - 9, 4, 18); } });
  }
  const WG = [[110, -40], [60, -330], [32, -470], [-10, -490], [-42, -470], [-60, -330], [-58, -40]];
  for (const d of [-1, 1]) {
    fp(WG.map(([x, y]) => [x, y * d]), true);
    hole(() => { for (let k = 0; k < 8; k++) tear(18 - k * 3, d * (80 + k * 46), 30, 7, d > 0 ? Math.PI / 2 + .1 : -Math.PI / 2 - .1); });
    for (const y of [170, 320]) {
      fp([[150, d * y - 18], [160, d * y], [150, d * y + 18], [-30, d * y + 14], [-40, d * y - 14]], true);
      const c = Math.cos(spin + y), len = 64 * Math.abs(c) + 8;
      alpha(.15, () => L.fillRect(164, d * y - 64, 7, 128));
      L.fillRect(163, d * y - len, 9, len * 2); circ(168, d * y, 10);
    }
  }
  fp([[-250, -14], [-300, -190], [-336, -200], [-352, -180], [-342, -14], [-342, 14], [-352, 180], [-336, 200], [-300, 190], [-250, 14]], true);
  const FT = [[318, 0], [300, -44], [230, -58], [-120, -56], [-300, -36], [-370, -12], [-370, 12], [-300, 36], [-120, 56], [230, 58], [300, 44]];
  fp(FT, true);
  hole(() => { for (const d of [-1, 1]) for (let k = 0; k < 8; k++) circ(-250 + k * 46, d * 38, 8); starP(-150, 0, 18, 5, .45, 0); });
  // two windscreen eyes on the nose, looking about
  for (const d of [-1, 1]) {
    const ex = 238, ey = d * 24;
    hole(() => { almond(ex, ey, 28, 13); L.fill(); });
    L.save(); almond(ex, ey, 28, 13); L.clip(); circ(ex + look[0] * 13, ey + look[1] * 7, 9.5); if (lid > 0) L.fillRect(ex - 30, ey - 20, 60, 40 * lid); L.restore();
  }
}

// ---- cars ----
// side view, facing +x, origin on the ground under the middle. stretch lengthens the back half (limo).
function carSide(q, stretch = 1, seed = 0, speed = 1) {
  const X = (v) => v < 0 ? v * stretch : v, roll = q * 26 * speed;
  const lim = stretch > 1.2, rEnd = lim ? X(-150) + 70 : X(-50), rDown = lim ? X(-150) + 30 : X(-88);
  fp([[150, -30], [156, -54], [120, -62], [62, -66], [32, -100], [rEnd, -103], [rDown, -68], [X(-150), -64], [X(-176), -92], [X(-178), -58], [X(-162), -30]], true);
  const wb = lim ? rEnd + 10 : X(-44), n = lim ? Math.round(stretch * 2.2) : 1, ww = (-10 - wb) / n;
  hole(() => {
    fp([[26, -92], [-2, -92], [-2, -68], [52, -68]]);
    for (let k = 0; k < n; k++) { const x1 = -10 - k * ww, x2 = -10 - (k + 1) * ww + 6; fp([[x1, -94], [x2, -94], [x2, -68], [x1, -68]]); }
    const n2 = Math.round(8 * stretch); for (let k = 0; k <= n2; k++) circ(lerp(X(-140), 120, k / n2), -44, 2.6);
  });
  // heads in the windows: a driver in a cap; limo passengers in top hats
  circ(16, -78, 9); L.fillRect(8, -90, 20, 5);
  if (stretch > 1.2) for (let k = 0; k < n; k++) { const x = -10 - (k + .5) * ww + 3; circ(x, -76, 8); L.fillRect(x - 6, -100, 12, 14); L.fillRect(x - 10, -87, 20, 3); if (k % 3 === 1) { strk([[x + 10, -74], [x + 18, -88]], 2); fp([[x + 14, -98], [x + 24, -98], [x + 19, -88]]); } }
  for (const wx of [92, X(-104)]) {
    circ(wx, -26, 26);
    hole(() => { for (let k = 0; k < 6; k++) { const a = roll + k * TAU / 6; tear(wx + Math.cos(a) * 6, -26 + Math.sin(a) * 6, 15, 4.5, a); } });
    circ(wx, -26, 5);
  }
}
function carTop(q, stretch = 1) {
  const X = (v) => v < 0 ? v * stretch : v;
  for (const wx of [80, X(-80)]) for (const d of [-1, 1]) L.fillRect(wx - 22, d * 46 - 8, 44, 16);
  fp([[140, 0], [132, -40], [100, -48], [X(-120), -48], [X(-150), -54], [X(-160), -30], [X(-160), 30], [X(-150), 54], [X(-120), 48], [100, 48], [132, 40]], true);
  hole(() => { fp([[78, -36], [96, 0], [78, 36], [52, 30], [52, -30]], true); fp([[X(-100), -30], [X(-100), 30], [X(-120), 26], [X(-120), -26]]);
    if (stretch > 1.2) for (let k = 0; k < Math.round(stretch * 2); k++) { const x = -10 - k * 40; L.fillRect(x - 12, -24, 24, 48); } });
  for (const d of [-1, 1]) ell(48, d * 52, 7, 4);
  if (stretch > 1.2) for (let k = 0; k < Math.round(stretch * 2); k++) { const x = -10 - k * 40; circ(x, -8, 9); circ(x, 10, 9); }
}
// velvet-rope stanchion (side), and swags of scalloped rope between two of them
function stanchion(x, y, h) {
  ell(x, y - 4, 22, 7); fp([[x - 10, y - 6], [x - 4, y - 20], [x + 4, y - 20], [x + 10, y - 6]]);
  L.fillRect(x - 3.5, y - h, 7, h); ell(x, y - h * .55, 7, 5); circ(x, y - h - 9, 11); strk([[x, y - h - 18], [x, y - h - 28]], 2.5); circ(x, y - h - 30, 3.5);
}
function swag(a, b, drop, w) {
  qstrk(a, [(a[0] + b[0]) / 2, a[1] + drop * 2], b, w);
  const m = [(a[0] + b[0]) / 2, a[1] + drop]; for (let k = 1; k < 6; k++) { const u = k / 6, x = lerp(a[0], b[0], u), y = (1 - u) * (1 - u) * a[1] + 2 * u * (1 - u) * (a[1] + drop * 2) + u * u * b[1]; circ(x, y + w * .5, w * .38); }
  fp([[m[0] - 5, m[1] + 4], [m[0] + 5, m[1] + 4], [m[0] + 8, m[1] + 26], [m[0] - 8, m[1] + 26]]);  // tassel
}
// the sky: a toned light box. tint graded top to bottom, a soft glow where the lamp is
function skyBox(p, gx, gy, gr) {
  s.fillStyle = vgrad(0, H, [[0, p.top], [.62, p.bot], [1, mixh(p.bot, p.glow, .25)]]); s.fillRect(-W, -H, W * 3, H * 3);
  s.fillStyle = rgrad(gx, gy, 0, gr, [[0, p.glow], [.35, p.glow + 'aa'], [1, p.glow + '00']]); s.fillRect(-W, -H, W * 3, H * 3);
}
// the man in the moon: a pale crescent whose inner edge is his face; he can blink and mouth along
function moon(x, y, r, col, blink = 0, mouth = 0) {
  sheet(col, () => {
    circ(x, y, r);
    hole(() => circ(x - r * .45, y - r * .05, r * .85));
    const ix = x + r * .4;
    fp([[ix - 2, y - r * .22], [ix - r * .2, y + r * .04], [ix + 2, y + r * .06]]);                 // nose
    tf(ix - 2, y + r * .2, mouth * .5, 1, () => fp([[0, -r * .03], [-r * .1, r * .02 + mouth * r * .06], [r * .05, r * .08]]));
    fp([[ix - 4, y + r * .3], [ix - r * .1, y + r * .36], [ix + 6, y + r * .42]]);                   // chin
    hole(() => { L.save(); L.translate(x + r * .58, y - r * .3); L.scale(1, Math.max(.08, 1 - blink)); almond(0, 0, r * .1, r * .05); L.fill(); L.restore(); });
  });
}
