// The backing singer's voice in the TV-news version (Bob's note, rheos/secondunit-videos#118; BACKING-VOCAL.md).
// While she holds her sung title, a second inset box is on the bulletin picture: her at a studio microphone, and
// under her a navy caption band in the bulletin's caption-generator type (white Futura, as on the calendar box):
// LIB then EL then OUS on her onsets, a bar growing through each held note, an underline under OUS to her end.
// The lead's words stay on the canary teleprinter at the bottom; hers are white, smaller, top right, in their own box.
// Shared by the pages that carry an occurrence (bv-r3a.js: the intro; bv-r3c.js: the two in the refrain); each page
// hooks its own program function and says where the box sits. Pure: a function of song time t only.

const BVT_BAND = 64, BVT_PAD = 16;
const BVT_FONT = (s) => `bold ${s}px "Futura", "Helvetica Neue", sans-serif`;
const BVT_IN = .32, BVT_OUT = .7;   // the box wipes on before LIB, off after her note
const FE_T = 1 / 24;
const BVT_BOX = { x: 584, y: 52, w: 320, h: 218 };   // her own box, top right of the picture (program pixels)
const bvtPulse = (t, a, len) => { const d = t - a; return d < 0 || d > len ? 0 : Math.sin(d / len * Math.PI); };
const bvtOn = (y, t) => t >= y.s - FE_T;
const BVT_LAY = {};
function bvtLayout(g, w) { // syllable x positions on the band, fixed for the whole note so nothing shifts as she sings
  if (BVT_LAY[w]) return BVT_LAY[w];
  const avail = w - 2 * BVT_PAD;
  for (let fs = 46; fs > 12; fs--) {
    g.font = BVT_FONT(fs);
    const ws = BV[0].syl.map(y => g.measureText(y.txt).width), gap = fs * .14, bar = fs * .6;
    const total = ws.reduce((a, b) => a + b, 0) + 2 * (bar + 2 * gap);
    if (total <= avail) {
      let x = BVT_PAD + (avail - total) / 2; const xs = [];
      ws.forEach((ww, k) => { xs.push(x); x += ww + (k < 2 ? bar + 2 * gap : 0); });
      return (BVT_LAY[w] = { fs, ws, xs, gap, bar, cap: g.measureText('H').actualBoundingBoxAscent });
    }
  }
}
function bvtWipe(o, t) { // 0..1 how much of the box is on screen: wipes on from the right, off to the right
  const a = o.syl[0].s;
  return smooth(clamp((t - (a - BVT_IN)) / (BVT_IN - 2 * FE_T))) * (1 - smooth(clamp((t - (o.end + .45)) / (BVT_OUT - .45))));
}
const bvtTwo = (t) => Math.floor(t * 12 + 1e-6) / 12;   // cel animation on twos, as the news film

// her, in box-local pixels; returns her face box (local)
function bvtSinger(g, w, h, o, t) {
  const SX = w * .4, bandY = h - BVT_BAND;
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#162544'); gr.addColorStop(1, '#24375e'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  for (let y = 10; y < bandY; y += 18) for (let x = 8; x < w; x += 18) { g.fillStyle = 'rgba(240,150,60,.16)'; g.beginPath(); g.arc(x, y, 2.2, 0, TAU); g.fill(); }
  const rg = g.createRadialGradient(SX, 70, 10, SX, 70, 120); rg.addColorStop(0, 'rgba(255,220,160,.35)'); rg.addColorStop(1, 'rgba(255,220,160,0)'); g.fillStyle = rg; g.fillRect(0, 0, w, h);
  const k = bvSyl(o, t, FE_T), singing = k >= 0 && k <= 2;
  const tq = bvtTwo(t), sway = singing ? 2.5 * Math.sin((tq - o.syl[0].s) * TAU * .9) : 0;
  g.save(); g.translate(SX + sway, 0);
  // shoulders: a burnt-orange dress, long dark hair over them
  g.beginPath(); g.moveTo(-70, bandY + 2); g.quadraticCurveTo(-66, 118, -24, 110); g.lineTo(24, 110); g.quadraticCurveTo(66, 118, 70, bandY + 2); g.closePath(); nCel(g, '#c0602a', 4);
  g.beginPath(); g.moveTo(-40, 120); g.quadraticCurveTo(-52, 20, 0, 18); g.quadraticCurveTo(52, 20, 40, 120); g.lineTo(26, 116); g.lineTo(-26, 116); g.closePath(); nCel(g, '#2c1a14', 4);
  // face, eyes shut on the held note, the mouth shaped to each vowel and closing for a moment on each consonant
  g.beginPath(); g.ellipse(0, 70, 29, 33, 0, 0, TAU); nCel(g, '#e4b48e', 4);
  g.beginPath(); g.moveTo(-30, 60); g.quadraticCurveTo(-28, 30, 0, 30); g.quadraticCurveTo(28, 30, 30, 60); g.quadraticCurveTo(14, 42, -2, 44); g.quadraticCurveTo(-18, 46, -30, 60); g.closePath(); nCel(g, '#2c1a14', 3.5);
  g.strokeStyle = NINK; g.lineWidth = 3;
  for (const s of [-1, 1]) {
    g.beginPath();
    if (singing) { g.arc(s * 11, 64, 6, .15 * Math.PI, .85 * Math.PI); g.stroke(); }
    else { g.arc(s * 11, 66, 3.8, 0, TAU); g.fillStyle = NINK; g.fill(); }
  }
  const VOW = [[9, 4], [8, 7.5], [5.5, 9]];
  if (singing) {
    const art = 1 - .75 * bvtPulse(t, o.syl[k].s - .07, .14), [mx, my] = VOW[k];
    g.beginPath(); g.ellipse(0, 88, mx * (.6 + .4 * art), Math.max(1.2, my * art), 0, 0, TAU); nCel(g, '#5a1a24', 2.5);
  } else { g.beginPath(); g.arc(0, 82, 7, .2 * Math.PI, .8 * Math.PI); g.stroke(); }
  g.restore();
  // the microphone: a chrome capsule on a stand, in front of her, below and right of her mouth
  const mx = SX + 34, my = 112;
  g.strokeStyle = NINK; g.lineWidth = 7; g.beginPath(); g.moveTo(mx + 14, bandY); g.lineTo(mx + 4, my + 18); g.stroke();
  g.strokeStyle = '#aab2c0'; g.lineWidth = 3.5; g.beginPath(); g.moveTo(mx + 14, bandY); g.lineTo(mx + 4, my + 18); g.stroke();
  g.save(); g.translate(mx, my); g.rotate(-.5);
  g.beginPath(); g.roundRect(-10, -20, 20, 40, 10); nCel(g, '#c8d0e0', 3.5);
  g.strokeStyle = 'rgba(27,21,48,.55)'; g.lineWidth = 1.5; for (let i = -14; i <= 6; i += 5) { g.beginPath(); g.moveTo(-8, i); g.lineTo(8, i); g.stroke(); }
  g.restore();
  return [SX + sway - 32, 36, 64, 72];
}

function bvtBand(g, w, h, o, t, probe) {
  const L = bvtLayout(g, w), y0 = h - BVT_BAND, base = y0 + BVT_BAND / 2 + L.cap / 2;
  const cont = [BVT_PAD - 6, y0 + 6, w - 2 * BVT_PAD + 12, BVT_BAND - 10];
  g.fillStyle = '#0b1020'; g.fillRect(0, y0, w, BVT_BAND);
  g.fillStyle = '#f0963c'; g.fillRect(0, y0, w, 3);
  g.font = BVT_FONT(L.fs); g.textAlign = 'left'; g.textBaseline = 'alphabetic';
  o.syl.forEach((y, k) => {
    if (!bvtOn(y, t)) return;
    // a caption-generator character comes up bright and settles (3 frames)
    const flash = clamp(1 - (t - (y.s - FE_T)) * 8);
    g.fillStyle = 'rgba(0,0,0,.7)'; g.fillText(y.txt, L.xs[k] + 2.5, base + 2.5);
    g.fillStyle = rgb(mix([255, 255, 255], [255, 236, 170], flash)); g.fillText(y.txt, L.xs[k], base);
    // the held note: a bar grows to the next syllable's place (under OUS: an underline across it, to her end)
    const next = k < 2 ? o.syl[k + 1].s : o.end, u = clamp((t - (y.s + .1)) / (next - FE_T - (y.s + .1)));
    const bx = k < 2 ? L.xs[k] + L.ws[k] + L.gap : L.xs[k], bw = k < 2 ? L.bar : L.ws[k], by = k < 2 ? base - L.cap * .5 - 2 : base + 5;
    if (u > 0) { g.fillStyle = 'rgba(0,0,0,.7)'; g.fillRect(bx + 2, by + 2, bw * u, 4); g.fillStyle = '#ffffff'; g.fillRect(bx, by, bw * u, 4); }
    if (probe) {
      PROBE.text(g, 'bv syllable', y.txt, L.xs[k], base, cont, { keep: true, margin: 2 });
      if (u > 0) PROBE.box(g, 'bv hold', bx, by, Math.max(1, bw * u), 4, { in: cont, margin: 2 });
    }
  });
}

// Draw her box onto the program canvas g (program pixels). opt.box: where it sits; opt.tint: the news film's warmth.
// Fires 'bv#<occurrence>.<syllable>' on each syllable's first frame and, in an audit, probes her text, her box and
// her face ('singer face'); the page reports its own people as 'face'.
function bvtInset(g, t, opt = {}) {
  const o = bvAt(t, BVT_IN + .05, BVT_OUT + .05); if (!o) return;
  if (PROBE.on) o.syl.forEach((y, k) => PROBE.edge(`bv#${o.n}.${k}`, bvtOn(y, t), bvtOn(y, ML.prevT(t))));
  const u = opt.wipe === false ? 1 : bvtWipe(o, t); if (u <= 0) return;
  const b = opt.box || BVT_BOX;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
  g.lineCap = 'butt'; g.lineJoin = 'miter'; g.setLineDash([]); g.shadowBlur = 0;
  // an electronic wipe: the box comes on from its right edge (the side nearest the frame edge) and goes off the same way
  g.beginPath(); g.rect(b.x - 8 + (b.w + 16) * (1 - u), b.y - 8, (b.w + 16) * u, b.h + 16); g.clip();
  g.beginPath(); g.roundRect(b.x - 8, b.y - 8, b.w + 16, b.h + 16, 18); g.fillStyle = '#0b1020'; g.fill();
  g.save(); g.beginPath(); g.roundRect(b.x, b.y, b.w, b.h, 14); g.clip(); g.translate(b.x, b.y);
  const face = bvtSinger(g, b.w, b.h, o, t);
  bvtBand(g, b.w, b.h, o, t, PROBE.on && u >= 1);
  g.restore();
  g.strokeStyle = '#c8d0e0'; g.lineWidth = 4; g.beginPath(); g.roundRect(b.x, b.y, b.w, b.h, 14); g.stroke();
  if (opt.tint) { g.fillStyle = 'rgba(255,190,110,.06)'; g.fillRect(b.x - 8, b.y - 8, b.w + 16, b.h + 16); }   // the news film's warmth, on the box only
  if (PROBE.on && u >= 1) {
    PROBE.box(g, 'bv inset', b.x - 8, b.y - 8, b.w + 16, b.h + 16, { keep: true });
    PROBE.box(g, 'singer face', b.x + face[0], b.y + face[1], face[2], face[3]);
  }
  g.restore();
}
