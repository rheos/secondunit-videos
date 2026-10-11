// Look 2 (tv): 1970s Saturday-morning TV, song 95.916667-123.125 (f2302-f2955). Pure function of song time t.
// Program (960x720) -> signal (vertical roll, closed captions) -> CRT (WebGL) -> living room composite.
const out = document.getElementById('c'); out.width = W; out.height = H;
const g = out.getContext('2d');
const PROG = mkCanvas(960, 720), pg = PROG.getContext('2d');
const SIG = mkCanvas(960, 720), sg = SIG.getContext('2d');
const AVG = mkCanvas(8, 6), ag = AVG.getContext('2d', { willReadFrequently: true });

// every frame starts from the same 2D state (render workers draw frames out of order)
function resetCtx(c) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.filter = 'none';
  c.lineCap = 'butt'; c.lineJoin = 'miter'; c.lineWidth = 1; c.setLineDash([]); c.shadowBlur = 0; c.shadowColor = 'rgba(0,0,0,0)';
  c.textAlign = 'start'; c.textBaseline = 'alphabetic'; c.font = '10px sans-serif'; c.fillStyle = '#000'; c.strokeStyle = '#000';
}
function program(t) {
  resetCtx(pg);
  pg.fillStyle = '#000'; pg.fillRect(0, 0, 960, 720);
  if (t < B.card) { drawShow(pg, t); return; }
  if (t < B.adStart) { drawCard(pg, t); return; }
  const f = Math.round(t * 24);
  pg.save();
  pg.translate(n1(71, f * .7) * 1.2, n1(72, f * .7) * 1.6);   // gate weave
  if (t < B.inA) sceneClownKids(pg, t);
  else if (t < B.tell) sceneStore(pg, t);
  else if (t < B.ifYou) sceneSing(pg, t);
  else if (t < B.endCard) sceneParty(pg, t);
  else if (t < B.counter) sceneEndCard(pg, t, ROOM.spent.map(c => ({ t: c.t + .42, x: c.hx, y: c.hy })));
  else sceneCounter(pg, t);
  pg.restore();
  filmLook(pg, t);
  drawSA(pg, t);
}
function signal(t) {
  resetCtx(sg);
  sg.fillStyle = '#000'; sg.fillRect(0, 0, 960, 720);
  if (t >= B.stopped && t < B.rollEnd) {
    // the vertical hold slips: the picture rolls once through the blanking bar, tearing sideways
    const u = (t - B.stopped) / (B.rollEnd - B.stopped), off = (720 + 64) * (1 - (1 - u) ** 2.2);
    const f = Math.round(t * 24);
    for (let k = 0; k < 24; k++) {
      const y0 = k * 30, dx = n1(90 + f, k * .4) * 26 * Math.sin(u * Math.PI);
      for (const base of [-off, -off + 784]) sg.drawImage(PROG, 0, y0, 960, 30, dx, base + y0, 960, 30);
    }
    sg.fillStyle = '#000'; sg.fillRect(0, 720 - off, 960, 64);
    sg.fillStyle = '#141414'; sg.fillRect(0, 720 - off + 22, 960, 16);
  } else sg.drawImage(PROG, 0, 0);
  drawCC(sg, t);
}
function crtParams(t) {
  const f = Math.round(t * 24);
  const o = { frame: f, snow: .03, jit: .5, chroma: 1.12, raster: [1, 1], bright: 1, dot: 0, over: .94 };
  if (t < B.on) { o.bright = 0; o.raster = [.01, .01]; }
  else if (t < B.on + .6) {
    const u = (t - B.on) / .6;
    o.raster = [lerp(.012, 1, smooth(clamp(u * 1.7))), lerp(.008, 1, smooth(clamp((u - .18) * 1.6)))];
    o.dot = (1 - clamp(u * 1.6)) ** 2;
    o.bright = 1 + 1.3 * (1 - u) ** 2;
    o.snow = .03 + .1 * (1 - u);
  }
  if (t >= B.stopped && t < B.rollEnd + .05) { o.snow = .1; o.jit = 4; }
  if (t >= B.adStart) o.snow = .022;
  return o;
}
function avgColor() {
  ag.drawImage(SIG, 0, 0, 8, 6);
  const d = ag.getImageData(0, 0, 8, 6).data; let r = 0, gg = 0, b = 0;
  for (let i = 0; i < d.length; i += 4) { r += d[i]; gg += d[i + 1]; b += d[i + 2]; }
  const n = d.length / 4; return [r / n, gg / n, b / n];
}
function renderFrame(t) {
  const cam = cameraAt(t);
  program(t);
  signal(t);
  const cp = crtParams(t);
  const tube = CRT.render(SIG, cp);
  const avg = avgColor(), lit = clamp(cp.bright) * Math.min(1, cp.raster[0] * cp.raster[1] * 1.2);
  const glow = mix([150, 170, 210], avg, .6).map(v => Math.min(255, v * 1.25));
  resetCtx(g);
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  const [sx, sy] = toFrame(cam, SCR.x, SCR.y);
  g.drawImage(tube, sx, sy, SCR.w * cam.z, SCR.h * cam.z);
  drawGlass(g, cam);
  drawRoomLayer(g, cam);
  drawGlow(g, cam, glow, lit);
  drawGrilleCoins(g, cam, t);
  drawKing(g, cam, t, glow, lit);
  spentCoins(g, cam, t);
  drawGrain(g, t, .07);
}

const READY = document.fonts.load('bold 48px "Cooper Lt BT"').then(() => {
  initCC(); initShow(); initAd(); initRoom(); initSA(pg); checkBall();
  return true;
});
startPage(out, renderFrame, T0, T1, READY);
