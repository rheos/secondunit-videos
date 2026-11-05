// P1 [1393,1486) "serpent of the sunrise asking": a huge engraved sun over the buttes; the Sky Serpent's face forms in it.
const START = 1393;
Anim.sketch({
  async load() {
    this.plate = await new Promise((r) => loadImage("/output/p01/02_kf_sunrise.png", r));
    this.face = await Anim.clip("serp_face");
  },
  draw(t, f) {
    background(0);
    cam(f, lerp(1.0, 1.1, smooth(f / 93)), 0, 0, 0.03, () => {
      const cv = cover(this.plate, 1.02, 0.5, 0.5);
      const [sx, sy] = toScreen(cv, this.plate, 0.27, 0.36);
      // the face gathers on "serpent" (58.56 s -> f12), fully formed by "sunrise" (59.34 -> f31), asking on "asking" (59.88 -> f44)
      const form = smooth((f - 10) / 26);
      if (form > 0) {
        push(); drawingContext.globalAlpha = form;
        this.face.draw(this.face.frame(Math.min(20, f * 0.22)), sx + 30, sy + 40 - 30 * (1 - form), 760 * lerp(0.85, 1, form));
        pop();
      }
      sparks(f, sx, sy + 150, { spread: 500, rate: 2, burst: 8, speed: 5, life: 80, seed: 61 });
    });
    scratchIn(f, 10, 4);
    twoTone();
  }
});
