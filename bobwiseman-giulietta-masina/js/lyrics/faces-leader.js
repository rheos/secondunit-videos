// Captions for the film leader (92.5-139): subtitles over the whole frame after the look (our film's own subtitles,
// in the dream's style). Faces: the leader's pictures are painted into one 640 x 460 picture (pictures.js) and
// printed into the leader frame; when the picture up has people in it, its whole rect counts as a face, mapped
// through every draw of the leader canvas (projected on the screen, or in the gate strip).
const CAP_FACEPICS = new Set([picAudience, picCrying, picWed, picStage, picClowns, picPhotos, picScaffold]);
let CAP_LAST = null;
{ const f = drawLeaderFrame; window.drawLeaderFrame = function (tc, fr, opt = {}) { CAP_LAST = { tc, blank: !!opt.blank }; return f(tc, fr, opt); }; }
{ const di = g.drawImage;
  g.drawImage = function (img, ...a) {
    if (img === LC && a.length === 4 && CAP_LAST && !CAP_LAST.blank) {
      const p = pictureAt(CAP_LAST.tc);
      if (p && p.a > 0 && CAP_FACEPICS.has(p.fn)) {
        const sc = p.big ? 1.18 : .95, cy = p.big ? 0 : 75, [dx, dy, dw, dh] = a, kx = dw / LW, ky = dh / LH;
        const x0 = LW / 2 - PW * sc / 2, y0 = LH / 2 + cy - PH * sc / 2;
        capFace(this, dx + x0 * kx, dy + y0 * ky, dx + (x0 + PW * sc) * kx, dy + (y0 + PH * sc) * ky);
      }
    }
    return di.call(this, img, ...a);
  };
}
window.CAP_AFTER = (t) => { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); capDraw(g, t, 'wide'); g.restore(); };
window.capShot = (t) => shotAt(SHOTS, t)[2];
