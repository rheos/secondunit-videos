# Perspective and composition, after paper-fox

Robin, early Sun Oct 25: "part of what makes the paper fox so cool is the perspective and composition", then "look at
the other scenes as well. compare the scenes to each other". Studied from all ten of paper-fox's scene frames
(`docs/media/scenes.jpg`, `poster.jpg`), its `docs/AUTHORING.md`, and the numbers in its scene files
(`src/scenes/sNN_*.js`, `s10-layout.js`, `s07-land.js`, the `-sky.js` files, `elements/water-flow.js`). The annotated
contact sheet (fox, light, gaze line, horizon, thirds) is `out/check/paperfox_composition.jpg` (local, not in git).

## The ten scenes side by side

Film px at camera rest (1920 x 1080). Fox = where its feet stand. Light = the target it looks at.

| # | Scene | Fox x, y | Scale | View | Light (target) | Leading line | Space | Camera |
|---|---|---|---|---|---|---|---|---|
| 1 | Dusk bridge | 652, 586 | .74 | profile, walking | sun 1626, 363 | stream under the bridge, back to the lake | open valley | drift right 40 |
| 2 | Night lake | 620, 706 | .95 | profile | moon 1562, 162 | falls and river back to the lake | open valley | push in (zoom 1.025, dolly 24) |
| 3 | Firefly forest | 815, 655 | .98 | rear 3/4 | star 1275, 318 | stream back to the star | enclosed: trunks both sides | push in (dolly 45) |
| 4 | Waterfall canyon | 640, 676 | .77 | rear 3/4, walking | star 1486, 276 | river back to the peaks | open canyon, cliffs both sides | drift right 35, rise 10 |
| 5 | Snow peaks | 640, 515 | .80 | rear 3/4 | star 1403, 137 | snow ridge falling to the lake | open, high above the valley | crane up 30 |
| 6 | Crystal cave | 640, 780 | 1.0 | rear 3/4 | star 1369, 268 | pool and stream back to the lit tunnel | enclosed: ceiling, crystals all round | push in (dolly 50) |
| 7 | Storm coast | 690, 634 | .80 | rear 3/4 | star 1499, 138 | waves rolling in from the right | open sea | drift right, sway |
| 8 | Aurora arch | 755, 534 | .60 | profile, walking | star 1517, 112 | the cliff-top path | open, the widest | drift right 35 |
| 9 | Star portal | 585, 752 | .95 | rear 3/4 | portal at centre | the portal's light down the pool to us | enclosed, symmetric | push in (dolly 60) |
| 10 | Dawn | 618, 650 | .90 | rear 3/4, sitting | sun 1507, 356 | river and falls back to the sunlit lake | open valley | pull back (dolly 60): the ending |

## What never changes

1. **Where the fox stands.** x 585 to 815 (mostly 620 to 690: the left-third line at 640), feet at y 515 to 780, on or
   just above the lower-third line (720), always on something raised: a bridge, a rock, a ledge, an arch.
2. **The light is the target.** Every scene has its light in the upper right (x 1250 to 1626, y 112 to 363) and the
   fox faces it. Its gaze line, fox to light, rises from lower left to upper right at 15 to 35 degrees in every
   frame: the picture's main diagonal. The key light comes from there too (light vector x +.3 to +.8), so it lights
   the fox's face. (Only the canyon has a moon at the upper left, and the fox still looks right, at the star.)
3. **Water zigzags back in layers; nothing converges.** Nine of ten have water, but it does not run at a vanishing
   point. In the night-lake poster the river crosses the bottom of the frame, disappears behind a mass of shrubs and
   pines, and comes back higher up as a level band of lake; the far end of every stretch is hidden. Each layer
   (flowers, rocks, shrubs, a forest mass, a rounded hill, the lake, the far shore, the mountains) is a soft, mostly
   level band with rounded humps, and depth comes from those bands overlapping, getting smaller and hazier. The light
   sits over the far water, not at the end of a line. (Robin, after creek draft 3: "you are making the vanishing point
   too obvious.. you have all these sharp lines running towards it. i think in the original paper fox compositions
   they were more subtle." He was right; draft 3 had straight ridges, rows of ledges and smooth river edges all
   funnelling to one point.) Rivers are still ribbons along a spline (`water-flow.js ribbon`), but the spline
   zigzags across the frame and its far end goes behind something.
4. **Framing.** A tall trunk or pines on the left edge, cut off by the top, in eight of ten (the other two are
   enclosed by trunks or crystals all round). The biggest pieces in the picture, flowers, berries, crystals or
   mushrooms, sit in the bottom-left corner in all ten. The bottom right is rocks, foam or more flowers.
5. **Scale gradient and overlap.** The same kind of thing at many sizes, from the trunk at the edge to tiny pines on far
   hills. Banks and ledges are irregular masses that overlap; hills are rounded humps. Only gentle diagonals; no rows
   of things lined up toward a point.
6. **Atmosphere.** Far layers lighter, bluer, lower in contrast; warmer near the light.
7. **One gentle camera move per scene**, 8.5 s long, at rest at its middle. No side-scrolling; travel is the transitions.
8. **One warm accent.** The fox is the only saturated warm thing besides the light, so it reads first in every frame.

## What changes from scene to scene (the film's rhythm)

- **Open and enclosed alternate.** Open valleys and coasts (1, 2, 4, 5, 7, 8, 10) against the enclosed forest, cave
  and portal (3, 6, 9). An enclosed scene comes every two or three scenes.
- **The fox's size follows the space.** Smallest in the widest vista (the arch, .6), biggest in the closest space (the
  cave, 1.0).
- **The vantage climbs and falls.** High above the valley in the peaks and the arch (the fox high in frame, y 515 to
  534), down on the floor in the cave (y 780).
- **The view alternates.** Profile when the fox walks (1, 4, 8), rear three-quarter when it stops to look (3, 5, 6, 7,
  9, 10), so we look over its shoulder into the picture.
- **The camera move alternates.** Drift (1, 4, 7, 8), push in (2, 3, 6, 9), one crane up (5), and a pull back to end (10).
- **The horizon moves with the mood.** High (445 to 470) where the land matters (portal, dawn, canyon), low (640 to
  700) where the sky or the ceiling does (peaks, cave).
- **One dominant hue per scene**: dusk pink, night blue, firefly teal and gold, canyon violet, snow white, ice blue and
  gold, storm grey-teal, aurora green, portal gold, dawn warm.

## First Night Out, staged the same way

The raccoons take the fox's place: perched at the left third, facing the light in the upper right. The rhythm comes
from alternating open and enclosed, the camera move and the raccoons' size.

| # | Scene | Space | Raccoons | Light (target) | Leading line | Framing | Camera |
|---|---|---|---|---|---|---|---|
| 0 | The hollow, dusk | half enclosed: the cedar fills the left 40% | faces in the hollow at x 620, y 560, scale .95 | the evening star, upper right | the valley falling away right | the trunk, sprays across the top | push in |
| 1 | Down the cedar | vertical | parent climbing down the trunk's diagonal, the kit above; .8 | the moon rising, upper right | the trunk itself, down to the creek glinting below right | branches | crane down |
| 2 | The creek | open | parent on a perch rock, x 500, y 760; the kit on a stone in the creek below; .9 | the moon over the lake, 1450, 205 | the creek zigzags out from behind a forest mass; the lake lies level under the moon | cedar at the left edge, ferns bottom left, rocks and foam bottom right | push in |
| 3 | The garden | open, diagonal | walking the fence's diagonal; the kit drifts to the moth; .8 | the porch light, at the vanishing point | the fence and the vegetable rows converging on the light | apple tree left, cabbages bottom left | drift right |
| 4 | Lost | enclosed, low | the kit alone, the smallest in the film, .6 | headlights sweeping in from the right | the deck posts and planks receding | the deck frames the top | slow creep in |
| 5 | Found | enclosed | the kit in the pipe; the parent's mask at its mouth; the biggest in the film, 1.1 | the porch light behind the parent | the pipe's rings | the pipe mouth as a circle | pull back out of the pipe |
| 6 | Home at dawn | open, high | climbing the cedar, high above the valley; .7 | the sunrise, upper right | the river in the valley, back to the sun | sprays | crane up |
| 7 | Asleep | enclosed | curled in the hollow, tails wrapped; 1.0 | the sun's bloom through the hollow's mouth | none | the hollow | pull back (the ending) |

Two gaps against paper-fox, for later:

- **No rear three-quarter view.** paper-fox's fox has two rest rigs blended by `yaw`; ours are profile only. Most of its
  "looking into the picture" shots are rear three-quarter. A second view for the raccoons is a rig job.
- **No warm accent on the raccoons.** They are grey on night blue, where the fox is the one warm thing in its frames.
  Their white masks and cheeks carry it at night; a warm rim light from each scene's light target (paper-fox's
  `applyRim`) would make them read first.
