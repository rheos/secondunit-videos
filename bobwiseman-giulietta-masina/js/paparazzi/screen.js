// Halftone press: every frame is drawn in TONE (grey, white = bare paper) and SPOT RED (alpha = red ink),
// then screened pixel by pixel to a real amplitude-modulated dot screen on cream newsprint.
// Black ink sits on a 45 degree screen, red on 75 degrees, red printed slightly out of register.
// The screen can be scaled and shifted with the page (pass sc/tx/ty) so a push-in on a print grows its dots.

const TONE = mkCanvas(), tg = TONE.getContext('2d', { willReadFrequently: true });
const RED = mkCanvas(), rg = RED.getContext('2d', { willReadFrequently: true });
const LUTN = 4096, COS = new Float32Array(LUTN);
for (let i = 0; i < LUTN; i++) COS[i] = Math.cos(i / LUTN * TAU);
let PAPER = null, RAG = null;

function buildPaper() {
  // cream newsprint: base colour, slow mottling, fine fibres, a little yellowing toward the edges
  PAPER = new Uint8ClampedArray(W * H * 3); RAG = new Float32Array(W * H);
  const R = mulberry(4242);
  const fib = new Float32Array(W * H);
  for (let k = 0; k < 9000; k++) { // short fibres
    const x0 = R() * W, y0 = R() * H, a = R() * TAU, L = 4 + R() * 16, v = (R() - .5) * 18;
    for (let s = 0; s < L; s++) { const x = (x0 + Math.cos(a) * s) | 0, y = (y0 + Math.sin(a) * s) | 0; if (x >= 0 && y >= 0 && x < W && y < H) fib[y * W + x] += v; }
  }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x;
    const m = n1(31, x / 140 + n1(32, y / 170) * 1.3) * 5 + n1(33, y / 90 + x / 400) * 4;
    const ex = Math.min(x, W - x) / W, ey = Math.min(y, H - y) / H, edge = clamp(1 - Math.min(ex * 9, ey * 7));
    const g = (R() - .5) * 7 + m + fib[i] * .5;
    PAPER[i * 3] = 238 + g - edge * 6; PAPER[i * 3 + 1] = 229 + g - edge * 10; PAPER[i * 3 + 2] = 207 + g * .9 - edge * 18;
    RAG[i] = (R() - .5) * .22 + fib[i] * .006; // ragged dot edges (ink spread on rough paper)
  }
}

// opts: { sc, tx, ty } screen scale + page origin; { P } screen period (px); { white } 0..1 blowout
const INK = [24, 21, 22], REDINK = [206, 38, 34];
function press(g, opts = {}) {
  if (!PAPER) buildPaper();
  const sc = opts.sc || 1, tx = opts.tx || 0, ty = opts.ty || 0, P = (opts.P || 11) * sc;
  const T = tg.getImageData(0, 0, W, H).data, Rd = rg.getImageData(0, 0, W, H).data;
  const out = g.createImageData(W, H), O = out.data;
  const a1 = Math.PI / 4, c1 = Math.cos(a1) / P * LUTN, s1 = Math.sin(a1) / P * LUTN;
  const a2 = 75 * Math.PI / 180, c2 = Math.cos(a2) / P * LUTN, s2 = Math.sin(a2) / P * LUTN;
  const K = Math.max(2.2, P * .5), KR = K;
  const OFF = 1 << 24;
  const rdx = 3, rdy = 2; // red out of register
  const LO = opts.lo ?? .03, LS = 1 / ((opts.hi ?? .86) - LO); // levels: press-flash contrast
  for (let y = 0; y < H; y++) {
    const yy = y - ty;
    let ub = (-tx) * c1 + yy * s1, vb = -(-tx) * s1 + yy * c1;
    let ur = (-tx) * c2 + yy * s2, vr = -(-tx) * s2 + yy * c2;
    const ry = Math.min(H - 1, Math.max(0, y - rdy));
    for (let x = 0; x < W; x++, ub += c1, vb -= s1, ur += c2, vr -= s2) {
      const i = y * W + x, i4 = i * 4, rag = RAG[i];
      let pr = PAPER[i * 3], pg = PAPER[i * 3 + 1], pb = PAPER[i * 3 + 2];
      // red: alpha channel of RED, shifted
      const rx = Math.min(W - 1, Math.max(0, x - rdx));
      let dr = Rd[(ry * W + rx) * 4 + 3] / 255;
      if (dr > .004) {
        let cov;
        if (dr > .965) cov = 1;
        else {
          const sp = .5 + .25 * (COS[((ur + OFF) | 0) & 4095] + COS[((vr + OFF) | 0) & 4095]) + rag;
          cov = (sp - (1.05 - 1.1 * dr)) * KR + .5; cov = cov < 0 ? 0 : cov > 1 ? 1 : cov;
        }
        pr = pr * (1 - cov) + pr * REDINK[0] / 255 * cov; pg = pg * (1 - cov) + pg * REDINK[1] / 255 * cov; pb = pb * (1 - cov) + pb * REDINK[2] / 255 * cov;
      }
      // black: darkness from TONE, with dot gain
      let lv = (T[i4] / 255 - LO) * LS; lv = lv < 0 ? 0 : lv > 1 ? 1 : lv; let d = 1 - lv;
      if (d > .004) {
        d = d * (1.12 - .12 * d); // dot gain lifts the mid-tones
        let cov;
        if (d > .975) cov = 1;
        else {
          const sp = .5 + .25 * (COS[((ub + OFF) | 0) & 4095] + COS[((vb + OFF) | 0) & 4095]) + rag;
          cov = (sp - (1.05 - 1.1 * d)) * K + .5; cov = cov < 0 ? 0 : cov > 1 ? 1 : cov;
        }
        cov *= .96;
        pr = pr * (1 - cov) + INK[0] * cov; pg = pg * (1 - cov) + INK[1] * cov; pb = pb * (1 - cov) + INK[2] * cov;
      }
      O[i4] = pr; O[i4 + 1] = pg; O[i4 + 2] = pb; O[i4 + 3] = 255;
    }
  }
  g.putImageData(out, 0, 0);
}

// Flashbulb on the print: a hard white burst, then a cool blue-white afterimage that fades where the bulb fired.
function flashPost(g, fl) {
  if (!fl) return;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  if (fl.white > .003) { g.globalCompositeOperation = 'source-over'; g.fillStyle = `rgba(255,255,253,${clamp(fl.white)})`; g.fillRect(0, 0, W, H); }
  if (fl.after > .003) {
    g.globalCompositeOperation = 'screen';
    const r = fl.r || 520, gr = g.createRadialGradient(fl.x, fl.y, 0, fl.x, fl.y, r);
    const a = clamp(fl.after) * .75;
    gr.addColorStop(0, `rgba(205,225,255,${a})`); gr.addColorStop(.25, `rgba(150,185,245,${a * .7})`);
    gr.addColorStop(.6, `rgba(70,100,170,${a * .3})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    // the purple-green ring of an afterimage
    g.globalCompositeOperation = 'multiply';
    const g2 = g.createRadialGradient(fl.x, fl.y, r * .55, fl.x, fl.y, r * 1.05);
    g2.addColorStop(0, 'rgba(255,255,255,0)'); g2.addColorStop(.5, `rgba(205,220,240,${a * .5})`); g2.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = g2; g.fillRect(0, 0, W, H);
  }
  g.restore();
}
