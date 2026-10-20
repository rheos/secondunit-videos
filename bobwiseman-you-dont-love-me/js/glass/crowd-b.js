// Draft 14 crowd, group b: characters from Bob's other videos, redrawn in this film's glass so a fan knows them
// ("hey, that's the customer from More"). More: the deadpan customer (cut-paper: flat cap with its star, green
// overcoat, the "one more" finger), the long-suffering waiter (rubber-hose diner), Edna and the lady in the beret
// (the elders of instrumental 2). We Got Time: the man (homburg, his guitar case, her laughter knitted into a
// sweater) the typist (bun, grey uniform, the rose collar) and a clerk from the waiting hall. Satisfied Mind: two of the goths from THE COMPANY
// card (the purple mohawk, the grandad in the top hat, the little goth girl). Never little Bob, nobody real. Seeds 30000-39999; helpers
// are prefixed cb. See crowd-base.js for the contract.

const CB = {
  skin: [240, 204, 176], peach: [242, 196, 164], ink: [34, 28, 30], cream: [244, 238, 222],
  coat: [[46, 130, 64], [40, 70, 160], [150, 60, 40]], cap: [[58, 46, 42], [40, 40, 52], [70, 50, 30]], star: [244, 196, 40],
  jacket: [[250, 248, 240], [240, 226, 196], [222, 234, 244]], bow: [[30, 26, 30], [168, 26, 40], [30, 100, 60]],
};
function cbV(arr, v) { return arr[((v | 0) % arr.length + arr.length) % arr.length]; }
function cbBody(g, col, seed, o = {}) { // shoulders from the neck at y +60, 440 wide at the bottom
  const w0 = o.w0 || 58, w1 = o.w1 || 182, w2 = o.w2 || 220;
  const p = polyPath([[-w0, 66], [-w1, 122], [-w2, 430], [w2, 430], [w1, 122], [w0, 66]]);
  pane(g, p, col, seed, { ew: 34, shade: .34, lw: 8, amt: o.amt ?? 1 }); return p;
}
function cbNeck(g, col, seed, w = 17) { pane(g, polyPath([[-w, 46], [-w, 84], [w, 84], [w, 46]]), col, seed, { ew: 8, shade: .3, lw: 4 }); }
function cbHead(g, col, seed, rx, ry, cheeks = .3) {
  for (const sd of [-1, 1]) pane(g, ellPath(sd * rx * .97, 6, 12, 19), col, seed + 1 + sd, { ew: 8, shade: .3, lw: 5 });
  pane(g, ellPath(0, 0, rx, ry), col, seed, { ew: 24, shade: .26, lw: 7, amt: .45 });
  if (cheeks) { g.fillStyle = `rgba(232,110,110,${cheeks})`; for (const sd of [-1, 1]) { g.beginPath(); g.arc(sd * rx * .56, ry * .3, rx * .2, 0, TAU); g.fill(); } }
}
function cbBrow(g, x, y, w, tilt, lw = 4.2) { paint(g, lw, .85); g.beginPath(); g.moveTo(x - w / 2, y + tilt); g.quadraticCurveTo(x, y - 4, x + w / 2, y - tilt); g.stroke(); }
function cbButtons(g, x, ys, r, col, seed) { ys.forEach((y, i) => pane(g, circPath(x, y, r), col, seed + i, { ew: 4, shade: .2, lw: 4 })); }

// ---- More: the customer. Round deadpan face, dot eyes under heavy lids, flat cap with the star on top, a too-big
// green overcoat with its collar up and yellow buttons, and the raised "one more" finger by his head ----
CROWD_DRAW.more_customer = (g, m, t, v) => {
  const coat = cbV(CB.coat, v), coat2 = mix(coat, [0, 0, 0], .25), cap = cbV(CB.cap, v);
  cbBody(g, coat, 30001, { w0: 62, w1: 196, w2: 226 });
  for (const sd of [-1, 1]) { // big lapels and the turned-up collar
    pane(g, polyPath([[sd * 20, 74], [sd * 92, 60], [sd * 120, 120], [sd * 70, 250], [sd * 14, 120]]), coat2, 30002 + sd, { ew: 10, shade: .25, lw: 6 });
    pane(g, polyPath([[sd * 50, 70], [sd * 96, 30], [sd * 110, 86], [sd * 86, 104]]), coat, 30005 + sd, { ew: 8, shade: .25, lw: 5 });
  }
  cbButtons(g, 0, [160, 240, 320, 400], 12, CB.star, 30008);
  for (const sd of [-1, 1]) pane(g, polyPath([[sd * 90, 300], [sd * 170, 296], [sd * 172, 316], [sd * 92, 320]]), coat2, 30013 + sd, { ew: 5, shade: .2, lw: 4 }); // pocket flaps
  // the raised arm, sleeve up past his shoulder, the hand by his head with one finger up
  pane(g, polyPath(limbPts([[150, 200], [168, 90], [138, 10]], [70, 60, 50])), coat, 30016, { ew: 12, shade: .3, lw: 6 });
  const wag = .08 * Math.sin(t * 6.4);
  g.save(); g.translate(136, -24); g.rotate(wag); // palm to us, index up on the side toward his head, thumb out, three fingers curled
  pane(g, polyPath([[-30, -40], [-14, -40], [-13, -104], [-22, -112], [-31, -104]]), CB.peach, 30017, { ew: 6, shade: .2, lw: 4 }); // the finger
  pane(g, smoothPath([[-34, -44], [30, -44], [34, -8], [22, 20], [-22, 20], [-36, -8]]), CB.peach, 30018, { ew: 10, shade: .24, lw: 5 }); // the palm
  for (let k = 0; k < 3; k++) pane(g, ellPath(-4 + k * 13, -42, 7, 9), CB.peach, 30029 + k, { ew: 4, shade: .2, lw: 4 }); // curled fingertips
  pane(g, smoothPath([[-34, -2], [-58, -18], [-60, -32], [-44, -26], [-30, -16]]), CB.peach, 30019, { ew: 5, shade: .2, lw: 4 }); // thumb out
  paint(g, 2.4, .5); g.beginPath(); g.moveTo(-20, -2); g.quadraticCurveTo(0, 8, 18, -6); g.stroke();
  g.restore();
  // the head: round, plain
  cbNeck(g, CB.peach, 30020);
  cbHead(g, CB.peach, 30021, 60, 66, .3);
  for (const sd of [-1, 1]) { chEye(g, sd * 22, -4, 7, [0, 0]); chLid(g, sd * 22, -4, 7, .42, CB.peach); cbBrow(g, sd * 22, -22 - 3 * m, 22, 0, 4.4); }
  pane(g, ellPath(0, 16, 8, 7), mix(CB.peach, [220, 110, 100], .35), 30024, { ew: 4, shade: .15, lw: 3 }); // the small nose
  chHumanMouth(g, 32, 21, m);
  // the flat cap: crown, the stiff peak across the brow, the star on top
  pane(g, smoothPath([[-66, -30], [-68, -62], [-36, -86], [36, -86], [68, -62], [66, -30]]), cap, 30025, { ew: 18, shade: .3, lw: 7 });
  pane(g, smoothPath([[-76, -30], [0, -44], [76, -30], [70, -18], [0, -26], [-70, -18]]), mix(cap, [255, 255, 255], .12), 30026, { ew: 6, shade: .25, lw: 6 });
  pane(g, chStar(0, -104, 26), CB.star, 30027, { ew: 6, shade: .2, lw: 4 });
  pane(g, polyPath([[-3, -86], [3, -86], [3, -82], [-3, -82]]), CB.star, 30028, { ew: 2, shade: 0, lw: 3 });
};
CROWD_META.more_customer = { group: 'b', film: 'More', who: 'the customer' };

// ---- More: the waiter. Bald egg head with two curls on top, weary lids, a big nose, a droopy moustache, white
// jacket, black bow tie and shirt front, a cloth over his arm ----
CROWD_DRAW.more_waiter = (g, m, t, v) => {
  const jk = cbV(CB.jacket, v), bow = cbV(CB.bow, v);
  const body = cbBody(g, jk, 30101, { w0: 52, w1: 170, w2: 214 });
  pane(g, polyPath([[-40, 70], [40, 70], [0, 236]]), [44, 40, 44], 30102, { ew: 8, shade: .15, lw: 5 }); // the dark shirt front
  for (const sd of [-1, 1]) pane(g, polyPath([[sd * 40, 70], [sd * 74, 80], [sd * 30, 260], [0, 236]]), mix(jk, [120, 110, 100], .18), 30103 + sd, { ew: 8, shade: .2, lw: 5 });
  cbButtons(g, 0, [280, 350], 11, [40, 36, 40], 30106);
  for (const sd of [-1, 1]) pane(g, polyPath([[0, 82], [sd * 34, 66], [sd * 36, 100]]), bow, 30109 + sd, { ew: 6, shade: .2, lw: 4 });
  pane(g, ellPath(0, 83, 9, 9), bow, 30112, { ew: 4, shade: .15, lw: 4 });
  // the cloth over his forearm, hanging in front of him
  pane(g, polyPath(limbPts([[-200, 190], [-130, 222], [-50, 232]], [56, 52, 44])), jk, 30113, { ew: 10, shade: .3, lw: 6 });
  pane(g, smoothPath([[-150, 204], [-88, 212], [-86, 330], [-148, 324]]), CB.cream, 30114, { ew: 8, shade: .18, lw: 5 });
  paint(g, 2.6, .5); for (const x of [-132, -106]) { g.beginPath(); g.moveTo(x, 226); g.lineTo(x + 2, 318); g.stroke(); }
  cbNeck(g, CB.skin, 30115, 15);
  // the head: tall egg, bald, two curls on top
  for (const sd of [-1, 1]) pane(g, ellPath(sd * 50, 8, 11, 18), CB.skin, 30116 + sd, { ew: 8, shade: .3, lw: 5 });
  pane(g, smoothPath([[-50, 10], [-48, -50], [-26, -88], [0, -96], [26, -88], [48, -50], [50, 10], [42, 66], [0, 90], [-42, 66]]), CB.skin, 30119, { ew: 24, shade: .26, lw: 7 });
  g.fillStyle = 'rgba(255,255,255,.3)'; g.beginPath(); g.ellipse(-18, -66, 18, 9, -.4, 0, TAU); g.fill(); // shine on the dome
  paint(g, 5, .9); for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(sd * 6, -94); g.quadraticCurveTo(sd * 8, -122, sd * 22, -122); g.quadraticCurveTo(sd * 30, -118, sd * 24, -110); g.stroke(); }
  for (const sd of [-1, 1]) { chEye(g, sd * 21, -18, 7, [.3, .2]); chLid(g, sd * 21, -18, 7, .55, CB.skin); cbBrow(g, sd * 21, -34 - 4 * m, 24, sd * -4, 4); }
  chHumanMouth(g, 52, 18, m);
  // the moustache, drooping either side of the mouth, and the big nose over it
  for (const sd of [-1, 1]) pane(g, smoothPath([[sd * 2, 30], [sd * 24, 28], [sd * 40, 40], [sd * 48, 66], [sd * 34, 54], [sd * 14, 44]]), [70, 52, 40], 30121 + sd, { ew: 6, shade: .2, lw: 4 });
  pane(g, smoothPath([[-6, -16], [8, -16], [22, 4], [24, 22], [6, 32], [-14, 28], [-18, 12]]), mix(CB.skin, [220, 120, 100], .25), 30124, { ew: 8, shade: .24, lw: 5 });
};
CROWD_META.more_waiter = { group: 'b', film: 'More', who: 'the waiter' };

// ---- More: Edna, the elder who stands first. White hair in a bun, round glasses, pink cardigan over a white
// blouse, and the clock's minute hand she walked off with as her cane ----
CROWD_DRAW.more_edna = (g, m, t, v) => {
  const card = cbV([[236, 128, 160], [170, 130, 210], [120, 200, 160]], v), skin = [243, 195, 164], hair = [246, 242, 234];
  cbBody(g, card, 30201, { w0: 56, w1: 176, w2: 216 });
  pane(g, polyPath([[-44, 70], [44, 70], [26, 150], [0, 176], [-26, 150]]), CB.cream, 30202, { ew: 8, shade: .14, lw: 5 }); // blouse
  for (const sd of [-1, 1]) pane(g, polyPath([[sd * 4, 72], [sd * 46, 66], [sd * 52, 96], [sd * 10, 100]]), CB.cream, 30203 + sd, { ew: 5, shade: .18, lw: 4 }); // collar points
  cbButtons(g, 0, [214, 280, 346, 412], 10, CB.cream, 30206);
  paint(g, 10, .18); for (const x of [-120, 120]) { g.beginPath(); g.moveTo(x * .7, 150); g.lineTo(x, 430); g.stroke(); }
  // the minute hand as a cane: hub up by her shoulder, the point down
  pane(g, polyPath([[148, 10], [168, 10], [164, 400], [158, 440], [152, 400]]), [34, 30, 34], 30211, { ew: 6, shade: .1, lw: 5 });
  pane(g, circPath(158, 4, 20), [34, 30, 34], 30212, { ew: 6, shade: .1, lw: 5 });
  pane(g, circPath(158, 4, 7), C.gold, 30213, { ew: 3, shade: .1, lw: 3 });
  pane(g, polyPath(limbPts([[70, 230], [120, 190], [150, 160]], [60, 54, 48])), card, 30215, { ew: 8, shade: .3, lw: 6 });
  pane(g, smoothPath([[136, 140], [180, 138], [184, 166], [158, 176], [134, 166]]), skin, 30214, { ew: 6, shade: .2, lw: 5 }); // her hand on it
  paint(g, 2.4, .6); for (const y of [150, 160]) { g.beginPath(); g.moveTo(150, y); g.lineTo(178, y); g.stroke(); }
  cbNeck(g, skin, 30216);
  // white hair puffed round the head, the bun on top
  pane(g, circPath(0, -94, 32), hair, 30217, { ew: 10, shade: .2, lw: 6 });
  pane(g, smoothPath([[-66, 18], [-72, -30], [-50, -72], [0, -84], [50, -72], [72, -30], [66, 18], [50, 0], [-50, 0]]), hair, 30218, { ew: 14, shade: .22, lw: 6 });
  cbHead(g, skin, 30219, 54, 64, .3);
  pane(g, smoothPath([[-52, -22], [-40, -56], [0, -66], [40, -56], [52, -22], [24, -42], [-24, -42]]), hair, 30222, { ew: 8, shade: .18, lw: 5 });
  g.strokeStyle = 'rgba(180,170,160,.6)'; g.lineWidth = 2.5; for (const u of [-.5, 0, .5]) { g.beginPath(); g.moveTo(u * 50, -78); g.quadraticCurveTo(u * 60, -60, u * 70, -40); g.stroke(); }
  for (const sd of [-1, 1]) { chEye(g, sd * 21, -6, 6, [0, -.2]); cbBrow(g, sd * 21, -28 - 4 * m, 20, sd * -2, 3.4); }
  // round glasses
  g.lineJoin = 'round'; for (const sd of [-1, 1]) { const gp = circPath(sd * 21, -6, 17); g.lineWidth = 6; g.strokeStyle = LEAD; g.stroke(gp); }
  g.lineWidth = 5; g.strokeStyle = LEAD; g.beginPath(); g.moveTo(-5, -9); g.quadraticCurveTo(0, -13, 5, -9); g.stroke();
  paint(g, 3, .65); g.beginPath(); g.moveTo(-3, 4); g.quadraticCurveTo(-6, 16, -7, 20); g.quadraticCurveTo(0, 24, 7, 20); g.stroke();
  chHumanMouth(g, 32, 19, m);
};
CROWD_META.more_edna = { group: 'b', film: 'More', who: 'Edna, the elder with the clock hand' };

// ---- More: the lady in the pink beret, grey-white bob, a string of pearls, cobalt dress ----
CROWD_DRAW.more_beret = (g, m, t, v) => {
  const skin = [168, 113, 79], hair = [222, 222, 232], beret = cbV([[232, 120, 168], [200, 40, 50], [238, 172, 32]], v), dress = cbV([[36, 64, 170], [24, 120, 120], [36, 64, 170]], v);
  pane(g, smoothPath([[-70, 40], [-76, -20], [-60, -66], [0, -80], [60, -66], [76, -20], [70, 40], [40, 46], [-40, 46]]), hair, 30301, { ew: 16, shade: .24, lw: 7 }); // the bob, behind
  cbBody(g, dress, 30302, { w0: 50, w1: 172, w2: 214 });
  pane(g, smoothPath([[-50, 70], [0, 120], [50, 70], [44, 88], [0, 136], [-44, 88]]), mix(dress, [0, 0, 0], .2), 30303, { ew: 6, shade: .2, lw: 4 }); // neckline
  cbButtons(g, 0, [200, 270], 9, [244, 238, 222], 30304);
  cbNeck(g, skin, 30306, 16);
  for (let k = 0; k <= 10; k++) { const a = Math.PI * (.12 + .76 * k / 10); pane(g, circPath(Math.cos(a) * 56, 66 + Math.sin(a) * 40, 7.5), [248, 246, 240], 30307 + k, { ew: 3, shade: .15, lw: 3 }); } // pearls
  cbHead(g, skin, 30320, 54, 66, .25);
  pane(g, smoothPath([[-60, -14], [-54, -50], [-20, -68], [30, -68], [58, -46], [62, -10], [36, -38], [0, -30], [-34, -36]]), hair, 30322, { ew: 10, shade: .2, lw: 5 }); // fringe
  for (const sd of [-1, 1]) { chEye(g, sd * 21, -2, 7, [0, -.2]); cbBrow(g, sd * 21, -22 - 4 * m, 20, sd * -2, 3.8); }
  paint(g, 3, .7); g.beginPath(); g.moveTo(-3, 4); g.quadraticCurveTo(-8, 18, -9, 22); g.quadraticCurveTo(0, 27, 9, 22); g.stroke();
  chHumanMouth(g, 36, 20, m);
  // the beret, tipped to one side, its little stalk
  g.save(); g.translate(8, -64); g.rotate(-.18);
  pane(g, ellPath(0, 0, 78, 26), beret, 30323, { ew: 14, shade: .26, lw: 7 });
  pane(g, polyPath([[-4, -24], [4, -24], [6, -40], [-2, -40]]), beret, 30324, { ew: 3, shade: .2, lw: 4 });
  g.restore();
};
CROWD_META.more_beret = { group: 'b', film: 'More', who: 'the elder in the pink beret' };

// ---- We Got Time: the man. Black homburg with the rose band, a long nose, her laughter knitted into a yellow
// zigzag sweater, the green scarf, his guitar case over his shoulder ----
CROWD_DRAW.wgt_man = (g, m, t, v) => {
  const skin = [222, 176, 136], sw = cbV([[228, 180, 48], [236, 130, 40], [228, 180, 48]], v), sc = cbV([[40, 150, 90], [40, 150, 90], [40, 100, 170]], v), ROSEc = [200, 69, 90];
  // the guitar case, slung behind his shoulder
  pane(g, smoothPath([[-196, 430], [-216, 300], [-200, 180], [-182, 60], [-180, -40], [-150, -60], [-128, -36], [-132, 70], [-120, 190], [-110, 300], [-120, 430]]), [32, 30, 34], 30401, { ew: 10, shade: .1, lw: 7 });
  g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.ellipse(-170, 120, 8, 60, .1, 0, TAU); g.fill();
  const body = cbBody(g, sw, 30402, { w0: 56, w1: 178, w2: 218 });
  g.save(); g.clip(body); // the zigzag band (her laughter) and a thin second line
  const zz = (y0, h, n, col, seed) => { const top = [], bot = []; for (let k = 0; k <= n; k++) { const x = -240 + k * 480 / n, y = y0 + (k % 2 ? -h : h); top.push([x, y]); bot.push([x, y + 22]); } pane(g, polyPath(top.concat(bot.reverse())), col, seed, { ew: 6, shade: .15, lw: 4 }); };
  zz(240, 22, 12, ROSEc, 30403); zz(320, 14, 16, ROSEc, 30404);
  g.restore(); lead(g, body, 8);
  pane(g, smoothPath([[-30, 280], [-14, 266], [0, 278], [-12, 296]]), [240, 160, 190], 30405, { ew: 4, shade: .15, lw: 3 });
  // the scarf: round the neck, one end over his chest
  pane(g, smoothPath([[-70, 60], [0, 80], [70, 60], [76, 96], [0, 118], [-76, 96]]), sc, 30406, { ew: 8, shade: .25, lw: 6 });
  pane(g, polyPath([[24, 100], [62, 96], [74, 250], [36, 256]]), sc, 30407, { ew: 8, shade: .25, lw: 5 });
  paint(g, 3, .5); for (const y of [210, 230]) { g.beginPath(); g.moveTo(36, y); g.lineTo(72, y - 2); g.stroke(); }
  cbNeck(g, skin, 30408);
  cbHead(g, skin, 30409, 54, 70, .28);
  for (const sd of [-1, 1]) { chEye(g, sd * 21, -10, 7, [0, -.1]); cbBrow(g, sd * 21, -30 - 5 * m, 20, sd * -3, 4.2); }
  pane(g, smoothPath([[-6, -12], [6, -12], [12, 18], [18, 30], [4, 36], [-14, 32], [-10, 18]]), mix(skin, [200, 90, 70], .22), 30412, { ew: 8, shade: .22, lw: 5 }); // the long nose
  chHumanMouth(g, 46, 19, m);
  // the homburg: wide brim, dented crown, rose band
  pane(g, smoothPath([[-50, -40], [-46, -112], [-20, -122], [0, -112], [20, -122], [46, -112], [50, -40]]), [38, 36, 40], 30413, { ew: 14, shade: .2, lw: 7 });
  pane(g, polyPath([[-50, -66], [50, -66], [50, -46], [-50, -46]]), ROSEc, 30414, { ew: 6, shade: .2, lw: 5 });
  pane(g, smoothPath([[-96, -38], [-50, -54], [50, -54], [96, -38], [50, -30], [-50, -30]]), [38, 36, 40], 30415, { ew: 8, shade: .2, lw: 6 });
  g.fillStyle = 'rgba(255,255,255,.16)'; g.beginPath(); g.ellipse(-26, -94, 10, 22, 0, 0, TAU); g.fill();
};
CROWD_META.wgt_man = { group: 'b', film: 'We Got Time', who: 'the man with the guitar case' };

// ---- We Got Time: the typist across the hall. Dark hair up in a bun with a pencil through it, grey uniform,
// the rose collar and rose cheeks (her one warm colour), the paper flower he sent her pinned on ----
CROWD_DRAW.wgt_typist = (g, m, t, v) => {
  const skin = [238, 204, 176], hair = [46, 42, 38], uni = cbV([[132, 130, 120], [112, 124, 138], [132, 130, 120]], v), ROSEc = cbV([[200, 69, 90], [200, 69, 90], [222, 100, 140]], v);
  pane(g, circPath(0, -92, 34), hair, 30502, { ew: 10, shade: .2, lw: 6, amt: .25 }); // the bun
  pane(g, polyPath([[-50, -78], [42, -128], [48, -118], [-44, -68]]), [238, 190, 60], 30501, { ew: 3, shade: .15, lw: 4 }); // the pencil through it
  pane(g, polyPath([[-50, -78], [-64, -66], [-44, -68]]), [236, 206, 160], 30503, { ew: 2, shade: 0, lw: 3 });
  pane(g, polyPath([[42, -128], [56, -134], [56, -124], [48, -118]]), [226, 120, 140], 30519, { ew: 2, shade: 0, lw: 3 }); // its eraser
  cbBody(g, uni, 30504, { w0: 50, w1: 168, w2: 214 });
  paint(g, 10, .16); for (const x of [-110, 110]) { g.beginPath(); g.moveTo(x * .6, 140); g.lineTo(x, 430); g.stroke(); }
  for (const sd of [-1, 1]) pane(g, polyPath([[0, 92], [sd * 56, 64], [sd * 70, 116]]), ROSEc, 30505 + sd, { ew: 6, shade: .2, lw: 5 }); // the rose collar
  cbButtons(g, 0, [170, 240, 310], 9, mix(uni, [0, 0, 0], .3), 30508);
  // the paper flower, folded from a form
  const pts = []; for (let k = 0; k < 10; k++) { const a = k / 10 * TAU, r = k % 2 ? 14 : 30; pts.push([-96 + Math.cos(a) * r, 200 + Math.sin(a) * r]); }
  pane(g, polyPath(pts), [231, 160, 168], 30512, { ew: 6, shade: .2, lw: 4 });
  pane(g, circPath(-96, 200, 9), ROSEc, 30513, { ew: 3, shade: .15, lw: 3 });
  cbNeck(g, skin, 30514, 15);
  cbHead(g, skin, 30515, 52, 66, 0);
  g.fillStyle = rgb(ROSEc, .5); for (const sd of [-1, 1]) { g.beginPath(); g.arc(sd * 30, 20, 11, 0, TAU); g.fill(); }
  pane(g, smoothPath([[-58, 8], [-60, -34], [-36, -66], [10, -72], [50, -56], [60, -24], [56, 8], [48, -26], [30, -46], [-16, -54], [-30, -42], [-48, -22]]), hair, 30518, { ew: 10, shade: .2, lw: 6, amt: .25 }); // hair swept up, side part
  for (const sd of [-1, 1]) {
    chEye(g, sd * 20, -4, 7, [0, -.2]);
    paint(g, 2.8, .9); for (const k of [-1, 0, 1]) { g.beginPath(); g.moveTo(sd * (20 + 8 + k * 3) + 0, -11 + Math.abs(k) * 2); g.lineTo(sd * (20 + 12 + k * 4), -16 + Math.abs(k) * 2); g.stroke(); } // lashes
    cbBrow(g, sd * 20, -24 - 4 * m, 18, sd * -2, 3.4);
  }
  paint(g, 3, .65); g.beginPath(); g.moveTo(-2, 0); g.quadraticCurveTo(-6, 14, -7, 18); g.quadraticCurveTo(0, 22, 7, 18); g.stroke();
  chHumanMouth(g, 32, 18, m);
  g.strokeStyle = rgb(ROSEc, .9); g.lineWidth = 3.5; g.beginPath(); g.ellipse(0, 32 + (4 + 26 * m) / 2 - 2, 18 * (.8 + .25 * m) + 1, (4 + 26 * m) / 2 + 3, 0, 0, TAU); g.stroke(); // lipstick
};
CROWD_META.wgt_typist = { group: 'b', film: 'We Got Time', who: 'the typist across the hall' };

// ---- Satisfied Mind (THE COMPANY card): two of the goths who came to wave him off on a sunny day ----
const CB_GHOST = [238, 234, 226], CB_BLACK = [44, 40, 50];
function cbGothEyes(g, x, y, m) { // kohl round the eyes, then the eye
  g.fillStyle = 'rgba(30,20,34,.85)'; for (const sd of [-1, 1]) { g.beginPath(); g.ellipse(sd * x, y + 1, 15, 12, sd * .2, 0, TAU); g.fill(); }
  for (const sd of [-1, 1]) { chEye(g, sd * x, y, 7, [0, -.2]); cbBrow(g, sd * x, y - 22 - 4 * m, 22, sd * -5, 4.4); }
}
function cbGothLips(g, y, w, m) { const h = 4 + 26 * m; g.fillStyle = 'rgba(60,20,60,.95)'; g.beginPath(); g.ellipse(0, y + h / 2 - 2, w * (.8 + .25 * m) + 6, h / 2 + 6, 0, 0, TAU); g.fill(); chHumanMouth(g, y, w, m); }

// the purple mohawk: spikes up the middle, red collar, the arm up waving
CROWD_DRAW.sm_mohawk = (g, m, t, v) => {
  const mo = cbV([[140, 60, 200], [40, 170, 90], [230, 80, 160]], v);
  const body = cbBody(g, CB_BLACK, 30601, { w0: 52, w1: 176, w2: 216, amt: .3 });
  g.save(); g.clip(body); paint(g, 3, .25); for (let y = 140; y < 430; y += 18) { g.beginPath(); g.moveTo(-230, y); g.lineTo(230, y + 6); g.stroke(); } g.restore(); // the card's ruled shading
  pane(g, smoothPath([[-60, 64], [0, 86], [60, 64], [56, 100], [0, 120], [-56, 100]]), [190, 40, 44], 30602, { ew: 6, shade: .25, lw: 5 }); // red collar
  // the arm up, waving
  const wv = .14 * Math.sin(t * 7);
  g.save(); g.translate(-128, 120); g.rotate(wv);
  pane(g, polyPath(limbPts([[0, 0], [-6, -100], [6, -180]], [62, 56, 48])), CB_BLACK, 30603, { ew: 10, shade: .25, lw: 6, amt: .3 });
  pane(g, smoothPath([[-18, -176], [30, -176], [34, -214], [24, -236], [-12, -238], [-24, -214]]), CB_GHOST, 30604, { ew: 8, shade: .18, lw: 5, amt: .3 }); // the open hand
  for (let k = 0; k < 4; k++) pane(g, ellPath(-10 + k * 13, -246, 6, 13), CB_GHOST, 30612 + k, { ew: 4, shade: .15, lw: 4, amt: .3 });
  pane(g, ellPath(-28, -204, 7, 14, -.6), CB_GHOST, 30616, { ew: 4, shade: .15, lw: 4, amt: .3 });
  g.restore();
  cbNeck(g, CB_GHOST, 30605, 15);
  cbHead(g, CB_GHOST, 30606, 52, 68, .12);
  pane(g, smoothPath([[-52, -10], [-50, -50], [-22, -66], [22, -66], [50, -50], [52, -10], [40, -40], [-40, -40]]), [70, 66, 76], 30609, { ew: 6, shade: .15, lw: 5 }); // shaved sides
  const sp = [[-32, -54]]; for (let k = 0; k < 4; k++) { const x = -32 + k * 16; sp.push([x + 6, -62 - [70, 92, 96, 74][k]], [x + 16, -66]); } sp.push([32, -54], [0, -46]);
  pane(g, polyPath(sp), mo, 30610, { ew: 10, shade: .2, lw: 6 });
  cbGothEyes(g, 21, -4, m);
  paint(g, 3, .55); g.beginPath(); g.moveTo(-2, 2); g.quadraticCurveTo(-6, 16, -7, 20); g.quadraticCurveTo(0, 24, 7, 20); g.stroke();
  cbGothLips(g, 36, 18, m);
  pane(g, circPath(-52, 30, 7), [200, 200, 210], 30611, { ew: 2, shade: 0, lw: 3 }); // an earring
};
CROWD_META.sm_mohawk = { group: 'b', film: 'Satisfied Mind', who: 'the goth with the purple mohawk' };

// the grandad: a tall top hat, mutton-chop whiskers, the white collar band, black frock coat
CROWD_DRAW.sm_grandad = (g, m, t, v) => {
  const band = cbV([[110, 40, 140], [170, 30, 40], [110, 40, 140]], v), wh = cbV([[60, 54, 58], [60, 54, 58], [200, 200, 206]], v);
  const body = cbBody(g, CB_BLACK, 30701, { w0: 52, w1: 176, w2: 216, amt: .3 });
  g.save(); g.clip(body); paint(g, 3, .25); for (let y = 140; y < 430; y += 18) { g.beginPath(); g.moveTo(-230, y); g.lineTo(230, y + 6); g.stroke(); } g.restore();
  for (const sd of [-1, 1]) pane(g, polyPath([[sd * 30, 76], [sd * 90, 74], [sd * 60, 230], [sd * 6, 140]]), mix(CB_BLACK, [255, 255, 255], .1), 30702 + sd, { ew: 8, shade: .2, lw: 5, amt: .3 }); // lapels
  pane(g, polyPath([[-34, 66], [34, 66], [30, 96], [-30, 96]]), [246, 244, 238], 30705, { ew: 6, shade: .12, lw: 5 }); // white collar band
  cbButtons(g, 0, [260, 330, 400], 10, [90, 86, 96], 30706);
  cbNeck(g, CB_GHOST, 30710, 15);
  cbHead(g, CB_GHOST, 30711, 52, 68, 0);
  for (const sd of [-1, 1]) pane(g, smoothPath([[sd * 50, -32], [sd * 58, 10], [sd * 50, 50], [sd * 30, 64], [sd * 26, 44], [sd * 40, 10], [sd * 42, -30]]), wh, 30714 + sd, { ew: 6, shade: .2, lw: 5 }); // mutton chops
  pane(g, smoothPath([[-30, 64], [0, 76], [30, 64], [14, 86], [-14, 86]]), wh, 30717, { ew: 4, shade: .2, lw: 4 });
  cbGothEyes(g, 20, -6, m);
  paint(g, 3, .6); g.beginPath(); g.moveTo(-2, 0); g.quadraticCurveTo(-7, 16, -8, 20); g.quadraticCurveTo(0, 25, 8, 20); g.stroke();
  cbGothLips(g, 36, 17, m);
  // the top hat, tall, with its band
  pane(g, polyPath([[-46, -44], [-50, -148], [50, -148], [46, -44]]), [30, 28, 34], 30718, { ew: 16, shade: .15, lw: 7 });
  pane(g, polyPath([[-47, -72], [47, -72], [46, -50], [-46, -50]]), band, 30719, { ew: 6, shade: .2, lw: 5 });
  pane(g, smoothPath([[-84, -40], [-46, -54], [46, -54], [84, -40], [46, -30], [-46, -30]]), [30, 28, 34], 30720, { ew: 8, shade: .15, lw: 6 });
  g.fillStyle = 'rgba(255,255,255,.14)'; g.fillRect(-30, -140, 12, 64);
};
CROWD_META.sm_grandad = { group: 'b', film: 'Satisfied Mind', who: 'the goth grandad in the top hat' };

// ---- We Got Time: a ministry clerk from the waiting hall. All grey: grey face, grey coat, black homburg, his
// numbered ticket held up; his hat lifts off his head on the beat, like every hat in the hall ----
CROWD_DRAW.wgt_clerk = (g, m, t, v) => {
  const skin = [214, 200, 186], coat = cbV([[118, 116, 108], [100, 106, 116], [126, 118, 104]], v), hatc = [40, 38, 42];
  const body = cbBody(g, coat, 30801, { w0: 54, w1: 176, w2: 216, amt: .4 });
  g.save(); g.clip(body); paint(g, 4, .22); for (let x = -260; x < 0; x += 16) { g.beginPath(); g.moveTo(x, 430); g.lineTo(x + 140, 100); g.stroke(); } g.restore(); // the coat's hatching
  for (const sd of [-1, 1]) pane(g, polyPath([[sd * 22, 72], [sd * 80, 68], [sd * 96, 120], [sd * 40, 240], [sd * 8, 120]]), mix(coat, [0, 0, 0], .18), 30802 + sd, { ew: 8, shade: .2, lw: 5, amt: .4 });
  pane(g, polyPath([[-22, 72], [22, 72], [0, 130]]), [226, 224, 214], 30805, { ew: 5, shade: .12, lw: 4 });
  pane(g, polyPath([[-8, 80], [8, 80], [10, 150], [0, 166], [-10, 150]]), [70, 70, 76], 30806, { ew: 4, shade: .15, lw: 4 }); // a grey tie
  // the ticket, held up in front of his chest
  pane(g, polyPath(limbPts([[150, 330], [130, 250], [96, 214]], [60, 54, 46])), coat, 30807, { ew: 8, shade: .3, lw: 6, amt: .4 });
  g.save(); g.translate(86, 182); g.rotate(-.12);
  pane(g, polyPath([[-46, -34], [46, -34], [46, 34], [-46, 34]]), [238, 232, 210], 30808, { ew: 6, shade: .12, lw: 5 });
  paint(g, 4, .7); for (let k = 0; k < 7; k++) { g.beginPath(); g.moveTo(-34 + k * 11, -8); g.lineTo(-34 + k * 11, 12); g.stroke(); } // the number, drawn as tally strokes
  paint(g, 2.4, .5); g.beginPath(); g.moveTo(-34, -22); g.lineTo(34, -22); g.stroke();
  g.restore();
  pane(g, ellPath(96, 214, 18, 16), skin, 30809, { ew: 5, shade: .2, lw: 4 });
  cbNeck(g, skin, 30810);
  cbHead(g, skin, 30811, 54, 68, .1);
  pane(g, smoothPath([[-56, -6], [-54, -40], [-30, -56], [30, -56], [54, -40], [56, -6], [44, -30], [-44, -30]]), [70, 68, 66], 30814, { ew: 6, shade: .15, lw: 5, amt: .3 }); // short grey hair under the hat
  for (const sd of [-1, 1]) { chEye(g, sd * 21, -2, 7, [0, 0]); chLid(g, sd * 21, -2, 7, .3, skin); cbBrow(g, sd * 21, -22 - 4 * m, 20, 0, 4); }
  paint(g, 3, .65); g.beginPath(); g.moveTo(-2, 4); g.quadraticCurveTo(-7, 18, -8, 22); g.quadraticCurveTo(0, 26, 8, 22); g.stroke();
  chHumanMouth(g, 38, 19, m);
  // the homburg, lifting off his head as he sings
  g.save(); g.translate(0, -30 * m);
  pane(g, smoothPath([[-48, -40], [-44, -106], [-18, -116], [0, -106], [18, -116], [44, -106], [48, -40]]), hatc, 30815, { ew: 14, shade: .2, lw: 7, amt: .3 });
  pane(g, polyPath([[-48, -62], [48, -62], [48, -46], [-48, -46]]), [70, 66, 70], 30816, { ew: 6, shade: .15, lw: 5, amt: .3 });
  pane(g, smoothPath([[-92, -38], [-48, -52], [48, -52], [92, -38], [48, -28], [-48, -28]]), hatc, 30817, { ew: 8, shade: .2, lw: 6, amt: .3 });
  g.restore();
};
CROWD_META.wgt_clerk = { group: 'b', film: 'We Got Time', who: 'a clerk from the waiting hall' };

// ---- Satisfied Mind (THE COMPANY card): the little goth girl in her black bob, kohl and a striped collar ----
CROWD_DRAW.sm_gothkid = (g, m, t, v) => {
  const bob = [36, 32, 40], trim = cbV([[240, 236, 228], [140, 60, 200], [190, 40, 44]], v);
  pane(g, smoothPath([[-74, 50], [-80, -10], [-66, -66], [0, -92], [66, -66], [80, -10], [74, 50], [40, 56], [-40, 56]]), bob, 30901, { ew: 16, shade: .2, lw: 7, amt: .3 }); // the bob, behind
  const body = cbBody(g, CB_BLACK, 30902, { w0: 48, w1: 160, w2: 206, amt: .3 });
  g.save(); g.clip(body); for (let k = 0; k < 9; k++) { g.fillStyle = k % 2 ? rgb(trim, .9) : 'rgba(20,16,24,.9)'; g.fillRect(-240, 120 + k * 14, 480, 14); } g.restore(); lead(g, body, 8); // stripes like her stockings
  pane(g, polyPath([[-150, 250], [150, 250], [170, 430], [-170, 430]]), CB_BLACK, 30903, { ew: 20, shade: .25, lw: 7, amt: .3 }); // pinafore
  pane(g, smoothPath([[-56, 66], [0, 92], [56, 66], [50, 100], [0, 116], [-50, 100]]), trim, 30904, { ew: 6, shade: .2, lw: 5 }); // lace collar
  for (let k = 0; k < 9; k++) pane(g, circPath(-44 + k * 11, 104 + Math.sin(k / 8 * Math.PI) * 10, 5), trim, 30905 + k, { ew: 2, shade: 0, lw: 3 });
  cbNeck(g, CB_GHOST, 30915, 14);
  cbHead(g, CB_GHOST, 30916, 56, 62, .14);
  pane(g, polyPath([[-62, -2], [-64, -40], [-40, -70], [40, -70], [64, -40], [62, -2], [50, -26], [-50, -26]]), bob, 30919, { ew: 8, shade: .18, lw: 6, amt: .3 }); // the straight fringe
  cbGothEyes(g, 22, 2, m);
  paint(g, 3, .55); g.beginPath(); g.moveTo(-2, 10); g.quadraticCurveTo(-5, 20, -6, 22); g.quadraticCurveTo(0, 25, 6, 22); g.stroke();
  cbGothLips(g, 34, 15, m);
  pane(g, polyPath([[40, -74], [70, -96], [74, -60]]), [190, 40, 44], 30920, { ew: 5, shade: .2, lw: 4 }); // a red bow
  pane(g, polyPath([[40, -74], [16, -100], [10, -66]]), [190, 40, 44], 30921, { ew: 5, shade: .2, lw: 4 });
};
CROWD_META.sm_gothkid = { group: 'b', film: 'Satisfied Mind', who: 'the little goth girl' };
