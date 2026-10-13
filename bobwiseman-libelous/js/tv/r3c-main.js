// Round 3, tv-C: stanzas 12-14 of the TV-news version, 261.5-340.4583 (f6276-f8171). The same pipeline as
// stanza 11 (r2_main.js): program (960x720) -> signal with the wire copy -> CRT (crt.js) -> the living room
// (room.js), on its own canvases. The kit files are loaded read-only; nothing in them is changed.
// r3cRenderFrame is a pure function of song time t.
const R3C_OUT = document.getElementById('c'); R3C_OUT.width = W; R3C_OUT.height = H;
const r3cG = R3C_OUT.getContext('2d');
const R3C_PROG = mkCanvas(960, 720), r3cPg = R3C_PROG.getContext('2d');
const R3C_SIG = mkCanvas(960, 720), r3cSg = R3C_SIG.getContext('2d');
const R3C_AVG = mkCanvas(8, 6), r3cAg = R3C_AVG.getContext('2d', { willReadFrequently: true });
function r3cReset(c) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.filter = 'none';
  c.lineCap = 'butt'; c.lineJoin = 'miter'; c.lineWidth = 1; c.setLineDash([]); c.shadowBlur = 0; c.shadowColor = 'rgba(0,0,0,0)';
  c.textAlign = 'start'; c.textBaseline = 'alphabetic'; c.font = '10px sans-serif'; c.fillStyle = '#000'; c.strokeStyle = '#000';
}
function r3cProgram(t) {
  const g = r3cPg; r3cReset(g); R3C_HEADS.length = 0;
  g.fillStyle = '#000'; g.fillRect(0, 0, 960, 720);
  if (t < R3CQ.l112) r3cDesk(g, t, { box: r3cBoxCalendar, mouth: [111] });
  else if (t < R3CQ.l113) r3cSceneCase(g, t);
  else if (t < R3CQ.l114) r3cSceneMoney(g, t);
  else if (t < R3CQ.l115) r3cSceneCrush(g, t);
  else if (t < R3CQ.l116) r3cSceneSpeak(g, t);
  else if (t < R3CQ.newsprint - .1) r3cSceneDesk116(g, t);
  else if (t < R3CQ.internet - .02) r3cSceneNewspaper(g, t);
  else if (t < R3CQ.l117) r3cSceneNetwork(g, t);
  else if (t < R3CQ.l118) r3cDesk(g, t, { box: r3cBoxCourt, mouth: [117], look: t >= R3CQ.judge ? .6 : 0 });
  else if (t < R3CQ.views[0]) r3cSceneJudgeAgrees(g, t);
  else if (t < R3CQ.l124) r3cDesk(g, t, { box: r3cBoxView, big: 1, look: .7 });
  else if (t < R3CQ.l125) r3cSceneVerdict(g, t);
  else if (t < R3CQ.desk2) r3cSceneCourtSteps(g, t);
  else if (t < R3CQ.card) r3cSceneClose(g, t);
  else if (t < R3CQ.testCard) drawCard(g, t);
  else r3cTestCard(g);
}
function r3cSignal(t) {
  const g = r3cSg; r3cReset(g);
  g.fillStyle = '#000'; g.fillRect(0, 0, 960, 720);
  g.drawImage(R3C_PROG, 0, 0);
  if (t < R3CQ.desk2) r3cDrawTP(g, t);
}
function r3cCrt(t) {
  const o = { frame: Math.round(t * 24), snow: .028, jit: .5, chroma: 1.12, raster: [1, 1], bright: 1, dot: 0, over: .94 };
  if (t >= R3CQ.testCard) o.snow = .04;
  if (t >= R3CQ.off) {
    // switched off: the picture squeezes to a bright line, the line to a dot, and the dot fades on the glass
    const u = t - R3CQ.off;
    o.raster = [lerp(1, .01, smooth(clamp((u - .1) / .14))), lerp(1, .006, smooth(clamp(u / .12)))];
    o.bright = 1 + .9 * smooth(clamp(u / .12)) * (1 - smooth(clamp((u - .2) / .1)));
    o.dot = u < .2 ? 0 : Math.exp(-(u - .2) * 1.6) * smooth(clamp((u - .16) / .06));
    if (u > .26) o.raster = [.004, .004];
  }
  return o;
}
function r3cAvg() {
  r3cAg.drawImage(R3C_SIG, 0, 0, 8, 6);
  const d = r3cAg.getImageData(0, 0, 8, 6).data; let r = 0, gg = 0, b = 0;
  for (let i = 0; i < d.length; i += 4) { r += d[i]; gg += d[i + 1]; b += d[i + 2]; }
  const n = d.length / 4; return [r / n, gg / n, b / n];
}
// where the king's head (and crown) is in the frame, for the captions-off-faces check
let R3C_KING = null;
function r3cRender(t) {
  const cam = r3cCam(t), g = r3cG;
  r3cProgram(t);
  r3cSignal(t);
  const cp = r3cCrt(t);
  const tube = CRT.render(R3C_SIG, cp);
  const lit = clamp(cp.bright) * Math.min(1, cp.raster[0] * cp.raster[1] * 1.2) + (cp.dot > 0 ? cp.dot * .08 : 0);
  const glow = mix([150, 170, 210], r3cAvg(), .6).map(v => Math.min(255, v * 1.25));
  r3cReset(g);
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  const [sx, sy] = toFrame(cam, SCR.x, SCR.y);
  g.drawImage(tube, sx, sy, SCR.w * cam.z, SCR.h * cam.z);
  drawGlass(g, cam);
  drawRoomLayer(g, cam);
  drawGlow(g, cam, glow, lit);
  const xf = fgXf(cam); R3C_KING = null;
  g.save();
  if (xf) {
    const drop = r3cKingDrop(t); g.translate(0, drop * xf.qf);
    const [hx, hy] = fgPt(xf, 330, 930);
    R3C_KING = { x0: hx - 62 * xf.qf, y0: hy + (drop - 152) * xf.qf, x1: hx + 62 * xf.qf, y1: hy + (drop + 14) * xf.qf };
  }
  drawKing(g, cam, t, glow, lit);
  g.restore();
  drawRoomPhone(g, cam, t);
  drawGrain(g, t, .07);
  return cam;
}
function r3cRenderFrame(t) { r3cRender(t); }
// Captions off faces: every head the program drew this frame against the paper strip (program pixels), and the
// king's head in the room against the strip as it sits in the frame. Returns the overlaps (none expected).
function r3cFaceHits(t) {
  const cam = r3cRender(t), hits = [];
  if (t >= R3CQ.desk2) return hits;
  const b = R3C_TP.band, X0 = b.x, Y0 = b.y, X1 = b.x + b.w, Y1 = b.y + b.h;
  for (const h of R3C_HEADS) if (h.x1 > X0 && h.x0 < X1 && h.y1 > Y0 && h.y0 < Y1) hits.push(`${h.who} y ${h.y0.toFixed(0)}-${h.y1.toFixed(0)}`);
  if (R3C_KING) {
    const [wx0, wy0] = sigToWorld(X0, Y0), [wx1, wy1] = sigToWorld(X1, Y1), [fx0, fy0] = toFrame(cam, wx0, wy0), [fx1, fy1] = toFrame(cam, wx1, wy1), k = R3C_KING;
    if (k.x1 > fx0 && k.x0 < fx1 && k.y1 > fy0 && k.y0 < fy1) hits.push(`king (room) y ${k.y0.toFixed(0)} vs strip ${fy0.toFixed(0)}-${fy1.toFixed(0)}`);
  }
  return hits;
}
window.__r3cFaceHits = r3cFaceHits;
const R3C_READY = document.fonts.load('bold 48px "Courier New"').then(() => {
  initRoom(); initNews(); r3cInitSketch(); r3cInitScenes();
  r3cInitTP(r3cPg); R3C_TP.paper = r3cSg.createPattern(initTPPaper(), 'repeat');
  r3cCheckRows();
  return true;
});
startPage(R3C_OUT, r3cRenderFrame, R3C_SPAN[0], R3C_SPAN[1], R3C_READY);
