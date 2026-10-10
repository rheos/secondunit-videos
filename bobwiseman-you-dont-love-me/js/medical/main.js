// Medical chart look, verse 2 (song 71.7-118.3, rendered 70.5-119.5). Pure function of song time t.
// One place: the doctor's folio open on a green baize desk, a daisy specimen card beside it, a stethoscope.
const out = document.getElementById('c'); out.width = W; out.height = H;
const g = out.getContext('2d');
buildTextures();

// world: spine of the folio at x=0; left page x -PW..0, right page 0..PW, y -PH/2..PH/2
const CARD = { x: 1290, y: -40, rot: .035 };
const FLIP_D = .62;
const FLIPS = [B.flip1, B.flip2, B.flip3];

// camera keys [t, x, y, scale]; eased between consecutive keys (equal keys = hold)
const LP = -PW / 2, RP = PW / 2;
const CAM = [
  [70.5, -40, 30, .72], [71.7, -150, 10, .8],
  [72.25, LP + 40, -40, 1.12], [74.35, LP + 40, -110, 1.38],                 // the examination
  [74.85, RP, -40, 1.08], [76.75, RP, -20, 1.18],                       // "what's got you idling": the engine heart
  [77.1, CARD.x, CARD.y, 1.12], [81.85, CARD.x, CARD.y - 40, 1.28],    // backing x2: petals 1, 2
  [82.3, 0, 0, .8], [82.95, 0, 0, .8],                                // back to the folio, page turns
  [83.35, LP, -60, 1.1], [85.0, LP - 10, -90, 1.2],                  // laughing at winter
  [85.55, RP, 20, 1.12], [87.95, RP + 20, 60, 1.25],                  // the bee
  [88.25, CARD.x, CARD.y, 1.12], [92.55, CARD.x, CARD.y - 40, 1.28],   // petals 3, 4
  [92.95, 0, 0, .8], [93.6, 0, 0, .8],
  [93.95, LP, 0, 1.0], [95.75, LP, 30, 1.12],                         // the eye chart
  [96.05, RP + 40, 60, 1.12], [98.75, RP + 60, 110, 1.24],                         // the free bottle
  [99.05, CARD.x, CARD.y, 1.12], [103.85, CARD.x, CARD.y - 40, 1.28],  // petals 5, 6
  [104.25, 0, 0, .8], [104.9, 0, 0, .8],
  [105.25, LP + 20, -20, 1.08], [108.05, LP + 20, -70, 1.2],                    // phrenology head
  [108.45, RP, 0, .92], [109.6, RP, 0, .95],                          // the company
  [109.95, CARD.x, CARD.y, 1.12], [116.9, CARD.x, CARD.y - 40, 1.32], // petals 7, 8, 9 (the last)
  [119.0, 330, 20, .6], [119.5, 340, 20, .6],                         // pull back: the whole desk
];
function camAt(t) {
  let i = 0; while (i + 1 < CAM.length && CAM[i + 1][0] <= t) i++;
  const a = CAM[i], b = CAM[Math.min(i + 1, CAM.length - 1)];
  if (a === b || t <= a[0]) return { x: a[1], y: a[2], s: a[3] };
  const u = smooth((t - a[0]) / (b[0] - a[0]));
  // zoom in log space so whips feel even
  return { x: lerp(a[1], b[1], u), y: lerp(a[2], b[2], u), s: Math.exp(lerp(Math.log(a[3]), Math.log(b[3]), u)) };
}

function drawPage(page, ox, oy, t, side, cam) {
  g.save(); g.translate(ox, oy);
  g.beginPath(); g.rect(0, 0, PW, PH); g.clip();
  paper(g);
  page(g, t);
  // gutter shadow at the spine
  const gx = side < 0 ? PW : 0, gr = g.createLinearGradient(gx, 0, side < 0 ? PW - 140 : 140, 0);
  gr.addColorStop(0, 'rgba(60,40,20,.38)'); gr.addColorStop(1, 'rgba(60,40,20,0)'); g.fillStyle = gr; g.fillRect(0, 0, PW, PH);
  g.restore();
}
// a turning page: front = old right page, back = new left page; th 0..PI around the spine
function drawTurning(frontFn, backFn, t, th) {
  const c = Math.cos(th);
  if (Math.abs(c) < .02) return;
  g.save();
  if (c > 0) g.transform(c, 0, 0, 1, 0, -PH / 2);
  else g.transform(-c, 0, 0, 1, PW * c, -PH / 2);
  g.beginPath(); g.rect(0, 0, PW, PH); g.clip();
  paper(g); (c > 0 ? frontFn : backFn)(g, t);
  // shading: darker as it stands up
  g.fillStyle = `rgba(40,28,16,${.45 * (1 - Math.abs(c))})`; g.fillRect(0, 0, PW, PH);
  const gr = g.createLinearGradient(c > 0 ? 0 : PW, 0, c > 0 ? PW : 0, 0); gr.addColorStop(0, 'rgba(0,0,0,.25)'); gr.addColorStop(.3, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(255,250,235,.15)');
  g.fillStyle = gr; g.fillRect(0, 0, PW, PH);
  g.restore();
  g.save(); g.strokeStyle = rgb(C.ink, .5); g.lineWidth = 2; g.beginPath(); g.moveTo(PW * c, -PH / 2); g.lineTo(PW * c, PH / 2); g.stroke(); g.restore();
}

function drawStethoscope() {
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  const tube = (lw, col) => { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); g.moveTo(-560, 760); g.bezierCurveTo(-420, 900, -100, 700, 60, 820); g.bezierCurveTo(200, 930, 420, 820, 560, 760); g.stroke(); };
  g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 18; g.shadowOffsetY = 10; tube(24, '#141210'); g.shadowColor = 'transparent';
  tube(16, '#2a2622'); tube(4, 'rgba(255,255,255,.12)');
  // binaurals (Y) on the left
  g.strokeStyle = '#b8bcc0'; g.lineWidth = 9; g.beginPath(); g.moveTo(-560, 760); g.lineTo(-720, 640); g.moveTo(-560, 760); g.lineTo(-760, 760); g.stroke();
  g.strokeStyle = rgb(C.ink); g.lineWidth = 1.5; g.stroke();
  g.fillStyle = '#1c1a18'; for (const [x, y] of [[-720, 640], [-760, 760]]) { g.beginPath(); g.arc(x, y, 12, 0, TAU); g.fill(); }
  // chestpiece on the right
  const cg = g.createRadialGradient(570, 750, 6, 580, 760, 56); cg.addColorStop(0, '#f2f2ee'); cg.addColorStop(.6, '#a4a8ac'); cg.addColorStop(1, '#5a5e62');
  g.fillStyle = cg; g.beginPath(); g.arc(590, 760, 54, 0, TAU); g.fill(); g.strokeStyle = rgb(C.ink); g.lineWidth = 3; g.stroke();
  g.beginPath(); g.arc(590, 760, 40, 0, TAU); g.lineWidth = 1.5; g.stroke();
  g.restore();
}

function renderFrame(t) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none'; g.setLineDash([]);
  const cam = camAt(t);
  // a slow breathing drift so held framings never sit dead still
  const dx = n1(71, t * .25) * 8, dy = n1(72, t * .22) * 6;
  const s = cam.s, ox = W / 2 - (cam.x + dx) * s, oy = H / 2 - (cam.y + dy) * s;
  const vx0 = -ox / s, vx1 = (W - ox) / s;
  g.setTransform(s, 0, 0, s, ox, oy);
  // desk
  g.fillStyle = g.createPattern(DESK_TEX, 'repeat'); g.fillRect(vx0 - 10, (-oy) / s - 10, (W / s) + 20, (H / s) + 20);
  drawStethoscope();
  // folio boards + page block edges
  if (vx0 < PW + 60 && vx1 > -PW - 60) {
    g.save(); g.shadowColor = 'rgba(0,0,0,.55)'; g.shadowBlur = 40; g.shadowOffsetY = 18;
    g.fillStyle = '#3d2418'; g.beginPath(); g.roundRect(-PW - 44, -PH / 2 - 34, PW * 2 + 88, PH + 68, 12); g.fill(); g.restore();
    g.fillStyle = '#d9cdb1'; g.fillRect(-PW - 12, -PH / 2 - 6, PW * 2 + 24, PH + 14);
    g.strokeStyle = 'rgba(90,70,40,.5)'; g.lineWidth = 1; for (let k = 1; k < 5; k++) { g.strokeRect(-PW - 12 + k * 2.4, -PH / 2 - 6 + k * 2, PW * 2 + 24 - k * 4.8, PH + 14 - k * 2); }
    // which spread, and any page turning now
    let si = 0; for (const f of FLIPS) if (t >= f + FLIP_D) si++;
    const fi = FLIPS.findIndex((f) => t >= f && t < f + FLIP_D);
    if (fi < 0) {
      if (vx0 < 0) drawPage(SPREADS[si][0], -PW, -PH / 2, t, -1);
      if (vx1 > 0) drawPage(SPREADS[si][1], 0, -PH / 2, t, 1);
    } else {
      drawPage(SPREADS[fi][0], -PW, -PH / 2, t, -1);
      drawPage(SPREADS[fi + 1][1], 0, -PH / 2, t, 1);
      const u = (t - FLIPS[fi]) / FLIP_D, th = Math.PI * (u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2);
      drawTurning(SPREADS[fi][1], SPREADS[fi + 1][0], t, th);
    }
    // spine
    const sg = g.createLinearGradient(-30, 0, 30, 0); sg.addColorStop(0, 'rgba(40,24,10,0)'); sg.addColorStop(.5, 'rgba(40,24,10,.45)'); sg.addColorStop(1, 'rgba(40,24,10,0)');
    g.fillStyle = sg; g.fillRect(-30, -PH / 2, 60, PH);
  }
  // the specimen card
  if (vx1 > CARD.x - 420) {
    g.save(); g.translate(CARD.x, CARD.y); g.rotate(CARD.rot); g.translate(-CARD_W / 2, -CARD_H / 2);
    g.save(); g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 30; g.shadowOffsetY = 14; g.fillStyle = PAPER; g.fillRect(0, 0, CARD_W, CARD_H); g.restore();
    g.beginPath(); g.rect(0, 0, CARD_W, CARD_H); g.clip();
    drawCard(g, t);
    g.restore();
  }
  // screen-space finish: lamp pool vignette + grain
  g.setTransform(1, 0, 0, 1, 0, 0);
  const vg = g.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, W * .72); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(10,6,2,.5)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(255,214,150,.04)'; g.fillRect(0, 0, W, H);
  drawGrain(g, t, .12);
}

startPage(out, renderFrame, B.t0, B.t1, document.fonts ? document.fonts.ready : Promise.resolve(true));
