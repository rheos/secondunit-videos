// w6-outro: FINAL INSTRUMENTAL / OUTRO, 187.0-282.5 (Bob's beats 28-31, STORYBOARD.md "## Final instrumental").
// Ellen plays an enormous empty stage; we slowly find Jimi six rows back; she finishes, he stands and claps;
// the house fills in waves (kids, musicians, ordinary people) but her guitar is already in its case; she drives
// the school bus into the dawn and finds Jimi in the rear-view mirror, last seat, with his guitar. Small smile.
(() => {
  const B = FEAT.beats;
  const bk = (c = INK) => shape(() => { s.beginPath(); s.rect(-60, -60, W + 120, H + 120); }, c);
  const rect = (x, y, w, h) => () => { s.beginPath(); s.rect(x, y, w, h); };
  const ell = (x, y, rx, ry, a = 0) => () => { s.beginPath(); s.ellipse(x, y, rx, ry, a, 0, TAU); };
  const tw = (t) => onTwos(t);
  const cam = (fx, fy, z, fn) => withT(() => { s.translate(W / 2, H / 2); s.scale(z, z); s.translate(-fx, -fy); fn(); });
  // harmonica phrases (source/harmonica-band.json + Robin's list): the wind lives inside them
  const HP = [[186.0, 189.4], [196.0, 200.2], [210.0, 215.6], [223.7, 224.9], [232.0, 236.2], [242.0, 248.2], [258.0, 261.8], [266.0, 268.4]];
  const harm = (t) => { let m = 0; for (const [a, b] of HP) m = Math.max(m, smooth(inv(a - .4, a + .3, t)) * (1 - smooth(inv(b - .3, b + .5, t)))); return m; };
  const beatPhase = (t) => { const i = lastBeat(t); if (i < 0 || i >= B.length - 1) return .5; return clamp((t - B[i]) / (B[i + 1] - B[i])); };
  const snapBeat = (t) => { const i = lastBeat(t); return B[Math.min(B.length - 1, i + 1)]; };

  // ---------- ghost: draw fn onto a side canvas, lay it down at alpha (Jimi only) ----------
  let OC = null;
  function ghost(alpha, fn) {
    if (alpha >= .99) { fn(); return; }
    if (alpha <= .01) return;
    if (!OC) OC = document.createElement('canvas');
    if (OC.width !== s.canvas.width || OC.height !== s.canvas.height) { OC.width = s.canvas.width; OC.height = s.canvas.height; }
    const oc = OC.getContext('2d'), keep = s, m = s.getTransform();
    oc.setTransform(1, 0, 0, 1, 0, 0); oc.globalAlpha = 1; oc.clearRect(0, 0, OC.width, OC.height); oc.setTransform(m);
    s = oc; try { fn(); } finally { s = keep; }
    withT(() => { s.setTransform(1, 0, 0, 1, 0, 0); s.globalAlpha = alpha; s.drawImage(OC, 0, 0); });
  }
  // a carved piece with a CUT edge round it, so its black hair reads against the dark house
  function piece(n, x, y, h, o = {}, ow = 4) {
    withT(() => { s.filter = 'brightness(0) invert(1)'; for (let i = 0; i < 8; i++) { const a = i * TAU / 8; put(n, x + Math.cos(a) * ow, y + Math.sin(a) * ow, h, o); } });
    put(n, x, y, h, o);
  }
  const JC = [.26, .17, .46, .33];                       // Jimi's head + afro inside jimi-helsinki
  const JC68 = [.36, 0, .64, .27];                     // Jimi 1968: hat and grin, for the warm moments
  function jimiWarm(x, y, h, o = {}) {                   // centre (x, y), h px tall
    const w = h * (JC68[2] * 407) / (JC68[3] * 892);
    clipTo(ell(x, y, w * .56, h * .54), () => piece('jimi-1968', x, y, h, { crop: JC68, ax: .5, ay: .5, flip: !!o.flip }, Math.max(2.5, h * .03)));
  }
  function jimiHead(x, y, h, o = {}) {                   // centre (x, y), h px tall
    const w = h * (JC[2] * 656) / (JC[3] * 1090);
    clipTo(ell(x, y + h * .02, w * .5 + 6, h * .5 + 6, o.rot || 0), () => piece('jimi-helsinki', x, y, h, { crop: JC, ax: .5, ay: .5, rot: o.rot || 0, flip: !!o.flip }, Math.max(2.5, h * .03)));
  }

  // ---------- Jimi in a theatre seat: fringed psychedelic jacket, head from the Helsinki piece ----------
  // origin = top centre of his seat back; k = row scale; o.rise 0..1 (stands), o.clap 0..1 (hands apart), o.flut (fringe wind)
  function jimiSeat(x, y, k, o = {}) {
    const { rise = 0, clap = 0, flut = 0, t = 0, nod = 0 } = o;
    withT(() => {
      s.translate(x, y - rise * 150 * k); s.scale(k, k);
      // fringe hanging off the sleeves, blown by the harmonica wind
      for (const sd of [-1, 1]) for (let i = 0; i < 9; i++) {
        const fy = -8 + i * 16, ang = Math.PI / 2 + sd * (.25 + flut * (.7 + .35 * Math.sin(tw(t) * 9 + i))), x0 = sd * (60 + i * 1.2);
        taper([[x0, fy], [x0 + Math.cos(ang) * 40, fy + Math.sin(ang) * 40]], 4, 1, CUT);
      }
      const tor = () => pathOf(chisel([[-50, -30], [50, -30], [62, 30], [58, 230], [-58, 230], [-62, 30]], 77, 3));
      shape(tor, INK, 5, CUT);
      clipTo(tor, () => {                               // the psychedelic jacket: swirls and wavy bands cut into black
        rows(-70, -30, 70, 230, .35, 30, () => 4, CUT, 9, 2);
        for (const [cx, cy, r] of [[-26, 40, 22], [28, 110, 26], [-22, 170, 20]]) { shape(ell(cx, cy, r, r), INK, 5, CUT); shape(ell(cx, cy, r * .4, r * .4), CUT); }
      });
      shape(() => pathOf([[-18, -32], [0, 14], [18, -32]]), CUT, 3);         // open shirt collar
      if (rise < .5) {                                                       // seated: arms down, hands out of sight
        taper([[-54, -18], [-62, 80], [-58, 160]], 24, 20, INK); taper([[54, -18], [62, 80], [58, 160]], 24, 20, INK); taper([[-66, -10], [-72, 150]], 3, 3, CUT); taper([[66, -10], [72, 150]], 3, 3, CUT);
      } else {                                                               // standing, clapping palm to palm at the chest
        const op = clap, hx = 0, hy = 30;
        for (const sd of [-1, 1]) {
          const heel = [hx + sd * (3 + op * 16), hy];
          const armP = [[sd * 54, -16], [sd * 84, 80], [heel[0] + sd * 12, heel[1] + 18]]; taper(armP, 42, 34, CUT); taper(armP, 30, 24, INK);
          withT(() => { s.translate(heel[0], heel[1]); s.rotate(sd * op * .55); s.scale(sd * 1.3, 1.3);
            shape(() => pathOf([[0, 0], [16, -4], [18, -60], [10, -76], [-1, -72], [-2, -6]]), CUT, 5);
            for (let f = 0; f < 3; f++) taper([[4 + f * 4, -44], [5 + f * 4, -66]], 2, 1.5, INK); taper([[14, -22], [22, -36]], 4, 3, INK); });
        }
        if (op < .12) for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * .42; flick(hx + Math.cos(a) * 46, hy - 30 + Math.sin(a) * 46, a, 34, 5, CUT); }
      }
    });
    if (rise > .5) jimiWarm(x, y - (rise * 150 + 100) * k, 170 * k);
    else jimiHead(x + nod * 2 * k, y - (rise * 150 + 92) * k + nod * 4 * k, 150 * k, { rot: -.08 + nod * .06 });
  }

  // ---------- ordinary people, kids and musicians in the seats ----------
  function patron(x, y, k, seed, o = {}) {           // origin = top centre of the seat back
    const r = rng(seed * 7 + 3), v = Math.floor(r() * 6), glasses = r() > .7, cheer = o.cheer || 0;
    withT(() => { s.translate(x, y); s.scale(k, k); s.rotate((r() - .5) * .1);
      if (cheer > .05) for (const sd of [-1, 1]) {                         // arms up, applauding over their heads
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
      if (v === 0) { shape(ell(0, -72, 46, 9), INK); shape(rect(-24, -104, 48, 32), INK); taper([[-24, -78], [24, -78]], 4, 4, CUT); }      // fedora
      else if (v === 1) shape(() => { s.beginPath(); s.ellipse(0, -56, 31, 30, 0, Math.PI * 1.02, -.02); s.lineTo(30, -40); s.lineTo(25, -60); s.lineTo(-25, -60); s.lineTo(-30, -40); s.closePath(); }, INK);  // bob
      else if (v === 2) { taper([[-20, -74], [0, -79], [20, -74]], 3, 3); }                                            // bald
      else if (v === 3) { shape(() => { s.beginPath(); s.ellipse(0, -60, 29, 20, 0, Math.PI, 0); }, INK); dot(0, -86, 13, INK); }   // bun
      else if (v === 4) { shape(() => { s.beginPath(); s.ellipse(0, -62, 29, 19, 0, Math.PI, 0); }, INK); shape(() => pathOf([[0, -64], [44, -60], [40, -54], [0, -58]]), INK); }  // cap
      else { const rr = rng(seed); for (let i = 0; i < 11; i++) { const a = Math.PI + i * Math.PI / 10; dot(Math.cos(a) * 28, -50 + Math.sin(a) * 30, 9 + rr() * 3, INK); } }  // curls
    });
  }
  function musician(x, y, k, seed, o = {}) {
    const r = rng(seed * 13 + 5), kind = Math.floor(r() * 3);
    if (kind === 0) withT(() => { s.translate(x, y); s.scale(k, k);                 // guitar neck over the shoulder
      taper([[40, 120], [-80, -130]], 18, 14, INK); taper([[40, 120], [-80, -130]], 4, 3, CUT); shape(() => pathOf([[-74, -128], [-96, -170], [-110, -160], [-86, -122]]), INK, 3, CUT); });
    patron(x, y, k, seed + 101, o);
    if (kind === 1) withT(() => { s.translate(x, y); s.scale(k, k);                 // trumpet to the lips
      taper([[0, -30], [56, -26]], 8, 8, INK); shape(ell(66, -26, 12, 22), CUT, 4); });
    else if (kind === 2) withT(() => { s.translate(x, y); s.scale(k, k);            // drumsticks up
      taper([[-30, 0], [-62, -120]], 7, 4, CUT); taper([[30, 0], [62, -120]], 7, 4, CUT); dot(-62, -120, 6, CUT); dot(62, -120, 6, CUT); });
  }

  // ---------- THE HOUSE, seen from the stage: a raked fan of rows, white-line seats on black ----------
  const NR = 13, NJ = 8;
  const rowZ = (r) => 1 + r * .35, rowY = (r) => 150 + 900 / rowZ(r);
  const seatXw = (sd, j) => sd * (175 + j * 150);
  const JIMI = { r: 5, sd: 1, j: 1 };
  const NAMED = { '2,-1,1': 'bob', '3,1,3': 'bey', '6,-1,2': 'mj',     // pixies span row 1, right of the aisle, seats 0-3
    // Bob's draft-2 notes: 'add more blues artists popping up in seats as did hendrix and me' (Otis Spann: no free photo yet)
    '2,1,1': 'muddy', '3,-1,0': 'hopkins', '4,1,0': 'richard', '3,-1,2': 'joplin', '4,-1,3': 'berry', '6,1,3': 'tharpe' };
  // carved blues pieces: [crop, height at row scale 1]
  const BLUES = { muddy: [[0, 0, 1, .62], 270], hopkins: [[0, 0, 1, .55], 260], richard: [[0, 0, 1, 1], 230], joplin: [[0, 0, .82, .52], 270],
    berry: [[.04, 0, .82, .5], 270], tharpe: [[0, 0, 1, .42], 260] };
  const T_BLUES = { muddy: 247.25, hopkins: 247.65, richard: 248.05, joplin: 248.45, berry: 248.85, tharpe: 249.25 };
  const T_KIDS = [240.4, 244.9], T_MUS = [245.25, 249.5], T_PPL = [249.9, 254.2];
  function who(r, sd, j) {
    const id = r * 40 + (sd > 0 ? 20 : 0) + j, h = hash(id * 977 + 13), h2 = hash(id * 131 + 7);
    if (r === JIMI.r && sd === JIMI.sd && j === JIMI.j) return null;
    if (r === 1 && sd === 1 && j <= 3) return null;
    const nm = NAMED[`${r},${sd},${j}`];
    if (nm) return { cat: 'named', nm, ta: BLUES[nm] ? snapBeat(T_BLUES[nm] - .2) : { bob: 245.27, bey: 245.80, mj: 246.30 }[nm] };
    const near = r <= 5 && j <= 4;
    const cat = near ? (h < .45 ? 'kid' : h < .65 ? 'mus' : 'ppl') : (h < .18 ? 'kid' : h < .32 ? 'mus' : 'ppl');
    const win = cat === 'kid' ? T_KIDS : cat === 'mus' ? T_MUS : T_PPL;
    return { cat, ta: snapBeat(lerp(win[0], win[1], h2)), seed: id };
  }
  const popK = (t, ta) => t < ta ? 0 : ease.back(inv(ta, ta + .25, tw(t)));
  function houseWalls(t, light) {
    // back wall, balcony rail, the doors at the back; side walls with boxes
    shape(() => pathOf([[0, 0], [W, 0], [W, 1100], [1240, 300], [680, 300], [0, 1100]]), INK);
    clipTo(rect(690, 40, 540, 270), () => rows(690, 40, 1230, 310, 0, 22, (u) => .5 + u * 2.5, CUT));
    taper([[650, 214], [1270, 214]], 7, 7, CUT); for (let i = 0; i < 16; i++) taper([[668 + i * 39, 214], [668 + i * 39, 250]], 3, 3, CUT);
    for (const dx of [-120, 120]) { shape(() => { s.beginPath(); s.moveTo(960 + dx - 34, 316); s.lineTo(960 + dx - 34, 272); s.arc(960 + dx, 272, 34, Math.PI, 0); s.lineTo(960 + dx + 34, 316); }, INK, 4, CUT); }
    shape(rect(918, 236, 84, 30), INK, 3, CUT); carveText('EXIT', 960, 251, 20, CUT, { w: 56 });
    for (const sd of [-1, 1]) for (let b = 0; b < 3; b++) {                // opera boxes on the side walls
      const u = .2 + b * .26, x = 960 + sd * lerp(300, 900, u), y = lerp(200, 90, u), bw = lerp(70, 170, u), bh = lerp(90, 210, u);
      shape(() => { s.beginPath(); s.moveTo(x - bw / 2, y + bh); s.lineTo(x - bw / 2, y + bw / 2); s.arc(x, y + bw / 2, bw / 2, Math.PI, 0); s.lineTo(x + bw / 2, y + bh); s.closePath(); }, INK, Math.max(3, 6 * u), CUT);
      taper([[x - bw / 2, y + bh * .7], [x + bw / 2, y + bh * .7]], 5 * u + 2, 5 * u + 2, CUT);
      for (let i = 0; i < 4; i++) taper([[x - bw / 2 + 6 + i * bw * .08, y + bw * .3], [x - bw / 2 + 4 + i * bw * .07, y + bh * .66]], 2, 4, CUT);
    }
  }
  function seatFront(x, y, k, lit) {
    const w = 58, h = 118, lw = Math.max(2.4, 6 * k);
    const mk = () => { s.beginPath(); s.moveTo(x - w * k, y + h * k); s.lineTo(x - w * k, y + 18 * k); s.quadraticCurveTo(x - w * k, y, x - (w - 18) * k, y); s.lineTo(x + (w - 18) * k, y); s.quadraticCurveTo(x + w * k, y, x + w * k, y + 18 * k); s.lineTo(x + w * k, y + h * k); s.closePath(); };
    shape(mk, INK, lw, CUT);
    if (lit > .15) clipTo(mk, () => rows(x - w * k, y, x + w * k, y + h * k, 0, Math.max(5, 15 * k), (u) => lit * (1 - u) * 5 * k + .2, CUT));
    shape(rect(x - 44 * k, y + 70 * k, 88 * k, 50 * k), INK, Math.max(2, 4 * k), CUT);
  }
  // o: { jimi: {alpha, rise, clap, flut, nod} | null, fill: true, cheer: 0..1 }
  function house(t, o = {}) {
    bk(INK);
    houseWalls(t);
    for (let r = NR - 1; r >= 0; r--) {
      const z = rowZ(r), k = 1 / z, y = rowY(r), lit = clamp(1.1 - r * .16);
      shape(rect(-60, y + 60 * k, W + 120, H), INK);
      taper([[960 - 1300 / z, y + 128 * k], [960 + 1300 / z, y + 128 * k]], Math.max(2, 5 * k), Math.max(2, 5 * k), CUT);
      for (const sd of [-1, 1]) for (let j = NJ - 1; j >= 0; j--) seatFront(960 + seatXw(sd, j) / z, y, k, lit);
      if (o.fill) {
        for (const sd of [-1, 1]) for (let j = NJ - 1; j >= 0; j--) {
          const p = who(r, sd, j); if (!p) continue;
          const pk = popK(t, p.ta); if (pk <= 0) continue;
          const x = 960 + seatXw(sd, j) / z, kk = k * pk, cl = rect(x - 400 * k, -2000, 800 * k, y + 104 * k + 2000); cheer = o.cheer ? o.cheer * smooth(inv(p.ta + .5, p.ta + 1, t)) : 0;
          clipTo(cl, () => {
          if (p.cat === 'kid') kid(x, y + (-30 + 186 * .85) * kk + (1 - pk) * 60 * k, .85 * kk, { seed: p.seed, t });
          else if (p.cat === 'mus') musician(x, y + (1 - pk) * 60 * k, kk, p.seed, { cheer, t });
          else if (p.cat === 'ppl') patron(x, y + (1 - pk) * 60 * k, kk, p.seed, { cheer, t });
          else if (p.nm === 'bob') piece('bob-1989', x + 6 * k, y + 120 * k, 250 * kk, { crop: [0, 0, 1, .7], ax: .5, ay: 1 });
          else if (p.nm === 'bey') piece('beyonce', x, y + 120 * k, 260 * kk, { crop: [.1, 0, .8, .55], ax: .5, ay: 1 });
          else if (p.nm === 'mj') piece('mj-1984', x, y + 120 * k, 250 * kk, { crop: [0, 0, 1, .6], ax: .5, ay: 1 });
          else if (BLUES[p.nm]) piece(p.nm, x, y + 120 * k, BLUES[p.nm][1] * kk, { crop: BLUES[p.nm][0], ax: .5, ay: 1 });
          });
        }
        if (r === 1) { const pk = popK(t, 246.83); if (pk > 0) { const z1 = rowZ(1), x0 = 960 + 175 / z1 - 60 / z1, x1 = 960 + 625 / z1 + 60 / z1;
          clipTo(rect(x0 - 200, -2000, x1 - x0 + 400, y + 104 / z1 + 2000), () => piece('pixies', (x0 + x1) / 2, y + 150 / z1, (x1 - x0) / 2.66 * 1.0 * pk, { crop: [0, 0, 1, .55], ax: .5, ay: 1 })); } }
      }
      if (r === JIMI.r && o.jimi) {
        const J = o.jimi, x = 960 + seatXw(JIMI.sd, JIMI.j) / z;
        clipTo(rect(x - 400 * k, -2000, 800 * k, y + 104 * k + 2000), () => ghost(J.alpha ?? .7, () => jimiSeat(x, y, k, { ...J, t })));
      }
    }
  }
  // the programmes blown through the house by the harmonica (screen space)
  function programs(t, t0, t1, n, seed) {
    for (let i = 0; i < n; i++) {
      const st = t0 + i * (t1 - t0) / n, u = (tw(t) - st) / 1.6; if (u < 0 || u > 1) continue;
      const r = rng(seed + i), x = lerp(-120, W + 120, u), y = lerp(200 + r() * 600, 120 + r() * 500, u) + Math.sin(u * 9 + i) * 40;
      withT(() => { s.translate(x, y); s.rotate(u * 8 * (r() > .5 ? 1 : -1) + i);
        shape(rect(-34, -46, 68, 92), CUT, 4); for (let l = 0; l < 5; l++) taper([[-22, -26 + l * 14], [22, -26 + l * 14]], 3, 3, INK); });
    }
  }

  // ---------- THE STAGE (from the house): stage() plus a valance and curtains that stir, fly lines, a spot ----------
  function curtains(t, w) {
    for (const sd of [-1, 1]) {
      const bul = (u) => w * (110 + 70 * snoise(tw(t) * 1.6 + u * 1.3, sd + 9)) * Math.pow(u, .9);
      const ex = (u, f) => sd < 0 ? f * (262 + bul(u)) : W - f * (262 + bul(u));
      const P = [[sd < 0 ? -20 : W + 20, -20]]; for (let i = 0; i <= 14; i++) { const u = i / 14; P.push([ex(u, 1), u * 772]); } P.push([sd < 0 ? -20 : W + 20, 772]);
      shape(() => pathOf(P), INK, 5, CUT);
      for (let f = 1; f < 6; f++) { const pts = []; for (let i = 0; i <= 14; i++) { const u = i / 14; pts.push([ex(u, f / 6), u * 768]); } taper(pts, 2, 6, CUT); }
    }
    // valance: a heavy pelmet with a scalloped hem
    const hem = (x) => 108 + Math.abs(Math.sin(x / W * Math.PI * 9)) * -26 + w * 14 * Math.sin(tw(t) * 5 + x * .01);
    const V = [[-20, -20], [W + 20, -20]]; for (let x = W + 20; x >= -20; x -= 40) V.push([x, hem(x)]);
    shape(() => pathOf(V), INK, 5, CUT);
    for (let i = 0; i < 24; i++) { const x = 40 + i * 80; taper([[x, 0], [x + w * 8 * Math.sin(tw(t) * 6 + i), hem(x) - 12]], 2, 5, CUT); }
  }
  function flyLines(t, w) {
    for (let i = 0; i < 7; i++) { const x = 360 + i * 200 + (i % 2) * 40, len = 260 + (i * 97) % 220, sw = w * 18 * Math.sin(tw(t) * 4 + i);
      taper([[x, 100], [x + sw, 100 + len]], 2.5, 2.5, CUT); shape(rect(x + sw - 14, 100 + len, 28, 40), INK, 3, CUT); }
    taper([[300, 40], [1620, 40]], 6, 6, CUT);
    for (let i = 0; i < 6; i++) { const x = 420 + i * 216; shape(() => pathOf([[x - 26, 40], [x + 26, 40], [x + 18, 86], [x - 18, 86]]), INK, 4, CUT); }
  }
  function spot(x, yF, rB, rT = 34) {
    const cone = () => pathOf([[x - rT, -20], [x + rT, -20], [x + rB, yF], [x - rB, yF]]);
    clipTo(cone, () => rows(x - rB, -20, x + rB, yF, Math.PI / 2, 15, () => 2.6, CUT));
    shape(ell(x, yF, rB * 1.08, rB * .2), CUT);
  }
  function soundFlicks(x, y, t, amt, seed) {   // gouge flicks bursting off the guitar on the beat
    const p = beatPulse(t, 5) * amt; if (p < .08) return;
    const r = rng(seed + lastBeat(t));
    for (let i = 0; i < 9; i++) { const a = -Math.PI * .1 - r() * Math.PI * .8 + (r() > .5 ? Math.PI : 0) * 0, d = 90 + (1 - p) * 120 + r() * 60;
      flick(x + Math.cos(a) * d, y + Math.sin(a) * d, a, 40 + 50 * p, 5 + 4 * p, CUT); }
  }
  function onStage(t, o = {}) {
    const { w = 0, ex = 960, ey = 900, ek = .42, pose = 'play', facing = 1, spotOn = true, slide = null, bow = 0, smile = 0, spin = 1, roll = 0, lift = 0 } = o;
    stage({ curtain: 1 });
    flyLines(t, w);
    if (spotOn) spot(ex, ey, 150 * ek / .42);
    curtains(t, w);
    const sl = slide ?? (.45 + .3 * Math.sin(tw(t) * (2 + 6 * harm(t))));
    withT(() => { s.translate(ex, ey - lift * ek); s.rotate(bow * facing);
      if (roll) { s.translate(0, -260 * ek); s.rotate(roll); s.translate(0, 260 * ek); }    // cartwheel / somersault about her middle
      s.scale(spin, 1);                                                                    // twirl: a cut-out turning on its pin
      ellen(0, 0, ek, { pose, t: tw(t), wind: w, facing, slide: sl, smile }); });
  }
  // the stage seen from the back of the house: miniature stage inside the proscenium, seat backs (or heads) in front
  function fromHouse(t, P, o = {}) {
    bk(INK);
    const [px, py, pw, ph] = P;
    clipTo(rect(px, py, pw, ph), () => withT(() => { s.translate(px, py); s.scale(pw / W, ph / H); onStage(t, o); }));
    shape(() => { s.beginPath(); s.moveTo(px - 40, py + ph); s.lineTo(px - 40, py - 10); s.quadraticCurveTo(px + pw / 2, py - 120, px + pw + 40, py - 10); s.lineTo(px + pw + 40, py + ph); }, null, 14, CUT);
    for (let i = 0; i < 14; i++) { const u = i / 13, x = lerp(px - 40, px + pw + 40, u), y = py - 10 - Math.sin(u * Math.PI) * 82; flick(x, y, -Math.PI / 2, 26, 6, CUT); }
    // the stage lip throws light up into the front of the house
    taper([[px - 60, py + ph + 6], [px + pw + 60, py + ph + 6]], 10, 10, CUT);
  }
  function backsRows(t, y0, sc, heads, cheer) {
    // seat backs seen from behind (black humps, lit rims), nearer rows bigger; heads/arms if the house is full
    for (let r = 4; r >= 0; r--) {
      const k = sc * (1 + (4 - r) * .32), y = y0 + (4 - r) * 92 * sc * (1 + (4 - r) * .2), pitch = 150 * k;
      shape(rect(-60, y + 30 * k, W + 120, H), INK);
      for (let j = -9; j <= 9; j++) {
        if (j === 0) continue;
        const x = 960 + (j - Math.sign(j) * .45) * pitch;
        if (heads) {
          const sd = 1000 + r * 31 + j, rr = rng(sd), v = Math.floor(rr() * 5), up = cheer * (.6 + .4 * Math.sin(tw(t) * 8 + j * 1.7 + r));
          if (up > .2 && rr() > .35) for (const s_ of [-1, 1]) { taper([[x + s_ * 40 * k, y - 20 * k], [x + s_ * 54 * k, y - 120 * k * up], [x + s_ * 30 * k, y - 180 * k * up]], 22 * k, 16 * k, INK);
            s.beginPath(); s.arc(x + s_ * 30 * k, y - 186 * k * up, 13 * k, Math.PI, 0); s.lineWidth = 4 * k; s.strokeStyle = CUT; s.stroke(); }
          shape(ell(x, y - 46 * k, 30 * k, 35 * k), INK);
          s.beginPath(); s.ellipse(x, y - 46 * k, 30 * k, 35 * k, 0, Math.PI * 1.1, Math.PI * 1.9); s.lineWidth = 5 * k; s.strokeStyle = CUT; s.stroke();
          if (v === 0) { shape(ell(x, y - 74 * k, 48 * k, 9 * k), INK, 3 * k, CUT); shape(rect(x - 24 * k, y - 104 * k, 48 * k, 30 * k), INK, 3 * k, CUT); }
          else if (v === 1) { dot(x, y - 88 * k, 13 * k, INK); s.beginPath(); s.arc(x, y - 88 * k, 13 * k, Math.PI, 0); s.lineWidth = 3 * k; s.strokeStyle = CUT; s.stroke(); }
          shape(() => pathOf([[x - 64 * k, y + 10 * k], [x - 50 * k, y - 18 * k], [x + 50 * k, y - 18 * k], [x + 64 * k, y + 10 * k]]), INK, 3 * k, CUT);
        }
        const mk = () => { s.beginPath(); s.moveTo(x - 62 * k, y + 120 * k); s.lineTo(x - 62 * k, y + 22 * k); s.quadraticCurveTo(x - 62 * k, y, x - 40 * k, y); s.lineTo(x + 40 * k, y); s.quadraticCurveTo(x + 62 * k, y, x + 62 * k, y + 22 * k); s.lineTo(x + 62 * k, y + 120 * k); s.closePath(); };
        shape(mk, INK);
        taper([[x - 58 * k, y + 14 * k], [x - 38 * k, y + 3 * k], [x + 38 * k, y + 3 * k], [x + 58 * k, y + 14 * k]], 7 * k, 7 * k, CUT);
        flicks(x - 50 * k, y + 30 * k, x + 50 * k, y + 110 * k, 3, Math.PI / 2, 26 * k, 3 * k, r * 50 + j);
      }
    }
  }

  // ---------- dawn: carved sky that lightens toward the horizon, the sun breaking ----------
  function dawn(t, hz, sx, sy, sr, rays = 0) {
    bk(INK);
    clipTo(rect(-60, -60, W + 120, hz + 60), () => rows(-60, -60, W + 60, hz, 0, 18, (u) => Math.max(0, (u - .15) * 18), CUT));
    for (let i = 0; i < 15; i++) { const a = Math.PI + (i + .5) * Math.PI / 15, l = sr * (1.6 + .9 * rays + ((i * 7) % 5) * .15);
      taper([[sx + Math.cos(a) * sr * 1.15, sy + Math.sin(a) * sr * 1.15], [sx + Math.cos(a) * l * 1.6, sy + Math.sin(a) * l * 1.6]], 14, 1, CUT); }
    shape(ell(sx, sy, sr * 1.1, sr * 1.1), INK);
    shape(ell(sx, sy, sr, sr), CUT);
  }

  // Bob (draft-2 notes): 'could she be twirling, cartwheeling or somersaulting while playing guitar?'
  // twirl: n full turns over [a, b], held on twos; a cut-out on its pin, so |spin| passes through a sliver
  const twirl = (t, a, b, n = 1) => { const u = inv(a, b, tw(t)); return u <= 0 || u >= 1 ? 1 : Math.cos(ease.inOut(u) * n * TAU); };
  // ===================== SHOTS =====================
  // 187.0  the enormous empty stage, Ellen tiny in a spot, playing to no one (harmonica 186-189: the wind gets up)
  function emptyStage(t, tl) {
    const z = kf(tw(t), [[187.0, 1.55], [191.5, 1.0]], ease.out);
    cam(960, 690, z, () => onStage(t, { w: .55 * harm(t), ex: 960, ey: 900, ek: .42 }));
  }
  // 191.57  from the back of the house: row after row of empty seats; she plays on, far away
  function emptySeats(t, tl) {
    const z = kf(tw(t), [[191.57, 1.0], [196.5, 1.12]], ease.sine);
    cam(960, 520, z, () => { fromHouse(t, [600, 150, 720, 405], { w: .2 * harm(t), ek: .42 }); backsRows(t, 640, .62, false, 0); });
  }
  // 196.53  close: she plays harder for the harmonica (196-200), the slide racing, sound flying off the guitar
  function closePlay(t, tl) {
    bk(INK);
    const hm = harm(t);
    for (let i = 0; i < 26; i++) { const a = i * TAU / 26 + .05; taper([[860 + Math.cos(a) * 260, 520 + Math.sin(a) * 260], [860 + Math.cos(a) * 1200, 520 + Math.sin(a) * 1200]], 4, 30, CUT); }
    shape(ell(860, 520, 250, 250), INK);
    const k = 2.05, x = 880, y = 1210;
    ellen(x, y, k, { pose: 'play', t: tw(t), wind: .25 + .6 * hm, slide: .4 + .35 * Math.sin(tw(t) * (3 + 9 * hm)) });
    soundFlicks(x + 18 * k, y - 300 * k, t, .5 + hm, 196);
  }
  // 200.93  low and wide from the wings: the size of the place around one woman
  function lowWide(t, tl) {
    const z = kf(tw(t), [[200.93, 1.0], [205.2, 1.18]], ease.sine);
    cam(1040, 700, z, () => onStage(t, { w: .15 * harm(t), ex: 1140, ey: 930, ek: .62, facing: -1 }));
    shape(() => pathOf([[-20, -20], [330, -20], [300, 1100], [-20, 1100]]), INK);        // the near wing curtain
    for (let i = 0; i < 5; i++) taper([[40 + i * 60, -20], [30 + i * 58, 1100]], 3, 7, CUT);
  }
  // 205.23  her eyeline: the dark empty house. Somebody is sitting six rows back. We do not notice yet.
  function darkHouse(t, tl) {
    const z = kf(tw(t), [[205.23, 1.0], [210.0, 1.4]], ease.sine);
    cam(kf(tw(t), [[205.23, 960], [210, 1010]]), kf(tw(t), [[205.23, 560], [210, 500]]), z, () => house(t, { jimi: { alpha: .55, nod: 0 } }));
  }
  // 210.0  the strong harmonica (210-215): a hurricane in her hair, the curtains blow in, she digs in
  function hurricane(t, tl) {
    const hm = harm(t);
    const z = kf(tw(t), [[210.0, 1.12], [216.2, 1.3]], ease.sine);
    cam(960, 660, z, () => {
      onStage(t, { w: hm, ex: 960, ey: 900, ek: .42, slide: .4 + .4 * Math.sin(tw(t) * 10), spin: twirl(t, snapBeat(211.0), snapBeat(212.6), 1) * twirl(t, snapBeat(213.6), snapBeat(215.2), 2) });
      for (let i = 0; i < 14; i++) { const u = wrap(tw(t) * .9 + i * .071, 1), yy = 640 + (i * 37) % 260;
        if (hm > .2) flick(lerp(1500, 420, u), yy, Math.PI + .05, 60 * hm, 4, CUT); }
    });
    soundFlicks(960 + 7, 700 - 0, t, 0, 0);
  }
  // 216.27  slow discovery: the push finds him, Jimi, row six, listening hard (harmonica 224: the fringe stirs, a nod)
  function findJimi(t, tl) {
    const fx_ = kf(tw(t), [[216.27, 1030], [220.6, 1070]]), fy_ = kf(tw(t), [[216.27, 500], [220.6, 470]]);
    const z = kf(tw(t), [[216.27, 1.6], [220.6, 2.5]], ease.inOut);     // shorter and looser (Bob: too much Jimi)
    const nod = harm(t) * (.5 + .5 * Math.sin(tw(t) * 7));
    cam(fx_, fy_, z, () => house(t, { jimi: { alpha: lerp(.5, .72, inv(216.3, 222, t)), nod, flut: .3 + .7 * harm(t) } }));
  }
  // 220.6  back on the boards: she cartwheels across the stage, still playing, and lands a somersault on the harmonica (223.7-224.9)
  function acrobat(t, tl) {
    const T = tw(t), c1 = [220.8, 221.9], c2 = [221.9, 223.0], so = [223.7, 224.7];
    const cw = (a, b) => ease.inOut(inv(a, b, T));
    const u1 = cw(...c1), u2 = cw(...c2), u3 = cw(...so);
    const ex = 520 + 380 * u1 + 380 * u2 + 140 * u3;
    const roll = (u1 + u2) * TAU + u3 * -TAU * 0;                 // two cartwheels (sideways turns)
    const flip = u3 > 0 && u3 < 1 ? -u3 * TAU : 0;                  // then a forward somersault, tucked
    const lift = (u3 > 0 && u3 < 1 ? Math.sin(u3 * Math.PI) * 320 : 0) + (Math.sin(u1 * Math.PI) + Math.sin(u2 * Math.PI)) * 60;
    const z = kf(T, [[220.6, 1.18], [225.2, 1.26]], ease.sine);
    cam(980, 700, z, () => onStage(t, { w: .3 + .7 * harm(t), ex, ey: 930, ek: .58, roll: roll + flip, lift, slide: .4 + .35 * Math.sin(T * 9) }));
    if (T >= 224.7 && T < 225.15) for (let i = 0; i < 9; i++) { const a = -Math.PI + i * Math.PI / 8; flick(ex + Math.cos(a) * 170, 935 + Math.sin(a) * 34, a, 60, 6, CUT); }
  }
  // 225.2  she finishes: the last stroke (226.77), the slide comes off, she holds the guitar up; a small bow
  function finish(t, tl) {
    const done = t >= 226.77, bowA = done ? .12 * tri(t - 228.6, .7) : 0;
    const z = kf(tw(t), [[225.2, 1.5], [230.3, 1.65]], ease.sine);
    cam(960, 650, z, () => onStage(t, { w: 0, ex: 960, ey: 900, ek: .5, pose: done ? 'hold' : 'play', slide: done ? .2 : null, bow: bowA }));
    if (!done) soundFlicks(960, 540, t, .8, 225);
  }
  // 230.37  Jimi stands up in the empty house and applauds (claps land on the beats; harmonica 232-236 in his fringe)
  function jimiClaps(t, tl) {
    const rise = ease.out(inv(230.9, 231.4, tw(t)));
    const clap = rise > .5 ? Math.pow(Math.sin(Math.PI * beatPhase(tw(t))), .7) : 0;
    const z = kf(tw(t), [[230.37, 2.3], [233.4, 2.0]], ease.sine);     // wider and shorter (Bob: too much Jimi)
    cam(1078, kf(tw(t), [[230.37, 455], [231.5, 420]]), z, () => house(t, { jimi: { alpha: .72, rise, clap, flut: .25 + .9 * harm(t) } }));
    programs(t, 233.0, 236.0, 3, 230);
  }
  // 233.4  from the back of the house: one man on his feet in the empty rows; on the far stage she bows again
  function bowWide(t, tl) {
    const z = kf(tw(t), [[233.4, 1.0], [236.53, 1.08]], ease.sine), bowA = .14 * tri(tw(t) - 234.6, .8);
    cam(960, 520, z, () => { fromHouse(t, [600, 150, 720, 405], { w: .2 * harm(t), ek: .42, pose: 'hold', slide: .2, bow: bowA }); backsRows(t, 640, .62, false, 0); });
    programs(t, 233.6, 236.0, 2, 233);
  }
  // 236.53  meanwhile on the boards: the guitar already lies in its case; the lid comes down (239.07), latches (239.83, 240.33)
  const CASE_P = [[0, 150], [52, 140], [74, 100], [72, 56], [50, 28], [44, 4], [56, -24], [58, -60], [40, -92], [18, -110], [16, -230], [24, -244], [20, -270], [-20, -270], [-24, -244], [-16, -230], [-18, -110], [-40, -92], [-58, -60], [-56, -24], [-44, 4], [-50, 28], [-72, 56], [-74, 100], [-52, 140]];
  function caseShut(t, tl) {
    bk(CUT);
    for (let i = 0; i < 9; i++) taper([[-20, 40 + i * 130], [W + 20, 60 + i * 128]], 6, 6, INK);
    for (let i = 0; i < 26; i++) { const r = rng(i + 5); flick(r() * W, 60 + Math.floor(r() * 8) * 130 + 40, 0, 90, 3, INK); }
    const shake = hit(t, 239.07, 9) * 10 * Math.sin(t * 90), K = 2.9;
    const th = Math.PI * (1 - ease.in(inv(237.9, 239.07, tw(t)))), sy = Math.cos(th), shut = t >= 239.07;
    withT(() => { s.translate(940 + shake, 720); s.rotate(-.04);
      if (shut) { guitarCase(0, 0, K, -Math.PI / 2); }
      else withT(() => { s.rotate(-Math.PI / 2); s.scale(K, K);           // case local: y along the case, x across
        const mk = () => smoothPath(CASE_P);
        mk(); s.lineWidth = 12; s.strokeStyle = INK; s.stroke(); shape(mk, INK);
        withT(() => { s.scale(.9, .95); clipTo(() => smoothPath(CASE_P), () => { shape(rect(-90, -300, 180, 470), CUT); rows(-90, -300, 90, 170, .8, 9, () => 2.6, INK); }); });
        guitar(0, 92, .5, -Math.PI / 2, .5, 0);                                // the slide guitar, laid in its case
        // the lid, hinged along the case's far edge (x = 74): flat open beside it, then flipped over
        withT(() => { s.translate(74, 0); s.scale(sy, 1); s.translate(-74, 0);
          const lid = () => smoothPath(CASE_P);
          lid(); s.lineWidth = 12; s.strokeStyle = INK; s.stroke();
          if (sy < 0) { shape(lid, CUT); clipTo(lid, () => rows(-90, -300, 90, 170, -.8, 10, () => 3, INK)); lid(); s.lineWidth = 5; s.strokeStyle = INK; s.stroke(); }
          else { shape(lid, INK); clipTo(lid, () => taper([[-48, 120], [-62, 60], [-40, 10], [-44, -50], [-14, -100], [-10, -240]], 3, 2, CUT)); }
        });
      });
      if (shut) {
        if (t < 239.6) for (let i = 0; i < 14; i++) { const a = i * TAU / 14; flick(Math.cos(a) * 700, Math.sin(a) * 260, a, 90 * hit(t, 239.07, 3), 7, INK); }
        for (const [lx, lt] of [[-160, 239.83], [350, 240.33]]) if (t >= lt && t < lt + .45) for (let i = 0; i < 5; i++) flick(lx, -240, -Math.PI / 2 + (i - 2) * .4, 60, 6, INK);
      }
    });
  }
  // 240.33  the house fills: first the school-bus kids pop into the seats on the beats
  function kidsCome(t, tl) {
    const z = kf(tw(t), [[240.33, 2.2], [245.2, 1.5]], ease.inOut);
    cam(kf(tw(t), [[240.33, 1060], [245.2, 1010]]), kf(tw(t), [[240.33, 470], [245.2, 560]]), z, () =>
      house(t, { fill: true, jimi: { alpha: .72, rise: 1, clap: Math.pow(Math.sin(Math.PI * beatPhase(tw(t))), .7), flut: .25 + .9 * harm(t) } }));
    programs(t, 242.3, 245.2, 4, 240);
  }
  // 245.23  then the musicians: Bob and his accordion, Beyonce, Michael Jackson, the Pixies, horns and guitars;
  //         the strong harmonica (246.5) blows the programmes through the house
  function musiciansCome(t, tl) {
    const z = kf(tw(t), [[245.23, 1.75], [249.9, 1.55]], ease.sine);
    cam(1010, 600, z, () => house(t, { fill: true, jimi: { alpha: .72, rise: 1, clap: Math.pow(Math.sin(Math.PI * beatPhase(tw(t))), .7), flut: .25 + .9 * harm(t) } }));
    programs(t, 245.3, 248.4, 8, 245);
  }
  // 249.97  then ordinary people, until every seat is full and the whole house is on its feet
  function peopleCome(t, tl) {
    const z = kf(tw(t), [[249.97, 1.25], [254.5, 1.0]], ease.out);
    cam(960, kf(tw(t), [[249.97, 600], [254.5, 540]]), z, () =>
      house(t, { fill: true, cheer: smooth(inv(251.5, 253.0, t)), jimi: { alpha: .72, rise: 1, clap: Math.pow(Math.sin(Math.PI * beatPhase(tw(t))), .7), flut: .25 } }));
  }
  // 254.6  the full house roars; on the far stage Ellen picks up the case and walks off into the wings
  //        (harmonica 258-261: wind lifts her hair, the curtain stirs as she goes)
  function walksOff(t, tl) {
    const u = inv(255.1, 261.9, tw(t)), ex = lerp(1180, 150, u);
    const z = kf(tw(t), [[254.6, 1.0], [262.4, 1.1]], ease.sine);
    cam(960, 470, z, () => {
      fromHouse(t, [330, 100, 1260, 709], { w: .7 * harm(t), ex, ey: 900, ek: .5, pose: 'walk', facing: -1, spotOn: true });
      backsRows(t, 830, .78, true, 1);
    });
  }
  // 262.47  dawn outside: the empty school bus pulls away from the theatre, toward the sun
  function busAway(t, tl) {
    const hz = 760;
    dawn(t, hz, 1540, hz, 150 + 20 * inv(262.4, 266.1, t), 0);
    // the theatre at the left, doors still lit
    shape(() => pathOf([[-20, 180], [520, 180], [520, hz + 10], [-20, hz + 10]]), INK, 6, CUT);
    shape(() => pathOf([[-20, 180], [270, 70], [560, 180]]), INK, 6, CUT);
    for (let i = 0; i < 4; i++) taper([[60 + i * 130, 380], [60 + i * 130, hz]], 16, 16, CUT);
    shape(rect(40, 260, 440, 96), CUT, 6); carveText('ELLEN McILWAINE', 260, 308, 46, INK, { w: 380 });
    for (let i = 0; i < 3; i++) shape(rect(110 + i * 120, 600, 70, hz - 600), CUT, 4);
    // road
    shape(rect(-60, hz, W + 120, 140), CUT, 6); for (let i = 0; i < 12; i++) { const x = wrap(i * 190 - 0, W + 200) - 100; taper([[x, hz + 70], [x + 90, hz + 70]], 8, 8, INK); }
    shape(rect(-60, hz + 140, W + 120, H), INK); clipTo(rect(-60, hz + 140, W + 120, H), () => rows(-60, hz + 140, W + 60, H, 0, 20, (u) => 4 * (1 - u), CUT));
    const u = ease.in(inv(262.9, 266.1, tw(t))), bx = lerp(820, 1700, u), bob_ = Math.sin(tw(t) * 18) * 3 * (u > 0 ? 1 : 0);
    schoolBus(bx, hz + 118 + bob_, .44, { t: tw(t) * (u > 0 ? 1 : 0), kids: 0, driver: 'ellen', lights: true });
    if (u > 0) for (let i = 0; i < 6; i++) flick(bx - 300 - i * 40, hz + 100 - (i % 3) * 20, Math.PI, 50 + 30 * u, 5, CUT);
  }
  // inside the bus, the windscreen full of dawn (common to the last three shots)
  function windscreen(t, x0, y0, x1, y1, sunU) {
    clipTo(rect(x0, y0, x1 - x0, y1 - y0), () => {
      const hz = lerp(y0, y1, .72);
      dawn(t, hz, lerp(x0, x1, .55), hz - sunU * 40, (y1 - y0) * .18, sunU);
      shape(rect(x0 - 10, hz, x1 - x0 + 20, y1 - hz + 10), INK);
      const vx = lerp(x0, x1, .45);
      shape(() => pathOf([[vx - 6, hz], [vx + 6, hz], [x1 + 200, y1 + 10], [x0 - 200, y1 + 10]]), CUT, 4);
      for (let i = 0; i < 5; i++) { const q = wrap(tw(t) * 1.4 + i / 5, 1), a = Math.pow(q, 2.2); const yy = lerp(hz, y1, a), ww = lerp(2, 30, a);
        shape(() => pathOf([[vx - ww * .3, yy], [vx + ww * .3, yy], [vx + ww * .45, yy + ww * 2], [vx - ww * .45, yy + ww * 2]]), INK); }
    });
  }
  function mirrorScene(t, x, y, w, h, jimiA, small) {
    // the bus interior reflected (looking back): aisle, seat rows, the rear window, the back bench
    clipTo(() => { s.beginPath(); s.roundRect(x, y, w, h, h * .18); }, () => {
      shape(rect(x, y, w, h), INK);
      const vx = x + w * .5, vy = y + h * .44;
      for (let i = 0; i < 8; i++) { const a = i / 7; taper([[lerp(x - w * .2, x + w * 1.2, a), y - 10], [lerp(vx - w * .12, vx + w * .12, a), vy - h * .14]], 5, 2, CUT); }
      shape(rect(vx - w * .16, vy - h * .16, w * .32, h * .3), CUT, 5);                                      // rear window
      clipTo(rect(vx - w * .16, vy - h * .16, w * .32, h * .3), () => rows(vx - w * .16, vy - h * .16, vx + w * .16, vy + h * .14, 0, 9, (u) => u * 4, INK));
      shape(rect(vx - w * .2, vy + h * .12, w * .4, h * .1), INK, 5, CUT);                                    // the back bench
      if (jimiA > .01) ghost(jimiA, () => withT(() => {
        clipTo(rect(x, y, w, vy + h * .2 - y), () => {
          const jh = h * (small ? .62 : .62);
          shape(ell(vx, vy + h * .02, jh * .36, jh * .42), CUT);
          put('jimi-helsinki', vx, vy + h * .21, jh * .62, { crop: [0, .4, 1, .42], ax: .52, ay: 1, flip: true });
          jimiWarm(vx + jh * .01, vy + h * .21 - jh * .62 - jh * .1, jh * .34);
        });
      }));
      for (let rI = 4; rI >= 0; rI--) {                                                                       // seat backs, both sides of the aisle
        const q = rI / 4, sc = lerp(1, .32, q), yy = lerp(y + h * 1.0, vy + h * .2, Math.pow(q, .7));
        for (const sd of [-1, 1]) {
          const cx = vx + sd * lerp(w * .36, w * .14, q), sw = w * .2 * sc, sh = h * .3 * sc;
          shape(() => { s.beginPath(); s.roundRect(cx - sw / 2, yy - sh, sw, sh * 1.6, sw * .25); }, INK, Math.max(3, 8 * sc), CUT);
          taper([[cx - sw * .38, yy - sh * .8], [cx + sw * .38, yy - sh * .8]], Math.max(2, 5 * sc), Math.max(2, 5 * sc), CUT);
        }
      }
    });
    shape(() => { s.beginPath(); s.roundRect(x, y, w, h, h * .18); }, null, small ? 12 : 26, INK);
    shape(() => { s.beginPath(); s.roundRect(x + (small ? 6 : 14), y + (small ? 6 : 14), w - (small ? 12 : 28), h - (small ? 12 : 28), h * .15); }, null, small ? 3 : 6, CUT);
  }
  function driverSeat(x, y, k) {   // the driver's seat back, cut white with ink stitching, behind her
    const P = () => { s.beginPath(); s.roundRect(x - 130 * k, y - 470 * k, 230 * k, 520 * k, 40 * k); };
    shape(P, CUT, 8 * k); clipTo(P, () => rows(x - 130 * k, y - 470 * k, x + 100 * k, y + 50 * k, Math.PI / 2, 26 * k, () => 3 * k, INK));
  }
  function steering(cx, cy) {
    taper([[cx + 20, cy + 40], [cx + 120, cy + 320]], 34, 40, INK);
    shape(() => { s.beginPath(); s.ellipse(cx, cy, 52, 170, -.25, 0, TAU); s.ellipse(cx, cy, 30, 146, -.25, 0, TAU, true); }, INK, 5, CUT);
  }
  // 266.1  driving: Ellen at the wheel, the wind from the window streams her hair (harmonica 266-268); the mirror is empty
  function driving(t, tl) {
    bk(INK);
    windscreen(t, 1010, 70, 1960, 760, .2);
    taper([[1010, 70], [1010, 780]], 40, 52, INK); taper([[1010, 70], [1010, 780]], 6, 6, CUT);
    clipTo(rect(-20, 120, 760, 520), () => rows(-20, 120, 740, 640, 0, 22, (u) => 1 + 2 * u, CUT));    // her side window, open
    const k = 1.5, x = 700, y = 990, sway = Math.sin(tw(t) * 2.3) * 4;
    driverSeat(x, y, k);
    ellen(x + sway, y, k, { pose: 'drive', t: tw(t), wind: .35 + .6 * harm(t), eyes: 'open' });
    steering(x + 70 * k, y - 300 * k);
    shape(() => pathOf([[-20, 760], [1940, 720], [1940, 1100], [-20, 1100]]), INK, 8, CUT);             // dash
    clipTo(() => pathOf([[-20, 760], [1940, 720], [1940, 1100], [-20, 1100]]), () => rows(-20, 720, 1940, 1100, -.02, 26, (u) => 2 + 3 * u, CUT));
    taper([[1300, -20], [1300, 70]], 18, 18, INK); mirrorScene(t, 1130, 60, 360, 130, 0, true);
    if (harm(t) > .2) for (let i = 0; i < 10; i++) { const u = wrap(tw(t) * 1.6 + i * .1, 1); flick(lerp(1000, -100, u), 200 + (i * 53) % 380, Math.PI, 70 * harm(t), 4, CUT); }
  }
  // 271.67  the mirror, close: the bus behind her is empty... then it isn't. Jimi, last seat, his guitar. (near-silence)
  function mirror(t, tl) {
    bk(INK);
    windscreen(t, -20, 600, 1940, 1100, .3);
    taper([[960, -20], [960, 150]], 40, 40, INK);
    const jit = (snoise(tw(t) * 6, 3)) * 3;
    const a = [0, .3, .6, .85][Math.floor(clamp(inv(272.4, 273.9, tw(t))) * 3.999)] * (tw(t) >= 272.4 ? 1 : 0);
    withT(() => { s.translate(0, jit); mirrorScene(t, 200, 130, 1520, 600, a, false); });
  }
  // 275.4  Ellen notices (one eyebrow up)... and on the last sound, 276.73, the small smile; the sun breaks on 279.3, 280.37
  function smile(t, tl) {
    bk(INK);
    const rays = hit(t, 279.3, 1.2) * .6 + hit(t, 280.37, 1.0) * .9;
    windscreen(t, 980, -20, 1940, 1100, .5 + rays);
    taper([[980, -20], [980, 1100]], 50, 60, INK); taper([[980, -20], [980, 1100]], 6, 6, CUT);
    mirrorScene(t, 1220, 40, 560, 200, .85, true);
    taper([[1500, -20], [1500, 40]], 20, 20, INK);
    const k = 2.55, x = 640, y = 1690;
    driverSeat(x, y, k);
    const sm = t < 276.73 ? 0 : t < 277.27 ? .5 : .75;
    ellen(x, y, k, { pose: 'drive', t: tw(t), wind: .25, eyes: t >= 275.9 && t < 276.73 ? 'brow' : 'open', smile: sm });
  }

  chapter('w6', 187.0, 282.5, [
    [187.0, emptyStage],
    [191.57, emptySeats],
    [196.53, closePlay],
    [200.93, lowWide],
    [205.23, darkHouse],
    [210.0, hurricane],
    [216.27, findJimi],
    [220.6, acrobat],
    [225.2, finish],
    [230.37, jimiClaps],
    [233.4, bowWide],
    [236.53, caseShut],
    [240.33, kidsCome],
    [245.23, musiciansCome],
    [249.97, peopleCome],
    [254.6, walksOff],
    [262.47, busAway],
    [266.1, driving],
    [271.67, mirror],
    [275.4, smile],
  ]);
})();
