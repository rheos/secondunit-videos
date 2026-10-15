// The backing singer's voice on the woodcut's last chapter (look test for Bob's note, rheos/secondunit-videos#118).
// Loaded after end-main.js; nothing in the kit or the chapter files is edited. Two hooks:
//   BLOCKS_E[6] (outside the court) also cuts her roundel and her scroll into the block's left sky;
//   pageTypeE also prints her syllables on the scroll in the red plate, one row each, each on her onset,
//   with a red rule that grows through the held note (a hymnal's extender line).
// She is a second voice by every cue at once: red not black, 54 px not 92/156, in the picture not under it,
// top left where the lead's lines are bottom centre. Occurrences and onsets: js/common/bv-onsets.js.
// renderFrame stays a pure function of t.

const BVR = { x: 92, y: 130, r: 66 };                       // her roundel, block units
const BVS = { x0: 178, x1: 358, y0: 22, y1: 248, tx: 198, rows: [86, 154, 222], size: 54 }; // her scroll
const BV_LEAD_IN = .36, BV_OUT = .65;                        // roundel opens before LIB, closes after her note

function bvOpen(o, t) { // roundel scale: pops open just before LIB, shrinks away after the note
  const a = o.syl[0].s - BV_LEAD_IN;
  return pop(t, a, .22) * (1 - ease(t, o.end + .4, o.end + BV_OUT));
}
function bvUnroll(o, t) { // scroll: unrolls down in the 0.3 s before LIB, rolls back up after the note
  return ease(t, o.syl[0].s - .3, o.syl[0].s - 1.5 * FE) * (1 - ease(t, o.end + .15, o.end + .4));
}
const bvRollerY = (u) => lerp(BVS.y0 + 14, BVS.y1, u);

// ---------------- in the block (tone map, block units) ----------------
function bvSingerCut(g, P, t) {
  const o = bvAt(t, BV_LEAD_IN + .05, BV_OUT + .05); if (!o) return;
  const k = bvSyl(o, t, FE);
  const pDress = P.lin(80, 6, { wob: .12 }), pFace = P.blk(120, 6, { jit: .2 }), pBg = P.ray(BVR.x, BVR.y - 30, 48, { jit: .3, wob: .2 }), pRoll = P.lin(0, 4, {});

  // the scroll, behind the roundel
  const un = bvUnroll(o, t);
  if (un > 0) {
    const yb = bvRollerY(un);
    g.beginPath(); g.rect(BVS.x0 + 7, BVS.y0, BVS.x1 - BVS.x0 - 14, yb - BVS.y0); fillWith(g, Cw(1)); ink(g, 3);
    line(g, BVS.x0 + 13, BVS.y0 + 10, BVS.x0 + 13, yb - 10); ink(g, 1.4);     // a ruled margin each side
    line(g, BVS.x1 - 13, BVS.y0 + 10, BVS.x1 - 13, yb - 10); ink(g, 1.4);
    for (const y of [BVS.y0, yb]) {                                            // the two rollers
      g.beginPath(); g.roundRect(BVS.x0, y - 9, BVS.x1 - BVS.x0, 18, 9);
      fillWith(g, WC.LG(g, 0, y - 9, 0, y + 9, [[0, .85], [.45, .35], [1, .05]], pRoll)); ink(g, 3);
      for (const x of [BVS.x0, BVS.x1]) { ell(g, x, y, 5, 9); fillWith(g, Cw(1)); ink(g, 2.2); }
    }
  }

  // the roundel: black band, red rim, a light sky of rays, the singer's head and shoulders
  const uo = bvOpen(o, t); if (uo <= .01) return;
  const r = BVR.r;
  g.save(); g.translate(BVR.x, BVR.y); g.scale(uo, uo);
  ell(g, 0, 0, r + 11, r + 11); fillWith(g, Cw(0));
  ell(g, 0, 0, r + 6, r + 6); fillWith(g, WC.C(1, 0, 1));                    // red plate rim
  ell(g, 0, 0, r, r); fillWith(g, WC.RG(g, 0, -30, 6, 0, -30, r * 1.4, [[0, .98], [.45, .74], [1, .38]], pBg)); ink(g, 2.5);
  g.save(); ell(g, 0, 0, r - 1.5, r - 1.5); g.clip();
  // long dark hair behind the head and over the shoulders
  g.beginPath(); g.moveTo(-30, 30); g.quadraticCurveTo(-36, -42, 0, -44); g.quadraticCurveTo(36, -42, 30, 30); g.closePath(); fillWith(g, Cw(0));
  // shoulders: a dark dress with a pale scooped neckline
  g.beginPath(); g.moveTo(-r, r); g.lineTo(-r + 6, 50); g.quadraticCurveTo(-40, 30, -14, 26); g.lineTo(14, 26); g.quadraticCurveTo(40, 30, r - 6, 50); g.lineTo(r, r); g.closePath();
  fillWith(g, WC.LG(g, -r, 0, r, 0, [[0, .32], [.45, .1], [1, .04]], pDress)); ink(g, 2.5);
  g.beginPath(); g.moveTo(-15, 26); g.quadraticCurveTo(0, 46, 15, 26); g.closePath(); fillWith(g, Cw(1)); ink(g, 2);
  g.beginPath(); g.rect(-6, 12, 12, 16); fillWith(g, Cw(1)); ink(g, 2);       // neck
  // her face: chin up a little, eyes shut on the held note, brows lifted
  const hy = -8;
  ell(g, 0, hy, 21, 27); fillWith(g, WC.LG(g, -21, 0, 21, 0, [[0, 1], [.78, 1], [1, .66]], pFace)); ink(g, 2.6);
  g.beginPath(); g.moveTo(-23, hy - 2); g.quadraticCurveTo(-22, hy - 32, 2, hy - 30); g.quadraticCurveTo(22, hy - 30, 23, hy - 4);
  g.quadraticCurveTo(10, hy - 22, -4, hy - 20); g.quadraticCurveTo(-16, hy - 18, -23, hy - 2); g.closePath(); fillWith(g, Cw(0)); // fringe
  const singing = k >= 0 && k <= 2;
  for (const s of [-1, 1]) {
    g.beginPath();
    if (singing) { g.moveTo(s * 3, hy - 4); g.quadraticCurveTo(s * 8, hy, s * 13, hy - 4); }   // closed lids
    else { ell(g, s * 8, hy - 3, 2.6, 3); }
    singing ? ink(g, 2.2) : fillWith(g, Cw(0));
    line(g, s * 3, hy - 13 - (singing ? 2 : 0), s * 13, hy - 14 - (singing ? 3 : 0)); ink(g, 2);
  }
  g.beginPath(); g.moveTo(-1, hy + 1); g.quadraticCurveTo(-4, hy + 8, 1, hy + 9); ink(g, 1.8);
  // the mouth takes each vowel's shape (ee, eh, oo), closes for a moment on each consonant
  const VOW = [[7.5, 3.4], [6.6, 6], [4.8, 7.2]];
  if (singing) {
    const art = 1 - .75 * pulse(t, o.syl[k].s - .07, .14);
    const [mx, my] = VOW[k];
    ell(g, 0, hy + 13, mx * (.6 + .4 * art), Math.max(.8, my * art * .85)); fillWith(g, Cw(0));
    // the held note: three sound cuts off to the right, toward her scroll, breathing with the vibrato
    // (outside her hair, on the light rays between her and the scroll)
    for (let i = 0; i < 3; i++) {
      const rr = 38 + i * 8, a = .34 + .08 * Math.sin((t - o.syl[0].s) * TAU * 5.5 - i * .9);
      g.beginPath(); g.arc(0, hy + 13, rr, -a, a); ink(g, 2.6);
    }
  } else { line(g, -6, hy + 13, 6, hy + 13); ink(g, 2.2); }
  g.restore();
  g.restore();
}
BLOCKS_E[6] = ((cut0) => function (g, P, t) { cut0(g, P, t); bvSingerCut(g, P, t); })(BLOCKS_E[6]);

// ---------------- on the type layers (page units) ----------------
const bvSylOn = (y, t) => t >= y.s - FE;
function bvType(L, R, t) {
  const o = bvAt(t, BV_LEAD_IN + .05, BV_OUT + .05); if (!o) return;
  const bx = BLKE.x, by = BLKE.y, size = BVS.size;
  if (PROBE.on) o.syl.forEach((y, k) => probeBvEdge(t, o, k));
  const un = bvUnroll(o, t); if (un <= 0) return;
  const yb = bvRollerY(un);
  const clip = [bx + BVS.x0 + 9, by + BVS.y0 + 9, BVS.x1 - BVS.x0 - 18, Math.max(0, yb - 9 - (BVS.y0 + 9))];
  R.save(); R.beginPath(); R.rect(...clip); R.clip();
  o.syl.forEach((y, k) => {
    if (!bvSylOn(y, t)) return;
    const x = bx + BVS.tx, yy = by + BVS.rows[k];
    const kk = Math.max(0, strikeE(t, y.s));
    R.save(); R.translate(x, yy); R.scale(1 + kk * .06, 1 + kk * .06);
    PR.typeText(R, y.txt, 0, 0, size, { color: PR.RED });
    if (kk > .3) PR.typeText(R, y.txt, 0, 0, size, { color: PR.RED });
    R.restore();
    // the held note: a red rule grows from the syllable to the scroll's margin until the next syllable (or her end)
    const x0 = k < 2 ? x + mwE(y.txt, size) + 10 : x, x1 = bx + BVS.x1 - 20, next = k < 2 ? o.syl[k + 1].s : o.end;
    const u = clamp((t - (y.s + .12)) / (next - FE - (y.s + .12)));
    // between syllables it sits at mid height like a hyphen; under the last one it underlines the word and runs on
    const ey = k < 2 ? yy - size * .3 : yy + 7;
    if (u > 0) { R.fillStyle = PR.RED; R.fillRect(x0, ey, Math.max(0, x1 - x0) * u, 3.4); }
    if (PROBE.on && un >= 1) {
      R.font = `${size}px "Big Caslon"`; R.textAlign = 'left'; R.textBaseline = 'alphabetic';
      PROBE.text(R, 'bv syllable', y.txt, x, yy, [bx + BVS.x0 + 13, by + BVS.y0 + 9, BVS.x1 - BVS.x0 - 26, BVS.y1 - BVS.y0 - 18], { keep: true, margin: 4 });
      if (u > 0) PROBE.box(R, 'bv hold', x0, ey, Math.max(1, (x1 - x0) * u), 3.4, { in: [bx + BVS.x0 + 13, by + BVS.y0 + 9, BVS.x1 - BVS.x0 - 26, BVS.y1 - BVS.y0 - 18], margin: 2 });
    }
  });
  R.restore();
  if (PROBE.on) bvFaces(L, t);
}
// 'bv#<occurrence>.<syllable>' fires on the first frame a syllable is printed, like the lead's word#
function probeBvEdge(t, o, k) { PROBE.edge(`bv#${o.n}.${k}`, bvSylOn(o.syl[k], t), bvSylOn(o.syl[k], ML.prevT(t))); }

// every face on this page as a box (page units, through L's transform), so the spec can keep words off them:
// the crowd and the couple (geometry as eBlockOutside draws them) and the singer herself
function bvFaces(L, t) {
  const bx = BLKE.x, by = BLKE.y, F = [];
  const head = (x, feetY, k, hop = 0) => { const cy = feetY - 238 * k - hop; F.push([x - 36 * k, cy - 40 * k, 72 * k, 72 * k]); };
  CROWD.forEach(([gi, x, y, k], i) => {
    const ta = BE.peopleOn[gi] - FE; if (t < ta) return;
    head(x, y, k, Math.max(0, Math.sin(clamp((t - ta) / .3) * Math.PI)) * 16);
  });
  const walk = ease(t, BE.l125 - .1, BE.l125 + 2.3), cy = lerp(332, 640, walk), ck = lerp(.42, 1.12, walk);
  if (t >= BE.l125 - .1) { head(lerp(605, 548, walk), cy, ck); head(lerp(640, 700, walk), cy, ck * 1.02); }
  const o = bvAt(t, BV_LEAD_IN + .05, BV_OUT + .05), uo = o ? bvOpen(o, t) : 0;
  if (uo > .01) F.push([BVR.x - 23 * uo, BVR.y + (-8 - 31) * uo, 46 * uo, 60 * uo]);
  for (const [x, y, w, h] of F) PROBE.box(L, 'face', bx + x, by + y, w, h);
}

const bvPageType0 = pageTypeE;
pageTypeE = function (L, R, p, t) { bvPageType0(L, R, p, t); if (p === 6) bvType(L, R, t); };
