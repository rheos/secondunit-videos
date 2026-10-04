// js/ch/c2.js · MENTOR (29.4 - 51.02)
// The dream turns into an office. A ram boss glares, slams, jabs; then the night runs through
// pills, a helmeted garrison, a shearing, and four staccato images to close verse 1's first half.
// Hits sit on the beat grid (FEAT.beats) or on vocal onsets checked against F('onset').
(() => {
  const PYJ = '#3b4d8e', PYJ_DK = '#2c3a70', HORN = '#b49a6c', HORN_DK = '#6a5438';
  const SLAM = 30.91, JAB1 = 31.63, JAB2 = 33.09, TIP = 35.83, RUDE2 = 39.63, SNIP = 41.46, PULL = 41.80, TURN = 43.24;
  const BIG = (g, c) => { g.fillStyle = c; g.fillRect(-3000, -3000, 8000, 8000); };

  // ---------- private cast ----------
  function horns(g, head, sc, sil) {
    for (const d of [-1, 1]) {
      const cx = head[0] + d * .34 * sc, cy = head[1] - .2 * sc, pts = [];
      for (let i = 0; i <= 22; i++) {
        const a = i / 22, th = Math.PI * 1.15 + a * 1.4 * TAU, r = .21 * sc * (1 - .7 * a);
        pts.push([cx + d * Math.cos(th) * r, cy + Math.sin(th) * r, .1 * sc * (1 - .7 * a) + 2]);
      }
      for (let i = 0; i < pts.length - 1; i++) taper(g, pts[i], pts[i + 1], pts[i][2], pts[i + 1][2], sil ? '#07070f' : HORN_DK);
      if (!sil) for (let i = 0; i < pts.length - 1; i++) taper(g, [pts[i][0], pts[i][1] - pts[i][2] * .3], [pts[i + 1][0], pts[i + 1][1] - pts[i + 1][2] * .3], pts[i][2] * .55, pts[i + 1][2] * .55, HORN);
    }
  }
  function tie(g, head, sc, dir) {
    const x = head[0] - dir * .02 * sc, y = head[1] + .33 * sc;
    poly(g, [[x - .12 * sc, y - .02 * sc], [x, y + .08 * sc], [x + .12 * sc, y - .02 * sc], [x, y + .04 * sc]], '#e8e2d4');
    poly(g, [[x - .05 * sc, y + .03 * sc], [x + .05 * sc, y + .03 * sc], [x + .09 * sc, y + .5 * sc], [x, y + .6 * sc], [x - .09 * sc, y + .5 * sc]], '#a3261d');
  }
  function ram(t, x, y, sc, o = {}) {
    const r = sheep(t, x, y, sc, { lids: .62, seed: 77, ...o });
    horns(o.g || s, r.head, sc, o.sil);
    if (o.tie !== false && !o.sil) tie(o.g || s, r.head, sc, o.dir || 1);
    return r;
  }
  // a foreleg used as an arm: wool cuff at the shoulder, black limb, hoof
  function hoofArm(sh, hf, sc) {
    const m = [lerp(sh[0], hf[0], .78), lerp(sh[1], hf[1], .78)];
    taper(s, sh, m, .17 * sc, .12 * sc, WOOL_SH); taper(s, [sh[0], sh[1] - .03 * sc], [m[0], m[1] - .03 * sc], .13 * sc, .09 * sc, WOOL);
    taper(s, m, hf, .07 * sc, .07 * sc, FACE);
    dot(s, hf[0], hf[1], .085 * sc, '#08080d');
  }
  // a sheep head drawn on its own. turn: 0 facing camera, 1 profile to the right (-1 left)
  function head(g, x, y, sc, { lids = .6, look = [0, 0], turn = 0, face = FACE, tuft = WOOL } = {}) {
    g.save(); g.translate(x, y);
    const pr = Math.abs(turn), d = Math.sign(turn) || 1;
    for (const e of [-1, 1]) {
      g.save(); g.translate((e * .27 - d * pr * (.12 + .1 * e)) * sc, -.06 * sc); g.rotate(e * .55 + pr * d * .3);
      g.fillStyle = face; g.beginPath(); g.ellipse(0, 0, .19 * sc, .065 * sc, 0, 0, TAU); g.fill(); g.restore();
    }
    g.save(); g.rotate(d * pr * .5);
    g.fillStyle = face; g.beginPath(); g.ellipse(d * pr * .08 * sc, pr * .03 * sc, (.26 + .1 * pr) * sc, (.35 - .1 * pr) * sc, 0, 0, TAU); g.fill();
    g.restore();
    for (let i = 0; i < 3; i++) dot(g, (i - 1) * .11 * sc - d * pr * .1 * sc, -.33 * sc + pr * .06 * sc - (i === 1 ? .04 * sc : 0), .12 * sc, tuft);
    for (const e of [-1, 1]) {
      if (pr > .6 && e === -d) continue;
      const ex = e * .11 * sc * (1 - pr) + d * pr * .1 * sc, ey = -.05 * sc - pr * .02 * sc, rx = .078 * sc, ry = .06 * sc;
      g.save(); g.beginPath(); g.ellipse(ex, ey, rx, ry, 0, 0, TAU); g.clip();
      g.fillStyle = '#f2eee4'; g.fillRect(ex - rx, ey - ry, rx * 2, ry * 2);
      dot(g, ex + look[0] * .03 * sc, ey + .012 * sc + look[1] * .02 * sc, .036 * sc, '#0a0a0f');
      g.fillStyle = face; g.fillRect(ex - rx, ey - ry, rx * 2, ry * 2 * lids);
      g.restore();
      stroke(g, [[ex - rx, ey - ry + ry * 2 * lids], [ex + rx, ey - ry + ry * 2 * lids]], '#4a4452', .018 * sc);
    }
    stroke(g, [[-.06 * sc + d * pr * .2 * sc, .2 * sc], [.06 * sc + d * pr * .2 * sc, .21 * sc]], '#5d5563', .02 * sc);
    g.restore();
  }
  // a puffed body (wool, crumbs, whatever), centred at 0,0 in the current transform
  function puff(g, sc, seed, wool, shade, hi) {
    g.fillStyle = shade; g.beginPath(); g.ellipse(0, .1 * sc, 1.02 * sc, .52 * sc, 0, 0, TAU); g.fill();
    const r = rng(seed * 31 + 7);
    for (let i = 0; i < 12; i++) {
      const ang = i / 12 * TAU + r() * .3, rad = (.3 + .12 * r()) * sc;
      dot(g, Math.cos(ang) * .8 * sc, Math.sin(ang) * .34 * sc - .04 * sc, rad, Math.sin(ang) > .35 ? shade : wool);
    }
    g.fillStyle = wool; g.beginPath(); g.ellipse(0, -.06 * sc, .86 * sc, .42 * sc, 0, 0, TAU); g.fill();
    for (let i = 0; i < 4; i++) dot(g, (-.45 + i * .3) * sc, (-.36 + .06 * Math.sin(i * 2.1)) * sc, (.16 + .05 * r()) * sc, hi);
  }
  // the shorn sheep: a thin pink-grey body, stick legs, the same big head
  function shorn(t, x, y, sc, { dir = 1, lids = .6, look = [0, 0], turn = null, bob: b = 0, shiver = 0 } = {}) {
    const legL = .78 * sc, bx = x + Math.sin(t * 60) * shiver, by = y - legL - .22 * sc + b;
    for (const lx of [.42, .3, -.42, -.3]) taper(s, [bx + dir * lx * sc, by + .12 * sc], [bx + dir * lx * sc, y], .045 * sc, .035 * sc, FACE);
    s.fillStyle = '#8f6c68'; s.beginPath(); s.ellipse(bx, by + .04 * sc, .66 * sc, .28 * sc, 0, 0, TAU); s.fill();
    s.fillStyle = '#c9a39a'; s.beginPath(); s.ellipse(bx, by - .02 * sc, .6 * sc, .22 * sc, 0, 0, TAU); s.fill();
    for (let i = 0; i < 3; i++) stroke(s, bez([bx + (-.2 + i * .16) * sc, by - .16 * sc], [bx + (-.25 + i * .16) * sc, by], [bx + (-.25 + i * .16) * sc, by + .08 * sc], [bx + (-.2 + i * .16) * sc, by + .2 * sc], 8), '#9c7a74', .025 * sc);
    const r = rng(9);
    for (let i = 0; i < 9; i++) dot(s, bx + (r() - .5) * 1.1 * sc, by + (r() - .6) * .3 * sc, .035 * sc, '#e4dccb');
    taper(s, [bx + dir * .45 * sc, by - .05 * sc], [bx + dir * .78 * sc, by - .34 * sc], .13 * sc, .1 * sc, '#b8928a');
    const hx = bx + dir * .82 * sc, hy = by - .42 * sc;
    head(s, hx, hy, sc, { lids, look, turn: turn === null ? dir * .9 : turn });
    return { head: [hx, hy], body: [bx, by] };
  }
  function sleeperFig(t, x, feetY, sc, pose = 'stand', style = 'idle', amt = 1) {
    const G = groove(POSE[pose], style, t, amt), hipY = feetY - .89 * sc;
    const J = figure(s, G.pose, { x: x + G.dx, y: hipY + G.dy, sc, color: PYJ_DK, coat: PYJ, headC: SKIN });
    s.fillStyle = HAIR; s.beginPath(); s.ellipse(J.head[0], J.head[1] - .06 * sc, .088 * sc, .06 * sc, 0, Math.PI, TAU); s.fill();
    return J;
  }
  const PILLC = ['#ece6d8', '#d2402c', '#e8b83e', '#5a86d6', '#ece6d8', '#e07a9a'];
  function pill(g, x, y, sz, rot, k) {
    g.save(); g.translate(x, y); g.rotate(rot);
    if (k % 3 === 0) { dot(g, 0, 0, sz * .55, PILLC[k % 6]); stroke(g, [[-sz * .3, 0], [sz * .3, 0]], 'rgba(0,0,0,.2)', 2); }
    else { taper(g, [-sz * .5, 0], [0, 0], sz * .3, sz * .3, PILLC[(k + 1) % 6]); taper(g, [0, 0], [sz * .5, 0], sz * .3, sz * .3, '#ece6d8'); }
    g.restore();
  }
  function bottle(x, y, w, h, rot) {
    s.save(); s.translate(x, y); s.rotate(rot);
    s.fillStyle = '#a8561c'; s.fillRect(-w / 2, -h, w, h);
    s.fillStyle = '#e08a34'; s.fillRect(-w / 2 + w * .12, -h + h * .12, w * .3, h * .8);
    s.fillStyle = '#f0ebe0'; s.fillRect(-w * .56, -h - h * .26, w * 1.12, h * .28);
    s.fillStyle = '#e8e0cc'; s.fillRect(-w * .38, -h * .7, w * .76, h * .34);
    s.restore();
  }

  // ---------- the office ----------
  function office(t, o = {}) {
    const { arm = 'rest', lampF = 1, sleeperSc = 125 } = o;
    BIG(s, '#0f1822');
    // panelled wall
    s.fillStyle = '#132131'; for (let x = 640; x < 2300; x += 260) s.fillRect(x, 120, 200, 440);
    s.fillStyle = '#0a1019'; s.fillRect(-500, 620, 3000, 600);
    s.fillStyle = '#0e1622'; for (let x = 640; x < 2300; x += 260) s.fillRect(x + 20, 660, 160, 250);
    // tall window, moonlight falling on the floor where the sleeper stands
    const wx = 170, wy = 90, ww = 400, wh = 640;
    s.fillStyle = vgrad(s, wy, wy + wh, [[0, '#26336e'], [1, '#4f5c9e']]); s.fillRect(wx, wy, ww, wh);
    moon(wx + 280, wy + 150, 40, .8);
    s.strokeStyle = '#0a0f1c'; s.lineWidth = 26; s.strokeRect(wx, wy, ww, wh);
    s.lineWidth = 12; s.beginPath(); s.moveTo(wx + ww / 2, wy); s.lineTo(wx + ww / 2, wy + wh); s.moveTo(wx, wy + wh * .45); s.lineTo(wx + ww, wy + wh * .45); s.stroke();
    s.fillStyle = '#161222'; s.fillRect(-500, 960, 3000, 400);
    s.save(); s.globalAlpha = .55; poly(s, [[wx, wy + wh], [wx + ww, wy + wh], [wx + ww + 260, 1090], [wx - 170, 1090]], '#5a66a8'); s.restore();
    glow(wx + ww / 2, 1000, 420, 'rgba(120,140,255,.12)');
    // the sleeper, small, facing the desk
    sleeperFig(t, 700, 1010, sleeperSc, 'stand', 'idle', 1);
    glow(700, 880, 240, 'rgba(140,160,255,.18)');
    // the ram behind the desk
    const R = ram(t, 1340, 822, 240, { dir: -1, look: [-1, .7], lids: .64, bob: -bob(t) * 5 });
    const sh = [1340 - .55 * 240, 822 - 250 + .06 * 240];
    let hf;
    if (arm === 'slam') hf = kf(t, [[SLAM - .5, [1110, 690]], [SLAM - .12, [1170, 400]], [SLAM, [1100, 688]]], ease.inOut);
    else if (arm === 'jab') hf = kf(t, [[JAB1 - .3, [1150, 470]], [JAB1, [900, 560]], [JAB1 + .5, [930, 555]], [JAB2 - .25, [1120, 470]], [JAB2, [880, 575]], [JAB2 + .6, [905, 570]]], ease.out);
    else hf = [1110, 690];
    // desk
    s.fillStyle = '#4a2e24'; s.fillRect(800, 684, 960, 30);
    s.fillStyle = '#26150f'; s.fillRect(820, 714, 920, 300);
    s.fillStyle = '#1c0f0b'; s.fillRect(860, 750, 380, 220); s.fillRect(1300, 750, 400, 220);
    // paper pile (in front of the ram)
    const jump = o.pileJump || 0;
    for (let i = 0; i < 6; i++) { s.fillStyle = i % 2 ? '#d8cfb8' : '#e8e0ca'; s.fillRect(1460 + hash(i) * 14, 668 - i * 9 - jump * (20 + i * 8), 150, 10); }
    hoofArm(sh, hf, 240);
    // banker's lamp
    const lx = 930, ly = 684;
    s.fillStyle = '#9a7a3a'; s.beginPath(); s.ellipse(lx, ly - 6, 70, 14, 0, 0, TAU); s.fill();
    stroke(s, [[lx, ly - 10], [lx, ly - 120]], '#8a6a32', 12);
    s.fillStyle = '#1e7040'; s.beginPath(); s.ellipse(lx, ly - 120, 130, 58, 0, Math.PI, TAU); s.fill();
    s.fillStyle = '#2c9658'; s.beginPath(); s.ellipse(lx - 30, ly - 138, 70, 22, -.1, Math.PI, TAU); s.fill();
    s.fillStyle = '#fff0c0'; s.fillRect(lx - 124, ly - 124, 248, 8);
    glow(lx, ly - 110, 110 * lampF, 'rgba(255,240,190,.7)');
    glow(lx, ly - 10, 420 * lampF, 'rgba(170,255,150,.22)');
    glow(R.head[0], R.head[1], 260, `rgba(150,255,160,${.08 * lampF})`);
    for (const d of [-1, 1]) dot(f, R.head[0] + d * .11 * 240 - .03 * 240, R.head[1] - .02 * 240, 4, `rgba(200,255,200,${.5 * lampF})`);
    return R;
  }

  // ---------- 1 · the boss (29.4 - 31.42) opens from black; slams the desk on the beat ----------
  function boss(t, lt, dur) {
    const k = hit(t, SLAM, 9), [sx, sy] = shake(t, 16 * k);
    cam(kf(lt, [[0, 1020], [dur, 960]]) + sx, kf(lt, [[0, 580], [dur, 610]]) + sy, kf(lt, [[0, 1.2], [SLAM - 29.4, 1.08], [dur, 1.14]], ease.out) + .04 * k);
    office(t, { arm: 'slam', lampF: 1 - .5 * k * (Math.sin(t * 90) > 0), pileJump: Math.max(0, Math.sin(Math.min(1, (t - SLAM) * 3) * Math.PI)) * (t > SLAM ? 1 : 0) });
    flash(.12 * k, '#d8ffd0');
    blackout(1 - smooth(inv(0, .4, lt)));
  }

  // ---------- 2 · the jab (31.42 - 34.36) papers swirl like snow ----------
  function papers(t, t0, n, seed) {
    for (let i = 0; i < n; i++) {
      const a = t - t0 - hash(i + seed) * .15; if (a < 0) continue;
      const ph = hash(i * 3 + seed) * TAU, side = hash(i * 5 + seed) * 2 - 1;
      const x = 1530 + side * 700 * (1 - Math.exp(-1.6 * a)) + 90 * Math.sin(a * 1.7 + ph) - a * 120;
      const y = 660 - (380 + 260 * hash(i * 7 + seed)) * (1 - Math.exp(-3 * a)) + 70 * a * a + 30 * Math.sin(a * 2.3 + ph);
      const rot = ph + a * (2 + 3 * hash(i + 9)), flip = Math.cos(a * (3 + 4 * hash(i + 11)) + ph);
      s.save(); s.translate(x, y); s.rotate(rot); s.scale(Math.abs(flip) * .9 + .1, 1);
      s.fillStyle = flip > 0 ? '#ece4ce' : '#a79d88'; s.fillRect(-40, -52, 80, 104);
      s.restore();
    }
  }
  function jab(t, lt, dur) {
    const k = hit(t, JAB1, 8) + hit(t, JAB2, 8), [sx, sy] = shake(t, 10 * k);
    cam(kf(lt, [[0, 1150], [dur, 880]]) + sx, kf(lt, [[0, 520], [dur, 580]]) + sy, kf(lt, [[0, 1.45], [dur, 1.2]]), kf(lt, [[0, -.04], [dur, .03]]));
    office(t, { arm: 'jab', pileJump: 0 });
    papers(t, JAB1, 24, 1); papers(t, JAB2, 16, 50);
    flash(.12 * k);
  }

  // ---------- 3 · the cart (34.36 - 35.83) rolls in down a night aisle ----------
  function aisle(t) {
    BIG(s, '#0c1128');
    s.fillStyle = vgrad(s, 0, 1080, [[0, '#141a3a'], [.5, '#1c2450'], [1, '#262a50']]); s.fillRect(-500, -200, 3000, 1400);
    const vx = 960, vy = 470;
    for (const d of [-1, 1]) {
      for (let r = 0; r < 5; r++) {
        const y0 = -200 + r * 230, y1 = y0 + 190;
        poly(s, [[vx + d * 1600, y0], [vx + d * 380, vy + (y0 - vy) * .25], [vx + d * 380, vy + (y1 - vy) * .25], [vx + d * 1600, y1]], r % 2 ? '#1a2350' : '#212b5c');
        for (let j = 0; j < 7; j++) {
          const u = j / 7, x = lerp(vx + d * 1500, vx + d * 420, Math.pow(u, .7)), sz = lerp(1, .28, Math.pow(u, .7));
          const yy = lerp(y1, vy + (y1 - vy) * .25, Math.pow(u, .7));
          s.fillStyle = ['#8a3a3a', '#c28a3a', '#3a6a8a', '#d8d0bc'][(j + r) % 4]; s.fillRect(x - 55 * sz, yy - 120 * sz, 90 * sz, 110 * sz);
        }
      }
      for (let j = 0; j < 5; j++) { const u = j / 5, x = lerp(vx + d * 900, vx + d * 120, u); stroke(f, [[x, lerp(40, 380, u)], [x + d * 120 * (1 - u), lerp(20, 375, u)]], 'rgba(220,235,255,.55)', lerp(16, 3, u)); }
    }
    poly(s, [[-500, 1300], [vx - 300, vy + 60], [vx + 300, vy + 60], [2400, 1300]], '#2a2c52');
    glow(vx, 300, 700, 'rgba(160,190,255,.08)');
  }
  function cart(t, x, y, sc, tipRot = 0, heap = 1, jolt = 0) {
    s.save(); s.translate(x, y); s.scale(sc, sc);
    for (const wx of [-150, 150]) { dot(s, wx, -18, 20, '#0a0b14'); dot(s, wx, -18, 7, '#555a70'); }
    s.translate(-150, -60); s.rotate(tipRot); s.translate(150, 60);
    stroke(s, [[-150, -40], [150, -40]], '#6a7088', 10);
    // heap of pill bottles
    const r = rng(5);
    for (let i = 0; i < 26 * heap; i++) {
      const u = r(), row = Math.floor(i / 7), bx = -150 + u * 300, by = -200 - row * 38 + Math.sin(u * Math.PI) * -60 * (row > 0) - jolt * 40 * r();
      bottle(bx, by, 40, 56, (r() - .5) * 1.2 - jolt * .3);
    }
    poly(s, [[-190, -250], [190, -250], [160, -60], [-160, -60]], 'rgba(120,128,160,.35)');
    for (let i = 0; i <= 8; i++) { const u = i / 8; stroke(s, [[lerp(-190, 190, u), -250], [lerp(-160, 160, u), -60]], '#8b92ac', 5); }
    for (const v of [-250, -185, -120, -60]) stroke(s, [[-190 + (v + 250) * .158, v], [190 - (v + 250) * .158, v]], '#9aa0ba', 6);
    stroke(s, [[190, -250], [260, -330], [300, -330]], '#9aa0ba', 10);
    s.restore();
  }
  function cartIn(t, lt, dur) {
    const x = kf(t, [[34.36, 1750], [35.2, 900], [35.83, 860]], ease.out);
    const jolt = hit(t, 35.2, 9) * Math.sin((t - 35.2) * 30) * (t > 35.2);
    cam(kf(lt, [[0, 1160], [dur, 1000]]), 560, kf(lt, [[0, 1.08], [dur, 1.22]]));
    aisle(t);
    const walk = -Math.abs(Math.sin(t * 9)) * 8 * (1 - inv(35.1, 35.3, t));
    sheep(t, x + 300 + .98 * 105 - 40, 1010, 105, { dir: -1, lids: .6, bob: walk, look: [-.5, 0] });
    cart(t, x, 1000, 1.1, 0, 1, jolt);
  }

  // ---------- 4 · the pour (35.83 - 37.45) pills fall like a waterfall ----------
  function pour(t, lt, dur) {
    cam(kf(lt, [[0, 640], [dur, 820]]), kf(lt, [[0, 380], [.8, 640], [dur, 680]], ease.inOut), kf(lt, [[0, 1.4], [dur, 1.12]]), kf(lt, [[0, .05], [dur, -.03]]));
    BIG(s, '#0d1230');
    s.fillStyle = vgrad(s, -100, 1100, [[0, '#1a1f4a'], [1, '#0d1030']]); s.fillRect(-600, -400, 3200, 1800);
    // a high ledge the cart teeters on
    s.fillStyle = '#2a2a52'; s.fillRect(-600, 330, 1150, 900);
    s.fillStyle = '#3a3a6a'; s.fillRect(-600, 320, 1150, 26);
    s.fillStyle = '#1a1a3a'; s.fillRect(-500, 1000, 3200, 600);
    const tip = kf(t, [[TIP - .05, 0], [TIP + .3, .8]], ease.back);
    cart(t, 380, 330, 1.1, tip, 1 - .5 * inv(TIP, 37.4, t), 0);
    // mouth of the tipped basket, in world coords
    const ca = Math.cos(tip), sa = Math.sin(tip), qx = 150 + 60, qy = -190;
    const mx = 380 + 1.1 * (-150 + ca * qx - sa * qy), my = 330 + 1.1 * (-60 + sa * qx + ca * qy);
    const g = 1500, rate = 300, n = Math.max(0, Math.floor((t - TIP - .08) * rate));
    let pile = 0;
    for (let k = 0; k < Math.min(n, 460); k++) {
      const te = TIP + .08 + k / rate, a = t - te;
      const vx0 = 140 + hash(k * 3) * 200, vy0 = -60 + hash(k * 7) * 120;
      const floorY = 1000 - Math.min(220, k * .6) * Math.exp(-Math.pow((hash(k * 11) - .5) * 3, 2)) + 10;
      const ax = mx + (hash(k * 5) - .5) * 60;
      let x = ax + vx0 * a, y = my + vy0 * a + .5 * g * a * a;
      const rot = hash(k) * TAU + a * 8;
      if (y > floorY) { // landed: find landing time, freeze there
        const A = .5 * g, B = vy0, C = my - floorY, tl = (-B + Math.sqrt(B * B - 4 * A * C)) / (2 * A);
        x = ax + vx0 * tl + (hash(k * 13) - .5) * 160; y = floorY; pile++;
      }
      pill(s, x, y, 34, rot, k);
    }
    // the sleeper at the bottom, looking up, deadpan
    sleeperFig(t, 1060, 1004, 115, 'stand', 'idle', 1);
    glow(1060, 900, 200, 'rgba(140,160,255,.16)');
    glow(700, 700, 500, `rgba(255,220,150,${.1 * inv(TIP, TIP + .5, t)})`);
  }

  // ---------- 5 · the garrison (37.45 - 39.32) round sheep in helmets, bellies bouncing ----------
  function helmet(g, hd, sc) {
    g.fillStyle = '#4a5530'; g.beginPath(); g.ellipse(hd[0], hd[1] - .17 * sc, .38 * sc, .3 * sc, 0, Math.PI, TAU); g.fill();
    g.fillStyle = '#6a7648'; g.beginPath(); g.ellipse(hd[0] - .08 * sc, hd[1] - .32 * sc, .13 * sc, .06 * sc, -.3, 0, TAU); g.fill();
    g.fillStyle = '#353d22'; g.beginPath(); g.ellipse(hd[0], hd[1] - .17 * sc, .46 * sc, .07 * sc, 0, 0, TAU); g.fill();
  }
  function garrison(t, lt, dur) {
    const b = lastBeat(t), bt = FEAT.beats[b], ph = beatPhase(t), q = hit(t, bt, 9);
    cam(kf(lt, [[0, 880], [dur, 1060]]), 700 + 6 * q, 1.12, kf(lt, [[0, .02], [dur, -.02]]));
    sky('#070a22', '#122060', '#2a3470', 760);
    stars(t, 41, 90, 500, .8);
    for (const [bx, a] of [[500, 1], [1400, -1]]) { const sw = a * .3 * Math.sin(t * .9 + bx); poly(f, [[bx, 780], [bx + Math.sin(sw - .12) * 1200, 780 - Math.cos(sw - .12) * 1200], [bx + Math.sin(sw + .12) * 1200, 780 - Math.cos(sw + .12) * 1200]], 'rgba(170,190,255,.08)'); }
    // fortress wall with crenellations
    s.fillStyle = '#0c1030'; s.fillRect(-500, 560, 3000, 260);
    for (let x = -500; x < 2500; x += 160) s.fillRect(x, 520, 90, 50);
    s.fillStyle = '#1c2250'; s.fillRect(-500, 800, 3000, 500);
    const ranks = [[105, 880, 140, 2.9, 2], [185, 1080, 260, 2.7, 3]];
    for (const [sc, gy, speed, gap, seed] of ranks) {
      const span = gap * sc, n = Math.ceil(2600 / span) + 1;
      for (let i = 0; i < n; i++) {
        const x = ((i * span + t * speed) % (n * span)) - 400 - 200 * seed;
        const hop = Math.sin(ph * Math.PI), sq = .24 * q;
        s.save(); s.translate(x, gy); s.scale(1 + sq, 1 - sq); s.translate(-x, -gy);
        const r = sheep(t, x, gy, sc, { dir: 1, seed: seed * 10 + i, lids: .6 + .08 * hash(i + seed), bob: -hop * .38 * sc });
        helmet(s, r.head, sc);
        s.restore();
      }
      if (seed === 2) { s.save(); s.globalAlpha = .35; s.fillStyle = '#141a48'; s.fillRect(-600, 600, 3200, 500); s.restore(); }
    }
  }

  // ---------- 6 · the loom (39.32 - 41.03) low angle: the ram grows, the sleeper shrinks ----------
  function loom(t, lt, dur) {
    const k = hit(t, RUDE2, 7);
    cam(kf(lt, [[0, 900], [dur, 960]]), kf(lt, [[0, 720], [dur, 560]]), kf(lt, [[0, 1.1], [dur, 1.0]]) + .03 * k, kf(lt, [[0, -.08], [dur, -.03]]));
    BIG(s, '#0c141c');
    s.fillStyle = rgrad(s, 900, 1100, 50, 1300, [[0, '#1f4a36'], [.5, '#10202a'], [1, '#0a0e18']]); s.fillRect(-600, -600, 3200, 2400);
    const sc = kf(t, [[39.32, 380], [RUDE2, 470], [40.2, 500], [41.03, 560]], ease.back);
    const R = ram(t, 1180, 1040, sc, { dir: -1, look: [-.6, 1], lids: .66 });
    glow(R.head[0], R.head[1] + .3 * sc, sc * .9, 'rgba(120,255,140,.14)');
    for (const d of [-1, 1]) dot(f, R.head[0] + d * .11 * sc - .03 * sc, R.head[1] - .03 * sc, .012 * sc, 'rgba(210,255,210,.6)');
    s.fillStyle = '#081008'; s.fillRect(-600, 1040, 3200, 600);
    const ss = kf(t, [[40.22, 92], [40.8, 50]], ease.inOut);
    s.fillStyle = '#26305e'; s.beginPath(); s.ellipse(640, 1042, 170, 30, 0, 0, TAU); s.fill();
    sleeperFig(t, 640, 1040, ss, 'stand', 'idle', 1);
    glow(640, 980, 200, 'rgba(120,150,255,.22)');
    glow(900, 1100, 700, 'rgba(90,220,120,.12)');
  }

  // ---------- 7 · the shearing (41.03 - 42.40) snip, then one pull ----------
  function shear(t, lt, dur) {
    const k = hit(t, PULL, 7), [sx, sy] = shake(t, 14 * k + 4 * hit(t, SNIP, 12));
    const wk = hit(t, PULL, 10) * (t > PULL);
    whip(55 * wk, -40 * wk);
    cam(kf(lt, [[0, 900], [dur, 990]]) + sx, 640 + sy, kf(lt, [[0, 1.25], [dur, 1.12]]));
    BIG(s, '#0b0f24');
    s.fillStyle = rgrad(s, 960, 820, 60, 800, [[0, '#3a3f78'], [.6, '#161c44'], [1, '#0b0f24']]); s.fillRect(-600, -600, 3200, 2400);
    s.fillStyle = '#12173a'; s.fillRect(-600, 960, 3200, 600);
    poly(f, [[860, -80], [1060, -80], [1300, 970], [620, 970]], 'rgba(200,210,255,.07)');
    const X = 960, Y = 960, sc = 170;
    if (t < PULL) sheep(t, X, Y, sc, { dir: 1, lids: .6, seed: 4, look: [.3, -.6] });
    else {
      shorn(t, X, Y, sc, { dir: 1, lids: .6, shiver: 2.5 * hit(t, PULL, 3) });
      const a = t - PULL, cx = X + 900 * (1 - Math.exp(-4 * a)), cy = Y - 160 - 700 * (1 - Math.exp(-4 * a)) + 200 * a * a;
      s.save(); s.translate(cx, cy); s.rotate(a * 3); puff(s, sc, 4, WOOL, WOOL_SH, WOOL_HI); s.restore();
      for (let i = 0; i < 16; i++) { const u = hash(i + 3), w = hash(i + 40), aa = a - u * .1; if (aa < 0) continue; dot(s, X + (u - .5) * 360 + (100 + 300 * w) * aa + 30 * Math.sin(aa * 5 + i), Y - 230 - (160 + 260 * w) * aa + 260 * aa * aa, 14 + 10 * hash(i), WOOL); }
    }
    // the shears: open, snip on the beat, withdraw
    const open = kf(t, [[41.03, .55], [SNIP - .12, .6], [SNIP, .03], [PULL, .03], [PULL + .2, .4]], ease.in);
    const [px, py] = kf(t, [[41.03, [1450, 300]], [SNIP - .1, [1150, 560]], [PULL, [1150, 560]], [42.4, [1700, 150]]], ease.inOut);
    for (const d of [-1, 1]) {
      s.save(); s.translate(px, py); s.rotate(Math.PI * .8 + d * open);
      poly(s, [[-10, -44], [460, d * 6], [-10, 30]], '#9aa0b2'); poly(s, [[0, -30], [440, d * 4], [0, -6]], '#dfe3ee');
      s.strokeStyle = '#1c1c2c'; s.lineWidth = 30; s.beginPath(); s.ellipse(-130, 0, 80, 50, 0, 0, TAU); s.stroke();
      s.restore();
    }
    dot(s, px, py, 18, '#2a2a36');
    glow(px + Math.cos(Math.PI * .8) * 200, py + Math.sin(Math.PI * .8) * 200, 90, `rgba(230,240,255,${.35 + .5 * hit(t, SNIP, 8)})`);
  }

  // ---------- 8 · the turn (42.40 - 44.32) the shorn sheep turns to camera ----------
  function turnShot(t, lt, dur) {
    const k = hit(t, TURN, 8);
    const zoom = kf(t, [[42.4, 1.15], [TURN - .05, 1.4], [TURN + .25, 2.35], [44.32, 2.55]], ease.out);
    const X = 900, Y = 980, sc = 190;
    const hx = X + .82 * sc, hy = Y - .78 * sc - .22 * sc - .42 * sc;
    cam(lerp(X + 150, hx, inv(42.4, TURN + .25, t)), lerp(Y - 380, hy + 20, inv(42.4, TURN + .25, t)), zoom + .03 * k);
    BIG(s, '#0c1026');
    s.fillStyle = rgrad(s, hx, hy, 40, 700, [[0, '#3e4480'], [1, '#0c1026']]); s.fillRect(-600, -600, 3200, 2400);
    s.fillStyle = '#13183a'; s.fillRect(-600, Y, 3200, 600);
    const turn = kf(t, [[TURN - .06, .9], [TURN + .12, 0]], ease.out);
    const blink = t > 43.76 && t < 43.9 ? 1 : .62;
    shorn(t, X, Y, sc, { dir: 1, lids: blink, turn, look: [0, 0], bob: -bob(t) * 3 });
    glow(hx, hy, 380, 'rgba(160,170,255,.1)');
  }

  // ---------- 9 · the scales (44.32 - 45.76) empty, swinging ----------
  function scales(t, lt, dur) {
    cam(kf(lt, [[0, 900], [dur, 1020]]), kf(lt, [[0, 560], [dur, 520]]), kf(lt, [[0, 1.05], [dur, 1.2]]), kf(lt, [[0, .05], [dur, -.04]]));
    BIG(s, '#150f2a');
    s.fillStyle = rgrad(s, 960, 420, 50, 900, [[0, '#4a3a6a'], [.6, '#1e1638'], [1, '#110c22']]); s.fillRect(-600, -600, 3200, 2400);
    s.fillStyle = '#1a1230'; s.fillRect(-600, 930, 3200, 600);
    const tilt = kf(t, [[44.32, -.32], [44.78, .26], [45.35, -.2], [45.76, .12]], ease.back);
    const cx = 960, cy = 300, L = 440;
    // post and base
    poly(s, [[cx - 170, 930], [cx + 170, 930], [cx + 90, 880], [cx - 90, 880]], '#8a6a2a');
    taper(s, [cx, 890], [cx, cy], 24, 16, '#b8903e'); dot(s, cx, cy - 20, 30, '#d8b050');
    const ends = [-1, 1].map(d => [cx + d * Math.cos(tilt) * L, cy + d * Math.sin(tilt) * L]);
    taper(s, ends[0], ends[1], 14, 14, '#c89c44');
    for (const [ex, ey] of ends) {
      const pyy = ey + 330;
      stroke(s, [[ex, ey], [ex - 130, pyy]], '#a88838', 5); stroke(s, [[ex, ey], [ex + 130, pyy]], '#a88838', 5);
      s.fillStyle = '#c89c44'; s.beginPath(); s.ellipse(ex, pyy, 150, 34, 0, 0, Math.PI); s.fill();
      s.fillStyle = '#e0bc60'; s.beginPath(); s.ellipse(ex, pyy, 150, 14, 0, 0, TAU); s.fill();
      glow(ex, pyy, 120, 'rgba(255,220,140,.18)');
    }
    glow(cx, cy - 20, 90, 'rgba(255,230,160,.5)');
    // a sheep beside it, unmoved
    sheep(t, 1500, 935, 80, { dir: -1, sit: .8, lids: .6, look: [1, -.2], bob: -bob(t) * 3 });
  }

  // ---------- 10 · the red pen (45.76 - 47.06) scribbles over a drawing ----------
  function pen(t, lt, dur) {
    cam(kf(lt, [[0, 900], [dur, 1000]]), 540, kf(lt, [[0, 1.12], [dur, 1.38]]), kf(lt, [[0, .12], [dur, -.1]]));
    BIG(s, '#2a1812');
    s.fillStyle = '#3a2218'; for (let i = -4; i < 12; i++) s.fillRect(-600, i * 150, 3200, 70);
    s.save(); s.translate(960, 540); s.rotate(-.06);
    s.fillStyle = '#a89e84'; s.fillRect(-452, -322, 920, 660);
    s.fillStyle = '#ece4cc'; s.fillRect(-460, -330, 920, 660);
    // a pencil sketch of a sheep on the page
    s.fillStyle = '#b8b0a0'; s.beginPath(); s.ellipse(-40, 40, 230, 130, 0, 0, TAU); s.fill();
    s.fillStyle = '#d6cfbe'; s.beginPath(); s.ellipse(-40, 20, 200, 100, 0, 0, TAU); s.fill();
    s.fillStyle = '#3a3438'; s.beginPath(); s.ellipse(190, -20, 60, 80, .2, 0, TAU); s.fill();
    for (const lx of [-160, -90, 40, 110]) stroke(s, [[lx, 150], [lx, 250]], '#3a3438', 16);
    // the scribble, a hard zigzag strike-out
    const u = kf(t, [[45.76, 0], [46.14, .3], [46.86, .8], [47.06, 1]], (x) => x);
    // tight diagonal hatching that merges into one red blot: no single stroke stands alone
    const N = 520, pts = [];
    for (let i = 0; i <= N * u; i++) {
      const v = i / N, z = v * 34 % 1, tri = z < .5 ? z * 2 : 2 - z * 2;
      const amp = .55 + .45 * noise1(v * 34, 5), off = 90 * snoise(v * 9, 2);
      const a = -300 + 560 * v, bb = -170 + off + 360 * amp * tri;
      pts.push([a + (bb + 210) * .45 + 30 * snoise(v * 60, 3), bb + 26 * snoise(v * 47, 4)]);
    }
    if (pts.length > 1) { stroke(s, pts, '#b81c16', 30); stroke(s, pts.filter((_, i) => i % 3 === 0), '#e0402e', 10); }
    const tip = pts.length ? pts[pts.length - 1] : [-300, -200];
    s.restore();
    const c = Math.cos(-.06), sn = Math.sin(-.06), wx = 960 + c * tip[0] - sn * tip[1], wy = 540 + sn * tip[0] + c * tip[1];
    // the pen itself
    const ang = -.9 + .1 * Math.sin(t * 20);
    const back = [wx + Math.cos(ang) * 620, wy + Math.sin(ang) * 620];
    taper(s, [wx + 10, wy + 14], [back[0] + 10, back[1] + 14], 16, 34, 'rgba(20,10,8,.45)');
    taper(s, [wx, wy], [wx + Math.cos(ang) * 60, wy + Math.sin(ang) * 60], 6, 24, '#1a1418');
    taper(s, [wx + Math.cos(ang) * 60, wy + Math.sin(ang) * 60], back, 26, 32, '#b01e18');
    taper(s, [wx + Math.cos(ang) * 90, wy + Math.sin(ang) * 90], [wx + Math.cos(ang) * 560, wy + Math.sin(ang) * 560], 8, 10, '#e05a4a');
    glow(wx, wy, 80, 'rgba(255,90,60,.2)');
  }

  // ---------- 11 · bare and breaded (47.06 - 48.30) ----------
  function breadedSheep(t, x, y, sc) {
    const legL = .62 * sc, by = y - legL - .42 * sc - bob(t) * 3;
    for (const lx of [.5, .36, -.5, -.36]) taper(s, [x + lx * sc, by + .3 * sc], [x + lx * sc, y], .075 * sc, .055 * sc, FACE);
    s.save(); s.translate(x, by); puff(s, sc, 12, '#c98a3a', '#8a5222', '#e8b262'); s.restore();
    const r = rng(33);
    for (let i = 0; i < 60; i++) { const a = r() * TAU, rr = Math.sqrt(r()); dot(s, x + Math.cos(a) * rr * .9 * sc, by + Math.sin(a) * rr * .45 * sc, (.03 + .03 * r()) * sc, r() > .5 ? '#6e3a14' : '#f0c878'); }
    head(s, x + .98 * sc, by - .26 * sc, sc, { lids: .62, look: [-.6, 0], turn: 0, tuft: '#d89a48' });
  }
  function breaded(t, lt, dur) {
    const BR = 47.96, wk = Math.sin(Math.PI * inv(BR - .22, BR + .06, t));
    whip(-60 * wk, 0);
    cam(kf(t, [[47.06, 520], [BR - .22, 600], [BR + .06, 1340], [48.3, 1390]], ease.inOut), kf(lt, [[0, 700], [dur, 690]]), kf(lt, [[0, 1.85], [dur, 2.0]]));
    BIG(s, '#100c22');
    s.fillStyle = vgrad(s, 0, 1080, [[0, '#1a1438'], [1, '#2a1c38']]); s.fillRect(-600, -600, 3200, 2400);
    s.fillStyle = '#20182e'; s.fillRect(-600, 860, 3200, 600);
    for (const px of [560, 1360]) { poly(f, [[px - 80, -100], [px + 80, -100], [px + 300, 860], [px - 300, 860]], 'rgba(255,230,190,.07)'); s.fillStyle = '#3a2c48'; s.beginPath(); s.ellipse(px, 860, 300, 50, 0, 0, TAU); s.fill(); }
    shorn(t, 480, 860, 120, { dir: 1, lids: .6, turn: .9, shiver: 2 });
    // the plate, lemon, parsley
    s.fillStyle = '#d8d4c8'; s.beginPath(); s.ellipse(1360, 850, 280, 44, 0, 0, TAU); s.fill();
    s.fillStyle = '#eeeae0'; s.beginPath(); s.ellipse(1360, 846, 220, 30, 0, 0, TAU); s.fill();
    breadedSheep(t, 1290, 846, 120);
    poly(s, [[1520, 846], [1590, 800], [1600, 846]], '#f0d040'); dot(s, 1180, 842, 20, '#3a8a3a'); dot(s, 1200, 832, 16, '#4aa04a');
    const pk = hit(t, BR, 5) * (t > BR);
    for (let i = 0; i < 24; i++) { const a = hash(i) * Math.PI + Math.PI, v = 200 + 300 * hash(i + 5), e = t - BR; if (e < 0) continue; dot(s, 1300 + Math.cos(a) * v * e, 700 + Math.sin(a) * v * e + 600 * e * e, 9, '#e0a850'); }
    glow(1300, 700, 400, `rgba(255,200,120,${.2 * pk})`);
  }

  // ---------- 12 · the jar (48.30 - 51.02) a sheep sealed in a preserving jar ----------
  function jarShot(t, lt, dur) {
    const DROP = 48.62, LID = 49.76, FILL = 50.06;
    const k = hit(t, DROP, 9) + hit(t, LID, 10), [sx, sy] = shake(t, 5 * k);
    cam(960 + sx, kf(lt, [[0, 680], [dur, 660]]) + sy, kf(lt, [[0, 1.12], [LID - 48.3, 1.25], [dur, 1.6]], ease.inOut));
    BIG(s, '#120e20');
    s.fillStyle = '#1c1428'; s.fillRect(-600, -600, 3200, 1600);
    // shelf with more jars, each with a sheep inside
    s.fillStyle = '#3a2418'; s.fillRect(-600, 980, 3200, 40); s.fillStyle = '#24160f'; s.fillRect(-600, 1020, 3200, 400);
    for (const bx of [280, 1640]) {
      s.fillStyle = 'rgba(120,150,170,.35)'; s.fillRect(bx - 150, 560, 300, 420);
      sheep(t, bx - 10, 960, 90, { dir: bx < 960 ? 1 : -1, sit: .6, lids: .62, seed: bx, bob: -bob(t + bx) * 2 });
      s.fillStyle = 'rgba(170,190,110,.35)'; s.fillRect(bx - 150, 600, 300, 380);
      s.fillStyle = '#7a7f8c'; s.fillRect(bx - 160, 530, 320, 40);
      stroke(f, [[bx - 110, 600], [bx - 110, 940]], 'rgba(200,225,255,.25)', 10);
    }
    // the main jar
    const J0 = 740, J1 = 1180, JT = 320, JB = 980;
    s.fillStyle = '#23304a'; s.fillRect(J0, JT, J1 - J0, JB - JT);
    const sy0 = kf(t, [[48.3, -500], [DROP, 960]], ease.in);
    const sq = hit(t, DROP, 8) * (t > DROP) * .2;
    s.save(); s.translate(960, 960); s.scale(1 + sq, 1 - sq); s.translate(-960, -960);
    sheep(t, 925, sy0, 140, { dir: 1, sit: .7 * (t > DROP), lids: .62, look: [-.4, .1], air: t < DROP ? .8 : null, seed: 6 });
    s.restore();
    // brine rising
    const lvl = kf(t, [[FILL, JB], [50.9, JT + 70]], ease.inOut);
    if (lvl < JB) {
      s.fillStyle = 'rgba(180,196,110,.42)'; s.beginPath(); s.moveTo(J0, JB);
      for (let x = J0; x <= J1; x += 20) s.lineTo(x, lvl + 8 * Math.sin(x * .03 + t * 6));
      s.lineTo(J1, JB); s.closePath(); s.fill();
      for (let i = 0; i < 16; i++) { const by = JB - ((t * 180 + hash(i) * 600) % Math.max(1, JB - lvl)); dot(f, J0 + 40 + hash(i + 3) * 360, by, 6, 'rgba(230,255,200,.5)'); }
    }
    // glass
    s.fillStyle = 'rgba(160,190,220,.16)'; s.fillRect(J0, JT, J1 - J0, JB - JT);
    stroke(s, [[J0, JT], [J0, JB - 20], [J0 + 20, JB], [J1 - 20, JB], [J1, JB - 20], [J1, JT]], '#8aa0bc', 12, 'butt');
    stroke(f, [[J0 + 40, JT + 60], [J0 + 40, JB - 60]], 'rgba(210,235,255,.5)', 16);
    stroke(f, [[J1 - 60, JT + 90], [J1 - 60, JT + 260]], 'rgba(210,235,255,.3)', 10);
    // lid comes down and seals
    const ly = kf(t, [[49.04, -200], [LID, JT - 30]], ease.back);
    s.fillStyle = '#7e8494'; s.fillRect(J0 - 20, ly - 20, J1 - J0 + 40, 70);
    for (let i = 0; i < 16; i++) { const x = J0 - 10 + ((i * 30 + (t > LID ? (t - LID) * 60 : 0)) % (J1 - J0 + 20)); stroke(s, [[x, ly - 14], [x, ly + 44]], '#5a5e6c', 6); }
    s.fillStyle = '#a8aebc'; s.fillRect(J0 - 20, ly - 20, J1 - J0 + 40, 14);
    glow(960, ly, 300, `rgba(230,240,255,${.25 * hit(t, LID, 6) * (t > LID)})`);
  }

  chapter('mentor', 29.4, 51.02, [
    [29.4, boss],
    [31.42, jab],
    [34.36, cartIn],
    [TIP, pour],
    [37.45, garrison],
    [39.32, loom],
    [41.03, shear],
    [42.4, turnShot],
    [44.32, scales],
    [45.76, pen],
    [47.06, breaded],
    [48.3, jarShot],
  ], { paint: { boil: 8, bloom: 1.2 } });
})();
