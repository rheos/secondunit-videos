// js/ch/c9.js · ALL A FLAME (186.200 - 213.200) · second chorus · look: sunset oil
// One location: a mesa rim above a valley that burns end to end. It answers c4's butte-top hook with a
// bigger world: the light comes UP from the valley fire (no sun), so he is rimmed from below.
// Opens in c8's sunrise flare; ends with the valley's fires sinking to a ring of torch points for c10.
(() => {
  const A = 186.2, Z = 213.2;
  const tFlame = when('flame', 188), tBlaze = when('blazing', 189), tSmoke = when('smoke', 193), tRivers = when('rivers', 194);
  const tSky = when('sky', 195), tFire = when('fire', 195.5), tOld = when('old', 196.5), tRise = when('rise', 197);
  const tC1 = when('calling', 198), tC2 = when('calling', 200.5), tC3 = when('calling', 203), tC4 = when('calling', 208) - .25; // the vocal stem starts the last one ~.25 s before the sheet
  const tFlame2 = when('flame', 202), tSame = when('same', 205), tChanges = when('changes', 208.5), tSeeing = when('seeing', 211) - .3;
  // each "calling" throws a wave of light across the valley; alternate directions
  const WAVES = [[tC1, 1], [tC2, 1], [tC3, 1], [tC4, 1]]; // every call sweeps left to right

  const hx = (a, b, k) => { const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const A_ = p(a), B_ = p(b); k = clamp(k);
    return '#' + A_.map((v, i) => Math.round(lerp(v, B_[i], k)).toString(16).padStart(2, '0')).join(''); };

  // the calling wave: a band of light and heat that travels the valley floor left to right in 1.5 s
  const WDUR = 1.5, wavePos = (u) => lerp(pick(250, -600), pick(2150, 2550), ease.inOut(u)); // 9:16 sees less width: a shorter run keeps it on screen
  function waveAt(t, x) { let k = 0; for (const [tw] of WAVES) { const u = (t - tw) / WDUR; if (u < -.05 || u > 1) continue;
      k = Math.max(k, Math.exp(-Math.pow((x - wavePos(u) + 260) / 260, 2)) * smooth(u * 8) * (1 - u * .35)); } return k; }
  function waveSwell(t) { let k = 0; for (const [tw] of WAVES) k = Math.max(k, t < tw ? 0 : Math.exp(-1.6 * (t - tw)) * inv(tw - .05, tw + .15, t)); return k; }
  // y0..y1: the stretch of valley floor the band crosses (far to near); lift = how high the shimmer rises
  function waveBand(t, y0, y1, lift, a = 1) {
    for (const [tw] of WAVES) { const u = (t - tw) / WDUR; if (u < 0 || u > 1) continue;
      const bx = wavePos(u), k = smooth(u * 8) * (1 - u * .35) * a, lean = 520; // the band leans with perspective: near end trails
      f.save(); f.globalCompositeOperation = 'lighter';
      // the bright band on the ground: slices from far (narrow) to near (wide)
      for (let i = 0; i < 20; i++) { const q = i / 19, y = lerp(y0, y1, q), cx = bx - lean * q, bw = 90 + 260 * q;
        const gr = f.createLinearGradient(cx - bw, 0, cx + bw, 0); gr.addColorStop(0, 'rgba(255,150,60,0)'); gr.addColorStop(.62, 'rgba(255,225,160,1)'); gr.addColorStop(1, 'rgba(255,150,60,0)');
        f.fillStyle = gr; f.globalAlpha = .26 * k; f.fillRect(cx - bw, y - (y1 - y0) / 19, bw * 2, (y1 - y0) / 9.5 + 2); }
      f.globalAlpha = 1; f.restore();
      glow(bx - lean * .5, (y0 + y1) / 2, (y1 - y0) * .55, `rgba(255,190,110,${.22 * k})`);
      // heat shimmer: thin wavering strands of light rising off the band
      for (let j = 0; j < 12; j++) { const q = hash(j * 7 + 3), sx = bx - lean * q + (hash(j * 5) - .5) * 260, sy = lerp(y0, y1, q), hh = lift * (.25 + .4 * hash(j * 11)), pts = [];
        for (let m = 0; m <= 10; m++) { const v = m / 10; pts.push([sx + Math.sin(v * 9 + t * 14 + j) * 16 * v, sy - v * hh]); }
        f.save(); f.globalCompositeOperation = 'lighter'; stroke(f, pts, `rgba(255,215,150,${.22 * k})`, 5 + 5 * q); f.restore(); }
    }
  }

  // ---- the burning sky: no sun, lit from the valley below; ignite 0..1 sets it on fire from the horizon up ----
  function burnSky(t, HZ, o = {}) {
    const { ignite = 0, night = 0, heat = 1, sun = 0, sunX = SC + 200 } = o;
    const top = hx(hx('#2a090c', '#5a120c', ignite), '#0a0710', night), mid = hx(hx('#7a1f12', '#c0381a', ignite), '#1c0b12', night), low = hx(hx('#d0561c', '#ffab3e', ignite), '#4a1810', night);
    sky(top, mid, low, HZ + 60, -900, STAGE + 900);
    // the fire climbing the sky
    if (ignite > .01) { const ih = 300 + 1900 * ignite; s.fillStyle = vgrad(s, HZ - ih, HZ + 40, [[0, 'rgba(255,120,40,0)'], [.55, `rgba(255,120,40,${.45 * ignite * (1 - night)})`], [1, `rgba(255,200,90,${.8 * ignite * (1 - night)})`]]); s.fillRect(-900, HZ - ih, STAGE + 1800, ih + 40); }
    // smoke banks drifting over, their bellies lit orange from below
    const r = rng(77);
    for (let i = 0; i < 11; i++) { const cy = lerp(HZ - 1500, HZ - 120, r()), cx = (r() * 3400 + t * (10 + r() * 14)) % 3400 - 750, w = 600 + r() * 900, hh = 60 + r() * 110;
      const lit = clamp(1 - (HZ - cy) / 1500) * heat * (1 - night * .8);
      s.fillStyle = hx('#2a0c0a', '#ff8a36', lit * (.55 + .4 * ignite)); s.beginPath(); s.ellipse(cx, cy, w / 2, hh / 2, 0, 0, TAU); s.fill();
      s.fillStyle = hx('#1e0907', '#8a2a16', lit * .7); s.beginPath(); s.ellipse(cx + 40, cy - hh * .35, w * .42, hh * .32, 0, 0, TAU); s.fill(); }
    if (sun > .01) { dot(s, sunX, HZ - 180, 150, hx('#ff9a40', '#ffe2a0', sun)); glow(sunX, HZ - 180, 900 * sun, `rgba(255,190,110,${.35 * sun})`); }
    glow(SC, HZ, 1500, `rgba(255,110,40,${(.12 + .12 * ignite) * heat * (1 - night)})`);
  }

  // ---- flame tongues (as c4's): deep red roots, orange bodies, amber tips ----
  function tongue(t, x, y, h, w, seed, lean = 0) {
    if (h < 3) return;
    const shape = (k, c) => flameShape(t, x, y, h, w, k, c, seed, lean);
    shape(1, '#7a1a0c'); shape(.7, '#c8431b'); shape(.4, '#f28a2c'); if (h > 14) shape(.18, '#ffc05a');
  }
  // a wall of tall tongues (the valley fire rising behind the rim in the close shots)
  function flameWall(t, y0, height, k, x0, x1, seed = 7, n = 18) {
    if (k <= .01) return;
    for (let i = 0; i < n; i++) { const x = lerp(x0, x1, (i + hash(i * 3 + seed) * .6) / n) + snoise(i, seed) * 60;
      const hh = height * (.35 + .65 * noise1(t * 1.3 + i * 1.7, seed)) * k * (1 + .6 * waveAt(t, x));
      tongue(t, x, y0, hh * (.6 + .8 * hash(i * 5 + seed)), (x1 - x0) / n * (.7 + 1.1 * hash(i + seed)), i + seed * 30, .1 + .2 * snoise(i * .8, seed)); }
    glow((x0 + x1) / 2, y0 - height * .3, (x1 - x0) * .6, `rgba(255,120,40,${.1 * k})`);
  }

  // ---- the valley floor, burning in fronts from the horizon (HZ) down to the rim (HZ + D) ----
  // vx -1..1 across the valley, z 0 (horizon) .. 1 (at our feet)
  const VX = (vx, z) => SC + vx * (700 + 1700 * z), VY = (z, HZ, D) => HZ + D * Math.pow(z, 1.4);
  function valley(t, HZ, D, o = {}) {
    const { heat = 1, sink = 0 } = o;
    ground(HZ, '#4a140c', '#1c0806', -900, STAGE + 900);
    // the far wall of the valley: a long mesa line
    mesas(HZ + 6, 150, '#260908', 91, -900, STAGE + 900); mesas(HZ + 10, 80, '#170606', 92, -900, STAGE + 900);
    const R = 10, hk = heat * (1 - sink);
    for (let r = 0; r < R; r++) {
      const z = Math.pow((r + .6) / R, 1.25), y = VY(z, HZ, D), sc = .12 + z * 1.15;
      const fy = (x) => y + snoise(x * .0026 + r * 1.7, 17) * 60 * sc; // the front wanders
      if (z < .3) { // far fronts: a thin jagged line of fire with an ember bed behind it
        s.fillStyle = hx('#9a2c10', '#ffb048', .5 * hk); s.beginPath(); s.moveTo(-900, fy(-900) + 3);
        for (let x = -900; x <= STAGE + 900; x += 24) { const on = noise1(x * .0022 + r * 3, 14) > .18 ? 1 : 0, hh = (5 + 34 * z) * hk * on * (.3 + noise1(x * .012 + r * 7 + t * 1.4, 13)) * (1 + 1.3 * waveAt(t, x));
          s.lineTo(x, fy(x) - hh); }
        for (let x = STAGE + 900; x >= -900; x -= 60) s.lineTo(x, fy(x) + 3 + 6 * z);
        s.closePath(); s.fill(); continue; }
      const w = lerp(26, 110, z);
      for (let x = -900 + (r * 37) % w, i = 0; x <= STAGE + 900; i++) {
        const hs = hash(r * 977 + i * 13), step = w * (.55 + 1.3 * hs * hs); x += step; // uneven spacing: clumps and gaps
        const gap = noise1(x * .0019 + r * 3.1, 16); if (gap < .2) continue;
        const big = hash(r * 311 + i * 29) > .93, yy = fy(x), wv = waveAt(t, x);
        const hh = (40 + 190 * z) * hk * (.35 + .9 * noise1(t * 1.5 + x * .013 + r, 18)) * clamp((gap - .2) * 3.5) * (1 + 1.6 * wv) * (big ? 2.6 : .45 + 1.3 * Math.pow(hash(r * 71 + i * 3), 2));
        const tw = w * (big ? 1.5 : .5 + .9 * hash(r * 131 + i)), lean = .12 + .18 * snoise(i * .7 + r, 19) + .08 * Math.sin(t * .9 + x * .004);
        // the burnt ground just behind the front glows as an ember bed
        s.fillStyle = hx('#3a0e08', '#d0501c', .65 * hk); s.beginPath(); s.ellipse(x, yy - 2 * sc, step * .9, 16 * sc, 0, 0, TAU); s.fill();
        if (big) { // a big lick throws its own smoke column
          for (let m = 0; m < 4; m++) { const ph = (t * .25 + m / 4 + hs) % 1, px = x + lean * hh + ph * 120 * sc, py = yy - hh * (.9 + ph * 1.6), rr = (40 + ph * 130) * sc;
            s.fillStyle = `rgba(${lerp(70, 120, ph) | 0},${lerp(30, 55, ph) | 0},${lerp(24, 44, ph) | 0},${.55 * Math.sin(ph * Math.PI) * hk})`; s.beginPath(); s.ellipse(px, py, rr, rr * .7, 0, 0, TAU); s.fill(); } }
        tongue(t, x, yy, hh, tw, r * 17 + i % 97, lean);
        if (big || i % 3 === 0) glow(x + lean * hh * .5, yy - hh * .4, hh * 1.2 + 30, `rgba(255,120,40,${(big ? .16 : .1) * hk + .25 * wv})`);
      }
    }
    glow(SC, HZ + D * .3, 1800, `rgba(255,110,40,${.08 * hk})`);
  }
  // the torches the fire sinks into: a ring of small flames on the valley floor (c10's stone ring)
  function torches(t, cx, cy, rx, ry, k) {
    if (k < .01) return;
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + .2, x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * ry, sc = .7 + .3 * Math.sin(a);
      taper(s, [x, y + 4], [x, y - 34 * sc], 5 * sc, 4 * sc, '#1a0a07');
      tongue(t, x, y - 34 * sc, 42 * sc * k * (.8 + .3 * noise1(t * 3 + i, 31)), 11 * sc, i * 7 + 3);
      glow(x, y - 50 * sc, 120 * sc * k, `rgba(255,150,60,${.4 * k})`); glow(x, y - 44 * sc, 30 * sc * k, `rgba(255,230,170,${.6 * k})`); }
  }

  // ---- smoke rivers: smoke pours down the valley in winding streams, flowing toward us ----
  function smokeRivers(t, HZ, D, amt, curl = 0) {
    if (amt < .01) return;
    for (let rv = 0; rv < 3; rv++) {
      const base = [-.55, .08, .62][rv], ph = rv * 2.1, path = [];
      for (let k = 0; k <= 24; k++) { const z = .02 + k / 24 * .98, vx = base + .22 * Math.sin(z * 5.5 + ph); path.push([VX(vx, z), VY(z, HZ, D) - 20 * z, z]); }
      for (let k = 1; k < path.length; k++) { const [x0, y0, z0] = path[k - 1], [x1, y1] = path[k];
        stroke(s, [[x0, y0], [x1, y1]], `rgba(96,60,46,${.6 * amt * clamp(z0 * 6)})`, 30 + 300 * z0); }
      for (let k = 0; k < 30; k++) {
        const u = ((k / 30) + t * .07 + rv * .13) % 1, z = .03 + u * .97;
        let vx = base + .22 * Math.sin(z * 5.5 + ph) + .05 * snoise(t * .4 + k, 60 + rv);
        let x = VX(vx, z), y = VY(z, HZ, D) - 20 * z;
        if (curl > 0) { const a = curl * (4 + z * 3) + k * .3, rr = curl * 160 * z; x += Math.cos(a) * rr; y += Math.sin(a) * rr * .4; }
        const sz = (40 + 330 * z) * (.7 + .5 * hash(k * 7 + rv)), a = amt * clamp(u * 8) * clamp((1 - u) * 5);
        s.fillStyle = `rgba(${lerp(90, 150, hash(k + rv * 40)) | 0},${lerp(52, 82, hash(k + 3)) | 0},${lerp(38, 56, hash(k + 9)) | 0},${.55 * a})`;
        s.beginPath(); s.ellipse(x, y - sz * .15, sz, sz * .32, snoise(k + rv, 61) * .2, 0, TAU); s.fill();
        glow(x, y - sz * .1, sz * .9, `rgba(255,150,90,${.03 * a})`);
      }
    }
  }
  // smoke plumes rising out of the valley into the sky
  function plumes(t, HZ, a = 1, x0 = -600, x1 = STAGE + 600) {
    for (let i = 0; i < 7; i++) { const bx = lerp(x0, x1, (i + .5) / 7) + snoise(i, 62) * 120;
      for (let k = 0; k < 6; k++) { const ph = (t * .045 + k / 6 + hash(i * 9) ) % 1, x = bx + ph * 260 + Math.sin(t * .5 + i + k) * 40, y = HZ - ph * 1300, r = 90 + ph * 360;
        s.fillStyle = `rgba(${lerp(60, 110, ph) | 0},${lerp(22, 48, ph) | 0},${lerp(18, 40, ph) | 0},${.42 * a * Math.sin(ph * Math.PI)})`; s.beginPath(); s.ellipse(x, y, r, r * .6, 0, 0, TAU); s.fill(); } }
  }

  // ---- the old ones: towering rock-art glyphs rising from the smoke (glyphs only: no faces, no people) ----
  // unit shapes, feet at (0, 0), 1 = height, as polylines
  const GL = {
    antler: (() => { const L = [[[-.2, 0], [0, -.4], [.2, 0]], [[0, -.4], [0, -.8]], [[-.38, -.92], [-.32, -.66], [0, -.7], [.32, -.66], [.38, -.92]]];
      for (const d of [-1, 1]) { L.push([[d * .03, -.88], [d * .14, -1.03], [d * .3, -1.1]]); L.push([[d * .1, -.98], [d * .22, -.96]]); L.push([[d * .19, -1.06], [d * .22, -1.2]]); L.push([[d * .3, -1.1], [d * .4, -1.06]]); }
      return { lines: L, dots: [[0, -.84, .055]] }; })(),
    spiral: (() => { const p = []; for (let i = 0; i <= 80; i++) { const u = i / 80, a = u * 3.1 * TAU; p.push([Math.cos(a) * .42 * u, -.5 + Math.sin(a) * .42 * u]); } return { lines: [p, [[0, -.08], [0, 0]]], dots: [] }; })(),
    hand: (() => { const L = [], fing = [[-.2, .26, -.18], [-.07, .32, -.05], [.06, .34, .05], [.18, .29, .16]];
      const palm = []; for (let i = 0; i <= 24; i++) { const a = i / 24 * TAU; palm.push([Math.cos(a) * .24, -.3 + Math.sin(a) * .26]); } L.push(palm);
      for (const [fx, len, ang] of fing) L.push([[fx, -.5], [fx + Math.sin(ang) * len, -.5 - Math.cos(ang) * len]]);
      L.push([[.22, -.28], [.36, -.45], [.42, -.58]]); L.push([[-.08, -.02], [-.08, .1]], [[.08, -.02], [.08, .1]]);
      return { lines: L, dots: [] }; })(),
    snake: (() => { const p = []; for (let i = 0; i <= 40; i++) { const u = i / 40; p.push([Math.sin(u * 5 * Math.PI) * .12 * (.4 + .6 * u), -u]); } return { lines: [p], dots: [[0, -1.03, .05]] }; })(),
  };
  // draws one glyph: base (x, y), height H, light k 0..1, cut = the smoke line it rises through (world y)
  function glyph(t, type, x, y, H, k, cut = 1e9, rot = 0) {
    if (k < .01) return;
    const G = GL[type], w = Math.max(10, H * .045), fl = .85 + .15 * noise1(t * 3 + x * .01, 81);
    // pecked, hand-painted lines: every point wobbles a little (fixed per glyph, so it doesn't crawl)
    const tr = (p, i = 0) => { const c = Math.cos(rot), sn = Math.sin(rot), jx = snoise(i * .9 + p[0] * 7, 83) * .014, jy = snoise(i * .9 + p[1] * 7, 84) * .014; return [x + ((p[0] + jx) * c - (p[1] + jy) * sn) * H, y + ((p[0] + jx) * sn + (p[1] + jy) * c) * H]; };
    for (const g of [s, f]) { g.save(); g.beginPath(); g.rect(x - H * 2, y - H * 3, H * 4, cut - (y - H * 3)); g.clip(); }
    f.globalCompositeOperation = 'lighter';
    for (const L of G.lines) { const pts = [];
      for (let i = 1; i < L.length; i++) for (let q = 0; q < 3; q++) { const u = q / 3; pts.push(tr([lerp(L[i - 1][0], L[i][0], u), lerp(L[i - 1][1], L[i][1], u)], i * 3 + q)); }
      pts.push(tr(L[L.length - 1], L.length * 3));
      s.save(); s.globalAlpha *= clamp(k * 1.6); stroke(s, pts, hx('#6a2410', '#f4b060', k), w * 1.2); s.restore();
      stroke(f, pts, `rgba(255,130,50,${.12 * k * fl})`, w * 3.2); stroke(f, pts, `rgba(255,200,130,${.24 * k * fl})`, w * 1.1); stroke(f, pts, `rgba(255,240,210,${.14 * k * fl})`, w * .35); }
    for (const [dx, dy, r] of G.dots) { const p = tr([dx, dy]); dot(s, p[0], p[1], r * H, hx('#8a3a18', '#ffd08a', k)); glow(p[0], p[1], r * H * 2.6, `rgba(255,200,130,${.4 * k * fl})`); }
    for (const g of [s, f]) g.restore();
    glow(x, y - H * .5, H * .9, `rgba(255,130,50,${.08 * k})`);
  }
  // the standing set of glyphs over the valley; rise 0..1 lifts them out of the smoke
  const LAYOUTS = [
    [['spiral', -.2, .3, 820, 0], ['antler', .42, .2, 860, .35], ['hand', -.68, .18, 620, .2], ['snake', .95, .12, 640, .6], ['antler', -.02, .08, 460, .5], ['spiral', -1.05, .1, 420, .8]],
    [['hand', -.35, .28, 900, 0], ['snake', .15, .16, 760, 0], ['antler', -.9, .14, 700, 0], ['spiral', .75, .2, 560, 0]],   // the third call: a towering hand leads
    [['antler', .05, .34, 1100, 0], ['spiral', -.62, .16, 700, 0], ['spiral', .72, .14, 520, 0], ['hand', 1.1, .1, 480, 0], ['snake', -1.1, .08, 460, 0]], // the last: one great antlered sign, spirals either side
  ];
  function oldOnes(t, HZ, D, rise, light = 1, spin = 0, layout = 0) {
    if (rise <= 0) return;
    const set = LAYOUTS[layout];
    for (const [type, vx, z, H, dl] of set) { const r = ease.out(inv(dl * .4, dl * .4 + .9, rise)); if (r <= 0) continue;
      const bx = VX(vx, z), by = VY(z, HZ, D), sc = .45 + z * .9, hh = H * sc, cut = by - 10;
      const lift = hh * (1 - r) * 1.05 + Math.sin(t * .8 + vx * 5) * 10;
      glyph(t, type, bx, by - 40 * sc + lift, hh, light * r * (.75 + .5 * waveAt(t, bx)), cut, type === 'spiral' ? spin : 0); }
  }

  // ---- the mesa rim: a dark rock ledge we stand on; side = -1 juts in from the left, 1 from the right ----
  function rim(t, y, edgeX, side, heat = 1) {
    const far = side < 0 ? -900 : STAGE + 900, pts = [];
    for (let k = 0; k <= 24; k++) { const x = lerp(far, edgeX, k / 24); pts.push([x, y + (noise1(x * .01, 95) - .5) * 22 + (k > 20 ? (k - 20) * 6 : 0)]); }
    const e = pts[pts.length - 1];
    s.fillStyle = '#170705'; s.beginPath(); s.moveTo(far, y + 2200); for (const p of pts) s.lineTo(p[0], p[1]);
    s.lineTo(e[0] - side * 40, e[1] + 90); s.lineTo(e[0] - side * 20, e[1] + 260); s.lineTo(e[0] - side * 90, e[1] + 600); s.lineTo(e[0] - side * 70, y + 2200); s.closePath(); s.fill();
    // strata catching the uplight on the cliff face
    s.fillStyle = 'rgba(120,34,16,.55)'; for (let k = 0; k < 4; k++) { const yy = e[1] + 120 + k * 120; s.beginPath(); s.moveTo(e[0] - side * (30 + k * 12), yy); s.lineTo(e[0] - side * (180 + k * 30), yy + 16); s.lineTo(e[0] - side * (180 + k * 30), yy + 34); s.lineTo(e[0] - side * (36 + k * 12), yy + 22); s.fill(); }
    // the lip lit by the fire below
    f.save(); f.globalCompositeOperation = 'lighter'; stroke(f, pts.slice(8), `rgba(255,150,70,${.4 * heat})`, 5); f.restore();
    glow(e[0], e[1] + 100, 420 * heat, `rgba(255,110,40,${.12 * heat})`);
  }
  // him, backlit: a halo of fire light behind, the light layer blacked out under his silhouette (the
  // valley glow would otherwise shine through him), then the figure with its own rim light on top
  function him(t, x, y, h, o, halo = .5) {
    if (halo > 0) { glow(x, y - h * .55, h * 1.1, `rgba(255,150,70,${.3 * halo})`); glow(x, y - h * .8, h * .55, `rgba(255,200,120,${.25 * halo})`); }
    occlude(() => wyrd(t, x, y, h, { ...o, sil: true, g: f, rim: null, eye: 0 }));
    return wyrd(t, x, y, h, o);
  }
  // ash and sparks lifted by the heat
  function ash(t, x, y, spread, rise, n, a) { sparks(t, x, y, spread, rise, n, a, 19); }

  // 1 · "dream ... flame": c8's sunrise flare burns off and the blaze is under it: a high wide over the valley
  function blaze(t, lt, dur) {
    const z = kf(lt, [[0, 1.3], [dur, 1.0]], ease.out), cy = kf(lt, [[0, 1040], [dur, 1000]], ease.inOut);
    frame(kf(lt, [[0, SC - 50], [dur, SC + 30]]), pick(cy, cy + 150), pick(z, z * .82));
    const HZ = 760, D = 1300, surge = hit(t, tFlame, 1.3);
    burnSky(t, HZ, { ignite: .15 + .2 * surge, sun: 1 - ease.inOut(inv(A, A + 2.2, t)), sunX: SC + 120 });
    plumes(t, HZ, .7);
    valley(t, HZ, D, { heat: kf(lt, [[0, .55], [1.4, .9]]) + .45 * surge });
    rim(t, 1530, SC - 40, 1, 1);
    him(t, SC + 230, 1532, 380, { view: 'sil', guitar: 'play', wind: .65 }, .9);
    ash(t, SC, 1500, 1600, 900, 50, .5 + .4 * surge);
    // the handoff: our own warm gold flare (not white) that c8's sunrise breaks into, burning off over ~1.2 s
    const fl = clamp(1 - lt / 1.3); const fk = fl * fl;
    glow(SC + 120, HZ - 180, 2000 * fk, `rgba(255,130,40,${.28 * fk})`); glow(SC + 120, HZ - 180, 600 * fk, `rgba(255,190,90,${.3 * fk})`);
    flash(fk * .16, '#c8641c');
    paintSet({ bloom: 1.2 + .25 * fk + .3 * surge, tint: [1, .78, .45], tintK: .35 * fk });
  }

  // 2 · "blazing high ... calling my name": he plays on the rim, low angle, the valley fire leaping up behind him
  function playRim(t, lt, dur) {
    const z = kf(lt, [[0, 1.02], [dur, 1.14]], ease.inOut);
    frame(kf(lt, [[0, SC - 80], [dur, SC + 50]]), pick(kf(lt, [[0, 1090], [dur, 1040]]), 1070), pick(z, z * .7), kf(lt, [[0, .018], [dur, -.012]]));
    burnSky(t, 1620, { ignite: .3 });
    plumes(t, 1650, .9);
    const leap = ease.back(inv(tBlaze - .15, tBlaze + .6, t)) * (1 - .4 * inv(tBlaze + 1.2, tBlaze + 3, t));
    flameWall(t, 1720, 420 + 520 * leap, .7 + .3 * leap, -700, STAGE + 700, 11, 20);
    rim(t, 1560, SC + 900, -1, 1);
    him(t, SC, 1560, 900, { turn: -.2, sing: 1, wind: .55, lit: .04, rim: 'rgba(255,165,85,.95)', guitar: 'play' });
    ash(t, SC, 1700, 1800, 1300, 60, .5 + .4 * leap);
    paintSet({ bloom: 1.25 + .3 * leap });
  }

  // 3 · "smoke like rivers ... sky on fire": high over the valley, smoke pours down it and the sky ignites
  function rivers(t, lt, dur) {
    const z = kf(lt, [[0, 1.02], [dur, 1.12]], ease.inOut);
    frame(kf(lt, [[0, SC + 110], [dur, SC - 60]]), pick(kf(lt, [[0, 1030], [dur, 980]]), 1100), pick(z, z * .8));
    const HZ = 680, D = 1350, ign = ease.inOut(inv(tSky - .25, tFire + .5, t)), sm = ease.out(inv(tSmoke - .35, tRivers + .8, t));
    burnSky(t, HZ, { ignite: .2 + .8 * ign, heat: 1 + .3 * ign });
    plumes(t, HZ, .5 + .5 * sm);
    valley(t, HZ, D, { heat: .95 });
    smokeRivers(t, HZ, D, sm);
    rim(t, 1650, SC - 250, -1, 1);
    him(t, SC - 420, 1652, 130, { view: 'sil', guitar: 'play', wind: .7 });
    flash(hit(t, tFire, 3) * .12 * ign, '#ffb060');
  }

  // 4 · "the old ones rise": from behind him on the rim, glyphs tower up out of the smoke; the first call's wave
  function oldRise(t, lt, dur) {
    const z = kf(lt, [[0, .98], [dur, .9]], ease.inOut);
    frame(kf(lt, [[0, SC - 40], [dur, SC + 40]]), pick(kf(lt, [[0, 1230], [1.9, 960], [dur, 930]], ease.inOut), kf(lt, [[0, 1260], [dur, 1060]])), pick(z, z * .78));
    const HZ = 1020, D = 950, rise = inv(tOld - .1, tRise + 1.9, t), sw = waveSwell(t);
    burnSky(t, HZ, { ignite: .4 + .1 * sw, heat: .85 + .1 * sw });
    plumes(t, HZ, .7);
    valley(t, HZ, D, { heat: .8 });
    smokeRivers(t, HZ, D, .7);
    oldOnes(t, HZ, D, rise, .8 + .15 * sw);
    waveBand(t, HZ + 20, HZ + D * .55, 420);
    rim(t, 1660, SC - 40, 1, 1 + sw);
    him(t, SC + 250, 1662, 560, { view: 'back', guitar: 'none', arms: 'down', wind: .8, lit: .1, rim: `rgba(255,${170 + 60 * sw | 0},90,.95)` });
    paintSet({ bloom: 1.05 + .15 * sw });
  }

  // 5 · close-up, veiled, 3/4, singing the second call; the wave of light passes behind his shoulders
  function sing1(t, lt, dur) {
    const x = SC, y = 2100, h = 1500, headY = y - h * .905, sw = waveSwell(t);
    const zoom = kf(lt, [[0, 1.34], [dur, 1.5]], ease.inOut);
    frame(x + kf(lt, [[0, pick(-60, 60)], [dur, pick(30, 160)]]), headY + h * kf(lt, [[0, .2], [dur, .15]]) - pick(0, h * .06), pick(zoom, zoom * .62));
    burnSky(t, headY + 700, { ignite: 1, heat: 1.1 + .4 * sw });
    glyph(t, 'antler', x + pick(300, 430), headY + 260, 540, .8 + .4 * waveAt(t, x + 300), headY + 280);
    glyph(t, 'spiral', x - 470, headY + 300, 420, .7 + .4 * waveAt(t, x - 470), headY + 350, t * .2);
    plumes(t, headY + 900, .6, x - 1400, x + 1400);
    flameWall(t, headY + 1000, 520, .8, x - 1500, x + 1500, 23, 14);
    waveBand(t, headY + 380, headY + 900, 500);
    him(t, x, y, h, { turn: .3, sing: 1, wind: .45, lit: .03, guitar: 'play', rim: `rgba(255,${160 + 80 * sw | 0},${80 + 90 * sw | 0},.95)` }, .15);
    ash(t, x, headY + 600, 1400, 1100, 40, .6);
  }

  // 6 · the third call: a side wide, him on the point of the rim, the biggest wave sweeping the burning valley
  function third(t, lt, dur) {
    const z = kf(lt, [[0, .98], [dur, 1.07]], ease.inOut);
    frame(kf(lt, [[0, SC - 90], [dur, SC + 50]]), pick(kf(lt, [[0, 1060], [dur, 1010]]), 1080), pick(z, z * .8));
    const HZ = 880, D = 1000, sw = waveSwell(t), same = hit(t, tSame, 2.5);
    burnSky(t, HZ, { ignite: .4 + .1 * sw, heat: .85 + .1 * sw });
    plumes(t, HZ, .7);
    valley(t, HZ, D, { heat: .8 + .25 * hit(t, tFlame2, 2) });
    smokeRivers(t, HZ, D, .65);
    oldOnes(t, HZ, D, 1, .8 + .15 * sw + .3 * same, 0, 1);
    waveBand(t, HZ + 20, HZ + D * .6, 460);
    rim(t, 1560, SC + 40, 1, 1 + sw);
    him(t, SC + 250, 1562, 430, { turn: -.1, wind: .75, lit: .05, guitar: 'play', rim: 'rgba(255,170,90,.95)' });
    paintSet({ bloom: 1.05 + .15 * sw });
  }

  // 7 · the gap after "same": close on him playing, hunched over the guitar, flames and sparks around
  function playClose(t, lt, dur) {
    const z = kf(lt, [[0, 1.18], [dur, 1.4]], ease.inOut), bp = beatPulse(t, 5);
    frame(kf(lt, [[0, SC + 10], [dur, SC - 40]]), pick(kf(lt, [[0, 1180], [dur, 1120]]), 1080), pick(z, z * .62), kf(lt, [[0, -.02], [dur, .01]]));
    burnSky(t, 1900, { ignite: 1, heat: 1.1 });
    glyph(t, 'spiral', SC - 380, 1000, 380, .8, 1020, -t * .25);
    glyph(t, 'antler', SC + 350, 920, 440, .75 + .25 * bp, 940);
    plumes(t, 1800, .8);
    flameWall(t, 1860, 700 + 160 * bp, .9, -500, STAGE + 500, 29, 16);
    him(t, SC - 60, 2000, 1250, { turn: -.35, sing: 1, wind: .5, lit: .04, guitar: 'play', rim: 'rgba(255,170,90,.95)' }, .2);
    ash(t, SC, 1700, 1300, 1300, 60, .5 + .4 * bp);
    paintSet({ bloom: 1.2 + .2 * bp });
  }

  // 8 · the last call, "changes": the valley wide again and the paint itself swirls, the smoke curling into it
  function changes(t, lt, dur) {
    const d = ease.inOut(inv(tChanges - .3, tChanges + 1.3, t)) * (1 - .5 * ease.inOut(inv(Z - 3, Z - 1.9, t)));
    const z = kf(lt, [[0, 1.0], [dur, 1.12]], ease.inOut);
    frame(SC, pick(kf(lt, [[0, 1020], [dur, 1060]]), 1090), pick(z, z * .8), -.03 + .11 * d);
    const HZ = 840, D = 1050, sw = waveSwell(t);
    burnSky(t, HZ, { ignite: .4 + .1 * sw, heat: .85 + .1 * sw });
    plumes(t, HZ, .7);
    valley(t, HZ, D, { heat: .8 });
    smokeRivers(t, HZ, D, .75, d);
    oldOnes(t, HZ, D, 1, .8 + .15 * sw, 2.5 * d, 2);
    waveBand(t, HZ + 20, HZ + D * .6, 460);
    rim(t, 1600, SC + 320, -1, 1 + sw);
    him(t, SC + 140, 1602, 340, { turn: .1, wind: .8, lit: .05, guitar: 'play', rim: 'rgba(255,170,90,.95)' });
    paintSet({ bloom: 1.05 + .15 * sw, flowK: 1.3 + 3.4 * d, boil: 10 + 7 * d, strokeK: 1.25 + .7 * d });
  }

  // 9 · "seeing ... name": from behind him, the valley fire sinks away to a ring of torch points; night comes on (c10)
  function sink(t, lt, dur) {
    const k = ease.inOut(inv(tSeeing - .1, Z - .2, t)), z = kf(lt, [[0, .98], [dur, 1.22]], ease.inOut);
    const HZ = 960, D = 1000, ringX = SC + 60, ringY = VY(.45, HZ, D);
    frame(lerp(SC - 30, ringX, k * .6), pick(lerp(1150, 1100, k), lerp(1150, 1120, k)), pick(z, z * .8));
    burnSky(t, HZ, { ignite: 1 - k, night: k * .85, heat: 1 - k * .6 });
    plumes(t, HZ, .7 * (1 - k * .5));
    valley(t, HZ, D, { heat: 1, sink: k });
    smokeRivers(t, HZ, D, .9 * (1 - k * .7));
    oldOnes(t, HZ, D, 1, 1 - k, 0, 2);
    torches(t, ringX, ringY, 190, 44, ease.out(inv(tSeeing + .2, tSeeing + 1.2, t)));
    rim(t, 1650, SC + 280, -1, 1 - k * .7);
    him(t, SC - 250, 1652, 480, { view: 'back', guitar: 'none', arms: 'down', wind: .7 - .4 * k, lit: .08, rim: `rgba(255,150,80,${.95 - .5 * k})` });
    ash(t, SC, 1500, 1500, 900, 40, .5 * (1 - k * .5));
    paintSet({ sat: 1.15 - .35 * k, bloom: 1.2 + .4 * k });
  }

  chapter('allaflame', A, Z, [
    [A, blaze, { xin: .35 }],
    [tBlaze - .25, playRim],
    [tSmoke - .2, rivers],
    [tOld - .25, oldRise],
    [tC2 - 1.1, sing1],
    [tC3 - .5, third],
    [tSame + .6, playClose],
    [tC4 - .05, changes],
    [tSeeing - .15, sink],
  ], { paint: LOOK.sunset });
})();
