// Round 3, wood-B: woodblocks 13-23 (the couple and their fact sheet; one Tuesday). See r3b-blocks.js.

// ---------- 13. a couple in England: a terrace street, the clock tower; on "sick" they crumple the king's paper ----------
function r3bBlockStreet(g, P, t) {
  const pSky = P.lin(0, 9, { wob: .2, jit: .3 }); g.fillStyle = WC.LG(g, 0, 0, 0, 400, [[0, .5], [1, .9]], pSky); g.fillRect(0, 0, BW, 400);
  const pBrick = P.dash(0, 7, 22, .85, { jit: .3 }), pRoof = P.lin(-20, 6, {}), pTower = P.lin(90, 6, { wob: .1 }), pRay = P.ray(1080, 110, 36, { jit: .3 });
  const pCoat = P.lin(90, 7, { wob: .12 }), pFace = P.blk(120, 6, { jit: .2 }), pEdge = P.lin(0, 4, {}), pNews = P.lin(0, 4, {});
  // the clock tower far off (right): its face flashes on "England"
  const en = r3bE(t, r3bB.england, .2) * (1 - ease(t, r3bB.england + 1.2, r3bB.england + 1.8));
  if (en > 0) { g.beginPath(); g.rect(860, 0, 380, 400); fillWith(g, WC.RG(g, 1080, 110, 6, 1080, 110, 300, [[0, .98], [1, .5]], pRay)); }
  g.beginPath(); g.rect(1040, 70, 80, 330); fillWith(g, WC.LG(g, 1040, 0, 1120, 0, [[0, .3], [.5, .8], [1, .25]], pTower)); ink(g, 3);
  pth(g, [[1030, 70], [1130, 70], [1080, -10]]); fillWith(g, WC.C(.3, pRoof)); ink(g, 3);
  r3bClock(g, 1080, 120, 26, 4.2 + en * .5);
  // the terrace: brick fronts, chimney pots, doors and windows
  for (let i = 0; i < 4; i++) {
    const x = 20 + i * 250;
    g.beginPath(); g.rect(x, 170, 240, 330); fillWith(g, WC.LG(g, x, 0, x + 240, 0, [[0, .35], [.5, .65], [1, .3]], pBrick)); ink(g, 3);
    pth(g, [[x - 6, 172], [x + 246, 172], [x + 220, 120], [x + 20, 120]]); fillWith(g, WC.C(.2, pRoof)); ink(g, 3);
    for (const cx of [x + 50, x + 190]) { g.beginPath(); g.rect(cx - 16, 70, 32, 56); fillWith(g, Cw(0)); for (const px of [-8, 8]) { g.beginPath(); g.rect(cx + px - 6, 58, 12, 14); fillWith(g, Cw(.6, pRoof)); ink(g, 2); } }
    for (const wx of [x + 30, x + 150]) { g.beginPath(); g.rect(wx, 210, 60, 80); fillWith(g, Cw(.9)); ink(g, 3); line(g, wx + 30, 210, wx + 30, 290); ink(g, 3); line(g, wx, 250, wx + 60, 250); ink(g, 3); }
    g.beginPath(); g.roundRect(x + 90, 330, 64, 170, [32, 32, 0, 0]); fillWith(g, Cw(0)); ink(g, 3);
  }
  r3bGround(g, P, 500, .55);
  // the couple step out of the door on "couple"; on "sick" they screw up the paper they were reading
  const out = r3bE(t, r3bB.couple87, .5), sick = r3bE(t, r3bB.sick, .25);
  const pats = { coat: pCoat, face: pFace, legs: pEdge };
  const st = out > 0 && out < 1 ? t * 9 : 0;
  r3bPerson(g, lerp(372, 480, out), lerp(500, 740, out), lerp(.6, 1.45, out), { woman: true, arm: .3, step: st }, pats);
  r3bPerson(g, lerp(372, 740, out), lerp(500, 740, out), lerp(.6, 1.48, out), { arm2: .3, step: st + 1.3 }, pats);
  if (out > .9) { // the paper between them: a broadsheet with the crown on it, crumpled on "sick"
    const px = 610, py = 480; const ps = 1.4;
    if (sick < 1) {
      g.save(); g.translate(px, py); g.scale(ps * (1 - sick * .7), ps * (1 - sick * .7)); g.rotate(sick * .5);
      g.beginPath(); g.rect(-80, -60, 160, 110); fillWith(g, WC.C(.95, pNews)); ink(g, 3);
      coinCrown(g, -40, -20, 22, 20);
      for (let r = 0; r < 6; r++) { line(g, -6, -46 + r * 14, 70, -46 + r * 14); ink(g, 2); }
      g.restore();
    }
    if (sick > .6) { g.beginPath(); for (let i = 0; i < 12; i++) { const a = i / 12 * TAU, r = 30 + (i % 2 ? -8 : 6); g.lineTo(px + Math.cos(a) * r, py + Math.sin(a) * r); } g.closePath(); fillWith(g, Cw(.9)); ink(g, 3); for (let i = 0; i < 4; i++) { line(g, px - 16 + i * 8, py - 14, px - 4 + i * 8, py + 16); ink(g, 1.6); } }
    mitten(g, px - 112 + sick * 70, py + 14, 15); mitten(g, px + 112 - sick * 70, py + 14, 15);
  }
}

// ---------- 14. observing the king: a spyglass, a round view; on "ticked" a key turns in his back ----------
function r3bBlockSpyglass(g, P, t) {
  r3bRays(g, P, 860, 300, 70, 900, .9, .15);
  const pCoat = P.lin(90, 7, { wob: .12 }), pFace = P.blk(120, 6, { jit: .2 }), pEdge = P.lin(0, 4, {}), pBrass = P.lin(0, 4, {}), pHedge = P.dash(70, 6, 10, .6, { jit: .4 }), pIn = P.lin(0, 8, { wob: .14 }), pGear = P.rad(0, 0, 5, {});
  const pats = { coat: pCoat, face: pFace, legs: pEdge };
  // the view: an iris that opens on "observing"
  const vx = 860, vy = 290, R = 250 * r3bE(t, r3bB.observing, .35);
  if (R > 2) {
    ell(g, vx, vy, R + 14, R + 14); fillWith(g, Cw(0));
    ell(g, vx, vy, R, R); fillWith(g, WC.RG(g, vx, vy - 40, 6, vx, vy - 40, R * 1.3, [[0, .97], [1, .55]], pIn));
    g.save(); ell(g, vx, vy, R - 2, R - 2); g.clip();
    // the king seated in the view from "king"; ticks on every onset of the next line; a key turns in his back on "ticked"
    if (r3bAt(t, r3bB.king89)) {
      const tick = r3bAt(t, r3bB.l90) ? r3bTalk(t, r3bB.on90) : 0;
      const ka = r3bAt(t, r3bB.ticked) ? (t - r3bB.ticked) * 6 : 0;
      // gears behind him
      for (const [gx, gy, gr, dir] of [[vx - 150, vy - 90, 60, 1], [vx + 160, vy - 60, 46, -1], [vx + 120, vy + 130, 54, 1]]) {
        if (!r3bAt(t, r3bB.ticked)) break;
        g.save(); g.translate(gx, gy); g.rotate(ka * dir * .6);
        g.beginPath(); for (let i = 0; i < 20; i++) { const a = i / 20 * TAU, r = i % 2 ? gr * .82 : gr; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); fillWith(g, WC.C(.55, pGear)); ink(g, 3); ell(g, 0, 0, gr * .3, gr * .3); fillWith(g, Cw(0));
        g.restore();
      }
      // the wind-up key at his back (right)
      g.save(); g.translate(vx + 92, vy - 20); g.scale(Math.cos(ka) || .01, 1);
      g.beginPath(); g.rect(-6, -10, 40, 20); fillWith(g, Cw(0));
      for (const s of [-1, 1]) { ell(g, 50, s * 22, 16, 22); fillWith(g, Cw(1)); ink(g, 4); }
      g.restore();
      r3bKing(g, P, vx, vy + 120, .95, { hands: 'knees', crownUp: r3bPulse(t, r3bB.king89 - r3bF, .3) * 14, bob: -tick * 8 });
    }
    g.restore();
    ell(g, vx, vy, R + 7, R + 7); cutl(g, 2.5);
  }
  // the couple behind a hedge (left): he holds the spyglass to his eye
  r3bPerson(g, 140, 720, 1.3, { woman: true, arm: .1 }, pats);
  r3bPerson(g, 360, 720, 1.34, { arm: .1 }, pats);
  const ex = 370, ey = 720 - 238 * 1.34;
  g.beginPath(); g.moveTo(ex + 14, ey - 14); g.lineTo(ex + 240, ey - 30); g.lineTo(ex + 240, ey + 20); g.lineTo(ex + 14, ey + 14); g.closePath(); fillWith(g, WC.LG(g, 0, ey - 26, 0, ey + 18, [[0, .9], [.5, .45], [1, .15]], pBrass)); ink(g, 3.5);
  for (const u of [.35, .7]) { const x = lerp(ex + 14, ex + 240, u); line(g, x, ey - 12 - u * 14, x, ey + 12 + u * 6); ink(g, 3); }
  limb(g, [[ex - 40, ey + 66], [ex + 26, ey + 52], [ex + 74, ey + 8]], 20); mitten(g, ex + 76, ey + 6, 14);
  g.beginPath(); g.moveTo(0, 500); for (let x = 0; x <= 560; x += 26) g.quadraticCurveTo(x + 13, 470 + (x % 52 ? 6 : -6), x + 26, 500); g.lineTo(586, BH); g.lineTo(0, BH); g.closePath(); fillWith(g, WC.C(.35, pHedge)); ink(g, 3);
}

// ---------- 15. the meeting room: they come in on "went", the others welcome them; the press makes the fact sheet ----------
function r3bBlockMeeting(g, P, t) {
  r3bPanel(g, P, 760, 120, 480);
  const pCoat = P.lin(90, 7, { wob: .12 }), pFace = P.blk(120, 6, { jit: .2 }), pEdge = P.lin(0, 4, {}), pWood = P.lin(0, 7, { wob: .15 }), pOut = P.ray(140, 250, 30, { jit: .3 }), pIron = P.lin(0, 5, {});
  r3bGround(g, P, 480, .5);
  const pats = { coat: pCoat, face: pFace, legs: pEdge };
  // sheets pinned on the wall (blank, ruled)
  for (const [x, y, r] of [[400, 130, -.05], [520, 110, .04], [640, 140, -.02]]) r3bSheet(g, x, y, 90, 120, r);
  // the door (left): opens on "went"
  const op = r3bE(t, r3bB.went, .25);
  g.beginPath(); g.rect(60, 120, 170, 360); fillWith(g, op > .02 ? WC.RG(g, 140, 250, 10, 140, 250, 300, [[0, .98], [1, .6]], pOut) : Cw(0)); ink(g, 5);
  g.beginPath(); g.rect(62, 122, lerp(166, 30, op), 356); fillWith(g, WC.LG(g, 62, 0, 230, 0, [[0, .5], [1, .2]], pWood)); ink(g, 4);
  // the people at the table (right): they raise their hands on "Greenpeace"
  const hi = r3bE(t, r3bB.greenpeace, .2);
  [[820, 1, .94], [960, 0, .96], [1100, 1, .92]].forEach(([x, wo, k], i) => r3bPerson(g, x, 640, k, { woman: !!wo, arm: .1 + hi * .8 * (i !== 1 ? 1 : .6), arm2: .1 }, pats));
  g.beginPath(); g.rect(740, 450, 480, 20); fillWith(g, WC.LG(g, 0, 450, 0, 470, [[0, .85], [1, .3]], pWood)); ink(g, 4);
  g.beginPath(); g.rect(756, 470, 448, 120); fillWith(g, WC.LG(g, 756, 0, 1204, 0, [[0, .2], [.5, .55], [1, .12]], pWood)); ink(g, 4);
  // the little screw press on the table: its bar swings on "made"; a sheet slides out on "sheet"
  const bar = r3bE(t, r3bB.made, .3), sh = r3bE(t, r3bB.sheet, .3);
  g.beginPath(); g.rect(880, 300, 20, 150); fillWith(g, Cw(0)); g.beginPath(); g.rect(1040, 300, 20, 150); fillWith(g, Cw(0));
  g.beginPath(); g.rect(870, 290, 200, 24); fillWith(g, WC.C(.4, pIron)); ink(g, 3);
  line(g, 970, 300, 970, 380 + bar * 20); ink(g, 10);
  g.beginPath(); g.rect(910, 380 + bar * 20, 120, 24); fillWith(g, WC.C(.3, pIron)); ink(g, 3);
  g.save(); g.translate(970, 280); g.rotate(bar * 1.4); line(g, -90, 0, 90, 0); ink(g, 8); ell(g, -90, 0, 10, 10); fillWith(g, Cw(0)); ell(g, 90, 0, 10, 10); fillWith(g, Cw(0)); g.restore();
  g.beginPath(); g.rect(900, 426, 140, 24); fillWith(g, Cw(.9)); ink(g, 2.5);
  // the couple: walk in from the door, then she holds the new fact sheet up
  const wk = r3bE(t, r3bB.went, .9), st = wk > 0 && wk < 1 ? t * 9 : 0;
  r3bPerson(g, lerp(150, 420, wk), 700, lerp(1.0, 1.22, wk), { woman: true, step: st, arm: .1 + sh * .85, leaf: true }, pats);
  r3bPerson(g, lerp(170, 610, wk), 700, lerp(1.02, 1.25, wk), { step: st + 1.3, arm2: .1 }, pats);
  if (sh > 0 && sh < 1) r3bSheet(g, lerp(970, 480, sh), lerp(430, 260, sh), 60, 80, sh * .3);
}

// ---------- 16. the couple out in rain, then in heat ----------
function r3bBlockWeather(g, P, t) {
  const heat = r3bE(t, r3bB.heat, .3);
  const pSky = P.lin(0, 8, { wob: .2, jit: .3 }), pSun = P.ray(980, 120, 60, { jit: .3, wob: .2 });
  if (heat <= 0) { g.fillStyle = WC.LG(g, 0, 0, 0, 420, [[0, .35], [1, .7]], pSky); g.fillRect(0, 0, BW, 420); }
  else { g.fillStyle = WC.RG(g, 980, 120, 10, 980, 120, 1000, [[0, .98], [.4, .6], [1, .35]], pSun); g.fillRect(0, 0, BW, 420); ell(g, 980, 120, 60, 60); fillWith(g, Cw(1)); ink(g, 4); }
  const pBrick = P.dash(0, 7, 22, .85, { jit: .3 }), pCoat = P.lin(90, 7, { wob: .12 }), pFace = P.blk(120, 6, { jit: .2 }), pEdge = P.lin(0, 4, {}), pCloud = P.brad(0, 0, 8, { wob: .1 }), pIron = P.lin(90, 4, {});
  const pats = { coat: pCoat, face: pFace, legs: pEdge };
  g.beginPath(); g.rect(0, 120, 380, 300); fillWith(g, WC.LG(g, 0, 0, 380, 0, [[0, .3], [1, .6]], pBrick)); ink(g, 3);
  r3bGround(g, P, 420, .5);
  // the lamp post
  g.beginPath(); g.rect(1150, 120, 14, 420); fillWith(g, Cw(0)); pth(g, [[1130, 120], [1184, 120], [1172, 70], [1142, 70]]); fillWith(g, WC.C(.8, pIron)); ink(g, 3);
  // clouds roll in for the rain line, part on "heat"
  const cl = r3bE(t, r3bB.l93, .4) * (1 - heat);
  if (cl > 0) for (let i = 0; i < 5; i++) { const cx = 120 + i * 240 + (1 - cl) * -300 + heat * 600, cy = 60 + (i % 2) * 30; for (const [dx, dy, r] of [[-60, 10, 50], [0, -10, 64], [60, 10, 50]]) { ell(g, cx + dx, cy + dy, r, r * .7); fillWith(g, WC.C(.6, pCloud)); ink(g, 2.5); } }
  // the couple with their leaflets: on each "stood" they plant themselves (a small drop)
  const plant = r3bPulse(t, r3bB.stood93 - r3bF, .25) + r3bPulse(t, r3bB.stood94 - r3bF, .25);
  r3bPerson(g, 510, 750 + plant * 10, 1.48, { woman: true, arm: .5, leaf: true, arm2: heat > 0 ? .3 + Math.abs(Math.sin(t * 8)) * .2 : .05 }, pats);
  r3bPerson(g, 750, 750 + plant * 10, 1.52, { arm2: .5, leaf2: true, arm: .05 }, pats);
  // the rain from "rain" until "heat"; puddles; heat shimmer after
  const rn = r3bE(t, r3bB.rain, .15) * (1 - heat);
  if (rn > 0) { r3bRain(g, t, 0, 0, BW, 580, Math.round(170 * rn)); for (const [px, py] of [[300, 520], [880, 540], [1040, 500]]) { ell(g, px, py, 70 * rn, 10 * rn); ink(g, 2.4); } }
  if (heat > 0) for (let i = 0; i < 7; i++) { const sx = 80 + i * 170; g.beginPath(); for (let k = 0; k <= 8; k++) g.lineTo(sx + Math.sin(k + t * 9 + i) * 8, 400 - k * 24 * heat); ink(g, 2.5); }
}

// ---------- 17. handing out the truth, for free; life's too quick: an hourglass, and she won't go quietly ----------
function r3bBlockHandout(g, P, t) {
  r3bRays(g, P, 600, 200, 70, 900, .96, .15);
  const pCoat = P.lin(90, 7, { wob: .12 }), pFace = P.blk(120, 6, { jit: .2 }), pEdge = P.lin(0, 4, {}), pCoat2 = P.lin(60, 6, { wob: .12 }), pSand = P.dash(90, 4, 6, .5, { jit: .4 }), pWood = P.lin(0, 7, { wob: .15 }), pBrass = P.lin(0, 4, {});
  r3bGround(g, P, 500, .5);
  const pats = { coat: pCoat, face: pFace, legs: pEdge }, pats2 = { coat: pCoat2, face: pFace, legs: pEdge };
  // three passers-by (right); each takes a leaflet: "gave", "out", "truth"
  const takes = [r3bB.gave, r3bB.out, r3bB.truth];
  [[900, 1, 1.1], [1040, 0, 1.14], [1175, 1, 1.08]].forEach(([x, wo, k], i) => {
    const got = r3bAt(t, takes[i]);
    r3bPerson(g, x, 690, k, { woman: !!wo, arm2: got ? .55 : .05, leaf2: got, flip: false }, pats2);
  });
  const tr = r3bE(t, r3bB.truth, .25) * (1 - ease(t, r3bB.truth + 1.2, r3bB.truth + 1.6));
  if (tr > 0) r3bImpact(g, 1000, 330, 60, 150, 14, 4, tr);
  // the couple (left): he holds out the leaflets; she waves back the coin a passer-by offers, on "free"
  const fr = r3bE(t, r3bB.free, .3);
  r3bPerson(g, 520, 700, 1.2, { woman: true, arm: .55 + fr * .3, speak: r3bAt(t, r3bB.l96) ? r3bTalk(t, [r3bB.quietly]) : 0 }, pats);
  r3bPerson(g, 700, 700, 1.24, { arm: .55, leaf: true }, pats);
  if (r3bAt(t, r3bB.did95)) { const cx = lerp(820, 880, fr), cy = lerp(340, 260, fr) - Math.sin(fr * Math.PI) * 40; drawCoin(g, cx, cy, 20, fr * 9, pBrass); }
  // the hourglass on a crate (left) from "life"; it turns on "quick" and the sand runs
  const lf = r3bPop(t, r3bB.life - r3bF, .2);
  if (lf > 0) {
    g.beginPath(); g.rect(170, 420, 180, 120); fillWith(g, WC.LG(g, 0, 420, 0, 540, [[0, .85], [1, .3]], pWood)); ink(g, 4); line(g, 170, 480, 350, 480); ink(g, 3);
    const tu = r3bE(t, r3bB.quick, .25), run = r3bAt(t, r3bB.quick) ? clamp((t - r3bB.quick) / 1.2) : 0;
    g.save(); g.translate(260, 330); g.scale(lf, lf); g.rotate(tu * Math.PI);
    g.beginPath(); g.rect(-70, -96, 140, 14); fillWith(g, Cw(0)); g.beginPath(); g.rect(-70, 82, 140, 14); fillWith(g, Cw(0));
    g.beginPath(); g.moveTo(-56, -82); g.lineTo(56, -82); g.quadraticCurveTo(56, -20, 6, 0); g.quadraticCurveTo(56, 20, 56, 82); g.lineTo(-56, 82); g.quadraticCurveTo(-56, 20, -6, 0); g.quadraticCurveTo(-56, -20, -56, -82); g.closePath(); fillWith(g, Cw(1)); ink(g, 3.5);
    // sand: top heap (after the turn, the top is the old bottom) shrinks, bottom grows
    const top = tu > .5 ? 1 - run : 0, bot = tu > .5 ? run : 1;
    const sgn = tu > .5 ? -1 : 1; // the drawing is rotated: draw so that "down" on screen gets the sand
    if (bot > .02) { g.beginPath(); g.moveTo(-50 * sgn, 78 * sgn); g.lineTo(50 * sgn, 78 * sgn); g.lineTo(0, (78 - 60 * bot) * sgn); g.closePath(); fillWith(g, WC.C(.35, pSand)); }
    if (top > .02) { g.beginPath(); g.moveTo(-40 * top * sgn, -70 * sgn + 60 * (1 - top) * -sgn); g.lineTo(40 * top * sgn, -70 * sgn + 60 * (1 - top) * -sgn); g.lineTo(0, -8 * sgn); g.closePath(); fillWith(g, WC.C(.35, pSand)); }
    if (run > 0 && run < 1) { line(g, 0, -4, 0, 70 * (tu > .5 ? -1 : 1)); ink(g, 2); }
    for (const s of [-1, 1]) { line(g, s * 64, -84, s * 64, 84); ink(g, 6); }
    g.restore();
  }
  // on "quietly" she raises a speaking trumpet and calls out
  const q = r3bE(t, r3bB.quietly, .15);
  if (q > 0) r3bTrumpet(g, 520 + 12, 700 - 220 * 1.2, r3bTalk(t, [r3bB.quietly]) * .6 + q * .4, pBrass);
}

// ---------- 18. the parents: "stop"; the king with his lawyers through the window; the constables at the door ----------
function r3bBlockParents(g, P, t) {
  const pPaper = P.wave(90, 14, 4, 18, { wob: .1 });
  g.fillStyle = WC.LG(g, 0, 0, BW, 0, [[0, .55], [.5, .8], [1, .5]], pPaper); g.fillRect(0, 0, BW, 470);
  const pCoat = P.lin(90, 7, { wob: .12 }), pFace = P.blk(120, 6, { jit: .2 }), pEdge = P.lin(0, 4, {}), pStone = P.lin(90, 6, {}), pSky = P.lin(0, 8, { wob: .2 }), pRay = P.ray(1000, 160, 30, { jit: .3 });
  const pGown = P.lin(90, 6.5, { wob: .12 }), pWig = P.lin(0, 5, { wob: .2 }), pCop = P.lin(90, 5, { wob: .1 });
  r3bGround(g, P, 470, .45);
  const pats = { coat: pCoat, face: pFace, legs: pEdge };
  // the window (right): the castle on its hill; rays on "king"; little lawyers line up before it on "lawyers"
  const kg = r3bE(t, r3bB.king99, .25);
  g.beginPath(); g.rect(800, 50, 380, 300); fillWith(g, kg > 0 ? WC.RG(g, 1000, 160, 6, 1000, 160, 300, [[0, .98], [1, .55]], pRay) : WC.LG(g, 0, 50, 0, 350, [[0, .6], [1, .9]], pSky)); ink(g, 6);
  g.save(); g.beginPath(); g.rect(800, 50, 380, 300); g.clip();
  g.beginPath(); g.moveTo(800, 350); g.quadraticCurveTo(1000, 230, 1180, 350); g.closePath(); fillWith(g, Cw(.4, pStone)); ink(g, 3);
  drawCastle(g, 1000, 290, .55, { stone: pStone }, true);
  [0, 1, 2, 3, 4].forEach(i => { const a = r3bB.lawyers99 - r3bF + i * .05; if (t < a) return; const u = Math.min(1, r3bPop(t, a, .2)); r3bLawyer(g, 870 + i * 64, 352 + (1 - u) * 60, .3, {}, { gown: pGown, face: pFace, wig: pWig }); });
  g.restore();
  line(g, 990, 50, 990, 350); ink(g, 8); line(g, 800, 200, 1180, 200); ink(g, 8);
  // the constables pop up at the window sill on "cops"
  const cp = r3bE(t, r3bB.cops100, .15);
  if (cp > 0) for (const [x, i] of [[880, 0], [1100, 1]]) { g.save(); g.beginPath(); g.rect(800, 0, 380, 350); g.clip(); r3bCop(g, x, 640 + (1 - cp) * 200 - 2 * i, .95, { arm: .1 }, { coat: pCop, face: pFace, legs: pEdge }); g.restore(); }
  g.beginPath(); g.rect(780, 344, 420, 22); fillWith(g, Cw(.85, pStone)); ink(g, 3);
  // the couple (left)
  r3bPerson(g, 120, 700, 1.15, { woman: true, arm: .1, leaf: true }, pats);
  r3bPerson(g, 290, 700, 1.18, { arm2: .1 }, pats);
  // the parents (middle) pop in on "parents"; the father's hand goes up on "told", flat out on "stop";
  // the mother points to the window on "king"
  const pa = r3bPop(t, r3bB.parents - r3bF, .22);
  if (pa > 0) {
    const tol = r3bE(t, r3bB.told, .2), stp = r3bE(t, r3bB.stop, .12), pt = r3bE(t, r3bB.king99, .2);
    const fx = 560, fk = 1.2, fa = .05 + tol * .3 + stp * .2;
    g.save(); g.translate(640, 700); g.scale(1, Math.min(1, pa)); g.translate(-640, -700);
    r3bElder(g, 720, 700, 1.15, { woman: true, arm2: .05, arm: pt * .62 }, pats);
    r3bElder(g, fx, 700, fk, { arm2: fa }, pats);
    g.restore();
    if (stp > 0 && pa >= 1) { // the father's flat hand held out at the end of his raised arm: a big mitten with a thumb
      const th = .12 + fa * 2.55, hx = fx - 36 * fk - Math.sin(th) * 104 * fk, hy = 700 - 196 * fk + Math.cos(th) * 104 * fk;
      const k = stp * 1.1;
      g.save(); g.translate(hx, hy - 24); g.scale(k, k);
      g.beginPath(); g.roundRect(-28, -44, 56, 80, 24); fillWith(g, Cw(1)); ink(g, 4);
      g.beginPath(); g.ellipse(32, 8, 10, 20, -.5, 0, TAU); fillWith(g, Cw(1)); ink(g, 3.5);
      for (const x of [-9, 9]) { line(g, x, -38, x, -10); ink(g, 2.4); }
      g.restore();
      r3bImpact(g, hx, hy - 24, 66, 120, 8, 4, r3bHit(t, r3bB.stop, .3));
    }
  }
}

// ---------- 19. one Tuesday: the calendar day ringed in red; the king at his desk, not mad, smiling ----------
function r3bBlockTuesday(g, P, t) {
  r3bPanel(g, P, 760, 100, 470);
  const pWood = P.lin(0, 7, { wob: .15 }), pRay = P.ray(800, 220, 50, { jit: .3 });
  r3bGround(g, P, 470, .5);
  // the calendar (left): a leaf tears off on "happened"; on "Tuesday" a red ring is drawn round the day
  const ring = r3bE(t, r3bB.tuesday, .3);
  r3bCalendar(g, 220, 250, 300, 340, [2, 2, ring]);
  const lf = t - (r3bB.happened - r3bF);
  if (lf > 0 && lf < 1.2) eFlyingSheet(g, 220 + lf * 420, 200 + lf * 200 - Math.sin(Math.min(lf, .6) / .6 * Math.PI) * 90, 260, 300 * (1 - lf * .5), lf * 4, Math.cos(lf * 8), false);
  // the king at his desk: crown hops on "king", he smiles on "mad" (not mad), eyes shut at ease, rays behind
  const md = r3bE(t, r3bB.mad, .25);
  if (md > 0) { g.beginPath(); g.rect(560, 30, 520, 440); fillWith(g, WC.RG(g, 800, 220, 10, 800, 220, 400 * md + 10, [[0, .98], [1, .4]], pRay)); }
  r3bKing(g, P, 800, 420, 1.0, { hands: 'belly', crownUp: r3bPulse(t, r3bB.king102 - r3bF, .3) * 16, smile: md > .5, eyesClosed: md > .5 });
  g.beginPath(); g.rect(560, 410, 520, 24); fillWith(g, WC.LG(g, 0, 410, 0, 434, [[0, .88], [1, .3]], pWood)); ink(g, 4);
  g.beginPath(); g.rect(580, 434, 480, 160); fillWith(g, WC.LG(g, 580, 0, 1060, 0, [[0, .18], [.5, .55], [1, .12]], pWood)); ink(g, 4);
  for (let x = 610; x < 1040; x += 150) { g.beginPath(); g.rect(x, 454, 120, 110); cutl(g, 2.4); }
  // an inkwell and a quill on the desk
  g.beginPath(); g.rect(980, 376, 40, 36); fillWith(g, Cw(0)); g.beginPath(); g.moveTo(1000, 380); g.quadraticCurveTo(1030, 300, 1060, 270); g.quadraticCurveTo(1040, 320, 1004, 380); fillWith(g, Cw(1)); ink(g, 2.5);
}

// ---------- 20. the patent for satellite ads: coins across the desk, the sealed patent, the satellite, the ad ----------
function r3bBlockPatent(g, P, t) {
  const pNight = P.lin(0, 6, { wob: .2, jit: .3 }); g.fillStyle = WC.C(.1, pNight); g.fillRect(0, 0, BW, BH);
  const pWood = P.lin(0, 7, { wob: .15 }), pSack = P.rad(250, 420, 6, { wob: .1 }), pEdge = P.lin(90, 4, {}), pPanel = P.xh(30, 120, 7, {}), pBeam = P.ray(830, 160, 26, { jit: .3 }), pBun = P.rad(1000, 450, 6, {}), pGlobe = P.lin(0, 6, { wob: .1 });
  // the great arched window: the night sky and its stars (the wall around it panelled dark)
  g.beginPath(); g.roundRect(540, 30, 680, 520, [340, 340, 0, 0]); fillWith(g, WC.C(.06, pNight)); ink(g, 8);
  for (let i = 0; i < 18; i++) { const x = 580 + rnd(i, 7) * 600, y = 60 + rnd(i, 8) * 300; line(g, x - 5, y, x + 5, y); cutl(g, 2.4); line(g, x, y - 5, x, y + 5); cutl(g, 2.4); }
  // the world below: an arc of globe; on "ads" the satellite beams the bun onto it
  g.save(); g.beginPath(); g.roundRect(540, 30, 680, 520, [340, 340, 0, 0]); g.clip();
  ell(g, 900, 900, 480, 440); fillWith(g, WC.C(.75, pGlobe)); ink(g, 4);
  for (let i = 0; i < 5; i++) { g.beginPath(); g.ellipse(900, 900, 480 - i * 90, 440, 0, Math.PI * 1.1, Math.PI * 1.9); ink(g, 2); }
  const sat = r3bE(t, r3bB.satellite, .5), sy = lerp(560, 170, sat), sx = lerp(820, 880, sat);
  const ad = r3bE(t, r3bB.ads, .2);
  if (ad > 0) {
    g.beginPath(); g.moveTo(sx, sy + 80); g.lineTo(sx + 240 * ad, 520); g.lineTo(sx - 60 * ad, 520); g.closePath(); fillWith(g, WC.RG(g, sx, sy, 6, sx, sy, 400, [[0, .98], [1, .6]], pBeam));
    g.save(); g.translate(sx + 90, 500); g.scale(ad, ad); eBun(g, 0, 0, 170, pBun); g.restore();
  }
  if (sat > 0) {
    g.save(); g.translate(sx, sy); g.rotate(-.12);
    for (const s of [-1, 1]) {
      line(g, s * 32, 0, s * 52, 0); ink(g, 6);
      g.beginPath(); g.rect(s > 0 ? 52 : -182, -30, 130, 60); fillWith(g, WC.C(.8, pPanel)); ink(g, 4);
      for (let k = 1; k < 4; k++) { const x = (s > 0 ? 52 : -182) + k * 32.5; line(g, x, -30, x, 30); ink(g, 2.5); } line(g, s > 0 ? 52 : -182, 0, s > 0 ? 182 : -52, 0); ink(g, 2.5);
    }
    g.beginPath(); g.rect(-32, -40, 64, 80); fillWith(g, Cw(1)); ink(g, 4); line(g, -32, -10, 32, -10); ink(g, 2); line(g, -32, 14, 32, 14); ink(g, 2);
    g.beginPath(); g.ellipse(0, 66, 40, 16, 0, 0, TAU); fillWith(g, Cw(1)); ink(g, 3.5); line(g, 0, 40, 0, 62); ink(g, 4); ell(g, 0, 80, 5, 5); fillWith(g, Cw(0));
    g.restore();
  }
  g.restore();
  // the king at the desk (left), and his money: coins slide across on "buying"; the patent unrolls on "patent"
  r3bKing(g, P, 250, 420, .95, { hands: 'belly', smile: r3bAt(t, r3bB.patent) });
  g.beginPath(); g.rect(30, 410, 560, 24); fillWith(g, WC.LG(g, 0, 410, 0, 434, [[0, .88], [1, .3]], pWood)); ink(g, 4);
  g.beginPath(); g.rect(50, 434, 520, 160); fillWith(g, WC.LG(g, 50, 0, 570, 0, [[0, .18], [.5, .55], [1, .12]], pWood)); ink(g, 4);
  drawSack(g, P, 90, 410, 120, 110, pSack, r3bAt(t, r3bB.buying));
  if (r3bAt(t, r3bB.buying)) for (let i = 0; i < 6; i++) { const d = clamp((t - r3bB.buying + r3bF - i * .06) / .4); if (d <= 0) continue; drawStackCoin(g, lerp(120, 300 + (i % 3) * 30, d), 398 - Math.floor(i / 3) * 10, 20, 6, 8, pEdge, true); }
  const pu = r3bE(t, r3bB.patent, .3);
  if (pu > 0) {
    g.beginPath(); g.rect(360, 300, 200 * pu, 110); fillWith(g, Cw(1)); ink(g, 3);
    for (let r = 0; r < 5; r++) { line(g, 372, 320 + r * 16, 360 + 190 * pu - (r === 4 ? 60 : 0), 320 + r * 16); ink(g, 1.8); }
    g.beginPath(); g.roundRect(352 + 200 * pu, 294, 18, 122, 9); fillWith(g, Cw(.8, pWood)); ink(g, 3);
    if (pu > .9) waxSeal(g, 520, 390, 22);
  }
}

// ---------- 21. the phone rings on "ring"; the queen screams on "scream" ----------
function r3bBlockPhone(g, P, t) {
  r3bPanel(g, P, 620, 100, 480);
  const pWood = P.lin(0, 7, { wob: .15 }), pGown = P.lin(80, 6, { wob: .15 }), pHair = P.lin(90, 4, {}), pFace = P.blk(120, 6, { jit: .2 }), pBrass = P.lin(90, 4, {}), pRay = P.ray(960, 240, 40, { jit: .3 });
  r3bGround(g, P, 480, .5);
  // on "scream": a burst behind the queen
  const sc = r3bE(t, r3bB.scream, .1);
  if (sc > 0) { g.beginPath(); g.rect(700, 20, 520, 460); fillWith(g, WC.RG(g, 960, 240, 10, 960, 240, 420, [[0, .98], [1, .3]], pRay)); }
  // the table and the candlestick phone: it hops on "phone" and shakes with ring cuts from "did" to "ring"
  g.beginPath(); g.rect(200, 380, 360, 20); fillWith(g, WC.LG(g, 0, 380, 0, 400, [[0, .88], [1, .3]], pWood)); ink(g, 4);
  for (const lx of [230, 520]) { g.beginPath(); g.rect(lx - 8, 400, 16, 200); fillWith(g, Cw(0)); }
  const rg = r3bAt(t, r3bB.did104) && t < r3bB.l105 ? 1 : 0;
  const shake = rg ? Math.sin(t * 90) * 6 : 0, hop = r3bPulse(t, r3bB.phone - r3bF, .3) * 24 + r3bPulse(t, r3bB.ring - r3bF, .3) * 30;
  g.save(); g.translate(380 + shake, 380 - hop); g.scale(1.35, 1.35);
  ell(g, 0, -6, 60, 14); fillWith(g, Cw(0));
  g.beginPath(); g.rect(-10, -190, 20, 180); fillWith(g, WC.LG(g, -10, 0, 10, 0, [[0, .2], [.5, .85], [1, .15]], pBrass)); ink(g, 3);
  g.beginPath(); g.moveTo(-30, -190); g.lineTo(30, -190); g.lineTo(20, -230); g.lineTo(-20, -230); g.closePath(); fillWith(g, WC.C(.3, pBrass)); ink(g, 3); // mouthpiece
  // the earpiece on its hook
  line(g, 10, -150, 50, -150); ink(g, 5); g.beginPath(); g.roundRect(44, -170, 22, 70, 9); fillWith(g, Cw(0)); line(g, 54, -100, 70, 0); ink(g, 3);
  g.restore();
  if (rg) { const k = .6 + .4 * Math.abs(Math.sin(t * 20)); r3bImpact(g, 380, 230 - hop, 150, 150 + 90 * k, 10, 6, k); }
  // the queen (right): turns to it on "wife", screams on "scream", her crown jumps
  r3bQueen(g, 960, 700, 1.3, { scream: sc, crownUp: r3bPulse(t, r3bB.scream - r3bF, .3) * 18, hop: r3bPulse(t, r3bB.scream - r3bF, .3) * 12 }, { gown: pGown, hair: pHair, face: pFace });
  if (sc > 0) for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(978, 700 - 278 * 1.3, 56 + i * 28, -.6, .6); ink(g, 4); g.beginPath(); g.arc(978, 700 - 278 * 1.3, 56 + i * 28, Math.PI - .6, Math.PI + .6); ink(g, 4); }
}

// ---------- 22. the cops jump; the legal teams march out of the gate; they go to work on the couple, who stand firm ----------
function r3bBlockTeams(g, P, t) {
  const nerve = r3bE(t, r3bB.nerve, .3);
  const pStone = P.lin(0, 8, { wob: .12 }), pRay = P.ray(1060, 300, 60, { jit: .35, wob: .2 });
  g.fillStyle = WC.LG(g, 0, 0, 0, 450, [[0, .7], [1, .4]], pStone); g.fillRect(0, 0, BW, 450);
  if (nerve > 0) { g.beginPath(); g.rect(900, 20, 340, 560); fillWith(g, WC.RG(g, 1060, 300, 10, 1060, 300, 140 + nerve * 400, [[0, .98], [1, .35]], pRay)); }
  const pGown = P.lin(90, 6.5, { wob: .12 }), pFace = P.blk(120, 6, { jit: .2 }), pWig = P.lin(0, 5, { wob: .2 }), pCoat = P.lin(90, 7, { wob: .12 }), pEdge = P.lin(0, 4, {}), pCop = P.lin(90, 5, { wob: .1 }), pDoor = P.lin(90, 9, { wob: .15 });
  r3bGround(g, P, 450, .5);
  // the castle gate (left back): opens on "legal"
  const gt = r3bE(t, r3bB.legal, .3);
  g.beginPath(); g.roundRect(80, 120, 300, 330, [150, 150, 0, 0]); fillWith(g, Cw(0)); ink(g, 5);
  for (const s of [-1, 1]) { const w = 150 * (1 - gt * .85); g.beginPath(); g.rect(s < 0 ? 80 : 380 - w, 200, w, 250); fillWith(g, WC.LG(g, 0, 200, 0, 450, [[0, .5], [1, .2]], pDoor)); ink(g, 3); }
  for (let x = 60; x < 420; x += 40) { if ((x / 40) % 2) { g.beginPath(); g.rect(x, 40, 40, 30); fillWith(g, Cw(0)); } }
  line(g, 60, 70, 400, 70); ink(g, 5);
  // the legal teams: march out in two rows from "teams" onward; on "work" they lean in at the couple
  const lean = r3bE(t, r3bB.work108, .3) * (1 - nerve * .6);
  const LAW = [[0, 0], [1, 0], [2, 0], [3, 0], [0, 1], [1, 1], [2, 1], [3, 1]];
  for (const back of [1, 0]) LAW.forEach(([c, b], i) => {
    if (b !== back) return;
    const a = r3bB.teams - r3bF + i * .12; if (t < a) return;
    const u = clamp((t - a) / .8), x = lerp(230, 430 + c * 110 + (b ? 40 : 0), u) + lean * 50, y = b ? 470 : 560;
    r3bLawyer(g, x, y - Math.abs(Math.sin((t - a) * 8)) * 5 * (1 - u), b ? .66 : .8, { lean, arm: lean }, { gown: pGown, face: pFace, wig: pWig });
  });
  // papers fly at the couple from "couple", and are pushed back on "nerve"
  if (r3bAt(t, r3bB.couple108)) for (let i = 0; i < 10; i++) {
    const d = t - r3bB.couple108 + r3bF - i * .07; if (d < 0) continue;
    const u = clamp(d / .6), push = nerve * (1 + i * .1);
    const x = lerp(820, 980 + (i % 3) * 30, u) - push * 260, y = lerp(250, 300 + (i % 4) * 50, u) - Math.sin(u * Math.PI) * 60 - push * 120;
    eFlyingSheet(g, x, y, 40, 52, d * 4 + i, Math.cos(d * 7 + i));
  }
  // the couple (right): on "nerve" they stand tall, leaflets up
  r3bPerson(g, 1000, 640, 1.0, { woman: true, arm: .1 + nerve * .85, leaf: true }, { coat: pCoat, face: pFace, legs: pEdge });
  r3bPerson(g, 1140, 640, 1.04, { arm2: .1 + nerve * .85, leaf2: true }, { coat: pCoat, face: pFace, legs: pEdge });
  // the constables (front left): they jump on "jump"
  const jp = r3bPulse(t, r3bB.jump - r3bF, .4) * 70;
  [[120, 0], [260, 1], [400, 2]].forEach(([x, i]) => { const a = r3bB.cops106 - r3bF + i * .04; if (t < a) return; r3bCop(g, x, 680, .96, { hop: jp * (1 - i * .1), arm: jp > 10 ? .7 : .1, arm2: jp > 10 ? .7 : .1 }, { coat: pCop, face: pFace, legs: pEdge }); });
}

// ---------- 23. do the libel laws serve the King: the scale tips, the book opens, then bows to him ----------
function r3bBlockLawBook(g, P, t) {
  const pRay = P.ray(1000, 200, 70, { jit: .35, wob: .2 });
  const kingLit = r3bE(t, r3bB.king110, .3);
  g.fillStyle = WC.RG(g, 1000, 200, 10, 1000, 200, 500 + kingLit * 500, [[0, .95], [.5, .5], [1, .12]], pRay); g.fillRect(0, 0, BW, BH);
  const pWood = P.lin(0, 7, { wob: .15 }), pBrass = P.lin(90, 4, {}), pLeather = P.lin(45, 5, { wob: .1 }), pPage = P.lin(0, 4, {});
  r3bGround(g, P, 480, .45);
  // the balance (left): tips on "unfair"
  const tilt = r3bE(t, r3bB.unfair, .35) * .32;
  line(g, 180, 470, 180, 150); ink(g, 10); g.beginPath(); g.rect(130, 460, 100, 20); fillWith(g, Cw(0));
  g.save(); g.translate(180, 150); g.rotate(tilt);
  line(g, -140, 0, 140, 0); ink(g, 9); ell(g, 0, 0, 12, 12); fillWith(g, Cw(1)); ink(g, 3);
  for (const s of [-1, 1]) {
    g.save(); g.translate(s * 136, 0); g.rotate(-tilt);
    line(g, 0, 0, -44, 120); ink(g, 2); line(g, 0, 0, 44, 120); ink(g, 2);
    g.beginPath(); g.ellipse(0, 122, 56, 14, 0, 0, Math.PI); fillWith(g, WC.C(.6, pBrass)); ink(g, 3);
    if (s > 0) { drawStackCoin(g, 0, 104, 20, 6, 8, pBrass, false); drawStackCoin(g, 0, 94, 20, 6, 8, pBrass, true); coinCrown(g, 0, 70, 14, 12); }
    else r3bSheet(g, 0, 102, 34, 42, 0);
    g.restore();
  }
  g.restore();
  // the lectern and the great book: opens on "libel", pages fan on "laws", bows to the King on "serve"
  const op = r3bE(t, r3bB.libel, .3), fan = r3bE(t, r3bB.laws, .35), bow = r3bE(t, r3bB.serve, .3);
  // the lectern: a post on a foot, a slanted desk on top
  g.beginPath(); g.moveTo(570, 420); g.lineTo(670, 420); g.lineTo(650, 570); g.lineTo(590, 570); g.closePath(); fillWith(g, WC.LG(g, 570, 0, 670, 0, [[0, .2], [.5, .7], [1, .15]], pWood)); ink(g, 4);
  for (const y of [450, 500]) { line(g, 580, y, 660, y); cutl(g, 2.5); }
  g.beginPath(); g.moveTo(520, 590); g.lineTo(720, 590); g.lineTo(680, 560); g.lineTo(560, 560); g.closePath(); fillWith(g, WC.C(.3, pWood)); ink(g, 4);
  pth(g, [[440, 420], [800, 420], [770, 380], [470, 380]]); fillWith(g, WC.LG(g, 0, 380, 0, 420, [[0, .8], [1, .25]], pWood)); ink(g, 4);
  // the great book on it: bound shut with the crown on its cover; opens on "libel"; leaves fan up on "laws,";
  // on "serve" the whole book bows over toward the King
  g.save(); g.translate(620, 384); g.rotate(bow * .32);
  if (op < .5) {
    g.beginPath(); g.rect(-170, -150, 340, 150); fillWith(g, WC.LG(g, -170, 0, 170, 0, [[0, .12], [.5, .38], [1, .1]], pLeather)); ink(g, 5);
    g.beginPath(); g.rect(-150, -134, 300, 118); cutl(g, 3);
    g.beginPath(); g.rect(-170, -8, 340, 8); fillWith(g, Cw(1)); ink(g, 2);
    coinCrown(g, 0, -76, 46, 36);
  } else {
    for (const s of [-1, 1]) { // two pages, curving up from the spine
      g.beginPath(); g.moveTo(0, -6); g.quadraticCurveTo(s * 90, -40, s * 190, -24); g.lineTo(s * 190, -168); g.quadraticCurveTo(s * 90, -184, 0, -150); g.closePath();
      fillWith(g, WC.C(.97, pPage)); ink(g, 4);
      for (let r = 0; r < 7; r++) { g.beginPath(); g.moveTo(s * 18, -140 + r * 18); g.quadraticCurveTo(s * 90, -168 + r * 19, s * 172, -154 + r * 18); ink(g, 1.8); }
      g.beginPath(); g.moveTo(s * 196, -22); g.lineTo(s * 196, -172); ink(g, 4);
    }
    line(g, 0, -150, 0, -4); ink(g, 4);
    if (fan > 0 && fan < 1) for (let i = 0; i < 5; i++) { // leaves turning over the spine
      const u = clamp(fan * 1.4 - i * .1), sx = Math.cos(u * Math.PI);
      g.beginPath(); g.moveTo(0, -6); g.quadraticCurveTo(sx * 90, -40 - (1 - Math.abs(sx)) * 50, sx * 186, -26 - (1 - Math.abs(sx)) * 80); g.lineTo(sx * 186, -170 - (1 - Math.abs(sx)) * 80); g.quadraticCurveTo(sx * 90, -184 - (1 - Math.abs(sx)) * 50, 0, -150); g.closePath();
      fillWith(g, Cw(1)); ink(g, 2.5);
    }
    // the red ribbon bookmark hanging from the spine
    g.beginPath(); g.moveTo(-60, -10); g.lineTo(-48, -10); g.lineTo(-40, 60); g.lineTo(-50, 50); g.lineTo(-60, 62); g.closePath(); fillWith(g, Cw(1, 0, 1)); ink(g, 2);
  }
  g.restore();
  // the King on his throne (right): rays on "King"
  const pThrone = P.lin(90, 6, { wob: .1 });
  g.beginPath(); g.roundRect(890, 120, 220, 380, [110, 110, 0, 0]); fillWith(g, WC.LG(g, 890, 0, 1110, 0, [[0, .2], [.5, .55], [1, .12]], pThrone)); ink(g, 5);
  eCrownRoundel(g, 1000, 190, 44, pRay);
  r3bKing(g, P, 1000, 470, 1.05, { hands: 'belly', smile: r3bAt(t, r3bB.serve), crownUp: r3bPulse(t, r3bB.king110 - r3bF, .3) * 18 });
}

const r3bBLOCKS = [r3bBlockPolicy, r3bBlockNight, r3bBlockWomen, r3bBlockTrain, r3bBlockToilets, r3bBlockClock, r3bBlockUnion, r3bBlockFire, r3bBlockLong, r3bBlockLadder,
  r3bBlockFarms, r3bBlockInside, r3bBlockConveyor, r3bBlockStreet, r3bBlockSpyglass, r3bBlockMeeting, r3bBlockWeather, r3bBlockHandout, r3bBlockParents, r3bBlockTuesday,
  r3bBlockPatent, r3bBlockPhone, r3bBlockTeams, r3bBlockLawBook];
