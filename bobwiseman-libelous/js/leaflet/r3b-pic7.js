// Round 3, leaf-B: the stanza-7 page's picture box, panel by panel (PBW x PBH, ground at GY). Pure function of t.
// The book page of the leaflet: the ink going to waste, the publishing house, the man with the fist and his wallet,
// the stacks, the book and its title, the doctor, what it says, the people, the fries. No brand, no logo anywhere.
function r3bLeafPic7(p, t, pi) {
  const B = R3BLEAF, E = EARLY;
  if (pi === 0) { // ink drums piled up, ink spilling, a tipped drum pouring it down a drain
    pen(p, seg(0, GY, PBW, GY, 30), 1, 5, 4001);
    const dr = [[0, 0], [1, 0], [2, 0], [3, 0], [.5, 1], [1.5, 1], [2.5, 1], [1, 2], [2, 2]]; // pyramid: col, row
    dr.forEach(([c, r], k) => { const t0 = k < 4 ? R3BLEAF_T7 - .7 + k * .05 : B.tons - E + (k - 4) * .06; if (t >= t0) r3bLeafDrum(p, 230 + c * 118, GY - r * 112, 110, 104, pr(t, t0, .14), 4010 + k * 9); });
    if (t >= B.ink - E) { // ink: a puddle that spreads, a drip down the pile, all solid black
      const u = ease(t, B.ink - E, B.ink + .5);
      p.fillStyle = '#000'; p.beginPath(); p.ellipse(420, GY - 4, 60 + 250 * u, 8 + 14 * u, 0, 0, TAU); p.fill();
      const dx = 466, top = GY - 2 * 112 - 104, len = 96 * ease(t, B.ink - E, B.ink + .3); // a drip down the top drum
      p.beginPath(); p.moveTo(dx - 7, top); p.lineTo(dx + 7, top); p.lineTo(dx + 6, top + len); p.arc(dx, top + len, 7, 0, Math.PI); p.closePath(); p.fill();
    }
    if (t >= B.l51 - E) { // a drum on its side, pouring into a channel to the drain
      const tip = ease(t, B.going - E, B.going + .25), x = 1050, y = GY;
      p.save(); p.translate(x + 55, y); p.rotate(-tip * Math.PI / 2 * .95); r3bLeafDrum(p, -55, 0, 110, 104, pr(t, B.l51 - E, .15), 4100); p.restore();
      const pour = ease(t, B.going + .1, B.waste); p.fillStyle = '#000';
      if (pour > 0) { p.beginPath(); p.moveTo(x - 40, GY - 50); p.quadraticCurveTo(x - 80, GY - 10, x - 90, GY - 4); p.lineTo(x - 70, GY - 2); p.quadraticCurveTo(x - 60, GY - 20, x - 30, GY - 46); p.closePath(); p.fill();
        p.beginPath(); p.ellipse(lerp(x - 80, 1360, pour * .5), GY - 4, 20 + 260 * pour * .5, 9, 0, 0, TAU); p.fill(); }
      const gx = 1450, u = pr(t, B.l51, .25); // the drain grate
      pen(p, ell(gx, GY - 2, 90, 18), u, 5, 4110); for (let k = 0; k < 6; k++) pen(p, seg(gx - 60 + k * 24, GY - 14, gx - 60 + k * 24, GY + 10, 1), u, 3.5, 4111 + k);
      if (t >= B.waste - E) { // the swirl as it goes down
        const sp = []; for (let i = 0; i <= 40; i++) { const a = i * .35 + (t - B.waste) * 6, r = 6 + i * 2.6; sp.push([gx + Math.cos(a) * r * 1.6, GY - 70 + Math.sin(a) * r * .5 - i * .4]); }
        pen(p, sp, pr(t, B.waste - E, .3), 4, null); p.fillStyle = '#000'; p.beginPath(); p.ellipse(1300, GY - 4, 160, 10, 0, 0, TAU); p.fill();
      }
    }
  } else if (pi === 1) { // the publishing house: a sign lettered on the sung words, presses rolling in the windows, the order pinned up
    pen(p, seg(0, GY, PBW, GY, 30), 1, 5, 4201);
    const u = pr(t, B.l52 - E, .4);
    pen(p, poly([[380, GY], [380, 150], [900, 30], [1420, 150], [1420, GY]]), u, 6, 4202);
    pen(p, poly([[560, 112], [1240, 112], [1240, 190], [560, 190]], true), pr(t, B.l52, .25), 5, 4203); // the sign board
    if (t >= B.publishing - E) { const w1 = r3bLeafUP(52, 2), w2 = r3bLeafUP(52, 3), fs = 58, ww = handWidth(p, w1, fs) + 26 + handWidth(p, w2, fs), x0 = 900 - ww / 2;
      r3bLeafLabel(p, w1, x0, 172, fs, t, B.publishing - E, 4204, .03);
      if (t >= B.house - E) r3bLeafLabel(p, w2, x0 + handWidth(p, w1, fs) + 26, 172, fs, t, B.house - E, 4205, .03); }
    for (const wx of [470, 1150]) { // windows with a press inside: two rollers turning
      pen(p, poly([[wx, 220], [wx + 180, 220], [wx + 180, 330], [wx, 330]], true), pr(t, B.l52 + .1, .25), 5, 4210 + wx);
      for (let k = 0; k < 2; k++) { const cx = wx + 50 + k * 80, cy = 275, a = t * 7 * (k ? -1 : 1);
        pen(p, ell(cx, cy, 30, 30), pr(t, B.l52 + .2, .2), 4.5, 4220 + wx + k);
        for (let j = 0; j < 3; j++) pen(p, seg(cx, cy, cx + Math.cos(a + j * 2.1) * 26, cy + Math.sin(a + j * 2.1) * 26, 2), 1, 3.5, null); }
    }
    pen(p, poly([[820, GY], [820, 230], [980, 230], [980, GY]]), pr(t, B.l52 + .15, .25), 5, 4230); // the door
    if (t >= B.order - E) { // a mitten brings the order slip in from the right and sticks it on the door
      const in_ = ease(t, B.order - E, B.placed - .05), sx = lerp(1900, 900, in_), sy = lerp(260, 270, in_), rot = lerp(.5, -.05, in_);
      p.save(); p.translate(sx, sy); p.rotate(rot); p.fillStyle = '#fff'; p.fillRect(-50, -40, 100, 80); pen(p, rect(-50, -40, 100, 80), 1, 4, 4240);
      for (let k = 0; k < 4; k++) pen(p, seg(-36, -22 + k * 15, 34 - (k === 3) * 30, -22 + k * 15, 3), 1, 3, 4241 + k); p.restore();
      if (in_ < 1) { const items = []; items.push({ p: seg(sx + 60, sy + 4, sx + 900, sy - 20, 6), w: 5.5 }, { p: seg(sx + 60, sy + 44, sx + 900, sy + 30, 6), w: 5.5 }); mitten(items, sx + 46, sy + 22, Math.PI, 95 / .13, 5, false, 1); drawSet(p, items, 1, 4250); }
      if (t >= B.placed - E) for (let k = 0; k < 3; k++) pen(p, seg(900 + 70 + k * 6, 240 + k * 26, 900 + 100 + k * 12, 232 + k * 30, 2), pr(t, B.placed - E + k * .03, .08), 4, 4260 + k); // thump
    }
  } else if (pi === 2) { // the man with the fist; the wallet, bigger than he is, on wheels, its lid cranking up and down
    pen(p, seg(0, GY, PBW, GY, 30), 1, 5, 4301);
    const mh = 300, mr = mh * .1, mhx = 360;
    const fistUp = ease(t, B.fist - E, B.fist + .2);
    r3bLeafPerson(p, { x: mhx, y: GY, h: mh, tophat: true, mouth: 'line', look: 1, facing: 1, armR: [lerp(.2, 2.3, fistUp), lerp(.1, -.2, fistUp)] }, pr(t, B.l53 - E, .4), 4302);
    if (t >= B.fist - E) { // the fist: one huge mitten where his right hand is
      const sx = mhx + mh * .13 * .95, sy = GY - mh + mr * 2.25 + mh * .04, a1 = Math.PI / 2 - lerp(.2, 2.3, fistUp), ex = sx + Math.cos(a1) * mh * .17, ey = sy + Math.sin(a1) * mh * .17;
      const a2 = a1 - lerp(.1, -.2, fistUp), hx = ex + Math.cos(a2) * mh * .16, hy = ey + Math.sin(a2) * mh * .16, sz = lerp(.3, 1, easeOutBack(pr(t, B.fist - E, .2), 1.8));
      const items = []; mitten(items, hx, hy, a2, mh * 3.2 * sz, 6, false, -1); drawSet(p, items, 1, 4303);
      for (let k = 0; k < 3; k++) pen(p, seg(hx - 40 + k * 40, hy - 90 - k * 4, hx - 52 + k * 52, hy - 120 - k * 6, 2), pr(t, B.fist + .05 + k * .03, .08), 4, 4304 + k);
    }
    if (t >= B.wallet - E) {
      const grow = easeOutBack(pr(t, B.big - E, .25), 1.4), sc = lerp(.6, 1, t >= B.big - E ? grow : 0), wheels = ease(t, B.wheels - E, B.wheels + .2);
      const roll = ease(t, B.came - E, B.came + .5), wx = 1120 + (1 - roll) * (t >= B.came - E ? 220 : 0) * (t >= B.came - E ? 1 : 0), lift = wheels * 70;
      const lid = t >= B.adjustable - E ? (.5 - .5 * Math.cos((t - B.adjustable + E) * 7)) * 2.0 : 0;
      const w = 600 * sc, h = 230 * sc, x0 = wx - w / 2, y1 = GY - lift, y0 = y1 - h;
      const fh = h * .45, open = Math.cos(lid) < 0, cy = y0 + fh * Math.cos(lid); // the flap, hinged along the top edge
      const flap = () => { p.fillStyle = '#fff'; fillPoly(p, [[x0 + 6, y0], [x0 + w - 6, y0], [wx + w * .2, cy], [wx - w * .2, cy]]);
        pen(p, poly([[x0 + 6, y0], [wx - w * .2, cy], [wx + w * .2, cy], [x0 + w - 6, y0]]), pr(t, B.wallet, .25), 5, 4311);
        p.fillStyle = '#000'; p.beginPath(); p.arc(wx, cy - (open ? -14 : 14), 9 * sc, 0, TAU); if (t > B.wallet + .2) p.fill(); };
      if (open) flap(); // swung up behind
      for (let k = 0; k < 3; k++) { // banknotes in it: they stand up out of the top when the lid lifts
        const nx = wx - w * .32 + k * w * .23, up = (14 + k * 5 + 70 * Math.max(0, -Math.cos(lid))) * sc;
        p.fillStyle = '#fff'; p.fillRect(nx, y0 - up, w * .26, up + 10); pen(p, poly([[nx, y0 + 4], [nx, y0 - up], [nx + w * .26, y0 - up], [nx + w * .26, y0 + 4]]), pr(t, B.wallet + .15, .2), 4, 4340 + k);
        if (up > 30) { pen(p, ell(nx + w * .13, y0 - up + 22 * sc, 13 * sc, 9 * sc), 1, 3, 4345 + k); pen(p, seg(nx + 8, y0 - up + 8, nx + w * .26 - 8, y0 - up + 8, 4), 1, 2.5, 4348 + k); }
      }
      p.fillStyle = '#fff'; p.fillRect(x0, y0, w, h);
      pen(p, r3bLeafRR(x0, y0, w, h, 24 * sc), pr(t, B.wallet - E, .3), 6, 4310);
      if (t >= B.wallet) { p.save(); p.setLineDash([12, 9]); p.strokeStyle = '#000'; p.lineWidth = 3; r3bLeafRRPath(p, x0 + 16, y0 + 16, w - 32, h - 32, 16 * sc); p.stroke(); p.restore(); } // stitching all round
      if (!open) flap();
      if (t >= B.adjustable - E) { // the crank on its side
        const cx = x0 + w + 10, cyy = y0 + h * .5, a = (t - B.adjustable) * 7;
        pen(p, ell(cx, cyy, 12, 12), 1, 4, 4312); pen(p, seg(cx, cyy, cx + Math.cos(a) * 46, cyy + Math.sin(a) * 46, 2), 1, 5, 4313, .3);
        pen(p, seg(cx + Math.cos(a) * 46, cyy + Math.sin(a) * 46, cx + Math.cos(a) * 46 + 22, cyy + Math.sin(a) * 46, 2), 1, 6, 4314, .3);
      }
      if (wheels > 0) for (const sd of [-1, 1]) { // wheels and their spokes, turning as it rolls in
        const cx = wx + sd * w * .32, cyy = GY - 36, rr = 36 * wheels, a = (1 - roll) * 9;
        pen(p, ell(cx, cyy, rr, rr), 1, 5, 4320 + sd); for (let j = 0; j < 4; j++) pen(p, seg(cx, cyy, cx + Math.cos(a + j * Math.PI / 2) * rr, cyy + Math.sin(a + j * Math.PI / 2) * rr, 2), 1, 3.5, null);
        pen(p, seg(cx, cyy - rr, cx, y1, 2), 1, 5, 4325 + sd);
      }
      if (t >= B.came - E && roll < 1) for (let k = 0; k < 3; k++) pen(p, seg(x0 + w + 40 + k * 10, y0 + 60 + k * 60, x0 + w + 140 + k * 10, y0 + 60 + k * 60, 2), 1, 4, 4330 + k); // speed lines
    }
  } else if (pi === 3) { // the small number crossed out (two small stacks), the huge number (stacks to the sky)
    pen(p, seg(0, GY, PBW, GY, 30), 1, 5, 4401);
    if (t >= B.l55 - E) for (let k = 0; k < 2; k++) r3bLeafStack(p, 230 + k * 170, GY, 140, 7, pr(t, B.l55 - E + .4 + k * .15, .5), 4410 + k * 20);
    if (t >= B.but - E) { marker(p, seg(150, 230, 470, 360, 8), pr(t, B.but - E, .1), 12, 4450); marker(p, seg(470, 230, 150, 360, 8), pr(t, B.but - E + .06, .1), 12, 4451); }
    if (t >= B.million - E) for (let c = 0; c < 11; c++) { // columns rising out of the top of the box
      const x = 640 + c * 102, n = 26, rise = ease(t, B.million - E + c * .05, B.stacks + .3 + c * .03), shown = Math.ceil(n * rise);
      p.save(); p.beginPath(); p.rect(0, 0, PBW, PBH); p.clip();
      r3bLeafStack(p, x, GY, 92, shown, 1, 4500 + c * 40); p.restore();
    }
  } else if (pi === 4) { // the book itself: a title panel on its cover, the king's crown on it, the title rubbed down in quotes
    pen(p, seg(0, GY, PBW, GY, 30), 1, 5, 4601);
    const bx = 900, bw = 420, bh = 334, x0 = bx - bw / 2, y0 = GY - bh;
    r3bLeafBook(p, bx, GY, bw, bh, pr(t, B.l56 - E, .35), 4602);
    if (t >= B.title - E) pen(p, r3bLeafRR(x0 + 62, y0 + 44, bw - 96, 150, 10), pr(t, B.title - E, .25), 4.5, 4603);
    if (t >= B.book - E) pen(p, poly(crownPts(bx + 16, y0 + 290, 70, 34), true), pr(t, B.book - E, .2), 4.5, 4604);
    for (let k = 0; k < 3; k++) pen(p, seg(x0 + 90, y0 + 220 + k * 18, x0 + bw - 60 - k * 40, y0 + 220 + k * 18, 3), pr(t, B.l56 + .2 + k * .05, .1), 3, 4605 + k);
    if (t >= B.nutri - E) { // rub-down capitals, two lines, sized to the panel
      const w1 = r3bLeafUP(57, 1), w2 = r3bLeafUP(57, 2), pw = bw - 130; let fs = 70; while (fs > 30 && letraWidth(p, w1, fs) > pw) fs -= 2;
      letraWord(p, w1, bx + 16 - letraWidth(p, w1, fs) / 2, y0 + 112, fs, t, B.nutri - E, .045, 4610);
      if (t >= B.facts - E) letraWord(p, w2, bx + 16 - letraWidth(p, w2, fs) / 2, y0 + 112 + fs * 1.05, fs, t, B.facts - E, .045, 4620);
      if (R3BLEAF_BOX.on) R3BLEAF_BOX.labels.push([bx + 16 - letraWidth(p, w1, fs) / 2, y0 + 112 - fs * .75, letraWidth(p, w1, fs), fs * 1.9, 'cover']);
    }
    for (const sd of [-1, 1]) for (let k = 0; k < 3; k++) pen(p, seg(bx + sd * (bw / 2 + 60 + k * 30), y0 + 60 + k * 70, bx + sd * (bw / 2 + 130 + k * 40), y0 + 40 + k * 70, 2), pr(t, B.nutri + k * .05, .12), 4, 4630 + k + sd); // it shines
  } else if (pi === 5) { // the doctor is hired: the man with the fist hands him the contract; a diploma on the wall
    pen(p, seg(0, GY, PBW, GY, 30), 1, 5, 4701);
    const hand = ease(t, B.hired - E, B.hired + .4);
    r3bLeafPerson(p, { x: 380, y: GY, h: 280, tophat: true, mouth: 'line', look: 1, facing: 1, armR: [lerp(.3, 1.35, hand), .1] }, pr(t, B.l58 - E, .35), 4702);
    const px = lerp(500, 640, ease(t, B.hired + .2, B.doctor + .2)), py = 210;
    if (t >= B.hired - E) { p.save(); p.translate(px, py); p.rotate(-.1); p.fillStyle = '#fff'; p.fillRect(-36, -46, 72, 92); pen(p, rect(-36, -46, 72, 92), 1, 4, 4703); for (let k = 0; k < 4; k++) pen(p, seg(-24, -28 + k * 16, 22, -28 + k * 16, 3), 1, 3, 4704 + k); pen(p, seg(-20, 34, 14, 30, 4), 1, 3.5, 4709); p.restore(); }
    const dx = 820, dh = 330, dr = dh * .1, dhy = GY - dh + dr;
    r3bLeafPerson(p, { x: dx, y: GY, h: dh, glasses: true, bald: true, mouth: t >= B.phd ? 'smile' : 'line', look: -.6, armL: [lerp(.2, 1.1, ease(t, B.doctor, B.doctor + .5)), .3] }, pr(t, B.doctor - E - .25, .4), 4710);
    if (t >= B.doctor - E) { // the head mirror and the stethoscope
      pen(p, ell(dx, dhy - dr * .9, dr * .95, dr * .35, Math.PI * 1.05, Math.PI * 1.95), pr(t, B.doctor, .2), 3.5, 4711);
      pen(p, ell(dx + dr * .2, dhy - dr * .95, dr * .32, dr * .32), pr(t, B.doctor + .1, .15), 4.5, 4712);
      pen(p, quad([dx - dh * .08, dhy + dr * 1.3], [dx, dhy + dh * .32], [dx + dh * .08, dhy + dr * 1.3], 10), pr(t, B.doctor + .2, .2), 3.5, 4713);
      pen(p, ell(dx + dh * .02, dhy + dh * .3, 10, 10), pr(t, B.doctor + .3, .1), 4, 4714);
    }
    if (t >= B.l58) { // the diploma on the wall, a ribbon seal; lettered on the sung word
      const fx = 1180, fy = 30, fw = 400, fh = 230, u = pr(t, B.l58, .3);
      pen(p, rect(fx, fy, fw, fh), u, 6, 4720); pen(p, rect(fx + 14, fy + 14, fw - 28, fh - 28), u, 3, 4721);
      for (let k = 0; k < 2; k++) pen(p, seg(fx + 60, fy + 170 + k * 20, fx + fw - 140, fy + 170 + k * 20, 3), u, 3, 4722 + k);
      pen(p, ell(fx + fw - 70, fy + fh - 56, 26, 26), u, 4, 4724); pen(p, poly([[fx + fw - 84, fy + fh - 34], [fx + fw - 92, fy + fh + 6], [fx + fw - 70, fy + fh - 10], [fx + fw - 48, fy + fh + 6], [fx + fw - 56, fy + fh - 34]]), u, 3.5, 4725);
      if (t >= B.phd - E) { const wd = r3bLeafW(58, 7).w, fs = 96, ww = handWidth(p, wd, fs); r3bLeafLabel(p, wd, fx + fw / 2 - ww / 2, fy + 132, fs, t, B.phd - E, 4726, .06); }
    }
  } else if (pi === 6) { // he writes the intro at a desk; the book shuts; FREE goes on it
    pen(p, seg(0, GY, PBW, GY, 30), 1, 5, 4801);
    const dx = 560, dh = 320, write = t >= B.wrote - E && t < B.book2 - E;
    const wig = write ? Math.sin(t * 30) * .06 : 0;
    r3bLeafPerson(p, { x: dx, y: GY, h: dh, glasses: true, bald: true, mouth: 'line', look: .8, facing: 1, armR: [1.35 + wig, .25] }, pr(t, B.l59 - E, .35), 4802);
    pen(p, ell(dx, GY - dh + dh * .1 - dh * .1 * .9, dh * .1 * .95, dh * .1 * .35, Math.PI * 1.05, Math.PI * 1.95), 1, 3.5, 4803);
    p.fillStyle = '#fff'; p.fillRect(660, 236, 700, GY - 236); pen(p, seg(640, 236, 1380, 236, 20), pr(t, B.l59 - E, .3), 6, 4804); // the desk
    pen(p, seg(680, 236, 680, GY, 3), 1, 5, 4805); pen(p, seg(1340, 236, 1340, GY, 3), 1, 5, 4806);
    if (t < B.book2 - E) { // the open book on the desk; lines of writing appear as he writes
      pen(p, poly([[690, 236], [695, 70], [970, 86], [970, 236]], true), pr(t, B.l59, .3), 5, 4810); pen(p, poly([[970, 236], [970, 86], [1245, 70], [1250, 236]], true), pr(t, B.l59 + .1, .3), 5, 4811);
      const nl = Math.floor(clamp((t - B.wrote + E) / (B.intro - B.wrote)) * 6), nr = Math.floor(clamp((t - B.intro + E) / (B.book2 - B.intro)) * 6);
      for (let k = 0; k < nl; k++) pen(p, seg(720, 110 + k * 20, 940 - (k === 5) * 80, 116 + k * 20, 6), 1, 3, 4820 + k, 2.5);
      for (let k = 0; k < nr; k++) pen(p, seg(1000, 116 + k * 20, 1220 - (k === 5) * 90, 108 + k * 20, 6), 1, 3, 4830 + k, 2.5);
      if (write) { const ly = 110 + Math.min(5, nl) * 20, lx = nl < 6 ? 720 + ((t * 3) % 1) * 200 : 1000 + ((t * 3) % 1) * 200; pen(p, seg(lx, ly - 4, lx + 30, ly - 70, 2), 1, 5, 4840); } // his pen
    } else { // shut: a closed book standing on the desk, lines on its cover
      const bx = 970, bw = 240, bh = 210; r3bLeafBook(p, bx, 236, bw, bh, 1, 4850);
      pen(p, r3bLeafRR(bx - bw / 2 + 40, 236 - bh + 30, bw - 64, 70, 8), 1, 4, 4851); pen(p, poly(crownPts(bx + 12, 236 - 30, 46, 22), true), 1, 4, 4852);
      for (let k = 0; k < 2; k++) pen(p, seg(bx - 60, 236 - bh + 54 + k * 22, bx + 70, 236 - bh + 54 + k * 22, 6), 1, 3, 4853 + k, 2);
    }
    if (t >= B.free - E) { // a rub-down starburst, as on the couple's own page
      const cx = 1560, cy = 120, R = 92, pts = [];
      for (let i = 0; i <= 28; i++) { const a = i / 28 * TAU - Math.PI / 2, rr = i % 2 ? R * .74 : R; pts.push([cx + Math.cos(a) * rr * 1.25, cy + Math.sin(a) * rr]); }
      pen(p, pts, pr(t, B.free - E, .12), 6, 4860);
      const word = r3bLeafUP(59, 9), fs = 84, wd = letraWidth(p, word, fs);
      letraWord(p, word, cx - wd / 2, cy + 30, fs, t, B.free - E, 0, 4861, { rub: false });
      if (R3BLEAF_BOX.on) R3BLEAF_BOX.labels.push([cx - wd / 2, cy - 40, wd, 80, 'free']);
      pen(p, seg(cx - 130, cy + 60, 1100, 180, 10), pr(t, B.free + .1, .15), 4, 4862); // a string to the book
    }
  } else if (pi === 7) { // the book open as a diagram: the salad leaf in the bun, health; a glass of water and a cup, both lettered
    const sp = pr(t, B.l60 - E, .35);
    pen(p, poly([[220, 352], [230, 40], [900, 64], [900, 360]], true), sp, 5, 4901); pen(p, poly([[900, 360], [900, 64], [1570, 40], [1580, 352]], true), pr(t, B.l60 - E + .1, .35), 5, 4902);
    for (let k = 0; k < 3; k++) pen(p, seg(230 - k * 8, 352 + k * 6, 900, 360 + k * 6, 10), sp, 3, 4903 + k);
    for (let k = 0; k < 3; k++) pen(p, seg(900, 360 + k * 6, 1580 + k * 8, 352 + k * 6, 10), sp, 3, 4906 + k);
    r3bLeafBurger(p, 520, 300, 330, pr(t, B.l60, .35), 4910, { leaf: t >= B.lettuce - E });
    const lead = (ax, ay, lx, ly, ts, li, k, seed) => { // a leader line and a hand-lettered label on the sung word
      if (t < ts - E) return; pen(p, seg(ax, ay, lx, ly, 8), pr(t, ts - E, .12), 3.5, seed); p.fillStyle = '#000'; p.beginPath(); p.arc(ax, ay, 6, 0, TAU); p.fill();
      const wd = r3bLeafUP(li, k), fs = 44, ww = handWidth(p, wd, fs); r3bLeafLabel(p, wd, lx < ax ? lx - ww - 4 : lx + 4, ly + 16, fs, t, ts - E + .03, seed + 1);
    };
    lead(330, 202, 300, 104, B.lettuce, 60, 3, 4920);
    lead(640, 150, 700, 84, B.bun, 60, 6, 4925);
    if (t >= B.health - E) { const hx = 780, hy = 250, u = pr(t, B.health - E, .2); pen(p, quad([hx, hy + 40], [hx - 70, hy - 10], [hx - 30, hy - 36], 10).concat(quad([hx - 30, hy - 36], [hx, hy - 40], [hx, hy - 10], 6)).concat(quad([hx, hy - 10], [hx, hy - 40], [hx + 30, hy - 36], 6)).concat(quad([hx + 30, hy - 36], [hx + 70, hy - 10], [hx, hy + 40], 10)), u, 5, 4930); }
    lead(820, 232, 860, 150, B.health, 60, 9, 4932);
    if (t >= B.joke - E) { const wd = r3bLeafUP(60, 9), ww = handWidth(p, wd, 44), x0 = 862; marker(p, seg(x0, 172, x0 + ww, 170, 8), pr(t, B.joke - E, .12), 7, 4936); marker(p, seg(x0 + 6, 186, x0 + ww - 4, 184, 8), pr(t, B.joke + .08, .12), 6, 4937); } // underlined twice
    if (t >= B.drink - E) { // a glass of water
      const gx = 1110, u = pr(t, B.drink - E, .2);
      pen(p, poly([[gx - 60, 140], [gx - 48, 320], [gx + 48, 320], [gx + 60, 140]]), u, 5, 4940);
      const wv = []; for (let i = 0; i <= 12; i++) wv.push([gx - 56 + i * 9.4, 180 + Math.sin(i * 1.3 + t * 4) * 4]); pen(p, wv, u, 3.5, null);
    }
    lead(1130, 236, 1170, 112, B.water1, 61, 3, 4945);
    if (t >= B.theres - E) { // a plain lidded cup with a straw: no lettering, no logo
      const cx = 1400, u = pr(t, B.theres - E, .2);
      pen(p, poly([[cx - 62, 150], [cx - 48, 322], [cx + 48, 322], [cx + 62, 150]]), u, 5, 4950); pen(p, r3bLeafRR(cx - 70, 134, 140, 18, 6), u, 4.5, 4951);
      pen(p, seg(cx + 10, 136, cx + 40, 70, 2), u, 6, 4952); pen(p, seg(cx + 40, 70, cx + 70, 66, 2), u, 6, 4953);
      if (t >= B.coke - E) for (let k = 0; k < 7; k++) { const by = 300 - ((t - B.coke) * 120 + k * 22) % 140, bxx = cx - 30 + rnd(k, 5) * 60; if (by > 160) pen(p, ell(bxx, by, 6, 6), 1, 3, null); } // fizz
    }
    lead(1440, 250, 1480, 120, B.water2, 61, 6, 4955);
  } else if (pi === 8) { // the people feel good reading it; the book gets its stamp
    pen(p, seg(0, GY, PBW, GY, 30), 1, 5, 5001);
    const good = t >= B.good - E;
    for (let k = 0; k < 5; k++) {
      const x = 200 + k * 230, h = 250 + (k % 3) * 14;
      r3bLeafPerson(p, { x, y: GY, h, woman: k % 2 === 1, pony: k === 3, glasses: k === 2, mouth: good ? 'smile' : 'line', look: .3, holdR: true, armR: [.9, .5] }, pr(t, B.people - E + k * .06, .35), 5010 + k * 13);
      if (good) { const hy = GY - h - 30 - ease(t, B.good + k * .05, B.good + 1) * 40, u = pr(t, B.good - E + k * .05, .12), hx = x + 30; pen(p, quad([hx, hy + 18], [hx - 26, hy - 2], [hx - 10, hy - 14], 6).concat(quad([hx - 10, hy - 14], [hx, hy - 14], [hx, hy - 4], 4)).concat(quad([hx, hy - 4], [hx, hy - 14], [hx + 10, hy - 14], 4)).concat(quad([hx + 10, hy - 14], [hx + 26, hy - 2], [hx, hy + 18], 6)), u, 4, 5080 + k); }
    }
    if (t >= B.print - E) { // the book, big, at the right; a rubber stamp lands on its cover
      const bx = 1530, bw = 300, bh = 320; r3bLeafBook(p, bx, GY, bw, bh, pr(t, B.print - E, .2), 5100);
      pen(p, r3bLeafRR(bx - bw / 2 + 50, GY - bh + 36, bw - 80, 90, 8), pr(t, B.print, .15), 4, 5101);
      if (t >= B.legit - E) {
        const u = pr(t, B.legit - E, .09), sc = lerp(1.4, 1, u), wd = r3bLeafUP(63, 5), fs = 70, ww = handWidth(p, wd, fs);
        p.save(); p.translate(bx + 10, GY - 120); p.rotate(-.16); p.scale(sc, sc);
        p.fillStyle = '#fff'; p.fillRect(-ww / 2 - 26, -54, ww + 52, 82);
        p.strokeStyle = '#000'; p.lineWidth = 8; p.strokeRect(-ww / 2 - 26, -54, ww + 52, 82); p.lineWidth = 3; p.strokeRect(-ww / 2 - 16, -44, ww + 32, 62);
        r3bLeafLabel(p, wd, -ww / 2, 6, fs, t, B.legit - E, 5102, 0);
        p.restore();
        for (let k = 0; k < 3; k++) pen(p, seg(bx - 210 + k * 10, GY - 200 + k * 50, bx - 250 + k * 10, GY - 206 + k * 50, 2), pr(t, B.legit - E + .06, .08), 4, 5103 + k);
      }
    }
  } else { // more fries, no tip: a counter, a server in a paper cap, customers; cartons pile up; an empty tip jar, a fly
    pen(p, seg(0, GY, PBW, GY, 30), 1, 5, 5201);
    r3bLeafPerson(p, Object.assign({ x: 1000, y: GY, h: 300, mouth: 'line', look: -.6 }, W_FIG), pr(t, B.l64 - E, .35), 5202);
    counterFront(p, 600, 1520, 214, pr(t, B.l64 - E, .4), 5203);
    for (let k = 0; k < 3; k++) r3bLeafPerson(p, { x: 150 + k * 150, y: GY, h: 250 + (k % 2) * 20, woman: k === 1, mouth: 'line', look: 1, facing: 1, armR: k === 2 && t >= B.ordered - E ? [1.5, .1] : [.15, .1] }, pr(t, B.l64 - E + k * .06, .35), 5210 + k * 13);
    if (t >= B.fries - E) for (let k = 0; k < 7; k++) { // cartons of fries, more and more of them on the counter top
      const cx = 660 + k * 74 + (k > 3 ? 8 : 0), u = pr(t, B.fries - E + k * .07, .1); if (u <= 0) continue;
      p.fillStyle = '#fff'; if (u >= 1) fillPoly(p, [[cx - 26, 214], [cx - 32, 160], [cx + 32, 160], [cx + 26, 214]]);
      for (let j = 0; j < 5; j++) pen(p, seg(cx - 22 + j * 11, 164, cx - 26 + j * 13, 128 + (j % 2) * 10, 2), u, 4, 5230 + k * 7 + j);
      pen(p, poly([[cx - 26, 214], [cx - 32, 160], [cx + 32, 160], [cx + 26, 214]], true), u, 4.5, 5229 + k * 7);
    }
    if (t >= B.never - E) { // the tip jar, lettered with the sung word, empty
      const jx = 1400, u = pr(t, B.never - E, .2);
      pen(p, poly([[jx - 50, 120], [jx - 54, 212], [jx + 54, 212], [jx + 50, 120]]), u, 5, 5260); pen(p, ell(jx, 120, 52, 12), u, 4.5, 5261);
      if (t >= B.tip - E) { const wd = r3bLeafUP(64, 9), fs = 44, ww = handWidth(p, wd, fs); r3bLeafLabel(p, wd, jx - ww / 2, 186, fs, t, B.tip - E, 5262, .03);
        const a = (t - B.tip) * 9, fx = jx + Math.cos(a) * 90, fy = 70 + Math.sin(a * 1.3) * 28, fl = Math.abs(Math.sin(t * 50)); // the fly
        p.fillStyle = '#000'; p.beginPath(); p.ellipse(fx, fy, 7, 5, 0, 0, TAU); p.fill(); pen(p, ell(fx - 6, fy - 8 * fl - 2, 7, 4), 1, 2.5, null); pen(p, ell(fx + 6, fy - 8 * fl - 2, 7, 4), 1, 2.5, null);
        pen(p, ell(jx, 70, 90, 28, a - 1.6, a - .2), 1, 2.5, null); }
    }
  }
}
