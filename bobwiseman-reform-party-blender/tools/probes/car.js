// draft 24 car extras (table.js driverHat/speakerphone/phonePuff/muteButton, car.js dayPlate): per frame, car-local metres
(t) => {
  C = camAt(t); CP = Math.cos(C.p); SP = Math.sin(C.p); CX = carX(t); CZ = carZ(t); YAW = yaw(t);
  const X = DRIVER.x, S0 = PL(X, TOP + .1, 0), F0 = PL(X + 1, TOP + .1, 0), sdx = F0[0] - S0[0], sdy = F0[1] - S0[1], prof = Math.abs(sdx) / (Math.hypot(sdx, sdy) || 1);
  const m = melt(t), cz = PHONE.z - m * .75, cx = PHONE.x, sl = phoneSlump(t);
  const tp = PUFF.t(), reach = ease(t, tp - .75, tp - .12) * (1 - ease(t, tp + .35, tp + 1.0)), push = ease(t, tp - .2, tp - .05) * (1 - ease(t, tp + .15, tp + .35));
  const h = suitHeadLocal(PUFF.seat, t), dy = .05 - .035 * push, sh = [h[0] - .24, h[1] - .25, h[2] - .05], rest = [h[0] - .3, h[1] - .5, h[2] - .2], hand = [PUFF.bx, TOP + .08 + dy + .06, PUFF.bz];
  const H = [lerp(rest[0], hand[0], reach), lerp(rest[1], hand[1], reach) + .12 * Math.sin(reach * Math.PI), lerp(rest[2], hand[2], reach)];
  const u0 = t - tp, gag = wt(2, 'gag'), clear = 1 - .85 * ease(t, gag - 1.0, gag + .3), puffs = [];
  for (let i = 0; i < 30; i++) { const u = u0 - .12 - i * .085; if (u < 0 || u > 4.6 || !(t > tp - .3 && t < tp + 7.5)) { puffs.push(null); continue; } const f = u / 4.6, e = 1 - (1 - f) ** 2.2;
    const curl = Math.sin(u * 1.7 + i * 1.3) * .14 * e, x = cx + (rnd(i, 71) - .5) * .18 + e * (.55 + .35 * rnd(i, 72)) + .5 * ease(t, gag - 1.4, gag + .6) + curl, y = TOP + .1 + sl * .02 + e * (1.5 + .7 * rnd(i, 73)), z = cz - .08 + (rnd(i, 74) - .5) * .25 + e * .3 + Math.cos(u * 1.3 + i) * .08 * e;
    const R = (.09 + .42 * e) * (.85 + .35 * rnd(i, 75)), al = .78 * clear * clamp(u / .15) * (1 - clamp((f - .5) / .5)), c = 34 + 50 * e + 22 * rnd(i, 76) | 0;
    puffs.push([+x.toFixed(4), +y.toFixed(4), +z.toFixed(4), +R.toFixed(4), +al.toFixed(3), c]); }
  const law = wt(0, 'law'), pu = clamp((t - law + .05) / .32), land = law + .27;
  const pdrop = t < law - .05 ? null : (1 - pu) * (1 - pu) * .7 - (t > land ? .03 * Math.abs(Math.sin((t - land) * 16)) * Math.exp(-(t - land) * 7) : 0), psw = t > land ? .12 * Math.sin((t - land) * 11) * Math.exp(-(t - land) * 3.5) : 0;
  return { duck: +driverDuck(t).toFixed(4), steer: +driverSteer(t).toFixed(4), prof: +prof.toFixed(3), melt: +m.toFixed(4), sl: +sl.toFixed(4), cx, cz: +cz.toFixed(4),
    red: t > wt(1, 'can') && t < L_(2).s + .5, push: +push.toFixed(3), reach: +reach.toFixed(3), arm: reach > 0 ? [sh, H].map((p) => p.map((v) => +v.toFixed(4))) : null,
    puffs, plate: pdrop == null ? null : [+pdrop.toFixed(4), +psw.toFixed(4)], sag: +tableSag(-TL, t).toFixed(4),
    wt: { law, scientists: wt(1, 'scientists'), can: wt(1, 'can'), gag, l1s: L_(1).s, l1e: L_(1).e, l2s: L_(2).s } };
}
