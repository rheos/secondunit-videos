# dream of fire: finishing pass on cut v3 (2026-09-28)

A free test of the motion-graphics toolkit's finishing layer on The Wyrd One's "dream of fire" cut v3
(input sha256 225cbcbc..., from hjeron-dark-blues-storyboard). No generation, 0 credits.

Result: `output/dof_v3_finished_b.mp4` (local), unlisted at https://youtu.be/KfDJqdW_7iY

## What it adds
- **Lyric layer** (p5, `finish/lyrics.template.js`): text from Hjeron's lyric sheet only, word times from
  the stable-ts alignment, line starts snapped to Demucs vocal-stem onsets when the onset is strong
  (`finish/prep_lyrics.py`). Line 1 moved +2.12 s onto the real first sung word (25.84 s); the other
  24 lines moved under 0.45 s. Newsreader Italic, bone cream, sung word warms to ember. Lower third,
  clear of the veil. Generated cues and the sketch with lyrics live in gitignored `work/`.
- **VFX** (Swift Core Image, `prompts/finish-vfx/cues.yml`): short whip onto the first sung word,
  punches where the cut drops to his singing, glow after his own overexposed flash shot, a small shake
  on "burn it down" and on the lava ending, two warm light leaks. No grain, flash or dark cues: the cut
  already carries those.

## Order matters
VFX runs on the clean cut, lyrics go on top afterwards. The other way round, punches and the whip blur
the text.

## Pipeline
```
python finish/prep_lyrics.py                                      # needs numpy (viralvision venv)
bin/mv-docker --project $P 'anim:render[work/lyrics.js,work/lyrics_v3b,2342,1080,1920]'   # ~2 min
MV_PYTHON=<venv python> VFX=finish-vfx ruby mv.rb --project $P vfx:analyze && ... vfx:render   # native, brew ruby
ffmpeg overlay work/lyrics_v3b over output/dof_v3_vfx.mp4, audio copied from the untouched master
```

## Toolkit gaps found
- No overlay/composite task: the lyric burn-in is plain ffmpeg.
- `anim:render` could not render selected frames; added `FRAMES=` in `lib/toolkit/operations.rb`
  (project copy only), but `bin/mv-docker` doesn't pass it through.
- Native runs need Ruby 3.2+ (`/usr/local/opt/ruby/bin`), numpy via `MV_PYTHON`, and ImageMagick for
  `vfx:stills` contact sheets (not installed natively; stills still render).
- p5 2.x measures `" "` as ~0 width, so word gaps need a fixed size.
