# Look bible: VHS home video on a CRT

GOAL: it should feel like finding an old family tape: a summer evening in a park, a parent behind the camcorder,
kids you never quite see the faces of.

OUTPUT: stage 1 canvas2d 960x720 at 24 fps; stage 2 ntsc-rs at 480 lines (640x480); stage 3 1920x1080, tube 1120x840.

TIME: song 0.00 to 39.50 s, 948 frames. Average beat 0.6955 s (86 BPM), loose and live, so hits come from onsets.

## The picture (what the camcorder saw)

- **Into the sun.** The sun sits low behind the swings. Everything between it and the camera is a dark shape with a
  warm rim and a soft halo: kids, swings, slide, monkey bars, the big tree. Shadows run long toward the camera.
- **Kids are silhouettes, never faces.** One dark colour (#261a1e) for every child. Whole poses with tube limbs that
  bend through the knee or elbow; the outline carries who they are: ponytail and dress (swing), cap (slide), pigtails
  and skirt and a curly mop (tag), a bob hanging from the bars, a cropped head in the sandbox, and the hider's floppy
  sun hat. A small nose bump shows a profile's direction. Sizes follow depth on the grass (`kidH`).
- **Palette:** faded blue sky over white-gold at the sun, olive grass going deep green at the camera, back-lit
  equipment in very dark colours that keep a hint of their paint (red slide, blue-grey frames).
- **Camcorder grammar:** handheld drift that never stops (more shake on screen when zoomed in), slow pans, a zoom
  rocker that eases, autofocus that hunts after every zoom and in the shade, an auto-iris that darkens with the sun in
  frame and opens under the tree, smear on a fast pan, one in-camera cut (record pause) that rolls and tears for
  four frames. The date stamp is burned in (5x7 character generator): AUG.17 1991, and the minute jumps at the cut.

## The tape and the TV

- Tape is ntsc-rs only, from NTSCRT's own presets, so the strength is a preset choice (Mild, Medium, Clean VHS).
- What the VCR adds is drawn after the tape: the blue screen with PLAY, snow while the heads find the tape, the
  tracking band rolling up and out as the picture arrives with the first sung word, PLAY clearing at 3.6 s.
- The TV is the house CRT shader, 240 lines, a rounded tube, a dark plastic bezel and the screen's colour spilling on
  a dark room. Deterministic: no GUI stage, no random state between frames.

## Beats (js/timing.js)

| s | hit |
|---|---|
| 0.00 | blue screen, PLAY |
| 1.25 | snow |
| 1.50 | picture and song arrive together; swing at its front peak; tracking band rolls through |
| 7.34 | the camera starts looking (pan right) |
| 10.08 | zoom in on the slide; 10.40 the boy lets go, arms up |
| 15.71 | in-camera cut on the accompaniment onset: the monkey bars |
| 16.30 | pan, searching; 18.06 push in on the sandbox |
| 25.39 | whip pan to the big tree; 26.98 the sun hat pokes out and back |
| 33.39 | the camera holds on the tree, searching |
| 34.55 | the hider leans out; 35.08 steps out; 35.59 runs toward the camera |
| 37.77 | stops and waves, on the bar line |

## BANNED

Faces, lyric text, a title card, rubber-hose limbs, stiff cut-out figures rocked whole, polka-dot light in the tree
crown (tried, read as spots), saturated cartoon-green grass, bright play equipment in a back-lit shot.
