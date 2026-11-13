// The 16-bit look's drawing vocabulary: the 46-colour palette, generic sprites (traffic, palm, padlock, birds),
// scenery layers, the UI kit, the HUD and the pseudo-3D road. Lifted from the look's source (see README.md);
// the film's own characters, signs and shots are not here. The scene that uses these is js/scene.js.
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
const PADLOCK = offscreen(14, 17, () => {
  for (let a = 0; a < 40; a++) { const x = 7 + Math.cos(Math.PI + a / 39 * Math.PI) * 4.5, y = 7 + Math.sin(Math.PI + a / 39 * Math.PI) * 5; rect(x - 1, y, 2, 1, C.INK); }
  for (let y = 7; y < 9; y++) { pset(2, y, C.INK); pset(11, y, C.INK); }
  rectO(1, 8, 12, 8, C.AMBER); rect(1, 8, 12, 2, C.YELLOW); rect(6, 10, 2, 3, C.INK); pset(6, 13, C.INK);
});
const BIRD = [sprite(['k.....k', '.k...k.', '..k.k..', '...k...'], { k: C.INK }), sprite(['.......', 'kk...kk', '..kkk..', '...k...'], { k: C.INK })];

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
// one behind-view race frame. o: camZ, curve, hy, bgX, cars, objs, player, blur
const LANE = 80, RW = 120;
function race(t, o) {
  const hy = o.hy;
  vgradD(0, hy + 1, o.sky || [C.DBLUE, C.BLUE, C.SKY, C.HAZE]);
  cloudsLayer(o.bgX * .2, 8, hy - 30, 6, 1);
  if (o.backdrop) o.backdrop(hy, o.bgX); else {   // a scene may bring its own far layers (o.backdrop)
    mountains(hy + 1, o.bgX * .45, 3, C.MTN, C.MTND, true, 36);
    skyline(hy + 1, o.bgX * .6, 5);
    mountains(hy + 1, o.bgX * .8, 9, C.DGREEN, C.DDGREEN, false, 10, 30);
  }
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
  if (o.player !== false) playerVan(160 + (o.playerDX || 0), 172, { t, wf: step(t, 16) % 3, ...o.player });
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
