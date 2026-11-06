// The cast and props, drawn as cels (cel.js). Each function draws at (x, y) = the base/feet centre,
// scale s, in the current transform. All state comes in through the arguments.

// ---------- ink yard ----------
function barrel(g, x, y, s, seed, o = {}) {
  g.save(); g.translate(x, y); g.rotate(o.tilt || 0); g.scale(s * (o.sx || 1), s * (o.sy || 1));
  const body = [[-80, 0], [-93, -55], [-98, -110], [-93, -165], [-80, -220], [0, -226], [80, -220], [93, -165], [98, -110], [93, -55], [80, 0], [0, 5]];
  cel(g, body, '#c88a42', seed);
  for (const k of [-.45, 0, .45]) stroke(g, [[k * 160, -12], [k * 190, -110], [k * 160, -208]], seed + 10 + k * 10, { lw: 3.5, taper: true });
  for (const hy of [-58, -168]) cel(g, [[-94, hy - 12], [0, hy - 16], [94, hy - 12], [95, hy + 12], [0, hy + 16], [-94, hy + 12]], '#6f5a4c', seed + hy, { lw: 5 });
  // the ink at the top, sloshing up when hit
  const sl = o.slosh || 0;
  cel(g, ellPts(0, -222, 80, 20, 10), '#1c2a5e', seed + 30, { lw: 5.5 });
  if (sl > 0) cel(g, [[-70, -222], [-40, -222 - 60 * sl], [-5, -222 - 95 * sl], [30, -222 - 70 * sl], [62, -222 - 30 * sl], [74, -218]], '#1c2a5e', seed + 31, { lw: 5.5 });
  g.fillStyle = 'rgba(160,190,255,.55)'; g.beginPath(); g.ellipse(-24 + CEL.reg[0], -226 + CEL.reg[1], 26, 6, -.1, 0, TAU); g.fill();
  g.restore();
}
function weight(g, x, y, s, seed, sq = 1) {
  g.save(); g.translate(x, y); g.scale(s / sq, s * sq);
  // handle loop
  stroke(g, crPath(ellPts(0, -196, 46, 36, 9), true, 2).concat([[46 * Math.cos(0) * 0, -232]]), seed + 1, { lw: 16, amp: 1.5 });
  cel(g, [[-120, 0], [-112, -8], [-84, -160], [-70, -172], [70, -172], [84, -160], [112, -8], [120, 0]], '#4b4d5c', seed, { lw: 8 });
  g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.moveTo(-60 + CEL.reg[0], -158); g.lineTo(-36, -158); g.lineTo(-70, -14); g.lineTo(-96, -14); g.fill();
  propText(g, '1 TON', 0, -50, 50, PAL.cream, seed + 5);
  g.restore();
}
function drop(g, x, y, r, seed, col = '#1c2a5e') { cel(g, [[x, y - r * 1.5], [x + r * .8, y - r * .1], [x + r * .6, y + r * .7], [x, y + r], [x - r * .6, y + r * .7], [x - r * .8, y - r * .1]], col, seed, { lw: 4.5 }); }
function inkPuddle(g, pts, seed) { cel(g, pts, '#1c2a5e', seed, { lw: 5.5 }); }

// ---------- the publishing house ----------
// chug: 0..1 press phase; open: door; face: {blink, grin}
function pubHouse(g, x, y, s, seed, o = {}) {
  g.save(); g.translate(x, y); g.scale(s * (o.sx || 1), s * (o.sy || 1));
  // chimney + its puffs
  cel(g, [[150, -560], [150, -680], [230, -680], [230, -520]], '#b44a3a', seed + 1);
  for (const p of o.puffs || []) cel(g, ellPts(190 + p[0], -720 - p[1], p[2], p[2] * .82, 8), PAL.white, seed + 50 + p[3], { lw: 5 });
  // walls
  cel(g, [[-360, -500], [360, -500], [360, 0], [-360, 0]], '#e9b96a', seed + 2, { lin: true });
  // the roof with a face: two round attic windows for eyes and a smiling eave
  cel(g, [[-410, -470], [-380, -520], [-200, -700], [0, -770], [200, -700], [380, -520], [410, -470], [200, -500], [0, -508], [-200, -500]], '#c4553f', seed + 3);
  const bl = o.blink || 0;
  eyes(g, 0, -610, 150, seed + 4, { gap: .95, blink: bl, look: o.look || [0, 0] });
  stroke(g, [[-330, -486], [-160, -456], [0, -448], [160, -456], [330, -486]], seed + 5, { lw: 9 });
  stroke(g, [[-345, -500], [-326, -478], [-336, -462]], seed + 6, { lw: 6 }); stroke(g, [[345, -500], [326, -478], [336, -462]], seed + 7, { lw: 6 });
  // big front window with the presses inside
  cel(g, rrPts(-320, -400, 420, 270, 10), '#5b3a2c', seed + 8);
  const ch = o.chug || 0;
  for (const k of [0, 1]) {
    const px = -260 + k * 200, up = (k ? 1 - ch : ch);
    cel(g, rrPts(px, -250, 140, 110, 8), '#7f8794', seed + 20 + k, { lw: 6 });          // press bed
    cel(g, rrPts(px + 50, -390 + up * 50, 40, 90, 6), '#a3abb6', seed + 22 + k, { lw: 5 }); // ram
    cel(g, rrPts(px + 10, -300 + up * 50, 120, 30, 6), '#596170', seed + 24 + k, { lw: 5 }); // platen
    cel(g, ellPts(px + 70, -200, 26, 26, 8), '#e3a92a', seed + 26 + k, { lw: 5 });           // flywheel hub
  }
  // window frame cross
  stroke(g, [[-110, -400], [-110, -130]], seed + 30, { lw: 8 });
  // door
  cel(g, [[150, 0], [150, -230], [180, -280], [240, -298], [300, -280], [330, -230], [330, 0]], '#2f6d8a', seed + 31);
  cel(g, rrPts(205, -150, 70, 16, 4), '#e3a92a', seed + 32, { lw: 4 });
  cel(g, ellPts(305, -120, 10, 10, 6), '#e3a92a', seed + 33, { lw: 4 });
  // the step
  cel(g, rrPts(130, -14, 220, 24, 6), '#a77b55', seed + 34, { lw: 5 });
  g.restore();
}
function paperSheet(g, x, y, s, a, seed) { g.save(); g.translate(x, y); g.rotate(a); g.scale(s, s); cel(g, [[-40, -28], [40, -32], [44, 28], [-38, 30]], PAL.white, seed, { lw: 4.5 }); for (let k = 0; k < 3; k++) stroke(g, [[-26, -14 + k * 14], [26, -16 + k * 14]], seed + k + 1, { lw: 2.5 }); g.restore(); }

// ---------- the man with the fist ----------
// o: {roll (rad), fist: 0..1 raised, look, blink, mouth, walk}
function fistMan(g, x, y, s, seed, o = {}) {
  g.save(); g.translate(x, y); g.scale(s, s);
  if (o.roll) { g.translate(0, -130); g.rotate(o.roll); g.translate(0, 130); }
  const legA = o.walk ? Math.sin(o.walk) * 16 : 0;
  // legs and shoes
  hose(g, [-40, -70], [-46 + legA, -12], 6, 26, '#2c2c3a', seed + 1);
  hose(g, [40, -70], [46 - legA, -12], -6, 26, '#2c2c3a', seed + 3);
  cel(g, ellPts(-58 + legA, -8, 36, 16, 8), '#1e1e26', seed + 5, { lw: 5 });
  cel(g, ellPts(58 - legA, -8, 36, 16, 8), '#1e1e26', seed + 6, { lw: 5 });
  // round body in a suit
  cel(g, ellPts(0, -150, 118, 112, 12), '#3d4b86', seed + 7);
  cel(g, [[-34, -250], [0, -170], [34, -250]], PAL.white, seed + 8, { lw: 5 });
  cel(g, [[-12, -236], [12, -236], [16, -180], [0, -160], [-16, -180]], PAL.orange, seed + 9, { lw: 4.5 });
  // small arm to a small mitten
  hose(g, [-100, -180], [-150, -110], -10, 24, '#3d4b86', seed + 10);
  mitten(g, -156, -98, 22, .4, PAL.white, seed + 12);
  // the big fist
  const fu = o.fist || 0;
  const fx = lerp(150, 175, fu), fy = lerp(-120, -330, fu);
  hose(g, [96, -190], [fx - 20, fy + 30], lerp(-14, 22, fu), 30, '#3d4b86', seed + 13);
  mitten(g, fx, fy, 78, lerp(.2, -.5, fu), PAL.skin, seed + 15, true);
  // head
  cel(g, ellPts(0, -300, 62, 56, 10), PAL.skin, seed + 20);
  eyes(g, 0, -316, 70, seed + 21, { gap: .62, look: o.look || [0, 0], blink: o.blink || 0, brow: o.brow != null ? o.brow : .6 });
  cel(g, ellPts(0, -290, 18, 14, 7), PAL.skin2, seed + 22, { lw: 4.5 });
  cel(g, [[-42, -268], [-20, -278], [0, -272], [20, -278], [42, -268], [26, -258], [0, -264], [-26, -258]], '#4a2e22', seed + 23, { lw: 4 });
  if (o.mouth) mouth(g, 0, -252, 40, o.mouth, seed + 24, o.open || 0);
  // top hat
  cel(g, [[-78, -346], [78, -346], [80, -334], [-80, -334]], '#26262f', seed + 25, { lw: 5.5 });
  cel(g, [[-48, -346], [-44, -486], [44, -486], [48, -346]], '#26262f', seed + 26, { lw: 6, n: 3 });
  cel(g, [[-46, -372], [46, -372], [46, -356], [-46, -356]], PAL.mustard, seed + 27, { lw: 4.5 });
  g.restore();
}
// the wallet, bigger than he is. o: {lid 0..1, wheels 0..1, crank (rad), roll (wheel turn), bills}
function wallet(g, x, y, s, seed, o = {}) {
  g.save(); g.translate(x, y); g.scale(s * (o.sx || 1), s * (o.sy || 1));
  const wv = o.wheels || 0;
  const lift = 70 * wv;
  // castors
  if (wv > 0) for (const wx of [-190, -70, 70, 190]) {
    cel(g, [[wx - 14, -lift], [wx + 14, -lift], [wx + 10, -lift * .45], [wx - 10, -lift * .45]], '#7f8794', seed + wx, { lw: 4 });
    g.save(); g.translate(wx, -28 * wv); g.rotate(o.roll || 0); g.scale(wv, wv);
    cel(g, ellPts(0, 0, 30, 30, 9), '#2a2a34', seed + wx + 1, { lw: 5 });
    cel(g, ellPts(0, 0, 11, 11, 6), PAL.mustard, seed + wx + 2, { lw: 3.5 });
    stroke(g, [[-20, 0], [20, 0]], seed + wx + 3, { lw: 3 });
    g.restore();
  }
  g.translate(0, -lift);
  // bills inside, seen when the lid is up
  const lid = o.lid || 0;
  if (lid > .05) {
    for (let k = 0; k < 5; k++) cel(g, rrPts(-170 + k * 66, -268 - (k % 2) * 16 - lid * 30, 90, 70, 6), k % 2 ? '#8fc46a' : '#77b25a', seed + 60 + k, { lw: 4.5 });
    if (lid > .6) for (let k = 0; k < 6; k++) { const a = -Math.PI / 2 + (k - 2.5) * .28; stroke(g, [[Math.cos(a) * 150, -280 + Math.sin(a) * 60], [Math.cos(a) * 230, -300 + Math.sin(a) * 140]], seed + 70 + k, { lw: 6, ink: PAL.gold }); }
  }
  // body: a fat leather wallet
  cel(g, rrPts(-250, -250, 500, 250, 40), '#8c4c2a', seed + 1, { lw: 8 });
  // stitching
  for (let k = 0; k < 16; k++) { const xx = -220 + k * 29; stroke(g, [[xx, -22], [xx + 14, -22]], seed + 100 + k, { lw: 3, ink: '#e8c79a', amp: 1 }); }
  // the crank on the side
  g.save(); g.translate(258, -120); g.rotate(o.crank || 0);
  stroke(g, [[0, 0], [0, -46], [30, -46]], seed + 40, { lw: 9 });
  cel(g, ellPts(30, -46, 12, 12, 6), PAL.tomato, seed + 41, { lw: 4 });
  g.restore();
  cel(g, ellPts(258, -120, 13, 13, 6), '#7f8794', seed + 42, { lw: 4 });
  // the lid, hinged at the back (left) like a car hood
  g.save(); g.translate(-238, -238); g.rotate(-lid * .95);
  cel(g, rrPts(-8, -30, 496, 74, 30), '#a35b33', seed + 2, { lw: 8 });
  cel(g, rrPts(380, 4, 70, 40, 12), PAL.mustard, seed + 3, { lw: 5 }); // the clasp
  g.restore();
  g.restore();
}

// ---------- the counter wheel and the stacks ----------
function odometer(g, x, y, s, value, spin, seed) {
  g.save(); g.translate(x, y); g.scale(s, s);
  cel(g, rrPts(-400, -110, 800, 170, 26), '#1d8c8a', seed, { lw: 8 });
  const n = 7, dw = 92;
  for (let k = 0; k < n; k++) {
    const cx = -((n - 1) / 2) * (dw + 12) + k * (dw + 12);
    cel(g, rrPts(cx - dw / 2, -88, dw, 126, 10), '#f6eacb', seed + 10 + k, { lw: 5 });
    // drum: the digit and the next one rolling in
    const d = Math.floor(value / Math.pow(10, n - 1 - k)) % 10;
    const roll = spin > 0 ? ((spin * (k + 3) * 2.7) % 1) : 0;
    g.save(); g.beginPath(); g.rect(cx - dw / 2 + 6, -82, dw - 12, 114); g.clip();
    g.font = `92px "SchoolRound"`; g.textAlign = 'center'; g.fillStyle = INK;
    if (spin > 0) { const a = Math.floor(spin * 37 * (k + 1)) % 10; g.fillText(String(a), cx, 2 - roll * 120); g.fillText(String((a + 1) % 10), cx, 122 - roll * 120); g.fillStyle = 'rgba(246,234,203,.4)'; g.fillRect(cx - dw / 2, -82, dw, 114); }
    else g.fillText(String(d), cx + CEL.reg[0] * .3, 6);
    g.restore();
    if (k === 0 || k === 3) { g.fillStyle = INK; g.beginPath(); g.arc(cx + dw / 2 + 6, 32, 7, 0, TAU); g.fill(); } // thousands separators
  }
  // a crank handle and a little bell
  stroke(g, [[400, -20], [450, -20], [450, -70]], seed + 30, { lw: 9 });
  cel(g, ellPts(450, -76, 14, 14, 6), PAL.tomato, seed + 31, { lw: 4 });
  g.restore();
}
const BOOK_COLS = ['#d8452f', '#1d8c8a', '#e3a92a', '#58a6d6', '#e8762c', '#6b3f7a', '#5aa23c'];
// a stack of n books (from the ground up). shown = how many are drawn (the stack grows)
function bookStack(g, x, y, n, seed, bw = 170, bh = 30) {
  for (let k = 0; k < n; k++) {
    const by = y - k * bh, ox = (rnd(seed, k) - .5) * 26, ww = bw * (.9 + rnd(seed, k, 1) * .2), col = BOOK_COLS[Math.floor(rnd(seed, k, 2) * BOOK_COLS.length)];
    cel(g, [[x + ox - ww / 2, by], [x + ox + ww / 2, by], [x + ox + ww / 2, by - bh], [x + ox - ww / 2, by - bh]], col, seed * 100 + k, { lw: 4.5, lin: true, amp: 1.2 });
    g.fillStyle = PAL.cream; g.fillRect(x + ox + ww / 2 - 22 + CEL.reg[0] * .5, by - bh + 7, 16, bh - 12);
  }
}

// ---------- THE BOOK ----------
// o: {title: words shown (0..2), mood, blink, look, arms: [l, r] angles, legs, mirror, tag (swing angle or null), stamp, star, open: 0..1}
function theBook(g, x, y, s, seed, o = {}) {
  g.save(); g.translate(x, y); g.scale(s * (o.sx || 1), s * (o.sy || 1)); g.rotate(o.rot || 0);
  const W2 = 120, Ht = 330, legH = 56;
  // legs
  hose(g, [-50, -legH - 4], [-60 + (o.legs || 0) * 20, -14], 6, 22, PAL.navy, seed + 1);
  hose(g, [50, -legH - 4], [60 - (o.legs || 0) * 20, -14], -6, 22, PAL.navy, seed + 3);
  cel(g, ellPts(-70 + (o.legs || 0) * 20, -10, 34, 15, 8), PAL.tomato, seed + 5, { lw: 5 });
  cel(g, ellPts(70 - (o.legs || 0) * 20, -10, 34, 15, 8), PAL.tomato, seed + 6, { lw: 5 });
  const top = -legH - Ht;
  // arms (behind the cover edges)
  const arms = o.arms || [.4, -.4];
  for (const [side, a] of [[-1, arms[0]], [1, arms[1]]]) {
    const sx = side * (W2 + 2), sy = top + Ht * .55, ex = sx + side * Math.cos(a) * 100, ey = sy - Math.sin(a) * 100;
    hose(g, [sx, sy], [ex, ey], side * 12, 20, '#e3a92a', seed + 10 + side);
    mitten(g, ex + side * 8, ey, 26, side * .5 - a * side, PAL.white, seed + 14 + side);
  }
  // page block (thickness), then the cover
  cel(g, [[W2 - 8, top + 14], [W2 + 26, top + 2], [W2 + 26, -legH - 14], [W2 - 8, -legH + 2]], PAL.white, seed + 20, { lw: 5 });
  for (let k = 0; k < 4; k++) stroke(g, [[W2 + 2, top + 40 + k * 70], [W2 + 20, top + 30 + k * 70]], seed + 21 + k, { lw: 2.5 });
  cel(g, rrPts(-W2, top, W2 * 2, Ht, 22), '#e3a92a', seed + 30, { lw: 8 });
  // cover title band
  cel(g, rrPts(-W2 + 16, top + 18, W2 * 2 - 32, 118, 14), PAL.cream, seed + 31, { lw: 5 });
  const tw = o.title || 0;
  if (tw >= 1) propText(g, '"Nutritional', 0, top + 68, 31, PAL.tomato, seed + 32, { lw: 5 });
  if (tw >= 2) propText(g, 'Facts"', 0, top + 120, 44, PAL.tomato, seed + 33, { lw: 6 });
  // face
  eyes(g, 0, top + 186, 92, seed + 40, { gap: .72, blink: o.blink || 0, look: o.look || [0, 0] });
  const md = o.mood || 'smile';
  if (md === 'beam') mouth(g, 0, top + 240, 84, 'grin', seed + 41, .7);
  else if (md === 'o') mouth(g, 0, top + 250, 60, 'o', seed + 41);
  else mouth(g, 0, top + 244, 64, 'smile', seed + 41);
  // cheeks
  g.fillStyle = 'rgba(232,110,90,.55)'; g.beginPath(); g.ellipse(-70, top + 238, 16, 10, 0, 0, TAU); g.ellipse(70, top + 238, 16, 10, 0, 0, TAU); g.fill();
  // the head mirror, on a band across the top
  if (o.mirror) {
    stroke(g, [[-W2 - 4, top + 8], [-40, top - 6], [40, top - 6], [W2 + 4, top + 8]], seed + 50, { lw: 10 });
    cel(g, ellPts(-40, top - 26, 40, 40, 10), '#cfd8de', seed + 51, { lw: 6 });
    cel(g, ellPts(-40, top - 26, 12, 12, 7), '#7f8794', seed + 52, { lw: 4 });
    g.fillStyle = 'rgba(255,255,255,.8)'; g.beginPath(); g.ellipse(-54, top - 40, 10, 6, -.6, 0, TAU); g.fill();
  }
  // LEGIT stamp on the cover
  if (o.stamp) {
    g.save(); g.translate(0, top + Ht - 46); g.rotate(-.12); g.scale(o.stamp, o.stamp);
    g.strokeStyle = PAL.tomato; g.lineWidth = 7; g.strokeRect(-92, -30, 184, 60);
    propText(g, 'LEGIT', 0, 20, 48, PAL.tomato, seed + 60, { lw: 3 });
    g.restore();
  }
  if (o.star) { g.save(); g.translate(W2 - 30, top + Ht - 120); g.scale(o.star, o.star); cel(g, starPts(0, 0, 44, 20), PAL.gold, seed + 61, { lw: 5 }); g.restore(); }
  // the FREE tag, swinging on its string from the top corner
  if (o.tag != null) {
    g.save(); g.translate(W2 + 10, top + 14); g.rotate(o.tag);
    stroke(g, [[0, 0], [10, 70], [12, 110]], seed + 70, { lw: 4 });
    g.translate(12, 110); g.rotate(-.5);
    cel(g, [[-14, 0], [14, 0], [60, 34], [60, 106], [-60, 106], [-60, 34]], PAL.cream, seed + 71, { lw: 5, lin: true });
    cel(g, ellPts(0, 18, 7, 7, 6), '#7a5232', seed + 72, { lw: 3 });
    propText(g, 'FREE', 0, 88, 40, PAL.green, seed + 73, { lw: 5 });
    g.restore();
  }
  g.restore();
}
// the open book on the desk (two drawings: half open, open)
function openBook(g, x, y, s, seed, u, scribble = 0) {
  g.save(); g.translate(x, y); g.scale(s, s);
  cel(g, [[-250, 0], [0, 14], [250, 0], [250, -24], [0, -10], [-250, -24]], '#e3a92a', seed, { lw: 7, lin: true });
  if (u < 1) {
    cel(g, [[0, -10], [230, -24], [226, -300], [0, -286]], PAL.cream, seed + 1, { lw: 6, lin: true });
    cel(g, [[0, -10], [-70, -30], [-96, -316], [0, -286]], '#e3a92a', seed + 2, { lw: 6, lin: true });
  } else {
    cel(g, [[0, -10], [-120, -22], [-240, -24], [-236, -290], [-120, -300], [0, -284]], PAL.cream, seed + 3, { lw: 6, lin: true });
    cel(g, [[0, -10], [120, -22], [240, -24], [236, -290], [120, -300], [0, -284]], PAL.cream, seed + 4, { lw: 6, lin: true });
    stroke(g, [[0, -24], [0, -270]], seed + 5, { lw: 3 });
    // the intro, scribbled onto the right-hand page (page 1) as he writes
    const lines = Math.ceil(scribble * 7 - 1e-6);
    for (let k = 0; k < lines; k++) {
      const yy = -250 + k * 30, pts = []; const len = Math.min(1, scribble * 7 - k);
      for (let i = 0; i <= 8; i++) pts.push([30 + i * 23 * len, yy + Math.sin(i * 2.1 + k) * 7]);
      stroke(g, pts, seed + 10 + k, { lw: 4, ink: PAL.navy });
    }
  }
  g.restore();
}
// ---------- the doctor ----------
// o: {hold: 'diploma'|'pen'|'pointer'|null, arm: 0..1, blink, look, mouth, phd: 0..1 diploma unroll}
function doctor(g, x, y, s, seed, o = {}) {
  g.save(); g.translate(x, y); g.scale(s * (o.sx || 1), s * (o.sy || 1));
  // long thin legs
  hose(g, [-22, -300], [-30, -16], 8, 20, PAL.navy, seed + 1);
  hose(g, [22, -300], [34, -16], -8, 20, PAL.navy, seed + 3);
  cel(g, ellPts(-44, -10, 36, 14, 8), '#2a2a34', seed + 5, { lw: 5 });
  cel(g, ellPts(50, -10, 36, 14, 8), '#2a2a34', seed + 6, { lw: 5 });
  // white coat, tall and narrow
  cel(g, [[-58, -300], [-46, -500], [-24, -540], [24, -540], [46, -500], [58, -300], [0, -290]], PAL.white, seed + 7);
  stroke(g, [[0, -520], [0, -300]], seed + 8, { lw: 4 });
  cel(g, [[-22, -540], [0, -500], [22, -540]], PAL.sky, seed + 9, { lw: 4.5 });
  // stethoscope
  stroke(g, [[-24, -536], [-40, -480], [-20, -440], [0, -432]], seed + 10, { lw: 6 });
  stroke(g, [[24, -536], [34, -470]], seed + 11, { lw: 6 });
  cel(g, ellPts(-2, -428, 14, 14, 7), '#a3abb6', seed + 12, { lw: 4.5 });
  // arms
  const arm = o.arm || 0;
  hose(g, [-44, -500], [-70, -380], -8, 18, PAL.white, seed + 13);
  mitten(g, -74, -368, 20, .2, PAL.white, seed + 15);
  const hx = o.hand ? o.hand[0] : lerp(60, 120, arm), hy = o.hand ? o.hand[1] : lerp(-370, -520, arm);
  hose(g, [44, -500], [hx, hy], 14, 18, PAL.white, seed + 16);
  // head: round, with a long beak of a nose and round glasses
  g.save(); g.translate(0, -600);
  cel(g, ellPts(0, 0, 54, 58, 10), PAL.skin, seed + 20);
  cel(g, [[10, 4], [96, 26], [12, 30]], '#e79c84', seed + 21, { lw: 5 });
  eyes(g, -2, -10, 66, seed + 22, { gap: .7, blink: o.blink || 0, look: o.look || [.6, 0] });
  stroke(g, crPath(ellPts(-25, -10, 22, 24, 8), true, 2).concat([[-3, -10]]), seed + 23, { lw: 3.5 });
  stroke(g, crPath(ellPts(21, -10, 22, 24, 8), true, 2), seed + 24, { lw: 3.5 });
  if (o.mouth) mouth(g, -6, 36, 30, o.mouth, seed + 25, o.open || 0);
  else stroke(g, [[-20, 34], [-6, 40], [8, 36]], seed + 25, { lw: 4 });
  // mortarboard
  cel(g, [[-40, -44], [40, -44], [36, -66], [-36, -66]], '#26262f', seed + 26, { lw: 5 });
  cel(g, [[-92, -70], [0, -96], [92, -70], [0, -48]], '#26262f', seed + 27, { lw: 5 });
  stroke(g, [[0, -72], [56, -64], [70, -30]], seed + 28, { lw: 4, ink: PAL.gold });
  cel(g, ellPts(70, -22, 8, 12, 6), PAL.gold, seed + 29, { lw: 3 });
  g.restore();
  // what the right hand holds
  if (o.hold === 'diploma') {
    const u = o.phd || 0;
    g.save(); g.translate(hx + 20, hy - 30); if (o.flip) g.scale(-1, 1);
    const w2 = lerp(14, 150, u);
    cel(g, rrPts(-w2, -70, w2 * 2, 140, 8), PAL.cream, seed + 40, { lw: 6 });
    cel(g, rrPts(-w2 - 16, -78, 24, 156, 10), '#e8d7a8', seed + 41, { lw: 5 });
    cel(g, rrPts(w2 - 8, -78, 24, 156, 10), '#e8d7a8', seed + 42, { lw: 5 });
    if (u > .8) { propText(g, 'PHD', 0, 18, 66, PAL.teal, seed + 43, { lw: 7 }); cel(g, starPts(70, 46, 26, 16, 8), PAL.tomato, seed + 44, { lw: 4 }); }
    g.restore();
  }
  if (o.hold === 'pen') {
    g.save(); g.translate(hx, hy); g.rotate(.6 + (o.penWag || 0));
    cel(g, [[-8, 0], [8, 0], [8, -110], [0, -126], [-8, -110]], PAL.tomato, seed + 45, { lw: 4.5 });
    g.restore();
  }
  mitten(g, hx + 4, hy, 22, -.4, PAL.white, seed + 18);
  g.restore();
}
// the pointer stick, held by a mitten coming in from (x0, y0) to the tip (x1, y1)
function pointer(g, x0, y0, x1, y1, seed) {
  const dx = x1 - x0, dy = y1 - y0, l = Math.hypot(dx, dy), nx = -dy / l * 7, ny = dx / l * 7;
  cel(g, [[x0 + nx, y0 + ny], [x1 + nx * .5, y1 + ny * .5], [x1 - nx * .5, y1 - ny * .5], [x0 - nx, y0 - ny]], '#a8693a', seed, { lw: 4.5, n: 2 });
  cel(g, ellPts(x1, y1, 10, 10, 6), INK, seed + 1, { lw: 3 });
  hose(g, [x0 + dx * .06 + 140, y0 + dy * .06 + 60], [x0 + dx * .06, y0 + dy * .06], 10, 22, PAL.white, seed + 2);
  mitten(g, x0 + dx * .06, y0 + dy * .06, 26, Math.atan2(dy, dx) + .4, PAL.white, seed + 4, true);
}

// ---------- the picture-book page ----------
// o: {lift 0..1 bun top, glow 0..1 lettuce highlight}
function burger(g, x, y, s, seed, o = {}) {
  g.save(); g.translate(x, y); g.scale(s, s);
  cel(g, [[-170, -10], [-160, -50], [160, -50], [170, -10], [140, 6], [-140, 6]], '#d99a4a', seed + 1);
  cel(g, [[-180, -50], [-160, -96], [0, -104], [160, -96], [180, -50], [0, -60]], '#6b3a24', seed + 2);
  // the single lettuce leaf, glowing when pointed at
  const gl = o.glow || 0;
  if (gl > 0) { g.save(); g.globalAlpha = gl * .9; cel(g, [[-230, -96], [-120, -150], [0, -160], [120, -150], [230, -96], [120, -70], [0, -62], [-120, -70]], '#fff2a0', seed + 3, { lw: 4, ink: '#e3a92a' }); g.restore(); }
  const lf = []; for (let i = 0; i <= 10; i++) lf.push([-190 + i * 38, -100 - (i % 2) * 22]);
  cel(g, [...lf, [190, -96], [0, -88], [-190, -96]], PAL.leaf, seed + 4);
  // top bun, hinged at the back left
  g.save(); g.translate(-170, -100); g.rotate(-(o.lift || 0) * .55);
  cel(g, [[0, 0], [10, -60], [80, -120], [170, -136], [260, -120], [330, -60], [340, 0], [170, 10]], '#e0a552', seed + 5);
  for (let k = 0; k < 7; k++) cel(g, ellPts(80 + k * 30, -70 - Math.sin(k * 1.9) * 26, 8, 5, 6, k), PAL.cream, seed + 10 + k, { lw: 2.5, amp: .8 });
  g.restore();
  g.restore();
}
function waterGlass(g, x, y, s, seed) {
  g.save(); g.translate(x, y); g.scale(s, s);
  cel(g, [[-80, -260], [80, -260], [64, 0], [-64, 0]], '#e3f3f8', seed, { lw: 6, lin: true });
  cel(g, [[-72, -190], [72, -190], [64, -6], [-64, -6]], '#7fc3e8', seed + 1, { lw: 4, regK: .5, lin: true });
  stroke(g, [[-50, -230], [-40, -40]], seed + 2, { lw: 6, ink: 'rgba(255,255,255,.85)' });
  g.restore();
}
// a generic paper cup of a dark fizzy drink (no brand: teal and orange stripes, a plum straw)
function fizzCup(g, x, y, s, seed, fizz = 0) {
  g.save(); g.translate(x, y); g.scale(s, s);
  cel(g, [[40, -250], [70, -400], [92, -396], [62, -250]], PAL.plum, seed + 1, { lw: 5, lin: true });
  cel(g, ellPts(0, -262, 92, 22, 10), '#4a2a1e', seed + 2, { lw: 6 });
  cel(g, [[-92, -262], [92, -262], [70, 0], [-70, 0]], PAL.teal, seed + 3, { lw: 7, lin: true });
  cel(g, [[-86, -200], [86, -200], [82, -160], [-82, -160]], PAL.orange, seed + 4, { lw: 4.5, lin: true });
  cel(g, [[-78, -110], [78, -110], [74, -70], [-74, -70]], PAL.orange, seed + 5, { lw: 4.5, lin: true });
  for (let k = 0; k < 6; k++) { const yy = -270 - ((fizz * 80 + k * 23) % 90), xx = -60 + k * 24; cel(g, ellPts(xx, yy, 7, 7, 6), '#d9ecf2', seed + 20 + k, { lw: 2.5, amp: .6 }); }
  g.restore();
}
function h2oBubble(g, x, y, s, seed) {
  g.save(); g.translate(x, y); g.scale(s, s);
  cel(g, ellPts(0, 0, 110, 100, 12), 'rgba(205,235,248,.92)', seed, { lw: 7 });
  g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.ellipse(-50, -46, 26, 12, -.6, 0, TAU); g.fill();
  propText(g, 'H2O', 0, 24, 70, PAL.sky, seed + 1, { lw: 7 });
  g.restore();
}
function cartoonHeart(g, x, y, s, seed, col = PAL.pink) { cel(g, heartPts(x, y, s), col, seed, { lw: 5 }); }

// ---------- the lunch counter ----------
const PEOPLE = [
  { col: PAL.sky, hair: '#4a2e22', kind: 0 }, { col: PAL.mustard, hair: '#e3a92a', kind: 1 }, { col: PAL.green, hair: '#2a1810', kind: 2 },
  { col: PAL.pink, hair: '#7a3a22', kind: 3 }, { col: PAL.orange, hair: '#3a2a4a', kind: 0 },
];
function person(g, x, y, s, p, seed, o = {}) {
  g.save(); g.translate(x, y + (o.hop || 0)); g.scale(s, s);
  cel(g, ellPts(0, -110, 100, 110, 11), p.col, seed);
  const up = o.arms || 0;
  for (const side of [-1, 1]) {
    const ex = side * lerp(118, 140, up), ey = lerp(-60, -250, up);
    hose(g, [side * 80, -140], [ex, ey], side * 10, 22, p.col, seed + side * 3);
    mitten(g, ex, ey - 10 * up, 24, side * (up ? -.3 : .5), PAL.white, seed + side * 5);
  }
  const sk = p.kind === 2 ? '#c98a5e' : p.kind === 3 ? '#e8b48e' : PAL.skin;
  cel(g, ellPts(0, -268, 70, 66, 10), sk, seed + 10);
  if (p.kind === 0) cel(g, [[-70, -280], [-60, -330], [0, -346], [60, -330], [70, -280], [40, -310], [0, -318], [-40, -310]], p.hair, seed + 11, { lw: 5 });
  if (p.kind === 1) for (const sd of [-1, 1]) cel(g, ellPts(sd * 62, -300, 30, 40, 8), p.hair, seed + 11 + sd, { lw: 5 });
  if (p.kind === 2) cel(g, ellPts(0, -326, 56, 22, 9), p.hair, seed + 11, { lw: 5 });
  if (p.kind === 3) cel(g, [[-74, -250], [-72, -320], [0, -350], [72, -320], [74, -250], [50, -300], [0, -320], [-50, -300]], p.hair, seed + 11, { lw: 5 });
  eyes(g, 0, -280, 70, seed + 12, { gap: .62, blink: o.blink || 0, look: o.look || [0, 0] });
  mouth(g, 0, -236, 46, o.mouth || 'smile', seed + 13, o.open || 0);
  g.restore();
}
function fryBoat(g, x, y, s, seed) {
  g.save(); g.translate(x, y); g.scale(s, s);
  for (let k = 0; k < 6; k++) { const fx = -40 + k * 16, a = (rnd(seed, k) - .5) * .4; g.save(); g.translate(fx, -40); g.rotate(a); cel(g, [[-7, 0], [7, 0], [7, -70 - rnd(seed, k, 1) * 26], [-7, -72 - rnd(seed, k, 1) * 26]], PAL.gold, seed + k, { lw: 3.5, n: 2, amp: .8 }); g.restore(); }
  cel(g, [[-70, -50], [70, -50], [54, 0], [-54, 0]], PAL.teal, seed + 20, { lw: 5 });
  stroke(g, [[-60, -34], [60, -34]], seed + 21, { lw: 3, ink: PAL.cream });
  g.restore();
}
function tipJar(g, x, y, s, seed) {
  g.save(); g.translate(x, y); g.scale(s, s);
  cel(g, [[-70, 0], [-82, -40], [-82, -170], [-60, -196], [60, -196], [82, -170], [82, -40], [70, 0]], 'rgba(214,236,240,.75)', seed, { lw: 6 });
  cel(g, ellPts(0, -198, 62, 12, 9), 'rgba(170,200,210,.8)', seed + 1, { lw: 5 });
  cel(g, rrPts(-56, -130, 112, 60, 8), PAL.cream, seed + 2, { lw: 4.5 });
  propText(g, 'TIP', 0, -84, 44, PAL.tomato, seed + 3, { lw: 5 });
  stroke(g, [[-60, -180], [-62, -40]], seed + 4, { lw: 5, ink: 'rgba(255,255,255,.8)' });
  g.restore();
}
function fly(g, x, y, s, seed, flap) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = 'rgba(230,245,255,.85)';
  for (const sd of [-1, 1]) { g.beginPath(); g.ellipse(sd * 9, -12 - flap * 5, 10, 16, sd * (.5 + flap * .5), 0, TAU); g.fill(); }
  cel(g, ellPts(0, 0, 11, 9, 7), '#1e1e26', seed, { lw: 3, amp: .6 });
  g.restore();
}
