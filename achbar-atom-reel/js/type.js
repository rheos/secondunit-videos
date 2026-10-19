// Kinetic type, after Airplane on the Highway (bobwiseman-airplane-type/js/ui.js): fitted display words
// whose letters arrive one after another, typed mono captions, and exits that drop letters in order.
// Draws on the kit's context X. Every function is a pure function of the time it is given.
'use strict';
const FT = { d: 'Archivo', m: '"JetBrains Mono"', s: '"Instrument Serif"' };
function setFont(fam, size, weight = 400, o = {}) {
  X.font = `${o.italic ? 'italic ' : ''}${weight} ${size}px ${fam}`;
  try { X.fontStretch = o.stretch || 'normal'; X.letterSpacing = (o.ls || 0) + 'px'; } catch (e) {}
}
function resetFont() { try { X.letterSpacing = '0px'; X.fontStretch = 'normal'; } catch (e) {} }
function meas(str, o = {}) { setFont(o.fam || FT.m, o.size || 20, o.weight || 400, o); const w = X.measureText(str).width; resetFont(); return w; }
// largest size <= maxSize at which str fits in maxW
function fit(str, maxW, maxSize, o = {}) { return Math.min(maxSize, 100 * maxW / meas(str, { ...o, size: 100 })); }
function txt(str, x, y, o = {}) {
  setFont(o.fam || FT.m, o.size || 20, o.weight || 400, o);
  X.textAlign = o.align || 'left'; X.textBaseline = o.base || 'alphabetic';
  X.globalAlpha = o.alpha ?? 1; X.fillStyle = o.color || C.white; X.fillText(str, x, y); X.globalAlpha = 1;
  const w = X.measureText(str).width; resetFont(); return w;
}
const typed = (str, t, t0, cps = 38) => str.slice(0, Math.max(0, Math.floor((t - t0) * cps)));
// typed caption with a block cursor while it types
function caption(str, x, y, t, t0, o = {}) {
  if (t < t0) return;
  const s = typed(str, t, t0, o.cps || 38), w = txt(s, x, y, o);
  const done = s.length >= str.length;
  if (!done || (t - t0 - str.length / (o.cps || 38)) < .5) { if (Math.floor(t * 5) % 2 === 0) { X.fillStyle = o.color || C.white; X.globalAlpha = o.alpha ?? 1; X.fillRect(x + w + 3, y - (o.size || 20) * .8, (o.size || 20) * .55, (o.size || 20) * .9); X.globalAlpha = 1; } }
}
// letters(str, x, y, o, fn): fn(i, ch) -> {dx, dy, sc, rot, alpha, color}. Returns total width.
function letters(str, x, y, o, fn) {
  setFont(o.fam || FT.d, o.size, o.weight || 900, o);
  const ls = o.ls || 0; try { X.letterSpacing = '0px'; } catch (e) {}
  const ch = [...str], ws = ch.map((c) => X.measureText(c).width), tot = ws.reduce((a, b) => a + b, 0) + (ch.length - 1) * ls;
  let cx = o.align === 'center' ? x - tot / 2 : o.align === 'right' ? x - tot : x;
  X.textAlign = 'center'; X.textBaseline = 'alphabetic';
  ch.forEach((c, i) => {
    const mid = cx + ws[i] / 2, m = fn ? fn(i, c) : {};
    if ((m.alpha ?? 1) > .002 && c !== ' ') {
      X.save(); X.translate(mid + (m.dx || 0), y + (m.dy || 0)); X.rotate(m.rot || 0); X.scale(m.sc || 1, m.sc || 1);
      X.globalAlpha = cl(m.alpha ?? 1); X.fillStyle = m.color || o.color || C.white; X.fillText(c, 0, 0); X.restore();
    }
    cx += ws[i] + ls;
  });
  resetFont(); return tot;
}
// A kinetic word: letters slam in from big and faint (or rise from below), staggered; exits drop them in order.
// o: {size, fam, weight, stretch, color, align, stag, dur, style: 'slam'|'rise', out, outDur, hot: [i0, i1, color]}
function kin(str, x, y, t, t0, o = {}) {
  if (t < t0) return 0;
  const stag = o.stag ?? .028, dur = o.dur ?? .2, n = str.length;
  return letters(str, x, y, o, (i) => {
    const k = eo(seg(t, t0 + i * stag, t0 + i * stag + dur));
    let alpha = k, sc = 1, dy = 0;
    if ((o.style || 'slam') === 'slam') sc = lerp(1.7, 1, k); else dy = lerp(o.size * .45, 0, k);
    if (o.out !== undefined && t > o.out) { const q = eio(seg(t, o.out + i * .012, o.out + i * .012 + (o.outDur ?? .22))); alpha *= 1 - q; dy += q * o.size * .35; }
    const hot = o.hot && i >= o.hot[0] && i < o.hot[1];
    return { sc, dy, alpha, color: hot ? (o.hot[2] || C.mag) : (o.color || C.white) };
  });
}
