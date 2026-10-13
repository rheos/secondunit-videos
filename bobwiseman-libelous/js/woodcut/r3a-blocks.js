// Round 3 (wood-A): the woodblocks for stanzas 6 and 7, pages 29-43. Each is drawFn(g, P, t) painting the tone map
// for song time t (block-local units, BW x BH). Times come from RB (r3a-timing.js), read off lines.json.
// No more than 15 patterns per block (WC.reg); every pattern is registered at the top of its block.

// a wall of upright planks or striped paper, and a floor of boards (helpers for the interiors)
function r3aWall(g, P, y1, sp = 12, tone0 = .7, tone1 = .35) { const id = P.lin(90, sp, { wob: .2, jit: .3 }); g.fillStyle = WC.LG(g, 0, 0, 0, y1, [[0, tone0], [1, tone1]], id); g.fillRect(0, 0, BW, y1); }
function r3aFloor(g, P, y0, tone = .55) { const id = P.lin(0, 7, { wob: .12 }); g.beginPath(); g.rect(0, y0, BW, BH - y0); fillWith(g, WC.LG(g, 0, y0, 0, BH, [[0, tone + .15], [1, tone - .3]], id)); line(g, 0, y0, BW, y0); ink(g, 5); }

// ---------- 29. the television: Rapunzel in her tower on the screen; her hair comes down; the show is stopped,
// the picture rolls, a starburst, and the clown pops up ----------
function r3aBlockTV(g, P, t) {
  r3aWall(g, P, 470, 13, .75, .4);
  r3aFloor(g, P, 470, .55);
  const pats = { wood: P.lin(0, 6, { wob: .2 }), face: P.blk(120, 6, {}), hat: P.xh(40, -40, 10, {}), hair: P.dash(80, 5, 12, .7, {}), coat: P.lin(90, 8, { wob: .15 }) };
  const pSky = P.lin(0, 7, {}), pStone = P.lin(0, 5, { wob: .2 }), pBraid = P.dash(90, 4, 10, .6, {}), pStar = P.ray(650, 268, 60, { jit: .3 }), pSnow = P.dash(0, 4, 18, .5, { jit: .5 });
  const rp = r3aIn(t, RB.rapunzel, .25, 1.5), hairU = ease(t, RB.hair - .03, RB.down + .3);
  const tower = (gx, gy, sw, sh) => {
    g.fillStyle = WC.LG(g, 0, gy, 0, gy + sh, [[0, .98], [1, .62]], pSky); g.fillRect(gx, gy, sw, sh);
    g.beginPath(); g.moveTo(gx, gy + sh); for (let x = 0; x <= sw; x += 12) g.lineTo(gx + x, gy + sh * .8 - 18 * Math.sin(x * .02)); g.lineTo(gx + sw, gy + sh); g.closePath(); fillWith(g, Cw(.4)); ink(g, 2.5);
    const tx = gx + sw * .58, tw = 96, ty = gy + 96;
    g.beginPath(); g.rect(tx - tw / 2, ty, tw, gy + sh - ty); fillWith(g, WC.LG(g, tx - tw / 2, 0, tx + tw / 2, 0, [[0, .3], [.45, .85], [1, .25]], pStone)); ink(g, 3);
    for (let r = 0; r < 12; r++) { const yy = ty + 22 + r * 24; line(g, tx - tw / 2, yy, tx + tw / 2, yy); ink(g, 1.4); }
    pth(g, [[tx - tw / 2 - 16, ty], [tx + tw / 2 + 16, ty], [tx, ty - 84]]); fillWith(g, WC.LG(g, tx - 60, 0, tx + 60, 0, [[0, .55], [1, .15]], pStone)); ink(g, 3);
    line(g, tx, ty - 84, tx, ty - 110); ink(g, 2.5); pth(g, [[tx, ty - 110], [tx + 24, ty - 104], [tx, ty - 98]]); fillWith(g, Cw(0));
    // the window and Rapunzel in it
    const wx = tx - 22, wy = ty + 30;
    g.beginPath(); g.rect(wx, wy, 44, 50); fillWith(g, Cw(0));
    if (rp > .02) {
      g.save(); g.beginPath(); g.rect(wx - 30, wy - 40, 104, 90); g.clip();
      const hy = wy + 50 - 34 * rp;
      ell(g, tx, hy, 15, 17); fillWith(g, WC.LG(g, tx - 15, 0, tx + 15, 0, [[0, 1], [.6, 1], [1, .6]], pats.face)); ink(g, 2.4);
      g.beginPath(); g.moveTo(tx - 16, hy + 2); g.quadraticCurveTo(tx - 18, hy - 22, tx, hy - 20); g.quadraticCurveTo(tx + 18, hy - 22, tx + 16, hy + 2); g.quadraticCurveTo(tx, hy - 10, tx - 16, hy + 2); g.closePath(); fillWith(g, Cw(.2)); ink(g, 2);
      ell(g, tx - 5, hy, 2, 2.4); fillWith(g, Cw(0)); ell(g, tx + 5, hy, 2, 2.4); fillWith(g, Cw(0));
      g.beginPath(); g.moveTo(tx - 4, hy + 8); g.quadraticCurveTo(tx, hy + 11, tx + 4, hy + 8); ink(g, 1.6);
      g.restore();
    }
    g.beginPath(); g.rect(wx - 6, wy + 50, 56, 8); fillWith(g, Cw(1)); ink(g, 2.4);
    // the braid: plaited, dropping from the sill to the foot of the tower
    if (hairU > 0) {
      const L = (gy + sh - wy - 60) * hairU, n = Math.max(1, Math.floor(L / 14));
      for (let i = 0; i < n; i++) { const by = wy + 58 + i * 14 + 7, bx = tx + 8 + Math.sin(i * .5 + t * 3) * 3 * hairU; ell(g, bx + (i % 2 ? 3 : -3), by, 8, 9, i % 2 ? .5 : -.5); fillWith(g, WC.C(.45, pBraid)); ink(g, 1.8); }
    }
  };
  r3aTV(g, 400, 34, 640, 430, pats, (gg, sx, sy, sw, sh) => {
    if (t < RB.stopped - R3A_F) { tower(sx, sy, sw, sh); return; }
    if (t < RB.ad - R3A_F) {
      const d = t - RB.stopped + R3A_F;
      if (d < .55) { // the picture rolls: the frame slides up, its bar crosses the screen
        const off = (d / .55 * 1.6 % 1) * sh;
        g.save(); g.translate(0, -off); tower(sx, sy, sw, sh); g.translate(0, sh); tower(sx, sy, sw, sh); g.restore();
        g.beginPath(); g.rect(sx, sy + sh - off - 10, sw, 20); fillWith(g, Cw(0));
      } else { // then snow
        g.fillStyle = Cw(.5, pSnow); g.fillRect(sx, sy, sw, sh);
        const f = Math.round(t * 24);
        for (let i = 0; i < 90; i++) { const x = sx + rnd(f, i, 1) * sw, y = sy + rnd(f, i, 2) * sh; line(g, x, y, x + 8 + rnd(f, i, 3) * 26, y); g.strokeStyle = Cw(rnd(f, i, 4) < .5 ? 0 : 1); g.lineWidth = 3; g.stroke(); }
      }
      return;
    }
    // the ad: a starburst, then the clown pops up on his word
    g.save(); g.translate(sx + sw / 2, sy + sh * .55);
    g.fillStyle = WC.RG(g, 0, 0, 10, 0, 0, sw * .8, [[0, .96], [1, .2]], pStar); g.fillRect(-sw, -sh, 2 * sw, 2 * sh);
    g.restore();
    const ck = r3aIn(t, RB.clown, .22, 1.8);
    if (ck > .01) r3aClown(g, sx + sw / 2, sy + sh + 10 + (1 - ck) * 200, .92, { bust: true, grin: 1, wink: t > RB.clown + .5 && t < RB.clown + .75 }, pats);
  });
  // the child on the floor, seen from behind, watching; leans in when the clown comes on
  const lean = ease(t, RB.clown, RB.clown + .3) * 14 - r3aBump(t, RB.stopped, .3) * 10;
  g.save(); g.translate(180, 600 - lean * .3);
  g.beginPath(); g.moveTo(-110, 20); g.quadraticCurveTo(-104, -96, -40, -110); g.lineTo(40, -110); g.quadraticCurveTo(104, -96, 110, 20); g.closePath(); fillWith(g, WC.LG(g, -110, 0, 110, 0, [[0, .3], [.5, .08], [1, .02]], pats.coat)); ink(g, 3);
  ell(g, lean * .4, -170, 52, 58); fillWith(g, WC.C(.22, pats.hair)); ink(g, 3);
  for (const s of [-1, 1]) { ell(g, s * 52 + lean * .4, -162, 9, 15); fillWith(g, Cw(1)); ink(g, 2.4); }
  g.restore();
}

// ---------- 30. the clown tells the children; they all turn into the same smiling child; each gets a bun ----------
const R3A_KIDS = [[540, 1.35, 0], [680, 1.75, 1], [810, 1.2, 2], [950, 1.6, 1], [1100, 1.4, 0]];
function r3aBlockAd(g, P, t) {
  bgRays(g, P, 280, 200, 64, 1100, .92, .25);
  groundFlicks(g, P, 540, .55);
  const pats = { face: P.blk(120, 6, {}), hat: P.xh(40, -40, 10, {}), hair: P.dash(80, 5, 12, .7, {}), smock: P.lin(90, 6, { wob: .2 }), bun: P.lin(0, 5, {}) };
  const tell = ease(t, RB.telling - .03, RB.telling + .15) * (1 - ease(t, RB.eat - .25, RB.eat - .05));
  const offer = ease(t, RB.eat - .1, RB.eat + .15);
  r3aClown(g, 250, 560, .84, { point: tell, arm: offer, grin: 1, hop: r3aBump(t, RB.l44, .3) * 10 }, pats);
  if (offer > .3) r3aBun(g, 250 + 198 * .84, 560 - (290 - 4) * .84 - 30, 70, {}, pats);
  // the children: different sizes and hair, until "normal" makes them one child, five times
  const m = ease(t, RB.normal - .03, RB.normal + .1);
  g.save(); g.beginPath(); g.rect(0, 0, BW, 546); g.clip();
  R3A_KIDS.forEach(([x, k0, hair], i) => {
    const up = r3aIn(t, RB.kids + i * .08, .22, 1.4); if (up <= .01) return;
    const k = lerp(k0, 1.55, m);
    r3aKid(g, x, 545 + (1 - up) * 340, k, { dir: -1, hair: m > .5 ? 1 : hair, grin: m > .5 ? 1 : 0, bun: t >= RB.meat - .03 + i * .05, hop: r3aBump(t, RB.little + i * .04, .25) * 12 }, pats);
  });
  g.restore();
  if (t > RB.normal - .03 && t < RB.normal + .4) R3A_KIDS.forEach(([x], i) => r3aBurst(g, x, 545 - 160 * 1.55, 60, 110, 8, 4, 1 - ease(t, RB.normal, RB.normal + .4), i * .3));
}

// ---------- 31. the shop: a counter, lamps, and a row of swivel seats; the seats go bright and spin;
// on "seat" a child hops onto the middle one and turns with it ----------
const R3A_STOOLS = [200, 420, 640, 860, 1080];
function r3aBlockStore(g, P, t) {
  r3aWall(g, P, 330, 12, .7, .45);
  const pCounter = P.lin(0, 7, { wob: .15 }), pFloor = P.xh(45, -45, 16, { wob: .1 }), pBoard = P.lin(0, 5, {}), pLamp = P.lin(0, 4, {});
  const pats = { post: P.lin(90, 4, {}), smock: P.lin(90, 6, { wob: .2 }), face: P.blk(120, 6, {}), hair: P.dash(80, 5, 12, .7, {}), bun: P.lin(0, 5, {}) };
  g.beginPath(); g.rect(0, 470, BW, BH - 470); fillWith(g, WC.LG(g, 0, 470, 0, BH, [[0, .75], [1, .4]], pFloor)); line(g, 0, 470, BW, 470); ink(g, 5);
  // the hatch behind the counter and its board: a bun drawn on it
  g.beginPath(); g.rect(380, 70, 480, 180); fillWith(g, Cw(0)); g.beginPath(); g.rect(396, 86, 448, 148); fillWith(g, WC.C(.9, pBoard)); ink(g, 2);
  r3aBun(g, 520, 176, 110, {}, pats); for (let i = 0; i < 4; i++) { line(g, 640, 120 + i * 30, 820, 120 + i * 30); ink(g, 3); }
  // lamps: globes hanging; they light on "store"
  const lit = ease(t, RB.store - .03, RB.store + .12);
  for (const lx of [210, 620, 1030]) {
    line(g, lx, 0, lx, 40); ink(g, 3);
    ell(g, lx, 62, 30, 24); fillWith(g, lit > .02 ? Cw(1) : WC.RG(g, lx - 8, 54, 2, lx, 62, 34, [[0, .9], [1, .2]], pLamp)); ink(g, 3);
    if (lit > .02) for (let i = 0; i < 9; i++) { const a = .2 + i / 8 * (Math.PI - .4); gouge(g, lx + Math.cos(a) * 40, 62 + Math.sin(a) * 34, lx + Math.cos(a) * (40 + 40 * lit), 62 + Math.sin(a) * (34 + 34 * lit), 3, 1); }
  }
  // the counter
  g.beginPath(); g.rect(40, 270, 1160, 30); fillWith(g, WC.LG(g, 0, 270, 0, 300, [[0, .95], [1, .4]], pCounter)); ink(g, 4);
  g.beginPath(); g.rect(60, 300, 1120, 170); fillWith(g, WC.LG(g, 0, 300, 0, 470, [[0, .35], [1, .1]], pCounter)); ink(g, 4);
  for (let i = 1; i < 8; i++) { line(g, 60 + i * 140, 310, 60 + i * 140, 460); cutl(g, 3); }
  // the seats
  const bright = ease(t, RB.brightly - .03, RB.coloured + .15);
  const sw = (i) => { const d = t - RB.swiveling + .03 + i * .05; return d <= 0 ? 0 : 7.5 * (1 - Math.exp(-d * 1.1)) * (i % 2 ? -1 : 1); };
  const kidOn = ease(t, RB.seat - .03, RB.seat + .2);
  R3A_STOOLS.forEach((x, i) => {
    const spin = sw(i) + i * .7;
    if (i === 2 && kidOn > 0) { // the child sits on the middle seat (drawn before it, so the seat hides the legs), turning with it
      const dir = Math.cos(spin - 2 * .7) >= 0 ? 1 : -1;
      const jx = lerp(745, x, kidOn), jy = lerp(565, 575 - 80 * 1.5 + 60, kidOn) - Math.sin(kidOn * Math.PI) * 60;
      r3aKid(g, jx, jy, 1.5, { dir: kidOn < 1 ? -1 : dir, hair: 2, grin: 1, arm: kidOn >= 1 ? 'up' : 'down' }, pats);
    }
    r3aStool(g, x, 575, 80, spin, bright, pats);
    if (bright > 0 && bright < 1) r3aBurst(g, x, 575 - 120, 95, 140, 10, 4, bright, i * .4, .5);
  });
  if (kidOn <= 0) r3aKid(g, 745, 565, 1.5, { dir: -1, hair: 2, grin: 0 }, pats);
}

// ---------- 32. the child between mama and daddy: tugs one on each "mama", the other on each "daddy";
// each parent looks down a little more each time ----------
function r3aBlockMama(g, P, t) {
  r3aWall(g, P, 500, 12, .72, .4);
  r3aFloor(g, P, 500, .55);
  const pSky = P.lin(0, 6, {}), pFrame = P.lin(90, 5, {});
  const pats = { coat: P.lin(90, 8, { wob: .15 }), shawl: P.dash(30, 5, 12, .7, {}), legs: P.lin(90, 6, {}), face: P.blk(120, 6, {}), smock: P.lin(90, 6, { wob: .2 }), hair: P.dash(80, 5, 12, .7, {}) };
  // a window behind them
  g.beginPath(); g.rect(500, 60, 240, 220); fillWith(g, Cw(0)); g.beginPath(); g.rect(514, 74, 212, 192); fillWith(g, WC.C(.92, pSky));
  line(g, 620, 74, 620, 266); ink(g, 8); line(g, 514, 170, 726, 170); ink(g, 8);
  g.beginPath(); g.rect(490, 280, 260, 18); fillWith(g, WC.C(.6, pFrame)); ink(g, 3);
  const ma = .5 * ease(t, RB.mama1 - .03, RB.mama1 + .2) + .5 * ease(t, RB.mama2 - .03, RB.mama2 + .2);
  const da = .5 * ease(t, RB.daddy1 - .03, RB.daddy1 + .2) + .5 * ease(t, RB.daddy2 - .03, RB.daddy2 + .2);
  r3aParent(g, 300, 570, 1.55, { woman: true, dir: 1, look: Math.max(ma, ease(t, RB.too - .05, RB.too + .2)) }, pats);
  r3aParent(g, 950, 570, 1.55, { woman: false, dir: -1, look: Math.max(da, ease(t, RB.too - .05, RB.too + .2)) }, pats);
  // the child: faces mama from her first word, daddy from his; a tug on each; a hop on "Tell" and "now"; both arms up on "too"
  const toDad = t >= RB.daddy1 - .03, dir = t < RB.mama1 - .03 ? 1 : toDad ? 1 : -1;
  const tug = Math.max(r3aBump(t, RB.mama1, .35), r3aBump(t, RB.mama2, .35), r3aBump(t, RB.daddy1, .35), r3aBump(t, RB.daddy2, .35));
  const hop = Math.max(r3aBump(t, RB.tell, .3), r3aBump(t, RB.now, .3), r3aBump(t, RB.too, .3)) * 18;
  const kx = 625 + dir * tug * 34;
  r3aKid(g, kx, 570, 1.85, { dir, hair: 2, grin: t >= RB.too - .03 ? 1 : 0, hop, arm: t >= RB.too - .03 ? 'up' : (t >= RB.mama1 - .03 ? 'tug' : 'down') }, pats);
}

// ---------- 33. the children's party: balloons rise, the children come up behind the table, paper crowns pop on;
// the clown at the end taps out the instructions; on "do" a bun lands on every plate ----------
const R3A_PARTY = [180, 320, 460, 600, 740];
const R3A_BALLOONS = [[150, 120, .6], [270, 90, .3], [400, 140, .7], [540, 80, .4], [690, 120, .6], [830, 70, .3]];
function r3aBlockParty(g, P, t) {
  r3aWall(g, P, 430, 14, .8, .5);
  const pCloth = P.lin(90, 6, { wob: .25 }), pFlag = P.lin(45, 5, {});
  const pats = { smock: P.lin(90, 6, { wob: .2 }), face: P.blk(120, 6, {}), hair: P.dash(80, 5, 12, .7, {}), hat: P.xh(40, -40, 10, {}), balloon: P.lin(30, 6, { wob: .2 }), bun: P.lin(0, 5, {}) };
  r3aFloor(g, P, 520, .5);
  // bunting across the top
  g.beginPath(); g.moveTo(0, 30); g.quadraticCurveTo(620, 90, BW, 30); ink(g, 3);
  for (let i = 0; i < 14; i++) { const u = (i + .5) / 14, x = u * BW, y = 30 + 60 * 4 * u * (1 - u) * .5 + 2; pth(g, [[x - 26, y], [x + 26, y + 2], [x, y + 48]]); fillWith(g, i % 2 ? Cw(1) : WC.C(.3, pFlag)); ink(g, 2.4); }
  // balloons rise from behind the table on "want", sway
  R3A_BALLOONS.forEach(([x, y, tn], i) => {
    const u = ease(t, RB.want - .03 + i * .06, RB.want + .5 + i * .06); if (u <= 0) return;
    r3aBalloon(g, x, lerp(520, y, u) + Math.sin(t * 2.4 + i) * 6, 40, Math.sin(t * 1.7 + i * 2), tn, pats);
  });
  // the children come up behind the table; crowns pop on at "party"
  g.save(); g.beginPath(); g.rect(0, 0, BW, 420); g.clip();
  R3A_PARTY.forEach((x, i) => {
    const up = r3aIn(t, RB.childrens + i * .06, .22, 1.4); if (up <= .01) return;
    const cr = r3aIn(t, RB.party + i * .05, .2, 1.8);
    r3aKid(g, x, 520 + (1 - up) * 300, 1.3, { dir: i < 3 ? 1 : -1, hair: i % 3, grin: 1, crown: cr > .02 ? cr : 0, arm: t >= RB.doW - .03 ? 'up' : 'down', hop: r3aBump(t, RB.party + i * .05, .25) * 10 }, pats);
  });
  g.restore();
  // the table: a white cloth with a scalloped hem, a plate at every place
  g.beginPath(); g.rect(60, 400, 800, 22); fillWith(g, Cw(1)); ink(g, 4);
  g.beginPath(); g.moveTo(60, 422); g.lineTo(60, 480); for (let i = 0; i <= 16; i++) g.quadraticCurveTo(60 + (i - .5) * 50, 500, 60 + i * 50, 480); g.lineTo(860, 422); g.closePath();
  fillWith(g, WC.LG(g, 0, 422, 0, 500, [[0, .95], [1, .6]], pCloth)); ink(g, 3.5);
  R3A_PARTY.forEach((x, i) => {
    ell(g, x, 404, 46, 9); fillWith(g, Cw(1)); ink(g, 2.4);
    const b = r3aIn(t, RB.doW + i * .05, .2, 1.8); if (b > .02) r3aBun(g, x, 386 - (1 - Math.min(1, b)) * 60, 56 * Math.min(1.1, b), {}, pats);
  });
  // the clown at the head of the table taps a finger on every word from "this" to "do"
  const taps = r3aL(47).words.filter(w => w.s >= RB.thisW - 1e-6).map(w => w.s);
  const tap = taps.reduce((a, s) => Math.max(a, r3aBump(t, s, .18)), 0);
  r3aClown(g, 1030, 590, .8, { point: ease(t, RB.thisW - .2, RB.thisW) , grin: 1, hop: tap * 8 }, pats);
}

// ---------- 34. the king's gold goes into the television; thirty times as much pours back out ----------
const R3A_PILE = (() => { const L = []; for (let i = 0; i < 30; i++) L.push({ col: i % 3, row: Math.floor(i / 3) }); return L; })();
function r3aBlockGold(g, P, t) {
  bgGlow(g, P, 600, 200, 900, .95, .25, 10, 0);
  groundFlicks(g, P, 520, .5);
  const pSack = P.rad(470, 420, 7, {}), pEdge = P.lin(90, 4, {}), pMill = P.lin(0, 3, {});
  const pats = { wood: P.lin(0, 6, { wob: .2 }), face: P.blk(120, 6, {}), hat: P.xh(40, -40, 10, {}), hair: P.dash(80, 5, 12, .7, {}) };
  // the television on the right, the clown on it
  const sx0 = 830, sy0 = 150;
  const wink = (t > RB.trick - .03 && t < RB.trick + .35);
  const scr = r3aTV(g, sx0, sy0, 340, 250, pats, (gg, sx, sy, sw, sh) => {
    gg.fillStyle = Cw(.9); gg.fillRect(sx, sy, sw, sh);
    r3aClown(g, sx + sw / 2, sy + sh + 6, .5, { bust: true, grin: 1, wink }, pats);
  });
  if (t > RB.trick - .03 && t < RB.trick + .45) r3aBurst(g, sx0 + 170, sy0 + 125, 150, 210, 14, 5, 1 - ease(t, RB.trick, RB.trick + .45));
  // the coin slot on top of the cabinet
  g.beginPath(); g.rect(sx0 + 140, sy0 - 6, 60, 8); fillWith(g, Cw(0));
  // the sack beside the king, on "gold"
  const sk = r3aIn(t, RB.gold, .22, 1.6);
  if (sk > .01) { g.save(); g.translate(500, 520); g.scale(sk, sk); drawSack(g, P, 0, 0, 150, 170, pSack, true); g.restore(); }
  // coins arc from the sack into the slot, from "spent" to "trick"
  for (let i = 0; i < 26; i++) {
    const ts = RB.spent - .03 + i * (RB.trick - RB.spent) / 26, u = (t - ts) / .5; if (u < 0 || u > 1) continue;
    const x = lerp(500, sx0 + 170, u), y = lerp(370, sy0 - 4, u) - Math.sin(u * Math.PI) * 170;
    drawCoin(g, x, y, 15, t * 12 + i, pEdge);
  }
  // ... and back out of the screen at the king, from "Brought"
  for (let i = 0; i < 60; i++) {
    const ts = RB.l49 - .03 + i * .03, u = (t - ts) / .45; if (u < 0 || u > 1) continue;
    const tx = 140 + (i % 5) * 50, ty = 470;
    const x = lerp(sx0 + 120 + (i % 4) * 30, tx, u), y = lerp(sy0 + 140, ty, u) - Math.sin(u * Math.PI) * (120 + (i % 3) * 40);
    drawCoin(g, x, y, 16, t * 14 + i * 1.3, pEdge);
  }
  // the king, smiling at the end; his crown hops on "king" and on "quick"
  const q = r3aBump(t, RB.quick, .35);
  drawKing(g, P, 300, 420, .95, { smile: t >= RB.n30 - .03, crownUp: (r3aBump(t, RB.king, .3) + q) * 16, hands: 'belly' });
  // thirty coins stack up in front of him on "30" ... "times" ... "investment"
  const step = (RB.quick - RB.n30) / 30;
  R3A_PILE.forEach((c, i) => {
    const ts = RB.n30 - .03 + i * step; if (t < ts) return;
    const drop = Math.max(0, 1 - (t - ts) / .1);
    drawStackCoin(g, 150 + c.col * 150, 548 - c.row * 13 - drop * 60, 40, 12, 12, pMill, c.row === 9);
  });
  if (q > 0) for (let i = 0; i < 12; i++) { const a = -Math.PI + i / 11 * Math.PI; gouge(g, 300 + Math.cos(a) * 170, 230 + Math.sin(a) * 140, 300 + Math.cos(a) * (210 + 50 * q), 230 + Math.sin(a) * (170 + 40 * q), 5, 1); }
}

// ---------- 35. the ink cellar: a weight comes down on the barrels on "tons"; the bungs pop on "ink";
// a barrel tips over on "going" and the ink runs down the drain on "waste" ----------
const R3A_BARRELS = [[300, 440], [470, 440], [640, 440], [385, 290], [555, 290], [470, 140]];
const R3A_SPURT = (() => { const L = [], R = mulberry(5353); for (let i = 0; i < 30; i++) L.push({ b: i % 6, vx: (R() - .5) * 420, vy: -260 - R() * 260, r: 6 + R() * 9, dl: R() * .15 }); return L; })();
function r3aBlockInk(g, P, t) {
  r3aWall(g, P, 515, 15, .6, .3);
  const pFloor = P.lin(0, 6, { wob: .15 }), pMetal = P.lin(90, 6, {}), pGrate = P.lin(0, 4, {});
  const pats = { stave: P.lin(90, 7, { wob: .15 }), lid: P.lin(0, 4, {}) };
  g.beginPath(); g.rect(0, 515, BW, BH - 515); fillWith(g, WC.LG(g, 0, 515, 0, BH, [[0, .7], [1, .35]], pFloor)); line(g, 0, 515, BW, 515); ink(g, 5);
  // the drain in the floor
  const dx = 1110, dy = 552;
  g.beginPath(); g.ellipse(dx, dy, 70, 18, 0, 0, TAU); fillWith(g, Cw(0)); for (let i = -2; i <= 2; i++) { line(g, dx + i * 24, dy - 14, dx + i * 24, dy + 14); cutl(g, 3); }
  // the weight comes down on the stack on "tons"
  const land = clamp((t - RB.tons + .12) / .12), squash = r3aBump(t, RB.tons, .25) * .06;
  g.save(); g.translate(0, 515); g.scale(1, 1 - squash); g.translate(0, -515);
  const spurtOn = t >= RB.ink - .03;
  R3A_BARRELS.forEach(([x, y], i) => r3aBarrel(g, x, y, 160, 150, { bung: spurtOn ? Math.min(1, (t - RB.ink + .03) * 4) : 0 }, pats));
  // ink runs down the barrels from the bungs
  if (spurtOn) R3A_BARRELS.forEach(([x, y]) => { const L = Math.min(110, (t - RB.ink) * 160); g.beginPath(); g.moveTo(x + 12, y - 70); g.lineTo(x + 20, y - 70 + L); ink(g, 9); ell(g, x + 20, y - 70 + L, 6, 8); fillWith(g, Cw(0)); });
  if (land > 0) {
    const wy = lerp(-200, 66, land * land);
    pth(g, [[400, wy], [540, wy], [520, wy - 110], [420, wy - 110]]); fillWith(g, WC.LG(g, 400, 0, 540, 0, [[0, .15], [.4, .75], [1, .1]], pMetal)); ink(g, 4);
    g.beginPath(); g.arc(470, wy - 128, 26, Math.PI, 0); g.lineWidth = 12; g.strokeStyle = Cw(0); g.stroke();
    if (land >= 1) r3aBurst(g, 470, 66, 90, 160, 12, 5, 1 - ease(t, RB.tons, RB.tons + .4), 0, .5);
  }
  g.restore();
  if (spurtOn) R3A_SPURT.forEach((s) => { // splashes of ink thrown up from the bungs
    const d = t - RB.ink + .03 - s.dl; if (d <= 0 || d > .9) return;
    const [bx, by] = R3A_BARRELS[s.b];
    const x = bx + 16 + s.vx * d, y = by - 80 + s.vy * d + 520 * d * d; if (y > 520) return;
    ell(g, x, y, s.r, s.r * 1.2); fillWith(g, Cw(0));
  });
  // the barrel at the right tips over on "going"; its ink runs along the floor into the drain
  const tip = ease(t, RB.going - .03, RB.going + .35), ang = -tip * Math.PI / 2;
  g.save(); g.translate(925, 515); g.rotate(ang); g.translate(-925, -515);
  r3aBarrel(g, 1000, 440, 150, 150, { bung: 0 }, pats);
  g.restore();
  if (tip > .6) {
    const fl = ease(t, RB.going + .2, RB.waste + .1);
    // the stream from the mouth to the floor, then the puddle running to the drain
    g.beginPath(); g.moveTo(770, 420); g.quadraticCurveTo(740, 470, 750, 520); ink(g, 22 * fl + 2);
    g.beginPath(); g.moveTo(700, 520); g.quadraticCurveTo(900, 512 + 30 * fl, lerp(760, dx, fl), 540); g.quadraticCurveTo(900, 560 + 10 * fl, 700, 548); g.closePath(); fillWith(g, Cw(0));
  }
  const wh = ease(t, RB.waste - .03, RB.waste + .3);
  if (wh > 0) for (let i = 0; i < 3; i++) { // the swirl down the drain
    g.beginPath(); for (let k = 0; k <= 30; k++) { const a = t * 9 + i * 2.1 + k * .25, r = 60 * (1 - k / 30); g.lineTo(dx + Math.cos(a) * r, dy + Math.sin(a) * r * .26); } cutl(g, 3 * wh);
  }
}

// ---------- 36. the printing house: the press pulled on "house"; an order slid across the counter on "order",
// sealed red on "placed"; the sign swings on "publishing" ----------
function r3aBlockPress(g, P, t) {
  r3aWall(g, P, 520, 12, .72, .4);
  const pWood = P.lin(90, 6, { wob: .15 }), pMetal = P.lin(0, 4, {}), pPaper = P.blk(0, 6, {}), pCounter = P.lin(0, 7, { wob: .15 }), pSign = P.lin(0, 5, {});
  const pats = { coat: P.lin(90, 8, { wob: .15 }), face: P.blk(120, 6, {}), legs: P.lin(90, 6, {}), shawl: P.dash(30, 5, 12, .7, {}) };
  r3aFloor(g, P, 520, .5);
  // the press: two uprights, the head, the screw, the platen over the bed
  const pull = r3aBump(t, RB.house, .5);
  for (const ux of [640, 900]) { g.beginPath(); g.rect(ux - 22, 40, 44, 480); fillWith(g, WC.LG(g, ux - 22, 0, ux + 22, 0, [[0, .2], [.5, .8], [1, .15]], pWood)); ink(g, 4); }
  g.beginPath(); g.rect(600, 40, 340, 60); fillWith(g, WC.LG(g, 0, 40, 0, 100, [[0, .8], [1, .2]], pWood)); ink(g, 4);
  g.beginPath(); g.rect(756, 100, 28, 140 + pull * 40); fillWith(g, WC.LG(g, 756, 0, 784, 0, [[0, .2], [.5, .9], [1, .2]], pMetal)); ink(g, 3);
  for (let i = 0; i < 6; i++) { line(g, 756, 110 + i * 22, 784, 120 + i * 22); ink(g, 2); }
  // the bar: swings round on the pull
  const ba = -.2 + pull * .9;
  g.save(); g.translate(770, 200); g.rotate(ba); g.beginPath(); g.rect(0, -8, 300, 16); fillWith(g, Cw(0)); line(g, 10, -3, 290, -3); cutl(g, 2); ell(g, 300, 0, 16, 16); fillWith(g, Cw(1)); ink(g, 3); g.restore();
  g.beginPath(); g.rect(680, 240 + pull * 40, 180, 40); fillWith(g, WC.LG(g, 0, 240, 0, 280, [[0, .8], [1, .2]], pWood)); ink(g, 4);
  g.beginPath(); g.rect(640, 360, 260, 40); fillWith(g, WC.LG(g, 0, 360, 0, 400, [[0, .7], [1, .2]], pWood)); ink(g, 4);
  g.beginPath(); g.rect(690, 340, 160, 20); fillWith(g, Cw(1)); ink(g, 2);
  // the pressman pulls the bar (his hand on its knob)
  const hx = 770 + Math.cos(ba) * 300, hy = 200 + Math.sin(ba) * 300;
  r3aParent(g, 1120, 560, 1.15, { woman: false, dir: -1, look: .3 }, pats);
  limb(g, [[1080, 260], [lerp(1080, hx, .5) + 20, lerp(260, hy, .5) + 30], [hx + 10, hy + 6]], 18); mitten(g, hx + 8, hy + 4, 11);
  // the hanging sign (a device: an open book), swinging on "publishing"
  const sa = Math.sin((t - RB.publishing) * 9) * .25 * Math.exp(-Math.max(0, t - RB.publishing) * 2.2) * (t > RB.publishing - .03 ? 1 : 0);
  g.save(); g.translate(260, 30); g.rotate(sa);
  line(g, -70, 0, -70, 40); ink(g, 3); line(g, 70, 0, 70, 40); ink(g, 3);
  g.beginPath(); g.rect(-120, 40, 240, 120); fillWith(g, WC.C(.75, pSign)); ink(g, 4); g.beginPath(); g.rect(-108, 52, 216, 96); ink(g, 2);
  pth(g, [[-60, 120], [0, 110], [0, 70], [-60, 80]]); fillWith(g, Cw(1)); ink(g, 3); pth(g, [[60, 120], [0, 110], [0, 70], [60, 80]]); fillWith(g, Cw(1)); ink(g, 3);
  g.restore();
  // the counter at the left; the order slides on, then the seal
  g.beginPath(); g.rect(30, 390, 520, 26); fillWith(g, WC.LG(g, 0, 390, 0, 416, [[0, .95], [1, .4]], pCounter)); ink(g, 4);
  g.beginPath(); g.rect(46, 416, 488, 104); fillWith(g, WC.LG(g, 0, 416, 0, 520, [[0, .35], [1, .1]], pCounter)); ink(g, 4);
  const os = ease(t, RB.order - .03, RB.order + .3);
  if (os > 0) {
    const ox = lerp(-200, 290, os);
    pth(g, [[ox - 110, 392], [ox + 110, 392], [ox + 130, 360], [ox - 90, 360]]); fillWith(g, WC.C(.97, pPaper)); ink(g, 2.6);
    for (let i = 0; i < 3; i++) { line(g, ox - 80 + i * 6, 370 + i * 8, ox + 80 + i * 6, 370 + i * 8); ink(g, 1.6); }
    if (os < 1) { limb(g, [[ox - 340, 372], [ox - 140, 376]], 26); mitten(g, ox - 128, 376, 14); }
    const st = r3aIn(t, RB.placed, .18, 1.6);
    if (st > .01) { waxSeal(g, ox + 60, 376, 20 * st); r3aBurst(g, ox + 60, 376, 34, 70, 9, 3, 1 - ease(t, RB.placed + .05, RB.placed + .45), 0, .5); }
  }
}

// ---------- 37. the man with the fist: the gauntlet comes up on "fist"; the wallet thumps down on "wallet" and swells on
// "big"; wheels drop out on "wheels", it rolls in on "came", its lid cranks up step by step to "lid" ----------
function r3aBlockWallet(g, P, t) {
  bgGlow(g, P, 600, 220, 900, .95, .2, 10, 0);
  groundFlicks(g, P, 540, .55);
  const pMetal = P.lin(90, 9, { wob: .1, jit: .2 }), pCuff = P.lin(0, 9, { wob: .1, jit: .2 });
  const pats = { coat: P.lin(90, 8, { wob: .15 }), legs: P.lin(90, 7, {}), face: P.blk(120, 7, {}), leather: P.lin(20, 6, { wob: .2 }) };
  // the wallet
  const wi = r3aIn(t, RB.wallet, .2, 1.4);
  if (wi > .01) {
    const big = lerp(.62, 1, r3aIn(t, RB.big, .25, 1.5));
    const roll = ease(t, RB.came - .03, RB.came + .6), x = lerp(560, 430, roll);
    const steps = [RB.adjustable, RB.adjustable + .25, RB.adjustable + .5, RB.adjustable + .75].filter(s => t >= s - .03).length;
    const lid = Math.min(1, steps * .2 + (t >= RB.lid - .03 ? .25 : 0));
    const wh = r3aIn(t, RB.wheels, .2, 1.6);
    const w = 500 * big, h = 250 * big, y = 540 - h / 2 - (wh > 0 ? h * .22 * wh * 1.7 : 0) - (1 - Math.min(1, wi)) * 400;
    r3aWallet(g, x, y, w, h, { wheels: wh, roll: -(x - 560) / (h * .22), lid }, pats);
    if (t > RB.wallet - .03 && t < RB.wallet + .4) r3aBurst(g, x, 540, w * .5, w * .5 + 70, 10, 5, 1 - ease(t, RB.wallet, RB.wallet + .4), Math.PI, .25);
  }
  // the man in the frock coat; the gauntlet up beside him on "fist"
  const mh = r3aBump(t, RB.man, .3) * 22;
  drawFrockMan(g, P, 1040, 540, 1.5, { hop: mh }, pats);
  const fk = r3aIn(t, RB.fist, .22, 1.6);
  if (fk > .01) {
    limb(g, [[1010, 540 - 184 * 1.5 - mh], [960, 260 - fk * 20], [920, 250 - fk * 40]], 26);
    gauntletFist(g, P, 880, 170 - fk * 40, .36 * fk, pMetal, pCuff);
    if (t < RB.fist + .4) r3aBurst(g, 880, 140 - fk * 40, 80, 130, 10, 4, 1 - ease(t, RB.fist, RB.fist + .4));
  }
}

// ---------- 38. the stacks: a couple of short stacks on "couple" and "hundred"; on "million" stacks shoot up across
// the whole block; on "stacks" the last row lands ----------
const R3A_COLS = [[90, .5], [210, .2], [330, 0], [450, .35], [570, .1], [690, .45], [810, .05], [930, .3], [1050, .15], [1160, .4]];
function r3aBlockStacks(g, P, t) {
  bgGlow(g, P, 620, 300, 900, .96, .3, 10, 0);
  groundFlicks(g, P, 540, .5);
  const pEdge = P.lin(0, 3, {}), pCov = P.lin(90, 5, { wob: .2 });
  const book = (x, y, w, i) => { g.beginPath(); g.rect(x - w / 2, y - 22, w, 22); fillWith(g, i % 3 ? Cw(0) : WC.C(.35, pCov)); ink(g, 2); g.beginPath(); g.rect(x - w / 2 + 6, y - 16, w - 22, 10); fillWith(g, WC.C(.9, pEdge)); };
  const stack = (x, n, seed) => { for (let i = 0; i < n; i++) book(x + (rnd(seed, i) - .5) * 10, 540 - i * 22, 100 + rnd(seed, i, 2) * 18, i + seed); };
  // the two short stacks
  const a = r3aIn(t, RB.couple1, .2, 1.5), b = r3aIn(t, RB.hundred, .2, 1.5);
  if (t < RB.million - .03) {
    if (a > .01) stack(520, Math.round(6 * Math.min(1, a)), 3);
    if (b > .01) stack(700, Math.round(6 * Math.min(1, b)), 5);
    const c2 = r3aIn(t, RB.couple2, .2, 1.5); if (c2 > .01) { stack(380, Math.round(4 * Math.min(1, c2)), 7); stack(840, Math.round(4 * Math.min(1, c2)), 9); }
  } else { // the million: every column rises to the sky
    R3A_COLS.forEach(([x, dl], i) => {
      const u = ease(t, RB.million - .03 + dl * .5, RB.stacks + .1 + dl * .3);
      stack(x, Math.max(6, Math.round(28 * u)), 11 + i);
    });
    if (t < RB.stacks + .4 && t > RB.stacks - .03) R3A_COLS.forEach(([x], i) => { for (const s of [-1, 1]) gouge(g, x + s * 60, 530, x + s * 110, 510 - (i % 2) * 10, 4 * (1 - ease(t, RB.stacks, RB.stacks + .4)), 1); });
  }
}

// ---------- 39. the book: it stands up in a burst of rays; the panel on its cover on "title"; it hops on "book";
// the two title words cut into the panel on their words ----------
function r3aBlockBook(g, P, t) {
  const glow = ease(t, RB.nutr - .03, RB.nutr + .2);
  bgRays(g, P, 620, 300, 72, 900, .7 + .26 * glow, .1);
  const pTable = P.lin(0, 7, { wob: .15 }), pats = { cover: P.lin(90, 6, { wob: .15 }) };
  g.beginPath(); g.rect(200, 500, 840, 30); fillWith(g, WC.LG(g, 0, 500, 0, 530, [[0, .9], [1, .4]], pTable)); ink(g, 4);
  g.beginPath(); g.rect(230, 530, 780, 60); fillWith(g, WC.LG(g, 0, 530, 0, 590, [[0, .3], [1, .05]], pTable)); ink(g, 4);
  const hop = r3aBump(t, RB.book56, .3) * 30;
  const lb = r3aIn(t, RB.title, .22, 1.4);
  r3aBook(g, 610, 296 - hop, 300, 410, { label: lb, words: R3A_TITLE, w1: r3aIn(t, RB.nutr, .16, 1.6), w2: r3aIn(t, RB.facts, .16, 1.6) }, pats);
  if (t > RB.nutr - .03 && t < RB.facts + .5) r3aBurst(g, 610, 296, 250, 300, 16, 4, glow * (1 - ease(t, RB.facts + .1, RB.facts + .5)), .1, 1.2);
}

// ---------- 40. the doctor: a coin flips to him on "hired"; he bows on "doctor"; the diploma unrolls on "PHD";
// he writes the intro on the open book; on "free" a tag swings on it (a coin struck through) ----------
function r3aBlockDoctor(g, P, t) {
  bgGlow(g, P, 300, 160, 900, .95, .3, 10, 0);
  r3aFloor(g, P, 540, .5);
  const pDesk = P.lin(0, 7, { wob: .15 }), pPage = P.lin(90, 5, {}), pEdge = P.lin(90, 4, {});
  const pats = { coat: P.lin(90, 8, { wob: .15 }), face: P.blk(120, 6, {}) };
  // the desk and the open book on it
  g.beginPath(); g.rect(110, 360, 560, 26); fillWith(g, WC.LG(g, 0, 360, 0, 386, [[0, .9], [1, .4]], pDesk)); ink(g, 4);
  for (const lx of [140, 620]) { g.beginPath(); g.rect(lx, 386, 26, 154); fillWith(g, WC.C(.3, pDesk)); ink(g, 3); }
  const bx = 470;
  pth(g, [[bx - 170, 362], [bx, 352], [bx, 300], [bx - 160, 310]]); fillWith(g, WC.LG(g, bx - 170, 0, bx, 0, [[0, .9], [1, 1]], pPage)); ink(g, 3);
  pth(g, [[bx + 170, 362], [bx, 352], [bx, 300], [bx + 160, 310]]); fillWith(g, Cw(1)); ink(g, 3);
  for (let i = 0; i < 4; i++) { line(g, bx - 140 + i * 2, 318 + i * 9, bx - 20, 314 + i * 9); ink(g, 1.5); }
  // the intro, written line by line on the right page from "wrote"
  const wr = ease(t, RB.wrote - .03, RB.intro + .6), nL = 5;
  for (let i = 0; i < nL; i++) {
    const u = clamp(wr * nL - i); if (u <= 0) break;
    g.beginPath(); for (let k = 0; k <= 24 * u; k++) { const x = bx + 20 + k * 5, y = 316 + i * 8 + Math.sin(k * 1.9 + i) * 2 + k * .3; k ? g.lineTo(x, y) : g.moveTo(x, y); } ink(g, 1.6);
  }
  // the doctor: bends to write from "wrote" until the book is done
  const write = ease(t, RB.wrote - .2, RB.wrote) * (1 - ease(t, RB.book59 - .2, RB.book59 + .1));
  const sc = ease(t, RB.phd - .03, RB.phd + .35) * (1 - ease(t, RB.l59 - .3, RB.l59));
  r3aDoctor(g, 820, 545, 1.15, { bow: r3aBump(t, RB.doctor, .4), write, scroll: sc }, pats);
  // the coin he is hired with, flipped in from the left
  const cu = (t - RB.hired + .03) / .45;
  if (cu > 0 && cu < 1.6) { const u = Math.min(1, cu), x = lerp(-20, 740, u), y = lerp(120, 330, u) - Math.sin(u * Math.PI) * 150; drawCoin(g, x, y, 16, t * 16, pEdge); }
  // the tag swings onto the book on "free": a coin struck through
  const fr = r3aIn(t, RB.free, .2, 1.4);
  if (fr > .01) {
    const sw = Math.sin((t - RB.free) * 8) * .35 * Math.exp(-Math.max(0, t - RB.free) * 2.5);
    g.save(); g.translate(bx + 160, 312); g.rotate(sw); g.scale(Math.min(1, fr), Math.min(1, fr));
    g.beginPath(); g.moveTo(0, 0); g.lineTo(10, 70); ink(g, 2);
    pth(g, [[-30, 70], [50, 70], [50, 170], [-30, 170]]); fillWith(g, Cw(1)); ink(g, 3); ell(g, 10, 82, 5, 5); ink(g, 2);
    drawCoin(g, 10, 128, 26, 0, null); line(g, -16, 156, 36, 100); ink(g, 7); line(g, -16, 156, 36, 100); cutl(g, 2);
    g.restore();
  }
}

// ---------- 41. the book lies open: the bun on the left page, its lettuce pointed at; a heart for health;
// on the right page a cup, water poured, a drop, and the fizz ----------
function r3aBlockOpen(g, P, t) {
  const pTable = P.lin(0, 9, { wob: .2 }), pGutter = P.lin(90, 5, {}), pShade = P.blk(100, 8, { jit: .2 }), pCoat = P.lin(90, 8, { wob: .15 }), pJug = P.lin(90, 6, {});
  const pats = { bun: P.lin(0, 5, {}), cup: P.lin(90, 5, {}) };
  g.fillStyle = WC.LG(g, 0, 0, 0, BH, [[0, .35], [1, .15]], pTable); g.fillRect(0, 0, BW, BH);
  // the spread
  for (const s of [-1, 1]) {
    g.beginPath(); g.moveTo(620, 60); g.quadraticCurveTo(620 + s * 280, 30, 620 + s * 560, 50); g.lineTo(620 + s * 560, 560); g.quadraticCurveTo(620 + s * 280, 540, 620, 575); g.closePath();
    fillWith(g, WC.LG(g, 620, 0, 620 + s * 560, 0, [[0, .7], [.12, 1], [1, 1]], pGutter)); ink(g, 4);
  }
  line(g, 620, 60, 620, 575); ink(g, 4);
  // text lines at the head of each page
  for (const s of [-1, 1]) for (let i = 0; i < 4; i++) { line(g, 620 + s * 90, 100 + i * 22, 620 + s * 500, 96 + i * 22); ink(g, 2.4); }
  // left page: the bun, its lettuce lit and pointed at
  const leaf = ease(t, RB.lettuce - .03, RB.lettuce + .1), hop = r3aBump(t, RB.bun, .3) * 22;
  r3aBun(g, 340, 360 - hop, 250, { leaf }, pats);
  if (leaf > 0) {
    for (let i = 0; i < 7; i++) { const a = Math.PI + .3 + i * .4; gouge(g, 340 + Math.cos(a) * 170, 360 + Math.sin(a) * 60, 340 + Math.cos(a) * (200 + 30 * leaf), 360 + Math.sin(a) * (80 + 20 * leaf), 3, 1); }
    const hx = lerp(-200, 20, r3aIn(t, RB.lettuce, .22, 1.2));
    pointingHand(g, P, hx, 420, .3, pShade, pCoat);
  }
  const hk = r3aIn(t, RB.health, .2, 1.8), beat = 1 + r3aBump(t, RB.joke, .25) * .3;
  if (hk > .01) r3aHeart(g, 500, 200, 34 * Math.min(1.2, hk) * beat, 1);
  // right page: the cup, the jug pours on the first "water", a drop on the second, the fizz on the last word
  const cp = r3aIn(t, RB.drink, .2, 1.6);
  if (cp > .01) {
    const pour = ease(t, RB.water1 - .1, RB.water1 + .2) * (1 - ease(t, RB.water2 - .3, RB.water2 - .1));
    // the jug
    g.save(); g.translate(1010, 210); g.rotate(-pour * .7);
    g.beginPath(); g.moveTo(-50, -70); g.lineTo(40, -70); g.quadraticCurveTo(60, 0, 50, 80); g.lineTo(-50, 80); g.quadraticCurveTo(-64, 0, -50, -70); g.closePath(); fillWith(g, WC.LG(g, -60, 0, 60, 0, [[0, .9], [.5, .55], [1, .2]], pJug)); ink(g, 3);
    pth(g, [[-50, -70], [-86, -84], [-50, -50]]); fillWith(g, Cw(1)); ink(g, 3);
    g.beginPath(); g.moveTo(48, -40); g.quadraticCurveTo(100, -20, 52, 40); ink(g, 8);
    g.restore();
    if (pour > .5) { g.beginPath(); g.moveTo(900, 170); g.quadraticCurveTo(870, 240, 880, 330); g.strokeStyle = Cw(1); g.lineWidth = 12; g.stroke(); ink(g, 2); for (let i = 0; i < 4; i++) { const y = 200 + ((t * 300 + i * 40) % 130); line(g, 878, y, 882, y + 12); ink(g, 2); } }
    const dr = (t - RB.water2 + .03) / .35; if (dr > 0 && dr < 1) { const y = lerp(150, 360, dr); g.beginPath(); g.moveTo(880, y - 30); g.quadraticCurveTo(900, y, 880, y + 10); g.quadraticCurveTo(860, y, 880, y - 30); fillWith(g, Cw(1)); ink(g, 3); }
    g.save(); g.translate(880, 520); g.scale(Math.min(1, cp), Math.min(1, cp)); g.translate(-880, -520);
    r3aCup(g, 880, 520, 170, { fizz: ease(t, RB.coke - .03, RB.coke + .2) }, pats, t);
    g.restore();
  }
}

// ---------- 42. the people: they come up reading their copies; they grin on "good" and hearts float up;
// on "print" the book on its stand glows, on "legit" the red seal is struck on it ----------
const R3A_CROWD = [[150, 1, 'cap'], [370, 1, 'bonnet'], [870, -1, 'bare'], [1090, -1, 'cap']];
function r3aBlockPeople(g, P, t) {
  bgGlow(g, P, 620, 140, 900, .96, .3, 10, 0);
  const pStand = P.lin(90, 6, { wob: .15 });
  const pats = { coat: P.lin(90, 8, { wob: .15 }), face: P.blk(120, 6, {}), hair: P.dash(80, 5, 12, .7, {}), cover: P.lin(90, 6, { wob: .15 }) };
  // the book on its stand, at the back in the middle
  g.beginPath(); g.rect(600, 300, 40, 290); fillWith(g, WC.LG(g, 600, 0, 640, 0, [[0, .2], [.5, .85], [1, .15]], pStand)); ink(g, 4);
  pth(g, [[500, 590], [740, 590], [700, 560], [540, 560]]); fillWith(g, WC.C(.3, pStand)); ink(g, 3);
  const pr = ease(t, RB.print - .03, RB.print + .15);
  if (pr > 0) for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; gouge(g, 620 + Math.cos(a) * 140, 190 + Math.sin(a) * 160, 620 + Math.cos(a) * (170 + 50 * pr), 190 + Math.sin(a) * (190 + 50 * pr), 5, 1); }
  r3aBook(g, 620, 190, 190, 240, { label: 1 }, pats);
  const st = r3aIn(t, RB.legit, .15, 1.8);
  if (st > .01) { waxSeal(g, 630, 260, 34 * st); r3aBurst(g, 630, 260, 50, 100, 12, 4, 1 - ease(t, RB.legit + .05, RB.legit + .5)); }
  // the people come up, reading; they smile on "good"
  g.save(); g.beginPath(); g.rect(0, 0, BW, BH); g.clip();
  R3A_CROWD.forEach(([x, dir, hat], i) => {
    const up = r3aIn(t, RB.people + i * .06, .25, 1.3);
    const lean = ease(t, RB.felt - .05, RB.felt + .2) * 8;
    r3aPerson(g, x - dir * lean, 470 + (1 - up) * 280, 1.45, { dir, hat, smile: ease(t, RB.good - .03, RB.good + .12), book: true }, pats);
  });
  g.restore();
  // hearts float up from them after "good"
  const d = t - RB.good + .03;
  if (d > 0) R3A_CROWD.forEach(([x], i) => { for (let k = 0; k < 2; k++) { const dd = d - k * .35; if (dd <= 0 || dd > 2.2) continue; r3aHeart(g, x + Math.sin(dd * 3 + i) * 16, 330 - dd * 120, 16, 1); } });
}

// ---------- 43. the counter: they order on "ordered" and "more"; fries pile up on every tray from "fries";
// on "never" they look away from the empty tip jar; on "tip" a fly circles it ----------
const R3A_DINERS = [[170, 'cap'], [400, 'bonnet'], [630, 'bare']];
function r3aBlockFries(g, P, t) {
  r3aWall(g, P, 330, 12, .75, .45);
  const pCounter = P.lin(0, 7, { wob: .15 }), pTray = P.lin(0, 4, {}), pGlass = P.lin(90, 5, {});
  const pats = { coat: P.lin(90, 8, { wob: .15 }), face: P.blk(120, 6, {}), hair: P.dash(80, 5, 12, .7, {}), carton: P.lin(90, 4, {}) };
  // the diners behind the counter, facing the jar (right) until "never"
  const away = t >= RB.never - .03;
  R3A_DINERS.forEach(([x, hat], i) => {
    const arm = Math.max(r3aBump(t, RB.ordered + i * .05, .45), r3aBump(t, RB.more + i * .05, .4));
    r3aPerson(g, x, 300, 1.5, { dir: away ? -1 : 1, hat, smile: t < RB.never - .03 ? 1 : 0, armUp: arm }, pats);
  });
  g.beginPath(); g.rect(30, 400, 1180, 30); fillWith(g, WC.LG(g, 0, 400, 0, 430, [[0, .95], [1, .4]], pCounter)); ink(g, 4);
  g.beginPath(); g.rect(46, 430, 1148, 160); fillWith(g, WC.LG(g, 0, 430, 0, 590, [[0, .35], [1, .08]], pCounter)); ink(g, 4);
  for (let i = 1; i < 8; i++) { line(g, 46 + i * 143, 440, 46 + i * 143, 580); cutl(g, 3); }
  // trays, and the fries multiplying on them
  R3A_DINERS.forEach(([x], i) => {
    g.beginPath(); g.roundRect(x - 100, 380, 200, 22, 6); fillWith(g, WC.C(.6, pTray)); ink(g, 3);
    for (let k = 0; k < 4; k++) {
      const s = r3aIn(t, RB.fries + i * .06 + k * .18, .18, 1.8); if (s <= .01) continue;
      g.save(); g.translate(x - 60 + k * 40, 384); g.scale(Math.min(1.1, s), Math.min(1.1, s)); r3aFries(g, 0, 0, 46, pats); g.restore();
    }
  });
  // the tip jar: glass, empty
  const jx = 1000, jy = 400;
  g.beginPath(); g.moveTo(jx - 60, jy - 150); g.lineTo(jx + 60, jy - 150); g.quadraticCurveTo(jx + 70, jy - 75, jx + 62, jy); g.lineTo(jx - 62, jy); g.quadraticCurveTo(jx - 70, jy - 75, jx - 60, jy - 150); g.closePath();
  fillWith(g, WC.LG(g, jx - 70, 0, jx + 70, 0, [[0, .8], [.2, 1], [.7, .95], [1, .6]], pGlass)); ink(g, 3.5);
  g.beginPath(); g.ellipse(jx, jy - 150, 60, 12, 0, 0, TAU); fillWith(g, Cw(1)); ink(g, 3);
  g.beginPath(); g.moveTo(jx - 40, jy - 130); g.quadraticCurveTo(jx - 48, jy - 70, jx - 40, jy - 20); cutl(g, 5);
  g.beginPath(); g.rect(jx - 40, jy - 100, 80, 40); fillWith(g, Cw(1)); ink(g, 2.4);
  if (t > RB.never - .03 && t < RB.never + .45) r3aBurst(g, jx, jy - 80, 100, 150, 10, 4, 1 - ease(t, RB.never, RB.never + .45));
  // the fly
  if (t >= RB.tip - .1) { const a = (t - RB.tip) * 6.5; g.save(); g.translate(jx + Math.cos(a) * 95, jy - 205 + Math.sin(a) * 34); g.scale(1.8, 1.8); r3aFly(g, 0, 0, a + Math.PI / 2, Math.sin(t * 60) > 0 ? 1 : 0); g.restore(); }
}

// pages 28-43: page 28 is story.js's own block (stanza 5's last), drawn exactly as looks/woodcut.html draws it
const R3A_BLOCKS = [];
R3A_BLOCKS[28] = BLOCKS[28];
[r3aBlockTV, r3aBlockAd, r3aBlockStore, r3aBlockMama, r3aBlockParty, r3aBlockGold,
  r3aBlockInk, r3aBlockPress, r3aBlockWallet, r3aBlockStacks, r3aBlockBook, r3aBlockDoctor, r3aBlockOpen, r3aBlockPeople, r3aBlockFries]
  .forEach((f, k) => { R3A_BLOCKS[29 + k] = f; });
if (R3A_BLOCKS.length !== R3A_NPAGES) throw new Error('r3a block count ' + R3A_BLOCKS.length);
