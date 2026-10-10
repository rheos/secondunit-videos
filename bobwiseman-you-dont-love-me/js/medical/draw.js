// Engraving / lithograph helpers for the medical-chart look. Page space: PW x PH, origin top-left.
const PW = 900, PH = 1180;
const INK = '#2f2219', PAPER = '#eee3c9';
const C = {
  ink: [47, 34, 25], paper: [238, 227, 201], flesh: [232, 176, 156], flesh2: [210, 132, 118], bone: [239, 225, 188],
  red: [166, 52, 44], blue: [86, 108, 146], fat: [233, 205, 120], amber: [176, 98, 34], coat: [58, 52, 50],
  hair: [86, 58, 40], green: [92, 120, 78], yellow: [226, 178, 52], gown: [214, 222, 214],
};
const SERIF = '{s}px "Iowan Old Style", "Baskerville", Georgia, serif';
const SERIF_I = 'italic {s}px "Iowan Old Style", "Baskerville", Georgia, serif';

// Parallel engraved lines over the current clip. Lines wobble a touch so they read as hand-cut.
function hatchFill(g, x, y, w, h, ang, gap, lw = 1.1, a = 1, col = C.ink, seed = 1) {
  const cx = x + w / 2, cy = y + h / 2, R = Math.hypot(w, h) / 2 + 4;
  g.save(); g.translate(cx, cy); g.rotate(ang);
  g.strokeStyle = rgb(col, a); g.lineWidth = lw; g.beginPath();
  for (let v = -R; v <= R; v += gap) {
    const wob = (rnd(seed, v) - .5) * gap * .25;
    g.moveTo(-R, v + wob); g.lineTo(R, v - wob);
  }
  g.stroke(); g.restore();
}
// Hatch a Path2D: fill flat colour (optional), shade with lines, then ink the outline.
function plateShape(g, p, o = {}) {
  if (o.fill) { g.fillStyle = Array.isArray(o.fill) ? rgb(o.fill, o.fa ?? 1) : o.fill; g.fill(p); }
  if (o.hatch) {
    g.save(); g.clip(p);
    const [x, y, w, h] = o.box || [-1200, -1200, 2400, 2400];
    for (const hh of (Array.isArray(o.hatch[0]) ? o.hatch : [o.hatch])) hatchFill(g, x, y, w, h, hh[0], hh[1], hh[2] || 1, hh[3] ?? .55, hh[4] || C.ink, hh[5] || 3);
    if (o.shade) o.shade(g);
    g.restore();
  } else if (o.shade) { g.save(); g.clip(p); o.shade(g); g.restore(); }
  if (o.stroke !== false) { g.strokeStyle = rgb(o.sc || C.ink, o.sa ?? .95); g.lineWidth = o.lw || 2.2; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(p); }
}
// Shade one side of a shape: hatch inside clip but only on the part beyond a line (half-plane via gradient mask is costly; use a clip rect).
function sideHatch(g, p, rx, ry, rw, rh, ang, gap, lw = 1, a = .5) {
  g.save(); g.clip(p); g.beginPath(); g.rect(rx, ry, rw, rh); g.clip(); hatchFill(g, rx, ry, rw, rh, ang, gap, lw, a); g.restore();
}
function stipple(g, p, x, y, w, h, n, r, a, col, seed) {
  g.save(); g.clip(p); g.fillStyle = rgb(col, a);
  for (let i = 0; i < n; i++) { g.beginPath(); g.arc(x + rnd(seed, i) * w, y + rnd(seed, i, 2) * h, r * (.6 + rnd(seed, i, 3) * .8), 0, TAU); g.fill(); }
  g.restore();
}

// Numbered callout: leader line from anchor (ax,ay) to label point (bx,by), drawn to fraction u; numeral pops at the end.
function callout(g, num, ax, ay, bx, by, u, o = {}) {
  if (u <= 0) return;
  const k = clamp(u / .75);
  g.save(); g.strokeStyle = rgb(C.ink, .9); g.lineWidth = o.lw || 1.6; g.lineCap = 'round';
  g.beginPath(); g.arc(ax, ay, 4, 0, TAU); g.fillStyle = rgb(C.ink, .95); g.fill();
  g.beginPath(); g.moveTo(ax, ay); g.lineTo(lerp(ax, bx, k), lerp(ay, by, k)); g.stroke();
  if (num !== null && num !== undefined) {
    const p = easeOutBack(clamp((u - .7) / .3), 2.4), r = (o.r || 19) * p;
    if (p > .01) {
      g.beginPath(); g.arc(bx, by, r, 0, TAU); g.fillStyle = rgb(C.paper, 1); g.fill(); g.lineWidth = 1.6; g.stroke();
      const s = fitText(g, String(num), r * 1.35, Math.round(r * 1.25), SERIF_I);
      g.fillStyle = rgb(C.ink); g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = SERIF_I.replace('{s}', s); g.fillText(String(num), bx, by + 1);
    }
  }
  g.restore();
}
// Roman plate numeral + double-rule plate border + page number.
function plateFrame(g, roman, pageNo, side) {
  g.save(); g.strokeStyle = rgb(C.ink, .85);
  g.lineWidth = 2.4; g.strokeRect(54, 70, PW - 108, PH - 150);
  g.lineWidth = 1; g.strokeRect(62, 78, PW - 124, PH - 166);
  g.fillStyle = rgb(C.ink, .9); g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  if (roman) { const s = fitText(g, roman, 120, 30, SERIF); g.font = SERIF.replace('{s}', s); g.fillText(roman, PW / 2, 56); }
  const s2 = fitText(g, String(pageNo), 60, 24, SERIF_I); g.font = SERIF_I.replace('{s}', s2);
  g.fillText(String(pageNo), side < 0 ? 80 : PW - 80, PH - 40);
  g.restore();
}

// ---------- pre-baked textures ----------
let PAPER_TEX = null, DESK_TEX = null;
function buildTextures() {
  // paper: warm cream, mottled, foxing spots, faint chain lines
  const c = mkCanvas(PW, PH), p = c.getContext('2d'), R = mulberry(4242);
  p.fillStyle = PAPER; p.fillRect(0, 0, PW, PH);
  for (let i = 0; i < 900; i++) { const x = R() * PW, y = R() * PH, r = 20 + R() * 90; const gr = p.createRadialGradient(x, y, 0, x, y, r); const d = R() < .5; gr.addColorStop(0, d ? 'rgba(160,120,70,.035)' : 'rgba(255,250,235,.05)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); p.fillStyle = gr; p.fillRect(x - r, y - r, r * 2, r * 2); }
  for (let i = 0; i < 70; i++) { const x = R() * PW, y = R() * PH, r = 1 + R() * (R() < .1 ? 9 : 3); p.fillStyle = `rgba(150,92,40,${.08 + R() * .18})`; p.beginPath(); p.arc(x, y, r, 0, TAU); p.fill(); }
  p.strokeStyle = 'rgba(150,120,80,.05)'; p.lineWidth = 1; for (let x = 30; x < PW; x += 62) { p.beginPath(); p.moveTo(x, 0); p.lineTo(x, PH); p.stroke(); }
  // edge toning
  const eg = p.createLinearGradient(0, 0, PW, 0); eg.addColorStop(0, 'rgba(150,110,60,.12)'); eg.addColorStop(.06, 'rgba(0,0,0,0)'); eg.addColorStop(.94, 'rgba(0,0,0,0)'); eg.addColorStop(1, 'rgba(150,110,60,.14)');
  p.fillStyle = eg; p.fillRect(0, 0, PW, PH);
  const eh = p.createLinearGradient(0, 0, 0, PH); eh.addColorStop(0, 'rgba(150,110,60,.12)'); eh.addColorStop(.05, 'rgba(0,0,0,0)'); eh.addColorStop(.95, 'rgba(0,0,0,0)'); eh.addColorStop(1, 'rgba(150,110,60,.14)');
  p.fillStyle = eh; p.fillRect(0, 0, PW, PH);
  PAPER_TEX = c;
  // desk: deep green baize with fibre noise, 1024 tile
  const d = mkCanvas(1024, 1024), q = d.getContext('2d'), id = q.createImageData(1024, 1024), R2 = mulberry(77);
  for (let i = 0; i < 1024 * 1024; i++) { const v = (R2() + R2() - 1) * 14; id.data[i * 4] = 34 + v; id.data[i * 4 + 1] = 52 + v; id.data[i * 4 + 2] = 42 + v; id.data[i * 4 + 3] = 255; }
  q.putImageData(id, 0, 0);
  q.globalAlpha = .07; for (let i = 0; i < 3000; i++) { q.strokeStyle = R2() < .5 ? '#000' : '#8aa088'; q.lineWidth = 1; const x = R2() * 1024, y = R2() * 1024, a = R2() * TAU, l = 4 + R2() * 14; q.beginPath(); q.moveTo(x, y); q.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); q.stroke(); }
  DESK_TEX = d;
}
function paper(g, x = 0, y = 0, w = PW, h = PH) { g.drawImage(PAPER_TEX, x, y, w, h); }
