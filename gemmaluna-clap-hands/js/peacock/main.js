// Clap Hands peacock look test, frame assembly (ported from In Her Dream js/cut/main.js). Each shot draws into its own buffer; transitions
// combine buffers like paper being moved by hand. Then the whole frame gets the paper finish.
const cv = document.getElementById('c'); cv.width = W; cv.height = H;
const out = cv.getContext('2d');
const mkBuf = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
const BUF = [mkBuf(), mkBuf()];

function drawShot(sh, t, buf) {
  g = buf.getContext('2d');
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
  g.clearRect(0, 0, W, H);
  const tt = sh.o.smooth ? t : twos(t);
  try { sh.fn(tt, clamp((tt - sh.a) / (sh.b - sh.a)), tt - sh.a, t); } catch (e) { console.error(sh.name, e); }
}

function frame(t) {
  out.setTransform(1, 0, 0, 1, 0, 0); out.globalAlpha = 1; out.globalCompositeOperation = 'source-over';
  out.fillStyle = '#000'; out.fillRect(0, 0, W, H);
  // the shot that owns t, and the one before it if t is inside this shot's transition-in
  let cur = -1;
  for (let k = 0; k < SHOTS.length; k++) if (t >= SHOTS[k].a && t < SHOTS[k].b) cur = k;
  if (cur < 0) { cur = SHOTS.length - 1; for (let k = 0; k < SHOTS.length; k++) if (SHOTS[k].a > t) { cur = Math.max(0, k - 1); break; } }
  const sh = SHOTS[cur], prev = SHOTS[cur - 1];
  const xin = sh.o.xin || 0;
  const k = xin ? clamp((t - sh.a) / xin) : 1;
  drawShot(sh, t, BUF[0]);
  if (k < 1 && prev) {
    drawShot(prev, t, BUF[1]);
    const e = eio(k), tr = sh.o.tr || 'fade';
    out.drawImage(BUF[1], 0, 0);
    if (tr === 'fade') { out.globalAlpha = e; out.drawImage(BUF[0], 0, 0); out.globalAlpha = 1; }
    else if (tr === 'slide' || tr === 'slideL') {
      // the new scene is a sheet slid in over the old one, its leading edge casting a shadow
      const dir = tr === 'slide' ? 1 : -1, x = dir * (1 - e) * W;
      out.save(); out.shadowColor = 'rgba(15,10,25,.45)'; out.shadowBlur = 40; out.shadowOffsetX = -dir * 14;
      out.drawImage(BUF[0], x, 0); out.restore();
    } else if (tr === 'rise') {
      const y = (1 - e) * H; out.save(); out.shadowColor = 'rgba(15,10,25,.45)'; out.shadowBlur = 40; out.shadowOffsetY = -14;
      out.drawImage(BUF[0], 0, y); out.restore();
    } else if (tr === 'iris') {
      out.save(); const p = new Path2D(); p.arc(sh.o.ix || W / 2, sh.o.iy || H / 2, e * 2000, 0, Math.PI * 2);
      out.clip(p); out.drawImage(BUF[0], 0, 0); out.restore();
    } else if (tr === 'wipe') {
      // a torn edge sweeps left to right
      out.save(); const p = new Path2D(); const x = lerp(-80, W + 80, e); p.moveTo(-10, -10);
      for (let i = 0; i <= 20; i++) p.lineTo(x + (hash(i * 3.3) - .5) * 60, i * H / 20);
      p.lineTo(-10, H + 10); p.closePath(); out.clip(p); out.drawImage(BUF[0], 0, 0); out.restore();
    }
  } else out.drawImage(BUF[0], 0, 0);

  // the paper finish over everything: grain, mottling, a warm vignette
  out.globalAlpha = .3; out.globalCompositeOperation = 'overlay'; out.drawImage(GRAIN, 0, 0);
  out.globalAlpha = .3; out.drawImage(MOTTLE, 0, 0);
  out.globalCompositeOperation = 'multiply'; out.globalAlpha = 1;
  const v = out.createRadialGradient(W / 2, H / 2, H * .45, W / 2, H / 2, H * 1.05); v.addColorStop(0, 'rgba(255,255,255,0)'); v.addColorStop(1, 'rgba(40,30,60,.4)');
  out.fillStyle = v; out.fillRect(0, 0, W, H);
  out.globalCompositeOperation = 'source-over';
  posterBorder(out);
  // head of the film: the picture fades up from black over 1.5 s (the audio is untouched)
  const fin = clamp((t - START) / 1.5); if (fin < 1) { out.globalAlpha = 1 - fin; out.fillStyle = '#000'; out.fillRect(0, 0, W, H); out.globalAlpha = 1; }
}

window.__frameJPEG = (t, q = .93) => { frame(t); return cv.toDataURL('image/jpeg', q); };
window.__ready = Promise.resolve(true);
const params = new URLSearchParams(location.search);
if (!params.has('offline')) {
  const audio = document.getElementById('a');
  const T0 = parseFloat(params.get('a') || START), T1 = parseFloat(params.get('b') || END);
  audio.currentTime = params.has('t') ? parseFloat(params.get('t')) : T0;
  (function loop() { let t = audio.currentTime || T0; if (t >= T1) { audio.currentTime = T0; t = T0; } frame(t); requestAnimationFrame(loop); })();
  const toggle = () => audio.paused ? audio.play() : audio.pause();
  cv.onclick = toggle; addEventListener('keydown', (e) => { if (e.code === 'Space') { e.preventDefault(); toggle(); } });
}
