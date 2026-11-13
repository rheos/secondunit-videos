// planted.mjs · check that planted feet never slide: walk each rig through two cycles in small steps and, for every
// stance, report how far the foot moves while it is flat on the ground (between the heel strike roll and the
// push-off roll, where the ankle must not move at all). node tools/planted.mjs
import { launch, openLook } from '../../tools/motion-lab/frames.mjs';
const browser = await launch();
const { p, errors } = await openLook(browser, 'character.html', { width: 640, height: 360 });
const out = await p.evaluate(() => {
  const res = {};
  for (const name of ['parent', 'kit']) {
    const r = RIGS[name], stances = new Map();
    let worst = 0, samples = 0;
    for (let i = 0; i <= 4000; i++) {
      const d = i / 2000 * r.LC, ps = r.pose({ d, t: i * .005, walk: 1 });
      r.FEET.forEach((F, k) => {
        const w = d / r.LC + r.PH0 + F.o, u = w - Math.floor(w);
        if (u < .08 + 1e-6 || u > r.DUTY - .16 - 1e-6) return;
        const key = k + ':' + Math.floor(w), a = ps.legs[k].ankle;
        if (!stances.has(key)) stances.set(key, a.slice());
        const a0 = stances.get(key); samples++;
        worst = Math.max(worst, Math.hypot(a[0] - a0[0], a[1] - a0[1]));
      });
    }
    res[name] = { stride: +r.LC.toFixed(2), stances: stances.size, samples, worstSlidePx: +worst.toFixed(6) };
  }
  return res;
});
console.log(JSON.stringify(out));
await browser.close();
if (errors.length) { console.log(errors.join('\n')); process.exit(1); }
