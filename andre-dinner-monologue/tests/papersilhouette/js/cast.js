// The cast and props for the camp section: one worker figure (who becomes a guard), the big head,
// two hands, the seed, a brick, a tower, a pine. All silhouettes, one paper colour each.
const CAST = {
  worker: { col: C.fig, height: 1, headK: .265 },
};
// ---- a brick (centre at 0,0), hand-cut edges ----
function brick(w, h, seed = 0, col = C.wall, opts = {}) { cut(cutRect(-w / 2, -h / 2, w, h, seed, 2), col, { sh: .7, lift: .25, grain: .22, ...opts }); }
// ---- the seed: a pine seed, a small teardrop with a point (centre at 0,0, length L) ----
function seedPath(L) { const r = L * .32; return blob([[-L * .5, 0], [-L * .25, -r], [L * .15, -r * .9], [L * .5, 0], [L * .15, r * .9], [-L * .25, r]], .55); }
function seed(x, y, L, rot = 0, opts = {}) { g.save(); g.translate(x, y); g.rotate(rot); cut(seedPath(L), C.seed, { sh: .6, lift: .3, grain: .15, ...opts }); g.restore(); }
// ---- a pine silhouette, base at (0,0), height 1 (scale it). Five tiers, a trunk, hand-cut edges ----
const PINE = (() => {
  const tiers = [[.31, .17, .42], [.26, .43, .62], [.21, .62, .78], [.15, .78, .90], [.09, .90, 1.0]];   // half-width, bottom, top
  const L = [[-.03, 0], [-.03, -.17]], R = [[.03, -.17], [.03, 0]];
  let k = 0;
  for (const [hw, b, tp] of tiers) {
    // left side: corner, then up the slope with a few hand-cut notches
    L.push([-hw, -b]);
    for (let i = 1; i < 4; i++) { const u = i / 4; L.push([-hw * (1 - u) * .62 - .006 * (i % 2) + (hash(k + i) - .5) * .012, -b - (tp - b) * u]); }
    R.unshift([hw, -b]);
    for (let i = 1; i < 4; i++) { const u = i / 4; R.unshift([hw * (1 - u) * .62 + .006 * (i % 2) + (hash(k + i + 9) - .5) * .012, -b - (tp - b) * u]); }
    k += 7;
  }
  L.push([0, -1.0]);
  return poly(L.concat(R));
})();
function pine(x, y, h, col = C.pine, opts = {}) { if (h <= 0) return; g.save(); g.translate(x, y); g.scale(h, h); cut(PINE, col, { sh: .6, lift: .3, grain: .22, ...opts }); g.restore(); }
// ---- the open hand, palm up, seen from the side: fingers to the right, thumb rising. Units: palm centre at (0,0) ----
const HAND_OPEN = blob([[-470, 760], [-360, 420], [-270, 150], [-210, 20], [-120, -44], [40, -72], [200, -78], [320, -70], [392, -120], [424, -66], [372, -4],
  [240, 30], [100, 42], [-60, 62], [-170, 112], [-240, 240], [-310, 760]], .5);
const HAND_THUMB = blob([[-70, -30], [-50, -120], [-10, -220], [40, -262], [78, -232], [66, -150], [40, -70], [30, -20]], .55);
function handOpen(x, y, s, opts = {}) {
  g.save(); g.translate(x, y); g.scale(s, s);
  cut(HAND_OPEN, C.fig, { sh: .8, lift: .5, grain: .24, ...opts });
  cut(HAND_THUMB, C.fig, { sh: .5, lift: .3, grain: .22, ...opts });
  // the cut between the index finger and the rest: the one craft detail on the hand
  g.strokeStyle = C.ground; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(418, -72); g.quadraticCurveTo(330, -34, 230, -26); g.stroke();
  g.restore();
}
const HAND_SEAT = { x: 120, y: -78 };   // where the seed rests, in hand units
// ---- the pinching hand (the tree man's), fingers closed on a point at (0,0); the forearm runs up-right ----
const HAND_PINCH = (() => { const p = new Path2D();
  p.addPath(blob([[70, -40], [30, -100], [10, -180], [40, -270], [120, -340], [230, -350], [310, -290], [320, -190], [280, -110], [210, -56], [140, -26]], .5));
  p.addPath(poly([[-30, -150], [12, -176], [10, -8], [-14, 0]]));          // thumb, from the upper left down to the tip
  p.addPath(poly([[150, -40], [170, -72], [12, -6], [-6, 12]]));            // index finger, from the right down to the tip
  p.addPath(poly([[180, -330], [290, -370], [760, -820], [880, -700], [330, -220]]));   // forearm
  return p; })();
function handPinch(x, y, s, rot = 0, opts = {}) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); cut(HAND_PINCH, C.fig, { sh: .8, lift: .6, grain: .24, ...opts }); g.restore(); }
// ---- a tower for the skyline: base at (x, y), width w, height h; window cut-outs show the ground ----
function tower(x, y, w, h, seed = 0, { step = 0, col = C.tower, win = true } = {}) {
  cut(cutRect(x, y - h, w, h, seed, 2.5), col, { sh: .8, lift: .4, grain: .24 });
  if (step > 0) cut(cutRect(x + w * .25, y - h - step, w * .5, step + 4, seed + 3, 2), col, { sh: .6, lift: .3, grain: .24 });
  if (win) {
    const cols = Math.max(1, Math.floor((w - 16) / 34)), rows = Math.floor((h - 40) / 50);
    const x0 = x + (w - cols * 34) / 2 + 10;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      if (hash(seed * 3.1 + r * 7.7 + c * 1.3) < .3) continue;
      cut(rect(x0 + c * 34, y - h + 28 + r * 50, 14, 24), C.ground, { sh: 0, grain: .12 });
    }
  }
}
// a stack of bricks carried overhead: drawn at the hands (puppet units), n bricks
function stackHeld(n, w = 98, h = 60, s = .115) {
  // hands are 318 units above the shoulder when the arms point straight up; the stack sits on the hands
  g.save(); const m = g.getTransform(); g.setTransform(1, 0, 0, 1, m.e, m.f);   // upright, canvas px, at the hands
  for (let i = 0; i < n; i++) { g.save(); g.translate(0, -h / 2 - i * (h + 2)); brick(w, h, 20 + i, C.wall, { lift: .4 }); g.restore(); }
  g.restore();
}
