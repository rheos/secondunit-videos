// p2-instr1: INSTRUMENTAL 1, first part (35.0 - 59.5), recomposed for the 9:16 page (wood-9x16.html, 1080 x 1920).
// Same beats and hit times as js/wch/w2-instr1.js, re-staged for the tall frame. The 16:9 notes follow.
// The giant harmonica drops (lands on the band entry 40.37), tiny cut-out Ellen lifts it like nothing and blows
// (45.45): a stream of red hair pours until it fills the screen; scissors cut it on the 59.43 hit; the severed
// hair falls and becomes a curtain; it opens on Ellen playing slide in a one-woman hurricane; each slide move
// sprouts a harmonica from the ground (five); she slides down, they close; she walks off into verse 2.
(() => {
  // harmonica band (source/harmonica-band.json), every 0.5 s from 34.0 to 79.0
  const HB = [0, 0, 0, 0, 0, 0, 0, 0, 0, .022, .05, .092, .19, .07, .001, .006, .011, .045, .041, .025, .084, .003, .001, .05, .022, .042, .141, .028, .006, .006, .003, .005, .002, .001, .001, .002, .004, .005, .01, .014, .001, .002, .009, .004, .033, .02, .005, .007, .002, .003, .007, .004, .001, .004, .005, .011, .01, .006, .011, .001, .003, .002, .005, .004, .025, .038, .019, .02, .041, .039, .025, .018, .012, .066, .048, .038, .021, .024, .184, .204, .137, .254, .14, .188, .206, .41, .236, .204, .055, .104, .002];
  const harm = (t) => { const x = (t - 34) / .5, i = Math.floor(x), u = x - i; const a = HB[clamp(i, 0, HB.length - 1)], b = HB[clamp(i + 1, 0, HB.length - 1)]; return lerp(a, b, u); };
  const T_LAND = 40.37, T_BLOW = 45.45, T_SNIP = 59.43, T_VAL = 60.03;
  const HZ = 1180;                                     // horizon: a tall sky above for the fall
  const GY = 1640;                                     // where the harmonica lands
  const HW = 860, HH = 202;                            // the giant harmonica (as wide as the frame)
  const HX = 560;                                      // its landing centre

  // ---------- small carving helpers ----------
  const P = (pts, seed, amt) => () => pathOf(chisel(pts, seed, amt));
  const rect = (x, y, w, h) => () => { s.beginPath(); s.rect(x, y, w, h); };
  function hline(x0, x1, y, w0, w1, c, seed, wob = 2) { const r = rng(seed), pts = []; for (let x = x0; x <= x1 + .1; x += Math.max(20, (x1 - x0) / 12)) pts.push([x, y + (r() - .5) * wob]); taper(pts, w0, w1, c); }
  function catmull(pts, n = 10) {
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      for (let j = 0; j < n; j++) { const u = j / n, u2 = u * u, u3 = u2 * u;
        out.push([0, 1].map((k) => .5 * (2 * p1[k] + (-p0[k] + p2[k]) * u + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * u2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * u3))); }
    }
    out.push(pts[pts.length - 1]); return out;
  }
  // ribbon along a polyline: width wf(i/n); returns [L, R] edges
  function ribbonEdges(pts, wf) {
    const n = pts.length, L = [], R = [];
    for (let i = 0; i < n; i++) { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
      let dx = b[0] - a[0], dy = b[1] - a[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l; const w = wf(i / (n - 1)) / 2;
      L.push([pts[i][0] - dy * w, pts[i][1] + dx * w]); R.push([pts[i][0] + dy * w, pts[i][1] - dx * w]); }
    return [L, R];
  }

  // ---------- the giant harmonica (woodcut: INK body, CUT slots, carved highlights) ----------
  function harmonica(cx, cy, w, h, rot = 0, o = {}) {
    const { seed = 5, puff = 0, t = 0, holes = 10 } = o;
    withT(() => { s.translate(cx, cy); s.rotate(rot);
      const x0 = -w / 2, y0 = -h / 2, a = Math.max(1.5, h * .015);
      const body = P([[x0, y0 + h * .1], [x0 + h * .08, y0], [-x0 - h * .08, y0], [-x0, y0 + h * .1], [-x0, y0 + h * .9], [-x0 - h * .08, y0 + h], [x0 + h * .08, y0 + h], [x0, y0 + h * .9]], seed, a);
      const comb = P([[x0 - h * .05, -h * .14], [-x0 + h * .05, -h * .14], [-x0 + h * .05, h * .14], [x0 - h * .05, h * .14]], seed + 9, a);
      shape(comb, INK); clipTo(comb, () => { for (const sx of [-1, 1]) for (let i = 0; i < 4; i++) taper([[sx * (-x0 + h * .02), -h * .12 + i * h * .07], [sx * (-x0 + h * .05), -h * .1 + i * h * .07]], h * .015, h * .01, CUT); });
      shape(body, INK);
      // top cover: carved highlight lines, fat at the top edge, thinning down into the shade
      clipTo(body, () => {
        taper([[x0 + h * .12, y0 + h * .1], [-x0 - h * .4, y0 + h * .09], [-x0 - h * .12, y0 + h * .12]], h * .055, h * .02, CUT);
        for (let i = 0; i < 3; i++) hline(x0 + h * .1, -x0 - h * .1, y0 + h * (.17 + i * .04), h * (.018 - i * .005), h * (.012 - i * .003), CUT, seed + i, a);
        // bottom cover: shade rows rising from the bottom edge
        for (let i = 0; i < 4; i++) hline(x0 + h * .1, -x0 - h * .1, y0 + h * (.93 - i * .06), h * (.012 + i * .002), h * .006, CUT, seed + 20 + i, a);
        // cover rims around the comb
        hline(x0 + h * .02, -x0 - h * .02, y0 + h * .37, h * .022, h * .022, CUT, seed + 40, a);
        hline(x0 + h * .02, -x0 - h * .02, y0 + h * .63, h * .016, h * .016, CUT, seed + 41, a);
        // end folds of the covers
        for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) taper([[sx * (-x0 - h * (.05 + i * .045)), y0 + h * .08], [sx * (-x0 - h * (.05 + i * .045)), y0 + h * .34]], h * .016, h * .008, CUT);
        // gouge flicks along the top cover: engraved shine
        flicks(x0 + h * .3, y0 + h * .1, -x0 - h * .3, y0 + h * .3, Math.round(w / 60), 0, h * .25, h * .02, seed + 3);
      });
      // the comb: square holes carved through, numbered 1..n on the cover above like a real harp
      const n = holes, gap = (w - h * .5) / n, hw = gap * .5, hh = h * .2;
      for (let i = 0; i < n; i++) { const hx = x0 + h * .25 + gap * (i + .5) - hw / 2, hy = -hh / 2;
        shape(P([[hx, hy], [hx + hw, hy], [hx + hw, hy + hh], [hx, hy + hh]], seed + 60 + i, a * .7), CUT);
        taper([[hx + hw * .2, hy + hh * .78], [hx + hw * .8, hy + hh * .78]], h * .012 + .5, h * .012 + .5, INK);   // the reed seen through the hole
        if (h > 60) carveText(String(i + 1), hx + hw / 2, y0 + h * .29, h * .1, CUT, { weight: '900' });
        // puffs of air out of the holes while the harmonica band plays
        if (puff > .02) { const k = clamp(puff * 6), ph = onTwos(t, 12) * 9 + i * 1.3;
          for (let j = 0; j < 2; j++) { const yy = hh / 2 + 10 + j * h * .12 + (ph % 1) * h * .1;
            taper([[hx + hw * .2, yy], [hx + hw * .5 + Math.sin(ph + j) * hw * .3, yy + h * .12 * k], [hx + hw * .9, yy + h * .2 * k]], h * .02 * k + 1, .5, INK); } }
      }
    });
  }

  // ---------- the scissors: pivot (cx, cy), blades point along -x, open = angle between blades ----------
  function scissors(cx, cy, len, open, rot = 0) {
    withT(() => { s.translate(cx, cy); s.rotate(rot);
      const half = (sgn, seed) => withT(() => { s.rotate(sgn * open / 2);
        const bw = len * .055;
        const blade = P([[30, -bw * .2 * sgn], [-len * .2, -bw * sgn], [-len * .7, -bw * .7 * sgn], [-len, 0], [-len * .5, bw * .25 * sgn], [30, bw * .35 * sgn]], seed, 4);
        shape(blade, INK, 5, CUT);
        clipTo(blade, () => { taper([[-len * .95, -bw * .05 * sgn], [-len * .1, -bw * .55 * sgn]], 3, 14, CUT);
          for (let i = 0; i < 5; i++) taper([[-len * (.15 + i * .1), -bw * .75 * sgn], [-len * (.25 + i * .1), -bw * .15 * sgn]], 5, 1, CUT); });
        // shank and the finger ring
        const rx = len * .3, ry = len * .1 * -sgn;
        taper([[20, 0], [rx * .55, ry * .5], [rx - len * .06, ry]], bw * .7, bw * .55, INK);
        shape(() => { s.beginPath(); s.ellipse(rx, ry, len * .09, len * .065, sgn * .3, 0, TAU); }, INK, 5, CUT);
        shape(() => { s.beginPath(); s.ellipse(rx, ry, len * .06, len * .036, sgn * .3, 0, TAU); }, CUT, 3);
        taper(arcPts(rx, ry, len * .078, len * .052, Math.PI * 1.1, Math.PI * 1.7, 10), 4, 1, CUT);
      });
      half(1, 71); half(-1, 73);
      dot(0, 0, len * .025, CUT); dot(0, 0, len * .018, INK); taper([[-len * .014, -len * .008], [len * .014, len * .008]], 4, 4, CUT);
    });
  }

  // ---------- tiny cut-out Ellen: the kit's Ellen on a carved paper block ----------
  function tinyEllen(x, y, k, o = {}) {
    const { pose = 'walk', wind = 0 } = o;
    const hx = lerp(-118, -560, wind), hy = lerp(-140, -455, wind);
    let pts;
    if (pose === 'walk') pts = [[-80, -560], [72, -560], [100, -430], [185, -300], [190, 40], [-95, 40], [-112, -300], [hx, hy], [-118, -440]];
    else if (pose === 'point') pts = [[-80, -560], [72, -560], [100, -440], [275, -455], [280, -385], [105, -330], [95, 40], [-95, 40], [-112, -300], [hx, hy], [-118, -440]];
    else pts = [[-80, -560], [72, -560], [100, -430], [105, -210], [95, 40], [-95, 40], [-112, -300], [hx, hy], [-118, -440]];
    const fa = o.facing || 1;
    shape(() => pathOf(chisel(pts.map(([a, b]) => [x + a * k * fa, y + b * k]), 17, 5)), CUT, 3.5);
    ellen(x, y, k, o);
  }

  // ---------- the field (shots 1 to 3) ----------
  function sky(y0, y1, seed) {
    for (let i = 0, y = y0 + 14; y < y1 - 6; i++, y += 15 + i * .9) { const u = (y - y0) / (y1 - y0); hline(20, W - 20, y, lerp(8, 1.2, u), lerp(6, .8, u), INK, seed + i, 3); }
  }
  function cloud(x, y, k, seed) {
    const c = () => { const r = rng(seed), p = []; for (let i = 0; i < 14; i++) { const a = i / 14 * TAU; p.push([x + Math.cos(a) * 150 * k * (.8 + .4 * r()), y + Math.sin(a) * 42 * k * (.8 + .4 * r()) - (Math.sin(a) < 0 ? 26 * k : 0)]); } smoothPath(p); };
    shape(c, CUT, 4); clipTo(c, () => { for (let i = 0; i < 3; i++) hline(x - 120 * k, x + 120 * k, y + (8 + i * 12) * k, 3, 1, INK, seed + i, 2); });
  }
  function fence(x, y, k, tilt) {
    for (let i = 0; i < 4; i++) withT(() => { s.translate(x + i * 90 * k, y); s.rotate(tilt * (i % 2 ? 1 : -.7) * (1 + i * .2));
      shape(P([[-7 * k, 0], [7 * k, 0], [6 * k, -70 * k], [0, -80 * k], [-6 * k, -70 * k]], 90 + i, 2), INK); });
    if (tilt < .05) { taper([[x, y - 55 * k], [x + 270 * k, y - 55 * k]], 2, 2); taper([[x, y - 30 * k], [x + 270 * k, y - 30 * k]], 2, 2); }
  }
  function tree(x, y, k, shed) {
    taper([[x, y], [x + 4 * k, y - 60 * k], [x - 2 * k, y - 110 * k]], 14 * k, 6 * k, INK);
    const crown = P([[x - 60 * k, y - 100 * k], [x - 40 * k, y - 170 * k], [x + 10 * k, y - 200 * k], [x + 60 * k, y - 160 * k], [x + 66 * k, y - 105 * k], [x + 10 * k, y - 85 * k]], 33, 4);
    shape(crown, INK); clipTo(crown, () => flicks(x - 60 * k, y - 200 * k, x + 66 * k, y - 85 * k, 16, -Math.PI / 2 - .4, 22 * k, 3 * k, 35));
    // leaves knocked off by the landing
    if (shed > 0) { const r = rng(44); for (let i = 0; i < 9; i++) { const lx = x + (r() - .5) * 130 * k + Math.sin(shed * 3 + i) * 20, ly = y - 150 * k + shed * (60 + r() * 40) * k * 1.3;
      if (ly < y) flick(lx, ly, r() * TAU, 16 * k, 4 * k, INK); } }
  }
  function field(t, o = {}) {
    const { shake = 0, landed = false, sinceLand = 0 } = o;
    shape(rect(-40, -40, W + 80, H + 80), CUT);
    withT(() => {
      s.translate(snoise(onTwos(t, 12) * 9, 3) * shake, snoise(onTwos(t, 12) * 9, 7) * shake);
      // a tall sky: the harmonica has a long way to fall
      sky(0, HZ - 40, 100);
      cloud(290, 240, 1, 51); cloud(800, 520, .8, 52); cloud(330, 800, .6, 53); cloud(820, 1010, .45, 54);
      const hills = P([[-20, HZ + 4], [-20, HZ - 50], [140, HZ - 82], [330, HZ - 40], [520, HZ - 96], [760, HZ - 44], [940, HZ - 86], [1100, HZ - 56], [1100, HZ + 4]], 61, 6);
      shape(hills, INK); clipTo(hills, () => flicks(0, HZ - 96, W, HZ - 10, 26, Math.PI, 30, 3, 62));
      // the ground: furrows run from the horizon down to the bottom of the frame
      for (let i = -9; i <= 9; i++) taper([[540 + i * 45, HZ], [540 + i * 235, H + 40]], 1.5, 6, INK);
      for (let j = 0; j < 9; j++) { const y = HZ + 12 + Math.pow(j, 1.6) * 30; hline(20, W - 20, y, 1.5 + j * .45, 1 + j * .35, INK, 120 + j, 2); }
      taper([[0, HZ], [W, HZ]], 6, 6);
      tree(140, HZ + 170, 1.5, landed ? clamp(sinceLand / 1.4) : 0);
      fence(745, HZ + 150, 1.15, landed ? .35 * ease.out(sinceLand / .25) : 0);
    });
  }
  function shadowBlob(cx, rx, ry) {
    const b = () => { s.beginPath(); s.ellipse(cx, GY, rx, ry, 0, 0, TAU); };
    shape(b, INK); clipTo(b, () => { for (let i = 0; i < 6; i++) hline(cx - rx, cx + rx, GY - ry + i * ry * .35, 3, 1, CUT, 300 + i, 2); });
  }
  function cracks(cx, k) {
    const r = rng(77);
    for (let i = 0; i < 7; i++) { const side = i % 2 ? 1 : -1, x0 = cx + side * (HW / 2 - 40 - r() * 200), pts = [[x0, GY + 4]];
      let x = x0, y = GY + 4; const n = 5; for (let j = 0; j < n; j++) { x += side * (25 + r() * 45) * k; y += (r() * 50 + 8) * k; pts.push([x, y]); }
      taper(pts, 8, 1.5, INK); }
  }
  function dust(cx, a) { // CUT puffs with INK outline at both ends, a = 0..1 age; in the tall frame they billow up as well as out
    if (a <= 0 || a >= 1) return;
    for (const side of [-1, 1]) for (let i = 0; i < 4; i++) { const r = rng(500 + i + (side > 0 ? 9 : 0));
      const px = cx + side * (HW / 2 - 60 + (i * 40 + 70 * r()) * ease.out(a)), py = GY - 30 - i * 70 * ease.out(a) - 90 * r() * a, rr = (50 + 40 * r()) * (1 - a * .7) + 30 * a;
      const c = () => { const p = []; for (let j = 0; j < 9; j++) { const an = j / 9 * TAU; p.push([px + Math.cos(an) * rr * (.8 + .4 * hash(i * 31 + j)), py + Math.sin(an) * rr * .7 * (.8 + .4 * hash(i * 17 + j + 5))]); } smoothPath(p); };
      shape(c, CUT, 4); clipTo(c, () => hline(px - rr, px + rr, py + rr * .3, 3, 1, INK, 600 + i, 2)); }
    // chips of earth flying high
    const r = rng(800); for (let i = 0; i < 18; i++) { const side = r() < .5 ? -1 : 1, vx = side * (100 + r() * 300), vy = -(500 + r() * 800), tt = a * 1.2;
      const x = cx + side * HW * .4 + vx * tt, y = GY - 10 + vy * tt + 1500 * tt * tt; if (y < GY + 20) dot(x, y, 5 + r() * 8, INK); }
  }

  // ---------- red hair ----------
  // the stream: out of the far end, straight up the right side of the tall frame, over the top, and down the left into the pile
  const STREAM = catmull([[1030, 1600], [1066, 1510], [1056, 1280], [1016, 900], [996, 560], [940, 260], [790, 110], [540, 70], [300, 130], [150, 330], [96, 700], [90, 1100], [100, 1500], [110, 1990]], 10);
  function streamPrefix(len) { const out = [STREAM[0]]; let acc = 0;
    for (let i = 1; i < STREAM.length; i++) { const d = Math.hypot(STREAM[i][0] - STREAM[i - 1][0], STREAM[i][1] - STREAM[i - 1][1]);
      if (acc + d >= len) { const u = (len - acc) / d; out.push([lerp(STREAM[i - 1][0], STREAM[i][0], u), lerp(STREAM[i - 1][1], STREAM[i][1], u)]); return out; }
      acc += d; out.push(STREAM[i]); }
    return out; }
  function hairRibbon(pts, wid, t, seed) {
    if (pts.length < 2) return;
    const tip = (u) => wid * Math.min(1, .35 + u * 4) * (u > .97 ? lerp(1, .55, (u - .97) / .03) : 1);
    const [L, R] = ribbonEdges(pts, (u) => tip(Math.min(u * 3, 1)));
    const mk = () => { s.beginPath(); L.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y)); for (let i = R.length - 1; i >= 0; i--) s.lineTo(...R[i]); s.closePath(); };
    shape(mk, RED, 5);
    clipTo(mk, () => { const m = Math.max(4, Math.round(wid / 16)), tt = onTwos(t, 12);
      for (let j = 0; j < m; j++) { const off = (j + .5) / m - .5, strand = [];
        for (let i = 0; i < pts.length; i++) { const [lx, ly] = L[i], [rx, ry] = R[i], w = Math.sin(i * .35 - tt * 14 + j * 1.9) * .06;
          strand.push([lerp(lx, rx, .5 + off + w), lerp(ly, ry, .5 + off + w)]); }
        taper(strand, 2.6, 1.6, INK); }
      for (let i = 2; i < pts.length - 2; i += 3) { const [lx, ly] = L[i], [rx, ry] = R[i], u = hash(i * 13 + seed + Math.floor(t * 8));
        const a = Math.atan2(pts[i + 1][1] - pts[i][1], pts[i + 1][0] - pts[i][0]); flick(lerp(lx, rx, u), lerp(ly, ry, u), a, 26, 3, CUT); } });
  }
  // the pile: hair heaping up from the bottom of the frame to a wavy top at level y
  function hairPile(level, t) {
    const tt = onTwos(t, 12), top = (x) => level + Math.sin(x * .009 + tt * 2) * 34 + Math.sin(x * .025 - tt * 3) * 14;
    const mk = () => { s.beginPath(); s.moveTo(-40, H + 40); for (let x = -40; x <= W + 40; x += 30) s.lineTo(x, top(x)); s.lineTo(W + 40, H + 40); s.closePath(); };
    shape(mk, RED, 5);
    clipTo(mk, () => {
      for (let j = 0, yy = level - 30; yy < H + 40; j++, yy += 24) { const pts = [];
        for (let x = -40; x <= W + 40; x += 30) pts.push([x, yy + Math.sin(x * .01 + j * .9 + tt * 2.4) * 22 + Math.sin(x * .03 - tt * 4 + j) * 6]);
        taper(pts, 2.4, 2.4, INK); }
      const r = rng(900 + Math.floor(t * 8)); for (let i = 0; i < 30; i++) { const x = r() * W, y = level + 30 + r() * (H - level); flick(x, y, (r() - .5) * .8, 40, 3.5, CUT); }
      for (let i = 0; i < 12; i++) { const cx = (i * 263 + tt * 60) % (W + 200) - 100, cy = level + 70 + (i * 157) % 1200; if (cy < H) taper(arcPts(cx, cy, 40, 26, 0, TAU * .8, 14), 3, 1, INK); }
    });
  }
  // a hanging sheet of hair, vertical strands from top to bottom inside x0..x1; flow moves the strands down
  function hairSheet(x0, x1, top, bot, t, flow, folds) {
    const mk = rect(x0, top, x1 - x0, bot - top);
    shape(mk, RED);
    clipTo(mk, () => { const tt = onTwos(t, 12);
      for (let x = x0 + 8, j = 0; x < x1; x += 17, j++) { const pts = [];
        for (let y = top - 20; y <= bot + 20; y += 40) pts.push([x + Math.sin(y * .011 - tt * 12 * flow + j * .7) * 7 + Math.sin(j * 2.3) * 3, y]);
        taper(pts, 2.4, 2.4, INK); }
      if (folds) for (let x = x0 + 70, j = 0; x < x1; x += 140, j++) { taper([[x, top], [x + 6, (top + bot) / 2], [x - 4, bot]], 22 * folds, 10 * folds, INK); taper([[x + 40, top], [x + 44, bot]], 4 * folds, 6 * folds, CUT); }
      if (flow) { const r = rng(1200 + Math.floor(t * 8)); for (let i = 0; i < 40; i++) flick(x0 + r() * (x1 - x0), top + r() * (bot - top), Math.PI / 2, 46, 3.5, CUT); }
    });
  }

  // ---------- 1. the drop: empty field under a tall sky; the harmonica falls the whole height and lands on 40.37 ----------
  const fallK = (t) => clamp((t - 38.0) / (T_LAND - 38.0));
  const harmLandY = GY - HH / 2;
  function drop(t) {
    const land = t >= T_LAND, sl = t - T_LAND;
    const shake = land ? 46 * hit(t, T_LAND, 5) + 16 * hit(t, 40.9, 8) + 10 * hit(t, 41.97, 8) : 0;
    field(t, { shake, landed: land, sinceLand: sl });
    withT(() => {
      s.translate(snoise(onTwos(t, 12) * 9, 3) * shake, snoise(onTwos(t, 12) * 9, 7) * shake);
      const k = fallK(t), kk = k * k;
      // its shadow grows as it falls from very high
      const sk = land ? 1 : ease.in(inv(35, T_LAND, t));
      shadowBlob(HX, lerp(50, 500, sk), lerp(8, 32, sk));
      if (land) cracks(HX, 1);
      if (t >= 38.0) {
        const cy = land ? harmLandY : lerp(-HH * .6, harmLandY, kk);
        const sq = land ? 1 - .2 * hit(t, T_LAND, 9) * Math.cos(sl * 30) : 1;
        // speed lines trailing up the sky while it drops
        if (!land && k > .15) for (let i = 0; i < 8; i++) { const x = HX - HW / 2 + 60 + i * (HW - 120) / 7; taper([[x, cy - HH / 2 - 20], [x, cy - HH / 2 - 480 * k - 90 * hash(i + Math.floor(t * 12))]], 7, 1, INK); }
        withT(() => { s.translate(HX, GY); s.scale(1 + (1 - sq) * .5, sq); s.translate(-HX, -GY);
          harmonica(HX + (land ? 0 : Math.sin(t * 9) * 6), cy, HW, HH, land ? 0 : Math.sin(t * 2.2) * .05, { puff: land ? 0 : harm(t), t }); });
      }
      if (land) dust(HX, sl / 1.6);
    });
    if (land && sl < 2 / 24) fx({ inv: 1 });
  }

  // ---------- 2. tiny Ellen walks in across the foreground, flips the harmonica up on end onto one fingertip ----------
  // (the tall frame: it stands balanced, the height of the sky, on her finger), then takes it to her mouth
  const EX = 160, EK = .7, EGY = 1860;                // Ellen stands in the foreground, in front of where it landed
  const caseAt = (x) => guitarCase(x, EGY - 140 * .9 * EK, .9 * EK, -.08);
  const TIPX = EX + 247 * EK, TIPY = EGY - 414 * EK;   // her pointing fingertip
  const MOUTH = [EX + 10 + HW / 2, EGY - 434 * EK];    // harmonica centre when it is at her mouth
  const onTip = (rot, lift = 0) => [TIPX + Math.cos(rot) * (HW / 2 + 4), TIPY - lift + Math.sin(rot) * (HW / 2 + 4), rot];
  function harmPoseAt(t) { // [cx, cy, rot] of the harmonica while she handles it
    const land = [HX, harmLandY, 0], tipF = onTip(-Math.PI / 2);
    if (t < 44.05) return land;
    if (t < 44.6) { const u = ease.out((onTwos(t) - 44.05) / .55), arcH = Math.sin(Math.PI * u) * 420;
      return [lerp(land[0], tipF[0], u), lerp(land[1], tipF[1], u) - arcH, (-Math.PI / 2 - TAU) * u]; }
    if (t < 45.05) { const d = (t - 44.6) / .45, w = Math.sin((t - 44.6) * 14) * .07 * (1 - d); return onTip(-Math.PI / 2 + w, Math.abs(Math.sin((t - 44.6) * 8)) * 14 * (1 - d)); }
    const u = ease.inOut((onTwos(t) - 45.05) / .4); return [lerp(tipF[0], MOUTH[0], u), lerp(tipF[1], MOUTH[1], u), lerp(-Math.PI / 2, 0, u)];
  }
  function ellenIn(t) {
    const shake = 10 * hit(t, 41.97, 8);
    field(t, { shake, landed: true, sinceLand: t - T_LAND });
    const gust = harm(t) > .03 ? clamp(harm(t) * 8) * .45 : 0;           // the harmonica wheezes, her hair lifts
    withT(() => { s.translate(snoise(onTwos(t) * 9, 3) * shake, snoise(onTwos(t) * 9, 7) * shake);
      shadowBlob(HX, 500, 32); cracks(HX, 1); dust(HX, (t - T_LAND) / 1.6);
      const [hx, hy, hr] = harmPoseAt(t);
      harmonica(hx, hy, HW, HH, hr, { puff: t < 44.05 ? harm(t) * .6 : 0, t });
      // motion arcs as it twirls up
      if (t >= 44.05 && t < 44.6) for (let i = 0; i < 3; i++) taper(arcPts(hx, hy, HW * .52, HW * .52, hr + Math.PI * .9 + i * .25, hr + Math.PI * 1.15 + i * .25, 8), 7, 1, INK);
      // balance marks at the fingertip while it stands on end
      if (t >= 44.6 && t < 45.05) for (const sd of [-1, 1]) taper([[TIPX + sd * 26, TIPY - 30], [TIPX + sd * 44, TIPY - 54]], 4, 1, INK);
      if (t < 43.9) {                                                    // walking in on twos, case in hand
        const x = lerp(-160, EX, inv(41.95, 43.9, onTwos(t)));
        tinyEllen(x, EGY, EK, { pose: 'walk', t: onTwos(t), wind: gust });
      } else {
        caseAt(EX - 110);
        tinyEllen(EX, EGY, EK, { pose: t < 44.05 ? 'stand' : 'point', t: onTwos(t), wind: gust, eyes: t >= 45.35 ? 'closed' : 'open', smile: t < 44.05 ? 0 : .5 });
      }
    });
  }

  // ---------- 3. she blows: out of the far end a stream of red hair climbs the whole frame and pours until it fills it ----------
  function pour(t) {
    field(t, { landed: true, sinceLand: 9 });
    const tt = onTwos(t);
    const total = STREAM.reduce((a, p, i) => i ? a + Math.hypot(p[0] - STREAM[i - 1][0], p[1] - STREAM[i - 1][1]) : 0, 0);
    shadowBlob(HX, 500, 32); cracks(HX, 1);
    const level = lerp(H + 60, -80, ease.inOut(inv(47.6, 55.6, t)));
    const wid = lerp(40, 300, ease.inOut(inv(45.6, 54.5, t)));
    if (t > 47.4) hairPile(level, t);
    const len = total * ease.out(inv(T_BLOW, 47.6, tt));
    hairRibbon(streamPrefix(len), wid, t, 1);
    if (t > 50.5) { const k = ease.inOut(inv(50.5, 53, tt)), p2 = streamPrefix(total * k).map(([x, y]) => [x + (540 - x) * .25, y + (900 - y) * .22]); hairRibbon(p2, wid * .8, t + 3, 2); }
    if (t > 52.5) { const k = ease.inOut(inv(52.5, 54.5, tt)), p3 = streamPrefix(total * k).map(([x, y]) => [x + (540 - x) * .5, y + (900 - y) * .45]); hairRibbon(p3, wid * .7, t + 5, 3); }
    const [hx, hy] = MOUTH;
    caseAt(EX - 110);
    harmonica(hx, hy, HW, HH, 0, { t });
    // Bob (draft-6 notes): the harmonica blows four separate notes in a row; she hops on each one.
    // Onsets of the four F blasts, from a pitch track of the no-vocals stem: 49.17, 49.65, 50.23, 50.78.
    const HOPS = [49.17, 49.65, 50.23, 50.78];
    let hop = 0, landing = -1;
    for (const h0 of HOPS) { const u = (t - h0) / .36; if (u >= 0 && u < 1) hop = Math.sin(Math.PI * u); if (t - (h0 + .36) >= 0 && t - (h0 + .36) < .18) landing = h0; }
    const hy_ = -hop * 300 * EK;
    // each note puffs out of the far end and climbs the tall frame as a big carved note
    HOPS.forEach((h0, i) => { const a = t - h0; if (a < 0 || a > 1.3) return; withT(() => { s.translate(hx + HW / 2 - 130 - a * 200 - i * 30, hy - 170 - a * 620); s.rotate(-.25 + i * .17); s.scale(3, 3);
      dot(0, 0, 15, CUT); dot(0, 0, 10.5, INK); taper([[9, -2], [9, -60]], 6, 6, INK); taper([[9, -60], [30, -40]], 8, 3, INK); });
      if (a < .3) for (let j = 0; j < 6; j++) { const an = -Math.PI / 2 + (j - 2.5) * .35; flick(hx + HW / 2 - 30 + Math.cos(an) * 30, hy - 110 + Math.sin(an) * 30, an, 50 * (1 - a * 2), 5, INK); } });
    withT(() => { s.translate(0, hy_);
      for (let i = 0; i < 3; i++) { const u = ((tt * 3 + i / 3) % 1); taper([[EX + 55 * EK, EGY - 440 * EK + i * 10], [EX + 55 * EK + 26 * u, EGY - 446 * EK + i * 12 - 12 * u]], 3.5, 1, INK); }
      tinyEllen(EX, EGY, EK, { pose: 'point', t: tt, wind: .1 + .5 * hop, eyes: hop > .05 ? 'open' : 'closed', smile: .2 + .5 * hop }); });
    if (landing >= 0) for (let j = 0; j < 7; j++) flick(EX - 50 + j * 17, EGY - 2, -Math.PI / 2 + (j - 3) * .45, 38, 5, INK);
  }

  // ---------- 4. all hair; giant scissors come down the tall frame in lurches on the beats and snip on 59.43 ----------
  const CUTY = 760, SX = 720, SL = 700;
  function snip(t) {
    const cut = t >= T_SNIP, tc = t - T_SNIP;
    shape(rect(-40, -40, W + 80, H + 80), INK);                       // the dark behind the hair
    if (!cut) hairSheet(-40, W + 40, -40, H + 40, t, 1, 0);
    else {
      // the top remnant snaps back up out of frame; the severed sheet drops and swings on its new hem
      const up = 60 + ease.out(clamp(tc / .16)) * (CUTY + 60);
      hairSheet(-40, W + 40, -60, CUTY - up, t, 0, 0);
      const drop = 70 + Math.min(70, 70 * ease.in(clamp(tc / .22))) - 22 * Math.sin(clamp((tc - .22) / .4) * Math.PI) * (tc > .22 ? 1 : 0);
      const top = CUTY + drop;
      hairSheet(-40, W + 40, top, H + 40, t, 0, t >= T_VAL ? 1 : clamp(tc / .6) * .6);
      const r = rng(1400); for (let x = -20; x < W + 20; x += 13) flick(x, top - 4, Math.PI / 2 + (r() - .5) * .5, 22 + r() * 18, 4, INK);
      if (tc < .25) { const r2 = rng(1500); for (let i = 0; i < 40; i++) { const x = r2() * W; flick(x, CUTY + (r2() - .5) * 30, (r2() - .5) * 1.2 + (r2() < .5 ? 0 : Math.PI), 50 * (1 - tc * 3), 4, CUT); } }
    }
    // the scissors: stepped descent from above the frame on beats 56.07 .. 58.77
    const bt = FEAT.beats.filter((b) => b >= 56 && b <= 58.8);
    const Y0 = -200;
    let cyS = Y0, open = .12;
    for (let i = 0; i < bt.length; i++) { const u = ease.out(clamp((t - bt[i]) / .14)); cyS += u * (CUTY - Y0) / bt.length; open += u * .5 / bt.length; }
    if (t > 58.8) open += .1 * ease.out(clamp((t - 58.8) / .4));
    if (t > 59.29) open = lerp(.72, .02, clamp((t - 59.29) / (T_SNIP - 59.29)));
    if (cut) { open = 0; cyS -= ease.in(clamp((tc - .02) / .3)) * 1300; }
    if (cyS > -560) scissors(SX, cyS, SL, open, 0);
    if (t >= T_VAL - .12) valance(lerp(-420, 0, ease.out(clamp((t - (T_VAL - .12)) / .12))) + 14 * hit(t, T_VAL, 10) * Math.cos((t - T_VAL) * 40));
    if (cut && tc < 1 / 24) fx({ flash: .75 });
  }
  function valance(dy) {   // (comes down at 60.03, after this chapter ends at 59.5; kept so the shot stays complete)
    const n = Math.ceil(W / 160);
    withT(() => { s.translate(0, dy);
      const mk = () => { s.beginPath(); s.moveTo(-40, -40); s.lineTo(W + 40, -40); s.lineTo(W + 40, 300);
        for (let i = n; i >= 0; i--) { const x0 = i * 160; s.quadraticCurveTo(x0 + 80, 380, x0, 300); } s.lineTo(-40, 300); s.closePath(); };
      shape(mk, INK, 6);
      clipTo(mk, () => { for (let i = 0; i < 6; i++) hline(-20, W + 20, 40 + i * 24, 6 - i * .7, 3 - i * .3, CUT, 1600 + i, 3);
        hline(-20, W + 20, 220, 10, 10, CUT, 1610, 3);
        for (let i = 0; i < n; i++) { const x0 = i * 160 + 80; taper(arcPts(x0, 300, 60, 46, .2, Math.PI - .2, 10), 3, 3, CUT); flicks(x0 - 50, 240, x0 + 50, 290, 4, Math.PI / 2, 26, 3, 1620 + i); } });
      for (let i = 0; i <= n; i++) { const x = i * 160; taper([[x, 300], [x, 352]], 4, 4, INK); shape(P([[x - 13, 350], [x + 13, 350], [x + 18, 404], [x - 18, 404]], 1700 + i, 2), CUT, 4); hline(x - 15, x + 15, 362, 3, 3, INK, 1720 + i, 1); }
    });
  }

  chapter('p2', 35.0, 59.5, [
    [35.0, drop],
    [41.95, ellenIn],
    [T_BLOW, pour],
    [56.0, snip],
  ]);
})();
