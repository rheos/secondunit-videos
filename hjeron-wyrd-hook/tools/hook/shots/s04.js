// S4 [1785,1824) "the flames reveal": head-on into the fire; on "reveal" it splits like a curtain and the wolf walks out.
const START = 1785;
Anim.sketch({
  async load() {
    this.plate = await new Promise((r) => loadImage("/output/s04/02_kf_fire_ground.png", r));
    this.wolf = await Anim.clip("wolf_walk_k");
    this.fire = await Anim.clip("fire");
  },
  draw(t, f) {
    background(0);
    const open = smooth((f - 12) / 10); // "reveal" 74.94 s -> f14
    cam(f, lerp(1.0, 1.12, smooth(f / 39)), 0, 0, 0.05, () => {
      const cv = cover(this.plate, 1.05, 0.5, 0.6);
      const [fx, fy] = toScreen(cv, this.plate, 0.5, 0.66);
      // back flames, then the wolf between the halves, then the front flames
      fireSprite(this.fire, f, fx, fy + 20, 980, { split: open * 1.1 });
      if (open > 0.05) {
        // the wolf steps out of the fire: feet at the fire bed, growing as it walks at us
        const u = smooth((f - 12) / 27), i = 6 + f * 0.7;
        push(); drawingContext.globalAlpha = smooth(open * 1.6);
        // the clip crops its paws at the frame edge: keep that edge below the screen
        standAt(this.wolf, this.wolf.frame(i), fx, H + 20 + 70 * u, lerp(760, 1020, u));
        pop();
      }
      sparks(f, fx, fy - 250, { spread: 600, rate: 6, burst: 60, speed: 15, life: 40, seed: 23 });
    });
    twoTone();
  }
});
