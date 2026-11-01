// 44.9-73.28  "she can smile out loud / her love is the sky / her children are the clouds /
// she's OK because nobody's gotta go away". The approved look test (cutpaper-v1), ported.
// She is one navy paper profile in front of a paper sun halo; on "sky" her silhouette fills with night,
// and the clouds inside it carry her kids' profiles on their leading edges.
(() => {
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
const SKY_T = { dream: 44.9, she: 49.89, smile: 50.49, out: 51.95, loud: 52.4, love: 55.4, sky: 56.62,
  kids: 58.24, clouds: 59.96, ok: 64.86, nobody: 67.96, go: 69.48, away: 69.7, end: 73.3 };
const KID_CLOUDS = [kidCloud(.15), kidCloud(.55), kidCloud(.95)].map(pathOf);

SHOT(44.9, 73.28, 'sky', (t) => {
  const T = SKY_T, A0 = g.globalAlpha;
  const KIDS = KID_CLOUDS;
  // ground: warm rose paper; dusk deepens it once she becomes the sky
  const dusk = ss(T.love, T.sky + 1, t);
  sheet(C.rose); sheet(C.roseDeep, dusk * .55);

  // a big pale sun behind her, cut from cream, sinking a little through the section

  // two low hills of darker rose paper along the bottom, layered
  const hill = (y, amp, ph, col) => { const p = new Path2D(); p.moveTo(-20, H + 20); p.lineTo(-20, y);
    for (let x = 0; x <= W + 40; x += 40) p.lineTo(x, y + Math.sin(x / 260 + ph) * amp); p.lineTo(W + 40, H + 20); p.closePath(); cut(p, col, { sh: .6 }); };
  hill(900, 26, 1.2, '#d9877f'); hill(975, 18, 3.4, '#c9746f');

  // ---- HER ----
  // draft 2: the halo is fixed from the first frame (03's cradle halo lands exactly on it, a match cut) and
  // she rises into it from below; draft 1 slid her in from the left with the halo
  const rise = eo((t - 44.75) / 2.0);
  const laughK = ss(T.smile - .25, T.smile + .25, t) * (1 - ss(T.love + 1.2, T.love + 2.6, t) * .75);
  // laughing bobs on each word of "smile out loud"
  let bob = 0; for (const w of [T.smile, T.out, T.loud]) { const d = t - w; if (d > 0 && d < .7) bob += Math.sin(d / .7 * Math.PI) * 9; }
  const tilt = -ss(T.she, T.smile, t) * .07 - bob * .004 + ss(T.love + 1, T.sky + 2, t) * .05 + ss(T.ok, T.ok + 3, t) * .03;
  const zoom = lerp(1.3, 1.22, ss(T.love, T.clouds, t));
  const her = HEADS.her;
  const ox = 470 + jit(t, 3), oy = -150 - bob * .6 + jit(t, 4);
  // her own layer: rises in, a slow ~5% push toward her through the section, tiny head tilts on "smile"
  // and "She's OK" (both gone well before the last second, which 05's transition picks up from)
  const push = 1 + .05 * eio(ss(45.6, 73.3, t));
  const nod = -bump(t, T.smile - .05, .9) * .05 + bump(t, T.ok, 1.0) * .06;
  const toHalo = () => { g.translate(ox, oy); g.scale(zoom, zoom); g.translate(560, 900); g.rotate(tilt); g.translate(-560, -900); };
  const toHer = () => { g.translate(1060, 560); g.scale(push, push); g.translate(-1060, -560);
    g.translate(ox, oy + (1 - rise) * 760); g.scale(zoom, zoom); g.translate(560, 900); g.rotate(tilt + nod); g.translate(-560, -900); };

  // the sun is a halo behind her head, two rings of cream and gold paper
  g.save(); toHalo();
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
    const reveal = lerp(-30, H + 200, skyK);
    // a torn-paper edge (as 03's night band), with a pale fibrous core along the tear
    const torn = new Path2D(); torn.moveTo(-20, -20);
    const edge = []; for (let x = -20; x <= W + 20; x += 36) edge.push([x, reveal + (hash(x * .31 + 7) - .5) * 30 + Math.sin(x / 170) * 9]);
    edge.forEach(([x, y]) => torn.lineTo(x, y)); torn.lineTo(W + 20, -20); torn.closePath();
    g.save(); g.shadowColor = 'rgba(8,6,20,.55)'; g.shadowBlur = 14; g.shadowOffsetY = 8; g.fillStyle = C.sky0; g.fill(torn); g.restore();
    if (skyK < 1) { g.save(); g.strokeStyle = 'rgba(244,234,214,.55)'; g.lineWidth = 3; g.lineJoin = 'round'; g.beginPath(); edge.forEach(([x, y], i) => i ? g.lineTo(x, y + 2) : g.moveTo(x, y + 2)); g.stroke(); g.restore(); }
    g.clip(torn);
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, C.sky0); gr.addColorStop(.45, C.sky1); gr.addColorStop(.8, C.sky2); gr.addColorStop(1, C.sky3);
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    g.globalAlpha = .18; g.globalCompositeOperation = 'soft-light'; g.drawImage(GRAIN, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = A0;
    // stars, cut from cream, appearing on "sky"
    for (let i = 0; i < 26; i++) {
      const sx = 900 + hash(i * 4.1) * 900, sy = 120 + hash(i * 7.7) * 700;
      const on = ss(T.sky - .3 + hash(i) * 1.6, T.sky + .2 + hash(i) * 1.6, t);
      const tw = .75 + .25 * Math.sin(t * 3 + i * 2);
      if (on > 0) { g.globalAlpha = A0 * on; const r = (hash(i * 2.9) > .8 ? 16 : 7) * tw * on;
        g.fillStyle = hash(i * 1.3) > .7 ? C.goldPale : C.cream; g.fill(star4(sx, sy, r)); }
    }
    g.globalAlpha = A0;
    // a gold crescent moon high in her head
    const mo = ss(T.sky, T.sky + 1.2, t);
    if (mo > 0) { g.globalAlpha = A0 * mo; const p = new Path2D(); p.arc(1320, 300, 46, 0, Math.PI * 2); const q = new Path2D(); q.arc(1340, 288, 40, 0, Math.PI * 2);
      const cr = new Path2D(); cr.arc(1320, 300, 46, Math.PI * .28, Math.PI * 1.72, false); cr.arc(1346, 290, 40, Math.PI * 1.62, Math.PI * .38, true); cr.closePath();
      g.fillStyle = C.gold; g.fill(cr); g.globalAlpha = A0; }

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
      // draft 2: they pop in already inside her (opaque paper from the first frame) instead of sliding in
      const arr = clamp(back((t - kd.at) / .7), 0, 1.2);
      const drift = Math.sin(t * .9 + i * 2.1) * 8;
      let x = lerp(kd.x - 70, kd.x, eo((t - kd.at) / .7)) + drift, y = kd.y + Math.cos(t * .7 + i) * 6;
      // the wind pulls them back toward the edge of her head, they stretch, her edge holds them
      x -= wind * (95 + i * 30) + Math.sin(t * 19 + i) * 5 * wind;
      const settle = clamp(back(clamp((t - T.away + .05) / .8)), 0, 1.15);
      x = lerp(x, rest[i].x + drift * .5, settle); y = lerp(y, rest[i].y, settle);
      const sq = 1 - wind * .2;
      g.save(); g.translate(x, y); g.scale(arr * kd.s / sq, arr * kd.s * sq); g.translate(-100, -64);
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
  if (OLD) specsArm(g.strokeStyle, g.lineWidth * .8);     // her spectacles' arm, in the eye's colour
  g.restore();

  // her laugh: gold rings that ride out from her mouth on "smile out loud"
  for (const [w, n] of [[T.smile, 3], [T.out, 2], [T.loud, 4]]) {
    for (let r = 0; r < n; r++) {
      const d = t - w - r * .16; if (d < 0 || d > 2.6) continue;
      const k = d / 2.6;
      g.save(); toHer();
      g.translate(800, 640); g.rotate(-.35);
      g.globalAlpha = A0 * (1 - k) * .95; g.strokeStyle = r % 2 ? C.goldPale : C.gold; g.lineWidth = lerp(16, 4, k); g.lineCap = 'round';
      g.beginPath(); g.arc(0, 0, 40 + k * 520, -0.75, 0.75); g.stroke();
      g.restore();
    }
  }

  // wind ribbons: torn pale paper streaming across, "nobody's gotta go away"
  const windOn = ss(T.nobody - .6, T.go - .2, t) * (1 - ss(T.away, T.away + 1.4, t));
  if (windOn > 0) {
    for (let i = 0; i < 5; i++) {
      const y = 170 + i * 170 + hash(i) * 50, sp = 1500 + hash(i * 3) * 700;
      const x0 = W + 500 - ((t - T.nobody + .6) * sp + hash(i * 5) * 1600) % 3600;
      g.globalAlpha = A0 * Math.min(1, windOn * 1.6);
      cut(ribbon(x0, x0 + 560 + hash(i * 7) * 320, y, 44 + hash(i * 9) * 22, i * 1.7, 30), i === 2 ? C.goldPale : C.cream, { sh: 1, lift: .4, grain: .2 });
    }
    g.globalAlpha = A0;
  }

  // drifting petals of gold paper in the opening, before the sky
  const petals = 1 - ss(T.love, T.love + 2, t);
  if (petals > 0) for (let i = 0; i < 14; i++) {
    const u = ((t - 44) * (.04 + hash(i) * .03) + hash(i * 3)) % 1;
    const px = W * (.05 + hash(i * 5) * .9) + Math.sin(t * .8 + i) * 30, py = H * (1.1 - u * 1.25);
    g.save(); g.translate(px, py); g.rotate(t * .6 + i); g.globalAlpha = A0 * petals * .9;
    const p = new Path2D(); p.ellipse(0, 0, 14, 6, 0, 0, Math.PI * 2); cut(p, i % 3 ? C.gold : C.cream, { sh: .5, grain: 0 }); g.restore();
  }

}, { xin: 1.0, tr: 'fade' });
})();
