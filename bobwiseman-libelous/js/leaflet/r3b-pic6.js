// Round 3, leaf-B: the stanza-6 page's picture box, panel by panel (PBW x PBH, ground at GY). Pure function of t.
// The children's page of the leaflet: the TV and the ad, what the ad tells the kids, the store, the nagging, the
// party, and where the king's gold went. Fineliner on the paste-up, black only (the copier does the rest).
function r3bLeafPic6(p, t, pi) {
  const B = R3BLEAF, E = EARLY;
  if (pi === 0) { // the living room: the TV, kids on the rug; the puppet tower, then the picture rolls and the ad comes on
    pen(p, ell(900, GY + 6, 640, 40, Math.PI * 1.02, Math.PI * 1.98), 1, 4, 3001); // the rug's back edge
    const s = r3bLeafTV(p, 900, GY - 14, 600, 320, pr(t, R3BLEAF_T6 - .7, .6), 3002);
    p.save(); r3bLeafRRPath(p, s.x + 4, s.y + 4, s.w - 8, s.h - 8, s.r - 4); p.clip();
    const show = (q, oy) => { // the puppet show: a cardboard tower, a window, her head in it, then the braid
      const tx = s.x + s.w * .42, top = s.y + 24 + oy, bot = s.y + s.h + oy;
      pen(q, poly([[tx - 70, bot], [tx - 70, top + 30], [tx + 70, top + 30], [tx + 70, bot]]), pr(t, R3BLEAF_T6 - .4, .35), 5, 3010);
      for (let k = 0; k < 4; k++) pen(q, poly([[tx - 70 + k * 40, top + 30], [tx - 70 + k * 40, top], [tx - 50 + k * 40, top], [tx - 50 + k * 40, top + 30]]), pr(t, R3BLEAF_T6 - .2 + k * .03, .1), 4.5, 3011 + k);
      for (let k = 0; k < 6; k++) pen(q, seg(tx - 60 + (k % 3) * 45, top + 80 + Math.floor(k / 3) * 50, tx - 30 + (k % 3) * 45, top + 80 + Math.floor(k / 3) * 50, 2), pr(t, R3BLEAF_T6, .2), 3, 3016 + k);
      const wx = tx + 10, wy = top + 52; // the window and Rapunzel in it
      pen(q, ell(wx, wy + 10, 30, 34, Math.PI, TAU).concat(poly([[wx + 30, wy + 10], [wx + 30, wy + 46], [wx - 30, wy + 46], [wx - 30, wy + 10]])), pr(t, R3BLEAF_T6 - .1, .2), 4.5, 3025);
      if (t >= B.rap - E) {
        const u = pr(t, B.rap - E, .3); r3bLeafHead(wx, wy + 22, 14);
        pen(q, ell(wx, wy + 22, 14, 15), u, 4, 3026); pen(q, ell(wx, wy + 16, 20, 18, Math.PI * 1.05, Math.PI * 1.95), u, 4, 3027);
        if (u >= 1) { q.fillStyle = '#000'; q.beginPath(); q.arc(wx - 5, wy + 21, 2.2, 0, TAU); q.arc(wx + 5, wy + 21, 2.2, 0, TAU); q.fill(); }
        if (t >= B.tower - E) for (let k = 0; k < 3; k++) pen(q, seg(wx + 40 + k * 4, wy - 4 - k * 12, wx + 60 + k * 8, wy - 12 - k * 16, 2), pr(t, B.tower - E + k * .04, .08), 3.5, 3028 + k); // a little wave
      }
      if (t >= B.hair - E) { // the braid drops out of the window, a plait of loops, to the foot of the tower
        const L = ease(t, B.hair - E, B.down + .35) * (bot - wy - 50), n = Math.floor(L / 14);
        for (let i = 0; i < n; i++) pen(q, ell(wx + 26 + (i % 2) * 6, wy + 44 + i * 14, 8, 9), 1, 3.5, null);
        if (n > 0) pen(q, seg(wx + 22, wy + 36, wx + 30, wy + 44, 2), 1, 4, 3032);
      }
    };
    if (t < B.stopped - E) show(p, 0);
    else if (t < B.ad - E) { // the picture rolls: the frame slides up over and over, a black bar between frames
      const off = ((t - B.stopped + E) * 700) % (s.h + 26);
      show(p, -off); show(p, s.h + 26 - off);
      p.fillStyle = '#000'; p.fillRect(s.x, s.y + s.h - off, s.w, 26);
    } else { // the ad: a sunburst card, then the clown pops up in front of it
      const cx = s.x + s.w / 2, cy = s.y + s.h * .55;
      for (let k = 0; k < 16; k++) { const a = k / 16 * TAU; pen(p, seg(cx + Math.cos(a) * 30, cy + Math.sin(a) * 30, cx + Math.cos(a) * 260, cy + Math.sin(a) * 260, 3), pr(t, B.ad - E + k * .01, .1), k % 2 ? 3 : 6, 3040 + k); }
      if (t >= B.clown - E) { const up = easeOutBack(pr(t, B.clown - E, .22), 1.6); r3bLeafClown(p, cx, s.y + s.h + 20 + (1 - up) * 200, 210, 1, 3060, { armL: [1.9, .5], armR: [1.9, .5] }); }
    }
    p.restore();
    [[400, 0], [540, 1], [1260, 2], [1400, 0]].forEach(([x, hair], k) => r3bLeafKidBack(p, x, PBH + 6, 140, pr(t, R3BLEAF_T6 - .6 + k * .05, .4), 3100 + k * 7, hair));
    if (t >= B.clown) for (const x of [400, 540, 1260, 1400]) for (let k = 0; k < 2; k++) pen(p, seg(x - 30 + k * 60, PBH - 150, x - 44 + k * 88, PBH - 172, 2), pr(t, B.clown + .05, .1), 3.5, x + k); // the kids sit up
  } else if (pi === 1) { // the clown hands it out; a line of different kids turns into the same smiling kid
    pen(p, seg(0, GY, PBW, GY, 30), 1, 5, 3201);
    const give = ease(t, B.eat - E, B.eat + .2);
    const hands = r3bLeafClown(p, 330, GY, 340, pr(t, B.l44 - E, .45), 3202, { armL: [.3, .2], armR: [lerp(.6, 1.5, give), lerp(.6, 0, give)] });
    if (t >= B.l44) r3bLeafBurger(p, hands.R[0] + 40, hands.R[1] + 20, 90, pr(t, B.l44 + .2, .2), 3203);
    const own = [{ woman: true, pony: true }, { glasses: true }, { woman: true, bun: true }, {}, { woman: true, scarf: true }];
    for (let k = 0; k < 5; k++) {
      const x = 760 + k * 220, same = t >= B.normal - E + k * .05;
      const o = Object.assign({ x, y: GY, h: same ? 215 : 190 + (k % 3) * 18, look: -.6, mouth: same ? 'smile' : 'line', armL: [.5, .6] }, same ? {} : own[k]);
      r3bLeafPerson(p, o, pr(t, B.kids - E + k * .06, .35), same ? 3300 : 3220 + k * 13);
      if (t >= B.meat - E) { const hy = GY - o.h * .45; r3bLeafBurger(p, x - o.h * .27, hy, 62, pr(t, B.meat - E + k * .05, .12), 3260 + k); }
    }
  } else if (pi === 2) { // the store: a counter, a menu board of burger pictures, a row of swivel stools that light up and spin
    pen(p, seg(0, GY, PBW, GY, 30), 1, 5, 3401);
    const us = pr(t, B.l45 - E, .4);
    pen(p, seg(110, 168, 1690, 168, 30), us, 6, 3402); pen(p, seg(110, 182, 1690, 182, 30), us, 3.5, 3403);
    for (let k = 0; k < 6; k++) pen(p, seg(170 + k * 280, 182, 170 + k * 280, GY, 4), pr(t, B.l45 + k * .03, .15), 3, 3404 + k);
    if (t >= B.store - E) { // the menu board up on the wall: three burger pictures, no words
      const u = pr(t, B.store - E, .25); pen(p, poly([[560, 14], [1240, 10], [1240, 140], [560, 144]], true), u, 5, 3420);
      for (let k = 0; k < 3; k++) r3bLeafBurger(p, 680 + k * 220, 116, 120, pr(t, B.store + .1 + k * .06, .15), 3421 + k);
    }
    const modes = [1, 2, 3, 4, 5, 2], when = [B.brightly, B.brightly + .14, B.brightly + .28, B.coloured, B.coloured + .14, B.coloured + .28];
    for (let k = 0; k < 6; k++) {
      const x = 260 + k * 256, sp = t >= B.swivel - E ? (t - B.swivel + E) * (7 + k) * (k % 2 ? 1 : -1) : 0;
      const spin = t >= B.swivel - E ? clamp(1 - (t - B.seat) / .8) : 0;
      if (k === 3 && t >= B.seat - E) { // a kid hops up onto this one
        const hop = ease(t, B.seat - E, B.seat + .2), sy = GY - 200 * .86; // feet drop behind the seat: sitting on it
        r3bLeafPerson(p, { x, y: lerp(GY, sy + 46, hop) - Math.sin(hop * Math.PI) * 30, h: 160, woman: true, pony: true, mouth: 'smile', look: 0 }, 1, 3460);
      }
      r3bLeafStool(p, x, GY, 200, pr(t, B.l45 - E + k * .05, .35), 3430 + k * 5, t >= when[k] - E ? modes[k] : 0, .3 + sp, spin);
    }
  } else if (pi === 3) { // the nagging: mum, then dad, each name sung twice, each time a tug and shout marks
    pen(p, seg(0, GY, PBW, GY, 30), 1, 5, 3501);
    const tugL = t >= B.mama2 - E && t < B.daddy1 - E, tugR = t >= B.daddy2 - E;
    const kidArmL = tugL ? [1.45, .1] : [.4, .3], kidArmR = tugR ? [1.45, .1] : [.4, .3];
    const stomp = t >= B.now - E ? Math.max(0, 1 - (t - B.now) / .25) : 0;
    r3bLeafPerson(p, { x: 900, y: GY - stomp * 14, h: 200, woman: true, pony: true, mouth: t >= B.mama1 - E ? 'o' : 'line', look: tugR || t >= B.daddy1 - E ? .9 : -.9, armL: kidArmL, armR: kidArmR }, pr(t, B.l46 - E, .35), 3510);
    if (stomp > 0) for (let k = 0; k < 3; k++) pen(p, seg(840 + k * 60, GY - 6, 820 + k * 80, GY - 26, 2), 1, 4, 3511 + k);
    const shout = (x, sd, t0) => { for (let k = 0; k < 3; k++) pen(p, poly([[x, 110 + k * 26], [x + sd * 30, 100 + k * 30], [x + sd * 22, 118 + k * 30], [x + sd * 54, 110 + k * 34]]), pr(t, t0 + k * .05, .1), 4, 3520 + k + (sd > 0 ? 9 : 0)); };
    if (t >= B.mama1 - E) shout(830, -1, B.mama1 - E);
    if (t >= B.mama2 - E) shout(790, -1, B.mama2 - E);
    if (t >= B.daddy1 - E) shout(970, 1, B.daddy1 - E);
    if (t >= B.daddy2 - E) shout(1010, 1, B.daddy2 - E);
    const look = t >= B.too - E;
    r3bLeafPerson(p, { x: 520, y: GY, h: 330, woman: true, mouth: t >= B.mama2 ? 'o' : 'line', look: look ? .9 : .3, armR: t >= B.mama2 ? [.9, .3] : [.15, .1] }, pr(t, B.mama1 - E, .35), 3540);
    if (t >= B.daddy1 - E - .1) r3bLeafPerson(p, { x: 1290, y: GY, h: 340, mouth: t >= B.daddy2 ? 'o' : 'line', look: look ? -.9 : -.3, armL: t >= B.daddy2 ? [.9, .3] : [.15, .1] }, pr(t, B.daddy1 - E - .1, .35), 3560);
  } else if (pi === 4) { // the party: kids behind a table; hats, balloons, a burger each, a paper crown for one
    const xs = [520, 720, 920, 1120, 1320];
    if (t >= B.party - E) for (let k = 0; k < 4; k++) { // balloons on strings, either side of the table
      const bx = [250, 380, 1460, 1590][k], by = 70 + (k % 2) * 26 - ease(t, B.party - E + k * .04, B.party + .6) * 20, u = pr(t, B.party - E + k * .04, .15);
      pen(p, ell(bx, by, 34, 42), u, 4.5, 3600 + k); pen(p, poly([[bx - 5, by + 42], [bx, by + 50], [bx + 5, by + 42]]), u, 3.5, 3610 + k);
      pen(p, quad([bx, by + 50], [bx + 18, by + 110], [bx - 6, by + 170], 8), u, 3, 3620 + k);
      if (k % 3 === 1 && u >= 1) hatch(p, ell(bx, by, 34, 42), .7, 9, 1, 3, 3630 + k);
    }
    xs.forEach((x, k) => {
      const h = 250 + (k % 2) * 16, r = h * .1, hy = GY - h + r;
      r3bLeafPerson(p, { x, y: GY, h, woman: k % 2 === 0, pony: k === 2, mouth: t >= B.party ? 'smile' : 'line', look: (k - 2) * .2 }, pr(t, B.l47 - E + k * .05, .35), 3650 + k * 13);
      if (k === 2 && t >= B.doit - E) { // the crown lands on the middle one
        const d = easeOutBack(pr(t, B.doit - E, .2), 1.4); pen(p, poly(crownPts(x, hy - r * .55 - (1 - d) * 70, r * 1.9, r * .95), true), 1, 5, 3700);
      } else if (t >= B.childrens - E) { // a cone party hat
        const u = pr(t, B.childrens - E + k * .05, .12); pen(p, poly([[x - r * .72, hy - r * .62], [x + r * .1, hy - r * 2.3], [x + r * .72, hy - r * .62]], true), u, 4.5, 3710 + k);
        if (u >= 1) { p.fillStyle = '#000'; p.beginPath(); p.arc(x + r * .1, hy - r * 2.35, 7, 0, TAU); p.fill(); }
      }
    });
    const ty = 250; p.fillStyle = '#fff'; p.fillRect(380, ty, 1080, GY - ty); // the table and its cloth (hides their legs)
    pen(p, seg(360, ty, 1480, ty, 30), pr(t, B.l47 - E, .3), 6, 3720);
    const sc = []; for (let i = 0; i <= 24; i++) sc.push([380 + i * 45, ty + 40 + (i % 2) * 14]); pen(p, sc, pr(t, B.l47, .3), 4, 3721);
    pen(p, seg(380, ty, 380, GY, 3), pr(t, B.l47, .2), 5, 3722); pen(p, seg(1460, ty, 1460, GY, 3), pr(t, B.l47, .2), 5, 3723);
    if (t >= B.what - E) xs.forEach((x, k) => r3bLeafBurger(p, x, ty - 2, 80, pr(t, B.what - E + k * .08, .12), 3730 + k));
    pen(p, seg(0, GY, PBW, GY, 30), 1, 5, 3601);
  } else if (pi === 5) { // the king pays: coins arc from his hand into the TV, where the clown does his trick
    pen(p, seg(0, GY, PBW, GY, 30), 1, 5, 3801);
    r3bLeafKing(p, 330, GY, 300, pr(t, B.l48 - E, .4), 3802, { armR: t >= B.spent - E ? 1.4 : .5 });
    if (t >= B.gold - E) for (let k = 0; k < 3; k++) r3bLeafCoins(p, 560 + k * 70, GY, 5 + k * 2, 30, pr(t, B.gold - E + k * .06, .15), 3810 + k * 50);
    const s = r3bLeafTV(p, 1350, GY, 460, 290, pr(t, B.l48 - E + .1, .4), 3820);
    p.save(); r3bLeafRRPath(p, s.x + 4, s.y + 4, s.w - 8, s.h - 8, s.r - 4); p.clip();
    const trick = ease(t, B.doing - E, B.trick); r3bLeafClown(p, s.x + s.w / 2, s.y + s.h + 30, 220, pr(t, B.l48, .3), 3830, { armL: [lerp(.3, 2.4, trick), .3], armR: [lerp(.3, 2.4, trick), .3] });
    p.restore();
    if (t >= B.spent - E) for (let i = 0; i < 9; i++) { // a stream of coins along an arc, king to TV
      const u = ((t - B.spent + E) * 1.6 + i / 9) % 1, a = [480, 170], c = [s.x + 30, s.y + 40], m = [(a[0] + c[0]) / 2, -60];
      const x = (1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * m[0] + u * u * c[0], y = (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * m[1] + u * u * c[1];
      if (x < c[0] - 4) pen(p, ell(x, y, 16, 7 + 6 * Math.abs(Math.sin(u * 9))), 1, 3.5, null);
    }
    if (t >= B.trick - E) for (let k = 0; k < 4; k++) { // sparkles round the set
      const sx = [s.x - 40, s.x + s.w + 120, s.x + s.w * .3, s.x + s.w + 60][k], sy2 = [s.y + 20, s.y + 40, s.y - 20, s.y + s.h - 10][k], u = pr(t, B.trick - E + k * .05, .1), R = 24;
      pen(p, seg(sx - R, sy2, sx + R, sy2, 2), u, 4, 3840 + k); pen(p, seg(sx, sy2 - R, sx, sy2 + R, 2), u, 4, 3845 + k);
    }
  } else { // thirty times back: one small stack beside him, then thirty stacks pop up; a big arrow home
    pen(p, seg(0, GY, PBW, GY, 30), 1, 5, 3901);
    const happy = t >= B.quick - E;
    r3bLeafKing(p, 220, GY, 290, 1, 3902, { armL: happy ? 2.2 : .5, armR: happy ? 2.2 : .5 });
    r3bLeafCoins(p, 420, GY, 3, 30, 1, 3903);
    for (let j = 0; j < 30; j++) { // three rows of ten, back rows higher and smaller
      const row = 2 - Math.floor(j / 10), col = j % 10, sc = 1 - row * .16, x = 600 + col * 112 + row * 30, y = GY - row * 52;
      const u = t >= B.thirty - E + j * .028 ? 1 : 0; if (!u) continue;
      const pop = easeOutBack(pr(t, B.thirty - E + j * .028, .1), 2);
      r3bLeafCoins(p, x, y + (1 - pop) * 20, 7, 30 * sc, 1, 3910 + j * 13);
    }
    if (t >= B.back - E) { // the arrow from the stacks back to the king
      const a = quad([1680, 150], [1000, -130], [370, 110], 24); pen(p, a, pr(t, B.back - E, .3), 6, 3990);
      pen(p, poly([[398, 80], [370, 110], [406, 122]]), pr(t, B.back + .25, .1), 6, 3991);
      if (happy) for (let k = 0; k < 3; k++) pen(p, seg(1500 + k * 40, 90 + k * 16, 1620 + k * 40, 70 + k * 16, 2), pr(t, B.quick - E + k * .04, .1), 4, 3992 + k);
    }
    if (t >= B.thirty - E) { // the number, hand-lettered over the stacks, with a bracket
      const wd = r3bLeafW(49, 2).w, fs = 96, ww = handWidth(p, wd, fs);
      r3bLeafLabel(p, wd, 1180 - ww / 2, 120, fs, t, B.thirty - E, 3995, .05);
    }
  }
}
