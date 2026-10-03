// 71.0 - 91.0  "I'm an airplane on the highway / and I feel so strange / mnuh nuh nuh /
// I'm an airplane on the highway / and I'm sick of the passing lane"
// A stubby 1950s prop airliner stuck driving the highway on white-wall car tyres, wings too long for
// the lane. Drawn in the 1970s pinball-cartoon hand (style-pnc.js): fine outlines in a darker shade of
// each fill, airbrushed volume lit from the upper left, glossy balls, deco fans, brass and stars.
//   71.00 cruise   iris in; he rolls along a rainbow-arch highway, his long near wing boinging the
//                  roadside mileposts like pinball bumpers; a "no planes" sign goes by on "highway"
//   77.22 strange  closer; his eyes go uneasy, then on "strange" (78.38) a sunburst fan pops up, the
//                  world cycles colour on the beat, mileposts become bumpers, his eyes spiral;
//                  "mnuh nuh nuh" = three glossy bubbles on the beats 79.13 / 79.73 / 80.30
//   80.88 velvet   the passing lane is roped off with brass stanchions and velvet; rounded cars zoom
//                  past under his wing; eye roll on "sick" (86.6); a limo on "passing lane"; sigh; iris out
(() => {
  const PK = window.PNCK;
  const { soft, blob, tube, ball, fan, star, dark, light, mix } = PK;
  const FUS = '#f1e6c8', STRIPE = '#c8393f', TEAL = '#2f8f7f', WING = '#d9d5c9', GLASS = '#bfe3f2';
  const TYRE = '#2a2624', WALL = '#f6f1e4', CHROME = '#cfd5d6', NOSE = '#262120', BROW = '#3a2c26';
  const ROAD = '#8a8778', VERGE = '#7fb59a', PURPLE = '#9b6bb5', BLUE = '#5aa7c8';
  const RAINBOW = [ROSE_L, AMBER, CREAM, VERGE, SKY_B];
  const STRANGE = 78.38, LINE2 = 80.88, BUBBLES = [79.13, 79.73, 80.30];
  const rot = (a, n) => a.map((_, i) => a[((i + n) % a.length + a.length) % a.length]);
  const tri = (x, w) => clamp(1 - Math.abs(x) / w);
  const wrap = (x, m) => ((x % m) + m) % m;

  function rr(x, y, w, h, r, c, lw) {
    s.beginPath(); s.roundRect(x, y, w, h, r); soft(c, x, y, x + w, y + h); s.lineWidth = lw; s.strokeStyle = dark(c, .55); s.stroke();
  }
  function hills(y, x0, x1, R, seed, cols = RAINBOW, bounce = null) {
    for (let row = 0; row < 2; row++) {
      const rr0 = R * (row ? 1 : .72), step = rr0 * 1.55, off = hash(seed + row * 7) * step;
      let j = 0;
      for (let x = x0 - off; x < x1 + rr0; x += step, j++) {
        const cy = y + (row ? 0 : -R * .18), sy = bounce ? bounce(j + row * 3) : 1;
        withT(() => {
          s.translate(x, cy); s.scale(1, sy); s.translate(-x, -cy);
          for (let b = 0; b < cols.length; b++) {
            const r = rr0 * (1 - b * .17), c = cols[(b + row * 2) % cols.length];
            s.beginPath(); s.arc(x, cy, r, Math.PI, TAU); s.closePath(); soft(c, x - r, cy - r, x + r, cy);
            s.lineWidth = 1.2; s.strokeStyle = dark(c, .45); s.stroke();
          }
        });
      }
    }
  }
  function sky(top, bot, c0 = SKY_T, c1 = SKY_B) { s.fillStyle = vgrad(top, bot, [[0, c0], [1, c1]]); s.fillRect(-W, -H, W * 3, H * 3); }
  function clouds(t, n, y0, y1, speed, seed) {
    for (let i = 0; i < n; i++) { const x = wrap(i * 560 - t * speed + hash(seed + i) * 200, W + 900) - 400; cloud(x, y0 + hash(i * 11 + seed) * (y1 - y0), 48 + 36 * hash(i + 5 + seed), seed + i); }
  }

  // ---- the plane, local units (1 = 1 px at k = 1), origin on the road under his middle, facing +x ----
  // pass 'back' = far wing and far stabiliser; 'body' = fuselage, face, tyres; 'wing' = near wing,
  // engines and props (drawn last, over anything he overhangs).
  function tyre(cx, cy, r, ang, lw, sq = 0) {
    withT(() => {
      s.translate(cx, cy + r); s.scale(1 + sq * .5, 1 - sq); s.translate(-cx, -cy - r);
      ball(cx, cy, r, TYRE, lw);
      s.beginPath(); s.arc(cx, cy, r * .8, 0, TAU); s.arc(cx, cy, r * .58, 0, TAU, true); soft(WALL, cx - r, cy - r, cx + r, cy + r);
      s.lineWidth = lw * .7; s.strokeStyle = dark(WALL, .45); s.stroke();
      ball(cx, cy, r * .5, CHROME, lw);
      for (let i = 0; i < 5; i++) { const a = ang + i * TAU / 5; dot(cx + Math.cos(a) * r * .32, cy + Math.sin(a) * r * .32, r * .06, dark(CHROME, .5)); }
      ball(cx, cy, r * .16, STRIPE, lw * .7);
    });
  }
  function prop(cx, cy, R, spin, lw, far = false) {
    s.beginPath(); s.ellipse(cx, cy, R * .3, R, 0, 0, TAU); s.fillStyle = 'rgba(255,250,235,.22)'; s.fill();
    s.lineWidth = lw * .6; s.strokeStyle = 'rgba(60,50,45,.3)'; s.stroke();
    for (let g = 3; g >= 0; g--) {
      s.globalAlpha = g ? .16 : 1;
      for (let i = 0; i < 3; i++) {
        const a = spin - g * .22 + i * TAU / 3, tip = [cx + Math.sin(a) * R * .3, cy + Math.cos(a) * R];
        tube([cx, cy], [(cx + tip[0]) / 2, (cy + tip[1]) / 2], tip, R * .1, R * .06, far ? '#5a504a' : '#3a332e', lw * .7);
        if (!g) dot(tip[0], tip[1], R * .07, AMBER);
      }
    }
    s.globalAlpha = 1;
    ball(cx + R * .06, cy, R * .2, STRIPE, lw);
  }
  function nacelle(cx, cy, len, rad, lw) {
    blob([[cx + len * .5, cy], [cx + len * .35, cy - rad], [cx - len * .4, cy - rad * .7], [cx - len * .6, cy], [cx - len * .4, cy + rad * .7], [cx + len * .35, cy + rad]], FUS, lw);
    s.beginPath(); s.ellipse(cx + len * .36, cy, rad * .22, rad * .92, 0, 0, TAU); s.fillStyle = STRIPE; s.fill(); s.lineWidth = lw * .6; s.strokeStyle = dark(STRIPE, .5); s.stroke();
  }
  const FUSE = [[282, -168], [270, -232], [195, -272], [60, -278], [-110, -266], [-250, -246], [-340, -240], [-352, -214], [-300, -185], [-230, -135], [-110, -100], [60, -90], [200, -88], [268, -112]];
  const smoothPath = (pts) => { const n = pts.length, m = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; s.beginPath(); s.moveTo(...m(pts[n - 1], pts[0]));
    for (let i = 0; i < n; i++) { const q = m(pts[i], pts[(i + 1) % n]); s.quadraticCurveTo(pts[i][0], pts[i][1], q[0], q[1]); } s.closePath(); };
  const EYES = [[168, -228, 30, 38], [230, -224, 28, 36]];
  function eye(i, cx, cy, rx, ry, o, lw) {
    const { look = [.6, .1], lid = 0, wobble = 0, t = 0 } = o;
    const wb = 1 + wobble * .12 * Math.sin(t * 13 + i * 2);
    rx *= wb; ry *= 2 - wb;
    s.beginPath(); s.ellipse(cx, cy, rx, ry, 0, 0, TAU);
    const g = s.createRadialGradient(cx - rx * .3, cy - ry * .35, 2, cx, cy, ry); g.addColorStop(0, '#ffffff'); g.addColorStop(.75, '#f7f4ec'); g.addColorStop(1, '#d9d6cc');
    s.fillStyle = g; s.fill(); s.lineWidth = lw * 1.2; s.strokeStyle = '#3d4a50'; s.stroke();
    withT(() => {
      s.beginPath(); s.ellipse(cx, cy, rx, ry, 0, 0, TAU); s.clip();
      const sp = wobble > .5 ? (wobble - .5) * 2 : 0, orbit = Math.min(1, wobble * 2);
      let dx = look[0] * (1 - orbit) + Math.cos(t * 9 * (i ? -1 : 1) + i) * orbit * .6, dy = look[1] * (1 - orbit) + Math.sin(t * 9 * (i ? -1 : 1) + i) * orbit * .6;
      const px = cx + dx * rx * .45, py = cy + dy * ry * .5;
      if (sp < 1) { s.globalAlpha = 1 - sp; ball(px, py, 14, '#1d1816', lw * .6); s.globalAlpha = 1; }
      if (sp > 0) { // dizzy spiral
        s.globalAlpha = sp; s.beginPath();
        for (let a = 0; a < TAU * 2.6; a += .2) { const r = a * 2.1, aa = a + t * 14 * (i ? -1 : 1); s[a ? 'lineTo' : 'moveTo'](cx + Math.cos(aa) * r, cy + Math.sin(aa) * r * ry / rx); }
        s.lineWidth = 4.5; s.strokeStyle = '#1d1816'; s.lineCap = 'round'; s.stroke(); s.globalAlpha = 1;
      }
      if (lid > 0) { // upper lid in the fuselage cream
        const ly = cy - ry + lid * ry * 2.1;
        s.beginPath(); s.moveTo(cx - rx - 4, cy - ry - 4); s.lineTo(cx + rx + 4, cy - ry - 4); s.lineTo(cx + rx + 4, ly - 4); s.quadraticCurveTo(cx, ly + 8, cx - rx - 4, ly - 4); s.closePath();
        soft(FUS, cx - rx, cy - ry, cx + rx, ly); s.lineWidth = lw * 1.4; s.strokeStyle = dark(FUS, .6); s.stroke();
      }
    });
  }
  function plane(x, y, k, o) {
    const { t, pass, open = 0, brow = [0, 0], bob = 0, sq = 0, hop = 0, roll = t * 14, spin = t * TAU * 2.1, pax = 0 } = o;
    withT(() => {
      s.translate(x, y + hop * k); s.scale(k, k);
      const lw = 1.5 / k;
      if (pass === 'back') {
        const lift = clamp(-hop / 120), sh = 1 - lift * .45;
        s.globalAlpha = .3 * (1 - lift * .6); s.fillStyle = '#2a2320';
        s.beginPath(); s.ellipse(-20, -hop + 4, 360 * sh, 30 * sh, 0, 0, TAU); s.fill(); s.globalAlpha = 1;
        withT(() => { s.translate(0, bob);
          const FW = [[50, -150], [-110, -380], [-150, -392], [-185, -382], [-80, -146]];
          blob(FW, dark(WING, .1), lw);
          withT(() => { smoothPath(FW); s.clip(); line([[-90, -362], [-200, -362]], TEAL, 40); });
          nacelle(-50, -296, 80, 15, lw); prop(-6, -296, 40, spin + 1, lw, true);
          blob([[-262, -232], [-322, -236], [-360, -300], [-336, -304]], dark(WING, .1), lw);
        });
        return;
      }
      if (pass === 'wing') {
        withT(() => { s.translate(0, bob);
          blob([[60, -115], [-100, 170], [-128, 186], [-182, 172], [-70, -108]], WING, lw);
          withT(() => { smoothPath([[60, -115], [-100, 170], [-128, 186], [-182, 172], [-70, -108]]); s.clip();
            line([[40, -112], [-110, 160]], 'rgba(255,252,240,.6)', 6);                       // leading-edge gloss
            line([[-118, 150], [-200, 150]], TEAL, 40); });                                       // teal wing tip
          for (const [f, R] of [[.3, 55], [.66, 50]]) {
            const lx = 60 + (-100 - 60) * f, ly = -115 + (170 + 115) * f;
            nacelle(lx - 10, ly, 92, 17, lw); prop(lx + 40, ly, R, spin + f * 3, lw);
          }
        });
        return;
      }
      // body: tail fin behind the fuselage
      withT(() => {
        s.translate(0, bob);
        blob([[-225, -240], [-295, -400], [-350, -405], [-358, -236]], TEAL, lw);
        star(-318, -330, 22, CREAM, lw);
        blob(FUSE, FUS, lw);
        withT(() => { smoothPath(FUSE); s.clip();
          s.beginPath(); s.moveTo(-370, -182); s.lineTo(120, -162); s.quadraticCurveTo(170, -152, 120, -140); s.lineTo(-370, -160); s.closePath(); soft(STRIPE, -370, -182, 170, -140);
          line([[-370, -151], [118, -131]], TEAL, 5);
          line([[-300, -244], [150, -264]], 'rgba(255,252,240,.55)', 9);                      // gloss along the back
          s.globalAlpha = .18; s.fillStyle = '#5a4630'; s.beginPath(); s.ellipse(0, -80, 360, 40, 0, 0, TAU); s.fill(); s.globalAlpha = 1; // belly shade
        });
        // cabin windows, a passenger in each
        for (let i = 0; i < 6; i++) {
          const wx = -250 + i * 58, wy = -202;
          withT(() => { s.beginPath(); s.arc(wx, wy, 16, 0, TAU); s.fillStyle = GLASS; s.fill(); s.clip();
            const jb = pax * Math.abs(Math.sin(t * 9 + i * 1.3)) * 8;
            ball(wx + 2, wy + 9 - jb, 9, i % 2 ? SKIN : mix(SKIN, '#7a5236', .4), lw * .6);
            if (i % 3 === 1) { s.fillStyle = HAT; s.fillRect(wx - 9, wy - 3 - jb, 22, 4); s.fillRect(wx - 4, wy - 10 - jb, 12, 8); } });
          s.beginPath(); s.arc(wx, wy, 16, 0, TAU); s.lineWidth = lw * 1.6; s.strokeStyle = dark(FUS, .55); s.stroke();
          s.globalAlpha = .7; s.beginPath(); s.ellipse(wx - 6, wy - 6, 5, 3, -.6, 0, TAU); s.fillStyle = '#fff'; s.fill(); s.globalAlpha = 1;
        }
        blob([[-250, -206], [-318, -208], [-372, -148], [-338, -144]], WING, lw);                 // near stabiliser
      });
      // tyres on the road (they do not bob), fenders on the body
      for (const tx of [120, -175]) tyre(tx, -52, 52, roll, lw, sq);
      withT(() => {
        s.translate(0, bob);
        for (const tx of [120, -175]) {
          s.beginPath(); s.arc(tx, -52, 70, Math.PI * 1.02, Math.PI * 1.98); s.arc(tx, -52, 56, Math.PI * 1.98, Math.PI * 1.02, true); s.closePath();
          soft(FUS, tx - 70, -122, tx + 70, -52); s.lineWidth = lw; s.strokeStyle = dark(FUS, .55); s.stroke();
          line([[tx - 60, -100], [tx + 30, -118]], 'rgba(255,252,240,.6)', 4);
        }
        // windscreen frame, then the eyes in it
        blob([[128, -270], [266, -262], [272, -192], [132, -186]], '#2c5566', lw);
        EYES.forEach(([ex, ey, rx, ry], i) => eye(i, ex, ey, rx, ry, o, lw));
        // brows: raise lifts both, tilt > 0 = cross (inner ends down), < 0 = worried
        const [raise, tilt] = brow;
        EYES.forEach(([ex, ey, rx, ry], i) => {
          const inner = i ? -1 : 1, by = ey - ry - 13 - raise * 14;
          const a = [ex - 26, by + (inner < 0 ? tilt * 12 : -tilt * 4)], b = [ex + 26, by + (inner > 0 ? tilt * 12 : -tilt * 4)];
          tube(a, [(a[0] + b[0]) / 2, Math.min(a[1], b[1]) - 7], b, 6, 4, BROW, lw * .7);
        });
        // the mouth under the nose, opened by the vocal
        const L = [196, -132], R = [274, -130], up = [235, -118], dn = [235, -118 + 95 * open];
        if (open < .05) {
          s.beginPath(); s.moveTo(...L); s.quadraticCurveTo(...up, ...R); s.lineWidth = lw * 2.6; s.strokeStyle = dark(FUS, .7); s.lineCap = 'round'; s.stroke();
        } else {
          const mp = () => { s.beginPath(); s.moveTo(...L); s.quadraticCurveTo(...up, ...R); s.quadraticCurveTo(...dn, ...L); s.closePath(); };
          mp(); s.fillStyle = '#5b1d24'; s.fill();
          withT(() => { mp(); s.clip();
            s.beginPath(); s.ellipse(240, (-125 + dn[1]) / 2 + 22 * open, 26, 12 + 6 * open, 0, 0, TAU); s.fillStyle = '#d9707c'; s.fill();
            s.beginPath(); s.moveTo(...L); s.quadraticCurveTo(...up, ...R); s.lineWidth = 15; s.strokeStyle = '#fbf8f0'; s.stroke(); });
          mp(); s.lineWidth = lw * 1.8; s.strokeStyle = dark(FUS, .7); s.stroke();
        }
        for (const c of [L, R]) { s.beginPath(); s.arc(c[0], c[1], 7, -.9, .9); s.lineWidth = lw; s.strokeStyle = dark(FUS, .55); s.stroke(); }
        ball(290, -165, 30, NOSE, lw);                                                           // the black ball nose
      });
    });
  }
  // the plane's state from the song: mouth, bob on the beat, blinks
  function base(t) {
    const b = beatPulse(t, 7), blink = Math.max(...[72.4, 74.0, 76.1, 82.1, 84.9, 88.6].map((bt) => tri(t - bt, .09)));
    return { t, open: clamp((F('voc', t, 1) - .08) / .42), bob: b * 9 + Math.sin(t * 7) * 1.5, sq: b * .07, lid: blink, roll: t * 14 };
  }
  const screenOf = (px, py, k, lx, ly) => [px + lx * k, py + ly * k];

  // ---- roadside ----
  function milepost(x, y, h, n, ang = 0) {
    const w = h * .26;
    withT(() => { s.translate(x, y); s.rotate(ang); s.translate(-x, -y);
      rr(x - w / 2, y - h, w, h + 2, w * .3, '#f1ede0', 1.2);
      ball(x, y - h - w * .1, w * .42, '#3a332e', 1.2);
      rr(x - w * .42, y - h * .82, w * .84, h * .32, w * .14, '#2f6f4a', 1.2);
      star(x, y - h * .35, w * .16, AMBER, 1);
      text(String(n), x, y - h * .56, h * .26, { font: 'sign', color: CREAM, max: w * .84 * .82 });
    });
  }
  function noPlanes(x, y, h, ang = 0) { // a round deco road sign: a little plane, struck out
    const r = h * .3, cy = y - h + r;
    withT(() => { s.translate(x, y); s.rotate(ang); s.translate(-x, -y);
      tube([x, y], [x, y - h * .5], [x, cy], 7, 7, CHROME, 1);
      s.beginPath(); s.arc(x, cy, r, 0, TAU); soft('#f6f1e4', x - r, cy - r, x + r, cy + r); s.lineWidth = r * .18; s.strokeStyle = STRIPE; s.stroke();
      withT(() => { s.translate(x, cy); s.scale(r / 70, r / 70);
        blob([[44, -4], [30, -16], [-36, -12], [-50, -26], [-58, -24], [-52, 2], [30, 10]], '#3a332e', 1);
        blob([[8, -4], [-14, 30], [-24, 30], [-12, -4]], '#3a332e', 1); });
      line([[x - r * .68, cy - r * .68], [x + r * .68, cy + r * .68]], STRIPE, r * .16);
      ball(x, y - h - r * .08, r * .14, BRASS, 1);
    });
  }
  function bumper(x, y, sc, flash, col) { // a pinball pop bumper
    withT(() => { s.translate(x, y); s.scale(sc, sc);
      s.beginPath(); s.ellipse(0, -10, 58, 18, 0, 0, TAU); soft(CREAM, -58, -28, 58, 8); s.lineWidth = 1.3; s.strokeStyle = dark(CREAM, .5); s.stroke();
      rr(-36, -70, 72, 60, 10, TEAL, 1.3);
      for (let i = 0; i < 3; i++) dot(-22 + i * 22, -40, 5, flash > .3 ? '#fff6c8' : AMBER);
      s.beginPath(); s.ellipse(0, -72, 64, 20, 0, 0, TAU); soft(mix(col, '#fff6d8', flash * .6), -64, -92, 64, -52); s.lineWidth = 1.3; s.strokeStyle = dark(col, .5); s.stroke();
      ball(0, -96, 40, mix(col, '#fff6d8', flash * .7), 1.3);
      if (flash > .05) { s.globalAlpha = flash; star(0, -150, 22 + flash * 20, '#fff6c8', 1); s.globalAlpha = 1; }
    });
  }
  function ding(x, y, a) { if (a <= .02) return; s.globalAlpha = a; for (let i = 0; i < 5; i++) { const an = i / 5 * TAU - Math.PI / 2, r = 30 + (1 - a) * 50; star(x + Math.cos(an) * r, y + Math.sin(an) * r, 9 + a * 6, i % 2 ? AMBER : '#fff6c8', 1); } s.globalAlpha = 1; }

  // ---- world A: the deco highway, side on from a little above ----
  const PXA = 900, PYA = 862, KA = 1.15, VP = 800;
  const postX = (n, t) => n * 520 + 2200 - (t - 71) * VP;
  const WING_X = PXA - 140 * KA;                     // where the near wing tip sweeps the verge
  function worldA(t, strange) {
    const bi = lastBeat(t), sb = strange ? Math.max(0, bi - lastBeat(STRANGE) + 1) : 0;
    const pop = strange ? ease.back(inv(STRANGE, STRANGE + .35, t)) : 0;
    const SKIES = [[SKY_T, SKY_B], ['#7a4fa0', '#f2b8c6'], ['#2f8f7f', '#f8d58a'], ['#c8455a', '#f6d7a8']];
    const [c0, c1] = strange ? SKIES[sb % SKIES.length] : SKIES[0];
    sky(0, 705, c0, c1);
    if (pop > 0) fan(PXA - 40, 705, 1000 * pop, 14, Math.PI, TAU, rot([ROSE, AMBER, CREAM, TEAL, SKY_B, PURPLE], sb), 1.2);
    if (strange) for (let j = Math.max(0, bi - 2); j <= bi; j++) { const bt = FEAT.beats[j]; if (bt < STRANGE - .02) continue;
      for (let q = 0; q < 4; q++) { const a = hit(t, bt, 3); star(380 + hash(j * 13 + q) * 1300, 260 + hash(j * 7 + q * 3) * 360, 14 + 22 * a, q % 2 ? '#fff6c8' : AMBER, 1); } }
    clouds(t, 5, 110, 330, 15, 300);
    withT(() => { s.translate(-wrap((t - 71) * 40, 1000), 0);
      hills(705, -400, W + 1400, 175, 41, strange ? rot(RAINBOW, sb) : RAINBOW,
        strange ? (j) => 1 + .22 * hit(t, FEAT.beats[bi], 6) * (j % 2 ? 1 : -.6) : null); });
    // the road: two lanes, his is the near one
    s.beginPath(); s.rect(-W, 700, W * 3, 215); soft(ROAD, 0, 700, 0, 915);
    line([[-W, 710], [W * 2, 710]], CREAM, 5); line([[-W, 903], [W * 2, 903]], CREAM, 5);
    withT(() => { s.setLineDash([70, 60]); s.lineDashOffset = (t - 71) * 750; line([[-W, 802], [W * 2, 802]], CREAM, 6, 'butt'); });
    // deco curb and verge
    s.beginPath(); s.rect(-W, 915, W * 3, 400); soft(VERGE, 0, 915, 0, 1200);
    for (let i = -2; i < 20; i++) { const x = i * 120 - wrap((t - 71) * VP, 240); rr(x, 909, 120, 22, 4, i % 2 ? ROSE : CREAM, 1); }
  }
  // verge things the near wing sweeps: posts (or bumpers, once strange), drawn between body and wing
  function vergeA(t, strange) {
    const pop = strange ? ease.back(inv(STRANGE, STRANGE + .35, t)) : 0;
    for (let n = Math.floor(((t - 71) * VP - 2400) / 520); n <= Math.ceil(((t - 71) * VP) / 520); n++) {
      const x = postX(n, t); if (x < -200 || x > W + 200) continue;
      const tc = 71 + (n * 520 + 2200 - WING_X) / VP, dt = t - tc;
      const ang = dt > 0 ? -.5 * Math.exp(-4.5 * dt) * Math.sin(dt * 17) : 0;
      if (pop > 0 && n !== 4) bumper(x, 1000, .9 * pop, hit(t, tc, 5) + .6 * beatPulse(t, 9), [ROSE, AMBER, BLUE, PURPLE][wrap(n, 4)]);
      else if (n === 4) noPlanes(x, 1050, 230, ang);
      else milepost(x, 1050, 170, 60 + n, ang);
      if (dt > 0) ding(x, 1050 - 190, hit(t, tc, 4));
    }
  }
  function planeA(t, strange) {
    const st = base(t);
    let look = [.7, .15], brow = [0, 0], wobble = 0, hop = 0, pax = 0, lid = st.lid;
    const sx = postX(4, t);                                          // the no-planes sign: he looks down at it
    const g = tri(t - 74.95, .9);
    if (g > 0) { look = [lerp(.7, clamp((sx - (PXA + 200 * KA)) / 400, -1, 1), g), lerp(.15, .95, g)]; brow = [.6 * g, 0]; }
    const hitS = hit(t, 71 + (4 * 520 + 2200 - WING_X) / VP, 3);    // ...and winces when his wing smacks it
    if (hitS > .05) { brow = [1 * hitS, 0]; lid = Math.max(lid, .25 * hitS); }
    if (t >= 77.22) { const u = smooth(inv(77.22, 77.9, t)); look = [lerp(.7, -.5, u), lerp(.15, -.7, u)]; brow = [.5 * u, -1 * u]; lid = Math.max(lid, .12 * u); }
    if (strange) {
      wobble = smooth(inv(STRANGE, STRANGE + .25, t)) * (1 - smooth(inv(80.45, 80.85, t)));
      const bt = FEAT.beats[lastBeat(t)], nb = FEAT.beats[lastBeat(t) + 1] || bt + .567, p = clamp((t - bt) / (nb - bt));
      const first = t < FEAT.beats[lastBeat(STRANGE) + 1];
      hop = -(first ? 0 : 24) * Math.sin(Math.PI * p) - 70 * Math.sin(Math.PI * clamp((t - STRANGE) / .5));
      brow = [1, 0]; pax = 1;
    }
    let open = st.open;
    if (t > 78.9 && t < 80.85) open = Math.max(st.open * .35, ...BUBBLES.map((bt) => hit(t, bt, 9) * (t >= bt ? .45 : 0)));
    return { ...st, look, brow, wobble, hop: hop / KA, pax, lid, open };
  }
  function bubbles(t) {
    BUBBLES.forEach((bt, i) => {
      const u = (t - bt) / 1.45; if (u < 0 || u > 1.15) return;
      const st = planeA(t, true), [mx, my] = screenOf(PXA, PYA, KA, 240, -112 + st.bob + st.hop);
      const x = mx + 150 + u * (150 + i * 50), y = my - 5 - Math.pow(u, 1.3) * (300 + i * 70) - Math.sin(u * 7) * 10;
      if (u > 1) { const a = 1 - (u - 1) / .15; s.globalAlpha = clamp(a); for (let q = 0; q < 8; q++) { const an = q / 8 * TAU; line([[x + Math.cos(an) * 40, y + Math.sin(an) * 40], [x + Math.cos(an) * 60, y + Math.sin(an) * 60]], '#fff6e0', 4); } s.globalAlpha = 1; return; }
      const r = 12 + (32 + i * 8) * ease.back(clamp(u * 3.2));
      s.globalAlpha = .88; ball(x, y, r, ['#f4b6c0', '#f8d58a', '#bfe3f2'][i], 1.4); s.globalAlpha = 1;
      s.beginPath(); s.arc(x, y, r * .72, .3, 1.2); s.lineWidth = 2.5; s.strokeStyle = 'rgba(255,255,255,.8)'; s.stroke();
    });
  }
  function drawPlaneAll(px, py, k, st, between) { plane(px, py, k, { ...st, pass: 'back' }); plane(px, py, k, { ...st, pass: 'body' }); between(); plane(px, py, k, { ...st, pass: 'wing' }); }
  function iris(cx, cy, r) {
    if (r > 2400) return;
    s.beginPath(); s.rect(-50, -50, W + 100, H + 100); s.arc(cx, cy, Math.max(0, r), 0, TAU, true); s.fillStyle = '#14100e'; s.fill('evenodd');
    if (r > 1) { s.beginPath(); s.arc(cx, cy, r, 0, TAU); s.lineWidth = 16; s.strokeStyle = BRASS; s.stroke(); s.lineWidth = 2; s.strokeStyle = dark(BRASS, .5); s.beginPath(); s.arc(cx, cy, r + 8, 0, TAU); s.stroke(); }
  }

  // 71.00 cruise: wide on the highway; iris in on him
  function cruise(t) {
    worldA(t, false);
    const st = planeA(t, false);
    drawPlaneAll(PXA, PYA, KA, st, () => vergeA(t, false));
    const e = screenOf(PXA, PYA, KA, 200, -226);
    iris(e[0], e[1], lerp(30, 2500, ease.inOut(inv(71.0, 71.7, t))));
  }
  // 77.22 strange: closer. Uneasy, then the world goes pinball on "strange"; three bubbles
  function strange(t) {
    const z = 1.55, cx = 1010, cy = 640, on = t >= STRANGE;
    withT(() => { s.translate(W / 2, H / 2); s.scale(z, z); s.translate(-cx, -cy);
      worldA(t, on);
      const st = planeA(t, on);
      drawPlaneAll(PXA, PYA, KA, st, () => vergeA(t, on));
      bubbles(t);
    });
    fx({ flash: on ? .35 * hit(t, STRANGE, 10) : 0 });
  }

  // ---- world B: the velvet-rope passing lane ----
  const PXB = 860, PYB = 720, KB = 1.05, VB = 800;
  const CARS = [[81.15, 1500, ROSE], [82.3, 1550, BLUE], [83.45, 1450, AMBER], [84.55, 1600, VERGE], [85.7, 1500, PURPLE], [86.62, 1250, '#2b2b33', true], [88.35, 1650, TEAL]];
  const carX = (c, t) => -500 + (t - c[0]) * c[1];
  function car(x, y, sc, col, t, limo = false) {
    withT(() => { s.translate(x, y); s.scale(sc, sc); s.rotate(-.035);
      const lw = 1.4 / sc, stretch = limo ? 1.55 : 1, X = (v) => v < 0 ? v * stretch : v;
      for (let i = 0; i < 4; i++) { s.globalAlpha = .45; line([[X(-170) - 30 - i * 14, -40 - i * 22], [X(-170) - 190 - i * 30, -40 - i * 22]], '#fff8ec', 5); } s.globalAlpha = 1;
      const body = [[150, -40], [140, -80], [70, -90], [35, -132], [X(-50), -137], [X(-85), -94], [X(-150), -86], [X(-170), -78], [X(-162), -40], [X(-140), -22], [140, -22]];
      blob(body, col, lw);
      blob([[28, -124], [X(-44), -128], [X(-74), -94], [54, -92]], GLASS, lw);
      if (limo) for (const wx of [-60, -130, -200]) line([[wx, -128], [wx - 6, -94]], dark(col, .2), 6);
      ball(-12, -104, 14, SKIN, lw); s.fillStyle = '#1d1816'; s.fillRect(-6, -110, 22, 6);                        // driver in sunglasses
      if (limo) { s.fillStyle = HAT; s.fillRect(-26, -122, 30, 5); s.fillRect(-20, -134, 18, 13); }
      line([[X(-150), -62], [132, -64]], 'rgba(255,252,240,.75)', 5);                                       // chrome strip
      ball(140, -62, 11, '#fff3c4', lw); ball(X(-164), -66, 8, STRIPE, lw);
      tube([150, -40], [158, -32], [150, -24], 6, 6, CHROME, lw * .6);
      tyre(92, -26, 27, t * 30, lw); tyre(X(-100), -26, 27, t * 30, lw);
    });
  }
  function stanchion(x, y, h) {
    s.beginPath(); s.ellipse(x, y, 22, 7, 0, 0, TAU); soft(BRASS, x - 22, y - 7, x + 22, y + 7); s.lineWidth = 1.2; s.strokeStyle = dark(BRASS, .5); s.stroke();
    tube([x, y], [x, y - h / 2], [x, y - h], 5, 5, BRASS, 1.2);
    ball(x, y - h - 8, 12, BRASS, 1.2);
  }
  function velvet(t) {
    const sp = 270, off = wrap((t - 71) * VB, sp), h = 105, y = 800;
    const xs = []; for (let x = -sp - off; x < W + sp * 2; x += sp) xs.push(x);
    for (let i = 0; i < xs.length - 1; i++) {
      const a = [xs[i], y - h + 2], b = [xs[i + 1], y - h + 2], c = [(a[0] + b[0]) / 2, y - h + 62];
      s.lineCap = 'round'; s.beginPath(); s.moveTo(...a); s.quadraticCurveTo(...c, ...b);
      s.lineWidth = 15; s.strokeStyle = '#5e1424'; s.stroke(); s.lineWidth = 11; s.strokeStyle = '#a3243a'; s.stroke();
      s.beginPath(); s.moveTo(a[0], a[1] - 3); s.quadraticCurveTo(c[0], c[1] - 3, b[0], b[1] - 3); s.lineWidth = 3; s.strokeStyle = 'rgba(255,170,180,.6)'; s.stroke();
    }
    for (const x of xs) stanchion(x, y, h);
  }
  function signBoard(x, foot) { // PASSING LANE / MEMBERS ONLY, a brass deco board on two posts
    const w = 460, h = 190, top = 120;
    for (const dx of [-150, 150]) tube([x + dx, foot], [x + dx, (foot + top + h) / 2], [x + dx, top + h], 7, 7, BRASS, 1.2);
    fan(x, top, 120, 9, Math.PI, TAU, [BRASS, AMBER, CREAM], 1);
    rr(x - w / 2 - 14, top - 10, w + 28, h + 20, 12, BRASS, 1.4);
    rr(x - w / 2, top, w, h, 8, CREAM, 1.2);
    text('PASSING LANE', x, top + 88, 66, { font: 'sign', color: '#23505f', max: w * .86 });
    s.fillStyle = BRASS; s.fillRect(x - w * .36, top + 108, w * .72, 4);
    text('MEMBERS ONLY', x, top + 158, 40, { font: 'sign', color: STRIPE, max: w * .7, spacing: 4 });
    for (const sx of [x - w / 2 + 26, x + w / 2 - 26]) star(sx, top + 30, 12, AMBER, 1);
  }
  function worldB(t) {
    sky(0, 610);
    clouds(t, 5, 90, 300, 15, 700);
    signBoard(1700 - (t - LINE2) * 260, 608);
    withT(() => { s.translate(-wrap((t - 71) * 40, 1000), 0); hills(608, -400, W + 1400, 135, 57); });
    s.beginPath(); s.rect(-W, 604, W * 3, 400); soft(ROAD, 0, 604, 0, 1000);
    line([[-W, 614], [W * 2, 614]], CREAM, 5);
    s.beginPath(); s.rect(-W, 806, W * 3, 178); soft('#b3323f', 0, 806, 0, 984);                       // the passing lane: red carpet
    line([[-W, 812], [W * 2, 812]], AMBER, 4); line([[-W, 978], [W * 2, 978]], AMBER, 4);
    for (let i = -2; i < 22; i++) { const x = i * 120 - wrap((t - 71) * VB, 240); rr(x, 984, 120, 22, 4, i % 2 ? ROSE : CREAM, 1); }
    s.beginPath(); s.rect(-W, 1004, W * 3, 300); soft(VERGE, 0, 1004, 0, 1200);
  }
  function planeB(t) {
    const st = base(t);
    let look = [.6, .2], brow = [0, 0], lid = st.lid;
    // follow whichever car is passing
    let best = null; for (const c of CARS) { const x = carX(c, t); if (x > -300 && x < W + 200 && (!best || Math.abs(x - 1000) < Math.abs(best - 1000))) best = x; }
    if (best !== null) { look = [clamp((best - 1050) / 450, -1, 1), .85]; brow = [.3, .4]; }
    // "sick": the eye roll, then a glare at the limo
    const u = inv(86.5, 87.3, t);
    if (u > 0 && u < 1) { const th = lerp(-.25, Math.PI + .3, ease.inOut(u)); look = [Math.cos(th), -Math.sin(th) * 1.1]; lid = Math.max(lid, .42); brow = [.9, -.3]; }
    if (t >= 87.3 && t < 89.2) { const lx = carX(CARS[5], t); look = [clamp((lx - 1050) / 450, -1, 1), .8]; lid = Math.max(lid, .35); brow = [0, 1]; }
    if (t >= 89.2) { const v = smooth(inv(89.2, 89.8, t)); look = [lerp(.3, .5, v), .5]; lid = Math.max(lid, .55 * v); brow = [-.2 * v, -.4 * v]; }
    return { ...st, look, brow, lid };
  }
  // 80.88 velvet: the roped-off passing lane; cars zoom past under his wing
  function passing(t) {
    const z = kf(t, [[LINE2, 1], [86.4, 1.28]], ease.inOut), cx = kf(t, [[LINE2, W / 2], [86.4, 1000]], ease.inOut), cy = kf(t, [[LINE2, H / 2], [86.4, 640]], ease.inOut);
    const st = planeB(t);
    withT(() => { s.translate(W / 2, H / 2); s.scale(z, z); s.translate(-cx, -cy);
      worldB(t);
      drawPlaneAll(PXB, PYB, KB, st, () => {
        velvet(t);
        for (const c of CARS) { const x = carX(c, t); if (x > -600 && x < W + 600) car(x, 940, c[3] ? 1 : .92, c[2], t, c[3]); }
      });
      for (let q = 0; q < 3; q++) { const u = (t - 89.25 - q * .18) / 1.1; if (u < 0 || u >= 1) continue;                  // the sigh
        const [mx, my] = screenOf(PXB, PYB, KB, 300, -112); s.globalAlpha = (1 - u) * .9; cloud(mx + 30 + u * 160 + q * 10, my + 20 - u * 110 - q * 18, 14 + u * 22, 991 + q); s.globalAlpha = 1; }
    });
    const e = screenOf(PXB, PYB, KB, 200, -226), ex = (e[0] - cx) * z + W / 2, ey = (e[1] - cy) * z + H / 2;
    iris(ex, ey, lerp(2500, 0, ease.inOut(inv(90.0, 90.95, t))));
  }

  chapter('airplane', 71.0, 91.0, [[71.0, cruise], [77.22, strange], [LINE2, passing]]);
})();
