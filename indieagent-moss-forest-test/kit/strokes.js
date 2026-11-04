// inked3d kit, the stroke layer: dry-brush marks planted on a model's surface, in part space, so they ride with it.
// Three kinds, each with its own flat tones (configureInk): 0 hatch (moss, fur, snow, rust, thatch), 1 blade (grass,
// bristles), 2 star (a flower, a rivet, a bloom). STROKES is uploaded once by uploadGeo().
// Record: part, x, y, z, nx, ny, nz, length, width, angle, seed, kind, height (0 at the root, 1 at the crown).
const STROKES = [];
// a clump of hatch strokes on a dome around (cx, cy, cz) with surface normal (nx, ny, nz): all at about one angle,
// tone by height in the clump and by the side toward the light. o: { ang, dens, kind }
function clump(part, cx, cy, cz, nx, ny, nz, rad, R0, o = {}) {
  const n = Math.round(lerp(16, 46, clamp(rad / .34)) * (o.dens || 1)), ang = (o.ang ?? .8) + (R0() - .5) * .7;
  let tx = ny, ty = -nx, tz = 0; if (Math.hypot(tx, ty) < .1) { tx = 1; ty = 0; tz = 0; } const tl = Math.hypot(tx, ty, tz); tx /= tl; ty /= tl; tz /= tl; const bx = ny * tz - nz * ty, by = nz * tx - nx * tz, bz = nx * ty - ny * tx;
  for (let i = 0; i < n; i++) {
    const a = R0() * TAU, r = Math.sqrt(R0()), u = Math.cos(a) * r * rad, v = Math.sin(a) * r * rad, dome = Math.sqrt(Math.max(0, 1 - r * r)) * rad * .62;
    STROKES.push(part, cx + tx * u + bx * v + nx * dome, cy + ty * u + by * v + ny * dome, cz + tz * u + bz * v + nz * dome, nx + (tx * u + bx * v) / rad * .9, ny + (ty * u + by * v) / rad * .9, nz + (tz * u + bz * v) / rad * .9, .035 + R0() * rad * .2, .018 + R0() * rad * .075, ang + (R0() - .5) * .45, R0(), o.kind || 0, (dome / rad) * .5 + R0() * .32);
  }
}
// a tuft of seven blades fanning up from a point, with three star flowers above it
function tuft(part, x, y, z, nx, ny, nz, g) {
  for (let b = 0; b < 7; b++) { const a = (b / 7 - .5) * 1.1 + (g() - .5) * .3, h = .13 + g() * .17; STROKES.push(part, x + Math.sin(a) * h * .55, y + Math.cos(a) * h * .55 + .06, z + nz * .05, nx * .3, 1, nz * .3, h * .55, .012 + g() * .009, Math.PI / 2 - a, g(), 1, .55 + g() * .4); }
  for (let f = 0; f < 3; f++) STROKES.push(part, x + (g() - .5) * .22, y + .17 + g() * .17, z + nz * .1, nx * .3, 1, nz * .3, .042 + g() * .022, .042 + g() * .022, g() * TAU, g(), 2, g());
}
