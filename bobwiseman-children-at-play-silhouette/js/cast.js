// Children at Play (Bob Wiseman), coloured paper silhouettes: this film's palette, cast and farm set.
// Uses the paper kit in kit.js (copied from In Her Dream). Everything is drawn into the global `g`.
//
// Palette: one colour per person, four colours a frame besides the ground.
//   ground   the evening sky and its tints (apricot, peach, pale cream; the washing is cut from it)
//   plum     the whole farm set (house, barn, tree, fence, yard) in darker and lighter cuts of one paper
//   teal     the mother, and nobody else
//   gold     laughter: the laugh rings and the lit hay door. The daughter is cut from a deeper
//            marigold of the same paper, because the laughter the mother hears is hers.
//   rust     her lover
const P = {
  // ground: the sky at the end of a summer day
  skyTop: '#e7a487', sky: '#f0bf96', skyLow: '#f5d4ab', skyPale: '#f8e4c2', sun: '#fbecd0',
  // plum: the set
  hillFar: '#c4928f', hillMid: '#9a6878', set: '#5c3652', setDeep: '#4a2a43', setDark: '#381d32', yard: '#42253b',
  // people
  teal: '#2a8279', tealDeep: '#20675f',
  you: '#e39a2d', youDeep: '#c9831f',
  me: '#b0482c', meDeep: '#913a23',
  // laughter
  gold: '#f1b23a', goldPale: '#f7d27e', glow: '#fbe1a0',
};

// ---- extra hair and hats (head units: the kit's ~1000 box, neck pivot at 580,800, facing right) ----
// drawn from headAcc so they are not clipped at the neck like the kit's HAIR pieces
const HAIR2 = {
  // loose hair to below the shoulders, falling down her back
  long: blob([[420, 250], [300, 300], [228, 430], [206, 610], [214, 800], [232, 960], [300, 1080], [384, 1060], [420, 940],
    [400, 790], [372, 640], [380, 470], [470, 330], [560, 280]], .5),
  // a soft straw hat with a brim, his (left on the ladder later in the song)
  straw: (() => { const p = new Path2D();
    p.addPath(blob([[300, 330], [330, 210], [470, 150], [620, 168], [690, 250], [700, 336]], .55));
    p.addPath(ellipse(500, 340, 330, 38, -.04)); return p; })(),
};
// a headAcc that draws a hair or hat piece in the head's own frame (follows head turn and laugh)
const withHead = (piece, col, k = .265) => (pose) => {
  g.save(); g.rotate(-(pose.head || 0) * .9 - (pose.laugh || 0) * .18); g.scale(k, k); g.translate(-580, -800);
  cut(piece, col, { sh: .3, grain: .2 }); g.restore();
};
// her apron: a second cut of her own paper over the dress
const apron = (col) => () => cut(blob([[-6, -620], [44, -628], [70, -560], [92, -330], [100, -196], [10, -186], [-10, -330], [-14, -560]], .45),
  col, { sh: .45, grain: .24, lift: .1 });

const CAST = {
  // the mother: older, a fuller dress and an apron, her hair in a bun (the kit's 'her' head carries the bun)
  mother: { col: P.teal, kind: 'dress', head: 'her', height: .96, acc: [apron(P.tealDeep)] },
  // the daughter: a grown woman, adult height and head, a knee-length summer dress, loose long hair
  you: { col: P.you, kind: 'dressShort', head: 'her', height: 1, headAcc: withHead(HAIR2.long, P.you) },
  // her lover: a grown man, shirt and trousers, a straw hat
  me: { col: P.me, kind: 'shirt', head: 'short', height: 1.06, headK: .255, headAcc: withHead(HAIR2.straw, P.me, .255) },
};

// ---------------- simple arm IK in puppet units (feet at 0,0; shoulder at +-8,-752) ----------------
const ARM_L1 = 168, ARM_L2 = 190;
function armTo(near, x, y, bend = 1) {
  const tx = x - (near ? 8 : -8), ty = y + 752;
  const d = clamp(Math.hypot(tx, ty), 40, ARM_L1 + ARM_L2 - .5);
  const gam = Math.atan2(tx, ty);
  const beta = Math.acos(clamp((ARM_L1 * ARM_L1 + d * d - ARM_L2 * ARM_L2) / (2 * ARM_L1 * d), -1, 1));
  const a1 = gam - beta * bend;
  const ex = ARM_L1 * Math.sin(a1), ey = ARM_L1 * Math.cos(a1);
  return [a1, Math.atan2(tx - ex, ty - ey) - a1];
}
const MPOSE = {
  // hand flat over the brow, shading her eyes from the low sun
  shade: () => ({ arms: [armTo(true, 52, -868, 1), [.12, .25]], head: .06 }),
  // hand cupped at her mouth, calling
  call: () => ({ arms: [armTo(true, 96, -786, 1), [.1, .3]], head: .02 }),
  // hands together at the apron, listening
  still: () => ({ arms: [armTo(true, 70, -500, -1), armTo(false, 56, -510, -1)], head: -.08 }),
};

// ---------------- the farm set ----------------
// All set pieces draw with their base-left corner at (x, y) and scale s (1 = the wide shot's size).
function farmhouse(x, y, s, { door = 0 } = {}) {
  g.save(); g.translate(x, y); g.scale(s, s);
  cut(cutRect(380, -690, 52, 150, 31), P.setDark, { sh: .5 });                                   // chimney
  cut(cutRect(0, -460, 520, 460, 32), P.set, { sh: .9, lift: .3 });                               // body
  cut(poly([[-34, -456], [260, -650], [554, -456]]), P.setDeep, { sh: .8, lift: .4 });            // gable roof
  cut(circle(260, -536, 34), P.skyPale, { sh: .3, grain: .15 });                                  // attic window
  cut(rect(256, -570, 8, 68), P.setDeep, { sh: 0, grain: 0 }); cut(rect(226, -540, 68, 8), P.setDeep, { sh: 0, grain: 0 });
  for (const wx of [46, 392]) {                                                                   // two windows, pale
    cut(rect(wx, -430, 84, 96), P.skyPale, { sh: .3, grain: .15 });
    cut(rect(wx + 38, -430, 8, 96), P.setDeep, { sh: 0, grain: 0 }); cut(rect(wx, -386, 84, 8), P.setDeep, { sh: 0, grain: 0 });
  }
  // the door: dark, or open (0..1) with the pale room behind it and the door leaf swung in
  cut(rect(210, -300, 100, 262), P.setDark, { sh: .2, grain: .1 });
  if (door > 0) { g.save(); g.globalAlpha *= clamp(door * 2); cut(rect(216, -294, 88, 256), P.skyLow, { sh: 0, grain: .12 }); g.restore();
    g.save(); g.translate(216, 0); g.scale(1 - door * .82, 1); cut(rect(0, -294, 88, 256), P.setDeep, { sh: .3 }); g.restore(); }
  else cut(rect(216, -294, 88, 256), P.setDeep, { sh: .2, grain: .15 });
  // porch: a lean-to roof on posts, a floor, two steps
  cut(poly([[90, -318], [560, -318], [586, -282], [70, -282]]), P.setDeep, { sh: .8, lift: .5 });
  for (const px of [96, 536]) cut(cutRect(px, -284, 16, 250, 40 + px), P.setDark, { sh: .5 });
  cut(cutRect(70, -38, 520, 38, 34), P.setDark, { sh: .7, lift: .2 });
  cut(cutRect(586, -24, 70, 24, 35), P.setDark, { sh: .6 });
  g.restore();
}
// a round silo with a domed cap, beside the barn
function silo(x, y, s) {
  g.save(); g.translate(x, y); g.scale(s, s);
  cut(cutRect(0, -700, 130, 700, 41), P.set, { sh: .8, lift: .3 });
  cut(blob([[-8, -696], [10, -760], [65, -790], [120, -760], [138, -696]], .6), P.setDeep, { sh: .7, lift: .4 });
  for (let i = 1; i < 7; i++) cut(rect(0, -700 + i * 100, 130, 5), P.setDeep, { sh: 0, grain: 0, alpha: .6 });
  g.restore();
}
// barn: gambrel roof, the hay door high under the ridge, big doors, a ladder up to the hay door.
// door(gx, gy, w, h) is called (in barn units) to draw what is inside the lit hay door.
const BARN = { w: 580, hay: { x: 232, y: -584, w: 120, h: 150 } };
function barn(x, y, s, { glow = 1, inside = null, ladder = true, t = 0 } = {}) {
  const hd = BARN.hay;
  g.save(); g.translate(x, y); g.scale(s, s);
  const shell = poly([[0, 0], [0, -440], [70, -640], [290, -770], [510, -640], [580, -440], [580, 0]]);
  cut(shell, P.setDeep, { sh: 1, lift: .5 });
  // boards: thin darker strips
  g.save(); g.clip(shell); for (let i = 1; i < 12; i++) cut(rect(i * 48 - 2, -800, 5, 800), P.setDark, { sh: 0, grain: 0, alpha: .55 }); g.restore();
  cut(poly([[-26, -436], [70, -650], [290, -786], [510, -650], [606, -436], [580, -436], [510, -630], [290, -760], [70, -630], [0, -436]]), P.setDark, { sh: .6, lift: .3 });
  // the hay door: lit from inside
  const hp = rect(hd.x, hd.y, hd.w, hd.h);
  cut(hp, P.setDark, { sh: 0, grain: .1 });
  if (glow > 0) {
    g.save(); g.clip(hp);
    g.save(); g.globalAlpha *= glow; cut(hp, P.goldPale, { sh: 0, grain: .2 });
    const gr = g.createRadialGradient(hd.x + hd.w * .5, hd.y + hd.h * .62, 6, hd.x + hd.w * .5, hd.y + hd.h * .62, hd.w * .9);
    gr.addColorStop(0, 'rgba(251,236,190,.95)'); gr.addColorStop(1, 'rgba(241,178,58,.35)'); g.fillStyle = gr; g.fill(hp); g.restore();
    if (inside) inside(hd.x, hd.y, hd.w, hd.h);
    // the hay itself, a dark mound across the sill
    cut(blob([[hd.x - 10, hd.y + hd.h + 4], [hd.x - 6, hd.y + hd.h - 28], [hd.x + 30, hd.y + hd.h - 40], [hd.x + 62, hd.y + hd.h - 30],
      [hd.x + 96, hd.y + hd.h - 42], [hd.x + hd.w + 8, hd.y + hd.h - 24], [hd.x + hd.w + 10, hd.y + hd.h + 4]], .6), P.setDark, { sh: .3, grain: .2 });
    g.restore();
  }
  // the open door leaves, swung out to each side, and the sill
  cut(cutRect(hd.x - 64, hd.y + 4, 60, hd.h - 4, 51), P.set, { sh: .7, lift: .4 });
  cut(cutRect(hd.x + hd.w + 4, hd.y + 4, 60, hd.h - 4, 52), P.set, { sh: .7, lift: .4 });
  cut(cutRect(hd.x - 10, hd.y + hd.h, hd.w + 20, 14, 53), P.setDark, { sh: .6 });
  // the hoist beam and pulley above the door
  cut(poly([[hd.x - 20, hd.y - 8], [hd.x + hd.w / 2, hd.y - 60], [hd.x + hd.w + 20, hd.y - 8]]), P.setDark, { sh: .6, lift: .3 });
  cut(cutRect(hd.x + hd.w / 2 - 12, hd.y - 92, 24, 40, 54), P.setDark, { sh: .6, lift: .5 });
  cut(circle(hd.x + hd.w / 2, hd.y - 44, 13), P.set, { sh: .5, lift: .5 });
  // the big doors, shut and barred
  for (const [dx, sd] of [[44, 61], [164, 62]]) {
    cut(cutRect(dx, -280, 118, 280, sd), P.set, { sh: .7, lift: .2 });
    g.save(); g.strokeStyle = P.setDeep; g.lineWidth = 9; g.lineCap = 'round';
    g.beginPath(); g.moveTo(dx + 12, -268); g.lineTo(dx + 106, -12); g.moveTo(dx + 106, -268); g.lineTo(dx + 12, -12); g.stroke(); g.restore();
  }
  cut(cutRect(30, -160, 266, 18, 63), P.setDark, { sh: .6, lift: .3 });
  // the ladder: from the ground up to the hay door sill, leaning in a little
  if (ladder) {
    g.save(); g.strokeStyle = P.setDark; g.lineCap = 'round';
    const L = [[402, 0], [hd.x + hd.w - 22, hd.y + hd.h + 6]], R = [[456, 0], [hd.x + hd.w + 32, hd.y + hd.h + 6]];
    g.shadowColor = 'rgba(20,16,30,.3)'; g.shadowBlur = 10; g.shadowOffsetX = 4; g.shadowOffsetY = 6;
    g.lineWidth = 11; g.beginPath(); g.moveTo(...L[0]); g.lineTo(...L[1]); g.moveTo(...R[0]); g.lineTo(...R[1]); g.stroke();
    g.lineWidth = 7; for (let i = 1; i < 11; i++) { const u = i / 11; g.beginPath();
      g.moveTo(lerp(L[0][0], L[1][0], u), lerp(L[0][1], L[1][1], u)); g.lineTo(lerp(R[0][0], R[1][0], u), lerp(R[0][1], R[1][1], u)); g.stroke(); }
    g.restore();
  }
  g.restore();
}
// shoes: one pair, side on, toes right. s = scale, col = the owner's paper
function shoePair(x, y, s, col, kind = 'flat') {
  g.save(); g.translate(x, y); g.scale(s, s);
  const shoe = kind === 'boot' ? blob([[-30, 0], [-30, -40], [-4, -44], [0, -18], [34, -14], [44, 0]], .4)
    : blob([[-28, 0], [-28, -22], [-16, -26], [-8, -14], [12, -16], [32, -10], [38, 0]], .45);
  cut(shoe, col, { sh: .5, grain: .2 }); g.translate(kind === 'boot' ? 30 : 26, 4); g.rotate(.08); cut(shoe, col, { sh: .5, grain: .2 });
  g.restore();
}
// a broad tree with a rope swing on its low branch. sway: swing angle in radians
function swingTree(x, y, s, sway = 0) {
  g.save(); g.translate(x, y); g.scale(s, s);
  cut(blob([[-34, 0], [-22, -200], [-30, -330], [-120, -420], [-108, -436], [-10, -370], [10, -470], [30, -460], [24, -330], [150, -400], [160, -384], [36, -280], [30, 0]], .4), P.setDeep, { sh: .8, lift: .2 });
  for (const [cx, cy, w, h, sd] of [[-120, -500, 330, 220, 1], [80, -560, 360, 250, 2], [10, -660, 300, 200, 3], [190, -470, 220, 160, 4]])
    cut(cloud(cx, cy, w, h, sd), sd % 2 ? P.set : P.setDeep, { sh: .8, lift: .4 });
  // swing from the right branch
  g.save(); g.translate(130, -392); g.rotate(sway);
  g.save(); g.strokeStyle = P.setDark; g.lineWidth = 4; g.beginPath(); g.moveTo(-34, 0); g.lineTo(-34, 260); g.moveTo(34, 0); g.lineTo(34, 260); g.stroke(); g.restore();
  cut(cutRect(-52, 256, 104, 14, 71), P.setDark, { sh: .6, lift: .3 });
  g.restore();
  g.restore();
}
// a washing line on two T-poles, with sheets cut from the pale sky paper. wind: 0..1 flutter phase
function washingLine(x0, x1, y, s, t) {
  const top = y - 300 * s;
  for (const px of [x0, x1]) { cut(cutRect(px - 5 * s, top, 10 * s, 300 * s, px), P.setDark, { sh: .5 }); cut(cutRect(px - 30 * s, top - 6 * s, 60 * s, 10 * s, px + 1), P.setDark, { sh: .5 }); }
  const sag = 34 * s, lineY = (u) => top + 2 * s + Math.sin(u * Math.PI) * sag;
  g.save(); g.strokeStyle = P.setDark; g.lineWidth = 2.5; g.beginPath();
  for (let i = 0; i <= 20; i++) { const u = i / 20; const X = lerp(x0, x1, u); i ? g.lineTo(X, lineY(u)) : g.moveTo(X, lineY(u)); } g.stroke(); g.restore();
  const items = [[.1, .27, 150, 0], [.33, .5, 120, 1], [.57, .9, 160, 2]];
  for (const [a, b, h, k] of items) {
    const n = 8, pts = [];
    for (let i = 0; i <= n; i++) { const u = lerp(a, b, i / n); pts.push([lerp(x0, x1, u), lineY(u) - 2]); }
    for (let i = n; i >= 0; i--) { const u = lerp(a, b, i / n); const w = Math.sin(t * 2.2 + i * .7 + k * 2) * 6 * s;
      pts.push([lerp(x0, x1, u) + w, lineY(u) + h * s + (i % 2 ? 6 : 0) * s]); }
    cut(poly(pts), k === 1 ? P.skyLow : P.skyPale, { sh: .55, grain: .2, lift: .2 });
  }
}
// the field's edge: a post-and-rail fence
function fence(x0, x1, y, s) {
  for (let x = x0; x <= x1; x += 130 * s) cut(cutRect(x, y - 110 * s, 12 * s, 110 * s, x), P.setDeep, { sh: .4 });
  cut(cutRect(x0, y - 92 * s, x1 - x0 + 12 * s, 9 * s, 81), P.setDeep, { sh: .4 });
  cut(cutRect(x0, y - 52 * s, x1 - x0 + 12 * s, 9 * s, 82), P.setDeep, { sh: .4 });
}
// sky and hills (screen space; px = parallax shift in pixels)
function skyAndHills(px = 0, sunX = 300, sunY = 700) {
  sheet(P.skyTop);
  cut(cutRect(-20, 260, W + 40, 900, 91), P.sky, { sh: .35, grain: .2 });
  cut(cutRect(-20, 560, W + 40, 600, 92), P.skyLow, { sh: .3, grain: .2 });
  cut(circle(sunX + px * .1, sunY, 92), P.sun, { sh: .2, grain: .15 });
  const far = blob([[-80, 1000], [-80, 760], [260, 700], [620, 744], [980, 690], [1360, 730], [1700, 680], [2060, 740], [2060, 1000]], .5);
  g.save(); g.translate(px * .25, 0); cut(far, P.hillFar, { sh: .4, grain: .2 }); g.restore();
  const mid = blob([[-80, 1000], [-80, 820], [380, 790], [820, 830], [1240, 800], [1640, 836], [2060, 800], [2060, 1000]], .5);
  g.save(); g.translate(px * .5, 0); cut(mid, P.hillMid, { sh: .5, grain: .2, lift: .1 }); g.restore();
}
