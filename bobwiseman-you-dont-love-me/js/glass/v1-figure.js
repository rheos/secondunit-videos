// The singer for verse 1: a copy of drawWoman (figure.js) with a few extra face and pose controls.
// Same design: hair, mantle, dress, belt, collar, grisaille deadpan face, gold cuffs.
// Extra o fields: shut 0..1 (eyes closed), pucker 0..1 (lips pushed out for a kiss), look -1..1 (pupils left/right),
// head [dx, dy, rot] (head and neck lean, for the kiss), armsOver(g) drawn after everything (props over the hands).
function drawWomanV1(g, o) {
  const sd = o.seed || 0;
  const hairCol = mix(C.hair, [210, 210, 204], o.grey || 0);
  const hd = o.head || [0, 0, 0];
  // hair behind the head, falling to the shoulders
  g.save(); g.translate(hd[0], hd[1]); g.rotate(hd[2]);
  pane(g, smoothPath([[-70, -60], [-42, -100], [0, -110], [42, -100], [70, -60], [84, 10], [96, 90], [102, 150], [60, 162], [30, 122], [-30, 122], [-60, 162], [-102, 150], [-96, 90], [-84, 10]]), hairCol, sd + 1, { ew: 30, amt: .5 });
  g.restore();
  // mantle
  const mantle = smoothPath([[-40, 116], [-140, 170], [-188, 300], [-206, 700], [-232, 1100], [-252, 1330], [252, 1330], [232, 1100], [206, 700], [188, 300], [140, 170], [40, 116]]);
  pane(g, mantle, o.mantle, sd + 2, { ew: 50, shade: .4 });
  g.save(); g.clip(mantle);
  paint(g, 18, .18); for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * 170, 400); g.quadraticCurveTo(s * 200, 900, s * 215, 1330); g.stroke(); }
  g.restore();
  // dress
  const dress = polyPath([[-70, 126], [70, 126], [112, 400], [140, 800], [164, 1330], [-164, 1330], [-140, 800], [-112, 400]]);
  pane(g, dress, o.dress, sd + 3, { ew: 44, shade: .38 });
  g.save(); g.clip(dress);
  paint(g, 14, .2);
  for (const x of [-60, 0, 58]) { g.beginPath(); g.moveTo(x * .6, 560); g.quadraticCurveTo(x * 1.1 + 8, 900, x * 1.5, 1330); g.stroke(); }
  g.restore();
  for (const x of [-46, 40]) { const p = new Path2D(); p.moveTo(x * .7, 545); p.quadraticCurveTo(x * 1.2, 900, x * 1.7, 1330); lead(g, p, 8); }
  pane(g, polyPath([[-108, 505], [108, 505], [112, 540], [-112, 540]]), C.gold, sd + 4, { ew: 12 });
  // neck + collar (the neck follows the head lean)
  pane(g, polyPath([[-25 + hd[0] * .8, 56 + hd[1]], [25 + hd[0] * .8, 56 + hd[1]], [29, 136], [-29, 136]]), C.flesh, sd + 5, { ew: 16, shade: .25, amt: .4 });
  const col = new Path2D(); col.moveTo(-74, 124); col.quadraticCurveTo(0, 196, 74, 124); col.quadraticCurveTo(0, 158, -74, 124); col.closePath();
  pane(g, col, C.gold, sd + 6, { ew: 12 });
  // head
  g.save(); g.translate(hd[0], hd[1]); g.rotate(hd[2]);
  const face = ellPath(0, 0, 62, 80);
  pane(g, face, C.flesh, sd + 7, { ew: 20, shade: .22, amt: .35, lead: 0 });
  g.save(); g.clip(face);
  const rg = g.createRadialGradient(0, 8, 30, 0, 0, 90); rg.addColorStop(0, 'rgba(110,60,36,0)'); rg.addColorStop(1, 'rgba(110,60,36,.42)');
  g.fillStyle = rg; g.fillRect(-70, -90, 140, 180);
  g.restore();
  lead(g, face, 9);
  // features, deadpan: flat brows, heavy half-closed lids, long nose, level mouth
  const shut = clamp(o.shut || 0), look = (o.look || 0) * 6;
  paint(g, 4.5);
  for (const s of [-1, 1]) {
    g.beginPath(); g.moveTo(s * 12, -30 + shut * 2); g.quadraticCurveTo(s * 28, -36 + shut * 3, s * 46, -30 + shut * 2); g.stroke();
    if (shut < .5) {
      g.lineWidth = 5; g.beginPath(); g.moveTo(s * 12, -9); g.quadraticCurveTo(s * 27, -14, s * 43, -8); g.stroke();
      g.lineWidth = 2.5; g.beginPath(); g.moveTo(s * 15, -3); g.quadraticCurveTo(s * 27, 2, s * 40, -3); g.stroke();
      g.fillStyle = 'rgba(42,24,12,.9)'; g.beginPath(); g.arc(s * 27 + 1 + look, -6, 5, 0, Math.PI); g.fill();
    } else { // closed: one curved lid line with lashes
      g.lineWidth = 5; g.beginPath(); g.moveTo(s * 12, -5); g.quadraticCurveTo(s * 27, 2, s * 43, -5); g.stroke();
      g.lineWidth = 2.5; for (const u of [.3, .55, .8]) { const x = s * lerp(12, 43, u); g.beginPath(); g.moveTo(x, -1); g.lineTo(x + s * 3, 6); g.stroke(); }
    }
    g.lineWidth = 4.5;
  }
  g.beginPath(); g.moveTo(-3, -20); g.quadraticCurveTo(4, 10, 5, 26); g.quadraticCurveTo(0, 32, -8, 28); g.stroke();
  const m = clamp(o.mouth || 0), pk = clamp(o.pucker || 0);
  if (pk > .05) { // lips pushed out: a small round rosebud, ruby glass, leaded
    // smack 0..1: a kiss on the beat. Squeezed, the bud is narrower, taller and further out; released, it relaxes
    // wider with the lips parted a little.
    const sm = clamp(o.smack || 0), r = lerp(8, 14, pk), rx = r * lerp(1.3, .9, sm), ry = r * lerp(.85, 1.3, sm);
    pane(g, ellPath(0, 52 + 2 * sm, rx, ry), [196, 60, 70], sd + 9, { ew: 6, lw: 4, shade: .3, amt: .3 });
    if (sm < .5 && pk > .5) { g.fillStyle = 'rgba(60,20,16,.85)'; g.beginPath(); g.ellipse(0, 52, rx * .38, ry * .18 * (1 - sm * 2) + 1, 0, 0, TAU); g.fill(); }
    paint(g, 2.5, .9); g.beginPath(); g.ellipse(0, 52 + 2 * sm, rx * .4, ry * .3, 0, 0, TAU); g.stroke();
  } else if (m > .05) { g.fillStyle = 'rgba(60,20,16,.88)'; g.beginPath(); g.ellipse(0, 51 + m * 3, 11 - m * 2, 2 + m * 10, 0, 0, TAU); g.fill(); }
  else { g.beginPath(); g.moveTo(-17, 50); g.lineTo(17, 50); g.stroke(); g.lineWidth = 2.5; g.beginPath(); g.moveTo(-17, 50); g.lineTo(-20, 53); g.moveTo(17, 50); g.lineTo(20, 53); g.stroke(); }
  g.lineWidth = 2.5; g.beginPath(); g.moveTo(-10, 66); g.quadraticCurveTo(0, 70, 10, 66); g.stroke();
  pane(g, smoothPath([[-66, -18], [-62, -66], [-26, -104], [22, -104], [62, -66], [66, -18], [46, -46], [16, -40], [-18, -50], [-48, -38]]), hairCol, sd + 8, { ew: 20, amt: .5 });
  paint(g, 3, .5); for (const x of [-40, -10, 22, 46]) { g.beginPath(); g.moveTo(x * .5, -98); g.quadraticCurveTo(x, -80, x * 1.05, -52); g.stroke(); }
  g.restore();
  if (o.under) o.under(g);
  const H = o.hands, E = o.elbows || [[-196, 420], [196, 420]];
  const fdir = (k) => { const h = H[k]; return k ? [-Math.cos(h[2]), Math.sin(h[2])] : [Math.cos(h[2]), Math.sin(h[2])]; };
  for (let k = 0; k < 2; k++) {
    const s = k ? 1 : -1, h = H[k], d = fdir(k);
    const sl = smoothPath(limbPts([[s * 132, 180], E[k], [h[0] - d[0] * 34, h[1] - d[1] * 34 + 4]], [96, 86, 64]), true);
    pane(g, sl, mix(o.mantle, [0, 0, 0], .18), sd + 10 + k, { ew: 30, shade: .4 });
    pane(g, ellPath(h[0] - d[0] * 36, h[1] - d[1] * 36 + 2, 16, 32, Math.atan2(d[1], d[0])), C.gold, sd + 12 + k, { ew: 10 });
  }
  if (o.mid) o.mid(g);
  for (let k = 0; k < 2; k++) {
    const h = H[k];
    g.save(); g.translate(h[0], h[1]); if (k) g.scale(-1, 1); g.rotate(h[2]);
    pane(g, smoothPath([[-30, -16], [-6, -30], [26, -26], [42, -8], [40, 14], [16, 26], [-22, 24], [-34, 6]]), C.flesh, sd + 14 + k, { ew: 14, shade: .25, amt: .35 });
    paint(g, 3, .8);
    for (const y of [-12, 0, 12]) { g.beginPath(); g.moveTo(8, y); g.lineTo(36, y + 1); g.stroke(); }
    g.beginPath(); g.moveTo(-10, -20); g.quadraticCurveTo(8, -26, 18, -18); g.stroke();
    g.restore();
  }
  if (o.held) o.held(g);
}
