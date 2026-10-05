// 77.6 - 112.0  verse 2: THE 60s CLUB. Look: 1966 psychedelic concert poster + liquid light show
// (look-psych.js). Times are the Demucs vocal onsets (Whisper ran about a second early here).
//   77.63 wall      a wall of gig bills; on "before Beyonce" the 2003 bill tears away, on "before the
//                   Pixies" (80.33) the 1988 one; under them a 1966 bill blooms into colour.
//                   Years only: no other artists' names or likenesses
//   83.47 club      "she found her calling": the bill comes alive, CAFE AU GO GO in melting letters, her
//                   silhouette on a small stage against the light show (no face: a shape and a guitar);
//                   the lettering melts hard on "sixties" (87.23)
//   91.37 tuning    the open-tuning line: a headstock close up, a peg turns on each syllable and the
//                   strings change colour as they retune
//   96.40 slide     "plays the slide guitar": a glass bottleneck glides the strings, the light show
//                   pours out of its trail; quick glides on "like no one's business" (99.33-100.6)
//  101.47 door      the missed train, part two: the night street, the club door glowing; the man in the
//                   hat (the narrator, a stand-in) runs up with his keyboard case as the door swings shut
//                   (shut on "remember", 106.0); the bill on the door
//  108.97 name      ELLEN McILWAINE swells on the door bill in melting letters; at 111 the whole frame
//                   dissolves into the light show for the instrumental
(() => {
  const C = PSY.C, KEY = PSY.KEY;
  const T = (x) => onTwos(x, 12);
  function rectc(x, y, w, h, c) { s.fillStyle = c; s.fillRect(x, y, w, h); }
  function shp(pts, c, stroke = 0) { s.beginPath(); pts.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y)); s.closePath(); s.fillStyle = c; s.fill(); if (stroke) { s.lineWidth = stroke; s.strokeStyle = C.ink; s.lineJoin = 'round'; s.stroke(); } }
  function ov(x, y, rx, ry, c, rot = 0) { s.beginPath(); s.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), rot, 0, TAU); s.fillStyle = c; s.fill(); }

  // ---------- melting lettering: text set into an offscreen sheet, then redrawn in thin vertical strips
  // whose height and offset follow an envelope (bulge) and a wave (melt) ----------
  const SHEETS = {};
  function sheet(str, font, col) {
    const id = str + font + col; if (SHEETS[id]) return SHEETS[id];
    const c = document.createElement('canvas'), g = c.getContext('2d');
    g.font = `900 200px "${font}"`; const m = g.measureText(str);
    const w = Math.ceil(m.actualBoundingBoxLeft + m.actualBoundingBoxRight) + 8, h = Math.ceil(m.actualBoundingBoxAscent + m.actualBoundingBoxDescent) + 8;
    c.width = w; c.height = h; g.font = `900 200px "${font}"`; g.fillStyle = col; g.fillText(str, m.actualBoundingBoxLeft + 4, m.actualBoundingBoxAscent + 4);
    return (SHEETS[id] = c);
  }
  // envelope(u) -> [top, bottom] in 0..1 of the box; wave(u) -> vertical offset px
  function meltText(str, x, y, w, h, col, { font = 'Superclarendon', bulge = .35, melt = 0, t = 0, outline = null } = {}) {
    const src = sheet(str, font, col), N = 90;
    const draw = (dx, dy, img) => {
      for (let i = 0; i < N; i++) {
        const u0 = i / N, u1 = (i + 1) / N, um = (u0 + u1) / 2;
        const env = 1 - bulge + bulge * Math.sin(um * Math.PI);           // fatter in the middle, like letters filling a shape
        const wave = Math.sin(um * 9 + t * 2.2) * melt * h * .12 + Math.sin(um * 23 - t * 3) * melt * h * .04;
        const hh = h * env * (1 + melt * .25 * Math.sin(um * 5 + t));
        s.drawImage(img, u0 * img.width, 0, (u1 - u0) * img.width + .5, img.height, x - w / 2 + u0 * w + dx, y - hh / 2 + wave + dy, (u1 - u0) * w + .6, hh);
      }
    };
    if (outline) draw(6, 6, sheet(str, font, outline));
    draw(0, 0, src);
  }

  // ---------- a gig bill on the wall ----------
  function bill(x, y, w, h, kind, rot = 0, tear = 0) {
    withT(() => {
      s.translate(x, y); s.rotate(rot);
      if (tear > 0) { s.translate(0, -tear * 300); s.rotate(tear * .6); s.scale(1 - tear * .3, 1 - tear * .3); }
      if (kind === 2003) {             // glossy, gold-on-black, a diva star (no one in particular)
        rectc(-w / 2, -h / 2, w, h, '#111018'); rectc(-w / 2 + 12, -h / 2 + 12, w - 24, h - 24, '#2a2433');
        s.fillStyle = C.ye; s.beginPath(); for (let k = 0; k < 10; k++) { const a = k * TAU / 10 - Math.PI / 2, r = k % 2 ? 50 : 120; s.lineTo(Math.cos(a) * r, -40 + Math.sin(a) * r); } s.closePath(); s.fill();
        s.fillStyle = C.ye; s.font = '900 110px "Superclarendon"'; s.textAlign = 'center'; s.fillText('2003', 0, h / 2 - 70);
      } else if (kind === 1988) {      // photocopied indie flyer: black on grey, cut-up type
        rectc(-w / 2, -h / 2, w, h, '#d9d4cc');
        for (let k = 0; k < 6; k++) rectc(-w / 2 + 30 + hash(k) * 60, -h / 2 + 40 + k * 70, w * (.4 + hash(k + 5) * .4), 38, '#1d1420');
        s.fillStyle = '#1d1420'; s.font = '900 120px "Impact"'; s.textAlign = 'center'; s.fillText('1988', 0, h / 2 - 50);
      } else {                         // 1966: the psychedelic bill
        rectc(-w / 2, -h / 2, w, h, C.mg); rectc(-w / 2 + 16, -h / 2 + 16, w - 32, h - 32, KEY);
        ov(0, -40, w * .32, w * .32, C.or); ov(0, -40, w * .22, w * .22, C.ye);
        meltText('1966', 0, h / 2 - 90, w * .8, 110, C.bl, { bulge: .5, melt: .3, t: x * .001, outline: C.ink });
      }
    });
  }
  function shotWall(t, l) {
    const tt = T(t), A = 77.63, B = 80.33;
    rectc(0, 0, W, H, '#3a2c2a');
    for (let r = 0; r < 12; r++) for (let k = 0; k < 9; k++) rectc(k * 230 + (r % 2) * 115 - 60, r * 92, 220, 84, '#4a3632');   // brick
    bill(W / 2, H / 2, 640, 860, 1966);
    if (tt < B + 1.2) bill(W / 2 + 8, H / 2 - 4, 640, 860, 1988, .01, ease.in(inv(B, B + 1.0, tt)));
    if (tt < A + 1.2) bill(W / 2 - 6, H / 2 + 6, 640, 860, 2003, -.015, ease.in(inv(A + .1, A + 1.1, tt)));
    // the 1966 bill blooms: the camera leans in as the last layer goes
    fx({ beat: beatPulse(t, 5) * .6 * inv(B, B + 1, t), melt: .25 * inv(B, 83.4, t) });
  }

  // ---------- the club: her silhouette on a small stage ----------
  function silhouette(x, y, sc, t) {
    // her as a shape only: a big cloud of hair, shoulders, a long dress, a guitar across her; a yellow rim
    // light (the stage light behind her) separates the shapes. No face, no features.
    withT(() => {
      s.translate(x, y); s.scale(sc, sc);
      const sway = Math.sin(t * 2.1) * 6, nod = beatPulse(t, 8) * 8;
      const HAIR = [[0, -600, 120], [-95, -560, 90], [95, -560, 90], [-120, -470, 75], [120, -470, 75], [-60, -660, 80], [60, -660, 80]];
      const body = () => { s.beginPath(); s.moveTo(-120 + sway, -440); s.quadraticCurveTo(sway, -470, 120 + sway, -440); s.lineTo(160, -60); s.lineTo(190, 0); s.lineTo(-190, 0); s.lineTo(-160, -60); s.closePath(); };
      const hair = () => { s.beginPath(); HAIR.forEach(([hx, hy, r]) => { s.moveTo(hx + sway + r, hy + nod); s.arc(hx + sway, hy + nod, r, 0, TAU); }); };
      // rim light: the same shapes drawn a touch bigger in yellow first
      s.fillStyle = C.ye; s.save(); s.translate(0, -6); s.scale(1.03, 1.02); hair(); s.fill(); body(); s.fill(); s.restore();
      s.fillStyle = C.ink; hair(); s.fill(); body(); s.fill(); s.fillRect(-110 + sway, -520 + nod, 220, 100);
      // the guitar, angled up to the left (her neck hand high), outlined so it reads against her
      s.save(); s.translate(30 + sway * .5, -280); s.rotate(-.5);
      const gtr = () => { s.beginPath(); s.ellipse(-20, 30, 150, 118, 0, 0, TAU); s.moveTo(200, 20); s.ellipse(110, 20, 100, 84, 0, 0, TAU); };
      s.fillStyle = C.or; gtr(); s.fill(); s.lineWidth = 10; s.strokeStyle = C.ink; s.stroke();
      s.fillStyle = C.ink; s.beginPath(); s.arc(60, 24, 34, 0, TAU); s.fill();
      s.fillRect(190, 6, 430, 34); s.fillRect(600, -8, 90, 62);
      s.restore();
    });
  }
  function shotClub(t, l) {
    const tt = T(t), S60 = 87.23;
    const melt = .35 + .65 * hit(t, S60, 1.2) + .2 * inv(83.47, 91.3, t);
    fx({ melt, beat: beatPulse(t, 5) });
    rectc(0, 0, W, H, KEY);                                                     // the light show fills the room
    // the bill's frame stays round the edge, like we stepped into the poster
    rectc(0, 0, W, 60, C.mg); rectc(0, H - 60, W, 60, C.mg); rectc(0, 0, 60, H, C.mg); rectc(W - 60, 0, 60, H, C.mg);
    meltText('CAFE AU GO GO', W / 2, 170, 1300, 190, C.or, { bulge: .55, melt: melt * .8, t, outline: C.ink });
    meltText('BLEECKER STREET   NEW YORK   1966', W / 2, 315, 980, 56, C.ye, { bulge: .2, melt: melt * .5, t: t + 1, outline: C.ink });
    // small stage, a stool, her silhouette, a mic
    shp([[220, 1020], [1700, 1020], [1600, 900], [320, 900]], C.pu, 5);
    rectc(320, 890, 1280, 14, C.ink);
    silhouette(W / 2 - 60, 905, .82, t);
    rectc(W / 2 + 230, 520, 10, 380, C.ink); ov(W / 2 + 235, 515, 20, 28, C.ink);
  }

  // ---------- open tuning: the headstock ----------
  const PEGS = [92.4, 92.93, 93.13, 93.77, 94.1, 95.2];
  function shotTuning(t, l) {
    const tt = T(t);
    fx({ melt: .2, beat: beatPulse(t, 6) * .5 });
    rectc(0, 0, W, H, KEY);
    withT(() => {
      s.translate(W / 2 + 80, H / 2 + 40); s.rotate(-.18);
      // neck coming in from the left, headstock at the right
      rectc(-1400, -90, 1000, 180, '#6b3b22'); for (let k = 0; k < 8; k++) rectc(-1380 + k * 128, -90, 8, 180, '#d9c08a');
      rectc(-410, -96, 24, 192, C.pap);                                          // nut
      shp([[-390, -110], [420, -230], [470, 0], [420, 230], [-390, 110]], C.ink);
      shp([[-370, -94], [400, -200], [440, 0], [400, 200], [-370, 94]], '#7a4a2c');
      PEGS.forEach((pt, i) => {
        const side = i < 3 ? -1 : 1, px = -150 + (i % 3) * 210, py = side * (150 + (i % 3) * 40);
        const turns = PEGS.filter((p) => tt >= p).length > i ? 1 : 0;
        const spin = ease.out(inv(pt, pt + .45, tt)) * TAU * .75;
        // string from the nut to the peg post, coloured by whether it's retuned yet
        s.lineWidth = 5; s.strokeStyle = turns ? [C.or, C.mg, C.ye, C.gr, C.bl, C.pink][i] : C.pap;
        const vib = turns ? Math.sin(t * 60 + i) * 3 * hit(t, pt, 3) : 0;
        s.beginPath(); s.moveTo(-1400, -75 + i * 30); s.lineTo(-400, -75 + i * 30 + vib); s.lineTo(px, py * .35 + vib); s.stroke();
        ov(px, py * .35, 14, 14, '#c9c2b0');
        withT(() => { s.translate(px, py + side * 30); s.rotate(spin); ov(0, 0, 46, 22, '#e9e2cf'); ov(0, 0, 14, 14, C.ink); });
        rectc(px - 8, py * .35, 16, py - py * .35 + side * 10, '#c9c2b0');
      });
    });
    meltText('OPEN TUNING', 520, 930, 760, 120, C.ye, { bulge: .4, melt: .3, t, outline: C.ink });
  }

  // ---------- the slide ----------
  const GLIDES = [[96.4, -300], [97.37, 260], [99.33, -80], [99.87, 340], [100.33, 120], [100.6, 420]];
  function slideX(t) {
    let x = -600; for (let i = 0; i < GLIDES.length; i++) { const [g, to] = GLIDES[i]; if (t >= g) x = lerp(i ? GLIDES[i - 1][1] : -600, to, ease.out(inv(g, g + .3, t))); } return x;
  }
  function shotSlide(t, l) {
    const tt = T(t);
    fx({ melt: .3, beat: beatPulse(t, 5) * .8 });
    rectc(0, 0, W, H, C.pu);
    withT(() => {
      s.translate(W / 2, H / 2); s.rotate(-.08);
      rectc(-1100, -150, 2200, 300, '#6b3b22');
      for (let k = 0; k < 14; k++) rectc(-1080 + k * 160 * (1 - k * .02), -150, 9, 300, '#d9c08a');
      [1, 3, 5, 7, 9].forEach((k) => ov(-1000 + k * 150 + 75, 0, 14, 14, C.pap));
      // the trail behind the slide is a window onto the light show
      const sx = slideX(tt), trailFrom = Math.min(sx, slideX(tt - .6));
      s.fillStyle = KEY; s.fillRect(trailFrom - 40, -150, sx - trailFrom + 40, 300);
      for (let i = 0; i < 6; i++) { const y = -125 + i * 50; const dv = Math.sin(t * 50 + i) * 4 * (1 + hit(t, 97.37, 2)); s.lineWidth = 3 + i * .6; s.strokeStyle = C.pap; s.beginPath(); s.moveTo(-1100, y); s.lineTo(sx, y + dv); s.lineTo(1100, y); s.stroke(); }
      // the bottleneck on a finger: glass with a highlight, the finger in shadow
      rectc(sx - 70, -260, 140, 520, '#a9d8ee'); rectc(sx - 70, -260, 18, 520, C.pap); rectc(sx + 40, -260, 12, 520, C.bl); for (let i = 0; i < 6; i++) rectc(sx - 52, -127 + i * 50, 92, 3, '#6fa7c4');
      shp([[sx - 50, -270], [sx + 50, -270], [sx + 60, -520], [sx - 60, -520]], C.ink);
    });
    meltText('SLIDE', 360, 170, 520, 150, C.or, { bulge: .5, melt: .4 + .6 * hit(t, 97.37, 2), t, outline: C.ink });
  }

  // ---------- the door shuts (he missed her again) ----------
  function man(x, y, sc, run, t) {
    withT(() => {
      s.translate(x, y); s.scale(sc, sc);
      const ph = t * 9, a = Math.sin(ph) * .6 * run;
      s.fillStyle = C.ink;
      // legs
      [a, -a].forEach((q) => { s.save(); s.translate(0, -170); s.rotate(q); s.fillRect(-14, 0, 28, 170); s.restore(); });
      // coat, head, hat
      shp([[-60, -170], [60, -170], [50, -400], [-50, -400]], C.ink);
      ov(0, -440, 40, 46, C.ink); ov(0, -472, 70, 14, C.ink); s.fillRect(-42, -530, 84, 60);
      // the keyboard case in his hand, swinging
      s.save(); s.translate(50, -300); s.rotate(-a * .5); s.fillRect(-10, 0, 20, 70); s.fillStyle = C.bl; s.fillRect(-160, 70, 320, 70); s.restore();
    });
  }
  function shotDoor(t, l) {
    const tt = T(t), SHUT = 106.0;
    fx({ melt: .12, beat: beatPulse(t, 6) * .3 });
    rectc(0, 0, W, H, C.pu);
    for (let r = 0; r < 12; r++) for (let k = 0; k < 9; k++) rectc(k * 230 + (r % 2) * 115 - 60, r * 92, 220, 84, '#4a2c5e');
    rectc(0, 880, W, 200, C.ink); rectc(0, 880, W, 12, C.or);
    // the doorway: light show inside while it's open; the door swings shut
    const dx = 1180, dw = 300, dh = 560, open = 1 - ease.inOut(inv(103.8, SHUT, tt));
    rectc(dx - 20, 880 - dh - 20, dw + 40, dh + 20, C.mg);
    rectc(dx, 880 - dh, dw, dh, KEY);
    if (open > .01) { shp([[dx + dw * open, 880 - dh], [dx + dw * open + 60 * open, 860 - dh], [dx + dw * open + 60 * open, 900], [dx + dw * open, 880]], C.ink); shp([[dx + dw * open, 880], [dx + dw * open + 400 * open, 1080], [dx + dw * open - 100, 1080], [dx, 880]], KEY); }
    rectc(dx, 880 - dh, dw * (1 - open), dh, '#7a3a20');                        // the door itself
    if (open < .3) { rectc(dx + 60, 880 - dh + 110, 180, 240, C.ye); meltText('TONIGHT', dx + 150, 880 - dh + 150, 150, 36, C.mg, { bulge: .2, t }); }
    // marquee
    meltText('CAFE AU GO GO', dx + dw / 2, 880 - dh - 90, 560, 90, C.or, { bulge: .5, melt: .2, t, outline: C.ink });
    // him: runs in from the left, arrives as it shuts, stands there
    const arrive = ease.out(inv(101.5, SHUT + .2, tt)), x = lerp(-200, dx - 160, arrive);
    man(x, 880, 1, tt < SHUT + .2 ? 1 : 0, tt);
    if (tt > SHUT + .3) { const k = smooth(inv(SHUT + .3, SHUT + 1.2, tt)); meltText('SHOW\'S OVER', 560, 300, 700 * k + 1, 110, C.ye, { bulge: .3, melt: .2, t, outline: C.ink }); }
  }

  // ---------- her name on the door bill, then everything melts ----------
  function shotName(t, l) {
    const tt = T(t), N0 = 108.97;
    const k = ease.out(inv(N0, N0 + .8, t)), dissolve = smooth(inv(110.6, 111.9, t));
    fx({ melt: .3 + .7 * dissolve, beat: beatPulse(t, 5) });
    rectc(0, 0, W, H, C.ye);
    rectc(80, 70, W - 160, H - 140, C.mg); rectc(110, 100, W - 220, H - 200, C.ye);
    meltText('TONIGHT', W / 2, 230, 600, 100, C.bl, { bulge: .3, t, outline: C.ink });
    meltText('ELLEN', W / 2, 470, 900 * (.6 + .4 * k), 240 * (.6 + .4 * k), C.mg, { bulge: .6, melt: .3 + dissolve, t, outline: C.ink });
    meltText('McILWAINE', W / 2, 720, 1500 * (.6 + .4 * k), 230 * (.6 + .4 * k), C.or, { bulge: .45, melt: .3 + dissolve, t: t + .7, outline: C.ink });
    // the light show floods in from the edges as it dissolves
    if (dissolve > 0) { s.fillStyle = KEY; const r = dissolve * 1300; s.beginPath(); s.rect(0, 0, W, H); s.ellipse(W / 2, H / 2, Math.max(1, 1300 - r), Math.max(1, 800 - r * .62), 0, 0, TAU, true); s.fill('evenodd'); }
  }

  chapter('verse2', 77.6, 112.0, [
    [77.6, shotWall], [83.47, shotClub], [91.37, shotTuning], [96.4, shotSlide], [101.47, shotDoor], [108.97, shotName],
  ]);
})();
