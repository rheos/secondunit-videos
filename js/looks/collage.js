// LOOK PROBE: junkyard collage. 37.7 - 56.0 ("bottle full of rain" into the first four "clap hands").
// Torn scraps of found paper (newsprint, kraft, halftone poster, rusted tin, blue tissue) cut out and
// animated in stop motion: every piece moves in steps 12 times a second and never sits perfectly still.
// The junk is the band: hubcaps, pot lids, cans and bottles hit on the beat, the way Rain Dogs sounds.
const LOOK = {
  span: [37.7, 56.0],
  frag: `
uniform float flick, seed;
void main(){
  float k = floor(tq * 12. + .5);                       // one exposure per drawing
  vec2 mis = vec2(h21(vec2(k, 1.)) - .5, h21(vec2(k, 2.)) - .5) * .0012;
  vec3 c = vec3(texture(src, uv + mis).r, texture(src, uv).g, texture(src, uv - mis).b);
  float grain = vn(uv * res * .5 + k * 13.) - .5;
  c *= 1. + grain * .07;
  c *= .97 + .06 * fbm(uv * vec2(3., 5.) + seed);         // uneven light on the table
  c *= 1. + (h21(vec2(k, 7.)) - .5) * flick;            // exposure flicker between frames
  float dust = step(.9993, h21(floor(uv * res * .5) + k * 31.));
  c = mix(c, vec3(.1), dust * .7);
  vec2 v = uv - .5; c *= 1. - dot(v, v) * .55;
  o = vec4(c, 1.);
}`,
  uniforms: (t, X) => ({ flick: X.flick ?? .05, seed: X.seed ?? 1 }),
};

(() => {
  // ---- paper stock, made once (seeded, so every worker gets the same sheets) ----
  const mk = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); fn(g, w, h); return c; };
  const speck = (g, w, h, n, col, r0, r1, seed) => { const r = rng(seed); g.fillStyle = col; for (let i = 0; i < n; i++) { g.globalAlpha = .2 + r() * .5; g.beginPath(); g.arc(r() * w, r() * h, r0 + r() * (r1 - r0), 0, TAU); g.fill(); } g.globalAlpha = 1; };
  const STOCK = {
    // newsprint: grey paper, columns of illegible "type" (dashes), a halftone photo block
    news: mk(512, 512, (g, w, h) => {
      g.fillStyle = '#d9d3c4'; g.fillRect(0, 0, w, h); const r = rng(11); g.fillStyle = '#3a3733';
      for (let col = 0; col < 3; col++) for (let y = 8; y < h; y += 11) { let x = 10 + col * 168; while (x < col * 168 + 158) { const L = 4 + r() * 22; if (r() > .08) g.fillRect(x, y, L, 3.2); x += L + 3; } }
      for (let y = 290; y < 470; y += 7) for (let x = 190; x < 330; x += 7) { const v = .5 + .5 * Math.sin(x * .05) * Math.cos(y * .04); g.beginPath(); g.arc(x, y, 3.4 * v, 0, TAU); g.fill(); }
      speck(g, w, h, 400, '#8a8270', .5, 1.6, 12);
    }),
    // kraft: brown paper with fibres
    kraft: mk(512, 512, (g, w, h) => {
      g.fillStyle = '#b48a5c'; g.fillRect(0, 0, w, h); const r = rng(21);
      for (let i = 0; i < 900; i++) { g.strokeStyle = r() > .5 ? 'rgba(90,60,30,.25)' : 'rgba(230,200,150,.25)'; g.lineWidth = .6 + r(); const x = r() * w, y = r() * h, a = r() * TAU, L = 6 + r() * 24; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); g.stroke(); }
    }),
    // brick: kraft printed with red brick courses
    brick: mk(512, 512, (g, w, h) => {
      g.fillStyle = '#7e3b2c'; g.fillRect(0, 0, w, h); const r = rng(31);
      for (let y = 0, row = 0; y < h; y += 34, row++) for (let x = (row % 2) * -40; x < w; x += 80) { g.fillStyle = `rgb(${150 + r() * 50 | 0},${60 + r() * 30 | 0},${45 + r() * 20 | 0})`; g.fillRect(x + 3, y + 3, 74, 28); }
      speck(g, w, h, 600, '#3a1a12', .5, 2, 32);
    }),
    // poster: faded red with yellow halftone
    poster: mk(512, 512, (g, w, h) => {
      g.fillStyle = '#c8392b'; g.fillRect(0, 0, w, h); g.fillStyle = '#f2c14e';
      for (let y = 0; y < h; y += 12) for (let x = (y / 12 % 2) * 6; x < w; x += 12) { const v = .5 + .5 * Math.sin((x + y) * .02); g.beginPath(); g.arc(x, y, 4.2 * v, 0, TAU); g.fill(); }
      speck(g, w, h, 300, '#fff4d8', .5, 2.5, 41);
    }),
    // mustard: yellow stock for the bursts
    mustard: mk(256, 256, (g, w, h) => { g.fillStyle = '#e8b53a'; g.fillRect(0, 0, w, h); speck(g, w, h, 300, '#a8741a', .5, 2, 51); }),
    // tin: brushed silver with rust blooms
    tin: mk(512, 512, (g, w, h) => {
      const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#c9cdd0'); gr.addColorStop(.5, '#8d9499'); gr.addColorStop(1, '#d8dcde'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      const r = rng(61); for (let i = 0; i < 500; i++) { g.strokeStyle = `rgba(255,255,255,${r() * .3})`; g.beginPath(); const y = r() * h; g.moveTo(0, y); g.lineTo(w, y + r() * 6); g.stroke(); }
      for (let i = 0; i < 14; i++) { const x = r() * w, y = r() * h, R = 10 + r() * 40; const rg = g.createRadialGradient(x, y, 0, x, y, R); rg.addColorStop(0, 'rgba(150,70,25,.85)'); rg.addColorStop(1, 'rgba(150,70,25,0)'); g.fillStyle = rg; g.fillRect(x - R, y - R, R * 2, R * 2); }
    }),
    rust: mk(512, 512, (g, w, h) => { g.fillStyle = '#8c4a22'; g.fillRect(0, 0, w, h); speck(g, w, h, 1400, '#c9733a', .6, 3, 71); speck(g, w, h, 800, '#3e1e0c', .6, 2.5, 72); }),
    // blue tissue (translucent, drawn with alpha)
    tissue: mk(256, 256, (g, w, h) => { g.fillStyle = '#5d8ed6'; g.fillRect(0, 0, w, h); speck(g, w, h, 200, '#a9c6f0', 1, 4, 81); }),
    // bottle-green magazine stock
    green: mk(256, 256, (g, w, h) => { g.fillStyle = '#2f6b45'; g.fillRect(0, 0, w, h); g.fillStyle = '#5f9b6a'; for (let y = 0; y < h; y += 8) for (let x = 0; x < w; x += 8) { g.beginPath(); g.arc(x, y, 2.2, 0, TAU); g.fill(); } }),
    // night: inky blue print
    night: mk(512, 512, (g, w, h) => { g.fillStyle = '#1d2a4a'; g.fillRect(0, 0, w, h); speck(g, w, h, 500, '#3a4f80', .6, 2.4, 91); speck(g, w, h, 120, '#e8e0c0', .4, 1.2, 92); }),
    cream: mk(256, 256, (g, w, h) => { g.fillStyle = '#efe6cf'; g.fillRect(0, 0, w, h); speck(g, w, h, 200, '#b8ab8a', .4, 1.4, 101); }),
  };
  const PAT = {}; let patFor = null;
  function pat(name) { if (patFor !== s) { patFor = s; for (const k of Object.keys(STOCK)) PAT[k] = s.createPattern(STOCK[k], 'repeat'); } return PAT[name]; }

  // ---- scraps ----
  const Q = (t) => onTwos(t, 12);
  // tear a polygon: subdivide, and rip the edge with fine jagged noise
  function torn(pts, seed, rip = 5) {
    const o = [], n = pts.length;
    for (let i = 0; i < n; i++) { const p0 = pts[i], p1 = pts[(i + 1) % n], L = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]), k = Math.max(2, Math.round(L / 9));
      for (let j = 0; j < k; j++) { const u = j / k, x = lerp(p0[0], p1[0], u), y = lerp(p0[1], p1[1], u), h = hash((i * 131 + j) * 7 + seed * 977); o.push([x + (h - .5) * rip + snoise(x * .03 + y * .02, seed) * rip * 1.4, y + (hash((i * 131 + j) * 11 + seed * 571) - .5) * rip + snoise(y * .03 - x * .01, seed + 2) * rip * 1.4]); } }
    return o;
  }
  const path = (pts) => { s.beginPath(); pts.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y)); s.closePath(); };
  // a cut-out: shadow, a white torn rim, then the stock. o: { stock, seed, rim, shadow, alpha, ox, oy (pattern offset), scale }
  function scrap(pts, o = {}) {
    const { stock = 'kraft', seed = 0, rim = 4, shadow = 1, alpha = 1, ox = 0, oy = 0, scale = 1, color = null, tear = 5 } = o;
    const tp = torn(pts, seed, tear);
    s.save(); s.globalAlpha = alpha;
    if (shadow) { s.shadowColor = 'rgba(20,12,6,.45)'; s.shadowBlur = 14 * shadow; s.shadowOffsetX = 5 * shadow; s.shadowOffsetY = 8 * shadow; }
    if (rim) { path(torn(pts.map(([x, y]) => [x, y]), seed + 5, tear + rim)); s.fillStyle = '#f4efe2'; s.fill(); }
    s.shadowColor = 'transparent';
    path(tp); s.save(); s.clip();
    if (color) { s.fillStyle = color; s.fill(); }
    else { s.translate(ox, oy); s.scale(scale, scale); s.fillStyle = pat(stock); s.fillRect(-4000, -4000, 8000, 8000); }
    s.restore(); s.restore();
  }
  const rect = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
  const circ = (x, y, r, n = 40) => [...Array(n)].map((_, i) => [x + Math.cos(i / n * TAU) * r, y + Math.sin(i / n * TAU) * r]);
  // stop-motion jitter for a piece: [dx, dy, drot], re-rolled each drawing
  const jit = (t, id, amt = 1) => { const k = Math.floor(t * 12); return [(hash(k * 13 + id * 101) - .5) * 4 * amt, (hash(k * 17 + id * 103) - .5) * 4 * amt, (hash(k * 19 + id * 107) - .5) * .02 * amt]; };
  function place(t, id, x, y, rot, fn, amt = 1) { const [dx, dy, dr] = jit(t, id, amt); s.save(); s.translate(x + dx, y + dy); s.rotate(rot + dr); fn(); s.restore(); }
  // the table: kraft under everything, scraps of newsprint already glued down
  function table(t, stock = 'kraft') { s.fillStyle = pat(stock); s.fillRect(-W, -H, W * 3, H * 3); }

  // ---- junk ----
  function hubcap(r, seed = 0) { scrap(circ(0, 0, r), { stock: 'tin', seed, scale: r / 260 }); for (const k of [.72, .45]) { s.strokeStyle = 'rgba(40,40,45,.5)'; s.lineWidth = Math.max(2, r * .03); s.beginPath(); s.arc(0, 0, r * k, 0, TAU); s.stroke(); } scrap(circ(0, 0, r * .18, 16), { stock: 'rust', seed: seed + 3, rim: 2, shadow: .4 }); }
  function can(w, h, seed = 0) { scrap(rect(-w / 2, -h, w, h), { stock: 'tin', seed, scale: .5 }); scrap(rect(-w / 2, -h * .75, w, h * .45), { stock: seed % 2 ? 'poster' : 'news', seed: seed + 1, rim: 2, shadow: .3 }); }
  function bottle(w, h, seed = 0, stock = 'green') {
    const b = [[-w / 2, 0], [-w / 2, -h * .62], [-w * .17, -h * .8], [-w * .15, -h], [w * .15, -h], [w * .17, -h * .8], [w / 2, -h * .62], [w / 2, 0]];
    scrap(b, { stock, seed, tear: 3 });
    s.fillStyle = 'rgba(255,255,255,.35)'; s.fillRect(-w * .32, -h * .58, w * .1, h * .45);
  }
  function lid(r, seed = 0) { scrap(circ(0, 0, r), { stock: 'rust', seed, scale: .6 }); scrap(rect(-r * .2, -r * .16, r * .4, r * .32), { stock: 'tin', seed: seed + 2, rim: 2, shadow: .6 }); }
  function spoon(L, seed = 0) { scrap([[-L * .05, 0], [L * .05, 0], [L * .04, -L * .7], [L * .12, -L * .82], [L * .1, -L], [-L * .1, -L], [-L * .12, -L * .82], [-L * .04, -L * .7]], { stock: 'tin', seed, rim: 2, tear: 2 }); }
  // a cut-out hand from a stock; parts in back-to-front order
  function cutHand(x, y, sc, o, stock, seed) {
    const h = handShape(x, y, sc, o);
    scrap(h.cuff, { stock: 'news', seed: seed + 9, tear: 4 });
    scrap([...h.palm], { stock, seed, tear: 4 });
    h.fingers.forEach((p, i) => scrap(p, { stock, seed: seed + i + 1, tear: 3, rim: 3, shadow: .6 }));
    scrap(h.thumb, { stock, seed: seed + 7, tear: 3, rim: 3, shadow: .6 });
  }
  // a pair of clapping hands: stop-motion, so the approach is three or four big drawings, then a held hit
  function clapPair(t, cx, cy, sc, k, { stocks = ['news', 'kraft'], seed = 0, tilt = .2 } = {}) {
    const q = Q(t), lt = q - k;
    const gap = (lt < 0 ? clamp(-lt / .42) : .5 * ease.out(clamp(lt / .5))) * sc;
    const pop = hit(q, k, 10) * .14;
    place(t, seed + 1, 0, 0, 0, () => cutHand(cx - gap - sc * .62, cy + sc * .9, sc * (1 + pop), { dir: -1, rot: tilt + pop, spread: .12 }, stocks[0], seed));
    place(t, seed + 2, 0, 0, 0, () => cutHand(cx + gap + sc * .62, cy + sc * .9, sc * (1 + pop), { dir: 1, rot: -tilt - pop, spread: .12 }, stocks[1], seed + 30));
  }
  // a jagged burst scrap (the visual "bang") on a hit
  function burst(t, x, y, R, k, stock = 'mustard', seed = 0, n = 13) {
    const q = Q(t), age = q - k; if (age < 0 || age > .7) return;
    const r = R * (age < .09 ? .6 : 1) * (1 - Math.max(0, age - .45) * 1.5);
    const pts = []; for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * TAU + seed, rr = i % 2 ? r * (.42 + hash(i + seed * 7) * .2) : r * (.85 + hash(i * 3 + seed) * .3); pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); }
    scrap(pts, { stock, seed: seed + Math.floor(q * 12), tear: 3 });
  }
  // a piece of junk that jumps on each beat
  function jumpy(t, id, x, y, fn, amt = 1, rot = 0) { const q = Q(t), bp = beatPulse(q, 9); place(t, id, x, y - bp * 40 * amt, rot + (hash(lastBeat(q) * 7 + id) - .5) * .4 * bp * amt, fn); }
  // rain: torn blue tissue strips stepping down
  function rain(t, n, seed, sp = 1600, a = .55) {
    const q = Q(t), r = rng(seed);
    for (let i = 0; i < n; i++) { const x = r() * (W + 200) - 100, ph = r(), L = 40 + r() * 70, y = ((ph * (H + 300) + q * sp * (.7 + r() * .6)) % (H + 300)) - 150; scrap(rect(x, y, 10 + r() * 8, L), { stock: 'tissue', seed: i + seed, alpha: a, rim: 0, shadow: .3, tear: 3 }); }
  }

  // ---- shots ----
  // 37.7 "hangin' out the window with a bottle full of rain": a brick tenement, a lit window, an arm holds the bottle out into the rain
  function window_(t, lt, dur) {
    const q = Q(t), z = kf(q - (t - lt), [[0, 1.0], [dur, 1.22]]);
    cam(560, 980, z);
    table(t, 'night');
    // the moon: a cream circle torn out of a book page
    place(t, 1, 860, 260, 0, () => scrap(circ(0, 0, 110), { stock: 'cream', seed: 5 }), .5);
    // the tenement
    place(t, 2, 0, 0, 0, () => scrap([[-120, 420], [1240, 380], [1260, 2300], [-140, 2300]], { stock: 'brick', seed: 7, scale: .9 }), .3);
    // window: poster-yellow light, a kraft frame cross
    place(t, 3, 0, 0, 0, () => { scrap(rect(250, 640, 520, 700), { stock: 'mustard', seed: 9 }); scrap(rect(495, 640, 30, 700), { stock: 'kraft', seed: 10, rim: 2 }); scrap(rect(250, 970, 520, 26), { stock: 'kraft', seed: 11, rim: 2 }); scrap(rect(210, 1330, 600, 50), { stock: 'news', seed: 12 }); }, .3);
    // the arm out of the window: newsprint sleeve, kraft hand, gripping the bottle
    const swing = Math.sin(q * 2.4) * .04;
    place(t, 4, 430, 1190, -.32 + swing, () => {
      scrap(rect(-60, -40, 340, 90), { stock: 'news', seed: 14 });
      const fillK = kf(lt, [[0, .1], [dur, .95]]);
      s.save(); s.translate(330, 30); s.rotate(.35);
      bottle(120, 300, 15);
      // rain level inside the bottle: tissue rising
      s.save(); path([[-60, 0], [-60, -186], [60, -186], [60, 0]]); s.clip(); scrap(rect(-70, -186 * fillK, 140, 190), { stock: 'tissue', seed: 16 + Math.floor(q * 4), alpha: .7, rim: 0, shadow: 0 }); s.restore();
      cutHand(0, 70, 85, { dir: 1, rot: -1.6, spread: 0, curl: .7 }, 'kraft', 17);
      s.restore();
    }, .6);
    rain(t, 46, 3, 1700);
    fx({ flick: .05, seed: 1.2 });
  }
  // CLAP 1 (41.6): red poster sunburst, newsprint hand meets kraft hand, a mustard burst; the junk jumps
  function clap1(t, lt, dur) {
    const q = Q(t), z = kf(q - (t - lt), [[0, 1.15], [.3, 1.0], [dur, .94]], ease.out);
    cam(540, 960, z);
    table(t, 'poster');
    // sunburst rays: alternating cream and poster wedges
    place(t, 1, 540, 860, q * .05, () => { for (let i = 0; i < 16; i++) if (i % 2) { const a0 = i / 16 * TAU, a1 = (i + 1) / 16 * TAU; scrap([[0, 0], [Math.cos(a0) * 1600, Math.sin(a0) * 1600], [Math.cos(a1) * 1600, Math.sin(a1) * 1600]], { stock: 'cream', seed: i, shadow: .5, tear: 6 }); } }, .2);
    const k = CLAPS[0];
    burst(t, 540, 760, 360, k, 'mustard', 3); burst(t, 540, 760, 230, HANDS[0], 'cream', 9, 9);
    jumpy(t, 11, 190, 1560, () => hubcap(130, 21), 1, -.1);
    jumpy(t, 12, 860, 1600, () => can(140, 230, 22), 1.2, .08);
    jumpy(t, 13, 540, 1720, () => lid(110, 23), .8);
    clapPair(t, 540, 860, 230, k, { stocks: ['news', 'kraft'], seed: 40 });
    fx({ flick: .06, seed: 2.1 });
  }
  // CLAP 2 (46.0): the hubcaps are the hands: two hubcaps slam like cymbals in front of a blue print; cans hop
  function clap2(t, lt, dur) {
    const q = Q(t);
    cam(540, kf(lt, [[0, 1000], [dur, 920]]), kf(lt, [[0, .95], [dur, 1.1]]));
    table(t, 'night');
    place(t, 1, 0, 0, 0, () => { scrap(rect(-100, 1380, 1300, 700), { stock: 'rust', seed: 3 }); scrap(rect(80, 260, 920, 160), { stock: 'news', seed: 4 }); }, .3);
    const k = CLAPS[1], lk = q - k;
    const gap = (lk < 0 ? clamp(-lk / .42) : .45 * ease.out(clamp(lk / .5))) * 300;
    burst(t, 540, 900, 300, k, 'mustard', 5);
    place(t, 2, 540 - 190 - gap, 900, .3 - gap * .001, () => { s.scale(.4, 1); hubcap(230, 31); });
    place(t, 3, 540 + 190 + gap, 900, -.3 + gap * .001, () => { s.scale(.4, 1); hubcap(230, 33); });
    // cans in a row, each hops on its own beat
    for (let i = 0; i < 5; i++) { const bt = lastBeat(q), on = (bt % 5) === i ? beatPulse(q, 8) : 0; place(t, 10 + i, 140 + i * 200, 1560 - on * 70, (hash(i) - .5) * .2, () => can(110 + (i % 2) * 30, 170 + hash(i + 3) * 80, 40 + i)); }
    burst(t, 540, 900, 180, HANDS[1], 'cream', 13, 9);
    fx({ flick: .06, seed: 3.3 });
  }
  // CLAP 3 (50.0): the bottle marimba: a spoon walks along a row of bottles, one per beat; glove hands clap above
  function clap3(t, lt, dur) {
    const q = Q(t);
    cam(540, 980, kf(lt, [[0, 1.08], [dur, .98]]));
    table(t, 'news');
    place(t, 1, 0, 0, 0, () => scrap(rect(-100, 1180, 1300, 900), { stock: 'kraft', seed: 5, scale: 1.2 }), .3);
    const stocks = ['green', 'tin', 'green', 'tissue', 'green', 'rust'];
    const bi = lastBeat(q), cur = ((bi % 6) + 6) % 6, bp = beatPulse(q, 10);
    for (let i = 0; i < 6; i++) { const h = 260 + i * 55, on = i === cur ? bp : 0; place(t, 10 + i, 120 + i * 168, 1240 + on * 10, on * (hash(bi) - .5) * .15, () => bottle(110, h, 50 + i, stocks[i])); }
    // the spoon, hopping from bottle to bottle
    const sx = 120 + cur * 168, sy = 1240 - (260 + cur * 55) * .55;
    place(t, 20, sx + 90, sy - 40 + bp * 30, -1.0 + bp * .5, () => spoon(260, 61));
    const k = CLAPS[2];
    burst(t, 540, 560, 260, k, 'mustard', 7);
    clapPair(t, 540, 520, 150, k, { stocks: ['cream', 'cream'], seed: 70, tilt: .18 });
    burst(t, 540, 560, 160, HANDS[2], 'poster', 17, 9);
    fx({ flick: .07, seed: 4.4 });
  }
  // CLAP 4 (54.1): the big one: giant hands torn from every stock on the table, a burst that fills the frame; the junk scatters
  function clap4(t, lt, dur) {
    const q = Q(t), k = CLAPS[3], age = q - k;
    cam(540, 960, kf(lt, [[0, 1.0], [dur, 1.18]], ease.in), age > 0 ? (hash(Math.floor(q * 12)) - .5) * .03 * hit(q, k, 3) : 0);
    table(t, 'poster');
    burst(t, 540, 860, 900, k, 'mustard', 11, 17);
    burst(t, 540, 860, 560, k + .08, 'cream', 13, 13);
    const junk = [(i) => hubcap(110, 80 + i), (i) => can(100, 170, 85 + i), (i) => lid(90, 90 + i), (i) => bottle(80, 220, 95 + i), (i) => spoon(200, 99 + i)];
    for (let i = 0; i < 10; i++) { const a = hash(i * 9) * TAU, d = 250 + age * 900 * (age > 0 ? 1 : 0) + hash(i) * 200; place(t, 30 + i, 540 + Math.cos(a) * Math.min(d, 900), 900 + Math.sin(a) * Math.min(d, 1100), a + (age > 0 ? age * 3 : 0), () => junk[i % 5](i)); }
    clapPair(t, 540, 860, 300, k, { stocks: ['news', 'brick'], seed: 90, tilt: .2 });
    fx({ flick: .08, seed: 5.5 });
  }
  chapter('collage', 37.7, 56.0, [[37.7, window_], [CLAPS[0] - .45, clap1], [CLAPS[1] - .45, clap2], [CLAPS[2] - .45, clap3], [CLAPS[3] - .45, clap4]]);
})();
