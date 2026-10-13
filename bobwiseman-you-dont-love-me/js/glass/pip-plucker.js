// The Pip who plucks the daisy. Bob (2026-10-12): "could the pips (or one of them) be plucking the daisy petals
// throughout?" One small Pip (the bridge's middle singer: sky-blue suit, gold lapels, ruby bow tie, drawn by
// bridge-trio.js's drawSinger) drops in from the top of frame a beat before each petal drop, hovers beside the
// petal, reaches in and takes hold of its outer end, pulls it on its exact drop frame (the falling petal starts
// in his fingers and he follows it for the first fifth of a second), lets it go, brushes off his hands with a
// little "me" and flies back up out of the top, as the trio left the bridge. Nothing else about the daisy changes.
// Needs bridge-timing.js and bridge-trio.js loaded first. Pure function of song time t.

const PLK = {
  s: .15,              // roundel units per figure unit: a Pip is ~810 figure units tall, so ~120 px
  singer: SINGERS[1],
  reach: 34,           // shoulder to grip point, roundel units
  grip: 28,            // the grip point: this far out along the petal from its centre (petal half length 39)
  top: -400,           // pelvis height (roundel frame, gravity down) that puts him wholly above the frame
  silent: new Set([9]), // petal 10 (70.63) has no sung "me": no mouth there
};
const PLK_HOVER = { L: [-.5, .7], R: [.5, -.7], lL: [-.1, .2], lR: [.12, .38], x: 0, lean: 0, tilt: 0, dip: 0 };
const PLK_FLY = { L: [-2.5, -2.7], R: [2.5, 2.7], lL: [-.05, -.02], lR: [.05, .02], x: 0, lean: 0, tilt: -.12, dip: 0 };

// A falling petal's centre and angle (gravity frame, roundel centre origin), dt after its drop; k = petal index,
// a = its slot angle, sw = the roundel's swing. The three mains draw their falling petals with this, so the fall
// starts exactly in the slot (where his hand holds it).
function plkFall(k, a, sw, dt) {
  const rx = Math.cos(a) * 64, ry = Math.sin(a) * 64;
  const wx = rx * Math.cos(sw) - ry * Math.sin(sw), wy = rx * Math.sin(sw) + ry * Math.cos(sw);
  return [wx + Math.cos(a) * 30 * Math.min(dt * 4, 1) + (Math.sin(dt * 5 + k) - Math.sin(k)) * 26, wy + 520 * dt * dt,
    a + sw + dt * (k % 2 ? 2.6 : -2.2)];
}
const plkAngle = (k) => -Math.PI / 2 + k * TAU / 27;

// 2-bone arm IK in the singer's body frame: shoulder S, target T -> [upper, forearm] (0 down, +pi/2 screen right).
// side picks which way the elbow bends.
function plkIK(S, T, side) {
  const dx = T[0] - S[0], dy = T[1] - S[1], up = FIG.up, lo = FIG.lo;
  const d = Math.min(Math.hypot(dx, dy), up + lo - 2), phi = Math.atan2(dx, dy);
  const al = Math.acos(clamp((up * up + d * d - lo * lo) / (2 * up * d), -1, 1)) * side;
  const a1 = phi - al, ex = S[0] + Math.sin(a1) * up, ey = S[1] + Math.cos(a1) * up;
  return [a1, Math.atan2(T[0] - ex, T[1] - ey)];
}

// Draw him, in the roundel's frame (origin at its centre, rotated by the swing sw), after the petals and hub.
// drops/first: the page's own drop list and the song-wide index of its first petal. tod lights him like the glass.
function drawPipPlucker(g, t, sw, tod, drops, first) {
  let n = -1; for (let i = 0; i < drops.length; i++) if (t > drops[i] - .8 && t < drops[i] + .9) { n = i; break; }
  if (n < 0) return;
  const d = drops[n], k = first + n, a = plkAngle(k), dt = t - d, s = PLK.s;
  // the grip point while the petal is still in its slot, then on the falling petal
  let grip = [Math.cos(a + sw) * (64 + PLK.grip), Math.sin(a + sw) * (64 + PLK.grip)];
  if (dt >= 0) { const [fx, fy, r] = plkFall(k, a, sw, Math.min(dt, .2)); grip = [fx + Math.cos(r) * PLK.grip, fy + Math.sin(r) * PLK.grip]; }
  // his station (left-hand petals: out past the rim along the petal; the rest: level with it on its left, so the
  // arm reads as a sideways reach and his body never sits on top of the petal he is taking)
  const tip = [Math.cos(a) * (64 + PLK.grip), Math.sin(a) * (64 + PLK.grip)];
  const sh = Math.cos(a) < -.3 ? [tip[0] + Math.cos(a) * PLK.reach, tip[1] + Math.sin(a) * PLK.reach] : [tip[0] - PLK.reach, tip[1] + 4];
  const side = tip[0] >= sh[0] - 1 ? 1 : -1;               // the arm on the petal's side reaches (screen right = R)
  const shB = [side * FIG.shX, FIG.shY + 12];              // that shoulder in body units
  const pel0 = [sh[0] - shB[0] * s, sh[1] - shB[1] * s];   // pelvis at his station
  // in from above (landing with a little overshoot), out the top again
  const fin = easeOutBack(lin(t, d - .78, d - .42), 1.15), fout = Math.pow(lin(t, d + .42, d + .85), 2.2);
  const bob = 2.2 * Math.sin(t * 7.1) * (1 - fout);
  const py = lerp(PLK.top, pel0[1], fin) + bob + (PLK.top - pel0[1]) * fout;
  const px = pel0[0];
  if (py < PLK.top + 1) return;
  // pose: arms up as he drops and leaves, hovering in between, the near arm on the petal from d-.4 to d+.2
  const fly = Math.max(1 - lin(t, d - .55, d - .4), lin(t, d + .38, d + .5));
  let P = mixPose(PLK_HOVER, { ...PLK_HOVER, lL: [-.2, .08], lR: [.02, .5] }, .5 + .5 * Math.sin(t * 7.1));
  const w = ease(t, d - .45, d - .12) * (1 - ease(t, d + .2, d + .42));
  if (w > 0) {
    // the target in body units (from the pelvis as it is now), for the wrist: the fingertips sit ~30 units past it
    const bx = (grip[0] - px) / s, by = (grip[1] - py) / s, u = [bx - shB[0], by - shB[1]], ul = Math.hypot(...u) || 1;
    const ik = plkIK(shB, [bx - u[0] / ul * 30, by - u[1] / ul * 30], side);
    const key = side > 0 ? 'R' : 'L';
    P = { ...P, [key]: P[key].map((v, i) => lerp(v, ik[i], w)), tilt: lerp(0, .14 * side, w) };
  }
  // after letting go: a brush of the hands (both forearms swing in and out)
  const brush = ease(t, d + .22, d + .3) * (1 - ease(t, d + .36, d + .45));
  if (brush > 0) { P.L = [P.L[0], lerp(P.L[1], 1.9, brush)]; P.R = [P.R[0], lerp(P.R[1], -1.9, brush)]; }
  P = mixPose(P, PLK_FLY, fly);
  // a little "me" as the petal comes away
  P.mouth = PLK.silent.has(k) ? .06 : Math.max(.06, ease(t, d - .04, d + .05) * (1 - .9 * ease(t, d + .25, d + .4)));
  // into drawSinger's stage coordinates: it puts the pelvis at (S.x + P.x * TRIO_SC, pelvisY) scaled by TRIO_SC
  const S = PLK.singer, legH = Math.max(...[P.lL, P.lR].map(([a1, a2]) => FIG.th * Math.cos(a1) + FIG.sh * Math.cos(a2)));
  const pelY = TRIO_FLOOR_Y - legH * TRIO_SC + Math.max(0, P.dip - 6) * .5 * TRIO_SC;
  const L = .35 + .65 * tod.I, b = L * (tod.col[0] + tod.col[1] + tod.col[2]) / 765;
  g.save(); g.rotate(-sw); g.translate(px, py); g.scale(s / TRIO_SC, s / TRIO_SC); g.translate(-(S.x + P.x * TRIO_SC), -pelY);
  if (b < .985) g.filter = `brightness(${b.toFixed(3)})`;
  drawSinger(g, S, 1, t, P);
  g.restore();
}
