// Reform Party, Dali look: Little Bob.
// ---------- Little Bob up through the hole ----------
// "friends with the little big guy": the driver springs up through the hole, takes his hat right off and holds it high
// across "little big guy", swells a size on "big", then puts it back and sinks. Drawn on the car layer (car.js calls it).
function bobPopUp(t) {
  const s = L_(24).s - .1, e = L_(24).e + .6; if (t < s || t > e) return; const hole = PL(0, TOP, 0); if (hole[2] < .3) return; const k = kAt(hole);
  const big = wt(24, 'big'), swell = ease(t, big - .12, big + .12) * (1 - ease(t, big + .45, big + .8)), h = 1.15 * k * (1 + .22 * swell);
  const up = easeOutBack(clamp((t - s) / .55), 1.4) * (1 - ease(t, e - .5, e)), feet = hole[1] + h * lerp(1.05, .36, up);
  // the stop runs so the hat is off and high from just before "little" to the end of "guy" (the module lifts it for u in .3-.8)
  const lit = wt(24, 'little'), D = 2.3, t0 = lit - .45 - .3 * D;
  g.save(); g.beginPath(); g.rect(hole[0] - .8 * k, 0, 1.6 * k, hole[1] + .02 * k); g.clip();
  LITTLE_BOB.draw(g, t, { tIn: s, tOut: e + .01, x0: hole[0], x1: hole[0], y: feet, h, stop: { t0, t1: t0 + D }, shadow: false });
  g.restore();
}

// ---------- Little Bob walks past the embers (4:15-4:25) ----------
// He walks in from off the left edge with the piano and the Junos on their ropes, the Junos hop on the last beats,
// he halts on the beat before the final note, lifts his hat to the embers on that note, then walks on and out at the
// right edge in the silence. Lit by the dying fire: warm on the side that faces it, a rim on the edges, a long shadow
// thrown toward us. Screen-space path (his ground line is fixed), so any end framing keeps him whole and readable.
const BOB_END = { tIn: 255.45, stop: 258.87, lift: 259.49, tOut: 265.7, h: 292, y: 994, beats: [255.55, 256.15, 256.72, 257.33, 257.94] };
const BOB_SCR = mkCanvas(); const bsg = BOB_SCR.getContext('2d');
function bobEndCfg() {
  const B = BOB_END, k = B.h / 330, D = (B.lift - B.stop) / .3;
  return { tIn: B.tIn, tOut: B.tOut, x0: -72 * k, x1: W + 530 * k, y: B.y, h: B.h, stop: { t0: B.stop, t1: B.stop + D }, beats: B.beats, mode: 'card' };
}
function fireLight(t) { // screen position of the fire and how strong its light still is
  const b = burnAmt(t), m = manGeom(); let fx = m.p[0], fy = m.p[1] - 6 * m.k;
  if (m.p[2] < 1 || fx < -400 || fx > W + 400) { fx = W * .56; fy = H * .55; }
  return { fx, fy, f: clamp(b / .75) };
}
// the playa point under a screen pixel (the inverse of P on the ground plane), for the actor check: he walks a fixed
// screen line, so this says where on the playa he and his piano stand in the current framing
function bobGround(sx, sy) {
  const x = (sx - W / 2) / C.f, y = -(sy - H / 2) / C.f, dy = y * CP - SP, dz = y * SP + CP;
  let dx = x, dzw = dz; if (C.sy) { dx = x * C.cy + dz * C.sy; dzw = -x * C.sy + dz * C.cy; }
  if (dy > -1e-4) return null; const l = -C.y / dy; return [C.x + dx * l, C.z + dzw * l];
}
function bobWalk(t) {
  if (typeof rangerTorchPool === 'function') rangerTorchPool(t); // burn.js: the Rangers' torchlight on the board, over the car layer
  if (typeof endLamplighter === 'function') endLamplighter(t); // draft 26: a Lamplighter takes his slot and his beats
  return; // draft 25 (Bob: "can you remove the bob w piano and junos? not working for me"): the end walk is cut
  const cfg = bobEndCfg(); if (!LITTLE_BOB.active(cfg, t)) return;
  const k = cfg.h / 330, sx = LITTLE_BOB.xAt(cfg, t), { fx, fy, f } = fireLight(t);
  // the actor check: he, the piano and the Junos on their ropes are one body, from his front foot (+20) to the last Juno (-500)
  if (ACT.on) { const q0 = bobGround(sx + 20 * k, cfg.y), q1 = bobGround(sx - 500 * k, cfg.y);
    if (q0 && q1) ACT.note('bob:little-bob', (q0[0] + q1[0]) / 2, (q0[1] + q1[1]) / 2, Math.hypot(q0[0] - q1[0], q0[1] - q1[1]) / 2, { h: 1.7, group: 'bob' }); }
  const bx0 = Math.max(0, Math.floor(sx - 560 * k)), bx1 = Math.min(W, Math.ceil(sx + 90 * k)), by0 = Math.max(0, Math.floor(cfg.y - 360 * k)), by1 = H;
  if (bx1 <= bx0) return; const bw = bx1 - bx0, bh = by1 - by0, cy = cfg.y - 170 * k;
  cfg.grade = (kg) => {
    // 1. his long shadow, thrown toward the camera and away from the fire, laid on the playa under him (the piano's and the
    // Junos' with it: they are cut from the same layer). Draft 9 (Dali, dream scale, the answer to "little big guy"): as he
    // comes up to the embers it stretches, as long as the Man was tall, holds through the hat lift, then shrinks back.
    // Draft 11 (audit pass 4): it stretches AWAY from the heap, down the playa toward us, never back across it toward the
    // fire (a fire behind him cannot throw his shadow at itself).
    const sy = .5, sxs = clamp((sx - fx) / 700, -1.3, 1.3) * sy, y0 = cfg.y + 2, mg = manGeom(), gy = mg.p[2] > 1 ? Math.min(mg.p[1], y0 - 120) : y0 - 300, hb = cfg.h;
    const sw = ease(t, BOB_END.stop - 1.5, BOB_END.stop + .1) * (1 - ease(t, BOB_END.lift + 1.3, BOB_END.lift + 3.3)), q = .8;
    const hx = lerp(sxs, clamp(q * (sx - fx) / hb, -1.3, 1.3), sw), hy = lerp(sy, Math.min(1.1, q * (y0 - gy) / hb), sw);
    bsg.setTransform(1, 0, 0, 1, 0, 0); bsg.globalCompositeOperation = 'source-over'; bsg.clearRect(bx0, by0, bw, bh); bsg.drawImage(kg.canvas, bx0, by0, bw, bh, bx0, by0, bw, bh);
    bsg.globalCompositeOperation = 'source-in'; bsg.fillStyle = 'rgb(22,10,28)'; bsg.fillRect(bx0, by0, bw, bh);
    g.save(); g.setTransform(1, 0, -hx, -hy, hx * y0, y0 * (1 + hy)); g.globalAlpha = .28 + .3 * f; g.filter = 'blur(2px)'; // a point at height h above his feet lands at (x + hx h, y0 + hy h)
    g.drawImage(BOB_SCR, bx0, by0, bw, bh, bx0, by0, bw, bh); g.restore();
    // 2. the rim: the edge of him that faces the fire, pulled out of his own alpha
    const dx = fx - sx, dy = fy - cy, dl = Math.hypot(dx, dy) || 1, r = 4.5 * k / .88, ox = dx / dl * r, oy = dy / dl * r;
    bsg.globalCompositeOperation = 'source-over'; bsg.clearRect(bx0, by0, bw, bh); bsg.drawImage(kg.canvas, bx0, by0, bw, bh, bx0, by0, bw, bh);
    bsg.globalCompositeOperation = 'source-in'; bsg.fillStyle = 'rgb(255,168,86)'; bsg.fillRect(bx0, by0, bw, bh);
    bsg.globalCompositeOperation = 'destination-out'; bsg.drawImage(kg.canvas, bx0 + ox, by0 + oy, bw, bh, bx0, by0, bw, bh);
    // 3. the fire light: warm where he is near it, cold night blue away from it, dimming as the fire dies
    const night = [118, 108, 150], warm = mix(night, [255, 196, 152], f), cool = mix(night, [214, 168, 150], f * .55);
    const rg = kg.createRadialGradient(fx, fy, 0, fx, fy, 1250); rg.addColorStop(0, rgb(warm)); rg.addColorStop(1, rgb(cool));
    kg.globalCompositeOperation = 'multiply'; kg.fillStyle = rg; kg.fillRect(bx0, by0, bw, bh);
    kg.globalCompositeOperation = 'lighter'; kg.globalAlpha = .35 + .6 * f; kg.filter = 'blur(1px)'; kg.drawImage(BOB_SCR, bx0, by0, bw, bh, bx0, by0, bw, bh); kg.filter = 'none'; kg.globalAlpha = 1;
  };
  LITTLE_BOB.draw(g, t, cfg);
}

// ---------- draft 26: the last Lamplighter walks past the embers (4:15-4:25) ----------
// Robin on d25: with Little Bob cut the slot was an empty playa, and a character entering there worked. So one of the
// film's own Lamplighters (white robe, flame-pattern hem, red sash, cowl, burn.js) walks Bob's line on Bob's beats:
// in from the left with his pole on his shoulder and a lit lantern swinging at its tip, halts on the beat before the
// final note, raises the lantern high to the embers on that note and holds it, lowers it, and walks on out at the right
// in the silence. A flat profile cut-out like the suits, lit by the dying fire, his long shadow thrown toward us.
const LLE = { tIn: BOB_END.tIn, stop: BOB_END.stop, lift: BOB_END.lift, hold: BOB_END.lift + 1.25, tOut: BOB_END.tOut, h: 300, y: BOB_END.y };
LLE.t1 = LLE.hold + .55; // back on the shoulder, walking on
const LLE_C = mkCanvas(), llx = LLE_C.getContext('2d'), LLE_S = mkCanvas(), lls = LLE_S.getContext('2d'), LLE_M = mkCanvas(), llm = LLE_M.getContext('2d');
function lleX(t) { // screen x of his feet: the same constant walk as Little Bob's, standing from stop to t1
  const x0 = -110, x1 = W + 330, still = LLE.t1 - LLE.stop, v = (x1 - x0) / (LLE.tOut - LLE.tIn - still);
  let w = t - LLE.tIn; if (t >= LLE.t1) w -= still; else if (t >= LLE.stop) w = LLE.stop - LLE.tIn; return x0 + v * w;
}
function lleDraw(c, x, y, s, t) { // the cut-out, feet at (x, y), s px per metre, facing right
  const walking = t < LLE.stop - .25 || t > LLE.t1 + .1, settle = walking ? 1 : 0;
  const ph = (t - LLE.tIn) * 2 * Math.PI * .85, st = Math.sin(ph) * settle, bob = Math.abs(Math.cos(ph)) * .025 * settle;
  // the pole angle: on the shoulder at 28 degrees while walking, eased up to 72 on the final note, held, then back down
  const up = ease(t, LLE.lift - .08, LLE.lift + .32) * (1 - ease(t, LLE.hold, LLE.t1));
  const pre = ease(t, LLE.stop - .3, LLE.stop + .2) * (1 - ease(t, LLE.t1 - .1, LLE.t1 + .4)); // he stands square before the lift
  const ang = (28 + 6 * pre + 38 * up) * Math.PI / 180, lean = .04 * settle - .03 * up;
  c.save(); c.translate(x, y - bob * s); c.scale(s, s); c.transform(1, 0, -lean, 1, 0, 0);
  const robe = '#f4f0e6', robeS = '#d8d0bf', edge = 'rgba(40,24,18,.85)', skin = '#c99a74';
  c.lineJoin = 'round'; c.lineCap = 'round';
  // the pole: on the far shoulder, behind his head and robe, the butt out behind his back
  const sh = [-.02, -1.4], L = 2.9, ux = Math.cos(ang), uy = -Math.sin(ang), back = .55 - .35 * up;
  const butt = [sh[0] - ux * back, sh[1] - uy * back], tip = [sh[0] + ux * (L - back), sh[1] + uy * (L - back)];
  c.strokeStyle = '#5a4430'; c.lineWidth = .065; c.beginPath(); c.moveTo(butt[0], butt[1]); c.lineTo(tip[0], tip[1]); c.stroke();
  c.strokeStyle = 'rgba(30,18,12,.7)'; c.lineWidth = .02; c.beginPath(); c.moveTo(butt[0], butt[1] + .03); c.lineTo(tip[0], tip[1] + .03); c.stroke();
  // feet: dark sandals stepping out under the hem
  c.fillStyle = '#3a2a22'; for (const sd of [-1, 1]) { const f = st * sd; c.beginPath(); c.ellipse(.05 + f * .2, -.03, .13, .045, 0, 0, TAU); c.fill(); }
  // the robe in profile, to the ground, the hem swinging with the stride
  const hb = -.36 - st * .06, hf = .36 + st * .06;
  const robePath = () => { c.beginPath(); c.moveTo(hb, 0); c.quadraticCurveTo(-.32, -.8, -.2, -1.42); c.quadraticCurveTo(-.05, -1.52, .12, -1.45);
    c.quadraticCurveTo(.24, -1.1, .2, -.95); c.quadraticCurveTo(.3, -.5, hf, 0); c.closePath(); };
  robePath(); c.fillStyle = robe; c.fill(); c.lineWidth = .028; c.strokeStyle = edge; c.stroke();
  c.save(); robePath(); c.clip();
  c.fillStyle = robeS; c.beginPath(); c.moveTo(-.4, 0); c.quadraticCurveTo(-.34, -.8, -.22, -1.42); c.lineTo(-.08, -1.42); c.quadraticCurveTo(-.2, -.7, -.16, 0); c.closePath(); c.fill(); // the back of the robe in shade
  c.strokeStyle = 'rgba(120,100,80,.35)'; c.lineWidth = .018; for (const u of [-.1, .08]) { c.beginPath(); c.moveTo(u, -.9); c.quadraticCurveTo(u + .02 + st * .03, -.4, u + st * .05, 0); c.stroke(); } // two folds
  // the flame pattern round the hem
  for (const [col, hi, lo] of [['#d2562a', .3, .1], ['#b8301c', .16, .04]]) { c.fillStyle = col; c.beginPath(); c.moveTo(-.5, .01);
    for (let i = 0; i <= 8; i++) { const u = i / 8, fx = lerp(-.46, .46, u); c.lineTo(fx, -(i % 2 ? hi : lo) - .02 * Math.sin(t * 9 + i)); } c.lineTo(.5, .01); c.closePath(); c.fill(); }
  // the red sash and its tail, blowing back
  c.fillStyle = '#c8402a'; c.beginPath(); c.moveTo(-.27, -1.0); c.lineTo(.22, -.98); c.lineTo(.22, -.9); c.lineTo(-.27, -.92); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(-.24, -.96); c.quadraticCurveTo(-.36, -.8, -.42 - .03 * Math.sin(t * 5), -.62); c.lineTo(-.35, -.62); c.quadraticCurveTo(-.3, -.8, -.18, -.93); c.closePath(); c.fill();
  c.restore();
  // the head in the cowl: a soft round hood back on the head, the face in shadow, a nose and chin in profile
  c.fillStyle = skin; c.beginPath(); c.moveTo(.06, -1.7); c.quadraticCurveTo(.16, -1.71, .15, -1.64); c.lineTo(.19, -1.6); c.lineTo(.15, -1.58); c.quadraticCurveTo(.15, -1.5, .07, -1.49); c.lineTo(.0, -1.5); c.closePath(); c.fill(); c.lineWidth = .02; c.strokeStyle = edge; c.stroke();
  c.fillStyle = '#e6e0d2'; c.beginPath(); c.moveTo(.09, -1.79); c.quadraticCurveTo(.13, -1.9, -.02, -1.92); c.quadraticCurveTo(-.2, -1.9, -.22, -1.7);
  c.quadraticCurveTo(-.23, -1.52, -.12, -1.44); c.lineTo(.02, -1.46); c.quadraticCurveTo(.02, -1.6, .09, -1.79); c.closePath(); c.fill(); c.lineWidth = .026; c.stroke();
  c.fillStyle = 'rgba(70,46,34,.55)'; c.beginPath(); c.moveTo(.08, -1.78); c.quadraticCurveTo(.03, -1.62, .03, -1.48); c.lineTo(-.01, -1.48); c.quadraticCurveTo(-.01, -1.64, .05, -1.79); c.closePath(); c.fill(); // the hood's inner edge
  // both hands on the pole (drawn first, behind him); the lantern hangs from the tip on a cord
  const hand = (u) => [sh[0] + ux * u, sh[1] + uy * u], h1 = hand(.25 + .35 * up), h2 = hand(.62 + .5 * up);
  c.strokeStyle = robe; c.lineWidth = .14; c.beginPath(); c.moveTo(-.05, -1.36); c.quadraticCurveTo(.1, -1.0, h1[0], h1[1]); c.stroke(); // the near sleeve
  c.strokeStyle = robeS; c.lineWidth = .12; c.beginPath(); c.moveTo(.0, -1.3); c.quadraticCurveTo(.3 + .1 * up, -1.05 - .2 * up, h2[0], h2[1]); c.stroke(); // the far sleeve, reaching up the pole
  c.fillStyle = skin; for (const h of [h1, h2]) { c.beginPath(); c.arc(h[0], h[1], .055, 0, TAU); c.fill(); }
  // the lantern: a box lantern with a little peaked roof, swinging on the walk, settling while he holds it up
  const sw = Math.sin(ph * 1 + .6) * .22 * settle + Math.sin(t * 7) * .05 * (1 - settle) * (1 - up) + .12 * (ease(t, LLE.lift - .08, LLE.lift + .2) - ease(t, LLE.lift + .2, LLE.lift + .9)), cord = .22;
  const lx = tip[0] + Math.sin(sw) * cord, ly = tip[1] + Math.cos(sw) * cord;
  c.strokeStyle = '#2a2420'; c.lineWidth = .015; c.beginPath(); c.moveTo(tip[0], tip[1]); c.lineTo(lx, ly); c.stroke();
  c.save(); c.translate(lx, ly); c.rotate(-sw * .6);
  c.fillStyle = '#2e2622'; c.beginPath(); c.moveTo(-.13, .08); c.lineTo(0, -.0); c.lineTo(.13, .08); c.closePath(); c.fill();
  c.fillStyle = '#f2cf86'; c.fillRect(-.1, .08, .2, .26); c.fillStyle = '#fff4cf'; c.fillRect(-.04, .13, .08, .14);
  c.strokeStyle = '#2e2622'; c.lineWidth = .02; c.strokeRect(-.1, .08, .2, .26); c.beginPath(); c.moveTo(0, .08); c.lineTo(0, .34); c.stroke();
  c.fillStyle = '#2e2622'; c.fillRect(-.12, .33, .24, .045); c.restore();
  c.restore();
  return [x + (lx - lean * ly) * s, y + (ly + .2 - bob) * s]; // the lantern flame on screen, for the glow
}
function endLamplighter(t) {
  if (t < LLE.tIn || t >= LLE.tOut) return;
  const s = LLE.h / 1.92, x = lleX(t), y = LLE.y, { fx, fy, f } = fireLight(t);
  if (ACT.on) { const q = bobGround(x, y); if (q) ACT.note('bob:end-lamplighter', q[0], q[1], .35, { h: 1.9, group: 'lamplighters' }); }
  llx.setTransform(1, 0, 0, 1, 0, 0); llx.globalCompositeOperation = 'source-over'; llx.globalAlpha = 1; llx.filter = 'none'; llx.clearRect(0, 0, W, H);
  const lan = lleDraw(llx, x, y, s, t);
  llm.setTransform(1, 0, 0, 1, 0, 0); llm.clearRect(0, 0, W, H); llm.drawImage(LLE_C, 0, 0); // his alpha, to keep the grade on him
  // 1. his long shadow, thrown toward the camera and away from the fire, stretching as he lifts the lantern to it
  const sxs = clamp((x - fx) / 700, -1.3, 1.3) * .5, stretch = ease(t, LLE.stop - 1.2, LLE.lift) * (1 - ease(t, LLE.hold + .4, LLE.t1 + 1.6)), hy = lerp(.5, .95, stretch), hx = sxs * lerp(1, 1.5, stretch);
  lls.setTransform(1, 0, 0, 1, 0, 0); lls.globalCompositeOperation = 'source-over'; lls.clearRect(0, 0, W, H); lls.drawImage(LLE_C, 0, 0);
  lls.globalCompositeOperation = 'source-in'; lls.fillStyle = 'rgb(22,10,28)'; lls.fillRect(0, 0, W, H);
  g.save(); g.setTransform(1, 0, -hx, -hy, hx * y, y * (1 + hy)); g.globalAlpha = .28 + .3 * f; g.filter = 'blur(2px)'; g.drawImage(LLE_S, 0, 0); g.restore();
  // 2. the rim on the edge that faces the fire
  const cy = y - .9 * s, dx = fx - x, dy = fy - cy, dl = Math.hypot(dx, dy) || 1, ox = dx / dl * 4.5, oy = dy / dl * 4.5;
  lls.globalCompositeOperation = 'source-over'; lls.clearRect(0, 0, W, H); lls.drawImage(LLE_C, 0, 0); lls.globalCompositeOperation = 'source-in'; lls.fillStyle = 'rgb(255,168,86)'; lls.fillRect(0, 0, W, H);
  lls.globalCompositeOperation = 'destination-out'; lls.drawImage(LLE_C, ox, oy);
  // 3. the fire light: warm toward the heap, night blue away from it; and his own lantern warms the robe near it
  const night = [118, 108, 150], warm = mix(night, [255, 196, 152], f), cool = mix(night, [214, 168, 150], f * .55);
  llx.globalCompositeOperation = 'multiply'; const rg = llx.createRadialGradient(fx, fy, 0, fx, fy, 1250); rg.addColorStop(0, rgb(warm)); rg.addColorStop(1, rgb(cool)); llx.fillStyle = rg; llx.fillRect(0, 0, W, H);
  const lw = llx.createRadialGradient(lan[0], lan[1], 0, lan[0], lan[1], 1.3 * s); lw.addColorStop(0, 'rgba(255,226,170,1)'); lw.addColorStop(1, 'rgba(255,226,170,0)');
  llx.globalCompositeOperation = 'screen'; llx.globalAlpha = .55; llx.fillStyle = lw; llx.fillRect(0, 0, W, H); llx.globalAlpha = 1;
  llx.globalCompositeOperation = 'destination-in'; llx.drawImage(LLE_M, 0, 0); // the grade only on him
  llx.globalCompositeOperation = 'lighter'; llx.globalAlpha = .35 + .6 * f; llx.filter = 'blur(1px)'; llx.drawImage(LLE_S, 0, 0); llx.filter = 'none'; llx.globalAlpha = 1; llx.globalCompositeOperation = 'source-over';
  g.drawImage(LLE_C, 0, 0);
  // 4. the lantern glows, brighter while he holds it up to the embers
  const up = ease(t, LLE.lift - .08, LLE.lift + .32) * (1 - ease(t, LLE.hold, LLE.t1));
  glowAt(lan[0], lan[1], 70 + 50 * up, '255,200,120', .55 + .3 * up); glowAt(lan[0], lan[1], 16, '255,240,200', .8);
}
