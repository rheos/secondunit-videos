// The daisy's contract for the motion-lab audit (rheos/secondunit-videos tools/motion-lab/audit.mjs).
// 27 petals for the whole song: verse 1 drops 1-10, verse 2 11-19, verse 3 20-27, each on a backing "me".
// The drop times come from the pages' own timing files; this checks that the pages agree with each other:
// every page shows 27 minus the drops so far (song-wide) on every frame, and each petal starts to fall on
// its frame. Text probes (scroll, tags, reading box, price tag) are checked by the audit itself.
//   node <tools>/motion-lab/audit.mjs looks/glass.html 151 233.04 --spec audit.spec.mjs
import fs from 'fs';
const list = (file, name) => {
  const src = fs.readFileSync(new URL(file, import.meta.url), 'utf8');
  const m = src.match(new RegExp(`const ${name} = \\[([^\\]]*)\\]`));
  if (!m) throw new Error(`${name} not found in ${file}`);
  return m[1].split(',').map(Number);
};
const DROPS = [...list('./js/glass/v1-timing.js', 'V1_DROPS'), ...list('./js/glass/v2-timing.js', 'DROPS'), ...list('./js/glass/timing.js', 'DROPS')];
const sane = DROPS.length === 27 && DROPS.every((d, i) => !i || d > DROPS[i - 1]);

export const events = Object.fromEntries(DROPS.map((d, n) => [`petal#${n}`, [Math.floor(d * 24 + 1e-6)]]));
export const tolerance = [0, 1];   // a petal falls on the frame its time lands in, or the next one
export const checks = [
  { name: '27 drops, in order, across the three timing files', test: () => sane || `${DROPS.length} drops: ${DROPS.join(', ')}` },
  { name: 'petals left agrees with the song-wide count', test: (log, { t }) => {
    const r = log.find((x) => x.name === 'petals left'); if (!r) return true;   // no daisy on this page
    const want = 27 - DROPS.filter((d) => t >= d).length;
    return r.v === want || `shows ${r.v}, song-wide count says ${want}`;
  } },
];
