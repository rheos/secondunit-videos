// Airplane on the Highway, section I (219.4583-278.75): the song is over, the soundscape starts, and
// he finally takes off, as a dream. Waking Life look drifting into acid. One animator's hand per scene.
//   1 ROAD    clean    on the highway at dusk; the lane dashes let go and float; his tyres leave the asphalt
//   2 RISE    paint    looking down past him: the highway and the world shrink away beneath, clouds pass
//   3 SKY     scratch  a sky full of drifting outlines; his rotoscope layers start to come apart; echoes loop
//   4 FOLD    paint    the world from above folded into a kaleidoscope, his parts (props, eyes, cheat line) in it
//   5 REFORM  clean    head on in a tunnel running backwards: each backmasked swell un-melts him, the cut snaps
//   6 REPLAY  scratch  the take-off replayed backwards, mirrored: the dashes fall back to the road (a loop)
//   7 GLIDE   paint    calm: whole again, gliding over a cloud floor at night. Hard cut into J.
const env = (t, a, b, r = .3) => smooth(inv(a - r, a, t)) * (1 - smooth(inv(b, b + r, t)));
const nearBeat = (x) => FEAT.beats.reduce((m, b) => Math.abs(b - x) < Math.abs(m - x) ? b : m, FEAT.beats[0]);
const T_A = 5267 / 24, T_B = 6690 / 24;
// cuts land on strong drum hits (226.71, 234.25, 246.50), the first backmasked swell (257.3), the waltz downbeat (263.97)
const C1 = 226.7083, C2 = 234.25, C3 = 246.5, C4 = 257.3, C5 = nearBeat(264.0), C6 = nearBeat(274.4);
// the backmasked swells (grow, then cut dead), read off the waveform: [start, cut]
const SWELLS = [[257.36, 257.89], [257.99, 258.55], [258.68, 258.8], [259.46, 259.67], [259.83, 260.67], [261.67, 262.48], [263.25, 264.3],
  [266.15, 267.24], [268.2, 269.97], [271.07, 271.44], [271.6, 272.9], [273.28, 273.8], [273.9, 274.43]];
// re-form amount: 0 while a swell grows toward its cut (formed), drifting back up (melting) after it
function meltAt(t) {
  let m = .55;
  for (const [a, b] of SWELLS) {
    if (t >= a && t < b) return lerp(.7, 0, ease.out(inv(a, b, t)));
    if (t >= b) m = clamp((t - b) * .45, 0, .7);
  }
  return m;
}
const snapAt = (t, d = 7) => SWELLS.reduce((m, [, b]) => m + hit(t, b, d), 0);
const swellsBefore = (t) => SWELLS.filter(([, b]) => b <= t).length;

function skyGrad(y0, y1, stops) { s.fillStyle = vgrad(y0, y1, stops); s.fillRect(-2000, -2000, 6000, 6000); }

// ---------------- 1: ROAD ----------------
const V = 520;                   // his road speed, px/s
const LIFT0 = 222.95;            // the wheels leave the asphalt (on the bed's big swell)
const ROADY = 880;
function dashLift(i) { return 220.2 + hash(i * 13 + 5) * 3.6 + (i % 3) * .2; }
function rollAt(t) { const w = V / 52; return t < LIFT0 ? w * (t - T_A) : w * (LIFT0 - T_A) + w * (1 - Math.exp(-(t - LIFT0) * .7)) / .7; }
function riseAt(t) { return Math.pow(smooth(inv(LIFT0 - .2, C1 + 1.2, t)), 1.5) * 520; }
function drawRoad(t, o = {}) {
  const tt = (o.tt ?? t - T_A), rise = o.noPlane ? 0 : riseAt(t), camUp = o.camUp ?? rise * .62;
  const scroll = (par) => -(V * tt) * par;
  withT(() => {
    s.translate(0, camUp + snoise(t * .6, 2) * 2);
    skyGrad(-600 - camUp, 760, [[0, hsl(236, 30, 30)], [.45, hsl(292, 24, 50)], [.82, hsl(18, 55, 68)], [1, hsl(36, 65, 78)]]);
    // a low sun
    s.save(); s.globalCompositeOperation = 'screen'; s.fillStyle = rgrad(330, 640, 10, 300, [[0, hsl(40, 90, 80, .7)], [1, hsl(30, 80, 60, 0)]]); s.fillRect(-200, 200, 1100, 700); s.restore();
    part(lump(330, 640, 46, 46, 3, 12), { fill: hsl(38, 80, 86), seed: 4, ink: false, wob: .6 });
    // clouds, very slow
    for (let i = 0; i < 5; i++) { const r = rng(10 + i), cx = ((r() * 2400 + scroll(.04)) % 2600 + 2600) % 2600 - 300, cy = 120 + r() * 300 - camUp * .1; part(lump(cx, cy, 150 + r() * 120, 30 + r() * 18, 11 + i), { fill: hsl(320 + r() * 30, 30, 72, .9), shade: hsl(260, 20, 56, .9), shadeShift: [0, -14], seed: 12 + i, inkW: .6, hatch: false }); }
    // far hills
    const hx = scroll(.08) % 800;
    part([[-900 + hx, 720], [-500 + hx, 660], [-100 + hx, 690], [300 + hx, 640], [700 + hx, 680], [1100 + hx, 630], [1500 + hx, 675], [1900 + hx, 640], [2300 + hx, 690], [2700 + hx, 650], [2700 + hx, 760], [-900 + hx, 760]], { fill: hsl(256, 18, 36), shade: hsl(258, 20, 28), shadeShift: [0, -10], seed: 20, inkW: .8 });
    // ground
    part([[-300, 712], [2300, 712], [2300, 1700], [-300, 1700]], { fill: hsl(70, 16, 34), shade: hsl(80, 16, 27), shadeShift: [0, -30], seed: 21, sharp: 90, inkW: .8 });
    // power poles
    const pg = 700, px0 = ((scroll(.55) % pg) + pg) % pg - pg;
    for (let k = 0; k < 5; k++) { const x = px0 + k * pg; stroke([[x, 716], [x + 3, 380]], 30 + k, 1.8); stroke([[x - 40, 400], [x + 44, 398]], 36 + k, 1.2); if (k < 4) for (let w = 0; w < 2; w++) { const P = []; for (let i = 0; i <= 8; i++) { const u = i / 8; P.push([x + u * pg, 402 + w * 14 + Math.sin(u * Math.PI) * 46]); } stroke(P, 40 + k * 2 + w, .5); } }
    // the highway, seen from the side: far shoulder, far lane (roped-off passing lane), near lane, near shoulder
    part([[-300, 740], [2300, 740], [2300, 950], [-300, 950]], { fill: hsl(232, 8, 30), shade: hsl(236, 10, 24), shadeShift: [0, -24], seed: 50, sharp: 80, inkW: 1 });
    stroke([[-300, 742], [2300, 742]], 51, 1.2, { col: hsl(45, 30, 78) }); stroke([[-300, 948], [2300, 948]], 52, 1.4, { col: hsl(45, 30, 78) });
    // the passing lane's rope and stanchions (the VIPs' lane)
    const sp = 260, sx0 = ((scroll(1) % sp) + sp) % sp - sp;
    for (let k = 0; k < 10; k++) { const x = sx0 + k * sp; part([[x - 4, 810], [x + 4, 810], [x + 5, 760], [x - 5, 760]], { fill: hsl(45, 60, 60), seed: 60 + k, sharp: 20, inkW: .6 }); if (k < 9) { const P = []; for (let i = 0; i <= 6; i++) { const u = i / 6; P.push([x + u * sp, 764 + Math.sin(u * Math.PI) * 16]); } stroke(P, 70 + k, 1.6, { col: hsl(354, 60, 40), force: true }); } }
    // a car passes him in the passing lane, early
    const cx = lerp(-500, 2600, inv(T_A, 222.4, t));
    if (t < 222.4) withT(() => { s.translate(cx, 768); part([[-120, 0], [-110, -40], [-50, -46], [-20, -80], [70, -80], [100, -46], [130, -40], [134, 0]], { fill: hsl(196, 40, 44), shade: hsl(200, 40, 32), shadeShift: [0, 10], seed: 80, inkW: .9 }); for (const wx of [-70, 80]) part(lump(wx, 0, 20, 20, 81 + wx, 10), { fill: hsl(240, 8, 14), seed: 82 + wx, inkW: .6 }); });
    // lane dashes between the lanes; each one lets go and floats up
    const dg = 300, dLen = 140;
    const base = Math.floor((V * tt) / dg);
    const ds = [];
    for (let j = -2; j < 10; j++) {
      const i = base + j, wx = i * dg - V * tt, tl = dashLift(i);
      let x = wx, y = 846, rot = 0, h = 0;
      if (t > tl) { const d = t - tl; h = Math.pow(d, 1.35) * 70; x = wx + snoise(d * .4, i) * 80 * Math.min(1, d) + d * 40 * (hash(i + 3) - .3); y = 846 - h; rot = snoise(d * .3, i + 9) * 1.2 * Math.min(1, d * .6); }
      ds.push({ i, x, y, rot, h });
    }
    o.dashesBehind = ds.filter((d) => d.h < 1);
    for (const d of o.dashesBehind) part([[d.x, d.y - 5], [d.x + dLen, d.y - 5], [d.x + dLen - 8, d.y + 6], [d.x - 8, d.y + 6]], { fill: hsl(48, 50, 88), seed: 200 + (d.i % 40), sharp: 30, inkW: .5, wob: .4, reg: .4 });
    if (o.noPlane) { for (const d of ds.filter((d) => d.h >= 1)) withT(() => { s.translate(d.x + dLen / 2, d.y); s.rotate(d.rot); part([[-dLen / 2, -5], [dLen / 2, -5], [dLen / 2 - 8, 6], [-dLen / 2 - 8, 6]], { fill: hsl(48, 60, 90), seed: 200 + (d.i % 40), sharp: 30, inkW: .5, wob: .4, reg: .4 }); }); return; }
    // his shadow, left on the road
    s.save(); s.globalAlpha = .5 * clamp(1 - rise / 400); part(lump(880, ROADY + 6, 300 * (1 - rise / 900), 16, 90, 12), { fill: hsl(250, 25, 12), seed: 91, ink: false, wob: .5 }); s.restore();
    // him
    const hang = smooth(inv(LIFT0 - .1, LIFT0 + .8, t)), awe = smooth(inv(LIFT0 + .3, LIFT0 + 1.6, t));
    const bounce = t < LIFT0 ? Math.abs(Math.sin(tt * 9)) * 2.5 : 0;
    PL.side(880 + snoise(t * .3, 92) * 8, ROADY - rise - bounce + Math.sin(t * 1.7) * 6 * hang, .62, -.05 * hang + snoise(t * .4, 93) * .02 * hang,
      { roll: rollAt(t), hang, look: [lerp(.6, .1, awe), lerp(.05, .85, awe)], brow: awe, open: awe * .45 * (1 - smooth(inv(C1 - 1.5, C1, t)) * .5), lid: blinkAt(t, 5), split: o.split || 0, outline: o.outline });
    // floating dashes in front of him
    for (const d of ds.filter((d) => d.h >= 1)) withT(() => { s.translate(d.x + dLen / 2, d.y); s.rotate(d.rot); const gl = clamp(d.h / 300); s.save(); s.globalCompositeOperation = 'screen'; s.fillStyle = rgrad(0, 0, 4, 90, [[0, hsl(48, 80, 80, .4 * gl)], [1, hsl(48, 80, 70, 0)]]); s.fillRect(-120, -120, 240, 240); s.restore(); part([[-dLen / 2, -5], [dLen / 2, -5], [dLen / 2 - 8, 6], [-dLen / 2 - 8, 6]], { fill: hsl(48, 60, 90), seed: 200 + (d.i % 40), sharp: 30, inkW: .5, wob: .4, reg: .4 }); });
  });
}
function blinkAt(t, seed) { const p = 3.4 + hash(seed) * 1.6, ph = ((t + hash(seed + 3) * 5) % p) / p; return ph < .045 ? Math.sin(ph / .045 * Math.PI) : 0; }
// The take-off from BEHIND, matching the 16-bit racer's framing (crt_start.png): road to a centre vanishing
// point, horizon at 37.5% height, him low centre, wingspan ~40% of the frame. 218.75-223.75 is replaced by a
// generative morph, so 223.75 is the anchor frame: same spot and size as the sprite, just leaving the road.
const VPX = 960, VPY = 405, KZ = 600, RW = 1.06;
const zY = (z) => VPY + KZ / z, zX = (x, z) => VPX + x * KZ / z;
function behindDash(lane, i, t) {
  const sp = 7, gap = 2.6, base = i * gap + 1, z0 = base - ((t - T_A) * sp) % gap;
  const tl = 220.3 + hash(i * 7 + lane * 3 + 11) * 3.2;
  let z = z0, h = 0, spin = 0;
  if (t > tl) { const d = t - tl, zs = base - ((tl - T_A) * sp) % gap; z = zs - d * 1.4; h = Math.pow(d, 1.3) * .5; spin = d * (1 + hash(i + lane * 9)) * (hash(i * 3 + lane) > .5 ? 1 : -1); }
  return { z, h, spin };
}
function liftAt(t) { return Math.pow(smooth(inv(222.9, C1 + .6, t)), 1.3) * 620; }
function shotRoad(t, tt, len) {
  T = t; HAND = HANDS.clean; HUE = 0; REGK = 1;
  fx({ warp: 1, acid: 0 });
  const lift = liftAt(t), camUp = lift * .38, u = smooth(inv(223.2, C1 + .6, t));
  withT(() => {
    s.translate(0, camUp + snoise(t * .7, 2) * 2);
    skyGrad(-500 - camUp, VPY + 10, [[0, hsl(234, 32, 30)], [.55, hsl(296, 24, 52)], [.9, hsl(20, 55, 70)], [1, hsl(34, 65, 78)]]);
    s.save(); s.globalCompositeOperation = 'screen'; s.fillStyle = rgrad(VPX, VPY - 10, 10, 420, [[0, hsl(40, 90, 80, .55)], [1, hsl(30, 80, 60, 0)]]); s.fillRect(300, -100, 1320, 700); s.restore();
    for (let i = 0; i < 5; i++) { const r = rng(10 + i), cx = r() * 2200 - 140 + snoise(t * .1, i) * 30, cy = 80 + r() * 200 - camUp * .1; part(lump(cx, cy, 150 + r() * 110, 28 + r() * 16, 11 + i), { fill: hsl(320 + r() * 30, 30, 72, .9), shade: hsl(260, 20, 56, .9), shadeShift: [0, -12], seed: 12 + i, inkW: .6, hatch: false }); }
    // mountains and a small city at the horizon, like the racer's backdrop
    part([[-300, VPY], [-60, 290], [180, 360], [420, 270], [640, 350], [900, 300], [1180, 350], [1420, 260], [1700, 340], [2000, 290], [2300, VPY]], { fill: hsl(250, 18, 44), shade: hsl(252, 20, 34), shadeShift: [10, 0], seed: 20, inkW: .8 });
    for (let i = 0; i < 16; i++) { const r = rng(300 + i), bx = 120 + i * 110 + r() * 40, bw = 50 + r() * 50, bh = 50 + r() * 120; part(rect(bx, VPY - bh, bx + bw, VPY + 2), { fill: hsl(236, 16, 30 + r() * 10), seed: 310 + i, sharp: 30, inkW: .7 }); for (let w = 0; w < 4; w++) dot(bx + 10 + r() * (bw - 20), VPY - bh + 12 + r() * (bh - 24), 2.5, hsl(48, 80, 75, .9)); }
    part([[-300, VPY], [2300, VPY], [2300, 1700], [-300, 1700]], { fill: hsl(95, 22, 38), shade: hsl(100, 22, 30), shadeShift: [0, -30], seed: 21, sharp: 90, inkW: .8 });
    // the road to the vanishing point, with its shoulders
    part([[zX(-.02, 1), VPY], [zX(.02, 1), VPY], [zX(RW, .5), zY(.5)], [zX(-RW, .5), zY(.5)]], { fill: hsl(232, 9, 30), shade: hsl(236, 10, 24), shadeShift: [0, -40], seed: 50, sharp: 70, inkW: 1 });
    for (const sd of [-1, 1]) stroke([[VPX + sd * 4, VPY], [zX(sd * RW * .97, .9), zY(.9)], [zX(sd * RW * .97, .5), zY(.5)]], 51 + sd, 1.6, { col: hsl(45, 30, 82), force: true });
    // roadside poles receding
    for (let i = 0; i < 7; i++) { const z = 1 + ((i * 2.2 - (t - T_A) * 7) % 15.4 + 15.4) % 15.4; for (const sd of [-1, 1]) { const x = zX(sd * 1.6, z), y = zY(z), h = 380 / z; stroke([[x, y], [x, y - h]], 60 + i * 2 + sd, Math.max(.4, 2 / Math.sqrt(z))); } }
    // dashed lane lines; the dashes peel up off the road and tumble into the sky
    const D = [];
    for (const lane of [-.37, .37]) for (let i = 0; i < 14; i++) { const d = behindDash(lane, i, t); if (d.z > .55 && d.z < 40) D.push({ ...d, lane, i }); }
    D.sort((a, b) => b.z - a.z);
    const drawDash = (d) => {
      if (d.h <= 0) { const z1 = d.z, z2 = d.z + .9, w = .025; part([[zX(d.lane - w, z1), zY(z1)], [zX(d.lane - w, z2), zY(z2)], [zX(d.lane + w, z2), zY(z2)], [zX(d.lane + w, z1), zY(z1)]], { fill: hsl(48, 45, 90), seed: 200 + d.i, dense: true, wob: .3, reg: .2 }); return; }
      const k = KZ / d.z, x = zX(d.lane * (1 + d.h * 4), d.z), y = zY(d.z) - d.h * k * 1.2, L = Math.min(110, Math.max(8, .45 * k)), Wd = Math.min(12, Math.max(3, .025 * k * 1.2));
      withT(() => { s.translate(x, y); s.rotate(d.spin * .8); part(rect(-Wd, -L, Wd, L), { fill: hsl(48, 55, 90), shade: hsl(40, 30, 72), shadeShift: [Wd * .6, 0], seed: 200 + d.i, sharp: 10, wob: .3, reg: .25 }); });
    };
    D.filter((d) => d.h <= 0).forEach(drawDash);
    // his shadow, left on the road
    s.save(); s.globalAlpha = .55 * clamp(1 - lift / 300); part(lump(VPX, 1040, 300 * (1 - lift / 1200), 22, 90, 12), { fill: hsl(250, 25, 12), seed: 91, ink: false, wob: .5 }); s.restore();
    D.filter((d) => d.h > 0 && d.z > 2.2).forEach(drawDash);
    // him, from behind, low centre (the sprite's spot), climbing away and up
    const hang = smooth(inv(222.7, 223.6, t)), bounce = t < 222.9 ? Math.abs(Math.sin(t * 11)) * 3 : 0;
    PL.back(VPX + snoise(t * .4, 92) * 6 * (1 - u), 1035 - lift - bounce - camUp, .62 * (1 - .45 * u), snoise(t * .5, 93) * .03 + Math.sin(t * 1.6) * .03 * hang, { hang });
    D.filter((d) => d.h > 0 && d.z <= 2.2).forEach(drawDash);
  });
}

// ---------------- 2: RISE ----------------
// The world as a flat map below him, squashed into perspective, shrinking as he climbs.
const MAPF = (() => { const r = rng(777), out = []; for (let gx = -6; gx <= 6; gx++) for (let gy = -6; gy <= 6; gy++) { if (Math.abs(gx) < 1 && r() < 2) { r(); continue; } out.push([gx * 420 + (r() - .5) * 60, gy * 380 + (r() - .5) * 60, 380 + r() * 60, 340 + r() * 50, r(), gx * 31 + gy]); } return out; })();
function drawMap(t, z, rot, o = {}) {
  const cols = o.cols || [[80, 28, 46], [52, 40, 56], [96, 22, 38], [38, 34, 62], [120, 16, 42], [64, 30, 50]];
  for (const [x, y, w, h, c, sd] of MAPF) {
    const cc = cols[Math.floor(c * cols.length)];
    part([[x - w / 2, y - h / 2], [x + w / 2, y - h / 2], [x + w / 2, y + h / 2], [x - w / 2, y + h / 2]], { fill: hsl(cc[0], cc[1], cc[2]), shade: hsl(cc[0] + 10, cc[1], cc[2] - 8), shadeShift: [30, 20], seed: 1000 + sd, sharp: 120, wob: 2 / z, reg: 2 / z, inkW: 1 / z });
    if (c > .7) for (let k = 0; k < 6; k++) stroke([[x - w / 2 + 20, y - h / 2 + 30 + k * h / 6], [x + w / 2 - 20, y - h / 2 + 30 + k * h / 6]], sd + k, .6 / z, { force: true, col: hsl(cc[0], cc[1], cc[2] - 12), alpha: .6 });
  }
  // a river
  const R = []; for (let i = 0; i <= 24; i++) { const u = i / 24; R.push([-2800 + u * 5600, -900 + Math.sin(u * 7) * 300 + u * 600]); }
  stroke(R, 1500, 40 / z * z * 1.0, { force: true, col: hsl(205, 40, 52) });
  // the highway, straight through the middle, with its two lanes and dashes
  part([[-90, -3000], [90, -3000], [90, 3000], [-90, 3000]], { fill: hsl(232, 8, 30), seed: 1501, sharp: 200, wob: 1 / z, reg: 1 / z, inkW: 1 / z });
  for (let i = -20; i < 20; i++) { const y = i * 150 + ((t * 120) % 150); if (o.noDash) break; part([[-6, y], [6, y], [6, y + 70], [-6, y + 70]], { fill: hsl(48, 50, 86), seed: 1600 + (i & 31), sharp: 40, wob: .5 / z, reg: .5 / z, ink: false }); }
  // the passing lane traffic, tiny
  for (let i = 0; i < 7; i++) { const y = ((i * 860 - t * 260) % 6000 + 6000) % 6000 - 3000; part([[22, y], [62, y], [62, y + 90], [22, y + 90]], { fill: hsl(hash(i) * 360, 40, 55), seed: 1700 + i, sharp: 30, wob: .5 / z, reg: .5 / z, inkW: .8 / z }); }
  // town lights
  for (let i = 0; i < 60; i++) { const r = rng(1800 + i), x = 600 + r() * 900, y = -400 + r() * 900; dot(x, y, 10 + r() * 6, hsl(45, 80, 72, .9)); }
}
function shotRise(t, tt, len) {
  T = t; HAND = HANDS.paint; HUE = tt * 1.5; REGK = 1;
  const u = tt / len, ac = smooth(inv(232.5, C2, t));
  fx({ warp: 1.15, acid: .25 * ac, band: .14 * ac, sat: .05 * ac });
  withT(() => {
    const fr = [[960, 540, 1], [920, 480, 1.55], [960, 520, 1.18]][t < 229.625 ? 0 : t < 232.2917 ? 1 : 2]; // reframed on strong drum hits
    cam(fr[0], fr[1], fr[2], snoise(t * .2, 6) * .01);
    skyGrad(-200, 420, [[0, hsl(250, 26, 40)], [.7, hsl(310, 25, 62)], [1, hsl(25, 50, 76)]]);
    // the map in perspective
    const z = 1.5 * Math.pow(.17, ease.inOut(u * .92 + .04));
    withT(() => {
      s.beginPath(); s.rect(-200, 330, 2400, 1200); s.clip();
      s.translate(960 - 160, 700 + 120 * u); s.scale(z, z * .42); s.rotate(.5 + tt * .025); drawMap(t, z, 0);
    });
    // haze where the land meets the sky
    s.fillStyle = vgrad(300, 560, [[0, hsl(25, 50, 78, 1)], [.35, hsl(25, 45, 74, .6)], [1, hsl(25, 40, 70, 0)]]); s.fillRect(-200, 290, 2400, 300);
    // clouds rising past, between him and the ground; thicker near the end
    for (let i = 0; i < 9; i++) {
      const r = rng(2000 + i), sp = 140 + r() * 120, y = 1400 - ((tt * sp + r() * 1600) % 1900), x = r() * 2200 - 140, w = 260 + r() * 260;
      const a = .5 + .45 * smooth(inv(C2 - 3.5, C2, t));
      part(lump(x, y, w, w * .35, 2010 + i), { fill: hsl(30, 25, 94, a), shade: hsl(280, 15, 78, a), shadeShift: [0, -w * .12], seed: 2020 + i });
    }
    // floating dashes drifting up beside him
    for (let i = 0; i < 12; i++) { const r = rng(2100 + i), y = 1200 - ((tt * (50 + r() * 70) + r() * 1400) % 1500), x = 200 + r() * 1500 + snoise(t * .3, i) * 40; withT(() => { s.translate(x, y); s.rotate(snoise(t * .2, 2110 + i) * 1.5); part([[-50, -4], [50, -4], [44, 5], [-54, 5]], { fill: hsl(48, 60, 90, .95), seed: 2120 + i, sharp: 30, wob: .3, reg: .3 }); }); }
    // him, high over it all, looking down, mouth open
    PL.side(900 + snoise(t * .25, 2200) * 20, 470 + Math.sin(t * 1.3) * 10, .5, -.03 + snoise(t * .3, 2201) * .03,
      { hang: 1, roll: rollAt(t), look: [.15, .9], brow: 1, open: .35 + .1 * Math.sin(t * .8), lid: blinkAt(t, 6) });
  });
}

// ---------------- 3: SKY of drifting outlines ----------------
const SKYOBJ = (() => { const r = rng(3000), out = []; for (let i = 0; i < 46; i++) out.push({ k: Math.floor(r() * 5), x: r() * 2400 - 240, y: r() * 1300 - 110, sc: .5 + r() * 1.3, vx: (r() - .5) * 90, vy: (r() - .5) * 40, rot: (r() - .5) * .6, h: r() * 360, sd: 3000 + i }); return out; })();
function outlineThing(o, t, alpha = 1) {
  const x = o.x + o.vx * (t - C2), y = o.y + o.vy * (t - C2), X = ((x % 2600) + 2600) % 2600 - 340, Y = ((y % 1400) + 1400) % 1400 - 160;
  const col = hsl(o.h + t * 20, 70, 72, alpha);
  withT(() => {
    s.translate(X, Y); s.rotate(o.rot + snoise(t * .2, o.sd) * .4); s.scale(o.sc, o.sc);
    if (o.k === 0) part(lump(0, 0, 90, 34, o.sd, 12), { seed: o.sd, inkCol: col, inkW: 1 / o.sc, wob: 1 / o.sc });
    else if (o.k === 1) part(PLANE, { seed: o.sd, inkCol: col, inkW: 1 / o.sc, seg: 2, wob: .5 / o.sc, reg: .5 / o.sc });
    else if (o.k === 2) part([[-50, -5], [50, -5], [44, 6], [-56, 6]], { seed: o.sd, inkCol: col, sharp: 20, inkW: 1 / o.sc });
    else if (o.k === 3) part(lump(0, 0, 50, 50, o.sd, 10), { seed: o.sd, inkCol: col, inkW: 1 / o.sc });
    else { const P = []; for (let i = 0; i < 30; i++) { const a = i * .5, r = 4 + i * 2.2; P.push([Math.cos(a + t) * r, Math.sin(a + t) * r]); } stroke(P, o.sd, 1 / o.sc, { col, dense: false }); }
  });
}
function skyPath(t) { const u = (t - C2) * .19; return [960 + Math.sin(u * TAU * .5) * 420, 520 + Math.sin(u * TAU) * 150, Math.cos(u * TAU) * .12]; }
function shotSky(t, tt, len) {
  T = t; HAND = HANDS.scratch; HUE = tt * 6; const k = acidKick(t, 2.2), ramp = smooth(inv(C2, C3, t));
  REGK = 1 + k * 1.2 + ramp * .8;
  fx({ warp: 1.3 + ramp, acid: .7, acidMirror: .45, acidPeel: .5, band: .2 + ramp * .45, sat: .1 + ramp * .1, peel: ramp * .3 });
  withT(() => {
    const sf = [[960, 540, 1], [1180, 560, 1.32], [760, 680, 1.3], [960, 520, 1.08]][t < 237.7083 ? 0 : t < 240.625 ? 1 : t < 243.5833 ? 2 : 3]; // cuts on strong drum hits
    cam(sf[0], sf[1], sf[2] + tt * .006, snoise(t * .2, 6) * .03);
    skyGrad(-600, 1500, [[0, hsl(262, 40, 24)], [.5, hsl(222, 36, 36)], [1, hsl(180, 30, 40)]]);
    SKYOBJ.forEach((o) => outlineThing(o, t));
    // the band appears out of the outlines while its stems play: piano low left, sax on the right
    const fp = env(t, C2 + .9, C3 - .7, 1.1) * clamp(SEs('piano', t) * 3.5), fs = env(t, C2 + 1.8, C3 - .4, 1.1) * clamp(SEs('other', t) * 3.2);
    piano(430 + tt * 12 + snoise(t * .2, 61) * 20, 850 + Math.sin(t * .6) * 14, .68, -.08 + snoise(t * .25, 62) * .06, t, fp);
    sax(1560 + snoise(t * .2, 63) * 25, 520 + Math.sin(t * .5) * 20, .9, t, fs);
    // echoes: earlier positions of him along his loop, outline only, one hue each (no muddy fills)
    const NE = Math.round(ramp * 4);
    const [x, y, a] = skyPath(t);
    // each echo steps further out along a fan, so they read as separate drawings, never a tangle
    for (let e = NE; e >= 1; e--) { const te = t - e * .5, [ex, ey, ea] = skyPath(te), ang = e * 1.3 + tt * .2, d = e * 150 * ramp; PL.side(ex + Math.cos(ang) * d, ey + Math.sin(ang) * d * .7, .46 * (1 - e * .1), ea, { outline: hsl(e * 70 + t * 30, 85, 72), hang: 1, spin: te * 40 }); HAND = HANDS.scratch; }
    PL.side(x, y, .46, a, { hang: 1, split: .04 + k * .2 + ramp * .12, look: [.8 * Math.sin(t * .7), .3], brow: .6, open: .3, lid: blinkAt(t, 7) });
  });
}

// ---------------- 4: FOLD (kaleidoscope of the world and his parts) ----------------
function kalSegs(t) { const n = ACID.filter(([o]) => o >= C3 && o <= t).length; return [6, 8, 5, 10, 7, 12][n % 6]; }
// FOLD timeline at its end: he appears small at the centre (255.8), grows head on toward camera, and the
// mandala opens like petals on the strong drum hit at 257.17, fully open on REFORM's first frame (257.3).
const EMERGE0 = 255.8, OPEN_HIT = 257.1667, OPEN0 = 256.875, OPEN1 = C4 - 1 / 48;
function foldParams(t) {
  const tt = t - C3, nD = countBefore(DRUMS, t), lastD = nD ? DRUMS[nD - 1][0] : C3, step = (nD - 1 + ease.out(clamp((t - lastD) / .1))) * .045;
  return { N: kalSegs(t), R: -tt * .22 + step, C: [.5 + snoise(t * .1, 1) * .04, .5 + snoise(t * .1, 2) * .04] };
}
function foldContent(t, tt) {
  fill(hsl(280, 30, 30));
  const zp = 1 + hitSum(DRUMS, t, 12) * .05;
  s.translate(960, 540); s.scale(zp, zp); s.translate(-960, -540);
  withT(() => { s.translate(960, 540 - 190 + ((tt * 90) % 380)); s.scale(.32, .32); s.rotate(-.4); drawMap(t, .32, 0, { cols: [[300, 40, 50], [190, 45, 46], [40, 60, 60], [150, 35, 44], [340, 45, 56], [220, 40, 40]] }); });
  for (let i = 0; i < 5; i++) { const a = i / 5 * TAU + tt * .3, r = 260 + Math.sin(tt * .5 + i) * 60; PL.prop(960 + Math.cos(a) * r, 540 + Math.sin(a) * r * .8, 80, t * 30 + i, 1); }
  for (let i = 0; i < 3; i++) { const a = i / 3 * TAU - tt * .2, r = 150; HAND = HANDS.clean; PL.eye(960 + Math.cos(a) * r, 540 + Math.sin(a) * r, .7, { look: [Math.cos(a + 3), Math.sin(a + 3)], lid: blinkAt(t, 40 + i) }); HAND = HANDS.paint; }
  for (let i = 0; i < 4; i++) { const P = []; for (let j = 0; j <= 16; j++) { const u = j / 16; P.push([300 + u * 1320, 540 + Math.sin(u * 5 + tt * 1.2 + i) * 120 + (i - 1.5) * 90]); } stroke(P, 3500 + i, 9, { force: true, col: PC('red') }); }
  withT(() => { s.translate(lerp(-200, 2100, inv(C3 + 2, C4 - 1, t)), 300); s.rotate(.15); s.scale(3, 3); part(PLANE, { fill: PC('body'), shade: PC('bodySh'), shadeShift: [0, 6], seed: 3600, seg: 2, wob: .3, reg: .3 }); part([[44, -2], [-44, -2], [-44, 2], [44, 2]], { fill: PC('red'), seed: 3601, sharp: 20, wob: .2, reg: .2 }); });
}
// --- floating dream artifacts over the fold (drawn on the unfolded top layer) ---
const FLOAT = (() => { const r = rng(9100), kinds = ['dash', 'paper', 'tiny', 'cloud', 'note', 'prop', 'eye', 'sign', 'cup', 'petal', 'dash', 'note', 'petal', 'paper', 'cloud', 'tiny'], out = [];
  for (let i = 0; i < 30; i++) out.push({ i, kind: kinds[i % kinds.length], mode: i % 3, x: r() * 2200 - 140, y: r() * 1200 - 60, vx: (r() - .5) * 260, vy: (r() - .5) * 140, spin: (r() - .5) * 3, sc: .55 + r() * 1.1, ph: r() * 10, h: r() * 360, life: 3 + r() * 3 });
  return out; })();
function artifact(kind, h, sd) {
  const o = { seed: sd, wob: .5, reg: .5, inkW: .9, hatch: false };
  if (kind === 'dash') part(rect(-40, -7, 40, 7), { ...o, fill: hsl(48, 60, 90), sharp: 20 });
  else if (kind === 'paper') { part([[50, 0], [-40, -26], [-24, 0], [-40, 26]], { ...o, fill: hsl(40, 25, 96), sharp: 20 }); stroke([[50, 0], [-24, 0]], sd + 1, .7); }
  else if (kind === 'tiny') part(PLANE, { ...o, fill: hsl(h, 50, 80), seg: 2, wob: .3, reg: .3 });
  else if (kind === 'cloud') part(lump(0, 0, 70, 28, sd, 12), { ...o, fill: hsl(35, 30, 96, .95), shade: hsl(260, 20, 80), shadeShift: [0, -8] });
  else if (kind === 'note') { part(lump(0, 0, 15, 11, sd, 8), { ...o, fill: hsl(h, 70, 75) }); line([[13, -3], [13, -58]], HAND.inkCol, 4); line([[13, -58], [30, -44], [33, -30]], HAND.inkCol, 4); }
  else if (kind === 'prop') PL.prop(0, 0, 46, T * 25 + sd, 1);
  else if (kind === 'eye') PL.eye(0, 0, .55, { look: [Math.sin(T + sd), Math.cos(T * .7 + sd)], lid: blinkAt(T, sd) });
  else if (kind === 'sign') { line([[0, 30], [0, 110]], hsl(210, 8, 60), 6); part([[0, -40], [40, 0], [0, 40], [-40, 0]], { ...o, fill: hsl(48, 90, 56), sharp: 20 }); part(PLANE.map(([x, y]) => [x * .36, y * .36]), { ...o, fill: hsl(240, 10, 15), ink: false, seg: 2, wob: .2, reg: .2 }); }
  else if (kind === 'cup') { part([[-30, -20], [30, -20], [24, 20], [-24, 20]], { ...o, fill: hsl(190, 40, 86), sharp: 15 }); part([[30, -10], [46, -6], [44, 10], [26, 10], [27, 4], [38, 4], [38, -3], [29, -4]], { ...o, fill: hsl(190, 40, 86), seg: 2 }); part(lump(0, 26, 46, 8, sd, 10), { ...o, fill: hsl(190, 30, 92) }); for (let k = 0; k < 2; k++) { const P = []; for (let j = 0; j < 6; j++) P.push([-8 + k * 14 + Math.sin(j + T * 3 + k) * 5, -26 - j * 9]); stroke(P, sd + k, .5); } }
  else if (kind === 'petal') part([[0, -34], [16, -10], [10, 18], [0, 26], [-10, 18], [-16, -10]], { ...o, fill: hsl(330 + (h % 40), 70, 80) });
}
function floaters(t, alpha) {
  const pop = hitSum(DRUMS, t, 11) * .3, tt = t - C3;
  HAND = HANDS.clean;
  for (const f of FLOAT) {
    let x, y, rot, sc = f.sc * (1 + pop), a = alpha;
    if (f.mode === 1) {                                   // spiralling in toward the centre, then born again at the rim
      const ph = ((tt + f.ph) % f.life) / f.life, r = (1 - ph) * 900 + 30, an = f.ph + ph * 5 + tt * .2;
      x = 960 + Math.cos(an) * r * 1.3; y = 540 + Math.sin(an) * r; rot = an + Math.PI / 2; sc *= .4 + (1 - ph) * .8; a *= clamp(ph * 8) * clamp((1 - ph) * 6);
    } else {                                              // tumbling across through the wedges
      x = ((f.x + f.vx * tt) % 2400 + 2400) % 2400 - 240; y = ((f.y + f.vy * tt + Math.sin(tt + f.ph) * 40) % 1300 + 1300) % 1300 - 110; rot = f.ph + f.spin * tt;
    }
    if (a <= .01) continue;
    withT(() => { s.globalAlpha = a; s.translate(x, y); s.rotate(rot); s.scale(sc, sc); artifact(f.kind, f.h + tt * 30, 9200 + f.i); });
  }
  // the band floats through too
  piano(560 + Math.sin(tt * .4) * 140, 840 + Math.cos(tt * .5) * 40, .34, Math.sin(tt * .6) * .2, t, alpha * (1 + pop * .5));
  sax(1460 + Math.cos(tt * .35) * 120, 360 + Math.sin(tt * .5) * 50, .5, t, alpha);
  // every big drum hit pops a ring of petals and dashes out from the centre
  for (const h of recent(DRUMS, t, .9)) { if (h.v < .55) continue; const r0 = 120 + h.age * 900, k = 1 - h.age / .9;
    for (let j = 0; j < 8; j++) { const an = j / 8 * TAU + h.i; withT(() => { s.globalAlpha = alpha * k; s.translate(960 + Math.cos(an) * r0 * 1.2, 540 + Math.sin(an) * r0); s.rotate(an + h.age * 4); s.scale(.8, .8); artifact(j % 2 ? 'petal' : 'dash', h.i * 40, 9500 + j); }); } }
}
// the REFORM view, drawn into the current layer (so FOLD can draw it behind its opening petals)
function reformMelt(t) { return meltAt(t) * smooth(inv(C4, C4 + .6, t)); }
function reformCam(t) { const snap = snapAt(t); cam(960, 520, 1 + snap * .05, snoise(t * .3, 6) * .03); }
function reformPlane(t) {
  const tt = t - C4, snap = snapAt(t), z = .78 + Math.sin(tt * .4) * .04;
  PL.front(960, 760 + Math.sin(t * 1.2) * 10, z, snoise(t * .3, 4100) * .05, { hang: 1, brow: .5 + snap, open: .2 + snap * .6, look: [snoise(t * .4, 4101), .2], lid: blinkAt(t, 9), split: reformMelt(t) * .5 });
}
function reformScene(t, withPlane = true) {
  const tt = t - C4;
  withT(() => {
    reformCam(t);
    fill(hsl(250, 30, 20));
    const dp = 1 + hitSum(DRUMS, t, 9) * .08;
    for (let i = 12; i >= 0; i--) { const R = ((i + 1 - ((tt * .8) % 1)) * 120 + 40) * dp; part(lump(960, 540, R * 1.35, R, 4000 + i, 18), { fill: hsl(250 + i * 25, 40, 30 + (i % 2) * 14), seed: 4010 + i, inkW: .6, wob: 3, hatch: false }); }
    const fg = env(t, C4 + .6, C5 - .3, .8) * clamp(SEs('guitar', t) * 3), fsx = env(t, C4 + 1.4, C5 - .3, .8) * clamp(SEs('other', t) * 3.2);
    guitar(380 + Math.sin(t * .5) * 30, 260 + Math.sin(t * .7) * 20, .52, -.45 + Math.sin(t * .6) * .1, t, fg);
    sax(1560 + Math.sin(t * .45) * 30, 300, .55, t, fsx);
    if (withPlane) reformPlane(t);
  });
}
// the shader's kaleidoscope, redone in 2D so each wedge can peel away on its own
let FOLDCV = null;
function petals(t, open, fp) {
  if (!FOLDCV) { FOLDCV = document.createElement('canvas'); FOLDCV.width = Math.round(W * RS); FOLDCV.height = Math.round(H * RS); }
  const M = FOLDCV.getContext('2d'), keep = s;
  M.setTransform(1, 0, 0, 1, 0, 0); M.clearRect(0, 0, FOLDCV.width, FOLDCV.height); M.setTransform(RS, 0, 0, RS, 0, 0);
  s = M; withT(() => { HAND = HANDS.paint; HUE = (t - C3) * 14; REGK = 1 + acidKick(t) * 2; foldContent(t, t - C3); }); s = keep;
  const w = TAU / fp.N, cx = fp.C[0] * W, cy = fp.C[1] * H, R = 2400;
  for (let k = 0; k < 2 * fp.N; k++) {
    const j = Math.floor(k / 2), base = j * w + w / 2 - fp.R, a0 = k * w / 2 - fp.R, bis = a0 + w / 4;
    const d = ease.in(open) * 1500 + open * 120, sp = (k % 2 ? 1 : -1) * open * 1.1, sc = 1 + open * .6;
    withT(() => {
      s.translate(cx + Math.cos(bis) * d, cy + Math.sin(bis) * d); s.rotate(sp); s.scale(sc, sc);
      s.beginPath(); s.moveTo(0, 0); s.arc(0, 0, R, a0, a0 + w / 2 + .004); s.closePath(); s.clip();
      s.rotate(base); if (k % 2 === 0) s.scale(1, -1);
      s.drawImage(FOLDCV, -cx, -cy, W, H);
      if (open > 0) { s.globalAlpha = .5 * open; s.strokeStyle = hsl(45, 80, 85); s.lineWidth = 3; s.beginPath(); s.moveTo(0, 0); s.lineTo(R, 0); s.stroke(); }
    });
  }
}
function shotFold(t, tt, len) {
  T = t; HAND = HANDS.paint; HUE = tt * 14; REGK = 1 + acidKick(t) * 2;
  const kin = smooth(inv(C3, C3 + .5, t)), fp = foldParams(t), opening = t >= OPEN0;
  // the petals loosen and start to lift (.25), then burst open on the hit
  const open = t < OPEN_HIT ? .25 * ease.inOut(inv(OPEN0, OPEN_HIT, t)) : lerp(.25, 1, ease.out(inv(OPEN_HIT, OPEN1, t))), hand = smooth(inv(OPEN0, OPEN1, t));
  const bigHit = recent(DRUMS, t, .5).filter((h) => h.v > .55).reduce((m, h) => m + Math.exp(-h.age * 16), 0);
  const F0 = { flash: bigHit * .09, warp: 1.4 + hitSum(DRUMS, t, 10) * .8, acid: .6, band: .55, sat: .18 };
  const F1 = { flash: 0, warp: 1.2, acid: 0, band: .3, sat: .12 };          // REFORM's opening values
  const mixF = Object.fromEntries(Object.keys(F0).map((k) => [k, lerp(F0[k], F1[k], hand)]));
  fx({ top: 1, ...mixF, kal: opening ? 0 : kin, kalN: fp.N, kalR: fp.R, kalC: fp.C });
  if (!opening) withT(() => foldContent(t, tt));
  else { T = t; HAND = HANDS.clean; HUE = 0; REGK = 1; reformScene(t, true); }
  // the unfolded top layer: reactive shapes, floating artifacts, the opening petals, and him
  s = TOP2D;
  if (opening) { T = t; petals(t, open, fp); }
  T = t; HAND = HANDS.paint; HUE = tt * 14; REGK = 1;
  const fade = kin * (1 - smooth(inv(OPEN0, OPEN_HIT + .05, t)));
  mandalaTop(t, 960, 540, fade);
  floaters(t, fade * smooth(inv(C3 + .3, C3 + 1.2, t)));
  // him: small at the centre, growing head on toward camera into REFORM's pose
  const g = inv(EMERGE0, OPEN_HIT, t);
  if (g > 0) {
    T = t; HAND = HANDS.clean; HUE = (t - C4) * 5; REGK = 1;
    const e = ease.in(g), tz = .78 + Math.sin((t - C4) * .4) * .04, z = lerp(.04, tz, e);
    withT(() => {
      // fly in from the mandala centre to REFORM's camera framing
      const camK = smooth(inv(EMERGE0 + .4, OPEN_HIT, t));
      if (camK > 0) { const snap = snapAt(t); s.translate(W / 2, H / 2); s.rotate(snoise(t * .3, 6) * .03 * camK); s.scale(lerp(1, 1 + snap * .05, camK), lerp(1, 1 + snap * .05, camK)); s.translate(-W / 2, -H / 2); s.translate(0, (540 - 520) * camK); }
      const yBody = lerp(540, 760 + Math.sin(t * 1.2) * 10 - 262 * tz, ease.inOut(g));
      if (g >= 1) reformPlane(t);
      else PL.front(960, yBody + 262 * z, z, snoise(t * .3, 4100) * .05 * e, { hang: 1, brow: .5, open: .2 + .3 * Math.sin(g * Math.PI), look: [0, .2], lid: blinkAt(t, 9), split: 0 });
    });
  }
  s = SRC2D;
}

// ---------------- 5: REFORM (head on, tunnel running backwards) ----------------
function shotReform(t, tt, len) {
  T = t; HAND = HANDS.clean; const n = swellsBefore(t), snap = snapAt(t), m = reformMelt(t);
  HUE = n * 47 + tt * 5; REGK = 1 + m * 2 + snap * 2;
  fx({ warp: 1.2 + snap * 2, hue: n * .9, band: .3 + m * .4, sat: .12, melt: m, flash: snap * .18, peel: snap * .6 });
  reformScene(t, true);
}

// ---------------- 6: WALTZ ----------------
// The two mirrored planes stop being a mirror and dance. Bars of three beats from FEAT.beats (~0.57 s a beat):
// bar 1 (263.97) they rise nose to nose and bow; bars 2-3 one full waltz turn; bar 4 a quicker half turn;
// bar 5 (270.57) the lead dips his partner, landing on bar 6's downbeat (272.37); hold, then release (273.5-274.1).
const WB = (() => { const b = FEAT.beats.filter((x) => x >= C5 - .01 && x < C6 + .7); const bars = []; for (let i = 0; i + 3 <= b.length; i += 3) bars.push(b[i]); return bars; })();
function barPhase(t) { for (let i = WB.length - 1; i >= 0; i--) if (t >= WB[i]) { const nx = WB[i + 1] ?? WB[i] + 1.7; return [i, (t - WB[i]) / (nx - WB[i])]; } return [0, 0]; }
function shotWaltz(t, tt, len) {
  T = t; HAND = HANDS.clean; const snap = snapAt(t, 9);
  HUE = tt * 3; REGK = 1;
  fx({ warp: 1.15, band: .12, sat: .08, hue: (swellsBefore(t) - 7) * .07, flash: snap * .06 });
  const [bi, ph] = barPhase(t), at = (k) => WB[Math.min(k, WB.length - 1)];
  withT(() => {
    cam(960, 540, 1.05, 0);
    drawRoad(222.6 + tt * .1, { noPlane: true, camUp: 200, tt: 4 + tt * .3 });
    // a soft spotlight from the moon over the dance floor of air
    s.save(); s.globalCompositeOperation = 'screen'; s.fillStyle = rgrad(960, 480, 20, 520, [[0, hsl(50, 60, 85, .35)], [1, hsl(50, 60, 70, 0)]]); s.fillRect(300, 0, 1320, 1000); s.restore();
    const rise = ease.out(inv(C5, at(1), t)), bow = Math.sin(Math.PI * clamp(inv(C5 + .2, at(1) - .1, t))) * .28;
    // the turn angle: one turn over bars 2-3, half a turn in bar 4
    const th = ease.inOut(inv(at(1), at(3), t)) * TAU + ease.inOut(inv(at(3), at(4), t)) * Math.PI;
    const dip = ease.inOut(inv(at(4) + .2, at(5), t)) * (1 - ease.inOut(inv(at(5) + 1.15, C6 - .05, t)));
    const bob = 18 * Math.cos(TAU * ph) * (t > at(1) && t < at(4) ? 1 : .4), rock = .06 * Math.sin(TAU * ph);
    const R = lerp(240, 190, dip), cy = 640 - rise * 120 + bob;
    const P = [-1, 1].map((sd) => { const a = th + (sd > 0 ? 0 : Math.PI); return { sd, x: 960 + Math.cos(a) * R * 1.0, depth: Math.sin(a) }; });
    P.sort((p, q) => q.depth - p.depth);              // far one first
    for (const p of P) {
      const other = P.find((q) => q !== p), face = clamp((other.x - p.x) / (R * 1.2), -1, 1);   // turn like a card to keep facing the partner
      const sc = .56 * (1 - .12 * p.depth), lead = p.sd < 0;
      let y = cy + p.depth * 30, ang = rock - bow * Math.sign(face || 1);
      if (!lead) { y += dip * 150; ang += -dip * .75 * Math.sign(face || 1); }
      else ang += dip * .3 * Math.sign(face || 1);
      const x = p.x + (lead ? 0 : -Math.sign(face || 1) * dip * 30);
      withT(() => {
        s.translate(x, y); s.scale(Math.abs(face) < .08 ? .08 * Math.sign(face || 1) : face, 1);
        PL.side(0, 0, sc, ang * Math.sign(face || 1), { hang: 1, look: [.9, lead ? .1 : -.2 + dip * .4], brow: .4 + dip * .6, open: lead ? .15 + dip * .2 : .1 + dip * .5, lid: blinkAt(t, lead ? 21 : 22) });
      });
    }
    // little notes of the waltz drifting off them on each downbeat
    for (let k = 1; k < WB.length; k++) { const a = t - WB[k]; if (a < 0 || a > 1.6) continue; const f = 1 - a / 1.6; withT(() => { s.globalAlpha = f; const x = 960 + (k % 2 ? -1 : 1) * (80 + a * 120), y = cy - 160 - a * 110; part(lump(x, y, 11, 8, 900 + k, 8), { fill: hsl(48, 70, 86), seed: 900 + k, inkW: .7, wob: .3, reg: .3, hatch: false }); line([[x + 10, y - 2], [x + 10, y - 40]], HAND.inkCol, 2.6); line([[x + 10, y - 40], [x + 22, y - 30]], HAND.inkCol, 2.6); }); }
  });
}

// ---------------- 7: GLIDE ----------------
function shotGlide(t, tt, len) {
  T = t; HAND = HANDS.paint; const calm = smooth(inv(C6, T_B - 1.6, t));
  HUE = (1 - calm) * 40; REGK = 1;
  fx({ warp: 1.1, band: .3 * (1 - calm), sat: .05 * (1 - calm), hue: (1 - calm) * .5 });
  withT(() => {
    cam(960, 540, 1, 0);
    skyGrad(0, 1080, [[0, hsl(232, 38, 18)], [.6, hsl(250, 30, 30)], [1, hsl(280, 25, 40)]]);
    s.save(); s.globalCompositeOperation = 'screen'; s.fillStyle = rgrad(1500, 220, 10, 260, [[0, hsl(50, 30, 80, .5)], [1, hsl(50, 30, 60, 0)]]); s.fillRect(1100, -100, 800, 700); s.restore();
    dot(1500, 220, 48, hsl(48, 30, 90)); dot(1488, 212, 9, hsl(48, 20, 80));
    // the lane dashes, settled into the sky as stars
    for (let i = 0; i < 40; i++) { const r = rng(5100 + i), x = r() * 2000 - 40 - tt * 6, y = r() * 600; withT(() => { s.translate(x, y); s.rotate(r() * TAU); part([[-12, -2], [12, -2], [10, 2], [-14, 2]], { fill: hsl(48, 60, 88, .5 + .5 * r()), seed: 5150 + i, sharp: 10, wob: .2, reg: .2, ink: false }); }); }
    // cloud floor
    for (let i = 0; i < 9; i++) { const r = rng(5200 + i), x = ((r() * 2600 - tt * (30 + r() * 20)) % 2600 + 2600) % 2600 - 300, y = 840 + r() * 140; part(lump(x, y, 340 + r() * 200, 90 + r() * 40, 5210 + i), { fill: hsl(255, 18, 56 + r() * 10), shade: hsl(250, 22, 40), shadeShift: [0, -30], seed: 5220 + i }); }
    HAND = HANDS.clean;
    PL.side(800 + tt * 14, 540 + Math.sin(t * 1.0) * 8, .5, -.02 + Math.sin(t * .5) * .02, { hang: .8, look: [.7, .2], lid: .3 + blinkAt(t, 11) * .7, brow: .2, open: 0 });
  });
}

chapter('I', T_A, T_B, [
  [T_A, shotRoad],
  [C1, shotRise],
  [C2, shotSky],
  [C3, shotFold],
  [C4, shotReform],
  [C5, shotWaltz],
  [C6, shotGlide],
]);
