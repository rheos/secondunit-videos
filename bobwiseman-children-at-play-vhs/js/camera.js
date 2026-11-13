// camera.js · the camcorder: where it points (pose keys on the hits), the hand that holds it (drift that
// never stops), the autofocus that hunts, and the auto-iris. Pure in t.
(function () {
  const T = window.TIMING;
  const C = T.cut;
  // [t, cx, cy, zoom]. Each segment eases in and out; the hand drift below keeps it alive between keys.
  const SHOT_A = [
    [0.0, 870, 412, 1.25], [T.pictureIn, 870, 412, 1.25], [5.2, 858, 408, 1.25], [T.line2, 856, 408, 1.25],
    [T.line2end, 1050, 414, 1.3], [11.0, 1112, 426, 1.75], [11.9, 1168, 442, 2.0], [12.9, 1178, 444, 2.0],
    [15.0, 1236, 432, 1.55], [C, 1240, 432, 1.55],
  ];
  const SHOT_B = [
    [C, 1392, 446, 1.35], [T.line3, 1396, 444, 1.35], [T.line3find, 1598, 472, 1.42], [19.0, 1634, 492, 1.85],
    [T.line3end, 1632, 490, 1.85], [22.6, 1566, 470, 1.45], [T.line4, 1580, 466, 1.42],
    [26.15, 1864, 440, 1.25], [26.5, 1872, 444, 1.28], [28.2, 1904, 468, 2.6], [29.5, 1904, 468, 2.6],
    [31.2, 1884, 448, 1.8], [T.line5, 1876, 448, 1.85], [34.0, 1858, 448, 1.9], [T.line5peek, 1886, 446, 1.9], [T.line5run, 1892, 450, 1.85],
    [37.6, 1790, 522, 1.15], [T.end, 1786, 524, 1.15],
  ];
  // autofocus: [t, blur in frame px]. It hunts after every zoom and in the shade under the tree.
  const FOCUS = [
    [0, 0.6], [T.pictureIn, 0.9], [2.3, 0], [10.2, 0], [10.55, 3.0], [10.95, 0.3], [11.3, 1.5], [11.75, 0],
    [C - 0.01, 0], [C, 2.4], [C + 0.45, 0.2], [C + 0.7, 0.8], [C + 1.0, 0],
    [18.3, 0], [18.7, 2.6], [19.1, 0.3], [19.45, 1.2], [19.85, 0],
    [25.3, 0], [25.9, 1.0], [26.5, 0.2], [27.1, 1.5], [27.6, 0.3], [27.9, 0], [29.5, 0], [30.3, 1.4], [31.0, 0.4], [31.8, 1.1], [32.6, 0.3],
    [T.line5, 0.4], [T.line5peek, 0], [T.line5run, 0], [36.3, 1.4], [36.9, 0.1], [37.4, 0.6], [37.8, 0], [T.end, 0],
  ];
  const smooth = (x) => x * x * x * (x * (x * 6 - 15) + 10);
  function keyed(keys, t) {
    if (t <= keys[0][0]) return keys[0].slice(1);
    for (let i = 0; i < keys.length - 1; i++) {
      const a = keys[i], b = keys[i + 1];
      if (t < b[0]) { const k = smooth((t - a[0]) / (b[0] - a[0])); return a.slice(1).map((v, j) => v + (b[j + 1] - v) * k); }
    }
    return keys[keys.length - 1].slice(1);
  }
  function lin(keys, t) {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 0; i < keys.length - 1; i++) {
      const a = keys[i], b = keys[i + 1];
      if (t < b[0]) { const k = (t - a[0]) / (b[0] - a[0]); const s = k * k * (3 - 2 * k); return a[1] + (b[1] - a[1]) * s; }
    }
    return keys[keys.length - 1][1];
  }
  // the hand: low wander plus a faint tremor, in world units (so a zoomed-in shot shakes more on screen)
  function hand(t, shot) {
    const o = shot * 17.3;
    const x = 3.4 * Math.sin(0.83 * t + 1 + o) + 2.1 * Math.sin(1.97 * t + 0.4 + o) + 0.9 * Math.sin(4.7 * t + 2) + 0.35 * Math.sin(11.3 * t);
    const y = 2.6 * Math.sin(0.71 * t + 2.2 + o) + 1.5 * Math.sin(2.31 * t + 1.1) + 0.7 * Math.sin(5.3 * t + 0.3) + 0.3 * Math.sin(12.1 * t + 1);
    const roll = 0.0085 * Math.sin(0.62 * t + o) + 0.004 * Math.sin(1.83 * t + 0.7);
    return { x, y, roll };
  }
  function at(t) {
    const shot = t < C ? 0 : 1;
    const [cx, cy, z] = keyed(shot ? SHOT_B : SHOT_A, t);
    const hd = hand(t, shot);
    return { shot, cx: cx + hd.x, cy: cy + hd.y, z, roll: hd.roll, focus: lin(FOCUS, t) };
  }
  // screen-space velocity of the frame centre, px per frame, for the pan smear
  function velocity(t) {
    const dt = 1 / 48, a = at(t - dt), b = at(t + dt);
    if (a.shot !== b.shot) return [0, 0];
    return [(b.cx - a.cx) * b.z / 2, (b.cy - a.cy) * b.z / 2];
  }
  window.CAMERA = { at, velocity };
})();
