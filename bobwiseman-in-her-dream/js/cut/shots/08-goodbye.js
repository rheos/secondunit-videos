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
// The close profile lands differently from 04: a tighter crop on the eye, a smaller halo that shows as a
// gold crescent around the brow and face. It opens (iris) on the point where 07's ribbons met her face,
// screen (780,500), which here is halo, so the first thing through the hole is gold.
const QH = [850, 520];                          // a head-unit point in the halo just ahead of her brow
const HALO = { x: 590, y: 450, r: 300 };
SHOT(124.0, A_END, 'goodbye-tear', (t) => {
  const A0 = g.globalAlpha;
  sheet(C.rose);
  const hill = (y, amp, ph, col) => { const p = new Path2D(); p.moveTo(-20, H + 20); p.lineTo(-20, y);
    for (let x = 0; x <= W + 40; x += 40) p.lineTo(x, y + Math.sin(x / 260 + ph) * amp); p.lineTo(W + 40, H + 20); p.closePath(); cut(p, col, { sh: .6 }); };
  hill(900, 26, 1.2, '#d9877f'); hill(975, 18, 3.4, '#c9746f');
  // warm afternoon: a soft gold wash from the top
  { g.save(); const gr = g.createLinearGradient(0, 0, 0, H * .8); gr.addColorStop(0, 'rgba(247,210,126,.32)'); gr.addColorStop(1, 'rgba(247,210,126,0)');
    g.fillStyle = gr; g.fillRect(0, 0, W, H); g.restore(); }

  // a slow push toward the eye; on the smile her chin lifts (with a small overshoot)
  const zoom = lerp(1.7, 1.86, eio((t - 124) / 5.4));
  const smile = ss(T.cry + .35, T.cry + .8, t);
  const lift = smile > 0 ? back(clamp((t - (T.cry + .35)) / .6)) : 0;
  const tilt = -.02 - lift * .07 + Math.sin(t * .6) * .006;
  const pin = [lerp(780, 800, eio((t - 124) / 5.4)) + jit(t, 3, .8), lerp(500, 470, eio((t - 124) / 5.4)) + jit(t, 4, .8)];
  const rq = [Math.cos(tilt) * (QH[0] - 560) - Math.sin(tilt) * (QH[1] - 900) + 560, Math.sin(tilt) * (QH[0] - 560) + Math.cos(tilt) * (QH[1] - 900) + 900];
  const ox = pin[0] - zoom * rq[0], oy = pin[1] - zoom * rq[1];
  const toHer = () => { g.translate(ox, oy); g.scale(zoom, zoom); g.translate(560, 900); g.rotate(tilt); g.translate(-560, -900); };

  g.save(); toHer();
  const sunR = HALO.r + Math.sin(t * .5) * 3;
  cut(circle(HALO.x, HALO.y, sunR + 22), C.goldPale, { sh: .5, grain: .25 });
  cut(circle(HALO.x, HALO.y, sunR), C.sun, { sh: .6, grain: .25 });
  cut(HEADS.her, C.navy, { sh: 1.2, lift: 1, grain: .3 });
  // the eye: a relaxed closed lid (a downward arc); once the tear is gone it turns up into the smiling arc
  g.strokeStyle = C.rose; g.lineCap = 'round';
  if (smile < .5) { g.lineWidth = 4.5; g.beginPath(); g.arc(706, 452, 13, Math.PI * .1, Math.PI * .9); g.stroke(); }
  else { g.lineWidth = 6; g.beginPath(); g.arc(706, 466, 17, Math.PI * 1.12, Math.PI * 1.88); g.stroke(); }
  g.restore();

  // the tear: swells at the lid on "she don't", runs down the cheek to the jaw, hangs under the chin;
  // the bird comes in low from the right, under the chin (never across the face), and takes it on "cry"
  const grow = eo((t - T.she) / .9);
  const CATCH = T.cry + .28;
  const RUN = [[722, 478], [736, 560], [744, 650], [748, 742], [752, 778]];
  const run = eio((t - (T.dont + .35)) / (CATCH - .1 - (T.dont + .35)));
  const along = (u) => { const f = u * (RUN.length - 1), i = Math.min(RUN.length - 2, Math.floor(f)), k = f - i; return [lerp(RUN[i][0], RUN[i + 1][0], k), lerp(RUN[i][1], RUN[i + 1][1], k)]; };
  const bIn = clamp((t - (T.cry - .6)) / (CATCH - (T.cry - .6)));
  const bOut = clamp((t - CATCH - .12) / 1.0);
  const bs = 1.2, BEAK = 56 * bs;
  const CX0 = 752 + BEAK, CY0 = 786;                       // hovering under the chin, beak on the tear
  let bx, by, bdir = -1;
  if (bOut <= 0) { const u = eo(bIn); bx = lerp(1250, CX0, u); by = lerp(1010, CY0, u) + Math.sin(u * Math.PI) * 40; }
  else { const u = ei(bOut) * .6 + bOut * .4; bdir = 1; bx = lerp(CX0 + 20, 1560, u); by = lerp(CY0, 140, u) + Math.sin(u * Math.PI) * 30; }
  if (grow > 0) {
    g.save(); toHer();
    let tx, ty;
    if (t < CATCH) [tx, ty] = along(run); else { tx = bx + bdir * BEAK; ty = by + 16; }
    const ts = lerp(.15, 1, grow);
    cut(tearPath(tx, ty, ts), C.mint, { sh: .5, grain: .2, lift: .2 });
    if (ts > .6) cut(ellipse(tx - 4, ty + 6, 3, 5, -.4), C.white, { sh: 0, grain: 0, alpha: .85 });
    g.restore();
  }
  if (bIn > 0 && bOut < 1) { g.save(); toHer(); swallow(bx, by, bs, t * 13, bdir); g.restore(); }

  // her smile: two soft gold rings from the mouth once the tear is gone
  g.save(); toHer(); laughRings(t, 800, 640, T.cry + .55, { n: 2, reach: 340, life: 2, w0: 10 }); g.restore();

  for (let i = 0; i < 9; i++) {
    const u = ((t - 120) * (.04 + hash(i + 40) * .03) + hash(i * 3 + 40)) % 1;
    const px = W * (.45 + hash(i * 5 + 40) * .5) + Math.sin(t * .8 + i) * 30, py = H * (1.1 - u * 1.25);
    g.save(); g.translate(px, py); g.rotate(t * .6 + i); g.globalAlpha = A0 * .85;
    cut(ellipse(0, 0, 13, 5.5), i % 3 ? C.gold : C.cream, { sh: .5, grain: 0 }); g.restore();
  }
  g.globalAlpha = A0;
}, { xin: 1.0, tr: 'iris', ix: 780, iy: 500 });

// ---------------- B: the bus stop, then the wheels (one continuous shot to the end) ----------------
// The bus pulls up, everyone steps OFF and stays with her (nobody is taken away). As the empty bus pulls
// out, the camera pushes in on its rear wheel; the wheel comes loose and rolls on by itself, and on the
// instrumental beats it multiplies: twins on the road, then rows of smaller wheels rolling along paper
// lanes above. Spinning spokes, a frieze, not a rosette (09 owns the first mandala).
const GROUND = 1000, ROAD_Y = 900;
const BUS_L = 1180, BUS_H = 372, BUS_STOP = 60;            // bus left edge when stopped
const DOOR = { x0: 1030, x1: 1140 };                         // door, relative to the bus's left edge
const DOOR_X = BUS_STOP + DOOR.x0;                           // the door where it stopped: riders step off HERE, whatever the bus does next
const WHEEL_R = 64, WHEELS = [190, 900];
const S_PEOPLE = .43;
const HER_X = 1740, POLE_X = 1768;
const LEAVE = T.byeEnd + .1, DET = 133.5;                    // the bus pulls out; its rear wheel comes loose
// who steps off, in order, and where they go to stand (feet x). girl3 jumps into her arms instead.
const RIDERS = [
  { spec: CAST.girl3,   at: T.gotta + .12, slot: 1560, jump: true },
  { spec: CAST.boy8,    at: T.say + .02,   slot: 1578 },
  { spec: CAST.girl11,  at: T.bye + .0,    slot: 1464 },
  { spec: CAST.friendB, at: T.bye + .36,   slot: 1350 },
  { spec: CAST.friendA, at: T.bye + .74,   slot: 1238 },
];
const WALK_V = 520, DOWN_X = DOOR_X + 130;
function busX(t) {
  if (t < T.nobody + .7) { const u = eo((t - (T.because - .1)) / (T.nobody + .7 - (T.because - .1))); return lerp(-1500, BUS_STOP, u); }
  if (t < LEAVE) return BUS_STOP;
  const d = t - LEAVE; return BUS_STOP + 520 * d * d + 120 * d;
}
// the rear wheel: on the bus, then loose, slowing to an easy roll
function rearX(t) {
  if (t < DET) return busX(t) + WHEELS[0];
  const s = t - DET, x0 = busX(DET) + WHEELS[0], v0 = 1040 * (DET - LEAVE) + 120;
  const vf = 70;   // slow enough that the people at the stop never roll back into the close-up
  return x0 + (s < .8 ? v0 * s - (v0 - vf) / 1.6 * s * s : v0 * .8 - (v0 - vf) * .4 + vf * (s - .8));
}
const rearAng = (t) => rearX(t) / WHEEL_R + Math.max(0, t - DET - .8) * 2.2;   // it keeps spinning as it slows
const rearY = (t) => ROAD_Y - 6 - bump(t, DET, .45) * 36;
// a wheel: ink tyre, five gold spokes, a scalloped gold hub, a cream boss
function wheel(x, y, r, ang, hub = C.gold) {
  cut(circle(x, y, r), C.ink, { sh: .6, grain: .15 });
  const sp = new Path2D();
  for (let i = 0; i < 5; i++) { const a = ang + i / 5 * Math.PI * 2, c = Math.cos(a), s = Math.sin(a), w0 = r * .1, w1 = r * .05;
    sp.moveTo(x + c * r * .4 - s * w0, y + s * r * .4 + c * w0); sp.lineTo(x + c * r * .86 - s * w1, y + s * r * .86 + c * w1);
    sp.lineTo(x + c * r * .86 + s * w1, y + s * r * .86 - c * w1); sp.lineTo(x + c * r * .4 + s * w0, y + s * r * .4 - c * w0); sp.closePath(); }
  cut(sp, hub, { sh: .3, grain: .15 });
  const p = new Path2D(); const n = 10;
  for (let i = 0; i <= n * 4; i++) { const a = ang + i / (n * 4) * Math.PI * 2; const rr = r * (.42 + .06 * Math.cos(a * n - ang * n));
    i ? p.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : p.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  p.closePath(); cut(p, hub, { sh: .4, grain: .15 });
  cut(circle(x, y, r * .14), C.cream, { sh: .3, grain: .1 });
}
function bus(x, t, doorK, riders) {
  const y0 = ROAD_Y - 22, top = y0 - BUS_H;
  const stopT = T.nobody + .7, pitch = bump(t, stopT - .15, .55) * .012 - bump(t, LEAVE, .5) * .008;
  const sag = -.03 * ss(DET, DET + .3, t);                   // its rear drops when the wheel goes
  const fx = x + WHEELS[1];
  g.save(); g.translate(x + BUS_L, y0); g.rotate(pitch); g.translate(-(x + BUS_L), -y0);
  g.translate(fx, y0); g.rotate(sag); g.translate(-fx, -y0);
  const body = new Path2D(); body.roundRect(x, top, BUS_L, BUS_H, [26, 70, 26, 18]);
  cut(body, C.mint, { sh: 1, lift: .6, grain: .25 });
  cut(cutRect(x + 30, top + 40, 1000, 150, 21, 2), C.cream, { sh: .35, grain: .15 });
  const wins = [[62, 188], [272, 188], [482, 188], [692, 188], [902, 128]];
  wins.forEach(([wx], i) => {
    const r = riders[i];
    if (r && t < r.at - .25) {
      g.save(); g.beginPath(); g.rect(x + wx, top + 40, wins[i][1], 150); g.clip();
      g.translate(x + wx + wins[i][1] / 2, top + 200); head(r.spec.head, r.spec.hair, r.spec.col, (r.spec.headK || .3) * .62, 0); g.restore();
    }
  });
  for (let i = 0; i <= 4; i++) cut(rect(x + 40 + i * 210, top + 36, 22, 158), C.mint, { sh: .35, grain: .1 });
  const dx0 = x + DOOR.x0, dw = DOOR.x1 - DOOR.x0, dTop = top + 30, dBot = y0 - 8;
  cut(rect(dx0, dTop, dw, dBot - dTop), C.tealDeep, { sh: .2, grain: .2 });
  const lw = dw / 2 * (1 - doorK * .82);
  cut(cutRect(dx0, dTop, lw, dBot - dTop, 31, 1.5), C.mint, { sh: .6, grain: .2 });
  cut(cutRect(dx0 + dw - lw, dTop, lw, dBot - dTop, 32, 1.5), C.mint, { sh: .6, grain: .2 });
  cut(cutRect(x + 20, top + 230, DOOR.x0 - 40, 16, 33, 2), C.gold, { sh: .3, grain: .1 });
  const ang = (x - BUS_STOP) / WHEEL_R;
  wheel(x + WHEELS[1], ROAD_Y - 6, WHEEL_R, ang);
  if (t < DET) wheel(x + WHEELS[0], ROAD_Y - 6, WHEEL_R, ang);
  g.restore();
}
// her near hand, in world units (puppet maths: shoulder at (8,-752), upper arm 168, forearm + hand ~176)
function handAt(x, y, s, dir, sh, el) {
  const lx = 8 + 168 * Math.sin(sh) + 176 * Math.sin(sh + el), ly = -752 + 168 * Math.cos(sh) + 176 * Math.cos(sh + el);
  return [x + dir * s * lx, y + s * ly];
}
const SET = (x, y) => [880 + (x - 1000) * 1.22, GROUND + (y - GROUND) * 1.22];
const PUSH0 = 133.25, PUSHD = 1.35, ZMAX = 3, WSCR = [900, 700];   // the loose wheel ends big, at WSCR
SHOT(A_END, T.end, 'goodbye-bus', (t, k, d) => {
  const A0 = g.globalAlpha;
  sheet(C.rose);
  // camera: from the wide stop, push in on the rear wheel, then track it
  const pw = SET(rearX(t), rearY(t)), u = eio((t - PUSH0) / PUSHD), Z = lerp(1, ZMAX, u);
  g.save(); g.translate(lerp(pw[0], WSCR[0], u), lerp(pw[1], WSCR[1], u)); g.scale(Z, Z); g.translate(-pw[0], -pw[1]);
  { g.save(); const gr = g.createLinearGradient(0, -400, 0, 760); gr.addColorStop(0, 'rgba(247,210,126,.34)'); gr.addColorStop(1, 'rgba(247,210,126,0)');
    g.fillStyle = gr; g.fillRect(-2000, -2000, W + 6000, 2760); g.restore(); }
  const roofs = (y, col, seed, step) => { const p = new Path2D(); p.moveTo(-1000, H + 400); p.lineTo(-1000, y);
    for (let x = -1000, i = 0; x < W + 2400; x += step, i++) { const hh = y - 40 - hash(seed + i) * 90; p.lineTo(x, hh); p.lineTo(x + step * .9, hh); p.lineTo(x + step * .9, y); }
    p.lineTo(W + 2400, H + 400); p.closePath(); cut(p, col, { sh: .5, grain: .2 }); };
  // the low sun sits behind where they all end up
  cut(circle(1590, 600, 240), C.sun, { sh: .4, grain: .25 });
  roofs(700, '#dc958b', 3, 230); roofs(760, C.roseDeep, 9, 170);
  cut(cutRect(-1000, 730, W + 3400, 200, 41, 3), '#cf8179', { sh: .4 });
  cut(cutRect(-1000, ROAD_Y + 10, W + 3400, 400, 42, 3), C.roseDark, { sh: .8, lift: .3 });
  cut(cutRect(-1000, ROAD_Y + 8, W + 3400, 10, 43, 2), C.cream, { sh: .3, grain: .1, alpha: .9 });

  g.save(); g.translate(880, GROUND); g.scale(1.22, 1.22); g.translate(-1000, -GROUND);
  const doorK = ss(T.gotta - .25, T.gotta + .15, t) * (1 - ss(T.byeEnd - .1, T.byeEnd + .2, t));
  const x = busX(t);
  bus(x, t, doorK, RIDERS);
  if (t >= DET) wheel(rearX(t), rearY(t), WHEEL_R, rearAng(t));

  // the stop: the pole stands just behind her back, its gold disc over her head
  cut(cutRect(POLE_X - 7, 470, 14, GROUND - 470, 51, 1), C.ink, { sh: .5 });
  cut(circle(POLE_X, 470, 46), C.gold, { sh: .7, lift: .3 });
  cut(circle(POLE_X, 470, 22), C.cream, { sh: .3, grain: .1 });

  // her: waiting, arms open on "say", catches girl3 as she jumps and lifts her up
  const open = ss(T.say - .1, T.say + .5, t);
  const JUMP = RIDERS[0].at + .34 + (RIDERS[0].slot - DOWN_X) / WALK_V + .08, CATCH = JUMP + .3;
  const lift = ss(CATCH - .15, CATCH + .25, t), swing = Math.sin((t - CATCH) * 4.2) * .07 * lift;
  const near = [lerp(lerp(.05, 1.0, open), 2.25 + swing, lift), lerp(lerp(.15, .45, open), .1, lift)];
  const far = [lerp(lerp(.05, .7, open), 2.0 + swing, lift), lerp(lerp(.15, .5, open), .2, lift)];
  const hug = Math.sin(clamp((t - T.say) / 2.4) * Math.PI);
  puppet(HER_X, GROUND, S_PEOPLE, -1, CAST.her, { arms: [near, far], head: lerp(0, -.12, open) + Math.sin(t * 2) * .01, laugh: Math.max(hug * .6, lift * .7) });
  const hand = handAt(HER_X, GROUND, S_PEOPLE, -1, near[0], near[1]);

  // the riders: out of the (stopped) door from behind the near jamb, a hop down, then walk to their places
  // and stay there; girl3 runs to her and jumps into her arms
  RIDERS.forEach((r, i) => {
    if (t < r.at) return;
    const dd = t - r.at, hs = r.spec.height || 1;
    const sd = clamp(dd / .34), startX = DOOR_X + 30;
    let fx = lerp(startX, DOWN_X, eio(sd)), fy = lerp(ROAD_Y - 30, GROUND, eio(sd)) - Math.sin(sd * Math.PI) * 26;
    if (sd >= 1) { fx = DOWN_X + Math.min(r.slot - DOWN_X, WALK_V * (dd - .34)); fy = GROUND; }
    const stride = 2 * 516 * S_PEOPLE * hs * Math.sin(.3);
    const arrived = fx >= r.slot - .5;
    const settle = ss(0, .3, arrived ? (dd - .34 - (r.slot - DOWN_X) / WALK_V) : 0);
    let pose = POSE.walk((fx - startX) / stride * Math.PI, 1 - settle), sc = lerp(.39, S_PEOPLE, eio(sd));
    if (r.jump && t >= JUMP) {
      // a crouch, a leap, then held up high in her hands
      const j = clamp((t - JUMP) / .3), hx = hand[0] + 8, hy = hand[1] + 150;
      fx = lerp(r.slot, hx, eio(j)); fy = lerp(GROUND, hy, eio(j)) - Math.sin(j * Math.PI) * 70;
      pose = { legs: [[lerp(.4, -.35, j), lerp(.6, 1.2, j)], [lerp(.3, -.15, j), lerp(.5, 1.5, j)]], arms: [[lerp(.6, 2.0, j), .25], [lerp(.5, 1.6, j), .35]],
        head: -.15 * j, laugh: .7 * j };
    } else if (arrived) {
      const k2 = settle, small = r.spec === CAST.boy8;
      const wave = Math.sin(t * 7 + i * 1.7) * .35 * k2;   // a real side-to-side wave
      pose = { ...pose, arms: small ? [[lerp(0, 1.9, k2), .3], [lerp(0, 1.3, k2), .3]] : r.jump ? [[lerp(0, 1.2, k2), .2], [0, .2]]
        : [[lerp(0, 2.6, k2) + wave * .4, lerp(.2, .5, k2) + wave], [0, .2]], head: -.1 * k2, laugh: .5 * k2 };
    }
    g.save();
    if (sd < 1) { g.beginPath(); g.rect(DOOR_X, -10, W * 2, H + 20); g.clip(); }
    puppet(fx, fy, sc, 1, r.spec, pose);
    g.restore();
  });
  laughRings(t, HER_X - 30, 560, T.bye + .3, { n: 3, dir: -Math.PI / 2 + .2, spread: .7, reach: 260, life: 2 });
  g.restore();
  g.restore();

  // ---------- the wheels multiply (screen space, the loose wheel is at WSCR, radius WR) ----------
  const WR = WHEEL_R * 1.22 * ZMAX, ang = rearAng(t);
  const ROAD_SCR = WSCR[1];
  [[134.77, 1, 520], [135.17, -1, 520]].forEach(([t0, side, dx]) => {
    const kk = clamp((t - t0) / .45); if (kk <= 0) return;
    wheel(WSCR[0] + side * dx * eo(kk), ROAD_SCR - bump(t, t0, .45) * 40, WR, ang + side * .4);
  });
  // paper lanes slide in above, each with its own row of wheels rolling along it
  const lane = (t0, y, r, gap, v, seed) => {
    const kk = eo((t - t0) / .45); if (kk <= 0) return;
    const off = (1 - kk) * -W;
    g.save(); g.translate(off, 0);
    cut(cutRect(-40, y, W + 80, 18, seed, 2), C.cream, { sh: .6, lift: .2, grain: .15 });
    const s0 = (t - t0) * v;
    for (let i = -1; i < W / gap + 1; i++) {
      const wx = ((i * gap + s0) % (W + gap) + W + gap) % (W + gap) - gap / 2;
      wheel(wx, y - r, r, wx / r + i, i % 2 ? C.gold : C.goldPale);
    }
    g.restore();
  };
  lane(135.56, 420, 92, 300, 230, 71);
  lane(136.32, 196, 56, 190, 380, 72);
  g.globalAlpha = A0;
}, { xin: .45, tr: 'slide' });
})();
