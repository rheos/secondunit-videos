// js/ch/sky.js · "her love is the sky and her children are the clouds" (44.9 - 73.3)
// One place: a hilltop above a small town at night. She stands with her back to us; the sky turns
// around her. Look test for the swirling impasto night. Word times are Whisper (up to ~1 s early).
(() => {
  const T = { dream: 44.9, smile: 48.78, love: 54.0, sky: 56.5, kids: 58.32, clouds: 59.96, ok: 63.94, away: 69.5, end: 73.3 };

  // palette: the night blues, widened toward teal, violet, rose and gold as her love becomes the sky
  const C = {
    zenith: '#0e1f66', cobalt: '#1f47a8', teal: '#1d7a8c', violet: '#5a3c9e', rose: '#c96a86', peach: '#f0a878',
    moon: '#ffd84a', moonCore: '#fff4c2', star: '#fff2a8', ring1: '#e9d36a', ring2: '#9fd6c4',
    hill1: '#14304a', hill2: '#1f4a3e', hillEdge: '#3f7a6a', town: '#1a2140', roof: '#2e2a52', win: '#ffc93c',
    tree: '#0f2a22', treeHi: '#2f6a4a',
    coat: '#e06a74', coatDk: '#a8405a', scarf: '#6d5f9a', stock: '#3b2a3e', skin: '#e8b494',
    cloud: '#ece8ff', cloudSh: '#aaa6e0', cloudRim: '#f4b6c8',
  };
  const STARS = [[260, 170, 1], [520, 90, .8], [700, 230, .7], [1080, 120, .9], [1260, 270, .6], [1760, 120, .8], [380, 330, .6], [1840, 360, .5], [980, 300, .5]];
  const HOUSE = [1380, 812]; // her house in the town below: where the cloud children settle

  function sky(t, spread) {
    const g = vgrad(s, -200, 900, [[0, C.zenith], [.35, C.cobalt], [.62, mixh(C.cobalt, C.teal, spread)], [.8, mixh(C.cobalt, C.violet, spread * .8)], [1, mixh(C.teal, C.rose, spread)]]);
    s.fillStyle = g; s.fillRect(-600, -600, 3200, 2000);
    // rivers: long sinuous bands across the sky, alternating colours, drifting
    const bands = [[120, C.cobalt, C.teal], [230, C.zenith, C.violet], [340, '#2d63c4', C.teal], [450, C.cobalt, C.rose], [560, '#2a58b8', C.peach]];
    s.save(); s.filter = 'blur(10px)';
    bands.forEach(([y0, a, b], i) => {
      const pts = []; for (let x = -500; x <= 2500; x += 40) pts.push([x, y0 + Math.sin(x * .004 + i * 1.7 + t * .25) * 38 + Math.sin(x * .011 + i) * 12]);
      stroke(s, pts, rgba(mixh(a, b, spread * (i % 2 ? .9 : .5)), .5), 70 - i * 4);
    });
    s.restore();
  }

  function rings(x, y, r, n, cols, a = .7) {
    s.save(); s.filter = 'blur(7px)';
    for (let i = n; i >= 1; i--) { s.globalAlpha = a; dot(s, x, y, r * i / n, cols[i % cols.length]); }
    s.restore();
  }

  function moon(t, bloom) {
    const [x, y] = [1520, 200], r = 70 + 18 * bloom;
    rings(x, y, r * (2.3 + .5 * bloom), 5, [C.ring2, C.ring1, '#4f8fc8', C.ring1, '#7fc0b8']);
    dot(s, x, y, r, C.moon); dot(s, x - 6, y - 6, r * .62, C.moonCore);
    glow(x, y, r * (3 + 1.5 * bloom), rgba('#ffc84a', .28 + .14 * bloom));
    glow(x, y, r * 1.1, 'rgba(255,236,170,.35)');
    vort(x, y, r * (2.6 + bloom), .9);
  }

  function stars(t, k) {
    STARS.forEach(([x, y, m], i) => {
      const tw = .75 + .25 * Math.sin(t * 2.1 + i * 2.3), r = 16 * m * (1 + .4 * k);
      rings(x, y, r * 2.4, 3, [C.ring2, C.star, '#6fa4d8'], .55);
      dot(s, x, y, r * .55, C.star);
      glow(x, y, r * 3 * tw, rgba('#ffe890', .3 * tw));
      vort(x, y, r * 3, i % 2 ? .5 : -.5);
    });
  }

  // the great double spiral that opens in the middle of the sky on "her love is the sky"
  function spiral(t, k) {
    if (k <= 0) return;
    const [cx, cy] = [880, 330];
    s.save(); s.filter = 'blur(9px)';
    for (let arm = 0; arm < 2; arm++) {
      const pts = []; for (let a = 0; a < 9; a += .12) { const rr = 18 + a * 26 * k; pts.push([cx + Math.cos(a + arm * Math.PI + t * .35) * rr * 1.35, cy + Math.sin(a + arm * Math.PI + t * .35) * rr * .8]); }
      stroke(s, pts, rgba(arm ? C.ring2 : '#cfe6f4', .6 * k), 40);
    }
    s.restore();
    vort(cx, cy, 320 * k + 1, 1.1 * k);
    vort(cx + 330, cy + 40, 200 * k + 1, -.8 * k);
  }

  function hills(t) {
    s.fillStyle = C.hill1; s.beginPath(); s.moveTo(-600, 1400);
    for (let x = -600; x <= 2600; x += 40) s.lineTo(x, 720 + Math.sin(x * .0032 + .8) * 60 + Math.sin(x * .009) * 18);
    s.lineTo(2600, 1400); s.fill();
    const edge = []; for (let x = -600; x <= 2600; x += 40) edge.push([x, 722 + Math.sin(x * .0032 + .8) * 60 + Math.sin(x * .009) * 18]);
    stroke(s, edge, C.hillEdge, 14);
    // the near hill she stands on
    s.fillStyle = C.hill2; s.beginPath(); s.moveTo(-600, 1400);
    for (let x = -600; x <= 1500; x += 40) s.lineTo(x, 905 - Math.exp(-Math.pow((x - 700) / 520, 2)) * 70 + Math.sin(x * .013) * 8);
    s.lineTo(1500, 1400); s.fill();
    // grass rows that the strokes pick up
    for (let i = 0; i < 5; i++) { const pts = []; for (let x = -600; x <= 1500; x += 50) pts.push([x, 935 + i * 34 - Math.exp(-Math.pow((x - 700) / 520, 2)) * 60 + Math.sin(x * .02 + i) * 9]); stroke(s, pts, rgba(i % 2 ? '#2f6a52' : '#1a3c34', .7), 16); }
  }

  function town(t, warm) {
    const houses = [[1080, 770, 70, 60], [1170, 790, 60, 50], [1250, 760, 80, 75], [HOUSE[0], HOUSE[1] - 40, 90, 70], [1500, 780, 70, 55], [1590, 800, 60, 45], [1680, 770, 85, 70], [1790, 795, 60, 50]];
    // church spire
    poly(s, [[1150, 640], [1172, 760], [1128, 760]], C.roof); s.fillStyle = C.town; s.fillRect(1125, 755, 50, 70);
    houses.forEach(([x, y, w, h], i) => {
      s.fillStyle = mixh(C.town, '#2a3870', (i % 3) * .3); s.fillRect(x - w / 2, y - h / 2, w, h);
      poly(s, [[x - w / 2 - 6, y - h / 2], [x, y - h / 2 - h * .5], [x + w / 2 + 6, y - h / 2]], C.roof);
      const lit = i === 3 ? 1 : .6 + .4 * Math.sin(i * 3.1);
      if (lit > .3) { s.fillStyle = C.win; s.fillRect(x - 9, y - 8, 16, 18); glow(x - 1, y + 1, 26 + 30 * warm * (i === 3), rgba('#ffbe3a', .5 * lit)); }
    });
    vort(HOUSE[0], HOUSE[1] - 40, 90, .5 * warm);
  }

  function tree(t) {
    // the flame-shaped tree at the left, pulled upward by a directed field
    const pts = []; const [bx, by, hgt] = [250, 980, 720];
    for (let i = 0; i <= 20; i++) { const u = i / 20, w = 90 * Math.sin(Math.PI * Math.pow(u, .7)) * (1 - u * .4); pts.push([bx - w + Math.sin(u * 9 + t * 1.3) * 10, by - u * hgt]); }
    for (let i = 20; i >= 0; i--) { const u = i / 20, w = 90 * Math.sin(Math.PI * Math.pow(u, .7)) * (1 - u * .4); pts.push([bx + w + Math.sin(u * 8 + t * 1.1 + 1) * 10, by - u * hgt]); }
    blob(s, pts, C.tree);
    for (let k = 0; k < 4; k++) { const p2 = []; for (let i = 0; i <= 12; i++) { const u = i / 12; p2.push([bx - 40 + k * 26 + Math.sin(u * 7 + k + t) * 14, by - 40 - u * (hgt - 120)]); } stroke(s, p2, rgba(C.treeHi, .6), 12); }
    dirAt(bx, by - hgt * .5, 260, -Math.PI / 2);
  }

  // her, seen from behind: coral coat, lilac headscarf. arms 0 = down, 1 = lifted open to the sky
  function her(t, x, y, sc, arms) {
    const sw = Math.sin(t * 1.1) * 3;
    for (const g of [s, mk]) { g.save(); g.translate(x, y); g.scale(sc, sc); g.rotate(sw * .004); }
    // legs
    s.fillStyle = C.stock; s.fillRect(-26, -40, 18, 40); s.fillRect(8, -40, 18, 40);
    ell(s, -18, 0, 16, 7, 0, '#1b1424'); ell(s, 18, 0, 16, 7, 0, '#1b1424');
    // arms behind the body when down, out to the sides when lifted
    const arm = (side) => {
      // down: hanging slightly out; lifted: up and out. The left arm swings through PI, the right through 0.
      const up = side > 0 ? -Math.PI / 2 + .9 : Math.PI * 1.5 - .9;
      const a = lerp(Math.PI / 2 - side * .18, up, ease.inOut(arms));
      const sx = side * 36, sy = -192, L = 60;
      const bend = side * .35 * ease.inOut(arms);
      const mx = sx + Math.cos(a) * L, my = sy + Math.sin(a) * L, ex = mx + Math.cos(a - bend) * L, ey = my + Math.sin(a - bend) * L;
      stroke(s, [[sx, sy], [mx, my], [ex, ey]], C.coatDk, 38); stroke(s, [[sx, sy], [mx, my], [ex, ey]], C.coat, 24);
      stroke(mk, [[sx, sy], [mx, my], [ex, ey]], '#fff', 44);
      dot(s, ex + Math.cos(a - bend) * 14, ey + Math.sin(a - bend) * 14, 13, C.skin); dot(mk, ex + Math.cos(a - bend) * 14, ey + Math.sin(a - bend) * 14, 18, '#fff');
    };
    arm(-1); arm(1);
    // coat
    const body = [[-38, -205], [38, -205], [62, -40], [-62, -40]];
    poly(s, body, C.coat); poly(s, [[8, -205], [38, -205], [62, -40], [20, -40]], C.coatDk);
    poly(mk, body.map(([a, b]) => [a * 1.1, b]), '#fff');
    stroke(s, [[-4, -200], [-2, -45]], rgba('#7a2a44', .6), 4);
    // head and scarf
    ell(s, 0, -238, 32, 36, 0, C.scarf); ell(s, 10, -244, 14, 22, .3, mixh(C.scarf, '#c8c0e0', .5));
    poly(s, [[-12, -208], [14, -208], [6, -186], [-6, -188]], mixh(C.scarf, '#5d5682', .5));
    ell(mk, 0, -236, 38, 42, 0, '#fff');
    for (const g of [s, mk]) g.restore();
    glow(x, y - 230 * sc, 60 * sc, 'rgba(255,200,170,.18)');
  }

  // a cloud child: round head, round body, little arms out to hold the next one's hand
  function child(t, x, y, r, k, i) {
    if (k <= .01) return;
    const R = r * ease.back(k);
    for (const g of [s, mk]) { g.save(); g.translate(x, y); g.rotate(Math.sin(t * 1.3 + i * 2) * .08); }
    const puff = (px, py, pr, c, sq = 1) => blob(s, [...Array(10)].map((_, j) => { const a = j / 10 * TAU, w = 1 + .12 * Math.sin(j * 3 + i + t * 1.5); return [px + Math.cos(a) * pr * w, py + Math.sin(a) * pr * w * sq]; }), c);
    // a small child in a cloud dress: head, narrow shoulders flaring to a wide hem, two stubby legs
    const kick = Math.sin(t * 2.2 + i * 1.7) * R * .08;
    stroke(s, [[-R * .28, R * .55], [-R * .3 - kick, R * 1.05]], C.cloudSh, R * .26); stroke(s, [[R * .28, R * .55], [R * .3 + kick, R * 1.05]], C.cloudSh, R * .26);
    const dress = [[-R * .32, -R * .55], [R * .32, -R * .55], [R * .85, R * .62], [0, R * .72], [-R * .85, R * .62]];
    blob(s, dress, C.cloudSh); blob(s, dress.map(([a, b]) => [a * .86 - R * .05, b * .9 - R * .04]), C.cloud);
    stroke(s, [[-R * .78, R * .6], [R * .78, R * .62]], rgba(C.cloudRim, .75), R * .16);
    // arms reach out sideways to hold hands
    stroke(s, [[-R * .3, -R * .4], [-R * 1.1, -R * .05]], C.cloud, R * .2); stroke(s, [[R * .3, -R * .4], [R * 1.1, -R * .05]], C.cloud, R * .2);
    puff(0, -R * .98, R * .44, C.cloudSh); puff(-R * .05, -R * 1.02, R * .37, C.cloud);
    puff(-R * .46, -R * .92, R * .14, C.cloud); puff(R * .44, -R * .9, R * .13, C.cloud); // pigtails
    blob(mk, dress.map(([a, b]) => [a * 1.15, b * 1.1]), '#fff'); dot(mk, 0, -R * .98, R * .55, '#fff');
    stroke(mk, [[-R * 1.15, -R * .05], [R * 1.15, -R * .05]], '#fff', R * .35); stroke(mk, [[-R * .3, R * .6], [-R * .3, R * 1.1]], '#fff', R * .35); stroke(mk, [[R * .3, R * .6], [R * .3, R * 1.1]], '#fff', R * .35);
    for (const g of [s, mk]) g.restore();
    glow(x, y - R * .5, R * 2, rgba('#f0c8e0', .08 * k));
    vort(x, y - R * .4, R * 1.9, (i % 2 ? .55 : -.55) * k);
  }

  // the three of them, holding hands; they swirl out of the sky, circle her, then settle over her house
  const KIDS = [[-230, 6, 82], [0, -8, 68], [200, 14, 56]];
  function kids(t) {
    const k = smooth(inv(T.kids - .2, T.clouds + 1.2, t));
    if (k <= 0) return;
    const c = kf(t, [[T.kids, [1060, 260]], [T.clouds + 1.5, [900, 300]], [T.ok, [760, 380]], [T.away, [HOUSE[0] - 60, 560]], [T.end, [HOUSE[0] - 40, 600]]], ease.inOut);
    const shrink = kf(t, [[T.ok, 1], [T.end, .62]]);
    // hands: wisps linking each pair
    for (let i = 0; i < 2; i++) {
      const [ax, ay, ar] = KIDS[i], [bx, by, br] = KIDS[i + 1];
      const p = [[c[0] + (ax + ar * 1.05) * shrink, c[1] + (ay - ar * .05) * shrink], [c[0] + (bx - br * 1.05) * shrink, c[1] + (by - br * .05) * shrink]];
      stroke(s, p, rgba(C.cloud, k), 10 * shrink);
    }
    KIDS.forEach(([dx, dy, r], i) => {
      const ki = smooth(inv(T.kids - .2 + i * .45, T.clouds + .6 + i * .45, t));
      const wob = Math.sin(t * 1.4 + i * 1.9) * 10;
      child(t, c[0] + dx * shrink, c[1] + (dy + wob) * shrink, r * shrink, ki, i);
    });
    // before they form: wisps spiralling in
    const wisp = 1 - smooth(inv(T.kids + .6, T.clouds + 1.4, t));
    if (wisp > 0 && t > T.kids - .4) { s.save(); s.filter = 'blur(8px)'; }
    if (wisp > 0 && t > T.kids - .4) KIDS.forEach(([dx, dy, r], i) => {
      const pts = []; for (let a = 0; a < 6; a += .2) { const rr = (10 + a * 18) * (1 + wisp * 1.5); pts.push([c[0] + dx + Math.cos(a * 1.6 + t * 3 + i) * rr, c[1] + dy + Math.sin(a * 1.6 + t * 3 + i) * rr * .7]); }
      stroke(s, pts, rgba(C.cloud, .5 * wisp), 26);
    });
    if (wisp > 0 && t > T.kids - .4) s.restore();
  }

  function scene(t) {
    const spread = smooth(inv(T.love - .6, T.sky + 1.5, t));
    const bloom = smooth(inv(T.smile - .3, T.smile + 2.2, t)) * (1 - .4 * smooth(inv(T.ok, T.end, t)));
    const arms = smooth(inv(T.love - .3, T.love + 1.6, t)) * (1 - smooth(inv(T.ok + 1, T.ok + 4, t)) * .55);
    const cx = kf(t, [[T.dream, 960], [T.smile, 930], [T.love, 900], [T.kids, 920], [T.ok, 980], [T.end, 1010]]);
    const cy = kf(t, [[T.dream, 600], [T.smile, 520], [T.love, 470], [T.kids, 440], [T.ok, 500], [T.end, 590]]);
    const z = kf(t, [[T.dream, 1.04], [T.smile, 1.1], [T.love, 1.16], [T.kids, 1.12], [T.ok, 1.12], [T.end, 1.0]]);
    cam(cx, cy, z);
    sky(t, spread);
    stars(t, spread);
    spiral(t, smooth(inv(T.love, T.sky + 1.8, t)));
    moon(t, bloom);
    hills(t);
    town(t, smooth(inv(T.ok, T.away, t)));
    tree(t);
    kids(t);
    her(t, 720, 862, 1.05, arms);
    paintSet({ waveK: .45 + .25 * spread, wave: [.55, .005, .0016, .45], dash: .55 + .35 * spread });
  }

  chapter('sky', T.dream, T.end, [[T.dream, scene]], {
    paint: { ground: .45, groundCol: '#0a1236', gap: .2, fauve: .55, impasto: .75, light: [-.6, -.8], boil: 4, bloom: 1.1, grain: .03, vig: .26,
      shadowTint: '#2a1f6e', hiTint: '#ffe58a', flowK: 1, inkSoft: .4 },
  });
})();
