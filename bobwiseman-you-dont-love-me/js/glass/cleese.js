// Draft 15 (Bob, 2026-10-20, on draft 14: "everything works for me except the tea leaf reader. if thats eric idle, it
// doesn't work for me. I also wish his hand was not a ball shape but had fingers. can you make him like john cleese with
// an english hat like in silly walks"): the tea-leaf reader is now a warm caricature of John Cleese in this film's
// stained glass (Robin, 2026-10-21: as like him as we can, an affectionate tribute, never mocked or hurt): the long face
// and long chin, heavy dark brows, deep-set eyes, a long straight nose, a thin deadpan mouth, short dark hair, a black
// bowler, a dark pinstripe city suit with a white shirt and a striped tie. In the finale he does the Ministry of Silly
// Walks walk across the front of the crowd, briefcase in hand (drawSillyWalk). Every hand drawn here has fingers
// (glassHand), and the other finale hands use it too.
// Shared by the bridge (bridge-show.js hostHead and drawHostHand call into it) and the finale (finale-chorus.js,
// crowd-a.js, main.js). Needs core.js and glass.js. Pure functions of their arguments.

const CL = {
  skin: [238, 204, 178], skin2: [214, 172, 146], hair: [66, 50, 42], brow: [44, 32, 28],
  hat: [34, 32, 38], hat2: [22, 20, 26], suit: [44, 46, 56], suit2: [34, 36, 46], stripe: 'rgba(214,214,226,.32)',
  shirt: [242, 242, 236], tie: [36, 48, 104], tieStripe: 'rgba(196,44,52,.95)',
  trous: [92, 94, 104], trousStripe: 'rgba(30,30,38,.55)', shoe: [24, 22, 26], case: [104, 62, 36], case2: [76, 44, 26],
};
const CL_HAT_TOP = 122; // the bowler's crown above the head centre, head units (the bridge's teabag lands on it)

// ---- a hand with fingers: palm, four fingers and a thumb, each its own leaded piece ----
// (x, y) the wrist, ang the direction the fingers point, s the size (1 = about 50 px long), side +1/-1 which edge the
// thumb is on (local -y for +1), pose 'open' | 'grip' (fingers curled round a handle) | 'point' (index out).
function glassCapsule(x0, y0, x1, y1, r) {
  const a = Math.atan2(y1 - y0, x1 - x0), p = new Path2D();
  p.arc(x1, y1, r, a - Math.PI / 2, a + Math.PI / 2); p.arc(x0, y0, r, a + Math.PI / 2, a + 3 * Math.PI / 2); p.closePath(); return p;
}
function glassHand(g, x, y, ang, s, col, seed, o = {}) {
  const side = o.side || 1, pose = o.pose || 'open', lw = o.lw || 3, sh = { ew: 5, shade: .2, lw };
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(s, s * side);
  const thumb = pose === 'grip' ? glassCapsule(8, -11, 25, -16, 4.4) : glassCapsule(8, -11, 19, -24, 4.4);
  pane(g, thumb, col, seed + 1, sh);
  pane(g, smoothPath([[0, -12], [22, -14], [28, -10], [28, 10], [22, 13], [0, 11]]), col, seed, { ew: 7, shade: .22, lw });
  const len = [17, 21, 20, 15];
  for (let k = 0; k < 4; k++) {
    const yk = -10.5 + 7 * k, out = pose === 'open' || (pose === 'point' && k === 0);
    const sp = (k - 1.5) * .09, L = out ? len[k] : 9;
    pane(g, glassCapsule(24, yk, 24 + Math.cos(sp) * L, yk + Math.sin(sp) * L, 3.6), col, seed + 2 + k, sh);
  }
  paint(g, 1.4, .35); for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(18, -7 + 7 * k); g.lineTo(23, -7 + 7 * k); g.stroke(); } // knuckle creases
  g.restore();
}

// ---- the head: centred on (0, 0), face about 100 x 162; the bowler's crown at y -122 ----
// o.m mouth 0..1, o.lid 0 (open) .. 1 (shut), o.look [x, y] pupils -1..1, o.brow 0..1 lifts the brows
function cleeseHead(g, o = {}) {
  const m = o.m || 0, lid = o.lid ?? .3, [lx, ly] = o.look || [0, 0], seed = o.seed || 50000, up = o.brow || 0;
  for (const sd of [-1, 1]) pane(g, ellPath(sd * 59, -2, 11, 19), CL.skin, seed + 2 + sd, { ew: 8, shade: .3, lw: 5 }); // ears
  for (const sd of [-1, 1]) pane(g, polyPath([[sd * 37, -64], [sd * 63, -58], [sd * 65, -18], [sd * 56, -6], [sd * 52, -38], [sd * 41, -54]]), CL.hair, seed + 5 + sd, { ew: 6, shade: .2, lw: 4 }); // dark hair at the temples, short back and sides
  // a long face with full, rounded cheeks and a broad round chin (Robin, 2026-10-21: "clease had a rounder face")
  // (photos, 2026-10-21: long, not that round (Robin), broad through the jaw to a big heavy chin)
  pane(g, smoothPath([[-50, -66], [-55, -32], [-56, 6], [-55, 40], [-50, 68], [-33, 88], [0, 96], [33, 88], [50, 68], [55, 40], [56, 6], [55, -32], [50, -66], [0, -72]]), CL.skin, seed, { ew: 24, shade: .24, lw: 7 });
  for (const sd of [-1, 1]) pane(g, polyPath([[sd * 32, -64], [sd * 52, -64], [sd * 56, -26], [sd * 50, -30], [sd * 43, -50]]), CL.hair, seed + 14 + sd, { ew: 5, shade: .2, lw: 4 }); // the temples, under the brim
  // (photos, 1989 deadpan: thick brows high at the nose with frown creases, dropping at the outer ends; small hooded eyes
  // drooping at the outer corners; a big nose with a broad round tip and wide nostrils; a long upper lip; a thin wide
  // mouth turned down at the corners, bracketed by deep lines from the nostrils; a broad heavy chin and jowls)
  g.strokeStyle = 'rgba(150,96,80,.42)'; g.lineWidth = 2.6; g.lineCap = 'round';
  for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(sd * 21, 30); g.bezierCurveTo(sd * 34, 40, sd * 36, 58, sd * 33, 76); g.stroke(); } // nostril to below the mouth
  for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(sd * 49, 46); g.quadraticCurveTo(sd * 48, 64, sd * 39, 74); g.stroke(); } // jowls
  g.beginPath(); g.moveTo(-14, 80); g.quadraticCurveTo(0, 85, 14, 80); g.stroke(); // the chin
  g.fillStyle = 'rgba(214,140,124,.12)'; for (const sd of [-1, 1]) { g.beginPath(); g.ellipse(sd * 38, 18, 14, 20, 0, 0, TAU); g.fill(); }
  // frown creases between the brows
  paint(g, 1.8, .45); for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(sd * 4, -44); g.lineTo(sd * 5, -30); g.stroke(); }
  for (const sd of [-1, 1]) {
    const ex = sd * 24, ey = -18, rot = sd * .2; // outer corner lower
    g.fillStyle = 'rgba(160,110,96,.3)'; g.beginPath(); g.ellipse(ex, ey - 3, 16, 11, rot, 0, TAU); g.fill(); // the socket
    g.save(); g.translate(ex, ey); g.rotate(rot);
    const eye = new Path2D(); eye.moveTo(-10, 0); eye.quadraticCurveTo(0, -7, 10, 0); eye.quadraticCurveTo(0, 6, -10, 0); eye.closePath();
    g.fillStyle = 'rgba(244,240,228,1)'; g.fill(eye);
    g.save(); g.clip(eye);
    g.fillStyle = 'rgba(70,48,34,1)'; g.beginPath(); g.arc(lx * 3.5, ly * 2 + .5, 4.2, 0, TAU); g.fill();
    g.fillStyle = 'rgba(14,10,8,1)'; g.beginPath(); g.arc(lx * 3.5, ly * 2 + .5, 1.9, 0, TAU); g.fill();
    g.fillStyle = rgb(mix(CL.skin, [196, 146, 126], .3)); g.fillRect(-11, -8, 22, 5 + 8 * lid); // the hooded lid
    g.restore();
    paint(g, 2.6, .9); g.beginPath(); g.moveTo(-11, 1); g.quadraticCurveTo(0, -5 + 8 * lid, 11, 2); g.stroke(); // lid edge
    paint(g, 1.6, .4); g.beginPath(); g.moveTo(-10, -9); g.quadraticCurveTo(0, -13, 11, -7); g.stroke(); // the fold above
    g.beginPath(); g.moveTo(-8, 7); g.quadraticCurveTo(0, 11, 9, 7); g.stroke(); // bags
    g.restore();
    // the brows: thick, low and nearly straight, the outer ends dipping a little
    const lift = 6 * up;
    g.strokeStyle = rgb(CL.brow, .95); g.lineWidth = 8; g.lineCap = 'round';
    g.beginPath(); g.moveTo(sd * 8, -38 - lift); g.quadraticCurveTo(sd * 22, -43 - lift, sd * 33, -40 - lift * .6); g.quadraticCurveTo(sd * 39, -38, sd * 43, -33); g.stroke();
  }
  // the nose: long, a broad round tip, wide nostrils
  g.fillStyle = 'rgba(176,120,100,.22)'; g.beginPath(); g.moveTo(-5, -30); g.quadraticCurveTo(-9, 4, -14, 22); g.lineTo(-4, 26); g.quadraticCurveTo(-2, 0, 0, -30); g.closePath(); g.fill();
  g.fillStyle = 'rgba(214,150,130,.14)'; g.beginPath(); g.ellipse(0, 28, 13, 10, 0, 0, TAU); g.fill(); // the round tip
  paint(g, 3, .75); g.beginPath(); g.moveTo(-6, -28); g.quadraticCurveTo(-9, 4, -13, 20); g.stroke();
  g.beginPath(); g.moveTo(-22, 28); g.quadraticCurveTo(-25, 40, -14, 40); g.quadraticCurveTo(-7, 37, -5, 39); g.quadraticCurveTo(0, 44, 5, 39); g.quadraticCurveTo(7, 37, 14, 40); g.quadraticCurveTo(25, 40, 22, 28); g.stroke();
  paint(g, 2, .45); g.beginPath(); g.moveTo(14, 12); g.quadraticCurveTo(20, 20, 18, 27); g.stroke();
  paint(g, 1.6, .25); for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(sd * 5, 47); g.lineTo(sd * 6, 57); g.stroke(); } // the long upper lip
  // the mouth: thin and wide, the corners down; opening round the top teeth to sing
  const my = 64, h = 2 + 22 * m;
  if (m < .08) { paint(g, 3.4, .88); g.beginPath(); g.moveTo(-26, my + 2.5); g.quadraticCurveTo(-14, my - .5, 0, my - .5); g.quadraticCurveTo(14, my - .5, 26, my + 2.5); g.stroke();
    paint(g, 1.6, .25); g.beginPath(); g.moveTo(-11, my + 8); g.quadraticCurveTo(0, my + 10, 11, my + 8); g.stroke(); }
  else {
    const p = ellPath(0, my + h / 2 - 1, 22 + 4 * m, h / 2 + 1.5);
    g.fillStyle = 'rgba(70,16,20,.96)'; g.fill(p);
    g.save(); g.clip(p); g.fillStyle = rgb([246, 242, 230]); g.fillRect(-26, my - 4, 52, 5 + 2 * m);
    g.fillStyle = rgb([214, 92, 104]); g.beginPath(); g.ellipse(0, my + h + 1, 10, 3 + 4 * m, 0, 0, TAU); g.fill(); g.restore();
    paint(g, 3, .85); g.stroke(p);
  }
  // the bowler: crown, band, the curled brim, a sheen
  pane(g, smoothPath([[-56, -60], [-58, -92], [-42, -116], [0, -CL_HAT_TOP], [42, -116], [58, -92], [56, -60]]), CL.hat, seed + 10, { ew: 18, shade: .3, lw: 7, amt: .25 });
  pane(g, polyPath([[-58, -73], [58, -73], [57, -61], [-57, -61]]), CL.hat2, seed + 11, { ew: 5, shade: .2, lw: 4, amt: .2 });
  pane(g, smoothPath([[-84, -55], [-75, -66], [-34, -63], [0, -62], [34, -63], [75, -66], [84, -55], [70, -50], [0, -53], [-70, -50]]), CL.hat, seed + 12, { ew: 8, shade: .28, lw: 6, amt: .25 });
  g.strokeStyle = 'rgba(255,255,255,.22)'; g.lineWidth = 6; g.lineCap = 'round';
  g.beginPath(); g.moveTo(-30, -102); g.quadraticCurveTo(-14, -118, 10, -117); g.stroke();
}

// ---- city suit pieces ----
function clPinstripes(g, path, x0, x1, y0, y1, gap = 15) {
  g.save(); g.clip(path); g.strokeStyle = CL.stripe; g.lineWidth = 1.6;
  for (let x = x0; x <= x1; x += gap) { g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y1); g.stroke(); }
  g.restore();
}
function clTie(g, x, y0, y1, w, seed) { // a narrow striped tie: knot at y0, point at y1
  pane(g, polyPath([[x - w * .55, y0], [x + w * .55, y0], [x + w * .4, y0 + 18], [x - w * .4, y0 + 18]]), CL.tie, seed, { ew: 4, shade: .2, lw: 4 });
  const blade = polyPath([[x - w * .4, y0 + 18], [x + w * .4, y0 + 18], [x + w * .62, y1 - 16], [x, y1], [x - w * .62, y1 - 16]]);
  pane(g, blade, CL.tie, seed + 1, { ew: 6, shade: .22, lw: 4 });
  g.save(); g.clip(blade); g.strokeStyle = CL.tieStripe; g.lineWidth = 3.5;
  for (let yy = y0 + 4; yy < y1 + 30; yy += 15) { g.beginPath(); g.moveTo(x - w, yy); g.lineTo(x + w, yy + 12); g.stroke(); }
  g.restore();
}
// a bust for the finale's heads: dark pinstripe jacket, white shirt and collar, striped tie, a white pocket square; the
// face on (0, 0) as the crowd contract (crowd-base.js) asks, shoulders down to y +420
function cleeseBust(g, m, seed, o = {}) {
  const coat = smoothPath([[-50, 64], [-176, 116], [-212, 420], [212, 420], [176, 116], [50, 64]]);
  pane(g, coat, CL.suit, seed, { ew: 34, shade: .34, lw: 8 });
  clPinstripes(g, coat, -210, 210, 60, 420);
  pane(g, polyPath([[-34, 64], [34, 64], [0, 200]]), CL.shirt, seed + 1, { ew: 8, shade: .12, lw: 5 });
  for (const sd of [-1, 1]) pane(g, polyPath([[sd * 2, 66], [sd * 34, 62], [sd * 30, 92]]), CL.shirt, seed + 2 + sd, { ew: 4, shade: .15, lw: 4 }); // collar points
  clTie(g, 0, 70, 196, 22, seed + 5);
  for (const sd of [-1, 1]) pane(g, polyPath([[sd * 34, 64], [sd * 74, 72], [sd * 58, 224], [0, 252], [0, 200]]), CL.suit2, seed + 8 + sd, { ew: 10, shade: .25, lw: 5 }); // lapels
  pane(g, polyPath([[96, 226], [130, 222], [126, 246], [100, 248]]), CL.shirt, seed + 11, { ew: 4, shade: .15, lw: 4 }); // pocket square
  pane(g, polyPath([[-15, 44], [-15, 70], [15, 70], [15, 44]]), CL.skin, seed + 12, { ew: 8, shade: .3, lw: 4 }); // neck
  g.save(); g.scale(.98, .98); cleeseHead(g, { m, seed: seed + 20, lid: .28, look: [0, -.1], brow: Math.min(1, m * 2), ...o }); g.restore();
}

// ---- the silly walk across the front of the finale crowd ----
// Draft 16 (Bob, note 49: "each step he takes is the same. can you vary what he does?"): seven different steps, one
// every two beats from PF_B[32], the biggest on the bar downbeats (32, 36, 40, 44; 44 is the song's hardest hit):
// 32 the high kick | 34 a deep knee-bend shuffle | 36 the left leg swings up front, back, front | 38 a pause, one knee
// up, frozen | 40 a lurch into a lunge | 42 heel flicks behind, right then left | 44 the highest kick, a tucked hop,
// and a last kick out of frame. Briefcase low in the front hand, deadpan to camera throughout.
const SW = { // t0 .. t1 = PF_B[32] .. PF_B[46] (217.36 .. 227.02), read when drawn: PF_B is the finale's
  x0: -260, x1: W + 260, ground: H - 16,
  th: 215, sh: 215, torso: 250, neck: 24, up: 165, lo: 150, head: 1.2,
};
// keys by beat from PF_B[32] (0..14): [beat, R thigh, R knee, L thigh, L knee, lean, R (front, briefcase) arm, R elbow,
// L (back) arm, across (0..1 of x0..x1), air (px off the ground)]
// thigh: angle from straight down, + forward (to screen right); knee: bend, the shin swings back by it
const SW_KEYS = [
  [0, 2.1, 0, -.2, 0, -.12, .12, .05, -.5, 0, 0], // 32: the high kick, leaning back
  [.6, 1, 0, -.28, .1, -.06, .08, .05, -.3, .04, 0],
  [1, .2, .05, -.3, .3, 0, .02, .05, 0, .07, 0],
  [2, .6, 1.3, .9, 1.4, .1, .1, .3, 0, .11, 0], // 34: down into a deep knee-bend
  [2.5, .95, 1.55, .45, 1.2, .08, .15, .35, .2, .13, 0], // shuffling along low
  [3, .45, 1.2, .95, 1.5, .1, .1, .3, -.1, .15, 0],
  [3.5, .1, .3, .2, .5, 0, .05, .1, 0, .17, 0],
  [4, -.1, .05, 1.9, .1, -.15, .1, .05, -.6, .2, 0], // 36: the left leg swings up in front
  [4.6, -.05, .05, -.9, .2, .18, -.1, .05, .4, .23, 0], // ... right back behind
  [5.2, -.1, .05, 1.2, .3, -.05, .05, .05, -.3, .26, 0], // ... and forward again
  [5.7, -.3, .1, .3, .05, 0, 0, .05, 0, .29, 0],
  [6, 1.5, 2, -.05, 0, -.04, .05, .05, -.1, .31, 0], // 38: the pause, right knee up, frozen
  [7.4, 1.55, 2.1, -.05, 0, -.04, .05, .05, -.1, .31, 0],
  [7.8, .6, .9, -.1, .05, .05, .05, .05, 0, .33, 0], // the foot comes down, carefully
  [8, 1.1, 1.1, -.7, 0, .4, .5, .3, -.6, .43, 0], // 40: the lurch, into a lunge
  [8.8, 1, 1.15, -.65, 0, .38, .45, .3, -.55, .45, 0],
  [9.5, .1, .1, -.2, .2, 0, .05, .05, 0, .48, 0],
  [10, -.3, 2.3, .1, .05, .22, .1, .05, -.3, .52, 0], // 42: a heel flick behind, right
  [10.5, .05, .1, 0, .1, .05, .05, .05, 0, .54, 0],
  [11, .1, .05, -.35, 2.3, .22, .1, .05, -.3, .57, 0], // ... and left
  [11.5, 0, .1, .1, .1, 0, .05, .05, 0, .59, 0],
  [12, 2.5, 0, -.15, 0, -.25, .3, .05, -.9, .63, 0], // 44: the highest kick
  [12.7, 1, 1.6, .2, 1.8, 0, .1, .2, .3, .72, 70], // a tucked hop on the loudest beat
  [13.2, .3, .4, -.2, .3, .05, .05, .05, 0, .8, 0],
  [13.6, 1.9, 0, -.2, 0, -.12, .12, .05, -.5, .88, 0], // and one more kick, out of frame
  [14, .6, 0, -.25, .1, -.05, .05, .05, -.2, 1, 0],
];
function swBeat(t) { // song time -> beats from PF_B[32], linear between the beats
  const B = PF_B; if (t <= B[32]) return (t - B[32]) / (B[33] - B[32]);
  for (let i = 32; i < 46; i++) if (t < B[i + 1]) return i - 32 + (t - B[i]) / (B[i + 1] - B[i]);
  return 14 + (t - B[46]) / (B[47] - B[46]);
}
function swPose(u) {
  const K = SW_KEYS; if (u <= K[0][0]) return K[0].slice(); if (u >= K[K.length - 1][0]) return K[K.length - 1].slice();
  let i = 0; while (K[i + 1][0] <= u) i++;
  const a = K[i], b = K[i + 1], f = (u - a[0]) / (b[0] - a[0]), e = .5 - .5 * Math.cos(Math.PI * clamp(f));
  return a.map((v, k) => lerp(v, b[k], e));
}
function swLimb(g, A, B, w0, w1, col, seed, stripes) {
  const dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  const p = polyPath([[A[0] + nx * w0, A[1] + ny * w0], [B[0] + nx * w1, B[1] + ny * w1], [B[0] - nx * w1, B[1] - ny * w1], [A[0] - nx * w0, A[1] - ny * w0]]);
  pane(g, p, col, seed, { ew: 14, shade: .3, lw: 6 });
  if (stripes) { g.save(); g.clip(p); g.strokeStyle = stripes; g.lineWidth = 2.4; for (const q of [-.45, 0, .45]) { g.beginPath(); g.moveTo(A[0] + nx * w0 * q, A[1] + ny * w0 * q); g.lineTo(B[0] + nx * w1 * q, B[1] + ny * w1 * q); g.stroke(); } g.restore(); }
  pane(g, circPath(B[0], B[1], w1 * .98), col, seed + 1, { ew: 8, shade: .26, lw: 5 }); // the joint
}
function swLeg(g, hip, a, k, seed) {
  const knee = [hip[0] + Math.sin(a) * SW.th, hip[1] + Math.cos(a) * SW.th], b = a - k;
  const foot = [knee[0] + Math.sin(b) * SW.sh, knee[1] + Math.cos(b) * SW.sh];
  swLimb(g, hip, knee, 30, 25, CL.trous, seed, CL.trousStripe);
  swLimb(g, knee, foot, 25, 20, CL.trous, seed + 2, CL.trousStripe);
  // the shoe, toe forward along the foot's line (square to the shin)
  g.save(); g.translate(foot[0], foot[1]); g.rotate(-b);
  pane(g, smoothPath([[-18, -8], [44, -10], [58, 2], [52, 14], [-20, 14]]), CL.shoe, seed + 4, { ew: 8, shade: .2, lw: 5, amt: .2 });
  g.fillStyle = 'rgba(255,255,255,.3)'; g.beginPath(); g.ellipse(36, -3, 10, 3, 0, 0, TAU); g.fill();
  g.restore();
  return foot;
}
function swFootDy(a, k) { return Math.cos(a) * SW.th + Math.cos(a - k) * SW.sh; }
function drawSillyWalk(g, t, tod) {
  if (typeof PF_B === 'undefined') return;
  SW.t0 = PF_B[32]; SW.t1 = PF_B[46];
  if (t < SW.t0 - .1 || t > SW.t1 + .1) return;
  const L = .35 + .65 * tod.I, br = L * (tod.col[0] + tod.col[1] + tod.col[2]) / 765;
  const P = swPose(swBeat(t)), [, ra, rk, la, lk, lean, rA, rE, lA, xf, air] = P;
  const x = lerp(SW.x0, SW.x1, xf);
  const hipY = SW.ground - Math.max(swFootDy(ra, rk), swFootDy(la, lk)) - 14 - air;
  const hip = [x, hipY];
  const sx = x + Math.sin(lean) * SW.torso, sy = hipY - Math.cos(lean) * SW.torso; // shoulders
  const shR = [sx + 10, sy + 18], shL = [sx - 10, sy + 18];
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  // a soft warm light behind him, so the dark suit reads against the crowd
  const hx = x + Math.sin(lean) * 200, hy = hipY - 180, hl = g.createRadialGradient(hx, hy, 40, hx, hy, 460);
  hl.addColorStop(0, `rgba(255,236,196,${.34 * L})`); hl.addColorStop(1, 'rgba(255,236,196,0)');
  g.globalCompositeOperation = 'screen'; g.fillStyle = hl; g.fillRect(hx - 470, hy - 470, 940, 940); g.globalCompositeOperation = 'source-over';
  if (br < .985) g.filter = `brightness(${br.toFixed(3)})`;
  // the back arm, swinging stiff, fingers out
  const lEl = [shL[0] + Math.sin(lA + lean) * SW.up, shL[1] + Math.cos(lA + lean) * SW.up], lWr = [lEl[0] + Math.sin(lA + lean) * SW.lo, lEl[1] + Math.cos(lA + lean) * SW.lo];
  swLimb(g, shL, lEl, 26, 22, CL.suit, 51010); swLimb(g, lEl, lWr, 22, 18, CL.suit, 51012);
  pane(g, circPath(lWr[0], lWr[1], 14), CL.shirt, 51014, { ew: 4, shade: .15, lw: 4 }); // cuff
  glassHand(g, lWr[0], lWr[1], Math.atan2(Math.cos(lA + lean), Math.sin(lA + lean)), 1.05, CL.skin, 51016, { pose: 'open', side: -1 });
  // legs: the left (knee-up) leg behind, the right (kicking) leg in front
  swLeg(g, [x - 8, hipY], la, lk, 51030);
  swLeg(g, [x + 8, hipY], ra, rk, 51040);
  // the jacket: buttoned, its skirt over the hips, pinstripes, shirt, tie, lapels
  g.save(); g.translate(hip[0], hip[1]); g.rotate(lean);
  const jk = smoothPath([[-46, -SW.torso + 6], [-56, -SW.torso + 40], [-50, -40], [-58, 54], [0, 64], [58, 54], [50, -40], [56, -SW.torso + 40], [46, -SW.torso + 6], [0, -SW.torso - 6]]);
  pane(g, jk, CL.suit, 51050, { ew: 26, shade: .32, lw: 7 });
  clPinstripes(g, jk, -60, 60, -SW.torso - 10, 70, 13);
  pane(g, polyPath([[-20, -SW.torso - 2], [20, -SW.torso - 2], [0, -SW.torso + 92]]), CL.shirt, 51051, { ew: 6, shade: .12, lw: 4 });
  clTie(g, 0, -SW.torso + 2, -SW.torso + 96, 16, 51052);
  for (const sd of [-1, 1]) pane(g, polyPath([[sd * 20, -SW.torso - 2], [sd * 44, -SW.torso + 8], [sd * 30, -SW.torso + 120], [0, -SW.torso + 132], [0, -SW.torso + 92]]), CL.suit2, 51055 + sd, { ew: 8, shade: .25, lw: 5 });
  for (const yy of [-110, -64]) pane(g, circPath(4, yy, 6), [20, 18, 24], 51058 + yy, { ew: 3, shade: .2, lw: 3 });
  // neck and head, deadpan to camera
  pane(g, polyPath([[-12, -SW.torso - 26], [-12, -SW.torso + 4], [12, -SW.torso + 4], [12, -SW.torso - 26]]), CL.skin, 51060, { ew: 6, shade: .3, lw: 4 });
  g.translate(0, -SW.torso - SW.neck - 86 * SW.head); g.rotate(-lean * .6); g.scale(SW.head, SW.head);
  cleeseHead(g, { m: 0, lid: .3, look: [-.15, 0], seed: 51100 });
  g.restore();
  // the front arm, hanging nearly straight, the briefcase low in front of his thigh
  const rEl = [shR[0] + Math.sin(rA + lean) * SW.up, shR[1] + Math.cos(rA + lean) * SW.up];
  const fa = rA + lean - rE, rWr = [rEl[0] + Math.sin(fa) * SW.lo, rEl[1] + Math.cos(fa) * SW.lo];
  const cx = rWr[0] + 6, cy = rWr[1] + 20;
  swLimb(g, shR, rEl, 26, 22, CL.suit, 51070); swLimb(g, rEl, rWr, 22, 18, CL.suit, 51072);
  pane(g, smoothPath([[cx - 60, cy + 6], [cx + 60, cy + 6], [cx + 62, cy + 84], [cx - 62, cy + 84]]), CL.case, 51001, { ew: 14, shade: .3, lw: 6 });
  pane(g, polyPath([[cx - 60, cy + 6], [cx + 60, cy + 6], [cx + 60, cy + 30], [cx - 60, cy + 30]]), CL.case2, 51002, { ew: 6, shade: .25, lw: 5 }); // the flap
  for (const d of [-30, 30]) pane(g, polyPath([[cx + d - 6, cy + 24], [cx + d + 6, cy + 24], [cx + d + 6, cy + 38], [cx + d - 6, cy + 38]]), C.gold, 51003 + d, { ew: 3, shade: .2, lw: 3 }); // clasps
  g.strokeStyle = rgb(CL.case2); g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.moveTo(cx - 18, cy + 6); g.quadraticCurveTo(cx, cy - 16, cx + 18, cy + 6); g.stroke(); // the handle
  pane(g, circPath(rWr[0], rWr[1], 14), CL.shirt, 51074, { ew: 4, shade: .15, lw: 4 });
  glassHand(g, rWr[0], rWr[1] + 4, Math.PI / 2, 1.05, CL.skin, 51076, { pose: 'grip', side: 1 });
  g.restore();
}
