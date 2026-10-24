// The eight woodblocks of the last chapter. Each is drawFn(g, P, t): paints the tone map for song time t.
// Times come from BE (end-timing.js), read off the word onsets in lines.json.
const FE = 1 / 24;

// ---- shared backgrounds (copies of the stanza-1 helpers under new names) ----
function eGlow(g, P, cx, cy, r, t0 = .93, t1 = .1, sp = 10, ang = 0) {
  const id = P.lin(ang, sp, { wob: .16, jit: .3 });
  g.fillStyle = WC.RG(g, cx, cy, 10, cx, cy, r, [[0, t0], [.55, (t0 + t1) / 2], [1, t1]], id); g.fillRect(0, 0, BW, BH);
}
function eRays(g, P, cx, cy, n, r = 820, t0 = .95, t1 = .05) {
  const id = P.ray(cx, cy, n, { jit: .35, wob: .2 });
  g.fillStyle = WC.RG(g, cx, cy, 20, cx, cy, r, [[0, t0], [.4, .55], [1, t1]], id); g.fillRect(0, 0, BW, BH);
}
function eGround(g, P, y0, tone = .5) {
  const id = P.dash(0, 9, 70, .8, { jit: .35 });
  g.fillStyle = WC.LG(g, 0, y0, 0, BH, [[0, tone + .2], [1, tone - .25]], id); g.fillRect(0, y0, BW, BH - y0);
  line(g, 0, y0, BW, y0); ink(g, 5);
}
const pulse = (t, a, len = .3) => { const d = t - a; return d < 0 || d > len ? 0 : Math.sin(d / len * Math.PI); };
const pop = (t, a, len = .18) => clamp(easeOutBack(clamp((t - a) / len), 2.2), 0, 1.25);
// a wall of panelling (vertical gouges), lit from (cx, cy)
function ePanelWall(g, P, cx, cy, y1 = BH) {
  const id = P.lin(90, 11, { wob: .22, jit: .3 });
  g.fillStyle = WC.RG(g, cx, cy, 10, cx, cy, 900, [[0, .9], [.5, .5], [1, .16]], id); g.fillRect(0, 0, BW, y1);
  for (let x = 40; x < BW; x += 160) { g.beginPath(); g.rect(x, 40, 120, y1 - 80); cutl(g, 2.4); g.beginPath(); g.rect(x + 8, 48, 104, y1 - 96); ink(g, 2); }
  return id;
}

// ---------- 0. the court: the long case, no jury, no legal aid ----------
const LEAVES = 14;
function eBlockCourt(g, P, t) {
  const pWall = ePanelWall(g, P, 620, 60, 480);
  const pWood = P.lin(0, 7, { wob: .15 });
  const pRay = P.ray(620, 74, 48, { jit: .3 });
  const pGown = P.lin(90, 7, { wob: .12 }), pFace = P.blk(120, 6, { jit: .2 }), pWig = P.lin(0, 5, { wob: .2 });
  const pRobe = P.lin(80, 7, { wob: .15 });
  const pEdge = P.lin(0, 4, { wob: .05 });
  eGround(g, P, 480, .5);
  // the crown above the bench, and the bench with the judge
  eCrownRoundel(g, 620, 76, 52, pRay);
  eJudge(g, 620, 214, .42, { look: lerp(0, .8, ease(t, BE.legal, BE.legal + .3)), robe: 1 }, { robe: pRobe, face: pFace, wig: pWig });
  g.beginPath(); g.rect(380, 214, 480, 108); fillWith(g, WC.LG(g, 0, 214, 0, 322, [[0, .78], [1, .22]], pWood)); ink(g, 4);
  for (let x = 400; x < 850; x += 92) { g.beginPath(); g.rect(x, 232, 74, 72); cutl(g, 2.5); }
  line(g, 380, 218, 860, 218); cutl(g, 3);
  // the calendar on the wall (left): its leaves tear off one after another through the longest case
  const dur = BE.made + .3 - BE.l111;
  const cx = 190, cy = 150;
  g.beginPath(); g.rect(cx - 74, cy - 92, 148, 184); fillWith(g, Cw(1)); ink(g, 4);
  g.beginPath(); g.rect(cx - 74, cy - 92, 148, 36); fillWith(g, Cw(0));
  for (const s of [-1, 1]) { ell(g, cx + s * 40, cy - 92, 7, 7); fillWith(g, Cw(1)); ink(g, 2.5); }
  for (let r = 0; r < 5; r++) for (let c = 0; c < 6; c++) { g.beginPath(); g.rect(cx - 64 + c * 21.5, cy - 44 + r * 25, 15, 17); ink(g, 1.6); }
  for (let i = 0; i < LEAVES; i++) { // each torn leaf flutters away and off the block
    const ti = BE.l111 + (i + .5) * dur / LEAVES, d = t - ti; if (d < 0 || d > 1.2) continue;
    const x = cx + d * 520 + Math.sin(d * 7 + i) * 30, y = cy - 40 + d * 260 - 180 * Math.sin(Math.min(d, .6) / .6 * Math.PI) * .5;
    eFlyingSheet(g, x, y, 80, 100, d * 5 + i, Math.cos(d * 9 + i), false);
  }
  // the clock (right): its hands race while the case runs on
  const spin = clamp(t - BE.l111, 0, dur) * 14 + Math.max(0, t - BE.l111 - dur) * .5;
  const kx = 1060, ky = 120;
  ell(g, kx, ky, 62, 62); fillWith(g, Cw(0)); ell(g, kx, ky, 50, 50); fillWith(g, Cw(1)); ink(g, 2);
  for (let h = 0; h < 12; h++) { const a = h / 12 * TAU; line(g, kx + Math.cos(a) * 40, ky + Math.sin(a) * 40, kx + Math.cos(a) * 47, ky + Math.sin(a) * 47); ink(g, h % 3 ? 2 : 4); }
  line(g, kx, ky, kx + Math.cos(spin / 12 - 1.4) * 26, ky + Math.sin(spin / 12 - 1.4) * 26); ink(g, 6);
  line(g, kx, ky, kx + Math.cos(spin - 1.57) * 40, ky + Math.sin(spin - 1.57) * 40); ink(g, 3.5);
  ell(g, kx, ky, 5, 5); fillWith(g, Cw(0));
  // the jury box (left): two rows of empty chairs behind a rail. On "jury" a shaft of light falls on it.
  const lit = ease(t, BE.jury - FE, BE.jury + .2);
  if (lit > 0) { const w = lerp(10, 120, lit); g.beginPath(); g.moveTo(80 - w / 2, 230); g.lineTo(80 + w / 2, 230); g.lineTo(80 + w * 2.4, 470); g.lineTo(80 - w * .4, 470); g.closePath(); fillWith(g, WC.C(.93, pRay)); }
  for (let r = 0; r < 2; r++) for (let c = 0; c < 6; c++) { // tall-backed empty chairs: a frame, three slats, a seat
    const x = 46 + c * 54 + r * 20, y = 316 + r * 46, w = 42, h = 92;
    g.beginPath(); g.moveTo(x, y + h); g.lineTo(x, y + 10); g.quadraticCurveTo(x + w / 2, y - 8, x + w, y + 10); g.lineTo(x + w, y + h); g.closePath(); fillWith(g, Cw(0));
    for (let k = 0; k < 3; k++) { const sx = x + 9 + k * 12; line(g, sx, y + 14, sx, y + h - 34); cutl(g, 4); }
    g.beginPath(); g.rect(x - 4, y + h - 30, w + 8, 10); fillWith(g, Cw(1)); ink(g, 2.5);
  }
  g.beginPath(); g.rect(30, 420, 340, 70); fillWith(g, WC.LG(g, 0, 420, 0, 490, [[0, .8], [1, .3]], pWood)); ink(g, 4);
  for (let x = 46; x < 360; x += 26) { line(g, x, 432, x, 482); ink(g, 4); }
  line(g, 30, 426, 370, 426); cutl(g, 3);
  // the couple at their own table (right), alone; their papers pile up through the case
  const shrug = pulse(t, BE.legal - .05, .55) + pulse(t, BE.aid - .05, .5);
  const pats = { coat: pGown, face: pFace, legs: pEdge };
  ePerson(g, 960, 640, 1.0, { woman: true, arm: .3 * shrug, arm2: .3 * shrug }, pats);
  ePerson(g, 1090, 640, 1.04, { arm: .32 * shrug, arm2: .32 * shrug }, pats);
  g.beginPath(); g.rect(800, 500, 430, 22); fillWith(g, WC.LG(g, 0, 500, 0, 522, [[0, .85], [1, .3]], pWood)); ink(g, 4);
  g.beginPath(); g.rect(816, 522, 398, 70); fillWith(g, WC.LG(g, 816, 0, 1214, 0, [[0, .2], [.5, .55], [1, .12]], pWood)); ink(g, 4);
  const pile = ease(t, BE.l111, BE.made + .3);
  ePaperStack(g, 862, 500, 76, 16 + pile * 150, pEdge);
  ePaperStack(g, 1172, 500, 76, 12 + pile * 190, pEdge);
  ePaperStack(g, 1026, 500, 56, 4 + ease(t, BE.l111 + 1, BE.made + .3) * 36, pEdge);
}

// ---------- 1. the king's side: his money, his lawyers ----------
const SPILL = (() => { const L = [], R = mulberry(4040); for (let i = 0; i < 26; i++) L.push({ vx: 150 + R() * 520, vy: -260 - R() * 380, r: 13 + R() * 8, spin: R() * 9, dl: R() * .5, sx: 160 + R() * 120 }); return L; })();
const LAWYERS = [[470, 0], [575, 0], [680, 0], [785, 0], [890, 0], [525, 1], [630, 1], [735, 1], [840, 1]]; // [feet x, back row]
function eBlockKingSide(g, P, t) {
  eRays(g, P, 230, 230, 84, 1100, .97, .12);
  eGround(g, P, 530, .5);
  const pSack = P.rad(170, 470, 7, { wob: .1 }), pEdge = P.lin(90, 4, {});
  const pGown = P.lin(90, 6.5, { wob: .12 }), pFace = P.blk(120, 6, { jit: .2 }), pWig = P.lin(0, 5, { wob: .2 });
  const lp = { gown: pGown, face: pFace, wig: pWig };
  // sacks pile behind the king on "billions"
  const more = ease(t, BE.billions - FE, BE.billions + .25);
  if (more > 0) for (const [x, y, w] of [[70, 500, 190], [380, 500, 190], [225, 400, 170]]) { g.save(); g.translate(x, y); g.scale(more, more); drawSack(g, P, 0, 0, w, w * .95, pSack, false); g.restore(); }
  drawSack(g, P, 110, 600, 240, 210, pSack, t >= BE.dollars - FE);
  drawSack(g, P, 340, 600, 240, 210, pSack, t >= BE.dollars - FE);
  // the king on his money: the crown hops on "king", he smiles on "crush"
  drawKing(g, P, 225, 430, .9, { hands: 'knees', smile: t >= BE.crush - FE, crownUp: pulse(t, BE.king - .02, .3) * 14 });
  // the coins spill out on "dollars"
  for (const c of SPILL) {
    const d = t - BE.dollars + FE - c.dl; if (d < 0) continue;
    let x = c.sx + c.vx * d, y = 470 + c.vy * d + 1100 * d * d;
    if (y > 570) { y = 570 + (c.r % 3) * 6; x = c.sx + c.vx * (d < 1.4 ? d : 1.4); }
    if (x < 440) drawCoin(g, x, y, c.r, c.spin + d * 14 * (y < 570 ? 1 : 0), pEdge);
  }
  // the lawyers: four arrive on the line, more on "30", the rest on "billions"; on "crush" they lean in
  const lean = ease(t, BE.crush - .1, BE.crush + .25), adv = lean * 50;
  const arrive = [0, 2, 4, 6, 1, 3, 5, 7, 8].map((li, k) => [li, k < 3 ? BE.l113 - .25 + k * .12 : k < 6 ? BE.n30 - FE + (k - 3) * .06 : BE.billions - FE + (k - 6) * .06]);
  for (const back of [1, 0]) for (const [li, ta] of arrive) {
    const [x, b] = LAWYERS[li]; if (b !== back || t < ta) continue;
    const u = pop(t, ta, .2), bob = Math.abs(Math.sin((t - ta) * 5 + li)) * 5 * (1 - lean);
    const y = (back ? 520 : 600) + (1 - Math.min(1, u)) * 140 - bob;
    eLawyer(g, x + adv * (back ? .6 : 1), y, back ? .78 : .95, { lean, arm: lean * (li % 2 ? 1 : .6) }, lp);
  }
  // the couple at the right; on "crush" a great bundle of the king's papers comes down over them,
  // on "defend" they hold up their leaflets and it stops
  const def = ease(t, BE.defend - FE, BE.defend + .2);
  const pats = { coat: pGown, face: pFace, legs: pEdge };
  ePerson(g, 1070, 600, .92, { woman: true, arm: .1 + def * .9, leaf: true }, pats);
  ePerson(g, 1170, 600, .95, { arm2: .1 + def * .9, leaf2: true }, pats);
  const drop = ease(t, BE.crush - FE, BE.crush + .35) * (1 - .14 * def);
  if (drop > 0) {
    const by = lerp(-10, 250, drop) - def * 20, x0 = 990, x1 = 1235;
    for (let i = 0; i < 9; i++) { const y = by - i * 26; g.beginPath(); g.rect(x0 + (i % 2) * 8, y - 26, x1 - x0 - 8, 26); fillWith(g, WC.C(.88, pEdge)); ink(g, 2.5); for (let r = 1; r < 4; r++) { line(g, x0 + 10, y - r * 6.5, x1 - 14, y - r * 6.5); ink(g, 1.2); } }
    g.beginPath(); g.rect((x0 + x1) / 2 - 14, by - 240, 28, 240); fillWith(g, Cw(0));
    g.beginPath(); g.rect(x0 - 4, by - 130, x1 - x0 + 8, 24); fillWith(g, Cw(0));
    line(g, x0, by + 2, x1, by + 2); ink(g, 5);
  }
}

// ---------- 2. speaking out: the couple speak to TV, newsprint and the crowds ----------
function eTalk(t) { let v = 0; for (const w of BE.speakWords) { const d = t - w; if (d >= -.03 && d < .35) v = Math.max(v, Math.sin(clamp((d + .03) / .33) * Math.PI)); } return v; }
function eBlockSpeak(g, P, t) {
  eRays(g, P, 700, 240, 80, 900, .96, .1);
  eGround(g, P, 540, .5);
  const pGown = P.lin(90, 7, { wob: .12 }), pFace = P.blk(120, 6, { jit: .2 }), pEdge = P.lin(0, 4, {});
  const pWood = P.lin(0, 7, { wob: .15 }), pBox = P.lin(90, 6, { wob: .1 });
  const pats = { coat: pGown, face: pFace, legs: pEdge };
  const talk = t < BE.l116 ? eTalk(t) : 0;
  // the crowds on the wires (top band): heads joined by threads, spreading left to right from "internet"
  const net = ease(t, BE.internet - FE, BE.crowds + .3);
  if (net > 0) {
    const R = mulberry(77), nodes = [];
    for (let i = 0; i < 26; i++) nodes.push([40 + R() * 1160, 34 + R() * 150]);
    nodes.sort((a, b) => a[0] - b[0]);
    const vis = Math.max(1, Math.round(net * nodes.length));
    for (let i = 0; i < vis; i++) for (let j = i + 1; j < vis; j++) { const dx = nodes[j][0] - nodes[i][0], dy = nodes[j][1] - nodes[i][1]; if (dx * dx + dy * dy < 200 * 200) { line(g, nodes[i][0], nodes[i][1], nodes[j][0], nodes[j][1]); ink(g, 2.2); } }
    for (let i = 0; i < vis; i++) { const [x, y] = nodes[i]; ell(g, x, y + 22, 22, 12); fillWith(g, Cw(0)); ell(g, x, y, 14, 16); fillWith(g, Cw(1)); ink(g, 2.4); ell(g, x - 5, y - 1, 2, 2.4); fillWith(g, Cw(0)); ell(g, x + 5, y - 1, 2, 2.4); fillWith(g, Cw(0)); }
  }
  // the TV (left) on "TV": a cabinet set, the woman small on its screen
  const tv = pop(t, BE.tv - FE);
  if (tv > 0) {
    g.save(); g.translate(170, 540); g.scale(tv, tv);
    for (const s of [-1, 1]) { line(g, s * 70, -10, s * 84, 0); ink(g, 6); }
    g.beginPath(); g.rect(-120, -230, 240, 220); fillWith(g, WC.LG(g, -120, 0, 120, 0, [[0, .2], [.5, .6], [1, .15]], pWood)); ink(g, 4);
    g.beginPath(); g.roundRect(-100, -212, 160, 140, 26); fillWith(g, Cw(0));
    g.beginPath(); g.roundRect(-92, -204, 144, 124, 22); fillWith(g, WC.RG(g, -20, -142, 4, -20, -142, 110, [[0, .98], [1, .55]], pBox)); ink(g, 2);
    ePerson(g, -20, -84, .42, { woman: true, speak: 1 }, pats);
    for (let k = 0; k < 3; k++) { ell(g, 88, -190 + k * 34, 11, 11); fillWith(g, Cw(1)); ink(g, 2.5); }
    for (let k = 0; k < 4; k++) { line(g, 72, -70 + k * 12, 104, -70 + k * 12); ink(g, 2.4); }
    line(g, -20, -230, -70, -300); ink(g, 3); line(g, 0, -230, 40, -306); ink(g, 3);
    g.restore();
  }
  // the newsprint (right) on "newsprint": a broadsheet with a cut of the couple and its columns of type
  const nw = pop(t, BE.news - FE);
  if (nw > 0) {
    g.save(); g.translate(1050, 400); g.scale(nw, nw); g.rotate(.06);
    g.beginPath(); g.rect(-130, -170, 260, 330); fillWith(g, Cw(1)); ink(g, 3.5);
    g.beginPath(); g.rect(-114, -154, 228, 38); fillWith(g, Cw(0)); line(g, -100, -135, 100, -135); cutl(g, 4);
    g.beginPath(); g.rect(-114, -104, 120, 110); fillWith(g, WC.C(.85, pBox)); ink(g, 2);
    ePerson(g, -76, 2, .36, { leaf: true, arm: .9 }, pats); ePerson(g, -26, 2, .34, { woman: true }, pats);
    for (let r = 0; r < 14; r++) { line(g, 16, -100 + r * 8, 114 - (r % 5 === 4 ? 40 : 0), -100 + r * 8); ink(g, 2); }
    for (let c = 0; c < 3; c++) for (let r = 0; r < 16; r++) { line(g, -114 + c * 78, 20 + r * 8.4, -114 + c * 78 + 68 - (r % 6 === 5 ? 26 : 0), 20 + r * 8.4); ink(g, 2); }
    g.restore();
  }
  // the soapbox crate and the couple on it: the man holds the leaflets up, the woman speaks through a trumpet
  g.beginPath(); g.rect(500, 470, 260, 96); fillWith(g, WC.LG(g, 0, 470, 0, 566, [[0, .85], [1, .3]], pWood)); ink(g, 4);
  for (const yy of [500, 532]) { line(g, 500, yy, 760, yy); ink(g, 3); }
  line(g, 504, 476, 756, 562); ink(g, 3); line(g, 504, 476, 756, 476); cutl(g, 2.5);
  ePerson(g, 560, 472, .9, { arm2: .92, leaf2: true, arm: .15 }, pats);
  ePerson(g, 680, 472, .9, { woman: true, arm: .5, speak: .2 + talk * .8 }, pats);
  // the speaking trumpet: a cone from her mouth out to the right, sound cut out of it on every sung word
  const mx = 686, my = 472 - 220 * .9;
  g.beginPath(); g.moveTo(mx, my - 6); g.lineTo(mx + 120, my - 40 - talk * 6); g.lineTo(mx + 120, my + 40 + talk * 6); g.lineTo(mx, my + 6); g.closePath();
  fillWith(g, WC.LG(g, 0, my - 40, 0, my + 40, [[0, .9], [.5, .55], [1, .15]], pBox)); ink(g, 3.5);
  g.beginPath(); g.ellipse(mx + 120, my, 10, 40 + talk * 6, 0, 0, TAU); fillWith(g, Cw(0)); ink(g, 3);
  if (talk > .08) for (let i = 0; i < 5; i++) { const a = -.5 + i * .25, r0 = 30, r1 = 70 + talk * 90; gouge(g, mx + 126 + Math.cos(a) * r0, my + Math.sin(a) * r0 * 1.6, mx + 126 + Math.cos(a) * r1, my + Math.sin(a) * r1 * 1.6, 7 * talk, 1); }
}

// ---------- 3. the judge, close: he wakes, he agrees with the couple ----------
function eBlockJudge(g, P, t) {
  const pRay = P.ray(620, 250, 72, { jit: .3, wob: .2 });
  g.fillStyle = WC.RG(g, 620, 250, 20, 620, 250, 760, [[0, .95], [.5, .5], [1, .12]], pRay); g.fillRect(0, 0, BW, BH);
  const pCur = P.lin(90, 11, { wob: .25, jit: .3 });
  for (const s of [-1, 1]) { // heavy drapes either side
    const x0 = s < 0 ? 0 : BW - 230;
    const st = []; for (let k = 0; k <= 6; k++) st.push([k / 6, k % 2 ? .6 : .12]);
    g.beginPath(); g.rect(x0, 0, 230, BH); fillWith(g, WC.LG(g, x0, 0, x0 + 230, 0, st, pCur)); ink(g, 4);
  }
  const pRobe = P.lin(80, 7, { wob: .15 }), pFace = P.blk(118, 6.5, { jit: .2 }), pWig = P.lin(0, 5.5, { wob: .2 }), pWood = P.lin(0, 7, { wob: .15 });
  // pose from the sung words: head down, wakes on "judge", looks down on "end", nods on "agreed",
  // looks to the couple (off to the left) on "couple"
  const wake = ease(t, BE.judge - FE, BE.judge + .2);
  const nodA = pulse(t, BE.agreed - FE, .32) + pulse(t, BE.agreed + .32, .32);
  const nod = (1 - wake) * .9 + ease(t, BE.end - .05, BE.end + .25) * .35 * (1 - ease(t, BE.agreed - .2, BE.agreed)) + nodA * .55;
  const look = -ease(t, BE.couple - FE, BE.couple + .25) * (1 - ease(t, BE.trial, BE.trial + .3) * .5);
  eJudge(g, 620, 470, 1.05, { nod, look, eyes: wake > .5 ? 1 : 0 }, { robe: pRobe, face: pFace, wig: pWig });
  // the bench front, the crown on it
  g.beginPath(); g.rect(0, 470, BW, 120); fillWith(g, WC.LG(g, 0, 470, 0, 590, [[0, .82], [1, .2]], pWood)); ink(g, 5);
  for (let x = 40; x < BW; x += 200) { g.beginPath(); g.rect(x, 492, 160, 80); cutl(g, 2.5); }
  line(g, 0, 476, BW, 476); cutl(g, 3);
  eCrownRoundel(g, 620, 530, 46, pRay);
}

// ---------- 4. five views: greed, workers, wealth, torture, health, a roundel each, printed on the noun ----------
const VIEW_X = [130, 375, 620, 865, 1110], VIEW_Y = [330, 205, 144, 205, 330], VIEW_R = 104;
function eBlockViews(g, P, t) {
  // the couple hold up their leaflet; each of its claims prints in a roundel above on the line's noun,
  // with a ray of cuts from the leaflet to it
  const pRay = P.ray(620, 320, 90, { jit: .35, wob: .2 });
  g.fillStyle = WC.RG(g, 620, 320, 20, 620, 320, 900, [[0, .97], [.45, .55], [1, .12]], pRay); g.fillRect(0, 0, BW, BH);
  const pIn = P.lin(0, 8, { wob: .14, jit: .3 });
  const pCoat = P.lin(90, 7, { wob: .12 }), pFace = P.blk(120, 6, { jit: .2 }), pEdge = P.lin(90, 4, {});
  const pMill = P.lin(90, 4.2, { wob: .05 }), pSack = P.rad(130, 330, 6, { wob: .1 }), pFeather = P.dash(30, 6, 14, .7, { jit: .3 });
  eGround(g, P, 540, .45);
  const pats = { coat: pCoat, face: pFace, legs: pEdge };
  ePerson(g, 528, 640, .95, { woman: true, arm: .96 }, pats);
  ePerson(g, 712, 640, .98, { arm2: .96 }, pats);
  // the leaflet they hold up between them, above their heads
  g.beginPath(); g.rect(562, 250, 116, 140); fillWith(g, Cw(1)); ink(g, 3.5);
  g.beginPath(); g.rect(574, 262, 92, 26); fillWith(g, Cw(0));
  for (let r = 0; r < 8; r++) { line(g, 574, 302 + r * 10.5, 666 - (r % 4 === 3 ? 30 : 0), 302 + r * 10.5); ink(g, 2); }
  for (let i = 0; i < 5; i++) {
    const v = BE.views[i], x = VIEW_X[i], y = VIEW_Y[i];
    const on = t >= v.s - FE, pic = t >= v.noun - FE;
    const cur = on && (i === 4 || t < BE.views[i + 1].s - FE);
    if (!on) continue;
    // the ray from the leaflet to the roundel
    const dx = x - 620, dy = y - 270, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
    gouge(g, 620 + ux * 70, 270 + uy * 70, x - ux * (VIEW_R + 14), y - uy * (VIEW_R + 14), cur ? 7 : 4, 1);
    const k = pic ? 1 + .07 * Math.max(0, 1 - (t - v.noun + FE) * 8) : lerp(.6, 1, ease(t, v.s - FE, v.s + .15));
    g.save(); g.translate(x, y); g.scale(k, k); g.translate(-x, -y);
    ell(g, x, y, VIEW_R + 10, VIEW_R + 10); fillWith(g, Cw(0));
    ell(g, x, y, VIEW_R, VIEW_R);
    fillWith(g, cur ? WC.RG(g, x, y - 20, 6, x, y - 20, VIEW_R * 1.3, [[0, .98], [1, .5]], pIn) : WC.C(.9, pIn)); ink(g, 3);
    g.save(); ell(g, x, y, VIEW_R - 2, VIEW_R - 2); g.clip();
    if (pic) [vGreed, vWorkers, vWealth, vTorture, vHealth][i](g, x, y, t - v.noun, { pCoat, pFace, pEdge, pMill, pSack, pFeather });
    g.restore();
    ell(g, x, y, VIEW_R + 5, VIEW_R + 5); cutl(g, 2.2);
    g.restore();
  }
}
function vGreed(g, x, y, d, p) { // a big hand comes down and closes on a heap of coin
  const heap = [[-60, 70], [-20, 78], [20, 74], [60, 70], [-40, 46], [0, 50], [40, 46], [-18, 24], [22, 22]];
  heap.forEach(([dx, dy], i) => drawCoin(g, x + dx, y + dy, 22, 0, p.pEdge));
  const grab = ease(d, 0, .22), hy = y - 120 + grab * 110;
  g.save(); g.translate(x + 6, hy);
  pth(g, [[-34, -150], [34, -150], [30, -36], [-30, -36]]); fillWith(g, WC.C(.12, p.pCoat)); ink(g, 3); // sleeve
  g.beginPath(); g.rect(-36, -44, 72, 14); fillWith(g, Cw(1)); ink(g, 2.5);                            // cuff
  g.beginPath(); g.moveTo(-40, -30); g.quadraticCurveTo(-50, 20, -30, 44); g.lineTo(34, 44); g.quadraticCurveTo(52, 20, 40, -30); g.closePath();
  fillWith(g, Cw(1)); ink(g, 4);                                                                         // the hand, curled
  for (let f = 0; f < 4; f++) { g.beginPath(); g.moveTo(-26 + f * 18, 44); g.lineTo(-26 + f * 18, 20 - grab * 6); ink(g, 2.6); }
  g.beginPath(); g.moveTo(-40, -6); g.quadraticCurveTo(-56, 10, -38, 24); ink(g, 3);                     // thumb
  g.restore();
  if (grab > .9) for (let i = 0; i < 3; i++) drawCoin(g, x - 44 + i * 44, hy + 50 + (i % 2) * 6, 13, 1.3 + i * .8, p.pEdge); // squeezed out
}
function vWorkers(g, x, y, d, p) { // a worker at the grill: paper cap, spatula, steam
  ePerson(g, x - 10, y + 160, .78, { woman: true, arm: .35 + .15 * Math.sin(d * 9) }, { coat: p.pCoat, face: p.pFace, legs: p.pEdge });
  g.beginPath(); g.moveTo(x - 32, y - 44); g.lineTo(x + 12, y - 44); g.lineTo(x + 4, y - 66); g.lineTo(x - 26, y - 66); g.closePath(); fillWith(g, Cw(1)); ink(g, 2.5); // paper cap
  g.beginPath(); g.rect(x - 110, y + 40, 220, 80); fillWith(g, Cw(0));
  for (let i = 0; i < 7; i++) { line(g, x - 100 + i * 32, y + 48, x - 100 + i * 32, y + 70); cutl(g, 4); }
  for (let i = 0; i < 4; i++) { const sx = x - 70 + i * 44, ph = (d * 1.5 + i * .3) % 1; g.beginPath(); g.moveTo(sx, y + 36); g.bezierCurveTo(sx - 12, y + 10 - ph * 20, sx + 12, y - 4 - ph * 20, sx, y - 30 - ph * 20); ink(g, 3); }
}
function vWealth(g, x, y, d, p) { // a pillar of coin with the crown on it
  for (let i = 0; i < 9; i++) drawStackCoin(g, x, y + 80 - i * 15, 46, 12, 15, p.pMill, i === 8);
  const w = 34, cy = y - 58 - Math.max(0, Math.sin(clamp(d / .3) * Math.PI)) * 14;
  g.beginPath(); g.moveTo(x - w, cy); g.lineTo(x - w, cy - 40); g.lineTo(x - w * .5, cy - 18); g.lineTo(x, cy - 48); g.lineTo(x + w * .5, cy - 18); g.lineTo(x + w, cy - 40); g.lineTo(x + w, cy); g.closePath();
  fillWith(g, Cw(1, 0, 1)); ink(g, 3);
  g.beginPath(); g.rect(x - w, cy - 6, 2 * w, 10); fillWith(g, Cw(0));
}
function vTorture(g, x, y, d, p) { // a hen in a cage too small for her
  g.beginPath(); g.rect(x - 84, y - 70, 168, 150); fillWith(g, Cw(.95)); ink(g, 4);
  eHen(g, x + 6, y + 20, 1.05, p.pFeather);
  for (let i = 0; i <= 8; i++) { line(g, x - 84 + i * 21, y - 70, x - 84 + i * 21, y + 80); ink(g, 3.2); }
  for (let j = 0; j <= 3; j++) { line(g, x - 84, y - 70 + j * 50, x + 84, y - 70 + j * 50); ink(g, 3.2); }
}
function vHealth(g, x, y, d, p) { // the bun, and a cracked heart above it
  eBun(g, x, y + 86, 150, p.pSack);
  eHeart(g, x, y - 42, 44 + Math.max(0, Math.sin(clamp(d / .3) * Math.PI)) * 4, true);
}

// ---------- 5. the verdict: the gavel, the fine (they are fined, and walk out free) ----------
function eGavel(t) { // 1 raised, 0 down on the block: three strokes, on "fine", "guilty" and "fuss"
  let v = ease(t, BE.l124 - .1, BE.l124 + .25);
  for (const s of [BE.fine, BE.guilty, BE.fuss]) { const d = t - (s - FE); if (d > -.09 && d < .4) v = Math.min(v, d < 0 ? -d / .09 : d < .08 ? 0 : ease(d, .08, .4)); }
  return v;
}
function eBlockVerdict(g, P, t) {
  ePanelWall(g, P, 560, 40, 330);
  const pRay = P.ray(620, 400, 40, { jit: .3 });
  const pRobe = P.lin(80, 7, { wob: .15 }), pFace = P.blk(118, 6.5, { jit: .2 }), pWig = P.lin(0, 5.5, { wob: .2 }), pWood = P.lin(0, 7, { wob: .15 });
  const pCoat = P.lin(90, 7, { wob: .12 }), pEdge = P.lin(0, 4, {}), pSack = P.rad(1040, 470, 6, { wob: .1 });
  eGround(g, P, 470, .45);
  const gv = eGavel(t), jk = .86, jx = 470, jy = 330;
  eJudge(g, jx, jy, jk, { gavel: gv, hasGavel: true, look: .4 }, { robe: pRobe, face: pFace, wig: pWig });
  g.beginPath(); g.rect(150, jy, 760, 140); fillWith(g, WC.LG(g, 0, jy, 0, jy + 140, [[0, .8], [1, .22]], pWood)); ink(g, 5);
  for (let x = 170; x < 890; x += 146) { g.beginPath(); g.rect(x, jy + 22, 126, 96); cutl(g, 2.5); }
  eCrownRoundel(g, 470, jy + 70, 40, pRay);
  // the sound block where the gavel head lands, and the impact cuts on each stroke
  const hx = jx + (120 + Math.sin(1.1) * 221) * jk, hy = jy + (-100 + Math.cos(1.1) * 221) * jk;
  g.beginPath(); g.roundRect(hx - 60, jy - 16, 120, 18, 6); fillWith(g, Cw(0)); line(g, hx - 56, jy - 12, hx + 56, jy - 12); cutl(g, 2);
  for (const s of [BE.fine, BE.guilty, BE.fuss]) { const k = 1 - ease(t, s - FE, s + .25); if (t < s - FE || k <= 0) continue; for (let i = 0; i < 7; i++) { const a = -Math.PI + i * Math.PI / 6; gouge(g, hx + Math.cos(a) * 70, hy - 10 + Math.sin(a) * 46, hx + Math.cos(a) * (130 + 40 * (1 - k)), hy - 10 + Math.sin(a) * (90 + 30 * (1 - k)), 6 * k + 1, 1); } }
  // the couple before the bench (they stand; nobody takes them anywhere)
  const pats = { coat: pCoat, face: pFace, legs: pEdge };
  ePerson(g, 700, 640, .98, { woman: true }, pats);
  ePerson(g, 830, 640, 1.02, {}, pats);
  // the fine: a purse of coin drops onto their little table on "fuss"
  g.beginPath(); g.rect(940, 470, 260, 20); fillWith(g, WC.LG(g, 0, 470, 0, 490, [[0, .85], [1, .3]], pWood)); ink(g, 4);
  for (const lx of [962, 1178]) { g.beginPath(); g.rect(lx - 8, 490, 16, 100); fillWith(g, Cw(0)); }
  const dd = t - (BE.fuss - FE);
  if (dd > -.2) { const y = dd < 0 ? lerp(60, 470, 1 - (dd / -.2) * (dd / -.2)) : 470 + Math.sin(clamp(dd / .2) * Math.PI) * -10 * Math.exp(-dd * 5); drawSack(g, P, 1070, y, 150, 150, pSack, false); }
}

// ---------- 6. outside the court: the refrain. More people with leaflets on every "people" ----------
const CROWD = [ // [onset index, feet x, feet y, scale, woman]
  [0, 310, 440, .62, 1], [0, 930, 440, .62, 0],
  [1, 90, 610, .98, 0], [1, 215, 630, 1.0, 1], [1, 340, 610, .98, 0],
  [2, 900, 610, .98, 1], [2, 1025, 630, 1.0, 0], [2, 1150, 610, .98, 1],
  [3, 50, 500, .74, 1], [3, 150, 510, .76, 0], [3, 250, 500, .74, 1],
  [4, 990, 500, .74, 0], [4, 1090, 510, .76, 1], [4, 1190, 500, .74, 0],
];
const THROW = (() => { const L = [], R = mulberry(5150); for (let i = 0; i < 34; i++) L.push({ x: 80 + R() * 1080, y: 300 + R() * 120, vx: (R() - .5) * 160, vy: -170 - R() * 160, sp: 2 + R() * 4, ph: R() * 6, dl: R() * .35 }); return L; })();
function eRaise(t) { // leaflets go up on every "Libelous", hold, come down
  let v = 0; for (const s of BE.libelous) { const d = t - (s - FE); if (d < 0) continue; v = Math.max(v, easeOutBack(clamp(d / .22), 1.4) * (1 - ease(d, 1.8, 2.4))); }
  return v;
}
function eBlockOutside(g, P, t) {
  // sky; the sun rises on the last shout and stays through the tail
  const sun = ease(t, BE.l131 - .2, BE.l131 + 3.2);
  // (no alpha in the tone map: blending would mix the pattern ids, so the sky's cuts switch to rays on the shout)
  if (t < BE.l131 - FE) { const pSky = P.lin(0, 9, { wob: .2, jit: .3 }); g.fillStyle = WC.LG(g, 0, 0, 0, 420, [[0, .5], [1, .92]], pSky); g.fillRect(0, 0, BW, 420); }
  else {
    const sx = 1040, sy = lerp(480, 250, sun);
    const pSun = P.ray(sx, sy, 64, { jit: .3, wob: .2 });
    g.fillStyle = WC.RG(g, sx, sy, 20, sx, sy, 1000, [[0, .98], [.45, .62], [1, .3]], pSun); g.fillRect(0, 0, BW, 420);
    ell(g, sx, sy, 70, 70); fillWith(g, Cw(1)); ink(g, 4); ell(g, sx, sy, 56, 56); cutl(g, 2);
  }
  const pStone = P.lin(90, 8, { wob: .12 }), pStep = P.lin(0, 6, { wob: .1 }), pRay = P.ray(620, 90, 40, { jit: .3 });
  // the court: pediment with the crown, columns, a dark door, steps
  pth(g, [[370, 130], [620, 40], [870, 130]]); fillWith(g, WC.LG(g, 0, 40, 0, 130, [[0, .8], [1, .4]], pStep)); ink(g, 4);
  eCrownRoundel(g, 620, 98, 28, pRay);
  g.beginPath(); g.rect(370, 130, 500, 22); fillWith(g, Cw(0)); line(g, 374, 140, 866, 140); cutl(g, 2);
  g.beginPath(); g.rect(390, 152, 460, 180); fillWith(g, WC.C(.35, pStone)); ink(g, 3);
  g.beginPath(); g.rect(570, 200, 100, 132); fillWith(g, Cw(0));
  for (const cx of [420, 500, 740, 820]) { g.beginPath(); g.rect(cx - 18, 152, 36, 180); fillWith(g, WC.LG(g, cx - 18, 0, cx + 18, 0, [[0, .3], [.4, .95], [1, .25]], pStone)); ink(g, 3); }
  for (let i = 0; i < 4; i++) { g.beginPath(); g.rect(370 - i * 24, 332 + i * 22, 500 + i * 48, 22); fillWith(g, WC.LG(g, 0, 332 + i * 22, 0, 354 + i * 22, [[0, .9], [1, .45]], pStep)); ink(g, 3); }
  eGround(g, P, 420, .52);
  const pCoat = P.lin(90, 7, { wob: .12 }), pFace = P.blk(120, 6, { jit: .2 }), pEdge = P.lin(0, 4, {});
  const pats = { coat: pCoat, face: pFace, legs: pEdge };
  const up = eRaise(t);
  // the crowd: a group pops up on each "people", back rows first in the drawing order
  const order = CROWD.map((c, i) => i).sort((a, b) => CROWD[a][2] - CROWD[b][2]);
  for (const i of order) {
    const [gi, x, y, k, wo] = CROWD[i]; const ta = BE.peopleOn[gi] - FE;
    if (t < ta) continue;
    const u = pop(t, ta + (i % 3) * .05, .2), hop = Math.max(0, Math.sin(clamp((t - ta) / .3) * Math.PI)) * 16;
    const a = up * (.7 + .3 * ((i * 7) % 3) / 2);
    g.save(); g.translate(x, y); g.scale(1, Math.min(1, u)); g.translate(-x, -y);
    ePerson(g, x, y - hop, k, { woman: !!wo, arm: i % 2 ? a : .1, arm2: i % 2 ? .1 : a, leaf: i % 2 === 1, leaf2: i % 2 === 0, flip: false }, pats);
    g.restore();
  }
  // the couple come out of the door and down the steps, then stand at the front
  const walk = ease(t, BE.l125 - .1, BE.l125 + 2.3);
  const cy = lerp(332, 640, walk), ck = lerp(.42, 1.12, walk), st = walk > 0 && walk < 1 ? (t - BE.l125) * 9 : 0;
  ePerson(g, lerp(605, 548, walk), cy, ck, { woman: true, arm: up, leaf: true, step: st }, pats);
  ePerson(g, lerp(640, 700, walk), cy, ck * 1.02, { arm2: up, leaf2: true, step: st + 1.3 }, pats);
  // the two held shouts: everyone throws leaflets into the air
  for (const h of BE.held) {
    const d0 = t - (h - FE); if (d0 < 0 || d0 > 4.5) continue;
    for (const s of THROW) {
      const d = d0 - s.dl; if (d < 0) continue;
      const x = s.x + s.vx * d + Math.sin(d * 2 + s.ph) * 30, y = s.y + s.vy * d + 18 * d * d * 0;
      if (y < -60) continue;
      eFlyingSheet(g, x, y, 34, 44, Math.sin(d * s.sp + s.ph) * .6, Math.cos(d * s.sp * 1.3 + s.ph));
    }
  }
}

// ---------- 7. the colophon: a printer's device, a hand from a cloud holding out a leaflet ----------
function eBlockColophon(g, P, t) {
  const pBg = P.lin(0, 8, { wob: .16, jit: .3 });
  g.fillStyle = WC.C(.25, pBg); g.fillRect(0, 0, BW, BH);
  const cx = 620, cy = 296, rx = 300, ry = 250;
  const pRay = P.ray(cx + 60, cy - 10, 90, { jit: .3, wob: .2 });
  ell(g, cx, cy, rx + 22, ry + 22); fillWith(g, Cw(0));
  ell(g, cx, cy, rx, ry); fillWith(g, WC.RG(g, cx + 60, cy - 10, 10, cx + 60, cy - 10, 360, [[0, .98], [.5, .62], [1, .25]], pRay)); ink(g, 3);
  ell(g, cx, cy, rx + 11, ry + 11); cutl(g, 2.5);
  g.save(); ell(g, cx, cy, rx - 2, ry - 2); g.clip();
  // the cloud (left), cut in contour rings
  const pCloud = P.brad(cx - 220, cy + 20, 9, { wob: .1 });
  g.beginPath();
  const bumps = [[-300, 40, 70], [-240, -30, 80], [-170, 30, 76], [-220, 110, 70], [-150, 120, 56], [-110, 60, 52]];
  for (const [dx, dy, r] of bumps) { g.moveTo(cx + dx + r, cy + dy); g.arc(cx + dx, cy + dy, r, 0, TAU); }
  fillWith(g, WC.C(.72, pCloud));
  for (const [dx, dy, r] of bumps) { g.beginPath(); g.arc(cx + dx, cy + dy, r, Math.PI * 1.05, Math.PI * 1.85); ink(g, 3.5); }
  // the arm out of the cloud: a cuffed sleeve, a mitten fist holding a leaflet up by its lower edge
  const pSleeve = P.lin(90, 7, { wob: .12 });
  const ax = cx - 150, ay = cy + 96, fx = cx + 40, fy = cy + 30;
  const ang = Math.atan2(fy - ay, fx - ax), len = Math.hypot(fx - ax, fy - ay);
  g.save(); g.translate(ax, ay); g.rotate(ang);
  pth(g, [[0, -32], [len - 40, -28], [len - 40, 28], [0, 34]]); fillWith(g, WC.LG(g, 0, -32, 0, 34, [[0, .55], [.45, .12], [1, .03]], pSleeve)); ink(g, 3.5);
  for (let i = 0; i < 3; i++) gouge(g, 30 + i * 46, -18, 56 + i * 46, 20, 3, 1, 6);
  g.beginPath(); g.rect(len - 46, -36, 24, 72); fillWith(g, Cw(1)); ink(g, 3); line(g, len - 34, -36, len - 34, 36); ink(g, 1.8);
  g.restore();
  // the leaflet: a big pale sheet, a black head band and ruled lines (no words)
  const lx = fx - 22, ly = fy - 246, lw = 176, lh = 236;
  g.save(); g.translate(lx + lw / 2, ly + lh); g.rotate(.08); g.translate(-(lx + lw / 2), -(ly + lh));
  g.beginPath(); g.rect(lx, ly, lw, lh); fillWith(g, Cw(1)); ink(g, 4);
  g.beginPath(); g.rect(lx + 14, ly + 14, lw - 28, 42); fillWith(g, Cw(0)); line(g, lx + 30, ly + 35, lx + lw - 30, ly + 35); cutl(g, 4);
  g.beginPath(); g.rect(lx + 14, ly + 68, 70, 70); ink(g, 2.5); ePerson(g, lx + 49, ly + 136, .23, { arm: 1, leaf: true }, { coat: pSleeve, face: pSleeve, legs: pSleeve });
  for (let r = 0; r < 6; r++) { line(g, lx + 94, ly + 74 + r * 12, lx + lw - 14, ly + 74 + r * 12); ink(g, 2.2); }
  for (let r = 0; r < 6; r++) { line(g, lx + 14, ly + 152 + r * 12, lx + lw - 14 - (r === 5 ? 50 : 0), ly + 152 + r * 12); ink(g, 2.2); }
  g.restore();
  // the fist over the sheet's lower edge, thumb across the front
  g.beginPath(); g.roundRect(fx - 26, fy - 30, 64, 58, 22); fillWith(g, Cw(1)); ink(g, 4);
  for (let f = 0; f < 3; f++) { line(g, fx + 14 + f * 0, fy - 18 + f * 14, fx + 36, fy - 18 + f * 14); ink(g, 2.4); }
  g.beginPath(); g.moveTo(fx - 18, fy - 22); g.quadraticCurveTo(fx + 4, fy - 34, fx + 18, fy - 18); ink(g, 3);
  g.restore();
  // a garland of leaves round the oval
  for (let i = 0; i < 28; i++) {
    const a = i / 28 * TAU, x = cx + Math.cos(a) * (rx + 46), y = cy + Math.sin(a) * (ry + 30);
    if (y > 560 || y < 30) continue;
    g.save(); g.translate(x, y); g.rotate(a + Math.PI / 2);
    g.beginPath(); g.ellipse(0, 0, 9, 18, 0, 0, TAU); fillWith(g, Cw(1)); ink(g, 2.4); line(g, 0, -14, 0, 14); ink(g, 1.4);
    g.restore();
  }
}

const BLOCKS_E = [eBlockCourt, eBlockKingSide, eBlockSpeak, eBlockJudge, eBlockViews, eBlockVerdict, eBlockOutside, eBlockColophon];
