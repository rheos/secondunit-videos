# devweb look bible

Measured 2026-11-02 by the bureau's `look-bible` workflow (run `20261102-devweb-look-bible`). The
topic files in `look/` hold the method, the tables and the recipes; this page holds the targets.

**The mix (Robin):** cinetic's four example films are the quality bar for motion, grade and depth;
episode 1 (draft 6, approved) anchors our look and Blink; corespear's 12 shorts and two Jam With AI
shorts Robin picked are the bar for narration pacing. Our palette, Blink and one world with one
camera stay ours. "Ours now" is episode 5, finish d2. All references are private study material:
never shown, credited or echoed.

The DP, the animators, the editor and the writers' room build to these numbers. `make-short`'s
second finish check (the look gap) scores a finish against them.

## Targets

| Topic | Target | Ep 5 now | Bar |
|---|---|---|---|
| motion: camera move size | 150-350 px and under ~25 % zoom per move, 40-80 f | 1175 px, 61 %, 144 f | cinetic 156 px, 24 %, 68 f |
| motion: who moves | elements move in 35-45 % of frames, camera in ~30 % | elements 21 %, camera 48 % | cinetic 37-43 % / 18-31 % |
| motion: scene changes | every station change follows a named element | 3 of 5 checked | cinetic 11 of 11 |
| motion: easing | smootherstep by default, shapes mixed per move | 23 of 26 moves the same cubic | cinetic mixes 4 shapes |
| motion: blur | one smear, no double copies | 2-sample blend prints two copies (36 % of frames 2 px+ apart) | cinetic one smear at 100 px/f |
| grade: colour | under 2 % of the frame saturated (chroma 60+) outside the one colour beat | 7.1 % all film | cinetic 0.0-0.5 % |
| grade: white top | subject p99 at 235 or more, text 12:1 on its fill | p99 191, 8.3:1 | kiln p99 241, 14.4:1 |
| grade: light across the story | one peak at ~2.5x base on the failure beat, back to base for the answer | 1.7x, p95 change 9.8 Y'/s | kiln 2.7x, 36.6 Y'/s |
| grade: glow | rest glow opacity 0.03 or less; bloom only as a ~0.5 s event | halo 0.073-0.095 | kiln 0.000 |
| grade: dark field | 55 % or more of the frame below Y' 20 | 14.4 % | kiln 71.1 % |
| depth: attention | 80 % of edge energy in about 0.2 of the frame | 0.31 | cinetic 0.16 |
| depth: empty field | about 0.6-0.7 of tiles flat colour; idle stations dimmed to a quarter of the subject's lift | 0.50, idle cards at full colour | cinetic 0.70, inactive +0.09 vs active +0.36 |
| depth: recession | fog keyed to the focus distance (near 1.1 d, far 2.6 d); back layers 0.5 d or more behind the subject | fog on subject 0.00-0.13 | ep 1's mass moment 0.50-1.00 |
| character: presence | Blink in shot 0.75 of the film or more, no absence over 6 s | 0.27, longest gap 39.5 s | ep 1 0.93, 0.38 s |
| character: size | 384 px or more when acting, ~600 px on hero beats | median 256 px | ep 1 617 px |
| character: settle | one rebound at most, done in ~25 f; anticipation 10-15 % on hero moves only | 5 crossings over 65 f, 60 % dip on every pop | cinetic 0 crossings, 6-35 f |
| character: blink | ~12 f eased (close 4, shut 2, open 6), tied to gaze shifts | 7-8 f linear flick | halden's cursor 17 f eased |
| pacing: pauses | about 3 s of gaps over 0.25 s per minute of speech; 0.22 s after a full stop | 13.5-16.5 s/min, 0.52 s | corespear 2.9 s/min, 0.20 s |
| pacing: sentences | median 10-13 words, fragments under 10 %, 14-17 full stops a minute | 5-6 words, 34-47 %, 22.6-28.1 | corespear 11.25 words, 5 %, 15.3 |
| pacing: ends | voice in by 0.12 s; film ends at most 1.5 s after the last word | 0.66 s in, 4.7 s tail | corespear 0.10 s, 0.43 s |
| pacing: picture | keep 1.0-1.3 events a second and no still over 2 s (already at the bar) | 1.14-1.26/s | corespear 0.8-0.95/s |

Unmeasured, written as such in the topic files: lens-blur radius by shot size (no reference holds a
static blur; the 20-shorts study kept no numbers), cinetic's blur sample count, camera-to-word
timing in the references, the presenter's blink rate.

## The ten biggest gaps

1. **Blink is missing.** In shot 0.27 of ep 5 (ep 1 0.93), absent for 39.5 s at a stretch. (character)
2. **Camera moves are 7.5 times too big.** 1175 px a move against 156 px. (motion)
3. **Pauses eat a quarter of the speech.** 13.5-16.5 s a minute against 2.9. (pacing)
4. **Colour is always on.** 7.1 % of the frame saturated all film against 0.0-0.5 %, with one colour beat in cinetic. (grade)
5. **Too many sentences.** Median 5-6 words, a third of them fragments. (pacing)
6. **Every plane equally sharp and lit.** Attention area 0.31 against 0.16; idle cards at full colour. (depth, grade)
7. **Blink too small to act.** 256 px against 617 in ep 1. (character)
8. **Motion blur prints double.** The 2-sample blend at 120 fps. (motion)
9. **The light never moves.** p95 change 9.8 Y'/s against 36.6; no peak on the failure. (grade)
10. **Springs wobble and the tail drags.** 65-frame settles; 4.7 s after the last word. (character, pacing)

## Where each recipe lands

- Crew mode files (bureau `agents/modes/`): `crew-storyboard.md` and `crew-dp.md` (presence, size,
  move size, element-led changes), `crew-animator.md` (settle, blinks, elements carry the holds),
  `crew-editor.md` (onset, tail), writers' room (`write-short-script.md`: sentence length).
- Kit code (this folder), each a proposal in its topic file until built and checked: `world.js`
  (per-key glide and ease, smootherstep default, drift replaced by creep, `focusFog`, `dim()`),
  a new `dof.js`, `blink3d.js` (mouth crossfade, `blinkAt`, eye travel), `vo/tighten.py` and
  `vo/align.py` (LEAD 0.12, TAIL 1.2), `finish.sh` (240 fps, 4-sample blend: about doubles the render).
