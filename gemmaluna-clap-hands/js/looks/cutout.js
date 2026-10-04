// LOOK PROBE: paper theatre. 58.9 - 74.433 (verse 2: the roars, the boats leaving, the bird on the pole,
// the millionaire's coal). After Sarah Legault's video for Rheostatics' "The Inland Sea": painted plates
// (an oil-painted sea and sky, painted ships) cut out with scissors and slid past each other in layers,
// clouds as scalloped cards with soft drop shadows, puppets that move by swapping and pivoting pieces.
// Everything painted is made ONCE at load (seeded); a frame only moves the pieces. The song's cast comes
// from js/cast.js, cut out of its own layer each frame so it sits in the same paper world.
const LOOK = {
  span: [58.875, 74.458333],   // song frames 1413 - 1787 (24 fps)
  frag: `
uniform float flash, warm;
void main(){
  vec3 c = texture(src, uv).rgb;
  // canvas weave and paper tooth
  vec2 px = uv * res;
  float weave = (sin(px.x * 1.9) * sin(px.y * 1.9)) * .5 + .5;
  float tooth = fbm(px * .045) - .5;
  c *= 1. + (weave - .5) * .035 + tooth * .07;
  c += (vn(px * .5 + t * 61.) - .5) * .025;
  // grade: lift the blacks a touch like a print, warm or cool by shot
  c = mix(vec3(.06, .05, .05), vec3(1.), c);
  c *= mix(vec3(.96, 1., 1.05), vec3(1.07, 1., .9), warm);
  c += flash * vec3(.55, .55, .65) * (1. - length(uv - vec2(.5, .2)) * .8);
  vec2 v = uv - .5; c *= 1. - dot(v, v) * .7;
  o = vec4(c, 1.);
}`,
  uniforms: (t, X) => ({ flash: X.flash ?? 0, warm: X.warm ?? .3 }),
};

(() => {
  const ROARS = [59.1, 60.1, 61.13, 62.13];   // vocal onsets (from c03): roar, roar, thunder, roar
  const LIGHT = 67.55, BIRD = 69.33;
  const BITES = [71.367, 72.4, 73.433], TOSSES = [71.9, 72.9, 73.933];
  const END = LOOK.span[1];

  // ---------- canvases ----------
  const mk = (w, h, fn) => { const c = document.createElement('canvas'); c.width = Math.ceil(w); c.height = Math.ceil(h); const g = c.getContext('2d'); if (fn) fn(g, c.width, c.height); return c; };
  const LAY = mk(W, H), lay = LAY.getContext('2d');      // live cut-outs (the cast) are drawn here first
  const TMP = mk(W, H), tmp = TMP.getContext('2d');
  const LIT = mk(W, H), lit = LIT.getContext('2d');      // light: added on top at the end
  let main = null;

  // ---------- colour ----------
  const hx = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  const rgb = (a, al = 1) => `rgba(${a.map((v) => Math.round(clamp(v, 0, 255))).join(',')},${al})`;
  const mixc = (a, b, k) => a.map((v, i) => lerp(v, b[i], k));
  const grad = (stops, u) => { u = clamp(u); for (let i = 1; i < stops.length; i++) if (u <= stops[i][0]) { const [a, ca] = stops[i - 1], [b, cb] = stops[i]; return mixc(hx(ca), hx(cb), (u - a) / (b - a)); } return hx(stops[stops.length - 1][1]); };

  // ---------- painting (only at load) ----------
  const path = (pts) => { const p = new Path2D(); pts.forEach(([x, y], i) => i ? p.lineTo(x, y) : p.moveTo(x, y)); p.closePath(); return p; };
  // fill a shape, then lay oil dabs inside it. col(x, y) gives the local colour; jit varies each dab's value.
  function paint(g, p, box, col, seed, o = {}) {
    const { n = 400, len = 26, wid = 9, ang = 0, angJ = .5, jit = .14, alpha = .55, base = true } = o;
    const [x0, y0, x1, y1] = box, r = rng(seed);
    g.save();
    if (base) { const lg = g.createLinearGradient(0, y0, 0, y1); for (let i = 0; i <= 8; i++) lg.addColorStop(i / 8, rgb(col(lerp(x0, x1, .5), lerp(y0, y1, i / 8)))); g.fillStyle = lg; g.fill(p); }
    g.clip(p);
    for (let i = 0; i < n; i++) {
      const x = lerp(x0, x1, r()), y = lerp(y0, y1, r()), c = col(x, y), k = 1 + (r() - .5) * 2 * jit, warmth = (r() - .5) * 10;
      g.globalAlpha = alpha * (.5 + r() * .5); g.fillStyle = rgb([c[0] * k + warmth, c[1] * k, c[2] * k - warmth]);
      g.beginPath(); g.ellipse(x, y, len * (.5 + r()), wid * (.6 + r() * .6), ang + (r() - .5) * angJ, 0, TAU); g.fill();
    }
    g.restore();
  }
  // a cut-out: the piece plus a thin paper edge, with padding; anchor (ax, ay) in the piece's own coords
  function cut(w, h, ax, ay, fn, edge = 3, edgeC = 'rgba(236,228,210,.85)') {
    const pad = edge + 2, art = mk(w, h, fn);
    const sil = mk(w, h, (g) => { g.drawImage(art, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = edgeC; g.fillRect(0, 0, w, h); });
    const c = mk(w + pad * 2, h + pad * 2, (g) => { for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; g.drawImage(sil, pad + Math.cos(a) * edge, pad + Math.sin(a) * edge); } g.drawImage(art, pad, pad); });
    return { c, ax: ax + pad, ay: ay + pad };
  }
  // place a piece with its drop shadow. depth scales the shadow (pieces further from the backdrop cast longer shadows).
  function put(sp, x, y, sc = 1, rot = 0, sh = 1, alpha = 1) {
    const g = main; g.save(); g.globalAlpha = alpha;
    if (sh > 0) { g.shadowColor = `rgba(18,14,12,${.42 * Math.min(1, sh)})`; g.shadowBlur = 22 * sh; g.shadowOffsetX = 7 * sh; g.shadowOffsetY = 12 * sh; }
    g.translate(x, y); g.rotate(rot); g.scale(sc, sc); g.drawImage(sp.c, -sp.ax, -sp.ay); g.restore();
  }
  function glow(x, y, r, col, a = 1) { lit.save(); lit.setTransform(main.getTransform()); lit.globalCompositeOperation = 'lighter'; lit.globalAlpha = a; const gr = lit.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)'); lit.fillStyle = gr; lit.fillRect(x - r, y - r, r * 2, r * 2); lit.restore(); }

  // ---------- the plates ----------
  const STORM = [[0, '#1f2833'], [.45, '#3a4752'], [.8, '#6d7a7c'], [1, '#8c9488']];
  const DUSK = [[0, '#26303f'], [.5, '#4a5a6a'], [.85, '#9a9a88'], [1, '#c2b089']];
  const NIGHT = [[0, '#141a29'], [.6, '#26324a'], [1, '#3f4c63']];
  const skyPlate = (stops, seed) => cut(1400, 1300, 0, 0, (g, w, h) => paint(g, path([[0, 0], [w, 0], [w, h], [0, h]]), [0, 0, w, h], (x, y) => grad(stops, y / h), seed, { n: 2600, len: 40, wid: 14, ang: 0, angJ: .35, jit: .12, alpha: .5 }), 0);
  const SKY = { storm: skyPlate(STORM, 11), dusk: skyPlate(DUSK, 12), night: skyPlate(NIGHT, 13) };

  // a sea strip: wavy cut top edge, painted water with crests. Wide, so it can slide.
  function seaStrip(w, h, seed, top, deep, crest, amp) {
    return cut(w, h, 0, amp + 20, (g) => {
      const pts = [[0, h]]; for (let x = 0; x <= w; x += 12) pts.push([x, amp + 20 - amp * (.55 * Math.sin(x * .011 + seed) + .3 * Math.sin(x * .027 + seed * 2) + .15 * snoise(x * .02, seed))]); pts.push([w, h]);
      const p = path(pts);
      paint(g, p, [0, 0, w, h], (x, y) => grad([[0, top], [.35, deep], [1, deep]], y / h), seed, { n: Math.round(w * h / 260), len: 30, wid: 6, ang: 0, angJ: .25, jit: .16, alpha: .6 });
      // crest strokes and foam along the swells
      const r = rng(seed + 5); g.save(); g.clip(p);
      for (let i = 0; i < w * h / 2600; i++) { const x = r() * w, y = 20 + r() * h * .7; g.globalAlpha = .25 + r() * .45; g.strokeStyle = rgb(hx(crest)); g.lineWidth = 2 + r() * 4; g.lineCap = 'round'; g.beginPath(); const L = 20 + r() * 50; g.moveTo(x - L / 2, y); g.quadraticCurveTo(x, y - 6 - r() * 6, x + L / 2, y + 2); g.stroke(); }
      g.restore();
    }, 3, 'rgba(210,214,200,.7)');
  }
  const SEA = {
    back: seaStrip(2600, 360, 3, '#6f8584', '#47605f', '#c9d3c8', 14),
    mid: seaStrip(2600, 520, 7, '#4f6c69', '#30494a', '#dbe3d6', 30),
    front: seaStrip(2600, 760, 9, '#3d5a58', '#1f3536', '#e6ecdf', 46),
  };
  const SEA_N = {
    back: seaStrip(2600, 360, 23, '#33415a', '#222c40', '#8fa0c0', 12),
    front: seaStrip(2600, 760, 29, '#26324a', '#141b2b', '#a6b4d4', 36),
  };

  // a cloud card: a flat base with scalloped puffs along the top, painted light above and dark below
  function cloud(w, h, seed, hi, lo) {
    const r = rng(seed), lobes = []; let x = w * .06;
    while (x < w * .94) { const rr = h * (.2 + r() * .22) * (.7 + .55 * Math.sin(x / w * Math.PI)); lobes.push([x, h * .62 - rr * (.5 + r() * .4), rr]); x += rr * (1.1 + r() * .5); }
    return cut(w, h, w / 2, h * .8, (g) => {
      const p = new Path2D(); p.rect(w * .04, h * .55, w * .92, h * .3); for (const [lx, ly, lr] of lobes) { p.moveTo(lx + lr, ly); p.arc(lx, ly, lr, 0, TAU); }
      // bottom edge: a soft scallop too
      for (let i = 0; i < 9; i++) { const cx = lerp(w * .08, w * .92, i / 8), rr = h * .1; p.moveTo(cx + rr, h * .82); p.arc(cx, h * .82, rr, 0, TAU); }
      paint(g, p, [0, 0, w, h], (_, y) => mixc(hx(hi), hx(lo), smooth(inv(h * .2, h * .9, y))), seed, { n: Math.round(w * h / 300), len: 24, wid: 10, ang: 0, angJ: 1.6, jit: .1, alpha: .5 });
      // inner lobe lines, like the cut edges of the layered card
      g.save(); g.clip(p); g.strokeStyle = 'rgba(40,45,55,.25)'; g.lineWidth = 3; for (const [lx, ly, lr] of lobes) { g.beginPath(); g.arc(lx, ly + lr * .35, lr * .8, Math.PI * 1.15, Math.PI * 1.85); g.stroke(); } g.restore();
    }, 3, 'rgba(225,228,222,.75)');
  }
  const CL = {
    s1: cloud(1100, 420, 31, '#7f8a92', '#3a434e'), s2: cloud(900, 380, 32, '#8c969b', '#444d58'), s3: cloud(1300, 480, 33, '#6c7781', '#2e3640'),
    s4: cloud(800, 340, 34, '#97a0a2', '#4f5860'), s5: cloud(1000, 400, 35, '#5f6a75', '#262e38'),
    d1: cloud(1000, 400, 41, '#d9d6cb', '#8b929a'), d2: cloud(1200, 460, 42, '#e3ddcf', '#9aa0a5'), d3: cloud(800, 320, 43, '#cfcdc5', '#7d858e'),
    n1: cloud(1100, 420, 51, '#3d4860', '#1b2232'), n2: cloud(900, 360, 52, '#46526b', '#20283a'),
    smoke: cloud(260, 150, 61, '#5a5654', '#2c2a2b'), smoke2: cloud(220, 140, 62, '#6a6461', '#333031'),
  };

  // lightning: a yellow card bolt with an orange edge
  function bolt(seed) {
    const r = rng(seed), pts = [], w = 460, h = 1150; let x = w * .5, y = 0; const L = [], R = [];
    for (let i = 0; i < 7; i++) { const nx = clamp(x + (r() - .5) * 220, 60, w - 60), ny = y + h / 7; L.push([x - 30 + i * 2, y]); R.push([x + 34 - i * 3.5, y]); x = nx; y = ny; }
    L.push([x, h]); const poly = [...L, ...R.reverse()];
    return cut(w, h, w / 2, 0, (g) => { const p = path(poly); g.fillStyle = '#f4d36a'; g.fill(p); g.lineWidth = 8; g.strokeStyle = '#d9892c'; g.stroke(p); paint(g, p, [0, 0, w, h], () => hx('#f6dc7c'), seed, { n: 300, len: 14, wid: 5, base: false, jit: .12, alpha: .5 }); }, 3, 'rgba(255,248,225,.9)');
  }
  const BOLTS = [bolt(71), bolt(72), bolt(73), bolt(74)];

  // the paddle steamer, side view, facing left; anchor at the waterline centre
  const STEAMER = cut(1000, 560, 500, 470, (g) => {
    const hull = path([[40, 420], [960, 420], [930, 500], [120, 510], [60, 470]]);
    paint(g, hull, [40, 400, 960, 520], () => hx('#24201f'), 81, { n: 500, len: 30, wid: 6, jit: .2 });
    g.fillStyle = '#9a3a2c'; g.fill(path([[52, 455], [955, 455], [948, 470], [58, 472]]));
    const deck1 = path([[110, 420], [900, 420], [890, 330], [130, 330]]), deck2 = path([[220, 330], [800, 330], [790, 262], [240, 262]]), pilot = path([[300, 262], [400, 262], [400, 205], [300, 205]]);
    for (const [p, b, sd] of [[deck1, [110, 330, 900, 420], 82], [deck2, [220, 262, 800, 330], 83], [pilot, [300, 205, 400, 262], 84]]) paint(g, p, b, () => hx('#e6dcc6'), sd, { n: 260, len: 18, wid: 6, jit: .1 });
    g.fillStyle = '#2b2a2c'; for (let x = 150; x < 880; x += 34) g.fillRect(x, 352, 16, 26); for (let x = 260; x < 780; x += 30) g.fillRect(x, 280, 13, 20); g.fillRect(318, 220, 64, 18);
    g.strokeStyle = '#3b3532'; g.lineWidth = 5; for (const y of [330, 262]) { g.beginPath(); g.moveTo(100, y); g.lineTo(910, y); g.stroke(); }
    // paddle box
    const box = new Path2D(); box.moveTo(430, 420); box.arc(550, 420, 120, Math.PI, 0); box.closePath();
    paint(g, box, [430, 300, 670, 420], () => hx('#d8c79e'), 85, { n: 200, len: 14, wid: 5 });
    g.strokeStyle = '#7a5a32'; g.lineWidth = 4; for (let i = 1; i < 9; i++) { const a = Math.PI + i / 9 * Math.PI; g.beginPath(); g.moveTo(550, 420); g.lineTo(550 + Math.cos(a) * 118, 420 + Math.sin(a) * 118); g.stroke(); }
    g.lineWidth = 7; g.beginPath(); g.arc(550, 420, 120, Math.PI, 0); g.stroke();
    // stacks with gold bands
    for (const sx of [470, 620]) { paint(g, path([[sx, 262], [sx + 34, 262], [sx + 38, 40], [sx - 4, 40]]), [sx - 4, 40, sx + 38, 262], () => hx('#1e1c1d'), sx, { n: 120, len: 12, wid: 4 }); g.fillStyle = '#c9a046'; g.fillRect(sx - 4, 58, 42, 12); g.fillRect(sx - 2, 120, 38, 8); }
    g.strokeStyle = '#2b2522'; g.lineWidth = 4; g.beginPath(); g.moveTo(80, 420); g.lineTo(70, 250); g.moveTo(920, 420); g.lineTo(930, 300); g.stroke();
    g.fillStyle = '#a8402e'; g.fill(path([[70, 250], [20, 262], [70, 276]]));
  });
  // a two-masted schooner under sail, facing left; anchor at the waterline centre
  function schooner(seed, sail = '#ece2c8') {
    return cut(760, 880, 380, 800, (g) => {
      const hull = path([[60, 760], [700, 740], [660, 820], [150, 830]]);
      paint(g, hull, [60, 740, 700, 830], () => hx('#3b2a20'), seed, { n: 260, len: 24, wid: 6, jit: .2 });
      g.fillStyle = '#e8dcc0'; g.fill(path([[70, 768], [695, 750], [690, 762], [76, 780]]));
      g.strokeStyle = '#3a2a1e'; g.lineWidth = 9; g.beginPath(); g.moveTo(300, 760); g.lineTo(290, 70); g.moveTo(520, 750); g.lineTo(515, 110); g.stroke();
      g.lineWidth = 6; g.beginPath(); g.moveTo(60, 740); g.lineTo(-10, 690); g.stroke();
      const sails = [
        [[296, 130], [296, 700], [500, 690], [480, 180]], [[518, 160], [518, 690], [700, 680], [680, 220]],
        [[288, 110], [20, 690], [280, 700]], [[180, 330], [0, 700], [150, 700]],
      ];
      sails.forEach((sp, i) => { const p = path(sp), xs = sp.map((q) => q[0]), ys = sp.map((q) => q[1]); paint(g, p, [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)], (x) => mixc(hx(sail), hx('#b9ad92'), clamp((x - Math.min(...xs)) / 260) * .6), seed + i, { n: 300, len: 22, wid: 7, ang: 1.4, angJ: .3, jit: .08 }); g.strokeStyle = 'rgba(80,65,45,.6)'; g.lineWidth = 3; g.stroke(p); });
      g.fillStyle = '#a8402e'; g.fill(path([[290, 70], [240, 82], [290, 96]]));
      g.strokeStyle = 'rgba(50,40,30,.7)'; g.lineWidth = 2; g.beginPath(); g.moveTo(290, 70); g.lineTo(-10, 690); g.moveTo(515, 110); g.lineTo(700, 740); g.stroke();
    });
  }
  const SCH = [schooner(91), schooner(92, '#e4d6b4')];

  // the heron: standing, flying body, and a wing that pivots at the shoulder (puppet pieces)
  const GREYB = '#7d8ea0', GREYD = '#4c5a6c';
  const HERON_STAND = cut(420, 760, 210, 740, (g) => {
    const body = path([[120, 330], [180, 280], [290, 300], [350, 360], [330, 420], [250, 450], [150, 430], [60, 470], [100, 400]]);
    paint(g, body, [60, 280, 350, 470], (x, y) => mixc(hx(GREYB), hx(GREYD), inv(300, 460, y)), 101, { n: 300, len: 16, wid: 6, ang: .3 });
    const neck = new Path2D(); neck.moveTo(300, 310); neck.bezierCurveTo(340, 250, 250, 210, 270, 150); neck.bezierCurveTo(285, 110, 320, 95, 330, 100); neck.lineTo(338, 120); neck.bezierCurveTo(310, 125, 300, 150, 300, 175); neck.bezierCurveTo(300, 230, 370, 260, 340, 330); neck.closePath();
    paint(g, neck, [250, 90, 370, 330], () => hx('#d9dde0'), 102, { n: 160, len: 10, wid: 4 });
    g.fillStyle = '#e1b44a'; g.fill(path([[328, 100], [410, 118], [336, 124]]));
    g.fillStyle = '#1f232a'; g.beginPath(); g.arc(318, 108, 5, 0, TAU); g.fill();
    g.strokeStyle = '#1f232a'; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(300, 100); g.quadraticCurveTo(250, 90, 220, 110); g.stroke();
    g.strokeStyle = '#3a3a34'; g.lineWidth = 9; g.beginPath(); g.moveTo(220, 440); g.lineTo(215, 600); g.lineTo(230, 740); g.moveTo(250, 440); g.lineTo(262, 600); g.lineTo(250, 740); g.stroke();
    g.lineWidth = 5; g.beginPath(); g.moveTo(170, 740); g.lineTo(300, 740); g.stroke();
  });
  const HERON_FLY = cut(760, 260, 380, 140, (g) => {
    const body = path([[200, 110], [300, 90], [460, 100], [540, 130], [460, 170], [300, 170], [210, 150]]);
    paint(g, body, [200, 90, 540, 170], (x, y) => mixc(hx(GREYB), hx(GREYD), inv(95, 170, y)), 103, { n: 200, len: 14, wid: 5 });
    const neck = new Path2D(); neck.moveTo(240, 110); neck.bezierCurveTo(190, 80, 150, 130, 120, 110); neck.lineTo(110, 130); neck.bezierCurveTo(160, 160, 210, 140, 240, 140); neck.closePath();
    paint(g, neck, [110, 80, 240, 160], () => hx('#d9dde0'), 104, { n: 80, len: 10, wid: 4 });
    g.fillStyle = '#e1b44a'; g.fill(path([[118, 110], [30, 124], [114, 128]]));
    g.strokeStyle = '#3a3a34'; g.lineWidth = 8; g.lineCap = 'round'; g.beginPath(); g.moveTo(520, 140); g.lineTo(740, 150); g.moveTo(520, 150); g.lineTo(735, 165); g.stroke();
  });
  const WING = cut(520, 220, 40, 60, (g) => {   // pivot at the shoulder (left end); spreads to the right
    const p = path([[30, 40], [200, 20], [380, 40], [510, 90], [440, 110], [470, 140], [380, 150], [400, 185], [290, 175], [270, 210], [160, 160], [40, 100]]);
    paint(g, p, [30, 20, 510, 210], (x) => mixc(hx('#8d9cac'), hx('#3e4a5a'), inv(200, 500, x)), 105, { n: 300, len: 22, wid: 6, ang: .15 });
    g.strokeStyle = 'rgba(30,35,45,.5)'; g.lineWidth = 3; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(180 + i * 50, 60); g.lineTo(240 + i * 50, 150); g.stroke(); }
  });

  // waterfront: a brick warehouse face with a roofline, and a cast-iron lamp pole
  const WAREHOUSE = cut(900, 1500, 0, 1500, (g, w, h) => {
    const p = path([[0, 120], [520, 120], [560, 60], [600, 120], [880, 120], [880, 1500], [0, 1500]]);
    paint(g, p, [0, 60, 880, 1500], (x, y) => mixc(hx('#6e3a2e'), hx('#3c2420'), inv(100, 1500, y) * .7 + inv(0, 880, x) * .2), 111, { n: 3200, len: 16, wid: 7, jit: .18 });
    g.save(); g.clip(p); g.strokeStyle = 'rgba(30,18,14,.45)'; g.lineWidth = 3;
    for (let y = 140, row = 0; y < 1500; y += 34, row++) { g.beginPath(); g.moveTo(0, y); g.lineTo(880, y); g.stroke(); for (let x = (row % 2) * 40; x < 880; x += 80) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 34); g.stroke(); } }
    g.restore();
    g.fillStyle = '#2a201c'; g.fillRect(0, 108, 880, 26); g.fillStyle = '#c2a87a'; g.fillRect(0, 134, 880, 14);
    for (const wx of [80, 330, 600]) { const a = new Path2D(); a.moveTo(wx, 470); a.lineTo(wx, 320); a.arc(wx + 80, 320, 80, Math.PI, 0); a.lineTo(wx + 160, 470); a.closePath(); g.fillStyle = '#1b1a22'; g.fill(a); g.strokeStyle = '#c2a87a'; g.lineWidth = 10; g.stroke(a); g.fillStyle = '#c2a87a'; g.fillRect(wx - 16, 470, 192, 16); }
    g.fillStyle = '#231a16'; g.fillRect(560, 1180, 220, 320); g.strokeStyle = '#c2a87a'; g.lineWidth = 10; g.strokeRect(560, 1180, 220, 320);
  });
  const POLE = cut(200, 1500, 100, 1500, (g) => {
    const p = path([[86, 1500], [114, 1500], [108, 300], [92, 300]]);
    paint(g, p, [86, 300, 114, 1500], () => hx('#2a2f2c'), 121, { n: 300, len: 12, wid: 4 });
    g.fillStyle = '#2a2f2c'; g.fillRect(60, 1440, 80, 60); g.fillRect(70, 290, 60, 16);
    const lamp = path([[60, 290], [140, 290], [128, 170], [72, 170]]); paint(g, lamp, [60, 170, 140, 290], () => hx('#e8c27a'), 122, { n: 80, len: 10, wid: 4 });
    g.strokeStyle = '#2a2f2c'; g.lineWidth = 8; g.stroke(lamp); g.fillStyle = '#2a2f2c'; g.fill(path([[50, 172], [150, 172], [100, 120]])); g.fillRect(94, 96, 12, 26);
  });

  // the boiler room
  const IRON = cut(1400, 2100, 0, 0, (g, w, h) => {
    paint(g, path([[0, 0], [w, 0], [w, h], [0, h]]), [0, 0, w, h], (x, y) => mixc(hx('#4a3f38'), hx('#231d1a'), inv(0, h, y) * .8), 131, { n: 4000, len: 30, wid: 9, jit: .2 });
    g.strokeStyle = 'rgba(15,12,10,.55)'; g.lineWidth = 6; for (let x = 0; x < w; x += 280) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 0; y < h; y += 360) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    for (let x = 0; x < w; x += 280) for (let y = 20; y < h; y += 40) { g.fillStyle = 'rgba(120,100,85,.5)'; g.beginPath(); g.arc(x + 14, y, 4, 0, TAU); g.fill(); }
    // a pipe run along the top
    paint(g, path([[0, 300], [w, 300], [w, 360], [0, 360]]), [0, 300, w, 360], (_, y) => mixc(hx('#9a7a4a'), hx('#4a3520'), inv(300, 360, y)), 132, { n: 400, len: 20, wid: 5, ang: 0, angJ: .1 });
  });
  const BOILER = cut(620, 1300, 310, 1300, (g, w, h) => {
    const p = new Path2D(); p.moveTo(20, h); p.lineTo(20, 300); p.arc(310, 300, 290, Math.PI, 0); p.lineTo(600, h); p.closePath();
    paint(g, p, [20, 10, 600, h], (x) => mixc(hx('#3b4442'), hx('#1c2120'), Math.abs(x - 310) / 300), 141, { n: 2200, len: 22, wid: 7, jit: .2 });
    g.fillStyle = 'rgba(150,140,120,.6)'; for (let i = 0; i < 14; i++) { const a = Math.PI + i / 13 * Math.PI; g.beginPath(); g.arc(310 + Math.cos(a) * 260, 300 + Math.sin(a) * 260, 7, 0, TAU); g.fill(); } for (let y = 330; y < h; y += 60) for (const x of [50, 570]) { g.beginPath(); g.arc(x, y, 7, 0, TAU); g.fill(); }
    // the mouth (cut through: transparent, so the fire behind shows)
    g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; const m = new Path2D(); m.moveTo(170, 700); m.lineTo(170, 520); m.arc(310, 520, 140, Math.PI, 0); m.lineTo(450, 700); m.closePath(); g.fill(m);
    g.globalCompositeOperation = 'source-over'; g.strokeStyle = '#8a6a3a'; g.lineWidth = 14; g.stroke(m);
  });
  const DOOR = cut(300, 220, 0, 110, (g) => { const p = path([[0, 0], [290, 20], [290, 200], [0, 220]]); paint(g, p, [0, 0, 290, 220], () => hx('#4a4038'), 151, { n: 300, len: 16, wid: 6, jit: .2 }); g.strokeStyle = '#8a6a3a'; g.lineWidth = 10; g.stroke(p); g.fillStyle = '#c9a046'; g.beginPath(); g.arc(250, 110, 16, 0, TAU); g.fill(); });
  const COALHEAP = cut(760, 340, 380, 320, (g) => {
    const r = rng(161); const p = new Path2D(); p.moveTo(10, 320); for (let i = 0; i <= 20; i++) { const u = i / 20; p.lineTo(10 + u * 740, 320 - Math.sin(u * Math.PI) * 260 * (.85 + r() * .3)); } p.closePath();
    paint(g, p, [10, 40, 750, 320], () => hx('#24222c'), 162, { n: 900, len: 14, wid: 10, angJ: 3, jit: .45, alpha: .8 });
    g.save(); g.clip(p); for (let i = 0; i < 160; i++) { g.fillStyle = `rgba(150,160,190,${.15 + r() * .3})`; g.beginPath(); g.ellipse(r() * 760, 60 + r() * 260, 6 + r() * 6, 3, r() * 3, 0, TAU); g.fill(); } g.restore();
  });
  const LUMP = cut(60, 50, 30, 25, (g) => { g.fillStyle = '#1e1d24'; g.fill(path([[6, 30], [20, 6], [44, 4], [56, 26], [40, 46], [14, 44]])); g.fillStyle = 'rgba(160,170,200,.5)'; g.fill(path([[22, 10], [40, 8], [30, 20]])); });
  const FLAMES = [0, 1, 2].map((k) => cut(300, 260, 150, 260, (g) => {
    const r = rng(170 + k);
    for (const [col, sc] of [['#b8401e', 1], ['#e98a2c', .78], ['#f6d36a', .5]]) { const p = new Path2D(); p.moveTo(150 - 140 * sc, 260); for (let i = 0; i <= 8; i++) { const u = i / 8, x = 150 + (u - .5) * 280 * sc, peak = (i % 2 === 0 ? 1 : .45) * (180 + r() * 70) * sc; p.lineTo(x, 260 - peak); } p.lineTo(150 + 140 * sc, 260); p.closePath(); g.fillStyle = col; g.fill(p); }
  }, 2, 'rgba(255,230,180,.6)'));

  // ---------- frame helpers ----------
  function begin(t, warm = .3) {
    main = s; lit.setTransform(1, 0, 0, 1, 0, 0); lit.globalCompositeOperation = 'source-over'; lit.fillStyle = '#000'; lit.fillRect(0, 0, W, H);
    fx({ warm });
  }
  function finish() { main.save(); main.setTransform(1, 0, 0, 1, 0, 0); main.globalCompositeOperation = 'lighter'; main.drawImage(LIT, 0, 0); main.restore(); }
  // a slid, bobbing sea layer (tiles the wide strip so it can scroll forever)
  // one wide strip slid sideways over the shot (never tiled, so no seams); |speed| * shot length < 650
  function seaLayer(sp, y, speed, lt, bob, sh = .6, t = lt) {
    put(sp, -760 - speed * lt, y + Math.sin(t * 1.3 + y * .01) * bob, 1, Math.sin(t * .9 + y) * .004, sh);
  }
  function rainOn(t, n, a, seed) {
    const g = main, r = rng(seed); g.save(); g.lineCap = 'round';
    for (let i = 0; i < n; i++) { const x0 = r() * (W + 400) - 200, sp = 1800 + r() * 900, y = ((r() * H + t * sp) % (H + 300)) - 150, L = 40 + r() * 50; g.strokeStyle = `rgba(215,222,230,${a * (.35 + r() * .5)})`; g.lineWidth = 1.5 + r() * 2; g.beginPath(); g.moveTo(x0 + y * .12, y); g.lineTo(x0 + (y + L) * .12, y + L); g.stroke(); }
    g.restore();
  }
  // the cast, cut out of its own layer: drawn live on LAY, then given the paper edge and a shadow
  function liveCut(draw, sh = 1) {
    lay.setTransform(1, 0, 0, 1, 0, 0); lay.clearRect(0, 0, W, H); const M = main.getTransform(); lay.setTransform(M); lit.setTransform(M);   // follow the camera
    const S0 = s; s = lay; f = lit; try { draw(); } finally { s = S0; f = null; lay.setTransform(1, 0, 0, 1, 0, 0); lit.setTransform(1, 0, 0, 1, 0, 0); }
    tmp.setTransform(1, 0, 0, 1, 0, 0); tmp.globalCompositeOperation = 'copy'; tmp.drawImage(LAY, 0, 0); tmp.globalCompositeOperation = 'source-in'; tmp.fillStyle = 'rgba(236,228,210,.85)'; tmp.fillRect(0, 0, W, H); tmp.globalCompositeOperation = 'source-over';
    const g = main; g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
    g.shadowColor = 'rgba(18,14,12,.45)'; g.shadowBlur = 22 * sh; g.shadowOffsetX = 7 * sh; g.shadowOffsetY = 12 * sh; g.drawImage(TMP, 0, 0);
    g.shadowColor = 'transparent'; for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; g.drawImage(TMP, Math.cos(a) * 3, Math.sin(a) * 3); }
    g.drawImage(LAY, 0, 0); g.restore();
  }
  const bob = (t, k, a) => Math.sin(t * 1.6 + k) * a;
  // a smoke puff born at (x, y) at time b: rises, drifts with the wind, grows, then fades
  function puff(t, b, x, y, wind, sp, sc0 = .5) { const lt = t - b; if (lt < 0 || lt > 3) return; put(sp, x + wind * lt, y - 70 * lt, sc0 + lt * .35, Math.sin(b * 7) * .2, .5, clamp(1 - lt / 3) * .95); }

  // ---------- shots ----------
  // 1. the storm: cards of cloud slide across, the sea heaves, a paper bolt snaps down on every roar
  function storm(t, lt, dur) {
    begin(t, .15);
    const roar = ROARS.reduce((m, k, i) => (t >= k ? i : m), -1), since = roar >= 0 ? t - ROARS[roar] : 9;
    const shake = roar === 2 ? Math.exp(-6 * since) * 14 : roar >= 0 ? Math.exp(-8 * since) * 5 : 0;
    main.save(); main.translate(Math.sin(t * 61) * shake, Math.cos(t * 47) * shake);
    put(SKY.storm, -160 - lt * 8, -100, 1.0, 0, 0);
    put(CL.s4, 300 + lt * 14, 520, 1, 0, .4); put(CL.s2, 900 - lt * 10, 470, 1, 0, .5);
    // the bolt: snaps on the roar, holds a few frames (on twos), then gone
    if (roar >= 0 && since < .42) { const b = BOLTS[roar], bx = [560, 330, 720, 470][roar]; put(b, bx + (onTwos(t) * 50 % 2 < 1 ? 0 : 4), 330, 1, [-.05, .08, -.12, .03][roar], .8); glow(bx, 700, 700, 'rgba(255,220,150,.55)', Math.exp(-5 * since)); }
    put(CL.s1, 260 - lt * 22, 640, 1, 0, .8); put(CL.s3, 960 + lt * 18, 700, 1, 0, .9);
    // a schooner pitching far out, the boats we will follow
    seaLayer(SEA.back, 1080, 60, lt, 6, .4, t);
    put(SCH[0], 780, 1105 + bob(t, 1, 6), .28, Math.sin(t * 1.4) * .06, .4);
    seaLayer(SEA.mid, 1250, -110, lt, 14, .7, t);
    put(CL.s5, 520 + lt * 30, 300, 1.1, 0, 1);
    seaLayer(SEA.front, 1460, 140, lt, 26, 1, t);
    rainOn(t, 160, .55, 3);
    main.restore();
    fx({ flash: roar >= 0 ? .55 * Math.exp(-7 * since) * (since < .06 ? 1 : since < .11 ? .4 : 1) : 0 });
    finish();
  }
  // 2. the boats sail away into the rain and grow small; smoke puffs trail from the steamer's stacks
  function leaving(t, lt, dur) {
    begin(t, .3);
    const u = lt / dur, zoom = lerp(1, 1.12, ease.inOut(u));
    main.save(); main.translate(540, 1000); main.scale(zoom, zoom); main.translate(-540, -1000 + u * 40);
    put(SKY.dusk, -170, -60, 1, 0, 0);
    put(CL.d3, 820 - lt * 12, 560, 1, 0, .4); put(CL.d1, 260 + lt * 10, 640, 1, 0, .6);
    seaLayer(SEA.back, 1000, 40, lt, 5, .4, t);
    // the far schooner, nearly on the horizon
    const k2 = ease.out(clamp(u * 1.1)); put(SCH[1], lerp(330, 180, k2), 1010 + bob(t, 3, 3), lerp(.3, .12, k2), Math.sin(t * 1.3 + 2) * .05, .3);
    // the steamer heading out; its smoke
    const k = ease.inOut(u), sx = lerp(760, 470, k), sy = lerp(1210, 1040, k), sc = lerp(.95, .26, k);
    for (let i = 0; i < 9; i++) { const b = 62.4 - 1.6 + i * .5; puff(t, b, sx + (-30 + 120 * (i % 2)) * sc, sy - 420 * sc, 60, i % 2 ? CL.smoke : CL.smoke2, .45 * sc + .1); }
    seaLayer(SEA.mid, lerp(1230, 1110, k), -80, lt, 10, .6, t);
    put(STEAMER, sx, sy + bob(t, 0, 10 * sc), sc, Math.sin(t * 1.2) * .03, .6 + sc * .5);
    // the near schooner leaving too, out to the right
    const k3 = ease.inOut(clamp(u * 1.2 - .1)); put(SCH[0], lerp(1180, 860, k3), lerp(1480, 1180, k3) + bob(t, 2, 14), lerp(1.1, .4, k3), Math.sin(t * 1.5 + 1) * .05, 1);
    seaLayer(SEA.front, lerp(1520, 1420, k), 120, lt, 22, 1, t);
    put(CL.d2, 560 + lt * 26, 330, 1.05, 0, 1);
    rainOn(t, 110, .4, 5);
    main.restore();
    finish();
  }
  // 3. the waterfront at night: the window lights up, the camera slides right, the bird lands on the pole
  function heron(t, lt, dur) {
    begin(t, .6);
    const pan = kf(lt, [[0, 0], [1.4, 0], [3.0, 1], [dur, 1.04]], ease.inOut), cx = -pan * 340;
    put(SKY.night, -180 + cx * .2, -80, 1, 0, 0);
    put(CL.n1, 300 + cx * .3 + lt * 6, 500, 1, 0, .5); put(CL.n2, 980 + cx * .3 - lt * 6, 380, 1, 0, .5);
    seaLayer(SEA_N.back, 1180, 30, lt, 5, .4, t);
    put(STEAMER, 1100 + cx * .45, 1190, .2, 0, .3);
    glow(1100 + cx * .45 - 40, 1150, 60, 'rgba(255,200,120,.6)');
    seaLayer(SEA_N.front, 1500, 70, lt, 14, .8, t);
    // the warehouse and the lit window, with the window leaner's bottle out into the rain
    const on = smooth(inv(LIGHT - .1, LIGHT + .25, t));
    put(WAREHOUSE, -120 + cx, 1700, 1, 0, 1);
    liveCut(() => { windowLeaner(t, 280 + cx, 1080, 760, { facing: 1, fill: .2 + lt * .06, lean: .7 * on + .06 * Math.sin(lt * 2.2), lit: on }); glowAt(260 + cx, 900, 420, `rgba(255,170,80,${.35 * on})`); }, 1);
    // the lamp pole by the water
    const px = 1180 + cx;
    put(POLE, px, 1720, .82, 0, 1);
    const lampY = 1720 - (1500 - 230) * .82; glow(px, lampY, 240, 'rgba(255,205,130,.5)'); glow(px, lampY, 60, 'rgba(255,240,200,.9)');
    // the heron: flies in flapping (a pivoting wing), lands on the lamp's cap on the cue word, folds its wings
    const perchY = 1720 - (1500 - 96) * .82;
    if (t < BIRD) {
      // glides in from the right edge and down to the lamp; wings beat between straight up and level with the back
      const k = ease.out(inv(BIRD - 1.9, BIRD, t)), hxp = lerp(1260, px + 10, k), hyp = lerp(perchY - 360, perchY - 80, k);
      const flap = -.9 + .7 * Math.sin(t * TAU * 1.7), brake = k > .8 ? -(k - .8) * 3 : 0;
      put(WING, hxp + 40, hyp - 14, .62, flap - .25 + brake, .7, .85);
      put(HERON_FLY, hxp, hyp, .62, -.1 + k * .1 - brake * .3, .9);
      put(WING, hxp + 20, hyp - 8, .62, flap + .15 + brake, .9);
    } else {
      const lt2 = t - BIRD, set = ease.out(clamp(lt2 / .5));
      put(HERON_STAND, px + 10, perchY + 8 + Math.exp(-6 * lt2) * 10, .55, 0, 1);
      if (set < 1) { put(WING, px + 10, perchY - 300 * .55, .6, lerp(-1.3, -.05, set), .9, 1 - set); }
    }
    rainOn(t, 70, .3, 7);
    finish();
  }
  // 4. the steamer's boiler room as a paper theatre: the millionaire shovels, coal flies, the furnace roars; push in
  function stokePh(t) { const b = beatPhase(t) - lastBeat(BITES[0] + .01), c = Math.floor(b / 2), r = b - c * 2; return c + (r < 1 ? r * .62 : .62 + (r - 1) * .38); }
  function coal(t, lt, dur) {
    begin(t, .9);
    const push = ease.in(inv(73.95, END, t)), mx = 820, my = 800;
    const flare = TOSSES.reduce((m, k) => Math.max(m, hit(t, k + .1, 4)), 0), heat = lerp(.4, .85, inv(70.6, 74, t)) + .4 * flare;
    const z = lerp(1, 3.2, push);
    main.save(); main.translate(540, 960); main.scale(z, z); main.translate(-lerp(540, mx, push), -lerp(960, my + 30, push));
    put(IRON, -160, -90, 1, 0, 0);
    // behind the mouth: the fire (three drawings, on twos)
    main.fillStyle = rgb(mixc(hx('#3a1008'), hx('#c0501c'), clamp(heat - .2))); main.fillRect(mx - 160, my - 160, 320, 240);
    put(FLAMES[Math.floor(onTwos(t) * 12) % 3], mx, my + 80, .95 + .25 * flare, 0, 0);
    glow(mx, my, 520, `rgba(255,140,60,${.22 * heat})`); glow(mx, my + 20, 160, `rgba(255,225,160,${.25 * flare})`);
    put(BOILER, mx, 1500, 1, 0, 1.2);
    put(DOOR, mx - 140, my - 30, .9, Math.PI + .25 + .05 * Math.sin(t * 3) - .2 * flare, 1);
    // coal in flight: from the blade at each toss into the mouth
    const J0 = { blade: null };
    put(COALHEAP, 930, 1800, 1, 0, 1.2);
    liveCut(() => { const J = millionaire(t, 330, 1780, 960, { ph: stokePh(t), facing: 1 }); J0.blade = J.blade; glowAt(J.hc[0] + 140, J.hc[1], 260, `rgba(255,150,70,${.25 * heat})`); }, 1.3);
    TOSSES.forEach((k, j) => {
      const lt2 = t - k; if (lt2 < 0 || lt2 > .45) return; const u = lt2 / .45, b = J0.blade || [700, 1100];
      for (let i = 0; i < 6; i++) { const ox = (hash(j * 13 + i) - .5) * 80, oy = (hash(j * 29 + i) - .5) * 60; put(LUMP, lerp(b[0] + ox, mx + ox * .5, u), lerp(b[1] + oy, my + oy * .3, u) - Math.sin(u * Math.PI) * 220, .9, u * 6 + i, .8); }
    });
    // sparks out of the mouth after each toss
    TOSSES.forEach((k, j) => { const lt2 = t - k - .45; if (lt2 < 0 || lt2 > 1) return; for (let i = 0; i < 26; i++) { const a = -Math.PI / 2 + (hash(j * 71 + i) - .5) * 2.2, v = 300 + hash(j * 37 + i) * 600, x = mx + Math.cos(a) * v * lt2, y = my + Math.sin(a) * v * lt2 + 500 * lt2 * lt2; glow(x, y, 14, `rgba(255,${180 + (i % 3) * 25},90,${(1 - lt2) * .9})`); } });
    main.restore();
    if (push > .3) { main.save(); main.setTransform(1, 0, 0, 1, 0, 0); main.fillStyle = `rgba(240,160,70,${ease.in(inv(.3, 1, push)) * .9})`; main.fillRect(0, 0, W, H); main.restore(); }
    finish();
  }

  chapter('cut', LOOK.span[0], END, [
    [LOOK.span[0], storm],
    [62.4, leaving],
    [66.9, heron],
    [70.6, coal],
  ]);
})();
