// 13.0 - 58.0  "put on hold" / "take a seat" / "can't wait until tomorrow" / first "we've got time".
// The waiting hall, his ticket, the high window, and the first daydream: the roof tears open.
(() => {
  // ---- shots ----
  // 13.0  the hall. He comes in from the left with his case, past the hold-music horn, to the number machine.
  function hall(t, lt) {
    cam({ z: kf(t, [[13, -1.2], [27.4, .6]], ease.sine), y: -.15, vy: 480 });
    room(t); duct(-3.6, -2.1, .5, 0, FAR); duct(2.8, -2.25, .32, 0, FAR, STEEL_D); tube(t); board(t);
    rows(t, 2.2, 8); horn(t); clock(t, -6.95 + .01, -1.0, 16); ticketBox();
    const x = kf(t, [[13.6, -5.2], [22.8, 3.0]], (k) => k), walking = t < 22.8 && t > 13.6;
    man(x, 5.6, { ph: (t - 13.6) * .95, walk: walking ? 1 : 0, face: 1, arm: smooth(inv(24.5, 26.2, t)) * (1 - smooth(inv(26.6, 27.3, t))) });
  }
  // 27.55 "told me to take a seat": closer. Ticket out, he crosses to the empty chair and becomes one of them.
  function seat1(t, lt) {
    cam({ x: 1.9, z: kf(t, [[27.4, 1.2], [39.5, 2.6]], ease.sine), y: -.25, f: 1100, vy: 500 });
    room(t); duct(-3.6, -2.1, .5, 0, FAR); duct(2.8, -2.25, .32, 0, FAR, STEEL_D); tube(t); board(t);
    const sat = t >= 30.4;
    rows(t, 2.2, 8, 0); if (sat) seat(2.2, 8, 'me', true);
    clock(t, -6.95, -1.0, 16); ticketBox();
    if (!sat) {
      const k = inv(28.2, 30.4, t), x = lerp(3.0, 2.2, k), z = lerp(5.6, 7.9, k);
      man(x, z, { ph: (t - 28.2) * 1.1, walk: t > 28.2 ? 1 : 0, face: -1, arm: t < 28.2 ? 1 - smooth(inv(27.6, 28.2, t)) : 0, ticket: t > 27.8 });
    }
  }
  // 39.55 "but I can't wait until tomorrow": his ticket against the board, then up to the one high window.
  function wait1(t, lt) {
    const pan = ease.inOut(inv(41.4, 43.4, t)) * 1500;
    withT(() => {
      s.translate(0, pan);
      s.fillStyle = '#8f9886'; s.fillRect(-100, -1800, W + 200, 3200);
      for (let y = -1680; y < 1100; y += 120) for (let x = 0; x < W; x += 240) { s.globalAlpha = .5; ink([[x, y], [x + 240, y]], 1.2); ink([[x + (y / 120 % 2 ? 120 : 0), y], [x + (y / 120 % 2 ? 120 : 0), y + 120]], 1.2); s.globalAlpha = 1; }
      // the board, blurred behind
      withT(() => { s.globalAlpha = .55; shape([[980, 120], [1780, 120], [1780, 470], [980, 470]], BRASS, 4); shape([[1010, 150], [1750, 150], [1750, 440], [1010, 440]], '#1f201c', 2);
        s.fillStyle = AMBER; s.textAlign = 'center'; s.font = 'bold 210px Futura, sans-serif'; s.fillText('0002', 1380, 410); });
      // his gloved hand and the ticket, sharp in front
      withT(() => {
        s.translate(560 + Math.sin(t * 1.3) * 6, 760 + Math.sin(t * 2.1) * 4); s.rotate(-.12);
        shape([[-60, -150], [330, -170], [345, 120], [-40, 140]], CREAM, 3);
        s.fillStyle = INK; s.textAlign = 'center'; s.font = '34px "American Typewriter", Courier, serif'; s.fillText('MINISTRY OF WAITING', 140, -95);
        s.font = 'bold 92px "American Typewriter", Courier, serif'; s.fillText('7 436 912', 140, 20);
        s.font = '26px "American Typewriter", Courier, serif'; s.fillText('PLEASE REMAIN SEATED', 140, 85);
        for (let i = 0; i < 9; i++) dot(-40, -125 + i * 30, 6, '#8f9886');   // the perforation
        shape([[-420, 120], [-150, 20], [-100, 260], [-420, 330]], COAT, 3);                  // coat sleeve
        hatch([[-420, 200], [-130, 120], [-100, 260], [-420, 330]], .9, 9, 1.4, .45);
        s.beginPath(); s.ellipse(-110, 70, 120, 95, -.35, 0, TAU); s.fillStyle = '#3a382f'; s.fill(); s.lineWidth = 3; s.strokeStyle = INK; s.stroke();   // gloved fist
        s.beginPath(); s.ellipse(-5, 30, 70, 30, -.2, 0, TAU); s.fillStyle = '#3a382f'; s.fill(); s.stroke();     // thumb on the ticket
        ink([[-150, 40], [-60, 20]], 2); ink([[-160, 85], [-70, 70]], 2);
      });
      // up the wall: one small high window, and the sky in it
      withT(() => {
        const wx = 360, wy = -1180, ww = 300, wh = 360;
        s.fillStyle = vgrad(wy, wy + wh, [[0, SKY_T], [1, SKY_B]]); s.fillRect(wx, wy, ww, wh);
        withT(() => { s.beginPath(); s.rect(wx, wy, ww, wh); s.clip(); cloud(wx + 60 + (t - 41) * 22, wy + 170, 60, 4); });
        s.lineWidth = 14; s.strokeStyle = INK; s.strokeRect(wx, wy, ww, wh);
        ink([[wx + ww / 2, wy], [wx + ww / 2, wy + wh]], 8);
        ink([[wx, wy + wh / 2], [wx + ww, wy + wh / 2]], 7);
        shape([[wx - 30, wy + wh], [wx + ww + 30, wy + wh], [wx + ww + 40, wy + wh + 30], [wx - 40, wy + wh + 30]], '#6b6a5a', 3);
      });
    });
  }
  // 43.78 "we've got time": he stands in his row, the roof tears open on the first "time", wider on
  // the second, and every form in the room goes up. 51.67 "for our lips to meet": his ticket folds into a plane.
  function roof(t, lt) {
    cam({ x: .6, z: kf(t, [[43.75, 2.0], [58, -1.0]], ease.sine), y: kf(t, [[43.75, -.3], [58, .4]], ease.sine), f: 860, vy: kf(t, [[43.75, 480], [58, 640]], ease.sine) });
    room(t); duct(-3.6, -2.1, .5, 0, FAR); duct(2.8, -2.25, .32, 0, FAR, STEEL_D); tube(t); board(t, '0003');
    const open = .18 * ease.back(inv(44.96, 45.6, t)) + .3 * ease.back(inv(47.9, 48.7, t)) + .25 * ease.out(inv(51.6, 56, t));
    skyHole(t, open);
    rows(t, 2.2, 8);
    // he stands up out of his row
    const up = ease.out(inv(43.8, 44.6, t));
    if (up > 0) { const b = P(2.2, FL, 8); seat(2.2, 8, null); withT(() => { s.translate(0, (1 - up) * .6 * b[2]); man(2.2, 8, { face: -1, arm: smooth(inv(51.2, 51.7, t)) * (1 - smooth(inv(52.2, 52.6, t))), ticket: t < 51.7 }); }); }
    papers(t, 47.9);
    // the paper plane, out of his hand and up through the hole
    if (t >= 51.67) {
      const lt2 = t - 51.67, b = P(2.2, -.4, 8);
      const x = b[0] - lt2 * 120 + Math.sin(lt2 * 1.4) * 70, y = b[1] - lt2 * 150 - lt2 * lt2 * 8;
      withT(() => { s.translate(x, y); s.rotate(-.5 + Math.sin(lt2 * 1.4) * .25); const sc = Math.max(.35, 1 - lt2 * .12);
        s.scale(sc, sc); shape([[0, 0], [-120, -22], [-90, 0], [-120, 26]], CREAM, 2.5); ink([[0, 0], [-90, 0]], 1.5); });
    }
  }

  chapter('hall', 13.0, 58.0, [[13.0, hall], [27.55, seat1], [39.55, wait1], [43.75, roof]]);
})();
