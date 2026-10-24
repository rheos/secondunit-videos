// Spanish captions under the picture, for the class. Drawn crisp on top of the paper finish so the
// grain never touches the letters. A cream paper strip along the bottom holds one sung line at a time;
// words already sung are full ink, the word being sung is carmine, words still to come are faded.
// LINES / WORDS come from js/words.js (forced alignment of the lyric sheet to the vocal stem).
const CAP = {
  lead: .35,          // a line shows this long before its first word, so the eye is ready
  hold: .9,           // and stays this long after its last word (or until the next line starts)
  fade: .18,
  y: H - 92,          // baseline centre of the text
  stripH: 150,
  size: 64,
  font: (s, w = 600) => `${w} ${s}px "Avenir Next", "Avenir", "Helvetica Neue", sans-serif`,
  ink: '#1d2852', sung: '#1d2852', todo: 'rgba(29,40,82,.38)', now: '#b3262e',
};

function captionLine(t) {
  if (typeof LINES === 'undefined') return null;
  let best = null;
  for (let i = 0; i < LINES.length; i++) {
    const L = LINES[i], next = LINES[i + 1];
    const a = L.s - CAP.lead, b = Math.min(L.e + CAP.hold, next ? next.s - CAP.lead : Infinity);
    if (t >= a && t < b) best = { i, L, a, b };
  }
  return best;
}

function drawCaptions(ctx, t) {
  const c = captionLine(t);
  // the strip itself stays while any line is near, and slides away in long instrumentals
  let near = 0;
  if (typeof LINES !== 'undefined') for (const L of LINES) near = Math.max(near, ss(L.s - 1.6, L.s - .6, t) * (1 - ss(L.e + 1.6, L.e + 2.8, t)));
  if (near <= 0) return;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const sy = H - CAP.stripH * eo(near);
  // the strip: cream paper with a torn top edge and a soft shadow up onto the picture
  const p = new Path2D(); p.moveTo(-10, H + 10); p.lineTo(-10, sy);
  for (let x = -10; x <= W + 30; x += 30) p.lineTo(x, sy + (hash(x * .37 + 2) - .5) * 7);
  p.lineTo(W + 10, H + 10); p.closePath();
  ctx.shadowColor = 'rgba(20,16,30,.35)'; ctx.shadowBlur = 22; ctx.shadowOffsetY = -6;
  ctx.fillStyle = '#f4ead6'; ctx.fill(p);
  ctx.shadowColor = 'transparent';
  ctx.globalAlpha = .1; ctx.globalCompositeOperation = 'multiply'; ctx.save(); ctx.clip(p); ctx.drawImage(MOTTLE, 0, 0); ctx.restore();
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  if (c) {
    const fin = ss(c.a, c.a + CAP.fade, t), fout = 1 - ss(c.b - CAP.fade, c.b, t);
    const ws = WORDS.filter((w) => w.line === c.i);
    let size = CAP.size; ctx.font = CAP.font(size);
    const gap = () => size * .3;
    const width = () => ws.reduce((s, w) => s + ctx.measureText(w.w).width, 0) + gap() * (ws.length - 1);
    while (width() > W - 160 && size > 34) { size -= 2; ctx.font = CAP.font(size); }
    let x = (W - width()) / 2; const y = sy + CAP.stripH / 2 + size * .34 + (1 - eo(near)) * 40;
    ctx.globalAlpha = fin * fout; ctx.textBaseline = 'alphabetic';
    ws.forEach((w, j) => {
      // a held word ("Haaarta") stays lit until the next word starts; the last word until it ends
      const until = j + 1 < ws.length ? ws[j + 1].s - .04 : Math.max(w.e + .2, w.s + .4);
      const now = t >= w.s - .04 && t < until;
      ctx.fillStyle = now ? CAP.now : t >= w.s ? CAP.sung : CAP.todo;
      ctx.fillText(w.w, x, y);
      x += ctx.measureText(w.w).width + gap();
    });
  }
  ctx.restore();
}
