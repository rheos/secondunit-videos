# inked3d kit

A 3D model drawn as a hand-inked cel on painted plates, cut into shots and held on twos, so a code-rendered film
reads as theatrical 2D animation. Reverse engineered on 2026-11-03 from chetaslua's "The Moss Keeper"
(github.com/ChetasLua/moss-keeper; the repo holds only the finished MP4 in a player, so the method came from the
film's frames and the author's notes) and first built as the moss forest look test (`indieagent-moss-forest-test/d4.html`,
rheos/secondunit-videos#396). Look file: `looks/inked-3d.yaml`. Robin on draft 4: "pretty close".

## What is fixed across films

- **The figure is a real 3D model**, never a sprite: it turns, parts occlude, its stains stay on its surface.
  Shapes come from `roundBox`, `lathe` and `tube`; every vertex carries a part index and a material index.
- **Shading from one light** through a hard 3072 px shadow map: three flat tones per material (lit, mid from a
  sky fill, shade), a terminator roughened by noise, no gradients.
- **Weathering in object space** (material kind bit 1): flat stains, the finish gone in patches, lichen or
  bloom, plank or panel lines, cracks. Noise thresholds are the look and stay fixed; the colours are the film's.
- **Ink traced from the render**: edges of part id, depth and normal, a line width that wanders 1 to 4 px at 2x,
  gaps where the pen lifted. Thin and dark, never a clean even stroke.
- **The stroke layer**: dry-brush marks planted on the surface in part space (`clump`, `tuft`), three kinds with
  five, three and four flat tones. Moss in the forest; fur, snow, rust, thatch or feathers elsewhere.
- **Plates have hard edges and flat tones** (`wash`, `hatch`, `barkTrunk`, `frondLeaves`); defocus only in
  close-ups. Dust is a flat hard-edged shape (`dustCloud`). Grain: six fixed tiles, overlay at .055.
- **Held drawings**: the figure on twos (`onN(t, 12)`), a heavy move on threes (`onN(t, 8)`); camera and
  particles on ones. Cut into shots. Light numbers measured off the real reference, never guessed from a word.
- Drawn at 2x (`GW x GH`) and downsampled by the project when it draws the GL canvas onto its frame.

## What a project sets

`configureInk({ mats, weather, glow, tones, blades, petals, ink })` once at load: the materials (three
colours and a kind each), the weathering colours plus `weather.density` (cover, 1 = the piano) and `weather.scale`
(patch size, under 1 for bigger patches), the glow tones, the stroke-layer tones and the ink colour.
Then its own model (`build*` with the shape tools), pose (part matrices per held frame), stroke planting, plates,
shots and cameras, and whatever flat life goes on top. See the moss forest's `js/d4/` for the shape of a project.

| File | What it does |
|---|---|
| `base.js` | Frame size and clock (`window.INK3D_CFG` before load: W, H, DUR, FPS, margin), easing, `onN`, `prevT`, seeded noise (`rng`, `h2`, `vn2`, `fbm2`), colour (`hex`, `H4`, `mixc`, `css`), `canvas`. |
| `gl.js` | The WebGL2 renderer: `M` matrices, `segM`, `GEO` + `roundBox`/`lathe`/`tube`, `configureInk`, shaders (solid, depth, stroke, ink post), `uploadGeo`, `renderModel(parts, cam, uni)`. `MAXP` 48 parts, `NM` 16 materials. |
| `strokes.js` | `STROKES`, `clump`, `tuft`. |
| `paint.js` | `plateCanvas`, `wash`, `hatch`, `barkTrunk`, `frondLeaves`; margins `PX`, `PY`. |
| `flat.js` | `camera`, `project`, `birdPose`, `dustCloud`, `makeGrainTiles`, `drawGrain`. |
| `sync.sh` | Copy the kit into a project as `<project>/kit/` with a VERSION stamp. Never edit a project's `kit/` by hand. |

## Making a film

```bash
# from the secondunit-videos checkout; a new folder per film, allowlisted in .gitignore
tools/inked3d-kit/sync.sh indieagent-<slug>-test
# page: <script> kit/base.js kit/gl.js kit/strokes.js kit/paint.js kit/flat.js, then the project's js/
PAGE=index.html node check.mjs out/check/sheet.jpg 1 4 7 10          # a check.mjs that honours PAGE, as the moss forest's
node ../tools/motion-lab/audit.mjs index.html 0 10 --spec audit.spec.mjs --width 1280 --height 720
nice -n 15 node ../tools/motion-lab/render.mjs index.html 0 10 out/<name>_review-720p_v1.mp4 --width 1280 --height 720 --workers 3
```

About 0.25 to 0.4 s a frame on the Intel Mac. Pure frames: `drawFrame(t)` must give the same pixels in any order.

## Before you add to the kit

A change to the kit changes every film on it. Prove it on the moss forest first: render the six regression times
from `d4.html` (1.5, 5.4, 7.5, 8.7, 11, 13.2 s) before and after and compare the PNGs, then re-sync every project
that uses the kit and note the VERSION bump in its README.
