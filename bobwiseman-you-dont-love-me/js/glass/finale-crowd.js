// Draft 14 (Bob, 2026-10-20, on draft 13: "I love adding on to the end, can you keep it going like the way More gets
// more and more dense. It's much more amusing and cute. Could be other characters too from other videos if you run out
// of people."): after draft 13's seven heads (finale-chorus.js) the crowd keeps coming, the way More's cut-paper chorus
// piles up: one new face a beat, then two, then four, row on row from the bottom of the frame to the top, until the
// nave is a wall of singing faces. Each row stands up behind the one in front of it (it rises from below), the back
// rows a little smaller. First more of this film's own people, then characters from Bob's other videos, redrawn in
// glass (crowd-a.js: this film; crowd-b.js and crowd-c.js: the other films). Little Bob stays out (Bob asked twice).
// They all bob to the beat and sit back down out of sight, the back row first, from 228.40, as draft 13's heads leave,
// before the light goes. Drawn behind draft 13's faces and heads, in screen space, lit like them. Needs pip-finale.js
// (PF_B), pip-heads.js (pipSingMouth, PIP_HEAD_BEAT), finale-chorus.js and crowd-base.js. Pure function of song time t.

// Rows, front to back: y of the face centre, size, spacing, and where the first face in the row stands.
const CR_ROWS = [
  { y: 772, sc: .92, dx: 214, x0: 105 },
  { y: 606, sc: .84, dx: 196, x0: 190 },
  { y: 442, sc: .77, dx: 178, x0: 108 },
  { y: 282, sc: .71, dx: 162, x0: 180 },
  { y: 124, sc: .65, dx: 150, x0: 96 },
];
// Fractional beat index -> song time on the PF_B grid
const crB = (x) => { const i = Math.min(Math.floor(x), PF_B.length - 2); return PF_B[i] + (x - i) * (PF_B[i + 1] - PF_B[i]); };
// How often a new face arrives, row by row (in beats): the More acceleration, one a beat to four a beat
const CR_STEP = [1, .5, .5, .25, .25];
const CR_START = 18; // PF_B[18] = 207.73, the beat draft 13's last head (the grey horse) came in on
const CR_OUT = PF_B[48]; // 228.40: the back row sits down first, a row every half beat

const CR_SLOTS = (() => {
  const S = []; let beat = CR_START;
  CR_ROWS.forEach((R, r) => {
    const row = [];
    for (let x = R.x0, k = 0; x < W + 40; x += R.dx, k++) {
      const jx = (rnd(k, r, 51) - .5) * 44, jy = (rnd(k, r, 52) - .5) * 30, X = x + jx;
      if (X > 1630 && R.y < 380) continue; // keep the daisy roundel clear (it hangs at the top right, x ~1800)
      row.push({ x: X, y: R.y + jy, sc: R.sc * (.96 + .08 * rnd(k, r, 53)), rot: (rnd(k, r, 54) - .5) * .16, row: r });
    }
    // they pop up all over the row, not left to right: golden-ratio order
    const ord = row.map((q, i) => [((i * .618034 + r * .3) % 1), q]).sort((a, b) => a[0] - b[0]).map(([, q]) => q);
    ord.forEach((q) => { q.ti = crB(beat); beat += CR_STEP[r]; S.push(q); });
  });
  S.forEach((q) => { q.to = CR_OUT + (CR_ROWS.length - 1 - q.row) * (PF_B[49] - PF_B[48]) / 2 + q.x / W * .12; });
  return S;
})();

// Who stands where, in arrival order: this film's people first, then the other films' (alternating crowd-b and
// crowd-c, so no film comes in as a block), then everyone again in their second colours until the rows are full.
let CR_CAST = null;
function crCast() {
  if (CR_CAST) return CR_CAST;
  const keys = Object.keys(CROWD_DRAW), own = keys.filter((k) => CROWD_META[k]?.group === 'a');
  const b = keys.filter((k) => CROWD_META[k]?.group === 'b'), c = keys.filter((k) => CROWD_META[k]?.group === 'c');
  const others = []; for (let i = 0; i < Math.max(b.length, c.length); i++) { if (b[i]) others.push(b[i]); if (c[i]) others.push(c[i]); }
  const first = [...own, ...others].map((k) => [k, 0]);
  const pool = [...others, ...own], list = [...first], gcd = (a, b) => b ? gcd(b, a % b) : a;
  const step = [7, 5, 3, 1].find((s) => gcd(s, pool.length || 1) === 1); // a stride through the pool that visits everyone
  for (let n = 0; pool.length && list.length < CR_SLOTS.length; n++) list.push([pool[(n * step) % pool.length], 1 + Math.floor(n / pool.length) % 2]);
  CR_CAST = CR_SLOTS.map((q, i) => list[i] || null);
  return CR_CAST;
}

let CR_LAYER = null;
function drawCrowd(g, t, tod) {
  if (PF_VARIANT !== 'C' || t < CR_SLOTS[0].ti - .05 || !Object.keys(CROWD_DRAW).length) return;
  const cast = crCast(), L = .35 + .65 * tod.I, br = L * (tod.col[0] + tod.col[1] + tod.col[2]) / 765, m = pipSingMouth(t);
  // back rows first, so each row stands in front of the one behind it
  const order = CR_SLOTS.map((q, i) => i).sort((i, j) => CR_SLOTS[j].row - CR_SLOTS[i].row || CR_SLOTS[i].x - CR_SLOTS[j].x);
  // all of them go on one layer, lit once (a canvas filter on every pane of fifty heads cost 35 s a frame)
  if (!CR_LAYER) CR_LAYER = mkCanvas();
  const out = g; g = CR_LAYER.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
  for (const i of order) {
    const Q = CR_SLOTS[i], who = cast[i]; if (!who || !CROWD_DRAW[who[0]]) continue;
    const inU = easeOutBack(lin(t, Q.ti, Q.ti + .3), 1.5), outU = Math.pow(lin(t, Q.to, Q.to + .3), 2);
    if (inU <= 0 || outU >= 1) continue;
    const ph = TAU * (t - PF_B[0]) / (2 * PIP_HEAD_BEAT), sd = (i % 2) ? -1 : 1, bob = 7 * Math.abs(Math.sin(ph + i * .7));
    const drop = 380 * Q.sc * (1 - inU) + 640 * Q.sc * outU;
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    g.translate(Q.x, Q.y + drop - bob); g.rotate(Q.rot + .07 * Math.sin(ph) * sd); g.scale(Q.sc, Q.sc);
    CROWD_DRAW[who[0]](g, m, t, who[1]);
    g.restore();
  }
  out.save(); out.setTransform(1, 0, 0, 1, 0, 0); out.globalAlpha = 1; out.globalCompositeOperation = 'source-over';
  if (br < .985) out.filter = `brightness(${br.toFixed(3)})`;
  out.drawImage(CR_LAYER, 0, 0); out.restore();
}
