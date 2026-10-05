// 0.00 - 44.0  verse 1 + the hook, then the band comes in.
// LETTERPRESS HANDBILL. Everything is a cut block or wood type printed in three inks (look.js).
// Motion is on twos (12 a second); look.js re-pulls the print on threes so the ink boils a little.
//   0.00  pole     dawn, a telephone pole thick with old torn handbills; a fresh bill is pasted on,
//                  BOB WISEMAN / ME AND JIMI (his name only here, once)
//   4.37  dice     "good luck with a career in music": two dice tumble down the sidewalk, snake eyes
//                  land on "dice"
//  11.53  bus      "school bus driver": a school bus pulls up past the pole, kids in nightcaps and
//                  striped pyjamas in the windows, a guitar case behind the driver; the stop arm swings
//                  out on "pajamas"
//  19.62  award    "lifetime achievement award": a stage, a gramophone trophy rises into the spotlight,
//                  rays burst on "Grammys"; nobody comes up to take it
//  24.10  hook     a station platform: a hat on a keyboard case ("me"), a left-handed guitar with a
//                  scarf on its headstock ("Jimi"), both turn to the one bill on the wall, and her name
//                  is printed onto it letter by letter
//  BAND   train    the band comes in: the train blasts through, the bills tear off the wall and fly
(() => {
  const BAND = 40.5;       // the band lands (perc + rms jump; it starts building at 38.5)
  const T = (x) => onTwos(x, 12);
  const R = rng(7);

  // ---------- wood type ----------
  // fits str exactly into a w x h box centred on (cx, cy), stretching like wood type set to fill a line
  function wood(str, cx, cy, w, h, ink, font = 'Superclarendon', weight = '900') {
    s.save(); s.font = `${weight} 100px "${font}"`; s.textBaseline = 'alphabetic'; s.textAlign = 'left';
    const m = s.measureText(str);
    const tw = m.actualBoundingBoxRight + m.actualBoundingBoxLeft, th = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
    s.translate(cx - w / 2, cy - h / 2); s.scale(w / tw, h / th);
    s.fillStyle = ink; s.fillText(str, m.actualBoundingBoxLeft, m.actualBoundingBoxAscent); s.restore();
  }
  function rect(x, y, w, h, ink) { s.fillStyle = ink; s.fillRect(x, y, w, h); }
  function rrect(x, y, w, h, r, ink) { s.fillStyle = ink; s.beginPath(); s.roundRect(x, y, w, h, r); s.fill(); }
  function circ(x, y, r, ink) { dot(x, y, r, ink); }

  // ---------- the pole of old bills ----------
  const OLD = [...Array(16)].map((_, i) => ({
    y: 180 + i * 46 + R() * 30, w: 150 + R() * 70, h: 190 + R() * 120, rot: (R() - .5) * .16, dx: (R() - .5) * 60,
    plate: R() < .5 ? 'F' : 'B', tint: .25 + R() * .6, word: ['TONIGHT', 'DANCE', 'LIVE', 'FRIDAY', 'BLUES', 'ADMIT ONE', 'SOLD OUT', 'HALL'][i % 8], tear: R(),
  }));
  function oldBill(b, x, y) {
    withT(() => {
      s.translate(x + b.dx, y); s.rotate(b.rot);
      // torn bottom edge
      s.beginPath(); s.moveTo(-b.w / 2, -b.h / 2); s.lineTo(b.w / 2, -b.h / 2);
      for (let k = 0; k <= 8; k++) s.lineTo(b.w / 2 - k * b.w / 8, b.h / 2 - b.tear * 60 - hash(k + b.y | 0) * 34);
      s.closePath(); s.fillStyle = INK[b.plate](b.tint); s.fill();
      wood(b.word, 0, -b.h / 2 + 40, b.w * .8, 38, INK.K());
      rect(-b.w * .35, -b.h / 2 + 72, b.w * .7, 6, INK.K());
      wood('* * *', 0, -b.h / 2 + 100, b.w * .4, 14, INK.K(.9));
    });
  }
  function pole(x, top, bills = true) {
    rect(x - 34, top, 68, H - top, INK.K());
    rect(x - 34, top, 22, H - top, INK.mix(1, 0, .5));
    rect(x - 150, top + 70, 300, 18, INK.K()); rect(x - 120, top + 150, 240, 14, INK.K());
    if (bills) OLD.forEach((b) => b.y > top + 160 && oldBill(b, x, b.y));
  }
  function wires(t, x) {
    for (let i = 0; i < 3; i++) {
      const y0 = 240 + i * 34;
      s.beginPath(); s.moveTo(-50, y0 + 60); s.quadraticCurveTo(x / 2, y0 + 110 + snoise(t * .5, i) * 6, x, y0);
      s.quadraticCurveTo((x + W) / 2, y0 + 120, W + 50, y0 + 40); s.lineWidth = 4; s.strokeStyle = INK.K(); s.stroke();
    }
  }
  function sky(f0, f1, b = 0) {
    const g = s.createLinearGradient(0, 0, 0, H * .75);
    g.addColorStop(0, INK.mix(0, f0, b)); g.addColorStop(1, INK.mix(0, f1, 0)); s.fillStyle = g; s.fillRect(0, 0, W, H);
  }
  function sun(x, y, r, rays, rot) {
    for (let i = 0; i < rays; i++) withT(() => { s.translate(x, y); s.rotate(rot + i * TAU / rays); poly([[r * 1.15, -9], [r * 2.2, 0], [r * 1.15, 9]], INK.F()); });
    circ(x, y, r, INK.F());
  }

  // ---------- A: the pole, a fresh bill pasted on ----------
  function shotPole(t, l) {
    const tt = T(t);
    fx({ fount: .15 });
    sky(.18, .55, .35); sun(1340, 760 - ease.out(inv(0, 5, tt)) * 90, 90, 14, tt * .05);
    rect(0, 820, W, H - 820, INK.K()); rect(0, 820, W, 14, INK.mix(0, 0, 1));
    for (let i = 0; i < 9; i++) rect(80 + i * 220, 900, 120, 10, INK.mix(0, 0, .55));
    wires(tt, 760); pole(760, 120);
    // the fresh bill: pasted top-down at 0.4, a brush slap on each corner
    const k = ease.out(inv(.4, 1.6, tt)), bx = 760, by = 520, bw = 360, bh = 470;
    if (k > 0) withT(() => {
      s.beginPath(); s.rect(bx - bw / 2, by - bh / 2, bw, bh * k); s.clip();
      rect(bx - bw / 2, by - bh / 2, bw, bh, INK.F(.12));
      rect(bx - bw / 2 + 14, by - bh / 2 + 14, bw - 28, 10, INK.K());
      wood('BOB', bx, by - 160, 300, 70, INK.K());
      wood('WISEMAN', bx, by - 85, 320, 70, INK.K());
      rect(bx - bw / 2 + 14, by - 38, bw - 28, 6, INK.K());
      wood('ME AND', bx, by + 20, 220, 56, INK.F());
      wood('JIMI', bx, by + 110, 320, 116, INK.F());
      wood('ONE NIGHT ONLY', bx, by + 200, 240, 24, INK.mix(0, 0, 1));
    });
    // wind tugs a loose corner on "life ain't nice"
    const flap = hit(tt, 3.2, 2.5) * Math.sin((tt - 3.2) * 14);
    withT(() => { s.translate(870, 860); s.rotate(-.3 + flap * .5); poly([[0, 0], [90, -10], [70, 70]], INK.mix(0, 0, .5)); });
  }

  // ---------- B: dice down the sidewalk ----------
  const PIPS = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] };
  function die(x, y, sz, rot, face, plate) {
    withT(() => {
      s.translate(x, y); s.rotate(rot);
      rrect(-sz / 2 + 14, -sz / 2 + 16, sz, sz, sz * .16, INK.mix(0, 0, .45));
      rrect(-sz / 2 - 6, -sz / 2 - 6, sz + 12, sz + 12, sz * .18, INK.K());
      rrect(-sz / 2, -sz / 2, sz, sz, sz * .16, INK[plate](.15));
      PIPS[face].forEach(([a, b]) => circ(a * sz * .27, b * sz * .27, sz * .09, face === 1 ? INK.F() : INK.K()));
    });
  }
  function shotDice(t, l) {
    const tt = T(t), L = 10.63;
    fx({ fount: .1 });
    rect(0, 0, W, H, INK.mix(0, 0, .12));
    for (let i = 0; i < 6; i++) rect(0, 140 + i * 170, W, 8, INK.mix(0, 0, .45));   // sidewalk slabs
    for (let i = 0; i < 5; i++) rect(i * 420 + 120 + ((i % 2) * 140), 0, 8, H, INK.mix(0, 0, .45));
    wood('GOOD LUCK', W / 2, 150, 820, 120, INK.K());
    wood('WITH A CAREER IN MUSIC', W / 2, 250, 820, 46, INK.F());
    // two dice: bounce in from the left, each bounce lands on a beat-ish step, settle on snake eyes at L
    [[0, 760, 300, 0], [1, 1160, 380, 1.3]].forEach(([i, X, Y, ph]) => {
      const k = inv(4.4 + i * .2, L, tt);
      const x = lerp(-120, X, ease.out(k)), hop = Math.abs(Math.sin(k * Math.PI * 4)) * (1 - k) * 260;
      const rot = (1 - ease.out(k)) * (9 + i * 3);
      const face = tt >= L ? 1 : 1 + Math.floor(hash(Math.floor(tt * 6) + i * 97) * 6);
      die(x, 560 + Y * .3 - hop, 230, rot, face, i ? 'B' : 'F');
    });
    if (tt >= L) wood('SNAKE EYES', W / 2, 940, 520 * ease.back(inv(L, L + .4, tt)) + 1, 70, INK.mix(0, 0, 1));
  }

  // ---------- C: the school bus ----------
  function kid(x, y, i, tt) {
    const bob = Math.round(Math.sin(tt * 3 + i * 1.7) * 4);
    rect(x - 34, y + 34 + bob, 68, 60, INK.mix(0, 0, i % 2 ? .55 : .3));                 // striped pyjamas
    for (let k = 0; k < 3; k++) rect(x - 34, y + 46 + k * 16 + bob, 68, 6, INK.B());
    circ(x, y + bob, 32, INK.F(.15)); circ(x - 11, y - 4 + bob, 4, INK.K()); circ(x + 11, y - 4 + bob, 4, INK.K());
    const yawn = i === 2 ? smooth(inv(15.2, 15.8, tt)) * (1 - smooth(inv(17.6, 18.2, tt))) : 0;
    circ(x, y + 14 + bob, 4 + yawn * 9, INK.K());
    // nightcap, flopped over
    poly([[x - 32, y - 18 + bob], [x + 32, y - 18 + bob], [x + 48 + (i % 2) * 10, y - 70 + bob], [x - 8, y - 46 + bob]], INK.F(.7));
    circ(x + 50 + (i % 2) * 10, y - 72 + bob, 10, INK.mix(0, 0, .2));
  }
  function shotBus(t, l) {
    const tt = T(t), P = 16.9;
    fx({ fount: 1 });
    sky(.25, .5, .2);
    // houses
    for (let i = 0; i < 6; i++) { const hx = i * 360 - 40; poly([[hx, 600], [hx + 150, 470 - (i % 2) * 40], [hx + 300, 600]], INK.mix(0, 0, .6)); rect(hx + 20, 600, 260, 180, INK.mix(0, 0, .35)); rect(hx + 120, 660, 60, 120, INK.K()); }
    rect(0, 780, W, H - 780, INK.K()); for (let i = 0; i < 8; i++) rect(i * 260 + 40, 920, 140, 12, INK.F(.8));
    pole(230, 60);
    // bus rolls in, eases to a stop by 15.5
    const bx = lerp(W + 900, 1040, ease.out(inv(11.53, 15.5, tt))), by = 790;
    const bump = Math.round(Math.sin(tt * 18) * 3 * (1 - inv(14.8, 15.5, tt)));
    withT(() => {
      s.translate(bx, by + bump);
      rrect(-640, -430, 1240, 380, 40, INK.F());                  // body (the fountain makes it run orange to yellow)
      rect(-640, -150, 1240, 18, INK.K()); rect(-640, -110, 1240, 10, INK.K());
      wood('SCHOOL BUS', -20, -395, 420, 46, INK.K());
      // windows with kids
      for (let i = 0; i < 6; i++) {
        const wx = -560 + i * 170; rect(wx, -330, 140, 150, INK.mix(0, 0, .25));
        if (i > 0) withT(() => { s.beginPath(); s.rect(wx, -330, 140, 150); s.clip(); kid(wx + 70, -250, i, tt); });
        rect(wx - 8, -338, 156, 10, INK.K()); rect(wx - 8, -188, 156, 10, INK.K());
      }
      // the driver is Ellen (she drove a school bus in Calgary): from behind, guitar case leaning behind the seat
      withT(() => { s.beginPath(); s.rect(-560, -330, 140, 150); s.clip(); rect(-540, -280, 30, 120, INK.K()); rect(-512, -215, 84, 60, INK.K()); circ(-470, -258, 40, INK.F()); rect(-510, -258, 80, 46, INK.F()); });   // her: a bob of hair from behind, no face
      rect(-640, -330, 40, 190, INK.mix(0, 0, .35));              // windscreen edge at the front
      rect(580, -330, 40, 150, INK.K()); circ(-628, -120, 16, INK.F(.3)); rect(-660, -100, 40, 30, INK.K());
      circ(-420, -40, 70, INK.K()); circ(-420, -40, 30, INK.mix(0, 0, .5)); circ(420, -40, 70, INK.K()); circ(420, -40, 30, INK.mix(0, 0, .5));
      // stop arm swings out on "pajamas"
      const a = ease.back(inv(P - .1, P + .35, tt));
      withT(() => { s.translate(-600, -260); s.rotate(-Math.PI / 2 * (1 - a)); rect(-10, -8, -80, 16, INK.K());
        s.translate(-170, 0); s.beginPath(); for (let k = 0; k < 8; k++) { const q = k * TAU / 8 + TAU / 16; s.lineTo(Math.cos(q) * 80, Math.sin(q) * 80); } s.closePath(); s.fillStyle = INK.mix(1, 0, 0); s.fill();
        s.beginPath(); for (let k = 0; k < 8; k++) { const q = k * TAU / 8 + TAU / 16; s.lineTo(Math.cos(q) * 68, Math.sin(q) * 68); } s.closePath(); s.fillStyle = INK.F(); s.fill();
        if (a > .5) withT(() => { s.rotate(Math.PI / 2 * (1 - a)); wood('STOP', 0, 0, 104, 40, INK.K()); }); });
    });
  }

  // ---------- D: the award nobody comes up for ----------
  function trophy(x, y, sc) {
    withT(() => {
      s.translate(x, y); s.scale(sc, sc);
      rect(-120, 0, 240, 60, INK.K()); rect(-90, -40, 180, 40, INK.K());
      rect(-10, -200, 20, 160, INK.F()); circ(0, -210, 40, INK.F());
      // the horn
      s.beginPath(); s.moveTo(0, -230); s.bezierCurveTo(40, -300, 120, -400, 200, -470); s.lineTo(60, -520); s.bezierCurveTo(60, -400, 20, -300, -10, -240); s.closePath(); s.fillStyle = INK.F(); s.fill();
      s.beginPath(); s.ellipse(130, -495, 80, 30, -.33, 0, TAU); s.fillStyle = INK.F(); s.fill(); s.beginPath(); s.ellipse(134, -490, 60, 18, -.33, 0, TAU); s.fillStyle = INK.mix(.85, 0, 0); s.fill();
      rect(-60, -230, 120, 12, INK.K());
    });
  }
  function shotAward(t, l) {
    const tt = T(t), G = 22.4;
    fx({ fount: .9 });
    rect(0, 0, W, H, INK.mix(.0, 0, .85));
    for (let i = 0; i < 14; i++) rect(i * 140 + 20, 0, 50, 860, INK.mix(.35, 0, 0));        // curtain folds
    const burst = ease.out(inv(G - .05, G + .5, tt));
    for (let i = 0; i < 24; i++) withT(() => { s.translate(W / 2, 520); s.rotate(i * TAU / 24 + tt * .1); poly([[0, -8], [180 + burst * 1100, -40 - burst * 40], [180 + burst * 1100, 40 + burst * 40], [0, 8]], i % 2 ? INK.F(burst * .9) : INK.PAPER); });
    withT(() => { s.globalAlpha = 1; poly([[W / 2 - 40, -20], [W / 2 + 40, -20], [W / 2 + 420, 870], [W / 2 - 420, 870]], INK.F(.16)); });   // spotlight
    rect(0, 860, W, H - 860, INK.K()); rect(0, 860, W, 20, INK.F());
    const up = ease.out(inv(20.2, 21.57, tt));
    s.beginPath(); s.ellipse(W / 2, 872, 430, 40, 0, 0, TAU); s.fillStyle = INK.F(.45); s.fill();
    withT(() => { s.beginPath(); s.rect(0, 0, W, 868); s.clip(); trophy(W / 2 - 40, 868 + (1 - up) * 760, 1.25); });
    wood('LIFETIME', W / 2 - 520, 210, 520, 110, INK.K());
    wood('ACHIEVEMENT', W / 2 + 480, 210, 600, 110, INK.K());
    // after the burst: the light waits on an empty mic; nobody comes
    rect(W / 2 + 380, 600, 10, 270, INK.K()); rrect(W / 2 + 368, 560, 34, 56, 16, INK.K()); rect(W / 2 + 340, 862, 90, 10, INK.K());   // the mic nobody steps up to
  }

  // ---------- E: the hook on the platform ----------
  const NAME = 'ELLEN McILWAINE';
  const NAME_T = [31.8, 31.93, 32.06, 32.17, 32.2, 32.2, 32.53, 32.6, 32.73, 32.8, 32.9, 32.97, 33.05, 33.12, 33.2];   // vocal onsets 31.8-32.93
  function guitar(x, y, sc, lean) {         // a left-handed solid body: horn and tuners mirrored, scarf on the head
    withT(() => {
      s.translate(x, y); s.rotate(lean); s.scale(-sc, sc);
      s.beginPath(); s.ellipse(0, 0, 120, 150, 0, 0, TAU); s.fillStyle = INK.mix(.0, 0, .0); s.fill();
      s.beginPath(); s.moveTo(-110, -40); s.bezierCurveTo(-150, -160, -60, -220, -40, -120); s.bezierCurveTo(-20, -150, 30, -230, 60, -130);
      s.bezierCurveTo(140, -60, 140, 120, 60, 150); s.bezierCurveTo(0, 175, -100, 170, -120, 90); s.closePath(); s.fillStyle = INK.F(); s.fill();
      s.lineWidth = 10; s.strokeStyle = INK.K(); s.stroke();
      rect(-60, -10, 120, 70, INK.mix(0, 0, .25)); rect(-16, -560, 32, 500, INK.K());
      rrect(-34, -680, 60, 130, 14, INK.K());
      for (let k = 0; k < 6; k++) circ(-40, -665 + k * 22, 7, INK.K());
      // the scarf, tied round the head, ends blowing
      rect(-36, -600, 70, 26, INK.B());
      const fl = 0;
      poly([[30, -598], [150, -560 + fl], [160, -530], [32, -575]], INK.B()); poly([[30, -585], [120, -500], [100, -490], [30, -570]], INK.B(.7));
    });
  }
  function shotHook(t, l) {
    const tt = T(t);
    fx({ fount: .35 });
    const train = inv(38.3, BAND, t);                       // headlight grows down the line
    rect(0, 0, W, H, INK.mix(0, 0, .9));
    rect(0, 0, W, 720, INK.mix(0, .0, .5));
    for (let i = 0; i < 12; i++) rect(i * 170, 120, 150, 600, INK.mix(0, 0, .65));          // tiled wall
    rect(0, 720, W, 30, INK.F()); rect(0, 750, W, H - 750, INK.K());
    // the bill on the wall
    const bx = 1180, by = 380;
    rect(bx - 260, by - 300, 520, 600, INK.F(.1));
    wood('TONIGHT', bx, by - 240, 300, 44, INK.K());
    wood('SLIDE GUITAR', bx, by - 170, 440, 56, INK.mix(0, 0, 1));
    // the cut: a guitar neck with a bottleneck on one finger
    withT(() => { s.translate(bx, by - 30); s.rotate(-.12); rect(-230, -24, 460, 48, INK.K()); for (let k = 0; k < 9; k++) rect(-210 + k * 50, -24, 5, 48, INK.mix(0, 0, .5));
      const sx = Math.sin(t * 1.3) * 120; rrect(sx - 26, -58, 52, 116, 18, INK.mix(0, 1, 0)); rrect(sx - 18, -50, 36, 100, 12, INK.mix(0, .4, 0)); });
    // her name: set once as one line of wood type (so Mc keeps its small c), revealed by prefix, each new letter stamps
    const NW = 480, NH = 110, nx = bx - NW / 2, ny = by + 150;
    s.save(); s.font = '900 100px "Superclarendon"';
    const full = s.measureText(NAME).width; const px = [...NAME].map((_, i) => s.measureText(NAME.slice(0, i + 1)).width / full * NW); s.restore();
    let n = 0; NAME_T.forEach((at) => { if (tt >= at) n++; });
    if (n > 0) withT(() => { s.beginPath(); s.rect(nx - 10, ny - NH, px[n - 1] + 14, NH * 2); s.clip(); wood(NAME, bx, ny, NW, NH, INK.F()); });
    if (n > 0 && n <= NAME.length) { const k = hit(tt, NAME_T[n - 1], 16); if (k > .05) { const x0 = n > 1 ? px[n - 2] : 0; rect(nx + x0 - 6, ny - NH * .7 - k * 30, px[n - 1] - x0 + 12, 10, INK.K(k)); } }
    if (tt >= 33.8) wood('ONE NIGHT ONLY', bx, by + 260, 300, 28, INK.K());
    // the bench, the hat on a keyboard case ("me"), the left-handed guitar ("Jimi")
    const turn = smooth(inv(27.9, 28.9, tt));
    rect(160, 640, 760, 26, INK.K()); rect(200, 666, 22, 90, INK.K()); rect(860, 666, 22, 90, INK.K());
    const me = smooth(inv(24.23, 24.7, tt)) * (1 - smooth(inv(25.7, 26.0, tt)) * .6), jimi = smooth(inv(26.0, 26.5, tt));
    poly([[330 - 140, 0], [330 + 140, 0], [330 + 200, 760], [330 - 200, 760]], INK.F(.18 * me));
    poly([[700 - 140, 0], [700 + 140, 0], [700 + 200, 760], [700 - 200, 760]], INK.F(.18 * jimi));
    rrect(180, 520, 300, 120, 16, INK.K()); rect(200, 560, 260, 8, INK.mix(0, 0, .5)); for (let k = 0; k < 10; k++) rect(214 + k * 24, 600, 14, 30, INK.mix(0, 0, .4));
    withT(() => { s.translate(330, 520); s.rotate(turn * .25); s.translate(0, -hit(tt, 24.23, 6) * 30); s.beginPath(); s.ellipse(0, 0, 130, 22, 0, 0, TAU); s.fillStyle = INK.K(); s.fill(); rrect(-72, -90, 144, 92, 30, INK.K()); rect(-72, -34, 144, 18, INK.mix(0, 0, 1)); });
    guitar(700, 440, .55, -.08 + turn * .2 + hit(tt, 26.0, 6) * .06);
    // the train comes: a headlight down the line, then the whole frame goes
    rect(0, 430, 120, 290, INK.K());
    if (train > 0) { const r = 14 + train * train * 70; for (let i = 0; i < 10; i++) withT(() => { s.translate(70, 640); s.rotate(i * TAU / 10 + t); poly([[r, -4], [r + 30 + train * 160, 0], [r, 4]], INK.F(train)); }); circ(70, 640, r, INK.F()); }
  }

  // ---------- F: the train blasts through, the bills tear off and fly ----------
  function shotTrain(t, l) {
    const tt = T(t), k = t - BAND;
    fx({ fount: .5 + Math.sin(t * 3) * .3, reg: 1.2 * hit(t, BAND, 1.5) });
    rect(0, 0, W, H, INK.mix(0, 0, .9));
    for (let i = 0; i < 6; i++) {           // carriages streaking right to left
      const x = W - ((k * 3800 + i * 760) % (W + 800)) ;
      rect(x, 160, 700, 560, i % 2 ? INK.F() : INK.K());
      for (let w = 0; w < 4; w++) rect(x + 40 + w * 165, 230, 120, 140, INK.mix(0, .35, 0));
      wood(i % 2 ? 'EXPRESS' : 'NORTHBOUND', x + 350, 560, 520, 90, i % 2 ? INK.K() : INK.F());
    }
    rect(0, 720, W, 30, INK.F()); rect(0, 750, W, H - 750, INK.K());
    // bills fly
    for (let i = 0; i < 14; i++) {
      const sx = hash(i * 11) * W, sy = 200 + hash(i * 17) * 600, v = 900 + hash(i * 3) * 1600;
      withT(() => { s.translate(sx - k * v, sy - k * 140 + Math.sin(k * 4 + i) * 60); s.rotate(k * (2 + hash(i) * 6));
        rect(-90, -120, 180, 240, i % 3 ? INK.F(.3) : INK.mix(0, 0, .5)); wood(['ELLEN', 'TONIGHT', 'SLIDE', 'LIVE'][i % 4], 0, -70, 140, 36, INK.K()); });
    }
  }

  // ---------- G: into one window: it grows until the frame is all paper (cut to Kobe at 43.0) ----------
  function shotWindow(t, l) {
    const k = ease.in(inv(42.2, 43.0, t)), sc = 1 + k * 9;
    fx({ fount: .5 });
    withT(() => {
      s.translate(W / 2, H / 2); s.scale(sc, sc); s.translate(-W / 2, -H / 2);
      rect(-W, -H, W * 3, H * 3, INK.F());
      rect(560, 300, 800, 480, INK.K());
      rrect(600, 340, 720, 400, 30, INK.PAPER);
      wood('EXPRESS', W / 2, 860, 600, 90, INK.K());
    });
  }

  window.LP = { wood, rect, rrect, circ, pole, wires, sky, sun, kid, trophy, guitar };   // shared with the outro (05-outro-letter.js)

  chapter('verse1', 0, 43.0, [
    [0, shotPole], [4.37, shotDice], [11.53, shotBus], [19.6, shotAward], [24.1, shotHook], [BAND, shotTrain], [42.2, shotWindow],
  ]);
})();
