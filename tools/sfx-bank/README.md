# sfx-bank: earshot's sound bank on our cues

Puts sound on a code-drawn film's animation events using the 252 effects in
[earshot](https://github.com/Leonxlnx/earshot)'s bank (MIT, Leon Lin; notice in `LICENSE-earshot.md`).
It is a drop-in for the synthesised hits in a film's `sfx.py`: same `cues.json`, same rules.
Study and verdict: `references/leon-lin/STUDY-earshot.md`.

## The contract (kept from the Achbar reel)

- The page reports events (`cue()` in `js/type.js`), `cues.mjs` writes `assets/cues.json`:
  a list of `{"k": kind, "t": seconds, "size": px}`.
- Every sound lands one frame after its event. Here that means the take's **measured onset**
  (earshot prints `onset_s`) lands on cue time + 1/fps, not its first sample.
- Cues are thinned to one per frame per kind, as `sfx.py` does.

## Build the image once

earshot needs PyTorch 2.6+, which has no Intel-Mac wheels, so it runs in Docker.

```sh
git clone https://github.com/Leonxlnx/earshot ~/src/earshot
docker build -f tools/sfx-bank/Dockerfile -t earshot:0.4.0 ~/src/earshot
docker run --rm earshot:0.4.0 sfx list          # 252 ids with kinds and knobs
```

The image is 3.1 GB on disk (723 MB content), about 12 min to build on home internet. The bank needs
**no models**: skip `doctor --fetch` (that 1.1 GB download is only for `timeline`, `find`, `critique`).

## Run

```sh
<viralvision venv python> -I tools/sfx-bank/bank.py <film>/assets/cues.json tools/sfx-bank/maps/<film>.json \
    --film <film>/renders/<draft>.mp4 -o <film>/assets/sfx_bank.wav
```

- One take per (kind, knobs, seed), rendered by `earshot sfx render` at most 3 at a time. Each Docker
  call costs about 5 s alone, about 15 s with three running.
- Takes are cached in `~/.cache/sfx-bank` (`--cache`), keyed by id + knobs + seed + image tag. A cached
  take is never rendered again, so a re-run after a timing change takes about 2 s.
- The output is the film's length (ffprobe of `--film`, or `--end`), 48 kHz stereo 24-bit, peak held
  under -0.2 dBFS. It is a stem: mix it under the score as the film's own `sfx.py` does.
- `--log placed.json` lists every placed sound with its cue time and onset time, for checking sync.
- No audio goes in git. The pre-commit hook refuses wav files anyway.

## The mapping file

`maps/achbar-atom-reel.json` is the worked example. Per cue kind: a bank `id` and knobs (`peak` in dBFS,
`pitch` as a note or Hz, `dur`, `apex`, `weight`), an optional `pan` spread, optional `seeds` (several
takes, dealt so one take never plays twice running), and optional `bands` that switch knobs by the cue's
`size` (first band whose `size_max` covers it). Kinds with no entry are skipped and counted.

earshot refuses knobs outside a recipe's range (for example `knock/desk` will not go below B3) and says
so; the run stops with its message.
