// LOOK PROBE: watercolour bleed. 37.7 - 56.0 ("bottle full of rain" into the first four "clap hands").
// Drawing model: the 2D canvas is white paper; every wash multiplies over it like a transparent glaze,
// and lights are paper left bare (or lifted back out with white). The shader then bleeds the washes
// into wet paper, pools pigment at the drying edges, granulates the darks and lays it on cold-press.
const LOOK = {
  span: [37.7, 56.0],
  frag: `
uniform float wet, seed, runs;
vec3 A(vec3 c){ return -log(max(c, vec3(.03))); }          // colour -> pigment absorbance
void main(){
  float ts = tq * .37;                                       // the paint re-settles on twos
  vec2 big = fbm2(uv * vec2(3.2, 5.6) + seed);
  vec2 q = uv + big * .006 * (.5 + wet) + fbm2(uv * vec2(30., 52.) + ts) * .0016;   // ragged, wobbling edges
  vec3 a0 = A(texture(src, q).rgb);
  vec3 a1 = A(textureLod(src, q, 1.5).rgb);
  // soft wet halo: a disc of jittered mid-level taps (one coarse mip level reads as blocks)
  vec2 qw = q + big * .02 * wet + vec2(0., -.006 * runs); float rad = .012 + .016 * wet; vec3 aw = vec3(0.);
  for (int i = 0; i < 12; i++) { float an = float(i) * 2.39996 + seed, r = sqrt((float(i) + .5) / 12.) * rad; aw += A(textureLod(src, qw + vec2(cos(an), sin(an) * .5625) * r, 3.).rgb); }
  aw /= 12.;
  // wet-in-wet: pigment creeps out past the shape into damp paper, along a fractal front
  float front = smoothstep(.35, .75, fbm(uv * vec2(9., 15.) + seed * 2.) + wet * .35);
  vec3 a = a0 + max(aw - a0, 0.) * front * (.4 + wet * .8);
  // the drying edge: pigment pools where the wash ends (inside rim darker)
  a += max(a0 - a1, 0.) * 2.2;
  // mottling: a wash is never flat
  a *= .72 + .56 * fbm(uv * vec2(4., 7.) + seed * 5. + ts * .15);
  // back-runs (cauliflower blooms) in the wet
  float br = fbm(uv * vec2(6., 10.) + seed * 3.1);
  a *= 1. + smoothstep(.025, 0., abs(br - .52)) * wet * .35 * smoothstep(.1, .4, a.r + a.g + a.b);   // dark tide lines, only inside pigment
  // granulation: pigment settles into the paper's grain, more in the dark washes
  float gr = vn(uv * res * .38 + seed) * .6 + vn(uv * res * .12 + 7.) * .4;
  a *= .8 + .45 * gr;
  float fib = vn(uv * res * .22) * .5 + vn(uv * res * .05 + 3.) * .5, tooth = vn(uv * res * .45);
  a *= 1. - smoothstep(.7, 1., tooth) * .35;                  // light washes skip the tooth
  vec3 paper = vec3(.968, .948, .905) * (.94 + .06 * fib);
  vec3 col = paper * exp(-a);
  vec2 v = uv - .5; col *= 1. - dot(v, v) * .3;
  o = vec4(col, 1.);
}`,
  uniforms: (t, X) => ({ wet: X.wet ?? .5, seed: X.seed ?? 1, runs: X.runs ?? 0 }),
};

(() => {
  // ---- paint helpers (all multiply glazes on white) ----
  const C = {
    indigo: '#5b6a9c', payne: '#4a5466', ultra: '#3d55b8', alizarin: '#c23a5a', rose: '#e07a8c',
    ochre: '#e0b25a', sienna: '#c46a3a', umber: '#6e4e3a', sap: '#6f9a4a', viridian: '#3f8f7f', cad: '#f08a2a', lemon: '#f2dc6a',
  };
  function glaze(fn, a = 1) { s.save(); s.globalCompositeOperation = 'multiply'; s.globalAlpha = a; fn(); s.restore(); }
  function lift(fn, a = 1) { s.save(); s.globalCompositeOperation = 'source-over'; s.globalAlpha = a; s.fillStyle = '#fff'; s.strokeStyle = '#fff'; fn(); s.restore(); }
  // subdivide a polygon and nudge each point by noise, so no wash has a ruler edge
  function wob(pts, amp = 7, seed = 0) {
    const o = []; const n = pts.length;
    for (let i = 0; i < n; i++) { const p0 = pts[i], p1 = pts[(i + 1) % n], L = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]), k = Math.max(1, Math.round(L / 24));
      for (let j = 0; j < k; j++) { const u = j / k, x = lerp(p0[0], p1[0], u), y = lerp(p0[1], p1[1], u); o.push([x + snoise(x * .013 + y * .007, seed) * amp, y + snoise(y * .013 - x * .005, seed + 3) * amp]); } }
    return o;
  }
  const wash = (pts, c, a = 1, amp = 7, seed = 0) => glaze(() => poly(wob(pts, amp, seed), c), a);
  // a loose blot: three offset wobbly blobs, a deeper core
  function blot(x, y, r, c, seed, a = .8, sq = 1) {
    glaze(() => { for (let i = 0; i < 3; i++) poly(blobPts(x + snoise(seed + i, 3) * r * .15, y + snoise(seed + i, 5) * r * .15, r * (1 - i * .18), r * sq * (1 - i * .18), seed * 7 + i, .22), c); }, a * .45);
  }
  // pigment bloom: a splash that spreads with age and runs downward
  function bloom(x, y, r, cols, seed, age, a = 1) {
    if (age < 0) return;
    const g = ease.out(clamp(age / 1.1)), R = r * (.25 + .75 * g), rr = rng(seed);
    cols.forEach((c, i) => blot(x + (rr() - .5) * r * .5, y + (rr() - .5) * r * .4, R * (1 - i * .22), c, seed + i * 11, a * (1 - .25 * i)));
    // spatter
    glaze(() => { for (let i = 0; i < 26; i++) { const an = rr() * TAU, d = R * (1 + rr() * .9) * g, sz = (4 + rr() * 22) * (1 - rr() * .5); dot(x + Math.cos(an) * d, y + Math.sin(an) * d * .9, sz * (.4 + g * .6), cols[i % cols.length]); } }, a * .6);
    // runs: drips grow down from the bloom's lower edge
    glaze(() => { for (let i = 0; i < 7; i++) { const dx = (rr() - .5) * R * 1.4, L = (60 + rr() * 260) * ease.out(clamp((age - .25) / 2.5)), w = 6 + rr() * 14; if (L > 2) { line([[x + dx, y + R * .4], [x + dx + snoise(i, seed) * 8, y + R * .4 + L]], cols[i % cols.length], w); dot(x + dx, y + R * .4 + L, w * .8, cols[i % cols.length]); } } }, a * .5);
  }
  // rain lifted out of the wash: falling white streaks
  function rain(t, n, seed, ang = .12, len = 70, a = .55, sp = 2600) {
    const r = rng(seed);
    lift(() => { s.lineCap = 'round'; for (let i = 0; i < n; i++) { const x0 = r() * (W + 600) - 300, ph = r(), v = sp * (.7 + r() * .6), w = 1.5 + r() * 3; const y = ((ph * (H + 400) + t * v) % (H + 400)) - 200, x = x0 + y * Math.tan(ang); s.lineWidth = w; s.globalAlpha = a * (.4 + r() * .6); s.beginPath(); s.moveTo(x, y); s.lineTo(x - Math.tan(ang) * len, y - len); s.stroke(); } });
  }
  // a pen line over the washes: sepia ink, wobbling on twos
  function ink(pts, w = 3, c = '#3a2a22', a = .85, t = 0, seed = 0) {
    const q = onTwos(t), j = pts.map(([x, y], i) => [x + snoise(i * .7 + q * 9, seed) * 2.2, y + snoise(i * .7 + q * 9, seed + 4) * 2.2]);
    glaze(() => line(j, c, w), a);
  }
  // a painted hand: flesh wash, cool shadow wash, pen outline
  function hand(t, x, y, sc, o, seed = 0, tone = C.ochre) {
    const h = handShape(x, y, sc, o), parts = [h.palm, ...h.fingers, h.thumb];
    lift(() => [...parts, h.cuff].forEach((p) => { s.beginPath(); p.forEach(([px, py], i) => i ? s.lineTo(px, py) : s.moveTo(px, py)); s.closePath(); s.fill(); }), .92);
    parts.forEach((p, i) => wash(p, tone, .5 + .1 * hash(seed + i)));
    glaze(() => { s.save(); s.translate(sc * .08 * (o.dir || 1), sc * .05); parts.forEach((p) => poly(p, C.sienna)); s.restore(); }, .18);
    wash(h.cuff, C.payne, .55);
    parts.forEach((p, i) => ink([...p, p[0]], Math.max(2, sc * .02), '#3a2a22', .7, t, seed + i));
  }
  // two hands clapping at (cx, cy); k = clap time. gap closes into the hit, bounces off after.
  function clapPair(t, cx, cy, sc, k, { tone = C.ochre, tilt = .18, seed = 0, wide = 1 } = {}) {
    // palms to camera, thumbs out; fingertips lean in and meet on the clap
    const lt = t - k;
    const gap = (lt < 0 ? lerp(0, 1, ease.in(clamp(-lt / .42))) : lerp(0, .5, ease.out(clamp(lt / .5))) * (lt > .5 ? 1 - .25 * ease.inOut(clamp((lt - .5) / 1.2)) : 1)) * sc * wide;
    const sq = hit(t, k, 14) * .1;
    hand(t, cx - gap - sc * .62, cy + sc * .9, sc * (1 - sq), { dir: -1, rot: tilt + sq, spread: .12 }, seed, tone);
    hand(t, cx + gap + sc * .62, cy + sc * .9, sc * (1 - sq), { dir: 1, rot: -tilt - sq, spread: .12 }, seed + 20, tone);
  }

  // ---- shots ----
  // 37.7 "hangin' out the window with a bottle full of rain": a tenement window at night, rain, the bottle filling
  function window_(t, lt, dur) {
    const z = kf(lt, [[0, 1.0], [dur, 1.35]], ease.inOut), cy = kf(lt, [[0, 900], [dur, 1060]]);
    cam(540, cy, z);
    s.fillStyle = '#fff'; s.fillRect(-W, -H, W * 3, H * 3);
    // night sky wash, graded
    glaze(() => { s.fillStyle = vgrad(-200, 900, [[0, C.indigo], [1, '#aab3cc']]); s.fillRect(-400, -400, W + 800, 1300); }, .85);
    // tenement wall: burnt sienna + payne, with brick blots
    wash([[-300, 260], [1380, 220], [1380, 2400], [-300, 2400]], C.sienna, .55);
    wash([[-300, 260], [1380, 220], [1380, 2400], [-300, 2400]], C.payne, .35);
    const r = rng(4); glaze(() => { for (let i = 0; i < 60; i++) { const bx = r() * 1500 - 200, by = 300 + r() * 1900; if (bx > 230 && bx < 850 && by > 560 && by < 1380) continue; s.fillStyle = C.umber; s.fillRect(bx, by, 70 + r() * 40, 26); } }, .25);
    // the window: warm reserved paper, ochre glow, dark frame
    const wx = 260, wy = 600, ww = 560, wh = 740;
    lift(() => s.fillRect(wx, wy, ww, wh), 1);
    glaze(() => { s.fillStyle = rgrad(wx + ww / 2, wy + wh * .55, 20, 520, [[0, '#fff6d8'], [.6, C.ochre], [1, C.sienna]]); s.fillRect(wx, wy, ww, wh); }, .55);
    // a figure-less room: a hanging bulb, warm
    glaze(() => { dot(wx + ww * .62, wy + 200, 26, C.lemon); line([[wx + ww * .62, wy], [wx + ww * .62, wy + 175]], C.umber, 4); }, .8);
    // frame and sill
    wash([[wx - 30, wy - 30], [wx + ww + 30, wy - 30], [wx + ww + 30, wy], [wx - 30, wy]], C.umber, .8);
    wash([[wx + ww / 2 - 10, wy], [wx + ww / 2 + 10, wy], [wx + ww / 2 + 10, wy + wh], [wx + ww / 2 - 10, wy + wh]], C.umber, .7);
    wash([[wx - 60, wy + wh], [wx + ww + 60, wy + wh], [wx + ww + 80, wy + wh + 50], [wx - 80, wy + wh + 50]], C.payne, .85);
    // the bottle on the sill, filling with rain
    const bx = 620, by = wy + wh, bh = 300, bw = 110, fillK = kf(lt, [[0, .12], [dur - .2, .92]], ease.inOut);
    const bottle = [[bx - bw / 2, by], [bx - bw / 2, by - bh * .62], [bx - bw * .18, by - bh * .8], [bx - bw * .16, by - bh], [bx + bw * .16, by - bh], [bx + bw * .18, by - bh * .8], [bx + bw / 2, by - bh * .62], [bx + bw / 2, by]];
    wash(bottle, C.sap, .45);
    const lvl = by - bh * .62 * fillK; withT(() => { s.beginPath(); bottle.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y)); s.clip(); wash([[bx - 200, lvl + Math.sin(t * 7) * 4], [bx + 200, lvl - Math.sin(t * 7) * 4], [bx + 200, by], [bx - 200, by]], C.viridian, .55); });
    lift(() => { s.fillRect(bx - bw * .32, by - bh * .58, 12, bh * .45); }, .7);
    ink([...bottle, bottle[0]], 3, '#2a3a2a', .7, t, 9);
    // drops landing in its neck, on the beat
    const bi = lastBeat(t), bt = FEAT.beats[bi] || 0, dk = clamp((t - bt) / .35);
    if (dk < 1) lift(() => dot(bx, lerp(by - bh - 220, by - bh, dk * dk), 8, '#fff'), .8);
    rain(t, 140, 7, .1, 80, .55);
    fx({ wet: .45 + .2 * beatPulse(t, 4), seed: 2.3, runs: .3 });
  }
  // CLAP 1 (41.6): the hands meet in the rain, ultramarine and alizarin burst out of the clap and run
  function clap1(t, lt, dur) {
    const z = kf(lt, [[0, 1.25], [.5, 1.05], [dur, .92]], ease.out), cy = kf(lt, [[0, 960], [dur, 840]]);
    cam(540, cy + Math.sin(t * 1.7) * 10, z, Math.sin(t * .9) * .02);
    s.fillStyle = '#fff'; s.fillRect(-W, -H, W * 3, H * 3);
    glaze(() => { s.fillStyle = vgrad(-200, 2200, [[0, '#c6cde0'], [1, '#e9e2d4']]); s.fillRect(-500, -500, W + 1000, H + 1000); }, 1);
    const k = CLAPS[0], k2 = HANDS[0];
    bloom(540, 860, 420, [C.ultra, C.alizarin, C.indigo], 31, t - k, .75);
    bloom(640, 760, 260, [C.rose, C.cad], 47, t - k2, .8);
    clapPair(t, 540, 860, 230, k, { tone: C.ochre, seed: 3, tilt: .18 });
    rain(t, 110, 11, .08, 90, .5);
    fx({ wet: .5 + .4 * hit(t, k, 1.5), seed: 4.1, runs: .2 + .8 * inv(k, k + 3, t) });
  }
  // CLAP 2 (46.0): down at the street, the clap over a puddle; lamplight cadmium, rings in the water
  function clap2(t, lt, dur) {
    const z = kf(lt, [[0, .95], [dur, 1.12]]), cx = kf(lt, [[0, 500], [dur, 580]]);
    cam(cx, 1000, z);
    s.fillStyle = '#fff'; s.fillRect(-W, -H, W * 3, H * 3);
    // night street: payne above, wet pavement below with a streetlamp reflection
    glaze(() => { s.fillStyle = vgrad(-300, 1300, [[0, C.payne], [1, C.indigo]]); s.fillRect(-500, -500, W + 1000, 1800); }, .9);
    glaze(() => { s.fillStyle = vgrad(1250, 2400, [[0, C.indigo], [1, C.payne]]); s.fillRect(-500, 1250, W + 1000, 1300); }, .75);
    // the streetlamp: bare paper with a cadmium halo, its column of reflection in the wet street
    lift(() => { dot(860, 380, 70, '#fff'); s.fillRect(830, 1300, 60, 700); }, .95);
    glaze(() => { s.fillStyle = rgrad(860, 380, 30, 420, [[0, '#fff3c0'], [.5, C.cad], [1, 'rgba(240,138,42,0)']]); s.fillRect(300, -100, 1100, 1000); }, .6);
    glaze(() => { for (let i = 0; i < 9; i++) { const yy = 1320 + i * 80, wv = Math.sin(t * 3 + i) * 20; s.fillStyle = C.cad; s.fillRect(800 + wv, yy, 120 - i * 6, 30); } }, .45);
    wash([[835, 450], [885, 450], [880, 1290], [840, 1290]], C.payne, .9);
    // puddle and rings from the clap
    const k = CLAPS[1], k2 = HANDS[1];
    glaze(() => { s.fillStyle = C.indigo; s.beginPath(); s.ellipse(440, 1500, 380, 90, 0, 0, TAU); s.fill(); }, .5);
    for (let i = 0; i < 4; i++) { const age = t - k - i * .25; if (age > 0) { const R = 40 + age * 260, a = clamp(1 - age / 2.2); lift(() => { s.lineWidth = 6; s.globalAlpha = a * .7; s.beginPath(); s.ellipse(440, 1500, R, R * .24, 0, 0, TAU); s.stroke(); }); } }
    bloom(440, 1420, 300, [C.cad, C.alizarin], 61, t - k2, .8);
    clapPair(t, 440, 1000, 210, k, { tone: C.rose, seed: 7, tilt: .16 });
    rain(t, 170, 13, .14, 80, .5);
    fx({ wet: .45 + .35 * hit(t, k, 2), seed: 6.7, runs: .3 });
  }
  // CLAP 3 (50.0): the whole street claps: a row of hands along a wet horizon, viridian and rose
  function clap3(t, lt, dur) {
    const z = kf(lt, [[0, 1.2], [dur, .95]], ease.out);
    cam(540, 1000, z);
    s.fillStyle = '#fff'; s.fillRect(-W, -H, W * 3, H * 3);
    glaze(() => { s.fillStyle = vgrad(-300, 2300, [[0, '#9fb0c4'], [.55, '#e4d9c6'], [1, '#c7b9a6']]); s.fillRect(-500, -500, W + 1000, H + 1000); }, 1);
    // rooftops in payne, a water tower
    wash([[-400, 900], [-80, 900], [-80, 760], [160, 760], [160, 860], [420, 860], [420, 700], [700, 700], [700, 820], [1000, 820], [1000, 640], [1500, 640], [1500, 1300], [-400, 1300]], C.payne, .7);
    wash([[760, 420], [920, 420], [940, 560], [740, 560]], C.umber, .7); line([[770, 560], [760, 700]], C.umber, 8); line([[910, 560], [920, 700]], C.umber, 8);
    const k = CLAPS[2], k2 = HANDS[2];
    bloom(540, 700, 520, [C.viridian, C.ultra], 71, t - k, .85);
    bloom(300, 820, 260, [C.rose], 79, t - k2, .8); bloom(800, 860, 240, [C.alizarin], 83, t - k2 - .1, .8);
    // the row: five pairs, staggered a hair so it ripples left to right
    for (let i = 0; i < 5; i++) clapPair(t, 120 + i * 210, 1250 + (i % 2) * 40, 80, k + i * .04, { tone: [C.ochre, C.rose, C.sienna, C.ochre, C.rose][i], seed: 40 + i * 3, tilt: .18 });
    rain(t, 160, 17, .1, 70, .5);
    fx({ wet: .5 + .35 * hit(t, k, 1.6), seed: 8.2, runs: .2 + .6 * inv(k, k + 3, t) });
  }
  // CLAP 4 (54.1): one big clap close up; the bloom floods the whole sheet, wet into wet (the verse's "thunder" next)
  function clap4(t, lt, dur) {
    const z = kf(lt, [[0, 1.0], [dur, 1.3]], ease.in);
    cam(540, 960, z, Math.sin(t * 2) * .015);
    s.fillStyle = '#fff'; s.fillRect(-W, -H, W * 3, H * 3);
    glaze(() => { s.fillStyle = vgrad(-200, 2200, [[0, '#d6cfe0'], [1, '#efe3cc']]); s.fillRect(-500, -500, W + 1000, H + 1000); }, 1);
    const k = CLAPS[3];
    bloom(540, 900, 900, [C.ultra, C.alizarin, C.indigo], 91, t - k, .6);
    bloom(540, 900, 520, [C.cad, C.lemon], 97, t - k - .25, .7);
    clapPair(t, 540, 900, 330, k, { tone: C.ochre, seed: 11, tilt: .2 });
    rain(t, 90, 19, .08, 110, .5);
    fx({ wet: .55 + .45 * inv(k, k + 1.6, t), seed: 9.9, runs: inv(k, k + 1.8, t) });
  }
  chapter('water', 37.7, 56.0, [[37.7, window_], [CLAPS[0] - .45, clap1], [CLAPS[1] - .45, clap2], [CLAPS[2] - .45, clap3], [CLAPS[3] - .45, clap4]]);
})();
