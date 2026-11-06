// In Her Dream, cut-paper look test: "she can smile out loud / her love is the sky /
// her children are the clouds / she's OK because nobody's gotta go away" (song 44.9-73.3).
// Figure-ground: she is one dark paper profile; on "sky" her silhouette becomes a window onto a
// night sky, and the clouds drifting inside it have her kids' profiles on their leading edges.
// Every frame is a pure function of song time t. Paper moves on twos (12 steps a second).
const W = 1920, H = 1080;
const cv = document.getElementById('c'); cv.width = W; cv.height = H;
const g = cv.getContext('2d');

const C = {
  rose: '#e6a096', roseDeep: '#d4847c', cream: '#f4ead6', navy: '#1d2852', ink: '#141c3d',
  sky0: '#17204a', sky1: '#2c2f6e', sky2: '#5b4588', sky3: '#9a5a8c',
  gold: '#f1b23a', goldPale: '#f7d27e', mint: '#bfe0d2', sun: '#f6dfb0',
};
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const ss = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
const eo = (k) => 1 - Math.pow(1 - clamp(k), 3);
const back = (k) => { k = clamp(k); const c = 1.6; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };
const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const twos = (t) => Math.floor(t * 12) / 12;                 // paper moves on twos
const jit = (t, k, a = 1.2) => (hash(Math.floor(t * 12) * 7.3 + k) - .5) * 2 * a;  // hand-placed wobble

// ---------- paper grain (made once) ----------
function grainCanvas(seed, w = W, h = H) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d');
  const id = x.createImageData(w, h); const d = id.data;
  for (let i = 0; i < d.length; i += 4) {
    const v = 128 + (hash(i * .25 + seed) - .5) * 70; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255;
  }
  x.putImageData(id, 0, 0);
  // fibres
  x.globalAlpha = .07; x.lineWidth = 1;
  for (let i = 0; i < 2600; i++) {
    const px = hash(i + seed) * w, py = hash(i * 3.1 + seed) * h, a = hash(i * 5.7 + seed) * Math.PI, l = 8 + hash(i * 9.1) * 30;
    x.strokeStyle = hash(i * 2.3) > .5 ? '#fff' : '#000';
    x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + Math.cos(a + .4) * l * .5, py + Math.sin(a + .4) * l * .5, px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke();
  }
  return c;
}
const GRAIN = grainCanvas(1.7), GRAIN2 = grainCanvas(9.3);
const MOTTLE = (() => { const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
  const s = grainCanvas(4.4, 96, 54); x.imageSmoothingQuality = 'high'; x.filter = 'blur(18px)'; x.drawImage(s, -40, -40, W + 80, H + 80); return c; })();

// ---------- shapes ----------
// A shape is [x0,y0, then cubic segments c1x,c1y,c2x,c2y,x,y ...] in its own units.
function pathOf(pts) {
  const p = new Path2D(); p.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 6) p.bezierCurveTo(pts[i], pts[i + 1], pts[i + 2], pts[i + 3], pts[i + 4], pts[i + 5]);
  p.closePath(); return p;
}
const mix = (a, b, k) => a.map((v, i) => lerp(v, b[i], k));

// HER: head-and-shoulders profile facing right, loose low bun. Units ~1000 box, chin near y 750.
const HER_SMILE = [
  150, 1180,
  220, 1040, 330, 950, 372, 850,       // back up to the nape
  384, 812, 378, 782, 356, 760,        // into the bun
  292, 756, 240, 712, 246, 648,        // bun, lower back
  252, 590, 296, 560, 338, 556,        // bun top
  326, 470, 350, 360, 420, 284,        // back of the head
  492, 204, 612, 190, 682, 250,        // crown
  732, 292, 748, 346, 744, 398,        // forehead
  742, 424, 736, 440, 740, 456,        // brow
  760, 494, 788, 532, 803, 562,        // nose ridge
  808, 575, 799, 585, 783, 587,        // nose tip, under
  771, 589, 766, 596, 769, 606,        // philtrum
  772, 616, 780, 620, 779, 630,        // upper lip
  780, 637, 770, 640, 765, 643,        // mouth corner (smiling, closed)
  771, 650, 777, 656, 773, 668,        // lower lip
  771, 680, 758, 684, 762, 698,        // chin crease
  769, 720, 760, 744, 731, 754,        // chin
  700, 763, 660, 757, 630, 764,        // under the jaw
  614, 794, 611, 834, 630, 884,        // throat
  652, 934, 724, 964, 806, 994,        // collarbone
  860, 1020, 900, 1080, 920, 1180,     // chest, off frame
];
// laughing: mouth open, the jaw drops, chin falls a little; same structure so it can tween
const HER_LAUGH = HER_SMILE.slice();
(() => {
  const seg = (k) => 2 + k * 6;  // index of segment k
  // segments 14.. (upper lip) through 20 (throat) adjust
  const drop = { 15: [-5, 5], 16: [-2, 9], 17: [-2, 9], 18: [-1, 8], 19: [0, 4], 20: [0, 1] };
  for (const [k, [dx, dy]] of Object.entries(drop)) for (let j = 0; j < 6; j += 2) { HER_LAUGH[seg(+k) + j] += dx; HER_LAUGH[seg(+k) + j + 1] += dy; }
  // a deeper notch for the open mouth
  const m = seg(15); HER_LAUGH[m + 4] = 760; HER_LAUGH[m + 5] = 650;
})();

// A cloud whose leading (right) edge is a child's profile. age 0..1 changes proportions.
function kidCloud(age) {
  const s = 1;
  const nose = lerp(8, 13, age), chin = lerp(4, 8, age), fore = lerp(14, 8, age);
  // profile edge at x ~ 200, from chin (bottom) up to crown
  return [
    176, 124,
    186, 122, 194, 114, 194, 104,               // chin
    195, 98, 190, 94, 194, 90,                  // lower lip
    197, 86, 197, 84, 194, 80,                  // upper lip
    196 + nose * .3, 79, 200 + nose, 74, 196 + nose * .8, 66,  // nose tip
    193, 62, 190, 60, 191, 54,                  // nose bridge to brow
    193 + fore * .4, 46, 196, 30, 182, 14,      // forehead to crown (round, kid-high forehead)
    170, -2, 140, -6, 124, 4,                   // crown puff
    112, -12, 78, -12, 70, 8,                   // puff
    56, -4, 26, 4, 30, 30,                      // puff
    6, 30, -6, 66, 16, 82,                      // back puff
    -4, 98, 8, 128, 40, 124,                    // under puff
    60, 140, 96, 140, 112, 128,                 // under puff
    128, 140, 164, 138, 176, 124,               // back to chin
  ];
}
const KIDS = [kidCloud(.15), kidCloud(.55), kidCloud(.95)].map(pathOf);

// ---------- drawing helpers ----------
function cut(path, fill, { sh = 1, grain = .16, lift = 0 } = {}) {
  // a layer of cut paper: soft drop shadow, flat colour, the paper's own grain
  g.save();
  g.shadowColor = `rgba(20,16,30,${.32 * sh})`; g.shadowBlur = 18 + lift * 10; g.shadowOffsetX = 5 + lift * 4; g.shadowOffsetY = 8 + lift * 6;
  g.fillStyle = fill; g.fill(path);
  g.restore();
  if (grain) {
    g.save(); g.clip(path); g.globalAlpha = grain; g.globalCompositeOperation = 'soft-light';
    const m = g.getTransform(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(GRAIN2, 0, 0); g.globalAlpha = grain * 1.6; g.drawImage(MOTTLE, 0, 0); g.setTransform(m);
    g.restore();
  }
}
function circle(x, y, r) { const p = new Path2D(); p.arc(x, y, r, 0, Math.PI * 2); return p; }
function star4(x, y, r) {
  const p = new Path2D(); const k = r * .28;
  p.moveTo(x, y - r); p.quadraticCurveTo(x + k * .4, y - k * .4, x + r, y); p.quadraticCurveTo(x + k * .4, y + k * .4, x, y + r);
  p.quadraticCurveTo(x - k * .4, y + k * .4, x - r, y); p.quadraticCurveTo(x - k * .4, y - k * .4, x, y - r); p.closePath(); return p;
}
// a long torn-paper ribbon (wind), between x0 and x1 at height y with a gentle wave
function ribbon(x0, x1, y, th, ph) {
  const p = new Path2D(); const n = 24; const pts = [];
  for (let i = 0; i <= n; i++) { const u = i / n; pts.push([lerp(x0, x1, u), y + Math.sin(u * 5 + ph) * 22]); }
  p.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i <= n; i++) { const u = i / n; p.lineTo(pts[i][0], pts[i][1] - th * Math.sin(u * Math.PI) * .5 + (hash(i + ph) - .5) * 2); }
  for (let i = n; i >= 0; i--) { const u = i / n; p.lineTo(pts[i][0], pts[i][1] + th * Math.sin(u * Math.PI) * .5 + (hash(i * 3 + ph) - .5) * 2); }
  p.closePath(); return p;
}

// ---------- the scene ----------
const T = { dream: 44.9, she: 48.78, smile: 50.54, out: 51.86, loud: 52.34, love: 54.0, sky: 56.8,
  kids: 58.32, clouds: 59.96, ok: 63.94, nobody: 67.96, go: 69.5, away: 69.98, end: 73.3 };

function frame(tt) {
  const t = twos(tt);
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';

  // ground: warm rose paper; dusk deepens it once she becomes the sky
  const dusk = ss(T.love, T.sky + 1, t);
  g.fillStyle = C.rose; g.fillRect(0, 0, W, H);
  g.globalAlpha = dusk * .55; g.fillStyle = C.roseDeep; g.fillRect(0, 0, W, H); g.globalAlpha = 1;

  // a big pale sun behind her, cut from cream, sinking a little through the section

  // two low hills of darker rose paper along the bottom, layered
  const hill = (y, amp, ph, col) => { const p = new Path2D(); p.moveTo(-20, H + 20); p.lineTo(-20, y);
    for (let x = 0; x <= W + 40; x += 40) p.lineTo(x, y + Math.sin(x / 260 + ph) * amp); p.lineTo(W + 40, H + 20); p.closePath(); cut(p, col, { sh: .6 }); };
  hill(900, 26, 1.2, '#d9877f'); hill(975, 18, 3.4, '#c9746f');

  // ---- HER ----
  const enter = eo((t - (T.dream - .6)) / 3.2);                 // she slides in from the left
  const laughK = ss(T.smile - .25, T.smile + .25, t) * (1 - ss(T.love + 1.2, T.love + 2.6, t) * .75);
  // laughing bobs on each word of "smile out loud"
  let bob = 0; for (const w of [T.smile, T.out, T.loud]) { const d = t - w; if (d > 0 && d < .7) bob += Math.sin(d / .7 * Math.PI) * 9; }
  const tilt = -ss(T.she, T.smile, t) * .07 - bob * .004 + ss(T.love + 1, T.sky + 2, t) * .05 + ss(T.ok, T.ok + 3, t) * .03;
  const zoom = lerp(1.3, 1.22, ss(T.love, T.clouds, t));
  const her = pathOf(HER_SMILE);
  const ox = lerp(-900, 0, enter) + 470 + jit(t, 3), oy = -150 - bob * .6 + jit(t, 4);

  const toHer = () => { g.translate(ox, oy); g.scale(zoom, zoom); g.translate(560, 900); g.rotate(tilt); g.translate(-560, -900); };

  // the sun is a halo behind her head, two rings of cream and gold paper
  g.save(); toHer();
  const sunR = 400 + Math.sin(t * .5) * 4;
  cut(circle(470, 470, sunR + 34), C.goldPale, { sh: .5, grain: .25 });
  cut(circle(470, 470, sunR), C.sun, { sh: .6, grain: .25 });
  g.restore();
  // her paper silhouette
  g.save(); toHer(); cut(her, C.navy, { sh: 1.2, lift: 1, grain: .3 }); g.restore();

  // the sky inside her: wipes down from the crown on "her love is the sky"
  const skyK = ss(T.love + .2, T.sky + .3, t);
  if (skyK > 0) {
    g.save(); toHer(); g.clip(her);
    const m = g.getTransform();
    g.setTransform(1, 0, 0, 1, 0, 0);
    const top = lerp(-200, 0, 1), reveal = lerp(0, H + 200, skyK);
    g.beginPath(); g.rect(0, -10, W, reveal + Math.sin(t * 3) * 0); g.clip();
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, C.sky0); gr.addColorStop(.45, C.sky1); gr.addColorStop(.8, C.sky2); gr.addColorStop(1, C.sky3);
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    g.globalAlpha = .18; g.globalCompositeOperation = 'soft-light'; g.drawImage(GRAIN, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
    // stars, cut from cream, appearing on "sky"
    for (let i = 0; i < 26; i++) {
      const sx = 900 + hash(i * 4.1) * 900, sy = 120 + hash(i * 7.7) * 700;
      const on = ss(T.sky - .3 + hash(i) * 1.6, T.sky + .2 + hash(i) * 1.6, t);
      const tw = .75 + .25 * Math.sin(t * 3 + i * 2);
      if (on > 0) { g.globalAlpha = on; const r = (hash(i * 2.9) > .8 ? 16 : 7) * tw * on;
        g.fillStyle = hash(i * 1.3) > .7 ? C.goldPale : C.cream; g.fill(star4(sx, sy, r)); }
    }
    g.globalAlpha = 1;
    // a gold crescent moon high in her head
    const mo = ss(T.sky, T.sky + 1.2, t);
    if (mo > 0) { g.globalAlpha = mo; const p = new Path2D(); p.arc(1320, 300, 46, 0, Math.PI * 2); const q = new Path2D(); q.arc(1340, 288, 40, 0, Math.PI * 2);
      const cr = new Path2D(); cr.arc(1320, 300, 46, Math.PI * .28, Math.PI * 1.72, false); cr.arc(1346, 290, 40, Math.PI * 1.62, Math.PI * .38, true); cr.closePath();
      g.fillStyle = C.gold; g.fill(cr); g.globalAlpha = 1; }

    // ---- the cloud children (drawn in her own coordinates, so they move with her) ----
    g.setTransform(m);
    const wind = ss(T.nobody - .4, T.go, t) * (1 - ss(T.away + .3, T.away + 1.6, t));
    const kids = [
      { k: 0, at: T.kids,        x: 470, y: 330, s: .8 },
      { k: 1, at: T.kids + .55,  x: 560, y: 500, s: .95 },
      { k: 2, at: T.clouds - .1, x: 400, y: 640, s: 1.05 },
    ];
    const rest = [{ x: 560, y: 320 }, { x: 600, y: 480 }, { x: 520, y: 640 }];  // nestled toward her face
    kids.forEach((kd, i) => {
      if (t < kd.at - .05) return;
      const arr = back((t - kd.at) / 1.6);
      const drift = Math.sin(t * .9 + i * 2.1) * 8;
      let x = lerp(kd.x - 420, kd.x, arr) + drift, y = kd.y + Math.cos(t * .7 + i) * 6;
      x += wind * (70 + i * 20) + Math.sin(t * 19 + i) * 4 * wind;   // the wind pushes; her edge holds them
      const settle = ss(T.away + .2, T.away + 2.6, t);
      x = lerp(x, rest[i].x + drift * .5, settle); y = lerp(y, rest[i].y, settle);
      const sq = 1 - wind * .12;
      g.save(); g.translate(x, y); g.scale(kd.s / sq, kd.s * sq); g.translate(-100, -64);
      g.globalAlpha = clamp((t - kd.at) / .3);
      cut(KIDS[kd.k], C.cream, { sh: .9, grain: .22, lift: .6 });
      g.strokeStyle = C.sky1; g.lineWidth = 2.6; g.lineCap = 'round';
      g.beginPath(); g.arc(178, 56, 6, Math.PI * .15, Math.PI * .85); g.stroke();
      g.restore();
    });
    g.restore();
  }

  // her closed laughing eye, cut out of the silhouette so the ground shows through
  g.save(); toHer();
  const eyeK = ss(T.she, T.smile, t);
  g.strokeStyle = skyK > .6 ? C.goldPale : C.rose; g.lineWidth = lerp(4, 7, eyeK); g.lineCap = 'round';
  g.beginPath();
  if (eyeK < .5) g.arc(706, 452, 13, Math.PI * .1, Math.PI * .9);           // relaxed lid
  else g.arc(706, 446, 18, Math.PI * .12, Math.PI * .88);                    // crinkled laugh
  if (skyK < .98 || true) g.stroke();
  g.restore();

  // her laugh: gold rings that ride out from her mouth on "smile out loud"
  for (const [w, n] of [[T.smile, 3], [T.out, 2], [T.loud, 4]]) {
    for (let r = 0; r < n; r++) {
      const d = t - w - r * .16; if (d < 0 || d > 2.6) continue;
      const k = d / 2.6;
      g.save(); toHer();
      g.translate(800, 640); g.rotate(-.35);
      g.globalAlpha = (1 - k) * .95; g.strokeStyle = r % 2 ? C.goldPale : C.gold; g.lineWidth = lerp(16, 4, k); g.lineCap = 'round';
      g.beginPath(); g.arc(0, 0, 40 + k * 520, -0.75, 0.75); g.stroke();
      g.restore();
    }
  }

  // wind ribbons: torn pale paper streaming across, "nobody's gotta go away"
  const windOn = ss(T.nobody - .6, T.go - .2, t) * (1 - ss(T.away, T.away + 1.4, t));
  if (windOn > 0) {
    for (let i = 0; i < 4; i++) {
      const y = 200 + i * 190 + hash(i) * 50, sp = 1400 + hash(i * 3) * 600;
      const x0 = -900 + ((t - T.nobody) * sp + hash(i * 5) * 1600) % 3400 - 400;
      g.globalAlpha = Math.min(1, windOn * 1.4);
      cut(ribbon(x0, x0 + 620 + hash(i * 7) * 300, y, 26 + hash(i * 9) * 14, i * 1.7), i % 2 ? C.mint : C.cream, { sh: .7, grain: .2 });
    }
    g.globalAlpha = 1;
  }

  // drifting petals of gold paper in the opening, before the sky
  const petals = 1 - ss(T.love, T.love + 2, t);
  if (petals > 0) for (let i = 0; i < 14; i++) {
    const u = ((t - 44) * (.04 + hash(i) * .03) + hash(i * 3)) % 1;
    const px = W * (.05 + hash(i * 5) * .9) + Math.sin(t * .8 + i) * 30, py = H * (1.1 - u * 1.25);
    g.save(); g.translate(px, py); g.rotate(t * .6 + i); g.globalAlpha = petals * .9;
    const p = new Path2D(); p.ellipse(0, 0, 14, 6, 0, 0, Math.PI * 2); cut(p, i % 3 ? C.gold : C.cream, { sh: .5, grain: 0 }); g.restore();
  }

  // whole-frame paper: grain, a soft warm vignette, a hint of print warmth
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = .3; g.globalCompositeOperation = 'overlay'; g.drawImage(GRAIN, 0, 0); g.globalAlpha = .35; g.drawImage(MOTTLE, 0, 0);
  g.globalCompositeOperation = 'multiply'; g.globalAlpha = 1;
  const v = g.createRadialGradient(W / 2, H / 2, H * .45, W / 2, H / 2, H * 1.05); v.addColorStop(0, 'rgba(255,255,255,0)'); v.addColorStop(1, 'rgba(120,70,80,.45)');
  g.fillStyle = v; g.fillRect(0, 0, W, H);
  g.globalCompositeOperation = 'source-over';
  // section fade in/out for the test clip
  const fin = clamp((tt - 44.3) / .6), fout = 1 - clamp((tt - 73.1) / .6);
  if (fin * fout < 1) { g.globalAlpha = 1 - fin * fout; g.fillStyle = '#000'; g.fillRect(0, 0, W, H); g.globalAlpha = 1; }
}

window.__frameJPEG = (t, q = .93) => { frame(t); return cv.toDataURL('image/jpeg', q); };
window.__ready = Promise.resolve(true);
const params = new URLSearchParams(location.search);
if (!params.has('offline')) {
  const audio = document.getElementById('a'); const T0 = 44.3, T1 = 73.8;
  audio.currentTime = params.has('t') ? parseFloat(params.get('t')) : T0;
  (function loop() { let t = audio.currentTime || T0; if (t >= T1) { audio.currentTime = T0; t = T0; } frame(t); requestAnimationFrame(loop); })();
  const toggle = () => audio.paused ? audio.play() : audio.pause();
  cv.onclick = toggle; addEventListener('keydown', (e) => { if (e.code === 'Space') { e.preventDefault(); toggle(); } });
}
