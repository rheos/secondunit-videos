// js/ch/intro.js · intro (0 - 18.5): her real room, she lies down, the lamp goes off, her eyes close,
// and the dream's paint opens out of her closed eye and takes the frame.
// The waking world is drawn on the unbrushed ink layer (ik) in one of the REAL styles
// (?real=cover | charcoal); the dream is the painted layer underneath, revealed through a hole in ik.
(() => {
  const REAL = new URLSearchParams(location.search).get('real') || 'cover';
  const T = { sit: 0, lie0: 3.2, lie1: 5.6, reach: 6.0, off: 7.2, push0: 7.6, close0: 9.6, close1: 11.2, open0: 12.0, open1: 17.2, end: 18.5 };

  // ---------- the two waking styles. Shapes are named by role; each style decides how a role looks ----------
  const COVER = { // flat naive gouache, after the 1989 sleeve: muted rose, ochre boards, grey-green walls
    paper: '#d9cfb8', wall: '#56604e', wallDk: '#3f4a3c', floor: '#c9a46a', board: '#e3c993', window: '#6f86a6', windowDk: '#3d4f6e', frame: '#2a2c2a',
    bed: '#6b4630', sheet: '#e9e2cf', blanket: '#8a7a5c', pillow: '#f1ebda', table: '#5a3a26', lamp: '#d9b45a', shade: '#e8cf86', light: 'rgba(255,214,120,.28)',
    skin: '#d9a585', hair: '#8c8c8c', cardigan: '#c9849a', cardiganDk: '#a8667e', skirt: '#4f4a6a', stocking: '#e9e2cf', shoe: '#2a2228', line: '#2a2a28', night: 'rgba(24,34,70,.62)',
  };
  const CHAR = { // charcoal on paper: values only (0 = paper, 1 = black)
    paper: .0, wall: .32, wallDk: .55, floor: .18, board: .05, window: .1, windowDk: .4, frame: .85, bed: .7, sheet: .04, blanket: .38, pillow: .02, table: .72,
    lamp: .45, shade: .12, light: 0, skin: .1, hair: .5, cardigan: .3, cardiganDk: .5, skirt: .62, stocking: .1, shoe: .9, line: .95, night: .55,
  };

  let paperTex = null;
  function paper() {
    if (paperTex) return paperTex;
    const c = document.createElement('canvas'); c.width = 960; c.height = 540; const g = c.getContext('2d'); const d = g.createImageData(960, 540); const r = rng(7);
    for (let i = 0; i < d.data.length; i += 4) { const v = 200 + r() * 55 - (r() < .02 ? 40 : 0); d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
    g.putImageData(d, 0, 0); paperTex = c; return c;
  }

  // wobbly outline: subdivide and offset with seeded noise; boil = how often the wobble re-rolls
  let BOIL = 0;
  function wob(pts, amt, seed, closed = true) {
    const out = []; const n = pts.length;
    for (let i = 0; i < (closed ? n : n - 1); i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % n]; const L = Math.hypot(bx - ax, by - ay), k = Math.max(1, Math.round(L / 22));
      for (let j = 0; j < k; j++) { const u = j / k; const h = hash2(i * 31 + j, seed, BOIL); const h2 = hash2(i * 17 + j, seed + 9, BOIL); out.push([lerp(ax, bx, u) + (h - .5) * amt, lerp(ay, by, u) + (h2 - .5) * amt]); }
    }
    if (!closed) out.push(pts[n - 1]);
    return out;
  }
  function path(g, pts, closed = true) { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); if (closed) g.closePath(); }
  const grey = (v, a = 1) => `rgba(${Math.round(30 + 200 * (1 - v))},${Math.round(30 + 196 * (1 - v))},${Math.round(34 + 186 * (1 - v))},${a})`;

  // R.shape(points, role, seed): a filled form; R.mark(points, role, width, seed): a drawn line
  const R = {
    shape(pts, role, seed = 1) {
      const g = ik;
      if (REAL === 'cover') { path(g, wob(pts, 3, seed)); g.fillStyle = COVER[role]; g.fill(); return; }
      // charcoal: a smudged tone, hatching at the role's value, then a sketchy contour drawn twice
      const v = CHAR[role]; const w = wob(pts, 5, seed);
      path(g, w); g.fillStyle = '#e8e2d6'; g.fill();
      g.save(); g.filter = 'blur(3px)'; path(g, wob(pts, 10, seed + 7)); g.fillStyle = grey(v, .8); g.fill(); g.restore();
      if (v > .35) {
        g.save(); path(g, w); g.clip(); g.strokeStyle = grey(Math.min(1, v + .25), .5); g.lineWidth = 1.6;
        const xs = w.map((p) => p[0]), ys = w.map((p) => p[1]); const x0 = Math.min(...xs) - 200, x1 = Math.max(...xs) + 200, y0 = Math.min(...ys), y1 = Math.max(...ys);
        const step = lerp(22, 7, v); g.beginPath();
        for (let x = x0; x < x1; x += step) { const j = (hash2(x | 0, seed, BOIL) - .5) * 3; g.moveTo(x + j, y1 + 4); g.lineTo(x + j + (y1 - y0) * .6, y0 - 4); }
        g.stroke(); g.restore();
      }
      for (let k = 0; k < 2; k++) { path(g, wob(pts, 6, seed + k * 101)); g.strokeStyle = grey(Math.min(1, v + .45), .75); g.lineWidth = 3.2 - k * 1.4; g.stroke(); }
    },
    mark(pts, role, w, seed = 3) {
      const g = ik; g.lineCap = 'round'; g.lineJoin = 'round';
      if (REAL === 'cover') { path(g, wob(pts, 2, seed, false), false); g.strokeStyle = COVER[role]; g.lineWidth = w; g.stroke(); return; }
      for (let k = 0; k < 2; k++) { path(g, wob(pts, 4, seed + k * 57, false), false); g.strokeStyle = grey(CHAR[role], .7); g.lineWidth = w * (k ? .5 : .8); g.stroke(); }
    },
    blobShape(cx, cy, rx, ry, rot, role, seed) { const pts = [...Array(18)].map((_, i) => { const a = i / 18 * TAU; return [cx + Math.cos(a) * rx * Math.cos(rot) - Math.sin(a) * ry * Math.sin(rot), cy + Math.cos(a) * rx * Math.sin(rot) + Math.sin(a) * ry * Math.cos(rot)]; }); R.shape(pts, role, seed); },
  };

  // ---------- the room ----------
  function room(t, lit) {
    R.shape([[-400, -300], [2400, -300], [2400, 790], [-400, 790]], 'wall', 2);
    // a faded flower pattern on the wallpaper: the flowers that come loose in the dream
    for (let y = -40; y < 760; y += 120) for (let x = -300; x < 2300; x += 140) {
      const ox = x + ((y / 120) % 2) * 70; R.blobShape(ox, y, 13, 9, .6, 'wallDk', ox * 7 + y);
    }
    R.shape([[-400, 790], [2400, 790], [2400, 1500], [-400, 1500]], 'floor', 3);
    for (let i = -10; i < 30; i++) R.mark([[i * 110 - 200, 1500], [i * 110 + 260, 790]], 'board', 4, 40 + i); // the cover's diagonal boards
    // window with moonlight
    R.shape([[150, 150], [530, 150], [530, 540], [150, 540]], 'frame', 5);
    R.shape([[166, 166], [514, 166], [514, 524], [166, 524]], 'window', 6);
    R.shape([[166, 166], [340, 166], [340, 340], [166, 340]], 'windowDk', 7);
    R.mark([[340, 166], [340, 524]], 'frame', 10, 8); R.mark([[166, 345], [514, 345]], 'frame', 10, 9);
    // bed: frame, mattress, blanket, pillow, headboard on the right
    R.shape([[560, 690], [1500, 690], [1500, 760], [560, 760]], 'bed', 10);
    R.mark([[580, 760], [580, 810]], 'bed', 18, 11); R.mark([[1480, 760], [1480, 810]], 'bed', 18, 12);
    R.shape([[1470, 470], [1530, 470], [1530, 790], [1470, 790]], 'bed', 13);
    R.shape([[570, 640], [1470, 640], [1470, 700], [570, 700]], 'sheet', 14);
    R.shape([[570, 660], [1180, 655], [1200, 705], [570, 712]], 'blanket', 15);
    R.blobShape(1395, 622, 74, 26, -.05, 'pillow', 16);
    // bedside table and lamp
    R.shape([[1560, 620], [1720, 620], [1720, 640], [1560, 640]], 'table', 17);
    R.mark([[1575, 640], [1575, 805]], 'table', 12, 18); R.mark([[1705, 640], [1705, 805]], 'table', 12, 19);
    R.mark([[1640, 618], [1640, 520]], 'lamp', 9, 20); R.shape([[1592, 528], [1688, 528], [1668, 462], [1612, 462]], 'shade', 21);
    if (lit > 0 && REAL === 'cover') { ik.save(); ik.globalAlpha = lit; path(ik, [[1608, 528], [1672, 528], [1840, 800], [1440, 800]]); ik.fillStyle = COVER.light; ik.fill(); ik.restore(); }
    if (lit > 0 && REAL === 'charcoal') { ik.save(); ik.globalCompositeOperation = 'lighter'; ik.globalAlpha = lit * .5; ik.fillStyle = rgrad(ik, 1640, 500, 0, 380, [[0, 'rgba(255,250,235,.5)'], [1, 'rgba(255,250,235,0)']]); ik.fillRect(1260, 120, 760, 760); ik.restore(); }
  }

  // ---------- her ----------
  // lie: 0 sitting on the bed edge facing left, 1 lying back with her head on the pillow
  // reach: her near arm out to the lamp switch. eye: 1 open, 0 closed
  function her(t, lie, reach, eye) {
    const hip = [1140, 650];
    const ta = lerp(-1.66, -.09, ease.inOut(lie)); // torso angle
    const neck = [hip[0] + Math.cos(ta) * 210, hip[1] + Math.sin(ta) * 210];
    const fd = ta - Math.PI / 2; // the way her face points
    // legs: thigh along the bed edge; shin hangs, then lifts onto the bed
    const knee = [hip[0] - 165, hip[1] + 8];
    const sa = lerp(Math.PI / 2 - .1, Math.PI - .02, ease.inOut(smooth(inv(.25, .9, lie))));
    const foot = [knee[0] + Math.cos(sa) * 160, knee[1] + Math.sin(sa) * 160];
    R.mark([knee, foot], 'stocking', 26, 30); R.blobShape(foot[0] - 10, foot[1] + 4, 22, 10, sa - Math.PI / 2, 'shoe', 31);
    R.mark([hip, knee], 'skirt', 64, 32);
    // torso: a cardigan, wider at the hip
    const px = Math.cos(ta + Math.PI / 2), py = Math.sin(ta + Math.PI / 2);
    const tor = [[hip[0] + px * 44, hip[1] + py * 44], [neck[0] + px * 34, neck[1] + py * 34], [neck[0] - px * 34, neck[1] - py * 34], [hip[0] - px * 48, hip[1] - py * 48]];
    R.shape(tor, 'cardigan', 33);
    R.mark([[lerp(hip[0], neck[0], .1), lerp(hip[1], neck[1], .1)], [lerp(hip[0], neck[0], .9), lerp(hip[1], neck[1], .9)]], 'cardiganDk', 6, 34);
    // near arm: rests on her lap, then reaches to the lamp, then lies across her
    const sh = [lerp(hip[0], neck[0], .88), lerp(hip[1], neck[1], .88)];
    const lap = [hip[0] - 60, hip[1] - 10], lamp = [1612, 560], across = [lerp(hip[0], neck[0], .45), lerp(hip[1], neck[1], .45) - 30];
    let hand = lie < 1 ? [lerp(lap[0], across[0], lie), lerp(lap[1], across[1], lie)] : across;
    hand = [lerp(hand[0], lamp[0], reach), lerp(hand[1], lamp[1], reach)];
    const el = [(sh[0] + hand[0]) / 2 + 10, (sh[1] + hand[1]) / 2 + 30 * (1 - reach)];
    R.mark([sh, el, hand], 'cardiganDk', 30, 35); R.blobShape(hand[0], hand[1], 13, 10, 0, 'skin', 36);
    // head in profile; hair is a grey bob; the eye opens and closes
    const hc = [neck[0] + Math.cos(ta) * 46, neck[1] + Math.sin(ta) * 46];
    headAt(hc, fd, ta, eye);
    return hc;
  }

  function headAt([cx, cy], fd, ta, eye) {
    const r = 40, P = (lx, ly) => [cx + Math.cos(fd) * lx - Math.cos(ta) * ly * -1 * 0 + Math.cos(ta) * -ly, cy + Math.sin(fd) * lx + Math.sin(ta) * -ly];
    // local frame: +lx toward the nose, +ly toward the crown (along the torso direction)
    const L = (lx, ly) => [cx + Math.cos(fd) * lx + Math.cos(ta) * ly, cy + Math.sin(fd) * lx + Math.sin(ta) * ly];
    // profile facing +lx (toward the ceiling once she lies down); hair sits at the back and the crown only
    const face = [L(-8, -50), L(16, -50), L(32, -36), L(34, -24), L(36, -16), L(50, -2), L(40, 4), L(41, 11), L(38, 16), L(40, 21), L(36, 26), L(33, 36), L(18, 46), L(2, 50), L(-14, 34), L(-16, 0)];
    R.shape(face, 'skin', 50);
    const hair = [L(-58, -14), L(-46, -46), L(-10, -60), L(20, -56), L(30, -44), L(14, -42), L(-4, -34), L(-14, -12), L(-10, 14), L(-22, 40), L(-44, 34), L(-60, 12)];
    R.shape(hair, 'hair', 51);
    R.blobShape(...L(-12, 4), 8, 11, fd, 'skin', 56); // ear
    R.mark([L(18, -30), L(26, -32), L(33, -28)], 'line', 2.5, 57); // brow
    // eye: open = almond and pupil; closed = a lid curve with lashes
    const e = L(25, -18);
    if (eye > .15) { R.blobShape(e[0], e[1], 7 * eye + 2, 4 * eye + 1, fd, 'sheet', 52); R.blobShape(e[0] + Math.cos(fd) * 2, e[1] + Math.sin(fd) * 2, 3 * eye + .5, 3 * eye + .5, 0, 'line', 53); }
    R.mark([L(19, -19 + 2 * (1 - eye)), L(25, -15 + 4 * (1 - eye)), L(31, -18)], 'line', 2.5, 54);
    if (eye < .3) for (let k = 0; k < 3; k++) R.mark([L(21 + k * 4, -14), L(20 + k * 4, -10)], 'line', 1.4, 58 + k);
    R.mark([L(38, 16), L(33, 17)], 'line', 2, 55); // mouth
    void P;
  }

  // ---------- the dream underneath (painted layer) ----------
  function dream(t, k, eyeScreen) {
    // abstract: colour turning round the eye, settling into a round table seen from above
    fill(s, '#1d3c9a');
    const settle = smooth(inv(14.5, T.end, t));
    const [ex, ey] = eyeScreen;
    s.save(); s.setTransform(.5, 0, 0, .5, 0, 0);
    const cols = ['#f2b02a', '#e2552e', '#2e9a7a', '#c85a9a', '#f4e06a', '#3a7ad8', '#e88a3a', '#7ac04a'];
    for (let i = 0; i < 40; i++) {
      const a = i * 2.39 + t * (1.2 - .8 * settle) * (i % 2 ? 1 : -.6), rr = 60 + (i * 37) % 700 * (1 - .6 * settle);
      const x = lerp(ex, 960, settle) + Math.cos(a) * rr * 1.4, y = lerp(ey, 540, settle) + Math.sin(a) * rr * .9;
      ell(s, x, y, 90 + (i % 5) * 30, 40 + (i % 3) * 18, a + 1.6, rgba(cols[i % cols.length], .75));
    }
    // the table arrives: a warm orange disc on blue, white plates
    if (settle > 0) {
      s.globalAlpha = settle; dot(s, 960, 560, 330, '#e0782e'); dot(s, 960, 560, 300, '#f0a040');
      for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + .3; dot(s, 960 + Math.cos(a) * 210, 560 + Math.sin(a) * 210, 52, '#f4f0e0'); dot(s, 960 + Math.cos(a) * 210, 560 + Math.sin(a) * 210, 34, '#dcc8a0'); }
      s.globalAlpha = 1;
      vort(960, 560, 380, .5 * settle);
    }
    s.restore();
    vortScreen(ex, ey, 600, 1.1 * (1 - settle));
    void k;
  }
  function vortScreen(x, y, r, spin) { (PAINT_FRAME.vort ||= []).push([x, y, r, spin]); }

  // the hole in the waking world: grows from her eye with a brushy edge
  function reveal(t, c) {
    const k = ease.in(inv(T.open0, T.open1, t)); if (k <= 0) return;
    const R0 = k * 2600 + 6;
    ik.save(); ik.globalCompositeOperation = 'destination-out';
    const pts = [...Array(36)].map((_, i) => { const a = i / 36 * TAU; const w = 1 + .28 * Math.sin(a * 5 + t * 2) + .18 * Math.sin(a * 11 - t * 3); return [c[0] + Math.cos(a) * R0 * w, c[1] + Math.sin(a) * R0 * w * .8]; });
    smoothPath(ik, pts); ik.fillStyle = '#000'; ik.fill();
    // ragged dabs round the edge, like paint eating into the drawing
    for (let i = 0; i < 80; i++) { const a = i / 80 * TAU + hash(i) * .1; const w = 1 + .28 * Math.sin(a * 5 + t * 2) + .18 * Math.sin(a * 11 - t * 3); const rr = R0 * w * (1.02 + hash(i + 300) * .12);
      ik.globalAlpha = .9; ell(ik, c[0] + Math.cos(a) * rr, c[1] + Math.sin(a) * rr * .8, 26 + 40 * k, 8 + 10 * k, a + Math.PI / 2, '#000'); }
    ik.restore();
  }

  // where her head is for a given lie amount (same geometry as her()), so the camera can aim before drawing
  function headPos(lie) { const ta = lerp(-1.66, -.09, ease.inOut(lie)); return [1140 + Math.cos(ta) * 256, 650 + Math.sin(ta) * 256]; }
  function scene(t) {
    BOIL = REAL === 'charcoal' ? Math.floor(t * 8) : Math.floor(t * 3);
    const lie = smooth(inv(T.lie0, T.lie1, t));
    const reach = smooth(inv(T.reach, T.off, t)) * (1 - smooth(inv(T.off + .1, T.push0 + .6, t)));
    const lit = 1 - smooth(inv(T.off - .05, T.off + .08, t));
    const eye = 1 - smooth(inv(T.close0, T.close1, t)) + .25 * Math.max(0, Math.sin((t - T.close0) * 9)) * (t > T.close0 && t < T.close0 + .9 ? 1 : 0);
    // camera: wide on the room, then a slow push to her face on the pillow
    const z = kf(t, [[0, 1], [T.push0, 1.02], [T.close1, 3.4], [T.end, 3.8]]);
    const HEAD = headPos(smooth(inv(T.lie0, T.lie1, t)));
    const pk = ease.inOut(inv(T.push0, T.close1, t));
    const cx = lerp(lerp(1000, 1060, inv(0, T.push0, t)), HEAD[0] - 20, pk);
    const cy = lerp(lerp(520, 540, inv(0, T.push0, t)), HEAD[1] - 10, pk);
    // paper first, in screen space
    ik.save(); ik.setTransform(1, 0, 0, 1, 0, 0);
    if (REAL === 'cover') { ik.fillStyle = COVER.paper; ik.fillRect(0, 0, W, H); }
    else { ik.drawImage(paper(), 0, 0, W, H); ik.fillStyle = 'rgba(236,230,218,.55)'; ik.fillRect(0, 0, W, H); }
    ik.restore();
    cam(cx, cy, z);
    room(t, lit);
    const hc = her(t, lie, reach, clamp(eye));
    if (lit < 1) { // night: the room drops into moonlight
      ik.save(); ik.setTransform(1, 0, 0, 1, 0, 0); ik.globalCompositeOperation = 'multiply'; ik.globalAlpha = 1 - lit;
      ik.fillStyle = REAL === 'cover' ? '#5d6d9c' : '#a6a6ac'; ik.fillRect(0, 0, W, H); ik.restore();
      ik.save(); ik.globalCompositeOperation = 'screen'; ik.globalAlpha = (1 - lit) * (REAL === 'cover' ? .35 : .3);
      ik.fillStyle = rgrad(ik, hc[0], hc[1], 0, 220, [[0, '#c8d4f0'], [1, 'rgba(200,212,240,0)']]); ik.fillRect(hc[0] - 240, hc[1] - 240, 480, 480); ik.restore();
    }
    if (REAL === 'cover') { // gouache grain over the flat colour
      ik.save(); ik.setTransform(1, 0, 0, 1, 0, 0); ik.globalCompositeOperation = 'multiply'; ik.globalAlpha = .22; ik.drawImage(paper(), 0, 0, W, H); ik.restore();
    }
    // her eye on screen, for the dream to open from
    const L = (lx, ly) => { const ta = lerp(-1.66, -.09, ease.inOut(lie)), fd = ta - Math.PI / 2; return [hc[0] + Math.cos(fd) * lx + Math.cos(ta) * ly, hc[1] + Math.sin(fd) * lx + Math.sin(ta) * ly]; };
    const eW = L(22, -12); const m = ik.getTransform(); const eS = [m.a * eW[0] + m.c * eW[1] + m.e, m.b * eW[0] + m.d * eW[1] + m.f];
    reveal(t, eW);
    dream(t, 0, eS);
  }

  chapter('intro', 0, T.end, [[0, scene]], {
    paint: { ground: .3, groundCol: '#efe2bf', gap: .12, fauve: .75, impasto: .8, light: [.6, -.8], boil: 6, bloom: .7, grain: .03, vig: .14,
      shadowTint: '#4b44a8', hiTint: '#ffe27a', flowK: 1, inkSoft: 0, dash: .5, waveK: 0 },
  });
})();
