// Captions for the kite dream (0-34): the look's head functions report their boxes; the subtitles print inside the
// film (filmOut calls drawSubs, replaced here; the look's own "Giulietta Masina" subtitle is superseded by the lyric).
// Boxes are in each function's caller coordinates, generous: hair, tilt and a tipped-back face included.
capWrap('drawHead', (x, y, r) => [x - 1.05 * r, y - 1.3 * r, x + 1.05 * r, y + 1.15 * r]);   // the dreamer (js/kite/dreamer.js)
capWrap('herFace', (x, y, r) => [x - 1.2 * r, y - 1.0 * r, x + 1.2 * r, y + 1.06 * r]);    // her face: forehead -0.84 r, chin 0.96 r (people.js), tipped back a little; the hair above may take a caption
capWrap('herBack', (x, y, r) => [x - .9 * r, y - 1.2 * r, x + 1.3 * r, y + 1.1 * r]);      // lost profile
capWrap('horseRider', (x, y, k) => [x - .22 * k, y - 2.68 * k, x + .32 * k, y - 2.22 * k]); // the rider's head and hat
capWrap('beachGoer', (x, y, k) => [x - .16 * k, y - 1.8 * k, x + .16 * k, y - 1.42 * k]);
capWrap('photographer', (x, y, k) => [x - .17 * k, y - 1.8 * k, x + .2 * k, y - 1.36 * k]);
function drawSubs(g, t) { if (CAP_SUPPRESS) return; g.save(); g.translate(0, -BAR); capDraw(g, t, 'wide'); g.restore(); }
window.capShot = (t) => shotAt(KITE_SHOTS, t)[2];
