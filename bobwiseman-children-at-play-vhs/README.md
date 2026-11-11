# Children at Play: VHS home video on a CRT (look test)

Bob Wiseman, "children at play" (Giulietta Masina at the Oscars Crying, 2013), song 0:00 to 0:39.5. A look test for
the style menu: a home video someone shot on a camcorder in a park at golden hour, put on VHS tape, and played back
on a CRT television. Drawn in code, 0 credits. Issue rheos/secondunit-videos#496.

The song's opening verse is a mother looking for a laughing child she can't see. The camcorder is her: it drifts in
her hand, pans across the playground, zooms in and hunts for focus, and finds the hider behind the big tree, who runs
toward the camera and waves.

## Pipeline

| Stage | What | File |
|---|---|---|
| 1. Home video | The park drawn at 960x720 (4:3) through a camcorder: back-lit silhouette kids with a warm rim, long shadows toward the camera, sun bloom, focus hunt, auto-iris, pan smear, burned-in date stamp, a record-restart glitch at the cut | `home.html`, `js/world.js`, `js/cast.js`, `js/camera.js`, `js/home.js` |
| 2. Tape | `ntsc-rs-cli` with an NTSCRT preset (Mild, Medium or Clean VHS): chroma bleed, noise, head switching, tracking noise | `tape.sh tape "Medium VHS"` |
| 3. TV | The VCR's own screens (blue screen and PLAY, snow, the tracking band rolling through as it locks), then the house CRT shader (borrowed from `bobwiseman-libelous/js/tv/crt.js`: scanlines, barrel, phosphor bloom), a rounded glass face, a plastic bezel, the screen's light on a dark room. 4:3 tube inside a 16:9 frame | `tv.html`, `js/tv.js`, `js/crt.js` |

```bash
npm i                        # playwright (uses the installed Chrome)
./tape.sh render             # stage 1 -> work/home.mp4
./tape.sh tape "Medium VHS"  # stage 2 -> work/tape_medium/
./tape.sh tv medium 720      # stage 3 + song -> out/children-at-play_vhs-medium_f0-f948_24fps_720p.mp4
node tools/still.mjs cast.html out/check/cast 0                      # cast line-up, 1920x1080
node tools/still.mjs home.html out/check/h 10.8 27.2 --width 960 --height 720
```

The song (`_in/children-at-play.mp3`, SHA-256 `64ca875e5588853e93a02f23def6fd57bf27f22c4bef3d3529a88c0d65b5fdff`) and
our Whisper transcript (`work/*.OURS.*`, ours, timing only) stay out of git. No words of the song appear on screen.
Every hit is in `js/timing.js`, measured from the Demucs vocal stem and the accompaniment onsets.

Look bible: `LOOK.md`.
