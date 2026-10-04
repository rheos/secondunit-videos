// 58.0 - 110.0  her. The daydream is stamped shut, his paper plane lands on the typist's desk across
// the hall, he answers with a paper flower down the pneumatic tube, and she types him a reply.
(() => {
  const WALL = '#8f9886', GLOVE = '#3a382f', SLEEVE = '#77756a', CASE = '#2b2924';
  // characters typed so far for a line sung word by word: words = [[t, 'TEXT'], ...]
  function typed(t, words, cps = 16) {
    let n = 0;
    for (const [ws, w] of words) { if (t < ws) break; n += Math.min(w.length, Math.floor((t - ws) * cps) + 1); if ((t - ws) * cps < w.length) break; }
    return n;
  }
  // the moment a character landed (for type-bar strikes)
  function strikeK(t, words, cps = 16) {
    for (let i = words.length - 1; i >= 0; i--) { const [ws, w] = words[i]; if (t >= ws) { const d = t - ws; if (d * cps > w.length + .5) return 0; return 1 - ((d * cps) % 1); } }
    return 0;
  }
  // ---- the pinball-cel drawing style (pnc.html): soft volumes, fine lines. Off: the original flat ink. ----
  const PN = () => !!window.PNC_ON, KK = () => window.PNCK;
  function oval(x, y, rx, ry, rot, c, w = 3) {   // a filled ellipse with an outline
    s.beginPath(); s.ellipse(x, y, rx, ry, rot, 0, TAU);
    if (PN()) { const K = KK(); K.soft(c, x - rx, y - ry, x + rx, y + ry); s.lineWidth = Math.max(.8, w * .4); s.strokeStyle = K.dark(c, .55); s.stroke(); }
    else { s.fillStyle = c; s.fill(); s.lineWidth = w; s.strokeStyle = INK; s.stroke(); }
  }
  const knob = (x, y, r, c = INK) => PN() ? KK().ball(x, y, r, c === INK ? '#3a3631' : c, 1) : dot(x, y, r, c);
  const ringLine = (w) => { s.lineWidth = PN() ? Math.max(.8, w * .4) : w; s.strokeStyle = PN() ? KK().LINE : INK; };
  // deco corner ornament for frames and plates (only in the pinball style)
  function decoCorners(x0, y0, x1, y1, r, c = BRASS) {
    if (!PN()) return; const K = KK();
    K.fan(x0, y0, r, 4, 0, Math.PI / 2, [c, CREAM], 1); K.fan(x1, y0, r, 4, Math.PI / 2, Math.PI, [c, CREAM], 1);
    K.fan(x1, y1, r, 4, Math.PI, Math.PI * 1.5, [c, CREAM], 1); K.fan(x0, y1, r, 4, Math.PI * 1.5, TAU, [c, CREAM], 1);
  }
  const tiled = (c = WALL) => { fill(c); s.globalAlpha = .45; for (let y = 0; y < H + 120; y += 120) for (let x = -240; x < W + 240; x += 240) { ink([[x, y], [x + 240, y]], 1.2); const o = (y / 120) % 2 ? 120 : 0; ink([[x + o, y], [x + o, y + 120]], 1.2); } s.globalAlpha = 1; };
  // a paper plane at screen (x, y), heading angle a, size sc
  function plane(x, y, a, sc) { withT(() => { s.translate(x, y); s.rotate(a); s.scale(sc, sc); shape([[0, 0], [-120, -22], [-90, 0], [-120, 26]], CREAM, 2.5 / Math.max(.3, sc)); ink([[0, 0], [-90, 0]], 1.5 / Math.max(.3, sc)); }); }
  // the paper patches pasted over the hole in the ceiling (world space, y = CE)
  function patches(alpha = 1) {
    const sheets = [[-3, 16, 4, 6, .1], [1.8, 15.5, 4.4, 5.6, -.08], [-.2, 22, 5.2, 7, .05], [3.4, 24, 3.6, 5, .14], [-3.6, 25, 3.6, 5, -.12], [.6, 29, 4, 5, -.05]];
    s.globalAlpha = alpha;
    sheets.forEach(([cx, cz, w, d, r], i) => {
      const c = Math.cos(r), sn = Math.sin(r), pts = [[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]].map(([u, v]) => { const p = P(cx + u * c - v * sn, CE, cz + u * sn + v * c); return [p[0], p[1]]; });
      shape(pts, i % 2 ? '#ddd5bb' : CREAM, 1.6);
      s.globalAlpha = .3 * alpha; for (let l = 1; l < 5; l++) { const a = P(cx - w * .35, CE, cz - d / 2 + l * d / 5), b = P(cx + w * .35, CE, cz - d / 2 + l * d / 5); ink([[a[0], a[1]], [b[0], b[1]]], 1); } s.globalAlpha = alpha;
    });
    const m = P(0, CE, 22); withT(() => { s.translate(m[0], m[1] + m[2] * .2); s.scale(1, .32); text('ON HOLD', 0, 0, m[2] * 1.6, { font: 'stamp', color: INK, alpha: .8 * alpha, max: m[2] * 4.2 }); });
    s.globalAlpha = 1;
  }
  // a seated man with a hat that can lift (kit seat() can't); drawn like the kit's
  function hallBase(t, num = '0003') {
    room(t); duct(-3.6, -2.1, .5, 0, FAR); duct(2.8, -2.25, .32, 0, FAR, STEEL_D); tube(t); board(t, num); patches();
  }
  // her hand from the right with the rose cuff (local coords: the hand's grip point at 0,0)
  function herHand(sc = 1) { gripHand(0, 0, Math.PI, sc * 1.05, { sleeve: SLEEVE, cuff: ROSE }); }   // from the right, rose cuff
  function hisGlove(sc = 1) { gripHand(0, 0, 0, sc * 1.1, { glove: true, sleeve: COAT }); }              // from the left, leather glove
  // her desk sits across the hall, front left, under its own branch of duct
  const HX = -5.55, HZ = 5.6, DX = -4.85;
  function herCorner(t, o = {}) {
    // a drop duct from the main run down over her desk
    const top = P(DX - .2, CE, HZ), bot = P(DX - .2, -.9, HZ), r = .22 * top[2];
    shape([[top[0] - r, top[1]], [top[0] + r, top[1]], [bot[0] + r, bot[1]], [bot[0] - r, bot[1]]], STEEL, 2);
    hatch([[top[0] + r * .2, top[1]], [top[0] + r, top[1]], [bot[0] + r, bot[1]], [bot[0] + r * .2, bot[1]]], .9, 7, 1, .4);
    for (let y = CE + .4; y < -.9; y += .45) { const p = P(DX - .2, y, HZ); ringLine(1.6); s.beginPath(); s.ellipse(p[0], p[1], r, r * .3, 0, 0, TAU); s.stroke(); }
    const m = P(DX - .2, -.9, HZ); shape([[m[0] - r, m[1]], [m[0] + r, m[1]], [m[0] + r * 1.8, m[1] + r * 1.1], [m[0] - r * 1.8, m[1] + r * 1.1]], BRASS, 2);   // bell mouth
    desk(DX, HZ, 1);
    return woman(HX, HZ, { seated: true, face: 1, rose: 1, arm: o.arm || 0, look: o.look || 0 });
  }

  // ---- shots ----
  // 58.0 the plane in the sky, seen up through the torn roof; on the beat a paper patch slaps over the
  // hole and ON HOLD is stamped on it. The plane slips in under the patch and falls back into the hall.
  function snap(t, lt) {
    fill(SKY_T);
    s.fillStyle = vgrad(0, H, [[0, SKY_T], [1, SKY_B]]); s.fillRect(0, 0, W, H);
    for (let i = 0; i < 4; i++) cloud(((i * 610 + t * 40) % (W + 700)) - 350, 300 + hash(i + 4) * 500, 110 + 40 * hash(i), 80 + i);
    // the torn ceiling all round the frame
    withT(() => { s.beginPath(); s.rect(-50, -50, W + 100, H + 100);
      for (let i = 0; i <= 44; i++) { const a = i / 44 * TAU, j = 1 + (hash(i * 23 + 5) - .5) * .35, x = W / 2 + Math.cos(a) * 820 * j, y = H / 2 + Math.sin(a) * 470 * j; i ? s.lineTo(x, y) : s.moveTo(x, y); }
      s.fillStyle = '#3d4140'; s.fill('evenodd'); ringLine(4); s.stroke(); });
    // the patch: comes in huge and slaps down on 58.2
    const k = ease.in(inv(58.12, 58.2, t)), sc = lerp(1.35, 1, k);
    if (t > 58.12) withT(() => {
      s.translate(W / 2, H / 2); s.rotate(-.04 + (1 - k) * .1); s.scale(sc, sc);
      shape([[-900, -520], [900, -500], [880, 520], [-890, 505]], CREAM, 3);
      s.globalAlpha = .3; for (let l = 0; l < 9; l++) ink([[-760, -330 + l * 85], [760, -330 + l * 85]], 1.4); s.globalAlpha = 1;
      text('MINISTRY OF WAITING', 740, -410, 40, { font: 'sign', align: 'right', max: 640 });
      text('ROOF REPAIR, FORM 27B/6', -740, -410, 34, { align: 'left', max: 640 });
      // tape strips at the corners
      for (const [x, y, r] of [[-880, -500, .7], [870, -490, -.7], [-870, 490, -.7], [860, 500, .7]]) withT(() => { s.translate(x, y); s.rotate(r); s.globalAlpha = .75; shape([[-90, -24], [90, -24], [90, 24], [-90, 24]], '#d8cfa8', 1.5); });
    });
    stamp(t, 58.93, W / 2, H / 2 + 120, 'ON HOLD', { size: 230, color: INK, rot: -.1 });
    // the plane: in the sky before the slap, then inside the room falling past the patch
    if (t < 58.2) { const u = inv(58, 58.2, t); plane(lerp(1100, 980, u), lerp(420, 520, u), 2.6, lerp(.5, .7, u)); }
    else { const u = t - 58.2; plane(1150 - u * 260, 640 + u * u * 160 + u * 120, 2.75 + Math.sin(u * 3) * .2, .8 + u * .5); }
    fx({ flash: hit(t, 58.2, 7) * .85 + hit(t, 58.93, 9) * .3 });
  }
  // 59.67 the hall, roof patched. The plane glides down the length of the hall onto her desk, front left.
  function patched(t, lt) {
    cam({ x: -1.6, z: kf(t, [[59.67, -1.6], [62.67, -.9]], ease.sine), y: -.35, f: 900, vy: 470 });
    hallBase(t); rows(t, 2.2, 8, 0); seat(2.2, 8, 'me', true); clock(t, -6.95, -1.0, 16);
    herCorner(t, { arm: -smooth(inv(62.0, 62.6, t)) * .6 });
    // the plane: from under the patch, a long glide down to the desk
    const u = ease.sine(inv(59.67, 62.3, t));
    const pt = (v) => P(lerp(.4, DX + .15, Math.sqrt(v)), lerp(CE + .5, .78, v * v), lerp(22, HZ, Math.pow(v, .6)));
    const p = pt(u), q = pt(Math.min(1, u + .02));
    const a = Math.atan2(q[1] - p[1], q[0] - p[0]);
    plane(p[0], p[1], t < 62.3 ? a + Math.sin(t * 3) * .15 : Math.PI - .05, Math.max(.25, p[2] / 170));
  }
  // 62.67 she unfolds it: his ticket. The mirror of his close-up in the hall, her hand from the right.
  function unfold(t, lt) {
    tiled();
    // the board, soft, upper left (his was upper right)
    withT(() => { s.globalAlpha = .55; shape([[140, 120], [940, 120], [940, 470], [140, 470]], BRASS, 4); shape([[170, 150], [910, 150], [910, 440], [170, 440]], '#1f201c', 2);
      text('0003', 540, 410, 210, { font: 'sign', color: AMBER, max: 660 });
      if (PN()) { KK().fan(540, 120, 230, 9, Math.PI, TAU, [BRASS, AMBER, CREAM], 1); for (const [x, y] of [[140, 120], [940, 120], [140, 470], [940, 470]]) knob(x, y, 14, BRASS); } });
    const k = ease.out(inv(62.85, 63.7, t));
    withT(() => {
      s.translate(1180 + Math.sin(t * 1.2) * 5, 700 + Math.sin(t * 1.9) * 4); s.rotate(.12); s.scale(1.35, 1.35);
      withT(() => {
        s.translate(-170, 0); s.scale(lerp(.12, 1, k), lerp(.55, 1, k));
        shape([[-200, -160], [190, -140], [175, 150], [-215, 130]], CREAM, 3 / lerp(.12, 1, k));
        if (k > .5) withT(() => { s.globalAlpha = smooth(inv(.5, 1, k));
          s.globalAlpha *= .35; ink([[-200, -160], [175, 150]], 1.5); ink([[190, -140], [-215, 130]], 1.5); ink([[-5, -150], [-20, 140]], 1.5); s.globalAlpha /= .35;
          text('MINISTRY OF WAITING', -10, -95, 32, { max: 300 });
          text('7 436 912', -10, 20, 88, { font: 'type', max: 310 });
          text('PLEASE REMAIN SEATED', -10, 85, 25, { max: 290 });
          for (let i = 0; i < 9; i++) dot(165, -120 + i * 30, 6, WALL); });
      });
      withT(() => { s.translate(20, 90); herHand(.8); });
    });
  }
  // 64.90 he has no flowers, so he folds one out of a form on the lid of his guitar case. Top-down.
  // A fold on each beat; on the last it blooms rose.
  function fold(t, lt) {
    tiled('#a7a48f');
    withT(() => { s.translate(W / 2, H / 2 + 20); s.rotate(-.03);
      guitarCase(0, 0, 1700, { col: CASE });   // the lid of the same case, from above, filling the frame
      for (const x of [-560, 260]) shape([[x - 40, 300], [x + 40, 300], [x + 40, 332], [x - 40, 332]], BRASS, 2);
    });
    const beats = [65.67, 66.40, 67.07], st = beats.filter(b => t >= b).length;
    const last = st ? beats[st - 1] : 64.9, fk = inv(last, last + .22, t), flip = st ? Math.abs(1 - 2 * fk) : 1;
    const shown = fk < .5 && st ? st - 1 : st;
    const nudge = st ? hit(t, last, 10) : 0;
    withT(() => {
      s.translate(W / 2, H / 2); s.rotate(.06 * shown);
      if (shown < 3) s.scale(flip, 1);
      if (shown === 0) {
        shape([[-260, -260], [260, -260], [260, 260], [-260, 260]], CREAM, 3);
        text('FORM WGT-89', 240, -220, 22, { font: 'sign', align: 'right', max: 200 });
        s.globalAlpha = .4; for (let l = 0; l < 7; l++) ink([[-210, -150 + l * 55], [210, -150 + l * 55]], 1.2); s.globalAlpha = 1;
        text('APPLICATION TO WAIT', -210, -165, 26, { align: 'left', max: 420 });
      } else if (shown === 1) {
        shape([[-260, 160], [260, 160], [0, -240]], CREAM, 3); ink([[0, -240], [0, 160]], 1.2);
        s.globalAlpha = .35; for (let l = 0; l < 4; l++) ink([[-150 + l * 30, 100 - l * 70], [150 - l * 30, 100 - l * 70]], 1.2); s.globalAlpha = 1;
      } else if (shown === 2) {
        shape([[0, -230], [150, 0], [0, 230], [-150, 0]], CREAM, 3); ink([[0, -230], [0, 230]], 1.2); ink([[-150, 0], [150, 0]], 1.2);
      } else {
        const b = ease.back(inv(67.07, 67.6, t));
        for (let i = 0; i < 6; i++) withT(() => { s.rotate(i / 6 * TAU + b * .3); s.scale(b, b);
          shape([[0, 0], [70, -90], [0, -240], [-70, -90]], i % 2 ? ROSE : '#d65a6c', 3); ink([[0, -20], [0, -200]], 1.4); });
        for (let i = 0; i < 5; i++) withT(() => { s.rotate(i / 5 * TAU + .6); s.scale(b, b); shape([[0, 0], [45, -55], [0, -130], [-45, -55]], ROSE_L, 2.5); });
        knob(0, 0, 26 * b + .1, '#a83246');
      }
    });
    // his gloved hands come in from both sides on each fold
    const g = 1 - nudge * .6;
    withT(() => { s.translate(W / 2 - 330 - 120 * g - (st >= 3 ? 200 : 0), H / 2 + 120); s.rotate(.25); hisGlove(.9); });
    withT(() => { s.translate(W / 2 + 330 + 120 * g + (st >= 3 ? 200 : 0), H / 2 + 120); s.scale(-1, 1); s.rotate(.25); hisGlove(.9); });
  }
  // 67.90 a cross-section of the hall: two vast ducts, the glass tube under them, and the two of them tiny
  // at either end. The flower goes up the intake and shoots across on the beat.
  function tubeShot(t, lt) {
    cam({ x: 0, y: 0, z: 0, f: 820, vy: 724 });
    const Z = 7.45;
    fill('#9a9c8c');
    s.globalAlpha = .35; for (let x = -60; x < W; x += 210) ink([[x, 420], [x, 900]], 1.2); s.globalAlpha = 1;
    // two vast ducts across the top
    const bigDuct = (y0, h, c) => { shape([[-40, y0], [W + 40, y0], [W + 40, y0 + h], [-40, y0 + h]], c, 3);
      hatch([[-40, y0 + h * .65], [W + 40, y0 + h * .65], [W + 40, y0 + h], [-40, y0 + h]], .9, 8, 1.2, .45);
      const off = (t * 18) % 140; for (let x = -off; x < W + 140; x += 140) { ringLine(3); s.beginPath(); s.ellipse(x, y0 + h / 2, 16, h / 2, 0, 0, TAU); s.stroke(); } };
    bigDuct(-20, 230, STEEL); bigDuct(225, 150, STEEL_D);
    for (let x = 200; x < W; x += 480) { ink([[x, 210], [x, 225]], 6); ink([[x + 30, 375], [x + 30, 440]], 4); }
    // the glass tube
    const ty = 470, tr = 26;
    s.globalAlpha = .55; s.fillStyle = '#c7d0cf'; s.fillRect(-20, ty - tr, W + 40, tr * 2); s.globalAlpha = 1;
    ink([[-20, ty - tr], [W + 20, ty - tr]], 2.5); ink([[-20, ty + tr], [W + 20, ty + tr]], 2.5);
    // intake (left, down to him) and outlet (right, down to her)
    const ix = 360, ox = 1560;
    for (const x of [ix, ox]) { s.globalAlpha = .55; s.fillStyle = '#c7d0cf'; s.fillRect(x - tr, ty, tr * 2, 210); s.globalAlpha = 1; ink([[x - tr, ty + tr], [x - tr, ty + 210]], 2.5); ink([[x + tr, ty + tr], [x + tr, ty + 210]], 2.5);
      shape([[x - tr, ty + 210], [x + tr, ty + 210], [x + tr * 2, ty + 250], [x - tr * 2, ty + 250]], BRASS, 2.5); }
    // the row of seated hats along the floor
    for (let i = 0; i < 26; i++) { const x = 470 + i * 38; if (x > 1420) break; const b = 900;
      shape([[x - 13, b - 6], [x + 13, b - 6], [x + 11, b - 48], [x - 11, b - 48]], COAT, 1.2);
      if (PN()) { knob(x, b - 56, 8, SKIN); oval(x, b - 62, 15, 3.5, 0, HAT, 1.2); oval(x, b - 69, 8, 7, 0, HAT, 1.2); }
      else { dot(x, b - 56, 8, SKIN); s.beginPath(); s.ellipse(x, b - 62, 15, 3.5, 0, 0, TAU); s.fillStyle = HAT; s.fill(); s.lineWidth = 1.2; s.strokeStyle = INK; s.stroke(); s.fillRect(x - 8, b - 74, 16, 12); } }
    s.fillStyle = '#a7a48f'; s.fillRect(-20, 900, W + 40, 200); ink([[-20, 900], [W + 20, 900]], 3);
    // him, reaching up; her at her desk
    man(-5.2, Z, { face: 1, arm: smooth(inv(68.0, 68.5, t)) * (1 - smooth(inv(69.3, 69.8, t))) });
    desk(4.75, Z, -1); woman(5.45, Z, { seated: true, face: -1, rose: 1, look: smooth(inv(70.0, 70.5, t)) });
    // the canister: up the intake, then across on the beat
    const up = ease.inOut(inv(68.67, 69.37, t)), across = ease.in(inv(69.37, 70.1, t)), down = ease.out(inv(70.1, 70.6, t));
    let cx, cy, vert = true;
    if (t < 69.37) { cx = ix; cy = lerp(ty + 230, ty, up); }
    else if (t < 70.1) { cx = lerp(ix, ox, across); cy = ty; vert = false; }
    else { cx = ox; cy = lerp(ty, ty + 200, down); }
    if (t > 68.4) withT(() => { s.translate(cx, cy); if (!vert) s.rotate(Math.PI / 2);
      shape([[-20, -38], [20, -38], [20, 38], [-20, 38]], BRASS, 2.5); knob(0, 0, 11, ROSE);
      if (PN()) { knob(0, -38, 8, BRASS); knob(0, 38, 8, BRASS); }
      if (!vert && across > .05 && across < .99) { s.globalAlpha = .6; for (let i = 0; i < 4; i++) ink([[-14 + i * 9, 50], [-14 + i * 9, 50 + 90 * across]], 2); } });
  }
  // 70.83 at her desk: the canister drops out of the bell, pops, the rose flower is hers, and the
  // ticker tape runs out under it: BUT I AIN'T CARRYING FLOWERS.
  function pop(t, lt) {
    cam({ x: -4.5, z: 3.46, y: -.25, f: 900, vy: 250 });
    fill('#4d5250');
    // the filing wall behind her, flat
    s.fillStyle = WALL; s.fillRect(-20, -20, W + 40, H + 40);
    for (let y = -40; y < H; y += 150) for (let x = -60; x < W; x += 230) { shape([[x + 8, y + 8], [x + 222, y + 8], [x + 222, y + 142], [x + 8, y + 142]], (hash(x * 3 + y) > .85) ? '#7a8274' : '#8f9886', 1.4); knob(x + 115, y + 75, 6, PN() ? BRASS : INK); }
    const fl = P(0, FL, HZ)[1]; s.fillStyle = '#a7a48f'; s.fillRect(-20, fl, W + 40, H); ink([[-20, fl], [W + 20, fl]], 3);
    const flowerUp = ease.out(inv(72.4, 72.9, t)), reach = smooth(inv(72.6, 73.1, t));
    const me = herCorner(t, { arm: -reach * .55, look: reach });
    // canister falls from the bell onto the desk, then pops its lid
    const bell = P(DX - .2, -.6, HZ), deskTop = P(DX - .2, .85, HZ)[1], k = bell[2];
    const fall = ease.in(inv(71.63, 71.95, t));
    if (t > 71.5) withT(() => { const y = lerp(bell[1], deskTop - .19 * k, fall), x = bell[0] + .28 * k * fall;
      shape([[x - .07 * k, y - .19 * k], [x + .07 * k, y - .19 * k], [x + .07 * k, y + .19 * k], [x - .07 * k, y + .19 * k]], BRASS, 2.5);
      const lid = ease.out(inv(72.4, 72.8, t)); withT(() => { s.translate(x + lid * .3 * k, y - .19 * k - lid * .5 * k + lid * lid * .3 * k); s.rotate(lid * 2.2);
        shape([[-.08 * k, -.03 * k], [.08 * k, -.03 * k], [.08 * k, .03 * k], [-.08 * k, .03 * k]], BRASS, 2); }); });
    // the flower rises into her hand
    if (t > 72.4) { const fx0 = bell[0] + .28 * k, fy0 = deskTop - .4 * k, hx = me.hand[0], hy = me.hand[1] - .05 * k;
      const x = lerp(fx0, hx, reach), y = lerp(fy0 + .2 * k * (1 - flowerUp), hy, reach);
      ink([[x, y], [x + .02 * k, y + .3 * k]], 3);
      for (let i = 0; i < 6; i++) withT(() => { s.translate(x, y); s.rotate(i / 6 * TAU); s.scale(flowerUp * .22, flowerUp * .22); shape([[0, 0], [70, -90], [0, -240], [-70, -90]], i % 2 ? ROSE : '#d65a6c', 10); });
      knob(x, y, .025 * k * flowerUp + .1, '#a83246'); }
    // ticker tape streams out of the open canister, to the right: BUT I AIN'T CARRYING FLOWERS
    const cx0 = bell[0] + .28 * k, cy0 = deskTop - .3 * k;
    const L = clamp((t - 72.45) * 1300, 0, W - cx0 + 40);
    if (L > 0) withT(() => {
      const y = (x) => cy0 - 40 + (x - cx0) * .03 + Math.sin((x - cx0) / 260 + t * 2) * 10;
      const xs = []; for (let x = cx0; x <= cx0 + L; x += 20) xs.push(x);
      const top = xs.map(x => [x, y(x) - 34]), bot = xs.map(x => [x, y(x) + 34]).reverse();
      shape([[cx0, cy0 + .12 * k], ...top, ...bot], '#ece5cc', 2);
      s.beginPath(); s.rect(cx0, 0, L, H); s.clip();
      const MSG = "BUT I AIN'T CARRYING FLOWERS", sz = fitSize(MSG, 46, W - cx0 - 140 - MSG.length * 4);
      let x = cx0 + 50;
      for (const ch of MSG) { text(ch, x, y(x) + sz * .35, sz, { align: 'left' }); x += textWidth(ch, sz) + 4; }
    });
  }
  // 74.32 a tailor's plate from the regulations: him and her, full length, both in grey.
  // "YOU AIN'T EXACTLY DRESSED UP" types along the foot of the plate; REGULATION GREY is stamped on "dressed".
  const DRESSED = [[74.32, 'YOU'], [75.67, " AIN'T"], [76.03, ' EXACTLY'], [77.32, ' DRESSED'], [79.03, ' UP']];
  function plate(t, lt) {
    fill('#d9d1b6');
    const z = kf(t, [[74.32, 1], [79.9, 1.04]], ease.sine);
    withT(() => { s.translate(W / 2, H / 2); s.scale(z, z); s.translate(-W / 2, -H / 2);
      shape([[60, 40], [W - 60, 40], [W - 60, H - 40], [60, H - 40]], CREAM, 3); ink([[80, 60], [W - 80, 60], [W - 80, H - 60], [80, H - 60], [80, 60]], 1.5);
      decoCorners(80, 60, W - 80, H - 60, 90);
      if (PN()) { KK().star(520, 128, 18, BRASS, 1); KK().star(W - 520, 128, 18, BRASS, 1); }
      text('REGULATION DRESS, PLATE 4', W / 2, 130, 44, { font: 'sign', spacing: 6, max: 680 });
      ink([[560, 150], [W - 560, 150]], 1.5);
      cam({ x: 0, y: 0, z: 0, f: 820, vy: 300 });
      const Z = 2.75, fl = P(0, FL, Z)[1];
      s.globalAlpha = .5; ink([[300, fl], [W - 300, fl]], 2); s.globalAlpha = 1;
      // measuring lines down each side
      for (const [x, lab, h] of [[430, 'COAT, GREY, 1 EA.', 1.78], [W - 430, 'UNIFORM, GREY, 1 EA.', 1.62]]) {
        const top = P(0, FL - h, Z)[1]; ink([[x, top], [x, fl]], 1.6); ink([[x - 18, top], [x + 18, top]], 1.6); ink([[x - 18, fl], [x + 18, fl]], 1.6);
        for (let i = 1; i < 10; i++) { const y = lerp(top, fl, i / 10); ink([[x - 8, y], [x + 8, y]], 1); }
        text(lab, x, top - 30, 24, { max: 300 });
      }
      // they each look down at themselves on "dressed"
      const lk = smooth(inv(77.1, 77.6, t));
      man(-1.05, Z, { face: 1, arm: lk * .25 });
      woman(1.05, Z, { face: -1, rose: 1, arm: lk * .25 });
      text('FIG. 1', P(-1.05, 0, Z)[0], fl + 50, 26, { font: 'sign', max: 200 }); text('FIG. 2', P(1.05, 0, Z)[0], fl + 50, 26, { font: 'sign', max: 200 });
      // the typed line
      const n = typed(t, DRESSED), str = DRESSED.map(w => w[1]).join('');
      text(str.slice(0, n), 210, 980, 58, { align: 'left', spacing: 2, max: 1070, fitTo: str });
      stamp(t, 77.32, 1540, 985, 'REGULATION GREY', { size: 44, color: INK, rot: -.07 });
    });
  }
  // 79.90 straight down from the ceiling: the grid of hats, her desk at the edge, the rose flower the
  // only colour. On his line's "I" his hat lifts: the one hat in the room that moves.
  // a hat seen from straight above: brim and crown (glossy crown in the pinball style)
  function hatTop() { oval(0, 0, 36, 36, 0, HAT, 1.6); if (PN()) { KK().ball(0, 0, 21, '#3a3731', .8); } else oval(0, 0, 21, 21, 0, '#2f2d28', 1.6); }
  function overhead(t, lt) {
    const zm = kf(t, [[79.9, 1], [87.5, 1.22]], ease.sine);
    fill('#a7a48f');
    withT(() => {
      s.translate(W / 2, H / 2); s.scale(zm, zm); s.translate(-W / 2 + 60 * (zm - 1) * 3, -H / 2 + 40 * (zm - 1) * 3);
      s.globalAlpha = .4; for (let x = 0; x <= W; x += 96) ink([[x, -100], [x, H + 100]], 1.2); for (let y = -96; y <= H + 96; y += 96) ink([[0, y], [W, y]], 1.2); s.globalAlpha = 1;
      // the walls as thick ink bands top and bottom, the tube along the bottom wall
      shape([[-200, -200], [W + 200, -200], [W + 200, 60], [-200, 60]], GREEN, 3);
      for (let x = 20; x < W; x += 110) shape([[x, 0], [x + 100, 0], [x + 100, 52], [x, 52]], '#8f9886', 1.2);
      shape([[-200, H - 60], [W + 200, H - 60], [W + 200, H + 200], [-200, H + 200]], GREEN_D, 3);
      s.globalAlpha = .5; s.fillStyle = '#c7d0cf'; s.fillRect(-200, H - 108, W + 400, 36); s.globalAlpha = 1; ink([[-200, H - 108], [W + 200, H - 108]], 2); ink([[-200, H - 72], [W + 200, H - 72]], 2);
      const i = lastBeat(t); for (let b = Math.max(0, i - 2); b <= i; b++) { const x = (t - FEAT.beats[b]) * 1600 - 60; if (x < W + 60) shape([[x - 40, H - 104], [x + 40, H - 104], [x + 40, H - 76], [x - 40, H - 76]], BRASS, 1.5); }
      // the hats: seen from above, a brim and a crown each, rows across the hall
      const cols = [380, 480, 580, 680, 780, 1140, 1240, 1340, 1440, 1540];
      for (let r = 0; r < 8; r++) for (let c = 0; c < cols.length; c++) {
        const x = cols[c], y = 150 + r * 105; const mine = r === 6 && c === 6;
        shape([[x - 40, y + 4], [x + 40, y + 4], [x + 36, y + 40], [x - 36, y + 40]], '#6e6a5a', 1.4);   // chair back
        oval(x, y - 2, 46, 30, 0, mine ? '#4f4c40' : COAT, 1.6);  // shoulders
        if (mine) { const lift = ease.out(inv(81.95, 82.4, t)) * (1 - ease.inOut(inv(84.5, 85.2, t)));
          oval(x, y - 4, 22, 22, 0, SKIN, 1.6);
          withT(() => { s.translate(x + lift * 60, y - 4 - lift * 70); s.scale(1 + lift * .35, 1 + lift * .35); s.rotate(-lift * .3); hatTop(); });
          guitarCase(x + 66, y + 2, 90, { rot: Math.PI / 2 });   // the case, from above
        } else withT(() => { s.translate(x, y - 4); hatTop(); });
      }
      // her desk, at the left, side on to the rows; the flower on it
      shape([[110, 470], [250, 470], [250, 690], [110, 690]], '#5d5a4c', 2.5);
      shape([[140, 540], [220, 540], [220, 620], [140, 620]], '#2e2d28', 2);
      shape([[150, 525], [210, 525], [210, 545], [150, 545]], CREAM, 1.4);
      oval(60, 580, 40, 30, 0, '#77756a', 1.6);
      knob(66, 580, 20, '#2d2a24'); knob(44, 580, 11, '#2d2a24');
      knob(80, 566, 6, ROSE);
      for (let p = 0; p < 6; p++) { const a = p / 6 * TAU + t * .2; dot(190 + Math.cos(a) * 14, 650 + Math.sin(a) * 14, 10, p % 2 ? ROSE : '#d65a6c'); } dot(190, 650, 7, '#a83246');
      // the board along the top wall
      shape([[760, 70], [1160, 70], [1160, 108], [760, 108]], BRASS, 2); s.fillStyle = '#1f201c'; s.fillRect(770, 76, 380, 26);
    });
  }
  // 87.53 [the line in our power, shown as an image]: a wall of numbered levers, and one small lever
  // with no number. His glove and her hand both take it; on "power" they pull it, and the clock stops.
  function levers(t, lt) {
    fill(STEEL_D);
    const pull = ease.back(inv(92.43, 92.85, t));
    shape([[90, 220], [W - 90, 220], [W - 90, H + 20], [90, H + 20]], STEEL, 3);
    if (PN()) { for (const x of [110, W - 110]) for (let y = 250; y < H; y += 180) knob(x, y, 9, BRASS); }
    s.globalAlpha = .35; for (let y = 240; y < H; y += 26) ink([[100, y], [W - 100, y]], 1); s.globalAlpha = 1;
    for (let r = 0; r < 3; r++) for (let c = 0; c < 11; c++) {
      const x = 210 + c * 150, y = 300 + r * 200; if (r === 2 && (c === 4 || c === 5 || c === 6)) continue;
      shape([[x - 14, y], [x + 14, y], [x + 14, y + 110], [x - 14, y + 110]], '#2a2a24', 1.6);
      const down = hash(r * 31 + c * 7) > .7; const ang = down ? .5 : -.5;
      const lt = [x + Math.sin(ang) * 80, y + 55 - Math.cos(ang) * 80 * (down ? -1 : 1)];
      if (PN()) { line([[x, y + 55], lt], KK().LINE, 9); line([[x, y + 55], lt], '#b9b3a0', 6); knob(lt[0], lt[1], 14, '#3a3631'); knob(x, y + 55, 6, BRASS); }
      else { ink([[x, y + 55], lt], 7); dot(lt[0], lt[1], 14, INK); }
      shape([[x - 42, y + 122], [x + 42, y + 122], [x + 42, y + 156], [x - 42, y + 156]], CREAM, 1.4);
      text(String(1000 + Math.floor(hash(r * 11 + c) * 8999)), x, y + 149, 26, { max: 72 });
    }
    // the clock on top, ticking on the beat until they pull
    const cx = W / 2, cy = 150, R = 120;
    if (PN()) { KK().fan(cx, cy, R * 1.55, 12, Math.PI, TAU, [BRASS, CREAM], 1); KK().ball(cx, cy, R * 1.08, BRASS, 1); }
    oval(cx, cy, R, R, 0, CREAM, 5);
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; ink([[cx + Math.cos(a) * R * .8, cy + Math.sin(a) * R * .8], [cx + Math.cos(a) * R * .93, cy + Math.sin(a) * R * .93]], 3); }
    const stopBeat = lastBeat(92.43), b = Math.min(lastBeat(t), stopBeat);
    ink([[cx, cy], [cx + Math.cos(-1.1) * R * .5, cy + Math.sin(-1.1) * R * .5]], 8);
    ink([[cx, cy], [cx + Math.cos(.4) * R * .75, cy + Math.sin(.4) * R * .75]], 5);
    const sa = -Math.PI / 2 + b * TAU / 60 + (t < 92.43 ? 0 : Math.sin((t - 92.43) * 30) * .04 * Math.exp(-(t - 92.43) * 4));
    line([[cx, cy], [cx + Math.cos(sa) * R * .88, cy + Math.sin(sa) * R * .88]], '#8a2a1e', 2.5);
    knob(cx, cy, 9, PN() ? BRASS : INK);
    // the small lever, its own little frame, no number
    const lx = W / 2, ly = 760;
    shape([[lx - 150, ly - 90], [lx + 150, ly - 90], [lx + 150, ly + 250], [lx - 150, ly + 250]], '#6b6a5a', 3);
    shape([[lx - 12, ly + 10], [lx + 12, ly + 10], [lx + 12, ly + 110], [lx - 12, ly + 110]], '#2a2a24', 1.6);
    const ph = pull * Math.PI, tip = [lx + Math.sin(ph) * 14, ly + 60 - Math.cos(ph) * 120], kr = 16 * (1 + Math.sin(ph) * .5);
    if (PN()) { line([[lx, ly + 60], tip], KK().LINE, 11 * (1 + Math.sin(ph) * .3)); line([[lx, ly + 60], tip], '#b9b3a0', 8 * (1 + Math.sin(ph) * .3)); knob(tip[0], tip[1], kr, ROSE); }
    else { ink([[lx, ly + 60], tip], 8 * (1 + Math.sin(ph) * .3)); dot(tip[0], tip[1], kr, INK); }
    shape([[lx - 40, ly + 200], [lx + 40, ly + 200], [lx + 40, ly + 232], [lx - 40, ly + 232]], CREAM, 1.4);
    // hands: his glove from the left, hers from the right; both on the knob by 91.5
    const inL = ease.out(inv(88.3, 90.6, t)), inR = ease.out(inv(89.0, 91.4, t));
    withT(() => { s.translate(lerp(-300, tip[0] - 26, inL), lerp(1200, tip[1] + 6, inL)); s.rotate(-.6); hisGlove(.42); });
    withT(() => { s.translate(lerp(W + 300, tip[0] + 26, inR), lerp(1200, tip[1] + 14, inR)); s.rotate(.6); herHand(.42); });
    fx({ flash: hit(t, 92.43, 8) * .2 });
  }
  // 95.03 her typewriter, face on. A fresh memo rolls in; from 98.74 she types I AIN'T MAKING IT UP.
  const MAKING = [[98.74, 'I'], [99.90, " AIN'T"], [100.67, 'MAKING'], [103.07, ' IT'], [104.96, ' UP']];
  const LINES = (n) => { const a = "I AIN'T", b = 'MAKING IT UP'; return [a, b].map((l, i) => l); };
  function typer(t, lt) {
    fill('#4d5250');
    s.fillStyle = '#5d5a4c'; s.fillRect(-20, 860, W + 40, 300); ink([[-20, 860], [W + 20, 860]], 3);
    s.globalAlpha = .35; for (let x = 0; x < W; x += 160) ink([[x, 0], [x, 860]], 1.2); s.globalAlpha = 1;
    const zoom = kf(t, [[95.03, 1], [102.77, 1.12]], ease.sine);
    withT(() => { s.translate(W / 2, 980); s.scale(zoom, zoom); s.translate(-W / 2, -980);
      const n = typed(t, MAKING), feed = ease.out(inv(95.3, 96.8, t)), adv = smooth(inv(100.6, 100.75, t));
      const nl = Math.min(n, 7), n2 = Math.max(0, n - 7);
      typewriter(W / 2, 1000, 860, { strike: strikeK(t, MAKING), paper: { lines: LINES(), typed: nl + n2, scroll: lerp(-260, 0, feed) + adv * 34, title: 'MEMO' } });
      // her two hands at the keys, rose cuffs, hopping as she types
      const hop = strikeK(t, MAKING);
      for (const side of [-1, 1]) { const up = side > 0 ? hop : (1 - hop) * .4;
        typingHand(W / 2 + side * 175, 850 - up * 12, side, 1.2, { press: up, finger: Math.floor(hash(Math.floor(n) * 5 + (side > 0 ? 2 : 0)) * 4), sleeve: SLEEVE }); }
    });
  }
  // 102.77 close on the memo itself: IT UP strikes in, letter by letter.
  function memo(t, lt) {
    tiled('#5d5a4c');
    const n = typed(t, MAKING);
    withT(() => { s.translate(W / 2 + 20, H / 2 + 30); s.rotate(-.035);
      shape([[-760, -440], [760, -440], [760, 600], [-760, 600]], CREAM, 4);
      decoCorners(-760, -440, 760, 600, 55, '#c9bf9c');
      text('MEMO', 700, -370, 40, { font: 'sign', align: 'right', spacing: 6, max: 300 });
      text('TO: 7 436 912', -680, -370, 34, { align: 'left', max: 600 });
      s.globalAlpha = .35; for (let l = 0; l < 4; l++) ink([[-680, -150 + l * 240], [680, -150 + l * 240]], 1.6); s.globalAlpha = 1;
      const a = "I AIN'T", b = 'MAKING IT UP';
      const msz = fitSize(b, 150, 1340);
      text(a.slice(0, Math.min(n, 7)), -680, -180, msz, { align: 'left' });
      const s2 = b.slice(0, Math.max(0, n - 7));
      text(s2, -680, 60, msz, { align: 'left' });
      // the type bar striking at the next letter
      const k = strikeK(t, MAKING);
      if (k > 0) { const x = -680 + textWidth(s2, msz);
        withT(() => { s.globalAlpha = k; shape([[x - 18, 70 + (1 - k) * 200], [x + 70, 70 + (1 - k) * 200], [x + 80, 700], [x - 30, 700]], '#2e2d28', 3); }); }
    });
    stamp(t, 105.73, 1350, 860, 'RECEIVED', { size: 90, color: INK, rot: -.14 });
  }
  // 106.50 she folds the memo into a plane and sends it back across the hall; it lands in his hands.
  function reply(t, lt) {
    cam({ x: -1.2, z: kf(t, [[106.5, -1.0], [110, .4]], ease.sine), y: -.45, f: 900, vy: 460 });
    hallBase(t); rows(t, 2.2, 8, 0); seat(2.2, 8, 'me', true); clock(t, -6.95, -1.0, 16);
    herCorner(t, { arm: smooth(inv(106.6, 107.0, t)) * (1 - smooth(inv(107.4, 107.8, t))), look: 1 });
    const u = ease.inOut(inv(107.27, 109.53, t));
    if (t >= 107.27) {
      const pt = (v) => P(lerp(DX + .2, 2.2, v), lerp(.5, .2, v) - Math.sin(v * Math.PI) * 1.6, lerp(HZ, 7.8, v));
      const p = pt(u), q = pt(Math.min(1, u + .02)), a = Math.atan2(q[1] - p[1], q[0] - p[0]);
      plane(p[0], p[1], a, Math.max(.3, p[2] / 150));
    }
  }

  chapter('her', 58.0, 110.0, [
    [58.0, snap], [59.67, patched], [62.67, unfold], [64.90, fold], [67.90, tubeShot], [70.83, pop],
    [74.32, plate], [79.90, overhead], [87.53, levers], [95.03, typer], [102.77, memo], [106.50, reply],
  ]);
})();
