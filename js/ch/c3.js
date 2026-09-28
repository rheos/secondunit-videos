// js/ch/c3.js · FATHER (51.02 - 69.18)
// A crazed sheepdog, a brass father-ram, a deadpan official, a prize that isn't the sleeper,
// disguises, and the pun: a pride of lions appearing among the sheep.
// Hit times come from the vocal stem (Demucs) onsets, not Whisper, which runs early here.
(() => {
  const CRAZY = 52.64, LONELY = 53.46, FROZE = 55.88, MOLTEN = 56.50, BRASS = 56.86;
  const STAMPS = [58.24, 58.94, 59.48];                      // "authorized", "be", "surprised"
  const EYES = 61.02, PRIZE = 62.58;
  const DISG = [63.36, 63.80, 64.58, 64.96];                 // "a lot", "disguised", "at", "cost"
  const PRIDE = [65.50, 66.40, 67.14, 67.87, 68.58];         // each sung "pride", vocal onsets
  const BLINK = 68.92;

  // ---------- private cast ----------
  const DOG = '#1a1822', DOG_W = '#ece5d6';
  // a border collie in side view, facing right, feet on (0, 0); drawn in the current transform
  function dogRun(g, t, sc, ph, { tongue = 1, eyeWide = 1 } = {}) {
    const legs = [[.46, 0, DOG_W], [.34, .5, DOG_W], [-.44, .5, DOG], [-.56, 0, DOG]];
    for (const [lx, off, c] of legs) {
      const a = Math.sin((ph + off) * TAU) * .75, top = [lx * sc, -.62 * sc];
      const knee = [top[0] + Math.sin(a) * .32 * sc, top[1] + Math.cos(a) * .32 * sc];
      const a2 = a - .5 * Math.max(0, Math.sin((ph + off + .25) * TAU));
      taper(g, top, knee, .1 * sc, .07 * sc, c); taper(g, knee, [knee[0] + Math.sin(a2) * .3 * sc, knee[1] + Math.cos(a2) * .3 * sc], .07 * sc, .055 * sc, c);
    }
    // tail, streaming back and up
    const wag = Math.sin(ph * TAU * 2) * .12 * sc;
    const tail = bez([-.66 * sc, -.82 * sc], [-1.0 * sc, -.9 * sc], [-1.15 * sc, -1.25 * sc + wag], [-1.35 * sc, -1.2 * sc + wag], 14);
    for (let i = 0; i < tail.length - 1; i++) taper(g, tail[i], tail[i + 1], .1 * sc * (1 - i / 18), .1 * sc * (1 - (i + 1) / 18), i > 10 ? DOG_W : DOG);
    g.fillStyle = DOG; g.beginPath(); g.ellipse(0, -.74 * sc, .74 * sc, .3 * sc, 0, 0, TAU); g.fill();
    g.fillStyle = DOG_W; g.beginPath(); g.ellipse(.5 * sc, -.66 * sc, .26 * sc, .26 * sc, 0, 0, TAU); g.fill();       // chest
    taper(g, [.5 * sc, -.82 * sc], [.86 * sc, -1.06 * sc], .2 * sc, .17 * sc, DOG);                                    // neck
    const hx = .9 * sc, hy = -1.1 * sc;
    dot(g, hx, hy, .23 * sc, DOG);
    g.fillStyle = DOG_W; g.beginPath(); g.ellipse(hx + .08 * sc, hy - .02 * sc, .06 * sc, .2 * sc, -.3, 0, TAU); g.fill();   // blaze
    g.fillStyle = DOG_W; g.beginPath(); g.ellipse(hx + .27 * sc, hy + .06 * sc, .19 * sc, .1 * sc, .1, 0, TAU); g.fill();    // snout
    dot(g, hx + .44 * sc, hy + .05 * sc, .055 * sc, '#07060a');
    if (tongue > 0) { const fl = Math.sin(t * 26) * .05 * sc; taper(g, [hx + .28 * sc, hy + .15 * sc], [hx + .18 * sc, hy + .3 * sc + fl], .05 * sc, .04 * sc, '#e0607a'); }
    poly(g, [[hx - .16 * sc, hy - .14 * sc], [hx - .02 * sc, hy - .2 * sc], [hx - .3 * sc, hy + .08 * sc]], DOG);          // ear
    dot(g, hx + .06 * sc, hy - .07 * sc, .07 * sc * eyeWide, '#f4efe2');
    dot(g, hx + .09 * sc, hy - .07 * sc, .035 * sc, '#07060a');
  }
  // a sitting dog in silhouette, facing right, howling: up 0..1 tips the snout skyward, open 0..1 the jaw
  function dogSit(g, sc, up, open, col) {
    dot(g, -.12 * sc, -.36 * sc, .42 * sc, col);
    g.fillStyle = col; g.beginPath(); g.ellipse(.14 * sc, -.84 * sc, .27 * sc, .5 * sc, .25, 0, TAU); g.fill();
    taper(g, [.26 * sc, -.7 * sc], [.36 * sc, 0], .09 * sc, .07 * sc, col); taper(g, [.1 * sc, -.7 * sc], [.2 * sc, 0], .09 * sc, .07 * sc, col);
    const tl = bez([-.5 * sc, -.1 * sc], [-.9 * sc, -.05 * sc], [-1.0 * sc, -.1 * sc], [-.95 * sc, -.35 * sc], 10);
    for (let i = 0; i < tl.length - 1; i++) taper(g, tl[i], tl[i + 1], .09 * sc, .08 * sc, col);
    const hx = .3 * sc, hy = -1.34 * sc, a = -lerp(.1, 1.15, up);
    taper(g, [.14 * sc, -1.0 * sc], [hx, hy], .2 * sc, .18 * sc, col);
    g.save(); g.translate(hx, hy); g.rotate(a);
    dot(g, 0, 0, .22 * sc, col);
    taper(g, [.05 * sc, -.05 * sc], [.5 * sc, -.02 * sc], .13 * sc, .07 * sc, col);                                     // upper jaw
    g.save(); g.rotate(open * .55); taper(g, [.05 * sc, .06 * sc], [.4 * sc, .08 * sc], .09 * sc, .05 * sc, col); g.restore();
    poly(g, [[-.12 * sc, -.14 * sc], [.02 * sc, -.2 * sc], [-.3 * sc, .1 * sc]], col);
    g.restore();
  }

  // the brass look: any cast drawing through this filter comes out cast in brass
  const BRASS_F = 'sepia(1) saturate(3.2) hue-rotate(-8deg) brightness(.78) contrast(1.15)';
  // curled horns at a sheep head; d = side
  function horns(g, head, sc, cBase, cHi) {
    for (const d of [-1, 1]) {
      const c = [head[0] + d * .3 * sc, head[1] - .08 * sc], R0 = .26 * sc, pts = [];
      for (let i = 0; i <= 26; i++) { const u = i / 26, a = u * 1.75 * Math.PI, R = R0 * (1 - .6 * u), ph = Math.PI + a; pts.push([c[0] + d * Math.cos(ph) * R, c[1] + Math.sin(ph) * R]); }
      for (let i = 0; i < pts.length - 1; i++) { const u = i / 26; taper(g, pts[i], pts[i + 1], .1 * sc * (1 - .65 * u), .1 * sc * (1 - .65 * (u + 1 / 26)), cBase); }
      stroke(g, pts.slice(2, 18).map(([x, y]) => [x + d * -.02 * sc, y - .03 * sc]), cHi, .03 * sc);
    }
  }
  // the father: an old ram cast in brass
  function brassRam(t, x, y, sc, o = {}) {
    s.save(); s.filter = BRASS_F;
    const r = sheep(t, x, y, sc, { seed: 7, lids: .62, ...o });
    s.restore();
    // beard of an old ram
    poly(s, [[r.head[0] - .12 * sc, r.head[1] + .28 * sc], [r.head[0] + .12 * sc, r.head[1] + .28 * sc], [r.head[0] + .02 * sc, r.head[1] + .62 * sc]], '#6e4814');
    horns(s, r.head, sc, '#8a5a1c', '#f2c566');
    return r;
  }

  // the official cap: navy crown, gold badge, black brim
  function cap(head, sc, pop = 1) {
    const x = head[0], y = head[1] - .36 * sc, k = pop;
    if (k <= 0) return;
    s.save(); s.translate(x, y); s.scale(k, k);
    poly(s, [[-.28 * sc, 0], [.28 * sc, 0], [.36 * sc, -.26 * sc], [-.36 * sc, -.26 * sc]], '#1e2a5c');
    s.fillStyle = '#1e2a5c'; s.beginPath(); s.ellipse(0, -.26 * sc, .37 * sc, .09 * sc, 0, 0, TAU); s.fill();
    s.fillStyle = '#0a0b16'; s.beginPath(); s.ellipse(.05 * sc, .02 * sc, .34 * sc, .07 * sc, .05, 0, TAU); s.fill();
    dot(s, 0, -.13 * sc, .07 * sc, '#e8b84a');
    s.restore();
    dot(f, x, y - .13 * sc, .03 * sc, 'rgba(255,220,140,.6)');
  }
  // big glasses, a false nose and a moustache on a sheep head; k = pop scale
  const RIMS = ['#e2412a', '#f0c24a', '#3fb6a8', '#f2ecdf'];
  function disguise(head, sc, k, i) {
    if (k <= 0) return;
    const [x, y] = head;
    s.save(); s.translate(x, y); s.scale(k, k);
    const rim = RIMS[i % 4];
    for (const d of [-1, 1]) { dot(s, d * .13 * sc, -.05 * sc, .13 * sc, rim); dot(s, d * .13 * sc, -.05 * sc, .09 * sc, '#8fb2d6'); }
    stroke(s, [[-.04 * sc, -.07 * sc], [.04 * sc, -.07 * sc]], rim, .04 * sc);
    for (const d of [-1, 1]) stroke(s, [[d * .1 * sc, -.24 * sc], [d * .24 * sc, -.21 * sc]], '#2b1a12', .07 * sc);          // bushy brows
    dot(s, 0, .1 * sc, .085 * sc, '#e8a48c');                                                                                  // false nose
    s.fillStyle = '#c47a36'; s.beginPath();
    s.moveTo(-.2 * sc, .24 * sc); s.quadraticCurveTo(-.1 * sc, .12 * sc, 0, .19 * sc); s.quadraticCurveTo(.1 * sc, .12 * sc, .2 * sc, .24 * sc);
    s.quadraticCurveTo(.1 * sc, .21 * sc, 0, .25 * sc); s.quadraticCurveTo(-.1 * sc, .21 * sc, -.2 * sc, .24 * sc); s.fill();
    s.restore();
    for (const d of [-1, 1]) dot(f, x + (d * .13 - .04) * sc * k, y - .1 * sc * k, .025 * sc * k, 'rgba(230,240,255,.8)');
  }

  // ---------- the lion: golden, maned, as deadpan as the sheep ----------
  // (x, y) = ground under its middle, sc ~ half the body width (like sheep()); head faces camera at the dir end
  const L_BODY = '#d9a043', L_SH = '#9c6a2a', L_HI = '#f3c56c', L_MANE = '#8a4418', L_MANE2 = '#b25e22', L_FACE = '#e6ae52';
  function lion(t, x, y, sc, o = {}) {
    const { dir = 1, lids = .55, look = [0, 0], seed = 1, bob = 0, g = s } = o;
    const legL = .6 * sc, bx = x, by = y - legL - .36 * sc + bob;
    g.save(); g.translate(bx, by);
    // tail with a dark tuft
    const sw = Math.sin(t * 2.2 + seed) * .12 * sc;
    const tl = bez([-dir * .85 * sc, -.05 * sc], [-dir * 1.3 * sc, .1 * sc], [-dir * 1.35 * sc, -.5 * sc + sw], [-dir * 1.55 * sc, -.55 * sc + sw], 12);
    for (let i = 0; i < tl.length - 1; i++) taper(g, tl[i], tl[i + 1], .06 * sc, .055 * sc, L_SH);
    dot(g, tl[12][0], tl[12][1], .11 * sc, L_MANE);
    for (const [lx, c] of [[.55, L_SH], [.35, L_BODY], [-.55, L_SH], [-.35, L_BODY]]) {
      const top = [dir * lx * sc, .15 * sc], end = [top[0], top[1] + legL + .2 * sc];
      taper(g, top, end, .14 * sc, .1 * sc, c);
      g.fillStyle = c; g.beginPath(); g.ellipse(end[0] + dir * .04 * sc, end[1] - .02 * sc, .13 * sc, .07 * sc, 0, 0, TAU); g.fill();
    }
    g.fillStyle = L_SH; g.beginPath(); g.ellipse(0, .1 * sc, 1.0 * sc, .42 * sc, 0, 0, TAU); g.fill();
    g.fillStyle = L_BODY; g.beginPath(); g.ellipse(0, -.02 * sc, .95 * sc, .36 * sc, 0, 0, TAU); g.fill();
    g.fillStyle = L_HI; g.beginPath(); g.ellipse(-dir * .1 * sc, -.2 * sc, .6 * sc, .12 * sc, 0, 0, TAU); g.fill();
    // head: a big mane ring, then the face
    const hx = dir * .92 * sc, hy = -.38 * sc;
    g.save(); g.translate(hx, hy);
    dot(g, 0, .02 * sc, .6 * sc, L_MANE);
    const r = rng(seed * 17 + 3);
    for (let i = 0; i < 16; i++) {
      const a = i / 16 * TAU + r() * .2, rad = (.2 + .07 * r()) * sc, d = (.46 + .06 * r()) * sc;
      dot(g, Math.cos(a) * d, Math.sin(a) * d + .02 * sc, rad, i % 2 ? L_MANE2 : L_MANE);
    }
    for (const d of [-1, 1]) { dot(g, d * .26 * sc, -.3 * sc, .1 * sc, L_FACE); dot(g, d * .26 * sc, -.3 * sc, .05 * sc, '#6a3416'); }
    g.fillStyle = L_FACE; g.beginPath(); g.ellipse(0, .02 * sc, .32 * sc, .37 * sc, 0, 0, TAU); g.fill();
    g.fillStyle = '#f5e2bc'; for (const d of [-1, 1]) { g.beginPath(); g.ellipse(d * .08 * sc, .2 * sc, .1 * sc, .08 * sc, 0, 0, TAU); g.fill(); }
    poly(g, [[-.08 * sc, .08 * sc], [.08 * sc, .08 * sc], [0, .16 * sc]], '#3a1c12');
    stroke(g, [[0, .16 * sc], [0, .24 * sc]], '#5a2e18', .02 * sc);
    for (const d of [-1, 1]) {
      const ex = d * .12 * sc, ey = -.06 * sc, rx = .075 * sc, ry = .055 * sc;
      g.save(); g.beginPath(); g.ellipse(ex, ey, rx, ry, 0, 0, TAU); g.clip();
      g.fillStyle = '#f2c14e'; g.fillRect(ex - rx, ey - ry, rx * 2, ry * 2);
      dot(g, ex + look[0] * .03 * sc, ey + .01 * sc + look[1] * .02 * sc, .03 * sc, '#140a06');
      g.fillStyle = '#c28a3a'; g.fillRect(ex - rx, ey - ry, rx * 2, ry * 2 * lids);
      g.restore();
      stroke(g, [[ex - rx, ey - ry + ry * 2 * lids], [ex + rx, ey - ry + ry * 2 * lids]], '#6a3a18', .018 * sc);
    }
    g.restore(); g.restore();
    return { head: [bx + hx, by + hy], body: [bx, by] };
  }

  function nightField(t, horizon = 640, seed = 41) {
    sky('#050920', '#101d55', '#2d3478', horizon);
    stars(t, seed, 150, horizon - 60, .9);
    clouds(t, seed + 2, 150, 360, 'rgba(50,62,130,.4)', 5, 10);
    ridge(s, horizon, 40, .002, seed + 5, '#1d2860');
    s.fillStyle = vgrad(s, horizon, H + 60, [[0, '#222f68'], [1, '#141c46']]); s.fillRect(-400, horizon + 10, W + 800, H);
  }

  // ---------- 1 · the crazy dog (51.02 - 52.90) ----------
  function dogSpin(t, lt, dur) {
    const lurch = hit(t, CRAZY, 5);
    const rot = kf(lt, [[0, -.03], [dur, .05]]) + .05 * lurch * Math.sin(lt * 30);
    const [sx, sy] = shake(t, 5 * lurch);
    cam(kf(lt, [[0, 900], [dur, 1000]]) + sx, kf(lt, [[0, 740], [dur, 770]]) + sy, kf(lt, [[0, 1.4], [dur, 1.75]], ease.inOut), rot);
    nightField(t, 600);
    glow(1300, 300, 600, 'rgba(180,190,255,.12)');
    // a pool of moonlight the dog runs in
    s.fillStyle = rgrad(s, 960, 800, 20, 420, [[0, '#6a78b8'], [.6, '#3a4786'], [1, 'rgba(34,47,104,0)']]);
    s.beginPath(); s.ellipse(960, 820, 520, 160, 0, 0, TAU); s.fill();
    glow(960, 780, 420, 'rgba(150,170,255,.12)');
    // the flock behind, watching, unmoved
    for (let i = 0; i < 6; i++) {
      const x = 380 + i * 250, lk = clamp((960 - x) / 600, -1, 1);
      sheep(t, x, 650 + (i % 2) * 8, 62, { seed: 30 + i, dir: x < 960 ? 1 : -1, lids: .6, look: [lk * (x < 960 ? 1 : -1) * 0 + (x < 960 ? .8 : -.8), .3], bob: -bob(t + i * .13) * 2 });
    }
    // round and round, faster after "crazy"
    const spin = lt * 1.5 + Math.max(0, t - CRAZY) * 1.1 * Math.max(0, t - CRAZY), th = spin * TAU;
    const x = 960 + Math.sin(th) * 210, y = 840 + Math.cos(th) * 70, depth = 1 + Math.cos(th) * .1;
    const facing = Math.cos(th), sxk = Math.sign(facing || 1) * Math.max(.3, Math.abs(facing));
    s.save(); s.translate(x, y); s.rotate(-Math.sin(th) * .08); s.scale(sxk * depth, depth);
    dogRun(s, t, 150, spin * 3, { eyeWide: 1.2 });
    s.restore();
    // dust kicked up behind
    for (let k = 1; k <= 5; k++) { const th2 = th - k * .35; dot(s, 960 + Math.sin(th2) * 210, 846 + Math.cos(th2) * 70, 24 + k * 7, `rgba(120,135,190,${.35 - k * .06})`); }
  }

  // ---------- 2 · the howl (52.90 - 54.42), a low angle against the moon ----------
  function howl(t, lt, dur) {
    const up = smooth(inv(LONELY - .2, LONELY + .2, t)), open = up * (.7 + .3 * Math.sin(t * 7));
    cam(960, kf(lt, [[0, 640], [dur, 560]]), kf(lt, [[0, 1.05], [dur, 1.22]], ease.out), kf(lt, [[0, .02], [dur, -.02]]));
    sky('#040716', '#0b1542', '#1d2a66', 900); stars(t, 51, 110, 520, .8);
    fullMoon(960, 470, 330);
    // howl rings pulsing out of the moon behind the dog
    for (let k = 0; k < 3; k++) { const u = ((t - LONELY) * 1.4 + k / 3) % 1; if (t > LONELY) { f.save(); f.globalCompositeOperation = 'lighter'; f.strokeStyle = `rgba(210,220,255,${.35 * (1 - u) * up})`; f.lineWidth = 10; f.beginPath(); f.arc(1010, 470, 200 + u * 420, -2.4, -.7); f.stroke(); f.restore(); } }
    ridge(s, 880, 60, .003, 14, '#05060f');
    s.fillStyle = '#05060f'; s.beginPath(); s.ellipse(960, 900, 330, 80, 0, 0, TAU); s.fill();
    s.save(); s.translate(900, 860); dogSit(s, 230, up, open, '#05060f'); s.restore();
    occlude(() => { f.save(); f.translate(900, 860); dogSit(f, 230, up, open, '#000'); f.restore(); f.fillStyle = '#000'; f.beginPath(); f.ellipse(960, 900, 330, 80, 0, 0, TAU); f.fill(); });
    // two sheep in the foreground, lit cream, staring at us
    sheep(t, 250, 1110, 230, { seed: 3, dir: 1, lids: .6, bob: -bob(t) * 4 });
    sheep(t, 1690, 1120, 250, { seed: 5, dir: -1, lids: .64, bob: -bob(t + .2) * 4 });
  }

  // ---------- 3 · the brass father (54.42 - 56.50) ----------
  const ST_X = 900, ST_Y = 640, ST_SC = 200;
  function plinth() {
    s.fillStyle = '#342d44'; s.fillRect(660, 640, 600, 420);
    s.fillStyle = '#4a4260'; s.fillRect(630, 620, 660, 40);
    s.fillStyle = '#28223a'; s.fillRect(640, 980, 640, 100);
  }
  function square(t) {
    sky('#060a24', '#121f5a', '#2a2e6e', 900); stars(t, 61, 120, 560, .7);
    moon(1560, 190, 60);
    for (const [x, h] of [[120, 500], [360, 420], [1580, 460], [1800, 540]]) { s.fillStyle = '#0c1233'; s.fillRect(x - 110, 900 - h, 220, h + 200); }
    s.fillStyle = '#161d48'; s.fillRect(-200, 980, W + 400, 300);
  }
  function floods(t, on) {
    if (on <= 0) return;
    for (const d of [-1, 1]) {
      f.save(); f.globalCompositeOperation = 'lighter'; f.globalAlpha = .1 * on;
      f.fillStyle = rgrad(f, 960 + d * 420, 1060, 0, 900, [[0, 'rgba(255,190,110,1)'], [1, 'rgba(0,0,0,0)']]);
      f.beginPath(); f.moveTo(960 + d * 420, 1060); f.lineTo(960 + d * 40, 180); f.lineTo(960 - d * 380, 260); f.closePath(); f.fill(); f.restore();
    }
    glow(1010, 470, 380, `rgba(255,190,110,${.2 * on})`);
  }
  function statue(t, lt, dur) {
    const on = smooth(inv(FROZE, FROZE + .08, t)), k = hit(t, FROZE, 7);
    const [sx, sy] = shake(t, 3 * k);
    cam(kf(lt, [[0, 940], [dur, 1040]]) + sx, kf(lt, [[0, 600], [dur, 430]], ease.inOut) + sy, kf(lt, [[0, 1.5], [dur, 1.3]], ease.inOut));
    square(t);
    plinth();
    const r = brassRam(t, ST_X, ST_Y, ST_SC, { look: [.2, .2] });
    floods(t, lerp(.25, 1, on));
    dot(f, r.head[0] + 30, r.head[1] - 50, 18 * on, 'rgba(255,230,170,.5)');
    flash(.08 * k, '#ffd9a0');
  }

  // ---------- 4 · molten brass pours over it and sets (56.50 - 57.84) ----------
  function pour(t, lt, dur) {
    const set = smooth(inv(BRASS, BRASS + .35, t)), hot = 1 - set * .75, k = hit(t, BRASS, 6);
    const [sx, sy] = shake(t, 4 * k);
    cam(kf(lt, [[0, 1040], [dur, 960]], ease.out) + sx, kf(lt, [[0, 430], [dur, 480]], ease.out) + sy, kf(lt, [[0, 1.3], [dur, 1.15]], ease.out) + .04 * k);
    square(t); plinth();
    const r = brassRam(t, ST_X, ST_Y, ST_SC, { look: [.2, .2] });
    floods(t, 1);
    // the crucible tips in from the top of frame
    const tip = kf(t, [[MOLTEN - .3, -.2], [MOLTEN, .9], [BRASS + .3, 1.1], [BRASS + .7, .3]], ease.inOut);
    s.save(); s.translate(1260, 40); s.rotate(tip);
    s.fillStyle = '#2a2230'; s.fillRect(-120, -160, 240, 170); s.fillStyle = '#ff9a2e'; s.fillRect(-110, -10, 220, 18);
    s.restore();
    const lip = [1260 + Math.cos(tip) * 110 - Math.sin(tip) * 0, 40 + Math.sin(tip) * 110];
    const flow = smooth(inv(MOLTEN - .1, MOLTEN + .05, t)) * (1 - smooth(inv(BRASS + .15, BRASS + .45, t)));
    const top = [r.head[0] - 20, r.head[1] - 90];
    if (flow > .01) {
      const st = bez(lip, [lip[0], lip[1] + 60], [top[0] + 60, top[1] - 120], top, 16);
      stroke(s, st, '#ffb440', 26 * flow);
      stroke(f, st, `rgba(255,160,60,${.8 * flow})`, 20 * flow);
      stroke(f, st, `rgba(255,240,200,${.8 * flow})`, 7 * flow);
      glow(top[0], top[1] + 40, 160, `rgba(255,150,60,${.35 * flow})`);
    }
    // molten sheets running down over the ram and off the plinth
    const R = rng(77);
    for (let i = 0; i < 16; i++) {
      const x0 = r.head[0] - 40 - R() * 380 * (i / 16) - R() * 60, x1 = x0 - 20 + R() * 40;
      const y0 = r.head[1] - 60 + (i / 16) * 70, start = MOLTEN + .02 + i * .025 + R() * .05;
      const len = clamp((t - start) * (380 + R() * 200), 0, 628 - y0);
      if (len <= 0) continue;
      const pts = [[x0, y0], [lerp(x0, x1, .5), y0 + len * .5], [x1, y0 + len]];
      s.save(); s.globalAlpha = 1 - .55 * set; stroke(s, pts, set > .5 ? '#d09a3c' : '#ffc050', (20 + R() * 16) * (1 - .4 * set));
      dot(s, x1, y0 + len, (14 + R() * 6) * (1 - .4 * set), set > .5 ? '#d09a3c' : '#ffc050'); s.restore();
      stroke(f, pts, `rgba(255,${lerp(130, 210, set) | 0},70,${.55 * hot})`, 14);
    }
    const pool = smooth(inv(MOLTEN + .3, BRASS + .5, t));
    if (pool > 0) { s.fillStyle = set > .5 ? '#d89a34' : '#ffc050'; s.beginPath(); s.ellipse(930, 628, 330 * pool, 16 * pool + 2, 0, 0, TAU); s.fill(); glow(930, 628, 300 * pool, `rgba(255,150,60,${.35 * hot})`); }
    // it sets: a gleam sweeps across the fresh brass
    const sw = inv(BRASS + .05, BRASS + .6, t);
    if (sw > 0 && sw < 1) glow(lerp(620, 1280, sw), lerp(700, 300, sw), 180, `rgba(255,245,210,${.7 * Math.sin(sw * Math.PI)})`);
    flash(.1 * k, '#ffcf80');
  }

  // ---------- 5 · the stamp (57.84 - 60.20) ----------
  const OF_X = 700, OF_Y = 760, OF_SC = 190;
  const SPOTS = [[1170, 770], [1300, 786], [1230, 758]];
  function stampY(t) { // 0 = on the paper, 1 = raised
    let v = 1;
    for (const tt of STAMPS) { if (t >= tt - .28 && t < tt) v = Math.min(v, 1 - ease.in(inv(tt - .28, tt, t)) * 1 + (t < tt - .16 ? .25 * Math.sin(inv(tt - .28, tt - .16, t) * Math.PI) : 0)); if (t >= tt && t < tt + .26) v = Math.min(v, ease.out(inv(tt + .08, tt + .26, t))); }
    return clamp(v, 0, 1.3);
  }
  function stamp(t, lt, dur) {
    const k = STAMPS.reduce((a, x) => a + hit(t, x, 9), 0), [sx, sy] = shake(t, 6 * k);
    cam(kf(lt, [[0, 960], [dur, 1080]]) + sx, kf(lt, [[0, 600], [dur, 660]]) + sy, kf(lt, [[0, 1.15], [dur, 1.5]], ease.inOut) + .025 * k);
    // an office after hours
    s.fillStyle = vgrad(s, 0, H, [[0, '#1a1638'], [1, '#2c2442']]); s.fillRect(-300, -300, W + 600, H + 600);
    for (let i = 0; i < 5; i++) { s.fillStyle = '#231d3e'; s.fillRect(80 + i * 380, 220, 300, 460); s.fillStyle = '#2d2650'; for (let j = 0; j < 3; j++) s.fillRect(100 + i * 380, 245 + j * 145, 260, 115); }
    glow(1080, 380, 700, 'rgba(255,170,90,.18)');
    // the official, behind the desk
    const sit = sheep(t, OF_X, OF_Y + 90, OF_SC, { seed: 12, dir: 1, lids: .62, look: [-.1, .5], bob: -bob(t) * 3 });
    cap(sit.head, OF_SC);
    // desk
    s.fillStyle = '#4a2f24'; s.fillRect(420, 790, 1100, 40); s.fillStyle = '#35211b'; s.fillRect(450, 830, 1040, 300);
    // paper, and the marks already made
    s.save(); s.translate(1235, 772); s.rotate(-.03); s.fillStyle = '#e8dfc8'; s.fillRect(-170, -26, 340, 44); s.restore();
    STAMPS.forEach((tt, i) => { if (t < tt) return; const [px, py] = SPOTS[i], a = .9;
      s.save(); s.translate(px, py); s.scale(1, .28);
      s.strokeStyle = `rgba(200,40,40,${a})`; s.lineWidth = 9; s.beginPath(); s.arc(0, 0, 46, 0, TAU); s.stroke();
      for (const d of [-1, 1]) { s.fillStyle = `rgba(200,40,40,${a})`; s.beginPath(); s.ellipse(d * 14, 0, 11, 24, d * .2, 0, TAU); s.fill(); }
      s.restore(); });
    // the stamp in its hoof: moves to the next spot, lifts, slams
    let ni = STAMPS.findIndex((x) => x + .1 > t); if (ni < 0) ni = 2;
    const sp = kf(t, [[STAMPS[0] - .3, SPOTS[0]], [STAMPS[0] + .15, SPOTS[0]], [STAMPS[1] - .3, SPOTS[1]], [STAMPS[1] + .15, SPOTS[1]], [STAMPS[2] - .25, SPOTS[2]]]);
    const hy = sp[1] - 12 - stampY(t) * 170;
    const shoulder = [sit.body[0] + .75 * OF_SC, sit.body[1] + .2 * OF_SC];
    taper(s, shoulder, [sp[0] - 30, hy - 80], 30, 22, FACE);
    s.fillStyle = '#7a4e30'; s.fillRect(sp[0] - 20, hy - 110, 40, 90); dot(s, sp[0], hy - 120, 38, '#9a6238');
    s.fillStyle = '#3b2a26'; s.fillRect(sp[0] - 70, hy - 30, 140, 28); s.fillStyle = '#d0302a'; s.fillRect(sp[0] - 64, hy - 4, 128, 10);
    // desk lamp
    poly(s, [[1500, 560], [1620, 560], [1660, 640], [1460, 640]], '#e0b060'); stroke(s, [[1560, 640], [1560, 790]], '#1a1320', 12);
    glow(1560, 650, 380, 'rgba(255,180,90,.28)'); glow(1560, 610, 70, 'rgba(255,235,190,.8)');
    for (const x of STAMPS) glow(SPOTS[STAMPS.indexOf(x)][0], SPOTS[STAMPS.indexOf(x)][1], 140, `rgba(255,120,90,${.3 * hit(t, x, 8)})`);
  }

  // ---------- 6 · the father's eyes (60.20 - 61.66), push into the statue ----------
  function eyes(t, lt, dur) {
    const r0 = { head: [ST_X + .98 * ST_SC, ST_Y - .62 * ST_SC - .42 * ST_SC - .26 * ST_SC] };
    const glowK = smooth(inv(EYES - .05, EYES + .25, t)), k = hit(t, EYES, 5);
    cam(r0.head[0], kf(lt, [[0, r0.head[1] + 40], [dur, r0.head[1] - 10]]), kf(lt, [[0, 2.0], [dur, 4.4]], ease.in) + .15 * k);
    square(t); plinth();
    const r = brassRam(t, ST_X, ST_Y, ST_SC, { look: [0, 0], lids: .6 });
    floods(t, 1);
    for (const d of [-1, 1]) {
      const ex = r.head[0] + d * .11 * ST_SC + .03 * ST_SC, ey = r.head[1] - .05 * ST_SC;
      glow(ex, ey, 16 + 10 * glowK, `rgba(255,215,130,${.95 * glowK})`);
      dot(f, ex, ey + 2, 5 * glowK, `rgba(255,250,230,${glowK})`);
    }
    glow(r.head[0] + 6, r.head[1] - 10, 90, `rgba(255,170,80,${.18 * glowK})`);
    flash(.2 * k, '#ffd9a0');
  }

  // ---------- 7 · the prize shelf (61.66 - 63.06) ----------
  function trophy(x, y, h) {
    poly(s, [[x - h * .35, y - h], [x + h * .35, y - h], [x + h * .16, y - h * .5], [x - h * .16, y - h * .5]], '#d9a640');
    s.fillStyle = '#b88a30'; s.fillRect(x - h * .05, y - h * .5, h * .1, h * .3); s.fillRect(x - h * .22, y - h * .22, h * .44, h * .22);
    for (const d of [-1, 1]) { s.strokeStyle = '#c99838'; s.lineWidth = h * .06; s.beginPath(); s.arc(x + d * h * .36, y - h * .82, h * .13, 0, TAU); s.stroke(); }
    dot(f, x - h * .15, y - h * .9, h * .05, 'rgba(255,240,200,.7)');
  }
  function rosette(x, y, r) {
    for (const d of [-1, 1]) poly(s, [[x + d * r * .2, y], [x + d * r * .7, y + r * 1.9], [x + d * r * .25, y + r * 1.6], [x, y + r * .2]], '#2f5fc8');
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; dot(s, x + Math.cos(a) * r * .78, y + Math.sin(a) * r * .78, r * .32, '#3c72e0'); }
    dot(s, x, y, r * .6, '#f0c24a'); dot(s, x, y, r * .3, '#d99a2a');
  }
  function shelf(t, lt, dur) {
    const spot = smooth(inv(PRIZE - .05, PRIZE + .12, t)), k = hit(t, PRIZE, 6);
    const c = kf(lt, [[0, [620, 470, 1.4]], [1.0, [1080, 490, 1.3]], [dur, [980, 700, 1.08]]], ease.inOut);
    cam(c[0], c[1], c[2] + .04 * k);
    s.fillStyle = vgrad(s, 0, H, [[0, '#2b1f3a'], [1, '#1c1630']]); s.fillRect(-300, -300, W + 600, H + 600);
    s.fillStyle = '#17122a'; s.fillRect(-300, 960, W + 600, 400);
    s.fillStyle = '#5a3a24'; s.fillRect(260, 600, 1300, 34); s.fillStyle = '#3a2418'; s.fillRect(260, 634, 1300, 16);
    for (const x of [300, 1520]) { s.fillStyle = '#3a2418'; s.fillRect(x - 10, 634, 20, 60); }
    trophy(420, 600, 130); trophy(620, 600, 170); trophy(1400, 600, 150);
    // the prize: a sheep on a pedestal, rosette on its chest
    s.fillStyle = '#6a4a30'; s.fillRect(930, 540, 260, 60);
    const ps = sheep(t, 1040, 540, 110, { seed: 9, dir: 1, lids: .55, bob: -bob(t) * 3 });
    rosette(ps.head[0] - 30, ps.head[1] + 70, 30);
    glow(1060, 460, 300 + 60 * k, `rgba(255,230,170,${.08 + .16 * spot})`);
    f.save(); f.globalCompositeOperation = 'lighter'; f.globalAlpha = .08 + .12 * spot;
    f.fillStyle = rgrad(f, 1060, -100, 0, 800, [[0, 'rgba(255,235,190,1)'], [1, 'rgba(0,0,0,0)']]);
    f.beginPath(); f.moveTo(1000, -100); f.lineTo(1120, -100); f.lineTo(1260, 600); f.lineTo(860, 600); f.closePath(); f.fill(); f.restore();
    // the sleeper, small, left on the floor below
    const gv = groove(mixPose(POSE.stand, POSE.lean, .5), 'idle', t, 1);
    gv.pose.head -= .35;
    figure(s, gv.pose, { x: 780 + gv.dx, y: 890 + gv.dy, sc: 80, color: '#2d3b72', coat: '#3b4d8e', headC: SKIN });
  }

  // ---------- 8 · disguises (63.06 - 65.46) ----------
  const DS = [380, 780, 1180, 1580], DS_SC = 120;
  function disguises(t, lt, dur) {
    const k = DISG.reduce((a, x) => a + hit(t, x, 9), 0);
    const cx = kf(t, [[63.06, 440], [DISG[0], 500], [DISG[1], 890], [DISG[2], 1290], [DISG[3], 1680], [65.46, 1420]], ease.inOut);
    cam(cx, kf(lt, [[0, 740], [dur, 720]]), kf(lt, [[0, 2.1], [dur - .45, 1.95], [dur, 1.5]]) + .05 * k, .015 * Math.sin(lt * 2));
    s.fillStyle = vgrad(s, 0, 900, [[0, '#4a2c3a'], [1, '#7a4a3a']]); s.fillRect(-300, -300, W + 800, 1200);
    s.fillStyle = '#2a1a26'; s.fillRect(-300, 890, W + 800, 400);
    for (let i = 0; i < 4; i++) { glow(DS[i] + 110, 420, 420, 'rgba(255,170,100,.16)'); dot(f, DS[i] + 110, 250, 14, 'rgba(255,230,180,.8)'); }
    DS.forEach((x, i) => {
      const r = sheep(t, x, 900, DS_SC, { seed: 40 + i, dir: 1, lids: .58 + .06 * hash(i + 9), bob: -bob(t + i * .1) * 3 });
      const pk = t < DISG[i] ? 0 : ease.back(inv(DISG[i], DISG[i] + .2, t));
      disguise(r.head, DS_SC, pk, i);
      if (pk > 0) glow(r.head[0], r.head[1], 160, `rgba(255,220,160,${.4 * hit(t, DISG[i], 8)})`);
    });
  }

  // ---------- 9 · the pride (65.46 - 69.18) ----------
  // the flock, back row first; five of them are lions by the end
  const FLOCK = (() => {
    const o = [], rows = [[680, 52, 150, 60], [770, 68, 190, 0], [880, 88, 240, 90], [1010, 112, 300, 20]];
    rows.forEach(([y, sc, step, off], ri) => { for (let x = -260 + off; x < W + 300; x += step) o.push({ x: x + (hash(o.length * 13) - .5) * 40, y: y + (hash(o.length * 7) - .5) * 14, sc, dir: hash(o.length * 3) > .5 ? 1 : -1, i: o.length }); });
    return o;
  })();
  // which flock members turn lion, in sung order
  const LIONS = (() => {
    const want = [[980, 770], [560, 880], [1360, 770], [1180, 1010], [260, 1010]];
    return want.map(([x, y]) => { let best = 0, bd = 1e9; FLOCK.forEach((m, i) => { const d = Math.abs(m.x - x) + Math.abs(m.y - y) * 3; if (d < bd) { bd = d; best = i; } }); return best; });
  })();
  function flock(t) {
    const lidsK = hit(t, BLINK, 14) * (t > BLINK ? 1 : 0);
    nightField(t, 650, 71);
    fullMoon(1580, 220, 90);
    for (const m of FLOCK) {
      const li = LIONS.indexOf(m.i), b = -bob(t + m.i * .07) * 3 * (m.sc / 90);
      const lids = lerp(.55 + .1 * hash(m.i), 1, lidsK);
      if (li >= 0 && t >= PRIDE[li]) {
        const p = ease.back(inv(PRIDE[li], PRIDE[li] + .22, t)), sq = 1 + .12 * hit(t, PRIDE[li] + .05, 10);
        const sc = m.sc * 1.32;
        glow(m.x + m.dir * .9 * sc, m.y - sc * 1.3, sc * 3, `rgba(255,190,90,${.3 * hit(t, PRIDE[li], 6) + .05})`);
        s.save(); s.translate(m.x, m.y); s.scale(p * sq, p / sq); s.translate(-m.x, -m.y);
        lion(t, m.x, m.y, sc, { dir: m.dir, seed: m.i, lids, bob: b });
        s.restore();
        // the puff it came in on
        const pu = inv(PRIDE[li], PRIDE[li] + .5, t);
        if (pu < 1) for (let k = 0; k < 7; k++) { const a = k / 7 * TAU; dot(s, m.x + Math.cos(a) * sc * (.6 + pu), m.y - sc * .9 + Math.sin(a) * sc * .6 * (.6 + pu), sc * .3 * (1 - pu), `rgba(240,225,190,${.7 * (1 - pu)})`); }
      } else sheep(t, m.x, m.y, m.sc, { seed: m.i + 3, dir: m.dir, lids, bob: b });
    }
  }
  function prideA(t, lt, dur) {
    const k = PRIDE.slice(0, 3).reduce((a, x) => a + hit(t, x, 7), 0), [sx, sy] = shake(t, 5 * k);
    cam(kf(lt, [[0, 940], [dur, 1060]]) + sx, kf(lt, [[0, 770], [dur, 750]]) + sy, kf(lt, [[0, 1.45], [dur, 1.65]], ease.inOut) + .04 * k);
    flock(t);
  }
  function prideB(t, lt, dur) {
    const k = PRIDE.slice(3).reduce((a, x) => a + hit(t, x, 7), 0), [sx, sy] = shake(t, 5 * k);
    cam(kf(lt, [[0, 920], [dur, 880]]) + sx, kf(lt, [[0, 790], [dur, 730]]) + sy, kf(lt, [[0, 1.3], [dur, 1.08]], ease.out) + .04 * k, kf(lt, [[0, -.02], [dur, .01]]));
    flock(t);
  }

  chapter('father', 51.02, 69.18, [
    [51.02, dogSpin],
    [52.90, howl],
    [54.42, statue],
    [MOLTEN - .12, pour],
    [57.84, stamp],
    [60.20, eyes],
    [61.66, shelf],
    [63.06, disguises],
    [PRIDE[0] - .04, prideA],
    [PRIDE[3] - .03, prideB],
  ], { paint: { boil: 8, bloom: 1.2 } });
})();
