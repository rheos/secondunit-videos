// Act 1, verse 1 (21.0-49.3): the banana arrives and will not open. Approved look test (PR #242); protect it.
'use strict';
ACTS.push(...[
  // 1. the clearing at morning; he sits under the tree; his belly rumbles; he looks up at the one banana
  { t0: 21.0, t1: 25.84, draw(g, t, lt) {
    cam(g, lt, 4.84, 1.0, 1.06, 700, 640);
    jungle(g, t, { treeX: 420 });
    const hang = 1 + .04 * Math.sin(t * 2.2); banana(g, 560, 300 + Math.sin(t * 1.6) * 6, 60, 1.3 * hang, 1);
    g.strokeStyle = '#3c6b3f'; g.lineWidth = 5; g.beginPath(); g.moveTo(540, 210); g.quadraticCurveTo(552, 260, 548, 282); g.stroke();
    const rum = [23.1, 23.45, 23.8].reduce((a, tt) => a + Math.max(0, ring(t - tt, 30, 9)) * .05, 0);
    const look = eo(seg(t, 24.2, 24.8));
    gorilla(g, 620, GROUND, 330, { sit: true, squash: rum, belly: cl(rum * 18), handL: [-.32, -.32], handR: [.32, -.3], bendL: 30, bendR: -30,
      look: [lerp(.3, .6, look), lerp(0, -1, look)], tilt: lerp(0, -.18, look), eyes: (t % 3.7) < .12 ? 'shut' : 'open', mouth: rum > .01 ? 'o' : 'flat', brow: -.4 * look });
    if (rum > .004) { g.strokeStyle = 'rgba(43,33,28,.7)'; g.lineWidth = 4; for (const r0 of [70, 95]) { g.beginPath(); g.arc(620, GROUND - 120, r0, -.4, .4); g.stroke(); } }
  } },
  // 2. the banana falls, bonks his head on "settle", bounces into his hands; he holds it up, delighted
  { t0: 25.84, t1: 28.72, draw(g, t, lt) {
    cam(g, lt, 2.88, 1.18, 1.22, 760, 600);
    jungle(g, t, { treeX: 420 });
    const hit = 26.38, catchT = 26.92, up = 27.56;
    const head = [760, GROUND - 330 * .84 - 330 * .3];
    let bx, by, ba;
    if (t < hit) { const u = ei(seg(t, 25.84, hit)); bx = lerp(800, head[0] + 10, u); by = lerp(120, head[1] - 20, u); ba = lerp(1.2, 2.4, u); }
    else if (t < catchT) { const u = seg(t, hit, catchT); bx = lerp(head[0] + 10, 830, u); by = head[1] - 20 - Math.sin(u * Math.PI) * 120 + u * 230; ba = 2.4 + u * 3.5; }
    else { bx = null; }
    const bonk = t >= hit ? ring(t - hit, 26, 8) : 0;
    const joy = seg(t, 27.9, 28.05);
    const held = t >= catchT;
    const hR = held ? [lerp(.3, .45, eo(seg(t, up, up + .4))), lerp(-.25, -1.15, eo(seg(t, up, up + .4)))] : [.45, -.35];
    gorilla(g, 760, GROUND, 330, { squash: bonk * .1, handL: [-.4, -.3], handR: hR, bendL: 40, bendR: -40,
      eyes: t >= hit && t < hit + .35 ? 'squint' : (joy > 0 ? 'happy' : 'open'), mouth: joy > 0 ? 'grin' : (t >= hit && t < hit + .35 ? 'grit' : 'o'),
      look: held ? [.6, -.8] : [.2, -1], tilt: bonk * .12,
      after: held ? (gg) => banana(gg, hR[0] + .02, hR[1] - .1, .34, -.5 + eo(seg(t, up, up + .4)) * .3) : null });
    if (bx !== null) banana(g, bx, by, 110, ba);
    if (t >= hit && t < hit + .5) { const a = 1 - seg(t, hit, hit + .5); for (let i = 0; i < 4; i++) sparkle(g, head[0] + Math.cos(i * 1.6 + t * 6) * 80, head[1] - 40 + Math.sin(i * 1.6 + t * 6) * 26, 16, a); }
    const hx = 760 + hR[0] * 330, hy = GROUND + hR[1] * 330;
    if (joy > 0) for (let i = 0; i < 5; i++) { const ph = (t * 1.3 + i * .2) % 1; sparkle(g, hx + Math.cos(i * 1.25) * (60 + ph * 50), hy - 30 + Math.sin(i * 1.25) * (40 + ph * 40), 14 * (1 - ph), 1 - ph); }
  } },
  // 3. close: he tugs at the stem, three times, harder each time; the banana does not care
  { t0: 28.72, t1: 32.04, draw(g, t, lt) {
    cam(g, lt, 3.32, 1.7, 1.76, 900, 520);
    jungle(g, t, { treeX: 300, ferns: false });
    const tugs = [29.13, 30.0, 30.9].map((tt, i) => Math.max(0, Math.sin(cl((t - tt) / .45) * Math.PI)) * (1 + i * .4));
    const pull = Math.max(...tugs), strain = seg(t, 29.9, 31.2);
    gorilla(g, 900, GROUND, 330, { lean: -pull * .08, handL: [-.1 - pull * .12, -.62], handR: [.32 + pull * .1, -.6], bendL: 30, bendR: -30,
      eyes: strain > .5 ? 'squint' : 'open', brow: .4 + strain * .6, mouth: pull > .3 ? 'grit' : 'flat', look: [.3, .4], sweat: seg(t, 31.2, 31.5),
      front: (gg) => { banana(gg, .12 + pull * .02, -.63, .5, -.05, 1, 0); } });
    if (pull > .4) { g.strokeStyle = 'rgba(43,33,28,.6)'; g.lineWidth = 5; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(1120 + i * 12, 610 + i * 30); g.lineTo(1170 + i * 12, 600 + i * 30); g.stroke(); } }
  } },
  // 4. he bites it: clink on "on", eyes cross; again, harder, on "lake"
  { t0: 32.04, t1: 36.5, draw(g, t, lt) {
    cam(g, lt, 4.46, 1.42, 1.46, 820, 560);
    jungle(g, t, { treeX: 260 });
    const b1 = 33.05, b2 = 34.65;
    const toMouth = Math.max(eio(seg(t, 32.2, b1)) * (t < b1 + .25 ? 1 : 1 - eio(seg(t, b1 + .25, b1 + .6))), eio(seg(t, 34.0, b2)) * (t < b2 + .3 ? 1 : 1 - eio(seg(t, b2 + .3, b2 + .8))));
    const jolt = ring(t - b1, 30, 8) * (t >= b1 ? 1 : 0) + ring(t - b2, 30, 7) * (t >= b2 ? 1.4 : 0);
    const dizzy = (t > b1 && t < b1 + .8) || (t > b2 && t < b2 + 1.1);
    const side = seg(t, 35.8, 36.0);
    const by = lerp(-.55, -.78, toMouth), bx = lerp(.35, .1, toMouth);
    gorilla(g, 820, GROUND, 330, { tilt: -jolt * .15, handL: [bx - .18, by + .02], handR: [bx + .22, by + .03], bendL: 30, bendR: -30,
      eyes: dizzy ? 'cross' : (side > 0 ? 'half' : 'open'), brow: dizzy ? -.6 : .3, mouth: toMouth > .7 ? 'grit' : (dizzy ? 'o' : 'flat'), look: side > 0 ? [.8, .3] : [.2, .3],
      front: (gg) => banana(gg, bx, by, .48, 0, 1) });
    for (const [bt, s] of [[b1, 1], [b2, 1.5]]) if (t >= bt && t < bt + .4) { const a = 1 - seg(t, bt, bt + .4); sparkle(g, 820 + 30, GROUND - 330 * .78, 34 * s, a, '#ffffff'); }
  } },
  // 5. the harmonica answers: he smashes it on a rock; the rock splits; the banana is fine
  { t0: 36.5, t1: 38.2, draw(g, t, lt) {
    cam(g, lt, 1.7, 1.0, 1.02, 960, 640);
    jungle(g, t, { treeX: 1650, sunX: 420, raysX: 900 });
    const smash = 37.05, raise = eio(seg(t, 36.5, 36.95)), down = t >= smash ? 1 : eo(seg(t, 36.95, smash));
    const arm = t < smash ? lerp(-.6, -1.25, raise) + down * .0 : lerp(-1.25, -.25, eo(seg(t, 36.95, smash)));
    const hy = t < 36.95 ? lerp(-.6, -1.25, raise) : lerp(-1.25, -.3, eo(seg(t, 36.95, smash)));
    const split = t >= smash ? eo(seg(t, smash, smash + .35)) : 0;
    rock(g, 1130, GROUND, 120, split);
    gorilla(g, 900, GROUND, 300, { handL: [-.4, -.3], handR: [.55, hy], bendR: -50, eyes: t > smash + .2 ? 'open' : 'squint', brow: .8, mouth: 'grit', look: [.9, .4],
      lean: t >= smash ? ring(t - smash, 20, 6) * .05 : 0,
      after: (gg) => banana(gg, .62, hy - .05, .42, t >= smash ? .25 : -.4, 1) });
    if (t >= smash && t < smash + .5) { const a = 1 - seg(t, smash, smash + .5); for (let i = 0; i < 6; i++) sparkle(g, 1130 + Math.cos(i) * 140 * (1 - a + .3), GROUND - 100 + Math.sin(i) * 60, 18, a, '#f3eee0'); }
  } },
  // 6. he wrestles it: the cartoon dust cloud, limbs and the banana poking out
  { t0: 38.2, t1: 42.64, draw(g, t, lt) {
    cam(g, lt, 4.44, 1.06, 1.12, 960, 700);
    jungle(g, t, { treeX: 260 });
    const f2 = Math.floor(t * 12) / 12, r = M32((f2 * 1000) | 0); // jitter on twos
    const fade = 1 - seg(t, 42.2, 42.64), cx = 960 + Math.sin(t * 1.3) * 60, cy = GROUND - 170;
    g.save(); g.globalAlpha = fade;
    // limbs poking out (drawn before the cloud so the cloud covers their roots)
    const pokes = [[-.9, 'arm'], [.2, 'foot'], [2.3, 'arm'], [3.6, 'banana'], [4.6, 'foot']];
    for (const [a0, kind] of pokes) {
      const a = a0 + Math.sin(f2 * 7 + a0) * .5, R = 190 + r() * 30, x1 = cx + Math.cos(a) * R, y1 = cy + Math.sin(a) * R * .7;
      if (kind === 'banana') { banana(g, x1, y1, 120, a + 1.4); continue; }
      limb(g, [cx + Math.cos(a) * 80, cy + Math.sin(a) * 60], [x1, y1], (r() - .5) * 40, 36, FUR);
      ol(g, ell(g, x1, y1, kind === 'foot' ? 30 : 26, kind === 'foot' ? 18 : 24, a), FUR2);
    }
    const puffs = [...Array(11)].map((_, i) => { const a = i / 11 * TAU + f2 * .4; return [cx + Math.cos(a) * (120 + r() * 50), cy + Math.sin(a) * (80 + r() * 30), 80 + r() * 40]; });
    for (const [x, y, rr] of puffs) ol(g, ell(g, x, y, rr, rr * .85), '#efe4cc');
    ol(g, ell(g, cx, cy, 150, 110), '#efe4cc');
    g.strokeStyle = 'rgba(43,33,28,.5)'; g.lineWidth = 4; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(cx + (r() - .5) * 120, cy + (r() - .5) * 60, 30 + r() * 30, r() * 6, r() * 6 + 2); g.stroke(); }
    for (let i = 0; i < 4; i++) sparkle(g, cx + (r() - .5) * 460, cy - 120 + (r() - .5) * 160, 16 + r() * 10, 1, '#fff6c8');
    g.restore();
    if (t > 42.2) gorilla(g, 960, GROUND, 300, { lie: true, handL: [-.35, -.3], handR: [.6, -.68], bendR: -20, eyes: 'half', mouth: 'frown', look: [1, 0], squash: 0,
      after: (gg) => banana(gg, .67, -.77, .42, 1.2) });
  } },
  // 7. on his back in the grass, the banana held up to the sky; a sigh; a leaf lands on his belly
  { t0: 42.64, t1: 46.0, draw(g, t, lt) {
    cam(g, lt, 3.36, 1.25, 1.3, 960, 760);
    jungle(g, t, { treeX: 200, sunX: 1200, sunY: 200 });
    const sigh = Math.max(0, Math.sin(cl((t - 43.4) / 1.0) * Math.PI));
    gorilla(g, 980, GROUND - 10, 300, { lie: true, squash: -sigh * .03, handL: [-.35, -.3], handR: [.6 + sigh * .03, -.68], bendR: -20, eyes: 'half', brow: -.8, mouth: sigh > .3 ? 'o' : 'frown', look: [1, 0],
      after: (gg) => banana(gg, .67 + sigh * .03, -.77, .42, 1.2) });
    if (sigh > .05) { g.save(); g.globalAlpha = sigh * .8; for (let i = 0; i < 3; i++) { g.fillStyle = '#f4efe0'; g.beginPath(); g.arc(1030 + i * 30 + sigh * 60, 700 - i * 22 - sigh * 40, 16 - i * 3, 0, TAU); g.fill(); } g.restore(); }
    const lu = seg(t, 44.0, 45.3), lx = 1100 + Math.sin(lu * 9) * 70 - lu * 80, ly = lerp(80, 800, eio(lu));
    g.save(); g.translate(lx, ly); g.rotate(Math.sin(lu * 9) * .7); ol(g, () => { g.moveTo(-30, 0); g.quadraticCurveTo(0, -22, 30, 0); g.quadraticCurveTo(0, 22, -30, 0); }, '#6caa58', 4); g.restore();
  } },
  // 8. above him on a branch, a little monkey opens one with a flick on "government" and eats it
  { t0: 46.0, t1: 49.3, draw(g, t, lt) {
    cam(g, lt, 3.3, 1.0, 1.03, 960, 540);
    jungle(g, t, { treeX: 1500, sunX: 520, raysX: 200 });
    g.fillStyle = '#5a3f2b'; g.beginPath(); g.moveTo(1500, 330); g.quadraticCurveTo(1100, 300, 760, 340); g.lineTo(760, 362); g.quadraticCurveTo(1100, 326, 1500, 360); g.closePath(); g.fill();
    g.fillStyle = '#4f8f57'; for (const [x, y, r] of [[780, 330, 46], [820, 300, 38], [760, 360, 30]]) { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
    const flick = 46.43, bite = 47.24, glance = 48.2;
    const p = t >= flick ? back(seg(t, flick, flick + .3)) : 0, eat = t >= bite ? eo(seg(t, bite, bite + .2)) : 0;
    const chew = t > bite + .2 ? (t - bite) * 16 : 0, look = eo(seg(t, glance, glance + .3));
    monkey(g, 1040, 330, 260, { eyes: t > bite && t < glance ? 'happy' : 'open', mouth: chew ? 'chew' : 'smile', chew, look: [lerp(.6, .2, look), lerp(0, 1, look)], tilt: look * .25,
      handL: [.06, -.5], handR: [.2, -.4], hold: (gg) => peeled(gg, .2, -.44, .36, -.2, p, eat) });
    const up = eo(seg(t, 48.0, 48.6));
    gorilla(g, 760, GROUND - 6, 230, { lie: true, handL: [-.35, -.3], handR: [.6, -.68], bendR: -20, eyes: up > .5 ? 'open' : 'half', brow: -.5, mouth: 'flat', look: up > .5 ? [1, .6] : [1, 0], tilt: up * .25,
      after: (gg) => banana(gg, .67, -.77, .42, 1.2) });
    if (t >= flick && t < flick + .4) sparkle(g, 1040 - 13, 330 - 260 * .62 - 70, 26, 1 - seg(t, flick, flick + .4));
  } },
]);
