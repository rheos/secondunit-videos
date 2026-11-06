// Paper depth, the touring musician: our own character (not paper-fox's fox). A cut-paper puppet in profile,
// facing right: beanie with a pom-pom, mustard scarf, teal coat, guitar case in the far hand.
// Rig ideas after paper-fox's fox (src/elements/fox.js, fox-rig.js; MIT, Copyright (c) 2026 Leonxlnx, notice in
// LICENSE-paper-fox.md): baked paper parts moved by a small bone hierarchy and composed into one figure, breathing as a scale about the
// belly, follow-through as a chain that repeats its parent's sway later, a gait whose phase comes from distance,
// planted feet held still while the hip passes over them and two-bone IK (ik2) solving the knee back to the hip,
// and one composite drop shadow for the whole figure. The drawing and the biped gait are ours.
const MUS = (() => {
  const { clamp, lerp, ss, E, noise, sprite, surface, polyPath, smoothPath, ellipsePts, blurred } = PD;
  const nz = noise('musician');

  // ---------------- drawing (authored px; the figure is about 420 px from sole to pom-pom) ----------------
  const COL = {
    coat: '#23636b', coatDeep: '#1b4f57', scarf: '#e9ae3a', scarfDeep: '#cf9126', beanie: '#c4492f', pom: '#f2e5cb',
    trousers: '#29304f', boot: '#5b3422', sole: '#2a1a14', skin: '#c08259', hair: '#2a1c17', case: '#2e2725', caseEdge: '#4a3c36',
    sticker1: '#f2e5cb', sticker2: '#d9573f', sticker3: '#7cb3a8', latch: '#c9b38a', eye: '#1d1414',
  };
  // far limbs are the same papers in shade
  const shade = (hex, k = .74) => { const n = parseInt(hex.slice(1), 16); const f = (v) => Math.round(v * k).toString(16).padStart(2, '0'); return '#' + f(n >> 16 & 255) + f(n >> 8 & 255) + f(n & 255); };

  const L1 = 106, L2 = 102, ANK = 16;          // thigh, shin, ankle height above the sole
  const UA = 80, FA = 66;                       // upper arm, forearm (to the wrist)
  const SH = [4, -122], NECK = [8, -140], BELLY = [12, -60], TAILROOT = [-12, -134];

  // Live shapes (limbs, scarf tails) are filled with a baked paper swatch whose pattern is locked to the bone, so the
  // grain still travels with the piece. Nothing on the body gets its own bevel: the lit and unlit edge goes on the
  // composed silhouette only, and parts read apart by a soft contact shadow, as paper-fox's fox does.
  const parts = {}, swatch = {};
  function makeSwatch(name, col, mat) {
    const { canvas, ctx } = surface(256, 256);
    ctx.fillStyle = col; ctx.fillRect(0, 0, 256, 256);
    PD.applyTexture(canvas, { res: 1, mat, seed: PD.hashString('sw:' + name) });
    swatch[name] = canvas;
  }
  function build(res, light) {
    const mk = (name, box, draw, opts = {}) => { parts[name] = sprite({ ...box, res, draw, light, mat: opts.mat ?? 'paper', seed: 'mus:' + name, edge: opts.edge ?? false, shadow: false }); };
    for (const [n, c, m] of [['trousersN', COL.trousers, 'paper'], ['trousersF', shade(COL.trousers), 'paper'], ['coatN', COL.coat, 'paper'], ['coatF', shade(COL.coat), 'paper'], ['scarf', COL.scarf, 'felt'], ['scarfF', shade(COL.scarf, .9), 'felt']]) makeSwatch(n, c, m);
    const soft = (g, a = .3) => PD.setShadow(g, { color: `rgba(40,20,24,${a})`, blur: 4, x: 1.2, y: 2.2 });
    for (const far of [false, true]) {
      const k = far ? 'F' : 'N', c = (h) => far ? shade(h) : h;
      mk('boot' + k, { x: -22, y: -34, w: 70, h: 54 }, (g) => {
        g.fillStyle = c(COL.boot);
        g.fill(smoothPath([[-13, -30], [10, -30], [13, -10], [24, -4], [38, 2], [42, 10], [40, 15], [-14, 15], [-16, 0]], .6));
        g.fillStyle = c(COL.sole); g.fill(polyPath([[-15, 11], [41, 11], [40, 16], [-14, 16]]));
        g.strokeStyle = 'rgba(255,240,220,.35)'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(2, -22); g.lineTo(10, -14); g.moveTo(4, -15); g.lineTo(12, -8); g.stroke();   // laces
      }, { mat: 'smooth' });
      mk('hand' + k, { x: -14, y: -8, w: 28, h: 34 }, (g) => {
        g.fillStyle = c(COL.skin); g.fill(smoothPath([[-8, 0], [8, 0], [10, 12], [6, 22], [-2, 24], [-9, 16]], .6));
        g.fill(smoothPath(ellipsePts(8, 8, 4, 7, 12, -.4)));                                                // thumb
      });
    }
    // the coat in three overlapping torn layers (yoke, body, hem), long enough to hide where the legs join
    mk('torso', { x: -60, y: -160, w: 124, h: 250 }, (g) => {
      const tr = (pts, seed, amp = 2.2) => polyPath(PD.tear(pts, { amp, freq: .12, seed }));
      g.fillStyle = COL.coat;
      g.fill(smoothPath([[-30, 70], [-38, 20], [-35, -50], [-30, -112], [-18, -138], [10, -144], [28, -132], [34, -100], [38, -50], [42, 10], [48, 70], [10, 76]], .55));
      // torn scraps laid like shingles, bottom row first so each row overlaps the one below (paper-fox's fur):
      // lighter toward the shoulders and the back, darker toward the hem and the belly, so the coat reads round
      const outline = smoothPath([[-30, 70], [-38, 20], [-35, -50], [-30, -112], [-18, -138], [10, -144], [28, -132], [34, -100], [38, -50], [42, 10], [48, 70], [10, 76]], .55);
      const rs = new PD.RNG('coat-scraps'), tones = ['#1b5158', '#1f5b62', '#23636b', '#286d75', '#2e7880', '#358389'];
      g.save(); g.clip(outline);
      for (let y = 46; y >= -150; y -= 17) for (let x = -44 + (Math.round(y / 17) % 2) * 12; x < 54; x += 24) {
        const jx = x + rs.range(-4, 4), jy = y + rs.range(-3, 3), w = rs.range(26, 34), h = rs.range(24, 32);
        const light = clamp((-jy + 60) / 210 * .75 + (-jx + 40) / 90 * .25 + rs.range(-.12, .12));
        g.save(); soft(g, .32); g.fillStyle = tones[Math.round(light * (tones.length - 1))];
        g.fill(tr([[jx - w / 2, jy - h / 2], [jx + w / 2, jy - h / 2 + rs.range(-3, 3)], [jx + w / 2 + rs.range(-2, 2), jy + h / 2], [jx + rs.range(-6, 6), jy + h / 2 + rs.range(2, 6)], [jx - w / 2, jy + h / 2]], rs.int(1, 9999), 2));
        g.restore();
      }
      g.restore();
      g.save(); soft(g, .3); g.fillStyle = COL.coatDeep;
      g.fill(tr([[-40, 52], [48, 46], [52, 72], [10, 78], [-32, 74]], 7)); g.restore();                   // the hem, torn top edge
      g.save(); soft(g, .25); g.fillStyle = COL.coatDeep; g.fill(tr([[12, 8], [38, 4], [40, 16], [13, 20]], 13, 1)); g.restore();   // pocket flap
      g.fillStyle = COL.coatDeep; g.fillRect(33, -118, 3, 186);
      g.fillStyle = '#c9b38a'; for (const y of [-96, -60, -24, 12]) { g.beginPath(); g.arc(28, y, 3.2, 0, 7); g.fill(); }   // buttons
    });
    // the scarf wrap: three felt strips wound round the neck
    mk('collar', { x: -26, y: -162, w: 70, h: 46 }, (g) => {
      g.save(); soft(g, .3);
      g.fillStyle = COL.scarfDeep; g.fill(smoothPath([[-18, -140], [10, -146], [32, -138], [30, -126], [6, -124], [-16, -126]], .7));
      g.fillStyle = COL.scarf; g.fill(smoothPath([[-16, -150], [8, -156], [30, -148], [31, -138], [8, -134], [-14, -138]], .7));
      g.fillStyle = shade(COL.scarf, 1.05); g.fill(smoothPath([[14, -150], [32, -146], [34, -126], [22, -120], [14, -132]], .6));   // the knot
      g.restore();
    }, { mat: 'felt' });
    mk('head', { x: -42, y: -112, w: 90, h: 120 }, (g) => {
      g.fillStyle = COL.skin;
      g.fill(smoothPath([[-2, 6], [-6, -14], [-24, -34], [-24, -60], [0, -78], [28, -70], [33, -54], [41, -44], [34, -38], [33, -28], [29, -18], [16, -12], [12, 4]], .5));
      g.fillStyle = COL.hair;
      g.fill(smoothPath([[-30, -60], [-14, -60], [-6, -42], [-10, -24], [-20, -14], [-31, -18], [-34, -40]], .6));   // hair out under the beanie
      g.fill(smoothPath([[20, -66], [32, -64], [30, -56], [22, -58]], .5));                                  // fringe
      g.fillStyle = shade(COL.skin, .85); g.fill(smoothPath(ellipsePts(-4, -40, 6, 8, 14)));                 // ear
      g.fillStyle = COL.eye; g.beginPath(); g.arc(23, -49, 3.1, 0, 7); g.fill();
      g.save(); soft(g, .3);
      g.fillStyle = COL.beanie; g.fill(smoothPath([[-34, -58], [-30, -86], [-10, -102], [14, -102], [32, -88], [36, -64], [8, -62]], .6));
      g.fillStyle = shade(COL.beanie, .82); g.fill(smoothPath([[-36, -64], [-8, -70], [36, -72], [38, -60], [10, -56], [-34, -52]], .5));   // brim
      g.restore();
      g.strokeStyle = 'rgba(0,0,0,.16)'; g.lineWidth = 2;
      for (let i = 0; i < 6; i++) { const x = -26 + i * 11; g.beginPath(); g.moveTo(x, -70 + Math.abs(i - 2.5) * .8); g.lineTo(x + 1, -58); g.stroke(); }   // rib
    });
    mk('pom', { x: -18, y: -18, w: 36, h: 36 }, (g) => {
      g.fillStyle = COL.pom; const pts = [];
      for (let i = 0; i < 22; i++) { const a = i / 22 * Math.PI * 2, r = 12 + (i % 2 ? 2.4 : -.6); pts.push([Math.cos(a) * r, Math.sin(a) * r]); }
      g.fill(polyPath(pts));
    }, { mat: 'felt' });
    // the guitar case is a separate object, so it keeps its own cut edge
    mk('case', { x: -150, y: -10, w: 300, h: 100 }, (g) => {
      const body = [[-138, 26], [-126, 8], [-92, 6], [-60, 16], [-30, 12], [10, 12], [40, 18], [80, 20], [132, 22], [140, 32], [134, 46], [80, 48], [40, 54], [6, 76], [-40, 80], [-90, 84], [-128, 74], [-142, 52]];
      g.fillStyle = COL.case; g.fill(smoothPath(body, .5));
      g.fillStyle = COL.caseEdge; g.fill(polyPath([[-124, 44], [134, 34], [134, 37], [-124, 48]]));          // the seam
      g.fillStyle = COL.sticker1; g.beginPath(); g.arc(-80, 54, 13, 0, 7); g.fill();                        // tour stickers
      g.fillStyle = COL.sticker2; g.save(); g.translate(-38, 56); g.rotate(-.12); g.fillRect(-14, -9, 28, 18); g.restore();
      g.fillStyle = COL.sticker3; g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 5 : 12; g.lineTo(-104 + Math.cos(a) * r, 40 + Math.sin(a) * r); } g.closePath(); g.fill();
      g.fillStyle = COL.latch; g.fillRect(-60, 40, 9, 7); g.fillRect(40, 30, 9, 7);
      g.strokeStyle = COL.sole; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(-14, 13); g.quadraticCurveTo(0, -4, 14, 13); g.stroke();   // handle
    }, { mat: 'smooth', edge: { width: 2.2, hi: .4, lo: .3 } });
  }

  // ---------------- bendy limbs ----------------
  // A limb is one continuous shape: the bone chain sampled, its corner rounded (Chaikin), then outlined as a tube whose
  // width tapers along it. No seam at the knee or elbow.
  function chaikin(pts, it = 2) {
    for (let k = 0; k < it; k++) {
      const o = [pts[0]];
      for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1]; o.push([a[0] * .75 + b[0] * .25, a[1] * .75 + b[1] * .25], [a[0] * .25 + b[0] * .75, a[1] * .25 + b[1] * .75]); }
      o.push(pts[pts.length - 1]); pts = o;
    }
    return pts;
  }
  function chain(joints, n = 6) {
    const out = [];
    for (let j = 0; j < joints.length - 1; j++) for (let i = 0; i < n; i++) { const u = i / n; out.push([lerp(joints[j][0], joints[j + 1][0], u), lerp(joints[j][1], joints[j + 1][1], u)]); }
    out.push(joints[joints.length - 1]);
    return chaikin(out, 3);
  }
  // outline of a tube along cl; width(u) for u in 0..1 along it; round caps unless flat
  function tube(cl, width, { capStart = true, capEnd = true, fringe = 0 } = {}) {
    const n = cl.length, L = [], R = [];
    for (let i = 0; i < n; i++) {
      const a = cl[Math.max(0, i - 1)], b = cl[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1;
      const w = width(i / (n - 1)) / 2, nx = -dy / d, ny = dx / d;
      L.push([cl[i][0] + nx * w, cl[i][1] + ny * w]); R.push([cl[i][0] - nx * w, cl[i][1] - ny * w]);
    }
    const cap = (p, q, c, k) => { const out = [], r = Math.hypot(p[0] - c[0], p[1] - c[1]), a0 = Math.atan2(p[1] - c[1], p[0] - c[0]); for (let i = 1; i < k; i++) { const a = a0 + Math.PI * i / k; out.push([c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r]); } return out; };
    const endPts = fringe ? (() => { const e = [], a = L[n - 1], b = R[n - 1], dx = cl[n - 1][0] - cl[n - 2][0], dy = cl[n - 1][1] - cl[n - 2][1], d = Math.hypot(dx, dy) || 1;
      for (let i = 0; i <= 8; i++) { const u = i / 8, x = lerp(a[0], b[0], u), y = lerp(a[1], b[1], u), f = i % 2 ? 0 : fringe; e.push([x + dx / d * f, y + dy / d * f]); } return e.slice(1, -1); })()
      : capEnd ? cap(L[n - 1], R[n - 1], cl[n - 1], 8) : [];
    const startPts = capStart ? cap(R[0], L[0], cl[0], 8) : [];
    return polyPath([...L, ...endPts, ...R.reverse(), ...startPts]);
  }
  const angOf = (a, b) => Math.atan2(b[1] - a[1], b[0] - a[0]);
  // the centreline moved sideways by off(u) along its left normal (for a limb pointing down, left is the back)
  function offsetLine(cl, off) {
    const n = cl.length;
    return cl.map((p, i) => { const a = cl[Math.max(0, i - 1)], b = cl[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, o = off(i / (n - 1)); return [p[0] - dy / d * o, p[1] + dx / d * o]; });
  }
  // form shading in paper: a darker torn-edged strip down the back of a tube, clipped to it
  function backStrip(g, path, cl, width, col, side = 1) {
    g.save(); g.clip(path); g.fillStyle = col;
    g.fill(tube(offsetLine(cl, (u) => side * width(u) * .36), (u) => width(u) * .42));
    g.restore();
  }
  // fill a live shape with a swatch whose grain is pinned to a bone frame
  function fillPaper(g, path, sw, at, ang) {
    const pat = g.createPattern(swatch[sw], 'repeat');
    pat.setTransform(new DOMMatrix().translate(at[0], at[1]).rotate(ang * 180 / Math.PI));
    g.fillStyle = pat; g.fill(path);
  }

  // ---------------- gait ----------------
  const LC = 260, DUTY = .62, V = 230;
  let PH0 = 0;   // phase offset, set so the walk ends with both feet down
  const R = (a, x, y) => [Math.cos(a) * x - Math.sin(a) * y, Math.sin(a) * x + Math.cos(a) * y];
  // ankle position and foot angle at angle a: a < 0 toe up pivoting on the heel, a > 0 heel up pivoting on the toe
  function footAt(px, a) {
    if (a < 0) { const r = R(a, 14, -ANK); return [px - 14 + r[0], r[1], a]; }
    const r = R(a, -38, -ANK); return [px + 38 + r[0], r[1], a];
  }
  function foot(d, o, walk) {
    const w = d / LC + PH0 + o, n = Math.floor(w), u = w - n;
    const plant = (m) => (m + DUTY / 2 - PH0 - o) * LC;
    if (u < DUTY) {
      let a = 0;
      if (u < .07) a = -.18 * (1 - u / .07);
      else if (u > DUTY - .16) a = .5 * E.in((u - (DUTY - .16)) / .16);
      return { ...xy(footAt(plant(n), a * walk)), u, stance: true };
    }
    const s = (u - DUTY) / (1 - DUTY);
    const A = footAt(plant(n), .5 * walk), B = footAt(plant(n + 1), -.18 * walk);
    const k = E.sine(s);
    return { x: lerp(A[0], B[0], k), y: lerp(A[1], B[1], s) - 30 * Math.sin(Math.PI * s) * (1 - .35 * s), a: lerp(.5, -.18, ss(0, .75, s)) * walk + .22 * Math.sin(Math.PI * s) * walk, u, stance: false };
  }
  const xy = (f) => ({ x: f[0], y: f[1], a: f[2] });
  // two-bone IK (paper-fox fox-rig.js ik2): knee position for hip a, ankle c, bones l1 l2; bend picks the side
  function ik2(a, c, l1, l2, bend) {
    const dx = c[0] - a[0], dy = c[1] - a[1], d = Math.hypot(dx, dy) || 1e-6;
    const dc = Math.min(Math.max(d, Math.abs(l1 - l2) + 1e-3), l1 + l2 - 1e-3);
    const A = Math.acos(clamp((l1 * l1 + dc * dc - l2 * l2) / (2 * l1 * dc), -1, 1));
    const ang = Math.atan2(dy, dx) + bend * A;
    return [a[0] + Math.cos(ang) * l1, a[1] + Math.sin(ang) * l1];
  }

  // ---------------- pose ----------------
  // st: { d (distance walked), t, walk (0 standing .. 1 full walk), look (head tilt), settle (seconds since stopping) }
  function pose(st) {
    const { d, t, walk } = st;
    const uN = ((d / LC + PH0) % 1 + 1) % 1;
    const bob = Math.cos(4 * Math.PI * (uN - DUTY / 2));
    const breath = Math.sin(t / 3.3 * Math.PI * 2);
    const sway = nz.n1(t * .35) * 2.5 * (1 - walk);                                         // weight shift when standing
    const hip = [d + sway, -(ANK + 196 + 5 * bob * walk + .8 * breath)];
    const lean = .05 + .018 * Math.sin(4 * Math.PI * (uN - DUTY / 2) + 1) * walk + .01 * nz.n1(t * .2);
    const fN = foot(d, 0, walk), fF = foot(d, .5, walk);
    const legs = [fN, fF].map((f) => {
      const knee = ik2(hip, [f.x, f.y], L1, L2, -1);
      return { hip, knee, ankle: [f.x, f.y], a: f.a, stance: f.stance };
    });
    // torso matrix: hip, lean, breathing (0.5% wide, 1% tall about the belly)
    const M = new DOMMatrix().translate(hip[0], hip[1]).rotate(lean * 180 / Math.PI)
      .translate(BELLY[0], BELLY[1]).scale(1 + .005 * breath, 1 + .01 * breath).translate(-BELLY[0], -BELLY[1]);
    const P = (p) => { const r = M.transformPoint(new DOMPoint(p[0], p[1])); return [r.x, r.y]; };
    const sh = P(SH), neck = P(NECK), tailRoot = P(TAILROOT);
    // arms swing against the same-side foot; the far arm carries the case and barely swings
    const rel = (f) => clamp((f.x - hip[0]) / 85, -1.2, 1.2);
    const thN = (-.4 * rel(fN) + .04) * walk + .03 * (1 - walk), thF = (-.1 * rel(fF) + .06) * walk;
    const arm = (th, th2) => { const el = [sh[0] + Math.sin(th) * UA, sh[1] + Math.cos(th) * UA]; return { sh, el, th, th2 }; };
    const armN = arm(thN, thN + .14 + .5 * Math.max(0, thN) * walk + .08 * (1 - walk));
    const armF = arm(thF, thF + .06);
    const handF = [armF.el[0] + Math.sin(armF.th2) * (FA + 8), armF.el[1] + Math.cos(armF.th2) * (FA + 8)];
    // the case lags the arm (follow-through) and rocks with the bob; after stopping it settles with a damped swing
    const lagF = foot(d - V * .16 * walk, .5, walk);
    const settle = st.settle ?? -1;
    const settleSwing = settle >= 0 ? .16 * Math.exp(-settle * 1.9) * Math.sin(settle * 7.5) : 0;
    const caseAng = -.03 + (-.15 * clamp((lagF.x - hip[0]) / 85, -1.2, 1.2) + .045 * Math.sin(4 * Math.PI * (uN - DUTY / 2) - 1.6)) * walk + settleSwing;
    // head: a small nod with the step, noise, and a look; the pom-pom repeats the nod later and bigger
    const headAng = .04 * Math.cos(4 * Math.PI * (uN - DUTY / 2) + .7) * walk + .02 * nz.n1(t * .5 + 3) + (st.look ?? 0);
    const pomAng = .28 * Math.sin(4 * Math.PI * (uN - DUTY / 2) - 1.5) * walk + (settle >= 0 ? .3 * Math.exp(-settle * 2.4) * Math.sin(settle * 9) : 0) + .05 * nz.n1(t * 1.3);
    // scarf tails: each segment repeats the sway of the one before it later and bigger, plus a flutter;
    // they stream back with speed and hang when he stands
    const tails = [0, 1].map((tl) => {
      const base = lerp(Math.PI / 2 + .3, Math.PI - .62 - tl * .12, walk);
      let p = tailRoot.slice(); const segs = [];
      for (let i = 0; i < 6; i++) {
        const ph = 4 * Math.PI * (uN - DUTY / 2) - i * .85 - tl * .6;
        const a = base + i * .07 * walk + (.06 + .055 * i) * Math.sin(ph) * walk + .035 * (i + 1) * nz.n1(t * 2.2 + i * .45 + tl * 5)
          + (settle >= 0 ? (.05 + .04 * i) * Math.exp(-settle * 1.6) * Math.sin(settle * 6 - i * .7) : 0);
        segs.push({ p: p.slice(), a });
        p = [p[0] + Math.cos(a) * 25, p[1] + Math.sin(a) * 25];
      }
      return segs;
    });
    return { hip, M, legs, armN, armF, handF, caseAng, neck, headAng, pomAng, tails, lean };
  }

  // ---------------- drawing ----------------
  let buf = null, sbuf = null, rbuf = null;
  const put = (g, s, x, y, ang = 0) => { g.save(); g.translate(x, y); if (ang) g.rotate(ang); g.drawImage(s.canvas, s.x, s.y, s.w, s.h); g.restore(); };
  const wristOf = (A) => [A.el[0] + Math.sin(A.th2) * FA, A.el[1] + Math.cos(A.th2) * FA];
  const piecewise = (u, a, b, c) => u < .5 ? lerp(a, b, u * 2) : lerp(b, c, u * 2 - 1);
  function drawParts(g, ps) {
    const [legN, legF] = ps.legs;
    // a soft contact shadow is all that separates overlapping parts; canvas shadows are in device pixels
    const inner = (a) => { const k = Math.hypot(g.getTransform().a, g.getTransform().b); g.shadowColor = `rgba(50,18,20,${a})`; g.shadowBlur = 6 * k; g.shadowOffsetX = 1.5 * k; g.shadowOffsetY = 2.5 * k; };
    const noShadow = () => { g.shadowColor = 'rgba(0,0,0,0)'; };
    const sleeve = (A, k) => {
      const w = wristOf(A), cl = chain([A.sh, A.el, w]), wd = (u) => piecewise(u, 31, 26, 23), path = tube(cl, wd);
      fillPaper(g, path, 'coat' + k, A.sh, -A.th);
      noShadow();
      backStrip(g, path, cl, wd, k === 'F' ? 'rgba(10,30,34,.35)' : 'rgba(10,40,44,.3)', -1);
      g.fillStyle = k === 'F' ? shade(COL.coatDeep) : COL.coatDeep;                                       // the cuff
      g.fill(tube(cl.slice(Math.floor(cl.length * .86)), () => 24, { capStart: false }));
      put(g, parts['hand' + k], w[0], w[1], -A.th2);
    };
    const leg = (L, k) => {
      put(g, parts['boot' + k], L.ankle[0], L.ankle[1], L.a);
      const cl = chain([L.hip, L.knee, L.ankle]), wd = (u) => piecewise(u, 36, 27, 25), path = tube(cl, wd, { capEnd: false });
      fillPaper(g, path, 'trousers' + k, L.hip, angOf(L.hip, L.knee) - Math.PI / 2);
      const sh0 = g.shadowColor; g.shadowColor = 'rgba(0,0,0,0)';
      backStrip(g, path, cl, wd, 'rgba(8,10,28,.32)', -1);
      g.fillStyle = 'rgba(0,0,0,.2)'; g.fill(tube(cl.slice(Math.floor(cl.length * .9)), () => 26, { capStart: false, capEnd: false }));   // the turn-up
      g.shadowColor = sh0;
    };
    const ribbon = (segs, sw) => {
      const pts = segs.map((q) => q.p), last = segs[segs.length - 1];
      pts.push([last.p[0] + Math.cos(last.a) * 25, last.p[1] + Math.sin(last.a) * 25]);
      const cl = chaikin(pts, 3), wd = (u) => lerp(17, 11, u), path = tube(cl, wd, { fringe: 7 });
      fillPaper(g, path, sw, pts[0], segs[0].a - Math.PI / 2);
      backStrip(g, path, cl, wd, 'rgba(150,80,10,.32)', 1);
    };
    // far side, back to front
    sleeve(ps.armF, 'F');
    inner(.3); put(g, parts.case, ps.handF[0], ps.handF[1], ps.caseAng); noShadow();
    leg(legF, 'F');
    inner(.22); leg(legN, 'N'); noShadow();
    ribbon(ps.tails[1], 'scarfF'); ribbon(ps.tails[0], 'scarf');
    inner(.3);
    g.save(); g.setTransform(g.getTransform().multiply(ps.M)); g.drawImage(parts.torso.canvas, parts.torso.x, parts.torso.y, parts.torso.w, parts.torso.h); g.restore();
    const hm = new DOMMatrix().translate(ps.neck[0], ps.neck[1]).rotate((ps.lean * .6 + ps.headAng) * 180 / Math.PI);
    g.save(); g.setTransform(g.getTransform().multiply(hm));
    g.drawImage(parts.head.canvas, parts.head.x, parts.head.y, parts.head.w, parts.head.h);
    put(g, parts.pom, 2, -104, ps.pomAng);
    g.restore();
    g.save(); g.setTransform(g.getTransform().multiply(ps.M)); g.drawImage(parts.collar.canvas, parts.collar.x, parts.collar.y, parts.collar.w, parts.collar.h); g.restore();
    inner(.32); sleeve(ps.armN, 'N');
    noShadow();
  }
  // Draw the figure at plane coords (x0, groundY) under ctx's current transform. The parts are composed in a buffer
  // just big enough for him; then the lit and unlit cut edge goes on the whole silhouette at once (paper-fox's
  // edgeLight on a composite), one soft shadow for the whole figure is cast behind, and the paper goes on top.
  // scale shrinks the figure about the ground; the gait runs on d / scale so planted feet stay planted.
  function draw(ctx, x0, groundY, st, { shadow = [10, 6], shadowAlpha = .4, rim = null, scale = 1, light = [-.5, -.85] } = {}) {
    const m = ctx.getTransform().translate(x0, groundY).scale(scale), ps = pose({ ...st, d: st.d / scale });
    const k = Math.hypot(m.a, m.b);
    // contact shadows under the feet, darker when the foot is down
    ctx.save(); ctx.setTransform(m);
    for (const L of ps.legs) {
      const lift = clamp(-(L.ankle[1] + ANK) / 30);
      ctx.fillStyle = `rgba(30,18,24,${.28 * (1 - lift)})`;
      ctx.beginPath(); ctx.ellipse(L.ankle[0] + 12, 15, 36 * (1 - lift * .4), 6, 0, 0, 7); ctx.fill();
    }
    ctx.restore();
    // the screen box he can occupy
    let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
    for (const [px, py] of [[ps.hip[0] - 250, -530], [ps.hip[0] + 250, -530], [ps.hip[0] - 250, 70], [ps.hip[0] + 250, 70]]) {
      const q = m.transformPoint(new DOMPoint(px, py)); x1 = Math.min(x1, q.x); y1 = Math.min(y1, q.y); x2 = Math.max(x2, q.x); y2 = Math.max(y2, q.y);
    }
    const bx = Math.floor(x1), by = Math.floor(y1), bw = Math.ceil(x2 - x1) + 2, bh = Math.ceil(y2 - y1) + 2;
    if (!buf || buf.canvas.width < bw || buf.canvas.height < bh) { buf = surface(bw, bh); sbuf = surface(Math.ceil(bw / 4), Math.ceil(bh / 4)); rbuf = surface(bw, bh); }
    const BW = buf.canvas.width, BH = buf.canvas.height;
    const g = buf.ctx;
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, BW, BH);
    g.setTransform(new DOMMatrix([1, 0, 0, 1, -bx, -by]).multiply(m));
    drawParts(g, ps);
    g.setTransform(1, 0, 0, 1, 0, 0);
    PD.edgeLight(buf.canvas, { res: k, light, width: 2.4, hi: .45, lo: .34, soft: .5 });
    if (rim) {
      // light from a door or lamp catching the figure's edges on that side
      const r = rbuf.ctx; r.setTransform(1, 0, 0, 1, 0, 0); r.globalCompositeOperation = 'copy'; r.drawImage(buf.canvas, 0, 0);
      r.globalCompositeOperation = 'destination-out'; r.drawImage(buf.canvas, -rim.dir[0] * rim.width * k, -rim.dir[1] * rim.width * k);
      r.globalCompositeOperation = 'source-in'; r.fillStyle = rim.color; r.fillRect(0, 0, BW, BH); r.globalCompositeOperation = 'source-over';
      g.save(); g.globalCompositeOperation = 'source-atop'; g.globalAlpha = rim.alpha; g.filter = `blur(${1.2 * k}px)`; g.drawImage(rbuf.canvas, 0, 0); g.restore();
      g.save(); g.globalCompositeOperation = 'source-atop'; g.globalAlpha = rim.wash ?? 0; g.fillStyle = rim.color; g.fillRect(0, 0, BW, BH); g.restore();
    }
    // one shadow for the whole figure
    const s = sbuf.ctx, SW = sbuf.canvas.width, SH2 = sbuf.canvas.height;
    s.setTransform(1, 0, 0, 1, 0, 0); s.clearRect(0, 0, SW, SH2);
    s.filter = `blur(${2.2 * k}px)`; s.drawImage(buf.canvas, 0, 0, SW, SH2); s.filter = 'none';
    s.globalCompositeOperation = 'source-in'; s.fillStyle = '#140c18'; s.fillRect(0, 0, SW, SH2); s.globalCompositeOperation = 'source-over';
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha *= shadowAlpha; ctx.drawImage(sbuf.canvas, bx + shadow[0] * k, by + shadow[1] * k, SW * 4, SH2 * 4);
    ctx.restore();
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(buf.canvas, bx, by); ctx.restore();
    return ps;
  }
  return { build, pose, draw, foot, COL, LC, DUTY, V, setPhase: (p) => { PH0 = p; }, get PH0() { return PH0; } };
})();
