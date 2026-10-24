// Round 2 frames (tv): stanza 7 (123.125-165.083) and stanza 11 (240.917-261.5). Same pipeline as round 1
// (program -> signal with captions -> CRT -> living-room composite), reusing its canvases, tube and room.
// main.js hands every t >= 123.125 here, so round 1's frames never run any of this code.
const KING_DROP = 92;   // stanza 11: the king has sunk low in his wingback, below the wire copy
function program2(t) {
  resetCtx(pg);
  pg.fillStyle = '#000'; pg.fillRect(0, 0, 960, 720);
  if (t < S7[1]) drawLesson(pg, t);
  else if (t >= S11[0]) drawNews(pg, t);
}
function signal2(t) {
  resetCtx(sg);
  sg.fillStyle = '#000'; sg.fillRect(0, 0, 960, 720);
  sg.drawImage(PROG, 0, 0);
  if (t < S7[1]) drawCC2(sg, t);
  else if (t >= S11[0]) drawTP(sg, t);
}
function crtParams2(t) {
  const f = Math.round(t * 24), live = t < S7[1] || t >= S11[0];
  return { frame: f, snow: .028, jit: .5, chroma: 1.12, raster: [1, 1], bright: live ? 1 : 0, dot: 0, over: .94 };
}
function renderR2(t) {
  const cam = cameraAt2(t);
  program2(t);
  signal2(t);
  const cp = crtParams2(t);
  const tube = CRT.render(SIG, cp);
  const avg = avgColor(), lit = clamp(cp.bright);
  const glow = mix([150, 170, 210], avg, .6).map(v => Math.min(255, v * 1.25));
  resetCtx(g);
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  const [sx, sy] = toFrame(cam, SCR.x, SCR.y);
  g.drawImage(tube, sx, sy, SCR.w * cam.z, SCR.h * cam.z);
  drawGlass(g, cam);
  drawRoomLayer(g, cam);
  drawGlow(g, cam, glow, lit);
  if (t < S7[1]) {
    // same evening as stanza 6: the gold that poured out of the grille is still piled in front of the set
    drawGrilleCoins(g, cam, t);
    drawKing(g, cam, t, glow, lit);
    const xf = fgXf(cam);
    if (xf && t >= C.legit) {   // the king's crown glints when the book is stamped
      const gl = Math.exp(-(t - C.legit) * 3), [hx, hy] = fgPt(xf, 330, 930);
      if (gl > .02) { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(255,240,190,${gl})`; star(g, hx + 26 * xf.qf, hy - 146 * xf.qf, (36 * gl + 8) * xf.qf, 4 * xf.qf, 4); g.fill(); g.restore(); }
    }
  } else {
    const xf = fgXf(cam);
    g.save(); if (xf) g.translate(0, KING_DROP * xf.qf); drawKing(g, cam, t, glow, lit); g.restore();
    drawRoomPhone(g, cam, t);
  }
  drawGrain(g, t, .07);
}
function initR2() {
  initLesson(); initNews(); initCC2(); initTP(pg);
  TP.paper = sg.createPattern(initTPPaper(), 'repeat');
  checkRows2();
}
