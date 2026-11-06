// Photocopier simulation. Every pass is a real copy of the previous one: the sheet is laid on the glass
// (a little crooked, lid up so everything outside it prints black), the optics blur it, toner noise is
// mixed in at the edges, and the drum thresholds it back to black-or-paper. Run it N times and you get
// generation loss for free: lines fatten, counters fill, specks from earlier copies get copied and grow,
// and the black bands of each copy are carried into the next.
// All of it runs on canvas filters (GPU); the only CPU pixel work is building the noise tiles once.
const SW = 2000, SH = 1125; // copy sheet, in copy pixels (shown at ~1:1 on a 1920x1080 frame)

const XN = [];   // toner noise tiles (grey 0.5 = no change, dark specks, bright dropouts, mottle)
const XF = [];   // fine edge grain (no specks)
const XD = [];   // satellite toner: white with dense dark dots, by density
const MOT = [];  // mottle tiles for solid-area development
let PAPERTEX = null;

function valueNoise(R, n) { const a = new Float32Array(n * n); for (let i = 0; i < a.length; i++) a[i] = R(); return a; }
function sampleVN(a, n, x, y) { // seamless bilinear value noise on an n x n lattice
  const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  const g = (i, j) => a[((j % n + n) % n) * n + ((i % n + n) % n)];
  return lerp(lerp(g(xi, yi), g(xi + 1, yi), u), lerp(g(xi, yi + 1), g(xi + 1, yi + 1), u), v);
}
function buildXerox() {
  if (XN.length) return;
  const S = 512;
  for (let k = 0; k < 8; k++) {
    const R = mulberry(4100 + k * 17), buf = new Float32Array(S * S);
    const l1 = valueNoise(R, 8), l2 = valueNoise(R, 32), l3 = valueNoise(R, 128);
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const gs = (R() + R() + R() - 1.5) * 0.6; // ~gaussian, sd ~0.35
      buf[y * S + x] = 0.5 + gs * 0.07 + (sampleVN(l1, 8, x / 64, y / 64) - .5) * 0.10 + (sampleVN(l2, 32, x / 16, y / 16) - .5) * 0.06 + (sampleVN(l3, 128, x / 4, y / 4) - .5) * 0.05;
    }
    const speck = (cx, cy, r, val) => { const r2 = Math.ceil(r + 1.5);
      for (let dy = -r2; dy <= r2; dy++) for (let dx = -r2; dx <= r2; dx++) {
        const d = Math.hypot(dx, dy), w = clamp(r + .7 - d); if (w <= 0) continue;
        const i = ((cy + dy + S) % S) * S + ((cx + dx + S) % S); buf[i] = lerp(buf[i], val, w);
      } };
    for (let i = 0; i < 260; i++) { // toner specks, some in little spatters
      const cx = Math.floor(R() * S), cy = Math.floor(R() * S), m = R() < .2 ? 3 + Math.floor(R() * 5) : 1;
      for (let j = 0; j < m; j++) speck(cx + Math.round((R() - .5) * 14 * (m > 1)), cy + Math.round((R() - .5) * 10 * (m > 1)), .4 + R() * R() * 1.6, .04 + R() * .12);
    }
    for (let i = 0; i < 110; i++) speck(Math.floor(R() * S), Math.floor(R() * S), .4 + R() * .9, .8 + R() * .1); // dropouts in solids
    const c = mkCanvas(S, S), g = c.getContext('2d'), d = g.createImageData(S, S);
    for (let i = 0; i < S * S; i++) { const v = clamp(buf[i]) * 255; d.data[i * 4] = d.data[i * 4 + 1] = d.data[i * 4 + 2] = v; d.data[i * 4 + 3] = 255; }
    g.putImageData(d, 0, 0); XN.push(c);
  }
  for (let k = 0; k < 4; k++) { // fine grain for the edges only
    const R = mulberry(6100 + k * 13), S1 = 256, l2 = valueNoise(R, 64);
    const c = mkCanvas(S1, S1), g = c.getContext('2d'), d = g.createImageData(S1, S1);
    for (let y = 0; y < S1; y++) for (let x = 0; x < S1; x++) { const v = .5 + (R() + R() - 1) * .07 + (sampleVN(l2, 64, x / 4, y / 4) - .5) * .06; const i = (y * S1 + x) * 4; d.data[i] = d.data[i + 1] = d.data[i + 2] = clamp(v) * 255; d.data[i + 3] = 255; }
    g.putImageData(d, 0, 0); XF.push(c);
  }
  for (let k = 0; k < 6; k++) { // satellite toner dots (density rises with k)
    const R = mulberry(6900 + k * 7), S1 = 256, dens = [.12, .2, .3, .12, .2, .3][k];
    const c = mkCanvas(S1, S1), g = c.getContext('2d'), d = g.createImageData(S1, S1);
    for (let i = 0; i < S1 * S1; i++) { const v = R() < dens ? R() * .3 : 1; d.data[i * 4] = d.data[i * 4 + 1] = d.data[i * 4 + 2] = v * 255; d.data[i * 4 + 3] = 255; }
    g.putImageData(d, 0, 0); XD.push(c);
  }
  for (let k = 0; k < 3; k++) { // mottle: blotchy 0..1 for the grey middles of big solids
    const R = mulberry(7300 + k), S2 = 256, l1 = valueNoise(R, 16), l2 = valueNoise(R, 64);
    const c = mkCanvas(S2, S2), g = c.getContext('2d'), d = g.createImageData(S2, S2);
    for (let y = 0; y < S2; y++) for (let x = 0; x < S2; x++) {
      const v = clamp(.15 + sampleVN(l1, 16, x / 16, y / 16) * .9 + (sampleVN(l2, 64, x / 4, y / 4) - .5) * .5 + (R() - .5) * .35);
      const i = (y * S2 + x) * 4; d.data[i] = d.data[i + 1] = d.data[i + 2] = v * 255; d.data[i + 3] = 255;
    }
    g.putImageData(d, 0, 0); MOT.push(c);
  }
  { // copy paper: faint fibres and cloudiness, around white
    const R = mulberry(5150), S3 = 512, l1 = valueNoise(R, 16);
    const c = mkCanvas(S3, S3), g = c.getContext('2d'), d = g.createImageData(S3, S3);
    for (let y = 0; y < S3; y++) for (let x = 0; x < S3; x++) {
      const v = 1 - (1 - sampleVN(l1, 16, x / 32, y / 32)) * .05 - R() * .035;
      const i = (y * S3 + x) * 4; d.data[i] = d.data[i + 1] = d.data[i + 2] = v * 255; d.data[i + 3] = 255;
    }
    g.putImageData(d, 0, 0);
    g.strokeStyle = 'rgba(120,110,100,.10)'; g.lineWidth = .8;
    for (let i = 0; i < 700; i++) { const x = R() * S3, y = R() * S3, a = R() * TAU, l = 4 + R() * 14; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a + 1) * l * .4, y + Math.sin(a + 1) * l * .4, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
    PAPERTEX = c;
  }
}

// Scratch canvases for the passes.
const XT = { a: null, b: null, half: null, half2: null };
function xtmp() { if (!XT.a) { XT.a = mkCanvas(SW, SH); XT.b = mkCanvas(SW, SH); XT.half = mkCanvas(SW / 2, SH / 2); XT.half2 = mkCanvas(SW / 2, SH / 2); } return XT; }

function noiseFill(g, idx, ox, oy, sc, alpha, op, set = XN) {
  const p = g.createPattern(set[idx % set.length], 'repeat');
  p.setTransform(new DOMMatrix().translateSelf(ox, oy).scaleSelf(sc, sc));
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = op; g.globalAlpha = alpha; g.fillStyle = p; g.fillRect(0, 0, SW, SH); g.restore();
}

// One copy. src, dst: SWxSH canvases (white paper = white, toner = black).
// p: { rot, dx, dy, sc, blur, bright, con, nIdx, nx, ny, edge } ; glass(g): draws objects lying on the glass with the sheet.
function xpass(src, dst, p, glass) {
  const T = xtmp(), A = T.a.getContext('2d');
  A.setTransform(1, 0, 0, 1, 0, 0); A.filter = 'none'; A.globalAlpha = 1; A.globalCompositeOperation = 'source-over';
  A.fillStyle = '#000'; A.fillRect(0, 0, SW, SH);                        // lid up: no sheet = black
  A.translate(SW / 2 + p.dx, SH / 2 + p.dy); A.rotate(p.rot); A.scale(p.sc, p.sc); A.translate(-SW / 2, -SH / 2);
  A.filter = `blur(${p.blur}px)`; A.drawImage(src, 0, 0);
  // the sheet's own edge prints as a soft grey line (light leaking under a lifted edge on one side)
  A.filter = `blur(${p.blur * 3}px)`; A.strokeStyle = 'rgba(0,0,0,.55)'; A.lineWidth = 10; A.strokeRect(3, 3, SW - 6, SH - 6);
  A.setTransform(1, 0, 0, 1, 0, 0);
  if (glass) { A.save(); A.filter = `blur(${p.blur}px)`; glass(A); A.restore(); } // lying on the glass, in copy space
  A.filter = 'none';
  noiseFill(A, p.nIdx, p.nx, p.ny, 2, 1, 'hard-light');
  const e = p.edge || 1; // finer grain on the edges (more of it = a rougher, cheaper copier)
  noiseFill(A, p.nIdx, p.nx * .7 + 91, p.ny * 1.3 + 37, 1, Math.min(1, .8 * e), 'hard-light', XF);
  if (e > 1.25) noiseFill(A, p.nIdx + 1, p.nx * 1.3 + 17, p.ny * .6 + 211, 1, Math.min(1, .8 * (e - 1)), 'hard-light', XF);
  const D = dst.getContext('2d');
  D.setTransform(1, 0, 0, 1, 0, 0); D.globalCompositeOperation = 'source-over'; D.globalAlpha = 1;
  D.filter = `brightness(${p.bright}) contrast(${p.con})`; D.drawImage(T.a, 0, 0); D.filter = 'none';
  if (p.sat) { // satellite toner: loose particles scattered in a halo just outside every edge
    const Bc = T.b.getContext('2d');
    Bc.setTransform(1, 0, 0, 1, 0, 0); Bc.globalCompositeOperation = 'source-over'; Bc.filter = 'none'; Bc.fillStyle = '#000'; Bc.fillRect(0, 0, SW, SH);
    Bc.translate(SW / 2 + p.dx, SH / 2 + p.dy); Bc.rotate(p.rot); Bc.scale(p.sc, p.sc); Bc.translate(-SW / 2, -SH / 2);
    Bc.filter = `blur(${p.satR || 4}px) brightness(${p.satB || .54}) contrast(${p.satC || 2.3})`; Bc.drawImage(src, 0, 0); Bc.setTransform(1, 0, 0, 1, 0, 0); Bc.filter = 'none';
    noiseFill(Bc, p.sat + (p.nIdx % 2) * 3, p.nx * 1.7, p.ny * .9, 1, 1, 'screen', XD);
    D.globalCompositeOperation = 'multiply'; D.filter = 'brightness(1.04) contrast(6)'; D.drawImage(T.b, 0, 0); D.filter = 'none'; D.globalCompositeOperation = 'source-over';
  }
}

// Big solids come out grey and blotchy in the middle with a hard black rim (xerographic edge effect).
function solidAreas(cv, amt, mIdx, ox, oy) {
  const T = xtmp(), h = T.half.getContext('2d'), h2 = T.half2.getContext('2d');
  h.setTransform(1, 0, 0, 1, 0, 0); h.globalCompositeOperation = 'source-over'; h.globalAlpha = 1; h.filter = 'none'; h.clearRect(0, 0, SW / 2, SH / 2);
  h.filter = 'blur(7px) invert(1) contrast(5)'; h.drawImage(cv, 0, 0, SW / 2, SH / 2); h.filter = 'none';
  // erode the mask a bit more so a rim survives: blur again and push the threshold up
  h2.setTransform(1, 0, 0, 1, 0, 0); h2.globalCompositeOperation = 'source-over'; h2.globalAlpha = 1; h2.filter = 'none'; h2.clearRect(0, 0, SW / 2, SH / 2);
  h2.filter = 'blur(4px) brightness(.8) contrast(4)'; h2.drawImage(T.half, 0, 0); h2.filter = 'none';
  const p = h2.createPattern(MOT[mIdx % MOT.length], 'repeat'); p.setTransform(new DOMMatrix().translateSelf(ox, oy).scaleSelf(1.6, 1.6));
  h2.globalCompositeOperation = 'multiply'; h2.fillStyle = p; h2.fillRect(0, 0, SW / 2, SH / 2);
  const g = cv.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = 'lighter'; g.globalAlpha = amt; g.drawImage(T.half2, 0, 0, SW, SH); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
}

// Toner onto paper. dst g (any transform already set to place the sheet), the xerox canvas, paper colour.
function printCopy(g, cv, paper, fog, tx = 0, ty = 0) {
  g.save();
  g.beginPath(); g.rect(0, 0, SW, SH); g.clip();
  g.fillStyle = paper; g.fillRect(0, 0, SW, SH);
  const pp = g.createPattern(PAPERTEX, 'repeat'); pp.setTransform(new DOMMatrix().translateSelf(tx, ty));
  g.globalCompositeOperation = 'multiply'; g.fillStyle = pp; g.fillRect(0, 0, SW, SH);
  if (fog > 0) { g.globalAlpha = fog; const fp = g.createPattern(XN[5], 'repeat'); fp.setTransform(new DOMMatrix().translateSelf(tx * 3, ty * 2)); g.fillStyle = fp; g.fillRect(0, 0, SW, SH); g.globalAlpha = 1; }
  g.drawImage(cv, 0, 0);
  g.globalCompositeOperation = 'lighten'; g.fillStyle = 'rgb(30,28,33)'; g.fillRect(0, 0, SW, SH);
  g.restore();
}
