// d3 paint: the gouache background. Every plane is baked once (brush dabs, trunks, aerial tint, depth blur),
// then blitted per frame through planeT at its parallax rate.
const MX = 150, MY = 50, PWD = W + 2 * MX, PHT = H + 2 * MY;
function planeCanvas() { const c = canvas(PWD, PHT), g = c.getContext('2d'); g.translate(MX, MY); return [c, g]; }

// one brush dab: a main stroke and two smaller strokes over it in near tones, so the paint has body
function dab(g, x, y, rx, ry, ang, c, a, R) {
  g.fillStyle = css(c, a); g.beginPath(); g.ellipse(x, y, rx, ry, ang, 0, TAU); g.fill();
  const k1 = .9 + R() * .2;
  g.fillStyle = css(mixc(c, [255, 250, 225], (R() - .35) * .16).map((v) => v * k1), a * .45);
  g.beginPath(); g.ellipse(x + (R() - .5) * rx * .6, y - ry * .25, rx * .6, ry * .55, ang + (R() - .5) * .4, 0, TAU); g.fill();
  if (R() < .5) { g.fillStyle = css(mixc(c, [20, 40, 45], .18), a * .35); g.beginPath(); g.ellipse(x + rx * .3, y + ry * .35, rx * .45, ry * .3, ang, 0, TAU); g.fill(); }
}
// ramp lookup across 3-4 colours by v in 0..1
function rampC(pal, v) { v = clamp(v) * (pal.length - 1); const i = Math.min(pal.length - 2, Math.floor(v)); return mixc(pal[i], pal[i + 1], v - i); }

// a foliage clump: dabs placed in a flattened ellipse, lit from the sun side and from above, shadow dabs first
function cluster(g, cx, cy, R, pal, R0, o = {}) {
  const n = Math.round(10 + R * R * (o.dens || .08)), sq = o.sq || .62, dabs = [];
  let sx = SUN.x - cx, sy = SUN.y - cy; const sd = Math.hypot(sx, sy) || 1; sx /= sd; sy /= sd;
  const back = clamp(1.15 - sd / 900) * (o.back ?? 1); // backlight: clumps near the sun get bright rims
  for (let i = 0; i < n; i++) {
    const a = R0() * TAU, r = Math.sqrt(R0()) * R, nx = Math.cos(a) * r / R, ny = Math.sin(a) * r / R;
    if (r / R > .55 + .6 * vn2(Math.cos(a) * 1.6 + cx * .05, Math.sin(a) * 1.6 + cy * .05, 17)) continue;
    const x = cx + nx * R, y = cy + ny * R * sq;
    const edge = r / R, toS = nx * sx + ny * sy;
    let v = .32 + .3 * (-ny) + .25 * toS + .35 * back * Math.max(0, toS) * edge * edge + (fbm2(x * .03, y * .03, o.seed || 3) - .5) * .5 + (o.lift || 0);
    dabs.push({ x, y, v: clamp(v), a: R0() });
  }
  dabs.sort((p, q) => p.v - q.v);
  for (const d of dabs) {
    const s = R * (o.size || .12) * (1.15 - .55 * d.v) * (.6 + R0() * .7);
    const c = rampC(pal, d.v + (R0() - .5) * .08);
    dab(g, d.x, d.y, s * (1.2 + R0() * .8), s * (.55 + R0() * .35), (R0() - .5) * 1.2 + (o.tilt || 0), c, (o.alpha || .85) * (.75 + R0() * .25), R0);
  }
}

// a foliage mass: several lobes walked out from a centre, so it never reads as one disc
function mass(g, cx, cy, R, pal, R0, o = {}) {
  const n = 5 + Math.floor(R0() * 5); let x = cx, y = cy;
  for (let i = 0; i < n; i++) {
    cluster(g, x, y, R * (.3 + R0() * .32), pal, R0, o);
    x += (R0() - .5) * R * 1.1; y += (R0() - .42) * R * .55;
  }
}
// the opening in the forest: the sun's column stays clear of leaves so the sky and its cloud bands show
const inWindow = (x, y) => Math.hypot((x - SUN.x) / 250, (y - 110) / 210) < 1;

// a tall trunk: tapered, a cool shade side, a warm sunlit edge on the side toward the sun, bark strokes, moss patches
function trunk(g, x, yTop, yBot, w, lean, col, R0, o = {}) {
  const lit = x < SUN.x ? 1 : -1, N = 24, L = [], Rt = [];
  for (let i = 0; i <= N; i++) {
    const k = i / N, y = lerp(yTop, yBot, k), ww = w * (.78 + .22 * k) * (1 + 1.1 * Math.pow(inv(.9, 1, k), 2)) + (vn2(k * 5, x * .1, 9) - .5) * w * .16;
    const cx = x + lean * (yBot - y);
    L.push([cx - ww / 2, y]); Rt.push([cx + ww / 2, y]);
  }
  const p = new Path2D(); p.moveTo(...L[0]); L.forEach((q) => p.lineTo(...q)); for (let i = N; i >= 0; i--) p.lineTo(...Rt[i]); p.closePath();
  g.save(); g.clip(p);
  const gr = g.createLinearGradient(x - w, 0, x + w, 0), dk = mixc(col, [12, 22, 26], .35), lt = mixc(col, [255, 236, 190], .18);
  if (lit > 0) { gr.addColorStop(.2, css(dk)); gr.addColorStop(.6, css(col)); gr.addColorStop(.8, css(lt)); }
  else { gr.addColorStop(.2, css(lt)); gr.addColorStop(.4, css(col)); gr.addColorStop(.8, css(dk)); }
  g.fillStyle = gr; g.fillRect(x - w * 2 - 200, yTop - 10, w * 4 + 400, yBot - yTop + 20);
  // bark: short vertical strokes, dark and light
  const nb = Math.round((yBot - yTop) * w / 60 * (o.bark || 1));
  for (let i = 0; i < nb; i++) {
    const y = lerp(yTop, yBot, R0()), cx = x + lean * (yBot - y) + (R0() - .5) * w, len = 6 + R0() * 26;
    g.strokeStyle = R0() < .65 ? css(mixc(col, [10, 16, 18], .45), .28) : css(mixc(col, [240, 230, 200], .25), .2);
    g.lineWidth = .8 + R0() * 1.6; g.beginPath(); g.moveTo(cx, y); g.quadraticCurveTo(cx + (R0() - .5) * 3, y + len / 2, cx + (R0() - .5) * 2, y + len); g.stroke();
  }
  // moss patches up the shade side
  if (o.moss) for (let i = 0; i < o.moss; i++) {
    const y = lerp(yTop + (yBot - yTop) * .3, yBot, Math.sqrt(R0())), cx = x + lean * (yBot - y) - lit * w * (.15 + R0() * .3);
    dab(g, cx, y, 3 + R0() * w * .18, 2 + R0() * 5, (R0() - .5), rampC(o.mossPal, R0() * .6), .7, R0);
  }
  g.restore();
  // sunlit edge: a warm line along the side toward the sun, wider low in the haze
  if (o.rim) {
    const E = lit > 0 ? Rt : L; g.save(); g.clip(p);
    g.lineCap = 'round'; const rw = o.rimW || 3;
    // broken by the leaves above: the light comes and goes along the trunk, so it never reads as a ruled line
    for (let i = 0; i < N * 3; i++) {
      const k0 = i / (N * 3), q0 = E[Math.floor(k0 * N)], q1 = E[Math.min(N, Math.floor(k0 * N) + 1)], fr = k0 * N % 1, y0 = lerp(q0[1], q1[1], fr), x0 = lerp(q0[0], q1[0], fr);
      const v = vn2(i * .23, x * .07, 8); if (v < .34) continue;
      g.strokeStyle = css(o.rim, (o.rimA || .75) * inv(.34, .7, v)); g.lineWidth = rw * (.45 + .9 * vn2(i * .4, x * .07, 12));
      g.beginPath(); g.moveTo(x0 - lit * rw * .5, y0); g.lineTo(x0 - lit * rw * .5, y0 + (yBot - yTop) / (N * 3) + 1); g.stroke();
    }
    g.restore();
  }
}

// tint a plane toward the fog colour (aerial perspective): fog colour by x, alpha by y
function fogTint(g, aTop, aBot, y0 = 0, y1 = H) {
  const t = canvas(PWD, PHT), q = t.getContext('2d');
  const gx = q.createLinearGradient(0, 0, PWD, 0);
  for (let i = 0; i <= 12; i++) { const x = -MX + PWD * i / 12; gx.addColorStop(i / 12, css(fogRGB(x))); }
  q.fillStyle = gx; q.fillRect(0, 0, PWD, PHT);
  q.globalCompositeOperation = 'destination-in';
  const gy = q.createLinearGradient(0, y0 + MY, 0, y1 + MY); gy.addColorStop(0, `rgba(0,0,0,${aTop})`); gy.addColorStop(1, `rgba(0,0,0,${aBot})`);
  q.fillStyle = gy; q.fillRect(0, 0, PWD, PHT);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-atop'; g.drawImage(t, 0, 0); g.restore();
}
function blurred(c, px) { if (!px) return c; const o = canvas(c.width, c.height), q = o.getContext('2d'); q.filter = `blur(${px}px)`; q.drawImage(c, 0, 0); return o; }

const PALS = {
  far: ['#5f8d80', '#86ad90', '#bcd47e', '#e4edb0'].map(hex),
  fmid: ['#3f7468', '#5f9070', '#a3c250', '#d8e684'].map(hex),
  mid: ['#2d5e54', '#4a7e5e', '#94b838', '#cfe06a'].map(hex),
  near: ['#123430', '#245244', '#6f9c30', '#bcd650'].map(hex),
  moss: ['#3f6b55', '#6f9a36', '#bcd650'].map(hex),
};

function bakeSky() {
  const [c, g] = planeCanvas();
  const gr = g.createLinearGradient(0, -MY, 0, H);
  gr.addColorStop(0, '#7fb2cc'); gr.addColorStop(.2, '#a9cfdb'); gr.addColorStop(.4, '#efd9ae'); gr.addColorStop(.62, '#f6cf8e'); gr.addColorStop(1, '#efd6a4');
  g.fillStyle = gr; g.fillRect(-MX, -MY, PWD, PHT);
  const rg = g.createRadialGradient(SUN.x, SUN.y, 0, SUN.x, SUN.y, 520);
  rg.addColorStop(0, 'rgba(255,246,214,.95)'); rg.addColorStop(.35, 'rgba(255,236,196,.55)'); rg.addColorStop(1, 'rgba(255,230,190,0)');
  g.fillStyle = rg; g.fillRect(-MX, -MY, PWD, PHT);
  // peach-pink cloud bands, painted then softened
  const [cc, cg] = planeCanvas(), R0 = rng(11);
  [[64, 260, 1250, 1], [118, 120, 980, .85], [168, 420, 1380, .7], [36, 700, 1400, .6]].forEach(([y, x0, x1, k], b) => {
    for (let i = 0; i < 70; i++) {
      const x = lerp(x0, x1, R0()), yy = y + (R0() - .5) * 18 + Math.sin(x * .009 + b * 2) * 16, rx = 26 + R0() * 70, ry = 5 + R0() * 13;
      const near = clamp(1 - Math.abs(x - SUN.x) / 600);
      const c0 = mixc(hex('#f0b49e'), hex('#f9d6b8'), R0() * .6 + near * .4);
      cg.fillStyle = css(c0, .5 * k); cg.beginPath(); cg.ellipse(x, yy, rx, ry, (R0() - .5) * .08, 0, TAU); cg.fill();
      cg.fillStyle = css(hex('#fff2dc'), .22 * k); cg.beginPath(); cg.ellipse(x + 6, yy - ry * .5, rx * .7, ry * .4, 0, 0, TAU); cg.fill();
    }
  });
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(blurred(cc, 3.5), 0, 0); g.restore();
  return c;
}

// a forest plane: tall trunks into the top edge, foliage clumps, undergrowth along its floor line
function bakeTrees(o) {
  const [c, g] = planeCanvas(), R0 = rng(o.seed);
  // back-of-plane leaf haze: big soft clumps so the plane isn't just sticks
  for (let i = 0; i < o.haze; i++) {
    const x = lerp(-MX, W + MX, R0()), y = lerp(-40, o.floor - 110, Math.pow(R0(), 1.3));
    if (!inWindow(x, y) && Math.abs(x - SUN.x) > 130) mass(g, x, y, 60 + R0() * 80, o.pal, R0, { alpha: .5, dens: .012, size: .34, seed: o.seed + 1, lift: .05 });
  }
  const xs = []; for (let i = 0; i < o.trunks; i++) xs.push(lerp(-MX + 10, W + MX - 10, (i + .5 + (R0() - .5) * .8) / o.trunks));
  xs.forEach((x) => {
    const w = lerp(o.w[0], o.w[1], R0() * R0());
    if (Math.abs(x - SUN.x) < (o.gap || 0) && R0() < .75) return;
    trunk(g, x, -MY - 10, o.floor + 8 + R0() * 8, w, (R0() - .5) * .03, mixc(o.trunk, [255, 255, 255], (R0() - .5) * .12), R0,
      { rim: o.rim, rimW: Math.max(1.5, w * .14), rimA: .8, moss: Math.round(w * .6), mossPal: PALS.moss, bark: o.bark || 1 });
    // a few clumps on each trunk: branches with leaves
    const nb = o.branch; for (let k = 0; k < nb; k++) {
      const y = lerp(-20, o.floor - 300, R0() * R0()), side = R0() < .5 ? -1 : 1, lx = x + side * (w + 24 + R0() * 60);
      if (inWindow(lx, y)) continue;
      g.strokeStyle = css(o.trunk); g.lineCap = 'round'; g.lineWidth = Math.max(1.5, w * .22);
      g.beginPath(); g.moveTo(x, y + 34 + R0() * 26); g.quadraticCurveTo(x + side * w, y + 18, lx, y); g.stroke();
      mass(g, lx, y, o.leaf[0] + R0() * (o.leaf[1] - o.leaf[0]), o.pal, R0, { seed: o.seed + 2 });
    }
  });
  for (let i = 0; i < o.under; i++) {
    const x = lerp(-MX, W + MX, R0()); cluster(g, x, o.floor - 6 + R0() * 14, 22 + R0() * 34, o.pal, R0, { sq: .5, seed: o.seed + 3, size: .2 });
  }
  // floor: a strip of painted ground
  g.fillStyle = css(rampC(o.pal, .45)); g.fillRect(-MX, o.floor + 4, PWD, 40);
  for (let i = 0; i < 160; i++) { const x = lerp(-MX, W + MX, R0()); dab(g, x, o.floor + 6 + R0() * 30, 20 + R0() * 40, 3 + R0() * 4, 0, rampC(o.pal, .3 + R0() * .5), .8, R0); }
  fogTint(g, o.fog[0], o.fog[1], 0, o.floor);
  return blurred(c, o.blur);
}

// the clearing the giant stands in: a lit meadow on the sun's path, blue-green shade toward the sides
function bakeClearing() {
  const [c, g] = planeCanvas(), R0 = rng(41), y0 = 548;
  const gr = g.createLinearGradient(0, y0, 0, H + MY); gr.addColorStop(0, '#7fa35e'); gr.addColorStop(1, '#3f6c44');
  g.fillStyle = gr; g.fillRect(-MX, y0, PWD, H + MY - y0);
  for (let i = 0; i < 2600; i++) {
    const x = lerp(-MX, W + MX, R0()), y = lerp(y0, H + MY, Math.pow(R0(), 1.4)), sunny = clamp(1 - Math.abs(x - SUN.x - 60) / 480) * clamp(1.3 - (y - y0) / 160);
    const v = .08 + .6 * sunny + (fbm2(x * .01, y * .03, 4) - .5) * .5 + R0() * .15;
    dab(g, x, y, 8 + R0() * 22, 2 + R0() * 3.5, (R0() - .5) * .15, mixc(rampC(PALS.mid, v), hex('#e6c878'), .5 * sunny), .7, R0);
  }
  // ferns and low bushes along the clearing's back edge
  for (let i = 0; i < 26; i++) cluster(g, lerp(-MX, W + MX, R0()), y0 + R0() * 18, 18 + R0() * 30, PALS.mid, R0, { sq: .45, seed: 44, size: .22 });
  fogTint(g, .2, .08, y0, H);
  return blurred(c, .4);
}

// the near plane: dark framing trunks at both sides and the canopy cut off by the top edge
const canopyY = (x) => 26 + 210 * Math.pow(Math.max(0, 1 - (x + 60) / 420), 1.3) + 210 * Math.pow(Math.max(0, (x - 960) / 460), 1.3) + 26 * vn2(x * .012, 0, 77);
function bakeNear() {
  const [c, g] = planeCanvas(), R0 = rng(61), tc = hex('#2e3026');
  [[-40, 160, -.012], [196, 62, .01], [1192, 150, .015], [1068, 48, -.008]].forEach(([x, w, lean]) => trunk(g, x, -MY - 10, H + MY, w, lean, tc, R0,
    { rim: hex('#f2d58c'), rimW: 4.5, rimA: .85, moss: Math.round(w * .5), mossPal: PALS.near.slice(0, 3), bark: 3 }));
  // moss climbing the near trunks in lit clumps, on the side facing the sun
  [[-40, 160], [196, 62], [1192, 150], [1068, 48]].forEach(([x, w]) => { const sd = x < SUN.x ? 1 : -1;
    for (let i = 0; i < Math.round(w * .13) + 3; i++) cluster(g, x + sd * w * (.05 + R0() * .4), 130 + R0() * 500, 12 + R0() * w * .17, PALS.near, R0, { sq: .95, seed: 66, size: .24, lift: .12, back: 1.4 }); });
  // canopy: mass along the top, deeper at both sides, lit underneath where it faces the sun
  for (let x = -MX; x < W + MX; x += 26) {
    const y = canopyY(x);
    const open = inWindow(x, 40);   // thin over the opening so the sky comes through
    for (let k = 0; k < 2; k++) cluster(g, x + (R0() - .5) * 30, y - (open ? 62 : 30) - R0() * 70 - k * 50, (open ? 30 : 46) + R0() * (open ? 20 : 40), PALS.near, R0, { seed: 63, dens: .11, size: .085, back: 1.3 });
  }
  return c;
}

// fog bands: soft cream and blue-green veils with ragged edges, baked wide so they can drift
function bakeFog(seed, y0, yPk, y1, dens) {
  const ww = PWD + 400, c = canvas(ww, PHT), g = c.getContext('2d'), R0 = rng(seed);
  g.translate(MX, MY);
  for (let i = 0; i < dens; i++) {
    const x = lerp(-MX, W + MX + 400, R0()), u = R0(), y = u < .5 ? lerp(yPk, y0, Math.sqrt(1 - u * 2) ) : lerp(yPk, y1, Math.sqrt((u - .5) * 2)) ;
    const rx = 80 + R0() * 200, ry = 14 + R0() * 34, col = fogRGB(x), rg = g.createRadialGradient(x, y, 0, x, y, rx);
    rg.addColorStop(0, css(col, .38)); rg.addColorStop(1, css(col, 0));
    g.save(); g.translate(x, y); g.scale(1, ry / rx); g.translate(-x, -y); g.fillStyle = rg; g.beginPath(); g.arc(x, y, rx, 0, TAU); g.fill(); g.restore();
  }
  return blurred(c, 8);
}

// grass band blades and flowers (drawn per frame so the blades sway)
function planGrass() {
  const R0 = rng(81), blades = [], flowers = [];
  for (let i = 0; i < 1100; i++) {
    const x = lerp(-MX, W + MX, R0()), y = lerp(676, 760, Math.pow(R0(), .7)), hgt = (18 + R0() * 46) * (1 + (y - 676) / 120);
    blades.push({ x, y, h: hgt, lean: (R0() - .5) * .5, w: 2 + R0() * 3.2, c: rampC(PALS.near, .1 + R0() * .45), tip: R0() < .55, ph: R0() * TAU });
  }
  blades.sort((a, b) => a.y - b.y);
  for (let i = 0; i < 42; i++) flowers.push({ x: lerp(-MX, W + MX, R0()), y: 668 + R0() * 50, h: 16 + R0() * 26, c: hex(['#f4efe0', '#f1d25a', '#c0582f', '#f4efe0', '#e9c64a'][i % 5]), ph: R0() * TAU, r: 2.4 + R0() * 2.2 });
  return { blades, flowers };
}
function planStrands() {
  const R0 = rng(91), s = [];
  for (let i = 0; i < 44; i++) {
    const side = i < 15 ? R0() * 330 - 60 : i < 30 ? 950 + R0() * 420 : 300 + R0() * 680;
    const ax = side, mid = ax > 300 && ax < 950, ay = mid ? -30 : canopyY(ax) - 44 - R0() * 24;
    s.push({ x: ax, y: ay, len: (mid ? 60 + R0() * 90 : 110 + R0() * 210), n: 2 + Math.floor(R0() * 4), ph: R0() * TAU, w: 1.2 + R0() * 1.8 });
  }
  return s;
}
function makeGrain() {
  const c = canvas(640, 360), g = c.getContext('2d'), d = g.createImageData(640, 360);
  for (let i = 0; i < 640 * 360; i++) { const x = i % 640, y = (i / 640) | 0, v = 128 + (h2(x, y, 5) - .5) * 44 + (vn2(x * .08, y * .08, 6) - .5) * 26; d.data[i * 4] = d.data[i * 4 + 1] = d.data[i * 4 + 2] = v; d.data[i * 4 + 3] = 255; }
  g.putImageData(d, 0, 0); return c;
}
