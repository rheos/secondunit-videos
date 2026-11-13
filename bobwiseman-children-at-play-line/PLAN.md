# Children at Play, verse 1, in the night-sky line look: plan

Look: `looks/swift-line.yaml` (makevoid's Swift and Metal no-image renderer). Song 0:00 to 0:39, 24 fps, 1920x1080.
Shared brief: `work/BRIEF.md` (gitignored). Phase 1 is a line-up and three key frames. Nothing has gone to Bob.

## The idea in one line

One continuous camera, drawn as an elevation: it starts tight on the lit kitchen window with the mother inside,
pulls back to show the whole farm with the laughter rising from the hay door, follows her across the yard as she
rules places out, then pushes in on the barn and comes to rest on the hay door at the same size and screen position
the kitchen window had at the start. The window held her; the hay door holds them, and she stands below it in the
dark, looking at the wrong door.

## How the look's rules map

- One camera, scale carries the story: 147 px/m on the window, out to 56 px/m for the farm, 72 while she searches,
  80 to 86 when she turns, back in to 150 on the hay door. Every world stroke has a `strokeWidth` track of
  `px / zoom`, so lines stay one width on screen at every scale (the `px_width` trick from `miles.rb`).
- Gold means a person: only the two of them are gold, two small lights at standing head height in the hay door
  (1.57 m and 1.69 m above the loft floor), with two faint head-and-shoulders outlines under them.
- The hot accent is their laughter: small hot line marks (arcs, ticks, waves) that rise and drift from the hay door,
  and a thin hot ring when a laugh carries across the yard.
- The mother is paper lines with no face. Her looking is cool: a dashed sight line and a reticle on what she looks at,
  and a cool cross on each place once she has ruled it out. Her line never points up.
- The live readout tells only the truth: her distance to the hay door, from 22.3 m at the kitchen window to 2.7 m at
  the end. It never says what is up there.
- Small labelled objects: kitchen window, porch, washing line, swing, field, hay door. No sung words anywhere.
- The opening image returns: lit kitchen window with her in it at the start, lit hay door with the two lights at the
  same place and size at the end.

## Hard limits, and how the drawing keeps them

- Adults: the line-up shows both at adult height on a ruler (1.68 m and 1.80 m) with adult proportions. In the
  film the two lights sit at standing adult head height inside a 2.25 m hay door.
- Nothing physical: all we ever see of them is two lights and two faint outlines side by side. What is left outside
  is the hint: two pairs of adult shoes and his straw hat at the foot of the ladder, a step from where she stops.
- No faces on anyone. No real people.

## Beats (song seconds = video seconds)

| Time | Picture | Camera |
| --- | --- | --- |
| 0.0 to 1.5 | Farm at the end of the day. Tight on the lit kitchen window; she stands at the sink. Label "kitchen window". | 147 to 152 px/m, slow push |
| 1.50 | First laugh: hot marks rise from the hay door (off screen), and a thin hot ring crosses the frame and passes through her window. She doesn't react. | starts the pull-back |
| 1.5 to 6.7 | Pull back: house, yard, tree and swing, fence, barn. The source of the marks is revealed. Label "hay door". | 152 to 56 px/m |
| 6.0 to 7.34 | She leaves the window; the door opens at 7.0 and lamplight spills out. | wide hold |
| 7.34 | She steps onto the porch and starts looking: sight line, reticle, "porch". | wide hold to 8.9 |
| 7.34 to 25.0 | The search: porch (cross 8.85), washing line (13.0), swing (17.85), the field's edge (24.9). The laughter keeps drifting up behind her. | follows her at 72 px/m, leading toward the barn |
| 25.39 | She hears the laugh: a ring reaches her, she stops, her sight line goes out. | eases to the turn framing |
| 26.98 | The big laugh: a big ring sweeps past her and she turns to the barn. Her sight line locks on the barn door, not the hay door. | 80 px/m |
| 27 to 33.4 | She stares at the barn door. Marks rise. | slow push, 80 to 86 |
| 33.39 | She walks to the barn and stops below the hay door at 35.7, a step from the ladder and the shoes, hand to her brow, looking straight ahead. | push in to 146 |
| 35.7 to 39.0 | Hold. Laughter rises over her from the two lights above. Readout settles on 2.7 m. | settles at 150 px/m, hay door where the window was |

Key frames rendered: `out/phase1/cap-line_key-a_08s.png` (frame 192), `cap-line_key-b_27s.png` (frame 654, 27.25 s,
just after the turn so the sight line is drawn), `cap-line_key-c_36s.png` (frame 864). Line-up:
`out/phase1/cap-line_lineup.png`.

## Files

- `scene/kit.rb`: palette, the farm set and the three people, in metres. Shared by the scene and the line-up.
- `scene/cap.rb`: the 39 s scene: camera table, mother path and poses, laughter, rings, sight lines, labels,
  readout. Writes `work/mv/scenes/cap.json` and `cap.events.json`.
- `scene/lineup.rb`: the line-up still. Writes `work/mv/scenes/lineup.json`.
- `work/mv/`: a copy of the renderer project from `bobwiseman-swift-noimage/work/mv` (built `mgraphics` included,
  so no rebuild was needed). Gitignored.

Build and stills (Homebrew Ruby, from this folder):

```bash
nice -n 15 /usr/local/opt/ruby/bin/ruby scene/cap.rb
nice -n 15 work/mv/tools/graphics/.build/release/mgraphics work/mv/scenes/cap.json --out out/k --frames 937 --only 192,654,864 --supersample 2
nice -n 15 /usr/local/opt/ruby/bin/ruby scene/lineup.rb
nice -n 15 work/mv/tools/graphics/.build/release/mgraphics work/mv/scenes/lineup.json --out out/l --frames 1 --only 0 --supersample 2
```

## Reused from the kit

- The renderer project and fonts (Bradley Hand, Andale Mono) from `bobwiseman-swift-noimage/work/mv`.
- From `miles.rb`: the log-space zoom camera averaged over a window, stroke width held per pixel, the reticle, the
  expanding ring, the mono readout with a hand-lettered label, CIBloom, the event list for the finish.
- `finish_cues.rb` stays the model for sound and VFX: the scene already reports `laugh`, `ring`, `look`, `cross`,
  `step`, `door`, `hear`, `turn`, `arrive` and `section` events.

## Phase 2 (after Robin's yes)

1. Snap the laugh bursts to the song. Today the regular bursts run on a seeded cadence of about 1.5 s; the five named
   moments (1.50, 25.39, 26.98, 33.39, 36.0) are fixed. Move the cadence onto onsets from `work/stems`.
2. Animate the small stuff: her hands at the sink, the walk cycle checked in motion (it switches poses on distance
   walked), the sheets and swing sway already move.
3. Range previews of the three moves (pull-back, turn, push-in) at 30 fps, 1x, before a full render.
4. Finish: soft footsteps on `step`, a short tick on each `cross`, a low shimmer on `ring`. No added laughter sounds;
   the only laughter is the song's.
5. Render the master, scale a 720p review file, then the 4:5 question if Bob wants it.

Render time on the Intel Mac at nice 15: three stills at supersample 2 took 2.2 s. The whole 937 frames should be
about 1 minute with JOBS=5 at 1x and 3 to 4 minutes at supersample 2, plus about 20 s for the sound and VFX finish.
Only when the Mac is free; another session is rendering in Blender today.

## Open questions for Robin

- The two faint outlines under the lights: keep them, or lights only? They make "two adults standing" read at a
  glance; lights alone are more discreet.
- The opening has a lot of dark yard under the window. It is the space she will stand in at the end; if it reads as
  empty, the opening can sit lower and the rhyme becomes a match of size rather than of place.
- Readout wording: "between her and the hay door". Alternatives: "to the hay door", or counting in steps.
