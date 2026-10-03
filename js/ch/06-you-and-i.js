// 170.0 - 181.5  "I bet you and I, we don't complain". Back down in the grey hall: he and she, across
// the aisle, each handed a complaint form. She types the line onto hers; both tear them in half on
// the same beat, and trade a small nod. Quiet before the chant.
(() => {
  const FORM_T = 'COMPLAINT  FORM C-12';
  const L1 = 'I BET YOU AND I,', L2 = 'WE DON\'T COMPLAIN';
  // characters typed by song time, a word at a time on its sung syllable
  const WORDS = [[170.66, 2], [171.64, 6], [171.82, 10], [172.18, 14], [172.62, 16], [174.30, 19], [174.56, 25], [174.82, 33]];
  function typedN(t) { let n = 0, prev = 0; for (const [w, c] of WORDS) { if (t >= w) n = lerp(prev, c, clamp((t - w) / .16)); prev = c; } return n; }

  // where man()'s near hand lands (mirrors the kit's arm maths), so he can hold a paper
  function manHand(x, z, face, arm) {
    const b = P(x, FL, z), k = b[2], sh = b[1] - 1.45 * k, shp = [b[0] + .02 * k * face, sh + .12 * k];
    const ang = lerp(0, 1.9, arm) * face, el = [shp[0] + Math.sin(ang) * .36 * k, shp[1] + Math.cos(ang) * .36 * k];
    return [[el[0] + Math.sin(ang * 1.1) * .34 * k, el[1] + Math.cos(ang * 1.1) * .34 * k], k];
  }
  // tilt a figure from its feet: a small bow / nod
  function bow(x, z, ang, fn) { const b = P(x, FL, z); withT(() => { s.translate(b[0], b[1]); s.rotate(ang); s.translate(-b[0], -b[1]); fn(); }); }
  function paper(x, y, w, h, rot) { withT(() => { s.translate(x, y); s.rotate(rot); shape([[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]], CREAM, 1.6);
    s.globalAlpha = .5; for (let i = 1; i < 4; i++) ink([[-w * .35, -h / 2 + i * h / 4.5], [w * .35, -h / 2 + i * h / 4.5]], 1); }); }

  // the hall, side on across the aisle. torn: 0 whole forms in hand, 1 halves on the floor.
  function across(t, lt, { torn = 0, z0 = 0, nodT = [] } = {}) {
    cam({ x: .2, z: z0, y: .45, f: 900, vy: 600 });
    room(t); duct(-3.6, -2.1, .5, 0, FAR); duct(2.8, -2.25, .32, 0, FAR, STEEL_D); tube(t); board(t, '0004');
    rows(t); clock(t, -6.95, -1.0, 26);
    const nod = nodT.reduce((a, n) => a + Math.sin(Math.PI * clamp((t - n) / .55)), 0);
    // him, standing in the aisle facing her
    const arm = torn ? 0 : .55;
    bow(-2.4, 5.4, nod * .07, () => man(-2.4, 5.4, { face: 1, arm }));
    if (!torn) { const [h, k] = manHand(-2.4, 5.4, 1, arm); paper(h[0] + .12 * k, h[1] - .12 * k, .34 * k, .44 * k, -.15); }
    // her, at her desk
    desk(2.2, 5.4, -1);
    let hand;
    bow(2.95, 5.4, -nod * .06, () => { hand = woman(2.95, 5.4, { seated: true, face: -1, rose: 1, arm: torn ? 0 : .35 + beatPulse(t) * .1 }).hand; });
    if (torn) { // the halves where they fell
      const a = P(-2.0, FL, 5.0), b = P(2.4, FL, 4.8), k = a[2];
      for (const [p, sd] of [[a, -1], [a, 1], [b, -1], [b, 1]]) withT(() => { s.translate(p[0] + sd * .22 * k, p[1] - .015 * k); s.scale(1, .3); shape([[-.1 * k, -.2 * k], [.1 * k, -.18 * k], [.08 * k, .2 * k], [-.1 * k, .2 * k]], CREAM, 1.4); });
    }
  }
  // 170.0  the two of them across the aisle, each with a complaint form
  function aisle(t, lt) { across(t, lt, { z0: lerp(1.0, 1.3, lt / 1.4) }); }
  // 171.40  close on her typewriter: she types the line onto her complaint form
  function typing(t, lt) {
    fill('#88917f');
    withT(() => { s.globalAlpha = .45; for (let y = 0; y < H; y += 120) { ink([[0, y], [W, y]], 1.2); for (let x = (y / 120) % 2 ? 120 : 0; x < W; x += 240) ink([[x, y], [x, y + 120]], 1.2); } });
    shape([[-50, 880], [W + 50, 880], [W + 50, H + 50], [-50, H + 50]], '#5d5a4c', 4);
    const n = typedN(t), str = (L1 + ' ' + L2);
    const lines = [L1, L2], typed = n <= 16 ? n : 16 + Math.max(0, n - 17);
    const strike = (n % 1 > 0 && n < 33) ? 1 - (n % 1) : 0;
    typewriter(960, 900, 820, { strike, paper: { lines, typed, title: FORM_T, scroll: n > 17 ? 20 : 0 } });
    // her hands at the keys, rose at the cuffs
    for (const sd of [-1, 1]) { const up = sd < 0 ? strike : beatPulse(t) * .4;
      const hx = 960 + sd * 170, hy = 790 - up * 30;
      shape([[hx + sd * 240, 1100], [hx + sd * 330, 1100], [hx + sd * 40, hy + 10], [hx - sd * 20, hy - 20]], '#77756a', 3);
      shape([[hx - sd * 26, hy - 30], [hx + sd * 30, hy - 4], [hx + sd * 50, hy + 22], [hx - sd * 6, hy - 4]], ROSE, 2.5);
      if (window.PNC_ON) PNCK.ball(hx - sd * 40, hy - 40, 36, SKIN, 1.2); else { s.beginPath(); s.ellipse(hx - sd * 40, hy - 40, 46, 26, sd * .5, 0, TAU); s.fillStyle = SKIN; s.fill(); s.lineWidth = 3; s.strokeStyle = INK; s.stroke(); } }
    void str;
  }
  // 174.95  split screen, mirrored: his blank form, her typed one. On the beat both tear in half.
  const TEAR = 175.63;
  function tearForm(cx, cy, lines, typed, side, t, hands) {
    const w = 520, hgt = 640, k = ease.out(inv(TEAR, TEAR + .25, t)), fall = Math.max(0, t - TEAR - .25);
    const jag = []; for (let i = 0; i <= 12; i++) jag.push([(hash(i * 13 + (side > 0 ? 5 : 0)) - .5) * 26, -hgt / 2 + i * hgt / 12]);
    for (const half of [-1, 1]) withT(() => {
      s.translate(cx + half * k * 70 + half * fall * 60, cy + fall * fall * 900); s.rotate(half * (k * .22 + fall * .8));
      s.beginPath(); if (half < 0) { s.moveTo(-w, -hgt); jag.forEach(([x, y]) => s.lineTo(x, y)); s.lineTo(-w, hgt); } else { s.moveTo(w, -hgt); jag.forEach(([x, y]) => s.lineTo(x, y)); s.lineTo(w, hgt); } s.closePath(); s.clip();
      form(-w / 2, -hgt / 2, w, lines, { typed, title: FORM_T, size: 34, h: hgt });
      text('COMPLAINT', 0, hgt / 2 - 120, 70, { font: 'sign', spacing: 6, max: w - 60 });
      text('SIGNED ____________', 0, hgt / 2 - 50, 26, { font: 'type', max: w - 60 });
      if (k > 0) ink(jag, 2);
      hands(half);
    });
  }
  function split(t, lt) {
    // left: his panel; right: hers
    for (const side of [-1, 1]) withT(() => {
      const x0 = side < 0 ? 0 : W / 2;
      s.beginPath(); s.rect(x0, 0, W / 2, H); s.clip();
      s.fillStyle = side < 0 ? '#7f8478' : '#88917f'; s.fillRect(x0, 0, W / 2, H);
      withT(() => { s.globalAlpha = .4; for (let y = 0; y < H; y += 120) ink([[x0, y], [x0 + W / 2, y]], 1.2); });
      const cx = x0 + W / 4, cy = 520;
      const lines = side < 0 ? ['', ''] : [L1, L2];
      tearForm(cx, cy, lines, side < 0 ? 0 : 99, side, t, (half) => {
        const hx = half * 250, hy = -150;
        if (side < 0) { // gloved fists, coat sleeves
          shape([[hx + half * 40, hy + 30], [hx + half * 200, hy + 600], [hx + half * 330, hy + 600], [hx + half * 90, hy - 20]], COAT, 3);
          if (window.PNC_ON) PNCK.ball(hx, hy, 66, '#3a382f', 1.2); else { s.beginPath(); s.ellipse(hx, hy, 62, 74, 0, 0, TAU); s.fillStyle = '#3a382f'; s.fill(); s.lineWidth = 3; s.strokeStyle = INK; s.stroke(); }
        } else { // her hands, rose cuffs
          shape([[hx + half * 40, hy + 40], [hx + half * 200, hy + 600], [hx + half * 320, hy + 600], [hx + half * 80, hy - 10]], '#77756a', 3);
          shape([[hx + half * 30, hy + 20], [hx + half * 100, hy - 20], [hx + half * 120, hy + 30], [hx + half * 50, hy + 70]], ROSE, 2.5);
          if (window.PNC_ON) PNCK.ball(hx, hy, 52, SKIN, 1.2); else { s.beginPath(); s.ellipse(hx, hy, 46, 58, 0, 0, TAU); s.fillStyle = SKIN; s.fill(); s.lineWidth = 3; s.strokeStyle = INK; s.stroke(); }
        }
      });
    });
    if (window.PNC_ON) { shape([[W / 2 - 9, 0], [W / 2 + 9, 0], [W / 2 + 9, H], [W / 2 - 9, H]], BRASS, 1); for (let y = 90; y < H; y += 180) PNCK.star(W / 2, y, 22, CREAM, 1); } else line([[W / 2, 0], [W / 2, H]], INK, 10, 'butt');
  }
  // 177.00  wide again: the halves on the floor, a look across, a small nod each. Hold.
  function after(t, lt) { across(t, lt, { torn: 1, z0: lerp(1.3, 1.9, ease.sine(lt / 4.5)), nodT: [177.93, 179.47] }); }

  chapter('you-and-i', 170.0, 181.5, [[170.0, aisle], [171.40, typing], [174.95, split], [177.0, after]]);
})();
