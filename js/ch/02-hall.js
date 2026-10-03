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
    man(x, 5.6, { ph: (t - 13.6) * .95, walk: walking ? 1 : 0, face: 1, arm: smooth(inv(24.5, 26.2, t)) }); // still reaching at the cut
  }
  // 27.55 "told me to take a seat": closer. Ticket out, he crosses to the empty chair and becomes one of them.
  function seat1(t, lt) {
    cam({ x: 1.9, z: kf(t, [[27.4, 1.2], [39.5, 2.6]], ease.sine), y: -.25, f: 1100, vy: 500 });
    room(t); duct(-3.6, -2.1, .5, 0, FAR); duct(2.8, -2.25, .32, 0, FAR, STEEL_D); tube(t); board(t);
    const sat = t >= 30.4;
    rows(t, 2.2, 8, 0); if (sat) seat(2.2, 8, 'me', true);
    clock(t, -6.95, -1.0, 16); ticketBox();
    if (!sat) {
      const k = inv(28.4, 30.4, t), x = lerp(3.0, 2.2, k), z = lerp(5.6, 7.9, k);
      man(x, z, { ph: (t - 28.4) * 1.1, walk: t > 28.4 ? 1 : 0, face: t < 28.4 ? 1 : -1, arm: t < 28.4 ? 1 - smooth(inv(27.95, 28.4, t)) : 0, ticket: t > 27.8 });
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
        text('MINISTRY OF WAITING', 145, -95, 34, { max: 320 });
        text('7 436 912', 150, 20, 92, { max: 300 });
        text('PLEASE REMAIN SEATED', 150, 85, 26, { max: 300 });
        for (let i = 0; i < 9; i++) dot(-40, -125 + i * 30, 6, '#8f9886');   // the perforation
        shape([[-420, 120], [-150, 20], [-100, 260], [-420, 330]], COAT, 3);                  // coat sleeve
        hatch([[-420, 200], [-130, 120], [-100, 260], [-420, 330]], .9, 9, 1.4, .45);
        if (window.PNC_ON) { const K = window.PNCK;   // a rounded cartoon glove, airbrushed, fine outline
          K.blob([[-280, 40], [-200, -5], [-90, 15], [-60, 90], [-100, 175], [-230, 190], [-290, 120]], '#3a382f', 1.6);
          K.blob([[-120, 95], [-30, 95], [10, 118], [-20, 145], [-110, 140]], '#3a382f', 1.6);
          for (const [y0, y1] of [[60, 50], [105, 98], [148, 145]]) line([[-245, y0], [-130, y1]], K.dark('#3a382f', .5), 1.4);
        } else {
        s.beginPath(); s.ellipse(-170, 95, 115, 90, -.35, 0, TAU); s.fillStyle = '#3a382f'; s.fill(); s.lineWidth = 3; s.strokeStyle = INK; s.stroke();   // gloved fist
        s.beginPath(); s.ellipse(-55, 120, 58, 26, -.2, 0, TAU); s.fillStyle = '#3a382f'; s.fill(); s.stroke();     // thumb on the ticket
        ink([[-210, 65], [-120, 45]], 2); ink([[-220, 110], [-130, 95]], 2);
        }
      });
      // up the wall: one small high window, and the sky in it
      withT(() => {
        const wx = 360, wy = -1180, ww = 300, wh = 360;
        s.fillStyle = vgrad(wy, wy + wh, [[0, SKY_T], [1, SKY_B]]); s.fillRect(wx, wy, ww, wh);
        withT(() => { s.beginPath(); s.rect(wx, wy, ww, wh); s.clip(); cloud(wx + 60 + (t - 41) * 22, wy + 170, 60, 4); });
        if (window.PNC_ON) { const K = window.PNCK;   // a brass deco frame with a sunburst fan over the window
          K.fan(wx + ww / 2, wy - 6, ww * .55, 7, Math.PI, TAU, [BRASS, CREAM, AMBER], 1.2);
          for (const [x0, y0, x1, y1] of [[wx - 16, wy - 16, wx + ww + 16, wy], [wx - 16, wy + wh, wx + ww + 16, wy + wh + 16], [wx - 16, wy, wx, wy + wh], [wx + ww, wy, wx + ww + 16, wy + wh]]) shape([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], BRASS, 2);
          shape([[wx + ww / 2 - 5, wy], [wx + ww / 2 + 5, wy], [wx + ww / 2 + 5, wy + wh], [wx + ww / 2 - 5, wy + wh]], BRASS, 1.5);
          shape([[wx, wy + wh / 2 - 5], [wx + ww, wy + wh / 2 - 5], [wx + ww, wy + wh / 2 + 5], [wx, wy + wh / 2 + 5]], BRASS, 1.5);
          for (const [bx, by] of [[wx - 8, wy - 8], [wx + ww + 8, wy - 8], [wx - 8, wy + wh + 8], [wx + ww + 8, wy + wh + 8]]) K.ball(bx, by, 9, BRASS, 1);
        } else {
        s.lineWidth = 14; s.strokeStyle = INK; s.strokeRect(wx, wy, ww, wh);
        ink([[wx + ww / 2, wy], [wx + ww / 2, wy + wh]], 8);
        ink([[wx, wy + wh / 2], [wx + ww, wy + wh / 2]], 7);
        }
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
      const lt2 = t - 51.67, b = P(2.2, FL, 8), k = b[2], hx = b[0] - .65 * k, hy = b[1] - 1.61 * k; // his hand, arm out to the left
      const x = hx - lt2 * 120 + Math.sin(lt2 * 1.4) * 70, y = hy - lt2 * 150 - lt2 * lt2 * 8;
      const vx = -120 + Math.cos(lt2 * 1.4) * 98, vy = -150 - lt2 * 16; // its velocity: the nose points where it's going
      withT(() => { s.translate(x, y); s.rotate(Math.atan2(vy, vx)); const sc = Math.max(.3, .55 - lt2 * .05); // hand-sized as it leaves him
        s.scale(sc, sc); shape([[0, 0], [-120, -22], [-90, 0], [-120, 26]], CREAM, 2.5); ink([[0, 0], [-90, 0]], 1.5); });
    }
  }

  chapter('hall', 13.0, 58.0, [[13.0, hall], [27.55, seat1], [39.55, wait1], [43.75, roof]]);
})();
