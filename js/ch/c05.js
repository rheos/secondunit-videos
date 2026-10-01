// c05 · VERSE 3 (SEC.v3 - SEC.b1). The night avenue of dreams, tracking forward to the clock tower.
// Opens climbing out of a round iron hatch (c04 ends below decks); ends with the clock face filling the
// frame, exactly where c06 picks up (tower at q 1, face at (540, 520) r 330, cam zoom 2.0).
(() => {
  const STEEL = '#a7aea4', STEEL_D = '#68737a', NOTE = '#6d8c55', NOTE_L = '#93ad78';
  function at(x, y, k, rot, fn) { for (const g of [s, f]) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k); } fn(); s.restore(); f.restore(); }
  const sky = (y0, y1) => { s.fillStyle = vgrad(y0, y1, [[0, C.night], [.75, '#29355a'], [1, C.dusk]]); s.fillRect(-W * 2, -H * 2, W * 5, H * 5); };

  // ---- the clock tower (shared design with c06; keep in step) ----
  // local coords: base at (0, 0), clock centre (0, -2600), face r 330
  function handsAt(t) { const a = clamp(t - 115.94, 0, 4.52), m = -Math.PI / 2 - .5 + .05 * (t - 108) + .6 * a * a * a; return [m, -Math.PI / 2 + 2.25 + (m + Math.PI / 2 + .5) / 8]; }
  function clockHand(g, x, y, ang, len, w, tipR, fillC, lineC, lw) {
    const d = [Math.cos(ang), Math.sin(ang)], n = [-d[1], d[0]], q = (a, b) => [x + d[0] * a + n[0] * b, y + d[1] * a + n[1] * b];
    shape(g, [q(-len * .18, -w * .5), q(len * .55, -w * .42), q(len * .78, -w * .9), q(len, 0), q(len * .78, w * .9), q(len * .55, w * .42), q(-len * .18, w * .5)], fillC, lineC, lw);
    shape(g, circle(...q(len * .66, 0), tipR, 24), lineC ? C.gold : fillC, lineC, lw * .8);
  }
  function clockFace(x, y, R, t, lit) {
    const q = R / 330, [mA, hA] = handsAt(t);
    shape(s, circle(x, y, R), C.parch, C.umber, 20 * q);
    shape(s, circle(x, y, R * .9), C.gold, C.umber, 12 * q);
    for (let i = 0; i < 12; i++) { // the zodiac band: twelve tiled cells, each with a four-petal star (no glyphs)
      const a0 = (i - .5) / 12 * TAU - Math.PI / 2, a1 = a0 + TAU / 12, pts = [];
      for (let j = 0; j <= 6; j++) { const a = lerp(a0, a1, j / 6); pts.push([x + Math.cos(a) * R * .88, y + Math.sin(a) * R * .88]); }
      for (let j = 6; j >= 0; j--) { const a = lerp(a0, a1, j / 6); pts.push([x + Math.cos(a) * R * .7, y + Math.sin(a) * R * .7]); }
      shape(s, pts, i % 2 ? C.sage : C.rose, C.umber, 9 * q);
      const am = (a0 + a1) / 2, mx = x + Math.cos(am) * R * .79, my = y + Math.sin(am) * R * .79;
      for (let j = 0; j < 4; j++) petal(s, mx, my, am + j * Math.PI / 2, 40 * q, 15 * q, C.cream, C.umber, 6 * q);
    }
    shape(s, circle(x, y, R * .7), C.cream, C.umber, 14 * q);
    shape(s, circle(x, y, R * .36), null, C.sage, 14 * q);
    for (let i = 0; i < 12; i++) { const a = (i + .5) / 12 * TAU - Math.PI / 2; petal(s, x + Math.cos(a) * R * .36, y + Math.sin(a) * R * .36, a + 1.2, 44 * q, 13 * q, C.sage, C.umber, 6 * q); }
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU - Math.PI / 2; petal(s, x + Math.cos(a) * R * .56, y + Math.sin(a) * R * .56, a, 50 * q, 14 * q, C.gold, C.umber, 7 * q); }
    if (lit > 0) { glowAt(x, y, R * 1.25, `rgba(255,205,140,${.4 * lit})`); glowAt(x, y, R * .75, `rgba(255,240,200,${.55 * lit})`); }
    clockHand(s, x, y, hA, R * .42, 46 * q, 26 * q, C.plum, C.umber, 12 * q);
    clockHand(s, x, y, mA, R * .64, 34 * q, 20 * q, C.plum, C.umber, 12 * q);
    if (lit > 0) { clockHand(f, x, y, hA, R * .42, 46 * q, 26 * q, '#000', null); clockHand(f, x, y, mA, R * .64, 34 * q, 20 * q, '#000', null); }
    shape(s, circle(x, y, 30 * q, 24), C.gold, C.umber, 10 * q);
  }
  function tower(t, lit) {
    const cy = -2600;
    vine(s, cub([-300, 0], [-480, cy + 1500], [-260, cy + 900], [-440, cy + 470]), 64, 30, C.olive);
    vine(s, cub([300, 0], [480, cy + 1500], [260, cy + 900], [440, cy + 470]), 64, 30, C.olive);
    shape(s, [[-300, 0], [-300, cy + 470], [300, cy + 470], [300, 0]], C.parch, C.umber, 20);
    for (const sx of [-1, 1]) { shape(s, [[sx * 300, 0], [sx * 300, cy + 470], [sx * 210, cy + 470], [sx * 210, 0]], C.ochre, C.umber, 14); }
    shape(s, [[-210, cy + 560], [210, cy + 560], [210, cy + 640], [-210, cy + 640]], C.rose, C.umber, 12);
    for (let i = 0; i < 6; i++) shape(s, [[-200 + i * 70, cy + 570], [-150 + i * 70, cy + 570], [-150 + i * 70, cy + 630], [-200 + i * 70, cy + 630]], i % 2 ? C.sage : C.gold, C.umber, 6);
    shape(s, circle(0, cy + 2100, 120, 40), lit > .05 ? C.amber : C.dusk, C.umber, 16);
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; line([[0, cy + 2100], [Math.cos(a) * 120, cy + 2100 + Math.sin(a) * 120]], C.umber, 10); }
    glowAt(0, cy + 2100, 200, `rgba(255,170,90,${.3 * lit + .05})`);
    shape(s, [[-60, cy + 1700], [-60, cy + 860], ...circle(0, cy + 860, 60, 24).filter(([, py]) => py <= cy + 860).sort((a, b) => a[0] - b[0]), [60, cy + 860], [60, cy + 1700]], lit > .05 ? C.amber : C.night, C.umber, 16);
    glowAt(0, cy + 1300, 240, `rgba(255,170,90,${.3 * lit + .05})`);
    shape(s, [[-480, cy + 480], [480, cy + 480], [450, cy + 420], [-450, cy + 420]], C.ochre, C.umber, 16);
    shape(s, [[-430, cy + 420], [-430, cy - 360], [-360, cy - 430], [360, cy - 430], [430, cy - 360], [430, cy + 420]], C.teal, C.umber, 20);
    for (const sx of [-1, 1]) vine(s, whip([sx * 400, cy + 380], [sx * 330, cy + 200], [sx * 420, cy - 100], [sx * 360, cy - 330], .6, -sx, 30), 20, 8, C.gold);
    clockFace(0, cy, 330, t, lit);
    shape(s, [[-470, cy - 430], [470, cy - 430], [440, cy - 490], [-440, cy - 490]], C.ochre, C.umber, 16);
    const dome = [...cub([-380, cy - 490], [-470, cy - 700], [-120, cy - 820], [0, cy - 1120], 24), ...cub([0, cy - 1120], [120, cy - 820], [470, cy - 700], [380, cy - 490], 24)];
    shape(s, dome, C.sage, C.umber, 20);
    for (const k of [-.6, -.2, .2, .6]) vine(s, cub([k * 380, cy - 490], [k * 470, cy - 700], [k * 140, cy - 850], [0, cy - 1110], 20), 14, 8, C.olive, 1, null);
    for (const sx of [-1, 1]) shape(s, [...cub([sx * 470, cy - 490], [sx * 520, cy - 600], [sx * 440, cy - 640], [sx * 450, cy - 720], 10), ...cub([sx * 450, cy - 720], [sx * 400, cy - 640], [sx * 380, cy - 560], [sx * 380, cy - 490], 10)], C.gold, C.umber, 12);
    line([[0, cy - 1110], [0, cy - 1300]], C.umber, 26); line([[0, cy - 1110], [0, cy - 1300]], C.gold, 12);
    lily(s, 0, cy - 1300, -Math.PI / 2, 120, .7, [C.gold, C.cream]);
  }

  // ---- the avenue in one-point perspective (the camera tracks forward along it) ----
  const VX = 540, VY = 1040, FZ = 900, X0 = 540, GY = 520, TOP = -2700, D = 700, ZT = 7600, ZMAX = 6600;
  const pr = (X, Y, Z) => [VX + X * FZ / Z, VY + Y * FZ / Z];
  const wallCol = (i, sd) => [C.plum, C.teal, C.olive, C.plum, '#4a3a5a'][Math.floor(hash(i * 2 + (sd > 0 ? 1 : 0) + 11) * 5)];
  function wallRect(sd, z0, z1, ya, yb, zc, arch = 0, inset = 0) { // a window outline on a side wall
    const X = sd * (X0 - inset), pts = [pr(X, yb, z0 - zc)];
    for (let i = 0; i <= 14; i++) { const u = i / 14; pts.push(pr(X, ya - arch * Math.sin(Math.PI * u), lerp(z0, z1, u) - zc)); }
    pts.push(pr(X, yb, z1 - zc)); return pts;
  }
  const lampsOf = (zc) => { const o = []; for (let i = Math.floor(zc / (D * 2)) - 1; i <= Math.floor((zc + ZMAX) / (D * 2)); i++) for (const sd of [-1, 1]) { const z = i * D * 2 + D * .5 + (sd > 0 ? D : 0); if (z - zc > 170 && z - zc < ZMAX) o.push([z - zc, sd]); } return o.sort((a, b) => b[0] - a[0]); };
  function avenue(t, zc, o = {}) {
    sky(-600, VY);
    s.fillStyle = vgrad(VY, H + 300, [[0, '#1b2236'], [.5, C.night], [1, C.dusk]]); s.fillRect(-W * 2, VY, W * 5, H * 3);
    const kt = FZ / (ZT - zc);
    at(VX, VY + GY * kt, kt, 0, () => tower(t, o.towerLit ?? .25));
    // tram rails and sleepers rushing toward the camera
    for (let j = 0; j < 30; j++) { const zs = Math.ceil(zc / 260) * 260 + j * 260, Z = zs - zc; if (Z < 150 || Z > ZMAX) continue; shape(s, [pr(-200, GY, Z - 30), pr(200, GY, Z - 30), pr(200, GY, Z + 30), pr(-200, GY, Z + 30)], '#2a2433', null); }
    for (const sd of [-1, 1]) shape(s, [pr(sd * 120 - 16, GY, 150), pr(sd * 120 + 16, GY, 150), pr(sd * 120 + 16, GY, ZMAX), pr(sd * 120 - 16, GY, ZMAX)], C.gold, C.umber, 6);
    // kerbs
    for (const sd of [-1, 1]) shape(s, [pr(sd * 420, GY, 150), pr(sd * X0, GY, 150), pr(sd * X0, GY, ZMAX), pr(sd * 420, GY, ZMAX)], '#3a3550', C.umber, 8);
    const lamps = lampsOf(zc);
    for (const [Z, sd] of lamps) { // wet reflections of the lamps
      const k = FZ / Z, [x, y] = pr(sd * 440 - sd * 300, GY, Z);
      for (let j = 0; j < 6; j++) { const wx = x + Math.sin(t * 3 + j + Z) * 12 * k, wy = y + (30 + j * 46) * k; s.fillStyle = C.ruby; s.fillRect(wx - (44 - j * 6) * k, wy, (88 - j * 12) * k, 22 * k); }
      glowAt(x, y + 140 * k, 220 * k, 'rgba(255,110,60,.3)');
    }
    for (const sd of [-1, 1]) {
      for (let i = Math.floor((zc + ZMAX) / D); i >= Math.floor(zc / D); i--) {
        const z0 = i * D, z1 = z0 + D; if (z1 - zc < 140) continue;
        const za = Math.max(z0, zc + 140), zb = Math.min(z1, zc + ZMAX), km = FZ / ((za + zb) / 2 - zc), lw = clamp(24 * km, 3, 26), X = sd * X0;
        shape(s, [pr(X, TOP, za - zc), pr(X, TOP, zb - zc), pr(X, GY, zb - zc), pr(X, GY, za - zc)], wallCol(i, sd), C.umber, lw);
        if (z0 - zc < 160) continue;
        const shopLit = hash(i * 7 + sd * 3 + 5) < .5, [gx, gy] = pr(X, 0, (z0 + z1) / 2 - zc);
        shape(s, wallRect(sd, z0 + D * .14, z1 - D * .14, -380, GY - 20, zc, 200), shopLit ? C.amber : C.deep, C.umber, lw);
        if (shopLit) glowAt(gx, gy, 420 * km, 'rgba(255,175,95,.35)');
        // the mosaic frieze over the shop
        shape(s, [pr(X, -700, z0 - zc), pr(X, -700, z1 - zc), pr(X, -640, z1 - zc), pr(X, -640, z0 - zc)], C.gold, C.umber, lw * .6);
        for (const [ya, yb, w] of [[-1250, -860, 1], [-1980, -1560, 2]]) {
          const dream = (o.dreamWins || 0) && hash(i * 13 + w * 17 + (sd > 0 ? 3 : 0)) < .55, on = !dream && hash(i * 31 + w * 7 + (sd > 0 ? 5 : 0)) < .45;
          shape(s, wallRect(sd, z0 + D * .26, z1 - D * .26, ya, yb, zc, 110), on ? C.amber : dream ? '#151a2a' : C.night, C.umber, lw);
          if (on) { const [wx, wy] = pr(X, (ya + yb) / 2, (z0 + z1) / 2 - zc); glowAt(wx, wy, 260 * km, 'rgba(255,190,110,.3)'); }
        }
        // the balcony: a Guimard rail with whiplash loops
        const rail = [...Array(17)].map((_, j) => pr(X - sd * 70, -800 + 46 * Math.sin(j / 16 * Math.PI * 4), lerp(z0 + 70, z1 - 70, j / 16) - zc));
        line(rail, C.umber, lw * 1.6); line(rail, C.olive, lw * .8);
        line([pr(X, TOP, z0 - zc), pr(X, GY, z0 - zc)], C.ochre, lw * 1.2);
      }
    }
    for (const [Z, sd] of lamps) { const k = FZ / Z, [x, y] = pr(sd * 440, GY, Z); at(x, y, k, 0, () => guimard(0, 0, 1050, -sd, .9 + .1 * Math.sin(t * 11 + Z), Math.sin(t * .8 + Z) * 10)); }
  }

  // ---- the dreams: moths and Lalique dragonflies ----
  function bug(x, y, sz, ang, t, kind, seed, eyes = 1) {
    if (sz < 3) return;
    const fl = Math.abs(Math.sin(t * (kind ? 34 : 21) + seed * 7)), lw = Math.max(5, sz * .07);
    at(x, y, 1, ang, () => {
      if (kind) { // dragonfly: four long glass wings, a slender segmented body
        for (const sd of [-1, 1]) for (const [a, L] of [[-.28, 1.0], [.22, .9]]) petal(s, 0, -sz * .08, (sd > 0 ? 0 : Math.PI) + a * sd, sz * L, sz * .15 * (.45 + .55 * fl), (seed % 2) ? C.glass : C.cream, C.umber, lw);
        vine(s, [[0, -sz * .3], [0, sz * .2], [sz * .03, sz * .6], [0, sz * 1.05]], sz * .14, sz * .05, C.teal, 1, C.umber);
        shape(s, circle(0, -sz * .34, sz * .1, 16), C.gold, C.umber, lw * .8);
        glowAt(0, 0, sz * .9, `rgba(150,230,210,${.12 * eyes})`);
      } else { // moth: dark velvet wings with glowing eye spots
        const wc = [C.plum, '#4a3a5a', C.dusk][seed % 3], bc = [C.rose, C.blush, C.sage][seed % 3], sp = .3 + .7 * fl;
        for (const g of [s, f]) { g.save(); g.scale(sp, 1); }
        for (const sd of [-1, 1]) {
          petal(s, 0, sz * .08, (sd > 0 ? 0 : Math.PI) + sd * .62, sz * .62, sz * .3, wc, C.umber, lw);
          petal(s, 0, -sz * .04, (sd > 0 ? 0 : Math.PI) - sd * .42, sz * .95, sz * .42, wc, C.umber, lw);
          petal(s, sd * sz * .12, -sz * .1, (sd > 0 ? 0 : Math.PI) - sd * .42, sz * .62, sz * .18, bc, C.umber, lw * .7);
          const ex = sd * sz * .6, ey = -sz * .4;
          shape(s, circle(ex, ey, sz * .1, 14), C.gold, C.umber, lw * .7);
          glowAt(ex, ey, sz * .32, `rgba(255,190,90,${.55 * eyes})`);
        }
        s.restore(); f.restore();
        for (const sd of [-1, 1]) vine(s, whip([0, -sz * .28], [sd * sz * .08, -sz * .45], [sd * sz * .18, -sz * .55], [sd * sz * .3, -sz * .58], .5, sd, 12), lw, lw * .6, C.gold, 1, C.umber);
        shape(s, blobPts(0, 0, sz * .11, sz * .32, seed, .05, 20), C.ochre, C.umber, lw * .8);
      }
    });
  }

  // ---- shots ----
  // 89.7: climbing out of a round iron hatch onto the avenue; tracking forward; the dark windows let out the dreams
  function street(t, lt, dur) {
    const rise = ease.inOut(inv(0, 1.3, lt));
    cam(540, lerp(1320, 960, rise), lerp(1.08, 1.0, rise), Math.sin(t * 1.3) * .006);
    const zc = lt * 460;
    avenue(t, zc, { dreamWins: 1 });
    // the dreams pour out of the dark upper windows
    const list = [];
    for (let j = 0; j < 44; j++) {
      const tb = 90.0 + hash(j * 3 + 3) * 2.7, a = t - tb; if (a < 0) continue;
      const sd = hash(j * 3 + 2) < .5 ? -1 : 1, zs = (3 + Math.floor(hash(j * 3 + 1) * 6)) * D + D / 2, ys = hash(j * 5 + 9) < .5 ? -1050 : -1770;
      const P3 = (a) => [sd * X0 - sd * (a * 380 + 90 * Math.sin(a * 3 + j)), ys - 240 * a + 110 * Math.sin(a * 4 + j * 2), zs - a * 650];
      const [X, Y, Z] = P3(a), Zr = Z - zc; if (Zr < 120) continue;
      const [X2, Y2, Z2] = P3(a + .05), [x, y] = pr(X, Y, Zr), [x2, y2] = pr(X2, Y2, Z2 - zc);
      list.push([Zr, x, y, Math.atan2(y2 - y, x2 - x) + Math.PI / 2, 150 * FZ / Zr * ease.out(clamp(a / .3)), j]);
    }
    list.sort((p, q) => q[0] - p[0]);
    for (const [, x, y, ang, sz, j] of list) bug(x, y, sz, ang, t, j % 3 === 0 ? 1 : 0, j);
    rain(t, 70, 51, .32);
    // the hatch rim falls away below as we climb out
    if (lt < 1.4) {
      const r = lerp(330, 2200, ease.in(inv(0, 1.4, lt))), cy = lerp(1200, 1900, ease.in(inv(0, 1.4, lt)));
      s.save(); s.beginPath(); s.rect(-W * 2, -H * 2, W * 5, H * 5); s.moveTo(540 + r, cy); s.arc(540, cy, r, 0, TAU, true); s.fillStyle = '#231a14'; s.fill('evenodd'); s.restore();
      f.save(); f.beginPath(); f.rect(-W * 2, -H * 2, W * 5, H * 5); f.moveTo(540 + r, cy); f.arc(540, cy, r, 0, TAU, true); f.fillStyle = '#000'; f.fill('evenodd'); f.restore();
      shape(s, circle(540, cy, r + 30), null, C.umber, 60); shape(s, circle(540, cy, r + 30), null, C.olive, 30);
      for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; shape(s, circle(540 + Math.cos(a) * (r + 30), cy + Math.sin(a) * (r + 30), 22, 12), C.gold, C.umber, 10); }
    }
    border(t, 1);
  }
  // 92.9: a dark shop window; the dreams swarm out of it in waves on the beats, the last one wipes the frame
  function swarm(t, lt, dur) {
    cam(540, 1000, kf(lt, [[0, 1.0], [dur, 1.14]]) + beatPulse(t, 9) * .012, Math.sin(t * 2) * .01);
    s.fillStyle = C.teal; s.fillRect(-W * 2, -H * 2, W * 5, H * 5);
    for (let i = 0; i < 6; i++) line([[-200, 220 + i * 340], [1300, 220 + i * 340]], C.deep, 14);
    // upper windows, lit
    for (const x of [150, 930]) { shape(s, [[x - 90, 520], [x - 90, 300], ...circle(x, 300, 90, 30).filter(([, py]) => py <= 300).sort((a, b) => a[0] - b[0]), [x + 90, 300], [x + 90, 520]], C.amber, C.umber, 18); glowAt(x, 420, 260, 'rgba(255,185,100,.35)'); }
    // frieze
    shape(s, [[60, 590], [1020, 590], [1020, 660], [60, 660]], C.gold, C.umber, 14);
    for (let i = 0; i < 12; i++) shape(s, [[80 + i * 80, 600], [140 + i * 80, 600], [140 + i * 80, 650], [80 + i * 80, 650]], i % 2 ? C.rose : C.sage, C.umber, 8);
    // the big arched shop window, dark, with ironwork
    const wx = 150, wy = 720, ww = 780, wh = 1050;
    const win = [[wx, wy + wh], [wx, wy + ww / 2], ...circle(wx + ww / 2, wy + ww / 2, ww / 2).filter(([, py]) => py <= wy + ww / 2 + .1).sort((a, b) => a[0] - b[0]), [wx + ww, wy + ww / 2], [wx + ww, wy + wh]];
    shape(s, win, '#141a2c', C.umber, 26);
    s.save(); P(s, win); s.closePath(); s.clip(); s.fillStyle = rgrad(540, 1300, 40, 600, [[0, '#3b3256'], [1, '#141a2c']]); s.fillRect(wx, wy, ww, wh); s.restore();
    for (const sx of [1, -1]) { const x0 = sx > 0 ? wx + 20 : wx + ww - 20; vine(s, whip([x0, wy + wh], [x0 + sx * 160, wy + wh * .7], [x0 - sx * 40, wy + wh * .35], [x0 + sx * 180, wy + 170], .9, sx, 40), 26, 10, C.olive, 1); }
    shape(s, [[wx - 40, wy + wh], [wx + ww + 40, wy + wh], [wx + ww + 60, wy + wh + 60], [wx - 60, wy + wh + 60]], C.ochre, C.umber, 14);
    // eyes in the dark before they come out
    for (let i = 0; i < 7; i++) { const ex = 260 + hash(i + 70) * 560, ey = 900 + hash(i + 90) * 700, bl = Math.sin(t * 3 + i * 2) > -.7 ? 1 : 0; glowAt(ex, ey, 26, `rgba(255,180,80,${.7 * bl})`); glowAt(ex + 40, ey, 26, `rgba(255,180,80,${.7 * bl})`); }
    // waves of dreams on the beats
    const b0 = lastBeat(92.95), list = [];
    for (let w = 0; w < 5; w++) { const tb = FEAT.beats[b0 + w]; if (!tb) continue;
      for (let j = 0; j < 12; j++) { const id = w * 12 + j, a = t - tb - hash(id + 300) * .15; if (a < 0) continue;
        const sx = 260 + hash(id + 1) * 560, sy = 880 + hash(id + 2) * 720, dir = hash(id + 3) * TAU, sp = 380 + hash(id + 4) * 300;
        const pos = (a) => [sx + Math.cos(dir) * (sp * a + 260 * a * a) + Math.sin(a * 5 + id) * 70, sy + Math.sin(dir) * (sp * a + 260 * a * a) - 160 * a + Math.cos(a * 4 + id) * 60];
        const [x, y] = pos(a), [x2, y2] = pos(a + .04), sz = Math.min(520, 60 + a * a * 300 + a * 90);
        list.push([sz, x, y, Math.atan2(y2 - y, x2 - x) + Math.PI / 2, id]); } }
    // the wiper: one big dragonfly flies at the lens
    const wa = t - (SEC.v3 + 5.02); if (wa > 0) list.push([lerp(80, 1700, ease.in(clamp(wa / .52))), 540 + wa * 120, 1250 - wa * 500, -.2, 7]);
    list.sort((p, q) => p[0] - q[0]);
    for (const [sz, x, y, ang, id] of list) bug(x, y, sz, ang, t, id % 3 === 1 ? 1 : 0, id);
    rain(t, 60, 53, .3);
    border(t, 1);
  }

  // ---- the Harlem walker swaggering up the avenue, the pistol butt peeking from his back pocket ----
  const WSC = 860, WGY = 1780;
  const walkPh = (t) => (beatPhase(t) - beatPhase(95.24)) / 2;           // one stride pair every two beats
  const walkX = (t) => 160 + walkPh(t) * walkStride(WSC, { who: 'walker', stride: 1.05 });
  function walkScene(t, cx) {
    sky(-200, 900);
    // the shopfronts across the pavement, one unit every 540 px, scrolling past as he walks
    for (let u = Math.floor((cx - 1400) / 540); u <= Math.floor((cx + 1400) / 540); u++) {
      const x0 = u * 540, lit = hash(u * 7 + 3) < .55, up = hash(u * 11 + 5) < .5;
      shape(s, [[x0, 200], [x0 + 540, 200], [x0 + 540, WGY], [x0, WGY]], u % 2 ? C.plum : C.teal, C.umber, 20);
      shape(s, [[x0 + 90, WGY - 40], [x0 + 90, 1060], ...circle(x0 + 270, 1060, 180, 40).filter(([, py]) => py <= 1060).sort((p, q) => p[0] - q[0]), [x0 + 450, 1060], [x0 + 450, WGY - 40]], lit ? C.amber : C.deep, C.umber, 20);
      if (lit) glowAt(x0 + 270, 1350, 380, 'rgba(255,180,100,.35)');
      shape(s, [[x0 + 20, 760], [x0 + 520, 760], [x0 + 520, 820], [x0 + 20, 820]], C.gold, C.umber, 12);
      for (const wx of [x0 + 150, x0 + 390]) { shape(s, [[wx - 60, 640], [wx - 60, 420], ...circle(wx, 420, 60, 24).filter(([, py]) => py <= 420).sort((p, q) => p[0] - q[0]), [wx + 60, 420], [wx + 60, 640]], up ? C.amber : C.night, C.umber, 14); if (up) glowAt(wx, 530, 140, 'rgba(255,190,110,.3)'); }
      line([[x0, 200], [x0, WGY]], C.ochre, 18);
      if (u % 3 === 0) guimard(x0 + 20, WGY, 1150, 1, 1, Math.sin(t + u) * 6);
    }
    s.fillStyle = vgrad(WGY, WGY + 600, [[0, '#2c2c48'], [1, C.dusk]]); s.fillRect(cx - 1400, WGY, 2800, 900);
    line([[cx - 1400, WGY + 6], [cx + 1400, WGY + 6]], C.umber, 16);
    for (let u = Math.floor((cx - 1400) / 540); u <= Math.floor((cx + 1400) / 540); u++) if (hash(u * 7 + 3) < .55) { s.fillStyle = C.amber; s.fillRect(u * 540 + 180 + Math.sin(t * 3 + u) * 10, WGY + 70, 180, 22); glowAt(u * 540 + 270, WGY + 80, 120, 'rgba(255,180,100,.25)'); }
  }
  // 95.24: tracking alongside the Harlem walker as he swaggers up the avenue, step on the beat
  function walker(t, lt, dur) {
    const x = walkX(t);
    cam(x + 120, kf(lt, [[0, 1250], [dur, 1180]]), kf(lt, [[0, .98], [dur, 1.04]]));
    walkScene(t, x);
    for (let j = 0; j < 4; j++) { const a = lt + j * .35; bug(x - 300 + j * 230 + Math.sin(a * 3) * 60, 900 - a * 260, 70, Math.sin(a * 2) * .5, t, j % 2, j + 90); }
    harlemWalker(t, x, WGY, WSC, { ph: walkPh(t), facing: 1 });
    rain(t, 70, 55, .3);
    border(t, 1);
  }
  // 97.5: close on his hip as he walks: the pistol butt only peeks from the back pocket, never in hand
  function pocket(t, lt, dur) {
    const x = walkX(t);
    cam(x - .02 * WSC, WGY - .5 * WSC + Math.sin(walkPh(t) * TAU * 2) * 10, kf(lt, [[0, 3.0], [dur, 3.3]]), -.03);
    walkScene(t, x);
    harlemWalker(t, x, WGY, WSC, { ph: walkPh(t), facing: 1 });
    for (let i = 0; i < 4; i++) { const ph = ((t * .7 + i * .27) % 1); glowAt(x - .12 * WSC + i * 26, WGY - .62 * WSC + ph * 200, 10, `rgba(220,235,255,${.8 * (1 - ph)})`); }
    rain(t, 50, 57, .25);
    border(t, 1);
  }

  // ---- a knight's helmet on a railing, a plain green note tucked behind its visor ----
  function helmet(t, x, y, sc, vis) {
    at(x, y, sc, 0, () => {
      // the plume streams back from the crest
      for (let i = 0; i < 5; i++) { const sw = Math.sin(t * 2.3 + i) * 18 + 50 * hit(t, FEAT.beats[lastBeat(t)], 4) * (i % 2 ? 1 : -1);
        vine(s, whip([40, -540], [120 + i * 30, -700 - i * 30 + sw], [300 + i * 50, -640 + sw], [360 + i * 60, -430 + i * 40 + sw], .7, 1, 30), 46 - i * 4, 10, [C.ruby, C.rose, C.blush, C.ruby, C.rose][i]); }
      shape(s, [[-190, 0], [190, 0], [150, -100], [-160, -100]], STEEL_D, C.umber, 16);
      const body = [...cub([160, -100], [215, -270], [200, -470], [40, -548], 18), ...cub([40, -548], [-110, -565], [-190, -450], [-185, -300], 18), [-165, -100]];
      shape(s, body, STEEL, C.umber, 18);
      line(cub([-150, -470], [-60, -560], [80, -560], [170, -430], 16), STEEL_D, 16);
      for (const k of [-1, 1]) line([[-160, -120 + k * 0], [150, -120]], STEEL_D, 14);
      // the opening under the visor, the note tucked in it
      shape(s, [[-188, -350], [-30, -362], [-10, -140], [-170, -120]], '#1d1824', C.umber, 14);
      const fl = Math.sin(t * 9) * .07 * vis, out = 90 * ease.out(inv(102.25, 103.4, t));
      s.save(); s.translate(-130 - out, -210 + out * .1); s.rotate(-.12 + fl);
      shape(s, [[-110, -38], [110, -38], [116, 38], [-104, 38]], NOTE, C.umber, 12); shape(s, [[-78, -18], [80, -18], [84, 18], [-74, 18]], null, NOTE_L, 8);
      s.restore();
      // the visor, a pointed beak; it pivots up on its rivet
      s.save(); s.translate(20, -290); s.rotate(1.15 * vis);
      shape(s, [[-50, -112], [-180, -100], [-272, 0], [-190, 90], [-170, 172], [-50, 160], [10, 50]], STEEL, C.umber, 18);
      line([[-215, -40], [-60, -50]], '#1d1824', 24);
      line([[-240, 10], [-50, 20]], STEEL_D, 12);
      s.restore();
      shape(s, circle(20, -290, 22, 14), C.gold, C.umber, 8);
      glowAt(-60, -480, 100, 'rgba(230,240,255,.28)');
    });
  }
  function railScene(t) {
    s.fillStyle = C.plum; s.fillRect(-W * 2, -H * 2, W * 5, H * 5);
    // a lit shop window behind, soft
    shape(s, [[120, 1800], [120, 700], ...circle(540, 700, 420, 40).filter(([, py]) => py <= 700).sort((a, b) => a[0] - b[0]), [960, 700], [960, 1800]], C.amber, C.umber, 24);
    for (let i = 1; i < 4; i++) line([[120 + i * 210, 1800], [120 + i * 210, 520]], C.ochre, 16);
    glowAt(540, 900, 700, 'rgba(255,180,100,.3)');
    // the railing: top rail and whiplash ironwork
    for (let i = 0; i < 7; i++) { const bx = -60 + i * 200; vine(s, whip([bx, 1700], [bx + 80, 1550], [bx - 40, 1400], [bx + 60, 1320], .7, i % 2 ? 1 : -1, 26), 22, 10, C.olive); line([[bx + 100, 1700], [bx + 100, 1220]], C.umber, 24); line([[bx + 100, 1700], [bx + 100, 1220]], C.olive, 12); }
    shape(s, [[-200, 1180], [1300, 1180], [1300, 1235], [-200, 1235]], C.olive, C.umber, 18);
    s.fillStyle = C.dusk; s.fillRect(-W, 1720, W * 3, 900);
  }
  // 99.57: the helmet on the railing, plume swaying, the note's corner peeking out
  function helm(t, lt, dur) {
    cam(kf(lt, [[0, 470], [dur, 580]]), kf(lt, [[0, 1020], [dur, 960]]), kf(lt, [[0, .98], [dur, 1.12]]));
    railScene(t); helmet(t, 520, 1182, 1.1, 0);
    rain(t, 70, 59, .3);
    border(t, 1);
  }
  // 101.57: close; the visor lifts on the beat and the note flutters inside
  function visor(t, lt, dur) {
    const vis = ease.back(inv(101.98, 102.4, t));
    cam(kf(lt, [[0, 470], [dur, 430]]), kf(lt, [[0, 900], [dur, 880]]), kf(lt, [[0, 1.65], [dur, 1.9]]) + hit(t, 101.98, 8) * .03);
    railScene(t); helmet(t, 520, 1182, 1.1, vis);
    glowAt(360 - 90 * ease.out(inv(102.25, 103.4, t)), 950, 110, `rgba(170,255,170,${.12 * vis})`);
    rain(t, 50, 61, .25);
    border(t, 1);
  }

  // ---- Mr. Knickerbocker leaves: from inside his doorway we watch him walk off into the rain ----
  // 103.86: looking out through the open door: he goes down the steps and away, shrinking into the rain,
  // wet footprints glinting behind him
  const knickU = (t) => ease.inOut(inv(103.86, 106.1, t));
  function door(t, lt, dur) {
    cam(540, kf(lt, [[0, 1000], [dur, 960]]), kf(lt, [[0, 1.0], [dur, 1.1]]));
    // outside: the street at night, the façades opposite, a lamp
    sky(-200, 1300);
    shape(s, [[-200, 300], [1300, 300], [1300, 1360], [-200, 1360]], '#4a3048', C.umber, 18);
    for (let i = 0; i < 5; i++) { const wx = 80 + i * 230, on = hash(i * 9 + 4) < .55;
      shape(s, [[wx - 60, 1300], [wx - 60, 900], ...circle(wx, 900, 60, 24).filter(([, py]) => py <= 900).sort((p, q) => p[0] - q[0]), [wx + 60, 900], [wx + 60, 1300]], on ? C.amber : C.night, C.umber, 14);
      if (on) glowAt(wx, 1100, 160, 'rgba(255,185,100,.3)');
      shape(s, [[wx - 50, 700], [wx - 50, 520], [wx + 50, 520], [wx + 50, 700]], hash(i + 30) < .4 ? C.amber : C.night, C.umber, 12); }
    s.fillStyle = vgrad(1360, 2100, [[0, '#262238'], [1, C.dusk]]); s.fillRect(-W, 1360, W * 3, 900);
    guimard(860, 1380, 640, -1, 1, Math.sin(t) * 6);
    for (let j = 0; j < 6; j++) { s.fillStyle = C.ruby; s.fillRect(660 + Math.sin(t * 3 + j) * 10, 1420 + j * 50, 70 - j * 8, 18); }
    // the light from the door, spilling down the steps and onto the wet pavement
    f.save(); f.globalCompositeOperation = 'lighter'; P(f, [[300, 1560], [780, 1560], [1000, 2100], [80, 2100]]); f.closePath(); f.fillStyle = 'rgba(255,170,90,.18)'; f.fill(); f.restore();
    shape(s, [[180, 1680], [900, 1680], [940, 1760], [140, 1760]], C.parch, C.umber, 16);
    shape(s, [[120, 1760], [960, 1760], [1010, 1860], [70, 1860]], C.ochre, C.umber, 16);
    shape(s, [[40, 1860], [1040, 1860], [1100, 1990], [-20, 1990]], C.parch, C.umber, 16);
    // his footprints, glinting where he has already trodden
    const u = knickU(t), path = (v) => [lerp(520, 640, v), lerp(1960, 1420, Math.pow(v, .8))];
    for (let i = 0; i < 9; i++) { const v = .12 + i * .1; if (v > u - .04) break; const [px, py] = path(v), sz = lerp(1, .35, v);
      shape(s, blobPts(px + (i % 2 ? 26 : -26) * sz, py, 30 * sz, 12 * sz, i + 20, .1, 18), '#5d6f98', C.umber, 8 * sz + 3);
      glowAt(px, py, 60 * sz, `rgba(200,225,255,${.5 + .3 * Math.sin(t * 5 + i)})`); }
    // Mr. Knickerbocker, from behind, walking away into the rain
    const [kx, ky] = path(u);
    knickerbocker(t, kx, ky, lerp(1000, 380, Math.pow(u, .7)), { ph: lt * 1.0, view: 'back' });
    rain(t, 90, 63, .4);
    // the doorway we look out of: dark jambs, the lintel, the open leaf catching the lamplight
    s.fillStyle = '#2a1e18'; s.fillRect(-W, -H, W + 130, H * 3); s.fillRect(950, -H, W * 2, H * 3); s.fillRect(-W, -H, W * 3, H + 260);
    shape(s, [[130, 260], [950, 260], [950, 330], [130, 330]], C.ochre, C.umber, 18);
    for (const x of [130, 950]) { line([[x, 260], [x, 2100]], C.umber, 30); line([[x, 260], [x, 2100]], C.ochre, 14); }
    shape(s, [[130, 330], [250, 380], [250, 2000], [130, 2100]], '#24433f', C.umber, 18);
    vine(s, [...Array(14)].map((_, i) => [190 + 20 * Math.sin(i * .7), 500 + i * 100]), 16, 8, C.sage);
    glowAt(540, 300, 700, 'rgba(255,170,90,.16)');
    border(t, 1);
  }
  // 106.1: down the avenue his footprints lead away; far off he turns the corner into a side street and is gone
  function prints(t, lt, dur) {
    cam(540, kf(lt, [[0, 1500], [1.1, 1060], [dur, 1040]]), kf(lt, [[0, 1.05], [dur, 1.12]]));
    const zc = 2600 + lt * 160, path = (z) => 120 * Math.sin(z / 1400) - 40;
    const kz = lerp(2600 + 2600, 2600 + 3700, ease.out(inv(106.1, 107.5, t)));        // his depth along the avenue
    avenue(t, zc, { towerLit: .35 });
    // the side street he turns into: a dark gap in the right-hand wall
    const g0 = kz + 60, g1 = kz + 420;
    shape(s, [pr(X0, TOP, g0 - zc), pr(X0, TOP, g1 - zc), pr(X0, GY, g1 - zc), pr(X0, GY, g0 - zc)], '#121624', C.umber, 10);
    glowAt(...pr(X0 + 300, 0, (g0 + g1) / 2 - zc), 90, 'rgba(255,170,90,.35)');
    for (let i = 0; i < 40; i++) {
      const z = 2600 + 200 + i * 230; if (z > kz - 120) break; const Z = z - zc; if (Z < 300 || Z > ZMAX) continue;
      const sd = i % 2 ? 1 : -1, cx = path(z) + sd * 55, k = FZ / Z, tr = 106.1 + i * .16;
      const sole = [...Array(16)].map((_, j) => { const th = j / 16 * TAU; return pr(cx + Math.cos(th) * 42, GY, Z + Math.sin(th) * 95); });
      const heel = [...Array(12)].map((_, j) => { const th = j / 12 * TAU; return pr(cx + Math.cos(th) * 36, GY, Z - 150 + Math.sin(th) * 38); });
      const on = t >= tr ? .3 + .7 * hit(t, tr, 2.5) : 0;
      for (const p of [sole, heel]) shape(s, p, on ? '#5d6f98' : '#3a4566', C.umber, clamp(14 * k, 3, 18));
      if (on) glowAt(...pr(cx, GY, Z - 40), 160 * k, `rgba(200,225,255,${on})`);
    }
    // him: back view far down the avenue, then sideways into the gap, clipped by the wall's edge
    const turn = ease.in(inv(107.45, 108.35, t)), KX = lerp(path(kz), X0 + 260, turn), KZ = kz - zc + 240 * turn, kk = FZ / KZ;
    const [kx, ky] = pr(KX, GY, KZ), edge = pr(X0, GY, KZ)[0];
    s.save(); s.beginPath(); s.rect(-W, -H, edge + W, H * 3); s.clip();
    knickerbocker(t, kx, ky, 1750 * kk, { ph: t * 1.0, view: turn > .05 ? 'profile' : 'back', facing: 1, back: 1 });
    s.restore();
    rain(t, 70, 65, .32);
    border(t, 1);
  }
  // 108.6: tilt up over the rooftops to the clock tower and push in until its face fills the frame
  function towerUp(t, lt, dur) {
    const u = ease.inOut(inv(0, dur, lt));
    cam(540, lerp(1250, 520, u), lerp(1.0, 2.0, ease.in(inv(.25, 1, u)) * .82 + u * .18));
    sky(-200, 1700);
    for (let i = 0; i < 20; i++) glowAt(hash(i + 400) * 1080, hash(i + 500) * 900 - 100, 8, `rgba(255,250,230,${.4 * (.5 + .5 * Math.sin(t * 2 + i))})`);
    at(540, 3120, 1, 0, () => tower(t, .12 + .1 * u));
    // rooftops in front of its base
    shape(s, [[-300, 2400], [-300, 1560], [60, 1560], [100, 1420], [140, 1420], [180, 1560], [400, 1600], [420, 1500], [470, 1500], [490, 1620], [740, 1620], [780, 1480], [900, 1480], [940, 1580], [1400, 1580], [1400, 2400]], '#2c2840', C.umber, 18);
    for (const [x, y] of [[230, 1700], [620, 1760], [1000, 1700]]) { shape(s, [[x - 40, y + 80], [x - 40, y], [x + 40, y], [x + 40, y + 80]], C.amber, C.umber, 12); glowAt(x, y + 40, 120, 'rgba(255,180,100,.4)'); }
    for (const [x, y] of [[120, 1420], [880, 1480]]) { const sm = whip([x, y - 20], [x + 40, y - 160], [x - 30, y - 260], [x + 60, y - 360 - Math.sin(t) * 20], .7, 1, 24); vine(s, sm, 26, 8, '#5a5670', inv(0, 1, .4 + lt * .3), null); }
    rain(t, 50, 67, .25);
    border(t, 1);
  }

  chapter('c05', SEC.v3, SEC.b1, [
    [SEC.v3, street],
    [92.9, swarm],
    [95.24, walker],
    [97.5, pocket],
    [99.57, helm],
    [101.57, visor],
    [103.86, door],
    [106.1, prints],
    [108.6, towerUp],
  ], { fx: PAINT });
})();
