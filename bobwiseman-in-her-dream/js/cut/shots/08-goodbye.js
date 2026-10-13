// 124.0-136.84  "(in front of her) eyes / & she don't cry because nobody's gotta say goodbye" + instrumental.
// A: the close profile from 04 (halo, crescent eye); a mint paper tear forms on "don't", a paper bird takes
//    it away on "cry", she smiles.  B: a bus stop; the bus pulls up, the doors fold open on "gotta" and
//    everyone steps OFF on "say goodbye"; nobody gets on and it leaves empty.  C: instrumental, the bus wheel
//    comes loose and blooms into a turning paper rosette that multiplies into a ring (hands off to 09).
(() => {
const T = { eyes: 123.64, she: 126.98, dont: 127.16, cry: 128.10, because: 129.48, nobody: 130.10, gotta: 131.24,
  say: 131.66, bye: 131.94, byeEnd: 133.0, end: 136.84 };
const BEATS = [124.02, 124.81, 125.57, 126.34, 127.11, 127.85, 128.64, 129.40, 130.15, 130.96, 131.70, 132.45, 133.21,
  134.02, 134.77, 135.56, 136.32];

// ---------------- A: her close profile, the tear and the bird ----------------
const A_END = 129.42;
// a paper swallow in side view (faces +x when dir = 1): forked tail, a blade wing each side that beats
const SW_BODY = blob([[-34, 3], [-12, -10], [14, -12], [32, -9], [44, -4], [50, 0], [42, 5], [18, 11], [-10, 10]], .6);
const SW_TAIL = poly([[-26, -2], [-78, -20], [-58, 2], [-80, 18], [-24, 6]]);
const SW_WING = blob([[-10, 0], [14, -2], [6, -26], [-14, -58], [-36, -86], [-26, -46], [-16, -18]], .5);
function swallow(x, y, s, ph, dir = 1) {
  g.save(); g.translate(x, y); g.scale(s * dir, s);
  const f = Math.cos(ph);                      // 1 = wings up, -1 = down
  g.save(); g.translate(8, -4); g.scale(1, f * .9 - .1); cut(SW_WING, C.creamDeep, { sh: .4, grain: .15 }); g.restore();
  cut(SW_TAIL, C.cream, { sh: .5, grain: .15 });
  cut(SW_BODY, C.cream, { sh: .7, grain: .18, lift: .3 });
  g.save(); g.translate(2, -2); g.scale(1, f); cut(SW_WING, C.white, { sh: .6, grain: .15 }); g.restore();
  g.restore();
}
// a paper tear: round at the bottom, pointed at the top (local units, tip at 0,0, length ~1)
function tearPath(x, y, s) {
  return blob([[x, y - 30 * s], [x + 9 * s, y - 6 * s], [x + 14 * s, y + 10 * s], [x, y + 22 * s], [x - 14 * s, y + 10 * s], [x - 9 * s, y - 6 * s]], .55);
}
SHOT(124.0, A_END, 'goodbye-tear', (t) => {
  const A0 = g.globalAlpha;
  sheet(C.rose);
  const hill = (y, amp, ph, col) => { const p = new Path2D(); p.moveTo(-20, H + 20); p.lineTo(-20, y);
    for (let x = 0; x <= W + 40; x += 40) p.lineTo(x, y + Math.sin(x / 260 + ph) * amp); p.lineTo(W + 40, H + 20); p.closePath(); cut(p, col, { sh: .6 }); };
  hill(900, 26, 1.2, '#d9877f'); hill(975, 18, 3.4, '#c9746f');

  // slow push in toward the eye through the held "eyes"; she lifts her chin a touch when she smiles
  const zoom = lerp(1.24, 1.36, eio((t - 124) / 5.4));
  const smile = ss(T.cry + .35, T.cry + .8, t);
  const tilt = -.02 - smile * .05 + Math.sin(t * .6) * .006;
  const ox = 470 - (zoom - 1.24) * 900 + jit(t, 3, .8), oy = -150 - (zoom - 1.24) * 520 + jit(t, 4, .8);
  const toHer = () => { g.translate(ox, oy); g.scale(zoom, zoom); g.translate(560, 900); g.rotate(tilt); g.translate(-560, -900); };

  g.save(); toHer();
  const sunR = 400 + Math.sin(t * .5) * 4;
  cut(circle(470, 470, sunR + 34), C.goldPale, { sh: .5, grain: .25 });
  cut(circle(470, 470, sunR), C.sun, { sh: .6, grain: .25 });
  cut(HEADS.her, C.navy, { sh: 1.2, lift: 1, grain: .3 });
  g.restore();

  // the eye: a relaxed closed lid, crinkling into a smile once the tear is gone
  g.save(); toHer();
  g.strokeStyle = C.rose; g.lineCap = 'round';
  if (smile < .5) { g.lineWidth = 4.5; g.beginPath(); g.arc(706, 452, 13, Math.PI * .1, Math.PI * .9); g.stroke(); }
  else { g.lineWidth = 6.5; g.beginPath(); g.arc(706, 446, 18, Math.PI * .12, Math.PI * .88); g.stroke(); }
  g.restore();

  // the tear: swells at the lid on "she don't", slides down the cheek, the bird takes it on "cry"
  const grow = eo((t - T.she) / .9);
  const slide = eio((t - (T.dont + .55)) / .55);
  const CATCH = T.cry + .28;
  // the bird: in from the upper right, a swoop to the cheek, then away up and out with the tear
  const bIn = clamp((t - (T.cry - .55)) / (CATCH - (T.cry - .55)));
  const bOut = clamp((t - CATCH - .12) / 1.0);
  let bx, by, bdir = -1, bs = 1.25;
  const CX0 = 745 + 56 * bs, CY0 = 572;                 // where the bird hovers: its beak on the tear
  if (bOut <= 0) { const u = eo(bIn); bx = lerp(1300, CX0, u); by = lerp(230, CY0, u) - Math.sin(u * Math.PI) * 60; }
  else { const u = ei(bOut) * .6 + bOut * .4; bdir = 1; bx = lerp(CX0 + 30, 1520, u); by = lerp(CY0, 110, u) - Math.sin(u * Math.PI) * 40; }
  if (grow > 0) {
    g.save(); toHer();
    let tx, ty;
    if (t < CATCH) { tx = lerp(722, 745, slide); ty = lerp(476, 572, slide); }
    else { tx = bx + bdir * 56 * bs; ty = by + 22; }
    const ts = lerp(.15, 1, grow);
    cut(tearPath(tx, ty, ts * 1.0), C.mint, { sh: .5, grain: .2, lift: .2 });
    // a tiny cream glint on it
    if (ts > .6) cut(ellipse(tx - 4, ty + 6, 3, 5, -.4), C.white, { sh: 0, grain: 0, alpha: .85 });
    g.restore();
  }
  if (bIn > 0 && bOut < 1) {
    g.save(); toHer();
    swallow(bx, by, bs, t * 13, bdir);
    g.restore();
  }

  // her smile: two soft gold rings from the mouth once the tear is gone
  g.save(); toHer(); laughRings(t, 800, 650, T.cry + .55, { n: 2, reach: 380, life: 2, w0: 12 }); g.restore();

  // a few gold petals drifting, as in 04
  for (let i = 0; i < 9; i++) {
    const u = ((t - 120) * (.04 + hash(i + 40) * .03) + hash(i * 3 + 40)) % 1;
    const px = W * (.04 + hash(i * 5 + 40) * .5) + Math.sin(t * .8 + i) * 30, py = H * (1.1 - u * 1.25);
    g.save(); g.translate(px, py); g.rotate(t * .6 + i); g.globalAlpha = A0 * .85;
    cut(ellipse(0, 0, 13, 5.5), i % 3 ? C.gold : C.cream, { sh: .5, grain: 0 }); g.restore();
  }
}, { xin: 1.0, tr: 'iris', ix: 1350, iy: 430 });

// ---------------- B: the bus stop ----------------
const B_END = 134.0;
const GROUND = 1000, ROAD_Y = 900;
const BUS_L = 1180, BUS_H = 372, BUS_STOP = 60;            // bus left edge when stopped
const DOOR = { x0: 1030, x1: 1140 };                         // door, relative to the bus's left edge
const WHEEL_R = 64, WHEELS = [190, 900];
const S_PEOPLE = .43;
// who steps off, in order, and where they go to stand (feet x)
const RIDERS = [
  { spec: CAST.girl3,   at: T.gotta + .12, slot: 1622 },
  { spec: CAST.boy8,    at: T.say + .02,   slot: 1540 },
  { spec: CAST.girl11,  at: T.bye + .0,    slot: 1456 },
  { spec: CAST.friendB, at: T.bye + .36,   slot: 1372 },
  { spec: CAST.friendA, at: T.bye + .74,   slot: 1292 },
];
function busX(t) {
  // in from the left, braking to a stop; away to the right, empty
  if (t < T.nobody + .7) { const u = eo((t - (T.because - .1)) / (T.nobody + .7 - (T.because - .1))); return lerp(-1500, BUS_STOP, u); }
  if (t < T.byeEnd + .1) return BUS_STOP;
  const d = t - (T.byeEnd + .1); return BUS_STOP + 520 * d * d + 120 * d;
}
function wheel(x, y, r, ang, hub = C.gold) {
  cut(circle(x, y, r), C.ink, { sh: .6, grain: .15 });
  // a scalloped gold hub: the rosette it is about to become
  const p = new Path2D(); const n = 10;
  for (let i = 0; i <= n * 4; i++) { const a = ang + i / (n * 4) * Math.PI * 2; const rr = r * (.5 + .07 * Math.cos(a * n - ang * n));
    i ? p.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : p.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  p.closePath(); cut(p, hub, { sh: .4, grain: .15 });
  cut(circle(x, y, r * .16), C.cream, { sh: .3, grain: .1 });
}
function bus(x, t, doorK, riders) {
  const y0 = ROAD_Y - 22, top = y0 - BUS_H;
  // brake: a small pitch forward as it stops, then settle
  const stopT = T.nobody + .7, pitch = bump(t, stopT - .15, .55) * .012 - bump(t, T.byeEnd + .1, .5) * .008;
  g.save(); g.translate(x + BUS_L, y0); g.rotate(pitch); g.translate(-(x + BUS_L), -y0);
  // body: one mint sheet with a rounded nose
  const body = new Path2D(); body.roundRect(x, top, BUS_L, BUS_H, [26, 70, 26, 18]);
  cut(body, C.mint, { sh: 1, lift: .6, grain: .25 });
  // a cream band along the windows
  cut(cutRect(x + 30, top + 40, 1000, 150, 21, 2), C.cream, { sh: .35, grain: .15 });
  // window mullions (mint strips over the band) and passenger heads behind the glass
  const wins = [[62, 188], [272, 188], [482, 188], [692, 188], [902, 128]];
  wins.forEach(([wx], i) => {
    const r = riders[i];
    if (r && t < r.at - .25) {
      g.save(); g.beginPath(); g.rect(x + wx, top + 40, wins[i][1], 150); g.clip();
      g.translate(x + wx + wins[i][1] / 2, top + 200); head(r.spec.head, r.spec.hair, r.spec.col, (r.spec.headK || .3) * .62, 0); g.restore();
    }
  });
  for (let i = 0; i <= 4; i++) cut(rect(x + 40 + i * 210, top + 36, 22, 158), C.mint, { sh: .35, grain: .1 });
  // the door: a dark opening, two leaves that fold back to the jambs
  const dx0 = x + DOOR.x0, dw = DOOR.x1 - DOOR.x0, dTop = top + 30, dBot = y0 - 8;
  cut(rect(dx0, dTop, dw, dBot - dTop), C.tealDeep, { sh: .2, grain: .2 });
  const lw = dw / 2 * (1 - doorK * .82);
  cut(cutRect(dx0, dTop, lw, dBot - dTop, 31, 1.5), C.mint, { sh: .6, grain: .2 });
  cut(cutRect(dx0 + dw - lw, dTop, lw, dBot - dTop, 32, 1.5), C.mint, { sh: .6, grain: .2 });
  // a gold stripe under the windows and a step
  cut(cutRect(x + 20, top + 230, DOOR.x0 - 40, 16, 33, 2), C.gold, { sh: .3, grain: .1 });
  g.restore();
  // wheels turn with distance travelled
  const ang = (x - BUS_STOP) / WHEEL_R;
  WHEELS.forEach((wx) => wheel(x + wx, ROAD_Y - 6, WHEEL_R, ang));
}
SHOT(A_END, B_END, 'goodbye-bus', (t) => {
  const A0 = g.globalAlpha;
  sheet(C.rose);
  // a far row of low roofs in deeper rose, two depths
  const roofs = (y, col, seed, step) => { const p = new Path2D(); p.moveTo(-20, H); p.lineTo(-20, y);
    for (let x = -20, i = 0; x < W + 200; x += step, i++) { const hh = y - 40 - hash(seed + i) * 90; p.lineTo(x, hh); p.lineTo(x + step * .9, hh); p.lineTo(x + step * .9, y); }
    p.lineTo(W + 200, H); p.closePath(); cut(p, col, { sh: .5, grain: .2 }); };
  cut(circle(470, 610, 250), C.sun, { sh: .4, grain: .25 });
  roofs(700, '#dc958b', 3, 230); roofs(760, C.roseDeep, 9, 170);
  // road and kerb
  cut(cutRect(-20, 730, W + 40, 200, 41, 3), '#cf8179', { sh: .4 });
  cut(cutRect(-20, ROAD_Y + 10, W + 40, 200, 42, 3), C.roseDark, { sh: .8, lift: .3 });
  cut(cutRect(-20, ROAD_Y + 8, W + 40, 10, 43, 2), C.cream, { sh: .3, grain: .1, alpha: .9 });

  // the set is staged a little bigger than the sheet: anchor at the kerb
  g.save(); g.translate(880, GROUND); g.scale(1.22, 1.22); g.translate(-1000, -GROUND);
  const doorK = ss(T.gotta - .25, T.gotta + .15, t) * (1 - ss(T.byeEnd - .1, T.byeEnd + .2, t));
  const x = busX(t);
  bus(x, t, doorK, RIDERS);

  // the stop: a pole with a gold disc, no words
  const PX = 1600;
  cut(cutRect(PX - 7, 470, 14, GROUND - 470, 51, 1), C.ink, { sh: .5 });
  cut(circle(PX, 470, 46), C.gold, { sh: .7, lift: .3 });
  cut(circle(PX, 470, 22), C.cream, { sh: .3, grain: .1 });

  // her, waiting, then arms open as they come to her
  const open = ss(T.say - .1, T.say + .5, t);
  const hug = Math.sin(clamp((t - T.say) / 2.4) * Math.PI);
  puppet(1712, GROUND, S_PEOPLE, -1, CAST.her, {
    arms: [[lerp(.05, 1.0, open), lerp(.15, .45, open)], [lerp(.05, .7, open), lerp(.15, .5, open)]],
    head: lerp(0, -.08, open) + Math.sin(t * 2) * .01, lean: -.02 * hug, laugh: hug * .6,
  });

  // the riders: out of the door from behind the near jamb, a hop down, then walk to her
  RIDERS.forEach((r, i) => {
    if (t < r.at) return;
    const d = t - r.at;
    const doorX = x + DOOR.x0;
    const hs = r.spec.height || 1;
    // 0..0.32 s: step out across the door sill and down to the pavement
    const sd = clamp(d / .34);
    const startX = doorX + 30, downX = doorX + 150;
    let fx = lerp(startX, downX, eio(sd)), fy = lerp(ROAD_Y - 30, GROUND, eio(sd)) - Math.sin(sd * Math.PI) * 26;
    let walked = (fx - startX);
    // then walk at a brisk pace to the slot
    const v = 520;
    if (sd >= 1) { const dd = Math.min(r.slot - downX, v * (d - .34)); fx = downX + Math.max(0, dd); fy = GROUND; walked = fx - startX; }
    const stride = 2 * 516 * S_PEOPLE * hs * Math.sin(.3);
    const ph = walked / stride * Math.PI;
    const arrived = fx >= r.slot - .5;
    const settle = ss(0, .3, arrived ? (d - .34 - (r.slot - downX) / v) : 0);
    let pose = POSE.walk(ph, 1 - settle);
    if (arrived) {
      // little ones reach up to her; the friends greet her with a raised arm
      const reach = r.spec === CAST.girl3 || r.spec === CAST.boy8;
      const k = settle;
      pose = { ...pose, arms: reach ? [[lerp(0, 2.3, k), lerp(.2, .2, k)], [lerp(0, 1.4, k), .3]] : [[lerp(0, 1.5, k), lerp(.2, 1.1, k) + Math.sin(t * 7 + i) * .2 * k], [0, .2]],
        head: -.12 * k, laugh: .5 * k };
    }
    g.save();
    if (sd < 1) { g.beginPath(); g.rect(doorX, -10, W * 2, H + 20); g.clip(); }
    puppet(fx, fy, lerp(.39, S_PEOPLE, eio(sd)), 1, r.spec, pose);
    g.restore();
  });
  // a gold ring from her on "goodbye": nobody leaves
  laughRings(t, 1690, 560, T.bye + .3, { n: 3, dir: -Math.PI / 2 + .2, spread: .7, reach: 260, life: 2 });
  g.restore();
}, { xin: .45, tr: 'slide' });

// ---------------- C: the wheel becomes a rosette, the rosette becomes a ring ----------------
// a pleated paper rosette: outer pleated fan, scalloped mid ring, centre disc. k = bloom 0..1
function rosette(x, y, r, rot, cols, k, seed = 0) {
  if (k <= 0) return;
  const layer = (rr, n, depth, col, kk, ph, sh) => {
    if (kk <= 0) return;
    const R = rr * kk, p = new Path2D(); const N = n * 2;
    for (let i = 0; i <= N; i++) { const a = rot * (1 + ph) + i / N * Math.PI * 2; const q = i % 2 ? R * (1 - depth) : R;
      i ? p.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q) : p.moveTo(x + Math.cos(a) * q, y + Math.sin(a) * q); }
    p.closePath(); cut(p, col, { sh, grain: .22, lift: .2 });
  };
  layer(r, 28, .1, cols[0], back(k * 1.25), 0, .9);
  const sc = (rr, n, col, kk, ph) => { if (kk <= 0) return; const p = new Path2D(); const R = rr * kk;
    for (let i = 0; i < n; i++) { const a = rot * ph + i / n * Math.PI * 2; p.moveTo(x + Math.cos(a) * R * .78 + R * .26, y + Math.sin(a) * R * .78); p.arc(x + Math.cos(a) * R * .78, y + Math.sin(a) * R * .78, R * .26, 0, Math.PI * 2); }
    p.addPath(circle(x, y, R * .8)); cut(p, col, { sh: .6, grain: .2, lift: .1 }); };
  sc(r * .74, 14, cols[1], back(k * 1.25 - .2), -1.4);
  layer(r * .5, 18, .14, cols[2], back(k * 1.25 - .35), .6, .5);
  if (k * 1.25 - .5 > 0) cut(circle(x, y, r * .2 * back(k * 1.25 - .5)), cols[3], { sh: .4, grain: .15 });
}
SHOT(B_END, T.end, 'goodbye-rosette', (t, k, d) => {
  sheet(C.rose);
  const CX = 960, CY = 540;
  // the wheel rolls in along the road, stops, and lifts off it as the road drops away
  const roll = eo(d / .6);
  const wx = lerp(520, CX, roll), wy = lerp(650, CY, ss(.5, 1.3, d));
  const ang = (wx - 520) / 240 + Math.max(0, d - .6) * 2.4;
  const roadOut = ss(.45, 1.05, d);
  if (roadOut < 1) {
    cut(cutRect(-20, 890 + ei(roadOut) * 320, W + 40, 300, 61, 3), C.roseDark, { sh: .8, lift: .3 });
    cut(cutRect(-20, 888 + ei(roadOut) * 320, W + 40, 10, 63, 2), C.cream, { sh: .3, grain: .1, alpha: .9 });
  }
  // the wheel: ink tyre that pales into paper pleats as it blooms
  const bloom = ss(.75, 1.7, d);
  const R0 = lerp(240, 230, bloom);
  if (bloom < 1) cut(circle(wx, wy, R0 * lerp(1, .45, eio(bloom))), C.ink, { sh: .8, grain: .15, lift: .3 });
  // more rosettes pop out in a ring on the beats, turning the other way
  const ringR = lerp(300, 320, ss(2, 2.84, d));
  for (let i = 0; i < 8; i++) {
    const at = 135.56 - B_END + i * .05;
    const kk = clamp((d - at) / .7); if (kk <= 0) continue;
    const a = -Math.PI / 2 + i / 8 * Math.PI * 2 - ang * .25;
    const rr = ringR * eo(kk);
    const cols = i % 2 ? [C.mint, C.cream, C.gold, C.cream] : [C.goldPale, C.gold, C.cream, C.mint];
    rosette(wx + Math.cos(a) * rr, wy + Math.sin(a) * rr, 84, -ang * 1.3 + i, cols, kk);
  }
  // an outer ring of small ones on the next beat
  for (let i = 0; i < 12; i++) {
    const at = 136.32 - B_END + i * .025;
    const kk = clamp((d - at) / .5); if (kk <= 0) continue;
    const a = (i + .5) / 12 * Math.PI * 2 + ang * .18;
    const rr = lerp(360, 470, eo(kk));
    rosette(wx + Math.cos(a) * rr, wy + Math.sin(a) * rr, 40, ang + i, i % 2 ? [C.cream, C.gold, C.cream, C.mint] : [C.mint, C.cream, C.goldPale, C.gold], kk);
  }
  rosette(wx, wy, R0 * lerp(.5, 1, bloom) + 0, ang, [C.gold, C.cream, C.mint, C.goldPale], lerp(1, 1, bloom) * Math.max(.35, bloom));
}, { xin: .5, tr: 'slideL' });
})();
