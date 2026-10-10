// S1 [1554,1634) "i dream of fire, i dream of gold": he plays by the fire, slow push in, the words cut into the sky.
const START = 1554;
Anim.sketch({
  async load() {
    this.plate = await new Promise((r) => loadImage("/output/s01/02_kf_camp.png", r));
    this.him = await Anim.clip("play_k");
    this.f = await hookFonts({ caslon: "Bodoni72SmallcapsBook-clean.ttf" });
  },
  draw(t, f) {
    background(0);
    const push_ = lerp(1.0, 1.09, smooth(f / 80));
    cam(f, push_, 0, -20 * smooth(f / 80), 0.03, () => {
      const cv = cover(this.plate, 1.0, 0.5, 0.55);
      // the fire in the left foreground, him to the right of it
      const fx = 560, fy = 1010;
      sparks(f, fx, fy - 120, { spread: 140, rate: 5, burst: 22 });
      fire(fx, fy, 460, 520, t, { seed: 3, n: 150, power: 1 + 0.25 * punch(f) });
      standAt(this.him, this.him.frame(f), 1340, 1110, 1000);
      sparks(f, fx, fy - 200, { spread: 220, rate: 2, burst: 10, seed: 41, speed: 12 });
    });
    // FIRE on "fire" (65.54 s -> f19), GOLD on "gold" (67.22 s -> f59)
    carve(this.f.caslon, "FIRE", 560, 250, 220, f, 19, 55);
    carve(this.f.caslon, "GOLD", 560, 250, 220, f, 59);
    twoTone();
  }
});
