// 290.0 - 320.0  a hundred miles (instrumental). The walk: a road through the sky, mileposts flicking by
// from 1 toward 100, the ministry left behind with its ducts hanging loose like roots, she waiting at
// mile 50, the clouds waving them on.
(() => {
  const PANTS = '#b8434f', SWEATER = '#d9a23a', SCARF = '#2f8f7f';
  const satAt = (t) => kf(t, [[290, .82], [303, .88], [320, .94]], (k) => k);
  // which mile a post passing at song time bt carries
  const mileAt = (bt) => Math.max(1, Math.round(kf(bt, [[290.5, 1], [295.23, 6], [303.0, 49], [310.33, 74], [316.1, 98], [318.6, 100]], (k) => k)));

  // ---- helpers ----
  function sky(top = 0, bot = H) { s.fillStyle = vgrad(top, bot, [[0, SKY_T], [1, SKY_B]]); s.fillRect(-W, -H, W * 3, H * 3); }
  // the man in his new clothes, side on, screen space (bx, by = feet, k = px per metre)
  function suitSide(bx, by, k, { ph = 0, walk = 0, face = 1, t = 0, kase = true } = {}) {
    const sw = Math.sin(ph * TAU) * .32 * walk, bob = Math.abs(Math.sin(ph * TAU)) * .03 * k * walk;
    const hip = [bx, by - .95 * k - bob], shY = by - 1.45 * k - bob;
    const hand2 = [bx - .05 * k * face - sw * .1 * k, by - .66 * k - bob];
    if (kase) shape([[hand2[0] - .28 * k, hand2[1]], [hand2[0] + .28 * k, hand2[1]], [hand2[0] + .3 * k, hand2[1] + .36 * k], [hand2[0] - .3 * k, hand2[1] + .36 * k]], '#2b2924', 2);
    for (const a of [sw, -sw]) {
      const p = [hip, [hip[0] + Math.sin(a) * .5 * k * face, hip[1] + .48 * k], [hip[0] + Math.sin(a) * .9 * k * face, by - .05 * k]];
      line(p, INK, .17 * k); line(p, PANTS, .125 * k); line(p, AMBER, .015 * k);
      const f = p[2]; s.beginPath(); s.ellipse(f[0] + .06 * k * face, f[1] + .02 * k, .11 * k, .04 * k, 0, 0, TAU); s.fillStyle = '#26241f'; s.fill(); s.lineWidth = 2; s.strokeStyle = INK; s.stroke();
    }
    const fl = Math.sin(t * 6) * .04 * k;
    shape([[bx - .02 * k * face, shY + .02 * k], [bx - .1 * k * face, shY - .03 * k], [bx - (.5 + .1 * walk) * k * face, shY + .1 * k + fl], [bx - (.46 + .1 * walk) * k * face, shY + .2 * k + fl]], SCARF, 2);
    const torso = [[bx - .2 * k, shY], [bx + .19 * k, shY], [bx + .17 * k, hip[1] + .05 * k], [bx - .17 * k, hip[1] + .05 * k]];
    shape(torso, SWEATER, 2.5);
    withT(() => { s.beginPath(); torso.forEach(([x, y], j) => j ? s.lineTo(x, y) : s.moveTo(x, y)); s.closePath(); s.clip();
      const zz = []; for (let i = 0; i <= 9; i++) zz.push([bx - .2 * k + i * .045 * k, shY + .2 * k + (i % 2 ? .05 : 0) * k]); line(zz, ROSE, .035 * k); });
    shape([[bx - .12 * k, shY - .07 * k], [bx + .13 * k, shY - .07 * k], [bx + .14 * k, shY + .05 * k], [bx - .13 * k, shY + .05 * k]], SCARF, 2);
    for (let j = 0; j < 5; j++) { const a = j / 5 * TAU; dot(bx + .12 * k * face + Math.cos(a) * .03 * k, shY + .2 * k + Math.sin(a) * .03 * k, .026 * k, ROSE); }
    dot(bx + .12 * k * face, shY + .2 * k, .016 * k, AMBER);
    const hx = bx + .04 * k * face, hy = shY - .17 * k;
    dot(hx, hy, .12 * k, SKIN); s.lineWidth = 2; s.strokeStyle = INK; s.beginPath(); s.arc(hx, hy, .12 * k, 0, TAU); s.stroke();
    dot(hx + .1 * k * face, hy + .01 * k, .025 * k, SKIN); dot(hx + .055 * k * face, hy - .01 * k, .012 * k, INK);
    s.beginPath(); s.ellipse(hx, hy - .09 * k, .24 * k, .045 * k, 0, 0, TAU); s.fillStyle = HAT; s.fill(); s.stroke();
    shape([[hx - .13 * k, hy - .09 * k], [hx + .13 * k, hy - .09 * k], [hx + .11 * k, hy - .27 * k], [hx - .11 * k, hy - .27 * k]], HAT, 1.8);
    shape([[hx - .128 * k, hy - .1 * k], [hx + .128 * k, hy - .1 * k], [hx + .124 * k, hy - .14 * k], [hx - .124 * k, hy - .14 * k]], ROSE, 1.4);
    const shp = [bx + .02 * k * face, shY + .1 * k], ang = sw * .8 * face;
    const el = [shp[0] + Math.sin(ang) * .36 * k, shp[1] + Math.cos(ang) * .36 * k], hand = [el[0] + Math.sin(ang * 1.1) * .34 * k, el[1] + Math.cos(ang * 1.1) * .34 * k];
    line([shp, el, hand], INK, .13 * k); line([shp, el, hand], SWEATER, .09 * k); dot(hand[0], hand[1], .05 * k, SKIN);
  }
  // her (the kit's woman) placed in screen space: feet at (sx, sy), k px per metre
  function her(sx, sy, k, o) { cam({ x: 0, y: 0, z: 0, f: k, vy: sy - FL * k }); return woman((sx - W / 2) / k, 1, o); }
  // a milepost: white post, black cap, the mile number on a plate. (x, y) = foot, h = height px
  function milepost(x, y, h, n) {
    const w = h * .26;
    shape([[x - w / 2, y], [x + w / 2, y], [x + w / 2, y - h], [x - w / 2, y - h]], '#f1ede0', 3);
    shape([[x - w / 2 - 4, y - h - h * .08], [x + w / 2 + 4, y - h - h * .08], [x + w / 2 + 4, y - h], [x - w / 2 - 4, y - h]], INK, 2);
    shape([[x - w * .42, y - h * .82], [x + w * .42, y - h * .82], [x + w * .42, y - h * .5], [x - w * .42, y - h * .5]], '#2f6f4a', 2);
    text(String(n), x, y - h * .56, h * .26, { font: 'sign', color: CREAM, max: w * .84 * .82 });
  }
  // a cloud with a face, waving
  function waver(x, y, r, seed, t) {
    cloud(x, y, r, seed);
    for (const sg of [-1, 1]) { const wv = Math.sin(t * 4.5 + seed * 1.7) * r * .25;
      const sh = [x + sg * r * 1.35, y - r * .35], el = [x + sg * r * 1.85, y - r * .55], hd = [x + sg * r * 2.05 + wv * .4 * sg, y - r * 1.05 + Math.abs(wv) * .3];
      line([sh, el, hd], INK, Math.max(4, r * .1)); line([sh, el, hd], '#fbfbf6', Math.max(2, r * .06));
      dot(hd[0], hd[1], r * .12, '#fbfbf6'); s.lineWidth = 3; s.strokeStyle = INK; s.beginPath(); s.arc(hd[0], hd[1], r * .12, 0, TAU); s.stroke(); }
    dot(x - r * .3, y - r * .55, r * .06, INK); dot(x + r * .3, y - r * .55, r * .06, INK);
    s.beginPath(); s.arc(x, y - r * .42, r * .2, .2 * Math.PI, .8 * Math.PI); s.lineWidth = 3.5; s.strokeStyle = INK; s.stroke();
  }
  // a straight road band seen side on: surface from y to y+d, front face below; dashes slide with off
  function roadBand(y, d, face, off) {
    shape([[-40, y], [W + 40, y], [W + 40, y + d], [-40, y + d]], '#8a8778', 3);
    shape([[-40, y + d], [W + 40, y + d], [W + 40, y + d + face], [-40, y + d + face]], '#6a6758', 3);
    hatch([[-40, y + d], [W + 40, y + d], [W + 40, y + d + face], [-40, y + d + face]], .9, 10, 1.2, .35);
    withT(() => { s.setLineDash([60, 50]); s.lineDashOffset = off; line([[-40, y + d * .5], [W + 40, y + d * .5]], CREAM, Math.max(3, d * .08), 'butt'); });
  }
  function cloudSea(y, off, seed, r = 120) {
    for (let i = -1; i < 9; i++) { const x = ((i * r * 2.6 - off) % (W + r * 5.2) + W + r * 5.2) % (W + r * 5.2) - r * 2.6; cloud(x, y + hash(i + seed) * 30, r * (.8 + .4 * hash(i * 3 + seed)), seed + i); }
  }

  // ---- shots ----
  // 290.0 the climb: the ministry falls behind on its lump of ground, ducts hanging below it like roots
  // pulling loose; the road climbs away over the clouds; he walks up it past mile 1, 2, 3.
  function depart(t, lt) {
    fx({ sat: satAt(t) });
    sky();
    for (let i = 0; i < 5; i++) cloud(((i * 520 - t * 20) % (W + 700) + W + 700) % (W + 700) - 300, 140 + hash(i * 11) * 260, 50 + 40 * hash(i + 5), 400 + i);
    const zm = kf(t, [[290, 1.25], [295.23, .9]], ease.sine);
    withT(() => {
      s.translate(300, 700); s.scale(zm, zm); s.translate(-300, -700);
      cloudSea(1010, t * 12, 50, 140);
      // the ministry on its clod, ducts dangling like roots, two of them coming loose and falling
      shape([[90, 760], [470, 760], [430, 840], [300, 880], [150, 850]], '#7a6d5a', 3);
      hatch([[90, 760], [470, 760], [430, 840], [300, 880], [150, 850]], .7, 10, 1.3, .45);
      for (let i = 0; i < 7; i++) {
        const x0 = 130 + i * 48, y0 = 820 + Math.sin(i) * 20, L = 160 + hash(i * 3) * 160;
        const loose = (i === 2 || i === 5) ? ease.in(inv(291.5 + i * .3, 294.5 + i * .3, t)) : 0;
        const pts = []; for (let u = 0; u <= 6; u++) pts.push([x0 + Math.sin(u * .8 + t * 1.6 + i) * 18 * u / 6, y0 + u / 6 * L]);
        withT(() => { s.translate(loose * 30, loose * 600); s.rotate(loose * .3);
          line(pts, INK, 26); line(pts, STEEL, 20); for (let u = 1; u < 6; u++) ink([[pts[u][0] - 11, pts[u][1]], [pts[u][0] + 11, pts[u][1]]], 1.4); });
      }
      shape([[130, 300], [430, 300], [430, 762], [130, 762]], '#7d8280', 3);
      for (let y = 330; y < 700; y += 70) for (let x = 155; x < 410; x += 70) shape([[x, y], [x + 40, y], [x + 40, y + 42], [x, y + 42]], '#4d5250', 1.6);
      for (const dx of [190, 370]) { line([[dx, 270], [dx, 762]], INK, 30, 'butt'); line([[dx, 270], [dx, 762]], STEEL, 24, 'butt'); }
      shape([[245, 680], [315, 680], [315, 762], [245, 762]], '#3d4140', 2);
      // the road
      const roadY = (x) => 762 - Math.pow(Math.max(0, x - 300) / 1800, 1.25) * 640;
      const rd = []; for (let x = 280; x <= 2300; x += 40) rd.push([x, roadY(x)]);
      for (let i = 0; i < 7; i++) { const x = 600 + i * 260; cloud(x, roadY(x) + 60, 50, 500 + i); }
      line(rd, INK, 52); line(rd, '#8a8778', 44);
      withT(() => { s.setLineDash([26, 26]); line(rd, CREAM, 4); });
      // mileposts along it; he passes them
      for (let m = 1; m <= 6; m++) { const x = 560 + m * 230; milepost(x, roadY(x) + 2, 90, m); }
      const hx = kf(t, [[290, 420], [295.23, 1250]], (k) => k);
      suitSide(hx, roadY(hx) - 4, 100, { ph: (t - 290) * 1.25, walk: 1, face: 1, t });
    });
  }
  // 295.23 the stride, close: he walks in place; the mileposts whip past on the beat, counting up.
  function stride(t, lt) {
    fx({ sat: satAt(t) });
    sky(-200, 900);
    for (let i = 0; i < 6; i++) { const x = ((i * 420 - t * 60) % (W + 600) + W + 600) % (W + 600) - 300; cloud(x, 170 + hash(i * 7) * 300, 55 + 35 * hash(i + 1), 600 + i); }
    const v = 700;
    cloudSea(1080, t * 260, 70, 150);
    roadBand(840, 70, 70, t * v);
    const k = 390;
    suitSide(840, 872, k, { ph: (t - 295.23) * 1.3, walk: 1, face: 1, t });
    // posts, one per beat, in the foreground lane
    const b = FEAT.beats;
    for (let i = lastBeat(t) + 1; i >= Math.max(0, lastBeat(t) - 3); i--) {
      const bt = b[i]; if (bt === undefined || bt < 295.0) continue;
      const x = W * .62 - (t - bt) * 1500 + 600; if (x < -200 || x > W + 200) continue;
      milepost(x, 912, 300, mileAt(bt));
    }
  }
  // 303.17 mile 50: she is waiting at the post. He arrives on the swell (305.33); they walk on together.
  function fifty(t, lt) {
    fx({ sat: satAt(t) });
    sky(-100, 900);
    for (let i = 0; i < 5; i++) { const x = ((i * 480 - t * 25) % (W + 600) + W + 600) % (W + 600) - 300; cloud(x, 160 + hash(i * 13) * 260, 55 + 30 * hash(i + 4), 700 + i); }
    const cx = kf(t, [[306.3, 0], [310.33, 760]], (k) => k);
    cloudSea(1060, t * 15 + cx * .6, 80, 140);
    roadBand(800, 50, 50, cx);
    withT(() => {
      s.translate(-cx, 0);
      milepost(1400, 830, 200, 50);
      const k = 210, walkV = 190;
      const meet = 305.33, go = 306.3;
      const hx = t < meet ? lerp(260, 1080, inv(303.17, meet, t)) : 1080 + Math.max(0, t - go) * walkV;
      const hWalk = t < meet || t > go ? 1 : 0;
      const sx = 1250 + Math.max(0, t - go) * walkV, sFace = t < meet + .4 ? -1 : 1;
      her(sx, 822, k * .95, { face: sFace, walk: t > go ? 1 : 0, ph: (t - go) * 1.25, rose: 1, arm: t > meet && t < go ? .6 : 0 });
      suitSide(hx, 822, k, { ph: (t - 303.17) * 1.25, walk: hWalk, face: 1, t });
      // her laughter when he arrives: a little burst of warm rings
      const lt2 = t - meet;
      if (lt2 > 0 && lt2 < 2.2) for (let i = 0; i < 6; i++) {
        const u = clamp(lt2 / 1.6 - i * .08); if (u <= 0 || u >= 1) continue;
        const a = -Math.PI / 2 + (i - 2.5) * .35, r = 60 + u * 260;
        s.globalAlpha = 1 - u; s.beginPath(); s.arc(sx - 20 + Math.cos(a) * r * .3, 822 - 1.5 * k + Math.sin(a) * r * .6, 26 + u * 20, 0, TAU);
        s.lineWidth = 9; s.strokeStyle = [ROSE, AMBER, ROSE_L][i % 3]; s.stroke(); s.globalAlpha = 1;
      }
    });
  }
  // 310.33 the clouds wave them on: a wide sky, the road winding away, the two of them small on it.
  function wave(t, lt) {
    fx({ sat: satAt(t) });
    const dy = kf(t, [[310.33, 0], [316.1, -60]], ease.sine);
    sky();
    withT(() => {
      s.translate(0, -dy);
      waver(260, 330, 95, 11, t); waver(1640, 250, 110, 12, t); waver(1180, 140, 60, 13, t); waver(560, 120, 55, 14, t);
      // the ribbon road: wide at our feet, a thread at the horizon
      const N = 60, pts = [];
      for (let i = 0; i <= N; i++) { const u = i / N; pts.push([lerp(300, 1350, u) + Math.sin(u * 5 + .4) * 380 * Math.pow(1 - u, .8), lerp(1180, 430, Math.pow(u, .6)), lerp(330, 8, Math.pow(u, .6))]); }
      for (let i = N; i > 0; i--) { const [x0, y0, w0] = pts[i - 1], [x1, y1, w1] = pts[i];
        poly([[x0 - w0, y0], [x0 + w0, y0], [x1 + w1, y1 - 1], [x1 - w1, y1 - 1]], '#8a8778'); }
      line(pts.map(([x, y, w]) => [x - w, y]), INK, 3); line(pts.map(([x, y, w]) => [x + w, y]), INK, 3);
      withT(() => { s.setLineDash([20, 26]); s.lineDashOffset = t * 30; line(pts.map(([x, y]) => [x, y]), CREAM, 4); });
      for (const [j, sg] of [[6, 1], [30, -1], [40, 1], [48, -1]]) { const p = pts[j]; cloud(p[0] + sg * (p[2] * 1.3 + 60), p[1] + 30, 30 + p[2] * .25, 800 + j); }
      { const e = pts[N]; cloud(e[0] + 10, e[1] + 14, 70, 860); }
      waver(1500, 760, 120, 15, t); waver(330, 720, 80, 16, t);
      // the two of them, walking away from us along it
      const u = .3 + (t - 310.33) * .012, i = Math.floor(u * N), p = pts[i], k = p[2] * .5;
      her(p[0] + k * .5, p[1], k * .95, { face: 1, walk: 1, ph: (t - 310.33) * 1.2, rose: 1 });
      suitSide(p[0] - k * .3, p[1] + 4, k, { ph: (t - 310.33) * 1.2, walk: 1, face: 1, t });
    });
  }
  // 316.1 mile 99, then 100: they walk past 99 and stop at the tall 100 post (318.6) at the road's end.
  function hundred(t, lt) {
    fx({ sat: satAt(t) });
    sky(-100, 900);
    for (let i = 0; i < 5; i++) { const x = ((i * 460 - t * 22) % (W + 600) + W + 600) % (W + 600) - 300; cloud(x, 150 + hash(i * 17) * 280, 55 + 30 * hash(i + 6), 900 + i); }
    const stop = 318.6, cx = kf(t, [[316.1, 0], [stop, 560]], (k) => k);
    cloudSea(1060, cx * .6, 90, 140);
    withT(() => {
      s.translate(-cx, 0);
      // the road ends at a cloud's edge
      shape([[-40, 800], [2050, 800], [2050, 850], [-40, 850]], '#8a8778', 3);
      shape([[-40, 850], [2050, 850], [2050, 900], [-40, 900]], '#6a6758', 3);
      withT(() => { s.setLineDash([60, 50]); line([[-40, 825], [2030, 825]], CREAM, 4, 'butt'); });
      cloud(2140, 900, 130, 950);
      milepost(520, 830, 200, 99);
      const up = ease.back(inv(stop - .2, stop + .3, t));
      withT(() => { s.beginPath(); s.rect(1700, -100, 400, 932); s.clip(); milepost(1880, 830 + (1 - up) * 340, 320, 100); });
      const k = 210, x0 = 900 + cx, walking = t < stop;
      her(x0 + 170, 822, k * .95, { face: 1, walk: walking ? 1 : 0, ph: (t - 316.1) * 1.25, rose: 1, arm: t > stop + .3 ? .7 : 0 });
      suitSide(x0, 822, k, { ph: (t - 316.1) * 1.25, walk: walking ? 1 : 0, face: 1, t });
    });
  }

  chapter('hundred-miles', 290.0, 320.0, [[290.0, depart], [295.23, stride], [303.17, fifty], [310.33, wave], [316.1, hundred]]);
})();
