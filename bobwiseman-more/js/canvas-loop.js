// More: Spotify Canvas loop. 8 s, seamless, silent, 9:16 (720x1280 default; ?w=&h=).
// Endless zoom-out in the cut-paper look (look-paper.js): the customer stands waist-deep in a giant
// teacup of coffee and holds a smaller cup and saucer up over his head in his too-long sleeves. In
// that cup stands a smaller customer holding up a smaller cup, and so on: a tower of upgrades. The
// camera keeps pulling back and each cup turns out to be held up by a bigger customer in a bigger cup.
//
// Loop maths: every level is the same drawing. Level L is drawn at scale SIG0 * S^(L - t/8) about the
// nest's fixed point XS, so after 8 s every level has shrunk by exactly S and sits where the next
// smaller one was: frame(8) == frame(0). Per-level acting is a function of that level's own phase
// e = L - t/8; everything else (steam, head bob, flutter) has a period that divides 8.
// Seeded rng only; no Math.random, no Date, no rAF state. Kit palette, scissor-cut paths, shadows and
// paper fibre are copied from look-paper.js (the kit draws 1920x1080, so it is not loaded here).
(() => {
  const params = new URLSearchParams(location.search);
  const CW = Number(params.get('w') || 720), CH = Number(params.get('h') || 1280);
  const canvas = document.getElementById('c'); canvas.width = CW; canvas.height = CH;
  const G = canvas.getContext('2d');
  const VW = 1080, VH = 1080 * CH / CW;         // virtual frame: the kit's 1080p units, stood on end
  const TAU = Math.PI * 2, PERIOD = 8;

  // ---------- helpers (lib.js) ----------
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const inv = (a, b, x) => clamp((x - a) / (b - a));
  const smooth = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
  function hash(n) { n = (n ^ 61) ^ (n >>> 16); n = n + (n << 3); n = n ^ (n >>> 4); n = Math.imul(n, 0x27d4eb2d); n = n ^ (n >>> 15); return (n >>> 0) / 4294967296; }
  function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  // ---------- kit palette (look-paper.js, exact) ----------
  const C = {
    ground: '#f2e9d6', ultra: '#1e2b8a', cobalt: '#2553c9', verm: '#e4422b', lemon: '#f7d01c',
    leaf: '#3c9a3d', pink: '#f49ab6', white: '#fbf6ea', black: '#1d1b1c', peach: '#f3c3a4',
    coat: '#2d7a3a', coatD: '#23652f', coatL: '#4a9a50', cap: '#40362f', orange: '#f28a1e', nose: '#e9a48b',
  };
  function shade(hex, f) {
    const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    r = Math.round(clamp(r * f, 0, 255)); g = Math.round(clamp(g * f, 0, 255)); b = Math.round(clamp(b * f, 0, 255));
    return `rgb(${r},${g},${b})`;
  }

  // ---------- scissor-cut paths (kit, exact) ----------
  function cutPath(pts, seed, seg = 30, amp = 1.7) {
    const R = rng(seed); const p = new Path2D(); const out = [];
    for (let i = 0; i < pts.length; i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length];
      const L = Math.hypot(bx - ax, by - ay); const n = Math.max(1, Math.round(L / seg));
      const nx = -(by - ay) / (L || 1), ny = (bx - ax) / (L || 1);
      for (let k = 0; k < n; k++) {
        const u = k / n; const o = k === 0 ? (R() - .5) * amp * .8 : (R() - .5) * 2 * amp;
        out.push([ax + (bx - ax) * u + nx * o, ay + (by - ay) * u + ny * o]);
      }
    }
    out.forEach(([x, y], i) => i ? p.lineTo(x, y) : p.moveTo(x, y)); p.closePath();
    return p;
  }
  const ellPts = (rx, ry, seed, facet = 24) => {
    const R = rng(seed + 7); const n = Math.max(9, Math.round(TAU * Math.max(rx, ry) / facet)); const a0 = R() * TAU;
    return [...Array(n)].map((_, i) => { const a = a0 + i / n * TAU, j = 1 + (R() - .5) * .03; return [Math.cos(a) * rx * j, Math.sin(a) * ry * j]; });
  };
  const disk = (r, seed) => cutPath(ellPts(r, r, seed), seed, 999);
  const ell = (rx, ry, seed) => cutPath(ellPts(rx, ry, seed), seed, 999);
  const starPts = (r, k = .45, n = 5) => [...Array(n * 2)].map((_, i) => { const a = -Math.PI / 2 + i * Math.PI / n, rr = i % 2 ? r * k : r; return [Math.cos(a) * rr, Math.sin(a) * rr]; });
  const heartPts = (r) => [...Array(30)].map((_, i) => { const a = i / 30 * TAU; return [16 * Math.pow(Math.sin(a), 3) * r / 17, -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) * r / 17 - r * .05]; });
  const rectPts = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const shift = (pts, dx, dy) => pts.map(([x, y]) => [x + dx, y + dy]);

  // ---------- shadows + fills (kit; device-space light, scaled by a per-level lift) ----------
  let K = 1;
  function shadowOn(g, lift = 1) { g.shadowColor = 'rgba(40,20,5,0.34)'; g.shadowOffsetX = 2.5 * K * lift; g.shadowOffsetY = 4.5 * K * lift; g.shadowBlur = 5 * K * lift; }
  function shadowOff(g) { g.shadowColor = 'rgba(0,0,0,0)'; g.shadowBlur = 0; g.shadowOffsetX = 0; g.shadowOffsetY = 0; }
  function fillParts(g, parts, lift) {
    for (const q of parts) {
      g.fillStyle = q.col;
      if (q.noShadow || lift < .12) shadowOff(g); else shadowOn(g, lift);
      g.fill(q.p, q.eo ? 'evenodd' : 'nonzero');
    }
    shadowOff(g);
  }
  function pinAt(g, x, y, col, lift) {
    if (lift >= .12) shadowOn(g, 1.3 * lift); g.fillStyle = col; g.beginPath(); g.arc(x, y, 9, 0, TAU); g.fill(); shadowOff(g);
    g.fillStyle = 'rgba(255,255,255,0.75)'; g.beginPath(); g.arc(x - 3, y - 3, 3, 0, TAU); g.fill();
  }

  // ---------- paper fibre texture (kit algorithm, built once at the virtual portrait size) ----------
  let TEX = null;
  function makeTexture() {
    const tw = VW, th = Math.round(VH);
    const c = document.createElement('canvas'); c.width = tw; c.height = th; const x = c.getContext('2d');
    x.fillStyle = '#808080'; x.fillRect(0, 0, tw, th);
    const R = rng(4242);
    for (let i = 0; i < 160; i++) { // soft mottling
      const cx = R() * tw, cy = R() * th, r = 60 + R() * 260, l = R() < .5;
      const gr = x.createRadialGradient(cx, cy, 0, cx, cy, r); gr.addColorStop(0, l ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'); gr.addColorStop(1, 'rgba(128,128,128,0)');
      x.fillStyle = gr; x.fillRect(cx - r, cy - r, r * 2, r * 2);
    }
    const im = x.getImageData(0, 0, tw, th), d = im.data; // grain
    for (let i = 0; i < d.length; i += 4) { const v = (R() - .5) * 26; d[i] += v; d[i + 1] += v; d[i + 2] += v; }
    x.putImageData(im, 0, 0);
    x.lineCap = 'round';
    for (let i = 0; i < 9000; i++) { // fibres: short curling strands, light and dark
      const sx = R() * tw, sy = R() * th, L = 6 + R() * 26, a = R() * TAU, bend = (R() - .5) * 1.2, l = R() < .55;
      x.strokeStyle = l ? `rgba(255,255,255,${.10 + R() * .16})` : `rgba(0,0,0,${.07 + R() * .12})`; x.lineWidth = .5 + R() * 1.1;
      x.beginPath(); x.moveTo(sx, sy); x.quadraticCurveTo(sx + Math.cos(a + bend) * L * .5, sy + Math.sin(a + bend) * L * .5, sx + Math.cos(a) * L, sy + Math.sin(a) * L); x.stroke();
    }
    TEX = c;
  }

  // =====================================================================================
  // One level, in level units (kit 1080p px). Origin = the big cup's rim centre.
  // The held cup is the next smaller level: placed at HP, scaled 1/S. Nest fixed point XS = HP*S/(S-1).
  // =====================================================================================
  const S = 3;                         // each level is 3x the one in its hands
  const HP = [0, -545];                // where the inner level's rim centre sits: cup and saucer held over his cap
  const XS = [HP[0] * S / (S - 1), HP[1] * S / (S - 1)]; // (0, -817.5): the top of the tower
  const SIG0 = Number(params.get('sig') || 1.15); // virtual px per level unit when a level's phase e = 0
  const CX = VW / 2, CY = VH * Number(params.get('cy') || .155); // the tower's vanishing point, just under Spotify's top bar
  const EMIN = Number(params.get('emin') || -6), EMAX = Number(params.get('emax') || 3);           // levels drawn: from a 1 px speck up to 27x (hidden behind its children)
  const CUP = { rx: 300, ry: 62, h: 350, bw: 210, bry: 38 };
  const CUST = { x: 0, y: 110 };       // customer's feet (kit origin), under the coffee

  const cupHalfW = (y) => CUP.rx - (CUP.rx - CUP.bw) * Math.pow(clamp(y / CUP.h), 2.2);
  const cupRy = (y) => lerp(CUP.ry, CUP.bry, clamp(y / CUP.h));

  let LV = null;
  function buildLevel() {
    const s = 31000;
    // cup body: rim front curve, flared sides, rounded foot
    const body = [];
    for (let i = 0; i <= 20; i++) { const a = Math.PI - i / 20 * Math.PI; body.push([Math.cos(a) * CUP.rx, Math.sin(a) * CUP.ry]); }
    for (let i = 1; i <= 10; i++) { const y = i / 10 * CUP.h; body.push([cupHalfW(y), y]); }
    for (let i = 1; i < 20; i++) { const a = i / 20 * Math.PI; body.push([Math.cos(a) * CUP.bw, CUP.h + Math.sin(a) * CUP.bry]); }
    for (let i = 10; i >= 1; i--) { const y = i / 10 * CUP.h; body.push([-cupHalfW(y), y]); }
    const band = (y0, y1) => {
      const o = [], w0 = cupHalfW(y0), w1 = cupHalfW(y1), r0 = cupRy(y0), r1 = cupRy(y1);
      for (let i = 0; i <= 16; i++) { const a = Math.PI - i / 16 * Math.PI; o.push([Math.cos(a) * w0, y0 + Math.sin(a) * r0]); }
      for (let i = 0; i <= 16; i++) { const a = i / 16 * Math.PI; o.push([Math.cos(a) * w1, y1 + Math.sin(a) * r1]); }
      return o;
    };
    const ring = (cx, cy, rx, ry, th, seed) => { const p = new Path2D(); p.addPath(cutPath(shift(ellPts(rx, ry, seed), cx, cy), seed, 999)); p.addPath(cutPath(shift(ellPts(rx - th, ry - th, seed + 1), cx, cy), seed + 1, 999)); return p; };
    LV = {
      saucer: cutPath(shift(ellPts(390, 54, s + 1), 0, 364), s + 1, 999),
      saucerWell: cutPath(shift(ellPts(250, 30, s + 2), 0, 356), s + 2, 999),
      handle: ring(296, 150, 108, 118, 46, s + 3),
      body: cutPath(body, s + 4, 34, 1.6),
      band: cutPath(band(150, 200), s + 5, 34, 1.4),
      bandThin: cutPath(band(222, 236), s + 6, 34, 1),
      lining: cutPath(ellPts(CUP.rx, CUP.ry, s + 7, 30), s + 7, 999),
      coffee: cutPath(shift(ellPts(CUP.rx - 22, CUP.ry - 12, s + 8, 30), 0, 7), s + 8, 999),
      crema: cutPath(shift(ellPts(196, 30, s + 9), 0, 16), s + 9, 999),
      cremaIn: cutPath(shift(ellPts(168, 21, s + 10), 0, 14), s + 10, 999),
      // the customer goes into the coffee along the front of the ripple ring
      dunk: (() => { const p = new Path2D(); p.moveTo(-600, -1200); p.lineTo(600, -1200); p.lineTo(600, 16); p.lineTo(196, 16); for (let i = 1; i < 24; i++) { const a = i / 24 * Math.PI; p.lineTo(Math.cos(a) * 196, 16 + Math.sin(a) * 30); } p.lineTo(-196, 16); p.lineTo(-600, 16); p.closePath(); return p; })(),
      // stars on the ground beside him and his raised arms (level coords)
      stars: [[-440, -140, 40, C.lemon], [455, -250, 34, C.white], [-395, -440, 28, C.pink], [400, -540, 42, C.lemon], [-270, -690, 24, C.white], [280, -760, 20, C.verm]]
        .map(([x, y, r, col], i) => ({ x, y, r, col, rot: (hash(s + i) - .5) * .7, p: cutPath(starPts(r, .44 + hash(s + 50 + i) * .08), s + 100 + i, 34, 1.5), pin: i === 3 })),
    };
  }

  // ---------- the customer (kit parts, exact geometry) ----------
  let CP = null;
  function custParts() {
    if (CP) return CP;
    const s = 9000;
    CP = {
      coat: cutPath([[-45, -350], [-96, -334], [-122, -300], [-140, -150], [-156, -62], [-80, -54], [0, -58], [80, -54], [156, -62], [140, -150], [122, -300], [96, -334], [45, -350]], s + 5, 34, 2),
      lapL: cutPath([[-46, -350], [0, -238], [-8, -300], [-22, -340]], s + 6, 99, 1), lapR: cutPath([[46, -350], [0, -238], [8, -300], [22, -340]], s + 7, 99, 1),
      flap: cutPath(rectPts(-4, -236, 4, -60), s + 8, 50, .8),
      btn: disk(9, s + 9),
      pocket: cutPath(rectPts(-108, -150, -62, -138), s + 11, 99, .8), pocket2: cutPath(rectPts(62, -150, 108, -138), s + 11, 99, .8),
      sleeve: cutPath([[-24, -8], [26, -8], [36, 205], [-30, 212]], s + 12, 40, 1.5), cuff: cutPath([[-30, 180], [36, 176], [36, 205], [-30, 212]], s + 13, 99, 1),
      head: ell(70, 66, s + 14), earL: disk(15, s + 15), earR: disk(15, s + 16), nose: disk(10, s + 17),
      eye: disk(8, s + 18), brow: cutPath(rectPts(-15, -3.5, 15, 3.5), s + 19, 99, .6), mouth: cutPath(rectPts(-19, -3.5, 19, 3.5), s + 20, 99, .6),
      cap: cutPath([[-74, 4], [-70, -16], [-48, -34], [-10, -42], [34, -38], [64, -22], [76, 2]], s + 21, 30, 1.2),
      brim: cutPath([[-60, -2], [-20, 10], [24, 12], [62, 0], [56, 16], [20, 24], [-22, 22], [-56, 12]], s + 22, 99, 1), capBtn: disk(6, s + 23),
    };
    return CP;
  }

  // ---------- acting, by the level's own phase e (1 = still too big to see, 0 = framed, -1 = in the next hands) ----------
  function act(e, t) {
    const up = smooth(inv(.04, .26, e));                                        // eyes up on the plain little cup he holds
    const lift = e < .02 && e > -.42 ? Math.min(smooth(inv(.02, -.08, e)), 1 - smooth(inv(-.26, -.42, e))) : 0; // brows up: he has been upgraded
    const nod = e < -.1 && e > -.34 ? Math.sin(Math.PI * inv(-.1, -.34, e)) : 0; // one nod
    const blink = Math.abs(e - .52) < .0125 || Math.abs(e + .66) < .0125;     // 0.1 s blinks
    const side = e < -.5 ? Math.sin(Math.PI * inv(-.5, -.95, e)) : 0;           // a glance down at the bigger one arriving
    const ph = ((t % .5) + .5) % .5, bp = Math.exp(-9 * ph);                    // a bob every half second (period divides 8)
    return { up, brow: lift - .3 * up, nod, blink, side, bp };
  }

  // ---------- steam: three cut-paper strips that wave upward, period 2 s ----------
  const STEAM = [[-252, 6, 300, 0, 34], [-206, 12, 230, 2.1, 28], [236, 8, 320, 4.0, 34]];
  function steamPath(i, t) {
    const [bx, by, h, ph, w0] = STEAM[i]; const n = 18, M = [];
    for (let k = 0; k <= n; k++) { const v = k / n; M.push([bx + 20 * Math.pow(v, .7) * Math.sin(TAU * (v * h / 170 - t / 2) + ph), by - h * v]); }
    const L = [], R = [];
    for (let k = 0; k <= n; k++) {
      const a = M[Math.max(0, k - 1)], b = M[Math.min(n, k + 1)], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1;
      const nx = -dy / d, ny = dx / d, w = lerp(w0, 9, k / n) / 2;
      L.push([M[k][0] + nx * w, M[k][1] + ny * w]); R.push([M[k][0] - nx * w, M[k][1] - ny * w]);
    }
    return cutPath([...L, ...R.reverse()], 32000 + i, 40, 1.2);
  }

  // sleeves raised: shoulder (+-112, -300) up to the held saucer's rim, a bit too long, like the coat
  const ARM = { rot: Math.atan2(-13, -228), len: 1.17 };
  function sleeveAt(g, s, lift, frontOnly) {
    const P = custParts();
    g.save(); g.translate(s * 112, -300); g.scale(s, 1); g.rotate(ARM.rot); g.scale(1, ARM.len);
    if (frontOnly) { g.beginPath(); g.rect(-80, 168, 160, 120); g.clip(); }
    fillParts(g, [{ p: P.sleeve, col: C.coatD }, { p: P.cuff, col: shade(C.coat, .7) }], lift);
    g.restore();
  }

  function drawCustomer(g, A, lift, t) {
    const P = custParts();
    g.save(); g.translate(CUST.x, CUST.y);
    fillParts(g, [{ p: P.coat, col: C.coat }, { p: P.flap, col: C.coatD }, { p: P.lapL, col: C.coatL }, { p: P.lapR, col: C.coatL }, { p: P.pocket, col: C.coatD }, { p: P.pocket2, col: C.coatD }], lift);
    g.save(); g.translate(14, -205); fillParts(g, [{ p: P.btn, col: C.lemon }], lift); g.translate(0, 62); fillParts(g, [{ p: P.btn, col: C.lemon }], lift); g.restore();
    sleeveAt(g, -1, lift, false); sleeveAt(g, 1, lift, false);
    // head (bobs on the half-second, nods once when he is framed)
    g.save(); g.translate(0, -404 + A.nod * 9 - A.bp * 4); g.rotate(A.nod * .05); g.scale(1 + A.bp * .02, 1 - A.bp * .02);
    g.save(); g.translate(-70, 2); fillParts(g, [{ p: P.earL, col: shade(C.peach, .93) }], lift); g.restore();
    g.save(); g.translate(70, 2); fillParts(g, [{ p: P.earR, col: shade(C.peach, .93) }], lift); g.restore();
    fillParts(g, [{ p: P.head, col: C.peach }], lift);
    const ey = -6 - A.up * 8 + A.side * 5, ex = A.side * 4;
    for (const sx of [-24, 24]) {
      g.save(); g.translate(sx + ex, ey); if (A.blink) g.scale(1.2, .25); fillParts(g, [{ p: P.eye, col: C.black }], .5 * lift); g.restore();
      g.save(); g.translate(sx, -30 - A.brow * 11 - A.up * 3); g.rotate((sx < 0 ? 1 : -1) * (.08 - A.brow * .1)); fillParts(g, [{ p: P.brow, col: C.black }], .5 * lift); g.restore();
    }
    g.save(); g.translate(2, 14); fillParts(g, [{ p: P.nose, col: C.nose }], .6 * lift); g.restore();
    g.save(); g.translate(0, 38); fillParts(g, [{ p: P.mouth, col: C.black }], .5 * lift); g.restore();
    g.save(); g.translate(2, -50); g.rotate(-.04); fillParts(g, [{ p: P.cap, col: C.cap }, { p: P.brim, col: shade(C.cap, .78) }], lift); g.translate(-6, -40); fillParts(g, [{ p: P.capBtn, col: shade(C.cap, .78) }], .5 * lift); g.restore();
    g.restore();
    g.restore();
  }

  // everything of a level except the hands' grip on the held cup
  function drawBack(g, e, t) {
    const lift = clamp(Math.pow(S, e * .6), 0, 1.8), A = act(e, t), bp = A.bp;
    for (const [i, st] of LV.stars.entries()) {
      g.save(); g.translate(st.x, st.y); g.rotate(st.rot + bp * .05 * (hash(i + 7) - .5)); g.scale(1 + bp * .04, 1 + bp * .04);
      fillParts(g, [{ p: st.p, col: st.col }], lift);
      if (st.pin) pinAt(g, 4, -6, C.verm, lift);
      g.restore();
    }
    fillParts(g, [{ p: LV.handle, col: C.white, eo: true }], lift);
    fillParts(g, [{ p: LV.saucer, col: C.lemon }, { p: LV.saucerWell, col: shade(C.lemon, .9), noShadow: true }], lift);
    fillParts(g, [{ p: LV.body, col: C.white }, { p: LV.band, col: C.verm }, { p: LV.bandThin, col: C.verm }], lift);
    fillParts(g, [{ p: LV.lining, col: shade(C.white, .8), noShadow: true }, { p: LV.coffee, col: C.cap, noShadow: true }], lift);
    g.save(); g.translate(0, 16); g.scale(1 + .05 * bp, 1 + .05 * bp); g.translate(0, -16);
    fillParts(g, [{ p: LV.crema, col: shade(C.cap, 1.55) }, { p: LV.cremaIn, col: shade(C.cap, 1.25), noShadow: true }], .5 * lift);
    g.restore();
    fillParts(g, STEAM.map((_, i) => ({ p: steamPath(i, t), col: C.white })), .8 * lift);
    g.save(); g.clip(LV.dunk); drawCustomer(g, A, lift, t); g.restore();
  }
  // the cuffs close over the held cup: drawn after every smaller level
  function drawFront(g, e) {
    const lift = clamp(Math.pow(S, e * .6), 0, 1.8);
    g.save(); g.translate(CUST.x, CUST.y); sleeveAt(g, -1, lift, true); sleeveAt(g, 1, lift, true); g.restore();
  }

  // level bounds (rel. to XS) for culling
  const BB = { x0: -560, x1: 560, y0: -820, y1: 520 };
  function levelTransform(g, e) {
    const sig = SIG0 * Math.pow(S, e);
    g.translate(CX, CY); g.scale(sig, sig); g.translate(-XS[0], -XS[1]);
    return sig;
  }
  function visible(e) {
    const sig = SIG0 * Math.pow(S, e);
    return CX + BB.x1 * sig > 0 && CX + BB.x0 * sig < VW && CY + BB.y1 * sig > 0 && CY + BB.y0 * sig < VH;
  }

  function drawFrame(g, tIn) {
    const t = ((tIn % PERIOD) + PERIOD) % PERIOD;
    K = CW / VW;
    g.setTransform(K, 0, 0, K, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    g.fillStyle = C.ultra; g.fillRect(0, 0, VW, VH);
    const es = [];
    for (let L = Math.ceil(EMIN + t / PERIOD); L - t / PERIOD < EMAX; L++) es.push(L - t / PERIOD);
    es.sort((a, b) => b - a); // biggest first
    for (const e of es) { if (!visible(e)) continue; g.save(); levelTransform(g, e); drawBack(g, e, t); g.restore(); }
    for (let i = es.length - 1; i >= 0; i--) { const e = es[i]; if (!visible(e)) continue; g.save(); levelTransform(g, e); drawFront(g, e); g.restore(); }
    g.setTransform(K, 0, 0, K, 0, 0);
    if (TEX) { g.globalCompositeOperation = 'overlay'; g.globalAlpha = .55; g.drawImage(TEX, 0, 0, VW, VH); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }
  }

  function render(t) { try { drawFrame(G, t); } catch (e) { console.error(e); } }
  window.__ready = new Promise((res) => { makeTexture(); buildLevel(); custParts(); res(true); });
  window.__framePNG = (t) => { render(t); return canvas.toDataURL('image/png'); };
  window.__frameJPEG = (t, q = .92) => { render(t); return canvas.toDataURL('image/jpeg', q); };

  // live preview (not used offline): plays the loop on the wall clock of the page's own timeline
  if (!params.has('offline')) {
    let t0 = null;
    window.__ready.then(() => (function loop(now) { if (t0 === null) t0 = now || 0; render(((now || 0) - t0) / 1000); requestAnimationFrame(loop); })());
  }
})();
