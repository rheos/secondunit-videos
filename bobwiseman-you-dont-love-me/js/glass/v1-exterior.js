// INTRO, draft 12: the outside of the church. Bob (2026-10-17, on draft 11): "i am not crazy about the opening of
// reflected stain glass. could you try instead playing with an exterior shot of a church?"
// The first 18 s were the dark nave with the window's colours crawling over the floor. Now: a stone church at dawn,
// seen up the churchyard path, all of it in the same leaded glass. Its big window is OUR window (the same four
// lancets in the same world place), glowing from the candles inside, and the camera pushes up the path toward it
// on one long move until the window fills the frame exactly as the interior's tilt used to end (V1CAM at 18.0).
// From 17.2 to 18.0 the outside dissolves away around the window, so the window itself carries us in; from 18.0 the
// interior is as draft 11 (the push into lancet 1, the first line at 22.86). Pure function of song time t.

const EX = { t1: 18.0, mix0: 17.2 };
// One long push: scale eased in log space from the whole churchyard to the interior's 18.0 key (1900, 1300, .44),
// so the hand-off to the interior camera is still.
const EXCAM0 = [1900, 1150, .108], EXCAM1 = [1900, 1300, .44];
function exCam(t) {
  const u = ease(t, -1.5, EX.t1);
  return { x: EXCAM0[0], y: lerp(EXCAM0[1], EXCAM1[1], u), s: Math.exp(lerp(Math.log(EXCAM0[2]), Math.log(EXCAM1[2]), u)) };
}
// Dawn: night blue to rose to gold through the intro; L = how much daylight is on the stone (0 night .. 1 day).
const EXSKY = [[0, [14, 20, 58], [40, 44, 92], .2], [5.0, [34, 40, 96], [176, 92, 120], .38], [11, [92, 112, 176], [244, 150, 120], .66], [18, [150, 186, 226], [252, 214, 168], .92]];
function exSky(t) {
  let i = 0; while (i + 2 < EXSKY.length && EXSKY[i + 1][0] <= t) i++;
  const a = EXSKY[i], b = EXSKY[i + 1], u = smooth(lin(t, a[0], b[0]));
  return { top: mix(a[1], b[1], u), low: mix(a[2], b[2], u), L: lerp(a[3], b[3], u) };
}
const EXG = 3500;                 // the ground line at the church's foot
const EXF = { x0: -520, x1: 4320, eave: -60, apex: -1780 }; // the west front and its gable
const EXT = { x0: -1640, x1: -520, top: -2300, spire: -3700 };  // the bell tower on the left
const EXD = { x0: 1580, x1: 2220, spring: 2700, top: 2380 };     // the door
// The dawn's light on the stone, ground and trees: their colours are tinted as they are drawn (no overlay boxes).
let EXL = [1, 1, 1];
const exLit = (c) => c.map((v, i) => v * EXL[i]);
const EXSTONE = [[132, 126, 120], [118, 112, 108], [146, 138, 128], [124, 120, 116], [138, 130, 118]];

function exStones(g, clip, x0, x1, y0, y1, seed, view) { // ashlar courses as leaded stone panes, in the view only
  const ch = 150, cw = 320;
  g.save(); g.clip(clip);
  const ya = Math.floor(Math.max(y0, view.y0 - ch) / ch) * ch, yb = Math.min(y1, view.y1 + ch);
  for (let y = ya; y < yb; y += ch) {
    const off = (Math.abs(Math.round(y / ch)) % 2) * cw / 2;
    for (let x = Math.floor((Math.max(x0, view.x0 - cw) - off) / cw) * cw + off; x < Math.min(x1, view.x1 + cw); x += cw) {
      const k = Math.abs(Math.round(x / cw) * 7 + Math.round(y / ch) * 3);
      pane(g, polyPath([[x, y], [x + cw, y], [x + cw, y + ch], [x, y + ch]]), exLit(EXSTONE[k % EXSTONE.length]), seed + k, { ew: 18, shade: .3, lw: 7 });
    }
  }
  g.restore();
}
function exPointedArch(x0, x1, spring, top, base) { // a pointed arch opening, as a path
  const p = new Path2D(), m = (x0 + x1) / 2;
  p.moveTo(x0, base); p.lineTo(x0, spring); p.quadraticCurveTo(x0, top + (spring - top) * .25, m, top);
  p.quadraticCurveTo(x1, top + (spring - top) * .25, x1, spring); p.lineTo(x1, base); p.closePath(); return p;
}
function exSkyPanes(g, t, view, sky) { // the sky as wavy bands of leaded glass, stars until the light comes
  const y0 = view.y0 - 400, y1 = EXG + 200, n = 9, X0 = view.x0 - 600, X1 = view.x1 + 600;
  for (let k = 0; k < n; k++) {
    const a = lerp(y0, y1, k / n), b = lerp(y0, y1, (k + 1) / n), u = (k + .5) / n, pts = [];
    for (let q = 0; q <= 10; q++) { const x = lerp(X0, X1, q / 10); pts.push([x, a + 60 * Math.sin(x / 900 + k)]); }
    for (let q = 10; q >= 0; q--) { const x = lerp(X0, X1, q / 10); pts.push([x, b + 60 * Math.sin(x / 900 + k + 1)]); }
    pane(g, polyPath(pts), mix(sky.top, sky.low, Math.pow(u, 1.4)), 8800 + k, { ew: 60, shade: .25, lw: 9 });
  }
  const st = 1 - ease(t, 4, 11); // stars
  if (st > 0) for (let k = 0; k < 60; k++) {
    const x = lerp(-7000, 10800, rnd(k, 801)), y = lerp(-5200, 1400, rnd(k, 802)), r = 30 + 34 * rnd(k, 803);
    const tw = .6 + .4 * Math.sin(t * 1.7 + k * 2.1);
    g.strokeStyle = `rgba(250,236,190,${st * tw})`; g.lineWidth = 10; g.lineCap = 'round'; g.beginPath();
    for (let q = 0; q < 4; q++) { const a = q * Math.PI / 4, rr = q % 2 ? r * .5 : r; g.moveTo(x - Math.cos(a) * rr, y - Math.sin(a) * rr); g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
    g.stroke();
  }
}
function exSun(g, t) { // rising over the far hills on the right
  const sy = lerp(EXG + 300, EXG - 1300, ease(t, 1.5, 18)), sx = 7600, r = 520;
  pane(g, circPath(sx, sy, r), [252, 196, 96], 8850, { ew: 40, lw: 10, amt: .4 });
  for (let k = 0; k < 12; k++) { const a = k * TAU / 12; lead(g, polyPath([[sx, sy], [sx + Math.cos(a) * r, sy + Math.sin(a) * r]], false), 8); }
}
function exHills(g, view) {
  const pts = [[view.x0 - 400, EXG + 40]];
  for (let x = view.x0 - 400; x <= view.x1 + 400; x += 400) pts.push([x, EXG - 260 - 220 * (.5 + .5 * Math.sin(x / 2300 + 1.3)) - 120 * Math.sin(x / 830)]);
  pts.push([view.x1 + 400, EXG + 40]);
  pane(g, polyPath(pts), exLit([54, 78, 92]), 8860, { ew: 50, shade: .3, lw: 9 });
}
function exGround(g, t, view) {
  pane(g, polyPath([[view.x0 - 400, EXG], [view.x1 + 400, EXG], [view.x1 + 400, view.y1 + 400], [view.x0 - 400, view.y1 + 400]]), exLit([56, 112, 52]), 8870, { ew: 60, shade: .32, lw: 9 });
  for (let k = 0; k < 7; k++) { // grass bands
    const y = EXG + 260 + k * 420; if (y > view.y1 + 400) break;
    lead(g, polyPath([[view.x0 - 400, y + 40 * Math.sin(k)], [view.x1 + 400, y - 40 * Math.sin(k * 1.7)]], false), 7);
  }
  // the path up to the door, widening toward us
  pane(g, polyPath([[EXD.x0 + 20, EXG], [EXD.x1 - 20, EXG], [EXD.x1 + 1500, EXG + 6000], [EXD.x0 - 1500, EXG + 6000]]), exLit([196, 176, 140]), 8880, { ew: 40, shade: .3, lw: 8 });
  for (let k = 1; k < 9; k++) { const y = EXG + k * k * 80, w = lerp(330, 2100, k * k * 80 / 6000); lead(g, polyPath([[1900 - w, y], [1900 + w, y]], false), 6); }
  // gravestones either side of the path, and two yews
  const GS = [[-1900, 3980, 260], [-900, 4500, 300], [-2800, 4700, 340], [4700, 3960, 260], [5600, 4400, 320], [6600, 4900, 360], [3900, 5200, 380], [-200, 5600, 420]];
  GS.forEach(([x, y, w], k) => {
    const p = new Path2D(); p.moveTo(x - w / 2, y); p.lineTo(x - w / 2, y - w * 1.1); p.arc(x, y - w * 1.1, w / 2, Math.PI, 0); p.lineTo(x + w / 2, y); p.closePath();
    pane(g, p, exLit([150, 150, 146]), 8890 + k, { ew: 20, shade: .34, lw: 7 });
    paint(g, 8, .45); g.beginPath(); g.moveTo(x - w * .2, y - w * 1.15); g.lineTo(x + w * .2, y - w * 1.15); g.moveTo(x, y - w * 1.35); g.lineTo(x, y - w * .8); g.stroke();
  });
  for (const [x, h, sd] of [[-3700, 2300, 8901], [7400, 2600, 8902]]) {
    const sw = 40 * Math.sin(t * .9 + sd);
    pane(g, polyPath([[x - 90, EXG + 200], [x + 90, EXG + 200], [x + 70, EXG - 300], [x - 70, EXG - 300]]), exLit([90, 60, 36]), sd, { ew: 10, lw: 7 });
    pane(g, smoothPath([[x, EXG - h - 100], [x + 520 + sw, EXG - h * .45], [x + 640 + sw, EXG - 360], [x, EXG - 200], [x - 640 + sw, EXG - 360], [x - 520 + sw, EXG - h * .45]]), exLit([28, 74, 46]), sd + 5, { ew: 40, shade: .35, lw: 9 });
  }
}
function exChurch(g, t, view) {
  // the bell tower, its louvred opening, and the spire with a gold cross
  const T = EXT, tw = new Path2D(); tw.rect(T.x0, T.top, T.x1 - T.x0, EXG - T.top);
  exStones(g, tw, T.x0, T.x1, T.top, EXG, 8300, view); lead(g, tw, 10);
  const lv = exPointedArch(T.x0 + 330, T.x1 - 330, T.top + 520, T.top + 260, T.top + 980);
  pane(g, lv, exLit([26, 24, 30]), 8310, { ew: 10, lw: 8 });
  for (let k = 1; k < 5; k++) lead(g, polyPath([[T.x0 + 330, T.top + 520 + k * 90], [T.x1 - 330, T.top + 520 + k * 90]], false), 9);
  pane(g, polyPath([[T.x0 - 60, T.top], [(T.x0 + T.x1) / 2, T.spire], [T.x1 + 60, T.top]]), exLit([76, 82, 96]), 8320, { ew: 30, shade: .35, lw: 9 });
  const cx = (T.x0 + T.x1) / 2, cy = T.spire - 260;
  pane(g, polyPath([[cx - 30, T.spire + 10], [cx + 30, T.spire + 10], [cx + 30, cy - 120], [cx - 30, cy - 120]]), C.gold, 8330, { ew: 6, lw: 6 });
  pane(g, polyPath([[cx - 120, cy - 30], [cx + 120, cy - 30], [cx + 120, cy + 30], [cx - 120, cy + 30]]), C.gold, 8331, { ew: 6, lw: 6 });
  // the west front: walls and gable, with the window openings and the door cut out
  const F = EXF, front = new Path2D();
  front.moveTo(F.x0, EXG); front.lineTo(F.x0, F.eave); front.lineTo(1900, F.apex); front.lineTo(F.x1, F.eave); front.lineTo(F.x1, EXG); front.closePath();
  const door = exPointedArch(EXD.x0, EXD.x1, EXD.spring, EXD.top, EXG);
  const holes = new Path2D(); holes.addPath(front); for (let i = 0; i < NL; i++) holes.addPath(GEO[i].open); holes.addPath(door);
  g.save(); g.clip(holes, 'evenodd'); exStones(g, front, F.x0, F.x1, F.apex, EXG, 8400, view); g.restore();
  lead(g, front, 12);
  // buttresses at the corners, the coping along the gable, a small round window high in the gable
  for (const x of [F.x0 - 60, F.x1 - 180]) pane(g, polyPath([[x, EXG], [x, 600], [x + 120, 420], [x + 240, 600], [x + 240, EXG]]), exLit([112, 106, 102]), 8450 + Math.abs(x), { ew: 20, shade: .35, lw: 8 });
  g.lineWidth = 70; g.strokeStyle = rgb(exLit([164, 156, 146])); g.lineJoin = 'round'; g.beginPath(); g.moveTo(F.x0 - 40, F.eave + 20); g.lineTo(1900, F.apex - 40); g.lineTo(F.x1 + 40, F.eave + 20); g.stroke();
  lead(g, polyPath([[F.x0 - 40, F.eave + 20], [1900, F.apex - 40], [F.x1 + 40, F.eave + 20]], false), 12);
  // the big hood moulding over all four lancets, the gable's round window, the sill
  const hood = new Path2D(); hood.moveTo(lx(0) - 120, YB + 60); hood.lineTo(lx(0) - 120, 760); hood.quadraticCurveTo(lx(0) - 120, -320, 1900, -620); hood.quadraticCurveTo(lx(3) + LW + 120, -320, lx(3) + LW + 120, 760); hood.lineTo(lx(3) + LW + 120, YB + 60);
  g.lineWidth = 80; g.strokeStyle = rgb(exLit([168, 160, 150])); g.stroke(hood); lead(g, hood, 12);
  pane(g, circPath(1900, -980, 230), [176, 60, 70], 8460, { ew: 30, lw: 9 });
  for (let k = 0; k < 6; k++) { const a = k * TAU / 6; lead(g, polyPath([[1900, -980], [1900 + Math.cos(a) * 230, -980 + Math.sin(a) * 230]], false), 8); }
  pane(g, polyPath([[lx(0) - 140, YB + 20], [lx(3) + LW + 140, YB + 20], [lx(3) + LW + 140, YB + 110], [lx(0) - 140, YB + 110]]), exLit([176, 168, 154]), 8470, { ew: 20, lw: 8 });
  // the door: oak planks, iron hinges, a ring
  g.save(); g.clip(door);
  for (let k = 0; k < 6; k++) { const x = lerp(EXD.x0, EXD.x1, k / 6), w = (EXD.x1 - EXD.x0) / 6; pane(g, polyPath([[x, EXD.top - 50], [x + w, EXD.top - 50], [x + w, EXG], [x, EXG]]), exLit([112, 62, 30]), 8480 + k, { ew: 12, shade: .3, lw: 6 }); }
  g.restore(); lead(g, door, 12);
  g.lineWidth = 22; g.strokeStyle = LEAD; g.lineCap = 'round';
  for (const y of [2860, 3260]) { g.beginPath(); g.moveTo(EXD.x0 + 20, y); g.lineTo(EXD.x0 + 330, y); g.moveTo(EXD.x1 - 20, y); g.lineTo(EXD.x1 - 330, y); g.stroke(); }
  g.lineWidth = 14; g.beginPath(); g.arc(1980, 3080, 50, 0, TAU); g.stroke();
}
function exWindow(g, t, view) { // the four lancets from outside: their pictures, lit from within by candles
  // the pictures as they stand when we come in (lancet 1 at its first line), so the dissolve at 18 changes nothing in them
  for (let i = 0; i < NL; i++) v1DrawLancet(g, i, 18.0, view);
  v1Borders(g, 18.0, view);
  g.save(); g.clip(GEO[3].field); v1Spell3Figure(g, 18.0); g.restore(); // lancet 4's figure is drawn on its own (as v1GlassWorld)
  const all = new Path2D(); for (let i = 0; i < NL; i++) all.addPath(GEO[i].open);
  g.save(); g.clip(all);
  g.globalCompositeOperation = 'overlay'; g.globalAlpha = .6; g.fillStyle = texPattern(g); g.fillRect(view.x0, view.y0, view.x1 - view.x0, view.y1 - view.y0);
  // candlelight behind the glass: warm and flickering at first; by the time we reach it, the daylight inside
  g.globalAlpha = 1; g.globalCompositeOperation = 'multiply';
  const day = ease(t, 6, 18), fl = .94 + .06 * Math.sin(t * 7.3) * Math.sin(t * 3.1 + 1);
  g.fillStyle = rgb(mix([214, 140, 76], v1Tod(18).col, day).map((v) => v * lerp(.66, v1Tod(18).I, day) * fl)); g.fill(all);
  g.globalCompositeOperation = 'screen';
  for (let i = 0; i < NL; i++) {
    const rg = g.createRadialGradient(lcx(i), 1700, 0, lcx(i), 1700, 900); rg.addColorStop(0, `rgba(255,190,110,${.28 * fl * (1 - day)})`); rg.addColorStop(1, 'rgba(255,190,110,0)');
    g.fillStyle = rg; g.fillRect(lcx(i) - 900, 800, 1800, 1800);
  }
  g.restore();
}
// The outside world under the camera: sky, sun, hills, churchyard, church; the dawn's light on the stone; the window.
function drawExterior(g, t, cam) {
  const s = cam.s, sky = exSky(t), M = [s, 0, 0, s, W / 2 - cam.x * s, H / 2 - cam.y * s];
  EXL = mix([120, 128, 196], [255, 238, 216], sky.L).map((v) => v * lerp(.5, 1, sky.L) / 255);
  g.setTransform(...M); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.filter = 'none';
  const view = { x0: cam.x - W / 2 / s, x1: cam.x + W / 2 / s, y0: cam.y - H / 2 / s, y1: cam.y + H / 2 / s };
  exSkyPanes(g, t, view, sky);
  exSun(g, t);
  exHills(g, view);
  exGround(g, t, view);
  exChurch(g, t, view);
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = 'overlay'; g.globalAlpha = .45; g.fillStyle = texPattern(g); g.fillRect(0, 0, W, H);
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  g.setTransform(...M);
  exWindow(g, t, view);
  g.setTransform(1, 0, 0, 1, 0, 0);
}
