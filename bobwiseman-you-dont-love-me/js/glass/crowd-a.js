// Draft 14 crowd, group a: more of this film's own people (see crowd-base.js for the contract). They arrive first.
// The tea-leaf reader (bridge-reader.js), the morning-show host with his owl (bridge-show.js), the woman of the
// windows (figure.js), verse 2's doctor (v2-scenes.js), then Bob's draft-12 wish list: dogs, a donkey, an electrician
// and a plumber, each different from draft 13's (finale-chorus.js). Seeds 20000-29999. Helpers are prefixed ca.

const CA = {
  skinOld: [236, 204, 184], skin: [240, 206, 178], skin2: [214, 162, 128], skinDark: [176, 120, 86],
  violet: [[60, 26, 102], [24, 52, 104], [104, 30, 84]], gold: [238, 172, 32], white: [226, 226, 232], white2: [196, 196, 206],
  tweed: [128, 92, 60], tweed2: [98, 66, 42], shirt: [196, 214, 232], tie: [[124, 26, 44], [36, 70, 130], [40, 110, 60]],
  hatBand: [[150, 28, 44], [40, 70, 150], [220, 150, 30]], felt: [86, 64, 52], felt2: [62, 46, 38],
  owl: [126, 96, 74], owl2: [100, 74, 56], belly: [222, 196, 158],
};
function caV(arr, v) { return arr[((v | 0) % arr.length + arr.length) % arr.length]; }
function caCheeks(g, x, y, r, a = .3) { g.fillStyle = `rgba(232,120,120,${a})`; for (const sd of [-1, 1]) { g.beginPath(); g.arc(sd * x, y, r, 0, TAU); g.fill(); } }
function caBrow(g, x, y, w, lift, sd, lw = 4) { paint(g, lw, .85); g.beginPath(); g.moveTo(x - w * sd * .5, y + 3); g.quadraticCurveTo(x, y - 7 - lift, x + w * sd * .5, y + 1); g.stroke(); }
function caShoulders(g, col, seed, o = {}) { // a plain body: neck at y +60, 440 wide at the bottom
  const w0 = o.w0 || 60, w1 = o.w1 || 185, w2 = o.w2 || 222;
  const p = polyPath([[-w0, 66], [-w1, 124], [-w2, 430], [w2, 430], [w1, 124], [w0, 66]]);
  pane(g, p, col, seed, { ew: 34, shade: .34, lw: 8 }); return p;
}
function caNeck(g, col, seed, w = 17) { pane(g, polyPath([[-w, 48], [-w, 82], [w, 82], [w, 48]]), col, seed, { ew: 8, shade: .3, lw: 4 }); }

// ---- 1. sibyl: the tea-leaf reader, in her pointed violet hood, white hair spilling out, a ringed old hand up ----
CROWD_DRAW.sibyl = (g, m, t, v) => {
  const vi = caV(CA.violet, v), vi2 = mix(vi, [0, 0, 0], .3), vi3 = mix(vi, [255, 255, 255], .14);
  // robe, with fold lines
  const robe = caShoulders(g, vi, 20001, { w0: 70, w1: 196, w2: 230 });
  g.save(); g.clip(robe); paint(g, 12, .22); for (const x of [-140, -60, 30, 120]) { g.beginPath(); g.moveTo(x * .6, 140); g.quadraticCurveTo(x * 1.1, 300, x * 1.3, 430); g.stroke(); } g.restore();
  // the hood: a tall bent point, the reader's shape (bridge-reader.js HOOD) at a third of her size
  const s = .4, HOOD = [[-330, -330], [-372, -520], [-336, -712], [-246, -870], [-132, -985], [-30, -1066], [70, -1010], [180, -880], [276, -716], [318, -530], [300, -330], [0, -300]];
  const hood = smoothPath(HOOD.map(([x, y]) => [x * s, (y + 735) * s + 4]));
  pane(g, hood, vi2, 20002, { ew: 40, shade: .45, lw: 8 });
  g.save(); g.clip(hood); paint(g, 4, .35); g.beginPath(); g.moveTo(-12, -128); g.quadraticCurveTo(-4, -110, 0, -82); g.stroke(); g.restore();
  // a hood star and a moon, gold, on the hood's sides
  pane(g, polyPath([...Array(10)].map((_, k) => { const a = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? 6 : 14; return [-96 + Math.cos(a) * r, 40 + Math.sin(a) * r]; })), CA.gold, 20003, { ew: 4, shade: .15, lw: 3 });
  { const p = new Path2D(); p.arc(100, 30, 14, 0, TAU); p.arc(106, 25, 12, 0, TAU, true); pane(g, p, CA.gold, 20004, { ew: 4, shade: .15, lw: 3 }); }
  // the dark inside of the hood, its gold trim
  const open = ellPath(0, 6, 76, 94);
  pane(g, open, [30, 18, 44], 20005, { ew: 10, shade: .2, lw: 7 });
  g.lineWidth = 9; g.strokeStyle = rgb(CA.gold); g.stroke(open); lead(g, ellPath(0, 6, 81, 99), 4); lead(g, ellPath(0, 6, 71, 89), 4);
  // long white hair either side, down onto the robe
  for (const sd of [-1, 1]) for (let k = 0; k < 2; k++) {
    const x0 = sd * (62 - k * 12);
    pane(g, smoothPath([[x0, -40 + k * 14], [x0 + sd * 12, 20], [x0 + sd * 6, 90], [x0 + sd * 16, 170 - k * 24], [x0 - sd * 10, 172 - k * 24], [x0 - sd * 14, 80], [x0 - sd * 8, 10]]), k ? CA.white2 : CA.white, 20010 + k + (sd + 1) * 2, { ew: 8, shade: .22, lw: 4 });
  }
  // her face: round, kindly, lined
  const face = smoothPath([[0, -64], [40, -58], [54, -24], [54, 12], [46, 40], [30, 62], [0, 74], [-30, 62], [-46, 40], [-54, 12], [-54, -24], [-40, -58]]);
  pane(g, face, CA.skinOld, 20020, { ew: 22, shade: .24, lw: 6 });
  caCheeks(g, 32, 22, 13, .38);
  g.save(); g.clip(face); g.fillStyle = 'rgba(30,16,40,.32)'; g.fillRect(-60, -70, 120, 22); g.restore(); // the hood's shadow on her brow
  paint(g, 2.2, .5); for (const y of [-40, -33]) { g.beginPath(); g.moveTo(-20, y); g.quadraticCurveTo(0, y - 4, 20, y); g.stroke(); } // forehead lines
  for (const sd of [-1, 1]) {
    chEye(g, sd * 22, -8, 8, [sd * -.2, -.3]);
    paint(g, 2.2, .55); for (const k of [0, 1]) { g.beginPath(); g.moveTo(sd * 36, -10 + k * 8); g.lineTo(sd * (44 + k * 2), -14 + k * 12); g.stroke(); } // crow's feet
    caBrow(g, sd * 22, -26 - 5 * m, 26, 2, sd, 3.6);
  }
  paint(g, 3.2, .7); g.beginPath(); g.moveTo(-2, -4); g.quadraticCurveTo(-2, 10, 2, 16); g.stroke(); g.beginPath(); g.arc(1, 19, 8, .15 * Math.PI, .95 * Math.PI); g.stroke();
  paint(g, 2.2, .55); for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(sd * 22, 26); g.quadraticCurveTo(sd * 32, 38, sd * 30, 52); g.stroke(); }
  chHumanMouth(g, 36, 17, m);
  // her old hand up by her face: sleeve, bony fingers, three rings
  const wav = .1 * Math.sin(t * 2.2);
  pane(g, smoothPath(limbPts([[-170, 300], [-176, 200], [-130, 128]], [96, 80, 62])), vi3, 20030, { ew: 24, shade: .36, lw: 7 });
  pane(g, ellPath(-128, 124, 36, 14, -.3), CA.gold, 20031, { ew: 6, shade: .2, lw: 5 }); // the cuff's gold edge
  g.save(); g.translate(-122, 104); g.rotate(-.18 + wav);
  pane(g, smoothPath([[-26, 14], [-30, -14], [-18, -34], [16, -36], [28, -14], [24, 16], [0, 22]]), CA.skinOld, 20032, { ew: 10, shade: .25, lw: 5 });
  const rings = [[46, 150, 92], [124, 52, 170], [70, 120, 200]];
  [[-18, 30], [-6, 38], [7, 36], [19, 28]].forEach(([fx, L], k) => {
    const pts = [[fx, -30], [fx + (k - 1.5) * 2, -30 - L * .55], [fx + (k - 1.5) * 4, -30 - L]];
    pane(g, smoothPath(limbPts(pts, [12, 10.5, 8.5])), CA.skinOld, 20033 + k, { ew: 6, shade: .25, lw: 4 });
    paint(g, 1.8, .6); g.beginPath(); g.moveTo(pts[1][0] - 4, pts[1][1]); g.lineTo(pts[1][0] + 4, pts[1][1]); g.stroke(); // knuckle
    if (k < 3) { pane(g, polyPath([[fx - 7, -40], [fx + 7, -40], [fx + 7, -46], [fx - 7, -46]]), CA.gold, 20040 + k, { ew: 3, shade: .15, lw: 2.5 }); pane(g, circPath(fx, -43, 5), rings[k], 20044 + k, { ew: 3, shade: .2, lw: 2.5 }); }
  });
  pane(g, smoothPath(limbPts([[-26, 4], [-38, -12], [-42, -28]], [13, 11, 9])), CA.skinOld, 20048, { ew: 6, shade: .25, lw: 4 }); // thumb
  g.restore();
};
CROWD_META.sibyl = { group: 'a', film: "You Don't Love Me", who: 'the tea-leaf reader from the bridge' };

// ---- 2. host: the morning-show host as himself: felt hat with the band, the grin, tweed and his owl puppet singing too ----
CROWD_DRAW.host = (g, m, t, v) => {
  const tie = caV(CA.tie, v), band = caV(CA.hatBand, v);
  const body = caShoulders(g, CA.tweed, 21001, { w0: 58, w1: 176, w2: 214 });
  g.fillStyle = 'rgba(70,46,28,.4)'; for (let q = 0; q < 50; q++) g.fillRect(lerp(-190, 190, rnd(q, 21002)), lerp(120, 410, rnd(q, 21003)), 5, 2.5);
  pane(g, polyPath([[-36, 70], [36, 70], [0, 196]]), CA.shirt, 21004, { ew: 8, shade: .12, lw: 5 });
  for (const sd of [-1, 1]) pane(g, polyPath([[sd * 36, 70], [sd * 80, 80], [sd * 62, 220], [0, 250], [0, 196]]), CA.tweed2, 21005 + sd, { ew: 10, shade: .25, lw: 5 });
  pane(g, polyPath([[-13, 74], [13, 74], [10, 94], [-10, 94]]), tie, 21008, { ew: 4, shade: .2, lw: 4 });
  pane(g, polyPath([[-10, 94], [10, 94], [24, 186], [0, 212], [-24, 186]]), tie, 21009, { ew: 8, shade: .22, lw: 4 });
  pane(g, polyPath([[-150, 300], [-60, 298], [-60, 330], [-150, 332]]), CA.tweed2, 21010, { ew: 6, shade: .25, lw: 5 }); // a pocket flap
  pane(g, polyPath([[-100, 228], [-70, 226], [-74, 252], [-100, 252]]), [244, 238, 226], 21011, { ew: 4, shade: .15, lw: 4 }); // hankie
  caNeck(g, CA.skin, 21012, 16);
  // the head, as bridge-show.js hostHead: shaggy hair to the collar, fringe, sideburns, blue eyes
  const rx = 57, ry = 72, hp = (pts) => smoothPath(pts.map(([x, y]) => [x * rx, y * ry]));
  const shag = []; for (let k = 0; k <= 22; k++) { const a = Math.PI - k / 22 * Math.PI, w = 1 + .05 * Math.sin(k * 2.7) + .04 * Math.sin(k * 5.3); shag.push([Math.cos(a) * 1.3 * w, -.1 - Math.sin(a) * 1.1 * w]); }
  pane(g, hp([...shag, [1.32, .22], [1.24, .62], [1.4, .92], [1.08, .88], [.74, .42], [-.74, .42], [-1.08, .88], [-1.4, .92], [-1.24, .62], [-1.32, .22]]), [176, 132, 76], 21013, { ew: 26, shade: .3, lw: 7 });
  pane(g, ellPath(0, 0, rx, ry), [242, 208, 182], 21014, { ew: 26, shade: .26, lw: 7 });
  caCheeks(g, 36, 24, 13);
  for (const sd of [-1, 1]) pane(g, hp([[sd * .82, -.5], [sd * 1.04, -.4], [sd * 1.02, .3], [sd * .94, .36], [sd * .86, -.08]]), [176, 132, 76], 21015 + sd, { ew: 8, shade: .24, lw: 5 });
  const fr = [[-1.06, -.2], [-1.0, -.62], [1.0, -.62], [1.06, -.2]];
  for (let k = 0; k <= 9; k++) { const u = 1 - k / 9; fr.push([lerp(-.98, 1.0, u), -.32 - .1 * Math.sin(u * Math.PI) - (k % 2 ? .1 : 0)]); }
  pane(g, hp(fr), [176, 132, 76], 21018, { ew: 12, shade: .22, lw: 6 });
  const up = .5 + .5 * Math.min(1, m * 3);
  for (const sd of [-1, 1]) {
    const ex = sd * 23, ey = -4;
    g.fillStyle = 'rgba(244,240,228,1)'; g.beginPath(); g.ellipse(ex, ey, 11, 8.5, 0, 0, TAU); g.fill();
    g.fillStyle = 'rgba(52,84,110,1)'; g.beginPath(); g.arc(ex + sd * 2.5, ey - 1, 5.2, 0, TAU); g.fill();
    g.fillStyle = 'rgba(16,12,10,1)'; g.beginPath(); g.arc(ex + sd * 2.5, ey - 1, 2.4, 0, TAU); g.fill();
    g.fillStyle = 'rgba(255,255,255,.85)'; g.beginPath(); g.arc(ex + sd * 2.5 - 1.6, ey - 3, 1.5, 0, TAU); g.fill();
    paint(g, 2.6, .9); g.beginPath(); g.ellipse(ex, ey, 11, 8.5, 0, 0, TAU); g.stroke();
    caBrow(g, ex, ey - 20 - (sd > 0 ? 7 : 3) * up, 26, 2, sd, 4);
  }
  paint(g, 3, .7); g.beginPath(); g.moveTo(-2, -4); g.quadraticCurveTo(-6, 16, -9, 22); g.quadraticCurveTo(0, 27, 9, 22); g.stroke();
  // his grin, opening wide to sing round the top teeth
  const mw = 25, my = 38, oh = 6 + 26 * m;
  const grin = new Path2D(); grin.moveTo(-mw, my - 4); grin.quadraticCurveTo(0, my + 8 + oh, mw, my - 4); grin.quadraticCurveTo(0, my + 2, -mw, my - 4); grin.closePath();
  g.fillStyle = 'rgba(70,16,20,.96)'; g.fill(grin);
  g.save(); g.clip(grin); g.fillStyle = rgb(CH.tooth); g.fillRect(-mw, my - 6, 2 * mw, 8 + 2 * m); g.fillStyle = rgb(CH.tongue); g.beginPath(); g.ellipse(0, my + 4 + oh * .62, 13, 3 + 5 * m, 0, 0, TAU); g.fill(); g.restore();
  paint(g, 3, .85); g.stroke(grin);
  paint(g, 2.2, .55); for (const sd of [-1, 1]) { g.beginPath(); g.arc(sd * (mw + 5), my - 4, 6, sd > 0 ? -.6 : Math.PI - .6, sd > 0 ? .6 : Math.PI + .6); g.stroke(); }
  // his felt hat, low over the fringe
  g.save(); g.translate(0, -50); g.scale(.98, .96);
  pane(g, smoothPath([[-62, -2], [-58, -62], [-38, -100], [-12, -88], [0, -96], [12, -88], [38, -100], [58, -62], [62, -2]]), CA.felt, 21020, { ew: 14, shade: .3, lw: 6 });
  pane(g, polyPath([[-63, -2], [63, -2], [61, -30], [-61, -30]]), band, 21021, { ew: 8, shade: .25, lw: 5 });
  pane(g, smoothPath([[-104, 4], [-80, -10], [0, -14], [80, -10], [104, 4], [84, 16], [0, 20], [-84, 16]]), CA.felt2, 21022, { ew: 8, shade: .3, lw: 6 });
  paint(g, 3, .55); g.beginPath(); g.moveTo(0, -90); g.quadraticCurveTo(-5, -60, 0, -34); g.stroke();
  g.restore();
  // the owl puppet on his right hand (our left), up by his shoulder, beak open with him
  const bob = 4 * Math.sin(t * 3.1), ox = -150, oy = 70 + bob;
  pane(g, smoothPath(limbPts([[-190, 420], [-196, 300], [-160, oy + 110]], [74, 66, 58])), CA.tweed, 21030, { ew: 22, shade: .36, lw: 7 });
  pane(g, ellPath(-160, oy + 108, 34, 12), [240, 240, 232], 21031, { ew: 4, shade: .15, lw: 4 }); // shirt cuff
  pane(g, smoothPath([[ox - 44, oy + 104], [ox - 48, oy + 30], [ox - 36, oy - 12], [ox, oy - 22], [ox + 36, oy - 12], [ox + 48, oy + 30], [ox + 44, oy + 104]]), CA.owl, 21032, { ew: 16, shade: .3, lw: 6 });
  pane(g, smoothPath([[ox - 26, oy + 104], [ox - 30, oy + 52], [ox, oy + 40], [ox + 30, oy + 52], [ox + 26, oy + 104]]), CA.belly, 21033, { ew: 8, shade: .2, lw: 4 });
  paint(g, 2, .5); for (let r = 0; r < 2; r++) for (let c = -1; c <= 0; c++) { g.beginPath(); g.arc(ox + c * 14 + 7 + (r % 2) * 7 - 7, oy + 64 + r * 16, 6, .2, Math.PI - .2); g.stroke(); }
  for (const sd of [-1, 1]) pane(g, polyPath([[ox + sd * 18, oy - 16], [ox + sd * 38, oy - 44], [ox + sd * 38, oy - 6]]), CA.owl2, 21034 + sd, { ew: 6, shade: .25, lw: 4 });
  for (const sd of [-1, 1]) { pane(g, circPath(ox + sd * 18, oy + 8, 16), [244, 196, 40], 21037 + sd, { ew: 6, shade: .25, lw: 4 }); g.fillStyle = 'rgba(16,12,10,1)'; g.beginPath(); g.arc(ox + sd * 18 + 4, oy + 8, 7, 0, TAU); g.fill(); }
  const bk = 4 + 14 * m; // the beak: top half, and the bottom half dropping
  pane(g, polyPath([[ox - 9, oy + 22], [ox + 9, oy + 22], [ox, oy + 34]]), C.amber, 21040, { ew: 4, shade: .2, lw: 3 });
  g.fillStyle = rgb(CH.mouth); g.beginPath(); g.moveTo(ox - 8, oy + 30); g.lineTo(ox + 8, oy + 30); g.lineTo(ox, oy + 30 + bk); g.closePath(); g.fill();
  pane(g, polyPath([[ox - 7, oy + 30 + bk * .4], [ox + 7, oy + 30 + bk * .4], [ox, oy + 36 + bk]]), C.amber, 21041, { ew: 4, shade: .2, lw: 3 });
};
CROWD_META.host = { group: 'a', film: "You Don't Love Me", who: 'the morning-show host from the bridge, with his owl' };

// ---- 3. saint: the woman of the windows as a bust: auburn hair, fringe, gold collar, ruby gown, mantle, a nimbus ----
CROWD_DRAW.saint = (g, m, t, v) => {
  const mantle = caV([C.green, C.blue, C.purple], v), dress = caV([C.ruby, C.murrey, C.ruby2], v), hair = caV([C.hair, [140, 70, 30], [70, 40, 24]], v);
  // the nimbus behind her head, rayed
  pane(g, circPath(0, -12, 108), C.gold, 22001, { ew: 22, shade: .25, lw: 7 });
  paint(g, 3, .4); for (let k = 0; k < 16; k++) { const a = k / 16 * TAU; g.beginPath(); g.moveTo(Math.cos(a) * 80, -12 + Math.sin(a) * 80); g.lineTo(Math.cos(a) * 102, -12 + Math.sin(a) * 102); g.stroke(); }
  lead(g, circPath(0, -12, 84), 5);
  // hair behind, to the shoulders
  pane(g, smoothPath([[-64, -52], [-38, -90], [0, -98], [38, -90], [64, -52], [78, 10], [88, 80], [94, 136], [56, 146], [28, 110], [-28, 110], [-56, 146], [-94, 136], [-88, 80], [-78, 10]]), hair, 22002, { ew: 26, amt: .5, lw: 7 });
  // the mantle over her shoulders, the gown, the gold collar
  const man = polyPath([[-46, 96], [-150, 140], [-200, 260], [-226, 430], [226, 430], [200, 260], [150, 140], [46, 96]]);
  pane(g, man, mantle, 22003, { ew: 40, shade: .4, lw: 8 });
  g.save(); g.clip(man); paint(g, 14, .2); for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(sd * 150, 200); g.quadraticCurveTo(sd * 180, 330, sd * 190, 430); g.stroke(); } g.restore();
  pane(g, polyPath([[-64, 104], [64, 104], [96, 300], [112, 430], [-112, 430], [-96, 300]]), dress, 22004, { ew: 34, shade: .38, lw: 7 });
  pane(g, polyPath([[-22, 48], [22, 48], [26, 116], [-26, 116]]), C.flesh, 22005, { ew: 12, shade: .25, amt: .4, lw: 5 });
  const col = new Path2D(); col.moveTo(-68, 106); col.quadraticCurveTo(0, 176, 68, 106); col.quadraticCurveTo(0, 140, -68, 106); col.closePath();
  pane(g, col, C.gold, 22006, { ew: 10, lw: 6 });
  // praying hands at her chest
  for (const sd of [-1, 1]) {
    pane(g, smoothPath(limbPts([[sd * 150, 430], [sd * 90, 330], [sd * 26, 300]], [80, 70, 54])), mix(mantle, [0, 0, 0], .18), 22007 + sd, { ew: 22, shade: .4, lw: 7 });
    pane(g, ellPath(sd * 30, 300, 12, 26, sd * .6), C.gold, 22010 + sd, { ew: 6, lw: 5 });
    pane(g, smoothPath([[0, 296], [sd * 20, 286], [sd * 22, 250], [sd * 10, 214], [0, 206]]), C.flesh, 22013 + sd, { ew: 8, shade: .22, amt: .35, lw: 5 });
  }
  paint(g, 2, .6); g.beginPath(); g.moveTo(0, 208); g.lineTo(0, 294); g.stroke();
  // her face, singing (her own long nose and heavy lids, the brows lifting on the note)
  const face = ellPath(0, 0, 57, 73);
  pane(g, face, C.flesh, 22016, { ew: 20, shade: .24, amt: .35, lw: 7 });
  caCheeks(g, 32, 24, 12, .26);
  for (const sd of [-1, 1]) {
    chEye(g, sd * 24, -8, 7.5, [0, -.5]); chLid(g, sd * 24, -8, 7.5, .38 - .2 * m, C.flesh);
    caBrow(g, sd * 24, -27 - 6 * m, 30, 0, sd, 4.2);
  }
  paint(g, 4, .85); g.beginPath(); g.moveTo(-3, -18); g.quadraticCurveTo(4, 8, 5, 20); g.quadraticCurveTo(0, 25, -7, 22); g.stroke();
  chHumanMouth(g, 36, 15, m);
  // the fringe
  pane(g, smoothPath([[-62, -16], [-58, -60], [-24, -94], [20, -94], [58, -60], [62, -16], [44, -42], [14, -36], [-16, -46], [-46, -34]]), hair, 22018, { ew: 18, amt: .5, lw: 6 });
  paint(g, 3, .5); for (const x of [-40, -10, 22, 46]) { g.beginPath(); g.moveTo(x * .5, -88); g.quadraticCurveTo(x, -72, x * 1.05, -46); g.stroke(); }
};
CROWD_META.saint = { group: 'a', film: "You Don't Love Me", who: 'the woman in the windows (the narrator), with a nimbus' };

// ---- 4. doctor: verse 2's doctor: frock coat, ruby cravat, mutton chops, head mirror, stethoscope round his neck ----
CROWD_DRAW.doctor = (g, m, t, v) => {
  const coat = caV([[48, 40, 74], [36, 56, 52], [70, 40, 40]], v), coat2 = mix(coat, [255, 255, 255], .14), crav = caV([C.ruby, C.gold, C.blue], v);
  caShoulders(g, coat, 23001, { w0: 56, w1: 186, w2: 222 });
  pane(g, polyPath([[-56, 76], [56, 76], [70, 430], [-70, 430]]), [150, 30, 44], 23002, { ew: 26, shade: .35, lw: 6 }); // waistcoat
  pane(g, polyPath([[-38, 76], [38, 76], [22, 240], [0, 262], [-22, 240]]), C.white, 23003, { ew: 14, amt: .4, lw: 5 });
  for (const y of [300, 350, 400]) pane(g, circPath(0, y, 8), C.gold, 23004 + y, { ew: 4, lw: 4 });
  for (const sd of [-1, 1]) pane(g, polyPath([[sd * 44, 74], [sd * 98, 104], [sd * 84, 250], [sd * 52, 400], [sd * 40, 260]]), coat2, 23010 + sd, { ew: 16, shade: .3, lw: 6 });
  paint(g, 4, .8); g.strokeStyle = 'rgba(238,172,32,.9)'; g.beginPath(); g.moveTo(-6, 380); g.quadraticCurveTo(-40, 420, -66, 388); g.stroke(); // watch chain
  caNeck(g, C.flesh, 23013, 20);
  pane(g, smoothPath([[-40, 74], [0, 60], [40, 74], [15, 92], [22, 150], [0, 162], [-22, 150], [-15, 92]]), crav, 23014, { ew: 12, lw: 6 });
  // the stethoscope: a loop round the neck, the tube down to the chest piece
  const tube = (pts, w = 9) => { const p = new Path2D(); p.moveTo(...pts[0]); for (let k = 1; k + 1 < pts.length; k += 2) p.quadraticCurveTo(...pts[k], ...pts[k + 1]); g.lineCap = 'round'; g.lineWidth = w + 6; g.strokeStyle = LEAD; g.stroke(p); g.lineWidth = w; g.strokeStyle = 'rgb(70,58,52)'; g.stroke(p); };
  tube([[-56, 60], [-80, 150], [-96, 230]]); tube([[56, 60], [80, 150], [96, 210]]);
  pane(g, circPath(-98, 250, 20), [200, 204, 210], 23015, { ew: 6, shade: .25, lw: 5 }); pane(g, circPath(-98, 250, 9), [120, 124, 130], 23016, { ew: 3, shade: .1, lw: 3 });
  for (const sd of [-1, 1]) pane(g, ellPath(sd * 60, 6, 13, 20), C.flesh, 23017 + sd, { ew: 8, shade: .3, lw: 5 });
  const face = ellPath(0, 0, 57, 74);
  pane(g, face, C.flesh, 23020, { ew: 22, shade: .26, amt: .35, lw: 7 });
  caCheeks(g, 34, 22, 13, .32);
  // grey hair at the sides, mutton chops
  for (const sd of [-1, 1]) pane(g, smoothPath([[sd * 42, -60], [sd * 62, -36], [sd * 64, 10], [sd * 56, 54], [sd * 38, 44], [sd * 44, 2], [sd * 36, -38]]), C.grey, 23021 + sd, { ew: 12, amt: .4, lw: 5 });
  for (const sd of [-1, 1]) { chEye(g, sd * 22, -10, 7.5, [0, -.2]); chLid(g, sd * 22, -10, 7.5, .3, C.flesh); caBrow(g, sd * 22, -28 - 6 * m, 28, 2, sd, 4.4); }
  paint(g, 4, .8); g.beginPath(); g.moveTo(-2, -16); g.quadraticCurveTo(5, 10, 5, 22); g.quadraticCurveTo(0, 27, -8, 24); g.stroke();
  chHumanMouth(g, 44, 17, m);
  const ty = 34 - 4 * m;
  pane(g, smoothPath([[-42, ty + 10], [-22, ty - 2], [0, ty + 2], [22, ty - 2], [42, ty + 10], [30, ty + 14], [0, ty + 8], [-30, ty + 14]]), C.grey, 23025, { ew: 8, lw: 5, amt: .3 });
  pane(g, smoothPath([[-30, -58], [-16, -76], [0, -78], [18, -72], [40, -60], [10, -54]]), C.grey, 23028, { ew: 6, amt: .4, lw: 4 }); // a grey quiff past the band
  // the head mirror: band across the crown, the disc with its hole
  pane(g, polyPath([[-58, -54], [58, -54], [56, -42], [-56, -42]]), C.brown, 23026, { ew: 5, lw: 5 });
  pane(g, ellPath(-10, -72, 32, 32), [210, 220, 222], 23027, { ew: 14, lw: 7, amt: .2 });
  g.fillStyle = 'rgba(30,26,30,.9)'; g.beginPath(); g.arc(-10, -72, 6, 0, TAU); g.fill();
  g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.ellipse(-22, -84, 10, 4, -.6, 0, TAU); g.fill();
};
CROWD_META.doctor = { group: 'a', film: "You Don't Love Me", who: "verse 2's doctor, head mirror and stethoscope" };

// A dog's singing mouth under its nose: dark open jaw, tongue, the lower lip dropping by jaw px.
function caDogMouth(g, y, w, jaw, seed, lip) {
  const mouthP = ellPath(0, y + jaw / 2, w, jaw / 2 + 4);
  g.fillStyle = rgb(CH.mouth, .96); g.fill(mouthP);
  g.save(); g.clip(mouthP); g.fillStyle = rgb(CH.tongue); g.beginPath(); g.ellipse(0, y + jaw + 2, w * .62, 4 + jaw * .32, 0, 0, TAU); g.fill(); g.restore();
  paint(g, 3, .85); g.stroke(mouthP);
  if (lip) pane(g, smoothPath([[-w * .9, y + jaw], [0, y + jaw + 12], [w * .9, y + jaw], [w * .6, y + jaw + 18], [-w * .6, y + jaw + 18]]), lip, seed, { ew: 6, shade: .2, lw: 5 });
}
function caShag(cx, cy, rx, ry, n, jag, seed) { // a shaggy outline: points alternating in and out
  const pts = []; for (let k = 0; k < n * 2; k++) { const a = k / (n * 2) * TAU, r = k % 2 ? 1 - jag * (.6 + .4 * rnd(k, seed)) : 1 + jag * .3; pts.push([cx + Math.cos(a) * rx * r, cy + Math.sin(a) * ry * r]); }
  return smoothPath(pts);
}

// ---- 5. sheepdog: an Old English sheepdog: a big shaggy grey-and-white head, fringe right over the eyes ----
CROWD_DRAW.sheepdog = (g, m, t, v) => {
  const grey = [92, 98, 112], white = [236, 234, 228], band = caV([[200, 40, 50], [40, 90, 170], [230, 170, 30]], v);
  pane(g, caShag(0, 300, 230, 210, 14, .1, 24001), grey, 24001, { ew: 34, shade: .32, lw: 8 }); // the shaggy body
  pane(g, caShag(0, 300, 110, 150, 12, .08, 24002), white, 24002, { ew: 20, shade: .2, lw: 6 }); // white chest
  pane(g, smoothPath([[-90, 104], [0, 130], [90, 104], [80, 136], [0, 162], [-80, 136]]), band, 24003, { ew: 6, shade: .25, lw: 5 }); // a bandana
  pane(g, polyPath([[-50, 140], [50, 140], [0, 214]]), band, 24004, { ew: 8, shade: .25, lw: 5 });
  paint(g, 2.4, .5); for (const [x, y] of [[-20, 156], [14, 170], [0, 190]]) { g.beginPath(); g.arc(x, y, 4, 0, TAU); g.stroke(); }
  // the head: a great white mop, a grey cap of hair behind
  const ear = .06 * Math.sin(t * 2.6);
  for (const sd of [-1, 1]) { g.save(); g.translate(sd * 78, -10); g.rotate(sd * (.2 + ear)); pane(g, caShag(0, 30, 34, 70, 7, .16, 24005 + sd), grey, 24005 + sd, { ew: 12, shade: .3, lw: 6 }); g.restore(); }
  pane(g, caShag(0, -10, 96, 104, 20, .07, 24008), white, 24008, { ew: 26, shade: .22, lw: 7 });
  paint(g, 2.4, .35); for (let k = 0; k < 14; k++) { const a = k / 14 * TAU, r0 = 50, r1 = 92; g.beginPath(); g.moveTo(Math.cos(a) * r0, -10 + Math.sin(a) * r0); g.lineTo(Math.cos(a + .1) * r1, -10 + Math.sin(a + .1) * r1); g.stroke(); }
  // the muzzle, the mouth dropping under it, the big black nose
  caDogMouth(g, 46, 26 + 6 * m, 6 + 32 * m, 24009, white);
  pane(g, caShag(0, 30, 54, 34, 13, .05, 24010), white, 24010, { ew: 12, shade: .18, lw: 6 });
  pane(g, ellPath(0, 16, 22, 15), [26, 22, 26], 24011, { ew: 6, shade: .1, lw: 4 });
  g.fillStyle = 'rgba(255,255,255,.45)'; g.beginPath(); g.ellipse(-7, 10, 7, 3.5, 0, 0, TAU); g.fill();
  paint(g, 2.6, .7); g.beginPath(); g.moveTo(0, 30); g.lineTo(0, 40); g.stroke();
  // two shining eyes just peeping under the fringe, which lifts a little on the high notes
  for (const sd of [-1, 1]) chEye(g, sd * 30, -22, 8, [0, .4]);
  const lift = 6 * m, fr = [[-92, -30], [-84, -80], [-40, -112], [0, -118], [40, -112], [84, -80], [92, -30]];
  for (let k = 0; k <= 12; k++) { const u = 1 - k / 12, x = lerp(-88, 88, u); fr.push([x, -10 - lift - (k % 2 ? 0 : 12) - 6 * Math.sin(u * Math.PI)]); }
  pane(g, smoothPath(fr), mix(white, grey, .06), 24012, { ew: 16, shade: .18, lw: 6 });
  paint(g, 2.2, .28); for (const x of [-64, -32, 0, 32, 64]) { g.beginPath(); g.moveTo(x * .6, -106); g.quadraticCurveTo(x * 1.1, -70, x, -26 - lift); g.stroke(); }
  pane(g, polyPath([[0, -114], [-22, -138], [-26, -112]]), band, 24013, { ew: 4, shade: .2, lw: 4 }); pane(g, polyPath([[0, -114], [22, -138], [26, -112]]), band, 24014, { ew: 4, shade: .2, lw: 4 }); // a topknot bow
};
CROWD_META.sheepdog = { group: 'a', film: "You Don't Love Me", who: 'an Old English sheepdog, fringe over his eyes' };

// ---- 6. dachshund: a sleek red dachshund in a striped jumper, his long nose turned to one side, singing ----
CROWD_DRAW.dachshund = (g, m, t, v) => {
  const red = [168, 74, 34], red2 = [112, 44, 20], tan = [214, 140, 80];
  const st = caV([[[40, 90, 160], [236, 228, 210]], [[30, 120, 70], [236, 200, 60]], [[170, 30, 50], [240, 236, 226]]], v);
  // the jumper, striped, with a ribbed polo neck
  const jp = caShoulders(g, st[0], 25001, { w0: 64, w1: 180, w2: 216 });
  g.save(); g.clip(jp); for (let k = 0; k < 6; k++) { g.fillStyle = rgb(st[1]); g.fillRect(-240, 150 + k * 52, 480, 22); } g.restore(); lead(g, jp, 8);
  pane(g, smoothPath([[-66, 60], [0, 50], [66, 60], [72, 100], [0, 112], [-72, 100]]), st[1], 25002, { ew: 8, shade: .25, lw: 6 });
  paint(g, 2.4, .5); for (let x = -60; x <= 60; x += 12) { g.beginPath(); g.moveTo(x, 58); g.lineTo(x * 1.06, 106); g.stroke(); }
  // the far ear (behind), the head, the long nose out to our right
  const ear = .07 * Math.sin(t * 2.4);
  g.save(); g.translate(46, -46); g.rotate(-.3 + ear); pane(g, smoothPath([[-10, 0], [20, -6], [34, 40], [30, 96], [10, 110], [-8, 60]]), red2, 25003, { ew: 10, shade: .3, lw: 6 }); g.restore();
  pane(g, smoothPath([[-50, -40], [-36, -76], [0, -86], [40, -70], [56, -36], [60, 14], [44, 52], [0, 64], [-44, 50], [-56, 10]]), red, 25004, { ew: 24, shade: .28, lw: 7 });
  const jaw = 4 + 26 * m; // the lower jaw, dropping open under the snout
  g.save(); g.translate(28, 30); g.rotate(.32 * m);
  pane(g, smoothPath([[0, -6], [70, 2], [96, 10], [94, 22], [60, 22], [0, 18]]), tan, 25005, { ew: 8, shade: .25, lw: 5 });
  g.restore();
  const mouthP = smoothPath([[26, 26], [120, 18], [116, 22 + jaw], [60, 26 + jaw * .9], [26, 36]]);
  g.fillStyle = rgb(CH.mouth, .96); g.fill(mouthP); g.save(); g.clip(mouthP); g.fillStyle = rgb(CH.tongue); g.beginPath(); g.ellipse(80, 24 + jaw, 30, 4 + jaw * .3, .2, 0, TAU); g.fill(); g.restore(); paint(g, 3, .8); g.stroke(mouthP);
  pane(g, smoothPath([[20, -30], [80, -14], [126, -2], [134, 14], [120, 22], [60, 22], [20, 26]]), red, 25006, { ew: 14, shade: .26, lw: 6 }); // the snout
  pane(g, ellPath(130, 4, 13, 11), [26, 22, 26], 25007, { ew: 5, shade: .1, lw: 4 });
  g.fillStyle = 'rgba(255,255,255,.45)'; g.beginPath(); g.ellipse(126, 0, 5, 3, 0, 0, TAU); g.fill();
  paint(g, 2.4, .6); g.beginPath(); g.moveTo(40, 4); g.quadraticCurveTo(70, 8, 100, 6); g.stroke(); // a crease along the snout
  // tan brows, two eyes (the near one bigger), the near ear hanging in front
  for (const [x, y, r] of [[-6, -24, 9], [34, -28, 7]]) { pane(g, ellPath(x, y - 18 - 4 * m, 9, 5), tan, 25010 + x, { ew: 3, shade: .15, lw: 3 }); chEye(g, x, y, r, [.6, -.2]); }
  g.save(); g.translate(-40, -54); g.rotate(.25 - ear);
  pane(g, smoothPath([[0, 0], [-26, 10], [-40, 70], [-34, 130], [-12, 140], [8, 90], [12, 30]]), red2, 25013, { ew: 14, shade: .3, lw: 6 });
  g.restore();
};
CROWD_META.dachshund = { group: 'a', film: "You Don't Love Me", who: 'a dachshund in a striped jumper' };

// ---- 7. pug: a fawn pug: black mask, bulging round eyes, forehead wrinkles, curly tongue, a bow tie ----
CROWD_DRAW.pug = (g, m, t, v) => {
  const fawn = [222, 184, 128], fawn2 = [196, 152, 96], mask = [44, 34, 34], bow = caV([[200, 30, 60], [60, 110, 200], [40, 150, 90]], v);
  pane(g, smoothPath([[-80, 60], [-190, 120], [-222, 430], [222, 430], [190, 120], [80, 60], [0, 90]]), fawn2, 26001, { ew: 34, shade: .32, lw: 8 }); // the stout body
  pane(g, smoothPath([[-70, 120], [0, 104], [70, 120], [80, 430], [-80, 430]]), fawn, 26002, { ew: 16, shade: .18, lw: 6 });
  for (const sd of [-1, 1]) pane(g, polyPath([[0, 116], [sd * 46, 96], [sd * 50, 140]]), bow, 26003 + sd, { ew: 6, shade: .25, lw: 5 }); // bow tie
  pane(g, circPath(0, 118, 10), mix(bow, [0, 0, 0], .25), 26006, { ew: 4, shade: .2, lw: 4 });
  // folded black ears, the round head
  const ear = .08 * Math.sin(t * 3);
  for (const sd of [-1, 1]) { g.save(); g.translate(sd * 60, -60); g.rotate(sd * (.4 + ear)); pane(g, smoothPath([[0, 0], [sd * 34, -10], [sd * 44, 20], [sd * 20, 40], [0, 24]]), mask, 26007 + sd, { ew: 6, shade: .2, lw: 5 }); g.restore(); }
  pane(g, smoothPath([[-74, -10], [-66, -60], [-30, -82], [30, -82], [66, -60], [74, -10], [66, 40], [36, 72], [0, 80], [-36, 72], [-66, 40]]), fawn, 26010, { ew: 24, shade: .26, lw: 7 });
  paint(g, 3.4, .6); for (const [y, w] of [[-62, 26], [-50, 34], [-38, 20]]) { g.beginPath(); g.moveTo(-w, y + 4); g.quadraticCurveTo(0, y - 6, w, y + 4); g.stroke(); } // forehead wrinkles
  // the black mask round the flat muzzle, the mouth opening wide under it
  caDogMouth(g, 50, 28 + 6 * m, 4 + 30 * m, 26011, null);
  pane(g, smoothPath([[-44, 0], [-20, -16], [0, -10], [20, -16], [44, 0], [48, 34], [28, 56], [0, 50], [-28, 56], [-48, 34]]), mask, 26012, { ew: 10, shade: .1, lw: 6 });
  paint(g, 2.6, .5); g.strokeStyle = 'rgba(120,100,96,.7)'; g.beginPath(); g.moveTo(-30, 8); g.quadraticCurveTo(0, -4, 30, 8); g.stroke(); // the nose roll
  pane(g, ellPath(0, 16, 16, 10), [16, 12, 14], 26013, { ew: 4, shade: .1, lw: 3 });
  g.fillStyle = 'rgba(255,255,255,.4)'; g.beginPath(); g.ellipse(-5, 12, 5, 2.5, 0, 0, TAU); g.fill();
  // bulging round eyes, wide set
  for (const sd of [-1, 1]) { g.fillStyle = rgb(mask); g.beginPath(); g.arc(sd * 38, -20, 19, 0, TAU); g.fill(); chEye(g, sd * 38, -20, 12, [sd * -.3, -.1]); }
};
CROWD_META.pug = { group: 'a', film: "You Don't Love Me", who: 'a fawn pug in a bow tie' };

// ---- 8. donkey: grey, long ears up, a pale muzzle, white eye rings, a mane tuft; the jaw drops to bray along ----
CROWD_DRAW.donkey = (g, m, t, v) => {
  const grey = [138, 128, 124], grey2 = [92, 84, 82], pale = [224, 218, 206], dark = [52, 44, 44];
  const hal = caV([[200, 40, 40], [40, 90, 180], [230, 160, 30]], v);
  // the neck and shoulders, a dark cross down the back of the neck
  pane(g, smoothPath([[-56, 60], [-120, 160], [-222, 430], [222, 430], [120, 160], [56, 60]]), grey, 27001, { ew: 34, shade: .32, lw: 8 });
  pane(g, smoothPath([[-60, 200], [0, 170], [60, 200], [70, 430], [-70, 430]]), mix(grey, pale, .45), 27002, { ew: 14, shade: .2, lw: 6 }); // a paler chest
  // the long ears, twitching in turn
  for (const sd of [-1, 1]) {
    g.save(); g.translate(sd * 30, -60); g.rotate(sd * (.32 + .07 * Math.sin(t * 2.2 + sd)));
    const outer = smoothPath([[-16, 0], [-22, -50], [-4, -104], [6, -108], [20, -50], [16, 0]]);
    pane(g, outer, grey, 27005 + sd, { ew: 10, shade: .3, lw: 6 });
    pane(g, smoothPath([[-8, -6], [-10, -50], [0, -86], [10, -50], [8, -6]]), [224, 190, 186], 27008 + sd, { ew: 6, shade: .2, lw: 4 });
    g.fillStyle = rgb(dark); g.beginPath(); g.ellipse(1, -100, 7, 8, 0, 0, TAU); g.fill(); // dark tips
    g.restore();
  }
  // the long face, a halter across it
  pane(g, smoothPath([[-52, -60], [-28, -82], [28, -82], [52, -60], [54, 0], [44, 50], [40, 90], [-40, 90], [-44, 50], [-54, 0]]), grey, 27011, { ew: 24, shade: .28, lw: 7 });
  pane(g, polyPath([[-10, -90], [10, -90], [16, -54], [-16, -54]]), dark, 27012, { ew: 6, shade: .15, lw: 4 }); // mane tuft
  paint(g, 3, .55); for (const x of [-6, 0, 6]) { g.beginPath(); g.moveTo(x, -88); g.lineTo(x * 1.6, -58); g.stroke(); }
  // the big pale muzzle; the lower lip drops, teeth and tongue showing
  const jaw = 6 + 32 * m;
  pane(g, smoothPath([[-36, 104 + jaw], [36, 104 + jaw], [40, 124 + jaw], [0, 136 + jaw], [-40, 124 + jaw]]), pale, 27013, { ew: 8, shade: .22, lw: 5 });
  const mp = polyPath([[-36, 106], [36, 106], [32, 106 + jaw], [-32, 106 + jaw]]);
  g.fillStyle = rgb(CH.mouth, .96); g.fill(mp);
  g.save(); g.clip(mp); g.fillStyle = rgb(CH.tongue); g.beginPath(); g.ellipse(0, 106 + jaw, 22, 4 + jaw * .3, 0, 0, TAU); g.fill(); g.restore();
  g.fillStyle = rgb([236, 224, 190]); g.fillRect(-26, 106, 52, 9 + 3 * m);
  g.strokeStyle = 'rgba(60,40,30,.6)'; g.lineWidth = 2; for (const x of [-13, 0, 13]) { g.beginPath(); g.moveTo(x, 106); g.lineTo(x, 115 + 3 * m); g.stroke(); }
  pane(g, smoothPath([[-50, 46], [0, 38], [50, 46], [52, 100], [0, 112], [-52, 100]]), pale, 27014, { ew: 14, shade: .22, lw: 6 });
  for (const sd of [-1, 1]) { g.fillStyle = 'rgba(30,20,20,.9)'; g.beginPath(); g.ellipse(sd * 22, 74, 7, 10 + 3 * m, sd * .3, 0, TAU); g.fill(); }
  pane(g, polyPath([[-56, 30], [56, 30], [56, 42], [-56, 42]]), hal, 27015, { ew: 5, shade: .2, lw: 5 }); // halter noseband
  for (const sd of [-1, 1]) pane(g, polyPath([[sd * 50, 30], [sd * 56, -40], [sd * 46, -40], [sd * 40, 30]]), hal, 27016 + sd, { ew: 4, shade: .2, lw: 4 });
  for (const sd of [-1, 1]) pane(g, circPath(sd * 50, 36, 7), C.gold, 27019 + sd, { ew: 3, shade: .2, lw: 3 });
  for (const sd of [-1, 1]) { pane(g, ellPath(sd * 30, -26, 16, 13), pale, 27022 + sd, { ew: 5, shade: .15, lw: 4 }); chEye(g, sd * 30, -26, 8.5, [0, -.3]); chLid(g, sd * 30, -26, 8.5, .25 - .15 * m, grey); }
};
CROWD_META.donkey = { group: 'a', film: "You Don't Love Me", who: 'a grey donkey in a halter' };

// ---- 9. sparky2: a woman electrician: white hard hat with a headlamp, a long braid, hi-vis vest, a meter on a lanyard ----
CROWD_DRAW.sparky2 = (g, m, t, v) => {
  const skin = [176, 118, 84], hatC = caV([[240, 240, 236], [236, 130, 30], [60, 120, 210]], v), vest = [206, 236, 40], hair = [36, 24, 20];
  caShoulders(g, [64, 64, 72], 28001, { w0: 56, w1: 180, w2: 216 }); // a charcoal tee
  for (const sd of [-1, 1]) {
    const vp = polyPath([[sd * 36, 70], [sd * 120, 96], [sd * 190, 140], [sd * 214, 430], [sd * 40, 430], [sd * 22, 160]]);
    pane(g, vp, vest, 28002 + sd, { ew: 18, shade: .2, lw: 7 });
    g.save(); g.clip(vp); for (const y of [270, 350]) { pane(g, polyPath([[-240, y], [240, y], [240, y + 20], [-240, y + 20]]), [214, 214, 220], 28005 + y + sd, { ew: 4, shade: .1, lw: 4 }); } g.restore();
  }
  // a braid over her left shoulder (our right)
  for (let k = 0; k < 6; k++) pane(g, ellPath(70 + k * 6, 70 + k * 30, 15, 20, -.3), hair, 28010 + k, { ew: 6, shade: .25, lw: 4 });
  pane(g, ellPath(108, 254, 10, 6), [220, 60, 60], 28017, { ew: 3, shade: .2, lw: 3 }); // its hair tie
  // the multimeter on a lanyard
  paint(g, 4, .8); g.strokeStyle = 'rgba(30,30,40,.95)'; g.beginPath(); g.moveTo(-40, 90); g.quadraticCurveTo(-60, 180, -86, 230); g.stroke();
  pane(g, polyPath([[-120, 226], [-56, 226], [-56, 314], [-120, 314]]), [236, 190, 40], 28018, { ew: 6, shade: .25, lw: 5 });
  pane(g, polyPath([[-110, 236], [-66, 236], [-66, 262], [-110, 262]]), [120, 180, 150], 28019, { ew: 3, shade: .15, lw: 3 });
  pane(g, circPath(-88, 290, 13), [60, 60, 60], 28020, { ew: 3, shade: .2, lw: 3 });
  caNeck(g, skin, 28021, 16);
  // her face
  for (const sd of [-1, 1]) { pane(g, ellPath(sd * 56, 8, 11, 17), skin, 28022 + sd, { ew: 6, shade: .3, lw: 5 }); pane(g, circPath(sd * 58, 30, 5), CA.gold, 28025 + sd, { ew: 2, shade: .1, lw: 2.5 }); }
  pane(g, ellPath(0, 2, 55, 70), skin, 28027, { ew: 22, shade: .26, lw: 7 });
  caCheeks(g, 32, 24, 12, .28);
  for (const sd of [-1, 1]) {
    chEye(g, sd * 22, -6, 8, [0, -.25]);
    paint(g, 3, .9); g.beginPath(); g.moveTo(sd * 12, -14); g.lineTo(sd * 8, -18); g.moveTo(sd * 32, -13); g.lineTo(sd * 37, -17); g.stroke(); // lashes
    caBrow(g, sd * 22, -26 - 6 * m, 26, 3, sd, 4);
  }
  paint(g, 3, .7); g.beginPath(); g.moveTo(-2, -2); g.quadraticCurveTo(-5, 14, -8, 20); g.quadraticCurveTo(0, 25, 8, 20); g.stroke();
  chHumanMouth(g, 36, 18, m);
  paint(g, 2.6, .55); g.strokeStyle = 'rgba(150,40,50,.8)'; g.beginPath(); g.moveTo(-14, 34); g.quadraticCurveTo(0, 30, 14, 34); g.stroke(); // her top lip
  // the hard hat with its brim all round, a headlamp on an elastic band
  const dome = new Path2D(); dome.moveTo(-68, -36); dome.bezierCurveTo(-70, -130, 70, -130, 68, -36); dome.closePath();
  pane(g, dome, hatC, 28030, { ew: 22, shade: .26, lw: 7 });
  for (const x of [-26, 26]) pane(g, polyPath([[x - 5, -102], [x + 5, -102], [x + 6, -38], [x - 6, -38]]), mix(hatC, [0, 0, 0], .1), 28031 + x, { ew: 4, shade: .2, lw: 3 });
  pane(g, smoothPath([[-86, -32], [-60, -44], [60, -44], [86, -32], [60, -24], [-60, -24]]), hatC, 28034, { ew: 8, shade: .26, lw: 6 });
  pane(g, polyPath([[-68, -66], [68, -66], [68, -54], [-68, -54]]), [40, 40, 50], 28035, { ew: 4, shade: .1, lw: 4 }); // the lamp's band
  pane(g, polyPath([[-20, -80], [20, -80], [20, -42], [-20, -42]]), [70, 70, 80], 28036, { ew: 5, shade: .2, lw: 4 });
  const glow = .7 + .3 * Math.sin(t * 5);
  g.fillStyle = `rgba(255,246,190,${.18 * glow})`; g.beginPath(); g.arc(0, -61, 30, 0, TAU); g.fill();
  pane(g, circPath(0, -61, 13), [255, 244, 170], 28037, { ew: 4, shade: .08, lw: 4, exact: true });
  g.fillStyle = 'rgba(255,255,255,.4)'; g.beginPath(); g.ellipse(-30, -100, 18, 7, -.5, 0, TAU); g.fill();
};
CROWD_META.sparky2 = { group: 'a', film: "You Don't Love Me", who: 'a woman electrician, headlamp on her hard hat, hi-vis vest' };

// ---- 10. plumber2: a young plumber, backwards cap, freckles, blue work shirt with a name patch, plunger on his shoulder ----
CROWD_DRAW.plumber2 = (g, m, t, v) => {
  const skin = CA.skin, cap = caV([[200, 40, 40], [30, 120, 80], [236, 160, 30]], v), shirt = [52, 96, 168], hair = [150, 84, 40];
  caShoulders(g, shirt, 29003, { w0: 58, w1: 182, w2: 218 });
  for (const sd of [-1, 1]) pane(g, polyPath([[sd * 18, 66], [sd * 70, 72], [sd * 54, 136], [sd * 6, 100]]), mix(shirt, [255, 255, 255], .18), 29004 + sd, { ew: 8, shade: .25, lw: 5 }); // collar
  pane(g, ellPath(-96, 210, 40, 22), [240, 236, 226], 29007, { ew: 6, shade: .15, lw: 4 }); // name patch (blank)
  paint(g, 2.4, .5); g.beginPath(); g.moveTo(-118, 210); g.quadraticCurveTo(-96, 202, -74, 212); g.stroke();
  pane(g, polyPath([[-206, 380], [206, 380], [210, 430], [-210, 430]]), [110, 72, 40], 29008, { ew: 8, shade: .25, lw: 6 }); // tool belt
  pane(g, circPath(0, 404, 14), [180, 180, 186], 29009, { ew: 4, shade: .2, lw: 4 });
  // the plunger held over his shoulder: handle, red cup up by his ear
  g.save(); g.translate(140, 140); g.rotate(-.12);
  pane(g, polyPath([[-8, -250], [8, -250], [8, 120], [-8, 120]]), [196, 150, 96], 29001, { ew: 4, shade: .25, lw: 4 });
  pane(g, smoothPath([[-40, -250], [-34, -284], [0, -296], [34, -284], [40, -250], [0, -244]]), [196, 36, 40], 29002, { ew: 10, shade: .3, lw: 5 });
  g.restore();
  // his hand on the plunger handle over the shoulder
  pane(g, smoothPath(limbPts([[150, 420], [190, 300], [150, 210]], [76, 66, 56])), mix(shirt, [0, 0, 0], .12), 29010, { ew: 20, shade: .34, lw: 7 });
  pane(g, smoothPath([[122, 206], [126, 176], [150, 168], [170, 180], [168, 208], [144, 216]]), skin, 29011, { ew: 8, shade: .25, lw: 5 });
  caNeck(g, skin, 29012, 16);
  for (const sd of [-1, 1]) pane(g, ellPath(sd * 58, 8, 12, 19), skin, 29013 + sd, { ew: 8, shade: .3, lw: 5 });
  // messy hair at the sides, the face
  for (const sd of [-1, 1]) pane(g, smoothPath([[sd * 40, -64], [sd * 64, -40], [sd * 66, -6], [sd * 56, -14], [sd * 50, -36]]), hair, 29016 + sd, { ew: 8, shade: .2, lw: 5 });
  pane(g, ellPath(0, 2, 56, 71), skin, 29019, { ew: 22, shade: .26, lw: 7 });
  caCheeks(g, 32, 22, 13, .32);
  g.fillStyle = 'rgba(150,80,40,.55)'; for (let q = 0; q < 16; q++) { const sd = q % 2 ? 1 : -1; g.beginPath(); g.arc(sd * lerp(16, 44, rnd(q, 29020)), lerp(4, 26, rnd(q, 29021)), 2.2, 0, TAU); g.fill(); } // freckles
  for (const sd of [-1, 1]) { chEye(g, sd * 22, -10, 8, [0, -.3]); caBrow(g, sd * 22, -30 - 7 * m, 26, 3, sd, 4.4); }
  paint(g, 3, .7); g.beginPath(); g.moveTo(-2, -4); g.quadraticCurveTo(-6, 12, -9, 18); g.quadraticCurveTo(0, 23, 9, 18); g.stroke();
  chHumanMouth(g, 34, 20, m);
  // the backwards cap: crown, the strap arch over the forehead with a tuft through it, the peak sticking out behind
  pane(g, smoothPath([[-90, -70], [-60, -94], [-20, -100], [-10, -80], [-70, -64]]), mix(cap, [0, 0, 0], .2), 29022, { ew: 8, shade: .26, lw: 6 }); // the peak, behind on our left
  const crown = new Path2D(); crown.moveTo(-64, -40); crown.bezierCurveTo(-68, -132, 68, -132, 64, -40); crown.quadraticCurveTo(0, -56, -64, -40); crown.closePath();
  pane(g, crown, cap, 29023, { ew: 20, shade: .28, lw: 7 });
  paint(g, 2.6, .55); g.beginPath(); g.moveTo(0, -116); g.lineTo(0, -54); g.stroke();
  const gap = new Path2D(); gap.moveTo(-20, -48); gap.quadraticCurveTo(0, -86, 20, -48); gap.closePath();
  pane(g, gap, hair, 29024, { ew: 6, shade: .2, lw: 5 });
  pane(g, polyPath([[-22, -50], [22, -50], [22, -44], [-22, -44]]), [60, 60, 66], 29025, { ew: 3, shade: .2, lw: 3 }); // the snap strap
  pane(g, circPath(0, -112, 6), cap, 29026, { ew: 3, shade: .2, lw: 3 }); // the button
};
CROWD_META.plumber2 = { group: 'a', film: "You Don't Love Me", who: 'a young plumber, backwards cap and a plunger' };
