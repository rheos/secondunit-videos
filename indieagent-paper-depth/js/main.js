// Paper depth, the film: 18 s at 24 fps. Every frame is a pure function of t.
//   0.0 - 8.0   A  the road at dusk; the camera trucks right with him, the planes slide past at their depths
//   8.0 - 10.2  the pop-up book: A's cut-outs fold flat onto the page front to back, the night backdrop drops
//               in, B's cut-outs spring up back to front; he keeps walking on the page through all of it
//   10.2 - 18.0 B  the venue at night; he slows and stops by the door, the camera dollies in, the door opens
//               and its light spills over him
// The pop-up transition follows paper-fox's (src/film/transitions.js popup; MIT, Copyright (c) 2026 Leonxlnx,
// notice in LICENSE-paper-fox.md): fold front to back, spring up back to front, a page that shows in between.
const params = new URLSearchParams(location.search);
const OUT_W = parseInt(params.get('w') || '1280', 10), Q = OUT_W / 1920;
const cv = document.getElementById('c'); cv.width = OUT_W; cv.height = Math.round(1080 * Q);
const X = cv.getContext('2d');
const { clamp, lerp, ss, E, F, noise } = PD;

// ---------------- timeline ----------------
const T0 = 8.0, TD = 2.2, DEC0 = 14.6, DEC1 = 15.8, X0 = 500, SC = .84, V = MUS.V * SC, END = 18;
function charX(t) {
  if (t < DEC0) return X0 + V * t;
  const k = clamp((t - DEC0) / (DEC1 - DEC0));
  return X0 + V * (DEC0 + (DEC1 - DEC0) * (k - (k ** 3 - k ** 4 / 2)));   // speed eases out with a smoothstep
}
const walkAmt = (t) => 1 - ss(DEC0, DEC1, t);
// he stops in the middle of a double support, both feet down
MUS.setPhase((((.06 - (charX(99) / SC / MUS.LC) % 1) % 1) + 1) % 1);
// his place on screen drifts right through the film; the camera follows, then dollies in on B
const screenX = (t) => 640 + 510 * E.sine(t / 15);
const camX = (t) => charX(t) - screenX(t);
const camZ = (t) => t < 12 ? 0 : 130 * E.sine((t - 12) / 7.5);
const cam = (t) => ({ x: camX(t), y: 5 * noise('cam').n1(t * .13), z: camZ(t), roll: .0012 * noise('cam').n1(t * .1 + 4) });
const CAMREF = camX(99);

// ---------------- build (baked once) ----------------
MUS.build(Q * 1.35, [-.3, -.95]);
const A = SCENES.buildA(Q), B = SCENES.buildB(Q, CAMREF);
const A_RANK = { nearA: 0, fgA: .6, roadA: 1.2, field: 2, hills: 3, mtnNear: 4, mtnFar: 5 };
const B_RANK = { skyline: 0, roofs: 1, alley: 2, facade: 3, walkB: 4, nearB: 5, lensB: 5.5 };
// a flat lowered on a fly line: falls, lands, bounces once
const drop = (k) => k < .7 ? (k / .7) ** 2 : 1 - .05 * Math.sin(Math.PI * (k - .7) / .3) * (1 - (k - .7) / .3);
const popSpring = (x) => x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.exp(-5.2 * x) * Math.cos(x * 8.2);
// the page the cut-outs fold down onto: cream paper lying flat, with the creases where pieces are glued
const page = PD.sprite({ x: camX(T0) - 400, y: 596, w: camX(T0 + TD) - camX(T0) + 2800, h: 500, res: Q * 1.1, seed: 'page', light: [0, -1], shadow: false, draw(g) {
  const x0 = camX(T0) - 400, x1 = x0 + camX(T0 + TD) - camX(T0) + 2800;
  g.fillStyle = '#efe3c8'; g.fillRect(x0, 600, x1 - x0, 500);
  for (const y of [790, 840, 930, 1086]) { g.fillStyle = 'rgba(120,90,60,.22)'; g.fillRect(x0, y, x1 - x0, 2); g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(x0, y + 2, x1 - x0, 1.5); }
  for (let x = x0; x < x1; x += 150) { g.fillStyle = 'rgba(110,90,80,.28)'; g.fillRect(x, 990, 82, 9); }   // the road, printed
  g.fillStyle = 'rgba(160,120,80,.12)'; g.fillRect(x0, 600, x1 - x0, 26);                                // the far edge in shade
} });
const PAGE = { name: 'page', z: 1000, sortZ: 9000, light: [0, -1], sprites: [{ s: page, shadow: false }] };
const CHAR = { name: 'char', z: 1000, sortZ: 999 };

function charState(t) {
  return { d: charX(t), t, walk: walkAmt(t), settle: t >= DEC1 ? t - DEC1 : -1, look: -.15 * ss(15.7, 16.4, t) + .11 * ss(16.7, 17.4, t) };
}

// ---------------- one frame ----------------
function frame(t) {
  const p = clamp((t - T0) / TD);
  const C = cam(t);
  const list = [];
  if (t < T0 + TD) list.push(...A);
  if (t > T0) list.push(...B);
  if (p > 0 && p < 1) list.push(PAGE);
  const doorK = E.io(ss(16.05, 16.9, t));
  const shadowK = ss(.3, .7, p);
  CHAR.draw = (g) => MUS.draw(g, 0, 915, charState(t), {
    shadow: [lerp(6, -6, shadowK), 6], shadowAlpha: .38, scale: SC,
    light: [lerp(SCENES.LA[0], SCENES.LB[0], shadowK), lerp(SCENES.LA[1], SCENES.LB[1], shadowK)],
    rim: doorK > 0 ? { dir: [1, -.15], width: 3.2, color: '#ffd38a', alpha: .85 * doorK, wash: .07 * doorK } : null,
  });
  list.push(CHAR);
  // the night backdrop drops in like a flat on a fly line, with a little bounce
  const skyB = B[0];
  skyB.sortZ = 11000;
  skyB.anim = () => ({ y: t < T0 + TD ? -1200 * (1 - drop(clamp((p - .16) / .4))) : 0 });
  list.sort((a, b) => (b.sortZ ?? b.z) - (a.sortZ ?? a.z));

  const kA = (P) => E.in(clamp((p - A_RANK[P.name] * .075) / .24));
  const kB = (P) => { const x = clamp((p - .36 - B_RANK[P.name] * .07) / .28); return 1 - popSpring(x * x * (3 - 2 * x) * .6 + x * .4); };
  const fold = (P) => {
    if (P.sky || P === PAGE || P === CHAR || p <= 0 || p >= 1) return 0;
    return P.scene === 'A' ? kA(P) : kB(P);
  };
  // a cut-out lying almost flat would read as a thin sliver: let it go as it goes down
  const flat = (k) => ss(.03, .22, Math.cos(k * Math.PI / 2));
  const alpha = (P) => (P.sky || P === PAGE || P === CHAR || p <= 0 || p >= 1) ? 1 : flat(fold(P));

  X.setTransform(1, 0, 0, 1, 0, 0);
  X.fillStyle = '#1b1e3c'; X.fillRect(0, 0, cv.width, cv.height);
  PD.renderPlanes(X, list, C, t, { fold, alpha, q: Q, shadowAlpha: lerp(.5, .44, shadowK) });

  const night = ss(.35, .75, p);
  PD.finish(X, {
    bloom: .45 * night, threshold: .72, vignette: .26, grain: .05, frame: Math.round(t * 24),
    grade: night < 1 ? { color: '#ffb070', amount: .12 * (1 - night), mode: 'soft-light' } : null,
  });
  if (night > 0) PD.finish(X, { vignette: 0, grain: 0, grade: { color: '#4a5aa0', amount: .1 * night, mode: 'soft-light' } });
}

window.__frameJPEG = (t, q = .93) => { frame(t); return cv.toDataURL('image/jpeg', q); };
window.__ready = Promise.resolve(true);
window.FILM = { END, T0, TD, DEC1, charX, camX, cam, frame };
if (!params.has('offline')) {
  const t0 = performance.now(), start = parseFloat(params.get('t') || 0);
  (function loop() { frame((start + (performance.now() - t0) / 1000) % END); requestAnimationFrame(loop); })();
}
