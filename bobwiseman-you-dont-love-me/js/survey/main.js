// SURVEY MAP look, verse 1 (22.0-71.7; rendered 20.0-72.5). One place, the survey sheet on a desk; the camera
// moves over it like a rostrum camera. Pure function of song time t.
const out = document.getElementById('c'); out.width = W; out.height = H;
const g = out.getContext('2d');
const T0 = 20.0, T1 = 72.5;

// Camera moves: [t0, t1, from [x, y, zoom, rot], to [...]]. A move whose `from` differs from where the last one
// ended is a cut. Zoom is interpolated in log space.
const W1 = [1330, 1338], STATION = [1352, 1192], SCOPE = [1384, 1192], EDGE = [2968, 1276];
const CAM = [
  [20.0, 22.0, [2000, 1300, .44, 0], [2010, 1285, .5, 0]],             // the whole sheet on the desk
  [22.0, 23.7, [1338, 1296, 2.75, 0], [1350, 1285, 2.5, 0]],          // l1: her, arm going up at the range
  [23.7, 26.3, [1350, 1285, 2.5, 0], [1525, 985, 1.05, 0]],           // up her arm to the three summits
  [26.3, 27.7, [1525, 985, 1.05, 0], [1530, 975, 1.13, 0]],           // "confess": heights pop
  [27.7, 29.4, [1530, 975, 1.13, 0], [2290, 1495, 2.15, .04]],        // backing: glide to the pressed daisy
  [29.4, 33.34, [2290, 1495, 2.15, .04], [2300, 1500, 2.5, .14]],
  [33.34, 34.25, [1385, 1150, 2.6, 0], [1390, 1142, 2.5, 0]],         // l2: the theodolite
  [34.25, 35.9, [1390, 1142, 2.5, 0], [1505, 820, 1.4, 0]],           // up the sight line to the summit
  [35.9, 38.71, [1505, 820, 1.4, 0], [1510, 880, 1.12, 0]],           // "which dress"
  [38.71, 40.35, [1510, 880, 1.12, 0], [2295, 1500, 1.95, -.08]],     // backing: to the daisy
  [40.35, 41.3, [2295, 1500, 1.95, -.08], [2298, 1500, 2.05, -.1]],
  [41.3, 44.48, [2298, 1500, 2.05, -.1], [1890, 1160, .78, 0]],       // out: dressed mountain and daisy together
  [44.48, 46.75, [3040, 1610, 2.6, 0], [2990, 1238, 2.65, 0]],        // l3: up the cliff face to her
  [46.75, 49.68, [2990, 1238, 2.65, 0], [2986, 1222, 3.3, 0]],        // waiting to be kissed
  [49.68, 53.0, [2986, 1222, 3.3, 0], [2600, 1380, .95, 0]],          // backing: pull out to her, cliff, daisy
  [53.0, 55.2, [2600, 1380, .95, 0], [2560, 1400, .86, 0]],
  [55.2, 60.69, [2560, 1400, .86, 0], [2420, 1360, .5, -.55]],        // l4: the evil spell, the sheet turns
  [60.69, 63.1, [2420, 1360, .5, -.55], [2300, 1500, 1.9, -.76]],     // lead "you don't love me": into the daisy
  [63.1, 66.2, [2300, 1500, 1.9, -.76], [2300, 1500, 2.15, -.86]],
  [66.2, 71.2, [2300, 1500, 2.15, -.86], [2300, 1500, 2.55, -.97]],   // last backing: the last petals
  [71.2, 72.6, [2300, 1500, 2.55, -.97], [2240, 1420, 1.0, -1.02]],   // out after the last "not"
];
function camAt(t) {
  let s = CAM[0]; for (const c of CAM) if (c[0] <= t) s = c;
  const u = ease(t, s[0], s[1]), [a, b] = [s[2], s[3]];
  return { x: lerp(a[0], b[0], u), y: lerp(a[1], b[1], u), z: Math.exp(lerp(Math.log(a[2]), Math.log(b[2]), u)), r: lerp(a[3], b[3], u) };
}

function spellAmt(t) { return 5.2 * ease(t, B.l4 + .3, B.life + .5) + .5 * ease(t, B.lead, T1); }
function compassAngle(t) {
  // still, then wound up by the spell: about seven turns, settling to point at the daisy
  const toDaisy = Math.atan2(DAISY[1] - COMPASS[1], DAISY[0] - COMPASS[0]) + Math.PI / 2;
  const u = ease(t, B.evil - .3, B.lead + .9);
  return u * (7 * TAU + toDaisy) + Math.sin(t * 1.3) * .015 * (1 - u);
}

// Where she is and how she stands.
function surveyor(t) {
  if (t < B.l2) {
    const up = ease(t, B.point, B.point + .7), interrog = t > B.mountains - .2 && t < B.confess + .5 ? Math.sin((t - B.mountains) * 14) * .09 : 0;
    return { at: W1, P: up > .02 ? { arm: 'point', armA: lerp(1.35, -.72, up) + interrog, lean: -.04 * up } : { arm: 'down', lean: 0 } };
  }
  if (t < B.l3) return { at: STATION, P: { arm: 'scope', lean: .2, eyes: 0 } };
  const lean = .16 * ease(t, B.kissed - .7, B.kissed), pk = ease(t, B.kissed - .4, B.kissed + .1), dr = ease(t, B.droop, B.droop + .8);
  return { at: EDGE, P: { arm: 'behind', lean: lean * (1 - dr), eyes: t > B.kissed - .5 ? 1 : 0, pucker: pk * (1 - dr), bow: dr } };
}

function drawSight(g, t) { // l2: the sight line from the telescope to the summit and the reading tag
  if (t < B.l2 || t > B.l3) return;
  const p = T.peaks[1], [ex, ey] = [SCOPE[0] + 10, SCOPE[1] - 80];
  const u = ease(t, B.high - .05, B.high + 1.1);
  if (u > 0) {
    g.setLineDash([10, 7]); g.strokeStyle = 'rgba(42,33,26,.9)'; g.lineWidth = 2 * PXW + .5;
    g.beginPath(); g.moveTo(ex, ey); g.lineTo(lerp(ex, p.x, u), lerp(ey, p.y, u)); g.stroke(); g.setLineDash([]);
    // angle arc at the instrument
    const a1 = Math.atan2(p.y - ey, p.x - ex); g.beginPath(); g.arc(ex, ey, 34, 0, a1, true); g.lineWidth = 1.3 * PXW + .3; g.stroke();
  }
  // the reading rolls up to the exact height, in a surveyor's tag next to the summit
  const v = ease(t, B.high + .2, B.high + 1.9), val = p.h * v;
  if (v > 0) {
    const txt = val.toFixed(2), bx = p.x + 58, by = p.y - 132, bw = 178, bh = 50;
    g.save(); g.globalAlpha = clamp((t - B.high - .2) / .2);
    g.beginPath(); g.moveTo(p.x + 10, p.y - 12); g.lineTo(bx, by + bh); g.strokeStyle = INK; g.lineWidth = 1.4; g.stroke();
    g.fillStyle = PAPERC; g.fillRect(bx, by, bw, bh); g.lineWidth = 2.2; g.strokeRect(bx, by, bw, bh); g.lineWidth = .9; g.strokeRect(bx + 5, by + 5, bw - 10, bh - 10);
    const s = fitText(g, txt, bw - 30, 34, NUMFONT); g.fillStyle = INK; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, bx + bw / 2, by + bh / 2 + 1);
    g.restore();
  }
}
function drawGulls(g, t) { // two gulls cross the sea past her while she waits
  if (t < B.cliffs || t > B.droop + 1) return;
  for (let k = 0; k < 2; k++) {
    const u = (t - B.cliffs - k * .9) / 4.2; if (u < 0 || u > 1) continue;
    const x = lerp(3210, 2990, u) + k * 40, y = lerp(1330, 1150, u) - k * 30, f = Math.sin(t * 9 + k * 2) * 4;
    g.beginPath(); g.moveTo(x - 9, y - 2 + f); g.quadraticCurveTo(x - 4, y - 6 + f * .5, x, y); g.quadraticCurveTo(x + 4, y - 6 + f * .5, x + 9, y - 2 + f);
    g.strokeStyle = INK; g.lineWidth = 1.5; g.stroke();
  }
}

function drawDesk(g) {
  const lg = g.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, 1300); lg.addColorStop(0, '#4a3322'); lg.addColorStop(1, '#1d130c');
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
}

function renderFrame(t) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none'; g.setLineDash([]);
  drawDesk(g);
  const cam = camAt(t), z = cam.z, c = Math.cos(cam.r), s = Math.sin(cam.r);
  PXW = 1 / z;
  // desk grain under the sheet, in world space so it moves with the camera
  g.setTransform(z * c, z * s, -z * s, z * c, W / 2 - z * (c * cam.x - s * cam.y), H / 2 - z * (s * cam.x + c * cam.y));
  g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 3; g.beginPath();
  for (let y = -2400; y < SH + 2400; y += 46) { g.moveTo(-3000, y); for (let x = -3000; x <= SW + 3000; x += 300) g.lineTo(x, y + 9 * Math.sin(x * .004 + y * .03) + 5 * Math.sin(x * .013 + y)); }
  g.stroke();
  const rad = Math.hypot(W / 2, H / 2) / z, V = [cam.x - rad, cam.y - rad, cam.x + rad, cam.y + rad];
  WARP.amt = spellAmt(t);
  drawSheet(g, t, V, z, clamp(WARP.amt / 1.2));
  // things on the map face
  g.save(); g.beginPath(); g.rect(MX0, MY0, MX1 - MX0, MY1 - MY0); g.clip();
  drawDress(g, t);
  drawConfessions(g, t);
  // she stands on the map; the spell carries her round with the ground
  const sv = surveyor(t), [fx, fy] = wp(sv.at[0], sv.at[1]);
  if (t >= B.l2 && t < B.l3) { const p = T.peaks[1]; drawTheodolite(g, ...wp(SCOPE[0], SCOPE[1]), 1, Math.atan2(p.y - SCOPE[1], p.x - SCOPE[0]) * .35); }
  drawSight(g, t);
  drawSurveyor(g, fx, fy, .95, sv.P);
  drawGulls(g, t);
  g.restore();
  drawCompass(g, t, compassAngle(t));
  WARP.amt = 0;
  // the pressed daisy lies on the paper, untouched by the spell
  drawDaisy(g, t);
  // screen: vignette + grain
  g.setTransform(1, 0, 0, 1, 0, 0);
  const vg = g.createRadialGradient(W / 2, H / 2, H * .45, W / 2, H / 2, W * .62); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(20,10,0,.38)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  drawGrain(g, t, .13);
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
}

const ready = (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { buildTerrain(); bakePaper(); return true; });
startPage(out, renderFrame, T0, T1, ready);
