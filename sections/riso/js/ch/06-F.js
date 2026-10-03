// Section F (v1), 129.9167-169.75: vamp as pop-poster party, Warhol grids, red-carpet cameo, then the abstract ink-storm instrumental.
// Character kit below is copied from the look test (bobwiseman-airplane-riso/js/ch/01-airplane.js).
(() => {
  const C = (a, b, c) => `rgb(${Math.round(clamp(a) * 255)},${Math.round(clamp(b) * 255)},${Math.round(clamp(c) * 255)})`;
  const PAPER = C(0, 0, 0), KEY = C(1, 1, 0), PINK = C(1, 0, 0), TEAL = C(0, 1, 0), YEL = C(0, 0, 1);
  const RED = C(1, 0, 1), GREEN = C(0, 1, 1);
  const STRANGE = 78.38, MNUH = [79.13, 79.73, 80.30], LINE2 = 80.88, SICK = 86.6;
  const tri = (x, w) => clamp(1 - Math.abs(x) / w);
  const wrap = (x, m) => ((x % m) + m) % m;
  let FRI = 0;                      // drawing index (12 per second)
  const ta = (t) => Math.floor(t * 12) / 12;

  // ---- separation drawing ----
  const over = () => { s.globalCompositeOperation = 'source-over'; };
  const lighten = () => { s.globalCompositeOperation = 'lighten'; };
  const BOIL = 1.4;
  const jit = (x, y) => [x + (hash((FRI * 7919 + Math.round(x) * 131 + Math.round(y) * 17) >>> 0) - .5) * BOIL,
    y + (hash((FRI * 6271 + Math.round(x) * 37 + Math.round(y) * 211) >>> 0) - .5) * BOIL];
  function pathPts(pts, smooth) {
    const p = pts.map(([x, y]) => jit(x, y)), n = p.length; s.beginPath();
    if (!smooth) { p.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y)); s.closePath(); return; }
    const m = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; s.moveTo(...m(p[n - 1], p[0]));
    for (let i = 0; i < n; i++) { const q = m(p[i], p[(i + 1) % n]); s.quadraticCurveTo(p[i][0], p[i][1], q[0], q[1]); } s.closePath();
  }
  function paint(col, o) {
    if (col) { if (o.op) lighten(); s.fillStyle = col; s.fill(); over(); }
    if (o.lw) { s.lineWidth = o.lw; s.strokeStyle = o.line || KEY; s.lineJoin = 'round'; s.lineCap = 'round'; s.stroke(); }
  }
  function shape(pts, col, o = {}) { pathPts(pts, o.smooth); paint(col, o); }
  function ell(x, y, rx, ry, col, o = {}) { const [jx, jy] = jit(x, y); s.beginPath(); s.ellipse(jx, jy, Math.max(.1, rx), Math.max(.1, ry), o.rot || 0, 0, TAU); paint(col, o); }
  function rrect(x, y, w, h, r, col, o = {}) { s.beginPath(); s.roundRect(x, y, w, h, r); paint(col, o); }
  function stroke(pts, col, w) { const p = pts.map(([x, y]) => jit(x, y)); s.beginPath(); p.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y)); s.lineWidth = w; s.strokeStyle = col; s.lineCap = 'round'; s.lineJoin = 'round'; s.stroke(); }
  function sheet(col) { s.fillStyle = col; s.fillRect(-W, -H, W * 3, H * 3); }

  // ---- the character's parts ----
  const PAL0 = { body: PAPER, key: KEY, glass: TEAL, wing: YEL, fin: TEAL, tip: PINK, cheek: C(.45, 0, 0), ring: PINK };
  function eye(cx, cy, rx, ry, o, i, lw, body) {
    const { look = [.5, .1], lid = 0, spiral = 0, t = 0 } = o;
    ell(cx, cy, rx, ry, PAPER, { lw: lw * 1.15, line: o.pal.key });
    withT(() => {
      s.beginPath(); s.ellipse(cx, cy, rx, ry, 0, 0, TAU); s.clip();
      if (spiral < 1) {
        const px = cx + look[0] * rx * .45, py = cy + look[1] * ry * .45, r = rx * .44;
        ell(px, py, r, r * 1.08, o.pal.key);
        ell(px - r * .35, py - r * .38, r * .28, r * .28, PAPER);
      }
      if (spiral > 0) {
        const pts = []; for (let a = 0; a < TAU * 2.8; a += .25) { const r = a * rx * .055, aa = a + t * 12 * (i ? -1 : 1); pts.push([cx + Math.cos(aa) * r, cy + Math.sin(aa) * r * ry / rx]); }
        stroke(pts, o.pal.key, lw * 1.1);
      }
      if (lid > 0) {
        const ly = cy - ry + lid * ry * 2.05;
        s.beginPath(); s.moveTo(cx - rx - 6, cy - ry - 6); s.lineTo(cx + rx + 6, cy - ry - 6); s.lineTo(cx + rx + 6, ly - 6);
        s.quadraticCurveTo(cx, ly + 10, cx - rx - 6, ly - 6); s.closePath(); s.fillStyle = body; s.fill();
        s.beginPath(); s.moveTo(cx - rx - 6, ly - 6); s.quadraticCurveTo(cx, ly + 10, cx + rx + 6, ly - 6); s.lineWidth = lw * 1.1; s.strokeStyle = o.pal.key; s.stroke();
      }
    });
  }
  function mouth(cx, cy, hw, open, lw, pal) {
    const L = [cx - hw, cy], R = [cx + hw, cy + 2], up = [cx, cy + 14], dn = [cx, cy + 14 + 150 * open * hw / 80];
    if (open < .06) { stroke([L, [cx - hw * .5, cy + 12], [cx, cy + 16], [cx + hw * .5, cy + 12], R], pal.key, lw * 1.4); return; }
    const mp = () => { s.beginPath(); s.moveTo(...L); s.quadraticCurveTo(...up, ...R); s.quadraticCurveTo(...dn, ...L); s.closePath(); };
    mp(); s.fillStyle = pal.key; s.fill();
    withT(() => { mp(); s.clip();
      ell(cx + 4, (cy + dn[1]) / 2 + 26 * open * hw / 80, hw * .5, hw * (.16 + .1 * open), PINK);
      s.beginPath(); s.moveTo(...L); s.quadraticCurveTo(...up, ...R); s.lineWidth = hw * .2; s.strokeStyle = PAPER; s.stroke(); });
    mp(); s.lineWidth = lw; s.strokeStyle = pal.key; s.stroke();
  }
  function brows(eyes, raise, tilt, lw, pal) {   // tilt > 0 cross, < 0 worried
    eyes.forEach(([ex, ey, rx, ry], i) => {
      const inner = i ? -1 : 1, by = ey - ry - 22 - raise * 24;
      const a = [ex - rx * .75, by + (inner < 0 ? tilt * 18 : -tilt * 6)], b = [ex + rx * .75, by + (inner > 0 ? tilt * 18 : -tilt * 6)];
      stroke([a, [(a[0] + b[0]) / 2, Math.min(a[1], b[1]) - 9], b], pal.key, lw * 2.2);
    });
  }
  // a prop seen face-on: tinted disc, three blades plus a ghost of where they were a drawing ago
  function propFace(cx, cy, R, spin, lw, pal) {
    ell(cx, cy, R, R, C(0, 0, .3), { op: 1 });
    ell(cx, cy, R, R, null, { lw: lw * .35, line: C(.5, .5, 0) });
    for (const [g, col] of [[.42, C(.3, .3, 0)], [0, pal.key]]) for (let i = 0; i < 3; i++) {
      const a = spin - g + i * TAU / 3, ca = Math.cos(a), sa = Math.sin(a), w = R * .1;
      const pts = [[cx - sa * w * .6, cy + ca * w * .6], [cx + ca * R * .5 - sa * w, cy + sa * R * .5 + ca * w], [cx + ca * R * .97, cy + sa * R * .97], [cx + ca * R * .5 + sa * w, cy + sa * R * .5 - ca * w], [cx + sa * w * .6, cy - ca * w * .6]];
      if (g) { pathPts(pts, true); lighten(); s.fillStyle = col; s.fill(); over(); } else shape(pts, col, { smooth: true });
    }
    ell(cx, cy, R * .13, R * .13, pal.ring, { lw: lw * .6, line: pal.key });
  }
  // a prop seen side-on (the disc is edge-on: a tall thin ellipse)
  function propSide(cx, cy, R, spin, lw, pal) {
    ell(cx, cy, R * .28, R, C(0, 0, .3), { op: 1, lw: lw * .3, line: C(.5, .5, 0) });
    for (let i = 0; i < 3; i++) { const a = spin + i * TAU / 3, tip = [cx + Math.sin(a) * R * .28, cy + Math.cos(a) * R]; if (Math.sin(a) < -.2) continue; stroke([[cx, cy], tip], pal.key, R * .13); }
    ell(cx + R * .08, cy, R * .17, R * .17, pal.ring, { lw: lw * .6, line: pal.key });
  }

  // ---- HEAD-ON plane: origin on the road under his middle; local units, 1 = 1 px at k = 1 ----
  const FEYES = [[-88, -505, 68, 78], [88, -505, 68, 78]];
  function frontPlane(x, y, k, o) {
    const { open = 0, bob = 0, spin = 0, pal = PAL0, tilt = 0, sq = 0 } = o; o = { ...o, pal };
    withT(() => {
      s.translate(x, y); s.scale(k, k);
      const lw = 7;
      ell(0, -4, 560, 38, C(0, .6, 0), { op: 1 });                                    // shadow on the road
      // tyres stay on the road; everything else bobs
      for (const sd of [-1, 1]) {
        withT(() => { s.translate(sd * 150, 0); s.scale(1 + sq * .4, 1 - sq); rrect(-46, -152, 92, 152, 34, pal.key);
          ell(sd * 18, -78, 16, 44, PAPER, { lw: 4, line: pal.key }); stroke([[-40, -40], [40, -40]], C(.3, .3, 0), 5); });
      }
      s.translate(0, bob); s.rotate(tilt);
      shape([[-24, -600], [-34, -800], [34, -800], [24, -600]], pal.fin, { lw: lw * .9 });                 // fin
      shape([[-310, -640], [310, -640], [296, -666], [-296, -666]], pal.fin, { lw: lw * .8 });              // tailplane
      for (const sd of [-1, 1]) {                                                                           // the too-long wings
        shape([[sd * 110, -300], [sd * 1340, -382], [sd * 1352, -416], [sd * 110, -376]], pal.wing, { lw });
        shape([[sd * 1150, -370], [sd * 1340, -382], [sd * 1352, -416], [sd * 1150, -404]], pal.tip, { lw });
        stroke([[sd * 200, -345], [sd * 1100, -398]], C(.25, 0, 0), 4);
      }
      for (const sd of [-1, 1]) for (const ex of [470, 860]) {                                              // engines and props
        const ey = -342 - (ex - 110) * .067, R = ex > 600 ? 170 : 200;
        ell(sd * ex, ey, 74, 74, pal.body, { lw: lw * .9, line: pal.key });
        ell(sd * ex, ey, 56, 56, null, { lw: 13, line: pal.ring });
        propFace(sd * ex, ey, R, spin * sd + ex, lw, pal);
      }
      for (const sd of [-1, 1]) stroke([[sd * 70, -190], [sd * 150, -110]], pal.key, 20);                   // gear legs
      ell(0, -380, 252, 252, pal.body, { lw: lw * 1.25, line: pal.key });                                    // fuselage
      lighten(); s.beginPath(); s.arc(0, -380, 150, 0, TAU); s.lineWidth = 4; s.strokeStyle = C(.22, .22, 0); s.stroke(); over();                                     // radome panel line: the nose is his own nose cone (FACE.md)
      ell(-30, -500, 160, 70, C(0, 0, 0), {});
      shape([[-200, -468], [-120, -446], [0, -438], [120, -446], [200, -468], [190, -540], [100, -578], [0, -588], [-100, -578], [-190, -540]], pal.glass, { smooth: true, lw: lw * .8, line: pal.key });
      for (const sd of [-1, 1]) ell(sd * 160, -318, 40, 30, pal.cheek, { op: 1 });
      FEYES.forEach(([ex, ey, rx, ry], i) => eye(ex, ey, rx, ry, o, i, lw, pal.body));
      brows(FEYES, o.brow?.[0] || 0, o.brow?.[1] || 0, lw, pal);
      mouth(0, -330, 78, open, lw, pal);
    });
  }

  // ---- SIDE-ON plane, facing +x; origin on the road under his middle ----
  const FUSE = [[284, -168], [270, -232], [195, -270], [60, -276], [-110, -264], [-250, -246], [-340, -240], [-354, -214], [-302, -186], [-230, -136], [-110, -102], [60, -92], [200, -90], [268, -114]];
  const SEYES = [[172, -228, 30, 38], [232, -224, 28, 36]];
  function tyreSide(cx, cy, r, ang, sq, pal) {
    withT(() => { s.translate(cx, cy + r); s.scale(1 + sq * .5, 1 - sq); s.translate(-cx, -cy - r);
      ell(cx, cy, r, r, pal.key); ell(cx, cy, r * .62, r * .62, PAPER); ell(cx, cy, r * .44, r * .44, null, { lw: 3, line: pal.key });
      for (let i = 0; i < 4; i++) { const a = ang + i * TAU / 4; stroke([[cx, cy], [cx + Math.cos(a) * r * .42, cy + Math.sin(a) * r * .42]], pal.key, 4); }
      ell(cx, cy, r * .14, r * .14, PINK, { lw: 3, line: pal.key }); });
  }
  function sidePlane(x, y, k, o, between) {
    const { open = 0, bob = 0, spin = 0, roll = 0, sq = 0, hop = 0, pal = PAL0 } = o; o = { ...o, pal };
    withT(() => {
      s.translate(x, y + hop); s.scale(k, k);
      const lw = 6 / Math.sqrt(k);
      ell(-20, -2, 380, 26, C(0, .6, 0), { op: 1 });
      withT(() => { s.translate(0, bob);
        shape([[50, -150], [-110, -390], [-150, -400], [-182, -390], [-80, -146]], C(0, 0, .55), { lw });       // far wing
        ell(-60, -300, 44, 15, pal.body, { lw: lw * .8 }); propSide(-14, -300, 40, spin + 1, lw, pal);
        shape([[-228, -240], [-298, -400], [-352, -404], [-360, -234]], pal.fin, { lw });                    // fin
        ell(-318, -330, 20, 20, YEL);
        shape(FUSE, pal.body, { smooth: true, lw: lw * 1.2 });
        withT(() => { pathPts(FUSE, true); s.clip();
          shape([[-380, -184], [120, -164], [178, -150], [120, -140], [-380, -160]], PINK);                  // cheat line
          stroke([[-380, -150], [118, -132]], YEL, 6); });
        for (let i = 0; i < 6; i++) { const wx = -250 + i * 58; ell(wx, -206, 15, 15, pal.glass, { lw: lw * .7 }); ell(wx - 5, -211, 4, 4, PAPER); }
        shape([[-250, -206], [-320, -208], [-374, -150], [-340, -146]], C(0, 0, .55), { lw });               // near stabiliser
      });
      for (const tx of [120, -175]) tyreSide(tx, -50, 50, roll, sq, pal);
      withT(() => { s.translate(0, bob);
        for (const tx of [120, -175]) { s.beginPath(); s.arc(tx, -50, 68, Math.PI * 1.02, Math.PI * 1.98); s.arc(tx, -50, 56, Math.PI * 1.98, Math.PI * 1.02, true); s.closePath(); paint(pal.body, { lw: lw * .8 }); }
        shape([[128, -272], [264, -262], [274, -190], [132, -184]], pal.glass, { lw: lw * .8 });
        SEYES.forEach(([ex, ey, rx, ry], i) => eye(ex, ey, rx, ry, o, i, lw * .8, pal.body));
        brows(SEYES.map(([a, b, c, d]) => [a, b + 6, c, d]), o.brow?.[0] || 0, o.brow?.[1] || 0, lw * .55, pal);
        mouth(236, -128, 38, open * .9, lw * .8, pal);
        withT(() => { pathPts(FUSE, true); s.clip(); lighten(); s.beginPath(); s.moveTo(250, -246); s.quadraticCurveTo(232, -170, 254, -100); s.lineWidth = 3.5; s.strokeStyle = C(.22, .22, 0); s.stroke(); over(); });   // radome panel line, no ball nose (FACE.md)
        ell(196, -150, 16, 12, pal.cheek, { op: 1 });
      });
      if (between) withT(() => { s.scale(1 / k, 1 / k); s.translate(-x, -y - hop); between(); });
      withT(() => { s.translate(0, bob);                                                                     // near wing, too long
        const NW = [[60, -116], [-100, 190], [-132, 206], [-188, 192], [-72, -108]];
        shape(NW, pal.wing, { lw });
        withT(() => { pathPts(NW, false); s.clip(); shape([[-200, 150], [0, 150], [0, 260], [-200, 260]], pal.tip); });
        for (const [f, R] of [[.3, 58], [.64, 52]]) {
          const lx = 60 + (-100 - 60) * f, ly = -116 + (190 + 116) * f;
          ell(lx - 4, ly, 52, 19, pal.body, { lw: lw * .8 }); ell(lx + 40, ly, 7, 19, pal.ring);
          propSide(lx + 50, ly, R, spin + f * 3, lw, pal);
        }
      });
    });
  }

  // the character's state from the song
  function base(t) {
    const T = ta(t), b = beatPulse(T, 7);
    const blink = Math.max(...[72.4, 74.0, 76.1, 82.1, 85.0, 88.0].map((bt) => tri(T - bt, .1)));
    return { t: T, open: clamp((F('voc', T, 1) - .07) / .4), bob: b * 10, sq: b * .06, lid: blink, spin: T * TAU * 1.9, roll: T * 15 };
  }
  function regMark(x, y, r) {   // a registration mark printed in all three inks: it shows the misregistration
    for (const col of [PINK, TEAL, YEL]) { lighten(); ell(x, y, r, r, null, { lw: 3, line: col }); s.globalCompositeOperation = 'lighten'; stroke([[x - r * 1.5, y], [x + r * 1.5, y]], col, 3); s.globalCompositeOperation = 'lighten'; stroke([[x, y - r * 1.5], [x, y + r * 1.5]], col, 3); over(); }
  }
  function border(m) {
    s.beginPath(); s.rect(-W, -H, W * 3, H * 3); s.rect(m, m, W - 2 * m, H - 2 * m); s.fillStyle = PAPER; s.fill('evenodd');
    for (const [x, y] of [[m / 2, m / 2], [W - m / 2, m / 2], [m / 2, H - m / 2], [W - m / 2, H - m / 2]]) regMark(x, y, m * .22);
  }
  function rays(cx, cy, n, r, rot, col) {
    lighten(); s.fillStyle = col;
    for (let i = 0; i < n; i++) { const a0 = rot + i * TAU / n, a1 = a0 + TAU / n / 2; s.beginPath(); s.moveTo(cx, cy); s.lineTo(cx + Math.cos(a0) * r, cy + Math.sin(a0) * r); s.lineTo(cx + Math.cos(a1) * r, cy + Math.sin(a1) * r); s.closePath(); s.fill(); }
    over();
  }
  function sun(cx, cy, r) {
    ell(cx, cy, r, r, YEL);
    for (let i = 0; i < 4; i++) { const y = cy + r * (.15 + i * .22), h = r * (.05 + i * .035); s.fillStyle = PAPER; s.fillRect(cx - r - 4, y, 2 * r + 8, h); }
  }
  function mountains(y, x0, amp, step, seed, col, o = {}) {
    const pts = [[x0 - 200, y + 600]];
    for (let x = x0 - 200, i = 0; x < x0 + W + 2400; x += step, i++) pts.push([x, y - amp * (.35 + .65 * hash(seed + i * 13))]), pts.push([x + step / 2, y - amp * .2 * hash(seed + i * 7)]);
    pts.push([x0 + W + 2400, y + 600]);
    shape(pts, col, o);
  }
  function cloud(x, y, r, col) {
    s.beginPath(); for (const [dx, dy, rr] of [[-1.1, .2, .62], [-.45, -.25, .8], [.35, -.35, .9], [1.05, .1, .65], [0, .25, .75]]) { const [jx, jy] = jit(x + dx * r, y + dy * r); s.moveTo(jx + rr * r, jy); s.arc(jx, jy, rr * r, 0, TAU); }
    lighten(); s.fillStyle = col; s.fill(); over();
  }
  function noPlanes(x, y, h, ang) {
    const r = h * .3, cy = y - h + r;
    withT(() => { s.translate(x, y); s.rotate(ang); s.translate(-x, -y);
      stroke([[x, y], [x, cy]], KEY, 12);
      ell(x, cy, r, r, PAPER, { lw: r * .2, line: PINK });
      withT(() => { s.translate(x, cy); s.scale(r / 70, r / 70);
        shape([[44, -4], [30, -16], [-36, -12], [-50, -28], [-58, -26], [-52, 2], [30, 10]], KEY);
        shape([[8, -4], [-14, 30], [-24, 30], [-12, -4]], KEY); });
      stroke([[x - r * .68, cy - r * .68], [x + r * .68, cy + r * .68]], PINK, r * .17);
      ell(x, cy, r, r, null, { lw: 4 });
    });
  }

  // ===== 71.00 poster: a framed print, he drives in small from the left =====
  function poster(t) {
    const T = ta(t); FRI = Math.floor(t * 12);
    sheet(PAPER);
    rays(1340, 400, 22, 1700, T * .07, C(.38, 0, 0));
    sun(1340, 400, 230);
    cloud(420, 230, 70, C(0, .3, 0)); cloud(860, 150, 50, C(0, .3, 0));
    mountains(640, -100, 260, 340, 11, C(0, .5, 0));
    mountains(700, -260, 150, 260, 29, C(.55, 0, 0), { op: 1 });
    s.fillStyle = C(0, 0, .5); s.fillRect(-W, 700, W * 3, 100);
    s.fillStyle = TEAL; s.fillRect(-W, 790, W * 3, 125);
    stroke([[-W, 798], [W * 2, 798]], PAPER, 5); stroke([[-W, 907], [W * 2, 907]], PAPER, 5);
    for (let i = 0; i < 16; i++) { const x = i * 150 + 20; s.fillStyle = PAPER; s.fillRect(x, 848, 80, 9); }
    s.fillStyle = C(0, 0, .45); s.fillRect(-W, 915, W * 3, 400);
    for (let i = 0; i < 9; i++) { const x = 80 + i * 230; stroke([[x, 700], [x, 600]], KEY, 6); stroke([[x - 22, 612], [x + 22, 612]], KEY, 5); }
    lighten(); stroke([[-20, 612], [W + 20, 612]].map(([x, y]) => [x, y]), C(.5, .5, 0), 2); over();
    const st = base(t), px = kf(T, [[71.0, -380], [74.86, 1120]], (x) => x);
    const look = [.8, T > 73.3 && T < 74.3 ? -.6 : .1];
    sidePlane(px, 892, .62, { ...st, look, brow: [T > 73.3 && T < 74.3 ? .6 : 0, 0] });
    border(44);
    // the print slaps into register
    const u = 1 - ease.out(inv(71.0, 71.55, t));
    fx({ off: [-110 * u, 40 * u, 90 * u, -70 * u, 30 * u, 120 * u], jit: 2.4 + 6 * u });
  }

  // ===== side-on tracking world =====
  const VR = 900;
  function sideWorld(t, carpet) {
    const T = ta(t), sc = (T - 71) * VR;
    sheet(PAPER);
    s.fillStyle = C(.6, 0, 0); s.fillRect(-W, -H, W * 3, H + 70);
    s.fillStyle = C(.4, 0, 0); s.fillRect(-W, 70, W * 3, 70);
    s.fillStyle = C(.22, 0, 0); s.fillRect(-W, 140, W * 3, 70);
    s.fillStyle = C(.1, 0, 0); s.fillRect(-W, 210, W * 3, 60);
    sun(300, 330, 190);
    for (let i = 0; i < 3; i++) cloud(wrap(400 + i * 760 - sc * .03, W + 600) - 300, 160 + i * 60, 55, C(0, .28, 0));
    mountains(560, -wrap(sc * .05, 680) - 300, 230, 340, 41, C(0, .55, 0));
    mountains(620, -wrap(sc * .14, 520) - 300, 120, 260, 53, C(0, 0, .6), { op: 1 });
    s.fillStyle = C(0, 0, .35); s.fillRect(-W, 610, W * 3, 80);
    for (let i = -1; i < 12; i++) { const x = i * 300 - wrap(sc * .3, 300); stroke([[x, 690], [x, 560]], KEY, 7); stroke([[x - 26, 574], [x + 26, 574]], KEY, 6); }
    lighten(); for (let i = -1; i < 12; i++) { const x = i * 300 - wrap(sc * .3, 300); stroke([[x, 574], [x + 150, 590], [x + 300, 574]], C(.5, .5, 0), 2); } over();
    s.fillStyle = TEAL; s.fillRect(-W, 690, W * 3, 240);
    stroke([[-W, 700], [W * 2, 700]], PAPER, 6);
    for (let i = -1; i < 14; i++) { const x = i * 200 - wrap(sc, 200); s.fillStyle = PAPER; s.fillRect(x, 806, 110, 10); }
    if (carpet) {
      s.fillStyle = PINK; s.fillRect(-W, 930, W * 3, 160);
      stroke([[-W, 936], [W * 2, 936]], YEL, 6);
      for (let i = -1; i < 40; i++) { const x = i * 60 - wrap(sc, 60); lighten(); stroke([[x, 950], [x + 20, 1080]], C(.0, 0, .35), 3); over(); }
    } else {
      stroke([[-W, 922], [W * 2, 922]], PAPER, 6);
      s.fillStyle = C(0, 0, .5); s.fillRect(-W, 930, W * 3, 200);
      for (let i = -1; i < 30; i++) { const x = i * 90 - wrap(sc * 1.3, 90); stroke([[x, 1000], [x + 8, 975], [x + 16, 1000]], C(.6, 0, .5), 4); }
    }
  }
  function stanchions(t) {
    const sc = (ta(t) - 71) * VR * 1.3, sp = 330, top = 905, foot = 1040;
    const xs = []; for (let x = -sp - wrap(sc, sp); x < W + sp * 2; x += sp) xs.push(x);
    for (let i = 0; i < xs.length - 1; i++) { const a = [xs[i], top + 4], b = [xs[i + 1], top + 4]; s.beginPath(); s.moveTo(...a); s.quadraticCurveTo((a[0] + b[0]) / 2, top + 70, ...b); s.lineWidth = 14; s.strokeStyle = RED; s.stroke(); s.lineWidth = 3; s.strokeStyle = KEY; s.stroke(); }
    for (const x of xs) { ell(x, foot, 30, 9, YEL, { lw: 3 }); rrect(x - 7, top, 14, foot - top, 6, YEL, { lw: 3 }); ell(x, top - 8, 15, 15, YEL, { lw: 3 }); }
  }
  function carSide(x, y, k, col, T, limo) {
    withT(() => { s.translate(x, y); s.scale(k, k);
      const X = (v) => v < 0 ? v * (limo ? 1.6 : 1) : v;
      for (let i = 0; i < 3; i++) stroke([[X(-180) - 30 - i * 20, -50 - i * 26], [X(-180) - 220 - i * 40, -50 - i * 26]], KEY, 6);
      shape([[155, -40], [146, -82], [72, -92], [36, -136], [X(-52), -140], [X(-88), -96], [X(-154), -88], [X(-174), -78], [X(-166), -40], [X(-142), -22], [146, -22]], col, { lw: 5 });
      shape([[28, -128], [X(-46), -130], [X(-76), -96], [56, -94]], limo ? YEL : PAPER, { lw: 4 });
      ell(-14, -108, 15, 15, PAPER, { lw: 3 }); s.fillStyle = KEY; s.fillRect(-8, -114, 24, 7);
      if (limo) { s.fillStyle = KEY; s.fillRect(-30, -126, 32, 6); s.fillRect(-22, -140, 18, 15); }
      stroke([[X(-150), -62], [134, -64]], PAPER, 6);
      ell(144, -62, 11, 11, PAPER, { lw: 3 });
      tyreSide(94, -26, 28, T * 30, 0, PAL0); tyreSide(X(-104), -26, 28, T * 30, 0, PAL0);
    });
  }

  // ===== 74.86 track: side-on down the highway; a "no planes" sign; the wing bonks it =====
  const PXS = 820, PYS = 892;
  function track(t) {
    const T = ta(t); FRI = Math.floor(t * 12);
    sideWorld(t, false);
    const signX = 2050 - (T - 74.86) * VR * 1.3, tHit = 74.86 + (2050 - (PXS - 110)) / (VR * 1.3);
    const dt = T - tHit, ang = dt > 0 ? -.55 * Math.exp(-4 * dt) * Math.sin(dt * 16) : 0;
    const st = base(t);
    let look = [.7, .1], brow = [0, 0], lid = st.lid;
    const g = tri(T - (tHit - .25), .7);
    if (g > 0) { look = [lerp(.7, -.2, g), lerp(.1, .95, g)]; brow = [.7 * g, 0]; }
    const h = hit(T, tHit, 3); if (h > .05) { brow = [1, 0]; lid = Math.max(lid, .3 * h); }
    if (T > 76.6) { const u = inv(76.6, 77.2, T); look = [lerp(.7, .2, u), lerp(.1, -.5, u)]; brow = [.4 * u, -.8 * u]; }
    sidePlane(PXS, PYS, 1.0, { ...st, look, brow, lid }, () => noPlanes(signX, 1060, 300, ang));
    fx({ jit: 2.4 });
  }

  // ===== head-on world: the road runs to a vanishing point behind him =====
  const VPX = 1040, HOR = 400, FOC = 680, ZP = 1.06, RW = 1.3;
  const gy = (z) => HOR + FOC / z, gx = (X, z) => VPX + X * FOC / z;
  const PLANE_X = gx(-.62, ZP), PLANE_Y = gy(ZP);
  function frontWorld(t, o = {}) {
    const T = ta(t), V = 7;
    sheet(PAPER);
    if (o.op) {
      const n = 24, rot = T * 1.6;
      s.fillStyle = YEL; s.fillRect(-W, -H, W * 3, H * 3);
      s.fillStyle = PINK; for (let i = 0; i < n; i++) { const a0 = rot + i * TAU / n, a1 = a0 + TAU / n / 2; s.beginPath(); s.moveTo(o.op[0], o.op[1]); s.lineTo(o.op[0] + Math.cos(a0) * 3000, o.op[1] + Math.sin(a0) * 3000); s.lineTo(o.op[0] + Math.cos(a1) * 3000, o.op[1] + Math.sin(a1) * 3000); s.closePath(); s.fill(); }
      for (let i = 0; i < 9; i++) { const r = wrap(i * 260 + T * 600, 2340); lighten(); ell(o.op[0], o.op[1], r, r, null, { lw: 40, line: C(0, .7, 0) }); over(); }
      return;
    }
    rays(VPX, HOR, 26, 2600, -T * .05, C(.35, 0, 0));
    sun(VPX, HOR - 20, 250);
    cloud(300, 170, 70, C(0, .3, 0)); cloud(1650, 120, 55, C(0, .3, 0));
    mountains(HOR, -200, 110, 230, 71, C(0, .55, 0));
    s.fillStyle = C(0, 0, .5); s.fillRect(-W, HOR, W * 3, H * 2);
    for (let i = 0; i < 40; i++) {                       // field bands streaming away, so the ground reads as flat
      const z0 = .3 + wrap(i * .9 + T * V, 36), z1 = z0 + .45;
      s.fillStyle = C(0, 0, .85); s.fillRect(-W, gy(z1), W * 3, gy(z0) - gy(z1));
    }
    const zf = 80, zn = .3;
    shape([[gx(-RW, zf), gy(zf)], [gx(RW, zf), gy(zf)], [gx(RW, zn), gy(zn)], [gx(-RW, zn), gy(zn)]], TEAL);
    if (o.carpet) shape([[gx(.04, zf), gy(zf)], [gx(RW, zf), gy(zf)], [gx(RW, zn), gy(zn)], [gx(.04, zn), gy(zn)]], PINK);
    for (const X of [-RW, RW]) stroke([[gx(X, zf), gy(zf)], [gx(X, zn), gy(zn)]], o.carpet && X > 0 ? YEL : PAPER, 6);
    for (let i = 0; i < 14; i++) {                       // telephone poles down the left verge
      const z = .5 + wrap(i * 2.4 + T * V, 33.6), x = gx(-RW - .5, z), y = gy(z), h = .9 * FOC / z;
      stroke([[x, y], [x, y - h]], KEY, Math.max(1.5, 16 / z)); stroke([[x - .14 * FOC / z, y - h * .92], [x + .14 * FOC / z, y - h * .92]], KEY, Math.max(1.5, 12 / z));
    }
    // centre dashes stream away from us toward the vanishing point
    for (let i = 0; i < 30; i++) {
      const z0 = .45 + wrap(i * 1.2 + T * V, 36), z1 = z0 + .5;
      shape([[gx(-.025, z0), gy(z0)], [gx(.025, z0), gy(z0)], [gx(.025, z1), gy(z1)], [gx(-.025, z1), gy(z1)]], o.carpet ? YEL : PAPER);
    }
  }
  function carpetPosts(t, near) {     // stanchions along both edges of the carpet, streaming away
    const T = ta(t), V = 7, list = [];
    for (let i = 0; i < 18; i++) list.push(.42 + wrap(i * 1.6 + T * V, 28.8));
    list.sort((a, b) => b - a);
    for (const X of [.1, RW - .08]) {
      let prev = null;
      for (const z of list) {
        if (near ? z > ZP : z <= ZP) { prev = z; continue; }
        const x = gx(X, z), y = gy(z), h = .32 * FOC / z, r = FOC / z;
        if (prev !== null && Math.abs(prev - z) < 2) { const xa = gx(X, prev), ya = gy(prev) - .32 * FOC / prev; s.beginPath(); s.moveTo(xa, ya); s.quadraticCurveTo((xa + x) / 2, (ya + y - h) / 2 + .08 * r, x, y - h); s.lineWidth = .03 * r; s.strokeStyle = RED; s.stroke(); }
        rrect(x - .012 * r, y - h, .024 * r, h, .01 * r, YEL, { lw: Math.max(1, .004 * r) });
        ell(x, y - h, .022 * r, .022 * r, YEL, { lw: Math.max(1, .004 * r) });
        prev = z;
      }
    }
  }
  function carFront(x, y, k, col, limo) {
    withT(() => { s.translate(x, y); s.scale(k, k);
      const w = limo ? 1.15 : 1;
      rrect(-140 * w, -40, 60, 40, 14, KEY); rrect(80 * w, -40, 60, 40, 14, KEY);
      shape([[-110 * w, -150], [-80 * w, -215], [80 * w, -215], [110 * w, -150]], col, { lw: 5 });
      shape([[-92 * w, -152], [-70 * w, -202], [70 * w, -202], [92 * w, -152]], PAPER, { lw: 4 });
      ell(0, -170, 22, 24, PAPER, { lw: 3 }); s.fillStyle = KEY; s.fillRect(-20, -176, 40, 9);
      if (limo) { s.fillStyle = KEY; s.fillRect(-26, -196, 52, 7); s.fillRect(-16, -214, 32, 20); }
      rrect(-180 * w, -152, 360 * w, 112, 40, col, { lw: 5 });
      for (const sd of [-1, 1]) ell(sd * 128 * w, -104, 30, 30, PAPER, { lw: 4 });
      rrect(-60, -122, 120, 50, 10, KEY);
      for (let i = 0; i < 4; i++) stroke([[-48 + i * 32, -116], [-48 + i * 32, -78]], col, 4);
      rrect(-192 * w, -56, 384 * w, 22, 10, PAPER, { lw: 4 });
    });
  }

  // ===== 77.22 feel / 78.38 strange: head-on =====
  function headOn(t) {
    const T = ta(t); FRI = Math.floor(t * 12);
    const on = t >= STRANGE, st = base(t);
    const z = on ? 1.32 : kf(T, [[77.22, 1.18], [78.38, 1.3]], ease.out);
    const fcx = PLANE_X, fcy = PLANE_Y - 470 * .85;
    let look = [0, .1], brow = [0, 0], lid = st.lid, spiral = 0, hop = 0;
    if (!on) { const a = Math.sin((T - 77.22) * 7); look = [a * .8, .05]; brow = [.5, -.9]; lid = .1; }
    else { spiral = smooth(inv(STRANGE, STRANGE + .2, T)); brow = [1.2, 0]; hop = -60 * Math.sin(Math.PI * clamp((T - STRANGE) / .45)); }
    withT(() => {
      s.translate(W / 2, H / 2); s.scale(z, z); s.translate(-fcx, -fcy);
      frontWorld(t, on ? { op: [fcx, fcy] } : {});
      frontPlane(PLANE_X, PLANE_Y + hop, .85, { ...st, look, brow, lid, spiral, tilt: on ? .05 * Math.sin(T * 9) : 0 });
    });
    if (on) haywire(t);
  }
  // the plates come apart and a new ink drops in, swapping on every beat
  const STRANGE_INKS = [[INK.pink, INK.teal, INK.orange], [INK.orange, INK.blue, INK.yellow], [INK.purple, INK.yellow, INK.pink], [INK.red, INK.teal, INK.green], [INK.blue, INK.orange, INK.pink]];
  function haywire(t, amt = 1) {
    const T = ta(t), u = smooth(inv(STRANGE, STRANGE + .18, t)) * amt, bi = Math.max(0, lastBeat(T) - lastBeat(STRANGE));
    fx({ off: [Math.sin(T * 6.1) * 75 * u, Math.cos(T * 4.3) * 38 * u, Math.cos(T * 5.3) * 70 * u, Math.sin(T * 3.7) * 50 * u, Math.sin(T * 4.9 + 2) * 28 * u, -60 * u + Math.cos(T * 7) * 20 * u],
      inks: STRANGE_INKS[bi % STRANGE_INKS.length], jit: 3 + 5 * u });
  }

  // ===== 79.13 mnuh nuh nuh: three Warhol panels, one per beat =====
  const PANELS = [
    { bg: PINK, pal: { ...PAL0, body: YEL, glass: TEAL, wing: TEAL, fin: TEAL, tip: PAPER, cheek: C(0, 0, 0), ring: TEAL } },
    { bg: YEL, pal: { ...PAL0, body: PAPER, glass: PINK, wing: PINK, fin: PINK, tip: TEAL, cheek: C(.6, 0, 0), ring: PINK } },
    { bg: TEAL, pal: { ...PAL0, body: PINK, glass: YEL, wing: YEL, fin: YEL, tip: PAPER, cheek: C(0, 0, .6), ring: YEL } },
  ];
  function mnuh(t) {
    headOn(t);
    const T = ta(t); FRI = Math.floor(t * 12);
    MNUH.forEach((bt, i) => {
      if (T < bt - .001) return;
      const pop = ease.back(inv(bt, bt + .17, T)), x0 = i * 640;
      withT(() => {
        s.beginPath(); s.rect(x0, 0, 640, H); s.clip();
        s.fillStyle = PANELS[i].bg; s.fillRect(x0, 0, 640, H);
        const k = 1.06 * (1.25 - .25 * pop), nuh = hit(T, bt, 5);
        const look = [[.5, .2], [0, -.4], [-.5, .2]][i];
        frontPlane(x0 + 320, 540 + 470 * k, k, { t: T, open: .1 + .75 * nuh, look, brow: [.6 + .6 * nuh, 0], bob: -30 * nuh, spin: T * TAU * 1.9, pal: PANELS[i].pal, lid: 0 });
      });
      stroke([[x0, 0], [x0, H]], PAPER, 14);
    });
    const bi = MNUH.filter((bt) => T >= bt).length - 1;
    const sw = [[INK.pink, INK.teal, INK.yellow], [INK.orange, INK.blue, INK.yellow], [INK.pink, INK.purple, INK.yellow]][Math.max(0, bi)];
    const a = .35, k = bi * 1.7;
    fx({ off: [Math.sin(k) * 28 * a + Math.sin(T * 6) * 8, Math.cos(k) * 18 * a, -Math.sin(k + 1) * 26 * a, Math.cos(T * 5) * 8, 10 * a, -24 * a], inks: sw, jit: 4 });
  }

  // ===== 80.88 lane: side-on, the roped-off red-carpet passing lane; cars zip past =====
  const CARS_S = [[81.45, TEAL], [82.55, YEL], [83.6, GREEN], [84.75, PINK], [85.7, TEAL], [86.35, RED, true]];
  const VCAR = 1500;
  function lane(t) {
    const T = ta(t); FRI = Math.floor(t * 12);
    const tight = T >= 84.24, z = tight ? kf(T, [[84.24, 1.45], [86.6, 1.6]], (x) => x) : kf(T, [[LINE2, 1.0], [84.24, 1.06]], (x) => x);
    const fcx = tight ? PXS + 120 : W / 2, fcy = tight ? PYS - 240 : H / 2;
    const st = base(t);
    let look = [.6, .2], brow = [0, 0], lid = st.lid, best = null;
    for (const c of CARS_S) { const x = PXS + 250 + (T - c[0]) * VCAR; if (x > -200 && x < W + 300 && (best === null || Math.abs(x - 1100) < Math.abs(best - 1100))) best = x; }
    if (best !== null) { look = [clamp((best - (PXS + 250)) / 500, -1, 1), .9]; brow = [.3, .5]; }
    withT(() => {
      s.translate(W / 2, H / 2); s.scale(z, z); s.translate(-fcx, -fcy);
      sideWorld(t, true);
      sidePlane(PXS, PYS, 1.0, { ...st, look, brow, lid }, () => {
        stanchions(t);
        for (const c of CARS_S) { const x = PXS + 250 + (T - c[0]) * VCAR; if (x > -700 && x < W + 700) carSide(x, 1062, .95, c[1], T, c[2]); }
      });
    });
    fx({ jit: 2.4 });
  }

  // ===== 86.60 sick: head-on with the carpet; eye roll, the limo, a glare, a sigh, the print lets go =====
  const CARS_F = [[86.2, YEL], [87.32, RED, true], [88.5, TEAL], [89.75, GREEN]];
  const VREL = 4.2;
  function sick(t) {
    const T = ta(t); FRI = Math.floor(t * 12);
    const z = kf(T, [[SICK, 1.12], [91, 1.22]], (x) => x), fcx = PLANE_X + 120, fcy = PLANE_Y - 380;
    const st = base(t);
    let look = [.3, .2], brow = [.2, .4], lid = st.lid;
    const cz = (c) => ZP + VREL * (c[0] - T);
    const u = inv(SICK, SICK + .55, T);
    if (u > 0 && u < 1) { const th = lerp(-.3, Math.PI + .3, ease.inOut(u)); look = [Math.cos(th), -Math.sin(th) * 1.05]; lid = Math.max(lid, .4); brow = [.9, -.3]; }
    if (T >= SICK + .55 && T < 88.2) { const c = CARS_F[1], zz = cz(c); look = [clamp((gx(.66, zz) - PLANE_X) / 700, -1, 1), clamp((gy(zz) - PLANE_Y + 300) / 500, -.2, 1)]; lid = Math.max(lid, .38); brow = [0, 1]; }
    if (T >= 88.2 && T < 89.2) { look = [.7, .7]; lid = Math.max(lid, .3); brow = [0, .7]; }
    if (T >= 89.2) { const v = smooth(inv(89.2, 89.7, T)); look = [lerp(.7, 0, v), lerp(.7, .5, v)]; lid = Math.max(lid, .55 * v); brow = [-.1 * v, -.6 * v]; }
    withT(() => {
      s.translate(W / 2, H / 2); s.scale(z, z); s.translate(-fcx, -fcy);
      frontWorld(t, { carpet: true });
      const cars = CARS_F.map((c) => [cz(c), c]).filter(([zz]) => zz > .32 && zz < 40).sort((a, b) => b[0] - a[0]);
      carpetPosts(t, false);
      for (const [zz, c] of cars) if (zz > ZP) carFront(gx(.66, zz), gy(zz), FOC / zz / 650 * 1.2, c[1], c[2]);
      frontPlane(PLANE_X, PLANE_Y, .85, { ...st, look, brow, lid });
      carpetPosts(t, true);
      for (const [zz, c] of cars) if (zz <= ZP) carFront(gx(.66, zz), gy(zz), FOC / zz / 650 * 1.2, c[1], c[2]);
      for (let q = 0; q < 3; q++) { const w = (T - 89.3 - q * .2) / 1.1; if (w < 0 || w >= 1) continue;          // the sigh
        cloud(PLANE_X + 90 + w * 260 + q * 20, PLANE_Y - 280 * .85 - w * 160 - q * 30, (18 + w * 40) * (1 - w * .3), C(0, .45 * (1 - w), 0)); }
    });
    const e = smooth(inv(90.1, 90.95, t));
    fx({ off: [-90 * e, 30 * e, 70 * e, -55 * e, 20 * e, 95 * e], fade: .85 * e, jit: 2.4 + 5 * e });
  }

  // =====================================================================================
  // SECTION F (frames 3118-4074, 129.9167-169.75). Everything above is the look test's
  // character kit, copied as is. Bars run from the beat at 129.93 (4 beats, ~2.25 s each);
  // the cut into the kawaii verse at 169.75 sits on a downbeat.
  // =====================================================================================
  LOOK.edge = 1;                                              // section F: plates pushed off the sheet leave bare paper
  const F0 = 3118 / 24, F1 = 4074 / 24;
  const BTS = FEAT.beats, BI0 = lastBeat(129.95);
  const beatT = (n) => BTS[BI0 + n];
  const barT = (k) => beatT(4 * k);
  const bN = (t) => lastBeat(t) - BI0;
  const bPh = (t) => { const i = lastBeat(t); return clamp((t - BTS[i]) / (BTS[i + 1] - BTS[i])); };
  const En = (t) => clamp(F('rms', t, 3) / .75);
  const VAMP_END = barT(5);                                   // 141.13: the last "yeah" is done, instrumental from here
  const HIT = 167.17;                                         // the big hit before the quiet bar
  const ISET = [[INK.pink, INK.teal, INK.yellow], [INK.orange, INK.blue, INK.yellow], [INK.pink, INK.purple, INK.yellow],
    [INK.red, INK.teal, INK.green], [INK.blue, INK.orange, INK.pink], [INK.purple, INK.yellow, INK.pink],
    [INK.green, INK.pink, INK.orange], [INK.teal, INK.red, INK.yellow]];
  const ink = (p, d = 1) => p === 0 ? C(d, 0, 0) : p === 1 ? C(0, d, 0) : C(0, 0, d);
  const PURPLE = C(.5, .5, 0), ORNG = C(.5, 0, 1);
  // the three drums thrown out of register along seeded headings; a = 0 is a clean print
  function apart(a, seed, M = 1) {
    const h = (n) => hash((seed * 97 + n) >>> 0) * 2 - 1;
    return { off: [h(1) * 230 * a * M, h(2) * 140 * a * M, h(3) * 230 * a * M, h(4) * 140 * a * M, h(5) * 230 * a * M, h(6) * 140 * a * M],
      rot: [h(7) * .22 * a * M, h(8) * .22 * a * M, h(9) * .22 * a * M], zm: [1 + h(10) * .2 * a * M, 1 + h(11) * .2 * a * M, 1 + h(12) * .2 * a * M] };
  }

  // ---- v2: the stems (Demucs 6-stem, window.STEMS, 24 fps envelopes). "other" is the saxophone. ----
  // The drum stem lists no onsets in this span, so hits come from envelope rises (they sit on the beat grid).
  const STM = window.STEMS.stems;
  const SE = (k, t) => STM[k].env[clamp(Math.round(t * 24), 0, STM[k].env.length - 1)] || 0;
  const SEs = (k, t, n = 2) => { let a = 0; for (let j = -n; j <= n; j++) a += SE(k, t + j / 24); return a / (2 * n + 1); };
  function riseHits(k, d = .18, min = .35, gap = 4) {
    const e = STM[k].env, o = []; let last = -99;
    for (let i = 3; i < e.length; i++) { const m = Math.min(e[i - 1], e[i - 2], e[i - 3]); if (e[i] - m > d && e[i] > min && i - last >= gap && e[i] >= e[i - 1]) { o.push(i / 24); last = i; } }
    return o;
  }
  const HITS = {
    drums: riseHits('drums'),
    piano: [...new Set([...riseHits('piano'), ...STM.piano.onsets].map((x) => Math.round(x * 24)))].sort((a, b) => a - b).map((i) => i / 24),
    sax: [...new Set([...riseHits('other', .15, .3), ...STM.other.onsets].map((x) => Math.round(x * 24)))].sort((a, b) => a - b).map((i) => i / 24),
    guitar: riseHits('guitar'), bass: riseHits('bass', .15, .3),
  };
  function lastHitI(k, t) { const h = HITS[k]; let lo = 0, hi = h.length - 1; if (!h.length || t < h[0]) return -1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (h[m] <= t) lo = m; else hi = m - 1; } return lo; }
  const hitAge = (k, t) => { const i = lastHitI(k, t); return i < 0 ? 99 : t - HITS[k][i]; };
  const hitPulse = (k, t, dec = 8) => Math.exp(-dec * hitAge(k, t));
  const dN = (t) => lastHitI('drums', t);
  const dPh = (t) => { const h = HITS.drums, i = lastHitI('drums', t); if (i < 0 || i + 1 >= h.length) return bPh(t); return clamp((t - h[i]) / Math.min(.6, h[i + 1] - h[i])); };
  // ---- reactive layer ----
  function shockwaves(T, cx = 960, cy = 540, o = {}) {           // drum hits fire rings out from the centre
    const i = lastHitI('drums', T); if (i < 0) return;
    for (let q = 0; q < 3; q++) { const h = HITS.drums[i - q]; if (h === undefined) continue; const a = T - h; if (a > .9) continue;
      const r = 60 + a * (o.speed || 2400), w = (o.w || 70) * (1 - a / .9);
      lighten(); s.strokeStyle = ink((i - q + 3) % 3, .95); s.lineWidth = Math.max(1, w); s.beginPath(); s.arc(cx, cy, r, 0, TAU); s.stroke(); over(); }
  }
  function pianoPops(T, n = 7, sc = 1) {                           // piano notes pop small geometry
    const i = lastHitI('piano', T); if (i < 0) return;
    for (let q = 0; q < n; q++) { const h = HITS.piano[i - q]; if (h === undefined) continue; const a = T - h; if (a > .7) continue;
      const r = rng(Math.round(h * 24) * 7 + 3), x = 120 + r() * 1680, y = 100 + r() * 880, kind = Math.floor(r() * 4), z = (26 + r() * 40) * sc * ease.back(clamp(a / .12)) * (1 - clamp((a - .45) / .25));
      const col = [YEL, PINK, TEAL, RED][Math.floor(r() * 4)];
      if (z <= .5) continue;
      withT(() => { s.translate(x, y); s.rotate(r() * TAU + a * 3);
        if (kind === 0) ell(0, 0, z, z, col, { lw: 4 }); else if (kind === 1) shape([[0, -z], [z * .9, z * .6], [-z * .9, z * .6]], col, { lw: 4 });
        else if (kind === 2) { s.fillStyle = col; s.fillRect(-z * .7, -z * .7, z * 1.4, z * 1.4); s.lineWidth = 4; s.strokeStyle = KEY; s.strokeRect(-z * .7, -z * .7, z * 1.4, z * 1.4); }
        else { ringPath(0, 0, z * .55, z); s.fillStyle = col; s.fill('evenodd'); } });
    }
  }
  function saxRibbon(T, o = {}) {                                  // the sax line flows across the frame, width and swing from its envelope
    const e = SEs('other', T, 3); if (e < .12) return;
    const y0 = o.y ?? 540, A = 60 + 260 * e, wdt = 18 + 70 * e;
    for (let b = 0; b < 3; b++) {
      const pts = []; for (let x = -100; x <= 2020; x += 30) pts.push([x, y0 + b * wdt * .9 + A * Math.sin(x * .0042 - T * 3.1 + b * .5) + A * .4 * Math.sin(x * .011 + T * 1.7)]);
      lighten(); s.strokeStyle = ink([2, 0, 1][b], b === 1 ? .9 : .75); s.lineWidth = wdt * (b === 1 ? 1 : .5); s.lineCap = 'round'; s.beginPath(); pts.forEach(([x, y], j) => j ? s.lineTo(x, y) : s.moveTo(x, y)); s.stroke(); over();
    }
  }
  const bassK = (T) => 1 + .45 * SEs('bass', T, 3);
  const snapD = (t, pw = 1.7) => Math.pow(dPh(t), pw);           // 0 on each drum hit (slammed into register), drifts out until the next

  // ---- instrument cameos, drawn as riso poster figures ----
  // SAX: origin at the middle of the body; it sways on phrases and kicks on onsets; notes and halftone puffs blow out of the bell
  const SAXC = [[-150, -560], [-95, -540], [-40, -490], [-10, -420], [0, -300], [6, -120], [12, 60], [26, 170], [80, 236], [160, 236], [222, 176], [250, 70], [262, -40]];
  const SAXW = [10, 14, 20, 26, 34, 42, 50, 58, 66, 70, 82, 112, 160];
  function sax(x, y, k, T, o = {}) {
    const e = SEs('other', T, 2), hp = hitPulse('sax', T, 7), si = lastHitI('sax', T);
    withT(() => {
      s.translate(x, y); s.scale(k, k); s.rotate((o.rot || 0) + Math.sin(T * 2.2) * .1 * (.3 + e) - .14 * hp); s.scale(1 + .05 * hp, 1 + .05 * hp);
      const L = [], R = [];
      for (let i = 0; i < SAXC.length; i++) { const a = SAXC[Math.max(0, i - 1)], b = SAXC[Math.min(SAXC.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d, w = SAXW[i] / 2;
        L.push([SAXC[i][0] + nx * w, SAXC[i][1] + ny * w]); R.push([SAXC[i][0] - nx * w, SAXC[i][1] - ny * w]); }
      shape([...L, ...R.reverse()], o.body || YEL, { smooth: true, lw: 9 });
      shape([[-150, -560], [-200, -585], [-212, -570], [-162, -548]], KEY);                              // mouthpiece
      withT(() => { s.translate(256, -44); s.rotate(-.18); ell(0, 0, 88, 30, C(.55, .55, 0), { lw: 8 }); ell(0, 6, 64, 16, KEY); });   // the bell's mouth
      for (let i = 0; i < 7; i++) {                                                                      // keys: pressed ones go dark, on each sax note
        const kx = 4 + i * 2 + (i > 4 ? 8 : 0), ky = -330 + i * 62, pressed = si >= 0 && hash((si * 13 + i) >>> 0) > .45 && e > .2;
        ell(kx + 26, ky, 19, 19, pressed ? KEY : PAPER, { lw: 6 }); ell(kx + 26, ky, 8, 8, pressed ? PAPER : PINK);
        stroke([[kx + 6, ky], [kx - 18, ky + 18]], KEY, 6);
      }
      stroke([[40, -200], [70, 40], [60, 160]], C(.6, 0, 0), 7);                                         // a highlight seam
    });
    // puffs and notes from the bell, one burst per sax onset (positions in screen space)
    const bx = x + 256 * k, by = y - 44 * k;
    for (let q = 0; q < 4; q++) { const ii = si - q; if (ii < 0) continue; const a = T - HITS.sax[ii]; if (a > 1.6) continue; const r = rng(ii * 31 + 5);
      for (let p = 0; p < 4; p++) { const ang = -.9 + r() * .9, sp = (240 + r() * 300) * k * 2, d = a * sp, rr = (30 + a * 120) * k * 1.6 * (.6 + r() * .6);
        lighten(); ell(bx + Math.cos(ang) * d, by + Math.sin(ang) * d - a * 60, rr, rr, [C(.5, 0, 0), C(0, .45, 0), C(0, 0, .6)][p % 3]); over(); }
      for (let p = 0; p < 2; p++) { const nx = bx + (60 + a * 380 + p * 90) * k * 1.4, ny = by - (a * 300 + p * 60) * k * 1.4 + Math.sin(a * 9 + p) * 20, z = 22 * k * 1.6;
        ell(nx, ny, z, z * .75, [PINK, TEAL][p], { rot: -.4, lw: 3 }); stroke([[nx + z * .9, ny], [nx + z * .9, ny - z * 3]], KEY, 5 * k * 1.4); stroke([[nx + z * .9, ny - z * 3], [nx + z * 2, ny - z * 2.2]], KEY, 5 * k * 1.4); }
    }
  }
  // PIANO: an upright seen straight on; the keyboard is the star. Keys go down on piano notes, the lid flaps with the envelope
  function piano(x, y, k, T, o = {}) {
    const e = SEs('piano', T, 1), pi = lastHitI('piano', T);
    withT(() => {
      s.translate(x, y); s.scale(k, k); s.rotate(o.rot || 0);
      const lid = .06 * hitPulse('piano', T, 6) + .03 * e;
      withT(() => { s.translate(-520, -470); s.rotate(-lid); rrect(0, -24, 1040, 44, 12, o.case || RED, { lw: 8 }); });   // lid
      rrect(-500, -460, 1000, 400, 26, o.case || RED, { lw: 8 });                                          // the case
      rrect(-420, -420, 840, 240, 16, C(.6, 0, 0), {});
      for (let i = 0; i < 9; i++) stroke([[-380 + i * 95, -400], [-380 + i * 95, -200]], C(.3, 0, 0), 5);  // the fretwork
      rrect(-120, -170, 240, 50, 10, YEL, { lw: 5 });                                                       // name plate
      type('AIRPLANE', 0, -144, 30, KEY, { font: '"Futura"', w: 'bold', ls: 3 });
      rrect(-520, -70, 1040, 40, 8, KEY);                                                                    // key slip
      const N = 21, kw = 1000 / N;
      const down = (i) => { if (o.run) { const idx = Math.floor((T - o.run.t0) / .045), jj = o.run.dir > 0 ? idx : N - 1 - idx; return i === jj ? 1 : i === jj - o.run.dir ? .5 : 0; } let d = 0; for (let q = 0; q < 3; q++) { const ii = pi - q; if (ii < 0) continue; const a = T - HITS.piano[ii]; if (a > .3) continue;
        const r = rng(ii * 17 + 1); for (let m = 0; m < 3; m++) if (Math.floor(r() * N) === i) d = Math.max(d, 1 - a / .3); } return d; };
      for (let i = 0; i < N; i++) { const d = down(i); rrect(-500 + i * kw + 2, -30 + d * 12, kw - 4, 260 - d * 8, 6, d > .05 ? C(0, .3 * d + .1, 0) : PAPER, { lw: 5 }); }
      for (let i = 0; i < N - 1; i++) { if (![0, 1, 3, 4, 5].includes(i % 7)) continue;
        const d = down((i + 10) % N); rrect(-500 + (i + 1) * kw - kw * .3, -30 + d * 8, kw * .6, 160 - d * 10, 5, d > .05 ? C(.5, .5, 0) : KEY); }
      rrect(-520, 230, 1040, 60, 10, o.case || RED, { lw: 8 });
      for (const sd of [-1, 1]) { rrect(sd * 470 - 22, 290, 44, 160, 8, o.case || RED, { lw: 6 }); ell(sd * 470, 452, 34, 14, YEL, { lw: 4 }); }
      for (let i = 0; i < 2; i++) ell(-60 + i * 120, 440, 18, 10, YEL, { lw: 3 });                          // pedals
    });
  }
  // DRUM KIT: kick with the cheat-line logo, snare, toms, hi-hat and crash; everything jumps on drum hits
  function drumkit(x, y, k, T) {
    const hp = hitPulse('drums', T, 9), di = lastHitI('drums', T), alt = di % 2, gp = hitPulse('guitar', T, 6);
    withT(() => {
      s.translate(x, y); s.scale(k, k);
      // crash cymbal, wobbling
      const cw = Math.sin(hitAge('drums', T) * 22) * .25 * Math.exp(-3 * hitAge('drums', T));
      stroke([[560, 260], [560, -330]], KEY, 10);
      withT(() => { s.translate(560, -340); s.rotate(-.2 + cw); ell(0, 0, 230, 46, YEL, { lw: 7 }); ell(0, -8, 30, 12, C(.6, .6, 0)); });
      // hi-hat clapping shut on the off hits
      const gap = alt ? 34 * (1 - hp) + 6 : 40;
      stroke([[-600, 300], [-600, -160]], KEY, 10);
      ell(-600, -170 - gap, 150, 30, YEL, { lw: 6 }); ell(-600, -170, 150, 30, YEL, { lw: 6 });
      // toms
      for (const [tx, ty, r] of [[-170, -240, 120], [170, -250, 130]]) { const jy = (alt ? 0 : -16 * hp);
        rrect(tx - r, ty + jy, r * 2, r * 1.1, 20, TEAL, { lw: 7 }); ell(tx, ty + jy, r, r * .3, PAPER, { lw: 7 }); }
      // snare, jumping on the back beats
      const sj = alt ? -30 * hp : 0;
      rrect(-520, 40 + sj, 300, 120, 16, PINK, { lw: 7 }); ell(-370, 40 + sj, 150, 40, PAPER, { lw: 7 });
      for (let i = 0; i < 5; i++) stroke([[-500 + i * 65, 50 + sj], [-500 + i * 65, 150 + sj]], KEY, 4);
      // kick drum, pulsing on the down hits
      const kk = 1 + (alt ? 0 : .07 * hp);
      withT(() => { s.translate(0, 110); s.scale(kk, kk);
        ell(0, 0, 330, 330, PINK, { lw: 10 }); ell(0, 0, 290, 290, PAPER, { lw: 6 });
        withT(() => { s.beginPath(); s.arc(0, 0, 290, 0, TAU); s.clip(); fragCheat(0, 40, 700, -.08, 1); });
        for (let i = 0; i < 10; i++) { const a = i * TAU / 10; ell(Math.cos(a) * 312, Math.sin(a) * 312, 14, 14, YEL, { lw: 3 }); } });
      // floor tom
      rrect(370, 0, 220, 240, 18, TEAL, { lw: 7 }); ell(480, 0, 110, 30, PAPER, { lw: 7 });
    });
  }
  // GUITAR: a flat-top that rings on guitar notes (strings blur, sound hole pulses)
  function guitar(x, y, k, rot, T) {
    const gp = hitPulse('guitar', T, 6), e = SEs('guitar', T, 1);
    withT(() => { s.translate(x, y); s.rotate(rot + Math.sin(T * 3) * .05 * e); s.scale(k, k);
      rrect(-30, -620, 60, 470, 10, C(0, 0, .55), { lw: 6 }); rrect(-46, -720, 92, 110, 18, KEY);
      for (let i = 0; i < 6; i++) ell(i < 3 ? -54 : 54, -700 + (i % 3) * 32, 10, 8, YEL);
      ell(0, -60, 200, 190, ORNG, { lw: 8 }); ell(0, 160, 250, 230, ORNG, { lw: 8 }); shape([[-170, -40], [170, -40], [210, 120], [-210, 120]], ORNG);
      ell(0, 30, 70 * (1 + .12 * gp), 70 * (1 + .12 * gp), KEY); ell(0, 30, 90, 90, null, { lw: 8, line: PINK });
      rrect(-90, 220, 180, 34, 8, KEY);
      for (let i = 0; i < 6; i++) { const sx = -25 + i * 10, wob = gp * 7 * Math.sin(T * 120 + i); stroke([[sx, -700], [sx + wob, 30], [sx, 236]], PAPER, 2.5); }
    });
  }
  const snapA = snapD;                                      // v2: registration slams ride the drum hits, not the beat grid
  const rotScr = (T, k = 1) => [1.309 + T * .21 * k, .262 - T * .17 * k, .785 + T * .12 * k];
  function baseF(t) {
    const T = ta(t), b = beatPulse(T, 7);
    const blink = Math.max(...[131.4, 133.6, 136.2, 137.9, 140.9, 168.6].map((bt) => tri(T - bt, .1)));
    return { t: T, open: clamp((F('voc', T, 1) - .07) / .4), bob: b * 10, sq: b * .06, lid: blink, spin: T * TAU * 1.9, roll: T * 15 };
  }
  function type(str, x, y, px, col, o = {}) {
    withT(() => {
      s.font = `${o.w || ''} ${px}px ${o.font || 'Impact'}`; s.textAlign = o.align || 'center'; s.textBaseline = 'middle';
      s.letterSpacing = (o.ls || 0) + 'px';
      const [jx, jy] = jit(x, y); s.translate(jx, jy); if (o.rot) s.rotate(o.rot); if (o.sx) s.scale(o.sx, o.sy || o.sx);
      if (o.lw) { s.lineWidth = o.lw; s.strokeStyle = o.line || KEY; s.lineJoin = 'round'; s.strokeText(str, 0, 0); }
      if (o.op) lighten(); s.fillStyle = col; s.fillText(str, 0, 0); over();
    });
  }
  // type shrunk to fit maxW (measured, letter spacing included), so it always sits inside its box with margin
  function fitType(str, x, y, maxW, px, col, o = {}) {
    s.save(); s.font = `${o.w || ''} ${px}px ${o.font || 'Impact'}`; s.letterSpacing = (o.ls || 0) + 'px';
    const wd = s.measureText(str).width; s.restore();
    type(str, x, y, wd > maxW ? px * maxW / wd : px, col, o);
  }
  function star(x, y, r0, r1, n, rot, col, o = {}) {
    const pts = []; for (let i = 0; i < n * 2; i++) { const a = rot + i * Math.PI / n, r = i % 2 ? r0 : r1; pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); }
    shape(pts, col, o);
  }
  function confetti(T, n, seed, alpha = 1) {
    for (let i = 0; i < n; i++) {
      const r = rng(i * 131 + seed); const x0 = r() * 2100 - 90, sp = 140 + r() * 260, ph = r() * 1300, sz = 9 + r() * 15;
      const col = [PINK, TEAL, YEL, RED, GREEN, PURPLE][Math.floor(r() * 6)], spin = (r() - .5) * 9, fl = 3 + r() * 5;
      const y = wrap(ph + (T - F0) * sp, 1300) - 80, x = x0 + Math.sin(T * 2 + i) * 30;
      if (r() > alpha) continue;
      withT(() => { s.translate(x, y); s.rotate(spin * T + i); s.scale(1, Math.cos(T * fl + i));
        s.fillStyle = col; if (i % 3) s.fillRect(-sz, -sz * .42, sz * 2, sz * .84); else { s.beginPath(); s.arc(0, 0, sz * .7, 0, TAU); s.fill(); } });
    }
  }
  // ---- plane fragments for the instrumental ----
  function fragCheat(x, y, len, rot, k = 1) {
    withT(() => { s.translate(x, y); s.rotate(rot); s.scale(k, k);
      shape([[-len / 2, -18], [len / 2 - 60, -22], [len / 2, 0], [len / 2 - 60, 22], [-len / 2, 18]], RED);
      stroke([[-len / 2, 36], [len / 2 - 70, 36]], YEL, 9); });
  }
  function fragEye(x, y, r, o = {}) {
    eye(x, y, r, r * 1.15, { look: o.look || [0, 0], lid: o.lid || 0, pal: PAL0, t: o.t || 0, spiral: o.spiral || 0 }, 0, Math.max(3, r * .08), o.body || PAPER);
  }
  function fragProp(x, y, R, spin, knock = true) {
    if (knock) ell(x, y, R * 1.02, R * 1.02, PAPER);
    propFace(x, y, R, spin, Math.max(3, R * .035), PAL0);
  }
  const WING = [[0, 0], [1150, -60], [1210, -96], [1180, -118], [0, -96]];
  function fragWing(x, y, k, rot, col, tip = PINK) {
    withT(() => { s.translate(x, y); s.rotate(rot); s.scale(k, k);
      shape(WING, col, { lw: 7 / k * .8 });
      withT(() => { pathPts(WING, false); s.clip(); shape([[1000, 40], [1300, 40], [1300, -200], [1000, -200]], tip); });
      for (const ex of [330, 700]) { ell(ex, -48, 90, 40, PAPER, { lw: 6 }); ell(ex + 92, -48, 14, 40, PINK); } });
  }
  function ringPath(x, y, r0, r1) { s.beginPath(); s.arc(x, y, r1, 0, TAU); s.moveTo(x + r0, y); s.arc(x, y, r0, 0, TAU, true); }

  // ===== 129.92 party: the vamp as a pop-poster party =====
  function party(t) {
    const T = ta(t); FRI = Math.floor(t * 12);
    const st = baseF(t), bp = beatPulse(T, 6), n = bN(T);
    sheet(C(.45, 0, 0));                                                                   // Ben-Day pink ground
    rays(960, 760, 30, 2600, T * .22 + n * .09, C(0, 0, .85));                             // yellow burst overprints red
    for (let i = 0; i < 2; i++) {                                                          // two teal spotlights sweep
      const ox = i ? 1880 : 40, a = (i ? Math.PI * .72 : Math.PI * .28) + Math.sin(T * 1.6 + i * 2.2) * .32;
      lighten(); poly([[ox, -40], [ox + Math.cos(a - .09) * 2200, -40 + Math.sin(a - .09) * 2200], [ox + Math.cos(a + .09) * 2200, -40 + Math.sin(a + .09) * 2200]], C(0, .4, 0)); over();
    }
    // the stage
    s.fillStyle = TEAL; s.fillRect(-W, 985, W * 3, 200); stroke([[-W, 990], [W * 2, 990]], PAPER, 6);
    for (let i = 0; i < 24; i++) { s.fillStyle = C(0, .45, 0); s.fillRect(i * 90 - wrap(T * 60, 90), 1010, 44, 70); }
    // the singer, bopping
    const side = n % 2 ? 1 : -1;
    frontPlane(960, 1000, .62, { ...st, bob: -st.bob * 3.2, tilt: side * .05 * bp, look: [side * .25, -.1], brow: [.35 + .8 * st.open, 0], sq: st.sq * 2 });
    // header type: the gig poster
    const pop = 1 + .05 * bp + .07 * hit(t, 130.06, 6);
    withT(() => { s.translate(960, 245); s.scale(pop, pop); s.translate(-960, -245);
      shape([[190, 150], [1730, 132], [1750, 352], [170, 362]], YEL, { lw: 6 });
      fitType('AIRPLANE ON THE HIGHWAY', 960, 252, 1400, 170, KEY, { ls: 6 }); });
    shape([[460, 380], [1460, 374], [1450, 446], [470, 452]], KEY);
    fitType('LIVE  ·  ONE NIGHT ONLY', 960, 414, 900, 54, YEL, { font: '"Futura"', w: 'bold', ls: 6 });
    fitType('ONE LANE ONLY', 300, 935, 420, 40, PAPER, { font: '"Futura"', w: 'bold', rot: -.06, ls: 3 });
    type('NO PASSING', 1640, 935, 44, YEL, { rot: .07, ls: 4, lw: 10, line: KEY });
    // bunting
    for (let r = 0; r < 2; r++) {
      const N = 12, step = 2040 / N, y0 = 26 + r * 30, sag = 46 + r * 26, yy = (x) => y0 + sag * Math.sin(Math.PI * clamp((x + 60) / 2040));
      const xs = r ? 0 : step / 2;
      stroke([...Array(41)].map((_, j) => [-60 + j * 51, yy(-60 + j * 51)]), KEY, 4);
      for (let i = -1; i < N; i++) { const x = -60 + xs + i * step, xm = x + step / 2, sw = Math.sin(T * 7 + i * 1.3) * 10 * (.3 + bp);
        shape([[x + 8, yy(x + 8)], [x + step - 8, yy(x + step - 8)], [xm + sw, yy(xm) + 78]], [PINK, TEAL, YEL, RED][(i + 4 + r * 2) % 4], { lw: 3 }); }
    }
    confetti(T, 110, 7);
    const h = hit(t, 130.06, 7) * .9 + beatPulse(t, 11) * .25;
    fx({ ...apart(h, 3 + n), inks: ISET[0], jit: 2.4 + 3 * h });
  }

  // ===== 132.17 Warhol: 2x2 one panel per beat, then 3x3 colourways rippling on every beat =====
  const WAYS = [
    { bg: PINK, pal: { ...PAL0, body: YEL, glass: TEAL, wing: TEAL, fin: TEAL, tip: PAPER, cheek: C(0, 0, 0), ring: TEAL } },
    { bg: YEL, pal: { ...PAL0, body: PAPER, glass: PINK, wing: PINK, fin: PINK, tip: TEAL, cheek: C(.6, 0, 0), ring: PINK } },
    { bg: TEAL, pal: { ...PAL0, body: PINK, glass: YEL, wing: YEL, fin: YEL, tip: PAPER, cheek: C(0, 0, .6), ring: YEL } },
    { bg: RED, pal: { ...PAL0, body: TEAL, glass: PAPER, wing: YEL, fin: YEL, tip: PINK, cheek: C(0, 0, 0), ring: YEL } },
    { bg: GREEN, pal: { ...PAL0, body: PINK, glass: PAPER, wing: PAPER, fin: PAPER, tip: YEL, cheek: C(0, 0, 0), ring: PAPER } },
    { bg: PAPER, pal: { ...PAL0, body: YEL, glass: PINK, wing: TEAL, fin: TEAL, tip: PINK, cheek: C(.6, 0, 0), ring: PINK } },
    { bg: C(.5, 0, 0), pal: { ...PAL0, body: TEAL, glass: YEL, wing: YEL, fin: YEL, tip: PAPER, cheek: C(0, 0, 0), ring: YEL } },
    { bg: C(0, .45, 1), pal: { ...PAL0, body: PAPER, glass: PINK, wing: PINK, fin: PINK, tip: YEL, cheek: C(.6, 0, 0), ring: PINK } },
    { bg: PURPLE, pal: { ...PAL0, body: YEL, glass: PAPER, wing: PAPER, fin: PAPER, tip: PINK, cheek: C(.6, 0, 0), ring: PAPER } },
  ];
  const LOOKS = [[.5, .3], [0, .4], [-.5, .3], [.6, 0], [0, 0], [-.6, 0], [.5, -.4], [0, -.5], [-.5, -.4]];
  function warhol(t) {
    const T = ta(t); FRI = Math.floor(t * 12);
    const g = T < barT(2) ? 2 : 3, w = W / g, h = H / g, n = bN(T);
    sheet(PAPER);
    for (let r = 0; r < g; r++) for (let c = 0; c < g; c++) {
      const i = r * g + c;
      if (g === 3 && i === 4) continue;
      const pt = g === 2 ? beatT(4 + [0, 1, 3, 2][i]) : barT(2) + (r + c) * .045;
      if (T < pt - .001) continue;
      const pop = ease.back(inv(pt, pt + .17, T));
      const wi = g === 2 ? [0, 1, 3, 2][i] * 2 : (i * 4 + Math.max(0, bN(T - (r + c) * .07) - 8)) % WAYS.length;
      const way = WAYS[wi], lag = (i % 4) * .03;
      const vo = clamp((F('voc', T - lag, 1) - .07) / .4), bp = beatPulse(T - lag, 7);
      withT(() => {
        s.beginPath(); s.rect(c * w, r * h, w, h); s.clip(); sheet(way.bg);
        const k = (h * .8 / 504) * (1.3 - .3 * pop);
        frontPlane(c * w + w / 2, r * h + h / 2 + 410 * k, k, { t: T, open: vo, look: LOOKS[g === 2 ? [0, 2, 6, 8][i] : i], brow: [.3 + .7 * vo, 0], bob: -22 * bp, spin: T * TAU * 1.9, pal: way.pal, lid: baseF(t).lid });
      });
    }
    for (let k = 1; k < g; k++) { stroke([[k * w, -10], [k * w, H + 10]], PAPER, 14); stroke([[-10, k * h], [W + 10, k * h]], PAPER, 14); }
    if (g === 2) {                                                           // a LIVE! sticker slapped in the middle
      const p = ease.back(inv(beatT(5), beatT(5) + .2, T)), bp = beatPulse(T, 6);
      if (p > 0) withT(() => { s.translate(960, 540); s.scale(p * (1 + .06 * bp), p * (1 + .06 * bp)); s.rotate(-.12 + .04 * Math.sin(T * 3));
        star(0, 0, 150, 205, 16, T * .3, YEL, { lw: 7 }); ell(0, 0, 135, 135, null, { lw: 5, line: PINK });
        type('LIVE!', 0, 6, 128, PINK, { lw: 12, line: KEY, ls: 2 }); });
    } else {                                                                  // the centre panel is the gig-poster type
      const pb = Math.floor((T - barT(2)) / (barT(3) - barT(2))), bp = beatPulse(T, 6);
      withT(() => { s.beginPath(); s.rect(w, h, w, h); s.clip(); sheet(pb % 2 ? YEL : KEY);
        const fg = pb % 2 ? KEY : YEL, ac = PINK;
        fitType('NO', w * 1.5, h + 100, (w - 120) / 1.06, 150 * (1 + .05 * bp), fg, { ls: 10 });
        fitType('PASSING', w * 1.5, h + 210, (w - 100) / 1.06, 104, fg, { ls: 6 });
        shape([[w + 40, h + 270], [w * 2 - 40, h + 266], [w * 2 - 40, h + 320], [w + 40, h + 324]], ac);
        fitType('ONE NIGHT ON THE SHOULDER', w * 1.5, h + 296, w - 120, 28, pb % 2 ? PAPER : KEY, { font: '"Futura"', w: 'bold', ls: 2 }); });
    }
    const y2 = hit(t, 135.18, 6);
    const ap = apart(.45 * y2 + .18 * beatPulse(t, 9), 21 + n);
    fx({ ...ap, inks: g === 2 ? ISET[0] : ISET[[1, 2][T < barT(3) ? 0 : 1]], jit: 3 });
  }

  // ===== 138.87 cameo: the red-carpet passing lane; a limo, flashbulbs, "yeah, yeah, yeah" =====
  const CARS_C = [[139.15, TEAL], [139.95, RED, true], [140.85, YEL]];
  function cameo(t, slow) {
    const T = slow ?? ta(t); FRI = Math.floor(t * 12);
    const z = kf(T, [[barT(4), 1.0], [VAMP_END, 1.14]], (x) => x), fcx = W / 2 + 60, fcy = H / 2 + 20;
    const st = baseF(slow ?? t);
    let look = [.6, .3], best = null;
    for (const c of CARS_C) { const x = PXS + 250 + (T - c[0]) * VCAR; if (x > -200 && x < W + 300 && (best === null || Math.abs(x - 1100) < Math.abs(best - 1100))) best = x; }
    if (best !== null) look = [clamp((best - (PXS + 250)) / 500, -1, 1), .9];
    withT(() => {
      s.translate(W / 2, H / 2); s.scale(z, z); s.translate(-fcx, -fcy);
      sideWorld(slow ?? t, true);
      sidePlane(PXS, PYS, 1.0, { ...st, look, brow: [.5 + .5 * st.open, .2] }, () => {
        stanchions(slow ?? t);
        for (const c of CARS_C) { const x = PXS + 250 + (T - c[0]) * VCAR; if (x > -700 && x < W + 700) carSide(x, 1062, .95, c[1], T, c[2]); }
        const lx = PXS + 250 + (T - CARS_C[1][0]) * VCAR;                   // flashbulbs around the limo
        for (let q = 0; q < 9; q++) { const ft = 139.55 + q * .16, d = T - ft; if (d < 0 || d > .14) continue;
          const fx0 = lx - 260 + hash(q * 31 + 5) * 420, fy0 = 930 - hash(q * 17 + 9) * 260;
          star(fx0, fy0, 22, 90, 8, q, YEL); ell(fx0, fy0, 26, 26, PAPER); }
      });
    });
    confetti(T, 50, 99, .9);
    fx({ inks: ISET[0], jit: 2.4 });
  }

  // ===== 141.13 explode: the vocal stops, the print comes apart; dots bloom =====
  function explode(t) {
    cameo(t, VAMP_END - .03 + (t - VAMP_END) * .12);
    const u = inv(VAMP_END, barT(6), t), n = bN(t);
    const a = snapA(t, 1.5) * (.45 + .9 * u);
    fx({ ...apart(a, 11 + n, 1.3), inks: ISET[n % ISET.length], jit: 3 + 4 * a,
      cell: [1 + 2.6 * u, 1 + 2.1 * u, 1 + 3 * u], ang: rotScr(t - VAMP_END, 1 + 2 * u) });
  }

  // ===== 143.37 screens: pure ink. Rings per plate meet on the beat, drift apart, moire; then spinning wedges =====
  function screens(t) {
    const T = ta(t); FRI = Math.floor(t * 12);
    const n = bN(t), e = En(T), a = snapA(t), bar2 = T >= barT(7);
    sheet(PAPER);
    s.fillStyle = C(0, 0, .42 + .2 * e); s.fillRect(-W, -H, W * 3, H * 3);             // the yellow drum: a pure halftone flood
    for (let p = 0; p < 2; p++) {
      const hh = (m) => hash((n * 37 + p * 7 + m) >>> 0) * 2 - 1;
      const cx = 960 + hh(1) * 560 * a + Math.sin(T * .9 + p * 3) * 60, cy = 540 + hh(2) * 320 * a;
      lighten();
      if (!bar2) {
        const sp = 52 + 8 * p, ph = wrap(T * (70 + 40 * p) * (p ? -1 : 1), sp);
        s.strokeStyle = ink(p); s.lineWidth = sp * (.3 + .25 * e);
        for (let r = ph; r < 2400; r += sp) { s.beginPath(); s.arc(cx, cy, r, 0, TAU); s.stroke(); }
      } else {
        const N = [40, 41][p], rot = T * [.3, -.24][p] + a * hh(3) * .4;
        s.fillStyle = ink(p);
        for (let i = 0; i < N; i++) { const a0 = rot + i * TAU / N, a1 = a0 + TAU / N * (.35 + .2 * e); s.beginPath(); s.moveTo(cx, cy); s.lineTo(cx + Math.cos(a0) * 3200, cy + Math.sin(a0) * 3200); s.lineTo(cx + Math.cos(a1) * 3200, cy + Math.sin(a1) * 3200); s.closePath(); s.fill(); }
      }
      over();
    }
    shockwaves(T); pianoPops(T, 6);
    // a propeller disc drifts through the storm
    const u = inv(barT(6), barT(8), T);
    const px = lerp(-320, 2240, u), py = 540 + Math.sin(u * Math.PI * 2) * 210;
    fragProp(px, py, 210 + 40 * beatPulse(T, 6), T * TAU * 2.3);
    if (bar2) fragCheat(lerp(2400, -600, inv(barT(7), barT(8), T)), 860, 900, -.08);
    fx({ ...apart(.12 * a, n + 40), inks: ISET[bar2 ? 4 : 3], jit: 2.4 + 2 * e,
      cell: [3.6, 3.1, 4 + 1.5 * e], ang: rotScr(t - barT(6), 3) });
  }

  // ===== 147.87 breath: the energy drops; a cheat line and a row of windows slide by; an eye opens =====
  function breath(t) {
    const T = ta(t); FRI = Math.floor(t * 12);
    const t0 = barT(8), eT = beatT(34), lookT = beatT(35);
    sheet(C(0, 0, .3));
    const x0 = -900 + (T - t0) * 760;
    shape([[x0 - 3400, 760], [x0 + 1260, 746], [x0 + 1500, 790], [x0 + 1260, 834], [x0 - 3400, 820]], RED);
    stroke([[x0 - 3400, 862], [x0 + 1200, 852]], YEL, 12);
    for (let i = 0; i < 16; i++) { const wx = x0 + 1100 - i * 150; ell(wx, 650, 40, 40, TEAL, { lw: 6 }); ell(wx - 12, 638, 10, 10, PAPER); }
    saxRibbon(T, { y: 960 });
    const open = ease.out(inv(eT, eT + .3, T));
    if (T > eT - .05) {
      let look = [Math.sin(T * 2.3) * .7, Math.cos(T * 1.7) * .3 - .2];
      if (T > lookT) look = [0, .05];
      const lid = Math.max(1 - open, tri(T - (lookT + .55), .08));
      fragEye(960, 330, 165, { look, lid, body: C(0, 0, .3), t: T });
    }
    const dr = Math.sin(T * .9);
    fx({ off: [dr * 14, 4, -dr * 10, -6, 6, dr * 8], inks: ISET[0], jit: 1.8, starve: .8,
      cell: [2.6, 2.6, lerp(4.5, 3, inv(t0, barT(9), t))], ang: rotScr(t - t0, .6) });
  }

  // ===== 150.10 op-art: three wavy line screens interfere; a long wing cuts through as bare paper =====
  function opart(t) {
    const T = ta(t); FRI = Math.floor(t * 12);
    const e = En(T), bp = beatPulse(t, 5), bar2 = T >= barT(10), n = bN(t);
    sheet(PAPER);
    const A = 30 + 120 * e + 90 * bp, rot = bar2 ? (T - barT(10)) * .22 : 0;
    withT(() => { s.translate(960, 540); s.rotate(rot); s.translate(-960, -540);
      for (let p = 0; p < 3; p++) {
        const sp = [54, 59, 64][p], f = [.0042, .0049, .0037][p], ph = T * [2.1, -1.7, 1.3][p];
        lighten(); s.strokeStyle = ink(p); s.lineWidth = sp * (.4 + .12 * e);
        if (p < 2) for (let y = -700; y < 1800; y += sp) { s.beginPath(); for (let x = -700; x <= 2700; x += 36) { const yy = y + A * Math.sin(x * f + ph + y * .0021 * (p + 1)); x === -700 ? s.moveTo(x, yy) : s.lineTo(x, yy); } s.stroke(); }
        else for (let x = -700; x < 2700; x += sp) { s.beginPath(); for (let y = -700; y <= 1800; y += 36) { const xx = x + A * .7 * Math.sin(y * f + ph); y === -700 ? s.moveTo(xx, y) : s.lineTo(xx, y); } s.stroke(); }
        over();
      }
    });
    if (!bar2) { const u = inv(barT(9), barT(10), T); fragWing(lerp(-1500, 1300, u), 640 + 60 * Math.sin(u * 4), 1.15, -.1 + .08 * u, PAPER); }
    else { const u = inv(barT(10), barT(11), T);
      fragWing(lerp(-1400, 700, ease.out(u)), 420, .95, -.05, PAPER);
      withT(() => { s.translate(W, 0); s.scale(-1, 1); fragWing(lerp(-1400, 700, ease.out(inv(barT(10) + .55, barT(11), T))), 780, .95, .05, KEY, YEL); }); }
    fx({ ...apart(.3 * bp, n + 60), inks: ISET[bar2 ? 6 : 5], jit: 2.4, ang: rotScr(t - barT(9), 1.5) });
  }

  // ===== 154.53 geometry: a Swiss gig-poster kit of ink shapes and plane parts, re-laid on every beat =====
  const GEO = [['circle', YEL, 330], ['dots', C(.55, 0, 0), 360], ['half', PINK, 280], ['bar', TEAL, 560], ['tri', RED, 300], ['ring', KEY, 230],
    ['quarter', TEAL, 300], ['circle', PINK, 120], ['bar', YEL, 340], ['cheat', null, 760], ['wing', KEY, .55], ['tyre', null, 120], ['prop', null, 190], ['eye', null, 105]];
  const lay = (k, i) => { const h = (m) => hash((k * 131 + i * 17 + m) >>> 0);
    return [180 + h(1) * 1560, 140 + h(2) * 800, .75 + h(3) * .55, (h(4) - .5) * Math.PI * 1.4]; };
  function geoDraw(kind, col, sz, x, y, sc, r, T) {
    withT(() => { s.translate(x, y); s.rotate(r); const z = sz * sc;
      if (kind === 'circle') ell(0, 0, z, z, col);
      else if (kind === 'half') { s.beginPath(); s.arc(0, 0, z, Math.PI, TAU); s.closePath(); paint(col, {}); }
      else if (kind === 'quarter') { s.beginPath(); s.moveTo(0, 0); s.arc(0, 0, z, 0, Math.PI / 2); s.closePath(); paint(col, {}); }
      else if (kind === 'bar') { s.fillStyle = col; s.fillRect(-z / 2, -z * .09, z, z * .18); }
      else if (kind === 'tri') shape([[0, -z], [z * .87, z * .5], [-z * .87, z * .5]], col, { op: 1 });
      else if (kind === 'ring') { ringPath(0, 0, z * .78, z); s.fillStyle = col; s.fill('evenodd'); }
      else if (kind === 'dots') { lighten(); s.fillStyle = col; for (let a = -z; a <= z; a += z / 5) for (let b = -z; b <= z; b += z / 5) { s.beginPath(); s.arc(a, b, z / 13, 0, TAU); s.fill(); } over(); }
      else if (kind === 'cheat') fragCheat(0, 0, z, 0, 1);
      else if (kind === 'wing') fragWing(-600 * sc * sz, 0, sz * sc, 0, col);
      else if (kind === 'tyre') tyreSide(0, 0, z, T * 22, 0, PAL0);
      else if (kind === 'prop') fragProp(0, 0, z, T * TAU * 2.2 - r);
      else if (kind === 'eye') fragEye(0, 0, z, { look: [Math.sin(T * 3), .2], t: T });
    });
  }
  function geom(t) {
    const T = ta(t); FRI = Math.floor(t * 12);
    const n = Math.max(0, dN(T)), bt = HITS.drums[n] ?? BTS[lastBeat(T)], u = ease.back(inv(bt, bt + .22, T)), bk = bassK(T);
    sheet(PAPER);
    const bgk = n % 4;                                                              // a flood behind half the sheet, flipping side per beat
    withT(() => { s.translate(960, 540); s.rotate(bgk * Math.PI / 2 + .3); s.fillStyle = [C(0, 0, .55), C(.35, 0, 0), C(0, .3, 0), C(0, 0, .55)][bgk]; s.fillRect(0, -2000, 2000, 4000); });
    GEO.forEach(([kind, col, sz], i) => {
      const A = lay(n - 1, i), B = lay(n, i);
      geoDraw(kind, col, sz, lerp(A[0], B[0], u), lerp(A[1], B[1], u), lerp(A[2], B[2], u) * (1 + .1 * hitPulse('drums', T, 8)) * (sz > 200 ? bk : 1), lerp(A[3], B[3], u) + T * .15, T);
    });
    pianoPops(T, 8);
    fx({ ...apart(snapA(t, 2.2) * .7, n + 80), inks: ISET[T < barT(12) ? 7 : 1], jit: 2.6, cell: [1.6, 1.6, 2], ang: rotScr(t - barT(11), 1) });
  }

  // ===== 158.97 tunnel: rounded windscreen frames rushing at us, one tunnel per drum; an eye at the end =====
  function tunnelDraw(T, a, n, e, eyeOn = true) {
    sheet(PAPER);
    for (let p = 0; p < 3; p++) {
      const hh = (m) => hash((n * 41 + p * 9 + m) >>> 0) * 2 - 1;
      const cx = 960 + hh(1) * 260 * a + Math.sin(T * 1.7 + p * 2) * 70, cy = 540 + hh(2) * 160 * a + Math.cos(T * 1.3 + p) * 45;
      withT(() => { s.translate(cx, cy); s.rotate(T * [.35, -.28, .5][p] + p * .4);
        lighten(); s.fillStyle = ink(p, p === 2 ? .85 : 1);
        const N = 16; for (let i = 0; i < N; i++) { if ((i + p) % 2) continue; const z = wrap(i / N + T * (.32 + .06 * p + .25 * e), 1); const R = 28 * Math.pow(70, z), R2 = R * (.8 - .06 * p);
          s.beginPath(); s.roundRect(-R * 1.5, -R, R * 3, R * 2, R * .55); s.roundRect(-R2 * 1.5, -R2, R2 * 3, R2 * 2, R2 * .55); s.fill('evenodd'); }
        over(); });
    }
    if (eyeOn) fragEye(960 + Math.sin(T * 1.7) * 70, 540 + Math.cos(T * 1.3) * 45, 70, { look: [Math.sin(T * 4) * .6, 0], t: T, lid: tri(T - 160.1, .08) });
  }
  function tunnel(t) {
    const T = ta(t); FRI = Math.floor(t * 12);
    const n = bN(t), e = Math.max(En(T), SEs('bass', T, 3) * 1.3), a = snapA(t, 1.4);
    withT(() => { s.translate(960, 540); s.scale(bassK(T), bassK(T)); s.translate(-960, -540); tunnelDraw(T, a, n, e); });
    shockwaves(T, 960, 540, { w: 40 });
    const di = lastHitI('drums', T);
    for (let q = 0; q < 3; q++) { const bt = HITS.drums[di - q] ?? -9, d = T - bt; if (d < 0 || d > .5) continue;   // a cheat line streaks out of the tunnel on each drum hit
      const ang = (di - q) * 1.9 + .5, rr = 120 + d * 3200; fragCheat(960 + Math.cos(ang) * rr, 540 + Math.sin(ang) * rr, 300 + d * 1500, ang, 1); }
    fx({ ...apart(.35 * a, n + 100), inks: ISET[2], jit: 2.6, cell: [1.4, 1.4, 2.4], ang: rotScr(t - barT(13), 2) });
  }

  // ===== 161.20 vortex: spiral arms in two drums, plane parts caught in the storm =====
  const FRAGS = ['cheat', 'eye', 'prop', 'wing', 'tyre', 'prop', 'cheat', 'eye', 'wing', 'prop', 'tyre', 'cheat', 'eye', 'prop'];
  function fragStorm(T, spread = 1, speed = 1) {
    FRAGS.forEach((kind, i) => {
      const r = rng(i * 77 + 3); const a0 = r() * TAU, w = (.5 + r() * .7) * (i % 2 ? 1 : -1) * speed, R0 = 180 + r() * 760, sc = .55 + r() * .6;
      const R = R0 * spread * (1 + .12 * Math.sin(T * 1.3 + i)), a = a0 + T * w;
      const x = 960 + Math.cos(a) * R * 1.25, y = 540 + Math.sin(a) * R * .8, rot = a * 1.5 + T * (r() - .5) * 3;
      if (kind === 'cheat') fragCheat(x, y, 520 * sc, rot, 1);
      else if (kind === 'eye') fragEye(x, y, 70 * sc, { look: [Math.cos(a + 2), Math.sin(a + 2) * .6], t: T, body: PAPER });
      else if (kind === 'prop') fragProp(x, y, 150 * sc, T * TAU * 2.4 * (i % 2 ? 1 : -1));
      else if (kind === 'wing') fragWing(x - 400 * sc * .5, y, sc * .5, rot, i % 3 ? KEY : PAPER);
      else tyreSide(x, y, 70 * sc, T * 20, 0, PAL0);
    });
  }
  function spiral(T, e, cx = 960, cy = 540) {
    for (let p = 0; p < 2; p++) {
      lighten(); s.strokeStyle = ink(p); s.lineWidth = 34 + 26 * e; s.lineCap = 'butt';
      const N = 14, dir = p ? -1 : 1;
      for (let k = 0; k < N; k++) { s.beginPath(); for (let r = 10; r < 2300; r += 40) { const a = k * TAU / N + dir * (r * .0032) + T * .9 * dir; const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r; r === 10 ? s.moveTo(x, y) : s.lineTo(x, y); } s.stroke(); }
      over();
    }
  }
  function vortex(t) {
    const T = ta(t); FRI = Math.floor(t * 12);
    const e = En(T), n = bN(t);
    sheet(C(0, 0, .35));
    spiral(T, e);
    shockwaves(T, 960, 540, { w: 60 });
    instStorm(T);
    fragStorm(T, 1 - .25 * inv(barT(14), barT(15), T));
    pianoPops(T, 5, .8);
    fx({ off: [Math.sin(T * 3) * 40 * e, Math.cos(T * 2.3) * 25, -Math.sin(T * 2.6) * 38 * e, 18, 12, -Math.cos(T * 3.1) * 30], rot: [Math.sin(T * 2) * .1 * e, -Math.sin(T * 2.4) * .1 * e, .05 * Math.sin(T * 3)],
      zm: [1 + .06 * beatPulse(t, 7), 1, 1 - .04 * beatPulse(t, 7)], inks: ISET[(n + 3) % ISET.length], jit: 3, cell: [2, 2, 3.2], ang: rotScr(t - barT(14), 2.5) });
  }

  // ===== 163.40 strobe: one bold print per beat, every drum slams in from too big =====
  function strobe(t) {
    const T = ta(t); FRI = Math.floor(t * 12);
    const n = Math.max(0, dN(T)), k = n % 6, bt = HITS.drums[n] ?? T, d = T - bt;
    sheet(PAPER);
    if (k === 0) { sheet(PINK); ell(960, 540, 430, 430, PAPER); fragProp(960, 540, 400, T * TAU * 2.6, false); }
    else if (k === 1) { sheet(TEAL); shape([[960, 40], [1560, 1040], [360, 1040]], YEL); fragWing(-200, 560, 1.4, -.12, KEY); }
    else if (k === 2) { sheet(YEL); lighten(); s.strokeStyle = PINK; s.lineWidth = 44; for (let r = 60 + wrap(T * 300, 110); r < 1400; r += 110) { s.beginPath(); s.arc(960, 540, r, 0, TAU); s.stroke(); } over();
      ell(960, 540, 230, 250, PAPER); fragEye(960, 540, 200, { look: [0, 0], t: T, body: YEL, lid: tri(d - .3, .07) }); }
    else if (k === 3) { sheet(KEY); for (let i = -4; i < 6; i++) fragCheat(960 + i * 260, 540 + i * 60, 2600, -.42, 1); }
    else if (k === 4) { sheet(YEL); sax(800, 600, 1.1, T, { rot: .1, body: PAPER }); }
    else { sheet(TEAL); piano(960, 600, 1.15, T, { case: PINK }); }
    const sl = 1 - ease.out(clamp(d / .16));
    const h = (m) => hash((n * 13 + m) >>> 0) * 2 - 1;
    fx({ off: [h(1) * 120 * sl, h(2) * 80 * sl, h(3) * 120 * sl, h(4) * 80 * sl, h(5) * 120 * sl, h(6) * 80 * sl], zm: [1 + .45 * sl, 1 + .3 * sl, 1 + .6 * sl], rot: [h(7) * .2 * sl, h(8) * .2 * sl, h(9) * .2 * sl],
      inks: ISET[(n * 3) % ISET.length], jit: 3 + 4 * sl, cell: [1.2, 1.2, 1.6] });
  }

  // ===== 165.57 peak: tunnel plus storm at full tilt; the hit at 167.17 blows the drums off the sheet =====
  function peak(t) {
    const T = ta(t); FRI = Math.floor(t * 12);
    const n = bN(t), e = Math.max(En(T), .6), a = snapA(t, 1.3);
    tunnelDraw(T, a, n, e, false);
    shockwaves(T, 960, 540, { w: 80, speed: 3000 });
    fragStorm(T * 1.3, .85 + .35 * inv(165.57, HIT, T), 1.4);
    pianoPops(T, 6);
    const blow = ease.in(inv(HIT, HIT + .45, t));
    const ap = apart(.5 * a + .4 * hit(t, 165.3, 8), n + 140, 1.2);
    fx({ ...ap, zm: ap.zm.map((z, i) => z * (1 + blow * [2.2, 1.6, 2.8][i])), rot: ap.rot.map((r, i) => r + blow * [.6, -.5, .8][i]),
      inks: ISET[n % ISET.length], jit: 3 + 4 * a, cell: [1.4 + 2 * blow, 1.4 + 2 * blow, 2], ang: rotScr(t - barT(16), 3) });
  }

  // ===== 167.67 settle: the quiet bar. The drums drift back in, each carrying its part of him; slam into a clean print at 169.20 =====
  function settle(t) {
    const T = ta(t); FRI = Math.floor(t * 12);
    const SNAP = beatT(70);                                                         // 169.20, the last beat before the cut
    sheet(PAPER);
    rays(960, 640, 24, 2600, T * .05, C(0, 0, .3));
    sun(960, 600, 300);
    mountains(800, -200, 120, 260, 71, C(0, .5, 0));
    s.fillStyle = C(0, 0, .5); s.fillRect(-W, 800, W * 3, 400);
    s.fillStyle = TEAL; s.fillRect(-W, 900, W * 3, 300); stroke([[-W, 906], [W * 2, 906]], PAPER, 6);
    for (let i = 0; i < 12; i++) { s.fillStyle = PAPER; s.fillRect(i * 180 + 40, 990, 90, 10); }
    const st = baseF(t);
    frontPlane(960, 1010, .7, { ...st, open: 0, look: [0, .08], brow: [.2, 0], bob: 0, sq: 0 });
    border(44);
    const a = t < SNAP ? lerp(1, .42, ease.out(inv(barT(17), SNAP, t))) : 0;
    const wob = t >= SNAP ? hit(t, SNAP, 14) : 0;
    const h = (m) => hash((900 + m) >>> 0) * 2 - 1;
    fx({ off: [h(1) * 520 * a + wob * 18, h(2) * 300 * a, h(3) * 520 * a - wob * 14, h(4) * 300 * a, h(5) * 520 * a, h(6) * 300 * a + wob * 10],
      rot: [h(7) * .7 * a, h(8) * .7 * a, h(9) * .7 * a], zm: [1 + h(10) * .5 * a, 1 + h(11) * .5 * a, 1 + h(12) * .5 * a],
      inks: ISET[0], jit: t < SNAP ? 3 : 1.4, starve: t < SNAP ? 1 : .7 });
  }


  // ===== v2 instrument cameos and reactive overlays =====
  // 145.60 PIANO: the upright prints over the spinning wedge storm; keys go down on every piano note
  function pianoShot(t) {
    const T = ta(t); FRI = Math.floor(t * 12);
    const e = En(T), a = snapD(t), n = dN(t), t0 = barT(9);
    sheet(PAPER);
    s.fillStyle = C(0, 0, .4 + .25 * SEs('drums', T, 1)); s.fillRect(-W, -H, W * 3, H * 3);
    for (let p = 0; p < 2; p++) {
      const hh = (m) => hash((n * 37 + p * 7 + m) >>> 0) * 2 - 1;
      const cx = 960 + hh(1) * 300 * a, cy = 300 + hh(2) * 160 * a;
      const N = [40, 41][p], rot = T * [.3, -.24][p];
      lighten(); s.fillStyle = ink(p, .9);
      for (let i = 0; i < N; i++) { const a0 = rot + i * TAU / N, a1 = a0 + TAU / N * (.3 + .2 * e); s.beginPath(); s.moveTo(cx, cy); s.lineTo(cx + Math.cos(a0) * 3200, cy + Math.sin(a0) * 3200); s.lineTo(cx + Math.cos(a1) * 3200, cy + Math.sin(a1) * 3200); s.closePath(); s.fill(); }
      over();
    }
    shockwaves(T, 960, 300, { w: 50 });
    const rise = ease.back(inv(t0, t0 + .35, T));
    piano(960, 640 + (1 - rise) * 700, .95, T, { rot: -.05 + .02 * Math.sin(T * 1.3) });
    pianoPops(T, 8, 1.2);
    fragCheat(lerp(2400, -700, inv(t0, barT(10), T)), 120, 900, -.06);
    fx({ ...apart(.3 * a, n + 300), inks: ISET[4], jit: 2.6, cell: [3, 3, 3.8], ang: rotScr(t - t0, 2) });
  }

  // 150.10 SAX: the alto sways in front of the op-art screens; the waves swing with the sax, notes and puffs on its onsets
  function saxShot(t) {
    opart(t);
    const T = ta(t); FRI = Math.floor(t * 12);
    const t0 = barT(9), u = ease.back(inv(t0, t0 + .4, T));
    saxRibbon(T, { y: 900 });
    const bar2 = T >= barT(10);
    const sx = bar2 ? 1120 : 860 + 60 * Math.sin(T * .6), sy = 600 + (1 - u) * 1000, mr = 470 * (1 + .06 * hitPulse('sax', T, 6));
    ell(sx + 60, sy - 60, mr, mr, PAPER, { lw: 14 }); ell(sx + 60, sy - 60, mr - 34, mr - 34, null, { lw: 6, line: PINK });   // a poster medallion so he reads
    sax(sx, sy, 1.05, T, { rot: bar2 ? .14 : -.1 });
    pianoPops(T, 5, .8);
    const n = dN(t);
    fx({ ...apart(.35 * snapD(t, 2) + .25 * hitPulse('sax', t, 6), n + 400), inks: ISET[bar2 ? 6 : 5], jit: 2.4, ang: rotScr(t - t0, 1.5) });
  }

  // 156.73 DRUMS: the kit plays itself; every drum hit fires a shockwave and slams the drums into register; the guitar rings at the side
  function drumShot(t) {
    const T = ta(t); FRI = Math.floor(t * 12);
    const t0 = barT(12), n = dN(t), hp = hitPulse('drums', t, 9);
    sheet(n % 2 ? C(0, 0, .5) : C(.4, 0, 0));
    rays(960, 520, 24, 2600, T * .2 + n * .13, n % 2 ? C(.45, 0, 0) : C(0, 0, .8));
    shockwaves(T, 960, 600, { w: 90, speed: 2800 });
    const u = ease.back(inv(t0, t0 + .3, T));
    withT(() => { s.translate(960, 620); s.scale(u, u); s.translate(-960, -620); drumkit(960, 600, .82 * (1 + .03 * hp), T); });
    if (SEs('guitar', T, 2) > .3) guitar(1700, 900, .55, .5, T);
    fragProp(220, 220, 150, T * TAU * 2.4);
    const sl = snapD(t, 2.4);
    fx({ ...apart(.55 * sl, n + 500), zm: [1 + .06 * hp, 1, 1 - .04 * hp], inks: ISET[(Math.floor(n / 2)) % ISET.length], jit: 2.6 + 2 * hp, cell: [1.5, 1.5, 2] });
  }

  // instruments caught in the vortex alongside the plane parts
  function instStorm(T) {
    const list = [['sax', .42, 0, 820], ['piano', .2, 2.1, 760], ['guitar', .32, 4.2, 700]];
    for (const [kind, sc, a0, R0] of list) {
      const a = a0 + T * .55, R = R0 * (1 + .1 * Math.sin(T + a0)), x = 960 + Math.cos(a) * R * 1.1, y = 540 + Math.sin(a) * R * .55;
      if (kind === 'sax' && SEs('other', T, 3) > .2) sax(x, y, sc, T, { rot: a * .5 });
      if (kind === 'piano' && SEs('piano', T, 3) > .2) piano(x, y, sc, T, { rot: Math.sin(a) * .3 });
      if (kind === 'guitar' && SEs('guitar', T, 3) > .2) guitar(x, y + 120, sc, a + 1, T);
    }
  }


  // ---- v3 SEAM FRAMING (STORYBOARD "v3 execution spec"): side view, nose right, plane centred at x 50% / y 58%,
  // body about 45% of the frame width, the road's dashed centre line horizontal at y 72% (the continuous thread) ----
  const SEAM = { k: 864 / 638, line: 778 };
  SEAM.x = 960 + 35 * SEAM.k; SEAM.y = 626 + 183 * SEAM.k;      // plane origin (road contact) so the body centre lands at (960, 626)
  function seamWorld(T, V, o = {}) {
    const sc = T * V, rain = o.rain || 0;
    sheet(PAPER);
    s.fillStyle = C(.6, 0, 0); s.fillRect(-W, -H, W * 3, H + 120);
    s.fillStyle = C(.4, 0, 0); s.fillRect(-W, 120, W * 3, 80);
    s.fillStyle = C(.22, 0, 0); s.fillRect(-W, 200, W * 3, 70);
    s.fillStyle = C(.1, 0, 0); s.fillRect(-W, 270, W * 3, 60);
    if (!o.noSun) sun(1460, 380, 170);
    mountains(600, -wrap(sc * .05, 680) - 300, 240, 340, 41, C(0, .55, 0));
    mountains(650, -wrap(sc * .14, 520) - 300, 120, 260, 53, C(0, 0, .6), { op: 1 });
    s.fillStyle = C(0, 0, .35); s.fillRect(-W, 640, W * 3, 70);
    for (let i = -1; i < 12; i++) { const x = i * 300 - wrap(sc * .3, 300); stroke([[x, 708], [x, 560]], KEY, 7); stroke([[x - 26, 574], [x + 26, 574]], KEY, 6); }
    if (rain > 0) { lighten(); s.fillStyle = C(.28 * rain, .32 * rain, 0); s.fillRect(-W, -H, W * 3, H + 700 + H); over(); }   // the sky greys over
    s.fillStyle = TEAL; s.fillRect(-W, 700, W * 3, 260);
    stroke([[-W, 710], [W * 2, 710]], PAPER, 6); stroke([[-W, 950], [W * 2, 950]], PAPER, 6);
    for (let i = -1; i < 14; i++) { const x = i * 220 - wrap(sc, 220); s.fillStyle = o.lineCol || PAPER; s.fillRect(x, SEAM.line - 6, 120, 12); }   // the thread
    s.fillStyle = C(0, 0, .5); s.fillRect(-W, 958, W * 3, 400);
    for (let i = -1; i < 30; i++) { const x = i * 90 - wrap(sc * 1.3, 90); stroke([[x, 1030], [x + 8, 1005], [x + 16, 1030]], C(.6, 0, .5), 4); }
  }
  function rainfall(T, amt, seed = 1) {                            // slanted riso rain, drops on twos
    if (amt <= 0) return;
    const n = Math.round(320 * amt); lighten(); s.strokeStyle = C(0, .55, 0); s.lineWidth = 3; s.lineCap = 'round'; s.beginPath();
    for (let i = 0; i < n; i++) { const r = rng(i * 53 + seed); const x0 = r() * 2400 - 300, y = wrap(r() * 1400 + T * (1500 + r() * 400), 1400) - 160, l = 40 + r() * 50, x = x0 + y * .22;
      s.moveTo(x, y); s.lineTo(x + l * .22, y + l); }
    s.stroke(); over();
    s.strokeStyle = PAPER; s.lineWidth = 2.5; s.beginPath();                                       // and paper-white streaks so the rain reads over any ink
    for (let i = 0; i < Math.round(160 * amt); i++) { const r = rng(i * 71 + seed + 999); const x0 = r() * 2400 - 300, y = wrap(r() * 1400 + T * (1700 + r() * 300), 1400) - 160, l = 30 + r() * 40, x = x0 + y * .22;
      s.moveTo(x, y); s.lineTo(x + l * .22, y + l); }
    s.stroke();
    for (let i = 0; i < Math.round(40 * amt); i++) { const r = rng((Math.floor(T * 12) * 97 + i * 13) >>> 0); const x = r() * 1920, y = 715 + r() * 240;   // splashes on the road
      ell(x, y, 12 + r() * 10, 3 + r() * 2, null, { lw: 2.5, line: PAPER }); }
  }

  // ======================= v3 =======================
  // strong drum hits (envelope rise > .45) for extra cuts
  const STRONG = (() => { const e = STM.drums.env, o = []; let last = -99;
    for (let i = 3; i < e.length; i++) { const m = Math.min(e[i - 1], e[i - 2], e[i - 3]); if (e[i] - m > .45 && i - last >= 4 && e[i] >= e[i - 1]) { o.push(i / 24); last = i; } } return o; })();
  function punch(t, t0, fn) {                                      // cut tight/wide on each strong drum hit inside a shot
    const n = STRONG.filter((h) => h > t0 && h <= t).length, z = n % 2 ? 1.3 : 1;
    withT(() => { s.translate(960, 540); s.scale(z, z); s.rotate(n % 2 ? .04 : 0); s.translate(-960, -540); fn(); });
  }

  // ---- 129.92 PRESS: he comes out of the printing-press rollers freshly printed, seam framing, the inks settle into register ----
  const PRESS_END = 131.63, PRESS_V = 1300;                        // cut to the poster on the strong drum hit at 131.63
  // rollers in the same place as woodcut E's last frame: top roller centred (1035, 450) r 405, nip on the road at y 867.
  // Left of the nip is the unprinted scroll (paper, inked centre line, his outline); right of it the world is printed.
  const PAL_RAW = { ...PAL0, body: PAPER, glass: PAPER, wing: PAPER, fin: PAPER, tip: PAPER, cheek: PAPER, ring: PAPER };
  function press(t) {
    const T = ta(t); FRI = Math.floor(t * 12);
    const rx = 1035 - (t - F0) * PRESS_V, st = baseF(t), RR = 405;
    const pl = { ...st, look: [.8, -.1], brow: [.5 + .5 * st.open, 0] };
    withT(() => { s.beginPath(); s.rect(rx, -H, W * 3, H * 3); s.clip();                                      // printed
      seamWorld(T, PRESS_V, {}); sidePlane(SEAM.x, SEAM.y, SEAM.k, pl); });
    if (rx > -RR) withT(() => { s.beginPath(); s.rect(-W, -H, rx + W, H * 3); s.clip();                       // the raw scroll
      sheet(PAPER); stroke([[-W, 710], [W * 2, 710]], KEY, 5); stroke([[-W, 950], [W * 2, 950]], KEY, 5);
      for (let i = -1; i < 14; i++) { const x = i * 220 - wrap(T * PRESS_V, 220); s.fillStyle = KEY; s.fillRect(x, SEAM.line - 6, 120, 12); }
      sidePlane(SEAM.x, SEAM.y, SEAM.k, { ...pl, pal: PAL_RAW }); });
    if (rx > -RR - 20) {
      for (const [cy, col, dir] of [[450, PINK, -1], [867 + RR, TEAL, 1]]) {                                   // the two rollers, inked, turning
        const sp = dir * (t - F0) * PRESS_V / RR;
        ell(rx, cy, RR, RR, col, { lw: 10 });
        for (const rr of [.86, .68, .5]) { s.beginPath(); s.arc(rx, cy, RR * rr, sp, sp + 4.6); s.lineWidth = 8; s.strokeStyle = C(.35, .35, 0); s.stroke(); }
        ell(rx, cy, RR * .2, RR * .2, PAPER, { lw: 8 }); ell(rx, cy, RR * .07, RR * .07, KEY);
      }
    }
    const pl2 = (d) => 1 - ease.out(inv(F0, F0 + d, t));
    fx({ off: [-60 * pl2(.5), 14 * pl2(.5), 44 * pl2(.9), -20 * pl2(.9), 20 * pl2(1.3), 30 * pl2(1.3)],   // small spread so frame 0 still meets E's rollers
 inks: ISET[0], jit: 2.4 + 3 * pl2(1.2) });
  }

  // ---- the SAX REVEAL window: 5.0 s ending on the sax's first phrase onset (other.wav attack at ~145.06) ----
  const SAX_ON = 3482 / 24, SAX_WIN0 = 3387 / 24;                  // 145.0833 (frame 3482) and 141.125 (frame 3387): starts after the last "yeah"; the 5 s morph is retimed to 95 frames
  window.SEAMS = [{ a: SAX_WIN0, b: SAX_ON, name: 'sax' }];
  function explode3(t) {                                           // the window's start frame: the poster blows apart into an ink storm
    cameo(t, SAX_WIN0 - .03 + (t - SAX_WIN0) * .12);
    const u = inv(SAX_WIN0, SAX_ON, t), n = bN(t), a = .6 + .5 * snapA(t, 1.5);
    fx({ ...apart(a, 11 + n, 1.4), inks: ISET[n % ISET.length], jit: 3 + 4 * a,
      cell: [1.8 + 2 * u, 1.6 + 2 * u, 2 + 2 * u], ang: rotScr(t - SAX_WIN0, 1.5 + 2 * u) });
  }
  function saxReveal(t) {                                          // the window's end frame and the shot after it: the sax big where the plane sits in seam framing
    const T = ta(t); FRI = Math.floor(t * 12);
    const e = SEs('other', T, 2), n = dN(t), k = .85;
    sheet(C(0, 0, .45));
    for (let p = 0; p < 2; p++) {
      const N = [36, 37][p], rot = T * [.25, -.2][p];
      lighten(); s.fillStyle = ink(p, .9);
      for (let i = 0; i < N; i++) { const a0 = rot + i * TAU / N, a1 = a0 + TAU / N * (.3 + .25 * e); s.beginPath(); s.moveTo(960, 626); s.lineTo(960 + Math.cos(a0) * 3200, 626 + Math.sin(a0) * 3200); s.lineTo(960 + Math.cos(a1) * 3200, 626 + Math.sin(a1) * 3200); s.closePath(); s.fill(); }
      over();
    }
    shockwaves(T, 960, 626, { w: 50 });
    star(960, 626, 470, 580, 18, T * .2, PAPER, { lw: 8 });                                                   // the storm parts
    for (let i = -1; i < 14; i++) { const x = i * 220 - wrap(T * 300, 220); s.fillStyle = KEY; s.fillRect(x, SEAM.line - 6, 120, 12); }   // the thread
    sax(960 - 69 * k, 626 + 157 * k, k, T, { rot: 0 });
    pianoPops(T, 5, .8);
    fx({ ...apart(.15 * snapD(t, 2), n + 600), inks: ISET[4], jit: 2.4, cell: [2.4, 2.4, 3] });
  }
  function opartRib(t) { opart(t); const T = ta(t); saxRibbon(T, { y: 900 }); pianoPops(T, 4); }
  const tunnelP = (t) => punch(t, barT(13), () => tunnel(t));
  const vortexP = (t) => punch(t, barT(14), () => vortex(t));
  function peak3(t) { peak(t); const T = ta(t); rainfall(T, .25 * inv(HIT, 167.5, T), 7); }

  // ---- 167.50 LICK: quick cuts on the piano scale runs, rain begins, the inks start to run; ends rain-soaked in seam framing ----
  const LK = [167.5, 167.63, 168.08, 168.46, 168.88, 169.17];
  function lick(t) {
    const T = ta(t); FRI = Math.floor(t * 12);
    const j = LK.filter((x) => t >= x).length - 1, c0 = LK[j];
    const R = lerp(.25, 1, inv(167.5, 169.4, t)), run = lerp(.03, .2, inv(167.6, F1, t)), st = baseF(t);
    if (j === 0 || j === 5) {                                      // seam framing, rain
      seamWorld(T, 1100, { rain: j === 0 ? .4 : .85 });
      sidePlane(SEAM.x, SEAM.y, SEAM.k, { ...st, open: 0, look: j === 0 ? [.3, -.9] : [.6, -.4], brow: [j === 0 ? .9 : .4, j === 0 ? 0 : -.4] });
      if (j === 5) for (let i = 0; i < 6; i++) { const r = rng(i * 19 + 3); ell(140 + r() * 1640, 990 + r() * 70, 120 + r() * 80, 12, C(0, .4, 0), { op: 1 }); }   // puddles on the verge
    } else if (j === 1 || j === 3) {                               // the keyboard: a run up, then a run down
      sheet(j === 1 ? C(0, .35, 0) : C(.35, 0, 0));
      piano(960, 560, 1.9, T, { rot: j === 1 ? .04 : -.06, run: { t0: c0, dir: j === 1 ? 1 : -1 }, case: j === 1 ? RED : TEAL });
    } else if (j === 2) {                                          // close on his windscreen, a drop lands
      seamWorld(T, 1100, { rain: .6, noSun: true });
      const k = 3.2, px = 960 - 200 * k, py = 540 + 230 * k;
      sidePlane(px, py, k, { ...st, open: 0, look: [.1, -1], brow: [1, 0] });
      withT(() => { s.translate(px, py); s.scale(k, k); for (let i = 0; i < 7; i++) { const r = rng(i * 23 + 1), a = t - (c0 + i * .05); if (a < 0) continue;
        const dx = 140 + r() * 120, dy = -262 + r() * 70 + a * 30; ell(dx, dy, 5 + r() * 4, 6 + r() * 5, PAPER, { lw: 1.6, line: C(0, .6, 0) }); } });
    } else {                                                       // the centre line close up, rain bouncing off it
      withT(() => { s.translate(960, 540); s.scale(2.4, 2.4); s.translate(-960, -SEAM.line); seamWorld(T, 500, { rain: .7 }); });
      for (let i = 0; i < 9; i++) { const r = rng(i * 41 + 7), a = wrap(t * 1.7 + r(), 1); ell(r() * 1920, 700 + r() * 380, 20 + a * 140, 6 + a * 36, null, { lw: 5 * (1 - a), line: PAPER }); }
    }
    rainfall(T, R, 3 + j);
    const kick = hit(t, c0, 10), h = (m) => (hash((j * 31 + m) >>> 0) - .5) * 2 * kick;
    fx({ off: [h(1) * 60, h(2) * 30, h(3) * 60, h(4) * 30, h(5) * 50, h(6) * 40], inks: ISET[0], jit: 2.4 + 2 * kick, run, starve: 1 + .3 * run });
  }

  chapter('F', F0, F1, [[F0, press], [PRESS_END, party], [barT(1), warhol], [barT(4), cameo], [SAX_WIN0 - 1e-4, explode3], [SAX_ON - 1e-4, saxReveal], [barT(8), breath],
    [barT(9), pianoShot], [barT(10), opartRib], [barT(11), geom], [barT(12), drumShot], [barT(13), tunnelP], [barT(14), vortexP], [barT(15), strobe], [barT(16), peak3], [167.5, lick]]);
  window.__F = { bars: [...Array(18)].map((_, k) => +barT(k).toFixed(3)), snap: beatT(70), hit: HIT };
})();
