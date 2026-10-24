# Animated video call: look test

A 28 s test of the format in Kevin Ngo's animation over the Dessa demo conversation (K17;
`references/kevin-ngo/STUDY-video-call.md`): a recorded conversation played over a drawn video
call. Here it is Rae, an artist, booking a Montreal date with her IndieAgent agent. Issue #306.

Everything is drawn in code (inline SVG and DOM, HyperFrames); no image or video model.

## How it is made

1. `script.json` holds the words and who says them. The audio is the clock.
2. `tools/build_audio.py` speaks each line (placeholder: macOS `say`, Samantha and Daniel), lays
   them on the clock, and writes one stem per speaker plus the mix (`assets/`, gitignored) and
   `cues.js`: every line with word start times (faster-whisper on that line's own audio; the words
   come from the script) and a per-frame loudness for each speaker.
3. `index.html` draws every frame from `t` alone (`draw(t)` on one GSAP driver), so frames render in
   any order: mouths from each speaker's own level, blinks from a seed, captions from the word times.
   The direction is the constants block: `OVERRIDE` (eyes and resting mouth), `GESTURES`, `PUSH`,
   `PUNCH`, `SPLIT`, `CARD`.

```bash
~/Code/novadiem/indieagent/viralvision/viralvision-worker/.venv/bin/python tools/build_audio.py
npx --yes hyperframes@0.8.174 check
npx --yes hyperframes@0.8.174 render . -q high -o out/call-toon_test01_720.mp4
```

## For a real recording

Give each speaker their own track if you can (a call recorder with separate tracks, or two mics);
each mouth follows only its own voice. With a single mixed track, split it by speaker first
(Demucs will not; it needs diarization) or drive both mouths from caption timing. Keep the words
from a checked transcript and the times from the audio. The voices belong to the people on the
call: consent before anything is published.

## Shot plan (test01)

| Time | Shot |
|---|---|
| 0-1.15 | Rae alone in one centred tile, eyes closed, waiting |
| 1.0-1.8 | "IndieAgent joined": her tile slides left, his arrives; she waves |
| 1.6-8.2 | Two-up |
| 8.2-12.3 | Slow push toward IndieAgent's tile while he offers the room |
| 12.3-21.25 | Two-up; his palms on "door split", hers on "Yes! Hold it." |
| 21.25-23.4 | Punch-in on Rae as she hears "It's held", hands on her head |
| 23.4-25.25 | Two-up, talk-over in stacked captions, both laugh |
| 25.25-27.9 | End card |
