// Figures and banknote furniture, painted into the tone maps (engraved) plus crisp ink line work.
function clipT(path, fn) { const pc = K.clip; K.clip = path; for (const c of [tc, ac, hc]) { c.save(); c.clip(path); } try { fn(); } finally { for (const c of [tc, ac, hc]) c.restore(); K.clip = pc; } }
// letters engraved (hatch-filled) or reversed out (cleared) in the tone maps
function Ttext(str, x, y, size, tone, ang = 0, fam = SERIF, wt = '') {
  for (const [c, v] of [[tc, grey(tone)], [ac, grey(((ang % 180) + 180) % 180 / 180)], [hc, grey(.6)]]) { c.font = `${wt} ${size}px ${fam}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = v; c.fillText(str, x, y); }
}
function TclearText(str, x, y, size, fam = SERIF, wt = '', ls = 0) { tc.font = `${wt} ${size}px ${fam}`; tc.textAlign = 'center'; tc.textBaseline = 'middle'; tc.fillStyle = '#000'; tc.letterSpacing = ls + 'px'; tc.fillText(str, x, y); tc.letterSpacing = '0px'; }

// ---------- heads and busts (local units: head centre at 0,0, head ~140 wide) ----------
function headTone(x, y, s, p) {
  const sx = (1 + (p.puff || 0) * .2) * (p.jaw ?? 1), look = p.look || 0, L = (path) => xf(path, x, y, s);
  const W2 = (lx, ly) => [x + lx * s, y + ly * s];
  // ears
  for (const e of [-1, 1]) T(L(ell(e * 69 * sx + look * -6, 6, 12, 21)), .4, 90, .8);
  // face: lit from upper left
  T(L(ell(0, 0, 70 * sx, 88)), (c) => { const [gx, gy] = W2(-24 + look * 12, -30), g = c.createRadialGradient(gx, gy, 4 * s, gx + 10 * s, gy + 10 * s, 112 * s * sx); g.addColorStop(0, grey(.05)); g.addColorStop(.5, grey(.13)); g.addColorStop(.85, grey(.42)); g.addColorStop(1, grey(.6)); return g; }, 100 + look * 12, 1);
  // eye sockets and nose shade
  for (const e of [-1, 1]) T(L(ell(e * 26 * sx + look * 9, -12, 21, 12)), .26, 95, .7);
  T(L(poly([[5 + look * 13, -16], [15 + look * 14, 22], [3 + look * 14, 27]])), .52, 60, null);
  // cheek and jaw shade on the shadow side
  T(L(ell(44 * sx, 26, 24 * sx, 38)), (c) => { const [gx, gy] = W2(50 * sx, 26), g = c.createRadialGradient(gx, gy, 2 * s, gx, gy, 38 * s); g.addColorStop(0, 'rgba(110,110,110,1)'); g.addColorStop(1, 'rgba(110,110,110,0)'); return g; }, 100 + look * 12, null);
  if (p.moustache) T(L(blob([[-26 + look * 12, 37], [0 + look * 13, 30], [26 + look * 12, 37], [16 + look * 12, 44], [0 + look * 12, 40], [-16 + look * 12, 44]])), .82, 160, .9);
  if (p.beard) T(L(blob([[-60 * sx, 20], [-40 * sx, 75], [0, 102], [40 * sx, 75], [60 * sx, 20], [30, 60], [0, 66], [-30, 60]])), .74, 80, .9);
  // hair
  const hr = p.hair ?? 0;
  if (hr === 0 || hr === 2 || hr === 3) T(L(blob([[-73 * sx, 4], [-70 * sx, -55], [-30, -94], [20, -96], [66 * sx, -60], [72 * sx, 0], [58 * sx, -30], [20, -58], [-30, -56], [-58 * sx, -30]])), .74, 150, 1);
  if (hr === 1) for (const e of [-1, 1]) T(L(ell(e * 64 * sx, -24, 14, 26)), .7, 160, .8);
  if (hr === 2) T(L(ell(10, -100, 40, 30)), .76, 140, 1);
  if (hr === 3) for (const e of [-1, 1]) T(L(blob([[e * 60 * sx, -40], [e * 82 * sx, 10], [e * 86 * sx, 90], [e * 60 * sx, 110], [e * 64 * sx, 20]])), .72, 165, .9);
  // hats
  const ht = p.hat || 0;
  if (ht === 1) { T(L(blob([[-64, -50], [-60, -108], [0, -134], [60, -108], [64, -50]])), .84, 0, 1); T(L(ell(0, -52, 98, 15)), .9, 0, .8); }
  if (ht === 2) { T(L(blob([[-76, -38], [-70, -84], [-10, -104], [64, -88], [116, -52], [64, -40]])), (c) => { const [a1, b1] = W2(-70, -90), [a2, b2] = W2(110, -40), g = c.createLinearGradient(a1, b1, a2, b2); g.addColorStop(0, grey(.5)); g.addColorStop(1, grey(.8)); return g; }, 170, 1); }
  if (ht === 3) { T(L(rect(-52, -196, 104, 150)), (c) => { const [a1, b1] = W2(-52, 0), [a2, b2] = W2(52, 0), g = c.createLinearGradient(a1, b1, a2, b2); g.addColorStop(0, grey(.62)); g.addColorStop(1, grey(.92)); return g; }, 0, 1); T(L(ell(0, -48, 92, 14)), .9, 0, .8); }
}
function headInk(c, p) {
  const sx = (1 + (p.puff || 0) * .2) * (p.jaw ?? 1), look = p.look || 0, lid = p.lid || 0, sm = p.smile || 0, op = p.open || 0, brow = p.brow || 0;
  c.strokeStyle = inkA(.9); c.fillStyle = inkA(.92); c.lineCap = 'round'; c.lineJoin = 'round';
  // shadow-side contour of the face and the jaw
  c.lineWidth = 1.8; c.beginPath(); c.ellipse(0, 0, 70 * sx, 88, 0, -.9, 2.3); c.stroke();
  c.lineWidth = 1.1; c.beginPath(); c.ellipse(0, 0, 70 * sx, 88, 0, 2.3, 3.6); c.stroke();
  for (const e of [-1, 1]) {
    const ex = e * 26 * sx + look * 10, ey = -12;
    if (lid > .62) { // eyes closed, at ease
      c.lineWidth = 2.4; c.beginPath(); c.moveTo(ex - 13, ey - 1); c.quadraticCurveTo(ex, ey + 6, ex + 13, ey - 1); c.stroke();
    } else {
      const up = 9 * (1 - lid);
      c.lineWidth = 2.2; c.beginPath(); c.moveTo(ex - 14, ey + 1); c.quadraticCurveTo(ex, ey - up - 3, ex + 14, ey + 1); c.stroke();
      c.lineWidth = 1.1; c.beginPath(); c.moveTo(ex - 12, ey + 2); c.quadraticCurveTo(ex, ey + 7, ex + 12, ey + 2); c.stroke();
      c.save(); c.beginPath(); c.moveTo(ex - 14, ey + 1); c.quadraticCurveTo(ex, ey - up - 3, ex + 14, ey + 1); c.quadraticCurveTo(ex, ey + 8, ex - 14, ey + 1); c.clip();
      c.beginPath(); c.arc(ex + look * 5, ey - 1, 5.2, 0, Math.PI * 2); c.fill(); c.restore();
      if (lid > .2) { c.lineWidth = 1.3; c.beginPath(); c.moveTo(ex - 13, ey - up * .3); c.quadraticCurveTo(ex, ey - up * .8 + 2, ex + 13, ey - up * .3); c.stroke(); }
    }
    const by = -36 - brow * 10 - (e * look > 0 ? 0 : 0);
    c.lineWidth = 3; c.beginPath(); c.moveTo(ex - 17, by + 5); c.quadraticCurveTo(ex, by - 4 - brow * 3, ex + 17, by + 3); c.stroke();
  }
  // nose
  c.lineWidth = 1.6; c.beginPath(); c.moveTo(look * 11 + 3, -20); c.quadraticCurveTo(look * 15 + 10, 6, look * 14 + 9, 22); c.quadraticCurveTo(look * 14 + 2, 28, look * 14 - 7, 24); c.stroke();
  // mouth
  const mx = look * 12, my = 50, mw = 25 * (1 + sm * .25) * sx;
  if (op > .05) {
    c.beginPath(); c.ellipse(mx, my + op * 4, mw * .62, 3 + op * 11, 0, 0, Math.PI * 2); c.fill();
  } else {
    c.lineWidth = 2.2; c.beginPath(); c.moveTo(mx - mw, my - sm * 6); c.quadraticCurveTo(mx, my + sm * 10 + 2, mx + mw, my - sm * 6); c.stroke();
    if (sm > .3) { c.lineWidth = 1.2; for (const e of [-1, 1]) { c.beginPath(); c.moveTo(mx + e * (mw + 2), my - sm * 6 - 4); c.quadraticCurveTo(mx + e * (mw + 7), my - sm * 6, mx + e * (mw + 3), my - sm * 6 + 5); c.stroke(); } }
  }
  c.lineWidth = 1.2; c.beginPath(); c.moveTo(mx - 9, my + 22); c.quadraticCurveTo(mx, my + 26, mx + 9, my + 22); c.stroke();
  if ((p.puff || 0) > .3) { c.lineWidth = 1.1; for (const e of [-1, 1]) { c.beginPath(); c.arc(e * 46 * sx + look * 8, 24, 12, e > 0 ? 2.4 : -.6, e > 0 ? 3.6 : .6); c.stroke(); } }
}
function bust(x, y, s, p = {}) {
  const puff = p.puff || 0, cw = 150 * (1 + puff * .4), chest = 1 + puff * .6, hy = -(p.chinUp || 0) * 14 - puff * 10, L = (path) => xf(path, x, y, s), W2 = (lx, ly) => [x + lx * s, y + ly * s];
  T(L(blob([[-cw - 20, 330], [-cw, 160], [-cw * .78, 118], [-38, 98], [0, 112], [38, 98], [cw * .78, 118], [cw, 160], [cw + 20, 330]])), (c) => { const [a1, b1] = W2(-cw, 0), [a2, b2] = W2(cw, 0), g = c.createLinearGradient(a1, b1, a2, b2); g.addColorStop(0, grey(p.coat ?? .5)); g.addColorStop(1, grey(Math.min(.95, (p.coat ?? .5) + .32))); return g; }, 68, 1);
  T(L(blob([[-34, 98], [-40 * chest, 160], [0, 200 + puff * 40], [40 * chest, 160], [34, 98], [0, 118]])), .05, 0, .9);
  if (p.tie !== false) T(L(poly([[-9, 104], [9, 104], [13, 172], [0, 190], [-13, 172]])), .82, 125, 1);
  T(L(blob([[-30, 30], [30, 30], [34, 108], [0, 116], [-34, 108]])), (c) => { const [a1, b1] = W2(0, 40), [a2, b2] = W2(0, 108), g = c.createLinearGradient(a1, b1, a2, b2); g.addColorStop(0, grey(.62)); g.addColorStop(1, grey(.3)); return g; }, 92, .8);
  headTone(x, y + hy * s, s, p);
  over((c) => {
    c.translate(x, y); c.scale(s, s);
    c.strokeStyle = inkA(.85); c.lineWidth = 1.5; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-34, 98); c.lineTo(-10, 150 + puff * 30); c.moveTo(34, 98); c.lineTo(10, 150 + puff * 30); c.stroke(); // lapels
    c.beginPath(); c.moveTo(-cw * .78, 118); c.quadraticCurveTo(-cw, 130, -cw, 170); c.moveTo(cw * .78, 118); c.quadraticCurveTo(cw, 130, cw, 170); c.stroke();
    if (puff > .2) { c.lineWidth = 1.4; for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(0, 260, 60 + i * 18 + puff * 30, -2.4, -.75); c.stroke(); } }
    c.translate(0, hy); headInk(c, p);
  });
}

// ---------- full figure (feet at 0,0; ~560 tall), hands in pockets ----------
function man(x, y, s, p = {}) {
  const ph = p.walk || 0, amp = p.stride ?? 0, L = (path) => xf(path, x, y, s), W2 = (lx, ly) => [x + lx * s, y + ly * s];
  const sw = Math.sin(ph * Math.PI * 2) * amp, lift = (k) => Math.max(0, Math.sin(ph * Math.PI * 2 + k)) * amp * 40;
  const leg = (e, a, up) => { // hip at (e*22,-250)
    const hx = e * 24, hy = -250, kx = hx + Math.sin(a) * 120, ky = hy + Math.cos(a) * 120 - up * .5, fx = kx + Math.sin(a * .4) * 125, fy = -up;
    T(L(blob([[hx - 26, hy], [hx + 26, hy], [kx + 21, ky], [fx + 18, fy - 6], [fx - 18, fy - 6], [kx - 21, ky]])), e < 0 ? .62 : .78, 82, 1);
    T(L(ell(fx + 14, fy - 8, 32, 12)), .9, 0, .8);
  };
  leg(1, -sw * .5, lift(Math.PI)); leg(-1, sw * .5, lift(0));
  // coat
  T(L(blob([[-66, -440], [-30, -458], [30, -458], [66, -440], [78, -300], [84, -215], [0, -205], [-84, -215], [-78, -300]])), (c) => { const [a1, b1] = W2(-80, 0), [a2, b2] = W2(80, 0), g = c.createLinearGradient(a1, b1, a2, b2); g.addColorStop(0, grey(.45)); g.addColorStop(1, grey(.82)); return g; }, 70, 1);
  // arms into pockets
  for (const e of [-1, 1]) T(L(blob([[e * 62, -446], [e * 86, -400], [e * 92, -320], [e * 70, -270], [e * 50, -276], [e * 66, -330], [e * 58, -400]])), e < 0 ? .6 : .86, 75, .9);
  T(L(poly([[-20, -456], [0, -400], [20, -456]])), .05, 0, .8);
  T(L(blob([[-17, -500], [17, -500], [19, -452], [-19, -452]])), .5, 92, .6);
  const hp = Object.assign({ hat: 2, hair: 0 }, p.head || {});
  const hs = p.headS ?? .5;
  headTone(x + (p.tilt || 0) * 6 * s, y - (460 + 170 * hs) * s, s * hs, hp);
  over((c) => {
    c.translate(x, y); c.scale(s, s); c.strokeStyle = inkA(.85); c.lineWidth = 2; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-20, -456); c.lineTo(0, -400); c.lineTo(20, -456); c.moveTo(0, -400); c.lineTo(0, -215); c.stroke();
    for (const e of [-1, 1]) { c.beginPath(); c.moveTo(e * 50, -282); c.lineTo(e * 76, -276); c.stroke(); }
    c.translate((p.tilt || 0) * 6, -(460 + 170 * hs)); c.scale(hs, hs); c.rotate((p.tilt || 0) * -.12); headInk(c, hp);
  });
}

// ---------- ribbon banner ----------
function ribbonPts(S, C, E, n = 48) { const pts = []; for (let i = 0; i <= n; i++) { const u = i / n, a = (1 - u) * (1 - u), b = 2 * u * (1 - u), d = u * u; pts.push([a * S[0] + b * C[0] + d * E[0], a * S[1] + b * C[1] + d * E[1]]); } return pts; }
function ribbon(S, C, E, h, o = {}) {
  const prog = o.prog ?? 1; if (prog <= 0) return;
  const all = ribbonPts(S, C, E), n = Math.max(2, Math.round((all.length - 1) * prog)), pts = all.slice(0, n + 1);
  const nrm = (i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1; return [-dy / L, dx / L]; };
  const top = pts.map((p, i) => { const [nx, ny] = nrm(i); const w = h * (1 + .08 * Math.sin(i * .5 + (o.ph || 0))); return [p[0] + nx * w, p[1] + ny * w]; });
  const bot = pts.map((p, i) => { const [nx, ny] = nrm(i); const w = h * (1 + .08 * Math.sin(i * .5 + (o.ph || 0))); return [p[0] - nx * w, p[1] - ny * w]; });
  const ang = Math.atan2(E[1] - S[1], E[0] - S[0]) * 180 / Math.PI;
  // folded tails (behind)
  const tail = (p, q, dir) => { const [nx, ny] = [-(q[1] - p[1]), q[0] - p[0]]; const L = Math.hypot(nx, ny) || 1, ux = (p[0] - q[0]) / L, uy = (p[1] - q[1]) / L;
    const a = [p[0] + nx / L * h * .8 + ux * h * .2, p[1] + ny / L * h * .8 + uy * h * .2 + h * .5], b = [p[0] - nx / L * h * .8 + ux * h * .2, p[1] - ny / L * h * .8 + uy * h * .2 + h * .5];
    const far = [p[0] + ux * h * 2.2, p[1] + uy * h * 2.2 + h * .5], notch = [p[0] + ux * h * 1.3, p[1] + uy * h * 1.3 + h * .5];
    return [a, [far[0] + nx / L * h * .8, far[1] + ny / L * h * .8], notch, [far[0] - nx / L * h * .8, far[1] - ny / L * h * .8], b]; };
  const t0 = tail(pts[0], pts[1]), t1 = prog > .98 ? tail(pts[pts.length - 1], pts[pts.length - 2]) : null;
  for (const tl of [t0, t1]) if (tl) T(poly(tl), .62, ang + 20, .5);
  const body = poly([...top, ...bot.slice().reverse()]);
  T(body, (c) => { const g = c.createLinearGradient(top[0][0], top[0][1], bot[0][0], bot[0][1]); g.addColorStop(0, grey(.08)); g.addColorStop(.75, grey(.14)); g.addColorStop(1, grey(.36)); return g; }, ang, .9);
  over((c) => {
    c.strokeStyle = inkA(.9); c.lineWidth = o.lw ?? 2; c.lineJoin = 'round';
    c.beginPath(); top.forEach((p, i) => i ? c.lineTo(...p) : c.moveTo(...p)); c.stroke();
    c.beginPath(); bot.forEach((p, i) => i ? c.lineTo(...p) : c.moveTo(...p)); c.stroke();
    for (const tl of [t0, t1]) if (tl) { c.beginPath(); tl.forEach((p, i) => i ? c.lineTo(...p) : c.moveTo(...p)); c.stroke(); }
    if (o.text) {
      // letters set along the curve, size measured to fit the band
      let len = 0; for (let i = 1; i < all.length; i++) len += Math.hypot(all[i][0] - all[i - 1][0], all[i][1] - all[i - 1][1]);
      const str = o.text, fam = o.fam ?? SERIF; c.font = `italic 100px ${fam}`; const w100 = c.measureText(str).width;
      const size = Math.min(h * 1.15, 100 * len * .8 / w100); c.font = `italic ${size}px ${fam}`;
      const ws = [...str].map((ch) => c.measureText(ch).width), tot = ws.reduce((a, b) => a + b, 0);
      const cum = [0]; for (let i = 1; i < all.length; i++) cum.push(cum[i - 1] + Math.hypot(all[i][0] - all[i - 1][0], all[i][1] - all[i - 1][1]));
      const at = (d) => { let i = 1; while (i < cum.length - 1 && cum[i] < d) i++; const u = (d - cum[i - 1]) / (cum[i] - cum[i - 1] || 1); return [lerp(all[i - 1][0], all[i][0], u), lerp(all[i - 1][1], all[i][1], u), Math.atan2(all[i][1] - all[i - 1][1], all[i][0] - all[i - 1][0])]; };
      let d = (len - tot) / 2; const vis = o.textN ?? str.length; c.fillStyle = inkA(.95); c.textAlign = 'center'; c.textBaseline = 'middle';
      [...str].forEach((ch, i) => { if (i < vis && d + ws[i] / 2 < len * prog) { const [px, py, a] = at(d + ws[i] / 2); c.save(); c.translate(px, py); c.rotate(a); c.fillText(ch, 0, size * .06); c.restore(); } d += ws[i]; });
    }
  });
}

// ---------- the banknote (local 1500 x 660 centred) ----------
const BILL_W = 1500, BILL_H = 660;
function serialStr(n) { const L = 'ABCDEFGHJKLMNPQRSTUVWXYZ', r = rng(n * 7 + 3); return L[Math.floor(r() * 24)] + L[Math.floor(r() * 24)] + ' ' + String(Math.floor(r() * 1e8)).padStart(8, '0') + ' ' + L[Math.floor(r() * 24)]; }
// o: portrait params, prog (0..1 draw-on of line work), serial string, rosette opts, noPortrait
function bill(x, y, s, o = {}) {
  const L = (path) => xf(path, x, y, s), prog = o.prog ?? 1, pp = o.portrait || {};
  const ovx = -360, ovy = 0, orx = 215 * (o.ovalK ?? 1), ory = 255 * (o.ovalK ?? 1);
  const tm0 = K.tMul; K.tMul = tm0 * (o.tMul ?? 1);
  // light tint panels
  T(L(rect(-130, -282, 700, 76)), .5, 0, 0);
  T(L(rect(-110, 196, 420, 64)), .48, 0, 0);
  for (const [cx, cy] of [[-660, -250], [660, -250], [-660, 250], [660, 250]]) T(L(ell(cx, cy, 56, 56)), .58, 30, 0);
  // portrait in its oval: fine horizontal ground, then the bust
  const ov = L(ell(ovx, ovy, orx, ory));
  K.tMul = tm0 * (o.bgMul ?? 1);
  clipT(ov, () => {
    T(ov, (c) => { const [gx, gy] = [x + (ovx - 60) * s, y + (ovy - 80) * s], g = c.createRadialGradient(gx, gy, 20 * s, gx, gy, 300 * s); g.addColorStop(0, grey(.16)); g.addColorStop(1, grey(.42)); return g; }, 0, 0);
    K.tMul = tm0;
    if (!o.noPortrait) bust(x + (ovx + (pp.dx || 0)) * s, y + (ovy - 40 + (pp.dy || 0)) * s, s * (pp.sc || 1), pp);
  });
  K.tMul = tm0;
  // lettering reversed out of the engraved panels
  tc.save(); tc.setTransform(...camT()); tc.translate(x, y); tc.scale(s, s);
  { const sz = fitSize(tc, 'THE BANK OF SOMEONE ELSE', 640, 48, SERIF); TclearText('THE BANK OF SOMEONE ELSE', 220, -243, sz, SERIF, '', 0); }
  { const sz = fitSize(tc, 'ONE THOUSAND', 360, 44, SERIF); TclearText('ONE THOUSAND', 100, 229, sz, SERIF); }
  for (const [cx, cy] of [[-660, -250], [660, -250], [-660, 250], [660, 250]]) { const sz = fitSize(tc, '1000', 76, 40, SERIF, 'bold'); TclearText('1000', cx, cy + 2, sz, SERIF, 'bold'); }
  tc.restore();
  under((c) => {
    c.translate(x, y); c.scale(s, s);
    if (o.backing && paperPat) { c.fillStyle = 'rgba(70,55,30,.16)'; c.fillRect(-740, -322, 1500, 672); c.fillStyle = paperPat; c.fillRect(-750, -336, 1500, 672); }
    // fine lathe tint over the whole note
    c.save(); c.beginPath(); c.rect(-700, -290, 1400, 580); c.clip();
    c.strokeStyle = inkA(.13); c.lineWidth = .9;
    for (let j = 0; j < 46; j++) { c.beginPath(); for (let xx = -700; xx <= 700 * (2 * prog - 1) + 1; xx += 8) { const yy = -290 + j * 13 + 6 * Math.sin(xx / 40 + j * .7) + 4 * Math.sin(xx / 13 - j); xx > -700 ? c.lineTo(xx, yy) : c.moveTo(xx, yy); } c.stroke(); }
    c.restore();
    // watermark: a soft portrait shadow in the open field
    if (o.watermark !== false) { c.save(); c.filter = `blur(${Math.max(1, 7 * s * CAM.s)}px)`; c.fillStyle = 'rgba(120,105,70,.10)'; c.beginPath(); c.ellipse(120, 10, 64, 80, 0, 0, Math.PI * 2); c.fill(); c.beginPath(); c.ellipse(120, 140, 120, 60, 0, Math.PI, 0); c.fill(); c.restore(); }
  });
  over((c) => {
    c.translate(x, y); c.scale(s, s);
    // border bands
    const bp = clamp(prog * 1.2);
    band(c, -720, -306, 720, -306, 22, { prog: bp, n: 5, lam: 30, lw: .9 }); band(c, 720, 306, -720, 306, 22, { prog: bp, n: 5, lam: 30, lw: .9 });
    band(c, -720, 306, -720, -306, 22, { prog: bp, n: 5, lam: 30, lw: .9 }); band(c, 720, -306, 720, 306, 22, { prog: bp, n: 5, lam: 30, lw: .9 });
    c.strokeStyle = inkA(.9); c.lineWidth = 2.2; if (prog > .2) c.strokeRect(-742, -328, 1484, 656);
    // oval frame
    ovalBand(c, ovx, ovy, orx + 14, ory + 14, 22, { prog: o.ovalProg ?? clamp(prog * 1.3 - .1), n: 6, waves: 72, lw: .9 });
    // corner rosettes
    for (const [cx, cy] of [[-660, -250], [660, -250], [-660, 250], [660, 250]]) rosette(c, cx, cy, 74, { n: 14, k: 12, inner: .78, prog: clamp(prog * 1.4 - .2), lw: .8, pts: 400 });
    // the big rosette
    const ro = o.rosette || {};
    rosette(c, 430, 30, 165, Object.assign({ n: 30, k: 11, inner: .42, m: 4, prog: clamp(prog * 1.2 - .1), lw: .9 }, ro));
    if (!ro.unwind && !ro.noSpiro) spiro(c, 430, 30, 90, 33, 52, { prog: clamp(prog * 1.3 - .3), lw: .8, scale: .78 });
    if (o.serial) { c.globalAlpha = o.serialA ?? 1; for (const [sx, sy] of [[90, -165], [420, 262]]) fitText(c, o.serial, sx, sy, 260, 34, { fam: MONO, wt: 'bold', col: inkA(.9, INK2) }); c.globalAlpha = 1; }
  });
}

// ---------- serial counter (odometer drums) ----------
function counter(c, x, y, v, cw = 70) {
  const digits = 10, gap = cw * .1, comma = cw * .45; let tot = digits * (cw + gap) + 3 * comma; let px = x - tot / 2;
  const hgt = cw * 1.45;
  c.save(); c.fillStyle = 'rgba(239,232,211,.96)'; c.fillRect(x - tot / 2 - 30, y - hgt / 2 - 30, tot + 60, hgt + 60);
  band(c, x - tot / 2 - 30, y - hgt / 2 - 30, x + tot / 2 + 30, y - hgt / 2 - 30, 18, { n: 4, lam: 22 }); band(c, x - tot / 2 - 30, y + hgt / 2 + 30, x + tot / 2 + 30, y + hgt / 2 + 30, 18, { n: 4, lam: 22 });
  for (let i = digits - 1; i >= 0; i--) {
    const pw = Math.pow(10, i), q = v / pw, d = Math.floor(q) % 10;
    // odometer: roll only while every lower drum is passing 9 -> 0
    const lowFrac = i === 0 ? q - Math.floor(q) : clamp(((v % pw) / pw - (1 - 1 / pw * 1)) * pw);
    const fr = i === 0 ? lowFrac : clamp((v % pw - (pw - 1)));
    c.save(); c.beginPath(); c.rect(px, y - hgt / 2, cw, hgt); c.clip();
    const g = c.createLinearGradient(0, y - hgt / 2, 0, y + hgt / 2); g.addColorStop(0, 'rgba(24,66,52,.35)'); g.addColorStop(.25, 'rgba(24,66,52,.04)'); g.addColorStop(.75, 'rgba(24,66,52,.04)'); g.addColorStop(1, 'rgba(24,66,52,.35)');
    c.fillStyle = '#f3eddb'; c.fillRect(px, y - hgt / 2, cw, hgt);
    const sz = fitSize(c, '0', cw * .8, cw * 1.05, MONO, 'bold'); c.font = `bold ${sz}px ${MONO}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = inkA(.95, INK2);
    c.fillText(String(d), px + cw / 2, y - fr * hgt * .9); c.fillText(String((d + 1) % 10), px + cw / 2, y + hgt * .9 - fr * hgt * .9);
    c.fillStyle = g; c.fillRect(px, y - hgt / 2, cw, hgt); c.restore();
    c.strokeStyle = inkA(.9); c.lineWidth = 2; c.strokeRect(px, y - hgt / 2, cw, hgt);
    px += cw + gap;
    if (i === 9 || i === 6 || i === 3) { c.fillStyle = inkA(.9); c.beginPath(); c.arc(px + comma / 2 - gap / 2, y + hgt / 2 - 6, 5, 0, Math.PI * 2); c.fill(); px += comma; }
  }
  c.restore();
}
