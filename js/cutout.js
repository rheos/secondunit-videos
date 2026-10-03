// TEST, song 71.0 - 91.0: "I'm an airplane on the highway / and I feel so strange / mnuh nuh nuh /
// I'm an airplane on the highway / and I'm sick of the passing lane".
// Cut-out animation in the Gilliam manner, built from images on disk: the plane still (keyed in code and
// cut into hinged puppet pieces) and two collage plates (cut into parallax strips). 12 drawings a second.
// Every frame is a pure function of song time t.
(() => {
  const PAPER = '#f3eee0', INK = '#1d150e';
  const HS = 0.5;                          // plane pieces are baked at half the source resolution
  const K = Math.min(1, RS * 1.5);         // world pieces are baked at this many canvas px per world px
  const A = {};
  const img = (src) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('missing ' + src)); i.src = src; });
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; };

  // ---------- shapes (in whatever coordinate space the caller uses) ----------
  function shapePath(g, sh, k = 1, ox = 0, oy = 0) {
    g.beginPath();
    if (sh.poly) { sh.poly.forEach(([x, y], i) => { const X = (x - ox) * k, Y = (y - oy) * k; i ? g.lineTo(X, Y) : g.moveTo(X, Y); }); g.closePath(); }
    else if (sh.ell) { const [cx, cy, rx, ry] = sh.ell; g.ellipse((cx - ox) * k, (cy - oy) * k, rx * k, ry * k, 0, 0, TAU); }
    else if (sh.rect) { const [x, y, w, h] = sh.rect; g.rect((x - ox) * k, (y - oy) * k, w * k, h * k); }
  }
  function bbox(shapes) {
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; const add = (x, y) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); };
    for (const sh of shapes) { if (sh.poly) sh.poly.forEach(([x, y]) => add(x, y)); else if (sh.ell) { const [cx, cy, rx, ry] = sh.ell; add(cx - rx, cy - ry); add(cx + rx, cy + ry); } else if (sh.rect) { const [x, y, w, h] = sh.rect; add(x, y); add(x + w, y + h); } }
    return [x0, y0, x1, y1];
  }
  // a scissor-cut rectangle: straight-ish edges with a little hand wobble
  function snipRect(w, h, seed, wob = 4, step = 60) {
    const r = rng(seed), pts = [], J = () => (r() - .5) * 2 * wob;
    const edge = (x0, y0, x1, y1) => { const n = Math.max(2, Math.round(Math.hypot(x1 - x0, y1 - y0) / step)); for (let i = 0; i < n; i++) { const k = i / n; pts.push([lerp(x0, x1, k) + J(), lerp(y0, y1, k) + J()]); } };
    edge(0, 0, w, 0); edge(w, 0, w, h); edge(w, h, 0, h); edge(0, h, 0, 0);
    return pts;
  }
  function silhouette(c, col) { const o = mk(c.width, c.height), g = o.getContext('2d'); g.drawImage(c, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = col; g.fillRect(0, 0, o.width, o.height); return o; }
  // bake the white scissor rim and the shadow silhouette into a piece
  function finish(p, rr, rimCol = PAPER) {
    const c = p.c, out = mk(c.width, c.height), g = out.getContext('2d');
    if (rr > 0) { const sil = silhouette(c, rimCol); for (let i = 0; i < 24; i++) { const a = i / 24 * TAU; g.drawImage(sil, Math.cos(a) * rr, Math.sin(a) * rr); g.drawImage(sil, Math.cos(a) * rr * .5, Math.sin(a) * rr * .5); } }
    g.drawImage(c, 0, 0); p.c = out; p.sh = silhouette(out, INK); return p;
  }
  // cut a piece: shapes in "orig" space, drawSrc paints the source so that orig (x,y) lands at canvas ((x-ox)k,(y-oy)k)
  function cut(drawSrc, shapes, k, rr, extra = {}) {
    const [x0, y0, x1, y1] = bbox(shapes), padO = (rr + 3) / k;
    const ox = x0 - padO, oy = y0 - padO, ow = x1 - x0 + 2 * padO, oh = y1 - y0 + 2 * padO;
    const c = mk(ow * k, oh * k), g = c.getContext('2d');
    g.fillStyle = '#fff'; for (const sh of shapes) { shapePath(g, sh, k, ox, oy); g.fill(); }
    g.globalCompositeOperation = 'source-in'; g.imageSmoothingQuality = 'high'; drawSrc(g, k, ox, oy);
    return finish({ c, ox, oy, ow, oh, k, ...extra }, rr);
  }
  // draw a baked piece; orig coords; optional rotation about pivot and shadow
  let SH = [0, 0], SHA = .42;
  function put(p, ang = 0, dx = 0, dy = 0, piv = p.piv, shadow = true) {
    s.save(); s.translate(dx, dy);
    if (ang && piv) { s.translate(piv[0], piv[1]); s.rotate(ang); s.translate(-piv[0], -piv[1]); }
    if (shadow && p.sh) { s.globalAlpha = SHA; s.drawImage(p.sh, p.ox + SH[0], p.oy + SH[1], p.ow, p.oh); s.globalAlpha = 1; }
    s.drawImage(p.c, p.ox, p.oy, p.ow, p.oh);
    s.restore();
  }
  // brass split pin
  function pin(x, y, r) {
    s.fillStyle = 'rgba(20,12,6,.45)'; s.beginPath(); s.arc(x + r * .35, y + r * .45, r, 0, TAU); s.fill();
    s.fillStyle = rgrad(x - r * .35, y - r * .35, r * .1, r * 1.1, [[0, '#fff3c0'], [.35, '#d8a640'], [.8, '#8a5a18'], [1, '#4a2e08']]);
    s.beginPath(); s.arc(x, y, r, 0, TAU); s.fill();
    s.strokeStyle = 'rgba(60,35,5,.8)'; s.lineWidth = r * .18; s.beginPath(); s.moveTo(x - r * .5, y + r * .1); s.lineTo(x + r * .5, y - r * .1); s.stroke();
  }

  // ---------- the plane puppet (coords in the source still, 2688 x 1520) ----------
  const AX = 1450, AY = 1350;              // anchor: ground under the front wheels
  const JAW = [[1765, 773], [1810, 798], [1900, 806], [1980, 793], [2040, 768], [2058, 750], [2078, 790], [2062, 862], [2012, 922], [1930, 958], [1850, 948], [1790, 898], [1752, 832], [1748, 795]];
  const JAW_PIV = [1766, 776];
  const FIN_TOP = [[745, 568], [755, 300], [772, 200], [840, 150], [930, 215], [990, 360], [1040, 450], [1078, 500]];
  const FIN_PIV = [800, 566];
  const PROPS = [
    { hub: [1410, 915], hubR: 70, w: 80, blades: [[-71.6, 242], [150.5, 270], [53.1, 230]] },
    { hub: [2275, 875], hubR: 60, w: 74, blades: [[-113.8, 240], [31.3, 170], [121.4, 216]] },
  ];
  const WHEELS = [
    { tyre: [870, 1135, 106, 121], hub: [812, 1140, 45, 88], strut: [875, 940, 80, 110] },
    { tyre: [1192, 1235, 130, 138], hub: [1132, 1240, 62, 122], strut: [1165, 1060, 100, 100] },
    { tyre: [1982, 1194, 139, 131], hub: [1920, 1205, 68, 112], strut: [1895, 970, 110, 130] },
  ];
  const EYES = [
    { white: [1735, 500, 60, 70], pupil: [1782, 520, 33, 41] },
    { white: [1893, 474, 62, 68], pupil: [1932, 505, 31, 41] },
  ];
  function bladePoly(hx, hy, angDeg, L, w) {
    const a = angDeg * Math.PI / 180, ux = Math.cos(a), uy = Math.sin(a), nx = -uy, ny = ux, pts = [];
    const side = [[10, .55], [L * .35, .9], [L * .7, 1], [L - w * .5, .95]];
    side.forEach(([r, k]) => pts.push([hx + ux * r + nx * w * .5 * k, hy + uy * r + ny * w * .5 * k]));
    for (let i = 1; i < 8; i++) { const th = i / 8 * Math.PI; const r = L - w * .5 + Math.sin(th) * w * .5, o = Math.cos(th) * w * .5 * .95; pts.push([hx + ux * r + nx * o, hy + uy * r + ny * o]); }
    side.slice().reverse().forEach(([r, k]) => pts.push([hx + ux * r - nx * w * .5 * k, hy + uy * r - ny * w * .5 * k]));
    return pts;
  }
  const propShapes = (P) => [{ ell: [P.hub[0], P.hub[1], P.hubR, P.hubR] }, ...P.blades.map(([a, L]) => ({ poly: bladePoly(P.hub[0], P.hub[1], a, L, P.w) }))];

  function keyGreen(im) {
    const c = mk(im.width, im.height), g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(im, 0, 0);
    const d = g.getImageData(0, 0, c.width, c.height), a = d.data;
    for (let i = 0; i < a.length; i += 4) {
      const r = a[i], gg = a[i + 1], b = a[i + 2], m = Math.max(r, b), sp = gg - m;
      if (sp > 0) { a[i + 3] = Math.round(255 * (1 - clamp((sp - 22) / 40))); a[i + 1] = m; }   // alpha from green dominance, then despill
    }
    g.putImageData(d, 0, 0);
    const h = mk(im.width * HS, im.height * HS), hg = h.getContext('2d'); hg.imageSmoothingQuality = 'high'; hg.drawImage(c, 0, 0, h.width, h.height);
    // drop the last near-transparent fringe so no green-dark halo survives the downscale
    const hd = hg.getImageData(0, 0, h.width, h.height), ha = hd.data;
    for (let i = 0; i < ha.length; i += 4) { const al = ha[i + 3]; ha[i + 3] = al < 40 ? 0 : Math.min(255, Math.round((al - 40) * 255 / 175)); }
    hg.putImageData(hd, 0, 0);
    return h;
  }
  // fill the propellers' footprint from the surroundings (diffusion), so the spinning paper prop has no ghost behind it
  function inpaint(c, shapes, k, dil) {
    const g = c.getContext('2d', { willReadFrequently: true });
    const [bx0, by0, bx1, by1] = bbox(shapes).map((v) => v * k);
    const x0 = Math.max(0, Math.floor(bx0 - dil * k - 4)), y0 = Math.max(0, Math.floor(by0 - dil * k - 4));
    const x1 = Math.min(c.width, Math.ceil(bx1 + dil * k + 4)), y1 = Math.min(c.height, Math.ceil(by1 + dil * k + 4)), w = x1 - x0, h = y1 - y0;
    const m = mk(w, h), mg = m.getContext('2d'); mg.fillStyle = mg.strokeStyle = '#fff'; mg.lineWidth = dil * 2 * k; mg.lineJoin = 'round';
    for (const sh of shapes) { shapePath(mg, sh, k, x0 / k, y0 / k); mg.fill(); mg.stroke(); }
    const md = mg.getImageData(0, 0, w, h).data, d = g.getImageData(x0, y0, w, h), a = d.data, n = w * h;
    const ch = [0, 1, 2, 3].map(() => new Float32Array(n)), M = new Uint8Array(n);
    let acc = [0, 0, 0, 0], cnt = 0;
    for (let i = 0; i < n; i++) { const al = a[i * 4 + 3] / 255; for (let q = 0; q < 3; q++) ch[q][i] = a[i * 4 + q] * al; ch[3][i] = al * 255; M[i] = md[i * 4 + 3] > 10 ? 1 : 0; }
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) { const i = y * w + x; if (!M[i] && (M[i - 1] || M[i + 1] || M[i - w] || M[i + w])) { for (let q = 0; q < 4; q++) acc[q] += ch[q][i]; cnt++; } }
    for (let i = 0; i < n; i++) if (M[i]) for (let q = 0; q < 4; q++) ch[q][i] = acc[q] / Math.max(1, cnt);
    for (let it = 0; it < 700; it++) for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) { const i = y * w + x; if (!M[i]) continue; for (let q = 0; q < 4; q++) ch[q][i] = (ch[q][i - 1] + ch[q][i + 1] + ch[q][i - w] + ch[q][i + w]) * .25; }
    for (let i = 0; i < n; i++) if (M[i]) { const al = ch[3][i] / 255; a[i * 4 + 3] = al < .7 ? 0 : 255; const gn = (hash(i * 13 + 7) - .5) * 26 + (hash((i >> 3) * 31 + 5) - .5) * 14; for (let q = 0; q < 3; q++) a[i * 4 + q] = al > .01 ? clamp(Math.round(ch[q][i] / al + gn), 0, 255) : 0; }
    g.putImageData(d, x0, y0);
  }

  const PL = {};
  function buildPlane(im) {
    const key = keyGreen(im);
    const fromKey = (src) => (g, k, ox, oy) => g.drawImage(src, -ox * k, -oy * k);
    const RR = 6;
    // pieces cut from the clean keyed still
    PL.jaw = cut(fromKey(key), [{ poly: JAW }], HS, RR, { piv: JAW_PIV });
    PL.fin = cut(fromKey(key), [{ poly: [...FIN_TOP, [1080, 545], [745, 612]] }], HS, RR, { piv: FIN_PIV });
    PL.props = PROPS.map((P) => cut(fromKey(key), propShapes(P), HS, RR, { piv: P.hub }));
    PL.wheels = WHEELS.map((Wh) => cut(fromKey(key), [{ ell: Wh.tyre }, { rect: Wh.strut }], HS, RR));
    PL.hubs = WHEELS.map((Wh) => { const [cx, cy, rx, ry] = Wh.hub; return cut(fromKey(key), [{ ell: [cx, cy, rx * .92, ry * .92] }], HS, 0); });
    PL.pupils = EYES.map((E) => cut(fromKey(key), [{ ell: E.pupil }], HS, 0));
    const ew = key.getContext('2d').getImageData(Math.round(1700 * HS), Math.round(470 * HS), 1, 1).data;
    PL.eyeWhite = `rgb(${ew[0]},${ew[1]},${ew[2]})`;
    // the body: the still minus everything that moves on its own
    const body = mk(key.width, key.height), bg = body.getContext('2d'); bg.drawImage(key, 0, 0);
    PROPS.forEach((P) => inpaint(body, propShapes({ ...P, hubR: P.hubR + 6, w: P.w + 14, blades: P.blades.map(([a, L]) => [a, L + 26]) }), HS, 8));
    bg.globalCompositeOperation = 'destination-out'; bg.fillStyle = '#000';
    shapePath(bg, { poly: JAW }, HS); bg.fill();
    shapePath(bg, { poly: FIN_TOP }, HS); bg.fill();
    WHEELS.forEach((Wh) => { const [cx, cy, rx, ry] = Wh.tyre; bg.save(); bg.beginPath(); bg.rect(0, (cy - ry + 46) * HS, body.width, body.height); bg.clip(); shapePath(bg, { ell: [cx, cy, rx + 3, ry + 3] }, HS); bg.fill(); bg.restore(); });
    PL.body = cut(fromKey(body), [{ rect: [0, 0, 2688, 1520] }], HS, RR);
  }
  function drawCavity() {
    s.save(); shapePath(s, { poly: JAW }); s.fillStyle = rgrad(1880, 780, 10, 260, [[0, '#3a0b08'], [.6, '#5e1610'], [1, '#2a0806']]); s.fill();
    s.fillStyle = 'rgba(190,60,40,.55)'; s.beginPath(); s.ellipse(1930, 880, 90, 40, -.15, 0, TAU); s.fill();       // the throat
    s.restore();
  }

  // P: { x, y, sc, rot, jaw (0..1+), fin, prop:[a,a], wheelDy:[..], hubRot, eye:[dx,dy] | null, loose, t, propGone, pinsOff }
  function drawPlane(P) {
    const L = P.loose || 0, tq = P.t, wob = (i, amp = 1) => L * amp * snoise(tq * 2.3 + i * 7.1, 40 + i) * .14;
    const shk = (i) => [L * snoise(tq * 3 + i, 70 + i) * 14, L * snoise(tq * 3 + i, 90 + i) * 14];
    s.save(); s.translate(P.x, P.y); s.rotate(P.rot || 0); s.scale(P.sc, P.sc); s.translate(-AX, -AY);
    SH = [10 / P.sc, 13 / P.sc];
    put(PL.fin, (P.fin || 0) + wob(1, 1.4), ...shk(1));
    PL.wheels.forEach((w, i) => {
      const dy = (P.wheelDy ? P.wheelDy[i] : 0), [ox, oy] = shk(10 + i);
      put(w, wob(10 + i, .6), ox, oy + dy, [w.ox + w.ow / 2, w.oy + 20]);
      const [cx, cy, rx, ry] = WHEELS[i].hub, h = PL.hubs[i];
      s.save(); s.translate(ox, oy + dy); s.translate(cx, cy); s.scale(rx, ry); s.rotate(P.hubRot + i); s.scale(1 / rx, 1 / ry); s.translate(-cx, -cy);
      s.drawImage(h.c, h.ox, h.oy, h.ow, h.oh); s.restore();
      pin(cx + ox, cy + oy + dy, 13);
    });
    const [bx, by] = shk(0);
    s.save(); s.translate(bx, by);
    s.save(); s.translate(JAW_PIV[0], JAW_PIV[1]); s.rotate(wob(0, .25)); s.translate(-JAW_PIV[0], -JAW_PIV[1]); drawCavity(); s.restore();
    put(PL.body, wob(0, .25), 0, 0, [1400, 800]);
    // eyes: only redrawn when the pupils have to move
    if (P.eye) EYES.forEach((E, i) => {
      const [wx, wy, rx, ry] = E.white, [px, py] = E.pupil, p = PL.pupils[i];
      s.save(); s.translate(1400, 800); s.rotate(wob(0, .25)); s.translate(-1400, -800);
      s.beginPath(); s.ellipse(wx, wy, rx, ry, 0, 0, TAU); s.clip();
      s.fillStyle = PL.eyeWhite; s.fillRect(wx - rx, wy - ry, rx * 2, ry * 2);
      s.drawImage(p.c, p.ox + P.eye[0], p.oy + P.eye[1], p.ow, p.oh);
      s.restore();
    });
    // bare engine faces under the propellers (the paper props spin over these)
    [[1375, 928, 88, 122, -.12], [2218, 893, 58, 106, -.05]].forEach(([cx, cy, rx, ry, a]) => {
      s.fillStyle = '#1b1511'; s.beginPath(); s.ellipse(cx, cy, rx, ry, a, 0, TAU); s.fill();
      s.strokeStyle = 'rgba(210,200,180,.55)'; s.lineWidth = 3;
      for (let k = 0; k < 18; k++) { const th = k / 18 * TAU; s.beginPath(); s.moveTo(cx + Math.cos(th) * rx * .35, cy + Math.sin(th) * ry * .35); s.lineTo(cx + Math.cos(th) * rx * .9, cy + Math.sin(th) * ry * .9); s.stroke(); }
    });
    s.restore();
    PL.props.forEach((p, i) => {
      if (P.propGone && P.propGone[i]) return;
      const [ox, oy] = shk(20 + i);
      put(p, P.prop[i] + wob(20 + i, 2), bx + ox, by + oy);
      if (!(P.pinsOff && P.pinsOff[i])) pin(p.piv[0] + bx + ox, p.piv[1] + by + oy, 16);
    });
    const [jx, jy] = shk(30);
    put(PL.jaw, (P.jaw || 0) * .30 + wob(30, 1.2), bx + jx, by + jy);
    pin(JAW_PIV[0] + bx + jx, JAW_PIV[1] + by + jy, 14);
    pin(FIN_PIV[0] + shk(1)[0], FIN_PIV[1] + shk(1)[1], 14);
    s.restore();
  }
  const planeToWorld = (P, x, y) => { const c = Math.cos(P.rot || 0), sn = Math.sin(P.rot || 0), lx = (x - AX) * P.sc, ly = (y - AY) * P.sc; return [P.x + lx * c - ly * sn, P.y + lx * sn + ly * c]; };

  // ---------- singing ----------
  const SYL = [[71.64, 1], [72.84, .55], [72.94, .9], [73.40, .8], [74.0, .55], [74.62, .5], [74.86, 1], [75.10, .85], [76.92, .55], [76.96, .6], [77.22, 1], [77.82, .7], [78.10, .5], [78.38, 1],
    [80.88, 1], [81.8, .55], [81.92, .9], [82.25, .8], [82.74, .55], [83.88, .5], [84.24, 1], [84.43, .85], [86.08, .55], [86.24, .7], [86.6, 1], [86.8, .6], [86.92, .5], [87.1, .9], [87.30, .7], [87.52, 1]];
  const PHRASES = [[71.6, 79.0], [80.85, 88.6]];
  const MNUH = [79.08, 79.73, 80.25];
  function jawOpen(t) {
    let o = 0;
    for (const m of MNUH) { const dt = t - m; if (dt > -.04 && dt < .42) o = Math.max(o, 1.25 * (dt < .07 ? (dt + .04) / .11 : Math.max(0, 1 - (dt - .07) / .3))); }
    const ph = PHRASES.find(([a, b]) => t >= a && t < b); if (!ph) return o;
    let i = -1; for (let k = 0; k < SYL.length; k++) if (SYL[k][0] <= t) i = k;
    if (i < 0 || SYL[i][0] < ph[0]) return o;
    const [st, amp] = SYL[i], nx = i + 1 < SYL.length && SYL[i + 1][0] < ph[1] ? SYL[i + 1][0] : ph[1], dt = t - st;
    let lv = amp * (dt < .07 ? dt / .07 : lerp(1, .5, clamp((dt - .07) / .6)));
    if (nx - t < .09) lv *= (nx - t) / .09;
    lv *= .75 + .45 * clamp(F('voc', t, 2) / .45);
    return Math.max(o, lv);
  }

  // ---------- world pieces ----------
  const WP = {};
  function panel(im, sx, sy, sw, sh, dh, seed, rr = 4, extra = {}) {   // a photo cut from a plate, dh world px tall
    const dw = dh * sw / sh;
    return cut((g, k, ox, oy) => g.drawImage(im, sx, sy, sw, sh, -ox * k, -oy * k, dw * k, dh * k), [{ poly: snipRect(dw, dh, seed) }], K, rr * K, { dw, dh, ...extra });
  }
  function disc(im, cx, cy, r, R, rr = 4) {
    const k = R / r;
    return cut((g, kk, ox, oy) => g.drawImage(im, cx - r, cy - r, 2 * r, 2 * r, (-R - ox) * kk, (-R - oy) * kk, 2 * R * kk, 2 * R * kk), [{ ell: [0, 0, R, R] }], K, rr * K, { piv: [0, 0], R });
  }
  const CAR = [[0, -.11], [.03, -.22], [.18, -.26], [.30, -.42], [.62, -.42], [.75, -.27], [.95, -.24], [1, -.13], [.98, -.05], [.02, -.05]];
  function car(tex, sky, seed, w = 540) {
    const sc = (pts) => pts.map(([x, y]) => [x * w, y * w]);
    const c = mk((w + 30) * K, w * .55 * K), g = c.getContext('2d');
    g.translate(15 * K, w * .5 * K); g.scale(K, K);
    const [tx, ty, tw, th] = tex;
    g.save(); g.beginPath(); sc(CAR).forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.clip();
    g.drawImage(A.b, tx, ty, tw, th, -10, -w * .45, w + 20, w * .45); g.restore();
    g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, -w * .07, w, w * .025);
    const win = [[[.33, -.39], [.46, -.39], [.46, -.28], [.26, -.28]], [[.49, -.39], [.60, -.39], [.70, -.28], [.49, -.28]]];
    win.forEach((p) => { g.save(); g.beginPath(); sc(p).forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.clip(); g.drawImage(A.a, sky[0], sky[1], sky[2], sky[3], .2 * w, -.42 * w, .55 * w, .16 * w); g.restore(); g.strokeStyle = INK; g.lineWidth = 3; g.stroke(); });
    [.2, .8].forEach((x) => { g.fillStyle = '#141010'; g.beginPath(); g.arc(x * w, -.05 * w, .095 * w, 0, TAU); g.fill(); g.save(); g.beginPath(); g.arc(x * w, -.05 * w, .055 * w, 0, TAU); g.clip(); g.drawImage(A.b, 143, 393, 94, 94, x * w - .055 * w, -.105 * w, .11 * w, .11 * w); g.restore(); });
    const p = { c, ox: -15, oy: -w * .5, ow: w + 30, oh: w * .55, k: K, w };
    return finish(p, 4 * K);
  }
  function buildWorld() {
    const a = A.a, b = A.b;
    WP.sky1 = [panel(a, 975, 0, 481, 195, 610, 11), panel(a, 418, 0, 552, 212, 610, 12)];
    WP.mount = cut((g, k, ox, oy) => g.drawImage(a, 600, 76, 372, 160, -ox * k, -oy * k, 372 * 2.4 * k, 160 * 2.4 * k),
      [{ poly: [[20, 152], [100, 120], [180, 89], [250, 60], [305, 34], [345, 17], [372, 8], [372, 160], [20, 160]].map(([x, y]) => [x * 2.4, y * 2.4]) }], K, 4 * K);
    WP.houses = panel(a, 975, 226, 481, 78, 210, 13);
    WP.field = panel(a, 0, 222, 330, 128, 150, 14);
    WP.road = [0, 1, 2].map((i) => panel(a, 640 + i * 8, 712, 120, 92, 190, 20 + i, 3));
    WP.verge = panel(a, 0, 440, 530, 222, 175, 15);
    WP.lemon = disc(a, 390, 542, 50, 115);
    WP.melon = disc(a, 238, 537, 78, 150);
    WP.sky2 = panel(b, 0, 0, 1456, 345, 640, 31, 0);
    WP.hills2 = panel(b, 320, 362, 830, 172, 230, 32);
    WP.verge2 = panel(b, 925, 480, 515, 250, 175, 33);
    WP.carpet = (() => { const c = mk(800 * K, 120 * K), g = c.getContext('2d'); g.scale(K, K);
      g.fillStyle = vgradOn(g, 0, 120, [[0, '#5a0a10'], [.25, '#9a1420'], [.6, '#7a0e18'], [1, '#3a0508']]); g.fillRect(0, 0, 800, 120);
      const r = rng(5); for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(${r() < .5 ? '255,120,120' : '20,0,0'},${.05 + r() * .08})`; g.fillRect(r() * 800, r() * 120, 30 + r() * 140, 1 + r() * 2); }
      return finish({ c, ox: 0, oy: 0, ow: 800, oh: 120, k: K }, 3 * K); })();
    WP.discs = [disc(b, 662, 196, 78, 120), disc(b, 972, 272, 70, 135), disc(b, 822, 196, 78, 105)];
    WP.cars = [car([925, 480, 515, 250], [980, 40, 300, 90], 1), car([0, 372, 380, 340], [440, 20, 300, 90], 2), car([1060, 70, 360, 330], [1000, 30, 400, 100], 3), car([300, 560, 420, 200], [1100, 20, 300, 90], 4)];
  }
  function vgradOn(g, y0, y1, stops) { const gr = g.createLinearGradient(0, y0, 0, y1); stops.forEach(([o, c]) => gr.addColorStop(o, c)); return gr; }

  window.__assets = (async () => {
    [A.a, A.b, A.p] = await Promise.all([img('assets/plate-a.png'), img('assets/plate-b.png'), img('assets/plane.png')]);
    buildPlane(A.p); buildWorld(); return true;
  })();

  // ---------- world drawing ----------
  const HZ = 522;
  // scroll a sequence of pieces horizontally (right to left as the plane drives right), stepped on 12s
  function strip(pieces, y, speed, tq, gap = -30, seed = 1, angAmp = .012) {
    const ws = pieces.map((p) => p.dw ?? p.ow), total = ws.reduce((x, w) => x + w + gap, 0);
    let x = -(((speed * tq) % total) + total) % total - total;
    for (let n = 0; x < W + 50; n++) { const i = n % pieces.length, p = pieces[i];
      if (x + ws[i] > -50) { const ang = (hash(n * 31 + seed) - .5) * 2 * angAmp; s.save(); s.translate(x + ws[i] / 2, y + (p.dh ?? p.oh) / 2); s.rotate(ang); if (pieces.length === 1 && (Math.round((x + speed * tq) / (ws[i] + gap)) & 1)) s.scale(-1, 1); s.translate(-ws[i] / 2, -(p.dh ?? p.oh) / 2); SH = [8, 10]; put(p); s.restore(); }
      x += ws[i] + gap; }
  }
  function poles(tq, speed) {
    const sp = 760, off = ((speed * tq) % sp + sp) % sp;
    for (let x = -off + 80; x < W + 100; x += sp) {
      s.fillStyle = 'rgba(20,12,6,.4)'; s.fillRect(x + 8, 330 + 10, 16, 380); s.fillRect(x - 60 + 8, 370 + 10, 136, 12);
      s.fillStyle = '#231a12'; s.fillRect(x, 330, 16, 380); s.fillRect(x - 60, 370, 136, 12); s.fillRect(x - 45, 408, 106, 9);
      s.fillStyle = PAPER; s.fillRect(x - 2, 330, 2, 380);
    }
  }
  function dashes(tq, speed, y) {
    const sp = 300, off = ((speed * tq) % sp + sp) % sp;
    for (let x = -off; x < W + 300; x += sp) { const r = hash(Math.round((x + speed * tq) / sp) * 7 + 3); s.save(); s.translate(x + 70, y); s.rotate((r - .5) * .06);
      s.fillStyle = 'rgba(20,12,6,.4)'; s.fillRect(-70 + 6, -9 + 8, 140, 18); s.fillStyle = '#efe6cf'; s.fillRect(-70, -9, 140, 18); s.restore(); }
  }
  const band = {
    sky1: (tq) => { fill('#d9d2c0'); strip(WP.sky1, -30, 22, tq, -60, 1); const sp = 1500, off = ((70 * tq) % sp + sp) % sp; SH = [8, 10]; for (let x = -off - 300; x < W + 100; x += sp) put(WP.mount, 0, x, 600 - WP.mount.oh + 20); },
    sky2: (tq) => { fill('#e7e1d2'); const p = WP.sky2, x = -((14 * tq) % 400) - 120; put(p, 0, x, -40, null, false); },
    houses: (tq) => strip([WP.houses], 515, 150, tq, -40, 2),
    hills2: (tq) => strip([WP.hills2], 500, 110, tq, -40, 5, .01),
    field: (tq) => { strip([WP.field], 680, 270, tq, -20, 3); poles(tq, 270); },
    carpet: (tq) => strip([WP.carpet], 690, 220, tq, -6, 6, .004),
    road: (tq, sp = 520) => { strip(WP.road, 785, sp, tq, -14, 4, .008); dashes(tq, sp, 872); },
    verge: (tq) => strip([WP.verge], 945, 760, tq, -30, 7),
    verge2: (tq) => strip([WP.verge2], 945, 560, tq, -30, 8),
  };
  // flip a band around its middle line: front until 90 degrees, back after
  function flipBand(front, back, yc, k, tq) {
    if (k <= 0) return front(tq); if (k >= 1) return back(tq);
    const c = Math.cos(k * Math.PI);
    s.save(); s.translate(0, yc); s.scale(1, Math.max(.03, Math.abs(c))); s.translate(0, -yc); (c > 0 ? front : back)(tq); s.restore();
    s.fillStyle = 'rgba(20,12,6,.25)'; s.fillRect(0, yc + 8, W, 6);
  }
  function rope(tq, speed, pop) {
    const sp = 380, off = ((speed * tq) % sp + sp) % sp, base = 805, top = base - 150 * pop;
    const posts = []; for (let x = -off - sp; x < W + sp; x += sp) posts.push(x);
    // rope swags first (behind the posts' tops)
    for (let i = 0; i + 1 < posts.length; i++) { const x0 = posts[i] + 11, x1 = posts[i + 1] + 11, sag = 48 + 6 * Math.sin(tq * 9 + i);
      const path = () => { s.beginPath(); s.moveTo(x0, top + 14); s.quadraticCurveTo((x0 + x1) / 2, top + 14 + sag * 2, x1, top + 14); };
      s.lineCap = 'round'; path(); s.strokeStyle = 'rgba(20,10,6,.4)'; s.lineWidth = 22; s.save(); s.translate(6, 9); s.stroke(); s.restore();
      path(); s.strokeStyle = PAPER; s.lineWidth = 24; s.stroke(); path(); s.strokeStyle = '#7a0c16'; s.lineWidth = 17; s.stroke();
      path(); s.strokeStyle = 'rgba(255,140,140,.45)'; s.lineWidth = 4; s.save(); s.translate(0, -4); s.stroke(); s.restore(); }
    for (const x of posts) {
      s.fillStyle = 'rgba(20,10,6,.4)'; s.fillRect(x + 8, top + 9, 22, base - top); s.fillStyle = PAPER; s.fillRect(x - 3, top - 3, 28, base - top + 6);
      s.fillStyle = (() => { const g = s.createLinearGradient(x, 0, x + 22, 0); g.addColorStop(0, '#6b4310'); g.addColorStop(.35, '#f2cf6a'); g.addColorStop(.7, '#b07a22'); g.addColorStop(1, '#5a360a'); return g; })();
      s.fillRect(x, top, 22, base - top); s.beginPath(); s.ellipse(x + 11, base, 34, 10, 0, 0, TAU); s.fill(); pin(x + 11, top - 6, 15);
    }
  }
  function scissors(x, y, ang, open, sc) {
    s.save(); s.translate(x, y); s.rotate(ang); s.scale(sc, sc);
    const blade = (dir) => { s.save(); s.rotate(dir * open * .45);
      s.fillStyle = 'rgba(20,10,6,.4)'; s.save(); s.translate(10, 14 * dir + 12); s.beginPath(); s.moveTo(0, 0); s.lineTo(-380, -6 * dir); s.lineTo(-380, 4 * dir); s.lineTo(0, 28 * dir); s.fill(); s.restore();
      s.beginPath(); s.moveTo(20, -6 * dir); s.lineTo(-385, 0); s.quadraticCurveTo(-200, 30 * dir, 20, 34 * dir); s.closePath();
      s.fillStyle = PAPER; s.lineWidth = 8; s.strokeStyle = PAPER; s.stroke();
      const g = s.createLinearGradient(0, -10 * dir, 0, 34 * dir); g.addColorStop(0, '#f4f4f0'); g.addColorStop(.4, '#9ea3a6'); g.addColorStop(1, '#4b5054'); s.fillStyle = g; s.fill();
      s.strokeStyle = 'rgba(20,20,20,.5)'; s.lineWidth = 1.2; for (let i = 0; i < 26; i++) { s.beginPath(); s.moveTo(-20 - i * 13, 6 * dir); s.lineTo(-10 - i * 13, (26 - i * .7) * dir); s.stroke(); }
      s.beginPath(); s.moveTo(20, 30 * dir); s.quadraticCurveTo(70, 70 * dir, 140, 75 * dir); s.lineWidth = 22; s.strokeStyle = '#1b1612'; s.stroke();
      s.beginPath(); s.ellipse(190, 78 * dir, 60, 42, 0, 0, TAU); s.lineWidth = 26; s.strokeStyle = PAPER; s.stroke(); s.lineWidth = 20; s.strokeStyle = '#1b1612'; s.stroke();
      s.restore(); };
    blade(1); blade(-1); pin(0, 0, 18);
    s.restore();
  }

  // ---------- the film ----------
  const CUT_B = 74.86, CUT_C = 77.2, LINE2 = 80.88, CUT_E = 86.5, CUT_F = 88.6;
  const CARS = [81.35, 82.45, 83.55, 84.75, 85.85, 86.95, 87.55];
  const SNIPS = [77.22, 77.82, 78.38];
  const FLIPS = [[79.08, 'houses', 'hills2', 610], [79.73, 'field', 'carpet', 740], [80.25, 'verge', 'verge2', 1030]];
  const PEEL = [78.55, 79.35];

  function eyeFollow(t, tq, faceX) {
    // pupils track the car going past (behind and to the left of the face first, then away to the right)
    if (t >= 86.6 && t < 87.55) { // the eye roll on "sick": up, across the top, and back down
      const k = ease.inOut(inv(86.6, 87.45, tq)), a = lerp(Math.PI * 1.05, Math.PI * 2.1, k), r = 34 * Math.sin(Math.PI * Math.min(1, k * 1.15));
      return [Math.cos(a) * r * 1.2 - 4, Math.sin(a) * r - 26 * Math.sin(Math.PI * k)];
    }
    let best = null; for (const c0 of CARS) { const dt = tq - c0; if (dt > -.35 && dt < 1.1) best = dt; }
    if (best === null) return t >= LINE2 ? [0, 0] : null;
    const look = clamp(lerp(-1, 1, (best + .35) / 1.3));
    return [look * 26, -4 + Math.abs(look) * 4];
  }

  function shot(t) {
    const tq = onTwos(t, 12);
    const inW2 = t >= LINE2;
    const FX0 = {};
    // ---- the plane's pose ----
    const beatI = lastBeat(tq), bp = beatI < 0 ? 0 : Math.exp(-7 * (tq - FEAT.beats[beatI]));
    const loose = smooth(inv(77.25, 78.0, tq)) * (1 - smooth(inv(80.5, 81.1, tq)));
    let px = 900, py = 935;
    if (t < 71.6) px = lerp(-760, 900, ease.back(inv(71.0, 71.5, tq)));   // shoved in from frame left, in jerks
    const mn = MNUH.reduce((o, m) => Math.max(o, hit(tq, m, 9)), 0);
    py -= 10 * bp + 46 * mn;
    const P = { x: px, y: py, sc: .40, rot: -.02 * bp - .05 * mn + loose * .05 * snoise(tq * 2, 3), jaw: jawOpen(tq), fin: .05 * Math.sin(tq * 5.3) * (1 + 2 * mn),
      prop: [tq * 9.4, tq * 9.4 + 1], wheelDy: [0, 1, 2].map((i) => 6 * Math.sin(tq * 17 + i * 2.1)), hubRot: tq * 7, eye: null, loose, t: tq };
    // ending: the near propeller gives up, drops off its pin and rolls away down the road, overtaking him
    const POP = 89.23;
    let rollProp = null;
    if (tq >= POP) {
      P.propGone = [true, false]; P.pinsOff = [true, false];
      const lt = tq - POP;
      const [hx, hy] = planeToWorld(P, PROPS[0].hub[0], PROPS[0].hub[1]);
      const groundY = 905 - PROPS[0].blades[1][1] * P.sc * .0;
      const drop = lt < .35 ? hy + (groundY - 60 - hy) * ease.in(lt / .35) - Math.sin(lt / .35 * Math.PI) * 30 : groundY - 60 - Math.abs(Math.sin((lt - .35) * 7)) * 30 * Math.exp(-(lt - .35) * 2);
      const rx = hx + (lt < .35 ? lt * 60 : 21 + Math.pow(lt - .35, 1.6) * 900);
      rollProp = { x: rx, y: drop, a: P.prop[0] + lt * 14, pinY: hy - lt * 1400 + lt * lt * 900, pinX: hx + lt * 160 };
    }
    // eyes
    const [fx_, fy_] = planeToWorld(P, 1800, 500);
    if (inW2) { P.eye = eyeFollow(t, tq, fx_); if (rollProp) { const k = clamp((rollProp.x - fx_) / 500, -1, 1); P.eye = [k * 30 + 4, 34]; } }
    if (tq >= 89.23) P.jaw = Math.max(P.jaw, .55 * smooth(inv(89.4, 89.7, tq)));   // and he just watches it go, mouth open

    // ---- camera ----
    let cam = [W / 2, H / 2, 1];
    if (t >= CUT_B && t < CUT_C) cam = [1080, 610, 1.62];
    if (t >= CUT_E && t < CUT_F) cam = [1075, 600, 2.15];
    s.save(); s.translate(W / 2, H / 2); s.scale(cam[2], cam[2]); s.translate(-cam[0], -cam[1]);

    // ---- sky ----
    const peel = inv(PEEL[0], PEEL[1], tq);
    if (t < CUT_C || peel <= 0) band.sky1(tq);
    else if (peel >= 1) band.sky2(tq);
    else {
      band.sky2(tq);
      const ang = .55, d = [Math.cos(ang), Math.sin(ang)], pmax = W * d[0] + HZ * d[1], p = ease.in(peel) * pmax * 1.05;
      s.save(); s.beginPath(); s.moveTo(p / d[0], 0); s.lineTo(W + 10, 0); s.lineTo(W + 10, HZ); s.lineTo(Math.max(0, (p - HZ * d[1]) / d[0]), HZ); s.lineTo(0, HZ); s.lineTo(0, p / d[1]); s.closePath();
      // keep the part of the old sky where dot(pt,d) > p
      s.beginPath(); const far = 5000; const lp = [d[0] * p, d[1] * p], tv = [-d[1], d[0]];
      s.moveTo(lp[0] + tv[0] * far, lp[1] + tv[1] * far); s.lineTo(lp[0] - tv[0] * far, lp[1] - tv[1] * far); s.lineTo(lp[0] - tv[0] * far + d[0] * far, lp[1] - tv[1] * far + d[1] * far); s.lineTo(lp[0] + tv[0] * far + d[0] * far, lp[1] + tv[1] * far + d[1] * far); s.closePath();
      s.clip(); s.beginPath(); s.rect(0, 0, W, HZ); s.clip(); band.sky1(tq); s.restore();
      // the flap: the folded-over part, back of the paper showing
      const rect = [[0, 0], [W, 0], [W, HZ], [0, HZ]], inside = (q) => q[0] * d[0] + q[1] * d[1] < p, poly = [];
      for (let i = 0; i < 4; i++) { const a = rect[i], b = rect[(i + 1) % 4], ia = inside(a), ib = inside(b); if (ia) poly.push(a);
        if (ia !== ib) { const da = a[0] * d[0] + a[1] * d[1] - p, db = b[0] * d[0] + b[1] * d[1] - p, k = da / (da - db); poly.push([lerp(a[0], b[0], k), lerp(a[1], b[1], k)]); } }
      const refl = poly.map((q) => { const dd = p - (q[0] * d[0] + q[1] * d[1]); return [q[0] + 2 * dd * d[0], q[1] + 2 * dd * d[1]]; });
      if (refl.length > 2) {
        s.save(); s.translate(14, 18); poly2(refl, 'rgba(20,12,6,.35)'); s.restore();
        s.save(); s.beginPath(); refl.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y)); s.closePath();
        const gr = s.createLinearGradient(lp[0], lp[1], lp[0] + d[0] * 700, lp[1] + d[1] * 700); gr.addColorStop(0, '#cfc6b0'); gr.addColorStop(.25, '#f1ead8'); gr.addColorStop(1, '#ddd3bc');
        s.fillStyle = gr; s.fill(); s.clip(); s.globalAlpha = .12; s.drawImage(A.a, 975, 0, 481, 195, 0, 0, W, HZ); s.globalAlpha = 1; s.restore();
        s.strokeStyle = 'rgba(40,30,20,.35)'; s.lineWidth = 2; s.beginPath(); refl.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y)); s.closePath(); s.stroke();
      }
    }
    // discs pop in from the top edge on each "nuh" and hang about in line 2
    WP.discs.forEach((dc, i) => { const t0 = MNUH[i]; if (tq < t0) return; const k = ease.back(inv(t0, t0 + .17, tq));
      const tx = [330, 1520, 980][i], ty = [170, 210, 120][i]; const y = lerp(-200, ty, k) + Math.sin(tq * 3 + i) * 8 * (tq > t0 + .3); SH = [10, 13];
      put(dc, tq * (i - 1) * .3, tx, y); });

    // ---- ground bands ----
    const fk = (i) => inv(FLIPS[i][0] - .05, FLIPS[i][0] + .28, tq);
    flipBand(band.houses, band.hills2, FLIPS[0][3], fk(0), tq);
    flipBand(band.field, band.carpet, FLIPS[1][3], fk(1), tq);
    // cars in the passing lane (the red carpet), behind the rope
    if (t >= LINE2 - .5) CARS.forEach((c0, i) => { const lt = tq - c0; if (lt < -.2 || lt > 1.2) return; const cr = WP.cars[i % WP.cars.length];
      const x = lerp(-650, W + 120, (lt + .2) / 1.3), y = 785 + Math.abs(Math.sin(lt * 20)) * -4; SH = [9, 11]; s.save(); s.translate(x, y); put(cr); s.restore(); });
    const ropePop = ease.back(inv(80.5, 80.75, tq));
    if (ropePop > 0) rope(tq, inW2 ? 230 : 0, ropePop);
    band.road(tq, inW2 ? 230 : 520);
    // ---- the scissors (behind the plane: they cut the scenery, not him): in from the top right, three snips along the horizon ----
    if (t >= CUT_C && tq < PEEL[0] + .3) {
      const prog = (tt) => { const k = [77.05, ...SNIPS, 78.75]; const xs = [W + 500, 1500, 980, 420, -600]; return kf(tt, k.map((kk, i) => [kk, xs[i]]), ease.out); };
      const sx = prog(tq), snip = SNIPS.reduce((o, sn) => { const dt = tq - sn; return dt >= 0 && dt < .35 ? Math.min(o, dt < .08 ? 1 - dt / .08 : (dt - .08) / .27) : o; }, 1);
      const cutTo = Math.max(sx, 0);
      if (tq > SNIPS[0] - .05 && tq < PEEL[0] + .1) { s.fillStyle = INK; s.fillRect(cutTo, HZ - 3, W - cutTo, 6); s.fillStyle = PAPER; s.fillRect(cutTo, HZ + 3, W - cutTo, 3); }
      scissors(sx, HZ - 10 - 50 * (1 - Math.min(1, snip * 2)), -.02, snip, 1.45);
    }
    // the plane
    drawPlane(P);
    if (rollProp) { s.save(); s.translate(rollProp.x, rollProp.y); s.scale(P.sc, P.sc); s.translate(-PROPS[0].hub[0], -PROPS[0].hub[1]); SH = [10 / P.sc, 13 / P.sc];
      put(PL.props[0], rollProp.a, 0, 0); s.restore(); if (rollProp.pinY > -100) pin(rollProp.pinX, rollProp.pinY, 7); }
    // foreground verge and rolling fruit
    flipBand(band.verge, band.verge2, FLIPS[2][3], fk(2), tq);
    [[72.9, WP.lemon], [75.75, WP.melon], [83.1, WP.lemon]].forEach(([t0, f], i) => { const lt = tq - t0; if (lt < 0 || lt > 1.1) return;
      SH = [10, 13]; put(f, -lt * 9, lerp(W + f.R + 20, -f.R - 40, lt / 1.1), 1010 - f.R * .55 - Math.abs(Math.sin(lt * 9)) * 22); });
    s.restore();

    FX0.flash = (t >= CUT_C && t < CUT_C + 1 / 24) ? .25 : 0;
    fx(FX0);
  }
  function poly2(pts, c) { s.beginPath(); pts.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y)); s.closePath(); s.fillStyle = c; s.fill(); }

  chapter('cutout', 71.0, 91.0, [[71.0, shot]]);
})();
