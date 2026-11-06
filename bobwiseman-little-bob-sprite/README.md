# Little Bob sprite test 01

Tries Agent Sprite Forge (github.com/0x0funky/agent-sprite-forge, MIT, v0.4) on one walk: can a generated
clip become a clean pixel sprite for a film in our 16bit look? Internal test, not for Bob's page.

## How it was made

1. Master still: `bin/gptimg` (Codex GPT Image) from a crop of the approved Little Bob, side view on magenta.
2. `sprite_set.py plan --actions walk --finish pixel --target-height 56 --palette <16bit PALDEF>`.
3. Clip: Higgsfield `kling3_0_turbo`, 6 s, 1:1, 720p, 9 credits, job e2cce534-9876-4306-a41a-62ab27c6050e.
   Fal's balance was empty (`403 User is locked`), so the clip went in as a supplied take.
4. Pipeline: keying, registration and gates all passed. Its loop finder rejected the take: the stride is
   1.67 s and its walk window stops at 1.6 s.
5. Loop chosen by our own frame comparison: frames 66-105 of the registered set (40 frames).
6. `finish_frames.py pixel` with the palette and colour lock, sampled to 12 frames, one stride a second.
7. `scene.py`: walk across a side-on road drawn to the 16bit rules, 320x180 at x4 nearest.

## Measured

- Off-palette pixels: 0 of 26,975 across 40 frames. Colours per frame: 10-15 of the 46. Alpha: binary.
- Planted foot travels about 28 px/s against a walk speed of 30 px/s, so no visible slide.
- Background: the model drifted from pure magenta to a duller purple within the first second
  (key drift 88). The soft matte kept it clean anyway.

## Limits

- One clip, so the numbers cover one walk only.
- Plain image-to-video sees one still, which breaks the character-sheet rule for a character shot that
  needs a real turn or acting. It held here because he stays in profile for one action.
- Files in `out/` and `_in/` are gitignored; rebuild needs the Forge clone and the steps above.
