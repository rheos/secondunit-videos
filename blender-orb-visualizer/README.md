# Blender orb visualizer

A procedural 24-second music-video sequence, built entirely by one bpy script for Blender 4.5 LTS
(EEVEE). A glowing orb travels through four flat, illustrative scenes: a gyroscope of orbits, a
corridor of arches, a rippling pillar field, and a halo with a shard burst. The orb glow, the bloom
and the geometry all react to one "energy" curve, which can be keyed per beat or baked from a song.

This folder is the lab for Blender-generated music-video material. New ideas go in as numbered
takes in [EXPERIMENTS.md](EXPERIMENTS.md), not as copies of the folder.

## Run it

```bash
blender -b --factory-startup --python orb_visualizer.py -a
```

Or open a new Blender file, paste `orb_visualizer.py` into the Text Editor and press Run Script.
The script deletes every object in the current scene first. It is re-runnable in the same file
(checked by `tools/rerun_check.py`).

| Tool | What it does |
|---|---|
| `tools/render_stills.py -- 1,150,445` | Renders chosen frames to `out/stills/` (about 1.4 s each at preview size) |
| `tools/render_preview.py -- take-02` | Renders the whole piece as a 720p MP4 in `out/` (about 15 min) |
| `tools/rerun_check.py` | Runs the script three times; datablock counts must stop growing |
| `tools/probe_api.py` | Prints what the installed Blender's API really is. Run it on every new Blender version |

Run them all as `blender -b --factory-startup --python tools/<name>.py -- <args>` from this folder.

`out/` holds renders and is gitignored (video never goes to GitHub). `reviews/` holds the small
contact sheets that are committed, so each take has a visual record.

## How the script is built

- **Time is in beats.** Every key goes through `beat(n)`. Changing `BPM` re-times the whole piece.
- **One energy curve.** `OV_Controller["energy"]` gets a pulse per beat (1.0 on downbeats, 0.5
  otherwise, 1.6 on drops). Drivers read it: orb emission `6 + 34*e`, orb light `250 + 1400*e` W,
  bloom strength `0.7 + 0.9*e`, arch scale `1 + 0.07*e`, pillar height. These are simple
  expressions, so they run without "Auto Run Python Scripts".
- **Keys for the main motion, procedural for the rest.**
  - The orb and camera use Bezier keys with auto-clamped handles.
  - Spins are two keys plus linear extrapolation.
  - Drift comes from Noise F-Curve modifiers.
  - The shard burst is one parent empty with three scale curves.
  - The energy curve is written with `keyframe_points.foreach_set`.
- **Camera.**
  - Track To aims at a target parented to the orb that wobbles on Noise modifiers.
  - Lens `shift_x` puts the orb on a third without panning.
  - Focal length and f-stop are keyed per section.
  - Depth-of-field focus follows the orb.
- **Look.**
  - Cel shading: Diffuse → Shader to RGB → CONSTANT Color Ramp (shadow, base, light) → Emission.
  - Inverted-hull outlines: Solidify, flipped normals, material offset to a backface-culled ink material.
  - The "Standard" view transform keeps the palette hexes exact.
  - Mist-pass fog, Glare bloom and a small Lens Distortion dispersion happen in the compositor.
- **Transitions.** Before each drop the mist depth falls from 70 to 9 m over three beats, the
  sky and fog color changes while hidden, and the fog clears 1.5 beats after the downbeat. Gates 1
  and 2 are rings the orb and camera fly through exactly on the drop.

## Blender 4.5 API facts (verified on 4.5.14, see `notes/blender-4.5.14-api-probe.txt`)

| Topic | 4.5 | Note |
|---|---|---|
| EEVEE engine id | `BLENDER_EEVEE_NEXT` | 5.0 goes back to `BLENDER_EEVEE`; the script picks whichever exists |
| Bloom | Compositor Glare, `glare_type = "BLOOM"` | EEVEE's own bloom is gone since 4.2 |
| Glare options | **Input sockets** (`Threshold`, `Strength`, `Size` 0-1, ...) | The old node properties still exist but are not what renders |
| Keyframe storage | Slotted actions: `action.layers[0].strips[0].channelbag(slot).fcurves` | `action.fcurves` still works in 4.5 but is removed in 5.0. Use `fcurve_ensure_for_datablock` |
| Motion blur | `scene.render.use_motion_blur`, `motion_blur_shutter` | Not on `scene.eevee` any more |
| Auto Smooth | `mesh.set_sharp_from_angle(angle)` | Replaced the old auto-smooth flag in 4.1 |
| Sequencer | `sequence_editor.strips` | `sequences` still there as an alias; renamed in 4.4 |
| Compositor tree | `scene.use_nodes`, `scene.node_tree` | 5.0 moves to `scene.compositing_node_group` |
| Principled emission | `Emission Color`, `Emission Strength` sockets | 4.0+ names |

## Pitfalls hit or avoided

- **Colors from Python are scene-linear.** A hex picked in a color picker is sRGB, so convert it
  (`hex_to_linear`). Otherwise every color comes out too bright and washed.
- **Shared meshes share material slots.** Recolor per object with `material_slots[i].link = "OBJECT"`.
  Appending to the mesh recolors every object that uses it.
- **Avoid `bpy.ops` in loops.** It is slow and depends on context. Build with bmesh and `bpy.data`.
- **Never call `wm.read_factory_settings` from a Text Editor script**, because it deletes the script
  itself. Reset by removing only your own `OV_` datablocks.
- **A light inside an emissive mesh** gets blocked unless the mesh has `visible_shadow = False`.
- **Track To flips near straight down.** The crane shot keeps the camera a little off vertical.
- **Fog too thick swallows the subject.** A mist depth of 4 m blacked out the frame before the
  finale. 9 m keeps the orb glowing through it.
- **A node tree keeps its animation when you clear its nodes.** Call `animation_data_clear()`
  before rebuilding, or drivers pile up on re-runs.
- **AgX desaturates flat palettes.** Use Standard for illustrative color, and let bloom handle the
  highlights over 1.0.

## Making it react to a song

1. Set `AUDIO_PATH` to the song. It goes into the sequencer, playback syncs to it, and it is muxed
   into the MP4.
2. Bake the song into energy: select `OV_Controller`, open the Graph Editor, select the `energy`
   channel, delete its keys, then Channel → Bake Sound to F-Curves (20-200 Hz for kicks).
3. Or beat-track outside Blender (librosa `beat_track`, times in seconds), paste the times into
   `BEAT_TIMES`, and set `BPM` to the song tempo so the sections line up.
4. Move `SECTIONS` and `DROP_BEATS` to the song's real structure.
