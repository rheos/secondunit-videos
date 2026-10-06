// p6a-outro: FINAL INSTRUMENTAL part 1 (187.0 - 230.4), recomposed for the 9:16 page (wood-9x16.html, 1080 x 1920).
// Same beats and hit times as js/wch/w6-outro.js, re-staged for the tall frame (docs/PORTRAIT_BUILD.md). The 16:9
// master file is untouched. Bob's draft-7 notes for this stretch: the house fills with the bus kids and the blues
// greats, who approve; the acrobatics; the guitar becomes a pogo stick; the kids dance with her on stage; the
// harmonica crashes down and the school bus pushes it away. The bus kids CRY THE WHOLE TIME, even dancing (draft-9).
//
// Portrait staging: the house is a tall raked fan of rows climbing the frame (few seats a row, many rows, opera
// boxes stacked up the side walls); the stage is a tall proscenium (side legs, valance near the top, the fly loft
// above it) so the flips and the pogo bounces go UP the frame and the camera rides up into the loft with her.
(() => {
  const B = FEAT.beats, CX = W / 2;
  const bk = (c = INK) => shape(() => { s.beginPath(); s.rect(-60, -60, W + 120, H + 120); }, c);
  const rect = (x, y, w, h) => () => { s.beginPath(); s.rect(x, y, w, h); };
  const ell = (x, y, rx, ry, a = 0) => () => { s.beginPath(); s.ellipse(x, y, rx, ry, a, 0, TAU); };
  const tw = (t) => onTwos(t);
  const cam = (fx, fy, z, fn) => withT(() => { s.translate(W / 2, H / 2); s.scale(z, z); s.translate(-fx, -fy); fn(); });
  // harmonica phrases (source/harmonica-band.json + Robin's list): the wind lives inside them
  const HP = [[186.0, 189.4], [196.0, 200.2], [210.0, 215.6], [223.7, 224.9], [232.0, 236.2]];
  const harm = (t) => { let m = 0; for (const [a, b] of HP) m = Math.max(m, smooth(inv(a - .4, a + .3, t)) * (1 - smooth(inv(b - .3, b + .5, t)))); return m; };
  const snapBeat = (t) => { const i = lastBeat(t); return B[Math.min(B.length - 1, i + 1)]; };
  const flight = (u) => Math.sin(Math.PI * clamp(u));

  // a carved piece with a CUT edge round it, so its black hair reads against the dark house
  function piece(n, x, y, h, o = {}, ow = 4) {
    withT(() => { s.filter = 'brightness(0) invert(1)'; for (let i = 0; i < 8; i++) { const a = i * TAU / 8; put(n, x + Math.cos(a) * ow, y + Math.sin(a) * ow, h, o); } });
    put(n, x, y, h, o);
  }

  // ---------- ordinary people, kids and musicians in the seats (as 16:9) ----------
  function patron(x, y, k, seed, o = {}) {           // origin = top centre of the seat back
    const r = rng(seed * 7 + 3), v = Math.floor(r() * 6), glasses = r() > .7, cheer = o.cheer || 0;
    withT(() => { s.translate(x, y); s.scale(k, k); s.rotate((r() - .5) * .1);
      if (cheer > .05) for (const sd of [-1, 1]) {
        const up = cheer * (.75 + .25 * Math.sin(tw(o.t || 0) * 8 + seed));
        taper([[sd * 56, 10], [sd * 76, -40 * up], [sd * (30 + 20 * (1 - up)), -110 * up - 10]], 22, 16, INK);
        shape(ell(sd * (30 + 20 * (1 - up)), -110 * up - 18, 12, 15), CUT, 3);
      }
      const sh = () => pathOf(chisel([[-58, -6], [58, -6], [70, 130], [-70, 130]], seed, 3));
      shape(sh, INK, 5, CUT);
      clipTo(sh, () => { if (v % 2) rows(-70, -6, 70, 130, .5, 18, () => 3.5, CUT); else taper([[0, -6], [0, 130]], 5, 5, CUT); });
      shape(rect(-11, -22, 22, 20), CUT, 4);
      shape(ell(0, -46, 27, 32), CUT, 5);
      dot(-10, -50, 3.6, INK); dot(10, -50, 3.6, INK);
      if (cheer > .05) shape(ell(0, -32, 7, 6), INK); else taper([[-8, -31], [8, -31]], 3, 3);
      if (glasses) { for (const sd of [-1, 1]) { s.beginPath(); s.arc(sd * 10, -50, 8, 0, TAU); s.lineWidth = 3; s.strokeStyle = INK; s.stroke(); } }
      if (v === 0) { shape(ell(0, -72, 46, 9), INK); shape(rect(-24, -104, 48, 32), INK); taper([[-24, -78], [24, -78]], 4, 4, CUT); }
      else if (v === 1) shape(() => { s.beginPath(); s.ellipse(0, -56, 31, 30, 0, Math.PI * 1.02, -.02); s.lineTo(30, -40); s.lineTo(25, -60); s.lineTo(-25, -60); s.lineTo(-30, -40); s.closePath(); }, INK);
      else if (v === 2) { taper([[-20, -74], [0, -79], [20, -74]], 3, 3); }
      else if (v === 3) { shape(() => { s.beginPath(); s.ellipse(0, -60, 29, 20, 0, Math.PI, 0); }, INK); dot(0, -86, 13, INK); }
      else if (v === 4) { shape(() => { s.beginPath(); s.ellipse(0, -62, 29, 19, 0, Math.PI, 0); }, INK); shape(() => pathOf([[0, -64], [44, -60], [40, -54], [0, -58]]), INK); }
      else { const rr = rng(seed); for (let i = 0; i < 11; i++) { const a = Math.PI + i * Math.PI / 10; dot(Math.cos(a) * 28, -50 + Math.sin(a) * 30, 9 + rr() * 3, INK); } }
    });
  }
  function musician(x, y, k, seed, o = {}) {
    const r = rng(seed * 13 + 5), kind = Math.floor(r() * 3);
    if (kind === 0) withT(() => { s.translate(x, y); s.scale(k, k);
      taper([[40, 120], [-80, -130]], 18, 14, INK); taper([[40, 120], [-80, -130]], 4, 3, CUT); shape(() => pathOf([[-74, -128], [-96, -170], [-110, -160], [-86, -122]]), INK, 3, CUT); });
    patron(x, y, k, seed + 101, o);
    if (kind === 1) withT(() => { s.translate(x, y); s.scale(k, k); taper([[0, -30], [56, -26]], 8, 8, INK); shape(ell(66, -26, 12, 22), CUT, 4); });
    else if (kind === 2) withT(() => { s.translate(x, y); s.scale(k, k);
      taper([[-30, 0], [-62, -120]], 7, 4, CUT); taper([[30, 0], [62, -120]], 7, 4, CUT); dot(-62, -120, 6, CUT); dot(62, -120, 6, CUT); });
  }
  // a school-bus kid at the show: arms that go up, can tumble, and STILL crying the whole time (Bob, draft-9 notes:
  // 'when they dance with her at the end, maybe they still should be crying at the same time. sort of Southpark')
  function happyKid(x, y, k, o = {}) {
    const { seed = 1, t = 0, up = 0, roll = 0, spin = 1 } = o;
    withT(() => { s.translate(x, y); if (roll) { s.translate(0, -110 * k); s.rotate(roll); s.translate(0, 110 * k); }
      s.scale(Math.abs(spin) < .12 ? .12 * Math.sign(spin || 1) : spin, 1); s.scale(k, k);
      for (const sd of [-1, 1]) {
        const ax = sd * (40 + 34 * up), ay = lerp(-40, -250, up), mx = sd * (52 + 10 * up), my = lerp(-96, -196, up);
        taper([[sd * 26, -136], [mx, my], [ax, ay]], 30, 24, CUT); taper([[sd * 26, -136], [mx, my], [ax, ay]], 20, 15, INK);
        shape(ell(ax, ay, 13, 13), CUT, 4);
      }
      kid(0, 0, 1, { seed, t, cry: true });
    });
  }
  function thumbUp(x, y, k, rot = 0) {
    withT(() => { s.translate(x, y); s.rotate(rot); s.scale(k, k);
      taper([[0, 140], [0, 30]], 48, 40, CUT); taper([[0, 140], [0, 30]], 38, 32, INK);
      shape(() => { s.beginPath(); s.roundRect(-34, -22, 68, 62, 18); }, CUT, 6);
      for (let i = 0; i < 3; i++) taper([[-26, -4 + i * 14], [18, -4 + i * 14]], 3, 2);
      shape(() => { s.beginPath(); s.roundRect(-30, -82, 26, 70, 13); }, CUT, 6);
    });
  }

  // ---------- THE HOUSE, seen from the stage, built for the tall frame ----------
  // a raked fan of rows climbing the frame: four seats a side, twelve rows, the back wall high up, opera boxes
  // stacked up both side walls (far ones small and high, near ones big at the frame edges)
  const NR = 12;
  const rowZ = (r) => 1 + r * .3, rowY = (r) => 380 + 1450 / rowZ(r);
  const seatXw = (sd, j) => sd * (98 + j * 134);
  const seatX = (r, sd, j) => CX + seatXw(sd, j) / rowZ(r);
  const JIMI = { r: 5, sd: 1, j: 1 };
  const NAMED = { '2,-1,1': 'bob', '3,1,3': 'bey', '6,-1,2': 'mj',
    '2,1,1': 'muddy', '3,-1,0': 'hopkins', '4,1,0': 'richard', '3,-1,2': 'joplin', '4,-1,3': 'berry', '6,1,3': 'tharpe', '2,-1,3': 'spann' };
  const BLUES = { muddy: [[0, 0, 1, .62], 270], hopkins: [[0, 0, 1, .55], 260], richard: [[0, 0, 1, 1], 230], joplin: [[0, 0, .82, .52], 270],
    berry: [[.04, 0, .82, .5], 270], tharpe: [[0, 0, 1, .42], 260], spann: [[0, 0, 1, .62], 240] };
  // 187-205 the house fills: the bus kids pop into the seats on the beats, then the blues greats one by one
  const T_BLUES = { muddy: 191.13, hopkins: 191.60, richard: 192.60, joplin: 193.17, berry: 194.23, tharpe: 195.27, spann: 195.77 };
  const T_KIDS = [187.3, 195.0];
  function who(r, sd, j) {
    const id = r * 40 + (sd > 0 ? 20 : 0) + j, h = hash(id * 977 + 13), h2 = hash(id * 131 + 7);
    if (r === JIMI.r && sd === JIMI.sd && j === JIMI.j) return null;   // Jimi's seat, kept for later
    if (r === 1 && sd === 1 && j <= 3) return null;                     // the Pixies' row, kept for later
    const nm = NAMED[`${r},${sd},${j}`];
    if (nm) return nm in T_BLUES ? { cat: 'named', nm, ta: T_BLUES[nm], seed: id } : null;
    const near = r <= 5;
    const cat = near ? (h < .45 ? 'kid' : h < .65 ? 'mus' : 'ppl') : (h < .18 ? 'kid' : h < .32 ? 'mus' : 'ppl');
    return { cat, ta: cat === 'kid' ? snapBeat(lerp(T_KIDS[0], T_KIDS[1], h2)) : null, seed: id };
  }
  const popK = (t, ta) => t < ta ? 0 : ease.back(inv(ta, ta + .25, tw(t)));
  function sideBoxP(x, y, bw, bh, lw) {
    shape(() => { s.beginPath(); s.moveTo(x - bw / 2, y + bh); s.lineTo(x - bw / 2, y + bw / 2); s.arc(x, y + bw / 2, bw / 2, Math.PI, 0); s.lineTo(x + bw / 2, y + bh); s.closePath(); }, INK, lw, CUT);
    taper([[x - bw / 2, y + bh * .7], [x + bw / 2, y + bh * .7]], lw, lw, CUT);
    for (let i = 0; i < 4; i++) taper([[x - bw / 2 + 6 + i * bw * .09, y + bw * .3], [x - bw / 2 + 4 + i * bw * .08, y + bh * .66]], 2, 4, CUT);
  }
  function houseWalls() {
    // the back wall high in the frame: carved panelling, the balcony rail, two doors and the EXIT sign
    clipTo(rect(250, 40, 580, 520), () => rows(250, 40, 830, 560, 0, 22, (u) => .5 + u * 2.5, CUT));
    taper([[200, 360], [880, 360]], 8, 8, CUT); for (let i = 0; i < 18; i++) taper([[214 + i * 38, 360], [214 + i * 38, 404]], 3, 3, CUT);
    taper([[200, 404], [880, 404]], 4, 4, CUT);
    for (const dx of [-120, 120]) shape(() => { s.beginPath(); s.moveTo(CX + dx - 38, 640); s.lineTo(CX + dx - 38, 580); s.arc(CX + dx, 580, 38, Math.PI, 0); s.lineTo(CX + dx + 38, 640); }, INK, 4, CUT);
    shape(rect(CX - 46, 520, 92, 34), INK, 3, CUT); carveText('EXIT', CX, 537, 22, CUT, { w: 62 });
    // the side walls run out toward us: carved rake lines from the back corners to the frame edges
    for (const sd of [-1, 1]) for (let i = 0; i < 5; i++) taper([[CX + sd * 290, 120 + i * 120], [CX + sd * 620, -200 + i * 420]], 3, 6, CUT);
    // opera boxes stacked up the side walls, smaller and higher as they go back
    for (const sd of [-1, 1]) {
      sideBoxP(CX + sd * 360, 470, 90, 150, 4);
      sideBoxP(CX + sd * 430, 300, 130, 230, 5);
      sideBoxP(CX + sd * 490, 60, 180, 340, 7);
    }
  }
  function seatFront(x, y, k, lit) {
    const w = 58, h = 118, lw = Math.max(2.4, 6 * k);
    const mk = () => { s.beginPath(); s.moveTo(x - w * k, y + h * k); s.lineTo(x - w * k, y + 18 * k); s.quadraticCurveTo(x - w * k, y, x - (w - 18) * k, y); s.lineTo(x + (w - 18) * k, y); s.quadraticCurveTo(x + w * k, y, x + w * k, y + 18 * k); s.lineTo(x + w * k, y + h * k); s.closePath(); };
    shape(mk, INK, lw, CUT);
    if (lit > .15) clipTo(mk, () => rows(x - w * k, y, x + w * k, y + h * k, 0, Math.max(5, 15 * k), (u) => lit * (1 - u) * 5 * k + .2, CUT));
    shape(rect(x - 44 * k, y + 70 * k, 88 * k, 50 * k), INK, Math.max(2, 4 * k), CUT);
  }
  // o: { bop: heads bounce on the beats, kidUp: kids wave }
  function house(t, o = {}) {
    bk(INK);
    houseWalls();
    const T = tw(t), bp = o.bop ? beatPulse(T, 7) : 0, bi = lastBeat(T);
    for (let r = NR - 1; r >= 0; r--) {
      const z = rowZ(r), k = 1 / z, y = rowY(r), lit = clamp(1.1 - r * .14);
      shape(rect(-60, y + 60 * k, W + 120, H), INK);
      taper([[CX - 700 / z, y + 128 * k], [CX + 700 / z, y + 128 * k]], Math.max(2, 5 * k), Math.max(2, 5 * k), CUT);
      for (const sd of [-1, 1]) for (let j = 3; j >= 0; j--) seatFront(seatX(r, sd, j), y, k, lit);
      for (const sd of [-1, 1]) for (let j = 3; j >= 0; j--) {
        const p = who(r, sd, j); if (!p) continue;
        const pk = p.ta == null ? 0 : popK(t, p.ta); if (pk <= 0) continue;
        const x = seatX(r, sd, j), kk = k * pk, cl = rect(x - 400 * k, -2000, 800 * k, y + 104 * k + 2000);
        const odd = (bi + r + j) % 2 ? 1 : -1, by = -bp * 14 * k * (hash(p.seed * 3 + 1) > .25 ? 1 : 0);
        clipTo(cl, () => {
          if (p.cat === 'kid') happyKid(x, y + (-30 + 186 * .85) * kk + (1 - pk) * 60 * k + by, .85 * kk, { seed: p.seed, t, up: o.kidUp ? (odd > 0 ? 1 : .6) : 0 });
          else if (p.cat === 'mus') musician(x, y + (1 - pk) * 60 * k + by, kk, p.seed, { t });
          else if (p.cat === 'ppl') patron(x, y + (1 - pk) * 60 * k + by, kk, p.seed, { t });
          else piece(p.nm, x, y + 120 * k + by * .6, BLUES[p.nm][1] * kk, { crop: BLUES[p.nm][0], ax: .5, ay: 1, rot: odd * .06 * bp });   // the greats nod along
        });
        // each great arrives with a burst of carved flicks
        if (p.cat === 'named' && T - p.ta < .4) { const a0 = clamp((T - p.ta) / .4);
          for (let i = 0; i < 10; i++) { const a = -Math.PI + i * Math.PI / 9, rr = (90 + 120 * a0) * k * 2; flick(x + Math.cos(a) * rr, y - 60 * k + Math.sin(a) * rr * .8, a, 50 * k * 2 * (1 - a0) + 10, 5, CUT); } }
      }
    }
  }
  const seatTop = (r, sd, j) => [seatX(r, sd, j), rowY(r), 1 / rowZ(r)];

  // ---------- THE STAGE, built for the tall frame ----------
  // the boards fill the bottom of the frame from SGY down (deep, in perspective); the side legs run from the loft
  // down to the boards; the valance hangs across the top of the frame (hem at VAL); above it is the fly loft
  const SGY = 1180, VAL = 150, LOFT = -2800;
  function pFlies(t, w) {
    // the loft: battens with lanterns every 300 px, ropes up to the grid
    for (let i = 0; i < 9; i++) { const x = 80 + i * 115; taper([[x, LOFT], [x + 3, VAL]], 2.5, 2.5, CUT); }
    for (let i = 0; i < 9; i++) { const y = -120 - i * 300; taper([[-40, y], [W + 40, y]], 8, 8, CUT);
      for (let j = 0; j < 4; j++) { const x = 160 + j * 250 + (i % 2) * 110; taper([[x, y], [x, y + 80]], 3, 3, CUT); shape(() => pathOf([[x - 30, y + 80], [x + 30, y + 80], [x + 22, y + 130], [x - 22, y + 130]]), INK, 4, CUT); } }
    shape(rect(-60, LOFT - 200, W + 120, 240), INK, 0); taper([[-40, LOFT + 30], [W + 40, LOFT + 30]], 14, 14, CUT);   // the grid
    // under the valance: a lantern batten and sandbags swaying on their lines
    taper([[150, VAL + 40], [930, VAL + 40]], 6, 6, CUT);
    for (let i = 0; i < 4; i++) { const x = 250 + i * 190; shape(() => pathOf([[x - 26, VAL + 40], [x + 26, VAL + 40], [x + 18, VAL + 86], [x - 18, VAL + 86]]), INK, 4, CUT); }
    for (let i = 0; i < 5; i++) { const x = 230 + i * 150 + (i % 2) * 30, len = 300 + (i * 97) % 260, sw = w * 18 * Math.sin(tw(t) * 4 + i);
      taper([[x, VAL + 40], [x + sw, VAL + 40 + len]], 2.5, 2.5, CUT); shape(rect(x + sw - 14, VAL + 40 + len, 28, 40), INK, 3, CUT); }
  }
  function pBoards() {
    const BD = () => pathOf([[150, SGY], [930, SGY], [1180, 1990], [-100, 1990]]);
    shape(BD, CUT, 6);
    clipTo(BD, () => { for (let i = 0; i <= 12; i++) taper([[150 + i * 65, SGY], [-100 + i * 106.7, 1990]], 3, 7);
      for (const yy of [1390, 1640]) taper([[-100, yy], [W + 100, yy]], 2, 2); });
  }
  function pCurtains(t, w) {
    for (const sd of [-1, 1]) {
      const bul = (u) => w * (60 + 50 * snoise(tw(t) * 1.6 + u * 1.3, sd + 9)) * Math.pow(u, .9);
      const ex = (u, f) => sd < 0 ? f * (150 + bul(u)) : W - f * (150 + bul(u));
      const y0 = LOFT, y1 = SGY + 8, yy = (u) => lerp(y0, y1, u);
      const uOf = (y) => (y - y0) / (y1 - y0);
      const P = [[sd < 0 ? -40 : W + 40, y0]]; for (let i = 0; i <= 30; i++) { const u = lerp(uOf(VAL - 200), 1, i / 30); P.push([ex(u, 1), yy(u)]); } P.push([sd < 0 ? -40 : W + 40, y1]);
      P.splice(1, 0, [ex(uOf(VAL - 200), 1), y0]);
      shape(() => pathOf(P), INK, 5, CUT);
      for (let f = 1; f < 5; f++) { const pts = [[ex(uOf(VAL - 200), f / 5), y0]]; for (let i = 0; i <= 30; i++) { const u = lerp(uOf(VAL - 200), 1, i / 30); pts.push([ex(u, f / 5), yy(u) - 4]); } taper(pts, 2, 6, CUT); }
    }
    // the valance across the top of the frame: a heavy pelmet with a scalloped hem
    const hem = (x) => VAL + Math.abs(Math.sin(x / W * Math.PI * 5)) * -24 + w * 12 * Math.sin(tw(t) * 5 + x * .01);
    const V = [[-40, 20], [W + 40, 20]]; for (let x = W + 40; x >= -40; x -= 30) V.push([x, hem(x)]);
    shape(() => pathOf(V), INK, 5, CUT);
    taper([[-40, 20], [W + 40, 20]], 6, 6, CUT);
    for (let i = 0; i < 14; i++) { const x = 30 + i * 78; taper([[x, 26], [x + w * 8 * Math.sin(tw(t) * 6 + i), hem(x) - 12]], 2, 5, CUT); }
  }
  function spot(x, yF, rB, rT = 34) {
    const cone = () => pathOf([[x - rT, VAL], [x + rT, VAL], [x + rB, yF], [x - rB, yF]]);
    clipTo(cone, () => rows(x - rB, VAL, x + rB, yF, Math.PI / 2, 15, () => 2.6, CUT));
    shape(ell(x, yF, rB * 1.08, rB * .2), CUT, 3);
  }
  function pStage(t, w, spots = []) {
    bk(INK);
    pFlies(t, w);
    pBoards();
    for (const [x, y, r] of spots) spot(x, y, r);
    pCurtains(t, w);
  }
  // heads of the audience in front (from the house), for the shots looking at the stage
  function pBacks(t, y0, sc, cheer) {
    for (let r = 1; r >= 0; r--) {
      const k = sc * (1 + (1 - r) * .45), y = y0 + (1 - r) * 120 * sc, pitch = 170 * k;
      for (let j = -4; j <= 4; j++) {
        const x = CX + (j + (r ? .5 : 0)) * pitch, sd = 1000 + r * 31 + j, rr = rng(sd), v = Math.floor(rr() * 5), up = cheer * (.6 + .4 * Math.sin(tw(t) * 8 + j * 1.7 + r));
        if (up > .2 && rr() > .3) for (const s_ of [-1, 1]) { taper([[x + s_ * 40 * k, y - 20 * k], [x + s_ * 54 * k, y - 120 * k * up], [x + s_ * 30 * k, y - 180 * k * up]], 22 * k, 16 * k, INK);
          s.beginPath(); s.arc(x + s_ * 30 * k, y - 186 * k * up, 13 * k, Math.PI, 0); s.lineWidth = 4 * k; s.strokeStyle = CUT; s.stroke(); }
        shape(ell(x, y - 46 * k, 30 * k, 35 * k), INK);
        s.beginPath(); s.ellipse(x, y - 46 * k, 30 * k, 35 * k, 0, Math.PI * 1.1, Math.PI * 1.9); s.lineWidth = 5 * k; s.strokeStyle = CUT; s.stroke();
        if (v === 0) { shape(ell(x, y - 74 * k, 48 * k, 9 * k), INK, 3 * k, CUT); shape(rect(x - 24 * k, y - 104 * k, 48 * k, 30 * k), INK, 3 * k, CUT); }
        else if (v === 1) { dot(x, y - 88 * k, 13 * k, INK); s.beginPath(); s.arc(x, y - 88 * k, 13 * k, Math.PI, 0); s.lineWidth = 3 * k; s.strokeStyle = CUT; s.stroke(); }
        shape(() => pathOf([[x - 70 * k, y + 400 * k], [x - 64 * k, y + 10 * k], [x - 50 * k, y - 18 * k], [x + 50 * k, y - 18 * k], [x + 64 * k, y + 10 * k], [x + 70 * k, y + 400 * k]]), INK, 3 * k, CUT);
      }
    }
  }
  // Ellen: (x, y) = between her feet; lift (Ellen units) raises her, roll turns her about her middle, spin = cut-out twirl
  function ellenFig(t, x, y, k, o = {}) {
    const { w = 0, pose = 'play', facing = 1, slide = null, bow = 0, smile = 0, spin = 1, roll = 0, lift = 0, eyes = 'open' } = o;
    const sl = slide ?? (.45 + .3 * Math.sin(tw(t) * (2 + 6 * harm(t))));
    withT(() => { s.translate(x, y - lift * k); s.rotate(bow * facing);
      if (roll) { s.translate(0, -260 * k); s.rotate(roll); s.translate(0, 260 * k); }
      s.scale(spin === 1 ? 1 : Math.abs(spin) < .12 ? .12 * Math.sign(spin || 1) : spin, 1);
      ellen(0, 0, k, { pose, t: tw(t), wind: w, facing, slide: sl, smile, eyes }); });
  }
  function soundFlicks(x, y, t, amt, seed, sc = 1) {
    const p = beatPulse(t, 5) * amt; if (p < .08) return;
    const r = rng(seed + lastBeat(t));
    for (let i = 0; i < 9; i++) { const a = -Math.PI * .1 - r() * Math.PI * .8, d = (90 + (1 - p) * 120 + r() * 60) * sc;
      flick(x + Math.cos(a) * d, y + Math.sin(a) * d, a, (40 + 50 * p) * sc, (5 + 4 * p) * sc, CUT); }
  }
  // the harmonica's wind: carved streaks blowing right to left across the tall frame
  function windStreaks(t, amt, seed = 0) {
    if (amt < .15) return;
    for (let i = 0; i < 22; i++) { const u = wrap(tw(t) * 1.3 + i * .045 + seed * .37, 1), yy = 60 + (i * 137 + seed * 53) % (H - 120); flick(lerp(W + 260, -260, u), yy, Math.PI, 190 * amt, 7, CUT); }
  }
  // the stage lip in the foreground (white boards) for the shots from the stage into the house
  function lip(y = 1660) {
    const P = () => pathOf([[-40, y + 10], [W + 40, y], [W + 40, H + 60], [-40, H + 60]]);
    shape(P, CUT, 8);
    clipTo(P, () => { for (let i = 0; i < 16; i++) taper([[i * 80 - 60, y], [i * 110 - 300, H + 60]], 3, 6); taper([[-40, y + 40], [W + 40, y + 30]], 3, 3); });
  }

  // ===================== SHOTS =====================
  // 187.0  Bob: 'We see the audience becoming populated with kids and famous blues players approving.'
  //        Over her shoulder into the house: Ellen big in the bottom-left corner on the lip, playing (harmonica
  //        186-189.4 in her hair), the tall raked house above her; the bus kids pop into the seats on the beats.
  //        The camera tilts up the rows as they fill.
  function fillWide(t) {
    const T = tw(t), u = ease.sine(inv(187.0, 191.6, T));
    cam(CX, lerp(1280, 1140, u), lerp(1.4, 1.55, u), () => house(t, { bop: 1 }));
    lip(1700 + 40 * u);
    ellenFig(t, 250, 2160 + 40 * u, 1.55, { w: .15 + .6 * harm(t), smile: .3 + .4 * inv(188, 191, T) });
  }
  // 191.6  closer, tilting up the rows: the blues greats pop up one by one and nod along (Muddy 191.13, Lightnin'
  //        191.60, Little Richard 192.60, Janis 193.17, Chuck Berry 194.23, Sister Rosetta 195.27, Spann 195.77)
  function bluesArrive(t) {
    const T = tw(t);
    const fx_ = kf(T, [[191.6, 520], [193.4, 500], [195.9, 560]], ease.inOut), fy = kf(T, [[191.6, 1250], [193.4, 1120], [195.9, 960]], ease.inOut);
    cam(fx_, fy, kf(T, [[191.6, 1.75], [195.9, 1.9]], ease.sine), () => house(t, { bop: 1 }));
  }
  // 196.0  close on her: she plays harder for the harmonica (196-200.2), the slide racing, sound flying off the
  //        guitar; full figure head to boots in the tall frame, rays behind her head, a slow push in
  function closePlay(t) {
    const T = tw(t), hm = harm(t), k = 2.15, x = 380, y = 1830, hx = x + 2 * k, hy = y - 466 * k;
    bk(INK);
    cam(hx + 60, kf(T, [[196.0, 980], [198.37, 900]], ease.sine), kf(T, [[196.0, 1.0], [198.37, 1.08]], ease.sine), () => {
      for (let i = 0; i < 30; i++) { const a = i * TAU / 30 + .05; taper([[hx + Math.cos(a) * 300, hy + Math.sin(a) * 300], [hx + Math.cos(a) * 2000, hy + Math.sin(a) * 2000]], 4, 34, CUT); }
      shape(ell(hx, hy, 290, 290), INK);
      ellen(x, y, k, { pose: 'play', t: tw(t), wind: .25 + .6 * hm, slide: .4 + .35 * Math.sin(tw(t) * (3 + 9 * hm)), smile: .4 });
      soundFlicks(x + 18 * k, y - 300 * k, t, .5 + hm, 196, 1.6);
    });
  }
  // 198.37 the greats approve: close on two rows stacked up the frame, Muddy near and big (row 2), Chuck Berry
  //        above and behind (row 4); all nodding on the beats; Muddy (198.87) then Berry (199.40) give her a
  //        thumbs-up; the harmonica's wind streams through the house
  function approve(t) {
    const T = tw(t), z = kf(T, [[198.37, 2.0], [200.93, 2.25]], ease.sine);
    const [mx, my, mk] = seatTop(2, 1, 1), [bx, by, bk_] = seatTop(4, -1, 3);
    cam(kf(T, [[198.37, 520], [200.93, 500]]), kf(T, [[198.37, 1200], [200.93, 1150]]), z, () => {
      house(t, { bop: 1, kidUp: 1 });
      const m = ease.back(inv(198.87, 199.12, T)), b = ease.back(inv(199.40, 199.65, T)), bp = beatPulse(T, 7);
      if (m > 0) thumbUp(mx + 150 * mk, my - 60 * mk - bp * 8 * mk, 1.4 * mk * m, .14);
      if (b > 0) thumbUp(bx + 150 * bk_, by - 60 * bk_ - bp * 6 * bk_, 1.4 * bk_ * b, .12);
    });
    windStreaks(t, harm(t), 2);
  }
  // 200.93 the whole house, full of kids and blues greats, all nodding along; over her other shoulder (bottom
  //        right, facing in), a slow pull back from the front rows to the back wall
  function fullEarly(t) {
    const T = tw(t), u = ease.sine(inv(200.93, 205.23, T));
    cam(CX, lerp(1000, 1060, u), lerp(1.14, 1.0, u), () => house(t, { bop: 1, kidUp: 1 }));
    lip(1720 - 20 * u);
    ellenFig(t, 840, 2170 - 30 * u, 1.55, { facing: -1, w: .2, smile: .75 });
  }

  // 205.2  Bob: 'The acrobatics start and they are extravagant. Flips, somersaults.' Still playing, she cartwheels,
  //        throws a double back somersault with a twist and a triple layout with two twists; each lands on a beat
  //        (206.30, then the strong ones 207.90 and 209.47). Tall frame: the flips go UP (the triple tops out above
  //        the valance) and the camera tilts up after her; the house's heads in front roar on every landing.
  // [t0, t1, x0, x1, height px, turns (+ cartwheel / forward, - backward), twists, facing]
  const AGY = 1560, AK = 1.2;
  const ACRO = [[205.23, 206.30, 300, 520, 380, 1, 0, 1], [206.30, 207.90, 520, 760, 900, -2, 1, 1], [207.90, 209.47, 760, 420, 1300, 3, 2, -1]];
  function acroAt(T) {
    for (const [a, b, x0, x1, hh, turns, tws, fc] of ACRO) if (T >= a && T < b) {
      const u = (T - a) / (b - a), e = ease.inOut(u);
      return { x: lerp(x0, x1, e), lift: hh * flight(u), roll: e * turns * TAU, spin: tws ? Math.cos(ease.inOut(inv(.2, .8, u)) * tws * TAU) : 1, facing: fc, air: true };
    }
    if (T < ACRO[0][0]) return { x: 300, lift: 0, roll: 0, spin: 1, facing: 1, air: false };
    return { x: 420, lift: 0, roll: 0, spin: 1, facing: -1, air: false };
  }
  function acrobat(t) {
    const T = tw(t), A = acroAt(T), lands = ACRO.map((m) => m[1]);
    const lh = Math.max(...lands.map((b) => hit(T, b, 4)));
    const fy = 1020 - A.lift * .72, z = kf(T, [[205.2, 1.08], [209.47, 1.0], [210.0, 1.02]], ease.sine);
    bk(INK);
    cam(CX + (A.x - CX) * .25, fy, z, () => {
      pStage(t, .15 + .5 * A.lift / 1300, [[A.x, AGY, 230]]);
      if (A.air) {                                                      // a carved swoosh tracing her flight
        const pts = []; for (let i = 6; i >= 0; i--) { const Bq = acroAt(T - i * .06); if (Bq.air) pts.push([Bq.x, AGY - Bq.lift - 300]); }
        if (pts.length > 1) { taper(pts, 2, 30, CUT); taper(pts.map(([x, y]) => [x + 60, y + 40]), 1, 12, CUT); }
      }
      ellenFig(t, A.x, AGY, AK, { lift: A.lift / AK, roll: A.roll, spin: A.spin, facing: A.facing, w: A.air ? .75 : .2, smile: .7, pose: T >= 209.47 ? 'hold' : 'play' });
      for (const b of lands) if (T >= b && T < b + .3) for (let i = 0; i < 9; i++) { const a = -Math.PI + i * Math.PI / 8; flick(A.x + Math.cos(a) * 190, AGY + 6 + Math.sin(a) * 44, a, 80, 7, CUT); }
    });
    pBacks(t, 1770 + (1020 - fy) * .1, .9, .2 + .8 * lh);
  }

  // 210.0  Bob: 'Then the neck of the guitar becomes a pogo stick, she can fly / twirl in the air.'
  //        The guitar flips upside down, the neck grows a spring and a foot; she bounces higher and higher, landing on
  //        the beats and twirling at the top; the strong harmonica (210-215.6) streams her hair and the bounces go wild;
  //        the biggest lands on the strong 217.33. Tall frame: the bounces go straight up, past the valance into the
  //        fly loft, and the camera rides up and down with her.
  // [takeoff, landing, height px, twirls, flips]
  const POGO = [[210.50, 211.03, 140, 0, 0], [211.03, 211.57, 220, 0, 0], [211.57, 212.67, 520, 1, 0], [212.67, 213.70, 640, 1, 0],
    [213.70, 214.73, 780, 2, 0], [214.73, 215.77, 920, 2, 1], [215.77, 217.33, 1400, 3, 1], [217.33, 218.40, 860, 2, 0],
    [218.40, 220.00, 1600, 3, -1], [220.00, 220.50, 180, 0, 0]];
  const POGO_X = [540, 480, 610, 400, 690, 430, 660, 540, 410, 620, 560];
  const POGO_LEN = (g, comp) => 178 + 120 * g * (1 - .55 * comp) + 30 * g;   // her feet down to the floor, Ellen units
  function pogoStick(k, g, comp) {   // drawn in Ellen's frame (feet at 0); g 0..1 grown; comp 0..1 spring squashed
    withT(() => { s.scale(k, k);
      const body = () => { s.beginPath(); s.ellipse(0, -318, 84, 62, 0, 0, TAU); s.moveTo(64, -232); s.ellipse(0, -232, 64, 50, 0, 0, TAU); };
      shape(body, CUT, 6); clipTo(body, () => rows(-90, -390, 90, -180, 0, 14, (u) => 1.5 + u * 2));
      dot(0, -268, 20, INK); dot(0, -268, 12, CUT); dot(0, -268, 7, INK);
      shape(rect(-30, -354, 60, 12), INK);
      taper([[-124, -250], [124, -250]], 18, 18, INK); taper([[-120, -254], [120, -254]], 4, 4, CUT);
      taper([[0, -184], [0, 120]], 26, 22, CUT); taper([[0, -184], [0, 120]], 20, 16, INK);
      for (let f = 0; f < 9; f++) { const yy = -150 + f * 28; taper([[-10, yy], [10, yy]], 2, 2, CUT); }
      for (let i = -1; i <= 1; i++) taper([[i * 5, -348], [i * 5, 116]], 1.5, 1.5, CUT);
      shape(() => pathOf([[-16, 118], [16, 118], [22, 178], [-22, 178]]), INK, 4, CUT);
      for (const yy of [132, 150, 166]) for (const sd of [-1, 1]) dot(sd * 24, yy, 5, CUT);
      taper([[-96, 6], [96, 6]], 14, 14, INK); taper([[-94, 4], [94, 4]], 3, 3, CUT);
      if (g > 0) {
        const L = 120 * g * (1 - .55 * comp), y0 = 178, n = 6, pts = [];
        for (let i = 0; i <= n * 2; i++) pts.push([(i % 2 ? 1 : -1) * 38 * g, y0 + L * i / (n * 2)]);
        taper(pts, 16, 16, CUT); taper(pts, 8, 8, INK);
        shape(() => { s.beginPath(); s.ellipse(0, y0 + L + 15 * g, 42 * g, 16 * g, 0, 0, TAU); }, INK, 5, CUT);
      }
    });
  }
  function pogoAt(T) {
    if (T < 210.29) return { flip: inv(210.0, 210.29, T), h: 0, g: 0, comp: 0, spin: 1, roll: 0, x: POGO_X[0] };
    if (T < POGO[0][0]) return { h: 0, g: ease.back(inv(210.29, 210.5, T)), comp: 0, spin: 1, roll: 0, x: POGO_X[0] };
    for (let i = 0; i < POGO.length; i++) { const [a, b, hh, tws, fl] = POGO[i]; if (T >= a && T < b) {
      const u = (T - a) / (b - a);
      return { h: hh * 4 * u * (1 - u), g: 1, comp: 1 - smooth(inv(a, a + .1, T)), spin: tws ? Math.cos(ease.inOut(inv(.25, .75, u)) * tws * TAU) : 1,
        roll: fl ? ease.inOut(inv(.2, .8, u)) * fl * TAU : 0, x: lerp(POGO_X[i], POGO_X[i + 1], ease.inOut(u)), land: b }; } }
    return { h: 0, g: 1, comp: 1 - smooth(inv(220.5, 220.6, T)), spin: 1, roll: 0, x: POGO_X[POGO.length] };
  }
  function pogo(t) {
    const T = tw(t), P = pogoAt(T), k = 1.15, GY = 1640, hm = harm(t);
    const footY = GY - POGO_LEN(P.g, P.comp) * k - P.h;
    const lands = POGO.map((m) => m[0]).concat([220.5]), lh = Math.max(...lands.map((b) => hit(T, b, 9)));
    const tilt = hm * .2 * Math.sin(T * 5.3) * (P.h > 20 ? 1 : .2);
    const fy = Math.min(1000, lerp(1000, footY - 80, .82)), z = 1.04 - .06 * clamp(P.h / 1600);
    bk(INK);
    cam(CX + (P.x - CX) * .4, fy + lh * 10 * Math.sin(T * 80), z, () => {
      pStage(t, .2 + .8 * hm, [[P.x, GY, 200]]);
      if (P.h > 60) for (let i = 1; i <= 4; i++) {                     // carved speed marks under her as she rises / falls
        const yy = footY + POGO_LEN(P.g, P.comp) * k + 20 + i * 46; taper([[P.x - 50 + i * 6, yy], [P.x + 50 - i * 6, yy]], 8 - i, 8 - i, CUT); }
      withT(() => {
        s.translate(P.x, footY); s.rotate(tilt);
        if (P.roll) { s.translate(0, -100 * k); s.rotate(P.roll); s.translate(0, 100 * k); }
        s.scale(Math.abs(P.spin) < .12 ? .12 * Math.sign(P.spin || 1) : P.spin, 1);
        const wind = Math.max(hm, .3 + .5 * clamp(P.h / 700));
        if (P.flip !== undefined && P.flip < .45) ellen(0, 0, k, { pose: 'hold', t: T, wind, smile: .5 });    // she lifts it ...
        else {
          ellen(0, 0, k, { pose: 'stand', t: T, wind, smile: .4 + .5 * clamp(P.h / 600), eyes: 'open' });
          if (P.flip !== undefined) withT(() => { s.translate(0, -280 * k); s.rotate((1 - ease.out(inv(.45, 1, P.flip))) * -Math.PI); s.translate(0, 280 * k); pogoStick(k, 0, 0); });   // ... and flips it over
          else pogoStick(k, P.g, P.comp);
        }
      });
      for (const b of lands) if (T >= b && T < b + .25) for (let i = 0; i < 9; i++) { const a = -Math.PI + i * Math.PI / 8; flick(P.x + Math.cos(a) * 140, GY + 4 + Math.sin(a) * 32, a, 70, 7, CUT); }
    });
    windStreaks(t, hm, 5);
  }

  // 220.6  Bob: 'The kids from the bus are on stage, dancing with her, doing acrobatics with her.'
  //        Staged in depth for the tall frame: Ellen big in the middle; three kids climb up over the lip from the
  //        bottom of the frame into the front row (big, near), two cartwheel in from the wings behind her; they dance
  //        and tumble with her, crying all the while; on the harmonica (223.7-224.9) they all throw one big somersault
  //        together and land on 224.70
  // [x, y (feet), scale, arrives, seed, from: 'lip' | 'wing']
  const KD = [[190, 1850, 1.15, 221.03, 1, 'lip'], [540, 1860, 1.15, 221.03, 2, 'lip'], [890, 1850, 1.15, 221.57, 3, 'lip'], [215, 1400, .8, 221.57, 4, 'wing'], [840, 1400, .8, 222.10, 5, 'wing']];
  const KE = [500, 1470, 1.1];   // Ellen: x, feet, scale
  function kidsDance(t) {
    const T = tw(t), bi = lastBeat(T), bp = beatPulse(T, 9);
    const big = (T >= 223.67 && T < 224.70) ? (T - 223.67) / 1.03 : -1;
    bk(INK);
    const bigUp = (T >= 223.67 && T < 224.70) ? flight((T - 223.67) / 1.03) : 0;
    cam(CX, kf(T, [[220.6, 1360], [225.2, 1300]], ease.sine) - bigUp * 260, kf(T, [[220.6, 1.22], [225.2, 1.3]], ease.sine) - bigUp * .12, () => {
      pStage(t, .2 + .8 * harm(t), [[KE[0], KE[1], 230]]);
      const draw = (i) => {
        const [x0, GYk, kk, ta, seed, from] = KD[i];
        if (T < ta - .45) return;
        let x = x0, y = GYk, roll = 0, up = 0, tilt = 0;
        if (T < ta) { const u = (T - (ta - .45)) / .45;
          if (from === 'lip') { y = lerp(GYk + 420, GYk, ease.out(u)) - flight(u) * 120; up = 1; }        // up over the lip
          else { const sd = x0 < CX ? -1 : 1; x = lerp(x0 + sd * 420, x0, ease.out(u)); y = GYk - flight(u) * 90; roll = -sd * ease.out(u) * TAU; } }   // cartwheel in from the wing
        else {
          const ph = (bi + i) % 2; up = ph ? 1 : .6; y = GYk - bp * 55 * kk; tilt = ph ? .15 : -.15;
          const tum = i % 2 ? [222.63, 223.17] : [222.10, 222.63];
          if (T >= tum[0] && T < tum[1] && T >= ta + .1) { const u = (T - tum[0]) / (tum[1] - tum[0]); roll = (i % 2 ? -1 : 1) * ease.inOut(u) * TAU; y = GYk - flight(u) * 140 * kk; up = 1; tilt = 0; }
          if (big >= 0) { roll = -ease.inOut(big) * TAU; y = GYk - flight(big) * 320 * kk; up = 0; tilt = 0; }
          if (T >= 224.70) { up = 1; tilt = 0; y = GYk; }
        }
        withT(() => { s.translate(x, y); s.rotate(tilt); happyKid(0, 0, kk, { seed, t, up, roll }); });
        if (T >= ta && T < ta + .2) for (let j = 0; j < 5; j++) flick(x - 34 * kk + j * 17 * kk, GYk + 2, -Math.PI / 2 + (j - 2) * .45, 40 * kk, 5, CUT);
      };
      draw(3); draw(4);                                                   // the two behind her first
      let eLift = bp * 50, eRoll = 0;
      if (T >= 222.10 && T < 223.17) { const u = (T - 222.10) / 1.07; eRoll = ease.inOut(u) * TAU; eLift = flight(u) * 200; }
      if (big >= 0) { eRoll = -ease.inOut(big) * TAU; eLift = flight(big) * 380; }
      ellenFig(t, KE[0], KE[1], KE[2], { lift: eLift / KE[2], roll: eRoll, smile: .85, w: .2 + .8 * harm(t), pose: T >= 224.70 ? 'hold' : 'play' });
      draw(0); draw(1); draw(2);                                          // the three in front, near and big
      if (T >= 224.70 && T < 225.0) for (const [x, y, kk] of [...KD.map((d) => [d[0], d[1], d[2]]), KE]) for (let j = 0; j < 7; j++) { const a = -Math.PI + j * Math.PI / 6; flick(x + Math.cos(a) * 100 * kk, y - 10 + Math.sin(a) * 26 * kk, a, 56 * kk, 6, CUT); }
    });
    windStreaks(t, harm(t), 7);
  }

  // ---------- the giant harmonica (INK body, CUT slots, carved highlights) ----------
  const PCH = (pts, seed, amt) => () => pathOf(chisel(pts, seed, amt));
  function hline(x0, x1, y, w0, w1, c, seed, wob = 2) { const r = rng(seed), pts = []; for (let x = x0; x <= x1 + .1; x += Math.max(20, (x1 - x0) / 12)) pts.push([x, y + (r() - .5) * wob]); taper(pts, w0, w1, c); }
  function harmonica(cx, cy, w, h, rot = 0, o = {}) {
    const { seed = 5, holes = 10 } = o;
    withT(() => { s.translate(cx, cy); s.rotate(rot);
      const x0 = -w / 2, y0 = -h / 2, a = Math.max(1.5, h * .015);
      const body = PCH([[x0, y0 + h * .1], [x0 + h * .08, y0], [-x0 - h * .08, y0], [-x0, y0 + h * .1], [-x0, y0 + h * .9], [-x0 - h * .08, y0 + h], [x0 + h * .08, y0 + h], [x0, y0 + h * .9]], seed, a);
      const comb = PCH([[x0 - h * .05, -h * .14], [-x0 + h * .05, -h * .14], [-x0 + h * .05, h * .14], [x0 - h * .05, h * .14]], seed + 9, a);
      shape(comb, INK); clipTo(comb, () => { for (const sx of [-1, 1]) for (let i = 0; i < 4; i++) taper([[sx * (-x0 + h * .02), -h * .12 + i * h * .07], [sx * (-x0 + h * .05), -h * .1 + i * h * .07]], h * .015, h * .01, CUT); });
      shape(body, INK, 6, CUT);
      clipTo(body, () => {
        taper([[x0 + h * .12, y0 + h * .1], [-x0 - h * .4, y0 + h * .09], [-x0 - h * .12, y0 + h * .12]], h * .055, h * .02, CUT);
        for (let i = 0; i < 3; i++) hline(x0 + h * .1, -x0 - h * .1, y0 + h * (.17 + i * .04), h * (.018 - i * .005), h * (.012 - i * .003), CUT, seed + i, a);
        for (let i = 0; i < 4; i++) hline(x0 + h * .1, -x0 - h * .1, y0 + h * (.93 - i * .06), h * (.012 + i * .002), h * .006, CUT, seed + 20 + i, a);
        hline(x0 + h * .02, -x0 - h * .02, y0 + h * .37, h * .022, h * .022, CUT, seed + 40, a);
        hline(x0 + h * .02, -x0 - h * .02, y0 + h * .63, h * .016, h * .016, CUT, seed + 41, a);
        for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) taper([[sx * (-x0 - h * (.05 + i * .045)), y0 + h * .08], [sx * (-x0 - h * (.05 + i * .045)), y0 + h * .34]], h * .016, h * .008, CUT);
        flicks(x0 + h * .3, y0 + h * .1, -x0 - h * .3, y0 + h * .3, Math.round(w / 60), 0, h * .25, h * .02, seed + 3);
      });
      const n = holes, gap = (w - h * .5) / n, hw = gap * .5, hh = h * .2;
      for (let i = 0; i < n; i++) { const hx = x0 + h * .25 + gap * (i + .5) - hw / 2, hy = -hh / 2;
        shape(PCH([[hx, hy], [hx + hw, hy], [hx + hw, hy + hh], [hx, hy + hh]], seed + 60 + i, a * .7), CUT);
        taper([[hx + hw * .2, hy + hh * .78], [hx + hw * .8, hy + hh * .78]], h * .012 + .5, h * .012 + .5, INK);
        if (h > 60) carveText(String(i + 1), hx + hw / 2, y0 + h * .29, h * .1, CUT, { weight: '900' }); }
    });
  }
  function harpCracks(cx, gy, hw, k) {
    const r = rng(77);
    for (let i = 0; i < 7; i++) { const side = i % 2 ? 1 : -1, x0 = cx + side * (hw / 2 - 40 - r() * 160), pts = [[x0, gy + 4]];
      let x = x0, y = gy + 4; for (let j = 0; j < 5; j++) { x += side * (30 + r() * 50) * k; y += (r() * 20 + 6) * k; pts.push([x, y]); }
      taper(pts, 8, 1.5, INK); }
  }
  function harpDust(cx, gy, hw, a) {
    if (a <= 0 || a >= 1) return;
    for (const side of [-1, 1]) for (let i = 0; i < 4; i++) { const r = rng(500 + i + (side > 0 ? 9 : 0));
      const px = cx + side * (hw / 2 + 10 + (i * 60 + 90 * r()) * ease.out(a)), py = gy - 30 - i * 40 * ease.out(a) - 60 * r() * a, rr = (46 + 36 * r()) * (1 - a * .7) + 26 * a;
      const c = () => { const p = []; for (let j = 0; j < 9; j++) { const an = j / 9 * TAU; p.push([px + Math.cos(an) * rr * (.8 + .4 * hash(i * 31 + j)), py + Math.sin(an) * rr * .7 * (.8 + .4 * hash(i * 17 + j + 5))]); } smoothPath(p); };
      shape(c, CUT, 4); clipTo(c, () => hline(px - rr, px + rr, py + rr * .3, 3, 1, INK, 600 + i, 2)); }
    const r = rng(800); for (let i = 0; i < 16; i++) { const side = r() < .5 ? -1 : 1, vx = side * (150 + r() * 350), vy = -(400 + r() * 600), tt = a * 1.2;
      const x = cx + side * hw * .45 + vx * tt, y = gy - 10 + vy * tt + 900 * tt * tt; if (y < gy + 20) { dot(x, y, 6 + r() * 7, INK); dot(x, y, 3 + r() * 4, CUT); } }
  }

  // 225.2  Bob: 'The harmonica comes crashing down again like earlier and the school bus from nowhere pushes it away.'
  //        Staged in depth: Ellen and the kids dash UPSTAGE (up the frame, smaller) while the harmonica drops the
  //        whole height of the frame out of the fly loft, its shadow growing on the downstage boards; it lands on the
  //        strong 226.77 (squash, shake, cracks, dust); the school bus bursts out of the stage-left wing downstage
  //        (227.27), meets it on 228.27 and shoves it off stage right; the bus comes to rest downstage right, and
  //        the kids and Ellen cheer it from upstage (230.4 picks up on this stage with the bus).
  const TL_H = 226.77, HX = 640, HW2 = 700, HH2 = 190, HGY = 1760, BUSK = .5, BUSY = 1880, BUS_REST = 560;
  const busFrontAt = (x) => x + 610 * BUSK;
  // where Ellen and the kids run to, upstage (x, feet, scale)
  const UP_E = [330, 1250, .85], UP_K = [[130, 1280, .7], [240, 1310, .7], [480, 1300, .7], [620, 1270, .66], [790, 1260, .66]];
  function harmCrash(t) {
    const T = tw(t), land = t >= TL_H, sl = t - TL_H;
    const shake = land ? 40 * hit(t, TL_H, 5) + 14 * hit(t, 228.27, 8) : 0;
    const meet = HX - HW2 / 2 - 610 * BUSK;
    const bx = T < 227.27 ? -1400 : T < 228.27 ? lerp(-900, meet, ease.out(inv(227.27, 228.27, T))) : lerp(meet, BUS_REST, ease.inOut(inv(228.27, 229.83, T)));
    const hx = Math.max(HX, busFrontAt(bx) + HW2 / 2), over = Math.max(0, hx - (W - 60));
    const run = ease.inOut(inv(225.70, 226.23, T)), bp = beatPulse(T, 9);
    const fy = kf(T, [[225.2, 1280], [225.9, 1020], [TL_H, 1060], [228.27, 1400], [230.4, 1420]], ease.inOut), z = kf(T, [[225.2, 1.28], [225.9, 1.0], [TL_H, 1.04], [228.27, 1.25], [230.4, 1.3]], ease.inOut);
    bk(INK);
    withT(() => { s.translate(snoise(T * 9, 3) * shake, snoise(T * 9, 7) * shake);
      cam(CX + (T > 228.27 ? 40 * ease.inOut(inv(228.27, 229.83, T)) : 0), fy, z, () => {
        const ex = lerp(KE[0], UP_E[0], run), ey = lerp(KE[1], UP_E[1], run), ek = lerp(KE[2], UP_E[2], run);
        pStage(t, 0, [[ex, ey, 230 * ek / KE[2]]]);
        const cheer = T > 228.27 ? 1 : 0;
        // Ellen and the kids, upstage: centre stage looking up, then they dash up the boards and cheer the bus
        const kidAt = (i) => { const [x0, y0, k0] = KD[i], [x1, y1, k1] = UP_K[i]; return [lerp(x0, x1, run), lerp(y0, y1, run) - (cheer ? bp * 40 * k1 : 0), lerp(k0, k1, run)]; };
        const order = [3, 4, 0, 1, 2].sort((a, b) => kidAt(a)[1] - kidAt(b)[1]);
        const drawKid = (i) => { const [x, y, k] = kidAt(i); happyKid(x, y, k, { seed: KD[i][4], t, up: T < 225.7 ? .3 : cheer ? 1 : 0 }); };
        order.filter((i) => kidAt(i)[1] <= ey).forEach(drawKid);
        ellenFig(t, ex, ey, ek, { pose: 'play', smile: cheer ? .9 : .1, lift: cheer * bp * 60 });
        order.filter((i) => kidAt(i)[1] > ey).forEach(drawKid);
        // the shadow grows downstage as it falls from very high
        if (over < 1) { const sk = land ? 1 : ease.in(inv(225.23, TL_H, T)), sx = land ? hx : HX;
          const b = () => { s.beginPath(); s.ellipse(sx, HGY, lerp(50, 380, sk), lerp(8, 34, sk), 0, 0, TAU); };
          shape(b, INK, 4, CUT); clipTo(b, () => { for (let i = 0; i < 6; i++) hline(sx - 380, sx + 380, HGY - 34 + i * 12, 3, 1, CUT, 300 + i, 2); }); }
        if (land) harpCracks(HX, HGY, HW2, 1);
        // the fall: out of the loft above the frame, the whole height of it
        const fk = clamp((T - 225.23) / (TL_H - 225.23)), cy = land ? HGY - HH2 / 2 : lerp(-420, HGY - HH2 / 2, Math.pow(fk, 2.2));
        if (!land && fk > .15) for (let i = 0; i < 9; i++) { const x = HX - HW2 / 2 + 50 + i * (HW2 - 100) / 8; taper([[x, cy - HH2 / 2 - 20], [x, cy - HH2 / 2 - 420 * fk - 80 * hash(i + Math.floor(t * 12))]], 7, 1, CUT); }
        const sq = land ? 1 - .22 * hit(t, TL_H, 9) * Math.cos(sl * 30) : 1;
        withT(() => { s.translate(hx, HGY); s.scale(1 + (1 - sq) * .5, sq); s.translate(-hx, -HGY);
          const tip = over * .004, drop = over * over * .006;
          harmonica(hx, cy + drop, HW2, HH2, land ? tip : Math.sin(t * 2.2) * .03); });
        if (land) harpDust(HX, HGY, HW2, sl / 1.6);
        // the school bus from nowhere, downstage: no driver, speed lines behind it
        if (T >= 227.27) {
          const moving = T < 229.83;
          if (moving) for (let i = 0; i < 8; i++) taper([[bx - 340 - i * 24, BUSY - 50 - i * 26], [bx - 340 - i * 24 - 200 - 90 * hash(i + Math.floor(T * 12)), BUSY - 50 - i * 26]], 7, 1, CUT);
          withT(() => { s.translate(0, moving ? Math.sin(T * 40) * 3 : 0); schoolBus(bx, BUSY, BUSK, { t: moving ? T : 0, kids: 0, driver: 'none', lights: false }); });
          if (T >= 228.27 && T < 228.6) for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i - 4.5) * .3; flick(busFrontAt(bx) + 4 + Math.cos(a) * 46, HGY - 100 + Math.sin(a) * 70, a, 80, 7, CUT); }
        }
      });
    });
    if (land && sl < 2 / 24) fx({ inv: 1 });
  }

  chapter('p6a', 187.0, 230.4, [
    [187.0, fillWide],
    [191.6, bluesArrive],
    [196.0, closePlay],
    [198.37, approve],
    [200.93, fullEarly],
    [205.2, acrobat],
    [210.0, pogo],
    [220.6, kidsDance],
    [225.2, harmCrash],
  ]);
})();
