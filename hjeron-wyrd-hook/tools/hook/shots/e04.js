// E4 [2177,2253) "night was whispering low and deep": everything hushes darker; the Antlered Wolf lies down at his feet.
const START = 2177;
Anim.sketch({
  async load() {
    this.plate = await new Promise((r) => loadImage("/output/e01/02_kf_plain.png", r));
    this.him = await Anim.clip("stand");
    this.wolf = await Anim.clip("lie");
    this.fire = await Anim.clip("fire");
  },
  draw(t, f) {
    background(0);
    const hush = smooth(f / 50);
    cam(f, lerp(1.06, 1.12, smooth(f / 76)), 0, 0, 0.0, () => {
      tint(255 * lerp(1, 0.7, hush));
      const cv = cover(this.plate, 1.0, 0.5, 0.5);
      noTint();
      const [, hy] = toScreen(cv, this.plate, 0.5, 0.5);
      for (let i = 0; i < 14; i++) fireSprite(this.fire, f + i * 7, 60 + i * 140, hy + 14, 170 * (1 - 0.8 * hush));
      standAt(this.him, this.him.frame(120 + f), W * 0.42, 1100, 900);
      // the wolf comes in from the right and lies down beside him
      standAt(this.wolf, this.wolf.frame(f * 1.4), W * 0.66, 1080, 520);
    });
    scratchIn(f, 8, 8);
    twoTone();
  }
});
