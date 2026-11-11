// home.js · stage 1: the home video as the camcorder recorded it, 960 x 720 (4:3), before any tape.
// Scene through the camera, long shadows, back-lit shapes with their rim, the sun's bloom, then the camcorder's own
// optics (focus hunt, auto-iris, pan smear), the burned-in date stamp, and the record-restart glitch at the cut.
(function () {
  const W = 960, H = 720;
  const T = window.TIMING, { SUN } = window.WORLD;
  const out = document.getElementById('c'), o = out.getContext('2d');
  const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
  const scene = mk(), sg = scene.getContext('2d');
  const shadowL = mk(), shg = shadowL.getContext('2d');
  const silL = mk(), slg = silL.getContext('2d');
  const prevShot = mk(), pvg = prevShot.getContext('2d');

  function camXf(g, cam) {
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.translate(W / 2, H / 2); g.rotate(cam.roll); g.scale(cam.z, cam.z); g.translate(-cam.cx, -cam.cy);
  }
  function sunScreen(cam) {
    const dx = (SUN[0] - cam.cx) * cam.z, dy = (SUN[1] - cam.cy) * cam.z;
    const c = Math.cos(cam.roll), s = Math.sin(cam.roll);
    return [W / 2 + dx * c - dy * s, H / 2 + dx * s + dy * c];
  }
  // draw the scene (no optics) for time t into the scene canvas
  function drawScene(t, cam) {
    camXf(sg, cam); sg.globalAlpha = 1; sg.filter = 'none';
    WORLD.bg(sg, t);
    shg.setTransform(1, 0, 0, 1, 0, 0); shg.clearRect(0, 0, W, H); camXf(shg, cam);
    WORLD.shadows(shg, t);
    sg.setTransform(1, 0, 0, 1, 0, 0);
    sg.globalAlpha = 0.34; sg.filter = `blur(${(1.2 * cam.z).toFixed(2)}px)`; sg.drawImage(shadowL, 0, 0);
    sg.globalAlpha = 1; sg.filter = 'none';
    slg.setTransform(1, 0, 0, 1, 0, 0); slg.clearRect(0, 0, W, H); camXf(slg, cam);
    WORLD.shapes(slg, t);
    const ss = sunScreen(cam);
    BACKLIGHT.composite(sg, silL, { rim: '#ffd890', glow: 'rgba(255,198,120,.85)', glowBlur: 7 * cam.z, rimW: 1.25 * cam.z, sunDir: [0, -1] });
    camXf(sg, cam); WORLD.crownLight(sg, t); sg.setTransform(1, 0, 0, 1, 0, 0);
    // the sun blooms over everything near it, and the lens throws two faint ghosts across the centre
    sg.globalCompositeOperation = 'screen';
    const b = sg.createRadialGradient(ss[0], ss[1], 2, ss[0], ss[1], 330 * Math.sqrt(cam.z));
    b.addColorStop(0, 'rgba(255,250,232,.95)'); b.addColorStop(0.12, 'rgba(255,236,190,.55)'); b.addColorStop(0.5, 'rgba(255,214,150,.14)'); b.addColorStop(1, 'rgba(255,210,150,0)');
    sg.fillStyle = b; sg.fillRect(0, 0, W, H);
    const on = Math.max(0, 1 - Math.hypot(ss[0] - W / 2, ss[1] - H / 2) / 700);
    for (const [k, r, a] of [[0.55, 30, 0.10], [1.3, 54, 0.07]]) {
      const gx = W / 2 + (W / 2 - ss[0]) * k, gy = H / 2 + (H / 2 - ss[1]) * k;
      sg.fillStyle = `rgba(190,230,255,${a * on})`; sg.beginPath(); sg.arc(gx, gy, r, 0, Math.PI * 2); sg.fill();
    }
    sg.globalCompositeOperation = 'source-over';
    return ss;
  }
  // auto-iris: stops down when the sun is in frame, opens up in the shade under the tree
  function exposure(cam, ss) {
    const sunIn = Math.max(0, 1 - Math.max(Math.abs(ss[0] - W / 2) / (W * 0.62), Math.abs(ss[1] - H / 2) / (H * 0.7)));
    const shade = Math.max(0, Math.min(1, (cam.cx - 1680) / 160));
    return { bright: 1.0 - 0.1 * sunIn + 0.1 * shade, contrast: 1.05 + 0.04 * sunIn, sat: 1.04 };
  }
  function optics(t, cam, ss, src) {
    const ex = exposure(cam, ss);
    const v = CAMERA.velocity(t);
    const speed = Math.hypot(v[0], v[1]);
    o.setTransform(1, 0, 0, 1, 0, 0);
    o.filter = `blur(${cam.focus.toFixed(2)}px) brightness(${ex.bright.toFixed(3)}) contrast(${ex.contrast.toFixed(3)}) saturate(${ex.sat})`;
    o.fillStyle = '#000'; o.fillRect(0, 0, W, H);
    if (speed > 3) {  // camcorder shutter at 1/60 smears a fast pan
      const n = Math.min(9, Math.ceil(speed / 4));
      for (let i = 0; i < n; i++) {
        const k = (i / (n - 1) - 0.5) * 0.9;
        o.globalAlpha = i === 0 ? 1 : 1 / (i + 1);
        o.drawImage(src, -v[0] * k, -v[1] * k);
      }
      o.globalAlpha = 1;
    } else o.drawImage(src, 0, 0);
    o.filter = 'none';
    // camcorder lens: soft corners and a warm white balance
    const vg = o.createRadialGradient(W / 2, H / 2, H * 0.42, W / 2, H / 2, H * 0.92);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(20,10,0,.38)');
    o.fillStyle = vg; o.fillRect(0, 0, W, H);
  }
  function stamp(t) {
    const time = t < T.cut ? ' 5:41PM' : ' 5:44PM';
    const cell = 3.2, edge = 'rgba(10,10,10,.9)';
    const l1 = 'AUG.17 1991', l2 = time.trim();
    const x1 = W - 70 - PIXFONT.width(l1, cell), x2 = W - 70 - PIXFONT.width(l2, cell);
    PIXFONT.text(o, l2, x2, H - 98, cell, '#f4f1e6', edge);
    PIXFONT.text(o, l1, x1, H - 66, cell, '#f4f1e6', edge);
  }
  // record pause, record: the first frames of a new take roll and tear before the servo locks
  function restartGlitch(t) {
    const f = Math.round(t * 24) - Math.round(T.cut * 24);
    if (f < 0 || f > 3) return;
    const roll = [0.34, 0.14, 0.05, 0.012][f] * H;
    const snap = prevShot;
    pvg.setTransform(1, 0, 0, 1, 0, 0); pvg.drawImage(out, 0, 0);
    o.fillStyle = '#000'; o.fillRect(0, 0, W, H);
    o.drawImage(snap, 0, roll); o.drawImage(snap, 0, roll - H);
    const band = 26 - f * 5;
    o.fillStyle = '#0b0b0e'; o.fillRect(0, roll - band, W, band);
    for (let y = roll - band; y < roll + 18; y += 2) {
      const sh = (Math.sin(y * 12.9898 + f * 78.233) * 43758.5453) % 1;
      o.drawImage(snap, 0, Math.max(0, y), W, 2, sh * (40 - f * 10), Math.max(0, y), W, 2);
    }
    if (f === 0) {  // a flash of rainbow noise in the tear
      const cols = ['rgba(255,60,60,.35)', 'rgba(60,255,90,.3)', 'rgba(80,90,255,.35)'];
      for (let i = 0; i < 9; i++) { o.fillStyle = cols[i % 3]; o.fillRect(0, roll - band + i * 3, W, 3); }
    }
  }
  function draw(t) {
    const cam = CAMERA.at(t);
    const ss = drawScene(t, cam);
    optics(t, cam, ss, scene);
    restartGlitch(t);
    stamp(t);
  }
  window.__ready = Promise.resolve();
  window.__frameJPEG = (t, q = 0.92) => { draw(t); return out.toDataURL('image/jpeg', q); };
  window.__draw = draw;
  const qs = new URLSearchParams(location.search);
  if (!qs.has('offline')) draw(Number(qs.get('t') || 8));
})();
