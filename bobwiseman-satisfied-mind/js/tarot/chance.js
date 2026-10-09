// The board game's orange CHANCE card, for the running joke: the second solo opens with one landing on the
// sampler and flipping to BETTER SOLO. Design, inks, fonts and fitting COPIED from js/boardgame/core.js +
// art.js buildCards (read only, never edited there); the print shop is a lighter copy using this look's textures.
const BG_INK = { red: '#c3372b', orange: '#e57f2c', black: '#221d1a', cream: '#efe3c4' };
const BG_FONT = { slab: 'Rockwell', clar: 'Superclarendon' };
const CHANCE_FIT = [];
function bgFitText(g, text, cx, cy, maxW, maxH, family, weight) {
  let s = maxH / .72;
  for (let i = 0; i < 60; i++) {
    g.font = `${weight} ${s}px "${family}"`;
    const m = g.measureText(text), hh = (m.actualBoundingBoxAscent + m.actualBoundingBoxDescent) || s * .72;
    if (m.width <= maxW && hh <= maxH) break; s *= .95;
  }
  g.font = `${weight} ${s}px "${family}"`; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  const m = g.measureText(text), asc = m.actualBoundingBoxAscent, desc = m.actualBoundingBoxDescent;
  g.fillText(text, cx, cy + (asc - desc) / 2);
  CHANCE_FIT.push({ text, w: m.width, maxW, h: asc + desc, maxH, ok: m.width <= maxW + .5 && asc + desc <= maxH + .5 });
}
function bgRR(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function bgPrint(w, h, paper, inks, art, seed) {
  const base = mkCanvas(w, h), g = base.getContext('2d');
  g.fillStyle = paper; g.fillRect(0, 0, w, h);
  g.globalCompositeOperation = 'multiply'; g.globalAlpha = .5; g.drawImage(STOCK, 0, 0, w, h); g.globalAlpha = 1;
  const plate = mkCanvas(w, h), pg = plate.getContext('2d');
  for (const ink of inks) {
    pg.globalCompositeOperation = 'source-over'; pg.clearRect(0, 0, w, h); pg.fillStyle = '#000'; pg.strokeStyle = '#000';
    art(pg, ink.name);
    pg.globalCompositeOperation = 'source-in'; pg.fillStyle = ink.color; pg.fillRect(0, 0, w, h);
    pg.globalCompositeOperation = 'destination-out'; pg.globalAlpha = .6; pg.drawImage(TOOTH, (seed * 37) % 200 - 200, 0, 1024, 1024); pg.globalAlpha = 1;
    g.globalCompositeOperation = 'multiply'; g.drawImage(plate, ink.off[0], ink.off[1]);
  }
  g.globalCompositeOperation = 'source-over';
  // worn edge and scuffs
  g.strokeStyle = 'rgba(245,238,222,.55)'; g.lineWidth = 10; bgRR(g, 0, 0, w, h, 30); g.stroke();
  const R = mulberry(seed); g.lineCap = 'round';
  for (let i = 0; i < 30; i++) { const x = R() * w, y = R() * h, l = 6 + R() * 40, a = R() * TAU; g.strokeStyle = R() < .6 ? `rgba(245,238,222,${.2 + R() * .35})` : `rgba(60,45,30,${.06 + R() * .1})`; g.lineWidth = .6 + R() * 2.2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
  // round the corners
  const out = mkCanvas(w, h), og = out.getContext('2d'); bgRR(og, 0, 0, w, h, 30); og.clip(); og.drawImage(base, 0, 0);
  return out;
}
let CHANCE = null;
function buildChance() {
  const P = 10, w = 90 * P, h = 60 * P, M = (mm) => mm * P;
  const back = bgPrint(w, h, BG_INK.cream, [{ name: 'orange', color: BG_INK.orange, off: [0, 0] }, { name: 'black', color: BG_INK.black, off: [-4, 3] }], (g, ink) => {
    if (ink === 'orange') { bgRR(g, M(3), M(3), w - M(6), h - M(6), M(3)); g.fill(); g.globalCompositeOperation = 'destination-out'; bgFitText(g, '?', M(45), M(28), M(34), M(34), BG_FONT.clar, '900'); g.globalCompositeOperation = 'source-over'; }
    if (ink === 'black') { g.lineWidth = M(.6); bgRR(g, M(5), M(5), w - M(10), h - M(10), M(2.5)); g.stroke(); bgFitText(g, 'CHANCE', M(45), M(51), M(50), M(7.5), BG_FONT.slab, 'bold'); }
  }, 21);
  const front = bgPrint(w, h, '#f1e7cd', [{ name: 'orange', color: BG_INK.orange, off: [0, 0] }, { name: 'red', color: BG_INK.red, off: [3, -2] }, { name: 'black', color: BG_INK.black, off: [-3, 2] }], (g, ink) => {
    if (ink === 'orange') { g.fillRect(M(4), M(4), w - M(8), M(12)); g.globalCompositeOperation = 'destination-out'; bgFitText(g, 'CHANCE', M(45), M(10), M(44), M(7.5), BG_FONT.slab, 'bold'); g.globalCompositeOperation = 'source-over'; }
    // Bob's wording, fitted in the organ card's headline box (76 x 13 mm on a 90 mm card), centred in the space below the band
    if (ink === 'red') bgFitText(g, 'BETTER SOLO', M(45), M(36), M(76), M(13), BG_FONT.clar, '900');
    if (ink === 'black') { g.lineWidth = M(.6); g.strokeRect(M(4), M(4), w - M(8), h - M(8)); }
  }, 24);
  const bad = CHANCE_FIT.filter((f) => !f.ok); if (bad.length) console.error('chance text overflow', JSON.stringify(bad));
  CHANCE = { back, front };
}
// pose on the sampler (stitch cells): drops in, lands, lifts and flips on the 199.44 piano note, then slides away
function chancePose(t) {
  if (t >= 200.75) return null;
  const land = 198.62;
  let x = 0, y = 4, rot = -.05, sc = 1, fx = 1, face = false, lift = 0;
  if (t < land) { const u = smooth(lin(t, 198.0, land)); sc = lerp(1.9, 1, u); x = lerp(40, 0, u); y = lerp(-175, 4, u); rot = lerp(.6, -.05, u); lift = (1 - u) * 6; }
  else if (t < 198.82) { const b = (t - land) / .2; sc = 1 + .025 * Math.sin(Math.PI * b); }
  const f = lin(t, 199.0, 199.438);
  if (f > 0) { fx = Math.cos(Math.PI * f); face = f >= .5; sc *= 1 + .1 * Math.sin(Math.PI * f); lift = 1.6 * Math.sin(Math.PI * f); if (t >= 199.438) { fx = 1; face = true; } }
  if (t >= 199.438 && t < 199.6) sc *= 1 + .02 * Math.sin(Math.PI * (t - 199.438) / .16);
  const e = smooth(lin(t, 200.3, 200.72)); x += e * 95; y -= e * 18; rot += e * .35;
  return { x, y, rot, sc, fx, face, lift };
}
function drawChance(g, t) {
  const p = chancePose(t); if (!p) return;
  if (!CHANCE) buildChance();
  const w = 40 * p.sc, h = 26.67 * p.sc;
  g.save(); g.translate(p.x, p.y); g.rotate(p.rot);
  g.fillStyle = 'rgba(20,10,4,.35)'; bgRR(g, -w / 2 * Math.abs(p.fx) + .6 + p.lift * .5, -h / 2 + 1 + p.lift, w * Math.abs(p.fx), h, 1.2); g.fill();
  g.scale(Math.max(.02, Math.abs(p.fx)), 1);
  g.drawImage(p.face ? CHANCE.front : CHANCE.back, -w / 2, -h / 2, w, h);
  g.restore();
}
