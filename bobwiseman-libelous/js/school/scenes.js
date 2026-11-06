// The beats, staged on the word. Locations move forward: the street (ink yard -> drain -> publishing
// house, then the tilt up the stacks), the classroom, the open book, the lunch counter.
// Every drawing holds for 2 frames (since()/q2()), most idles hold for 3 (q3()).

const YARD_BARRELS = [];
for (let k = 0; k < 10; k++) YARD_BARRELS.push({ x: 120 + k * 175, y: 2050, s: .62, seed: 300 + k });
for (let k = 0; k < 7; k++) YARD_BARRELS.push({ x: 220 + k * 230, y: 2110, s: .8, seed: 320 + k });
for (let k = 0; k < 5; k++) YARD_BARRELS.push({ x: 330 + k * 330, y: 2178, s: 1, seed: 340 + k });
const HIT = YARD_BARRELS[YARD_BARRELS.length - 3];  // the front barrel the weight lands on (x 990)
const DRAIN = { x: 2350, y: 2180 };
const HOUSE = { x: 3500, y: 2168, s: .85 };
const MAN = { x: 4150, y: 2178, s: .8 };
const WAL = { x: 4700, y: 2182 };
const ODO = { x: 2880, y: 1800, s: .6 };
const STACKS = [{ x: 3150, max: 34 }, { x: 3325, max: 41 }, { x: 3500, max: 48 }, { x: 3675, max: 39 }, { x: 3850, max: 31 }];
const STACK_Y = 2196, BOOK_H = 30;

// step tables: the value for each 2-frame drawing after a cue, holding the last one
function steps(t, cue, tab, before = null) { const lt = since(t, cue); if (lt < 0) return before; const k = Math.round(lt * 12); return tab[Math.min(k, tab.length - 1)]; }
const POPS = [[.55, 1.45], [1.22, .8], [.94, 1.06], [1, 1]];
// an eased move between two cues, drawn on 2s
function mv(t, a, b, fn = smooth) { return fn(clamp((q2(t - a) ) / (b - a))); }
// a blink every few seconds, held on 3s
function blinkAt(t, seed) { const k = Math.floor(t / 2.7 + rnd(seed, 1)); const bt = k * 2.7 + rnd(seed, k) * 1.8; return (t >= bt && t < bt + .125) ? 1 : 0; }

// ---------- cameras ----------
function camKeys(keys, t) {
  const tq = q2(t);
  let i = 0; while (i + 1 < keys.length && keys[i + 1].t <= tq) i++;
  const a = keys[i], b = keys[i + 1];
  if (!b || a.cut || tq < a.t) return a;
  const u = a.d ? smooth(clamp((tq - a.t) / a.d)) : 0;
  return { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), z: lerp(a.z, b.z, u) };
}
// key k: hold at (x,y,z) from t; if d is set, move to the next key's framing over d seconds
let STREET_CAM = null;
function streetCam(t) {
  if (!STREET_CAM) STREET_CAM = [
    { t: T0, x: 960, y: 1960, z: 1 },
    { t: B.panDrain, x: 960, y: 1960, z: 1, d: .75 },
    { t: B.panDrain + .8, x: 2350, y: 1960, z: 1 },
    { t: B.panHouse, x: 2350, y: 1960, z: 1, d: .75 },
    { t: B.panHouse + .8, x: 3650, y: 1960, z: 1 },
    { t: B.wallet - .04, x: 3650, y: 1960, z: 1, d: .5 },
    { t: B.wallet + .5, x: 3950, y: 1900, z: .82 },
    { t: B.wheels - .2, x: 3950, y: 1900, z: .82, d: .45 },
    { t: B.wheels + .3, x: 4100, y: 1930, z: .9 },
    { t: B.not, x: 3350, y: 1960, z: 1, cut: true },
    { t: B.tiltUp, x: 3350, y: 1960, z: 1, d: .5 },
    { t: B.tiltUp + .55, x: 3420, y: 800, z: 1 },
  ];
  // a cut holds its own framing until the next key
  const keys = STREET_CAM; const tq = q2(t);
  let i = 0; while (i + 1 < keys.length && keys[i + 1].t <= tq) i++;
  const a = keys[i], b = keys[i + 1];
  if (!b || !a.d) return a;
  const u = smooth(clamp((tq - a.t) / a.d));
  return { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), z: lerp(a.z, b.z, u) };
}
function applyCam(g, c) { g.setTransform(c.z, 0, 0, c.z, 960 - c.x * c.z, 540 - c.y * c.z); }

// ---------- the street ----------
function sceneStreet(g, t, cam) {
  applyCam(g, cam);
  g.drawImage(BG.street, 0, 0);
  const vy0 = cam.y - 540 / cam.z - 60, vy1 = cam.y + 540 / cam.z + 60, vx0 = cam.x - 960 / cam.z - 300, vx1 = cam.x + 960 / cam.z + 300;
  if (vx0 < 2000) drawYard(g, t);
  if (vx1 > 1000 && vx0 < 2900) drawDrain(g, t);
  if (vx1 > 2500) { drawOdometer(g, t); drawHouse(g, t); drawOrder(g, t); drawMan(g, t); drawWallet(g, t); drawStacks(g, t, vy0, vy1); }
}
function drawYard(g, t) {
  celSet(t, [4, 3]);
  const hitT = B.tons, inkT = B.ink;
  for (const b of YARD_BARRELS) {
    const d = Math.hypot(b.x - HIT.x, (b.y - HIT.y) * 3);
    const bob = Math.sin(q3(t) * 5 + b.seed) * .012;
    let sl = steps(t, hitT + d / 2600, [.55, 1, .75, .45, .25, .1, 0], 0);
    let sy = 1 + bob, sx = 1;
    if (b === HIT) {
      const sq = steps(t, hitT, [.78, .9, .86], 1); sy = sq; sx = 1 + (1 - sq) * .4;
      const big = steps(t, inkT, [1.4, 1.7, 1.3, .9, .6], 0); sl = Math.max(sl, big);
    }
    barrel(g, b.x, b.y, b.s, b.seed, { sy, sx, slosh: sl, tilt: Math.sin(q3(t) * 3 + b.seed) * .012 });
  }
  // the 1 TON weight: falls, lands on "tons", sits there
  const top = HIT.y - 226 * steps(t, hitT, [.78, .9, .86], 1);
  const fall = since(t, hitT - .29);
  if (fall >= 0) {
    const landed = t >= hitT - 1 / 48;
    const u = landed ? 1 : clamp((fall + ON2) / .29);
    const y = landed ? top : top - (1 - u * u) * 1100;
    const sq = steps(t, hitT, [.72, 1.12, .96, 1], 1.15);
    weight(g, HIT.x, y, 1, 400, sq);
    if (!landed) for (let k = 0; k < 3; k++) stroke(g, [[HIT.x - 60 + k * 60, y - 330], [HIT.x - 60 + k * 60, y - 470]], 410 + k, { lw: 5 });
    // impact star
    const st = steps(t, hitT, [1, 1.25, .8], 0);
    if (st) { g.save(); g.globalAlpha = 1; cel(g, starPts(HIT.x, top + 10, 190 * st, 80 * st, 9, .2), PAL.gold, 420 + Math.round(st * 10), { lw: 6 }); g.restore(); weight(g, HIT.x, top, 1, 400, sq); }
  }
  // the ink: splashes on "ink", then a puddle that runs off toward the drain
  const sp = since(t, inkT);
  if (sp >= 0 && sp < .7) for (let k = 0; k < 9; k++) {
    const a = -Math.PI / 2 + (k - 4) * .32, v = 700 + rnd(430, k) * 400, tt = sp + .04;
    const side = k < 4 ? -1 : k > 4 ? 1 : (k % 2 ? 1 : -1);
    const x = HIT.x + side * 150 + Math.cos(a) * v * tt * 1.4, y = top - 20 + Math.sin(a) * v * tt + 1600 * tt * tt;
    if (y < HIT.y + 40) drop(g, x, y, 16 + rnd(431, k) * 14, 440 + k);
  }
  const pud = since(t, inkT + .08);
  if (pud >= 0) {
    const r = Math.min(1, (pud + ON2) / .35);
    inkPuddle(g, [[HIT.x - 160 * r, HIT.y + 18], [HIT.x - 60, HIT.y + 6], [HIT.x + 80, HIT.y + 4], [HIT.x + 200 * r, HIT.y + 14], [HIT.x + 120 * r, HIT.y + 44], [HIT.x - 80 * r, HIT.y + 46]], 450);
  }
}
// the stream to the drain and the spiral
function drawDrain(g, t) {
  celSet(t, [4, 3]);
  const st = since(t, B.thats - .1);
  // grate
  cel(g, ellPts(DRAIN.x, DRAIN.y, 120, 30, 12), '#3d3b4a', 460, { lw: 6 });
  if (st >= 0) {
    const lead = lerp(HIT.x + 220, DRAIN.x, smooth(clamp((st + ON2) / .65)));
    const gulp = since(t, B.waste), tail = gulp < 0 ? HIT.x + 120 : lerp(HIT.x + 120, DRAIN.x - 60, smooth(clamp((gulp + ON2) / .6)));
    const pts = [];
    const nseg = 10;
    if (lead - tail > 60) {
      for (let i = 0; i <= nseg; i++) { const x = lerp(tail, lead, i / nseg); pts.push([x, DRAIN.y + 6 + Math.sin(x * .012 + q2(t) * 9) * 6]); }
      pts.push([lead + 40, DRAIN.y + 24]);
      for (let i = nseg; i >= 0; i--) { const x = lerp(tail, lead, i / nseg); pts.push([x, DRAIN.y + 44 + Math.sin(x * .011 + 2 + q2(t) * 7) * 6]); }
      pts.push([tail - 30, DRAIN.y + 26]);
      inkPuddle(g, pts, 470);
    }
    // the pool spiralling down the drain, shrinking after "waste"
    const pool = since(t, B.thats + .55);
    if (pool >= 0) {
      const shrink = gulp < 0 ? 1 : Math.max(0, 1 - (gulp + ON2) / .7);
      if (shrink > 0) {
        const rx = 190 * shrink + 10, ry = 48 * shrink + 4;
        inkPuddle(g, ellPts(DRAIN.x, DRAIN.y, rx, ry, 12), 480);
        const ph = q2(t) * 7;
        for (let k = 0; k < 3; k++) {
          const P = []; for (let i = 0; i <= 14; i++) { const u = i / 14, a = ph + k * TAU / 3 + u * 4.5, r = (1 - u) * .92; P.push([DRAIN.x + Math.cos(a) * rx * r, DRAIN.y + Math.sin(a) * ry * r]); }
          stroke(g, P, 490 + k, { lw: 5, ink: '#8fb4ff', amp: 1 });
        }
      }
    }
    // a glug: one bubble pops up out of the drain
    const gl = since(t, B.waste + .4);
    if (gl >= 0 && gl < .6) { const r = 18 + gl * 60, y = DRAIN.y - 30 - gl * 140; if (gl < .45) cel(g, ellPts(DRAIN.x + 10, y, r, r * .9, 9), '#2b3a74', 495, { lw: 5 }); else puff(g, DRAIN.x + 10, y, 40, (gl - .45) / .15, 7); }
  }
}
// press chugs: the presses hit on the sung words of lines 52-55
let CHUG = null;
function chugAt(t) {
  if (!CHUG) { CHUG = []; for (const li of [52, 53, 54, 55]) for (const w of LN[li].words) CHUG.push(w.s); }
  let c = -1; for (const x of CHUG) if (x <= t + 1e-6) c = x;
  if (c < 0) return 0;
  return [1, .55, .2, 0][Math.min(3, Math.round(since(t, c) * 12))];
}
function drawHouse(g, t) {
  celSet(t, [5, 3]);
  const ch = t >= B.at - .3 ? chugAt(t) : 0;
  const puffs = [];
  if (CHUG) for (const c of CHUG) { const lt = since(t, c); if (lt >= 0 && lt < 1.2) puffs.push([lt * 30, lt * 260, 30 + lt * 30, Math.round(c * 10)]); }
  pubHouse(g, HOUSE.x, HOUSE.y, HOUSE.s, 500, { chug: ch, sy: 1 - ch * .03, sx: 1 + ch * .015, blink: blinkAt(t, 5), look: t > B.by ? [.8, 0] : [0, .2], puffs: puffs.slice(-5) });
  // printed sheets fly out of the window on each chug
  if (CHUG) CHUG.forEach((c, k) => {
    const lt = since(t, c); if (lt < 0 || lt > .6 || c < B.at) return;
    const x = HOUSE.x - 300 * HOUSE.s - lt * 700 * (k % 2 ? 1 : .7), y = HOUSE.y - 260 * HOUSE.s - lt * 420 + lt * lt * 1300;
    paperSheet(g, x, y, .9, lt * 6 * (k % 2 ? 1 : -1), 520 + k);
  });
}
function drawOrder(g, t) {
  const lt = since(t, B.order - .1); if (lt < 0) return;
  const door = [HOUSE.x + 240 * HOUSE.s, HOUSE.y - 205 * HOUSE.s];
  const u = clamp((lt + ON2) / (B.placed - B.order + .1));
  const x = lerp(4900, door[0], smooth(u)), y = lerp(1700, door[1], smooth(u)) - Math.sin(u * Math.PI) * 220;
  celSet(t, [3, 3]);
  const rot = u < 1 ? (1 - u) * 8 : -.08;
  paperSheet(g, x, y, 1.15, rot, 560);
  if (t >= B.placed - 1 / 48) { const sq = steps(t, B.placed, [1.5, .8, 1], 1); cel(g, ellPts(door[0], door[1] - 24, 12 * sq, 12 * sq, 7), PAL.tomato, 561, { lw: 4 }); }
}
function drawMan(g, t) {
  const lt = since(t, B.by); if (lt < 0) return;
  celSet(t, [4, 4]);
  let x = MAN.x, roll = 0;
  if (t < B.man - 1 / 48) { const u = clamp((lt + ON2) / (B.man - B.by)); x = lerp(5000, MAN.x, u); roll = -(x - MAN.x) / 120; }
  const pop = steps(t, B.man, POPS, [1, 1]);
  const fist = t >= B.fist - 1 / 48 ? steps(t, B.fist, [.6, 1.12, .96, 1], 1) : 0;
  const lookW = t > B.wallet ? [1, 0] : [-.3, .2];
  g.save(); g.translate(x, MAN.y); g.scale(pop[0], pop[1]);
  fistMan(g, 0, 0, MAN.s, 600, { roll, fist, look: lookW, blink: blinkAt(t, 6), mouth: t > B.fist ? 'grin' : 'smile', open: t > B.fist ? .2 : 0 });
  g.restore();
}
function drawWallet(g, t) {
  const lt = since(t, B.wallet); if (lt < 0) return;
  celSet(t, [5, 4]);
  const inU = clamp((lt + ON2) / .34);
  let x = lerp(5400, WAL.x, smooth(inU));
  let s = .5;
  if (t >= B.so - 1 / 48) s = steps(t, B.so, [.86, .74, .8], .5);
  if (t >= B.big - 1 / 48) s = steps(t, B.big, [1.4, 1.16, 1.28, 1.25], .8);
  const wv = t >= B.wheels - 1 / 48 ? steps(t, B.wheels, [.4, .8, 1.05, 1], 0) : 0;
  const came = since(t, B.came);
  let roll = 0;
  if (came >= 0) { const u = clamp((came + ON2) / .4); x -= 110 * smooth(u); roll = -110 * smooth(u) / 30; }
  // the adjustable lid: the crank winds it up and down, then it pops open on "lid"
  let lid = 0, crank = 0;
  const adj = since(t, B.adjustable);
  if (adj >= 0) { lid = [.12, .3, .48, .36, .2, .38, .56, .66, .5, .62][Math.min(9, Math.round(adj * 12))]; crank = Math.round(adj * 12) * .9; }
  if (t >= B.lid - 1 / 48) { lid = steps(t, B.lid, [1.12, .92, 1], 1); crank = 9 * .9; }
  wallet(g, x, WAL.y, s, 700, { wheels: wv, roll, lid, crank });
}
function drawOdometer(g, t) {
  const lt = since(t, B.not); if (lt < 0) return;
  celSet(t, [4, 3]);
  const pop = steps(t, B.not, POPS, [1, 1]);
  // value and spin state
  let value = 0, spin = 0;
  const sp1 = since(t, B.couple1), st1 = since(t, B.hundred), sp2 = since(t, B.but), st2 = since(t, B.million);
  if (sp1 >= 0) { spin = sp1 + .01; }
  if (st1 >= 0) { spin = 0; value = 200; }
  if (sp2 >= 0) { spin = sp2 + .01; value = 200; }
  if (st2 >= 0) { spin = 0; value = 2000000; }
  g.save(); g.translate(ODO.x, ODO.y + 130); g.scale(pop[0], pop[1]); g.translate(-ODO.x, -ODO.y - 130);
  cel(g, [[ODO.x - 14, ODO.y], [ODO.x + 14, ODO.y], [ODO.x + 14, 2170], [ODO.x - 14, 2170]], '#7f8794', 790, { lw: 5, n: 2 });
  const bump = steps(t, st2 >= 0 ? B.million : B.hundred, [1.12, .95, 1], 1);
  odometer(g, ODO.x, ODO.y, ODO.s * (spin ? 1 : bump), value, spin, 800);
  g.restore();
}
// how many books are in each stack at t
function stackN(t, k) {
  const S = STACKS[k], c1 = since(t, B.couple1 + k * .05);
  if (c1 < 0) return 0;
  let n = Math.min(6 + k % 2, 1 + Math.round(c1 * 12));
  const m = since(t, B.million + k * .04);
  if (m >= 0) n = Math.min(S.max, n + Math.round(m * 12) * (m > B.stacks - B.million ? 7 : 1));
  return n;
}
function drawStacks(g, t, vy0, vy1) {
  if (t < B.couple1 - .1) return;
  celSet(t, [3, 3]);
  STACKS.forEach((S, k) => {
    const n = stackN(t, k);
    // draw only the books in view
    for (let i = 0; i < n; i++) { const by = STACK_Y - i * BOOK_H; if (by < vy0 || by - BOOK_H > vy1) continue; bookStackOne(g, S.x, by, i, 900 + k); }
  });
  drawBookOnTop(g, t);
}
function bookStackOne(g, x, by, k, seed) {
  const bw = 170, bh = BOOK_H, ox = (rnd(seed, k) - .5) * 26, ww = bw * (.9 + rnd(seed, k, 1) * .2), col = BOOK_COLS[Math.floor(rnd(seed, k, 2) * BOOK_COLS.length)];
  cel(g, [[x + ox - ww / 2, by], [x + ox + ww / 2, by], [x + ox + ww / 2, by - bh], [x + ox - ww / 2, by - bh]], col, seed * 100 + k, { lw: 4.5, lin: true, amp: 1.2 });
  g.fillStyle = PAL.cream; g.fillRect(x + ox + ww / 2 - 22, by - bh + 7, 16, bh - 12);
}
// THE BOOK rides the middle stack up, turns to camera, hops off
function drawBookOnTop(g, t) {
  if (t < B.million) return;
  const n = stackN(t, 2), topY = STACK_Y - n * BOOK_H;
  celSet(t, [4, 3]);
  let y = topY, s = .62, rot = 0, look = [0, 0], mood = 'smile', legs = 0;
  if (t < B.title) { rot = .0; look = [-.6, .4]; }
  else { look = [0, 0]; }
  const hop = since(t, B.book56);
  if (hop >= 0) { const u = (hop + ON2); y = topY - Math.max(0, Math.sin(Math.min(1, u / .45) * Math.PI) * 120); mood = 'beam'; legs = 1; }
  const off = since(t, B.book56 + .4);
  if (off >= 0) { const u = off + ON2; y = topY - 160 + u * u * 4000; s = .62 + u * 1.2; }
  const sq = steps(t, B.title, [[1.1, .9], [.96, 1.04], [1, 1]], [1, 1]);
  theBook(g, STACKS[2].x, y, s, 1000, { sx: sq[0], sy: sq[1], rot, look, mood, legs, blink: blinkAt(t, 9), arms: hop >= 0 ? [1.1, 1.1] : [.3, -.3] });
}

// ---------- the classroom ----------
function sceneClassroom(g, t) {
  const camx = lerp(1000, 1060, mv(t, B.hired, B.doctor));
  g.setTransform(1, 0, 0, 1, 960 - camx, 0);
  g.drawImage(BG.room, 0, 0);
  celSet(t, [4, 3]);
  const bx = 780, by = ROOM.deskTop + 4;
  // the doctor
  const dl = since(t, B.hired);
  const DX = 1240, DY = 900;
  if (dl >= 0) {
    if (t >= B.doctor - 1 / 48) {
      const pop = steps(t, B.doctor, POPS, [1, 1]);
      let hold = null, arm = 0, phd = 0, mouthK = null;
      if (t >= B.with58 - 1 / 48) { hold = 'diploma'; arm = steps(t, B.with58, [.7, 1.05, 1], 1); }
      if (t >= B.phd - 1 / 48) { phd = 1; mouthK = 'grin'; }
      const writing = t >= B.wrote - 1 / 48 && t < B.book59 - 1 / 48;
      if (t >= B.and59 - 1 / 48) { hold = writing ? 'pen' : null; arm = writing ? .25 : 0; }
      const lean = writing ? .12 : 0;
      g.save(); g.translate(DX, DY); g.rotate(lean); g.scale(-pop[0] * .82, pop[1] * .82);
      doctor(g, 0, 0, 1, 1100, { flip: true, hand: writing ? [(DX - 905) / .82 - 30, -385] : null, hold, arm, phd, blink: blinkAt(t, 11), look: writing ? [.8, .6] : [.7, .1], mouth: mouthK, open: .3, penWag: writing ? (Math.round(q2(t) * 12) % 2 ? .25 : -.15) : 0 });
      g.restore();
      // the diploma pop
    }
    const pu = since(t, B.hired);
    if (pu >= 0 && pu < .8) puff(g, DX, DY - 330, 170, (pu + ON2) / .8, 3);
  }
  // the book
  const fall = since(t, B.was57);
  const open1 = since(t, B.he), close1 = since(t, B.book59), open2 = since(t, B.it60);
  const isOpen = (open1 >= 0 && close1 < 0) || open2 >= 0;
  if (isOpen) {
    const u = open2 >= 0 ? (open2 < ON2 * 1.5 ? .5 : 1) : (open1 < ON2 * 1.5 ? .5 : 1);
    const scrib = since(t, B.wrote);
    openBook(g, bx, by + 20, .82, 1200, u, open2 >= 0 ? 1 : (scrib < 0 ? 0 : Math.min(1, (scrib + ON2) / 1.95)));
  } else {
    let y = by, sq = [1, 1];
    if (fall >= 0 && fall < .1) y = by - 700 + fall * 7000;
    else sq = steps(t, B.was57 + .08, [[1.3, .7], [.86, 1.16], [1.04, .97], [1, 1]], [1, 1]);
    const title = (t >= B.facts - 1 / 48) ? 2 : (t >= B.nutritional - 1 / 48 ? 1 : 0);
    const beam = t >= B.facts - 1 / 48;
    const bsq = steps(t, B.facts, [[1.08, .94], [.97, 1.03], [1, 1]], [1, 1]);
    const lookB = t > B.hired ? [1, -.2] : [0, 0];
    const back = close1 >= 0;
    const tag = since(t, B.free);
    const tagA = tag < 0 ? null : (tag < ON2 ? -1.2 : .55 * Math.cos((tag) * 10) * Math.exp(-tag * 1.6));
    const tagSq = tag >= 0 && tag < ON2 ? .8 : 1;
    theBook(g, bx, y, 1, 1300, {
      sx: sq[0] * bsq[0] * (back ? steps(t, B.book59, [1.15, .95, 1], 1) : 1), sy: sq[1] * bsq[1] * (back ? steps(t, B.book59, [.85, 1.05, 1], 1) : 1),
      title, mood: beam ? (t < B.and58 ? 'beam' : 'smile') : (fall >= 0 && fall < .3 ? 'o' : 'smile'),
      look: back ? [0, 0] : lookB, blink: blinkAt(t, 13), arms: beam && t < B.and58 ? [1.2, 1.2] : [.25, -.25], mirror: back, tag: tagA,
      legs: 0,
    });
    void tagSq;
  }
}

// ---------- inside the book ----------
function scenePage(g, t) {
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.drawImage(BG.page, 0, 0);
  celSet(t, [4, 3]);
  const lift = t >= B.bun - 1 / 48 ? steps(t, B.bun, [.3, .62, .5], .5) : 0;
  const glow = t >= B.lettuce - 1 / 48 ? (Math.round(q2(t) * 12) % 3 === 0 ? .6 : 1) : 0;
  const bpop = steps(t, B.said, POPS, [1, 1]);
  g.save(); g.translate(470, 560); g.scale(bpop[0], bpop[1]); burger(g, 0, 0, 1.05, 1400, { lift, glow }); g.restore();
  // the heart for "health"
  if (t >= B.health - 1 / 48) {
    const p = steps(t, B.health, POPS, [1, 1]), beat = Math.round(q3(t) * 8) % 4 === 0 ? 1.12 : 1;
    g.save(); g.translate(790, 300); g.scale(p[0] * beat, p[1] * beat); cartoonHeart(g, 0, 0, 62, 1410, PAL.tomato);
    eyes(g, 0, -10, 46, 1411, { gap: .6, look: [0, 0] }); mouth(g, 0, 20, 30, t >= B.no ? 'flat' : 'smile', 1412);
    g.restore();
  }
  // right page: the glass of water and the cup
  if (t >= B.water1 - 1 / 48) { const p = steps(t, B.water1, POPS, [1, 1]); g.save(); g.translate(1290, 590); g.scale(p[0], p[1]); waterGlass(g, 0, 0, 1.05, 1420); g.restore(); }
  if (t >= B.theres61 - 1 / 48) {
    const p = steps(t, B.theres61, POPS, [1, 1]);
    const fz = t >= B.coke - 1 / 48 ? q2(t - B.coke) * 3 + 1 : q3(t) * .5;
    g.save(); g.translate(1630, 590); g.scale(p[0], p[1]); fizzCup(g, 0, 0, 1.0, 1430, fz); g.restore();
  }
  if (t >= B.water2 - 1 / 48) {
    const lt = since(t, B.water2), u = clamp((lt + ON2) / .5);
    const p = steps(t, B.water2, POPS, [1, 1]);
    g.save(); g.translate(1600, lerp(330, 210, smooth(u))); g.scale(p[0] * .8, p[1] * .8); h2oBubble(g, 0, 0, 1, 1440); g.restore();
  }
  // the doctor's pointer
  let tip = null;
  if (t >= B.lettuce - .25) {
    const taps = [[B.lettuce, [500, 448]], [B.bun, [430, 420]], [B.health, [740, 330]], [B.no, [520, 450]], [B.joke, [520, 450]], [B.drink, [1380, 420]], [B.water1, [1375, 330]], [B.coke, [1745, 420]]];
    let cur = taps[0], prev = null;
    for (const tp of taps) if (t >= tp[0] - .2) { prev = cur; cur = tp; }
    const lt = since(t, cur[0] - .2);
    const u = clamp((lt + ON2) / .2), from = prev && prev !== cur ? prev[1] : [1100, 200];
    tip = [lerp(from[0], cur[1][0], smooth(u)), lerp(from[1], cur[1][1], smooth(u))];
    const tap = steps(t, cur[0], [14, 6, 0], 0); tip[1] += tap;
  }
  if (tip) pointer(g, tip[0] + 640, tip[1] - 240, tip[0], tip[1], 1450);
}

// ---------- the lunch counter ----------
const SEATS = [{ x: 720, p: 0 }, { x: 1060, p: 1 }, { x: 1400, p: 2 }, { x: 1680, p: 3 }];
const FRY_SPOTS = [[600, 0], [880, 0], [1220, 0], [1540, 0], [520, 1], [960, 1], [1300, 1], [1600, 1], [700, 2], [1110, 2], [1450, 2], [820, 3]];
const BOOKC = { x: 300, y: 612 }, JAR = { x: 1840, y: 616 };
function counterCam(t) {
  const keys = [
    { t: B.counter, x: 1000, y: 540, z: 1 },
    { t: B.if63 - .08, x: 1000, y: 540, z: 1, d: .42 },
    { t: B.if63 + .4, x: 640, y: 470, z: 1.55 },
    { t: B.and64 + .25, x: 640, y: 470, z: 1.55, d: .5 },
    { t: B.and64 + .8, x: 1000, y: 540, z: 1 },
    { t: B.never - .1, x: 1000, y: 540, z: 1, d: .5 },
    { t: B.never + .45, x: 1420, y: 520, z: 1.45 },
  ];
  const tq = q2(t); let i = 0; while (i + 1 < keys.length && keys[i + 1].t <= tq) i++;
  const a = keys[i], b = keys[i + 1];
  if (!b || !a.d) return a;
  const u = smooth(clamp((tq - a.t) / a.d));
  return { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), z: lerp(a.z, b.z, u) };
}
function sceneCounter(g, t) {
  const cam = counterCam(t); applyCam(g, cam);
  g.drawImage(BG.counter, 0, 0);
  celSet(t, [4, 3]);
  // the people, behind the counter
  SEATS.forEach((S, k) => {
    const cue = B.people + k * ON2;
    if (t < cue - 1 / 48) return;
    const pop = steps(t, cue, POPS, [1, 1]);
    const happy = t >= B.felt - 1 / 48;
    const ord = t >= B.ordered - 1 / 48 && t < B.never;
    const munch = t >= B.never - 1 / 48;
    const hop = ord ? steps(t, B.ordered + k * .04, [-30, -10, 0], 0) : 0;
    g.save(); g.translate(S.x, 720); g.scale(pop[0], pop[1]);
    person(g, 0, 0, .9, PEOPLE[S.p], 1500 + k * 20, {
      blink: happy && !ord && !munch ? 1 : blinkAt(t, 20 + k), arms: ord ? 1 : 0, hop,
      mouth: ord ? 'grin' : munch ? (Math.round(q3(t) * 8 + k) % 2 ? 'o' : 'smile') : 'smile', open: ord ? .6 : 0, look: [0, 0],
    });
    g.restore();
    // hearts float up on "good"
    const hl = since(t, B.good + k * .06);
    if (hl >= 0 && hl < 2.2) { const y = 330 - hl * 160, x = S.x + Math.sin(hl * 5 + k) * 26; cartoonHeart(g, x, y, 28 + hl * 6, 1600 + k, PAL.pink); }
  });
  // the counter top in front of them (repainted over the people)
  g.drawImage(BG.counter, 0, CTR.top - 4, BG.counter.width, H - CTR.top + 4, 0, CTR.top - 4, BG.counter.width, H - CTR.top + 4);
  // the book on the counter: stamps itself LEGIT, gets a gold star
  const stamp = t >= B.legit - 1 / 48 ? steps(t, B.legit, [1.3, .92, 1], 1) : 0;
  const star = t >= B.and64 - 1 / 48 ? steps(t, B.and64, [1.4, .9, 1], 1) : 0;
  const raise = t >= B.print - 1 / 48 && t < B.legit - 1 / 48;
  const bsq = stamp ? steps(t, B.legit, [[1.1, .88], [.97, 1.03], [1, 1]], [1, 1]) : [1, 1];
  theBook(g, BOOKC.x, BOOKC.y, .72, 1700, { sx: bsq[0], sy: bsq[1], title: 2, mirror: true, tag: .08 * Math.sin(q3(t) * 3), stamp, star, mood: stamp ? 'beam' : 'smile', arms: raise ? [1.3, .2] : [.25, -.25], blink: blinkAt(t, 30), look: [.4, 0] });
  if (raise || (stamp && since(t, B.legit) < .3)) {
    // the rubber stamp in its raised hand, then pressed
    const sx = BOOKC.x - 30, sy = raise ? BOOKC.y - 330 : BOOKC.y - 140;
    cel(g, rrPts(sx - 34, sy - 40, 68, 40, 8), PAL.tomato, 1710, { lw: 5 }); cel(g, rrPts(sx - 12, sy - 100, 24, 62, 10), '#7a5232', 1711, { lw: 5 });
  }
  // fries multiply on the counter
  if (t >= B.fries - 1 / 48) {
    const n = Math.min(FRY_SPOTS.length, 2 + Math.round(since(t, B.fries) * 12) * 2);
    for (let k = 0; k < n; k++) { const [fx, row] = FRY_SPOTS[k]; const p = steps(t, B.fries + Math.floor(k / 2) * ON2, POPS, [1, 1]); g.save(); g.translate(fx, CTR.top + 40 + row * 10); g.scale(p[0] * .8, p[1] * .8); fryBoat(g, 0, 0, 1, 1800 + k); g.restore(); }
  }
  // the tip jar, empty, and a fly circling it
  tipJar(g, JAR.x, JAR.y + 20, .78, 1900);
  if (t >= B.and64b - .2) {
    const a = q2(t) * 6.5, fx = JAR.x + Math.cos(a) * 120, fy = JAR.y - 230 + Math.sin(a * 2) * 40 + Math.sin(a) * 30;
    fly(g, fx, fy, 1.4, 1910, Math.round(t * 24) % 2);
    stroke(g, [[fx - 40 * Math.cos(a), fy - 12], [fx - 70 * Math.cos(a), fy - 4]], 1911, { lw: 2.5 });
  }
}
