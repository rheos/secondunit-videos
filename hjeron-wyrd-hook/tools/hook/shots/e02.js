// E2 [1976,2064) "before we burn it down": wide on the cracked plain; a line of fire races along the horizon behind him.
const START = 1976;
Anim.sketch({
  async load() {
    this.plate = await new Promise((r) => loadImage("/output/e01/02_kf_plain.png", r));
    this.him = await Anim.clip("stand");
    this.fire = await Anim.clip("fire");
  },
  draw(t, f) {
    background(0);
    cam(f, lerp(1.0, 1.06, smooth(f / 88)), 0, 0, 0.03, () => {
      const cv = cover(this.plate, 1.0, 0.5, 0.5);
      const [, hy] = toScreen(cv, this.plate, 0.5, 0.5);
      // "burn" 83.02 s -> f16: fires catch left to right along the horizon, all burning by "down" (84.0 -> f40)
      for (let i = 0; i < 14; i++) {
        const born = 16 + i * 1.8, a = smooth((f - born) / 6);
        if (a > 0) fireSprite(this.fire, f + i * 7, 60 + i * 140, hy + 14, 190 * a * (0.8 + 0.3 * ((i * 7) % 3) / 2));
      }
      if (f > 16) sparks(f, W / 2, hy - 40, { spread: 1800, rate: 6, burst: 20, speed: 6, life: 60, seed: 71 });
      standAt(this.him, this.him.frame(f), W / 2, 1100, 900);
    });
    scratchIn(f, 9, 6);
    twoTone();
  }
});
