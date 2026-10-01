// c05 · VERSE 3 (SEC.v3 - SEC.b1). The night avenue of dreams, tracking forward to the clock tower.
// Opens climbing out of a round iron hatch (c04 ends below decks); ends with the clock face filling the
// frame, exactly where c06 picks up (tower at q 1, face at (540, 520) r 330, cam zoom 2.0).
(() => {
  const DENIM = '#4d6585', DENIM_D = '#36486a', STEEL = '#a7aea4', STEEL_D = '#68737a', NOTE = '#6d8c55', NOTE_L = '#93ad78', HAT = '#2e2a3a';
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

  // ---- the washing line between two balconies, jeans on it, a pistol grip in the back pocket ----
  function jeans(x, y, sc, sway, t) {
    at(x, y, sc, sway, () => {
      const lw = 16, kick = Math.sin(t * 4.3) * 10;
      shape(s, [[-150, 0], [150, 0], [160, 300], [150 + kick, 840], [22 + kick, 840], [8, 270], [-8, 270], [-22 - kick * .6, 840], [-150 - kick * .6, 840], [-160, 300]], DENIM, C.umber, lw);
      line([[90, 330], [88 + kick * .5, 820]], DENIM_D, 14); line([[-90, 330], [-88 - kick * .3, 820]], DENIM_D, 14);
      shape(s, [[-150, 0], [150, 0], [152, 56], [-152, 56]], DENIM_D, C.umber, lw);
      for (const bx of [-110, -30, 50, 120]) shape(s, [[bx - 9, -4], [bx + 9, -4], [bx + 9, 66], [bx - 9, 66]], DENIM, C.umber, 8);
      shape(s, [[0, 56], [8, 270], [-8, 270]], DENIM_D, C.umber, 8);
      const pocketP = (px) => shape(s, [[px * 30, 92], [px * 132, 86], [px * 128, 200], [px * 82, 236], [px * 36, 206]], DENIM_D, C.umber, 12);
      pocketP(-1);
      // the pistol grip: a walnut bird's-head butt and the steel hammer above the pocket, still, never handled
      s.save(); s.translate(104, 72); s.rotate(.18); s.scale(-1.25, 1.25);
      // steel frame at the pocket mouth: trigger guard loop in front, hammer spur behind
      for (const [c, w] of [[C.umber, 26], [STEEL, 12]]) { s.lineWidth = w; s.strokeStyle = c; s.beginPath(); s.arc(-44, 14, 32, Math.PI * .95, Math.PI * 2.0); s.stroke(); }
      shape(s, [[-30, 26], [50, 26], [48, -30], [-26, -36]], STEEL, C.umber, 12);
      shape(s, [[30, -34], [50, -36], [104, -60], [98, -80], [36, -54]], STEEL, C.umber, 11);
      // the walnut bird's-head grip, leaning back, its butt hooked forward
      const grip = [[-24, -32], [-30, -90], [-24, -146], [-40, -184], [-80, -206], [-82, -238], [-40, -262], [20, -262], [62, -232], [72, -176], [60, -104], [46, -32]];
      shape(s, grip, C.ochre, C.umber, 13);
      shape(s, [[-10, -50], [-14, -140], [-24, -186], [10, -220], [44, -196], [50, -130], [36, -50]], '#7a5426', null);
      line([[62, -232], [72, -176], [60, -104], [46, -32]], STEEL, 12);
      s.restore();
      pocketP(1);
      for (const px of [-1, 1]) line([[px * 36, 120], [px * 82, 150], [px * 128, 116]], C.gold, 7);
      glowAt(50, -60, 60, 'rgba(255,230,190,.2)');
      for (const px of [-1, 1]) shape(s, [[px * 140 - 16, -50], [px * 140 + 16, -50], [px * 140 + 14, 40], [px * 140 - 14, 40]], C.parch, C.umber, 10);
    });
  }
  function balcony(x, y, w, sd) {
    shape(s, [[x, y], [x + w * sd, y], [x + w * sd + 20 * sd, y + 50], [x, y + 50]], C.parch, C.umber, 16);
    shape(s, [[x, y], [x + w * sd, y], [x + w * sd, y - 260], [x, y - 260]], null, C.umber, 30);
    line([[x, y - 260], [x + w * sd, y - 260]], C.olive, 14);
    for (let i = 0; i < 3; i++) { const bx = x + w * sd * (i + .5) / 3; vine(s, whip([bx, y], [bx - 50 * sd, y - 90], [bx + 60 * sd, y - 170], [bx + 10 * sd, y - 230], .6, sd, 24), 16, 8, C.olive); }
  }
  function lineScene(t) {
    sky(-200, 1500);
    // the back façade across the street, its windows lit
    shape(s, [[100, 1500], [100, 1000], [380, 1000], [540, 900], [700, 1000], [980, 1000], [980, 1500]], '#4a3048', C.umber, 18);
    for (let r = 0; r < 2; r++) for (let i = 0; i < 6; i++) { const wx = 210 + i * 132, wy = 1080 + r * 200, on = hash(i * 5 + r * 31 + 3) < .5;
      shape(s, [[wx - 34, wy + 120], [wx - 34, wy + 30], ...circle(wx, wy + 30, 34, 20).filter(([, py]) => py <= wy + 30).sort((a, b) => a[0] - b[0]), [wx + 34, wy + 30], [wx + 34, wy + 120]], on ? C.amber : C.night, C.umber, 12);
      if (on) glowAt(wx, wy + 70, 110, 'rgba(255,185,100,.3)'); }
    shape(s, circle(540, 980, 40, 24), C.gold, C.umber, 12);
    // the two façades and their balconies
    shape(s, [[-300, -400], [170, -400], [170, 2400], [-300, 2400]], C.plum, C.umber, 22);
    shape(s, [[910, -400], [1400, -400], [1400, 2400], [910, 2400]], C.teal, C.umber, 22);
    for (const [x, y, c] of [[20, 1000, C.amber], [990, 1050, C.night], [30, 260, C.night], [1000, 330, C.amber]]) {
      shape(s, [[x - 80, y + 260], [x - 80, y], ...circle(x, y, 80, 28).filter(([, py]) => py <= y).sort((a, b) => a[0] - b[0]), [x + 80, y], [x + 80, y + 260]], c, C.umber, 18);
      if (c === C.amber) glowAt(x, y + 120, 260, 'rgba(255,185,100,.35)');
    }
    balcony(170, 820, 170, 1); balcony(910, 800, 170, -1);
    // street below: wet, lamplight puddles
    s.fillStyle = vgrad(1500, 2400, [[0, '#262238'], [1, C.dusk]]); s.fillRect(160, 1500, 760, 900);
    for (let i = 0; i < 5; i++) { s.fillStyle = C.amber; s.fillRect(300 + i * 110 + Math.sin(t * 3 + i) * 10, 1700 + (i % 2) * 60, 50, 18); glowAt(325 + i * 110, 1710 + (i % 2) * 60, 70, 'rgba(255,180,100,.25)'); }
    // the line, sagging where the jeans pull it
    const sway = .06 * Math.sin(t * 2.2) + .05 * beatPulse(t, 3) * Math.sin(t * 9), jx = 560, jy = 760 + Math.sin(t * 2.2) * 8;
    const pl = [jx - 112 * Math.cos(sway), jy - 112 * Math.sin(sway)], prr = [jx + 112 * Math.cos(sway), jy + 112 * Math.sin(sway)];
    const ln = [...cub([250, 560], [330, 640], [pl[0] - 120, pl[1] - 40], pl, 16), prr, ...cub(prr, [prr[0] + 120, prr[1] - 40], [760, 620], [830, 560], 16)];
    line(ln, C.umber, 14); line(ln, C.parch, 5);
    // a striped towel further along the line
    const tw = Math.sin(t * 2.5) * 18;
    shape(s, [[300, 610], [420, 680], [430, 900 + tw], [306, 860 + tw * .7]], C.cream, C.umber, 16);
    for (const v of [.35, .7]) line([[300 + 6 * v, lerp(610, 860 + tw * .7, v)], [420 + 10 * v, lerp(680, 900 + tw, v)]], C.rose, 18);
    jeans(jx, jy, .8, sway, t);
  }
  // 95.24: up from the street to the washing line between the balconies; the jeans swing in the wind
  function lineWide(t, lt, dur) {
    cam(kf(lt, [[0, 520], [dur, 560]]), kf(lt, [[0, 1350], [dur, 900]]), kf(lt, [[0, .95], [dur, 1.1]]));
    lineScene(t);
    // the last few dreams fluttering off upward
    for (let j = 0; j < 5; j++) { const a = lt + j * .3; bug(200 + j * 170 + Math.sin(a * 3) * 60, 1400 - a * 520, 70, Math.sin(a * 2) * .5, t, j % 2, j + 90); }
    rain(t, 70, 55, .32);
    border(t, 1);
  }
  // 97.5: close on the back pocket: the pistol grip sits there, still, rain running off it
  function pocket(t, lt, dur) {
    cam(kf(lt, [[0, 650], [dur, 620]]), kf(lt, [[0, 800], [dur, 830]]), kf(lt, [[0, 2.1], [dur, 2.35]]), -.05 + Math.sin(t * 1.2) * .01);
    lineScene(t);
    for (let i = 0; i < 4; i++) { const ph = ((t * .7 + i * .27) % 1); glowAt(610 + i * 30, 760 + ph * 300, 10, `rgba(220,235,255,${.8 * (1 - ph)})`); }
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

  // ---- the door ajar, a bowler and a cane on the steps, wet footprints leading away ----
  // 103.86: push in on the doorway; the door creaks wider on the beat, lamplight spilling on the steps
  function door(t, lt, dur) {
    cam(kf(lt, [[0, 540], [dur, 600]]), kf(lt, [[0, 1080], [dur, 1240]]), kf(lt, [[0, .95], [dur, 1.25]]));
    s.fillStyle = C.teal; s.fillRect(-W * 2, -H * 2, W * 5, H * 5);
    for (let i = 0; i < 8; i++) line([[-200, 200 + i * 260], [1300, 200 + i * 260]], C.deep, 14);
    // stone surround and the fan transom
    shape(s, [[200, 1520], [200, 760], ...circle(540, 760, 340, 50).filter(([, py]) => py <= 760).sort((a, b) => a[0] - b[0]), [880, 760], [880, 1520]], C.parch, C.umber, 24);
    const flick = .85 + .15 * noise1(t * 6, 3);
    shape(s, [[260, 800], ...circle(540, 800, 280, 50).filter(([, py]) => py <= 800).sort((a, b) => a[0] - b[0]), [820, 800]], C.deep, C.umber, 18);
    for (let i = 0; i < 6; i++) { const a0 = Math.PI + i / 6 * Math.PI, a1 = a0 + Math.PI / 6;
      shape(s, [[540, 800], [540 + Math.cos(a0) * 270, 800 + Math.sin(a0) * 270], [540 + Math.cos((a0 + a1) / 2) * 280, 800 + Math.sin((a0 + a1) / 2) * 280], [540 + Math.cos(a1) * 270, 800 + Math.sin(a1) * 270]], [C.amber, C.rose, C.gold, C.amber, C.rose, C.gold][i], C.umber, 14);
      glowAt(540 + Math.cos((a0 + a1) / 2) * 180, 800 + Math.sin((a0 + a1) / 2) * 180, 140, `rgba(255,190,110,${.35 * flick})`); }
    shape(s, circle(540, 800, 70, 30), C.gold, C.umber, 14);
    // the doorway: warm light inside, the leaf swung part open on its left hinge
    shape(s, [[270, 1500], [270, 820], [810, 820], [810, 1500]], C.amber, C.umber, 18);
    glowAt(620, 1150, 520, `rgba(255,180,100,${.45 * flick})`);
    const a = .62 + .16 * ease.back(inv(104.5, 105.1, t)) + .02 * Math.sin(t * 3), x1 = 270 + 540 * Math.cos(a);
    const leaf = [[270, 820], [x1, 820 - 70 * Math.sin(a)], [x1, 1500 + 60 * Math.sin(a)], [270, 1500]];
    shape(s, leaf, '#24433f', C.umber, 20);
    const lx = (u) => lerp(270, x1, u), ly = (u, v) => lerp(lerp(820, 820 - 70 * Math.sin(a), u), lerp(1500, 1500 + 60 * Math.sin(a), u), v);
    vine(s, [...Array(20)].map((_, i) => [lx(.5 + .25 * Math.sin(i / 19 * 5)), ly(.5, .1 + i / 19 * .8)]), 18, 8, C.sage);
    shape(s, circle(lx(.88), ly(.88, .55), 20, 14), C.gold, C.umber, 10);
    // the light spills down the steps
    f.save(); f.globalCompositeOperation = 'lighter'; P(f, [[x1, 1500], [810, 1500], [930, 1760], [x1 + 40, 1760]]); f.closePath(); f.fillStyle = `rgba(255,170,90,${.22 * flick})`; f.fill(); f.restore();
    // steps
    shape(s, [[240, 1500], [840, 1500], [860, 1570], [220, 1570]], C.parch, C.umber, 16);
    shape(s, [[180, 1570], [900, 1570], [930, 1650], [150, 1650]], C.ochre, C.umber, 16);
    shape(s, [[110, 1650], [970, 1650], [1010, 1750], [70, 1750]], C.parch, C.umber, 16);
    s.fillStyle = C.dusk; s.fillRect(-W, 1750, W * 3, 900);
    // the cane leaning on the jamb
    line([[760, 1648], [868, 1130]], C.umber, 30); line([[760, 1648], [868, 1130]], C.ochre, 16);
    const crook = [...Array(16)].map((_, i) => { const th = Math.PI + i / 15 * Math.PI * 1.1; return [904 + Math.cos(th) * 38, 1130 + Math.sin(th) * 38]; });
    line(crook, C.umber, 32); line(crook, C.gold, 16);
    // the bowler on the middle step
    const hx = 560, hy = 1612;
    shape(s, blobPts(hx, hy, 150, 34, 4, .03, 30), HAT, C.umber, 16);
    shape(s, [...cub([hx - 95, hy - 4], [hx - 110, hy - 140], [hx + 110, hy - 140], [hx + 95, hy - 4], 24)], HAT, C.umber, 16);
    shape(s, [[hx - 96, hy - 30], [hx + 96, hy - 30], [hx + 94, hy - 4], [hx - 94, hy - 4]], C.ruby, C.umber, 10);
    glowAt(hx - 40, hy - 100, 60, 'rgba(255,200,140,.25)');
    // wet footprints off the steps, glinting
    for (let i = 0; i < 4; i++) { const px = 330 - i * 70 + (i % 2) * 50, py = 1700 + i * 70; shape(s, blobPts(px, py, 30 + i * 6, 14 + i * 4, i + 20, .1, 20), '#2a2638', null); glowAt(px, py, 40 + i * 8, `rgba(200,220,255,${.4 + .3 * Math.sin(t * 5 + i)})`); }
    rain(t, 60, 63, .3);
    border(t, 1);
  }
  // 106.1: the footprints lead off down the avenue toward the tower, glinting one by one on the beat
  function prints(t, lt, dur) {
    cam(540, kf(lt, [[0, 1600], [dur, 1060]]), kf(lt, [[0, 1.05], [dur, 1.0]]));
    const zc = 2600 + lt * 160;
    avenue(t, zc, { towerLit: .35 });
    const path = (z) => 150 * Math.sin(z / 1400) - 60;
    for (let i = 0; i < 26; i++) {
      const z = 2600 + 200 + i * 230, Z = z - zc; if (Z < 140 || Z > ZMAX) continue;
      const sd = i % 2 ? 1 : -1, cx = path(z) + sd * 55, k = FZ / Z, tr = 106.1 + i * .25;
      const sole = [...Array(16)].map((_, j) => { const th = j / 16 * TAU; return pr(cx + Math.cos(th) * 42, GY, Z + Math.sin(th) * 95); });
      const heel = [...Array(12)].map((_, j) => { const th = j / 12 * TAU; return pr(cx + Math.cos(th) * 36, GY, Z - 150 + Math.sin(th) * 38); });
      const on = t >= tr ? .3 + .7 * hit(t, tr, 2.5) : 0;
      for (const p of [sole, heel]) shape(s, p, on ? '#5d6f98' : '#3a4566', C.umber, clamp(14 * k, 3, 18));
      if (on) { const [gx, gy] = pr(cx, GY, Z - 40); glowAt(gx, gy, 160 * k, `rgba(200,225,255,${on})`); }
    }
    rain(t, 60, 65, .28);
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
    [95.24, lineWide],
    [97.5, pocket],
    [99.57, helm],
    [101.57, visor],
    [103.86, door],
    [106.1, prints],
    [108.6, towerUp],
  ], { fx: PAINT });
})();
