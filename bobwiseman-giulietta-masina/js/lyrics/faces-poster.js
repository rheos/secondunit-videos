// Captions for the painted poster (34-60): a cream paper snipe pasted on the poster, the line hand-brushed on it.
// Faces are painted into the baked sheets, so they are reported from the layout (js/poster/layout.js) while their
// sheet is up, through the camera (main.js camAt). paintHead34 heads are 2 r tall; boxes include the hair.
// 9:16: the crying close (f1040-1077) is all face in the tall window, so it plays with no caption; "crying" printed 1.3 s
// before the cut and "played" (onset f1077) prints on f1078, the cut back, 1 frame late (audit tolerance 2 early / 1 late)
CAP_GAPS.tall = [[1040, 1078]];
const capHead = (x, y, r) => [x - 1.05 * r, y - 1.2 * r, x + 1.05 * r, y + 1.1 * r];
const CAP_PHEADS = (() => {
  const L = [];
  // star poster, big head: chin measured at 0.79 r below the head centre (f860, turned and tilted), so the box ends at 0.88 r
  { const b = capHead(P1.x + P1HEAD.x, P1.y + P1HEAD.y, P1HEAD.r); b[3] = P1.y + P1HEAD.y + .88 * P1HEAD.r; L.push({ b, a: B.slap1 - .16, z: B.part + .1, star: true }); }
  const [fx, fy] = figXf(FIG1)(FIG_HEAD.x, FIG_HEAD.y);
  L.push({ b: capHead(P1.x + fx, P1.y + fy, FIG_HEAD.r * FIG1.s), a: B.name - .16, z: B.part + .1 });     // her small figure
  L.push({ b: capHead(P2.x + P2HEAD.x, P2.y + P2HEAD.y, P2HEAD.r), a: B.played - .16, z: 1e9 });          // character poster
  const mt = [B.let, B.men, B.lie];
  MEN.forEach((M, k) => L.push({ b: capHead(M.x + M.head[0], M.y + M.head[1], M.head[2] * 1.1), a: mt[k] - .16, z: 1e9 }));
  return L;
})();
function capPosterFaces(t) {
  const c = camAt(t), m = (x, y) => [(x - c.x) * c.z + W / 2, (y - c.y) * c.z + H / 2];
  // the crying close (B.crying-B.played, camera 2.35-2.5x): the layout box (1.05 r each side) covers the whole frame, so
  // the head is boxed as measured on the rendered frames (f1040 and f1077, 100 px grid): hair and face x 380-1400 growing
  // to x 370-1450 with the push-in, chin below 1000; +20 px. Leaves the red field right of her cheek for the snipe.
  if (t >= B.crying && t < B.played) { const u = clamp((t - B.crying) / (B.played - B.crying)); capFaceOut([0, 0, lerp(1420, 1470, u), H]); }
  for (const F of CAP_PHEADS) if (t >= F.a && t < F.z && !(F.star && t >= B.crying && t < B.played)) { const [x0, y0] = m(F.b[0], F.b[1]), [x1, y1] = m(F.b[2], F.b[3]); capFaceOut([x0 - 6, y0 - 6, x1 + 6, y1 + 6]); }
}
{ const dw = drawWorld;
  window.drawWorld = function (gg, t) {
    dw(gg, t);
    if (gg === g) capPosterFaces(t);
    if (!CAP_SUPPRESS && gg === g) { gg.save(); gg.setTransform(1, 0, 0, 1, 0, 0); capDraw(gg, t, 'wide'); gg.restore(); }
  };
}
// after 59.5 the world is drawn off screen and torn; the faces then come from the torn halves (captions are gone by then)
window.capShot = (t) => shotAt(SHOTS.map((s) => ({ t: s[0] })), t)[2];
window.__ready = Promise.resolve(window.__ready).then(() => { capBakePoster(); return true; });
