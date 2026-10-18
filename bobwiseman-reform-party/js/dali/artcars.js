// Reform Party, Dali look: art cars and riders from Robin's own Burning Man photos (source/refs/artcars).
// scene hook: pushes {z, draw, shadow} into list.
// Homages, no names or text on screen: the copper horned dragon with the dance deck, the red velvet organ cart under its
// purple swan-neck canopy, the plywood horse on casters with its yellow flag, the weathered pirate galleon, and Robin
// himself on his chrome chopper bike. Everything is drawn in metres in a local frame (playa.js bmBegin, y up, front = +x)
// at its projected ground point, depth sorted with the rest of the playa, with long hard shadows by day. At night the
// dragon glows from inside and the galleon hangs lights in its rigging; that light is drawn after the grade (artcarsGlow),
// masked by whatever nearer was drawn over the car, like the octopus in playa.js.

// ---------- where and when: every appearance in one table ----------
// kind: dragon | galleon | organ | horse | chopper
// path: [[t, X, Z], ...] in world metres (rel 'world') or as offsets from the board car (rel 'car': X + carX(t), Z + carZ(t)).
//   Straight lines between keys; the heading follows the path (averaged over a second, so corners turn), and a car that
//   has stopped keeps the heading of its last leg. ease: [first leg eases in, last leg eases out].
// t0, t1: drawn only inside this window. fade: [in0, in1, out0, out1] alpha ramps (optional).
// lights: the night glow (dragon, galleon). Re-place for draft 9 by editing only this table.
// The camera in draft 8 looks +z almost all film, from the board's road (z = 0) toward the Man (300, 45) and the city.
// Burning Man: art cars drive the open playa at 5 mph (2.2 m/s) and park in the outer art-car ring behind the burn crowd
// (burn.js parks its own ring at 68-80 m; the two big ones here take the back row, about 92-95 m out, like the big sound cars).
const ARTCARS = [
  // draft 16, Robin's new photos (robin-2026-10-18): two more cars, one of a kind each.
  // The car-boat (1.png) runs west along z 35.5, 10 m inside the 9:00 promenade, at 7.4 km/h: out of frame when it sets off
  // (the drone looks east at the painter), across the background of verse 2 (about 83-95 and 100-106, 100-135 px tall),
  // and gone off the left of frame before it stops being drawn (130).
  // The heart sound bus (13-16): rolls west across the far playa behind the Man through the golden-hour wides (from 141,
  // after setting off out of frame at 128), at 5 km/h, then parks 160 m out at 5:00, side on, for the dusk and the burn:
  // its heart's string lights on, dancers in silhouette, right of the Man in the burn framings (80 px tall).
  { id: 'heart', kind: 'heart', lights: true, t0: 128, t1: 269, ease: [false, true], path: [[128, 450, 200], [200, 345, 200]] },
  { id: 'boat', kind: 'boat', t0: 64, t1: 130, path: [[64, 166, 35.5], [122, 46, 35.5], [130, 30, 35.5]] },
  // The Victorian house (3.jpg, 7.jpg) trundles west along z 112 at 7.8 km/h, behind the elephants and in front of the
  // clock tower, through the background of 86-148 (about 100 px tall), then swings north-west out toward the deep playa
  // and is still driving when the drone climbs into the dusk aerial (205, where it is a few px), so it never stops on screen.
  { id: 'house', kind: 'house', lights: true, t0: 78, t1: 206, path: [[78, 235, 112], [175, 25, 112], [206, -20, 150]] },
  // dawn, the intro glide (0-11.8): the dragon coming home from deep playa toward the city, rolling slowly along z 46 while the
  // drone flies past it 46 m to its right; it grows from the horizon into the left half of the frame and slides out left
  // (draft 11: there from the first frame and drawn until it has left the frame, so it never blinks in or out)
  { id: 'dragon-dawn', kind: 'dragon', t0: 0, t1: 11.8, path: [[0, -120, 72], [17, -157, 72]] }, // draft 20 (Robin): off the 9:00 promenade, no cars on the path
  // instrumental 1, the painter's window (61-64.4, no lyric; camera.js WINS out to the suit painting the sky beige at (78, -28)):
  // Robin on his chopper rides across the empty foreground, left to right, side on, about 10 m from the drone (230 px tall),
  // under the canvas and gone before the sax rider rides in on 65.0
  // Draft 11 (Robin: "when you see me i don't bike off screen.. i'm just there a moment and then blink i disappear"): no fade.
  // One straight lane square to the painter shot's view (the 62.4 key looks along (.78, -.62)), 12.5 m in front of the drone
  // (nearer than that the 5 m high drone has the playa below the frame), at a steady 6.5 m/s, a fast cruise: past the left
  // edge as the shot settles, across the frame in front of the canvas and out past the right edge by 64.8, his shadow with
  // him, clear before the sax rider rides in on 65.0. The ride is drawn from 60.0 to 65.4, so both ends happen off frame.
  { id: 'robin', kind: 'chopper', t0: 60.0, t1: 65.4, path: [[60.0, 83.58, -7.23], [65.4, 61.78, -34.49]] },
  // bridge, "they're ok with foul play" (151-160): the organ cart rolls left to right on the left of the long wide, clear of the
  // giant chess pieces, its player at the keys. Draft 11 (no fades): it comes into the frame as the drone tilts down off the
  // chess board (151.5), rolls on at 5 mph, swings away from the board toward the deep playa (157-160) and keeps going out
  // there, smaller and smaller, until a moment the frame has left it (182, before it is needed in the refrain-3 whirl,
  // installs.js, from 185.2: one organ cart, never two on screen)
  { id: 'organ', kind: 'organ', t0: 150.8, t1: 182, path: [[150.8, 184.5, 26], [156.6, 196, 26], [157.6, 197.6, 26.6], [158.6, 198.4, 28], [159.8, 198, 30], [207, 140, 108]] },
  // the galleon, one ship all evening (draft 11 joins draft 10's two appearances): it sails left to right on the far
  // playa in the empty right half of the bridge's long-lens wides (152-162, above and right of the paid cops), comes
  // about short of the big rig arch (wide of the people at its foot), sails north round its west side and parks side on in
  // the back row of the art-car ring, 95 m out at 7:00 (175.9); lit at night and parked there to the black
  { id: 'galleon', kind: 'galleon', lights: true, t0: 151.5, t1: 269, ease: [false, true],
    path: [[151.5, 232, 96], [158.6, 247, 96], [159.6, 248.5, 97], [160.6, 248.8, 99], [161.8, 247.8, 101.5], [163.5, 245.8, 104.5], [165.7, 244.6, 109],
      [168.1, 244.5, 114], [170.5, 245, 119], [172.9, 247.5, 123.3], [175.9, 252.5, 127.3]] },
  // bridge, "but what's especially perverse" (159-164): the horse bike pedals the other way behind the board, right to left,
  // in its own dust, above the paid cops on the right. Draft 11: in its own world lane at z 37, 9 m behind the lavender head and clear of the people round it
  // (it rode through the head in draft 10), in from beyond the right edge (158) and pedalling on west across the playa
  // until the frame has left it (182), like the organ cart, before the refrain-3 whirl needs it
  { id: 'horse', kind: 'horse', t0: 158.0, t1: 182, path: [[158.0, 246, 37], [207, 148, 37]] },
  // dusk: the dragon rolls in from the far playa (in from beyond the right edge while the drone looks left at 148.5) and parks
  // side on in the back row of the art-car ring, 92 m out at 7:30 (200.5); lit at night and parked there to the black
  { id: 'dragon-park', kind: 'dragon', lights: true, t0: 148.5, t1: 269, ease: [false, true],
    path: [[148.5, 200, 190], [178, 212, 130], [186.5, 218, 113], [191.5, 224, 104], [194.5, 229, 102.8], [200.5, 235, 110.5]] },
];
// half length, height (m), for culling and the glow box
const AC_SIZE = { dragon: [13.2, 10.8], galleon: [13.5, 17.8], organ: [2.0, 3.1], horse: [1.9, 4.9], chopper: [1.4, 2.0], boat: [3.7, 4.1], house: [4.9, 10.7], heart: [10.2, 16.8] };
// body radius for the actor check (half the length): the dragon about 25 m, the galleon 22 m with its bowsprit, Robin and his
// chopper as one body
const AC_R = { dragon: 12.5, galleon: 11, organ: 1.8, horse: 1.7, chopper: 1.2, boat: 3.4, house: 4.6, heart: 8.6 };

// ---------- path maths (pure functions of t) ----------
function acKey(e, t) { // [X, Z] on the path at t, before the car offset
  const K = e.path; if (t <= K[0][0]) return [K[0][1], K[0][2]]; const n = K.length; if (t >= K[n - 1][0]) return [K[n - 1][1], K[n - 1][2]];
  let i = 1; while (K[i][0] < t) i++; let u = (t - K[i - 1][0]) / (K[i][0] - K[i - 1][0]);
  const ez = e.ease || [false, false]; if (i === 1 && ez[0]) u = u * u; if (i === n - 1 && ez[1]) u = 1 - (1 - u) * (1 - u);
  return [lerp(K[i - 1][1], K[i][1], u), lerp(K[i - 1][2], K[i][2], u)];
}
function acPos(e, t) { const q = acKey(e, t); if (e.rel === 'car') { q[0] += carX(t); q[1] += carZ(t); } return q; }
function acState(e, t) {
  if (t < e.t0 || t > e.t1) return null;
  const f = e.fade, a = f ? ease(t, f[0], f[1]) * (1 - ease(t, f[2], f[3])) : 1; if (a <= .01) return null;
  const [X, Z] = acPos(e, t), A = acPos(e, t - .9), B = acPos(e, t + .9); let hx = B[0] - A[0], hz = B[1] - A[1], L = Math.hypot(hx, hz);
  if (L < .05) { const K = e.path, n = K.length; hx = K[n - 1][1] - K[n - 2][1]; hz = K[n - 1][2] - K[n - 2][2]; L = Math.hypot(hx, hz) || 1; } // parked: the last leg's heading
  hx /= L; hz /= L;
  let sp = 0; { const N = 20, t0 = Math.max(e.t0, e.path[0][0]); let prev = acPos(e, t0); for (let i = 1; i <= N; i++) { const q = acPos(e, lerp(t0, t, i / N)); sp += Math.hypot(q[0] - prev[0], q[1] - prev[1]); prev = q; } } // metres rolled, for the wheels
  const v = Math.hypot(acPos(e, t + .1)[0] - acPos(e, t - .1)[0], acPos(e, t + .1)[1] - acPos(e, t - .1)[1]) / .2;
  return { X, Z, hx, hz, sp, v, a, night: e.lights && typeof nightAmt === 'function' ? nightAmt(t) : 0 };
}
const acBeat = (t) => (t - 58.18) / .59978; // the song's beat grid (about 100 bpm), for the dancers

// ---------- small drawing helpers (local metres, y up, inside bmBegin) ----------
function acSmooth(pts) { // a soft closed outline: quadratic curves through the midpoints
  const n = pts.length, m = (a, b) => [(a[0] + b[0]) / 2, -(a[1] + b[1]) / 2];
  g.beginPath(); const s = m(pts[n - 1], pts[0]); g.moveTo(s[0], s[1]);
  for (let i = 0; i < n; i++) { const p = pts[i], q = m(p, pts[(i + 1) % n]); g.quadraticCurveTo(p[0], -p[1], q[0], q[1]); }
  g.closePath();
}
function acTube(cl, ws) { // a tapered tube round a centre line: polygon points
  const L = [], R = [];
  for (let i = 0; i < cl.length; i++) { const a = cl[Math.max(0, i - 1)], b = cl[Math.min(cl.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], n = Math.hypot(dx, dy) || 1, nx = -dy / n, ny = dx / n, w = ws[i] / 2;
    L.push([cl[i][0] + nx * w, cl[i][1] + ny * w]); R.push([cl[i][0] - nx * w, cl[i][1] - ny * w]); }
  return L.concat(R.reverse());
}
function acCubic(P0, P1, P2, P3, n) { const out = []; for (let i = 0; i <= n; i++) { const u = i / n, a = 1 - u; out.push([a * a * a * P0[0] + 3 * a * a * u * P1[0] + 3 * a * u * u * P2[0] + u * u * u * P3[0], a * a * a * P0[1] + 3 * a * a * u * P1[1] + 3 * a * u * u * P2[1] + u * u * u * P3[1]]); } return out; }
function acHorn(P0, P1, P2, P3, w0, fill) { const cl = acCubic(P0, P1, P2, P3, 10); bmFill(acTube(cl, cl.map((_, i) => w0 * (1 - i / 10.6))), fill); }
// a burner standing on a deck: feet at (x, y), h tall; c = {body, legs, skin, hat, arms}
function acPerson(x, y, h, c, t, ph, det) {
  const s = h / 1.75, bob = c.dance ? .045 * Math.max(0, Math.sin((acBeat(t) + ph) * Math.PI)) : 0, Y = y + bob, sw = c.dance ? Math.sin((acBeat(t) + ph) * Math.PI) * .12 : 0;
  const hip = [x, Y + .86 * s], sh = [x + sw * .3, Y + 1.42 * s], hd = [x + sw * .4, Y + 1.6 * s];
  bmLine([[x - .1 * s, y], hip, [x + .11 * s, y]], .11 * s, c.legs);
  bmFill([[hip[0] - .17 * s, hip[1] - .02], [hip[0] + .17 * s, hip[1] - .02], [sh[0] + .2 * s, sh[1]], [sh[0] - .2 * s, sh[1]]], c.body);
  const up = c.arms === 'up' ? 1 : c.arms === 'one' ? .5 : 0, wave = c.dance ? Math.sin((acBeat(t) + ph) * TAU) * .15 : 0;
  for (const sd of [-1, 1]) { const raise = up >= 1 || (up > 0 && sd > 0); const e = raise ? [sh[0] + sd * .26 * s, sh[1] + .32 * s] : [sh[0] + sd * .22 * s, sh[1] - .3 * s], hnd = raise ? [sh[0] + sd * (.18 + wave) * s, sh[1] + .66 * s] : [sh[0] + sd * .18 * s, sh[1] - .58 * s];
    bmLine([[sh[0] + sd * .17 * s, sh[1] - .03], e, hnd], .085 * s, c.body); if (det) bmDot(hnd[0], hnd[1], .05 * s, c.skin); }
  bmLine([[sh[0], sh[1]], [hd[0], hd[1] - .08 * s]], .07 * s, c.skin); bmOval(hd[0], hd[1], .11 * s, .125 * s, c.skin);
  if (c.hat === 'top') { bmFill([[hd[0] - .09 * s, hd[1] + .07 * s], [hd[0] + .09 * s, hd[1] + .07 * s], [hd[0] + .1 * s, hd[1] + .32 * s], [hd[0] - .08 * s, hd[1] + .32 * s]], '#1c1a1e'); bmOval(hd[0], hd[1] + .07 * s, .17 * s, .03 * s, '#1c1a1e'); }
  else if (c.hat === 'cowboy') { bmOval(hd[0], hd[1] + .09 * s, .24 * s, .045 * s, c.hatc || '#6a4a30'); bmFill([[hd[0] - .1 * s, hd[1] + .09 * s], [hd[0] + .1 * s, hd[1] + .09 * s], [hd[0] + .08 * s, hd[1] + .22 * s], [hd[0] - .08 * s, hd[1] + .22 * s]], c.hatc || '#6a4a30'); }
  else if (c.hat === 'hair') bmOval(hd[0] - .03 * s, hd[1] + .02 * s, .13 * s, .15 * s, c.hatc || '#3a2418');
  if (det && c.goggles) bmLine([[hd[0] - .1 * s, hd[1] + .02 * s], [hd[0] + .11 * s, hd[1] + .02 * s]], .045 * s, '#2a2420');
}

// ---------- 1. the copper dragon (about 25 m, front = +x) ----------
// From dragon-1/2/3: a long open-jawed copper head with rows of teeth, a curled spiral by the eye, a spiky brow and a big
// spiked cheek fin, two long ivory horns sweeping up and back; a long fabric hull in stretched panels that glows from inside
// (even by day, at the chest), a tail that dips and rises to a clawed tip; a railed deck crowded with dancers, the DJ's red
// booth at the back.
const DR_HULL = [[6.9, .5], [7.9, .9], [8.6, 1.9], [8.75, 3.0], [8.4, 4.1], [7.6, 5.1], [6.6, 5.6], [5.6, 5.5], [4.9, 4.7], [4.0, 4.3], [-5.8, 4.25], [-7.2, 3.95], [-8.3, 3.4], [-8.6, 2.3], [-8.0, 1.1], [-7.0, .55]];
const DR_TAIL = [[-7.6, 2.5], [-9.3, 2.5], [-10.7, 3.2], [-11.6, 4.5], [-11.95, 5.7], [-11.6, 6.6]], DR_TAILW = [2.5, 1.85, 1.35, .95, .62, .36];
const DR_HEAD = [[5.7, 5.7], [5.9, 6.9], [6.6, 7.7], [7.6, 8.05], [8.8, 7.85], [10.2, 7.45], [11.6, 7.15], [12.35, 6.95], [12.7, 6.55], [12.55, 6.15], [11.3, 6.0], [9.6, 5.95], [8.3, 5.85], [7.0, 5.5]];
const DR_JAW = [[7.7, 5.75], [8.6, 5.15], [10.0, 4.75], [11.6, 4.6], [12.25, 4.7], [12.2, 5.0], [11.2, 5.15], [9.6, 5.35], [8.6, 5.65]];
const DR_FIN = [[7.9, 5.35], [8.05, 6.3], [7.6, 6.9], [6.9, 7.1], [5.4, 7.95], [6.4, 6.75], [4.85, 6.45], [6.2, 6.0], [5.0, 4.95], [6.5, 5.4], [6.05, 4.15], [7.1, 4.85]];
const DR_CREW = [ // the dance deck: x, colours, hat, arms, phase
  { x: -3.7, body: '#f2ede2', legs: '#d9d2c4', hat: 'cowboy', hatc: '#f2ede2', arms: 'one' }, { x: -2.9, body: '#2a2428', legs: '#2a2428', hat: 'top', arms: 'down' },
  { x: -2.15, body: '#d9a33a', legs: '#2a2428', hat: 'hair', hatc: '#e8c880', arms: 'up' }, { x: -1.35, body: '#3fa8a4', legs: '#3fa8a4', hat: 'hair', arms: 'down' },
  { x: -.55, body: '#f2ede2', legs: '#f2ede2', hat: 'none', arms: 'one' }, { x: .3, body: '#c7362b', legs: '#2a2428', hat: 'cowboy', hatc: '#5a3a24', arms: 'up' },
  { x: 1.05, body: '#f2ede2', legs: '#3a3048', hat: 'hair', hatc: '#2a1c14', arms: 'down' }, { x: 1.85, body: '#2f6fb5', legs: '#2a2428', hat: 'none', arms: 'one' },
  { x: 2.7, body: '#f4b0cf', legs: '#f2ede2', hat: 'hair', hatc: '#e8c880', arms: 'up' }, { x: 3.55, body: '#e8d4b4', legs: '#5a4a3a', hat: 'cowboy', hatc: '#2a2420', arms: 'down' },
].map((c, i) => Object.assign(c, { skin: ['#e8cfae', '#c99a72', '#f1dcc4', '#8a5a3c'][i % 4], dance: true, goggles: i % 3 === 0, ph: rnd(i, 71) * 2, h: 1.68 + .14 * rnd(i, 72) }));
function drDeck(t, det, lit) { // rail, dancers and the DJ booth; lit = drawn on the night layer
  const rail = lit ? '#e8c890' : '#bfae86', post = lit ? '#b89a60' : '#9a8a68';
  for (let i = 0; i <= 11; i++) { const x = -6.4 + i * 1.0; bmLine([[x, 4.25], [x, 5.3]], .06, post); } // far rail posts
  for (const c of DR_CREW) acPerson(c.x, 4.25, c.h, lit ? { ...c, body: bmShade(c.body, .78), legs: bmShade(c.legs, .7), skin: bmShade(c.skin, .8) } : c, t, c.ph, det);
  // the DJ behind the red booth at the back of the deck
  acPerson(-5.25, 4.25, 1.78, { body: lit ? '#3a6a3a' : '#4f8f4f', legs: '#2a2428', skin: '#c99a72', hat: 'hair', hatc: '#5ad05a', arms: 'one', dance: true, ph: .3 }, t, .3, det);
  bmFill([[-6.3, 4.25], [-4.5, 4.25], [-4.5, 5.35], [-6.3, 5.35]], lit ? '#a8302a' : '#c8302a'); bmFill([[-6.4, 5.35], [-4.4, 5.35], [-4.4, 5.5], [-6.4, 5.5]], lit ? '#7a2018' : '#8e2018');
  if (det) { bmFill([[-5.6, 5.5], [-5.0, 5.5], [-4.95, 5.85], [-5.55, 5.85]], '#2a2a30'); bmFill([[-6.2, 4.4], [-5.5, 4.4], [-5.5, 5.15], [-6.2, 5.15]], '#2a2226'); bmDot(-5.85, 4.95, .17, '#4a4048'); bmDot(-5.85, 4.55, .1, '#4a4048'); } // laptop, a speaker
  bmLine([[-6.6, 5.3], [4.6, 5.3]], .08, rail); bmLine([[-6.6, 4.8], [4.6, 4.8]], .045, rail); // near rails over the dancers' legs
  for (let i = 0; i <= 11; i++) { const x = -6.4 + i * 1.0; bmLine([[x, 4.25], [x, 5.3]], .07, rail); }
}
function drHull(t, det, lit, sq) {
  const glowA = lit ? 1 : .55;
  // tail first (behind the hull), then the hull
  const tail = acTube(DR_TAIL, DR_TAILW);
  bmPath(tail); g.closePath(); g.fillStyle = lit ? bmLG(-8, 5, -12, 3, ['#f0a050', '#c86828']) : bmLG(-8, 6.5, -12, 1.5, ['#eaa066', '#c9783c', '#9a5426']); g.fill();
  if (det) { g.strokeStyle = lit ? 'rgba(120,50,16,.5)' : 'rgba(110,56,22,.45)'; g.lineWidth = bmW(.05); for (let i = 1; i < 5; i++) { const a = DR_TAIL[i], b = DR_TAIL[i - 1], w = DR_TAILW[i] / 2, dx = a[0] - b[0], dy = a[1] - b[1], n = Math.hypot(dx, dy); g.beginPath(); g.moveTo(a[0] - dy / n * w, -(a[1] + dx / n * w)); g.lineTo(a[0] + dy / n * w, -(a[1] - dx / n * w)); g.stroke(); } }
  // the clawed tip: four curled fingers
  for (const [ax, ay, bx, by] of [[-11.4, 6.5, -10.6, 7.35], [-11.6, 6.65, -11.2, 7.75], [-11.85, 6.55, -12.05, 7.6], [-11.9, 6.3, -12.6, 6.95]]) acHorn([ax, ay], [lerp(ax, bx, .4), ay + .3], [bx + .1, by - .3], [bx, by], .34, lit ? '#e89a50' : '#d98a4a');
  for (const wx of [-5.2, -.2, 4.8]) { bmDot(wx, .34, .34, '#17120f'); bmDot(wx, .34, .12, '#5a524a'); } // the wheels, mostly under the skirt
  acSmooth(DR_HULL); g.fillStyle = lit ? bmLG(0, 5, 0, .5, ['#f7b868', '#e08a40', '#b4602a']) : bmLG(0, 5.2, 0, .5, ['#f0aa6c', '#dc8644', '#b0602c']); g.fill();
  // the inner glow: lamps inside the fabric hull, brightest at the chest
  g.save(); acSmooth(DR_HULL); g.clip();
  for (const [gx, gy, r, a] of [[7.2, 2.6, 3.0, .75], [3.0, 2.2, 2.8, .45], [-1.8, 2.2, 2.8, .4], [-6.2, 2.3, 2.4, .35]]) { const rg = g.createRadialGradient(gx, -gy, 0, gx, -gy, r); rg.addColorStop(0, `rgba(255,${lit ? 232 : 222},${lit ? 168 : 150},${a * glowA})`); rg.addColorStop(1, 'rgba(255,200,120,0)'); g.fillStyle = rg; g.fillRect(gx - r, -gy - r, 2 * r, 2 * r); }
  // stretched panels: curved seams down the hull, a shadowed belly
  g.strokeStyle = lit ? 'rgba(130,56,18,.42)' : 'rgba(120,58,22,.4)'; g.lineWidth = bmW(.055);
  for (let i = 0; i < 12; i++) { const x = -7.4 + i * 1.28; g.beginPath(); g.moveTo(x + .25, -4.6); g.quadraticCurveTo(x - .2, -2.4, x + .15, -.3); g.stroke(); }
  g.fillStyle = lit ? 'rgba(90,30,10,.35)' : 'rgba(80,36,14,.32)'; g.fillRect(-9, -1.1, 18.5, .7);
  if (det) { g.strokeStyle = lit ? 'rgba(255,230,180,.35)' : 'rgba(255,236,200,.3)'; g.lineWidth = bmW(.04); g.beginPath(); g.moveTo(-7, -4.05); g.lineTo(4, -4.1); g.stroke(); } // a sheen along the top
  g.restore();
}
function drHead(t, det, lit) {
  const jawA = .04 * Math.sin(t * .9) + (lit ? .03 : 0), cu = lit ? ['#e8a060', '#c8783a', '#8e4a1e'] : ['#f4b478', '#d27c3a', '#94481c'];
  // far horn behind the head
  acHorn([6.35, 7.85], [6.1, 9.1], [5.0, 9.7], [3.75, 9.45], .5, lit ? '#d8ccb0' : '#ddd2b8');
  // lower jaw (hinged at the back of the mouth), the dark mouth, the skull and snout over it
  g.save(); g.translate(7.9, -5.8); g.rotate(-jawA); g.translate(-7.9, 5.8);
  acSmooth(DR_JAW); g.fillStyle = bmLG(0, 5.6, 0, 4.6, [cu[1], cu[2]]); g.fill();
  if (det) for (let x = 9.3; x < 12.0; x += .4) { const y = x < 11.2 ? lerp(5.35, 5.15, (x - 9.6) / 1.6) : lerp(5.15, 5.0, (x - 11.2) / 1.0); bmFill([[x - .12, y - .02], [x + .12, y - .02], [x, y + .36 + (x > 11.5 ? .12 : 0)]], '#f4eedc'); }
  g.restore();
  bmFill([[8.3, 5.85], [12.5, 6.12], [12.2, 5.0 + jawA * 4], [11.2, 5.15 + jawA * 3], [9.6, 5.35 + jawA * 2], [8.6, 5.65]], lit ? '#3a1208' : '#4a160c');
  acSmooth(DR_HEAD); g.fillStyle = bmLG(0, 8.0, 0, 5.8, cu); g.fill();
  if (det) { g.strokeStyle = 'rgba(255,236,200,.35)'; g.lineWidth = bmW(.06); g.beginPath(); g.moveTo(7.2, -7.75); g.quadraticCurveTo(9.5, -7.7, 12.2, -6.95); g.stroke(); } // a highlight down the snout
  if (det) for (let x = 8.9; x < 12.3; x += .42) bmFill([[x - .13, 6.06], [x + .13, 6.07], [x, 5.6 - (x > 11.6 ? .2 : 0)]], '#f4eedc'); // upper teeth, fangs at the front
  bmOval(12.05, 6.78, .17, .09, '#5a2a10'); // nostril
  // the eye with its heavy lid, and the curled spiral behind it
  bmOval(8.6, 7.2, .42, .3, '#f4ecd8'); bmDot(8.78, 7.18, .17, '#3a2412'); if (det) bmDot(8.84, 7.25, .05, 'rgba(255,255,255,.85)');
  bmLine([[8.05, 7.5], [8.6, 7.62], [9.15, 7.48]], .13, cu[2]);
  bmDot(7.1, 7.32, .6, cu[2]); g.strokeStyle = lit ? '#f0c080' : '#f6c88a'; g.lineWidth = bmW(.1); g.beginPath();
  for (let i = 0; i <= 30; i++) { const a = i / 30 * TAU * 2.1, r = .52 * (1 - i / 34); const px = 7.1 + Math.cos(a) * r, py = 7.32 + Math.sin(a) * r; i ? g.lineTo(px, -py) : g.moveTo(px, -py); } g.stroke();
  // brow spikes along the top of the head
  for (let i = 0; i < 7; i++) { const x = 6.3 + i * .48, y = x < 7.6 ? lerp(7.5, 8.05, (x - 6.3) / 1.3) : lerp(8.05, 7.75, (x - 7.6) / 1.8); bmFill([[x - .16, y - .08], [x + .16, y - .08], [x - .28, y + .5 - i * .03]], cu[0]); }
  // the spiked cheek fin over the neck, and its veins
  bmPath(DR_FIN); g.closePath(); g.fillStyle = bmLG(5, 7.5, 8, 4.5, lit ? ['#f0b060', '#d8903e', '#a8622a'] : ['#f6c47c', '#e29a48', '#b46a2a']); g.fill();
  if (det) { g.strokeStyle = 'rgba(120,60,20,.5)'; g.lineWidth = bmW(.05); for (const tip of [[5.4, 7.95], [4.85, 6.45], [5.0, 4.95], [6.05, 4.15]]) { g.beginPath(); g.moveTo(7.6, -6.1); g.lineTo(tip[0] + .4, -tip[1] - .05 * (tip[1] - 6)); g.stroke(); } }
  // the near horn, long and ivory, sweeping up and back
  acHorn([6.85, 7.75], [6.95, 9.4], [5.7, 10.3], [4.15, 10.15], .6, lit ? '#e8dcc0' : bmLG(4, 10.3, 7, 7.8, ['#f4eedc', '#e6dcc2', '#c8b898']));
}
function drDraw(st, t, k, sq, lit) {
  const det = k > 9;
  g.save(); g.scale(sq, 1); drHull(t, det, lit, sq); drDeck(t, det && k > 14, lit); drHead(t, det, lit); g.restore();
}
function drShadow(st, t) { const { X, Z, hx, hz } = st, at = (u, y) => [X + hx * u, y, Z + hz * u];
  shadowOf([at(-8.8, 0), at(8.8, 0), at(-7, 4.4), at(4.5, 6), at(-5, 6), at(8.5, 5), at(12.7, 6.6), at(5, 10.2), at(-11.9, 6.6)], t); }
function drGlow(st, t, k, sq) { // the night layer: the hull lit from inside, the deck lights, the booth's LEDs
  drDraw(st, t, k, sq, true);
  g.save(); g.scale(sq, 1);
  const n = 15; for (let i = 0; i <= n; i++) { const x = -6.4 + i * 11 / n, tw = .7 + .3 * Math.sin(t * 2.2 + i * 1.9), s = Math.max(.07, 1.6 / k); bmFill([[x - s, 5.38 - s], [x + s, 5.38 - s], [x + s, 5.38 + s], [x - s, 5.38 + s]], `rgba(255,${206 + (i % 3) * 14},${130 + (i % 2) * 50},${.95 * tw})`); }
  const hu = (t * 25) % 360; for (let i = 0; i < 6; i++) { const x = -6.15 + i * .3; bmFill([[x, 5.36], [x + .2, 5.36], [x + .2, 5.48], [x, 5.48]], `hsla(${(hu + i * 50) % 360},85%,62%,.95)`); }
  const rg = g.createRadialGradient(-5.4, -5.9, 0, -5.4, -5.9, 2.6); rg.addColorStop(0, `hsla(${hu},80%,60%,.22)`); rg.addColorStop(1, `hsla(${hu},80%,60%,0)`); g.fillStyle = rg; g.fillRect(-8, -8.5, 5.2, 5.2);
  g.restore();
}

// ---------- 2. the red velvet organ cart (about 3.6 m, front = +x) ----------
// From organ-cart-1/2: a low red velvet box with gold fringe on top and red fringe skirting to the ground over a white trim
// with blue cords, a silver tiled front; an organ console with a little windscreen at the front; the player in white with
// long dark hair on a white fur seat; behind and over him a glittered purple swan-neck canopy with a red roof, red fringe
// and bead curtains in its oval windows.
function ogDraw(st, t, k, sq) {
  const det = k > 16, red = bmLG(0, 1.2, 0, .5, ['#d02a38', '#b01c2c', '#7c1020']), pur = bmLG(-1.6, 2.8, .6, 1.2, ['#c8a0dc', '#a478c4', '#7c56a0']), bt = acBeat(t);
  g.save(); g.scale(sq, 1);
  // the canopy's back panel with its oval window and bead curtain (behind the player)
  bmPath([[-1.62, 1.15], [-.55, 1.15], [-.5, 2.2], [-.62, 2.62], [-1.5, 2.72], [-1.68, 2.2]]); g.closePath(); g.fillStyle = pur; g.fill();
  bmOval(-1.08, 1.92, .33, .55, 'rgba(176,206,232,.55)');
  if (det) for (let i = 0; i < 6; i++) { const x = -1.33 + i * .1, ph = Math.sin(t * 1.6 + i) * .015; for (let j = 0; j < 9; j++) bmDot(x + ph * j, 2.42 - j * .11, .022, j % 2 ? '#e8e0f4' : '#c8b8e0'); }
  // the swan neck: a thick glittered band from the back panel up and forward over the player, the red roof on it
  const neck = acCubic([-1.2, 2.55], [-1.0, 3.05], [.1, 3.0], [1.05, 2.82], 12); bmFill(acTube(neck, neck.map((_, i) => .2 - i * .006)), pur);
  bmPath([[-1.75, 2.72], [-.6, 2.92], [.4, 2.98], [1.15, 2.95], [1.32, 3.06], [1.12, 2.84], [.4, 2.84], [-.6, 2.78], [-1.7, 2.6]]); g.closePath(); g.fillStyle = bmLG(0, 3.05, 0, 2.6, ['#d24048', '#a82a34']); g.fill();
  // red fringe hanging off the roof edge, swinging a little as it rolls
  g.strokeStyle = '#c82838'; g.lineWidth = bmW(.025); g.beginPath(); for (let i = 0; i <= 34; i++) { const x = -1.65 + i * .082, y0 = lerp(2.66, 2.88, i / 34), sw = Math.sin(t * 3 + i * .7) * .02; g.moveTo(x, -y0); g.lineTo(x + sw, -(y0 - .22)); } g.stroke();
  if (det) { g.fillStyle = 'rgba(255,250,255,.8)'; for (let i = 0; i < 26; i++) { const u = rnd(i, 91), q = neck[Math.floor(u * 12)], tw = .5 + .5 * Math.sin(t * 5 + i * 2.3); g.globalAlpha = tw; g.fillRect(q[0] + (rnd(i, 92) - .5) * .12, -q[1] + (rnd(i, 93) - .5) * .12, .03, .03); } g.globalAlpha = 1; } // glitter
  // the player: white robe, long dark hair, at the keys (hands moving)
  const hp = [-.12, 1.38], sh = [-.02, 1.98], hd = [.03, 2.2];
  bmFill([[hp[0] - .22, 1.15], [hp[0] + .45, 1.15], [hp[0] + .5, 1.42], [sh[0] + .2, sh[1]], [sh[0] - .24, sh[1] + .02], [hp[0] - .28, 1.3]], bmLG(-.3, 2, .4, 1.2, ['#fbf8f2', '#e6e0d4', '#c8c0b2']));
  bmFill([[hd[0] - .15, hd[1] + .08], [hd[0] + .02, hd[1] + .14], [hd[0] - .05, hd[1] - .45], [hd[0] - .22, hd[1] - .5]], '#2a1c16'); // hair down the back
  bmOval(hd[0], hd[1], .12, .14, '#d8b28c'); bmOval(hd[0] - .05, hd[1] + .07, .12, .08, '#2a1c16');
  if (det) bmLine([[hd[0] + .02, hd[1] + .02], [hd[0] + .13, hd[1] + .02]], .022, '#2a2420'); // glasses
  for (const [sd, ph] of [[-1, 0], [1, .5]]) { const kx = .5 + .06 * Math.sin((bt + ph) * Math.PI), ky = 1.5 + .025 * Math.max(0, Math.sin((bt * 2 + ph) * Math.PI)); bmLine([[sh[0] + .05 * sd, sh[1] - .08], [sh[0] + .28, sh[1] - .32], [kx, ky]], .09, sd < 0 ? '#ddd6c8' : '#f4f0e8'); bmDot(kx + .03, ky, .045, '#d8b28c'); }
  bmPath(bmFur([[-.42, 1.15], [.22, 1.15], [.2, 1.42], [-.45, 1.5]], .03, 5)); g.closePath(); g.fillStyle = '#ece6da'; g.fill(); // white fur seat
  // the organ console with its keys and windscreen
  bmFill([[.5, 1.15], [1.38, 1.15], [1.38, 1.82], [.62, 1.82]], red); bmFill([[.38, 1.45], [.75, 1.45], [.75, 1.53], [.38, 1.53]], '#f4f0e6');
  if (det) for (let i = 0; i < 6; i++) bmFill([[.41 + i * .06, 1.49], [.44 + i * .06, 1.49], [.44 + i * .06, 1.53], [.41 + i * .06, 1.53]], '#1c1a1e');
  bmFill([[.66, 1.82], [1.32, 1.82], [1.22, 2.1], [.84, 2.08]], 'rgba(170,196,214,.75)'); bmLine([[.66, 1.82], [.84, 2.08], [1.22, 2.1], [1.32, 1.82]], .03, '#e8e4dc');
  bmFill([[.5, 1.78], [1.38, 1.78], [1.38, 1.84], [.5, 1.84]], '#d8b04a');
  // the velvet box, gold fringe along its top, the silver tiled front, the white trim, the red fringe skirt
  bmFill([[-1.62, .58], [1.72, .58], [1.72, 1.17], [-1.62, 1.17]], red);
  if (det) { bmFill([[-1.0, .68], [-.3, .68], [-.3, 1.05], [-1.0, 1.05]], 'rgba(90,10,20,.25)'); bmDot(-.65, .9, .06, '#d8dcde'); bmDot(.95, .9, .06, '#d8dcde'); }
  bmFill([[1.42, .6], [1.78, .6], [1.78, 1.12], [1.42, 1.12]], bmLG(0, 1.1, 0, .6, ['#f2f2f0', '#c8ccd0']));
  if (det) { g.strokeStyle = 'rgba(120,124,130,.6)'; g.lineWidth = bmW(.01); for (let i = 1; i < 6; i++) { g.beginPath(); g.moveTo(1.42, -(.6 + i * .087)); g.lineTo(1.78, -(.6 + i * .087)); g.stroke(); } }
  g.strokeStyle = '#d8b04a'; g.lineWidth = bmW(.02); g.beginPath(); for (let i = 0; i <= 40; i++) { const x = -1.6 + i * .084; g.moveTo(x, -1.18); g.lineTo(x, -1.08); } g.stroke();
  bmFill([[-1.66, .45], [1.8, .45], [1.8, .58], [-1.66, .58]], '#f2ede4');
  if (det) { g.strokeStyle = '#4a6ad0'; g.lineWidth = bmW(.012); g.beginPath(); for (let i = 0; i < 8; i++) { const x0 = -1.5 + i * .42; g.moveTo(x0, -.52); g.quadraticCurveTo(x0 + .21, -.38, x0 + .42, -.52); } g.stroke(); }
  for (const wx of [-1.25, 1.2]) { bmDot(wx, .2, .2, '#1b1714'); bmDot(wx, .2, .08, '#8a8278'); }
  g.strokeStyle = '#b8182a'; g.lineWidth = bmW(.03); g.beginPath(); for (let i = 0; i <= 52; i++) { const x = -1.68 + i * .067, sw = Math.sin(t * 4 + i * .9) * .015 * Math.min(1, st.v); g.moveTo(x, -.45); g.lineTo(x + sw, -.06); } g.stroke();
  g.restore();
}
function ogShadow(st, t) { const { X, Z, hx, hz } = st, at = (u, y) => [X + hx * u, y, Z + hz * u]; shadowOf([at(-1.7, 0), at(1.8, 0), at(-1.6, 2.7), at(1.2, 2.95), at(1.4, 1.8)], t); }

// ---------- 3. the plywood horse on casters (front = +x) ----------
// From horse-bike: a flat red plywood horse cut-out on four small caster wheels, two riders in goggles and bandanas on its
// back (she steers at the front with a red bandana over her face, he rides behind with a backpack and a white wrap on his
// head), a tall yellow flag on a pole at the back, rolling through a haze of its own dust.
function hbDraw(st, t, k, sq) {
  const det = k > 14, red = '#c8322a', edge = '#8e1e18', sp = st.sp, bt = t * 1.6;
  g.save(); g.scale(sq, 1);
  // dust kicked up behind and round the casters
  for (let i = 0; i < 9; i++) { const age = ((t * .7 + i / 9) % 1), x = -1.2 - age * 2.6 + rnd(i, 61) * .5, y = .25 + age * 1.1 + rnd(i, 62) * .3, r = .35 + age * .9;
    bmDot(x, y, r, `rgba(228,206,170,${.28 * (1 - age) * Math.min(1, st.v / 1.5)})`); }
  // the flag pole and its yellow flag, streaming back
  bmLine([[-.98, .5], [-.98, 4.6]], .04, '#d8d8d4');
  { const pts = [], n = 10; for (let i = 0; i <= n; i++) { const u = i / n; pts.push([-.98 - u * 1.6, 4.6 - u * .15 + Math.sin(u * 4 - t * 6) * .16 * u]); } for (let i = n; i >= 0; i--) { const u = i / n; pts.push([-.98 - u * 1.6, 3.6 + u * .25 + Math.sin(u * 4 - t * 6 + .5) * .2 * u]); }
    bmFill(pts, bmLG(-1, 4.6, -2.6, 3.6, ['#f2c840', '#e0aa2a'])); }
  // far legs and casters (behind the body)
  const leg = (x0, x1, far) => { bmFill([[x0 - .13, 1.15], [x0 + .13, 1.15], [x1 + .09, .32], [x1 - .09, .32]], far ? edge : red); bmLine([[x1, .32], [x1, .22]], .04, '#8a8a88'); bmDot(x1, .14, .14, '#1b1714'); if (det) bmDot(x1, .14, .05, '#a8a8a4'); };
  const kick = Math.sin(sp * 2.2) * .04; leg(.7, .82 + kick, true); leg(-.75, -.95 - kick, true);
  // the body: one flat cut-out, the neck and head up at the front, ears, a little tail
  const body = [[-1.15, 1.1], [-1.2, 1.5], [-.9, 1.62], [.55, 1.58], [.95, 1.75], [1.3, 2.25], [1.45, 2.5], [1.55, 2.35], [1.62, 2.52], [1.7, 2.32], [2.08, 2.05], [2.1, 1.9], [1.75, 1.85], [1.3, 1.6], [1.05, 1.1]];
  bmPath(body); g.closePath(); g.fillStyle = bmLG(0, 2.4, 0, 1.0, ['#d8423a', red, '#a82820']); g.fill(); g.strokeStyle = edge; g.lineWidth = bmW(.035); g.stroke();
  bmFill([[-1.15, 1.45], [-1.38, 1.2], [-1.3, .95], [-1.12, 1.3]], red); // tail
  if (det) { bmDot(1.72, 2.12, .045, '#2a1a14'); g.strokeStyle = 'rgba(120,30,20,.5)'; g.lineWidth = bmW(.015); g.beginPath(); g.moveTo(-1.0, -1.35); g.lineTo(.6, -1.33); g.stroke(); } // eye, a ply seam
  leg(.95, 1.08 - kick, false); leg(-.55, -.62 + kick, false); // near legs
  // the steering post and bar at the neck
  bmLine([[.62, 1.6], [.66, 2.05]], .035, '#9a9a96'); bmLine([[.52, 2.05], [.78, 2.08]], .04, '#5a5a58');
  // the riders on a cushion: him behind with the backpack, her at the front with the bar
  bmFill([[-.75, 1.58], [.5, 1.58], [.48, 1.7], [-.72, 1.7]], '#e8dcc0');
  const rider = (x, c) => { const hip = [x, 1.72], sh = [x + .04, 2.3], hd = [x + .07, 2.52], kn = [x + .38, 1.78], ft = [x + .42, 1.3 + Math.sin(bt + c.ph) * .02];
    if (c.pack) bmFill([[x - .32, 1.85], [x - .1, 1.85], [x - .08, 2.38], [x - .3, 2.36]], '#5a5e4a');
    bmLine([hip, kn, ft], .13, c.skin); bmFill([[hip[0] - .14, hip[1] - .04], [kn[0] - .02, kn[1] - .06], [kn[0], kn[1] + .08], [hip[0] - .1, hip[1] + .14]], c.shorts); bmOval(ft[0] + .05, ft[1] - .02, .1, .05, c.shoe);
    bmFill([[hip[0] - .15, hip[1]], [hip[0] + .15, hip[1]], [sh[0] + .16, sh[1]], [sh[0] - .16, sh[1]]], c.top);
    bmLine([[sh[0] + .1, sh[1] - .05], [sh[0] + .32, sh[1] - .28], c.hand], .08, c.skin);
    bmOval(hd[0], hd[1], .11, .13, c.skin); c.headwear(hd); };
  rider(-.38, { skin: '#d8b090', top: '#3a3a40', shorts: '#7a7a6a', shoe: '#c8c4bc', pack: true, ph: 0, hand: [.12, 2.02],
    headwear: (hd) => { bmFill([[hd[0] - .12, hd[1] + .02], [hd[0] + .12, hd[1] + .04], [hd[0] + .1, hd[1] + .16], [hd[0] - .11, hd[1] + .14]], '#f2eee6'); bmLine([[hd[0] - .11, hd[1] + .02], [hd[0] + .12, hd[1] + .02]], .05, '#d83a3a'); bmFill([[hd[0] - .1, hd[1] - .08], [hd[0] + .1, hd[1] - .08], [hd[0] + .06, hd[1] - .2], [hd[0] - .08, hd[1] - .2]], '#f2eee6'); } });
  rider(.18, { skin: '#f0d0b0', top: '#4a78b8', shorts: '#4a78b8', shoe: '#9a7a5a', ph: 1.3, hand: [.62, 2.05],
    headwear: (hd) => { bmOval(hd[0] - .03, hd[1] + .05, .13, .11, '#e8c880'); bmFill([[hd[0] - .02, hd[1] - .01], [hd[0] + .13, hd[1] - .02], [hd[0] + .11, hd[1] - .13], [hd[0] - .04, hd[1] - .12]], '#d03030'); bmLine([[hd[0] - .1, hd[1] + .04], [hd[0] + .12, hd[1] + .04]], .045, '#c04050'); } });
  g.restore();
}
function hbShadow(st, t) { const { X, Z, hx, hz } = st, at = (u, y) => [X + hx * u, y, Z + hz * u]; shadowOf([at(-1.2, 0), at(1.1, 0), at(-.4, 2.6), at(1.6, 2.4), at(.2, 2.6)], t); shadowStick(X - hx * .98, 0, 4.6, Z - hz * .98, .05, t); }

// ---------- 4. the weathered galleon (about 22 m with the bowsprit, front = +x) ----------
// From galleon: a grey-brown planked hull with a high stern castle (windows, two iron lanterns), a carved bow with a pale
// figurehead under a long bowsprit, two masts with round tops and yards hung with tattered red sails, pennants, rigging
// to the bow and the stern, and people on the rails.
const GA_HULL = [[-7.0, .75], [6.0, .75], [7.6, 1.6], [8.6, 3.0], [9.2, 4.75], [8.0, 4.62], [5.4, 4.45], [2.0, 4.02], [-3.2, 4.0], [-4.9, 4.4], [-5.0, 5.9], [-8.9, 6.15], [-9.35, 6.0], [-9.0, 4.0], [-8.4, 2.2]];
const GA_MASTS = [{ x: 3.4, top: 16.2, nest: 11.2, yards: [[8.6, 3.2, 2.1], [13.6, 2.3, 1.5]] }, { x: -1.6, top: 17.2, nest: 11.0, yards: [[8.2, 3.5, 2.3], [13.3, 2.5, 1.7], [15.9, 1.4, .8]] }];
const GA_RIG = [[[13.3, 6.85], [3.4, 16.0]], [[13.3, 6.85], [3.4, 11.2]], [[3.4, 16.0], [-1.6, 12.6]], [[-1.6, 17.0], [-8.9, 6.2]], [[3.4, 11.0], [8.9, 4.7]],
  [[3.4, 11.0], [2.1, 4.02]], [[3.4, 11.0], [4.7, 4.3]], [[-1.6, 10.8], [-3.1, 4.02]], [[-1.6, 10.8], [-.2, 4.02]], [[-1.6, 15.9], [3.4, 13.6]]];
function gaYard(m, y, half, hang, t, det, i) { // a yard braced round (so it reads in side view), its tattered sail hanging
  const x = m.x, a = .55, x0 = x - half * a, x1 = x + half * a, tilt = .18, y0 = y - tilt, y1 = y + tilt;
  const n = 8, top = [], bot = []; for (let j = 0; j <= n; j++) { const u = j / n; top.push([lerp(x0, x1, u), lerp(y0, y1, u)]); const rag = hang * (.55 + .45 * rnd(i, j, 81)) * (j % 2 ? .82 : 1), fl = Math.sin(t * 1.7 + j * .9 + i) * .1; bot.push([lerp(x0, x1, u) + fl - .2, lerp(y0, y1, u) - rag]); }
  bmFill(top.concat(bot.reverse()), bmLG(x0, y, x1, y - hang, ['#9a4236', '#7e322a', '#5e2420']));
  if (det) { g.strokeStyle = 'rgba(50,16,12,.35)'; g.lineWidth = bmW(.04); for (let j = 1; j < n; j += 2) { const p = top[j], q = bot[n - j]; g.beginPath(); g.moveTo(p[0], -p[1]); g.lineTo(q[0], -q[1]); g.stroke(); } }
  bmLine([[x0, y0], [x1, y1]], .14, '#3e3226');
}
function gaDraw(st, t, k, sq, lit) {
  const det = k > 7; g.save(); g.scale(sq, 1);
  // rigging behind everything
  g.strokeStyle = 'rgba(36,28,22,.75)'; g.lineWidth = bmW(.045); g.beginPath(); for (const [a, b] of GA_RIG) { g.moveTo(a[0], -a[1]); g.lineTo(b[0], -b[1]); } g.stroke();
  // masts, tops, yards and sails, pennants
  GA_MASTS.forEach((m, i) => { bmFill([[m.x - .17, 3.9], [m.x + .17, 3.9], [m.x + .09, m.top], [m.x - .09, m.top]], bmLG(m.x - .2, 0, m.x + .2, 0, ['#6a5a48', '#4a3e32']));
    m.yards.forEach(([y, half, hang], j) => gaYard(m, y, half, hang, t, det, i * 5 + j));
    bmFill([[m.x - .7, m.nest - .25], [m.x + .7, m.nest - .25], [m.x + .55, m.nest + .45], [m.x - .55, m.nest + .45]], bmLG(m.x - .7, 0, m.x + .7, 0, ['#7a6a56', '#54463a']));
    if (det) { g.strokeStyle = 'rgba(30,22,16,.5)'; g.lineWidth = bmW(.03); for (let j = 1; j < 4; j++) { g.beginPath(); g.moveTo(m.x - .66 + j * .02, -(m.nest - .25 + j * .17)); g.lineTo(m.x + .66 - j * .02, -(m.nest - .25 + j * .17)); g.stroke(); } }
    const pts = [], n = 8, py = m.top + .1; for (let j = 0; j <= n; j++) { const u = j / n; pts.push([m.x - u * 1.5, py - u * .2 + Math.sin(u * 4 - t * 5 + i) * .12 * u]); } for (let j = n; j >= 0; j--) { const u = j / n; pts.push([m.x - u * 1.5, py - .5 + u * .3 + Math.sin(u * 4 - t * 5 + i + .4) * .14 * u]); }
    bmLine([[m.x, m.top], [m.x, m.top + .3]], .04, '#3e3226'); bmFill(pts, i ? '#c8504a' : '#8e2e2a'); });
  // bowsprit and the figurehead under it
  bmLine([[8.3, 4.5], [13.4, 6.9]], .2, '#4e4034');
  bmFill([[8.75, 3.0], [9.15, 3.3], [9.75, 4.25], [9.55, 4.45], [9.05, 4.05], [8.7, 3.45]], '#e2d4b6'); bmOval(9.78, 4.55, .2, .22, '#e8dcc0'); // the pale figurehead, leaning out under the bowsprit
  for (const wx of [-5, -1.5, 2, 5]) bmDot(wx, .4, .4, '#17120f'); // wheels, under the hull
  // the hull: weathered planks, a dark wale, the stern castle and its windows
  bmPath(GA_HULL); g.closePath(); g.fillStyle = bmLG(0, 6, 0, .7, ['#7e6e5c', '#62523f', '#3c3128']); g.fill();
  g.save(); bmPath(GA_HULL); g.closePath(); g.clip();
  g.strokeStyle = 'rgba(30,22,16,.45)'; g.lineWidth = bmW(.035); for (let i = 0; i < 12; i++) { const y = 1.15 + i * .44; g.beginPath(); for (let j = 0; j <= 20; j++) { const x = -9.4 + j * .95, yy = y + .22 * Math.pow(Math.max(0, x) / 9, 2) * (1 + i * .1); j ? g.lineTo(x, -yy) : g.moveTo(x, -yy); } g.stroke(); }
  if (det) { g.strokeStyle = 'rgba(30,22,16,.3)'; for (let i = 0; i < 40; i++) { const x = -9 + rnd(i, 82) * 17.5, y = 1.2 + Math.floor(rnd(i, 83) * 11) * .44; g.beginPath(); g.moveTo(x, -y); g.lineTo(x, -(y + .44)); g.stroke(); } }
  g.fillStyle = 'rgba(200,190,170,.12)'; for (let i = 0; i < 14; i++) g.fillRect(-9 + rnd(i, 84) * 17, -(1.4 + rnd(i, 85) * 3.6), .8 + rnd(i, 86) * 1.8, .14); // sun-bleached boards
  g.fillStyle = 'rgba(25,18,12,.55)'; g.beginPath(); for (let j = 0; j <= 20; j++) { const x = -9.4 + j * .95, yy = 3.15 + .3 * Math.pow(Math.max(0, x) / 9, 2); j ? g.lineTo(x, -yy) : g.moveTo(x, -yy); } for (let j = 20; j >= 0; j--) { const x = -9.4 + j * .95, yy = 3.45 + .3 * Math.pow(Math.max(0, x) / 9, 2); g.lineTo(x, -yy); } g.fill(); // the wale
  g.fillStyle = 'rgba(20,14,10,.4)'; g.fillRect(-9.5, -1.35, 19, .6); // shadowed bilge
  g.restore();
  for (let i = 0; i < 3; i++) { const x = -8.3 + i * 1.05; bmFill([[x, 4.75], [x + .62, 4.75], [x + .62, 5.4], [x, 5.4]], lit ? '#2a1e16' : '#3a3a3e'); bmLine([[x, 4.75], [x + .62, 4.75], [x + .62, 5.4], [x, 5.4], [x, 4.75]], .05, '#2a2018'); }
  if (det) { g.strokeStyle = 'rgba(210,196,170,.5)'; g.lineWidth = bmW(.05); g.beginPath(); g.moveTo(8.4, -3.3); g.bezierCurveTo(7.6, -3.9, 6.8, -3.0, 6.0, -3.7); g.moveTo(8.1, -2.4); g.bezierCurveTo(7.4, -2.9, 6.6, -2.2, 5.9, -2.8); g.stroke(); } // carving at the bow
  // rails with balusters: the forecastle, the waist, the stern
  const rail = (x0, y0, x1, y1, h) => { bmLine([[x0, y0 + h], [x1, y1 + h]], .1, '#4a3c30'); if (det) for (let i = 0; i <= 10; i++) { const u = i / 10; bmLine([[lerp(x0, x1, u), lerp(y0, y1, u)], [lerp(x0, x1, u), lerp(y0, y1, u) + h]], .06, '#5a4a3c'); } };
  rail(5.4, 4.45, 9.0, 4.7, .8); rail(-3.2, 4.0, 2.0, 4.02, .55); rail(-9.0, 6.12, -5.1, 5.92, .75);
  // the stern lanterns on their posts
  for (const lx of [-8.7, -5.4]) { bmLine([[lx, 6.05], [lx, 7.0]], .07, '#2a2420'); bmFill([[lx - .2, 7.0], [lx + .2, 7.0], [lx + .16, 7.5], [lx - .16, 7.5]], lit ? '#2a2018' : '#4a4644'); bmFill([[lx - .24, 7.5], [lx + .24, 7.5], [lx, 7.75]], '#2a2420'); }
  // people on the rails
  const crew = [[6.3, 4.5, '#e8b23a', 'none'], [7.1, 4.55, '#c7362b', 'hair'], [7.9, 4.6, '#f2ede2', 'cowboy'], [-1.0, 4.0, '#2f6fb5', 'none'], [-7.7, 6.12, '#f2ede2', 'top'], [-6.6, 6.05, '#7a3c8c', 'hair']];
  crew.forEach(([x, y, col, hat], i) => acPerson(x, y, 1.72, { body: lit ? bmShade(col, .6) : col, legs: lit ? '#1c1618' : '#3a3040', skin: lit ? '#8a6a52' : ['#e8cfae', '#c99a72', '#f1dcc4'][i % 3], hat, hatc: '#4a3020', arms: i === 1 ? 'one' : 'down', dance: i % 2 === 0, goggles: true }, t, i * .7, k > 14));
  g.restore();
}
function gaShadow(st, t) { const { X, Z, hx, hz } = st, at = (u, y) => [X + hx * u, y, Z + hz * u]; shadowOf([at(-9.2, 0), at(9.2, 0), at(-9, 6.2), at(9, 4.8), at(13.3, 6.9)], t);
  shadowStick(X + hx * 3.4, 0, 16.2, Z + hz * 3.4, .3, t); shadowStick(X - hx * 1.6, 0, 17.2, Z - hz * 1.6, .3, t); }
function gaGlow(st, t, k, sq) { // the night layer: stern windows and lanterns, bulbs strung along the rigging, a warm deck
  g.save(); g.scale(sq, 1);
  for (let i = 0; i < 3; i++) { const x = -8.3 + i * 1.05, tw = .85 + .15 * Math.sin(t * 1.3 + i); bmFill([[x + .06, 4.8], [x + .56, 4.8], [x + .56, 5.35], [x + .06, 5.35]], `rgba(255,${190 + i * 10},110,${.9 * tw})`); }
  for (const lx of [-8.7, -5.4]) { const rg = g.createRadialGradient(lx, -7.25, 0, lx, -7.25, 1.5); rg.addColorStop(0, 'rgba(255,214,140,.7)'); rg.addColorStop(.25, 'rgba(255,170,80,.25)'); rg.addColorStop(1, 'rgba(255,150,60,0)'); g.fillStyle = rg; g.fillRect(lx - 1.5, -8.75, 3, 3); bmFill([[lx - .14, 7.05], [lx + .14, 7.05], [lx + .11, 7.45], [lx - .11, 7.45]], 'rgba(255,224,160,.95)'); }
  const s = Math.max(.07, 1.5 / k); let n = 0;
  for (const [a, b] of GA_RIG.slice(0, 4)) { const L = Math.hypot(b[0] - a[0], b[1] - a[1]), m = Math.max(2, Math.round(L / .9)); for (let i = 0; i <= m; i++) { const u = i / m, x = lerp(a[0], b[0], u), y = lerp(a[1], b[1], u), tw = .65 + .35 * Math.sin(t * 1.8 + n * 2.1); n++;
    bmFill([[x - s, y - s], [x + s, y - s], [x + s, y + s], [x - s, y + s]], `rgba(255,${200 + (n % 3) * 18},${120 + (n % 2) * 60},${.9 * tw})`); } }
  const rg = g.createRadialGradient(0, -4.8, 0, 0, -4.8, 7); rg.addColorStop(0, 'rgba(255,190,110,.18)'); rg.addColorStop(1, 'rgba(255,170,90,0)'); g.fillStyle = rg; g.fillRect(-7, -11.8, 14, 14);
  g.restore();
}

// ---------- 5. Robin on his chrome chopper (front = +x) ----------
// From robin-chopper-1/2/3, his own likeness at his request, kept faceless-safe: the silver goggles, the goatee and the bald
// head carry it. A low stretch chopper with a long raked chrome fork, fat white-wall tyres, a black tank and rear fender with
// red pinstripes, a grey fur seat, feet forward on the pedals; an olive quilted vest, khaki shorts, grey clogs, a black hip
// pouch and the embroidered orange bag on its strap. One hand on the bars, the other resting easy on his thigh.
function chDraw(st, t, k, sq, alpha) {
  const det = k > 30, ang = -st.sp / .34, skin = '#d6a07a', skinD = '#b07e5c', vest = '#6e7448', vestD = '#4e5432', khaki = '#b8a27c', chrome = (x0, y0, x1, y1) => bmLG(x0, y0, x1, y1, ['#f4f6f6', '#a8b0b4', '#e8eef0', '#7a8288']);
  g.save(); g.scale(sq, 1); if (alpha < 1) g.globalAlpha = alpha;
  const RW = [-.72, .35], FW = [1.18, .34], BB = [.12, .36], HT = [.62, 1.02], GR = [.36, 1.28], SEAT = [-.34, .74];
  const tyre = (c, r) => { bmDot(c[0], c[1], r, '#1d1a18'); g.beginPath(); g.arc(c[0], -c[1], r * .8, 0, TAU); g.strokeStyle = '#e6e2da'; g.lineWidth = bmW(.035); g.stroke(); bmDot(c[0], c[1], r * .72, 'rgba(60,58,56,.35)');
    if (k > 12) { g.strokeStyle = 'rgba(210,214,216,.8)'; g.lineWidth = bmW(.006); g.beginPath(); for (let i = 0; i < 12; i++) { const a = ang + i * Math.PI / 12; g.moveTo(c[0] + Math.cos(a) * r * .7, -c[1] - Math.sin(a) * r * .7); g.lineTo(c[0] - Math.cos(a) * r * .7, -c[1] + Math.sin(a) * r * .7); } g.stroke(); }
    bmDot(c[0], c[1], .05, '#c8ccd0'); };
  // far side: the far pedal and leg, the far arm on the bars
  const ca = ang * .6, P1 = [BB[0] + Math.cos(ca) * .16, BB[1] + Math.sin(ca) * .16], P2 = [BB[0] - Math.cos(ca) * .16, BB[1] - Math.sin(ca) * .16];
  const HIP = [-.3, .86], SH = [-.36, 1.42], HD = [-.27, 1.66];
  const legTo = (P, near) => { const K = bmJoint(HIP, P, .46, .46, 1, .9); bmLine([HIP, K], .15, near ? khaki : bmShade(khaki, .72)); bmLine([[lerp(HIP[0], K[0], .55), lerp(HIP[1], K[1], .55)], K, P], .1, near ? skin : skinD);
    bmOval(P[0] + .06, P[1] - .01, .14, .07, near ? '#9a9a96' : '#6e6e6a'); if (near && det) bmDot(P[0] + .12, P[1] + .02, .015, '#5a5a58'); };
  legTo(P2, false);
  bmLine([[SH[0] + .05, SH[1] - .04], bmJoint([SH[0] + .05, SH[1] - .04], GR, .3, .34, .2, -1), [GR[0] - .02, GR[1]]], .085, skinD); // far arm to the bar
  // wheels and the long chrome frame
  tyre(RW, .35); tyre(FW, .34);
  g.fillStyle = '#1c1a1c'; g.beginPath(); g.arc(RW[0], -RW[1], .43, Math.PI * 1.05, Math.PI * 1.9); g.arc(RW[0], -RW[1], .37, Math.PI * 1.9, Math.PI * 1.05, true); g.closePath(); g.fill(); // rear fender
  if (det) { g.strokeStyle = '#c83a30'; g.lineWidth = bmW(.012); g.beginPath(); g.arc(RW[0], -RW[1], .4, Math.PI * 1.3, Math.PI * 1.6); g.stroke(); }
  bmLine([RW, [BB[0] - .05, .42], [BB[0] + .18, .42]], .05, '#c4cace'); bmLine([RW, [-.05, .52]], .04, '#dfe4e6'); bmLine([[BB[0], .4], [-.2, .68], [HT[0] - .08, .9]], .055, '#d4dadc'); // chain stays, the low tubes
  bmLine([[RW[0] + .05, .45], [SEAT[0] + .1, .7]], .04, '#c4cace');
  bmLine([HT, [HT[0] + .06, HT[1] - .12], FW], .06, '#e2e8ea'); bmLine([[HT[0] + .03, HT[1] + .06], [FW[0] - .03, FW[1] + .02]], .025, '#8a9296'); // the raked fork
  bmLine([[HT[0] - .02, HT[1] + .04], [HT[0] + .02, HT[1] + .24], [GR[0] + .12, GR[1] + .02], GR], .045, '#cdd3d6'); // ape bars back to the grip
  bmPath([[-.02, .78], [.15, .96], [.58, .98], [.62, .86], [.3, .78]]); g.closePath(); g.fillStyle = bmLG(0, 1.0, 0, .76, ['#4a4a50', '#141416']); g.fill(); // the black tank
  if (det) { g.strokeStyle = '#d8403a'; g.lineWidth = bmW(.014); g.beginPath(); g.moveTo(.1, -.88); g.quadraticCurveTo(.3, -.96, .52, -.9); g.moveTo(.18, -.84); g.quadraticCurveTo(.34, -.9, .5, -.86); g.stroke(); }
  bmDot(BB[0], BB[1], .07, '#9aa2a6'); bmLine([BB, P2], .03, '#8a9296');
  bmPath(bmFur([[-.62, .7], [-.12, .72], [-.08, .84], [-.58, .86]], .03, 9)); g.closePath(); g.fillStyle = '#8e8a86'; g.fill(); // the fur seat
  // him: hips on the seat, the near leg forward to the pedal, the vest, the bag, the head
  bmLine([BB, P1], .03, '#b8c0c4'); legTo(P1, true);
  // the orange embroidered bag hangs at the back hip on its strap
  bmFill([[-.68, .86], [-.36, .84], [-.34, 1.18], [-.66, 1.2]], bmLG(-.7, 1.2, -.34, .84, ['#e07a34', '#c85a24']));
  if (det) { g.strokeStyle = '#f2e0b0'; g.lineWidth = bmW(.012); g.strokeRect(-.62, -1.12, .22, .22); g.beginPath(); g.moveTo(-.51, -1.12); g.lineTo(-.51, -.9); g.moveTo(-.62, -1.01); g.lineTo(-.4, -1.01); g.stroke(); bmLine([[-.66, .86], [-.66, .78]], .015, '#4a2a40'); }
  bmFill([[-.12, .86], [.05, .88], [.04, 1.02], [-.14, 1.0]], '#1e1c1e'); // the black hip pouch
  bmPath([[-.52, .9], [-.08, .9], [-.12, 1.2], [-.16, 1.48], [-.5, 1.5], [-.58, 1.2]]); g.closePath(); g.fillStyle = bmLG(-.55, 1.5, -.1, .9, ['#848a5a', vest, vestD]); g.fill(); // the olive vest
  if (det) { g.save(); bmPath([[-.52, .9], [-.08, .9], [-.12, 1.2], [-.16, 1.48], [-.5, 1.5], [-.58, 1.2]]); g.closePath(); g.clip(); g.strokeStyle = 'rgba(40,44,24,.5)'; g.lineWidth = bmW(.01); g.beginPath(); for (let i = -6; i < 8; i++) { g.moveTo(-.6 + i * .09, -.88); g.lineTo(-.6 + i * .09 + .6, -1.52); g.moveTo(-.6 + i * .09, -1.52); g.lineTo(-.6 + i * .09 + .6, -.88); } g.stroke(); g.restore(); } // the diamond quilting
  bmLine([[-.2, 1.46], [-.55, .95]], .028, '#4a2a40'); // the bag strap across the vest
  // the near arm resting on his thigh, relaxed
  const E1 = [-.26, 1.13], Hn = [.04, 1.0]; bmLine([[SH[0] + .06, SH[1] - .05], E1, Hn], .085, skin); bmDot(Hn[0] + .02, Hn[1], .045, skin);
  // the head: bald, a goatee, the silver goggles on their strap
  bmLine([[HD[0] - .01, HD[1] - .16], [HD[0], HD[1] - .08]], .08, skinD);
  bmOval(HD[0], HD[1], .115, .13, bmLG(HD[0] - .1, HD[1] + .12, HD[0] + .12, HD[1] - .1, ['#efc8a4', skin, skinD]));
  if (det) bmOval(HD[0] - .04, HD[1] + .08, .045, .025, 'rgba(255,240,220,.6)'); // shine on the bald head
  bmFill([[HD[0] + .03, HD[1] - .06], [HD[0] + .12, HD[1] - .06], [HD[0] + .09, HD[1] - .15], [HD[0] + .02, HD[1] - .14]], '#5a3a24'); // goatee
  bmLine([[HD[0] - .11, HD[1] + .025], [HD[0] + .09, HD[1] + .025]], .03, '#2a2a2e'); bmOval(HD[0] + .085, HD[1] + .025, .042, .035, bmLG(HD[0] + .05, HD[1] + .06, HD[0] + .12, HD[1], ['#f4f6f8', '#9aa6ae']));
  if (det) bmDot(HD[0] + .075, HD[1] + .035, .01, '#ffffff');
  // draft 16 (Robin, photo robin-2026-10-18/2.jpg): his woven conical straw rice-paddy hat, a wide shallow cone sitting
  // low over the goggles' strap, fine radial weave lines from the point to the brim, and a chin cord down past the goatee
  const hb = HD[1] + .07, hw = .36, ap = [HD[0] - .015, HD[1] + .27];
  bmLine([[HD[0] - .07, hb - .01], [HD[0] - .02, HD[1] - .1], [HD[0] + .06, HD[1] - .17]], .012, '#7a6038'); // the cord, under the brim
  bmOval(HD[0], hb - .005, hw * .97, .03, '#8a6a3c'); // the brim's underside, in its own shade
  bmPath([[HD[0] - hw, hb], [ap[0], ap[1]], [HD[0] + hw, hb], [HD[0], hb - .025]]); g.closePath(); g.fillStyle = bmLG(HD[0] - hw, hb + .2, HD[0] + hw, hb, ['#f0dca0', '#d9bc78', '#b8955a']); g.fill();
  if (k > 14) { g.strokeStyle = 'rgba(120,88,44,.55)'; g.lineWidth = bmW(.008); g.beginPath(); for (let i = 1; i < 12; i++) { const u = i / 12; g.moveTo(ap[0], -ap[1]); g.lineTo(lerp(HD[0] - hw, HD[0] + hw, u), -(hb - .012 * Math.sin(u * Math.PI))); } g.stroke(); // the weave: spokes from the point
    if (det) { g.strokeStyle = 'rgba(130,96,50,.4)'; for (const f of [.35, .6, .82]) { g.beginPath(); g.moveTo(lerp(ap[0], HD[0] - hw, f), -lerp(ap[1], hb, f)); g.lineTo(lerp(ap[0], HD[0] + hw, f), -lerp(ap[1], hb, f)); g.stroke(); } } } // and the rings round it
  bmLine([[HD[0] - hw, hb], [HD[0] + hw, hb]], .018, '#a8844c'); // the bound rim
  bmDot(ap[0], ap[1], .012, '#a8844c'); // the knot at the point
  g.restore();
}
function chShadow(st, t) { const { X, Z, hx, hz } = st, at = (u, y) => [X + hx * u, y, Z + hz * u]; shadowOf([at(-1.0, 0), at(1.5, 0), at(-.64, 1.73), at(.08, 1.73), at(-.3, 1.94), at(.4, 1.3)], t); } // the hat's brim and point in his shadow

// ---------- 7. the car-boat (draft 16, robin-2026-10-18/1.png; about 6.6 m, front = +x) ----------
// A runabout speedboat on car wheels: a black ribbed lower hull and a bright green topsides with a pale rub strip, a
// cuddy cabin forward with dark side windows and a bow rail, an open cockpit aft under a grey bimini canopy on four
// poles, a red swim ladder hanging off the stern on its red frame. Burners ride in the cockpit; one stands on the bow.
const BT_CREW = [{ x: -.55, body: '#2a2a30', skin: '#c99a72', hat: 'hair', hatc: '#1c1410' }, { x: -1.35, body: '#e07a34', skin: '#e8cfae', hat: 'cowboy', hatc: '#2a2420' }, { x: -2.2, body: '#d9a33a', skin: '#8a5a3c', hat: 'hair', hatc: '#3a2418' }];
function btDraw(st, t, k, sq) {
  const det = k > 14, ang = -st.sp / .42, green = '#3fb23a', greenD = '#2a8a2a', blk = '#1e1c1e';
  g.save(); g.scale(sq, 1);
  // the far bimini poles first (behind the hull)
  for (const x of [-2.95, -.35]) bmLine([[x + .1, 1.55], [x + .25, 3.0]], .045, '#c4c8cc');
  // the people in the cockpit: torsos and heads above the gunwale
  BT_CREW.forEach((c, i) => { const bob = .025 * Math.sin(t * 2.4 + i * 1.7), y0 = 1.3 + bob; bmFill([[c.x - .2, y0], [c.x + .2, y0], [c.x + .17, y0 + .55], [c.x - .17, y0 + .55]], c.body); bmOval(c.x + .02, y0 + .7, .11, .125, c.skin);
    if (c.hat === 'cowboy') { bmOval(c.x + .02, y0 + .79, .22, .04, c.hatc); bmFill([[c.x - .08, y0 + .79], [c.x + .12, y0 + .79], [c.x + .1, y0 + .9], [c.x - .06, y0 + .9]], c.hatc); } else bmOval(c.x - .01, y0 + .73, .12, .12, c.hatc);
    if (i === 1) bmLine([[c.x + .15, y0 + .5], [c.x + .4, y0 + .85 + .08 * Math.sin(t * 3)]], .07, c.skin); }); // one waves
  // wheels: car tyres under the hull
  for (const wx of [-2.0, 2.05]) { bmDot(wx, .42, .42, '#17120f'); bmDot(wx, .42, .2, '#8a8e92'); if (det) { g.strokeStyle = '#4a4e52'; g.lineWidth = bmW(.03); g.beginPath(); for (let i = 0; i < 5; i++) { const a = ang + i * TAU / 5; g.moveTo(wx, -.42); g.lineTo(wx + Math.cos(a) * .19, -.42 - Math.sin(a) * .19); } g.stroke(); } }
  // the hull: a black ribbed bottom, the green topsides, the bow raked up
  const HULL = [[-3.15, .62], [1.9, .55], [2.9, .85], [3.35, 1.35], [3.35, 1.58], [-3.1, 1.6]];
  bmFill(HULL, blk);
  if (det) { g.strokeStyle = 'rgba(120,124,128,.45)'; g.lineWidth = bmW(.025); for (const y of [.78, .92]) { g.beginPath(); g.moveTo(-3.1, -y); g.lineTo(2.2 + (y - .7) * 3, -y); g.stroke(); } }
  bmFill([[-3.12, 1.06], [2.55, 1.04], [3.3, 1.28], [3.35, 1.58], [-3.1, 1.6]], bmLG(0, 1.6, 0, 1.04, [green, greenD]));
  bmLine([[-3.12, 1.2], [3.3, 1.38]], .035, '#d8e8c8'); // the pale rub strip
  bmFill([[-3.15, 1.56], [3.36, 1.55], [3.36, 1.62], [-3.15, 1.63]], '#f2f0e8'); // the white gunwale cap
  // the cuddy cabin forward: a green roof and dark side windows, the windscreen frame
  bmFill([[.35, 1.6], [2.55, 1.6], [2.3, 2.15], [.55, 2.25]], green); bmFill([[.5, 2.22], [2.3, 2.13], [2.32, 2.2], [.48, 2.3]], '#2a2a2e');
  bmFill([[.75, 1.72], [1.45, 1.72], [1.45, 2.08], [.8, 2.12]], '#2a3a44'); bmFill([[1.6, 1.72], [2.25, 1.72], [2.12, 2.03], [1.6, 2.06]], '#2a3a44');
  if (det) bmFill([[.85, 2.0], [1.1, 2.08], [.9, 2.08]], 'rgba(200,220,230,.45)');
  bmLine([[.4, 2.25], [.25, 2.55]], .04, '#c4c8cc'); // windscreen post
  if (det) { bmLine([[2.55, 1.62], [2.7, 1.92], [3.3, 1.75]], .03, '#c8ccd0'); bmFill([[2.6, 1.58], [2.95, 1.58], [2.9, 1.66], [2.62, 1.66]], '#e8384a'); } // the bow rail, a red cleat panel
  // the burner standing on the bow, white cap, one arm on the canopy pole, swaying with the ride
  acPerson(2.0, 2.25, 1.72, { body: '#e8cfae', legs: '#f2f0ec', skin: '#e2b48c', hat: 'hair', hatc: '#f6f6f2', arms: 'one', dance: true }, t, .4, det);
  // the near bimini poles and the canopy: grey fabric, a soft droop between the bows
  for (const x of [-3.05, -.45]) bmLine([[x, 1.6], [x + .25, 3.05]], .05, '#d4d8dc');
  bmPath([[-3.25, 3.0], [-1.75, 3.18], [-.05, 3.06], [.05, 2.92], [-1.7, 2.98], [-3.2, 2.86]]); g.closePath(); g.fillStyle = bmLG(0, 3.2, 0, 2.85, ['#b8bcc0', '#8a8e94']); g.fill();
  if (det) { g.strokeStyle = 'rgba(70,72,78,.5)'; g.lineWidth = bmW(.02); g.beginPath(); g.moveTo(-3.2, -2.86); g.quadraticCurveTo(-1.7, -2.92, .05, -2.92); g.stroke(); }
  bmLine([[-.05, 3.0], [.6, 1.62]], .02, '#9aa0a6'); bmLine([[-3.2, 2.92], [-3.4, 1.62]], .02, '#9aa0a6'); // the canopy's straps down to the deck
  // the red swim ladder and its frame on the stern
  const red = '#e0403a'; bmLine([[-3.1, 1.15], [-3.6, 1.15], [-3.6, .95]], .06, red); bmLine([[-3.5, 1.15], [-3.45, .25]], .05, red); bmLine([[-3.2, 1.15], [-3.15, .25]], .05, red);
  for (let i = 0; i < 4; i++) { const y = .35 + i * .22; bmLine([[-3.47, y], [-3.16, y]], .04, red); }
  bmLine([[-3.1, 1.55], [-3.35, 1.9], [-3.35, 1.15]], .04, '#c8ccd0'); // the stern grab rail
  g.restore();
}
function btShadow(st, t) { const { X, Z, hx, hz } = st, at = (u, y) => [X + hx * u, y, Z + hz * u]; shadowOf([at(-3.5, 0), at(3.35, 0), at(-3.2, 3.05), at(.05, 3.05), at(3.3, 1.6), at(2.0, 4.0)], t); }

// ---------- 8. the Victorian house on wheels (draft 16, robin-2026-10-18/3.jpg and 7.jpg; about 9 m, front = +x) ----------
// A two-storey steampunk Victorian house on a wagon: a dark plank-and-iron ground floor on big spoked rear wheels and a
// small pair of front wheels; white clapboard upstairs under grey gables with iron cresting; a round turret with a domed
// cap and a green flag; a balcony at the back; portholes. The front is a bay-windowed cab, its arched windows framed in
// brass with a copper cornice, two gramophone horns and a smoke stack on the cab roof, lamps on its corners, a plank over
// the windows left blank but for a painted curl (no name). At night the windows and the lanterns glow.
function hsDraw(st, t, k, sq, lit) {
  const det = k > 9, ang = -st.sp / 1.0, wood = '#5a4232', woodD = '#3e2c22', white = '#e8e2d2', whiteD = '#bcb4a2', brass = '#c8a048', copper = '#b8703a', roof = '#7c8288', win = lit ? '#f4c870' : '#2a3038';
  g.save(); g.scale(sq, 1);
  // the far wheels and the chassis
  bmDot(-2.4, 1.0, .98, '#2a2018'); bmDot(3.55, .4, .38, '#2a2018');
  bmFill([[-4.2, .95], [4.3, .95], [4.3, 1.25], [-4.2, 1.25]], '#2e2420'); bmLine([[3.0, 1.0], [3.55, .4]], .12, '#3a3028');
  // ground floor: dark planks with iron straps, a door, the stair down at the back
  bmFill([[-4.0, 1.25], [3.05, 1.25], [3.05, 4.0], [-4.0, 4.0]], bmLG(0, 4, 0, 1.25, [wood, woodD]));
  if (det) { g.strokeStyle = 'rgba(20,14,10,.5)'; g.lineWidth = bmW(.03); g.beginPath(); for (let x = -3.7; x < 3; x += .45) { g.moveTo(x, -1.25); g.lineTo(x, -4.0); } g.stroke(); for (const x of [-3.0, -.6, 1.8]) bmLine([[x, 1.25], [x, 4.0]], .1, '#2a2622'); }
  bmFill([[-.2, 1.25], [.75, 1.25], [.75, 3.2], [.28, 3.45], [-.2, 3.2]], '#2a1e18'); if (det) bmDot(.62, 2.2, .05, brass);
  bmLine([[-4.0, 1.3], [-4.7, .3]], .07, '#4a3a2c'); if (det) for (let i = 1; i < 4; i++) { const u = i / 4; bmLine([[lerp(-4.0, -4.7, u) - .05, lerp(1.3, .3, u)], [lerp(-4.0, -4.7, u) + .35, lerp(1.3, .3, u)]], .05, '#4a3a2c'); }
  // the trim band between the floors
  bmFill([[-4.15, 3.95], [3.1, 3.95], [3.1, 4.2], [-4.15, 4.2]], brass);
  // upstairs: white clapboard, two gables, portholes
  bmFill([[-3.8, 4.2], [2.95, 4.2], [2.95, 6.7], [-3.8, 6.7]], bmLG(-3.8, 0, 2.9, 0, [white, white, whiteD]));
  if (det) { g.strokeStyle = 'rgba(120,110,96,.45)'; g.lineWidth = bmW(.02); g.beginPath(); for (let y = 4.4; y < 6.7; y += .2) { g.moveTo(-3.8, -y); g.lineTo(2.95, -y); } g.stroke(); }
  for (const [x0, x1] of [[-3.95, -1.0], [1.1, 3.1]]) { const mx = (x0 + x1) / 2; bmFill([[x0, 6.65], [x1, 6.65], [mx, 7.75]], roof); bmFill([[x0 + .35, 6.65], [x1 - .35, 6.65], [mx, 7.45]], bmShade(white, .9)); if (det) for (let i = 0; i < 7; i++) { const x = lerp(x0 + .2, x1 - .2, i / 6); bmLine([[x, 6.68], [x, 6.92]], .04, '#2e5a3a'); } }
  bmFill([[-1.0, 6.65], [1.1, 6.65], [1.1, 6.95], [-1.0, 6.95]], roof);
  for (const x of [-2.6, 2.1]) { bmDot(x, 5.45, .38, '#9aa2a8'); bmDot(x, 5.45, .28, lit ? win : '#d8dee2'); if (det && !lit) bmDot(x - .08, 5.53, .08, 'rgba(255,255,255,.7)'); }
  // the turret: a round tower through the roof, an arched window, a dome and a finial, the green flag
  bmFill([[-.55, 4.2], [.65, 4.2], [.65, 8.1], [-.55, 8.1]], bmLG(-.55, 0, .65, 0, [whiteD, white, whiteD]));
  bmFill([[-.6, 8.05], [.7, 8.05], [.7, 8.25], [-.6, 8.25]], brass);
  bmPath([[-.6, 8.25], [.7, 8.25], [.62, 8.7], [.35, 9.0], [.05, 9.08], [-.25, 9.0], [-.52, 8.7]]); g.closePath(); g.fillStyle = bmLG(-.6, 9, .7, 8.2, ['#8a9096', '#5e6468']); g.fill();
  bmPath([[-.15, 6.4], [.25, 6.4], [.25, 7.3], [.05, 7.55], [-.15, 7.3]]); g.closePath(); g.fillStyle = win; g.fill();
  bmLine([[.05, 9.05], [.05, 10.6]], .05, '#3a3a3a');
  const fl = Math.sin(t * 2.3) * .12; bmPath([[.08, 10.55], [1.2, 10.5 + fl], [2.05, 10.38 - fl * .5], [2.0, 9.72 - fl * .4], [1.1, 9.85 + fl], [.08, 9.85]]); g.closePath(); g.fillStyle = '#2f9a48'; g.fill();
  if (det) bmFill([[.7, 10.3], [1.1, 10.25], [1.0, 9.98], [.75, 10.02]], '#e8c44a'); // a gold device on the flag (a little harp-like shape, no letters)
  // the balcony at the back: a floor, turned balusters, a burner leaning on the rail
  bmFill([[-4.6, 4.15], [-3.8, 4.15], [-3.8, 4.3], [-4.6, 4.3]], wood);
  acPerson(-4.25, 4.3, 1.7, { body: '#3a3028', legs: '#2a2420', skin: '#c99a72', hat: 'hair', hatc: '#2a2018', arms: 'down' }, t, 1.3, det);
  bmLine([[-4.6, 5.15], [-3.8, 5.15]], .06, wood); if (det) for (let i = 0; i <= 4; i++) bmLine([[-4.6 + i * .2, 4.3], [-4.6 + i * .2, 5.15]], .035, woodD);
  // the bay-windowed cab at the front, its brass-framed arched windows, the copper cornice, the blank sign plank
  bmFill([[3.0, 1.25], [4.45, 1.3], [4.55, 2.6], [3.0, 2.6]], bmLG(0, 2.6, 0, 1.25, ['#d8ccb4', '#a8987c']));
  if (det) for (const x of [3.3, 3.95]) { bmFill([[x, 1.55], [x + .45, 1.55], [x + .45, 2.35], [x, 2.35]], '#b8a888'); bmFill([[x + .12, 1.75], [x + .33, 1.75], [x + .33, 2.15], [x + .12, 2.15]], '#4a6a4a'); }
  bmFill([[2.95, 2.6], [4.6, 2.6], [4.65, 2.72], [2.95, 2.72]], brass);
  bmFill([[3.0, 2.72], [4.55, 2.72], [4.5, 4.7], [3.0, 4.7]], '#4a3628');
  for (let i = 0; i < 3; i++) { const x0 = 3.08 + i * .49, x1 = x0 + .42; bmPath([[x0, 2.85], [x1, 2.85], [x1, 4.25], [(x0 + x1) / 2, 4.5], [x0, 4.25]]); g.closePath(); g.fillStyle = win; g.fill(); if (det) { g.strokeStyle = brass; g.lineWidth = bmW(.04); g.stroke(); } }
  if (det && !lit) { bmFill([[3.6, 2.9], [3.95, 2.9], [3.95, 3.55], [3.6, 3.55]], '#4f8a52'); bmOval(3.25, 3.4, .1, .12, '#c99a72'); } // a green shutter, the driver
  bmPath([[2.9, 4.7], [4.62, 4.7], [4.85, 4.95], [4.75, 5.15], [2.9, 5.2]]); g.closePath(); g.fillStyle = bmLG(0, 5.2, 0, 4.7, ['#d08a4a', copper, '#7a4422']); g.fill();
  bmFill([[3.05, 5.2], [4.55, 5.2], [4.55, 5.65], [3.05, 5.65]], '#2a2420'); bmLine([[3.05, 5.2], [4.55, 5.2], [4.55, 5.65], [3.05, 5.65], [3.05, 5.2]], .04, brass);
  if (det) { g.strokeStyle = brass; g.lineWidth = bmW(.035); g.beginPath(); g.moveTo(3.25, -5.42); g.bezierCurveTo(3.5, -5.62, 3.7, -5.22, 3.85, -5.42); g.bezierCurveTo(4.0, -5.62, 4.2, -5.25, 4.35, -5.45); g.stroke(); } // the blank plank: only a painted curl
  // on the cab roof: the smoke stack and the twin gramophone horns
  bmFill([[3.55, 5.65], [3.8, 5.65], [3.8, 7.1], [3.55, 7.1]], '#2a2a2c'); bmOval(3.675, 7.15, .2, .08, '#4a4a4c');
  for (const [hx, hy, dir] of [[3.25, 5.7, -1], [4.15, 5.7, 1]]) { bmLine([[hx, hy], [hx + dir * .15, hy + .7]], .1, '#9a9ea2');
    bmPath([[hx + dir * .1, hy + .65], [hx + dir * .65, hy + 1.05], [hx + dir * .45, hy + 1.5], [hx + dir * .02, hy + .8]]); g.closePath(); g.fillStyle = bmLG(hx, hy + 1.5, hx + dir * .6, hy + .7, ['#5a5e64', '#2a2c30']); g.fill();
    bmOval(hx + dir * .56, hy + 1.27, .13, .26, '#141416', dir * -.6); }
  // the corner lamps on brackets
  for (const lx of [3.0, 4.5]) { bmLine([[lx, 2.6], [lx + (lx > 4 ? .25 : -.25), 2.75]], .04, '#2a2420'); const x = lx + (lx > 4 ? .25 : -.25); bmFill([[x - .13, 2.45], [x + .13, 2.45], [x + .1, 2.85], [x - .1, 2.85]], lit ? '#ffe2a0' : '#4a4440'); bmFill([[x - .15, 2.85], [x + .15, 2.85], [x, 3.0]], '#2a2420'); }
  // the near wheels: big spoked iron-tyred rear wheels, small rubber front wheels
  const spoked = (cx, cy, r) => { g.beginPath(); g.arc(cx, -cy, r * .93, 0, TAU); g.strokeStyle = '#3a2c20'; g.lineWidth = bmW(r * .12); g.stroke(); g.beginPath(); g.arc(cx, -cy, r, 0, TAU); g.strokeStyle = '#1c1a18'; g.lineWidth = bmW(r * .06); g.stroke();
    g.strokeStyle = '#4a3a2a'; g.lineWidth = bmW(r * .06); g.beginPath(); for (let i = 0; i < 7; i++) { const a = ang + i * Math.PI / 7; g.moveTo(cx + Math.cos(a) * r * .9, -cy - Math.sin(a) * r * .9); g.lineTo(cx - Math.cos(a) * r * .9, -cy + Math.sin(a) * r * .9); } g.stroke(); bmDot(cx, cy, r * .14, '#2a2018'); };
  spoked(-1.7, 1.0, 1.0); bmDot(4.0, .38, .38, '#1c1a18'); bmDot(4.0, .38, .16, '#8a8a88');
  g.restore();
}
function hsShadow(st, t) { const { X, Z, hx, hz } = st, at = (u, y) => [X + hx * u, y, Z + hz * u]; shadowOf([at(-4.7, 0), at(4.6, 0), at(-4.0, 6.7), at(2.95, 6.7), at(-2.5, 7.7), at(2.1, 7.7), at(.05, 9.1), at(4.5, 6.9)], t); shadowStick(X + hx * .05, 0, 10.6, Z + hz * .05, .06, t); }
function hsGlow(st, t, k, sq) { // the night layer: the lit house again, then soft halos round the lanterns and the windows
  hsDraw(st, t, k, sq, true);
  g.save(); g.scale(sq, 1);
  const halo = (x, y, r, a) => { const rg = g.createRadialGradient(x, -y, 0, x, -y, r); rg.addColorStop(0, `rgba(255,214,140,${a})`); rg.addColorStop(1, 'rgba(255,180,90,0)'); g.fillStyle = rg; g.fillRect(x - r, -y - r, 2 * r, 2 * r); };
  for (const x of [2.75, 4.75]) halo(x, 2.65, .9, .55 + .1 * Math.sin(t * 3 + x));
  halo(3.8, 3.6, 1.6, .25); halo(.05, 6.9, 1.0, .3); for (const x of [-2.6, 2.1]) halo(x, 5.45, .8, .3);
  g.restore();
}

// ---------- 9. the heart sound bus (draft 16, robin-2026-10-18/13-16; about 17 m with its outriggers, front = +x) ----------
// The famous dawn sound camp: an old bus carrying a flat deck, a wall of round black woofers down its side, tall stacks of
// grey horn cabinets out on outrigger arms at both ends and black stacks by the deck, a DJ booth on the deck crowded with
// dancers, arms up, and above the DJ a giant wire-frame heart on a scaffold with people climbing it. A long banner panel
// across the deck front carries an abstract wave pattern. At night the heart's string lights glow and the dancers go to
// silhouette; a small crowd dances at its foot.
const HR_HEART = (() => { const o = []; for (let i = 0; i <= 40; i++) { const a = i / 40 * TAU, x = 16 * Math.sin(a) ** 3, y = 13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a); o.push([x * .17, 10.9 + (y + 17) * .17]); } return o; })();
function hrPeople(xs, y, t, lit, det, seed) { xs.forEach((x, i) => { const c = AP_COLS_HR[(i + seed) % AP_COLS_HR.length]; acPerson(x, y, 1.7, lit ? { body: '#1a1418', legs: '#141014', skin: '#2a2024', hat: 'hair', hatc: '#141014', arms: i % 3 ? 'up' : 'one', dance: true } : { body: c, legs: '#3a3040', skin: ['#e8cfae', '#c99a72', '#8a5a3c'][i % 3], hat: 'hair', hatc: '#3a2418', arms: i % 3 ? 'up' : 'one', dance: true }, t, i * .37 + seed, det); }); }
const AP_COLS_HR = ['#d8452f', '#f2ede0', '#e8b23a', '#2f6fb5', '#c7362b', '#7a3c8c', '#ee9a42'];
function hrDraw(st, t, k, sq, lit) {
  const det = k > 6, grey = lit ? '#4a4a50' : '#c8c8c6', greyD = lit ? '#2e2e34' : '#9a9a98', blk = '#1e1c20';
  g.save(); g.scale(sq, 1);
  // the crowd at its foot (behind the near wheels), the bus body, the woofer wall
  hrPeople([-6.5, -5.7, 6.2, 7.0], 0, t, lit, det, 3);
  bmDot(-3.6, .55, .55, '#17120f'); bmDot(3.4, .55, .55, '#17120f');
  bmFill([[-6.0, .6], [5.6, .6], [5.9, 3.9], [-6.0, 3.9]], lit ? '#2a2628' : '#d8d2c4'); bmFill([[4.4, 1.6], [5.7, 1.6], [5.8, 3.3], [4.4, 3.3]], lit ? '#f0c070' : '#3a4a52'); // the cab windscreen
  bmFill([[-4.6, .9], [4.2, .9], [4.2, 3.8], [-4.6, 3.8]], blk);
  for (let r = 0; r < 2; r++) for (let j = 0; j < 9; j++) { const x = -4.1 + j * .98, y = 1.6 + r * 1.35; bmDot(x, y, .44, '#3a383c'); bmDot(x, y, .3, '#141216'); if (det) bmDot(x, y, .1, '#5a585c'); }
  // outriggers and the grey horn stacks at both ends
  for (const s of [-1, 1]) { const x0 = s * 6.0, x1 = s * 8.6; bmLine([[x0, 1.0], [x1, 4.8]], .14, '#6a6a6a'); bmLine([[x0, 4.5], [x1, 4.8]], .14, '#6a6a6a');
    bmFill([[x1 - 1.5, 4.8], [x1 + 1.5, 4.8], [x1 + 1.5, 8.6], [x1 - 1.5, 8.6]], grey);
    if (det) for (let r = 0; r < 4; r++) for (let j = 0; j < 3; j++) bmFill([[x1 - 1.4 + j * .97, 4.9 + r * .93], [x1 - .5 + j * .97, 4.9 + r * .93], [x1 - .62 + j * .97, 5.65 + r * .93], [x1 - 1.28 + j * .97, 5.65 + r * .93]], greyD); }
  // the deck, the banner across its front, the black stacks
  bmFill([[-6.2, 3.9], [6.0, 3.9], [6.0, 4.3], [-6.2, 4.3]], '#3a3a3e');
  bmFill([[-5.2, 4.3], [5.2, 4.3], [5.2, 5.6], [-5.2, 5.6]], lit ? '#2a1830' : '#e8e2d8');
  if (det) { g.save(); bmPath([[-5.2, 4.3], [5.2, 4.3], [5.2, 5.6], [-5.2, 5.6]]); g.closePath(); g.clip(); for (let j = 0; j < 7; j++) { const ph = t * .8 + j; g.strokeStyle = lit ? `hsla(${(j * 50 + t * 30) % 360},80%,60%,.9)` : ['#d8452f', '#e8b23a', '#2f6fb5', '#7a3c8c'][j % 4]; g.lineWidth = bmW(.14); g.beginPath(); for (let x = -5.2; x <= 5.2; x += .2) { const y = 4.5 + j * .17 + .12 * Math.sin(x * 1.4 + ph); x < -5.1 ? g.moveTo(x, -y) : g.lineTo(x, -y); } g.stroke(); } g.restore(); } // abstract waves, no face
  for (const x of [-5.7, 5.5]) { bmFill([[x - .45, 4.3], [x + .45, 4.3], [x + .45, 7.2], [x - .45, 7.2]], blk); if (det) for (let r = 0; r < 4; r++) bmDot(x, 4.75 + r * .7, .28, '#3a383c'); }
  // dancers on the deck, the DJ booth, the scaffold, the heart and its climbers
  hrPeople([-4.6, -3.9, -3.2, -2.4, 2.4, 3.1, 3.8, 4.6], 5.6, t, lit, det, 0);
  bmFill([[-1.4, 5.6], [1.4, 5.6], [1.4, 6.6], [-1.4, 6.6]], blk); acPerson(0, 5.6, 1.75, { body: lit ? '#1a1418' : '#2a2428', legs: '#141014', skin: lit ? '#2a2024' : '#c99a72', hat: 'cowboy', hatc: '#6a4a30', arms: 'one', dance: true }, t, .2, det);
  for (const x of [-1.8, 1.8]) bmLine([[x, 5.6], [x, 9.4]], .1, '#8a7a5a'); bmLine([[-1.9, 9.4], [1.9, 9.4]], .12, '#8a7a5a'); if (det) { bmLine([[-1.8, 6.6], [1.8, 9.4]], .05, '#8a7a5a'); bmLine([[1.8, 6.6], [-1.8, 9.4]], .05, '#8a7a5a'); }
  bmLine([[0, 9.4], [0, 10.9]], .1, '#9a9a98');
  bmLine(HR_HEART, .16, lit ? '#e8c890' : '#b8bcc0'); if (det) { g.save(); bmPath(HR_HEART); g.closePath(); g.clip(); g.strokeStyle = lit ? 'rgba(232,200,144,.7)' : 'rgba(150,154,160,.8)'; g.lineWidth = bmW(.04); g.beginPath(); for (let x = -2.8; x <= 2.8; x += .55) { g.moveTo(x, -10.6); g.lineTo(x * .4, -17); } for (let y = 11.5; y < 16.5; y += .7) { g.moveTo(-3, -y); g.lineTo(3, -y); } g.stroke(); g.restore(); }
  hrPeople([-1.4, 1.5], 12.6, t, lit, det, 5); hrPeople([.1], 14.9, t, lit, det, 2);
  g.restore();
}
function hrShadow(st, t) { const { X, Z, hx, hz } = st, at = (u, y) => [X + hx * u, y, Z + hz * u]; shadowOf([at(-10.1, 4.8), at(10.1, 4.8), at(-10.1, 8.6), at(10.1, 8.6), at(-6, 0), at(6, 0), at(-2.8, 15), at(2.8, 15), at(0, 16.8)], t); }
function hrGlow(st, t, k, sq) { hrDraw(st, t, k, sq, true); g.save(); g.scale(sq, 1); const s = Math.max(.08, 1.5 / k);
  HR_HEART.forEach(([x, y], i) => { const tw = .65 + .35 * Math.sin(t * 2.4 + i * 1.3); bmFill([[x - s, y - s], [x + s, y - s], [x + s, y + s], [x - s, y + s]], `rgba(255,${200 + (i % 3) * 18},${130 + (i % 2) * 50},${.95 * tw})`); });
  const rg = g.createRadialGradient(0, -13.5, 0, 0, -13.5, 5); rg.addColorStop(0, 'rgba(255,170,110,.3)'); rg.addColorStop(1, 'rgba(255,150,90,0)'); g.fillStyle = rg; g.fillRect(-5, -18.5, 10, 10);
  for (let j = 0; j < 12; j++) { const x = -5.6 + j * 1.02; bmFill([[x - s, 3.95], [x + s, 3.95], [x + s, 3.95 + 2 * s], [x - s, 3.95 + 2 * s]], `hsla(${(j * 40 + t * 40) % 360},85%,62%,.9)`); }
  g.restore(); }

// ---------- 6. the spin-refrain whirl's cars (installs.js whirlItems): one of each, never a design twice ----------
// Robin: art cars are unique. The whirl's car slots are fixed vehicles (slot 0 the teal fish, drawn in installs.js; then
// these): the organ cart and the horse bike above (the same individuals as their bridge cameos, never on screen twice),
// and three more one-offs: a spinning teacup with a soft handle, Dali's shoe as a stiletto car, and a rhinoceros.
function tcDraw(t, k, i) { // a giant porcelain teacup on its saucer, two riders inside, a spoon for a mast; it spins (the pattern runs round)
  const det = k > 10, spin = t * 1.4 + i;
  for (const wx of [-1.4, 1.4]) { bmDot(wx, .26, .26, '#17120f'); bmDot(wx, .26, .1, '#8a8278'); }
  bmOval(0, .55, 2.25, .3, bmLG(0, .85, 0, .25, ['#fbf8f0', '#d8d2c4'])); bmOval(0, .62, 1.6, .16, '#c8c0b0'); // saucer
  // the soft handle, melting down the back of the cup
  g.strokeStyle = '#f2ede2'; g.lineWidth = bmW(.22); g.lineCap = 'round'; g.beginPath(); g.moveTo(-1.45, -2.2); g.bezierCurveTo(-2.5, -2.3, -2.4, -1.3, -1.7, -1.15); g.quadraticCurveTo(-1.9, -.95, -2.0, -.7); g.stroke();
  bmOval(-2.0, .66, .12, .16, '#f2ede2'); // the drip
  const riders = [[-.5, '#d8452f', '#e8cfae'], [.45, '#2f6fb5', '#8a5a3c']];
  for (const [x, col, skin] of riders) { bmFill([[x - .2, 2.2], [x + .2, 2.2], [x + .16, 2.65], [x - .16, 2.65]], col); bmOval(x, 2.85, .13, .15, skin); bmLine([[x + .15, 2.55], [x + .3 + .1 * Math.sin(t * 4 + x), 3.0]], .07, col); }
  bmPath([[-1.6, 2.55], [1.6, 2.55], [1.35, 1.0], [.9, .7], [-.9, .7], [-1.35, 1.0]]); g.closePath(); g.fillStyle = bmLG(-1.6, 0, 1.6, 0, ['#fdfbf6', '#f0ebe0', '#c8c2b4']); g.fill();
  g.save(); bmPath([[-1.6, 2.55], [1.6, 2.55], [1.35, 1.0], [.9, .7], [-.9, .7], [-1.35, 1.0]]); g.closePath(); g.clip(); // the blue band of willow pattern, running round as it spins
  g.fillStyle = '#2f5fa8'; g.fillRect(-1.7, -2.05, 3.4, .32); if (det) { for (let j = 0; j < 9; j++) { const u = ((j / 9 + spin * .08) % 1), x = -1.5 + u * 3.0, w = Math.sin(u * Math.PI); bmOval(x, 1.42, .16 * w + .02, .14, '#2f5fa8'); bmOval(x, 1.42, .07 * w + .01, .06, '#fbf8f0'); } }
  g.restore();
  bmLine([[-1.6, 2.55], [1.6, 2.55]], .07, '#d9b45a'); // gold rim
  bmLine([[1.0, 2.4], [1.5, 4.4]], .07, '#c8ccd0'); bmOval(1.55, 4.55, .16, .24, '#c8ccd0', -.25); // the spoon mast
  bmFill([[1.5, 4.3], [2.4, 4.15 + Math.sin(t * 5 + i) * .08], [1.48, 3.95]], '#e8b23a');
}
function shDraw(t, k, i) { // Dali's shoe as an art car: a red stiletto, toe forward on wheels, its heel a spike to a single caster, a rider in the vamp
  const det = k > 10;
  bmDot(1.6, .28, .28, '#17120f'); bmDot(.6, .28, .28, '#17120f'); bmDot(-1.85, .13, .13, '#17120f');
  bmFill([[-1.95, .25], [-1.75, .25], [-1.55, 1.9], [-1.95, 1.95]], bmLG(-2, 2, -1.6, .3, ['#c8202a', '#7a0e16'])); // the heel
  bmPath([[-2.0, 1.95], [-1.0, 1.7], [.2, .9], [1.4, .6], [2.25, .65], [2.45, 1.05], [2.0, 1.55], [.9, 1.9], [-.2, 2.25], [-1.5, 2.55], [-2.05, 2.45]]); g.closePath(); g.fillStyle = bmLG(0, 2.6, 0, .6, ['#e8404a', '#c8202a', '#8a1018']); g.fill();
  bmPath([[-1.6, 2.5], [-.2, 2.2], [.3, 2.0], [-1.6, 2.15]]); g.closePath(); g.fillStyle = '#4a0a10'; g.fill(); // the opening
  bmFill([[1.4, .6], [2.25, .65], [2.3, .75], [1.4, .7]], '#1c1a1e'); // sole
  if (det) { bmOval(.75, 1.82, .22, .16, '#d9b45a'); bmOval(.75, 1.82, .1, .07, '#8a1018'); g.strokeStyle = 'rgba(255,220,220,.4)'; g.lineWidth = bmW(.05); g.beginPath(); g.moveTo(-1.2, -2.35); g.quadraticCurveTo(.4, -2.0, 1.9, -1.35); g.stroke(); }
  // the rider sits in the shoe under a black parasol
  bmFill([[-1.05, 2.2], [-.65, 2.2], [-.7, 2.85], [-1.05, 2.85]], '#f2ede2'); bmOval(-.85, 3.05, .14, .16, '#e8cfae'); bmLine([[-.95, 3.0], [-.72, 3.0]], .05, '#2a2420');
  bmLine([[-.7, 2.75], [-.4, 3.0], [-.35, 3.9]], .07, '#f2ede2'); bmLine([[-.35, 3.0], [-.35, 4.05]], .03, '#2a2420');
  g.beginPath(); g.moveTo(-1.25, -4.0); g.quadraticCurveTo(-.35, -4.7, .55, -4.0); g.closePath(); g.fillStyle = '#1c1a1e'; g.fill();
}
function rhDraw(t, k, i) { // a rhinoceros art car (Dali's rhinoceros): grey hide in plates, Dali's horn shapes on its flank, a howdah and rider
  const det = k > 10, step = Math.sin(t * 3 + i) * .05, hide = bmLG(0, 2.8, 0, .6, ['#a8a49c', '#86827a', '#5e5a54']);
  for (const [lx, ph] of [[-1.5, 0], [1.2, 1.6]]) { bmFill([[lx - .3, 1.1], [lx + .3, 1.1], [lx + .26 + step * Math.sin(ph), .45], [lx - .26, .45]], '#6e6a62'); bmDot(lx, .25, .25, '#17120f'); }
  bmPath([[-2.4, 1.1], [-2.55, 1.9], [-2.0, 2.6], [-.6, 2.95], [.8, 2.8], [1.5, 2.45], [1.8, 2.15], [1.75, 1.2], [1.2, .95], [-1.9, .9]]); g.closePath(); g.fillStyle = hide; g.fill(); // the barrel body with its hump
  bmPath([[1.4, 2.35], [2.0, 2.4], [2.7, 2.0], [3.35, 1.55], [3.45, 1.15], [3.0, .95], [2.3, 1.0], [1.6, 1.15]]); g.closePath(); g.fillStyle = bmLG(1.5, 2.4, 3.4, 1.0, ['#a29e96', '#7a766e']); g.fill(); // the long low head
  bmFill([[3.05, 1.5], [3.25, 2.75], [3.5, 1.4]], '#efe8d4'); bmFill([[2.5, 1.95], [2.6, 2.45], [2.8, 1.85]], '#e2dac4'); // the great horn and the small one
  bmFill([[1.75, 2.35], [1.85, 2.85], [2.05, 2.35]], '#6e6a62'); bmDot(2.45, 1.75, .06, '#1c1a1e'); bmLine([[3.3, 1.2], [3.45, 1.15]], .04, '#3a3630'); // ear, eye, mouth
  g.strokeStyle = 'rgba(40,36,32,.5)'; g.lineWidth = bmW(.05); g.beginPath(); g.moveTo(1.55, -2.4); g.quadraticCurveTo(1.85, -1.7, 1.6, -1.1); g.stroke(); // the neck fold
  if (det) { g.strokeStyle = 'rgba(40,36,32,.45)'; g.lineWidth = bmW(.04); for (const x of [-1.3, .1]) { g.beginPath(); g.moveTo(x, -2.85); g.quadraticCurveTo(x + .3, -1.8, x, -.95); g.stroke(); }
    for (let j = 0; j < 5; j++) { const x = -1.9 + j * .62, y = 1.6 + (j % 2) * .25; bmFill([[x, y - .22], [x + .16, y], [x, y + .22], [x - .05, y]], 'rgba(232,224,204,.75)'); } } // Dali's little horns all over the hide
  bmFill([[-1.6, 2.8], [.2, 2.85], [.1, 3.4], [-1.5, 3.4]], '#c7362b'); bmFill([[-1.75, 3.4], [.3, 3.4], [-.7, 4.1]], '#d9b45a'); bmLine([[-1.6, 3.4], [-1.6, 2.8]], .04, '#d9b45a'); bmLine([[.15, 3.4], [.15, 2.85]], .04, '#d9b45a');
  bmFill([[-.95, 2.85], [-.55, 2.85], [-.6, 3.3], [-.92, 3.3]], '#47c1ba'); bmOval(-.75, 3.45, .13, .15, '#c99a72');
  g.strokeStyle = '#5e5a54'; g.lineWidth = bmW(.08); g.beginPath(); g.moveTo(-2.5, -2.0); g.quadraticCurveTo(-2.95, -1.8, -2.85, -1.3 + Math.sin(t * 4) * .1); g.stroke(); // tail
}
function acWhirlCar(kind, k, t, i) { // called by installs.js artCar inside its transform (origin on the ground, facing +x)
  const st = { sp: t * 3, v: 3, a: 1, night: 0 };
  bmBegin(0, 0, k, 1);
  if (kind === 'organ') ogDraw(st, t, k, 1); else if (kind === 'horse') hbDraw(st, t, k, 1);
  else if (kind === 'teacup') tcDraw(t, k, i); else if (kind === 'shoe') shDraw(t, k, i); else if (kind === 'rhino') rhDraw(t, k, i);
  g.restore();
}

// ---------- per frame ----------
const AC_KIND = {
  dragon: { draw: (st, t, k, sq) => drDraw(st, t, k, sq, false), shadow: drShadow, glow: drGlow },
  galleon: { draw: (st, t, k, sq) => gaDraw(st, t, k, sq, st.night > .3), shadow: gaShadow, glow: gaGlow },
  organ: { draw: ogDraw, shadow: ogShadow }, horse: { draw: hbDraw, shadow: hbShadow }, chopper: { draw: (st, t, k, sq) => chDraw(st, t, k, sq, 1), shadow: chShadow },
  boat: { draw: btDraw, shadow: btShadow }, house: { draw: (st, t, k, sq) => hsDraw(st, t, k, sq, false), shadow: hsShadow, glow: hsGlow },
  heart: { draw: (st, t, k, sq) => hrDraw(st, t, k, sq, st.night > .5), shadow: hrShadow, glow: hrGlow },
};
const AC_F = { t: NaN, items: [] }, AC_LC = mkCanvas(), acLg = AC_LC.getContext('2d'), AC_MC = mkCanvas(), acMg = AC_MC.getContext('2d');
function acBox(p, k, sz) { const x0 = Math.max(0, Math.floor(p[0] - (sz[0] + .5) * k)), x1 = Math.min(W, Math.ceil(p[0] + (sz[0] + .5) * k)), y0 = Math.max(0, Math.floor(p[1] - (sz[1] + .5) * k)), y1 = Math.min(H, Math.ceil(p[1] + .6 * k));
  return x1 - x0 < 2 || y1 - y0 < 2 ? null : [x0, y0, x1 - x0, y1 - y0]; }
function acMaskB(t) { // after everything nearer is drawn: 1 where each lit car still shows
  if (AC_F.t !== t) return;
  for (const it of AC_F.items) { const [x0, y0, w, h] = it.box, A = it.A, B = g.getImageData(x0, y0, w, h).data, M = acMg.createImageData(w, h), m = M.data;
    for (let i = 0; i < A.length; i += 4) { const dd = Math.abs(A[i] - B[i]) + Math.abs(A[i + 1] - B[i + 1]) + Math.abs(A[i + 2] - B[i + 2]); m[i] = m[i + 1] = m[i + 2] = 255; m[i + 3] = dd > 6 ? 0 : 255; }
    it.M = M; it.A = null; }
}
function artcarsGlow(t) { // after the grade: the night lights, masked to where each car still shows
  if (AC_F.t !== t) return;
  for (const it of AC_F.items) { if (!it.M) continue; const [bx, by, bw, bh] = it.box, { p, k, d, sq, st, e } = it;
    acLg.setTransform(1, 0, 0, 1, 0, 0); acLg.globalCompositeOperation = 'source-over'; acLg.globalAlpha = 1; acLg.clearRect(bx, by, bw, bh);
    const g0 = g; g = acLg; bmBegin(p[0], p[1], k, d); AC_KIND[e.kind].glow(st, t, k, sq); g.restore(); g = g0;
    acMg.clearRect(bx, by, bw, bh); acMg.putImageData(it.M, bx, by);
    acLg.globalCompositeOperation = 'destination-in'; acLg.drawImage(AC_MC, bx, by, bw, bh, bx, by, bw, bh); acLg.globalCompositeOperation = 'source-over';
    g.save(); g.globalAlpha = st.a * st.night * (e.kind === 'dragon' ? .82 : .9); g.drawImage(AC_LC, bx, by, bw, bh, bx, by, bw, bh); g.restore(); }
}
// render.js should call artcarsGlow(t) right after drumGlow(t) (after the grade) and list 'artcarsFront' in FRONT_HOOKS.
// Until it does, the glow rides on drumGlow (as the octopus does) and the front hook adds itself to FRONT_HOOKS.
let AC_HOOKED = false;
function acHook() { if (AC_HOOKED) return; AC_HOOKED = true; const src = typeof render === 'function' ? String(render) : '';
  if (!src.includes('artcarsGlow') && typeof drumGlow === 'function') { const dg = drumGlow; drumGlow = function (t) { dg(t); artcarsGlow(t); }; }
  if (typeof FRONT_HOOKS !== 'undefined' && !FRONT_HOOKS.includes('artcarsFront')) FRONT_HOOKS.push('artcarsFront'); }
function artcarsInto(t, list) {
  acHook(); AC_F.t = t; AC_F.items = []; let lit = false;
  for (const e of ARTCARS) { if (e.front) continue; if (acEntry(e, t, list)) lit = true; }
  if (lit) list.push({ z: .305, draw: () => acMaskB(t) });
}
function artcarsFront(t) { const l = []; for (const e of ARTCARS) if (e.front) acEntry(e, t, l); l.sort((a, b) => b.z - a.z); for (const o of l) { o.shadow(); o.draw(); } } // over the car layer
function shadowAt(st, h, sv) { const q = shadowPt(st.X, h, st.Z, sv); return q[2] > .3 ? q : null; } // the screen point where the top of the car's shadow lands
function acEntry(e, t, list) { // push one appearance into list; true when it wants the night glow
  {
    const st = acState(e, t); if (!st) return false; const p = P(st.X, 0, st.Z), sz = AC_SIZE[e.kind];
    // draft 11: no car fades on screen any more; the near fade below only ever acts if a path comes within ~8 m of the lens,
    // and the note tells the actor check (tools/check-actors.mjs) exactly what is drawn, so a blink would show up there
    const a = st.a * (e.kind === 'organ' || e.kind === 'horse' ? bmFade(p) : e.kind === 'chopper' ? clamp((p[2] - 1.6) / 1.2) : 1), drawn = p[2] >= 1.2 && kAt(p) >= .5;
    ACT.note('artcars:' + e.id, st.X, st.Z, AC_R[e.kind], { h: sz[1], a: drawn ? a : 0, group: 'artcars' });
    if (!drawn || a <= .01) return false; const k = kAt(p);
    // off frame: the car and the tip of its shadow both past the same edge (draft 10 dropped Robin's shadow a frame after him)
    const sv = sunVec(t), sp = shadowAt(st, sz[1], sv), m = sz[0] * k * 1.2 + 40;
    const offL = p[0] < -m && (!sp || sp[0] < -40), offR = p[0] > W + m && (!sp || sp[0] > W + 40);
    if (offL || offR || p[1] - sz[1] * k > H || p[1] < -60) return false;
    const ah = P(st.X + st.hx, 0, st.Z + st.hz), d = Math.sign(ah[0] - p[0]) || 1, vx = st.X - C.x, vz = st.Z - C.z, sq = AC_SIZE[e.kind][0] < 3 ? 1 : Math.max(.42, Math.abs(st.hx * vz - st.hz * vx) / (Math.hypot(vx, vz) || 1)); // small ones stay side on, like playa.js's riders
    const K = AC_KIND[e.kind], wantGlow = K.glow && st.night > .02;
    list.push({ z: p[2], draw: () => { const q = P(st.X, 0, st.Z), kk = kAt(q); bmBegin(q[0], q[1], kk, d); if (a < 1) g.globalAlpha = a; K.draw(st, t, kk, sq); g.restore();
        if (wantGlow) { const box = acBox(q, kk, sz); if (box) AC_F.items.push({ e, st, p: q, k: kk, d, sq, box, A: g.getImageData(box[0], box[1], box[2], box[3]).data }); } },
      shadow: () => K.shadow(st, t) });
    return wantGlow;
  }
}
