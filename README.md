# Mind The Sheep, painted

A Second Unit spike: the hook of Pnubb's "Mind The Sheep" (15.0 to 29.4 s) as a painted music
video, drawn entirely in code. No generated video, no real person's likeness.

**Concept: counting sheep.** Someone can't sleep, so they count sheep. "It's all fine here." Then
the sheep won't stop. The sheep is an original character: a round cloud of wool, a black face and
heavy, unimpressed lids.

The other take on the same hook, generated with Higgsfield, lives in `../pnubb-mind-the-sheep-hook/`.

## How it's made

- **Renderer:** [functional-emotions-video](https://github.com/ledbetterljoshua/functional-emotions-video)
  (MIT, see `LICENSE-functional-emotions`). `js/paint.js`, `js/lib.js`, `js/main.js`, `render.mjs` and
  `check.mjs` are theirs, lightly adapted. Every frame is a pure function of song time, and the GPU
  repaints a flat underpainting with thousands of brushstrokes.
- **This video:** `js/cast.js` (the sheep, the sleeper, the bedroom) and `js/ch/hook.js` (the shots).
- **Timing:** lyric lines come from ViralVision's aligned transcript (Paul's own lyric sheet, timed by
  Whisper). Each sung "SHEEP" is timed from the Demucs vocal stem instead, because Whisper runs about
  0.4 s early in this hook and Paul sings ten sheeps to the sheet's six.

## Run it

Needs Node, Google Chrome and ffmpeg. The song is never committed: `assets/song.mp3` is a symlink to
`viralvision/viralvision-worker/artists/pnubb/songs/Mind The Sheep.mp3`, and `js/data.js` (which holds
the lyric timing) is built locally.

```bash
npm install
../../../viralvision/viralvision-worker/.venv/bin/python tools/build_data.py   # js/data.js
open index.html                                   # plays from 0:15 (space, arrows, f)
node check.mjs out/sheet.jpg 15.5 18.6 22.78 26.4 # contact sheet of any times
node render.mjs 15 29.4 out/hook.mp4 4            # the hook, 1080p30
```

Homebrew ffmpeg has no `drawtext`, so contact sheets carry no time labels.
