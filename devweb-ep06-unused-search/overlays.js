// devweb ep 6 (plain words): the type on top of the world. Classic script, so index.html and check-graybox.mjs both read
// it. One short phrase at a time, white, Plex Sans 700. Two clear zones: the band above the crate's lid (baseline 152,
// the check measures the lid under it on every frame) and the LOW zone right of Blink and under the strip (centre x 845).
// { lines: [[text, centre x, baseline y, size], ...], at: lands on this word, gone: fully off by this time, big: slams }
window.OVERLAYS = function (w) {
  const LOW = 845;
  const endIn = w("one", 4) + 0.36;
  return [
    { lines: [["IT KEPT THE OLD ONE", 540, 245, 76]], at: w("it", 1) - 0.1, gone: w("here's", 1) + 0.55 },
    { lines: [["NOTHING BROKE", 540, 152, 92]], at: w("nothing", 2) - 0.2, gone: w("but", 1) + 0.15, big: 1 },
    { lines: [["53 DAYS", LOW, 1200, 96]], at: w("53", 1) - 0.2, gone: w("i", 6), big: 1 },
    { lines: [["THE TIP", LOW, 1200, 92]], at: w("here's", 2) - 0.1, gone: w("it", 10) },
    // Stays at the foot, straddling the bottom 220 px band (supervisor 05 F3): raised to clear the band it sits on
    // Blink's body at the end pose, and at the top (the storyboard's spot) it covers the bulb and then the lid as the
    // camera drops. The film has no captions in the band. Robin's ruling at the final watch.
    { lines: [["STILL THE OLD ONE", 540, 1728, 80]], at: w("still", 1) - 0.12, gone: endIn + 0.3 },
  ];
};
