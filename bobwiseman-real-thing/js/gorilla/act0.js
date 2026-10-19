// Act 0, intro (0.0-21.0): dawn over the canopy, he sleeps under the tree, the drums (12.5) wake him, the monkey drops in
// above him and ignores him, he settles into the sitting pose that opens verse 1 (act1 at 21.0). See STORYBOARD-gorilla.md.
'use strict';
// ---------------------------------------------------------------- light: dawn ramps to day by 19.0, the sun climbs to act1's sunY 230
const a0_K = (t) => eio(seg(t, 8.0, 19.0));
const a0_sunY = (t) => lerp(520, 230, eio(seg(t, 5.5, 19.5)));
const a0_LIE = Math.PI / 2 * .92; // cast.js's lie rotation
// a jungle frame whose characters take the palette's wash while it is still dawn (drawn in the land layer), and are drawn
// after jungle() once it is full day, exactly as act1 draws them
function a0_scene(g, t, o, chars) {
  const k = a0_K(t), wash = k < .995;
  jungle(g, t, Object.assign({ sky: ['dawn', 'day', k], sunY: a0_sunY(t) }, o, { land: (lg) => { if (o.land) o.land(lg); if (wash) chars(lg); } }));
  if (!wash) chars(g);
}
// act1 shot 1's banana on its short vine, so it is already hanging when verse 1 starts
function a0_hangBanana(g, t) {
  const hang = 1 + .04 * Math.sin(t * 2.2); banana(g, 560, 300 + Math.sin(t * 1.6) * 6, 60, 1.3 * hang, 1);
  g.strokeStyle = '#3c6b3f'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(540, 210); g.quadraticCurveTo(552, 260, 548, 282); g.stroke();
}
// low mist: soft pale bands drifting sideways (background, no outlines)
function a0_mist(g, t, y, a, seed, speed = 14, n = 18) {
  const r = M32(seed); g.save();
  for (let i = 0; i < n; i++) {
    const w = 110 + r() * 230, x = ((r() * (W + 900) + t * speed * (.6 + r() * .8)) % (W + 900)) - 450, yy = y + (r() - .5) * 70;
    g.fillStyle = `rgba(236,230,246,${a * (.3 + r() * .4)})`; g.beginPath(); g.ellipse(x, yy, w, 16 + r() * 22, 0, 0, TAU); g.fill();
    g.beginPath(); g.ellipse(x + w * .5, yy - 10, w * .55, 14 + r() * 14, 0, 0, TAU); g.fill();
  }
  g.restore();
}
// a far bird: a dark flapping V (background, no outline)
function a0_farBird(g, x, y, s, ph) {
  const f = Math.sin(ph) * s * .55; g.strokeStyle = 'rgba(52,50,78,.75)'; g.lineWidth = Math.max(2, s * .16); g.lineCap = 'round';
  g.beginPath(); g.moveTo(x - s, y - f); g.quadraticCurveTo(x - s * .4, y - s * .35 - f * .3, x, y); g.quadraticCurveTo(x + s * .4, y - s * .35 - f * .3, x + s, y - f); g.stroke();
}
// a near bird (outlined, a small character): round body, head, beak, a wing that flaps with ph; dir 1 faces right
function a0_bird(g, x, y, s, ph, dir = 1, col = '#f2efe6', perched = false) {
  g.save(); g.translate(x, y); g.scale(s * dir, s);
  const wa = perched ? .25 : Math.sin(ph) * 1.1;
  ol(g, () => { g.moveTo(-.55, -.05); g.lineTo(-1.0, -.32); g.lineTo(-.95, .08); g.closePath(); }, col, 4); // tail
  if (perched) { g.strokeStyle = INK; g.lineWidth = 4 / sc(g); g.lineCap = 'round'; g.beginPath(); g.moveTo(-.1, .3); g.lineTo(-.14, .62); g.moveTo(.15, .3); g.lineTo(.18, .62); g.stroke(); }
  ol(g, ell(g, 0, 0, .62, .44), col, 4);
  ol(g, ell(g, .5, -.32, .34, .32), col, 4);
  ol(g, () => { g.moveTo(.8, -.4); g.lineTo(1.12, -.3); g.lineTo(.8, -.2); g.closePath(); }, '#f0a63c', 4);
  g.fillStyle = INK; g.beginPath(); g.arc(.6, -.38, .07, 0, TAU); g.fill();
  g.save(); g.translate(-.05, -.12); g.rotate(-wa - .2);
  ol(g, () => { g.moveTo(0, 0); g.quadraticCurveTo(-.3, -.75, -.75, -.85); g.quadraticCurveTo(-.45, -.2, 0, 0); }, col, 4);
  g.restore(); g.restore();
}
// the monkey's breakfast: a fig, bitten once `bitten` is set
function a0_fig(g, x, y, r, bitten) {
  ol(g, () => { g.moveTo(x, y - r * 1.25); g.quadraticCurveTo(x + r * .3, y - r * .8, x + r, y + r * .1); g.bezierCurveTo(x + r * 1.1, y + r * 1.05, x - r * 1.1, y + r * 1.05, x - r, y + r * .1); g.quadraticCurveTo(x - r * .3, y - r * .8, x, y - r * 1.25); }, '#7b3f6e', 3.5);
  if (bitten) ol(g, ell(g, x + r * .45, y - r * .3, r * .5, r * .42), '#ec8aa0', 3);
}
// the cartoon dust puff (as act1's cloud, smaller): cream outlined balls blooming and fading
function a0_puff(g, x, y, u, n = 5, R = 60, seed = 3) {
  if (u <= 0 || u >= 1) return; const r = M32(seed); g.save(); g.globalAlpha = 1 - ei(u); const gr = eo(u);
  for (const side of [-1, 1]) {
    const balls = [...Array(n)].map(() => { const d = R * (1.9 + r() * 2.2) + gr * R * (.8 + r() * .8); return [x + side * d, y - R * (.15 + r() * .7) - gr * R * (.3 + r() * .6), R * (.55 + r() * .45) * (.55 + gr * .65)]; });
    balls.sort((p, q) => q[1] - p[1]).reverse();
    for (const [bx, by, rr] of balls) ol(g, ell(g, bx, by, rr, rr * .85), '#efe4cc');
  }
  g.restore();
}
// ---------------------------------------------------------------- the gorilla waking
// u = 1 asleep on his back (cast.js's lie pose), 0 sitting up (the sit pose); in between he swings up about his seat
const a0_GX = 620, a0_GS = 330;
// he swings about his base (body origin) by th; the body is lifted so its lowest point stays on the grass (no floating)
const a0_HULL = [[0, -.78], [.36, -.45], [.3, -.15], [0, -.07], [-.3, -.15], [-.36, -.45], [.3, -.84], [-.3, -.84], [0, -1.2], [.21, -1.1], [-.21, -1.1],
  [.33, .02], [-.33, .02], [.52, .03], [-.52, .03], [0, .03]];
const a0_low = (th) => Math.max(...a0_HULL.map(([x, y]) => x * Math.sin(th) + y * Math.cos(th)));
const a0_LOW0 = a0_low(0);
const a0_oy = (u) => GROUND - (a0_low(-a0_LIE * u) - a0_LOW0) * a0_GS;
function a0_sleeper(g, u, P) {
  const s = a0_GS, th = -a0_LIE * u, oy = a0_oy(u), sq = P.squash || 0;
  if (u <= 0) { gorilla(g, a0_GX, GROUND, s, Object.assign({ sit: true, lean: -th }, P)); return; }
  g.save(); g.globalAlpha = .22; g.fillStyle = '#20301c'; g.beginPath(); g.ellipse(a0_GX - .42 * s * u, GROUND + 4, lerp(.55, .62, u) * s, .07 * s, 0, 0, TAU); g.fill(); g.restore();
  gorilla(g, a0_GX, oy + .4 * s * (1 - sq), s, Object.assign({ lie: true, lean: a0_LIE + th, sit: u < .5 }, P));
}
// a point on his body (body units bx, by) in screen space at pose u, for the snore bubble and the perched bird
function a0_liePt(bx, by, sq = 0, u = 1) {
  const th = -a0_LIE * u, X = bx * Math.cos(th) - by * Math.sin(th), Yb = bx * Math.sin(th) + by * Math.cos(th);
  return [a0_GX + X * a0_GS, a0_oy(u) + Yb * a0_GS * (1 - sq)];
}
// breathing: one snore every 1.75 s from 5.5, the fourth swells until it pops on the drums at 12.5
const a0_breath = (t) => { const ph = (t - 5.5) / 1.75; return .5 - .5 * Math.cos(ph * TAU); };
function a0_bubbleR(t) {
  if (t < 5.5 || t >= 12.5) return 0; const ph = (t - 5.5) / 1.75, c = Math.floor(ph), u = ph - c;
  if (c < 3) return [34, 44, 54][c] * Math.pow(Math.sin(Math.PI * u), 1.4);
  return lerp(20, 112, eo(u));
}
function a0_bubble(g, nose, r) {
  if (r < 2) return; const x = nose[0] + r * .72, y = nose[1] - r * .72;
  ol(g, ell(g, x, y, r, r * .96), 'rgba(214,232,250,.55)', 4.5);
  g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = Math.max(3, r * .09); g.lineCap = 'round'; g.beginPath(); g.arc(x, y, r * .7, -2.5, -1.7); g.stroke();
}
// the gorilla's yawn: a huge open mouth over the muzzle (head coordinates), y 0 shut .. 1 wide
function a0_yawn(g, tilt, y) {
  if (y <= .02) return; g.save(); g.translate(0, -.84); g.rotate(tilt);
  ol(g, ell(g, 0, .105, .07 * (.6 + .4 * y), .085 * y), '#5a2421');
  g.fillStyle = '#c86d6a'; g.beginPath(); g.ellipse(0, .105 + .05 * y, .045 * y, .022 * y, 0, 0, TAU); g.fill();
  g.restore();
}

ACTS.push(...[
  // 1. harmonica alone: before sunrise over the treetops, mist between the rows, the sun's rim, far birds crossing
  { t0: 0.0, t1: 5.5, draw(g, t, lt) {
    cam(g, lt, 5.5, 1.0, 1.07, 1180, 520);
    const hz = 640, rise = eio(seg(t, 0, 5.5));
    jungle(g, t, { hz, tree: false, ferns: false, sky: ['night', 'dawn', lerp(.42, 1, rise)], sunX: 1180, sunY: lerp(hz - 105, hz - 235, eo(seg(t, .3, 5.5))), sunR: 74, rays: rise, raysX: 760,
      land: (lg) => {
        const rows = [[hz + 40, 50, 30, '#88b397', 41], [hz + 175, 80, 40, '#679b74', 42], [hz + 330, 115, 55, '#457f53', 43], [hz + 520, 160, 70, '#2f5f3b', 44]];
        rows.forEach(([y0, r0, rv, col, seed], ri) => {
          const r = M32(seed), y = y0 + ri * ri * 2.2 * lt, n = Math.ceil((W + 600) / (r0 * 1.15));
          blobs(lg, [...Array(n)].map((_, i) => [-300 + i * r0 * 1.15 + r() * r0 * .4, y - r() * rv, r0 + r() * rv]), col);
          lg.fillStyle = col; lg.fillRect(-300, y, W + 600, H);
          a0_mist(lg, t, y - 20 - r0 * .3, .36 - ri * .05, 60 + ri, 10 + ri * 9);
        });
      } });
    for (let i = 0; i < 5; i++) { const x = -120 + (t - .8 - i * .12) * 430 + (i % 2) * 40, y = 300 + i * 22 + Math.sin(t * 1.3 + i) * 8; if (x > -150 && x < W + 150) a0_farBird(g, x, y, 15 - i, t * 11 + i * 1.7); }
  } },
  // 2. blue dawn in the clearing: he is asleep on his back under the tree, belly rising, a snore bubble, mist on the grass
  { t0: 5.5, t1: 9.0, draw(g, t, lt) {
    cam(g, lt, 3.5, 1.0, 1.05, 520, 780);
    const br = a0_breath(t), sq = -br * .03;
    a0_scene(g, t, { treeX: 420, land: (lg) => a0_mist(lg, t, 640, .3 * (1 - seg(t, 7, 12)), 70, 18, 6) }, (cg) => {
      a0_hangBanana(cg, t);
      a0_sleeper(cg, 1, { squash: sq, handL: [-.45, -.12], handR: [.12, -.42], bendL: 20, bendR: 30, eyes: 'shut', mouth: br > .5 ? 'o' : 'flat', look: [0, 0] });
      a0_bubble(cg, a0_liePt(0, -.81, sq), a0_bubbleR(t));
    });
  } },
  // 3. closer: the snore bubble swells, a little bird lands on his belly and rides the breathing
  { t0: 9.0, t1: 12.5, draw(g, t, lt) {
    cam(g, lt, 3.5, 1.6, 1.7, 330, 770);
    const br = a0_breath(t), sq = -br * .03;
    a0_scene(g, t, { treeX: 420 }, (cg) => {
      a0_sleeper(cg, 1, { squash: sq, handL: [-.45, -.12], handR: [.12, -.42], bendL: 20, bendR: 30, eyes: 'shut', mouth: br > .5 ? 'o' : 'flat', brow: t > 11.6 ? -.3 : 0 });
      a0_bubble(cg, a0_liePt(0, -.81, sq), a0_bubbleR(t));
      // the bird: flies in from the right, lands on his flank on 10.6, hops once on 11.4
      const perch = a0_liePt(.34, -.22, sq), land = 10.6;
      if (t < land) { const u = eio(seg(t, 9.9, land)); a0_bird(cg, lerp(1300, perch[0], u), lerp(420, perch[1] - 20, u) - Math.sin(u * Math.PI) * 60, 30, t * 26, -1, '#8fb7d9'); }
      else { const hop = Math.max(0, Math.sin(cl((t - 11.4) / .28) * Math.PI)); a0_bird(cg, perch[0] + eo(seg(t, 11.4, 11.68)) * 14, perch[1] - 20 - hop * 26 + ring(t - land, 18, 8) * 6, 30, 0, -1, '#8fb7d9', true); }
    });
  } },
  // 4. the drums: the bubble pops, birds burst out of the tree, he jolts awake, looks about, springs up to sitting
  { t0: 12.5, t1: 14.4, draw(g, t, lt) {
    cam(g, lt, 1.9, 1.28, 1.32, 600, 780);
    const pop = 12.5, up0 = 13.0, up1 = 13.46;
    const u = 1 - back(seg(t, up0, up1)) * (t >= up0 ? 1 : 0);
    const jolt = ring(t - pop, 24, 7);
    a0_scene(g, t, { treeX: 420 }, (cg) => {
      a0_hangBanana(cg, t);
      const dart = t < up0 ? (t < 12.72 ? [0, -1] : t < 12.88 ? [1, 0] : [-1, .3]) : [0, 0];
      const groggy = t > up1 + .25;
      const sq = t < up0 ? -Math.max(0, jolt) * .06 : (t >= up1 ? ring(t - up1, 22, 9) * .06 : 0);
      a0_sleeper(cg, u, { squash: sq, handL: t < up0 ? [-.45, -.12] : [-.32, -.32], handR: t < up0 ? [.12, -.42] : [.32, -.3], bendL: t < up0 ? 20 : 30, bendR: t < up0 ? 30 : -30,
        eyes: t < pop + .04 ? 'shut' : (groggy ? ((t % 1.1) < .14 ? 'shut' : 'half') : 'open'), mouth: t < up1 ? 'o' : 'flat', brow: groggy ? -.2 : -.7, look: groggy ? [.2, 0] : dart });
      a0_puff(cg, a0_GX, GROUND, seg(t, up0 + .05, up0 + .8), 3, 46, 9);
      // pop: droplets fly off where the bubble was
      const nose = a0_liePt(0, -.81), bx = nose[0] + 112 * .72, by = nose[1] - 112 * .72, pu = seg(t, pop, pop + .35);
      if (pu < 1) { for (let i = 0; i < 9; i++) { const a = i / 9 * TAU; ol(cg, ell(cg, bx + Math.cos(a) * 112 * (1 + pu * .8), by + Math.sin(a) * 108 * (1 + pu * .8), 9 * (1 - pu), 9 * (1 - pu)), 'rgba(214,232,250,.8)', 3); } sparkle(cg, bx, by, 60 * (1 - pu), 1 - pu, '#ffffff'); }
      // startle lines at his head
      if (t >= pop && t < pop + .4) { const hd = a0_liePt(0, -.84); cg.strokeStyle = 'rgba(43,33,28,.75)'; cg.lineWidth = 5; for (let i = 0; i < 3; i++) { const a = -2.2 + i * .45; cg.beginPath(); cg.moveTo(hd[0] + Math.cos(a) * 130, hd[1] + Math.sin(a) * 130); cg.lineTo(hd[0] + Math.cos(a) * 175, hd[1] + Math.sin(a) * 175); cg.stroke(); } }
      // the alarm: birds burst out of the canopy (and the one off his belly), up and away
      const r = M32(123), cols = ['#f2efe6', '#8fb7d9', '#e8a24a', '#f2efe6', '#cdb8ef'];
      for (let i = 0; i < 11; i++) {
        const x0 = 160 + r() * 620, y0 = 170 + r() * 150, dx = (r() - .35) * 1.4, d0 = pop + r() * .18, v = seg(t, d0, d0 + 1.3);
        if (t < d0 || v >= 1) continue; const dd = 1500 * Math.pow(v, 1.35), ang = -Math.PI / 2 + dx * .9;
        a0_bird(cg, x0 + Math.cos(ang) * dd, y0 + Math.sin(ang) * dd * .8, 26 + r() * 8, t * 30 + i, Math.cos(ang) >= 0 ? 1 : -1, cols[i % cols.length]);
      }
      const perch = a0_liePt(.34, -.22), bv = seg(t, pop, pop + 1.2);
      if (bv < 1) a0_bird(cg, perch[0] + 14 + 900 * Math.pow(bv, 1.3), perch[1] - 20 - 700 * Math.pow(bv, 1.1), 30, t * 30, 1, '#8fb7d9');
      // shaken leaves drifting down
      for (let i = 0; i < 3; i++) { const lu = seg(t, pop + .1 + i * .2, pop + 1.9 + i * .2), lx = 330 + i * 190 + Math.sin(lu * 8 + i) * 50, ly = lerp(240, 760, eio(lu));
        if (lu > 0 && lu < 1) { cg.save(); cg.translate(lx, ly); cg.rotate(Math.sin(lu * 8 + i) * .7); ol(cg, () => { cg.moveTo(-24, 0); cg.quadraticCurveTo(0, -18, 24, 0); cg.quadraticCurveTo(0, 18, -24, 0); }, '#6caa58', 4); cg.restore(); } }
    });
  } },
  // 5. close: a huge yawn with a long stretch, then he scratches his head
  { t0: 14.4, t1: 16.3, draw(g, t, lt) {
    cam(g, lt, 1.9, 1.62, 1.68, 640, 660);
    const raise = eio(seg(t, 14.55, 14.95)), lower = eio(seg(t, 15.45, 15.75)), y = eio(seg(t, 14.6, 14.9)) * (1 - eio(seg(t, 15.4, 15.6)));
    const shiver = t > 14.95 && t < 15.45 ? Math.sin((t - 14.95) * 40) * .006 : 0;
    const scr = seg(t, 15.6, 15.8), sx = Math.sin(t * 34) * .045 * scr;
    a0_scene(g, t, { treeX: 420 }, (cg) => {
      const up = raise * (1 - lower);
      const hR = [lerp(lerp(.32, .45, up), .31, scr), lerp(lerp(-.3, -1.38, up), -1.0 + sx, scr)];
      const hL = [lerp(-.32, -.45, up), lerp(-.32, -1.38, up)];
      const tilt = -.1 * y - .07 * scr;
      gorilla(cg, a0_GX, GROUND, a0_GS, { sit: true, squash: -.06 * up + shiver, handL: hL, handR: hR, bendL: lerp(30, -25, up), bendR: scr > 0 ? lerp(25, 45, scr) : lerp(-30, 25, up),
        eyes: y > .3 ? 'squint' : (scr > .5 || raise < .2 ? 'half' : 'open'), brow: y > .3 ? -.6 : 0, mouth: scr > .5 ? 'smile' : 'flat', tilt, look: [.2, -.2],
        front: (gg) => a0_yawn(gg, tilt, y) });
    });
  } },
  // 6. above him on the branch (act1's shot 8 set): the monkey drops in, eats a fig, glances down, ignores him
  { t0: 16.3, t1: 18.6, draw(g, t, lt) {
    cam(g, lt, 2.3, 1.0, 1.04, 960, 540);
    const land = 16.75, bite = 17.3, glance = 17.65, snub = 18.0;
    const d = t >= land ? ring(t - land, 14, 5) * 26 : 0, mq = t >= land ? ring(t - land, 20, 8) * .1 : 0;
    a0_scene(g, t, { treeX: 1500, sunX: 520, raysX: 200 }, (cg) => {
      cg.fillStyle = '#5a3f2b'; cg.beginPath(); cg.moveTo(1500, 330); cg.quadraticCurveTo(1100, 300 + d * .6, 760, 340 + d); cg.lineTo(760, 362 + d); cg.quadraticCurveTo(1100, 326 + d * .6, 1500, 360); cg.closePath(); cg.fill();
      cg.fillStyle = '#4f8f57'; for (const [x, y, r] of [[780, 330, 46], [820, 300, 38], [760, 360, 30]]) { cg.beginPath(); cg.arc(x, y + d, r, 0, TAU); cg.fill(); }
      // him, small below, sitting; still scratching until the monkey lands, then looking up
      const lookUp = eo(seg(t, land, land + .3)), sour = seg(t, snub + .15, snub + .4), scr = 1 - seg(t, land, land + .2);
      gorilla(cg, 760, GROUND, 230, { sit: true, handL: [-.32, -.32], handR: scr > 0 ? [lerp(.32, .31, scr), lerp(-.3, -1.0 + Math.sin(t * 34) * .045, scr)] : [.32, -.3], bendL: 30, bendR: scr > 0 ? 45 : -30,
        eyes: t < land ? 'half' : 'open', look: [lerp(.2, .9, lookUp), lerp(-.2, -1, lookUp)], tilt: -.18 * lookUp, brow: lerp(0, .5, sour), mouth: sour > .5 ? 'frown' : (lookUp > .5 ? 'o' : 'smile') });
      // the monkey: falls from above, lands on the branch with a bounce, fig in hand
      const fall = ei(seg(t, 16.45, land)), my = t < land ? lerp(-160, 330, fall) : 330 + d * .55;
      if (t >= 16.45) {
        cg.save(); cg.translate(1040, my); cg.scale(1 + mq, 1 - mq); cg.translate(-1040, -my);
        const air = t < land, eat = t >= bite, chew = t > bite + .15 ? (t - bite) * 16 : 0, gl = eo(seg(t, glance, glance + .2)) * (1 - eo(seg(t, snub, snub + .25))), away = eo(seg(t, snub, snub + .3));
        monkey(cg, 1040, my, 260, { eyes: air ? 'open' : (away > .5 || (eat && t < glance) ? 'happy' : 'open'), mouth: chew ? 'chew' : 'smile', chew, look: [lerp(.6, -.7, gl), lerp(0, 1, gl)], tilt: -gl * .12 + away * .3,
          handL: air ? [-.34, -.9] : [.06, -.5], handR: air ? [.36, -.92] : [.2 - .1 * Math.max(0, Math.sin(cl((t - bite + .2) / .4) * Math.PI), Math.sin(cl((t - 18.1) / .4) * Math.PI)), -.42], tail: air ? -2 : 0,
          hold: (gg, k) => { const nib = Math.max(0, Math.sin(cl((t - bite + .2) / .4) * Math.PI), Math.sin(cl((t - 18.1) / .4) * Math.PI)), fx = air ? .36 : .22 - .1 * nib, fy = air ? -1.0 : -.5 + .02 * nib; a0_fig(gg, fx, fy, .085, eat); } });
        cg.restore();
      }
      if (t >= land && t < land + .35) sparkle(cg, 1040, 330 - 60, 30, 1 - seg(t, land, land + .35));
    });
  } },
  // 7. back to the clearing in full morning: he gives the monkey up, looks ahead, settles; ends on act1's first frame
  { t0: 18.6, t1: 21.0, draw(g, t, lt) {
    const huff = 19.2, settle = eio(seg(t, 19.3, 19.9));
    a0_scene(g, t, { treeX: 420 }, (cg) => {
      a0_hangBanana(cg, t);
      const sh = t >= huff ? ring(t - huff, 16, 6) * .035 : 0;
      gorilla(cg, a0_GX, GROUND, a0_GS, { sit: true, squash: sh, handL: [-.32, -.32], handR: [.32, -.3], bendL: 30, bendR: -30,
        look: [lerp(.7, .3, settle), lerp(-.9, 0, settle)], tilt: lerp(-.12, 0, settle), eyes: (t > huff - .05 && t < huff + .3) || (t > 20.3 && t < 20.42) ? 'half' : 'open',
        brow: lerp(.3, 0, settle), mouth: t > huff - .05 && t < huff + .35 ? 'frown' : 'flat' });
      if (t >= huff && t < huff + .5) { const a = 1 - seg(t, huff, huff + .5); cg.save(); cg.globalAlpha = a * .8; cg.fillStyle = '#f4efe0'; for (let i = 0; i < 2; i++) { cg.beginPath(); cg.arc(a0_GX + 60 + i * 26 + (1 - a) * 50, GROUND - 270 + i * 4 - (1 - a) * 10, 13 - i * 3, 0, TAU); cg.fill(); } cg.restore(); }
    });
  } },
]);
