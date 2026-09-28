// js/ch/c6.js · AGAIN (104.4 - 121.75)
// The final chorus reprises the opening, so the night resets to the counting-sheep world:
// calmer, almost tender, then it builds, and the last shot echoes the hook's queue at the fence
// before the camera pulls away into black for the hard cut to the Higgsfield take.
(() => {
  // beat grid in this chapter (FEAT.beats 143..166)
  const BTS = [104.58, 105.30, 106.00, 106.72, 107.44, 108.18, 108.88, 109.62, 110.34, 111.06, 111.78,
    112.50, 113.22, 113.94, 114.66, 115.40, 116.10, 116.82, 117.52, 118.26, 119.00, 119.68, 120.44, 121.14];
  const END = 121.75;

  // ---------- private helpers ----------
  const hex = (c) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
  const mix = (a, b, k) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], clamp(k)))).join(',')})`; };
  function bigFill(g, c, x0 = -4000, y0 = -3000, w = 12000, h = 9000) { g.fillStyle = c; g.fillRect(x0, y0, w, h); }
  // a hammer held in the mouth: pivot at the muzzle, angle a (0 = pointing right, + = down)
  function hammer(px, py, a, len, sc) {
    const ex = px + Math.cos(a) * len, ey = py + Math.sin(a) * len;
    stroke(s, [[px, py], [ex, ey]], '#8a6a44', .09 * sc);
    const nx = -Math.sin(a), ny = Math.cos(a), hw = .26 * sc;
    poly(s, [[ex + nx * hw - Math.cos(a) * .06 * sc, ey + ny * hw - Math.sin(a) * .06 * sc], [ex + nx * hw + Math.cos(a) * .1 * sc, ey + ny * hw + Math.sin(a) * .1 * sc],
      [ex - nx * hw * .6 + Math.cos(a) * .1 * sc, ey - ny * hw * .6 + Math.sin(a) * .1 * sc], [ex - nx * hw * .6 - Math.cos(a) * .06 * sc, ey - ny * hw * .6 - Math.sin(a) * .06 * sc]], '#3b3d4c');
    return [ex + nx * hw, ey + ny * hw]; // striking face
  }
  // swing angle from a list of strike times: snaps down on the strike, eases back up, holds, snaps again
  function swing(t, strikes, up = -1.25, down = .35) {
    let h0 = -1e9, h1 = 1e9;
    for (const h of strikes) { if (h <= t) h0 = h; else { h1 = h; break; } }
    const rise = ease.out(inv(0, .32, t - h0));
    const drop = ease.in(inv(-.13, 0, t - h1));
    const a = lerp(down, up, rise);
    return h1 < 1e8 ? lerp(a, down, drop) : a;
  }
  const count = (t, list) => list.reduce((n, x) => n + (t >= x ? 1 : 0), 0);
  function woolPuff(g, x, y, r, a = 1) {
    g.save(); g.globalAlpha *= a;
    dot(g, x, y, r, '#d9d2c2'); dot(g, x - r * .12, y - r * .14, r * .78, WOOL); dot(g, x - r * .3, y - r * .32, r * .4, WOOL_HI);
    g.restore();
  }
  function nightField(t, horizon = 800, seed = 21) {
    bigFill(s, '#060a22'); sky('#060a22', '#10205a', '#2b3a7a', horizon); stars(t, seed, 160, horizon - 100, 1);
  }

  // ---------- 1 · out of the stuffing (104.4 - 106.0) ----------
  // the stuffing cloud from c5 blows apart into stars; tilt down to a house with one lit basement window
  function stuffing(t, lt, dur) {
    const u = lt / dur;
    const cy = kf(lt, [[0, 260], [dur, 790]], ease.inOut);
    const z = kf(lt, [[0, 1.0], [.6 * dur, 1.25], [dur, 2.3]], ease.in);
    const cx = kf(lt, [[0, 1000], [dur, 960]]);
    cam(cx, cy, z);
    s.fillStyle = vgrad(s, -700, 900, [[0, '#040716'], [.5, '#0e1a4a'], [1, '#2b3a7a']]); s.fillRect(-2000, -1400, 6000, 2400);
    stars(t, 41, 220, 700, smooth(inv(.1, .9, lt)));
    moon(1500, 90, 52, smooth(inv(0, .8, lt)));
    clouds(t, 13, 150, 420, 'rgba(50,62,120,.45)', 5, 12);
    ridge(s, 860, 60, .0015, 5, '#141c46', -2000, 4000, 2200);
    // the house on the hill
    const hx = 960, gy = 862;
    s.fillStyle = '#0b0e26'; s.fillRect(hx - 190, gy - 250, 380, 250);
    poly(s, [[hx - 225, gy - 245], [hx, gy - 400], [hx + 225, gy - 245]], '#090b20');
    s.fillRect(hx + 90, gy - 390, 44, 90);
    for (const wx of [hx - 120, hx + 50]) { s.fillStyle = '#1a2554'; s.fillRect(wx, gy - 200, 70, 80); }
    s.fillStyle = '#0d1236'; s.fillRect(-2000, gy, 6000, 1400);
    // the basement window, half sunk in the ground, warm
    const lampK = .85 + .15 * beatPulse(t, 5);
    s.fillStyle = '#ffc070'; s.fillRect(hx - 70, gy - 8, 140, 44);
    s.fillStyle = '#3a2418'; s.fillRect(hx - 3, gy - 8, 6, 44);
    glow(hx, gy + 14, 320, `rgba(255,170,80,${.35 * lampK})`); glow(hx, gy + 14, 90, `rgba(255,220,160,${.7 * lampK})`);
    // stuffing: big puffs covering the frame at the cut, blowing outward and thinning into stars
    const r = rng(606);
    for (let i = 0; i < 40; i++) {
      const ang = r() * TAU, d0 = 20 + r() * 560, sp = 500 + r() * 800, rad = 190 + r() * 240;
      const d = d0 + sp * ease.inOut(inv(0, 1.3, lt));
      const x = 1000 + Math.cos(ang) * d * 1.6, y = 260 + Math.sin(ang) * d;
      const a = 1 - smooth(inv(.15 + r() * .35, .8 + r() * .5, lt));
      if (a > .01) woolPuff(s, x, y, rad * (1 - .5 * (1 - a)), a);
      // where each puff was, a star is left
      const st = smooth(inv(.4, 1.0, lt));
      if (st > 0) dot(f, 1000 + Math.cos(ang) * (d0 + 300), 260 + Math.sin(ang) * (d0 + 300) * .7, 2.2, `rgba(255,240,220,${.8 * st * (1 - u * .3)})`);
    }
    flash(.25 * hit(t, BTS[0], 6), '#fff4e0');
  }

  // ---------- 2 · bargain basement carpentry (106.0 - 108.18) ----------
  // three sheep build the fence, hammers in their mouths, striking on the beat
  const STRIKE_A = [106.00, 106.72, 107.44, 108.18];
  const STRIKE_B = [106.36, 107.08, 107.80];
  const STRIKE_C = [106.00, 106.72, 107.44, 107.80, 108.18];
  function basement(t, lt, dur) {
    const all = [...STRIKE_A, ...STRIKE_B].filter((x) => x > 106.01);
    const punch = all.reduce((a, x) => a + hit(t, x, 12), 0);
    const [sx, sy] = shake(t, 5 * punch);
    cam(kf(lt, [[0, 760], [dur, 1560]]) + sx, 600 + sy, kf(lt, [[0, 1.5], [dur, 1.62]]));
    // warm brick wall under a bare bulb
    bigFill(s, '#241a24');
    s.fillStyle = rgrad(s, 960, 200, 60, 1300, [[0, '#8a5a3e'], [.4, '#4a3036'], [1, '#1c1526']]); s.fillRect(-400, -300, 2800, 1200);
    for (let row = 0; row < 9; row++) for (let c = -2; c < 16; c++) {
      const bx = c * 170 + (row % 2) * 85 - 200, by = row * 96 - 80;
      s.fillStyle = `rgba(20,10,16,${.18 + .12 * hash(row * 40 + c + 99)})`; s.fillRect(bx, by, 160, 86);
    }
    // the little window we came through, night outside
    s.fillStyle = '#1a2a6a'; s.fillRect(1560, 90, 230, 90); s.fillStyle = '#0c0a14'; s.fillRect(1672, 90, 8, 90);
    dot(f, 1620, 118, 2, 'rgba(255,240,220,.7)'); dot(f, 1740, 140, 1.6, 'rgba(255,240,220,.6)');
    // floor
    s.fillStyle = '#2c1f22'; s.fillRect(-400, 830, 2800, 600);
    s.fillStyle = '#3a2a28'; s.fillRect(-400, 830, 2800, 14);
    // bulb on a swinging cord
    const sw = Math.sin(t * 2.2) * .05 + .06 * punch * Math.sin(t * 30);
    const bulb = [960 + Math.sin(sw) * 240, 40 + Math.cos(sw) * 240 - 240 + 240];
    stroke(s, [[960, -300], bulb], '#120c10', 5);
    dot(s, bulb[0], bulb[1] + 16, 20, '#ffe2a8');
    glow(bulb[0], bulb[1] + 16, 700, `rgba(255,170,90,${.24 + .08 * punch})`); glow(bulb[0], bulb[1] + 16, 60, 'rgba(255,240,200,.95)');
    // the finished section with its curved top rail
    const wood = '#b3864f', woodD = '#7a5634';
    fence(s, 120, 640, 840, 190, woodD, 130);
    stroke(s, bez([100, 670], [260, 560], [500, 560], [660, 670], 30), wood, 16);
    // sawdust drifting in the bulb light
    for (let i = 0; i < 26; i++) {
      const x = (hash(i * 5 + 1) * 2200 - 150 + t * 14 * (hash(i) - .5)), y = (hash(i * 5 + 2) * 800 + t * 22) % 820;
      dot(f, x, y, 1.6 + hash(i) * 1.4, `rgba(255,210,150,${.25 + .3 * hash(i + 3)})`);
    }
    // three workers, each with a post
    const crew = [[780, STRIKE_A, 1], [1280, STRIKE_B, 2], [1780, STRIKE_C, 3]];
    for (const [x, strikes, seed] of crew) {
      const n = count(t, strikes);
      const sc = 125, gy = 850, L = 1.15 * sc, hw = .26 * sc;
      // geometry: where the hammer face lands decides where the post stands
      const muz0 = [x + (.98 + .14) * sc, gy - .62 * sc - .42 * sc - .26 * sc + .16 * sc];
      const postH = 150 - n * 10, top = gy - 10 - postH;
      const down = Math.asin(clamp((top - muz0[1] - hw) / L, -1, 1));
      const postX = muz0[0] + Math.cos(down) * L - Math.sin(down) * hw;
      const nod = 8 * hit(t, strikes[Math.max(0, n - 1)], 10) * (n ? 1 : 0);
      // rails already joined to the post on its left
      s.fillStyle = woodD; s.fillRect(postX - 240, gy - 10 - 190 * .35 - 9, 240, 18);
      s.fillStyle = wood; s.fillRect(postX - 15, top, 30, postH + 10);
      s.fillStyle = '#e6c38c'; s.fillRect(postX - 15, top, 30, 7);
      const J = sheep(t, x, gy, sc, { seed, lids: .58, look: [.9, .4], bob: nod - bob(t) * 2 });
      const a = swing(t, strikes, -1.35, down);
      const muz = [J.head[0] + .14 * sc, J.head[1] + .16 * sc];
      hammer(muz[0], muz[1], a, L, sc * 1.25);
      // sparks on the strike
      for (const h of strikes) {
        const k = hit(t, h, 9); if (k < .03 || t < h) continue;
        glow(postX, top, 130 * k + 20, `rgba(255,200,120,${.7 * k})`);
        for (let j = 0; j < 7; j++) { const aa = -Math.PI * (.1 + .8 * hash(j * 13 + (h * 100 | 0))), dd = (t - h) * 480; dot(f, postX + Math.cos(aa) * dd, top + Math.sin(aa) * dd + (t - h) * (t - h) * 1200, 3.5, `rgba(255,220,150,${k})`); }
      }
    }
  }

  // ---------- 3 · parking space (108.18 - 110.64) ----------
  // a night street, sheep parked in painted bays, headlights clicking on per beat;
  // the last one reverses into the empty bay on the beat
  const LIGHTS = [108.26, 108.88, 109.26, 109.62, 109.98];
  const PARK = 110.34;
  function parking(t, lt, dur) {
    const [sx, sy] = shake(t, 4 * hit(t, PARK, 9));
    cam(kf(lt, [[0, 820], [dur, 1880]], ease.inOut) + sx, 740 + sy, kf(lt, [[0, 1.25], [dur, 1.4]]));
    bigFill(s, '#0a0f2a');
    s.fillStyle = vgrad(s, -200, 620, [[0, '#050818'], [1, '#1d2a66']]); s.fillRect(-400, -400, 3200, 1020);
    stars(t, 55, 90, 300, .7);
    // buildings with warm windows
    const r = rng(77);
    for (let i = 0; i < 12; i++) {
      const bx = -300 + i * 230, bw = 190 + r() * 60, bh = 200 + r() * 260;
      s.fillStyle = i % 2 ? '#0c1134' : '#0f153c'; s.fillRect(bx, 620 - bh, bw, bh);
      for (let wy = 620 - bh + 40; wy < 580; wy += 70) for (let wx = bx + 24; wx < bx + bw - 40; wx += 60) {
        if (hash(wx * 3 + wy) > .55) { s.fillStyle = '#c98a4a'; s.fillRect(wx, wy, 28, 34); glow(wx + 14, wy + 17, 40, 'rgba(255,170,90,.18)'); }
      }
    }
    // asphalt and kerb
    s.fillStyle = '#1b1f38'; s.fillRect(-400, 620, 3200, 900);
    s.fillStyle = '#2c3052'; s.fillRect(-400, 620, 3200, 26);
    s.fillStyle = 'rgba(120,130,190,.08)'; s.fillRect(-400, 960, 3200, 60);
    // street lamps
    for (const lx of [100, 900, 1700, 2500]) {
      stroke(s, [[lx, 640], [lx, 300], [lx + 60, 280]], '#070916', 12);
      dot(s, lx + 70, 290, 16, '#ffd8a0');
      glow(lx + 70, 300, 420, 'rgba(255,170,90,.22)'); glow(lx + 70, 292, 50, 'rgba(255,235,190,.9)');
      s.save(); s.globalAlpha = .12; poly(s, [[lx + 70, 300], [lx + 300, 1000], [lx - 160, 1000]], '#ffc080'); s.restore();
    }
    // the bays: slanted painted stripes, cream on asphalt
    const bay0 = 150, bayW = 330;
    for (let i = 0; i <= 7; i++) {
      const x = bay0 + i * bayW;
      poly(s, [[x - 70, 990], [x - 52, 990], [x + 72, 690], [x + 60, 690]], '#cfcab8');
    }
    s.fillStyle = '#cfcab8'; s.fillRect(bay0 - 70, 990, 7 * bayW + 20, 12);
    // parked sheep, facing the kerb (left-up), headlights on in turn
    for (let i = 6; i >= 0; i--) {
      const last = i === 6;
      let x = bay0 + i * bayW + bayW * .5 + 10;
      const rev = last ? inv(PARK - .75, PARK, t) : 1;
      if (last) x += 700 * (1 - ease.back(rev));
      const on = last ? smooth(inv(PARK, PARK + .05, t)) : smooth(inv(LIGHTS[i % 5] + (i >= 5 ? .36 : 0), (LIGHTS[i % 5] + (i >= 5 ? .36 : 0)) + .05, t));
      const flick = on * (.85 + .15 * Math.sin(t * 40 + i));
      const J = sheep(t, x, 880, 88, { seed: 30 + i, dir: -1, lids: .6, bob: last && t < PARK ? -Math.abs(Math.sin(t * 14)) * 5 : -bob(t + i * .1) * 2 });
      const hx = J.head[0] - 22, hy = J.head[1] + 12;
      if (last && rev < 1) { const tail = [J.body[0] + 95, J.body[1] - 5]; glow(tail[0], tail[1], 60, 'rgba(255,60,40,.7)'); dot(f, tail[0], tail[1], 7, 'rgba(255,120,90,.95)'); }
      if (flick > .01) {
        glow(hx, hy, 46, `rgba(255,245,210,${.85 * flick})`);
        f.save(); f.globalCompositeOperation = 'lighter'; f.globalAlpha = .16 * flick;
        f.fillStyle = rgrad(f, hx, hy, 0, 520, [[0, 'rgba(255,240,200,1)'], [1, 'rgba(0,0,0,0)']]);
        f.beginPath(); f.moveTo(hx, hy - 8); f.lineTo(hx - 460, hy - 90); f.lineTo(hx - 460, hy + 130); f.closePath(); f.fill(); f.restore();
      }
    }
    flash(.12 * hit(t, PARK, 8), '#fff2dc');
  }

  // ---------- 4 · alarming speed (110.64 - 113.46) ----------
  // day and night flicker past in fast-forward; one sheep on the hill doesn't move a muscle
  function speed(t, lt, dur) {
    const n = .22 * lt + .4 * lt * lt; // days elapsed, accelerating
    const day = .5 - .5 * Math.cos(n * TAU); // 0 night, 1 noon
    cam(kf(lt, [[0, 960], [dur, 990]]), kf(lt, [[0, 520], [dur, 600]]), kf(lt, [[0, 1.0], [dur, 1.35]], ease.in), kf(lt, [[0, -.02], [dur, .03]]));
    bigFill(s, mix('#060a22', '#7aa6dc', day));
    s.fillStyle = vgrad(s, -300, 800, [[0, mix('#060a22', '#5f8fd0', day)], [.6, mix('#10205a', '#a9c8ea', day)], [1, mix('#3a3f8a', '#f0cfa0', day * (1 - day) * 3.2)]]);
    s.fillRect(-600, -400, 3200, 1200);
    stars(t, 71, 150, 650, 1 - smooth(inv(.1, .45, day)));
    // sun and moon on opposite ends of one fast wheel
    const ang = n * TAU, R = 820, pc = [960, 900];
    const sun = [pc[0] - Math.sin(ang) * R, pc[1] + Math.cos(ang) * R], mo = [pc[0] + Math.sin(ang) * R, pc[1] - Math.cos(ang) * R];
    if (sun[1] < 900) { dot(s, sun[0], sun[1], 70, '#ffe4a0'); glow(sun[0], sun[1], 360, 'rgba(255,210,120,.32)'); glow(sun[0], sun[1], 90, 'rgba(255,245,210,.9)'); }
    if (mo[1] < 900) fullMoon(mo[0], mo[1], 60, 1);
    // racing clouds
    clouds(n * 900, 17, 80, 520, day > .5 ? 'rgba(245,240,230,.75)' : 'rgba(60,70,130,.6)', 8, 1);
    clouds(n * 1500, 18, 200, 460, day > .5 ? 'rgba(255,255,250,.6)' : 'rgba(80,90,150,.45)', 5, 1);
    // hill and fence
    const hill = mix('#141c46', '#56704a', day), hill2 = mix('#0d1236', '#44583c', day);
    ridge(s, 690, 60, .0014, 6, hill, -600, 2600, 1500);
    s.fillStyle = hill2; s.fillRect(-600, 900, 3200, 700);
    fence(s, 300, 780, 880, 150, mix('#3b3240', '#8a6e4e', day), 120);
    // the sheep, deadpan; its shadow swings round opposite the sun
    const sx = 1120, gy = 880;
    if (sun[1] < 900) {
      const dx = (sx - sun[0]) / 900;
      s.save(); s.globalAlpha = .35 * day; s.fillStyle = '#10182e';
      s.beginPath(); s.ellipse(sx + dx * 220, gy + 6, 120 + Math.abs(dx) * 180, 22, 0, 0, TAU); s.fill(); s.restore();
    }
    const lookX = clamp((sun[1] < mo[1] ? sun[0] : mo[0]) - sx, -600, 600) / 600;
    sheep(t, sx, gy, 110, { seed: 5, dir: -1, lids: .6, look: [lookX, -.8], bob: -bob(t) * 2 });
    // the flicker itself: each dawn and dusk flashes, harder as it speeds up
    flash(.08 * Math.pow(Math.abs(Math.sin(n * TAU)), 18) * inv(.5, dur, lt), '#ffe8c8');
    whip(-8 * inv(1.5, dur, lt), 0);
    blackout(.15 * (1 - day));
  }

  // ---------- 5 · the queue to the lectern (113.46 - 114.66) ----------
  function lectern(t, lt, dur) {
    const step = ease.out(inv(0, .5, lt)); // the line shuffles one place forward, then halts on the rest
    cam(kf(lt, [[0, 1000], [dur, 1180]]), 640, kf(lt, [[0, 1.2], [dur, 1.34]]));
    nightField(t, 800, 23); moon(260, 200, 50);
    clouds(t, 9, 200, 360, 'rgba(50,62,130,.35)', 4, 10);
    ridge(s, 800, 30, .002, 14, '#27336e', -400, 2600, 900);
    s.fillStyle = '#1c2656'; s.fillRect(-400, 850, 3200, 600);
    // a lamp over the lectern, a pool of light
    glow(1560, 520, 520, 'rgba(255,170,90,.2)');
    s.save(); s.globalAlpha = .22; poly(s, [[1560, 250], [1800, 880], [1320, 880]], '#ffc27a'); s.restore();
    dot(s, 1560, 250, 22, '#ffd8a0'); stroke(s, [[1560, -300], [1560, 240]], '#070916', 5); glow(1560, 256, 60, 'rgba(255,235,190,.9)');
    // lectern with the clipboard propped on it
    poly(s, [[1500, 880], [1620, 880], [1600, 640], [1520, 640]], '#4a3226');
    poly(s, [[1470, 650], [1650, 650], [1640, 600], [1480, 600]], '#6b4a32');
    poly(s, [[1500, 610], [1625, 610], [1612, 560], [1508, 560]], '#e9e0c8');
    // the queue: from the left, each one a place forward
    for (let i = 7; i >= 0; i--) {
      const x = 1340 - i * 190 + 190 * (step - 1) * (i === 0 ? .4 : 1);
      const walking = lt < .5;
      sheep(t, x, 880 + (i % 2) * 5, 86, { seed: 40 + i, lids: .55 + .08 * hash(i + 2), look: i === 0 ? [.8, -.4] : [0, 0],
        bob: walking ? -Math.abs(Math.sin(lt * 12 + i)) * 6 : -bob(t + i * .1) * 2 });
    }
  }

  // ---------- 6 · hoofprints on the clipboard (114.66 - 116.24) ----------
  const STAMPS = [114.92, 115.40, 115.96];
  function prints(t, lt, dur) {
    const punch = STAMPS.reduce((a, x) => a + hit(t, x, 10), 0);
    const [sx, sy] = shake(t, 6 * punch);
    cam(kf(lt, [[0, 900], [dur, 1010]]) + sx, kf(lt, [[0, 520], [dur, 600]]) + sy, kf(lt, [[0, 1.08], [dur, 1.32]]) + .02 * punch, kf(lt, [[0, .05], [dur, -.03]]));
    bigFill(s, '#2a1c1a');
    s.fillStyle = rgrad(s, 960, 400, 80, 1200, [[0, '#6a4630'], [1, '#1e1418']]); s.fillRect(-400, -400, 2800, 1900);
    for (let i = 0; i < 9; i++) { s.fillStyle = `rgba(20,12,10,${.12 + .1 * hash(i + 7)})`; s.fillRect(-400, -300 + i * 190, 2800, 8); }
    // board, paper, clip
    s.fillStyle = '#7a5236'; s.fillRect(560, 60, 800, 1060);
    s.fillStyle = '#ebe3cc'; s.fillRect(610, 170, 700, 920);
    for (let i = 0; i < 9; i++) { s.fillStyle = 'rgba(120,140,190,.28)'; s.fillRect(650, 260 + i * 96, 620, 4); }
    s.fillStyle = '#8f93a6'; s.fillRect(800, 40, 320, 110); s.fillStyle = '#5c6072'; s.fillRect(840, 120, 240, 30);
    glow(960, 70, 60, 'rgba(230,235,255,.35)');
    // the prints: a few from earlier signers, then one per stamp
    const spots = [[720, 300], [880, 330], [1050, 290], [1190, 320], [760, 490], [930, 470], [1120, 500], [800, 700], [1000, 680], [1180, 710]];
    const shown = 7 + count(t, STAMPS);
    const hoofprint = (x, y, k, a = .85) => {
      s.save(); s.globalAlpha = a; s.fillStyle = '#2a1c22';
      for (const d of [-1, 1]) { // a cloven print: two halves pointing forward, a gap between
        s.beginPath(); s.moveTo(x + d * 4 * k, y - 40 * k); s.quadraticCurveTo(x + d * 34 * k, y - 18 * k, x + d * 28 * k, y + 14 * k);
        s.quadraticCurveTo(x + d * 20 * k, y + 36 * k, x + d * 5 * k, y + 30 * k); s.closePath(); s.fill();
      }
      s.restore();
    };
    for (let i = 0; i < Math.min(shown, spots.length); i++) {
      const [x, y] = spots[i], si = i - 7, fresh = si >= 0 ? hit(t, STAMPS[si], 7) : 0;
      hoofprint(x, y, 1 + .25 * fresh, .8);
    }
    // hooves coming down from the top: a woolly shoulder at the edge, a long black leg
    for (let k = 0; k < STAMPS.length; k++) {
      const T = STAMPS[k], [px, py] = spots[7 + k];
      const u = inv(T - .42, T, t), back = inv(T + .08, T + .38, t);
      if (u <= 0 || back >= 1) continue;
      const reach = ease.in(u) * (1 - ease.inOut(back));
      const sh = [px + 240 * (k % 2 ? 1 : -1), 10];
      const hoof = [lerp(sh[0], px, reach * .9 + .1), lerp(sh[1] + 220, py - 20, reach)];
      woolPuff(s, sh[0], sh[1] + 40, 230);
      taper(s, [sh[0], sh[1] + 120], hoof, 36, 26, FACE);
      for (const d of [-1, 1]) dot(s, hoof[0] + d * 14, hoof[1], 20, '#0c0a10');
      const k2 = hit(t, T, 14); if (k2 > .02 && t >= T) glow(px, py, 200 * k2 + 40, `rgba(255,230,190,${.25 * k2})`);
    }
    // a sheep's head peering over the board's edge, deadpan, bottom right
    const pk = ease.out(inv(0, .5, lt));
    sheep(t, 1530, 1060 + (1 - pk) * 260, 170, { seed: 7, dir: -1, lids: .62, look: [-.6, -.8], bob: -bob(t) * 3 });
  }

  // ---------- 7 · dined with wine (116.24 - 119.0) ----------
  // the sleeper at a tiny table with one glass, a sheep for company; a sip, a yawn, the lamp dims
  const SIP = 117.22, YAWN = 118.1, DIM = 118.5;
  function wine(t, lt, dur) {
    const lamp = 1 - .75 * smooth(inv(DIM, 119.0, t));
    cam(kf(lt, [[0, 860], [dur, 1050]]), kf(lt, [[0, 640], [dur, 600]]), kf(lt, [[0, 1.4], [dur, 1.85]], ease.inOut));
    bigFill(s, '#0d1233');
    s.save(); s.globalAlpha = lamp; s.fillStyle = rgrad(s, 1420, 380, 40, 1300, [[0, '#8a5a44'], [.45, '#3a2c4c'], [1, '#121638']]); s.fillRect(-400, -300, 2800, 1700); s.restore();
    // window with the moon
    s.fillStyle = '#16225a'; s.fillRect(300, 150, 330, 330); moon(520, 250, 36, .8);
    s.strokeStyle = '#080a1c'; s.lineWidth = 18; s.strokeRect(300, 150, 330, 330);
    s.lineWidth = 8; s.beginPath(); s.moveTo(465, 150); s.lineTo(465, 480); s.stroke();
    // floor
    s.fillStyle = '#141838'; s.fillRect(-400, 850, 2800, 600);
    // floor lamp at right
    stroke(s, [[1440, 850], [1440, 420]], '#1a1320', 10); s.fillStyle = '#1a1320'; s.fillRect(1400, 840, 80, 14);
    poly(s, [[1380, 330], [1500, 330], [1530, 420], [1350, 420]], lamp > .5 ? '#f0d19a' : mix('#3d3446', '#f0d19a', lamp * 1.4));
    glow(1440, 390, 560, `rgba(255,170,90,${.3 * lamp})`); glow(1440, 380, 90, `rgba(255,230,180,${.85 * lamp})`);
    // the tiny table
    const tx = 910, ty = 720;
    stroke(s, [[tx, ty], [tx, 850]], '#2a1d24', 16); s.fillStyle = '#2a1d24'; s.fillRect(tx - 60, 842, 120, 12);
    s.fillStyle = '#5a3a2c'; s.beginPath(); s.ellipse(tx, ty, 140, 22, 0, 0, TAU); s.fill();
    s.fillStyle = '#e8e0cc'; s.beginPath(); s.ellipse(tx, ty - 6, 120, 14, 0, 0, TAU); s.fill();
    // a candle stub between them
    s.fillStyle = '#efe4c8'; s.fillRect(tx - 8, ty - 50, 16, 44);
    const fl = .8 + .2 * Math.sin(t * 17);
    glow(tx, ty - 62, 130, `rgba(255,190,110,${.35 * fl})`); dot(f, tx, ty - 62, 6, `rgba(255,230,170,${.9 * fl})`);
    // the sheep for company, left, sitting, its own glass untouched
    sheep(t, 620, 850, 100, { seed: 9, dir: 1, sit: 1, lids: .6 + .15 * smooth(inv(YAWN, 118.9, t)), look: [.8, 0], bob: -bob(t) * 3 });
    // the sleeper, right, sitting on a stool, facing left
    const hipX = 1160, hipY = 700;
    s.fillStyle = '#231a26'; s.fillRect(hipX - 60, hipY + 20, 150, 18); stroke(s, [[hipX - 40, hipY + 30], [hipX - 50, 850]], '#231a26', 12); stroke(s, [[hipX + 70, hipY + 30], [hipX + 80, 850]], '#231a26', 12);
    const sip = smooth(inv(SIP - .25, SIP + .15, t)) * (1 - smooth(inv(117.85, 118.1, t)));
    const yawn = smooth(inv(YAWN, YAWN + .3, t)) * (1 - smooth(inv(118.8, 119.0, t)) * .5);
    let pose = mixPose(POSE.sit, { ...POSE.sit, aL: [-1.0, -2.6], head: -.25 }, sip);
    pose = mixPose(pose, { ...POSE.sit, aL: [2.4, 2.9], aR: [-2.5, -2.9], lean: -.15, head: -.45 }, yawn);
    const gv = groove(pose, 'idle', t, 1.2);
    const J = figure(s, gv.pose, { x: hipX + gv.dx, y: hipY + gv.dy, sc: 250, color: '#2c3b74', coat: '#3b4d8e', headC: SKIN, limbC: '#34457f' });
    // the yawn: a dark mouth opening on the face side
    if (yawn > .05) { s.fillStyle = '#4a2226'; s.beginPath(); s.ellipse(J.head[0] - 18, J.head[1] + 10, 7 + 6 * yawn, 4 + 12 * yawn, 0, 0, TAU); s.fill(); }
    // the one glass of wine, in the left hand, or on the table
    const hand = J.hdL, onTable = [tx + 60, ty - 12];
    const gp = sip > .01 || yawn > .01 ? [lerp(onTable[0], hand[0], smooth(inv(0, .3, sip + yawn * 0))), lerp(onTable[1], hand[1] - 20, smooth(inv(0, .3, sip)))] : onTable;
    const g0 = yawn > .05 ? onTable : gp;
    const wg = (x, y) => {
      stroke(s, [[x, y], [x, y - 40]], '#d8dce8', 4); s.fillStyle = '#d8dce8'; s.fillRect(x - 14, y - 3, 28, 5);
      s.fillStyle = 'rgba(210,220,240,.6)'; s.beginPath(); s.moveTo(x - 20, y - 88); s.lineTo(x + 20, y - 88); s.quadraticCurveTo(x + 22, y - 40, x, y - 40); s.quadraticCurveTo(x - 22, y - 40, x - 20, y - 88); s.fill();
      s.fillStyle = '#8e1a2c'; s.beginPath(); s.moveTo(x - 19, y - 70); s.lineTo(x + 19, y - 70); s.quadraticCurveTo(x + 20, y - 42, x, y - 42); s.quadraticCurveTo(x - 20, y - 42, x - 19, y - 70); s.fill();
      glow(x + 8, y - 70, 18, `rgba(255,220,220,${.5 * lamp})`);
    };
    wg(g0[0], g0[1] + (g0 === onTable ? 0 : 60));
    wg(tx - 70, ty - 12); // the sheep's glass
    blackout(.35 * (1 - lamp));
  }

  // ---------- 8 · got in line (119.0 - 121.75) ----------
  // the hook's first shot again: the queue at the fence; the line closes up on the beats,
  // the front one sits, and the camera pulls away fast into the dark for the hard cut
  const JOIN = [119.0, 119.68, 120.44], SIT = 121.14, PULL = 120.44;
  function lineAgain(t, lt, dur) {
    const pk = inv(PULL, END, t), pull = pk * pk;
    const cx = lerp(kf(lt, [[0, 640], [1.44, 1000]], ease.inOut), 1150, pull);
    const z = 1.5 * Math.pow(.09, pull); // exponential zoom-out reads as a steady, accelerating retreat
    cam(cx, lerp(700, 560, pull), z, .06 * pull);
    // the hook's field, extended far past the frame so the pull-back never finds an edge
    bigFill(s, '#2b3a7a');
    s.fillStyle = vgrad(s, 0, 760, [[0, '#060a22'], [.55, '#10205a'], [1, '#2b3a7a']]); s.fillRect(-6000, 0, 14000, 760);
    s.fillStyle = '#060a22'; s.fillRect(-6000, -6000, 14000, 6000);
    stars(t, 5, 160, 620, 1); moon(1620, 210, 58);
    clouds(t, 3, 250, 420, 'rgba(40,52,110,.55)', 5, 10);
    ridge(s, 720, 70, .0016, 8, '#18224e', -6000, 8000, 6000); ridge(s, 790, 40, .003, 9, '#1f2b62', -6000, 8000, 6000);
    fence(s, 1330, 1900, 820, 180, '#57493e');
    // the stragglers join the back of the line, one per beat
    for (let i = 7; i >= 0; i--) {
      let x = 1210 - i * 205;
      const j = i - 5; // 5, 6, 7 join late
      let walking = false;
      if (j >= 0) { const a = inv(JOIN[j] - .6, JOIN[j], t); x -= 700 * (1 - ease.out(a)); walking = a < 1; }
      const sit = i === 0 ? smooth(inv(SIT, SIT + .25, t)) : 0;
      const look = i === 0 ? [kf(t, [[SIT, 0], [SIT + .3, -1]]), 0] : [0, 0];
      sheep(t, x, 840 + (i % 2) * 6, 92, { seed: i + 1, sit, look, lids: .55 + .08 * hash(i),
        bob: walking ? -Math.abs(Math.sin(t * 13 + i)) * 7 : -bob(t + i * .11) * 3 });
    }
    // darkness closes in as the world shrinks away
    const R = lerp(1500, 110, pull);
    screen(() => {
      for (const g of [s, f]) {
        g.save(); g.fillStyle = rgrad(g, W / 2, H / 2, R * .55, R * 1.2 + 10, [[0, 'rgba(0,0,0,0)'], [1, g === f ? '#000' : '#03040c']]);
        g.fillRect(-10, -10, W + 20, H + 20); g.restore();
      }
    });
    paintSet({ smear: [0, -12 * pull] });
    blackout(.95 * smooth(inv(END - .3, END, t)));
  }

  chapter('again', 104.4, END, [
    [104.4, stuffing],
    [106.0, basement],
    [108.18, parking],
    [110.64, speed, { paint: { boil: 10, bloom: 1.3 } }],
    [113.46, lectern],
    [114.66, prints],
    [116.24, wine],
    [119.0, lineAgain],
  ], { paint: { boil: 8, bloom: 1.2 } });
})();
