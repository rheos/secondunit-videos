// Paper depth, the touring musician: our own character (not paper-fox's fox). A cut-paper puppet in profile,
// facing right: beanie with a pom-pom, mustard scarf, teal coat, guitar case in the far hand.
// Rig ideas after paper-fox's fox (src/elements/fox.js, fox-rig.js; MIT, Copyright (c) 2026 Leonxlnx, notice in
// LICENSE-paper-fox.md): every part a baked sprite moved by a small bone hierarchy, breathing as a scale about the
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

  // a limb segment pointing down +y from 0 to len: rounded capsule tapering from w0 to w1
  function capsule(len, w0, w1) {
    const pts = [];
    for (let i = 0; i <= 12; i++) { const a = Math.PI + i / 12 * Math.PI; pts.push([Math.cos(a) * w0 / 2, Math.sin(a) * w0 / 2 * .9]); }
    for (let i = 0; i <= 12; i++) { const a = i / 12 * Math.PI; pts.push([Math.cos(a) * w1 / 2, len + Math.sin(a) * w1 / 2 * .9]); }
    return pts;
  }
  const parts = {};
  function build(res, light) {
    const mk = (name, box, draw, opts = {}) => { parts[name] = sprite({ ...box, res, draw, light, mat: opts.mat ?? 'paper', seed: 'mus:' + name, edge: { width: 2.2, hi: .45, lo: .32 }, shadow: false }); };
    for (const far of [false, true]) {
      const k = far ? 'F' : 'N', c = (h) => far ? shade(h) : h;
      mk('thigh' + k, { x: -20, y: -18, w: 40, h: L1 + 34 }, (g) => { g.fillStyle = c(COL.trousers); g.fill(smoothPath(capsule(L1, 34, 27))); });
      mk('shin' + k, { x: -16, y: -16, w: 32, h: L2 + 30 }, (g) => {
        g.fillStyle = c(COL.trousers); g.fill(smoothPath(capsule(L2, 27, 20)));
        g.fillStyle = 'rgba(0,0,0,.18)'; g.fill(polyPath([[-12, L2 - 26], [12, L2 - 30], [12, L2 - 22], [-12, L2 - 18]]));   // a turn-up fold
      });
      mk('boot' + k, { x: -22, y: -34, w: 70, h: 54 }, (g) => {
        g.fillStyle = c(COL.boot);
        g.fill(smoothPath([[-13, -30], [10, -30], [13, -10], [24, -4], [38, 2], [42, 10], [40, 15], [-14, 15], [-16, 0]], .6));
        g.fillStyle = c(COL.sole); g.fill(polyPath([[-15, 11], [41, 11], [40, 16], [-14, 16]]));
        g.strokeStyle = 'rgba(255,240,220,.35)'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(2, -22); g.lineTo(10, -14); g.moveTo(4, -15); g.lineTo(12, -8); g.stroke();   // laces
      }, { mat: 'smooth' });
      mk('upper' + k, { x: -18, y: -18, w: 36, h: UA + 32 }, (g) => { g.fillStyle = c(COL.coat); g.fill(smoothPath(capsule(UA, 30, 24))); });
      mk('fore' + k, { x: -18, y: -16, w: 40, h: FA + 44 }, (g) => {
        g.fillStyle = c(COL.skin); g.fill(smoothPath(ellipsePts(2, FA + 10, 10, 13, 20)));                  // hand
        g.fillStyle = c(COL.coat); g.fill(smoothPath(capsule(FA - 4, 24, 21)));
        g.fillStyle = c(COL.coatDeep); g.fill(polyPath([[-11, FA - 12], [11, FA - 12], [12, FA - 2], [-12, FA - 2]]));   // cuff
      });
    }
    mk('torso', { x: -52, y: -158, w: 104, h: 214 }, (g) => {
      g.fillStyle = COL.coat;
      g.fill(smoothPath([[-30, 46], [-36, 10], [-34, -50], [-30, -112], [-18, -138], [10, -144], [28, -132], [34, -100], [38, -50], [40, 0], [44, 46], [8, 50]], .55));
      g.fillStyle = COL.coatDeep;                                                                           // pocket flap and the front placket
      g.fill(polyPath([[10, -6], [34, -8], [35, 2], [11, 4]]));
      g.fillRect(31, -118, 3.5, 160);
      g.fillStyle = '#c9b38a'; for (const y of [-96, -60, -24]) { g.beginPath(); g.arc(26, y, 3.2, 0, 7); g.fill(); }   // buttons
    });
    mk('collar', { x: -22, y: -158, w: 64, h: 40 }, (g) => {                                               // the scarf wrap at the neck
      g.fillStyle = COL.scarf; g.fill(smoothPath([[-16, -146], [8, -152], [30, -144], [32, -130], [10, -126], [-14, -128]], .7));
      g.fillStyle = COL.scarfDeep; g.fill(polyPath([[16, -142], [30, -138], [28, -128], [18, -131]]));
    }, { mat: 'felt' });
    mk('head', { x: -42, y: -112, w: 90, h: 120 }, (g) => {
      g.fillStyle = COL.skin;
      g.fill(smoothPath([[-2, 6], [-6, -14], [-24, -34], [-24, -60], [0, -78], [28, -70], [33, -54], [41, -44], [34, -38], [33, -28], [29, -18], [16, -12], [12, 4]], .5));
      g.fillStyle = COL.hair;                                                                               // a short bob out under the beanie
      g.fill(smoothPath([[-30, -60], [-14, -60], [-6, -42], [-10, -24], [-20, -14], [-31, -18], [-34, -40]], .6));
      g.fill(smoothPath([[20, -66], [32, -64], [30, -56], [22, -58]], .5));                                  // fringe
      g.fillStyle = shade(COL.skin, .85); g.fill(smoothPath(ellipsePts(-4, -40, 6, 8, 14)));                 // ear
      g.fillStyle = COL.eye; g.beginPath(); g.arc(23, -49, 3.1, 0, 7); g.fill();
      g.fillStyle = COL.beanie;
      g.fill(smoothPath([[-34, -58], [-30, -86], [-10, -102], [14, -102], [32, -88], [36, -64], [8, -62]], .6));
      g.fillStyle = shade(COL.beanie, .82);                                                                 // the turned-up brim
      g.fill(smoothPath([[-36, -64], [-8, -70], [36, -72], [38, -60], [10, -56], [-34, -52]], .5));
      g.strokeStyle = 'rgba(0,0,0,.16)'; g.lineWidth = 2;
      for (let i = 0; i < 6; i++) { const x = -26 + i * 11; g.beginPath(); g.moveTo(x, -70 + Math.abs(i - 2.5) * .8); g.lineTo(x + 1, -58); g.stroke(); }   // rib
    }, { mat: 'paper' });
    mk('pom', { x: -18, y: -18, w: 36, h: 36 }, (g) => {
      g.fillStyle = COL.pom; const pts = [];
      for (let i = 0; i < 22; i++) { const a = i / 22 * Math.PI * 2, r = 12 + (i % 2 ? 2.4 : -.6); pts.push([Math.cos(a) * r, Math.sin(a) * r]); }
      g.fill(polyPath(pts));
    }, { mat: 'felt' });
    for (let i = 0; i < 6; i++) {
      const w0 = 17 - i * 1.2, w1 = 17 - (i + 1) * 1.2, last = i === 5;
      mk('tail' + i, { x: -14, y: -12, w: 28, h: 46 }, (g) => {
        g.fillStyle = i % 2 ? COL.scarf : shade(COL.scarf, .96);
        const pts = [[-w0 / 2, -2], [w0 / 2, -2], [w1 / 2, 26], [-w1 / 2, 26]];
        if (last) pts.splice(2, 0, [w1 / 2, 32], [w1 / 4, 27], [0, 32], [-w1 / 4, 27], [-w1 / 2, 32]);    // fringe
        g.fill(polyPath(pts));
        g.fillStyle = 'rgba(160,90,10,.35)'; g.fillRect(-w0 / 2, 10, w0, 3);                                 // a woven stripe
      }, { mat: 'felt' });
    }
    mk('case', { x: -150, y: -10, w: 300, h: 100 }, (g) => {
      // a guitar case hanging from its top handle (origin = the hand); the neck end points forward
      const body = [[-138, 26], [-126, 8], [-92, 6], [-60, 16], [-30, 12], [10, 12], [40, 18], [80, 20], [132, 22], [140, 32], [134, 46], [80, 48], [40, 54], [6, 76], [-40, 80], [-90, 84], [-128, 74], [-142, 52]];
      g.fillStyle = COL.case; g.fill(smoothPath(body, .5));
      g.fillStyle = COL.caseEdge; g.fill(polyPath([[-124, 44], [134, 34], [134, 37], [-124, 48]]));          // the seam
      g.fillStyle = COL.sticker1; g.beginPath(); g.arc(-80, 54, 13, 0, 7); g.fill();                        // tour stickers
      g.fillStyle = COL.sticker2; g.save(); g.translate(-38, 56); g.rotate(-.12); g.fillRect(-14, -9, 28, 18); g.restore();
      g.fillStyle = COL.sticker3; g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 5 : 12; g.lineTo(-104 + Math.cos(a) * r, 40 + Math.sin(a) * r); } g.closePath(); g.fill();
      g.fillStyle = COL.latch; g.fillRect(-60, 40, 9, 7); g.fillRect(40, 30, 9, 7);
      g.strokeStyle = COL.sole; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(-14, 13); g.quadraticCurveTo(0, -4, 14, 13); g.stroke();   // handle
    }, { mat: 'smooth' });
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
    // they stream back with speed and hang when she stands
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
  let buf = null, sbuf = null;
  const put = (g, s, x, y, ang = 0) => { g.save(); g.translate(x, y); if (ang) g.rotate(ang); g.drawImage(s.canvas, s.x, s.y, s.w, s.h); g.restore(); };
  const limb = (g, s, a, b) => put(g, s, a[0], a[1], Math.atan2(b[1] - a[1], b[0] - a[0]) - Math.PI / 2);
  function drawParts(g, ps) {
    const [legN, legF] = ps.legs;
    const armF = ps.armF, armN = ps.armN;
    const inner = (on) => { if (on) { const k = Math.hypot(g.getTransform().a, g.getTransform().b); g.shadowColor = 'rgba(70,24,18,.34)'; g.shadowBlur = 5 * k; g.shadowOffsetX = 1.5 * k; g.shadowOffsetY = 2.5 * k; } else g.shadowColor = 'rgba(0,0,0,0)'; };
    // far side
    put(g, parts.upperF, armF.sh[0], armF.sh[1], -armF.th);
    put(g, parts.foreF, armF.el[0], armF.el[1], -armF.th2);
    inner(true);
    put(g, parts.case, ps.handF[0], ps.handF[1], ps.caseAng);
    const leg = (L, k) => { limb(g, parts['thigh' + k], L.hip, L.knee); limb(g, parts['shin' + k], L.knee, L.ankle); put(g, parts['boot' + k], L.ankle[0], L.ankle[1], L.a); };
    leg(legF, 'F');
    leg(legN, 'N');
    for (const segs of ps.tails) for (let i = segs.length - 1; i >= 0; i--) put(g, parts['tail' + i], segs[i].p[0], segs[i].p[1], segs[i].a - Math.PI / 2);
    g.save(); g.setTransform(g.getTransform().multiply(ps.M)); g.drawImage(parts.torso.canvas, parts.torso.x, parts.torso.y, parts.torso.w, parts.torso.h); g.restore();
    const hm = new DOMMatrix().translate(ps.neck[0], ps.neck[1]).rotate((ps.lean * .6 + ps.headAng) * 180 / Math.PI);
    g.save(); g.setTransform(g.getTransform().multiply(hm));
    g.drawImage(parts.head.canvas, parts.head.x, parts.head.y, parts.head.w, parts.head.h);
    put(g, parts.pom, 2, -104, ps.pomAng);
    g.restore();
    g.save(); g.setTransform(g.getTransform().multiply(ps.M)); g.drawImage(parts.collar.canvas, parts.collar.x, parts.collar.y, parts.collar.w, parts.collar.h); g.restore();
    put(g, parts.upperN, armN.sh[0], armN.sh[1], -armN.th);
    put(g, parts.foreN, armN.el[0], armN.el[1], -armN.th2);
    inner(false);
  }
  // Draw the figure at plane coords (x0, groundY) under ctx's current transform: all parts into one buffer, one soft
  // shadow for the whole figure cast onto what is behind (paper-fox's composite puppet shadow), then the paper.
  // scale shrinks the whole figure about the ground; the gait runs on d / scale so planted feet stay planted
  function draw(ctx, x0, groundY, st, { shadow = [10, 6], shadowAlpha = .4, rim = null, scale = 1 } = {}) {
    const W = ctx.canvas.width, H = ctx.canvas.height;
    if (!buf || buf.canvas.width !== W) { buf = surface(W, H); sbuf = surface(W / 4, H / 4); }
    const m = ctx.getTransform().translate(x0, groundY).scale(scale), ps = pose({ ...st, d: st.d / scale });
    // contact shadows under the feet, darker when the foot is down
    ctx.save(); ctx.setTransform(m);
    for (const L of ps.legs) {
      const lift = clamp(-(L.ankle[1] + ANK) / 30);
      ctx.fillStyle = `rgba(30,18,24,${.28 * (1 - lift)})`;
      ctx.beginPath(); ctx.ellipse(L.ankle[0] + 12, 15, 36 * (1 - lift * .4), 6, 0, 0, 7); ctx.fill();
    }
    ctx.restore();
    const g = buf.ctx;
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
    g.setTransform(m);
    drawParts(g, ps);
    if (rim) {
      // light from a door or lamp catching the figure's edges on that side
      g.setTransform(1, 0, 0, 1, 0, 0);
      const s2 = surface(W, H); s2.ctx.drawImage(buf.canvas, 0, 0); s2.ctx.globalCompositeOperation = 'destination-out';
      s2.ctx.drawImage(buf.canvas, -rim.dir[0] * rim.width * m.a, -rim.dir[1] * rim.width * m.a);
      s2.ctx.globalCompositeOperation = 'source-in'; s2.ctx.fillStyle = rim.color; s2.ctx.fillRect(0, 0, W, H);
      g.save(); g.globalCompositeOperation = 'source-atop'; g.globalAlpha = rim.alpha; g.filter = `blur(${1.2 * m.a}px)`; g.drawImage(s2.canvas, 0, 0); g.restore();
      g.save(); g.globalCompositeOperation = 'source-atop'; g.globalAlpha = rim.wash ?? 0; g.fillStyle = rim.color; g.fillRect(0, 0, W, H); g.restore();
    }
    // one shadow for the whole figure
    const s = sbuf.ctx; s.setTransform(1, 0, 0, 1, 0, 0); s.clearRect(0, 0, W / 4, H / 4);
    s.filter = `blur(${2.2 * m.a}px)`; s.drawImage(buf.canvas, 0, 0, W / 4, H / 4); s.filter = 'none';
    s.globalCompositeOperation = 'source-in'; s.fillStyle = '#140c18'; s.fillRect(0, 0, W / 4, H / 4); s.globalCompositeOperation = 'source-over';
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha *= shadowAlpha; ctx.drawImage(sbuf.canvas, shadow[0] * m.a, shadow[1] * m.a, W, H);
    ctx.restore();
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(buf.canvas, 0, 0); ctx.restore();
    return ps;
  }
  return { build, pose, draw, foot, COL, LC, DUTY, V, setPhase: (p) => { PH0 = p; }, get PH0() { return PH0; } };
})();
