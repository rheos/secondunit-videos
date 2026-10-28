// Generate-then-trace test (#339): the paper-depth musician walking the road at dusk (scene A), 4.5 s at 24 fps.
// ?v=keyed   the rig's own hand-keyed gait, timed to match the clip: same distance, slows and stops at the same time
// ?v=traced  the pose from a Seedance clip (assets/track.js, cleaned: leg identity, smoothing, foot locks)
// ?v=raw     the same pose with no cleanup, to show what the tracker alone gives
// Every frame is a pure function of t: the track is sampled by linear interpolation between its frames.
const params = new URLSearchParams(location.search);
const OUT_W = parseInt(params.get('w') || '1280', 10), Q = OUT_W / 1920;
const cv = document.getElementById('c'); cv.width = OUT_W; cv.height = Math.round(1080 * Q);
const X = cv.getContext('2d');
const { clamp, lerp, ss, noise } = PD;
const VER = params.get('v') || 'traced';

const FPS = TRACK.fps, TR = VER === 'raw' ? TRACK.raw : TRACK.clean, END = (TR.length - 1) / FPS;
const X0 = 300, SC = .84;
// the keyed walk: constant speed, then a smoothstep ease-out (main.js in paper-depth) ending where the clip ends
const DIST = TRACK.clean[TR.length - 1].hip[0] - TRACK.clean[0].hip[0];
const DEC0 = 2.6, DEC1 = 4.0, VK = DIST / (DEC0 + .5 * (DEC1 - DEC0));
function rigX(t) {
  if (t < DEC0) return VK * t;
  const k = clamp((t - DEC0) / (DEC1 - DEC0));
  return VK * (DEC0 + (DEC1 - DEC0) * (k - (k ** 3 - k ** 4 / 2)));
}
MUS.setPhase((((.06 - rigX(99) / MUS.LC) % 1) % 1 + 1) % 1);   // he stops with both feet down

// one sample of the track at time t
function sample(t) {
  const u = clamp(t * FPS, 0, TR.length - 1), i = Math.min(Math.floor(u), TR.length - 2), f = u - i, a = TR[i], b = TR[i + 1];
  const L = (x, y) => lerp(x, y, f), V2 = (p, q) => [L(p[0], q[0]), L(p[1], q[1])], FT = (p, q) => [L(p[0], q[0]), L(p[1], q[1]), L(p[2], q[2])];
  return { hip: V2(a.hip, b.hip), lean: L(a.lean, b.lean), N: FT(a.N, b.N), F: FT(a.F, b.F), th: L(a.th, b.th), th2: L(a.th2, b.th2),
    head: L(a.head, b.head), case: L(a.case, b.case), speed: L(a.speed, b.speed) };
}
// when the traced walk is over: speed under 25 rig units a second for good
const STOP = (() => { let k = TRACK.clean.length - 1; while (k > 0 && Math.abs(TRACK.clean[k].speed) < 25) k--; return (k + 1) / FPS; })();

function charState(t) {
  if (VER === 'keyed') return { d: rigX(t) * SC, t, walk: 1 - ss(DEC0, DEC1, t), settle: t >= DEC1 ? t - DEC1 : -1 };
  const T = sample(t);
  // scarf and pom-pom keep their own follow-through, phased from the traced root
  return { d: T.hip[0] * SC, t, walk: clamp(Math.abs(T.speed) / 200), settle: t >= STOP ? t - STOP : -1, trace: T };
}

// the camera follows the keyed walk in all three, so any difference in timing shows as drift in the frame
const camX = (t) => X0 + rigX(t) * SC - 900;
const cam = (t) => ({ x: camX(t), y: 5 * noise('cam').n1(t * .13), z: 0, roll: .0012 * noise('cam').n1(t * .1 + 4) });

MUS.build(Q * 1.35, [-.3, -.95]);
const A = SCENES.buildA(Q).filter((P) => P.name !== 'nearA');   // the lens plane (poppies, big leaves) would hide his legs
const CHAR = { name: 'char', z: 1000, sortZ: 999 };

function frame(t) {
  CHAR.draw = (g) => MUS.draw(g, X0, 915, charState(t), { shadow: [6, 6], shadowAlpha: .38, scale: SC, light: SCENES.LA });
  const list = [...A, CHAR].sort((a, b) => (b.sortZ ?? b.z) - (a.sortZ ?? a.z));
  X.setTransform(1, 0, 0, 1, 0, 0);
  X.fillStyle = '#1b1e3c'; X.fillRect(0, 0, cv.width, cv.height);
  PD.renderPlanes(X, list, cam(t), t, { q: Q, shadowAlpha: .5 });
  PD.finish(X, { vignette: .26, grain: .05, frame: Math.round(t * 24), grade: { color: '#ffb070', amount: .12, mode: 'soft-light' } });
}

window.__frameJPEG = (t, q = .93) => { frame(t); return cv.toDataURL('image/jpeg', q); };
window.__ready = Promise.resolve(true);
window.FILM = { END, STOP, VK, DIST, frame };
if (!params.has('offline')) {
  const t0 = performance.now();
  (function loop() { frame(((performance.now() - t0) / 1000) % END); requestAnimationFrame(loop); })();
}
