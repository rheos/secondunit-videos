// js/ch/c1.js · NIGHT WALK (0.000 - 25.833) · instrumental intro · look: ink (scratchboard)
// One location: moonlit dunes under a full moon whose smoke gathers into a rattlesnake's face (his
// board #18), The Wyrd One walking away from us toward it with his wolfdog (#19). The etch turns
// the painting into white lines scraped out of black, so every shot keeps real mid-tones: a hatched
// moon halo, lit dune flanks, a pale moon. Ends with the moon's smoke pouring down to fill the frame.
(() => {
  const A = 0, Z = 25.833;
  const BAR = (k) => BT(1 + 2 * k); // bars from 1.09: 1 = 2.69, 2 = 4.32, 3 = 5.92 ... 8 = 14.10 (the kick), 10 = 17.25, 11 = 18.86
  const tKick = BAR(8), tGust = BAR(10), tMet2 = BAR(12) + .8;

  const NK = { sky0: '#030409', sky1: '#0a0f1c', sky2: '#1b2336', halo: '#5b6479', halo2: '#2b3446', moon: '#a8a597', moonDk: '#78766c',
    litFar: '#7f889a', shdFar: '#4f5768', lit: '#68738a', shd: '#232937', sil: '#07080b', smoke: '226,231,242' };
  const INK = { ...LOOK.ink, etch: .82, con: 1.12, bloom: 1.0 };

  // ---------- private helpers ----------
  const hexMix = (a, b, k) => '#' + [1, 3, 5].map((i) => Math.round(lerp(parseInt(a.slice(i, i + 2), 16), parseInt(b.slice(i, i + 2), 16), k)).toString(16).padStart(2, '0')).join('');
  function fillPts(pts, style) { s.fillStyle = style; s.beginPath(); pts.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y)); s.closePath(); s.fill(); }
  // the night sky, with a hatched halo of moonlight around (mx, my)
  function night(HZ, mx, my, mr, haloK = 1) {
    sky(NK.sky0, NK.sky1, NK.sky2, HZ + 200);
    if (haloK <= .01) return;
    s.save(); s.globalAlpha = clamp(haloK);
    s.fillStyle = rgrad(s, mx, my, mr * .8, mr * 3.8, [[0, NK.halo], [.3, NK.halo2], [1, 'rgba(27,35,54,0)']]); s.fillRect(mx - mr * 4, my - mr * 4, mr * 8, mr * 8);
    s.restore();
  }
  // a rotating star field; stars scratch in on their bar (reveal times), with a small flare as each appears
  const TIMES = [.28, .67, 1.09, 1.9, 2.69, 3.51, 4.32];
  function starfield(t, a = 1, rot = 0, pole = [SC + 600, -400], n = 520, seed = 11) {
    const r = rng(seed), c = Math.cos(rot), sn = Math.sin(rot);
    for (let i = 0; i < n; i++) {
      let x = lerp(-900, 2820, r()), y = lerp(-1100, 1400, r()); const sz = .7 + Math.pow(r(), 3) * 3.2, ta = TIMES[2 + Math.floor(r() * 5)] + r() * .5, tw = .6 + .4 * Math.sin(t * (1 + r() * 3) + i);
      const k = a * ease.out(inv(ta, ta + .18, t)); if (k <= .01) continue;
      const dx = x - pole[0], dy = y - pole[1]; x = pole[0] + dx * c - dy * sn; y = pole[1] + dx * sn + dy * c;
      dot(f, x, y, sz, `rgba(250,248,240,${k * tw})`);
      const fl = hit(t, ta, 7) * a; if (fl > .05 && sz > 1.6) { stroke(f, [[x - sz * 5, y], [x + sz * 5, y]], `rgba(255,255,250,${fl * .8})`, 1.4); stroke(f, [[x, y - sz * 5], [x, y + sz * 5]], `rgba(255,255,250,${fl * .8})`, 1.4); }
    }
  }
  // the milky way: a faint diagonal band that the etch hatches, dusted with fine stars
  function milky(t, a, rot = 0, pole = [SC + 600, -400]) {
    if (a <= .01) return;
    const P0 = [-500, 1150], P1 = [2400, -600], c = Math.cos(rot), sn = Math.sin(rot);
    const R = ([x, y]) => [pole[0] + (x - pole[0]) * c - (y - pole[1]) * sn, pole[1] + (x - pole[0]) * sn + (y - pole[1]) * c];
    s.save(); s.globalAlpha = a; stroke(s, [R(P0), R(P1)], '#161e30', 620); stroke(s, [R([-450, 1110]), R([2350, -560])], '#232d44', 260); s.restore();
    const q = rng(77);
    for (let i = 0; i < 260; i++) { const u = q(), off = (q() + q() + q() - 1.5) * 260; const p = R([lerp(P0[0], P1[0], u) + off * .52, lerp(P0[1], P1[1], u) + off * .85]); dot(f, p[0], p[1], .6 + q() * 1.1, `rgba(235,238,250,${a * (.25 + .5 * q())})`); }
  }
  // a meteor scratched across the sky between p0 and p1, starting at t0
  function meteor(t, t0, p0, p1, dur = .45) {
    const k = inv(t0, t0 + dur, t); if (k <= 0 || t > t0 + dur + .5) return;
    const head = ease.out(k), tail = Math.max(0, head - .35), fade = 1 - inv(t0 + dur, t0 + dur + .5, t);
    const P = (u) => [lerp(p0[0], p1[0], u), lerp(p0[1], p1[1], u)];
    stroke(f, [P(tail), P(head)], `rgba(255,255,248,${.75 * fade})`, 3); dot(f, ...P(head), 4 * fade, `rgba(255,255,250,${fade})`);
  }
  // the moon: a pale mid-grey disc the etch hatches, a bright scraped limb, soft grey maria (kept loose
  // and off-centre so they never read as a face), only a thin halo of light
  function moon(x, y, r, k = 1) {
    dot(s, x, y, r * 1.02, '#d9d6c8'); dot(s, x, y, r * .97, NK.moon);
    for (const [ux, uy, ur] of [[-.32, -.18, .34], [.22, -.36, .2], [.3, .12, .28], [-.1, .42, .22], [-.5, .3, .14]]) {
      s.fillStyle = rgrad(s, x + ux * r, y + uy * r, 0, ur * r, [[0, 'rgba(120,118,108,.75)'], [1, 'rgba(120,118,108,0)']]); s.fillRect(x + (ux - ur) * r, y + (uy - ur) * r, ur * 2 * r, ur * 2 * r); }
    glow(x, y, r * 2.4, `rgba(190,205,240,${.06 * k})`);
    f.save(); f.globalCompositeOperation = 'lighter'; f.strokeStyle = `rgba(240,242,250,${.35 * k})`; f.lineWidth = Math.max(2, r * .012); f.beginPath(); f.arc(x, y, r * 1.01, 0, TAU); f.stroke(); f.restore();
  }
  // a dune: gentle windward rise from the left to a knife-edge peak, steep slip face to the right.
  // k = nearness 0..1 (far dunes are paler). Returns the crest polyline.
  function dune(px, py, wl, wr, k, o = {}) {
    const { rimA = .5, reveal = 1, lit = 1, ripples = k > .45, scroll = 0 } = o;
    const hl = wl * .2, hr = wr * .4, crest = [];
    for (let i = 0; i <= 14; i++) { const u = i / 14; crest.push([px - wl * (1 - u), py + hl * Math.pow(1 - u, 1.7)]); }
    for (let i = 1; i <= 10; i++) { const u = i / 10; crest.push([px + wr * u, py + hr * Math.pow(u, .8)]); }
    const body = new Path2D(); body.moveTo(px - wl - 2400, py + hl + 420); body.quadraticCurveTo(px - wl - 500, py + hl + 40, px - wl, py + hl); crest.forEach(([x, y]) => body.lineTo(x, y)); body.quadraticCurveTo(px + wr + 500, py + hr + 40, px + wr + 2400, py + hr + 500); body.lineTo(px + wr + 2400, py + 3200); body.lineTo(px - wl - 2400, py + 3200); body.closePath();
    s.fillStyle = mixHex(NK.shdFar, NK.shd, k); s.fill(body);
    const face = new Path2D(); face.moveTo(px - wl - 2400, py + hl + 420); face.quadraticCurveTo(px - wl - 500, py + hl + 40, px - wl, py + hl); for (let i = 0; i <= 14; i++) face.lineTo(...crest[i]);
    face.bezierCurveTo(px + wr * .12, py + hr * .5, px + wr * .22, py + hr + 200, px + wr * .12, py + hl + 1300); face.lineTo(px - wl - 2400, py + hl + 1300); face.closePath();
    const lc = hexMix(NK.shd, hexMix(NK.litFar, NK.lit, k), lit);
    s.fillStyle = vgrad(s, py, py + hl + 700, [[0, lc], [.5, hexMix(lc, NK.shd, .35)], [1, hexMix(lc, NK.shd, .7)]]); s.fill(face);
    s.save(); s.clip(body);
    if (ripples) { s.save(); s.clip(face); const n = 9, sp = 70 + 60 * k;
      for (let j = 0; j < n; j++) { const off = ((j + scroll) % n) * sp + 34, pts = [];
        for (let i = 0; i <= 18; i++) { const u = i / 18, x = px - wl * 1.4 + u * wl * 1.5; pts.push([x, py + hl * Math.pow(clamp(1 - (x - (px - wl)) / wl), 1.7) + off + Math.sin(u * 9 + j * 1.7) * 9 + off * .1 * (1 - u)]); }
        stroke(s, pts, mixHex(NK.shd, '#3a4356', .6), 5 + 5 * k); }
      s.restore(); }
    s.fillStyle = vgrad(s, py + hl * .4, py + hl + 1000, [[0, 'rgba(6,7,10,0)'], [1, 'rgba(6,7,10,.7)']]); s.fillRect(px - wl - 2400, py - 200, wl + wr + 4800, 3400);
    s.restore();
    if (o.occlude !== false) occlude(() => { f.fillStyle = '#000'; f.fill(body); });   // the ground blocks the light behind it
    const nr = Math.round(crest.length * reveal); if (nr > 1) stroke(f, crest.slice(0, nr), `rgba(225,232,255,${rimA})`, 2.5 + 3 * k);
    return crest;
  }
  const crestAt = (cr, x) => { for (let i = 1; i < cr.length; i++) if (cr[i][0] >= x) { const a = cr[i - 1], b = cr[i]; return lerp(a[1], b[1], inv(a[0], b[0], x)); } return cr[cr.length - 1][1]; };
  // Catmull-Rom resample for smooth smoke strands
  function spline(p, per = 6) {
    const o = []; for (let i = 0; i < p.length - 1; i++) { const p0 = p[Math.max(0, i - 1)], p1 = p[i], p2 = p[i + 1], p3 = p[Math.min(p.length - 1, i + 2)];
      for (let k = 0; k < per; k++) { const u = k / per, u2 = u * u, u3 = u2 * u; o.push([0, 1].map((d) => .5 * (2 * p1[d] + (-p0[d] + p2[d]) * u + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * u2 + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * u3))); } }
    o.push(p[p.length - 1]); return o;
  }
  // a smoke strand: a dark shading band on the underpainting with a bright core of light on top,
  // so the etch reads it as an engraved line
  function strand(pts, w, a, shade = .6, core = 1) {
    if (a <= .01 || pts.length < 2) return;
    if (shade > 0) { s.save(); s.globalAlpha = a * shade; stroke(s, pts, '#5d6272', w * 1.6); s.restore(); }
    f.save(); f.globalCompositeOperation = 'lighter';
    stroke(f, pts, `rgba(${NK.smoke},${a * .05})`, w * 3); stroke(f, pts, `rgba(${NK.smoke},${a * .14})`, w * 1.1); if (core > .01) stroke(f, pts, `rgba(${NK.smoke},${a * .45 * core})`, w * .35);
    f.restore();
  }
  // loose smoke: soft passes only, no crisp core, so the etch hatches it instead of outlining it
  function soft(pts, w, a) {
    if (a <= .01 || pts.length < 2) return;
    f.save(); f.globalCompositeOperation = 'lighter'; stroke(f, pts, `rgba(${NK.smoke},${a * .05})`, w * 3); stroke(f, pts, `rgba(${NK.smoke},${a * .1})`, w * 1.3); stroke(f, pts, `rgba(${NK.smoke},${a * .12})`, w * .6); f.restore();
  }
  // the rattlesnake's face in the moon, drawn in smoke. gather 0 = loose drifting smoke, 1 = the face.
  // Snout down, heavy brow ridges, the eyes on the sides of the head; eyes 0..1 opens the ember eyes.
  // The rattlesnake's face in the moon, built of SMOKE on the light layer: blurred overlapping masses and
  // drifting wisps, no contour lines. A wedge-shaped viper head from the front (broad jaw, narrow snout,
  // brow ridges over two slit eyes), heat-pit and eye hollows as thinner smoke, a coil of smoke body below.
  // gather 0 = loose drifting smoke, 1 = the face. eyes 0..1 opens the ember eyes.
  const HEAD = (() => { const h = [[0, -.72], [-.45, -.7], [-.82, -.56], [-1.0, -.26], [-.95, .05], [-.72, .36], [-.5, .6], [-.32, .8], [-.14, .9], [0, .92]];
    return [...h, ...h.slice(0, -1).reverse().map(([x, y]) => [-x, y])]; })();
  function snakeFace(t, cx, cy, R, gather, eyes = 0, a = 1, tongue = 1) {
    const g = clamp(gather), lo = Math.pow(1 - g, 1.3);
    const P = ([x, y], ci, j) => {
      const sp = 1 + lo * .9, ang = lo * 1.8 * (hash(ci * 7 + 3) - .5);
      const ux = x * sp, uy = y * sp, rx = ux * Math.cos(ang) - uy * Math.sin(ang), ry = ux * Math.sin(ang) + uy * Math.cos(ang);
      return [cx + (rx + lo * 1.2 * snoise(ci * 3.1 + j * .45 + t * .22, 91) + .025 * snoise(t * .5 + j + ci, 93)) * R, cy + (ry + lo * .8 * snoise(ci * 5.7 + j * .45 + t * .22, 92) + .025 * snoise(t * .5 + j + ci * 2, 94)) * R];
    };
    const T = f.getTransform(), dev = Math.hypot(T.a, T.b) * R, bl = (k) => Math.max(.6, dev * k * (1 + lo * 2.5));
    const C = (k) => `rgba(${NK.smoke},${clamp(k * a)})`, k = .25 + .75 * g;
    const shape = (ctx, pts) => { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); };
    const lit = (blur, fn) => { f.save(); f.globalCompositeOperation = 'lighter'; f.filter = `blur(${blur}px)`; fn(); f.restore(); };
    // the coil of smoke body, behind and below the head
    const coil = spline([[.15, .85], [.75, 1.15], [.85, 1.6], [.2, 1.85], [-.6, 1.75], [-.95, 1.35]].map((q, j) => P(q, 20, j)), 6);
    lit(bl(.1), () => { stroke(f, coil, C(.07 * k), R * .5); stroke(f, coil, C(.06 * k), R * .22); });
    // a soft shadow of denser smoke hugging the head on the underpainting, so the wedge separates by value
    s.save(); s.filter = `blur(${bl(.12)}px)`; s.globalAlpha = .7 * g * a; s.strokeStyle = '#33374300'.slice(0, 7); s.lineWidth = R * .26; s.lineJoin = 'round';
    shape(s, HEAD.map(([x, y], j) => P([x * 1.08, y * 1.06 + .02], 0, j))); s.stroke(); s.restore();
    // the head mass, in two layers for volume
    const head = HEAD.map((q, j) => P(q, 0, j));
    lit(bl(.09), () => { shape(f, head); f.fillStyle = C(.075 * k + .02); f.fill(); shape(f, HEAD.map(([x, y], j) => P([x * .72, y * .78 - .08], 0, j))); f.fillStyle = C(.025 * k); f.fill(); });
    // ridges catch more smoke: the brows, the snout bridge, the swell of the jaws
    lit(bl(.045), () => {
      for (const d of [-1, 1]) {
        stroke(f, spline([[-.12, -.4], [-.45, -.56], [-.8, -.52], [-.98, -.36]].map(([x, y], j) => P([x * d, y], 2 + d, j)), 4), C(.1 * k), R * .15);
        stroke(f, spline([[-.22, -.3], [-.2, .1], [-.13, .62]].map(([x, y], j) => P([x * d, y], 4 + d, j)), 4), C(.03 * k), R * .09);
        stroke(f, spline([[-.95, -.1], [-.8, .25], [-.55, .52]].map(([x, y], j) => P([x * d, y], 6 + d, j)), 4), C(.1 * k), R * .16);
      }
    });
    // hollows where the smoke thins: eye sockets, heat pits, nostrils, the parted mouth
    const hol = [[-.6, -.27, .24, .15, .7], [.6, -.27, .24, .15, .7], [-.47, .1, .09, .08, .75], [.47, .1, .09, .08, .75], [-.11, .66, .05, .045, .6], [.11, .66, .05, .045, .6], [0, .97, .2, .08, .5]];
    f.save(); f.globalCompositeOperation = 'destination-out'; f.filter = `blur(${bl(.035)}px)`;
    for (const [x, y, rx, ry, al] of hol) { const [px, py] = P([x, y], 8, 0); f.fillStyle = `rgba(0,0,0,${al * g})`; f.beginPath(); f.ellipse(px, py, rx * R, ry * R, 0, 0, TAU); f.fill(); }
    f.restore();
    s.save(); s.filter = `blur(${bl(.04)}px)`;
    for (const [x, y, rx, ry, al] of hol) { const [px, py] = P([x, y], 8, 0); s.fillStyle = `rgba(28,30,38,${al * g * a})`; s.beginPath(); s.ellipse(px, py, rx * R, ry * R, 0, 0, TAU); s.fill(); }
    s.restore();
    // fangs: two pale threads of smoke from the upper jaw
    if (g > .6) lit(bl(.012), () => { for (const d of [-1, 1]) taper(f, P([d * .2, .86], 9, 0), P([d * .16, 1.1], 9, 1), R * .035, R * .006, C(.35 * (g - .6) * 2.5)); });
    // smoke drifting over the head, flowing from the snout up and out over the brows
    lit(bl(.02), () => { for (let i = 0; i < 14; i++) { const u = (i + .5) / 14 * 2 - 1, pts = [];
      for (let j = 0; j <= 8; j++) { const q = j / 8, ph = ((t * .12 + hash(i * 3)) % 1); pts.push(P([u * (.25 + .7 * q) + .06 * snoise(t * .4 + i + q * 2, 96), .8 - 1.45 * q - .06 * Math.sin((q + ph) * 6)], 30 + i, j)); }
      stroke(f, spline(pts, 3), C(.035 + .03 * hash(i)), R * (.03 + .03 * hash(i * 7))); } });
    // wisps streaming off both sides of the head, curling out across the moon
    for (let i = 0; i < 22; i++) { const d = i % 2 ? 1 : -1, kk = i >> 1, pts = [];
      let [x, y] = P([d * (.8 + .2 * hash(i)), -.5 + (kk % 6) * .18], 40 + i, 0), ang = d > 0 ? -.35 - kk * .12 : Math.PI + .35 + kk * .12;
      for (let j = 0; j < 16; j++) { pts.push([x, y]); ang += d * (.08 + .06 * hash(i * 5)) + .2 * snoise(t * .35 + i * 1.3 + j * .15, 95); x += Math.cos(ang) * R * .15; y += Math.sin(ang) * R * .15; }
      soft(spline(pts, 3), R * (.05 + .04 * hash(i)), a * (.3 + .3 * hash(i * 3)) * (.5 + .5 * g)); }
    // the forked tongue flicks out on the beat once the face has formed
    const tk = tongue * clamp((g - .8) * 5), ph = beatPhase(t), fl = tk * (ph < .4 ? Math.sin(ph / .4 * Math.PI) : 0);
    if (fl > .02) { const b = P([0, .93], 0, 10), L = R * .75 * fl, sw = snoise(t * 3, 97) * R * .06, m = [b[0] + sw * .5, b[1] + L * .72];
      lit(bl(.01), () => { stroke(f, [b, m], C(.5), R * .035); stroke(f, [m, [m[0] - R * .12 + sw, m[1] + L * .3]], C(.45), R * .025); stroke(f, [m, [m[0] + R * .12 + sw, m[1] + L * .3]], C(.45), R * .025); }); }
    // the ember eyes open (a pair: this is the snake, not the man), vertical slit pupils
    if (eyes > .01) for (const d of [-1, 1]) { const [ex, ey] = P([d * .6, -.27], 8, 0);
      glow(ex, ey, R * .32 * eyes, `rgba(255,90,20,${.45 * eyes})`); glow(ex, ey, R * .1 * eyes, `rgba(255,150,60,${.65 * eyes})`);
      occlude(() => { f.fillStyle = '#000'; f.beginPath(); f.ellipse(ex, ey, R * .018, R * .08 * eyes, 0, 0, TAU); f.fill(); }); }
  }

  // The Wyrd One from behind, walking. He carries the guitar by the neck, hanging from one hand, drawn
  // as a silhouette since the cast rig draws no guitar in the back view. o.hand: 'L' (screen left from
  // behind, his left hand) or 'R'. Keep the hem streaming away from the guitar side so it stays readable.
  function walker(t, x, y, h, o = {}) {
    const ph = (t - B0) / BEAT + (o.ph || 0), sil = h < 170, g = o.g || s, wind = o.wind ?? .6, side = o.hand === 'R' ? 1 : -1;
    const J = wyrd(t, x, y, h, { view: sil ? 'sil' : 'back', guitar: 'none', arms: 'down', walk: ph, wind, lit: o.lit ?? .12, rim: o.rim === undefined ? 'rgba(225,232,255,.9)' : o.rim, g });
    // the carrying arm swings out from the coat so the guitar hangs clear of the hem
    const u = h / 100, sw = Math.sin(ph * TAU) * .05, gy = Math.abs(Math.sin(ph * TAU)) * -1.2 * u, sc = g === s ? '#110e0c' : '#000';
    const sh = [x + side * 9.5 * u, y - 79 * u + gy], el = [x + side * 14 * u, y - 62 * u + gy], hd = [x + side * 18.5 * u, y - 47 * u + gy];
    taper(g, sh, el, 3.3 * u, 2.7 * u, sc); taper(g, el, hd, 2.7 * u, 2.1 * u, sc); dot(g, hd[0], hd[1], 2.2 * u, sc);
    const ang = -Math.PI / 2 + side * (-.12 + sw);
    drawLesPaul(g, hd[0] - Math.cos(ang) * 29 * u, hd[1] - Math.sin(ang) * 29 * u, 10 * u, ang, true);
    return J;
  }
  // a scraped rim of moonlight around a silhouette: draw(g) paints the shape on any context; a copy
  // offset toward the light is added to the light layer, then the shape itself is blacked out on it
  // (which also hides stars and crest lines behind the body). offs: device-pixel offsets toward the light.
  let RC = null;
  function rimLight(draw, offs = [[-2.5, -2]], col = 'rgba(228,234,255,.9)', k = 1) {
    if (k > .01) {
      if (!RC) { const c = document.createElement('canvas'); c.width = SW; c.height = SH; RC = c.getContext('2d'); }
      RC.setTransform(1, 0, 0, 1, 0, 0); RC.globalCompositeOperation = 'source-over'; RC.globalAlpha = 1; RC.clearRect(0, 0, SW, SH);
      RC.setTransform(f.getTransform()); draw(RC);
      RC.setTransform(1, 0, 0, 1, 0, 0); RC.globalCompositeOperation = 'source-in'; RC.fillStyle = col; RC.fillRect(0, 0, SW, SH);
      f.save(); f.setTransform(1, 0, 0, 1, 0, 0); f.globalCompositeOperation = 'lighter'; f.globalAlpha = k;
      for (const [ox, oy] of offs) f.drawImage(RC.canvas, ox, oy);
      f.restore();
    }
    occlude(() => draw(f));
  }
  const walkerSil = (t, x, y, h, o = {}, offs, k = 1) => rimLight((g) => walker(t, x, y, h, { ...o, g, rim: null }), offs, undefined, k);
  function dog(t, x, y, sc, dir = 1, trot = 1, offs, k = 1) { const d = (g) => wolfdog(t, x, y, sc, { dir, walk: trot ? t * 2.3 : 0, sil: true, g }); d(s); if (offs !== false) rimLight(d, offs, undefined, k); }
  // sand blown off a crest by the wind (light layer)
  function spindrift(t, cr, a, dx = 1, seed = 3) {
    if (a <= .01) return;
    for (let i = 0; i < 70; i++) { const ph = (t * (.6 + hash(i + seed) * .5) + hash(i * 3 + seed)) % 1, p = at(cr, hash(i * 7 + seed));
      dot(f, p[0] + dx * ph * 260 + Math.sin(t * 3 + i) * 10, p[1] - ph * 60 + ph * ph * 50, 1.2 + 1.6 * (1 - ph), `rgba(230,235,250,${a * (1 - ph) * .6})`); }
  }

  // ---------- shots ----------
  // 1 · black; stars scratch in on the first bars, a meteor on 2.69; on 4.32 the dune crests are
  //     scraped in left to right and the moon's light begins to rise behind them. The camera cranes down.
  function scratch(t, lt, dur) {
    const HZ = 1170;
    frame(SC + kf(t, [[0, -60], [5.92, 30]]), kf(t, [[0, 300], [BAR(2), 560], [5.92, 900]], ease.inOut) + pick(0, kf(t, [[0, 0], [BAR(2), 250], [5.92, 60]])), pick(kf(t, [[0, 1.3], [5.92, 1.02]]), kf(t, [[0, 1.2], [5.92, .9]])));
    const halo = .75 * ease.out(inv(BAR(2), BAR(3) + .3, t)) + .25 * hit(t, 5.13, 1.5);
    night(HZ, SC + 120, 1420, 330, halo);
    milky(t, .9 * ease.inOut(inv(1.9, 3.8, t)));
    starfield(t, 1);
    for (const [t0, x, y] of [[.28, SC - 250, 330], [.67, SC + 230, 520]]) { const k = hit(t, t0, 2.2) * inv(t0 - .02, t0 + .03, t), sz = 7 + 10 * hit(t, t0, 5);
      if (k > .02) { dot(f, x, y, 3, `rgba(255,255,250,${k})`); stroke(f, [[x - sz * 3, y], [x + sz * 3, y]], `rgba(255,255,250,${k * .9})`, 2); stroke(f, [[x, y - sz * 3], [x, y + sz * 3]], `rgba(255,255,250,${k * .9})`, 2); } }
    meteor(t, BAR(1) - .05, [SC - 560, 140], [SC + 480, 470], .5);
    glow(SC + 120, 1260, 900, `rgba(190,205,240,${.12 * halo})`);
    const rv = (d) => ease.inOut(inv(BAR(2) - .05 + d, BAR(2) + 1.1 + d, t)), lit = ease.out(inv(BAR(2), BAR(3), t));
    dune(SC - 480, HZ - 10, 700, 420, .1, { reveal: rv(0), rimA: .6, lit: .4 + .6 * lit });
    dune(SC + 560, HZ + 20, 820, 520, .2, { reveal: rv(.25), rimA: .55, lit: .4 + .6 * lit });
    dune(SC - 60, HZ + 150, 950, 650, .55, { reveal: rv(.45), rimA: .45, lit: .3 + .7 * lit });
    dune(SC + 760, HZ + 260, 700, 560, .8, { reveal: rv(.6), rimA: .4, lit: .3 + .7 * lit });
  }

  // 2 · the full moon rises from behind the dunes; smoke begins to lift off it
  function rise(t, lt, dur) {
    const HZ = 1170, mx = SC + 120, my = kf(t, [[BAR(3), 1330], [BAR(4) + .4, 1000], [BAR(5) - .8, 930]], ease.out), R = 320;
    frame(SC + kf(lt, [[0, -30], [dur, 30]]), kf(lt, [[0, 930], [dur, 880]]), pick(kf(lt, [[0, 1.02], [dur, 1.1]]), kf(lt, [[0, .9], [dur, .97]])));
    night(HZ, mx, my, R, 1);
    milky(t, .9); starfield(t, 1);
    moon(mx, my, R, .6 + .4 * inv(BAR(3), BAR(4), t));
    snakeFace(t, mx, my - 10, R * .6, 0, 0, .55 * ease.inOut(inv(BAR(3) + .3, BAR(5), t)));
    dune(SC - 480, HZ - 10, 700, 420, .1, { rimA: .6 }); dune(SC + 560, HZ + 20, 820, 520, .2, { rimA: .55 });
    dune(SC - 60, HZ + 150, 950, 650, .55, { rimA: .45 }); dune(SC + 760, HZ + 260, 700, 560, .8, { rimA: .4 });
    dune(SC - 700, HZ + 420, 900, 800, 1, { rimA: .35 });
  }

  // 3 · the wolfdog alone on a near crest against the lower moon; smoke crosses the moon; it trots on 10.01
  function hound(t, lt, dur) {
    const mx = SC + 40, my = 930, R = 470, tGo = BT(12);
    frame(SC + kf(lt, [[0, -70], [dur, 60]]), kf(lt, [[0, 1020], [dur, 990]]), pick(kf(lt, [[0, 1.22], [dur, 1.3]]), kf(lt, [[0, 1.0], [dur, 1.06]])));
    night(1260, mx, my, R, 1); starfield(t, 1);
    moon(mx, my, R);
    snakeFace(t, mx, my - 20, R * .58, .12 * inv(BAR(5), BAR(6), t), 0, .75);
    dune(SC + 900, 1180, 900, 700, .25, { rimA: .5 });
    const cr = dune(SC + 60, 1250, 1300, 1000, .9, { rimA: .6 });
    const dx = SC - 150 + (t > tGo ? (t - tGo) * 170 : 0);
    dog(t, dx, crestAt(cr, dx) + 6, 290, 1, t > tGo, [[0, -2.5], [-2, -1], [2, -1]]);
    spindrift(t, cr.slice(6), .5, 1);
  }

  // 4 · push into the moon: through the bass swell the smoke gathers into the rattlesnake's face and its
  //     ember eyes open on the 14.08 kick (flash, punch, shake); then pull back to find him, small, on the crest
  function gather(t, lt, dur) {
    const mx = SC, my = 860, R = 430, eyeT = tKick - .06;
    const z = kf(t, [[BAR(6), 1.18], [BAR(7), 1.3], [tKick - .05, 1.58], [tKick + .35, 1.72], [tKick + .75, 1.7], [BAR(9), 1.0]], ease.inOut) + hit(t, tKick, 7) * .1;
    const [sx, sy] = shake(t, hit(t, tKick, 6) * 16);
    frame(SC + sx, kf(t, [[BAR(6), 900], [tKick + .75, 830], [BAR(9), 1010]], ease.inOut) + sy, pick(z, z * .86));
    night(1270, mx, my, R, 1 + hit(t, tKick, 4) * .12); starfield(t, 1);
    moon(mx, my, R, 1 + hit(t, tKick, 5) * .2);
    const g = ease.inOut(inv(BAR(6) + .2, tKick - .1, t)), e = ease.back(inv(eyeT, eyeT + .4, t)) * (1 + .2 * beatPulse(t, 5));
    snakeFace(t, mx, my - 10, 255, g, e, .9);
    dune(SC + 820, 1200, 900, 700, .25, { rimA: .5 });
    const cr = dune(SC - 250, 1275, 1300, 1100, .9, { rimA: .6 });
    const wx = SC + 30 + (t - BAR(6)) * 10;
    const wy = crestAt(cr, wx) + 4, U = [[0, -2], [-1.5, -1], [1.5, -1]];
    walker(t, wx, wy, 160, { wind: -.8 }); walkerSil(t, wx, wy, 160, { wind: -.8 }, U);
    dog(t, wx + 95, crestAt(cr, wx + 95) + 4, 70, 1, 1, U);
    flash(hit(t, tKick, 8) * .06, '#fff1dc');
    const ek = hit(t, eyeT, 1.1) * .75 + .25 * inv(eyeT, eyeT + .3, t);
    paintSet({ etch: lerp(INK.etch, .66, ek), sat: lerp(INK.sat, 1, ek), bloom: 1.0 + .15 * hit(t, tKick, 4) });
  }

  // 5 · low behind him on the dune spine: hem streaming, guitar hanging, the dog trotting at his side;
  //     the serpent moon ahead. A gust on 17.25 tears sand off the crest and flares the snake's eyes.
  function follow(t, lt, dur) {
    const HZ = 1470, mx = SC + 30, my = 880, MR = 470;
    const z = kf(lt, [[0, 1.0], [dur, 1.1]], ease.inOut);
    frame(SC + kf(lt, [[0, -40], [dur, 20]]), kf(lt, [[0, 1150], [dur, 1110]]), pick(z, z * .74));
    night(HZ, mx, my, MR, 1); starfield(t, 1, .005 * t); milky(t, .6, .005 * t);
    moon(mx, my, MR);
    const gk = hit(t, tGust, 2.2);
    snakeFace(t, mx, my - 200, 200, 1, .8 + .5 * gk, .85);
    dune(SC - 760, HZ - 20, 800, 500, .15, { rimA: .5 }); dune(SC + 900, HZ - 10, 700, 600, .2, { rimA: .5 });
    // the spine he walks along, in perspective: lit flank left, shadow right, meeting in a knife edge
    const top = [SC + 150, HZ + 20], bot = [SC - 90, 2300];
    fillPts([[-700, HZ + 40], [top[0] - 400, HZ + 20], top, bot, [-700, 2500]], vgrad(s, HZ, 2100, [[0, '#a4abbb'], [1, '#5e6779']]));
    fillPts([top, [top[0] + 500, HZ + 30], [2700, HZ + 60], [2700, 2500], bot], vgrad(s, HZ, 2100, [[0, '#2c3342'], [1, '#10131a']]));
    s.save(); s.beginPath(); s.moveTo(-700, HZ + 40); s.lineTo(top[0] - 400, HZ + 20); s.lineTo(...top); s.lineTo(...bot); s.lineTo(-700, 2500); s.clip();
    for (let j = 0; j < 10; j++) { const q = ((j + lt * 1.1) % 10) / 10, y = HZ + 30 + Math.pow(q, 2) * 900, pts = [];   // ripples slide toward us as he walks
      for (let i = 0; i <= 10; i++) { const u = i / 10; pts.push([lerp(-700, lerp(top[0], bot[0], inv(HZ, 2300, y)), u), y + Math.sin(u * 5 + j) * (3 + 14 * q)]); }
      stroke(s, pts, '#7c8496', 4 + 16 * q); }
    s.restore();
    stroke(f, [top, bot], 'rgba(225,232,255,.45)', 5);
    const wind = .7 + .6 * gk, wx = SC - 20, wy = 1700, wh = 640;
    const U = [[0, -2.5], [-2, -1], [2, -1]];
    dog(t, SC - 380, 1575, 190, 1, 1, U);
    walker(t, wx, wy, wh, { wind, lit: .18 }); walkerSil(t, wx, wy, wh, { wind }, U);
    spindrift(t, [[SC - 700, 1600], [top[0], HZ + 30]], .3 + 1.2 * gk, 1);
    paintSet({ bloom: 1.0 + .4 * gk });
  }

  // 6 · the scratchboard low wide (his board #19): a saguaro in the foreground, him and the dog walking the
  //     flats toward the small serpent moon, the stars wheeling; the camera trucks right with parallax
  // a saguaro for the etch: dark grey flesh with black ribs, so it engraves as a textured silhouette
  // (a pure black shape on a dark ground would vanish). Two arms, (x, y) = base, h = height.
  function cactus(t, x, y, h, g = s) {
    const w = h * .085, C = g === s ? '#262c37' : '#000', RB = g === s ? '#07080b' : '#000';
    const limb = (pts, wd) => { stroke(g, pts, C, wd * 2); if (g === s) for (const k of [-.55, 0, .55]) stroke(g, pts.map(([px, py], i) => [px + k * wd * (i === pts.length - 1 ? .5 : 1), py]), RB, wd * .16, 'butt'); };
    const armL = [[x, y - h * .42], [x - w * 1.9, y - h * .44], [x - w * 2.3, y - h * .52], [x - w * 2.35, y - h * .72]];
    const armR = [[x, y - h * .55], [x + w * 1.8, y - h * .57], [x + w * 2.2, y - h * .64], [x + w * 2.25, y - h * .86]];
    limb(spline(armL, 4), w * .72); limb(spline(armR, 4), w * .72); limb([[x, y], [x, y - h]], w);
    dot(g, x, y - h, w, C); dot(g, armL[3][0], armL[3][1], w * .72, C); dot(g, armR[3][0], armR[3][1], w * .72, C);
  }

  function saguaroWide(t, lt, dur) {
    const HZ = 1250, pan = kf(lt, [[0, -1], [dur, 1]], ease.inOut) * 110;
    frame(SC + pan * .5, kf(lt, [[0, 1000], [dur, 970]]), pick(kf(lt, [[0, 1.0], [dur, 1.05]]), kf(lt, [[0, .8], [dur, .84]])));
    const mx = SC - 300 + pan * .45, my = 620, rot = (t - BAR(11)) * .03 - .05;
    night(HZ, mx, my, 170, 1.2);
    milky(t, 1, rot, [SC + 700, -500]); starfield(t, 1, rot, [SC + 700, -500], 620, 12);
    meteor(t, tMet2, [SC + 520, 260], [SC - 120, 520], .4);
    moon(mx, my, 170, 1 + .4 * hit(t, BAR(12), 1.5));
    snakeFace(t, mx, my - 30, 95, 1, .9, .8);
    for (const [px, py, wl, wr, k] of [[SC - 700, HZ - 10, 600, 400, .05], [SC + 300, HZ, 700, 380, .1], [SC + 1300, HZ - 5, 600, 500, .1]]) dune(px + pan * .4, py, wl, wr, k, { rimA: .5, ripples: false });
    // the moonlit pan: pale near the horizon under the moon, darker toward us, raked with ripples
    ground(HZ + 40, '#959db0', '#3a4252');
    glow(mx, HZ + 60, 700, 'rgba(200,210,235,.08)');
    for (let j = 0; j < 12; j++) { const y = HZ + 70 + Math.pow(j / 12, 1.8) * 760, pts = [];
      for (let i = 0; i <= 16; i++) { const u = i / 16; pts.push([-600 + u * 3100 - pan * (.2 + j * .05), y + Math.sin(u * 11 + j * 2.1) * (5 + j * 2)]); }
      stroke(s, pts, j % 2 ? '#586174' : '#7a8295', 3 + j * 1.4); }
    for (let i = 0; i < 7; i++) bush(lerp(-200, 2200, hash(i * 9 + 1)) - pan * .7, HZ + 140 + hash(i * 3) * 420, 18 + hash(i) * 26, '#2a303b', i + 3);
    const wx = SC - 90 - pan * .15, wy = 1440, L = [[-2.5, -2], [-1.2, -1]];
    dog(t, wx - 230, wy - 10, 160, -1, 1, L);
    walker(t, wx, wy, 380, { wind: .7, lit: .15, ph: .3, hand: 'R' }); walkerSil(t, wx, wy, 380, { wind: .7, ph: .3, hand: 'R' }, L);
    const cx = SC + 340 - pan * .9; cactus(t, cx, 1760, 1000); rimLight((g) => cactus(t, cx, 1760, 1000, g), [[-3, -1.5]], 'rgba(228,234,255,.6)');
    paintSet({ bloom: 1.0 + .35 * hit(t, BAR(12), 2) });
  }


  // 7 · the moon's smoke pours down the dunes in surges (23.64, 24.45, 25.24), the snake face coming apart,
  //     and swallows him; by the cut the frame is full of pale smoke, which c2 opens inside
  function pour(t, lt, dur) {
    const HZ = 1250, mx = SC, my = 690, R = 350;
    const z = kf(lt, [[0, .98], [3.0, 1.28]], ease.in);
    frame(SC + kf(lt, [[0, -20], [3, 20]]), kf(lt, [[0, 960], [3.2, 1120]]), pick(z, z * .82));
    const surge = (a, b) => ease.out(inv(a, a + .55, t)) * b;
    const Fr = .1 + surge(22.9, .16) + surge(BAR(14), .24) + surge(BT(30), .22) + surge(BAR(15), .28) + .2 * inv(BAR(15) + .5, Z + .5, t);
    const fill = ease.inOut(inv(BAR(15) - .3, Z, t)), rimK = 1 - clamp(fill * 1.4);
    night(HZ, mx, my, R, 1); starfield(t, 1 - .8 * inv(24.4, 25.6, t));
    moon(mx, my, R);
    snakeFace(t, mx, my - 8, 210, 1 - .75 * ease.inOut(inv(BAR(14), BAR(15) + .3, t)), 1 - inv(24.8, 25.6, t), .9);
    dune(SC - 650, HZ - 30, 800, 500, .2, { rimA: .5 * rimK }); dune(SC + 700, HZ - 10, 700, 600, .25, { rimA: .5 * rimK });
    // the pour: streams slide off the moon's lower rim and fall down the dunes, each surge longer
    const streams = [];
    for (let i = 0; i < 11; i++) {
      const th = lerp(.2, .8, (i + .5) / 11) * Math.PI + snoise(i, 64) * .05, d = hash(i * 17 + 5), hp = clamp(Fr * 1.7 - d * .35);
      if (hp <= .02) continue;
      const x0 = mx + Math.cos(th) * R * .96, y0 = my + Math.sin(th) * R * .96, dx = Math.cos(th) * 1.6, pts = [];
      for (let j = 0; j <= 14; j++) { const q = j / 14 * hp; pts.push([x0 + dx * q * 520 + snoise(q * 3 - t * .6 + i, 65) * 60 * q, y0 + q * 1450 + Math.sin(q * 6 + i) * 20]); }
      streams.push([pts, hp]);
    }
    const streamLight = (front, wy) => streams.forEach(([pts, hp]) => { const seg = pts.filter(([, y]) => front ? y > wy - 60 : y <= wy); if (seg.length > 1) soft(seg, 70 + 70 * hp, .26); });
    const cr = dune(SC - 120, HZ + 60, 1300, 1000, .85, { rimA: .55 * rimK });
    for (const [pts, hp] of streams) for (let j = 1; j < pts.length; j++) { const q = j / 14 * hp, w = 30 + q * 330;
      s.save(); s.globalAlpha = .38; stroke(s, [pts[j - 1], pts[j]], mixHex('#6a7283', '#8c94a2', q), w); s.restore(); }
    const wx = SC - 40 + lt * 12, wy = crestAt(cr, wx) + 4, U = [[0, -2], [-1.5, -1], [1.5, -1]];
    // puffs roll over the crest toward the lens, growing; the ones still behind him are drawn first
    const puffs = [];
    for (let i = 0; i < 110; i++) {
      const u = hash(i * 13 + 1) * 2 - 1, d = hash(i * 7 + 2), p = clamp((Fr * 1.35 - d * .8) / .75); if (p <= 0) continue;
      const x = mx + u * R * .9 + u * p * 1300 + snoise(t * .4 + i, 61) * 60 * p, y = my + R * .75 + p * 1500 + Math.pow(p, 2) * 200 + snoise(t * .5 + i, 62) * 40;
      puffs.push([x, y, 70 + p * 520 * (.6 + .6 * hash(i * 3)), p, i]);
    }
    const puff = ([x, y, r, p, i]) => { s.save(); s.globalAlpha = .35 + .4 * p; s.fillStyle = mixHex('#5a6272', '#8e96a5', hash(i * 5) * .6 + p * .4); s.beginPath(); s.ellipse(x, y, r, r * (.55 + .2 * hash(i)), snoise(i, 63) * .4, 0, TAU); s.fill(); s.restore();
      if (i % 3 === 0) glow(x, y - r * .2, r * 1.1, `rgba(${NK.smoke},${.03 * p})`); };
    puffs.filter((q) => q[1] < wy).forEach(puff); streamLight(false, wy);
    walker(t, wx, wy, 210, { wind: -.9 }); walkerSil(t, wx, wy, 210, { wind: -.9 }, U, rimK);
    dog(t, wx + 120, crestAt(cr, wx + 120) + 4, 95, 1, 1, U, rimK);
    puffs.filter((q) => q[1] >= wy).forEach(puff); streamLight(true, wy);
    // on the 25.24 hit the smoke closes over him
    const eng = ease.out(inv(BAR(15) - .1, BAR(15) + .45, t));
    if (eng > .01) { puff([wx + 30, wy - 90, 60 + 360 * eng, .9, 7]); puff([wx - 60, wy - 40, 40 + 300 * eng, .8, 11]); soft([[wx - 150, wy - 60], [wx + 150, wy - 120]], 200 * eng, .3 * eng); }
    // by the cut the smoke fills the frame: the underpainting goes pale and the light layer is swallowed
    if (fill > .01) { s.save(); s.globalAlpha = fill; s.fillStyle = '#9aa2af'; s.fillRect(-1400, -1400, 4800, 4800); s.restore();
      s.save(); for (let i = 0; i < 16; i++) { const r = 240 + 320 * hash(i + 42); s.globalAlpha = .22 * fill; s.fillStyle = i % 2 ? '#b4bac5' : '#8e96a3';
        s.beginPath(); s.ellipse(SC + (hash(i * 3 + 40) - .5) * 2000 + snoise(t * .3 + i, 66) * 120, 500 + hash(i * 5 + 41) * 1200 - (t - Z) * 80, r, r * .55, snoise(i, 67) * .5, 0, TAU); s.fill(); } s.restore();
      screen(() => { f.save(); f.globalAlpha = .95 * fill; f.fillStyle = '#000'; f.fillRect(-10, -10, W + 20, H + 20); f.restore(); });
      glow(SC, 1050, 1300, `rgba(${NK.smoke},${.1 * fill})`); }
    paintSet({ flowK: .9 + .8 * inv(BAR(14), Z, t), etch: lerp(INK.etch, .7, fill) });
  }


  chapter('night', A, Z, [
    [A, scratch],
    [BAR(3), rise],
    [BT(10), hound],
    [BAR(6), gather],
    [BAR(9), follow],
    [BAR(11), saguaroWide],
    [BT(28), pour],
  ], { paint: INK });
})();
