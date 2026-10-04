// LOOK TEST, 70.5 - 91.0: verse 1. "I'm an airplane on the highway / and I feel so strange / mnuh nuh nuh /
// I'm an airplane on the highway / and I'm sick of the passing lane."
// The plane is built from junk: a tin-can fuselage, a poster-stripe, magazine-paper eyes, cereal-box wings,
// spoon propeller, hubcap wheels. Everything moves in stop motion on twos.
(() => {
  const BEAT = .5667;
  const mouthAt = (t) => clamp(F('voc', Q(t), 1) * 1.5);

  // ---- the junk plane, side on, facing right. (x, y) = where his wheels meet the road; sc ~ px per unit ----
  function plane(t, x, y, sc, { mouth = 0, roll = 0, wobble = 0, id = 1 } = {}) {
    place(t, id, x, y, 0, () => {
      s.scale(sc, sc);
      // far wing (behind), a strip of cereal box
      scrap([[-40, -150], [60, -150], [-10, -60], [-140, -55]], { stock: 'kraft', seed: 3, rim: 2, shadow: .4 });
      // tail fin and tailplane
      scrap([[-330, -170], [-300, -330], [-250, -320], [-230, -170]], { stock: 'green', seed: 5 });
      scrap([[-340, -175], [-200, -180], [-210, -150], [-345, -150]], { stock: 'green', seed: 6, rim: 2 });
      // fuselage: a fat tin can with a rounded nose
      const body = []; for (let i = 0; i <= 20; i++) { const a = -Math.PI / 2 + i / 20 * Math.PI; body.push([170 + Math.cos(a) * 80, -150 + Math.sin(a) * 80]); }
      scrap([[-330, -200], [170, -230], ...body, [170, -70], [-330, -130]], { stock: 'tin', seed: 1, scale: .9 });
      scrap([[-330, -158], [205, -170], [215, -140], [-330, -140]], { stock: 'poster', seed: 2, rim: 2, shadow: .3 });   // the red stripe
      for (let i = 0; i < 5; i++) scrap(circ(-250 + i * 70, -185, 13, 14), { stock: 'night', seed: 20 + i, rim: 2, shadow: .2 }); // cabin windows
      // the face in the windscreen: magazine-paper eyes, ink pupils, painted brows
      for (const [ex, er] of [[85, 36], [148, 32]]) {
        const ey = -205 + Math.sin(t * 9 + ex) * 6 * wobble;
        scrap(circ(ex, ey, er, 24), { stock: 'cream', seed: ex, rim: 3, shadow: .4, tear: 3 });
        const px = ex + 8 + Math.sin(t * 7 + ex) * 9 * wobble, py = ey + 4 - roll * 16 + Math.cos(t * 8 + ex) * 7 * wobble;
        s.fillStyle = '#1b1712'; s.beginPath(); s.arc(px, py, er * .42, 0, TAU); s.fill();
        s.fillStyle = '#f4efe2'; s.beginPath(); s.arc(px - er * .14, py - er * .16, er * .12, 0, TAU); s.fill();
        if (roll > .3) { s.fillStyle = '#9aa0a4'; s.beginPath(); s.ellipse(ex, ey - er * .55, er, er * .55 * roll, 0, Math.PI, TAU); s.fill(); } // heavy lids on the eye roll
        scrap([[ex - er, ey - er - 14 + roll * 6], [ex + er, ey - er - 20 - roll * 4], [ex + er, ey - er - 10 - roll * 4], [ex - er, ey - er - 4 + roll * 6]], { color: '#1b1712', rim: 0, shadow: 0, tear: 2 });
      }
      // the mouth under the nose: a torn red-lipped slit that opens with his voice
      const mh = 6 + mouth * 46;
      scrap([[80, -112 - mh * .3], [175, -120 - mh * .25], [182, -100 + mh * .5], [90, -92 + mh * .7]], { stock: 'poster', seed: 30, rim: 3, shadow: .4, tear: 3 });
      scrap([[90, -106 - mh * .2], [168, -113 - mh * .18], [172, -102 + mh * .38], [98, -96 + mh * .52]], { color: '#2a120c', rim: 0, shadow: 0, tear: 2 });
      // near wing, a longer strip of cereal box, dented tip
      scrap([[-60, -130], [80, -128], [10, -20], [-220, -10], [-230, -30]], { stock: 'kraft', seed: 4, scale: 1.2 });
      scrap([[-205, -24], [-150, -26], [-160, -12], [-212, -10]], { stock: 'mustard', seed: 7, rim: 2, shadow: .2 });
      // spoon propeller on the nose, turning a notch per drawing
      withT(() => { s.translate(258, -150); for (let b = 0; b < 3; b++) withT(() => { s.rotate(Q(t) * 9 + b * TAU / 3); spoon(62, 40 + b); }); scrap(circ(0, 0, 18, 16), { stock: 'mustard', seed: 44, rim: 2 }); });
      // hubcap wheels with white walls
      for (const wx of [-160, 110]) withT(() => { s.translate(wx, -45); s.rotate(-Q(t) * 6); scrap(circ(0, 0, 46, 28), { color: '#16130f', rim: 0, shadow: .6 }); scrap(circ(0, 0, 32, 24), { color: '#efe6cf', rim: 0, shadow: 0, tear: 2 }); hubcap(24, wx > 0 ? 50 : 51); });
    });
  }

  // a cut-out car from an old magazine ad, side on, facing left (they all pass him)
  function car(t, x, y, sc, stock, seed) {
    place(t, 100 + seed, x, y, 0, () => { s.scale(sc, sc);
      scrap([[-150, -40], [-120, -95], [-40, -130], [70, -130], [130, -90], [160, -40], [160, 0], [-150, 0]], { stock, seed });
      scrap([[-50, -115], [60, -115], [100, -85], [-90, -85]], { stock: 'tissue', seed: seed + 1, rim: 2, shadow: .2, alpha: .85 });
      for (const wx of [-90, 100]) withT(() => { s.translate(wx, 0); s.rotate(Q(t) * 12); scrap(circ(0, 0, 30, 20), { color: '#16130f', rim: 0, shadow: .5 }); hubcap(16, seed + wx); });
    });
  }

  // the roadside, scrolling left: sky strips, kraft hills, poster billboards, a newsprint road with cream dashes
  function roadside(t, scroll, { strange = 0 } = {}) {
    table(t, strange > .5 ? 'green' : 'tissue');
    for (let i = 0; i < 6; i++) { const cx = ((i * 420 - scroll * .15) % (W + 600) + W + 600) % (W + 600) - 300; scrap(circ(cx, 160 + (i % 3) * 70, 90 + (i % 2) * 40, 20).map(([px, py]) => [px, py * .9 + 10]), { stock: 'news', seed: 60 + i, shadow: .5 }); } // newsprint clouds
    for (let i = 0; i < 4; i++) { const cx = ((i * 640 - scroll * .3) % (W + 900) + W + 900) % (W + 900) - 450; scrap([[cx - 420, 640], [cx - 120, 470], [cx + 140, 520], [cx + 430, 640]], { stock: 'kraft', seed: 70 + i }); } // hills
    for (let i = 0; i < 3; i++) { const bx = ((i * 900 - scroll * .6) % (W + 1100) + W + 1100) % (W + 1100) - 500;
      ink3([[bx + 30, 640], [bx + 30, 560]], 10); ink3([[bx + 230, 640], [bx + 230, 560]], 10);
      scrap(rect(bx - 40, 400, 340, 170), { stock: i % 2 ? 'poster' : 'brick', seed: 80 + i }); scrap(rect(bx, 430, 120, 110), { stock: 'news', seed: 90 + i, rim: 2, shadow: .3 }); }
    scrap([[-60, 630], [W + 60, 625], [W + 60, 1140], [-60, 1140]], { stock: 'night', seed: 99, tear: 7 });        // the road
    for (let i = 0; i < 12; i++) { const dx = ((i * 300 - scroll) % (W + 300) + W + 300) % (W + 300) - 150; scrap(rect(dx, 868, 150, 22), { stock: 'cream', seed: 110 + i, rim: 1, shadow: .2, tear: 3 }); }
    for (let i = 0; i < 9; i++) { const gx = ((i * 260 - scroll) % (W + 260) + W + 260) % (W + 260) - 130; scrap(rect(gx, 612, 240, 26), { stock: 'tin', seed: 130 + i, rim: 1, shadow: .3, tear: 2 }); } // guardrail
  }
  function ink3(pts, w) { line(pts, '#2a241d', w); }

  // 70.5  "I'm an airplane on the highway / and I feel so strange / mnuh nuh nuh"
  function cruise(t, lt) {
    const strange = smooth(inv(77.2, 77.7, t)) * (1 - smooth(inv(80.4, 80.85, t)));
    roadside(t, Q(t) * 520, { strange });
    const bob = Math.abs(Math.sin(Q(t) * Math.PI / BEAT)) * 6;
    plane(t, 860, 1010 - bob, 1.55, { mouth: mouthAt(t), wobble: strange, id: 1 });
    // cones knocked by the near wing, flying off on each beat
    const i = lastBeat(t); for (let k = Math.max(0, i - 2); k <= i; k++) { const lt2 = Q(t) - FEAT.beats[k]; if (lt2 < 0 || lt2 > 1.2 || k % 2) continue;
      place(t, 200 + k, 540 - lt2 * 520, 1000 - lt2 * 700 + lt2 * lt2 * 600, lt2 * 6, () => scrap([[-22, 0], [22, 0], [6, -60], [-6, -60]], { stock: 'poster', seed: 200 + k, rim: 2 })); }
  }
  // 80.88  "I'm an airplane on the highway / and I'm sick of the passing lane": the passing lane behind a velvet rope
  function lanes(t, lt) {
    roadside(t, Q(t) * 380);
    // the far lane is the passing lane: a velvet rope on brass posts keeps him out
    for (let i = 0; i < 8; i++) { const px = ((i * 320 - Q(t) * 380) % (W + 320) + W + 320) % (W + 320) - 160; withT(() => { s.translate(px, 760); scrap(rect(-8, -70, 16, 70), { stock: 'mustard', seed: 300 + i, rim: 2, shadow: .4 }); scrap(circ(0, -76, 14, 14), { stock: 'mustard', seed: 310 + i, rim: 2 }); }); }
    { const pts = []; for (let x = -200; x < W + 200; x += 20) { const u = ((x + Q(t) * 380) % 320 + 320) % 320 / 320; pts.push([x, 700 + Math.sin(u * Math.PI) * 34]); } line(pts, '#7a1420', 13); line(pts, '#b8283a', 8); }
    // cars zip past in the passing lane on the beat
    for (let k = 0; k < 4; k++) { const t0 = 81.4 + k * 1.7 + (k > 1 ? .2 : 0), lt2 = Q(t) - t0; if (lt2 < 0 || lt2 > 1.6) continue;
      car(t, W + 300 - lt2 * 1800, 735, .6, ['poster', 'green', 'tin', 'brick'][k], 400 + k * 7); }
    // him, in the slow lane, fed up: the eye roll lands on "sick"
    const roll = smooth(inv(86.4, 86.8, t)) * (1 - smooth(inv(88.6, 89.4, t)));
    plane(t, 900, 1075, 1.4, { mouth: mouthAt(t), roll, id: 2 });
  }

  chapter('verse1', 70.5, 91.0, [[70.5, cruise], [80.85, lanes]]);
})();
