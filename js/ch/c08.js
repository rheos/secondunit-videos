// c08 · VERSE 3 AGAIN (SEC.v3b - SEC.b2). STUB: a placeholder until this chapter is painted.
(() => {
  function stub(t, lt, dur) {
    cam(540, 960, 1 + lt * .01);
    s.fillStyle = C.deep; s.fillRect(-W, -H, W * 3, H * 3);
    halo(540, 900, 380, t * .05, .2);
    border(t, 1);
  }
  chapter('c08', SEC.v3b, SEC.b2, [[SEC.v3b, stub]], { fx: PAINT });
})();
