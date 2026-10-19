// Draft 13 (Bob, 2026-10-19, on the Canvas loop: "this rotating image from you don't love me might be a wonderful change
// for the part in the bridge when they see [the backing run], instead of seeing the pips in the bridge"): the stage that
// drops in over the teacup for the backing run (bridge-trio.js trioFrame, same drop at 139.84 and lift at 148.0) now
// holds the Canvas loop's turning rose window (canvas-loop.js, embedded at 16:9 by window.ROSE_EMBED on the page) in
// place of the singers. Loop time starts at 0 as the stage starts to drop; each sung hit of the run (BR.hits) turns the
// window on a notch more (a second of loop time, eased in over .18 s), with a warm glow from the daisy at its heart.
// Replaces drawTrio; loads after bridge-trio.js. Pure function of song time t.
const ROSE_KICK = 1.0, ROSE_KICK_IN = .18;
function roseLoopTime(t) { let k = 0; for (const h of BR.hits) k += ROSE_KICK * ease(t, h, h + ROSE_KICK_IN); return t - TRIO.drop[0] + k; }
function drawTrio(g, t) {
  const hp = hitPulse(t);
  roseLoop.render(roseLoopTime(t));
  // a slow push over the run, a little more on the last held note, a breath on each hit (as the trio's stage had)
  const z = 1 + .04 * ease(t, TRIO.in, 145.6) + .04 * ease(t, BR.hits[7], BR.hits[7] + 1) + .012 * hp;
  g.setTransform(z, 0, 0, z, W / 2 - W / 2 * z, H / 2 - H / 2 * z); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
  g.drawImage(roseLoop.canvas, 0, 0);
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'screen';
  const rg = g.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 380); rg.addColorStop(0, `rgba(255,232,170,${.16 * hp})`); rg.addColorStop(1, 'rgba(255,232,170,0)');
  g.fillStyle = rg; g.fillRect(W / 2 - 380, H / 2 - 380, 760, 760);
  g.globalCompositeOperation = 'source-over';
}
