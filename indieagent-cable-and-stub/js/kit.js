// The cable and the stub: marker and ink on cream paper, every mark drawn here on a 1080x1080 canvas.
// Rules (references/kevin-ngo/STYLE-BRIEF.txt): one ink weight, fills laid as visible strokes, one highlight
// per material, exteriors inside a ragged paper mask, interiors full bleed, faces of two dots and a mouth.
'use strict';
const W = 1080, H = 1080, FPS = 24, BAR = 2.5, TAU = Math.PI * 2;
const C = {
  paper: '#eee9dd', paperD: '#e3dccb', ink: '#222338',
  navy: '#32355b', navyD: '#2a2d4e', navyL: '#3d4068', win: '#ebcf46',
  stub: '#efd04b', stubH: '#e5b538', stubL: '#f6e07a', red: '#C8341E',
  brass: '#ca9e50', brassL: '#e8c983', cable: '#8e8fa0', cableL: '#e4e5ea', cableD: '#3a3b52',
  wood: '#a29a8d', woodD: '#8c8478', woodL: '#b5ada0', grey: '#9c8f99', greyD: '#6e6a7a', lav: '#c9bec5',
  amber: '#f0c56a', amberD: '#d9a23e', amberL: '#f7dc9c', curtain: '#7a3b3f', curtainD: '#5e2c30',
  amp: '#5a5b6c', ampD: '#464759', white: '#fbf8ef', green: '#225c44',
};

// seeded RNG: textures are seeded per element, never per frame, so fills hold still between frames
function M32(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
let R = M32(1);
const seed = (s) => { R = M32(s * 7919 + 13); };
const rnd = (a = 0, b = 1) => a + (b - a) * R(), jit = (s) => (R() - .5) * 2 * s;
const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), lerp = (a, b, t) => a + (b - a) * t;
const eo = (t) => 1 - Math.pow(1 - cl(t), 3), ei = (t) => Math.pow(cl(t), 3);
const eio = (t) => { t = cl(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const seg = (p, a, b) => cl((p - a) / (b - a));
// small overshoot for bends: lands at 1 with one bounce
const spr = (t) => { t = cl(t); return 1 - Math.pow(1 - t, 3) * Math.cos(t * 9) ; };

// ---------- sound cues ----------
// With ?cues=1 the shots report their animation events; cues.mjs walks every frame and writes assets/cues.json for
// tools/sfx-bank/bank.py. An event's time comes from the same numbers that drive its motion, so retiming a move
// moves its sound. SHOT0 is the film time of the drawing shot's u = 0 (main.js sets it).
const CUE_ON = typeof location !== 'undefined' && /[?&]cues=1/.test(location.search);
const CUES = new Map(); let SHOT0 = 0;
const cue = (k, u, size = 0) => { if (!CUE_ON) return; const t = +(SHOT0 + u * BAR).toFixed(4); CUES.set(k + '@' + t, { k, t, size }); };
// seg() that also reports its start; size = the move's length in ms, so the map can pick a longer sound for a longer move
const segc = (k, p, a, b) => { cue(k, a, Math.round((b - a) * BAR * 1000)); return seg(p, a, b); };
// report the first u in [0, 1] where a rising fn(u) passes target (a bulb lighting, a threshold crossing); none if it never does
const cueWhen = (k, fn, target, size = 0) => { if (!CUE_ON || fn(1) <= target) return; let lo = 0, hi = 1; for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (fn(m) > target) hi = m; else lo = m; } cue(k, hi, size); };
const mix = (a, b, t) => { const p = (c) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]; const A = p(a), B = p(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], t))).join(',')})`; };

let X = null;
const setCtx = (ctx) => { X = ctx; };

// ---------- marks ----------
function poly(pts, closed = true) { X.beginPath(); pts.forEach((p, i) => i ? X.lineTo(p[0], p[1]) : X.moveTo(p[0], p[1])); if (closed) X.closePath(); }
function wob(pts, j, s) { seed(s); return pts.map(p => [p[0] + jit(j), p[1] + jit(j)]); }
// one ink line, one weight, a little wobble; densified so corners stay corners
function ink(pts, closed = false, w = 5, col = C.ink, s = 1, a = 1) {
  const d = dens(pts, 26, closed); seed(s);
  X.beginPath(); d.forEach((p, i) => { const x = p[0] + jit(1.1), y = p[1] + jit(1.1); i ? X.lineTo(x, y) : X.moveTo(x, y); }); if (closed) X.closePath();
  X.strokeStyle = col; X.lineWidth = w; X.lineCap = 'round'; X.lineJoin = 'round'; X.globalAlpha = a; X.stroke(); X.globalAlpha = 1;
}
function dens(pts, step = 26, closed = false) {
  const o = []; const P = closed ? pts.concat([pts[0]]) : pts;
  for (let i = 0; i < P.length - 1; i++) { const [x1, y1] = P[i], [x2, y2] = P[i + 1]; const n = Math.max(1, Math.round(Math.hypot(x2 - x1, y2 - y1) / step)); for (let k = 0; k < n; k++) o.push([lerp(x1, x2, k / n), lerp(y1, y2, k / n)]); }
  if (!closed) o.push(P[P.length - 1]); return o;
}
function flat(pts, col, a = 1) { poly(pts); X.globalAlpha = a; X.fillStyle = col; X.fill(); X.globalAlpha = 1; }
// a region laid down as marker strokes: clip to the polygon, draw parallel bands with ragged ends and slightly varying tone
function marker(pts, col, dir = 'v', gap = 11, s = 1, a = .95, tone = .08) {
  X.save(); poly(pts); X.clip(); seed(s);
  let xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  const x0 = Math.min(...xs) - 20, x1 = Math.max(...xs) + 20, y0 = Math.min(...ys) - 20, y1 = Math.max(...ys) + 20;
  X.lineCap = 'butt'; X.lineWidth = gap + 1.5;
  if (dir === 'v') for (let x = x0; x <= x1; x += gap) { X.strokeStyle = mix(col, '#000000', rnd(-tone, tone) + tone); X.globalAlpha = a * rnd(.85, 1); X.beginPath(); X.moveTo(x + jit(1.5), y0 + rnd(0, 14)); X.lineTo(x + jit(1.5), y1 - rnd(0, 14)); X.stroke(); }
  else if (dir === 'h') for (let y = y0; y <= y1; y += gap) { X.strokeStyle = mix(col, '#000000', rnd(-tone, tone) + tone); X.globalAlpha = a * rnd(.85, 1); X.beginPath(); X.moveTo(x0 + rnd(0, 14), y + jit(1.5)); X.lineTo(x1 - rnd(0, 14), y + jit(1.5)); X.stroke(); }
  else { // diagonal
    const L = (x1 - x0) + (y1 - y0);
    for (let k = -L; k <= L; k += gap) { X.strokeStyle = mix(col, '#000000', rnd(-tone, tone) + tone); X.globalAlpha = a * rnd(.85, 1); X.beginPath(); X.moveTo(x0 + k, y0); X.lineTo(x0 + k + (y1 - y0), y1); X.stroke(); }
  }
  X.globalAlpha = 1; X.restore();
}
function rectPts(x, y, w, h) { return [[x, y], [x + w, y], [x + w, y + h], [x, y + h]]; }
function hatch(pts, col, gap = 9, ang = -0.8, w = 2, s = 1, a = .7) {
  X.save(); poly(pts); X.clip(); seed(s);
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]); const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const L = Math.hypot(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
  X.translate(cx, cy); X.rotate(ang); X.strokeStyle = col; X.lineWidth = w; X.lineCap = 'round'; X.globalAlpha = a;
  for (let y = -L; y <= L; y += gap) { X.beginPath(); X.moveTo(-L + jit(3), y + jit(1)); X.lineTo(L + jit(3), y + jit(1)); X.stroke(); }
  X.globalAlpha = 1; X.restore();
}
function ellipse(cx, cy, rx, ry, col, a = 1, rot = 0) { X.save(); X.translate(cx, cy); X.rotate(rot); X.beginPath(); X.ellipse(0, 0, rx, ry, 0, 0, TAU); X.globalAlpha = a; X.fillStyle = col; X.fill(); X.globalAlpha = 1; X.restore(); }
// the one gradient allowed: a soft pool of light
function pool(cx, cy, rx, ry, col = C.white, a = .55) { X.save(); X.translate(cx, cy); X.scale(1, ry / rx); const g = X.createRadialGradient(0, 0, rx * .2, 0, 0, rx); g.addColorStop(0, col); g.addColorStop(1, 'rgba(255,255,255,0)'); X.globalAlpha = a; X.fillStyle = g; X.beginPath(); X.arc(0, 0, rx, 0, TAU); X.fill(); X.globalAlpha = 1; X.restore(); }
function glow(cx, cy, r, col, a = .4) { X.save(); const g = X.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); X.globalCompositeOperation = 'multiply'; X.globalAlpha = 0; X.restore(); X.save(); X.globalAlpha = a; X.fillStyle = g; X.beginPath(); X.arc(cx, cy, r, 0, TAU); X.fill(); X.restore(); }

// ---------- paper ----------
function paper() { X.fillStyle = C.paper; X.fillRect(0, 0, W, H); seed(3); X.globalAlpha = .06; for (let i = 0; i < 900; i++) { X.fillStyle = R() < .5 ? '#000' : '#fff'; X.fillRect(rnd(0, W), rnd(0, H), rnd(1, 3), rnd(1, 3)); } X.globalAlpha = 1; }
// a ragged marker rectangle: the mask every exterior sits inside. Same seed for the whole run.
function paperFrame(s = 11, inset = 40, rag = 26) {
  seed(s); const p = [];
  const step = 14;
  for (let x = inset; x <= W - inset; x += step) p.push([x, inset + rnd(0, rag)]);
  for (let y = inset; y <= H - inset; y += step) p.push([W - inset - rnd(0, rag), y]);
  for (let x = W - inset; x >= inset; x -= step) p.push([x, H - inset - rnd(0, rag)]);
  for (let y = H - inset; y >= inset; y -= step) p.push([inset + rnd(0, rag), y]);
  return p;
}
function clipTo(pts) { poly(pts); X.clip(); }

// ---------- faces: two dots and a mouth ----------
// state: calm | happy | worry | shock | sleep | blink
function face(cx, cy, s, state = 'calm', rot = 0, col = C.ink) {
  X.save(); X.translate(cx, cy); X.rotate(rot); X.fillStyle = col; X.strokeStyle = col; X.lineCap = 'round'; X.lineWidth = s * .09;
  const ex = s * .32, ey = -s * .12, r = s * .085;
  if (state === 'sleep' || state === 'blink') { X.beginPath(); X.moveTo(-ex - r, ey); X.lineTo(-ex + r, ey); X.moveTo(ex - r, ey); X.lineTo(ex + r, ey); X.stroke(); }
  else { X.beginPath(); X.arc(-ex, ey, r, 0, TAU); X.arc(ex, ey, r, 0, TAU); X.fill(); }
  if (state === 'worry') { X.beginPath(); X.moveTo(-ex - r, ey - s * .22); X.lineTo(-ex + r, ey - s * .17); X.moveTo(ex + r, ey - s * .22); X.lineTo(ex - r, ey - s * .17); X.stroke(); }
  X.beginPath();
  if (state === 'calm') { X.moveTo(-s * .12, s * .2); X.quadraticCurveTo(0, s * .27, s * .12, s * .2); X.stroke(); }
  else if (state === 'happy') { X.moveTo(-s * .18, s * .16); X.quadraticCurveTo(0, s * .36, s * .18, s * .16); X.stroke(); }
  else if (state === 'worry') { X.moveTo(-s * .12, s * .25); X.quadraticCurveTo(0, s * .19, s * .12, s * .25); X.stroke(); }
  else if (state === 'shock') { X.ellipse(0, s * .24, s * .07, s * .1, 0, 0, TAU); X.fill(); }
  else if (state === 'sleep') { X.moveTo(-s * .08, s * .22); X.lineTo(s * .08, s * .22); X.stroke(); }
  else { X.moveTo(-s * .12, s * .2); X.quadraticCurveTo(0, s * .27, s * .12, s * .2); X.stroke(); }
  X.restore();
}

// ---------- the stub ----------
// A ticket stub: butter yellow, diagonal pencil hatch, one perforated line, ADMIT ONE in IndieAgent red, a face on the big half.
function stub(cx, cy, rot = 0, s = 1, state = 'calm', o = {}) {
  const w = 230 * s, h = 110 * s;
  X.save(); X.translate(cx, cy); X.rotate(rot);
  if (o.shadow) ellipse(0, h * .65, w * .5, h * .18, C.ink, .12);
  const body = [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]];
  flat(body, C.stub); hatch(body, C.stubH, 9 * s, -0.75, 2 * s, 21, .6);
  // notched ends
  X.fillStyle = C.paper; for (const sx of [-1, 1]) for (let k = -1; k <= 1; k++) { X.beginPath(); X.arc(sx * w / 2, k * h * .32, 7 * s, 0, TAU); X.fill(); }
  // perforation
  X.strokeStyle = C.ink; X.lineWidth = 2.5 * s; X.setLineDash([6 * s, 7 * s]); X.beginPath(); X.moveTo(w * .22, -h / 2 + 6); X.lineTo(w * .22, h / 2 - 6); X.stroke(); X.setLineDash([]);
  // text on the small half, upright, fits inside its box with margin
  X.save(); X.translate(w * .36, 0); X.rotate(-TAU / 4); X.fillStyle = C.red; X.font = `700 ${Math.round(16 * s)}px "Archivo", "Helvetica Neue", Arial, sans-serif`; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText('ADMIT ONE', 0, 0); X.restore();
  // star on the big half
  X.save(); X.translate(-w * .36, -h * .28); X.fillStyle = C.red; X.beginPath(); for (let i = 0; i < 10; i++) { const r = (i % 2 ? 4 : 9) * s, a = i / 10 * TAU - TAU / 4; X.lineTo(Math.cos(a) * r, Math.sin(a) * r); } X.closePath(); X.fill(); X.restore();
  // lifted corner
  if (o.curl) { const c = o.curl * 26 * s; flat([[-w / 2, -h / 2], [-w / 2 + c, -h / 2], [-w / 2, -h / 2 + c]], C.stubL); ink([[-w / 2 + c, -h / 2], [-w / 2, -h / 2 + c]], false, 4 * s); }
  ink(body, true, 5 * s, C.ink, 5);
  face(-w * .12, h * .02, 70 * s, state);
  X.restore();
}

// ---------- the cable ----------
// Every pose is a list of control points; the body is a Catmull-Rom spline through them, resampled to N points so poses can morph.
const N = 72;
function spline(ctrl, n = N) {
  const P = ctrl; const out = []; const segs = P.length - 1;
  for (let i = 0; i < n; i++) {
    const u = i / (n - 1) * segs, k = Math.min(segs - 1, Math.floor(u)), t = u - k;
    const p0 = P[Math.max(0, k - 1)], p1 = P[k], p2 = P[k + 1], p3 = P[Math.min(P.length - 1, k + 2)];
    const t2 = t * t, t3 = t2 * t;
    out.push([0, 1].map(j => 0.5 * ((2 * p1[j]) + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3)));
  }
  return out;
}
const morph = (A, B, t) => A.map((p, i) => [lerp(p[0], B[i][0], t), lerp(p[1], B[i][1], t)]);
// pose generators (control points), all drawn with the head jack at the END of the list
function poseCoil(cx, cy, r = 60, turns = 3, head = [0, -40]) { // flat coil lying on something, head jack resting out one side
  const p = []; const n = Math.round(turns * 10);
  for (let i = 0; i <= n; i++) { const a = i / 10 * TAU, k = 1 - i / n * .45; p.push([cx + Math.cos(a) * r * k, cy + Math.sin(a) * r * .38 * k + i * 1.2]); }
  p.push([cx + r * .7 + head[0], cy + head[1]]); return p;
}
function poseLine(x0, y0, x1, y1, sag = 0) { const p = []; for (let i = 0; i <= 6; i++) { const t = i / 6; p.push([lerp(x0, x1, t), lerp(y0, y1, t) + Math.sin(t * Math.PI) * sag]); } return p; }
function poseHook(bx, by, hx, hy, r = 60) { // tail at base, rising to a hook that bends toward (hx,hy)
  const p = [[bx, by], [bx + (hx - bx) * .25, by - 40], [bx + (hx - bx) * .55, lerp(by, hy, .7)], [hx - r, hy - r * .2], [hx - r * .4, hy - r * .95], [hx + r * .35, hy - r * .85], [hx + r * .55, hy - r * .2], [hx + r * .25, hy + r * .25]];
  return p;
}
function poseWheel(cx, cy, r = 70, roll = 0, tail = [-90, 10]) { // a circle plus a short trailing tail; roll turns the circle
  const p = [[cx + tail[0], cy + tail[1]], [cx - r * .9, cy + r * .5]];
  for (let i = 0; i <= 12; i++) { const a = roll + Math.PI * .75 + i / 12 * TAU; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
  p.push([cx + Math.cos(roll + Math.PI * .75 + TAU + .5) * r * .9, cy + Math.sin(roll + Math.PI * .75 + TAU + .5) * r * .9]);
  return p;
}
function poseSpring(cx, cy, w = 70, h = 160, turns = 4, squash = 1) { // vertical zigzag coil standing on (cx,cy)
  const p = [[cx - w, cy]]; const n = turns * 2;
  for (let i = 0; i <= n; i++) p.push([cx + (i % 2 ? w : -w) * .8, cy - h * squash * i / n]);
  p.push([cx + w * .2, cy - h * squash - 30]); return p;
}
function posePole(bx, by, top, lean = 0) { const p = []; for (let i = 0; i <= 5; i++) { const t = i / 5; p.push([bx + lean * t * t, by - top * t]); } return p; }
function poseLasso(bx, by, cx, cy, r = 70, open = 1) { // a line from base to a loop around (cx,cy); open 1 = wide loop, 0 = tight
  const p = [[bx, by], [lerp(bx, cx, .5), lerp(by, cy, .5) - 60], [cx - r * 1.4, cy]];
  for (let i = 0; i <= 10; i++) { const a = Math.PI + i / 10 * TAU; p.push([cx + Math.cos(a) * r * (1.6 - .6 * (1 - open)) , cy + Math.sin(a) * r * (1.2 - .5 * (1 - open))]); }
  return p;
}
function poseKnot(cx, cy, r = 34) { // the resting loop around the stub's corner
  const p = [[cx - 160, cy + 50], [cx - 90, cy + 30], [cx - r * 1.5, cy]];
  for (let i = 0; i <= 10; i++) { const a = Math.PI + i / 10 * TAU; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r * .8]); }
  return p;
}
// draw the cable: ink outline, body, one white streak, brass jacks at both ends, two dots as eyes near the head
function cable(pts, o = {}) {
  const w = o.w || 13;
  const strokeP = (ww, col, a = 1, off = 0) => { X.beginPath(); pts.forEach((p, i) => i ? X.lineTo(p[0] + off, p[1] + off) : X.moveTo(p[0] + off, p[1] + off)); X.strokeStyle = col; X.lineWidth = ww; X.lineCap = 'round'; X.lineJoin = 'round'; X.globalAlpha = a; X.stroke(); X.globalAlpha = 1; };
  if (o.shadow) strokeP(w + 2, C.ink, .12, 8);
  strokeP(w + 6, C.ink); strokeP(w, o.col || C.cable); strokeP(w * .28, C.cableL, .9, -w * .22);
  // jacks: a brass plug along the tangent at each end
  const jack = (a, b, dir) => { const ang = Math.atan2(b[1] - a[1], b[0] - a[0]); X.save(); X.translate(a[0], a[1]); X.rotate(ang); const L = 36, hh = w * .55;
    flat([[0, -hh], [-L, -hh], [-L, hh], [0, hh]], C.ink); flat([[-L, -hh * .6], [-L - 22, -hh * .6], [-L - 22, hh * .6], [-L, hh * .6]], C.brass);
    X.fillStyle = C.brassL; X.fillRect(-L - 20, -hh * .5, 18, hh * .3); X.strokeStyle = C.ink; X.lineWidth = 3; X.strokeRect(-L - 22, -hh * .6, 22, hh * 1.2); X.restore(); };
  jack(pts[0], pts[1]); jack(pts[pts.length - 1], pts[pts.length - 2]);
  // eyes: on the body a little back from the head, perpendicular to the cable
  const k = pts.length - 7, a = pts[k], b = pts[k + 1], ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  if (o.eyes !== false) { const st = o.state || 'calm'; const nx = -Math.sin(ang), ny = Math.cos(ang); const e1 = [a[0] + nx * w * .25, a[1] + ny * w * .25], e2 = pts[k - 4] || a;
    X.fillStyle = C.white; X.strokeStyle = C.ink; X.lineWidth = 2.5;
    for (const e of [e1, [e2[0] + nx * w * .25, e2[1] + ny * w * .25]]) { X.beginPath(); X.arc(e[0], e[1], w * .42, 0, TAU); X.fill(); X.stroke(); X.fillStyle = C.ink;
      if (st === 'sleep') { X.beginPath(); X.moveTo(e[0] - w * .3, e[1]); X.lineTo(e[0] + w * .3, e[1]); X.stroke(); } else { X.beginPath(); X.arc(e[0] + (o.look || 0) * w * .15, e[1], w * .2, 0, TAU); X.fill(); }
      X.fillStyle = C.white; }
  }
}

// ---------- scenery pieces ----------
function cityStrip(y0, y1, s = 4, dark = C.navyD, x0 = 0, x1 = W) { // towers as darker vertical bars with scattered lit windows, no outlines
  seed(s); let x = x0; while (x < x1) { const w = rnd(40, 110), h = rnd(0, 1) * (y1 - y0) * .8 + (y1 - y0) * .2; marker(rectPts(x, y1 - h, w, h), dark, 'v', 10, s + x, .95, .05);
    for (let i = 0; i < w * h / 2600; i++) { X.fillStyle = C.win; X.globalAlpha = rnd(.6, 1); X.fillRect(x + rnd(6, w - 14), y1 - h + rnd(10, h - 16), 8, 6); } X.globalAlpha = 1; x += w + rnd(2, 8); }
}
function bulbs(x0, x1, y, n, on = 0, s = 9) { // a row of marquee bulbs; `on` is the fraction lit from the left
  for (let i = 0; i < n; i++) { const x = lerp(x0, x1, i / (n - 1)); const lit = i / (n - 1) < on; if (lit) { pool(x, y, 22, 22, C.amberL, .8); } X.beginPath(); X.arc(x, y, 7, 0, TAU); X.fillStyle = lit ? C.amberL : C.greyD; X.fill(); X.strokeStyle = C.ink; X.lineWidth = 3; X.stroke(); }
}
function sparkle(x, y, r, col = C.ink) { X.strokeStyle = col; X.lineWidth = 3; X.lineCap = 'round'; for (let i = 0; i < 4; i++) { const a = i / 4 * TAU + TAU / 8; X.beginPath(); X.moveTo(x + Math.cos(a) * r * .35, y + Math.sin(a) * r * .35); X.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); X.stroke(); } }
function motionLines(x, y, ang, n = 3, len = 40, col = C.ink) { X.strokeStyle = col; X.lineWidth = 3; X.lineCap = 'round'; X.globalAlpha = .6; for (let i = 0; i < n; i++) { const o = (i - (n - 1) / 2) * 14; const nx = -Math.sin(ang) * o, ny = Math.cos(ang) * o; X.beginPath(); X.moveTo(x + nx, y + ny); X.lineTo(x + nx - Math.cos(ang) * len, y + ny - Math.sin(ang) * len); X.stroke(); } X.globalAlpha = 1; }
