// The band, as dream apparitions, driven by the Demucs stems (window.STEMS: env per 24 fps frame, onsets).
// "other" is the saxophone. Drum hits come from the drum envelope's peaks (the onset list misses the
// steady kit). Every frame is still a pure function of t: hits are looked up, never remembered.
const SE = (name, t) => { const e = STEMS.stems[name].env; return e[clamp(Math.round(t * 24), 0, e.length - 1)] || 0; };
const SEs = (name, t, w = 18) => { let m = 0; for (let k = -w; k <= w; k++) m += SE(name, t + k / 24); return m / (2 * w + 1); };
function envPeaks(name, thr, rise, gap) {
  const e = STEMS.stems[name].env, out = [];
  for (let f = Math.round(219 * 24); f < Math.round(279 * 24); f++) {
    if (!(e[f] > thr && e[f] >= e[f - 1] && e[f] > e[f + 1] && e[f] - Math.min(e[f - 2], e[f - 3]) > rise)) continue;
    const t = f / 24; if (!out.length || t - out[out.length - 1][0] > gap) out.push([t, e[f]]);
  }
  return out;
}
const mergeHits = (a, b, gap) => [...a, ...b].sort((x, y) => x[0] - y[0]).filter((h, i, arr) => !i || h[0] - arr[i - 1][0] > gap);
const DRUMS = envPeaks('drums', .35, .12, .2);
const GTR = mergeHits(STEMS.stems.guitar.onsets.filter((x) => x > 219 && x < 279).map((x) => [x, .8]), envPeaks('guitar', .4, .14, .3), .2);
const PNO = mergeHits(STEMS.stems.piano.onsets.filter((x) => x > 219 && x < 279).map((x) => [x, .8]), envPeaks('piano', .35, .12, .3), .2);
const SAX = mergeHits(STEMS.stems.other.onsets.filter((x) => x > 219 && x < 279).map((x) => [x, .8]), envPeaks('other', .4, .14, .4), .25);
// hits in [t - win, t], newest first, with their index in the list
function recent(list, t, win) { const out = []; for (let i = list.length - 1; i >= 0; i--) { const a = t - list[i][0]; if (a < 0) continue; if (a > win) break; out.push({ i, t0: list[i][0], age: a, v: list[i][1] }); } return out; }
const hitSum = (list, t, d = 8, win = 1) => recent(list, t, win).reduce((m, h) => m + Math.exp(-d * h.age) * h.v, 0);
const countBefore = (list, t) => { let n = 0; for (const [x] of list) if (x <= t) n++; return n; };

// form: 0 = gone, .5 = outline only (born from the drifting outlines), 1 = solid
function formPart(P, o, form) {
  if (form <= 0) return;
  const oc = o.outlineCol || hsl(50, 80, 80);
  if (form < 1) { const k = clamp(form * 2); s.save(); s.globalAlpha *= k; part(P, { ...o, fill: undefined, shade: undefined, ink: true, inkCol: oc }); s.restore(); }
  if (form > .5) { s.save(); s.globalAlpha *= clamp((form - .5) * 2); part(P, o); s.restore(); }
}
const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];

// ---- PIANO: a grand seen from the keyboard side, lid raised. Piano hits press chords. ----
function piano(x, y, k, ang, t, form) {
  withT(() => {
    s.translate(x, y); s.rotate(ang); s.scale(k, k);
    const o = (sd, extra = {}) => ({ seed: sd, wob: 1 / k, reg: 1 / k, inkW: 1 / k, hatch: false, ...extra });
    formPart([[-330, -40], [-320, -150], [-160, -250], [120, -280], [330, -230], [345, -120], [300, -40]], o(6000, { fill: hsl(250, 14, 15), shade: hsl(250, 14, 9), shadeShift: [20, 16], sharp: 0 }), form); // lid up
    formPart([[-150, -250], [-120, -40], [-104, -40], [-134, -250]], o(6001, { fill: hsl(40, 30, 60), sharp: 30 }), form);              // lid prop
    formPart(rect(-350, -50, 350, 20), o(6002, { fill: hsl(20, 30, 18), shade: hsl(20, 30, 12), shadeShift: [0, 8], sharp: 60 }), form);  // case
    for (const lx of [-300, 300]) formPart(rect(lx - 14, 20, lx + 14, 190), o(6003 + lx, { fill: hsl(20, 30, 14), sharp: 40 }), form);
    // keys
    const press = new Map();
    for (const h of recent(PNO, t, .45)) { const r = rng(h.i * 97 + 5), root = Math.floor(r() * 14); for (const d of [0, 2, 4]) { const kk = root + d; press.set(kk, Math.max(press.get(kk) || 0, Math.exp(-h.age * 6))); } }
    const NW = 21, kw = 640 / NW;
    for (let i = 0; i < NW; i++) { const p = press.get(i % 17) || 0, x0 = -320 + i * kw; formPart(rect(x0 + 1, -38 + p * 8, x0 + kw - 1, 14 + p * 6), o(6100 + i, { fill: hsl(45, 25, 94 - p * 22), sharp: 20, inkW: .7 / k }), form); }
    for (let i = 0; i < NW - 1; i++) { if (![0, 1, 3, 4, 5].includes(i % 7)) continue; const x0 = -320 + (i + 1) * kw - kw * .3, p = press.get((i + 3) % 17) || 0; formPart(rect(x0, -38 + p * 6, x0 + kw * .6, -10 + p * 6), o(6200 + i, { fill: hsl(250, 10, 12 + p * 20), sharp: 12, inkW: .5 / k }), form); }
    // hammers' sparks: tiny pops above the strings on each hit
    if (form > .7) for (const h of recent(PNO, t, .5)) { const r = rng(h.i * 13 + 1), a = 1 - h.age / .5; for (let j = 0; j < 3; j++) dot(-200 + r() * 450, -150 - h.age * 260 - r() * 60, 6 * a + 1, hsl(45 + r() * 40, 80, 80, a)); }
  });
}

// ---- SAXOPHONE: alto in profile, built from a centreline with widths. Sax hits move keys and blow notes. ----
const SAXC = [[-40, -300], [-10, -330], [30, -322], [44, -280], [40, -200], [36, -80], [34, 40], [30, 120], [10, 170], [-30, 176], [-56, 140], [-60, 90], [-50, 30]];
const SAXW = [7, 8, 10, 12, 15, 18, 22, 25, 27, 30, 34, 40, 52];
function saxOutline() {
  const C = spline(SAXC, false, 4), W = [], n = C.length, L = [], R = [];
  for (let i = 0; i < n; i++) { const u = i / (n - 1) * (SAXW.length - 1), a = Math.floor(u), f = u - a; W.push(lerp(SAXW[a], SAXW[Math.min(a + 1, SAXW.length - 1)], f)); }
  for (let i = 0; i < n; i++) { const a = C[Math.max(0, i - 1)], b = C[Math.min(n - 1, i + 1)]; let dx = b[0] - a[0], dy = b[1] - a[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l; L.push([C[i][0] - dy * W[i], C[i][1] + dx * W[i]]); R.push([C[i][0] + dy * W[i], C[i][1] - dx * W[i]]); }
  return { C, W, P: [...L, ...R.reverse()] };
}
const SAXO = saxOutline();
function sax(x, y, k, t, form) {
  const env = SE('other', t), sway = Math.sin(t * 1.4) * .12 * (.3 + env) + snoise(t * .3, 7000) * .08;
  const pos = (lx, ly) => { const ca = Math.cos(-.35 + sway), sa = Math.sin(-.35 + sway); return [x + (lx * ca - ly * sa) * k, y + (lx * sa + ly * ca) * k]; };
  withT(() => {
    s.translate(x, y); s.rotate(-.35 + sway); s.scale(k, k);
    const o = (sd, extra = {}) => ({ seed: sd, wob: .8 / k, reg: .8 / k, inkW: 1 / k, hatch: false, dense: true, ...extra });
    formPart(SAXO.P, o(7001, { fill: hsl(44, 72, 58), shade: hsl(34, 70, 40), shadeShift: [14, 6] }), form);
    formPart([[-46, -306], [-36, -296], [-62, -284], [-70, -292]], o(7002, { fill: hsl(250, 10, 14), dense: false, sharp: 10 }), form); // mouthpiece
    formPart(lump(-50, 30, 52, 16, 7003, 12), o(7003, { fill: hsl(30, 60, 22), dense: false }), form);                                    // bell mouth
    // keys along the body; the ones a hit presses sink and darken
    const pr = new Map(); for (const h of recent(SAX, t, .5)) { const r = rng(h.i * 31 + 9); for (let j = 0; j < 3; j++) { const kk = Math.floor(r() * 9); pr.set(kk, Math.max(pr.get(kk) || 0, Math.exp(-h.age * 7))); } }
    if (form > .5) for (let i = 0; i < 9; i++) {
      const ci = Math.round(6 + i * (SAXO.C.length - 18) / 9), c = SAXO.C[ci], w = SAXO.W[ci], p = pr.get(i) || 0;
      s.save(); s.globalAlpha *= clamp((form - .5) * 2);
      dot(c[0] + w * .25, c[1], 9 + w * .12 - p * 3, hsl(44, 60, 78 - p * 40)); s.strokeStyle = hsl(30, 50, 26); s.lineWidth = 2.5; s.beginPath(); s.arc(c[0] + w * .25, c[1], 9 + w * .12 - p * 3, 0, TAU); s.stroke();
      line([[c[0] + w * .25 + 10, c[1]], [c[0] + w + 12, c[1] - 6 + p * 4]], hsl(40, 50, 40), 3);
      s.restore();
    }
  });
  if (form < .4) return;
  // notes and smoke curls drift out of the bell after each sax hit
  const bell = pos(-50, 10);
  for (const h of recent(SAX, t, 3.2)) {
    const r = rng(h.i * 17 + 3), a = h.age, fade = clamp(1 - a / 3.2) * clamp(a * 6) * form;
    const nx = bell[0] + a * (60 + r() * 60) * (r() > .3 ? 1 : -1), ny = bell[1] - a * (70 + r() * 50) + Math.sin(a * 3 + r() * 6) * 20;
    withT(() => { s.globalAlpha *= fade; s.translate(nx, ny); s.rotate(Math.sin(a * 2 + h.i) * .3); const col = hsl(45 + r() * 60, 80, 82);
      part(lump(0, 0, 13, 9, h.i * 3 + 1, 8), { fill: col, seed: h.i * 3 + 1, inkW: .8, wob: .3, reg: .3, hatch: false });
      line([[11, -2], [11, -46]], HAND.inkCol, 3); line([[11, -46], [24, -34], [26, -24]], HAND.inkCol, 3); });
    // a curl of smoke
    const P = []; for (let j = 0; j < 22; j++) { const u = j / 21, rr = 8 + u * 46 * (.4 + a * .3); P.push([bell[0] + 30 * a + Math.cos(u * 9 + a * 2 + h.i) * rr, bell[1] - 20 - a * 50 - u * 40 + Math.sin(u * 9 + a * 2 + h.i) * rr * .6]); }
    stroke(P, 7100 + h.i, .7, { force: true, col: hsl(270, 30, 88, .55 * fade), dense: true });
  }
}

// ---- GUITAR: acoustic, strings shiver on guitar hits ----
function guitar(x, y, k, ang, t, form) {
  withT(() => {
    s.translate(x, y); s.rotate(ang); s.scale(k, k);
    const o = (sd, extra = {}) => ({ seed: sd, wob: 1 / k, reg: 1 / k, inkW: 1 / k, hatch: false, ...extra });
    const body = []; for (let i = 0; i < 24; i++) { const a = i / 24 * TAU, c = Math.cos(a), sn = Math.sin(a), w = sn > 0 ? 120 : 92; body.push([c * 170 + 60, sn * w * (1 - .18 * Math.cos(a * 2 + Math.PI) * 0) - (c > .1 && c < .5 ? 0 : 0)]); }
    formPart(body, o(8001, { fill: hsl(28, 60, 48), shade: hsl(20, 60, 32), shadeShift: [-20, 14] }), form);
    formPart(lump(40, 0, 34, 34, 8002, 12), o(8002, { fill: hsl(20, 40, 12) }), form);
    formPart(rect(-460, -16, -110, 16), o(8003, { fill: hsl(25, 40, 26), sharp: 60 }), form);
    formPart([[-470, -22], [-560, -30], [-570, 30], [-470, 22]], o(8004, { fill: hsl(25, 40, 20), sharp: 30 }), form);
    formPart(rect(150, -40, 170, 40), o(8005, { fill: hsl(20, 40, 14), sharp: 20 }), form);
    if (form > .5) {
      const sh = hitSum(GTR, t, 5, 1.2);
      s.save(); s.globalAlpha *= clamp((form - .5) * 2);
      for (let j = 0; j < 6; j++) { const yy = -12 + j * 4.8, P = []; for (let i = 0; i <= 20; i++) { const u = i / 20; P.push([lerp(-540, 160, u), yy + Math.sin(u * Math.PI) * Math.sin(t * 90 + j * 1.7) * sh * 9]); } line(P, hsl(45, 20, 86), 1.6); }
      s.restore();
    }
  });
}

// ---- over the mandala: the stems as timed shapes on the unfolded top layer ----
function mandalaTop(t, cx, cy) {
  // drums: rings from the centre on every hit, a shockwave and spokes on the big ones
  for (const h of recent(DRUMS, t, .8)) {
    const a = h.age, big = h.v > .55, col = hsl((h.i * 47) % 360, 85, 72);
    const R = 60 + Math.pow(a, .7) * 1100, w = (big ? 46 : 20) * (1 - a / .8);
    s.save(); s.globalAlpha = clamp(1 - a / .8) * (big ? 1 : .85); s.strokeStyle = col; s.lineWidth = Math.max(1, w);
    s.beginPath(); s.ellipse(cx, cy, R, R * .92, 0, 0, TAU); s.stroke();
    if (big) {
      s.lineWidth = Math.max(1, w * .4); s.beginPath(); s.ellipse(cx, cy, R * .78, R * .72, 0, 0, TAU); s.stroke();
      const r0 = 80 + a * 500, r1 = r0 + 180 * (1 - a);
      for (let k = 0; k < 16; k++) { const an = k / 16 * TAU + h.i; s.beginPath(); s.moveTo(cx + Math.cos(an) * r0, cy + Math.sin(an) * r0); s.lineTo(cx + Math.cos(an) * r1, cy + Math.sin(an) * r1); s.stroke(); }
    }
    s.restore();
  }
  // sax: a ribbon winding through the wedges along a rose curve, thick and long when the sax is loud
  const env = SEs('other', t, 3), n = 90, L = 3 + env * 7;
  const pt = (u) => { const th = u * .8, r = 470 * Math.cos(2.5 * th) * (.75 + .25 * Math.sin(u * .7)); return [cx + Math.cos(th) * r * 1.25, cy + Math.sin(th) * r]; };
  const CH = 9, per = n / CH; s.lineCap = 'round'; s.lineJoin = 'round';
  for (let c = CH - 1; c >= 0; c--) { // chunks, tail first, each one smooth path (no beading)
    const k = 1 - c / CH; s.strokeStyle = hsl(40 + c * 25 + t * 30, 85, 66, .35 + .6 * k); s.lineWidth = (8 + env * 50) * k + 2;
    s.beginPath(); for (let j = 0; j <= per; j++) { const u = t * 1.6 - (c * per + j) / n * L, [x, y] = pt(u); j ? s.lineTo(x, y) : s.moveTo(x, y); } s.stroke();
  }
  // guitar: small bursts of sparks where each hit lands
  for (const h of recent(GTR, t, .5)) {
    const r = rng(h.i * 71 + 2), an = r() * TAU, rr = 250 + r() * 220, px = cx + Math.cos(an) * rr * 1.3, py = cy + Math.sin(an) * rr, a = h.age / .5;
    s.save(); s.globalAlpha = 1 - a; s.strokeStyle = hsl(15 + r() * 30, 95, 66); s.lineWidth = 3; s.lineCap = 'round';
    for (let k = 0; k < 10; k++) { const b = k / 10 * TAU + r(), d0 = 10 + a * 70, d1 = d0 + 30 * (1 - a); s.beginPath(); s.moveTo(px + Math.cos(b) * d0, py + Math.sin(b) * d0); s.lineTo(px + Math.cos(b) * d1, py + Math.sin(b) * d1); s.stroke(); }
    dot(px, py, 10 * (1 - a) + 2, hsl(50, 100, 90)); s.restore();
  }
  // piano: tiny geometry pops (triangles, squares, hexagons), spinning out and gone
  for (const h of recent(PNO, t, .6)) {
    const r = rng(h.i * 53 + 4), a = h.age / .6;
    for (let j = 0; j < 3; j++) {
      const px = cx + (r() - .5) * 900, py = cy + (r() - .5) * 600, sides = [3, 4, 6][Math.floor(r() * 3)], sz = 14 + 26 * ease.back(Math.min(1, a * 4)) * (1 - a), rot = r() * 6 + a * 3;
      const P = []; for (let q = 0; q < sides; q++) P.push([px + Math.cos(rot + q / sides * TAU) * sz, py + Math.sin(rot + q / sides * TAU) * sz]);
      s.save(); s.globalAlpha = 1 - a; s.strokeStyle = hsl(180 + r() * 80, 70, 85); s.lineWidth = 3; s.beginPath(); P.forEach(([x, y], q) => q ? s.lineTo(x, y) : s.moveTo(x, y)); s.closePath(); s.stroke(); s.restore();
    }
  }
}
