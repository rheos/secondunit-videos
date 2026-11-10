# papersilhouette: notes

## BANNED (reached for in the first pass and taken out, plus the brief's list)

- 3D lighting, gradients as light. The only gradient is the kit's faint paper vignette in the finish.
- Faces. One closed-eye crescent on the big head, nothing on the small figures.
- A stiff figure rocking as one piece. Figures walk on jointed legs with the phase tied to distance; the "guards" turn is a two-drawing paper flip, not a rotation.
- Cute proportions. Figures 200 px with calves, boots, shoulders and a waist (line-up at `out/papersilhouette/lineup/f0.jpg`); the kit's child head is gone.
- More than four colours a frame besides the ground. Six papers in all (cream ground, navy, oxblood, slate, gold, pine green); no frame has more than four besides the ground (shots 1-2: slate, oxblood, navy; shots 3-4: navy, oxblood, gold, green).
- Any In Her Dream motif: no family, laugh rings, sun halo, birds, flowers, orange, bun-haired head, lace. The kit's bird/flower/orange/house/lamp helpers were not copied.
- Text. None.
- First-pass defaults removed: the carried brick stack drawn in the forearm's frame (it tilted with the arm; now upright at the hands); figures at 150 px (the cap pop was unreadable; now 200 px); a lid clip that restored itself (both head layers drew whole, no lobotomy, no eye); brick fall-away over 0.75 s at 2.4x scale (a one-second oxblood blizzard; now 0.6 s, 1.6x, slit row first).
- Fades. The only transition is the rise (a sheet slid up) at f2830; the section starts and ends on a finished picture.

## Known defects (frame numbers)

- f2548: the first frame is cream with one tower starting to rise; the skyline is up by f2601 ("model"). Prints fine as a still but the first half second is nearly empty.
- f2636 to f2684: each figure carries two bricks and drops them as a stack (0.12 s apart), so "brick by brick" is really stack by stack, twelve bricks in six drops. One brick per figure would need twelve walkers crossing each other.
- f2696 to f2736: the figures stand behind the wall with legs hidden; their faces are 30 px, so the cap pop at f2737 reads mainly as the silhouette's top changing. Readable at 720 wide, marginal on a phone at arm's length.
- f3121 to f3131: as the slit row slides in with overshoot, a sliver of cream shows at the left frame edge for about five frames.
- f3331 to f3355: during the brick fall the falling bricks (drawn in front) cover the pine for a few frames each; the pine is fully clear by f3352.
- The oxblood head layer also shows the eye crescent when apart (f2897 to f2963); the brief did not say whether the bare layer has an eye.
- The slit shows a cream wedge to the right of the eye (the ground beyond the brow line). Deliberate, but it reads as a second light source if you look for one.

## For the full film

- A real crew: more figures, one brick each, two lanes (in front of and behind the wall) so the crossing reads as traffic.
- A night version (ground #1d2852) for the lobotomy and prison beats, cream only for the seed, so the light arc in LOOKS.md has a dark step here.
- Give the hand a wrist cuff (the sleeve line) so it reads as a man's hand before the seed lands.
- The push-in on the guards should carry straight into the big head (a match on the middle guard's head) instead of the rise.
- Onsets: "escape" is a weak whisper cue (zero length); the hit is on the stressed syllable at 138.785 s. Confirm by ear before the full build.

## Scans and sync (2026-11-10, review file as delivered)

- ffprobe: 836 frames, 34.833 s video and audio, 720x1280, 24 fps (expected 836/24 = 34.833 s).
- badframes.py: 0/836 bad. flashcheck.py: PASS, worst 1.5 flashes in one second at 11.96 s (the guards' hop).
- Sync: onsets in the muxed audio sit at the master's times minus 106.1667 s within 5 ms ("seed" 27.675 s in the file vs 133.845 s in the master; "tree" 28.070 vs 134.235). Frame 664 of the file (f3212, "seed") shows the seed on the palm with the second hand above it; frame 783 (f3331, "escape") shows the tiny pine and the slit, the shoot starting the next frame.
