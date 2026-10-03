// 245.0 - 290.0  dressed in her laughter. Colour arrives: her laughter is sewn into his trousers, her
// smile knitted into his sweater, the grey coat flies off, a stamp can't stop him, and he walks out of
// the ministry's front doors to a road sign: A HUNDRED MILES.
(() => {
  // his new clothes, in real colour (the first colours that aren't sky or her)
  const PANTS = '#b8434f', SWEATER = '#d9a23a', SCARF = '#2f8f7f', SHIRT = '#8c8a7e', DARK = '#3f3d36';
  const satAt = (t) => kf(t, [[245, .32], [252, .36], [260, .44], [265, .55], [275, .68], [284, .76], [290, .82]], (k) => k);
  const pop = (t, t0, d = .35) => ease.back(inv(t0, t0 + d, t));

  // ---- the pinball-cartoon drawing style (pnc.html): same palette, drawn with fine lines, soft volume,
  // rounded forms and deco ornament. PK is null on the plain path, which then draws exactly as before.
  const PK = window.PNC_ON ? window.PNCK : null;
  const OL = (c, k = .55) => PK ? PK.dark(c, k) : INK;               // outline colour for a fill
  function rr(x, y, w, h, r, c, lw) {                                 // a soft rounded box with a fine outline
    s.beginPath(); s.roundRect(x, y, w, h, r); PK.soft(c, x, y, x + w, y + h); s.lineWidth = lw; s.strokeStyle = PK.dark(c, .55); s.stroke();
  }
  // stacked rolling rainbow hills along a baseline: each hump is a set of concentric arches
  function hills(y, x0, x1, R, seed, cols = [ROSE_L, AMBER, CREAM, '#7fb59a', SKY_B]) {
    for (let row = 0; row < 2; row++) {
      const rr0 = R * (row ? 1 : .72), step = rr0 * 1.55, off = hash(seed + row * 7) * step;
      for (let x = x0 - off; x < x1 + rr0; x += step) {
        const cy = y + (row ? 0 : -R * .18);
        for (let b = 0; b < cols.length; b++) {
          const r = rr0 * (1 - b * .17), c = cols[(b + row * 2) % cols.length];
          s.beginPath(); s.arc(x, cy, r, Math.PI, TAU); s.closePath(); PK.soft(c, x - r, cy - r, x + r, cy);
          s.lineWidth = 1.2; s.strokeStyle = PK.dark(c, .45); s.stroke();
        }
      }
    }
  }
  // his new clothes, side on, in the cartoon hand: built on the kit's man() (fig + head + tube + blob)
  function suitSideP(bx, by, k, { ph = 0, walk = 0, face = 1, t = 0, kase = true } = {}) {
    const { fig, tube, blob, ball, head, dark, path } = PK;
    const sw = Math.sin(ph * TAU) * .32 * walk, bob = Math.abs(Math.sin(ph * TAU)) * .03 * walk;
    if (kase) carriedCase([bx, by], k, face, sw);
    fig([bx, by], k, face, (u) => {
      const lw = 1.3 * u, hip = [0, -.95], sh = -1.45 + bob, fl = Math.sin(t * 6) * .04;
      blob([[-.02, sh + .02], [-.1, sh - .03], [-.52 - .1 * walk, sh + .1 + fl], [-.48 - .1 * walk, sh + .21 + fl]], SCARF, lw, false);
      for (const [a, far] of [[-sw, true], [sw, false]]) {
        const kn = [Math.sin(a) * .5, hip[1] + .5], ft = [Math.sin(a) * .9 + .05, -.05];
        tube(hip, kn, ft, .1, .07, far ? dark(PANTS, .2) : PANTS, lw);
        s.beginPath(); s.moveTo(...hip); s.quadraticCurveTo(...kn, ...ft); s.lineWidth = .016; s.strokeStyle = AMBER; s.stroke();
        blob([[ft[0] - .07, -.07], [ft[0] + .12, -.08], [ft[0] + .17, -.01], [ft[0] - .08, 0]], '#2c2621', lw);
      }
      const body = [[-.15, sh - .02], [.13, sh - .02], [.2, sh + .1], [.2, hip[1] + .03], [0, hip[1] + .07], [-.21, hip[1] + .03], [-.21, sh + .1]];
      blob(body, SWEATER, lw);
      withT(() => { path(body); s.clip(); const zz = []; for (let i = 0; i <= 9; i++) zz.push([-.22 + i * .05, sh + .22 + (i % 2 ? .05 : 0)]);
        line(zz, ROSE, .035); line(zz.map(([x, y]) => [x, y + .1]), ROSE, .018); s.fillStyle = dark(SWEATER, .22); s.fillRect(-.3, hip[1] - .03, .6, .12); });
      blob([[-.13, sh - .08], [.13, sh - .08], [.15, sh + .05], [-.14, sh + .05]], SCARF, lw);
      for (let j = 0; j < 5; j++) { const a = j / 5 * TAU; ball(.13 + Math.cos(a) * .03, sh + .22 + Math.sin(a) * .03, .026, ROSE, lw * .6); }
      ball(.13, sh + .22, .016, AMBER, lw * .5);
      const hy = -1.64 + bob; head(.04, hy, lw); s.fillStyle = ROSE; s.fillRect(.04 - .135, hy - .15, .27, .04);
      const shp = [.02, sh + .12], ang = sw * .8;
      const el = [shp[0] + Math.sin(ang) * .36, shp[1] + Math.cos(ang) * .36], hd = [el[0] + Math.sin(ang * 1.1) * .34, el[1] + Math.cos(ang * 1.1) * .34];
      tube(shp, el, hd, .075, .055, SWEATER, lw); ball(hd[0], hd[1], .06, SKIN, lw);
    });
  }
  // his coat, front view, in local metre units (feet at the origin)
  function coatLocal(lw) {
    const { blob, tube, ball, dark } = PK, sh = -1.45;
    blob([[-.17, sh - .02], [.17, sh - .02], [.27, sh + .1], [.28, sh + .5], [.36, -.42], [0, -.4], [-.36, -.42], [-.28, sh + .5], [-.27, sh + .1]], COAT, lw);
    line([[-.1, sh], [0, sh + .36], [.1, sh]], dark(COAT, .55), lw * 1.5); line([[0, sh + .36], [0, -.42]], dark(COAT, .55), lw);
    for (const yy of [sh + .5, sh + .72]) ball(.05, yy, .025, dark(COAT, .3), lw * .6);
    for (const i of [-1, 1]) { const a = [i * .25, sh + .05], h = [i * .31, -.86]; tube(a, [i * .31, sh + .3], h, .075, .06, COAT, lw); ball(h[0], h[1] + .03, .06, SKIN, lw); }
  }
  // the man front (or back) on, in the cartoon hand, same joints as suitFront
  function suitFrontP(cx, by, k, o = {}) {
    const { coat = 0, pants = 1, knit = 1, scarf = 0, flower = 0, band = 0, hatTip = 0, back = false, ph = 0, walk = 0, kase = false, arms = 0, t = 0 } = o;
    const { fig, tube, blob, ball, dark, mix, path } = PK, sw = Math.sin(ph * TAU) * walk;
    // (seen from behind he carries the case in front of him, out of sight)
    fig([cx, by], k, 1, (u) => {
      const lw = 1.3 * u, hip = -.95, sh = -1.45, hy = -1.62, LEG = pants > 0 ? PANTS : '#4f4b42';
      for (const i of [-1, 1]) {
        const lift = walk * Math.max(0, Math.sin(ph * TAU + (i > 0 ? Math.PI : 0))) * .07, x0 = i * .1, fy = -lift;
        tube([x0, hip], [x0 + i * .006, (hip + fy) / 2], [x0, fy - .06], .1, .08, LEG, lw);
        if (pants > 0) for (const dx of [-.045, 0, .045]) line([[x0 + dx, hip + .02], [x0 + dx * .8, fy - .08]], AMBER, .012);
        blob([[x0 - .1, fy - .08], [x0 + .1, fy - .08], [x0 + .12 + i * .03, fy], [x0 - .12 + i * .03, fy]], '#2c2621', lw);
      }
      blob([[-.2, hip - .04], [.2, hip - .04], [.2, hip + .1], [-.2, hip + .1]], LEG, lw, false);
      const torso = [[-.23, sh], [.23, sh], [.26, sh + .12], [.21, hip + .06], [-.21, hip + .06], [-.26, sh + .12]];
      blob(torso, SHIRT, lw);
      if (knit > 0) withT(() => { const top = hip + .06 - knit * (hip + .06 - sh + .02);
        s.beginPath(); s.rect(-.4, top, .8, 2); s.clip(); blob(torso, SWEATER, lw);
        path(torso); s.clip(); const zz = []; for (let i = 0; i <= 10; i++) zz.push([-.25 + i * .05, sh + .22 + (i % 2 ? .05 : 0)]);
        line(zz, ROSE, .035); line(zz.map(([x, y]) => [x, y + .1]), ROSE, .02); s.fillStyle = dark(SWEATER, .22); s.fillRect(-.3, hip - .02, .6, .09); });
      for (const i of [-1, 1]) {
        const a = [i * .23, sh + .05], swing = (i > 0 ? sw : -sw) * .06, h = [i * (.3 + arms * .22) + swing * .3, hip + .03 - arms * .16 - Math.abs(swing) * .2];
        tube(a, [(a[0] + h[0]) / 2 + i * .03, (a[1] + h[1]) / 2], h, .07, .055, knit >= 1 ? SWEATER : SHIRT, lw); ball(h[0], h[1] + .03, .06, SKIN, lw);
      }
      if (coat > 0) coatLocal(lw);
      blob([[-.05, sh - .12], [.05, sh - .12], [.05, sh + .02], [-.05, sh + .02]], SKIN, lw, false);
      const ear = mix(SKIN, '#c0605a', .12);
      if (back) { blob([[-.12, hy - .1], [.12, hy - .1], [.13, hy + .06], [0, hy + .14], [-.13, hy + .06]], SKIN, lw);
        blob([[-.13, hy - .09], [.13, hy - .09], [.12, hy + .05], [0, hy + .09], [-.12, hy + .05]], '#4a3f33', lw); ball(-.135, hy + .01, .03, ear, lw); ball(.135, hy + .01, .03, ear, lw); }
      else { ball(-.14, hy + .01, .035, ear, lw); ball(.14, hy + .01, .035, ear, lw);
        blob([[-.11, hy - .12], [.11, hy - .12], [.14, hy + .01], [.09, hy + .13], [-.09, hy + .13], [-.14, hy + .01]], SKIN, lw);
        for (const ex of [-.045, .045]) { s.beginPath(); s.ellipse(ex, hy - .03, .016, .024, 0, 0, TAU); s.fillStyle = '#2a1f1a'; s.fill(); }
        ball(0, hy + .03, .042, mix(SKIN, '#c0605a', .25), lw);
        s.beginPath(); s.arc(0, hy + .05, .055, .25 * Math.PI, .75 * Math.PI); s.lineWidth = lw * 1.5; s.strokeStyle = dark(SKIN, .55); s.stroke(); }
      if (scarf > 0) withT(() => { s.translate(0, sh - .03); s.scale(scarf, scarf); const fl = Math.sin(t * 5) * .03;
        blob([[-.15, -.06], [.15, -.06], [.17, .06], [-.17, .06]], SCARF, lw);
        if (!back) { blob([[.03, .04], [.11, .04], [.13 + fl, .5], [.05 + fl, .52]], SCARF, lw, false); for (let j = 0; j < 4; j++) line([[.055 + fl + j * .022, .51], [.055 + fl + j * .022, .56]], dark(SCARF, .3), .012); } });
      if (flower > 0 && !back) withT(() => { s.translate(-.12, sh + .2); s.scale(flower, flower); s.rotate(t * .3);
        for (let j = 0; j < 5; j++) { const a = j / 5 * TAU; ball(Math.cos(a) * .035, Math.sin(a) * .035, .03, ROSE, lw * .6); } ball(0, 0, .02, AMBER, lw * .5); });
      withT(() => { s.translate(0, hy - .09 - hatTip * .14); s.rotate(-hatTip * .25);
        blob([[-.25, 0], [.25, -.01], [.27, .03], [0, .05], [-.27, .04]], HAT, lw);
        blob([[-.14, -.01], [.14, -.01], [.13, -.18], [.03, -.15], [-.03, -.19], [-.13, -.17]], HAT, lw);
        s.fillStyle = dark(HAT, .5); s.fillRect(-.135, -.06, .27, .04);
        if (band > 0) { s.globalAlpha = band; s.fillStyle = ROSE; s.fillRect(-.135, -.06, .27, .04); s.globalAlpha = 1; } });
    });
  }
  // the sewing machine, cartoon hand: rounded black-lacquer body, deco fan decal, chrome, a glossy wheel
  function sewingP(t, x, y, sc, run = 1) {
    withT(() => {
      s.translate(x, y); const k = sc / 900; s.scale(k, k); const lw = 1.3 / k, body = '#2f2b27';
      rr(-450, -60, 900, 60, 22, '#5a5346', lw);
      rr(180, -430, 150, 380, 46, body, lw);
      rr(-415, -492, 765, 114, 54, body, lw);
      rr(-418, -492, 172, 330, 46, body, lw);
      line([[-370, -474], [300, -474]], 'rgba(255,250,235,.32)', 12);                 // lacquer gloss
      line([[290, -400], [290, -80]], 'rgba(255,250,235,.22)', 10);
      PK.fan(-40, -380, 70, 7, Math.PI, TAU, [BRASS, AMBER, CREAM], lw * .8);       // the gold fan decal
      for (let i = 0; i < 2; i++) { s.beginPath(); s.arc(-260 + i * 420, -435, 26, Math.PI * .1, Math.PI * 1.5); s.lineWidth = 4 / k; s.strokeStyle = BRASS; s.stroke(); }
      const bob = run * (Math.sin(onTwos(t, 24) * TAU * 6) * .5 + .5) * 70;
      rr(-343, -170, 26, 60 + bob, 8, '#c9cfd0', lw);
      line([[-330, -110 + bob], [-330, -62 + bob * .55]], '#e4e8e6', 4 / k);
      rr(-372, -80, 84, 18, 6, '#9aa3a4', lw);
      PK.ball(380, -330, 95, '#4a4540', lw);
      const sp = t * 9 * run; for (let i = 0; i < 4; i++) { const a = sp + i * TAU / 4; line([[380, -330], [380 + Math.cos(a) * 80, -330 + Math.sin(a) * 80]], PK.dark('#4a4540', .5), 6); }
      PK.ball(380, -330, 18, BRASS, lw);
      PK.tube([60, -480], [60, -520], [60, -565], 6, 5, '#c9cfd0', lw * .6);
      rr(22, -548, 76, 48, 12, ROSE, lw);
      line([[40, -510], [-330, -470], [-330, -180]], ROSE, 3 / k);
    });
  }

  // ---- helpers ----
  // the man, front (or back) view in screen space. by = feet y, k = px per metre.
  function coatShape(cx, by, k) {
    if (PK) return PK.fig([cx, by], k, 1, (u) => coatLocal(1.3 * u));
    const shY = by - 1.45 * k;
    shape([[cx - .25 * k, shY], [cx + .25 * k, shY], [cx + .34 * k, by - .42 * k], [cx - .34 * k, by - .42 * k]], COAT, 2.5);
    hatch([[cx + .02 * k, shY], [cx + .25 * k, shY], [cx + .34 * k, by - .42 * k], [cx + .04 * k, by - .42 * k]], .9, 7, 1.2, .4);
    ink([[cx - .1 * k, shY], [cx, shY + .35 * k], [cx + .1 * k, shY]], 2); ink([[cx, shY + .35 * k], [cx, by - .42 * k]], 1.6);
    for (const i of [-1, 1]) { const a = [cx + i * .25 * k, shY + .03 * k], h = [cx + i * .3 * k, by - .86 * k]; line([a, h], INK, .14 * k); line([a, h], COAT, .1 * k); dot(h[0], h[1] + .03 * k, .05 * k, SKIN); }
  }
  function suitFront(cx, by, k, o = {}) {
    if (PK) return suitFrontP(cx, by, k, o);
    const { coat = 0, pants = 1, knit = 1, scarf = 0, flower = 0, band = 0, hatTip = 0, back = false, ph = 0, walk = 0, kase = false, arms = 0, t = 0 } = o;
    const hipY = by - .95 * k, shY = by - 1.45 * k, hy = by - 1.62 * k;
    const sw = Math.sin(ph * TAU) * walk;
    for (const i of [-1, 1]) {
      const lift = walk * Math.max(0, Math.sin(ph * TAU + (i > 0 ? Math.PI : 0))) * .07 * k;
      const x0 = cx + i * .1 * k, fy = by - lift;
      const leg = [[x0 - .09 * k, hipY], [x0 + .09 * k, hipY], [x0 + .075 * k, fy - .05 * k], [x0 - .075 * k, fy - .05 * k]];
      shape(leg, pants > 0 ? PANTS : DARK, 2);
      if (pants > 0) withT(() => { s.beginPath(); leg.forEach(([x, y], j) => j ? s.lineTo(x, y) : s.moveTo(x, y)); s.closePath(); s.clip();
        for (let x = x0 - .09 * k; x < x0 + .1 * k; x += .045 * k) line([[x, hipY], [x, fy]], AMBER, .012 * k); });
      s.beginPath(); s.ellipse(x0 + i * .02 * k, fy - .03 * k, .1 * k, .04 * k, 0, 0, TAU); s.fillStyle = '#26241f'; s.fill(); s.lineWidth = 2; s.strokeStyle = INK; s.stroke();
    }
    shape([[cx - .19 * k, hipY - .03 * k], [cx + .19 * k, hipY - .03 * k], [cx + .19 * k, hipY + .1 * k], [cx - .19 * k, hipY + .1 * k]], pants > 0 ? PANTS : DARK, 2);
    // the case in his left hand (behind the leg)
    if (kase) guitarCase(cx - .3 * k + sw * .03 * k, hipY + .5 * k, k, { fore: .4 }); // front on: end on
    // torso: a grey shirt, then the sweater knitted up from the hem
    const torso = [[cx - .22 * k, shY], [cx + .22 * k, shY], [cx + .2 * k, hipY + .05 * k], [cx - .2 * k, hipY + .05 * k]];
    shape(torso, SHIRT, 2.5);
    if (knit > 0) withT(() => {
      const top = hipY + .05 * k - knit * (hipY + .05 * k - shY + 4);
      s.beginPath(); torso.forEach(([x, y], j) => j ? s.lineTo(x, y) : s.moveTo(x, y)); s.closePath(); s.clip();
      s.fillStyle = SWEATER; s.fillRect(cx - .3 * k, top, .6 * k, hipY - top + .1 * k);
      const zz = []; for (let i = 0; i <= 10; i++) zz.push([cx - .22 * k + i * .044 * k, shY + .2 * k + (i % 2 ? .05 : 0) * k]);
      if (zz[0][1] > top) { line(zz, ROSE, .035 * k); line(zz.map(([x, y]) => [x, y + .09 * k]), ROSE, .02 * k); }
      s.globalAlpha = .4; for (let y = hipY - .03 * k; y < hipY + .05 * k; y += .02 * k) ink([[cx - .22 * k, y], [cx + .22 * k, y]], 1);
      s.globalAlpha = 1; s.lineWidth = 2.5; s.strokeStyle = INK; s.beginPath(); torso.forEach(([x, y], j) => j ? s.lineTo(x, y) : s.moveTo(x, y)); s.closePath(); s.stroke();
    });
    // arms
    for (const i of [-1, 1]) {
      const a = [cx + i * .23 * k, shY + .04 * k], swing = (i > 0 ? sw : -sw) * .06 * k;
      const h = [cx + i * (.3 + arms * .22) * k + swing * .3, hipY + .03 * k - arms * .16 * k - Math.abs(swing) * .2];
      const sleeve = knit >= 1 ? SWEATER : SHIRT;
      line([a, h], INK, .13 * k); line([a, h], sleeve, .095 * k); dot(h[0], h[1] + .03 * k, .05 * k, SKIN);
    }
    if (coat > 0) coatShape(cx, by, k);
    // neck, head
    shape([[cx - .05 * k, shY - .1 * k], [cx + .05 * k, shY - .1 * k], [cx + .05 * k, shY + .01 * k], [cx - .05 * k, shY + .01 * k]], SKIN, 1.6);
    dot(cx, hy, .12 * k, SKIN); s.lineWidth = 2; s.strokeStyle = INK; s.beginPath(); s.arc(cx, hy, .12 * k, 0, TAU); s.stroke();
    if (back) { dot(cx, hy - .01 * k, .118 * k, '#4a3f33'); s.beginPath(); s.arc(cx, hy, .12 * k, 0, TAU); s.stroke(); dot(cx - .12 * k, hy + .01 * k, .025 * k, SKIN); dot(cx + .12 * k, hy + .01 * k, .025 * k, SKIN); }
    else { dot(cx - .045 * k, hy - .005 * k, .014 * k, INK); dot(cx + .045 * k, hy - .005 * k, .014 * k, INK);
      s.lineWidth = Math.max(1.5, .012 * k); s.beginPath(); s.arc(cx, hy + .02 * k, .05 * k, .25 * Math.PI, .75 * Math.PI); s.stroke(); }
    if (scarf > 0) withT(() => {
      s.translate(cx, shY - .03 * k); s.scale(scarf, scarf);
      const fl = Math.sin(t * 5) * .03 * k;
      shape([[-.15 * k, -.06 * k], [.15 * k, -.06 * k], [.16 * k, .06 * k], [-.16 * k, .06 * k]], SCARF, 2);
      if (!back) { shape([[.03 * k, .04 * k], [.11 * k, .04 * k], [.13 * k + fl, .5 * k], [.05 * k + fl, .52 * k]], SCARF, 2);
        for (let j = 0; j < 4; j++) ink([[.055 * k + fl + j * .022 * k, .51 * k], [.055 * k + fl + j * .022 * k, .56 * k]], 1.5);
        s.globalAlpha = .5; for (let y = .12; y < .5; y += .08) ink([[.04 * k, y * k], [.12 * k + fl * y * 2, y * k]], 1); s.globalAlpha = 1; }
    });
    if (flower > 0 && !back) withT(() => {
      s.translate(cx - .12 * k, shY + .2 * k); s.scale(flower, flower); s.rotate(t * .3);
      for (let j = 0; j < 5; j++) { const a = j / 5 * TAU; dot(Math.cos(a) * .035 * k, Math.sin(a) * .035 * k, .03 * k, ROSE); s.lineWidth = 1.4; s.strokeStyle = INK; s.beginPath(); s.arc(Math.cos(a) * .035 * k, Math.sin(a) * .035 * k, .03 * k, 0, TAU); s.stroke(); }
      dot(0, 0, .02 * k, AMBER);
    });
    // hat
    withT(() => {
      s.translate(cx, hy - .09 * k - hatTip * .14 * k); s.rotate(-hatTip * .25);
      s.beginPath(); s.ellipse(0, 0, .24 * k, .045 * k, 0, 0, TAU); s.fillStyle = HAT; s.fill(); s.lineWidth = 2; s.strokeStyle = INK; s.stroke();
      shape([[-.13 * k, 0], [.13 * k, 0], [.11 * k, -.18 * k], [-.11 * k, -.18 * k]], HAT, 2);
      if (band > 0) { s.globalAlpha = band; shape([[-.128 * k, -.01 * k], [.128 * k, -.01 * k], [.124 * k, -.05 * k], [-.124 * k, -.05 * k]], ROSE, 1.5); s.globalAlpha = 1; }
    });
  }
  // side view in screen space, walking (ph) and facing 1 = right. Dressed in colour.
  function suitSide(bx, by, k, o = {}) {
    if (PK) return suitSideP(bx, by, k, o);
    const { ph = 0, walk = 0, face = 1, t = 0, kase = true } = o;
    const sw = Math.sin(ph * TAU) * .32 * walk, bob = Math.abs(Math.sin(ph * TAU)) * .03 * k * walk;
    const hip = [bx, by - .95 * k - bob], shY = by - 1.45 * k - bob;
    const hand2 = [bx - .05 * k * face - sw * .1 * k, by - .66 * k - bob];
    if (kase) guitarCase(hand2[0], hand2[1] + .19 * k, k, { dir: face }); // the kit's guitar case, handle in his hand
    for (const a of [sw, -sw]) {
      const p = [hip, [hip[0] + Math.sin(a) * .5 * k * face, hip[1] + .48 * k], [hip[0] + Math.sin(a) * .9 * k * face, by - .05 * k]];
      line(p, INK, .17 * k); line(p, PANTS, .125 * k); line(p, AMBER, .015 * k);
      const f = p[2]; s.beginPath(); s.ellipse(f[0] + .06 * k * face, f[1] + .02 * k, .11 * k, .04 * k, 0, 0, TAU); s.fillStyle = '#26241f'; s.fill(); s.lineWidth = 2; s.strokeStyle = INK; s.stroke();
    }
    // scarf tail streams behind
    const fl = Math.sin(t * 6) * .04 * k;
    shape([[bx - .02 * k * face, shY + .02 * k], [bx - .1 * k * face, shY - .03 * k], [bx - (.5 + .1 * walk) * k * face, shY + .1 * k + fl], [bx - (.46 + .1 * walk) * k * face, shY + .2 * k + fl]], SCARF, 2);
    const torso = [[bx - .2 * k, shY], [bx + .19 * k, shY], [bx + .17 * k, hip[1] + .05 * k], [bx - .17 * k, hip[1] + .05 * k]];
    shape(torso, SWEATER, 2.5);
    withT(() => { s.beginPath(); torso.forEach(([x, y], j) => j ? s.lineTo(x, y) : s.moveTo(x, y)); s.closePath(); s.clip();
      const zz = []; for (let i = 0; i <= 9; i++) zz.push([bx - .2 * k + i * .045 * k, shY + .2 * k + (i % 2 ? .05 : 0) * k]); line(zz, ROSE, .035 * k); });
    shape([[bx - .12 * k, shY - .07 * k], [bx + .13 * k, shY - .07 * k], [bx + .14 * k, shY + .05 * k], [bx - .13 * k, shY + .05 * k]], SCARF, 2);
    // flower on the chest
    for (let j = 0; j < 5; j++) { const a = j / 5 * TAU; dot(bx + .12 * k * face + Math.cos(a) * .03 * k, shY + .2 * k + Math.sin(a) * .03 * k, .026 * k, ROSE); }
    dot(bx + .12 * k * face, shY + .2 * k, .016 * k, AMBER);
    // head, hat with her band
    const hx = bx + .04 * k * face, hy = shY - .17 * k;
    dot(hx, hy, .12 * k, SKIN); s.lineWidth = 2; s.strokeStyle = INK; s.beginPath(); s.arc(hx, hy, .12 * k, 0, TAU); s.stroke();
    dot(hx + .1 * k * face, hy + .01 * k, .025 * k, SKIN); dot(hx + .055 * k * face, hy - .01 * k, .012 * k, INK);
    s.beginPath(); s.ellipse(hx, hy - .09 * k, .24 * k, .045 * k, 0, 0, TAU); s.fillStyle = HAT; s.fill(); s.stroke();
    shape([[hx - .13 * k, hy - .09 * k], [hx + .13 * k, hy - .09 * k], [hx + .11 * k, hy - .27 * k], [hx - .11 * k, hy - .27 * k]], HAT, 1.8);
    shape([[hx - .128 * k, hy - .1 * k], [hx + .128 * k, hy - .1 * k], [hx + .124 * k, hy - .14 * k], [hx - .124 * k, hy - .14 * k]], ROSE, 1.4);
    // near arm swings
    const shp = [bx + .02 * k * face, shY + .1 * k], ang = sw * .8 * face;
    const el = [shp[0] + Math.sin(ang) * .36 * k, shp[1] + Math.cos(ang) * .36 * k], hand = [el[0] + Math.sin(ang * 1.1) * .34 * k, el[1] + Math.cos(ang * 1.1) * .34 * k];
    line([shp, el, hand], INK, .13 * k); line([shp, el, hand], SWEATER, .09 * k); dot(hand[0], hand[1], .05 * k, SKIN);
  }
  // her laughter: warm rings travelling along a curve from (a) to (b) through control c
  function laughter(t, a, c, b, amt, size, n = 9, speed = .55) {
    if (amt <= 0) return;
    const cols = [ROSE, AMBER, ROSE_L];
    for (let i = 0; i < n; i++) {
      const u = ((t * speed + i / n) % 1);
      const x = (1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * c[0] + u * u * b[0], y = (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * c[1] + u * u * b[1];
      const dx = 2 * (1 - u) * (c[0] - a[0]) + 2 * u * (b[0] - c[0]), dy = 2 * (1 - u) * (c[1] - a[1]) + 2 * u * (b[1] - c[1]);
      const r = size * (.35 + Math.sin(u * Math.PI) * .9);
      withT(() => { s.translate(x, y); s.rotate(Math.atan2(dy, dx)); s.globalAlpha = amt * Math.min(1, Math.sin(u * Math.PI) * 2.5);
        s.beginPath(); s.ellipse(0, 0, r * .45, r, 0, -1.2, 1.2); s.lineWidth = size * .22; s.strokeStyle = cols[i % 3]; s.lineCap = 'round'; s.stroke();
        s.beginPath(); s.ellipse(0, 0, r * .45, r, 0, -1.2, 1.2); s.lineWidth = PK ? 1.1 : 1.5; s.strokeStyle = OL(cols[i % 3]); s.stroke(); });
    }
  }
  // a sewing machine, side on. (x, y) = base bottom centre, sc = width in px. run 0..1 drives the needle.
  function sewing(t, x, y, sc, run = 1) {
    if (PK) return sewingP(t, x, y, sc, run);
    withT(() => {
      s.translate(x, y); const k = sc / 900; s.scale(k, k); const w = 2.5 / k;
      const body = '#2a2723';
      shape([[-450, -60], [450, -60], [450, 0], [-450, 0]], '#4a463d', w);                         // bed
      shape([[180, -60], [330, -60], [320, -400], [190, -400]], body, w);                            // pillar
      shape([[-400, -480], [300, -480], [345, -440], [345, -380], [-400, -380]], body, w);           // arm
      shape([[-410, -480], [-250, -480], [-250, -170], [-410, -170]], body, w);                      // head
      s.beginPath(); s.arc(330, -420, 60, -Math.PI / 2, Math.PI / 2); s.fillStyle = body; s.fill();
      // gold decals
      s.lineWidth = 4 / k; s.strokeStyle = BRASS;
      for (let i = 0; i < 3; i++) { s.beginPath(); s.arc(-100 + i * 110, -430, 30, Math.PI * .1, Math.PI * 1.4); s.stroke(); }
      line([[-390, -460], [-270, -460]], BRASS, 3 / k); line([[-390, -190], [-270, -190]], BRASS, 3 / k);
      // needle bar
      const bob = run * (Math.sin(onTwos(t, 24) * TAU * 6) * .5 + .5) * 70;
      shape([[-342, -170], [-318, -170], [-318, -110 + bob], [-342, -110 + bob]], STEEL, w * .8);
      line([[-330, -110 + bob], [-330, -62 + bob * .55]], '#cfd4d2', 4 / k);
      shape([[-370, -78], [-290, -78], [-290, -62], [-370, -62]], STEEL_D, w * .7);
      // handwheel
      s.beginPath(); s.arc(380, -330, 95, 0, TAU); s.fillStyle = '#3b3833'; s.fill(); s.lineWidth = w; s.strokeStyle = INK; s.stroke();
      const sp = t * 9 * run; for (let i = 0; i < 4; i++) { const a = sp + i * TAU / 4; ink([[380, -330], [380 + Math.cos(a) * 85, -330 + Math.sin(a) * 85]], w); }
      dot(380, -330, 14, BRASS);
      // spool of her thread on top
      line([[60, -480], [60, -560]], INK, w * 1.2);
      shape([[22, -545], [98, -545], [98, -500], [22, -500]], ROSE, w);
      ink([[22, -530], [98, -530]], 1.2 / k); ink([[22, -515], [98, -515]], 1.2 / k);
      line([[40, -510], [-330, -470], [-330, -180]], ROSE, 3 / k);
    });
  }
  // a grey wall of filing drawers, flat
  function drawerWall(x0, y0, x1, y1, cw = 150, ch = 90, open = null) {
    s.fillStyle = '#8f9886'; s.fillRect(x0, y0, x1 - x0, y1 - y0);
    for (let y = y0; y < y1; y += ch) for (let x = x0; x < x1; x += cw) {
      const id = Math.round(x / cw) * 37 + Math.round(y / ch) * 11;
      const o = open ? open(id) : 0;
      shape([[x + 6, y + 6], [x + cw - 6, y + 6], [x + cw - 6, y + ch - 6], [x + 6, y + ch - 6]], hash(id) > .9 ? '#7a8274' : '#949d8b', 1.4);
      if (o > 0) { // the drawer slides out: sky inside
        const d = o * 26;
        s.fillStyle = vgrad(y + 6, y + ch - 6, [[0, SKY_T], [1, SKY_B]]); s.fillRect(x + 10, y + 10, cw - 20, ch - 20);
        shape([[x + 6 - d, y + ch - 14 + d * .3], [x + cw - 6 + d, y + ch - 14 + d * .3], [x + cw - 6 + d, y + ch - 2 + d * .5], [x + 6 - d, y + ch - 2 + d * .5]], '#7a8274', 1.6);
      } else dot(x + cw / 2, y + ch / 2, 4, INK);
    }
  }
  // her rose paper flower, flat (folded petals)
  function paperFlower(x, y, r, rot = 0) {
    withT(() => { s.translate(x, y); s.rotate(rot);
      for (let j = 0; j < 6; j++) { const a = j / 6 * TAU; shape([[0, 0], [Math.cos(a - .4) * r, Math.sin(a - .4) * r], [Math.cos(a) * r * 1.15, Math.sin(a) * r * 1.15], [Math.cos(a + .4) * r, Math.sin(a + .4) * r]], j % 2 ? ROSE : ROSE_L, 1.6); }
      dot(0, 0, r * .25, AMBER); });
  }

  // her close-up in the cartoon hand: rounded face, glossy bun and nose, airbrushed cheeks, lashes
  function faceP(cx, cy, r, sm, smilePath) {
    const { blob, ball, dark, mix } = PK, HAIR = '#2d2a24', lw = 2;
    blob([[cx - 390, H + 40], [cx - 330, cy + 330], [cx - 120, cy + 290], [cx + 120, cy + 290], [cx + 330, cy + 330], [cx + 390, H + 40]], '#77756a', lw);
    blob([[cx - 170, cy + 288], [cx + 170, cy + 288], [cx + 40, cy + 400], [cx, cy + 430], [cx - 40, cy + 400]], ROSE, lw);
    blob([[cx - 72, cy + 160], [cx + 72, cy + 160], [cx + 80, cy + 300], [cx - 80, cy + 300]], SKIN, lw, false);
    ball(cx, cy - r - 40, 98, HAIR, lw);
    const fp = []; for (let i = 0; i < 14; i++) { const a = i / 14 * TAU, w = 1 + .06 * Math.max(0, Math.sin(a)); fp.push([cx + Math.cos(a) * r * w, cy + Math.sin(a) * r * (1 + .05 * Math.max(0, Math.sin(a)))]); }
    blob(fp, SKIN, lw);
    for (const ex of [-1, 1]) ball(cx + ex * (r + 6), cy + 10, 38, mix(SKIN, '#c0605a', .12), lw);
    blob([[cx - r - 8, cy - 10], [cx - r + 10, cy - 130], [cx - 90, cy - r - 4], [cx + 90, cy - r - 4], [cx + r - 10, cy - 130], [cx + r + 8, cy - 10], [cx + 120, cy - 120], [cx + 20, cy - 110], [cx - 40, cy - 140], [cx - 150, cy - 100]], HAIR, lw);
    for (const ex of [-80, 80]) {
      withT(() => { s.globalAlpha = .25 + .45 * sm; s.fillStyle = rgrad(cx + ex * 1.45, cy + 70, 4, 60, [[0, ROSE], [1, 'rgba(200,69,90,0)']]); s.fillRect(cx + ex * 1.45 - 70, cy, 140, 140); });
      if (sm < .5) { s.beginPath(); s.ellipse(cx + ex, cy - 12, 13, 19, 0, 0, TAU); s.fillStyle = '#2a1f1a'; s.fill(); dot(cx + ex - 4, cy - 18, 4, '#fffaf0'); }
      else { s.beginPath(); s.arc(cx + ex, cy, 30, Math.PI * 1.15, Math.PI * 1.85); s.lineWidth = 6; s.strokeStyle = '#2a1f1a'; s.lineCap = 'round'; s.stroke(); }
      for (const d of [-.6, -.2, .2]) { const a = -Math.PI / 2 + d + ex / 400; line([[cx + ex + Math.cos(a) * 30, cy - 24 + Math.sin(a) * 6], [cx + ex + Math.cos(a) * 42, cy - 30 + Math.sin(a) * 10]], '#2a1f1a', 3); }
    }
    ball(cx + 6, cy + 42, 26, mix(SKIN, '#c0605a', .25), lw);
    smilePath(); s.lineWidth = 8; s.strokeStyle = dark(SKIN, .62); s.lineCap = 'round'; s.stroke();
  }
  // ---- shots ----
  // 245.0  he comes back across the hall to her desk; she laughs (246.78), and her laughter pours into a
  // sewing machine he works at; the fabric comes out striped rose and amber.
  function sewDesk(t, lt) {
    fx({ sat: satAt(t) });
    cam({ x: -1.5, z: kf(t, [[245, 1.0], [252.7, 1.7]], ease.sine), y: -.15, f: 900, vy: 380 });
    room(t); duct(-3.6, -2.1, .5, 0, FAR); duct(2.8, -2.25, .32, 0, FAR, STEEL_D); tube(t); board(t, '0004');
    rows(t);
    // her desk, left
    const laugh = smooth(inv(246.6, 247.1, t));
    { const cb = P(-3.95, FL, 5.2), ck = cb[2], cs = P(-3.95, 1.08, 5.2)[1];   // her chair
      ink([[cb[0] - .2 * ck, cb[1]], [cb[0] - .2 * ck, cs]], .04 * ck); ink([[cb[0] + .18 * ck, cb[1]], [cb[0] + .18 * ck, cs]], .04 * ck);
      ink([[cb[0] - .24 * ck, cs - .55 * ck], [cb[0] - .24 * ck, cb[1]]], .045 * ck);
      shape([[cb[0] - .26 * ck, cs], [cb[0] + .24 * ck, cs], [cb[0] + .24 * ck, cs + .05 * ck], [cb[0] - .26 * ck, cs + .05 * ck]], '#5d5a4c', 1.6); }
    woman(-3.9, 5.2, { seated: true, face: 1, rose: 1, arm: .25 + laugh * .3 * Math.abs(Math.sin(t * 7)), look: laugh });
    desk(-3.2, 5.2, 1);
    // the sewing table and machine
    const tb = P(-1.3, FL, 4.7), tk = tb[2], tt = P(-1.3, .85, 4.7)[1];
    shape([[tb[0] - .55 * tk, tt], [tb[0] + .55 * tk, tt], [tb[0] + .55 * tk, tt + .06 * tk], [tb[0] - .55 * tk, tt + .06 * tk]], '#5d5a4c', 2);
    ink([[tb[0] - .5 * tk, tt], [tb[0] - .5 * tk, tb[1]]], .05 * tk); ink([[tb[0] + .5 * tk, tt], [tb[0] + .5 * tk, tb[1]]], .05 * tk);
    const run = smooth(inv(247.4, 248.2, t));
    sewing(t, tb[0], tt, .8 * tk, run);
    // fabric out of the needle, over the table edge and pooling on the floor
    const len = ease.out(inv(247.8, 252.7, t));
    if (len > 0) {
      const nx = tb[0] - .29 * tk, ny = tt - .03 * tk;
      const pts = [[nx, ny], [tb[0] - .6 * tk, ny + .02 * tk], [tb[0] - .7 * tk, ny + .3 * tk], [tb[0] - .75 * tk + Math.sin(t * 2) * 6, tb[1] - .1 * tk], [tb[0] - 1.1 * tk, tb[1] - .02 * tk]];
      const n = Math.max(2, Math.ceil(len * pts.length)); const sub = pts.slice(0, n);
      line(sub, OL(PANTS), (PK ? .11 : .13) * tk, 'butt'); line(sub, PANTS, .1 * tk, 'butt');
      withT(() => { s.setLineDash([.03 * tk, .05 * tk]); s.lineDashOffset = -t * 120; line(sub, AMBER, .1 * tk, 'butt'); });
    }
    // him: walks in from the right to the machine and feeds it
    const x = kf(t, [[245, 1.6], [246.7, -.5]], (k) => k), walking = t < 246.7;
    man(x, 4.75, { ph: (t - 245) * 1.1, walk: walking ? 1 : 0, face: -1, arm: walking ? 0 : .22 + run * Math.sin(t * 8) * .04 });
    // the laughter rings, from her mouth to the spool
    const hd = P(-3.85, -.05, 5.2), sp = [tb[0] + .05 * tk, tt - .5 * tk];
    laughter(t, [hd[0] + 30, hd[1]], [(hd[0] + sp[0]) / 2, hd[1] - 160], sp, laugh, 42);
  }
  // 252.74 "we got time" x3: the machine close up. On each "time" a piece of his trousers is made.
  function machine(t, lt) {
    fx({ sat: satAt(t) });
    drawerWall(-20, -20, W + 20, 800, 160, 96);
    shape([[-20, 760], [W + 20, 760], [W + 20, 1100], [-20, 1100]], '#6a6455', 3);
    s.globalAlpha = .35; for (let y = 790; y < 1080; y += 34) ink([[0, y], [W, y + 6]], 1.2); s.globalAlpha = 1;
    const mx = 700 + Math.sin(t * .4) * 6;
    // laughter comes in from the top left, into the spool
    laughter(t, [-120, 120], [200, -60], [mx + 52, 290], 1, 44, 8, .6);
    sewing(t, mx, 770, 900, 1);
    // the fabric: out from under the needle, across the bed, up into the trousers
    const tx = 1520, ty = 190;
    const pts = [[mx - 297, 720], [mx + 300, 722], [mx + 520, 700], [1300, 560], [tx - 40, 420]];
    line(pts, OL(PANTS), PK ? 80 : 84, 'butt'); line(pts, PANTS, 76, 'butt');
    withT(() => { s.setLineDash([16, 30]); s.lineDashOffset = -t * 260; line(pts, AMBER, 76, 'butt'); });
    // the trousers on a hanger, built piece by piece
    ink([[tx, ty - 120], [tx, ty - 40]], 4); s.beginPath(); s.arc(tx, ty - 130, 16, Math.PI, Math.PI * 2.4); s.lineWidth = 4; s.strokeStyle = INK; s.stroke();
    ink([[tx - 190, ty], [tx, ty - 40], [tx + 190, ty]], 5);
    const pieces = [[254.04, -1], [256.86, 1]];
    for (const [t0, side] of pieces) {
      const p = pop(t, t0); if (p <= 0) continue;
      withT(() => { s.translate(tx + side * 80, ty + 40); s.scale(p, p);
        const leg = [[-80, 0], [80, 0], [70 + side * 10, 560], [-60 + side * 10, 560]];
        shape(leg, PANTS, 3);
        withT(() => { s.beginPath(); leg.forEach(([x, y], j) => j ? s.lineTo(x, y) : s.moveTo(x, y)); s.closePath(); s.clip(); for (let x = -80; x < 90; x += 26) line([[x, 0], [x + side * 8, 560]], AMBER, 5); });
        ink([[-60 + side * 10, 540], [70 + side * 10, 540]], 2); });
    }
    const wb = pop(t, 259.83);
    if (wb > 0) withT(() => { s.translate(tx, ty + 40); s.scale(wb, wb);
      shape([[-170, -30], [170, -30], [170, 30], [-170, 30]], PANTS, 3); ink([[-170, 0], [170, 0]], 1.5);
      for (const bx of [-40, 40]) { dot(bx, 0, 13, AMBER); s.lineWidth = 2; s.strokeStyle = INK; s.beginPath(); s.arc(bx, 0, 13, 0, TAU); s.stroke(); } });
    // a stitch-flash on each hit
    for (const t0 of [254.04, 256.86, 259.83]) { const h = hit(t, t0, 5); if (h > .02) { s.globalAlpha = h * .8; for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; ink([[mx - 330 + Math.cos(a) * 60, 700 + Math.sin(a) * 60], [mx - 330 + Math.cos(a) * (60 + 80 * h), 700 + Math.sin(a) * (60 + 80 * h)]], 4); } s.globalAlpha = 1; } }
  }
  // 260.34 her smile, close: it lifts off her face as yarn (262-264), and needles knit it into a sweater.
  function smile(t, lt) {
    fx({ sat: satAt(t) });
    s.fillStyle = '#9aa292'; s.fillRect(-20, -20, W + 40, H + 40);
    s.globalAlpha = .25; for (let y = 0; y < H; y += 120) for (let x = 0; x < W; x += 240) { ink([[x, y], [x + 240, y]], 1.2); ink([[x + ((y / 120) % 2 ? 120 : 0), y], [x + ((y / 120) % 2 ? 120 : 0), y + 120]], 1.2); } s.globalAlpha = 1;
    const cx = 560, cy = 520 + Math.sin(t * 1.1) * 4, r = 230, sm = smooth(inv(260.6, 261.6, t));
    const smilePath = (dy = 0) => { s.beginPath(); s.arc(cx, cy + 40 + dy, 90 + 30 * sm, Math.PI * (.5 - .3 * sm - .05), Math.PI * (.5 + .3 * sm + .05)); };
    if (PK) faceP(cx, cy, r, sm, smilePath); else {
    // shoulders, uniform, rose collar
    shape([[cx - 380, H + 20], [cx - 300, cy + 300], [cx + 300, cy + 300], [cx + 380, H + 20]], '#77756a', 3);
    shape([[cx - 160, cy + 290], [cx + 160, cy + 290], [cx, cy + 420]], ROSE, 3);
    shape([[cx - 70, cy + 170], [cx + 70, cy + 170], [cx + 80, cy + 300], [cx - 80, cy + 300]], SKIN, 3);
    // bun, face, hair
    dot(cx, cy - r - 40, 95, '#2d2a24'); s.lineWidth = 3; s.strokeStyle = INK; s.beginPath(); s.arc(cx, cy - r - 40, 95, 0, TAU); s.stroke();
    dot(cx, cy, r, SKIN); s.beginPath(); s.arc(cx, cy, r, 0, TAU); s.lineWidth = 4; s.stroke();
    s.beginPath(); s.arc(cx, cy - 10, r + 6, Math.PI * 1.02, Math.PI * 1.98); s.quadraticCurveTo(cx + 40, cy - 140, cx, cy - 120); s.quadraticCurveTo(cx - 60, cy - 150, cx - r - 6, cy - 20); s.fillStyle = '#2d2a24'; s.fill(); s.lineWidth = 3; s.stroke();
    // eyes: open, then crinkled shut with the smile
    for (const ex of [-80, 80]) {
      if (sm < .5) { dot(cx + ex, cy - 10, 14, INK); }
      else { s.beginPath(); s.arc(cx + ex, cy, 30, Math.PI * 1.15, Math.PI * 1.85); s.lineWidth = 7; s.strokeStyle = INK; s.stroke(); }
      s.globalAlpha = .55 * sm; dot(cx + ex * 1.45, cy + 70, 38, ROSE); s.globalAlpha = 1;
    }
    ink([[cx + 8, cy + 10], [cx + 22, cy + 55], [cx, cy + 62]], 4);
    // the smile
    smilePath(); s.lineWidth = 9; s.strokeStyle = INK; s.lineCap = 'round'; s.stroke();
    }
    // a rose copy of the smile lifts off and runs to the needles as yarn
    const nx = 1420, ny = 330;
    const lift = ease.inOut(inv(261.9, 263.0, t));
    if (lift > 0) {
      const sx = cx + 150, sy = cy + 120;
      const yarn = []; const n = 60, reach = ease.out(inv(262.2, 263.6, t));
      for (let i = 0; i <= n; i++) { const u = i / n * reach; yarn.push([lerp(sx, nx - 20, u), lerp(sy, ny + 40, u) + Math.sin(u * 9 - t * 6) * 40 * (1 - u)]); }
      if (yarn.length > 1) { line(yarn, OL(ROSE), PK ? 10 : 13); line(yarn, ROSE, 8); line(yarn.map(([x, y]) => [x, y + 2]), SWEATER, 2.5); }
      withT(() => { s.globalAlpha = 1 - lift * .4; s.translate(0, -lift * 18); smilePath(); s.lineWidth = 6; s.strokeStyle = ROSE; s.stroke(); });
    }
    // the knitting: needles cross and click on the beat; the sweater grows row by row under them
    const click = beatPulse(t, 9);
    const knit = clamp((t - 262.4) / 2.0);
    if (knit > 0) withT(() => {
      s.translate(nx, ny + 60);
      const rowsN = Math.floor(knit * 14), rh = 32;
      const sweaterRow = (i) => { const y = i * rh; const sleeve = i >= 1 && i <= 4; return [sleeve ? -250 : -150, sleeve ? 250 : 150, y]; };
      for (let i = 0; i < rowsN; i++) { const [a, b, y] = sweaterRow(i);
        shape([[a, y], [b, y], [b, y + rh], [a, y + rh]], (i === 6 || i === 8) ? ROSE : SWEATER, 2);
        for (let x = a + 10; x < b - 8; x += 22) ink([[x, y + 6], [x + 9, y + rh - 6], [x + 18, y + 6]], 1.6); }
    });
    withT(() => { s.translate(nx, ny); for (const sg of [-1, 1]) withT(() => { s.rotate(sg * (.55 + click * .1));
      if (PK) { PK.tube([-330, 0], [0, 0], [330, 0], 7, 4, '#d8cfb2', 1.2); PK.ball(sg > 0 ? -340 : 340, 0, 24, ROSE, 1.2); return; }
      line([[-330, 0], [330, 0]], INK, 18); line([[-330, 0], [330, 0]], '#c9c2a8', 11);
      dot(sg > 0 ? -340 : 340, 0, 22, ROSE); s.lineWidth = 3; s.strokeStyle = INK; s.beginPath(); s.arc(sg > 0 ? -340 : 340, 0, 22, 0, TAU); s.stroke(); }); });
  }
  // 264.63 the four "we've got time"s: on a tailor's box in front of the drawer wall the coat flies off
  // (265.8), the scarf (268.73), her paper flower (271.87), her rose on the hat band (274.95).
  function dressing(t, lt) {
    fx({ sat: satAt(t) });
    const hits = [265.80, 268.73, 271.87, 274.95];
    const opened = (id) => { let o = 0; hits.forEach((h, i) => { if (hash(id * 3 + i * 101) > .87 - i * .02) o = Math.max(o, ease.back(inv(h, h + .4, t))); }); return o; };
    drawerWall(-30, -30, W + 30, 930, 150, 90, opened);
    shape([[-20, 900], [W + 20, 900], [W + 20, 1100], [-20, 1100]], '#7d7a69', 3);
    s.globalAlpha = .35; for (let x = -400; x < W + 400; x += 140) ink([[W / 2 + (x - W / 2) * .55, 900], [x, 1100]], 1.2); s.globalAlpha = 1;
    const zoom = kf(t, [[264.6, 1], [275.5, 1.12]], ease.sine);
    withT(() => {
      s.translate(W / 2, 960); s.scale(zoom, zoom); s.translate(-W / 2, -960);
      // the tailor's box
      if (PK) { // a soft round box with a brass band and studs
        s.beginPath(); s.ellipse(W / 2, 960, 260, 40, 0, 0, Math.PI); s.lineTo(W / 2 - 260, 900); s.ellipse(W / 2, 900, 260, 40, 0, Math.PI, 0, true); s.closePath();
        const g = s.createLinearGradient(W / 2 - 260, 0, W / 2 + 260, 0); g.addColorStop(0, PK.light('#5d5a4c', .3)); g.addColorStop(.4, '#5d5a4c'); g.addColorStop(1, PK.dark('#5d5a4c', .35));
        s.fillStyle = g; s.fill(); s.lineWidth = 1.4; s.strokeStyle = PK.dark('#5d5a4c', .6); s.stroke();
        s.beginPath(); s.ellipse(W / 2, 930, 260, 40, 0, 0, Math.PI); s.lineWidth = 7; s.strokeStyle = BRASS; s.stroke();
        for (let i = 1; i < 8; i++) { const a = i / 8 * Math.PI; PK.ball(W / 2 + Math.cos(a) * 258, 930 + Math.sin(a) * 40, 7, BRASS, 1); }
        s.beginPath(); s.ellipse(W / 2, 900, 260, 40, 0, 0, TAU); PK.soft('#8a8574', W / 2 - 260, 860, W / 2 + 260, 940); s.lineWidth = 1.4; s.strokeStyle = PK.dark('#7a7666', .6); s.stroke();
      } else {
      s.beginPath(); s.ellipse(W / 2, 960, 260, 40, 0, 0, Math.PI); s.lineTo(W / 2 - 260, 900); s.ellipse(W / 2, 900, 260, 40, 0, Math.PI, 0, true); s.closePath(); s.fillStyle = '#5d5a4c'; s.fill(); s.lineWidth = 3; s.strokeStyle = INK; s.stroke();
      s.beginPath(); s.ellipse(W / 2, 900, 260, 40, 0, 0, TAU); s.fillStyle = '#7a7666'; s.fill(); s.stroke();
      }
      const k = 400, by = 905;
      const coatOff = ease.in(inv(265.75, 266.5, t)), knit = ease.out(inv(265.85, 266.6, t));
      const tip = Math.sin(clamp((t - 274.95) / .8) * Math.PI);
      suitFront(W / 2, by, k, { coat: t < 265.75 ? 1 : 0, pants: 1, knit, scarf: pop(t, 268.73, .45), flower: pop(t, 271.87), band: smooth(inv(274.95, 275.2, t)), hatTip: tip, arms: t < 265.75 ? 0 : .25 * smooth(inv(265.8, 266.6, t)), t });
      // the coat, flying up and away like one of the forms
      if (coatOff > 0 && coatOff < 1) withT(() => {
        s.translate(W / 2 + coatOff * 600, by - coatOff * 1200); s.rotate(-coatOff * 1.1); s.scale(1, .5 + .5 * Math.abs(Math.cos(coatOff * 9))); s.translate(-W / 2, -by);
        coatShape(W / 2, by, k);
      });
    });
    // hit sparkle: a rose ring off each new piece
    for (const h of hits) { const a = hit(t, h, 3.5); if (a < .03) continue; s.globalAlpha = a; s.beginPath(); s.arc(W / 2, 560, 300 + (1 - a) * 400, 0, TAU); s.lineWidth = 10; s.strokeStyle = ROSE; s.stroke(); s.globalAlpha = 1; }
  }
  // 275.53 [image]: he walks across the hall; a giant ON HOLD stamp comes down on him (276.40) and
  // misses by a step. It leaves her flower printed on the floor.
  function noStop(t, lt) {
    fx({ sat: satAt(t) });
    cam({ x: -.2, z: 1.5, y: -.35, f: 900, vy: 400 });
    room(t); duct(-3.6, -2.1, .5, 0, FAR); duct(2.8, -2.25, .32, 0, FAR, STEEL_D); tube(t); board(t, '0004');
    rows(t);
    const zS = 5.2, x = kf(t, [[275.5, -3.2], [278.6, 2.4]], (k) => k), sx = -.75;
    const hitT = 276.40;
    // the imprint: her flower, in rose ink on the floor
    if (t > hitT + .05) {
      s.globalAlpha = .85; const c = [sx, zS];
      for (let j = 0; j < 6; j++) { const a = j / 6 * TAU, pts = [];
        for (let u = 0; u <= 8; u++) { const aa = a - .45 + u / 8 * .9, rr = u === 0 || u === 8 ? .15 : .8 + .15 * Math.sin(u / 8 * Math.PI); pts.push(P(c[0] + Math.cos(aa) * rr, FL, c[1] + Math.sin(aa) * rr * .7)); }
        poly(pts.map((p) => [p[0], p[1]]), j % 2 ? ROSE : ROSE_L); }
      const cc = P(sx, FL, zS); s.beginPath(); s.ellipse(cc[0], cc[1], .2 * cc[2], .06 * cc[2], 0, 0, TAU); s.fillStyle = AMBER; s.fill();
      s.globalAlpha = 1;
    }
    // him, walking across
    const b = P(x, FL, zS + .3);
    suitSide(b[0], b[1], b[2], { ph: (t - 275.5) * 1.15, walk: 1, face: 1, t });
    // the stamp: from the ceiling down to the floor, then back up
    const down = t < hitT ? ease.in(inv(275.75, hitT, t)) : 1 - ease.out(inv(hitT + .15, hitT + .75, t));
    const yb = lerp(CE - 2.8, FL, down);
    const f0 = P(sx - 1.1, yb - .55, zS - .7), f1 = P(sx + 1.1, yb, zS - .7), b0 = P(sx - 1.1, yb - .55, zS + .7), b1 = P(sx + 1.1, yb - .55, zS + .7);
    shape([[f0[0], f0[1]], [b0[0], b0[1]], [b1[0], b1[1]], [f1[0], f0[1]]], '#4a463d', 3);
    shape([[f0[0], f0[1]], [f1[0], f0[1]], [f1[0], f1[1]], [f0[0], f1[1]]], '#3a382f', 3);
    shape([[f0[0], f1[1] - 12], [f1[0], f1[1] - 12], [f1[0], f1[1]], [f0[0], f1[1]]], ROSE, 2);
    text('ON HOLD', (f0[0] + f1[0]) / 2, (f0[1] + f1[1]) / 2 + .1 * f1[2], .32 * f1[2], { font: 'stamp', color: CREAM, max: (f1[0] - f0[0]) * .84 });
    const h0 = P(sx - .22, yb - .55, zS), h1 = P(sx + .22, yb - 3.2, zS);
    shape([[h0[0], h0[1]], [h1[0] + (h1[0] - h0[0]) * 0, h0[1]], [h1[0] - 8, h1[1]], [h0[0] + 8, h1[1]]], BRASS, 3);
    const kn = P(sx, yb - 3.6, zS); dot(kn[0], kn[1], .5 * kn[2], BRASS); s.lineWidth = 3; s.strokeStyle = INK; s.beginPath(); s.arc(kn[0], kn[1], .5 * kn[2], 0, TAU); s.stroke();
    // the thump
    const th = hit(t, hitT, 6);
    if (th > .03) { s.globalAlpha = th; const c = P(sx, FL, zS - .7); for (let i = 0; i < 7; i++) { const dx = (i - 3) * .45 * c[2]; ink([[c[0] + dx, c[1] + 10], [c[0] + dx * 1.4, c[1] + 10 + 60 * th]], 4); } s.globalAlpha = 1; }
  }
  // 278.57 "we've got time" x2: from behind, he walks up the aisle to the far doors; each "time" opens them wider.
  function aisle(t, lt) {
    fx({ sat: satAt(t) });
    const cz = kf(t, [[278.5, -1], [284, 9]], (k) => k);
    cam({ x: 0, z: cz, y: -.3, f: 820, vy: 470 });
    room(t); duct(-3.6, -2.1, .5, 0, FAR); duct(2.8, -2.25, .32, 0, FAR, STEEL_D); tube(t);
    // the front doors in the far wall, with daylight behind
    const open = .3 * ease.back(inv(278.57, 279.1, t)) + .35 * ease.back(inv(280.87, 281.4, t)) + .35 * ease.inOut(inv(282.5, 284, t));
    const d0 = P(-2.4, -1.8, FAR - .1), d1 = P(2.4, FL, FAR - .1), mid = (d0[0] + d1[0]) / 2, hw = (d1[0] - d0[0]) / 2;
    s.fillStyle = vgrad(d0[1], d1[1], [[0, SKY_T], [1, SKY_B]]); s.fillRect(d0[0], d0[1], d1[0] - d0[0], d1[1] - d0[1]);
    withT(() => { s.globalAlpha = .5 * open; s.fillStyle = rgrad(mid, d1[1], 10, hw * 6, [[0, '#fff6dc'], [1, 'rgba(255,246,220,0)']]); s.fillRect(-W, -H, 3 * W, 3 * H); });
    for (const sg of [-1, 1]) { const w = hw * (1 - open * .85); const xa = mid + sg * hw, xb = xa - sg * w;
      shape([[xa, d0[1]], [xb, d0[1]], [xb, d1[1]], [xa, d1[1]]], '#6b6a5a', 2.5); ink([[xb + sg * 8, (d0[1] + d1[1]) / 2 - 10], [xb + sg * 8, (d0[1] + d1[1]) / 2 + 10]], 3); }
    shape([[d0[0] - 12, d0[1] - 14], [d1[0] + 12, d0[1] - 14], [d1[0] + 12, d0[1]], [d0[0] - 12, d0[1]]], BRASS, 2);
    rows(t);
    // him, back view, walking up the aisle ahead of us
    const zz = cz + 3.4, b = P(0, FL, zz);
    suitFront(b[0], b[1], b[2], { back: true, walk: 1, ph: (t - 278.5) * 1.1, scarf: 1, band: 1, kase: true, t });
  }
  // 283.99 "the way I'm dressed,": the doors swing wide; he stands in the daylight in colour.
  function doors(t, lt) {
    fx({ sat: satAt(t), flash: hit(t, 284.67, 3) * .35 });
    const open = ease.inOut(inv(284.0, 285.4, t));
    s.fillStyle = vgrad(0, H, [[0, SKY_T], [1, SKY_B]]); s.fillRect(-20, -20, W + 40, H + 40);
    for (let i = 0; i < 4; i++) cloud(((i * 560 + t * 30) % (W + 700)) - 300, 300 + hash(i * 5) * 260, 80 + 40 * hash(i + 3), 90 + i);
    // the plaza beyond, then the frame and the two leaves of the door
    shape([[-20, 860], [W + 20, 860], [W + 20, 1100], [-20, 1100]], '#a7a48f', 3);
    const fw = 1240, fx0 = W / 2 - fw / 2, top = 70;
    withT(() => { s.fillStyle = '#4d5250'; s.beginPath(); s.rect(-20, -20, W + 40, H + 40); s.rect(fx0, top, fw, 1100); s.fill('evenodd'); });
    s.lineWidth = 6; s.strokeStyle = INK; s.strokeRect(fx0, top, fw, 1100);
    for (const sg of [-1, 1]) { const w = fw / 2 * (1 - open * .82), xa = W / 2 + sg * fw / 2, xb = xa - sg * w, sk = open * 60;
      shape([[xa, top], [xb, top + sk], [xb, 1080 - sk * .5], [xa, 1080]], '#6b6a5a', 3);
      const gx0 = lerp(xa, xb, .2), gx1 = lerp(xa, xb, .8); shape([[gx0, top + 120 + sk * .2], [gx1, top + 120 + sk * .8], [gx1, 560], [gx0, 560]], '#c9c8b0', 2);
      ink([[lerp(xa, xb, .9), 600], [lerp(xa, xb, .9), 660]], 5); }
    // light spills onto the floor around him
    withT(() => { s.globalAlpha = .4 * open; poly([[W / 2 - fw / 2 * open, 1080], [W / 2 + fw / 2 * open, 1080], [W / 2 + 900, 1300], [W / 2 - 900, 1300]], '#fff6dc'); });
    const k = 480;
    suitFront(W / 2, 1120, k, { back: true, scarf: 1, band: 1, kase: true, arms: open * .5, t });
  }
  // 286.57 "I can walk a hundred miles": outside. The ministry steps, a road that climbs into the sky,
  // and the road sign springs up on "hundred" (287.43).
  function road(t, lt) {
    fx({ sat: satAt(t) });
    s.fillStyle = vgrad(0, 700, [[0, SKY_T], [1, SKY_B]]); s.fillRect(-20, -20, W + 40, 760);
    for (let i = 0; i < 5; i++) cloud(((i * 470 + t * 26) % (W + 600)) - 250, 150 + hash(i * 7 + 1) * 280, 60 + 40 * hash(i + 2), 120 + i);
    if (PK) hills(700, 500, W + 100, 150, 31);
    shape([[-20, 690], [W + 20, 690], [W + 20, 1100], [-20, 1100]], '#a7a48f', 3);
    // the ministry, cropped: a grey slab with ducts climbing it
    shape([[-20, -20], [560, -20], [560, 760], [-20, 760]], '#7d8280', 3);
    for (let y = 30; y < 640; y += 110) for (let x = 30; x < 520; x += 120) shape([[x, y], [x + 70, y], [x + 70, y + 70], [x, y + 70]], '#4d5250', 2);
    for (const dx of [140, 420]) { line([[dx, -20], [dx, 740]], OL(STEEL), PK ? 48 : 52, 'butt'); line([[dx, -20], [dx, 740]], STEEL, 44, 'butt'); for (let y = 0; y < 740; y += 40) ink([[dx - 22, y], [dx + 22, y]], 1.5); }
    shape([[200, 520], [380, 520], [380, 760], [200, 760]], '#3d4140', 3);
    for (let i = 0; i < 4; i++) shape([[170 - i * 30, 760 + i * 28], [410 + i * 30, 760 + i * 28], [410 + i * 30, 788 + i * 28], [170 - i * 30, 788 + i * 28]], '#9a9c8c', 2);
    // the road: from the steps, across the plaza, then lifting off into the sky as a ribbon
    const rd = [[420, 900], [900, 860], [1350, 760], [1650, 560], [1840, 320], [2000, 180]];
    line(rd, OL('#8a8778'), PK ? 146 : 150); line(rd, '#8a8778', 140);
    if (PK) line(rd.map(([x, y]) => [x - 20, y - 52]), 'rgba(255,250,235,.25)', 14);
    withT(() => { s.setLineDash([40, 40]); s.lineDashOffset = -t * 40; line(rd, CREAM, 8); });
    for (let i = 0; i < 6; i++) { const u = .55 + i * .08, p = rd[Math.min(rd.length - 1, Math.floor(u * (rd.length - 1)))]; withT(() => { s.globalAlpha = .9; cloud(p[0] + 30, p[1] + 110, 46, 300 + i); }); }
    // the sign, springing up on "hundred"
    const up = ease.back(inv(287.43, 287.95, t));
    if (up > 0) withT(() => {
      s.translate(1260, 1020); s.rotate((1 - up) * 1.2);
      const tw = textWidth('A HUNDRED MILES', 56, 'sign'), x0 = -tw / 2 - 50, x1 = tw / 2 + 30;   // the sign is sized to its words
      if (PK) { PK.tube([0, 0], [0, -240], [0, -470], 8, 7, '#7a786a', 1.2);   // a stepped brass deco frame behind it, stars at the ends
        shape([[x0 - 26, -578], [x1 + 4, -578], [x1 + 110, -495], [x1 + 4, -412], [x0 - 26, -412], [x0 - 26, -440], [x0 - 40, -450], [x0 - 40, -540], [x0 - 26, -550]], BRASS, 2);
      } else { line([[0, 0], [0, -470]], INK, 22); line([[0, 0], [0, -470]], '#6b6a5a', 15); }
      shape([[x0, -560], [x1, -560], [x1 + 80, -495], [x1, -430], [x0, -430]], '#2f6f4a', 4);
      s.lineWidth = 3; s.strokeStyle = CREAM; s.strokeRect(x0 + 14, -548, x1 - x0 - 14, 106);
      text('A HUNDRED MILES', (x0 + x1) / 2 + 7, -472, 56, { font: 'sign', color: CREAM, max: x1 - x0 - 50 });
      if (PK) { PK.star(x0 - 34, -495, 20, CREAM, 1); for (const [bx2, by2] of [[x0 + 6, -552], [x0 + 6, -438], [x1 - 8, -552], [x1 - 8, -438]]) PK.ball(bx2, by2, 7, BRASS, 1); }
    });
    // him: down the steps and onto the road
    const wk = inv(286.6, 290, t), bx = lerp(330, 760, wk), by = lerp(760, 885, smooth(inv(0, .45, wk))) ;
    suitSide(bx, by, 190, { ph: (t - 286.6) * 1.2, walk: 1, face: 1, t });
  }

  chapter('laughter', 245.0, 290.0, [
    [245.0, sewDesk], [252.74, machine], [260.34, smile], [264.63, dressing],
    [275.53, noStop], [278.57, aisle], [283.99, doors], [286.57, road],
  ]);
})();
