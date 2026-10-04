// SECTION J2 (v4, new): frames 7911-8191 (329.625-341.2917 s). The end of the monologue, switched to kawaii.
// Instrumental after "...guessing as much as anybody else." (ends 329.48); drum hits from stems.js.
//   J2a 329.625 everyone floats (wide): the kawaii anchorman, a boxy little grey-bearded man in a navy coat
//               with a kaomoji face, floats up through a pastel dusk sky; cups, pages, clouds and a few
//               other kawaii floaters (a teapot, a cat, a suitcase) drift past.
//   J2b 332.625 (drum hit) closer on him, still rising, arms paddling, a page and a cup sailing by.
//   J2c 335.625 night cabin: he is asleep by an oval window, moonlit clouds outside, blanket, little z's.
//               339.08 (drum hit) the seat-belt sign dings: it glows, a heart and a star pop; he smiles
//               in his sleep. Clean last frame at 341.29 for the cut into the black box.
(() => {
  const J0 = 7911 / 24, J1 = 8191 / 24, CUT1 = 332.625, CABIN = 335.625, DING = 339.083;
  const SKIN = '#f8d9bf', NAVY = '#3f4f86', BEARD = '#dcdbe3', HAIR = '#c9c7d3';

  // the anchorman: (x, y) = centre of his body; o: t, eyes, mouth, arms (paddle phase), sleep, tilt
  function anchorman(x, y, kk, o = {}) {
    const { t = 0, eyes = 'dot', mouth = 'smile', arms = 0, tilt = 0, open = 0, legs = true } = o;
    push(); tr(x, y); sc(kk); rot(tilt); seedAt(12000);
    if (legs) for (const sx of [-1, 1]) { const sw = Math.sin(t * 3 + sx) * .15; push(); tr(sx * 48, 150); rot(sw); shape(rrect(-20, 0, 40, 70, 14, 12001 + sx), '#4a4f66', 5); shape(rrect(-28, 58, 56, 26, 12, 12003 + sx), '#2e2a35', 5); pop(); }
    shape(rrect(-120, -60, 240, 230, 60, 12010), NAVY, 7);                                  // the coat, a soft box
    for (const sx of [-1, 1]) { const a = -sx * (.95 + Math.sin(t * 4 + arms + sx) * .35 * (o.paddle ?? 1)); push(); tr(sx * 112, -30); rot(a); shape(rrect(-22, 0, 44, 120, 20, 12005 + sx), NAVY, 5.5); shape(ell(0, 128, 22, 22, 14), SKIN, 4.5); pop(); }
    shape([[-34, -60], [34, -60], [0, 20]], '#fffaf2', 4.5); shape([[-10, -40], [10, -40], [6, 30], [0, 42], [-6, 30]], PAL.coral, 4); // shirt and a little tie
    for (const by of [60, 110]) inkFill(ell(0 + 64, by, 7, 7, 10), '#d8c58a');
    shape(rrect(-110, -300, 220, 250, 70, 12020), SKIN, 7);                                  // the head, a rounded box
    shape(rrect(-112, -312, 224, 64, 32, 12021), HAIR, 6);                                   // grey hair on top
    const B = [[-96, -112], [-50, -100], [0, -96], [50, -100], [96, -112], [104, -70], [70, -30], [0, -10], [-70, -30], [-104, -70]];
    shape(B, BEARD, 6);                                                                      // the grey beard
    face(0, -200, 50, { eyes, mouth, open, t, w: 6, blush: .9, mouthDy: 1.05, blushDy: .55 });
    pop();
  }
  function cup(x, y, kk, a, sd, col = PAL.white) { push(); tr(x, y); sc(kk); rot(a); seedAt(sd); shape(ell(0, 40, 70, 16, 18), col, 4.5); shape([[-50, -30], [50, -30], [36, 34], [-36, 34]], col, 5); ink(ell(60, 0, 20, 22, 14), true, 5); paint(ell(0, -30, 46, 10), '#b98a62', .8, false); face(0, 4, 13, { eyes: 'happy', w: 3.5, blush: .8 }); pop(); }
  function page(x, y, kk, a, sd) { push(); tr(x, y); sc(kk, kk * (.6 + .4 * Math.abs(Math.cos(a * 2)))); rot(a); seedAt(sd); shape(rrect(-60, -80, 120, 160, 8, sd), '#fffaf2', 4); for (let i = 0; i < 6; i++) ink([[-42, -54 + i * 22], [42 - 30 * hash(sd + i), -54 + i * 22]], false, 2.5, { col: '#8a86a0' }); pop(); }
  function teapot(x, y, kk, a, t) { push(); tr(x, y); sc(kk); rot(a); seedAt(12100); shape(ell(0, 0, 90, 70, 24), PAL.mint, 6); shape([[80, -10], [140, -50], [150, -40], [90, 20]], PAL.mint, 5); ink(ell(-100, 0, 26, 34, 14), true, 6); shape(ell(0, -72, 30, 14, 14), PAL.pink, 4.5); face(0, -4, 22, { eyes: 'happy', w: 4.5 }); pop(); }
  function cat(x, y, kk, a, t) { push(); tr(x, y); sc(kk); rot(a); seedAt(12200); shape([[-70, -40], [-50, -110], [-20, -50]], PAL.peach, 5); shape([[70, -40], [50, -110], [20, -50]], PAL.peach, 5); shape(rrect(-80, -60, 160, 130, 50, 12201), PAL.peach, 6); ink(quadPts([80, 30], [150, 10 + Math.sin(t * 3) * 20], [130, -50]), false, 8); face(0, 0, 26, { eyes: 'happy', mouth: 'cat', w: 4.5 }); pop(); }
  function suitcase(x, y, kk, a) { push(); tr(x, y); sc(kk); rot(a); seedAt(12300); ink(rrect(-30, -90, 60, 40, 14), true, 7); shape(rrect(-90, -60, 180, 120, 20, 12301), PAL.coral, 6); paint(rrect(-90, -10, 180, 16, 6), PAL.lemon, 1, false); face(0, 18, 18, { eyes: 'dot', w: 4, blush: .8 }); pop(); }
  const wrapT = (v, m) => ((v % m) + m) % m;

  // ------------------------------------------------------------ J2a / J2b: everyone floats
  function floats(t) {
    t = onTwos(t); TB = Math.floor(t * 12);
    fx({ seed: 13.1, wet: .4 });
    const close = t >= CUT1, rise = (t - J0) * 160;                               // the world sinks past as he rises
    skyWash(-200, H + 200, '#cbb6e6', '#f9c9a8', 131, ['#d6c6ec', '#fbe2ae', '#f6c3c6', '#cfe3f3']);
    // clouds drifting down past
    for (let i = 0; i < 9; i++) { const x = (i * 263 + 90) % W, y = wrapT(i * 197 + rise * (.5 + .1 * (i % 3)), H + 400) - 200; cloud(x, y, (.6 + .3 * hash(i)) * (close ? 1.3 : 1), 13000 + i, i % 3 === 0, t); }
    const r = rng(1313);
    // cups and pages fluttering down (relative motion)
    for (let i = 0; i < 8; i++) { const x = r() * W, sp = .7 + r() * .6, y = wrapT(r() * (H + 300) + rise * sp, H + 300) - 150, a = Math.sin(t * 1.5 + i) * .5; if (close && Math.abs(x - 960) < 330 && y > 120 && y < 620) continue; if (i % 2) cup(x, y, close ? .8 : .55, a, 13100 + i, [PAL.white, PAL.blue, PAL.pink][i % 3]); else page(x, y, close ? .9 : .6, a + t, 13200 + i); }
    if (!close) {
      teapot(330 + Math.sin(t) * 30, 330 + Math.sin(t * .8) * 30, .8, Math.sin(t * .9) * .2, t);
      cat(1600 + Math.sin(t * .7) * 30, 260 + Math.sin(t * 1.1) * 25, .9, Math.sin(t * .6) * .25, t);
      suitcase(1450 + Math.sin(t * .9) * 25, 860 - Math.sin(t * .7) * 30, .8, Math.sin(t * .8) * .3);
      anchorman(960, 560 - Math.sin(t * 1.3) * 30, .95, { t, eyes: 'happy', mouth: 'smile', tilt: Math.sin(t * .9) * .08 });
    } else {
      anchorman(960, 640 - Math.sin(t * 1.3) * 24, 1.55, { t, eyes: 'dot', lookY: -1, mouth: 'o', tilt: Math.sin(t * .9) * .06 });
    }
    // sparkles, quietly
    for (let i = 0; i < 10; i++) { const x = (i * 199 + 40) % W, y = (i * 113 + 70) % 700, tw = Math.sin(t * 4 + i * 1.7); if (tw < .4) continue; seedAt(13300 + i); const st = []; for (let j = 0; j < 8; j++) { const a = j / 8 * TAU, q = j % 2 ? 5 : 16 * tw; st.push([x + Math.cos(a) * q, y + Math.sin(a) * q]); } shape(st, '#fff6c8', 3); }
  }

  // ------------------------------------------------------------ J2c: the night cabin
  function cabin(t) {
    t = onTwos(t); TB = Math.floor(t * 12);
    fx({ seed: 13.7, wet: .36 });
    s.fillStyle = vgrad(0, H, [[0, '#4b4f7d'], [1, '#6d6696']]); s.fillRect(-W, -H, W * 3, H * 3);
    // the cabin wall and the oval window with moonlit clouds outside
    seedAt(13400); shape(rrect(-60, -60, W + 120, H + 120, 0, 13400), '#7d79a8', 0);
    const wx = 1360, wy = 430, WR = [230, 300];
    shape(ell(wx, wy, WR[0] + 40, WR[1] + 40, 40), '#d9d4ea', 7);
    const win = ell(wx, wy, WR[0], WR[1], 40);
    shape(win, '#223060', 6);
    s.save(); k.save(); [s, k].forEach((c) => { c.beginPath(); win.forEach(([a, b], i) => i ? c.lineTo(a, b) : c.moveTo(a, b)); c.closePath(); c.clip(); });
    s.fillStyle = vgrad(wy - WR[1], wy + WR[1], [[0, '#1f2b5c'], [1, '#4a4f8f']]); s.fillRect(wx - 300, wy - 360, 600, 720);
    paint(ell(wx + 80, wy - 150, 54, 54), '#fff3c4', 1, false); shape(ell(wx + 80, wy - 150, 54, 54), '#fff3c4', 4); face(wx + 80, wy - 150, 14, { eyes: 'happy', w: 3.5, blush: .7 });
    for (let i = 0; i < 6; i++) { const x = wx - 340 + wrapT(i * 170 - (t - CABIN) * 60, 900), y = wy - 40 + (i % 3) * 110; cloud(x, y, .55, 13410 + i, false, t, '#c9c9e6'); }
    for (let i = 0; i < 9; i++) { const sx2 = wx - 200 + (i * 53) % 400, sy2 = wy - 260 + (i * 97) % 260, tw = Math.sin(t * 3 + i); if (tw > .2) dot(sx2, sy2, 3 + tw * 2, '#fff6c8'); }
    s.restore(); k.restore();
    paint(ell(wx - 80, wy - 180, 50, 26), '#ffffff', .25, false);
    // the seat-belt sign overhead: glows and dings at 339.08 with a heart and a star
    const on = t >= DING, glow = hit(t, DING, 3);
    seedAt(13450); shape(rrect(330, 70, 330, 120, 30, 13450), on ? '#fff0b0' : '#9a96b8', 6);
    push(); tr(495, 130); seedAt(13451); ink([[-40, -40], [-30, 20], [30, 20], [34, 40]], false, 7); ink([[-36, 20], [-36, 42]], false, 6); ink([[-44, -6], [24, 16]], false, 5); inkFill(rrect(-6, -2, 16, 12, 3)); pop(); // a little seat with its belt clicked
    if (on) { alpha(glow * .6); paint(ell(495, 130, 260, 150), '#fff2a8', .6, false); alpha(1); popRing(495, 130, t, DING, 140, PAL.lemon, 13460);
      const g = ease.back(inv(DING, DING + .3, t)), fl = (t - DING) * 40; heart(720, 100 - fl, 34 * g, PAL.pink, 4); push(); tr(280, 110 - fl); rot((t - DING) * 2); seedAt(13470); const st = []; for (let j = 0; j < 10; j++) { const a = -Math.PI / 2 + j / 10 * TAU, q = (j % 2 ? 18 : 40) * g; st.push([Math.cos(a) * q, Math.sin(a) * q]); } shape(st, PAL.lemon, 4); pop(); }
    // his seat, him asleep, a blanket, little z's rising
    seedAt(13500); shape(rrect(380, 300, 640, 900, 120, 13500), '#9fc6e6', 7); shape(rrect(430, 330, 540, 150, 60, 13501), '#fffaf2', 5);
    const br = Math.sin((t - CABIN) * 1.6), smile = on && t > DING + .3;
    anchorman(700, 720 + br * 6, 1.25, { t, eyes: 'smug', mouth: smile ? 'smile' : 'o', open: 0, tilt: .16 + br * .015, paddle: 0, legs: false, sing: false });
    seedAt(13510); shape([[420, 760], [990, 740], [1010, 1120], [400, 1120]], PAL.lilac, 6);
    for (let i = 0; i < 5; i++) { const x = 440 + i * 140, y = 860 + (i % 2) * 90; paint(ell(x, y, 22, 22), '#ffffff', .4, false); }
    seedAt(13520); shape(rrect(330, 1000, 760, 120, 30, 13520), '#86b3d8', 6);                 // armrest / seat edge
    for (let i = 0; i < 3; i++) { const t0 = CABIN + .4 + i * .9; const dt = wrapT(t - t0, 2.7); if (t < t0) continue; alpha(clamp(1.6 - dt * .7)); popWord('z', 880 + dt * 60 + i * 20, 390 - dt * 90, 70 + i * 12, '#e6e1f6', t, t0 + Math.floor((t - t0) / 2.7) * 2.7, 90 + i); alpha(1); }
  }

  chapter('j2', J0 - .01, J1, [[J0 - .01, floats], [CABIN, cabin]]);
})();
