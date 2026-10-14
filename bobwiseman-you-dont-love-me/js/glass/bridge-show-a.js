// Stained glass, BRIDGE, draft 7 version A: draft 6's bridge as it was (the tea leaves make every picture), with
// only the reader recast. The old hooded sibyl, her midnight alcove, crystal ball and candle become the morning-show
// host from version B (bridge-show.js) standing behind the tea table on his kids' TV set: the gentle old man with
// the pockets far too big, an owl puppet at his side, a sleepy teapot on the table's far edge, the sun on the
// backdrop. He turns the cup and taps the rim exactly where her hand did (bridge-main's handAt), says his piece
// deadpan, and a teabag drops on his head on the beat before the Pips' stage comes down.
// Load after bridge-main.js: this file replaces the reader's draw functions and turns version B's set off.
// Pure function of song time t.

showFrame = () => false; // version B's set is not used on this page

// the host in still px: centre line x, his feet (hidden under the table) at fy, scale s
const RA = { x: 1450, fy: 1085, s: 3.3 };
const RA_M = new DOMMatrix().translate(RA.x, RA.fy).scale(RA.s);
const RA_PDY = 150;   // his pockets sit higher on this coat, so they show above the table
const RA_TEA = 139.13; // the teabag lands (an instrumental onset in the close-up on his face)
const toLocalA = ([x, y]) => [(x - RA.x) / RA.s, (y - RA.fy) / RA.s];

function hostStateA(t) {
  const hd = handAt(t, jolt(t)), T = toLocalA([hd.x, hd.y]), S = [HOST.shX, HOST.shY];
  const d = Math.hypot(T[0] - S[0], T[1] - S[1]) || 1, wrist = [T[0] - (T[0] - S[0]) / d * 30, T[1] - (T[1] - S[1]) / d * 30];
  const look = track([[134, [0, 0], .01], [135.3, [.35, .9], .3], [137.3, [.35, .9], .01], [137.7, [0, 0], .25], [139.4, [0, 0], .01], [139.6, [0, -1], .15]], t);
  let lid = .55 * blinkAt(t, 136.9) * blinkAt(t, 138.3);
  if (t >= RA_TEA && t < RA_TEA + .3) lid = 0;
  const said = t > 137.37 && t < 139.05 ? (.38 + .08 * Math.sin((t - 137.37) * 30)) * ease(t, 137.37, 137.47) * (1 - ease(t, 138.85, 139.05)) : 0;
  return {
    lh: [-165, -300], inPL: false, /* his other hand rests below the table edge */ rh: wrist, look, lid, mouth: said,
    tilt: .06 * ease(t, 135.2, 135.7) * (1 - ease(t, 137.3, 137.7)) - .1 * ease(t, 139.4, 139.6),
    lean: .035 * ease(t, 135.0, 136.0) * (1 - ease(t, 138.9, 140.0)),
  };
}
const raXf = (t) => { const sq = Math.exp(-Math.max(0, t - RA_TEA) * 12) * (t >= RA_TEA ? 1 : 0); return RA_M.scale(1 + .015 * sq, 1 - .025 * sq); };

// a teabag on a string with a ruby tag (no text); head-local units, centred on his crown
function teabag(g, seed) {
  pane(g, polyPath([[-20, -24], [20, -24], [22, 22], [-22, 22]]), [214, 186, 140], seed, { ew: 8, shade: .25, lw: 4 });
  paint(g, 2, .4); g.beginPath(); g.moveTo(-14, -12); g.lineTo(14, -12); g.stroke();
  g.fillStyle = 'rgba(110,60,24,.55)'; for (let k = 0; k < 7; k++) { g.beginPath(); g.arc(-12 + rnd(seed, k) * 24, -4 + rnd(seed, k + 9) * 22, 2.2, 0, TAU); g.fill(); }
  g.strokeStyle = 'rgba(240,236,224,.95)'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(0, -24); g.bezierCurveTo(30, -40, 70, -20, 70, 40); g.stroke();
  pane(g, polyPath([[60, 40], [80, 40], [80, 64], [60, 64]]), C.ruby, seed + 1, { ew: 4, shade: .2, lw: 3 });
}
function teabagOnHead(g, t) {
  if (t < RA_TEA) return;
  const b = Math.sin(Math.PI * lin(t, RA_TEA, RA_TEA + .2)) * 8 * (1 - lin(t, RA_TEA, RA_TEA + .2));
  g.save(); g.translate(8, -HOST.headRy - 20 - b); g.rotate(.18); teabag(g, 12000); g.restore();
}
function teabagFalling(g, t) {
  const tF = RA_TEA - .32; if (t < tF || t >= RA_TEA) return;
  const top = xfPt(raXf(RA_TEA), [8, HOST.headY - HOST.headRy - 20]);
  g.save(); g.translate(top[0], fallY(t, RA_TEA, -1900, top[1], .32)); g.scale(RA.s, RA.s); g.rotate(.18 + (RA_TEA - t) * 3); teabag(g, 12000); g.restore();
}

// the set behind the table: version B's backdrop and valance, scaled up so its floor line sits on the table's far edge
const RA_SET = { k: 1.7, x: 1900 }; // sun to the upper left, clouds clear of his head
function drawAlcove(g, t, view) {
  if (view.y0 > TY) return;
  g.save(); g.beginPath(); g.rect(view.x0 - 10, view.y0 - 10, view.x1 - view.x0 + 20, TY - view.y0 + 10); g.clip();
  g.fillStyle = 'rgb(150,190,220)'; g.fillRect(view.x0 - 10, view.y0 - 10, view.x1 - view.x0 + 20, TY - view.y0 + 10);
  const k = RA_SET.k;
  g.translate(RA_SET.x, TY); g.scale(k, k); g.translate(-960, -FLOOR);
  const vA = { x0: (view.x0 - RA_SET.x) / k + 960, x1: (view.x1 - RA_SET.x) / k + 960, y0: (view.y0 - TY) / k + FLOOR, y1: (view.y1 - TY) / k + FLOOR };
  drawBackdrop(g, t, vA); drawValance(g, t);
  g.restore();
}
// the owl puppet where the crystal ball was, looking at the host
function drawBall(g, t) {
  g.save(); g.translate(BALL[0], TY + 10); g.scale(2.4, 2.4); g.translate(-OWL.x, -(OWL.top + 230));
  drawOwl(g, t, t < 139.45 ? [1, .3] : [0, -1]);
  g.restore();
}
// the sleepy teapot where the candle was: it wakes on the reader's line and watches the cup
function drawCandle(g, t) {
  const S0 = teapotState(t);
  const S = { ...S0, peer: 0, flap: 0, turn: 0, pop: pulse(t, SH.wake, 9) + .8 * pulse(t, RA_TEA, 7), look: t < 139.3 ? [-1, .5] : [-.5, -1] };
  g.save(); g.translate(CANDLE[0], TY + 6); g.scale(2.0, 2.0); g.translate(-TPOT.x, -TPOT.y);
  drawTeapot(g, t, S);
  g.restore();
}
// the host behind the table (all but his reaching arm, which goes over the cup)
function drawReader(g, t) {
  drawHost(g, t, hostStateA(t), raXf(t), { noR: true, noHat: true, noStars: true, pocketDy: -RA_PDY, onHead: (gg) => teabagOnHead(gg, t) });
  teabagFalling(g, t);
}
function drawArm(g, t) { drawHost(g, t, hostStateA(t), raXf(t), { only: 'R' }); }
