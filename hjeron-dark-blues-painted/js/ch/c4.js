// js/ch/c4.js · SUNRISE (58.042 - 78.667) · pre-hook + hook · look: sunset oil
// The reference chapter: other painters match its craft. One location (a butte top against a burning
// sunrise), one look, the camera always moving, every hit on a sung word or a beat.
(() => {
  const A = 58.042, Z = 78.667;
  const tSerp = when('serpent', 58), tOpen = when('open', 62), tEyes = when('eyes', 62), tDream = when('dream', 64.5);
  const tFire = when('fire', 64.5), tGold = when('gold', 66), tSecrets = when('dream', 67.8), tTold = when('told', 69);
  const tRising = when('serpents', 70.5), tDiss = when('dissolves', 72.5), tReveal = when('flames', 74), tAbsolve = when('absolves', 75.5);

  const HZ = 1230; // horizon (world y)
  // the burning sky: layered sunrise, the low sun, streaked clouds, the far buttes. sunY rises over the chapter.
  function skyfire(t, sunX, sunY, heat = 1) {
    sky('#3a0c10', mixHex('#8f2a17', '#c8431b', heat), mixHex('#f07a22', '#ffc24a', heat), HZ);
    glow(sunX, sunY, 1150, `rgba(255,140,60,${.14 * heat})`);
    // streaked clouds catch the light from below
    const r = rng(41);
    for (let i = 0; i < 9; i++) { const cy = lerp(260, HZ - 260, r()), cx = (r() * 2600 + t * (6 + r() * 8)) % 2600 - 350, w = 500 + r() * 800, hh = 26 + r() * 50;
      s.fillStyle = mixHex('#5a1611', '#ff9a3c', clamp(1 - Math.abs(cy - sunY) / 900) * heat * .9); s.beginPath(); s.ellipse(cx, cy, w / 2, hh / 2, 0, 0, TAU); s.fill(); }
    // the sun: a white-gold core that the painting bleeds out of
    dot(s, sunX, sunY, 190, '#ffc25a'); dot(s, sunX, sunY, 130, '#ffe2a0');
    glow(sunX, sunY, 420, `rgba(255,200,120,${.28 * heat})`); glow(sunX, sunY, 150, `rgba(255,240,210,${.45 * heat})`);
    mesas(HZ, 190, '#3d110d', 51); mesas(HZ + 40, 120, '#260a09', 52);
    ground(HZ + 40, '#2a0b09', '#0c0404');
  }
  // the butte he stands on: a dark rock top with a rim of light, (x, y) = the top surface at centre
  function butte(x, y, w, c = '#170706') {
    s.fillStyle = c; s.beginPath(); s.moveTo(x - w * .5, y + 1600); s.lineTo(x - w * .5, y + 40); s.quadraticCurveTo(x - w * .46, y - 6, x - w * .3, y);
    for (let k = 0; k <= 10; k++) s.lineTo(x - w * .3 + k * w * .06, y - 4 + (hash(k + 90) - .5) * 14);
    s.quadraticCurveTo(x + w * .46, y - 6, x + w * .5, y + 40); s.lineTo(x + w * .5, y + 1600); s.fill();
    stroke(f, [[x - w * .3, y - 2], [x + w * .3, y - 2]], 'rgba(255,170,90,.35)', 5);
  }
  // painted flame tongues: deep red roots, orange bodies, a few amber tips; light kept low so it doesn't clip
  function tongue(t, x, y, h, w, seed) {
    if (h < 4) return;
    const sw = snoise(t * 1.6 + seed, 71) * w * .9 + snoise(t * 3.1 + seed, 72) * w * .35, tip = [x + sw, y - h];
    const shape = (k, c) => { s.fillStyle = c; s.beginPath(); s.moveTo(x - w * k, y); s.bezierCurveTo(x - w * k, y - h * .45, tip[0] - w * .3 * k, y - h * .7, tip[0], y - h * (1 - (1 - k) * .35)); s.bezierCurveTo(tip[0] + w * .3 * k, y - h * .7, x + w * k, y - h * .45, x + w * k, y); s.fill(); };
    shape(1, '#7a1a0c'); shape(.7, '#c8431b'); shape(.4, '#f28a2c'); shape(.18, '#ffc05a');
  }
  function flameWall(t, y0, height, k, x0 = -300, x1 = STAGE + 300, seed = 7) {
    if (k <= .01) return;
    for (let i = 0; i < 20; i++) { const x = lerp(x0, x1, (i + hash(i * 3 + seed) * .6) / 20) + snoise(i, seed) * 70, hh = height * (.3 + .7 * noise1(t * 1.4 + i * 1.7, seed)) * k;
      tongue(t, x, y0, hh, (x1 - x0) / 20 * (1.1 + .9 * hash(i + seed)), i + seed * 30); }
    glow(SC, y0 - height * .3, 1100 * k, `rgba(255,120,40,${.08 * k})`);
  }

  // 1 · the flames of the canyon thin into a burning sunrise; smoke off the sun becomes the serpent
  function dawn(t, lt, dur) {
    const cy = kf(lt, [[0, 820], [dur, 930]], ease.inOut);
    frame(SC, cy, pick(1.05, .9));
    const sunY = kf(t, [[A, 1180], [tOpen, 1050]], ease.out);
    skyfire(t, SC + 60, sunY, kf(lt, [[0, .7], [2, 1]]));
    butte(SC - 180, 1300, 900);
    // the serpent rises off the sun as smoke, uncoiling upward
    const up = inv(tSerp - .6, tSerp + 2.4, t);
    smokeSerpent(t, SC + 60, sunY - 260 * up, 250 + 90 * up, { ring: .15 + .55 * ease.out(up), a: .5 + .3 * up, rot: -Math.PI / 2 - up * 1.2, sq: .8, head: ease.out(up) });
    wyrd(t, SC - 180, 1300, 150, { view: 'sil', guitar: 'hang', wind: .6 });
    // handoff from c3: the fire's flames still fill the frame and sink away
    flameWall(t, 1950, 1050, 1 - ease.inOut(inv(A, A + 1.4, t)));
    flash(hit(t, A, 5) * .25, '#ff9a50');
  }

  // 2 · "open ... eyes": close on the veil; ONE ember eye opens under the brim. Backlit by the sun
  // just off his shoulder, so the brim and shoulders carry a hot rim and the veil stays black.
  function eyes(t, lt, dur) {
    const x = SC, y = 2100, h = 1500, headY = y - h * .905;
    const zoom = kf(lt, [[0, 1.45], [dur, 1.75]], ease.inOut);
    frame(x + pick(20, 120), headY + h * kf(lt, [[0, .17], [dur, .12]]) - pick(0, h * .06), pick(zoom, zoom * .62));
    s.fillStyle = vgrad(s, headY - 700, headY + 700, [[0, '#4a1210'], [.45, '#c8431b'], [1, '#ff9a3c']]); s.fillRect(x - 1400, headY - 1400, 2800, 2800);
    const sx = x + 250 + lt * 14, sy = headY + 60;
    dot(s, sx, sy, 110, '#ffc25a'); glow(sx, sy, 600, 'rgba(255,160,80,.25)'); glow(sx, sy, 150, 'rgba(255,235,200,.45)');
    clouds(t, 61, headY - 600, headY + 500, '#7a2a16', 6, 14);
    smokeSerpent(t, sx - 60, sy - 120, 260, { ring: .45, a: .3, rot: t * .2 + 2.2, sq: .8, head: .8 });
    wyrd(t, x, y, h, { turn: .22, sing: 1, eye: ease.out(inv(tEyes - .15, tEyes + .5, t)) * (1 + .15 * beatPulse(t, 5)), wind: .45, lit: .08, guitar: 'none', arms: 'down', rim: 'rgba(255,170,90,.95)' });
  }

  // 3 · the hook: arms out on the butte top, the smoke serpent coils into a ring around him
  function ring(t, lt, dur) {
    const cy = kf(lt, [[0, 1040], [dur, 990]]), z = kf(lt, [[0, .95], [dur, 1.05]], ease.inOut);
    frame(SC, cy, pick(z, z * .78));
    const g = hit(t, tGold, 2.2);
    skyfire(t, SC + 40, 1000, 1 + g * .3);
    butte(SC, 1330, 1100);
    const close = ease.inOut(inv(tDream - .3, tGold, t));
    smokeSerpent(t, SC, 1000, 420, { ring: .35 + .65 * close, a: .75, rot: t * .25 + Math.PI, sq: .92, head: 1 });
    wyrd(t, SC, 1330, 640, { arms: 'out', guitar: 'none', eye: .8 + .2 * beatPulse(t, 4), wind: .7, lit: .06, sing: .6 });
    // "fire": flames flare along the ridge line
    flameWall(t, 1330, 160, hit(t, tFire, 1.4) + .15, SC - 520, SC + 520, 13);
    // "gold": the whole frame flares gold
    flash(g * .14, '#ffc85a'); paintSet({ tintK: g * .35, tint: [1, .82, .4], bloom: 1.2 + g * .35 });
  }

  // 4 · "secrets never told": singing mid-shot with the guitar; the smoke drifts behind
  function secrets(t, lt, dur) {
    const z = kf(lt, [[0, 1.35], [dur, 1.6]], ease.inOut), sx = kf(lt, [[0, SC - 40], [dur, SC + 20]]);
    frame(sx, pick(960, 700), pick(z, z * .62));
    skyfire(t, SC + 330, 1060, 1);
    smokeSerpent(t, SC + 120, 820, 520, { ring: .9, a: .35, rot: t * .18, sq: .7, head: .6 });
    butte(SC, 1440, 1400);
    wyrd(t, SC, 1440, 980, { turn: -.15, sing: 1, eye: .35 * hit(t, tTold, 1.2) + .1, wind: .5, lit: .12, guitar: 'play' });
  }

  // 5 · "serpents rising ... dissolves": from below, the serpent towers into the sky; the painting loosens
  function rising(t, lt, dur) {
    const cy = kf(lt, [[0, 1150], [dur, 820]], ease.inOut);
    frame(SC, cy, pick(.9, .72), kf(lt, [[0, -.03], [dur, .02]]));
    skyfire(t, SC - 260, 1150, 1);
    const up = ease.out(inv(tRising, tRising + 2.4, t));
    smokeSerpent(t, SC, 900 - 380 * up, 380 + 260 * up, { ring: .98, a: .6 + .25 * up, rot: t * .3 - Math.PI / 2, sq: 1, head: 1 });
    butte(SC, 1420, 1000);
    wyrd(t, SC, 1420, 520, { arms: 'out', guitar: 'none', eye: .7, wind: .9, lit: .05 });
    const d = ease.inOut(inv(tDiss - .2, tDiss + 1.1, t));
    paintSet({ flowK: 1.3 + d * 1.6, boil: 10 + d * 6, strokeK: 1.25 + d * .45 });
  }

  // 6 · "the flames reveal": fire climbs the butte; the serpent ring stands behind him around the sun
  function reveal(t, lt, dur) {
    const z = kf(lt, [[0, .82], [dur, .92]], ease.inOut);
    frame(SC, 1010, pick(z, z * .72));
    skyfire(t, SC, 930, 1.1);
    smokeSerpent(t, SC, 930, 360, { ring: 1, a: .8, rot: t * .35, sq: 1, head: 1 });
    butte(SC, 1400, 1300);
    const climb = ease.out(inv(tReveal - .2, tReveal + 1.4, t));
    flameWall(t, 1950, 500 + 700 * climb, .4 + .6 * climb, -200, STAGE + 200, 21);
    wyrd(t, SC, 1400, 560, { arms: 'out', guitar: 'none', eye: 1, wind: 1, lit: .05 });
  }

  // 7 · "the flame absolves": a fire wash rises over everything and burns the painting down to ash
  function absolve(t, lt, dur) {
    const z = kf(lt, [[0, 1.0], [dur, 1.35]], ease.in);
    frame(SC, kf(lt, [[0, 1000], [dur, 900]]), pick(z, z * .78));
    skyfire(t, SC, 950, 1);
    butte(SC, 1400, 1300);
    wyrd(t, SC, 1400, 700, { arms: 'out', guitar: 'none', eye: 1, wind: 1.1, lit: .05 });
    const wash = ease.inOut(inv(tAbsolve - .35, tAbsolve + .9, t)), burn = ease.inOut(inv(tAbsolve + .8, Z - .25, t));
    flameWall(t, 2050, 400 + 1900 * wash, wash * (1 - burn * .85), -300, STAGE + 300, 33);
    // burnt to black ash: the frame goes dark from the edges in, a few embers still drifting up
    blackout(burn * .96);
    sparks(t, SC, 1500, 1400, 1200, 70, .25 + .5 * wash);
    paintSet({ bloom: 1.25 + wash * .5, sat: 1.15 - burn * .5 });
  }

  chapter('sunrise', A, Z, [
    [A, dawn],
    [tOpen - 1.2, eyes],
    [tDream - .25, ring],
    [tSecrets - .15, secrets],
    [tRising - .25, rising],
    [tReveal - .3, reveal],
    [tAbsolve - .6, absolve],
  ], { paint: LOOK.sunset });
})();
