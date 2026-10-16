// Reform Party, Dali look: grade, captions and the frame. Loads last.
// ---------- grade ----------
function grade(t, layer) {
  const gold = ease(t, 172, 200) * (1 - ease(t, 205, 215)), night = ease(t, 199, 216);
  if (gold > 0) { g.globalCompositeOperation = 'soft-light'; g.fillStyle = `rgba(255,170,90,${gold * .5})`; g.fillRect(0, 0, W, H); }
  if (night > 0) { g.globalCompositeOperation = 'multiply'; g.fillStyle = rgb(mix([255, 255, 255], [52, 52, 104], night)); g.fillRect(0, 0, W, H); }
  g.globalCompositeOperation = 'source-over';
  if (night > .4 && !layer) { const hy = H / 2 - C.f * Math.tan(C.p); for (let i = 0; i < 160; i++) { const sx = rnd(i, 1) * W, sy = rnd(i, 2) * Math.min(hy - 20, H); if (sy < 0) continue; g.fillStyle = `rgba(255,250,235,${(night - .4) * .9 * (.4 + .6 * rnd(i, 3)) * (.75 + .25 * Math.sin(t * 3 + i))})`; g.fillRect(sx, sy, 2, 2); } }
  const b = burnAmt(t); if (b > 0) { const { p, k } = manGeom(); g.globalCompositeOperation = 'screen'; const R = Math.max(W, 70 * k); const rg = g.createRadialGradient(p[0], p[1] - 6 * k, 0, p[0], p[1], R); rg.addColorStop(0, `rgba(255,130,50,${.45 * b})`); rg.addColorStop(1, 'rgba(255,90,30,0)'); g.fillStyle = rg; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'source-over'; }
}
function vignette() { const vg = g.createRadialGradient(W / 2, H * .55, H * .45, W / 2, H * .55, H * 1.05); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(30,15,10,.38)'); g.fillStyle = vg; g.fillRect(0, 0, W, H); }

// ---------- captions ----------
const FONT = 'italic {s}px "Didot", "Bodoni 72", Georgia, serif';
function captions(t) {
  let L = null; for (let i = 0; i < LINES.length; i++) { const l = LINES[i], nx = LINES[i + 1]; const end = Math.min(l.e + .6, nx ? nx.s - .05 : 1e9); if (t >= l.s - .05 && t < end) L = l; }
  if (!L) return; const n = wordsShown(L, t + .05); if (!n) return;
  const size = fitText(g, L.text, 1560, 50, FONT); g.font = FONT.replace('{s}', size); g.textBaseline = 'alphabetic';
  const words = L.text.split(/\s+/), gap = size * .27, widths = words.map((w) => g.measureText(w).width), tw = widths.reduce((a, b) => a + b, 0) + gap * (words.length - 1);
  let x = W / 2 - tw / 2; const y = 1032;
  for (let i = 0; i < words.length; i++) { if (i < n) { const age = t - (L.words[i] ? L.words[i].s : L.s), a = clamp(age / .12 + .2);
    g.save(); g.globalAlpha = a; g.shadowColor = 'rgba(20,10,5,.85)'; g.shadowBlur = 14; g.shadowOffsetY = 3; g.fillStyle = '#f7ecd3'; g.fillText(words[i], x, y); g.restore();
    probeWord(t, L.i, i, (tt) => i < wordsShown(L, tt + .05)); }
    x += widths[i] + gap; }
}

// ---------- frame ----------
function drawCar(t) {
  const seats = SEATS.map((s, i) => ({ s, i, d: PL(s.x, SEAT, s.z)[2] })).sort((a, b) => b.d - a.d), mid = PL(0, SEAT, 0)[2];
  const seatDraw = ({ s, i }) => { const G = seatGeom(s); crutch(G.crutch[0], G.crutch[1]); const a = PL(...G.beamA), b = PL(...G.beamB); seg(a, b, .1 * kAt(a), '#4a2a14'); const p = PL(s.x, SEAT, s.z); if (p[2] < .25) return; suit(p[0], p[1], kAt(p), seatState(s, t, i)); };
  seats.filter((x) => x.d > mid).forEach(seatDraw);
  tableBody(t); driverHat();
  chessPieces(t); speakerphone(t); dime(t); pie(t); book(t); chips(t); jailModel(t); newspapers(t);
  whiteboard(t, false);
  seats.filter((x) => x.d <= mid).forEach(seatDraw);
  tapeRecorders(t); truth(t, false); micBooms(t); pieBirds(t); bobPopUp(t);
}
function render(t) {
  C = camAt(t); CP = Math.cos(C.p); SP = Math.sin(C.p); CX = carX(t); CZ = carZ(t); YAW = yaw(t);
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  skyAndGround(t);
  const list = [];
  list.push({ z: P(MAN.x, 0, MAN.z)[2], draw: () => theMan(t), shadow: () => shadowStick(MAN.x, 0, 22, MAN.z, 6, t) });
  elephantsInto(t, list); jails(t, list); poorPerson(t, list); cops(t, list);
  for (const c of CAMPS) { const z = P(c.X, 0, c.Z)[2]; if (z > 2) list.push({ z, draw: () => camp(c, t), shadow: () => shadowOf([[c.X - c.r, 0, c.Z], [c.X + c.r, 0, c.Z], [c.X, c.r, c.Z]], t) }); }
  for (const l of LAMPS) { const z = P(l.X, 0, l.Z)[2]; if (z > 2) list.push({ z, draw: () => lamp(l, t, false), shadow: () => shadowStick(l.X, 0, 5, l.Z, .15, t) }); }
  for (const b of BIKES) { const o = bike(b, t); if (o) list.push(o); }
  crowdInto(t, list); bigEar(t, list); gagMouth(t, list); tumblePapers(t, list); suitColumn(t, list); teeth(t, list); clockCar(t, list); giantChess(t, list);
  for (const o of list) if (o.z > .5 && o.shadow) o.shadow();
  tableShadow(t);
  list.sort((a, b) => b.z - a.z); for (const o of list) if (o.z > .3) o.draw();
  spinDevils(t); bigGavel(t);
  grade(t);
  for (const l of LAMPS) lamp(l, t, true); spinners(t);
  // the car layer: drawn, graded, lit by its own emissive props, masked to its own pixels, then laid over the fire
  g = gc; gc.setTransform(1, 0, 0, 1, 0, 0); gc.globalCompositeOperation = 'source-over'; gc.globalAlpha = 1; gc.clearRect(0, 0, W, H);
  drawCar(t); gm.clearRect(0, 0, W, H); gm.drawImage(CARC, 0, 0); grade(t, true); gc.globalCompositeOperation = 'destination-in'; gc.drawImage(MASK, 0, 0); gc.globalCompositeOperation = 'source-over';
  whiteboard(t, true); truth(t, true); g = g0;
  const carBehind = P(CX, 0, CZ)[2] > P(MAN.x, 0, MAN.z)[2];
  if (carBehind) g.drawImage(CARC, 0, 0);
  manFire(t); ballotEmbers(t);
  if (!carBehind) g.drawImage(CARC, 0, 0);
  bobWalk(t);
  vignette();
  drawGrain(g, t, .1);
  const fin = ease(t, 266.5, 268.9), fo = 1 - ease(t, 0, 1.2), blk = Math.max(fin, fo); if (blk > 0) { g.fillStyle = `rgba(0,0,0,${blk})`; g.fillRect(0, 0, W, H); }
  captions(t);
}

startPage(out, render, 0, 268.99);
