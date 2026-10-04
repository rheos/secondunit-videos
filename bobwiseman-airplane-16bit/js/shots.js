// Airplane on the Highway as a 16-bit racing game (SNES / Mega Drive, about 1991).
// Song 188.54 - 219.46 s: "I gotta know if it's true / they say there once were airplanes /
// that in the sky flew / I'm a" ... the refrain ... the breakdown ... "vroom vroom".
// He is still stuck on the highway (he only takes off at 3:33). Everyone passes him.
//
// THE PALETTE: 46 colours. Every pixel of every frame is one of these.
const PALDEF = [
  ['K', '#000000'], ['INK', '#0f0f23'], ['NAVY', '#1d2b53'], ['DBLUE', '#29366f'], ['BLUE', '#3b5dc9'], ['SKY', '#41a6f6'],
  ['CYAN', '#73eff7'], ['WHITE', '#f4f4f4'], ['PALE', '#c0cbdc'], ['LGREY', '#94b0c2'], ['GREY', '#566c86'], ['SLATE', '#333c57'],
  ['ROADA', '#4b4b5c'], ['ROADB', '#5a5a6e'], ['MTN', '#8b9bb4'], ['MTND', '#5a6988'], ['RED', '#e43b44'], ['DRED', '#a22633'],
  ['ORANGE', '#f77622'], ['AMBER', '#feae34'], ['YELLOW', '#fee761'], ['CREAM', '#fbf2dc'], ['CREAMD', '#d9c9a8'], ['LGREEN', '#a7f070'],
  ['GREEN', '#63c74d'], ['GRASSA', '#3d8a3f'], ['GRASSB', '#4e9e4b'], ['DGREEN', '#265c42'], ['DDGREEN', '#193c3e'], ['SKIN', '#e8b796'],
  ['SKIND', '#c28569'], ['BROWN', '#733e39'], ['DBROWN', '#3e2731'], ['TAN', '#b86f50'], ['SAND', '#ead4aa'], ['PINK', '#f6757a'],
  ['PEACH', '#e4a672'], ['PURPLE', '#68386c'], ['MAGENTA', '#b55088'], ['DEEP', '#124e89'], ['MBLUE', '#0099db'], ['TEAL', '#257179'],
  ['BLUSH', '#ff9bae'], ['HAZE', '#a9d8f0'], ['DPURP', '#3a2650'], ['LAV', '#c9a3d6'],
];
const PAL = PALDEF.map((p) => p[1]);
const C = {}; PALDEF.forEach(([n], i) => { C[n] = i; });
palInit();
const LY = window.LYR || { L1: [], L2: [], L3: [], V: '' };

// ---- song clock (all times are song seconds; must-land hits snapped to FEAT.vonsets) ----
const T0 = 4525 / 24, T1 = 5267 / 24;
const CUT = [T0, 192.37, 197.03, 201.50, 205.33, 210.23, 216.73, T1];
const W1 = [188.87, 189.80, 190.20, 190.93, 191.10, 191.50];   // I gotta know if it's true
const W2 = [192.60, 192.75, 193.00, 193.55, 194.05, 194.40];   // they say there once were airplanes
const W3 = [195.20, 195.55, 195.85, 196.00, 196.60];           // that in the sky flew
const HWY = 199.70;                                            // "...on the highway" (first refrain)
const YEAH = [209.34, 209.70, 210.00];
const VROOM = [217.83, 218.33];                                // two isolated bursts in the vocal stem
const LAND = 218.85;

const step = (t, n) => Math.floor(t * n);      // animation frame counter at n fps
const blink = (t, hz = 2) => step(t, hz * 2) % 2 === 0;
const since = (t, a) => t - a;
function typed(words, times, t, cps = 34) {
  let out = '';
  for (let i = 0; i < words.length; i++) {
    if (t < times[i]) break;
    const n = Math.min(words[i].length, Math.floor((t - times[i]) * cps) + 1);
    out += (i ? ' ' : '') + words[i].slice(0, n);
    if (n < words[i].length) break;
  }
  return out;
}
const talking = (words, times, t, cps = 34) => words.some((w, i) => t >= times[i] && t < times[i] + w.length / cps + .15);
function integ(fn, a, b, h = 1 / 96) { if (b <= a) return 0; let sum = 0; for (let x = a; x < b; x += h) sum += fn(Math.min(b, x + h / 2)) * Math.min(h, b - x); return sum; }

// ---- sprites (built once, pure) ----
const CAR_ROWS = [
  '....kkkkkkkkkkkk', '...kwwwwwwwwwwww', '..kwwcwwwwwwwwww', '..kwwwwwwwwwwwww', '.kbbbbbbbbbbbbbb', 'kbbbbbbbbbbbbbbb',
  'kbrrrbbbbbbbbbbb', 'krrrrbbbbbbbbbbb', 'kbrrrbbbbbbbyyyy', 'kddddddddddkyyyy', 'kdddddddddddkkkk', 'kggggggggggggggg',
  'kttttkkkkkkkkkkk', 'kttttk..........', '.kkkk...........',
];
const carMap = (b, d, r = C.RED) => ({ k: C.INK, w: C.NAVY, c: C.CYAN, b, d, r, y: C.YELLOW, g: C.LGREY, t: C.K });
const CARS = [carMap(C.BLUE, C.DBLUE), carMap(C.YELLOW, C.AMBER), carMap(C.GREEN, C.DGREEN), carMap(C.MAGENTA, C.PURPLE), carMap(C.RED, C.DRED, C.AMBER), carMap(C.PALE, C.LGREY)]
  .map((m) => sprite(CAR_ROWS, m, true));
const TRUCK = sprite([
  'kkkkkkkkkkkkkkkkkkkk', 'kaaaaaaaaaaaaaaaaaak', 'kaaaaaaaaaaaaaaaaaak', 'kbbbbbbbbbbbbbbbbbbk', 'kaaaaaaaaaaaaaaaaaak', 'kaaaaaaaaaaaaaaaaaak',
  'kaaaaaaaaaaaaaaaaaak', 'kbbbbbbbbbbbbbbbbbbk', 'kaaaaaaaaaaaaaaaaaak', 'kaaaaaaaaaaaaaaaaaak', 'kaaaaaaaaaaaaaaahaak', 'kbbbbbbbbbbbbbbbhbbk',
  'kaaaaaaaaaaaaaaahaak', 'kaaaaaaaaaaaaaaaaaak', 'kaaaaaaaaaaaaaaaaaak', 'kbbbbbbbbbbbbbbbbbbk', 'kaaaaaaaaaaaaaaaaaak', 'kaaaaaaaaaaaaaaaaaak',
  'kaaaaaaaaaaaaaaaaaak', 'kbbbbbbbbbbbbbbbbbbk', 'kaaaaaaaaaaaaaaaaaak', 'kaaaaaaaaaaaaaaaaaak', 'kkkkkkkkkkkkkkkkkkkk', 'kgggggggggggggggggggg',
  'krrrgggggggggggggyyyy', 'kgggggggggggggggggggg', '.kttttkmmm..........', '.kttttkmmm..........', '.kttttkmmm..........', '..kkkk..............',
], { k: C.INK, a: C.LGREY, b: C.PALE, h: C.GREY, g: C.SLATE, r: C.RED, y: C.YELLOW, t: C.K, m: C.INK }, true);
const PALM = offscreen(40, 56, () => {
  for (let j = 0; j < 40; j++) { const x = 20 + Math.round(Math.sin(j / 14) * 3); rect(x - 2, 55 - j, 5, 1, j % 4 < 2 ? C.BROWN : C.TAN); pset(x - 2, 55 - j, C.DBROWN); }
  const top = [20 + Math.round(Math.sin(39 / 14) * 3), 15];
  for (let f = 0; f < 7; f++) {
    const a = -Math.PI + f * Math.PI / 6 + .08, L = 15 + (f % 2) * 3;
    for (let k = 0; k < L; k++) {
      const u = k / L, x = top[0] + Math.cos(a) * k * 1.05, y = top[1] + Math.sin(a) * k * .6 + u * u * 9;
      rect(x, y + 1, 2, 1, C.DGREEN); rect(x, y, 2, 1, u < .7 ? C.GREEN : C.LGREEN);
    }
  }
  circ(top[0], top[1] + 1, 2, C.BROWN);
});
function signBoard(w, h, lines, col, txtCol, postH) {
  return offscreen(w, h + postH, () => {
    rect(6, h - 2, 3, postH + 2, C.GREY); rect(w - 9, h - 2, 3, postH + 2, C.GREY);
    rectO(1, 1, w - 2, h - 2, col); frame(2, 2, w - 4, h - 4, C.WHITE);
    lines.forEach((l, i) => txt(l, w / 2, 6 + i * 10, txtCol, { align: 'c' }));
  });
}
const SIGN_RUNWAY = signBoard(62, 26, ['RUNWAY', '999 KM'], C.DGREEN, C.WHITE, 14);
const PADLOCK = offscreen(14, 17, () => {
  for (let a = 0; a < 40; a++) { const x = 7 + Math.cos(Math.PI + a / 39 * Math.PI) * 4.5, y = 7 + Math.sin(Math.PI + a / 39 * Math.PI) * 5; rect(x - 1, y, 2, 1, C.INK); }
  for (let y = 7; y < 9; y++) { pset(2, y, C.INK); pset(11, y, C.INK); }
  rectO(1, 8, 12, 8, C.AMBER); rect(1, 8, 12, 2, C.YELLOW); rect(6, 10, 2, 3, C.INK); pset(6, 13, C.INK);
});
const GANTRY = offscreen(200, 64, () => {
  rect(4, 10, 6, 54, C.GREY); rect(190, 10, 6, 54, C.GREY); rect(5, 10, 1, 54, C.LGREY); rect(191, 10, 1, 54, C.LGREY);
  rectO(26, 2, 148, 30, C.DGREEN); frame(28, 4, 144, 26, C.WHITE);
  txt('PASSING LANE', 100 - 6, 8, C.YELLOW, { align: 'c' }); txt('LOCKED', 100 - 6, 19, C.YELLOW, { align: 'c' });
  blit(PADLOCK, 150, 8, { sc: 1 });
  rect(10, 14, 16, 3, C.SLATE); rect(174, 14, 16, 3, C.SLATE);
});
const BIRD = [sprite(['k.....k', '.k...k.', '..k.k..', '...k...'], { k: C.INK }), sprite(['.......', 'kk...kk', '..kkk..', '...k...'], { k: C.INK })];
const MINIPLANE = sprite([
  '..k.............', '..kk............', '..kwk...........', 'kkkwwwwwwwwwkk..', 'kwwwwwwwwwwwwwkk', '.kkkkkkwwkkkkkk.', '......kwwk......', '.......kk.......',
], { k: C.INK, w: C.WHITE });

// ---- scenery ----
function cloud(x, y, w, top = C.WHITE, under = C.PALE) {
  const r1 = Math.max(2, Math.round(w / 5)), r2 = Math.max(2, Math.round(w / 4)), r3 = Math.max(2, Math.round(w / 6));
  for (const [c, dy] of [[under, 2], [top, 0]]) {
    ell(x, y + dy, Math.round(w / 2), Math.max(2, Math.round(w / 7)), c);
    circ(x - w / 4, y - r1 / 2 + dy, r1, c); circ(x + w / 12, y - r2 * .8 + dy, r2, c); circ(x + w / 3, y - r3 / 2 + dy, r3, c);
  }
}
function cloudsLayer(scroll, y0, y1, n, seed, span = 480) {
  for (let i = 0; i < n; i++) {
    const x = ((hash(i * 31 + seed) * span - scroll) % span + span) % span - 80;
    cloud(x, y0 + hash(i * 17 + seed) * (y1 - y0), 26 + hash(i * 5 + seed) * 34);
  }
}
function mountains(baseY, scroll, seed, col, colD, snow, amp, spacing = 48) {
  for (let x = 0; x < PW; x++) {
    const wx = x + Math.round(scroll); let h = 0, pk = 0, pkx = 0;
    for (let k = Math.floor(wx / spacing) - 2; k <= Math.floor(wx / spacing) + 2; k++) {
      const px = k * spacing + hash(k * 13 + seed * 1000 + 7) * spacing * .6, ph = amp * (.45 + .55 * hash(k * 7 + seed * 1000 + 3));
      const hh = ph - Math.abs(wx - px) * .85; if (hh > h) { h = hh; pk = ph; pkx = px; }
    }
    if (h <= 0) continue;
    const top = Math.round(baseY - h);
    for (let y = top; y < baseY; y++) pset(x, y, snow && pk > amp * .72 && y - top < 3 + (wx % 3 === 0) ? C.WHITE : (wx > pkx ? colD : col));
  }
}
function skyline(baseY, scroll, seed, n = 40) {
  let x = -((Math.round(scroll) % 600) + 600) % 600, k = Math.floor(Math.round(scroll) / 600) * 97;
  while (x < PW) {
    const w = 10 + Math.floor(hash(k * 3 + seed) * 16), h = 12 + Math.floor(hash(k * 5 + seed) * 28), col = hash(k + seed) > .5 ? C.SLATE : C.GREY;
    rect(x, baseY - h, w, h, col);
    for (let wy = baseY - h + 3; wy < baseY - 2; wy += 4) for (let wxx = x + 2; wxx < x + w - 2; wxx += 3) if (hash(k * 131 + wy * 7 + wxx) > .55) pset(wxx, wy, C.YELLOW);
    x += w + Math.floor(hash(k * 11 + seed) * 4); k++;
  }
}

// ---- the plane ----
// Behind view: stubby prop airliner on car tyres, wings level and far too wide for the lane.
function planeBack(cx, gy, o = {}) {
  cx = Math.round(cx); const lift = o.lift || 0, by = gy - lift, fy = by - 22, pf = o.pf || 0, bank = o.bank || 0;
  ell(cx, gy + 1, 30, 3, TR, C.INK, .5);                                          // dithered shadow stays on the road
  for (const sd of [-1, 1]) {                                                     // rear tyres
    rectO(cx + sd * 14 - 4, by - 9, 8, 9, C.K, C.INK);
    for (let j = 0; j < 9; j++) if ((j + (o.wf || 0)) % 3 === 0) rect(cx + sd * 14 - 4, by - 9 + j, 8, 1, C.SLATE);
  }
  rect(cx - 10, by - 8, 20, 2, C.INK);
  for (const sd of [-1, 1]) {                                                     // wings
    const tipY = fy + 5 - Math.round(bank * sd * 3), rx = cx + sd * 8, tx = cx + sd * 64;
    polyO([[rx, fy + 2], [tx, tipY - 1], [tx, tipY + 2], [rx, fy + 8]], C.CREAM);
    line(rx, fy + 7, tx, tipY + 1, C.CREAMD);
    rect(tx - (sd > 0 ? 2 : 0), tipY - 1, 2, 3, sd < 0 ? C.RED : C.GREEN);
    if (blink(o.t || 0, 1)) pset(tx + sd, tipY, C.WHITE);
    const ex = cx + sd * 32, ey = fy + 5 - Math.round(bank * sd * 1.5);          // engine + propeller
    ell(ex, ey, 11, 11, TR, C.PALE, .18);
    const a = pf * Math.PI / 4 + (sd > 0 ? 0 : Math.PI / 8);
    line(ex - Math.cos(a) * 10, ey - Math.sin(a) * 10, ex + Math.cos(a) * 10, ey + Math.sin(a) * 10, C.SLATE, 2);
    circO(ex, ey, 5, C.LGREY); circ(ex + 1, ey + 1, 4, C.GREY); circ(ex, ey, 2, C.INK);
    if (o.flame) { const fl = step(o.t, 24) % 2; circ(ex, ey, 3 + fl, C.ORANGE); circ(ex, ey, 1 + fl, C.YELLOW); }
  }
  polyO([[cx - 22, fy - 9], [cx + 22, fy - 9], [cx + 20, fy - 6], [cx - 20, fy - 6]], C.CREAM);  // tailplane
  polyO([[cx - 3, fy - 8], [cx + 3, fy - 8], [cx + 1, fy - 30], [cx - 1, fy - 30]], C.RED);       // fin
  rect(cx - 2, fy - 22, 4, 2, C.WHITE);
  circO(cx, fy, 12, C.CREAM); circ(cx + 1, fy + 1, 11, C.CREAMD); circ(cx - 1, fy - 1, 10, C.CREAM);
  for (let j = 1; j <= 2; j++) { const w = Math.floor(Math.sqrt(12.5 * 12.5 - j * j)); hline(cx - w, cx + w, fy + j, C.RED); }
  circ(cx, fy - 2, 5, C.PALE); circ(cx, fy - 2, 3, C.LGREY); pset(cx - 1, fy - 3, C.WHITE);
  rect(cx - 10, fy + 6, 4, 2, C.RED); rect(cx + 6, fy + 6, 4, 2, C.RED);       // car tail lights
  if (o.brake) { rect(cx - 10, fy + 6, 4, 2, C.PINK); rect(cx + 6, fy + 6, 4, 2, C.PINK); }
  if (o.glance) {                                                                 // peeks back over his shoulder
    const ex = cx + o.glance * 11, ey = fy - 6;
    ellO(ex, ey, 3, 4, C.WHITE); rect(ex - o.glance - 1, ey - 1, 2, 3, C.INK); pset(ex - o.glance, ey - 2, C.WHITE);
  }
}
// Side view, facing right, x = tail end. Big eyes in the windscreen.
function planeSide(x, gy, o = {}) {
  x = Math.round(x); const by = gy - (o.lift || 0), sq = o.squish || 0, yT = by - 31 + sq, yB = by - 12, mid = Math.round((yT + yB) / 2), pf = o.pf || 0;
  if (o.shadow !== false) ell(x + 42, gy + 1, 34, 2, TR, C.INK, .5);
  polyO([[x, yT + 3], [x + 16, yT + 3], [x + 18, yT + 6], [x + 2, yT + 6]], C.CREAMD);
  polyO([[x + 2, yT + 1], [x + 5, yT - 15], [x + 13, yT - 15], [x + 24, yT + 1]], C.RED); rect(x + 6, yT - 9, 8, 2, C.WHITE);
  polyO([[x + 16, yT], [x + 16, yB], [x + 6, yT + 7], [x + 2, yT + 1]], C.CREAM);
  rectO(x + 15, yT, 56, yB - yT, C.CREAM);
  circO(x + 70, mid, Math.round((yB - yT) / 2), C.CREAM);
  rect(x + 15, yT, 56, yB - yT, C.CREAM); circ(x + 70, mid, Math.round((yB - yT) / 2), C.CREAM); poly([[x + 16, yT], [x + 16, yB], [x + 6, yT + 7], [x + 3, yT + 1]], C.CREAM);
  rect(x + 8, yB - 3, 64, 2, C.CREAMD);
  rect(x + 8, mid + 2, 70, 2, C.RED);
  for (let i = 0; i < 6; i++) { rect(x + 22 + i * 6, yT + 4, 3, 3, C.NAVY); pset(x + 22 + i * 6, yT + 4, C.CYAN); }
  // eyes
  const ex = x + 67, ey = yT + 6;
  if (o.blinkEye) { rect(ex - 3, ey + 1, 7, 1, C.INK); rect(ex + 6, ey + 1, 3, 1, C.INK); }
  else {
    ellO(ex, ey, 3, 4, C.WHITE); ellO(ex + 7, ey, 2, 4, C.WHITE);
    const lk = o.look || 'fwd', [px, py] = lk === 'up' ? [1, -2] : lk === 'back' ? [-2, 0] : lk === 'down' ? [1, 2] : [1, 0];
    rect(ex + px - 1, ey + py - 1, 2, 3, C.INK); rect(ex + 7 + px - 1, ey + py - 1, 2, 3, C.INK);
    if (o.sparkle) { pset(ex + px - 1, ey + py - 1, C.YELLOW); pset(ex + 7 + px - 1, ey + py - 1, C.YELLOW); pset(ex - 3, ey - 4, C.YELLOW); pset(ex + 10, ey - 5, C.YELLOW); }
    else { pset(ex + px - 1, ey + py - 1, C.WHITE); pset(ex + 7 + px - 1, ey + py - 1, C.WHITE); }
  }
  pset(ex - 1, ey + 6, C.BLUSH); pset(ex, ey + 6, C.BLUSH); pset(ex + 8, ey + 6, C.BLUSH);
  rect(ex + 3, yB - 5, 3, 1, C.INK); pset(ex + 2, yB - 6, C.INK); pset(ex + 6, yB - 6, C.INK);  // smile
  // wing + engine
  ellO(x + 42, yB - 4, 15, 1, C.CREAMD);
  rectO(x + 42, yB - 3, 12, 4, C.LGREY); rect(x + 42, yB - 3, 12, 1, C.PALE);
  const bl = [5, 3, 1, 3][pf % 4]; rect(x + 55, yB - 1 - bl, 1, bl * 2 + 1, C.SLATE);
  // nose propeller
  polyO([[x + 79, mid - 3], [x + 84, mid], [x + 79, mid + 3]], C.LGREY);
  rectD(x + 81, mid - 11, 2, 23, TR, C.PALE, .25);
  const L = [11, 7, 2, 7][pf % 4]; rect(x + 81, mid - L, 2, L * 2 + 1, C.SLATE);
  // car tyres
  for (const wx of [x + 24, x + 60]) {
    circO(wx, by - 6, 5, C.K, C.INK); circ(wx, by - 6, 2, C.LGREY);
    const a = (o.wf || 0) * Math.PI / 2; pset(wx + Math.round(Math.cos(a) * 4), by - 6 + Math.round(Math.sin(a) * 4), C.GREY);
  }
}
// Front-view portrait for dialogue boxes
function planeFace(x, y, sz, o = {}) {
  rectD(x, y, sz, sz, C.SKY, C.HAZE, .3);
  const cx = x + sz / 2, cy = y + sz / 2 + 2;
  rectO(x + 1, cy, sz - 2, 4, C.CREAMD);
  circO(cx, cy, Math.round(sz * .36), C.CREAM);
  const er = Math.round(sz * .1), ex = Math.round(sz * .17);
  for (const sd of [-1, 1]) {
    ellO(cx + sd * ex, cy - 3, er, er + 1, C.WHITE);
    const [px, py] = o.look === 'up' ? [0, -2] : [-sd, 0];
    rect(cx + sd * ex + px - 1, cy - 3 + py - 1, 3, 3, C.INK); pset(cx + sd * ex + px - 1, cy - 4 + py, o.sparkle ? C.YELLOW : C.WHITE);
    pset(cx + sd * (ex + 2), cy + 3, C.BLUSH);
  }
  if (o.talk) rect(cx - 2, cy + 3, 5, 2, C.DRED); else rect(cx - 2, cy + 4, 5, 1, C.INK);
  circO(cx, cy + 9, 2, C.LGREY);
  const a = (o.pf || 0) * Math.PI / 4; line(cx - Math.cos(a) * 9, cy + 9 - Math.sin(a) * 3, cx + Math.cos(a) * 9, cy + 9 + Math.sin(a) * 3, C.SLATE);
  frame(x, y, sz, sz, C.WHITE);
}
function truckerFace(x, y, sz, o = {}) {
  rectD(x, y, sz, sz, C.PEACH, C.AMBER, .25);
  const cx = x + sz / 2, cy = y + sz / 2 + 2;
  rectD(x + 4, y + sz - 9, sz - 8, 9, C.RED, C.DRED, .5); rect(x + 10, y + sz - 9, 2, 9, C.BLUE); rect(x + sz - 12, y + sz - 9, 2, 9, C.BLUE);
  ellO(cx, cy, 10, 12, C.SKIN);
  ellO(cx, cy + 7, 9, 7, C.PALE); ell(cx, cy + 9, 7, 4, C.LGREY);
  rect(cx - 6, cy - 5, 4, 1, C.PALE); rect(cx + 3, cy - 5, 4, 1, C.PALE);
  rect(cx - 5, cy - 3, 3, 1, C.INK); rect(cx + 3, cy - 3, 3, 1, C.INK);
  rect(cx - 1, cy - 2, 2, 4, C.SKIND);
  if (o.talk) rectO(cx - 2, cy + 5, 5, 2, C.DRED); else rect(cx - 3, cy + 5, 7, 1, C.INK);
  polyO([[cx - 11, cy - 7], [cx - 9, cy - 15], [cx, cy - 18], [cx + 9, cy - 15], [cx + 11, cy - 7]], C.RED);
  rect(cx - 4, cy - 15, 8, 6, C.WHITE); txt('?', cx - 2, cy - 15, C.RED);
  rectO(cx - 13, cy - 8, 26, 2, C.DRED);
  frame(x, y, sz, sz, C.WHITE);
}
function truckerBody(x, fy, o = {}) {
  rect(x - 4, fy - 10, 3, 9, C.DBLUE); rect(x + 1, fy - 10, 3, 9, C.DBLUE); rect(x - 5, fy - 2, 4, 2, C.DBROWN); rect(x + 1, fy - 2, 4, 2, C.DBROWN);
  rectO(x - 5, fy - 22, 10, 12, C.RED); rectD(x - 5, fy - 22, 10, 12, C.RED, C.DRED, .3); rect(x - 4, fy - 22, 1, 12, C.BLUE); rect(x + 3, fy - 22, 1, 12, C.BLUE);
  if (o.wave) { line(x + 5, fy - 21, x + 9, fy - 27 - (o.wf % 2), C.RED, 2); rect(x + 8, fy - 30 - (o.wf % 2), 3, 3, C.SKIN); }
  else { rect(x + 5, fy - 21, 2, 8, C.RED); rect(x + 5, fy - 13, 2, 2, C.SKIN); }
  circO(x, fy - 27, 4, C.SKIN); ell(x + 1, fy - 24, 3, 2, C.PALE); pset(x + 2, fy - 28, C.INK);
  rect(x - 5, fy - 33, 9, 3, C.RED); rect(x + 1, fy - 31, 6, 1, C.DRED);
}

// ---- UI kit ----
function box(x, y, w, h, o = {}) {
  rect(x, y, w, h, C.INK);
  vgradD(y + 2, y + h - 2, o.cols || [C.BLUE, C.DBLUE, C.NAVY], x + 2, x + w - 3);
  frame(x + 1, y + 1, w - 2, h - 2, C.WHITE); frame(x + 3, y + 3, w - 6, h - 6, C.LGREY);
  for (const [px, py] of [[x, y], [x + w - 1, y], [x, y + h - 1], [x + w - 1, y + h - 1]]) pset(px, py, o.bg ?? C.K);
}
function aButton(x, y, pressed) {
  circO(x, y + 1, 6, C.DRED); circ(x, y + (pressed ? 1 : 0), 6, pressed ? C.DRED : C.RED);
  if (!pressed) { pset(x - 3, y - 3, C.PINK); pset(x - 2, y - 4, C.PINK); }
  txt('A', x - 2, y - 3 + (pressed ? 1 : 0), C.WHITE);
}
function songClock(t) { const m = Math.floor(t / 60), ss = Math.floor(t % 60), cc = Math.floor(t * 100) % 100; return `${m}'${String(ss).padStart(2, '0')}"${String(cc).padStart(2, '0')}`; }
function hudRace(t, o) {
  txt('TIME', 8, 6, C.YELLOW, { o: C.INK }); txt(songClock(t), 8, 16, C.WHITE, { o: C.INK });
  txt('POS', 312, 6, C.YELLOW, { o: C.INK, align: 'r' });
  const pc = o.posFlash && blink(t, 6) ? C.RED : C.WHITE; txt(o.pos || '9/9', 312, 16, pc, { o: C.INK, sc: 2, align: 'r' });
  const sp = String(Math.round(o.speed)).padStart(3, '0');
  txt(sp, 291, 146, o.speed > 500 && blink(t, 6) ? C.RED : C.WHITE, { o: C.INK, sc: 2, align: 'r' });
  txt('KM/H', 294, 153, C.YELLOW, { o: C.INK });
  const n = 14, f = Math.round(clamp(o.speedFrac) * n);
  for (let i = 0; i < n; i++) { const c = i < 8 ? C.GREEN : i < 11 ? C.YELLOW : C.RED; rectO(232 + i * 6, 167, 5, 6, i < f ? c : C.SLATE); }
  txt(o.turboLabel || 'TURBO', 8, 152, o.turboFlash && blink(t, 4) ? C.RED : C.CYAN, { o: C.INK });
  const tf = Math.round(clamp(o.turbo ?? 0) * 8);
  for (let i = 0; i < 8; i++) rectO(8 + i * 7, 164, 6, 6, i < tf ? (o.turboFlash && blink(t, 8) ? C.WHITE : C.CYAN) : C.SLATE);
  if (o.msg && (o.msgSteady || blink(t, 1.5))) {
    const w = txtW(o.msg) + 16; rectO(160 - w / 2, 3, w, 12, C.DRED); blit(PADLOCK, 160 - w / 2 + 2, 0, { sc: .8 }); txt(o.msg, 160 - w / 2 + 13, 6, C.YELLOW);
  }
}

// ---- pseudo-3D road ----
const ZC = 300, SEG = .9;
function road(o) {
  const hy = o.hy, D = PH - 1 - hy;
  const cxAt = (d) => PW / 2 + o.curve * (1 - d / D) ** 2 * 80 - (o.px || 0) * d / D;
  for (let y = hy + 1; y < PH; y++) {
    const d = y - hy, sc = d / D, wz = o.camZ + ZC / d, cx = cxAt(d), hw = o.rw * sc, rum = Math.max(1, hw * .1);
    const st = Math.floor(wz / SEG) & 1, bl = o.blur > .5;
    const row = (x0, x1, a, b) => bl ? hlineD(x0, x1, y, a, b, .5) : hline(x0, x1, y, st ? a : b);
    row(0, PW - 1, C.GRASSA, C.GRASSB);
    row(cx - hw - rum, cx - hw, C.RED, C.WHITE); row(cx + hw, cx + hw + rum, C.RED, C.WHITE);
    row(cx - hw, cx + hw, C.ROADA, C.ROADB);
    const lw = Math.max(1, Math.round(hw * .022));
    for (const k of [-1 / 3, 1 / 3]) {
      const lx = cx + k * hw;
      if (bl) hlineD(lx - lw / 2, lx + lw / 2, y, TR, C.PALE, .5); else if (st) hline(lx - lw / 2, lx + lw / 2, y, C.WHITE);
    }
    const fog = clamp(1 - d / 16); if (fog > 0) hlineD(0, PW - 1, y, TR, C.HAZE, fog * .9);
  }
  return { hy, D, cxAt, proj(X, zr) { if (zr < .6) return null; const d = ZC / zr; return { x: cxAt(d) + X * d / D, y: hy + d, sc: d / D }; } };
}
// one behind-view race frame. o: camZ, curve, hy, bgX, cars, objs, plane, blur
const LANE = 80, RW = 120;
function race(t, o) {
  const hy = o.hy;
  vgradD(0, hy + 1, o.sky || [C.DBLUE, C.BLUE, C.SKY, C.HAZE]);
  cloudsLayer(o.bgX * .2, 8, hy - 30, 6, 1);
  mountains(hy + 1, o.bgX * .45, 3, C.MTN, C.MTND, true, 36);
  skyline(hy + 1, o.bgX * .6, 5);
  mountains(hy + 1, o.bgX * .8, 9, C.DGREEN, C.DDGREEN, false, 10, 30);
  const rd = road({ hy, camZ: o.camZ, curve: o.curve, rw: RW, blur: o.blur });
  const list = [];
  for (let k = Math.floor(o.camZ / 5); k < Math.floor(o.camZ / 5) + 16; k++) {
    const zr = k * 5 - o.camZ; if (zr < .9) continue;
    list.push({ zr, f: (p) => blit(PALM, p.x, p.y, { sc: p.sc * 1.5, ax: .5, ay: 1, flip: k % 2 === 0 }), X: (k % 2 ? -1 : 1) * (RW + 50 + (k % 3) * 8) });
  }
  for (const ob of o.objs || []) { const zr = ob.z - o.camZ; if (zr > .9 && zr < 90) list.push({ zr, X: ob.X, f: (p) => { let k = p.sc * (ob.sc || 1); if (ob.snap && k > .55) k = Math.max(1, Math.round(k)); blit(ob.spr, p.x, p.y, { sc: k, ax: .5, ay: 1 }); } }); }
  for (const c of o.cars || []) {
    if (t < c.t0) continue; const zr = c.zr0 + c.v * (t - c.t0) - (c.minus ? c.minus(t) : 0); if (zr > 95) continue;
    const X = c.lane2 !== undefined ? lerp(c.lane * LANE, c.lane2 * LANE, smooth(inv(c.zA, c.zB, zr))) : c.lane * LANE;
    const spr = c.truck ? TRUCK : CARS[c.kind % CARS.length];
    list.push({ zr, X, f: (p) => blit(spr, p.x, p.y, { sc: p.sc * (c.truck ? 2.4 : 1.9), ax: .5, ay: 1 }) });
  }
  list.sort((a, b) => b.zr - a.zr);
  for (const it of list) { const p = rd.proj(it.X, it.zr); if (p && p.y > hy) it.f(p); }
  if (o.lines) speedLines(t, hy, o.lines);
  planeBack(160 + (o.planeDX || 0), 172, { t, pf: step(t, 24) % 8, wf: step(t, 16) % 3, ...o.plane });
  return rd;
}
function speedLines(t, hy, k) {
  for (let i = 0; i < 46; i++) {
    const a = hash(i * 97 + 5) * TAU, sp = 140 + hash(i * 3) * 160, base = 24 + ((hash(i * 13) * 200 + t * sp * 3) % 200);
    const len = 8 + 22 * k, ca = Math.cos(a), sa = Math.sin(a) * .62;
    if (hash(i * 7 + step(t, 12)) > .75 + .2 * (1 - k)) continue;
    line(160 + ca * base, hy + 12 + sa * base, 160 + ca * (base + len), hy + 12 + sa * (base + len), i % 3 ? C.WHITE : C.PALE);
  }
}
const camZ0 = (t) => 20 * t;
const curveBg = (curveFn, a, t) => integ(curveFn, a, t, 1 / 48) * 60;

// ============ SHOT 1: race, behind view. "I gotta know if it's true" ============
const S1_CARS = [{ t0: 188.20, lane: -1, kind: 0, v: 6, zr0: 2.2 }, { t0: 189.40, lane: 1, kind: 1, v: 7, zr0: 2.2 }, { t0: 190.80, lane: -1, kind: 3, v: 5.5, zr0: 2.2 }];
const S1_CURVE = (t) => kf(t, [[T0, 0], [190.0, .15], [192.37, .7]]);
const PLANEZ = (hy) => ZC / (172 - hy);
function posFrom(cars, t, hy, start) {
  let n = 0, last = -9; for (const c of cars) { const tp = c.t0 + (PLANEZ(hy) + .4 - c.zr0) / c.v; if (t >= tp) { n++; last = Math.max(last, tp); } }
  return { pos: `${Math.min(9, start + n)}/9`, flash: t - last < .6 };
}
function s1_race(t) {
  const hy = 74, cv = S1_CURVE(t);
  race(t, {
    hy, camZ: camZ0(t), curve: cv, bgX: curveBg(S1_CURVE, T0, t), cars: S1_CARS,
    objs: [{ z: 20 * 191.6 + 3, X: RW + 40, spr: SIGN_RUNWAY, sc: 1.6 }],
    plane: { bank: cv * .5, glance: t > 191.5 ? 1 : 0 },
  });
  const p = posFrom(S1_CARS, t, hy, 6);
  hudRace(t, { pos: p.pos, posFlash: p.flash, speed: 88 + Math.round(snoise(t * 2, 3) * 2), speedFrac: .42, turbo: 0, msg: 'PASSING LANE: LOCKED' });
  // his line, as a speech box with his portrait
  const str = typed(LY.L1, W1, t);
  if (t > 188.7) {
    box(46, 34, 228, 30, { bg: C.SKY });
    planeFace(50, 37, 24, { talk: talking(LY.L1, W1, t) && step(t, 8) % 2 === 0, pf: step(t, 24) });
    txt(str, 80, 42, C.WHITE, { sh: C.INK });
  }
  if (t > W1[5] + .1) { const b = Math.round(Math.sin((t - W1[5]) * 9) * 1.5); txt('?', 172, 100 + b, C.YELLOW, { o: C.INK, sc: 2 }); }
}

// ============ SHOT 2: dialogue screen at a sunset rest stop. "they say there once were airplanes / that in the sky flew" ============
function s2_dialog(t) {
  vgradD(0, 86, [C.DPURP, C.PURPLE, C.MAGENTA, C.PINK, C.AMBER]);
  const sy = 84; circ(232, sy, 24, C.YELLOW); for (let y = sy - 24; y <= sy; y++) if (y > sy - 14 && (y % 4 === 0 || (y > sy - 6 && y % 2 === 0))) hline(200, 264, y, C.PINK);
  mountains(88, 40, 21, C.PURPLE, C.DPURP, false, 26, 40);
  mountains(90, 0, 23, C.DPURP, C.DPURP, false, 12, 26);
  rect(0, 88, PW, 30, C.SAND); rectD(0, 88, PW, 6, C.SAND, C.TAN, .3);
  rect(0, 102, PW, 14, C.ROADA); for (let x = (-step(t, 1) * 0) % 24; x < PW; x += 24) rect(x, 108, 12, 2, C.YELLOW); rect(0, 102, PW, 1, C.WHITE);
  rectD(0, 116, PW, 4, C.SAND, C.TAN, .5);
  // parked rig
  rectO(6, 54, 78, 38, C.LGREY); for (let x = 12; x < 84; x += 8) rect(x, 55, 1, 36, C.PALE); txt('HAUL', 45, 66, C.DRED, { align: 'c' });
  rect(6, 92, 106, 3, C.SLATE);
  rectO(86, 64, 26, 28, C.RED); rect(100, 67, 10, 9, C.CYAN); pset(101, 68, C.WHITE); rect(111, 80, 3, 10, C.LGREY); rect(88, 56, 2, 8, C.GREY);
  for (const wx of [18, 32, 72, 102]) { circO(wx, 96, 5, C.K, C.INK); circ(wx, 96, 2, C.LGREY); }
  const talk = talking(LY.L2, W2, t) || talking(LY.L3, W3, t);
  truckerBody(134, 104, { wave: talk, wf: step(t, 6) });
  // the plane, parked facing the trucker
  const look = t > W3[3] ? 'up' : 'back';
  const pl = offscreen(96, 60, () => planeSide(4, 56, { pf: step(t, 24), look: 'fwd', sparkle: t > W3[3], blinkEye: step(t, 24) % 60 === 7 }));
  blit(pl, 162, 48, { flip: true });
  if (t > W2[5]) {                                          // thought bubble: planes that flew
    const k = t - W2[5], pop = k < .08 ? .6 : 1, bx = 214, by = 26;
    circO(206, 50, 2, C.WHITE); circO(212, 43, 3, C.WHITE);
    const rx = Math.round(46 * pop), ry = Math.round(18 * pop);
    ellO(bx + 10, by, rx, ry, C.WHITE); for (const [dx, dy, r] of [[-30, -8, 10], [-8, -14, 12], [18, -12, 11], [40, -4, 9], [32, 10, 9], [-26, 10, 9]]) circO(bx + 10 + dx * pop, by + dy * pop, Math.round(r * pop), C.WHITE);
    ell(bx + 10, by, rx, ry, C.WHITE); for (const [dx, dy, r] of [[-30, -8, 10], [-8, -14, 12], [18, -12, 11], [40, -4, 9], [32, 10, 9], [-26, 10, 9]]) circ(bx + 10 + dx * pop, by + dy * pop, Math.round(r * pop), C.WHITE);
    if (k > .08) {
      ell(bx + 10, by, 40, 14, C.SKY, C.HAZE, .25); cloud(bx - 6, by + 6, 18); cloud(bx + 30, by - 4, 14);
      const px = bx - 30 + ((k * 34) % 76), py = by - 2 + Math.round(Math.sin(k * 4) * 3);
      for (let i = 1; i < 6; i++) hlineD(px - i * 4 - 4, px - i * 4, py + 4, TR, C.WHITE, .7 - i * .1);
      blit(MINIPLANE, px, py);
      blit(BIRD[step(t, 6) % 2], bx + 22 + Math.round(Math.sin(k * 2) * 6), by + 3);
    }
  }
  if (t > W3[3]) { const b = Math.round(Math.sin((t - W3[3]) * 10) * 1); txt('!', 228, 46 + b, C.YELLOW, { o: C.INK, sc: 2 }); }
  // dialogue box
  box(4, 120, 312, 57);
  rectO(60, 113, 74, 11, C.NAVY); txt('OLD TRUCKER', 63, 115, C.YELLOW);
  truckerFace(11, 127, 44, { talk: talk && step(t, 8) % 2 === 0 });
  const l1 = typed(LY.L2, W2, t), l2 = typed(LY.L3, W3, t);
  txt(l1 + (t > W2[5] && t < W3[0] ? '...' .slice(0, Math.min(3, Math.floor((t - W2[5]) * 8))) : ''), 64, 133, C.WHITE, { sh: C.INK });
  txt(l2, 64, 149, C.WHITE, { sh: C.INK });
  if (t > W3[4] + .25 && blink(t, 2)) txt('^', 300, 164, C.WHITE);
}

// ============ SHOT 3: side-scroller. first "airplane on the highway". JUMP does nothing ============
const S3_CAMX = (t) => 70 * (t - CUT[2]);
const QBLOCK_X = 138 + 70 * (HWY - CUT[2]);
const PRESS = [HWY, 200.40];
function s3_side(t) {
  const cx = S3_CAMX(t);
  vgradD(0, 122, [C.BLUE, C.SKY, C.SKY, C.HAZE]);
  cloudsLayer(cx * .12 + 100, 10, 60, 6, 7);
  mountains(114, cx * .3, 31, C.MTN, C.MTND, true, 44, 56);
  skyline(122, cx * .55, 33);
  // guardrail
  rect(0, 118, PW, 2, C.LGREY); rect(0, 120, PW, 1, C.GREY);
  for (let x = -((Math.round(cx) % 16) + 16) % 16; x < PW; x += 16) rect(x, 118, 2, 7, C.GREY);
  rect(0, 125, PW, 26, C.ROADA); rect(0, 125, PW, 1, C.WHITE); rect(0, 150, PW, 1, C.WHITE);
  for (let x = -((Math.round(cx) % 28) + 28) % 28; x < PW; x += 28) rect(x, 137, 14, 2, C.WHITE);
  rect(0, 151, PW, 29, C.GRASSA); for (let x = 0; x < PW; x += 2) for (let y = 152; y < 180; y += 3) if (hash(((x + Math.round(cx)) & 1023) * 31 + y) > .8) pset(x, y, C.GRASSB);
  // ? block he will never reach
  const qx = Math.round(QBLOCK_X - cx), qy = 56 + (step(t, 4) % 2);
  rectO(qx - 8, qy, 16, 16, C.AMBER); rect(qx - 8, qy, 16, 1, C.YELLOW); for (const [a, b] of [[-7, 1], [6, 1], [-7, 14], [6, 14]]) pset(qx + a, qy + b, C.BROWN);
  txt('?', qx - 2, qy + 4, C.BROWN); txt('?', qx - 3, qy + 4, C.WHITE);
  // birds overtake him in the sky
  for (let i = 0; i < 3; i++) { const bx = -20 + (t - 197.1) * 64 + i * 15, by = 40 + i * 5 + Math.round(Math.sin(t * 5 + i) * 1.5); blit(BIRD[(step(t, 6) + i) % 2], bx, by); }
  // the rumour: a real plane, flying, way up
  if (t > 198.8) {
    const px = -20 + (t - 198.8) * 150, py = 20;
    for (let i = 1; i < 12; i++) hlineD(px - i * 6 - 6, px - i * 6, py + 4, TR, C.WHITE, .85 - i * .07);
    blit(MINIPLANE, px, py);
  }
  const pressed = PRESS.find((p) => t >= p && t < p + .16);
  const sq = PRESS.some((p) => t >= p && t < p + .12) ? 1 : 0;
  const lookUp = t > 199.0 && t < 200.9;
  planeSide(96, 149 - (lastBeat(t) % 2 === 0 && beatPulse(t, 18) > .5 ? 1 : 0), { pf: step(t, 24), wf: step(t, 16) % 4, look: lookUp ? 'up' : 'fwd', squish: sq });
  if (t > PRESS[0] + .05 && t < PRESS[1]) txt('...', 160, 98, C.WHITE, { o: C.INK });
  // HUD
  planeFace(6, 5, 14, { pf: step(t, 24) }); txt('X01', 24, 9, C.WHITE, { o: C.INK });
  txt('WORLD 1-1', 312, 6, C.WHITE, { o: C.INK, align: 'r' }); txt('HIGHWAY', 312, 16, C.YELLOW, { o: C.INK, align: 'r' });
  txt('COINS 00', 160, 6, C.WHITE, { o: C.INK, align: 'c' });
  if (t > 198.2 && t < PRESS[1] + .2) {
    if (pressed || blink(t, 2) || t > PRESS[0]) { txt('PRESS', 118, 162, C.WHITE, { o: C.INK, align: 'r' }); aButton(130, 165, !!pressed); txt('TO JUMP', 142, 162, C.WHITE, { o: C.INK }); }
  }
  if (t > PRESS[1] + .2) {
    rectO(80, 158, 160, 15, C.DRED); txt('JUMP: NOT EQUIPPED', 160, 162, C.YELLOW, { align: 'c' });
  }
}

// ============ SHOT 4: race again, curves, the truck cuts in, the PASSING LANE gantry ============
const S4_CURVE = (t) => kf(t, [[201.5, .3], [202.7, -.9], [204.0, -.6], [205.33, .5]]);
const S4_CARS = [
  { t0: 201.60, lane: -1, lane2: 0, zA: 5, zB: 9, truck: true, v: 3.2, zr0: 2.0 },
  { t0: 202.55, lane: 1, kind: 4, v: 7, zr0: 2.2 },
  { t0: 203.80, lane: -1, kind: 5, v: 6.5, zr0: 2.2 },
  { t0: 204.70, lane: 1, kind: 2, v: 6, zr0: 2.2 },
];
function raceB(t, o = {}) {
  const hy = 66, cv = o.curve ?? S4_CURVE(t);
  return race(t, {
    hy, camZ: o.camZ ?? camZ0(t), curve: cv, bgX: curveBg(S4_CURVE, 201.5, Math.min(t, 205.33)) + (t > 205.33 ? (t - 205.33) * 30 : 0), cars: o.cars ?? S4_CARS, blur: o.blur, lines: o.lines,
    objs: o.objs ?? [{ z: 20 * HWY + 0, X: 0, spr: SIGN_RUNWAY, sc: 0 }, { z: 20 * 204.16 + PLANEZ(hy), X: 0, spr: GANTRY, sc: 1.35, snap: true }],
    plane: { bank: cv * .6, glance: cv < -.45 ? -1 : 0, ...o.plane }, planeDX: o.planeDX,
  });
}
function s4_race(t) {
  raceB(t);
  hudRace(t, { pos: '9/9', speed: 84 + Math.round(snoise(t * 2, 5) * 2), speedFrac: .4, turbo: 0, msg: 'PASSING LANE: LOCKED' });
  if (t > 203.0 && t < 204.3) { const b = Math.round(Math.sin((t - 203) * 10)); txt('!', 178, 112 + b, C.RED, { o: C.INK, sc: 2 }); }
}

// ============ SHOT 5: the bonus stage up in the clouds, out of reach ============
const BH = 470;
function s5_bonus(t) {
  const camY = Math.round(kf(t, [[206.05, BH - 180], [207.85, 0]], ease.inOut));
  for (let y = 0; y < PH; y++) {                                   // sky by world height
    const wy = y + camY, p = clamp(wy / (BH - 60)) * 3, i = Math.min(2, Math.floor(p)), cols = [C.DEEP, C.BLUE, C.SKY, C.HAZE];
    hlineD(0, PW - 1, y, cols[i], cols[i + 1], p - i);
  }
  for (let i = 0; i < 9; i++) { const wy = 150 + hash(i * 41) * 220, x = ((hash(i * 23) * 420 - t * 6) % 420 + 420) % 420 - 50; if (wy - camY > -20 && wy - camY < 200) cloud(x, wy - camY, 30 + hash(i * 3) * 30); }
  // the bonus stage
  const Y = (wy) => wy - camY;
  for (const [cx0, wy, w] of [[60, 128, 90], [168, 112, 100], [270, 132, 80]]) {
    for (let k = -2; k <= 2; k++) cloud(cx0 + k * w / 5, Y(wy), w / 3);
  }
  const collectT = (x) => 207.7 + (x + 20) / 160;
  for (let i = 0; i < 14; i++) {
    const x = 30 + i * 20, wy = 96 - Math.round(Math.sin(i / 13 * Math.PI) * 18);
    const ct = collectT(x);
    if (t < ct) { const f = (step(t, 10) + i) % 4, rx = [3, 2, 1, 2][f]; ellO(x, Y(wy), rx, 4, C.AMBER, C.ORANGE); if (rx > 1) rect(x - rx + 1, Y(wy) - 2, 1, 3, C.YELLOW); }
    else if (t < ct + .3) txt('+100', x, Y(wy) - 6 - Math.round((t - ct) * 16), C.WHITE, { o: C.INK, align: 'c' });
  }
  if (t > 207.6) {                                                  // someone else, flying, collecting his coins
    const px = -20 + (t - 207.7) * 160, py = Y(88) + Math.round(Math.sin((t - 207.7) * 6) * 6);
    for (let i = 1; i < 10; i++) hlineD(px - i * 6 - 6, px - i * 6, py + 4, TR, C.WHITE, .8 - i * .07);
    blit(MINIPLANE, px - 16, py - 6, { sc: 2 });
  }
  box(84, Y(22), 152, 46, { bg: C.DEEP, cols: [C.BLUE, C.DBLUE, C.NAVY] });
  txt('BONUS STAGE', 160, Y(30), C.YELLOW, { o: C.INK, sc: 2, align: 'c' });
  txt('REQUIRES: FLIGHT', 160, Y(52), C.WHITE, { align: 'c' });
  const sh = YEAH.some((y) => t >= y && t < y + .12) ? (step(t, 24) % 2 ? 2 : -2) : 0;
  blit(PADLOCK, 160 + sh, Y(132), { sc: 2, ax: .5, ay: 1 });
  YEAH.forEach((y, i) => { if (t >= y) txt('LOCKED', 160 + (i - 1) * 56, Y(138) + 4, C.RED, { o: C.INK, align: 'c' }); });
  // down on the ground: him, looking up
  const gy = BH - 26;
  rect(0, Y(gy - 22), PW, 1, C.WHITE); rect(0, Y(gy - 21), PW, 24, C.ROADA); rect(0, Y(gy + 3), PW, 1, C.WHITE);
  for (let x = -((Math.round(t * 20) % 28) + 28) % 28; x < PW; x += 28) rect(x, Y(gy - 10), 14, 2, C.WHITE);
  rect(0, Y(gy + 4), PW, 40, C.GRASSA);
  mountains(Y(gy - 22), t * 8, 41, C.DGREEN, C.DDGREEN, false, 14, 30);
  planeSide(118, Y(gy), { pf: step(t, 24), wf: step(t, 8) % 4, look: 'up', sparkle: t < 206.4 });
  if (camY < 40) {                                                  // where he is, relative to all this
    rectO(108, 160, 104, 14, C.NAVY); txt('YOU: ALT 0 FT', 160, 164, C.WHITE, { align: 'c' });
    if (blink(t, 2)) txt('^', 102, 164, C.YELLOW);
  }
}

// ============ SHOT 6: PAUSE (the breakdown) ============
const DIM = palMap((r, g, b) => [r * .42, g * .42, b * .55 + 12]);
function s6_pause(t) {
  raceB(210.2, { plane: { brake: true } });
  hudRace(210.2, { pos: '9/9', speed: 0, speedFrac: 0, turbo: 1 });
  remapFB(DIM);
  txt('PAUSE', 160, 26, C.YELLOW, { o: C.INK, sc: 3, align: 'c' });
  const shake = t >= 211.87 && t < 212.05 ? (step(t, 24) % 2 ? 2 : -2) : 0;
  const bx = 100 + shake;
  box(bx, 62, 120, 50, { bg: C.K });
  const items = [['CONTINUE', C.WHITE], ['TURBO', C.CYAN], ['TAKE OFF', C.GREY]];
  items.forEach(([s, c], i) => txt(s, bx + 22, 70 + i * 13, c));
  blit(PADLOCK, bx + 98, 93, { sc: .8 });
  const cur = t < 210.77 ? 0 : t < 211.30 ? 1 : t < 214.57 ? 2 : 1;
  const sel = (t >= 211.87 && t < 212.0) || (t >= 215.67 && t < 215.8);
  if (blink(t, 3) || sel) txt('>', bx + 11 + (sel ? 2 : 0), 70 + cur * 13, sel ? C.RED : C.YELLOW);
  if (t >= 211.87 && t < 215.67) {
    box(52, 120, 216, 36, { bg: C.K, cols: [C.DRED, C.PURPLE, C.DPURP] });
    txt('TAKE OFF: REQUIRES RUNWAY', 160, 128, C.YELLOW, { align: 'c' });
    if (t > 213.50) txt('NEAREST RUNWAY: 999 KM', 160, 141, C.WHITE, { align: 'c' });
  }
  if (t >= 215.67) { box(84, 120, 152, 22, { bg: C.K }); txt(blink(t, 4) ? 'TURBO: READY' : 'TURBO: READY', 160, 128, C.CYAN, { align: 'c' }); }
}

// ============ SHOT 7: unpause, TURBO. "vroom vroom". He still doesn't take off ============
const boost = (t) => t < VROOM[0] ? 0 : t < VROOM[1] ? 34 : t < LAND ? 80 : 80 * Math.exp(-(t - LAND) * 3);
const S7_CARS = [{ t0: 218.45, lane: 1, kind: 1, v: 100, zr0: 2.0, minus: (t) => integ(boost, 218.45, t, 1 / 48) }];
const lift = (t) => { if (t < VROOM[1] + .05 || t >= LAND) return 0; const u = (t - VROOM[1] - .05) / (LAND - VROOM[1] - .05); return u < .15 ? 1 : u < .85 ? 2 : 1; };
function s7_turbo(t) {
  const extra = integ(boost, VROOM[0], t, 1 / 96), turbo = t >= VROOM[0] && t < LAND + .1;
  const amp = hit(t, VROOM[0], 7) * 3 + hit(t, VROOM[1], 5) * 4 + hit(t, LAND, 14) * 2;
  const ox = Math.round(snoise(t * 37, 1) * amp), oy = Math.round(snoise(t * 41, 2) * amp);
  const rumble = t < VROOM[0] && t > 217.2 ? (step(t, 12) % 2) : 0;
  raceB(t, {
    camZ: camZ0(t) + extra, curve: kf(t, [[216.73, .5], [217.8, .1], [219.4, -.2]]), cars: S7_CARS, blur: turbo ? 1 : 0, lines: turbo ? clamp(.5 + (t > VROOM[1] ? .5 : 0)) : 0,
    objs: [{ z: 20 * 219.1 + 40, X: RW + 40, spr: SIGN_RUNWAY, sc: 1.6 }],
    plane: { lift: lift(t), flame: turbo, bank: 0 }, planeDX: rumble,
  });
  if (t >= LAND && t < LAND + .4) {                                 // landing dust
    const k = (t - LAND) / .4, r = 2 + Math.round(k * 5);
    for (const sd of [-1, 1]) { circ(160 + sd * (16 + k * 10), 170, r, C.PALE); circ(160 + sd * (22 + k * 14), 168, r - 1, C.WHITE); }
  }
  const speed = t < VROOM[0] ? 86 : t < VROOM[1] ? 300 : t < LAND ? 999 : Math.max(140, 999 - (t - LAND) * 1500);
  hudRace(t, { pos: '9/9', speed, speedFrac: speed / 600, turbo: t < VROOM[0] ? 1 : clamp(1 - (t - VROOM[0]) / 1.1), turboFlash: t < VROOM[0] || turbo, turboLabel: turbo ? 'TURBO!!' : t < VROOM[0] ? 'TURBO READY' : 'TURBO' });
  VROOM.forEach((v, i) => {
    if (t < v) return; const pop = t - v < .085 ? 1 : 0;
    txt(LY.V, 160, (i ? 74 : 40) - pop * 4, i ? C.YELLOW : C.WHITE, { o: C.INK, sc: (i ? 4 : 3) + pop, align: 'c' });
  });
  if (t > LAND + .12) {
    const x = Math.round(lerp(-200, 60, ease.out(inv(LAND + .12, LAND + .35, t))));
    rectO(x, 105, 200, 15, C.NAVY); txt('MAX ALTITUDE: 2 PX', x + 100, 109, C.YELLOW, { align: 'c' });
  }
  fx({ flash: hit(t, VROOM[0], 30) * .55 + hit(t, VROOM[1], 30) * .65 });
  return [ox, oy];
}

// ---- register: each shot draws the indexed frame, then it goes out through the palette ----
const px = (fn) => { const g = (t, lt, len) => { target(FB); FB.d.fill(C.K); const sh = fn(t, lt, len); pxOut(...(sh || [0, 0])); }; Object.defineProperty(g, 'name', { value: fn.name }); return g; };
chapter('16bit', T0, T1, [
  [CUT[0], px(s1_race)], [CUT[1], px(s2_dialog)], [CUT[2], px(s3_side)], [CUT[3], px(s4_race)],
  [CUT[4], px(s5_bonus)], [CUT[5], px(s6_pause)], [CUT[6], px(s7_turbo)],
]);
