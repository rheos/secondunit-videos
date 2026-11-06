// Look 5 (school): 1970s educational cartoon, song 123.125-165.083333 (f2955-f3961). Pure function of song time t.
// scene (painted background + inked cels) -> the lesson's lettering -> 16 mm print.
const out = document.getElementById('c'); out.width = W; out.height = H;
const og = out.getContext('2d');
const SCN = mkCanvas(), sg = SCN.getContext('2d');

// every frame starts from the same 2D state (render workers draw frames out of order)
function resetCtx(c) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.filter = 'none';
  c.lineCap = 'butt'; c.lineJoin = 'miter'; c.lineWidth = 1; c.setLineDash([]); c.shadowBlur = 0; c.shadowColor = 'rgba(0,0,0,0)';
  c.textAlign = 'start'; c.textBaseline = 'alphabetic'; c.font = '10px sans-serif'; c.fillStyle = '#000'; c.strokeStyle = '#000';
}
// the opening iris (an animation-stand iris, on 2s), from the black the previous section ends on
function iris(g, t) {
  const lt = since(t, T0); if (lt < 0 || t >= B.irisEnd) return;
  const r = 30 + Math.pow((lt + ON2) / (B.irisEnd - T0), 1.6) * 1250;
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#120c0c';
  g.beginPath(); g.rect(0, 0, W, H); g.arc(960, 470, r, 0, TAU, true); g.fill();
}
function renderFrame(t) {
  resetCtx(sg);
  sg.fillStyle = '#d8b46c'; sg.fillRect(0, 0, W, H);   // nothing carries over from the last frame
  if (t < B.classroom) sceneStreet(sg, t, streetCam(t));
  else if (t < B.page) sceneClassroom(sg, t);
  else if (t < B.counter) scenePage(sg, t);
  else sceneCounter(sg, t);
  iris(sg, t);
  resetCtx(sg);
  drawCaptions(sg, t);
  resetCtx(og);
  filmPrint(og, SCN, t);
}

const READY = document.fonts.load('60px "SchoolRound"').then(() => document.fonts.ready).then(() => {
  paintStreet(); paintClassroom(); paintPage(); paintCounter();
  initCaptions(); buildGrain(); buildVignette();
  return true;
});
startPage(out, renderFrame, T0, T1, READY);
