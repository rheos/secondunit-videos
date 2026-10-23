// The singer as a glass figure: a standing woman in a long dress and mantle, a secular "saint panel"
// stand-in (not Bob, not anyone real). Local coordinates: head centre at (0,0), scale 1 = head 160 tall.
// o: { dress, mantle, hands: [[x,y,rot],[x,y,rot]], elbows: [[x,y],[x,y]], mouth 0..1, grey 0..1, seed,
//      under(g) drawn after the body and before the arms (things she holds against her chest),
//      held(g) drawn after the hands (things in front of her fingers),
//      up 0..1 tips her face back to the sky, as a singer does reaching for a high note (default 0: unchanged),
//      turn -1..1 pivots her head toward her right (-) or left (+): the features slide across the face and narrow,
//      the face tilts a little the same way (default 0: unchanged) }
function drawWoman(g, o) {
  const sd = o.seed || 0;
  const hairCol = mix(C.hair, [210, 210, 204], o.grey || 0);
  // hair behind the head, falling to the shoulders
  pane(g, smoothPath([[-70, -60], [-42, -100], [0, -110], [42, -100], [70, -60], [84, 10], [96, 90], [102, 150], [60, 162], [30, 122], [-30, 122], [-60, 162], [-102, 150], [-96, 90], [-84, 10]]), hairCol, sd + 1, { ew: 30, amt: .5 });
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
  // belt
  pane(g, polyPath([[-108, 505], [108, 505], [112, 540], [-112, 540]]), C.gold, sd + 4, { ew: 12 });
  // neck + collar
  pane(g, polyPath([[-25, 56], [25, 56], [29, 136], [-29, 136]]), C.flesh, sd + 5, { ew: 16, shade: .25, amt: .4 });
  const col = new Path2D(); col.moveTo(-74, 124); col.quadraticCurveTo(0, 196, 74, 124); col.quadraticCurveTo(0, 158, -74, 124); col.closePath();
  pane(g, col, C.gold, sd + 6, { ew: 12 });
  // face (up > 0: the head tips back and a little to her right; the jaw's underside shows, the features ride up)
  const up = clamp(o.up || 0), tn = clamp(o.turn || 0, -1, 1);
  g.save(); g.translate(5 * tn, -16 * up); g.rotate(-.17 * up + .1 * tn);
  const face = ellPath(0, 0, 62, 80);
  pane(g, face, C.flesh, sd + 7, { ew: 20, shade: .22, amt: .35, lead: 0 });
  g.save(); g.clip(face);
  const rg = g.createRadialGradient(0, 8, 30, 0, 0, 90); rg.addColorStop(0, 'rgba(110,60,36,0)'); rg.addColorStop(1, 'rgba(110,60,36,.42)');
  g.fillStyle = rg; g.fillRect(-70, -90, 140, 180);
  g.restore();
  if (up > .02) { // underside of the jaw, lit from below
    const jaw = new Path2D(); jaw.ellipse(0, 50, 54, 34 * up, 0, 0, Math.PI); jaw.ellipse(0, 50, 54, 8 * up, 0, Math.PI, 0, true); jaw.closePath();
    g.save(); g.clip(face); pane(g, jaw, mix(C.flesh, [255, 240, 226], .35), sd + 9, { ew: 10, shade: .15, amt: .3, lead: 0 }); g.restore();
    paint(g, 3, .55 * up); g.beginPath(); g.ellipse(0, 50, 54, 8 * up, 0, 0, Math.PI); g.stroke();
  }
  lead(g, face, 9);
  g.save(); g.translate(20 * tn, -34 * up); g.scale(1 - .2 * Math.abs(tn), 1 - .42 * up); // features and fringe foreshorten up the face (and across it as she turns)
  // features, deadpan: flat brows, heavy half-closed lids, long nose, level mouth
  paint(g, 4.5);
  for (const s of [-1, 1]) {
    g.beginPath(); g.moveTo(s * 12, -30); g.quadraticCurveTo(s * 28, -36, s * 46, -30); g.stroke();
    g.lineWidth = 5; g.beginPath(); g.moveTo(s * 12, -9); g.quadraticCurveTo(s * 27, -14, s * 43, -8); g.stroke();
    g.lineWidth = 2.5; g.beginPath(); g.moveTo(s * 15, -3); g.quadraticCurveTo(s * 27, 2, s * 40, -3); g.stroke();
    g.fillStyle = 'rgba(42,24,12,.9)'; g.beginPath(); g.arc(s * 27 + 1, -6 - 9 * up, 5, 0, Math.PI); g.fill();
    g.lineWidth = 4.5;
  }
  g.beginPath(); g.moveTo(-3, -20); g.quadraticCurveTo(4, 10, 5, 26); g.quadraticCurveTo(0, 32, -8, 28); g.stroke();
  const m = clamp(o.mouth || 0);
  if (m > .05) { g.fillStyle = 'rgba(60,20,16,.88)'; g.beginPath(); g.ellipse(0, 51 + m * 3, 11 - m * 2, 2 + m * 10, 0, 0, TAU); g.fill(); }
  else { g.beginPath(); g.moveTo(-17, 50); g.lineTo(17, 50); g.stroke(); g.lineWidth = 2.5; g.beginPath(); g.moveTo(-17, 50); g.lineTo(-20, 53); g.moveTo(17, 50); g.lineTo(20, 53); g.stroke(); }
  g.lineWidth = 2.5; g.beginPath(); g.moveTo(-10, 66); g.quadraticCurveTo(0, 70, 10, 66); g.stroke();
  // fringe (it rides half as far across as the features when she turns, so it stays on her head)
  if (tn) g.translate(-10 * tn, 0);
  pane(g, smoothPath([[-66, -18], [-62, -66], [-26, -104], [22, -104], [62, -66], [66, -18], [46, -46], [16, -40], [-18, -50], [-48, -38]]), hairCol, sd + 8, { ew: 20, amt: .5 });
  paint(g, 3, .5); for (const x of [-40, -10, 22, 46]) { g.beginPath(); g.moveTo(x * .5, -98); g.quadraticCurveTo(x, -80, x * 1.05, -52); g.stroke(); }
  g.restore(); g.restore();
  if (o.under) o.under(g);
  // arms (sleeves of the mantle) and hands
  const H = o.hands, E = o.elbows || [[-196, 420], [196, 420]];
  for (let k = 0; k < 2; k++) {
    const s = k ? 1 : -1, h = H[k];
    const sl = smoothPath(limbPts([[s * 132, 180], E[k], [h[0] + s * 34, h[1] + 4]], [96, 86, 64]), true);
    pane(g, sl, mix(o.mantle, [0, 0, 0], .18), sd + 10 + k, { ew: 30, shade: .4 });
    pane(g, ellPath(h[0] + s * 36, h[1] + 2, 16, 32, 0), C.gold, sd + 12 + k, { ew: 10 }); // cuff
  }
  if (o.mid) o.mid(g); // in front of the sleeves, behind the hands
  for (let k = 0; k < 2; k++) {
    const h = H[k];
    g.save(); g.translate(h[0], h[1]); if (k) g.scale(-1, 1); g.rotate(h[2]); // fingers point inward on both hands
    pane(g, smoothPath([[-30, -16], [-6, -30], [26, -26], [42, -8], [40, 14], [16, 26], [-22, 24], [-34, 6]]), C.flesh, sd + 14 + k, { ew: 14, shade: .25, amt: .35 });
    paint(g, 3, .8);
    for (const y of [-12, 0, 12]) { g.beginPath(); g.moveTo(8, y); g.lineTo(36, y + 1); g.stroke(); }
    g.beginPath(); g.moveTo(-10, -20); g.quadraticCurveTo(8, -26, 18, -18); g.stroke();
    g.restore();
  }
  if (o.held) o.held(g);
}
