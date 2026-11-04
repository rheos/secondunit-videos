# Rube Goldberg lyric machine (look test)

A marble runs one long machine; each sung line is hand-lettered beside the part of the machine it describes, on
its word times. After Kevin Ngo's day machine (references/kevin-ngo K30). Test 01 is Bob Wiseman's "No One's
Coming to the Rescue", the 911 verse sung twice (song 2:09.4-2:44.4), 35 s at 1280x720 with the song.

**Test 02 (current, `js/ring.js`)** replaces test 01 (`git log`), which Robin called lame next to Kevin's: it was guessed from 12 frames. Test 02 takes Stephen Wu's contraptions method (one ball on one continuous path, real speeds reported per leg, the camera following it, smoothed over the ball's own path) and Kevin's idea of each part being a joke about its line. Not contraptions' code or pieces: they are clean geometric diagrams. The parts: a phone the ball bounces on, a coiled cord it rides, a carnival high-striker asking HOW URGENT? (A BIT on pass 1; it rings the bell on pass 2 and nothing changes), a dog, a shelf of plague jars, a fire truck and ambulance it rides, a pneumatic tube back to the phone. On the last word the camera pulls back: the machine is a ring around one lit window.

`LEGS=1 node render.mjs x --stills 1` prints each leg's speed.

Test 01's idea, kept: the call is made, sorted and answered with a fire truck and an ambulance, which loop
back under the table and set the machine off again; on the second pass the lines are lettered again in red
under the first, and the vehicles drive straight past the one lit window. Objects only, no figures (the song's
rules: no violence, no faces, no little Bob); emergency red is the only loud colour.

## Files

- `tools/align.py`: forced alignment of the lyric lines to the Demucs vocal stem (copy of In Her Dream's).
- `tools/cues.py`: snaps each word to its vocal onset, finds backing-track hits, writes `work/cues.js`.
- `machine.html`, `js/ring.js`: the machine, `drawFrame(t)` pure; Looseleaf pen (`../tools/looseleaf-pen`),
  Kevin Sans (`fonts/`, MIT) for the lettering.
- `render.mjs`: frames on the 24 fps grid, muxed with `work/section.wav`; `--stills t,...` for checks.

`work/` holds the section audio, stems, alignment and cues; it is gitignored because they quote the lyrics.

```bash
# from the song's source m4a: cut 126-170 s to work/sec_126-170.wav, then
uv run --python 3.11 --with torch==2.2.2 --with torchaudio==2.2.2 --with demucs==4.0.1 --with 'numpy<2' --with soundfile python -m demucs --two-stems vocals -o work/stems work/sec_126-170.wav
uv run --python 3.11 --with torch==2.2.2 --with torchaudio==2.2.2 --with 'numpy<2' --with soundfile python tools/align.py work/stems/htdemucs/sec_126-170/vocals.wav work/align-lines.txt work/align.json
uv run --no-project --with numpy --with soundfile python tools/cues.py work/align.json work/stems/htdemucs/sec_126-170 126 129.4 164.4 1 "<spelled line>=<line as written>"
PW_FROM=../bobwiseman-travel-agent/package.json node render.mjs out/rescue-machine.mp4
```

## Notes

- Words on screen come from Bob's typed sheet. On the recording he sings "your" where the sheet has "the" in the
  urgency line (Whisper hears "your"; the alignment scores that word low). Ask Bob before any of this goes to him.
- Every line is written where the camera already is; a line written off-frame is a defect.
- Not done yet: sound effects on the machine's events, and more props per part (Kevin's film is still denser).
