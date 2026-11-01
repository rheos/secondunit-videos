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
  if (!END_BOB) { saxEnd(t); return; }
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

// ---------- Draft 37: the sax rider plays the last lick, then the burn alone ----------
// Bob (Messenger, 2026-10-31): "i dont like little bob ... at end. Seems more powerful final image to just let the set
// breath", "Just final image burning is meaningful to me", and for the lick at the end, the bicyclist on sax. So the end
// walk is off (END_BOB; its code above stays for putting him back) and the sax rider from 1:05 rides in along the same
// screen line, coasts past the embers playing the lick (onsets 255.41 to 259.49 in the backing stem, ringing to about
// 259.9), then pedals off right, so the last six seconds are the burn and nothing else. Lit the way little Bob was:
// firelight multiplied in, a rim on the edge that faces the fire, a long shadow thrown toward us.
const END_BOB = false;
const SAX_OUTRO = { tIn: 254.75, lick: 255.41, last: 259.49, tOut: 262.4, k: 128, y: 994 };
// screen x from a speed profile (px/s): in fast, slowed right down for the lick, then away. Integrated in fixed steps from
// tIn, so it is a pure function of t.
function saxOutroV(t) { const E = SAX_OUTRO; return lerp(1800, 60, ease(t, E.tIn, E.lick + .1)) + 1500 * ease(t, E.last + .45, E.tOut - .3) ** 1.6; }
function saxOutroX(t) { const E = SAX_OUTRO, dt = 1 / 240; let x = -2.4 * E.k, s = E.tIn; for (; s + dt <= t; s += dt) x += saxOutroV(s + dt / 2) * dt; return x + saxOutroV(t) * (t - s); }
const SAX_OUTC = mkCanvas(), sog = SAX_OUTC.getContext('2d');
function saxEnd(t) {
  const E = SAX_OUTRO; if (t < E.tIn || t > E.tOut) return;
  const k = E.k, sx = saxOutroX(t), y0 = E.y, { fx, fy, f } = fireLight(t);
  if (sx < -2.4 * k || sx > W + 2.4 * k) return;
  if (ACT.on) { const q = bobGround(sx, y0); if (q) ACT.note('playa:sax-end', q[0], q[1], 1, { h: 2.3, group: 'rider' }); }
  const bx0 = Math.max(0, Math.floor(sx - 2.3 * k)), bx1 = Math.min(W, Math.ceil(sx + 1.2 * k)), by0 = Math.max(0, Math.floor(y0 - 4.2 * k)), by1 = H;
  if (bx1 <= bx0) return; const bw = bx1 - bx0, bh = by1 - by0, cy = y0 - 1.2 * k;
  const reset = (c) => { c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; c.filter = 'none'; c.clearRect(bx0, by0, bw, bh); };
  // a. the rider on his own layer (bmRider draws on g)
  reset(sog); const g1 = g; g = sog; bmRider(sx, y0, k, 1, sx / k, t, BM_SAX, 1); g = g1;
  // b. his long shadow on the playa, toward us and away from the fire
  const hb = 2.3 * k, mg = manGeom(), gy = mg.p[2] > 1 ? Math.min(mg.p[1], y0 - 120) : y0 - 300;
  const hx = lerp(clamp((sx - fx) / 700, -1.3, 1.3) * .5, clamp(.8 * (sx - fx) / hb, -1.3, 1.3), .5), hy = lerp(.5, Math.min(1.1, .8 * (y0 - gy) / hb), .5);
  reset(bsg); bsg.drawImage(SAX_OUTC, bx0, by0, bw, bh, bx0, by0, bw, bh); bsg.globalCompositeOperation = 'source-in'; bsg.fillStyle = 'rgb(22,10,28)'; bsg.fillRect(bx0, by0, bw, bh);
  g.save(); g.setTransform(1, 0, -hx, -hy, hx * y0, y0 * (1 + hy)); g.globalAlpha = .28 + .3 * f; g.filter = 'blur(2px)';
  g.drawImage(BOB_SCR, bx0, by0, bw, bh, bx0, by0, bw, bh); g.restore();
  // c. a copy of him, then the firelight multiplied over him (warm near the fire, night blue away), cut back to his shape
  reset(bsg); bsg.drawImage(SAX_OUTC, bx0, by0, bw, bh, bx0, by0, bw, bh);
  const night = [118, 108, 150], warm = mix(night, [255, 196, 152], f), cool = mix(night, [214, 168, 150], f * .55);
  const rg = sog.createRadialGradient(fx, fy, 0, fx, fy, 1250); rg.addColorStop(0, rgb(warm)); rg.addColorStop(1, rgb(cool));
  sog.globalCompositeOperation = 'multiply'; sog.fillStyle = rg; sog.fillRect(bx0, by0, bw, bh);
  sog.globalCompositeOperation = 'destination-in'; sog.drawImage(BOB_SCR, bx0, by0, bw, bh, bx0, by0, bw, bh);
  // d. the rim: his shape in the fire's colour, minus itself shifted toward the fire, added on
  const dx = fx - sx, dy = fy - cy, dl = Math.hypot(dx, dy) || 1, ox = dx / dl * 4.5, oy = dy / dl * 4.5;
  bsg.globalCompositeOperation = 'source-in'; bsg.fillStyle = 'rgb(255,168,86)'; bsg.fillRect(bx0, by0, bw, bh);
  bsg.globalCompositeOperation = 'destination-out'; bsg.drawImage(SAX_OUTC, bx0 + ox, by0 + oy, bw, bh, bx0, by0, bw, bh);
  sog.globalCompositeOperation = 'lighter'; sog.globalAlpha = .35 + .6 * f; sog.filter = 'blur(1px)'; sog.drawImage(BOB_SCR, bx0, by0, bw, bh, bx0, by0, bw, bh);
  sog.filter = 'none'; sog.globalAlpha = 1; sog.globalCompositeOperation = 'source-over';
  g.drawImage(SAX_OUTC, bx0, by0, bw, bh, bx0, by0, bw, bh);
}
