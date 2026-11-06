// The film: 1963 black-and-white print, 1.85:1 letterboxed in 1920x1080.
// Scenes paint luminance only (greys) into SC, a 1280x692 scene canvas, in frame units (FW x FH = 1920 x 1038).
// filmOut() then prints it: upscale (lens softness), density flicker, halation bloom from the highlights,
// vignette, moving clumped grain, print dirt, gate weave, burned-in subtitles, black bars.
const FW = 1920, FH = 1038, BAR = (H - FH) / 2;
const RS = 2 / 3, SCW = Math.round(FW * RS), SCH = Math.round(FH * RS);
const SC = mkCanvas(SCW, SCH), sg = SC.getContext('2d');
const HA = mkCanvas(SCW / 4, Math.round(SCH / 4)), ha = HA.getContext('2d');
const HB = mkCanvas(SCW / 16, Math.round(SCH / 16)), hb = HB.getContext('2d');

// value helpers (v in 0..1, a grey)
function gv(v, a = 1) { const c = Math.round(clamp(v) * 255); return `rgba(${c},${c},${c},${a})`; }
function linG(g, x0, y0, x1, y1, stops) { const l = g.createLinearGradient(x0, y0, x1, y1); for (const [o, v, a] of stops) l.addColorStop(o, gv(v, a ?? 1)); return l; }
function radG(g, x, y, r0, r1, stops, ox = 0, oy = 0) { const r = g.createRadialGradient(x + ox, y + oy, r0, x, y, r1); for (const [o, v, a] of stops) r.addColorStop(o, gv(v, a ?? 1)); return r; }
function poly(g, pts) { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); }
function ell(g, x, y, rx, ry, rot = 0) { g.beginPath(); g.ellipse(x, y, Math.abs(rx), Math.abs(ry), rot, 0, TAU); }
// A soft shadow or glow blob (blurred), drawn with a canvas filter.
function softFill(g, blur, fn) { g.save(); g.filter = `blur(${Math.max(.1, blur * RS).toFixed(2)}px)`; fn(); g.restore(); }

// ---------- grain: clumped silver grain, 6 tiles, seeded, picked per frame ----------
const FGRAIN = [];
(function buildFilmGrain() {
  const s = 384;
  for (let k = 0; k < 6; k++) {
    const a = mkCanvas(s, s), ag = a.getContext('2d'), d = ag.createImageData(s, s), R = mulberry(4100 + k * 17);
    for (let i = 0; i < s * s; i++) { const v = 128 + (R() + R() + R() + R() - 2) * 92; d.data[i * 4] = d.data[i * 4 + 1] = d.data[i * 4 + 2] = v; d.data[i * 4 + 3] = 255; }
    ag.putImageData(d, 0, 0);
    const b = mkCanvas(s, s), bg = b.getContext('2d'); bg.filter = 'blur(0.6px) contrast(1.6)'; bg.drawImage(a, 0, 0); bg.drawImage(a, -s, 0); bg.drawImage(a, s, 0);
    FGRAIN.push(b);
  }
})();

// ---------- the print ----------
const SUBFONT = '500 italic {s}px "Helvetica Neue", Helvetica, Arial, sans-serif';
const SUBFONT_R = '500 {s}px "Helvetica Neue", Helvetica, Arial, sans-serif';
// subs: { words: [{w, on}], font } -> the full line is laid out once (fitted), words show from their time.
function drawSubs(g, t, subs) {
  if (!subs) return;
  const line = subs.words.map((w) => w.w).join(' ');
  const maxW = FW * .62;
  const size = fitText(g, line, maxW, 56, subs.font);
  const sp = g.measureText(' ').width, full = g.measureText(line).width;
  let x = FW / 2 - full / 2; const y = FH - 62;
  g.save(); g.textBaseline = 'alphabetic'; g.lineJoin = 'round';
  for (const w of subs.words) {
    const ww = g.measureText(w.w).width;
    if (t >= w.on) {
      g.lineWidth = size * .14; g.strokeStyle = 'rgba(8,8,8,.85)'; g.strokeText(w.w, x, y);
      g.shadowColor = 'rgba(255,255,255,.45)'; g.shadowBlur = 7; g.fillStyle = 'rgb(246,246,244)'; g.fillText(w.w, x, y); g.shadowBlur = 0;
    }
    x += ww + sp;
  }
  g.restore();
}

// fx: { fade: 0..1 to black, subs }
function filmOut(g, t, fx = {}) {
  const f = Math.round(t * 24);
  // halation: highlights above ~0.8 spread into the dark around them (two radii)
  ha.save(); ha.clearRect(0, 0, HA.width, HA.height); ha.filter = 'brightness(.6) contrast(5.5) blur(2px)'; ha.drawImage(SC, 0, 0, HA.width, HA.height); ha.restore();
  hb.save(); hb.clearRect(0, 0, HB.width, HB.height); hb.filter = 'blur(2.5px)'; hb.drawImage(HA, 0, 0, HB.width, HB.height); hb.restore();
  // gate weave (slow drift + per-frame jitter) and density flicker
  const dx = n1(31, f * .21) * 1.7 + (rnd(f, 41) - .5) * .9, dy = n1(37, f * .17) * 2.4 + (rnd(f, 43) - .5) * 1.1;
  const dens = 1 + .03 * n1(51, f * .45) + .022 * (rnd(f, 53) - .5);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.filter = 'none';
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  g.translate(dx, BAR + dy);
  g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
  g.filter = `brightness(${dens.toFixed(3)}) contrast(1.16)`; g.drawImage(SC, -6, -6, FW + 12, FH + 12); g.filter = 'none';
  g.globalCompositeOperation = 'screen'; g.globalAlpha = .55; g.drawImage(HA, -6, -6, FW + 12, FH + 12);
  g.globalAlpha = .4; g.drawImage(HB, -6, -6, FW + 12, FH + 12);
  // lens vignette
  g.globalCompositeOperation = 'multiply'; g.globalAlpha = 1;
  const vg = g.createRadialGradient(FW / 2, FH / 2, FH * .35, FW / 2, FH / 2, FW * .62);
  vg.addColorStop(0, '#fff'); vg.addColorStop(.7, 'rgb(222,222,222)'); vg.addColorStop(1, 'rgb(150,150,150)');
  g.fillStyle = vg; g.fillRect(-10, -10, FW + 20, FH + 20);
  g.globalCompositeOperation = 'source-over';
  if (fx.fade > 0) { g.fillStyle = `rgba(0,0,0,${clamp(fx.fade).toFixed(3)})`; g.fillRect(-10, -10, FW + 20, FH + 20); }
  // grain (strongest in the mid-greys, as on a print: overlay leaves pure black and white nearly alone)
  const tile = FGRAIN[f % FGRAIN.length], pat = g.createPattern(tile, 'repeat');
  pat.setTransform(new DOMMatrix().translate(-Math.floor(rnd(f, 3) * 384), -Math.floor(rnd(f, 7) * 384)).scale(1.55));
  g.globalCompositeOperation = 'overlay'; g.globalAlpha = .27; g.fillStyle = pat; g.fillRect(-10, -10, FW + 20, FH + 20);
  g.globalCompositeOperation = 'soft-light'; g.globalAlpha = .16; g.fillRect(-10, -10, FW + 20, FH + 20);
  g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
  // print dirt: a dark speck or two most frames, a rare white fleck, a rare hair
  const nd = (rnd(f, 61) < .55 ? 1 : 0) + (rnd(f, 62) < .2 ? 1 : 0);
  for (let i = 0; i < nd; i++) {
    const x = rnd(f, 70 + i) * FW, y = rnd(f, 80 + i) * FH, r = 1.2 + rnd(f, 90 + i) * 3.2;
    g.fillStyle = `rgba(10,10,10,${(.45 + rnd(f, 95 + i) * .4).toFixed(2)})`; ell(g, x, y, r, r * (.5 + rnd(f, 99 + i) * .6), rnd(f, 97 + i) * 3); g.fill();
  }
  if (rnd(f, 63) < .12) { const x = rnd(f, 64) * FW, y = rnd(f, 65) * FH; g.fillStyle = 'rgba(255,255,255,.55)'; ell(g, x, y, 1.6, 1.1, 0); g.fill(); }
  if (rnd(f, 66) < .04) {
    const x = rnd(f, 67) * FW, y = rnd(f, 68) * FH; g.strokeStyle = 'rgba(12,12,12,.5)'; g.lineWidth = 1.3; g.beginPath(); g.moveTo(x, y);
    g.bezierCurveTo(x + 30, y + 10 + rnd(f, 69) * 30, x + 10, y + 50, x + 40 + rnd(f, 71) * 30, y + 70); g.stroke();
  }
  drawSubs(g, t, fx.subs);
  g.restore();
  // the hard mask of the 1.85 gate: black bars
  g.fillStyle = '#000'; g.fillRect(0, 0, W, BAR + 1); g.fillRect(0, H - BAR - 1, W, BAR + 1);
}
