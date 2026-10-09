// Break 2 (198.0-213.0): the finished sampler's border motifs turn over into tarot card backs, and the
// piano plays a card-magic routine with them: they fly up, cascade into a ribbon spread on the green mat,
// a riffle shuffle, a spring, a turning kaleidoscope fan whose lattice blooms on the big notes, and they
// square up into the deck exactly where verse 4's deal starts. Abstract, no figures. Timing from BRK.

// ---------- sprites: card backs printed once through the same woodcut pipeline, at five bloom levels ----------
function printSprite(w, h, draw) {
  const S = mkCanvas(w, h), C = mkCanvas(w, h), L = mkCanvas(w, h), sc = w / 700;
  const sg = S.getContext('2d'), cg = C.getContext('2d'), lg = L.getContext('2d');
  const keep = [PR.c, PR.l, PR.off]; PR.c = cg; PR.l = lg; PR.off = { red: [3, -3], blue: [-3, 3], yellow: [2, 3], flesh: [0, 0] };
  for (const x of [cg, lg]) x.setTransform(sc, 0, 0, sc, 0, 0);
  draw();
  for (const [x, img] of [[cg, MOTTLE], [lg, TOOTH]]) { const p = x.createPattern(img, 'repeat'); x.globalCompositeOperation = 'destination-out'; x.fillStyle = p; x.fillRect(0, 0, 700, 1200); }
  sg.setTransform(sc, 0, 0, sc, 0, 0); sg.beginPath(); rr(sg, 0, 0, 700, 1200, 30); sg.clip();
  const sp = sg.createPattern(STOCK, 'repeat'); sp.setTransform(new DOMMatrix().scale(1.5)); sg.fillStyle = sp; sg.fillRect(0, 0, 700, 1200);
  sg.strokeStyle = 'rgba(140,90,40,.22)'; sg.lineWidth = 46; sg.beginPath(); rr(sg, 0, 0, 700, 1200, 30); sg.stroke();
  sg.setTransform(1, 0, 0, 1, 0, 0); sg.globalCompositeOperation = 'multiply'; sg.drawImage(C, 0, 0); sg.drawImage(L, 0, 0);
  [PR.c, PR.l, PR.off] = keep;
  return S;
}
const BACKS = [0, .25, .5, .75, 1].map((b) => printSprite(300, 514, () => drawBack(b)));
// the linen side of a turned motif: a patch of Aida with its stitched dash
function motifSprite(col) {
  const w = 300, h = 514, c = mkCanvas(w, h), g = c.getContext('2d'), cell = w / 5;
  g.beginPath(); rr(g, 0, 0, w, h, 12); g.clip(); g.fillStyle = '#e4d9c1'; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(120,100,70,.35)'; for (let x = 0; x <= w; x += cell) for (let y = 0; y <= h; y += cell) g.fillRect(x - 3, y - 3, 6, 6);
  g.lineCap = 'round';
  for (let k = 0; k < 3; k++) {
    const x0 = cell + k * cell, y0 = h / 2 - cell / 2;
    for (const [lw, st] of [[.44, 'rgba(40,20,10,.4)'], [.34, col], [.08, 'rgba(255,255,255,.3)']]) {
      g.strokeStyle = st; g.lineWidth = lw * cell; g.beginPath();
      g.moveTo(x0 + cell * .14, y0 + cell * .86); g.lineTo(x0 + cell * .86, y0 + cell * .14); g.moveTo(x0 + cell * .14, y0 + cell * .14); g.lineTo(x0 + cell * .86, y0 + cell * .86); g.stroke();
    }
  }
  g.strokeStyle = 'rgba(90,70,40,.5)'; g.lineWidth = 4; g.beginPath(); rr(g, 0, 0, w, h, 12); g.stroke();
  return c;
}
const MOTIF = { r: motifSprite('#bd2a30'), y: motifSprite('#e8b83a') };

// ---------- audio-driven helpers ----------
const ONS = [...BRK.piano.on, ...BRK.other.on].sort((a, b) => a[0] - b[0]).filter((o, i, a) => i === 0 || o[0] - a[i - 1][0] > .085);
const onsIn = (a, b) => ONS.filter((o) => o[0] >= a && o[0] < b);
const envAt = (arr, t) => { const f = (t - 198) * 24, i = Math.floor(f); if (i < 0) return arr[0]; if (i >= arr.length - 1) return arr[arr.length - 1]; return lerp(arr[i], arr[i + 1], f - i); };
function bloomAt(t) {
  let b = 0;
  for (const [o, s] of ONS) { if (o > t) break; if (s >= .3) b = Math.max(b, s * 1.5 * Math.exp(-(t - o) * 4.5)); }
  return clamp(b + .25 * envAt(BRK.piano.env, t));
}
const backFor = (b) => BACKS[Math.round(clamp(b) * 4)];
// times that follow an envelope: n events spread so their rate tracks env (plus a floor)
function envTimes(env, a, b, n, floor = .25) {
  const st = 1 / 48, xs = [], cum = [0];
  for (let t = a; t < b; t += st) { xs.push(t); cum.push(cum[cum.length - 1] + envAt(env, t) + floor); }
  const tot = cum[cum.length - 1], out = [];
  for (let k = 0; k < n; k++) { const target = (k + .5) / n * tot; let i = cum.findIndex((c) => c >= target); out.push(xs[Math.max(0, i - 1)]); }
  return out;
}

// ---------- the sampler (stitch-cell units; matches the crossstitch look's last frame) ----------
let SWOOD; const SPATH = {}; const SSEG = {};
(function buildSampler() {
  const S = 1024, c = mkCanvas(S, S), g = c.getContext('2d'), R = mulberry(41);   // walnut table, after js/crossstitch/core.js buildWood
  g.fillStyle = '#5a3a22'; g.fillRect(0, 0, S, S);
  for (let p = 0; p < 4; p++) {
    const y0 = p * S / 4;
    for (let k = 0; k < 90; k++) {
      const y = y0 + R() * S / 4, a = .05 + R() * .12, dark = R() < .6;
      g.strokeStyle = dark ? `rgba(30,16,8,${a})` : `rgba(160,110,70,${a})`; g.lineWidth = 1 + R() * 3;
      g.beginPath(); g.moveTo(0, y);
      for (let x = 0; x <= S; x += 32) g.lineTo(x, y + Math.sin(x * .006 + k) * 4 + n1(k + p * 100, x / 140) * 5);
      g.stroke();
    }
    g.fillStyle = 'rgba(15,8,4,.6)'; g.fillRect(0, y0, S, 3);
  }
  SWOOD = c;
  for (const [i, j, col, half, ghost, seg] of SAMPLER.cells) {
    const key = seg >= 0 ? 'seg' + seg : col + (ghost ? 'g' : ''), P2 = seg >= 0 ? (SSEG[seg] = SSEG[seg] || { col, p: new Path2D() }).p : (SPATH[key] = SPATH[key] || { col, ghost, p: new Path2D() }).p;
    const jx = (rnd(i, j, 1) - .5) * .05, jy = (rnd(i, j, 2) - .5) * .05;
    P2.moveTo(i + .14 + jx, j + .86 + jy); P2.lineTo(i + .86 + jx, j + .14 + jy);
    if (!half) { P2.moveTo(i + .14 + jx, j + .14 + jy); P2.lineTo(i + .86 + jx, j + .86 + jy); }
  }
})();
const LINEN = (() => { const c = mkCanvas(64, 64), g = c.getContext('2d'); g.fillStyle = '#e2d6bc'; g.fillRect(0, 0, 64, 64);
  for (let x = 0; x < 64; x += 16) for (let y = 0; y < 64; y += 16) { g.fillStyle = 'rgba(120,100,70,.28)'; g.fillRect(x - 1.5, y - 1.5, 3, 3); g.fillStyle = 'rgba(255,250,235,.25)'; g.fillRect(x + 4, y + 2, 8, 3); g.fillRect(x + 2, y + 5, 3, 8); }
  return octx.createPattern(c, 'repeat'); })();
function strokeStitch(g, p, col, alpha = 1) {
  g.globalAlpha = alpha; g.lineCap = 'round';
  g.strokeStyle = 'rgba(40,22,10,.38)'; g.lineWidth = .46; g.stroke(p);
  g.strokeStyle = col; g.lineWidth = .34; g.stroke(p);
  g.strokeStyle = 'rgba(255,255,255,.22)'; g.lineWidth = .08; g.stroke(p);
  g.globalAlpha = 1;
}

// ---------- the 24 border motifs: when each turns over (on the piano/organ onsets 200.6-203.4) ----------
const SEGS = Object.keys(SSEG).map(Number).sort((a, b) => ((a - 54 + 72) % 72) - ((b - 54 + 72) % 72)); // clockwise from the top
const FLIPS = (() => { const on = onsIn(200.55, 203.42).map((o) => o[0]), out = {}; SEGS.forEach((sg, k) => { out[sg] = on[Math.min(on.length - 1, Math.floor(k * on.length / SEGS.length))] + (k % 2) * .07; }); return out; })();
const RISE = (() => { const on = onsIn(203.45, 204.62).map((o) => o[0]), out = {}; SEGS.forEach((sg, k) => { out[sg] = on[Math.floor(k * on.length / SEGS.length)] + (k % 3) * .045; }); return out; })();
const RING = 43.9, CW = 5.6, CH = 9.6; // card size on the sampler, in stitch cells

// 198.0 is crossstitch's last frame (y -5, 6.8 px per cell); push in on the CHANCE card, ease back out for the ring
const SCAM = [[198.0, 0, -5, 6.8], [198.3, 0, -4, 7.0], [199.45, 0, 4, 14.6], [200.3, 0, 4, 15.4], [201.05, 0, 0, 9.8], [203.4, 0, 0, 10.6]];
function samplerCam(t) {
  let i = SCAM.findIndex((k) => k[0] > t); if (i < 0) i = SCAM.length - 1; if (i === 0) i = 1;
  const a = SCAM[i - 1], b = SCAM[i], u = smooth(clamp((t - a[0]) / (b[0] - a[0])));
  return { x: lerp(a[1], b[1], u), y: lerp(a[2], b[2], u), s: Math.exp(lerp(Math.log(a[3]), Math.log(b[3]), u)) * (1 + .03 * ease(t, 203.4, 204.75)) };
}
function drawSpriteAt(g, spr, x, y, rot, w, h, fx = 1, shadow = 0) {
  g.save(); g.translate(x, y); g.rotate(rot);
  if (shadow > 0) { g.fillStyle = `rgba(10,6,2,${.35})`; g.beginPath(); rr(g, -w / 2 * Math.abs(fx) + shadow * .4, -h / 2 + shadow, w * Math.abs(fx), h, w * .05); g.fill(); }
  g.scale(Math.max(.02, Math.abs(fx)), 1); g.drawImage(spr, -w / 2, -h / 2, w, h); g.restore();
}
function renderSampler(t) {
  const g = octx, cam = samplerCam(t), s = cam.s;
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#3b2617'; g.fillRect(0, 0, W, H);
  g.setTransform(s, 0, 0, s, W / 2 - s * cam.x, H / 2 - s * cam.y);
  g.drawImage(SWOOD, -200, -200, 400, 400);
  const C = SAMPLER.cloth;
  g.fillStyle = 'rgba(15,8,3,.45)'; g.beginPath(); g.moveTo(-C + 1.5, -C + 2.5); g.lineTo(C + 2, -C + 3); g.lineTo(C + 1.5, C + 3); g.lineTo(-C + 2, C + 2); g.fill();
  LINEN.setTransform(new DOMMatrix().scale(1 / 16)); g.fillStyle = LINEN; g.fillRect(-C, -C, 2 * C, 2 * C);
  const rg = g.createRadialGradient(0, 0, 40, 0, 0, 62); rg.addColorStop(0, 'rgba(0,0,0,0)'); rg.addColorStop(1, 'rgba(70,50,25,.12)'); g.fillStyle = rg; g.fillRect(-C, -C, 2 * C, 2 * C);
  for (const k in SPATH) strokeStitch(g, SPATH[k].p, SPATH[k].col, SPATH[k].ghost ? .85 : 1);
  g.lineCap = 'round';
  for (const [x0, y0, x1, y1, col, w] of SAMPLER.back) { g.strokeStyle = col; g.lineWidth = w * 1.4; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); }
  for (const [x, y, col] of SAMPLER.knots) { g.fillStyle = col; g.beginPath(); g.arc(x, y, .32, 0, TAU); g.fill(); }
  // motifs still stitched, then the turned and rising cards
  const flying = [];
  for (const sg of SEGS) {
    const tf = FLIPS[sg], a = sg / 72 * TAU, cx = Math.cos(a) * RING, cy = Math.sin(a) * RING;
    if (t < tf) { strokeStitch(g, SSEG[sg].p, SSEG[sg].col); continue; }
    const u = clamp((t - tf) / .34), hop = Math.sin(Math.PI * u) * .9;
    const w = lerp(3.2, CW, smooth(u)), h = lerp(3.2, CH, smooth(u)), fx = Math.cos(Math.PI * u);
    const spr = u < .5 ? MOTIF[SSEG[sg].col === '#bd2a30' ? 'r' : 'y'] : backFor(bloomAt(t));
    const tr = RISE[sg];
    if (t >= tr) { flying.push({ sg, a, cx, cy, tr }); continue; }
    drawSpriteAt(g, spr, cx, cy - hop, a + Math.PI / 2, w, h, fx, .35 + hop * .6);
  }
  drawChance(g, t);
  // rising toward the lens: screen-space growth about the centre, tumbling
  g.setTransform(1, 0, 0, 1, 0, 0);
  flying.sort((p, q) => p.tr - q.tr);
  for (const f of flying.reverse()) {
    const r = t - f.tr, k = Math.exp(r * 3.4), f2 = Math.exp(-r * 1.6), px = W / 2 + (f.cx - cam.x) * s * f2 + Math.sin(f.sg) * 120 * (1 - f2), py = H / 2 + (f.cy - cam.y) * s * f2 + Math.cos(f.sg * 1.7) * 80 * (1 - f2);
    const w = CW * s * k, h = CH * s * k;
    if (w > W * 4) continue;
    drawSpriteAt(g, backFor(bloomAt(t)), px, py, f.a + Math.PI / 2 + r * 2.2 * (f.sg % 2 ? 1 : -1), w, h, Math.cos(r * 5 + f.sg), 0);
  }
}

// ---------- on the green mat (table units, same world as verse 4) ----------
const NB = 22, RIB = (k) => [-640 + k * 35, 120];
const LAND = [...Array(NB)].map((_, k) => 204.8 + k * .057);
const PILE_L = [-520, 130], PILE_R = [-20, 130], MID = [-270, 125], SPR_T = [330, -220];
const SPLIT = (k) => 206.24 + (k % 11) * .022;
const RIFF = [...Array(NB)].map((_, j) => 206.62 + j * .026); // j-th card to drop, alternating piles
const SPRING = envTimes(BRK.other.env, 207.5, 209.1, NB);
const FANIN = (k) => 209.4 + k * .024;
const FC = [DECK[0], DECK[1]], FR = 205;
const OMEGA = (() => { const arr = [0]; for (let f = 1; f < 15 * 24 + 2; f++) { const t = 198 + f / 24, w = t < 209.9 ? 0 : (.5 + 2.2 * envAt(BRK.piano.env, t)) * (t < 211.8 ? 1 : Math.max(0, 1 - (t - 211.8) / .6)); arr.push(arr[f - 1] + w / 24); } return arr; })();
const omegaAt = (t) => { const f = (t - 198) * 24, i = clamp(Math.floor(f), 0, OMEGA.length - 2); return lerp(OMEGA[i], OMEGA[i + 1], f - i); };

// card k's pose (x, y, rot, fx, scale) on the mat at time t
function poseMat(k, t, inner = false) {
  const card = (x, y, rot, fx = 1, sc = 1) => ({ x, y, rot, fx, sc });
  if (inner) { // the kaleidoscope's inner ring: unfolds from the deck centre at 210.0, folds back by 212.84
    const op = ease(t, 209.95 + k * .03, 210.5 + k * .03) * (1 - ease(t, 211.8, 212.7));
    const th = k / 11 * TAU - omegaAt(t) * 1.6;
    const r = 105 * op; return card(FC[0] + Math.sin(th) * r, FC[1] - Math.cos(th) * r, lerp(DECK[2], th, op), 1, lerp(1, .55, op));
  }
  // ribbon landing (cascade)
  const [rx, ry] = RIB(k), rrot = .03 * Math.sin(k * 1.7);
  let p;
  if (t < LAND[k]) { const u = clamp(1 - (LAND[k] - t) / .4); p = card(lerp(rx + 300, rx, u), lerp(-760, ry, u * u * (3 - 2 * u)) - Math.sin(Math.PI * u) * 60, lerp(.9, rrot, u), Math.cos(u * TAU), lerp(1.35, 1, u)); if (u <= 0) p.hidden = 1; return p; }
  p = card(rx, ry, rrot);
  // split into two piles
  const side = k < 11 ? PILE_L : PILE_R, h = k % 11;
  const us = ease(t, SPLIT(k), SPLIT(k) + .3);
  if (us > 0) p = card(lerp(rx, side[0] - h * 1.2, us), lerp(ry, side[1] - h * 1.6, us), lerp(rrot, k < 11 ? -.06 : .06, us));
  // riffle: alternate piles drop into the middle
  const j = (k % 11) * 2 + (k < 11 ? 0 : 1), td = RIFF[j];
  if (t >= td) { const u = ease(t, td, td + .11); const sq = ease(t, 207.24, 207.42); p = card(lerp(p.x, MID[0] + (1 - sq) * (j % 2 ? 14 : -14) - j * 1.1, u), lerp(p.y, MID[1] - j * 1.6, u) - Math.sin(Math.PI * u) * 30, lerp(p.rot, (1 - sq) * (j % 2 ? .05 : -.05), u)); p.z = j; }
  // spring: from the middle in a high arc to the far pile (order: top of the middle stack first)
  const si = NB - 1 - j, ts = SPRING[si];
  if (t >= ts) { const u = clamp((t - ts) / .44), e = smooth(u); p = card(lerp(MID[0], SPR_T[0] - si * 1.1, e), lerp(MID[1], SPR_T[1] - si * 1.6, e) - Math.sin(Math.PI * e) * 520, lerp(0, .08, e) + Math.sin(Math.PI * u) * .4, Math.cos(u * Math.PI * 2), 1 + Math.sin(Math.PI * u) * .12); p.z = 100 + si; }
  // fan: fly from the far pile to a turning ring around the deck spot, then fold into the squared deck
  const tf = FANIN(si);
  if (t >= tf) {
    const u = ease(t, tf, tf + .45), th = si / NB * TAU + omegaAt(t);
    const close = ease(t, 211.8 + si * .012, 212.84);
    const R = FR * (1 - close), rot = lerp(th, DECK[2] + Math.round((th - DECK[2]) / TAU) * TAU, close);
    const fx = FC[0] + Math.sin(th) * R - si * 1.6 * close, fy = FC[1] - Math.cos(th) * R - si * 2.2 * close;
    p = card(lerp(p.x, fx, u), lerp(p.y, fy, u) - Math.sin(Math.PI * u) * 80, lerp(p.rot, rot, u), 1, 1 + .04 * Math.sin(Math.PI * clamp((t - 212.84) / .14)));
    p.z = 200 + (close > .5 ? si : (si + Math.floor(omegaAt(t) / TAU * NB)) % NB);
  }
  return p;
}
const BKEYS = [[204.755, -260, 120, 1050], [206.2, -250, 110, 980], [206.6, -270, 130, 900], [207.45, -270, 120, 920], [208.0, 20, -250, 1180], [209.2, 30, -260, 1180], [210.0, FC[0], FC[1], 1250], [211.8, FC[0], FC[1] + 10, 1220], [213.0, -300, 100, 1500]];
function breakCam(t) {
  let i = BKEYS.findIndex((k) => k[0] > t); if (i < 0) i = BKEYS.length - 1; if (i === 0) i = 1;
  const a = BKEYS[i - 1], b = BKEYS[i], u = smooth((t - a[0]) / (b[0] - a[0]));
  return { x: lerp(a[1], b[1], u), y: lerp(a[2], b[2], u), z: Math.exp(lerp(Math.log(H / a[3]), Math.log(H / b[3]), u)) };
}
function renderMat(t) {
  const cam = breakCam(t), g = octx;
  const CM = new DOMMatrix().translate(W / 2, H / 2).scale(cam.z).translate(-cam.x, -cam.y);
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
  drawTable(CM, t);
  if (t >= 212.84) { drawDeck(CM, t); return vignette(); }
  const bl = bloomAt(t), spr = backFor(bl), list = [];
  for (let k = 0; k < NB; k++) { const p = poseMat(k, t); if (!p.hidden) list.push(p); }
  for (let k = 0; k < 11; k++) if (t >= 209.95 && t < 212.7) { const p = poseMat(k, t, true); p.z = 300 + k; list.push(p); }
  list.sort((p, q) => (p.z || 0) - (q.z || 0));
  g.setTransform(CM);
  for (const p of list) {
    const lift = (p.sc - 1) * 3 + .15;
    g.save(); g.translate(p.x, p.y); g.rotate(p.rot);
    g.fillStyle = 'rgba(5,12,8,.3)'; g.beginPath(); rr(g, -126 * Math.abs(p.fx) * p.sc + 10 + lift * 60, -216 * p.sc + 14 + lift * 90, 252 * Math.abs(p.fx) * p.sc, 432 * p.sc, 12); g.fill();
    g.restore();
    g.save(); g.translate(p.x, p.y); g.rotate(p.rot); g.scale(Math.max(.03, Math.abs(p.fx)) * p.sc, p.sc); g.drawImage(spr, -126, -216, 252, 432); g.restore();
  }
  vignette();
}
function vignette() {
  const g = octx; g.setTransform(1, 0, 0, 1, 0, 0);
  const vg = g.createRadialGradient(W / 2, H / 2, H * .5, W / 2, H / 2, W * .65);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(25,15,5,.28)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
}
function renderBreak(t) {
  if (t < 204.755) renderSampler(t); else renderMat(t);
}
