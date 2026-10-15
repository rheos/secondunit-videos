// Little Bob with his Junos (Bob's standing note, 2026-10-11: he walks through every video from now on).
// Same character as Satisfied Mind / You Don't Love Me outro-bob.js: red brimmed hat, blue tunic, red sleeves,
// yellow legs, red bundle on a stick over his shoulder, a brown toy piano with a yellow panel on a rope behind him,
// and three gold Juno statuettes hopping behind the piano on strings. Redrawn here in each look's own hand
// (STYLE.brochure / marker / pencil), so he belongs to the picture he walks through. Pure function of t.
// bob(g, style, palette, x, groundY, scale, t, walking)
const BOBPAL = {
  brochure: { hat: '#d9573f', tunic: '#3f78a8', sleeve: '#d9573f', legs: '#e9b949', flesh: '#f2c49b', shoe: '#2a2a3a', piano: '#a8673a', panel: '#e9b949', keys: '#fff8ea', gold: '#d7a83a', bundle: '#d9573f' },
  marker: { hat: '#c8392b', tunic: '#4f7dbd', sleeve: '#c8392b', legs: '#eab52e', flesh: '#f1c29a', shoe: '#2e2733', piano: '#8a5a32', panel: '#eab52e', keys: '#f4ede0', gold: '#d6a632', bundle: '#c8392b' },
  pencil: {},
};
function limb(x0, y0, ang, len, w0, w1) { const c = Math.cos(ang), s = Math.sin(ang), nx = -s, ny = c; // ang 0 = straight down
  const x1 = x0 - s * len * 0 + Math.sin(ang) * len, y1 = y0 + Math.cos(ang) * len;
  return { pts: [[x0 - c * w0 / 2, y0 + s * w0 / 2], [x0 + c * w0 / 2, y0 - s * w0 / 2], [x1 + c * w1 / 2, y1 - s * w1 / 2], [x1 - c * w1 / 2, y1 + s * w1 / 2]], end: [x1, y1] }; }
function bob(g, styleName, x, gy, s, t, walking = true) {
  const S = STYLE[styleName], P = BOBPAL[styleName], tq = q8(t), ph = walking ? tq * 2.4 * TAU : 0;
  const sh = (pts, col, o = {}) => S.shape(g, xf(pts, x, gy, s), col ? P[col] || null : null, o, t);
  const bounce = walking ? -Math.abs(Math.sin(ph)) * 8 : 0;
  // ---- piano behind him on the rope, Junos behind the piano ----
  const px = -270, pjolt = walking ? Math.round(Math.sin(ph * 2) * 1.5) * 1.5 : 0;
  for (let i = 0; i < 3; i++) { // Junos, gold on black plinths, hopping one after another
    const jx = px - 120 - i * 62, hop = walking ? Math.abs(Math.sin(ph + i * 1.1)) * 26 : 0, r = walking ? Math.sin(ph + i) * .18 : 0;
    sh([[px - 80, -20], [jx + 4, -14 - hop * .3]], null, { closed: false, line: styleName === 'marker' ? 2.5 : 1.4 });
    const J = (pts) => xf(pts, jx, -hop, 1, r);
    sh(J(rectP(-16, -10, 32, 10)), 'shoe'); sh(J(rectP(-11, -18, 22, 8)), 'shoe');
    sh(J([[-5, -18], [5, -18], [4, -46], [16, -78], [11, -80], [3, -56], [0, -60], [-3, -56], [-11, -80], [-16, -78], [-4, -46]]), 'gold', { line: 1.6 });
    sh(J(circ(0, -66, 5.5, 10)), 'gold', { line: 1.4 });
  }
  const PZ = (pts) => xf(pts, px, pjolt, .95, walking ? Math.sin(ph * 2) * .02 : 0);
  for (const wx of [-60, 60]) sh(PZ(circ(wx, -9, 9, 12)), 'shoe');
  sh(PZ(rectP(-80, -176, 160, 152)), 'piano'); sh(PZ(rectP(-88, -190, 176, 16)), 'piano');
  sh(PZ(rectP(-56, -160, 112, 46)), 'panel'); sh(PZ(rectP(-84, -104, 168, 22)), 'keys');
  for (let k = -70; k <= 70; k += 14) sh(PZ([[k, -104], [k, -90]]), null, { closed: false, line: 1.4 });
  // ---- Bob ----
  const hip = [0, -150 + bounce], swing = Math.sin(ph) * .42;
  const backLeg = limb(hip[0] - 8, hip[1], -swing, 140, 26, 20), frontLeg = limb(hip[0] + 8, hip[1], swing, 140, 26, 20);
  const shoe = (e, k) => sh(xf([[-12, -8], [26, -8], [30, 6], [-14, 6]], e[0], e[1]), 'shoe', { seed: k });
  // rope from his back hand to the piano hook
  const sb = [-26, -258 + bounce], back = limb(sb[0], sb[1], -1.05, 92, 20, 15);
  sh([back.end, [px + 80 * .95, -40 + pjolt]], null, { closed: false, line: styleName === 'marker' ? 4 : 2.2 });
  sh(backLeg.pts, 'legs', { seed: 1 }); shoe(backLeg.end, 2);
  sh(back.pts, 'sleeve', { seed: 3 }); sh(circ(back.end[0], back.end[1], 9, 10), 'flesh', { seed: 4 });
  sh(frontLeg.pts, 'legs', { seed: 5 }); shoe(frontLeg.end, 6);
  sh([[-36, -272 + bounce], [36, -272 + bounce], [46, -140 + bounce], [-46, -140 + bounce]], 'tunic', { seed: 7 });
  // the stick and red bundle over his front shoulder
  const fs = [22, -260 + bounce], front = limb(fs[0], fs[1], -2.3 + Math.sin(ph) * .05, 70, 20, 15);
  sh([front.end, [front.end[0] - 110, front.end[1] - 70]], null, { closed: false, line: styleName === 'marker' ? 6 : 3.4 });
  const bx = front.end[0] - 112, by = front.end[1] - 74;
  sh([[bx - 30, by - 6], [bx - 12, by - 30], [bx + 18, by - 24], [bx + 30, by + 4], [bx + 12, by + 30], [bx - 22, by + 26]], 'bundle', { seed: 8 });
  sh(front.pts, 'sleeve', { seed: 9 }); sh(circ(front.end[0], front.end[1], 9, 10), 'flesh', { seed: 10 });
  // head: a plain round head, nose bump, one dot eye (code doesn't draw faces, so the hat does the acting)
  const hx = 6, hy = -312 + bounce;
  sh(circ(hx, hy, 34, 22), 'flesh', { seed: 11 }); sh([[hx + 32, hy - 2], [hx + 44, hy + 6], [hx + 31, hy + 12]], 'flesh', { seed: 12 });
  sh(circ(hx + 18, hy - 6, 3, 8), 'shoe', { line: 0 });
  if (styleName === 'pencil') sh(circ(hx + 18, hy - 6, 3, 8), null);
  sh(xf([[-18, -44], [-16, -76], [0, -82], [20, -78], [22, -44]], hx, hy + 14), 'hat', { seed: 13 });
  sh(xf([[-40, -44], [-10, -50], [30, -50], [48, -42], [20, -36], [-20, -36]], hx, hy + 14), 'hat', { seed: 14 });
}
