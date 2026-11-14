# Lobbyists at Parliament, the pay-for-a-hit machine (look test)

The rescue-machine look (`looks/rescue-machine.yaml`, built in `bobwiseman-rescue-machine/`) on Bob Wiseman's
"Lobbyists at Parliament", song 0:20.0 to 0:53.5 (film frames f480-f1284, 33.5 s, 1280x720 with the song).
Robin's idea, 2026-11-09: the song is a pay-for-a-hit machine. Issue #476.

**Why this stretch:** it is the hook, the publicist's whole shopping list, and the hook again. So the hook can be the
machine ticking over at both ends, with one full run of the list in between, and four of Robin's named parts
(the cellist, the orchestra, the zoo photo, the eyeglass frames) each get their own line. The opening verse
(0:03 to 0:33) has the publicist and the media list but cuts off halfway into the list.

## The machine (one gold coin, one path)

1. Hook: a money bag feeds a coin into a HITS 25¢ cabinet on every beat; the hit meter kicks and falls back to 0.
   On the last word the hero coin drops in and rides a coil of red tape out.
2. The Publicist catches it on her clipboard, held out like a tray, and talks; on her last words she tips it and
   her list unrolls down to the cellist. The list has four boxes; each gets a red tick when its part fires.
3. The coin lands on a yo-yo hanging from the Cellist's bow; it drops and climbs on the two syllables of the
   name, and the bow stroke flings the coin over his head.
4. It rolls down a xylophone while a cardboard orchestra (FOR RENT) flips up, one player per word.
5. A funnel, the camera's bulb hose, and the bulb squeezed on the last word of the zoo line: one flash, the
   Rocker gives the thumbs up between two deadpan kids and a giraffe leaning in. A print slides out.
6. A loop-the-loop through a giant pair of eyeglasses (1.5 turns per lens), out into a bucket on a rope:
   the bucket drops and hoists the frames onto the Rocker's face. He stops squinting.
7. Hook again: a chute to THE CHARTS ladder; the coin climbs one rung per beat from #50 to #1, each rung
   lettered with the hook in red, and on the last word it hops back into the slot. Pull back: the whole machine
   stands inside a jukebox, SELECT YOUR HIT.

The cast (Robin approved the line-up 2026-11-09, `lineup.html`, `out/cast-lineup-*.png`) is invented: no likeness
of anyone the song names, and no politicians.

## Files

- `js/pen.js`: the rescue machine's pen, wax and shape helpers, shared. `js/cast.js`: the cast, one outer outline
  per figure (`drawFig`). `js/machine.js`: the coin's legs, camera, parts and lettering; `drawFrame(t)` is pure.
- `tools/align.py`, `tools/cues.py`: forced alignment and onset snapping (copies of the rescue machine's).
  `tools/lobby_cues.py`: writes `work/cues.js` with the settled word times and the two hook beat grids.
- `render.mjs`: frames on the 24 fps grid muxed with `work/section.wav`; `--stills t,...` for checks;
  `LEGS=1` prints each leg's speed. `lineup.mjs` renders the cast plates. `audit.spec.mjs`: the coin's landings.

`work/` (gitignored) holds the audio, the vocal stem, the alignment and `cues.js`, which quote the lyrics.

```bash
# inputs: copy from ../bobwiseman-test-songs/_in (never symlink), then
uv run --python 3.11 --with torch==2.2.2 --with torchaudio==2.2.2 --with 'numpy<2' --with soundfile python tools/align.py work/lobbyists-at-parliament.vocals.wav work/align-lines.txt work/align.json 19.5 53.5
python3 tools/lobby_cues.py
ffmpeg -ss 20 -t 33.5 -i work/lobbyists-at-parliament.mp3 -ar 48000 work/section.wav
export PW_FROM=<a project with playwright>/package.json
node render.mjs out/lobbyists_machine-test01_f480-f1284_24fps_draft.mp4
node ../tools/motion-lab/audit.mjs machine.html 0 33.5 --spec audit.spec.mjs --width 1280 --height 720
```

## Open

- The hook counts are beat grids: 8 ticks in the first hook, 10 in the second. Whisper and the aligner disagree
  on the second hook's count, so it needs Robin's ear.
- No sound effects on the machine's events yet.
