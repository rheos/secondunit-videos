// First Night Out, the raccoons: a parent and its kit, our own drawing. Cut-paper puppets in profile, facing right.
// Rig ideas after paper-fox's fox (src/elements/fox.js, fox-rig.js; MIT, Copyright (c) 2026 Leonxlnx, notice in
// LICENSE-paper-fox.md), by way of the paper-depth musician (indieagent-paper-depth/js/musician.js, ours): baked
// paper parts moved by a small bone hierarchy and composed into one body, breathing as a scale about the belly,
// irregular twitches, follow-through as a chain that repeats its parent's sway later and bigger, a gait whose phase
// comes from distance, planted feet held still while the body passes over them with two-bone IK, and the cut edge
// and one drop shadow on the composed silhouette only. The drawing and the four-legged gait are ours.
//
// RAC.make('parent' | 'kit') returns one rig: { build(res, light), pose(st), draw(ctx, x, groundY, st, opts),
// setGait(d0, d1) }. st: { d (distance walked), t, walk (0 standing .. 1 walking), paw (0..1, the near front paw
// lifted to test something), pat (0..1, its fingers tapping), look (head up < 0 < down), sniff (0..1), settle
// (seconds since stopping, or -1) }.
const RAC = (() => {
  const { clamp, lerp, ss, E, noise, sprite, surface, polyPath, smoothPath, ellipsePts, tear, hashString } = PD;

  const COL = {
    fur: ['#38373e', '#46454c', '#55535a', '#646168', '#747074', '#86817f', '#99928e', '#aca49e'],
    leg: '#605d63', dark: '#2a282d', paw: '#242227',
    mask: '#100f13', core: '#efe7d6', white: '#e4ddd0', crown: '#76727a', brow: '#615e66', bridge: '#3a373e',
    ear: '#68656d', earIn: '#2b292f', nose: '#0d0c10', iris: '#3a2820', pupil: '#050405', glint: '#fff4dc',
    ringLight: ['#a59d96', '#ada59d'], ringDark: '#2b2a30',
  };
  const shade = (hex, k = .74) => { const n = parseInt(hex.slice(1), 16); const f = (v) => Math.round(clamp(v * k, 0, 255)).toString(16).padStart(2, '0'); return '#' + f(n >> 16 & 255) + f(n >> 8 & 255) + f(n & 255); };

  // The kit is drawn at its own size, not scaled down, so its paper grain and torn edges match the parent's.
  //   b body, h head, sn snout length (on top of h), l legs, tl tail, tw tail width, ear and eye on top of h,
  //   crouch how bent the hind legs are at rest, LC stride, lift swing height, breathT breath period (s).
  const SPEC = {
    parent: { b: 1, h: 1, sn: 1, l: 1, tl: 1, tw: 1, ear: 1, eye: 1, rings: 8, crouch: .84, LC: 150, lift: [20, 24], breathT: 3.1, fur: 3.4 },
    kit: { b: .56, h: .76, sn: .74, l: .54, tl: .56, tw: 1.12, ear: 1.24, eye: 1.42, rings: 6, crouch: .8, LC: 90, lift: [13, 15], breathT: 2.2, fur: 2.8 },
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

  function make(kind) {
    const S = SPEC[kind], { b, h, l, tl } = S;
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
    const SHO = [172 * b, 40 * b], NECK = [208 * b, 10 * b], BELLY = [80 * b, 22 * b], TAIL = [-54 * b, -44 * b];
    const RING = 28 * tl, DUTY = .75;
    let LC = S.LC, PH0 = 0;
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

      // the body: a torn outline, then the coat of torn scraps laid like shingles
      // a pear: the big rump high over the hind legs, the back falling to low shoulders, the belly slung low
      const BODY = [[-30, 66], [-60, 34], [-68, -6], [-58, -46], [-32, -76], [8, -88], [52, -82], [98, -64], [142, -40], [180, -16], [208, 0],
        [226, 18], [228, 44], [214, 66], [186, 74], [140, 80], [90, 86], [40, 84], [0, 78]].map(([x, y]) => [x * b, y * b]);
      const TOP = BODY.slice(2, 12);   // the line of the back, rump to nape
      const backY = (x) => {
        if (x <= TOP[0][0]) return TOP[0][1];
        for (let i = 0; i < TOP.length - 1; i++) if (x <= TOP[i + 1][0]) return lerp(TOP[i][1], TOP[i + 1][1], (x - TOP[i][0]) / (TOP[i + 1][0] - TOP[i][0]));
        return TOP[TOP.length - 1][1];
      };
      mk('torso', { x: -85 * b, y: -110 * b, w: 340 * b, h: 215 * b }, (g) => {
        const outline = polyPath(tear(chaikin(BODY, 3, true), { amp: S.fur * b, freq: .1 / b, fine: .9 * b, seed: seedOf('body'), step: 3 * b }));
        g.fillStyle = COL.fur[3]; g.fill(outline);
        // The coat: torn scraps laid like shingles, rows following the line of the back. Bottom rows first, so each
        // row laps over the one below; within a row back to front, since the fur lies toward the tail: each scrap laps
        // over the one behind it with a torn tuft trailing back and down, and most torn edges show the white core of
        // the paper. Lighter on the upper flank, a darker saddle along the spine, darker under the belly.
        const coat = (clip, key, lift = 0, scale = 1) => {
          g.save(); g.clip(clip);
          const rs = new PD.RNG(seedOf('coat' + key)), sx = 27 * b * scale, sy = 17 * b * scale, list = [];
          for (let r = -1; r < 13; r++) for (let x = -80 * b; x < 250 * b; x += sx * rs.range(.75, 1.15)) {
            const jx = x + rs.range(-6, 6) * b, jy = backY(jx) + (r + rs.range(-.35, .35)) * sy;
            if (jy > 95 * b) continue;
            list.push({ r, jx, jy, sd: rs.int(1, 99999) });
          }
          list.sort((p, q) => q.r - p.r || p.jx - q.jx);
          for (const { jx, jy, sd } of list) {
            const R = new PD.RNG(sd), w = R.range(26, 40) * b * scale, hh = R.range(19, 28) * b * scale, tuft = R.range(6, 13) * b * scale;
            const yk = clamp((jy - backY(jx)) / (150 * b)), xk = clamp(jx / (230 * b), -.3, 1);
            const v = 1.7 + 3.4 * (1 - yk) - 2.4 * clamp(1 - yk / .2) - .8 * xk + lift + R.range(-.9, .9);
            const sl = R.range(.05, .22), c = Math.cos(sl), s = Math.sin(sl);
            const raw = [[-.5, -.45], [-.1, -.55], [.35, -.5], [.52, -.1], [.45, .45], [0, .55], [-.5 - tuft / w, .5 + tuft / hh * .4], [-.56, .1]];
            const pts = raw.map(([u, v2]) => { const px = u * w * R.range(.9, 1.1), py = v2 * hh * R.range(.9, 1.1); return [jx + px * c - py * s, jy + px * s + py * c]; });
            if (R.chance(.6)) {
              g.save(); g.globalAlpha = .3; g.fillStyle = COL.core;
              g.fill(polyPath(tear(pts.map(([px, py]) => [px - 1.4 * b, py + 1.2 * b]), { amp: 2.2 * b, freq: .2 / b, seed: sd + 1 }))); g.restore();
            }
            g.save(); soft(g, .3, b); g.fillStyle = COL.fur[clamp(Math.round(v), 0, 7)];
            g.fill(polyPath(tear(pts, { amp: 1.9 * b, freq: .17 / b, seed: sd }))); g.restore();
          }
          g.restore();
        };
        coat(outline, 'body');
        // the haunch and the shoulder: the coat again, a little lighter, on a mass that casts a soft shadow on the
        // coat below it, so the body has its two masses without a pasted-on disc
        const mass = (pts, key, lift) => {
          const path = polyPath(tear(chaikin(pts.map(([x, y]) => [x * b, y * b]), 2, true), { amp: 2.6 * b, freq: .12 / b, seed: seedOf(key) }));
          g.save(); g.clip(outline); soft(g, .4, b * 1.4); g.fillStyle = COL.fur[4]; g.fill(path); g.restore();
          g.save(); g.clip(outline); coat(path, key, lift, .85); g.restore();
        };
        mass([[-58, 4], [-46, -34], [-12, -50], [24, -36], [40, 4], [34, 50], [4, 78], [-40, 70]], 'haunch', .7);
        mass([[134, 8], [158, -10], [192, -6], [214, 22], [212, 56], [186, 72], [152, 70], [132, 42]], 'shoulder', .4);
        // the throat and chest, paler
        g.save(); g.clip(outline); soft(g, .25, b); g.fillStyle = COL.fur[6];
        g.fill(polyPath(tear(chaikin([[200, 12], [226, 18], [230, 42], [216, 64], [198, 50]].map(([x, y]) => [x * b, y * b]), 2, true), { amp: 2 * b, freq: .15 / b, seed: seedOf('chest') })));
        g.restore();
      });

      // the tail: torn rings, alternating, the tip black. Each ring's tip-side end is its visible edge: a convex torn
      // arc with the white core showing, laid over the next ring.
      for (let i = 0; i < S.rings; i++) {
        const u = i / (S.rings - 1), w = 33 * tl * S.tw * lerp(.74, 1, ss(0, .35, u)) * (1 - .5 * ss(.6, 1, u)), L = RING;
        const dark = i % 2 === 1 || i === S.rings - 1, tip = i === S.rings - 1;
        const fill = dark ? COL.ringDark : COL.ringLight[(i >> 1) % 2];
        mk('ring' + i, { x: -.5 * L, y: -w - 10, w: 2.1 * L + w, h: 2 * w + 20 }, (g) => {
          const end = tip ? w * 1.1 : w * .42, pts = [[-.3 * L, -w * .9], [.4 * L, -w], [1.02 * L, -w * .96]];
          for (let k = 1; k < 8; k++) { const a = -Math.PI / 2 + Math.PI * k / 8; pts.push([1.02 * L + Math.cos(a) * end, Math.sin(a) * w * .96]); }
          pts.push([1.02 * L, w * .96], [.4 * L, w], [-.3 * L, w * .9], [-.36 * L, 0]);
          const path = PD.piece(g, pts, { fill, torn: { amp: (tip ? 2.4 : 2) * tl, freq: .16 / tl, seed: seedOf('ring' + i) }, rim: { color: COL.core, width: 1.6 * tl } });
          // form in paper: the upper third lighter, the lower third darker
          g.save(); g.clip(path);
          g.fillStyle = 'rgba(255,246,230,.1)'; g.fill(polyPath(tear([[-L, -w - 4], [2 * L, -w - 4], [2 * L, -w * .35], [-L, -w * .3]], { amp: 2 * tl, seed: seedOf('rhi' + i) })));
          g.fillStyle = 'rgba(0,0,8,.22)'; g.fill(polyPath(tear([[-L, w * .38], [2 * L, w * .32], [2 * L, w + 4], [-L, w + 4]], { amp: 2 * tl, seed: seedOf('rlo' + i) })));
          g.restore();
        });
      }

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

      // the head: grey skull and snout with cheek ruffs flaring back, white brows, cheeks and muzzle, and the mask:
      // one black torn scrap across the eyes with the white core of the paper at its torn edge
      mk('head', { x: -40 * h, y: -60 * h, w: (180 * S.sn + 40) * h, h: 110 * h }, (g) => {
        const tornPath = (pts, sd, amp = 1.4) => polyPath(tear(chaikin(HP(pts), 2, true), { amp: amp * h, freq: .16 / h, seed: seedOf(sd), step: 2.5 * h }));
        const skull = tornPath([[-8, -18], [2, -36], [22, -47], [50, -42], [74, -28], [96, -11], [110, 1], [114, 9], [109, 17], [92, 23], [70, 27], [46, 32], [22, 36], [4, 34], [-16, 32], [-8, 24], [-24, 20], [-12, 10], [-20, 0]], 'skull', 2);
        g.fillStyle = COL.crown; g.fill(skull);
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
        a: lerp(.45, -.14, ss(0, .75, s)) * walk + (F.front ? .55 : .2) * Math.sin(Math.PI * s) * walk, u, stance: false };
    }
    // Make a walk from d0 to d1 start and end with all four feet down: with a 75% duty the feet lift one at a time,
    // so phases on quarter cycles have every foot planted. The stride is nudged to a whole number of quarters.
    function setGait(d0, d1, quarter = 0) {
      const n = Math.max(1, Math.round(4 * (d1 - d0) / S.LC));
      LC = Math.abs(d1 - d0) > 1 ? 4 * (d1 - d0) / n : S.LC;
      PH0 = ((((-d0 / LC + quarter * .25) % .25) + .25) % .25) + quarter * .25;
    }

    // ---------------- pose ----------------
    function pose(st) {
      const { d, t } = st, walk = st.walk ?? 0, paw = st.paw ?? 0, settle = st.settle ?? -1;
      const feet = FEET.map((F) => ({ F, ...foot(d, F, walk) }));
      const uNH = feet[0].u, uNF = feet[2].u;
      const bobH = Math.cos(4 * Math.PI * (uNH - DUTY / 2)), bobF = Math.cos(4 * Math.PI * (uNF - DUTY / 2));
      const breath = Math.sin(t / S.breathT * Math.PI * 2);
      const sway = nz.n1(t * .35) * 2 * b * (1 - walk) - 4 * b * paw;                         // weight shift when standing
      const hip = [d + sway, HIPY - 2.5 * l * bobH * walk + .6 * breath * b];
      const pitch = -2.5 * l * (bobF - bobH) / (172 * b) * walk - .035 * paw + .006 * nz.n1(t * .2 + 9);
      const M = new DOMMatrix().translate(hip[0], hip[1]).rotate(pitch * 180 / Math.PI)
        .translate(BELLY[0], BELLY[1]).scale(1 + .005 * breath, 1 + .011 * breath).translate(-BELLY[0], -BELLY[1]);
      const P = (p) => { const r = M.transformPoint(new DOMPoint(p[0], p[1])); return [r.x, r.y]; };
      const sho = P(SHO), neck = P(NECK), tailRoot = P(TAIL);
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
        return { root, mid, ankle, a, F: f.F, lift: clamp(-(f.y + f.F.ank) / (f.F.lift || 1)) };
      });
      // head: a nod with the front steps, a little noise, looking down at the lifted paw, up to sniff the air
      const headAng = .2 + .05 * Math.cos(4 * Math.PI * (uNF - DUTY / 2) + .7) * walk + .025 * nz.n1(t * .5 + 3)
        + (st.look ?? 0) + .16 * paw + .025 * Math.sin(t * 26) * (st.sniff ?? 0);
      const ears = {
        F: EARS.F.rest + twitch(t, kind + 'earF', 6.3, .32) + .06 * Math.sin(4 * Math.PI * uNF) * walk,
        N: EARS.N.rest + twitch(t, kind + 'earN', 4.7, .4) + .07 * Math.sin(4 * Math.PI * uNF - .8) * walk,
      };
      // tail: each ring repeats the sway of the one before it later and bigger (paper-fox's tail chain); it rides the
      // hip bob when walking, drifts when standing, and settles with a damped swing after a stop
      const ph = 4 * Math.PI * (uNH - DUTY / 2);
      const tail = []; let p = tailRoot.slice();
      for (let i = 0; i < S.rings; i++) {
        const a = Math.PI - .78 + i * .13 + pitch + (.03 + .03 * i) * Math.sin(ph - i * .8) * walk
          + (.02 + .018 * i) * Math.sin(t * 1.3 - i * .55) * (1 - walk) + .012 * (i + 1) * nz.n1(t * 1.1 + i * .4)
          + (settle >= 0 ? (.04 + .03 * i) * Math.exp(-settle * 1.7) * Math.sin(settle * 6.5 - i * .7) : 0);
        tail.push({ p: p.slice(), a });
        p = [p[0] + Math.cos(a) * RING, p[1] + Math.sin(a) * RING];
      }
      return { hip, M, pitch, legs, neck, headAng, ears, tail };
    }

    // ---------------- composing ----------------
    let buf = null, sbuf = null;
    const put = (g, s, x, y, ang = 0) => { g.save(); g.translate(x, y); if (ang) g.rotate(ang); g.drawImage(s.canvas, s.x, s.y, s.w, s.h); g.restore(); };
    function drawParts(g, ps) {
      // a soft contact shadow is all that separates overlapping parts; canvas shadows are in device pixels
      const inner = (a) => { const k = Math.hypot(g.getTransform().a, g.getTransform().b); g.shadowColor = `rgba(16,10,22,${a})`; g.shadowBlur = 6 * k * b; g.shadowOffsetX = 1.5 * k * b; g.shadowOffsetY = 2.5 * k * b; };
      const noShadow = () => { g.shadowColor = 'rgba(0,0,0,0)'; };
      const leg = (L, k) => {
        const front = L.F.front;
        put(g, parts[(front ? 'hand' : 'foot') + k], L.ankle[0], L.ankle[1], L.a);
        const cl = chainLine([L.root, L.mid, L.ankle]);
        const wd = front ? (u) => piecewise(u, 44, 31, 21) * l : (u) => piecewise(u, 62, 40, 24) * l;
        const path = tube(cl, wd, { capEnd: false });
        const pat = g.createPattern(swatch['leg' + k], 'repeat');
        pat.setTransform(new DOMMatrix().translate(L.root[0], L.root[1]).rotate((angOf(L.root, L.mid) - Math.PI / 2) * 180 / Math.PI));
        g.fillStyle = pat; g.fill(path);
        const sh0 = g.shadowColor; noShadow();
        // the lower leg is dark, like the paw, cut as one torn-edged sleeve over the grey
        const from = Math.floor(cl.length * (front ? .5 : .58)), low = cl.slice(from), w0 = wd(from / (cl.length - 1));
        const dk = g.createPattern(swatch['dark' + k], 'repeat'); dk.setTransform(new DOMMatrix().translate(L.ankle[0], L.ankle[1]));
        g.fillStyle = dk; g.fill(tube(low, (u) => lerp(w0, wd(1), u) + 1.2 * l, { capStart: true, capEnd: false }));
        // form: a darker strip down the back of the leg
        g.save(); g.clip(path); g.fillStyle = 'rgba(0,0,10,.25)'; g.fill(tube(offsetLine(cl, (u) => -wd(u) * .36), (u) => wd(u) * .4)); g.restore();
        g.shadowColor = sh0;
      };
      const [NH, FH, NF, FF] = ps.legs;
      // far side first, then the tail, the near legs, the body over their tops, the head
      leg(FH, 'F'); leg(FF, 'F');
      inner(.3);
      for (let i = ps.tail.length - 1; i >= 0; i--) put(g, parts['ring' + i], ps.tail[i].p[0], ps.tail[i].p[1], ps.tail[i].a);
      inner(.26); leg(NH, 'N'); leg(NF, 'N');
      inner(.32);
      g.save(); g.setTransform(g.getTransform().multiply(ps.M)); g.drawImage(parts.torso.canvas, parts.torso.x, parts.torso.y, parts.torso.w, parts.torso.h); g.restore();
      const hm = new DOMMatrix().translate(ps.neck[0], ps.neck[1]).rotate((ps.pitch * .5 + ps.headAng) * 180 / Math.PI);
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
      for (const [px, py] of [[ps.hip[0] - 380 * F, -340 * F], [ps.hip[0] + 440 * F, -340 * F], [ps.hip[0] - 380 * F, 40 * F], [ps.hip[0] + 440 * F, 40 * F]]) {
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
