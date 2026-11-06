// Round 3, wood-B: helpers and figures for stanzas 8-11, painted into the woodcut tone map in block-local units
// (see woodcut.js). The backgrounds are copies of end-blocks.js helpers under r3b names; the people are the
// round-2 figures (ePerson, eLawyer from end-figures.js; drawKing, drawFrockMan from figures.js) wrapped so their
// heads are reported to the audit (r3bHead in r3b-main.js). The couple are stand-ins, never portraits.

// ---------- backgrounds (copies of eRays / eGround / ePanelWall) ----------
function r3bRays(g, P, cx, cy, n, r = 820, t0 = .95, t1 = .05) {
  const id = P.ray(cx, cy, n, { jit: .35, wob: .2 });
  g.fillStyle = WC.RG(g, cx, cy, 20, cx, cy, r, [[0, t0], [.4, .55], [1, t1]], id); g.fillRect(0, 0, BW, BH);
}
function r3bGround(g, P, y0, tone = .5) {
  const id = P.dash(0, 9, 70, .8, { jit: .35 });
  g.fillStyle = WC.LG(g, 0, y0, 0, BH, [[0, tone + .2], [1, tone - .25]], id); g.fillRect(0, y0, BW, BH - y0);
  line(g, 0, y0, BW, y0); ink(g, 5);
}
function r3bPanel(g, P, cx, cy, y1 = BH) {
  const id = P.lin(90, 11, { wob: .22, jit: .3 });
  g.fillStyle = WC.RG(g, cx, cy, 10, cx, cy, 900, [[0, .9], [.5, .5], [1, .16]], id); g.fillRect(0, 0, BW, y1);
  for (let x = 40; x < BW; x += 160) { g.beginPath(); g.rect(x, 40, 120, y1 - 80); cutl(g, 2.4); g.beginPath(); g.rect(x + 8, 48, 104, y1 - 96); ink(g, 2); }
  return id;
}
// a tiled kitchen wall: cut lines between square tiles, lit from (cx, cy)
function r3bTiles(g, P, cx, cy, y1, sz = 64) {
  const id = P.lin(0, 8, { wob: .14, jit: .3 });
  g.fillStyle = WC.RG(g, cx, cy, 10, cx, cy, 980, [[0, .92], [.55, .6], [1, .3]], id); g.fillRect(0, 0, BW, y1);
  for (let x = 0; x < BW; x += sz) { line(g, x, 0, x, y1); ink(g, 2.2); }
  for (let y = 0; y < y1; y += sz) { line(g, 0, y, BW, y); ink(g, 2.2); }
  return id;
}
// a counter (or table) front: top edge, dark front with cut panels
function r3bCounter(g, x0, y0, x1, y1, pWood) {
  g.beginPath(); g.rect(x0, y0, x1 - x0, 20); fillWith(g, WC.LG(g, 0, y0, 0, y0 + 20, [[0, .88], [1, .35]], pWood)); ink(g, 4);
  g.beginPath(); g.rect(x0 + 8, y0 + 20, x1 - x0 - 16, y1 - y0 - 20); fillWith(g, WC.LG(g, x0, 0, x1, 0, [[0, .16], [.5, .5], [1, .1]], pWood)); ink(g, 4);
  for (let x = x0 + 30; x < x1 - 60; x += 150) { g.beginPath(); g.rect(x, y0 + 40, 120, y1 - y0 - 60); cutl(g, 2.4); }
}
const r3bPulse = (t, a, len = .3) => { const d = t - a; return d < 0 || d > len ? 0 : Math.sin(d / len * Math.PI); };
const r3bPop = (t, a, len = .18) => clamp(easeOutBack(clamp((t - a) / len), 2.2), 0, 1.25);
// mouth opening on every onset in a list (a sung word = a spoken word)
function r3bTalk(t, onsets) { let v = 0; for (const w of onsets) { const d = t - w; if (d >= -.03 && d < .3) v = Math.max(v, Math.sin(clamp((d + .03) / .28) * Math.PI)); } return v; }
// impact cuts round a point (white gouges radiating), k fades 1 -> 0
function r3bImpact(g, x, y, r0, r1, n, w, k, a0 = 0) { if (k <= 0) return; for (let i = 0; i < n; i++) { const a = a0 + i / n * TAU; gouge(g, x + Math.cos(a) * r0, y + Math.sin(a) * r0, x + Math.cos(a) * (r0 + (r1 - r0) * k), y + Math.sin(a) * (r0 + (r1 - r0) * k), w, 1); } }
// a 0..1 fade-out of an impact that starts on onset a
const r3bHit = (t, a, len = .35) => (t < a - r3bF ? 0 : 1 - ease(t, a - r3bF, a + len));

// ---------- people ----------
// a person (ePerson) whose head the audit knows about. o.hop lifts the whole figure.
function r3bPerson(g, x, y, k, o, pats) {
  const yy = y - (o.hop || 0);
  ePerson(g, x, yy, k, o, pats);
  r3bHead(g, x, yy - 240 * k, 34 * k, 42 * k);
}
// a worker: a person in a paper cap; o.grin 0..1 puts a wide fixed grin on her (the trained smile)
function r3bWorker(g, x, y, k, o, pats) {
  const yy = y - (o.hop || 0);
  ePerson(g, x, yy, k, { woman: o.man ? false : true, ...o }, pats);
  g.save(); g.translate(x, yy); g.scale(k * (o.flip ? -1 : 1), k);
  const hy = -238;
  // the paper cap (a white boat of folded paper with a band)
  pth(g, [[-30, hy - 22], [30, hy - 22], [22, hy - 50], [-22, hy - 50]]); fillWith(g, Cw(1)); ink(g, 2.6);
  line(g, -29, hy - 28, 29, hy - 28); ink(g, 2.2);
  const gr = o.grin || 0;
  if (gr > .02) { // a wide grin: black crescent, a row of teeth cut white
    const w = 10 + gr * 6;
    g.beginPath(); g.moveTo(-w, hy + 14); g.quadraticCurveTo(0, hy + 18 + gr * 12, w, hy + 14); g.quadraticCurveTo(0, hy + 16, -w, hy + 14); g.closePath(); fillWith(g, Cw(0));
    g.beginPath(); g.moveTo(-w + 3, hy + 15.5); g.quadraticCurveTo(0, hy + 19 + gr * 4, w - 3, hy + 15.5); cutl(g, 2.2 * gr);
    for (const s of [-1, 1]) { g.beginPath(); g.arc(s * (w + 3), hy + 10, 4, s > 0 ? 2.2 : .3, s > 0 ? 3.6 : 1.9); ink(g, 1.8); }
  }
  g.restore();
  r3bHead(g, x, yy - 244 * k, 34 * k, 46 * k);
}
// an older person (a parent): a person with pale hair and round spectacles
function r3bElder(g, x, y, k, o, pats) {
  const yy = y - (o.hop || 0);
  ePerson(g, x, yy, k, o, pats);
  g.save(); g.translate(x, yy); g.scale(k, k);
  const hy = -238;
  g.beginPath(); g.moveTo(-27, hy - 2); g.quadraticCurveTo(-30, hy - 38, 0, hy - 37); g.quadraticCurveTo(30, hy - 38, 27, hy - 2); g.quadraticCurveTo(16, hy - 22, 0, hy - 22); g.quadraticCurveTo(-16, hy - 22, -27, hy - 2); g.closePath();
  fillWith(g, Cw(1)); ink(g, 2.4);
  for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(-18 + i * 12, hy - 34); g.quadraticCurveTo(-14 + i * 12, hy - 28, -18 + i * 12, hy - 22); ink(g, 1.4); }
  if (o.woman) { ell(g, 0, hy - 40, 13, 9); fillWith(g, Cw(1)); ink(g, 2.2); } // a bun
  for (const s of [-1, 1]) { g.beginPath(); g.arc(s * 9, hy - 2, 7, 0, TAU); ink(g, 2); }
  line(g, -2, hy - 2, 2, hy - 2); ink(g, 2);
  g.restore();
  r3bHead(g, x, yy - 244 * k, 34 * k, 46 * k);
}
// a constable: a person in a tall domed helmet with a badge, a truncheon at the belt (no arrest, no jail)
function r3bCop(g, x, y, k, o, pats) {
  const yy = y - (o.hop || 0);
  ePerson(g, x, yy, k, { ...o, woman: false }, pats);
  g.save(); g.translate(x, yy); g.scale(k, k);
  const hy = -238;
  g.beginPath(); g.moveTo(-27, hy - 12); g.quadraticCurveTo(-30, hy - 64, -6, hy - 82); g.lineTo(6, hy - 82); g.quadraticCurveTo(30, hy - 64, 27, hy - 12); g.closePath();
  fillWith(g, WC.LG(g, -30, 0, 30, 0, [[0, .05], [.35, .45], [.55, .08], [1, 0]], pats.coat)); ink(g, 3);
  ell(g, 0, hy - 86, 6, 5); fillWith(g, Cw(0));
  ell(g, 0, hy - 12, 32, 6); fillWith(g, Cw(0));
  // badge: a little star cut out
  g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 4 : 10; g.lineTo(Math.cos(a) * r, hy - 42 + Math.sin(a) * r); } g.closePath(); fillWith(g, Cw(1));
  line(g, -22, hy + 4, -6, hy + 24); ink(g, 2); line(g, 22, hy + 4, 6, hy + 24); ink(g, 2); // chin strap
  // truncheon at the hip
  g.beginPath(); g.roundRect(30, -150, 12, 66, 5); fillWith(g, Cw(0)); line(g, 33, -146, 33, -92); cutl(g, 1.6);
  g.restore();
  r3bHead(g, x, yy - 256 * k, 34 * k, 62 * k);
}
// the king's man in the frock coat (the manager), facing left, or right with o.flip
function r3bManager(g, P, x, y, k, o, pats) {
  g.save();
  if (o.flip) { g.translate(x, 0); g.scale(-1, 1); g.translate(-x, 0); }
  drawFrockMan(g, P, x, y, k, o, pats);
  r3bHead(g, x - 2 * k, y - (o.hop || 0) - 228 * k, 34 * k, 42 * k);
  g.restore();
}
// the seated king (drawKing registers 4 patterns of its own)
function r3bKing(g, P, x, y, sc, o = {}) {
  drawKing(g, P, x, y, sc, o);
  r3bHead(g, x, y + (o.bob || 0) * sc - 190 * sc, 58 * sc, 110 * sc);
}
// a barrister (eLawyer)
function r3bLawyer(g, x, y, k, o, pats) {
  eLawyer(g, x, y, k, o, pats);
  r3bHead(g, x + (o.lean || 0) * 40 * k, y - 250 * k, 40 * k, 46 * k);
}
// the queen, a copy of drawQueen (story-figures.js) with o.scream: mittens up at her cheeks, mouth open
function r3bQueen(g, x, y, k, o, pats) {
  g.save(); g.translate(x, y - (o.hop || 0)); g.scale(k, k);
  const sc = o.scream || 0;
  g.beginPath(); g.moveTo(-26, -170); g.lineTo(26, -170); g.quadraticCurveTo(74, -60, 86, 0); g.lineTo(-86, 0); g.quadraticCurveTo(-74, -60, -26, -170); g.closePath();
  fillWith(g, WC.LG(g, -86, 0, 86, 0, [[0, .25], [.45, .8], [.7, .3], [1, .08]], pats.gown)); ink(g, 3.5);
  for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(i * 8, -160); g.quadraticCurveTo(i * 22, -80, i * 32, -6); cutl(g, 2); }
  g.beginPath(); g.moveTo(-86, 0); for (let i = 0; i <= 12; i++) g.lineTo(-86 + i * 172 / 12, i % 2 ? -10 : 0); g.lineTo(86, 0); ink(g, 3);
  pth(g, [[-26, -238], [26, -238], [26, -168], [-26, -168]]); fillWith(g, WC.C(.18, pats.gown)); ink(g, 3);
  g.beginPath(); g.moveTo(-50, -232); g.quadraticCurveTo(0, -262, 50, -232); g.quadraticCurveTo(46, -196, 30, -196); g.quadraticCurveTo(0, -214, -30, -196); g.quadraticCurveTo(-46, -196, -50, -232); g.closePath();
  ermineFill(g, 41, 16, -54, -262, 54, -190); ink(g, 3);
  // hands: folded at the waist, or flown up to her cheeks (sleeves drawn as limbs)
  if (sc < .5) { mitten(g, 6, -170, 10); mitten(g, 18, -166, 10); }
  else {
    limb(g, [[-30, -226], [-44, -246], [-24, -270]], 14); mitten(g, -22, -272, 10);
    limb(g, [[30, -226], [46, -248], [30, -272]], 14); mitten(g, 30, -274, 10);
  }
  const hop = sc > .5 ? 0 : 0;
  g.beginPath(); g.moveTo(-26, -290); g.quadraticCurveTo(-40, -230, -30, -190); g.lineTo(-10, -200); g.quadraticCurveTo(-18, -240, -8, -290); g.closePath(); fillWith(g, WC.C(.25, pats.hair)); ink(g, 2.4);
  ell(g, 0, -278 - hop, 24, 28); fillWith(g, WC.LG(g, -24, 0, 26, 0, [[0, .55], [.4, 1], [1, 1]], pats.face)); ink(g, 3);
  if (sc > .5) { ell(g, 10, -284, 4, 4.5); fillWith(g, Cw(0)); ell(g, 9, -285, 1.4, 1.4); fillWith(g, Cw(1)); }
  else { ell(g, 10, -282, 3, 3.5); fillWith(g, Cw(0)); }
  g.beginPath(); g.moveTo(22, -280); g.quadraticCurveTo(30, -270, 22, -266); ink(g, 2.4);
  if (sc > .5) { ell(g, 14, -258, 6, 9); fillWith(g, Cw(0)); }
  else { g.beginPath(); g.moveTo(8, -258); g.quadraticCurveTo(14, -254, 20, -259); ink(g, 2.2); }
  g.beginPath(); g.moveTo(-24, -290); g.quadraticCurveTo(-4, -312, 22, -296); g.quadraticCurveTo(4, -300, -6, -292); g.closePath(); fillWith(g, WC.C(.25, pats.hair));
  const cu = (o.crownUp || 0);
  g.beginPath(); g.moveTo(-18, -300 - cu); g.lineTo(-18, -322 - cu); g.lineTo(-8, -310 - cu); g.lineTo(2, -328 - cu); g.lineTo(12, -310 - cu); g.lineTo(20, -322 - cu); g.lineTo(20, -300 - cu); g.closePath(); fillWith(g, Cw(1, 0, 1)); ink(g, 2.6);
  g.restore();
  r3bHead(g, x + 2 * k, y - (o.hop || 0) - 290 * k, 36 * k, 46 * k);
}

// ---------- animals (plain, side on, no gore) ----------
// a pig facing left: feet origin
function r3bPig(g, x, y, k, pats, o = {}) {
  g.save(); g.translate(x, y); g.scale(k, k);
  for (const lx of [-50, -30, 40, 58]) { g.beginPath(); g.rect(lx - 7, -40, 14, 40); fillWith(g, Cw(.9)); ink(g, 2.4); g.beginPath(); g.rect(lx - 7, -7, 14, 7); fillWith(g, Cw(0)); }
  g.beginPath(); g.moveTo(80, -76); g.bezierCurveTo(100, -90, 96, -60, 88, -70); g.bezierCurveTo(82, -78, 92, -84, 96, -78); ink(g, 2.6); // curly tail
  ell(g, 10, -70, 78, 44); fillWith(g, WC.RG(g, -10, -90, 4, -10, -90, 110, [[0, .98], [.6, .82], [1, .45]], pats.hide)); ink(g, 3);
  const dn = o.down || 0;
  g.save(); g.translate(-62, -78 + dn * 14); g.rotate(-dn * .3);
  ell(g, -10, 4, 30, 28); fillWith(g, Cw(1)); ink(g, 3);
  g.beginPath(); g.moveTo(-10, -22); g.lineTo(6, -46); g.lineTo(12, -16); g.closePath(); fillWith(g, Cw(.85)); ink(g, 2.4); // ear
  g.beginPath(); g.roundRect(-52, -4, 18, 24, 7); fillWith(g, Cw(1)); ink(g, 2.6); // snout
  ell(g, -45, 4, 2, 3); fillWith(g, Cw(0)); ell(g, -45, 13, 2, 3); fillWith(g, Cw(0));
  ell(g, -16, -4, 3, 3); fillWith(g, Cw(0));
  g.restore();
  g.restore();
}

// ---------- things ----------
function r3bClock(g, x, y, r, spin, hourOff = -1.4) {
  ell(g, x, y, r + 12, r + 12); fillWith(g, Cw(0)); ell(g, x, y, r, r); fillWith(g, Cw(1)); ink(g, 2);
  for (let h = 0; h < 12; h++) { const a = h / 12 * TAU; line(g, x + Math.cos(a) * r * .8, y + Math.sin(a) * r * .8, x + Math.cos(a) * r * .94, y + Math.sin(a) * r * .94); ink(g, h % 3 ? 2 : 4); }
  line(g, x, y, x + Math.cos(spin / 12 + hourOff) * r * .52, y + Math.sin(spin / 12 + hourOff) * r * .52); ink(g, 6);
  line(g, x, y, x + Math.cos(spin - 1.57) * r * .8, y + Math.sin(spin - 1.57) * r * .8); ink(g, 3.5);
  ell(g, x, y, 5, 5); fillWith(g, Cw(0));
}
// a wall calendar (a month grid); ring = [row, col, 0..1] draws a red ring round that day as it is drawn
function r3bCalendar(g, cx, cy, w, h, ring) {
  g.beginPath(); g.rect(cx - w / 2, cy - h / 2, w, h); fillWith(g, Cw(1)); ink(g, 4);
  g.beginPath(); g.rect(cx - w / 2, cy - h / 2, w, h * .2); fillWith(g, Cw(0));
  for (const s of [-1, 1]) { ell(g, cx + s * w * .27, cy - h / 2, 7, 7); fillWith(g, Cw(1)); ink(g, 2.5); }
  const cw = (w - 20) / 7, ch = (h * .8 - 20) / 5;
  for (let r = 0; r < 5; r++) for (let c = 0; c < 7; c++) { g.beginPath(); g.rect(cx - w / 2 + 10 + c * cw + 2, cy - h / 2 + h * .2 + 10 + r * ch + 2, cw - 4, ch - 4); ink(g, 1.6); }
  if (ring && ring[2] > 0) {
    const [r, c, u] = ring, x = cx - w / 2 + 10 + (c + .5) * cw, y = cy - h / 2 + h * .2 + 10 + (r + .5) * ch;
    g.beginPath(); g.ellipse(x, y, cw * .72, ch * .7, -.2, -2, -2 + u * TAU * 1.08); g.strokeStyle = Cw(0, 0, 1); g.lineWidth = 7; g.stroke();
  }
}
// a pale sheet with a black head band and ruled lines (a leaflet / a notice: no words)
function r3bSheet(g, x, y, w, h, rot = 0) {
  g.save(); g.translate(x, y); g.rotate(rot);
  g.beginPath(); g.rect(-w / 2, -h / 2, w, h); fillWith(g, Cw(1)); ink(g, 3);
  g.beginPath(); g.rect(-w / 2 + w * .08, -h / 2 + h * .06, w * .84, h * .16); fillWith(g, Cw(0));
  const n = Math.max(3, Math.floor(h / 22));
  for (let r = 0; r < n; r++) { const yy = -h / 2 + h * .32 + r * (h * .62 / n); line(g, -w / 2 + w * .08, yy, w / 2 - w * .08 - (r % 4 === 3 ? w * .3 : 0), yy); ink(g, 1.8); }
  g.restore();
}
// rain: short black streaks, slanted, falling (u = time in seconds)
function r3bRain(g, u, x0, y0, x1, y1, n = 90, seed = 5) {
  for (let i = 0; i < n; i++) {
    const rx = x0 + rnd(i, seed) * (x1 - x0), ph = rnd(i, seed, 2);
    const y = y0 + ((ph + u * 1.6) % 1) * (y1 - y0 + 60) - 30, x = rx - (y - y0) * .18;
    line(g, x, y, x - 9, y + 44); ink(g, 3.4); line(g, x + 4, y + 2, x - 5, y + 46); cutl(g, 1.8);
  }
}
// a speaking trumpet held to a mouth at (mx, my), pointing right; talk 0..1 cuts sound rings out of the air
function r3bTrumpet(g, mx, my, talk, pShade) {
  g.beginPath(); g.moveTo(mx, my - 6); g.lineTo(mx + 110, my - 36 - talk * 6); g.lineTo(mx + 110, my + 36 + talk * 6); g.lineTo(mx, my + 6); g.closePath();
  fillWith(g, WC.LG(g, 0, my - 40, 0, my + 40, [[0, .9], [.5, .55], [1, .15]], pShade)); ink(g, 3.5);
  g.beginPath(); g.ellipse(mx + 110, my, 9, 36 + talk * 6, 0, 0, TAU); fillWith(g, Cw(0)); ink(g, 3);
  if (talk > .08) for (let i = 0; i < 4; i++) { const r = 30 + i * 26 + talk * 20; g.beginPath(); g.ellipse(mx + 116, my, r * .55, r, 0, -.9, .9); g.strokeStyle = Cw(0); g.lineWidth = 4 * talk; g.stroke(); }
}
