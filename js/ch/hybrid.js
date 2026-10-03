// HYBRID EXPLORATION: Airplane on the Highway, verse 2, song 99.542 - 124.875 (frames 2389 - 2997).
//
// ======================= THE SHARED FINISH (distilled from the album covers) =======================
// What the covers have in common: everything is made by hand and a little off. Cut paper (In Her
// Dream), pencil cross-hatch (Beware of Bob), busy collage (Accidentally Acquired Beliefs), deadpan
// snapshots and a barcode (More Work Songs), a photocopy (It's True), chalk letters (Theme and
// Variations), a pink linocut on dark (The Legend), a sparse line with one red heart (Giulietta Masina),
// a naive painting on torn paper (Real Thing). The rules every look here obeys:
//   GROUND   real paper. Cream stock #efe6d2 with fibre and tooth; every frame is one sheet with a
//            hand-cut, slightly wonky edge on a dark table #29241f. Specks baked into the stock.
//   PALETTE  restrained. Toner black #1d1b1d, graphite #55535a, cream #efe6d2, dusty pink #e2a591,
//            navy ink #2a2541, blue-grey wash #a6c0cb, ochre #e0a548. ONE red accent, #cf2a28,
//            and only on the plane (cheat line, tongue, a wingtip) or one cut letter.
//   LINE     drawn, never vector-clean: gouged and chiselled (wood), scissor-wobbled (paper), or a
//            graphite underdrawing that does not quite match the paint (gouache).
//   TEXTURE  photocopy grit: toner speckle, drum streaks, uneven coverage, plates a hair off
//            register. Motion on twos (12 a second); the print/paper re-pulls on threes.
//   LETTERS  hand-made only, and rare: letters snipped out of paper, a pencil scrawl. Never a font,
//            never subtitles; words only from Bob's sheet ("song", "true").
//   HUMOUR   deadpan. The plane does not mug; he looks at us when something is wrong.
//
// ======================= STRUCTURE =======================
// Three looks, two 5.0 s transition windows (filled later by generated morphs; here a crossfade).
//   99.542 - 106.875  WOODCUT, pulled in navy on pink like The Legend   (f2389 - f2565)
//     A1  99.542  head on, singing; the wings are far wider than the lane and knock the marker posts over
//     A2 103.542  side on at the ANCHOR framing; "something's wrong": eyes dart, then he looks at us
//   106.875 - 111.875  WINDOW 1 (f2565 - f2685): "da da da", wood -> collage, both at the ANCHOR
//   111.875 - 115.750  CUT-OUT COLLAGE, photocopied pieces   (f2685 - f2778)
//     B1 111.875  ANCHOR; on "singing this song" four hand-cut letters S O N G drop onto the sky
//   115.750 - 120.750  WINDOW 2 (f2778 - f2898): the gap after "song", collage -> gouache, ANCHOR
//   120.750 - 124.875  GOUACHE on paper, after Real Thing   (f2898 - f2997)
//     C1 120.750  ANCHOR; "true" scrawled in pencil; the camera tilts up into the sky, where on
//                 "there once were airplanes" three pencil airliners fly over, half painted in
// ANCHOR: side on, plane at (960, 846), scale 1.05, horizon and road at the same heights in all three
// looks, so across each window only the style changes.
(() => {
  const FR = (f) => f / 24;
  const A2 = FR(2485), W1 = [FR(2565), FR(2685)], W2 = [FR(2778), FR(2898)];
  const AX = 960, AY = 846, AK = 1.05;
  const VS = 700;                                         // side-on world scroll, px per second (all looks)
  const scrollAt = (T) => (T - 99) * VS;
  const ROAD = [712, 930], DASH_Y = 822, POLE_SP = 760, POLE_H = 300;

  window.frameState = (t) => {
    if (t < W1[0]) return { a: 'wood' };
    if (t < W1[1]) return { a: 'wood', b: 'cut', k: ease.sine((t - W1[0]) / (W1[1] - W1[0])) };
    if (t < W2[0]) return { a: 'cut' };
    if (t < W2[1]) return { a: 'cut', b: 'gouache', k: ease.sine((t - W2[0]) / (W2[1] - W2[0])) };
    return { a: 'gouache' };
  };

  // ======================= the plane's performance (shared by all looks) =======================
  const BLINKS = [100.9, 102.8, 108.4, 110.6, 113.2, 117.6, 119.9, 122.1];
  const GHOSTS = [[122.80, .7, 150], [123.30, .45, 30], [123.75, .55, -60]];  // start, scale, height
  function pose(T) {
    const st = { t: T, open: clamp((F('voc', T, 1) - .1) / .4), bob: beatPulse(T, 7) * 8, roll: T * 5.2, spin: T * TAU * 2.3, look: [.6, .1], brow: [0, 0],
      lid: Math.max(0, ...BLINKS.map((b) => tri(T - b, .09))) };
    if (T < A2) { st.look = [kf(T, [[99.5, -.3], [101.5, .25], [103, -.2]]), .25]; }
    if (T >= 103.7 && T < 106.1) { const d = [[-.7, -.2], [.8, -.1], [-.2, -.8], [.7, .35]][Math.floor((T - 103.7) / .34) % 4]; st.look = d; st.brow = [.6, -1]; st.lid = Math.max(st.lid, .04); }
    if (T >= 106.1 && T < 108.0) { st.look = [-.12, .3]; st.brow = [1, 0]; st.lid = Math.max(st.lid, .14); }   // "wrong": at us, deadpan
    if (T >= 113.75 && T < 116.2) { st.look = [.05, -.95]; st.brow = [.6, 0]; }                                // up at the letters
    if (T >= 121.5) { const u = smooth(inv(121.5, 122.1, T)); st.look = [lerp(.6, .45, u), lerp(.1, -1, u)]; st.brow = [.9 * u, 0]; }
    if (T >= 123.0) { const gx = ghostX(GHOSTS[0], T); st.look = [clamp((gx - 1000) / 600, -1, 1), -1]; }
    return st;
  }
  function ghostX(g, T) { return -500 + (T - g[0]) * 820 * (.8 + g[1] * .3); }

  // ======================= WOODCUT =======================
  // three flat values; the shader prints black as navy, white as pink stock, red as red
  function carvedSky(T, y0, y1, scroll, seed, wTop = 6, wBot = 1.5) {
    for (let y = y0, r = 0; y < y1; y += 30, r++) {
      const w = lerp(wTop, wBot, (y - y0) / (y1 - y0)), g = rng(seed + r * 31), PER = 2400, off = wrap(scroll * (.5 + .5 * g()) + g() * PER, PER);
      const dashes = []; for (let x = 0; x < PER;) { const l = 60 + g() * 220, gp = 60 + g() * 160; dashes.push([x, l]); x += l + gp; }
      for (const rep of [-PER, 0, PER]) for (const [dx, l] of dashes) {
        const x = dx - off + rep; if (x > W + 50 || x + l < -50) continue;
        const pts = []; for (let k = 0; k <= 6; k++) { const xx = x + l * k / 6; pts.push([xx, y + Math.sin(xx * .006 + r) * 5]); }
        taper(pts.slice(0, 4), .5, w, CUT); taper(pts.slice(3), w, .5, CUT);
      }
    }
  }
  function woodSun(T, x, y, r) {
    s.beginPath(); s.arc(x, y, r, 0, TAU); s.lineWidth = 10; s.strokeStyle = CUT; s.stroke();
    for (let i = 0; i < 18; i++) { const a = i / 18 * TAU + T * .2, l = i % 2 ? r * .45 : r * .75; taper([[x + Math.cos(a) * r * 1.2, y + Math.sin(a) * r * 1.2], [x + Math.cos(a) * (r * 1.2 + l), y + Math.sin(a) * (r * 1.2 + l)]], 12, 1, CUT); }
    for (let i = 0; i < 3; i++) { s.beginPath(); s.arc(x, y, r * (.7 - i * .2), .3 + i, 2.6 + i); s.lineWidth = 4; s.strokeStyle = CUT; s.stroke(); }
  }
  function woodHills(T, base, scroll, seed) {
    const hy = (x) => base - 90 + 40 * Math.sin((x + scroll) * .0042 + seed) + 22 * Math.sin((x + scroll) * .011 + seed * 2);
    const pts = []; for (let x = -60; x <= W + 60; x += 20) pts.push([x, hy(x)]);
    taper(pts, 6, 6, CUT);
    for (let j = 0; j < 4; j++) for (let x = -60 - wrap(scroll, 40); x < W + 60; x += 40) { const y = hy(x + 20) + 22 + j * 22; flick(x + (j % 2) * 20, y, -.5, 18, 4.5); flick(x + (j % 2) * 20 + 14, y - 8, .5, 18, 4.5); }
  }
  function woodPoles(T, scroll) {
    const xs = []; for (let x = -POLE_SP - wrap(scroll, POLE_SP); x < W + POLE_SP; x += POLE_SP) xs.push(x + 300);
    for (let i = 0; i < xs.length - 1; i++) for (const dy of [0, 22]) { const a = [xs[i] + 40, ROAD[0] - POLE_H + 18 + dy], b = [xs[i + 1] - 40, ROAD[0] - POLE_H + 18 + dy]; s.beginPath(); s.moveTo(...a); s.quadraticCurveTo((a[0] + b[0]) / 2, a[1] + 55, ...b); s.lineWidth = 3; s.strokeStyle = CUT; s.stroke(); }
    for (const x of xs) { taper([[x, ROAD[0]], [x, ROAD[0] - POLE_H]], 12, 8, CUT); taper([[x - 48, ROAD[0] - POLE_H + 22], [x + 48, ROAD[0] - POLE_H + 22]], 9, 9, CUT); }
  }
  function woodSide(T) {
    const sc = scrollAt(T);
    s.fillStyle = INK; s.fillRect(-50, -50, W + 100, H + 100);
    carvedSky(T, 50, 560, sc * .04, 101);
    woodSun(T, 1530, 215, 78);
    woodHills(T, 650, sc * .12, 3);
    woodPoles(T, sc);
    taper([[-50, ROAD[0] + 8], [W + 50, ROAD[0] + 10]], 6, 6, CUT); taper([[-50, ROAD[1] - 8], [W + 50, ROAD[1] - 10]], 6, 6, CUT);
    for (let x = -wrap(sc, 150) - 150; x < W + 150; x += 150) flick(x, DASH_Y, 0, 90, 12);
    const g = rng(7); for (let i = 0; i < 22; i++) { const x = wrap(g() * 2600 - sc, 2600) - 300, y = lerp(ROAD[0] + 24, ROAD[1] - 24, g()); flick(x, y, 0, 40 + g() * 60, 3); }
    for (let j = 0; j < 4; j++) for (let x = -wrap(sc, 46) - 46; x < W + 46; x += 46) { const y = ROAD[1] + 36 + j * 34, xx = x + (j % 2) * 23; flick(xx, y, -1.9, 26, 5.5); flick(xx + 6, y, -1.25, 26, 5.5); }
    PLANE.side(WoodPen, AX, AY, AK, pose(T));
  }
  // head on, a perspective highway; the wings overhang the road and clip the marker posts
  const VPX = 960, VPY = 500, FOC = 900, CH = 1.6, RW = 1.5, ZP = 3.6, POST_X = 2.2, POST_SP = 3.2, SPD = 7;
  const gy = (z) => VPY + FOC * CH / z, gx = (X, z) => VPX + FOC * X / z;
  function woodFront(T) {
    s.fillStyle = INK; s.fillRect(-50, -50, W + 100, H + 100);
    carvedSky(T, 40, VPY - 40, T * 30, 303, 6, 1.5);
    woodSun(T, 1560, 190, 62);
    // distant hills on the horizon
    const hp = []; for (let x = -40; x <= W + 40; x += 24) hp.push([x, VPY - 18 - 26 * Math.abs(Math.sin(x * .004 + 1)) - 12 * Math.sin(x * .013)]);
    taper(hp, 5, 5, CUT);
    taper([[-40, VPY], [W + 40, VPY]], 3, 3, CUT);
    const off = T * SPD;
    // verge grass flicks in perspective
    for (let i = 0; i < 40; i++) { const z = 1 + wrap(i * .9 - off, 36); for (const sd of [-1, 1]) { const X = sd * (RW + .45 + hash(i * 7 + (sd > 0)) * 2.5); const x = gx(X, z), y = gy(z), sz = 140 / z; flick(x, y, -1.9, sz, sz * .2); flick(x + sz * .2, y, -1.25, sz, sz * .2); } }
    // road edges and the dashed centre line
    for (const sd of [-1, 1]) { const pts = []; for (let z = .9; z < 60; z *= 1.25) pts.push([gx(sd * RW, z), gy(z)]); taper(pts, 22, 1, CUT); }
    for (let i = 0; i < 30; i++) { const z0 = .7 + wrap(i * 2.4 - off, 72); const z1 = z0 + 1.1; if (z0 > 60) continue;
      const P = [[gx(-.07, z0), gy(z0)], [gx(.07, z0), gy(z0)], [gx(.07, z1), gy(z1)], [gx(-.07, z1), gy(z1)]]; pathOn(s, P); s.fillStyle = CUT; s.fill(); }
    // marker posts: behind the plane upright, in front of it knocked flying by the wings
    const posts = []; for (let i = 0; i < 24; i++) { const z = .6 + wrap(i * POST_SP - off, 24 * POST_SP); for (const sd of [-1, 1]) posts.push([z, sd, i]); }
    posts.sort((a, b) => b[0] - a[0]);
    const drawPost = ([z, sd, i]) => {
      const x = gx(sd * POST_X, z), y = gy(z), u = FOC / z;
      let ang = 0, lift = 0, dx = 0;
      if (z < ZP) { const h = (ZP - z) / SPD; ang = sd * Math.min(2.6, h * 9); lift = -u * Math.sin(Math.min(Math.PI, h * 3.2)) * .5; dx = sd * u * h * 1.4; }
      withT(() => { s.translate(x + dx, y + lift); s.rotate(ang); const w = u * .09, hgt = u * .95;
        pathOn(s, [[-w / 2, 0], [w / 2, 0], [w / 2, -hgt], [-w / 2, -hgt]]); s.fillStyle = CUT; s.fill();
        s.fillStyle = RED; s.fillRect(-w / 2, -hgt * .86, w, hgt * .16); s.lineWidth = Math.max(1, u * .012); s.strokeStyle = INK; s.strokeRect(-w / 2, -hgt, w, hgt); });
      if (z < ZP && z > ZP - .9) { const h = (ZP - z); for (let q = 0; q < 6; q++) { const a = q / 6 * TAU, rr = 40 + h * 260; flick(x + Math.cos(a) * rr, y - FOC / ZP * .85 + Math.sin(a) * rr * .6, a, 50 * (1 - h), 8 * (1 - h)); } }
    };
    posts.filter((p) => p[0] >= ZP).forEach(drawPost);
    const k = kf(T, [[99.54, 1.2], [103.54, 1.36]], ease.inOut);
    const st = pose(T); st.look = [st.look[0] * .6, .25];
    // he glances at each post as it goes under a wing
    PLANE.front(WoodPen, VPX, gy(ZP), k, st);
    posts.filter((p) => p[0] < ZP).forEach(drawPost);
  }

  // ======================= CUT-OUT COLLAGE =======================
  function strip(T, y0, y1, role, scroll, seed, topWob = 10, per = 1400, botWob = 0) {
    // a long torn/cut strip of photocopied paper, scrolling with its own texture
    s.save(); s.translate(-wrap(scroll, per), 0);
    for (let rep = 0; rep < Math.ceil(W / per) + 2; rep++) {
      const x0 = rep * per - 20, x1 = (rep + 1) * per + 20, r = rng(seed + rep * 0), P = [];
      for (let x = x0; x <= x1; x += 40) P.push([x, y0 + Math.sin(x * .004 + seed) * topWob + (hash(Math.floor(wrap(x, per) / 40) + seed * 97) - .5) * 4]);
      for (let x = x1; x >= x0; x -= 60) P.push([x, y1 + (botWob ? Math.sin(x * .007) * botWob : 0)]);
      CutPen.fill(P, role, { seed: seed + rep, seg: 999, amt: 0, shadow: .6, rim: 0 });
    }
    s.restore();
  }
  function cutCloud(x, y, sc, seed) {
    const r = rng(seed), P = []; const n = 16;
    for (let i = 0; i < n; i++) { const a = Math.PI + i / (n - 1) * Math.PI, bump = .75 + .35 * Math.abs(Math.sin(i * 1.7 + seed)); P.push([x + Math.cos(a) * 180 * sc, y + Math.sin(a) * 80 * sc * bump - (i % 3 === 1 ? 18 * sc : 0)]); }
    P.push([x + 190 * sc, y + 30 * sc], [x - 190 * sc, y + 30 * sc]);
    CutPen.fill(P, 'white', { seed, smooth: true, shadow: .7 });
  }
  function cutSide(T, letters = true) {
    const sc = scrollAt(T);
    s.fillStyle = sheet('cream'); s.fillRect(-50, -50, W + 100, H + 100);
    CutPen.fill([[-30, -30], [W + 30, -30], [W + 30, 600], [-30, 610]], 'sky', { seed: 501, amt: 6, seg: 40, shadow: .4, rim: 0 });
    CutPen.fill(circPts(1530, 215, 78, 78, 30), 'ochre', { seed: 502, smooth: true });
    for (let i = 0; i < 3; i++) cutCloud(wrap(300 + i * 760 - sc * .03, W + 700) - 300, 150 + (i * 90) % 170, .8 + .2 * (i % 2), 520 + i);
    strip(T, 600, ROAD[0] + 6, 'green', sc * .12, 530, 34, 1500);
    // telegraph poles, paper strips; wires in marker
    const xs = []; for (let x = -POLE_SP - wrap(sc, POLE_SP); x < W + POLE_SP; x += POLE_SP) xs.push(x + 300);
    for (let i = 0; i < xs.length - 1; i++) for (const dy of [0, 22]) CutPen.line(quadPts([xs[i] + 40, ROAD[0] - POLE_H + 18 + dy], [(xs[i] + xs[i + 1]) / 2, ROAD[0] - POLE_H + 74 + dy], [xs[i + 1] - 40, ROAD[0] - POLE_H + 18 + dy], 10), 2.5, 'dark', { seed: i });
    xs.forEach((x, i) => { const id = Math.round((x - 300 + sc) / POLE_SP);
      CutPen.fill([[x - 7, ROAD[0] + 4], [x + 7, ROAD[0] + 4], [x + 5, ROAD[0] - POLE_H], [x - 5, ROAD[0] - POLE_H]], 'grey', { seed: 540 + id, amt: 3, shadow: .5, rim: 2 });
      CutPen.fill([[x - 50, ROAD[0] - POLE_H + 16], [x + 50, ROAD[0] - POLE_H + 14], [x + 50, ROAD[0] - POLE_H + 28], [x - 50, ROAD[0] - POLE_H + 30]], 'grey', { seed: 560 + id, amt: 3, shadow: .5, rim: 2 }); });
    strip(T, ROAD[0], ROAD[1], 'road', sc, 570, 2, 1600);
    s.save(); s.translate(-wrap(sc, 150), 0);
    for (let x = -150; x < W + 300; x += 150) { const id = Math.round((x + Math.floor(sc / 150) * 150) / 150); CutPen.fill([[x, DASH_Y - 7], [x + 88, DASH_Y - 8], [x + 90, DASH_Y + 7], [x + 2, DASH_Y + 8]], 'white', { seed: 600 + wrap(id, 50), amt: 3, shadow: .4, rim: 0 }); }
    s.restore();
    strip(T, ROAD[1] - 4, H + 40, 'pink', sc, 610, 6, 1300);
    PLANE.side(CutPen, AX, AY, AK, pose(T));
    if (letters) cutLetters(T);
  }
  // S O N G, snipped out of four different stocks, dropped onto the sky as he sings it
  const GLYPH = {
    S: [[80, 28], [58, 10], [26, 14], [14, 40], [34, 62], [70, 78], [86, 104], [72, 130], [36, 136], [12, 116]],
    O: circPts(50, 72, 36, 58, 22),
    N: [[18, 136], [18, 10], [82, 136], [82, 10]],
    G: [...arcPts(52, 72, 38, 60, -.55, -TAU + .45, 20), [92, 86], [62, 86]],
  };
  const LETTERS = [['S', 113.90, 640, 262, -.08, 'toner'], ['O', 114.18, 800, 236, .06, 'red'], ['N', 114.53, 975, 270, -.04, 'pink'], ['G', 114.85, 1140, 244, .1, 'toner']];
  function cutLetters(T) {
    for (const [ch, t0, x, y, rot, stock] of LETTERS) {
      if (T < t0) continue;
      const u = clamp((T - t0) / .28), e = ease.out(u), wob = Math.sin((T - t0) * 22) * .25 * (1 - u);
      const yy = y - 420 * (1 - e), r = rot + (1 - e) * .9 * (ch === 'O' ? -1 : 1) + wob, sc = 1.25;
      withT(() => { s.translate(x + 50 * sc, yy + 70 * sc); s.rotate(r); s.scale(sc, sc); s.translate(-50, -70);
        const P = GLYPH[ch], closed = ch === 'O';
        s.save(); s.shadowColor = 'rgba(28,20,12,.45)'; s.shadowBlur = 6 * RS; s.shadowOffsetX = 7 * RS * (1 + (1 - e) * 3); s.shadowOffsetY = 9 * RS * (1 + (1 - e) * 3);
        pathOn(s, P, false, closed); s.lineWidth = 36; s.lineJoin = 'bevel'; s.lineCap = 'butt'; s.strokeStyle = '#f7f2e6'; s.stroke(); s.restore();
        pathOn(s, P, false, closed); s.lineWidth = 29; s.lineJoin = 'bevel'; s.lineCap = 'butt'; s.strokeStyle = sheet(stock); s.stroke(); });
    }
  }

  // ======================= GOUACHE =======================
  const GOPT = { strokeK: .55, gap: .32, impasto: .04, fauve: .08, ground: .22, groundCol: '#efe6d2', boil: 4, grain: .02, vig: 0, bloom: 0, flowK: .7, inkSoft: .7, shadowTint: '#55535a', hiTint: '#f6f0e2' };
  function gReset() {
    const S = Gouache.sctx, Fx = Gouache.fctx, I = Gouache.ictx, M = Gouache.mctx;
    for (const g of [S, Fx, M]) { g.setTransform(.5, 0, 0, .5, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none'; }
    I.setTransform(1, 0, 0, 1, 0, 0); I.globalAlpha = 1; I.globalCompositeOperation = 'source-over'; I.clearRect(0, 0, W, H);
    S.fillStyle = '#efe6d2'; S.fillRect(-100, -100, W + 200, H + 200); Fx.fillStyle = '#000'; Fx.fillRect(-100, -100, W + 200, H + 200); M.fillStyle = '#000'; M.fillRect(-100, -100, W + 200, H + 200);
  }
  function gCloud(x, y, sc, seed) {   // a Real Thing cloud: a dark grey brush loop, half a scribble
    const S = Gouache.sctx, P = [];
    for (let i = 0; i <= 30; i++) { const a = Math.PI * .95 - i / 30 * Math.PI * 2.15; const rr = 1 + .25 * Math.sin(i * .9 + seed); P.push([x + Math.cos(a) * 170 * sc * rr + i * 6 * sc, y + Math.sin(a) * 62 * sc * rr]); }
    pathOn(S, P, false, false); S.lineWidth = 30 * sc; S.lineCap = 'round'; S.lineJoin = 'round'; S.strokeStyle = '#5c5f66'; S.stroke();
    GouachePen.pencil(P, false, false, seed, 1.6, .35);
  }
  function gGhost(T, g) {   // a pencil airliner seen from below as it flies over, half painted in; wings level and wide
    const x = ghostX(g, T), y = g[2], k = g[1];
    if (x < -700 || x > W + 700) return;
    const S = Gouache.sctx, I = Gouache.ictx, M = Gouache.mctx, wash = 'rgba(244,238,224,.88)';
    for (const c of [S, I, M]) { c.save(); c.translate(x, y); c.rotate(-.04); c.scale(k, k); }
    const body = [[310, 0], [290, -26], [200, -38], [-240, -30], [-330, -10], [-330, 10], [-240, 30], [200, 38], [290, 26]];
    const wing = [[90, -40], [60, -340], [10, -340], [-50, -40], [-50, 40], [10, 340], [60, 340], [90, 40]];
    const tail = [[-235, -28], [-262, -125], [-300, -125], [-300, 125], [-262, 125], [-235, 28]];
    for (const P of [wing, tail, body]) { pathOn(S, P); S.fillStyle = wash; S.fill(); }
    for (const [i, P] of [wing, tail, body].entries()) GouachePen.pencil(P, false, true, 700 + i + g[2], 3.4, .8);
    for (const ey of [-120, -225, 120, 225]) { const N = [[140, ey - 18], [140, ey + 18], [30, ey + 16], [30, ey - 16]]; pathOn(S, N); S.fillStyle = '#d9d3c6'; S.fill(); GouachePen.pencil(N, false, true, 720 + ey, 2.8, .75);
      GouachePen.pencil(circPts(150, ey, 8, 62, 16), false, true, 740 + ey, 2, .5); }
    for (let i = 0; i < 12; i++) GouachePen.pencil([[-200 + i * 36, 30], [-180 + i * 36, -28]], false, false, 760 + i, 1.6, .45);   // hatching, as in the sketchbook cover
    for (const c of [S, I, M]) c.restore();
  }
  function gWriteTrue(T, x, y, k) {   // "true", scrawled in pencil, written on stroke by stroke
    const strokes = [[[10, 0], [10, 60], [20, 70]], [[0, 22], [24, 20]], [[34, 26], [34, 70]], [[34, 42], [44, 28], [56, 28]], [[64, 27], [64, 60], [72, 70], [84, 64], [86, 27], [86, 70]], [[96, 48], [120, 48], [117, 32], [106, 26], [96, 34], [95, 58], [106, 70], [121, 66]]];
    const u = clamp((T - 121.3) / .6) * strokes.length;
    strokes.forEach((p, i) => { const f = clamp(u - i); if (f <= 0) return; const n = Math.max(2, Math.ceil(p.length * f)); const q = p.slice(0, n).map(([a, b]) => [x + a * k, y + b * k]);
      GouachePen.pencil(q, false, false, 800 + i, 2.6, .8); });
  }
  function gouacheScene(T) {
    const S = Gouache.sctx, sc = scrollAt(T);
    const up = kf(T, [[121.6, 0], [123.3, 300]], ease.inOut);
    TX(GouachePen, 0, up, 1, 0, () => {
      { const gr = S.createLinearGradient(0, -700, 0, 700); gr.addColorStop(0, '#8fb0c0'); gr.addColorStop(1, '#b6ccd2'); S.fillStyle = gr; } S.fillRect(-100, -800, W + 200, 800 + ROAD[0]);
      for (let i = 0; i < 6; i++) gCloud(wrap(180 + i * 520 - sc * .025, W + 900) - 400, [-520, 130, -260, 310, -60, -640][i], .9 + .25 * (i % 3), 900 + i);
      gWriteTrue(T, 1400, -240, 1.4);
      // grey mountains, after the cover
      const m = [[-100, ROAD[0] - 20], [180, 520], [420, 600], [700, 470], [1000, 590], [1320, 500], [1620, 580], [1820, 520], [2050, ROAD[0] - 20]];
      const mm = m.map(([x, y]) => [x - wrap(sc * .06, 400) + 200, y]);
      pathOn(S, [...mm, [2100, ROAD[0]], [-200, ROAD[0]]]); S.fillStyle = '#7b7d84'; S.fill();
      GouachePen.pencil(mm, false, false, 950, 2, .5);
      // verge strip under the mountains
      S.fillStyle = '#9da889'; S.fillRect(-100, 640, W + 200, ROAD[0] - 640);
      // poles
      const xs = []; for (let x = -POLE_SP - wrap(sc, POLE_SP); x < W + POLE_SP; x += POLE_SP) xs.push(x + 300);
      for (let i = 0; i < xs.length - 1; i++) for (const dy of [0, 22]) GouachePen.pencil(quadPts([xs[i] + 40, ROAD[0] - POLE_H + 18 + dy], [(xs[i] + xs[i + 1]) / 2, ROAD[0] - POLE_H + 74 + dy], [xs[i + 1] - 40, ROAD[0] - POLE_H + 18 + dy], 10), false, false, 960 + i, 1.8, .55);
      for (const x of xs) { GouachePen.line([[x, ROAD[0] + 2], [x, ROAD[0] - POLE_H]], 13, '#5d5752', { seed: 970 }); GouachePen.line([[x - 48, ROAD[0] - POLE_H + 22], [x + 48, ROAD[0] - POLE_H + 22]], 9, '#5d5752', { seed: 971 }); }
      // road and verge
      S.fillStyle = '#8d8a88'; S.fillRect(-100, ROAD[0], W + 200, ROAD[1] - ROAD[0]);
      for (let x = -wrap(sc, 150) - 150; x < W + 150; x += 150) { S.fillStyle = '#efe6d2'; S.fillRect(x, DASH_Y - 7, 88, 14); }
      GouachePen.pencil([[-50, ROAD[0] + 3], [W + 50, ROAD[0] + 1]], false, false, 980, 2, .5);
      GouachePen.pencil([[-50, ROAD[1] - 2], [W + 50, ROAD[1]]], false, false, 981, 2, .5);
      S.fillStyle = '#c6ad74'; S.fillRect(-100, ROAD[1], W + 200, H + 400 - ROAD[1]);
      for (const g of GHOSTS) gGhost(T, g);
      PLANE.side(GouachePen, AX, AY, AK, pose(T));
    });
  }

  // ======================= the three looks =======================
  window.LOOKS = {
    wood(t) { const T = step(t); fx({ wood: 1 }); if (T < A2) woodFront(T); else woodSide(T); },
    cut(t) { const T = step(t); fx({ toner: 1 }); cutSide(T); },
    gouache(t) { const T = step(t); fx({ gch: 1 }); gReset(); gouacheScene(T); Gouache.present(t, GOPT); s.save(); s.setTransform(RS, 0, 0, RS, 0, 0); s.drawImage(gcv, 0, 0, W, H); s.restore(); },
  };
})();
