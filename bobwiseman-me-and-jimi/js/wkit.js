// WOODCUT KIT for Me and Jimi (Bob's storyboard, STORYBOARD.md). Loaded after js/wood.js (flick, taper,
// chisel, rows, flicks, shape, clipTo, pathOf, smoothPath, arcPts; INK / CUT / RED) and before the chapters.
// The look (js/look-woodcut.js) prints three values: INK black, CUT white (paper), RED (#f00, the red plate).
// RED IS RESERVED FOR ELLEN (her hair) and a very few accents (the glowing E, the red carpet, a stop light).
//
// Pieces: real people are carved from photos by tools/woodcutify.py into assets/wood/*.png (black ink on a
// white block, transparent around). Draw them with put(); they print like the rest.
//   bob-1989     Bob with his accordion, 1989 (from his album back cover)
//   jimi-helsinki  Jimi, Helsinki 1967: fist up, Strat across him, looking down-left
//   jimi-1968    Jimi, 1968: in his hat, grinning, pointing straight at the viewer (Bob's beat 9)
//   mj-1984      Michael Jackson, 1984: white glove up, sequinned jacket, aviators
//   beyonce      Beyonce, 2023: mic to her mouth, long hair
//   pixies       the Pixies, the four of them, standing
//   ellen        Ellen McIlwaine singing at the mic with her guitar (old photo from Bob); her hair is on the red plate
// Every piece also has a carved CUT block behind it, so it reads as cut out of the scene.
const W_PIECES = ['bob-1989', 'jimi-helsinki', 'jimi-1968', 'mj-1984', 'beyonce', 'pixies', 'ellen', 'muddy', 'hopkins', 'richard', 'joplin', 'berry', 'tharpe', 'spann', 'lauper', 'springsteen', 'prince', 'madonna', 'bowie', 'boygeorge', 'byrne'];
const WP = {};
window.__woodReady = Promise.all(W_PIECES.map((n) => new Promise((res) => {
  const im = new Image(); im.onload = () => { WP[n] = im; res(); }; im.onerror = () => { console.error('missing assets/wood/' + n + '.png'); res(); }; im.src = 'assets/wood/' + n + '.png';
})));

// draw piece n with its anchor (ax, ay: fractions of the piece) at (x, y), h px tall; optional source crop
// [sx, sy, sw, sh] in fractions of the piece (e.g. Jimi's head only), rot, flip (mirror), alpha (ghost)
function put(n, x, y, h, o = {}) {
  const im = WP[n]; if (!im) return;
  const { ax = .5, ay = 1, rot = 0, flip = false, alpha = 1, crop = null } = o;
  const [cx, cy, cw, ch] = crop || [0, 0, 1, 1];
  const sw = im.width * cw, sh = im.height * ch, w = h * sw / sh;
  withT(() => { s.globalAlpha = alpha; s.translate(x, y); s.rotate(rot); s.scale(flip ? -1 : 1, 1);
    s.drawImage(im, im.width * cx, im.height * cy, sw, sh, -w * ax, -h * ay, w, h); });
}

// ---------- carved type: chunky letters, edges roughened by the print ----------
function carveText(str, x, y, size, c = INK, o = {}) {
  const { align = 'center', font = 'Superclarendon', weight = '900', w = null, rot = 0 } = o;
  withT(() => { s.translate(x, y); s.rotate(rot); s.font = `${weight} ${size}px "${font}"`; s.textAlign = align; s.textBaseline = 'middle';
    if (w) { const m = s.measureText(str).width; s.scale(w / m, 1); }
    s.fillStyle = c; s.fillText(str, 0, 0); });
}

// ---------- ELLEN (drawn): flowing red hair, bus-driver jacket, slide on her finger ----------
// ellen(x, y, k, o): (x, y) = between her feet; k = scale (1 = about 560 px tall).
//   o.pose: 'stand' | 'walk' (guitar case in her near hand) | 'play' (guitar across her, slide moving)
//           | 'drive' (seated, hands on a wheel; draw from the hips up) | 'point' | 'hold' (slide guitar held up)
//   o.t: song time (walk cycle, hair motion); o.wind: 0..1 hair blown sideways (1 = horizontal hurricane);
//   o.face: 'side' | 'front'; o.facing: 1 right, -1 left; o.slide: 0..1 where the slide sits on the neck;
//   o.eyes: 'open' | 'roll' (rolls her eyes) | 'brow' (one eyebrow up) | 'closed'; o.smile: 0..1
function ellenRaw(x, y, k, o = {}) {
  const { pose = 'stand', t = 0, wind = 0, facing = 1, slide = .5, eyes = 'open', smile = 0, case_ = true } = o;
  withT(() => {
    s.translate(x, y); s.scale(k * facing, k);
    const ph = t * 6.5, st = pose === 'walk' ? Math.sin(ph) : 0, bob = pose === 'walk' ? -Math.abs(Math.cos(ph)) * 7 : 0;
    s.translate(0, bob);
    const sway = Math.sin(t * 1.6) * 5 * (1 - wind) + wind * (Math.sin(t * 9.3) * 14 + Math.sin(t * 5.1) * 8), W_ = wind;   // in full wind the mane whips, it never freezes
    // proportions: feet at 0, hips -250, waist -300, shoulders -395, chin -420, crown -520
    // ---- the mane behind her (RED): long and full, or streaming flat in the wind ----
    const mane = () => {
      s.beginPath(); s.moveTo(-42, -500);
      const tx = lerp(-70, -600, W_), ty = lerp(-230, -470, W_);
      s.bezierCurveTo(-110, -500, lerp(-120, -300, W_), lerp(-330, -500, W_), lerp(-110, -460, W_) + sway, lerp(-260, -480, W_));
      s.bezierCurveTo(lerp(-120, -520, W_), lerp(-230, -470, W_), tx + sway, ty, tx - 10, ty + 20);
      s.bezierCurveTo(lerp(-40, -420, W_), lerp(-210, -420, W_), lerp(20, -200, W_), lerp(-240, -410, W_), lerp(70, -60, W_), lerp(-300, -420, W_));
      s.bezierCurveTo(lerp(84, 10, W_), lerp(-380, -440, W_), 70, -470, 44, -500);
      s.bezierCurveTo(30, -540, -30, -540, -42, -500); s.closePath();
    };
    shape(mane, RED, 4.5);
    clipTo(mane, () => { for (let i = 0; i < 12; i++) taper([[-34 + i * 7, -500 + i * 2], [lerp(-90 + i * 14, -560 + i * 8, W_) + sway, lerp(-250 + i * 4, -470 + i * 6, W_)]], 2.6, .4, INK); });
    // ---- legs: trousers in ink, carved crease; boots ----
    if (pose !== 'drive') {
      // plump all the way down (Robin: a round jacket on thin legs read as a skinny person in a fat coat):
      // a full seat and hips as wide as the jacket's hem, thick thighs tapering to sturdy calves, bigger boots
      shape(() => pathOf(chisel([[-90, -240], [90, -240], [92, -196], [74, -168], [-74, -168], [-92, -196]], 8, 2.5)), INK);
      const leg = (hx, sw) => {
        const kx = hx + sw * 22, fx = hx + sw * 46;
        taper([[hx, -232], [kx, -122], [fx, -16]], 86, 54, INK);
        taper([[hx + 10, -220], [kx + 8, -128]], 2.5, 1, CUT);
        shape(() => pathOf(chisel([[fx - 32, -28], [fx + 52, -24], [fx + 58, 2], [fx - 34, 2]], 5, 2)), INK);
        taper([[fx - 24, -6], [fx + 48, -4]], 2, 2, CUT);
      };
      leg(-42, st); leg(44, -st);
    }
    // ---- torso: the bus driver's jacket, black, belted, cut seams, two rows of buttons ----
    const jacket = () => pathOf(chisel([[-64, -398], [-30, -406], [30, -406], [64, -398], [86, -348], [96, -292], [90, -232], [-90, -232], [-96, -292], [-86, -348]], 21, 2.5));   // round: Bob, 'plump her up a wee bit'
    shape(jacket, INK);
    clipTo(jacket, () => {
      taper([[-4, -400], [-4, -236]], 2.5, 2.5, CUT); taper([[-98, -282], [98, -282]], 5, 5, CUT); taper([[-98, -268], [98, -268]], 2, 2, CUT);
      for (let i = 0; i < 3; i++) { dot(-18, -380 + i * 30, 4.5, CUT); dot(10, -380 + i * 30, 4.5, CUT); }
      rows(-100, -406, 100, -232, .3, 20, (u) => .5 + u * 2.2, CUT);
    });
    shape(() => pathOf([[-22, -404], [-4, -374], [14, -404], [4, -412], [-12, -412]]), CUT, 3);   // shirt collar
    // ---- arms: shoulder -> elbow -> hand, jacket sleeve ink, hand as a carved mitt ----
    const arm = (sx, sy, ex, ey, hx, hy) => {
      taper([[sx, sy], [ex, ey]], 40, 33, INK); taper([[ex, ey], [hx, hy]], 33, 25, INK);
      taper([[sx + 6, sy + 8], [ex + 4, ey]], 2, 1, CUT);
      const a = Math.atan2(hy - ey, hx - ex);
      withT(() => { s.translate(hx, hy); s.rotate(a); shape(() => { s.beginPath(); s.ellipse(10, 0, 17, 12, 0, 0, TAU); }, CUT, 3.5); taper([[2, -6], [18, -8]], 2, 1); });
      return [hx + Math.cos(a) * 20, hy + Math.sin(a) * 20];
    };
    // ---- neck, head, face ----
    shape(() => pathOf([[-19, -428], [19, -428], [18, -402], [-18, -402]]), CUT, 4);
    const head = () => { s.beginPath(); s.ellipse(2, -466, 41, 45, 0, 0, TAU); };   // a fuller face to match
    shape(head, CUT, 5);
    clipTo(head, () => { taper([[30, -500], [34, -440]], 6, 3, INK); });              // the shadow side of her face
    if (eyes === 'closed') { taper([[-18, -474], [-6, -472]], 3, 3); taper([[12, -472], [24, -474]], 3, 3); }
    else {
      const rx = eyes === 'roll' ? 0 : 3, ry = eyes === 'roll' ? -7 : 0;
      for (const ex of [-12, 18]) { shape(() => { s.beginPath(); s.ellipse(ex, -474, 8, 5, 0, 0, TAU); }, CUT, 2.5); dot(ex + rx, -474 + ry, 3.4, INK); }
      taper([[-22, -488], [-4, -491]], 4.5, 2.5); taper(eyes === 'brow' ? [[8, -496], [20, -503], [30, -499]] : [[10, -491], [28, -488]], 2.5, 4.5);
    }
    taper([[4, -474], [9, -454], [2, -450]], 2.5, 2.5);
    const sm = smile * 16; taper([[-12, -438 - sm * .35], [-2, -432 + sm * .45], [8, -432 + sm * .45], [18, -439 - sm * .4]], 3.8, 3.2);   // a smile you can see at a glance
    // ---- the fringe and side locks over her shoulders (RED, in front) ----
    const locks = () => {
      s.beginPath(); s.moveTo(-36, -470); s.bezierCurveTo(-44, -540, 52, -546, 40, -470);
      s.bezierCurveTo(26, -512, 6, -518, -6, -508); s.bezierCurveTo(-14, -516, -30, -510, -36, -490); s.closePath();   // the fringe stops above her brows so they read
      if (W_ < .55) { s.moveTo(34, -476); s.bezierCurveTo(56, -440, 50, -400, 66, -350 + sway); s.lineTo(42, -372); s.bezierCurveTo(36, -404, 30, -440, 30, -470); s.closePath();
        s.moveTo(-34, -476); s.bezierCurveTo(-54, -440, -48, -400, -60, -356 + sway); s.lineTo(-40, -376); s.bezierCurveTo(-34, -406, -30, -444, -30, -470); s.closePath(); }
    };
    shape(locks, RED, 4);
    clipTo(locks, () => { for (let i = 0; i < 6; i++) taper([[-30 + i * 12, -530], [-24 + i * 12, -470]], 2, .5, INK); });
    // ---- arms by pose ----
    if (pose === 'walk' || pose === 'stand') {
      arm(-66, -388, -96 - st * 14, -310, -94 - st * 26, -238);
      const h = arm(66, -388, 96 + st * 14, -310, 96 + st * 22, -244);
      if (case_ && pose === 'walk') guitarCase(h[0] + 2, h[1] + 8, .8, -Math.PI / 2 + st * .05);   // carried by the handle, lying along her side
    } else if (pose === 'play' || pose === 'hold') {
      const ang = pose === 'hold' ? -.95 : -.42;
      guitar(0, -300, .9, ang, slide, t);
      arm(-66, -388, -80, -322, -26, -292);                                    // picking hand over the soundhole
      const nx = Math.cos(ang), ny = Math.sin(ang), d = (110 + slide * 180) * .9;
      const hx = d * nx, hy = -300 + d * ny - 14;
      arm(66, -388, (66 + hx) / 2 + 34, (-388 + hy) / 2 + 22, hx, hy);         // fretting hand up the neck
      shape(() => { s.beginPath(); s.rect(hx - 6, hy - 6, 28, 40); }, CUT, 3.5); // the slide on her finger
      taper([[hx + 2, hy], [hx + 2, hy + 30]], 2, 2, INK);
    } else if (pose === 'drive') {
      arm(-66, -388, -60, -322, -4, -300); arm(66, -388, 88, -330, 62, -302);
    } else if (pose === 'point') {
      arm(-66, -388, -96, -310, -94, -238); arm(66, -388, 146, -404, 220, -414);
    }
  });
}
// ellen() = ellenRaw() plus a carved white edge round her whole silhouette, so her black jacket reads against
// black backgrounds (pass edge: false to skip it, e.g. for crowds of tiny Ellens; edgeW sets its width)
const _E = { a: null, b: null };
function ellen(x, y, k, o = {}) {
  if (o.edge === false) return ellenRaw(x, y, k, o);
  const bw = Math.ceil(1500 * k) + 40, bh = Math.ceil(900 * k) + 40, ox = bw / 2, oy = Math.round(bh * .82), ew = (o.edgeW ?? 7) * Math.max(.6, k);
  for (const key of ['a', 'b']) { if (!_E[key] || _E[key].width < bw || _E[key].height < bh) { _E[key] = document.createElement('canvas'); _E[key].width = bw; _E[key].height = bh; } }
  const A = _E.a, B = _E.b, ga = A.getContext('2d'), gb = B.getContext('2d');
  ga.setTransform(1, 0, 0, 1, 0, 0); ga.clearRect(0, 0, A.width, A.height); gb.setTransform(1, 0, 0, 1, 0, 0); gb.clearRect(0, 0, B.width, B.height);
  const keep = s; s = ga; try { ellenRaw(ox, oy, k, o); } finally { s = keep; }
  gb.drawImage(A, 0, 0); gb.globalCompositeOperation = 'source-in'; gb.fillStyle = CUT; gb.fillRect(0, 0, B.width, B.height); gb.globalCompositeOperation = 'source-over';
  withT(() => { for (let i = 0; i < 12; i++) { const a2 = i / 12 * TAU; s.drawImage(B, x - ox + Math.cos(a2) * ew, y - oy + Math.sin(a2) * ew); } s.drawImage(A, x - ox, y - oy); });
}
// her guitar case: the real shape (lower bout, waist, upper bout, tapered neck, head), black with carved highlights.
// (x, y) = the handle; the case lies along rot (0 = neck up), k = scale
function guitarCase(x, y, k, rot = 0) {
  withT(() => { s.translate(x, y); s.rotate(rot); s.scale(k, k);
    const P = [[0, 150], [52, 140], [74, 100], [72, 56], [50, 28], [44, 4], [56, -24], [58, -60], [40, -92], [18, -110], [16, -230], [24, -244], [20, -270], [-20, -270], [-24, -244], [-16, -230], [-18, -110], [-40, -92], [-58, -60], [-56, -24], [-44, 4], [-50, 28], [-72, 56], [-74, 100], [-52, 140]];
    const mk = () => smoothPath(P);
    shape(mk, INK, 5);
    clipTo(mk, () => { taper([[-48, 120], [-62, 60], [-40, 10], [-44, -50], [-14, -100], [-10, -240]], 3, 2, CUT); flicks(-40, 40, 40, 130, 8, -Math.PI / 2, 26, 3, 9); });
    shape(() => { s.beginPath(); s.rect(-30, 6, 60, 12); }, CUT, 3);                    // the handle
    for (const ly of [70, -50]) shape(() => { s.beginPath(); s.rect(60, ly, 12, 18); }, CUT, 2);   // latches
  });
}
function guitarCaseOld(x, y, k, rot = 0) {
  withT(() => { s.translate(x, y); s.rotate(rot); s.scale(k, k);
    const P = () => { s.beginPath(); s.ellipse(0, 70, 60, 70, 0, 0, TAU); s.moveTo(46, -40); s.ellipse(0, -40, 44, 50, 0, 0, TAU); s.rect(-18, -220, 36, 170); };
    shape(P, INK); clipTo(P, () => { for (let i = 0; i < 6; i++) flick(-40 + i * 16, 60, -Math.PI / 2 + (i - 3) * .1, 70, 4); });
    shape(() => { s.beginPath(); s.rect(-20, 4, 40, 10); }, CUT); });
}
// the slide guitar: a hollow-body flat-top, neck along ang from the body at (x, y)
function guitar(x, y, k, ang = -.4, slide = .5, t = 0) {
  withT(() => { s.translate(x, y); s.scale(k, k);
    const body = () => { s.beginPath(); s.ellipse(-30, 20, 88, 70, ang, 0, TAU); s.moveTo(60, 0); s.ellipse(40, -14, 66, 54, ang, 0, TAU); };
    shape(body, CUT, 6); clipTo(body, () => rows(-130, -80, 120, 100, ang + Math.PI / 2, 14, (u) => 1.5 + u * 2));
    dot(10, 0, 20, INK); dot(10, 0, 12, CUT); dot(10, 0, 7, INK);
    const nx = Math.cos(ang), ny = Math.sin(ang);
    taper([[60 * nx, 60 * ny], [330 * nx, 330 * ny]], 24, 20, INK);
    for (let f = 0; f < 9; f++) { const d = 90 + f * 26; taper([[d * nx - 10 * ny, d * ny + 10 * nx], [d * nx + 10 * ny, d * ny - 10 * nx]], 2, 2, CUT); }
    shape(() => pathOf([[330 * nx - 16 * ny, 330 * ny + 16 * nx], [400 * nx - 18 * ny, 400 * ny + 18 * nx], [400 * nx + 18 * ny, 400 * ny - 18 * nx], [330 * nx + 16 * ny, 330 * ny - 16 * nx]]), INK);
    for (let i = 0; i < 3; i++) taper([[0, 0], [330 * nx + (i - 1) * 5 * ny, 330 * ny - (i - 1) * 5 * nx]], 1.5, 1.5, CUT);
  });
}

// ---------- kids in pyjamas (stripes), simple carved figures; asleep or awake ----------
function kid(x, y, k, o = {}) {
  const { asleep = false, t = 0, seed = 1, letter = null, cry = false } = o;
  withT(() => { s.translate(x, y); s.scale(k, k);
    if (cry) { const sob = Math.sin(t * 22 + seed * 1.7); s.translate(sob * 2.5, Math.abs(sob) * -3); }
    const body = () => pathOf(chisel([[-34, -150], [34, -150], [40, 0], [-40, 0]], seed, 3));
    shape(body, CUT, 5); clipTo(body, () => rows(-40, -150, 40, 0, Math.PI / 2, 16, () => 7));
    const hd = () => { s.beginPath(); s.ellipse(0, -186, 32, 36, 0, 0, TAU); }; shape(hd, CUT, 5);
    shape(() => { s.beginPath(); s.ellipse(0, -212, 34, 16, 0, Math.PI, 0); }, INK);
    if (cry) {
      // Bob (draft-6 notes): 'the kids on the bus should all be crying, so we feel more sorry for her having that job'
      // scrunched eyes, brows up in the middle, a wailing mouth that pulses, tears running and dropping
      for (const sd of [-1, 1]) { taper([[sd * 18, -192], [sd * 8, -187], [sd * 18, -183]], 3, 3); taper([[sd * 20, -204], [sd * 6, -209]], 3, 2); }
      const wail = .75 + .25 * Math.sin(t * 9 + seed);
      shape(() => { s.beginPath(); s.ellipse(0, -164, 11, 13 * wail, 0, 0, TAU); }, INK);
      for (const sd of [-1, 1]) {
        taper([[sd * 13, -182], [sd * 15, -170], [sd * 17, -156]], 3, 2);
        const q = ((t * 1.6 + seed * .37 + (sd > 0 ? .5 : 0)) % 1), dy = -152 + q * 60;
        shape(() => { s.beginPath(); s.moveTo(sd * 18, dy - 8); s.quadraticCurveTo(sd * 24, dy + 4, sd * 18, dy + 6); s.quadraticCurveTo(sd * 12, dy + 4, sd * 18, dy - 8); }, INK);
      }
    } else {
    if (asleep) { taper([[-16, -188], [-6, -186]], 3, 3); taper([[6, -186], [16, -188]], 3, 3); }
    else { dot(-11, -188, 4, INK); dot(11, -188, 4, INK); }
    dot(0, -168, asleep ? 4 : 3, INK);
    }
    if (letter) { shape(() => { s.beginPath(); s.rect(-46, -140, 92, 100); }, CUT, 6); carveText(letter, 0, -90, 80, letter === letter.toLowerCase() ? INK : INK); }
  });
}

// ---------- the yellow school bus (in woodcut: cut white body, black lines; side view, facing right) ----------
function schoolBus(x, y, k, o = {}) {
  const { t = 0, lights = false, driver = 'ellen', kids = 5, asleep = true, doorOpen = false, cry = false, crowd = 1 } = o;
  withT(() => { s.translate(x, y); s.scale(k, k);
    const body = () => pathOf(chisel([[-620, -420], [520, -420], [560, -400], [600, -220], [610, -60], [-620, -60]], 31, 4));
    shape(body, CUT, 8);
    clipTo(body, () => { rows(-620, -200, 610, -60, Math.PI / 2, 12, (u) => 1 + u * 5); });
    taper([[-620, -180], [608, -180]], 14, 14); taper([[-620, -150], [608, -150]], 7, 7);
    carveText('SCHOOL BUS', -60, -390, 40, INK, { w: 380 });
    for (let i = 0; i < 6; i++) { const wx = -560 + i * 170;
      shape(() => { s.beginPath(); s.rect(wx, -340, 140, 140); }, INK);
      // crowd > 1 packs that many kids into each window (Bob, draft-9 notes: two or three times as many crying kids)
      if (i > 0 && i <= kids) clipTo(() => { s.beginPath(); s.rect(wx, -340, 140, 140); }, () => { if (crowd <= 1) kid(wx + 70, -190, .7, { asleep, t, seed: i, cry });
        else for (let c = 0; c < crowd; c++) { const u = crowd === 1 ? .5 : c / (crowd - 1); kid(wx + 22 + u * 96, -200 + (c % 2) * 14, .5, { asleep, t, seed: i * 5 + c, cry }); } }); }
    // the driver's window at the front (right), windscreen
    shape(() => pathOf([[480, -340], [560, -340], [590, -220], [480, -220]]), INK);
    if (driver === 'ellen') clipTo(() => pathOf([[480, -340], [560, -340], [590, -220], [480, -220]]), () => ellen(520, 40, .62, { pose: 'drive', t }));
    if (doorOpen) shape(() => { s.beginPath(); s.rect(400, -330, 60, 270); }, INK);
    else { shape(() => { s.beginPath(); s.rect(400, -330, 60, 270); }, CUT, 5); taper([[430, -330], [430, -60]], 4, 4); }
    for (const wx of [-420, 400]) { dot(wx, -50, 72, INK); dot(wx, -50, 34, CUT); dot(wx, -50, 14, INK); for (let i = 0; i < 6; i++) { const a = t * 6 + i * TAU / 6; flick(wx + Math.cos(a) * 66, -50 + Math.sin(a) * 66, a + Math.PI, 20, 5); } }
    // headlights: become spotlights when lit
    dot(596, -110, 16, CUT); s.beginPath(); s.arc(596, -110, 16, 0, TAU); s.lineWidth = 4; s.strokeStyle = INK; s.stroke();
    if (lights) { shape(() => pathOf([[600, -126], [1600, -420], [1600, 220], [600, -94]]), CUT); clipTo(() => pathOf([[600, -126], [1600, -420], [1600, 220], [600, -94]]), () => rows(600, -420, 1600, 220, 0, 26, (u) => 1 + u * 3)); }
  });
}

// ---------- the empty stage / theatre ----------
function stage(o = {}) {
  const { curtain = 1, seats = true, t = 0 } = o;
  shape(() => { s.beginPath(); s.rect(-20, -20, W + 40, H + 40); }, INK);
  // the boards
  shape(() => pathOf([[160, 760], [1760, 760], [1920, 1080], [0, 1080]]), CUT, 6);
  clipTo(() => pathOf([[160, 760], [1760, 760], [1920, 1080], [0, 1080]]), () => { for (let i = 0; i < 18; i++) taper([[160 + i * 94, 760], [i * 113, 1080]], 3, 6); });
  // proscenium curtains (black with cut folds)
  for (const side of [-1, 1]) { const x0 = side < 0 ? 0 : W - 260 * curtain; shape(() => { s.beginPath(); s.rect(x0, 0, 260 * curtain + 2, 760); }, INK); clipTo(() => { s.beginPath(); s.rect(x0, 0, 260 * curtain, 760); }, () => { for (let i = 0; i < 6; i++) taper([[x0 + 30 + i * 40, 0], [x0 + 26 + i * 40, 760]], 2, 5, CUT); }); }
}
