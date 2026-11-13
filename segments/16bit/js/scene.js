// The segment's scene: 15 seconds of a made-up 16-bit racing game, "Coast Run".
// A small orange van with a surfboard races a coast road to a lighthouse. Five shots, every cut on a beat
// of the 120 bpm grid (js/core.js): title, race, turbo, pause menu, stage clear.
// Game grammar carries the look: a typed title, a position counter, a turbo bar, a radio box typed letter
// by letter, a pause menu with a locked item, a results screen. Hits land on beats and flash white.

// ---- the player: a van seen from behind (the race camera) ----
function playerVan(cx, gy, o = {}) {
  cx = Math.round(cx); const by = gy - Math.round(o.lift || 0), bk = Math.round((o.bank || 0) * 2);
  ell(cx, gy + 1, 24, 3, TR, C.INK, .5);                                    // dithered shadow on the road
  for (const sd of [-1, 1]) {                                               // rear tyres, tread rolling
    rectO(cx + sd * 13 - 4, by - 8, 8, 8, C.K, C.INK);
    for (let j = 0; j < 8; j++) if ((j + (o.wf || 0)) % 3 === 0) rect(cx + sd * 13 - 4, by - 8 + j, 8, 1, C.SLATE);
  }
  rectO(cx - 18 + bk, by - 31, 36, 25, C.ORANGE);                           // body
  rect(cx - 18 + bk, by - 31, 36, 3, C.AMBER);                              // roof edge catches the light
  rectD(cx - 18 + bk, by - 14, 36, 8, C.ORANGE, C.DRED, .25);               // dithered shade low on the doors
  rect(cx + bk, by - 27, 1, 19, C.DRED);                                    // the seam between the two rear doors
  for (const sd of [-1, 1]) {                                               // rear windows with a glint
    const wx = cx + bk + (sd < 0 ? -15 : 3);
    rectO(wx, by - 27, 12, 8, C.NAVY); rect(wx + 1, by - 26, 3, 1, C.CYAN); pset(wx + 1, by - 25, C.CYAN);
  }
  for (const sd of [-1, 1]) rect(cx + bk + (sd < 0 ? -17 : 14), by - 17, 3, 5, o.brake ? C.PINK : C.RED); // tail lights
  rect(cx - 5 + bk, by - 12, 10, 4, C.CREAM); frame(cx - 5 + bk, by - 12, 10, 4, C.CREAMD);               // blank plate
  rectO(cx - 19, by - 8, 38, 3, C.LGREY); rect(cx - 19, by - 8, 38, 1, C.PALE);                           // bumper
  rect(cx - 15 + bk, by - 34, 30, 2, C.SLATE);                              // roof rack
  ell(cx + bk, by - 36, 22, 2, C.CREAM); rect(cx - 22 + bk, by - 36, 44, 1, C.SKY);                       // surfboard, end on
  rect(cx + 11, by - 6, 3, 2, C.GREY);                                      // exhaust
  if (o.flame) { const fl = step(o.t, 24) % 2; circ(cx + 12, by - 4, 2 + fl, C.ORANGE); circ(cx + 12, by - 4, fl, C.YELLOW); }
  else if (step(o.t || 0, 8) % 3 === 0) ell(cx + 15, by - 4, 3, 2, TR, C.PALE, .5);                      // a puff now and then
}

// ---- a gull for the radio box portrait ----
function gullFace(x, y, sz, o = {}) {
  rectD(x, y, sz, sz, C.SKY, C.HAZE, .3);
  const cx = x + sz / 2, cy = y + sz / 2 + 2;
  ellO(cx, cy + 2, 13, 12, C.WHITE); ell(cx - 3, cy + 7, 8, 5, C.PALE);
  for (const sd of [-1, 1]) { ellO(cx + sd * 5, cy - 2, 2, 3, C.WHITE); rect(cx + sd * 5 - 1, cy - 2, 2, 2, C.INK); }
  rect(cx - 7, cy - 6, 5, 1, C.GREY); rect(cx + 3, cy - 6, 5, 1, C.GREY);   // deadpan brows
  polyO([[cx - 4, cy + 2], [cx + 4, cy + 2], [cx + 1, cy + (o.talk ? 9 : 7)], [cx - 1, cy + (o.talk ? 9 : 7)]], C.AMBER);
  if (o.talk) rect(cx - 1, cy + 4, 3, 2, C.DRED);
  frame(x, y, sz, sz, C.WHITE);
}

// ---- the lighthouse, for the finish ----
function lighthouse(x, gy, t) {
  poly([[x - 9, gy], [x + 9, gy], [x + 5, gy - 52], [x - 5, gy - 52]], C.WHITE);
  for (let k = 0; k < 4; k++) poly([[x - 9 + k * 1, gy - 6 - k * 13], [x + 9 - k * 1, gy - 6 - k * 13], [x + 8.5 - k * 1, gy - 12 - k * 13], [x - 8.5 + k * 1, gy - 12 - k * 13]], C.RED);
  rectO(x - 7, gy - 60, 14, 8, C.YELLOW); rect(x - 6, gy - 59, 12, 2, C.WHITE);
  poly([[x - 8, gy - 60], [x + 8, gy - 60], [x, gy - 68]], C.DRED);
  // the beam sweeps once a beat: a dithered wedge from the lamp
  const a = (t / BEAT) * Math.PI * .5, len = 260, sp = .09, lx = x, ly = gy - 56;
  const pts = [[lx, ly], [lx + Math.cos(a - sp) * len, ly + Math.sin(a - sp) * len * .35], [lx + Math.cos(a + sp) * len, ly + Math.sin(a + sp) * len * .35]];
  if (Math.cos(a) < 0) return;  // only while it faces us
  const buf = offscreen(PW, PH, () => poly(pts, C.CREAM));
  for (let j = 0; j < PH; j++) for (let i = 0; i < PW; i++) if (buf.d[j * PW + i] !== TR && bay(i, j) < .35) pset(i, j, C.CREAM);
}

// ---- traffic and position ----
const PZ = (hy) => ZC / (172 - hy);   // the player's depth on the road
// cars we overtake: they come at us from far ahead (v < 0) in the side lanes
const RACE_CARS = [
  { t0: 2.5, lane: -1, kind: 0, v: -7, zr0: 26 }, { t0: 3.0, lane: 1, kind: 1, v: -6, zr0: 30 },
  { t0: 4.2, lane: -1, kind: 3, v: -7.5, zr0: 32 }, { t0: 5.4, lane: 1, kind: 2, v: -8, zr0: 34 },
];
const TURBO_CARS = [
  { t0: 7.5, lane: 1, kind: 4, v: -22, zr0: 40 }, { t0: 7.9, lane: -1, kind: 5, v: -24, zr0: 50, truck: true },
];
function overtaken(cars, t, hy) {
  let n = 0, last = -9; for (const c of cars) { const tp = c.t0 + (c.zr0 - PZ(hy)) / -c.v; if (t >= tp) { n++; last = Math.max(last, tp); } }
  return { n, flash: t - last < .6 };
}
const RACE_CURVE = (t) => kf(t, [[2.5, 0], [4.0, .55], [5.5, -.35], [7.5, .1], [10, 0]]);
const camZ = (t) => 20 * t + (t > 7.5 ? integ((x) => 40 * ease.out(inv(7.5, 8.2, x)), 7.5, t) : 0);
// the far layers: open sea on the left, a headland with the lighthouse on the right, both scrolling with the curve
function seaBackdrop(hy, bgX) {
  const top = hy - 14;
  rect(0, top, PW, hy + 1 - top, C.DEEP);
  for (let y = top + 2; y <= hy; y += 3) for (let x = ((y * 13 + Math.round(bgX * .5)) % 17) - 17; x < PW; x += 17) hline(x, x + 4, y, C.MBLUE);
  hline(0, PW - 1, top, C.HAZE);
  const hx = 250 - Math.round(bgX * .6) % 520;
  mountains(hy + 1, bgX * .6, 31, C.DGREEN, C.DDGREEN, false, 18, 70);
  lighthouseSmall(hx, top + 2);
}
function lighthouseSmall(x, gy) {
  rect(x - 14, gy, 28, 4, C.DBROWN);
  poly([[x - 3, gy], [x + 3, gy], [x + 2, gy - 18], [x - 2, gy - 18]], C.WHITE);
  rect(x - 3, gy - 6, 6, 3, C.RED); rect(x - 2, gy - 13, 4, 3, C.RED); rect(x - 2, gy - 21, 4, 3, C.YELLOW);
}
const SIGN_BEACH = signBoard(58, 26, ['BEACH', '2 KM'], C.DEEP, C.WHITE, 14);
function coast(t, o = {}) {
  const hy = 74;
  return race(t, {
    hy, camZ: camZ(t), curve: RACE_CURVE(t), bgX: curveBg(RACE_CURVE, 2.5, t), cars: [...RACE_CARS, ...TURBO_CARS], blur: o.blur, lines: o.lines,
    sky: [C.DBLUE, C.BLUE, C.SKY, C.HAZE], backdrop: seaBackdrop,
    objs: [{ z: 20 * 4.8 + 6, X: RW + 40, spr: SIGN_BEACH, sc: 1.5 }],
    player: { bank: RACE_CURVE(t) * .8, flame: o.flame, brake: o.brake }, playerDX: o.dx,
  });
}

// ============ 1. TITLE [0, 2.5): the name drops in on a beat, the subtitle types, PRESS START, A on a beat ============
function s1_title(t) {
  vgradD(0, 112, [C.DPURP, C.PURPLE, C.MAGENTA, C.PINK, C.AMBER]);
  const sy = 104; circ(250, sy, 22, C.YELLOW); for (let y = sy - 22; y <= sy; y++) if (y > sy - 12 && y % 3 === 0) hline(226, 274, y, C.PINK);
  vgradD(112, PH, [C.DEEP, C.NAVY, C.INK]);                                    // the sea
  for (let y = 114; y < PH; y += 5) for (let x = (y * 7 + step(t, 6) * 3) % 23 - 23; x < PW; x += 23) hline(x, x + 6, y, C.MBLUE);
  for (let y = 114; y < 150; y += 3) hlineD(240 - (y - 112) * 0.4, 260 + (y - 112) * 0.4, y, TR, C.AMBER, .5); // sun on the water
  lighthouse(44, 112, t); rect(20, 106, 50, 8, C.DBROWN); rectD(20, 106, 50, 3, C.DBROWN, C.BROWN, .4);
  const drop = ease.back(inv(beatAt(1), beatAt(1) + .35, t)), ty = Math.round(lerp(-30, 30, drop));
  txt('COAST RUN', 160, ty, C.YELLOW, { o: C.INK, sh: C.DRED, sc: 4, align: 'c' });
  txt(typed(['STAGE', '3:', 'THE', 'LIGHTHOUSE', 'ROAD'], [1.0, 1.15, 1.25, 1.35, 1.6], t), 160, 66, C.WHITE, { o: C.INK, align: 'c' });
  const pressed = t >= beatAt(4) && t < beatAt(4) + .15;
  if (t > 1.5 && (blink(t, 2) || t >= beatAt(4))) txt('PRESS START', 160, 92, pressed ? C.RED : C.WHITE, { o: C.INK, align: 'c' });
  aButton(292, 160, pressed);
  fx({ flash: hit(t, beatAt(1), 18) * .35 + hit(t, beatAt(4), 26) * .5 });
}

// ============ 2. RACE [2.5, 7.5): overtaking up the coast, a radio call typed letter by letter ============
function s2_race(t) {
  coast(t);
  const p = overtaken(RACE_CARS, t, 74);
  const turbo = inv(3.0, 7.0, t);
  hudRace(t, {
    pos: `${7 - p.n}/8`, posFlash: p.flash, speed: 182 + Math.round(snoise(t * 2, 3) * 3), speedFrac: .55,
    turbo, turboLabel: turbo >= 1 ? 'TURBO READY' : 'TURBO', turboFlash: turbo >= 1,
  });
  if (t > 3.5 && t < 6.6) {
    box(46, 30, 228, 30, { bg: C.SKY });
    const words = ['LIGHTHOUSE', 'AHEAD.', 'KEEP', 'TO', 'THE', 'MIDDLE!'], times = [3.6, 3.95, 4.4, 4.55, 4.65, 4.8];
    const talking = words.some((w, i) => t >= times[i] && t < times[i] + w.length / 34 + .15);
    gullFace(50, 33, 24, { talk: talking && step(t, 8) % 2 === 0 });
    txt(typed(words, times, t), 80, 41, C.WHITE, { sh: C.INK });
    if (t > 5.3 && blink(t, 2)) txt('^', 264, 50, C.WHITE);
  }
}

// ============ 3. TURBO [7.5, 10): the hit on the beat, shake, speed lines, two more passes, 1ST pops on a beat ============
function s3_turbo(t) {
  const amp = 2 * hit(t, 7.5, 5);
  const ox = Math.round(snoise(t * 37, 1) * amp), oy = Math.round(snoise(t * 41, 2) * amp);
  coast(t, { blur: 1, lines: clamp(.4 + .6 * inv(7.5, 8.5, t)), flame: true, dx: step(t, 12) % 2 });
  const p = overtaken(RACE_CARS, t, 74), q = overtaken(TURBO_CARS, t, 74);
  const pos = t >= beatAt(18) ? 1 : 7 - p.n - q.n;
  hudRace(t, { pos: `${pos}/8`, posFlash: q.flash || (t >= beatAt(18) && t < beatAt(18) + .6), speed: Math.min(999, 182 + (t - 7.5) * 1400), speedFrac: 1, turbo: clamp(1 - (t - 7.5) / 2.3), turboFlash: true, turboLabel: 'TURBO!!' });
  if (t >= beatAt(18)) { const pop = t - beatAt(18) < .085 ? 1 : 0; txt('1ST!', 160, 52 - pop * 4, C.YELLOW, { o: C.INK, sc: 4 + pop, align: 'c' }); }
  fx({ flash: hit(t, 7.5, 24) * .6 + hit(t, beatAt(18), 28) * .45 });
  return [ox, oy];
}

// ============ 4. PAUSE [10, 12.5): the race frame dimmed, a menu with a locked item, the cursor moves on beats ============
const DIM = palMap((r, g, b) => [r * .42, g * .42, b * .55 + 12]);
function s4_pause(t) {
  coast(9.98, { blur: 1, flame: false, brake: true });
  hudRace(9.98, { pos: '1/8', speed: 0, speedFrac: 0, turbo: 0 });
  remapFB(DIM);
  txt('PAUSE', 160, 22, C.YELLOW, { o: C.INK, sc: 3, align: 'c' });
  const bx = 100;
  box(bx, 58, 120, 50, { bg: C.K });
  [['CONTINUE', C.WHITE], ['RETRY', C.WHITE], ['SURF', C.GREY]].forEach(([s, c], i) => txt(s, bx + 22, 66 + i * 13, c));
  blit(PADLOCK, bx + 98, 89, { sc: .8 });
  const cur = t < beatAt(21) ? 0 : t < beatAt(22) ? 1 : t < beatAt(24) ? 2 : 0;
  const sel = t >= beatAt(23) && t < beatAt(23) + .15;
  if (blink(t, 3) || sel) txt('>', bx + 11 + (sel ? 2 : 0), 66 + cur * 13, sel ? C.RED : C.YELLOW);
  if (t >= beatAt(23)) { box(52, 118, 216, 24, { bg: C.K, cols: [C.DRED, C.PURPLE, C.DPURP] }); txt(typed(['SURF:', 'FINISH', 'THE', 'STAGE', 'FIRST'], [11.5, 11.62, 11.78, 11.86, 12.0], t), 160, 126, C.YELLOW, { align: 'c' }); }
  fx({ flash: sel ? .25 : 0 });
}

// ============ 5. STAGE CLEAR [12.5, 15): night at the lighthouse, the time counts up, NEW RECORD blinks ============
function s5_clear(t) {
  vgradD(0, 120, [C.INK, C.NAVY, C.DBLUE, C.DEEP]);
  for (let i = 0; i < 40; i++) { const x = Math.floor(hash(i * 11) * PW), y = Math.floor(hash(i * 29) * 100); if (hash(i * 5 + step(t, 4)) > .2) pset(x, y, i % 5 ? C.PALE : C.WHITE); }
  vgradD(120, PH, [C.NAVY, C.INK]);
  for (let y = 124; y < PH; y += 6) for (let x = (y * 5 + step(t, 4) * 2) % 29 - 29; x < PW; x += 29) hline(x, x + 7, y, C.DEEP);
  rect(214, 112, 80, 10, C.DBROWN); rectD(214, 112, 80, 3, C.DBROWN, C.BROWN, .4);
  lighthouse(258, 114, t);
  rect(0, 150, PW, 30, C.ROADA); for (let x = -((step(t, 24) * 2) % 20); x < PW; x += 20) rect(x, 162, 10, 2, C.YELLOW);
  playerVan(70, 168, { t, wf: step(t, 16) % 3, brake: true });
  const k = ease.out(inv(12.5, 12.9, t)), bx = Math.round(lerp(-180, 20, k));
  box(bx, 20, 170, 74, { bg: C.K });
  txt(typed(['STAGE', 'CLEAR!'], [12.6, 12.8], t), bx + 85, 28, C.YELLOW, { align: 'c' });
  const secs = Math.min(74.62, (t - 12.9) * 60);
  if (t > 12.9) txt(`TIME  ${songClock(Math.max(0, secs))}`, bx + 12, 46, C.WHITE);
  if (t > 13.5) txt('POS   1/8', bx + 12, 58, C.WHITE);
  if (t > beatAt(28) && blink(t, 3)) txt('NEW RECORD', bx + 85, 76, C.CYAN, { align: 'c' });
  fx({ flash: hit(t, beatAt(28), 26) * .4 });
}

// ---- register: each shot draws the indexed frame, then it goes out through the palette ----
const px = (fn) => (t, lt, len) => { target(FB); FB.d.fill(C.K); const sh = fn(t, lt, len); pxOut(...(sh || [0, 0])); };
shot('title', 0, 2.5, px(s1_title));
shot('race', 2.5, 7.5, px(s2_race));
shot('turbo', 7.5, 10, px(s3_turbo));
shot('pause', 10, 12.5, px(s4_pause));
shot('clear', 12.5, 15, px(s5_clear));
