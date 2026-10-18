// Reform Party, Dali look: the suits and the boardroom table car.
// Draft 3: low hop-on seats on stubby brackets (seat at the hubcap line, knees up, feet on the sand), wheels showing under
// the skirt hem and a dust trail behind; an oversized gavel slams on "law" and goes soft; egg lids lift on each "grin",
// more each refrain; the board flips upside down on "perverse"; vogue poses; the four outro votes escalate.
// Draft 9: the gavel lives on the table and the chairman picks it up; a DAY licence plate; prize rosettes; bolder grins;
// same face, new hat (pinwheels, weathervanes); the bridge gestures (snub, photo-op, the book mask, thumbs up); tape
// recorders in the heads on "rehearsed"; the outro (collect, party hats, soft table, horns, minutes, confetti, sinking).
// ---------- draft 11: permanence helpers (shared with table.js and installs.js) ----------
// Robin: nothing blinks in or out. A solid thing may only start or stop being drawn where the lens cannot see it.
// camSees: does the lens at song time t see a ball of radius r at world (X, Y, Z)? (camAt is a pure function of t)
function camSees(t, X, Y, Z, r) { const c = camAt(t); let dx = X - c.x, dz = Z - c.z; const dy = Y - c.y; const a = dx * c.cy - dz * c.sy; dz = dx * c.sy + dz * c.cy; dx = a;
  const cp = Math.cos(c.p), sp = Math.sin(c.p), z = -dy * sp + dz * cp, y = dy * cp + dz * sp; if (z < -r) return false; const zz = Math.max(z, .3), R = c.f * r / zz, sx = W / 2 + c.f * dx / zz, sy = H / 2 - c.f * y / zz;
  return sx + R > -20 && sx - R < W + 20 && sy + R > -20 && sy - R < H + 20; }
// seenSpan: an actor whose story runs from a to b is also drawn before a for as long as the lens keeps seeing it until a
// (so it comes in from off frame), and after b for as long as the lens has seen it since b (so it leaves off frame).
// pos(u) -> [X, Y, Z, r]. Up to maxX seconds either side; the paths are laid so the lens loses them well inside that.
function seenSpan(t, a, b, pos, maxX = 12, dt = .1) {
  if (t >= a && t <= b) return true; if (t < a - maxX || t > b + maxX) return false;
  if (t < a) { for (let u = t; u < a; u += dt) { const q = pos(u); if (!camSees(u, ...q)) return false; } return true; }
  for (let u = b; u <= t; u += dt) { const q = pos(u); if (!camSees(u, ...q)) return false; } return camSees(t, ...pos(t)); }
// dropHeight: a prop that drops onto the table falls from the lowest of 6, 12, 24, 48 or 96 m above its landing spot
// (car-local lx, ly, lz) whose first frame the lens does not see; worked out once from the flight (a constant).
const DROPS = {};
function dropHeight(key, tl, lx, ly, lz) { if (DROPS[key] != null) return DROPS[key]; let H = 6;
  for (H of [6, 12, 24, 48, 96]) { const t0 = tl - Math.sqrt(2 * H / 9.8), [X, Z] = carLocalToWorld(t0, lx, lz); if (!camSees(t0, X, ly + H, Z, 1)) break; } return (DROPS[key] = H); }
// height above the landing spot at t for a drop from H landing at tl (null before it starts), with a small bounce
function dropY(t, tl, H) { const T = Math.sqrt(2 * H / 9.8), u = t - (tl - T); if (u < 0) return null; if (t < tl) return H - 4.9 * u * u; const b = t - tl; return b < .4 ? .05 * Math.abs(Math.sin(b * 11)) * Math.exp(-b * 9) : 0; }
// holeClip: draw something sinking into (or rising out of) the hat hole: the part under the table's top shows only
// through the hole's opening. Clip = the opening plus everything on the far side of the opening's middle on screen.
function holeClip(draw) { const ring = []; for (let i = 0; i < 28; i++) { const a = i / 28 * TAU; ring.push(PL(Math.cos(a) * .55, TOP, Math.sin(a) * .45)); }
  if (!ok(ring)) return; let far = ring[0], near = ring[0]; for (const q of ring) { if (q[2] > far[2]) far = q; if (q[2] < near[2]) near = q; }
  const h = PL(0, TOP, 0), dx = far[0] - near[0], dy = far[1] - near[1], dl = Math.hypot(dx, dy) || 1, ux = dx / dl, uy = dy / dl, px = -uy, py = ux, B = 1e4;
  let ar = 0; for (let i = 0; i < ring.length; i++) { const a = ring[i], b = ring[(i + 1) % ring.length]; ar += a[0] * b[1] - b[0] * a[1]; } if (ar > 0) ring.reverse(); // the same winding as the box, so the two add up
  g.save(); g.beginPath(); ring.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.closePath();
  g.moveTo(h[0] + px * B, h[1] + py * B); g.lineTo(h[0] + px * B + ux * B, h[1] + py * B + uy * B); g.lineTo(h[0] - px * B + ux * B, h[1] - py * B + uy * B); g.lineTo(h[0] - px * B, h[1] - py * B); g.closePath();
  g.clip('nonzero'); draw(); g.restore(); }
// worldToLocal: a world point in the car's own metres at this frame (for things left behind on the playa, drawn with PL)
function worldToLocal(X, Z) { const dx = X - CX, dz = Z - CZ, c = Math.cos(YAW), s = Math.sin(YAW); return [dx * c + dz * s, -dx * s + dz * c]; }
// ---------- figures ----------
let CAR_SIL = false; // true while carGlow redraws the near figures as a silhouette (eggs, hats and props are skipped)
let REEL_A = 0; // the shared reel angle of the recorders in the heads (set per frame by drawCar)
// the party's faceless egg head. Optional: lid 0..1 (the top lifts like a lid), teeth 0..1 (wind-up teeth climb out),
// tilt (radians), chat 0..1 (the teeth's jaw), tape 0..1 (a reel-to-reel recorder climbs out instead), gw (draft 9 grin:
// half-width in egg radii; 0 or missing keeps the old small grin).
function egg(x, y, k, front, grin, lid, teeth, tilt, chat, tape, gw) {
  if (CAR_SIL) return;
  const rx = .125 * k, ry = .155 * k; lid = lid || 0; teeth = teeth || 0; tape = tape || 0;
  g.save(); g.translate(x, y); if (tilt) g.rotate(tilt);
  const eg = g.createRadialGradient(-rx * .4, -ry * .45, rx * .1, 0, 0, ry * 1.2);
  eg.addColorStop(0, '#fffaf0'); eg.addColorStop(.55, PAL.egg); eg.addColorStop(1, '#b49a7c');
  const cy = -ry * .62, ar = -Math.asin(.62), al = Math.PI - ar, xr = rx * Math.cos(ar), N = 6;
  const zig = (fwd) => { for (let i = 0; i <= N; i++) { const u = fwd ? i / N : 1 - i / N; g.lineTo(lerp(-xr, xr, u), cy + (i % 2 ? -1 : 1) * ry * .035); } };
  g.fillStyle = eg;
  if (lid <= 0) { g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, TAU); g.fill(); }
  else { g.beginPath(); g.moveTo(-xr, cy); zig(true); g.ellipse(0, 0, rx, ry, 0, ar, al); g.closePath(); g.fill(); }
  if (front && grin > 0 && gw > 0) { // draft 9: a wide dark crescent with a row of teeth, readable on a phone; gw > 1 runs past the egg
    const hw = rx * gw, gy = ry * .2, gh = ry * .34;
    g.save(); g.globalAlpha = grin; g.fillStyle = '#2b1c18'; g.beginPath(); g.moveTo(-hw, gy); g.quadraticCurveTo(0, gy + gh * 2.1, hw, gy); g.quadraticCurveTo(0, gy + gh * .5, -hw, gy); g.fill();
    g.fillStyle = '#fbf3e3'; g.beginPath(); g.moveTo(-hw * .86, gy + gh * .2); g.quadraticCurveTo(0, gy + gh * 1.05, hw * .86, gy + gh * .2); g.quadraticCurveTo(0, gy + gh * .66, -hw * .86, gy + gh * .2); g.fill();
    g.strokeStyle = '#2b1c18'; g.lineWidth = Math.max(1, rx * .035); for (let j = 1; j < 6; j++) { const u = j / 6 * 2 - 1, bx = u * hw * .82, by = gy + gh * (.42 + .62 * (1 - u * u)); g.beginPath(); g.moveTo(bx, by - gh * .32); g.lineTo(bx, by + gh * .06); g.stroke(); }
    g.restore();
  } else if (front && grin > 0) { // a grin and nothing else
    g.save(); g.globalAlpha = grin; g.fillStyle = '#2b1c18'; g.beginPath(); g.ellipse(0, ry * .3, rx * .62, ry * .28, 0, 0, Math.PI); g.closePath(); g.fill();
    g.fillStyle = '#fbf3e3'; g.beginPath(); g.ellipse(0, ry * .3, rx * .55, ry * .1, 0, 0, Math.PI); g.closePath(); g.fill(); g.restore();
  }
  if (lid > 0) {
    const oh = ry * .1 * Math.min(1, lid * 3); g.fillStyle = '#e9d9bd'; g.beginPath(); g.ellipse(0, cy, xr * .96, oh, 0, 0, TAU); g.fill(); g.fillStyle = 'rgba(150,118,84,.55)'; g.beginPath(); g.ellipse(0, cy + oh * .15, xr * .7, oh * .6, 0, 0, TAU); g.fill(); // the pale shell rim and its shallow inside
    g.save(); g.translate(xr, cy - lid * ry * (.32 + Math.max(teeth, tape) * .55)); g.rotate(-lid * .5); g.translate(-xr, -cy); // the lid on its hinge
    g.fillStyle = eg; g.beginPath(); g.moveTo(-xr, cy); g.ellipse(0, 0, rx, ry, 0, al, ar + TAU); zig(false); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(120,90,60,.5)'; g.lineWidth = Math.max(1, rx * .04); g.stroke(); g.restore();
    if (teeth > 0) { // wind-up chattering teeth climb out of the open head
      g.save(); g.beginPath(); g.rect(-rx * 4, -ry * 6, rx * 8, ry * 6 + cy + ry * .03); g.clip();
      const w = rx * 1.55, op = (chat || 0) * ry * .3, ty = cy + ry * .55 - teeth * ry * .85 - (teeth > .95 ? op * .35 : 0);
      g.fillStyle = '#e07a8a'; g.beginPath(); g.ellipse(0, ty, w * .5, ry * .17, 0, 0, TAU); g.fill();
      g.fillStyle = '#fbf7ec'; for (let i = 0; i < 6; i++) g.fillRect(-w * .42 + i * w * .14, ty - ry * .22, w * .12, ry * .16);
      g.fillStyle = '#e07a8a'; g.beginPath(); g.ellipse(0, ty - ry * .32 - op, w * .5, ry * .15, 0, 0, TAU); g.fill();
      g.fillStyle = '#fbf7ec'; for (let i = 0; i < 6; i++) g.fillRect(-w * .42 + i * w * .14, ty - ry * .28 - op, w * .12, ry * .13);
      g.strokeStyle = '#d9b45a'; g.lineWidth = Math.max(1, ry * .07); g.beginPath(); g.moveTo(w * .5, ty - ry * .1); g.lineTo(w * .78, ty - ry * .1); g.moveTo(w * .78, ty - ry * .3); g.lineTo(w * .78, ty + ry * .1); g.stroke();
      if (teeth > .8) { g.fillStyle = '#e8a33a'; for (const d of [-1, 1]) { g.beginPath(); g.ellipse(d * w * .25, ty + ry * .17, w * .1, ry * .06, 0, 0, TAU); g.fill(); } }
      g.restore();
    }
    if (tape > 0) { // "rehearsed": the confiscated tape recorder rises out of the open head, reels turning in sync with every other head
      g.save(); g.beginPath(); g.rect(-rx * 4, -ry * 6, rx * 8, ry * 6 + cy + ry * .03); g.clip();
      const w = rx * 1.9, h = ry * .78, ty = cy + h * 1.05 - tape * h * 1.25; // ty = the deck's bottom edge
      g.fillStyle = '#2c2c31'; g.fillRect(-w / 2, ty - h, w, h); g.fillStyle = '#4a4a52'; g.fillRect(-w / 2, ty - h, w, h * .14);
      for (const d of [-1, 1]) { const rx2 = d * w * .24, ry2 = ty - h * .5, rr = h * .33; g.fillStyle = '#e4dcc6'; g.beginPath(); g.arc(rx2, ry2, rr, 0, TAU); g.fill();
        g.strokeStyle = '#2c2c31'; g.lineWidth = Math.max(1, rr * .2); for (let s = 0; s < 3; s++) { const a = REEL_A + s / 3 * TAU; g.beginPath(); g.moveTo(rx2, ry2); g.lineTo(rx2 + Math.cos(a) * rr * .85, ry2 + Math.sin(a) * rr * .85); g.stroke(); }
        g.fillStyle = '#5a3a24'; g.beginPath(); g.arc(rx2, ry2, rr * .32, 0, TAU); g.fill(); }
      g.strokeStyle = '#5a3a24'; g.lineWidth = Math.max(1, h * .06); g.beginPath(); g.moveTo(-w * .24, ty - h * .17); g.lineTo(w * .24, ty - h * .17); g.stroke();
      g.restore();
    }
  }
  g.restore();
}
function rosette(x, y, r, tails) { // tails: optional colour for the two ribbons (the prize rosettes have gold tails)
  g.fillStyle = tails || PAL.rosette; g.beginPath(); g.moveTo(x - r * .4, y); g.lineTo(x - r * .7, y + r * 2.3); g.lineTo(x - r * .2, y + r * 2); g.lineTo(x, y); g.fill();
  g.beginPath(); g.moveTo(x + r * .2, y); g.lineTo(x + r * .3, y + r * 2.4); g.lineTo(x + r * .75, y + r * 2.1); g.lineTo(x + r * .5, y); g.fill();
  g.fillStyle = PAL.rosette; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; g.beginPath(); g.arc(x + Math.cos(a) * r * .75, y + Math.sin(a) * r * .75, r * .38, 0, TAU); g.fill(); }
  g.fillStyle = '#f6d8a0'; g.beginPath(); g.arc(x, y, r * .42, 0, TAU); g.fill();
}
function arm(sx, sy, hx, hy, k, col) { g.strokeStyle = col; g.lineWidth = .13 * k; g.lineCap = 'round'; g.beginPath(); g.moveTo(sx, sy); g.quadraticCurveTo((sx + hx) / 2 + (hx > sx ? -1 : 1) * .03 * k, (sy + hy) / 2 + .05 * k, hx, hy); g.stroke(); g.fillStyle = PAL.egg; g.beginPath(); g.arc(hx, hy, .05 * k, 0, TAU); g.fill(); }
function handBallot(hx, hy, k) { if (CAR_SIL) return; g.fillStyle = '#fbf7ec'; g.fillRect(hx - .09 * k, hy - .27 * k, .18 * k, .22 * k); g.strokeStyle = '#1a1a1a'; g.lineWidth = Math.max(1, .02 * k); g.beginPath(); g.moveTo(hx - .04 * k, hy - .2 * k); g.lineTo(hx + .04 * k, hy - .12 * k); g.moveTo(hx + .04 * k, hy - .2 * k); g.lineTo(hx - .04 * k, hy - .12 * k); g.stroke(); }
function thumbUp(hx, hy, k) { // a fist with the thumb up
  g.fillStyle = PAL.egg; g.strokeStyle = 'rgba(90,60,40,.6)'; g.lineWidth = Math.max(1, .01 * k);
  g.beginPath(); g.ellipse(hx, hy, .065 * k, .055 * k, 0, 0, TAU); g.fill(); g.stroke();
  g.beginPath(); g.ellipse(hx - .01 * k, hy - .085 * k, .024 * k, .05 * k, -.15, 0, TAU); g.fill(); g.stroke();
}
const TORSO = .78; // seat to shoulder: a long-jacketed suit on a low seat
// A suit. (x, y) = screen point of the hips; k = px per metre.
// o: front, grin, arms ('rest'|'vote1'|'vote2'|'gavel'|'vogue'|'shrug'), lift, drawer (0..1), nod, plus (draft 3, all optional):
// leg = [[hip, knee, foot] x2] screen points (else the old dangling legs), chair() = seat pan + backrest drawn in the right
// order, pose = vogue hands [lx, ly, rx, ry, tilt] in k units from the shoulders, bounce, lid, teeth, chat, ballot, hand + prop
// (a screen-space right hand and a callback drawn after the arms).
// Draft 9, all optional: handW (how far the right hand goes to o.hand), handL (left hand), propBack (drawn before the arms),
// prize (the rosette swells), thumb, carry (a ballot in the right hand), mask (the book held up as a mask), etilt (head
// tilt), tape, gw, headBack / headFront (callbacks (x, eggY, k) drawn behind / in front of the egg).
function suit(x, y, k, o) {
  const front = o.front, nod = (o.nod || 0) * .035 * k, T = TORSO;
  const legs = () => {
    if (!o.leg) { g.fillStyle = PAL.suit; const sw = Math.sin(o.swing || 0) * .03 * k;
      g.fillRect(x - .17 * k + sw, y + .02 * k, .13 * k, .36 * k); g.fillRect(x + .04 * k - sw, y + .02 * k, .13 * k, .36 * k); return; }
    for (const [h, kn, f] of o.leg) { if (h[2] < .1 || kn[2] < .1 || f[2] < .1) continue; const kh = kAt(h), kk = kAt(kn), kf = kAt(f);
      seg(kn, f, .14 * kk, PAL.suit); seg(h, kn, .17 * kh, front ? PAL.suitLit : PAL.suit);
      if (o.sink > .02) { if (!CAR_SIL) { g.fillStyle = PAL.mahogany; g.beginPath(); g.ellipse(f[0], f[1], .17 * kf, .06 * kf, 0, 0, TAU); g.fill(); g.fillStyle = PAL.mahoganyLit; g.beginPath(); g.ellipse(f[0], f[1] - .015 * kf, .12 * kf, .035 * kf, 0, Math.PI, TAU); g.fill(); } } // sunk to the knee: the soft mahogany closes round the shin
      else { g.fillStyle = '#141216'; g.beginPath(); g.ellipse(f[0], f[1], .1 * kf, .05 * kf, 0, 0, TAU); g.fill(); } }
  };
  const chair = o.chair || (() => {});
  if (front) chair(); else legs();
  g.save(); if (o.bounce) g.translate(0, -o.bounce * .09 * k);
  // torso
  const ty = y + .02 * k, sh = y - T * k;
  const jg = g.createLinearGradient(x - .26 * k, 0, x + .26 * k, 0); jg.addColorStop(0, PAL.suitLit); jg.addColorStop(1, PAL.suit);
  g.fillStyle = jg; g.beginPath(); g.moveTo(x - .22 * k, ty); g.lineTo(x - .27 * k, sh + .05 * k); g.quadraticCurveTo(x - .25 * k, sh, x - .16 * k, sh - .02 * k); g.lineTo(x + .16 * k, sh - .02 * k); g.quadraticCurveTo(x + .25 * k, sh, x + .27 * k, sh + .05 * k); g.lineTo(x + .22 * k, ty); g.closePath(); g.fill();
  if (front) {
    g.fillStyle = '#f4efe6'; g.beginPath(); g.moveTo(x - .08 * k, sh - .01 * k); g.lineTo(x, sh + .3 * k); g.lineTo(x + .08 * k, sh - .01 * k); g.fill();
    g.fillStyle = '#8f1d1d'; g.beginPath(); g.moveTo(x - .02 * k, sh + .03 * k); g.lineTo(x + .02 * k, sh + .03 * k); g.lineTo(x + .03 * k, sh + .25 * k); g.lineTo(x, sh + .29 * k); g.lineTo(x - .03 * k, sh + .25 * k); g.fill();
    g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = .012 * k; g.beginPath(); g.moveTo(x - .08 * k, sh); g.lineTo(x - .02 * k, sh + .36 * k); g.moveTo(x + .08 * k, sh); g.lineTo(x + .02 * k, sh + .36 * k); g.stroke();
    if (o.drawer != null) drawers(x, sh, k, o.drawer);
    if (o.prize > 0 && !CAR_SIL) { const D = lerp(.12, lerp(.25, .8, easeOutBack(o.prizeSw || 0, 2.2)), o.prize); rosette(x - .15 * k, sh + .12 * k, Math.max(.035, D / 3.5) * k, o.prize > .3 ? '#d9b45a' : null); } // D = overall height, petals and tails // "shamelessly": a prize pinned on himself, swelling, red with gold tails
    else if (o.drawer == null) rosette(x - .15 * k, sh + .12 * k, .035 * k);
  } else { g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = .012 * k; g.beginPath(); g.moveTo(x, sh + .05 * k); g.lineTo(x, ty - .02 * k); g.stroke(); }
  if (front) legs(); else { g.restore(); chair(); g.save(); if (o.bounce) g.translate(0, -o.bounce * .09 * k); }
  // arms
  const L = [x - .24 * k, sh + .06 * k], R = [x + .24 * k, sh + .06 * k], lift = o.lift || 0, a = o.arms || 'rest';
  let hl = [x - .2 * k, y - .12 * k], hr = [x + .2 * k, y - .12 * k];
  const up = (d) => [x + d * lerp(.2, .33, lift) * k, lerp(y - .12 * k, sh - .74 * k, lift)];
  if (a === 'vote1') hr = up(1);
  if (a === 'vote2') { hr = up(1); hl = up(-1); }
  if (a === 'vogue' && o.pose) { const p = o.pose; hl = [lerp(hl[0], x + p[0] * k, lift), lerp(hl[1], sh + p[1] * k, lift)]; hr = [lerp(hr[0], x + p[2] * k, lift), lerp(hr[1], sh + p[3] * k, lift)]; }
  if (a === 'shrug') { hl = [x - .36 * k, sh + .02 * k - lift * .1 * k]; hr = [x + .36 * k, sh + .02 * k - lift * .1 * k]; }
  if (o.thumb > 0) hr = [lerp(hr[0], x + .3 * k, o.thumb), lerp(hr[1], sh + .06 * k, o.thumb)];
  const ey = sh - .19 * k + nod;
  if (o.mask > 0) { const m = o.mask, by = ey + .03 * k + (1 - m) * .45 * k; hr = [lerp(hr[0], x + .19 * k, m), lerp(hr[1], by + .06 * k, m)]; hl = [lerp(hl[0], x - .19 * k, m), lerp(hl[1], by + .06 * k, m)]; }
  if (o.hand) { const w = o.handW == null ? 1 : o.handW; hr = [lerp(hr[0], o.hand[0], w), lerp(hr[1], o.hand[1], w)]; }
  if (o.handL) hl = o.handL;
  if (o.propBack) o.propBack(x, sh, k);
  if (front || a !== 'rest' || o.thumb > 0 || o.hand || o.handL) { arm(...L, ...hl, k, front ? PAL.suitLit : PAL.suit); arm(...R, ...hr, k, PAL.suit); } // from behind, resting hands are out of sight
  if (o.ballot > 0 && lift > .5) { if (a === 'vote1' || a === 'vote2') handBallot(...hr, k); if (a === 'vote2') handBallot(...hl, k); }
  if (o.carry > 0) handBallot(...hr, k);
  if (o.thumb > .3 && !CAR_SIL) thumbUp(hr[0], hr[1], k);
  if (o.prop) o.prop();
  // neck + head
  g.fillStyle = '#d7c3a3'; g.fillRect(x - .045 * k, sh - .07 * k, .09 * k, .08 * k);
  if (o.headBack && !CAR_SIL) o.headBack(x, ey, k);
  egg(x, ey, k, front, o.grin || 0, o.lid, o.teeth, (o.pose && a === 'vogue' ? o.pose[4] * lift : 0) + (o.etilt || 0), o.chat, o.tape, o.gw);
  if (o.headFront && !CAR_SIL) o.headFront(x, ey, k);
  g.restore();
}
function drawers(x, sh, k, open) { // a torso of drawers: the middle one slides out toward us
  for (let i = 0; i < 3; i++) {
    const dy = sh + (.08 + i * .125) * k, dw = .26 * k, dh = .1 * k, o = i === 1 ? open : 0;
    g.fillStyle = '#7b5530'; g.fillRect(x - dw / 2, dy, dw, dh); g.strokeStyle = '#3a2412'; g.lineWidth = .01 * k; g.strokeRect(x - dw / 2, dy, dw, dh);
    if (o > 0) { const d = o * .16 * k; g.fillStyle = '#2a1608'; g.fillRect(x - dw / 2, dy, dw, dh); g.fillStyle = '#a77a48'; g.beginPath(); g.moveTo(x - dw / 2, dy + dh); g.lineTo(x - dw / 2 - d * .3, dy + dh + d); g.lineTo(x + dw / 2 + d * .3, dy + dh + d); g.lineTo(x + dw / 2, dy + dh); g.fill();
      g.fillStyle = '#8c6338'; g.fillRect(x - dw / 2 - d * .3, dy + dh + d - .01 * k, dw + d * .6, dh * .9); g.fillStyle = '#d9b45a'; g.beginPath(); g.arc(x, dy + dh + d + dh * .4, .014 * k, 0, TAU); g.fill(); }
    else { g.fillStyle = '#d9b45a'; g.beginPath(); g.arc(x, dy + dh / 2, .014 * k, 0, TAU); g.fill(); }
  }
}

// ---------- the table car ----------
// draft 11: polygons and lines of the table that cross the near plane are cut at it, not dropped (camera.js clipNear)
const NEAR_N = .12;
function polyN(pts, fill, stroke, lw) { if (!ok(pts)) { if (pts.some((p) => p.length < 5)) return; pts = clipNear(pts, NEAR_N); if (pts.length < 3) return; } poly(pts, fill, stroke, lw); }
function segN(a, b, w, col) { if (a[2] < NEAR_N && b[2] < NEAR_N) return; if (a[2] < NEAR_N || b[2] < NEAR_N) { if (a.length < 5 || b.length < 5) return; const [p, q] = a[2] < NEAR_N ? [b, a] : [a, b], u = (NEAR_N - p[2]) / (q[2] - p[2]), x = lerp(p[3], q[3], u), y = lerp(p[4], q[4], u);
  const r = [W / 2 + C.f * x / NEAR_N, H / 2 - C.f * y / NEAR_N, NEAR_N, x, y]; seg(p, r, w, col); return; } seg(a, b, w, col); }
const SEAT = .42; // hop-on seats at the hubcap line, low enough to hop on and off (Robin)
const WHEEL_R = .4, WHEELS = [-2.925, -.125, 2.575]; // three axles, in the gaps between the seats
const SEATS = [ // local x, z, faces camera at yaw 0, role
  ...[-3.6, -2.25, -.8, .55, 1.9, 3.25].map((x) => ({ x, z: 2.3, r: x === -.8 ? 'drawer' : 'b' })),
  ...[-3.6, -2.25, -.8, .55, 1.9, 3.25].map((x) => ({ x, z: -2.3, r: 'f' })),
  { x: -5.15, z: 0, r: 'chair' }, { x: 5.15, z: 0, r: 'end' },
];
const CHAIR_I = 12, END_I = 13, MINUTES_I = 3; // the chairman, the end suit, the one who keeps the minutes
// where the drawer torso's middle drawer opens, in car-local metres (for things flying into it)
function drawerMouth() { return [-.8, SEAT + .03 + TORSO - .255, 2.3 - .2]; }
function seatFrame(s) { if (!s.z) { const d = Math.sign(s.x); return { f: [-d, 0], r: [0, d] }; } const o = Math.sign(s.z); return { f: [0, -o], r: [o, 0] }; } // f = toward the table
const sp = (bx, bz, F, a, b, y) => [bx + F.f[0] * a + F.r[0] * b, y, bz + F.f[1] * a + F.r[1] * b];
const VOTE_LINES = [35, 36, 37, 38];
// the outro's cue words, once
const OUT = (() => { const w = (s) => VOTE_LINES.map((li) => wt(li, s)); return { vote: w('vote'), joke: w('joke'), broke: w('broke'), people: w('people') }; })();
// "shamelessly", refrain 1: each suit pins a prize rosette on himself; it swells .25 -> .8 m and is back to normal by "grin"
function prizeAt(t, i) { const sw = wt(5, 'shame'), gr = wt(5, 'grin'), st = (i % 7) * .07, pin = sw - .05 + st;
  return { pin, hand: ease(t, pin - .35, pin - .05) * (1 - ease(t, pin + .15, pin + .5)), swell: clamp((t - pin) / 1.3), on: ease(t, pin - .02, pin + .1) * (1 - ease(t, gr - .8, gr - .2)) }; }
// same face, new hat: the pinwheels of refrain 1 and the weathervanes of refrain 2 (all 14 change together)
const PIN = { facts: wt(6, 'facts'), spin: wt(6, 'spin'), off: L_(6).e };
const VANE = { facts: wt(13, 'facts'), spin: wt(13, 'spin'), off: L_(13).e };
function pinAng(t) { // a slow turn in the breeze, then a whirl from "spin" (integrated, so the speed eases in and out)
  const s = PIN.spin, a0 = s - .1, a1 = Math.min(t, s + 3.6); let w = 0; for (let u = a0; u < a1; u += .05) w += .05 * 15 * ease(u, s - .1, s + .25) * (1 - ease(u, s + 2.6, s + 3.6));
  return 1.3 * t + w; }
function pinBlur(t) { const s = PIN.spin; return ease(t, s - .1, s + .25) * (1 - ease(t, s + 2.6, s + 3.6)); }
function vaneAng(t) { // the world direction every vane points: the same breeze for all; on "spin" they swing, on the next beat round the other way
  const s = VANE.spin, b = .6; let a = 2.2 + .12 * Math.sin(t * 1.7) + .05 * Math.sin(t * 4.3);
  a += Math.PI / 2 * easeOutBack(clamp((t - s + .05) / .35), 2.4) + Math.PI * easeOutBack(clamp((t - s - b + .05) / .4), 2.4); return a; }
function seatState(s, t, i) {
  const o = { arms: 'rest', grin: 0, nod: Math.sin(t * 1.3 + i * 1.7) * .3, swing: t * 2 + i, lid: 0, teeth: 0, stand: 0, onChair: 0, onTable: 0, flip: 0, bounce: 0 };
  o.front = (s.r === 'chair' || s.r === 'end') ? 1 : (Math.cos(YAW) * Math.sign(s.z) > 0 ? 1 : 0); // as the table spins, who faces us flips
  // grin, and the egg lids: refrain 1 one lid lifts, refrain 2 the whole row on the beat, refrain 3 lids open and wind-up teeth climb out
  [5, 12, 33].forEach((li, r) => { const gr = wt(li, 'grin'), gv = ease(t, gr - .1, gr + .4) * (1 - ease(t, L_(li).e + 1, L_(li).e + 1.6)); if (gv > o.grin) { o.grin = gv; o.gw = r === 0 ? .78 : r === 1 ? lerp(.78, 1.5, ease(t, gr - .05, gr + .3)) : 0; }
    if (r === 0 && i === 3) o.lid = Math.max(o.lid, .85 * ease(t, gr, gr + .45) * (1 - ease(t, L_(li).e + .6, L_(li).e + 1.2)));
    if (r === 1) { const env = ease(t, gr - .1, gr + .02) * (1 - ease(t, L_(li).e + .8, L_(li).e + 1.4)), pulse = Math.exp(-(Math.max(0, t - gr) % .6) / .16); o.lid = Math.max(o.lid, env * (.72 + .28 * pulse)); } // every lid flips open on the word and kicks on each beat
    if (r === 2) { const st = gr - .06 + (i % 7) * .03, env = ease(t, st, st + .25) * (1 - ease(t, 195.1, 195.35)); if (env > 0) { o.lid = Math.max(o.lid, env); o.teeth = ease(t, gr + .3 + (i % 5) * .08, gr + 1.4 + (i % 5) * .08) * env; o.chat = Math.abs(Math.sin(t * 16 + i * 1.3)); } } });
  // law: the chairman picks the gavel up off the table, stands, slams it flat on the top on the word, lays it back; everyone jolts
  const law = wt(0, 'law');
  if (s.r === 'chair' && t > law - 1.9 && t < law + 2.1) { o.arms = 'gavel'; o.stand = ease(t, law - 1.4, law - .85) * (1 - ease(t, law + 1.4, law + 1.95)); }
  if (t > law && t < law + .5) o.bounce = Math.sin((t - law) / .5 * Math.PI) * (1 - (t - law) / .5) * (s.r === 'chair' ? 0 : 1);
  const bg = 195.02; if (t > bg && t < bg + .6) o.bounce = Math.max(o.bounce, Math.abs(Math.sin((t - bg) * 16)) * (1 - (t - bg) / .6) * 1.4); // the giant gavel lands (installs.js)
  if (s.r === 'drawer') o.drawer = Math.max(ease(t, L_(2).s, L_(2).s + .6) * (1 - ease(t, L_(2).e - .2, L_(2).e + .3)), ease(t, wt(19, 'put') - .1, wt(19, 'put') + .5) * (1 - ease(t, wt(20, 'talk') - .1, wt(20, 'talk') + .25)));
  // shamelessly: the prize rosette
  { const pz = prizeAt(t, i); if (pz.on > 0) { o.prize = pz.on; o.prizeSw = pz.swell; } if (pz.hand > 0) o.pinHand = pz.hand; }
  // same face, new hat
  o.pin = ease(t, PIN.facts - .05 + (i % 7) * .025, PIN.facts + .45 + (i % 7) * .025) * (1 - ease(t, PIN.off - .3, PIN.off + .25));
  o.vane = ease(t, VANE.facts - .05 + (i % 7) * .025, VANE.facts + .5 + (i % 7) * .025) * (1 - ease(t, VANE.off - .3, VANE.off + .3));
  // vogue: the pose arrives on the word, then a new pose on each beat; the second time they rise off their seats to strike it
  for (const [li, end, rise] of [[14, L_(14).e, 0], [19, wt(19, 'put') - .1, .7]]) { const s0 = L_(li).s, vw = wt(li, 'vogue'); if (t < s0 - .4 || t > end + .4) continue;
    o.arms = 'vogue'; o.lift = ease(t, s0 - .35, vw) * (1 - ease(t, end, end + .35)); const ph = Math.max(0, t - vw) / .6, n = Math.floor(ph), u = ease(ph - n, 0, .25);
    const cur = VOGUE_POSES[(n + i) % 4], prv = n ? VOGUE_POSES[(n - 1 + i) % 4] : cur; o.pose = prv.map((v, j) => lerp(v, cur[j], u));
    o.stand = Math.max(o.stand, rise * o.lift); }
  if (t > L_(17).s && t < L_(18).e) { o.arms = 'shrug'; o.lift = ease(t, L_(18).s, L_(18).s + .3); }
  // share: the end suit turns his back on the poor woman's bowl, nose in the air, until the table has rolled past her
  if (i === END_I) { const sh = wt(17, 'share'), uf = wt(18, 'unfair'); o.swivel = ease(t, sh - .12, sh + .22) * (1 - ease(t, uf + 1.2, uf + 1.55)); if (o.swivel > 0) { o.arms = 'rest'; o.lift = 0; } }
  // friends: the two suits nearest the hole stand and drape a stiff photo-op arm round Little Bob, and let go on "guy"
  { const fw = wt(24, 'friends'), gy = wt(24, 'guy'), fr = ease(t, fw - .4, fw - .05) * (1 - ease(t, gy + .02, gy + .3)); if (fr > 0 && Math.abs(s.x) < 1 && s.z && o.front) { o.stand = Math.max(o.stand, .7 * fr); o.friend = fr; o.grin = Math.max(o.grin, .95 * fr); o.gw = .78; } }
  // mystery book: the chairman holds the noir book up in front of his egg as a mask, and lowers it on "knight"
  if (i === CHAIR_I) { const bk = wt(25, 'book'), kn = wt(26, 'knight'); o.mask = ease(t, bk - .3, bk + .02) * (1 - ease(t, kn - .15, kn + .2)); }
  // ok: a thumbs-up from the whole row
  { const ok = wt(27, 'ok'), st = (i % 7) * .025; o.thumb = ease(t, ok - .22 + st, ok + .02 + st) * (1 - ease(t, ok + .95, ok + 1.25)); }
  // perverse: the whole board flips upside down on its seats, a domino down the row, and is back upright for rehearsed
  const pv = wt(29, 'perverse'), dd = (i % 7) * .035 + (i > 6 ? .02 : 0); o.flip = ease(t, pv - .2 + dd, pv + .2 + dd) * (1 - ease(t, 164.8 + dd, 165.3 + dd));
  if (t > L_(30).s && t < L_(30).e + .3) { const beat = (t - L_(30).s) * 1.6; o.nod = Math.abs(Math.sin(beat * Math.PI)) * 1.2; } // rehearsed: all nod as one
  if (typeof marionetteJerk === 'function') { const mj = marionetteJerk(t, i); if (mj > 0) o.bounce = Math.max(o.bounce, mj); } // refrain 3 "control": the marionette yanks them upright on each beat (installs.js)
  { const rh = wt(30, 'rehearsed'), env = ease(t, rh - .07, rh + .05) * (1 - ease(t, L_(30).e + .25, L_(30).e + .65)); if (env > 0) { o.lid = Math.max(o.lid, env); o.tape = ease(t, rh, rh + .4) * env; } } // the lids pop: the confiscated recorders are inside
  // ---------- the outro: the crowd votes, the board does not ----------
  const vw = OUT.vote, jk = OUT.joke, bk = OUT.broke, st = i * .02;
  if (t > vw[0] - .8) {
    // vote 1: the suits reach out and collect the crowd's ballots, twice each, and toss them onto a stack on the table
    for (const gt of collectTimes(i)) { const u = t - gt; if (u < 0 || u > 1) continue; o.reach = ease(u, 0, .3) * (1 - ease(u, .42, .7)); o.carry = u > .34 && u < .7 ? 1 : 0; o.reachSide = collectSide(i, gt); }
    // vote 2 on: hands up against the fire (empty hands: the suits no longer vote); vote 3 standing on the chairs; vote 4 up on the soft table
    let lift = 0;
    if (t > vw[1] - .6 && t < vw[2] - .9) lift = ease(t, vw[1] - .5 + st, vw[1]) * (1 - ease(t, 236.8, 237.6));
    else if (t >= vw[2] - .9 && t < vw[3] - 1.1) { lift = ease(t, vw[2] - .5 + st, vw[2]) * (1 - ease(t, L_(37).e + .4, L_(37).e + 1.1)); const th = jk[2] + st; lift *= 1 - .55 * Math.sin(clamp((t - th + .35) / .5) * Math.PI); } // joke 3: the throw
    else if (t >= vw[3] - 1.1) lift = ease(t, vw[3] - .5 + st, vw[3]);
    o.onChair = ease(t, vw[2] - .75 + st, vw[2] - .1 + st * .5); o.onTable = ease(t, vw[3] - 1.05 + st, vw[3] - .15 + st * .3);
    o.sink = ease(t, vw[3] + .15 + st, vw[3] + 1.6 + st); // the table has gone soft: they sink to the knee, still voting
    if (t > vw[3]) lift *= .85 + .15 * Math.sin((t - vw[3]) * 5.2 + i); // waving
    if (lift > 0) { o.arms = 'vote2'; o.lift = lift; o.ballot = 0; }
    // the minutes (Gilliam): through vote 2 one suit stays seated and calmly writes, then posts the sheet into the hat hole
    if (i === MINUTES_I) { const m0 = vw[1] - .9, m1 = L_(36).e + .9; o.minutes = ease(t, m0, m0 + .4) * (1 - ease(t, m1, m1 + .4)); if (o.minutes > 0) { o.arms = 'rest'; o.lift = 0; o.minT = t - m0; } }
    o.hat = hatState(t, i); // joke 1: the party hats
    o.horn = ease(t, jk[1] - .1 + (i % 5) * .03, jk[1] + .2 + (i % 5) * .03) * (1 - ease(t, jk[1] + 1.05, jk[1] + 1.35)); // joke 2: the horns unroll
  }
  if (o.onTable > 0) { const tbx = s.z ? s.x * .92 : s.x * .78; o.tsag = tableSag(tbx, t); }
  return o;
}
const VOGUE_POSES = [ // hands [left x, y, right x, y] in k units from the shoulder line, head tilt
  [-.22, -.2, .22, -.2, 0], // hands frame the face
  [-.28, .55, .1, -.8, .25], // right arm straight up, left hand on the hip
  [-.05, -.06, .48, -.52, -.2], // hand under the chin, the other arm out on a diagonal
  [-.1, -.8, .28, .55, -.25], // the mirror of the second
];
function seatGeom(s) { // the chair hardware in car-local metres: a stubby triangle bracket to the table and a short crutch
  const F = seatFrame(s), by = SEAT - .05, gap = s.z ? Math.abs(s.z) - TD : Math.abs(s.x) - TL;
  return { beamA: sp(s.x, s.z, F, gap + .02, 0, TOP - .24), beamB: sp(s.x, s.z, F, .08, 0, by), beamC: sp(s.x, s.z, F, gap + .2, 0, by),
    crutch: [sp(s.x, s.z, F, -.15, .2, by - .02), sp(s.x, s.z, F, -.42, .42, 0)] };
}
function crutch(a, b, sc, bend, kink) { // a Dali crutch: a long pole with a padded fork at the top (sc scales the fork); bend 0..1 softens it, kink 0..1 buckles it
  sc = sc || 1; bend = bend || 0; kink = kink || 0; const pa = PL(...a), pb = PL(...b); if (pa[2] < .1 || pb[2] < .1) return; const k = kAt(pa);
  if (bend > .01 || kink > .01) { // the pole goes soft: it bows out (and with a kink folds at the middle), the top sinks
    const len = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]), drop = kink * len * .35, top = [a[0], a[1] - drop, a[2]];
    const mid = [(top[0] + b[0]) / 2 + (bend * .18 + kink * .3) * len, (top[1] + b[1]) / 2 - kink * len * .12, (top[2] + b[2]) / 2 + bend * .08 * len];
    const pm = PL(...mid), pt = PL(...top); if (pm[2] < .1 || pt[2] < .1) return;
    if (kink > .3) { seg(pt, pm, .05 * k, PAL.crutch); seg(pm, pb, .05 * k, PAL.crutch); }
    else { g.strokeStyle = PAL.crutch; g.lineWidth = Math.max(1, .05 * k); g.lineCap = 'round'; g.beginPath(); g.moveTo(pt[0], pt[1]); g.quadraticCurveTo(pm[0] * 2 - (pt[0] + pb[0]) / 2, pm[1] * 2 - (pt[1] + pb[1]) / 2, pb[0], pb[1]); g.stroke(); }
    const s2 = sc * (1 - .4 * bend), fl = PL(top[0] - .18 * s2, top[1] - .1 * s2 - .1 * bend * sc, top[2]), fr = PL(top[0] + .18 * s2, top[1] - .1 * s2 - .1 * bend * sc, top[2]), fm = PL(top[0], top[1] - .3 * s2, top[2]);
    seg(fm, fl, .035 * k, PAL.crutch); seg(fm, fr, .035 * k, PAL.crutch);
    const pl = PL(top[0] - .22 * s2, top[1] - .08 * bend * sc, top[2]), pr = PL(top[0] + .22 * s2, top[1] - .08 * bend * sc, top[2]); seg(pl, pr, .08 * k, '#e9dcc2');
    g.fillStyle = '#3a2a1a'; g.beginPath(); g.arc(pb[0], pb[1], .05 * kAt(pb), 0, TAU); g.fill(); return;
  }
  seg(pa, pb, .05 * k, PAL.crutch);
  const fl = PL(a[0] - .18 * sc, a[1] - .1 * sc, a[2]), fr = PL(a[0] + .18 * sc, a[1] - .1 * sc, a[2]), fm = PL(a[0], a[1] - .3 * sc, a[2]);
  seg(fm, fl, .035 * k, PAL.crutch); seg(fm, fr, .035 * k, PAL.crutch);
  const pl = PL(a[0] - .22 * sc, a[1], a[2]), pr = PL(a[0] + .22 * sc, a[1], a[2]); seg(pl, pr, .08 * k, '#e9dcc2');
  g.fillStyle = '#3a2a1a'; g.beginPath(); g.arc(pb[0], pb[1], .05 * kAt(pb), 0, TAU); g.fill();
}
// vote 4: the crutches go soft one by one down the board, and the chairman's, the last, buckles on "joke"
function crutchSoft(t, i) { if (i === CHAIR_I) return { bend: ease(t, OUT.vote[2] + 6.5, OUT.vote[3] + 1), kink: ease(t, OUT.joke[3] - .1, OUT.joke[3] + .3) };
  const o = OUT.vote[2] + 1 + ((i * 5) % 13) * .6; return { bend: ease(t, o, o + 1.2), kink: 0 }; }
function seatUnder(s, t, i) { // bracket + crutch, always behind the sitter
  const G = seatGeom(s), sg = t != null ? tableSag(G.beamA[0], t) : 0, A = PL(G.beamA[0], G.beamA[1] - sg, G.beamA[2]), B = PL(...G.beamB), Cc = PL(...G.beamC); if (B[2] < .25) return; const k = kAt(B);
  seg(Cc, B, .09 * k, '#3d2412'); seg(A, B, .08 * k, '#4a2a14'); seg(A, Cc, .06 * k, '#3d2412');
  g.fillStyle = '#c9a24a'; for (const p of [A, B]) { if (p[2] < .1) continue; g.beginPath(); g.arc(p[0], p[1], .035 * kAt(p), 0, TAU); g.fill(); }
  const cs = t != null ? crutchSoft(t, i) : { bend: 0, kink: 0 };
  crutch(G.crutch[0], G.crutch[1], .5, cs.bend, cs.kink);
}
function seatTop(s, drop) { // the low seat pan and its short leather back (drop: the chairman's chair sinks when its crutch buckles)
  const F = seatFrame(s), dr = drop || 0, c = (a, b, y) => PL(...sp(s.x, s.z, F, a, b, y - dr * (a < 0 ? 1.4 : .6)));
  poly([c(.2, -.25, SEAT - .07), c(.2, .25, SEAT - .07), c(-.2, .25, SEAT - .07), c(-.2, -.25, SEAT - .07)], '#3d2412');
  poly([c(.2, -.25, SEAT), c(.2, .25, SEAT), c(-.2, .25, SEAT), c(-.2, -.25, SEAT)], '#7a4e26');
  const bk = [c(-.2, -.23, SEAT + .02), c(-.2, .23, SEAT + .02), c(-.24 - dr, .2, SEAT + .27), c(-.24 - dr, -.2, SEAT + .27)]; poly(bk, '#7b2a1c', '#3a140c', 1.5);
  if (!ok(bk)) return; const k = kAt(bk[0]); g.fillStyle = '#d9b45a'; for (let j = 0; j < 4; j++) { const p = c(-.24 - dr, -.15 + j * .1, SEAT + .23); if (p[2] < .1) continue; g.beginPath(); g.arc(p[0], p[1], .02 * k, 0, TAU); g.fill(); }
}
function kneeIK(h, f, B) { // two-bone leg: thigh .42, shin .56, the knee bends toward B
  const a = .42, b = .56, d = [f[0] - h[0], f[1] - h[1], f[2] - h[2]], L = Math.hypot(...d);
  if (L >= a + b - 1e-3) return h.map((v, j) => v + d[j] * a / (a + b));
  const u = d.map((v) => v / L), al = (a * a - b * b + L * L) / (2 * L), hh = Math.sqrt(Math.max(0, a * a - al * al)), bu = B[0] * u[0] + B[1] * u[1] + B[2] * u[2];
  let p = B.map((v, j) => v - bu * u[j]); const pl = Math.hypot(...p) || 1; p = p.map((v) => v / pl);
  return h.map((v, j) => v + u[j] * al + p[j] * hh);
}
function bodyPose(s, o) { // where the sitter's hips and feet are: seated, stood up, standing on the chair, or up on the table
  const F = seatFrame(s), mk = (bx, bz, hy, fa, fb, fy) => ({ bx, bz, hy, f: [-1, 1].map((d) => sp(bx, bz, F, fa, d * fb, fy)) });
  const lp = (A, B, u) => ({ bx: lerp(A.bx, B.bx, u), bz: lerp(A.bz, B.bz, u), hy: lerp(A.hy, B.hy, u), f: A.f.map((p, j) => p.map((v, m) => lerp(v, B.f[j][m], u))) });
  let P0 = mk(s.x, s.z, SEAT + .03, .36, .26, .03);
  if (o.stand > 0) { const fw = sp(s.x, s.z, F, .18, 0, 0); P0 = lp(P0, mk(fw[0], fw[2], .93, .1, .14, .03), o.stand); }
  if (o.onChair > 0) P0 = lp(P0, mk(s.x, s.z, SEAT + .95, .02, .13, SEAT + .04), o.onChair);
  if (o.onTable > 0) { const u = o.onTable, tb = s.z ? [s.x * .92, s.z * .36] : [s.x * .78, 0], arc = Math.sin(u * Math.PI), sg = (o.tsag || 0) * u, sk = (o.sink || 0) * .5;
    P0 = lp(P0, mk(tb[0], tb[1], TOP + .93 - sg - sk, .02, .14, TOP + .02 - sg), u); P0.hy += arc * .55; P0.f.forEach((p) => { p[1] += arc * .8; }); }
  return { ...P0, F };
}
function legPts(s, Pz, o) { const F = Pz.F, sw = 1.25 * (1 - clamp((Pz.hy - SEAT - .03) / .45)) + .15, sink = o && o.sink > .02 && o.onTable > .9;
  return [-1, 1].map((d, j) => { const h = sp(Pz.bx, Pz.bz, F, -.02, d * .1, Pz.hy), f = Pz.f[j];
    const kn = sink ? h.map((v, m) => lerp(v, f[m], .5)) : kneeIK(h, f, [F.f[0] * .3 + F.r[0] * d * sw, 1, F.f[1] * .3 + F.r[1] * d * sw]); return [PL(...h), PL(...kn), PL(...f)]; }); } // sunk: straight shins into the mahogany
// ---------- the gavel on "law" ----------
// It lies on the table at the chairman's end all film. On "law" he picks it up, stands, raises it, slams it flat on the
// top on the word (it stops there, a dust puff), lifts it, lays it back and sits.
function gavelPose(t) { // swing angle of the handle in the chairman's x-y plane: flat at the top's height, straight up, slam, lift, lay down
  const law = wt(0, 'law'); let th = lerp(-.24, Math.PI / 2, ease(t, law - 1.15, law - .3));
  th = lerp(th, -.24, ease(t, law - .13, law)); th = lerp(th, .35, ease(t, law + .6, law + .9)); return lerp(th, -.24, ease(t, law + .9, law + 1.15));
}
const GAVEL_LIE = { grip: [-4.5, TOP + .05, -.62], h0: [-4.62, TOP + .05, -.62], h1: [-3.93, TOP + .1, -.62], A: [-3.85, TOP + .11, -.87], B: [-3.85, TOP + .11, -.37], c: [-3.85, TOP + .11, -.62] };
function gavelHold(t) { const law = wt(0, 'law'); return ease(t, law - 1.55, law - 1.25) * (1 - ease(t, law + 1.1, law + 1.45)); }
function gavelLocal(t, Pz) { // the gavel's points in car-local metres: lying on the table, in his hand, or between
  const hold = gavelHold(t); if (hold <= 0 || !Pz) return { ...GAVEL_LIE, hold: 0 };
  const R = 1.05, Lh = .5, rad = .11, th = gavelPose(t), d = [Math.cos(th), Math.sin(th)], hx = Math.SQRT1_2, hz = -Math.SQRT1_2, sh = sp(Pz.bx, Pz.bz, Pz.F, 0, .2, Pz.hy + TORSO - .06);
  const at = (r, n) => { const hz0 = d[0] * r - d[1] * n; return [sh[0] + hx * hz0, sh[1] + d[1] * r + d[0] * n, sh[2] + hz * hz0]; }; // the swing plane turns 45 deg toward the near side so the GAVEL framing sees it side-on
  const held = { grip: at(.42, 0), h0: at(.36, 0), h1: at(R - rad * .6, 0), A: at(R, -Lh / 2), B: at(R, Lh / 2), c: at(R, 0) }, out = { hold };
  for (const key of Object.keys(held)) out[key] = GAVEL_LIE[key].map((v, j) => lerp(v, held[key][j], hold));
  return out;
}
function drawGavel(t, G) { // an oversized mallet: a barrel head .5 m long, .22 across, the handle into its middle
  const law = wt(0, 'law'), soft = ease(t, law + .04, law + .9) * (1 - ease(t, law + 1.6, law + 2.4)), rad = .11;
  const h0 = PL(...G.h0), h1 = PL(...G.h1); seg(h0, h1, .055 * kAt(h1), '#4a2a14');
  const A = PL(...G.A), B = PL(...G.B), c = PL(...G.c); if (A[2] < .1 || B[2] < .1) return; const k = kAt(c);
  const ux = B[0] - A[0], uy = B[1] - A[1], ul = Math.hypot(ux, uy) || 1, px = -uy / ul, py = ux / ul, ang = Math.atan2(uy, ux);
  const w = rad * k, sq = 1 + soft * .55; // after the blow the striking end (A) spreads like a soft rubber stamp
  const wg = g.createLinearGradient(c[0] - px * w, c[1] - py * w, c[0] + px * w, c[1] + py * w); wg.addColorStop(0, '#3e1f0c'); wg.addColorStop(.45, '#9a5a2c'); wg.addColorStop(1, '#4a2510');
  g.fillStyle = wg; g.beginPath(); g.moveTo(A[0] - px * w * sq, A[1] - py * w * sq); g.lineTo(B[0] - px * w, B[1] - py * w); g.lineTo(B[0] + px * w, B[1] + py * w); g.lineTo(A[0] + px * w * sq, A[1] + py * w * sq); g.closePath(); g.fill();
  for (const [P0, ww] of [[B, w], [A, w * sq]]) { g.fillStyle = '#2e1608'; g.beginPath(); g.ellipse(P0[0], P0[1], w * .28, ww, ang, 0, TAU); g.fill(); }
  g.strokeStyle = '#d9b45a'; g.lineWidth = Math.max(1.5, .03 * k); for (const f of [.16, .84]) { const q = [lerp(A[0], B[0], f), lerp(A[1], B[1], f)], ww = lerp(w * sq, w, f); g.beginPath(); g.moveTo(q[0] - px * ww, q[1] - py * ww); g.lineTo(q[0] + px * ww, q[1] + py * ww); g.stroke(); }
  if (soft > .05) { g.fillStyle = '#4a2510'; g.beginPath(); g.ellipse(A[0] + px * w * sq * .7, A[1] + py * w * sq * .7 + soft * .06 * k, w * .16, soft * .1 * k, 0, 0, TAU); g.fill(); } // a drip
}
function gavelProp(t, Pz) { // returns the screen hand and a draw callback (kept for the chairman's sitter)
  const G = gavelLocal(t, Pz); return { hand: PL(...G.grip), draw: () => drawGavel(t, G), G };
}
const LAW_AT = (() => { let v = null; return () => { if (!v) { const s = SEATS[CHAIR_I], law = wt(0, 'law'), o = { stand: 1 }, Pz = bodyPose(s, o), G = gavelLocal(law, Pz); v = [G.A[0], G.A[2]]; } return v; }; })(); // where the blow lands
function lawMarks(t) { // the stamp's red ink mark on the table, the shock ring of the blow and a 0.3 s puff of playa dust
  const law = wt(0, 'law'); if (t < law || t > L_(0).e + 2.2) return; const [hx, hz] = LAW_AT(), a = 1 - ease(t, L_(0).e + .8, L_(0).e + 2.2);
  const ring = (r, y) => { const ps = []; for (let i = 0; i < 30; i++) { const q = i / 30 * TAU; ps.push(PL(hx + Math.cos(q) * r, y, hz + Math.sin(q) * r * .9)); } return ps; };
  g.save(); g.globalAlpha = a * ease(t, law + .7, law + .95); poly(ring(.3, TOP + .004), null, '#b3201a', 3.5); poly(ring(.19, TOP + .004), 'rgba(179,32,26,.85)');
  const star = []; for (let i = 0; i < 10; i++) { const q = i / 10 * TAU, r = i % 2 ? .06 : .14; star.push(PL(hx + Math.cos(q) * r, TOP + .005, hz + Math.sin(q) * r * .9)); } poly(star, '#f1d9a8'); g.restore();
  const u = (t - law) / .55; if (u < 1) { g.save(); g.globalAlpha = (1 - u) * .8; poly(ring(.3 + u * 1.6, TOP + .006), null, '#fbf0d6', 4 * (1 - u) + 1); g.restore(); }
  const du = (t - law) / .3; if (du < 1) for (let i = 0; i < 11; i++) { const q = i / 11 * TAU + .3, r = .12 + du * (.45 + .2 * rnd(i, 7)), p = PL(hx + Math.cos(q) * r, TOP + .05 + du * (.18 + .14 * rnd(i, 8)), hz + Math.sin(q) * r * .9); if (p[2] < .2) continue; // the dust puff off the top
    const R = (.1 + du * .2) * kAt(p), al = .85 * (1 - du * du) * Math.min(1, du * 8); const rg = g.createRadialGradient(p[0], p[1], 0, p[0], p[1], R); rg.addColorStop(0, `rgba(218,196,156,${al})`); rg.addColorStop(.6, `rgba(226,206,170,${al * .55})`); rg.addColorStop(1, 'rgba(236,216,180,0)'); g.fillStyle = rg; g.beginPath(); g.arc(p[0], p[1], R, 0, TAU); g.fill(); }
}
// the DAY licence plate: drops onto the skirt at the chairman's end on "law" and stays (a day-licensed art car, unlit at night)
const DAY_PLATE = { x: -TL * .97 - .012, z0: -.98, z1: -.6, y0: .68, y1: .87 }; // car-local metres (b6: aim the Rangers' flashlights here)
function dayPlate(t) {
  const law = wt(0, 'law'); if (t < law - .05) return; const u = clamp((t - law + .05) / .32), land = law + .27, sag = tableSag(-TL, t);
  const drop = (1 - u) * (1 - u) * .7 - (t > land ? .03 * Math.abs(Math.sin((t - land) * 16)) * Math.exp(-(t - land) * 7) : 0), sw = t > land ? .12 * Math.sin((t - land) * 11) * Math.exp(-(t - land) * 3.5) : 0;
  const { x, z0, z1, y0, y1 } = DAY_PLATE, zc = (z0 + z1) / 2, dy = drop - sag;
  const at = (z, y) => { const dz = z - zc, yy = y - y1; return PL(x, y1 + dy + yy * Math.cos(sw) + dz * Math.sin(sw), zc + dz * Math.cos(sw) - yy * Math.sin(sw)); };
  const tl = at(z1, y1), tr = at(z0, y1), bl = at(z1, y0); if (!ok([tl, tr, bl])) return;
  const a = tr[0] - tl[0], b = tr[1] - tl[1], c = bl[0] - tl[0], d = bl[1] - tl[1]; if (a * d - b * c <= 0) return; // seen from behind: hidden by the table
  g.save(); g.transform(a / 100, b / 100, c / 50, d / 50, tl[0], tl[1]); // a 100 x 50 box mapped onto the plate
  g.fillStyle = '#e9dca8'; g.fillRect(0, 0, 100, 50); g.strokeStyle = '#2a2420'; g.lineWidth = 3.5; g.strokeRect(3, 3, 94, 44);
  g.fillStyle = '#1e1c22'; g.font = 'bold 36px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.fillText('DAY', 50, 41);
  g.fillStyle = '#8a8478'; for (const bx of [10, 90]) { g.beginPath(); g.arc(bx, 9, 2.6, 0, TAU); g.fill(); }
  g.restore();
}
// ---------- the soft table (Dali: the one hard thing goes soft in the outro) ----------
function tableSagAmt(t) { return .25 * ease(t, OUT.broke[0] - .25, OUT.broke[0] + .7) + .33 * ease(t, OUT.vote[2] - .3, OUT.vote[2] + 1.8) + .22 * ease(t, OUT.vote[3] - .2, OUT.vote[3] + 1.4); }
function tableSag(x, t) { const a = tableSagAmt(t); if (a <= 0) return 0; const f = clamp((Math.abs(x) - 2.4) / (TL - 2.4)); return a * f * f; } // metres the top has dropped at local x
function tableShadow(t) {
  const pts = []; for (const [x, z] of [[-TL, -TD], [TL, -TD], [TL, TD], [-TL, TD]]) { pts.push(Lw(x, TOP - tableSag(x, t), z)); pts.push(Lw(x * .97, .2, z * .9)); }
  shadowOf(pts, t);
  const sv = sunVec(t), a = shadowA(t); if (a < .01) return;
  for (const s of SEATS) { const G = seatGeom(s);
    shadowOf([Lw(s.x - .26, .05, s.z), Lw(s.x + .26, .05, s.z), Lw(s.x + .27, SEAT + .8, s.z), Lw(s.x - .27, SEAT + .8, s.z), Lw(s.x, SEAT + 1.2, s.z)], t);
    const pa = shadowPt(...Lw(...G.crutch[0]), sv), pb = shadowPt(...Lw(...G.crutch[1]), sv); seg(pa, pb, .05 * kAt(pa), `rgba(52,34,58,${a})`); }
}
function wheels(t, near) { // three axles of wheels, the lower halves showing under the skirt hem, with turning chrome hubcaps
  const dist = carX(t) + carZ(t), rot = -dist / WHEEL_R, W0 = [];
  for (const x of WHEELS) for (const z of [-TD * .95, TD * .95]) W0.push([x, z, PL(x, WHEEL_R, z)[2]]);
  const mid = PL(0, WHEEL_R, 0)[2]; W0.sort((a, b) => b[2] - a[2]);
  for (const [x, z, d] of W0) { if ((d < mid) !== near) continue; const c = PL(x, WHEEL_R, z); if (c[2] < .3) continue;
    const circ = (r, oz) => { const ps = []; for (let i = 0; i < 26; i++) { const a = i / 26 * TAU; ps.push(PL(x + Math.cos(a) * r, WHEEL_R + Math.sin(a) * r, z + oz)); } return ps; };
    const oz = Math.sign(z) * .06; poly(circ(WHEEL_R, 0), '#15100d'); poly(circ(WHEEL_R * .96, oz), '#211813');
    poly(circ(WHEEL_R * .5, oz * 1.4), '#c9c6bd', '#8d887d', 2); poly(circ(WHEEL_R * .5, oz * 1.4).slice(14, 26).concat([PL(x, WHEEL_R, z + oz * 1.4)]), 'rgba(255,255,255,.35)');
    const k = kAt(c); for (let s = 0; s < 5; s++) { const a = rot + s / 5 * TAU; seg(PL(x + Math.cos(a) * WHEEL_R * .1, WHEEL_R + Math.sin(a) * WHEEL_R * .1, z + oz * 1.5), PL(x + Math.cos(a) * WHEEL_R * .45, WHEEL_R + Math.sin(a) * WHEEL_R * .45, z + oz * 1.5), .025 * k, '#6f6a60'); }
    poly(circ(WHEEL_R * .12, oz * 1.6), '#d9b45a'); }
}
function tableBody(t) {
  const c = PL, sa = tableSagAmt(t), sy = (x) => sa > 0 ? tableSag(x, t) : 0, NX = sa > 0 ? 16 : 1;
  // the car under the cloth: a dark chassis box, then the wheels
  wheels(t, false);
  const bx = TL * .9, bz = TD * .86, cf = [[[-bx, -bz], [bx, -bz]], [[bx, -bz], [bx, bz]], [[bx, bz], [-bx, bz]], [[-bx, bz], [-bx, -bz]]];
  cf.map((f) => [c((f[0][0] + f[1][0]) / 2, .4, (f[0][1] + f[1][1]) / 2)[2], f]).sort((a, b) => b[0] - a[0])
    .forEach(([, f]) => polyN([c(f[0][0], .14, f[0][1]), c(f[1][0], .14, f[1][1]), c(f[1][0], .8 - Math.min(.5, sy(f[1][0])), f[1][1]), c(f[0][0], .8 - Math.min(.5, sy(f[0][0])), f[0][1])], '#1d130e'));
  wheels(t, true);
  // skirt: four hanging cloth panels down to a hem just above the hubcaps, drawn back to front (they droop with the soft top)
  const faces = [[[-TL * .97, -TD * .93], [TL * .97, -TD * .93]], [[TL * .97, -TD * .93], [TL * .97, TD * .93]], [[TL * .97, TD * .93], [-TL * .97, TD * .93]], [[-TL * .97, TD * .93], [-TL * .97, -TD * .93]]];
  const fd = faces.map((f) => [c((f[0][0] + f[1][0]) / 2, 1.2, (f[0][1] + f[1][1]) / 2)[2], f]).sort((a, b) => b[0] - a[0]);
  const N = 14, hem = (u, x) => Math.max(.08, .56 + .045 * Math.sin(u * 20 + t * 1.5) - sy(x) * .85);
  for (const [, f] of fd) {
    const xa = (u) => lerp(f[0][0], f[1][0], u), at = (u, y) => c(xa(u), y - sy(xa(u)), lerp(f[0][1], f[1][1], u));
    const pts = []; for (let i = 0; i <= N; i++) pts.push(at(i / N, TOP - .2)); for (let i = N; i >= 0; i--) pts.push(c(xa(i / N), hem(i / N, xa(i / N)), lerp(f[0][1], f[1][1], i / N)));
    polyN(pts, PAL.skirt);
    for (let i = 1; i < N; i++) seg(at(i / N, TOP - .23), c(xa(i / N), hem(i / N, xa(i / N)) + .06, lerp(f[0][1], f[1][1], i / N)), 2, 'rgba(0,0,0,.18)');
    for (let i = 0; i < N; i++) { const a = c(xa(i / N), hem(i / N, xa(i / N)), lerp(f[0][1], f[1][1], i / N)); seg(a, c(xa((i + 1) / N), hem((i + 1) / N, xa((i + 1) / N)), lerp(f[0][1], f[1][1], (i + 1) / N)), .05 * kAt(a), '#d6a632'); }
  }
  // the top's edge band, then the top, split along x so the soft ends can droop
  const xs = []; for (let j = 0; j <= NX; j++) xs.push(lerp(-TL, TL, j / NX));
  const band = (zz) => { const ps = []; for (const x of xs) ps.push(c(x, TOP - sy(x), zz)); for (let j = xs.length - 1; j >= 0; j--) ps.push(c(xs[j], TOP - .22 - sy(xs[j]), zz)); return ps; };
  const ends = (xx) => [c(xx, TOP - sy(xx), -TD), c(xx, TOP - sy(xx), TD), c(xx, TOP - .22 - sy(xx), TD), c(xx, TOP - .22 - sy(xx), -TD)];
  const bands = [band(-TD), band(TD), ends(-TL), ends(TL)].map((ps) => [ps.reduce((s, p) => s + p[2], 0) / ps.length, ps]).sort((a, b) => b[0] - a[0]);
  for (const [, ps] of bands) polyN(ps, '#3d170c');
  const topP = []; for (const x of xs) topP.push(c(x, TOP - sy(x), -TD)); for (let j = xs.length - 1; j >= 0; j--) topP.push(c(xs[j], TOP - sy(xs[j]), TD));
  // draft 11: when a corner of the top crosses the lens's near plane the top is cut there instead of dropped (it blinked out at 29.2, 46.7, 87.0)
  const tp = ok(topP) ? topP : clipNear(topP, NEAR_N); if (tp.length < 3) return;
  let g0p = c(-TL, TOP, -TD), g2p = c(TL, TOP, TD); if (!ok([g0p, g2p])) { const bx = tp.map((p) => clamp(p[0], 0, W)), by = tp.map((p) => clamp(p[1], 0, H)); g0p = [Math.min(...bx), Math.min(...by)]; g2p = [Math.max(...bx), Math.max(...by)]; }
  const lg = g.createLinearGradient(g0p[0], g0p[1], g2p[0], g2p[1]); lg.addColorStop(0, PAL.mahoganyLit); lg.addColorStop(1, PAL.mahogany);
  poly(tp, lg);
  for (let i = 1; i < 9; i++) { const z = -TD + i * TD * 2 / 9; if (sa <= 0) { segN(c(-TL, TOP, z), c(TL, TOP, z + .05 * Math.sin(i)), 1.2, 'rgba(30,8,4,.22)'); continue; }
    g.strokeStyle = 'rgba(30,8,4,.22)'; g.lineWidth = 1.2; g.beginPath(); xs.forEach((x, j) => { const p = c(x, TOP - sy(x), z + .05 * Math.sin(i) * (j / NX)); j ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); }); g.stroke(); }
  if (sa > .02) { // soft: drips of mahogany hang off both ends and a slow ripple runs over the top
    for (const e of [-1, 1]) for (let j = 0; j < 5; j++) { const z = -TD * .8 + j * TD * .4, x = e * TL, y0 = TOP - .2 - sy(x), len = sa * (.15 + .35 * rnd(j, e + 3)) * (1 + .1 * Math.sin(t * 2 + j)), a0 = c(x + e * .01, y0, z), b0 = c(x + e * .01, y0 - len, z); if (a0[2] < .2) continue;
      seg(a0, b0, .07 * kAt(a0), PAL.mahogany); g.fillStyle = PAL.mahogany; g.beginPath(); g.arc(b0[0], b0[1], .05 * kAt(b0), 0, TAU); g.fill(); }
    g.save(); g.globalAlpha = .25 * clamp(sa / .3); for (let r = 0; r < 3; r++) { const R = ((t * .5 + r / 3) % 1) * 2.4 + .7, ps = []; for (let i = 0; i < 28; i++) { const q = i / 28 * TAU, x = Math.cos(q) * R * 1.4; ps.push(c(x, TOP + .003 - sy(x), Math.sin(q) * R * .55)); } polyN(ps, null, PAL.mahoganyLit, 2); } g.restore();
  }
  chess(t);
  // the hole in the middle: the driver's seat
  const ring = (rx, rz) => { const r = []; for (let i = 0; i < 28; i++) { const a = i / 28 * TAU; r.push(c(Math.cos(a) * rx, TOP, Math.sin(a) * rz)); } return r; };
  polyN(ring(.55, .45), '#120806'); polyN(ring(.62, .52), null, '#c9a24a', 2.5);
}
function chess(t) { // knight to queen's rook: the table top turns into a chessboard
  const s = L_(26).s, e = L_(27).e; const a = ease(t, s - .3, s + .2) * (1 - ease(t, e + .3, e + .8)); if (a <= 0) return;
  g.save(); g.globalAlpha = a * .85;
  for (let i = 0; i < 8; i++) for (let j = 0; j < 4; j++) { if ((i + j) % 2) continue; const x0 = -TL + i, z0 = -TD + j * .75;
    polyN([PL(x0, TOP + .001, z0), PL(x0 + 1, TOP + .001, z0), PL(x0 + 1, TOP + .001, z0 + .75), PL(x0, TOP + .001, z0 + .75)], '#efe3c6'); }
  g.restore();
}
// ---------- hats, horns and masks on the eggs (draft 9) ----------
function pinwheel(x, ey, k, u, ang, blur) { // refrain 1: a paper pinwheel on a .4 m stalk, blades rosette red and egg cream, .5 m across
  const top = ey - .15 * k, H = .4 * k * ease(u, 0, .55), cx = x + .02 * k * u, cy = top - H;
  g.strokeStyle = '#6b4a2a'; g.lineWidth = Math.max(1, .02 * k); g.lineCap = 'round'; g.beginPath(); g.moveTo(x, top + .02 * k); g.lineTo(cx, cy); g.stroke();
  if (u < .4) return; const r = .25 * k * easeOutBack(clamp((u - .4) / .6), 1.6);
  if (blur > .05) { g.fillStyle = `rgba(232,150,140,${.45 * blur})`; g.beginPath(); g.arc(cx, cy, r * .95, 0, TAU); g.fill(); }
  g.save(); g.translate(cx, cy); g.rotate(ang); g.globalAlpha = 1 - .55 * blur;
  for (let q = 0; q < 4; q++) { g.rotate(Math.PI / 2); const col = q % 2 ? '#f1e4cc' : '#d0281f';
    g.fillStyle = col; g.beginPath(); g.moveTo(0, 0); g.lineTo(r, 0); g.lineTo(r * .62, r * .62); g.closePath(); g.fill();
    g.fillStyle = q % 2 ? '#d8c6a4' : '#9a1c16'; g.beginPath(); g.moveTo(0, 0); g.lineTo(r * .62, r * .62); g.lineTo(r * .3, r * .5); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(60,30,20,.55)'; g.lineWidth = Math.max(1, .008 * k); g.beginPath(); g.moveTo(0, 0); g.lineTo(r, 0); g.lineTo(r * .62, r * .62); g.closePath(); g.stroke(); }
  g.restore(); g.fillStyle = '#d9b45a'; g.beginPath(); g.arc(cx, cy, .025 * k, 0, TAU); g.fill();
}
const COCK = [[-.17, .02], [-.21, .3], [-.13, .2], [-.12, .33], [-.05, .17], [.05, .15], [.09, .25], [.11, .33], [.15, .36], [.17, .33], [.22, .3], [.17, .28], [.16, .2], [.13, .1], [.05, .02]]; // the cut-out cockerel, (along the arrow, up) metres
function weathervane(x, ey, k, u, A3, t) { // refrain 2: a stalk, an arrow and a cut-out cockerel, black against the sky; points the same world way as every other
  const top3 = [A3[0], A3[1] + .155, A3[2]], P0 = PL(...top3); if (P0[2] < .2) return;
  const dx = x - P0[0], dy = (ey - .155 * k) - P0[1], Q = (p) => { const q = PL(...p); return [q[0] + dx, q[1] + dy, q[2]]; }; // stuck to the drawn egg
  const col = '#34302f', H = .38 * ease(u, 0, .5), piv = [top3[0], top3[1] + H, top3[2]], pv = Q(piv); seg(Q(top3), pv, .025 * k, col);
  if (u < .45) return; const sz = easeOutBack(clamp((u - .45) / .55), 1.8), a = vaneAng(t) - YAW, d = [Math.cos(a), 0, Math.sin(a)], pr = [-d[2], 0, d[0]];
  const at = (al, up) => Q([piv[0] + d[0] * al * sz, piv[1] + up * sz, piv[2] + d[2] * al * sz]);
  seg(Q([piv[0] - pr[0] * .12 * sz, piv[1] - .04, piv[2] - pr[2] * .12 * sz]), Q([piv[0] + pr[0] * .12 * sz, piv[1] - .04, piv[2] + pr[2] * .12 * sz]), .015 * k, col); // the cross bar
  seg(at(-.3, 0), at(.4, 0), .028 * k, col); // the arrow
  poly([at(.46, 0), at(.33, .07), at(.33, -.07)], col); poly([at(-.3, 0), at(-.22, .1), at(-.36, .12), at(-.4, 0), at(-.36, -.08), at(-.22, -.06)], col); // head and tail fin, in the arrow's own upright plane
  poly(COCK.map(([al, up]) => at(al * .85, up * .85 + .03)), col);
}
// joke 1: a dunce cap (draft 11, Robin: the white pointed caps could read as hoods). Short, fat, tilted well over,
// in a strong colour with bands of a second one and a pompom on the tip; no white, no eye marks. Each suit has his own colours.
const DUNCE = [['#d0281f', '#f0b23a', '#2f6fb5'], ['#2f6fb5', '#f0b23a', '#d0281f'], ['#e8a31a', '#7a3c8c', '#3c8c5a'], ['#3c8c5a', '#f0b23a', '#d0281f'], ['#7a3c8c', '#f0b23a', '#e0702a'], ['#e0702a', '#2f6fb5', '#f2ede0'], ['#d23a7a', '#2f6fb5', '#f0b23a']];
function dunceCap(k, i, u) { // drawn at the origin, base centre (0, 0), tip up; u 0..1 how far it has folded from the flat ballot
  const [c0, c1, c2] = DUNCE[i % DUNCE.length], hh = .27 * k * lerp(.5, 1, u), w = .14 * k;
  g.fillStyle = c0; g.beginPath(); g.moveTo(-w, 0); g.lineTo(0, -hh); g.lineTo(w, 0); g.quadraticCurveTo(0, .04 * k, -w, 0); g.fill();
  g.save(); g.clip(); g.fillStyle = c1; for (let b = 0; b < 3; b++) { const y0 = -hh * (.12 + b * .3), y1 = y0 - hh * .13; g.beginPath(); g.moveTo(-w * 1.2, y0 + .02 * k); g.lineTo(w * 1.2, y0 - .03 * k); g.lineTo(w * 1.2, y1 - .03 * k); g.lineTo(-w * 1.2, y1 + .02 * k); g.fill(); } // tilted bands
  g.fillStyle = 'rgba(40,20,20,.22)'; g.beginPath(); g.moveTo(0, -hh); g.lineTo(w, 0); g.quadraticCurveTo(w * .4, .03 * k, w * .3, .02 * k); g.closePath(); g.fill(); g.restore(); // the fold side in shadow
  g.strokeStyle = 'rgba(50,25,20,.6)'; g.lineWidth = Math.max(1, .008 * k); g.beginPath(); g.moveTo(-w, 0); g.lineTo(0, -hh); g.lineTo(w, 0); g.stroke();
  g.fillStyle = c1; g.beginPath(); g.ellipse(0, .005 * k, w * 1.02, .028 * k, 0, 0, TAU); g.fill(); // a band round the brim
  if (u > .5) { const r = .045 * k * ease(u, .5, 1); g.fillStyle = c2; g.beginPath(); g.arc(0, -hh - r * .6, r, 0, TAU); g.fill(); g.fillStyle = 'rgba(255,255,255,.3)'; g.beginPath(); g.arc(-r * .3, -hh - r, r * .35, 0, TAU); g.fill(); } // the pompom
}
function partyHat(x, ey, k, h, i, front) { // joke 1: the dunce cap on his egg, tipped well over to one side, a squash as it lands
  const top = ey - .13 * k, sq = 1 + .28 * Math.sin(clamp(h.pop / .3) * Math.PI) * (1 - clamp(h.pop / .3)), tl = (i % 2 ? .42 : -.38) + .04 * Math.sin(h.age * 3 + i);
  g.save(); g.translate(x + (i % 2 ? .03 : -.03) * k, top); g.rotate(tl); g.scale(1 / Math.sqrt(sq), sq); dunceCap(k, i, 1); g.restore();
}
function partyHorn(x, ey, k, u, side, t, i) { // joke 2: a paper party horn unrolls .4 m, red and white, and curls back up
  const L = .4 * k, ds = L / 36, straight = u * L, w = .05 * k; let px = x + side * .045 * k, py = ey + .06 * k, hd = side > 0 ? .3 : Math.PI - .3; const pts = [[px, py]];
  for (let s = 0; s < L; s += ds) { if (s > straight) { const cu = (s - straight) / Math.max(1e-3, L - straight), rad = Math.max(.012 * k, .06 * k * (1 - .75 * cu)); hd -= side * ds / rad; } else hd += side * .004 * Math.sin(t * 9 + i); px += Math.cos(hd) * ds; py += Math.sin(hd) * ds; pts.push([px, py]); }
  g.lineCap = 'butt'; g.lineWidth = w; for (let j = 0; j < pts.length - 1; j++) { g.strokeStyle = Math.floor(j / 3) % 2 ? '#f2ede0' : '#d0281f'; g.beginPath(); g.moveTo(pts[j][0], pts[j][1]); g.lineTo(pts[j + 1][0], pts[j + 1][1]); g.stroke(); }
  g.lineCap = 'round'; g.fillStyle = '#d9b45a'; g.beginPath(); g.arc(x + side * .04 * k, ey + .06 * k, .025 * k, 0, TAU); g.fill(); // the mouthpiece
}
function bookMask(x, ey, k, m) { // mystery book: a noir cover with a big cream "?", held up as a mask; two eye holes cut through it, and nothing behind them
  const bw = .38 * k, bh = .48 * k, cy = ey + .03 * k + (1 - m) * .45 * k;
  g.save(); g.translate(x, cy);
  g.fillStyle = '#1c1a22'; g.fillRect(-bw / 2, -bh / 2, bw, bh); g.fillStyle = '#2c2734'; g.fillRect(-bw / 2, -bh / 2, bw * .08, bh); // the spine
  g.strokeStyle = '#efe4c8'; g.lineWidth = Math.max(1, .006 * k); g.strokeRect(-bw / 2 + .022 * k, -bh / 2 + .022 * k, bw - .044 * k, bh - .044 * k);
  g.fillStyle = '#8f1d1d'; g.fillRect(-bw / 2 + .04 * k, bh * .34, bw - .08 * k, .025 * k);
  g.fillStyle = '#efe4c8'; g.font = `bold ${Math.max(6, .34 * k) | 0}px Georgia, serif`; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.fillText('?', .01 * k, bh * .3);
  if (m > .6) { const hr = .03 * k; g.globalCompositeOperation = 'destination-out'; for (const d of [-1, 1]) { g.beginPath(); g.ellipse(d * .068 * k, -.13 * k, hr * 1.15, hr, 0, 0, TAU); g.fill(); } // cut clean through the cover and the head
    g.globalCompositeOperation = 'source-over'; g.strokeStyle = '#0c0b10'; g.lineWidth = Math.max(1, .008 * k); for (const d of [-1, 1]) { g.beginPath(); g.ellipse(d * .068 * k, -.13 * k, hr * 1.15, hr, 0, 0, TAU); g.stroke(); } }
  g.restore();
  g.fillStyle = PAL.egg; for (const d of [-1, 1]) { g.beginPath(); g.ellipse(x + d * .19 * k, cy + .06 * k, .045 * k, .06 * k, 0, 0, TAU); g.fill(); } // his fingers on the edges
}
function clipGeom(x, sh, k, minT) { // the minutes: where the clipboard sits on his lap, how many lines are written, where the pen is
  const cx = x - .02 * k, cy = sh + .16 * k, w = .35 * k, h = .25 * k, rate = 1.6, posted = minT > L_(36).e + .5 - (OUT.vote[1] - .9);
  const n = posted ? 0 : Math.min(6, Math.floor(minT * rate)), cur = posted ? 0 : (minT * rate) % 1, li = Math.min(5, n), jerk = Math.floor(minT * 6.4) % 4;
  const lx = -w / 2 + .03 * k + .26 * k * (n >= 6 ? 1 : Math.floor(cur * 4) / 4) + (jerk % 2) * .008 * k, ly = -h / 2 + .055 * k + li * .03 * k - (jerk === 1 ? .01 * k : 0), c = Math.cos(-.12), s2 = Math.sin(-.12);
  return { cx, cy, w, h, n, cur, rot: -.12, pen: [cx + lx * c - ly * s2, cy + lx * s2 + ly * c] };
}
function clipboard(G, k) { // a clipboard and a sheet that fills line by line
  g.save(); g.translate(G.cx, G.cy); g.rotate(G.rot); const { w, h } = G;
  g.fillStyle = '#8a6a44'; g.fillRect(-w / 2, -h / 2, w, h); g.fillStyle = '#fbf7ec'; g.fillRect(-w / 2 + .015 * k, -h / 2 + .03 * k, w - .03 * k, h - .045 * k);
  g.fillStyle = '#b8b2a6'; g.fillRect(-.05 * k, -h / 2 - .01 * k, .1 * k, .035 * k);
  g.strokeStyle = '#3a3640'; g.lineWidth = Math.max(1, .007 * k);
  for (let j = 0; j <= G.n && j < 6; j++) { const yy = -h / 2 + .055 * k + j * .03 * k, len = j < G.n ? .26 : .26 * Math.floor(G.cur * 4) / 4; if (len <= 0) continue;
    g.beginPath(); for (let s = 0; s <= 10; s++) g.lineTo(-w / 2 + .03 * k + len * k * s / 10, yy + .004 * k * Math.sin(s * 2.7 + j)); g.stroke(); }
  g.restore();
}
// ---------- the outro's props (draft 9) ----------
function collectTimes(i) { const v = OUT.vote[0]; return [v - .3 + (i % 7) * .05, v + .75 + (i % 5) * .05]; } // each grab: reach .3 s, back, toss .3 s; landed by gt + 1
function collectSide(i, gt) { return ((i + (gt > OUT.vote[0] + .5 ? 1 : 0)) % 2) ? 1 : -1; }
const STACK = { x: 1.0, z: -.3, dy: .012 }; // the ballot stack beside the hat hole, car-local
function stackCount(t) { let n = 0; for (let i = 0; i < 14; i++) for (const gt of collectTimes(i)) if (t >= gt + 1) n++; return n; }
function hatState(t, i) { // joke 1: each suit's hat leaves the stack and lands on his egg
  const j = OUT.joke[0], dep = j - .72 + (i % 7) * .04 + (i > 6 ? .02 : 0), land = dep + .5; if (t < dep) return null;
  return { dep, land, fly: clamp((t - dep) / .5), pop: Math.max(0, t - land), age: t - land, on: t >= land };
}
function ballotStack(t) {
  const n0 = stackCount(t); if (t < OUT.vote[0] - .3 || n0 <= 0) return;
  let gone = 0; for (let i = 0; i < 14; i++) { const h = hatState(t, i); if (h) gone += 2; } const n = Math.max(0, n0 - gone); if (n <= 0) return;
  const { x, z, dy } = STACK, hh = n * dy, w = .17, d = .12, y0 = TOP - tableSag(x, t), y1 = y0 + hh;
  const C = (a, b, y) => PL(x + a, y, z + b), faces = [[[-w, -d], [w, -d]], [[w, -d], [w, d]], [[w, d], [-w, d]], [[-w, d], [-w, -d]]];
  for (const [p, q] of faces) { const ps = [C(...p, y0), C(...q, y0), C(...q, y1), C(...p, y1)]; if (!ok(ps)) continue; let ar = 0; for (let m = 0; m < 4; m++) { const a = ps[m], b = ps[(m + 1) % 4]; ar += a[0] * b[1] - b[0] * a[1]; } if (ar > 0) continue;
    poly(ps, '#e6dfcd'); for (let s = 1; s < n; s += 2) { const a = C(...p, y0 + s * dy), b = C(...q, y0 + s * dy); seg(a, b, 1, 'rgba(120,100,80,.35)'); } }
  const tp = [C(-w, -d, y1), C(w, -d, y1), C(w, d, y1), C(-w, d, y1)]; poly(tp, '#f6f1e4');
  const m = C(0, 0, y1), k = kAt(m); g.strokeStyle = '#1a1a1a'; g.lineWidth = Math.max(1, .012 * k); g.beginPath(); for (const [a, b] of [[[-.06, -.04], [.06, .04]], [[.06, -.04], [-.06, .04]]]) { const p = C(...a, y1 + .001), q = C(...b, y1 + .001); g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); } g.stroke();
}
function ballotCard(x, y, k, rot, fold) { // a flying ballot (fold 0..1 turns it into a cone)
  g.save(); g.translate(x, y); g.rotate(rot); const w = .18 * k, h = .22 * k;
  if (fold > 0) { const tw = lerp(w, .24 * k, fold), th = lerp(h, .35 * k, fold), apex = lerp(0, 1, fold); g.fillStyle = '#f2ede0'; g.beginPath(); g.moveTo(-tw / 2, th / 2); g.lineTo(lerp(-tw / 2, 0, apex), -th / 2); g.lineTo(lerp(tw / 2, 0, apex), -th / 2); g.lineTo(tw / 2, th / 2); g.closePath(); g.fill(); g.strokeStyle = 'rgba(70,50,35,.5)'; g.lineWidth = 1; g.stroke(); }
  else { g.fillStyle = '#fbf7ec'; g.fillRect(-w / 2, -h / 2, w, h); g.strokeStyle = '#1a1a1a'; g.lineWidth = Math.max(1, .02 * k); g.beginPath(); g.moveTo(-.04 * k, -.04 * k); g.lineTo(.04 * k, .04 * k); g.moveTo(.04 * k, -.04 * k); g.lineTo(-.04 * k, .04 * k); g.stroke(); }
  g.restore();
}
function outroFlyers(t, at) { // ballots tossed onto the stack (vote 1) and hats flying off it onto the eggs (joke 1); at = the suits' screen anchors
  if (t < OUT.vote[0] - .3 || t > OUT.joke[0] + 1.5) return; const sx = STACK.x, sz = STACK.z;
  for (let i = 0; i < 14; i++) { const A = at[i]; if (!A) continue;
    for (const gt of collectTimes(i)) { const u = (t - gt - .7) / .3; if (u < 0 || u >= 1) continue; const top = PL(sx, TOP + stackCount(gt + 1) * STACK.dy - tableSag(sx, t), sz); if (top[2] < .2) continue;
      const kk = lerp(A.k, kAt(top), u); ballotCard(lerp(A.hx, top[0], u), lerp(A.hy, top[1], u) - Math.sin(u * Math.PI) * .6 * kk, kk, u * 5 + i, 0); }
    const h = hatState(t, i); if (h && !h.on) { const top = PL(sx, TOP + .1 - tableSag(sx, t), sz); if (top[2] < .2) continue; const u = h.fly, e = u * u * (3 - 2 * u), kk = lerp(kAt(top), A.k, e);
      const fx = lerp(top[0], A.x, e), fy = lerp(top[1], A.ey - .3 * A.k, e) - Math.sin(u * Math.PI) * 1.1 * kk, fold = ease(u, .25, .7), rot = (1 - u) * 4 + i * .3;
      const cf = ease(fold, .15, .55); if (cf < 1) { g.save(); g.globalAlpha = 1 - cf; ballotCard(fx, fy, kk, rot, 0); g.restore(); } // draft 11: the ballot folds into his coloured dunce cap in the air
      if (cf > 0) { g.save(); g.globalAlpha = cf; g.translate(fx, fy + .12 * kk); g.rotate(rot * (1 - ease(u, .7, 1)) + (i % 2 ? .42 : -.38) * ease(u, .7, 1)); dunceCap(kk, i, fold); g.restore(); } } }
}
function confetti(t) { // joke 3: shredded ballots flung from the board's hands over the crowd, fluttering down
  const j = OUT.joke[2]; if (t < j - .1 || t > j + 3.6) return;
  for (let i = 0; i < 14; i++) { const s = SEATS[i], tt = j + i * .02, age = t - tt; if (age < 0) continue; const F = seatFrame(s), y0 = SEAT + .95 + TORSO + .7, yw = yaw(tt);
    const lo = sp(s.x, s.z, F, -.15, 0, 0), [X0, Z0] = carLocalToWorld(tt, lo[0], lo[2]), out = [-F.f[0], -F.f[1]], ox = out[0] * Math.cos(yw) - out[1] * Math.sin(yw), oz = out[0] * Math.sin(yw) + out[1] * Math.cos(yw);
    for (let b = 0; b < 16; b++) { const sd = i * 31 + b, sp0 = 2.5 + 3 * rnd(sd, 1), sa = (rnd(sd, 2) - .5) * 2.2, vx = (ox * Math.cos(sa) - oz * Math.sin(sa)) * sp0, vz = (ox * Math.sin(sa) + oz * Math.cos(sa)) * sp0, vy = 2 + 2.5 * rnd(sd, 3);
      const dr = (1 - Math.exp(-age * 1.8)) / 1.8, X = X0 + vx * dr + .3 * Math.sin(age * 3 + sd), Z = Z0 + vz * dr, Y = Math.max(.02, y0 + vy * (1 - Math.exp(-age * 2.5)) / 2.5 - .75 * age + .08 * Math.sin(age * 7 + sd));
      const p = P(X, Y, Z); if (p[2] < .5 || p[0] < -50 || p[0] > W + 50 || p[1] < -50 || p[1] > H + 50) continue; const k = kAt(p), a = 1 - ease(age, 2.8, 3.6); if (a <= 0) continue;
      g.save(); g.globalAlpha = a; g.translate(p[0], p[1]); g.rotate(age * (4 + 6 * rnd(sd, 4)) + sd); g.scale(1, .3 + .7 * Math.abs(Math.cos(age * 6 + sd)));
      const L = Math.max(2, .1 * k), Wd = Math.max(1, .025 * k); g.fillStyle = '#f2ede0'; g.fillRect(-L / 2, -Wd / 2, L, Wd); if (b % 3 === 0) { g.fillStyle = '#1a1a1a'; g.fillRect(-L * .1, -Wd / 2, L * .12, Wd); } g.restore(); } }
}
function friendsArms(t, at) { // the photo-op: stiff arms from the two nearest suits across Little Bob's shoulders, drawn over him
  const s = L_(24).s - .1, e = L_(24).e + .6; if (t < s || t > e) return; const hole = PL(0, TOP, 0); if (hole[2] < .3) return; const k = kAt(hole);
  const big = wt(24, 'big'), swell = ease(t, big - .12, big + .12) * (1 - ease(t, big + .45, big + .8)), h = 1.15 * k * (1 + .22 * swell);
  const up = easeOutBack(clamp((t - s) / .55), 1.4) * (1 - ease(t, e - .5, e)), feet = hole[1] + h * lerp(1.05, .36, up), shy = feet - h * 230 / 330, shx = 21 * h / 330; if (up < .5) return;
  const fr = []; for (let i = 0; i < 14; i++) if (at[i] && at[i].friend > 0) fr.push(at[i]); if (!fr.length) return; fr.sort((a, b) => a.x - b.x);
  fr.forEach((A, j) => { const d = j === 0 && fr.length > 1 ? -1 : (A.x < hole[0] ? -1 : 1), u = A.friend, from = d < 0 ? A.R : A.L, near = [hole[0] + d * shx, shy], far = [hole[0] - d * shx * .9, shy + .01 * k];
    const m = [lerp(from[0], near[0], u), lerp(from[1], near[1], u)], f2 = [lerp(from[0], far[0], u), lerp(from[1], far[1], u)];
    g.strokeStyle = PAL.suitLit; g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = .11 * A.k; g.beginPath(); g.moveTo(from[0], from[1]); g.lineTo(m[0], m[1]); g.lineTo(f2[0], f2[1] - j * .02 * k); g.stroke();
    g.fillStyle = PAL.egg; g.beginPath(); g.arc(f2[0], f2[1] - j * .02 * k, .05 * A.k, 0, TAU); g.fill(); });
}
// ---------- drawing the car (moved from render.js for draft 3) ----------
let CAR_NEAR = []; // the sitters drawn after the table (near half and up on the table), for carGlow's night pass
// b7: the head of suit i (egg centre, car-local metres, and in the world) at song time t, so the crowns can sit on it
function suitHeadLocal(i, t) { const s = SEATS[i], o = seatState(s, t, i), Pz = bodyPose(s, o); return [Pz.bx, Pz.hy + TORSO + .19 - .035 * (o.nod || 0) + .09 * (o.bounce || 0), Pz.bz]; }
function suitHeadWorld(i, t) { const l = suitHeadLocal(i, t), [X, Z] = carLocalToWorld(t, l[0], l[2]); return [X, l[1], Z]; }
function drawCar(t) {
  REEL_A = t * 7; CAR_NEAR = [];
  const seats = SEATS.map((s, i) => { const o = seatState(s, t, i), Pz = bodyPose(s, o); return { s, i, o, Pz, d: PL(Pz.bx, SEAT, Pz.bz)[2], up: o.onTable > .45 }; }).sort((a, b) => b.d - a.d), mid = PL(0, SEAT, 0)[2];
  const AT = []; // screen anchors per suit (for the flyers, the hats and the photo-op arms)
  // draft 11: the board for the actor check (tools/check-actors.mjs): the top as five circles along its length (r .9, so they do not count as overlapping each other), and each
  // suit on his chair as his own circle; a suit up on the table is part of the top's footprint and is not noted apart
  if (ACT.on) { for (let j = 0; j < 5; j++) { const [X, Z] = carLocalToWorld(t, -3.3 + j * 1.65, 0); ACT.note('car:table:' + j, X, Z, .9, { h: 2.3, group: 'board' }); }
    for (const rec of seats) { if (rec.o.onTable > .02) continue; const [X, Z] = carLocalToWorld(t, rec.Pz.bx, rec.Pz.bz); ACT.note('car:suit:' + rec.i, X, Z, .4, { h: 1.7, group: 'board' }); } }
  const sitter = (rec) => { const { s, i, o, Pz } = rec;
    const p = PL(Pz.bx, Pz.hy, Pz.bz); if (p[2] < .25) return; const k = kAt(p);
    const drop = i === CHAIR_I ? .22 * crutchSoft(t, i).kink : 0;
    const home = o.onChair < .02 && o.onTable < .02 && o.stand < .5 && o.flip < .02 && !drop;
    if (!home) seatTop(s, drop);
    o.leg = legPts(s, Pz, o); o.chair = home ? () => seatTop(s) : null;
    if (o.arms === 'gavel') { const G = gavelLocal(t, Pz), law = wt(0, 'law'); o.hand = PL(...G.grip); o.handW = ease(t, law - 1.85, law - 1.55) * (1 - ease(t, law + 1.45, law + 1.8)); if (G.hold > 0) o.prop = () => drawGavel(t, G); }
    const sh = p[1] - TORSO * k - (o.bounce ? o.bounce * .09 * k : 0), ey = sh - .19 * k + (o.nod || 0) * .035 * k;
    if (o.pinHand > 0) { o.hand = [p[0] - .12 * k, sh + .14 * k]; o.handW = o.pinHand; }
    if (o.reach > 0 || o.carry > 0) { const sd = o.reachSide || 1; o.hand = [p[0] + sd * .62 * k, sh - .08 * k]; o.handW = Math.max(o.reach, o.carry ? .35 : 0); }
    if (o.minutes > 0) { const CG = clipGeom(p[0], sh, k, o.minT), pen = CG.pen, m = o.minutes; o.propBack = () => { if (!CAR_SIL) clipboard(CG, k); };
      o.hand = [pen[0] + .04 * k, pen[1] - .05 * k]; o.handL = [lerp(p[0] - .2 * k, CG.cx - CG.w / 2 + .01 * k, m), lerp(sh + .5 * k, CG.cy + .06 * k, m)]; o.handW = m;
      o.prop = () => { if (CAR_SIL) return; g.strokeStyle = '#1a1a1a'; g.lineWidth = Math.max(1.5, .014 * k); g.lineCap = 'round'; g.beginPath(); g.moveTo(pen[0], pen[1]); g.lineTo(pen[0] + .07 * k, pen[1] - .1 * k); g.stroke(); g.fillStyle = PAL.egg; g.beginPath(); g.arc(pen[0] + .04 * k, pen[1] - .05 * k, .045 * k, 0, TAU); g.fill(); }; }
    const A3 = [Pz.bx, Pz.hy + TORSO + .19 - .035 * (o.nod || 0) + .09 * (o.bounce || 0), Pz.bz];
    o.headBack = (x, eY, k2) => { if (o.horn > 0 && !o.front) partyHorn(x, eY, k2, o.horn, i % 2 ? 1 : -1, t, i); };
    o.headFront = (x, eY, k2) => {
      if (o.pin > 0) pinwheel(x, eY, k2, o.pin, PIN_A, PIN_B);
      if (o.vane > 0) weathervane(x, eY, k2, o.vane, A3, t);
      if (o.hat && o.hat.on) partyHat(x, eY, k2, o.hat, i, o.front);
      if (o.horn > 0 && o.front) partyHorn(x, eY, k2, o.horn, i % 2 ? 1 : -1, t, i);
      if (o.mask > 0) bookMask(x, eY, k2, o.mask);
    };
    if (o.swivel > 0) { // the snub: he swivels on his seat (squashed edge-on halfway) and ends with his back to her, egg tipped up and away
      const sw = o.swivel, sx = Math.abs(Math.cos(sw * Math.PI)), her = PL(6.15, 0, -3), side = her[2] > .2 ? Math.sign(her[0] - p[0]) || 1 : 1;
      o.front = sw > .5 ? 0 : 1; o.etilt = -side * .45 * sw;
      g.save(); g.translate(p[0], 0); g.scale(Math.max(.08, sx), 1); g.translate(-p[0], 0); suit(p[0], p[1], k, o); g.restore(); }
    else if (o.flip > 0) { const pv = PL(Pz.bx, Pz.hy + .45, Pz.bz); g.save(); g.translate(pv[0], pv[1]); g.rotate(o.flip * Math.PI * (i % 2 ? 1 : -1)); g.translate(-pv[0], -pv[1]); suit(p[0], p[1], k, o); g.restore(); }
    else suit(p[0], p[1], k, o);
    const hr = o.hand && (o.handW == null || o.handW > .5) ? o.hand : [p[0] + .2 * k, sh + .3 * k];
    AT[i] = { x: p[0], y: p[1], k, ey, sh, hx: hr[0], hy: hr[1], friend: o.friend || 0, R: [p[0] + .24 * k, sh + .06 * k], L: [p[0] - .24 * k, sh + .06 * k] };
  };
  const seatDraw = (x) => { seatUnder(x.s, t, x.i); if (!x.up) sitter(x); else seatTop(x.s, x.i === CHAIR_I ? .22 * crutchSoft(t, x.i).kink : 0); };
  PIN_A = pinAng(t); PIN_B = pinBlur(t);
  seats.filter((x) => x.d > mid).forEach(seatDraw);
  if (typeof rapperCar === 'function') rapperCar(t, 0); // draft 13: the diva when she is on the far side of the table
  tableBody(t); driverHat(); lawMarks(t); dayPlate(t);
  { const G = gavelLocal(t, null); if (gavelHold(t) <= 0) drawGavel(t, G); } // the gavel lying on the table
  tablePropsBack(t); ballotStack(t);
  seats.filter((x) => x.d <= mid).forEach((x) => { seatDraw(x); if (!x.up) CAR_NEAR.push(x); });
  seats.filter((x) => x.up).forEach((x) => { sitter(x); CAR_NEAR.push(x); }); // the board up on the table top
  if (typeof rapperCar === 'function') rapperCar(t, 1); // draft 13: the diva on our side
  tablePropsFront(t); pieBirds(t); if (typeof installsCar === 'function') installsCar(t); bobPopUp(t);
  friendsArms(t, AT); outroFlyers(t, AT); minutesPost(t, AT); confetti(t);
  CAR_AT = AT;
}
let PIN_A = 0, PIN_B = 0, CAR_AT = [];
function minutesPost(t, at) { // the minute-taker posts the finished sheet into the hat hole
  const p0 = L_(36).e + .5, u = (t - p0) / .55; if (u < 0 || u >= 1) return; const A = at[MINUTES_I]; if (!A) return; const hole = PL(0, TOP, 0); if (hole[2] < .2) return;
  const e = u * u, kk = lerp(A.k, kAt(hole), e) * (1 - .6 * e); ballotCard(lerp(A.x, hole[0], e), lerp(A.sh + .16 * A.k, hole[1], e) - Math.sin(u * Math.PI) * .5 * A.k, kk, u * 3, 0);
}
// emissive pass for the car layer at night (optional, needs a call in render.js after the car layer's grade): a warm rim
// of firelight on the suits and the raised ballots, so the voting board reads as solid figures against the burn.
// Draft 9: the near figures (backs to the fire, drawn after the table) were lifted by the fire glow to the table's own
// colour and read as see-through; here their bodies are darkened into solid backlit silhouettes with a rim of firelight
// on the edge that faces the fire. Their eggs, hats and props stay as graded.
const SILC = mkCanvas(), silg = SILC.getContext('2d'), RIMC = mkCanvas(), rimg = RIMC.getContext('2d');
function carGlow(t) {
  const b = typeof burnAmt === 'function' ? burnAmt(t) : 0; if (b < .05) return;
  g.save(); g.globalCompositeOperation = 'source-atop';
  const { p } = manGeom(); const rg = g.createRadialGradient(p[0], p[1] - 200, 50, p[0], p[1] - 200, W * .9); rg.addColorStop(0, `rgba(255,150,70,${.32 * b})`); rg.addColorStop(1, `rgba(255,110,50,${.1 * b})`);
  g.fillStyle = rg; g.fillRect(0, 0, W, H); g.restore();
  const na = clamp((b - .05) / .25); if (na <= 0 || !CAR_NEAR.length) return;
  const gk = g; g = silg; silg.setTransform(1, 0, 0, 1, 0, 0); silg.globalAlpha = 1; silg.globalCompositeOperation = 'source-over'; silg.clearRect(0, 0, W, H);
  CAR_SIL = true; try { for (const rec of CAR_NEAR) { const o = seatState(rec.s, t, rec.i), Pz = bodyPose(rec.s, o), p2 = PL(Pz.bx, Pz.hy, Pz.bz); if (p2[2] < .25) continue; const k = kAt(p2); o.leg = legPts(rec.s, Pz, o); o.chair = null; suit(p2[0], p2[1], k, o); } } finally { CAR_SIL = false; g = gk; }
  silg.globalCompositeOperation = 'source-in'; silg.fillStyle = 'rgb(255,255,255)'; silg.fillRect(0, 0, W, H); // the silhouette as a white mask
  // the rim: the mask minus itself shifted away from the fire
  const fx = p[2] > .5 ? p[0] : W / 2, fy = p[2] > .5 ? p[1] - 200 : -200;
  rimg.setTransform(1, 0, 0, 1, 0, 0); rimg.globalCompositeOperation = 'source-over'; rimg.clearRect(0, 0, W, H); rimg.drawImage(SILC, 0, 0);
  const dl = Math.hypot(fx - W / 2, fy - H * .7) || 1, ox = (fx - W / 2) / dl * 4, oy = (fy - H * .7) / dl * 4;
  rimg.globalCompositeOperation = 'destination-out'; rimg.drawImage(SILC, -ox, -oy); rimg.globalCompositeOperation = 'source-in'; rimg.fillStyle = 'rgb(255,170,90)'; rimg.fillRect(0, 0, W, H);
  silg.fillStyle = 'rgb(46,26,34)'; silg.fillRect(0, 0, W, H); // source-in still: the dark body colour
  gk.save(); gk.globalCompositeOperation = 'multiply'; gk.globalAlpha = .8 * na; gk.drawImage(SILC, 0, 0); gk.globalCompositeOperation = 'source-atop'; gk.globalAlpha = .55 * na * clamp(b / .5); gk.drawImage(RIMC, 0, 0); gk.restore();
}
// ---------- the car's marks on the playa: wheel tracks and a dust trail, depth-sorted with the playa ----------
function carLocalToWorld(ts, lx, lz) { const X0 = carX(ts), Z0 = carZ(ts), a = yaw(ts), c = Math.cos(a), s = Math.sin(a); return [X0 + lx * c - lz * s, Z0 + lx * s + lz * c]; }
function carSpeed(ts) { return Math.hypot(carX(ts + .05) - carX(ts - .05), carZ(ts + .05) - carZ(ts - .05)) / .1; }
function carInto(t, list) {
  const night = typeof nightAmt === 'function' ? nightAmt(t) : 0;
  // wheel tracks: where the rear wheels were over the last 16 s (they curl where the table spun)
  list.push({ z: 1e5, draw: () => { g.lineCap = 'butt'; g.lineJoin = 'round';
    for (const lz of [-TD * .95, TD * .95]) { const pts = [];
      for (let j = 0; j <= 64; j++) { const ts = t - j * .25; if (ts < 0) break; const [X, Z] = carLocalToWorld(ts, WHEELS[0], lz); pts.push(P(X, 0, Z)); }
      for (let c = 0; c < 4; c++) { const ch = pts.slice(c * 16, c * 16 + 17).filter((q) => q[2] > .5); if (ch.length < 2) continue;
        g.strokeStyle = `rgba(92,58,32,${.26 * (1 - c / 4) * (1 - night * .7)})`; g.lineWidth = Math.max(1, .13 * kAt(ch[0])); g.beginPath(); ch.forEach((q, j) => j ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.stroke(); } } } });
  // dust: pale puffs kicked up behind the car, rising and spreading as they fall behind, gone in 4.5 s
  const dt = .12, AGE = 4.5, t0 = Math.floor(t / dt) * dt;
  for (let j = 0; j < AGE / dt; j++) { const ts = t0 - j * dt, age = t - ts; if (ts < 0) break; const v = clamp(carSpeed(ts) / 1.6, 0, 1.5); if (v < .05) continue;
    for (let w = 0; w < 3; w++) { const seed = Math.round(ts / dt) * 3 + w, lz = [-TD * .8, TD * .8, 0][w] + (rnd(seed, 4) - .5) * .8, lx = -TL - .2 - rnd(seed, 1) * .5;
      const [X0, Z0] = carLocalToWorld(ts, lx, lz), X = X0 - age * .3 + (rnd(seed, 2) - .5) * age * .7, Z = Z0 + age * .3 + (rnd(seed, 3) - .5) * age * .6, Y = .3 + age * .32 + rnd(seed, 5) * .2, r = .45 + age * .38;
      const q = P(X, Y, Z); if (q[2] < 1) continue; const a = .42 * Math.min(1, v) * clamp(1 - age / AGE) ** 1.4 * (age < .2 ? age / .2 : 1) * (1 - night * .6); if (a < .01) continue;
      list.push({ z: q[2], draw: () => { const R = r * kAt(q); if (R < 1) return; const rg = g.createRadialGradient(q[0], q[1] - R * .15, 0, q[0], q[1], R);
        rg.addColorStop(0, `rgba(252,242,222,${a})`); rg.addColorStop(.55, `rgba(242,226,196,${a * .6})`); rg.addColorStop(1, 'rgba(236,216,180,0)');
        g.fillStyle = rg; g.beginPath(); g.ellipse(q[0], q[1], R * 1.35, R, 0, 0, TAU); g.fill(); } }); } }
}
