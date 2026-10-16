// Reform Party, Dali look: the suits and the boardroom table car.
// Draft 3: low hop-on seats on stubby brackets (seat at the hubcap line, knees up, feet on the sand), wheels showing under
// the skirt hem and a dust trail behind; an oversized gavel slams on "law" and goes soft; egg lids lift on each "grin",
// more each refrain; the board flips upside down on "perverse"; vogue poses; the four outro votes escalate.
// ---------- figures ----------
// the party's faceless egg head. Optional: lid 0..1 (the top lifts like a lid), teeth 0..1 (wind-up teeth climb out),
// tilt (radians), chat 0..1 (the teeth's jaw).
function egg(x, y, k, front, grin, lid, teeth, tilt, chat) {
  const rx = .125 * k, ry = .155 * k; lid = lid || 0; teeth = teeth || 0;
  g.save(); g.translate(x, y); if (tilt) g.rotate(tilt);
  const eg = g.createRadialGradient(-rx * .4, -ry * .45, rx * .1, 0, 0, ry * 1.2);
  eg.addColorStop(0, '#fffaf0'); eg.addColorStop(.55, PAL.egg); eg.addColorStop(1, '#b49a7c');
  const cy = -ry * .62, ar = -Math.asin(.62), al = Math.PI - ar, xr = rx * Math.cos(ar), N = 6;
  const zig = (fwd) => { for (let i = 0; i <= N; i++) { const u = fwd ? i / N : 1 - i / N; g.lineTo(lerp(-xr, xr, u), cy + (i % 2 ? -1 : 1) * ry * .035); } };
  g.fillStyle = eg;
  if (lid <= 0) { g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, TAU); g.fill(); }
  else { g.beginPath(); g.moveTo(-xr, cy); zig(true); g.ellipse(0, 0, rx, ry, 0, ar, al); g.closePath(); g.fill(); }
  if (front && grin > 0) { // a grin and nothing else
    g.save(); g.globalAlpha = grin; g.fillStyle = '#2b1c18'; g.beginPath(); g.ellipse(0, ry * .3, rx * .62, ry * .28, 0, 0, Math.PI); g.closePath(); g.fill();
    g.fillStyle = '#fbf3e3'; g.beginPath(); g.ellipse(0, ry * .3, rx * .55, ry * .1, 0, 0, Math.PI); g.closePath(); g.fill(); g.restore();
  }
  if (lid > 0) {
    const oh = ry * .1 * Math.min(1, lid * 3); g.fillStyle = '#e9d9bd'; g.beginPath(); g.ellipse(0, cy, xr * .96, oh, 0, 0, TAU); g.fill(); g.fillStyle = 'rgba(150,118,84,.55)'; g.beginPath(); g.ellipse(0, cy + oh * .15, xr * .7, oh * .6, 0, 0, TAU); g.fill(); // the pale shell rim and its shallow inside
    g.save(); g.translate(xr, cy - lid * ry * (.32 + teeth * .55)); g.rotate(-lid * .5); g.translate(-xr, -cy); // the lid on its hinge
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
  }
  g.restore();
}
function rosette(x, y, r) {
  g.fillStyle = PAL.rosette; g.beginPath(); g.moveTo(x - r * .4, y); g.lineTo(x - r * .7, y + r * 2.3); g.lineTo(x - r * .2, y + r * 2); g.lineTo(x, y); g.fill();
  g.beginPath(); g.moveTo(x + r * .2, y); g.lineTo(x + r * .3, y + r * 2.4); g.lineTo(x + r * .75, y + r * 2.1); g.lineTo(x + r * .5, y); g.fill();
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; g.beginPath(); g.arc(x + Math.cos(a) * r * .75, y + Math.sin(a) * r * .75, r * .38, 0, TAU); g.fill(); }
  g.fillStyle = '#f6d8a0'; g.beginPath(); g.arc(x, y, r * .42, 0, TAU); g.fill();
}
function arm(sx, sy, hx, hy, k, col) { g.strokeStyle = col; g.lineWidth = .13 * k; g.lineCap = 'round'; g.beginPath(); g.moveTo(sx, sy); g.quadraticCurveTo((sx + hx) / 2 + (hx > sx ? -1 : 1) * .03 * k, (sy + hy) / 2 + .05 * k, hx, hy); g.stroke(); g.fillStyle = PAL.egg; g.beginPath(); g.arc(hx, hy, .05 * k, 0, TAU); g.fill(); }
function handBallot(hx, hy, k) { g.fillStyle = '#fbf7ec'; g.fillRect(hx - .09 * k, hy - .27 * k, .18 * k, .22 * k); g.strokeStyle = '#1a1a1a'; g.lineWidth = Math.max(1, .02 * k); g.beginPath(); g.moveTo(hx - .04 * k, hy - .2 * k); g.lineTo(hx + .04 * k, hy - .12 * k); g.moveTo(hx + .04 * k, hy - .2 * k); g.lineTo(hx - .04 * k, hy - .12 * k); g.stroke(); }
const TORSO = .78; // seat to shoulder: a long-jacketed suit on a low seat
// A suit. (x, y) = screen point of the hips; k = px per metre.
// o: front, grin, arms ('rest'|'vote1'|'vote2'|'gavel'|'vogue'|'shrug'), lift, drawer (0..1), nod, plus (draft 3, all optional):
// leg = [[hip, knee, foot] x2] screen points (else the old dangling legs), chair() = seat pan + backrest drawn in the right
// order, pose = vogue hands [lx, ly, rx, ry, tilt] in k units from the shoulders, bounce, lid, teeth, chat, ballot, hand + prop
// (a screen-space right hand and a callback drawn after the arms).
function suit(x, y, k, o) {
  const front = o.front, nod = (o.nod || 0) * .035 * k, T = TORSO;
  const legs = () => {
    if (!o.leg) { g.fillStyle = PAL.suit; const sw = Math.sin(o.swing || 0) * .03 * k;
      g.fillRect(x - .17 * k + sw, y + .02 * k, .13 * k, .36 * k); g.fillRect(x + .04 * k - sw, y + .02 * k, .13 * k, .36 * k); return; }
    for (const [h, kn, f] of o.leg) { if (h[2] < .1 || kn[2] < .1 || f[2] < .1) continue; const kh = kAt(h), kk = kAt(kn), kf = kAt(f);
      seg(kn, f, .14 * kk, PAL.suit); seg(h, kn, .17 * kh, front ? PAL.suitLit : PAL.suit);
      g.fillStyle = '#141216'; g.beginPath(); g.ellipse(f[0], f[1], .1 * kf, .05 * kf, 0, 0, TAU); g.fill(); }
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
    else rosette(x - .15 * k, sh + .12 * k, .035 * k);
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
  if (o.hand) hr = o.hand;
  if (front || a !== 'rest') { arm(...L, ...hl, k, front ? PAL.suitLit : PAL.suit); arm(...R, ...hr, k, PAL.suit); } // from behind, resting hands are out of sight
  if (o.ballot > 0 && lift > .5) { if (a === 'vote1' || a === 'vote2') handBallot(...hr, k); if (a === 'vote2') handBallot(...hl, k); }
  if (o.prop) o.prop();
  // neck + head
  g.fillStyle = '#d7c3a3'; g.fillRect(x - .045 * k, sh - .07 * k, .09 * k, .08 * k);
  egg(x, sh - .19 * k + nod, k, front, o.grin || 0, o.lid, o.teeth, o.pose && a === 'vogue' ? o.pose[4] * lift : 0, o.chat);
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
const SEAT = .42; // hop-on seats at the hubcap line, low enough to hop on and off (Robin)
const WHEEL_R = .4, WHEELS = [-2.925, -.125, 2.575]; // three axles, in the gaps between the seats
const SEATS = [ // local x, z, faces camera at yaw 0, role
  ...[-3.6, -2.25, -.8, .55, 1.9, 3.25].map((x) => ({ x, z: 2.3, r: x === -.8 ? 'drawer' : 'b' })),
  ...[-3.6, -2.25, -.8, .55, 1.9, 3.25].map((x) => ({ x, z: -2.3, r: 'f' })),
  { x: -5.15, z: 0, r: 'chair' }, { x: 5.15, z: 0, r: 'end' },
];
// where the drawer torso's middle drawer opens, in car-local metres (for things flying into it)
function drawerMouth() { return [-.8, SEAT + .03 + TORSO - .255, 2.3 - .2]; }
function seatFrame(s) { if (!s.z) { const d = Math.sign(s.x); return { f: [-d, 0], r: [0, d] }; } const o = Math.sign(s.z); return { f: [0, -o], r: [o, 0] }; } // f = toward the table
const sp = (bx, bz, F, a, b, y) => [bx + F.f[0] * a + F.r[0] * b, y, bz + F.f[1] * a + F.r[1] * b];
const VOTE_LINES = [35, 36, 37, 38];
function seatState(s, t, i) {
  const o = { arms: 'rest', grin: 0, nod: Math.sin(t * 1.3 + i * 1.7) * .3, swing: t * 2 + i, lid: 0, teeth: 0, stand: 0, onChair: 0, onTable: 0, flip: 0, bounce: 0 };
  o.front = (s.r === 'chair' || s.r === 'end') ? 1 : (Math.cos(YAW) * Math.sign(s.z) > 0 ? 1 : 0); // as the table spins, who faces us flips
  // grin, and the egg lids: refrain 1 one lid lifts, refrain 2 the whole row on the beat, refrain 3 lids open and wind-up teeth climb out
  [5, 12, 33].forEach((li, r) => { const gr = wt(li, 'grin'); o.grin = Math.max(o.grin, ease(t, gr - .1, gr + .4) * (1 - ease(t, L_(li).e + 1, L_(li).e + 1.6)));
    if (r === 0 && i === 3) o.lid = Math.max(o.lid, .85 * ease(t, gr, gr + .45) * (1 - ease(t, L_(li).e + .6, L_(li).e + 1.2)));
    if (r === 1) { const env = ease(t, gr - .08, gr + .06) * (1 - ease(t, L_(li).e + .8, L_(li).e + 1.4)), pulse = Math.exp(-(Math.max(0, t - gr) % .6) / .16); o.lid = Math.max(o.lid, env * (.6 + .4 * pulse)); }
    if (r === 2) { const st = gr - .06 + (i % 7) * .03, env = ease(t, st, st + .25) * (1 - ease(t, 195.1, 195.35)); if (env > 0) { o.lid = Math.max(o.lid, env); o.teeth = ease(t, gr + .3 + (i % 5) * .08, gr + 1.4 + (i % 5) * .08) * env; o.chat = Math.abs(Math.sin(t * 16 + i * 1.3)); } } });
  // law: the chairman hops off his seat and slams an oversized gavel on the word; everyone jolts
  const law = wt(0, 'law');
  if (s.r === 'chair' && t > law - 1.6 && t < law + 2) { o.arms = 'gavel'; o.stand = ease(t, law - 1.4, law - .85) * (1 - ease(t, law + 1.1, law + 1.7)); }
  if (t > law && t < law + .5) o.bounce = Math.sin((t - law) / .5 * Math.PI) * (1 - (t - law) / .5) * (s.r === 'chair' ? 0 : 1);
  const bg = 195.02; if (t > bg && t < bg + .6) o.bounce = Math.max(o.bounce, Math.abs(Math.sin((t - bg) * 16)) * (1 - (t - bg) / .6) * 1.4); // the giant gavel lands (installs.js)
  if (s.r === 'drawer') o.drawer = Math.max(ease(t, L_(2).s, L_(2).s + .6) * (1 - ease(t, L_(2).e - .2, L_(2).e + .3)), ease(t, wt(19, 'put') - .1, wt(19, 'put') + .5) * (1 - ease(t, wt(20, 'talk') - .1, wt(20, 'talk') + .25)));
  // vogue: the pose arrives on the word, then a new pose on each beat; the second time they rise off their seats to strike it
  for (const [li, end, rise] of [[14, L_(14).e, 0], [19, wt(19, 'put') - .1, .7]]) { const s0 = L_(li).s, vw = wt(li, 'vogue'); if (t < s0 - .4 || t > end + .4) continue;
    o.arms = 'vogue'; o.lift = ease(t, s0 - .35, vw) * (1 - ease(t, end, end + .35)); const ph = Math.max(0, t - vw) / .6, n = Math.floor(ph), u = ease(ph - n, 0, .25);
    const cur = VOGUE_POSES[(n + i) % 4], prv = n ? VOGUE_POSES[(n - 1 + i) % 4] : cur; o.pose = prv.map((v, j) => lerp(v, cur[j], u));
    o.stand = Math.max(o.stand, rise * o.lift); }
  if (t > L_(17).s && t < L_(18).e) { o.arms = 'shrug'; o.lift = ease(t, L_(18).s, L_(18).s + .3); }
  // perverse: the whole board flips upside down on its seats, a domino down the row, and is back upright for rehearsed
  const pv = wt(29, 'perverse'), dd = (i % 7) * .035 + (i > 6 ? .02 : 0); o.flip = ease(t, pv - .2 + dd, pv + .2 + dd) * (1 - ease(t, 164.8 + dd, 165.3 + dd));
  if (t > L_(30).s && t < L_(30).e + .3) { const beat = (t - L_(30).s) * 1.6; o.nod = Math.abs(Math.sin(beat * Math.PI)) * 1.2; } // rehearsed: all nod as one
  // the outro: each "vote" lands on its word and goes further: one hand, both hands, standing on the chairs, the board up on the table
  const vw = VOTE_LINES.map((li) => wt(li, 'vote')), st = i * .02, upAt = (w) => ease(t, w - .5 + st, w);
  if (t > vw[0] - .6) {
    let lift = 0, arms = 'vote2';
    if (t < vw[1] - .6) { arms = 'vote1'; lift = upAt(vw[0]) * (1 - ease(t, L_(35).e + .4, L_(35).e + 1.1)); }
    else if (t < vw[2] - .9) lift = upAt(vw[1]) * (1 - ease(t, 236.8, 237.6));
    else if (t < vw[3] - 1.1) { lift = upAt(vw[2]) * (1 - ease(t, L_(37).e + .4, L_(37).e + 1.1)); }
    else lift = upAt(vw[3]);
    o.onChair = ease(t, vw[2] - .75 + st, vw[2] - .1 + st * .5); o.onTable = ease(t, vw[3] - 1.05 + st, vw[3] - .15 + st * .3);
    if (t > vw[3]) lift *= .85 + .15 * Math.sin((t - vw[3]) * 5.2 + i); // waving
    if (lift > 0) { o.arms = arms; o.lift = lift; o.ballot = 1; }
  }
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
function crutch(a, b, sc) { // a Dali crutch: a long pole with a padded fork at the top (sc scales the fork)
  sc = sc || 1; const pa = PL(...a), pb = PL(...b); if (pa[2] < .1 || pb[2] < .1) return; const k = kAt(pa);
  seg(pa, pb, .05 * k, PAL.crutch);
  const fl = PL(a[0] - .18 * sc, a[1] - .1 * sc, a[2]), fr = PL(a[0] + .18 * sc, a[1] - .1 * sc, a[2]), fm = PL(a[0], a[1] - .3 * sc, a[2]);
  seg(fm, fl, .035 * k, PAL.crutch); seg(fm, fr, .035 * k, PAL.crutch);
  const pl = PL(a[0] - .22 * sc, a[1], a[2]), pr = PL(a[0] + .22 * sc, a[1], a[2]); seg(pl, pr, .08 * k, '#e9dcc2');
  g.fillStyle = '#3a2a1a'; g.beginPath(); g.arc(pb[0], pb[1], .05 * kAt(pb), 0, TAU); g.fill();
}
function seatUnder(s) { // bracket + crutch, always behind the sitter
  const G = seatGeom(s), A = PL(...G.beamA), B = PL(...G.beamB), Cc = PL(...G.beamC); if (B[2] < .25) return; const k = kAt(B);
  seg(Cc, B, .09 * k, '#3d2412'); seg(A, B, .08 * k, '#4a2a14'); seg(A, Cc, .06 * k, '#3d2412');
  g.fillStyle = '#c9a24a'; for (const p of [A, B]) { if (p[2] < .1) continue; g.beginPath(); g.arc(p[0], p[1], .035 * kAt(p), 0, TAU); g.fill(); }
  crutch(G.crutch[0], G.crutch[1], .5);
}
function seatTop(s) { // the low seat pan and its short leather back
  const F = seatFrame(s), c = (a, b, y) => PL(...sp(s.x, s.z, F, a, b, y));
  poly([c(.2, -.25, SEAT - .07), c(.2, .25, SEAT - .07), c(-.2, .25, SEAT - .07), c(-.2, -.25, SEAT - .07)], '#3d2412');
  poly([c(.2, -.25, SEAT), c(.2, .25, SEAT), c(-.2, .25, SEAT), c(-.2, -.25, SEAT)], '#7a4e26');
  const bk = [c(-.2, -.23, SEAT + .02), c(-.2, .23, SEAT + .02), c(-.24, .2, SEAT + .27), c(-.24, -.2, SEAT + .27)]; poly(bk, '#7b2a1c', '#3a140c', 1.5);
  if (!ok(bk)) return; const k = kAt(bk[0]); g.fillStyle = '#d9b45a'; for (let j = 0; j < 4; j++) { const p = c(-.24, -.15 + j * .1, SEAT + .23); if (p[2] < .1) continue; g.beginPath(); g.arc(p[0], p[1], .02 * k, 0, TAU); g.fill(); }
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
  if (o.onTable > 0) { const u = o.onTable, tb = s.z ? [s.x * .92, s.z * .36] : [s.x * .78, 0], arc = Math.sin(u * Math.PI);
    P0 = lp(P0, mk(tb[0], tb[1], TOP + .93, .02, .14, TOP + .02), u); P0.hy += arc * .55; P0.f.forEach((p) => { p[1] += arc * .8; }); }
  return { ...P0, F };
}
function legPts(s, Pz) { const F = Pz.F, sw = 1.25 * (1 - clamp((Pz.hy - SEAT - .03) / .45)) + .15; return [-1, 1].map((d, j) => { const h = sp(Pz.bx, Pz.bz, F, -.02, d * .1, Pz.hy), f = Pz.f[j];
  const kn = kneeIK(h, f, [F.f[0] * .3 + F.r[0] * d * sw, 1, F.f[1] * .3 + F.r[1] * d * sw]); return [PL(...h), PL(...kn), PL(...f)]; }); }
// ---------- the gavel on "law" ----------
function gavelPose(t) { // swing angle of the handle in the chairman's x-y plane: rests down, straight up at the top (head level), slams on the word
  const law = wt(0, 'law'); let th = lerp(-1.1, Math.PI / 2, ease(t, law - 1.15, law - .3));
  th = lerp(th, -.24, ease(t, law - .13, law)); return lerp(th, -1.1, ease(t, law + .75, law + 1.4));
}
function gavelProp(t, sh) { // sh = car-local shoulder [x, y, z]; returns the screen hand and a draw callback
  const law = wt(0, 'law'), th = gavelPose(t), d = [Math.cos(th), Math.sin(th)], hx = Math.SQRT1_2, hz = -Math.SQRT1_2, at = (r, n) => { const hz0 = d[0] * r - d[1] * n; return PL(sh[0] + hx * hz0, sh[1] + d[1] * r + d[0] * n, sh[2] + hz * hz0); }; // the swing plane turns 45 deg toward the near side so the GAVEL framing sees it side-on
  const hand = at(.42, 0), soft = ease(t, law + .04, law + .9) * (1 - ease(t, law + 1.6, law + 2.4));
  return { hand, draw: () => {
    const R = 1.05, L = .5, rad = .11; // an oversized mallet: a barrel head .5 m long, .22 across, the handle into its middle
    const h0 = at(.36, 0), h1 = at(R - rad * .6, 0); seg(h0, h1, .055 * kAt(h1), '#4a2a14');
    const A = at(R, -L / 2), B = at(R, L / 2), c = at(R, 0); if (A[2] < .1 || B[2] < .1) return; const k = kAt(c);
    const ux = B[0] - A[0], uy = B[1] - A[1], ul = Math.hypot(ux, uy) || 1, px = -uy / ul, py = ux / ul, ang = Math.atan2(uy, ux);
    const w = rad * k, sq = 1 + soft * .55; // after the blow the striking end (A, the bottom) spreads like a soft rubber stamp
    const wg = g.createLinearGradient(c[0] - px * w, c[1] - py * w, c[0] + px * w, c[1] + py * w); wg.addColorStop(0, '#3e1f0c'); wg.addColorStop(.45, '#9a5a2c'); wg.addColorStop(1, '#4a2510');
    g.fillStyle = wg; g.beginPath(); g.moveTo(A[0] - px * w * sq, A[1] - py * w * sq); g.lineTo(B[0] - px * w, B[1] - py * w); g.lineTo(B[0] + px * w, B[1] + py * w); g.lineTo(A[0] + px * w * sq, A[1] + py * w * sq); g.closePath(); g.fill();
    for (const [P0, ww] of [[B, w], [A, w * sq]]) { g.fillStyle = '#2e1608'; g.beginPath(); g.ellipse(P0[0], P0[1], w * .28, ww, ang, 0, TAU); g.fill(); }
    g.strokeStyle = '#d9b45a'; g.lineWidth = Math.max(1.5, .03 * k); for (const f of [.16, .84]) { const q = [lerp(A[0], B[0], f), lerp(A[1], B[1], f)], ww = lerp(w * sq, w, f); g.beginPath(); g.moveTo(q[0] - px * ww, q[1] - py * ww); g.lineTo(q[0] + px * ww, q[1] + py * ww); g.stroke(); }
    if (soft > .05) { g.fillStyle = '#4a2510'; g.beginPath(); g.ellipse(A[0] + px * w * sq * .7, A[1] + py * w * sq * .7 + soft * .06 * k, w * .16, soft * .1 * k, 0, 0, TAU); g.fill(); } // a drip
  } };
}
function lawMarks(t) { // the stamp's red ink mark on the table and the shock ring of the blow
  const law = wt(0, 'law'); if (t < law || t > L_(0).e + 2.2) return; const hx = -4.25, hz = -.92, a = 1 - ease(t, L_(0).e + .8, L_(0).e + 2.2);
  const ring = (r, y) => { const ps = []; for (let i = 0; i < 30; i++) { const q = i / 30 * TAU; ps.push(PL(hx + Math.cos(q) * r, y, hz + Math.sin(q) * r * .9)); } return ps; };
  g.save(); g.globalAlpha = a * ease(t, law + .7, law + .95); poly(ring(.3, TOP + .004), null, '#b3201a', 3.5); poly(ring(.19, TOP + .004), 'rgba(179,32,26,.85)');
  const star = []; for (let i = 0; i < 10; i++) { const q = i / 10 * TAU, r = i % 2 ? .06 : .14; star.push(PL(hx + Math.cos(q) * r, TOP + .005, hz + Math.sin(q) * r * .9)); } poly(star, '#f1d9a8'); g.restore();
  const u = (t - law) / .55; if (u < 1) { g.save(); g.globalAlpha = (1 - u) * .8; poly(ring(.3 + u * 1.6, TOP + .006), null, '#fbf0d6', 4 * (1 - u) + 1); g.restore(); }
}
function tableShadow(t) {
  const pts = []; for (const [x, z] of [[-TL, -TD], [TL, -TD], [TL, TD], [-TL, TD]]) { pts.push(Lw(x, TOP, z)); pts.push(Lw(x * .97, .2, z * .9)); }
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
  const c = PL;
  // the car under the cloth: a dark chassis box, then the wheels
  wheels(t, false);
  const bx = TL * .9, bz = TD * .86, cf = [[[-bx, -bz], [bx, -bz]], [[bx, -bz], [bx, bz]], [[bx, bz], [-bx, bz]], [[-bx, bz], [-bx, -bz]]];
  cf.map((f) => [c((f[0][0] + f[1][0]) / 2, .4, (f[0][1] + f[1][1]) / 2)[2], f]).sort((a, b) => b[0] - a[0])
    .forEach(([, f]) => poly([c(f[0][0], .14, f[0][1]), c(f[1][0], .14, f[1][1]), c(f[1][0], .8, f[1][1]), c(f[0][0], .8, f[0][1])], '#1d130e'));
  wheels(t, true);
  // skirt: four hanging cloth panels down to a hem just above the hubcaps, drawn back to front
  const faces = [[[-TL * .97, -TD * .93], [TL * .97, -TD * .93]], [[TL * .97, -TD * .93], [TL * .97, TD * .93]], [[TL * .97, TD * .93], [-TL * .97, TD * .93]], [[-TL * .97, TD * .93], [-TL * .97, -TD * .93]]];
  const fd = faces.map((f) => [c((f[0][0] + f[1][0]) / 2, 1.2, (f[0][1] + f[1][1]) / 2)[2], f]).sort((a, b) => b[0] - a[0]);
  const N = 14, hem = (u) => .56 + .045 * Math.sin(u * 20 + t * 1.5);
  for (const [, f] of fd) {
    const at = (u, y) => c(lerp(f[0][0], f[1][0], u), y, lerp(f[0][1], f[1][1], u));
    const pts = []; for (let i = 0; i <= N; i++) pts.push(at(i / N, TOP - .2)); for (let i = N; i >= 0; i--) pts.push(at(i / N, hem(i / N)));
    poly(pts, PAL.skirt);
    for (let i = 1; i < N; i++) seg(at(i / N, TOP - .23), at(i / N, .62), 2, 'rgba(0,0,0,.18)');
    for (let i = 0; i < N; i++) { const a = at(i / N, hem(i / N)); seg(a, at((i + 1) / N, hem((i + 1) / N)), .05 * kAt(a), '#d6a632'); }
  }
  const tc = [[-TL, -TD], [TL, -TD], [TL, TD], [-TL, TD]];
  for (let i = 0; i < 4; i++) { const a = tc[i], b = tc[(i + 1) % 4]; poly([c(a[0], TOP, a[1]), c(b[0], TOP, b[1]), c(b[0], TOP - .22, b[1]), c(a[0], TOP - .22, a[1])], '#3d170c'); }
  const topP = tc.map(([x, z]) => c(x, TOP, z)); if (!ok(topP)) return;
  const lg = g.createLinearGradient(topP[0][0], topP[0][1], topP[2][0], topP[2][1]); lg.addColorStop(0, PAL.mahoganyLit); lg.addColorStop(1, PAL.mahogany);
  poly(topP, lg);
  for (let i = 1; i < 9; i++) { const z = -TD + i * TD * 2 / 9; seg(c(-TL, TOP, z), c(TL, TOP, z + .05 * Math.sin(i)), 1.2, 'rgba(30,8,4,.22)'); }
  chess(t);
  // the hole in the middle: the driver's seat
  const ring = (rx, rz) => { const r = []; for (let i = 0; i < 28; i++) { const a = i / 28 * TAU; r.push(c(Math.cos(a) * rx, TOP, Math.sin(a) * rz)); } return r; };
  poly(ring(.55, .45), '#120806'); poly(ring(.62, .52), null, '#c9a24a', 2.5);
}
function chess(t) { // knight to queen's rook: the table top turns into a chessboard
  const s = L_(26).s, e = L_(27).e; const a = ease(t, s - .3, s + .2) * (1 - ease(t, e + .3, e + .8)); if (a <= 0) return;
  g.save(); g.globalAlpha = a * .85;
  for (let i = 0; i < 8; i++) for (let j = 0; j < 4; j++) { if ((i + j) % 2) continue; const x0 = -TL + i, z0 = -TD + j * .75;
    poly([PL(x0, TOP + .001, z0), PL(x0 + 1, TOP + .001, z0), PL(x0 + 1, TOP + .001, z0 + .75), PL(x0, TOP + .001, z0 + .75)], '#efe3c6'); }
  g.restore();
}
// ---------- drawing the car (moved from render.js for draft 3) ----------
function drawCar(t) {
  const seats = SEATS.map((s, i) => { const o = seatState(s, t, i), Pz = bodyPose(s, o); return { s, i, o, Pz, d: PL(Pz.bx, SEAT, Pz.bz)[2], up: o.onTable > .45 }; }).sort((a, b) => b.d - a.d), mid = PL(0, SEAT, 0)[2];
  const sitter = ({ s, i, o, Pz }) => {
    const p = PL(Pz.bx, Pz.hy, Pz.bz); if (p[2] < .25) return; const k = kAt(p);
    const home = o.onChair < .02 && o.onTable < .02 && o.stand < .5 && o.flip < .02;
    if (!home) seatTop(s);
    o.leg = legPts(s, Pz); o.chair = home ? () => seatTop(s) : null;
    if (o.arms === 'gavel') { const F = Pz.F, sh = sp(Pz.bx, Pz.bz, F, 0, .2, Pz.hy + TORSO - .06), gp = gavelProp(t, sh); o.hand = gp.hand; o.prop = gp.draw; }
    if (o.flip > 0) { const pv = PL(Pz.bx, Pz.hy + .45, Pz.bz); g.save(); g.translate(pv[0], pv[1]); g.rotate(o.flip * Math.PI * (i % 2 ? 1 : -1)); g.translate(-pv[0], -pv[1]); suit(p[0], p[1], k, o); g.restore(); }
    else suit(p[0], p[1], k, o);
  };
  const seatDraw = (x) => { seatUnder(x.s); if (!x.up) sitter(x); else seatTop(x.s); };
  seats.filter((x) => x.d > mid).forEach(seatDraw);
  tableBody(t); driverHat(); lawMarks(t);
  tablePropsBack(t);
  seats.filter((x) => x.d <= mid).forEach(seatDraw);
  seats.filter((x) => x.up).forEach(sitter); // the board up on the table top
  tablePropsFront(t); pieBirds(t); if (typeof installsCar === 'function') installsCar(t); bobPopUp(t);
}
// emissive pass for the car layer at night (optional, needs a call in render.js after the car layer's grade): a warm rim
// of firelight on the suits and the raised ballots, so the voting board reads as solid figures against the burn
function carGlow(t) {
  const b = typeof burnAmt === 'function' ? burnAmt(t) : 0; if (b < .05) return;
  g.save(); g.globalCompositeOperation = 'source-atop';
  const { p } = manGeom(); const rg = g.createRadialGradient(p[0], p[1] - 200, 50, p[0], p[1] - 200, W * .9); rg.addColorStop(0, `rgba(255,150,70,${.32 * b})`); rg.addColorStop(1, `rgba(255,110,50,${.1 * b})`);
  g.fillStyle = rg; g.fillRect(0, 0, W, H); g.restore();
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
