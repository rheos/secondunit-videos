// Round 3, wood-B: the 24 woodblocks of stanzas 8-11. Each is drawFn(g, P, t): paints the tone map for song time t.
// Every beat is a word onset from lines.json (r3bW: line index, the word as sung). Nothing here quotes the lyric.

const r3bB = {
  // 0 the policy
  policy: r3bW(65, 'policy'), said: r3bW(65, 'said'), l66: r3bL(66), happy: r3bW(66, 'happy'), little: r3bW(66, 'little'), slaves: r3bW(66, 'slaves'),
  // 1 the night shift
  l67: r3bL(67), work67: r3bW(67, 'work'), night: r3bW(67, 'night'), shift: r3bW(67, 'shift'), holidays: r3bW(67, 'holidays'),
  // 2 the young women
  on68: r3bOn(68), women: r3bW(68, 'women'), l69: r3bL(69), less: r3bW(69, 'less'), than: r3bW(69, 'than'), twenty: r3bW(69, 'twenty'),
  // 3 trained to smile
  l70: r3bL(70), easy: r3bW(70, 'easy'), train: r3bW(70, 'train'), us70: r3bW(70, 'us'), smile: r3bW(70, 'smile'), plenty: r3bW(70, 'plenty'),
  // 4 the toilets, the grill
  clean: r3bW(71, 'clean'), toilets: r3bW(71, 'toilets'), l72: r3bL(72), work72: r3bW(72, 'work'), grill: r3bW(72, 'grill'),
  // 5 the time clock
  l73: r3bL(73), mostly73: r3bW(73, 'mostly'), parttime: r3bW(73, 'part-time'), l74: r3bL(74), here: r3bW(74, 'here'), until: r3bW(74, 'until'),
  // 6 the union
  l75: r3bL(75), enlightened: r3bW(75, 'enlightened'), union: r3bW(75, 'union'), ways: r3bW(75, 'ways'),
  // 7 shown the door
  l76: r3bL(76), fire: r3bW(76, 'fire'), quickly: r3bW(76, 'quickly'), heard: r3bW(76, 'heard'), say: r3bW(76, 'say'),
  // 8 long, smelly, hot
  l77: r3bL(77), shifts: r3bW(77, 'shifts'), too77: r3bW(77, 'too'), long: r3bW(77, 'long'), l78: r3bL(78), smelly: r3bW(78, 'smelly'), hot: r3bW(78, 'hot'),
  // 9 the ladder, the wages
  l79: r3bL(79), promotions: r3bW(79, 'promotions'), never79: r3bW(79, 'never'), l80: r3bL(80), wages: r3bW(80, 'wages'), not: r3bW(80, 'not'),
  // 10 the farm sheds
  chickens: r3bW(81, 'chickens'), pigs: r3bW(81, 'pigs'), kings82: r3bW(82, "king's"), factory: r3bW(82, 'factory'), farms: r3bW(82, 'farms'),
  // 11 inside the sheds
  l83: r3bL(83), never83: r3bW(83, 'never'), see: r3bW(83, 'see'), sun: r3bW(83, 'sun'), l84: r3bL(84), only: r3bW(84, 'only'), harm: r3bW(84, 'harm'),
  // 12 the conveyor
  l85: r3bL(85), dying: r3bW(85, 'dying'), bloody: r3bW(85, 'bloody'), barbaric: r3bW(85, 'barbaric'), cruel: r3bW(85, 'cruel'),
  l86: r3bL(86), meat: r3bW(86, 'meat'), comes: r3bW(86, 'comes'), urine: r3bW(86, 'urine'), stool: r3bW(86, 'stool'),
  // 13 the couple
  l87: r3bL(87), couple87: r3bW(87, 'couple'), england: r3bW(87, 'England'), l88: r3bL(88), getting: r3bW(88, 'getting'), sick: r3bW(88, 'sick'),
  // 14 the spyglass
  l89: r3bL(89), observing: r3bW(89, 'observing'), king89: r3bW(89, 'king'), l90: r3bL(90), on90: r3bOn(90), ticked: r3bW(90, 'ticked'),
  // 15 the meeting room
  l91: r3bL(91), went: r3bW(91, 'went'), greenpeace: r3bW(91, 'Greenpeace'), l92: r3bL(92), made: r3bW(92, 'made'), fact: r3bW(92, 'fact'), sheet: r3bW(92, 'sheet'),
  // 16 rain and heat
  l93: r3bL(93), stood93: r3bW(93, 'stood'), rain: r3bW(93, 'rain'), l94: r3bL(94), stood94: r3bW(94, 'stood'), heat: r3bW(94, 'heat'),
  // 17 handing it out
  l95: r3bL(95), gave: r3bW(95, 'gave'), out: r3bW(95, 'out'), truth: r3bW(95, 'truth'), did95: r3bW(95, 'did'), free: r3bW(95, 'free'),
  l96: r3bL(96), life: r3bW(96, 'life'), quick: r3bW(96, 'quick'), quietly: r3bW(96, 'quietly'), on96: r3bOn(96),
  // 18 the parents
  l97: r3bL(97), parents: r3bW(97, 'parents'), l98: r3bL(98), told: r3bW(98, 'told'), stop: r3bW(98, 'stop'),
  l99: r3bL(99), king99: r3bW(99, 'king'), lawyers99: r3bW(99, 'lawyers'), l100: r3bL(100), call: r3bW(100, 'call'), cops100: r3bW(100, 'cops'),
  // 19 one Tuesday
  l101: r3bL(101), happened: r3bW(101, 'happened'), one: r3bW(101, 'one'), tuesday: r3bW(101, 'Tuesday'),
  l102: r3bL(102), king102: r3bW(102, 'king'), wasnt: r3bW(102, "wasn't"), mad: r3bW(102, 'mad'),
  // 20 the patent
  l103: r3bL(103), buying: r3bW(103, 'buying'), patent: r3bW(103, 'patent'), satellite: r3bW(103, 'satellite'), ads: r3bW(103, 'ads'),
  // 21 the phone
  l104: r3bL(104), phone: r3bW(104, 'phone'), did104: r3bW(104, 'did'), ring: r3bW(104, 'ring'), l105: r3bL(105), wife: r3bW(105, 'wife'), scream: r3bW(105, 'scream'),
  // 22 the legal teams
  l106: r3bL(106), cops106: r3bW(106, 'cops'), jump: r3bW(106, 'jump'), l107: r3bL(107), legal: r3bW(107, 'legal'), teams: r3bW(107, 'teams'),
  l108: r3bL(108), work108: r3bW(108, 'work'), couple108: r3bW(108, 'couple'), l109: r3bL(109), shown: r3bW(109, 'shown'), nerve: r3bW(109, 'nerve'),
  // 23 the law book
  l110: r3bL(110), unfair: r3bW(110, 'unfair'), libel: r3bW(110, 'libel'), laws: r3bW(110, 'laws,'), king110: r3bW(110, 'King'), serve: r3bW(110, 'serve'),
};
const r3bE = (t, a, d = .25) => ease(t, a - r3bF, a - r3bF + d);           // 0 -> 1 starting on the frame a word prints
const r3bAt = (t, a) => t >= a - r3bF;                                       // from the frame a word prints

// ---------- 0. the policy: a notice unrolls on the kitchen wall and is sealed; the staff behind the counter ----------
function r3bBlockPolicy(g, P, t) {
  r3bTiles(g, P, 760, 120, 470);
  const pWood = P.lin(0, 7, { wob: .15 }), pCoat = P.lin(90, 7, { wob: .12 }), pFace = P.blk(120, 6, { jit: .2 }), pEdge = P.lin(0, 4, {});
  const pats = { coat: pCoat, face: pFace, legs: pEdge };
  // the notice: a roll at the top, unrolling down on "policy"; the red seal stamps on "said"
  const u = r3bE(t, r3bB.policy, .3), nx = 250, top = 70, h = lerp(20, 330, u);
  g.beginPath(); g.rect(nx - 140, top, 280, h); fillWith(g, Cw(1)); ink(g, 4);
  if (u > .3) {
    g.save(); g.beginPath(); g.rect(nx - 140, top, 280, h); g.clip();
    g.beginPath(); g.rect(nx - 118, top + 24, 236, 46); fillWith(g, Cw(0)); line(g, nx - 96, top + 47, nx + 96, top + 47); cutl(g, 4);
    for (let r = 0; r < 9; r++) { line(g, nx - 118, top + 98 + r * 22, nx + 118 - (r % 4 === 3 ? 80 : 0), top + 98 + r * 22); ink(g, 2.4); }
    g.restore();
  }
  g.beginPath(); g.roundRect(nx - 156, top - 16, 312, 30, 14); fillWith(g, WC.LG(g, 0, top - 16, 0, top + 14, [[0, .9], [1, .2]], pWood)); ink(g, 3.5); // the roller
  g.beginPath(); g.roundRect(nx - 156, top + h - 12, 312, 26, 12); fillWith(g, WC.LG(g, 0, top + h - 12, 0, top + h + 14, [[0, .85], [1, .2]], pWood)); ink(g, 3.5);
  for (const s of [-1, 1]) { ell(g, nx + s * 120, top - 2, 6, 6); fillWith(g, Cw(0)); } // nails
  if (r3bAt(t, r3bB.said)) { const k = 1 + .4 * (1 - r3bE(t, r3bB.said, .15)); waxSeal(g, nx + 80, top + h - 50, 30 * k); }
  // a cord runs from the seal to each of the staff on "slaves": a lead held by the notice
  const cordU = r3bE(t, r3bB.slaves, .3);
  // the staff behind the counter: on "happy" the trained grin, on "little" they shrink a little, on "slaves" they bow
  const xs = [640, 860, 1080];
  xs.forEach((x, i) => {
    const grin = r3bE(t, r3bB.happy + i * .04, .15), small = 1 - .1 * r3bE(t, r3bB.little, .2), bow = r3bE(t, r3bB.slaves + i * .05, .25);
    g.save(); g.translate(x, 750); g.scale(small, small); g.translate(-x, -750);
    r3bWorker(g, x, 750 + bow * 34, 1.52, { grin, arm: .05, arm2: .05 }, pats);
    g.restore();
  });
  if (cordU > 0) for (let i = 0; i < 3; i++) {
    const x0 = nx + 80, y0 = top + h - 50, x1 = lerp(x0, xs[i] - 40, cordU), y1 = lerp(y0, 470, cordU);
    g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo((x0 + x1) / 2, Math.max(y0, y1) + 70, x1, y1); ink(g, 5);
    g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo((x0 + x1) / 2, Math.max(y0, y1) + 70, x1, y1); g.setLineDash([5, 9]); cutl(g, 2); g.setLineDash([]);
  }
  r3bCounter(g, 440, 478, 1240, 600, pWood);
}

// ---------- 1. nights and holiday work: the grill, a window that goes to night, the clock, a wreath ----------
function r3bBlockNight(g, P, t) {
  r3bTiles(g, P, 700, 100, 430);
  const pWood = P.lin(0, 7, { wob: .15 }), pCoat = P.lin(90, 7, { wob: .12 }), pFace = P.blk(120, 6, { jit: .2 }), pEdge = P.lin(0, 4, {});
  const pSky = P.lin(0, 6, { wob: .2, jit: .3 }), pDay = P.ray(200, 120, 40, { jit: .3 }), pLeaf = P.dash(45, 5, 12, .6, { jit: .3 });
  const pats = { coat: pCoat, face: pFace, legs: pEdge };
  // the window (left): day, then night on "night" (moon and stars)
  const nt = r3bAt(t, r3bB.night);
  g.beginPath(); g.rect(70, 50, 270, 230); fillWith(g, nt ? WC.C(.08, pSky) : WC.RG(g, 200, 120, 10, 200, 120, 260, [[0, .98], [1, .6]], pDay)); ink(g, 6);
  if (nt) {
    const m = r3bE(t, r3bB.night, .3);
    ell(g, 270, lerp(260, 120, m), 34, 34); fillWith(g, Cw(1)); ell(g, 284, lerp(250, 110, m), 30, 30); fillWith(g, Cw(.08, pSky));
    for (let i = 0; i < 9; i++) { const x = 90 + rnd(i, 3) * 160, y = 70 + rnd(i, 4) * 170; if (r3bE(t, r3bB.night + i * .03, .1) > .5) { line(g, x - 6, y, x + 6, y); cutl(g, 2.5); line(g, x, y - 6, x, y + 6); cutl(g, 2.5); } }
  }
  line(g, 205, 50, 205, 280); ink(g, 8); line(g, 70, 165, 340, 165); ink(g, 8);
  // the clock over the grill: on "shift" its hands go round once
  const spin = 2.2 + r3bE(t, r3bB.shift, .45) * TAU * 1.0 + r3bE(t, r3bB.holidays, .5) * TAU;
  r3bClock(g, 640, 110, 62, spin);
  // the holiday wreath (the red plate) and bunting, on "holidays"
  const hol = r3bPop(t, r3bB.holidays - r3bF, .2);
  if (hol > 0) {
    g.save(); g.translate(990, 130); g.scale(hol, hol);
    g.beginPath(); g.arc(0, 0, 70, 0, TAU); g.arc(0, 0, 40, 0, TAU, true); fillWith(g, WC.C(.55, pLeaf, 1)); ink(g, 3);
    for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; ell(g, Math.cos(a) * 55, Math.sin(a) * 55, 7, 7); fillWith(g, Cw(1, 0, 1)); ink(g, 2); }
    pth(g, [[-10, 62], [10, 62], [26, 104], [0, 84], [-26, 104]]); fillWith(g, Cw(1, 0, 1)); ink(g, 2.5);
    g.restore();
    const bu = r3bE(t, r3bB.holidays, .3);
    g.beginPath(); g.moveTo(380, 30); g.quadraticCurveTo(780, 120, 1220, 30); ink(g, 3);
    for (let i = 0; i < 11; i++) { if (i / 11 > bu) break; const x = 400 + i * 76, y = 30 + Math.sin((i + .5) / 11.5 * Math.PI) * 50; pth(g, [[x, y], [x + 40, y + 2], [x + 20, y + 44]]); fillWith(g, i % 2 ? Cw(1) : Cw(0)); ink(g, 2.4); }
  }
  // the grill and two workers flipping on every sung onset from "work"
  const on = r3bOn(67).filter(s => s >= r3bB.work67 - .01);
  [[580, 0], [900, 1]].forEach(([x, i]) => {
    const fl = r3bTalk(t, on.map(s => s + i * .05));
    r3bWorker(g, x, 700, 1.25, { arm: .15 + fl * .5, arm2: .05, grin: 0, flip: i === 1 }, pats);
  });
  g.beginPath(); g.rect(400, 470, 760, 40); fillWith(g, Cw(0));
  for (let x = 410; x < 1150; x += 26) { line(g, x, 476, x, 504); cutl(g, 3); }
  for (let i = 0; i < 6; i++) { // patties, flipped in the air on the onsets
    const px = 470 + i * 120, fl = r3bTalk(t, on.map(s => s + (i % 3) * .03));
    ell(g, px, 466 - fl * 60, 34, 10 * Math.max(.2, Math.abs(Math.cos(fl * Math.PI)))); fillWith(g, Cw(.15)); ink(g, 2.5);
  }
  for (let i = 0; i < 5; i++) { const sx = 480 + i * 150, ph = ((t * .9 + i * .23) % 1); g.beginPath(); g.moveTo(sx, 460); g.bezierCurveTo(sx - 14, 420 - ph * 30, sx + 14, 400 - ph * 30, sx, 360 - ph * 40); cutl(g, 3); }
  r3bCounter(g, 380, 510, 1240, 600, pWood);
}

// ---------- 2. the young crew: they step up one by one; a birthday cake's candles light ----------
function r3bBlockWomen(g, P, t) {
  r3bRays(g, P, 620, 160, 70, 900, .97, .2);
  const pWood = P.lin(0, 7, { wob: .15 }), pCoat = P.lin(90, 7, { wob: .12 }), pFace = P.blk(120, 6, { jit: .2 }), pEdge = P.lin(0, 4, {}), pCake = P.lin(0, 5, { wob: .1 });
  const pats = { coat: pCoat, face: pFace, legs: pEdge };
  const on = r3bB.on68, arr = [on[0], on[1], on[2], on[3], on[3] + .08];
  [180, 400, 620, 840, 1060].forEach((x, i) => {
    const a = arr[i] - r3bF; if (t < a) return;
    const u = r3bPop(t, a, .2), hop = Math.max(0, Math.sin(clamp((t - a) / .3) * Math.PI)) * 22;
    g.save(); g.translate(x, 740); g.scale(1, Math.min(1, u)); g.translate(-x, -740);
    r3bWorker(g, x, 740, 1.36, { hop, arm: .05, arm2: .05 }, pats);
    g.restore();
  });
  r3bCounter(g, 0, 500, 1240, 600, pWood);
  // the cake pops onto the counter on "Who"; its candles light across "less", "than", "twenty"
  const ck = r3bPop(t, r3bB.l69 - r3bF, .2);
  if (ck > 0) {
    g.save(); g.translate(620, 500); g.scale(ck * 1.35, ck * 1.35);
    g.beginPath(); g.rect(-130, -70, 260, 70); fillWith(g, WC.LG(g, -130, 0, 130, 0, [[0, .4], [.4, .95], [1, .35]], pCake)); ink(g, 3.5);
    g.beginPath(); g.moveTo(-130, -70); for (let i = 0; i <= 13; i++) g.quadraticCurveTo(-130 + (i - .5) * 20, -40, -130 + i * 20, -70); fillWith(g, Cw(1)); ink(g, 2.5);
    g.beginPath(); g.rect(-130, -76, 260, 8); fillWith(g, Cw(1)); ink(g, 2.5);
    const lit = r3bAt(t, r3bB.twenty) ? 19 : r3bAt(t, r3bB.than) ? 12 : r3bAt(t, r3bB.less) ? 6 : 0;
    for (let i = 0; i < 19; i++) {
      const x = -117 + i * 13; g.beginPath(); g.rect(x - 3, -114, 6, 38); fillWith(g, i % 2 ? Cw(1) : Cw(1, 0, 1)); ink(g, 1.8);
      if (i < lit) { g.beginPath(); g.moveTo(x, -136); g.quadraticCurveTo(x + 6, -124, x, -116); g.quadraticCurveTo(x - 6, -124, x, -136); fillWith(g, Cw(0)); ell(g, x, -123, 1.6, 3); fillWith(g, Cw(1)); }
    }
    g.restore();
  }
}

// ---------- 3. trained to smile: the manager's pointer, a smile cut on the blackboard, the staff grin ----------
function r3bBlockTrain(g, P, t) {
  r3bPanel(g, P, 820, 120, 500);
  const pCoat = P.lin(90, 7, { wob: .12 }), pFace = P.blk(120, 6, { jit: .2 }), pEdge = P.lin(0, 4, {}), pLegs = P.lin(0, 6, {});
  const pBoard = P.lin(20, 6, { wob: .2, jit: .3 }), pRay = P.ray(950, 300, 60, { jit: .3 });
  r3bGround(g, P, 500, .5);
  const pats = { coat: pCoat, face: pFace, legs: pEdge };
  // on "plenty" rays burst behind the staff
  const pl = r3bE(t, r3bB.plenty, .25);
  if (pl > 0) { g.beginPath(); g.rect(700, 30, 520, 470); fillWith(g, WC.RG(g, 950, 300, 10, 950, 300, 420 * pl + 10, [[0, .98], [1, .3]], pRay)); }
  // the blackboard: on "smile" a smile is cut into it (a white curve), growing
  g.beginPath(); g.rect(230, 60, 380, 260); fillWith(g, WC.C(.12, pBoard)); ink(g, 6);
  g.beginPath(); g.rect(222, 52, 396, 276); ink(g, 4);
  const sm = r3bE(t, r3bB.smile, .25);
  if (sm > 0) {
    g.beginPath(); g.arc(420, 140, 110, .25 * Math.PI, .25 * Math.PI + sm * .5 * Math.PI); cutl(g, 14);
    if (sm > .9) { ell(g, 370, 150, 9, 9); fillWith(g, Cw(1)); ell(g, 470, 150, 9, 9); fillWith(g, Cw(1)); }
  }
  g.beginPath(); g.rect(230, 314, 380, 10); fillWith(g, Cw(.8)); ink(g, 2.5);
  // the manager (facing right) with a pointer: taps the board on "train", swings to the staff on "us"
  const tr = r3bE(t, r3bB.train, .15), us = r3bE(t, r3bB.us70, .3), tap = r3bPulse(t, r3bB.train - r3bF, .25);
  const mk = 1.32;
  r3bManager(g, P, 130, 700, mk, { flip: true }, { coat: pCoat, face: pFace, legs: pLegs });
  const hx = 130 + 50 * mk, hy = 700 - 150 * mk;
  const tx = lerp(lerp(230, 420, tr), 740, us), ty = lerp(lerp(300, 240, tr), 330, us) + tap * 10;
  line(g, hx, hy, tx, ty); ink(g, 6); line(g, hx, hy, tx, ty); cutl(g, 1.5);
  mitten(g, hx, hy, 13);
  // the staff: grin on "smile", wider on "plenty"
  [800, 965, 1130].forEach((x, i) => {
    const grin = r3bE(t, r3bB.smile + i * .03, .12) * (.7 + .3 * pl);
    r3bWorker(g, x, 750, 1.42, { grin, arm: .05, arm2: .05 }, pats);
  });
}

// ---------- 4. the toilets (left) and the grill (right), either side of a partition ----------
function r3bBlockToilets(g, P, t) {
  const pTile = r3bTiles(g, P, 300, 100, 600, 56);
  const pWall = P.lin(90, 9, { wob: .2 }), pCoat = P.lin(90, 7, { wob: .12 }), pFace = P.blk(120, 6, { jit: .2 }), pEdge = P.lin(0, 4, {});
  const pPor = P.rad(150, 380, 5, { wob: .08 }), pSteel = P.lin(0, 5, { wob: .05 });
  const pats = { coat: pCoat, face: pFace, legs: pEdge };
  // the right half: dark panelling behind the grill
  g.beginPath(); g.rect(640, 0, 600, BH); fillWith(g, WC.RG(g, 940, 140, 10, 940, 140, 600, [[0, .85], [1, .2]], pWall));
  g.beginPath(); g.rect(608, 0, 32, BH); fillWith(g, Cw(0)); line(g, 618, 0, 618, BH); cutl(g, 2);
  // a toilet (side on), plain
  g.beginPath(); g.rect(80, 240, 110, 150); fillWith(g, WC.LG(g, 80, 0, 190, 0, [[0, .55], [.4, .97], [1, .5]], pPor)); ink(g, 4); // tank
  g.beginPath(); g.moveTo(80, 400); g.lineTo(260, 400); g.quadraticCurveTo(262, 470, 200, 490); g.lineTo(190, 560); g.lineTo(120, 560); g.lineTo(112, 490); g.quadraticCurveTo(78, 470, 80, 400); g.closePath();
  fillWith(g, WC.LG(g, 80, 0, 262, 0, [[0, .5], [.45, .97], [1, .45]], pPor)); ink(g, 4);
  g.beginPath(); g.rect(76, 386, 194, 16); fillWith(g, Cw(1)); ink(g, 3);
  // on "toilets" it gleams (star cuts)
  const gl = r3bE(t, r3bB.toilets, .2) * (1 - ease(t, r3bB.toilets + .8, r3bB.toilets + 1.4));
  if (gl > 0) for (const [sx, sy, r] of [[140, 290, 22], [230, 430, 28], [96, 470, 16]]) { const rr = r * gl; line(g, sx - rr, sy, sx + rr, sy); ink(g, 4); line(g, sx, sy - rr, sx, sy + rr); ink(g, 4); line(g, sx - rr * .5, sy - rr * .5, sx + rr * .5, sy + rr * .5); ink(g, 2); line(g, sx + rr * .5, sy - rr * .5, sx - rr * .5, sy + rr * .5); ink(g, 2); }
  // the worker with the mop: it swabs side to side from "clean"
  const sw = r3bAt(t, r3bB.clean) ? Math.sin((t - r3bB.clean + r3bF) * 7) : 0;
  const mx = 430, my = 700, mk = 1.2;
  r3bWorker(g, mx, my, mk, { arm: .35, arm2: .35 }, pats);
  const hx = mx + 6, hy = my - 150 * mk, fx = 380 + sw * 70, fy = 566;
  line(g, hx + 30, hy - 60, fx, fy); ink(g, 7); line(g, hx + 30, hy - 60, fx, fy); cutl(g, 1.6);
  mitten(g, hx - 30, hy + 10, 11); mitten(g, hx + 30, hy - 40, 11);
  for (let i = -5; i <= 5; i++) { g.beginPath(); g.moveTo(fx, fy); g.quadraticCurveTo(fx + i * 5, fy + 10, fx + i * 9 - sw * 10, fy + 34); ink(g, 4); }
  g.beginPath(); g.moveTo(500, 500); g.lineTo(590, 500); g.lineTo(580, 575); g.lineTo(510, 575); g.closePath(); fillWith(g, WC.LG(g, 500, 0, 590, 0, [[0, .3], [.5, .8], [1, .25]], pSteel)); ink(g, 3.5); // bucket
  g.beginPath(); g.arc(545, 500, 40, Math.PI, 0); ink(g, 3);
  // the grill: a worker flips the patties on "work" and "grill"
  const fl = Math.max(r3bPulse(t, r3bB.work72 - .03, .3), r3bPulse(t, r3bB.grill - .03, .3));
  r3bWorker(g, 940, 700, 1.25, { arm: .2 + fl * .55, arm2: .05 }, pats);
  g.beginPath(); g.rect(680, 470, 520, 40); fillWith(g, Cw(0));
  for (let x = 690; x < 1190; x += 24) { line(g, x, 476, x, 504); cutl(g, 3); }
  for (let i = 0; i < 4; i++) { const px = 740 + i * 130, f = i % 2 ? fl : r3bPulse(t, r3bB.grill + .05, .3); ell(g, px, 464 - f * 70, 36, 11 * Math.max(.2, Math.abs(Math.cos(f * Math.PI)))); fillWith(g, Cw(.15)); ink(g, 2.5); }
  const st = r3bE(t, r3bB.grill, .3);
  for (let i = 0; i < 5; i++) { const sx = 720 + i * 110, ph = ((t * .9 + i * .21) % 1); g.beginPath(); g.moveTo(sx, 456); g.bezierCurveTo(sx - 16, 410 - ph * 30, sx + 16, 380 - ph * 30, sx, 330 - ph * 40 - st * 60); cutl(g, 3 + st * 2); }
  r3bCounter(g, 660, 510, 1240, 600, pSteel);
}

// ---------- 5. the time clock: a card punched on "part-time"; the hands race to "until" ----------
function r3bBlockClock(g, P, t) {
  r3bPanel(g, P, 620, 80, 470);
  const pCoat = P.lin(90, 7, { wob: .12 }), pFace = P.blk(120, 6, { jit: .2 }), pEdge = P.lin(0, 4, {}), pBox = P.lin(0, 6, { wob: .08 });
  r3bGround(g, P, 470, .5);
  const pats = { coat: pCoat, face: pFace, legs: pEdge };
  // the racks of cards either side
  for (const rx of [130, 1000]) { g.beginPath(); g.rect(rx, 120, 160, 260); fillWith(g, WC.C(.35, pBox)); ink(g, 3.5); for (let r = 0; r < 6; r++) for (let c = 0; c < 3; c++) { g.beginPath(); g.rect(rx + 12 + c * 50, 130 + r * 42, 38, 34); fillWith(g, Cw(1)); ink(g, 2); line(g, rx + 18 + c * 50, 140 + r * 42, rx + 44 + c * 50, 140 + r * 42); ink(g, 1.4); } }
  // the time clock: a box with a big dial; on "part-time" half its dial goes black
  g.beginPath(); g.rect(470, 60, 300, 380); fillWith(g, WC.LG(g, 470, 0, 770, 0, [[0, .25], [.4, .75], [1, .2]], pBox)); ink(g, 4);
  const half = r3bE(t, r3bB.parttime, .2);
  const spin = 1.2 + r3bE(t, r3bB.l74, r3bB.until - r3bB.l74) * TAU * 3;
  r3bClock(g, 620, 190, 100, spin);
  if (half > 0) { g.beginPath(); g.moveTo(620, 190); g.arc(620, 190, 98, -Math.PI / 2, -Math.PI / 2 + half * Math.PI); g.closePath(); fillWith(g, Cw(0)); line(g, 620, 190, 620 + Math.cos(spin - 1.57) * 80, 190 + Math.sin(spin - 1.57) * 80); cutl(g, 3.5); }
  g.beginPath(); g.rect(560, 330, 120, 22); fillWith(g, Cw(0)); // the card slot
  // the worker with her card: it goes in on "part-time" (a clunk)
  const ins = r3bE(t, r3bB.parttime, .12), clunk = r3bHit(t, r3bB.parttime, .3);
  r3bWorker(g, 340, 700, 1.25, { arm: .55 + ins * .1, arm2: .05 }, pats);
  const cx = lerp(470, 620, ins), cy = lerp(380, 300, ins);
  g.beginPath(); g.rect(cx - 30, cy - 50, 60, 80); fillWith(g, Cw(1)); ink(g, 2.5); line(g, cx - 22, cy - 30, cx + 22, cy - 30); ink(g, 1.6);
  r3bImpact(g, 620, 340, 70, 130, 8, 5, clunk);
  // on "until" a bell on the clock rings
  const bell = r3bHit(t, r3bB.until, .5);
  ell(g, 620, 40, 26, 18); fillWith(g, Cw(1)); ink(g, 3); r3bImpact(g, 620, 40, 36, 80, 7, 4, bell, Math.PI);
}

// ---------- 6. the union idea dawns: rays from a leaflet, the others link arms ----------
function r3bBlockUnion(g, P, t) {
  const lit = r3bE(t, r3bB.enlightened, .3);
  const pDark = P.lin(0, 8, { wob: .2, jit: .3 }), pRay = P.ray(620, 280, 80, { jit: .35, wob: .2 });
  g.fillStyle = WC.RG(g, 620, 280, 10, 620, 280, 300 + lit * 700, [[0, .3 + lit * .68], [1, .08 + lit * .1]], lit > 0 ? pRay : pDark); g.fillRect(0, 0, BW, BH);
  const pCoat = P.lin(90, 7, { wob: .12 }), pFace = P.blk(120, 6, { jit: .2 }), pEdge = P.lin(0, 4, {}), pWood = P.lin(0, 7, { wob: .15 });
  r3bGround(g, P, 500, .45);
  const pats = { coat: pCoat, face: pFace, legs: pEdge };
  // the bench
  g.beginPath(); g.rect(470, 520, 300, 22); fillWith(g, WC.LG(g, 0, 520, 0, 542, [[0, .85], [1, .3]], pWood)); ink(g, 3.5);
  // the reader, centre: holds the leaflet up before her, then raises it
  const un = r3bE(t, r3bB.union, .35), wy = r3bE(t, r3bB.ways, .25);
  r3bWorker(g, 620, 750, 1.42, { arm: .45 + wy * .5, leaf: true, arm2: .05 + wy * .9 }, pats);
  if (lit > 0) r3bImpact(g, 650, 330, 90, 200, 12, 5, lit * (1 - ease(t, r3bB.enlightened + 1, r3bB.enlightened + 1.6)) * .9 + .1 * lit);
  // two more walk in from the sides on "union" and link arms with her; all hands go up on "ways"
  for (const s of [-1, 1]) {
    const x = lerp(620 + s * 620, 620 + s * 240, un); if (un <= 0) continue;
    r3bWorker(g, x, 750, 1.38, { arm: s < 0 ? .45 + wy * .5 : .05, arm2: s > 0 ? .45 + wy * .5 : .05, flip: false, step: un < 1 ? t * 9 : 0 }, pats);
    if (un > .95) { // the linked hands: a mitten pair between them
      const hx = 620 + s * 130, hy = lerp(440, 270, wy);
      mitten(g, hx, hy, 14); mitten(g, hx + s * 10, hy - 6, 14);
    }
  }
}

// ---------- 7. shown the door: on "fire" the door opens, one goes out "quickly"; the manager's ear trumpet on "heard" ----------
function r3bBlockFire(g, P, t) {
  r3bPanel(g, P, 400, 100, 480);
  const pCoat = P.lin(90, 7, { wob: .12 }), pFace = P.blk(120, 6, { jit: .2 }), pEdge = P.lin(0, 4, {}), pLegs = P.lin(0, 6, {});
  const pOut = P.ray(1060, 260, 40, { jit: .3 }), pDoor = P.lin(90, 7, { wob: .15 }), pBrass = P.lin(30, 4, {});
  r3bGround(g, P, 480, .5);
  const pats = { coat: pCoat, face: pFace, legs: pEdge };
  // the back door (right): opens on "fire", daylight outside
  const op = r3bE(t, r3bB.fire, .2) * (1 - ease(t, r3bB.quickly + .55, r3bB.quickly + .8) * .9);
  g.beginPath(); g.rect(960, 100, 200, 380); fillWith(g, op > .02 ? WC.RG(g, 1060, 260, 10, 1060, 260, 300, [[0, .98], [1, .6]], pOut) : Cw(0)); ink(g, 5);
  // the one who is let go: walks out of the door on "quickly", her cap left on the floor
  const go = r3bE(t, r3bB.quickly, .5);
  if (go < 1) {
    g.save(); if (go > 0) { g.beginPath(); g.rect(0, 0, 1160, BH); g.clip(); }
    r3bWorker(g, lerp(780, 1120, go), lerp(700, 640, go), lerp(1.2, .95, go), { arm: .05, arm2: .05, step: go > 0 ? t * 10 : 0 }, pats);
    g.restore();
  }
  if (go > .2) { pth(g, [[820, 500], [880, 500], [870, 476], [830, 476]]); fillWith(g, Cw(1)); ink(g, 2.4); }
  // the door leaf swings (drawn over the doorway's right half)
  const dw = lerp(196, 40, op);
  g.beginPath(); g.rect(962, 102, dw, 376); fillWith(g, WC.LG(g, 962, 0, 962 + dw, 0, [[0, .5], [1, .2]], pDoor)); ink(g, 4);
  ell(g, 962 + dw - 22, 300, 8, 8); fillWith(g, WC.C(.9, pBrass)); ink(g, 2);
  g.beginPath(); g.rect(1160, 90, 30, 400); fillWith(g, Cw(0)); // the jamb
  // the manager (left, facing right): points at the door on "fire"; on "heard" he holds an ear trumpet out
  const pt = r3bE(t, r3bB.fire, .15) * (1 - r3bE(t, r3bB.heard - .3, .2)), hd = r3bE(t, r3bB.heard, .2);
  const mk = 1.3;
  r3bManager(g, P, 180, 700, mk, { flip: true }, { coat: pCoat, face: pFace, legs: pLegs });
  if (pt > 0) { limb(g, [[214, 462], [lerp(240, 330, pt), lerp(480, 410, pt)], [lerp(250, 410, pt), lerp(520, 380, pt)]], 20); mitten(g, lerp(250, 414, pt), lerp(520, 378, pt), 13); }
  if (hd > 0) { // the ear trumpet: a horn from his ear toward the worker who stayed
    const ex = 180 + 26 * mk, ey = 700 - 226 * mk, L = 40 + hd * 150;
    g.beginPath(); g.moveTo(ex, ey - 5); g.lineTo(ex + L, ey - 22 - hd * 30); g.lineTo(ex + L, ey + 22 + hd * 30); g.lineTo(ex, ey + 5); g.closePath(); fillWith(g, WC.LG(g, 0, ey - 50, 0, ey + 50, [[0, .9], [.5, .5], [1, .15]], pBrass)); ink(g, 3.5);
    g.beginPath(); g.ellipse(ex + L, ey, 8, 22 + hd * 30, 0, 0, TAU); fillWith(g, Cw(0)); ink(g, 2.5);
  }
  // the one who stayed: speaks on "say" (sound cut toward the trumpet)
  const sp = r3bTalk(t, [r3bB.say]);
  r3bWorker(g, 560, 700, 1.22, { arm: .05, arm2: .05, speak: sp, flip: true }, pats);
  if (sp > .1) for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(560, 700 - 268, 40 + i * 24, Math.PI * .85, Math.PI * 1.15); ink(g, 4 * sp); }
}

// ---------- 8. the shifts too long (a rota unrolls to the floor); heat and fumes at the fryer ----------
function r3bBlockLong(g, P, t) {
  r3bTiles(g, P, 820, 100, 520);
  const pCoat = P.lin(90, 7, { wob: .12 }), pFace = P.blk(120, 6, { jit: .2 }), pEdge = P.lin(0, 4, {}), pSteel = P.lin(0, 5, { wob: .05 }), pOil = P.wave(0, 6, 3, 9, {}), pWood = P.lin(0, 7, { wob: .15 });
  r3bGround(g, P, 520, .5);
  const pats = { coat: pCoat, face: pFace, legs: pEdge };
  // the rota: pinned up on "shifts", unrolls on "too", runs to the floor and curls on "long"
  const ap = r3bPop(t, r3bB.shifts - r3bF, .2), un = r3bE(t, r3bB.too77, .3) * .45 + r3bE(t, r3bB.long, .4) * .55;
  if (ap > 0) {
    const rx = 230, top = 60, h = lerp(120, 560, un);
    g.save(); g.translate(rx, top); g.scale(ap, ap); g.translate(-rx, -top);
    g.beginPath(); g.rect(rx - 110, top, 220, h); fillWith(g, Cw(1)); ink(g, 3.5);
    for (let r = 0; r * 26 + 40 < h - 10; r++) { line(g, rx - 96, top + 30 + r * 26, rx + 96, top + 30 + r * 26); ink(g, 1.6); for (let c = 1; c < 4; c++) { line(g, rx - 96 + c * 48, top + 18 + r * 26, rx - 96 + c * 48, top + 42 + r * 26); ink(g, 1.4); } }
    ell(g, rx, top + 4, 8, 8); fillWith(g, Cw(1, 0, 1)); ink(g, 2);
    if (un > .9) { g.beginPath(); g.ellipse(rx + 40, top + h, 70, 22, 0, 0, TAU); fillWith(g, Cw(1)); ink(g, 3); g.beginPath(); g.ellipse(rx + 40, top + h, 40, 12, 0, 0, TAU); ink(g, 2); }
    g.restore();
  }
  // the fryer (right): stink lines rise on "smelly"; on "hot" the thermometer climbs (red) and heat cuts waver
  g.beginPath(); g.rect(720, 360, 400, 160); fillWith(g, WC.LG(g, 720, 0, 1120, 0, [[0, .2], [.4, .8], [1, .15]], pSteel)); ink(g, 4);
  g.beginPath(); g.rect(740, 340, 360, 30); fillWith(g, WC.C(.25, pOil)); ink(g, 3);
  for (const bx of [800, 960]) { g.beginPath(); g.rect(bx, 290, 110, 60); for (let i = 1; i < 6; i++) { line(g, bx + i * 18, 290, bx + i * 18, 350); } ink(g, 2.4); line(g, bx + 55, 290, bx + 55, 230); ink(g, 5); }
  const sme = r3bE(t, r3bB.smelly, .3);
  if (sme > 0) for (let i = 0; i < 5; i++) { const sx = 760 + i * 80, ph = (t * .8 + i * .3) % 1; g.beginPath(); for (let k = 0; k <= 10; k++) { const y = 330 - k * 22 * sme - ph * 20; g.lineTo(sx + Math.sin(k * 1.2 + i + t * 4) * 14, y); } ink(g, 3.5); }
  const hot = r3bE(t, r3bB.hot, .3);
  g.beginPath(); g.roundRect(1150, 60, 30, 240, 15); fillWith(g, Cw(1)); ink(g, 3);
  ell(g, 1165, 310, 26, 26); fillWith(g, Cw(1, 0, 1)); ink(g, 3);
  g.beginPath(); g.rect(1158, lerp(240, 74, hot), 14, 300 - lerp(240, 74, hot)); fillWith(g, Cw(1, 0, 1));
  for (let k = 0; k < 6; k++) { line(g, 1150, 90 + k * 36, 1162, 90 + k * 36); ink(g, 2); }
  if (hot > 0) for (let i = 0; i < 6; i++) { const sx = 700 + i * 70; g.beginPath(); for (let k = 0; k <= 8; k++) g.lineTo(sx + Math.sin(k + t * 9 + i) * 8, 230 - k * 22); cutl(g, 3 * hot); }
  // the worker between them: looks up at the rota, then wipes her brow on "hot"
  r3bWorker(g, 540, 700, 1.25, { arm: .05 + hot * .62, arm2: .1 + un * .2 }, pats);
  r3bCounter(g, 700, 520, 1240, 600, pWood);
}

// ---------- 9. promotions never: the ladder's rungs fall out; the wage packet is empty ----------
function r3bBlockLadder(g, P, t) {
  r3bPanel(g, P, 900, 60, 500);
  const pCoat = P.lin(90, 7, { wob: .12 }), pFace = P.blk(120, 6, { jit: .2 }), pEdge = P.lin(0, 4, {}), pWood = P.lin(80, 5, { wob: .1 }), pRay = P.ray(1000, 90, 30, { jit: .3 }), pEnv = P.lin(0, 4, {});
  r3bGround(g, P, 500, .5);
  const pats = { coat: pCoat, face: pFace, legs: pEdge };
  // the door at the top of the stairs (the office), a crown roundel over it
  g.beginPath(); g.rect(900, 30, 200, 150); fillWith(g, Cw(0)); ink(g, 4); eCrownRoundel(g, 1000, 100, 50, pRay);
  g.beginPath(); g.rect(880, 176, 260, 16); fillWith(g, Cw(.8, pWood)); ink(g, 3);
  // the ladder from the floor to the office: on "never" every rung above the first falls out
  const x0 = 520, x1 = 880, y0 = 520, y1 = 190;
  const rail = (dx) => { line(g, x0 + dx, y0, x1 + dx, y1); ink(g, 12); line(g, x0 + dx, y0, x1 + dx, y1); cutl(g, 2); };
  rail(0); rail(80);
  const fallT = t - (r3bB.never79 - r3bF);
  for (let i = 0; i < 9; i++) {
    const u = (i + .6) / 9.5, x = lerp(x0, x1, u), y = lerp(y0, y1, u);
    let dx = 0, dy = 0, rot = 0;
    if (i > 0 && fallT > 0) { const d = Math.max(0, fallT - i * .03); dy = 900 * d * d; dx = (i % 2 ? 1 : -1) * 60 * d; rot = (i % 2 ? 1 : -1) * d * 6; if (y + dy > 560) continue; }
    g.save(); g.translate(x + 40 + dx, y + dy); g.rotate(rot); line(g, -48, 0, 48, 0); ink(g, 9); g.restore();
  }
  // the worker at the foot: reaches for the first rung on "promotions"
  const re = r3bE(t, r3bB.promotions, .25);
  r3bWorker(g, 400, 700, 1.25, { arm: .3 + re * .5, arm2: .05 }, pats);
  // the wage packet: drops into her other hand on "wages"; on "not" it opens empty and a moth flutters out
  const wp = r3bE(t, r3bB.wages, .2), op = r3bE(t, r3bB.not, .15);
  if (wp > 0) {
    const ex = 270, ey = lerp(100, 440, wp);
    g.beginPath(); g.rect(ex - 50, ey - 34, 100, 66); fillWith(g, WC.C(.92, pEnv)); ink(g, 3);
    g.beginPath(); g.moveTo(ex - 50, ey - 34); g.lineTo(ex, ey - 34 - op * 40); g.lineTo(ex + 50, ey - 34); ink(g, 3);
    if (op > 0) { const d = t - r3bB.not, mx = ex + d * 120, my = ey - 60 - d * 140, fl = Math.abs(Math.sin(d * 30)); for (const s of [-1, 1]) { g.beginPath(); g.ellipse(mx + s * 12, my, 13, 8 * (.3 + fl), s * .4, 0, TAU); fillWith(g, Cw(.85)); ink(g, 2); } ell(g, mx, my, 4, 9); fillWith(g, Cw(0)); }
    mitten(g, ex + 10, ey + 34, 12);
  }
}

// ---------- 10. the king's factory farms: long sheds; hens and pigs brought in; the crown flag; smoke ----------
function r3bBlockFarms(g, P, t) {
  const pSky = P.lin(0, 9, { wob: .2, jit: .3 }); g.fillStyle = WC.LG(g, 0, 0, 0, 330, [[0, .45], [1, .85]], pSky); g.fillRect(0, 0, BW, 330);
  const pRoof = P.lin(-12, 6, { wob: .1 }), pWall = P.lin(90, 7, { wob: .1 }), pSmoke = P.brad(0, 0, 8, { wob: .1 }), pFeather = P.dash(30, 6, 14, .7, { jit: .3 }), pHide = P.lin(0, 5, {}), pCrate = P.lin(90, 5, {});
  r3bGround(g, P, 330, .55);
  // the sheds: long low barns running away to the horizon (more appear on "farms")
  const more = r3bE(t, r3bB.farms, .4);
  const n = 2 + Math.round(more * 3);
  for (let i = n - 1; i >= 0; i--) {
    const k = Math.pow(.62, i), bx = 300 + (1 - k) * 760, by = 330 - (1 - k) * 60, w = 900 * k, h = 130 * k;
    g.beginPath(); g.rect(bx, by - h, w, h); fillWith(g, WC.LG(g, 0, by - h, 0, by, [[0, .6], [1, .3]], pWall)); ink(g, 3 * k + 1);
    pth(g, [[bx - 20 * k, by - h], [bx + w + 20 * k, by - h], [bx + w - 10 * k, by - h - 50 * k], [bx + 10 * k, by - h - 50 * k]]); fillWith(g, WC.C(.25, pRoof)); ink(g, 3 * k + 1);
    for (let j = 0; j < 9; j++) { g.beginPath(); g.rect(bx + 30 * k + j * 96 * k, by - h * .7, 40 * k, 14 * k); fillWith(g, Cw(0)); }
    // chimneys that puff on "factory"
    for (const cx of [bx + w * .25, bx + w * .7]) {
      g.beginPath(); g.rect(cx - 12 * k, by - h - 120 * k, 24 * k, 80 * k); fillWith(g, Cw(0));
      const pf = r3bE(t, r3bB.factory + i * .05, .5);
      if (pf > 0) for (let q = 0; q < 4; q++) { const ph = (t * .5 + q * .25) % 1; ell(g, cx + ph * 90 * k, by - h - 130 * k - ph * 120 * k, (16 + ph * 30) * k * pf, (12 + ph * 22) * k * pf); fillWith(g, WC.C(.7, pSmoke)); ink(g, 1.5); }
    }
  }
  // the gate and the flagpole: on "king's" the crown flag runs up (the red)
  const fl = r3bE(t, r3bB.kings82, .35);
  line(g, 200, 330, 200, 40); ink(g, 6);
  const fy = lerp(300, 60, fl);
  g.beginPath(); g.moveTo(204, fy); g.lineTo(330, fy + 10 + Math.sin(t * 6) * 6); g.lineTo(204, fy + 80); g.closePath(); fillWith(g, Cw(1, 0, 1)); ink(g, 3);
  coinCrown(g, 250, fy + 40, 18, 16);
  for (let x = 30; x < 1240; x += 40) { line(g, x, 300, x, 360); ink(g, 4); } line(g, 0, 312, BW, 312); ink(g, 3); line(g, 0, 344, BW, 344); ink(g, 3);
  // a crate of hens on "chickens", a crate of pigs on "pigs", set down in front
  const hk = r3bPop(t, r3bB.chickens - r3bF, .22), pk = r3bPop(t, r3bB.pigs - r3bF, .22);
  if (hk > 0) {
    g.save(); g.translate(380, 560); g.scale(hk, hk); g.translate(-380, -560);
    g.beginPath(); g.rect(200, 400, 360, 160); fillWith(g, WC.C(.85, pCrate)); ink(g, 4);
    for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) eHen(g, 270 + c * 110, 450 + r * 70, .55, pFeather);
    for (let i = 0; i <= 9; i++) { line(g, 200 + i * 40, 400, 200 + i * 40, 560); ink(g, 3); } line(g, 200, 480, 560, 480); ink(g, 4);
    g.restore();
  }
  if (pk > 0) {
    g.save(); g.translate(860, 560); g.scale(pk, pk); g.translate(-860, -560);
    g.beginPath(); g.rect(640, 410, 440, 150); fillWith(g, WC.C(.85, pCrate)); ink(g, 4);
    for (let c = 0; c < 3; c++) r3bPig(g, 720 + c * 140, 550, .62, { hide: pHide });
    for (let i = 0; i <= 11; i++) { line(g, 640 + i * 40, 410, 640 + i * 40, 560); ink(g, 3); }
    g.restore();
  }
}

// ---------- 11. inside the sheds: the window is shut on the sun; on "harm" the cages shake under one bulb ----------
function r3bBlockInside(g, P, t) {
  const pDark = P.lin(0, 7, { wob: .2, jit: .3 }), pBulb = P.ray(620, 120, 50, { jit: .3 });
  const bulb = r3bE(t, r3bB.l84, .2);
  g.fillStyle = bulb > 0 ? WC.RG(g, 620, 120, 10, 620, 120, 700, [[0, .9], [.4, .45], [1, .1]], pBulb) : WC.LG(g, 0, 0, 0, BH, [[0, .25], [1, .12]], pDark); g.fillRect(0, 0, BW, BH);
  const pSun = P.ray(620, 90, 24, { jit: .3 }), pFeather = P.dash(30, 6, 14, .7, { jit: .3 }), pHide = P.lin(0, 5, {}), pBeam = P.lin(0, 6, { wob: .1 });
  // the low roof beams
  for (let i = 0; i < 4; i++) { const y = 20 + i * 14; g.beginPath(); g.rect(0, y, BW, 8); fillWith(g, WC.C(.5, pBeam)); ink(g, 2); }
  // the small high window and the sun outside: boards go across on "never", "see", "sun"
  g.beginPath(); g.rect(540, 50, 160, 110); fillWith(g, WC.RG(g, 620, 105, 4, 620, 105, 120, [[0, .98], [1, .6]], pSun)); ink(g, 5);
  ell(g, 620, 105, 28, 28); fillWith(g, Cw(1)); ink(g, 3);
  [[r3bB.never83, -.12], [r3bB.see, .1], [r3bB.sun, 0]].forEach(([s, a], i) => {
    const u = r3bE(t, s, .15); if (u <= 0) return;
    g.save(); g.translate(620, 75 + i * 30); g.rotate(a); g.beginPath(); g.rect(-100 * u, -16, 200 * u, 32); fillWith(g, WC.C(.35, pBeam)); ink(g, 3); ell(g, -86 * u, 0, 4, 4); fillWith(g, Cw(0)); ell(g, 86 * u, 0, 4, 4); fillWith(g, Cw(0)); g.restore();
  });
  if (r3bAt(t, r3bB.sun)) { g.beginPath(); g.rect(540, 50, 160, 110); fillWith(g, Cw(0)); ink(g, 5); for (let i = 0; i < 3; i++) { g.beginPath(); g.rect(530, 64 + i * 32, 180, 26); fillWith(g, WC.C(.35, pBeam)); ink(g, 3); } }
  // the bulb, from "Where" of the next line; it swings on "harm"
  const sh = r3bAt(t, r3bB.harm) ? Math.sin((t - r3bB.harm) * 14) * Math.exp(-(t - r3bB.harm) * 2.5) : 0;
  if (bulb > 0) { const bx = 620 + sh * 60; line(g, 620, 60, bx, 170); ink(g, 3); ell(g, bx, 186, 18, 22); fillWith(g, Cw(1)); ink(g, 3); }
  // left: three tiers of cages with hens; right: narrow pens with pigs. On "harm" they shake and the hens crouch
  const shake = r3bAt(t, r3bB.harm) ? Math.sin((t - r3bB.harm) * 50) * 5 * Math.exp(-(t - r3bB.harm) * 3) : 0;
  const crouch = r3bE(t, r3bB.harm, .2);
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
    const x = 40 + c * 120 + shake, y = 200 + r * 120;
    g.beginPath(); g.rect(x, y, 110, 110); fillWith(g, Cw(.85)); ink(g, 3);
    g.save(); g.beginPath(); g.rect(x, y, 110, 110); g.clip(); eHen(g, x + 62, y + 70 + crouch * 6, .72, pFeather); g.restore();
    for (let i = 1; i < 6; i++) { line(g, x + i * 18.3, y, x + i * 18.3, y + 110); ink(g, 2.6); }
  }
  for (let c = 0; c < 3; c++) {
    const x = 700 + c * 175 - shake;
    g.beginPath(); g.rect(x, 330, 160, 250); fillWith(g, Cw(.8)); ink(g, 3);
    r3bPig(g, x + 82, 560, .7, { hide: pHide }, { down: crouch });
    for (let i = 0; i < 4; i++) { line(g, x, 360 + i * 50, x + 160, 360 + i * 50); ink(g, 4); }
    line(g, x, 330, x, 580); ink(g, 6); line(g, x + 160, 330, x + 160, 580); ink(g, 6);
  }
}

// ---------- 12. the conveyor into the dark (the red of the doorway on "bloody"); the grinder and the bucket ----------
function r3bBlockConveyor(g, P, t) {
  const pWall = P.lin(90, 9, { wob: .2, jit: .3 });
  g.fillStyle = WC.LG(g, 0, 0, 0, 470, [[0, .2], [1, .45]], pWall); g.fillRect(0, 0, BW, 470);
  const pSteel = P.lin(0, 5, { wob: .05 }), pCrate = P.lin(90, 5, {}), pGear = P.rad(560, 80, 5, {}), pMeat = P.dash(0, 4, 8, .6, { jit: .3 }), pBun = P.rad(1060, 520, 6, {});
  r3bGround(g, P, 470, .4);
  // the doorway under the machine: black; on "bloody" its inside goes red (the second plate, no more than that)
  const red = r3bE(t, r3bB.bloody, .25);
  g.beginPath(); g.roundRect(450, 200, 200, 270, [100, 100, 0, 0]); fillWith(g, Cw(0, 0, red)); ink(g, 6);
  // the gear over the door turns from "barbaric"
  const ga = r3bAt(t, r3bB.barbaric) ? (t - r3bB.barbaric) * 3 : 0;
  g.save(); g.translate(550, 110); g.rotate(ga);
  g.beginPath(); for (let i = 0; i < 24; i++) { const a = i / 24 * TAU, r = i % 2 ? 62 : 76; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); fillWith(g, WC.C(.6, pGear)); ink(g, 3);
  ell(g, 0, 0, 22, 22); fillWith(g, Cw(0)); g.restore();
  // the press over the doorway: comes down on "cruel"
  const pr = r3bAt(t, r3bB.cruel) ? Math.max(0, 1 - Math.abs((t - r3bB.cruel + r3bF) / .12 - 1)) : 0;
  g.beginPath(); g.rect(430, 170 + pr * 40, 240, 34); fillWith(g, WC.LG(g, 0, 170, 0, 204, [[0, .8], [1, .2]], pSteel)); ink(g, 4);
  r3bImpact(g, 550, 200, 130, 200, 10, 4, r3bHit(t, r3bB.cruel, .3));
  // the belt from the left into the doorway: crates of animals ride it, moving from "dying"
  const run = r3bAt(t, r3bB.dying) ? (t - r3bB.dying) * (r3bAt(t, r3bB.barbaric) ? 260 : 150) : 0;
  g.save(); g.beginPath(); g.rect(0, 0, 470, BH); g.clip();
  for (let i = 0; i < 6; i++) {
    const x = ((i * 150 + run) % 900) - 380;
    g.beginPath(); g.rect(x, 330, 120, 90); fillWith(g, WC.C(.8, pCrate)); ink(g, 3);
    for (let k = 1; k < 6; k++) { line(g, x + k * 20, 330, x + k * 20, 420); ink(g, 2.4); }
  }
  g.restore();
  g.beginPath(); g.rect(0, 420, 470, 22); fillWith(g, Cw(0)); for (let x = 10; x < 470; x += 40) { ell(g, x - (run % 40), 431, 7, 7); cutl(g, 2); }
  // the grinder (right): a hopper and a spout; patties drop onto the tray from "meat"
  pth(g, [[780, 150], [1000, 150], [930, 300], [850, 300]]); fillWith(g, WC.LG(g, 780, 0, 1000, 0, [[0, .2], [.45, .8], [1, .15]], pSteel)); ink(g, 4);
  g.beginPath(); g.rect(840, 300, 100, 110); fillWith(g, WC.LG(g, 840, 0, 940, 0, [[0, .2], [.5, .75], [1, .15]], pSteel)); ink(g, 4);
  g.beginPath(); g.rect(940, 360, 70, 40); fillWith(g, Cw(0));
  g.beginPath(); g.rect(960, 520, 260, 18); fillWith(g, Cw(.8, pSteel)); ink(g, 3); // the tray
  if (r3bAt(t, r3bB.meat)) {
    const d = t - r3bB.meat + r3bF, nP = Math.min(6, 1 + Math.floor(d * 2.6 + (r3bAt(t, r3bB.comes) ? 1 : 0)));
    for (let i = 0; i < nP; i++) { const age = d - i / 2.6, y = age < .25 ? lerp(400, 506, age / .25) : 506; ell(g, 1000 + (i % 3) * 70, y - Math.floor(i / 3) * 18, 32, 11); fillWith(g, WC.C(.25, pMeat)); ink(g, 2.4); }
  }
  // the bucket tips into the hopper on "urine"; flies circle the tray from "stool" (plain)
  const tip = r3bE(t, r3bB.urine, .3);
  if (r3bAt(t, r3bB.l86)) {
    g.save(); g.translate(1100, 120); g.rotate(-tip * 1.9);
    g.beginPath(); g.moveTo(-50, -60); g.lineTo(50, -60); g.lineTo(40, 30); g.lineTo(-40, 30); g.closePath(); fillWith(g, WC.LG(g, -50, 0, 50, 0, [[0, .3], [.5, .8], [1, .25]], pSteel)); ink(g, 3.5);
    g.beginPath(); g.arc(0, -60, 50, Math.PI, 0); ink(g, 3);
    g.restore();
    if (tip > .6) for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(1040 - i * 8, 110 + i * 6); g.quadraticCurveTo(980 - i * 10, 130, 900 + i * 12, 160 + (t * 300 + i * 40) % 40); ink(g, 3); }
  }
  const fz = r3bE(t, r3bB.stool, .2);
  if (fz > 0) for (let i = 0; i < 5; i++) {
    const a = t * (4 + i) + i * 1.3, fx = 1080 + Math.cos(a) * (60 + i * 14), fy = 440 + Math.sin(a * 1.3) * (30 + i * 6);
    ell(g, fx, fy, 6, 4); fillWith(g, Cw(0)); for (const s of [-1, 1]) { ell(g, fx + s * 6, fy - 6, 6, 3, s * .6); fillWith(g, Cw(1)); ink(g, 1.5); }
    g.beginPath(); for (let k = 0; k < 6; k++) g.lineTo(fx + k * 5 - 12, fy + 10 + Math.sin(k * 2 + a) * 4); ink(g, 1.2 * fz);
  }
  if (fz > 0) for (let i = 0; i < 3; i++) { const sx = 1020 + i * 70; g.beginPath(); for (let k = 0; k <= 7; k++) g.lineTo(sx + Math.sin(k * 1.3 + t * 5 + i) * 10, 500 - k * 18 * fz); ink(g, 3); }
}
