// 9:16 copy of js/wch/w6-outro.js for 230.4-282.5, to be recomposed for 1080x1920 (see docs/PORTRAIT_BUILD.md). The 16:9 master file is untouched.
// w6-outro: FINAL INSTRUMENTAL / OUTRO, 187.0-282.5 (Bob's beats 28-31, STORYBOARD.md "## Final instrumental").
// Bob's draft-7 notes rebuilt 187.0-254.6: the house fills with the bus kids and the blues greats, who approve; the
// acrobatics; the guitar becomes a pogo stick; the kids dance with her on stage; the harmonica crashes down and the
// school bus pushes it away; the kids and 80s stars push the bus away and she rides off on the back of the train as
// Jimi did; back on stage a big star to a full house; she bops to the harmonica. Then (unchanged) she walks off with
// her case and drives the school bus into the dawn, and finds Jimi in the rear-view mirror. Small smile.
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

  // a school-bus kid at the show: arms that go up, can tumble, and STILL crying the whole time (Bob, draft-9 notes:
  // 'when they dance with her at the end, maybe they still should be crying at the same time. sort of Southpark')
  // (x, y) = between the feet; o.up 0..1 arms up; o.roll turns about the middle; o.spin cut-out turn
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
  // a fist with the thumb up (CUT, carved creases), sleeve below; (x, y) = the fist
  function thumbUp(x, y, k, rot = 0) {
    withT(() => { s.translate(x, y); s.rotate(rot); s.scale(k, k);
      taper([[0, 140], [0, 30]], 48, 40, CUT); taper([[0, 140], [0, 30]], 38, 32, INK);
      shape(() => { s.beginPath(); s.roundRect(-34, -22, 68, 62, 18); }, CUT, 6);
      for (let i = 0; i < 3; i++) taper([[-26, -4 + i * 14], [18, -4 + i * 14]], 3, 2);
      shape(() => { s.beginPath(); s.roundRect(-30, -82, 26, 70, 13); }, CUT, 6);
    });
  }
  // a bouquet: CUT bloom with ink centre, stem and leaf (no red: red is only Ellen's hair)
  function flower(x, y, k, rot = 0) {
    withT(() => { s.translate(x, y); s.rotate(rot); s.scale(k, k);
      taper([[0, 0], [5, 60], [0, 120]], 12, 9, CUT); taper([[0, 0], [5, 60], [0, 120]], 6, 4, INK);
      shape(() => pathOf([[4, 66], [34, 40], [44, 46], [8, 78]]), CUT, 3);
      for (let i = 0; i < 6; i++) { const a = i * TAU / 6; shape(ell(Math.cos(a) * 21, Math.sin(a) * 21, 17, 11, a), CUT, 3.5); }
      dot(0, 0, 12, INK); dot(0, 0, 5, CUT);
    });
  }
  // a bouquet thrown at ta from (x0, y0) to (x1, y1) over dur; after that it lies where it landed.
  // which: 'air' draws it only in flight, 'down' only once landed, undefined both
  function thrown(t, ta, x0, y0, x1, y1, k0, k1, dur, seed, arc = 260, which) {
    const T = tw(t); if (T < ta) return;
    const u = clamp((T - ta) / dur); if (which === 'air' && u >= 1) return; if (which === 'down' && u < 1) return;
    const x = lerp(x0, x1, u), y = lerp(y0, y1, u) - Math.sin(Math.PI * u) * arc, k = lerp(k0, k1, u);
    const rot = u < 1 ? (T - ta) * 9 * (seed % 2 ? 1 : -1) + seed : Math.PI / 2 + (hash(seed * 7 + 1) - .5) * 2.2;
    flower(x, y, k, rot);
  }

  // ---------- THE HOUSE, seen from the stage: a raked fan of rows, white-line seats on black ----------
  const NR = 13, NJ = 8;
  // 9:16: the rows run from the back wall (HT) down to row 0 at HB, centred on the aisle, people scaled up by HS
  const HCX = W / 2, HS = 1.6, HT = 500; let HB = 1800;
  const rowZ = (r) => 1 + r * .35, rowY = (r) => HT + (HB - HT) / rowZ(r);
  const seatXw = (sd, j) => sd * (175 + j * 150);
  const JIMI = { r: 5, sd: 1, j: 1 };
  const NAMED = { '2,-1,1': 'bob', '3,1,3': 'bey', '6,-1,2': 'mj',     // pixies span row 1, right of the aisle, seats 0-3
    // Bob's draft-2 notes: 'add more blues artists popping up in seats as did hendrix and me'
    '2,1,1': 'muddy', '3,-1,0': 'hopkins', '4,1,0': 'richard', '3,-1,2': 'joplin', '4,-1,3': 'berry', '6,1,3': 'tharpe', '2,-1,3': 'spann',
    // the 80s stars (the carved pieces of the verse-3 dance) take seats once she is a big star
    '5,-1,1': 'lauper', '5,1,2': 'springsteen', '4,-1,1': 'madonna', '6,-1,0': 'prince', '7,1,1': 'bowie', '5,1,0': 'boygeorge', '7,-1,2': 'byrne' };
  // carved pieces in seats: [crop, height at row scale 1]
  const BLUES = { muddy: [[0, 0, 1, .62], 270], hopkins: [[0, 0, 1, .55], 260], richard: [[0, 0, 1, 1], 230], joplin: [[0, 0, .82, .52], 270],
    berry: [[.04, 0, .82, .5], 270], tharpe: [[0, 0, 1, .42], 260], spann: [[0, 0, 1, .62], 240],
    lauper: [[0, 0, 1, .5], 270], springsteen: [[0, 0, 1, .56], 290], madonna: [[0, 0, 1, .48], 260], prince: [[.42, 0, .58, .5], 250],
    bowie: [[0, 0, 1, .45], 260], boygeorge: [[0, 0, 1, .4], 260], byrne: [[0, 0, 1, .55], 240] };
  // 187-205 the house fills: the bus kids pop into the seats on the beats, then the blues greats one by one
  const T_BLUES = { muddy: 191.13, hopkins: 191.60, richard: 192.60, joplin: 193.17, berry: 194.23, tharpe: 195.27, spann: 195.77 };
  const T_KIDS = [187.3, 195.0];
  function who(r, sd, j) {
    const id = r * 40 + (sd > 0 ? 20 : 0) + j, h = hash(id * 977 + 13), h2 = hash(id * 131 + 7);
    if (r === JIMI.r && sd === JIMI.sd && j === JIMI.j) return null;
    if (r === 1 && sd === 1 && j <= 3) return null;
    const nm = NAMED[`${r},${sd},${j}`];
    if (nm) return { cat: 'named', nm, ta: T_BLUES[nm] ?? null, seed: id };
    const near = r <= 5 && j <= 4;
    const cat = near ? (h < .45 ? 'kid' : h < .65 ? 'mus' : 'ppl') : (h < .18 ? 'kid' : h < .32 ? 'mus' : 'ppl');
    return { cat, ta: cat === 'kid' ? snapBeat(lerp(T_KIDS[0], T_KIDS[1], h2)) : null, seed: id };
  }
  const popK = (t, ta) => t < ta ? 0 : ease.back(inv(ta, ta + .25, tw(t)));
  function houseWalls(t, light) {
    // 9:16: a tall back wall: carved panelling, the balcony rail with its people's legs, the doors and EXIT at the back
    clipTo(rect(150, 60, W - 300, HT - 120), () => rows(150, 60, W - 150, HT - 60, 0, 24, (u) => .5 + u * 2.5, CUT));
    const ry = HT - 190;
    taper([[100, ry], [W - 100, ry]], 9, 9, CUT); for (let i = 0; i < 22; i++) taper([[120 + i * 40, ry], [120 + i * 40, ry + 44]], 3, 3, CUT);
    for (const dx of [-150, 150]) { shape(() => { s.beginPath(); s.moveTo(HCX + dx - 44, HT + 10); s.lineTo(HCX + dx - 44, HT - 60); s.arc(HCX + dx, HT - 60, 44, Math.PI, 0); s.lineTo(HCX + dx + 44, HT + 10); }, INK, 5, CUT); }
    shape(rect(HCX - 60, HT - 110, 120, 42), INK, 4, CUT); fitText('EXIT', HCX, HT - 88, 30, 90, CUT);
    for (const sd of [-1, 1]) for (let b = 0; b < 2; b++) {                // opera boxes high on the side walls
      const u = .3 + b * .4, x = HCX + sd * lerp(330, 470, u), y = lerp(110, 60, u), bw = lerp(110, 170, u), bh = lerp(150, 240, u);
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
  // o: { fill: 'early' (kids + blues greats popping in) | 'full' (every seat, on its feet), bop: heads bounce on the
  //      beats, kidUp: kids wave, arms high / shoulder-high on alternate beats, cheer: 0..1 (full house), jimi: {alpha, rise, clap, flut, nod} | null }
  function house(t, o = {}) {
    HB = o.base ?? 1780;
    bk(INK);
    houseWalls(t);
    const T = tw(t), full = o.fill === 'full', bp = o.bop ? beatPulse(T, 7) : 0, bi = lastBeat(T);
    for (let r = NR - 1; r >= 0; r--) {
      const z = rowZ(r), k = HS / z, y = rowY(r), lit = clamp(1.1 - r * .16);
      shape(rect(-60, y + 60 * k, W + 120, H), INK);
      taper([[HCX - 1300 * k, y + 128 * k], [HCX + 1300 * k, y + 128 * k]], Math.max(2, 5 * k), Math.max(2, 5 * k), CUT);
      for (const sd of [-1, 1]) for (let j = NJ - 1; j >= 0; j--) seatFront(HCX + seatXw(sd, j) * k, y, k, lit);
      if (o.fill) {
        for (const sd of [-1, 1]) for (let j = NJ - 1; j >= 0; j--) {
          const p = who(r, sd, j); if (!p) continue;
          if (!full && p.cat === 'named' && !(p.nm in T_BLUES)) continue;
          const pk = full ? 1 : p.ta == null ? 0 : popK(t, p.ta); if (pk <= 0) continue;
          const x = HCX + seatXw(sd, j) * k, kk = k * pk, cl = rect(x - 400 * k, -2000, 800 * k, y + 104 * k + 2000);
          const cheer = full ? (o.cheer || 0) : 0, odd = (bi + r + j) % 2 ? 1 : -1;
          const by = -bp * (full ? 22 : 14) * k * (hash(p.seed * 3 + 1) > .25 ? 1 : 0);
          clipTo(cl, () => {
            if (p.cat === 'kid') happyKid(x, y + (-30 + 186 * .85) * kk + (1 - pk) * 60 * k + by, .85 * kk, { seed: p.seed, t, up: full ? cheer * (.6 + .4 * ((bi + j) % 2)) : (o.kidUp ? (odd > 0 ? 1 : .6) : 0) });
            else if (p.cat === 'mus') musician(x, y + (1 - pk) * 60 * k + by, kk, p.seed, { cheer, t });
            else if (p.cat === 'ppl') patron(x, y + (1 - pk) * 60 * k + by, kk, p.seed, { cheer, t });
            else if (p.nm === 'bob') piece('bob-1989', x + 6 * k, y + 120 * k + by, 250 * kk, { crop: [0, 0, 1, .7], ax: .5, ay: 1 });
            else if (p.nm === 'bey') piece('beyonce', x, y + 120 * k + by, 260 * kk, { crop: [.1, 0, .8, .55], ax: .5, ay: 1 });
            else if (p.nm === 'mj') piece('mj-1984', x, y + 120 * k + by, 250 * kk, { crop: [0, 0, 1, .6], ax: .5, ay: 1 });
            else if (BLUES[p.nm]) piece(p.nm, x, y + 120 * k + by * .6, BLUES[p.nm][1] * kk, { crop: BLUES[p.nm][0], ax: .5, ay: 1, rot: odd * .06 * bp });   // the greats nod along
          });
          // each great arrives with a burst of carved flicks
          if (!full && p.cat === 'named' && T - p.ta < .4) { const a0 = clamp((T - p.ta) / .4);
            for (let i = 0; i < 10; i++) { const a = -Math.PI + i * Math.PI / 9, rr = (90 + 120 * a0) * k * 2; flick(x + Math.cos(a) * rr, y - 60 * k + Math.sin(a) * rr * .8, a, 50 * k * 2 * (1 - a0) + 10, 5, CUT); } }
        }
        if (r === 1 && full) { const k1 = HS / rowZ(1), x0 = HCX + 115 * k1, x1 = HCX + 685 * k1, by = -bp * 22 * k1;
          clipTo(rect(x0 - 200, -2000, x1 - x0 + 400, y + 104 * k1 + 2000), () => piece('pixies', (x0 + x1) / 2, y + 150 * k1 + by, (x1 - x0) / 2.66, { crop: [0, 0, 1, .55], ax: .5, ay: 1 })); }
      }
      if (r === JIMI.r && o.jimi) {
        const J = o.jimi, x = HCX + seatXw(JIMI.sd, JIMI.j) * k;
        clipTo(rect(x - 400 * k, -2000, 800 * k, y + 104 * k + 2000), () => ghost(J.alpha ?? .7, () => jimiSeat(x, y, k, { ...J, t })));
      }
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
  function stageSet(t, w, spots = []) {
    stage({ curtain: 1 });
    flyLines(t, w);
    for (const [x, y, r] of spots) spot(x, y, r);
    curtains(t, w);
  }
  // Ellen on the boards: (x, y) = between her feet; lift raises her, roll turns her about her middle
  // (cartwheel / somersault), spin turns her like a cut-out on its pin, bow tips her forward
  function ellenFig(t, x, y, k, o = {}) {
    const { w = 0, pose = 'play', facing = 1, slide = null, bow = 0, smile = 0, spin = 1, roll = 0, lift = 0, eyes = 'open' } = o;
    const sl = slide ?? (.45 + .3 * Math.sin(tw(t) * (2 + 6 * harm(t))));
    withT(() => { s.translate(x, y - lift * k); s.rotate(bow * facing);
      if (roll) { s.translate(0, -260 * k); s.rotate(roll); s.translate(0, 260 * k); }    // cartwheel / somersault about her middle
      s.scale(spin === 1 ? 1 : Math.abs(spin) < .12 ? .12 * Math.sign(spin || 1) : spin, 1);   // twirl: a cut-out turning on its pin
      ellen(0, 0, k, { pose, t: tw(t), wind: w, facing, slide: sl, smile, eyes }); });
  }
  function onStage(t, o = {}) {
    const { w = 0, ex = 960, ey = 900, ek = .42, spotOn = true } = o;
    stageSet(t, w, spotOn ? [[ex, ey, 150 * ek / .42]] : []);
    ellenFig(t, ex, ey, ek, o);
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
        const x = W / 2 + (j - Math.sign(j) * .45) * pitch;
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

  // Bob (draft-2 notes): 'could she be twirling, cartwheeling or somersaulting while playing guitar?' Twirls are a
  // cut-out turning on its pin (scale x = cos), so |spin| passes through a sliver, held at .12 so she never vanishes
  const flight = (u) => Math.sin(Math.PI * clamp(u));
  const ring = (x, y, r, lw, c = INK) => { s.beginPath(); s.arc(x, y, r, 0, TAU); s.lineWidth = lw; s.strokeStyle = c; s.stroke(); };
  // carved words that shrink (never squash) to fit maxW
  const fitText = (str, x, y, size, maxW, c = INK, o = {}) => { s.save(); s.font = `900 ${size}px "Superclarendon"`; const m = s.measureText(str).width; s.restore(); carveText(str, x, y, m > maxW ? size * maxW / m : size, c, o); };
  // the harmonica's wind: carved streaks blowing right to left across the frame
  function windStreaks(t, amt, seed = 0) {
    if (amt < .15) return;
    for (let i = 0; i < 16; i++) { const u = wrap(tw(t) * 1.3 + i * .0625 + seed * .37, 1), yy = 80 + (i * 237 + seed * 53) % (H - 160); flick(lerp(W + 300, -200, u), yy, Math.PI, 190 * amt, 7, CUT); }
  }
  // the stage lip in the foreground (white boards) for the shots from the stage into the house
  function lip() {
    const P = () => pathOf([[-40, 992], [W + 40, 978], [W + 40, 1100], [-40, 1100]]);
    shape(P, CUT, 8);
    clipTo(P, () => { for (let i = 0; i < 26; i++) taper([[i * 80 - 40, 980], [i * 96 - 200, 1100]], 3, 5); });
  }
  // the fly tower above the stage, for when the camera follows her up (stage coords, y < 0)
  function flies() {
    shape(rect(-600, -2600, W + 1200, 2700), INK);
    for (let i = 0; i < 6; i++) { const y = -140 - i * 300; taper([[120, y], [1800, y]], 8, 8, CUT);
      for (let j = 0; j < 5; j++) { const x = 300 + j * 330 + (i % 2) * 120; taper([[x, y], [x, y + 90]], 3, 3, CUT); shape(() => pathOf([[x - 30, y + 90], [x + 30, y + 90], [x + 22, y + 140], [x - 22, y + 140]]), INK, 4, CUT); } }
    for (let i = 0; i < 9; i++) { const x = 220 + i * 190; taper([[x, -2600], [x + 6, 0]], 2.5, 2.5, CUT); }
  }

  // ===================== SHOTS =====================
  // 187.0  Bob: 'We see the audience becoming populated with kids and famous blues players approving.'
  //        Over her shoulder into the house: she plays (harmonica 186-189.4 in her hair) and the bus kids pop
  //        into the empty seats on the beats
  function fillWide(t) {
    const T = tw(t), z = kf(T, [[187.0, 1.0], [191.6, 1.14]], ease.sine);
    cam(1080, 560, z, () => house(t, { fill: 'early', bop: 1 }));
    lip();
    ellenFig(t, 250, 1215, 1.12, { w: .15 + .6 * harm(t), smile: .3 + .4 * inv(188, 191, T) });
  }
  // 191.6  closer, panning the front rows: more kids, and the blues greats pop up one by one and nod along
  //        (Muddy 191.13, Lightnin' 191.60, Little Richard 192.60, Janis 193.17, Chuck Berry 194.23, Sister Rosetta 195.27)
  function bluesArrive(t) {
    const T = tw(t), fx_ = kf(T, [[191.6, 1060], [195.9, 830]], ease.inOut), z = kf(T, [[191.6, 1.95], [195.9, 1.8]], ease.sine);
    cam(fx_, 560, z, () => house(t, { fill: 'early', bop: 1 }));
  }
  // 196.0  close on her: she plays harder for the harmonica (196-200.2), the slide racing, sound flying off the guitar
  function closePlay(t, tl) {
    bk(INK);
    const hm = harm(t);
    for (let i = 0; i < 26; i++) { const a = i * TAU / 26 + .05; taper([[860 + Math.cos(a) * 260, 520 + Math.sin(a) * 260], [860 + Math.cos(a) * 1200, 520 + Math.sin(a) * 1200]], 4, 30, CUT); }
    shape(ell(860, 520, 250, 250), INK);
    const k = 2.05, x = 880, y = 1210;
    ellen(x, y, k, { pose: 'play', t: tw(t), wind: .25 + .6 * hm, slide: .4 + .35 * Math.sin(tw(t) * (3 + 9 * hm)), smile: .4 });
    soundFlicks(x + 18 * k, y - 300 * k, t, .5 + hm, 196);
  }
  // 198.37 the greats approve: close on the front rows, all nodding on the beats; Muddy and Chuck Berry give her a
  //        thumbs-up; the harmonica's wind streams through the house
  function approve(t) {
    const T = tw(t), z = kf(T, [[198.37, 2.35], [200.93, 2.15]], ease.sine);
    cam(930, 500, z, () => {
      house(t, { fill: 'early', bop: 1, kidUp: 1 });
      const m = ease.back(inv(198.87, 199.12, T)), b = ease.back(inv(199.40, 199.65, T)), bp = beatPulse(T, 7);
      if (m > 0) thumbUp(1236, 640 - bp * 8, .6 * m, .12);
      if (b > 0) thumbUp(630, 515 - bp * 6, .46 * b, -.12);
    });
    windStreaks(t, harm(t), 2);
  }
  // 200.93 the whole house, full of kids and blues greats, all nodding along; over her other shoulder
  function fullEarly(t) {
    const T = tw(t), z = kf(T, [[200.93, 1.06], [205.23, 1.0]], ease.sine);
    cam(880, 560, z, () => house(t, { fill: 'early', bop: 1, kidUp: 1 }));
    lip();
    ellenFig(t, 1690, 1215, 1.12, { facing: -1, w: .2, smile: .75 });
  }

  // 205.2  Bob: 'The acrobatics start and they are extravagant. Flips, somersaults.' Still playing, she cartwheels,
  //        throws a double back somersault with a twist and a triple layout with two twists; each lands on a beat
  //        (206.30, then the strong ones 207.90 and 209.47); the house below roars on every landing
  // [t0, t1, x0, x1, height px, turns (+ cartwheel / forward, - backward), twists, facing]
  const ACRO = [[205.23, 206.30, 330, 700, 160, 1, 0, 1], [206.30, 207.90, 700, 1220, 470, -2, 1, 1], [207.90, 209.47, 1220, 760, 680, 3, 2, -1]];
  function acroAt(T) {
    for (const [a, b, x0, x1, hh, turns, tws, fc] of ACRO) if (T >= a && T < b) {
      const u = (T - a) / (b - a), e = ease.inOut(u);
      return { x: lerp(x0, x1, e), lift: hh * flight(u), roll: e * turns * TAU, spin: tws ? Math.cos(ease.inOut(inv(.2, .8, u)) * tws * TAU) : 1, facing: fc, air: true };
    }
    if (T < ACRO[0][0]) return { x: 330, lift: 0, roll: 0, spin: 1, facing: 1, air: false };
    return { x: 760, lift: 0, roll: 0, spin: 1, facing: -1, air: false };
  }
  function acrobat(t) {
    const T = tw(t), A = acroAt(T), ek = .62, GY = 905, lands = ACRO.map((m) => m[1]);
    const lh = Math.max(...lands.map((b) => hit(T, b, 4)));
    bk(INK);
    cam(960 + (A.x - 960) * .35, 640 - A.lift * .55, 1.2, () => {
      flies();
      stageSet(t, .15 + .5 * A.lift / 680, [[A.x, GY, 190]]);
      if (A.air) {                                                      // a carved swoosh tracing her flight
        const pts = []; for (let i = 6; i >= 0; i--) { const Bq = acroAt(T - i * .06); if (Bq.air) pts.push([Bq.x, GY - Bq.lift - 140]); }
        if (pts.length > 1) { taper(pts, 2, 26, CUT); taper(pts.map(([x, y]) => [x, y + 60]), 1, 10, CUT); }
      }
      ellenFig(t, A.x, GY, ek, { lift: A.lift / ek, roll: A.roll, spin: A.spin, facing: A.facing, w: A.air ? .75 : .2, smile: .7, pose: T >= 209.47 ? 'hold' : 'play' });
      for (const b of lands) if (T >= b && T < b + .3) for (let i = 0; i < 9; i++) { const a = -Math.PI + i * Math.PI / 8; flick(A.x + Math.cos(a) * 160, GY + 6 + Math.sin(a) * 36, a, 70, 6, CUT); }
    });
    backsRows(t, 952, .5, true, .2 + .8 * lh);
  }

  // 210.0  Bob: 'Then the neck of the guitar becomes a pogo stick, she can fly / twirl in the air.'
  //        The guitar flips upside down, the neck grows a spring and a foot; she bounces higher and higher, landing on
  //        the beats and twirling at the top; the strong harmonica (210-215.6) streams her hair and the bounces go wild;
  //        the biggest lands on the strong 217.33. The camera rides up into the flies with her.
  // [takeoff, landing, height px, twirls, flips]
  const POGO = [[210.50, 211.03, 110, 0, 0], [211.03, 211.57, 170, 0, 0], [211.57, 212.67, 380, 1, 0], [212.67, 213.70, 470, 1, 0],
    [213.70, 214.73, 560, 2, 0], [214.73, 215.77, 660, 2, 1], [215.77, 217.33, 950, 3, 1], [217.33, 218.40, 600, 2, 0],
    [218.40, 220.00, 1050, 3, -1], [220.00, 220.50, 150, 0, 0]];
  const POGO_X = [960, 900, 1030, 760, 1150, 820, 1180, 960, 760, 1080, 980];
  const POGO_LEN = (g, comp) => 178 + 120 * g * (1 - .55 * comp) + 30 * g;   // her feet down to the floor, Ellen units
  function pogoStick(k, g, comp) {   // drawn in Ellen's frame (feet at 0); g 0..1 grown; comp 0..1 spring squashed
    withT(() => { s.scale(k, k);
      // the guitar upside down: lower bout up at her chest, upper bout below, the neck running down past her boots
      const body = () => { s.beginPath(); s.ellipse(0, -318, 84, 62, 0, 0, TAU); s.moveTo(64, -232); s.ellipse(0, -232, 64, 50, 0, 0, TAU); };
      shape(body, CUT, 6); clipTo(body, () => rows(-90, -390, 90, -180, 0, 14, (u) => 1.5 + u * 2));
      dot(0, -268, 20, INK); dot(0, -268, 12, CUT); dot(0, -268, 7, INK);
      shape(rect(-30, -354, 60, 12), INK);                                                          // the bridge
      taper([[-124, -250], [124, -250]], 18, 18, INK); taper([[-120, -254], [120, -254]], 4, 4, CUT); // a handlebar for her hands
      taper([[0, -184], [0, 120]], 26, 22, CUT); taper([[0, -184], [0, 120]], 20, 16, INK);
      for (let f = 0; f < 9; f++) { const yy = -150 + f * 28; taper([[-10, yy], [10, yy]], 2, 2, CUT); }
      for (let i = -1; i <= 1; i++) taper([[i * 5, -348], [i * 5, 116]], 1.5, 1.5, CUT);
      shape(() => pathOf([[-16, 118], [16, 118], [22, 178], [-22, 178]]), INK, 4, CUT);           // the headstock, now the bottom
      for (const yy of [132, 150, 166]) for (const sd of [-1, 1]) dot(sd * 24, yy, 5, CUT);
      taper([[-96, 6], [96, 6]], 14, 14, INK); taper([[-94, 4], [94, 4]], 3, 3, CUT);              // foot pegs under her boots
      if (g > 0) {
        const L = 120 * g * (1 - .55 * comp), y0 = 178, n = 6, pts = [];
        for (let i = 0; i <= n * 2; i++) pts.push([(i % 2 ? 1 : -1) * 38 * g, y0 + L * i / (n * 2)]);
        taper(pts, 16, 16, CUT); taper(pts, 8, 8, INK);
        shape(() => { s.beginPath(); s.ellipse(0, y0 + L + 15 * g, 42 * g, 16 * g, 0, 0, TAU); }, INK, 5, CUT);   // the rubber foot
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
    const T = tw(t), P = pogoAt(T), k = .72, GY = 905, hm = harm(t);
    const footY = GY - POGO_LEN(P.g, P.comp) * k - P.h;
    const lands = POGO.map((m) => m[0]).concat([220.5]), lh = Math.max(...lands.map((b) => hit(T, b, 9)));
    const tilt = hm * .2 * Math.sin(T * 5.3) * (P.h > 20 ? 1 : .2);
    const fy = Math.min(600, lerp(600, footY - 150, .85)), z = 1.22 - .14 * clamp(P.h / 1000);
    bk(INK);
    cam(960 + (P.x - 960) * .5, fy + lh * 8 * Math.sin(T * 80), z, () => {
      flies();
      stageSet(t, .2 + .8 * hm, [[P.x, GY, 170]]);
      if (P.h > 60) for (let i = 1; i <= 3; i++) {                     // carved speed marks under her as she rises / falls
        const yy = footY + POGO_LEN(P.g, P.comp) * k + 20 + i * 40; taper([[P.x - 40 + i * 6, yy], [P.x + 40 - i * 6, yy]], 6 - i, 6 - i, CUT); }
      withT(() => {
        s.translate(P.x, footY); s.rotate(tilt);
        if (P.roll) { s.translate(0, -100 * k); s.rotate(P.roll); s.translate(0, 100 * k); }
        s.scale(Math.abs(P.spin) < .12 ? .12 * Math.sign(P.spin || 1) : P.spin, 1);
        const wind = Math.max(hm, .3 + .5 * clamp(P.h / 600));
        if (P.flip !== undefined && P.flip < .45) ellen(0, 0, k, { pose: 'hold', t: T, wind, smile: .5 });    // she lifts it ...
        else {
          ellen(0, 0, k, { pose: 'stand', t: T, wind, smile: .4 + .5 * clamp(P.h / 500), eyes: 'open' });
          if (P.flip !== undefined) withT(() => { s.translate(0, -280 * k); s.rotate((1 - ease.out(inv(.45, 1, P.flip))) * -Math.PI); s.translate(0, 280 * k); pogoStick(k, 0, 0); });   // ... and flips it over
          else pogoStick(k, P.g, P.comp);
        }
      });
      for (const b of lands) if (T >= b && T < b + .25) for (let i = 0; i < 9; i++) { const a = -Math.PI + i * Math.PI / 8; flick(P.x + Math.cos(a) * 110, GY + 4 + Math.sin(a) * 26, a, 60, 6, CUT); }
    });
    windStreaks(t, hm, 5);
  }

  // 220.6  Bob: 'The kids from the bus are on stage, dancing with her, doing acrobatics with her.'
  //        Five happy bus kids climb up over the lip on the beats, dance and tumble with her; on the harmonica
  //        (223.7-224.9) they all throw one big somersault together and land on 224.70
  const KD = [[360, 221.03, 1], [560, 221.03, 2], [760, 221.57, 3], [1250, 221.57, 4], [1460, 222.10, 5]];
  function kidsDance(t) {
    const T = tw(t), GY = 960, KK = .82, bi = lastBeat(T), bp = beatPulse(T, 9);
    const big = (T >= 223.67 && T < 224.70) ? (T - 223.67) / 1.03 : -1;
    bk(INK);
    cam(960, 700, kf(T, [[220.6, 1.18], [225.2, 1.1]], ease.sine), () => {
      stageSet(t, .2 + .8 * harm(t), [[1000, 905, 170]]);
      let eLift = bp * 40, eRoll = 0;
      if (T >= 222.10 && T < 223.17) { const u = (T - 222.10) / 1.07; eRoll = ease.inOut(u) * TAU; eLift = flight(u) * 130; }
      if (big >= 0) { eRoll = -ease.inOut(big) * TAU; eLift = flight(big) * 330; }
      ellenFig(t, 1000, 905, .5, { lift: eLift / .5, roll: eRoll, smile: .85, w: .2 + .8 * harm(t), pose: T >= 224.70 ? 'hold' : 'play' });
      KD.forEach(([x, ta, seed], i) => {
        if (T < ta - .45) return;
        let y = GY, roll = 0, up = 0, tilt = 0;
        if (T < ta) { const u = (T - (ta - .45)) / .45; y = lerp(GY + 380, GY, ease.out(u)) - flight(u) * 120; up = 1; }   // up over the lip
        else {
          const ph = (bi + i) % 2; up = ph ? 1 : .6; y = GY - bp * 55; tilt = ph ? .15 : -.15;
          const tum = i % 2 ? [222.63, 223.17] : [222.10, 222.63];
          if (T >= tum[0] && T < tum[1]) { const u = (T - tum[0]) / (tum[1] - tum[0]); roll = (i % 2 ? -1 : 1) * ease.inOut(u) * TAU; y = GY - flight(u) * 120; up = 1; tilt = 0; }
          if (big >= 0) { roll = -ease.inOut(big) * TAU; y = GY - flight(big) * 270; up = 0; tilt = 0; }
          if (T >= 224.70) { up = 1; tilt = 0; y = GY; }
        }
        withT(() => { s.translate(x, y); s.rotate(tilt); happyKid(0, 0, KK, { seed, t, up, roll }); });
        if (T >= ta && T < ta + .2) for (let j = 0; j < 5; j++) flick(x - 30 + j * 15, GY + 2, -Math.PI / 2 + (j - 2) * .45, 34, 4, CUT);
      });
      if (T >= 224.70 && T < 225.0) for (const x of [360, 560, 760, 1000, 1250, 1460]) for (let j = 0; j < 7; j++) { const a = -Math.PI + j * Math.PI / 6; flick(x + Math.cos(a) * 90, GY - 10 + Math.sin(a) * 24, a, 50, 5, CUT); }
    });
    windStreaks(t, harm(t), 7);
  }

  // ---------- the giant harmonica (copied from w2-instr1: INK body, CUT slots, carved highlights) ----------
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
    for (let i = 0; i < 7; i++) { const side = i % 2 ? 1 : -1, x0 = cx + side * (hw / 2 - 40 - r() * 200), pts = [[x0, gy + 4]];
      let x = x0, y = gy + 4; for (let j = 0; j < 5; j++) { x += side * (40 + r() * 70) * k; y += (r() * 16 + 4) * k; pts.push([x, y]); }
      taper(pts, 8, 1.5, INK); }
  }
  function harpDust(cx, gy, hw, a) {   // CUT puffs with INK outline at both ends, a = 0..1 age
    if (a <= 0 || a >= 1) return;
    for (const side of [-1, 1]) for (let i = 0; i < 4; i++) { const r = rng(500 + i + (side > 0 ? 9 : 0));
      const px = cx + side * (hw / 2 + 30 + (i * 80 + 120 * r()) * ease.out(a)), py = gy - 30 - i * 26 * ease.out(a) - 50 * r() * a, rr = (46 + 36 * r()) * (1 - a * .7) + 26 * a;
      const c = () => { const p = []; for (let j = 0; j < 9; j++) { const an = j / 9 * TAU; p.push([px + Math.cos(an) * rr * (.8 + .4 * hash(i * 31 + j)), py + Math.sin(an) * rr * .7 * (.8 + .4 * hash(i * 17 + j + 5))]); } smoothPath(p); };
      shape(c, CUT, 4); clipTo(c, () => hline(px - rr, px + rr, py + rr * .3, 3, 1, INK, 600 + i, 2)); }
    const r = rng(800); for (let i = 0; i < 16; i++) { const side = r() < .5 ? -1 : 1, vx = side * (200 + r() * 500), vy = -(300 + r() * 500), tt = a * 1.2;
      const x = cx + side * hw * .45 + vx * tt, y = gy - 10 + vy * tt + 900 * tt * tt; if (y < gy + 20) { dot(x, y, 6 + r() * 7, INK); dot(x, y, 3 + r() * 4, CUT); } }
  }

  // 225.2  Bob: 'The harmonica comes crashing down again like earlier and the school bus from nowhere pushes it away.'
  //        Its shadow grows on the boards, they scatter upstage, it lands on the strong 226.77 (squash, shake, cracks,
  //        dust); the school bus bursts out of the wing (227.27), meets it on 228.27 and shoves it off stage right
  const TL_H = 226.77, HX = 1180, HW2 = 900, HH2 = 210, HGY = 1030, BUSK = .42, BUSY = 1046, BUS_REST = 1400;
  const busFrontAt = (x) => x + 610 * BUSK;
  function harmCrash(t) {
    const T = tw(t), land = t >= TL_H, sl = t - TL_H;
    const shake = land ? 40 * hit(t, TL_H, 5) + 14 * hit(t, 228.27, 8) : 0;
    const meet = HX - HW2 / 2 - 610 * BUSK;
    const bx = T < 227.27 ? -1200 : T < 228.27 ? lerp(-760, meet, ease.out(inv(227.27, 228.27, T))) : lerp(meet, BUS_REST, ease.inOut(inv(228.27, 229.83, T)));
    const hx = Math.max(HX, busFrontAt(bx) + HW2 / 2), over = Math.max(0, hx - 1640);
    const run = ease.inOut(inv(225.70, 226.23, T)), bp = beatPulse(T, 9);
    bk(INK);
    withT(() => { s.translate(snoise(T * 9, 3) * shake, snoise(T * 9, 7) * shake);
      cam(1000, 700, 1.12, () => {
        stageSet(t, 0, [[lerp(1000, 520, run), lerp(905, 845, run), 150]]);
        // Ellen and the kids: centre stage looking up, then they dash upstage left and cheer the bus
        const cheer = T > 228.27 ? 1 : 0;
        ellenFig(t, lerp(1000, 520, run), lerp(905, 845, run), lerp(.5, .4, run), { pose: 'play', smile: cheer ? .9 : .1, lift: cheer * bp * 60 });
        [[300, 1], [380, 2], [640, 3], [700, 4], [450, 5]].forEach(([x, seed], i) => {
          const x0 = KD[i][0], xx = lerp(x0, x, run), yy = lerp(960, 860 + (i % 2) * 12, run) - (cheer ? bp * 40 : 0);
          happyKid(xx, yy, lerp(.82, .5, run), { seed, t, up: T < 225.7 ? .3 : cheer ? 1 : 0 });
        });
        // the shadow grows as it falls from very high
        if (over < 1) { const sk = land ? 1 : ease.in(inv(225.23, TL_H, T)), sx = land ? hx : HX;
          const b = () => { s.beginPath(); s.ellipse(sx, HGY, lerp(60, 520, sk), lerp(8, 34, sk), 0, 0, TAU); };
          shape(b, INK, 4, CUT); clipTo(b, () => { for (let i = 0; i < 6; i++) hline(sx - 520, sx + 520, HGY - 34 + i * 12, 3, 1, CUT, 300 + i, 2); }); }
        if (land) withT(() => { s.translate(Math.min(0, HX - hx) * 0, 0); harpCracks(HX, HGY, HW2, 1); });
        const fk = clamp((T - 225.23) / (TL_H - 225.23)), cy = land ? HGY - HH2 / 2 : lerp(-HH2 - 300, HGY - HH2 / 2, Math.pow(fk, 2.2));
        if (!land && fk > .2) for (let i = 0; i < 9; i++) { const x = HX - HW2 / 2 + 60 + i * (HW2 - 120) / 8; taper([[x, cy - HH2 / 2 - 20], [x, cy - HH2 / 2 - 260 * fk - 60 * hash(i + Math.floor(t * 12))]], 6, 1, CUT); }
        const sq = land ? 1 - .22 * hit(t, TL_H, 9) * Math.cos(sl * 30) : 1;
        withT(() => { s.translate(hx, HGY); s.scale(1 + (1 - sq) * .5, sq); s.translate(-hx, -HGY);
          const tip = over * .0035, drop = over * over * .004;
          harmonica(hx, cy + drop, HW2, HH2, land ? tip : Math.sin(t * 2.2) * .03); });
        if (land) harpDust(HX, HGY, HW2, sl / 1.6);
        // the school bus from nowhere: no driver, lights blazing, speed lines behind it
        if (T >= 227.27) {
          const moving = T < 229.83;
          if (moving) for (let i = 0; i < 7; i++) taper([[bx - 300 - i * 30, BUSY - 40 - i * 22], [bx - 300 - i * 30 - 160 - 80 * hash(i + Math.floor(T * 12)), BUSY - 40 - i * 22]], 6, 1, CUT);
          withT(() => { s.translate(0, moving ? Math.sin(T * 40) * 3 : 0); schoolBus(bx, BUSY, BUSK, { t: moving ? T : 0, kids: 0, driver: 'none', lights: false }); });
          if (T >= 228.27 && T < 228.6) for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i - 4.5) * .3; flick(busFrontAt(bx) + 4 + Math.cos(a) * 40, HGY - 90 + Math.sin(a) * 60, a, 70, 6, CUT); }
        }
      });
    });
    if (land && sl < 2 / 24) fx({ inv: 1 });
  }

  // ---------- the 80s stars as cut-outs (pieces from w5-verse3), white rim so they read on the black stage ----------
  function cutout(n, x, y, h, rot = 0, crop = null) {
    withT(() => { s.translate(x, y); s.rotate(rot);
      withT(() => { s.filter = 'brightness(0) invert(1)'; for (let i = 0; i < 10; i++) { const a = i * TAU / 10; put(n, Math.cos(a) * 6, Math.sin(a) * 6, h, { ax: .5, ay: 1, crop }); } });
      put(n, 0, 0, h, { ax: .5, ay: 1, crop }); });
  }
  // ---------- the locomotive (copied from w3-verse2, 99.33): the slide guitar's glass for a boiler ----------
  function note(x, y, k, c = INK, rot = 0) {
    withT(() => { s.translate(x, y); s.rotate(rot); s.scale(k, k);
      s.beginPath(); s.ellipse(0, 0, 15, 11, -.4, 0, TAU); s.fillStyle = c; s.fill();
      taper([[12, -4], [12, -62]], 5, 5, c); taper([[12, -62], [30, -44], [32, -24]], 6, 3, c); });
  }
  function loco(x, y, t, k = 1) {
    withT(() => { s.translate(x, y); s.scale(k, k);
      const wa = tw(t) * 22;
      shape(rect(-430, -160, 820, 46), INK, 5, CUT);
      shape(() => pathOf([[390, -160], [480, -40], [390, -40]]), INK, 5, CUT); for (let i = 0; i < 4; i++) taper([[400 + i * 18, -150], [400 + i * 18, -50]], 5, 5, CUT);
      const tube = rect(-270, -340, 610, 180);
      shape(tube, CUT, 8);
      clipTo(tube, () => { taper([[-270, -295], [340, -295]], 20, 20, INK); taper([[-270, -230], [340, -230]], 7, 7, INK); for (let xx = -260; xx < 340; xx += 40) taper([[xx, -340], [xx + 26, -160]], 2, 2, INK); });
      s.beginPath(); s.ellipse(340, -250, 40, 90, 0, 0, TAU); s.fillStyle = CUT; s.fill(); s.lineWidth = 8; s.strokeStyle = INK; s.stroke();
      s.beginPath(); s.ellipse(340, -250, 24, 60, 0, 0, TAU); s.fillStyle = INK; s.fill();
      shape(() => pathOf([[210, -340], [260, -340], [290, -450], [180, -450]]), INK, 6, CUT);
      shape(() => pathOf(chisel([[-440, -440], [-250, -440], [-250, -160], [-440, -160]], 33, 3)), INK, 6, CUT);
      shape(rect(-470, -470, 250, 34), INK, 6, CUT);
      shape(rect(-410, -400, 120, 100), CUT, 5);
      taper([[-450, -420], [-450, -200]], 10, 10, CUT);   // grab rail
      for (const [wx, wr] of [[-330, 74], [-130, 74], [70, 74], [280, 44]]) { dot(wx, -74 + (74 - wr), wr + 5, CUT); dot(wx, -74 + (74 - wr), wr, INK); dot(wx, -74 + (74 - wr), wr - 10, CUT);
        for (let i = 0; i < 6; i++) { const a = wa + i * TAU / 6; taper([[wx, -74 + (74 - wr)], [wx + Math.cos(a) * (wr - 12), -74 + (74 - wr) + Math.sin(a) * (wr - 12)]], 7, 4); }
        dot(wx, -74 + (74 - wr), 12, INK); }
      const ca = [Math.cos(wa) * 40, Math.sin(wa) * 40];
      taper([[-330 + ca[0], -74 + ca[1]], [70 + ca[0], -74 + ca[1]]], 14, 14, INK);
    });
  }
  // Ellen hanging off the back as Jimi did (w3 jimiHanging): hands on the cab's grab rail at (x, y) + (90, -150 / -60),
  // her body streaming out behind in the wind, head thrown back laughing, the red hair streaming back
  function ellenHanging(x, y, k, t, laugh) {
    withT(() => { s.translate(x, y); s.scale(k, k);
      const T = tw(t), fl = Math.sin(T * 26) * 18, wv = Math.sin(T * 17) * 22;
      const hair = () => { s.beginPath(); s.moveTo(-90, -190); s.bezierCurveTo(-260, -230 + wv, -470, -170 - wv, -760, -200 + wv * 1.6);
        s.bezierCurveTo(-700, -150 + wv, -560, -120 - wv * .6, -680, -80 + wv); s.bezierCurveTo(-480, -70, -300, -60 - wv * .4, -150, -70); s.closePath(); };
      shape(hair, RED, 4.5);
      clipTo(hair, () => { for (let i = 0; i < 9; i++) taper([[-110, -180 + i * 13], [-740, -195 + i * 14 + wv * 1.4]], 2.6, .5, INK); });
      // legs: her trousers and boots, flapping
      for (const [p, w0] of [[[[-250, 60], [-420, 70 + fl], [-560, 40 + fl * 1.6]], 0], [[[-250, 84], [-400, 124 - fl], [-540, 144 - fl * 1.4]], 1]]) {
        taper(p, 64, 54, CUT); taper(p, 54, 44, INK);
        const [ex, ey] = p[2]; shape(() => pathOf(chisel([[ex + 10, ey - 26], [ex - 70, ey - 30], [ex - 76, ey + 18], [ex + 10, ey + 22]], 9 + w0, 2)), INK, 5, CUT);
      }
      // the bus-driver's jacket, belted, buttons
      const torso = () => pathOf(chisel([[-10, -50], [-60, -80], [-280, 20], [-262, 118], [-30, 60]], 12, 3));
      shape(torso, INK, 6, CUT);
      clipTo(torso, () => { taper([[-60, -60], [-250, 70]], 2.5, 2.5, CUT); taper([[-190, -40], [-170, 110]], 7, 7, CUT); for (let i = 0; i < 3; i++) dot(-80 - i * 34, -18 + i * 16, 4.5, CUT); });
      // arms up to the rail
      for (const p of [[[-30, -60], [30, -120], [90, -150]], [[-60, -46], [20, -74], [90, -60]]]) { taper(p, 36, 30, CUT); taper(p, 28, 22, INK); }
      dot(90, -150, 17, CUT); ring(90, -150, 17, 4); dot(90, -60, 17, CUT); ring(90, -60, 17, 4);
      // her head thrown back laughing
      withT(() => { s.translate(-95, -128); s.rotate(-.35 - laugh * .15);
        const hd = () => { s.beginPath(); s.ellipse(0, 0, 48, 54, 0, 0, TAU); };
        shape(hd, CUT, 5); clipTo(hd, () => taper([[36, -36], [40, 28]], 6, 3, INK));
        for (const ex of [-14, 18]) taper([[ex - 8, -6], [ex, -12], [ex + 8, -6]], 3.5, 3.5);       // eyes screwed shut with laughing
        taper([[-24, -22], [-6, -26]], 4.5, 2.5); taper([[10, -26], [28, -22]], 2.5, 4.5);
        taper([[4, -8], [10, 12], [2, 16]], 2.5, 2.5);
        shape(ell(4, 30, 15, 9 + laugh * 7), INK);                                                   // mouth wide open
        const fr = () => { s.beginPath(); s.moveTo(-42, -12); s.bezierCurveTo(-52, -80, 50, -86, 44, -14); s.bezierCurveTo(30, -50, 6, -56, -6, -46); s.bezierCurveTo(-16, -54, -32, -48, -42, -28); s.closePath(); };
        shape(fr, RED, 4); clipTo(fr, () => { for (let i = 0; i < 6; i++) taper([[-34 + i * 13, -76], [-28 + i * 13, -14]], 2, .5, INK); });
      });
    });
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
      for (let i = 0; i < 7; i++) flower(vx - w * .15 + i * w * .05, vy + h * (.11 + (i % 2) * .02), h / 1500, i * .9);   // her flowers from the show
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

  // ===================== 9:16 STAGE KIT (screen space, 1080 x 1920) =====================
  // the kit's stage() is drawn for 1920 x 1080; these are the same marks laid out for the tall frame:
  // a valance and two narrow curtains at the sides, fly lines up top, the boards from y0 (upstage) to y1 (the lip)
  function curtainsP(t, w, yB, cw = 140) {
    for (const sd of [-1, 1]) {
      const bul = (u) => w * (50 + 40 * snoise(tw(t) * 1.6 + u * 1.3, sd + 9)) * Math.pow(u, .9);
      const ex = (u, f) => sd < 0 ? f * (cw + bul(u)) : W - f * (cw + bul(u));
      const P = [[sd < 0 ? -20 : W + 20, -20]]; for (let i = 0; i <= 16; i++) { const u = i / 16; P.push([ex(u, 1), u * yB]); } P.push([sd < 0 ? -20 : W + 20, yB]);
      shape(() => pathOf(P), INK, 5, CUT);
      for (let f = 1; f < 5; f++) { const pts = []; for (let i = 0; i <= 16; i++) { const u = i / 16; pts.push([ex(u, f / 5), u * (yB - 4)]); } taper(pts, 2, 6, CUT); }
    }
    const hem = (x) => 124 + Math.abs(Math.sin(x / W * Math.PI * 5)) * -26 + w * 14 * Math.sin(tw(t) * 5 + x * .01);
    const V = [[-20, -20], [W + 20, -20]]; for (let x = W + 20; x >= -20; x -= 30) V.push([x, hem(x)]);
    shape(() => pathOf(V), INK, 5, CUT);
    for (let i = 0; i < 14; i++) { const x = 30 + i * 78; taper([[x, 0], [x + w * 8 * Math.sin(tw(t) * 6 + i), hem(x) - 12]], 2, 5, CUT); }
  }
  function flyLinesP(t, w, yTop = 150) {
    taper([[60, yTop], [W - 60, yTop]], 6, 6, CUT);
    for (let i = 0; i < 5; i++) { const x = 200 + i * 170 + (i % 2) * 30, len = 240 + (i * 97) % 260, sw = w * 18 * Math.sin(tw(t) * 4 + i);
      taper([[x, yTop], [x + sw, yTop + len]], 2.5, 2.5, CUT); shape(rect(x + sw - 14, yTop + len, 28, 40), INK, 3, CUT); }
  }
  function boardsP(y0, y1, x0 = 90) {
    const P = () => pathOf([[x0, y0], [W - x0, y0], [W + 80, y1], [-80, y1]]);
    shape(P, CUT, 6);
    clipTo(P, () => { for (let i = 0; i <= 12; i++) taper([[x0 + i * (W - 2 * x0) / 12, y0], [-80 + i * (W + 160) / 12, y1]], 3, 7); });
    taper([[-80, y1 + 6], [W + 80, y1 + 6]], 12, 12, CUT);
  }
  function stageP(t, w, o = {}) {
    const { y0 = 1200, y1 = 1640, spots = [], back = null } = o;
    bk(INK);
    flyLinesP(t, w);
    if (back) back();
    boardsP(y0, y1);
    for (const [x, y, r] of spots) spot(x, y, r);
    curtainsP(t, w, y0 + 30);
  }
  // the huge carved star on the backdrop, centred (cx, cy), radius R
  function starBackP(T, cx, cy, R) {
    for (let i = 0; i < 22; i++) { const a = i * TAU / 22 + T * .15; taper([[cx + Math.cos(a) * R * 1.05, cy + Math.sin(a) * R * 1.05], [cx + Math.cos(a) * R * 2.6, cy + Math.sin(a) * R * 2.6]], 14, 2, CUT); }
    const pts = (rr) => { const p = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? rr * .42 : rr; p.push([cx + Math.cos(a) * q, cy + Math.sin(a) * q]); } return p; };
    shape(() => pathOf(pts(R)), CUT, 10);
    clipTo(() => pathOf(pts(R)), () => rows(cx - R, cy - R, cx + R, cy + R, .5, 18, (u) => 1 + 3 * u, INK));
    shape(() => pathOf(pts(R * .62)), null, 6, INK);
  }
  // her name in lights, stacked on two lines so it reads big at 1080 wide; flown in from above (drop 0 -> 1)
  function nameTall(T, drop, y0 = 150) {
    const w = 900, h = 300, x = (W - w) / 2, y = y0 - 560 * (1 - drop), bi = lastBeat(T);
    taper([[x + 90, -40], [x + 90, y]], 4, 4, CUT); taper([[x + w - 90, -40], [x + w - 90, y]], 4, 4, CUT);
    shape(rect(x, y, w, h), INK, 8, CUT);
    shape(rect(x + 34, y + 34, w - 68, h - 68), INK, 4, CUT);
    fitText('ELLEN', W / 2, y + 108, 100, w - 170, CUT);
    fitText('McILWAINE', W / 2, y + 198, 100, w - 170, CUT);
    const per = 2 * (w - 34 + h - 34), n = 44;
    for (let i = 0; i < n; i++) { let d = i * per / n, bx, by; const W1 = w - 34, H1 = h - 34;
      if (d < W1) { bx = x + 17 + d; by = y + 17; } else if ((d -= W1) < H1) { bx = x + w - 17; by = y + 17 + d; } else if ((d -= H1) < W1) { bx = x + w - 17 - d; by = y + h - 17; } else { bx = x + 17; by = y + h - 17 - (d - W1); }
      dot(bx, by, 8, CUT); if ((i + bi) % 3 === 0) dot(bx, by, 4, INK); }
  }
  // the stage lip in the foreground (white boards) for the shot from the stage into the house
  function lipP(y) {
    const P = () => pathOf([[-40, y + 14], [W + 40, y], [W + 40, H + 40], [-40, H + 40]]);
    shape(P, CUT, 8);
    clipTo(P, () => { for (let i = 0; i < 16; i++) taper([[i * 80 - 40, y], [i * 110 - 300, H + 40]], 3, 7); });
  }
  const shakeAt = (T, amt) => [snoise(T * 9, 3) * amt, snoise(T * 9, 7) * amt];

  // ===================== SHOTS (9:16) =====================
  // 230.4  Bob: 'The kids and 80s stars push away the school bus ...' Re-staged for the tall frame in depth: the stars
  //        stride in on the beats in three ranks (far, middle, near) behind the bus, the crying bus kids push at the
  //        front; three shoves on the beats (231.90, 232.43, 232.93) drive the bus UP the frame and away upstage, where
  //        it rolls off (233.0-233.47); Ellen cheers upstage right; the train's whistle smoke (harmonica 232.0) blows in high left
  // [piece, x, feet y, height, arrives on beat, crop]
  // two to a rank, four ranks coming toward us; each nearer rank covers only the bodies of the one behind, never a face
  const STARS_T = [['boygeorge', 120, 1010, 360, 231.40], ['mj-1984', 360, 1000, 340, 231.40],
    ['bowie', 110, 1240, 420, 230.90], ['byrne', 420, 1230, 380, 231.40],
    ['lauper', 140, 1490, 500, 230.37], ['prince', 560, 1480, 460, 230.90],
    ['madonna', 270, 1800, 600, 230.90], ['springsteen', 720, 1810, 600, 230.37]];
  function wingSmokeP(t, t0, y0 = 560) {
    const T = tw(t);
    for (let k = 0; k < 40; k++) { const te = t0 + k * .12, a = T - te; if (a < 0) break; if (a > 2.2) continue;
      const x = -90 + a * 300 + Math.sin(k * 1.7) * 30, y = y0 - a * 220 - (k % 3) * 46, r = 30 + a * 70; dot(x, y, r + 6, INK); dot(x, y, r, CUT); }
  }
  function pushBus(t) {
    const T = tw(t), bp = beatPulse(T, 8), bi = lastBeat(T);
    const SH = [231.90, 232.43, 232.93], sh = SH.reduce((a, b) => a + ease.out(inv(b, b + .2, T)), 0), off = ease.in(inv(232.93, 233.47, T));
    const p = sh / 3 * .22 + off * 1.15, lean = T >= 231.6 ? .24 : .08;
    const d = 1 + 2.4 * p, bk_ = .72 / d, bx = 860 + p * 560, by = 560 + 460 / d;   // the bus rolls away upstage: up the frame, smaller
    const shk = Math.max(...SH.map((b) => hit(T, b, 9))) * 10, [sx, sy] = shakeAt(T, shk);
    bk(INK);
    cam(540 + sx, 960 + sy, kf(T, [[230.4, 1.0], [233.47, 1.07]], ease.sine), () => {
      stageP(t, .3 * harm(t), { y0: 470, y1: 2000, spots: [[860, 600, 130]] });
      wingSmokeP(t, 232.0, 420);
      ellenFig(t, 860, 600, .6, { smile: .9, lift: bp * 40 / .52, bow: bi % 2 ? .05 : -.05});
      if (off < .995) withT(() => { s.translate(0, off > 0 ? Math.sin(T * 40) * 3 : 0); schoolBus(bx, by, bk_, { t: off > 0 ? T : 0, kids: 0, driver: 'none' }); });
      for (const b of SH) if (T >= b && T < b + .25) for (let i = 0; i < 6; i++) flick(bx - 620 * bk_, by - 300 * bk_ + i * 26 * bk_ / .6, Math.PI * (.85 + i * .05), 70, 7, CUT);
      const push = sh * 34 + off * 120;
      STARS_T.forEach(([n, x0, fy, h, ta], i) => {
        const u = ease.out(inv(ta - .45, ta, T)); if (u <= 0) return;
        const x = lerp(-420, x0 + push * (1 - i / 16), u), y = fy - (u < 1 ? Math.abs(Math.sin(T * 30)) * 12 : bp * 10);
        if (n === 'prince') cutout('prince', x, y, h, lean * .4);
        else cutout(n, x, y, h, lean + (bi + i) % 2 * .04);
      });
      // the bus kids at the front, crying the whole time (Bob, draft 6 and 9), leaning into it with the stars
      [[1010, 1], [800, 2], [590, 3], [380, 4], [170, 5]].forEach(([x, seed], i) => {
        const u = ease.out(inv(230.6 + i * .1, 231.0 + i * .1, T)); if (u <= 0) return;
        withT(() => { s.translate(lerp(-260, x - 40, u) + push * .6, 1960); s.rotate(lean * .9); happyKid(0, 0, 1.3, { seed, t, up: .55 }); });
      });
    });
  }

  // 233.47 ... 'and the train comes through': the locomotive steams out of the left wing along rails laid across the
  //        boards, its smoke climbing the whole height of the frame; as the cab passes her (235.00) she leaps and grabs
  //        the rail at the back; then the camera pans with the train so she rides in frame, laughing on 235.50 / 236.00
  const TRK_KP = 1.0, TRK_YP = 1420, EXP = 520, EYP = 1330, T_GRAB = 235.0;
  const trainXP = (T) => EXP + 450 * TRK_KP + (T - T_GRAB) * 900;
  function trainThrough(t) {
    const T = tw(t), LX = trainXP(T), grabbed = T >= T_GRAB, hm = harm(t);
    const camX = Math.max(0, LX - (EXP + 450 * TRK_KP)) * .85;
    bk(INK);
    cam(540, 960, kf(T, [[233.47, 1.0], [236.53, 1.06]], ease.sine), () => {
      withT(() => { s.translate(-camX, 0);
        // a long stage: fly lines, the boards and the rails, repeated as the camera pans
        taper([[-200, 150], [3400, 150]], 6, 6, CUT);
        for (let i = 0; i < 18; i++) { const x = 160 + i * 190, len = 220 + (i * 97) % 300, sw = .3 * hm * 18 * Math.sin(T * 4 + i); taper([[x, 150], [x + sw, 150 + len]], 2.5, 2.5, CUT); shape(rect(x + sw - 14, 150 + len, 28, 40), INK, 3, CUT); }
        const P = () => pathOf([[-200, 1100], [3400, 1100], [3400, 1660], [-200, 1660]]);
        shape(P, CUT, 6); clipTo(P, () => { for (let i = 0; i < 40; i++) taper([[-200 + i * 95, 1150], [-260 + i * 105, 1640]], 3, 7); });
        for (let x = -200; x < 3400; x += 70) taper([[x, TRK_YP - 4], [x - 16, TRK_YP + 24]], 9, 9, INK);
        for (const yy of [TRK_YP - 2, TRK_YP + 18]) taper([[-200, yy], [3400, yy]], 7, 7, INK);
        spot(EXP, EYP, 200);
        // the left wing curtain the train bursts out of
        shape(() => pathOf([[-260, -20], [40, -20], [70, 1160], [-260, 1160]]), INK, 5, CUT);
        for (let f = 0; f < 4; f++) taper([[-220 + f * 60, 0], [-200 + f * 64, 1150]], 2, 6, CUT);
        // smoke from the stack, climbing to the top of the frame
        for (let k = 0; k < 30; k++) { const te = Math.floor(T / .1) * .1 - k * .1, a = T - te; if (a > 2.4 || te < 233.3) continue;
          const x = trainXP(te) + 235 * TRK_KP - a * 140, y = TRK_YP - 470 * TRK_KP - a * 520 - Math.sin(Math.round(te / .1)) * 24, r = 26 + a * 70; dot(x, y, r + 6, INK); dot(x, y, r, CUT); }
        if (!grabbed) { const lift = ease.out(inv(234.7, T_GRAB, T)) * 340;
          ellenFig(t, EXP, EYP, 1.0, { lift: lift, smile: .8, w: .3 + .5 * hm, pose: T > 234.7 ? 'point' : 'play' }); }
        loco(LX, TRK_YP, t, TRK_KP);
        if (grabbed) ellenHanging(LX - 540 * TRK_KP, TRK_YP - 300 * TRK_KP, TRK_KP, t, hit(T, 235.50, 6) + hit(T, 236.00, 6));
        if (T >= T_GRAB && T < T_GRAB + .3) for (let i = 0; i < 9; i++) { const a = i * TAU / 9; flick(LX - 450 * TRK_KP + Math.cos(a) * 90, TRK_YP - 360 * TRK_KP + Math.sin(a) * 90, a, 56, 6, CUT); }
        [235.50, 236.00].forEach((b, i) => { const a = T - b; if (a < 0 || a > .5) return; fitText('HA!', LX - 560 * TRK_KP - i * 150 - a * 60, TRK_YP - 640 * TRK_KP - i * 70 - a * 80, 110 * ease.back(a / .18), 260, CUT, { rot: -.2 + i * .3 }); });
      });
    });
    backsRows(t, 1730, .7, true, .7);
  }

  // 236.53 ... 'and ellen is holding on to the back of it as hendrix did earlier': the ride, side on, as in verse 2,
  //        framed close on her and the cab; sky above (the smoke trail and the notes fly up through it), the rails
  //        rushing at the bottom; she laughs on the beats (237.07 ... 239.57), her red hair streaming back out of frame
  const TRACKYP = [1300, 1350, 1420, 1510, 1630, 1780, 1960];
  function trainRide(t) {
    const tt = tw(t), SYL = [237.07, 237.57, 238.57, 239.57], K = .95;
    const bump = SYL.reduce((a, b) => a + hit(t, b, 9), 0), bounce = (Math.floor(t * 12) % 2) * 4 + bump * 16;
    bk(CUT);
    cam(540, 1000, kf(tt, [[236.53, 1.0], [240.3, 1.07]], ease.sine), () => {
      for (let i = 0; i < 30; i++) { const r = hash(i * 13 + 7), y = 40 + r * 1180, x = wrap(r * 3000 - tt * 2600 * (.6 + r), 2200) - 400; taper([[x, y], [x + 260 + r * 300, y]], 1, 7 * r + 2); }
      shape(rect(-200, 1280, W + 400, 900), INK);
      TRACKYP.forEach((y, i) => { const sp = 60 + i * 14; for (let x = -200 - wrap(tt * 2400 * (1 + i * .15), sp); x < W + 200; x += sp) taper([[x, y + 2], [x - 14, y + 8 + i * 2]], 6 + i * 1.3, 6 + i * 1.3, CUT);
        taper([[-200, y], [W + 200, y]], 5 + i * 1.5, 5 + i * 1.5, CUT); });
      const LX = 1120 + bump * 30, LY = TRACKYP[1] - 2 - bounce;
      // the smoke trail from the stack (off right) streaming back and climbing
      for (let k = 0; k < 22; k++) { const te = Math.floor(tt / .09) * .09 - k * .09, a = tt - te; if (a > 1.9) continue;
        const x = LX + 235 * K - a * 700, y = LY - 470 * K - a * 330 - Math.sin(Math.round(te / .09)) * 22, r = 34 + a * 90; dot(x, y, r + 6, INK); dot(x, y, r, CUT); }
      // sparks off the wheels turn into notes and fly up into the sky
      const emit = []; for (let k = 0; k < 60; k++) emit.push([236.4 + k * .06, k]);
      for (const b of SYL) for (let k = 0; k < 10; k++) emit.push([b + k * .01, 100 + Math.round(b * 10) + k]);
      for (const [te, k] of emit) { const a = t - te; if (a < 0 || a > 1.3) continue;
        const r = rng(k * 77 + 3), vx = -300 - r() * 600, vy = -700 - r() * 900, w0 = [LX - 300 * K + r() * 360 * K, LY];
        const x = w0[0] + vx * a, y = w0[1] + vy * a + 500 * a * a;
        if (y > 1280) flick(x, y, Math.atan2(vy + 1000 * a, vx) + Math.PI, 40, 6, CUT);
        else note(x, y, 1 + r() * .8, INK, Math.sin(a * 6 + k) * .4); }
      loco(LX, LY, t, K);
      const laugh = SYL.reduce((a, b) => a + hit(t, b, 7), 0);
      ellenHanging(LX - 540 * K, LY - 300 * K, K, t, laugh);
      SYL.forEach((b, i) => { const a = t - b; if (a < 0 || a > .55) return; const k = ease.back(a / .18);
        fitText('HA!', 300 + i * 150 - a * 60, 620 - (i % 2) * 140 - a * 90, 130 * k, 300, INK, { rot: -.2 + (i % 2) * .3 }); });
    });
  }

  // 240.3  Bob: 'She's back on stage the crowd loves her, she's a big star now.' The tall frame stacks it: her name in
  //        lights flown in on top (two lines), the giant carved star behind her, Ellen big on the boards, the full house's
  //        arms at the bottom throwing flowers. Bob (draft-8 notes): the piano plays nine of the same chord right after the
  //        train; she jumps on all nine, HIGH, up the height of the frame toward her name. Onsets: 240.30 ... 242.27
  const NINE = [240.30, 240.58, 240.82, 241.03, 241.36, 241.54, 241.78, 242.04, 242.27];
  function nineJumps(T) {
    let up = 0, landed = false;
    NINE.forEach((h0, i) => { const d = Math.min(.3, (NINE[i + 1] ?? h0 + .5) - h0 - .01), u = (T - h0) / d;
      if (u >= 0 && u < 1) up = flight(u); if (T - h0 - d >= 0 && T - h0 - d < .09) landed = true; });
    return [up, landed];
  }
  function bigStar(t) {
    const T = tw(t), bi = lastBeat(T), [jump, landed] = nineJumps(T), bp = T < 242.6 ? 0 : beatPulse(T, 7);
    const EK = 1.12, GY = 1530;
    const FL = []; for (let i = 0; i < 16; i++) { const ta = 240.6 + i * .19, x0 = 60 + hash(i * 11 + 3) * 960; FL.push([ta, x0, 1960, 120 + hash(i * 3 + 5) * 840, 1300 + hash(i * 5 + 2) * 300, i]); }
    bk(INK);
    cam(540, 960 - jump * 40, kf(T, [[240.3, 1.05], [243.7, 1.0]], ease.sine), () => {
      stageP(t, .2 + .5 * harm(t), { y0: 1260, y1: 1680, spots: [[540, GY, 300]], back: () => starBackP(T, 540, 860, 360) });
      nameTall(T, ease.back(inv(240.3, 240.75, T)), 150);
      for (const f of FL) thrown(t, f[0], f[1], f[2], f[3], f[4], 1.1, .62, .8, f[5], 300, 'down');
      ellenFig(t, 540, GY, EK, { smile: .95, lift: (bp * 40 + jump * 520) / EK, bow: jump > 0 ? 0 : bi % 2 ? .04 : -.04, w: .2 + .5 * harm(t) + .5 * jump });
      if (landed) for (let j = 0; j < 9; j++) flick(470 + j * 18, GY + 4, -Math.PI / 2 + (j - 4) * .38, 60, 7, CUT);
      backsRows(t, 1730, .78, true, 1);
      for (const f of FL) thrown(t, f[0], f[1], f[2], f[3], f[4], 1.1, .62, .8, f[5], 300, 'air');
    });
    windStreaks(t, harm(t) * .8, 9);
  }
  // 243.7  the house from the stage, every seat full and on its feet: rows stacked down the whole tall frame, faces
  //        big in the near rows (kids still crying, blues greats, the 80s stars, Bob, the Pixies, ordinary people);
  //        Jimi up in row five clapping on the beats; flowers fly at her (harmonica 242-248.2). Camera pulls back.
  function houseRoar(t) {
    const T = tw(t), z = kf(T, [[243.7, 1.28], [247.0, 1.04]], ease.sine);
    cam(560, kf(T, [[243.7, 1180], [247.0, 1000]]), z, () => house(t, { fill: 'full', bop: 1, cheer: 1, jimi: { alpha: .72, rise: 1, clap: Math.pow(Math.sin(Math.PI * beatPhase(T)), .7), flut: .25 + .9 * harm(t) } }));
    for (let i = 0; i < 16; i++) { const ta = 243.7 + i * .2, x0 = 140 + hash(i * 7 + 1) * 800, y0 = 800 + hash(i * 9 + 4) * 600;
      thrown(t, ta, x0, y0, x0 + (x0 - 540) * .6, 2150, .5, 2.1, .9, i + 40, 260, 'air'); }
    windStreaks(t, harm(t) * .7, 11);
  }
  // 247.0  Bob: 'She bops like she did earlier to harmonica.' Closer: Ellen big on the boards under the star, hopping on
  //        each of the four harmonica notes (247.03, 247.26, 247.61, 248.10), a carved note popping out of each and
  //        rising up the tall frame; then she bops on the beats, flowers at her feet, the crowd's arms up in front
  const HOPS = [247.03, 247.26, 247.61, 248.10];
  const STAGE_FLP = [[150, 1420, .5], [270, 1560, -.6], [880, 1470, .9], [960, 1600, -1.2], [380, 1650, 1.6], [720, 1660, -.2], [120, 1610, 2.4], [1000, 1380, .3]];
  function hopBop(t) {
    const T = tw(t), GY = 1580, EK = 1.45, bi = lastBeat(T);
    let hop = 0, landing = -1;
    HOPS.forEach((h0, i) => { const d = Math.min(.36, (HOPS[i + 1] ?? 99) - h0 - .02), u = (T - h0) / d;
      if (u >= 0 && u < 1) hop = flight(u); if (T - (h0 + d) >= 0 && T - (h0 + d) < .17) landing = i; });
    let bop = 0, tilt = 0;
    if (T >= 248.40) { const u = (T - B[bi]) / .3; bop = u >= 0 && u < 1 ? flight(u) : 0; tilt = bi % 2 ? .07 : -.07; if (u >= 0 && u < .2) landing = 9; }
    const lift = hop * 260 + bop * 80;
    bk(INK);
    cam(540, kf(T, [[247.0, 1080], [251.0, 980]]), kf(T, [[247.0, 1.12], [251.0, 1.0]], ease.sine), () => {
      stageP(t, .2 + .6 * harm(t), { y0: 1300, y1: 1720, spots: [[540, GY, 330]], back: () => starBackP(T, 540, 720, 320) });
      for (const [x, y, r] of STAGE_FLP) flower(x, y, .75, r);
      HOPS.forEach((h0, i) => { const a = T - h0; if (a < 0 || a > 1.3) return;
        withT(() => { s.translate(700 + a * 160 - i * 60, 640 - a * 420 - i * 40); s.rotate(-.3 + i * .2); s.scale(2 + a * .5, 2 + a * .5);
          dot(0, 0, 18, INK); dot(0, 0, 13, CUT); taper([[11, -2], [11, -62]], 12, 12, INK); taper([[11, -2], [11, -62]], 6, 6, CUT); taper([[11, -62], [32, -42]], 14, 7, INK); taper([[11, -62], [32, -42]], 8, 3, CUT); }); });
      ellenFig(t, 540, GY, EK, { lift: lift / EK, bow: tilt, smile: .55 + .45 * Math.max(hop, bop), w: .2 + .5 * hop + .4 * harm(t) });
      if (landing >= 0) for (let j = 0; j < 9; j++) flick(470 + j * 18, GY + 4, -Math.PI / 2 + (j - 4) * .4, 50, 6, CUT);
    });
    backsRows(t, 1770, .72, true, 1);
  }
  // 251.0  over her shoulder: she bops on the beats in the near foreground (big, bottom left), the roaring full house
  //        stacked up the frame behind her, flowers raining onto the boards
  function overShoulder(t) {
    const T = tw(t), bi = lastBeat(T), u = (T - B[bi]) / .3, bop = u >= 0 && u < 1 ? flight(u) : 0;
    const z = kf(T, [[251.0, 1.0], [254.6, 1.08]], ease.sine);
    cam(600, 900, z, () => house(t, { fill: 'full', bop: 1, cheer: 1, base: 1560, jimi: { alpha: .72, rise: 1, clap: Math.pow(Math.sin(Math.PI * beatPhase(T)), .7), flut: .25 } }));
    lipP(1600);
    for (let i = 0; i < 12; i++) { const ta = 250.6 + i * .3, x0 = 300 + hash(i * 5 + 9) * 700; thrown(t, ta, x0, 900, 120 + hash(i * 13 + 2) * 900, 1680 + hash(i * 3) * 200, .5, 1.0, .8, i + 70, 260); }
    ellenFig(t, 300, 2060, 1.55, { lift: bop * 60 / 1.55, bow: bi % 2 ? .05 : -.05, smile: .95, w: .3 });
  }
  // 254.6  the full house roars; on the stage (under the star) Ellen picks up the case and walks off into the left wing;
  //        the camera drifts with her (harmonica 258-261: wind lifts her hair, the curtain stirs as she goes)
  function walksOff(t, tl) {
    const T = tw(t), u = inv(255.1, 261.9, T), ex = lerp(860, -260, u);
    bk(INK);
    cam(kf(T, [[254.6, 620], [262.47, 460]]), 1000, kf(T, [[254.6, 1.0], [262.47, 1.08]], ease.sine), () => {
      stageP(t, .7 * harm(t), { y0: 1180, y1: 1600, spots: [[ex, 1460, 220]], back: () => starBackP(T, 540, 700, 260) });
      ellenFig(t, ex, 1460, 1.2, { w: .7 * harm(t), pose: 'walk', facing: -1, smile: .5 });
      // the left curtain again, in front of her, so she walks off behind it
      shape(() => pathOf([[-200, -20], [140 + 40 * harm(t) * Math.sin(T * 3), -20], [130, 1210], [-200, 1210]]), INK, 5, CUT);
      for (let f = 0; f < 4; f++) taper([[-120 + f * 60, 130], [-110 + f * 60, 1200]], 2, 6, CUT);
    });
    backsRows(t, 1680, .78, true, 1);
  }
  // 262.47  dawn outside: the empty school bus pulls away from the theatre up the road into the sun. Tall: a big sky,
  //         the theatre's tall front at the left with her name, the road running from the bottom of the frame to the sun
  function busAway(t, tl) {
    const T = tw(t), hz = 1120, sx = 640;
    cam(540, kf(T, [[262.47, 1000], [266.1, 900]]), kf(T, [[262.47, 1.0], [266.1, 1.04]], ease.sine), () => {
      dawn(t, hz, sx, hz, 190 + 20 * inv(262.4, 266.1, t), 0);
      // ground: carved rows, and the road to the sun
      shape(rect(-60, hz, W + 120, H), INK); clipTo(rect(-60, hz, W + 120, H), () => rows(-60, hz, W + 60, H + 60, 0, 22, (u) => 1 + 4 * u, CUT));
      const road = () => pathOf([[sx - 16, hz], [sx + 16, hz], [W + 260, H + 60], [-200, H + 60]]);
      shape(road, CUT, 5);
      for (let i = 0; i < 7; i++) { const q = wrap(T * .3 + i / 7, 1), a = Math.pow(q, 2.2), yy = lerp(hz, H, a), xx = lerp(sx, sx - 40, a), ww = lerp(2, 44, a);
        shape(() => pathOf([[xx - ww * .3, yy], [xx + ww * .3, yy], [xx + ww * .45, yy + ww * 2], [xx - ww * .45, yy + ww * 2]]), INK); }
      // the theatre, tall at the left, doors still lit, her name on the front on two lines
      shape(() => pathOf([[-20, 360], [430, 360], [430, hz + 10], [-20, hz + 10]]), INK, 6, CUT);
      shape(() => pathOf([[-20, 360], [205, 230], [450, 360]]), INK, 6, CUT);
      shape(rect(20, 420, 390, 190), CUT, 6); fitText('ELLEN', 215, 474, 70, 330, INK); fitText('McILWAINE', 215, 556, 70, 330, INK);
      for (let i = 0; i < 4; i++) taper([[50 + i * 110, 650], [50 + i * 110, hz]], 18, 18, CUT);
      for (let i = 0; i < 3; i++) shape(rect(85 + i * 110, 900, 60, hz - 900), CUT, 4);
      const u = ease.in(inv(262.9, 266.1, T)), d = 1 + 9 * u, kB = .6 / d, bx = lerp(sx, 560, 1 / d), by = hz + 520 / d;
      const bob_ = Math.sin(T * 18) * 3 * (u > 0 ? 1 : 0) / d;
      schoolBus(bx, by + bob_, kB, { t: T * (u > 0 ? 1 : 0), kids: 0, driver: 'ellen', lights: true });
      if (u > 0) for (let i = 0; i < 6; i++) flick(bx - 640 * kB - i * 30 / d, by - 60 * kB - (i % 3) * 30 * kB, Math.PI, (60 + 40 * u) / d + 10, 6 / Math.sqrt(d), CUT);
    });
  }
  function steeringK(cx, cy, k) { withT(() => { s.translate(cx, cy); s.scale(k / 1.5, k / 1.5); steering(0, 0); }); }
  // 266.1  driving: the windscreen full of dawn on top, the empty mirror hanging at the top, Ellen big at the wheel in the
  //        lower half; the wind from her window streams her hair across the frame (harmonica 266-268)
  function driving(t, tl) {
    const T = tw(t), hm = harm(t), sway = Math.sin(T * 2.3) * 4;
    bk(INK);
    cam(540, 960, kf(T, [[266.1, 1.0], [271.67, 1.05]], ease.sine), () => {
      windscreen(t, 30, 150, 1050, 1010, .2);
      taper([[30, 150], [30, 1030]], 40, 52, INK); taper([[1050, 150], [1050, 1030]], 40, 52, INK);
      taper([[540, -20], [540, 70]], 18, 18, INK); mirrorScene(t, 330, 60, 420, 150, 0, true);
      shape(() => pathOf([[-20, 1000], [W + 20, 970], [W + 20, 1120], [-20, 1140]]), INK, 8, CUT);             // dash
      clipTo(() => pathOf([[-20, 1000], [W + 20, 970], [W + 20, 1120], [-20, 1140]]), () => rows(-20, 970, W + 20, 1140, -.02, 24, (u) => 2 + 3 * u, CUT));
      const k = 2.1, x = 520, y = 2020;
      driverSeat(x, y, k);
      ellen(x + sway, y, k, { pose: 'drive', t: T, wind: .35 + .6 * hm, eyes: 'open' });
      steeringK(x + 70 * k, y - 300 * k, k);
      if (hm > .2) for (let i = 0; i < 12; i++) { const u = wrap(T * 1.6 + i * .083, 1); flick(lerp(W + 100, -100, u), 1150 + (i * 97) % 520, Math.PI, 90 * hm, 5, CUT); }
    });
  }
  // 271.67  the mirror, close and big: the empty bus behind her, the show's flowers piled on the back bench (near-silence);
  //         the road to the dawn below it. No Jimi here (Bob, draft-8 notes: 'we've seen him too much')
  function mirror(t, tl) {
    const T = tw(t), jit = snoise(T * 6, 3) * 3;
    bk(INK);
    cam(540, 640, kf(T, [[271.67, 1.0], [274.6, 1.08]], ease.sine), () => {
      windscreen(t, -20, 1060, 1100, 1960, .3);
      taper([[540, -400], [540, 280]], 46, 46, INK); taper([[540, -400], [540, 280]], 5, 5, CUT);
      withT(() => { s.translate(0, jit); mirrorScene(t, 40, 270, 1000, 680, 0, false); });
    });
  }
  // 274.6 / 275.4  close on her face (the top of the frame is the windscreen and the empty mirror): she notices (one
  //        eyebrow up, 275.0) ... and on the last sound, 275.75 / 276.0, the small smile; the sun is breaking behind
  function smile(t, tl) {
    const T = tw(t), rays = hit(t, 279.3, 1.2) * .6 + hit(t, 280.37, 1.0) * .9;
    bk(INK);
    cam(560, 1000, kf(T, [[274.6, 1.0], [276.4, 1.06]], ease.sine), () => {
      windscreen(t, -20, -20, 1100, 980, .5 + rays);
      taper([[860, -20], [860, 50]], 20, 20, INK); mirrorScene(t, 650, 50, 400, 150, 0, true);
      shape(() => pathOf([[-20, 960], [W + 20, 940], [W + 20, 1000], [-20, 1020]]), INK, 6, CUT);
      const k = 3.0, x = 540, y = 2390;
      driverSeat(x, y, k);
      const sm = t < 275.75 ? 0 : t < 276.0 ? .5 : .75;
      ellen(x, y, k, { pose: 'drive', t: T, wind: .25, eyes: t >= 275.0 && t < 275.75 ? 'brow' : 'open', smile: sm });
    });
  }

  // 276.4  Bob (draft-3 notes): 'at the end could 2 people have the dialogue "that felt great" "i think she would like that" "yeah"'
  //        The pair from the lyric, Bob and Jimi, at the roadside at dawn, clearly themselves (Bob, draft-8 notes: their
  //        carved photos, faces to us), big in the bottom of the tall frame; her bus small on the road into the sun; the
  //        three balloons stacked in the sky above them, every line inside its balloon with margin at 1080 wide.
  // speech balloon sized to its lines, tail to the speaker; shrinks the type if a line would run past maxRx
  function balloonT(lines, cx, cy, tx, ty, t, ta, tb, size = 60) {
    const T = tw(t); if (T < ta || T >= tb) return;
    const pop = ease.back(inv(ta, ta + .2, T));
    withT(() => {
      s.font = `900 ${size}px "Superclarendon"`;
      let m = Math.max(...lines.map((l) => s.measureText(l).width)), sz = size;
      const maxM = (W / 2 - 50 - 40) * 2 / 1.25;                                // text box that keeps the balloon inside the frame
      if (m > maxM) { sz = size * maxM / m; m = maxM; }
      const lh = sz * 1.15, th = lh * lines.length;
      const rx = (m / 2 * 1.25 + 40) * pop, ry = (th / 2 * 1.35 + 40) * pop; if (rx < 2) return;
      const ccx = clamp(cx, 50 + rx, W - 50 - rx);
      const mk = () => { s.beginPath(); s.ellipse(ccx, cy, rx, ry, 0, 0, TAU); const a = Math.atan2(ty - cy, tx - ccx), b0 = a - .2, b1 = a + .2;
        s.moveTo(ccx + Math.cos(b0) * rx * .9, cy + Math.sin(b0) * ry * .9); s.lineTo(lerp(ccx, tx, pop), lerp(cy, ty, pop)); s.lineTo(ccx + Math.cos(b1) * rx * .9, cy + Math.sin(b1) * ry * .9); };
      shape(mk, CUT, 8, INK);
      if (pop > .95) lines.forEach((l, i) => carveText(l, ccx, cy + 4 + (i - (lines.length - 1) / 2) * lh, sz, INK));
    });
  }
  const JIMI_RS = [340, 1010], BOB_RS = [660, 1060];          // where the balloon tails point (their mouths), screen space
  function roadside(t, tl) {
    const T = tw(t), hz = 1080, sx = 540, rays = hit(t, 279.3, 1.2) * .6 + hit(t, 280.37, 1.0) * .9;
    cam(540, 1200, kf(T, [[276.4, 1.0], [282.5, 1.05]], ease.sine), () => {
      dawn(t, hz, sx, hz, 200, rays);
      shape(() => pathOf([[sx - 14, hz], [sx + 14, hz], [W + 300, H + 60], [-220, H + 60]]), CUT, 4);          // the road to the sun
      for (let i = 0; i < 6; i++) { const q = wrap(T * .25 + i / 6, 1), a = Math.pow(q, 2.2), yy = lerp(hz, H, a), xx = lerp(sx, sx + 40, a), ww = lerp(2, 40, a);
        shape(() => pathOf([[xx - ww * .3, yy], [xx + ww * .3, yy], [xx + ww * .45, yy + ww * 2], [xx - ww * .45, yy + ww * 2]]), INK); }
      const u = inv(276.4, 282.5, T), bk_ = lerp(.17, .06, u);                                                    // her bus, small, nearly into the sun
      schoolBus(sx - 20 + u * 10, hz + 6, bk_, { t: T, kids: 0, driver: 'ellen', lights: true });
      // the pair at the roadside, clearly Bob and Jimi: their carved photos, faces to us, big; Jimi a step further back
      piece('jimi-helsinki', 300, 1900, 930, { ax: .5, ay: 1 }, 6);
      piece('bob-1989', 770, 1990, 900, { ax: .5, ay: 1, flip: true, crop: [0, 0, 1, .92] }, 6);
    });
    // the lines are spoken on the recording; each balloon's words are up as the voice starts (vocal-stem onsets
    // 276.96 / 278.88 / 280.28) and stay until the next line
    balloonT(['That felt great.'], 640, 560, BOB_RS[0], BOB_RS[1], t, 276.80, 278.80);
    balloonT(['I think she would', 'have liked that.'], 460, 520, JIMI_RS[0], JIMI_RS[1], t, 278.72, 280.20);
    balloonT(['Yeah.'], 760, 620, BOB_RS[0], BOB_RS[1], t, 280.12, 282.6);
  }

  chapter('p6b', 230.4, 282.5, [
    [230.4, pushBus],
    [233.47, trainThrough],
    [236.53, trainRide],
    [240.3, bigStar],
    [243.7, houseRoar],
    [247.0, hopBop],
    [251.0, overShoulder],
    [254.6, walksOff],
    [262.47, busAway],
    [266.1, driving],
    [271.67, mirror],
    [274.6, smile],
    [276.4, roadside],
  ]);
})();
