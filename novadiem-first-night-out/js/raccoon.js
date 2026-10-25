// First Night Out, the raccoons: a parent and its kit, our own drawing. Cut-paper puppets in profile, facing right.
// After Leon Lin's paper-fox (MIT, Copyright (c) 2026 Leonxlnx, notice in LICENSE-paper-fox.md), whose fox is the
// standard here; its drawing is not used, its methods are:
//   - fur (src/elements/fox-paint.js tuft, castGroup, furRows): each part is one smooth cut-out under rows of torn,
//     pointed, many-tipped tufts with quill bases, laid from the rump toward the head so every row laps over the one
//     behind it, each row casting one soft shadow on the row beneath, the tips breaking the outline;
//   - the tail (fox.js, fox-paint.js paintTailSegment): three long segments along a curved spine, drawn over the
//     rump, each repeating its parent's sway later and bigger, with loose tufts laid over the root;
//   - the rig (fox.js, fox-rig.js): baked parts moved by a small bone hierarchy, breathing about the belly,
//     irregular twitches, a gait whose phase comes from distance, planted feet held still with two-bone IK, and the
//     cut edge and one drop shadow on the composed silhouette only.
// The raccoon drawing, its mask and rings, the split spine and the four-legged gait are ours.
//
// RAC.make('parent' | 'kit') returns one rig: { build(res, light), pose(st), draw(ctx, x, groundY, st, opts),
// setGait(d0, d1) }. st: { d (distance walked), t, walk (0 standing .. 1 walking), paw (0..1, the near front paw
// lifted to test something), pat (0..1, its fingers tapping), look (head up < 0 < down), sniff (0..1), settle
// (seconds since stopping, or -1) }.
const RAC = (() => {
  const { clamp, lerp, ss, E, noise, sprite, surface, polyPath, smoothPath, ellipsePts, tear, hashString } = PD;

  const COL = {
    fur: ['#2b2a30', '#38363d', '#46444b', '#55525a', '#646069', '#757079', '#878189', '#9a939a', '#aea6aa', '#c1b9b9'],
    warm: ['#5b5049', '#6f6259', '#83766b'],
    base: '#4e4b53', leg: '#5a5760', dark: '#25232a', paw: '#1f1d23',
    mask: '#0f0e12', core: '#efe7d6', white: '#e8e1d4', whiteShade: '#cbc3b8', crown: '#6f6b73', brow: '#5b5860', bridge: '#38353c',
    ear: '#625f68', earIn: '#29272d', nose: '#0d0c10', iris: '#3a2820', pupil: '#050405', glint: '#fff4dc',
    ringLight: ['#a1998f', '#aea59a', '#938b83'], ringDark: ['#26252b', '#302e35'],
  };
  const shade = (hex, k = .74) => { const n = parseInt(hex.slice(1), 16); const f = (v) => Math.round(clamp(v * k, 0, 255)).toString(16).padStart(2, '0'); return '#' + f(n >> 16 & 255) + f(n >> 8 & 255) + f(n & 255); };

  // The kit is drawn at its own size, not scaled down, so its paper grain and torn edges match the parent's.
  //   b body, h head, sn snout length (on top of h), l legs, tl tail, tw tail width, ear and eye on top of h,
  //   fluff tuft size on top of b, crouch how bent the hind legs are at rest, LC stride, lift swing height,
  //   breathT breath period (s), bounce how much the body rocks and bobs.
  const SPEC = {
    parent: { b: 1, h: 1, sn: 1, l: 1, tl: 1, tw: 1, ear: 1, eye: 1, fluff: 1, crouch: .84, LC: 150, lift: [22, 26], breathT: 3.1, bounce: 1 },
    kit: { b: .56, h: .76, sn: .74, l: .54, tl: .58, tw: 1.15, ear: 1.24, eye: 1.42, fluff: 1.25, crouch: .8, LC: 90, lift: [15, 17], breathT: 2.2, bounce: 1.35 },
  };

  // ---------------- shared helpers ----------------
  function chaikin(pts, it = 2, closed = false) {
    for (let k = 0; k < it; k++) {
      const o = closed ? [] : [pts[0]], n = pts.length, m = closed ? n : n - 1;
      for (let i = 0; i < m; i++) { const a = pts[i], b = pts[(i + 1) % n]; o.push([a[0] * .75 + b[0] * .25, a[1] * .75 + b[1] * .25], [a[0] * .25 + b[0] * .75, a[1] * .25 + b[1] * .75]); }
      if (!closed) o.push(pts[n - 1]);
      pts = o;
    }
    return pts;
  }
  function chainLine(joints, n = 6) {
    const out = [];
    for (let j = 0; j < joints.length - 1; j++) for (let i = 0; i < n; i++) { const u = i / n; out.push([lerp(joints[j][0], joints[j + 1][0], u), lerp(joints[j][1], joints[j + 1][1], u)]); }
    out.push(joints[joints.length - 1]);
    return chaikin(out, 3);
  }
  // a tube along a centreline, width(u) for u in 0..1, round caps unless switched off (from the musician)
  function tube(cl, width, { capStart = true, capEnd = true } = {}) {
    const n = cl.length, L = [], R = [];
    for (let i = 0; i < n; i++) {
      const a = cl[Math.max(0, i - 1)], b = cl[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1;
      const w = width(i / (n - 1)) / 2, nx = -dy / d, ny = dx / d;
      L.push([cl[i][0] + nx * w, cl[i][1] + ny * w]); R.push([cl[i][0] - nx * w, cl[i][1] - ny * w]);
    }
    const cap = (p, c, k) => { const out = [], r = Math.hypot(p[0] - c[0], p[1] - c[1]), a0 = Math.atan2(p[1] - c[1], p[0] - c[0]); for (let i = 1; i < k; i++) { const a = a0 + Math.PI * i / k; out.push([c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r]); } return out; };
    const endPts = capEnd ? cap(L[n - 1], cl[n - 1], 8) : [], startPts = capStart ? cap(R[0], cl[0], 8) : [];
    return polyPath([...L, ...endPts, ...R.reverse(), ...startPts]);
  }
  function offsetLine(cl, off) {
    const n = cl.length;
    return cl.map((p, i) => { const a = cl[Math.max(0, i - 1)], b = cl[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, o = off(i / (n - 1)); return [p[0] - dy / d * o, p[1] + dx / d * o]; });
  }
  const angOf = (a, b) => Math.atan2(b[1] - a[1], b[0] - a[0]);
  const piecewise = (u, a, b, c) => u < .5 ? lerp(a, b, u * 2) : lerp(b, c, u * 2 - 1);
  const Rot = (a, x, y) => [Math.cos(a) * x - Math.sin(a) * y, Math.sin(a) * x + Math.cos(a) * y];
  const xf = (M, p) => { const r = M.transformPoint(new DOMPoint(p[0], p[1])); return [r.x, r.y]; };
  // two-bone IK (paper-fox fox-rig.js ik2): the middle joint for root a, end c, bones l1 l2; bend picks the side
  function ik2(a, c, l1, l2, bend) {
    const dx = c[0] - a[0], dy = c[1] - a[1], d = Math.hypot(dx, dy) || 1e-6;
    const dc = Math.min(Math.max(d, Math.abs(l1 - l2) + 1e-3), l1 + l2 - 1e-3);
    const A = Math.acos(clamp((l1 * l1 + dc * dc - l2 * l2) / (2 * l1 * dc), -1, 1));
    const ang = Math.atan2(dy, dx) + bend * A;
    return [a[0] + Math.cos(ang) * l1, a[1] + Math.sin(ang) * l1];
  }
  // irregular twitches (paper-fox fox.js twitches): a damped wobble at hashed times, some skipped
  function twitch(t, key, every, amp, skip = .3) {
    const seed = hashString(key) & 0xffff, k0 = Math.floor(t / every); let v = 0;
    for (let k = k0 - 1; k <= k0; k++) {
      if (PD.hash2(k, 3, seed) < skip) continue;
      const dt = t - (k + .15 + .6 * PD.hash2(k, 7, seed)) * every;
      if (dt >= 0 && dt < 1.4) v += amp * Math.exp(-dt * 4.5) * Math.sin(dt * 20);
    }
    return v;
  }

  // ---------------- fur (after paper-fox fox-paint.js) ----------------
  // A torn fur tuft: a cluster of pointed tips on one shared base, the base at the origin, the tips toward (0, -len),
  // the base narrowing upstream like a quill so an uncovered base reads as a strip coming out from under the coat.
  function tuftShape(R, len, width, { tips = [2, 3], notch = [.14, .3], bulge = .2, spread = .72, teeth = .15 } = {}) {
    const k = R.int(tips[0], tips[1]), T = [];
    for (let i = 0; i < k; i++) {
      const u = k === 1 ? 0 : (i / (k - 1)) * 2 - 1;
      const L = len * (1 - Math.abs(u) * R.range(.1, .36)) * R.range(.86, 1.04);
      T.push([u * width * spread + R.range(-.12, .12) * width, -L]);
    }
    const sw = width * (1 + bulge), bw = width * R.range(.55, .7);
    const pts = [[bw, 0], [bw * .3, len * .2], [0, len * .28], [-bw * .3, len * .2], [-bw, 0]];
    const side = (sg, tip) => {
      const s0 = [sg * sw * R.range(.92, 1.02), -len * R.range(.2, .28)];
      const s1 = [sg * lerp(sw, Math.abs(tip[0]), .35) * R.range(.95, 1.03), -len * R.range(.5, .58)];
      const out = [s0, s1];
      if (R.chance(teeth)) {
        const f = R.range(.3, .5), p = [lerp(s1[0], tip[0], f), lerp(s1[1], tip[1], f)];
        out.push(p, [p[0] + sg * width * R.range(.16, .26), p[1] - len * R.range(.08, .13)], [p[0] - sg * width * .1, p[1] - len * .04]);
      }
      return out;
    };
    pts.push(...side(-1, T[0]));
    for (let i = 0; i < k; i++) {
      pts.push(T[i]);
      if (i < k - 1) { const a = T[i], c = T[i + 1]; pts.push([lerp(a[0], c[0], R.range(.38, .62)), Math.max(a[1], c[1]) + len * R.range(notch[0], notch[1])]); }
    }
    pts.push(...side(1, T[k - 1]).reverse());
    return pts;
  }
  // the tuft's points with its root at (x, y), pointing along angle a, shrunk by sx about the root
  const placeTuft = (local, x, y, a, sx = 1) => { const r = a + Math.PI / 2, c = Math.cos(r), s = Math.sin(r); return local.map(([px, py]) => [x + (px * c - py * s) * sx, y + (px * s + py * c) * sx]); };
  function inside(poly, x, y) {
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i], [xj, yj] = poly[j];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c;
    }
    return c;
  }
  function edgeDist(poly, x, y) {
    let m = Infinity;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [ax, ay] = poly[j], [bx, by] = poly[i], dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy || 1;
      const u = clamp(((x - ax) * dx + (y - ay) * dy) / L);
      m = Math.min(m, Math.hypot(x - ax - u * dx, y - ay - u * dy));
    }
    return m;
  }
  const overflow = (poly, pts) => { let m = 0; for (const [x, y] of pts) if (!inside(poly, x, y)) m = Math.max(m, edgeDist(poly, x, y)); return m; };
  const area = (pts) => { let s = 0; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) s += (pts[j][0] - pts[i][0]) * (pts[j][1] + pts[i][1]); return s / 2; };
  // Lay one row of tufts: first one soft contact shadow for the whole row, cast downstream onto the row beneath (so
  // the pieces of one row cast nothing on each other), then the tufts with a little torn edge and a faint bevel.
  function layRow(g, row, { light, k = 1, ink = 'rgba(12,8,20,.55)', blur = 3, drop = 2.6 } = {}) {
    if (!row.length) return;
    const res = g.__res || 1, p = new Path2D();
    for (const tf of row) {
      const dx = Math.cos(tf.a) * drop * k, dy = Math.sin(tf.a) * drop * k + .6 * k, q = area(tf.pts) < 0 ? tf.pts.slice().reverse() : tf.pts;
      q.forEach(([x, y], i) => (i ? p.lineTo(x + dx, y + dy) : p.moveTo(x + dx, y + dy))); p.closePath();
    }
    g.save(); g.filter = `blur(${blur * k * res / 2}px)`; g.fillStyle = ink; g.fill(p); g.restore();
    for (const tf of row) {
      const path = polyPath(tear(tf.pts, { amp: .55 * k, freq: .45 / k, fine: .45 * k, seed: tf.seed, step: 1.8 * k }));
      g.fillStyle = tf.fill; g.fill(path);
      PD.bevel(g, path, { light, width: 1 * k, hi: .14, lo: .2 });
    }
  }
  // an open curve sampled by arc length: at(u) -> { p, a (tangent angle), n (left normal) }
  function curve(pts) {
    const P = chaikin(pts, 3), L = [0];
    for (let i = 1; i < P.length; i++) L.push(L[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
    const total = L[L.length - 1];
    const at = (u) => {
      const s = clamp(u, -.2, 1.2) * total;
      let i = 1; while (i < P.length - 1 && L[i] < s) i++;
      const a = P[i - 1], c = P[i], f = (s - L[i - 1]) / (L[i] - L[i - 1] || 1), ang = Math.atan2(c[1] - a[1], c[0] - a[0]);
      return { p: [a[0] + (c[0] - a[0]) * f, a[1] + (c[1] - a[1]) * f], a: ang, n: [Math.sin(ang), -Math.cos(ang)] };
    };
    return { at, total };
  }

  function make(kind) {
    const S = SPEC[kind], { b, h, l, tl } = S, fl = b * S.fluff;
    const nz = noise('rac:' + kind), seedOf = (s) => hashString(kind + ':' + s);
    // ---------------- skeleton (authored px, ground at y 0, the body frame's origin at the hip joint) ----------------
    const L1 = 80 * l, L2 = 74 * l, FL1 = 56 * l, FL2 = 52 * l;
    const FEET = [   // near hind, far hind, near front, far front: a lateral-sequence walk (NH, NF, FH, FF)
      { front: false, near: true, o: .75, heel: 10 * l, toe: 34 * l, ank: 10 * l, anchor: 0, lift: S.lift[0] },
      { front: false, near: false, o: .25, heel: 10 * l, toe: 34 * l, ank: 10 * l, anchor: 6 * b, lift: S.lift[0] },
      { front: true, near: true, o: .5, heel: 6 * l, toe: 24 * l, ank: 12 * l, anchor: 172 * b, lift: S.lift[1] },
      { front: true, near: false, o: 0, heel: 6 * l, toe: 24 * l, ank: 12 * l, anchor: 178 * b, lift: S.lift[1] },
    ];
    const HIPY = -(10 * l + (L1 + L2) * S.crouch);
    // the spine bends at SPINE: the rump (and tail, hind legs) hangs off the hip, the shoulders, neck and head off the
    // spine joint, so the back flexes and the rump rocks with each hind step
    const SPINE = [100 * b, -30 * b], SHO = [172 * b, 40 * b], NECK = [208 * b, 10 * b], BELLY = [80 * b, 22 * b];
    const DUTY = .75;
    let LC = S.LC, PH0 = 0;
    // a pear: the big rump high over the hind legs, the back falling to low shoulders, the belly slung low
    const BODY = chaikin([[-30, 66], [-60, 34], [-68, -6], [-58, -46], [-32, -76], [8, -88], [52, -82], [98, -64], [142, -40], [180, -16], [208, 0],
      [226, 18], [228, 44], [214, 66], [186, 74], [140, 80], [90, 86], [40, 84], [0, 78]].map(([x, y]) => [x * b, y * b]), 3, true);
    // top and bottom of the body at x
    const scanY = (x) => {
      let lo = Infinity, hi = -Infinity;
      for (let i = 0, j = BODY.length - 1; i < BODY.length; j = i++) {
        const [ax, ay] = BODY[j], [bx, by] = BODY[i];
        if ((ax <= x) !== (bx <= x)) { const y = ay + (by - ay) * (x - ax) / (bx - ax); lo = Math.min(lo, y); hi = Math.max(hi, y); }
      }
      return lo === Infinity ? null : [lo, hi];
    };
    // the tail's spine leaves the croup and falls away behind; widths along it; the dark rings and the black tip
    const TAIL = [-36 * b, -70 * b];
    const TC = curve([[0, 0], [-46, 0], [-94, 10], [-140, 28], [-178, 54], [-204, 84]].map(([x, y]) => [TAIL[0] + x * tl, TAIL[1] + y * tl]));
    const TW = (u) => 28 * tl * S.tw * (.42 + .58 * ss(0, .3, u)) * (1 - .6 * ss(.74, 1.02, u));
    const TU = [0, .36, .69, 1];
    const RINGS = [[.16, .25], [.34, .43], [.52, .61], [.7, .79], [.87, 1.2]];
    const ringAt = (u) => RINGS.findIndex(([a, c]) => u >= a && u < c);
    // head points: everything ahead of the eye socket stretches with the snout
    const hp = (x, y) => [(x <= 40 ? x : 40 + (x - 40) * S.sn) * h, y * h];
    const HP = (pts) => pts.map(([x, y]) => hp(x, y));
    const EARS = { F: { at: [24, -40], rest: -.12 }, N: { at: [6, -36], rest: -.34 } };

    // ---------------- drawing ----------------
    const parts = {}, swatch = {};
    function makeSwatch(name, col, mat) {
      const { canvas, ctx } = surface(256, 256);
      ctx.fillStyle = col; ctx.fillRect(0, 0, 256, 256);
      PD.applyTexture(canvas, { res: 1, mat, seed: seedOf('sw:' + name) });
      swatch[name] = canvas;
    }
    function build(res, light) {
      const mk = (name, box, draw, opts = {}) => { parts[name] = sprite({ ...box, res, draw, light, mat: opts.mat ?? 'paper', seed: kind + ':' + name, edge: false, shadow: false }); };
      const soft = (g, a = .3, k = 1) => PD.setShadow(g, { color: `rgba(20,14,24,${a})`, blur: 4 * k, x: 1 * k, y: 2 * k });
      for (const [n, c] of [['legN', COL.leg], ['legF', shade(COL.leg)], ['darkN', COL.dark], ['darkF', shade(COL.dark, .8)]]) makeSwatch(n, c, 'paper');
      // soft light and shade laid over a painted base, as blurred paper overlays (paper-fox softSpots)
      const spots = (g, list) => {
        for (const [x, y, rx, ry, col] of list) {
          g.save(); g.globalCompositeOperation = 'source-atop'; g.filter = `blur(${Math.max(rx, ry) * .5 * (g.__res || 1)}px)`;
          g.fillStyle = col; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 7); g.fill(); g.restore();
        }
      };

      // ---- the coat: one smooth cut-out, then rows of tufts from the rump to the neck ----
      // Each row is a cross-section of the body; its tufts point back toward the tail along the flow of the fur (up
      // the slope of the back, hanging under the belly, down over the rump) and the top and bottom ones reach past
      // the outline. Tones: a darker saddle along the spine, light upper flanks, the belly darker, the haunch and the
      // shoulder each lit on top and darker at their front edge, grizzled with the odd pale or dark tuft.
      const HAUNCH = [-14 * b, 6 * b, 60 * b], SHOUL = [176 * b, 34 * b, 42 * b];
      const toneOf = (x, y, s, R) => {
        let v = 5.6 - 3.2 * clamp(1 - s / .2) - 2.2 * ss(.62, 1, s) + .7 * (1 - s);
        for (const [cx, cy, r] of [HAUNCH, SHOUL]) {
          const d = Math.hypot(x - cx, y - cy) / r;
          if (d < 1.15) v += .9 * (1 - d) * clamp(.5 + (cy - y) / r) - 1.4 * ss(.8, 1, d) * ss(1.15, 1, d) * (x > cx ? 1 : .3);
        }
        v += R.range(-.8, .8);
        if (R.chance(.1)) v += 2.2; else if (R.chance(.07)) v -= 2.2;
        return COL.fur[clamp(Math.round(v), 0, 9)];
      };
      function coat(g, x0, x1, light) {
        const R = new PD.RNG(seedOf('coat' + x0)), step = 19 * fl;
        for (let x = -72 * b; x <= 230 * b; x += step) {
          if (x < x0 || x >= x1) { R.next(); continue; }
          const tb = scanY(x), tb2 = scanY(x - 12 * b);
          if (!tb || !tb2) continue;
          const [ty, by] = tb, aTop = Math.atan2(tb2[0] - ty, -12 * b), aBot = Math.atan2(tb2[1] - by, -12 * b);
          const n = Math.max(2, Math.round((by - ty) / (17 * fl))), row = [];
          for (let j = 0; j <= n; j++) {
            const s = clamp((j + R.range(-.25, .25)) / n, .03, .97);
            const rx = x + R.range(-4, 4) * b, ry = lerp(ty + 3 * b, by - 3 * b, s);
            let a = lerp(aTop + .1, aBot - .5, s) - .2 * Math.sin(Math.PI * s) + R.range(-.12, .12);
            a = lerp(a, Math.PI * .5 + .45, ss(-12 * b, -66 * b, x) * .75 * (.4 + .6 * s));        // the rump: fur runs down
            const len = 40 * fl * (1 + .18 * ss(70 * b, -40 * b, x)) * lerp(1, .68, ss(150 * b, 226 * b, x)) * (s > .85 ? .8 : 1) * R.range(.85, 1.1);
            const local = tuftShape(R, len, len * .4, { tips: [2, 4] });
            let pts = placeTuft(local, rx, ry, a), k = 1;
            while (overflow(BODY, pts) > 7 * b && k > .4) { k *= .85; pts = placeTuft(local, rx, ry, a, k); }
            row.push({ pts, a, fill: toneOf(rx, ry, s, R), seed: R.int(1, 99999), y: ry });
          }
          row.sort((p, q) => q.y - p.y);                                                   // upper tufts lap over lower
          layRow(g, row, { light, k: b });
        }
      }
      // the rump: everything behind the spine joint, its coat running under the shoulders' first rows
      mk('rear', { x: -110 * b, y: -125 * b, w: 260 * b, h: 240 * b }, (g) => {
        g.save(); g.beginPath(); g.rect(-200 * b, -200 * b, 335 * b, 400 * b); g.clip();
        g.fillStyle = COL.base; g.fill(polyPath(BODY));
        spots(g, [[-10 * b, -50 * b, 70 * b, 40 * b, 'rgba(200,205,225,.22)'], [60 * b, 75 * b, 110 * b, 22 * b, 'rgba(6,4,14,.4)']]);
        coat(g, -100 * b, 100 * b, light);
        g.restore();
      });
      // the shoulders and chest: from the spine joint forward; its first rows lap back over the rump's coat
      mk('front', { x: 50 * b, y: -110 * b, w: 220 * b, h: 220 * b }, (g) => {
        // a ragged join, not a straight cut, so no seam shows where the first rows don't reach
        const Rj = new PD.RNG(seedOf('join')), join = [[400 * b, -200 * b], [400 * b, 200 * b], [108 * b, 200 * b]];
        for (let y = 120 * b; y > -140 * b; y -= 9 * b) join.push([(108 + (Math.round(y / (9 * b)) & 1 ? 9 : -2) + Rj.range(-3, 3)) * b, y]);
        join.push([108 * b, -200 * b]);
        g.save(); g.clip(polyPath(join));
        g.fillStyle = COL.base; g.fill(polyPath(BODY));
        spots(g, [[170 * b, 0, 50 * b, 30 * b, 'rgba(200,205,225,.18)'], [150 * b, 80 * b, 70 * b, 18 * b, 'rgba(6,4,14,.4)']]);
        g.restore();
        coat(g, 100 * b, 260 * b, light);
        // the throat and chest, paler tufts hanging down and back
        const R = new PD.RNG(seedOf('chest')), row = [];
        for (let i = 0; i < 6; i++) {
          const y = (14 + i * 9) * b, x = (scanY(220 * b) ? 218 : 214) * b - i * 2 * b, a = Math.PI * .5 + .7 + R.range(-.15, .15), len = 30 * fl * R.range(.85, 1.1);
          row.push({ pts: placeTuft(tuftShape(R, len, len * .42, { tips: [2, 3] }), x, y, a), a, fill: COL.fur[R.int(6, 8)], seed: R.int(1, 99999), y });
        }
        layRow(g, row.sort((p, q) => q.y - p.y), { light, k: b });
      });

      // ---- the tail: three segments along a curved spine, rings feathered by the tufts that cross them ----
      const ringFill = (u, R) => { const r = ringAt(u); return r < 0 ? COL.ringLight[R.int(0, 2)] : r === RINGS.length - 1 ? COL.paw : COL.ringDark[R.int(0, 1)]; };
      const band = (u0, u1, k = 1, n = 28) => {
        const L = [], Rt = [];
        for (let i = 0; i <= n; i++) { const u = lerp(u0, u1, i / n), f = TC.at(u), w = TW(u) * k; L.push([f.p[0] + f.n[0] * w, f.p[1] + f.n[1] * w]); Rt.push([f.p[0] - f.n[0] * w, f.p[1] - f.n[1] * w]); }
        return [...L, ...Rt.reverse()];
      };
      for (let i = 0; i < 3; i++) {
        const u0 = TU[i], u1 = TU[i + 1], pts = band(Math.max(0, u0 - .03), u1 + .05, 1.6, 12);
        const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
        const bx0 = Math.min(...xs) - 30 * tl, by0 = Math.min(...ys) - 30 * tl;
        mk('tail' + i, { x: bx0, y: by0, w: Math.max(...xs) - bx0 + 30 * tl, h: Math.max(...ys) - by0 + 30 * tl }, (g) => {
          const R = new PD.RNG(seedOf('tail' + i));
          const body = polyPath(band(Math.max(0, u0 - .02), Math.min(1, u1 + .02), .82));
          g.fillStyle = COL.ringLight[0]; g.fill(body);
          g.save(); g.clip(body);
          for (const [a, c] of RINGS) if (c > u0 - .05 && a < u1 + .05) { g.fillStyle = c > 1 ? COL.paw : COL.ringDark[0]; g.fill(polyPath(band(a, Math.min(1.02, c), 1.2))); }
          g.restore();
          // tip first, so each row toward the root laps over the next; the outer tufts of a row splay out, so the
          // rows read as chevrons down the tail and the rings come out feathered
          const step = 15 * tl / TC.total, rows = [];
          for (let u = Math.min(.97, u1 + .01); u > Math.max(.02, u0 - .005); u -= step) rows.push(u);
          for (const u of rows) {
            const f = TC.at(u), w = TW(u), m = w > 18 * tl ? 4 : 3, row = [];
            for (let j = 0; j < m; j++) {
              const v = m === 1 ? 0 : (j / (m - 1)) * 2 - 1 + R.range(-.15, .15);
              const rx = f.p[0] + f.n[0] * w * v * .62, ry = f.p[1] + f.n[1] * w * v * .62;
              const a = f.a - v * .42 + R.range(-.1, .1), len = (24 + 14 * Math.sin(Math.PI * clamp(u * 1.2))) * tl * R.range(.88, 1.1) * (u > .9 ? 1.25 : 1);
              row.push({ pts: placeTuft(tuftShape(R, len, len * .38, { tips: [2, 3] }), rx, ry, a), a, fill: ringFill(u + len * .45 / TC.total, R), seed: R.int(1, 99999), y: -Math.abs(v) });
            }
            row.sort((p, q) => p.y - q.y);                                                // middle tufts on top
            layRow(g, row, { light, k: tl });
          }
        });
      }
      // loose rump tufts laid over the tail's root, so the tail grows out of the coat
      mk('croup', { x: TAIL[0] - 70 * b, y: TAIL[1] - 50 * b, w: 140 * b, h: 120 * b }, (g) => {
        const R = new PD.RNG(seedOf('croup')), row = [];
        for (let i = 0; i < 7; i++) {
          const x = TAIL[0] + (18 - i * 6) * b + R.range(-3, 3) * b, y = TAIL[1] + (-6 + i * 5) * b, a = Math.PI + .25 - i * .12 + R.range(-.1, .1), len = 36 * fl * R.range(.85, 1.05);
          row.push({ pts: placeTuft(tuftShape(R, len, len * .42, { tips: [2, 4] }), x, y, a), a, fill: COL.fur[R.int(3, 6)], seed: R.int(1, 99999), y });
        }
        layRow(g, row.sort((p, q) => q.y - p.y), { light, k: b });
      });

      // paws: dark, the front ones little hands with long fingers, the hind ones long flat feet
      for (const far of [false, true]) {
        const k = far ? 'F' : 'N', c = (x) => far ? shade(x, .78) : x;
        mk('hand' + k, { x: -14 * l, y: -12 * l, w: 50 * l, h: 32 * l }, (g) => {
          const P = (pts) => pts.map(([x, y]) => [x * l, y * l]);
          g.fillStyle = c(COL.paw);
          g.fill(smoothPath(P([[-8, -8], [7, -8], [12, 2], [14, 9], [4, 13], [-7, 12], [-10, 2]]), .6));
          for (let j = 0; j < 4; j++) g.fill(smoothPath(ellipsePts((13 + j * 4.2) * l, (8.5 + j * .7) * l, 7 * l, 2.9 * l, 12, .3 + j * .08)));
          g.fill(smoothPath(ellipsePts(-1 * l, 9 * l, 5 * l, 2.6 * l, 10, -.5)));   // the thumb, behind
        }, { mat: 'smooth' });
        mk('foot' + k, { x: -16 * l, y: -12 * l, w: 64 * l, h: 28 * l }, (g) => {
          const P = (pts) => pts.map(([x, y]) => [x * l, y * l]);
          g.fillStyle = c(COL.paw);
          g.fill(smoothPath(P([[-8, -8], [6, -6], [18, 0], [30, 3], [36, 7], [37, 10], [-10, 10], [-13, 2]]), .6));
          for (let j = 0; j < 4; j++) g.fill(smoothPath(ellipsePts((30 + j * 3.4) * l, (7 + j * .5) * l, 6 * l, 3 * l, 12, .2)));
        }, { mat: 'smooth' });
      }

      // the head: a ruff of tufts behind the cheek over the neck, grey skull and snout, white brows, cheeks and
      // muzzle, and the mask: one black torn scrap across the eyes with the white core of the paper at its torn edge
      mk('head', { x: -70 * h, y: -70 * h, w: (180 * S.sn + 80) * h, h: 140 * h }, (g) => {
        const tornPath = (pts, sd, amp = 1.4) => polyPath(tear(chaikin(HP(pts), 2, true), { amp: amp * h, freq: .16 / h, seed: seedOf(sd), step: 2.5 * h }));
        const R = new PD.RNG(seedOf('ruff')), ruff = [], RUFF = [[2, -36], [-10, -22], [-16, -4], [-14, 14], [-4, 28], [10, 36]];
        for (let i = 0; i < RUFF.length; i++) {
          const v = i / (RUFF.length - 1), [x, y] = hp(...RUFF[i]), a = Math.PI + .35 - v * 1.05 + R.range(-.1, .1), len = 30 * h * S.fluff * R.range(.85, 1.1);
          ruff.push({ pts: placeTuft(tuftShape(R, len, len * .42, { tips: [2, 4] }), x + 6 * h, y, a), a, fill: v > .5 ? COL.white : COL.fur[R.int(4, 6)], seed: R.int(1, 99999), y });
        }
        layRow(g, ruff.sort((p, q) => q.y - p.y), { light: [-.5, -.85], k: h });
        const skull = tornPath([[-8, -18], [2, -36], [22, -47], [50, -42], [74, -28], [96, -11], [110, 1], [114, 9], [109, 17], [92, 23], [70, 27], [46, 32], [22, 36], [4, 34], [-6, 26], [-10, 8]], 'skull', 1.6);
        g.save(); soft(g, .35, h); g.fillStyle = COL.crown; g.fill(skull); g.restore();
        g.save(); g.clip(skull);
        g.save(); soft(g, .25, h); g.fillStyle = COL.brow; g.fill(tornPath([[-4, -30], [22, -46], [52, -41], [72, -28], [50, -32], [24, -32], [6, -26]], 'cap')); g.restore();
        g.save(); soft(g, .3, h); g.fillStyle = COL.white;
        g.fill(tornPath([[-16, 6], [8, 0], [32, 4], [48, 16], [44, 30], [20, 37], [-4, 34], [-20, 26]], 'cheek', 2));
        g.fill(tornPath([[62, 2], [86, -6], [104, -1], [114, 8], [109, 18], [90, 23], [64, 22]], 'muzzle'));
        g.fill(tornPath([[24, -31], [50, -35], [74, -25], [93, -13], [89, -6], [70, -14], [48, -23], [26, -21]], 'brow'));
        g.restore();
        g.save(); soft(g, .2, h); g.fillStyle = COL.bridge; g.fill(tornPath([[82, -10], [100, -4], [112, 4], [104, 7], [92, 1], [78, -4]], 'bridge', 1)); g.restore();
        g.save(); soft(g, .35, h);
        PD.piece(g, HP([[2, -12], [22, -25], [44, -25], [66, -17], [91, -7], [95, 0], [78, 2], [64, 6], [54, 17], [40, 23], [22, 19], [8, 9]]),
          { fill: COL.mask, torn: { amp: 2.2 * h, freq: .17 / h, seed: seedOf('mask'), step: 2.5 * h }, rim: { color: COL.core, width: 2 * h } });
        g.restore();
        g.restore();
        // white cheek tufts flaring back from under the mask
        const ck = [];
        for (let i = 0; i < 4; i++) {
          const [x, y] = hp(8 - i * 5, 18 + i * 5), a = Math.PI - .35 - i * .14, len = 22 * h * S.fluff * R.range(.85, 1.1);
          ck.push({ pts: placeTuft(tuftShape(R, len, len * .42, { tips: [2, 3] }), x, y, a), a, fill: i % 2 ? COL.whiteShade : COL.white, seed: R.int(1, 99999), y });
        }
        layRow(g, ck.sort((p, q) => q.y - p.y), { light: [-.5, -.85], k: h, ink: 'rgba(12,8,20,.35)' });
        const e = S.eye * h, [ex, ey] = hp(56, -7);
        g.fillStyle = COL.iris; g.beginPath(); g.arc(ex, ey, 5.4 * e, 0, 7); g.fill();
        g.fillStyle = COL.pupil; g.beginPath(); g.arc(ex + .4 * e, ey, 4 * e, 0, 7); g.fill();
        g.fillStyle = COL.glint; g.beginPath(); g.arc(ex - 1.3 * e, ey - 1.7 * e, 1.5 * e, 0, 7); g.fill();
        const [nx, ny] = hp(111, 8);
        g.fillStyle = COL.nose; g.fill(smoothPath(ellipsePts(nx, ny, 7.5 * h, 5.6 * h, 14, .15)));
        g.fillStyle = 'rgba(255,244,220,.35)'; g.beginPath(); g.arc(nx - 2 * h, ny - 2.4 * h, 1.4 * h, 0, 7); g.fill();
        g.strokeStyle = 'rgba(16,14,18,.7)'; g.lineWidth = 1.5 * h; g.lineCap = 'round';
        g.beginPath(); g.moveTo(...hp(107, 16)); g.quadraticCurveTo(...hp(98, 21), ...hp(86, 21)); g.stroke();
        g.strokeStyle = 'rgba(239,231,214,.4)'; g.lineWidth = .9 * h;
        for (const [x2, y2] of [[132, 2], [134, 13], [128, 23]]) { g.beginPath(); g.moveTo(...hp(96, 11)); g.quadraticCurveTo(...hp((96 + x2) / 2, (11 + y2) / 2 - 3), ...hp(x2, y2)); g.stroke(); }
      });
      // ears: rounded, the white core at their torn rims
      const ek = h * S.ear;
      for (const far of [false, true]) {
        const k = far ? 'F' : 'N', c = (x) => far ? shade(x, .8) : x;
        mk('ear' + k, { x: -22 * ek, y: -42 * ek, w: 44 * ek, h: 50 * ek }, (g) => {
          const E2 = (pts) => pts.map(([x, y]) => [x * ek, y * ek]);
          PD.piece(g, E2([[-14, 3], [-15, -14], [-9, -28], [0, -34], [9, -30], [14, -16], [14, 3]]), { fill: c(COL.ear), torn: { amp: 1.3 * ek, freq: .2 / ek, seed: seedOf('ear' + k) }, rim: { color: COL.core, width: 2.2 * ek } });
          g.fillStyle = c(COL.earIn); g.fill(polyPath(tear(E2([[-8, 2], [-9, -12], [-4, -23], [2, -25], [7, -15], [8, 2]]), { amp: 1.1 * ek, freq: .25 / ek, seed: seedOf('earin' + k) })));
        });
      }
    }

    // ---------------- gait ----------------
    // a foot rolls on the heel at the strike (a < 0) and on the toe at push-off (a > 0); returns the ankle and angle
    function footAt(px, a, F) {
      if (a < 0) { const r = Rot(a, F.heel, -F.ank); return [px - F.heel + r[0], r[1], a]; }
      const r = Rot(a, -F.toe, -F.ank); return [px + F.toe + r[0], r[1], a];
    }
    // phase comes from distance, so a planted foot stays exactly where it landed while the body passes over it
    function foot(d, F, walk) {
      const w = d / LC + PH0 + F.o, n = Math.floor(w), u = w - n;
      const plant = (m) => (m + DUTY / 2 - PH0 - F.o) * LC + F.anchor;
      if (u < DUTY) {
        let a = 0;
        if (u < .08) a = -.14 * (1 - u / .08);
        else if (u > DUTY - .16) a = .45 * E.in((u - (DUTY - .16)) / .16);
        const f = footAt(plant(n), a * walk, F);
        return { x: f[0], y: f[1], a: f[2], u, stance: true };
      }
      const s = (u - DUTY) / (1 - DUTY);
      const A = footAt(plant(n), .45 * walk, F), B = footAt(plant(n + 1), -.14 * walk, F);
      return { x: lerp(A[0], B[0], E.sine(s)), y: lerp(A[1], B[1], s) - F.lift * Math.sin(Math.PI * s) * (1 - .3 * s),
        a: lerp(.45, -.14, ss(0, .75, s)) * walk + (F.front ? .7 : .25) * Math.sin(Math.PI * s) * walk, u, stance: false };
    }
    // Make a walk from d0 to d1 start and end with all four feet down: with a 75% duty the feet lift one at a time,
    // so phases on quarter cycles have every foot planted. The stride is nudged to a whole number of quarters.
    function setGait(d0, d1, quarter = 0) {
      const n = Math.max(1, Math.round(4 * (d1 - d0) / S.LC));
      LC = Math.abs(d1 - d0) > 1 ? 4 * (d1 - d0) / n : S.LC;
      PH0 = ((((-d0 / LC) % .25) + .25) % .25) + quarter * .25;
    }

    // ---------------- pose ----------------
    function pose(st) {
      const { d, t } = st, walk = st.walk ?? 0, paw = st.paw ?? 0, settle = st.settle ?? -1, bo = S.bounce * walk;
      const feet = FEET.map((F) => ({ F, ...foot(d, F, walk) }));
      const uNH = feet[0].u, uNF = feet[2].u;
      const bobH = Math.cos(4 * Math.PI * (uNH - DUTY / 2)), bobF = Math.cos(4 * Math.PI * (uNF - DUTY / 2));
      const breath = Math.sin(t / S.breathT * Math.PI * 2);
      const sway = nz.n1(t * .35) * 3 * b * (1 - walk) - 5 * b * paw;                         // weight shift when standing
      const hip = [d + sway, HIPY - 4.5 * l * bobH * bo + .8 * breath * b];
      // the body pitches with the bob of the hind and front feet; the rump rocks with each hind step (the waddle)
      const pitch = -4 * l * (bobF - bobH) / (172 * b) * bo - .035 * paw + .008 * nz.n1(t * .2 + 9);
      const hike = .05 * Math.sin(2 * Math.PI * uNH) * bo;
      const MR = new DOMMatrix().translate(hip[0], hip[1]).rotate((pitch + hike) * 180 / Math.PI)
        .translate(BELLY[0], BELLY[1]).scale(1 + .006 * breath, 1 + .013 * breath).translate(-BELLY[0], -BELLY[1]);
      // the back bends at the spine joint against the rump's rock, and lifts the shoulders when a paw comes up
      const bend = .06 * Math.sin(2 * Math.PI * uNF + 1.2) * bo - hike * .8 - .05 * paw + .015 * nz.n1(t * .4 + 2) * (1 - walk) + .006 * breath;
      const MF = MR.translate(SPINE[0], SPINE[1]).rotate(bend * 180 / Math.PI).translate(-SPINE[0], -SPINE[1]);
      const sho = xf(MF, SHO), neck = xf(MF, NECK);
      // the near front paw is the acting hand: an idle flick when standing, or lifted to test something, fingers tapping
      const flick = twitch(t, kind + 'hand', 5.3, 1, .25) * (1 - walk) * (1 - paw);
      const pat = (st.pat ?? 0) * Math.max(0, Math.sin(t * 9));
      const legs = feet.map((f, i) => {
        let ankle = [f.x, f.y], a = f.a;
        if (i === 2) {
          // lifted forward clear of the chest, where the hand can be seen working
          const up = [sho[0] + 96 * l, sho[1] + 32 * l + 6 * l * pat];
          ankle = [lerp(f.x, up[0], paw) - 1.5 * l * Math.abs(flick), lerp(f.y, up[1], paw) - 3 * l * Math.abs(flick)];
          a = f.a - .95 * paw + .35 * pat * paw - .22 * flick;
        }
        const root = f.F.front ? sho : hip;
        const mid = f.F.front ? ik2(root, ankle, FL1, FL2, 1) : ik2(root, ankle, L1, L2, -1);
        return { root, mid, ankle, a, F: f.F };
      });
      // head: a nod that trails the front steps, noise, a glance up now and then when standing, looking down at the
      // lifted paw, up to sniff the air
      const nodPh = 4 * Math.PI * (uNF - DUTY / 2) + 1.4;
      const headAng = .2 + .09 * Math.cos(nodPh) * bo + .045 * nz.n1(t * .45 + 3) - .1 * Math.max(0, nz.n1(t * .17 + 7)) * (1 - walk)
        + (st.look ?? 0) + .16 * paw + .03 * Math.sin(t * 26) * (st.sniff ?? 0);
      // ears flick at irregular times and lag the nod
      const ears = {
        F: EARS.F.rest + twitch(t, kind + 'earF', 4.9, .34) + .12 * Math.cos(nodPh - .9) * bo,
        N: EARS.N.rest + twitch(t, kind + 'earN', 3.6, .42) + .14 * Math.cos(nodPh - 1.2) * bo,
      };
      // tail: each segment repeats the sway of the one before it later and bigger; it rises a little and swings with
      // the waddle when walking, drifts when standing, settles with a damped swing after a stop
      const ph = 2 * Math.PI * uNH;
      const MT = []; let M = MR;
      for (let i = 0; i < 3; i++) {
        const r = (.05 + .045 * i) * Math.sin(ph - 1.1 - i * .9) * bo + (.03 + .025 * i) * Math.sin(t * 1.15 - i * .7) * (1 - walk)
          + .02 * (i + 1) * nz.n1(t * .9 + i * .5) - (i === 0 ? .1 * walk : 0)
          + (settle >= 0 ? (.05 + .04 * i) * Math.exp(-settle * 1.6) * Math.sin(settle * 6 - i * .8) : 0);
        const p = TC.at(TU[i]).p;
        M = M.translate(p[0], p[1]).rotate(r * 180 / Math.PI).translate(-p[0], -p[1]);
        MT.push(M);
      }
      return { hip, MR, MF, pitch, bend, legs, neck, headAng, ears, MT };
    }

    // ---------------- composing ----------------
    let buf = null, sbuf = null;
    const put = (g, s, x, y, ang = 0) => { g.save(); g.translate(x, y); if (ang) g.rotate(ang); g.drawImage(s.canvas, s.x, s.y, s.w, s.h); g.restore(); };
    const putM = (g, s, M) => { g.save(); g.setTransform(g.getTransform().multiply(M)); g.drawImage(s.canvas, s.x, s.y, s.w, s.h); g.restore(); };
    function drawParts(g, ps) {
      // a soft contact shadow is all that separates overlapping parts; canvas shadows are in device pixels
      const inner = (a) => { const k = Math.hypot(g.getTransform().a, g.getTransform().b); g.shadowColor = `rgba(16,10,22,${a})`; g.shadowBlur = 6 * k * b; g.shadowOffsetX = 1.5 * k * b; g.shadowOffsetY = 2.5 * k * b; };
      const noShadow = () => { g.shadowColor = 'rgba(0,0,0,0)'; };
      const leg = (L, k) => {
        const front = L.F.front;
        put(g, parts[(front ? 'hand' : 'foot') + k], L.ankle[0], L.ankle[1], L.a);
        const cl = chainLine([L.root, L.mid, L.ankle]);
        const wd = front ? (u) => piecewise(u, 46, 32, 21) * l : (u) => piecewise(u, 66, 42, 24) * l;
        const path = tube(cl, wd, { capEnd: false });
        const pat = g.createPattern(swatch['leg' + k], 'repeat');
        pat.setTransform(new DOMMatrix().translate(L.root[0], L.root[1]).rotate((angOf(L.root, L.mid) - Math.PI / 2) * 180 / Math.PI));
        g.fillStyle = pat; g.fill(path);
        const sh0 = g.shadowColor; noShadow();
        // the lower leg is dark, like the paw
        const from = Math.floor(cl.length * (front ? .5 : .58)), low = cl.slice(from), w0 = wd(from / (cl.length - 1));
        const dk = g.createPattern(swatch['dark' + k], 'repeat'); dk.setTransform(new DOMMatrix().translate(L.ankle[0], L.ankle[1]));
        g.fillStyle = dk; g.fill(tube(low, (u) => lerp(w0, wd(1), u) + 1.2 * l, { capStart: true, capEnd: false }));
        g.save(); g.clip(path); g.fillStyle = 'rgba(0,0,10,.25)'; g.fill(tube(offsetLine(cl, (u) => -wd(u) * .36), (u) => wd(u) * .4)); g.restore();
        g.shadowColor = sh0;
      };
      const [NH, FH, NF, FF] = ps.legs;
      // far legs, near legs (their tops under the body), the rump, the tail over the rump with loose tufts over its
      // root, the shoulders lapping over the rump, then the head
      leg(FH, 'F'); leg(FF, 'F');
      inner(.26); leg(NH, 'N'); leg(NF, 'N');
      inner(.32); putM(g, parts.rear, ps.MR);
      inner(.3); for (let i = 2; i >= 0; i--) putM(g, parts['tail' + i], ps.MT[i]);
      inner(.28); putM(g, parts.croup, ps.MR);
      inner(.12); putM(g, parts.front, ps.MF);
      const hm = new DOMMatrix().translate(ps.neck[0], ps.neck[1]).rotate((ps.pitch * .5 + ps.bend + ps.headAng) * 180 / Math.PI);
      g.save(); g.setTransform(g.getTransform().multiply(hm));
      noShadow(); put(g, parts.earF, ...hp(EARS.F.at[0], EARS.F.at[1]), ps.ears.F);
      inner(.3); g.drawImage(parts.head.canvas, parts.head.x, parts.head.y, parts.head.w, parts.head.h);
      inner(.24); put(g, parts.earN, ...hp(EARS.N.at[0], EARS.N.at[1]), ps.ears.N);
      g.restore();
      noShadow();
    }
    // Draw the raccoon at plane coords (x0, groundY) under ctx's current transform. The parts are composed in a
    // buffer just big enough; the lit and unlit cut edge goes on the whole silhouette at once, one soft shadow for
    // the whole body is cast behind, and the paper goes on top. scale enlarges about the ground; the gait runs on
    // d / scale so planted feet stay planted.
    function draw(ctx, x0, groundY, st, { shadow = [10, 6], shadowAlpha = .42, scale = 1, light = [-.5, -.85], edge = {} } = {}) {
      const m = ctx.getTransform().translate(x0, groundY).scale(scale), ps = pose({ ...st, d: st.d / scale });
      const k = Math.hypot(m.a, m.b);
      ctx.save(); ctx.setTransform(m);
      for (const L of ps.legs) {
        const lift = clamp(-(L.ankle[1] + L.F.ank) / 30);
        ctx.fillStyle = `rgba(8,8,20,${.34 * (1 - lift)})`;
        ctx.beginPath(); ctx.ellipse(L.ankle[0] + (L.F.front ? 8 : 12) * l, 2, (L.F.front ? 20 : 28) * l * (1 - lift * .4), 4.5 * l, 0, 0, 7); ctx.fill();
      }
      ctx.restore();
      const F = Math.max(b, h, tl);
      let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
      for (const [px, py] of [[ps.hip[0] - 400 * F, -360 * F], [ps.hip[0] + 460 * F, -360 * F], [ps.hip[0] - 400 * F, 40 * F], [ps.hip[0] + 460 * F, 40 * F]]) {
        const q = m.transformPoint(new DOMPoint(px, py)); x1 = Math.min(x1, q.x); y1 = Math.min(y1, q.y); x2 = Math.max(x2, q.x); y2 = Math.max(y2, q.y);
      }
      const bx = Math.floor(x1), by = Math.floor(y1), bw = Math.ceil(x2 - x1) + 2, bh = Math.ceil(y2 - y1) + 2;
      if (!buf || buf.canvas.width < bw || buf.canvas.height < bh) { buf = surface(bw, bh); sbuf = surface(Math.ceil(bw / 4), Math.ceil(bh / 4)); }
      const BW = buf.canvas.width, BH = buf.canvas.height, g = buf.ctx;
      g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, BW, BH);
      g.setTransform(new DOMMatrix([1, 0, 0, 1, -bx, -by]).multiply(m));
      drawParts(g, ps);
      g.setTransform(1, 0, 0, 1, 0, 0);
      PD.edgeLight(buf.canvas, { res: k, light, width: 2.4, hi: .5, lo: .36, soft: .5, hiColor: '#eef0ff', ...edge });
      const s = sbuf.ctx, SW = sbuf.canvas.width, SH = sbuf.canvas.height;
      s.setTransform(1, 0, 0, 1, 0, 0); s.clearRect(0, 0, SW, SH);
      s.filter = `blur(${2.2 * k}px)`; s.drawImage(buf.canvas, 0, 0, SW, SH); s.filter = 'none';
      s.globalCompositeOperation = 'source-in'; s.fillStyle = '#05050f'; s.fillRect(0, 0, SW, SH); s.globalCompositeOperation = 'source-over';
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha *= shadowAlpha; ctx.drawImage(sbuf.canvas, bx + shadow[0] * k, by + shadow[1] * k, SW * 4, SH * 4);
      ctx.restore();
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(buf.canvas, bx, by); ctx.restore();
      return ps;
    }
    return { kind, S, build, pose, draw, setGait, get LC() { return LC; }, get PH0() { return PH0; }, DUTY, FEET };
  }
  return { make, COL, SPEC };
})();
