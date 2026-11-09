# 10,000 Miles: painted paper layers, test 01

Step 2 of the painted-plate test (issue #469). Robin picked painted paper layers from the style board
(`bobwiseman-10000-miles-styleboard/`, #465). Look recipe: `looks/paper-plates.yaml`.

Song 43.375-62.833 s, chorus 1, 467 frames at 24 fps.

| Time (s) | What happens |
|---|---|
| 43.4-49.6 | Dusk rooftop. The toy rocket hops on the chorus's first three hits (43.46, 45.42, 47.30) with a puff each time, then rumbles and lights. |
| 49.6 | Lift-off on the first sung word. The camera climbs after it: roof, town, hills and sky slide down at their own depths. |
| 51.5-53.5 | A warm cloud bank passes behind the rocket, a cool one in front of it. |
| 53.2-54.2 | A cloud sheet closes over the frame with the rocket behind it. |
| 54.2-55.1 | The rocket tears through the sheet from the middle; the torn edge shows the paper's pale core. |
| 54.2-59 | Night. The town below is a small round paper world that shrinks away while the rocket swoops round. |
| 59-62.8 | The rocket circles the little world, passing behind it on the far side. |

## How it's made

- **Plates:** 12 layers painted by GPT Image through Codex (ChatGPT plan, 0 credits, about 70 s and ~21k Codex tokens each,
  six at a time). `plates.json` holds every prompt; `./paint.sh <layer>` paints one with the board's paper plate
  (`work/style_ref.png`) attached as image 1. Every layer except the sky, night and cloud sheet came back on a real
  transparent background.
- **Bundle:** `build_plates.py` (Pillow) trims each layer to its alpha box and writes `work/plates.js` as WebP data URLs,
  about 3 MB. Data URLs keep the canvas untainted on a file:// page, so the render tools can read frames.
- **Motion:** `js/film.js`, two shots, every frame a pure function of song time. Runs on cleanline unchanged:
  `film.html` loads the engine, `js/paperstage.js` (a look with no line and no grain), the plates and the film, and
  `js/ready.js` holds renders until every plate has decoded.
- **Timing:** `clock.js` pins the song by SHA-256; word times from faster-whisper small on the 40-65 s slice (the first
  half of the chorus read as music, so its hits are draft 1's pulses).

## Run it

```bash
cp ../bobwiseman-10000-miles/source/10000-miles.mp3 source/      # the song is gitignored; the clock checks its hash
./paint.sh rocket                                                 # repaint one layer (needs the style ref in work/)
python3 build_plates.py                                           # needs Pillow
node ../cleanline/bin/check.mjs out/sheet.jpg 44 49.6 54.3 59
nice -n 15 node ../cleanline/bin/render.mjs 43.375 62.833 out/10000-miles_paper-test01_f01041-f01508_24fps_draft.mp4 --scale 0.6667
```

The render took 45 s on the Intel Mac (467 frames, about 100 ms a frame).

## Known limits of test 01

- The world plate is drawn up to 2300 px from a 992 px painting, so its first second after the tear is soft at 1080p.
- The laundry is part of the roof plate and doesn't move. A cloth on its own sheet would flutter.
- The rocket points nose-down while it swoops toward the orbit, which can read as falling for a moment.
- No sound design; the song is the only audio.

Robin's verdict: not yet.
