// Outro cameo (Bob's note): Bob from Satisfied Mind walks across the nave floor in front of the night window,
// dragging his toy piano on a rope with three Juno statuettes clattering behind it on strings. He stops under the
// bare daisy roundel, looks up at it, lifts his hat to it (his Fool-card hat lift), and walks on out of the right edge.
//
// His drawing is COPIED (not loaded) from bobwiseman-satisfied-mind js/tarot/core.js (printer) and js/tarot/figures.js
// (person, stride, handPos, piano, rope, juno, junoTrail, pianoBack), unchanged except: wrapped in this closure so the
// names don't collide with the glass kit, person/head/hat/leg/arm trimmed to the branches he uses (no goth, skirt,
// coat, parasol, cane, platform, beard; the shapes he does use are line for line), and junoTrail takes a
// per-statuette hop function (beat hops).
// It is printed the Satisfied Mind way (colour stencils off register + a black key block, ink mottle and paper tooth),
// cut out on its cream card stock, then lit by the moon. Times in timing.js (OB, OB_BEATS). Pure function of t.
const OUTRO_BOB = (() => {
  // ---------- copied from satisfied-mind js/tarot/core.js ----------
  const COL = {
    red: '#c8392b', yellow: '#eab52e', blue: '#4f7dbd', navy: '#22408a', flesh: '#f1c29a',
    green: '#5c9a4f', white: '#ffffff', ink: '#1a1410', pale: '#cfe0ee', brown: '#a8673a',
    black: '#2e2733', gold: '#d6a632', purple: '#6c4188', ghost: '#f6efe6', plum: '#5a1f3c', grey: '#9a9692', orange: '#e57f2c',
  };
  const q8 = (t) => Math.floor(t * 8 + 1e-6) / 8; // woodcut puppets move on 8 fps steps
  function noiseTile(size, cells, seed) {
    const R = mulberry(seed), g = mkCanvas(cells * 3, cells * 3), gg = g.getContext('2d'), id = gg.createImageData(cells * 3, cells * 3);
    const v = []; for (let i = 0; i < cells * cells; i++) v.push(R() * 255);
    for (let y = 0; y < cells * 3; y++) for (let x = 0; x < cells * 3; x++) { const k = v[(y % cells) * cells + (x % cells)]; id.data.set([k, k, k, 255], (y * cells * 3 + x) * 4); }
    gg.putImageData(id, 0, 0);
    const big = mkCanvas(size * 3, size * 3), bg = big.getContext('2d'); bg.imageSmoothingEnabled = true; bg.imageSmoothingQuality = 'high';
    bg.drawImage(g, 0, 0, size * 3, size * 3);
    const out = mkCanvas(size, size); out.getContext('2d').drawImage(big, size, size, size, size, 0, 0, size, size);
    return out.getContext('2d').getImageData(0, 0, size, size).data;
  }
  let STOCK, MOTTLE, TOOTH;
  function buildTextures() { // STOCK, MOTTLE, TOOTH exactly as Satisfied Mind (the green CLOTH is not needed)
    const S = 512, R = mulberry(7);
    const nA = noiseTile(S, 6, 11), nB = noiseTile(S, 24, 12), nC = noiseTile(S, 64, 13);
    STOCK = mkCanvas(S, S); { const g = STOCK.getContext('2d'), id = g.createImageData(S, S), d = id.data;
      for (let i = 0; i < S * S; i++) {
        const m = (nA[i * 4] / 255 - .5) * 18 + (nB[i * 4] / 255 - .5) * 10 + (R() - .5) * 12;
        d[i * 4] = 238 + m; d[i * 4 + 1] = 222 + m * .95; d[i * 4 + 2] = 184 + m * .8; d[i * 4 + 3] = 255;
      }
      g.putImageData(id, 0, 0); g.lineCap = 'round';
      for (let i = 0; i < 500; i++) {
        const x = R() * S, y = R() * S, l = 4 + R() * 16, a = R() * TAU;
        g.strokeStyle = R() < .5 ? 'rgba(130,100,60,.13)' : 'rgba(255,250,235,.35)'; g.lineWidth = .6 + R() * .8;
        g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
      }
      for (let i = 0; i < 26; i++) { const x = R() * S, y = R() * S, r = 1 + R() * 4; g.fillStyle = `rgba(150,95,45,${.08 + R() * .16})`; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
    }
    MOTTLE = mkCanvas(S, S); { const g = MOTTLE.getContext('2d'), id = g.createImageData(S, S), d = id.data;
      for (let i = 0; i < S * S; i++) {
        const x = i % S, y = (i / S) | 0, streak = Math.sin(y * .55 + n1(5, x / 37) * 3 + nA[i * 4] / 30) * .5 + .5;
        let a = clamp((nB[i * 4] / 255 - .5) * 1.2) * .22 + clamp((nC[i * 4] / 255 - .62) * 2) * .12 + streak * streak * .1;
        if (R() < .012) a = Math.max(a, .5 + R() * .5);
        d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = 255; d[i * 4 + 3] = a * 255;
      }
      g.putImageData(id, 0, 0);
    }
    TOOTH = mkCanvas(S, S); { const g = TOOTH.getContext('2d'), id = g.createImageData(S, S), d = id.data;
      for (let i = 0; i < S * S; i++) {
        let a = clamp((nC[i * 4] / 255 - .72) * 3.5) * .6;
        if (R() < .06) a = Math.max(a, .55 + R() * .45);
        d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = 255; d[i * 4 + 3] = a * 255;
      }
      g.putImageData(id, 0, 0);
    }
  }
  const I = [1, 0, 0, 1, 0, 0];
  const mul = (m, n) => [m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1], m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3], m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5]];
  const T = (x, y) => [1, 0, 0, 1, x, y];
  const Rm = (r) => [Math.cos(r), Math.sin(r), -Math.sin(r), Math.cos(r), 0, 0];
  const Sm = (sx, sy = sx) => [sx, 0, 0, sy, 0, 0];
  const chain = (...ms) => ms.reduce((a, b) => mul(a, b), I);
  const ap = (m, pts) => pts.map(([x, y]) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]]);
  const ap1 = (m, x, y) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
  function circ(cx, cy, r, n = 28, ry = r, a0 = 0) { const p = []; for (let i = 0; i < n; i++) { const a = a0 + i / n * TAU; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * ry]); } return p; }
  function arc(cx, cy, r, a0, a1, n = 16, ry = r) { const p = []; for (let i = 0; i <= n; i++) { const a = lerp(a0, a1, i / n); p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * ry]); } return p; }
  function rectP(x, y, w, h) { return [[x, y], [x + w, y], [x + w, y + h], [x, y + h]]; }
  function spline(pts, closed = true, k = 6) {
    const n = pts.length, out = [], P = (i) => closed ? pts[(i + n) % n] : pts[clamp(i, 0, n - 1)];
    const last = closed ? n : n - 1;
    for (let i = 0; i < last; i++) {
      const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
      for (let j = 0; j < k; j++) {
        const u = j / k, u2 = u * u, u3 = u2 * u;
        out.push([0, 1].map((c) => .5 * (2 * p1[c] + (-p0[c] + p2[c]) * u + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * u2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * u3)));
      }
    }
    if (!closed) out.push(pts[n - 1]);
    return out;
  }
  function densify(pts, step = 10, closed = true) {
    const out = [], n = pts.length, m = closed ? n : n - 1;
    for (let i = 0; i < m; i++) {
      const a = pts[i], b = pts[(i + 1) % n], L = Math.hypot(b[0] - a[0], b[1] - a[1]), k = Math.max(1, Math.ceil(L / step));
      for (let j = 0; j < k; j++) out.push([lerp(a[0], b[0], j / k), lerp(a[1], b[1], j / k)]);
    }
    if (!closed) out.push(pts[n - 1]);
    return out;
  }
  function rough(pts, seed, amp = 2, f = .035) {
    return pts.map(([x, y]) => [x + amp * n1(seed, x * f + y * f * .71), y + amp * n1(seed + 3.3, y * f - x * f * .63)]);
  }
  const PR = { c: null, l: null, off: {}, lw: 1 };
  function pathOn(g, pts, o = [0, 0]) { g.moveTo(pts[0][0] + o[0], pts[0][1] + o[1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0] + o[0], pts[i][1] + o[1]); g.closePath(); }
  function knock(pts) { const l = PR.l; l.save(); l.globalCompositeOperation = 'destination-out'; l.globalAlpha = 1; l.fillStyle = '#000'; l.beginPath(); pathOn(l, pts); l.fill(); l.restore(); }
  function pfill(col, pts, erase = true) {
    const g = PR.c, o = PR.off[col] || [0, 0];
    if (erase) knock(pts);
    g.fillStyle = COL[col] || col; g.beginPath(); pathOn(g, pts, o); g.fill();
  }
  function strokePoly(pts, w, seed, closed) {
    const n = pts.length; if (n < 2) return null;
    const s = [0]; for (let i = 1; i < n; i++) s.push(s[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const L = s[n - 1] + (closed ? Math.hypot(pts[0][0] - pts[n - 1][0], pts[0][1] - pts[n - 1][1]) : 0);
    const left = [], right = [];
    for (let i = 0; i < n; i++) {
      const a = pts[closed ? (i - 1 + n) % n : Math.max(0, i - 1)], b = pts[closed ? (i + 1) % n : Math.min(n - 1, i + 1)];
      let dx = b[0] - a[0], dy = b[1] - a[1]; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
      let ww = w * (.62 + .76 * (n1(seed, s[i] / 46) * .5 + .5));
      if (!closed) ww *= Math.min(1, .3 + s[i] / (w * 2.6), .3 + (L - s[i]) / (w * 2.6));
      left.push([pts[i][0] - dy * ww / 2, pts[i][1] + dx * ww / 2]); right.push([pts[i][0] + dy * ww / 2, pts[i][1] - dx * ww / 2]);
    }
    return [left, right];
  }
  function pline(pts, w = 4, seed = 1, closed = false) {
    const g = PR.l, r = strokePoly(pts, w * PR.lw, seed, closed); if (!r) return;
    g.fillStyle = COL.ink; g.beginPath();
    if (closed) { pathOn(g, r[0]); pathOn(g, r[1]); g.fill('evenodd'); }
    else { pathOn(g, r[0].concat(r[1].reverse())); g.fill(); }
  }
  function part(m, ctrl, o = {}) {
    const seed = o.seed || 1, sm = o.smooth !== false, closed = o.closed !== false;
    let base = sm ? spline(ctrl, closed, o.k || 6) : densify(ctrl, o.step || 14, closed);
    const lp = ap(m, rough(base, seed, o.lamp == null ? 1.6 : o.lamp));
    if (o.fill) { if (closed) knock(lp); pfill(o.fill, ap(m, rough(base, seed + 101, o.famp == null ? 3 : o.famp)), false); }
    if (o.line !== 0) pline(lp, o.line || 4, seed, closed);
  }
  function lineP(m, ctrl, w = 3, seed = 1, sm = true) { const b = sm && ctrl.length > 2 ? spline(ctrl, false, 6) : densify(ctrl, 10, false); pline(ap(m, rough(b, seed, 1.3)), w, seed, false); }
  function hatch(m, region, ang, sp, w, seed, cover = 1) {
    const g = PR.l, reg = ap(m, region);
    g.save(); g.beginPath(); pathOn(g, reg); g.clip();
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const [x, y] of region) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, R = Math.hypot(x1 - x0, y1 - y0) / 2 + 4, ca = Math.cos(ang), sa = Math.sin(ang);
    let k = 0;
    for (let d = -R; d <= R; d += sp, k++) {
      if (rnd(seed, k, 5) > cover) continue;
      const l0 = -R * (.5 + rnd(seed, k) * .5), l1 = R * (.5 + rnd(seed, k, 2) * .5);
      const p = [[cx + ca * l0 - sa * d, cy + sa * l0 + ca * d], [cx + ca * l1 - sa * d, cy + sa * l1 + ca * d]];
      pline(ap(m, rough(densify(p, 14, false), seed + k, 1.1)), w, seed + k * 7, false);
    }
    g.restore();
  }

  // ---------- copied from satisfied-mind js/tarot/figures.js ----------
  function inkFill(pts) { const g = PR.l; g.fillStyle = COL.ink; g.beginPath(); pathOn(g, pts); g.fill(); }
  function leg(m, col, seed, shoe = true, o = {}) {
    part(m, [[-14, -4], [14, -4], [13, 60], [12, 116], [-11, 116], [-13, 60]], { fill: col, seed, line: 3.6, k: 3 });
    if (o.stripes) for (let y = 14; y < 100; y += 14) part(m, [[-14, y], [14, y], [14, y + 6], [-14, y + 6]], { fill: o.stripes, seed: seed + y, line: 1.6, smooth: false, famp: 1 });
    else lineP(m, [[-2, 30], [1, 70], [-1, 100]], 1.8, seed + 9);
    if (shoe) { const s = spline([[-12, 112], [10, 110], [30, 118], [28, 128], [-12, 128]], true, 4); inkFill(ap(m, rough(s, seed + 5, 1.2))); }
  }
  function arm(m, col, seed, hand = true, skin = 'flesh') {
    part(m, [[-11, -6], [11, -6], [10, 48], [9, 88], [-9, 88], [-10, 48]], { fill: col, seed, line: 3.4, k: 3 });
    lineP(m, [[-9, 70], [9, 72]], 2.2, seed + 3, false);
    if (hand) part(m, [[-8, 88], [8, 88], [12, 100], [4, 112], [-8, 108], [-12, 98]], { fill: skin, seed: seed + 7, line: 2.8, k: 3 });
  }
  function head(m, o, seed) {
    const skin = o.skin || 'flesh';
    part(m, [[-8, -16], [8, -16], [9, 4], [-9, 4]], { fill: skin, seed: seed + 1, line: 2.6, smooth: false });
    part(m, [[-20, -30], [-4, -50], [16, -48], [26, -30], [27, -12], [20, 2], [6, 6], [-12, -2], [-22, -14]], { fill: skin, seed: seed + 2, line: 3.4 });
    if (o.eyesShut) lineP(m, [[9, -25], [14, -23], [19, -25]], 2.4, seed + 4); else {
      lineP(m, [[8, -26], [14, -29], [20, -26]], 2.2, seed + 4); inkFill(ap(m, circ(14.5, -25, 2.6, 8)));
    }
    lineP(m, [[6, -35], [14, -37], [22, -34]], 2.4, seed + 5);
    lineP(m, [[21, -30], [29, -16], [21, -13]], 2.4, seed + 6, false);
    lineP(m, [[12, -4], [20, -5]], 2.2, seed + 7, false);
    lineP(m, [[-6, -26], [-11, -22], [-10, -14], [-5, -12]], 2.2, seed + 8);
    for (let i = 0; i < 3; i++) lineP(m, [[-18 + i * 3, -34 + i * 6], [-14 + i * 3, -24 + i * 6]], 1.5, seed + 30 + i, false);
  }
  function hat(m, o, seed) { // his red brimmed hat
    part(m, [[-18, -44], [-16, -76], [0, -82], [20, -78], [22, -44]], { fill: o.hatCol || 'red', seed: seed + 1, line: 3.4 });
    part(m, [[-40, -44], [-10, -50], [30, -50], [48, -42], [20, -36], [-20, -36]], { fill: o.hatCol || 'red', seed: seed + 2, line: 3.4 });
    lineP(m, [[-16, -52], [22, -54]], 3, seed + 3, false);
  }
  // the man (person() with the goth/skirt/coat/parasol/cane branches he never uses left out)
  function person(o) {
    const seed = o.seed || 10, dir = o.dir || 1, s = o.s || 1;
    const m = chain(T(o.x, o.y), Sm(s * dir, s), T(0, 0));
    const legA = o.legA || [0, 0], armA = o.armA || [.08, .08];
    const hip = [0, -126];
    const U = m;
    const shB = [-22, -230], shF = [20, -230];
    const handF = ap1(Rm(-armA[1]), 0, 100);
    let stickA, stickB;
    if (o.bundle === 'stick') {
      stickA = [shF[0] + handF[0], shF[1] + handF[1]]; stickB = [stickA[0] - 120, stickA[1] - 200];
      part(U, [[stickB[0] - 30, stickB[1] - 6], [stickB[0] - 12, stickB[1] - 30], [stickB[0] + 18, stickB[1] - 24], [stickB[0] + 30, stickB[1] + 4], [stickB[0] + 12, stickB[1] + 30], [stickB[0] - 22, stickB[1] + 26]], { fill: 'red', seed: seed + 60, line: 3.6 });
      lineP(U, [[stickB[0] - 8, stickB[1] - 26], [stickB[0], stickB[1] - 38], [stickB[0] + 10, stickB[1] - 26]], 2.6, seed + 61);
      for (let i = 0; i < 3; i++) inkFill(ap(U, circ(stickB[0] - 12 + i * 12, stickB[1] + 2 + (i % 2) * 8, 3, 6)));
    }
    const skin = o.skin || 'flesh';
    leg(chain(m, T(hip[0] - 8, hip[1]), Rm(-legA[0])), o.legs || 'yellow', seed + 1, true, o);
    arm(chain(U, T(shB[0], shB[1]), Rm(-armA[0])), o.sleeve || 'red', seed + 2, true, skin);
    leg(chain(m, T(hip[0] + 8, hip[1]), Rm(-legA[1])), o.legs || 'yellow', seed + 4, true, o);
    part(U, [[-30, -240], [0, -246], [30, -240], [34, -180], [44, -112], [0, -102], [-42, -112], [-34, -180]], { fill: o.tunic || 'blue', seed: seed + 5, line: 4 });
    part(U, [[-36, -156], [36, -156], [37, -144], [-37, -144]], { fill: o.belt || 'yellow', seed: seed + 6, line: 2.6, smooth: false });
    lineP(U, [[-6, -240], [-12, -108]], 1.8, seed + 7, false); lineP(U, [[16, -236], [26, -112]], 1.8, seed + 8, false);
    hatch(U, [[-34, -140], [-4, -140], [-6, -106], [-40, -112]], .9, 7, 1.6, seed + 9, .8);
    if (o.bundle === 'stick') lineP(U, [stickB, [lerp(stickB[0], stickA[0], .5), lerp(stickB[1], stickA[1], .5) - 4], [stickA[0] + 14, stickA[1] + 6]], 5, seed + 62);
    const hm = chain(U, T(2, -244), Rm(-(o.tilt || 0)));
    head(hm, o, seed + 40);
    if (!o.hatInHand) hat(hm, o, seed + 50);
    else part(hm, [[-22, -40], [-6, -54], [16, -52], [26, -36], [6, -42], [-8, -36]], { fill: 'brown', seed: seed + 49, line: 3 });
    arm(chain(U, T(shF[0], shF[1]), Rm(-armA[1])), o.sleeve || 'red', seed + 11, true, skin);
    if (o.hatInHand) { const h = [shF[0] + handF[0], shF[1] + handF[1]]; hat(chain(U, T(h[0] + 4, h[1] + 52), Rm(-.3)), o, seed + 50); }
  }
  function stride(t, amp = .34) {
    const ph = Math.floor(t * 8 + 1e-6) % 4, a = [amp, 0, -amp, 0][ph];
    return { legA: [a, -a], armA: [-a * .8 + .06, a * .8 + .06], bob: ph % 2 ? 0 : -3 };
  }
  function handPos(o, which = 0) {
    const s = o.s || 1, dir = o.dir || 1, sitDrop = 0;
    const armA = o.armA || [.08, .08], sh = which ? [20, -230] : [-22, -230];
    const h = ap1(Rm(-armA[which]), 0, 104);
    return ap1(chain(T(o.x, o.y), Sm(s * dir, s), T(0, sitDrop)), sh[0] + h[0], sh[1] + h[1]);
  }
  function piano(x, y, s, tilt, hookDir = 1, seed = 1800) {
    const m = chain(T(x, y), Rm(tilt), Sm(s));
    for (const wx of [-60, 60]) { part(m, circ(wx, -9, 9, 10), { fill: 'black', seed: seed + wx, line: 2.4 }); lineP(m, [[wx, -18], [wx, -24]], 3, seed + wx + 1, false); }
    part(m, rectP(-80, -176, 160, 152), { fill: 'brown', seed: seed + 1, line: 4.2, smooth: false, step: 20 });
    part(m, rectP(-88, -190, 176, 16), { fill: 'brown', seed: seed + 2, line: 3.6, smooth: false, step: 20 });
    hatch(m, rectP(-76, -172, 18, 144), 1.4, 7, 1.4, seed + 3, .9); hatch(m, rectP(58, -172, 18, 144), 1.4, 7, 1.4, seed + 4, .9);
    part(m, rectP(-56, -160, 112, 46), { fill: 'yellow', seed: seed + 5, line: 2.8, smooth: false, step: 16 });
    lineP(m, [[-40, -134], [-24, -150], [-6, -134], [10, -150], [28, -134], [42, -146]], 2.2, seed + 6);
    part(m, rectP(-84, -104, 168, 22), { fill: 'white', seed: seed + 7, line: 3, smooth: false, step: 14 });
    for (let k = 1; k < 14; k++) lineP(m, [[-84 + k * 12, -104], [-84 + k * 12, -83]], 1.3, seed + 10 + k, false);
    for (let k = 0; k < 13; k++) { const n = k % 7; if (n === 2 || n === 6) continue; const bx = -84 + (k + 1) * 12 - 3.5; inkFill(ap(m, rectP(bx, -104, 7, 12))); }
    part(m, rectP(-80, -82, 160, 8), { fill: 'brown', seed: seed + 8, line: 2.4, smooth: false, step: 20 });
    part(m, rectP(-60, -66, 120, 34), { fill: 'brown', seed: seed + 9, line: 2.4, smooth: false, step: 20 });
    for (const px of [-12, 12]) part(m, rectP(px - 5, -32, 10, 6), { fill: 'yellow', seed: seed + 30 + px, line: 1.6, smooth: false });
    const hk = [hookDir * 84, -70];
    part(m, circ(hk[0], hk[1], 6, 8), { line: 2.4, seed: seed + 40 });
    return ap1(m, hk[0], hk[1]);
  }
  function rope(a, b, sag = 22, seed = 1850) {
    const pts = []; for (let k = 0; k <= 8; k++) { const u = k / 8; pts.push([lerp(a[0], b[0], u), lerp(a[1], b[1], u) + Math.sin(Math.PI * u) * sag]); }
    pline(ap(I, rough(pts, seed, 1)), 3.4, seed, false);
  }
  function juno(x, y, s, rot, seed = 1900) {
    const m = chain(T(x, y), Rm(rot), Sm(s));
    part(m, rectP(-16, -10, 32, 10), { fill: 'black', seed: seed + 1, line: 2.2, smooth: false, step: 10 });
    part(m, rectP(-11, -18, 22, 8), { fill: 'black', seed: seed + 2, line: 2, smooth: false, step: 8 });
    part(m, [[-5, -18], [5, -18], [4, -46], [16, -78], [11, -80], [3, -56], [0, -60], [-3, -56], [-11, -80], [-16, -78], [-4, -46]], { fill: 'gold', seed: seed + 3, line: 2.2, smooth: false, step: 8, famp: 1 });
    part(m, circ(0, -66, 5.5, 8), { fill: 'gold', seed: seed + 4, line: 2, famp: .6 });
    lineP(m, [[-2, -40], [-3, -24]], 1.2, seed + 5, false);
  }
  // hop: a number (as Satisfied Mind) or a function i -> extra lift for each statuette (the beat hops here)
  function junoTrail(back, gx, t, moving, hop = 0, seed = 1950, n = 3) {
    const step = Math.floor(t * 8 + 1e-6);
    for (let i = 0; i < n; i++) {
      const [x, y, s] = gx(i);
      const k = step + i * 3;
      const rot = moving ? [.0, .5, -.4, 1.1, -.9, .25][k % 6] * (i % 2 ? -1 : 1) : [1.45, -1.4, 1.5][i];
      const lift = (moving && k % 2 ? 9 + (i % 2) * 5 : 0) + (typeof hop === 'function' ? hop(i) : hop * (1 - i * .15));
      juno(x, y - lift * s, s, rot, seed + i * 10);
      const tie = ap1(chain(T(x, y - lift * s), Rm(rot), Sm(s)), 0, -14);
      const pts = []; for (let k2 = 0; k2 <= 6; k2++) { const u = k2 / 6; pts.push([lerp(back[0], tie[0], u), lerp(back[1], tie[1], u) + Math.sin(Math.PI * u) * 10 * s]); }
      pline(rough(pts, seed + i, .6), 1.8, seed + 5 + i, false);
      if (moving && k % 2) for (let c = 0; c < 3; c++) { const a = -1.9 + c * .5; lineP(I, [[x + Math.cos(a) * 22 * s, y - 10 * s + Math.sin(a) * 22 * s], [x + Math.cos(a) * 34 * s, y - 10 * s + Math.sin(a) * 34 * s]], 1.8, seed + 40 + c + i, false); }
    }
  }
  const pianoBack = (x, y, s, tilt, hookDir = 1) => ap1(chain(T(x, y), Rm(tilt), Sm(s)), -hookDir * 80, -16);
  const MAN = { tunic: 'blue', sleeve: 'red', legs: 'yellow', hat: 'brim', hatCol: 'red', seed: 900 };
  const OFF = { red: [3, -5], yellow: [-3, 4], blue: [-5, 2], flesh: [3, 3], green: [4, -3], navy: [-4, 2], brown: [2, 4], pale: [-2, -3] }; // THE FOOL's register

  // ---------- staging in the nave ----------
  // Drawing space = Satisfied Mind figure units; world = drawing * BS. At the resting camera (scale .352) he is
  // ~380 px tall (hat to shoe), the piano ~210 px.
  const BS = 3.3, GY = 2900 / BS;         // the floor line he walks on (world y 2900, in front of the wall base at 2560)
  // world x: just off the left edge at the start; under the daisy, a little left of it so he looks up at it (screen
  // x ~1680 at rest); XEXIT: the last Juno (475 units behind him, plus its clank marks) is past the right edge
  const X0 = -950, XP = 3950, XEXIT = 6525;
  const DEC = .5, ACC = .4;               // seconds to slow to the stop / get going again
  const V = (XP - X0) / (OB.arrive - OB.in - DEC / 2);         // ~505 world units/s (~180 px/s at rest)
  const V2 = (XEXIT - XP) / (OB.out - OB.walkOn - ACC / 2);    // a touch brisker going off (~225 px/s)
  function manWX(t) {
    if (t <= OB.in) return X0;
    if (t < OB.arrive - DEC) return X0 + V * (t - OB.in);
    if (t < OB.arrive) { const u = t - (OB.arrive - DEC); return X0 + V * (OB.arrive - DEC - OB.in) + V * (u - u * u / (2 * DEC)); }
    if (t < OB.walkOn) return XP;
    const u = t - OB.walkOn; return XP + (u < ACC ? V2 * u * u / (2 * ACC) : V2 * (u - ACC / 2));
  }
  const walkingAt = (t) => t >= OB.in && (t < OB.arrive || t >= OB.walkOn);
  // the latest eighth-note beat at or before t (within w seconds)
  function beatAge(t, w = .4) { let a = 99; for (const b of OB_BEATS) { if (b <= t + 1e-6) a = t - b; else break; } return a < w ? a : 99; }

  let LC, LL, SIL, KK, PAT, built = false;
  function build() {
    if (built) return; built = true;
    LC = mkCanvas(); LL = mkCanvas(); SIL = mkCanvas(); KK = mkCanvas();
    PR.c = LC.getContext('2d'); PR.l = LL.getContext('2d');
    buildTextures();
    PAT = { stock: KK.getContext('2d').createPattern(STOCK, 'repeat'), mottle: PR.c.createPattern(MOTTLE, 'repeat'), tooth: PR.l.createPattern(TOOTH, 'repeat') };
  }
  const active = (t) => t >= OB.in && t < OB.walkOn + 6;

  // the scene in drawing units: returns the ground contacts (for shadows) and the man's x
  function scene(t) {
    const tq = q8(t), mx = manWX(tq) / BS, walking = walkingAt(tq);
    const S = walking ? stride(tq) : { legA: [.04, -.04], armA: [.1, .1], bob: 0 };
    const my = GY;
    let o = Object.assign({}, MAN, { x: mx, y: my + S.bob, dir: 1, legA: S.legA, armA: [walking ? -.7 : -.45, .55], bundle: 'stick' });
    // under the daisy: he looks up at it, lifts his hat to it (the Fool card's hat lift), puts it back, walks on
    let bundleDown = false;
    if (!walking && tq >= OB.arrive) {
      const look = tq >= OB.look && tq < OB.lookDown ? (tq < OB.look + .125 ? .2 : .42) : 0;
      const up = tq >= OB.hatUp && tq < OB.hatDown;
      o = Object.assign(o, { tilt: up ? .36 : look, armA: [-.45, up ? 2.7 : .55], bundle: up ? null : 'stick', hatInHand: up });
      bundleDown = up;
    }
    // the piano on its rope behind him, bumping on its casters on the 8 fps steps and jolting on the beat
    const ba = walking ? beatAge(tq) : 99, jolt = ba < .13 ? 1 : 0;
    const px = mx - 215, odd = Math.floor(tq * 8) % 2;
    const pY = GY + 2 + (walking && odd ? -3 : 0) - jolt * 8, pT = (walking ? [.02, -.02][odd] : 0) - jolt * .05;
    // the Junos hop on the beat, one after another down the string (8 fps steps)
    const hopFn = (i) => { if (!walking) return 0; const a = beatAge(tq - i * .125, .5); return a < .3 ? 30 * (1 - i * .15) * (a < .13 ? 1 : .45) : 0; };
    const jx = (i) => px - 128 - i * 66;
    junoTrail(pianoBack(px, pY, .95, pT), (i) => [jx(i), GY + 6, 1.3], tq, walking, hopFn);
    const hk = piano(px, pY, .95, pT, 1, 1800);
    rope(handPos(o, 0), hk, walking ? 10 : 26);
    person(o);
    if (bundleDown) { // his bundle, still tied on its stick, laid on the floor in front of him while his hand is busy
      // (the same red bundle with its knot and spots as on the stick, so it can't read as a second hat)
      const bx = mx + 78, by = my - 30, sB = [bx, by], sA = [bx + 112, my + 2];
      part(I, [[bx - 30, by - 6], [bx - 12, by - 30], [bx + 18, by - 24], [bx + 30, by + 4], [bx + 12, by + 30], [bx - 22, by + 26]], { fill: 'red', seed: o.seed + 60, line: 3.6 });
      lineP(I, [[bx - 8, by - 26], [bx, by - 38], [bx + 10, by - 26]], 2.6, o.seed + 61);
      for (let i = 0; i < 3; i++) inkFill(ap(I, circ(bx - 12 + i * 12, by + 2 + (i % 2) * 8, 3, 6)));
      lineP(I, [sB, [lerp(sB[0], sA[0], .5), lerp(sB[1], sA[1], .5) - 4], sA], 5, o.seed + 62);
    }
    return { mx, px, jx: [0, 1, 2].map(jx), walking };
  }

  // moonlight on the floor: a broad soft pool in front of the window that comes up as he walks in (world space, screen blend).
  // Draft 8: the window's late daylight lasts through his walk now, so the moon pool only comes up with the night.
  function poolAmt(t) { return ease(t, OB.in, OB.in + 3.5); }
  function drawPool(g, view, t, tod) {
    const a = poolAmt(t) * (tod ? tod.night : 1); if (a <= 0 || view.y1 < FLOOR_Y) return;
    g.save();
    const fl = new Path2D(); fl.rect(view.x0 - 50, FLOOR_Y + 10, view.x1 - view.x0 + 100, view.y1 - FLOOR_Y + 50); g.clip(fl);
    g.globalCompositeOperation = 'screen';
    g.translate(2500, GY * BS - 40); g.scale(1, .16);
    const rg = g.createRadialGradient(0, 0, 0, 0, 0, 3000);
    rg.addColorStop(0, `rgba(118,134,200,${.30 * a})`); rg.addColorStop(.55, `rgba(96,110,180,${.16 * a})`); rg.addColorStop(1, 'rgba(80,96,170,0)');
    g.fillStyle = rg; g.fillRect(-3200, -3200, 6400, 6400);
    g.restore();
  }

  // print the scene onto the layers, cut it out on its card stock, light it by the moon, composite under the camera
  function draw(g, t, cam, tod) {
    if (!active(t)) return;
    build();
    const k = cam.s * BS, M = new DOMMatrix([k, 0, 0, k, W / 2 - cam.x * cam.s, H / 2 - cam.y * cam.s]);
    const C_ = PR.c, L_ = PR.l, sg = SIL.getContext('2d'), kg = KK.getContext('2d');
    for (const x of [C_, L_, sg, kg]) { x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1; x.clearRect(0, 0, W, H); }
    C_.setTransform(M); L_.setTransform(M);
    PR.off = OFF;
    const st = scene(t);
    // contact shadows on the floor (world space, under the camera transform)
    g.save(); g.setTransform(M); g.globalCompositeOperation = 'multiply';
    const shadow = (x, w, a) => { g.save(); g.translate(x, GY + 4); g.scale(1, .16); const rg = g.createRadialGradient(0, 0, 0, 0, 0, w); rg.addColorStop(0, `rgba(10,10,20,${a})`); rg.addColorStop(1, 'rgba(10,10,20,0)'); g.fillStyle = rg; g.fillRect(-w, -w, 2 * w, 2 * w); g.restore(); };
    shadow(st.mx, 70, .55); shadow(st.px, 120, .55); st.jx.forEach((x) => shadow(x, 34, .4));
    g.restore();
    // silhouette = everything printed; card stock inside it
    sg.drawImage(LC, 0, 0); sg.drawImage(LL, 0, 0);
    kg.drawImage(SIL, 0, 0); kg.globalCompositeOperation = 'source-in';
    PAT.stock.setTransform(M.scale(1.5)); kg.fillStyle = PAT.stock; kg.fillRect(0, 0, W, H);
    // ink starvation and paper tooth (in drawing space, so they scale with him as on the cards)
    for (const [x, p] of [[C_, PAT.mottle], [L_, PAT.tooth]]) {
      x.save(); x.setTransform(M); p.setTransform(new DOMMatrix()); x.globalCompositeOperation = 'destination-out'; x.fillStyle = p;
      const inv = M.inverse(), a = inv.transformPoint(new DOMPoint(0, 0)), b = inv.transformPoint(new DOMPoint(W, H));
      x.fillRect(a.x, a.y, b.x - a.x, b.y - a.y); x.restore();
    }
    kg.globalCompositeOperation = 'multiply'; kg.drawImage(LC, 0, 0);
    kg.globalAlpha = .96; kg.drawImage(LL, 0, 0); kg.globalAlpha = 1;
    // moonlight: cool, brighter up top (the window is behind and above him), a touch brighter in the floor pool
    const pa = poolAmt(t), sx = M.transformPoint(new DOMPoint(st.mx, 0)).x, inPool = 1 - .35 * clamp(Math.abs(sx - 900) / 1500);
    const f = (.82 + .18 * pa) * (.88 + .12 * inPool);
    const top = M.transformPoint(new DOMPoint(0, GY - 340)).y, bot = M.transformPoint(new DOMPoint(0, GY + 10)).y;
    const lg = kg.createLinearGradient(0, top, 0, bot);
    let cTop = [214 * f, 222 * f, 255 * f], cLow = [150 * f, 160 * f, 214 * f];
    if (tod) { // draft 8: lit by the window's late warm light until night comes, then the moon as before
      const day = 1 - tod.night, w = mix([255, 250, 240], tod.col, .4), k = .84 + .16 * tod.I;
      cTop = mix(cTop, w.map((v) => v * k), day); cLow = mix(cLow, w.map((v) => v * k * .8), day);
    }
    lg.addColorStop(0, rgb(cTop)); lg.addColorStop(1, rgb(cLow));
    kg.fillStyle = lg; kg.fillRect(0, 0, W, H);
    kg.globalCompositeOperation = 'destination-in'; kg.drawImage(SIL, 0, 0);
    kg.globalCompositeOperation = 'source-over';
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
    g.drawImage(KK, 0, 0); g.restore();
  }
  return { draw, drawPool, active };
})();
