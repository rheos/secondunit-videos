// Even-weave linen tile, copied from js/crossstitch/core.js (buildFabric) so the break hands into the cross-stitch verse on the same cloth.
const XS = (() => { const TAU = Math.PI * 2, mkCanvas = (w, h) => mk(w, h);
function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const FAB_LEVELS = [128, 64, 32, 16, 8], FAB = {};
function buildFabric() {
  const L = 128, N = 8, S = L * N, c = mkCanvas(S, S), g = c.getContext('2d');
  const R = mulberry(77);
  g.fillStyle = '#e4d9c1'; g.fillRect(0, 0, S, S);
  const q = L / 4;
  for (let cj = 0; cj < N; cj++) for (let ci = 0; ci < N; ci++) {
    for (let b = 0; b < 4; b++) for (let a = 0; a < 4; a++) {
      const x0 = ci * L + a * q, y0 = cj * L + b * q, hor = (a + b) % 2 === 0;
      const v = 222 + (R() - .5) * 16;
      g.fillStyle = `rgb(${v + 6},${v - 1},${v - 20})`; g.fillRect(x0, y0, q, q);
      // three fibres per sub-square, rounded by a dark edge and light core
      for (let k = 0; k < 3; k++) {
        const o = (k + .5) * q / 3;
        g.lineWidth = q / 3.1; g.strokeStyle = `rgba(150,128,95,${.28 + R() * .12})`;
        g.beginPath(); if (hor) { g.moveTo(x0, y0 + o); g.lineTo(x0 + q, y0 + o); } else { g.moveTo(x0 + o, y0); g.lineTo(x0 + o, y0 + q); } g.stroke();
        g.lineWidth = q / 7; g.strokeStyle = `rgba(255,250,236,${.35 + R() * .2})`;
        g.beginPath(); if (hor) { g.moveTo(x0, y0 + o - 1.5); g.lineTo(x0 + q, y0 + o - 1.5); } else { g.moveTo(x0 + o - 1.5, y0); g.lineTo(x0 + o - 1.5, y0 + q); } g.stroke();
      }
      // fibre fuzz
      for (let k = 0; k < 5; k++) {
        g.strokeStyle = `rgba(${R() < .5 ? '120,100,70' : '255,250,235'},${.15 + R() * .15})`; g.lineWidth = 1;
        const fx = x0 + R() * q, fy = y0 + R() * q, an = (hor ? 0 : Math.PI / 2) + (R() - .5) * .6, l = 4 + R() * 9;
        g.beginPath(); g.moveTo(fx, fy); g.lineTo(fx + Math.cos(an) * l, fy + Math.sin(an) * l); g.stroke();
      }
    }
    // block relief: raised centre, channels at the cell edges
    const rg = g.createRadialGradient(ci * L + L * .45, cj * L + L * .42, L * .1, ci * L + L / 2, cj * L + L / 2, L * .72);
    rg.addColorStop(0, 'rgba(255,252,240,.16)'); rg.addColorStop(.7, 'rgba(0,0,0,0)'); rg.addColorStop(1, 'rgba(80,60,35,.22)');
    g.fillStyle = rg; g.fillRect(ci * L, cj * L, L, L);
  }
  // channels between blocks
  g.strokeStyle = 'rgba(110,90,60,.28)'; g.lineWidth = 5;
  for (let k = 0; k <= N; k++) { g.beginPath(); g.moveTo(k * L, 0); g.lineTo(k * L, S); g.moveTo(0, k * L); g.lineTo(S, k * L); g.stroke(); }
  // holes at every grid corner
  for (let cj = 0; cj <= N; cj++) for (let ci = 0; ci <= N; ci++) {
    const x = ci * L + (R() - .5) * 3, y = cj * L + (R() - .5) * 3, r = L * (.12 + R() * .025);
    const hg = g.createRadialGradient(x + 2, y + 2, 0, x, y, r);
    hg.addColorStop(0, 'rgba(48,36,22,.95)'); hg.addColorStop(.55, 'rgba(70,55,35,.8)'); hg.addColorStop(1, 'rgba(90,70,45,0)');
    g.fillStyle = hg; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  }
  // grain noise
  const id = g.getImageData(0, 0, S, S), d = id.data;
  for (let k = 0; k < d.length; k += 4) { const nn = (R() - .5) * 14; d[k] += nn; d[k + 1] += nn; d[k + 2] += nn; }
  g.putImageData(id, 0, 0);
  FAB[128] = c;
  let prev = c;
  for (const l of FAB_LEVELS.slice(1)) {
    const cc = mkCanvas(l * N, l * N), gg = cc.getContext('2d'); gg.imageSmoothingQuality = 'high';
    gg.drawImage(prev, 0, 0, l * N, l * N); FAB[l] = cc; prev = cc;
  }
}
buildFabric(); return { FAB }; })();
