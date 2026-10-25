// First Night Out, the character test: 16 s at 24 fps on a plain night-paper strip. Every frame is a pure function
// of t. The kit copies the parent one beat late (80 BPM, 0.75 s): every gesture and the walk itself are the parent's
// curves read at t - LAG.
//   0.0 - 4.0   both stand: breathing, ear and paw twitches; the parent lifts a paw to test the air, the kit copies
//   4.0 - 12.2  the parent walks (the hunched walk, feet planted); the kit sets off a beat later and follows
//   12.2 - 16   they stop; the parent lifts its head to sniff the air, the kit copies; the tails settle
const params = new URLSearchParams(location.search);
const OUT_W = parseInt(params.get('w') || '1280', 10), Q = OUT_W / 1920;
const cv = document.getElementById('c'); cv.width = OUT_W; cv.height = Math.round(1080 * Q);
const X = cv.getContext('2d');
const { clamp, lerp, ss, E, noise } = PD;

// ---------------- timeline ----------------
const END = 16, LAG = .75, SC = 1.5, V = 210;
const A0 = 4, RA = 1.1, D0 = 10.6, D1 = 12.2;          // start, ramp, decelerate, stop
const GAP = 455 * SC;                                  // the kit's hip trails the parent's by this much
const PX0 = 1060, GROUND = 935, KGROUND = 950;
// distance under a speed that eases up over RA and down over D1 - D0 (smoothstep ramps, integrated)
function travel(t) {
  const iss = (k) => k * k * k - k * k * k * k / 2;
  if (t <= A0) return 0;
  if (t < A0 + RA) return V * RA * iss((t - A0) / RA);
  const base = V * RA / 2;
  if (t < D0) return base + V * (t - A0 - RA);
  const run = base + V * (D0 - A0 - RA), RD = D1 - D0;
  if (t < D1) { const k = (t - D0) / RD; return run + V * RD * (k - iss(k)); }
  return run + V * RD / 2;
}
const walkAt = (t) => ss(A0, A0 + RA, t) * (1 - ss(D0, D1, t));
const parentX = (t) => PX0 + travel(t), kitX = (t) => PX0 - GAP + travel(t - LAG);
// gestures, as curves of the parent's time
const pawAt = (t) => ss(1, 1.5, t) - ss(2.5, 3, t);
const patAt = (t) => ss(1.55, 1.75, t) - ss(2.25, 2.45, t);
const lookAt = (t) => -.42 * (ss(12.6, 13.1, t) - ss(14.4, 14.9, t));
const sniffAt = (t) => ss(12.9, 13.2, t) - ss(14.1, 14.4, t);
const stateAt = (t, d, tt) => ({ d, t: tt, walk: walkAt(t), paw: pawAt(t), pat: patAt(t), look: lookAt(t), sniff: sniffAt(t), settle: t >= D1 ? t - D1 : -1 });

// the camera keeps the pair framed: the middle of the kit's tail and the parent's nose
const camX = (t) => (parentX(t) + 330 * SC + kitX(t) - 170 * SC) / 2 - 960;
const cam = (t) => ({ x: camX(t), y: 4 * noise('cam').n1(t * .13), z: 0, roll: .001 * noise('cam').n1(t * .1 + 4) });

// ---------------- build (baked once) ----------------
const LIGHT = [-.5, -.85];
const parent = RAC.make('parent'), kit = RAC.make('kit');
parent.build(Q * SC * 1.15, LIGHT); kit.build(Q * SC * 1.15, LIGHT);
// both walks start and end with all four feet down
parent.setGait(parentX(0) / SC, parentX(END) / SC, 1);
kit.setGait(kitX(0) / SC, kitX(END) / SC, 1);

const span = travel(END) + 600;
const R = Q * 1.15;
const sky = PD.sprite({ x: -300, y: -60, w: 2600, h: 1200, res: R, seed: 'sky', mat: 'sky', light: LIGHT, edge: false, shadow: false, draw(g) {
  const gr = g.createLinearGradient(0, -60, 0, 1100); gr.addColorStop(0, '#0e1230'); gr.addColorStop(.7, '#1d2450'); gr.addColorStop(1, '#262d5c');
  g.fillStyle = gr; g.fillRect(-300, -60, 2600, 1200);
} });
const moon = PD.sprite({ x: 260, y: 110, w: 200, h: 200, res: R, seed: 'moon', mat: 'paper', light: LIGHT, shadow: { blur: 8 }, draw(g) {
  PD.piece(g, PD.ellipsePts(360, 210, 66, 66, 48), { fill: '#f1e6c8', torn: { amp: 1.6, freq: .12, seed: 3 } });
  g.fillStyle = 'rgba(190,170,130,.25)'; g.beginPath(); g.arc(380, 196, 14, 0, 7); g.arc(342, 236, 9, 0, 7); g.fill();
} });
const ridgeSprite = (name, z, base, amp, fill, seed) => {
  const w = 1920 + span * (1000 / z) + 900;
  return PD.sprite({ x: -400, y: base - amp - 40, w, h: 1180 - base + amp + 40, res: R, seed: name, light: LIGHT, shadow: { blur: 14 }, draw(g) {
    g.fillStyle = fill; g.fill(PD.polyPath(PD.tear(PD.ridge(-400, w - 400, base, 1180, { amp, freq: .0016, sharp: .15, seed }), { amp: 3, freq: .05, seed })));
  } });
};
const farHills = ridgeSprite('far', 2400, 700, 170, '#2a3166', 11), nearHills = ridgeSprite('near', 1600, 800, 110, '#1b2152', 23);
const ground = PD.sprite({ x: -400, y: 860, w: 1920 + span + 900, h: 240, res: R, seed: 'ground', light: LIGHT, shadow: { blur: 10 }, draw(g) {
  const x1 = 1920 + span + 500, rs = new PD.RNG('ground');
  g.fillStyle = '#141938'; g.fill(PD.polyPath(PD.tear([[-400, 884], [x1, 884], [x1, 1100], [-400, 1100]], { amp: 4, freq: .03, seed: 5 })));
  g.fillStyle = '#1f2550'; g.fill(PD.polyPath(PD.tear([[-400, 880], [x1, 880], [x1, 896], [-400, 898]], { amp: 2.5, freq: .05, seed: 6 })));
  for (let x = -380; x < x1; x += rs.range(60, 160)) {   // pebbles and torn scraps on the path, so travel reads
    const y = rs.range(920, 1060), w = rs.range(8, 22);
    PD.piece(g, PD.ellipsePts(x, y, w, w * .45, 10), { fill: rs.pick(['#1f2550', '#0f1330', '#262d5a']), torn: { amp: 1.5, freq: .3, seed: rs.int(1, 9999) } });
  }
} });
const tufts = PD.sprite({ x: -400, y: 900, w: 1920 + span * 1.6 + 900, h: 200, res: R, seed: 'tufts', light: LIGHT, shadow: { blur: 12 }, draw(g) {
  const rs = new PD.RNG('tufts');
  for (let x = -300; x < 1920 + span * 1.6 + 400; x += rs.range(380, 700)) {
    g.fillStyle = rs.pick(['#0b0f26', '#0e1330']);
    const n = rs.int(5, 9), pts = [];
    for (let i = 0; i <= n; i++) { const bx = x + i * 14; pts.push([bx - 6, 1100], [bx + rs.range(-10, 14), 1100 - rs.range(70, 150)], [bx + 6, 1100]); }
    g.fill(PD.polyPath(pts));
  }
} });
const CHAR = { name: 'char', z: 1000 };
const planes = [
  { name: 'sky', z: 4000, sprites: [{ s: sky, shadow: false }], draw(g) { PD.glow(g, 360, 210, 230, 'rgba(255,236,190,.35)'); } },
  { name: 'moon', z: 3900, sprites: [{ s: moon }] },
  { name: 'far', z: 2400, sprites: [{ s: farHills }] },
  { name: 'near', z: 1600, sprites: [{ s: nearHills }] },
  { name: 'ground', z: 1000.5, sprites: [{ s: ground }] },
  CHAR,
  { name: 'tufts', z: 640, sprites: [{ s: tufts }] },
];

// ---------------- one frame ----------------
function frame(t) {
  CHAR.draw = (g) => {
    parent.draw(g, 0, GROUND, stateAt(t, parentX(t), t), { scale: SC, light: LIGHT, shadow: [9, 5] });
    kit.draw(g, 0, KGROUND, stateAt(t - LAG, kitX(t), t + 1.7), { scale: SC, light: LIGHT, shadow: [8, 4] });
  };
  X.setTransform(1, 0, 0, 1, 0, 0);
  X.fillStyle = '#0e1230'; X.fillRect(0, 0, cv.width, cv.height);
  PD.renderPlanes(X, planes, cam(t), t, { q: Q, light: LIGHT, shadowAlpha: .5 });
  PD.finish(X, { bloom: .4, threshold: .7, vignette: .3, grain: .05, frame: Math.round(t * 24), grade: { color: '#3c4c9a', amount: .12, mode: 'soft-light' } });
}

window.__frameJPEG = (t, q = .93) => { frame(t); return cv.toDataURL('image/jpeg', q); };
window.__ready = Promise.resolve(true);
window.FILM = { END, LAG, parentX, kitX, walkAt, frame, parent, kit };
if (!params.has('offline')) {
  const t0 = performance.now(), start = parseFloat(params.get('t') || 0);
  (function loop() { frame((start + (performance.now() - t0) / 1000) % END); requestAnimationFrame(loop); })();
}
