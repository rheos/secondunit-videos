// js/ch/verse3.js · VERSE 3 (song 170.0 - 190.0)
// Still stuck on the highway; he does not fly yet. Weary, longing, the most painterly beat in the
// song: a long drive behind a slow car, a quick tour of everything the highway has (billboard,
// diner, motel, the same billboard again), the doo-doos as a playful painted beat with wipers and
// bouncing, a top-down jam on strip fields, then the close-up where he wonders about his wing,
// lifts it, a gust lifts his tyres for a moment, he settles back and looks up at birds and a
// contrail. No text anywhere (the billboard carries a picture, the signs carry shapes and bulbs).
//
// Same Fauvist palette and brush as js/ch/flight.js (pigments listed there), shifted toward late
// afternoon: the low sky warms to a lemon-orange glow (#f7d27a) behind violet hills (#8f7cc4).
// Fixes over the take-off test:
//   - fields are long strips (side view) or long rectangles along the road (top-down), not a grid;
//   - side views use layered hills with a crisp skyline, so there is no hazy perspective band;
//   - plane rig v2: the near engine hangs under the wing, so its propeller spins below the belly line;
//   - painted ink eyes (warm-to-lilac white, soft pupil, uneven ultramarine contour) + inkSoft edges;
//   - sky strokes run long and horizontal (flowBias .75, flowK .4): no swirl.
(() => {
  const BRUSH = { boil: 6, strokeK: 1.3, flowK: .4, flowBias: .75, flowAng: 0, ground: .6, gap: .16, fauve: .7, impasto: .9, grain: .035, vig: .2, bloom: .8, inkSoft: .8 };

  // sung cues: word starts snapped to vocal onsets (FEAT.vonsets / the Demucs vocal stem)
  const CUE = { sick: 171.47, tired: 172.30, driving: 173.33, ive: 174.28, seen: 175.60, highway: 177.0, brings: 177.27,
    sick2: 180.37, tired2: 181.13, driving2: 182.30, wondering: 183.47, why: 184.0, wings: 184.70, wingsEnd: 186.4, thump: 186.90, ive2: 188.82 };
  const DOO = [178.10, 178.40, 178.65, 178.92, 179.20];                     // from the vocal stem
  const sing = (t) => clamp(F('voc', t, 1) * 1.15 - .08);
  const blinkAt = (t, t0, d = .15) => { const u = (t - t0) / d; return u < 0 || u > 2 ? 0 : (u < 1 ? u : 2 - u); };
  const SKY = [[0, PG.ultra], [.3, PG.cobalt], [.68, PG.cerulean], [.9, '#f2e2a4'], [1, '#f7d27a']];

  // ---------------------------------------------------------------- the roadside, side on (parallax layers)
  const STRIP = [[PG.green, 5], [PG.sap, 4], [PG.viridian, 2], [PG.lemon, 2.2], [PG.ochre, 2], ['#efd9a4', 1], [PG.rose, .5], [PG.violet, .5], [PG.orange, .5]];
  const SW_ = STRIP.reduce((a, b) => a + b[1], 0);
  const stripCol = (n, b) => { let r = hash2(n, b, 3) * SW_; for (const [c, w] of STRIP) { r -= w; if (r <= 0) return c; } return PG.green; };
  function ridgeAt(g, y, amp, freq, off, seed, col, bottom = H + 400) {
    g.beginPath(); g.moveTo(-300, bottom);
    for (let x = -300; x <= W + 300; x += 14) { const u = (x + off) * freq; g.lineTo(x, y - noise1(u, seed) * amp - noise1(u * 3.3, seed + 5) * amp * .25); }
    g.lineTo(W + 300, bottom); g.closePath(); g.fillStyle = col; g.fill();
  }
  function roadside(t, D, o = {}) {
    const { hor = 520, roadTop = 770, roadBot = 905, sights = [], sun: sunP = [300, 230], cars = [] } = o;
    s.fillStyle = vgrad(s, -200, hor + 40, SKY); s.fillRect(-400, -400, W + 800, hor + 460);
    sun(sunP[0], sunP[1], 40, .8);
    for (let k = 0; k < 5; k++) { const x = ((k * 520 + 200 - D * .03) % 2600 + 2600) % 2600 - 350; cumulus(x, hor - 230 - (k % 3) * 70, 70 + (k % 2) * 40, 120 + k, { under: '#c9bfe6', top: '#fbf1dc', hi: '#ffe9a8' }); }
    ridgeAt(s, hor + 10, 90, .0016, D * .05, 3, '#8f7cc4');                                // far violet hills
    ridgeAt(s, hor + 60, 70, .0024, D * .12, 7, '#3f8a72');                                // nearer green hills
    for (let x = -100; x < W + 100; x += 46) { const u = (x + D * .12) * .0024, y = hor + 60 - noise1(u, 7) * 70 - noise1(u * 3.3, 12) * 17.5; if (hash(Math.floor((x + D * .12) / 46) * 13) < .5) { dot(s, x, y - 8, 16, PG.viridian); dot(s, x - 5, y - 13, 8, PG.green); } }
    // field strips: three bands, nearer ones scroll faster; long patches with hedgerows between
    const bands = [[hor + 70, hor + 120, .2], [hor + 115, (hor + roadTop) / 2 + 30, .32], [(hor + roadTop) / 2 + 25, roadTop - 14, .48]];
    bands.forEach(([y0, y1, k], b) => {
      const off = D * k; let n = Math.floor((-300 + off) / 260), x = n * 260 - off;
      // patches of varying length: walk segments of 1-3 units
      while (x < W + 300) {
        const len = 260 * (1 + Math.floor(hash2(n, b, 9) * 3)), col = stripCol(n, b), x2 = x + len;
        const wob = (xx) => Math.sin((xx + off) * .004 + b) * 8;
        s.beginPath(); s.moveTo(x, y0 + wob(x)); s.lineTo(x2, y0 + wob(x2)); s.lineTo(x2 + (y1 - y0) * .25, y1); s.lineTo(x + (y1 - y0) * .25, y1); s.closePath(); s.fillStyle = col; s.fill();
        if (b > 0) { s.save(); s.clip(); s.strokeStyle = mixc(col, PG.indigo, .12); s.lineWidth = 3 + b * 2; s.beginPath(); for (let yy = y0 + 14; yy < y1; yy += 12 + b * 6) { s.moveTo(x - 20, yy); s.lineTo(x2 + 80, yy + 4); } s.stroke(); s.restore(); }
        stroke(s, [[x2, y0 + wob(x2)], [x2 + (y1 - y0) * .25, y1]], PG.hedge, 4 + b * 3);
        n += Math.round(len / 260); x = x2;
      }
      stroke(s, [[-300, y1], [W + 300, y1]], PG.hedge, 5 + b * 3);
      for (let xx = -100; xx < W + 100; xx += 70 + b * 30) { const id = Math.floor((xx + off) / (70 + b * 30)); if (hash(id * 7 + b) < .35) { const tx = xx - ((off) % (70 + b * 30)), r = 12 + b * 9; dot(s, tx + r * .3, y1 - r * .6, r, mixh(PG.viridian, PG.indigo, .3)); dot(s, tx, y1 - r, r, PG.viridian); dot(s, tx - r * .3, y1 - r * 1.3, r * .5, PG.green); } }
    });
    for (const sg of sights) sg.draw(sg.x - D * .7, roadTop - 6, sg.sc || 1, t);
    // telegraph poles and wires
    const PP = 560, po = D * .75; let first = Math.floor((-200 + po) / PP);
    for (let n = first; n * PP - po < W + 200; n++) {
      const x = n * PP - po, x2 = x + PP;
      stroke(s, [[x, roadTop - 4], [x, roadTop - 330]], '#5b4a7a', 12); stroke(s, [[x - 40, roadTop - 310], [x + 40, roadTop - 310]], '#5b4a7a', 9);
      for (const dx of [-34, 34]) { const pts = []; for (let k = 0; k <= 12; k++) { const u = k / 12; pts.push([x + dx + u * PP, roadTop - 318 + Math.sin(u * Math.PI) * 38]); } stroke(s, pts, '#3a3468', 3); }
    }
    // the road: violet asphalt, lemon centre dashes
    s.fillStyle = vgrad(s, roadTop, roadBot, [[0, '#7d72a8'], [1, '#5f5590']]); s.fillRect(-400, roadTop, W + 800, roadBot - roadTop);
    stroke(s, [[-400, roadTop + 3], [W + 400, roadTop + 3]], '#c9bfe0', 6);
    const dm = (roadTop + roadBot) / 2 - 4; for (let x = -((D % 240) + 240); x < W + 240; x += 240) poly(s, [[x, dm - 5], [x + 120, dm - 5], [x + 120, dm + 5], [x, dm + 5]], PG.lemon);
    for (const c of cars) car(c[0], c[1], c[2], c[3], t);
    // verge
    s.fillStyle = vgrad(s, roadBot, H + 300, [[0, PG.sap], [1, PG.viridian]]); s.fillRect(-400, roadBot, W + 800, H + 600);
    stroke(s, [[-400, roadBot], [W + 400, roadBot]], '#c9bfe0', 5);
    for (let n = Math.floor(D * 1.25 / 60) - 2; n * 60 - D * 1.25 < W + 100; n++) { const x = n * 60 - D * 1.25, y = roadBot + 30 + hash(n * 3) * (H - roadBot); stroke(s, [[x, y + 26], [x + 10, y - 6]], hash(n * 5) < .5 ? PG.green : '#4f9a46', 9); if (hash(n * 11) < .18) dot(s, x + 12, y - 8, 7, hash(n) < .5 ? PG.lemon : PG.rose); }
  }
  // a side-on car (driving right), x,y = middle of its wheels on the road
  function car(x, y, sc, col, t) {
    s.save(); s.translate(x, y); s.scale(sc, sc);
    blob(s, [[-150, -30], [-140, -80], [-60, -86], [-30, -140], [70, -140], [110, -86], [160, -76], [168, -30]], col);
    blob(s, [[-20, -128], [60, -128], [92, -88], [-44, -88]], PG.cerulean);
    contour(s, [[-150, -30], [-140, -80], [-60, -86], [-30, -140], [70, -140], [110, -86], [160, -76], [168, -30]], 9);
    for (const wx of [-90, 110]) { dot(s, wx, -14, 34, '#3a3468'); dot(s, wx, -14, 15, PG.ochre); }
    dot(s, -146, -58, 9, PG.vermilion); glow(x - 146 * sc, y - 58 * sc, 40 * sc, 'rgba(255,90,60,.5)');
    s.restore();
  }

  // ---- roadside sights (no letters anywhere). Buildings take a straight-edged contour.
  function pc(pts, w) { s.beginPath(); pts.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y)); s.closePath(); s.lineJoin = 'round'; s.lineWidth = w; s.strokeStyle = PG.ultra; s.stroke(); }
  function billboard(x, y, sc) {
    s.save(); s.translate(x, y); s.scale(sc, sc);
    s.translate(0, 90);
    for (const px of [-170, 170]) stroke(s, [[px, -90], [px, -330]], '#5b4a7a', 18);
    poly(s, [[-280, -600], [280, -600], [280, -320], [-280, -320]], '#fbf1dc');
    s.fillStyle = vgrad(s, -585, -335, [[0, PG.cobalt], [1, PG.cerulean]]); s.fillRect(-265, -585, 530, 250);
    dot(s, 170, -530, 34, PG.lemon); ridgeLocal(-265, 265, -380, PG.green);
    // the picture: a little red plane up in the sky
    s.save(); s.translate(-40, -480); s.rotate(-.15); blob(s, [[-80, -6], [-60, -24], [60, -24], [86, -6], [60, 14], [-60, 14]], PG.vermilion); poly(s, [[-14, -4], [20, -4], [-8, 46], [-30, 46]], PG.yellow); poly(s, [[-70, -14], [-92, -50], [-74, -50], [-56, -14]], PG.yellow); s.restore();
    pc([[-280, -600], [280, -600], [280, -320], [-280, -320]], 10);
    s.restore();
  }
  function ridgeLocal(x0, x1, y, col) { s.beginPath(); s.moveTo(x0, -335); for (let x = x0; x <= x1; x += 20) s.lineTo(x, y + Math.sin(x * .02) * 18); s.lineTo(x1, -335); s.closePath(); s.fillStyle = col; s.fill(); }
  function diner(x, y, sc, t) {
    s.save(); s.translate(x, y); s.scale(sc, sc);
    poly(s, [[-330, 0], [330, 0], [330, -210], [-330, -210]], '#f3c7cf');
    blob(s, [[-360, -200], [-300, -270], [300, -270], [360, -200]], '#b7b0de');
    stroke(s, [[-330, -60], [330, -60]], PG.rose, 26);
    for (let i = 0; i < 6; i++) { const wx = -280 + i * 95; poly(s, [[wx, -180], [wx + 70, -180], [wx + 70, -90], [wx, -90]], '#ffd98a'); }
    poly(s, [[230, 0], [290, 0], [290, -120], [230, -120]], PG.cobalt);
    pc([[-330, 0], [330, 0], [330, -210], [-330, -210]], 9);
    // the sign: a coffee cup on a pole, steam rising, neon around it
    stroke(s, [[-420, 0], [-420, -360]], '#5b4a7a', 16);
    const cx = -420, cy = -450;
    poly(s, [[cx - 90, cy - 70], [cx + 90, cy - 70], [cx + 64, cy + 70], [cx - 64, cy + 70]], PG.white);
    s.lineWidth = 22; s.strokeStyle = PG.white; s.beginPath(); s.arc(cx + 98, cy - 4, 40, -1.4, 1.4); s.stroke();
    ell(s, cx, cy + 80, 130, 20, 0, PG.white); ell(s, cx, cy - 70, 90, 16, 0, '#7a4a2a');
    for (let k = 0; k < 3; k++) { const pts = []; for (let i = 0; i <= 10; i++) pts.push([cx - 40 + k * 40 + Math.sin(i * .9 + t * 6 + k) * 12, cy - 100 - i * 14]); stroke(s, pts, '#fbf1dc', 9); }
    const on = .6 + .4 * (Math.floor(t * 4) % 2);
    for (const [a, b] of [[[cx - 90, cy - 70], [cx - 64, cy + 70]], [[cx + 90, cy - 70], [cx + 64, cy + 70]], [[cx - 64, cy + 70], [cx + 64, cy + 70]]]) { const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; glow(x + m[0] * sc, y + m[1] * sc, 120 * sc, `rgba(255,110,170,${.35 * on})`); }
    s.restore();
  }
  function motel(x, y, sc, t) {
    s.save(); s.translate(x, y); s.scale(sc, sc);
    poly(s, [[-470, 0], [470, 0], [470, -170], [-470, -170]], PG.ochre);
    poly(s, [[-500, -165], [500, -165], [470, -215], [-470, -215]], PG.orange);
    const dc = [PG.cobalt, PG.vermilion, PG.viridian, PG.rose];
    for (let i = 0; i < 8; i++) { const dx = -420 + i * 110; poly(s, [[dx, 0], [dx + 52, 0], [dx + 52, -120], [dx, -120]], dc[i % 4]); dot(s, dx + 80, -80, 14, '#ffe49a'); }
    pc([[-470, 0], [470, 0], [470, -170], [-470, -170]], 9);
    // the arrow sign with chasing bulbs and a star on top
    stroke(s, [[560, 0], [560, -560]], '#5b4a7a', 18);
    const AR = [[470, -760], [650, -760], [650, -560], [700, -560], [560, -430], [420, -560], [470, -560]];
    poly(s, AR, PG.vermilion); pc(AR, 10);
    for (let i = 0; i < 9; i++) { const by = -740 + i * 30, lit = (Math.floor(t * 10) + i) % 3 === 0; dot(s, 560, by, 9, lit ? '#fff3b0' : '#c98a2c'); if (lit) glow(x + 560 * sc, y + by * sc, 40 * sc, 'rgba(255,230,140,.6)'); }
    const st = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 26 : 62; st.push([560 + Math.cos(a) * r, -830 + Math.sin(a) * r]); }
    poly(s, st, PG.lemon); glow(x + 560 * sc, y - 830 * sc, 140 * sc, 'rgba(255,230,120,.5)');
    s.restore();
  }

  // ---------------------------------------------------------------- S1 · the long weary drive, stuck behind a slow car
  function drive(t, lt, dur) {
    const u = lt / dur, D = 330 * lt + 400;
    const z = lerp(1, 1.1, ease.sine(u));
    cam(lerp(900, 860, u), 600, z, 0);
    const lane = 860, sc = .78;
    const sigh = hit(t, CUE.tired, 3);
    roadside(t, D, { cars: [[1500 + Math.sin(lt * .7) * 18, lane, .8, PG.cobalt]] });
    const py = lane - 192 * sc + Math.abs(Math.sin(t * 9)) * 2 + sigh * 6;
    planeSide(700, py, sc, .015 * Math.sin(lt * 1.1), { v2: true, t, roll: D / (38 * sc), spin: t * 30, look: kf(t, [[170, [.85, .2]], [CUE.tired, [.85, .2]], [CUE.tired + .4, [.4, .55]], [173.9, [.9, .15]]]),
      lid: .32 + sigh * .3 + blinkAt(t, 171.0) * .6, smile: -.25, open: sing(t) * .55, sq: sigh * .07 });
  }

  // ---------------------------------------------------------------- S2 · everything the highway brings (a quick tour)
  function tourShot(sight, again) {
    return function tour(t, lt, dur) {
      const u = lt / dur, sx = lerp(1700, 500, u);
      const D = (2000 - sx) / .7;
      cam(900, 560, 1.3, 0);
      roadside(t, D, { sights: [{ x: 2000, sc: sight === motel ? .78 : .95, draw: sight }], hor: 560, roadTop: 800, roadBot: 930 });
      const sc = .82, py = 865 - 192 * sc + Math.abs(Math.sin(t * 9)) * 2;
      let look = [1, -.35], lid = .25;
      if (again) { look = kf(t, [[177.03, [1, -.35]], [CUE.brings - .05, [.9, -.4]], [CUE.brings + .2, [0, -1]], [CUE.brings + .45, [-.9, -.4]], [178.06, [-.6, .3]]]); lid = .2 + inv(CUE.brings + .3, CUE.brings + .6, t) * .3; }
      planeSide(520, py, sc, 0, { v2: true, t, roll: D * 1 / (38 * sc), spin: t * 30, look, lid, smile: again ? -.35 : -.1, open: sing(t) * .55 });
      const w = 1 - inv(0, .14, lt); if (w > 0) whip(-60 * w, 0);
    };
  }

  // ---------------------------------------------------------------- S3 · doo doo doo: head on, a playful painted beat
  const WEDGE = [PG.lemon, PG.green, PG.rose, PG.viridian, PG.orange, PG.sap, PG.violet, PG.ochre];
  function doo(t, lt, dur) {
    let k = -1; for (let i = 0; i < DOO.length; i++) if (t >= DOO[i]) k = i;
    const hp = k >= 0 ? hit(t, DOO[k], 9) : 0;
    const VX = 960, VY = 430;
    s.fillStyle = vgrad(s, -100, VY, SKY); s.fillRect(-300, -300, W + 600, VY + 300);
    ridgeAt(s, VY + 6, 60, .002, 0, 21, '#8f7cc4');
    // fields radiating from the vanishing point (Hockney's roads), colours stepping on each doo
    const n = 8;
    for (let side of [-1, 1]) for (let i = 0; i < n; i++) {
      const a0 = i / n, a1 = (i + 1) / n, ang = (a) => side * (Math.PI * .02 + a * Math.PI * .46);
      const P = (a, r) => [VX + Math.sin(ang(a)) * r * 1.9, VY + Math.cos(ang(a)) * r];
      poly(s, [[VX + side * 60, VY], P(a0, 2200), P(a1, 2200)], WEDGE[(i + (side > 0 ? 3 : 0) + Math.max(0, k + 1)) % WEDGE.length]);
      stroke(s, [[VX + side * 60, VY], P(a1, 2200)], PG.hedge, 6);
    }
    poly(s, [[VX - 40, VY], [VX + 40, VY], [VX + 900, H + 40], [VX - 900, H + 40]], '#6f6599');
    for (let i = 0; i < 7; i++) { const u = ((i / 7 + t * .9) % 1), d0 = Math.pow(u, 2.2), d1 = Math.pow(Math.min(1, u + .05), 2.2); poly(s, [[VX - 4 - 14 * d0, VY + d0 * 650], [VX + 4 + 14 * d0, VY + d0 * 650], [VX + 4 + 14 * d1, VY + d1 * 650], [VX - 4 - 14 * d1, VY + d1 * 650]], PG.lemon); }
    // paint dabs popping out on each doo
    if (k >= 0) { const R = rng(k * 71 + 5), pu = ease.out(inv(DOO[k], DOO[k] + .3, t)); for (let i = 0; i < 14; i++) { const a = R() * TAU, r0 = 300 + R() * 200; dot(s, 960 + Math.cos(a) * r0 * 1.6 * (1 + pu * .6), 520 + Math.sin(a) * r0 * .8 * (1 + pu * .6), 40 * (1 - pu * .5) * (k >= 0 ? 1 : 0), [PG.lemon, PG.rose, PG.cerulean, PG.white, PG.orange][i % 5]); } }
    const wiper = k < 0 ? -1 : (k % 2 ? 1 : -1) * lerp(-1, 1, ease.inOut(inv(DOO[k], DOO[k] + .2, t)));
    const hop = k >= 0 ? Math.sin(clamp((t - DOO[k]) / .24) * Math.PI) * 26 : 0;
    planeFront(960, 640 - hop, 1.45, .03 * Math.sin(t * 7), { v2: true, ground: true, t, spin: t * 6 + (k + 1) * 2.1 + hp * 3, wiper, sq: hp * .1, look: [Math.sin(t * 8) * .3, .1], lid: 0, smile: .6, open: hp * .5 + sing(t) * .2 });
    paintSet({ boil: 6 + hp * 10 });
  }

  // ---------------------------------------------------------------- S4 · top-down: the jam, his wings too wide for the road
  function topCar(x, y, col, sc = 1) {
    s.save(); s.translate(x, y); s.scale(sc, sc);
    blob(s, [[-40, -80], [40, -80], [44, 70], [-44, 70]], col); blob(s, [[-32, -48], [32, -48], [30, -14], [-30, -14]], PG.ultra);
    blob(s, [[-30, 30], [30, 30], [28, 52], [-28, 52]], PG.ultra); contour(s, [[-40, -80], [40, -80], [44, 70], [-44, 70]], 7);
    s.restore();
  }
  function jam(t, lt, dur) {
    const u = lt / dur, crawl = 30 * lt;
    cam(1000, 540, lerp(1.12, .9, ease.inOut(u)), lerp(.1, -.06, ease.inOut(u)));
    // long strips running alongside the road
    const strips = [[-1600, -1150], [-1150, -820], [-820, -560], [-560, -340], [340, 560], [560, 860], [860, 1250], [1250, 1700]];
    strips.forEach(([a, b], i) => {
      const SEG = 900 + hash(i * 3) * 700;
      for (let n = -3; n < 4; n++) {
        const y0 = n * SEG + (crawl % SEG) - 200, col = stripCol(n + 9, i + 20);
        poly(s, [[960 + a, y0], [960 + b, y0], [960 + b, y0 + SEG], [960 + a, y0 + SEG]], col);
        s.save(); s.beginPath(); s.rect(960 + a, y0, b - a, SEG); s.clip(); s.strokeStyle = mixc(col, PG.indigo, .12); s.lineWidth = 6; s.beginPath(); for (let xx = a + 20; xx < b; xx += 26) { s.moveTo(960 + xx, y0); s.lineTo(960 + xx, y0 + SEG); } s.stroke(); s.restore();
        stroke(s, [[960 + a, y0], [960 + b, y0]], PG.hedge, 9);
      }
      stroke(s, [[960 + b, -2000], [960 + b, 3000]], PG.hedge, 10);
      for (let n = -8; n < 14; n++) { const ty = n * 210 + (crawl % 210); if (hash(n * 7 + i * 31) < .4) { dot(s, 960 + b + 8, ty + 10, 30, mixh(PG.viridian, PG.indigo, .35)); dot(s, 960 + b, ty, 30, PG.viridian); dot(s, 960 + b - 9, ty - 9, 14, PG.green); } }
    });
    poly(s, [[960 - 340, -2000], [960 + 340, -2000], [960 + 340, 3000], [960 - 340, 3000]], '#6f6599');
    for (const lx of [-170, 170]) for (let n = -10; n < 14; n++) { const y = n * 180 + ((lx < 0 ? 900 * lt : crawl) % 180); poly(s, [[960 + lx - 5, y], [960 + lx + 5, y], [960 + lx + 5, y + 90], [960 + lx - 5, y + 90]], '#e9e1f2'); }
    stroke(s, [[960 - 6, -2000], [960 - 6, 3000]], PG.lemon, 8); stroke(s, [[960 + 6, -2000], [960 + 6, 3000]], PG.lemon, 8);
    // oncoming lanes flow freely
    const cc = [PG.cobalt, PG.lemon, PG.white, PG.rose, PG.cerulean, PG.orange];
    for (let n = -6; n < 6; n++) for (const ln of [-250, -90]) { const y = n * 520 + ln * 3 + ((900 * lt + hash(n * 5 + ln) * 300) % 520); s.save(); s.translate(960 + ln, y); s.rotate(Math.PI); topCar(0, 0, cc[(n + 7 + (ln < -100 ? 2 : 0)) % cc.length]); s.restore(); }
    // his lanes: bumper to bumper
    for (const [ln, ys] of [[90, [-260, 60, 1080, 1390]], [250, [-300, 20, 1060, 1380]]]) ys.forEach((y0, i) => topCar(960 + ln, y0 - crawl + Math.sin(t * 2 + i) * 4, cc[(i * 2 + (ln > 200 ? 1 : 0)) % cc.length]));
    planeTop(1130, 600 - crawl * .2, .72, 0, { t, spin: t * 5, look: kf(t, [[179.3, [0, -.8]], [CUE.tired2, [0, -.8]], [CUE.tired2 + .3, [.3, -.4]], [182.6, [-.2, -.9]]]) });
  }

  // ---------------------------------------------------------------- S5 · wondering why he's got these wings
  function birds(t, x0, y0, n, sz, vx) {
    for (let i = 0; i < n; i++) {
      const row = i === 0 ? 0 : Math.ceil(i / 2), side = i % 2 ? -1 : 1;
      const x = x0 + vx * t - row * sz * 2.8, y = y0 + (i ? side * row * sz * 1.6 : 0), fl = Math.sin(t * 9 + i) * .6;
      for (const [g, w] of [[s, sz * .32]]) stroke(g, [[x - sz, y - sz * .35 * fl], [x - sz * .45, y - sz * .45 - sz * .2 * fl], [x, y], [x + sz * .45, y - sz * .45 - sz * .2 * fl], [x + sz, y - sz * .35 * fl]], PG.indigo, w);
    }
  }
  function wings(t, lt, dur) {
    const D = 140 * lt + 2600;
    const lift = Math.max(ease.back(inv(CUE.wings, CUE.wings + .5, t)) * 1.05 * (1 - inv(186.9, 187.6, t) * .8), 0);
    const rise = ease.out(inv(185.55, 186.25, t)) * (1 - ease.in(inv(186.55, CUE.thump, t)));
    const thump = hit(t, CUE.thump, 7);
    cam(960 + lt * 6, 560 + thump * 8 * Math.sin(t * 60), lerp(1, 1.06, lt / dur), 0);
    roadside(t, D, { hor: 470, roadTop: 905, roadBot: 1040, sun: [1560, 170] });
    // birds and a contrail he will look up at
    if (t > 186.8) birds(t - 186.8, 1150, 220, 5, 40, 240);
    // the gust: streaks of air and petals blowing past
    const gust = inv(185.3, 185.6, t) * (1 - inv(186.4, 186.9, t));
    if (gust > 0) { const R = rng(91); for (let i = 0; i < 26; i++) { const y = 150 + R() * 800, sp = 1400 + R() * 900, x = ((R() * 2200 - (t - 185.3) * sp) % 2400 + 2400) % 2400 - 200; stroke(s, [[x, y], [x + 160 + R() * 160, y + 6]], R() < .5 ? '#fbf1dc' : PG.lilac, 9 * gust); if (i % 3 === 0) dot(s, x - 20, y + 10, 14 * gust, i % 2 ? PG.rose : PG.lemon); } }
    const sc = 1.5, py = 975 - 192 * sc - rise * 130 + thump * 10;
    const look = kf(t, [[183.1, [.8, .2]], [CUE.wondering, [.8, .2]], [CUE.wondering + .35, [-.95, .75]], [CUE.wings + .6, [-.95, .6]], [185.6, [.3, -.6]], [186.5, [.5, .1]], [CUE.thump + .2, [.6, .3]], [187.3, [.6, .3]], [187.9, [.35, -.95]]]);
    planeSide(840, py, sc, .03 * inv(CUE.why, CUE.why + .3, t) * (1 - inv(185.3, 185.6, t)) - rise * .05, { v2: true, t, roll: D / (38 * sc) * (1 - rise), spin: t * (8 + gust * 30), look,
      lid: rise > .2 ? 0 : .12 + blinkAt(t, 183.2) * .85, smile: rise > .1 ? .1 : (t > 187.3 ? .3 : -.1), open: Math.max(sing(t) * .5, rise * .55), wingLift: lift, swing: [Math.sin(t * 6) * .2 * rise, Math.sin(t * 6 + 1) * .2 * rise], sq: thump * .12 });
  }

  // ---------------------------------------------------------------- S6 · he looks up: birds and a contrail, "I've got to know"
  function lookup(t, lt, dur) {
    const u = lt / dur;
    cam(960, lerp(560, 500, ease.sine(u)), 1, -.04);
    s.fillStyle = vgrad(s, -300, H + 100, [[0, PG.ultra], [.45, PG.cobalt], [.85, PG.cerulean], [1, '#f2e2a4']]); s.fillRect(-400, -400, W + 800, H + 800);
    // the contrail: a long white stroke with a tiny silver plane at its head, really flying
    const hx = lerp(380, 1500, u * .55 + .2), hy = lerp(330, 170, u * .55 + .2);
    for (let k = 0; k < 3; k++) stroke(s, [[hx - 1500, hy + 420 + k * 6], [hx - 30, hy + k * 4]], k ? 'rgba(251,241,220,.8)' : '#fbf1dc', 22 - k * 6);
    s.save(); s.translate(hx, hy); s.rotate(-.27); blob(s, [[-34, -6], [30, -8], [40, 0], [30, 8], [-34, 6]], '#e9e6f4'); stroke(s, [[-6, 0], [-18, 26]], '#e9e6f4', 9); s.restore(); glow(hx, hy, 50, 'rgba(255,250,230,.6)');
    birds(lt, 520, 640, 5, 52, 260);
    ridgeAt(s, 1010, 50, .002, 0, 31, '#3f8a72');
    const sc = .8;
    planeSide(1380, 900, sc, -.2, { v2: true, t, spin: t * 8, look: [.45, -1], lid: 0, smile: .25, open: sing(t) * .6, roll: 0 });
  }

  chapter('verse3', 170.0, 190.0, [
    [170.0, drive, { paint: { strokeK: 1.3 } }],
    [174.30, tourShot(billboard, false), { paint: { strokeK: 1.25 } }],
    [175.40, tourShot(diner, false), { paint: { strokeK: 1.25 } }],
    [176.50, tourShot(motel, false), { paint: { strokeK: 1.25 } }],
    [177.03, tourShot(billboard, true), { paint: { strokeK: 1.25 } }],
    [178.06, doo, { paint: { strokeK: 1.35 } }],
    [179.30, jam, { paint: { strokeK: 1.15, flowBias: .55, flowAng: Math.PI / 2 } }],
    [183.10, wings, { paint: { strokeK: 1.45 } }],
    [188.53, lookup, { paint: { strokeK: 1.4, flowAng: -.25 } }],
  ], { paint: BRUSH });
})();
