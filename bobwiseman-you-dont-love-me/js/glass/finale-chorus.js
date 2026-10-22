// Draft 13 (Bob, 2026-10-19, on draft 12 at 3:30: "I like B more but I want even more characters to enter the screen.
// I do not like seeing them at the end small and dancing. I would like to see more background characters enter singing
// the beegees, like the eric idle, or dogs, horses, electricians and plumbers."): version B's faces stay in to the end
// (pip-finale.js, PF_VARIANT 'C': no walk in, no dancing), and seven more heads join them, one every two beats from
// 199.48, each sticking its head in from an edge and singing with the backing voices: a shaggy gent in tweed (the
// bridge host's type, bridge-show.js; invented, not a portrait), a basset hound, a bay horse looking down over the top
// edge, an electrician in a hard hat, an old plumber in a flat cap, a poodle and a grey horse. All of them bob to the
// beat through the instrumental and duck out one by one, the last in first, from 228.40, before the light goes.
// Screen space, drawn with the finale's faces (main.js), lit like them. Needs bridge-trio.js, pip-heads.js and
// pip-finale.js loaded first. Pure function of song time t.

// Slots: head centre (screen px), rot (tilt of the whole figure), from (unit vector from the head to the edge it comes
// in from), ti / to (in and out times), sc (size). Order = the order they arrive.
const CH_SLOTS = [
  { who: 'knight', x: 470, y: H - 196, rot: .07, from: [0, 1], ti: PF_B[6], to: PF_B[51], sc: 1.12 }, // draft 15: was the gent
  { who: 'basset', x: 1420, y: H - 150, rot: -.08, from: [0, 1], ti: PF_B[8], to: PF_B[50] + .34, sc: 1.1 },
  { who: 'horse', x: 690, y: 250, rot: -.06, from: [0, -1], ti: PF_B[10], to: PF_B[50], sc: 1.12 },
  { who: 'sparky', x: W - 150, y: H * .40, rot: -1.22, from: [1, 0], ti: PF_B[12], to: PF_B[49] + .34, sc: 1.05 },
  { who: 'plumber', x: 800, y: H - 150, rot: -.05, from: [0, 1], ti: PF_B[14], to: PF_B[49], sc: 1.08 },
  { who: 'poodle', x: 1110, y: H - 160, rot: .08, from: [0, 1], ti: PF_B[16], to: PF_B[48] + .34, sc: 1.05 },
  { who: 'grey', x: 1250, y: 230, rot: .06, from: [0, -1], ti: PF_B[18], to: PF_B[48], sc: 1.05 },
];

const CH = {
  skin: [240, 204, 176], skin2: [214, 160, 124], mouth: [70, 16, 20], tooth: [246, 242, 230], tongue: [214, 92, 104],
  tweed: [128, 92, 60], tweed2: [98, 66, 42], hair: [176, 132, 76], shirt: [196, 214, 232], tie: [124, 26, 44],
  hat: [236, 190, 40], navy: [44, 56, 96], cable: [226, 112, 38],
  cap: [104, 92, 80], denim: [62, 92, 150], check: [176, 40, 44], tache: [196, 190, 182],
  hound: [192, 134, 78], hound2: [112, 64, 34], white: [240, 234, 222], collar: [168, 30, 40],
  poodle: [244, 236, 232], bow: [232, 120, 168],
  bay: [138, 76, 40], bay2: [52, 30, 22], grey: [196, 196, 200], grey2: [120, 120, 128], muzzle: [70, 54, 52],
};
function chStar(x, y, r) { const pts = []; for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r * .45 : r; pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); } return polyPath(pts); }
function chEye(g, x, y, r, look = [0, 0]) { // white, iris, pupil, outline
  g.fillStyle = 'rgba(244,240,228,1)'; g.beginPath(); g.ellipse(x, y, r * 1.3, r, 0, 0, TAU); g.fill();
  g.fillStyle = 'rgba(40,30,24,1)'; g.beginPath(); g.arc(x + look[0] * r * .4, y + look[1] * r * .3, r * .62, 0, TAU); g.fill();
  g.fillStyle = 'rgba(255,255,255,.85)'; g.beginPath(); g.arc(x + look[0] * r * .4 - r * .22, y - r * .25, r * .2, 0, TAU); g.fill();
  paint(g, 2.6, .9); g.beginPath(); g.ellipse(x, y, r * 1.3, r, 0, 0, TAU); g.stroke();
}
function chLid(g, x, y, r, lid, col) { // a lid drawn down over an eye, its edge a line
  if (lid <= .02) return;
  g.save(); g.beginPath(); g.ellipse(x, y, r * 1.34, r * 1.04, 0, 0, TAU); g.clip();
  g.fillStyle = rgb(col); g.fillRect(x - r * 1.5, y - r * 1.2, r * 3, r * 2.2 * lid);
  g.restore(); paint(g, 3, .9); g.beginPath(); g.moveTo(x - r * 1.3, y - r + r * 2 * lid); g.quadraticCurveTo(x, y - r * 1.1 + r * 2 * lid, x + r * 1.3, y - r + r * 2 * lid); g.stroke();
}
function chHumanMouth(g, y, w, m) { // a singing mouth: dark oval, top teeth, tongue at the bottom
  const h = 4 + 26 * m, p = ellPath(0, y + h / 2 - 2, w * (.8 + .25 * m), h / 2 + 1);
  g.fillStyle = rgb(CH.mouth, .96); g.fill(p);
  g.save(); g.clip(p); g.fillStyle = rgb(CH.tooth); g.fillRect(-w, y - 4, 2 * w, 5 + 2 * m);
  g.fillStyle = rgb(CH.tongue); g.beginPath(); g.ellipse(0, y + h + 2, w * .6, 7 * m + 1, 0, 0, TAU); g.fill(); g.restore();
  paint(g, 3, .85); g.stroke(p);
}
function chFace(g, seed, o) { // a man's face (rx, ry), ears, nose, eyes and a singing mouth; o.brow lifts the brows
  const { rx, ry, m } = o;
  for (const sd of [-1, 1]) pane(g, ellPath(sd * rx * .98, 6, 13, 20), CH.skin, seed + 3 + sd, { ew: 8, shade: .3, lw: 5 });
  pane(g, ellPath(0, 0, rx, ry), CH.skin, seed, { ew: 24, shade: .26, lw: 7 });
  g.fillStyle = 'rgba(232,120,120,.3)'; for (const sd of [-1, 1]) { g.beginPath(); g.arc(sd * rx * .58, ry * .32, rx * .2, 0, TAU); g.fill(); }
  for (const sd of [-1, 1]) {
    chEye(g, sd * rx * .38, -ry * .1, 7, [0, -.2]);
    const by = -ry * .36 - (o.brow || 0) * (4 + 6 * m);
    paint(g, 4.2, .85); g.beginPath(); g.moveTo(sd * rx * .2, by + 3); g.quadraticCurveTo(sd * rx * .38, by - 6, sd * rx * .58, by + 2); g.stroke();
  }
  paint(g, 3, .7); g.beginPath(); g.moveTo(-2, -ry * .08); g.quadraticCurveTo(-7, ry * .22, -9, ry * .3); g.quadraticCurveTo(0, ry * .37, 9, ry * .3); g.stroke();
}

// ---- the gent (the bridge host's type: shaggy hair to the collar, a fringe, sideburns, tweed and a wide tie) ----
function chGent(g, m) {
  // shoulders: tweed jacket, shirt, wide tie
  pane(g, polyPath([[-60, 74], [-170, 120], [-210, 420], [210, 420], [170, 120], [60, 74]]), CH.tweed, 9901, { ew: 34, shade: .34, lw: 8 });
  pane(g, polyPath([[-40, 72], [40, 72], [0, 190]]), CH.shirt, 9902, { ew: 8, shade: .12, lw: 5 });
  for (const sd of [-1, 1]) pane(g, polyPath([[sd * 40, 72], [sd * 86, 82], [sd * 66, 210], [0, 236], [0, 190]]), CH.tweed2, 9903 + sd, { ew: 10, shade: .25, lw: 5 });
  pane(g, polyPath([[-13, 76], [13, 76], [10, 96], [-10, 96]]), CH.tie, 9906, { ew: 4, shade: .2, lw: 4 });
  pane(g, polyPath([[-10, 96], [10, 96], [26, 186], [0, 214], [-26, 186]]), CH.tie, 9907, { ew: 8, shade: .22, lw: 4 });
  g.fillStyle = 'rgba(70,46,28,.4)'; for (let q = 0; q < 50; q++) g.fillRect(lerp(-190, 190, rnd(q, 9908)), lerp(110, 400, rnd(q, 9909)), 5, 2.5);
  pane(g, polyPath([[-16, 52], [-16, 80], [16, 80], [16, 52]]), CH.skin, 9910, { ew: 8, shade: .3, lw: 4 });
  // the head: the host's (bridge-show.js hostHead), singing
  const rx = 58, ry = 73.5, TOP = 1.3, hp = (pts) => smoothPath(pts.map(([x, y]) => [x * rx, y * ry]));
  const shag = [];
  for (let k = 0; k <= 22; k++) { const a = Math.PI - k / 22 * Math.PI, w = 1 + .05 * Math.sin(k * 2.7) + .04 * Math.sin(k * 5.3); shag.push([Math.cos(a) * 1.3 * w, -.1 - Math.sin(a) * (TOP - .1) * w]); }
  pane(g, hp([...shag, [1.32, .22], [1.24, .62], [1.4, .92], [1.08, .88], [.74, .42], [-.74, .42], [-1.08, .88], [-1.4, .92], [-1.24, .62], [-1.32, .22]]), CH.hair, 9911, { ew: 26, shade: .3, lw: 7 });
  pane(g, ellPath(0, 0, rx, ry), CH.skin, 9912, { ew: 26, shade: .26, lw: 7 });
  g.fillStyle = 'rgba(232,120,120,.3)'; for (const sd of [-1, 1]) { g.beginPath(); g.arc(sd * 36, 24, 13, 0, TAU); g.fill(); }
  for (const sd of [-1, 1]) pane(g, hp([[sd * .82, -.5], [sd * 1.04, -.4], [sd * 1.02, .3], [sd * .94, .36], [sd * .86, -.08]]), CH.hair, 9913 + sd, { ew: 8, shade: .24, lw: 5 });
  const fr = [[-1.1, -.1], [-1.06, -.8], [-.52, -1.2], [.1, -1.27], [.68, -1.12], [1.06, -.76], [1.1, -.1]];
  for (let k = 0; k <= 9; k++) { const u = 1 - k / 9, x = lerp(-.98, 1.0, u), y = -.3 - .14 * Math.sin(u * Math.PI) - (k % 2 ? .1 : 0) + .06 * (u - .5); fr.push([x, y]); }
  pane(g, hp(fr), CH.hair, 9915, { ew: 14, shade: .22, lw: 6 });
  g.strokeStyle = 'rgba(232,206,156,.55)'; g.lineWidth = 3.5; g.lineCap = 'round';
  for (const u of [-.6, -.3, .3, .6]) { g.beginPath(); g.moveTo(u * rx, -ry * 1.06); g.quadraticCurveTo((u + .1) * rx, -ry * .86, (u + .16) * rx, -ry * .66); g.stroke(); }
  const up = .5 + .5 * Math.min(1, m * 3);
  for (const sd of [-1, 1]) {
    chEye(g, sd * 23, -6, 8, [0, -.3]);
    const by = -6 - 22 - (sd > 0 ? 8 : 3) * up;
    paint(g, 4, .8); g.beginPath(); g.moveTo(sd * 23 - 13, by + 4); g.quadraticCurveTo(sd * 23, by - 6, sd * 23 + 12, by + 2); g.stroke();
  }
  paint(g, 3, .7); g.beginPath(); g.moveTo(-2, -6); g.quadraticCurveTo(-6, 16, -9, 22); g.quadraticCurveTo(0, 27, 9, 22); g.stroke();
  chHumanMouth(g, 38, 22, m);
}

// ---- the electrician: yellow hard hat with a lightning bolt, navy work shirt, a coil of orange cable on his shoulder ----
function chSparky(g, m) {
  pane(g, polyPath([[-56, 70], [-180, 116], [-206, 420], [206, 420], [180, 116], [56, 70]]), CH.navy, 9921, { ew: 34, shade: .34, lw: 8 });
  for (const sd of [-1, 1]) pane(g, polyPath([[sd * 18, 70], [sd * 70, 74], [sd * 52, 140], [sd * 6, 104]]), mix(CH.navy, [255, 255, 255], .15), 9922 + sd, { ew: 8, shade: .25, lw: 5 });
  pane(g, polyPath([[60, 200], [150, 196], [150, 250], [60, 254]]), mix(CH.navy, [0, 0, 0], .15), 9925, { ew: 8, shade: .25, lw: 5 }); // a chest pocket
  pane(g, polyPath([[78, 186], [86, 186], [86, 214], [78, 214]]), [200, 40, 40], 9926, { ew: 3, shade: .2, lw: 3 }); // a screwdriver in it
  pane(g, polyPath([[96, 180], [104, 180], [104, 214], [96, 214]]), [236, 190, 40], 9927, { ew: 3, shade: .2, lw: 3 });
  g.save(); g.translate(-128, 160); g.rotate(-.5); // the cable coil over his shoulder
  for (let k = 0; k < 3; k++) { const p = new Path2D(); p.ellipse(k * 7, k * 4, 64, 92, 0, 0, TAU); g.lineWidth = 18; g.strokeStyle = 'rgba(30,14,10,.9)'; g.stroke(p); g.lineWidth = 11; g.strokeStyle = rgb(mix(CH.cable, [255, 220, 160], k * .1)); g.stroke(p); }
  g.restore();
  pane(g, polyPath([[-16, 50], [-16, 78], [16, 78], [16, 50]]), CH.skin, 9928, { ew: 8, shade: .3, lw: 4 });
  chFace(g, 9930, { rx: 58, ry: 70, m, brow: 1 });
  for (const sd of [-1, 1]) pane(g, polyPath([[sd * 56, -36], [sd * 62, -20], [sd * 60, 18], [sd * 52, 14]]), [92, 60, 36], 9934 + sd, { ew: 6, shade: .2, lw: 4 }); // sideburns
  chHumanMouth(g, 36, 21, m);
  // the hard hat: dome, ridge, brim, and the bolt
  const dome = new Path2D(); dome.moveTo(-74, -36); dome.bezierCurveTo(-74, -132, 74, -132, 74, -36); dome.closePath();
  pane(g, dome, CH.hat, 9937, { ew: 22, shade: .28, lw: 7 });
  pane(g, polyPath([[-10, -108], [10, -108], [8, -38], [-8, -38]]), mix(CH.hat, [255, 255, 255], .25), 9938, { ew: 5, shade: .2, lw: 4 });
  pane(g, smoothPath([[-92, -38], [-60, -46], [60, -46], [92, -38], [60, -26], [-60, -26]]), CH.hat, 9939, { ew: 8, shade: .26, lw: 6 });
  pane(g, polyPath([[-40, -98], [-26, -98], [-34, -80], [-22, -80], [-44, -54], [-38, -74], [-50, -74]]), [40, 40, 52], 9940, { ew: 4, shade: .1, lw: 3 });
  g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.ellipse(-30, -100, 20, 8, -.5, 0, TAU); g.fill();
}

// ---- the plumber: an old boy in a flat cap, a big grey moustache, denim bib overalls over a check shirt, a wrench ----
function chPlumber(g, m) {
  pane(g, polyPath([[-56, 70], [-180, 116], [-206, 420], [206, 420], [180, 116], [56, 70]]), CH.check, 9951, { ew: 34, shade: .34, lw: 8 });
  g.strokeStyle = 'rgba(40,10,14,.45)'; g.lineWidth = 6; for (let k = -6; k <= 6; k++) { g.beginPath(); g.moveTo(k * 32, 90); g.lineTo(k * 32, 420); g.stroke(); g.beginPath(); g.moveTo(-210, 140 + (k + 6) * 26); g.lineTo(210, 140 + (k + 6) * 26); g.stroke(); }
  lead(g, polyPath([[-56, 70], [-180, 116], [-206, 420], [206, 420], [180, 116], [56, 70]]), 8);
  pane(g, polyPath([[-120, 210], [120, 210], [136, 420], [-136, 420]]), CH.denim, 9952, { ew: 26, shade: .3, lw: 7 }); // the bib
  for (const sd of [-1, 1]) {
    pane(g, polyPath([[sd * 80, 100], [sd * 110, 96], [sd * 120, 212], [sd * 90, 212]]), CH.denim, 9953 + sd, { ew: 8, shade: .3, lw: 5 }); // straps
    pane(g, circPath(sd * 104, 220, 11), [210, 180, 90], 9956 + sd, { ew: 4, shade: .25, lw: 4 });
  }
  pane(g, polyPath([[-50, 260], [50, 260], [46, 330], [-46, 330]]), mix(CH.denim, [0, 0, 0], .12), 9958, { ew: 8, shade: .25, lw: 5 }); // bib pocket
  g.save(); g.translate(132, 150); g.rotate(.2); // a pipe wrench over his shoulder, its jaw up by his ear
  pane(g, polyPath([[-9, -120], [9, -120], [9, 40], [-9, 40]]), [178, 40, 36], 9959, { ew: 5, shade: .25, lw: 4 });
  pane(g, polyPath([[-26, -170], [22, -170], [22, -150], [6, -150], [6, -120], [-10, -120], [-10, -148], [-26, -148]]), [150, 154, 164], 9960, { ew: 6, shade: .25, lw: 4 });
  g.restore();
  pane(g, polyPath([[-16, 50], [-16, 78], [16, 78], [16, 50]]), CH.skin, 9961, { ew: 8, shade: .3, lw: 4 });
  chFace(g, 9962, { rx: 60, ry: 70, m, brow: .6 });
  for (const sd of [-1, 1]) pane(g, polyPath([[sd * 58, -30], [sd * 64, -12], [sd * 62, 20], [sd * 54, 14]]), CH.tache, 9966 + sd, { ew: 6, shade: .2, lw: 4 });
  chHumanMouth(g, 40, 20, m);
  // the moustache: a broad grey walrus over the top lip, lifting as he sings
  const ty = 28 - 4 * m;
  pane(g, smoothPath([[-48, ty + 10], [-30, ty - 6], [0, ty - 2], [30, ty - 6], [48, ty + 10], [26, ty + 6], [0, ty + 10], [-26, ty + 6]]), CH.tache, 9968, { ew: 8, shade: .25, lw: 5 });
  // the flat cap: crown, peak
  pane(g, smoothPath([[-66, -36], [-70, -78], [-30, -104], [30, -104], [74, -86], [84, -54], [66, -36]]), CH.cap, 9969, { ew: 18, shade: .3, lw: 7 });
  pane(g, smoothPath([[-60, -40], [0, -48], [76, -46], [96, -34], [60, -24], [-50, -28]]), mix(CH.cap, [0, 0, 0], .15), 9970, { ew: 8, shade: .26, lw: 6 });
  g.fillStyle = 'rgba(40,30,24,.35)'; for (let q = 0; q < 30; q++) g.fillRect(lerp(-60, 70, rnd(q, 9971)), lerp(-98, -50, rnd(q, 9972)), 4, 2);
}

// ---- the basset hound: long ears, a sad lid, the jowls; the jaw drops to sing ----
function chBasset(g, m) {
  pane(g, polyPath([[-70, 70], [-190, 140], [-210, 420], [210, 420], [190, 140], [70, 70]]), CH.hound, 9981, { ew: 34, shade: .32, lw: 8 }); // chest
  pane(g, smoothPath([[-60, 90], [0, 76], [60, 90], [70, 420], [-70, 420]]), CH.white, 9982, { ew: 16, shade: .2, lw: 6 });
  pane(g, smoothPath([[-74, 74], [0, 92], [74, 74], [72, 96], [0, 114], [-72, 96]]), CH.collar, 9983, { ew: 6, shade: .25, lw: 5 }); // collar
  pane(g, circPath(0, 124, 14), C.gold, 9984, { ew: 5, shade: .2, lw: 4 });
  // the head: a domed skull, the white blaze, the muzzle
  pane(g, smoothPath([[-56, -10], [-50, -70], [0, -96], [50, -70], [56, -10], [48, 50], [0, 64], [-48, 50]]), CH.hound, 9985, { ew: 24, shade: .28, lw: 7 });
  pane(g, smoothPath([[-6, -84], [6, -84], [12, -40], [26, 0], [0, 10], [-26, 0], [-12, -40]]), CH.white, 9986, { ew: 6, shade: .15, lw: 4 }); // the blaze, widening into the muzzle
  const jaw = 6 + 30 * m; // the open mouth under the muzzle
  const mouthP = ellPath(0, 70 + jaw / 2, 26 + 6 * m, jaw / 2 + 4);
  g.fillStyle = rgb(CH.mouth, .96); g.fill(mouthP); g.save(); g.clip(mouthP); g.fillStyle = rgb(CH.tongue); g.beginPath(); g.ellipse(0, 74 + jaw, 16, 9 * m + 2, 0, 0, TAU); g.fill(); g.restore(); paint(g, 3, .85); g.stroke(mouthP);
  pane(g, smoothPath([[-30, 64 + jaw], [0, 80 + jaw], [30, 64 + jaw], [20, 86 + jaw], [-20, 86 + jaw]]), CH.white, 9987, { ew: 6, shade: .2, lw: 5 }); // the chin, dropping
  pane(g, smoothPath([[-50, 18], [-20, -4], [0, 4], [20, -4], [50, 18], [56, 62], [26, 74], [0, 66], [-26, 74], [-56, 62]]), CH.white, 9988, { ew: 14, shade: .2, lw: 6 }); // the jowls
  pane(g, ellPath(0, 14, 20, 13), [30, 24, 26], 9989, { ew: 6, shade: .1, lw: 4 }); // the nose
  g.fillStyle = 'rgba(255,255,255,.4)'; g.beginPath(); g.ellipse(-6, 9, 6, 3, 0, 0, TAU); g.fill();
  paint(g, 2.6, .7); g.beginPath(); g.moveTo(0, 26); g.lineTo(0, 44); g.stroke();
  for (const sd of [-1, 1]) { // eyes with the red under-lid and a heavy, sad top lid; the brows lift on the notes
    g.fillStyle = 'rgba(200,90,90,.8)'; g.beginPath(); g.ellipse(sd * 26, -22, 13, 10, 0, 0, Math.PI); g.fill();
    chEye(g, sd * 26, -26, 8, [0, -.2]); chLid(g, sd * 26, -26, 8, .45 - .15 * m, CH.hound);
    paint(g, 3.6, .7); g.beginPath(); g.moveTo(sd * 12, -46 - 8 * m); g.quadraticCurveTo(sd * 26, -52 - 8 * m, sd * 40, -44); g.stroke();
  }
  for (const sd of [-1, 1]) // the long ears, swinging a little
    pane(g, smoothPath([[sd * 40, -70], [sd * 74, -50], [sd * 92, 40], [sd * 86, 130], [sd * 64, 150], [sd * 50, 90], [sd * 46, 0]]), CH.hound2, 9990 + sd, { ew: 18, shade: .3, lw: 7 });
}

// ---- the poodle: a white pompadour, ear puffs, a pink bow; a long nose, the jaw drops to sing ----
function chPoodle(g, m) {
  const puff = (cx, cy, r, n, seed) => { const pts = []; for (let k = 0; k < n * 2; k++) { const a = k / (n * 2) * TAU, rr = r * (k % 2 ? .86 : 1.04); pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); } pane(g, smoothPath(pts), CH.poodle, seed, { ew: 18, shade: .22, lw: 6 }); };
  puff(0, 240, 190, 10, 10001); // the ruff
  pane(g, smoothPath([[-70, 80], [0, 96], [70, 80], [68, 104], [0, 120], [-68, 104]]), CH.bow, 10002, { ew: 6, shade: .25, lw: 5 }); // collar
  pane(g, smoothPath([[-36, -40], [36, -40], [38, 30], [26, 70], [0, 82], [-26, 70], [-38, 30]]), CH.poodle, 10003, { ew: 16, shade: .2, lw: 6 }); // the long face
  const jaw = 4 + 24 * m, mouthP = ellPath(0, 82 + jaw / 2, 18 + 4 * m, jaw / 2 + 3);
  g.fillStyle = rgb(CH.mouth, .96); g.fill(mouthP); g.save(); g.clip(mouthP); g.fillStyle = rgb(CH.tongue); g.beginPath(); g.ellipse(0, 86 + jaw, 11, 7 * m + 2, 0, 0, TAU); g.fill(); g.restore(); paint(g, 3, .85); g.stroke(mouthP);
  pane(g, ellPath(0, 70, 13, 9), [30, 24, 26], 10004, { ew: 5, shade: .1, lw: 4 });
  for (const sd of [-1, 1]) { chEye(g, sd * 18, -6, 7, [0, -.3]); paint(g, 3, .7); g.beginPath(); g.moveTo(sd * 8, -22 - 6 * m); g.lineTo(sd * 28, -20); g.stroke(); }
  for (const sd of [-1, 1]) puff(sd * 70, 30, 46, 7, 10006 + sd); // the ear puffs
  puff(0, -82, 64, 9, 10009); // the topknot
  for (const sd of [-1, 1]) pane(g, polyPath([[0, -136], [sd * 44, -158], [sd * 40, -114]]), CH.bow, 10010 + sd, { ew: 8, shade: .25, lw: 5 }); // the bow
  pane(g, circPath(0, -136, 11), mix(CH.bow, [120, 20, 60], .3), 10013, { ew: 4, shade: .2, lw: 4 });
}

// ---- a horse looking down over the top edge: the neck comes down from above; a long face, the jaw drops to sing ----
function chHorse(g, m, grey) {
  const c1 = grey ? CH.grey : CH.bay, c2 = grey ? CH.grey2 : CH.bay2;
  pane(g, smoothPath([[-62, -40], [-74, -420], [74, -420], [62, -40], [40, -60], [-40, -60]]), c1, 10021 + grey, { ew: 30, shade: .3, lw: 8 }); // the neck, up off the top
  if (grey) { g.fillStyle = 'rgba(90,90,100,.35)'; for (let q = 0; q < 26; q++) { g.beginPath(); g.arc(lerp(-60, 60, rnd(q, 10023)), lerp(-400, -70, rnd(q, 10024)), 8 + 8 * rnd(q, 10025), 0, TAU); g.fill(); } } // dapples
  const mane = []; for (let k = 0; k <= 10; k++) mane.push([62 + 18 * (k % 2), -420 + k * 36]); mane.push([40, -50], [52, -420]);
  pane(g, polyPath(mane), c2, 10026 + grey, { ew: 10, shade: .25, lw: 5 });
  for (const sd of [-1, 1]) pane(g, polyPath([[sd * 18, -80], [sd * 34, -136], [sd * 46, -76]]), c1, 10028 + grey + sd, { ew: 8, shade: .3, lw: 5 }); // ears
  // the face: wide at the eyes, narrowing, then the soft muzzle
  pane(g, smoothPath([[-56, -70], [56, -70], [50, 10], [36, 70], [40, 120], [0, 134], [-40, 120], [-36, 70], [-50, 10]]), c1, 10031 + grey, { ew: 24, shade: .28, lw: 7 });
  pane(g, smoothPath([[-14, -88], [14, -88], [6, -40], [-6, -40]]), c2, 10033 + grey, { ew: 6, shade: .2, lw: 4 }); // the forelock
  if (grey) pane(g, smoothPath([[-10, -40], [10, -40], [14, 60], [0, 80], [-14, 60]]), [244, 242, 238], 10035, { ew: 6, shade: .12, lw: 4 }); // a blaze
  else pane(g, chStar(0, -26, 14), [244, 240, 232], 10035, { ew: 4, shade: .1, lw: 3 }); // a star
  const jaw = 6 + 30 * m;
  pane(g, smoothPath([[-30, 112 + jaw], [30, 112 + jaw], [36, 134 + jaw], [0, 146 + jaw], [-36, 134 + jaw]]), CH.muzzle, 10036 + grey, { ew: 8, shade: .25, lw: 5 }); // lower lip
  const mouthP = polyPath([[-34, 118], [34, 118], [30, 116 + jaw], [-30, 116 + jaw]]);
  g.fillStyle = rgb(CH.mouth, .96); g.fill(mouthP);
  g.fillStyle = rgb([236, 224, 190]); g.fillRect(-26, 118, 52, 10 + 3 * m); // the big teeth
  g.strokeStyle = 'rgba(60,40,30,.6)'; g.lineWidth = 2; for (const x of [-13, 0, 13]) { g.beginPath(); g.moveTo(x, 118); g.lineTo(x, 128 + 3 * m); g.stroke(); }
  pane(g, smoothPath([[-42, 74], [42, 74], [44, 112], [0, 124], [-44, 112]]), CH.muzzle, 10038 + grey, { ew: 12, shade: .25, lw: 6 }); // the upper muzzle
  for (const sd of [-1, 1]) { g.fillStyle = 'rgba(20,12,10,.9)'; g.beginPath(); g.ellipse(sd * 20, 94, 7, 10 + 3 * m, sd * .3, 0, TAU); g.fill(); } // nostrils flaring
  for (const sd of [-1, 1]) { chEye(g, sd * 44, -32, 8, [sd * -.4, .3]); chLid(g, sd * 44, -32, 8, .2, c1); }
}

// ---- draft 15: a knight in the manner of the Knights Who Say Ni (Bob named the sketch; Robin, 2026-10-21: in only if it
// fits as a second figure, so he takes the Eric Idle-type gent's place). An invented knight, not any actor: a tall dark
// helm with a pair of antlers, a chain-mail coif round his face, a great bushy beard, and the mouth in the beard ----
function chKnight(g, m) {
  const mail = [150, 152, 162], mail2 = [116, 118, 128], steel = [72, 76, 88], beard = [118, 96, 78], bone = [222, 206, 172];
  const ring = (path, x0, x1, y0, y1) => { g.save(); g.clip(path); g.strokeStyle = 'rgba(40,40,52,.35)'; g.lineWidth = 2;
    for (let y = y0, r = 0; y < y1; y += 9, r++) for (let x = x0 + (r % 2) * 5; x < x1; x += 10) { g.beginPath(); g.arc(x, y, 4, .3, Math.PI - .3); g.stroke(); } g.restore(); };
  const body = polyPath([[-60, 70], [-186, 120], [-210, 420], [210, 420], [186, 120], [60, 70]]);
  pane(g, body, mail, 9901, { ew: 30, shade: .32, lw: 8 }); ring(body, -210, 210, 70, 420);
  pane(g, polyPath([[-96, 150], [96, 150], [110, 420], [-110, 420]]), [36, 34, 40], 9902, { ew: 18, shade: .3, lw: 7 }); // a black tabard
  // the coif round the face
  const coif = smoothPath([[-70, -40], [-74, 30], [-62, 90], [0, 112], [62, 90], [74, 30], [70, -40], [0, -64]]);
  pane(g, coif, mail2, 9903, { ew: 20, shade: .3, lw: 7 }); ring(coif, -80, 80, -70, 116);
  pane(g, ellPath(0, 4, 46, 56), CH.skin, 9904, { ew: 18, shade: .24, lw: 6 });
  for (const sd of [-1, 1]) { chEye(g, sd * 18, -10, 7, [0, -.2]); paint(g, 5, .85); g.beginPath(); g.moveTo(sd * 6, -26 - 4 * m); g.lineTo(sd * 30, -24 - 6 * m); g.stroke(); }
  paint(g, 3, .7); g.beginPath(); g.moveTo(-2, -8); g.quadraticCurveTo(-7, 12, -9, 18); g.quadraticCurveTo(0, 23, 9, 18); g.stroke();
  // the great beard, and the mouth open in it
  pane(g, smoothPath([[-48, 18], [-30, 26], [0, 22], [30, 26], [48, 18], [56, 70], [34, 116], [0, 136], [-34, 116], [-56, 70]]), beard, 9905, { ew: 16, shade: .26, lw: 6 });
  paint(g, 2, .35); for (let k = -4; k <= 4; k++) { g.beginPath(); g.moveTo(k * 10, 46); g.quadraticCurveTo(k * 12, 86, k * 9, 122); g.stroke(); }
  const h = 6 + 26 * m, mp = ellPath(0, 46 + h / 2, 15 + 4 * m, h / 2 + 2);
  g.fillStyle = rgb(CH.mouth, .96); g.fill(mp); paint(g, 3, .8); g.stroke(mp);
  pane(g, smoothPath([[-40, 34], [-18, 26], [0, 32], [18, 26], [40, 34], [22, 42], [0, 38], [-22, 42]]), beard, 9906, { ew: 6, shade: .25, lw: 5 }); // moustache
  // the tall helm and its antlers
  pane(g, smoothPath([[-54, -40], [-58, -150], [-46, -196], [0, -206], [46, -196], [58, -150], [54, -40]]), steel, 9907, { ew: 22, shade: .32, lw: 7, amt: .3 });
  pane(g, polyPath([[-56, -54], [56, -54], [56, -38], [-56, -38]]), mix(steel, [0, 0, 0], .2), 9908, { ew: 5, shade: .2, lw: 5 });
  g.strokeStyle = 'rgba(255,255,255,.2)'; g.lineWidth = 6; g.beginPath(); g.moveTo(-34, -60); g.quadraticCurveTo(-40, -140, -26, -190); g.stroke();
  for (const sd of [-1, 1]) {
    const tines = [[[sd * 30, -196], [sd * 70, -250], [sd * 92, -320]], [[sd * 58, -238], [sd * 104, -246]], [[sd * 78, -282], [sd * 120, -300]], [[sd * 88, -306], [sd * 84, -352]]];
    for (const [q, pts] of tines.entries()) for (let k = 0; k + 1 < pts.length; k++) pane(g, glassCapsule(pts[k][0], pts[k][1], pts[k + 1][0], pts[k + 1][1], q ? 8 : 11), bone, 9910 + q * 4 + k + (sd > 0 ? 40 : 0), { ew: 6, shade: .22, lw: 4 });
  }
}
const CH_DRAW = { knight: chKnight, sparky: chSparky, plumber: chPlumber, basset: chBasset, poodle: chPoodle, horse: (g, m) => chHorse(g, m, 0), grey: (g, m) => chHorse(g, m, 1) };
function drawChorus(g, t, tod) {
  if (PF_VARIANT !== 'C' || t < CH_SLOTS[0].ti - .05) return;
  const L = .35 + .65 * tod.I, br = L * (tod.col[0] + tod.col[1] + tod.col[2]) / 765, m = pipSingMouth(t);
  CH_SLOTS.forEach((Q, j) => {
    const inU = easeOutBack(lin(t, Q.ti, Q.ti + .32), 1.4), outU = Math.pow(lin(t, Q.to - .24, Q.to), 2);
    if (inU <= 0 || outU >= 1) return;
    const off = 420 * (1 - inU) + 480 * outU, ph = TAU * (t - PF_B[0]) / (2 * PIP_HEAD_BEAT), sd = j % 2 ? -1 : 1;
    const bob = 8 * Math.abs(Math.sin(ph)), [fx, fy] = Q.from;
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    if (br < .985) g.filter = `brightness(${br.toFixed(3)})`;
    g.translate(Q.x + fx * (off - bob), Q.y + fy * (off - bob)); g.rotate(Q.rot + .1 * Math.sin(ph) * sd); g.scale(Q.sc, Q.sc);
    CH_DRAW[Q.who](g, m);
    g.restore();
  });
}
