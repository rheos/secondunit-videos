// js/ch/roof.js · "her love is the sky and her children are the clouds" (44.92 - 73.29)
// Her rooftop on a washing day, painted like a living Van Gogh: strokes that wrap every form, dark
// blue contours, complementary colour, canvas showing between strokes. Her world, not his paintings.
// Word times are Whisper (up to ~1 s early).
(() => {
  const T = { dream: 44.92, smile: 48.78, love: 54.0, sky: 56.5, kids: 58.32, clouds: 59.96, ok: 63.94, away: 69.5, end: 73.29 };

  const C = {
    skyTop: '#2c5fc4', skyMid: '#3f8fd6', skyLow: '#7cc4d8', skyWarm: '#bfe0c8',
    cloud: '#f6f2e4', cloudSh: '#a9c2e6', cloudLine: '#4a78b8',
    line: '#1d2a5a', // the contour blue
    roof: '#8c7aa8', roofLt: '#b8a6c8', tar: '#5d5288', parapet: '#d8643a', parapetLt: '#f08a4a', brickLine: '#7a2e2a',
    chim: '#c8502e', pot: '#e88a3a', wallO: '#e8b84a', wallL: '#d9a0b8', tile: '#d0542c', shutter: '#3c9a6a', win: '#2a4f8a',
    tree: '#4f9a3a', treeLt: '#9ccb4a', treeDk: '#2a5a3a',
    pole: '#7a4a2a', rope: '#3a2a3a', sheet: '#f4f0e0', sheetSh: '#b8cce0',
    dress: '#e8607a', dressDk: '#a83a5a', apron: '#f2e6c0', scarf: '#9aa0b4', scarfDk: '#5d6680', skin: '#eab48a', skinSh: '#a8a86a', shoe: '#2a2440',
    kid: ['#f2c43a', '#e04a3a', '#3a7ad0'],
  };
  const LINE_Y = 470, POLE_L = 230, POLE_R = 1420;
  const lineY = (x, t) => LINE_Y + 46 * Math.sin(Math.PI * clamp((x - POLE_L) / (POLE_R - POLE_L))) + Math.sin(t * 1.7 + x * .01) * 3;
  const KIDX = [860, 990, 1110];

  // a contour: dark blue line along a path, the way he rings his forms
  function contour(pts, w = 8, closed = true) { stroke(s, closed ? [...pts, pts[0]] : pts, C.line, w); }
  function shape(pts, col, w = 8) { blob(s, pts, col); smoothPath(s, pts); s.strokeStyle = C.line; s.lineWidth = w; s.stroke(); }

  function sky(t, open) {
    s.fillStyle = vgrad(s, -500, 760, [[0, C.skyTop], [.45, C.skyMid], [.8, mixh(C.skyLow, C.skyWarm, open)], [1, C.skyWarm]]);
    s.fillRect(-800, -800, 3600, 1700);
    // soft bands of colour for the strokes to carry: turquoise, cobalt, a little green
    s.save(); s.filter = 'blur(12px)';
    [[-120, '#3a74cc'], [40, '#5ab0d0'], [190, '#2f66c0'], [330, '#6cc0c8'], [470, '#86c8b8']].forEach(([y0, c], i) => {
      const pts = []; for (let x = -800; x <= 2800; x += 50) pts.push([x, y0 + Math.sin(x * .003 + i * 2 + t * .2) * 30]);
      stroke(s, pts, rgba(c, .5), 60);
    });
    s.restore();
    // warm light coming in from the upper right, stronger once she smiles
    s.save(); s.globalAlpha = .25 + .3 * open; s.fillStyle = rgrad(s, 1900, -300, 0, 1500, [[0, '#ffe9a0'], [1, 'rgba(255,233,160,0)']]); s.fillRect(-800, -800, 3600, 1700); s.restore();
    glow(1900, -300, 900, rgba('#fff0b8', .12 + .14 * open));
  }

  function cloud(cx, cy, r, t, seed, k = 1) {
    const pts = []; const n = 14;
    for (let i = 0; i < n; i++) { const a = i / n * TAU, w = 1 + .22 * Math.sin(i * 2.7 + seed) + .06 * Math.sin(t * .9 + i + seed); pts.push([cx + Math.cos(a) * r * 1.5 * w, cy + Math.sin(a) * r * .75 * w - (Math.sin(a) < 0 ? r * .2 : 0)]); }
    s.globalAlpha = k; blob(s, pts, C.cloudSh); blob(s, pts.map(([x, y]) => [cx + (x - cx) * .85 - r * .08, cy + (y - cy) * .8 - r * .1]), C.cloud);
    smoothPath(s, pts); s.strokeStyle = C.cloudLine; s.lineWidth = 7; s.stroke(); s.globalAlpha = 1;
    vort(cx, cy, r * 1.3, seed % 2 ? .45 : -.45);
  }

  function neighbours(t) {
    // back row: trees and other houses, lower and smaller, behind her roof
    [[-200, 640, 130], [140, 610, 110], [1560, 600, 150], [1880, 640, 120]].forEach(([x, y, r], i) => {
      const pts = [...Array(12)].map((_, j) => { const a = j / 12 * TAU, w = 1 + .16 * Math.sin(j * 3 + i); return [x + Math.cos(a) * r * w, y + Math.sin(a) * r * 1.1 * w]; });
      shape(pts, C.tree, 7);
      blob(s, pts.map(([a, b]) => [x + (a - x) * .55 + r * .2, y + (b - y) * .5 - r * .3]), C.treeLt);
      vort(x, y, r * 1.1, i % 2 ? .4 : -.4);
    });
    const houses = [[380, 600, 230, 170, C.wallO], [640, 630, 200, 140, C.wallL], [1240, 615, 240, 160, C.wallO], [1780, 650, 260, 150, C.wallL]];
    houses.forEach(([x, y, w, h, col], i) => {
      const body = [[x - w / 2, y], [x + w / 2, y], [x + w / 2, y + h], [x - w / 2, y + h]];
      poly(s, body, col); contour(body, 7);
      const roofP = [[x - w / 2 - 18, y + 4], [x, y - h * .55], [x + w / 2 + 18, y + 4]];
      poly(s, roofP, C.tile); contour(roofP, 7);
      for (let k = 0; k < 2; k++) { const wx = x - w * .22 + k * w * .44, wy = y + h * .3; const wp = [[wx - 18, wy], [wx + 18, wy], [wx + 18, wy + 36], [wx - 18, wy + 36]]; poly(s, wp, C.win); contour(wp, 5); s.fillStyle = C.shutter; s.fillRect(wx - 30, wy, 10, 36); s.fillRect(wx + 20, wy, 10, 36); }
    });
  }

  function roof(t) {
    // her flat roof, the parapet brick ledge, a chimney
    const top = [[-800, 780], [2800, 780], [2800, 1500], [-800, 1500]];
    poly(s, top, C.roof);
    for (let i = 0; i < 6; i++) { const pts = []; for (let x = -800; x <= 2800; x += 60) pts.push([x, 840 + i * 52 + Math.sin(x * .004 + i) * 6]); stroke(s, pts, rgba(i % 2 ? C.roofLt : C.tar, .55), 22); }
    const par = [[-800, 740], [2800, 740], [2800, 790], [-800, 790]];
    poly(s, par, C.parapet); stroke(s, [[-800, 744], [2800, 744]], C.parapetLt, 12); contour(par, 8);
    for (let x = -780; x < 2800; x += 70) stroke(s, [[x, 750], [x, 788]], rgba(C.brickLine, .7), 4);
    // chimney at the right with two pots
    const ch = [[1560, 560], [1680, 560], [1680, 760], [1560, 760]]; poly(s, ch, C.chim); contour(ch, 8);
    [[1585, 520], [1650, 525]].forEach(([x, y]) => { const p = [[x - 18, y], [x + 18, y], [x + 14, y + 42], [x - 14, y + 42]]; poly(s, p, C.pot); contour(p, 6); });
    // smoke, pulled up by a directed field
    s.save(); s.filter = 'blur(10px)'; const sm = []; for (let i = 0; i < 14; i++) sm.push([1600 + Math.sin(i * .6 + t * 1.2) * 30 + i * 8, 500 - i * 34]); stroke(s, sm, 'rgba(220,226,240,.55)', 36); s.restore();
    dirAt(1630, 330, 200, -Math.PI / 2 - .2);
    // the clothesline poles and the line
    [[POLE_L, 430], [POLE_R, 430]].forEach(([x, y]) => { const p = [[x - 9, y], [x + 9, y], [x + 11, 800], [x - 11, 800]]; poly(s, p, C.pole); contour(p, 6); stroke(s, [[x - 40, y + 10], [x + 40, y + 10]], C.pole, 12); });
    const lp = []; for (let x = POLE_L; x <= POLE_R; x += 20) lp.push([x, lineY(x, t)]); stroke(s, lp, C.rope, 6);
  }

  // the sheet: hangs, then slips loose on "her love is the sky" and billows up into the sky
  function sheet(t) {
    const fly = smooth(inv(T.love - .2, T.sky + 1.4, t)), gone = smooth(inv(T.sky + .4, T.kids + .2, t));
    if (gone >= 1) return;
    const x0 = 330, x1 = 720, h = 260;
    const lift = ease.inOut(fly);
    const dx = lerp(0, 380, lift), dy = lerp(0, -760, lift), billow = 1 + lift * .9;
    const pts = [];
    for (let i = 0; i <= 8; i++) { const u = i / 8, x = lerp(x0, x1, u); pts.push([x * billow - x0 * (billow - 1) + dx + Math.sin(u * 3 + t * 2) * 30 * lift, lineY(x, t) + dy + Math.sin(u * Math.PI) * 40 * lift + Math.sin(t * 3 + u * 5) * 6]); }
    for (let i = 8; i >= 0; i--) { const u = i / 8, x = lerp(x0, x1, u); pts.push([x * billow - x0 * (billow - 1) + dx + Math.sin(u * 4 + t * 2.4) * 50 * lift, lineY(x, t) + h * (1 + .3 * lift) + dy + Math.sin(u * 6 + t * 2.6) * (12 + 50 * lift)]); }
    s.globalAlpha = 1 - gone;
    blob(s, pts, C.sheetSh); blob(s, pts.map(([x, y], i) => [x - 10, y - 8]), C.sheet);
    smoothPath(s, pts); s.strokeStyle = C.cloudLine; s.lineWidth = 7; s.stroke();
    s.globalAlpha = 1;
    if (lift > .05) vort(pts[4][0], pts[4][1] + 100, 260, .6 * lift);
  }

  // a little dress on the line; m = 0 hanging, 1 a cloud child in the sky
  function kid(t, i, m, pos) {
    const col = C.kid[i], R = lerp(46, 92 - i * 10, ease.inOut(m));
    const [x, y] = pos;
    for (const g of [s, mk]) { g.save(); g.translate(x, y); g.rotate(Math.sin(t * 1.6 + i * 2) * (.05 + .06 * m)); }
    // the dress shape stays the body: the cloud grows out of it, keeping a rim of the dress colour
    const hem = R * (.85 + .1 * Math.sin(t * 2 + i));
    const dress = [[-R * .32, -R * .55], [R * .32, -R * .55], [hem, R * .7], [0, R * .78], [-hem, R * .7]];
    const body = mixh(col, C.cloud, m * .85);
    blob(s, dress, body); smoothPath(s, dress); s.strokeStyle = mixh(C.line, C.cloudLine, m); s.lineWidth = 7; s.stroke();
    stroke(s, [[-hem * .9, R * .66], [hem * .9, R * .68]], col, R * .16); // the dress colour stays at the hem
    if (m > .05) {
      s.globalAlpha = smooth(inv(.1, .6, m));
      // arms out to hold hands, legs, a round head with bunches
      stroke(s, [[-R * .3, -R * .4], [-R * 1.1, -R * .1]], C.cloud, R * .2); stroke(s, [[R * .3, -R * .4], [R * 1.1, -R * .1]], C.cloud, R * .2);
      const kick = Math.sin(t * 2.2 + i * 1.7) * R * .08;
      stroke(s, [[-R * .26, R * .7], [-R * .28 - kick, R * 1.1]], C.cloudSh, R * .22); stroke(s, [[R * .26, R * .7], [R * .28 + kick, R * 1.1]], C.cloudSh, R * .22);
      dot(s, 0, -R * .98, R * .42, C.cloudSh); dot(s, -R * .05, -R * 1.02, R * .36, C.cloud);
      dot(s, -R * .44, -R * .95, R * .13, C.cloud); dot(s, R * .42, -R * .93, R * .12, C.cloud);
      s.beginPath(); s.arc(0, -R * .98, R * .42, 0, TAU); s.strokeStyle = C.cloudLine; s.lineWidth = 6; s.stroke();
      s.globalAlpha = 1;
    } else {
      // pegs while it hangs
      stroke(s, [[-R * .25, -R * .62], [-R * .25, -R * .45]], C.pole, 7); stroke(s, [[R * .25, -R * .62], [R * .25, -R * .45]], C.pole, 7);
    }
    blob(mk, dress.map(([a, b]) => [a * 1.15, b * 1.1]), '#fff'); if (m > .05) { dot(mk, 0, -R, R * .55, '#fff'); stroke(mk, [[-R * 1.15, -R * .1], [R * 1.15, -R * .1]], '#fff', R * .3); }
    for (const g of [s, mk]) g.restore();
    if (m > .3) vort(x, y, R * 1.8, (i % 2 ? .5 : -.5) * m);
  }

  function kids(t) {
    const home = [[1020, 280], [1180, 250], [1330, 290]]; // where they hold hands in the sky, above her
    const P = KIDX.map((kx, i) => {
      const m = smooth(inv(T.kids + i * .5, T.clouds + 1.6 + i * .5, t));
      const hang = [kx, lineY(kx, t) + 50];
      const sky = [home[i][0] + Math.sin(t * .7 + i * 2) * 26, home[i][1] + Math.sin(t * 1.1 + i) * 14];
      const arc = Math.sin(m * Math.PI) * -120;
      return { m, p: [lerp(hang[0], sky[0], ease.inOut(m)) + arc * .4 * (i - 1), lerp(hang[1], sky[1], ease.inOut(m)) + arc] };
    });
    // hands: once two neighbours are both up, a wisp joins them
    for (let i = 0; i < 2; i++) {
      const k = Math.min(P[i].m, P[i + 1].m); if (k < .7) continue;
      s.globalAlpha = smooth(inv(.7, 1, k)); stroke(s, [[P[i].p[0] + 60, P[i].p[1] - 8], [P[i + 1].p[0] - 60, P[i + 1].p[1] - 8]], C.cloud, 12); s.globalAlpha = 1;
    }
    P.forEach(({ m, p }, i) => kid(t, i, m, p));
  }

  // her, in profile facing left toward the line: pink dress, cream apron, grey headscarf
  // reach: 0 arms down, 1 up at the line. look: head tipped up to the sky. hold: hands to her chest
  function her(t, x, y, sc, reach, look, hold) {
    for (const g of [s, mk]) { g.save(); g.translate(x, y); g.scale(sc, sc); }
    const sway = Math.sin(t * 1.3) * 3;
    // legs and shoes
    stroke(s, [[-6, -60], [-10, -6]], C.skinSh, 16); stroke(s, [[12, -60], [14, -6]], C.skinSh, 16);
    ell(s, -18, -2, 20, 9, 0, C.shoe); ell(s, 6, 0, 20, 9, 0, C.shoe);
    // dress and apron
    const dress = [[-26, -250], [30, -250], [52, -60], [-50, -56]];
    shape(dress, C.dress, 8);
    poly(s, [[8, -246], [30, -250], [52, -60], [20, -58]], C.dressDk);
    const apron = [[-30, -190], [-6, -196], [-12, -70], [-46, -66]]; shape(apron, C.apron, 6);
    // arm: shoulder to hand, toward the line (up-left) or folded to the chest
    const sh = [-2 + sway * .3, -232];
    const armTo = (k) => {
      const up = [-80, -360], down = [-26, -120], chest = [-20, -200];
      let hnd = [lerp(down[0], up[0], k), lerp(down[1], up[1], k)];
      hnd = [lerp(hnd[0], chest[0], hold), lerp(hnd[1], chest[1], hold)];
      const el = [(sh[0] + hnd[0]) / 2 + 22 - 14 * k, (sh[1] + hnd[1]) / 2 + 14];
      stroke(s, [sh, el, hnd], C.line, 30); stroke(s, [sh, el, hnd], C.dress, 20); dot(s, hnd[0], hnd[1], 11, C.skin);
      stroke(mk, [sh, el, hnd], '#fff', 36);
    };
    armTo(reach * (.85 + .15 * Math.sin(t * 3))); armTo(reach);
    // head in profile, tipping up to the sky; the scarf covers her hair
    s.save(); s.translate(-2, -262); s.rotate(-look * .45);
    const face = [[-16, -40], [-26, -26], [-34, -14], [-28, -10], [-30, 0], [-24, 8], [-14, 14], [4, 10], [10, -30]];
    shape(face, C.skin, 6);
    poly(s, [[0, -36], [10, -30], [4, 10], [-6, 6]], C.skinSh);
    const scarf = [[-20, -46], [10, -60], [34, -40], [36, -6], [22, 18], [6, 8], [10, -24], [-14, -36]];
    shape(scarf, C.scarf, 6); stroke(s, [[18, -40], [26, 4]], C.scarfDk, 6);
    dot(s, -22, -22, 3, C.line); // eye
    s.restore();
    ell(mk, -6, -268, 50, 56, 0, '#fff'); poly(mk, dress.map(([a, b]) => [a * 1.15, b]), '#fff');
    for (const g of [s, mk]) g.restore();
  }

  function scene(t) {
    const open = smooth(inv(T.smile - .3, T.smile + 2.5, t));
    const reach = (1 - smooth(inv(T.smile - .6, T.smile + .6, t))) * (t < T.smile ? .6 + .4 * Math.abs(Math.sin((t - T.dream) * 1.9)) : 1);
    const look = smooth(inv(T.smile - .2, T.smile + 1.4, t)) * (1 - .5 * smooth(inv(T.ok, T.ok + 2.5, t)));
    const reach2 = Math.max(reach, .55 * smooth(inv(T.love, T.love + .8, t)) * (1 - smooth(inv(T.love + 1.4, T.sky + 1.2, t))));
    const hold = smooth(inv(T.ok + .6, T.ok + 2.4, t));
    // camera: on her at the line, tilt up with the sheet and the children, back down to her on "She's OK"
    const cx = kf(t, [[T.dream, 900], [T.smile, 960], [T.love, 960], [T.kids, 1060], [T.clouds + 2, 1100], [T.ok, 1080], [T.end, 1000]]);
    const cy = kf(t, [[T.dream, 600], [T.smile, 560], [T.love, 420], [T.kids, 330], [T.clouds + 2, 320], [T.ok, 380], [T.end, 520]]);
    const z = kf(t, [[T.dream, 1.12], [T.smile, 1.08], [T.love, 1.0], [T.kids, 1.04], [T.ok, 1.06], [T.end, 1.0]]);
    cam(cx, cy, z);
    sky(t, open);
    cloud(260 + t * 6, -20, 120, t, 1); cloud(1500 + t * 4, -160, 150, t, 2); cloud(2050 + t * 5, 90, 110, t, 3);
    neighbours(t);
    roof(t);
    sheet(t);
    kids(t);
    her(t, 1240, 900, 1.15, reach2, look, hold);
    paintSet({ waveK: .3, wave: [.4, .004, .0012, .35], dash: .45 + .2 * open });
  }

  chapter('roof', T.dream, T.end, [[T.dream, scene]], {
    paint: { ground: .35, groundCol: '#efe2bf', gap: .14, fauve: .7, impasto: .8, light: [.6, -.8], boil: 6, bloom: .7, grain: .03, vig: .14,
      shadowTint: '#4b44a8', hiTint: '#ffe27a', flowK: 1, inkSoft: .4 },
  });
})();
