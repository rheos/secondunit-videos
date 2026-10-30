// Act D (276.0-365.5): scale and identity collapse. He is tiny inside his own head, a dot on his own heart, a walker
// on a map printed on his own coat, a doll inside his own suitcase; the agent becomes the app on his phone and then
// every icon on it; in the bird verse he IS the caged bird (ribcage, staves as bars, the bird walks off in his hat).
// The blueprint burning through the paper is global (leak) and not touched here.
'use strict';

// ---------- helpers ----------
function d_beat(T) { let b = -9; for (const x of BEATS) { if (x <= T) b = x; else break; } return Math.exp(-(T - b) * 7); }
function d_fedora(x, y, s, sch) { // brim centre at (x, y)
  const k = 1 / s; X.save(); X.translate(x, y); X.scale(s, s);
  const hb = PE(0, 0, 46, 8); fillP(hb, '#3d2a1f'); iE(0, 0, 46, 8, 0, C.ink, 2 * k);
  const cr = [[-26, 0], [-22, -34], [0, -28], [22, -34], [26, 0]], crp = PP(cr); fillP(crp, '#4b3426'); hatch(crp, 0, -15, 34, .7, 4 * k, C.ink, .9 * k, .6, [6, -4]); iP(cr, true, C.ink, 2 * k, 1, true, .9 * k);
  X.beginPath(); wP([[-25, -8], [25, -8]], false, .4 * k); stroke(C.ochre, 4 * k, .9);
  X.restore();
}
function d_heartPts(cx, cy, s) {
  const a = bzPts([0, 40], [-60, 0], [-40, -50], [0, -20], 0, 1, 36), b = bzPts([0, -20], [40, -50], [60, 0], [0, 40], 0, 1, 36);
  return a.concat(b.slice(1)).map(([x, y]) => [cx + x * s, cy + y * s]);
}
function d_topAt(pts, x) { let y = 1e9; for (const [px, py] of pts) if (Math.abs(px - x) < 14 && py < y) y = py; return y; }
function d_face(x, y, r, who, bg) { // an app icon: a small portrait in a square
  const b = PR(x - r, y - r, 2 * r, 2 * r); fillP(b, bg); hatch(b, x, y, r * 1.5, .7, 3, C.ink, .5, .35, [r * .3, -r * .3]); iBox(x - r, y - r, 2 * r, 2 * r, C.ink, 1.1);
  if (who === 'her') {
    fillP(PE(x - 2, y - r * .62, r * .3, r * .24), '#3b2a22'); fillP(PR(x - r * .62, y + r * .55, r * 1.24, r * .45), C.rose);
    const h = PE(x, y, r * .44, r * .5); fillP(h, '#e7c9a2'); iE(x, y, r * .44, r * .5, 0, C.ink, .9, 1, false, .3);
    fillP(PE(x, y - r * .32, r * .48, r * .24), '#3b2a22');
    for (const sx of [-1, 1]) iE(x + sx * r * .2, y + r * .02, r * .15, r * .1, sx * .3, C.ink, 1, 1, false, .2);
    X.beginPath(); X.moveTo(x - r * .12, y + r * .3); X.lineTo(x + r * .12, y + r * .3); stroke(C.brick, 1.2, 1);
  } else {
    fillP(PR(x - r * .62, y + r * .55, r * 1.24, r * .45), C.teal);
    const h = PE(x, y + r * .08, r * .4, r * .48); fillP(h, '#efd9b9'); iE(x, y + r * .08, r * .4, r * .48, 0, C.ink, .9, 1, false, .3);
    fillP(PE(x, y - r * .32, r * .7, r * .1), '#3d2a1f'); fillP(PR(x - r * .38, y - r * .7, r * .76, r * .4), '#4b3426'); fillP(PR(x - r * .38, y - r * .42, r * .76, r * .08), C.ochre);
    for (const sx of [-1, 1]) fillP(PR(x + sx * r * .15 - 1, y + r * .02, 2, 2.4), C.ink);
    X.beginPath(); X.moveTo(x - r * .12, y + r * .3); X.lineTo(x + r * .12, y + r * .3); stroke(C.ink, 1, 1);
  }
}
function d_openCase(x, y, s, part) { // an open suitcase on the floor; part 'lid' (behind) or 'base' (in front)
  const k = 1 / s; X.save(); X.translate(x, y); X.scale(s, s);
  if (part === 'lid') { const l = [[-80, -60], [80, -60], [96, -150], [-64, -150]], lp = PP(l); fillP(lp, '#8a4e2c'); shade(lp, 16, -105, 100, [10, -8], .8, 5 * k); iP(dens(l, 24, true), true, C.ink, 2.4 * k, 1, true, k); const li = PP([[-66, -66], [66, -66], [80, -140], [-52, -140]]); fillP(li, '#c98478'); hatch(li, 10, -100, 90, -.6, 6 * k, C.ink, .8 * k, .4); }
  else { const b = PR(-80, -60, 160, 60); fillP(b, '#9a5a34'); shade(b, 0, -30, 100, [-12, -8], .75, 5 * k); iBox(-80, -60, 160, 60, C.ink, 2.4 * k); X.beginPath(); for (const sx of [-34, 34]) { X.moveTo(sx, -60); X.lineTo(sx, 0); } stroke(C.ink, 2 * k, .8); fillP(PE(30, -30, 12, 8, .3), C.cream); iE(30, -30, 12, 8, .3, C.ink, 1.2 * k, .9, false); }
  X.restore();
}
function d_staffBar(pts, col, w, a) { for (let j = -2; j <= 2; j++) { X.beginPath(); pts.forEach(([x, y], i) => (i ? X.lineTo(x + j * 6 + jit(.6), y) : X.moveTo(x + j * 6, y))); stroke(col, w, a); } }
function d_note(x, y, s, col = '#3f5f8f', rot = .15) { X.save(); X.translate(x, y); X.rotate(rot); X.scale(s, s); fillP(PE(0, 0, 7, 5.4, -.4), col); iline(6, -1, 6, -24, col, 1.8 / s, 1, false); iline(6, -24, 14, -18, col, 1.8 / s, 1, false); X.restore(); }

// ---------- 278.3 "so long": a cross-section of his own head; small copies of him at work on every floor ----------
SU.d_headRooms = { mode: 'ill', f(q, p, a, T) {
  // draft 6: the shot opens tight on the clock on floor 2 and pulls out to the whole head; he is hatless (a crook took
  // the hat at 272.8) until the hat comes back down onto his head on camera
  stripes(C.paper, '#e6d8bc', 130, -.62, 0, C.tan); const pu = eio(seg(p, 0, .42)); cam(lerp(690, 900, pu), lerp(430, 560, pu), lerp(3.4, 1.02, pu) * lerp(1, 1.05, seg(p, .42, 1)));
  const hx = 880, hy = 600, rx = 470, ry = 500;
  const col = PP([[hx - 470, 1010], [hx - 160, 940], [hx + 150, 940], [hx + 460, 1010], [hx + 520, 1300], [hx - 520, 1300]]); fillP(col, C.teal); shade(col, hx, 1100, 520, [40, -20], .9, 6); iP(dens([[hx - 470, 1010], [hx - 160, 940], [hx + 150, 940], [hx + 460, 1010]], 30), false, C.ink, 3);
  const nk = PP([[hx - 140, hy + 380], [hx + 160, hy + 380], [hx + 150, 960], [hx - 130, 960]]); fillP(nk, '#efd9b9'); shade(nk, hx, 900, 200, [30, -10], .8, 5); iP([[hx - 140, hy + 380], [hx - 130, 960]], false, C.ink, 2.6); iP([[hx + 160, hy + 380], [hx + 150, 960]], false, C.ink, 2.6);
  const hp = PE(hx, hy, rx, ry); fillP(hp, '#efd9b9'); shade(hp, hx, hy, ry + 20, [60, -40], .7, 6);
  const nose = [[hx + rx - 30, hy - 40], [hx + rx + 80, hy + 100], [hx + rx - 6, hy + 118]]; fillP(PP(nose), '#efd9b9'); hatch(PP(nose), hx + rx + 20, hy + 60, 90, .9, 5, C.ink, 1, .6); iP(nose, false, C.ink, 2.8);
  iE(hx, hy, rx, ry, 0, C.ink, 3.2, 1, true, 1.4, -1.1, 1.5);
  fillP(PE(hx + rx - 96, hy - 70, 9, 12), C.ink); iline(hx + rx - 130, hy - 108, hx + rx - 60, hy - 116, C.ink, 3);
  const mo = sing(T); if (mo > .05) fillP(PE(hx + rx - 70, hy + 200, 16, 5 + mo * 12), C.ink); else iline(hx + rx - 100, hy + 200, hx + rx - 40, hy + 196, C.ink, 3);
  // the cut-away: the skull opened like a doll's house
  const cx0 = hx - 70, cy0 = hy + 20, crx = 340, cry = 380, cut = PE(cx0, cy0, crx, cry);
  const rim = PE(cx0, cy0, crx + 34, cry + 34); fillP(rim, '#e3c7a0'); hatch(rim, cx0, cy0, cry + 40, -.3, 4, C.ink, .9, .55); hatch(rim, cx0, cy0, cry + 40, 1.1, 6, C.ink, .8, .35);
  fillP(cut, C.paper2);
  X.save(); X.clip(cut);
  hatch(cut, cx0, cy0, cry, .9, 10, C.ink, .8, .22);
  const FL = [360, 500, 640, 780, 920], hw = (y) => crx * Math.sqrt(Math.max(0, 1 - ((y - cy0) / cry) ** 2));
  for (const y of FL) { const fp = PR(cx0 - crx, y, 2 * crx, 16); fillP(fp, '#a5703f'); hatch(fp, cx0, y + 8, crx, .1, 4, C.ink, .8, .5); iline(cx0 - crx, y, cx0 + crx, y, C.ink, 2.6); }
  // floor 1: filing cabinets of thoughts, one drawer pulled
  for (let i = 0; i < 6; i++) { const x = cx0 - 240 + i * 66, cb = PR(x, 360 - 120, 56, 120); fillP(cb, [C.tan, C.sage, C.tan, C.ochre, C.tan, C.sage][i]); shade(cb, x + 28, 300, 70, [8, -6], .8, 4); iBox(x, 240, 56, 120, C.ink, 1.8); for (let d = 0; d < 3; d++) { iline(x + 4, 240 + 40 * d + 38, x + 52, 240 + 40 * d + 38, C.ink, 1.2, .8, false); fillP(PR(x + 22, 240 + 40 * d + 16, 12, 5), C.ink); } }
  const dr = eo(seg(p, .1, .5)) * 40, drx = cx0 - 240 + 3 * 66; fillP(PR(drx, 296, 56 + dr, 34), C.ochre); iBox(drx + dr, 296, 56, 34, C.ink, 1.8);
  traveller(drx + 110 + dr, 360, .19, { look: -1, armR: [-1.5, .2], case: false });
  // floor 2: a wall clock spinning hours away; he paces under it
  const ck = PE(cx0 - 120, 430, 48, 48); fillP(ck, C.cream); iE(cx0 - 120, 430, 48, 48, 0, C.ink, 2.4); ticks(cx0 - 120, 430, 36, 12, 6, C.ink, .9, 1.4);
  const ma = T * 14; iline(cx0 - 120, 430, cx0 - 120 + Math.sin(ma) * 34, 430 - Math.cos(ma) * 34, C.ink, 2.2, 1, false); iline(cx0 - 120, 430, cx0 - 120 + Math.sin(ma / 12) * 22, 430 - Math.cos(ma / 12) * 22, C.ink, 3.4, 1, false);
  const pace = Math.sin(T * 1.6); traveller(cx0 + 40 + pace * 140, 500, .2, { look: Math.cos(T * 1.6) > 0 ? 1 : -1, legs: walkPh(), case: false });
  for (let i = 0; i < 3; i++) gc(cx0 - 120, 430, 58 + i * 14 + ((FD * 3) % 14), C.orange, .6, 1.4);
  // floor 3: a desk buried in paper, one of him writing
  const dk = PR(cx0 - 260, 640 - 56, 170, 56); fillP(dk, '#a5703f'); iBox(cx0 - 260, 584, 170, 56, C.ink, 2);
  for (let i = 0; i < 12; i++) { const pp = PR(cx0 - 230 + jit(3), 584 - 9 - i * 9, 90, 9); fillP(pp, C.cream); iBox(cx0 - 230 + jit(2), 575 - i * 9, 90, 9, C.ink, 1, .9, false); }
  traveller(cx0 - 60, 640, .2, { sit: 1, look: -1, case: false, armR: [2.4, .6] });
  for (let i = 0; i < 6; i++) { const t2 = (T * .6 + i / 6) % 1; X.save(); X.translate(cx0 + 40 + t2 * 160, 600 - t2 * 40); X.rotate(t2 * 3); fillP(PR(-9, -6, 18, 12), C.cream); iBox(-9, -6, 18, 12, C.ink, 1); X.restore(); }
  // floor 4: a revolving door that never lets out
  const rdx = cx0 + 60; iE(rdx, 780, 70, 14, 0, C.ink, 1.6, 1, false); for (let i = 0; i < 4; i++) { const an = T * 2 + i * Math.PI / 2; iline(rdx, 780, rdx + Math.cos(an) * 70, 780 + Math.sin(an) * 14, C.ink, 2, 1, false); iline(rdx + Math.cos(an) * 70, 780 + Math.sin(an) * 14, rdx + Math.cos(an) * 70, 680 + Math.sin(an) * 14, C.ink, 2, .8, false); }
  traveller(rdx + Math.cos(T * 2 + .6) * 40, 780, .18, { look: 1, legs: walkPh(), case: true });
  // floor 5: the boiler room, his rain cloud kept in a tank
  const tk = PR(cx0 - 160, 920 - 110, 120, 110); fillP(tk, '#cfe0da'); iBox(cx0 - 160, 810, 120, 110, C.ink, 2.2); cloud(cx0 - 100, 860, .3, { rain: true });
  // the ladder through every floor, and the one of him who climbs it
  const lx = cx0 + 200; iline(lx, 230, lx, 920, C.ink, 3); iline(lx + 46, 230, lx + 46, 920, C.ink, 3); for (let y = 250; y < 920; y += 28) iline(lx, y, lx + 46, y, C.ink, 1.8, 1, false);
  const cy2 = lerp(915, 372, eio(seg(p, .05, .85))); traveller(lx + 23, cy2, .2, { look: 1, armR: [3, 0], armL: [3.1, 0], legs: Math.sin(T * 8) * .6, case: false });
  // the idea at the top: a bulb that lights only at the very end
  const on = p > .86; iline(cx0, 210, cx0, 262, C.ink, 2); const bulb = PE(cx0, 290, 26, 30); fillP(bulb, on ? '#ffe9a8' : C.cream); if (!on) hatch(bulb, cx0, 290, 30, .7, 4, C.ink, .8, .5, [6, -6]); iE(cx0, 290, 26, 30, 0, C.ink, 2.2);
  if (on) { X.beginPath(); for (let i = 0; i < 16; i++) { const an = i / 16 * TAU; X.moveTo(cx0 + Math.cos(an) * 40, 290 + Math.sin(an) * 44); X.lineTo(cx0 + Math.cos(an) * 64, 290 + Math.sin(an) * 70); } stroke(C.orange, 2.4, .95); gc(cx0, 290, 90, C.orange, .6, 2); }
  X.restore();
  iE(cx0, cy0, crx, cry, 0, C.ink, 3.4); iE(cx0, cy0, crx + 34, cry + 34, 0, C.ink, 2.4, 1, true, 1.2, Math.PI * .55, Math.PI * 2.45);
  const hd = eo(seg(p, .52, .78)); if (hd > 0) { const hyH = lerp(-520, hy - ry + 30, hd); path([[hx - 20, -300], [hx - 20, hyH - 200]], C.teal, 2, .6, [8, 10]); d_fedora(hx - 20, hyH, 11); if (hd >= 1 && p < .9) for (let i = 0; i < 3; i++) gc(hx - 20, hy - ry + 30, 380 + i * 50 + (p - .78) * 900, C.orange, .8 - i * .2, 2.6, null, Math.PI * 1.05, Math.PI * 1.95); }
  path([[hx + rx - 96, hy - 70], [hx + rx + 60, hy - 260], [cx0, 290]], C.teal, 2, .6, [8, 10]);
  consL([[0, cy0, W, cy0], [cx0, 0, cx0, H], [hx + rx, 0, hx + rx, H]]); consC([[cx0, cy0, crx + 120]]);
} };

// ---------- 286.3 instrumental after "feel": the little heart from the seesaw is now a hill, then the pull-out shows the hill is a beating heart ----------
SU.d_heartGiant = { mode: 'ill', f(q, p, a, T) {
  stripes('#efe0d6', '#e6cfc4', 150, -.62, 0, C.rose);
  const pulse = d_beat(T), hs = 9 * (1 + pulse * .04), pts = d_heartPts(960, 690, hs), hp = PP(pts);
  const mx = 960 - 26 * hs, my = d_topAt(pts, mx), u = eio(seg(p, .08, .8));
  cam(lerp(mx, 960, u), lerp(my - 110, 540, u), lerp(2.7, 1, u));
  // arteries out of the top, like pipes into the sky
  for (const [ox, bend, w] of [[-60, -300, 70], [40, 260, 56], [120, 520, 40]]) {
    const x0 = 960 + ox, y0 = 690 - 18 * hs, pp = bzPts([x0, y0], [x0, y0 - 300], [x0 + bend, y0 - 300], [x0 + bend * 1.1, -400], 0, 1, 30);
    X.beginPath(); pp.forEach(([x, y], i) => (i ? X.lineTo(x, y) : X.moveTo(x, y))); stroke(C.ink, w + 6, 1); X.beginPath(); pp.forEach(([x, y], i) => (i ? X.lineTo(x, y) : X.moveTo(x, y))); stroke(C.brick, w, 1);
    X.beginPath(); pp.forEach(([x, y], i) => (i ? X.lineTo(x + w * .25, y) : X.moveTo(x + w * .25, y))); stroke(C.ink, 1.4, .6);
  }
  fillP(hp, C.rose); hatch(hp, 960, 690, 60 * hs, .7, 6, C.ink, 1, .55, [9 * hs, -9 * hs]); hatch(hp, 960, 690, 60 * hs, -.6, 8, C.ink, .9, .35, [16 * hs, -16 * hs]);
  X.save(); X.clip(hp); for (let i = 0; i < 6; i++) { const y = 690 - 30 * hs + i * 60; path(bzPts([600, y], [800, y - 40], [1100, y + 50], [1400, y], 0, 1, 24), C.brick, 2, .5); } X.restore();
  iP(pts, true, C.ink, 4, 1, true, 1.4);
  for (let i = 0; i < 3; i++) { const rr = 60 * hs + i * 70 + (1 - pulse) * 120; gc(960, 690, rr, C.orange, pulse * (.9 - i * .25), 2.6); }
  // him, standing on the left lobe, bounced by every beat
  const jy = my - pulse * 26; traveller(mx, jy, .32, { look: 1, mouth: 0, case: true, legs: pulse > .5 ? .5 : null });
  cloud(mx, jy - 170, .2, { rain: true });
  path([[mx + 30, my - 60], [mx + 160, my - 160], [960, 690 - 20 * hs]], C.teal, 1.6, .7, [6, 8]);
  consL([[0, 690, W, 690], [960, 0, 960, H]]); consC([[960, 690, 64 * hs]]);
} };

// ---------- 290.4 "feel" settles: the mirror. His reflection is scanned over into the travel agent wearing his hat ----------
SU.d_mirror = { mode: 'ill', f(q, p, a, T) {
  stripes(C.paper, '#e8dcc8', 120, -.62, 0, C.plum); cam(980, 540, lerp(1, 1.06, eo(p)));
  const fl = PR(-300, 900, W + 600, 400); fillP(fl, '#c4ae84'); hatch(fl, 960, 1050, 1200, .15, 9, C.ink, .9, .4); iline(-300, 900, W + 300, 900, C.ink, 2.6);
  for (let i = 0; i < 9; i++) iline(-200 + i * 280, 900, -600 + i * 400, 1200, C.ink, 1.2, .4, false);
  const mx = 1220, my = 500, rx = 250, ry = 370;
  for (const sx of [-1, 1]) iline(mx + sx * 140, 820, mx + sx * 230, 905, C.ink, 7);
  const fr = PE(mx, my, rx + 44, ry + 44); fillP(fr, '#7a4a2a'); shade(fr, mx, my, ry + 50, [16, -12], .8, 5); iE(mx, my, rx + 44, ry + 44, 0, C.ink, 3);
  for (let i = 0; i < 24; i++) { const an = i / 24 * TAU; fillP(PE(mx + Math.cos(an) * (rx + 22), my + Math.sin(an) * (ry + 22), 5, 5), C.wax); }
  const gl2 = PE(mx, my, rx, ry); fillP(gl2, '#d3dccf');
  const yW = lerp(my - ry - 20, my + ry + 20, eio(seg(p, .28, .72)));
  X.save(); X.clip(gl2);
  hatch(gl2, mx, my, ry, -.9, 26, C.cream, 6, .5); for (let i = 0; i < 6; i++) iline(mx - rx, my - ry + 90 + i * 110, mx + rx, my - ry + 60 + i * 110, C.ink, 1, .12, false);
  X.save(); X.clip(PR(mx - rx - 10, my - ry - 10, 2 * rx + 20, yW - (my - ry - 10))); // already scanned: her
  agent(mx, 910, 1.3, { look: -.6, talk: singing(T) ? 0 : Math.abs(Math.sin(T * 9)) * .8 }); d_fedora(mx - 4, 910 - 282 * 1.3, 1.3);
  X.restore();
  X.save(); X.clip(PR(mx - rx - 10, yW, 2 * rx + 20, 2 * ry)); traveller(mx, 980, 1.05, { look: -1, flip: true, mouth: sing(T), case: true }); X.restore();
  X.restore();
  iE(mx, my, rx, ry, 0, C.ink, 2.6);
  if (yW > my - ry && yW < my + ry) { const hw = rx * Math.sqrt(1 - ((yW - my) / ry) ** 2); iline(mx - hw - 30, yW, mx + hw + 30, yW, C.orange, 3, 1, false); for (let x = mx - hw; x < mx + hw; x += 18) iline(x, yW - 6, x, yW + 6, C.orange, 1.4, .9, false); }
  traveller(560, 1010, 1.3, { look: 1, mouth: sing(T), case: true }); cloud(560, 1010 - 600, .65, { rain: true }); noteRain(450, 470, 220, 200, 7);
  path([[620, 630], [900, 520], [mx - 60, my - 40]], C.teal, 2, .8, [10, 8]);
  consL([[0, my, W, my], [mx, 0, mx, H]]); consC([[mx, my, ry + 120]]);
} };

// ---------- 297.0 the app is a building: a phone the size of a tower block on a skyline of phones; he is tiny at its foot ----------
SU.d_appTower = { mode: 'ill', f(q, p, a, T) {
  stripes('#e6e2d4', '#d6dccd', 160, -.62, 0, C.teal);
  const u = eio(p); cam(960, lerp(760, 440, u), lerp(1.3, .94, u));
  const r = M32(611);
  for (let i = 0; i < 16; i++) { const bw = 70 + r() * 70, bh = 260 + r() * 420, x = -260 + i * 165 + r() * 30; if (Math.abs(x + bw / 2 - 960) < 330) continue; const b = PR(x, 980 - bh, bw, bh); fillP(b, '#4a3f38'); iBox(x, 980 - bh, bw, bh, C.ink, 2); const gw2 = Math.round(bw - 14), gh2 = Math.round(bh - 30), gpx = pixWorld('d_sky' + i, Math.max(4, Math.round(gw2 / 9)), Math.max(8, Math.round(gh2 / 9)), (g, w, h) => d_pxGlint(g, w, h, i, T)); blitPix(gpx, x + 7, 980 - bh + 12, gw2, gh2); iBox(x + 7, 980 - bh + 12, gw2, gh2, C.ink, 1.2); }
  const gd = PR(-600, 980, W + 1200, 600); fillP(gd, '#b7a988'); hatch(gd, 960, 1200, 1400, .1, 8, C.ink, .9, .4); iline(-600, 980, W + 600, 980, C.ink, 2.8);
  for (let i = 0; i < 10; i++) iline(-400 + i * 300, 980, -900 + i * 420, 1500, C.ink, 1.2, .4, false);
  const feed = pixWorld('d_tower', 48, 95, (g, w, h) => d_pxFeed(g, w, h, T)); phoneBody(960, 980 - 220 * 2.5, 2.5, 0, (w, h) => blitPix(feed, 0, 0, w, h));
  for (let i = 0; i < 4; i++) { const t2 = (T * .25 + i / 4) % 1; bird(lerp(500, 1500, t2), 120 + Math.sin(t2 * 9 + i) * 40 + i * 50, .16, flap()); }
  const hx = lerp(380, 760, eo(seg(p, 0, .7))); traveller(hx, 980, .34, { look: 1, legs: p < .7 ? walkPh() : null, mouth: sing(T), case: true }); cloud(hx, 980 - 175, .18, { rain: true });
  for (let i = 0; i < 4; i++) gc(hx + 20, 860, 50 + i * 40 + ((FD * 5) % 40), C.orange, .7 - i * .14, 1.8, null, -1.6, -.4);
  bracket(1270, -100, 1270, 980, C.brick, .7); lab(1250, 300, '1 : 900', C.brick, .9, 18, 'left', 'alphabetic', 'bold');
  consL([[0, 980, W, 980], [960, -200, 960, H]]);
} };

// ---------- 300.1 the tower, drawn: app height against his height, and the agent's forms so far ----------
SU.d_sApp = { mode: 'sch', f(q, p, a, T) {
  schBG(); cam(960, 540, lerp(1.06, 1, eo(p)));
  lattice(960, 540, 64, 13, C.lav, .05); gl(80, 1000, W - 80, 1000, C.white, .8, 1.6);
  X.strokeStyle = C.lav; X.lineWidth = 1.4; X.strokeRect(780, 110, 360, 890); X.strokeRect(800, 140, 320, 820);
  stip(PR(800, 140, 320, 70), 960, 175, 200, 800, C.lav, .6, 1.3); lab(960, 184, 'TRAVEL AGENT', C.white, .9, 15, 'center');
  for (let i = 0; i < 5; i++) { const y = 230 + i * 146 - ((T * 60) % 146); if (y < 220 || y > 820) continue; X.strokeStyle = C.cyan; X.globalAlpha = .7; X.strokeRect(820, y, 280, 126); X.globalAlpha = 1; stip(PR(820, y, 280, 126), 960, y + 63, 160, 260, C.cyan, .35, 1.2); }
  traveller(640, 1000, .34, { sch: 1, col: C.cyan, look: 1 });
  bracket(1190, 110, 1190, 1000, C.cyan, .8, 'H = 312 M'); bracket(560, 876, 560, 1000, C.cyan, .8, '1.8 M', 6);
  const steps = ['SEARCH', 'SWIPE', 'BOOK', 'GO?'], n = 1 + Math.floor(eo(p) * 3.99);
  for (let i = 0; i < n; i++) { const y = 260 + i * 150, hot = i === 2, col = hot ? C.mag : C.lav; X.strokeStyle = col; X.lineWidth = hot ? 2 : 1.2; X.strokeRect(170, y, 240, 80); lab(290, y + 48, steps[i], hot ? C.mag : C.white, .95, 18, 'center', 'alphabetic', 'bold'); if (i) { gl(290, y - 70, 290, y - 4, C.lav, .8, 1.4); X.beginPath(); X.moveTo(282, y - 14); X.lineTo(290, y - 2); X.lineTo(298, y - 14); stroke(C.lav, 1.4, .8); } }
  if (n > 2) star(410, 560, 6, C.mag, 1);
  const forms = [['DESK', 'A'], ['PAYPHONE', 'B'], ['ON HOLD', 'C'], ['APP', 'D']];
  lab(1320, 410, 'AGENT · FORM', C.lav, .8, 13); forms.forEach(([f2, k], i) => { const hot = i === 3; gc(1336, 452 + i * 52, 10, hot ? C.mag : C.lav, .9, 1.4); if (!hot) gl(1330, 452 + i * 52, 1342, 452 + i * 52, C.lav, .9, 1.4); lab(hot ? 1420 : 1366, hot ? 464 + i * 52 : 458 + i * 52, f2, hot ? C.mag : C.white, hot ? 1 : .6, hot ? 30 : 16, 'left', 'alphabetic', hot ? 'bold' : ''); });
  star(960, 120, 5, C.mag, .9); gc(960, 120, 30, C.mag, .6, 1.2, [3, 5]);
  { const bu = ex(seg(p, .2, .6)), bxx = 1336, byy = 452 + 3 * 52; X.beginPath(); for (let i = 0; i < 20; i++) { const an = i / 20 * TAU + p * .6, r0 = 18, r1 = (i % 2 ? 34 : 52) * bu; X.moveTo(bxx + Math.cos(an) * r0, byy + Math.sin(an) * r0); X.lineTo(bxx + Math.cos(an) * (r0 + r1), byy + Math.sin(an) * (r0 + r1)); } stroke(C.mag, 1.4, .9 * bu); gc(bxx, byy, 70 * bu, C.mag, .5 * bu, 1, [2, 5]); }
  screen(); schFrame('D2', 'THE AGENT', 'FORM 4: APP');
} };

// ---------- 302.6 the home screen: every icon is his face, and one by one they turn into hers ----------
SU.d_homeIcons = { mode: 'ill', f(q, p, a, T) {
  stripes(C.paper, '#e2d6e8', 130, -.62, 0, C.plum); cam(960, 540, lerp(1.02, 1.12, eo(p)));
  const r = M32(305), ord = [...Array(24).keys()].map((i) => [r(), i]).sort((x, y) => x[0] - y[0]).map((x) => x[1]); const keep = ord.pop();
  const fl = seg(p, .08, .92) * 23, BG = [C.sky, '#e9c58a', C.sage, C.rose, C.tan, '#cfe0da'];
  hand(1020, 900, 1.5, -.1);
  phoneBody(960, 520, 2.15, -.06, (w, h) => {
    fillP(PR(0, 0, w, h), '#e9e2cf'); hatch(PR(0, 0, w, h), w / 2, h / 2, h, .7, 5, C.ink, .5, .12);
    lab(10, 12, '2:93', C.ink, .8, 8, 'left', 'middle'); fillP(PR(w - 26, 8, 16, 7), C.ink, .7);
    for (let i = 0; i < 24; i++) {
      const cx = 30 + (i % 4) * 44, cy = 40 + Math.floor(i / 4) * 54, rank = ord.indexOf(i), t2 = i === keep ? 0 : cl(fl - rank), sx = Math.abs(Math.cos(t2 * Math.PI)), who = t2 > .5 ? 'her' : 'him';
      X.save(); X.translate(cx, cy); X.scale(Math.max(.06, sx), 1); d_face(0, 0, 16, who, BG[(i * 5) % 6]); X.restore();
      if (who === 'her') { fillP(PE(cx + 15, cy - 15, 6, 6), C.brick); lab(cx + 15, cy - 14, '1', C.cream, 1, 7, 'center', 'middle', 'bold'); }
      lab(cx, cy + 27, who === 'her' ? 'AGENT' : 'ME', C.ink, .85, 7, 'center', 'alphabetic');
    }
    for (let i = 0; i < 3; i++) fillP(PE(w / 2 - 12 + i * 12, h - 14, 2.6, 2.6), C.ink, i === 1 ? 1 : .4);
  });
  const kx = 30 + (keep % 4) * 44, ky = 40 + Math.floor(keep / 4) * 54, ca = Math.cos(-.06), sa = Math.sin(-.06), lx = (kx - 96) * 2.15, ly = (ky - 196) * 2.15, tx = 960 + lx * ca - ly * sa, ty = 520 + lx * sa + ly * ca;
  const tpx = lerp(1220, tx + 24, eo(p)), tpy = lerp(780, ty + 30, eo(p)); limb([[1340, 1160], [1280, 900], [tpx, tpy]], 54, {}, 1, "#efd9b9"); fillP(PE(tpx, tpy, 30, 34, -.5), "#efd9b9"); iE(tpx, tpy, 30, 34, -.5, C.ink, 2.6); fillP(PE(tpx - 4, tpy - 10, 14, 15, -.5), "#f3e2c8"); iE(tpx - 4, tpy - 10, 14, 15, -.5, C.ink, 1.6);
  gc(tx, ty, 54 + ((FD * 4) % 20), C.orange, .9, 2.2);
  cloud(250, 230, .7, { rain: true }); noteRain(160, 300, 180, 300, 8);
  consL([[0, 520, W, 520], [960, 0, 960, H]]);
} };

// ---------- 306.7 "book me": on the giant screen he takes a run at the BOOK button; his own giant thumb comes down on it too ----------
SU.d_bigButton = { mode: 'ill', f(q, p, a, T) {
  // draft 11: he walks only along the top edge of the BOOK button (the fields sit clear above him), his cloud locked
  // over his hat; the thumb comes down and the button prints TOUR over the word BOOK
  paperOnly('#f6f0df'); illDress(); cam(960, 540, lerp(1, 1.05, eo(p)));
  const top = PR(-200, -200, W + 400, 330); fillP(top, C.orange); hatch(top, 960, 0, 1200, .7, 9, C.ink, .9, .35); iline(-200, 130, W + 200, 130, C.ink, 3);
  lab(960, 94, 'TRAVEL AGENT', C.cream, 1, 64, 'center', 'alphabetic', 'bold');
  const F = [['FROM', 'HERE'], ['TO', 'ANYWHERE'], ['WHEN', 'NOW']];
  F.forEach(([k, v], i) => { const y = 148 + i * 88, b = PR(330, y, 1260, 74); fillP(b, C.cream); hatch(b, 960, y + 37, 700, .6, 8, C.ink, .7, .15); iBox(330, y, 1260, 74, C.ink, 2.4); lab(360, y + 48, k, C.ink, .55, 24); lab(620, y + 54, v, C.ink, .95, 44, 'left', 'alphabetic', 'bold'); });
  const press = p > .78 ? 1 : 0, by = 650 + press * 16, bb = PR(560, 660, 800, 220); fillP(bb, C.dark);
  const bt = PR(560, by - 10, 800, 220 - press * 6); fillP(bt, C.orange); shade(bt, 960, by + 100, 450, [0, -26], .2, 6); iBox(560, by - 10, 800, 220 - press * 6, C.ink, 3.4); lab(960, by + 140, 'BOOK', C.cream, 1, 124, 'center', 'alphabetic', 'bold');
  const bez = PR(-200, 960, W + 400, 300); fillP(bez, '#2b2420'); iline(-200, 960, W + 200, 960, C.ink, 3);
  // him: a walk along the button's top edge, then he stops and looks up at the thumb
  const s = .46, wk = seg(p, 0, .7), hx = lerp(610, 880, wk), hy = by - 10, walking = wk > 0 && wk < 1;
  traveller(hx, hy, s, { look: walking ? 1 : .6, legs: walking ? walkPh() * .5 : null, mouth: sing(T), case: true });
  cloud(hx + (walking ? 1 : .6) * 6 * s, hy - 364 * s - 44, .24, { rain: true });
  // his own thumb, from outside the screen
  const td = eo(seg(p, .25, .78)), tx = lerp(1820, 1240, td), ty = lerp(-260, by - 80, td);
  X.save(); X.translate(tx, ty); X.rotate(-.5);
  const cuff = PR(-90, -560, 180, 260); fillP(cuff, C.teal); shade(cuff, 0, -430, 160, [20, 0], .9, 5); iBox(-90, -560, 180, 260, C.ink, 3);
  const th = PE(0, -110, 92, 200); fillP(th, '#efd9b9'); shade(th, 0, -110, 200, [24, -10], .7, 6); iE(0, -110, 92, 200, 0, C.ink, 3.2);
  const nail = PE(0, 20, 48, 52); fillP(nail, '#f3e2c8'); iE(0, 20, 48, 52, 0, C.ink, 2.2); X.restore();
  if (press) { for (let i = 0; i < 4; i++) gc(960, by + 100, 300 + i * 70 + (p - .78) * 1400, C.orange, .9 - i * .2, 3); X.save(); X.translate(960, by + 102); X.rotate(-.16); fillP(PE(0, 0, 150, 93), '#f3e6cc', .92); X.restore(); stampMark(960, by + 102, 150, 'TOUR', C.brick, -.16, 1); }
  consL([[0, by + 100, W, by + 100], [960, 0, 960, H]]);
} };

// ---------- 313.6 the phone prints the tour like a till receipt; the strip loops across the floor; at 316.0 he tears it off ----------
SU.d_ticketPrint = { mode: 'ill', f(q, p, a, T) {
  stripes(C.paper, '#e8dcc0', 140, -.62, 0, C.ochre); cam(1000, 560, lerp(1, 1.05, eo(p)));
  const fl = PR(-300, 1030, W + 600, 300); fillP(fl, '#c4ae84'); hatch(fl, 960, 1100, 1300, .1, 8, C.ink, .9, .4); iline(-300, 1030, W + 300, 1030, C.ink, 2.6);
  const tear = 316.0, torn = T >= tear, U = torn ? 15.5 : lerp(.2, 15.5, cl((T - 313.6) / (tear - 313.6)));
  const s0 = [905, 712], pts = [];
  for (let u = 0; u <= U; u += .1) { if (u < 1.6) { const t2 = u / 1.6; pts.push([lerp(s0[0], 990, t2), lerp(s0[1], 1022, eo(t2))]); } else { const v = u - 1.6; pts.push([990 + 46 * v - 80 * Math.sin(v * 1.3), 1022 - 90 * (1 - Math.cos(v * 1.3)) * .7]); } }
  const drawn = torn ? pts.filter((_, i) => i > 4) : pts;
  if (drawn.length > 1) { X.beginPath(); drawn.forEach(([x, y], i) => (i ? X.lineTo(x, y) : X.moveTo(x, y))); stroke(C.ink, 22, 1); X.beginPath(); drawn.forEach(([x, y], i) => (i ? X.lineTo(x, y) : X.moveTo(x, y))); stroke(C.cream, 16, 1);
    for (let i = 3; i < drawn.length; i += 6) { const [x1, y1] = drawn[i - 1], [x2, y2] = drawn[i], an = Math.atan2(y2 - y1, x2 - x1) + Math.PI / 2; iline(x2 - Math.cos(an) * 9, y2 - Math.sin(an) * 9, x2 + Math.cos(an) * 9, y2 + Math.sin(an) * 9, (i / 6 | 0) % 2 ? C.orange : C.ink, 3, 1, false); } }
  // the case, with his collection on it
  suitcase(420, 900, 1.3); const land = 316.7, fly = seg(T, tear, land);
  souvenirsOn(320, 912, T < land ? tear - .01 : T, .9);
  if (torn && fly < 1) { const [bx, by] = bz([905, 712], [800, 520], [560, 600], [320 + 160 * .9, 912], eo(fly)); souvenir('ticket', bx, by, 1.2); path(bzPts([905, 712], [800, 520], [560, 600], [480, 912], 0, eo(fly), 20), C.orange, 2.4, .9, [10, 8]); }
  if (torn && T < tear + .7) { for (let i = 0; i < 3; i++) gc(905, 712, 30 + i * 26 + (T - tear) * 160, C.orange, .9 - i * .25, 2.4); lab(960, 690, 'RIP', C.brick, .95, 22, 'left', 'alphabetic', 'bold'); }
  traveller(700, 1040, 1.3, { look: 1, mouth: sing(T), case: false, armR: [2.0, -.6], armL: torn && T < tear + .5 ? [1.2, .5] : [.15, -.2] });
  const bk = pixWorld('d_booked', 24, 48, (g, w, h) => d_pxBooked(g, w, h, T)); phoneBody(880, 620, .42, .12, (w, h) => blitPix(bk, 0, 0, w, h));
  cloud(700, 1040 - 600, .65, { rain: true }); noteRain(590, 490, 220, 180, 8);
  lab(1480, 870, 'TOUR · ' + Math.round(U * 14) + ' M', C.brick, .95, 30, 'left', 'alphabetic', 'bold');
  consL([[0, 1030, W, 1030], [905, 0, 905, H]]);
} };

// ---------- 322.76 "moving": a little him walks a map, and the pull-out shows the map is printed on a giant him's coat ----------
SU.d_coatMap = { mode: 'ill', f(q, p, a, T) {
  stripes(C.paper, '#e3dbc0', 140, -.62, 0, C.sage);
  const u = eio(seg(p, .12, .85)), gx = 960, gy = 1516, gs = 4; cam(lerp(985, 960, u), lerp(770, 560, u), lerp(5, 1, u));
  traveller(gx, gy, gs, { look: .4, mouth: sing(T), case: false });
  const cp = [[-34, -276], [34, -276], [46, -130], [50, -118], [-50, -118], [-46, -130]].map(([x, y]) => [gx + x * gs, gy + y * gs]), coat = PP(cp);
  X.save(); X.clip(coat);
  fillP(PR(gx - 220, gy - 1110, 440, 640), '#a9c4c0'); hatch(PR(gx - 220, gy - 1110, 440, 640), gx, gy - 800, 400, .15, 4, C.ink, .7, .3);
  const land = PP([[gx - 220, gy - 1110], [gx + 40, gy - 1110], [gx + 70, gy - 1000], [gx + 10, gy - 920], [gx + 90, gy - 820], [gx + 60, gy - 700], [gx + 160, gy - 600], [gx + 220, gy - 470], [gx - 220, gy - 470]]);
  fillP(land, '#c8cf9a'); hatch(land, gx, gy - 800, 400, .6, 4, C.ink, .7, .35, [10, -6]);
  X.beginPath(); for (let i = 0; i < 9; i++) { const y = gy - 1090 + i * 70; X.moveTo(gx - 220, y); for (let x = gx - 220; x < gx + 220; x += 12) X.lineTo(x, y + Math.sin(x * .05 + i) * 6); } stroke(C.ink, .7, .25);
  iP([[gx + 40, gy - 1110], [gx + 70, gy - 1000], [gx + 10, gy - 920], [gx + 90, gy - 820], [gx + 60, gy - 700], [gx + 160, gy - 600], [gx + 220, gy - 470]], false, C.ink, 1.2, 1, true, .5);
  for (const [x, y, r] of [[gx - 110, gy - 1000, 26], [gx - 60, gy - 820, 18], [gx - 150, gy - 640, 22]]) { iE(x, y, r, r * .7, 0, C.ink, .8, .6, false, .4); iE(x, y, r * .6, r * .4, 0, C.ink, .8, .6, false, .4); }
  const route = [[gx - 170, gy - 520], [gx - 120, gy - 600], [gx - 30, gy - 640], [gx - 80, gy - 760], [gx, gy - 860], [gx - 40, gy - 980], [gx + 10, gy - 1060]];
  path(route, C.brick, 1.2, .9, [5, 4]); for (const [x, y] of route) { fillP(PE(x, y, 3, 3), C.brick); }
  X.beginPath(); for (let i = 0; i < 6; i++) { const y = gy - 1080 + i * 110; X.moveTo(gx - 220, y); X.lineTo(gx + 220, y + 30); } for (let i = 0; i < 5; i++) { const x = gx - 200 + i * 100; X.moveTo(x, gy - 1110); X.lineTo(x - 20, gy - 470); } stroke(C.ink, .6, .3);
  const cx = gx + 120, cy = gy - 1010; iE(cx, cy, 22, 22, 0, C.ink, .8, .8, false, .3); iline(cx, cy - 30, cx, cy + 30, C.ink, .8, .8, false); iline(cx - 30, cy, cx + 30, cy, C.ink, .8, .8, false); lab(cx, cy - 34, 'N', C.ink, .8, 9, 'center');
  const wk = (T * .28) % 1, seg2 = Math.min(route.length - 2, Math.floor(wk * (route.length - 1))), lt = wk * (route.length - 1) - seg2;
  const wx = lerp(route[seg2][0], route[seg2 + 1][0], lt), wy = lerp(route[seg2][1], route[seg2 + 1][1], lt);
  traveller(wx, wy, .075, { look: route[seg2 + 1][0] > route[seg2][0] ? 1 : -1, legs: walkPh() * 1.4, case: true }); cloud(wx, wy - 36, .04, { rain: true });
  X.restore();
  iP(dens(cp, 26, true), true, C.ink, 4, 1, true, 1.2); iline(gx - 160, gy - 720, gx + 168, gy - 720, C.ink, 6, .9, false);
  cloud(500, 260, 1.1, { rain: true }); noteRain(380, 350, 260, 400, 10);
  consL([[0, gy - 720, W, gy - 720], [gx, -400, gx, H]]); consC([[wx, wy, 60]]);
} };

// ---------- 329.6 instrumental: he opens his suitcase and a smaller him climbs out of it, who opens his ...
// draft 6: the camera pushes into the nesting, each smaller him filling the frame in turn (drawn in screen space so
// the ink keeps its weight at every scale; the floor stays put on screen) ----------
SU.d_dolls = { mode: 'ill', f(q, p, a, T) {
  stripes(C.paper, '#e6d3c0', 130, -.62, 0, C.brick);
  const F = []; let x = 300, y = 1000, s = 1.5; for (let i = 0; i < 11; i++) { F.push([x, y, s]); x += 230 * s; y -= 6 * s; s *= .58; }
  const k = eio(seg(p, 0, .96)) * 7, i0 = Math.min(6, Math.floor(k)), fr = k - i0;
  const foc = (j) => [F[j][0] + 260 * F[j][2], F[j][1] - 230 * F[j][2], 1.7 / F[j][2]];
  const A = foc(i0), B = foc(i0 + 1), ff = eio(fr), cz = Math.exp(lerp(Math.log(A[2]), Math.log(B[2]), ff)), cxw = lerp(A[0], B[0], ff), cyw = lerp(A[1], B[1], ff);
  const P = (xw, yw) => [(xw - cxw) * cz + 960, (yw - cyw) * cz + 540];
  { const [lx, ly] = P(F[0][0] + 230 * 1.5 / .42, 1000 - 6 * 1.5 / .42); ngoBurst(lx, ly, 110, 1100, 26, pxStep(T, 6) * .02, '#dcb9a4', C.cream); gc(lx, ly, 110, C.brick, .7, 2); } // the vanishing point of the nesting
  const flY = lerp(P(0, F[i0][1] + 4 * F[i0][2])[1], P(0, F[i0 + 1][1] + 4 * F[i0 + 1][2])[1], ff), fl = PR(-20, flY, W + 40, H); fillP(fl, '#c4ae84'); hatch(fl, 960, flY + 300, 1300, .1, 8, C.ink, .9, .4); iline(-20, flY, W + 20, flY, C.ink, 2.6);
  for (let i = 0; i < 9; i++) iline(-200 + i * 300, flY, -500 + i * 380, H + 40, C.ink, 1.2, .35, false);
  const rise = (i) => (i === 0 ? 1 : eo(cl((k - (i - 1)) * 1.4 + .15)));
  const n = Math.min(10, i0 + 3);
  for (let i = n - 1; i >= 0; i--) {
    const [fx, fy, fs] = F[i], ss = fs * cz, r = rise(i); if (r <= 0 || ss > 9 || ss < .02) continue;
    const [sx, sy] = P(fx, fy); if (sx + 400 * ss < -50 || sx - 300 * ss > W + 50) continue;
    if (rise(i + 1) > 0) { const [lx, ly] = P(fx + 230 * fs, fy); d_openCase(lx, ly, ss, 'lid'); }
    const lift = (1 - r) * 200 * ss;
    X.save(); if (i > 0) { X.beginPath(); X.rect(-50, -50, W + 100, sy + 50); X.clip(); } traveller(sx, sy + lift, ss, { look: 1, mouth: 0, case: false, armR: rise(i + 1) > .2 ? [1.0, .9] : [-.12, .25] }); X.restore();
    if (i > 0) { const [bx, by] = P(fx, fy + 4 * fs); d_openCase(bx, by, ss / .58, 'base'); }
    cloud(sx, sy - 450 * ss + lift, .5 * ss, { rain: true });
    if (i > 0 && r < 1) for (let j = 0; j < 3; j++) gc(sx, sy - 200 * ss, (60 + j * 40) * ss + (FD % 6) * 4, C.orange, .7 - j * .2, 2, null, Math.PI * 1.1, Math.PI * 1.9);
  }
  const lvl = i0 + (fr > .5 ? 2 : 1); lab(1700, flY + 76, 'NO. ' + lvl + ' OF ?', C.brick, .95, 30, 'right', 'alphabetic', 'bold'); lab(1700, flY + 108, 'SCALE 1 : ' + Math.pow(1 / .58, lvl - 1).toFixed(1), C.ink, .7, 14, 'right');
  consL([[0, flY, W, flY], [960, 0, 960, H]]); consC([[960, 540, 420]]);
} };

// ---------- 339.8 "cage": he opens the little door in his coat; inside his chest is a ribcage birdcage, a bird that will not sing ----------
SU.d_ribCage = { mode: 'ill', f(q, p, a, T) {
  stripes(C.paper, '#d9e0cf', 130, -.62, 0, C.sage); cam(960, 560, lerp(1, 1.08, eo(p)));
  const s = 3, fx = 960, fy = 1290; traveller(fx, fy, s, { look: .2, mouth: sing(T), case: false });
  const x0 = fx - 92, y0 = fy - 760, w = 184, h = 300, op = eo(seg(p, .05, .35));
  const cav = PR(x0, y0, w, h); fillP(cav, '#e9dcc0'); hatch(cav, fx, y0 + h / 2, 200, -.6, 7, C.ink, .8, .3); hatch(cav, fx, y0 + h / 2, 200, .9, 10, C.sage, 3, .5);
  X.save(); X.clip(cav);
  iline(x0, y0 + 230, x0 + w, y0 + 230, C.ink, 4); fillP(PR(x0, y0 + 230, w, 70), '#a5703f');
  iline(fx - 60, y0 + 170, fx + 60, y0 + 170, C.ink, 4); const bw = flap() * .5 * cl(p * 3) * (singing(T) ? 1 : 0); bird(fx, y0 + 128, .62, bw);
  const n = Math.floor(seg(p, .3, 1) * 6); for (let i = 0; i < n; i++) gc(fx + 40, y0 + 104, 24 + i * 14, C.orange, .85, 2, null, -1.2, .4);
  X.restore();
  for (let i = 0; i < 6; i++) { const y = y0 + 30 + i * 44, sag = 22 + i * 3; X.beginPath(); X.moveTo(x0 + 6, y); X.quadraticCurveTo(fx, y + sag, x0 + w - 6, y); stroke(C.ink, 5, 1); X.beginPath(); X.moveTo(x0 + 8, y - 3); X.quadraticCurveTo(fx, y + sag - 3, x0 + w - 8, y - 3); stroke(C.cream, 1.6, .9); }
  iline(fx, y0 + 4, fx, y0 + h - 70, C.ink, 7); iline(fx + 2, y0 + 4, fx + 2, y0 + h - 70, C.cream, 1.6, .8, false);
  iBox(x0, y0, w, h, C.ink, 3.4);
  const dw = w * Math.cos(op * 1.35);
  if (op < .98) { const dp = PP([[x0, y0], [x0 + dw, y0], [x0 + dw, y0 + h], [x0, y0 + h]]); fillP(dp, C.teal); shade(dp, x0 + dw / 2, y0 + h / 2, 200, [20, -8], .9, 5); iBox(x0, y0, dw, h, C.ink, 3); }
  const od = PP([[x0, y0], [x0 - 120 * op, y0 - 20 * op], [x0 - 120 * op, y0 + h + 20 * op], [x0, y0 + h]]); if (op > .05) { fillP(od, '#356c69'); hatch(od, x0 - 60, y0 + h / 2, 200, .9, 5, C.ink, .9, .55); iP([[x0, y0], [x0 - 120 * op, y0 - 20 * op], [x0 - 120 * op, y0 + h + 20 * op], [x0, y0 + h]], true, C.ink, 3); fillP(PE(x0 - 100 * op, y0 + h / 2, 7, 7), C.wax); }
  cloud(fx - 330, 170, .8, { rain: true }); noteRain(fx - 450, 240, 240, 200, 9);
  const mo = sing(T); if (mo) for (let i = 0; i < 3; i++) { const rr = 40 + i * 30; gc(fx + 20, fy - 860, rr, C.ink, .35, 1.4, [3, 8], -.7, .7); } lab(fx + 150, fy - 850, '· · ·', C.ink, .5, 24, 'left');
  consL([[0, y0 + h / 2, W, y0 + h / 2], [fx, 0, fx, H]]); consC([[fx, y0 + h / 2, 300]]);
} };

// ---------- 346.6 "sing", held: the cage's bars are music staves; his rain of notes falls in and piles up, none get out ----------
SU.d_staveCage = { mode: 'ill', f(q, p, a, T) {
  stripes(C.paper, '#dfe3d2', 130, -.62, 0, C.teal); cam(1060, 560, lerp(1, 1.07, eo(p)));
  const cx = 1330, by = 980, rx = 360, ry = 820;
  const base = PR(cx - rx - 40, by - 10, 2 * rx + 80, 70); fillP(base, '#7a4a2a'); shade(base, cx, by + 25, rx + 50, [0, -14], .3, 5); iBox(cx - rx - 40, by - 10, 2 * rx + 80, 70, C.ink, 2.8);
  const r = M32(347), n = 14 + Math.floor(eo(p) * 46);
  for (let i = 0; i < n; i++) { const row = Math.floor(i / 9), x = cx - rx + 60 + (i % 9) * 78 + r() * 24 + row * 11, y = by - 24 - row * 30 - r() * 8; d_note(x, y, 1.6, i % 3 ? '#3f5f8f' : C.teal, r() - .5); }
  const fall = (T * .9) % 1; for (let i = 0; i < 6; i++) { const t2 = (fall + i / 6) % 1; d_note(cx - 200 + i * 80, lerp(by - ry - 40, by - 60 - Math.floor(n / 9) * 30, t2), 1.6, '#3f5f8f', .2); }
  const topY = by - ry + 60; for (let i = 0; i <= 8; i++) { const xx = cx - rx + i / 8 * 2 * rx; d_staffBar([[xx, by - 10], [xx, lerp(by - 10, topY, .5)], [xx, topY]], C.ink, 1.6, .95); }
  const rail = PR(cx - rx - 40, topY - 36, 2 * rx + 80, 36); fillP(rail, '#7a4a2a'); hatch(rail, cx, topY - 18, rx + 40, .1, 5, C.ink, .9, .5); iBox(cx - rx - 40, topY - 36, 2 * rx + 80, 36, C.ink, 2.8);
  for (const yy of [by - 260, by - 540]) iline(cx - rx - 12, yy, cx + rx + 12, yy, C.ink, 2.4);
  X.beginPath(); X.moveTo(cx - rx + 20, by - 60); X.bezierCurveTo(cx - rx + 70, by - 160, cx - rx - 10, by - 200, cx - rx + 30, by - 250); X.bezierCurveTo(cx - rx + 70, by - 300, cx - rx + 80, by - 220, cx - rx + 20, by - 200); X.bezierCurveTo(cx - rx - 20, by - 180, cx - rx + 40, by - 120, cx - rx + 70, by - 150); stroke(C.ink, 4, 1);
  suitcase(470, 935, 1); traveller(650, 1040, 1.2, { look: 1, mouth: Math.max(.6, sing(T)), case: false, armR: [1.3, .5] }); cloud(cx - 40, 120, .9, { rain: true }); noteRain(cx - 160, 180, 240, 60, 6);
  for (let i = 0; i < 5; i++) { const rr = 60 + i * 120 + ((FD * 8) % 120); gc(670, 700, rr, C.orange, .8 - i * .14, 2.2, null, -.5, .5); }
  consL([[0, by, W, by], [cx, 0, cx, H]]); consC([[cx, by - 400, rx + 160]]);
} };

// ---------- 351.68 "a bird": on a roof's edge he opens his long coat out like wings, and flaps, and stays.
// draft 11: seen from behind and off to one side, standing on a real parapet with the city far below him (coatMap and
// ribCage were frontal); the flap has a mid drawing and a slow beat: down, mid, up, mid, each held two drawings ----------
function d_backMan(x, y, s, fa, ff) { // the traveller from behind, coat spread on his arms; fa: arm angle, ff: far-side foreshortening
  const k = 1 / s; X.save(); X.translate(x, y); X.scale(s, s);
  for (const sx of [-1, 1]) { limb([[sx * 12, -150], [sx * 13, -78], [sx * 14, -4]], 15, {}, k, '#4a3b33'); const sp = PE(sx * 14, -5, 16, 8); fillP(sp, '#2b1d14'); iE(sx * 14, -5, 16, 8, 0, C.ink, 2 * k); }
  // the coat panels, spread on the arms: the far one foreshortened
  const hands = [];
  for (const sd of [1, -1]) {
    const f = sd > 0 ? ff : 1, sh = [sd * 30 * f, -262], el = [sd * (30 + Math.sin(fa) * 70) * f, -262 + Math.cos(fa) * 70], hd = [sd * (30 + Math.sin(fa) * 136) * f, -262 + Math.cos(fa) * 136];
    const wg = [sh, el, hd, [hd[0] - sd * 18 * f, hd[1] + 64], [sd * 118 * f, -150], [sd * 50 * f, -118], [sd * 34 * f, -180]], wp = PP(wg);
    fillP(wp, sd > 0 ? '#2f625f' : C.teal); X.save(); X.clip(wp); for (let row = 0; row < 8; row++) for (let i = 0; i < 9; i++) { const xx = lerp(sh[0], hd[0], i / 8), yy = lerp(sh[1], hd[1], i / 8) + 14 + row * 18; iE(xx, yy, 11 * f + 2, 9, 0, C.ink, 1.2 * k, .75, false, .4 * k, 0, Math.PI); } X.restore();
    shade(wp, (sh[0] + hd[0]) / 2, (sh[1] + hd[1]) / 2 + 50, 160, [0, -16], .9, 5 * k); iP(dens(wg, 20, true), true, C.ink, 2.6 * k, 1, true, .8 * k);
    limb([sh, el, hd], 13, {}, k, '#356c69'); hands.push(hd);
  }
  // the back of the coat: a centre seam, the vent, a half-belt with two buttons
  const cp = [[-34, -276], [34, -276], [46, -130], [50, -118], [-50, -118], [-46, -130]], cpath = PP(cp); fillP(cpath, C.teal); shade(cpath, 0, -200, 110, [-14, -6], .9, 5.5 * k); iP(dens(cp, 26, true), true, C.ink, 2.4 * k, 1, true, .9 * k);
  X.beginPath(); wP([[0, -270], [0, -160], [0, -118]], false, .5 * k); stroke(C.ink, 1.6 * k, .9); X.beginPath(); wP([[4, -160], [4, -118]], false, .4 * k); stroke(C.ink, 1.2 * k, .7);
  const hb = PR(-26, -186, 52, 10); fillP(hb, '#2f625f'); iBox(-26, -186, 52, 10, C.ink, 1.6 * k, 1, false); for (const bx of [-18, 18]) fillP(PE(bx, -181, 3, 3), C.ink);
  const col = PP([[-30, -276], [30, -276], [24, -292], [-24, -292]]); fillP(col, '#2f625f'); iP([[-30, -276], [-24, -292], [24, -292], [30, -276]], false, C.ink, 2 * k);
  // the back of his head, ears, and the hat
  const hp = PE(0, -308, 25, 29); fillP(hp, '#efd9b9'); hatch(hp, 0, -308, 32, .6, 4.6 * k, C.ink, .9 * k, .5, [-8, 6]); iE(0, -308, 25, 29, 0, C.ink, 2.2 * k);
  for (const sx of [-1, 1]) { fillP(PE(sx * 25, -306, 5, 8), '#e7c9a2'); iE(sx * 25, -306, 5, 8, 0, C.ink, 1.4 * k, 1, false); }
  const br = PE(0, -330, 46, 8); fillP(br, '#3d2a1f'); iE(0, -330, 46, 8, 0, C.ink, 2 * k);
  const cr = [[-26, -330], [-22, -364], [0, -358], [22, -364], [26, -330]], crp = PP(cr); fillP(crp, '#4b3426'); hatch(crp, 0, -345, 34, .7, 4 * k, C.ink, .9 * k, .6, [6, -4]); iP(cr, true, C.ink, 2 * k);
  X.beginPath(); wP([[-25, -338], [25, -338]], false, .4 * k); stroke(C.ochre, 4 * k, .9);
  for (const [hx, hy] of hands) { fillP(PE(hx, hy + 2, 8, 9), '#efd9b9'); iE(hx, hy + 2, 8, 9, 0, C.ink, 1.6 * k); }
  X.restore();
}
SU.d_coatWings = { mode: 'ill', f(q, p, a, T) {
  stripes('#e9e4d0', '#cfe0da', 150, -.62, T * 20, C.teal); cam(1010, 560, lerp(1.07, 1, eo(p)));
  // the city far below him: three rows of roofs falling away to a hazy horizon
  const hz = 300; iline(-200, hz, W + 200, hz, C.ink, 1.2, .35, false);
  // we look down on them: every roof shows its top face, deeper the nearer it is
  const r = M32(352), ROW = [[hz + 14, hz + 44, 18, 46, '#d3cec0', .8, 8], [hz + 120, hz + 200, 40, 90, '#b4ab99', 1.2, 22], [hz + 290, hz + 390, 100, 180, '#8a7f72', 1.8, 46]];
  ROW.forEach(([t0, t1, w0, w1, col, lw, dp], ri) => { for (let x = -160 + r() * 40; x < W + 200;) { const bw = w0 + r() * (w1 - w0), bt = t0 + r() * (t1 - t0), b = PR(x, bt, bw, H + 200 - bt); fillP(b, col); if (ri) hatch(b, x + bw / 2, bt + 200, 300, .9, 4 + ri * 2, C.ink, .8, .2 + ri * .1, [bw * .3, -60]); iP([[x, H + 200], [x, bt], [x + bw, bt], [x + bw, H + 200]], false, C.ink, lw, .8, false);
    const tp = [[x, bt], [x + bw, bt], [x + bw + dp * .5, bt - dp * .4], [x + dp * .5, bt - dp * .4]], tf = PP(tp); fillP(tf, '#e6dcc6'); if (ri) hatch(tf, x + bw / 2, bt - dp * .2, bw, .05, 4 + ri, C.ink, .6, .3); iP(tp, true, C.ink, lw * .8, .8, false);
    if (ri) { const ws = ri === 2 ? 26 : 14; for (let wy = bt + 12; wy < H; wy += ws + 6) for (let wx = x + 7; wx < x + bw - ws * .5; wx += ws) fillP(PR(wx, wy, ws * .4, ws * .55), [C.cream, '#e9c58a', C.sky][((wx * 7 + wy) | 0) % 3], ri === 2 ? .85 : .6);
      if (r() < .35) { const tx = x + bw * .55, ty2 = bt - dp * .2, th = ri === 2 ? 34 : 16; iline(tx, ty2, tx, ty2 - th, C.ink, 1.4); const tk = PE(tx, ty2 - th - 8 * ri, 7 * ri, 6 * ri); fillP(tk, '#8a5530'); iE(tx, ty2 - th - 8 * ri, 7 * ri, 6 * ri, 0, C.ink, 1.4, 1, false); } }
    x += bw + (ri ? 14 + r() * 34 * ri : 4); } });
  // real birds, below him over the roofs
  for (let i = 0; i < 5; i++) { const t2 = (T * .09 + i / 5) % 1; bird(lerp(-100, W + 100, t2), 470 + (i % 3) * 60 + Math.sin(i * 3) * 20, .17, d_wing3()); }
  // his roof: the parapet edge runs off to the right; the tar roof in front of it
  const ly = (x) => lerp(880, 690, (x + 200) / (W + 400)), L0 = [-200, ly(-200)], L1 = [W + 200, ly(W + 200)];
  const roof = PP([[L0[0], L0[1] + 64], [L1[0], L1[1] + 64], [L1[0], H + 200], [L0[0], H + 200]]); fillP(roof, '#6a625a'); hatch(roof, 960, 1000, 1300, .08, 9, C.ink, .9, .5); hatch(roof, 960, 1000, 1300, 1.3, 14, C.ink, .8, .25);
  const face = PP([[L0[0], L0[1] + 18], [L1[0], L1[1] + 18], [L1[0], L1[1] + 64], [L0[0], L0[1] + 64]]); fillP(face, '#a8553a'); X.save(); X.clip(face); for (let i = 0; i < 3; i++) path([[L0[0], L0[1] + 30 + i * 14], [L1[0], L1[1] + 30 + i * 14]], C.ink, 1, .5); for (let x = -200; x < W + 200; x += 46) iline(x, ly(x) + 18, x, ly(x) + 64, C.ink, 1, .4, false); X.restore();
  const cope = PP([[L0[0], L0[1]], [L1[0], L1[1]], [L1[0], L1[1] + 18], [L0[0], L0[1] + 18]]); fillP(cope, '#d8cbb0'); hatch(cope, 960, ly(960) + 9, 1200, .05, 6, C.ink, .7, .3);
  iline(L0[0], L0[1], L1[0], L1[1], C.ink, 2.8); iline(L0[0], L0[1] + 18, L1[0], L1[1] + 18, C.ink, 2); iline(L0[0], L0[1] + 64, L1[0], L1[1] + 64, C.ink, 2.4);
  // a vent pipe on the roof, and his suitcase left by it
  const vx = 420, vy = 1000, vp = PR(vx - 26, vy - 150, 52, 150); fillP(vp, '#9a9288'); hatch(vp, vx, vy - 75, 90, .2, 5, C.ink, .8, .45, [14, 0]); iBox(vx - 26, vy - 150, 52, 150, C.ink, 2.2); iE(vx, vy - 150, 34, 9, 0, C.ink, 2.2); fillP(PE(vx, vy - 150, 34, 9), '#7f776c');
  suitcase(620, 900, 1.15);
  // him on the coping, back to us; the flap is three drawings on a slow beat; a hop at the top of it
  const fx = 1240, s = 1.25, hop = Math.sin(seg(p, .45, .65) * Math.PI) * 24, fy = ly(fx) + 6 - hop, fa = [1.95, 1.58, 1.2, 1.58][(FD >> 2) & 3];
  d_backMan(fx, fy, s, fa, .62);
  cloud(fx + 10, fy - 364 * s - 130, .7, { rain: true }); noteRain(fx - 100, fy - 364 * s - 80, 220, 90, 7);
  path(bzPts([fx + 180, fy - 300], [fx + 300, fy - 420], [fx + 420, fy - 400], [fx + 500, fy - 500], 0, 1, 30), C.orange, 2.2, .7, [12, 10]); lab(fx + 530, fy - 540, '?', C.brick, 1, 60, 'center', 'middle', 'bold');
  consL([[0, hz, W, hz], [fx, 0, fx, H]]); consC([[fx, fy - 250, 330]]);
} };

// ---------- 354.6 "its wings": the swap. The bird puts on his hat, takes his suitcase and flies off; he is the one in the cage ----------
SU.d_birdSwap = { mode: 'ill', f(q, p, a, T) {
  stripes(C.paper, '#e8dcc0', 130, -.62, 0, C.ochre); cam(960, 540, lerp(1, 1.06, eo(p)));
  const sill = PR(-300, 900, W + 600, 300); fillP(sill, '#c4ae84'); hatch(sill, 960, 1000, 1300, .1, 8, C.ink, .9, .4); iline(-300, 900, W + 300, 900, C.ink, 2.6);
  const cx = 1340, by = 820, sw = Math.sin(T * 1.4) * .04;
  iline(cx, -100, cx, by - 640, C.ink, 4); iE(cx, by - 660, 26, 26, 0, C.ink, 3);
  X.save(); X.translate(cx, by - 640); X.rotate(sw); X.translate(-cx, -(by - 640));
  const base = PE(cx, by, 270, 40); fillP(base, '#7a4a2a'); shade(base, cx, by, 280, [0, -10], .3, 5); iE(cx, by, 270, 40, 0, C.ink, 2.6);
  iline(cx - 110, by - 480, cx - 110, by - 300, C.ink, 1.6); iline(cx + 110, by - 480, cx + 110, by - 300, C.ink, 1.6); iline(cx - 120, by - 300, cx + 120, by - 300, C.ink, 5);
  traveller(cx - 10, by - 300 + 150 * .62, .62, { sit: 1, hat: false, look: -1, mouth: 0, case: false });
  cloud(cx - 10, by - 520, .3, { rain: true });
  cageBars(cx, by, 260, 640, C.ink, 3, 1);
  X.restore();
  const lift = eio(seg(p, .4, 1)), bx = lerp(600, -300, lift), byy = lerp(730, -260, lift), bs = 3, wing = lift > 0 ? d_wing3() : 0;
  if (lift < .05) iline(500, 900, 760, 900, C.ink, 3);
  suitcase(bx + 90 * bs * .95, byy - 26 * bs, .9);
  bird(bx, byy, bs, wing); d_fedora(bx + 46 * bs, byy - 30 * bs - 18 * bs, .95);
  if (p > .45) { const t2 = seg(p, .45, 1); souvenir('feather', lerp(bx + 300, 760, t2 * .2), lerp(byy, 700, t2), 1.3); }
  for (let i = 0; i < 3; i++) gc(cx, by - 300, 200 + i * 50 + ((FD * 4) % 50), C.teal, .4, 1.6, [6, 8]);
  path(bzPts([680, 640], [540, 360], [300, 160], [-100, -100], 0, cl(lift * 1.5 + .1), 24), C.orange, 2.4, .85, [12, 9]);
  consL([[0, 900, W, 900], [cx, 0, cx, H]]); consC([[cx, by - 300, 420]]);
} };

// ---------- 358.4 one feather comes down; at 362.0 his hand closes on it. Draft 11: the cage seen from outside at mid
// distance (no full-frame bars over his face before the climax). The feather drifts down inside the cage and slips out
// between the side bars; his arm is already out through them and his hand closes on it. He is hatless (the bird took
// the hat at the swap) until, once he has the feather, the bird lets the hat go and it drops onto his head ----------
SU.d_featherFall = { mode: 'ill', f(q, p, a, T) {
  stripes('#e9e4d0', '#d7e2d0', 150, -.62, 0, C.sage); cam(900, 540, lerp(1, 1.05, eo(p)));
  const sill = PR(-300, 1000, W + 600, 300); fillP(sill, '#c4ae84'); hatch(sill, 960, 1080, 1300, .1, 8, C.ink, .9, .4); iline(-300, 1000, W + 300, 1000, C.ink, 2.6);
  const cx = 700, by = 960, rx = 380, ry = 1010, edge = cx + rx;
  iline(cx, -200, cx, by - ry + 10, C.ink, 4);
  const bfx = lerp(1500, 1820, p), bfy = lerp(220, 110, p); bird(bfx, bfy, .25, d_wing3());
  const base = PE(cx, by, rx + 10, 44); fillP(base, '#7a4a2a'); shade(base, cx, by, rx + 20, [0, -10], .3, 5); iE(cx, by, rx + 10, 44, 0, C.ink, 2.6);
  const py0 = by - 300; iline(cx - 60, py0 - 240, cx - 60, py0, C.ink, 1.6); iline(cx + 320, py0 - 240, cx + 320, py0, C.ink, 1.6); iline(cx - 70, py0, cx + 330, py0, C.ink, 5);
  const fs = 1.5, fx = edge - 175, fy = py0 + 150 * fs, aR = [2.01, 0];
  const hatU = eo(cl((T - 362.0) / .9)), hatOn = T >= 362.9;
  traveller(fx, fy, fs, { sit: 1, look: 1, mouth: sing(T), case: false, hat: hatOn, armR: aR });
  const ap = armIK(26, -262, aR[0], aR[1], 1), hx = fx + ap[2][0] * fs, hy = fy + (ap[2][1] + 4) * fs;
  const tc = 362.0, caught = T >= tc, ft = eo(cl((T - 358.4) / (tc - 358.4))), gx = hx + 30, gy = hy - 12, sx0 = edge - 190;
  const fpos = (t2) => [lerp(sx0, gx, t2) + Math.sin(t2 * 8) * 110 * (1 - t2), lerp(-60, gy, t2)];
  const [px, py] = caught ? [gx, gy] : fpos(ft), inside = !caught && px < edge;
  if (!caught) path(Array.from({ length: 24 }, (_, i) => fpos(ft * i / 23)), C.teal, 1.6, .6, [6, 8]);
  if (inside) souvenir('feather', px, py, 1.8);
  cageBars(cx, by, rx, ry, C.ink, 3, 1);
  // his forearm and hand are outside the bars: draw them again over the bars
  X.save(); X.beginPath(); X.rect(edge + 4, -200, 2000, 2000); X.clip(); X.save(); X.translate(fx, fy); X.scale(fs, fs); limb(ap, 13, {}, 1 / fs, '#3a7a76'); X.restore(); X.restore();
  if (!inside) souvenir('feather', px, py, 1.8);
  if (!caught) { const op = PE(hx, hy, 20, 17); fillP(op, '#efd9b9'); iE(hx, hy, 20, 17, 0, C.ink, 2.2); for (let i = 0; i < 4; i++) iline(hx - 14 + i * 10, hy - 11, hx - 17 + i * 12, hy - 34 - (i % 3) * 5, C.ink, 6, 1, false); for (let i = 0; i < 4; i++) iline(hx - 14 + i * 10, hy - 11, hx - 17 + i * 12, hy - 34 - (i % 3) * 5, '#efd9b9', 3.4, 1, false); }
  else { const fist = PE(hx + 3, hy - 3, 22, 19); fillP(fist, '#efd9b9'); hatch(fist, hx + 3, hy - 3, 24, .7, 4, C.ink, .8, .5, [5, -5]); iE(hx + 3, hy - 3, 22, 19, 0, C.ink, 2.4); for (let i = 0; i < 3; i++) iline(hx - 8 + i * 10, hy - 18, hx - 8 + i * 10, hy - 5, C.ink, 1.3, .8, false);
    for (let i = 0; i < 4; i++) gc(hx + 24, hy - 32, 56 + i * 32 + (T - tc) * 100, C.orange, cl(.9 - i * .2 - (T - tc) * .3), 2.4); }
  // the hat: carried by the bird until the catch, then dropped onto his head
  if (T < 362.0) d_fedora(bfx + 12, bfy - 12, .25);
  else if (!hatOn) { const hxx = lerp(bfx + 12, fx + 6 * fs, hatU), hyy = lerp(bfy - 12, fy - 330 * fs, hatU); d_fedora(hxx, hyy, lerp(.25, fs, hatU)); gl(bfx + 12, bfy - 12, hxx, hyy, C.orange, .6, 2, [6, 8]); }
  consL([[0, hy, W, hy], [edge, 0, edge, H]]); consC([[cx, by - 400, rx + 120]]);
} };

// ---------- 363.3 the feather, drawn: a wing's worth of lift in one quill. Draft 11: Mary Margaret O'Hara's loudest
// wordless stretch (363.85-365.2) runs a magenta trace up the shaft, lighting the barbs off one by one; its speed is her
// voice (RMS of the vocal stem, one value per drawing, measured from work/demucs vocals.wav) ----------
const D_OHARA = [-17.5, -13.9, -14.5, -14.9, -14.8, -15.9, -17.8, -18.2, -19.0, -18.8, -15.4, -17.0, -14.4, -14.4, -17.3, -17.0, -16.6]; // dB, 363.833 + i/12
function d_oharaAt(T) { // 0..1: how far her voice has carried the trace, and her level now (0..1)
  const lin = D_OHARA.map((d) => Math.pow(10, d / 20)), tot = lin.reduce((x, y) => x + y, 0), i = Math.floor((T - 363.833) * 12 + 1e-6);
  if (i < 0) return [0, 0]; let acc = 0; for (let j = 0; j <= Math.min(i, lin.length - 1); j++) acc += lin[j];
  return [cl(acc / tot), i < lin.length ? cl((D_OHARA[i] + 22) / 9) : 0];
}
SU.d_sFeather = { mode: 'sch', f(q, p, a, T) {
  schBG(); const u = cl((T - 363.3) / 2.2); cam(960, 540, lerp(1.08, 1, eo(u)));
  graticule(960, 540, 1700, 900, 50, C.lav, .05);
  const A = [420, 900], B = [760, 640], Cc = [1180, 380], D = [1520, 180], rc = bzPts(A, B, Cc, D, 0, 1, 80);
  const [tr, lv] = d_oharaAt(T), nb = Math.floor(eo(cl((T - 363.3) / .5)) * 70), lit = Math.floor(tr * 70);
  path(rc, C.white, 2.4, .95);
  for (const hot of [false, true]) { X.beginPath(); for (let i = 6; i < Math.min(76, 6 + nb); i++) { if ((i - 6 < lit) !== hot) continue; const [x, y] = rc[i], [x2, y2] = rc[i + 1], an = Math.atan2(y2 - y, x2 - x), L = 150 * Math.sin(Math.PI * (i - 6) / 72) + 10; for (const sd of [-1, 1]) { X.moveTo(x, y); X.quadraticCurveTo(x + Math.cos(an + sd * 1.2) * L * .5, y + Math.sin(an + sd * 1.2) * L * .5, x + Math.cos(an + sd * .7) * L, y + Math.sin(an + sd * .7) * L); } } stroke(hot ? C.mag : C.lav, hot ? 1.3 + lv * 1.2 : 1, hot ? .95 : .6); }
  stip(PE(1000, 480, 360, 120, -.62), 1000, 480, 380, 2600 * cl(u * 1.4), C.cyan, .45, 1.3);
  if (tr > 0) { const k = Math.min(80, Math.round(6 + tr * 70)), tp = rc.slice(0, k + 1); path(tp, C.mag, 3 + lv * 2, .95); const [ex2, ey2] = rc[k]; star(ex2, ey2, 5 + lv * 4, C.mag, 1); gc(ex2, ey2, 20 + lv * 22, C.mag, .6, 1.2); }
  const full = tr >= 1; star(D[0], D[1], full ? 10 : 7, C.mag, 1); gc(D[0], D[1], 46, C.mag, .7, 1.4); ticks(D[0], D[1], 56, 36, 6, C.mag, .7); if (full) for (let i = 0; i < 3; i++) gc(D[0], D[1], 70 + i * 30 + (T - 365.2) * 160, C.mag, .6 - i * .15, 1.4);
  bracket(A[0] + 40, A[1] + 60, D[0] + 40, D[1] + 60, C.cyan, .8, 'RACHIS 31 CM', 4);
  gl(780, 420, 600, 300, C.lav, .7, 1); lab(590, 290, 'VANE', C.white, .9, 15, 'right');
  gl(470, 860, 330, 960, C.lav, .7, 1); lab(320, 980, 'CALAMUS', C.white, .9, 15, 'right');
  lab(1180, 740, 'LIFT ≈ 0.001 N', C.mag, .95, 18, 'left', 'alphabetic', 'bold'); lab(1180, 790, 'WINGS: 1 FEATHER OF 2400', C.white, .95, 28, 'left', 'alphabetic', 'bold');
  for (let i = 0; i < 4; i++) { const yy = 860 + i * 26; gl(1180, yy, 1180 + 260 * cl(u * 2 - i * .2), yy, C.lav, .5, 6); }
  screen(); schFrame('D6', 'FEATHER', 'COLLECTED THROUGH THE BARS');
} };

// ================= draft 6 additions =================
const d_wing3 = () => [0, .5, 1, .5][(FD >> 1) & 3]; // three wing drawings (down, mid, up, mid): no two-frame strobe

// ---------- 279.28 "think": the head, drawn. Five floors of thinking against one beat of feeling ----------
SU.d_sHead = { mode: 'sch', f(q, p, a, T) {
  schBG(); cam(900, 560, lerp(1.04, 1, eo(p)));
  graticule(960, 540, 1900, 1100, 40, C.lav, .05);
  const hx = 880, hy = 600, cx0 = 810, cy0 = 620, crx = 340, cry = 380;
  iE(hx, hy, 470, 500, 0, C.lav, 1.2, .5, false, .2, -1.1, 1.5); gc(cx0, cy0, crx + 34, C.lav, .25, 1, [3, 6]);
  X.beginPath(); X.ellipse(cx0, cy0, crx, cry, 0, 0, TAU); stroke(C.white, 1.6, .9);
  const FLR = [[360, 'FILING', 9], [500, 'PACING', 11], [640, 'WRITING', 13], [780, 'REVOLVING DOOR', 6], [920, 'CLOUD TANK', 2]];
  const u = ex(p * 2.6);
  FLR.forEach(([y, nm, yr], i) => { const yy = y - 4, hw = crx * Math.sqrt(Math.max(0, 1 - ((yy - cy0) / cry) ** 2)); gl(cx0 - hw, yy, cx0 + hw, yy, C.lav, .8, 1.4);
    const y2 = yy - 76, bw2 = 300 * (yr / 13) * u; X.strokeStyle = C.cyan; X.globalAlpha = .8; X.lineWidth = 1.2; X.strokeRect(cx0 - 150, y2, bw2, 46); X.globalAlpha = 1; stip(PR(cx0 - 150, y2, bw2, 46), cx0 - 150 + bw2 / 2, y2 + 23, bw2 / 2 + 30, 14 * bw2, C.cyan, .6, 1.4); traveller(cx0 + 175, yy - 4, .14, { sch: 1, col: C.lav, legs: i % 2 ? walkPh() : null, case: false }); lab(cx0 - 230, y2 + 34, nm, C.white, .85, 14, 'right'); lab(cx0 + 220, y2 + 34, yr + ' YR', C.cyan, .9, 14, 'left'); });
  gl(cx0 + 200, 230, cx0 + 200, 920, C.lav, .5, 1, [4, 6]); star(cx0, 290, 5, C.white, .8);
  // the one big comparison, readable in a beat
  const bx = 1290, L = 520 * u; X.strokeStyle = C.cyan; X.lineWidth = 2; X.strokeRect(bx, 380, L, 110); stip(PR(bx, 380, L, 110), bx + L / 2, 435, L / 2 + 20, 2400 * u, C.cyan, .7, 1.5);
  lab(bx, 360, 'THINK · 14 965 DAYS', C.white, .95, 22, 'left', 'alphabetic', 'bold'); bracket(bx, 520, bx + L, 520, C.cyan, .7, '41 YR');
  X.strokeStyle = C.mag; X.lineWidth = 2; X.strokeRect(bx, 640, 7, 110); fillP(PR(bx, 640, 7, 110), C.mag, .8); star(bx + 4, 695, 6, C.mag, 1);
  lab(bx, 618, 'FEEL · 1 BEAT', C.mag, .95, 30, 'left', 'alphabetic', 'bold'); gl(bx + 40, 695, bx + 140, 695, C.mag, .6, 1, [3, 5]); lab(bx + 150, 700, '0.8 S', C.mag, .8, 14);
  path([[cx0 + crx + 20, 430], [bx - 40, 435]], C.lav, 1, .5, [3, 6]);
  screen(); schFrame('D1', 'THE HEAD', 'THINK vs FEEL · BY FLOOR');
} };

// ---------- the app's own world, behind glass (pixel world: draw small, snap to palette, scale up) ----------
function d_pxFeed(g, w, h, T) { // the booking feed on the tower-sized phone: destination cards scrolling up
  const st = pxStep(T, 6);
  pR(g, 0, 0, w, h, PX.k); pDots(g, 1, 1, w, h, 3, PX.n, 1);
  const off = st % 26, cols = [PX.b, PX.o, PX.g, PX.m, PX.c, PX.r];
  for (let r = -1; r < 5; r++) for (let c = 0; c < 2; c++) {
    const idx = ((r + Math.floor(st / 26)) * 2 + c + 60) % 6, x = 2 + c * 23, y = 16 + r * 26 - off; if (y > h - 12 || y < -26) continue;
    pR(g, x, y, 21, 23, PX.w); pR(g, x + 1, y + 1, 19, 16, cols[idx]);
    if (idx % 3 === 0) { pC(g, x + 12, y + 7, 3.5, PX.y); pR(g, x + 1, y + 12, 19, 5, PX.n); }
    else if (idx % 3 === 1) { pR(g, x + 6, y + 6, 2, 11, PX.u); pL(g, [[x + 2, y + 7], [x + 7, y + 5], [x + 13, y + 8]], PX.g, 2); pR(g, x + 1, y + 14, 19, 3, PX.y); }
    else { pP(g, [[x + 1, y + 17], [x + 8, y + 5], [x + 13, y + 11], [x + 16, y + 7], [x + 20, y + 17]], PX.w); pR(g, x + 5, y + 3, 9, 1, PX.w); }
    pR(g, x + 3, y + 19, 10, 2, PX.k); pC(g, x + 17, y + 20, 1.6, PX.r);
  }
  pR(g, 0, 0, w, 12, PX.r); pZig(g, 0, 10, w, 1, 5, PX.y, 1, st); for (const sx of [-1, 1]) { pC(g, w / 2 + sx * 5, 5, 3, PX.w); pC(g, w / 2 + sx * 5, 5, 1.4, PX.b); }
  pR(g, 4, h - 13, w - 8, 10, PX.r); pR(g, 8, h - 9, w - 16, 2, PX.w);
}
function d_pxGlint(g, w, h, i, T) { // the screens of the other phones in the skyline: small glints of the same world
  const st = pxStep(T, 4); pR(g, 0, 0, w, h, [PX.n, PX.k, PX.b][i % 3]); pDots(g, (i + st) % 2, 1, w, h, 2, [PX.c, PX.m, PX.y, PX.g][i % 4], 1);
  pR(g, 1, ((st + i * 3) % h), w - 2, 2, [PX.y, PX.o, PX.w][i % 3]);
}
function d_pxBooked(g, w, h, T) { // his phone at the receipt print: BOOKED, the stamp a burst
  const st = pxStep(T, 8); pR(g, 0, 0, w, h, PX.k); pR(g, 0, 0, w, 6, PX.r);
  pBurst(g, w / 2, h * .42, 6, 11, 12, st * .2, PX.y, PX.o); pC(g, w / 2, h * .42, 5, PX.r); pL(g, [[w / 2 - 3, h * .42], [w / 2 - 1, h * .42 + 2], [w / 2 + 3, h * .42 - 3]], PX.w, 1.4);
  for (let i = 0; i < 4; i++) pR(g, 4, h * .7 + i * 3, w - 8 - (i % 2) * 6, 1, PX.w); pR(g, w / 2 - 5, h - 4, 10, 4, PX.w);
}

// ---------- 316.0 the receipt, drawn as a prescription: the tour as one dose, relief plotted against distance ----------
SU.d_sDose = { mode: 'sch', f(q, p, a, T) {
  schBG(); cam(960, 540, lerp(1.05, 1, eo(p)));
  graticule(960, 540, 1900, 1100, 40, C.lav, .05);
  // the strip, torn at the top
  const rx = 300, rw = 270, top = 200, bot = 900, tear = []; for (let i = 0; i <= 12; i++) tear.push([rx + i * rw / 12, top + (i % 2 ? -14 : 8)]);
  X.beginPath(); tear.forEach(([x, y], i) => (i ? X.lineTo(x, y) : X.moveTo(x, y))); X.lineTo(rx + rw, bot); X.lineTo(rx, bot); X.closePath(); stroke(C.white, 1.6, .9);
  stip(PR(rx, top, rw, bot - top), rx + rw / 2, 550, 380, 900, C.lav, .25, 1.2); star(rx + rw * .55, top - 6, 6, C.mag, 1); lab(rx + rw + 16, top - 20, 'TORN HERE', C.mag, .9, 12);
  lab(rx + 24, 290, 'Rx', C.white, .95, 44, 'left', 'alphabetic', 'bold');
  [['TOUR · 1 DOSE', C.white], ['TAKE: WHILE MOVING', C.cyan], ['DO NOT STOP', C.lav], ['REFILLS: ∞', C.cyan]].forEach(([t, c], i) => lab(rx + 24, 360 + i * 46, t, c, .9, 15));
  X.beginPath(); for (let i = 0; i < 40; i++) { const x = rx + 24 + i * 5.6; X.moveTo(x, 620); X.lineTo(x, i % 3 ? 700 : 720); } stroke(C.lav, 1.4, .8);
  for (let i = 0; i < 5; i++) gl(rx + 24, 760 + i * 24, rx + rw - 30 - (i % 2) * 50, 760 + i * 24, C.lav, .45, 4);
  // the curve: relief rises with distance and flattens at half
  const ox = 760, oy = 860, gw = 1000, gh = 600, rel = (k) => .5 * (1 - Math.exp(-k * 4.2));
  gl(ox, oy, ox + gw + 40, oy, C.white, .85, 1.6); gl(ox, oy, ox, oy - gh - 40, C.white, .85, 1.6);
  for (let i = 0; i <= 10; i++) { gl(ox + i * gw / 10, oy, ox + i * gw / 10, oy + (i % 5 ? 8 : 18), C.lav, .7); if (i % 5 === 0) lab(ox + i * gw / 10, oy + 44, String(i * 1000), C.lav, .7, 12, 'center'); }
  for (let i = 0; i <= 4; i++) { gl(ox - (i % 2 ? 8 : 18), oy - i * gh / 4, ox, oy - i * gh / 4, C.lav, .7); lab(ox - 26, oy - i * gh / 4 + 5, (i * 25) + '%', C.lav, .7, 12, 'right'); }
  lab(ox + gw, oy + 74, 'KM MOVED', C.white, .85, 14, 'right'); lab(ox + 10, oy - gh - 56, 'RELIEF', C.white, .85, 14);
  gl(ox, oy - gh, ox + gw, oy - gh, C.lav, .45, 1, [6, 8]); lab(ox + gw, oy - gh - 12, 'FULL · NOT AVAILABLE', C.lav, .7, 12, 'right');
  gl(ox, oy - gh / 2, ox + gw, oy - gh / 2, C.mag, .85, 1.4, [8, 6]); lab(ox + gw * .62, oy - gh / 2 - 18, 'PLATEAU · HALF', C.mag, .95, 30, 'center', 'alphabetic', 'bold');
  const kk = cl(ex(p * 1.3)), pts = []; for (let i = 0; i <= 80; i++) { const k = i / 80 * kk; pts.push([ox + k * gw, oy - rel(k) * gh]); }
  X.save(); X.beginPath(); X.moveTo(ox, oy); pts.forEach(([x, y]) => X.lineTo(x, y)); X.lineTo(ox + kk * gw, oy); X.closePath(); X.clip(); stipRect(ox, oy - gh / 2, gw, gh / 2, 2200, C.cyan, .45, 1.3); X.restore();
  path(pts, C.cyan, 2.4, .95); const [dx, dy] = pts[pts.length - 1]; gc(dx, dy, 14, C.white, .9, 1.4); traveller(dx, dy - 18, .16, { sch: 1, col: C.white, legs: walkPh() * 1.4, case: true });
  screen(); schFrame('D4', 'DOSE', 'RELIEF vs DISTANCE');
} };

// the suitcase flying upside down: (x, y) is the middle of the handle, which hangs under the case
function d_caseUpside(x, y, sc) {
  const k = 1 / sc; X.save(); X.translate(x, y); X.scale(sc, sc);
  const w = 120, h = 82, bx = -w / 2, bt = -16, b = PR(bx, bt - h, w, h);
  fillP(b, '#9a5a34'); shade(b, 0, bt - h / 2, 80, [-14, 10], .75, 5 * k); iP(dens([[bx, bt - h], [bx + w, bt - h], [bx + w, bt], [bx, bt]], 26, true), true, C.ink, 2.4 * k, 1, true, k);
  X.beginPath(); for (const sx of [-34, 34]) { X.moveTo(sx, bt - h); X.lineTo(sx, bt); } stroke(C.ink, 2.2 * k, .8);
  for (const [sx, sy] of [[-60, bt], [60, bt], [-60, bt - h], [60, bt - h]]) { fillP(PE(sx, sy, 6, 6), '#c9a46a'); iE(sx, sy, 6, 6, 0, C.ink, 1.2 * k, .9, false); }
  const st = PE(-18, bt - 46, 14, 10, -.3); fillP(st, C.cream); iE(-18, bt - 46, 14, 10, -.3, C.ink, 1.2 * k, .9, false, .5); fillP(PE(14, bt - 30, 9, 9), C.rose); iE(14, bt - 30, 9, 9, 0, C.ink, 1.2 * k, .9, false);
  const hp = [[-34, bt], [-34, -5], [-30, 0], [30, 0], [34, -5], [34, bt]];
  X.beginPath(); wP(hp, false, .3 * k); stroke(C.ink, 5 + 3.2 * k, 1); X.beginPath(); wP(hp, false, .2 * k); stroke('#6b3f22', 5, 1);
  X.restore();
}
// ---------- 319.52 "as long as I'm moving": high up now, the fields a patchwork far below; the case flies, he hangs on ----------
SU.d_casePlane = { mode: 'ill', f(q, p, a, T) {
  stripes('#e4e9e2', '#d3e0dc', 170, -.62, -T * 160, C.teal); cam(960, 540, lerp(1, 1.05, eo(p)));
  const hz = 930, gnd = new Path2D(); gnd.moveTo(-300, hz + 60); gnd.quadraticCurveTo(960, hz - 60, W + 300, hz + 60); gnd.lineTo(W + 300, H + 300); gnd.lineTo(-300, H + 300); gnd.closePath(); fillP(gnd, '#b9b48c');
  X.save(); X.clip(gnd); const FC = [C.sage, '#c9b47a', '#a8a878', C.tan, '#9fb08a'], sc0 = T * 70;
  for (let r = 0; r < 6; r++) for (let i = -2; i < 40; i++) { const tw = 48 + (i * 7 + r * 13) % 30, x0 = i * 52 - (sc0 % 52) + (r % 2) * 20, y0 = hz - 40 + r * 26, pf = PR(x0, y0, tw, 24); fillP(pf, FC[((i + Math.floor(sc0 / 52)) * 3 + r * 2 + 50) % 5]); hatch(pf, x0 + tw / 2, y0 + 12, tw, (i + r) % 2 ? .4 : -.8, 4, C.ink, .6, .35); iBox(x0, y0, tw, 24, C.ink, .8, .5, false); if ((i + r) % 4 === 0) fillP(PE(x0 + 10, y0 + 10, 4, 4), '#5a6a4a'); }
  X.beginPath(); for (let x = -300; x < W + 300; x += 20) X.lineTo(x, hz + 20 + Math.sin((x + sc0) * .01) * 30 + (x - 960) ** 2 / 30000); stroke('#6a8a9a', 5, .8);
  X.restore(); X.beginPath(); X.moveTo(-300, hz + 60); X.quadraticCurveTo(960, hz - 60, W + 300, hz + 60); stroke(C.ink, 1.8, .8);
  for (let i = 0; i < 5; i++) { const x = ((i * 520 - T * 420) % (W + 700) + W + 700) % (W + 700) - 350, y = 830 + (i % 2) * 50, sc2 = .7 + (i % 3) * .2; const pu = new Path2D(); for (const [dx, dy, r] of [[-70, 10, 34], [-30, -14, 44], [20, -10, 40], [64, 8, 32], [0, 14, 40]]) pu.addPath(PE(x + dx * sc2, y + dy * sc2, r * sc2, r * .7 * sc2)); fillP(pu, C.cream); hatch(pu, x, y, 90 * sc2, .6, 5, C.ink, .7, .35, [0, -10]); for (const [dx, dy, r] of [[-70, 10, 34], [-30, -14, 44], [20, -10, 40], [64, 8, 32]]) iE(x + dx * sc2, y + dy * sc2, r * sc2, r * .7 * sc2, 0, C.ink, 1.6, .9, false, .8, Math.PI * .95, Math.PI * 2.05); }
  // draft 11: the case flies upside down with its handle hanging under it; both his fists close on the handle, arms
  // straight up from the shoulders, so the case visibly carries his weight (he swings under it like a pendulum)
  const m = 1.38, bob = Math.sin(T * 2) * 18, cx = 960, gy = 215 + bob, wf3 = [-.35, -.05, .25, -.05][(FD >> 1) & 3], cs = 1.92, ts = 1.3;
  for (const s2 of [-1, 1]) { X.save(); X.translate(cx + s2 * 56 * cs, gy - 60 * cs); X.rotate(wf3 * s2); X.scale(m, m); const wpts = [[0, 0], [s2 * 280, -60], [s2 * 300, -20], [s2 * 40, 40]], wg = PP(wpts); fillP(wg, '#d8d0bb'); hatch(wg, s2 * 150, -10, 160, .6, 5, C.ink, .9, .5, [0, -10]); for (let k = 1; k < 6; k++) iline(s2 * (30 + k * 46), 30 - k * 14, s2 * (40 + k * 46), -6 - k * 10, C.ink, 1.2, .6, false); iP(wpts, true, C.ink, 2.2); X.restore(); }
  d_caseUpside(cx, gy, cs);
  const swing = Math.sin(T * 2 - .9) * .05, aU = 2.962, hand = 50.3 * ts, ty = gy + (395.8 - 4) * ts;
  X.save(); X.translate(cx, gy); X.rotate(swing); X.translate(-cx, -gy);
  traveller(cx, ty, ts, { look: .3, mouth: sing(T), armR: [aU, 0], armL: [-aU, 0], legs: Math.sin(T * 3) * .7, case: false });
  X.restore();
  for (const sd of [-1, 1]) { const fx2 = cx + sd * hand, fy2 = gy; const fp = PE(fx2, fy2, 17, 15); fillP(fp, '#efd9b9'); hatch(fp, fx2, fy2, 18, .7, 4, C.ink, .8, .45, [sd * 5, -5]); iE(fx2, fy2, 17, 15, 0, C.ink, 2.4); for (let i = 0; i < 3; i++) iline(fx2 - 9 + i * 8, fy2 - 13, fx2 - 9 + i * 8, fy2 - 2, C.ink, 1.3, .8, false); iline(fx2 - sd * 4, gy - 3, fx2 + sd * 22, gy - 9, C.ink, 1.2, .6, false); }
  cloud(cx - 600, gy + 60 + Math.sin(T * 1.6) * 30, .85, { rain: true }); gl(cx - 600, gy + 90, cx - 120, gy + 160, C.teal, .7, 1.6, [8, 8]);
  for (let i = 0; i < 7; i++) { const y = 260 + i * 80; gl(1500 + ((T * 900 + i * 140) % 400), y, 1640 + ((T * 900 + i * 140) % 400), y, C.ink, .45, 2); }
  const feet = ty; bracket(1560, hz - 10, 1560, feet, C.brick, .7); lab(1590, (hz + feet) / 2 + 10, 'ALT 900 M', C.brick, .95, 30, 'left', 'alphabetic', 'bold');
  consL([[0, hz, W, hz], [cx, 0, cx, H]]);
} };

// ---------- 336.78 "cage": the bird checked in as baggage, a pet carrier coming through the carousel flaps; his two hands bracket it ----------
SU.d_crate = { mode: 'ill', f(q, p, a, T) {
  stripes('#e8e0cc', '#dcd1b8', 140, -.62, 0, C.ochre); cam(960, 540, lerp(1.04, 1, eo(p)));
  // the carousel mouth: steel surround, rubber strips, a sign
  const mx = 520, my = 150, mw = 880, mh = 600, mo = PR(mx, my, mw, mh); fillP(PR(mx - 60, my - 60, mw + 120, mh + 60), '#b9b2a2'); hatch(PR(mx - 60, my - 60, mw + 120, mh + 60), 960, 450, 700, .8, 9, C.ink, .8, .35); iBox(mx - 60, my - 60, mw + 120, mh + 60, C.ink, 3);
  for (let i = 0; i < 12; i++) { fillP(PE(mx - 30 + (i % 6) * ((mw + 60) / 5), i < 6 ? my - 30 : my + mh - 6, 6, 6), C.ink, .8); }
  fillP(mo, '#2b2420'); hatch(mo, 960, 450, 700, .3, 7, '#000', 1, .5);
  const ce = eo(seg(p, 0, .6)), cs = lerp(.55, 1, ce), cby = lerp(740, 830, ce);
  for (let i = 0; i < 14; i++) { const x = mx + i * mw / 14, dx = x + mw / 28 - 960, push = Math.max(0, 1 - Math.abs(dx) / (300 * cs + 60)) * (1 - ce * .7), sw = Math.sign(dx || 1) * push * 90 + Math.sin(T * 5 + i) * 4 * push;
    const st = PP([[x + 2, my], [x + mw / 14 - 2, my], [x + mw / 14 - 2 + sw, my + mh], [x + 2 + sw, my + mh]]); fillP(st, '#4a4440'); hatch(st, x + mw / 28, my + mh / 2, mh, 1.5, 7, C.ink, .9, .55); iP([[x + 2, my], [x + 2 + sw, my + mh]], false, C.ink, 1.4, .9, false); }
  const sg = PR(800, my - 130, 320, 60); fillP(sg, C.cream); iBox(800, my - 130, 320, 60, C.ink, 2.4); lab(960, my - 90, 'BAGGAGE · BELT 0', C.ink, .9, 18, 'center', 'alphabetic', 'bold');
  // the belt, front on
  const belt = PR(260, 750, 1400, 80); fillP(belt, '#3b3430'); X.beginPath(); const boff = (T * 60) % 50; for (let x = 260 - boff; x < 1660; x += 50) { X.moveTo(x, 752); X.lineTo(x + 14, 828); } stroke(C.cream, 1.6, .4); iBox(260, 750, 1400, 80, C.ink, 3);
  const sk = PR(220, 830, 1480, 300); fillP(sk, '#8f8a80'); hatch(sk, 960, 960, 900, .1, 8, C.ink, .9, .45); iBox(220, 830, 1480, 300, C.ink, 3);
  suitcase(380, 680, 1.1); suitcase(1560, 690, .9);
  // the carrier
  X.save(); X.translate(960, cby); X.scale(cs, cs); const k = 1 / cs;
  const shell = [[-260, -20], [-270, -300], [-240, -380], [240, -380], [270, -300], [260, -20], [230, 0], [-230, 0]], sp = PP(shell); fillP(sp, '#cdb48a'); shade(sp, 0, -190, 300, [-30, -14], .8, 6 * k); iP(dens(shell, 30, true), true, C.ink, 3.4 * k, 1, true, k);
  iline(-268, -205, 268, -205, C.ink, 2.4 * k); for (const bx of [-230, -120, 120, 230]) { fillP(PE(bx, -205, 8, 8), '#8a8a8a'); iE(bx, -205, 8, 8, 0, C.ink, 1.4 * k, 1, false); }
  X.beginPath(); X.moveTo(-90, -380); X.bezierCurveTo(-90, -470, 90, -470, 90, -380); stroke(C.ink, 18 * k, 1); X.beginPath(); X.moveTo(-90, -380); X.bezierCurveTo(-90, -470, 90, -470, 90, -380); stroke('#8a5530', 10 * k, 1);
  for (const sd of [-1, 1]) for (let r = 0; r < 5; r++) { const vp = PR(sd * 232 - 10, -330 + r * 50, 20, 30); fillP(vp, '#2b2420'); iBox(sd * 232 - 10, -330 + r * 50, 20, 30, C.ink, 1.2 * k, 1, false); }
  const gd = PR(-170, -340, 340, 290); fillP(gd, '#3a2e26'); hatch(gd, 0, -195, 220, .6, 6 * k, '#000', 1, .5);
  bird(-10, -150, .95, 0); X.beginPath(); X.moveTo(64 * .95 - 10, -36 * .95 - 150); X.lineTo(90 * .95 - 10, -28 * .95 - 150); stroke(C.ink, 3 * k, 1); // beak shut
  X.beginPath(); for (let x = -170; x <= 170; x += 28) { X.moveTo(x, -340); X.lineTo(x, -50); } for (let y = -340; y <= -50; y += 36) { X.moveTo(-170, y); X.lineTo(170, y); } stroke(C.ink, 5 * k, 1); X.beginPath(); for (let x = -170; x <= 170; x += 28) { X.moveTo(x - 1.5, -340); X.lineTo(x - 1.5, -50); } stroke('#c9cdd2', 1.8 * k, .9);
  iBox(-170, -340, 340, 290, C.ink, 4 * k); fillP(PR(150, -230, 34, 60), '#8a8a8a'); iBox(150, -230, 34, 60, C.ink, 1.8 * k);
  for (const ax of [-235, 235]) { iline(ax, -60, ax, -150, C.brick, 4 * k, 1, false); X.beginPath(); X.moveTo(ax - 12, -138); X.lineTo(ax, -156); X.lineTo(ax + 12, -138); stroke(C.brick, 4 * k, 1); }
  X.save(); X.translate(60, -450); X.rotate(.12 + Math.sin(T * 3) * .06); iline(0, 0, -140, 70, C.ink, 2 * k, 1, false); const tg = PR(-160, 40, 320, 70); fillP(tg, C.cream); iBox(-160, 40, 320, 70, C.ink, 2 * k); fillP(PE(-140, 75, 5, 5), C.ink); lab(10, 88, 'LIVE ANIMAL', C.brick, 1, 30, 'center', 'alphabetic', 'bold'); X.restore();
  X.restore();
  // his two arms come in to claim it: brackets. Draft 11: each arm hangs from a shoulder just inside the frame, bends
  // at one elbow (down and out) and its hand lands flat on the carrier's side, fingers curled round the front edge
  const rch = eo(seg(p, .4, .88));
  for (const sd of [-1, 1]) {
    const shx = 960 + sd * 900, shy = 650, side = [960 + sd * (266 * cs + 16), cby - 190 * cs], rest = [lerp(shx, side[0], .5), lerp(shy, side[1], .5) + 60];
    const hx = lerp(rest[0], side[0], rch), hy = lerp(rest[1], side[1], rch), L = 360;
    let dx = hx - shx, dy = hy - shy; const d = Math.min(Math.hypot(dx, dy), 2 * L - 1), u = [dx / Math.hypot(dx, dy), dy / Math.hypot(dx, dy)], hh = Math.sqrt(L * L - (d / 2) ** 2);
    const mxp = shx + u[0] * d / 2, myp = shy + u[1] * d / 2, e1 = [mxp - u[1] * hh, myp + u[0] * hh], e2 = [mxp + u[1] * hh, myp - u[0] * hh], el = e1[1] > e2[1] ? e1 : e2;
    limb([[shx, shy], el, [hx - sd * 6, hy + 6]], 56, {}, 1, C.teal);
    iE(el[0], el[1], 30, 30, 0, C.ink, 1.4, .5, false, .6, 0, Math.PI); // the elbow crease
    // the shoulder: a coat shoulder and collar at the frame edge
    const scx = shx + sd * 75, scy = shy + 290, sh = PE(scx, scy, 180, 360); fillP(sh, C.teal); shade(sh, scx, scy, 360, [sd * 40, -60], .9, 6); iE(scx, scy, 180, 360, 0, C.ink, 3, 1, true, 1.2);
    X.beginPath(); X.moveTo(shx + sd * 150, shy - 60); X.quadraticCurveTo(shx + sd * 60, shy + 60, shx + sd * 40, shy + 330); stroke(C.ink, 2.4, .7); // the sleeve seam
    // the hand, flat on the side; fingers curl over the front edge, the thumb on top
    const pm = PE(hx + sd * 10, hy, 34, 50); fillP(pm, '#efd9b9'); hatch(pm, hx + sd * 10, hy, 50, .7, 5, C.ink, .8, .45, [sd * 10, -10]); iE(hx + sd * 10, hy, 34, 50, 0, C.ink, 2.6);
    for (let i = 0; i < 4; i++) { const fy3 = hy - 30 + i * 20; iline(hx - sd * 6, fy3, hx - sd * 40, fy3 + 4, C.ink, 18, 1, false); iline(hx - sd * 6, fy3, hx - sd * 40, fy3 + 4, '#efd9b9', 13, 1, false); }
    iline(hx + sd * 8, hy - 44, hx - sd * 22, hy - 62, C.ink, 20, 1, false); iline(hx + sd * 8, hy - 44, hx - sd * 22, hy - 62, '#efd9b9', 15, 1, false);
  }
  if (rch >= 1) for (let i = 0; i < 3; i++) gc(960, cby - 200, 360 + i * 40 + ((FD * 5) % 40), C.orange, .6 - i * .15, 2, null, -2.6, -.5);
  consL([[0, cby, W, cby], [960, 0, 960, H]]); consC([[960, cby - 200, 420]]);
} };

// ---------- 343.98 "sing": the chest, drawn. Twelve ribs as bars, the bird inside, its output a flat line ----------
SU.d_sRib = { mode: 'sch', f(q, p, a, T) {
  schBG(); cam(960, 540, lerp(1.05, 1, eo(p)));
  lattice(960, 540, 60, 14, C.lav, .05);
  const coat = [[-34, -276], [34, -276], [46, -130], [50, -118], [-50, -118], [-46, -130]].map(([x, y]) => [960 + x * 3.6, 1420 + y * 3.6]);
  iP(coat, true, C.lav, 1.2, .7, false, .2); iE(960, 1420 - 306 * 3.6, 94, 110, 0, C.lav, 1.2, .6, false, .2);
  const x0 = 800, x1 = 1120, y0 = 470, y1 = 860;
  for (const sd of [-1, 1]) stip(PE(960 + sd * 110, 650, 90, 170), 960 + sd * 110, 650, 180, 900, C.lav, .3, 1.3);
  const n = Math.floor(ex(p * 2.5) * 6.99);
  for (let i = 0; i < 6; i++) { const y = y0 + 30 + i * 52, sag = 26 + i * 3, hot = i < n; X.beginPath(); X.moveTo(x0, y); X.quadraticCurveTo(960, y + sag, x1, y); stroke(hot ? C.white : C.lav, hot ? 2 : 1, hot ? .95 : .35); }
  gl(960, y0, 960, y1 - 60, C.white, .9, 2.2); gl(x0, y1 - 40, x1, y1 - 40, C.lav, .8, 1.4);
  gl(900, 700, 1020, 700, C.cyan, .9, 1.6); bird(960, 662, .55, 0, { sch: 1, col: C.cyan });
  // the door: the coat, swung open on one hinge
  X.strokeStyle = C.lav; X.lineWidth = 1.2; X.setLineDash([6, 6]); X.strokeRect(x0 - 150, y0, 150, y1 - y0); X.setLineDash([]); gc(x0, y0, 150, C.lav, .6, 1, [3, 5], Math.PI * .5, Math.PI); lab(x0 - 160, y0 - 18, 'DOOR · 1 HINGE', C.lav, .8, 12);
  bracket(760 - 160, y0 + 30, 760 - 160, y0 + 82, C.cyan, .8, 'RIB 44 MM', 10); lab(x1 + 20, y0 + 20, 'BARS: 12 RIBS', C.white, .85, 14);
  // output: a flat line from the beak
  const bx = 1000, by2 = 640, L = 640 * eo(seg(p, 0, .4)); gl(bx, by2, bx + L, by2, C.mag, .95, 2); for (let i = 0; i < L / 20; i++) gl(bx + i * 20, by2 - 4, bx + i * 20, by2 + 4, C.mag, .6, 1);
  if (L > 600) { lab(bx + L, by2 + 52, 'SONG · 0 DB', C.mag, .95, 30, 'right', 'alphabetic', 'bold'); star(bx + L, by2, 5, C.mag, 1); }
  lab(bx + 40, by2 - 24, 'OUTPUT', C.lav, .7, 12);
  screen(); schFrame('D5', 'THE CHEST', 'OUTPUT: SILENCE');
} };

// ---------- 349.34 "What good's a bird": the clipped wings pinned in a specimen frame; the bird walks off down a ladder ----------
function d_wingPts(cx, cy, sd, s) {
  const o = [[0, 0], [60, -70], [150, -130], [270, -170], [300, -160]];
  for (let i = 0; i <= 6; i++) { const t = i / 6, bx = lerp(300, 10, t), by = lerp(-160, 40, t) + Math.sin(t * Math.PI) * 60; o.push([bx, by]); o.push([bx - 22, by + 26]); }
  return o.map(([x, y]) => [cx + sd * x * s, cy + y * s]);
}
SU.d_wingFrame = { mode: 'ill', f(q, p, a, T) {
  stripes('#e7e1cf', '#d9d3be', 120, -.62, 0, C.sage); cam(980, 520, lerp(1.06, 1, eo(p)));
  const fl = PR(-300, 980, W + 600, 300); fillP(fl, '#a5703f'); hatch(fl, 960, 1100, 1300, .05, 7, C.ink, .9, .45); iline(-300, 980, W + 300, 980, C.ink, 2.6);
  const fx = 600, fy = 120, fw = 760, fh = 560, fr = PR(fx - 46, fy - 46, fw + 92, fh + 92); fillP(fr, '#5a3a22'); shade(fr, 980, 400, 600, [20, -16], .8, 6); iBox(fx - 46, fy - 46, fw + 92, fh + 92, C.ink, 3.4);
  const mat = PR(fx, fy, fw, fh); fillP(mat, C.cream); hatch(mat, 980, 400, 500, .3, 11, C.ink, .7, .15); iBox(fx, fy, fw, fh, C.ink, 2.4);
  const cx = 980, cy = 360;
  for (const sd of [-1, 1]) { const wp = d_wingPts(cx + sd * 26, cy, sd, 1.05), wpp = PP(wp); fillP(wpp, C.teal); shade(wpp, cx + sd * 160, cy - 40, 220, [sd * 10, -14], .9 - sd * .3, 5); for (let k = 0; k < 6; k++) { const t = (k + .5) / 6; iline(cx + sd * 30, cy + 10, cx + sd * lerp(300, 20, t) * 1.05, cy + (lerp(-160, 40, t) + Math.sin(t * Math.PI) * 60) * 1.05, C.ink, 1.2, .6, false); } iP(wp, true, C.ink, 2.6, 1, true, .7);
    for (const [px2, py2] of [[60, -40], [200, -110], [140, 20]]) { const x = cx + sd * px2, y = cy + py2; iline(x, y, x + 6, y + 14, C.ink, 1.4, 1, false); fillP(PE(x, y, 6, 6), C.ochre); iE(x, y, 6, 6, 0, C.ink, 1.4, 1, false); }
    const tg = PR(cx + sd * 200 - 26, cy + 130, 52, 34); fillP(tg, '#f4ecd6'); iBox(cx + sd * 200 - 26, cy + 130, 52, 34, C.ink, 1.6); lab(cx + sd * 200, cy + 154, sd < 0 ? 'L' : 'R', C.ink, .9, 18, 'center', 'alphabetic', 'bold'); }
  X.beginPath(); X.setLineDash([6, 6]); X.moveTo(cx, cy - 120); X.lineTo(cx, cy + 90); stroke(C.brick, 2, .9); X.setLineDash([]);
  const pl = PR(cx - 220, fy + fh - 100, 440, 64); fillP(pl, '#e2c27a'); hatch(pl, cx, fy + fh - 68, 240, .7, 5, C.ink, .7, .3); iBox(cx - 220, fy + fh - 100, 440, 64, C.ink, 2.2); lab(cx, fy + fh - 57, 'WINGS · CLIPPED', C.ink, .95, 28, 'center', 'alphabetic', 'bold');
  hatch(mat, 980, 400, 520, -.95, 46, C.cream, 6, .35);
  // the ledge and the ladder down
  const lg = PR(fx - 80, fy + fh + 46, fw + 160, 26); fillP(lg, '#8a5530'); iBox(fx - 80, fy + fh + 46, fw + 160, 26, C.ink, 2.4);
  const lt = [fx + fw + 70, fy + fh + 46], lb = [fx + fw + 250, 980], nR = 8;
  for (const o of [0, 70]) iline(lt[0] + o, lt[1] - 30, lb[0] + o, lb[1], C.ink, 4); for (let r = 1; r <= nR; r++) { const t = r / (nR + 1); iline(lerp(lt[0], lb[0], t), lerp(lt[1] - 30, lb[1], t), lerp(lt[0], lb[0], t) + 70, lerp(lt[1] - 30, lb[1], t), C.ink, 3, 1, false); }
  // the bird, on foot: along the ledge, down the rungs, off across the floor
  const bs = .7, step = (FD >> 1) & 1; let bx, by;
  if (p < .38) { const t = p / .38; bx = lerp(cx + 40, lt[0] + 30, t); by = lt[1]; }
  else if (p < .86) { const r = Math.min(nR + 1, Math.floor(seg(p, .38, .86) * (nR + 1.99))), t = r / (nR + 1); bx = lerp(lt[0], lb[0], t) + 35; by = lerp(lt[1], lb[1], t); }
  else { bx = lerp(lb[0] + 35, lb[0] + 300, seg(p, .86, 1)); by = 980; }
  bird(bx, by - 56 * bs - step * 5, bs, 0);
  for (let i = 1; i < 6; i++) fillP(PE(bx - i * 30, by + 3, 4, 2), C.ink, .35);
  traveller(250, 1150, 1.5, { look: 1, mouth: sing(T) }); cloud(250, 1150 - 690, .85, { rain: true }); noteRain(130, 520, 240, 300, 8);
  path([[330, 560], [520, 420], [cx - 200, cy - 20]], C.teal, 2, .7, [10, 8]);
  consL([[0, cy, W, cy], [cx, 0, cx, H]]); consC([[cx, cy, 420]]);
} };

// ---------- the cut list ----------
var CUTS_D = [
  [276.0, 'd_headRooms', {}],                              // "It took me so long": tight on the clock in his head, pull out; his hat comes back
  [279.28, 'd_sHead', {}],                                 // "think": the head drawn, THINK 41 yr against FEEL 1 beat
  [280.34, 'seesaw', {}],                                  // "Didn't take me long at all to feel": the seesaw flips on 'feel' (283.8)
  [284.4, 'sSeesaw', {}],                                  // the balance, drawn
  [286.3, 'd_heartGiant', {}],                             // the heart is a hill he stands on; pull out
  [290.4, 'd_mirror', {}],                                 // his reflection scans into her, in his hat
  [293.72, 'mvu_app', {}],                                 // CHORUS 3 "Travel agent": she is the app now (LOCKED)
  [297.0, 'd_appTower', {}],                               // the app is a tower, its screen the pixel world; he is tiny at its foot
  [300.1, 'd_sApp', {}],                                   // "travel agent": the tower drawn, the agent's four forms, a magenta burst at APP
  [302.6, 'mvu_sChart', {}],                               // the field chart (LOCKED)
  [306.7, 'd_bigButton', {}],                              // "Travel agent, book me": he and his own thumb go for BOOK
  [310.06, 'phoneApp', { popup: 1 }],                      // "book me a tour": the pop-up book
  [313.6, 'd_ticketPrint', {}],                            // the tour prints like a receipt; cut on the tear
  [316.0, 'd_sDose', {}],                                  // the receipt as a prescription: relief vs distance, plateau at half
  [319.52, 'd_casePlane', {}],                             // "As long as I'm moving": high over the fields, hanging from the case
  [322.76, 'd_coatMap', {}],                               // "moving": the map he walks is his own coat
  [325.5, 'treadmill', {}],                                // "half the cure"
  [329.6, 'd_dolls', {}],                                  // instrumental: push into the nested cases
  [334.42, 'worldCage', { fy2: 500, z0: .92, z1: .98 }],   // "A bird in a cage" (pulled out so the bird on top is in frame)
  [336.78, 'd_crate', {}],                                 // "cage": the bird checked in as baggage; his hands bracket the carrier
  [339.8, 'd_ribCage', {}],                                // "doesn't": the cage is in his chest
  [343.98, 'd_sRib', {}],                                  // "sing": the chest drawn, SONG 0 DB
  [346.6, 'd_staveCage', {}],                              // the held note: staves as bars, notes pile up inside
  [349.34, 'd_wingFrame', {}],                             // "What good's a bird": wings pinned in a frame, the bird walks off down a ladder
  [351.68, 'd_coatWings', {}],                             // "a bird": coat as wings on the roof edge
  [354.6, 'd_birdSwap', {}],                               // "have its wings": the bird takes his hat and case; he is caged
  [358.4, 'd_featherFall', {}],                            // the feather falls through the bars, caught at 362.0
  [363.3, 'd_sFeather', {}],                               // the feather, drawn
];
