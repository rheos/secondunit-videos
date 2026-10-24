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
  stripes(C.paper, '#e6d8bc', 130, -.62, 0, C.tan); cam(900, 560, lerp(1, 1.07, eo(p)));
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
  d_fedora(hx - 20, hy - ry + 30, 11);
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
  for (let i = 0; i < 16; i++) { const bw = 70 + r() * 70, bh = 260 + r() * 420, x = -260 + i * 165 + r() * 30; if (Math.abs(x + bw / 2 - 960) < 330) continue; const b = PR(x, 980 - bh, bw, bh); fillP(b, '#4a3f38'); iBox(x, 980 - bh, bw, bh, C.ink, 2); const sc = PR(x + 7, 980 - bh + 12, bw - 14, bh - 30); fillP(sc, [C.sky, '#e9c58a', C.sage, C.rose][i % 4]); hatch(sc, x + bw / 2, 980 - bh / 2, bh, .7, 7, C.ink, .8, .35); for (let k = 0; k < 4; k++) iline(x + 12, 980 - bh + 30 + k * 40, x + bw - 14, 980 - bh + 30 + k * 40, C.ink, 1.2, .6, false); }
  const gd = PR(-600, 980, W + 1200, 600); fillP(gd, '#b7a988'); hatch(gd, 960, 1200, 1400, .1, 8, C.ink, .9, .4); iline(-600, 980, W + 600, 980, C.ink, 2.8);
  for (let i = 0; i < 10; i++) iline(-400 + i * 300, 980, -900 + i * 420, 1500, C.ink, 1.2, .4, false);
  phoneBody(960, 980 - 220 * 2.5, 2.5, 0, (w, h) => appScreen(w, h, T, 'cards'));
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
  lab(1320, 410, 'AGENT · FORM', C.lav, .8, 13); forms.forEach(([f2, k], i) => { const hot = i === 3; gc(1336, 452 + i * 52, 10, hot ? C.mag : C.lav, .9, 1.4); if (!hot) gl(1330, 452 + i * 52, 1342, 452 + i * 52, C.lav, .9, 1.4); lab(1366, 458 + i * 52, f2, hot ? C.mag : C.white, hot ? 1 : .6, 16, 'left', 'alphabetic', hot ? 'bold' : ''); });
  star(960, 120, 5, C.mag, .9); gc(960, 120, 30, C.mag, .6, 1.2, [3, 5]);
  screen(); schFrame('22', 'THE AGENT', 'FORM 4: APP');
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
  paperOnly('#f6f0df'); illDress(); cam(960, 540, lerp(1, 1.05, eo(p)));
  const top = PR(-200, -200, W + 400, 340); fillP(top, C.orange); hatch(top, 960, 0, 1200, .7, 9, C.ink, .9, .35); iline(-200, 140, W + 200, 140, C.ink, 3);
  lab(960, 100, 'TRAVEL AGENT', C.cream, 1, 64, 'center', 'alphabetic', 'bold');
  const F = [['FROM', 'HERE'], ['TO', 'ANYWHERE'], ['WHEN', 'NOW']];
  F.forEach(([k, v], i) => { const y = 200 + i * 128, b = PR(330, y, 1260, 96); fillP(b, C.cream); hatch(b, 960, y + 48, 700, .6, 8, C.ink, .7, .15); iBox(330, y, 1260, 96, C.ink, 2.4); lab(360, y + 60, k, C.ink, .55, 26); lab(620, y + 66, v, C.ink, .95, 48, 'left', 'alphabetic', 'bold'); });
  const press = p > .9 ? 1 : 0, by = 600 + press * 16, bb = PR(560, 610, 800, 230); fillP(bb, C.dark);
  const bt = PR(560, by - 10, 800, 230 - press * 6); fillP(bt, C.orange); shade(bt, 960, by + 100, 450, [0, -26], .2, 6); iBox(560, by - 10, 800, 230 - press * 6, C.ink, 3.4); lab(960, by + 148, 'BOOK', C.cream, 1, 130, 'center', 'alphabetic', 'bold');
  const bez = PR(-200, 960, W + 400, 300); fillP(bez, '#2b2420'); iline(-200, 960, W + 200, 960, C.ink, 3);
  // him: a run along the bezel, then the jump onto the button
  const run = seg(p, 0, .6), jmp = seg(p, .6, .9), hx = jmp > 0 ? lerp(760, 880, jmp) : lerp(150, 760, run);
  const hy = jmp > 0 ? lerp(960, by - 10, jmp) - Math.sin(jmp * Math.PI) * 260 : 960;
  traveller(hx, hy, .62, { look: 1, legs: jmp > 0 ? 1 : walkPh() * 1.6, mouth: sing(T), case: true, armL: jmp > 0 ? [2.6, .4] : [.15, -.2] });
  cloud(hx - 40, hy - 330, .32, { rain: true });
  if (jmp > 0) path(bzPts([760, 960], [790, 700], [860, 560], [880, by - 10], 0, jmp, 24), C.teal, 2.4, .8, [10, 8]);
  // his own thumb, from outside the screen
  const td = eo(seg(p, .3, .92)), tx = lerp(1820, 1240, td), ty = lerp(-260, by - 80, td);
  X.save(); X.translate(tx, ty); X.rotate(-.5);
  const cuff = PR(-90, -560, 180, 260); fillP(cuff, C.teal); shade(cuff, 0, -430, 160, [20, 0], .9, 5); iBox(-90, -560, 180, 260, C.ink, 3);
  const th = PE(0, -110, 92, 200); fillP(th, '#efd9b9'); shade(th, 0, -110, 200, [24, -10], .7, 6); iE(0, -110, 92, 200, 0, C.ink, 3.2);
  const nail = PE(0, 20, 48, 52); fillP(nail, '#f3e2c8'); iE(0, 20, 48, 52, 0, C.ink, 2.2); X.restore();
  if (press) { for (let i = 0; i < 4; i++) gc(960, by + 100, 300 + i * 70 + (p - .9) * 1400, C.orange, .9 - i * .2, 3); stampMark(1580, 860, 90, 'TOUR', C.brick, -.25, .95); }
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
  phoneBody(880, 620, .42, .12, (w, h) => appScreen(w, h, T, 'book'));
  cloud(700, 1040 - 600, .65, { rain: true }); noteRain(590, 490, 220, 180, 8);
  lab(1500, 860, 'TOUR · ' + Math.round(U * 14) + ' M', C.brick, .9, 18, 'left', 'alphabetic', 'bold');
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

// ---------- 329.6 instrumental: he opens his suitcase and a smaller him climbs out of it, who opens his ... ----------
SU.d_dolls = { mode: 'ill', f(q, p, a, T) {
  stripes(C.paper, '#e6d3c0', 130, -.62, 0, C.brick); cam(900, 600, lerp(1.04, 1, eo(p)));
  const fl = PR(-300, 1000, W + 600, 300); fillP(fl, '#c4ae84'); hatch(fl, 960, 1100, 1300, .1, 8, C.ink, .9, .4); iline(-300, 1000, W + 300, 1000, C.ink, 2.6);
  const n = 1 + Math.floor(eo(seg(p, 0, .92)) * 8), F = []; let x = 300, y = 1000, s = 1.5;
  for (let i = 0; i < 9; i++) { F.push([x, y, s]); const cx2 = x + 230 * s; x = cx2; y = y - 6 * s; s *= .58; }
  for (let i = n - 1; i >= 0; i--) {
    const [fx, fy, fs] = F[i], last = i === n - 1, rise = last && i > 0 ? eo(cl(((p * 8) % 1) * 2 + (n === 9 ? 1 : 0))) : 1;
    if (i < n - 1 || n === 9) d_openCase(fx + 230 * fs, fy, fs, 'lid');
    traveller(fx, fy + (1 - rise) * 200 * fs, fs, { look: 1, mouth: i === 0 ? sing(T) : 0, case: false, armR: i < n - 1 ? [1.0, .9] : [-.12, .25] });
    if (i > 0) d_openCase(fx, fy + 4 * fs, fs / .58, 'base');
    cloud(fx, fy - 450 * fs + (1 - rise) * 200 * fs, .5 * fs, { rain: true });
    if (i > 0) path(bzPts([F[i - 1][0] + 230 * F[i - 1][2], F[i - 1][1] - 150 * F[i - 1][2]], [fx, fy - 500 * fs], [fx, fy - 420 * fs], [fx, fy - 380 * fs], 0, 1, 16), C.orange, 2, .8, [8, 6]);
  }
  bracket(F[0][0] - 80, 1050, F[Math.min(n, 8)][0] + 40, 1050, C.brick, .7);
  consL([[0, 1000, W, 1000], [F[0][0], 0, F[0][0], H]]); consC([[F[2][0], 860, 300]]);
} };

// ---------- 336.78 post: the caged bird wears his hat, and his cloud rains on the cage ----------
POST.d_hatBird = (q, p, T) => { d_fedora(1018, 662, .72); cloud(960, 120, .6, { rain: true }); noteRain(860, 180, 200, 60, 6); };

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
  const base = PE(cx, by, rx + 40, 56); fillP(base, '#7a4a2a'); shade(base, cx, by, rx + 50, [0, -14], .3, 5); iE(cx, by, rx + 40, 56, 0, C.ink, 2.8);
  const r = M32(347), n = 14 + Math.floor(eo(p) * 46);
  for (let i = 0; i < n; i++) { const row = Math.floor(i / 9), x = cx - rx + 60 + (i % 9) * 78 + r() * 24 + row * 11, y = by - 24 - row * 30 - r() * 8; d_note(x, y, 1.6, i % 3 ? '#3f5f8f' : C.teal, r() - .5); }
  const fall = (T * .9) % 1; for (let i = 0; i < 6; i++) { const t2 = (fall + i / 6) % 1; d_note(cx - 200 + i * 80, lerp(by - ry - 40, by - 60 - Math.floor(n / 9) * 30, t2), 1.6, '#3f5f8f', .2); }
  for (let i = 0; i <= 8; i++) { const t = i / 8, xx = cx - rx + t * 2 * rx, top = by - ry + (1 - Math.sin(Math.PI * t)) * 300, pts = [[xx, by - 10]]; for (let k = 1; k <= 12; k++) { const v = k / 12; pts.push(v < .7 ? [xx, lerp(by - 10, top + 140, v / .7)] : bz([xx, top + 140], [xx, top], [xx, top], [cx + (xx - cx) * .1, by - ry], (v - .7) / .3)); } d_staffBar(pts, C.ink, 1.6, .95); }
  for (const yy of [by - 260, by - 540]) iE(cx, yy, rx, 34, 0, C.ink, 2.4, 1, false, 1, 0, Math.PI);
  X.beginPath(); X.moveTo(cx - rx + 20, by - 60); X.bezierCurveTo(cx - rx + 70, by - 160, cx - rx - 10, by - 200, cx - rx + 30, by - 250); X.bezierCurveTo(cx - rx + 70, by - 300, cx - rx + 80, by - 220, cx - rx + 20, by - 200); X.bezierCurveTo(cx - rx - 20, by - 180, cx - rx + 40, by - 120, cx - rx + 70, by - 150); stroke(C.ink, 4, 1);
  iline(cx, by - ry - 90, cx, by - ry, C.ink, 3); iE(cx, by - ry - 110, 24, 24, 0, C.ink, 3);
  suitcase(470, 935, 1); traveller(650, 1040, 1.2, { look: 1, mouth: Math.max(.6, sing(T)), case: false, armR: [1.3, .5] }); cloud(cx - 40, 120, .9, { rain: true }); noteRain(cx - 160, 180, 240, 60, 6);
  for (let i = 0; i < 5; i++) { const rr = 60 + i * 120 + ((FD * 8) % 120); gc(670, 700, rr, C.orange, .8 - i * .14, 2.2, null, -.5, .5); }
  consL([[0, by, W, by], [cx, 0, cx, H]]); consC([[cx, by - 400, rx + 160]]);
} };

// ---------- 351.68 "a bird": on a roof's edge he opens his long coat out like wings, and flaps, and stays ----------
SU.d_coatWings = { mode: 'ill', f(q, p, a, T) {
  stripes('#e9e4d0', '#cfe0da', 150, -.62, T * 40, C.teal); cam(960, 560, lerp(1.08, 1, eo(p)));
  const r = M32(352); for (let i = 0; i < 40; i++) { const bw = 20 + r() * 30, bh = 30 + r() * 90, x = -100 + i * 55; const b = PR(x, 1080 - bh, bw, bh); fillP(b, i % 3 ? '#4a3f38' : '#6b5a4c'); iBox(x, 1080 - bh, bw, bh, C.ink, 1.2); fillP(PR(x + 4, 1080 - bh + 4, bw - 8, bh * .5), [C.sky, '#e9c58a', C.sage][i % 3], .9); }
  for (let i = 0; i < 6; i++) { const t2 = (T * .3 + i / 6) % 1; bird(lerp(-100, W + 100, t2), 980 - (i % 3) * 30, .14, flap()); }
  const lg = PR(560, 880, 800, 70); fillP(lg, '#a8553a'); hatch(lg, 960, 915, 420, .1, 6, C.ink, .9, .5); iBox(560, 880, 800, 70, C.ink, 3); X.beginPath(); for (let x = 560; x < 1360; x += 50) { X.moveTo(x, 880); X.lineTo(x, 950); } stroke(C.ink, 1.2, .6);
  const wall = PR(600, 950, 720, 300); fillP(wall, '#8a4e2c'); hatch(wall, 960, 1050, 400, .1, 5, C.ink, .9, .55); iBox(600, 950, 720, 300, C.ink, 3);
  const hop = Math.sin(seg(p, .45, .65) * Math.PI) * 26, fx = 960, fy = 882 - hop, s = 1.3, fa = 1.57 + (flap() ? -.42 : .3);
  for (const sd of [-1, 1]) {
    const sh = [fx + sd * 30 * s, fy - 262 * s], el = [fx + sd * (30 + Math.sin(fa) * 70) * s, fy + (-262 + Math.cos(fa) * 70) * s], hd = [fx + sd * (30 + Math.sin(fa) * 136) * s, fy + (-262 + Math.cos(fa) * 136) * s];
    const wg = [sh, el, hd, [hd[0] - sd * 20 * s, hd[1] + 70 * s], [fx + sd * 120 * s, fy - 150 * s], [fx + sd * 50 * s, fy - 118 * s], [fx + sd * 34 * s, fy - 180 * s]], wp = PP(wg);
    fillP(wp, C.teal); X.save(); X.clip(wp); for (let row = 0; row < 7; row++) for (let k = 0; k < 9; k++) { const x = lerp(sh[0], hd[0], k / 8), y = lerp(sh[1], hd[1], k / 8) + 18 + row * 26 * s * .7; iE(x, y, 14, 12, 0, C.ink, 1.4, .8, false, .5, 0, Math.PI); } X.restore();
    shade(wp, (sh[0] + hd[0]) / 2, (sh[1] + hd[1]) / 2 + 60, 220, [0, -20], .9, 6); iP(dens(wg, 24, true), true, C.ink, 3);
  }
  traveller(fx, fy, s, { look: 0, mouth: sing(T), case: false, armR: [fa, 0], armL: [-fa, 0] });
  suitcase(fx + 250, 812, 1);
  cloud(fx, fy - 600, .7, { rain: true }); noteRain(fx - 110, fy - 540, 220, 120, 7);
  path(bzPts([fx, fy - 420], [fx + 300, fy - 700], [fx + 700, fy - 760], [fx + 900, fy - 880], 0, 1, 30), C.orange, 2.2, .7, [12, 10]); lab(fx + 760, fy - 700, '?', C.brick, 1, 60, 'center', 'middle', 'bold');
  for (let i = 0; i < 3; i++) gl(fx - 300 - i * 40, fy - 300 + i * 40, fx - 200 - i * 40, fy - 300 + i * 40, C.ink, .4, 2);
  consL([[0, 880, W, 880], [fx, 0, fx, H]]);
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
  const lift = eio(seg(p, .4, 1)), bx = lerp(600, -300, lift), byy = lerp(730, -260, lift), bs = 3, wing = lift > 0 ? flap() : 0;
  if (lift < .05) iline(500, 900, 760, 900, C.ink, 3);
  suitcase(bx + 90 * bs * .95, byy - 26 * bs, .9);
  bird(bx, byy, bs, wing); d_fedora(bx + 46 * bs, byy - 30 * bs - 18 * bs, .95);
  if (p > .45) { const t2 = seg(p, .45, 1); souvenir('feather', lerp(bx + 300, 760, t2 * .2), lerp(byy, 700, t2), 1.3); }
  for (let i = 0; i < 3; i++) gc(cx, by - 300, 200 + i * 50 + ((FD * 4) % 50), C.teal, .4, 1.6, [6, 8]);
  path(bzPts([680, 640], [540, 360], [300, 160], [-100, -100], 0, cl(lift * 1.5 + .1), 24), C.orange, 2.4, .85, [12, 9]);
  consL([[0, 900, W, 900], [cx, 0, cx, H]]); consC([[cx, by - 300, 420]]);
} };

// ---------- 358.4 one feather comes down through the bars; at 362.0 his hand closes on it ----------
SU.d_featherFall = { mode: 'ill', f(q, p, a, T) {
  stripes('#e9e4d0', '#d7e2d0', 150, -.62, 0, C.sage); cam(960, 540, lerp(1, 1.05, eo(p)));
  bird(lerp(1500, 1800, p), lerp(220, 120, p), .25, flap()); d_fedora(1500 + 300 * p + 12, lerp(220, 120, p) - 12, .25);
  const fs = 2.5, fx = 520, fy = 1560;
  traveller(fx, fy, fs, { look: 1, mouth: sing(T), case: false, armR: [2.15, .05] });
  const bars = [140, 400, 700, 1000, 1300, 1600, 1860];
  for (const x of bars) { const b = PR(x - 13, -100, 26, H + 200); fillP(b, '#5a3a22'); hatch(b, x, 540, 700, .2, 4, C.ink, .9, .6, [6, 0]); iline(x - 13, -100, x - 13, H + 100, C.ink, 2.4); iline(x + 13, -100, x + 13, H + 100, C.ink, 2.4); }
  iline(-100, 60, W + 100, 60, C.ink, 9); iline(-100, 1010, W + 100, 1010, C.ink, 9);
  const ap = arm(26, -262, 2.15, .05).map(([x, y]) => [fx + x * fs, fy + y * fs]); limb(ap, 13, {}, fs, '#3a7a76');
  const [hx, hy] = ap[2]; fillP(PE(hx + 10, hy, 26, 22), '#efd9b9'); hatch(PE(hx + 10, hy, 26, 22), hx + 10, hy, 30, .7, 4, C.ink, .8, .5, [6, -6]); iE(hx + 10, hy, 26, 22, 0, C.ink, 2.6);
  const tc = 362.0, caught = T >= tc, ft = cl((T - 358.4) / (tc - 358.4));
  const px = caught ? hx + 30 : lerp(1500, hx + 30, ft) + Math.sin(ft * 9) * 160 * (1 - ft), py = caught ? hy - 40 : lerp(-40, hy - 40, ft);
  souvenir('feather', px, py, 2.6);
  if (!caught) path(Array.from({ length: 24 }, (_, i) => { const t2 = ft * i / 23; return [lerp(1500, hx + 30, t2) + Math.sin(t2 * 9) * 160 * (1 - t2), lerp(-40, hy - 40, t2)]; }), C.teal, 1.6, .6, [6, 8]);
  else for (let i = 0; i < 4; i++) gc(hx + 30, hy - 40, 70 + i * 40 + (T - tc) * 120, C.orange, cl(.9 - i * .2 - (T - tc) * .3), 2.6);
  consL([[0, hy, W, hy], [hx, 0, hx, H]]);
} };

// ---------- 363.3 the feather, drawn: a wing's worth of lift in one quill ----------
SU.d_sFeather = { mode: 'sch', f(q, p, a, T) {
  schBG(); const u = cl((T - 363.3) / 2.2); cam(960, 540, lerp(1.08, 1, eo(u)));
  graticule(960, 540, 1700, 900, 50, C.lav, .05);
  const A = [420, 900], B = [760, 640], Cc = [1180, 380], D = [1520, 180], rc = bzPts(A, B, Cc, D, 0, 1, 80);
  path(rc, C.white, 2.4, .95);
  const nb = Math.floor(eo(cl(u * 1.4)) * 70);
  X.beginPath(); for (let i = 6; i < Math.min(76, 6 + nb); i++) { const [x, y] = rc[i], [x2, y2] = rc[i + 1], an = Math.atan2(y2 - y, x2 - x), L = 150 * Math.sin(Math.PI * (i - 6) / 72) + 10; for (const sd of [-1, 1]) { X.moveTo(x, y); X.quadraticCurveTo(x + Math.cos(an + sd * 1.2) * L * .5, y + Math.sin(an + sd * 1.2) * L * .5, x + Math.cos(an + sd * .7) * L, y + Math.sin(an + sd * .7) * L); } } stroke(C.lav, 1, .6);
  stip(PE(1000, 480, 360, 120, -.62), 1000, 480, 380, 2600 * cl(u * 1.4), C.cyan, .45, 1.3);
  star(D[0], D[1], 7, C.mag, 1); gc(D[0], D[1], 46, C.mag, .7, 1.4); ticks(D[0], D[1], 56, 36, 6, C.mag, .7);
  bracket(A[0] + 40, A[1] + 60, D[0] + 40, D[1] + 60, C.cyan, .8, 'RACHIS 31 CM', 4);
  gl(780, 420, 600, 300, C.lav, .7, 1); lab(590, 290, 'VANE', C.white, .9, 15, 'right');
  gl(470, 860, 330, 960, C.lav, .7, 1); lab(320, 980, 'CALAMUS', C.white, .9, 15, 'right');
  lab(1300, 760, 'LIFT ≈ 0.001 N', C.mag, .95, 18, 'left', 'alphabetic', 'bold'); lab(1300, 790, 'WINGS: 1 FEATHER OF 2400', C.lav, .8, 13);
  for (let i = 0; i < 4; i++) { const yy = 860 + i * 26; gl(1300, yy, 1300 + 260 * cl(u * 2 - i * .2), yy, C.lav, .5, 6); }
  screen(); schFrame('26', 'FEATHER', 'COLLECTED 362.0');
} };

// ---------- the cut list ----------
var CUTS_D = [
  [276.0, 'thinker', {}],                                  // "It took me so long": giant him, the clock over his head
  [277.5, 'sThinkFeel', {}],                               // the THINK bar, measured in years
  [278.3, 'd_headRooms', {}],                              // "so long to think": tiny hims on every floor of his head
  [280.34, 'seesaw', {}],                                  // "Didn't take me long at all to feel": the seesaw flips on 'feel' (283.8)
  [284.4, 'sSeesaw', {}],                                  // the balance, drawn
  [286.3, 'd_heartGiant', {}],                             // the heart is a hill he stands on; pull out
  [290.4, 'd_mirror', {}],                                 // his reflection scans into her, in his hat
  [293.72, 'phoneApp', { screen: 'cards' }],               // CHORUS 3 "Travel agent": she is the app now
  [297.0, 'd_appTower', {}],                               // the app is a tower; he is tiny at its foot
  [300.1, 'd_sApp', {}],                                   // "travel agent": the tower drawn, the agent's four forms
  [302.6, 'd_homeIcons', {}],                              // every icon his face, flipping to hers
  [306.7, 'd_bigButton', {}],                              // "Travel agent, book me": he and his own thumb go for BOOK
  [310.06, 'phoneApp', { popup: 1 }],                      // "book me a tour": the pop-up book
  [313.6, 'd_ticketPrint', {}],                            // the tour prints like a receipt; torn off at 316.0
  [319.52, 'suitcasePlane', {}],                           // "As long as I'm moving"
  [322.76, 'd_coatMap', {}],                               // "moving": the map he walks is his own coat
  [325.5, 'treadmill', {}],                                // "half the cure"
  [329.6, 'd_dolls', {}],                                  // instrumental: him inside his suitcase inside him...
  [334.42, 'worldCage', {}],                               // "A bird in a cage"
  [336.78, 'cage', {}, POST.d_hatBird],                    // "cage": the bird in his hat, under his cloud
  [339.8, 'd_ribCage', {}],                                // "doesn't": the cage is in his chest
  [343.98, 'sCage', {}],                                   // "sing": OUTPUT: SILENCE
  [346.6, 'd_staveCage', {}],                              // the held note: staves as bars, notes pile up inside
  [349.34, 'cage', { open: 1 }],                           // "What good's a bird": door open, wings clipped
  [351.68, 'd_coatWings', {}],                             // "a bird": coat as wings on the roof edge
  [354.6, 'd_birdSwap', {}],                               // "have its wings": the bird takes his hat and case; he is caged
  [358.4, 'd_featherFall', {}],                            // the feather falls through the bars, caught at 362.0
  [363.3, 'd_sFeather', {}],                               // the feather, drawn
];
