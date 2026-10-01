// c01 · VERSE 1 (SEC.v1 - 37.7). STUB: a placeholder until this chapter is painted.
(() => {
  function stub(t, lt, dur) {
    cam(540, 960, 1 + lt * .01);
    s.fillStyle = C.deep; s.fillRect(-W, -H, W * 3, H * 3);
    halo(540, 900, 380, t * .05, .2);
    border(t, 1);
  }
  chapter('c01', SEC.v1, 37.7, [[SEC.v1, stub]], { fx: PAINT });
})();
