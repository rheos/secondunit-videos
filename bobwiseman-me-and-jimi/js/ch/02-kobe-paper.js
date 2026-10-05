// 43.0 - 77.6  KOBE, paper theatre. Every piece is cut from a real old print or photo (public domain / CC0,
// listed in _in/paper-sources/SOURCES.md) or a Midjourney piece where the archives had nothing (the radio,
// the girl at the piano; _in/mj). Mismatched on purpose: a Hiroshige sky over a Meiji hand-tinted photo.
// Pieces keep a cream scissor edge and cast soft shadows; they slide, bob and pivot like a toy theatre.
//   43.00 harbour   the stage fills: Hiroshige's Ajikawa sky drops in, his sea rises, Kusakabe's photo of
//                   Kobe (c. 1890s, a western house in the middle) comes up in front; sails drift; dusk falls
//                   and the house's windows light, one per bar
//   50.20 radio     the family radio on a shelf against a katagami stencil; pages of W. C. Handy's
//                   St. Louis Blues (1914) and records pour out of it on the beat
//   54.40 piano     the girl at the piano from behind (Midjourney), bobbing with the beat
//   58.23 wave      Hokusai's Great Wave, cut up (see the wave block below)
//   66.07 crossing  night: the City of Peking (Pacific Mail, 1887 card) steams east, the horn on the vocal;
//                   the dawn sky (Hiroshige, Sunrise at Susaki) is lowered in like a backdrop; a Martin guitar
//                   (1838) rises from the horizon like the sun; the stage clears to paper at 77.6
const LOOK = {
  span: [43.0, 77.6],
  frag: `
uniform float flash, fade, dusk;
void main(){
  vec3 c = texture(src, uv).rgb;
  vec2 px = uv * res;
  c *= 1. + (fbm(px * .05) - .5) * .05;
  c += (vn(px * .5 + t * 61.) - .5) * .025;
  vec2 v = uv - .5; c *= 1. - dot(v, v) * .7;
  c = mix(c, vec3(.95, .92, .85), fade);
  c += flash * .4;
  o = vec4(c, 1.);
}`,
  uniforms: (t, X) => ({ flash: X.flash ?? 0, fade: X.fade ?? 0 }),
};
(() => {
  const CREAM = 'rgb(240,232,214)';
  const IMG = {}, P = {};
  const NAMES = ['great-wave.jpg', 'ajikawa.jpg', 'kobe-town.jpg', 'peking.jpg', 'stencil.jpg', 'sunrise.jpg', 'blues-p3.jpg', 'blues-p4.jpg', 'radio.png', 'girl.png', 'guitar.png', 'piano.png'];
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; };
  const kOf = (img) => IMG[img].width / 1200;            // polygons are written in 1200-wide preview units of each source
  function snip(pts, seed, wob = 1.2) {
    const r = rng(seed), out = [];
    pts.forEach(([x0, y0], i) => { const [x1, y1] = pts[(i + 1) % pts.length]; const n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0) / 18));
      for (let k = 0; k < n; k++) { const u = k / n, nx = -(y1 - y0), ny = x1 - x0, L = Math.hypot(nx, ny) || 1, j = k ? (r() - .5) * 2 * wob : 0; out.push([lerp(x0, x1, u) + nx / L * j, lerp(y0, y1, u) + ny / L * j]); } });
    return out;
  }
  // cut a polygon (preview units of `img`) into a piece at the source's full resolution, with a cream scissor edge
  function cut(name, img, poly, seed, edge = 12) {
    const K = kOf(img), im = IMG[img];
    const pts = snip(poly, seed).map(([x, y]) => [x * K, y * K]);
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]), pad = 14;
    const x0 = Math.max(0, Math.min(...xs) - pad), y0 = Math.max(0, Math.min(...ys) - pad), x1 = Math.min(im.width, Math.max(...xs) + pad), y1 = Math.min(im.height, Math.max(...ys) + pad);
    const c = mk(x1 - x0, y1 - y0), g = c.getContext('2d'), path = new Path2D();
    pts.forEach(([x, y], i) => i ? path.lineTo(x - x0, y - y0) : path.moveTo(x - x0, y - y0)); path.closePath();
    if (edge) { g.lineJoin = 'miter'; g.lineWidth = edge; g.strokeStyle = CREAM; g.stroke(path); g.fillStyle = CREAM; g.fill(path); }
    g.save(); g.clip(path); g.drawImage(im, -x0, -y0); g.restore();
    P[name] = { c, x0, y0, K };
  }
  // a whole-image piece (already cut by rembg), given a cream outline by stamping its silhouette around it
  function edged(name, img, edge = 5) {
    const im = IMG[img]; if (!im) return; const w = im.width, h = im.height, pad = edge + 2;
    const sil = mk(w, h), sg = sil.getContext('2d'); sg.drawImage(im, 0, 0); sg.globalCompositeOperation = 'source-in'; sg.fillStyle = CREAM; sg.fillRect(0, 0, w, h);
    const c = mk(w + pad * 2, h + pad * 2), g = c.getContext('2d'); for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; g.drawImage(sil, pad + Math.cos(a) * edge, pad + Math.sin(a) * edge); } g.drawImage(im, pad, pad);
    P[name] = { c, x0: -pad, y0: -pad, K: 1 };
  }
  // key out colours inside a piece: fn(r, g, b) -> 0..1 amount to remove; only where (x, y) in source px pass `where`
  function key(name, fn, where = () => true) {
    const p = P[name], g = p.c.getContext('2d'), d = g.getImageData(0, 0, p.c.width, p.c.height), a = d.data, w = p.c.width;
    for (let i = 0; i < a.length; i += 4) { const x = (i / 4) % w + p.x0, y = Math.floor(i / 4 / w) + p.y0; if (!where(x, y)) continue; a[i + 3] = Math.round(a[i + 3] * (1 - clamp(fn(a[i], a[i + 1], a[i + 2])))); }
    g.putImageData(d, 0, 0);
  }
  // draw piece `name` so that source point (sx, sy) [preview units] lands on screen (x, y), at screen scale `sc`
  // per preview unit, rotated by rot about that point
  function put(name, sx, sy, x, y, sc, { rot = 0, sh = 1, alpha = 1 } = {}) {
    const p = P[name]; if (!p) return; const k = sc / p.K;
    s.save(); s.globalAlpha = alpha;
    if (sh > 0) { s.shadowColor = `rgba(20,16,10,${.45 * sh})`; s.shadowBlur = 26 * sh; s.shadowOffsetX = 9 * sh; s.shadowOffsetY = 14 * sh; }
    s.translate(x, y); s.rotate(rot); s.scale(k, k); s.translate(-sx * p.K, -sy * p.K);
    s.drawImage(p.c, p.x0, p.y0); s.restore();
  }
  // a plain region of an image as a backdrop (no edge, no shadow)
  function backdrop(img, [sx, sy, sw, shh], [dx, dy, dw, dh]) { const K = kOf(img); s.drawImage(IMG[img], sx * K, sy * K, sw * K, shh * K, dx, dy, dw, dh); }
  function paperDisc(x, y, r, col, sh = 1) { s.save(); if (sh) { s.shadowColor = 'rgba(20,16,10,.4)'; s.shadowBlur = 18; s.shadowOffsetY = 10; } s.beginPath(); s.arc(x, y, r + 5, 0, TAU); s.fillStyle = CREAM; s.fill(); s.restore(); s.beginPath(); s.arc(x, y, r, 0, TAU); s.fillStyle = col; s.fill(); }
  function record(x, y, r, rot) {
    paperDisc(x, y, r, '#1a1716');
    s.strokeStyle = '#3a3532'; s.lineWidth = 1; for (let k = 1; k < 4; k++) { s.beginPath(); s.arc(x, y, r * (.45 + k * .15), 0, TAU); s.stroke(); }
    s.beginPath(); s.arc(x, y, r * .35, 0, TAU); s.fillStyle = '#b8432d'; s.fill(); s.beginPath(); s.arc(x + Math.cos(rot) * r * .15, y + Math.sin(rot) * r * .15, 2.5, 0, TAU); s.fillStyle = '#efe6d2'; s.fill();
  }
  // a typed label on a paper strip (like a caption pasted into a scrapbook)
  function label(txt, x, y, rot = 0, size = 34) {
    s.save(); s.translate(x, y); s.rotate(rot); s.font = `400 ${size}px "American Typewriter"`; const w = s.measureText(txt).width + size * 1.2;
    s.shadowColor = 'rgba(20,16,10,.4)'; s.shadowBlur = 12; s.shadowOffsetY = 6; s.fillStyle = '#efe4c8'; s.fillRect(-w / 2, -size * .9, w, size * 1.6); s.shadowColor = 'transparent';
    s.fillStyle = '#2a2420'; s.textAlign = 'center'; s.fillText(txt, 0, size * .3); s.restore();
  }

  const ready = Promise.all(NAMES.map((n) => new Promise((res) => { const im = new Image(); im.onload = () => { IMG[n.replace(/\.\w+$/, '')] = im; res(); }; im.onerror = () => { console.error('missing assets/paper/' + n); res(); }; im.src = 'assets/paper/' + n; })))
    .then(() => {
      // harbour
      cut('town', 'kobe-town', [[5, 420], [120, 408], [260, 400], [380, 392], [520, 410], [700, 396], [900, 398], [1060, 392], [1190, 388], [1190, 925], [5, 925]], 21);
      cut('sailA', 'ajikawa', [[598, 528], [640, 538], [652, 588], [668, 598], [662, 616], [600, 614], [596, 596]], 22);
      cut('sailB', 'ajikawa', [[686, 500], [726, 498], [734, 548], [750, 552], [744, 572], [680, 572], [678, 550]], 23);
      cut('sailC', 'ajikawa', [[516, 592], [560, 590], [566, 632], [578, 636], [572, 652], [512, 652], [512, 632]], 24);
      // crossing
      cut('ship', 'peking', [[455, 105], [640, 48], [700, 70], [820, 120], [930, 250], [995, 340], [998, 412], [420, 412], [430, 300]], 31);
      // the sky between the masts goes (light), the dark rigging stays; the hull and sea below 345 are left alone
      key('ship', (r, g, b) => ((r + g + b) / 765 - .5) / .1, (x, y) => y < 345 * kOf('peking'));
      cut('banner', 'peking', [[700, 42], [1150, 42], [1150, 90], [770, 90]], 32);
      cut('sun', 'sunrise', [[640, 368], [652, 350], [672, 342], [700, 340], [726, 344], [742, 356], [748, 370]], 33, 6);
      cut('wave', 'great-wave', [[0, 300], [118, 245], [150, 160], [210, 120], [300, 90], [390, 72], [470, 78], [540, 112], [600, 160], [660, 200], [705, 245], [715, 290], [690, 330], [655, 350], [610, 345], [560, 330], [520, 360], [505, 420], [530, 480], [565, 540], [480, 560], [300, 560], [0, 575]], 11);
      { const K = kOf('great-wave'); key('wave', (r, g, b) => (r - b - 22) / 8, (x, y) => x > 470 * K && y < 380 * K); }
      cut('swell', 'great-wave', [[0, 610], [120, 545], [230, 500], [330, 465], [420, 445], [470, 470], [540, 520], [610, 575], [700, 610], [800, 630], [900, 590], [990, 520], [1080, 430], [1160, 350], [1200, 320], [1200, 807], [0, 807]], 12);
      cut('fuji', 'great-wave', [[640, 612], [700, 572], [735, 545], [762, 518], [790, 540], [830, 572], [880, 600], [900, 615]], 13);
      cut('boatR', 'great-wave', [[655, 560], [700, 590], [860, 600], [960, 540], [1040, 480], [1100, 425], [1090, 470], [1000, 560], [880, 620], [740, 612], [665, 585]], 14);
      cut('boatB', 'great-wave', [[488, 610], [520, 640], [600, 690], [700, 720], [820, 728], [940, 700], [960, 735], [880, 770], [700, 765], [590, 730], [520, 680], [490, 640]], 15);
      cut('boatL', 'great-wave', [[30, 380], [70, 430], [120, 490], [190, 540], [280, 560], [300, 590], [200, 590], [120, 550], [70, 480], [35, 420]], 16);
      cut('title', 'great-wave', [[58, 52], [112, 52], [112, 232], [58, 232]], 17);
      // sheet-music strips: single staves cut from the St. Louis Blues pages
      for (let i = 0; i < 6; i++) { const y = 120 + i * 230; cut('staff' + i, i % 2 ? 'blues-p4' : 'blues-p3', [[60, y], [1140, y + 4], [1138, y + 120], [62, y + 116]], 40 + i, 8); }
      edged('radio', 'radio'); edged('girl', 'girl'); edged('guitar', 'guitar'); edged('piano', 'piano');
      return true;
    });
  window.__kobeReady = ready;

  const T = (x) => onTwos(x, 12);
  const bar = (t) => { const i = lastBeat(t); return i < 0 ? 0 : Math.floor(i / 4); };

  // ---------- A: the harbour ----------
  function shotHarbour(t, l) {
    const tt = T(t), on = (a, d = .7) => ease.out(inv(a, a + d, tt));
    s.fillStyle = '#d9cdb2'; s.fillRect(0, 0, W, H);
    fx({ fade: 1 - smooth(inv(43.0, 43.5, t)) });
    // sky drops in, sea rises, the photo comes up in front
    s.save(); s.translate(0, (on(43.0) - 1) * 600); backdrop('ajikawa', [52, 62, 1098, 234], [-10, -10, W + 20, 560]); s.restore();
    s.save(); s.translate(0, (1 - on(43.2)) * 700); s.shadowColor = 'rgba(20,16,10,.4)'; s.shadowBlur = 20; s.shadowOffsetY = -6; backdrop('ajikawa', [52, 294, 1098, 470], [-10, 470, W + 20, 640]); s.restore();
    // sails drift across the bay
    const drift = (tt - 43) * 8;
    put('sailA', 630, 614, 420 + drift, 760 + (1 - on(43.6)) * 500 + Math.sin(tt * 1.3) * 5, 1.3, { rot: Math.sin(tt * 1.3) * .03 });
    put('sailB', 712, 572, 640 + drift * .7, 640 + (1 - on(43.7)) * 500 + Math.sin(tt * 1.1 + 1) * 4, 1.1, { rot: Math.sin(tt * 1.1) * .03 });
    put('sailC', 540, 652, 170 + drift * 1.2, 780 + (1 - on(43.8)) * 500 + Math.sin(tt * 1.5 + 2) * 5, 1.4, { rot: Math.sin(tt * 1.5) * .03 });
    // the photo of Kobe, cut along its rooftops
    const ty = (1 - on(43.4, .9)) * 900;
    put('town', 1190, 925, W + 30, H + 40 + ty, 1.0, { sh: 1.2 });
    // dusk: a violet wash deepens over the sky; the western house's windows light one per bar
    const dk = smooth(inv(44.5, 50, t));
    s.save(); s.globalCompositeOperation = 'multiply'; const gr = s.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, `rgba(60,50,110,${.55 * dk})`); gr.addColorStop(1, `rgba(90,70,120,${.25 * dk})`); s.fillStyle = gr; s.fillRect(0, 0, W, H); s.restore();
    const n = bar(t) - bar(43.3);
    const WIN = [[778, 612], [800, 612], [858, 640], [898, 640], [820, 640], [770, 650]];
    const K = 1.0, ox = W + 30 - 1190 * K, oy = H + 40 + ty - 925 * K;
    WIN.forEach(([wx, wy], i) => { if (i >= n) return; const x = ox + wx * K, y = oy + wy * K; s.save(); s.globalCompositeOperation = 'lighter'; const g2 = s.createRadialGradient(x, y, 0, x, y, 40); g2.addColorStop(0, 'rgba(255,190,90,.9)'); g2.addColorStop(1, 'rgba(255,150,60,0)'); s.fillStyle = g2; s.fillRect(x - 40, y - 40, 80, 80); s.restore(); });
    if (tt > 44.2) label('KOBE, 1950s', 360, 140, -.03);
  }

  // ---------- B: the radio ----------
  function wall(dim = .35) {
    backdrop('stencil', [130, 150, 940, 700], [-20, -20, W + 40, H + 40]);
    s.fillStyle = `rgba(30,20,12,${dim})`; s.fillRect(0, 0, W, H);
  }
  function shotRadio(t, l) {
    const tt = T(t);
    wall(.3);
    s.save(); s.shadowColor = 'rgba(20,16,10,.5)'; s.shadowBlur = 24; s.shadowOffsetY = 12; s.fillStyle = '#5a3a24'; s.fillRect(160, 820, 1100, 46); s.restore();
    s.fillStyle = CREAM; s.fillRect(160, 818, 1100, 4);
    const thump = beatPulse(t, 9);
    put('radio', 0, 832, 260, 826 - thump * 6, .78, { rot: -thump * .01 });
    // pages and records pour out of the speaker, one per beat, up and away to the right
    const bi = lastBeat(tt);
    for (let k = 0; k < 9; k++) {
      const j = bi - k, b = FEAT.beats[j]; if (b === undefined || b < 50.3) continue; const a = tt - b;
      const x = 640 + a * 420 + Math.sin(a * 3 + j) * 30, y = 520 - a * 260 + a * a * 40;
      if (j % 3 === 0) record(x, y, 54, a * 7); else put('staff' + (j % 6), 600, 60, x, y, .6, { rot: Math.sin(a * 2.5 + j) * .35 - .2 });
    }
  }

  // ---------- C: the girl at the piano ----------
  function shotPiano(t, l) {
    const tt = T(t);
    wall(.15);
    // the Met's 1831 cabinet piano, and the girl (Midjourney, cut off her own piano) on her stool in front of it
    const pn = P.piano, p = P.girl; if (!pn || !p) return;
    put('piano', pn.c.width / 2, pn.c.height, W / 2, H + 20, 1000 / pn.c.height, { sh: 1 });
    const bob = beatPulse(t, 8) * 8, sway = Math.sin(t * 1.9) * .012;
    put('girl', p.c.width / 2, p.c.height, W / 2 - 10, H + 30 + bob, 700 / p.c.height, { rot: sway, sh: 1.2 });
    for (let k = 0; k < 3; k++) { const st = 55.2 + k * 1.1; if (tt < st) continue; const a = tt - st; put('staff' + (k + 2), 600, 60, 520 + k * 420 + a * 60, 300 - a * 90, .5, { rot: -.15 + Math.sin(a * 2 + k) * .2, alpha: clamp(2.5 - a) }); }
  }

  // ---------- D: the wave (Hokusai, cut up) ----------
  function shotWave(t, l) {
    const tt = T(t), CR = 59.43, IMW = IMG['great-wave'].width, IMH = IMG['great-wave'].height, Kw = kOf('great-wave');
    const rise = ease.out(inv(58.23, CR, tt)), tip = ease.back(inv(CR - .05, CR + .5, tt)) * (1 - smooth(inv(CR + .6, CR + 2.2, tt)));
    const rock = Math.sin((tt - CR) * 1.6) * smooth(inv(CR + 1, CR + 2.5, tt));
    s.fillStyle = '#1b1916'; s.fillRect(0, 0, W, H);
    s.save(); s.translate(-30 * inv(58.23, 66.07, t), 0); backdrop('great-wave', [740, 0, 460, 420], [-20, 0, 1980, 1080]); s.restore();
    const z = lerp(1, 1.12, ease.inOut(inv(58.23, 66.07, t))), S0 = W / 1200;
    s.save(); s.translate(W / 2, H / 2); s.scale(z, z); s.translate(-W / 2, -H / 2); s.translate(0, (H - IMH * W / IMW) / 2);
    const at = (name, px, py, dx = 0, dy = 0, rot = 0, sh = 1) => put(name, px, py, px * S0 + dx, py * S0 + dy, S0, { rot, sh });
    at('fuji', 770, 600, 0, 0, 0, .6);
    at('boatR', 880, 560, 0, Math.sin(tt * 1.3 + 1) * 9, Math.sin(tt * 1.3) * .04);
    at('title', 85, 232, 0, (1 - rise) * -250, 0, .8);
    const wy = (1 - rise) * 750;
    at('wave', 300, 560, 0, wy + Math.sin(tt * 1.1) * 7, -.06 * (1 - rise) + tip * .05 + rock * .025);
    at('boatL', 160, 500, 0, wy * .9 + Math.sin(tt * 1.5) * 8, Math.sin(tt * 1.5) * .05 - tip * .03);
    at('swell', 600, 807, 0, Math.sin(tt * 1.25 + .5) * 11 + (1 - rise) * 30, Math.sin(tt * 1.25) * .008);
    at('boatB', 720, 700, 0, Math.sin(tt * 1.25 + 1.2) * 12, Math.sin(tt * 1.25 + .4) * .045);
    const sp = inv(CR - .05, CR + 3.5, t);
    if (sp > 0 && sp < 1) for (let k = 0; k < 60; k++) {
      const ox = (560 + hash(k) * 160) * S0, oy = (130 + hash(k + 1) * 120) * S0, vx = (120 + hash(k + 3) * 520) * S0, vy = (-90 - hash(k + 7) * 160) * S0;
      const ts = sp * 3.5, x = ox + vx * ts * .35, y = oy + vy * ts * .35 + 260 * S0 * ts * ts * .5;
      if (k === 6 || k === 25 || k === 47) record(x, y, 24, t * 6 + k);
      else { const r = (8 + hash(k + 9) * 16) * W / IMW; s.beginPath(); s.arc(x, y, r, 0, TAU); s.fillStyle = '#f7f4ea'; s.fill(); s.lineWidth = 1.2; s.strokeStyle = '#3a6a9a'; s.stroke(); }
    }
    s.restore();
  }

  // ---------- E: the crossing ----------
  function shotCrossing(t, l) {
    const tt = T(t), H0 = 66.07;
    // night backdrop: deep blue paper; the dawn sky card is lowered over it from 70.0
    s.fillStyle = '#1d2a48'; s.fillRect(0, 0, W, H);
    for (let k = 0; k < 40; k++) { const x = hash(k) * W, y = hash(k + 5) * 560; s.fillStyle = 'rgba(240,232,214,.7)'; s.fillRect(x, y, 3, 3); }
    const moonY = 180 + inv(66, 72, t) * 60; paperDisc(1500, moonY, 70, '#efe6cf');
    const dawn = ease.inOut(inv(70.0, 71.6, tt));
    if (dawn > 0) { s.save(); s.translate(0, (dawn - 1) * 700); s.shadowColor = 'rgba(20,16,10,.5)'; s.shadowBlur = 24; s.shadowOffsetY = 14; backdrop('sunrise', [40, 80, 820, 290], [-10, -10, W + 20, 700]); s.restore(); }
    // the sun and the guitar rise from the horizon
    const sunUp = ease.out(inv(71.6, 73.5, tt)); if (sunUp > 0) put('sun', 694, 370, 560, 660 - sunUp * 40, 3.2, { sh: .3 });
    const gUp = ease.out(inv(73.5, 76.6, tt)); if (gUp > 0 && P.guitar) { const p = P.guitar; put('guitar', p.c.width / 2, p.c.height, 560, 1060 - gUp * 470, 820 / p.c.height, { rot: Math.sin(t * .8) * .03, sh: .8 }); }
    // the sea: Hiroshige's Ajikawa water, bobbing
    s.save(); s.translate(0, Math.sin(tt * 1.2) * 6); s.shadowColor = 'rgba(10,8,6,.45)'; s.shadowBlur = 20; s.shadowOffsetY = -8; backdrop('ajikawa', [52, 620, 1098, 145], [-20, 660, W + 40, 440]); s.restore();
    // the ship, east (left to right), with a puff of paper steam on the horn
    const x = lerp(260, 1250, inv(66, 77.4, t)), horn = hit(t, H0, 2.5), roll = Math.sin(tt * 1.4) * .025;
    put('ship', 710, 410, x, 770 + Math.sin(tt * 1.4 + .6) * 8, 1.15, { rot: roll, sh: .8 });
    if (horn > .03) for (let k = 0; k < 4; k++) paperDisc(x - 140 - k * 46 * (1 - horn) * 3, 470 - k * 40 * (1.3 - horn), 26 + k * 10, '#f2ece0', 0);
    s.save(); s.translate(0, Math.sin(tt * 1.6 + 1) * 8); backdrop('ajikawa', [52, 700, 1098, 70], [-20, 900, W + 40, 200]); s.restore();
    if (tt > 66.6) { put('banner', 925, 66, 1400, 130, 1.0, { rot: -.04 }); label('1963, going east', 1400, 250, .02, 30); }
    fx({ fade: smooth(inv(77.0, 77.6, t)) });
  }

  chapter('kobe', 43.0, 77.6, [
    [43.0, shotHarbour], [50.2, shotRadio], [54.4, shotPiano], [58.23, shotWave], [66.07, shotCrossing],
  ]);
})();
