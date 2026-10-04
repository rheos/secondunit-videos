// LOOK PROBE: scrapbook paper theatre. 58.875 - 74.458 (verse 2). After Sarah Legault's video for
// Rheostatics' "The Inland Sea": every piece is cut from a real old print (public-domain scans, see
// _in/paper-sources/SOURCES.md) or a Midjourney piece made to look like one, so nothing quite matches:
// a Ruisdael sky over an Aivazovsky sea, a photochrom steamer, a Currier lithograph, a Whistler etching,
// an 1887 photo of an egret, a Vanity Fair caricature. Pieces keep a thin paper edge from the scissors
// and cast soft shadows; they move like puppets (slide, bob, pivot, swap drawings), never morph.
// Pieces are prepared by tools/paper_prep.py into assets/paper/ (gitignored).
const LOOK = {
  span: [58.875, 74.458333],   // song frames 1413 - 1787 (24 fps)
  frag: `
uniform float flash, warm;
void main(){
  vec3 c = texture(src, uv).rgb;
  vec2 px = uv * res;
  float tooth = fbm(px * .05) - .5;
  c *= 1. + tooth * .06;
  c += (vn(px * .5 + t * 61.) - .5) * .03;
  c = mix(vec3(.05, .045, .04), vec3(1.), c);
  c *= mix(vec3(.97, 1., 1.04), vec3(1.06, 1., .9), warm);
  c += flash * vec3(.6, .62, .7) * (1. - length(uv - vec2(.5, .25)) * .8);
  vec2 v = uv - .5; c *= 1. - dot(v, v) * .75;
  o = vec4(c, 1.);
}`,
  uniforms: (t, X) => ({ flash: X.flash ?? 0, warm: X.warm ?? .3 }),
};

(() => {
  const ROARS = [59.1, 60.1, 61.13, 62.13];   // vocal onsets: roar, roar, thunder, roar
  const LIGHT = 67.55, BIRD = 69.33;
  const BITES = [71.367, 72.4, 73.433], TOSSES = [71.9, 72.9, 73.933];
  const END = LOOK.span[1];
  // a phase that is an integer on every beat (as in js/cast.js, which this page doesn't load)
  function beatPhase(t) { const i = lastBeat(t); if (i < 0) return t / .5; const b0 = FEAT.beats[i], b1 = FEAT.beats[i + 1] ?? b0 + .5; return i + clamp((t - b0) / (b1 - b0)); }
  const NAMES = ['sky-storm.jpg', 'sea-storm.jpg', 'sky-dusk.jpg', 'sea-mezzo.jpg', 'dancehouse.jpg', 'dancehouse-light.png', 'stokehold.jpg',
    'steamer-erie.png', 'steamer-mayflower.png', 'schooner-iroquois.png', 'clipper.png', 'gent.png', 'shovel.png', 'coal.png', 'lamp.png',
    'bolt-0.png', 'bolt-1.png', 'bolt-2.png', 'egret-0.png', 'egret-1.png', 'egret-2.png', 'egret-3.png', 'egret-4.png', 'smoke.png'];
  const IMG = {}, P = {};   // raw images; cut pieces (paper edge baked in)

  const mk = (w, h, fn) => { const c = document.createElement('canvas'); c.width = Math.ceil(w); c.height = Math.ceil(h); const g = c.getContext('2d'); if (fn) fn(g, c.width, c.height); return c; };
  // a piece with a thin cream edge left by the scissors; anchor in fractions of the piece
  function edged(img, edge = 4, col = 'rgba(238,230,212,.95)') {
    const w = img.width, h = img.height, pad = edge + 2;
    const sil = mk(w, h, (g) => { g.drawImage(img, 0, 0); const d = g.getImageData(0, 0, w, h), a = d.data; for (let i = 0; i < a.length; i += 4) { a[i + 3] = a[i + 3] > 110 ? 255 : 0; } g.putImageData(d, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = col; g.fillRect(0, 0, w, h); });
    return mk(w + pad * 2, h + pad * 2, (g) => { for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; g.drawImage(sil, pad + Math.cos(a) * edge, pad + Math.sin(a) * edge); } g.drawImage(img, pad, pad); });
  }
  const ready = Promise.all(NAMES.map((n) => new Promise((res) => { const im = new Image(); im.onload = () => { IMG[n.replace(/\.\w+$/, '')] = im; res(); }; im.onerror = () => { console.error('missing assets/paper/' + n); res(); }; im.src = 'assets/paper/' + n; })))
    .then(() => { for (const k of Object.keys(IMG)) if (/^(steamer|schooner|clipper|gent|shovel|coal|lamp|egret)/.test(k)) P[k] = edged(IMG[k], k.startsWith('egret') ? 3 : 4); for (const k of ['bolt-0', 'bolt-1', 'bolt-2', 'smoke']) if (IMG[k]) P[k] = IMG[k]; window.__scrapReady = true; return true; });
  window.__scrapPromise = ready;

  const LIT = mk(W, H), lit = LIT.getContext('2d');
  let main = null;
  function begin(warm) { main = s; lit.setTransform(1, 0, 0, 1, 0, 0); lit.globalCompositeOperation = 'source-over'; lit.fillStyle = '#000'; lit.fillRect(0, 0, W, H); fx({ warm }); main.fillStyle = '#1b1916'; main.fillRect(-W, -H, W * 3, H * 3); }
  function finish() { main.save(); main.setTransform(1, 0, 0, 1, 0, 0); main.globalCompositeOperation = 'lighter'; main.drawImage(LIT, 0, 0); main.restore(); }
  function glow(x, y, r, col, a = 1) { if (!(r > .5) || a <= 0) return; lit.save(); lit.setTransform(main.getTransform()); lit.globalCompositeOperation = 'lighter'; lit.globalAlpha = a; const gr = lit.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)'); lit.fillStyle = gr; lit.fillRect(x - r, y - r, r * 2, r * 2); lit.restore(); }
  const shadowOn = (g, sh) => { g.shadowColor = `rgba(10,8,6,${.5 * Math.min(1, sh)})`; g.shadowBlur = 24 * sh; g.shadowOffsetX = 8 * sh; g.shadowOffsetY = 14 * sh; };
  // place a cut piece: (x, y) is where its anchor (ax, ay fractions) lands; w is its drawn width; flip mirrors it
  function put(name, x, y, w, { ax = .5, ay = 1, rot = 0, sh = 1, alpha = 1, flip = false, comp } = {}) {
    const c = P[name]; if (!c) return; const sc = w / c.width, g = main;
    g.save(); g.globalAlpha = alpha; if (comp) g.globalCompositeOperation = comp; if (sh > 0) shadowOn(g, sh);
    g.translate(x, y); g.rotate(rot); g.scale(flip ? -sc : sc, sc); g.drawImage(c, -c.width * ax, -c.height * ay); g.restore();
  }
  // a scissor line: a few straight cuts with small changes of angle between them
  function scissor(x0, y0, x1, y1, seed, wob = 10, n = 7) { const r = rng(seed), o = []; for (let i = 0; i <= n; i++) { const u = i / n, j = i === 0 || i === n ? 0 : (r() - .5) * 2 * wob; const nx = -(y1 - y0), ny = x1 - x0, L = Math.hypot(nx, ny) || 1; o.push([lerp(x0, x1, u) + nx / L * j, lerp(y0, y1, u) + ny / L * j]); } return o; }
  // a plate cut out with scissors: a region of an image (sx, sy, sw, sh in image px) drawn into a quad on screen
  function plateCut(name, src, dst, { seed = 1, rot = 0, sh = 1, top = true, edge = true, wob = 10, scallop = 0 } = {}) {
    const im = IMG[name]; if (!im) return; const [sx, sy, sw, shh] = src, [dx, dy, dw, dh] = dst, g = main;
    let pts;
    if (scallop) { pts = []; const n = Math.max(3, Math.round(dw / scallop)), r = rng(seed); for (let i = 0; i < n; i++) { const cx = dx + (i + .5) * dw / n, rr = dw / n * (.55 + r() * .25); for (let k = 0; k <= 10; k++) { const a = Math.PI + k / 10 * Math.PI; pts.push([cx + Math.cos(a) * rr, dy + rr * .8 + Math.sin(a) * rr * (.8 + r() * .3)]); } } pts.push(...scissor(dx + dw, dy + dh * .3, dx + dw, dy + dh, seed + 1, wob), ...scissor(dx + dw, dy + dh, dx, dy + dh, seed + 2, wob), ...scissor(dx, dy + dh, dx, dy + dh * .3, seed + 3, wob)); }
    else pts = [...(top ? scissor(dx, dy, dx + dw, dy, seed, wob) : [[dx, dy], [dx + dw, dy]]), ...scissor(dx + dw, dy, dx + dw, dy + dh, seed + 1, wob), ...scissor(dx + dw, dy + dh, dx, dy + dh, seed + 2, wob), ...scissor(dx, dy + dh, dx, dy, seed + 3, wob)];
    const path = new Path2D(); pts.forEach(([x, y], i) => i ? path.lineTo(x, y) : path.moveTo(x, y)); path.closePath();
    const cx = dx + dw / 2, cy = dy + dh / 2;
    g.save(); g.translate(cx, cy); g.rotate(rot); g.translate(-cx, -cy);
    if (sh > 0) { g.save(); shadowOn(g, sh); g.fillStyle = 'rgb(238,230,212)'; g.fill(path); g.restore(); }
    if (edge) { g.save(); g.lineJoin = 'miter'; g.lineWidth = 8; g.strokeStyle = 'rgb(238,230,212)'; g.stroke(path); g.restore(); }
    g.save(); g.clip(path); g.drawImage(im, sx, sy, sw, shh, dx, dy, dw, dh); g.restore();
    g.restore();
  }
  const bob = (t, k, a, sp = 1.5) => Math.sin(t * sp + k) * a;
  // a cloud cut out along its lobes. src is the image region mapped onto the card's box (cx, cy, w, h).
  function cloudCard(name, src, cx, cy, w, h, seed, sh = 1) {
    const im = IMG[name]; if (!im) return; const r = rng(seed), g = main, lobes = [];
    let x = cx - w * .42; while (x < cx + w * .42) { const rr = h * (.3 + r() * .22) * (.75 + .4 * Math.sin((x - cx + w / 2) / w * Math.PI)); lobes.push([x, cy - h * .08 - rr * .35 * r(), rr]); x += rr * (1.05 + r() * .35); }
    for (let i = 0; i < 5; i++) lobes.push([cx + (i / 4 - .5) * w * .7, cy + h * .18, h * (.18 + r() * .08)]);
    const shape = (k) => { const p = new Path2D(); for (const [lx, ly, lr] of lobes) { p.moveTo(lx + lr + k, ly); p.arc(lx, ly, lr + k, 0, TAU); } return p; };
    const [sx, sy, sw, shh] = src, kx = w / sw, ky = h / shh;
    g.save(); if (sh > 0) shadowOn(g, sh); g.fillStyle = 'rgb(238,230,212)'; g.fill(shape(5)); g.restore();
    g.save(); g.clip(shape(0)); g.drawImage(im, cx - w / 2 - sx * kx, cy - h / 2 - sy * ky, im.width * kx, im.height * ky); g.restore();
  }

  // ---------- 1. the storm (58.875 - 62.4): Ruisdael's sky, Aivazovsky's sea, the 1902 lightning on every roar ----------
  function storm(t, lt, dur) {
    begin(.1);
    const roar = ROARS.reduce((m, k, i) => (t >= k ? i : m), -1), since = roar >= 0 ? t - ROARS[roar] : 9;
    const shake = roar === 2 ? Math.exp(-6 * since) * 16 : roar >= 0 ? Math.exp(-9 * since) * 5 : 0;
    main.save(); main.translate(Math.sin(t * 61) * shake, Math.cos(t * 47) * shake);
    // the sky: the dark top of the Ruisdael, sliding slowly
    plateCut('sky-storm', [0, 0, 1500, 1050], [-120 - lt * 18, -40, 1600, 1120], { seed: 3, sh: 0, edge: false });
    // two cloud cards cut from the same painting, drifting against it
    cloudCard('sky-storm', [1250, 100, 900, 420], 820 + lt * 26, 400, 820, 380, 11, .8);
    // the bolt: snaps on the roar, holds a few frames, gone
    if (roar >= 0 && since < .4) {
      const b = ['bolt-0', 'bolt-1', 'bolt-0', 'bolt-2'][roar], bx = [560, 360, 700, 430][roar], im = P[b];
      if (im) { const w = [600, 760, 640, 520][roar], k = Math.exp(-3 * since) * (since < .07 ? 1 : since < .12 ? .45 : 1); put(b, bx, 420, w, { ay: 0, sh: 0, flip: roar === 2, alpha: k, comp: 'lighter' }); glow(bx, 700, 700, 'rgba(200,210,255,.5)', k); }
    }
    cloudCard('sky-storm', [150, 250, 1000, 440], 260 - lt * 34, 700, 900, 400, 12, 1);
    // the sea: the mezzotint's two ships fighting the storm behind, the Currier clipper pitching, Aivazovsky's wave in front
    plateCut('sea-mezzo', [880, 960, 1460, 800], [-160 + lt * 24, 900 + bob(t, 0, 10, 1.3), 1300, 712], { seed: 21, sh: .8, wob: 18 });
    put('clipper', 300, 1300 + bob(t, 1, 10), 520, { rot: Math.sin(t * 1.4) * .08, sh: .7 });
    plateCut('sea-storm', [1000, 1040, 1400, 650], [-420 - lt * 46, 1320 + bob(t, 2, 22, 1.2), 1950, 905], { seed: 22, sh: 1, wob: 28, rot: bob(t, 3, .012) });
    main.restore();
    fx({ flash: roar >= 0 ? .5 * Math.exp(-7 * since) * (since < .07 ? 1 : since < .12 ? .35 : 1) : 0 });
    finish();
  }
  // ---------- 2. the boats leaving (62.4 - 66.9): a photochrom steamer, a Currier lithograph, a dry-plate schooner ----------
  function leaving(t, lt, dur) {
    begin(.35);
    const u = lt / dur, z = lerp(1, 1.1, ease.inOut(u));
    main.save(); main.translate(540, 960); main.scale(z, z); main.translate(-540, -960);
    plateCut('sky-dusk', [300, 0, 1500, 1250], [-160 - lt * 14, -60, 1500, 1250], { seed: 5, sh: 0, edge: false });
    cloudCard('sky-dusk', [1550, 150, 700, 380], 760 - lt * 20, 470, 700, 360, 31, .7);
    plateCut('sea-storm', [1500, 980, 900, 420], [-260 + lt * 18, 1060 + bob(t, 1, 6, 1.1), 1700, 600], { seed: 32, sh: .6, wob: 16 });
    // the Mayflower, far off, sliding out to the right
    put('steamer-mayflower', lerp(380, 610, ease.inOut(u)), 1100 + bob(t, 4, 3), lerp(420, 240, u), { sh: .4 });
    // the City of Erie heading out (her bow is to the right): smaller and higher as she goes; puffs of the J. M. White's smoke from her stack
    const k = ease.inOut(u), sx = lerp(420, 760, k), sy = lerp(1330, 1120, k), sw = lerp(1000, 300, k);
    for (let i = 0; i < 8; i++) { const b = 62.4 - 1.4 + i * .55, l2 = t - b; if (l2 < 0 || l2 > 2.6) continue; const pw2 = sw * (.3 + l2 * .2); main.save(); main.globalAlpha = clamp(1.4 - l2 / 1.9); cloudCard('sky-storm', [180 + i * 60, 40, 420, 240], sx - sw * .12 - l2 * 110, sy - sw * .66 - l2 * 70, pw2, pw2 * .55, 70 + i, .4); main.restore(); }
    put('steamer-erie', sx, sy + bob(t, 0, 8 * sw / 1000), sw, { rot: bob(t, 2, .02), sh: .5 + sw / 1000 });
    plateCut('sea-storm', [1000, 1100, 1400, 590], [-300 - lt * 36, 1420 + bob(t, 2, 14, 1.2), 1900, 800], { seed: 33, sh: 1, wob: 22 });
    // the schooner Iroquois leaving on the right, close, then smaller
    const k3 = ease.inOut(clamp(u * 1.15 - .1)); put('schooner-iroquois', lerp(1240, 900, k3), lerp(1620, 1250, k3) + bob(t, 1, 10), lerp(1300, 520, k3), { rot: bob(t, 5, .03), sh: 1 });
    main.restore();
    finish();
  }
  // ---------- 3. the window and the bird (66.9 - 70.6): Whistler's dance-house at night, a lamp, the egret coming in to land ----------
  function window_(t, lt, dur) {
    begin(.7);
    const z = lerp(1.0, 1.08, ease.inOut(lt / dur));
    main.save(); main.translate(540, 900); main.scale(z, z); main.translate(-540, -900);
    const im = IMG.dancehouse, dw = 1200, dh = im ? dw * im.height / im.width : 1980, dx = -60, dy = -40;
    plateCut('dancehouse', [0, 0, im ? im.width : 1, im ? im.height : 1], [dx, dy, dw, dh], { seed: 41, sh: 0, edge: false });
    // the windows light up on the line's first syllable (the etching's own bright marks, washed amber)
    const on = smooth(inv(LIGHT - .05, LIGHT + .35, t)), L = IMG['dancehouse-light'];
    // (added straight onto the page, so the pieces in front cover it)
    if (L && on > 0) { const g = main; g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = on * (.8 + .1 * Math.sin(t * 9)); g.drawImage(L, dx, dy, dw, dh); g.globalAlpha = on * .45; g.filter = 'blur(14px)'; g.drawImage(L, dx, dy, dw, dh); g.restore(); }
    // the lamp on the right, its glass lit
    const lx = 820, ly = 1900, lw = 210, lampH = P.lamp ? lw * P.lamp.height / P.lamp.width : 1400, topY = ly - lampH;
    put('lamp', lx, ly, lw, { sh: 1 });
    glow(lx, topY + lampH * .1, 260, 'rgba(255,200,120,.45)'); glow(lx, topY + lampH * .1, 70, 'rgba(255,240,200,.8)');
    // the egret: the 1887 photographs swapped like drawings (on threes), gliding in from the left, landing on the lamp on the cue word
    const perchX = lx + 10, perchY = topY + 30;
    if (t < BIRD) {
      const k = ease.out(inv(BIRD - 2.0, BIRD, t)), x = lerp(-300, perchX - 40, k), y = lerp(260, perchY - 40, k) + Math.sin(k * Math.PI) * -60;
      const cyc = ['egret-2', 'egret-3', 'egret-1', 'egret-3'], fr = k > .82 ? 'egret-4' : cyc[Math.floor(onTwos(t, 8)) % 4];
      put(fr, x, y, lerp(300, 340, k), { ay: .8, sh: .8, rot: -.05 });
    } else {
      const l2 = t - BIRD, fr = l2 < .45 ? 'egret-4' : 'egret-0';
      put(fr, perchX, perchY + Math.exp(-7 * l2) * 18, 340, { ay: .92, sh: .9 });
    }
    main.restore();
    finish();
  }
  // ---------- 4. the coal (70.6 - 74.458): a page of the Staniland stokehold, a Vanity Fair gent with a catalogue shovel ----------
  function coal(t, lt, dur) {
    begin(.95);
    const push = ease.in(inv(73.95, END, t)), fx0 = 640, fy0 = 1440;   // the firebox mouth on the page, on screen
    const z = lerp(1, 3.4, push);
    main.save(); main.translate(540, 960); main.scale(z, z); main.translate(-lerp(540, fx0, push), -lerp(960, fy0, push));
    const im = IMG.stokehold, pw = 1180, ph = im ? pw * im.height / im.width : 1260;
    plateCut('stokehold', [0, 0, im ? im.width : 1, im ? im.height : 1], [-50, 360, pw, ph], { seed: 51, rot: -.025, sh: 1.2, wob: 14 });
    const flare = TOSSES.reduce((m, k) => Math.max(m, hit(t, k + .4, 4)), 0), heat = .55 + .3 * noise1(t * 6, 3) + .5 * flare;
    glow(fx0, fy0, 420, 'rgba(255,130,50,.5)', heat); glow(fx0, fy0, 140, 'rgba(255,220,150,.6)', heat);
    // the coal heap, and the gent shovelling (mirrored so he faces the fire)
    put('coal', 700, 1940, 560, { sh: 1.2 });
    const ph2 = (() => { const b = beatPhase(t) - lastBeat(BITES[0] + .01), c = Math.floor(b / 2), r = b - c * 2; return r < 1 ? r * .62 : .62 + (r - 1) * .38; })();
    // a puppet's two moves: bend to the heap (bite at 0), swing up and throw (.62)
    const bend = ph2 < .62 ? 1 - ease.inOut(ph2 / .62) : ease.inOut((ph2 - .62) / .38);
    const gx = 250, gy = 1900, gw = 400, gh = P.gent ? gw * P.gent.height / P.gent.width : 1520;
    // a two-piece puppet hinged at the waist: the legs stay planted, the torso bows over the heap.
    // (Pinning the shovel at his hips and rocking the whole figure read as a hip thrust.)
    const wy = gy - gh * .44, bow = lerp(-.04, .5, bend);
    main.save(); main.beginPath(); main.rect(gx - 600, wy - 4, 1200, 1200); main.clip(); put('gent', gx, gy, gw, { flip: true, sh: 1.2 }); main.restore();
    main.save(); main.translate(gx, wy); main.rotate(bow); main.translate(-gx, -wy);
    main.beginPath(); main.rect(gx - 600, wy - 2000, 1200, 2000 + 10); main.clip();
    put('gent', gx, gy, gw, { flip: true, sh: 1.2 });
    // the shovel, held out from his chest: down into the heap at the bite, up toward the fire on the throw
    const sw = 360, srot = lerp(-1.2, -.3, bend);
    put('shovel', gx + gw * .22, gy - gh * .66, sw, { ax: .45, ay: .08, rot: srot - bow, sh: 1 });
    main.restore();
    // coal flying into the firebox on each toss, sparks after
    TOSSES.forEach((k, j) => {
      const l2 = t - k; if (l2 < 0 || l2 > .45) return; const u = l2 / .45;
      for (let i = 0; i < 5; i++) { const ox = (hash(j * 13 + i) - .5) * 70; put('coal', lerp(700 + ox, fx0 + ox * .4, u), lerp(1600, fy0, u) - Math.sin(u * Math.PI) * 300, 110, { ay: .5, rot: u * 5 + i, sh: .6 }); }
    });
    TOSSES.forEach((k, j) => { const l2 = t - k - .45; if (l2 < 0 || l2 > 1) return; for (let i = 0; i < 24; i++) { const a = -Math.PI / 2 + (hash(j * 71 + i) - .5) * 2.4, v = 260 + hash(j * 37 + i) * 520, x = fx0 + Math.cos(a) * v * l2, y = fy0 + Math.sin(a) * v * l2 + 480 * l2 * l2; glow(x, y, 12, `rgba(255,${180 + (i % 3) * 25},90,${(1 - l2) * .9})`); } });
    main.restore();
    if (push > .3) { main.save(); main.setTransform(1, 0, 0, 1, 0, 0); main.fillStyle = `rgba(240,150,60,${ease.in(inv(.3, 1, push)) * .92})`; main.fillRect(0, 0, W, H); main.restore(); }
    finish();
  }

  // until the scans load, a frame is plain dark paper
  const guard = (fn) => { const g = function (t, lt, dur) { if (!window.__scrapReady) { s.fillStyle = '#1b1916'; s.fillRect(0, 0, W, H); return; } fn(t, lt, dur); }; Object.defineProperty(g, 'name', { value: fn.name }); return g; };
  chapter('scrap', LOOK.span[0], END, [
    [LOOK.span[0], guard(storm)],
    [62.4, guard(leaving)],
    [66.9, guard(window_)],
    [70.6, guard(coal)],
  ]);
})();
