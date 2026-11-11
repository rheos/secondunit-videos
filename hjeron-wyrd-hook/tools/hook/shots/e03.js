// E3 [2064,2177) "will we wake up / before this flaming dream is seen": from behind him, the fire line burns on the horizon
// and the Sky Serpent rises over it, its ring in the sky. WAKE carved again and cracks apart.
const START = 2064;
Anim.sketch({
  async load() {
    this.sky = await new Promise((r) => loadImage("/output/s03/02_kf_sky.png", r));
    this.him = await Anim.clip("back");
    this.serp = await Anim.clip("serpent");
    this.fire = await Anim.clip("fire");
    this.f = await hookFonts({ caslon: "Bodoni72SmallcapsBook-clean.ttf" });
  },
  draw(t, f) {
    background(0);
    cam(f, lerp(1.0, 1.05, smooth(f / 113)), 0, 0, 0.025, () => {
      const cv = cover(this.sky, 1.35, 0.5, 0.6);
      const [, hy] = toScreen(cv, this.sky, 0.5, 0.9);
      // the serpent rises on "flaming" (88.04 s -> f33) and stands in the sky through "seen"
      const rise = easeOut((f - 28) / 34);
      if (rise > 0) {
        this.serp.draw(this.serp.frame(30 * clamp((f - 28) / 85)), W * 0.5, lerp(hy + 700, H * 0.42, rise), 1050);
        push(); drawingContext.save(); drawingContext.beginPath(); drawingContext.rect(0, hy + 4, W, H); drawingContext.clip();
        cover(this.sky, 1.35, 0.5, 0.6); drawingContext.restore(); pop();
      }
      for (let i = 0; i < 16; i++) fireSprite(this.fire, f + i * 5, 40 + i * 125, hy + 10, 150 * (0.8 + 0.3 * ((i * 5) % 3) / 2));
      sparks(f, W / 2, hy - 30, { spread: 1900, rate: 5, burst: 18, speed: 6, life: 60, seed: 73 });
      standAt(this.him, this.him.frame(Math.min(120, 20 + f)), W * 0.3, H + 60, 820);
    });
    // "wake" 86.26 s -> f6, cracks on "up" (86.66 -> f16)
    carveCrack(this.f.caslon, "WAKE", 1350, 260, 230, f, 6, 16, 26);
    scratchIn(f, 8, 7);
    twoTone();
  }
});
