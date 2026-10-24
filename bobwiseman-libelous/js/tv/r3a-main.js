// Round 3, tv-A (looks/tv-r3a.html): stanzas 0-5 as the evening news, song 0-95.916667 (f0-f2302).
// Same pipeline as rounds 1 and 2 (js/tv/main.js, r2_main.js): program (960x720) -> signal with the wire copy ->
// CRT (WebGL) -> the living-room composite. Own canvases and functions; the kit files are loaded read-only.
// Pure function of song time t.
const r3aTvOut = document.getElementById('c'); r3aTvOut.width = W; r3aTvOut.height = H;
const r3aTvG = r3aTvOut.getContext('2d');
const r3aTvPROG = mkCanvas(960, 720), r3aTvPG = r3aTvPROG.getContext('2d');
const r3aTvSIG = mkCanvas(960, 720), r3aTvSG = r3aTvSIG.getContext('2d');
const r3aTvAVG = mkCanvas(8, 6), r3aTvAG = r3aTvAVG.getContext('2d', { willReadFrequently: true });
function r3aTvReset(c) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.filter = 'none';
  c.lineCap = 'butt'; c.lineJoin = 'miter'; c.lineWidth = 1; c.setLineDash([]); c.shadowBlur = 0; c.shadowColor = 'rgba(0,0,0,0)';
  c.textAlign = 'start'; c.textBaseline = 'alphabetic'; c.font = '10px sans-serif'; c.fillStyle = '#000'; c.strokeStyle = '#000';
}
function r3aTvProgram(t) {
  r3aTvReset(r3aTvPG); r3aTvHeads.length = 0;
  r3aTvPG.fillStyle = '#000'; r3aTvPG.fillRect(0, 0, 960, 720);
  if (t >= r3aTvC.on) r3aTvDrawNews(r3aTvPG, t);
}
function r3aTvSignal(t) {
  r3aTvReset(r3aTvSG);
  r3aTvSG.fillStyle = '#000'; r3aTvSG.fillRect(0, 0, 960, 720);
  r3aTvSG.drawImage(r3aTvPROG, 0, 0);
  r3aTvDrawWire(r3aTvSG, t);
}
function r3aTvCrt(t) {
  const f = Math.round(t * 24), on = r3aTvC.on;
  const o = { frame: f, snow: .028, jit: .5, chroma: 1.12, raster: [1, 1], bright: 1, dot: 0, over: .94 };
  if (t < on) { o.bright = 0; o.raster = [.01, .01]; }
  else if (t < on + .6) {
    // power on: a white dot, a line, the raster opens over-bright and settles (as round 1)
    const u = (t - on) / .6;
    o.raster = [lerp(.012, 1, smooth(clamp(u * 1.7))), lerp(.008, 1, smooth(clamp((u - .18) * 1.6)))];
    o.dot = (1 - clamp(u * 1.6)) ** 2;
    o.bright = 1 + 1.3 * (1 - u) ** 2;
    o.snow = .03 + .1 * (1 - u);
  }
  return o;
}
function r3aTvAvg() {
  r3aTvAG.drawImage(r3aTvSIG, 0, 0, 8, 6);
  const d = r3aTvAG.getImageData(0, 0, 8, 6).data; let r = 0, gg = 0, b = 0;
  for (let i = 0; i < d.length; i += 4) { r += d[i]; gg += d[i + 1]; b += d[i + 2]; }
  const n = d.length / 4; return [r / n, gg / n, b / n];
}
// the king's head in frame coords (back of the head plus crown), for the face test against the wire copy
function r3aTvKingHeadBox(cam, t) {
  const xf = fgXf(cam); if (!xf) return null;
  const [hx, hy] = fgPt(xf, 330, 930), dy = r3aTvKingDrop(t) * xf.qf, q = xf.qf;
  return [hx - 70 * q, hy + dy - 150 * q, hx + 70 * q, hy + dy + 12 * q];
}
function r3aTvRender(t) {
  const g = r3aTvG, cam = r3aTvCamera(t);
  r3aTvProgram(t);
  r3aTvSignal(t);
  const cp = r3aTvCrt(t);
  const tube = CRT.render(r3aTvSIG, cp);
  const avg = r3aTvAvg(), lit = clamp(cp.bright) * Math.min(1, cp.raster[0] * cp.raster[1] * 1.2);
  const glow = mix([150, 170, 210], avg, .6).map(v => Math.min(255, v * 1.25));
  r3aTvReset(g);
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  const [sx, sy] = toFrame(cam, SCR.x, SCR.y);
  g.drawImage(tube, sx, sy, SCR.w * cam.z, SCR.h * cam.z);
  drawGlass(g, cam);
  drawRoomLayer(g, cam);
  drawGlow(g, cam, glow, lit);
  const xf = fgXf(cam);
  g.save(); if (xf) g.translate(0, r3aTvKingDrop(t) * xf.qf); drawKing(g, cam, t, glow, lit); g.restore();
  r3aTvRoomKingFx(g, cam, t);
  drawGrain(g, t, .07);
  if (PROBE.on && t >= r3aTvC.l0 - 0.1) {
    // the wire copy must never sit over the king's head in the room either
    const kb = r3aTvKingHeadBox(cam, t), bd = r3aTvTP.band;
    let hit = 0;
    if (kb) {
      const [wx0, wy0] = sigToWorld(bd.x, bd.y), [wx1, wy1] = sigToWorld(bd.x + bd.w, bd.y + bd.h);
      const [fx0, fy0] = toFrame(cam, wx0, wy0), [fx1, fy1] = toFrame(cam, wx1, wy1);
      if (kb[0] < fx1 && kb[2] > fx0 && kb[1] < fy1 && kb[3] > fy0) hit = 1;
    }
    PROBE.value('r3a king under copy', hit);
  }
}
const r3aTvREADY = document.fonts.load('bold 48px "Courier New"').then(() => {
  initRoom(); initNews(); initAd();
  r3aTvInitWire(r3aTvPG); r3aTvInitNews();
  r3aTvCheckRows();
  return true;
});
startPage(r3aTvOut, r3aTvRender, r3aTvT0, r3aTvT1, r3aTvREADY);
