// rp_playa: the playa's static lists on the first frame (city skyline items, open-playa art, art camps, lamps, bike
// costumes, the mountain profile), then per frame the bike traffic and the car's dust puffs (playa.js, car.js carInto).
(() => { let first = true;
  const r4 = (v) => Math.round(v * 1e4) / 1e4;
  return (t) => {
    const o = {};
    if (first) { first = false;
      const lim = 3.2 + 4 / 5; // brcGround: rings beyond 3.2 + C.y / 5 are skipped unless tall (C.y <= 4 here)
      o.brc = BRC_ITEMS.filter((it) => it.ring <= lim || it.tall).map((it) => [r4(it.X), r4(it.Z), it.ring, it.k, r4(it.w), r4(it.d), r4(it.h), it.c, it.vr, it.tall ? 1 : 0]);
      o.brcHz = BRC_HZ; o.brcCols = BRC_COLS;
      o.art = BRC_ART.map((a) => [r4(a.X), r4(a.Z), a.kind, r4(a.s)]);
      o.camps = BM_CAMPS.filter((c) => BM_PLAYA_ART[c.kind]).map((c) => [r4(c.X), r4(c.Z), c.kind, r4(c.r), c.col, c.col2, c.seed]);
      o.lamps = LAMPS.map((l) => [r4(l.X), r4(l.Z), r4(l.ax), r4(l.az)]);
      o.bikes = BM_BIKES.map((b) => ({ Z: b.Z, v: b.v, off: b.off, c: b.c }));
      o.mtn = []; for (let X = -8000; X <= 8000; X += 4) o.mtn.push(r4(26 + 22 * n1(41, X / 300) + 10 * n1(42, X / 90)));
      o.wheels = WHEELS; o.TD = TD; o.TL = TL; o.man = MAN; o.pal = { groundFar: PAL.groundFar, groundNear: PAL.groundNear };
    }
    // bikes: bmTraffic
    const cx = carX(clamp(t, 14, 238)), quiet = (t > 84 && t < 99) || (t > 127 && t < 135.5) || (t > 155.5 && t < 171);
    o.bk = BM_BIKES.map((b) => { if (b.Z < 0 && (quiet || t > 200)) return null; if (t > 205 && b.i % 2) return null;
      const rel = ((((b.v * t + b.off) % 240) + 240) % 240) - 120, vw = b.v + (t > 14 && t < 200 ? 1.6 : 0);
      return [r4(cx + rel), r4(b.Z), Math.sign(vw) || 1, r4(Math.abs(vw) * t)]; });
    // dust: carInto's puffs [slot, X, Y, Z, r, a]
    const dt = .12, AGE = 4.5, t0 = Math.floor(t / dt) * dt, du = [];
    for (let j = 0; j < AGE / dt; j++) { const ts = t0 - j * dt, age = t - ts; if (ts < 0) break; const v = clamp(carSpeed(ts) / 1.6, 0, 1.5); if (v < .05) continue;
      for (let w = 0; w < 3; w++) { const n = Math.round(ts / dt), seed = n * 3 + w, lz = [-TD * .8, TD * .8, 0][w] + (rnd(seed, 4) - .5) * .8, lx = -TL - .2 - rnd(seed, 1) * .5;
        const [X0, Z0] = carLocalToWorld(ts, lx, lz), X = X0 - age * .3 + (rnd(seed, 2) - .5) * age * .7, Z = Z0 + age * .3 + (rnd(seed, 3) - .5) * age * .6, Y = .3 + age * .32 + rnd(seed, 5) * .2, r = .45 + age * .38;
        const a = .42 * Math.min(1, v) * clamp(1 - age / AGE) ** 1.4 * (age < .2 ? age / .2 : 1); if (a < .01) continue;
        du.push([n, w, r4(X), r4(Y), r4(Z), r4(r), r4(a)]); } }
    o.du = du;
    return o;
  };
})()
