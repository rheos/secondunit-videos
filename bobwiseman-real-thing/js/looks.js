// Real Thing look tests: real vs fake. The fake = a glossy mid-century tourism brochure; the real = hand-made
// (marker on cardboard, a pencil line). Word times are the per-section MMS alignment of the working lyric
// (work/timing.json, onset-snapped); words on screen are limited to the title until Bob's sheet arrives.
const LOOKS = [
  { id: 'A', name: 'brochure', t0: 25.0, t1: 37.8 },   // verse 1, lines 1-2
  { id: 'B', name: 'placards', t0: 81.3, t1: 93.3 },   // verse 2, lines 1-2
  { id: 'C', name: 'pencil', t0: 130.0, t1: 138.6 },   // bridge
  { id: 'D', name: 'tear', t0: 154.5, t1: 165.85 },    // refrain 3 tail + outro, little Bob walks through
];
const WT = { A_real: 28.72, A_thing: 29.13, A_settle2: 32.64, A_fishless: 33.91, A_lake: 34.65,
  B_real: 84.90, B_thing: 85.31, B_decide: 88.39, B_fair: 91.15,
  C_I: 130.74, C_love: 131.89, C_please: 132.72, C_fake: 134.62,
  D_less: 155.94, D_real: 157.92, D_thing: 158.76, D_outro: 160.6 };

// ---------- A: the brochure (the fake) ----------
const BR = { sky: '#8fcfcf', sky2: '#c9e8dc', sun: '#f0c34a', mtn: '#9f8fbf', mtn2: '#7d6fa6', pine: '#2f6b55', pine2: '#245646', lake: '#3d93bb', lake2: '#5fb0cf', sand: '#ecd9a6', fish: '#ef7f5c', cream: '#f6efdc', grey: '#8d9192' };
function brochureScene(g, t, o = {}) {
  const drain = o.drain || 0, fishOn = o.fishOn == null ? 1 : o.fishOn, S = STYLE.brochure;
  g.fillStyle = BR.cream; g.fillRect(0, 0, W, H);
  // panel: the "photo" of the brochure, rounded corners
  const PX = 90, PY = 80, PW = W - 180, PH = H - 160;
  g.save(); g.beginPath(); g.roundRect(PX, PY, PW, PH, 36); g.clip();
  const sk = g.createLinearGradient(0, PY, 0, 640); sk.addColorStop(0, BR.sky); sk.addColorStop(1, BR.sky2); g.fillStyle = sk; g.fillRect(0, 0, W, H);
  // sun with rays (rays turn slowly: printed, not lit)
  const sx = 1440, sy = 260; g.fillStyle = BR.sun;
  for (let i = 0; i < 14; i++) { const a = i / 14 * TAU + t * .05; g.beginPath(); g.moveTo(sx + Math.cos(a) * 110, sy + Math.sin(a) * 110); g.lineTo(sx + Math.cos(a + .1) * 190, sy + Math.sin(a + .1) * 190); g.lineTo(sx + Math.cos(a - .1) * 190, sy + Math.sin(a - .1) * 190); g.fill(); }
  S.shape(g, circ(sx, sy, 100, 40), lerpCol(BR.sun, '#c9c2a6', drain * .6));
  // mountains
  S.shape(g, [[60, 640], [420, 300], [640, 470], [900, 250], [1240, 560], [1500, 420], [1880, 640]], BR.mtn);
  S.shape(g, [[380, 340], [420, 300], [470, 350], [440, 360]], '#fff');
  S.shape(g, [[850, 300], [900, 250], [955, 310], [915, 318]], '#fff');
  S.shape(g, [[60, 640], [300, 520], [700, 640]], BR.mtn2); S.shape(g, [[1100, 640], [1500, 500], [1880, 640]], BR.mtn2);
  // lake
  const lakeCol = lerpCol(BR.lake, BR.grey, drain), lake2 = lerpCol(BR.lake2, '#9a9d9c', drain);
  g.fillStyle = lakeCol; g.fillRect(0, 630, W, 300);
  g.strokeStyle = lake2; g.lineWidth = 5; g.lineCap = 'round';
  const rip = 1 - drain; for (let i = 0; i < 26; i++) { const yy = 660 + (i % 7) * 34, xx = ((i * 263 + t * 40 * rip) % 1900); g.globalAlpha = .9 * (.25 + .75 * rip); g.beginPath(); g.moveTo(xx, yy); g.lineTo(xx + 70, yy); g.stroke(); }
  g.globalAlpha = 1;
  // pines on both shores
  for (const [x, h] of [[150, 300], [250, 380], [340, 280], [1600, 320], [1700, 400], [1810, 300]]) {
    S.shape(g, rectP(x - 9, 660 - 30, 18, 40), '#6b4a2e');
    for (let k = 0; k < 3; k++) { const yb = 660 - 20 - k * h * .26, wd = 90 - k * 22; S.shape(g, [[x - wd, yb], [x, yb - h * .42], [x + wd, yb]], k % 2 ? BR.pine2 : BR.pine); }
  }
  // the fish: glossy, leaping in perfect arcs (the brochure promise)
  for (let i = 0; i < 5; i++) {
    const per = 2.6, ph = ((t + i * .53) % per) / per, x0 = 380 + i * 270, big = o.bigFish && i === 2;
    const u = clamp(ph * 1.6), hgt = big ? 330 * o.bigFish : 150, y = 700 - Math.sin(u * Math.PI) * hgt, x = x0 + u * 160;
    const vis = fishOn * (u > 0 && u < 1 ? 1 : 0) * (o.fishGone ? 1 - clamp((t - o.fishGone - i * .08) / .12) : 1);
    if (vis <= 0) continue;
    const ang = Math.atan2(-Math.cos(u * Math.PI) * hgt * Math.PI, 160) * .5, s = big ? 1.8 : 1;
    g.save(); g.globalAlpha = vis;
    S.shape(g, xf([[-60, 0], [-20, -26], [30, -22], [60, 0], [30, 20], [-20, 22]], x, y, s, ang), BR.fish);
    S.shape(g, xf([[-58, 0], [-92, -28], [-84, 0], [-92, 28]], x, y, s, ang), BR.fish);
    S.shape(g, xf(circ(36, -6, 5, 10), x, y, s, ang), '#1d2a4a', { line: 0 });
    S.shape(g, xf([[-10, -16], [24, -14], [10, -8]], x, y, s, ang), '#ffd9c6', { line: 0 }); // gloss
    g.restore();
    if (u < .08 || u > .92) { g.strokeStyle = '#fff'; g.lineWidth = 4; for (let k = 0; k < 4; k++) { const a = -Math.PI / 2 + (k - 1.5) * .45; g.beginPath(); g.moveTo(x + Math.cos(a) * 30, 708 + Math.sin(a) * 18); g.lineTo(x + Math.cos(a) * 60, 708 + Math.sin(a) * 40); g.stroke(); } }
  }
  // near shore: the sand path little Bob walks
  S.shape(g, [[0, 860], [W, 830], [W, H], [0, H]], BR.sand);
  if (o.bob) o.bob(g);
  // halftone screen over the print
  tile(g, TEX.dots, 1, 'multiply');
  g.restore();
  // border + a printed caption bar (no words: pictograms only, the lettering waits for Bob's sheet)
  g.strokeStyle = '#1d2a4a'; g.lineWidth = 3; g.beginPath(); g.roundRect(PX, PY, PW, PH, 36); g.stroke();
  tile(g, TEX.grain, 1);
}
function lerpCol(a, b, u) { const p = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)); const A = p(a), B = p(b); return '#' + A.map((v, i) => Math.round(lerp(v, B[i], clamp(u))).toString(16).padStart(2, '0')).join(''); }
function sparkle(g, x, y, r, col = '#fffbe8') { g.fillStyle = col; g.beginPath(); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, rr = i % 2 ? r * .22 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.fill(); }

function lookA(g, t) {
  const push = 1 + ss(25, 37.8, t) * .06;
  g.save(); g.translate(W / 2, H / 2); g.scale(push, push); g.translate(-W / 2, -H / 2);
  const big = ss(WT.A_real - .25, WT.A_real + .1, t) * (1 - ss(WT.A_thing + 1.2, WT.A_thing + 1.9, t));
  const drain = ss(WT.A_lake, WT.A_lake + .7, t);
  brochureScene(g, t, { bigFish: big, fishGone: WT.A_fishless, drain,
    bob: (gg) => bob(gg, 'brochure', lerp(-200, 2150, ss(25.4, 37.6, t) * .5 + (t - 25.4) / 12.2 * .5), 985, .62, t) });
  // the "real thing" glint: four printed sparkles around the big fish
  if (big > .3 && t < WT.A_thing + 1.6) for (let k = 0; k < 4; k++) { const ph = (q8(t) * 4 + k) % 4; sparkle(g, 760 + k * 120 + n1(k, ph) * 40, 360 + (k % 2) * 90, 26 * big * (1 - ph / 4 * .5)); }
  g.restore();
}

// ---------- B: placards (the real, marching) ----------
function sign(g, t, x, y, w, h, rot, body, seed) {
  const S = STYLE.marker;
  S.shape(g, xf(rectP(-9, 0, 18, 520), x, y, 1, rot), '#9a6b3c', { seed: seed + 1, line: 4 });
  S.shape(g, xf(rectP(-w / 2, -h, w, h), x, y, 1, rot), '#e8d7b4', { seed, line: 6 });
  g.save(); g.translate(x, y); g.rotate(rot); body(g, w, h); g.restore();
}
function markerText(g, txt, x, y, size, col = '#141210', t = 0, rot = 0) {
  g.save(); g.translate(x, y); g.rotate(rot + n1(Math.round(q8(t) * 8), 1) * .012); g.font = `${size}px "Marker Felt", "Chalkboard SE", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = col; g.fillText(txt, 0, 0); g.restore();
}
function lookB(g, t) {
  g.drawImage(TEX.board, 0, 0, W, H); tile(g, TEX.board, 1, 'source-over', -t * 30, 0);
  // painted sky band + road
  STYLE.marker.shape(g, [[-20, -20], [W + 20, -20], [W + 20, 520], [-20, 540]], '#9fc3d6', { seed: 3, line: 0 }, t);
  STYLE.marker.shape(g, [[-20, 900], [W + 20, 880], [W + 20, H + 20], [-20, H + 20]], '#6f6a66', { seed: 4, line: 5 }, t);
  const tq = q8(t), march = (t - 81.3) * 60;
  // placards held up from below the frame, bobbing on the step
  const slam = ss(WT.B_real - .2, WT.B_real + .05, t) * (1 - ss(WT.B_thing + 1.3, WT.B_thing + 1.8, t));
  const scaleUp = ss(WT.B_decide - .25, WT.B_decide + .1, t), tip = ss(WT.B_fair - .1, WT.B_fair + .25, t);
  for (let i = 0; i < 6; i++) {
    const x = ((i * 380 - march + 4000) % 2280) - 180, y = 640 + Math.abs(Math.sin(tq * 2.4 * Math.PI + i * 1.3)) * -26, r = Math.sin(tq * 2.4 * Math.PI + i) * .05;
    sign(g, t, x, y, 300, 220, r, (gg, w, h) => {
      const k = i % 3;
      if (k === 0) { STYLE.marker.shape(gg, circ(0, -h / 2, 60, 18), '#c8392b', { seed: i * 7 }, t); STYLE.marker.shape(gg, [[-50, -h / 2 + 40], [50, -h / 2 - 40]], null, { closed: false, line: 12, seed: i }, t); }
      else if (k === 1) { for (let f = 0; f < 2; f++) STYLE.marker.shape(gg, xf([[-40, 0], [-12, -18], [24, -14], [42, 0], [24, 14], [-12, 16]], -50 + f * 100, -h / 2, 1), '#4f7dbd', { seed: i * 9 + f }, t); }
      else STYLE.marker.shape(gg, [[-80, -50], [0, -170], [80, -50]], '#5c9a4f', { seed: i * 11 }, t);
    }, i * 13);
  }
  // little Bob marches with them, his piano carrying its own small sign
  bob(g, 'marker', lerp(-300, 2200, (t - 81.3) / 12), 1010, .72, t);
  // REAL THING: one placard swings up to fill the frame on the word
  if (slam > 0) {
    const s = lerp(.4, 1, easeOut(slam)), y = lerp(H + 300, 990, easeOut(slam));
    g.save(); g.translate(W / 2, y); g.scale(s, s);
    STYLE.marker.shape(g, rectP(-14, 0, 28, 600), '#9a6b3c', { seed: 91, line: 6 }, t);
    STYLE.marker.shape(g, rectP(-700, -760, 1400, 760), '#efe2c2', { seed: 92, line: 9 }, t);
    markerText(g, 'REAL', -10, -560, 300, '#141210', t, -.03); markerText(g, 'THING', 20, -250, 300, '#c8392b', t, .02);
    g.restore();
  }
  // decide / fair: a scale on a placard, tipping hard on "fair"
  if (scaleUp > 0 && t >= WT.B_decide - .25) {
    const y = lerp(H + 400, 960, easeOut(scaleUp)), shake = tip * Math.sin(t * 40) * (1 - ss(WT.B_fair + .3, WT.B_fair + 1.2, t)) * .04;
    g.save(); g.translate(W / 2 + 200, y); g.rotate(-.03 + shake);
    STYLE.marker.shape(g, rectP(-12, 0, 24, 600), '#9a6b3c', { seed: 95, line: 5 }, t);
    STYLE.marker.shape(g, rectP(-460, -640, 920, 640), '#efe2c2', { seed: 96, line: 8 }, t);
    const a = lerp(0, .42, easeOut(tip)), cx = 0, cy = -470;
    STYLE.marker.shape(g, [[cx, cy], [cx, -120]], null, { closed: false, line: 12, seed: 97 }, t);
    STYLE.marker.shape(g, [[-150, -110], [150, -110], [100, -130], [-100, -130]], '#141210', { seed: 98, line: 4 }, t);
    const L = [cx - Math.cos(a) * 300, cy - Math.sin(a) * -300 * -1], R = [cx + Math.cos(a) * 300, cy + Math.sin(a) * 300];
    const Lp = [cx - Math.cos(a) * 300, cy - Math.sin(a) * 300 * -1];
    STYLE.marker.shape(g, [[cx - Math.cos(a) * 300, cy + Math.sin(a) * 300 * -1], R], null, { closed: false, line: 12, seed: 99 }, t);
    for (const [px, py, col, big] of [[cx - Math.cos(a) * 300, cy - Math.sin(a) * 300, '#eab52e', 0], [R[0], R[1], '#4f7dbd', 1]]) {
      STYLE.marker.shape(g, [[px, py], [px - 80, py + 120], [px + 80, py + 120]], null, { line: 5, seed: 100 + big }, t);
      STYLE.marker.shape(g, [[px - 110, py + 120], [px + 110, py + 120], [px + 70, py + 170], [px - 70, py + 170]], col, { seed: 102 + big }, t);
      if (big) STYLE.marker.shape(g, rectP(px - 60, py + 30, 120, 90), '#c8392b', { seed: 104 }, t); // the heavy side: a fat stack
      else STYLE.marker.shape(g, circ(px, py + 106, 14, 10), '#c8392b', { seed: 105 }, t);
    }
    g.restore();
  }
  tile(g, TEX.grain, 1);
}

// ---------- C: pencil (the bridge, quiet) ----------
function heartPts(cx, cy, s, n = 90) { const p = []; for (let i = 0; i <= n; i++) { const a = i / n * TAU; p.push([cx + s * 16 * Math.pow(Math.sin(a), 3), cy - s * (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a))]); } return p; }
function lookC(g, t) {
  g.drawImage(TEX.tooth, 0, 0, W, H); tile(g, TEX.tooth, 1);
  g.fillStyle = 'rgba(240,236,226,.6)'; g.fillRect(0, 0, W, H);
  // one continuous pencil line: in from the left, loops into a heart on "love", runs on
  const lead = [[-40, 700], [200, 680], [420, 720], [560, 640]];
  const hp = heartPts(800, 520, 14), tail = [[1030, 640], [1250, 700], [1500, 690], [1700, 720], [1980, 700]];
  const all = densify(lead.concat(hp.slice(0)).concat(tail), 6, false);
  const prog = clamp(ss(130.0, WT.C_love + .5, t) * .62 + ss(WT.C_love + .5, 138.4, t) * .38);
  const n = Math.max(2, Math.floor(all.length * prog));
  STYLE.pencil.shape(g, all.slice(0, n), null, { closed: false, seed: 7 }, t);
  // pencil tip
  const tip = all[n - 1]; g.fillStyle = 'rgba(50,50,56,.7)'; g.beginPath(); g.arc(tip[0], tip[1], 4, 0, TAU); g.fill();
  // the fake: a glossy red sticker heart slapped on beside it on "please", peels and falls on "fake"
  const on = ss(WT.C_please - .1, WT.C_please + .06, t), peel = ss(WT.C_fake, WT.C_fake + .35, t), fall = clamp((t - WT.C_fake - .3) / 1.4);
  if (on > 0 && fall < 1) {
    const x = 1200 + fall * 120, y = 470 + fall * fall * 900, r = -.08 + peel * .25 + fall * 2.2, s = lerp(1.4, 1, easeOut(on));
    g.save(); g.translate(x, y); g.rotate(r); g.scale(s * (1 - peel * .15), s);
    g.shadowColor = 'rgba(0,0,0,.25)'; g.shadowBlur = 18 + peel * 20; g.shadowOffsetY = 6 + peel * 16;
    STYLE.brochure.shape(g, heartPts(0, 0, 10), '#e0322f', { line: 3 }); g.shadowColor = 'transparent';
    STYLE.brochure.shape(g, [[-90, -70], [-40, -100], [-20, -70], [-70, -40]], '#ff9a8c', { line: 0 });
    sparkle(g, 60, -60, 24);
    g.restore();
  }
  tile(g, TEX.grain, .8);
}

// ---------- D: the tear (fake rips open, the real lake underneath, little Bob walks through) ----------
let BRO = null;
function realLake(g, t) {
  g.drawImage(TEX.board, 0, 0, W, H);
  const M = (p, c, o = {}) => STYLE.marker.shape(g, p, c, o, t);
  M([[-20, -20], [W + 20, -20], [W + 20, 600], [-20, 620]], '#b7c9cf', { line: 0, seed: 1 });
  M([[-20, 640], [300, 380], [560, 560], [900, 330], [1250, 600], [1560, 450], [1940, 640]], '#7a7f8a', { seed: 2 });
  M([[-20, 640], [W + 20, 620], [W + 20, 860], [-20, 880]], '#56717e', { seed: 3 });
  for (let i = 0; i < 9; i++) M([[150 + i * 200, 700 + (i % 3) * 40], [230 + i * 200, 704 + (i % 3) * 40]], null, { closed: false, line: 5, seed: 10 + i });
  for (const x of [120, 260, 1660, 1800]) { M(rectP(x - 8, 560, 16, 90), '#5a3d24', { seed: x }); M([[x - 70, 600], [x, 330], [x + 70, 600]], '#3f5d3a', { seed: x + 1 }); }
  M([[-20, 880], [W + 20, 860], [W + 20, H + 20], [-20, H + 20]], '#8a7556', { seed: 4 });
  // a real fish, just under the surface, small
  const fx = 1100 + Math.sin(t * .8) * 60; M(xf([[-40, 0], [-12, -14], [22, -12], [40, 0], [22, 12], [-12, 14]], fx, 760), '#a07a52', { seed: 30 }); M(xf([[-38, 0], [-60, -18], [-56, 0], [-60, 18]], fx, 760), '#a07a52', { seed: 31 });
}
function tearEdge(seed, prog) { const pts = []; for (let i = 0; i <= 40; i++) { const y = -20 + i / 40 * (H + 40); pts.push([W / 2 + 60 * n1(seed, i * .7) + 24 * n1(seed + 5, i * 2.3) + (y - H / 2) * .08, y]); } return pts; }
function lookD(g, t) {
  if (!BRO) BRO = mkCanvas(W, H);
  const bg = BRO.getContext('2d'); brochureScene(bg, t, { fishOn: 1 });
  const rip = ss(WT.D_real - .1, WT.D_thing + .9, t), start = ss(WT.D_less, WT.D_real - .1, t);
  realLake(g, t);
  // little Bob walks in over the outro, through the gap
  if (t > WT.D_outro - 1.4) bob(g, 'marker', lerp(-320, 2250, (t - (WT.D_outro - 1.4)) / 6.6), 1040, 1.0, t);
  const edge = tearEdge(21, 1), tearLen = start * .35 + rip * .65;
  for (const side of [-1, 1]) {
    const dx = side * easeOut(rip) * 1150, rot = side * easeOut(rip) * .09, dy = easeOut(rip) * 70;
    g.save(); g.translate(W / 2 + dx, H / 2 + dy); g.rotate(rot); g.translate(-W / 2, -H / 2);
    // the torn half: clip to its side of the edge; before the rip only the top of the tear is open
    const cut = edge.map(([x, y], i) => [i / 40 < tearLen ? x : (side < 0 ? W / 2 + 400 : W / 2 - 400) * 0 + (side < 0 ? W + 200 : -200), y]);
    const poly = side < 0 ? [[-200, -20]].concat(cut).concat([[-200, H + 20]]) : [[W + 200, -20]].concat(cut).concat([[W + 200, H + 20]]);
    g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 30; g.shadowOffsetX = side * 10;
    g.beginPath(); path(g, poly); g.save(); g.clip(); g.shadowColor = 'transparent'; g.drawImage(BRO, 0, 0); g.restore();
    // white paper fibre along the torn edge
    g.shadowColor = 'transparent'; g.strokeStyle = '#fbf6ea'; g.lineWidth = 9; g.beginPath(); const op = cut.filter((_, i) => i / 40 < tearLen); if (op.length > 1) { g.moveTo(op[0][0], op[0][1]); for (const p of op) g.lineTo(p[0] + side * 3, p[1]); g.stroke(); }
    g.restore();
  }
  tile(g, TEX.grain, 1);
}

function drawFrame(g, t) {
  const L = LOOKS.find((l) => t >= l.t0 && t < l.t1) || LOOKS[0];
  ({ A: lookA, B: lookB, C: lookC, D: lookD })[L.id](g, t);
}
