// E5 [2253,2342) "heat was rising from the cracks beneath": the cracks split open white under his boots and embers rise
// around him in a column. Hard stop at the end of the mix.
const START = 2253;
Anim.sketch({
  async load() {
    this.plate = await new Promise((r) => loadImage("/output/e01/02_kf_plain.png", r));
    this.him = await Anim.clip("stand");
    this.wolf = await Anim.clip("lie");
  },
  draw(t, f) {
    background(0);
    cam(f, lerp(1.12, 1.0, smooth(f / 89)), 0, 0, 0.02, () => {
      tint(180);
      cover(this.plate, 1.0, 0.5, 0.5);
      noTint();
      // "heat" 93.88 -> f0, "cracks" 95.34 -> f35: they race outward from his boots
      const u = smooth((f - 4) / 50);
      cracks(W * 0.42, 1020, u, t, 8);
      standAt(this.him, this.him.frame(Math.min(240, 168 + f)), W * 0.42, 1100, 900);
      standAt(this.wolf, this.wolf.frame(120), W * 0.66, 1080, 520);
      // the ember column rising around him, in front, thickening as the cracks open
      const col = smooth((f - 10) / 40);
      sparks(f, W * 0.42, 1060, { spread: 260 + 300 * col, rate: Math.round(4 + 26 * col), burst: Math.round(10 + 60 * col), speed: 14, life: 90, seed: 97 });
      sparks(f, W * 0.42, 900, { spread: 500 * col, rate: Math.round(14 * col), burst: Math.round(30 * col), speed: 9, life: 120, seed: 98 });
    });
    twoTone();
  }
});
