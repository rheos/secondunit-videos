// js/ch/hook.js — COUNTING SHEEP (15.0 – 29.4)
// Someone can't sleep, so they count sheep. "It's all fine here." Then the sheep won't stop.
// Every "SHEEP" lands on the sung word, timed from the vocal stem (Demucs), not from Whisper:
// Whisper's word times run ~0.4 s early in this hook, and Paul sings ten sheeps to the sheet's six.
(() => {
  const SHEEP = [22.78, 23.51, 24.24, 24.97, 25.70, 26.43, 27.15];     // one per beat, ~80.7 BPM
  const RUN = [27.55, 27.83, 28.03, 28.26, 28.42, 28.58];              // the fast run into "Rude"
  const RUDE = 28.97, SEAT = 17.64, LAMP_OFF = 19.62, BLINK = 20.42;

  // ---------- 1 · the queue (15.0 – 17.88) "Got in line to find a seat" ----------
  function queue(t, lt, dur) {
    const cx = kf(lt, [[0, 820], [dur, 1120]], ease.inOut);
    cam(cx, 700, 1.5);
    sky('#060a22', '#10205a', '#2b3a7a', 760);
    stars(t, 5, 160, 620, 1); moon(1620, 210, 58);
    clouds(t, 3, 250, 420, 'rgba(40,52,110,.55)', 5, 10);
    ridge(s, 720, 70, .0016, 8, '#18224e'); ridge(s, 790, 40, .003, 9, '#1f2b62');
    fence(s, 1330, 1900, 820, 180, '#57493e');
    // eight sheep in a neat line, facing the fence; the front one sits down on "seat"
    for (let i = 7; i >= 0; i--) {
      const x = 1210 - i * 205, sit = i === 0 ? smooth(inv(SEAT, SEAT + .25, t)) : 0;
      const look = i === 0 ? [kf(t, [[SEAT, 0], [SEAT + .3, -1]]), 0] : [0, 0];
      sheep(t, x, 840 + (i % 2) * 6, 92, { seed: i + 1, sit, look, lids: .55 + .08 * hash(i), bob: -bob(t + i * .11) * 3 });
    }
  }

  // ---------- 2 · the sleeper (17.88 – 19.62) "It's all fine here" ----------
  function sleeper(t, lt, dur) {
    const z = kf(lt, [[0, 1.0], [dur, 1.45]], ease.out);
    cam(lerp(960, 760, inv(0, dur, lt)), lerp(560, 600, inv(0, dur, lt)), z);
    bedroom(t, { lamp: 1, eye: 1 });
  }

  // ---------- 3 · lights out (19.62 – 20.96) the silence ----------
  function lightsOut(t, lt) {
    cam(760, 600, 1.5 + lt * .06);
    const lamp = 1 - smooth(inv(0, .08, lt));
    const eye = 1 - hit(t, BLINK, 30) * (t > BLINK ? 1 : 0);
    bedroom(t, { lamp, eye, moonA: .7 });
    blackout(.55 * (1 - lamp));
    eyeGlint(eye, 1 - lamp * .8);
  }

  // ---------- 4 · the dream fence (20.96 – 22.78) "Just mind the" ----------
  function dreamFence(t, lt, dur) {
    cam(kf(lt, [[0, 900], [dur, 1040]]), 580, kf(lt, [[0, 1.25], [dur, 1.1]]));
    bedroom(t, { lamp: 0, eye: 1, moonA: .6 });
    blackout(.5);
    const up = smooth(inv(0, .9, lt));
    // the fence rises out of the blanket, pale as moonlight
    s.save(); s.globalAlpha = up; fence(s, 1080, 1440, 650 + (1 - up) * 120, 170, '#8fa0d6', 120); s.restore();
    glow(1260, 560, 360, `rgba(140,160,255,${.14 * up})`);
    // the first sheep backs up for its run-up, then crouches
    const x = kf(lt, [[.4, 1000], [1.3, 870], [dur, 890]], ease.inOut);
    s.save(); s.globalAlpha = smooth(inv(.2, .7, lt));
    sheep(t, x, 660, 70, { seed: 1, lids: .5, bob: 8 * smooth(inv(1.3, dur, lt)) });
    s.restore();
    eyeGlint(1, .8);
  }

  // ---------- 5 · counting (22.78 – 25.70) SHEEP x4, side view ----------
  const TAKE = 780, LAND = 1180, SPEED = 320, ARC = 270, GROUND = 830;
  function leaper(t, apex, sc, seed, o = {}) {
    const t0 = apex - .36, t1 = apex + .36;
    let x, y = GROUND, air = null;
    if (t < t0) x = TAKE - (t0 - t) * SPEED;
    else if (t > t1) x = LAND + (t - t1) * SPEED;
    else { const u = (t - t0) / (t1 - t0); x = lerp(TAKE, LAND, u); y = GROUND - Math.sin(u * Math.PI) * ARC; air = u; }
    const walk = air === null ? -Math.abs(Math.sin(t * 9 + seed)) * 7 : 0;
    return sheep(t, x, y, sc, { seed, air, bob: walk, ...o });
  }
  function dreamField(t, top = '#081030', mid = '#1a2a6e', low = '#3a3f8a') {
    sky(top, mid, low, 800); stars(t, 21, 180, 700, 1);
    clouds(t, 7, 180, 380, 'rgba(70,80,150,.35)', 6, 14);
    ridge(s, 810, 30, .002, 4, '#27336e'); s.fillStyle = '#1c2656'; s.fillRect(-100, 850, W + 400, 400);
  }
  function counting(t, lt) {
    const punch = SHEEP.slice(0, 4).reduce((a, x) => a + hit(t, x, 7), 0);
    const [sx, sy] = shake(t, 4 * punch);
    cam(960 + lt * 36 + sx, 660 + sy, 1.3 + .03 * punch);
    dreamField(t);
    fence(s, 900, 1060, GROUND + 8, 200, '#8a785f', 160);
    for (let i = 5; i >= 0; i--) leaper(t, SHEEP[i], 92, i + 1, { lids: .5 + .1 * hash(i + 4) });
    for (const x of SHEEP.slice(0, 4)) glow(980, GROUND - ARC - 40, 240, `rgba(200,210,255,${.25 * hit(t, x, 5)})`);
  }

  // ---------- 6 · against the moon (25.70 – 27.55) SHEEP x3, low angle ----------
  function moonLeaps(t, lt, dur) {
    cam(960, kf(lt, [[0, 600], [dur, 520]]), 1.0 + lt * .02);
    sky('#050818', '#0c1646', '#1c2a66', 900); stars(t, 33, 120, 500, .8);
    fullMoon(960, 470, 320);
    ridge(s, 900, 40, .002, 12, '#05060f');
    fence(s, 700, 1220, 920, 230, '#05060f', 170);
    [SHEEP[4], SHEEP[5], SHEEP[6]].forEach((apex, i) => {
      const sc = 120 + i * 45, t0 = apex - .4, t1 = apex + .4;
      if (t < t0 - .6 || t > t1 + .6) return;
      const u = inv(t0 - .6, t1 + .6, t), x = lerp(-200, 2120, u);
      const arcU = inv(t0, t1, t), y = 930 - Math.sin(arcU * Math.PI) * (330 + i * 60);
      const pose = { sil: true, air: t >= t0 && t <= t1 ? arcU : null, seed: 10 + i };
      glow(960, 470, 520, `rgba(255,240,210,${.14 * hit(t, apex, 6)})`);
      sheep(t, x, y, sc, pose);
      occlude(() => sheep(t, x, y, sc, { ...pose, black: true, g: f }));
    });
  }

  // ---------- 7 · the flood (27.55 – 28.97) the fast run ----------
  function flood(t, lt) {
    const whipK = 1 - smooth(inv(0, .2, lt));
    whip(-70 * whipK, 0);
    const [sx, sy] = shake(t, 3 + 10 * inv(0, 1.4, lt));
    cam(900 - whipK * 500 + sx, 580 + sy, 1.05);
    bedroom(t, { lamp: 0, eye: 1, moonA: .8 });
    blackout(.35);
    eyeGlint(1, 1);
    // sheep pour over the bed, left to right, faster and more of them as the run goes on
    for (let k = 0; k < 26; k++) {
      const born = 27.5 + k * .055 + (k >= 6 ? 0 : 0);
      const u = (t - born) / .62;
      if (u < 0 || u > 1) continue;
      const sc = 58 + hash(k * 7) * 40, y0 = 700 - hash(k * 3) * 60, h = 260 + hash(k * 5) * 200;
      sheep(t, lerp(300, 1750, u), y0 - Math.sin(u * Math.PI) * h, sc, { air: u, seed: 20 + k, lids: .45 + .2 * hash(k) });
    }
    for (const x of RUN) glow(1000, 420, 420, `rgba(200,210,255,${.16 * hit(t, x, 8)})`);
  }

  // ---------- 8 · "Rude" (28.97 – 29.4) one sheep's face slams into the lens ----------
  function rude(t, lt, dur) {
    cam(960, 540, 1);
    fill(s, '#0c1030');
    const k = ease.in(inv(0, dur, lt)), sc = lerp(420, 1500, k);
    sheep(t, 960 - sc * .98, 540 + sc * 1.3, sc, { seed: 3, lids: .62, look: [-.3, 0] });
    flash(.6 * hit(t, RUDE, 12));
    blackout(smooth(inv(dur - .08, dur, lt)));
  }

  chapter('hook', 15.0, 29.4, [
    [15.0, queue],
    [17.88, sleeper],
    [LAMP_OFF, lightsOut],
    [20.96, dreamFence],
    [SHEEP[0] - .45, counting],
    [SHEEP[4] - .5, moonLeaps],
    [RUN[0], flood],
    [RUDE, rude],
  ], { paint: { boil: 8, bloom: 1.2 } });
})();
