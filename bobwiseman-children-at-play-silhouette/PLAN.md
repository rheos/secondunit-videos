# Children at Play, verse 1 (0:00 to 0:39): coloured paper silhouettes

Look test in the `papersilhouette` look (In Her Dream's cut-paper kit). Phase 1 is the line-up, three key frames and
this plan. No full render yet. The shared story and hard limits are in `work/BRIEF.md` (local).

## The idea in one line

One paper stage: a farm at the end of a summer day, seen side on. The barn's hay door is lit from the first second,
and gold laugh rings drift out of it toward the yard the whole verse. The mother searches every corner of the yard
except the one the rings come from. The listener sees the two heads in the lamplight; she never looks up.

## Palette (one colour per person, four a frame besides the ground)

| Paper | Who or what | Hex |
|---|---|---|
| ground | evening sky in three bands, the low sun, the washing (cut from the palest sky paper) | `#e7a487` `#f0bf96` `#f5d4ab` `#f8e4c2` |
| plum | the whole set: house, barn, silo, tree, fence, yard, and the two shadow heads in the hay door | `#5c3652` family |
| teal | the mother, nobody else | `#2a8279` |
| gold | laughter: the rings and the lamplit hay door; the daughter is a deeper marigold of the same paper, because the laughter is hers | `#f1b23a`, `#e39a2d` |
| rust | her lover (seen in the film only as his boots at the ladder foot) | `#b0482c` |

The 36 s frame holds plum, teal, gold and rust: four. In Her Dream's navy family rule is not carried over.

## Implication, and how it stays inside the limits

- In the hay door: two heads and shoulders as plum shadows on the lamplit back wall, side by side with a gap between
  them, both tipped back laughing. Below the chest a dark hay mound fills the door. Nothing else, ever.
- Both are drawn with the kit's adult puppet (adult height, adult head scale, her long loose hair, his short hair).
  The line-up shows them full length in their own colours: clearly grown adults.
- Things left outside: her marigold flats and his rust boots at the foot of the ladder up to the hay door.
- No faces anywhere (the kit's profile heads only). No lyric text on screen; the line-up labels are a rig check.

## Beats (song seconds), as blocked in `js/shots/01-verse1.js`

| Time | Picture | Camera |
|---|---|---|
| 0.0 to 7.3 | The farm, sun low behind the hills, washing on the line. The hay door already glows. Rings start at 1.5 and keep coming in soft bursts (about every 1.7 s, bigger on the sung laughs) | wide, very slow drift |
| 6.9 to 7.34 | The house door swings open on the pale room | |
| 7.34 to 10.0 | She steps out onto the threshold, lit from behind, and shades her eyes looking out left over the field. **Key frame a (8.0)** | wide, 1.08 |
| 10.0 to 25.4 | The search: along the porch and down to the swing (she stops it with her hand; it keeps swaying), to the fence at the field's edge (shading her eyes), then back across the whole yard to the washing line, where she lifts a sheet and peers through. The rings keep drifting toward the house and fading short of her | follows her left and back |
| 25.39 | She stops between the sheets, hand dropping, head lifting: she hears it | pushes in to 1.2 |
| 26.98 | A paper turn (two drawings, edge-on between) to face the barn, a hand to her chest, on the big burst. **Key frame b (27.5)** | 1.25 on her and the barn |
| 27 to 33.4 | She stands and listens; the rings keep coming | holds |
| 33.39 to 34.7 | She walks to the barn and stops below the hay door, then turns her back to it | pushes in to 1.55 on the barn front |
| 34.6 to 37.4 | She calls across the yard, hand cupped at her mouth. The rings now spill down from the door just over her head and rise away. **Key frame c (36.0)** | settles |
| 37.4 to 39.0 | Hands folded at her apron, waiting. Rings rise over her. Hold | still |

Timing to tighten in phase 2: the first laugh (brief says 1.50; our transcript has it near 1.9), the turn on the
laugh at 26.98 and the call at 34.57 should be snapped to the vocal stem's onsets (`work/stems/`), as the house rule
says for anything that lands on a syllable.

## What is reused, what is new

Reused unchanged from `bobwiseman-in-her-dream` (copied, not edited there):
- `js/kit.js`: the paper primitive (`cut`, grain, mottle, drop shadows), path helpers, the jointed `puppet`, `POSE`,
  `twos` (paper on twos), the shot registry.
- `js/main.js`: frame assembly, the paper finish and vignette (only the tail fade moved to this song's end).
- `tools/still.mjs`: adapted from that project's `check.mjs --full`.

New for this film:
- `js/cast.js`: palette, the three puppets (mother with apron and bun, daughter with long hair, lover with a straw
  hat), arm IK (`armTo`) and her poses (shade, call, still), and the set: farmhouse with porch and opening door,
  gambrel barn with hay door, hoist, big doors and ladder, silo, swing tree, washing line, fence, sky and hills.
- `js/lovers.js`: `hayDoorLovers` (the two shadow heads) and `driftRings`, the kit's laugh rings with a drift and
  rise so they travel on the evening air.
- `js/shots/00-lineup.js` (`lineup.html`) and `js/shots/01-verse1.js` (`index.html`).

## Commands

```bash
nice -n 15 node tools/still.mjs lineup.html out/lineup 2.3
nice -n 15 node tools/still.mjs index.html out/key 8 27.5 36
```

`node_modules/` (Playwright) is local and gitignored; copy it from a sibling project or `npm i`.

## Phase 2 (after Robin's yes on the look)

1. Snap the three timed beats to vocal onsets; set the ring bursts on the actual laughs.
2. Polish the in-between actions (porch steps, swing push, sheet lift, the walk to the barn) on contact sheets.
3. Add a render script (adapt In Her Dream's `render.mjs`) and render 0 to 39 s at 1920x1080, 24 fps, muxed with the
   song, name stamped per the catalogue rules.

Render time estimate: stills capture at about 450 to 700 ms a frame in headless Chrome on this Mac, so the 936
frames of 0:00 to 0:39 take about 8 to 11 minutes plus a minute of encode. Run it with `nice -n 15` once the
Blender render on this machine has finished.
