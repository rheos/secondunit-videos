// CAST SHEET (not part of the video): every character and prop from js/wkit.js on one plate, at t = 1000.
(() => {
  function sheet(t) {
    shape(() => { s.beginPath(); s.rect(-20, -20, W + 40, H + 40); }, CUT);
    shape(() => { s.beginPath(); s.rect(0, 0, 960, 560); }, INK);                 // a black panel: does she read on it?
    ellen(150, 540, .9, { pose: 'walk', t: t + .1 });
    ellen(400, 540, .9, { pose: 'play', t, slide: .4 });
    ellen(640, 540, .9, { pose: 'stand', t, wind: 1, eyes: 'roll' });
    ellen(880, 540, .9, { pose: 'point', t, eyes: 'brow', smile: .6 });
    put('jimi-helsinki', 1130, 540, 500); put('jimi-1968', 1380, 540, 500);
    put('bob-1989', 1640, 540, 480); put('mj-1984', 1860, 540, 470);
    put('beyonce', 1860, 1060, 480, { ax: .5 });
    put('pixies', 1300, 1060, 460);
    schoolBus(420, 1040, .55, { t, kids: 5, asleep: true, lights: false });
    guitarCase(860, 900, 1, 0); kid(1000, 1040, 1, { letter: 'E' });
  }
  chapter('cast', 1000, 1001, [[1000, sheet]]);
})();
