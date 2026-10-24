// The farmhouse at night, 60.0-77.1: one bedroom, an oil lamp, three children in a big bed, a painted portrait.
// A real room box (metres): X -RX..RX, Y -1.7 (ceiling) .. 1.35 (floor), Z 0 (doorway) .. 6 (back wall), seen by a
// camera that only moves forward. Points project with FF / (Z - camZ). Objects are painted in their own tone
// (albedo + form modelling), then a lamp lightmap multiplies the frame; the window and the flame are emissive.
const FF = 1250;
const LAMP = [-1.3, .8, 4.5];
const PORTRAIT = [.3, -.72, 5.99];
const WIN = { x0: 1.72, x1: 2.32, y0: -1.0, y1: .1 };
const GIRL = [.22, .12, 5.42], BOY = [.64, .3, 5.6], BABY = [1.08, .58, 5.7];
const RX = 3.0; // half the room's width

// plaster: three octaves of smoothed noise plus a few hairline cracks (seeded, built once)
const PLASTER = (() => {
  const c = mkCanvas(512, 512), g = c.getContext('2d'); g.fillStyle = '#c4c4c4'; g.fillRect(0, 0, 512, 512);
  [[6, .16], [24, .14], [96, .16], [512, .1]].forEach(([n, a], o) => {
    const s = mkCanvas(n, n), sg2 = s.getContext('2d'), d = sg2.createImageData(n, n), R = mulberry(77 + o);
    for (let i = 0; i < n * n; i++) { const v = 128 + (R() - .5) * 255; d.data[i * 4] = d.data[i * 4 + 1] = d.data[i * 4 + 2] = v; d.data[i * 4 + 3] = 255; }
    sg2.putImageData(d, 0, 0); g.globalAlpha = a; g.globalCompositeOperation = 'overlay'; g.imageSmoothingEnabled = true; g.drawImage(s, 0, 0, 512, 512);
  });
  g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; const R = mulberry(5);
  g.strokeStyle = 'rgba(60,60,60,.22)'; g.lineWidth = 1;
  for (let k = 0; k < 6; k++) { let x = R() * 512, y = R() * 512; g.beginPath(); g.moveTo(x, y); for (let i = 0; i < 9; i++) { x += (R() - .4) * 22; y += (R() - .5) * 22; g.lineTo(x, y); } g.stroke(); }
  return c;
})();

// camera: one move per rep, cuts between them, always further into the room
const FARM_SHOTS = [
  { t: 60.0, e: 64.47, a: [.25, -.06, 1.25], b: [.3, -.03, 2.35] }, // rep 1: wide on the room, dolly in
  { t: 64.47, e: 67.45, a: [.43, .14, 4.66], b: [.44, .13, 4.8] }, // rep 2: the girl whispering to the boy
  { t: 67.45, e: 70.39, a: [.3, -.71, 4.5], b: [.3, -.72, 5.03] },  // rep 3: the portrait, eyes turning
  { t: 70.39, e: 72.64, a: [-.72, .5, 3.0], b: [-.6, .47, 3.3] },  // rep 4: the lamp and the shadows on the wall
  { t: 72.64, e: 74.84, a: [.7, .38, 4.86], b: [.72, .37, 4.96] },   // rep 5: the boy's face, eyes to the window, closing
  { t: 74.84, e: 75.85, a: [.72, .37, 4.96], b: [1.95, -.42, 4.98] },  // rep 6: pan up to the window
  { t: 75.85, e: 77.1, a: [1.95, -.42, 4.98], b: [2.02, -.45, 5.93], ease: 'in' }, // push through it into the white
];
function farmCam(t) {
  const [sh, lt, i] = shotAt(FARM_SHOTS, t), u = clamp(lt / (sh.e - sh.t));
  const e = sh.ease === 'in' ? Math.pow(smooth(u), 1.25) : u * .6 + smooth(u) * .4;
  const hand = .006; // a little life in the dolly
  return { x: lerp(sh.a[0], sh.b[0], e) + n1(201, t * .7) * hand, y: lerp(sh.a[1], sh.b[1], e) + n1(203, t * .6) * hand, z: lerp(sh.a[2], sh.b[2], e), shot: i };
}

// lamp: turned up at the first "asa", a breathing flicker, and in rep 4 it gutters on every word
function lampI(t) {
  let I = lerp(.32, 1, ease(t, 60.1, 60.95)) * (1 + .05 * n1(1, t * 7) + .035 * n1(2, t * 19));
  for (const r of REPS) I += .12 * Math.exp(-Math.max(0, t - r.t) / .5) * (t >= r.t ? 1 : 0);
  if (t >= 70.3 && t < 72.6) for (const w of REPS[3].words) { const d = t - w.t; if (d > 0 && d < .7) I *= 1 - .38 * Math.sin(clamp(d / .7) * Math.PI) * Math.exp(-d * 2); }
  return I;
}
function flameLean(t) {
  let l = .012 * n1(3, t * 5);
  if (t >= 70.3 && t < 72.6) for (const w of REPS[3].words) { const d = t - w.t; if (d > 0 && d < .8) l += .045 * Math.sin(d * 9) * Math.exp(-d * 3.5); }
  return l;
}
// the window: a moonlit night, brightening into the white of the dream from rep 5 on
function winGlow(t) { return Math.pow(ease(t, 73.2, 77.0), 1.6) + .35 * ease(t, 76.25, 76.5) * (t < 77.1 ? 1 : 0); }
function portraitLook(t) {
  if (t < 68.23) return [.85, -.05];                               // a painting looking off to the side
  if (t < 69.08) { const u = smooth((t - 68.23) / .3); return [lerp(.85, -.45, u), lerp(-.05, .85, u)]; } // "nisi": down at the children
  const u = smooth((t - 69.08) / .18); return [lerp(-.45, 0, u), lerp(.85, 0, u)];             // "masa": straight at us
}

function drawFarm(g, t) {
  const cam = farmCam(t);
  const P = (X, Y, Z) => { const d = Math.max(.04, Z - cam.z), s = FF / d; return [FW / 2 + (X - cam.x) * s, FH / 2 + (Y - cam.y) * s, s]; };
  const zn = Math.max(cam.z + .1, 0);
  const I = lampI(t), lean = flameLean(t), wg = winGlow(t);
  const L = [LAMP[0] + lean * .6, LAMP[1] + Math.abs(lean) * .2, LAMP[2]];
  g.fillStyle = '#000'; g.fillRect(0, 0, FW, FH);

  // ---- the room box ----
  const quad = (pts, fill) => { poly(g, pts.map((p) => P(...p))); g.fillStyle = fill; g.fill(); };
  // ceiling: dark boards and beams
  { const a = P(-RX, -1.7, zn), b = P(-RX, -1.7, 6); quad([[-RX, -1.7, zn], [RX, -1.7, zn], [RX, -1.7, 6], [-RX, -1.7, 6]], linG(g, 0, a[1], 0, b[1], [[0, .14], [1, .3]]));
    for (const bz of [1.1, 2.3, 3.5, 4.7]) if (bz > zn + .05) { quad([[-RX, -1.7, bz], [RX, -1.7, bz], [RX, -1.7, bz + .22], [-RX, -1.7, bz + .22]], gv(.08)); quad([[-RX, -1.7, bz], [RX, -1.7, bz], [RX, -1.55, bz], [-RX, -1.55, bz]], gv(.2)); } }
  // floor: terracotta tiles
  { const a = P(0, 1.35, zn), b = P(0, 1.35, 6); quad([[-RX, 1.35, zn], [RX, 1.35, zn], [RX, 1.35, 6], [-RX, 1.35, 6]], linG(g, 0, a[1], 0, b[1], [[0, .3], [1, .42]]));
    g.strokeStyle = gv(.1, .45); g.lineWidth = 1.2; g.beginPath();
    for (let x = -RX; x <= RX; x += .42) { const p = P(x, 1.35, zn), q = P(x, 1.35, 6); g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); }
    for (let z = Math.ceil(zn / .42) * .42; z < 6; z += .42) { const p = P(-RX, 1.35, z), q = P(RX, 1.35, z); g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); }
    g.stroke(); }
  // side walls
  for (const sx of [-RX, RX]) { const a = P(sx, 0, zn), b = P(sx, 0, 6); quad([[sx, -1.7, zn], [sx, -1.7, 6], [sx, 1.35, 6], [sx, 1.35, zn]], linG(g, a[0], 0, b[0], 0, [[0, .3], [1, .58]])); }
  // back wall: plaster, a darker painted dado below
  const w0 = P(-RX, -1.7, 6), w1 = P(RX, 1.35, 6), s6 = w0[2];
  g.save(); g.globalAlpha = 1; g.drawImage(PLASTER, w0[0], w0[1], w1[0] - w0[0], w1[1] - w0[1]);
  g.globalCompositeOperation = 'multiply'; g.fillStyle = gv(.86); g.fillRect(w0[0], w0[1], w1[0] - w0[0], w1[1] - w0[1]);
  const d0 = P(-RX, .55, 6); g.fillStyle = gv(.62); g.fillRect(w0[0], d0[1], w1[0] - w0[0], w1[1] - d0[1]);
  g.restore();
  g.fillStyle = gv(.25, .8); g.fillRect(w0[0], d0[1] - .012 * s6, w1[0] - w0[0], .024 * s6);
  // corner shading where the walls meet
  g.fillStyle = linG(g, w0[0], 0, w0[0] + .5 * s6, 0, [[0, 0, .35], [1, 0, 0]]); g.fillRect(w0[0], w0[1], .5 * s6, w1[1] - w0[1]);
  g.fillStyle = linG(g, w1[0], 0, w1[0] - .5 * s6, 0, [[0, 0, .35], [1, 0, 0]]); g.fillRect(w1[0] - .5 * s6, w0[1], .5 * s6, w1[1] - w0[1]);

  // window opening (dark reveal now, glass painted later as emissive)
  const wa = P(WIN.x0, WIN.y0, 6), wb = P(WIN.x1, WIN.y1, 6);
  g.fillStyle = gv(.04); g.fillRect(wa[0] - .05 * s6, wa[1] - .05 * s6, wb[0] - wa[0] + .1 * s6, wb[1] - wa[1] + .1 * s6);

  // portrait on the wall
  { const p = P(...PORTRAIT); drawPortrait(g, p[0], p[1], p[2], t); }

  // headboard (dark carved wood, arched top)
  { const a = P(-.78, -.02, 5.96), b = P(1.38, 1.35, 5.96), s = a[2];
    g.fillStyle = linG(g, a[0], 0, b[0], 0, [[0, .34], [.5, .22], [1, .13]]);
    g.beginPath(); g.moveTo(a[0], b[1]); g.lineTo(a[0], a[1] + .12 * s); g.quadraticCurveTo((a[0] + b[0]) / 2, a[1] - .18 * s, b[0], a[1] + .12 * s); g.lineTo(b[0], b[1]); g.closePath(); g.fill();
    g.strokeStyle = gv(.6, .5); g.lineWidth = .012 * s; g.beginPath(); g.moveTo(a[0] + .03 * s, a[1] + .14 * s); g.quadraticCurveTo((a[0] + b[0]) / 2, a[1] - .14 * s, b[0] - .03 * s, a[1] + .14 * s); g.stroke();
    g.strokeStyle = gv(.08, .6); g.lineWidth = .01 * s; g.beginPath(); g.moveTo(a[0] + .12 * s, a[1] + .25 * s); g.quadraticCurveTo((a[0] + b[0]) / 2, a[1] + .02 * s, b[0] - .12 * s, a[1] + .25 * s); g.stroke(); }

  // a bank of soft pillows against the headboard
  for (const [px, py, pw, ph] of [[-.4, .5, .7, .3], [.42, .44, .78, .36], [1.08, .55, .6, .26]]) {
    const p = P(px, py, 5.84), s = p[2];
    softFill(g, .025 * s, () => { g.fillStyle = radG(g, p[0], p[1], .02 * s, .45 * s, [[0, .96], [.55, .85], [1, .6]], -.16 * s, -.08 * s);
      g.beginPath(); g.roundRect(p[0] - pw / 2 * s, p[1] - ph / 2 * s, pw * s, ph * s, ph * .48 * s); g.fill(); });
    g.strokeStyle = gv(.55, .3); g.lineWidth = .008 * s; g.beginPath(); g.moveTo(p[0] - pw * .3 * s, p[1] + ph * .15 * s); g.quadraticCurveTo(p[0], p[1] + ph * .3 * s, p[0] + pw * .3 * s, p[1] + ph * .1 * s); g.stroke();
  }

  // the girl's lamp shadow, thrown big onto the wall, headboard and pillows (moves with the flame)
  { const ts = (5.97 - L[2]) / (GIRL[2] - L[2]);
    const sp = P(L[0] + ts * (GIRL[0] - L[0]), L[1] + ts * (GIRL[1] - L[1]), 5.97), k = ts * sp[2];
    softFill(g, .035 * k, () => { g.globalAlpha = .78; drawGirl(g, sp[0], sp[1], k, t, true); }); }

  // the little one asleep, turned away; the boy sitting up against the pillows
  { const p = P(...BABY), s = p[2]; drawHead(g, p[0], p[1], .095 * s, { turn: .95, tilt: .55, skin: .74, hair: .14, style: 'boy', eyes: 0, L: [-1, -.2], la: .55, soft: .0012 * s }); }
  { const p = P(...BOY), s = p[2], lk = boyLook(t), op = boyEyes(t);
    drawChildBody(g, p[0], p[1], s, false, -.05);
    drawHead(g, p[0], p[1], .105 * s, { turn: -.3 + lk[0] * .2, tilt: -.06, skin: .88, hair: .08, style: 'boy', eyes: op, look: lk, L: [-1, -.3], la: .8, soft: .001 * s });
    if (wg > 0) { g.save(); g.globalCompositeOperation = 'screen'; g.fillStyle = radG(g, p[0] + .08 * s, p[1], 0, .16 * s, [[0, .35 * wg], [1, 0]]); g.fillRect(p[0] - .3 * s, p[1] - .3 * s, .6 * s, .6 * s); g.restore(); } }

  // blanket: top surface with the children's shapes underneath, turned-down sheet, folds
  { const c = [[-.78, .78, 4.0], [1.38, .78, 4.0], [1.38, .72, 5.5], [-.78, .72, 5.5]].map((q) => P(...q));
    poly(g, c); g.fillStyle = linG(g, 0, c[0][1], 0, c[2][1], [[0, .72], [1, .88]]); g.fill();
    g.save(); poly(g, c); g.clip();
    for (const [bx, w] of [[GIRL[0], .3], [BOY[0], .26], [BABY[0], .2]]) {
      const a = P(bx, .7, 5.3), b = P(bx, .74, 4.4);
      softFill(g, .03 * a[2], () => { g.strokeStyle = gv(1, .5); g.lineWidth = w * .35 * a[2]; g.beginPath(); g.moveTo(a[0] - w * .1 * a[2], a[1]); g.lineTo(b[0] - w * .1 * b[2], b[1]); g.stroke();
        g.strokeStyle = gv(0, .28); g.lineWidth = w * .25 * a[2]; g.beginPath(); g.moveTo(a[0] + w * .4 * a[2], a[1]); g.lineTo(b[0] + w * .4 * b[2], b[1]); g.stroke(); });
    }
    g.strokeStyle = gv(.35, .35); g.lineWidth = 2; g.beginPath();
    for (let i = 0; i < 5; i++) { const a = P(-.6 + i * .45, .77, 4.1), b = P(-.5 + i * .42 + .1, .74, 5.0); g.moveTo(a[0], a[1]); g.quadraticCurveTo((a[0] + b[0]) / 2 + 20, (a[1] + b[1]) / 2, b[0], b[1]); }
    g.stroke(); g.restore();
    const e0 = P(-.78, .72, 5.42), e1 = P(1.38, .72, 5.42), e2 = P(1.38, .67, 5.56), e3 = P(-.78, .67, 5.56);
    g.fillStyle = linG(g, 0, e2[1], 0, e0[1], [[0, .99], [1, .84]]); poly(g, [[e0[0], e0[1]], [e1[0], e1[1]], [e2[0], e2[1]], [e3[0], e3[1]]]); g.fill();
    g.strokeStyle = gv(.45, .5); g.lineWidth = .006 * e0[2]; g.beginPath(); g.moveTo(e0[0], e0[1]); g.lineTo(e1[0], e1[1]); g.stroke(); }

  // the girl sitting up
  { const p = P(...GIRL), ey = P(0, .72, 5.42)[1]; g.save(); g.beginPath(); g.rect(-50, -50, FW + 100, ey + 50); g.clip(); drawGirl(g, p[0], p[1], p[2], t, false); g.restore(); }

  // nightstand and lamp body
  { const a = P(-1.55, 1.06, 4.3), b = P(-1.05, 1.35, 4.3), tb = P(-1.55, 1.06, 4.7), s = a[2];
    g.fillStyle = gv(.5); poly(g, [[a[0], a[1]], [b[0], a[1]], [P(-1.05, 1.06, 4.7)[0], tb[1]], [tb[0], tb[1]]]); g.fill();
    g.fillStyle = linG(g, a[0], 0, b[0], 0, [[0, .2], [1, .32]]); g.fillRect(a[0], a[1], b[0] - a[0], b[1] - a[1]);
    g.fillStyle = gv(.1, .7); g.fillRect(a[0] + .05 * s, a[1] + .08 * s, b[0] - a[0] - .1 * s, .12 * s);
    g.fillStyle = gv(.7); ell(g, (a[0] + b[0]) / 2, a[1] + .14 * s, .015 * s, .015 * s); g.fill(); // drawer knob
    drawLampBody(g, P(LAMP[0], 1.06, LAMP[2]), t); }

  // footboard and posts
  if (zn < 3.95) {
    const a = P(-.8, .62, 3.98), b = P(1.4, 1.35, 3.98), s = a[2];
    g.fillStyle = linG(g, a[0], 0, b[0], 0, [[0, .32], [.4, .2], [1, .1]]); g.fillRect(a[0], a[1], b[0] - a[0], b[1] - a[1]);
    g.fillStyle = gv(.5, .55); g.fillRect(a[0], a[1], b[0] - a[0], .025 * s);
    g.strokeStyle = gv(.06, .7); g.lineWidth = .012 * s; g.strokeRect(a[0] + .1 * s, a[1] + .12 * s, b[0] - a[0] - .2 * s, b[1] - a[1] - .25 * s);
    for (const px of [-.8, 1.4]) { const q = P(px, .52, 3.98); g.fillStyle = linG(g, q[0] - .04 * s, 0, q[0] + .04 * s, 0, [[0, .45], [1, .1]]); g.fillRect(q[0] - .035 * s, q[1], .07 * s, b[1] - q[1]);
      g.fillStyle = radG(g, q[0], q[1], .005 * s, .06 * s, [[0, .75], [1, .12]], -.02 * s, -.02 * s); ell(g, q[0], q[1] - .02 * s, .055 * s, .055 * s); g.fill(); }
  }
  // doorway (the near wall, only while the camera is behind it)
  if (cam.z < -.1) {
    const l0 = P(-RX, -1.7, 0), l1 = P(-.62, 1.35, 0), r0 = P(.62, -1.7, 0), r1 = P(RX, 1.35, 0), s = l1[2];
    g.fillStyle = gv(.03); g.fillRect(l0[0], l0[1], l1[0] - l0[0], l1[1] - l0[1]); g.fillRect(r0[0], r0[1], r1[0] - r0[0], r1[1] - r0[1]);
    const lt = P(-RX, -1.7, 0), li = P(RX, -.72, 0); g.fillRect(lt[0], lt[1], li[0] - lt[0], li[1] - lt[1]);
    g.fillStyle = linG(g, l1[0] - .1 * s, 0, l1[0], 0, [[0, .03], [1, .2]]); g.fillRect(l1[0] - .1 * s, li[1], .1 * s, l1[1] - li[1]);
    g.fillStyle = linG(g, r0[0], 0, r0[0] + .1 * s, 0, [[0, .12], [1, .03]]); g.fillRect(r0[0], li[1], .1 * s, l1[1] - li[1]);
  }

  // ---- the lamp's light (multiply): hot by the flame, falling off into black ----
  { const c = P(L[0], L[1], 5.4), R = 3.5 * c[2];
    g.save(); g.globalCompositeOperation = 'multiply';
    g.fillStyle = radG(g, c[0], c[1], 0, R, [[0, Math.min(1, I)], [.14, Math.min(1, I)], [.3, Math.min(1, .9 * I)], [.48, .6 * I], [.68, .24], [.86, .07], [1, .035]]);
    g.fillRect(0, 0, FW, FH); g.restore();
    const q = P(L[0], L[1], L[2]);
    g.save(); g.globalCompositeOperation = 'screen'; g.fillStyle = radG(g, q[0], q[1], 0, .8 * q[2], [[0, .38 * I], [.4, .1 * I], [1, 0]]); g.fillRect(0, 0, FW, FH); g.restore();
  }
  // a rush chair in the right foreground, dark against the room (only while the camera is behind it)
  if (cam.z < 3.0) { const p = P(2.05, .9, 3.3), s = p[2]; drawChair(g, p[0], p[1], s); }
  // ---- emissive: window, curtains, flame ----
  drawWindow(g, P, t, wg, s6);
  drawFlame(g, P(L[0], L[1], L[2]), I, lean, t);
  // moonlight / dream light spilling from the window onto the room
  { const c = P((WIN.x0 + WIN.x1) / 2, (WIN.y0 + WIN.y1) / 2, 5.95), R = (1.8 + wg * 2.5) * c[2];
    g.save(); g.globalCompositeOperation = 'screen'; g.fillStyle = radG(g, c[0], c[1], 0, R, [[0, .05 + .5 * wg], [.5, .015 + .2 * wg], [1, 0]]); g.fillRect(0, 0, FW, FH); g.restore(); }
  // the dream comes in: the whole frame goes white
  const wh = ease(t, 76.45, 77.08);
  if (wh > 0) { g.fillStyle = gv(1, wh); g.fillRect(0, 0, FW, FH); }
}

function boyLook(t) {
  if (t < 64.47) return [-.3, -.2];
  if (t < 72.64) return [-.85, -.3];                               // at his sister (rep 2 on)
  const u = smooth((t - 72.64) / .35); return [lerp(-.85, .9, u), lerp(-.3, -.35, u)]; // to the window
}
function boyEyes(t) {
  if (t < 64.47) return .55;
  if (t < 74.05) return lerp(.55, 1, ease(t, 64.47, 64.7));        // wide awake at her whisper
  return 1 - ease(t, 74.05, 74.5);                                 // "masa": asleep, the dream begins
}

// A child's shoulders in a white nightshirt, under head centre (hx, hy); k = px per metre; lean = radians.
// Lit from the lamp on the left: the near side bright, the far side turning into shadow, soft folds, a gathered yoke.
function drawChildBody(g, hx, hy, k, sil, lean) {
  g.save(); g.translate(hx, hy); g.scale(k, k); g.rotate(lean);
  g.beginPath(); g.moveTo(-.045, .1); g.quadraticCurveTo(-.06, .15, -.16, .17); g.quadraticCurveTo(-.2, .19, -.19, .28); g.quadraticCurveTo(-.2, .55, -.18, .78);
  g.lineTo(.18, .78); g.quadraticCurveTo(.2, .55, .19, .28); g.quadraticCurveTo(.2, .19, .16, .17); g.quadraticCurveTo(.06, .15, .045, .1); g.closePath();
  if (sil) { g.fillStyle = gv(0); g.fill(); g.restore(); return; }
  g.fillStyle = radG(g, -.07, .25, .02, .4, [[0, 1], [.5, .9], [1, .66]], -.04, -.08); g.fill();
  g.save(); g.clip();
  g.fillStyle = linG(g, -.05, 0, .2, 0, [[0, 0, 0], [.6, 0, .25], [1, 0, .5]]); g.fillRect(-.3, 0, .6, .9);
  // sleeve seams and puffs
  // soft folds hanging from the yoke
  softFill(g, .012 * k, () => { g.strokeStyle = gv(0, .3); g.lineWidth = .025; g.beginPath();
    for (const fx of [-.11, -.03, .06, .13]) { g.moveTo(fx, .24); g.quadraticCurveTo(fx + .02, .5, fx - .01, .8); } g.stroke();
    g.strokeStyle = gv(1, .5); g.lineWidth = .02; g.beginPath(); for (const fx of [-.14, -.07, .02]) { g.moveTo(fx, .25); g.quadraticCurveTo(fx + .02, .5, fx, .8); } g.stroke(); });
  // gathered yoke: a band of tiny pleats, buttons
  g.strokeStyle = gv(.45, .5); g.lineWidth = .005; g.beginPath(); g.moveTo(-.16, .23); g.quadraticCurveTo(0, .27, .16, .23); g.stroke();
  g.strokeStyle = gv(.55, .22); g.beginPath(); for (let i = -6; i <= 6; i++) { g.moveTo(i * .02, .17 + Math.abs(i) * .002); g.lineTo(i * .021, .235); } g.stroke();
  g.fillStyle = gv(.35); ell(g, 0, .18, .006, .006); g.fill(); ell(g, 0, .215, .006, .006); g.fill();
  g.restore();
  // a small frilled collar
  g.strokeStyle = gv(1, .9); g.lineWidth = .014; g.beginPath(); for (let i = 0; i <= 10; i++) { const a = Math.PI * (.15 + i / 10 * .7), r = .075 + (i % 2) * .008; g.lineTo(Math.cos(a) * r, .085 + Math.sin(a) * r * .55); } g.stroke();
  g.restore();
}
// The girl sitting up in bed, leaning toward her brother, a hand beside her mouth, whispering.
// (hx, hy) = head centre, k = px per metre; sil = flat silhouette (for her lamp shadow).
function drawGirl(g, hx, hy, k, t, sil) {
  const lean = .05 + .04 * ease(t, 60.9, 61.6) + .05 * ease(t, 64.3, 64.6);
  drawChildBody(g, hx, hy, k, sil, lean);
  if (sil) { g.save(); g.translate(hx, hy); g.scale(k, k); g.rotate(lean); g.fillStyle = gv(0); ell(g, 0, -.01, .1, .115); g.fill(); g.restore(); return; }
  drawHead(g, hx, hy, .108 * k, { turn: .6, tilt: lean * .6, skin: .88, hair: .09, style: 'girl', eyes: .85, look: [.8, .3], mouth: mouthAt(t), L: [-1, -.25], la: .8, soft: .001 * k });
}

// A rush-seat chair seen from the front-left, a cardigan thrown over its back; (x, y) = seat front centre
function drawChair(g, x, y, k) {
  g.save(); g.translate(x, y); g.scale(k, k);
  const wood = (v) => gv(v);
  g.strokeStyle = wood(.08); g.lineCap = 'butt';
  g.lineWidth = .045; g.beginPath(); for (const lx of [-.22, .22]) { g.moveTo(lx, 0); g.lineTo(lx, .45); } for (const lx of [-.18, .2]) { g.moveTo(lx, -.05); g.lineTo(lx + .02, -.55); } g.stroke();
  g.lineWidth = .04; g.beginPath(); for (const yy of [-.5, -.38, -.26]) { g.moveTo(-.18, yy); g.lineTo(.21, yy); } g.stroke();
  g.fillStyle = linG(g, -.25, -.04, .25, .04, [[0, .3], [1, .12]]); poly(g, [[-.25, 0], [.25, 0], [.21, -.08], [-.2, -.08]]); g.fill();
  g.fillStyle = radG(g, -.05, -.42, .02, .3, [[0, .35], [1, .1]], -.1, -.05);
  g.beginPath(); g.moveTo(-.22, -.56); g.quadraticCurveTo(0, -.6, .24, -.54); g.lineTo(.27, -.2); g.quadraticCurveTo(.1, -.15, .05, -.3); g.quadraticCurveTo(-.08, -.12, -.24, -.25); g.closePath(); g.fill();
  g.strokeStyle = gv(.55, .5); g.lineWidth = .01; g.beginPath(); g.moveTo(-.2, -.55); g.lineTo(-.24, -.26); g.moveTo(-.22, 0); g.lineTo(-.22, .44); g.stroke();
  g.restore();
}

// Oil lamp: glass font, brass collar, glass chimney. base = projected point of the nightstand top under it.
function drawLampBody(g, base, t) {
  const [x, y, s] = base;
  g.fillStyle = radG(g, x, y - .08 * s, .005 * s, .1 * s, [[0, .85], [.5, .5], [1, .25]], -.03 * s, -.03 * s); ell(g, x, y - .07 * s, .085 * s, .07 * s); g.fill();
  g.fillStyle = gv(.35); g.fillRect(x - .06 * s, y - .01 * s, .12 * s, .012 * s);
  g.fillStyle = linG(g, x - .03 * s, 0, x + .03 * s, 0, [[0, .7], [1, .3]]); g.fillRect(x - .03 * s, y - .17 * s, .06 * s, .04 * s);
  // chimney glass (bulge), drawn faintly; the glow comes with the flame
  g.strokeStyle = gv(.9, .45); g.lineWidth = .006 * s;
  g.beginPath(); g.moveTo(x - .028 * s, y - .17 * s); g.bezierCurveTo(x - .055 * s, y - .21 * s, x - .055 * s, y - .29 * s, x - .02 * s, y - .32 * s); g.lineTo(x - .02 * s, y - .44 * s);
  g.moveTo(x + .028 * s, y - .17 * s); g.bezierCurveTo(x + .055 * s, y - .21 * s, x + .055 * s, y - .29 * s, x + .02 * s, y - .32 * s); g.lineTo(x + .02 * s, y - .44 * s); g.stroke();
}
function drawFlame(g, p, I, lean, t) {
  const [x, y, s] = p, h = (.055 + .01 * n1(9, t * 11)) * Math.min(1.25, .7 + .4 * I);
  g.save(); g.globalCompositeOperation = 'screen';
  g.fillStyle = radG(g, x, y, 0, .3 * s, [[0, .8 * Math.min(1, I)], [.25, .3 * I], [1, 0]]); ell(g, x, y, .3 * s, .36 * s); g.fill(); // glow in the chimney
  g.fillStyle = radG(g, x, y, 0, .06 * s, [[0, 1], [1, .7, 0]]);
  g.beginPath(); g.moveTo(x - .018 * s, y + .012 * s); g.quadraticCurveTo(x - .02 * s, y - h * .4 * s, x + lean * s, y - h * s); g.quadraticCurveTo(x + .02 * s, y - h * .4 * s, x + .018 * s, y + .012 * s); g.closePath(); g.fill();
  g.restore();
}

// The window: night sky with the moon behind haze, a dark hill, open casements; sheer curtains each side.
function drawWindow(g, P, t, wg, s6) {
  const a = P(WIN.x0, WIN.y0, 6), b = P(WIN.x1, WIN.y1, 6), s = a[2], w = b[0] - a[0], h = b[1] - a[1];
  const sky = lerp(.13, 1, wg);
  g.save(); g.beginPath(); g.rect(a[0], a[1], w, h); g.clip();
  g.fillStyle = linG(g, 0, a[1], 0, b[1], [[0, sky * .85], [1, Math.min(1, sky * 1.12)]]); g.fillRect(a[0], a[1], w, h);
  g.fillStyle = radG(g, a[0] + w * .7, a[1] + h * .25, 0, w * .5, [[0, lerp(.55, 1, wg)], [.15, lerp(.3, 1, wg)], [1, sky, 0]]); g.fillRect(a[0], a[1], w, h);
  g.fillStyle = gv(lerp(.05, .95, wg)); g.beginPath(); g.moveTo(a[0], b[1] - h * .25); g.quadraticCurveTo(a[0] + w * .4, b[1] - h * .42, b[0], b[1] - h * .3); g.lineTo(b[0], b[1]); g.lineTo(a[0], b[1]); g.fill();
  // mullions
  g.fillStyle = gv(lerp(.08, .55, wg), 1 - wg * .6); g.fillRect(a[0] + w / 2 - .02 * s, a[1], .04 * s, h); g.fillRect(a[0], a[1] + h * .45, w, .035 * s);
  g.restore();
  // reveal and sill
  g.strokeStyle = gv(.18); g.lineWidth = .04 * s; g.strokeRect(a[0], a[1], w, h);
  g.fillStyle = gv(.55); g.fillRect(a[0] - .06 * s, b[1], w + .12 * s, .04 * s);
  // sheer curtains, backlit, billowing on rep 6's words
  let bil = .3 * n1(301, t * .8);
  for (const wd of REPS[5].words) { const d = t - wd.t; if (d > 0) bil += .9 * Math.sin(Math.min(d, 1.2) * 2.6) * Math.exp(-d * 1.5); }
  for (const side of [-1, 1]) {
    const x0 = side < 0 ? a[0] - .02 * s : b[0] + .02 * s, top = a[1] - .1 * s, bot = b[1] + .12 * s;
    const out = side * (.16 + .06 * bil) * s, sway = side * bil * .08 * s;
    g.fillStyle = linG(g, x0, 0, x0 - out, 0, [[0, lerp(.3, 1, wg), .9], [1, lerp(.18, 1, wg), .6]]);
    g.beginPath(); g.moveTo(x0 + side * .03 * s, top); g.lineTo(x0 - out * .9, top);
    g.bezierCurveTo(x0 - out * 1.1 - sway, top + (bot - top) * .4, x0 - out * .6 - sway * 2, bot - (bot - top) * .2, x0 - out * .7 - sway * 2.4, bot);
    g.lineTo(x0 + side * .02 * s - sway, bot); g.closePath(); g.fill();
    g.strokeStyle = gv(lerp(.5, 1, wg), .25 + .3 * wg); g.lineWidth = .006 * s;
    for (let i = 1; i < 4; i++) { const u = i / 4; g.beginPath(); g.moveTo(x0 - out * u * .9, top); g.quadraticCurveTo(x0 - out * u - sway, (top + bot) / 2, x0 - out * u * .8 - sway * 2.2, bot); g.stroke(); }
  }
}

// The portrait: an old man in an oval gilt frame, painted dark; his eyes follow the children.
function drawPortrait(g, x, y, k, t) {
  g.save(); g.translate(x, y); g.scale(k, k);
  // frame
  g.fillStyle = linG(g, -.36, -.45, .36, .45, [[0, .72], [.5, .42], [1, .2]]); ell(g, 0, 0, .37, .47); g.fill();
  g.strokeStyle = gv(.95, .55); g.lineWidth = .012; g.beginPath(); g.ellipse(0, 0, .35, .45, 0, Math.PI * .95, Math.PI * 1.6); g.stroke();
  g.strokeStyle = gv(.1, .8); g.lineWidth = .015; ell(g, 0, 0, .315, .405); g.stroke();
  // canvas
  g.save(); ell(g, 0, 0, .305, .395); g.clip();
  g.fillStyle = radG(g, -.05, -.1, .02, .45, [[0, .42], [.6, .24], [1, .1]]); g.fillRect(-.4, -.5, .8, 1);
  // coat and collar
  g.fillStyle = linG(g, -.3, .1, .3, .4, [[0, .2], [1, .05]]); g.beginPath(); g.moveTo(-.34, .42); g.quadraticCurveTo(-.3, .14, -.1, .12); g.lineTo(.1, .12); g.quadraticCurveTo(.3, .14, .34, .42); g.closePath(); g.fill();
  g.fillStyle = gv(.86); poly(g, [[-.08, .1], [0, .2], [.08, .1], [.04, .25], [-.04, .25]]); g.fill();
  g.fillStyle = gv(.08); poly(g, [[-.03, .14], [.03, .14], [.02, .3], [-.02, .3]]); g.fill();
  drawHead(g, 0, -.07, .15, { turn: .12, skin: .9, hair: .2, style: 'old', eyes: 1, look: portraitLook(t), L: [-.6, -.8], la: .8, mouth: 0 });
  // craquelure and varnish sheen
  g.strokeStyle = gv(0, .09); g.lineWidth = .002; g.beginPath(); const R = mulberry(31);
  for (let i = 0; i < 26; i++) { let px = (R() - .5) * .6, py = (R() - .5) * .8; g.moveTo(px, py); for (let j = 0; j < 4; j++) { px += (R() - .5) * .07; py += (R() - .5) * .07; g.lineTo(px, py); } }
  g.stroke();
  g.fillStyle = linG(g, -.3, -.4, -.05, -.1, [[0, 1, 0], [.5, 1, .12], [1, 1, 0]]); g.fillRect(-.4, -.5, .8, 1);
  g.restore();
  g.restore();
}
