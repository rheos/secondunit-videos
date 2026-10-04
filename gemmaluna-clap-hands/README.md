# Clap Hands (Gemma Luna), drawn in code

Gemma Luna's live cover of Tom Waits' "Clap Hands", recorded at Radio Free Winlove on 2021-06-20
(6:51 to 9:57 of their YouTube upload). A Second Unit video with no character in frame: scenes only.

**Stage: look exploration.** Two probes of the same stretch (37.7 to 56.0 s: "bottle full of rain"
into the first four "clap hands"), to pick a direction before anything is storyboarded:

- `water.html` / `js/looks/water.js`: watercolour bleed. Washes multiply onto paper like glazes, a
  shader bleeds them wet-into-wet, pools the drying edges and granulates the darks.
- `collage.html` / `js/looks/collage.js`: junkyard collage. Torn found paper and tin, stop motion on
  twos, the junk playing the beat.

This project shares no code or look with the earlier painted videos on purpose; `js/core.js` and
`js/gl.js` are written fresh and hold only the plumbing (song clock, shot registry, WebGL finish).

## Run it

Needs Node, Google Chrome and ffmpeg. Nothing of the performance is committed: `_in/` holds the master
(`gemmaluna-tomwaits_master.wav`, sha256 in `.sha256`), Demucs stems and `words.json`; `assets/song.wav`
links to the master; `js/data.js` is built locally.

```bash
npm install
../../../viralvision/viralvision-worker/.venv/bin/python tools/words.py      # _in/words.json (timing only)
uv run --python 3.11 --with 'librosa==0.10.2.post1' --with 'numba==0.60.0' --with 'llvmlite==0.43.0' --with 'numpy<2' python tools/build_data.py
open water.html                                    # loops the probe span (space, left arrow)
node check.mjs water out/check/w.jpg 39.5 41.6 46   # contact sheet
node render.mjs water 37.708333 56 out/gmc_water-probe_f00905-f01344_24fps_composite.mp4 4 24
node render.mjs index 11 197 out/gmc-v2_<take>_f00264-f04728_24fps_review-720p.mp4 4 24 1.5 0.6667   # draft: 720p, fade-in, review encode in one go
node render.mjs index 11 197 out/gmc-v2_<take>_f00264-f04728_24fps_composite.mp4 4 24 1.5           # final: 1080p master (crf 17)
```

Drafts render at 720p (`scale` 0.6667): world coordinates stay 1080x1920 and the brushstroke sizes scale
with the output, so a draft is the same painting with fewer pixels. `SCALE=0.6667 node check.mjs ...` checks at that size.

Whisper mishears this take, so word times are cue handles only. The sung "clap" of each "clap hands"
is timed from the vocal stem's onsets (`CLAPS` in `js/core.js`).
