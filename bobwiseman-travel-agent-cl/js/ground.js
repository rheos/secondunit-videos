// The colour arc: each act's paper and stripe ground shifts (Robin 2026-10-13, inside the palette).
// Only the GROUND is remapped (the looks run every ground colour through groundTint), so figures, ink and the
// pixel world keep their colour. TNOW is the song time of the drawing (set by story.js and the driver).
'use strict';
groundTint = function actGround(c) {
  if (typeof c !== 'string' || c[0] !== '#' || c.length !== 7) return c;
  const T = TNOW; let to = null, k = 0, dark = 0;
  if (T >= 400) { to = '#9ea6ad'; k = .55; }                       // the closing shop at dusk
  else if (T >= 365.5) { to = '#dfe7ea'; k = .5; }                 // E: the snow drains it cool
  else if (T >= 276) { to = '#eab0a8'; k = .3; dark = .16 * cl((T - 276) / 116); } // D: rose, darkening as the burn eats it
  else if (T >= 188.7) { to = '#c6d1ca'; k = .45; }                // C: sage and teal-grey for the ward
  else if (T >= 116.6) { to = '#f3ad6e'; k = .26; }                // B: warmer, more saturated as physics bends
  if (!to) return c;
  const a = hexRGB(c), b = hexRGB(to); return rgbHex(a.map((v, i) => (v + (b[i] - v) * k) * (1 - dark)));
};
