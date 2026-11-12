// The guard's 2D outlines, on their own, as arrays of [x, y] points.
// Head units: H = 1 = chin to top of skull. x runs forward (the way the figure faces), y up, origin under the chin.
import { fillet, xf } from "./shape2d.js";

// the head in profile: front of the brow at x = +0.37, back of the skull at x = -0.41, so the head is 0.78 H deep
export const HEAD = { back: -0.41, front: 0.37, depth: 0.78, brow: 0.60 };

// capped = true flattens the skull under the cap so nothing pokes through the dished crown
export function headOutline({ capped = false } = {}) {
  const cx = -0.03, cy = 0.60, a = 0.385, b = 0.40, pts = [];
  // neck stub (hidden in the collar), nape, then up the back of the skull and over the top, clockwise
  pts.push([-0.33, -0.12, 0], [-0.345, 0.20, 0.10]);
  const top = capped ? 0.66 : 9;
  for (let t = 203; t >= 22; t -= 6) {
    const x = cx + a * Math.cos(t * Math.PI / 180), y = cy + b * Math.sin(t * Math.PI / 180);
    if (y <= top) pts.push([x, y, 0]);
    else if (pts[pts.length - 1][1] < top) pts.push([x, top, 0]);            // level cut under the band
    else if (cy + b * Math.sin((t - 6) * Math.PI / 180) <= top) pts.push([cx + a * Math.cos((t - 6) * Math.PI / 180) - 0.004, top, 0]);
  }
  // the face: brow, nose, chin, jaw. A contour only: no eye, no mouth.
  pts.push([0.368, 0.615, 0.06], [0.356, 0.535, 0.05], [0.448, 0.41, 0.032], [0.37, 0.36, 0.03], [0.376, 0.27, 0.05],
    [0.345, 0.075, 0.08], [0.25, 0.0, 0.09], [0.07, 0.09, 0.09], [0.075, -0.12, 0]);
  return fillet(pts);
}

// The peaked cap, as police and prison officers wear. Proportions in head units, from the brief:
// band 0.10 H tall and as deep as the head; crown flares to 1.30 x the head's depth, overhanging the band at the back
// AND the front, 0.26 H tall at the back rising to 0.38 H at the front peak, the top a shallow dish; visor 0.26 H
// long, 25 degrees down, thicker at the root.
export const CAP = {
  bandY0: 0.60, bandH: 0.10, bandBack: -0.425, bandFront: 0.385,
  crownTop: 1.30 * HEAD.depth, overBack: 0.115, crownBack: 0.26, crownFront: 0.38, dish: 0.0,
  visorLen: 0.26, visorDrop: 25, visorRoot: 0.10, visorTip: 0.036,
};
export function capOutline(o = {}) {
  const c = { ...CAP, ...o }, y0 = c.bandY0, y1 = y0 + c.bandH, xb = c.bandBack, xf_ = c.bandFront;
  const rimB = xb - c.overBack, rimF = rimB + c.crownTop;                    // the crown's top, 1.30 head depths wide
  const yB = y1 + c.crownBack, yF = y1 + c.crownFront, a = c.visorDrop * Math.PI / 180;
  const vx = Math.cos(a), vy = -Math.sin(a), rootY = y0 + c.visorRoot * 0.5;   // visor centre line from the band's front edge
  const tipX = xf_ + c.visorLen * vx, tipY = rootY + c.visorLen * vy;
  const mx = (rimB + rimF) / 2, my = (yB + yF) / 2 - c.dish;                 // the dish: the top sags between rim and peak
  return fillet([
    [xb, y0, 0.015], [xb, y1, 0.012],                                        // band, back
    [rimB - 0.004, yB - 0.045, 0.02], [rimB + 0.012, yB, 0.022],            // the flare out to the back rim: the overhang
    ...[0.12, 0.24, 0.36, 0.48, 0.6, 0.72, 0.84, 0.93].map((t) => [rimB + 0.012 + (rimF - 0.03 - rimB - 0.012) * t, yB + (yF - yB) * Math.pow(t, 2.1) * (1 - c.dish), 0]),   // dished top: flat at the back, rising to the peak, never a dome
    [rimF - 0.03, yF, 0.03], [rimF, yF - 0.05, 0.03],                        // the front peak stands up
    [rimF - 0.035, y1 + 0.15, 0.3],                                          // stiff front panel
    [xf_ + 0.004, y1, 0.012],                                                // band, front
    [xf_ + 0.006, y0 + c.visorRoot, 0.012],                                  // visor root, top
    [tipX + 0.004, tipY + c.visorTip / 2, 0.016], [tipX - 0.004, tipY - c.visorTip / 2, 0.016],   // stiff, short, sloping
    [xf_ - 0.01, y0 - 0.004, 0.01],                                          // visor root, underside
  ], 6);
}
// the gold shield on the front of the crown, above the band (the figure's only accent)
export function badgeOutline(o = {}) {
  const c = { ...CAP, ...o }, w = 0.105, h = 0.135, x = c.bandFront - 0.115, y = c.bandY0 + c.bandH + 0.055;
  return fillet([[x - w / 2, y + h, 0.012], [x, y + h * 0.90, 0.02], [x + w / 2, y + h, 0.012], [x + w / 2, y + h * 0.42, 0.05], [x, y, 0.012], [x - w / 2, y + h * 0.42, 0.05]], 5);
}

// test 01's cap, kept only for the before / after print: round crown, long level brim (a baseball cap)
export function baseballCapOutline() {
  const pts = [];
  for (let t = 180; t >= 0; t -= 10) pts.push([-0.02 + 0.43 * Math.cos(t * Math.PI / 180), 0.62 + 0.42 * Math.sin(t * Math.PI / 180), 0]);
  pts.push([0.86, 0.60, 0.01], [0.86, 0.56, 0.01], [-0.45, 0.56, 0.02]);
  return fillet(pts);
}
export { xf };
