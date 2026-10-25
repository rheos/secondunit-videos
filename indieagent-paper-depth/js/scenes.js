// Paper depth, the two scenes. Every plane is baked once into textured, bevelled paper sprites (js/paper.js) and
// only moved per frame. Planes are authored as they look on screen with the camera at the scene's reference x.
//   A  the road out of town at dusk: sky, clouds, two mountain ranges, hills with a small town, a fenced field,
//      the road he walks on, wild grass in front. Light low from the left.
//   B  the venue at night: sky with moon and stars, skyline, rooftops, the alley with the tour van, the street
//      front with the marquee and door, the sidewalk, a lamp post and hydrant in front. Light from the right.
const SCENES = (() => {
  const { lerp, clamp, ss, RNG, noise, sprite, tear, polyPath, smoothPath, ellipsePts, ridge, cutp, bevel, F } = PD;
  const LA = [-.6, -.8], LB = [.55, -.83];

  // ---------------- small drawing helpers (all used inside a sprite's draw, in authored px) ----------------
  const circ = (x, y, r) => smoothPath(ellipsePts(x, y, r, r, 24));
  const rectP = (x, y, w, h) => polyPath([[x, y], [x + w, y], [x + w, y + h], [x, y + h]]);
  // a hand-cut rectangle: corners nudged a little
  const cutRect = (x, y, w, h, r, j = 1.5) => polyPath([[x + r.range(-j, j), y + r.range(-j, j)], [x + w + r.range(-j, j), y + r.range(-j, j)], [x + w + r.range(-j, j), y + h + r.range(-j, j)], [x + r.range(-j, j), y + h + r.range(-j, j)]]);
  function ridgeY(pts, x) { for (let i = 1; i < pts.length; i++) if (pts[i][0] >= x) { const a = pts[i - 1], b = pts[i]; return lerp(a[1], b[1], (x - a[0]) / (b[0] - a[0] || 1)); } return pts[pts.length - 3][1]; }
  function tree(g, x, y, s, r, light, pal = ['#3f6440', '#4c7546', '#5e8a4f', '#6f9a58']) {
    cutp(g, polyPath([[x - 7 * s, y], [x - 4 * s, y - 90 * s], [x + 4 * s, y - 90 * s], [x + 8 * s, y]]), '#5d3f2c', { light, blur: 4 });
    const blobs = [[0, -150, 62], [-44, -118, 46], [42, -112, 48], [-16, -96, 44], [22, -176, 40], [-30, -170, 36]];
    blobs.forEach(([bx, by, br], i) => {
      const pts = tear(ellipsePts(x + bx * s, y + by * s, br * s, br * s * .9, 28), { amp: 3 * s, freq: .09, seed: r.int(1, 1e6) });
      cutp(g, polyPath(pts), pal[(i + r.int(0, 3)) % pal.length], { light, blur: 6, dist: 4 });
    });
  }
  function pine(g, x, y, h, col, light) {
    const w = h * .36, tiers = 3;
    for (let i = 0; i < tiers; i++) {
      const top = y - h + i * h * .25, bot = y - h * .35 + i * h * .2, ww = w * (.55 + i * .25);
      cutp(g, polyPath([[x, top], [x + ww / 2, bot], [x - ww / 2, bot]]), col, { light, blur: 3, dist: 2, bev: { width: 1.5 } });
    }
  }
  function house(g, x, y, w, h, wall, roof, r, light, lit = true) {
    cutp(g, cutRect(x, y - h, w, h, r, 1), wall, { light, blur: 3, dist: 2, bev: { width: 1.6 } });
    cutp(g, polyPath([[x - 6, y - h + 2], [x + w / 2, y - h - h * .7], [x + w + 6, y - h + 2]]), roof, { light, blur: 3, dist: 2, bev: { width: 1.6 } });
    if (lit) for (let i = 0; i < Math.max(1, Math.floor(w / 22)); i++) if (r.chance(.7)) g.fillStyle = '#f6d27a', g.fillRect(x + 6 + i * 20, y - h * .62, 8, 9);
  }
  function grassTuft(g, h, r, cols) {
    for (let i = 0; i < 9; i++) {
      const bx = r.range(-26, 26), lean = r.range(-.35, .35), hh = h * r.range(.55, 1), w = r.range(5, 9);
      const tip = [bx + Math.sin(lean) * hh, -hh];
      cutp(g, polyPath([[bx - w, 4], [tip[0] - 1, tip[1] + 6], [tip[0], tip[1]], [bx + w, 4]]), r.pick(cols), { light: LA, blur: 3, dist: 2, bev: { width: 1.3 } });
    }
  }
  function flower(g, x, y, kind, r) {
    if (kind === 'daisy') {
      cutp(g, polyPath([[x - 1.5, y], [x - 1, y + 70], [x + 2, y + 70], [x + 1.5, y]]), '#4d7a44', { light: LA, sh: .5 });
      for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; cutp(g, smoothPath(ellipsePts(x + Math.cos(a) * 9, y + Math.sin(a) * 9, 8, 3.6, 12, a)), '#f7f1e3', { light: LA, sh: .4, blur: 2, dist: 1, bev: { width: 1 } }); }
      cutp(g, circ(x, y, 5.5), '#e9b03c', { light: LA, sh: .6, blur: 2, dist: 1 });
    } else if (kind === 'lupin') {
      cutp(g, polyPath([[x - 2, y], [x - 1, y + 90], [x + 2, y + 90], [x + 2, y]]), '#4d7a44', { light: LA, sh: .5 });
      for (let i = 0; i < 9; i++) cutp(g, circ(x + (i % 2 ? 4 : -4), y - 4 + i * 7, 6 - i * .3), i < 3 ? '#b58fd6' : '#8862b4', { light: LA, sh: .5, blur: 2, dist: 1, bev: { width: 1.1 } });
    } else {
      cutp(g, polyPath([[x - 1.5, y], [x - 1, y + 80], [x + 2, y + 80], [x + 1.5, y]]), '#4d7a44', { light: LA, sh: .5 });
      for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; cutp(g, circ(x + Math.cos(a) * 8, y + Math.sin(a) * 8, 8.5), '#e2683c', { light: LA, sh: .4, blur: 2, dist: 1, bev: { width: 1.1 } }); }
      cutp(g, circ(x, y, 4.5), '#2a1d1a', { light: LA, sh: .4 });
    }
  }
  function star4(x, y, r) {
    const k = r * .26, p = new Path2D();
    p.moveTo(x, y - r); p.quadraticCurveTo(x + k * .3, y - k * .3, x + r, y); p.quadraticCurveTo(x + k * .3, y + k * .3, x, y + r);
    p.quadraticCurveTo(x - k * .3, y + k * .3, x - r, y); p.quadraticCurveTo(x - k * .3, y - k * .3, x, y - r); p.closePath(); return p;
  }
  // a torn piece showing the white paper core along its torn edge
  function torn(g, pts, fill, seed, light, { amp = 2.5, core = 2.6, ...o } = {}) {
    g.fillStyle = '#f5eddc'; g.fill(polyPath(tear(pts, { amp: amp + core, freq: .09, seed: seed + 17 })));
    return cutp(g, polyPath(tear(pts, { amp, seed })), fill, { light, ...o });
  }
  const vgrad = (g, y0, y1, stops) => { const gr = g.createLinearGradient(0, y0, 0, y1); stops.forEach(([o, c]) => gr.addColorStop(o, c)); return gr; };

  // ---------------- scene A: the road out of town at dusk ----------------
  function buildA(Q) {
    const R = (k) => Q * k, planes = [];
    const sp = (o) => sprite({ light: LA, ...o });
    // sky
    planes.push({ name: 'skyA', z: 20000, sky: true, sprites: [{ s: sp({ x: -80, y: -80, w: 2180, h: 1240, res: R(.8), mat: 'sky', seed: 'skyA', edge: false, shadow: false, draw(g) {
      g.fillStyle = vgrad(g, -80, 760, [[0, '#35366f'], [.3, '#6f559a'], [.55, '#d0868f'], [.72, '#f2b38a'], [.9, '#fbdcaa'], [1, '#fde7bb']]);
      g.fillRect(-80, -80, 2180, 1240);
      for (const [r, c] of [[170, '#f8cf9b'], [125, '#fbdcac'], [84, '#fff0c9']]) cutp(g, circ(430, 575, r), c, { light: LA, sh: .35, blur: 10, dist: 4, bev: { width: 2.2, hi: .45 } });
    } }) }] });
    // clouds, drifting
    const rc = new RNG('cloudsA');
    planes.push({ name: 'cloudsA', z: 12000, sky: true, anim: (t) => ({ x: t * 6 }), sprites: [[260, 200, 560, 46, '#f3a99c'], [980, 128, 700, 40, '#c99bc6'], [1560, 262, 480, 50, '#f6c2a4'], [640, 338, 380, 30, '#e9a0a8'], [1900, 380, 320, 28, '#f3b49f'], [80, 420, 260, 24, '#d79bb4']].map(([x, y, w, h, c], i) => ({
      s: sp({ x: x - w / 2 - 20, y: y - h * 1.4 - 20, w: w + 40, h: h * 2.4 + 40, res: R(.8), mat: 'crumpled', seed: 'cloudA' + i, shadow: { blur: 8 }, draw(g) {
        const top = [], n = 40, nb = 3 + (i % 3), ph = rc.next() * 2;
        for (let k = 0; k <= n; k++) { const u = k / n, env = Math.sin(Math.PI * u); top.push([x - w / 2 + u * w, y - h * (.55 * env ** .6 + .7 * Math.abs(Math.sin(Math.PI * u * nb + ph)) * env)]); }
        const pts = [...top, [x + w / 2, y + 4], [x - w / 2, y + 4]];
        g.fillStyle = '#f8efe2'; g.fill(polyPath(tear(pts, { amp: 4.5, freq: .05, seed: 40 + i })));        // white torn core
        cutp(g, polyPath(tear(pts, { amp: 3, freq: .07, seed: 60 + i })), c, { light: LA, sh: 0, bev: { width: 2.2, hi: .4 } });
      } }),
    })) });
    // two mountain ranges
    const mFar = ridge(-140, 2340, 610, 780, { amp: 190, freq: .0021, sharp: .75, seed: 3 });
    planes.push({ name: 'mtnFar', z: 8000, hinge: 780, sprites: [{ s: sp({ x: -160, y: 300, w: 2520, h: 500, res: R(.8), seed: 'mtnFar', shadow: { blur: 12 }, draw(g) {
      const p = polyPath(mFar); g.fillStyle = '#a194c9'; g.fill(p);
      g.save(); g.clip(p);
      const snow = mFar.slice(0, -2).map(([x, y]) => [x, y]); for (let x = 2340, i = 0; x >= -140; x -= 36, i++) snow.push([x, 512 + (i % 2 ? 16 : -12) + Math.sin(x * .02) * 10]);
      cutp(g, polyPath(tear(snow, { amp: 3, seed: 8 })), '#ece2f2', { light: LA, sh: .5, blur: 4, bev: { width: 2 } });
      const band = mFar.slice(0, -2).map(([x, y]) => [x, y + 120]); band.push([2340, 800], [-140, 800]);
      cutp(g, polyPath(tear(band, { amp: 5, seed: 9 })), '#8f84bd', { light: LA, sh: .6, blur: 6 });
      g.restore();
    } }) }] });
    const mNear = ridge(-180, 2560, 660, 830, { amp: 130, freq: .0029, sharp: .5, seed: 5 });
    planes.push({ name: 'mtnNear', z: 5000, hinge: 830, sprites: [{ s: sp({ x: -200, y: 440, w: 2780, h: 410, res: R(.85), seed: 'mtnNear', shadow: { blur: 14 }, draw(g) {
      const p = polyPath(mNear); g.fillStyle = '#6c66a5'; g.fill(p);
      g.save(); g.clip(p);
      const band = mNear.slice(0, -2).map(([x, y]) => [x, y + 70]); band.push([2560, 860], [-180, 860]);
      cutp(g, polyPath(tear(band, { amp: 6, seed: 11 })), '#5b5996', { light: LA, sh: .6, blur: 6 });
      g.restore();
      for (let x = -160; x < 2540; x += 34) { const y = ridgeY(mNear, x) + 92 + Math.sin(x * .05) * 8; pine(g, x, y + 30, 46 + (x * 7 % 23), '#3e4d72', LA); }
    } }) }] });
    // hills with the town and telephone poles
    const hBack = ridge(-260, 2860, 742, 920, { amp: 46, freq: .0016, sharp: 0, seed: 12, oct: 2 });
    const hFront = ridge(-260, 2860, 812, 920, { amp: 30, freq: .0022, sharp: 0, seed: 14, oct: 2 });
    const rh = new RNG('hills');
    planes.push({ name: 'hills', z: 2600, hinge: 920, sprites: [{ s: sp({ x: -280, y: 520, w: 3160, h: 420, res: R(.9), seed: 'hills', shadow: { blur: 12 }, draw(g) {
      for (let i = 0; i < 26; i++) { const x = rh.range(-240, 2840), y = ridgeY(hBack, x); cutp(g, smoothPath(ellipsePts(x, y - 30, 11, 36, 16)), rh.pick(['#4f7350', '#5d8259', '#456a48']), { light: LA, blur: 3, dist: 2, bev: { width: 1.5 } }); }
      torn(g, hBack, '#9fae74', 21, LA, { sh: 0, bev: { width: 2.2 } });
      // the town on the back hill
      const town = [[1120, 34, 30, '#efe2c4', '#b84b3a'], [1160, 28, 24, '#e6cfa1', '#3f6f78'], [1196, 40, 34, '#d9e0df', '#8a4f6a'], [1246, 30, 28, '#efe2c4', '#b84b3a'], [1330, 44, 30, '#e6cfa1', '#3f6f78'], [1380, 30, 26, '#efe2c4', '#8a4f6a'], [1418, 36, 30, '#d9e0df', '#b84b3a'], [1470, 26, 22, '#e6cfa1', '#3f6f78']];
      for (const [x, w, h, wall, roof] of town) house(g, x, ridgeY(hBack, x + w / 2) + 6, w, h, wall, roof, rh, LA);
      const cx = 1290, cy = ridgeY(hBack, cx) + 6;                                                               // the church
      cutp(g, rectP(cx - 12, cy - 60, 24, 60), '#efe2c4', { light: LA, blur: 3, dist: 2, bev: { width: 1.6 } });
      cutp(g, polyPath([[cx - 15, cy - 58], [cx, cy - 112], [cx + 15, cy - 58]]), '#3f6f78', { light: LA, blur: 3, dist: 2, bev: { width: 1.6 } });
      const wx = 1540, wy = ridgeY(hBack, wx) + 6;                                                               // the water tower
      g.fillStyle = '#6b5446'; for (const dx of [-14, 14]) g.fillRect(wx + dx - 2, wy - 50, 4, 50);
      cutp(g, smoothPath([[wx - 22, wy - 84], [wx + 22, wy - 84], [wx + 24, wy - 52], [wx - 24, wy - 52]], .2), '#c9b48c', { light: LA, blur: 3, dist: 2, bev: { width: 1.6 } });
      cutp(g, polyPath([[wx - 25, wy - 82], [wx, wy - 100], [wx + 25, wy - 82]]), '#8a4f6a', { light: LA, blur: 3, dist: 2, bev: { width: 1.4 } });
      torn(g, hFront, '#7c9861', 22, LA, { blur: 8, dist: 5, bev: { width: 2.2 } });
      // telephone poles and the sagging wire
      const poles = []; for (let x = -220; x < 2860; x += 250) poles.push([x, ridgeY(hFront, x) + 12]);
      g.strokeStyle = 'rgba(48,34,36,.75)'; g.lineWidth = 1.6;
      for (let i = 1; i < poles.length; i++) { const [ax, ay] = poles[i - 1], [bx, by] = poles[i]; g.beginPath(); g.moveTo(ax, ay - 108); g.quadraticCurveTo((ax + bx) / 2, (ay + by) / 2 - 86, bx, by - 108); g.stroke(); }
      for (const [x, y] of poles) { cutp(g, rectP(x - 3.5, y - 116, 7, 116), '#5b4033', { light: LA, blur: 3, dist: 2, bev: { width: 1.2 } }); cutp(g, rectP(x - 18, y - 108, 36, 5), '#5b4033', { light: LA, blur: 3, dist: 2, bev: { width: 1 } }); }
    } }) }] });
    // the field with the fence, trees and a road sign
    const rf = new RNG('field');
    const fTop = ridge(-380, 3360, 838, 1090, { amp: 14, freq: .003, sharp: 0, seed: 31, oct: 2 });
    planes.push({ name: 'field', z: 1500, hinge: 1090, sprites: [{ s: sp({ x: -400, y: 520, w: 3780, h: 580, res: R(1), seed: 'field', shadow: { blur: 10 }, draw(g) {
      for (const tx of [380, 1240, 2280, 2960]) tree(g, tx + rf.range(-40, 40), ridgeY(fTop, tx) + 30, rf.range(1.15, 1.45), rf, LA);
      torn(g, fTop, '#5f8350', 32, LA, { amp: 3, sh: 0, bev: { width: 2.4 } });
      const rows = fTop.slice(0, -2).map(([x, y]) => [x, y + 70]); rows.push([3360, 1090], [-380, 1090]);
      torn(g, rows, '#557a48', 33, LA, { amp: 4, core: 2, blur: 6, dist: 4 });
      // fence: rails first, then posts
      for (const dy of [-62, -34]) { const pts = []; for (let x = -380; x <= 3360; x += 40) pts.push([x, ridgeY(fTop, x) + dy + rf.range(-1, 1)]); const lo = pts.map(([x, y]) => [x, y + 7]).reverse(); cutp(g, polyPath([...pts, ...lo]), '#8a6440', { light: LA, blur: 3, dist: 3, bev: { width: 1.4 } }); }
      for (let x = -360; x < 3360; x += 118) { const y = ridgeY(fTop, x) + 6, h = 84 + rf.range(-6, 6); cutp(g, polyPath([[x - 5, y], [x - 5, y - h + 4], [x, y - h], [x + 5, y - h + 4], [x + 5, y]]), '#7b5737', { light: LA, blur: 4, dist: 3, bev: { width: 1.5 } }); }
      // a road sign
      const sx = 1830, sy = ridgeY(fTop, sx) + 30;
      cutp(g, rectP(sx - 4, sy - 190, 8, 190), '#9c9a9e', { light: LA, blur: 4, dist: 3 });
      cutp(g, polyPath([[sx, sy - 250], [sx + 48, sy - 202], [sx, sy - 154], [sx - 48, sy - 202]]), '#e9b03c', { light: LA, blur: 6, dist: 4, bev: { width: 2.2 } });
      g.fillStyle = '#1e1a1a'; g.fill(polyPath([[sx - 18, sy - 196], [sx + 6, sy - 196], [sx + 6, sy - 210], [sx + 24, sy - 200], [sx + 6, sy - 188], [sx + 6, sy - 190], [sx - 12, sy - 190], [sx - 12, sy - 182], [sx - 18, sy - 182]]));
    } }) }] });
    // the road
    const rr = new RNG('road');
    planes.push({ name: 'roadA', z: 1000, hinge: 1090, sprites: [{ s: sp({ x: -520, y: 850, w: 4560, h: 240, res: R(1.15), seed: 'roadA', shadow: { blur: 8 }, draw(g) {
      const verge = []; for (let x = -520; x <= 4040; x += 30) verge.push([x, 872 + Math.sin(x * .011) * 3]);
      torn(g, [...verge, [4040, 1090], [-520, 1090]], '#6d8a4c', 41, LA, { amp: 3.5, sh: 0, bev: { width: 2.2 } });
      cutp(g, polyPath(tear([[-520, 890], [4040, 890], [4040, 1090], [-520, 1090]], { amp: 2, freq: .05, seed: 42 })), '#6d6366', { light: LA, blur: 6, dist: 4, bev: { width: 2.4 } });
      for (let i = 0; i < 70; i++) { const x = rr.range(-500, 4000), y = rr.range(905, 1070); cutp(g, smoothPath(ellipsePts(x, y, rr.range(20, 70), rr.range(4, 9), 14)), rr.pick(['#766c6e', '#625a5d']), { light: LA, sh: 0, bev: { width: 1, hi: .15, lo: .12 } }); }
      for (let x = -500; x < 4040; x += 150) cutp(g, cutRect(x, 990, 82, 10, rr, 1), '#efe2c4', { light: LA, blur: 2, dist: 1.5, bev: { width: 1.2 } });
    } }) }] });
    // wild grass and flowers in front, swaying
    const rg = new RNG('fgA'), fg = [];
    for (let x = -480; x < 5100; x += rg.range(38, 75)) {
      const tall = rg.chance(.2), h = tall ? rg.range(170, 240) : rg.range(80, 150), seed = rg.int(1, 1e6);
      const kinds = tall ? [rg.pick(['lupin', 'daisy', 'poppy']), rg.pick(['lupin', 'daisy'])] : rg.chance(.55) ? [rg.pick(['daisy', 'poppy', 'lupin', 'daisy'])] : [];
      const s = sp({ x: -60, y: -h - 30, w: 120, h: h + 60, res: R(1.3), seed, shadow: { blur: 9 }, draw(g) {
        const r = new RNG(seed);
        kinds.forEach((k, i) => flower(g, (i ? 18 : -14) + r.range(-6, 6), -h + 20 + i * 30, k, r));
        grassTuft(g, h * .9, r, ['#3e5f3a', '#4d7244', '#5f8650', '#36553a']);
      } });
      const ph = rg.range(0, 9);
      fg.push({ s, x, y: 1094, sway: (t) => .035 * Math.sin(t * 1.3 + ph) + .02 * noise('fg').n1(t * .6 + ph) });
    }
    planes.push({ name: 'fgA', z: 560, hinge: 1094, sprites: fg });
    return planes.map((P) => ({ ...P, light: LA, scene: 'A' }));
  }

  // ---------------- scene B: the venue at night ----------------
  function buildB(Q, camRef) {
    const R = (k) => Q * k, planes = [];
    const sp = (o) => sprite({ light: LB, ...o });
    const rs = new RNG('skyB');
    planes.push({ name: 'skyB', z: 20000, sky: true, sprites: [{ s: sp({ x: -160, y: -280, w: 2240, h: 1140, res: R(.8), mat: 'sky', seed: 'skyB', shadow: { blur: 16 }, edge: { width: 2.6, hi: .3, lo: .5 }, draw(g) {
      g.fillStyle = vgrad(g, -280, 860, [[0, '#0f1431'], [.45, '#222b5c'], [.75, '#3b4380'], [1, '#56609c']]);
      g.fill(polyPath(tear([[-160, -280], [2080, -280], [2080, 850], [-160, 850]], { amp: 3, seed: 51 })));
      for (const [r, c] of [[118, '#2f3a6e'], [86, '#3d4a80']]) cutp(g, circ(330, 200, r), c, { light: LB, sh: .4, blur: 10, dist: 4, bev: { width: 2, hi: .25 } });
      const moon = new Path2D(); moon.addPath(circ(330, 200, 62)); cutp(g, moon, '#f4ecd2', { light: LB, sh: .5, blur: 8, dist: 3, bev: { width: 2.2, hi: .5 } });
      cutp(g, circ(352, 186, 54), '#3d4a80', { light: LB, sh: 0, bev: { width: 1.6, hi: .15, lo: .3 } });           // the crescent's shade
      for (let i = 0; i < 46; i++) { const x = rs.range(-120, 2050), y = rs.range(-40, 560); if (Math.hypot(x - 330, y - 200) < 150) continue; cutp(g, star4(x, y, rs.range(4, 13)), rs.pick(['#f1d48a', '#f6e3b0', '#e8c66e']), { light: LB, sh: .5, blur: 3, dist: 2, bev: { width: 1.2 } }); }
    } }) }] });
    const rk = new RNG('skyline');
    planes.push({ name: 'skyline', z: 6000, hinge: 820, sprites: [{ s: sp({ x: -420, y: 180, w: 2780, h: 660, res: R(.85), seed: 'skyline', shadow: { blur: 12 }, draw(g) {
      for (let x = -400; x < 2340;) {
        const w = rk.range(50, 130), h = rk.range(330, 560), top = 820 - h, col = rk.pick(['#171b3c', '#1c2045', '#141836']);
        const pts = [[x, 820], [x, top], [x + w, top], [x + w, 820]];
        if (rk.chance(.3)) pts.splice(2, 0, [x + w * .35, top], [x + w * .5, top - rk.range(20, 50)], [x + w * .65, top]);
        cutp(g, polyPath(pts), col, { light: LB, blur: 4, dist: 3, bev: { width: 1.6, hi: .25 } });
        for (let wy = top + 14; wy < 800; wy += 22) for (let wx = x + 8; wx < x + w - 10; wx += 18) if (rk.chance(.12)) { g.fillStyle = `rgba(233,196,106,${rk.range(.45, .85)})`; g.fillRect(wx, wy, 6, 8); }
        x += w + rk.range(-6, 10);
      }
      cutp(g, polyPath([[1520, 820], [1534, 180], [1540, 180], [1554, 820]]), '#141836', { light: LB, blur: 4, dist: 3 });   // a radio mast
    } }) }] });
    const rb = new RNG('roofs');
    planes.push({ name: 'roofs', z: 2500, hinge: 920, sprites: [{ s: sp({ x: -900, y: 220, w: 3340, h: 720, res: R(.9), seed: 'roofs', shadow: { blur: 12 }, draw(g) {
      for (let x = -880; x < 2420;) {
        const w = rb.range(160, 320), top = rb.range(430, 560), col = rb.pick(['#3a3c6e', '#46427a', '#353a63', '#41456f']);
        cutp(g, cutRect(x, top, w, 920 - top, rb, 1.5), col, { light: LB, blur: 6, dist: 4, bev: { width: 2 } });
        cutp(g, cutRect(x - 6, top - 10, w + 12, 12, rb, 1), '#2c2d55', { light: LB, blur: 3, dist: 2, bev: { width: 1.4 } });
        if (rb.chance(.5)) cutp(g, rectP(x + w * rb.range(.2, .7), top - 40, 18, 32), '#2c2d55', { light: LB, blur: 3, dist: 2 });     // chimney
        for (let wy = top + 30; wy < 860; wy += rb.range(58, 72)) for (let wx = x + 22; wx < x + w - 30; wx += rb.range(48, 64)) {
          if (rb.chance(.3)) continue;
          const lit = rb.chance(.35), tv = lit && rb.chance(.15);
          cutp(g, rectP(wx, wy, 24, 34), lit ? (tv ? '#8fb3d9' : '#f0c46e') : '#25264a', { light: LB, sh: .4, blur: 2, dist: 1, bev: { width: 1.2 } });
        }
        x += w + rb.range(4, 30);
      }
      const wx = 980, wy = 470;                                                                                 // a water tower on a roof
      g.fillStyle = '#2a2b50'; for (const dx of [-20, 0, 20]) g.fillRect(wx + dx - 2, wy - 60, 4, 64);
      cutp(g, smoothPath([[wx - 34, wy - 120], [wx + 34, wy - 120], [wx + 36, wy - 60], [wx - 36, wy - 60]], .2), '#4b4470', { light: LB, blur: 4, dist: 3, bev: { width: 1.8 } });
      cutp(g, polyPath([[wx - 38, wy - 116], [wx, wy - 146], [wx + 38, wy - 116]]), '#3b3560', { light: LB, blur: 4, dist: 3, bev: { width: 1.6 } });
    } }) }] });
    // the alley behind the gap, with the tour van
    planes.push({ name: 'alley', z: 1300, hinge: 910, sprites: [{ s: sp({ x: -1400, y: 560, w: 3600, h: 360, res: R(1), seed: 'alley', shadow: { blur: 10 }, draw(g) {
      g.fillStyle = '#22243f'; g.fill(polyPath(tear([[-1400, 600], [2200, 600], [2200, 920], [-1400, 920]], { amp: 1.5, seed: 71 })));
      for (let x = -1380; x < 2180; x += 46) for (let y = 612; y < 900; y += 24) { g.fillStyle = 'rgba(255,255,255,.035)'; g.fillRect(x + (y / 24 % 2) * 23, y, 40, 19); }
      // the van, rear doors open on the gear
      const vx = 190, vy = 900;
      cutp(g, polyPath([[vx, vy - 40], [vx, vy - 250], [vx + 30, vy - 280], [vx + 380, vy - 280], [vx + 380, vy - 40]]), '#efe3c6', { light: LB, blur: 8, dist: 5, bev: { width: 2.4 } });
      cutp(g, rectP(vx, vy - 150, 380, 34), '#2f7f7a', { light: LB, sh: .4, blur: 3, dist: 2, bev: { width: 1.8 } });
      cutp(g, rectP(vx + 40, vy - 250, 300, 190), '#3a2b2b', { light: LB, sh: .5, blur: 4, dist: 2 });                    // the open back
      cutp(g, rectP(vx + 60, vy - 160, 120, 100), '#2a2224', { light: LB, blur: 4, dist: 3, bev: { width: 1.6 } });         // an amp
      g.fillStyle = '#5a5254'; g.fillRect(vx + 72, vy - 148, 96, 70);
      cutp(g, circ(vx + 250, vy - 112, 50), '#c4493a', { light: LB, blur: 4, dist: 3, bev: { width: 1.8 } });              // a drum case
      cutp(g, circ(vx + 250, vy - 112, 38), '#b33f31', { light: LB, sh: .3, bev: { width: 1.4 } });
      for (const dx of [-24, 380]) cutp(g, rectP(vx + dx - 10, vy - 250, 34, 200), '#e4d6b4', { light: LB, blur: 5, dist: 3, bev: { width: 1.8 } });   // doors
      for (const wx of [vx + 70, vx + 310]) { cutp(g, circ(wx, vy - 34, 34), '#1b1a24', { light: LB, blur: 5, dist: 3, bev: { width: 2 } }); cutp(g, circ(wx, vy - 34, 14), '#8a8b98', { light: LB, sh: .3, bev: { width: 1.2 } }); }
    } }) }] });
    // the street front: a shop, the alley gap, the venue
    const rv = new RNG('venue');
    const FAC = { door: [1205, 652, 160, 254], marquee: [1050, 392, 470, 126], lamp: [1410, 632] };
    const facade = sp({ x: -1500, y: 140, w: 3640, h: 780, res: R(1.15), seed: 'facade', shadow: { blur: 9 }, draw(g) {
      // the shop
      cutp(g, cutRect(-1480, 470, 1760, 440, rv, 1.5), '#55657f', { light: LB, sh: 0, bev: { width: 2.4 } });
      cutp(g, cutRect(-1490, 450, 1780, 30, rv, 1), '#46566d', { light: LB, blur: 4, dist: 3, bev: { width: 2 } });
      for (const wx of [-1300, -680, -100]) {
        cutp(g, rectP(wx, 610, 300, 240), '#2a2034', { light: LB, sh: .6, blur: 5, dist: 3, bev: { width: 2 } });
        g.fillStyle = vgrad(g, 610, 850, [[0, '#f3cf7d'], [1, '#e2a24e']]); g.fillRect(wx + 10, 620, 280, 220);
        for (let sy = 690; sy < 840; sy += 56) { g.fillStyle = 'rgba(80,40,30,.55)'; g.fillRect(wx + 10, sy, 280, 6); for (let bx = wx + 20; bx < wx + 280; bx += rv.range(16, 30)) { g.fillStyle = rv.pick(['rgba(120,50,40,.6)', 'rgba(60,70,90,.55)', 'rgba(150,110,60,.6)']); g.fillRect(bx, sy - rv.range(16, 34), rv.range(8, 14), 34); } }
        for (let i = 0; i < 6; i++) cutp(g, polyPath([[wx - 10 + i * 53.3, 540], [wx - 10 + (i + 1) * 53.3, 540], [wx - 10 + (i + 1) * 53.3 + 6, 600], [wx - 10 + i * 53.3 + 6, 600]]), i % 2 ? '#f2e5cb' : '#c4493a', { light: LB, blur: 6, dist: 4, bev: { width: 1.8 } });
      }
      // the venue: brick, parapet, upper windows
      const vb = polyPath([[470, 905], [470, 410], [700, 410], [700, 386], [1000, 386], [1000, 360], [1440, 360], [1440, 386], [1760, 386], [1760, 410], [2120, 410], [2120, 905]]);
      cutp(g, vb, '#7e3b2f', { light: LB, sh: 0, bev: { width: 2.6 } });
      g.save(); g.clip(vb);
      for (let y = 370, row = 0; y < 905; y += 22, row++) for (let x = 470 + (row % 2) * 24; x < 2120; x += 48) { g.fillStyle = `rgba(${rv.chance(.5) ? '255,220,200' : '30,10,10'},${rv.range(.03, .09)})`; g.fillRect(x, y, 44, 18); }
      g.restore();
      for (const wx of [600, 900, 1700, 1920]) {
        cutp(g, rectP(wx, 430, 100, 92), '#2a1c24', { light: LB, sh: .6, blur: 5, dist: 3, bev: { width: 1.8 } });
        g.fillStyle = wx === 900 ? '#f0c46e' : 'rgba(240,196,110,.35)'; g.fillRect(wx + 8, 438, 84, 76);
        cutp(g, rectP(wx - 8, 516, 116, 12), '#c9b38a', { light: LB, blur: 3, dist: 2, bev: { width: 1.4 } });
      }
      // posters
      [[560, 600, -.04, '#e8d9b8', 'guitar'], [720, 588, .03, '#2f7f7a', 'star'], [880, 606, -.02, '#c4493a', 'mic']].forEach(([px, py, rot, col, kind], i) => {
        g.save(); g.translate(px + 65, py + 95); g.rotate(rot);
        cutp(g, cutRect(-65, -95, 130, 190, rv, 1.2), col, { light: LB, blur: 5, dist: 3, bev: { width: 1.8 } });
        g.fillStyle = kind === 'mic' ? '#f2e5cb' : '#1e1a1a';
        if (kind === 'guitar') { g.fill(circ(-6, 30, 30)); g.fill(circ(0, -2, 22)); g.fillRect(-4, -80, 9, 80); g.fillStyle = col; g.fill(circ(-4, 18, 9)); }
        else if (kind === 'star') { g.fillStyle = '#f2e5cb'; g.fill(star4(0, -10, 46)); g.fill(star4(30, 50, 16)); }
        else { g.fill(circ(0, -40, 22)); g.fillRect(-3, -18, 6, 100); g.fillRect(-30, 78, 60, 7); }
        g.fillStyle = 'rgba(30,26,26,.55)'; g.fillRect(-48, 70, 96, 7); g.fillRect(-36, 82, 72, 5);
        g.restore();
      });
      // inside the door: warm light, a mic stand, string lights (shown as the door opens)
      const [dx, dy, dw, dh] = FAC.door;
      cutp(g, rectP(dx - 14, dy - 14, dw + 28, dh + 14), '#2a1c18', { light: LB, blur: 6, dist: 4, bev: { width: 2.2 } });
      g.fillStyle = vgrad(g, dy, dy + dh, [[0, '#ffe2a0'], [1, '#f0a44a']]); g.fillRect(dx, dy, dw, dh);
      g.fillStyle = 'rgba(70,30,20,.75)'; g.fillRect(dx + 104, dy + 96, 4, 150); g.fill(circ(dx + 106, dy + 92, 7)); g.fillRect(dx + 88, dy + 244, 36, 5);
      for (let i = 0; i < 8; i++) { g.fillStyle = '#fff4d0'; g.fill(circ(dx + 10 + i * 20, dy + 24 + Math.sin(i * 1.3) * 6, 3)); }
      // the wall lamp
      cutp(g, polyPath([[FAC.lamp[0] - 15, 632], [FAC.lamp[0] + 15, 632], [FAC.lamp[0] + 9, 660], [FAC.lamp[0] - 9, 660]]), '#2a1c18', { light: LB, blur: 3, dist: 2, bev: { width: 1.4 } });
      cutp(g, circ(FAC.lamp[0], 668, 10), '#ffe6a6', { light: LB, sh: .3, bev: { width: 1.2, hi: .5 } });
    } });
    const door = sp({ x: FAC.door[0] - 4, y: FAC.door[1] - 4, w: FAC.door[2] + 8, h: FAC.door[3] + 8, res: R(1.15), seed: 'door', shadow: { blur: 6 }, draw(g) {
      const [dx, dy, dw, dh] = FAC.door;
      g.fillStyle = '#4a2c1f'; g.fill(rectP(dx, dy, dw, dh));
      for (const [px, py, pw, ph] of [[16, 110, 128, 56], [16, 180, 128, 60]]) cutp(g, rectP(dx + px, dy + py, pw, ph), '#5a3626', { light: LB, sh: .4, blur: 3, dist: 2, bev: { width: 1.6 } });
      cutp(g, circ(dx + 80, dy + 58, 30), '#2a1c18', { light: LB, sh: .4, bev: { width: 1.6 } });
      g.fillStyle = '#f6c56a'; g.fill(circ(dx + 80, dy + 58, 24));
      cutp(g, circ(dx + 140, dy + 150, 6), '#c9b38a', { light: LB, sh: .4, bev: { width: 1 } });
    } });
    const marquee = sp({ x: FAC.marquee[0] - 30, y: FAC.marquee[1] - 30, w: FAC.marquee[2] + 60, h: FAC.marquee[3] + 90, res: R(1.2), seed: 'marquee', shadow: { blur: 12 }, draw(g) {
      const [mx, my, mw, mh] = FAC.marquee;
      cutp(g, rectP(mx + 30, my + mh, 10, 50), '#2a1c18', { light: LB, blur: 3, dist: 2 }); cutp(g, rectP(mx + mw - 40, my + mh, 10, 50), '#2a1c18', { light: LB, blur: 3, dist: 2 });
      cutp(g, rectP(mx, my, mw, mh), '#b8382d', { light: LB, sh: 0, bev: { width: 2.4 } });
      cutp(g, rectP(mx + 26, my + 26, mw - 52, mh - 52), '#f5e9cb', { light: LB, sh: .6, blur: 4, dist: 2, bev: { width: 1.8 } });
      g.font = '800 58px "Futura", "Avenir Next", "Helvetica Neue", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      const word = 'TONIGHT', tw = g.measureText(word).width, k = Math.min(1, (mw - 100) / tw);
      g.save(); g.translate(mx + mw / 2, my + mh / 2 + 3); g.scale(k, 1);
      // letters cut one by one, each with its own contact shadow
      let x = -tw / 2;
      for (const ch of word) { const w = g.measureText(ch).width; g.save(); PD.setShadow(g, { color: 'rgba(30,16,16,.35)', blur: 3, x: -LB[0] * 2, y: -LB[1] * 2 }); g.fillStyle = '#1e1a1a'; g.fillText(ch, x + w / 2, 0); g.restore(); x += w; }
      g.restore();
    } });
    planes.push({ name: 'facade', z: 1080, hinge: 910, sprites: [{ s: facade }], draw(g, t, env) {
      // the door opens inward about its left hinge, darkening as it turns
      const k = PD.E.io(ss(16.0, 16.8, t)), [dx, dy, dw] = FAC.door;
      if (k > 0) {
        PD.glow(g, dx + dw / 2, dy + 130, 260 * k, 'rgba(255,200,120,.55)', k);
      }
      g.save(); g.translate(dx, 0); g.scale(1 - .82 * k, 1); g.translate(-dx, 0); PD.drawPaper(g, door);
      if (k > 0) { g.globalCompositeOperation = 'source-atop'; g.fillStyle = `rgba(20,10,10,${.45 * k})`; g.fillRect(dx, dy, dw, 260); }
      g.restore();
      // marquee and its bulbs: a slow chase, never on/off
      g.save(); g.translate(-LB[0] * 10, -LB[1] * 10); PD.drawShadow(g, marquee, 0, 0, .45); g.restore();
      PD.drawPaper(g, marquee);
      const [mx, my, mw, mh] = FAC.marquee, bulbs = [];
      for (let x = mx + 13; x < mx + mw; x += 26) bulbs.push([x, my + 13], [x, my + mh - 13]);
      for (let y = my + 39; y < my + mh - 20; y += 26) bulbs.push([mx + 13, y], [mx + mw - 13, y]);
      bulbs.forEach(([bx, by], i) => {
        const b = .55 + .45 * Math.max(0, Math.sin(t * 3 - (bx + by) * .03));
        g.fillStyle = `rgb(${Math.round(200 + 55 * b)},${Math.round(160 + 70 * b)},${Math.round(90 + 60 * b)})`; g.beginPath(); g.arc(bx, by, 5.5, 0, 7); g.fill();
        PD.glow(g, bx, by, 22, 'rgba(255,214,140,.5)', b * .7);
      });
      PD.glow(g, FAC.lamp[0], 668, 90, 'rgba(255,214,150,.45)', .8 + .1 * Math.sin(t * 2));
    } });
    // the sidewalk
    const rw = new RNG('walk');
    planes.push({ name: 'walkB', z: 1000, hinge: 1090, sprites: [{ s: sp({ x: -1700, y: 860, w: 3900, h: 240, res: R(1.15), seed: 'walkB', shadow: { blur: 8 }, draw(g) {
      cutp(g, polyPath(tear([[-1700, 884], [2200, 884], [2200, 1090], [-1700, 1090]], { amp: 1.5, freq: .04, seed: 61 })), '#8b8da3', { light: LB, sh: 0, bev: { width: 2.4 } });
      for (let x = -1700; x < 2200; x += 150) { g.fillStyle = 'rgba(30,30,50,.35)'; g.fillRect(x + rw.range(-4, 4), 886, 3, 140); }
      for (let i = 0; i < 40; i++) cutp(g, smoothPath(ellipsePts(rw.range(-1680, 2180), rw.range(900, 1020), rw.range(14, 40), rw.range(3, 6), 12)), rw.pick(['#9496ab', '#7f8198']), { light: LB, sh: 0, bev: { width: 1, hi: .15, lo: .12 } });
      cutp(g, cutRect(-1700, 1028, 3900, 64, rw, 1.5), '#6e7086', { light: LB, blur: 5, dist: 3, bev: { width: 2.2 } });
    } }) }], draw(g, t) {
      // the door's light spilling over the pavement
      const k = PD.E.io(ss(16.05, 16.9, t));
      if (k <= 0) return;
      const [dx, , dw] = FAC.door, ox = 0;   // at the reference camera the facade and the sidewalk line up
      g.save(); g.globalCompositeOperation = 'screen'; g.globalAlpha = .55 * k;
      const gr = g.createLinearGradient(0, 905, 0, 1080); gr.addColorStop(0, 'rgba(255,200,120,1)'); gr.addColorStop(1, 'rgba(255,170,90,0)');
      g.fillStyle = gr; g.fill(polyPath([[dx + ox, 900], [dx + dw + ox, 900], [dx + dw + 150 + ox, 1080], [dx - 120 + ox, 1080]]));
      g.restore();
    } });
    // lamp post, hydrant, a sandwich board
    planes.push({ name: 'nearB', z: 640, hinge: 1094, sprites: [
      { s: sp({ x: 60, y: 90, w: 160, h: 1010, res: R(1.3), seed: 'lamp', shadow: { blur: 12 }, draw(g) {
        cutp(g, polyPath([[124, 1090], [128, 220], [152, 220], [156, 1090]]), '#24263a', { light: LB, sh: 0, bev: { width: 2.2 } });
        cutp(g, rectP(110, 1040, 60, 50), '#24263a', { light: LB, blur: 4, dist: 3, bev: { width: 2 } });
        cutp(g, polyPath([[100, 230], [180, 230], [168, 170], [112, 170]]), '#2f3148', { light: LB, blur: 5, dist: 3, bev: { width: 2 } });
        cutp(g, rectP(116, 176, 48, 50), '#ffe6a6', { light: LB, sh: .3, bev: { width: 1.4, hi: .5 } });
        cutp(g, polyPath([[96, 172], [140, 128], [184, 172]]), '#24263a', { light: LB, blur: 4, dist: 3, bev: { width: 2 } });
      } }) },
      { s: sp({ x: 860, y: 970, w: 90, h: 130, res: R(1.3), seed: 'hydrant', shadow: { blur: 9 }, draw(g) {
        cutp(g, smoothPath([[880, 1090], [880, 1010], [905, 990], [930, 1010], [930, 1090]], .4), '#c4493a', { light: LB, sh: 0, bev: { width: 2 } });
        cutp(g, rectP(868, 1030, 74, 16), '#a93b2f', { light: LB, blur: 3, dist: 2, bev: { width: 1.6 } });
        cutp(g, circ(905, 988, 9), '#a93b2f', { light: LB, blur: 3, dist: 2, bev: { width: 1.4 } });
      } }) },
      { s: sp({ x: 1580, y: 900, w: 180, h: 200, res: R(1.3), seed: 'board', shadow: { blur: 10 }, draw(g) {
        cutp(g, polyPath([[1600, 1092], [1640, 930], [1700, 930], [1740, 1092]]), '#2a1c18', { light: LB, sh: 0, bev: { width: 2 } });
        cutp(g, polyPath([[1612, 1080], [1646, 944], [1694, 944], [1728, 1080]]), '#f2e5cb', { light: LB, sh: .5, blur: 3, dist: 2, bev: { width: 1.6 } });
        g.fillStyle = '#c4493a'; g.fill(star4(1670, 990, 22)); g.fillStyle = '#1e1a1a'; g.fill(circ(1662, 1046, 14)); g.fill(circ(1668, 1028, 10)); g.fillRect(1668, 1000, 4, 30);
      } }) },
    ], draw(g, t) { PD.glow(g, 140, 200, 150, 'rgba(255,214,150,.5)', .75); } });
    // each plane is authored at the reference camera, so offset it by the parallax it would have there
    return planes.map((P) => ({ ...P, light: LB, scene: 'B', ox: camRef * F / P.z, FAC }));
  }

  return { buildA, buildB, LA, LB };
})();
