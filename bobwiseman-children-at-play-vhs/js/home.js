// home.js · stage 1: the home video as the camcorder recorded it, 960 x 720 (4:3), before any tape.
// Draws whichever scene (js/scenes/*.js, contract in js/scenes.js) owns time t: the world through its camera, soft
// shadows, back-lit shapes with their rim, the bright source's bloom, then the camcorder's own optics (focus hunt,
// auto-iris, pan smear), the burned-in date stamp, and the record-restart tear at every take's first frames.
// home.html?scene=<id>&t=<s> draws one scene; ?offline=1 is the render contract (__ready, __frameJPEG).
(function () {
  const W = 960, H = 720;
  const out = document.getElementById('c'), o = out.getContext('2d');
  const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
  const scene = mk(), sg = scene.getContext('2d');
  const shadowL = mk(), shg = shadowL.getContext('2d');
  const silL = mk(), slg = silL.getContext('2d');
  const prevShot = mk(), pvg = prevShot.getContext('2d');
  const qs = new URLSearchParams(location.search);
  const only = qs.get('scene');

  const sceneAt = (t) => (only ? SCENE.get(only) : SCENE.at(t));
  function camXf(g, cam) {
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.translate(W / 2, H / 2); g.rotate(cam.roll); g.scale(cam.z, cam.z); g.translate(-cam.cx, -cam.cy);
  }
  function toScreen(cam, x, y) {
    const dx = (x - cam.cx) * cam.z, dy = (y - cam.cy) * cam.z, c = Math.cos(cam.roll), s = Math.sin(cam.roll);
    return [W / 2 + dx * c - dy * s, H / 2 + dx * s + dy * c];
  }
  function drawScene(S, t, cam) {
    camXf(sg, cam); sg.globalAlpha = 1; sg.filter = 'none'; sg.globalCompositeOperation = 'source-over';
    S.bg(sg, t);
    if (S.shadows) {
      shg.setTransform(1, 0, 0, 1, 0, 0); shg.clearRect(0, 0, W, H); camXf(shg, cam);
      S.shadows(shg, t);
      sg.setTransform(1, 0, 0, 1, 0, 0);
      sg.globalAlpha = 0.34; sg.filter = `blur(${(1.2 * cam.z).toFixed(2)}px)`; sg.drawImage(shadowL, 0, 0);
      sg.globalAlpha = 1; sg.filter = 'none';
    }
    slg.setTransform(1, 0, 0, 1, 0, 0); slg.clearRect(0, 0, W, H); camXf(slg, cam);
    S.shapes(slg, t);
    const L = S.light;
    BACKLIGHT.composite(sg, silL, { rim: L.rim, glow: L.glow, glowBlur: L.glowBlur * cam.z, rimW: L.rimW * cam.z, sunDir: L.sunDir || [0, -1], strength: L.strength });
    if (S.over) { camXf(sg, cam); S.over(sg, t); }
    sg.setTransform(1, 0, 0, 1, 0, 0);
    // the bright source blooms over everything near it, and the lens throws two faint ghosts across the centre
    const src = S.source ? S.source(t) : null;
    let ss = null;
    if (src) {
      ss = toScreen(cam, src.x, src.y);
      sg.globalCompositeOperation = 'screen';
      const a = src.a == null ? 1 : src.a;
      const b = sg.createRadialGradient(ss[0], ss[1], 2, ss[0], ss[1], src.r * Math.sqrt(cam.z));
      b.addColorStop(0, `rgba(255,250,232,${0.95 * a})`); b.addColorStop(0.12, `rgba(255,236,190,${0.55 * a})`); b.addColorStop(0.5, `rgba(255,214,150,${0.14 * a})`); b.addColorStop(1, 'rgba(255,210,150,0)');
      sg.fillStyle = b; sg.fillRect(0, 0, W, H);
      const on = Math.max(0, 1 - Math.hypot(ss[0] - W / 2, ss[1] - H / 2) / 700) * a;
      for (const [k, r, al] of [[0.55, 30, 0.10], [1.3, 54, 0.07]]) {
        const gx = W / 2 + (W / 2 - ss[0]) * k, gy = H / 2 + (H / 2 - ss[1]) * k;
        sg.fillStyle = `rgba(190,230,255,${al * on})`; sg.beginPath(); sg.arc(gx, gy, r, 0, Math.PI * 2); sg.fill();
      }
      sg.globalCompositeOperation = 'source-over';
    }
    return ss;
  }
  // default auto-iris: stops down when the bright source is in frame
  function exposure(S, cam, ss) {
    if (S.exposure) return S.exposure(cam, ss);
    const g = S.grade || {}, base = g.bright == null ? 1 : g.bright;
    const inF = ss ? Math.max(0, 1 - Math.max(Math.abs(ss[0] - W / 2) / (W * 0.62), Math.abs(ss[1] - H / 2) / (H * 0.7))) : 0;
    return { bright: base - 0.1 * inF, contrast: (g.contrast || 1.05) + 0.04 * inF, sat: g.sat || 1.04 };
  }
  function velocity(S, t) {
    const dt = 1 / 48;
    if (t - dt < S.t0 || t + dt >= S.t1 || [].concat(S.takes || []).some((k) => Math.abs(t - k) < dt * 1.01)) return [0, 0];
    const a = S.camera(t - dt), b = S.camera(t + dt);
    return [(b.cx - a.cx) * b.z / 2, (b.cy - a.cy) * b.z / 2];
  }
  function optics(S, t, cam, ss) {
    const ex = exposure(S, cam, ss);
    const v = velocity(S, t), speed = Math.hypot(v[0], v[1]);
    o.setTransform(1, 0, 0, 1, 0, 0);
    o.filter = `blur(${Math.max(0, cam.focus || 0).toFixed(2)}px) brightness(${ex.bright.toFixed(3)}) contrast(${ex.contrast.toFixed(3)}) saturate(${ex.sat})`;
    o.fillStyle = '#000'; o.fillRect(0, 0, W, H);
    if (speed > 3) {  // camcorder shutter at 1/60 smears a fast pan
      const n = Math.min(9, Math.max(2, Math.ceil(speed / 4)));  // at least 2: one copy would divide by zero
      for (let i = 0; i < n; i++) {
        const k = (i / (n - 1) - 0.5) * 0.9;
        o.globalAlpha = i === 0 ? 1 : 1 / (i + 1);
        o.drawImage(scene, -v[0] * k, -v[1] * k);
      }
      o.globalAlpha = 1;
    } else o.drawImage(scene, 0, 0);
    o.filter = 'none';
    const vg = o.createRadialGradient(W / 2, H / 2, H * 0.42, W / 2, H / 2, H * 0.92);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(20,10,0,.38)');
    o.fillStyle = vg; o.fillRect(0, 0, W, H);
  }
  function stamp(S, t) {
    const st = S.stamp ? S.stamp(t) : null;
    if (!st) return;
    const cell = 3.2, edge = 'rgba(10,10,10,.9)';
    if (st.time) PIXFONT.text(o, st.time, W - 70 - PIXFONT.width(st.time, cell), H - 98, cell, '#f4f1e6', edge);
    if (st.date) PIXFONT.text(o, st.date, W - 70 - PIXFONT.width(st.date, cell), H - 66, cell, '#f4f1e6', edge);
  }
  // record pause, record: the first frames of a new take roll and tear before the servo locks
  function restartGlitch(S, t) {
    const starts = [S.t0].concat(S.takes || []).filter((k) => k > 0.01);
    const fNow = Math.round(t * 24);
    const k = starts.find((s) => { const f = fNow - Math.round(s * 24); return f >= 0 && f <= 3; });
    if (k == null) return;
    const f = fNow - Math.round(k * 24);
    const roll = [0.34, 0.14, 0.05, 0.012][f] * H;
    pvg.setTransform(1, 0, 0, 1, 0, 0); pvg.drawImage(out, 0, 0);
    o.fillStyle = '#000'; o.fillRect(0, 0, W, H);
    o.drawImage(prevShot, 0, roll); o.drawImage(prevShot, 0, roll - H);
    const band = 26 - f * 5;
    o.fillStyle = '#0b0b0e'; o.fillRect(0, roll - band, W, band);
    for (let y = roll - band; y < roll + 18; y += 2) {
      const sh = (Math.sin(y * 12.9898 + f * 78.233 + k) * 43758.5453) % 1;
      o.drawImage(prevShot, 0, Math.max(0, y), W, 2, sh * (40 - f * 10), Math.max(0, y), W, 2);
    }
    if (f === 0) {  // a flash of rainbow noise in the tear
      const cols = ['rgba(255,60,60,.35)', 'rgba(60,255,90,.3)', 'rgba(80,90,255,.35)'];
      for (let i = 0; i < 9; i++) { o.fillStyle = cols[i % 3]; o.fillRect(0, roll - band + i * 3, W, 3); }
    }
  }
  function draw(t) {
    const S = sceneAt(t);
    const cam = S.camera(t);
    const ss = drawScene(S, t, cam);
    optics(S, t, cam, ss);
    if (S.post) { o.setTransform(1, 0, 0, 1, 0, 0); S.post(o, t); }
    restartGlitch(S, t);
    stamp(S, t);
  }
  window.__ready = Promise.resolve();
  window.__frameJPEG = (t, q = 0.92) => { draw(t); return out.toDataURL('image/jpeg', q); };
  window.__draw = draw;
  if (!qs.has('offline')) draw(Number(qs.get('t') || 8));
})();
