// Shot list for the court look. One place, the courtroom, as a sketch artist draws it: each framing
// is its own sheet (wide, the jury box, the couple's table, the king's side, the gallery, the doors,
// the judge, the exhibit easel). Times are word onsets from lines.json. Picture area is y < 700
// (the transcript sheet covers the rest).
const T0 = 261.5, T1 = 302.75; // frames f6276-f7266

// onset of the nth occurrence of word w in line i
function on(i, w, nth = 0) { const L = LINES.find(l => l.i === i); const ws = L.words.filter(x => x.w === w); return ws[nth].s; }
const lineStart = (i) => LINES.find(l => l.i === i).s;
const BUILD = .42, PRE = .24; // a new sheet sketches itself in BUILD s, starting PRE s before the cut (so the cut lands on a sheet already half drawn, finishing in 4 frames)

// ---------- A. wide: the whole court (261.52, line start) ----------
const CLOCK = { x: 1700, y: 150, r: 58 }, CAL = { x: 1700, y: 268, w: 96, h: 88 };
function buildWide(s, sh) {
  s.at(sh.t - PRE, BUILD);
  s.hatch(rectPoly(0, 0, W, 70), -.3, 30, 30, C.greenL, .35, PASS.SCUMBLE);
  s.plane(0); panels(s, -20, 60, W + 20, 520, 12);
  // the judge's high-backed chair, the judge, the bench
  s.ground([[890, 80], [1030, 80], [1040, 320], [880, 320]], C.greenD, .85);
  s.hatch([[890, 80], [1030, 80], [1040, 320], [880, 320]], 1.5, 14, 20, C.green, .8);
  s.line([[884, 84], [960, 62], [1036, 84]], 6, C.ochre, .8);
  s.plane(1); judge(s, 960, 212, 36);
  s.plane(2); woodFront(s, 470, 300, 1450, 470, 6, { edge: C.oakL });
  // the clock and the tear-off calendar
  s.ground(ovalPoly(CLOCK.x, CLOCK.y, CLOCK.r + 9, CLOCK.r + 9), C.oakD, .95);
  s.ground(ovalPoly(CLOCK.x, CLOCK.y, CLOCK.r, CLOCK.r), C.white, .95);
  s.hatch(ovalPoly(CLOCK.x, CLOCK.y, CLOCK.r, CLOCK.r), .4, 10, 14, C.white, .9);
  for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; s.line([[CLOCK.x + Math.cos(a) * CLOCK.r * .76, CLOCK.y + Math.sin(a) * CLOCK.r * .76], [CLOCK.x + Math.cos(a) * CLOCK.r * .92, CLOCK.y + Math.sin(a) * CLOCK.r * .92]], 4, C.ink, .9); }
  s.ground(rectPoly(CAL.x - CAL.w / 2 - 6, CAL.y - CAL.h / 2 - 16, CAL.x + CAL.w / 2 + 6, CAL.y - CAL.h / 2 + 2), C.ink, .95, PASS.DARK);
  // the empty jury box, left: two rows of green benches with nobody on them
  for (let row = 0; row < 2; row++) {
    const y = 330 + row * 60;
    s.ground(rectPoly(50, y, 400, y + 38), row ? C.green : C.greenD, .9);
    s.hatch(rectPoly(50, y, 400, y + 38), .1, 9, 13, row ? C.greenL : C.green, .7);
    s.line([[50, y + 40], [400, y + 40]], 4, C.ink, .7);
  }
  woodFront(s, 30, 440, 420, 600, 3);
  // counsel, front left, seen from behind
  s.plane(3); for (let k = 0; k < 3; k++) barristerBack(s, 520 + k * 150, 520, 40, { tilt: (k - 1) * .05 });
  // the couple behind their own table, right, turned toward the bench
  person(s, 1330, 452, 40, { who: 'she', turn: -.55 });
  person(s, 1500, 458, 41, { who: 'he', turn: -.6 });
  s.plane(4); table(s, 1090, 1800, 560, 34, 760);
  gesture(s, [[1000, 640], [1290, 555], [1700, 600]], C.white, .3);
  gesture(s, [[860, 70], [850, 330]], C.white, .25);
}
function dynWide(s, t, sh) {
  s.at(sh.t - PRE, BUILD);
  // the stacks of paper rise from "longest" on
  const u = ease(t, on(111, 'longest'), on(111, 'made') + .5);
  s.plane(5); [[1110, 34], [1192, 26], [1610, 40], [1692, 30]].forEach(([x, h], k) => stack(s, x, 594, 70, h + u * (90 + k * 26), { folder: [C.blue, null, C.redD, null][k] }));
  // the clock's hands spin and the calendar sheds pages, faster and faster
  s.plane(2); const v = Math.max(0, t - on(111, 'was')), spin = v * v * 3.2;
  const ha = -Math.PI / 2 + spin * .6, ma = -Math.PI / 2 + spin * 6;
  s.line([[CLOCK.x, CLOCK.y], [CLOCK.x + Math.cos(ha) * CLOCK.r * .5, CLOCK.y + Math.sin(ha) * CLOCK.r * .5]], 7, C.ink, .95, PASS.DARK);
  s.line([[CLOCK.x, CLOCK.y], [CLOCK.x + Math.cos(ma) * CLOCK.r * .8, CLOCK.y + Math.sin(ma) * CLOCK.r * .8]], 4.5, C.ink, .95, PASS.DARK);
  const rate = (x) => x * x * 7, pages = Math.floor(rate(v));
  const day = (k) => String(((k + 11) % 31) + 1);
  s.ground(rectPoly(CAL.x - CAL.w / 2, CAL.y - CAL.h / 2, CAL.x + CAL.w / 2, CAL.y + CAL.h / 2), C.white, .95);
  s.text(day(pages), CAL.x, CAL.y + 6, 58, C.ink, .95, PASS.DARK);
  // the two most recent pages flip up over the top of the pad and fall away behind it
  for (let k = Math.max(0, pages - 2); k < pages; k++) {
    const tk = Math.sqrt((k + 1) / 7), age = (v - tk) / .22; if (age < 0 || age > 1) continue;
    const sq = Math.cos(age * Math.PI); // the page folds up: its height squashes to zero and flips
    const top = CAL.y - CAL.h / 2, hh = CAL.h * sq;
    s.ground([[CAL.x - CAL.w / 2, top], [CAL.x + CAL.w / 2, top], [CAL.x + CAL.w / 2 + age * 10, top + hh], [CAL.x - CAL.w / 2 - age * 10, top + hh]], age < .5 ? C.white : C.cream, .95);
    if (age < .45) s.text(day(k), CAL.x, top + hh * .55, 58 * Math.max(.1, sq), C.ink, .9, PASS.DARK);
  }
}

// ---------- B. the empty jury box (264.98, line start) ----------
function buildJury(s, sh) {
  s.at(sh.t - PRE, BUILD);
  s.plane(0); panels(s, -20, 0, W + 20, 330, 9, { rail: .7 });
  s.plane(1);
  // two tiers of green leather benches, empty, inside the box
  for (let row = 0; row < 2; row++) {
    const y = 250 + row * 130, x0 = 240 - row * 40, x1 = 1680 + row * 40;
    s.ground(rectPoly(x0, y - 70, x1, y), C.greenD, .9);
    s.hatch(rectPoly(x0, y - 70, x1, y), 1.45, 14, 18, C.green, .85);
    s.ground(rectPoly(x0 - 10, y, x1 + 10, y + 30), C.green, .95);
    s.hatch(rectPoly(x0 - 10, y, x1 + 10, y + 30), .05, 8, 12, C.greenL, .7);
    for (let k = 1; k < 6; k++) { const px = lerp(x0, x1, k / 6); s.line([[px, y - 70], [px, y + 30]], 4, C.oakD, .7); } // arm rests: six empty places a row
    s.line([[x0, y + 32], [x1, y + 32]], 4, C.ink, .7);
  }
  s.plane(2); woodFront(s, 140, 440, 1780, 760, 6);
  gesture(s, [[120, 180], [1800, 170]], C.white, .25);
  // "no jury": a cool light falls across the empty seats
  s.at(on(112, 'no', 0) - .02, .5); s.plane(3);
  s.hatch([[720, 120], [950, 120], [1310, 440], [1000, 440]], -.85, 34, 22, C.white, .3, PASS.SCUMBLE);
}

// ---------- C. the couple alone at their table (266.96, line start) ----------
function buildCouple(s, sh) {
  s.at(sh.t - PRE, BUILD);
  s.plane(0); panels(s, -20, 0, W + 20, 420, 8);
  s.plane(1); person(s, 760, 300, 72, { who: 'she', turn: .2, mouth: 'down' });
  person(s, 1110, 306, 74, { who: 'he', turn: -.15, mouth: 'down' });
  s.plane(2); table(s, 380, 1840, 520, 50, 800);
  s.plane(3); stack(s, 420, 566, 120, 150, { folder: C.blue }); stack(s, 560, 566, 110, 110);
  stack(s, 1280, 566, 120, 130); stack(s, 1410, 566, 100, 90, { folder: C.redD });
  gesture(s, [[600, 140], [950, 120], [1300, 150]], C.white, .25);
  // "no legal aid": the empty chair at the end of their table, where counsel would sit
  s.at(on(112, 'no', 1) - .02, .45);
  s.plane(1); chair(s, 1640, 530, 150);
  s.plane(3); s.oval(1640, 400, 120, 150, 3, C.white, .5, PASS.LINE, .1, .95);
}

// ---------- D. the king's side (268.46, line start) ----------
function buildKing(s, sh) {
  s.at(sh.t - PRE, BUILD);
  s.plane(0); panels(s, -20, 0, W + 20, 380, 10);
  // two rows of wigged counsel either side of an empty place
  s.plane(1); for (const x of [230, 420, 1500, 1690]) barrister(s, x, 150, 42, { turn: x < 960 ? .3 : -.3 });
  s.plane(2); for (const x of [330, 560, 1360, 1590]) barrister(s, x, 300, 50, { turn: x < 960 ? .25 : -.25 });
  s.plane(4); woodFront(s, 60, 470, 1860, 760, 8);
  // the king sits down among them on "king"
  s.at(on(113, 'king') - .02, .5);
  s.plane(3); king(s, 960, 215, 70);
}
function dynKing(s, t, sh) {
  // money bags pile up on the table from "30" to "spend"
  const t0 = on(113, '30') - .04, t1 = on(113, 'spend') + .2;
  const spots = [[860, 452], [1060, 452], [960, 452], [760, 456], [1160, 456], [910, 395], [1010, 395], [660, 460], [1260, 460], [810, 400], [1110, 400], [960, 340], [560, 462], [1360, 462], [710, 405], [1210, 405]];
  const n = Math.floor(lerp(0, spots.length, clamp((t - t0) / (t1 - t0))) + (t >= t0 ? 1 : 0));
  s.at(t0 - 1, .01);
  for (let k = 0; k < Math.min(n, spots.length); k++) {
    s.plane(spots[k][1] < 420 ? 5 : 6);
    const tk = t0 + k / spots.length * (t1 - t0), drop = 1 - ease(t, tk, tk + .12);
    sack(s, spots[k][0], spots[k][1] - drop * 60, 50 + (k % 3) * 5);
  }
}

// ---------- E. counsel loom over the couple (272.22, line start) ----------
function buildLoomBase(s, sh) {
  s.at(sh.t - PRE, BUILD);
  s.plane(0); panels(s, -20, 0, W + 20, 380, 9, { col: C.oakD, ga: .4 });
  s.plane(1); person(s, 1270, 400, 52, { who: 'she', turn: -.5, mouth: 'down' });
  person(s, 1460, 408, 54, { who: 'he', turn: -.55, mouth: 'down' });
  s.plane(2); table(s, 1060, 1860, 560, 40, 800);
  s.plane(3); stack(s, 1100, 600, 100, 80); stack(s, 1640, 600, 110, 100, { folder: C.blue });
}
function dynLoom(s, t, sh) {
  s.at(sh.t - PRE, BUILD);
  const lean = ease(t, on(114, 'crush') - .05, on(114, 'crush') + .55); // they bear down on "crush"
  const def = ease(t, on(114, 'defend') - .05, on(114, 'defend') + .4); // the couple lift their chins on "defend"
  // their shadow over the couple's table
  s.plane(3); s.smudge([[900, 0], [1300 + lean * 260, 0], [1500 + lean * 300, 700], [1000, 700]], C.ink, .25 + .2 * lean);
  [[300, 230, 92, .1], [620, 170, 104, .16], [900, 250, 88, .22]].forEach(([x, y, r, a], k) => {
    s.plane(4 + k);
    s.save(); s.translate(x, 800); s.rotate(a * lean * 1.4 + k * .02); s.translate(-x, -800);
    barrister(s, x, y, r, { turn: .5, head: { mouth: k === 1 ? 'open' : 'down' } });
    s.restore();
  });
  s.plane(2);
  if (def > 0) { // a light along the couple's faces as they look up
    s.stick([[1225, 360 - def * 8], [1240, 420 - def * 8]], 12, C.skinL, .8 * def, PASS.LIGHT);
    s.stick([[1415, 368 - def * 8], [1430, 428 - def * 8]], 12, C.skinL, .8 * def, PASS.LIGHT);
  }
}

// Rubbed panelling: a smooth rubbed tone first (fills the tooth), then a few firm vertical strokes and
// panel seams on top. Light diagonal hatching over the blue paper read as rain/static (v1), so none here.
function panelWall(s, x0, y0, x1, y1, col = C.oak, n = 3) {
  const R = rectPoly(x0, y0, x1, y1);
  s.smudge(R, col, .62);
  s.hatch(R, 1.57, 46, 20, col, .78, PASS.LAYIN, .05);
  for (let k = 1; k < n; k++) { const px = lerp(x0, x1, k / n); s.line([[px, y0], [px + 3, y1]], 4, C.oakD, .55); }
}

// ---------- F. the public gallery fills (275.54, line start) ----------
function buildGallery(s, sh) {
  s.at(sh.t - PRE, BUILD);
  s.plane(0); panelWall(s, 0, 0, W, 330, C.oakD, 8);
  s.plane(2); woodFront(s, -10, 320, W + 10, 420, 10, { col: C.oakL }); // the gallery rail
  for (let k = 0; k < 24; k++) { const px = 40 + k * 80; s.line([[px, 330], [px, 410]], 5, C.oakD, .6); } // balusters
  s.smudge(rectPoly(0, 420, W, 760), C.oakD, .5); // the floor below the rail, rubbed
}
function dynGallery(s, t, sh) {
  s.at(sh.t - PRE, BUILD);
  const u = .12 + .88 * ease(t, sh.t + .2, on(115, 'loud') + .2);
  s.plane(1); crowd(s, 0, W, 268, 2, 40, u, 7);
  s.plane(3);
  // she stands at her table and speaks; on "truth" she holds up the fact sheet
  const sp = on(115, 'speak'), tr = on(115, 'truth');
  const mouth = t >= sp && t < on(115, 'loud') + .5 && Math.floor((t - sp) * 7) % 2 === 0 ? 'open' : 'flat';
  person(s, 560, 330, 92, { who: 'she', turn: .25, mouth: t >= sp ? (mouth === 'open' ? 'open' : 'o') : 'flat', tilt: -.05 });
  const up = ease(t, tr - .1, tr + .25);
  // her arm and the sheet
  const hx = lerp(720, 860, up), hy = lerp(640, 300, up);
  s.stick([[680, 520], [lerp(720, 790, up), lerp(600, 430, up)], [hx, hy + 30]], 44, C.teal, .9);
  s.plane(4); s.save(); s.translate(hx + 20, hy - 120); s.rotate(lerp(.3, .06, up));
  s.ground(rectPoly(-10, 0, 190, 250), C.white, .95);
  s.hatch(rectPoly(-10, 0, 190, 250), .02, 9, 13, C.white, .9);
  for (let k = 0; k < 10; k++) s.line([[10, 30 + k * 21], [k % 4 === 3 ? 110 : 170, 30 + k * 21]], 3, C.grey, .55); // typed lines, too small to read
  s.line([[-10, 0], [190, 0], [190, 250], [-10, 250], [-10, 0]], 3, C.paperS, .8);
  s.restore();
  s.plane(5); mitten(s, hx, hy + 30, 34, -1.4);
  if (t >= on(115, 'out')) { // "out loud": sound lines from her mouth, as a sketch artist would jot them
    const k = ease(t, on(115, 'out'), on(115, 'loud') + .3);
    for (let j = 0; j < 3; j++) s.line([[640 + j * 10, 330 + (j - 1) * 30], [640 + j * 10 + 70 * k, 330 + (j - 1) * 50 * k]], 4, C.white, .6, PASS.LINE);
  }
}

// ---------- G. the doors open on the press (278.65, line start) ----------
function buildDoors(s, sh) {
  s.at(sh.t - PRE, BUILD);
  // outside: daylight on the steps
  s.plane(0);
  s.smudge(rectPoly(500, 30, 1420, 760), C.cream, .6);
  s.hatch(rectPoly(500, 30, 1420, 400), -.35, 60, 30, C.white, .4, PASS.SCUMBLE, .1);
  s.hatch(rectPoly(500, 400, 1420, 760), .05, 46, 22, C.goldL, .35, PASS.SCUMBLE, .1);
  for (let k = 0; k < 4; k++) s.line([[500, 560 + k * 46], [1420, 560 + k * 46]], 4, C.paperS, .6); // the steps
  // inside: panelling, the door frame and the two open leaves
  s.plane(2);
  panels(s, -20, 0, 470, 760, 2); panels(s, 1450, 0, W + 20, 760, 2);
  s.ground([[430, 10], [520, 36], [520, 760], [430, 790]], C.oakD, .95); s.ground([[1400, 36], [1490, 10], [1490, 790], [1400, 760]], C.oakD, .95);
  s.hatch([[430, 10], [520, 36], [520, 760], [430, 790]], 1.5, 14, 18, C.oak, .6); s.hatch([[1400, 36], [1490, 10], [1490, 790], [1400, 760]], 1.5, 14, 18, C.oak, .6);
  s.stick([[480, 30], [1440, 30]], 26, C.oakD, .95);
  s.line([[520, 44], [1400, 44]], 3, C.ochre, .6, PASS.LIGHT);
}
function dynDoors(s, t, sh) {
  const tv = on(116, 'TV'), np = on(116, 'newsprint'), net = on(116, 'internet'), cr = on(116, 'crowds');
  s.plane(1);
  if (t >= tv - .04) { // a TV camera on a tripod, the cameraman behind it
    s.at(tv - .04, .35);
    torso(s, 640, 330, 150, 230, C.navy, C.ink, {});
    head(s, 640, 278, 44, { turn: .6, hairCol: C.hair });
    s.ground(rectPoly(680, 220, 860, 320), C.ink, .95, PASS.DARK); s.hatch(rectPoly(680, 220, 860, 320), 0, 12, 16, C.grey, .7);
    s.stick([[700, 232], [820, 232]], 10, C.gownL, .8, PASS.LIGHT);
    s.ground(ovalPoly(878, 270, 36, 44), C.gownL, .95); s.oval(878, 270, 36, 44, 6, C.ink, .95); s.oval(878, 270, 18, 24, 4, C.glowB, .9);
    for (const a of [-.32, 0, .32]) s.line([[770, 326], [770 + Math.sin(a) * 220, 600]], 7, C.ink, .9);
  }
  if (t >= np - .04) { // reporters holding up newspapers (columns of scribble, no words)
    s.at(np - .04, .35);
    for (const [x, y, r, hc] of [[1010, 300, .05, C.sandy], [1190, 330, -.08, C.ink]]) {
      head(s, x, y - 60, 40, { turn: 0, hairCol: hc });
      s.save(); s.translate(x, y); s.rotate(r);
      s.ground(rectPoly(-105, -40, 105, 190), C.cream, .95); s.hatch(rectPoly(-105, -40, 105, 190), .02, 9, 13, C.white, .8);
      s.ground(rectPoly(-92, -28, 92, 10), C.ink, .9, PASS.DARK);
      s.ground(rectPoly(-92, 24, -10, 90), C.grey, .7);
      for (let k = 0; k < 11; k++) { if (k > 4) s.line([[-92, 24 + k * 14], [-10, 24 + k * 14]], 3, C.grey, .65); s.line([[10, 24 + k * 14], [92, 24 + k * 14]], 3, C.grey, .65); }
      s.line([[-105, -40], [105, -40], [105, 190], [-105, 190], [-105, -40]], 3, C.paperS, .8);
      s.restore();
      mitten(s, x - 112, y + 60, 30, -1.6); mitten(s, x + 112, y + 60, 30, -1.5);
    }
  }
  if (t >= net - .04) { // a monitor, glowing, a crowd of small faces on its screen
    s.at(net - .04, .35);
    s.ground(rectPoly(1250, 400, 1400, 520), C.cream, .95); s.hatch(rectPoly(1250, 400, 1400, 520), .05, 10, 14, C.cream, .8);
    s.line([[1250, 400], [1400, 400], [1400, 520], [1250, 520], [1250, 400]], 4, C.paperS, .9);
    s.ground(rectPoly(1264, 412, 1386, 500), C.glowB, .95);
    s.smudge(ovalPoly(1325, 456, 150, 110), C.glow, .45);
    for (let j = 0; j < 3; j++) for (let k = 0; k < 5; k++) { s.stick([[1276 + k * 23, 424 + j * 26], [1279 + k * 23, 432 + j * 26]], 12, C.skinL, .95, PASS.LIGHT); s.stick([[1272 + k * 23, 418 + j * 26], [1284 + k * 23, 418 + j * 26]], 6, C.navy, .9, PASS.LAYIN); }
    s.ground(rectPoly(1300, 520, 1350, 550), C.cream, .9); s.ground(rectPoly(1270, 548, 1380, 562), C.cream, .9);
  }
  if (t >= cr - .2) { // the crowd fills the steps
    s.at(cr - .2, .01);
    const u = ease(t, cr - .1, cr + .5);
    crowd(s, 520, 1400, 640, 2, 34, u, 13);
  }
}

// ---------- H. the judge, close (282.23, line start) ----------
function buildJudgeClose(s, sh) {
  s.at(sh.t - PRE, .45);
  s.plane(0);
  s.ground([[600, 0], [1320, 0], [1340, 560], [580, 560]], C.greenD, .7);
  s.hatch([[600, 0], [1320, 0], [1340, 560], [580, 560]], 1.45, 22, 26, C.green, .75);
  panelWall(s, 0, 0, 600, 760);
  panelWall(s, 1320, 0, W, 760);
  s.plane(1); judge(s, 960, 250, 116, { turn: .15 });
  s.plane(2); woodFront(s, 300, 610, 1620, 800, 5, { edge: C.oakL });
  gesture(s, [[560, 640], [1360, 630]], C.white, .3);
  s.at(on(117, 'end'), .4); s.plane(1);
  s.smudge(ovalPoly(1060, 330, 80, 150), C.ink, .22); // "end": the shadow under the wig deepens
}

// ---------- I. the judge and the couple (284.15, line start) ----------
function buildAgree(s, sh) {
  s.at(sh.t - PRE, BUILD);
  s.plane(0); panels(s, -20, 0, W + 20, 560, 9);
  s.plane(2); woodFront(s, 200, 400, 1100, 560, 4);
  s.plane(4); table(s, 1050, 1860, 590, 34, 800);
  s.plane(5); stack(s, 1640, 624, 100, 110, { folder: C.blue }); stack(s, 1750, 624, 80, 80);
}
function dynAgree(s, t, sh) {
  s.at(sh.t - PRE, BUILD);
  const ag = on(118, 'agreed'), k = clamp((t - ag) / .8), nod = t > ag ? Math.sin(k * TAU * 1.5) * (1 - k) * .14 : 0;
  s.plane(1); s.save(); s.translate(640, 340); s.rotate(.06); s.translate(-640, -340);
  judge(s, 640, 190, 72, { turn: .45, tilt: .1 + nod });
  s.restore();
  const cu = on(118, 'couple');
  if (t >= cu - .04) { s.at(cu - .04, .35); s.plane(3); person(s, 1290, 470, 48, { who: 'she', turn: -.6, tilt: -.12 }); person(s, 1470, 476, 50, { who: 'he', turn: -.65, tilt: -.12 }); }
}

// ---------- J. their view of: five exhibits on the easel (287.35 - 296.2) ----------
function buildEasel(s, sh) {
  s.at(sh.t - .5, .01);
  s.plane(0); panels(s, -20, 0, W + 20, 760, 9, { col: C.oakD, ga: .45 });
  // the easel's legs, seen below the board and at its top
  s.plane(1); s.line([[700, 720], [742, 655]], 16, C.oakD, .95); s.line([[1220, 720], [1178, 655]], 16, C.oakD, .95); s.line([[960, 655], [960, 720]], 14, C.oakD, .9);
  s.stick([[590, 670], [1330, 670]], 24, C.oak, .95); // ledge
}
// each exhibit card is set on the easel at the start of its line (it slides in from the right), and
// its picture is drawn on when the noun is sung
function board(s, t, sh) {
  const dx = (1 - ease(t, sh.t - .06, sh.t + .2)) * 900;
  s.translate(dx, 0);
  s.plane(2);
  s.smudge(rectPoly(560, 40, 1360, 650), C.white, .55);
  s.hatch(rectPoly(560, 40, 1360, 650), .25, 70, 30, C.white, .35, PASS.SCUMBLE, .05);
  s.line([[560, 40], [1360, 40], [1360, 650], [560, 650], [560, 40]], 6, C.white, .85);
  s.line([[566, 656], [1366, 656], [1366, 46]], 4, C.ink, .5);
  s.ground(rectPoly(930, 22, 990, 60), C.grey, .95, PASS.DARK); // clip
}
function exhibit(kind) {
  return (s, t, sh) => {
    s.at(sh.t - 1, .01); board(s, t, sh);
    const w = sh.noun; s.at(w - .03, .45); s.plane(3);
    if (kind === 'greed') { // a fat hand in an ermine cuff grabbing at a heap of gold coins
      const coins = [[700, 600], [790, 600], [880, 600], [970, 600], [1060, 600], [1150, 600], [1240, 600], [745, 560], [835, 560], [925, 560], [1015, 560], [1105, 560], [1195, 560], [790, 520], [880, 520], [970, 520], [1060, 520], [1150, 520], [835, 480], [925, 480], [1015, 480], [1105, 480], [880, 440], [970, 440], [1060, 440]];
      for (const [x, y] of coins) { s.ground(ovalPoly(x, y, 48, 22), C.gold, .95); s.hatch(ovalPoly(x, y, 48, 22), .1, 9, 12, C.gold, .9); s.oval(x, y, 48, 22, 4, C.goldD, .85); s.stick([[x - 28, y - 7], [x + 4, y - 11]], 8, C.goldL, .95, PASS.LIGHT); }
      s.plane(4);
      s.ground(rectPoly(860, 40, 1080, 170), C.redD, .95); s.hatch(rectPoly(860, 40, 1080, 170), 1.3, 18, 24, C.red, .85); // sleeve
      s.ground(rectPoly(840, 150, 1100, 215), C.white, .95); s.hatch(rectPoly(840, 150, 1100, 215), 0, 12, 16, C.white, .9);
      for (let k = 0; k < 5; k++) s.stick([[865 + k * 52, 172], [868 + k * 52, 192]], 10, C.ink, .9, PASS.DARK); // ermine cuff
      grabHand(s, 970, 400, 200);
    } else if (kind === 'workers') { // tired workers in paper caps behind a counter, heads down
      for (let k = 0; k < 4; k++) {
        const x = 680 + k * 186;
        torso(s, x, 330, 160, 220, C.greyL, C.grey, {});
        head(s, x, 270, 50, { tilt: .4, turn: .1, mouth: 'down', hairCol: [C.hair, C.sandy, C.ink, C.auburn][k] });
        s.ground([[x - 56, 228], [x + 44, 206], [x + 36, 178], [x - 50, 196]], C.white, .95); // paper cap
        s.line([[x - 56, 228], [x + 44, 206]], 3, C.paperS, .8);
      }
      s.plane(4); woodFront(s, 590, 470, 1330, 640, 4, { col: C.grey, edge: C.white });
    } else if (kind === 'wealth') { // a crown on a tall stack of gold
      for (let k = 0; k < 8; k++) { const y = 630 - k * 44; s.ground(rectPoly(800, y - 38, 1120, y), C.gold, .95); s.hatch(rectPoly(800, y - 38, 1120, y), .02, 10, 14, C.gold, .9); s.line([[800, y], [1120, y]], 4, C.goldD, .85); s.stick([[820, y - 28], [920, y - 30]], 9, C.goldL, .95, PASS.LIGHT); }
      s.plane(4); crown(s, 960, 268, 230);
    } else if (kind === 'torture') { // a brown hen squeezed in a small wire cage: plain, no injury shown
      s.ground(ovalPoly(940, 430, 190, 130), C.oakL, .95);
      s.hatch(ovalPoly(940, 430, 190, 130), .4, 18, 26, C.ochre, .9);
      s.hatch(ovalPoly(880, 460, 130, 80), .5, 20, 22, C.oak, .7); // wing
      s.ground([[1070, 340], [1150, 280], [1190, 360], [1120, 400]], C.oakL, .95); s.hatch([[1070, 340], [1150, 280], [1190, 360], [1120, 400]], .4, 14, 20, C.ochre, .9);
      s.stick([[1130, 272], [1172, 266]], 22, C.red, .95); // comb
      s.ground([[1186, 330], [1232, 342], [1186, 352]], C.gold, .95); // beak
      s.stick([[1158, 318], [1163, 320]], 11, C.ink, .95, PASS.DARK);
      s.plane(4);
      for (let k = 0; k <= 9; k++) s.line([[640 + k * 64, 230], [640 + k * 64, 600]], 7, C.grey, .95); // the wire, tight around her
      s.line([[630, 230], [1230, 230]], 8, C.grey, .95); s.line([[630, 600], [1230, 600]], 8, C.grey, .95);
    } else { // health: a heart, the pulse line dropping
      const hp = []; for (let k = 0; k <= 40; k++) { const a = k / 40 * TAU; hp.push([960 + 170 * Math.pow(Math.sin(a), 3), 330 - (135 * Math.cos(a) - 52 * Math.cos(2 * a) - 21 * Math.cos(3 * a) - 10 * Math.cos(4 * a))]); }
      s.ground(hp, C.red, .95); s.hatch(hp, -.8, 18, 26, C.red, .9); s.hatch(hp.slice(0, 22), -.8, 22, 20, C.redD, .5);
      s.stick([[880, 250], [910, 220]], 14, C.redL, .9, PASS.LIGHT);
      s.line([[620, 580], [790, 580], [820, 520], [850, 630], [880, 580], [1040, 580], [1080, 605], [1300, 620]], 7, C.ink, .9);
    }
  };
}

// ---------- K. the gavel (296.40, line start) ----------
// (A British judge does not use a gavel; the storyboard asks for one, as the allegory's verdict.)
const GAV = { sx: 1140, sy: 390 }; // the judge's shoulder
function buildGavelBase(s, sh) {
  s.at(sh.t - PRE, BUILD);
  s.plane(0);
  s.ground([[700, 0], [1220, 0], [1240, 520], [680, 520]], C.greenD, .7);
  s.hatch([[700, 0], [1220, 0], [1240, 520], [680, 520]], 1.45, 22, 26, C.green, .75);
  panelWall(s, 0, 0, 680, 760);
  panelWall(s, 1240, 0, W, 760);
  s.plane(1); judge(s, 960, 230, 92, { turn: .1, mouth: 'down' });
  s.plane(2); woodFront(s, 200, 610, 1720, 800, 6, { edge: C.oakL });
  s.plane(3); s.ground(ovalPoly(1480, 612, 96, 24), C.oakD, .95); s.line([[1386, 612], [1576, 612]], 4, C.ochre, .6, PASS.LIGHT); // the block
}
function gavelAngle(t) {
  // up to the strike on "guilty", up again, down on "fuss"
  const g1 = on(124, 'guilty'), g2 = on(124, 'fuss');
  const up = -1.15, down = .62;
  if (t < g1 - .5) return lerp(.45, up, ease(t, lineStart(124), g1 - .5));
  if (t < g1) return lerp(up, down, Math.pow(clamp((t - (g1 - .09)) / .09), 2));
  if (t < g2 - .55) return lerp(down, up, ease(t, g1 + .15, g2 - .55));
  if (t < g2) return lerp(up, down, Math.pow(clamp((t - (g2 - .09)) / .09), 2));
  return down;
}
function dynGavel(s, t, sh) {
  s.at(sh.t - PRE, BUILD); s.plane(4);
  const a = gavelAngle(t), L = 330;
  const hx = GAV.sx + Math.cos(a) * L, hy = GAV.sy + Math.sin(a) * L;
  s.stick([[GAV.sx, GAV.sy], [lerp(GAV.sx, hx, .5), lerp(GAV.sy, hy, .5) - 14], [lerp(GAV.sx, hx, .85), lerp(GAV.sy, hy, .85)]], 92, C.red, .95); // the sleeve
  s.stick([[lerp(GAV.sx, hx, .8), lerp(GAV.sy, hy, .8)], [lerp(GAV.sx, hx, .92), lerp(GAV.sy, hy, .92)]], 80, C.white, .95); // the cuff
  // the gavel: handle in the fist, head at the far end, striking down
  const ca = Math.cos(a), sa = Math.sin(a);
  gavel(s, hx + ca * 120, hy + sa * 120 - 10, 90, a + Math.PI / 2);
  s.stick([[hx - ca * 10, hy - sa * 10], [hx + ca * 120, hy + sa * 120]], 16, C.oakD, .95);
  mitten(s, hx - ca * 30, hy - sa * 30, 62, a);
  for (const g of [on(124, 'guilty'), on(124, 'fuss')]) {
    const k = clamp((t - g) / .35);
    if (t >= g && k < 1) for (let j = 0; j < 5; j++) { const aa = -Math.PI * (.12 + j * .19); s.line([[1480 + Math.cos(aa) * (110 + k * 30), 600 + Math.sin(aa) * (40 + k * 20)], [1480 + Math.cos(aa) * (170 + k * 70), 600 + Math.sin(aa) * (90 + k * 50)]], 7, C.white, .85 * (1 - k), PASS.LINE); }
  }
}

// ---------- L. last line: over the couple's shoulders, the judge points (298.98) ----------
function buildYou(s, sh) {
  s.at(sh.t - PRE, BUILD);
  s.plane(0); panels(s, -20, 0, W + 20, 520, 10);
  s.plane(2); woodFront(s, 780, 380, 1760, 560, 5);
}
function dynYou(s, t, sh) {
  s.at(sh.t - PRE, BUILD);
  const yo = on(125, 'you'), p = ease(t, yo - .25, yo + .05);
  s.plane(1); judge(s, 1260, 190, 66, { turn: -.3, tilt: -.06 * p, mouth: 'down' });
  // his arm comes out over the bench, pointing down at them on "you"
  s.plane(3);
  const sx = 1180, sy = 340, ex = lerp(1160, 920, p), ey = lerp(420, 440, p);
  s.stick([[sx, sy], [lerp(sx, ex, .5), lerp(sy, ey, .5) - 20 * p], [ex, ey]], 66, C.red, .95);
  s.stick([[lerp(sx, ex, .84), lerp(sy, ey, .84)], [ex, ey]], 54, C.white, .95);
  mitten(s, ex - 16, ey + 10, 54, Math.PI - .35 + (1 - p) * .9, C.skin, { point: p > .5 });
  // the couple, from behind, big in the foreground
  s.plane(4);
  person(s, 400, 470, 100, { who: 'she', back: true, head: { hairCol: C.auburn, hairL: '#b0674a' } });
  person(s, 690, 486, 104, { who: 'he', back: true, head: { hairCol: C.sandy, hairL: C.cream } });
}

const SHOTS = [
  { t: T0, build: buildWide, dyn: dynWide, cam: [1, 1.04, 1700, 260] },
  { t: lineStart(112), build: buildJury, cam: [1, 1.04, 960, 300] },
  { t: on(112, 'and'), build: buildCouple, cam: [1, 1.03, 1300, 350] },
  { t: lineStart(113), build: buildKing, dyn: dynKing, cam: [1, 1.04, 960, 300] },
  { t: lineStart(114), build: buildLoomBase, dyn: dynLoom, cam: [1, 1.05, 1300, 400] },
  { t: lineStart(115), build: buildGallery, dyn: dynGallery, cam: [1, 1.03, 700, 300] },
  { t: lineStart(116), build: buildDoors, dyn: dynDoors, cam: [1, 1.04, 960, 380] },
  { t: lineStart(117), build: buildJudgeClose, cam: [1, 1.06, 960, 280] },
  { t: lineStart(118), build: buildAgree, dyn: dynAgree, cam: [1, 1.03, 900, 350] },
  { t: lineStart(119), build: buildEasel, dyn: exhibit('greed'), noun: on(119, 'greed'), cam: [1.02, 1.06, 960, 350] },
  { t: lineStart(120), build: buildEasel, dyn: exhibit('workers'), noun: on(120, 'workers'), cam: [1.02, 1.06, 960, 350] },
  { t: lineStart(121), build: buildEasel, dyn: exhibit('wealth'), noun: on(121, 'wealth'), cam: [1.02, 1.06, 960, 350] },
  { t: lineStart(122), build: buildEasel, dyn: exhibit('torture'), noun: on(122, 'torture'), cam: [1.02, 1.06, 960, 350] },
  { t: lineStart(123), build: buildEasel, dyn: exhibit('health'), noun: on(123, 'health'), cam: [1.02, 1.06, 960, 350] },
  { t: lineStart(124), build: buildGavelBase, dyn: dynGavel, hits: [on(124, 'guilty'), on(124, 'fuss')], cam: [1, 1.03, 1300, 450] },
  { t: lineStart(125), build: buildYou, dyn: dynYou, hits: [on(125, 'Libelous')], cam: [1, 1.04, 900, 380] },
];
