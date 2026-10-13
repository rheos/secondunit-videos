// Assembly fixes for draft 4: four replacement shots so no clip is drawn twice (Robin: "the exact same clips coming
// back"). Each replaces a cut whose set-up another shot already drew; the cut lists are patched at the bottom.
'use strict';

// "Tied to the carrot": the knot, huge, the sky-hand's fingers pulling it tight
SU.f_knot = { mode: 'ill', f(q, p, a, T) {
  stripes(C.paper, '#e6d3a8', 150, -.62, 0, C.ochre); cam(960, 560, lerp(1, 1.12, eo(p)));
  const pull = eo(p);
  X.beginPath(); X.moveTo(960, -100); X.lineTo(960, 360); stroke(C.ink, 6, 1); X.beginPath(); X.moveTo(960, -100); X.lineTo(960, 360); stroke(C.ochre, 2.4, 1);
  carrot(960, 470, 3.6, .05 + Math.sin(T * 2.2) * .04);
  const kp = PE(960, 380, 70 - pull * 18, 48 - pull * 12); fillP(kp, C.tan); hatch(kp, 960, 380, 70, .5, 4, C.ink, 1, .6, [10, -8]); iE(960, 380, 70 - pull * 18, 48 - pull * 12, 0, C.ink, 3);
  for (const s of [-1, 1]) { X.beginPath(); X.moveTo(960 + s * 40, 380); X.bezierCurveTo(960 + s * 160, 330, 960 + s * 260, 420, 960 + s * lerp(300, 420, pull), lerp(300, 260, pull)); stroke(C.ink, 5, 1); X.beginPath(); X.moveTo(960 + s * 40, 380); X.bezierCurveTo(960 + s * 160, 330, 960 + s * 260, 420, 960 + s * lerp(300, 420, pull), lerp(300, 260, pull)); stroke(C.ochre, 2, 1);
    X.save(); X.translate(960 + s * lerp(330, 450, pull), lerp(250, 210, pull)); X.scale(s, 1); hand(0, 0, .7, Math.PI * .8); X.restore(); }
  for (let i = 0; i < 3; i++) gc(960, 380, 110 + i * 34 + ((FD * 5) % 34), C.orange, .7, 2);
  lab(1240, 560, 'DOUBLE KNOT', C.ink, .9, 18, 'left', 'alphabetic', 'bold'); lab(1240, 588, 'TIED BY: NOT HIM', C.brick, .9, 15);
  consL([[0, 380, W, 380], [960, 0, 960, H]]); consC([[960, 380, 260]]);
} };

// "Heroes just make believe": the hero from behind, a cardboard flat on braces, labelled as a prop
SU.f_heroFlat = { mode: 'ill', f(q, p, a, T) {
  stripes('#e2d2c4', '#d4bfae', 140, -.62, 0, C.plum); cam(960, 540, lerp(1.1, 1, eo(p)));
  const turn = eo(cl(p / .6)), sx = Math.cos(turn * Math.PI);
  fillP(PR(-200, 900, W + 400, 300), '#8a6a4a'); hatch(PR(-200, 900, W + 400, 300), 960, 1000, 1300, .1, 9, C.ink, .8, .4); iline(-200, 900, W + 200, 900, C.ink, 2.6);
  X.save(); X.translate(960, 900); X.scale(sx, 1);
  if (sx > 0) { const cape = PP([[-120, -620], [120, -620], [300, -80], [-300, -80]]); fillP(cape, C.orange); shade(cape, 0, -350, 300, [20, -20], .8, 6); iP([[-120, -620], [120, -620], [300, -80], [-300, -80]], true, C.ink, 3); traveller(0, 0, 2.2, { hat: false, look: 0, armR: [2.8, 0], armL: [-2.8, 0] }); }
  else { const back = PP([[-300, -900], [300, -900], [300, -40], [-300, -40]]); fillP(back, '#c9a978'); hatch(back, 0, -470, 520, .05, 14, C.brown || '#8a6a4a', 2, .5); hatch(back, 0, -470, 520, Math.PI / 2, 40, C.ink, 1.4, .25); iP(dens([[-300, -900], [300, -900], [300, -40], [-300, -40]], 40, true), true, C.ink, 3);
    for (const bx of [-200, 200]) { const br = PP([[bx, -600], [bx + 20, -600], [bx + 220 * Math.sign(-bx), 0], [bx + 190 * Math.sign(-bx), 0]]); fillP(br, '#8a5530'); iP([[bx, -600], [bx + 20, -600], [bx + 220 * Math.sign(-bx), 0], [bx + 190 * Math.sign(-bx), 0]], true, C.ink, 2.4); fillP(PR(bx - 60, -40, 140, 40), '#5a3a22'); iBox(bx - 60, -40, 140, 40, C.ink, 2); }
    X.scale(-1, 1); const tag = PR(-150, -520, 300, 120); fillP(tag, C.cream); iBox(-150, -520, 300, 120, C.ink, 2.4); lab(0, -470, 'HERO', C.ink, 1, 40, 'center', 'alphabetic', 'bold'); lab(0, -430, 'PROP NO. 12 · CARDBOARD', C.brick, .9, 14, 'center'); }
  X.restore();
  traveller(330, 1000, 1.1, { look: 1, mouth: sing(T) }); cloud(330, 440, .6, { rain: true });
  for (let i = 0; i < 4; i++) gc(960, 450, 360 + i * 40 + ((FD * 6) % 40), C.teal, .35, 1.6);
  consL([[0, 900, W, 900], [960, 0, 960, H]]);
} };

// "A bird in a cage": his own hat, upturned, is the cage; the bird sits inside it
SU.f_hatCage = { mode: 'ill', f(q, p, a, T) {
  stripes(C.paper, '#d9e0cf', 130, -.62, 0, C.sage); cam(960, 560, lerp(1, 1.1, eo(p)));
  const cx = 960, by = 820;
  const brim = PE(cx, by, 420, 70); fillP(brim, '#3d2a1f'); shade(brim, cx, by, 430, [0, -20], .2, 5); iE(cx, by, 420, 70, 0, C.ink, 3.4);
  const crown = PP([[cx - 240, by], [cx - 220, by + 230], [cx, by + 260], [cx + 220, by + 230], [cx + 240, by]]); fillP(crown, '#4b3426'); shade(crown, cx, by + 130, 260, [30, -10], .7, 5); iP([[cx - 240, by], [cx - 220, by + 230], [cx, by + 260], [cx + 220, by + 230], [cx + 240, by]], true, C.ink, 3.2);
  X.beginPath(); wP([[cx - 238, by + 30], [cx + 238, by + 30]], false, 1); stroke(C.ochre, 10, .9);
  bird(cx, by - 120, 1.4, 0);
  X.beginPath(); for (let i = 0; i <= 14; i++) { const t = i / 14, x = cx - 380 + t * 760, top = by - 560 + (1 - Math.sin(Math.PI * t)) * 220; X.moveTo(x + jit(1), by - 10); X.lineTo(x + jit(1), top + 120); X.quadraticCurveTo(x, top, cx + (x - cx) * .1, by - 560); } stroke(C.ink, 3, 1);
  iline(cx, by - 640, cx, by - 560, C.ink, 4); iE(cx, by - 660, 22, 22, 0, C.ink, 3);
  lab(cx + 440, by - 320, 'SONG · 0 DB', C.brick, .95, 18, 'left', 'alphabetic', 'bold'); gc(cx + 80, by - 150, 70, C.brick, .7, 1.6, [4, 6]);
  traveller(260, 1080, 1.2, { look: 1, hat: false, mouth: sing(T) }); cloud(260, 520, .6, { rain: true });
  consL([[0, by, W, by], [cx, 0, cx, H]]); consC([[cx, by - 250, 520]]);
} };

// "I've got to know": the typing dots are standing stones in the snow; the middle one rises and falls
SU.f_dotStones = { mode: 'ill', f(q, p, a, T) {
  stripes('#ebe6da', '#dcd6c6', 150, -.62, 0, C.sky); cam(960, 560, lerp(1.08, 1, eo(p)));
  const g = PR(-200, 760, W + 400, 400); fillP(g, '#fbfbf6'); hatch(g, 960, 900, 1300, .1, 12, C.ink, .8, .2); iline(-200, 760, W + 200, 760, C.ink, 2.4);
  for (let i = 0; i < 3; i++) { const ph = ((T * 2.2) - i * .5), lift = Math.max(0, Math.sin(ph)) * 90, x = 620 + i * 340, y = 600 - lift, st = PE(x, y, 130, 130); fillP(PE(x, 770, 130 - lift * .4, 26), C.ink, .25); fillP(st, '#9a9692'); shade(st, x, y, 140, [26, -26], .7, 5); iE(x, y, 130, 130, 0, C.ink, 3.4); stip(st, x, y, 130, 300, C.ink, .4, 2); }
  traveller(300, 1000, 1.05, { look: 1, mouth: sing(T), armR: [2.6, -1.9] }); phoneBody(325, 640, .12, -.2, (w, h) => appScreen(w, h, T, 'chat')); cloud(300, 470, .55, { rain: true });
  snowFlakes(300, T, '#ffffff', .9, 3);
  lab(960, 960, 'SHE IS TYPING', C.ink, .8, 18, 'center', 'alphabetic', 'bold'); lab(960, 990, 'T+ ' + Math.max(0, T - 379.3).toFixed(1) + ' S', C.brick, .9, 15, 'center');
  consL([[0, 600, W, 600]]);
} };

// (slots now live directly in the act cut lists; see js/acts/act-*.js)
