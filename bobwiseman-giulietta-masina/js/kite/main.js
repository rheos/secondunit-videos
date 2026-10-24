// Look: the 8 1/2 kite dream in black and white, intro + verse 1, 0.0-34.0 (song frames 0-816). Pure function of song time t.
// The print is js/dream/film.js (loaded read-only), so this reads as the same film as the guitar break.
const out = document.getElementById('c'); out.width = W; out.height = H;
const g = out.getContext('2d');
const T0 = 0.0, T1 = 34.0;

// Subtitles: only her name, as the dream subtitles it (upright). Words from Bob's sheet, each on its sung onset.
function subsAt(t) {
  if (t >= V.giu && t < 11.9) return { words: [{ w: 'Giulietta', on: V.giu }, { w: 'Masina', on: V.mas }], font: SUBFONT_R };
  return null;
}

function renderFrame(t) {
  sg.setTransform(RS, 0, 0, RS, 0, 0); sg.globalCompositeOperation = 'source-over'; sg.globalAlpha = 1; sg.filter = 'none';
  drawKite(sg, t);
  const fade = (1 - ease(t, 0.0, 0.5)) + .94 * ease(t, SH.dark, SH.black) + .04 * ease(t, SH.black, 34.0);
  filmOut(g, t, { fade, subs: subsAt(t) });
}

startPage(out, renderFrame, T0, T1);
