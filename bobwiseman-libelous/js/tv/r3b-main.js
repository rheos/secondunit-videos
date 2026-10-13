// tv-B: stanzas 6-10 (song 95.916667-240.916667, frames 2302-5782) as the 1970s news bulletin on the console TV.
// The same pipeline as rounds 1 and 2: program (960x720) -> signal (the wire copy on the teleprinter strip)
// -> CRT (WebGL, js/tv/crt.js) -> the living-room composite (room.js). Pure: a function of song time t only.
const r3bTvOut = document.getElementById('c'); r3bTvOut.width = W; r3bTvOut.height = H;
const r3bTvG = r3bTvOut.getContext('2d');
const R3BTV_PROG = mkCanvas(960, 720), r3bTvPg = R3BTV_PROG.getContext('2d');
const R3BTV_SIG = mkCanvas(960, 720), r3bTvSg = R3BTV_SIG.getContext('2d');
const R3BTV_AVG = mkCanvas(8, 6), r3bTvAg = R3BTV_AVG.getContext('2d', { willReadFrequently: true });
const R3BTV_KING_DROP = 92;   // the king has sunk low in his wingback, so his crown stays under the wire copy

function r3bTvProgram(g, t) {
  r3bTvReset(g); R3BTV_HEADS.length = 0;
  g.fillStyle = '#000'; g.fillRect(0, 0, 960, 720);
  if (t < R3BTV_S.s7) r3bTvStanza6(g, t);
  else if (t < R3BTV_S.s8) r3bTvStanza7(g, t);
  else if (t < R3BTV_S.s9) r3bTvStanza8(g, t);
  else if (t < R3BTV_S.s10) r3bTvStanza9(g, t);
  else r3bTvStanza10(g, t);
}
function r3bTvSignal(t) {
  const g = r3bTvSg; r3bTvReset(g);
  g.fillStyle = '#000'; g.fillRect(0, 0, 960, 720);
  g.drawImage(R3BTV_PROG, 0, 0);
  r3bTvDrawTP(g, t);
}
function r3bTvAvgColor() {
  r3bTvAg.drawImage(R3BTV_SIG, 0, 0, 8, 6);
  const d = r3bTvAg.getImageData(0, 0, 8, 6).data; let r = 0, gg = 0, b = 0;
  for (let i = 0; i < d.length; i += 4) { r += d[i]; gg += d[i + 1]; b += d[i + 2]; }
  const n = d.length / 4; return [r / n, gg / n, b / n];
}
// faces check: no registered head may sit under the teleprinter paper (or its copy) on any frame
function r3bTvCheckFaces(t) {
  const bd = R3BTV_TP.band;
  for (const [x0, y0, x1, y1] of R3BTV_HEADS) if (x1 > bd.x && x0 < bd.x + bd.w && y1 > bd.y && y0 < bd.y + bd.h) console.error(`tv-B face under the wire copy at frame ${Math.round(t * 24)}: head ${[x0, y0, x1, y1].map(v => v | 0)}`);
}
// the coins the king spends during the end card: they hop out of his sack and fly into the box on the set
function r3bTvSpentCoins(g, cam, t) {
  const xf = fgXf(cam); if (!xf) return;
  for (const c of R3BTV_SPENT) {
    const u = (t - c.t) / .42; if (u < 0 || u >= 1) continue;
    const [sx, sy] = fgPt(xf, 640 + c.dx, 995 + R3BTV_KING_DROP), [bx, by] = r3bTvBoxToSig(c.hx, c.hy), [wx, wy] = sigToWorld(bx, by), [ex, ey] = toFrame(cam, wx, wy);
    const cx = (sx + ex) / 2, cy = Math.min(sy, ey) - 140;
    const x = (1 - u) ** 2 * sx + 2 * u * (1 - u) * cx + u * u * ex, y = (1 - u) ** 2 * sy + 2 * u * (1 - u) * cy + u * u * ey;
    coin(g, x, y, 15 * xf.qf * lerp(1, .32, u), c.ph + u * 14);
  }
}
function r3bTvRender(t) {
  const cam = r3bTvCamera(t);
  r3bTvProgram(r3bTvPg, t);
  r3bTvCheckFaces(t);
  r3bTvSignal(t);
  const cp = { frame: Math.round(t * 24), snow: .028, jit: .5, chroma: 1.12, raster: [1, 1], bright: 1, dot: 0, over: .94 };
  const tube = CRT.render(R3BTV_SIG, cp);
  const avg = r3bTvAvgColor(), lit = 1;
  const glow = mix([150, 170, 210], avg, .6).map(v => Math.min(255, v * 1.25));
  const g = r3bTvG; r3bTvReset(g);
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  const [sx, sy] = toFrame(cam, SCR.x, SCR.y);
  g.drawImage(tube, sx, sy, SCR.w * cam.z, SCR.h * cam.z);
  drawGlass(g, cam);
  drawRoomLayer(g, cam);
  drawGlow(g, cam, glow, lit);
  // the gold that poured out of the grille in stanza 6 is still piled in front of the set through stanza 7
  if (t < R3BTV_S.s8) drawGrilleCoins(g, cam, t);
  const xf = fgXf(cam);
  g.save(); if (xf) g.translate(0, R3BTV_KING_DROP * xf.qf); drawKing(g, cam, t, glow, lit); g.restore();
  if (t < R3BTV_S.s7) r3bTvSpentCoins(g, cam, t);
  if (xf && t >= C.legit && t < R3BTV_S.s8) {   // the king's crown glints when the book is stamped
    const gl = Math.exp(-(t - C.legit) * 3), [hx, hy] = fgPt(xf, 330, 930);
    if (gl > .02) { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(255,240,190,${gl})`; star(g, hx + 26 * xf.qf, hy + (R3BTV_KING_DROP - 146) * xf.qf, (36 * gl + 8) * xf.qf, 4 * xf.qf, 4); g.fill(); g.restore(); }
  }
  if (t >= R3BTV_S.s8) drawRoomPhone(g, cam, t);   // the harvest-gold phone the next bulletin rings (still on its cradle here)
  drawGrain(g, t, .07);
}
const R3BTV_READY = document.fonts.load('bold 48px "Cooper Lt BT"').then(() => {
  initShow(); initAd(); initRoom(); initLesson(); initNews();
  r3bTvInitTP(r3bTvSg);
  R3BTV_TP.paper = r3bTvSg.createPattern(initTPPaper(), 'repeat');
  r3bTvInitSpent(); r3bTvInitNewsFilm();
  r3bTvCheckRows();
  return true;
});
startPage(r3bTvOut, r3bTvRender, R3BTV_T0, R3BTV_T1, R3BTV_READY);
