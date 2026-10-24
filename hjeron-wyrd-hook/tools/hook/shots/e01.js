// E1 [1902,1976) "will we wake up": out of the black, a low singing close-up at dusk; the eye snaps open on "wake"; WAKE carved.
const START = 1902;
Anim.sketch({
  async load() {
    this.plate = await new Promise((r) => loadImage("/output/e01/02_kf_plain.png", r));
    this.him = await Anim.clip("wake");
    this.f = await hookFonts({ caslon: "Bodoni72SmallcapsBook-clean.ttf" });
  },
  draw(t, f) {
    background(0);
    cam(f, lerp(1.08, 1.0, smooth(f / 74)), 0, 0, 0.03, () => {
      cover(this.plate, 1.5, 0.5, 0.25);  // low angle: mostly sky and the dusk horizon
      standAt(this.him, this.him.frame(f), 1180, 1160, 1160);
    });
    carve(this.f.caslon, "WAKE", 430, 360, 240, f, 14, 64);
    scratchIn(f, 10, 5);
    twoTone();
  }
});
