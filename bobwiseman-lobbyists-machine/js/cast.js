// The cast, all invented (no likeness of anyone the song names): the Rocker in a cape, the Publicist, the Cellist,
// two kids and a giraffe at the zoo, and a cardboard orchestra. Drawn the Kevin Ngo way (characters-not-marionettes):
// one outer outline per figure (every part stroked thick first, then every part filled over it, so overlaps show no
// seam), bendy tube limbs, big heads, faces doing the acting, thin lines inside. Each figure takes its feet point.
'use strict';
const OUT = 3.6; // outline pen width (x1.7 px)

function Fig(tag, x, y, s = 1, flip = 1) { return { tag, x, y, s, flip, parts: [] }; }
const P_ = (F, p) => [F.x + p[0] * F.s * F.flip, F.y + p[1] * F.s];
function part(F, kind, pts, fill, w) { F.parts.push({ kind, pts: pts.map((p) => P_(F, p)), fill, w: w ? w * F.s : 0 }); }
const fblob = (F, pts, fill) => part(F, 'blob', pts, fill);
const ftube = (F, pts, w, fill) => part(F, 'tube', pts, fill, w);
const fcirc = (F, cx, cy, rx, ry, fill) => part(F, 'blob', circ(cx, cy, rx, ry ?? rx), fill);
function drawFig(F, details) {
  const tg = F.tag;
  F.parts.forEach((p, i) => { // outline pass
    if (p.kind === 'tube') { X.save(); X.strokeStyle = INK; X.lineCap = 'round'; X.lineJoin = 'round'; X.lineWidth = p.w + 7 * F.s + 2; X.beginPath(); p.pts.forEach((q, j) => (j ? X.lineTo(q[0], q[1]) : X.moveTo(q[0], q[1]))); X.stroke(); X.restore(); }
    else ink(p.pts.concat([p.pts[0]]), `${tg}o${i}`, { w: OUT * Math.max(0.7, F.s) });
  });
  F.parts.forEach((p, i) => { // fill pass, back to front
    if (p.kind === 'tube') { X.save(); X.strokeStyle = p.fill; X.lineCap = 'round'; X.lineJoin = 'round'; X.lineWidth = p.w; X.beginPath(); p.pts.forEach((q, j) => (j ? X.lineTo(q[0], q[1]) : X.moveTo(q[0], q[1]))); X.stroke(); X.restore(); }
    else wax(pathOf(p.pts), p.fill, `${tg}f${i}`);
  });
  if (details) { X.save(); X.translate(F.x, F.y); X.scale(F.s * F.flip, F.s); details(); X.restore(); }
}
// details are drawn in the figure's local units (after the translate/scale above)
const d = (pts, tag, w = 1.4, col = INK) => ink(pts, tag, { w, col });
function eyes(tag, xs, y, kind = 'open', r = 5.5) {
  xs.forEach((x, i) => {
    if (kind === 'closed') d(circ(x, y, 9, 6, 0.15, Math.PI - 0.15, 8), tag + 'ec' + i, 1.6);
    else if (kind === 'squint') d([[x - 9, y + 1], [x, y - 2], [x + 9, y + 1]], tag + 'es' + i, 1.8);
    else if (kind === 'lid') { dot(x, y + 1, r); d([[x - 10, y - 3], [x + 10, y - 3]], tag + 'el' + i, 1.6); }
    else { dot(x, y, r); dot(x + r * 0.35, y - r * 0.4, r * 0.32, PAPER); }
  });
}

// ---------- the Rocker: cape, quiff, red jacket, a guitar; squints until he gets his new frames ----------
function rocker(x, y, s = 1, o = {}) {
  const { pose = 'play', glasses = 0, face = 'grin', wave = 0, flip = 1 } = o, F = Fig('rk' + (o.tag || ''), x, y, s, flip);
  const cw = Math.sin(wave) * 10;
  // cape behind everything, red lining on the flap
  fblob(F, [[-50, -296], [50, -296], [70, -170], [96 + cw, -40], [20, -28], [-60, -36], [-150 + cw, -50], [-92, -190]], OX);
  fblob(F, [[-92, -190], [-150 + cw, -50], [-100 + cw * 0.6, -46], [-64, -170]], RED);
  // legs and pointy boots
  ftube(F, bend([-18, -168], [-44, -22], 10), 27, NAVY); ftube(F, bend([18, -168], [44, -22], -12), 27, NAVY);
  fblob(F, [[-82, -2], [-76, -30], [-34, -34], [-22, -2]], INK); fblob(F, [[22, -2], [30, -32], [66, -30], [100, -6], [96, -2]], INK);
  // body
  fblob(F, [[-48, -302], [48, -302], [40, -164], [-40, -164]], RED);
  fblob(F, [[-15, -302], [15, -302], [0, -254]], GILT);
  // guitar: body, neck, head
  fcirc(F, 14, -186, 46, 38, GILT); fcirc(F, 44, -222, 30, 26, GILT);
  ftube(F, [[56, -232], [146, -318]], 13, TAN); fblob(F, [[140, -316], [150, -350], [170, -346], [160, -310]], TAN);
  // arms
  if (pose === 'thumbs') {
    ftube(F, bend([-44, -290], [-96, -220], 16), 22, RED); fcirc(F, -100, -214, 14, 14, SKIN);
    ftube(F, bend([44, -290], [104, -334], -14), 22, RED); fblob(F, [[92, -350], [124, -352], [128, -330], [120, -318], [96, -318], [90, -332]], SKIN); ftube(F, [[96, -350], [86, -382]], 11, SKIN);
  } else {
    ftube(F, bend([-44, -290], [118, -292], 40), 22, RED); fcirc(F, 122, -292, 14, 14, SKIN);
    ftube(F, bend([44, -290], [30, -200], -26), 22, RED); fcirc(F, 26, -194, 14, 14, SKIN);
  }
  // head, ears, quiff, sideburns
  ftube(F, [[0, -300], [0, -322]], 26, SKIN);
  fcirc(F, -56, -368, 11, 15, SKIN); fcirc(F, 56, -368, 11, 15, SKIN);
  fcirc(F, 0, -372, 58, 60, SKIN);
  fblob(F, [[-58, -378], [-62, -420], [-36, -452], [10, -472], [76, -470], [104, -450], [74, -436], [58, -410], [52, -386], [30, -412], [-20, -414], [-46, -396]], INK);
  fblob(F, [[-58, -386], [-50, -386], [-48, -350], [-58, -352]], INK); fblob(F, [[58, -386], [50, -386], [48, -350], [58, -352]], INK);
  drawFig(F, () => {
    const ek = glasses > 0.5 ? 'open' : face === 'grin' ? 'squint' : face;
    eyes('rk', [-21, 21], -372, ek);
    d([[-34, -398], [-12, -404]], 'rkb1', 2); d([[12, -404], [34, -398]], 'rkb2', 2);
    // the grin: teeth and an outline
    const g = [[-30, -342], [30, -342], [24, -326], [0, -318], [-24, -326], [-30, -342]];
    X.fillStyle = PAPER; X.fill(pathOf(g)); d(g, 'rkg', 1.8); d([[-26, -335], [26, -335]], 'rkt', 1);
    d([[-3, -362], [-6, -350], [2, -350]], 'rkn', 1.4);
    if (glasses > 0) { X.save(); X.globalAlpha = clamp(glasses * 1.5); for (const ex of [-21, 21]) { d(circ(ex, -372, 19, 17), 'rkgl' + ex, 2.6, OX); } d([[-3, -374], [3, -374]], 'rkglb', 2.4, OX); X.restore(); }
    if (pose === 'thumbs') { for (const fy of [-344, -335, -326]) d([[104, fy], [124, fy + 1]], 'rkf' + fy, 1.3); }
    // guitar details: sound hole, strings
    dot(20, -194, 11); d([[-20, -170], [140, -322]], 'rks', 0.6, GREY);
    d([[0, -302], [-6, -170]], 'rkj', 1); // jacket edge
  });
}

// ---------- the Publicist: bob, shoulder pads, headset, clipboard; she talks, she points ----------
function publicist(x, y, s = 1, o = {}) {
  const { talk = 0, point = 1, flip = 1 } = o, F = Fig('pb' + (o.tag || ''), x, y, s, flip);
  ftube(F, bend([-12, -146], [-22, -14], 4), 16, SKIN); ftube(F, bend([12, -146], [22, -14], -4), 16, SKIN);
  fblob(F, [[-40, -2], [-38, -18], [-12, -20], [-6, -2]], RED); fblob(F, [[8, -2], [12, -20], [38, -18], [42, -2]], RED);
  fblob(F, [[-38, -168], [38, -168], [34, -98], [-34, -98]], NAVY);
  fblob(F, [[-70, -258], [70, -258], [74, -236], [42, -160], [-42, -160], [-74, -236]], RED);
  if (o.tray != null) { // machine pose: the clipboard held out flat as a tray on her right, the other hand up, one finger raised
    ftube(F, bend([-60, -246], [-98, -326], 14), 18, RED); fcirc(F, -100, -332, 11, 11, SKIN); ftube(F, [[-100, -340], [-102, -366]], 7, SKIN);
    const b = pubBoard(0, 0, 1, o.tray);
    ftube(F, bend([60, -246], [b.grip[0], b.grip[1]], -14), 18, RED);
    fblob(F, b.poly, TAN); fcirc(F, b.grip[0], b.grip[1] + 6, 11, 11, SKIN);
    ftube(F, [[0, -256], [0, -276]], 20, SKIN);
    fcirc(F, 0, -312, 46, 48, SKIN);
    fblob(F, [[-52, -268], [-56, -330], [-36, -362], [0, -370], [36, -362], [56, -330], [52, -268], [36, -270], [36, -318], [-36, -318], [-36, -270]], INK);
    drawFig(F, () => {
      eyes('pb', [-16, 16], -304, o.look || 'lid', 5);
      d([[-28, -324], [-8, -328]], 'pbb1', 1.8); d([[8, -328], [28, -322]], 'pbb2', 1.8);
      d([[-2, -296], [-5, -286], [2, -286]], 'pbn', 1.3);
      if (talk > 0.15) { const m = circ(0, -276, 13, 5 + 7 * talk); X.fillStyle = OX; X.fill(pathOf(m)); d(m, 'pbm', 1.6); }
      else d([[-11, -277], [0, -274], [11, -277]], 'pbm0', 1.8, OX);
      d(circ(0, -320, 54, 52, Math.PI * 1.02, Math.PI * 1.98, 14), 'pbhs', 2.2); dot(-52, -316, 7, INK); d([[-50, -306], [-34, -286], [-16, -282]], 'pbbm', 1.6); dot(-16, -282, 3.5);
      d([[0, -256], [0, -168]], 'pbj', 1);
    });
    return;
  }
  // clipboard arm (her right, our left) and the pointing arm
  ftube(F, bend([-60, -246], [-30, -186], 14), 18, RED);
  fblob(F, [[-62, -232], [-6, -232], [-6, -160], [-62, -160]], TAN); fblob(F, [[-56, -222], [-12, -222], [-12, -166], [-56, -166]], PAPER);
  fcirc(F, -30, -182, 11, 11, SKIN);
  const hx = lerp(70, 128, point), hy = lerp(-170, -284, point);
  ftube(F, bend([60, -246], [hx, hy], -18 * point), 18, RED); fcirc(F, hx + 2, hy, 12, 12, SKIN); ftube(F, [[hx + 6, hy - 3], [hx + 26, hy - 10]], 7, SKIN);
  ftube(F, [[0, -256], [0, -276]], 20, SKIN);
  fcirc(F, 0, -312, 46, 48, SKIN);
  fblob(F, [[-52, -268], [-56, -330], [-36, -362], [0, -370], [36, -362], [56, -330], [52, -268], [36, -270], [36, -318], [-36, -318], [-36, -270]], INK);
  drawFig(F, () => {
    eyes('pb', [-16, 16], -304, 'lid', 5);
    d([[-28, -324], [-8, -328]], 'pbb1', 1.8); d([[8, -328], [28, -322]], 'pbb2', 1.8);
    d([[-2, -296], [-5, -286], [2, -286]], 'pbn', 1.3);
    if (talk > 0.15) { const m = circ(0, -276, 13, 5 + 7 * talk); X.fillStyle = OX; X.fill(pathOf(m)); d(m, 'pbm', 1.6); }
    else d([[-11, -277], [0, -274], [11, -277]], 'pbm0', 1.8, OX);
    d([[-12, -279], [12, -279]], 'pblip', 0.8, RED);
    // headset over the hair, boom to her mouth
    d(circ(0, -320, 54, 52, Math.PI * 1.02, Math.PI * 1.98, 14), 'pbhs', 2.2); dot(-52, -316, 7, INK); d([[-50, -306], [-34, -286], [-16, -282]], 'pbbm', 1.6); dot(-16, -282, 3.5);
    // the list on her clipboard
    for (let i = 0; i < 4; i++) { d([[-50, -210 + i * 12], [-44, -210 + i * 12]], 'pbck' + i, 1); d([[-40, -210 + i * 12], [-18, -210 + i * 12]], 'pbcl' + i, 0.8, PENCIL); }
    d([[0, -256], [0, -168]], 'pbj', 1);
  });
}

// her clipboard as a tray, in her local units (feet at 0,0): pivot at her hand, 120 long, tilted by `tilt` (radians, + = far end down)
function pubBoard(x, y, s, tilt) {
  const px = 92, py = -196, c = Math.cos(tilt), sn = Math.sin(tilt), L = 132, th = 9;
  const pt = (u, v) => [x + (px + u * c - v * sn) * s, y + (py + u * sn + v * c) * s];
  return { poly: [pt(0, 0), pt(L, 0), pt(L, th), pt(0, th)], top: (u) => pt(u, 0), grip: pt(14, 4), end: pt(L, 0), n: [sn, -c] };
}

// ---------- the Cellist: wild white hair and beard, tails, eyes shut in rapture; bow arm moves ----------
function cellist(x, y, s = 1, o = {}) {
  const { bow = 0, flip = 1 } = o, F = Fig('cl' + (o.tag || ''), x, y, s, flip);
  // chair
  fblob(F, [[-70, -150], [40, -150], [40, -136], [-70, -136]], TAN); ftube(F, [[-62, -136], [-62, 0]], 9, TAN); ftube(F, [[30, -136], [30, 0]], 9, TAN); ftube(F, [[-66, -150], [-74, -236]], 10, TAN);
  // tails, legs around the cello
  fblob(F, [[-50, -160], [-20, -160], [-40, -80], [-62, -90]], NAVY);
  ftube(F, [[-30, -150], [36, -146], [44, -16]], 26, NAVY); ftube(F, [[-10, -150], [-56, -128], [-64, -16]], 26, NAVY);
  fblob(F, [[-92, -2], [-86, -24], [-54, -26], [-48, -2]], INK); fblob(F, [[30, -2], [36, -24], [70, -22], [76, -2]], INK);
  fblob(F, [[-42, -262], [36, -262], [44, -150], [-48, -150]], NAVY);
  fblob(F, [[-10, -262], [12, -262], [0, -220]], SNOW);
  // cello: body with a waist, endpin, neck past his head to the scroll
  ftube(F, [[-6, -10], [-4, 20]], 5, INK);
  fblob(F, [[-50, -40], [-58, -100], [-36, -130], [-44, -168], [-30, -214], [0, -226], [30, -214], [44, -168], [36, -130], [58, -100], [50, -40], [0, -10]], OX);
  ftube(F, [[0, -220], [-62, -352]], 14, INK); fcirc(F, -66, -364, 12, 14, OX);
  // left hand on the neck, bow arm
  ftube(F, bend([-36, -252], [-44, -296], 20), 20, NAVY); fcirc(F, -44, -300, 12, 12, SKIN);
  const bx = lerp(-30, 60, bow);
  ftube(F, bend([30, -252], [bx + 40, -132], -20), 20, NAVY); fcirc(F, bx + 40, -128, 12, 12, SKIN);
  // head, hair cloud, beard
  fcirc(F, 0, -296, 46, 46, SKIN);
  fblob(F, [[-50, -296], [-74, -314], [-62, -344], [-74, -364], [-40, -372], [-26, -394], [6, -382], [30, -398], [46, -374], [76, -366], [62, -340], [78, -318], [52, -298], [40, -330], [-40, -330]], SNOW);
  fblob(F, [[-40, -292], [-38, -264], [-24, -236], [0, -226], [24, -236], [38, -264], [40, -292], [20, -282], [-20, -282]], SNOW);
  drawFig(F, () => {
    eyes('cl', [-16, 16], -300, 'closed');
    d([[-30, -318], [-6, -326]], 'clb1', 2); d([[6, -326], [30, -318]], 'clb2', 2);
    d([[-2, -296], [-6, -282], [3, -282]], 'cln', 1.3);
    d([[-14, -272], [0, -264], [14, -272]], 'clm', 1.6, OX);
    // f-holes, strings, bridge
    d([[-22, -150], [-18, -120], [-24, -96]], 'clf1', 1.2); d([[22, -150], [18, -120], [24, -96]], 'clf2', 1.2);
    for (const sx of [-6, -2, 2, 6]) d([[sx, -40], [sx * 0.8 + 2, -214]], 'clst' + sx, 0.5, GREY);
    d([[-16, -86], [16, -86]], 'clbr', 2);
    // the bow
    d([[bx - 110, -114], [bx + 120, -140]], 'clbw', 2.2, OX); d([[bx - 106, -108], [bx + 116, -134]], 'clbh', 0.8, GREY);
  });
}

// ---------- two kids, deadpan ----------
function kid(x, y, s = 1, o = {}) {
  const { kind = 'ice', flip = 1 } = o, F = Fig('kd' + kind + (o.tag || ''), x, y, s, flip);
  ftube(F, bend([-10, -62], [-14, -12], 4), 14, kind === 'ice' ? NAVY : SKIN); ftube(F, bend([10, -62], [14, -12], -4), 14, kind === 'ice' ? NAVY : SKIN);
  fblob(F, [[-30, -2], [-28, -18], [-6, -18], [-4, -2]], PAPER); fblob(F, [[4, -2], [6, -18], [28, -18], [32, -2]], PAPER);
  if (kind === 'ice') fblob(F, [[-28, -114], [28, -114], [24, -60], [-24, -60]], GREEN);
  else fblob(F, [[-26, -114], [26, -114], [36, -54], [-36, -54]], LAMP);
  if (kind === 'ice') { ftube(F, bend([22, -106], [40, -86], -8), 12, GREEN); fcirc(F, 42, -84, 8, 8, SKIN); fblob(F, [[34, -92], [52, -92], [43, -60]], TAN); fcirc(F, 43, -98, 11, 10, '#f2b7b0'); ftube(F, bend([-22, -106], [-30, -66], 6), 12, GREEN); fcirc(F, -30, -62, 8, 8, SKIN); }
  else { ftube(F, bend([22, -106], [44, -150], -6), 12, SKIN); fcirc(F, 45, -154, 8, 8, SKIN); ftube(F, bend([-22, -106], [-30, -66], 6), 12, SKIN); fcirc(F, -30, -62, 8, 8, SKIN); fcirc(F, 64, -262, 30, 36, RED); fblob(F, [[60, -228], [68, -228], [64, -220]], RED); }
  fcirc(F, 0, -146, 36, 36, SKIN);
  if (kind === 'ice') { fblob(F, [[-38, -150], [-36, -178], [-14, -186], [20, -184], [38, -164], [64, -158], [40, -150]], RED); }
  else { fblob(F, [[-36, -150], [-34, -176], [0, -186], [34, -176], [36, -150], [24, -164], [-24, -164]], OX); fcirc(F, -42, -150, 12, 14, OX); fcirc(F, 42, -150, 12, 14, OX); }
  drawFig(F, () => {
    eyes('kd' + kind, [-13, 13], -146, 'lid', 4.5);
    d([[-8, -126], [8, -126]], 'kdm' + kind, 1.6, OX);
    if (kind !== 'ice') d(bend([45, -160], [64, -226], -10), 'kdstr', 1, INK);
  });
}

// ---------- the giraffe: leans its long neck into the photo and smiles ----------
function giraffe(x, y, s = 1, o = {}) {
  const { lean = 0, flip = 1 } = o, F = Fig('gf' + (o.tag || ''), x, y, s, flip);
  for (const [lx, b] of [[-62, 6], [-36, -6], [40, 6], [66, -6]]) ftube(F, bend([lx, -250], [lx + b, -8], b), 18, GILT);
  for (const lx of [-62, -36, 40, 66]) fblob(F, [[lx - 11, -2], [lx - 10, -14], [lx + 10, -14], [lx + 11, -2]], INK);
  ftube(F, bend([-92, -270], [-118, -200], 10), 5, GILT);
  fcirc(F, 0, -272, 104, 50, GILT);
  const hx = lerp(112, 210, lean), hy = lerp(-520, -470, lean);
  ftube(F, bend([66, -280], [hx - 10, hy + 26], lerp(-10, -60, lean)), 36, GILT);
  fblob(F, [[hx - 30, hy - 12], [hx - 10, hy - 30], [hx + 30, hy - 22], [hx + 62, hy - 4], [hx + 64, hy + 16], [hx + 30, hy + 22], [hx - 24, hy + 18]], GILT);
  ftube(F, [[hx - 10, hy - 28], [hx - 14, hy - 56]], 6, TAN); ftube(F, [[hx + 6, hy - 28], [hx + 6, hy - 58]], 6, TAN);
  fcirc(F, hx - 15, hy - 58, 7, 7, OX); fcirc(F, hx + 6, hy - 60, 7, 7, OX);
  fblob(F, [[hx - 34, hy - 6], [hx - 54, hy - 18], [hx - 36, hy - 2]], GILT);
  drawFig(F, () => {
    // spots on the body and neck (in local units)
    const sp = [[-50, -282], [-10, -258], [30, -290], [62, -262], [-74, -252], [8, -300]];
    for (const [sx, sy] of sp) { X.save(); X.fillStyle = OX; X.globalAlpha = 0.85; X.fill(pathOf(circ(sx, sy, 13, 10))); X.restore(); }
    const nk = bend([66, -280], [hx - 10, hy + 26], lerp(-10, -60, lean));
    [0.25, 0.5, 0.75].forEach((k, i) => { const q = nk[Math.round(k * 10)]; X.save(); X.fillStyle = OX; X.globalAlpha = 0.85; X.fill(pathOf(circ(q[0], q[1], 9, 7))); X.restore(); });
    dot(hx + 2, hy - 6, 5); for (let i = 0; i < 3; i++) d([[hx - 4 + i * 5, hy - 12], [hx - 8 + i * 7, hy - 20]], 'gfl' + i, 1);
    d([[hx + 24, hy + 10], [hx + 44, hy + 14], [hx + 58, hy + 6]], 'gfm', 1.6, OX); dot(hx + 52, hy - 2, 2.6);
  });
}

// ---------- a cardboard orchestra player on a stick; flips up from flat (up 0..1) ----------
function cutout(x, y, s = 1, o = {}) {
  const { inst = 'violin', up = 1, name = '' } = o, sy = Math.max(0.04, up);
  X.save(); X.translate(x, y); X.scale(s, s * sy); X.translate(-x, -y);
  ink([[x, y], [x, y - 40]], 'cos' + inst, { w: 3, col: TAN });
  const body = [[x - 46, y - 40], [x - 50, y - 140], [x - 28, y - 168], [x - 22, y - 186], [x - 34, y - 214], [x - 26, y - 244], [x, y - 254], [x + 26, y - 244], [x + 34, y - 214], [x + 22, y - 186], [x + 28, y - 168], [x + 50, y - 140], [x + 46, y - 40], [x - 46, y - 40]];
  shape(body, TAN, 'co' + inst, 2.2);
  blob(circ(x, y - 216, 22, 26), PAPER, 'cof' + inst, 1);
  dot(x - 8, y - 218, 3); dot(x + 8, y - 218, 3); ink([[x - 9, y - 202], [x, y - 198], [x + 9, y - 202]], 'com' + inst, { w: 1.2 });
  if (inst === 'violin') { blob([[x + 4, y - 170], [x + 30, y - 162], [x + 34, y - 136], [x + 10, y - 132]], OX, 'cov', 1.4); ink([[x + 30, y - 176], [x + 68, y - 120]], 'covb', { w: 1.6 }); }
  if (inst === 'tuba') { blob(circ(x, y - 110, 32, 34), GILT, 'cot', 1.6); blob(circ(x + 10, y - 150, 30, 14), GILT, 'cotb', 1.6); }
  if (inst === 'flute') ink([[x - 60, y - 196], [x + 30, y - 160]], 'cofl', { w: 3.4, col: INK });
  if (inst === 'drum') { blob(circ(x, y - 92, 38, 26), RED, 'cod', 1.6); ink([[x - 26, y - 150], [x - 6, y - 118]], 'cods', { w: 2 }); }
  X.restore();
  if (name && up > 0.6) fitLabel(name, x, y + 18, 90, 18);
}

// ---------- whole-song cast (line-up 2026-11-10) ----------
const SKIN2 = '#c68a5a', STONE = '#bdb6aa', PLAT = '#e4e7ea';
// the hired minder: dark suit, sunglasses, earpiece, a HIRED badge and one huge cardboard wing strapped to his right side.
// flap 0..1 lifts the wing; fold 0..1 squashes him down like a deckchair (the RETURNS box is the builder's).
function minder(x, y, s = 1, o = {}) {
  const { flap = 0, fold = 0, flip = 1 } = o;
  X.save(); X.translate(x, y); X.scale(1 + fold * 0.15, 1 - fold * 0.75); X.translate(-x, -y);
  const F = Fig('mn' + (o.tag || ''), x, y, s, flip), wa = 0.35 + flap * 0.7;
  // the wing behind him, pivoting at his right shoulder (local -x): a cardboard angel wing, scalloped feathers
  const wp = (u, v) => [-56 - Math.cos(wa) * u + Math.sin(wa) * v, -296 - Math.sin(wa) * u - Math.cos(wa) * v];
  const wing = [wp(0, -10), wp(60, 40), wp(150, 70), wp(240, 60), wp(250, 20)];
  for (let i = 0; i <= 6; i++) { const u = 250 - i * 40; wing.push(wp(u - 8, -34 - (i % 2) * 6), wp(u - 22, -14)); }
  wing.push(wp(0, 10)); fblob(F, wing, PAPER);
  ftube(F, bend([-20, -170], [-40, -18], 6), 32, NAVY); ftube(F, bend([20, -170], [40, -18], -6), 32, NAVY);
  fblob(F, [[-78, -2], [-72, -30], [-26, -32], [-18, -2]], INK); fblob(F, [[18, -2], [26, -32], [72, -30], [78, -2]], INK);
  fblob(F, [[-70, -316], [70, -316], [56, -160], [-56, -160]], NAVY);
  fblob(F, [[-14, -316], [14, -316], [0, -270]], SNOW);
  ftube(F, bend([-64, -300], [-76, -186], 10), 26, NAVY); fcirc(F, -78, -180, 15, 15, SKIN);
  ftube(F, bend([64, -300], [76, -186], -10), 26, NAVY); fcirc(F, 78, -180, 15, 15, SKIN);
  ftube(F, [[0, -316], [0, -336]], 34, SKIN);
  fblob(F, [[-44, -330], [-48, -390], [-30, -420], [30, -420], [48, -390], [44, -330], [24, -318], [-24, -318]], SKIN);
  fblob(F, [[-46, -396], [-40, -424], [0, -432], [40, -424], [46, -396], [30, -410], [-30, -410]], INK);
  drawFig(F, () => {
    fblobDetail([[-38, -384], [-4, -384], [-8, -370], [-34, -370]]); fblobDetail([[4, -384], [38, -384], [34, -370], [8, -370]]); d([[-4, -380], [4, -380]], 'mnsb', 2);
    d([[-14, -344], [14, -344]], 'mnm', 2, OX); d([[46, -380], [52, -366], [46, -352], [40, -330]], 'mnear', 1.4);
    X.save(); X.fillStyle = PAPER; X.fillRect(18, -296, 40, 18); X.restore(); d(box(18, -296, 40, 18), 'mnbg', 1); X.save(); X.font = '12px KevinSans'; X.fillStyle = RED; X.textAlign = 'center'; X.translate(38, -283); X.scale(flip, 1); X.fillText('HIRED', 0, 0); X.restore();
    for (let i = 1; i < 6; i++) d([wp(40 * i, 50), wp(40 * i - 14, -10)], 'mnwf' + i, 1.2, PENCIL);
    d([[-60, -250], [-20, -300]], 'mnstrap', 3, OX); d([[-60, -210], [40, -250]], 'mnstrap2', 3, OX);
  });
  X.restore();
}
function fblobDetail(pts) { X.save(); X.fillStyle = INK; X.fill(pathOf(pts)); X.restore(); }
// the Shoveller (verse 3's stand-in, invented): round, sequinned gold parka, fur-ruff hood, star sunglasses,
// a platinum shovel in each hand, rhinestone snowshoes. Nothing of any real face. arms 0..1 raises the shovels.
function shoveller(x, y, s = 1, o = {}) {
  const { arms = 0.3, flip = 1, grin = 1 } = o, F = Fig('sh' + (o.tag || ''), x, y, s, flip);
  // snowshoes: oval frames under each boot
  for (const sx of [-44, 44]) fblob(F, circ(sx, -6, 52, 14), PLAT);
  ftube(F, bend([-22, -110], [-40, -22], 6), 30, NAVY); ftube(F, bend([22, -110], [40, -22], -6), 30, NAVY);
  fblob(F, [[-62, -16], [-56, -36], [-24, -38], [-18, -16]], INK); fblob(F, [[18, -16], [24, -38], [56, -36], [62, -16]], INK);
  // parka: a round gold body
  fblob(F, circ(0, -190, 92, 104), GILT);
  // shovels: shaft from each hand, blade at the top
  const ay = lerp(-200, -330, arms);
  for (const sd of [-1, 1]) {
    const hx = sd * 108, hy = ay, tx = sd * 150, ty = hy - 170;
    ftube(F, [[hx, hy + 60], [tx, ty]], 9, TAN);
    fblob(F, [[tx - 30, ty], [tx + 30, ty], [tx + 26, ty - 60], [tx, ty - 76], [tx - 26, ty - 60]], PLAT);
    ftube(F, bend([sd * 70, -250], [hx, hy], sd * -16), 30, GILT); fcirc(F, hx, hy, 16, 16, SNOW);
  }
  // fur ruff hood around a round face
  fcirc(F, 0, -330, 82, 76, SNOW); fcirc(F, 0, -326, 52, 50, SKIN2);
  drawFig(F, () => {
    // rhinestones on the parka and snowshoes
    const r = rng('shrh'); for (let i = 0; i < 34; i++) { const a = r() * TAU, rr = Math.sqrt(r()) * 84; const px = Math.cos(a) * rr, py = -190 + Math.sin(a) * rr * 1.1; dot(px, py, 2.4, SNOW); }
    for (const sx of [-44, 44]) for (let i = 0; i < 6; i++) dot(sx - 40 + i * 16, -6, 2.4, LAMP);
    // star sunglasses
    const star = (cx, cy, R) => { const p = []; for (let i = 0; i <= 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? R * 0.45 : R; p.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); } return p; };
    for (const ex of [-20, 20]) { const p = star(ex, -334, 20); X.save(); X.fillStyle = RED; X.fill(pathOf(p)); X.restore(); d(p, 'shst' + ex, 1.4); }
    d([[-2, -334], [2, -334]], 'shbr', 2);
    if (grin) { const g = [[-22, -308], [22, -308], [14, -296], [-14, -296], [-22, -308]]; X.save(); X.fillStyle = PAPER; X.fill(pathOf(g)); X.restore(); d(g, 'shg', 1.6); }
    d([[0, -250], [0, -110]], 'shzip', 1.4, OX);
  });
}
// the bellhop who runs the lobby's shell game: pillbox hat, ox jacket, gold buttons, white gloves, a sly look.
function bellhop(x, y, s = 1, o = {}) {
  const { flip = 1, look = 0 } = o, F = Fig('bh' + (o.tag || ''), x, y, s, flip);
  ftube(F, bend([-12, -128], [-18, -14], 4), 18, NAVY); ftube(F, bend([12, -128], [18, -14], -4), 18, NAVY);
  fblob(F, [[-40, -2], [-36, -20], [-12, -22], [-6, -2]], INK); fblob(F, [[6, -2], [12, -22], [36, -20], [40, -2]], INK);
  fblob(F, [[-40, -236], [40, -236], [34, -120], [-34, -120]], OX);
  ftube(F, bend([-38, -226], [-70, -150], 12), 18, OX); fcirc(F, -72, -146, 13, 13, SNOW);
  ftube(F, bend([38, -226], [72, -150], -12), 18, OX); fcirc(F, 74, -146, 13, 13, SNOW);
  ftube(F, [[0, -236], [0, -252]], 20, SKIN);
  fcirc(F, 0, -290, 44, 44, SKIN);
  fblob(F, [[-22, -326], [-20, -350], [26, -350], [28, -326]], RED);
  drawFig(F, () => {
    for (let i = 0; i < 4; i++) dot(10, -222 + i * 26, 3.4, GILT);
    eyes('bh', [-15 + look * 4, 15 + look * 4], -292, 'lid', 4.5);
    d([[-28, -308], [-6, -306]], 'bhb1', 1.6); d([[6, -310], [28, -316]], 'bhb2', 1.6);
    d([[-14, -268], [4, -266], [16, -272]], 'bhm', 1.8, OX);
    d([[-22, -326], [28, -326]], 'bhhb', 1.4, GILT);
  });
}
// a head of state: a blank stone bust on a plinth, paper crown, no face except a big nose. sniff 0..1 lifts the nose.
function bust(x, y, s = 1, o = {}) {
  const { sniff = 0, tag = '' } = o, F = Fig('bs' + tag, x, y, s, 1);
  fblob(F, [[-44, 0], [-44, -70], [44, -70], [44, 0]], STONE);
  fblob(F, [[-58, -70], [-58, -84], [58, -84], [58, -70]], STONE);
  fblob(F, [[-74, -84], [-44, -180], [44, -180], [74, -84]], STONE);
  fcirc(F, 0, -236, 42, 54, STONE);
  const ny = -236 - sniff * 12, ns = 1 + sniff * 0.3;
  fblob(F, [[-40, -276], [-40, -308], [-24, -292], [-12, -316], [0, -296], [12, -316], [24, -292], [40, -308], [40, -276]], GILT);
  drawFig(F, () => {
    const nose = [[-6, ny - 26], [8, ny - 26], [20 * ns, ny + 14], [16 * ns, ny + 26], [-18 * ns, ny + 26], [-22 * ns, ny + 14]];
    X.save(); X.fillStyle = '#a9a196'; X.fill(pathOf(nose)); X.restore(); ink(nose.concat([nose[0]]), 'bsn' + tag, { w: 2.2 });
    dot(-8 * ns, ny + 20, 3); dot(8 * ns, ny + 20, 3); d([[-30, -100], [30, -100]], 'bsl', 0.9, PENCIL); if (sniff > 0.3) for (let i = 0; i < 3; i++) d([[30 + i * 10, ny - 10 - i * 6], [36 + i * 10, ny - 22 - i * 6]], 'bssn' + i, 1, GREY); });
}
// props in the cardboard family: a public-opinion head on a stick (all identical), and a jester with a price tag.
function opinionHead(x, y, s = 1, o = {}) {
  const { tilt = 0, tag = '' } = o;
  X.save(); X.translate(x, y); X.rotate(tilt); X.scale(s, s);
  ink([[0, 0], [0, -70]], 'ohs' + tag, { w: 2.4, col: TAN });
  blob(circ(0, -104, 34, 38), TAN, 'oh' + tag, 1.8); blob(circ(0, -104, 26, 30), PAPER, 'ohf' + tag, 0.8);
  dot(-9, -110, 3); dot(9, -110, 3); ink([[-9, -92], [9, -92]], 'ohm' + tag, { w: 1.2 });
  X.restore();
}
function jester(x, y, s = 1, o = {}) {
  const { price = '$1', tag = '' } = o;
  X.save(); X.translate(x, y); X.scale(s, s);
  shape([[-40, 0], [-44, -110], [-22, -150], [-40, -200], [-14, -186], [0, -214], [14, -186], [40, -200], [22, -150], [44, -110], [40, 0], [-40, 0]], TAN, 'js' + tag, 2);
  blob(circ(0, -150, 20, 22), PAPER, 'jsf' + tag, 0.8); dot(-7, -154, 2.6); dot(7, -154, 2.6); ink([[-8, -140], [0, -136], [8, -140]], 'jsm' + tag, { w: 1.1 });
  for (const [px, py] of [[-40, -200], [0, -214], [40, -200]]) dot(px, py, 5, RED);
  shape(box(16, -80, 46, 28), PAPER, 'jst' + tag, 1.2); label(price, 39, -65, 16, RED);
  ink([[16, -66], [0, -60]], 'jsts' + tag, { w: 0.9 });
  X.restore();
}
