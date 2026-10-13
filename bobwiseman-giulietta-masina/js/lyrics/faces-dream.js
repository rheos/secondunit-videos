// Captions for the 8 1/2 dream (60-92.5): every head in the farmhouse and on the beach is figures.js drawHead.
// The look's own subtitles (the chant, "Giulietta") are superseded by the lyric captions, same words, same style.
capWrap('drawHead', (x, y, r) => [x - 1.05 * r, y - 1.3 * r, x + 1.05 * r, y + 1.15 * r]);
function drawSubs(g, t) { if (CAP_SUPPRESS) return; g.save(); g.translate(0, -BAR); capDraw(g, t, 'wide'); g.restore(); }
const CAP_SHOTS = [...new Set(Object.values(SH))].sort((a, b) => a - b);
window.capShot = (t) => CAP_SHOTS.filter((x) => x <= t).length;
