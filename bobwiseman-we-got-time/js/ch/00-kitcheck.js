// kitcheck.html only: every kit prop on one frame, for checking the kit itself
(() => {
  function props(t) {
    cam({ x: 0, z: 0, f: 820, vy: 470 }); room(t); rows(t);
    desk(-1.6, 6, 1); woman(-2.3, 6, { seated: true, face: 1, rose: 1, arm: .3 });
    woman(1.5, 5, { walk: 1, ph: t, face: -1, rose: .5 }); man(3, 5, { walk: 1, ph: t, face: -1 });
    typewriter(300, 1000, 380, { strike: (t * 3) % 1, paper: { lines: ['I AIN\'T MAKING IT UP'], typed: 12 } });
    splitFlap(t, 1, 'WE GOT TIME', 1100, 60, 70, { prev: 'NOW SERVING' });
    stamp(t, 1.2, 1500, 900, 'APPROVED');
    form(1180, 560, 380, ['WE GOT TIME', 'WE GOT TIME'], { typed: 16, rot: .05 });
  }
  chapter('kit', 0, DUR, [[0, props]]);
})();
