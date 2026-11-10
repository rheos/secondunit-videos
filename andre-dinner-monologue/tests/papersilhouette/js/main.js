// Frame assembly: each shot draws into its own buffer; transitions combine buffers like paper moved
// by hand; then the whole frame gets the paper finish. Pure function of t; ?t= seeks, ?w= sets the
// output width (the picture is always drawn at 720x1280 and scaled).
const params = new URLSearchParams(location.search);
const OUTW = parseInt(params.get('w') || '720', 10), OUTH = Math.round(OUTW * H / W);
const cv = document.getElementById('c'); cv.width = OUTW; cv.height = OUTH;
const out = cv.getContext('2d');
const mkBuf = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
const BUF = [mkBuf(), mkBuf(), mkBuf()];

function drawShot(sh, t, buf) {
  g = buf.getContext('2d');
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
  g.clearRect(0, 0, W, H);
  const tt = sh.o.smooth ? t : twos(t);
  try { sh.fn(tt, clamp((tt - sh.a) / (sh.b - sh.a)), tt - sh.a, t); } catch (e) { console.error(sh.name, e); }
}
function compose(t) {
  const o = BUF[2].getContext('2d');
  o.setTransform(1, 0, 0, 1, 0, 0); o.globalAlpha = 1; o.globalCompositeOperation = 'source-over';
  o.fillStyle = '#000'; o.fillRect(0, 0, W, H);
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
    o.drawImage(BUF[1], 0, 0);
    if (tr === 'fade') { o.globalAlpha = e; o.drawImage(BUF[0], 0, 0); o.globalAlpha = 1; }
    else if (tr === 'rise') {
      // the new scene is a sheet slid up over the old one, its leading edge casting a shadow
      const y = Math.round((1 - e) * H); o.save(); o.shadowColor = 'rgba(15,10,25,.45)'; o.shadowBlur = 30; o.shadowOffsetY = -10;
      o.drawImage(BUF[0], 0, y); o.restore();
    } else if (tr === 'drop') {
      const y = -Math.round((1 - e) * H); o.save(); o.shadowColor = 'rgba(15,10,25,.45)'; o.shadowBlur = 30; o.shadowOffsetY = 10;
      o.drawImage(BUF[0], 0, y); o.restore();
    }
  } else o.drawImage(BUF[0], 0, 0);
  // the paper finish over everything: grain, mottling, a faint warm vignette
  o.globalAlpha = .28; o.globalCompositeOperation = 'overlay'; o.drawImage(GRAIN, 0, 0);
  o.globalAlpha = .26; o.drawImage(MOTTLE, 0, 0);
  o.globalCompositeOperation = 'multiply'; o.globalAlpha = 1;
  const v = o.createRadialGradient(W / 2, H / 2, H * .42, W / 2, H / 2, H * .95); v.addColorStop(0, 'rgba(255,255,255,0)'); v.addColorStop(1, 'rgba(110,70,85,.30)');
  o.fillStyle = v; o.fillRect(0, 0, W, H);
  o.globalCompositeOperation = 'source-over';
}
function frame(t) {
  compose(t);
  out.setTransform(1, 0, 0, 1, 0, 0); out.imageSmoothingQuality = 'high';
  out.drawImage(BUF[2], 0, 0, W, H, 0, 0, OUTW, OUTH);
}

window.__frameJPEG = (t, q = .93) => { frame(t); return cv.toDataURL('image/jpeg', q); };
window.__ready = Promise.resolve(true);
if (!params.has('offline')) {
  const audio = document.getElementById('a');
  const T0 = parseFloat(params.get('a') || 106), T1 = parseFloat(params.get('b') || 141);
  audio.currentTime = params.has('t') ? parseFloat(params.get('t')) : T0;
  (function loop() { let t = audio.currentTime || T0; if (t >= T1) { audio.currentTime = T0; t = T0; } frame(t); requestAnimationFrame(loop); })();
  const toggle = () => audio.paused ? audio.play() : audio.pause();
  cv.onclick = toggle; addEventListener('keydown', (e) => { if (e.code === 'Space') { e.preventDefault(); toggle(); } });
}
