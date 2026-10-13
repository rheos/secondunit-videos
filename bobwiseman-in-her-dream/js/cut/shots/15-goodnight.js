// 225.86-236.6  "She's alright because nobody's gotta say goodnight".
// A street at night seen across. On "She's" one big kitchen window lights: she and her kids are dancing
// in it. Then window after window comes ON instead of off, the last of them exactly on "goodnight".
// The crescent moon sinks to the rooftops as if to say goodnight, and refuses: on "goodnight" it bobs back
// up and stays. Draft 2: a push in to her lit window on "alright" (and back out before the ripple of windows
// fills the street), a bigger moon that clearly dips onto the roofs, and flat paper glows instead of the
// muddy radial halos. The last ~0.8 s is framed exactly as draft 1 (16's iris-in starts from it).
(() => {
const T = { shes: 226.48, alright: 226.96, because: 228.9, nobody: 229.48, say: 231.0, goodnight: 231.3, end: 236.6 };
const BEATS = [225.76, 226.52, 227.29, 228.03, 228.8, 229.54, 230.31, 231.03, 231.75, 232.52, 233.31, 234.05, 234.77, 235.51, 236.25, 237.0];
function beatPh(t) { for (let i = BEATS.length - 2; i >= 0; i--) if (t >= BEATS[i]) return { i, ph: clamp((t - BEATS[i]) / (BEATS[i + 1] - BEATS[i])) }; return { i: 0, ph: 0 }; }
const BASE = 900;
const MOON_X = 942;
// the big kitchen window in her house
const KW = { x: 820, y: 604, w: 320, h: 212 };
const FX = 980, FY = 700;   // camera push target

// the row of houses (x, w, h, roof); index 3 is hers
const HOUSES = [
  { x: -40, w: 300, h: 430, roof: 'flat' }, { x: 260, w: 250, h: 520, roof: 'gable' }, { x: 510, w: 250, h: 470, roof: 'flat' },
  { x: 760, w: 440, h: 420, roof: 'gable', hers: true },
  { x: 1200, w: 260, h: 540, roof: 'flat' }, { x: 1460, w: 230, h: 470, roof: 'gable' }, { x: 1690, w: 280, h: 520, roof: 'flat' },
];
// windows: on-times ripple out from her window, the last batch lands on "goodnight"
const WINS = [];
HOUSES.forEach((Hs, hi) => {
  if (Hs.hers) {
    WINS.push({ x: Hs.x + 120 - 28, y: BASE - Hs.h + 40, w: 56, h: 76, hi }, { x: Hs.x + Hs.w - 120 - 28, y: BASE - Hs.h + 40, w: 56, h: 76, hi });
    return;
  }
  const cols = Math.max(2, Math.floor(Hs.w / 110)), top = BASE - Hs.h + 56;
  for (let r = 0; top + r * 128 + 76 < BASE - 150; r++) for (let c = 0; c < cols; c++) {
    if (r > 0 && c === 0 && top + (r + 1) * 128 + 76 >= BASE - 150) continue;   // the door goes here
    WINS.push({ x: Hs.x + (c + .5) * Hs.w / cols - 26, y: top + r * 128, w: 52, h: 74, hi });
  }
});
(() => {
  const n = WINS.length;
  const order = WINS.map((w, i) => ({ i, d: Math.hypot(w.x - KW.x - KW.w / 2, (w.y - KW.y) * 1.6) + hash(i * 3.7) * 260 })).sort((a, b) => a.d - b.d);
  order.forEach((o, k) => {
    const u = k / (n - 1);
    // most come on through the line in a ripple; the last fifth all at once on "goodnight"
    WINS[o.i].on = u < .8 ? lerp(T.alright + .1, T.say - .1, u / .8) : T.goodnight + (u - .8) * .4;
  });
})();

// back-row roofline, far and dark
const BACK = (() => { const pts = [[-20, BASE]]; let x = -20; let k = 0;
  while (x < W + 40) { const w = 120 + hash(k * 3.1) * 160, h = 470 + hash(k * 5.3) * 110; pts.push([x, BASE - h]);
    if (hash(k * 7.7) > .55) { pts.push([x + w / 2, BASE - h - 70]); } pts.push([x + w, BASE - h]); x += w; k++; }
  pts.push([W + 40, BASE]); return poly(pts); })();

const L1 = 168, L2 = 176;
function ik(sx, sy, tx, ty) {
  const dx = tx - sx, dy = ty - sy; const d = clamp(Math.hypot(dx, dy), 60, L1 + L2 - 2);
  const phi = Math.atan2(dx, dy);
  const a = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
  const b = Math.acos(clamp((L1 * L1 + L2 * L2 - d * d) / (2 * L1 * L2), -1, 1));
  return [phi - a, Math.PI - b];
}
// world point -> a puppet's local units (no lean)
const toLocal = (X, Y, x, y, s, h, dir, bob) => [(X - x) / (s * h * dir), (Y - y - bob * s) / (s * h)];

function family(t, A0) {
  const bp = beatPh(t), ph = bp.ph, beat = bp.i;
  const S = .235, FLOORY = 872;
  const lift = Math.sin(ph * Math.PI);               // up on the off-beat, down on the beat
  const laughK = bump(t, T.alright - .1, 1.6) + bump(t, T.goodnight, 2.2);
  // her and the eldest hold both hands and swing them
  const herX = 940, gX = 1058;
  const herBob = -lift * 14, gBob = -lift * 18;
  const joinX = (herX + gX) / 2 + 4, joinY = 718 - lift * 38 + (beat % 2 ? -10 : 0);
  const her = CAST.her, g11 = CAST.girl11;
  const hl = toLocal(joinX, joinY, herX, FLOORY, S, her.height, 1, herBob);
  const gl = toLocal(joinX, joinY, gX, FLOORY, S, g11.height, -1, gBob);
  // the boy jumps on every beat; the little one turns around every two beats
  const jump = -Math.pow(Math.sin(ph * Math.PI), .8) * 70;
  const turn = (Math.floor((t - BEATS[0]) / ((BEATS[2] - BEATS[0]))) % 2) ? -1 : 1;
  const bArmU = 2.6 + Math.sin(ph * Math.PI * 2) * .25;
  // order: the boy behind, then her, the eldest, the little one in front
  puppet(872, FLOORY, S, 1, CAST.boy8, { bob: jump, arms: [[bArmU, .2], [bArmU - .3, .3]], legs: [[.3 * lift, .7 * lift], [.1 * lift, .5 * lift]],
    head: .1 + lift * .1 });
  puppet(herX, FLOORY, S, 1, her, { bob: herBob, arms: [ik(8, -752, hl[0], hl[1]), ik(-8, -752, hl[0] - 10, hl[1] + 6)],
    head: .06 + laughK * .22, laugh: laughK * .6, legs: [[.18 * lift, .35 * lift], [0, .05]] });
  puppet(gX, FLOORY, S, -1, g11, { bob: gBob, arms: [ik(8, -752, gl[0], gl[1]), ik(-8, -752, gl[0] - 10, gl[1] + 6)],
    head: .08 + laughK * .2, laugh: laughK * .5, legs: [[0, .05], [.2 * lift, .4 * lift]] });
  const g3x = 1000;
  puppet(g3x, FLOORY, S, turn, CAST.girl3, { bob: -lift * 20, arms: [[2.7, .2 + lift * .3], [2.4, .3]], head: .12, legs: [[.15 * lift, .3 * lift], [0, .05]] });
}

SHOT(225.86, 236.6, 'goodnight', (t) => {
  const A0 = g.globalAlpha;
  // camera: a slow push toward her window (draft 1), plus a push in to the window on "alright" that is
  // fully out again by 229.6, so the end framing (232.9 on) is draft 1's exactly
  const push = eio((t - 226.5) / .95) * (1 - eio((t - 228.4) / 1.2));
  const z = (1 + .06 * ss(225.9, T.goodnight, t) + .2 * eio((t - T.goodnight - 1.6) / (T.end - T.goodnight - 1.4))) * (1 + 1.05 * push);
  g.save(); g.translate(FX, FY); g.scale(z, z); g.translate(-FX, -FY);

  // night sky: one soft gradient, then the paper grain
  sheet(C.sky0);
  { g.save(); const gr = g.createLinearGradient(0, -200, 0, BASE); gr.addColorStop(0, C.sky0); gr.addColorStop(.7, C.sky1); gr.addColorStop(1, C.sky2);
    g.fillStyle = gr; g.fillRect(-200, -300, W + 400, BASE + 300); g.restore(); }
  // a few cut stars
  for (let i = 0; i < 18; i++) {
    const sx = hash(i * 5.1) * W, sy = 40 + hash(i * 8.3) * 320;
    if (Math.abs(sx - MOON_X) < 120 && sy < 330) continue;
    const tw = .7 + .3 * Math.sin(t * 2.4 + i * 1.9);
    g.save(); g.globalAlpha = A0 * .9; cut(star4(sx, sy, (hash(i * 2.2) > .75 ? 13 : 7) * tw), C.cream, { sh: 0, grain: .1 }); g.restore();
  }

  // ---- the moon: sinks onto the rooftops to say goodnight, sits there, then refuses and bobs back up ----
  const MR = 84;
  const sink = lerp(0, .14, ss(225.9, 229.0, t)) + .86 * eio((t - 229.2) / 1.75);
  const refuse = clamp((t - T.goodnight) / .8);
  let my = lerp(210, 352, sink) + bump(t, T.say, .3) * 8;
  if (refuse > 0) my = lerp(352, 226, back(refuse)) + Math.sin((t - T.goodnight - .8) * 3.2) * 7 * ss(T.goodnight + .4, T.goodnight + 1.2, t);
  const mx = MOON_X + Math.sin(t * .6) * 6;
  { g.save(); g.globalAlpha = A0 * .42; g.globalCompositeOperation = 'screen'; const gr = g.createRadialGradient(mx, my, 30, mx, my, 250);
    gr.addColorStop(0, 'rgba(120,96,150,.9)'); gr.addColorStop(1, 'rgba(120,96,150,0)'); g.fillStyle = gr; g.fill(circle(mx, my, 250)); g.restore(); }
  cut(crescent(mx, my, MR, .36, -.35 + Math.sin(t * 1.1) * .05 - bump(t, T.goodnight, .9) * .25), C.goldPale, { sh: .6, lift: .4, grain: .2 });

  // ---- back row ----
  cut(BACK, C.sky1, { sh: .6, grain: .2 });

  // ---- front row of houses ----
  HOUSES.forEach((Hs, hi) => {
    const top = BASE - Hs.h;
    const body = Hs.roof === 'gable' ? poly([[Hs.x, BASE], [Hs.x, top], [Hs.x + Hs.w / 2, top - Hs.w * .32], [Hs.x + Hs.w, top], [Hs.x + Hs.w, BASE]]) : cutRect(Hs.x, top, Hs.w, Hs.h, hi * 9);
    cut(body, hi % 2 ? '#262a5e' : '#20255a', { sh: .9, lift: .4 });
    if (Hs.roof === 'flat') cut(cutRect(Hs.x - 10, top - 20, Hs.w + 20, 22, hi * 9 + 5), C.ink, { sh: .5 });
    else cut(cutRect(Hs.x + Hs.w * .7, top - Hs.w * .32 + 10, 26, 70, hi * 9 + 7), C.ink, { sh: .5 });
    if (!Hs.hers) { const cols = Math.max(2, Math.floor(Hs.w / 110)); const dx = Hs.x + Hs.w / cols / 2 - 32;
      cut(rrect(dx, BASE - 148, 64, 148, [28, 28, 0, 0]), C.ink, { sh: .4 }); }
  });
  const kOn = t >= T.shes, kfl = 1 - clamp((t - T.shes) / .6);
  if (kOn) {
    // stepped paper glow: two flat sheets behind the frame, then a light warm screen bloom (no muddy haze)
    const cx = KW.x + KW.w / 2, cy = KW.y + KW.h / 2, gk = back(clamp((t - T.shes) / .45));
    [[96, '#292e6c'], [44, '#30357a']].forEach(([m, col]) => {
      const mm = m * gk; cut(ellipse(cx, cy, (KW.w / 2 + mm) * 1.12 * gk, (KW.h / 2 + mm) * 1.12 * gk), col, { sh: .3, grain: .18 }); });
    g.save(); g.globalAlpha = A0 * (.22 + kfl * .35); g.globalCompositeOperation = 'screen';
    const gr = g.createRadialGradient(cx, cy, 60, cx, cy, 300); gr.addColorStop(0, 'rgba(240,180,110,.8)'); gr.addColorStop(1, 'rgba(240,180,110,0)');
    g.fillStyle = gr; g.fill(circle(cx, cy, 300)); g.restore();
  }
  // windows: dark until their moment, then ON with a little flash of glow
  WINS.forEach((wn, i) => {
    const on = t >= wn.on;
    cut(rect(wn.x, wn.y, wn.w, wn.h), C.ink, { sh: 0, grain: .1 });
    if (on) {
      // a flat paper glow (a lighter sheet behind the pane) instead of a radial haze; a brief clean flash as it lights
      const fl = 1 - clamp((t - wn.on) / .5), cx = wn.x + wn.w / 2, cy = wn.y + wn.h / 2;
      const gk = back(clamp((t - wn.on) / .3));
      cut(rrect(cx - (wn.w / 2 + 11) * gk, cy - (wn.h / 2 + 11) * gk, (wn.w + 22) * gk, (wn.h + 22) * gk, 11), '#2f3478', { sh: .25, grain: .15 });
      if (fl > 0) { g.save(); g.globalAlpha = A0 * fl * .5; g.globalCompositeOperation = 'screen';
        const gr = g.createRadialGradient(cx, cy, 10, cx, cy, 110); gr.addColorStop(0, 'rgba(247,200,120,.9)'); gr.addColorStop(1, 'rgba(247,200,120,0)');
        g.fillStyle = gr; g.fill(circle(cx, cy, 110)); g.restore(); }
      const pk = back(clamp((t - wn.on) / .25));
      g.save(); g.translate(cx, cy); g.scale(lerp(.9, 1, pk), lerp(.9, 1, pk)); g.translate(-cx, -cy);
      cut(rect(wn.x, wn.y, wn.w, wn.h), hash(i * 1.9) > .4 ? C.gold : C.goldPale, { sh: 0, grain: .2 });
      // a cross bar in the frame
      g.fillStyle = C.ink; g.fill(rect(wn.x + wn.w / 2 - 2.5, wn.y, 5, wn.h)); g.fill(rect(wn.x, wn.y + wn.h * .45, wn.w, 5));
      g.restore();
    }
    cut(rect(wn.x - 6, wn.y + wn.h - 2, wn.w + 12, 8), C.cream, { sh: .3, grain: .1, alpha: .85 });
  });

  // ---- her kitchen window (its glow is drawn behind the other windows, above) ----
  g.save(); const kwin = rect(KW.x, KW.y, KW.w, KW.h);
  cut(kwin, kOn ? C.goldPale : C.ink, { sh: 0, grain: .2 });
  if (kOn) { g.clip(kwin);
    // the back wall of the kitchen: a warmer band, and the family dancing
    cut(rect(KW.x, KW.y + KW.h * .62, KW.w, KW.h), C.gold, { sh: 0, grain: .2, alpha: .55 });
    family(t, A0);
    // curtains tied back at each side
    cut(blob([[KW.x - 4, KW.y - 4], [KW.x + 34, KW.y - 4], [KW.x + 14, KW.y + 90], [KW.x + 22, KW.y + KW.h + 4], [KW.x - 4, KW.y + KW.h + 4]], .5), C.cream, { sh: .6, grain: .2 });
    cut(blob([[KW.x + KW.w + 4, KW.y - 4], [KW.x + KW.w - 34, KW.y - 4], [KW.x + KW.w - 14, KW.y + 90], [KW.x + KW.w - 22, KW.y + KW.h + 4], [KW.x + KW.w + 4, KW.y + KW.h + 4]], .5), C.cream, { sh: .6, grain: .2 });
  }
  g.restore();
  // frame and sill
  { const fr = new Path2D(); fr.rect(KW.x - 12, KW.y - 12, KW.w + 24, KW.h + 24); fr.rect(KW.x, KW.y, KW.w, KW.h);
    cut(fr, C.ink, { sh: .5, rule: 'evenodd' }); cut(cutRect(KW.x - 26, KW.y + KW.h + 6, KW.w + 52, 16, 61, 1.5), C.cream, { sh: .5, grain: .1 }); }
  // joy leaving the window on "alright" and "goodnight"
  laughRings(t, KW.x + KW.w / 2, KW.y - 30, T.alright, { n: 3, dir: -Math.PI / 2, spread: .7, reach: 260, life: 1.8, w0: 10 });
  laughRings(t, KW.x + KW.w / 2, KW.y - 30, T.goodnight, { n: 4, dir: -Math.PI / 2, spread: .8, reach: 340, life: 2.2, w0: 11 });

  // pavement and kerb
  cut(cutRect(-200, BASE, W + 400, 300, 71, 3), C.ink, { sh: .7, lift: .3 });
  cut(cutRect(-200, BASE + 70, W + 400, 10, 72, 2), C.sky1, { sh: .3, grain: .1 });
  g.restore();
}, { xin: .8, tr: 'iris', ix: 942, iy: 214 });
})();
