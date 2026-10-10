// S2 [1634,1700) "i dream of secrets never told": close on the veil, firelight breathing in the engraving, the eye glint.
const START = 1634;
Anim.sketch({
  async load() {
    this.him = await Anim.clip("close_k");
    this.f = await hookFonts({ caslon: "Bodoni72SmallcapsBook-clean.ttf" });
  },
  draw(t, f) {
    background(0);
    cam(f, lerp(1.02, 1.07, smooth(f / 66)), 0, 0, 0.02, () => {
      // smoke rising from the fire below frame: a few long curling wisps, scratched in white
      noFill(); stroke(255);
      for (let i = 0; i < 6; i++) {
        const x0 = 120 + i * 150 + Math.sin(i * 3.1) * 60, ph = i * 1.9, rise = (t * 140 + i * 210) % 1500;
        strokeWeight(1.2 + (i % 3) * 0.7);
        beginShape();
        for (let k = 0; k <= 30; k++) {
          const v = k / 30, y = 1150 - v * 1300 + (1500 - rise) * 0.15;
          vertex(x0 + Math.sin(v * 7 + t * 1.6 + ph) * (20 + 90 * v) + v * 120, y);
        }
        endShape();
      }
      // embers drifting up across the foreground behind him
      sparks(f, 700, 1150, { spread: 900, rate: 3, burst: 8, speed: 9, life: 70, seed: 17 });
      standAt(this.him, this.him.frame(f), 1060, 1130, 1150);
    });
    // SECRETS on "secrets" (68.76 s -> f16), scratched away at the end of "told"
    carve(this.f.caslon, "SECRETS", 330, 250, 125, f, 16, 58);
    twoTone();
  }
});
