// Little Bob with his Junos (Bob, 2026-10-11: he walks through every video). Same character as Satisfied Mind /
// You Don't Love Me outro-bob.js (shapes copied from js/bob.js): red brimmed hat, blue tunic, red sleeves, yellow
// legs, red bundle on a stick, a brown toy piano with a yellow panel on a rope, three gold Junos hopping behind.
// Redrawn in the rotoscope hand: every piece a part(), so he breathes like the rest of the world.
// lilBob(x, groundY, sc, t, walking) faces +x.
function lilBob(x, gy, sc, t, walking = true) {
  const ph = walking ? t * 2.4 * TAU : 0, bounce = walking ? -Math.abs(Math.sin(ph)) * 8 : 0;
  const P = (pts, fill, sd, o = {}) => part(pts.map(([a, b]) => [x + a * sc, gy + b * sc]), { fill, shade: o.shade ?? relight(fill, -12), shadeShift: [6 * sc, -4 * sc], seed: 900 + sd, inkW: o.inkW ?? .8, seg: o.seg ?? 3, tone2: false, hatch: false, wob: .5, reg: .5 });
  const L = (pts, w, sd, col) => stroke(pts.map(([a, b]) => [x + a * sc, gy + b * sc]), 950 + sd, w, { col });
  const limbQ = (x0, y0, ang, len, w0, w1) => { const c = Math.cos(ang), si = Math.sin(ang), x1 = x0 + si * len, y1 = y0 + c * len;
    return { pts: [[x0 - c * w0 / 2, y0 + si * w0 / 2], [x0 + c * w0 / 2, y0 - si * w0 / 2], [x1 + c * w1 / 2, y1 - si * w1 / 2], [x1 - c * w1 / 2, y1 + si * w1 / 2]], end: [x1, y1] }; };
  const C = { hat: hsl(6, 62, 46, 1, .3), tunic: hsl(210, 46, 46, 1, .3), legs: hsl(44, 78, 56, 1, .3), flesh: hsl(26, 70, 76, 1, .2), shoe: hsl(240, 12, 20), piano: hsl(24, 48, 42, 1, .3), panel: hsl(44, 78, 58, 1, .3), keys: hsl(40, 60, 94), gold: hsl(42, 66, 52, 1, .2) };
  const px = -270, pj = walking ? Math.sin(ph * 2) * 2 : 0;
  for (let i = 0; i < 3; i++) {
    const jx = px - 120 - i * 62, hop = walking ? Math.abs(Math.sin(ph + i * 1.1)) * 26 : 0;
    L([[px - 80, -20], [jx + 4, -14 - hop * .3]], .5, i, hsl(30, 20, 30));
    P([[jx - 16, -hop], [jx + 16, -hop], [jx + 16, -10 - hop], [jx - 16, -10 - hop]], C.shoe, 10 + i, { seg: 1 });
    P([[jx - 5, -18 - hop], [jx + 5, -18 - hop], [jx + 4, -46 - hop], [jx + 16, -78 - hop], [jx + 11, -80 - hop], [jx + 3, -56 - hop], [jx, -60 - hop], [jx - 3, -56 - hop], [jx - 11, -80 - hop], [jx - 16, -78 - hop], [jx - 4, -46 - hop]], C.gold, 20 + i, { seg: 1, inkW: .6 });
    P(ellipse(jx, -66 - hop, 6, 6, 8), C.gold, 30 + i, { inkW: .5 });
  }
  for (const wx of [-60, 60]) P(ellipse(px + wx, -9 + pj, 9, 9, 8), C.shoe, 40 + wx);
  P([[px - 80, -176 + pj], [px + 80, -176 + pj], [px + 80, -24 + pj], [px - 80, -24 + pj]], C.piano, 50, { seg: 1 });
  P([[px - 56, -160 + pj], [px + 56, -160 + pj], [px + 56, -114 + pj], [px - 56, -114 + pj]], C.panel, 51, { seg: 1 });
  P([[px - 84, -104 + pj], [px + 84, -104 + pj], [px + 84, -82 + pj], [px - 84, -82 + pj]], C.keys, 52, { seg: 1, inkW: .6 });
  for (let k = -70; k <= 70; k += 14) L([[px + k, -104 + pj], [px + k, -90 + pj]], .3, 60 + k, hsl(0, 0, 15));
  const hip = [0, -150 + bounce], swing = Math.sin(ph) * .42;
  const bl = limbQ(hip[0] - 8, hip[1], -swing, 140, 26, 20), fl = limbQ(hip[0] + 8, hip[1], swing, 140, 26, 20);
  const shoe = (e, k) => P([[e[0] - 12, e[1] - 8], [e[0] + 26, e[1] - 8], [e[0] + 30, e[1] + 6], [e[0] - 14, e[1] + 6]], C.shoe, k, { seg: 2 });
  const sb = [-26, -258 + bounce], back = limbQ(sb[0], sb[1], -1.05, 92, 20, 15);
  L([back.end, [px + 76, -40 + pj]], .7, 70, hsl(30, 30, 30));
  P(bl.pts, C.legs, 71, { seg: 1 }); shoe(bl.end, 72);
  P(back.pts, C.hat, 73, { seg: 1 }); P(ellipse(back.end[0], back.end[1], 9, 9, 8), C.flesh, 74);
  P(fl.pts, C.legs, 75, { seg: 1 }); shoe(fl.end, 76);
  P([[-36, -272 + bounce], [36, -272 + bounce], [46, -140 + bounce], [-46, -140 + bounce]], C.tunic, 77, { seg: 1 });
  const fs = [22, -260 + bounce], front = limbQ(fs[0], fs[1], -2.3 + Math.sin(ph) * .05, 70, 20, 15);
  L([front.end, [front.end[0] - 110, front.end[1] - 70]], 1, 78, hsl(30, 40, 34));
  const bx = front.end[0] - 112, by = front.end[1] - 74;
  P([[bx - 30, by - 6], [bx - 12, by - 30], [bx + 18, by - 24], [bx + 30, by + 4], [bx + 12, by + 30], [bx - 22, by + 26]], C.hat, 79);
  P(front.pts, C.hat, 80, { seg: 1 }); P(ellipse(front.end[0], front.end[1], 9, 9, 8), C.flesh, 81);
  const hx = 6, hy = -312 + bounce;
  P(ellipse(hx, hy, 34, 34, 14), C.flesh, 82); P([[hx + 32, hy - 2], [hx + 44, hy + 6], [hx + 31, hy + 12]], C.flesh, 83, { seg: 2 });
  dot(x + (hx + 18) * sc, gy + (hy - 6) * sc, 3 * sc, C.shoe);
  P([[hx - 18, hy - 30], [hx - 16, hy - 62], [hx, hy - 68], [hx + 20, hy - 64], [hx + 22, hy - 30]], C.hat, 84);
  P([[hx - 40, hy - 30], [hx - 10, hy - 36], [hx + 30, hy - 36], [hx + 48, hy - 28], [hx + 20, hy - 22], [hx - 20, hy - 22]], C.hat, 85);
}
