// Thirteen shots, one bar each (u = 0..1 inside the bar, t = film seconds). The cable is a list of poses morphed
// in place; the stub is a position, an angle and a face. Exteriors sit inside the same paper frame (seed 11).
'use strict';
const FRAME = paperFrame(11, 44, 28);
const exterior = (fn) => { X.save(); clipTo(FRAME); fn(); X.restore(); };
const AMPTOP = [270, 432];
const coilHome = () => spline(poseCoil(AMPTOP[0], AMPTOP[1], 58, 3, [24, -8]));

const interior = (fn) => { X.save(); stageCam(); fn(); X.restore(); };
const SHOTS = [
  // 0: the stage at night. the cable asleep on the amp, the ghost light on.
  (u, t) => interior(() => { stageScene({ lit: 0 }); X.save(); X.translate(0, Math.sin(t * 2.2) * 2.5); cable(coilHome(), { state: 'sleep', shadow: 1 }); X.restore(); }),

  // 1: the door opens a crack; a stub blows in and lands in the pool of light; the cable wakes.
  (u) => interior(() => {
    const gap = eo(seg(u, 0, .3)); stageScene({ lit: 0, doorGap: gap });
    if (u > .05 && u < .5) { for (let k = 0; k < 3; k++) motionLines(800 - k * 30, 380 + k * 60, Math.PI * .95, 1, 60 + k * 10); }
    const f = seg(u, .22, .62); if (f > 0) {
      const x = lerp(805, 700, eo(f)), y = f < 1 ? lerp(600, 760, f) - Math.sin(f * Math.PI) * 140 : 760, rot = f < 1 ? lerp(2.4, -.12, eo(f)) : -.12;
      stub(x, y, rot, 1, f < 1 ? 'shock' : (u > .85 ? 'happy' : 'calm'), { shadow: f >= 1, curl: f < 1 ? .6 : 0 });
    }
    cable(coilHome(), { state: u < .55 ? 'sleep' : 'calm', shadow: 1, look: u > .55 ? 1 : 0 });
  }),

  // 2: the cable lifts its head and makes a small loop (the symbol, first time); a gust lifts the stub.
  (u) => interior(() => {
    stageScene({ lit: 0, doorGap: .2 });
    const wave = spline(poseCoil(AMPTOP[0], AMPTOP[1] + 6, 54, 2.4, [10, -4]).concat([[380, 380], [430, 330], [470, 360], [440, 410], [400, 390]]));
    const k = spr(seg(u, .05, .45)); const pts = morph(coilHome(), wave, k);
    const gust = seg(u, .6, 1);
    stub(700, 760 - gust * 70, -.12 - gust * .5, 1, u < .6 ? 'happy' : 'worry', { shadow: gust < .3, curl: gust * .9 });
    if (gust > 0) { for (let k2 = 0; k2 < 3; k2++) motionLines(560 - k2 * 40, 700 + k2 * 40, Math.PI * .92, 1, 70); }
    cable(pts, { state: 'calm', shadow: 1, look: 1 });
  }),

  // 3: the stub is sucked out through the door; the cable lunges, hooks the frame, and whips after it.
  (u) => interior(() => {
    stageScene({ lit: 0, doorGap: .3 });
    const f = seg(u, 0, .5); const sx = lerp(700, 822, ei(f)), sy = lerp(690, 560, f), rot = -.6 + f * 3;
    if (f < 1) stub(sx, sy, rot, lerp(1, .7, f), 'shock', { curl: .8 });
    for (let k = 0; k < 4; k++) motionLines(520 - k * 60, 600 + k * 30, Math.PI * .9, 1, 60);
    const hook = spline(poseHook(300, 440, 800, 520, 50));
    const out = spline([[300, 440], [420, 470], [560, 560], [700, 600], [790, 610], [830, 600], [860, 590]]);
    const k1 = spr(seg(u, .15, .55)), k2 = ei(seg(u, .72, 1));
    let pts = morph(coilHome(), hook, k1); if (k2 > 0) pts = morph(pts, out, k2);
    cable(pts, { state: 'calm', shadow: 1, look: 1 });
  }),

  // 4: outside. the alley. the stub tumbles down the alley; the cable drops from the door, bends into a wheel and rolls.
  (u) => exterior(() => {
    alleyScene({ doorGap: .4 });
    const x = lerp(290, 940, eio(u)), bounce = Math.abs(Math.sin(u * Math.PI * 3)) * 90, y = 660 - bounce;
    stub(x, y, u * 9, .9, 'shock', { shadow: bounce < 20, curl: .5 });
    if (bounce < 20) sparkle(x - 90, 680, 12);
    const drop = spline([[190, 480], [200, 540], [230, 600], [250, 640], [270, 660], [300, 660], [330, 650]]);
    const w0 = (ang, cx) => spline(poseWheel(cx, 630, 62, ang, [-110, 20]));
    const k = seg(u, .22, .42), roll = seg(u, .42, 1); const cx = lerp(300, 820, eio(roll));
    let pts = k < 1 ? morph(drop, w0(0, 300), eo(k)) : w0(roll * 9, cx);
    if (roll > 0) motionLines(cx - 60, 640, 0, 3, 60);
    cable(pts, { state: 'calm', shadow: 1, look: 1 });
  }),

  // 5: the parking lot. the stub skates across the puddle on its edge; the cable coils into a spring at the kerb and vaults it.
  (u) => exterior(() => {
    lotScene({ on: 0 });
    const sx = lerp(330, 780, eio(u)), sy = 790 - Math.abs(Math.sin(u * 6)) * 10;
    ellipse(sx, sy + 70, 60, 12, C.ink, .18);
    stub(sx, sy, -1.25, .9, 'shock', { curl: .4 });
    const sq = seg(u, .08, .32), launch = eo(seg(u, .32, .7));
    const base = [200, 528]; const land = [840, 792];
    const px = lerp(base[0], land[0], launch), py = lerp(base[1], land[1], launch) - Math.sin(launch * Math.PI) * 300;
    const sp = (s, cx, cy) => spline(poseSpring(cx, cy, 40, 150, 4, s));
    let pts;
    if (launch <= 0) pts = sp(1 - .55 * eio(sq), base[0], base[1]);
    else if (launch < 1) pts = sp(lerp(.45, 1.3, launch), px, py);
    else { const rest = spline(poseCoil(land[0], land[1], 50, 2.5, [40, -14])); pts = morph(sp(1.3, land[0], land[1]), rest, eo(seg(u, .7, .9))); }
    cable(pts, { state: 'calm', shadow: launch <= 0 || launch >= 1, look: 1 });
    if (launch > 0 && launch < 1) motionLines(px - 20, py + 80, -1.2, 3, 50);
  }),

  // 6: the fence. the stub rises on a gust; the cable grows tall as a pole and bends over the top after it.
  (u) => exterior(() => {
    fenceScene();
    const rise = eio(u); const sx = 540 + Math.sin(u * 7) * 60, sy = lerp(900, 230, rise);
    stub(sx, sy, Math.sin(u * 5) * .6, 1, u < .5 ? 'worry' : 'shock', { curl: .6 });
    for (let k = 0; k < 3; k++) motionLines(sx + 120 + k * 20, sy + 60 + k * 40, -Math.PI / 2, 1, 50);
    const grow = eo(seg(u, 0, .4)); const bend = spr(seg(u, .4, 1));
    const pole = spline(posePole(420, 1000, 120 + 560 * grow, 0));
    const over = spline(poseHook(420, 1000, sx - 40, sy + 40, 70));
    const pts = morph(pole, over, bend);
    cable(pts, { state: 'calm', look: 1 });
  }),

  // 7: the lasso. the sky; the stub big in the middle; the loop closes around it (the symbol, second time).
  (u) => exterior(() => {
    skyScene({ glow: .6 });
    const sx = 560, sy = 470 + Math.sin(u * 4) * 16, rot = -.3 + Math.sin(u * 2.5) * .2;
    const caught = u > .72;
    stub(sx, sy, rot, 2.1, caught ? 'happy' : 'shock', { curl: caught ? 0 : .5 });
    const travel = eo(seg(u, 0, .5)), tight = eo(seg(u, .5, .72));
    const cx = lerp(300, sx, travel), cy = lerp(880, sy, travel);
    const pts = spline(poseLasso(60, 1040, cx, cy, lerp(150, 236, travel) * lerp(1, .95, tight), 1 - tight));
    cable(pts, { state: 'calm', w: 14, look: 1 });
    if (caught && u < .9) { sparkle(sx - 300, sy - 180, 18); sparkle(sx + 300, sy + 150, 14); }
    if (travel < 1) motionLines(cx - 60, cy + 120, -Math.PI * .55, 3, 60);
  }),

  // 8: the swing down. the cable hangs from the fire escape with the stub in its loop; the bulb string lights up.
  (u) => exterior(() => {
    swingScene({ on: eio(seg(u, .25, .95)) });
    const ang = lerp(-1.1, .35, eio(u)); const hx = 760, hy = 120, L = 560;
    const ex = hx + Math.sin(ang) * L, ey = hy + Math.cos(ang) * L;
    const pts = spline([[hx + 40, hy - 10], [hx, hy], [hx + Math.sin(ang) * L * .4, hy + Math.cos(ang) * L * .4], [hx + Math.sin(ang) * L * .8, hy + Math.cos(ang) * L * .8], [ex - 70, ey - 30], [ex - 60, ey + 50], [ex + 40, ey + 60], [ex + 60, ey - 20], [ex, ey - 50]]);
    stub(ex, ey + 10, ang * .5 + .2, 1, 'happy');
    cable(pts, { state: 'calm', look: -1 });
  }),

  // 9: under the door. the cable straightens into a line and tows the stub under the stage door.
  (u) => exterior(() => {
    doorScene({ leak: .9 });
    const k = eio(u);
    X.save(); X.beginPath(); X.rect(0, 690, W, 400); X.clip();
    const tail = [lerp(60, 520, k), lerp(980, 720, k)], head = [lerp(420, 700, k), lerp(860, 700, k)];
    const pts = spline([tail, [lerp(tail[0], head[0], .5), lerp(tail[1], head[1], .5) + 12], head]);
    const sx = lerp(300, 640, k), sy = lerp(900, 704, k), ss = lerp(1, .55, k);
    stub(sx, sy, lerp(.3, 0, k), ss, 'happy', { shadow: 1 });
    cable(pts, { state: 'calm', shadow: 1, look: 1 });
    X.restore();
    doorPanel({ leak: .9 });
    motionLines(tail[0] - 40, tail[1] + 20, -.5, 3, 50);
  }),

  // 10: back inside. the pair come in under the door and cross the stage; the wings begin to glow.
  (u) => interior(() => {
    const lit = .35 * eio(seg(u, .3, 1)); stageScene({ lit, doorGap: 0 });
    const k = eio(u);
    const head = [lerp(560, 400, k), lerp(636, 500, k)], tail = [lerp(900, 620, k), lerp(640, 700, k)];
    const pts = spline([tail, [lerp(tail[0], head[0], .5) + 20, lerp(tail[1], head[1], .5) + 40], head]);
    stub(lerp(870, 640, k), lerp(652, 720, k), lerp(0, -.25, k), lerp(.6, 1, k), 'happy', { shadow: 1 });
    cable(pts, { state: 'calm', shadow: 1, look: -1 });
    for (let k2 = 0; k2 < 2; k2++) motionLines(tail[0] + 60, tail[1] + k2 * 20, -.2, 1, 40);
  }),

  // 11: the job. close on the amp and the guitar: one jack into the guitar, the other into the amp; the pilot lamp comes on.
  (u) => {
    const on = seg(u, .8, .86) > 0; const lit = .35 + .65 * eio(seg(u, .82, 1));
    X.save(); X.translate(540, 540); X.scale(1.55, 1.55); X.translate(-470, -520);
    stageScene({ lit: on ? lit : .35, noGhost: false });
    const j = GUITAR.jack, ampIn = [334, 458];
    const k1 = spr(seg(u, .1, .42)), k2 = spr(seg(u, .48, .78));
    const start = [[560, 720], [520, 700], [470, 650], [440, 600], [420, 560], [400, 520]];
    const plugGuitar = [[560, 720], [540, 700], [560, 640], [600, 610], [640, 590], [j[0] + 42, j[1] + 4]];
    const tailStart = [[560, 720], [560, 720]];
    const A = spline(start), B = spline(plugGuitar);
    let pts = morph(A, B, k1);
    // the tail end swings up into the amp input
    const tailA = [560, 720], tailB = [ampIn[0], ampIn[1] - 6];
    const tx = lerp(tailA[0], tailB[0], k2), ty = lerp(tailA[1], tailB[1], k2) - Math.sin(k2 * Math.PI) * 120;
    if (k2 > 0) pts = spline([[tx, ty], [lerp(tx, 480, .5), Math.max(ty, 560) + 60], [520, 660], [560, 640], [600, 610], [640, 590], [j[0] + 42, j[1] + 4]]);
    stub(660, 720, -.2, 1, on ? 'happy' : 'calm', { shadow: 1 });
    cable(pts, { state: 'calm', shadow: 1, look: 1 });
    if (on && u < .95) { sparkle(392, 436, 14); sparkle(372, 476, 10); }
    X.restore();
  },

  // 12: the stage lit, the same framing as the start. the cable runs guitar to amp with its slack looped around the stub (the symbol, third time), both in the pool of light.
  (u) => interior(() => {
    stageScene({ lit: 1 });
    pool(560, 780, 300, 80, C.amberL, .5);
    stub(560, 770, -.15, 1, u < .5 || u > .62 ? 'happy' : 'blink', { shadow: 1 });
    const pts = spline([[334, 452], [340, 520], [380, 620], [430, 700], [470, 760], [500, 820], [560, 850], [640, 830], [690, 780], [680, 720], [640, 700], [620, 690], [640, 650], [660, 610], [GUITAR.jack[0] + 36, GUITAR.jack[1] + 6]]);
    cable(pts, { state: 'happy', shadow: 1, look: -1 });
    const sig = seg(u, .3, .7); if (sig > 0) { X.globalAlpha = sig; X.fillStyle = C.ink; X.font = '700 24px "Archivo", "Helvetica Neue", Arial, sans-serif'; X.textAlign = 'right'; X.textBaseline = 'alphabetic'; X.fillText('indieagent.ai', 950, 950); X.globalAlpha = 1; }
  }),
];
