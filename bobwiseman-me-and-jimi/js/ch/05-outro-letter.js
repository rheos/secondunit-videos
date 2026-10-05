// 243.2 - 282.54  OUTRO, legs 4 and 5 (letterpress, back where the video began).
//   243.2  pole      dawn again at the telephone pole from verse 1. A letterpress train roars past behind it and
//                    the wind of it tears the bills off one by one: a bill from every world of the video
//                    (ME AND JIMI, CAFE AU GO GO, KOBE, DEPARTED, ELLEN) flies away. Bare pole by 256
//   258.3  bus       Calgary, first light, the Rockies low in the west. The school bus from verse 1 is parked at the
//                    curb, door open, nobody in it: the driver's seat empty, a glass slide on the dash, her guitar
//                    case standing on the curb by the door. The man in the hat (the narrator) walks up, stops at the door (263.0) and takes his
//                    hat off (265.0). The sun clears the horizon. The music ends at about 270: fade to bare paper
//   271.0  card      her name in wood type; her years stamped on the last sound (276.73)
(() => {
  const T = (x) => onTwos(x, 12);
  const L = () => window.LP;
  function shotPole(t, l) {
    const { wood, rect, pole, wires, sky, sun } = L(), tt = T(t), A = 243.2;
    fx({ fount: .25, reg: .4 * beatPulse(t, 4) });
    sky(.12 + inv(A, 258, t) * .2, .5, .3); sun(1340, 760 - inv(A, 258, t) * 120, 90, 14, tt * .05);
    // the train behind, letterpress carriages streaking right to left, through the whole leg
    const sp = 2400, CAR = 780, x0 = W - (((tt - A) * sp) % CAR);
    for (let c = -1; c < 4; c++) { const x = x0 - c * CAR; rect(x, 470, CAR - 30, 330, c % 2 ? INK.F() : INK.K()); for (let w = 0; w < 4; w++) rect(x + 40 + w * 180, 520, 130, 110, INK.mix(0, .3, 0)); }
    rect(0, 800, W, H - 800, INK.K()); rect(0, 800, W, 14, INK.mix(0, 0, 1));
    wires(tt, 760);
    pole(760, 120, false);
    // the bills: one per world, torn off in turn on the beats from 246
    const BILLS = [['ME AND', 'JIMI', 'F'], ['CAFE AU', 'GO GO', 'B'], ['KOBE', '1950s', 'F'], ['DEPARTED', '1987', 'B'], ['ELLEN', 'TONIGHT', 'F']];
    BILLS.forEach(([a, b, pl], i) => {
      const go = 246 + i * 2.1, k = ease.in(inv(go, go + 1.6, tt)); if (k >= 1) return;
      const bx = 760 + (i % 2 ? 40 : -40) - k * 1900, by = 250 + i * 110 - k * 500 + Math.sin(k * 9) * 60;
      s.save(); s.translate(bx, by); s.rotate((i % 2 ? .05 : -.04) - k * 3); s.fillStyle = INK[pl](.15); s.fillRect(-150, -90, 300, 200);
      wood(a, 0, -40, 250, 50, INK.K()); wood(b, 0, 40, 260, 70, INK[pl]()); s.restore();
    });
    rect(0, 0, W, 10, INK.PAPER);
  }
  function bus(x, y, t) {
    const { wood, rect, rrect, circ } = L();
    s.save(); s.translate(x, y);
    rrect(-640, -430, 1240, 380, 40, INK.F());
    rect(-640, -150, 1240, 18, INK.K()); rect(-640, -110, 1240, 10, INK.K());
    wood('SCHOOL BUS', 60, -395, 420, 46, INK.K());
    for (let i = 1; i < 6; i++) { const wx = -560 + i * 170; rect(wx, -330, 140, 150, INK.mix(0, 0, .25)); rect(wx - 8, -338, 156, 10, INK.K()); rect(wx - 8, -188, 156, 10, INK.K()); }
    // the driver's window: the empty seat, her guitar case standing on it, a glass slide on the dash
    rect(-560, -330, 140, 150, INK.mix(0, 0, .25)); rect(-568, -338, 156, 10, INK.K()); rect(-568, -188, 156, 10, INK.K());
    rect(-520, -250, 70, 70, INK.K());                                                // seat back
    rrect(-450, -205, 22, 30, 6, INK.mix(0, .5, .5));                                 // the slide on the dash
    // the door, open: two leaves folded back
    rect(-640, -330, 70, 290, INK.K()); rect(-632, -320, 54, 270, INK.mix(0, 0, .4));
    rect(-600, -40, 70, 24, INK.K());
    circ(-420, -40, 70, INK.K()); circ(-420, -40, 30, INK.mix(0, 0, .5)); circ(420, -40, 70, INK.K()); circ(420, -40, 30, INK.mix(0, 0, .5));
    s.restore();
  }
  function man(x, y, t, walk, hatOff, carry = false) {
    const { rect } = L(); s.save(); s.translate(x, y);
    const a = Math.sin(t * 7) * .5 * walk; s.fillStyle = INK.K();
    [a, -a].forEach((q) => { s.save(); s.translate(0, -170); s.rotate(q); s.fillRect(-14, 0, 28, 170); s.restore(); });
    s.beginPath(); s.moveTo(-60, -170); s.lineTo(60, -170); s.lineTo(50, -400); s.lineTo(-50, -400); s.closePath(); s.fill();
    s.beginPath(); s.ellipse(0, -440, 40, 46, 0, 0, TAU); s.fill();
    // the hat: on his head, or lifted in his hand held to his chest
    const h = smooth(hatOff);
    s.save(); s.translate(lerp(0, -30, h), lerp(-472, -330, h)); s.rotate(h * -.4); s.beginPath(); s.ellipse(0, 0, 70, 14, 0, 0, TAU); s.fill(); s.fillRect(-42, -58, 84, 60); s.restore();
    if (carry) { s.save(); s.translate(50, -300); s.fillRect(-10, 0, 20, 70); s.fillStyle = INK.mix(0, 0, .7); s.fillRect(-160, 70, 320, 70); s.restore(); }
    s.restore();
  }
  function shotBus(t, l) {
    const { wood, rect, sky, sun } = L(), tt = T(t), A = 258.3, STOP = 263.0, HAT = 265.0;
    const up = inv(A, 270, t);
    fx({ fount: .3 + up * .3, fade: smooth(inv(268.0, 271.0, t)) * (t < 271 ? 1 : 0) });
    sky(.1 + up * .25, .55, .45 - up * .25); sun(1460, 820 - ease.out(up) * 260, 100, 16, tt * .04);
    // the Rockies, low and far, in blue tint
    s.fillStyle = INK.mix(0, 0, .55); s.beginPath(); s.moveTo(0, 760); for (let x = 0; x <= W; x += 60) s.lineTo(x, 700 - 70 * Math.abs(Math.sin(x * .011)) - 40 * noise1(x * .01, 4)); s.lineTo(W, 760); s.closePath(); s.fill();
    rect(0, 760, W, H - 760, INK.K()); for (let i = 0; i < 8; i++) rect(i * 260 + 40, 900, 140, 12, INK.F(.8));
    bus(860, 790, tt);
    // her guitar case, standing on the curb by the open door
    s.save(); s.translate(470, 800); const gc = INK.mix(0, 0, 1);
    s.fillStyle = gc; s.beginPath(); s.ellipse(0, -70, 62, 72, 0, 0, TAU); s.fill(); s.beginPath(); s.ellipse(0, -175, 48, 52, 0, 0, TAU); s.fill();
    s.fillRect(-20, -330, 40, 140); s.beginPath(); s.ellipse(0, -340, 30, 26, 0, 0, TAU); s.fill();
    s.fillStyle = INK.F(); s.fillRect(-26, -128, 52, 8); s.fillRect(-60, -80, 6, 30); s.fillRect(54, -80, 6, 30);   // handle and latches
    s.restore();
    // him: walks in from the right, stops at the door, lifts his hat
    const x = lerp(-220, 110, ease.out(inv(259.0, STOP, tt)));     // from the door side; he stops at the open door
    man(x, 800, tt, tt < STOP ? 1 : 0, inv(HAT, HAT + .8, tt));
  }
  function shotCard(t, l) {
    const { wood, rect } = L(), tt = T(t), YRS = 276.73;
    fx({ fount: .5, fade: 1 - smooth(inv(271.0, 272.2, t)) });
    rect(0, 0, W, H, INK.PAPER);
    wood('ELLEN McILWAINE', W / 2, 470, 1300, 170, INK.K());
    if (tt >= YRS) { const k = 1 + hit(tt, YRS, 16) * .25; s.save(); s.translate(W / 2, 680); s.scale(k, k); wood('1945  -  2021', 0, 0, 640, 90, INK.F()); s.restore(); }
  }
  chapter('outro-l', 243.2, 282.54, [[243.2, shotPole], [258.3, shotBus], [271.0, shotCard]]);
})();
