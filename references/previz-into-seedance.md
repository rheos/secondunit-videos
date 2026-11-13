# Previz into Seedance: what we learned

A shot drawn in our own code (the previz) steers Seedance 2.5, which renders the final picture. We tested it once,
on Nov 9, 2026: the opening 5 s of the Libelous toon-cards take. Start here before trying it on another project.
The test itself is `indieagent-previz-seedance/` (README, jobs, prompts); the look it ran on is `looks/toon-cards.yaml`.

The reverse direction, where Seedance supplies the motion and our rig traces it so the picture stays code-drawn, is
"generate-then-trace" in the video-production skill (`references/motion-lab.md`).

## The verdict

Robin, 2026-11-09: the Seedance shot is better, but "I would have to really believe in the video to spend that
much with so little difference." Seedance kept our toon-cards look almost exactly, with softer light. It polished
the shot; it did not repaint it.

So it pays only where it adds something our code can't draw: real physical acting, a weighted hero move, a look we
can't render. A polish pass over a look we already draw for free isn't worth it. Robin's two cases where it would be
(same day): a video idea he really believes in, or the devweb shorts once they're good enough to earn money, with
the crew's gray-box animatic as the previz.

## How the test ran

- **Previz:** the shot rendered by the look's own code (here, toon-cards test 02, song frames f1488-f1608, 120 frames
  at 24 fps, 720x1280).
- **Character sheet:** one painted sheet of the lead (GPT Image through Codex, from a previz close-up). It goes in
  both variants as `@Image1`, so the face holds.
- **Model:** Fal `bytedance/seedance-2.5/us/reference-to-video`, task reference, 720p, 9:16, duration "5",
  `generate_audio: false` (the artist's master stays the sound).
- **Two ways to hand over the previz:**
  - **A, keyframes:** three stills from the previz (0, 2.5 and 5 s) as `@Image2-4`, "match their staging, set,
    cast and camera". About $2.31 for 5 s.
  - **B, the clip:** the previz itself as `@Video1`, "copy its camera move, framing, timing, cast and every
    character's position and action exactly, but render it in the painted style of @Image1". About $2.79.
- **Prompt shape** (both): "One continuous 5 second shot, no cuts", what each reference is for, the set in one
  sentence, then the action in timed beats (0-1.5 s, 1.5-3 s, 3-5 s), then the look in one sentence, then
  "No text, no speech, no music." Full prompts: `indieagent-previz-seedance/jobs/lib_A.json` and `lib_B.json`.
- **Judging:** a 3-up of previz, A and B (`out/lib_seed-compare_...`), then each spliced back into the full take
  (`out/lib_toon-test03{A,B}_...`) to check the cut back into our own render.

## What happened

- **A (keyframes) was the usable one.** It opened closer on the king than the previz but cut back into test 02
  cleanly.
- **B (clip) copied the camera best in the middle**, but opened on an extreme close-up and ended with the wrong
  character beside the prince, so its cut back into our render swapped a character. A video reference steers
  motion, not who stands where at the last frame.
- **The look survived.** Seedance treated our render as the style and didn't drift toward its own.

## Before the next project

- Pick shots where Seedance adds something code can't (acting, weight, physics). If the previz already looks
  finished, expect a small gain for real money.
- Start with A (keyframes). If the shot has to cut back into our render, put the exact last frame in as a keyframe
  and name who stands where in the last beat.
- Price it first: about $0.46 a second at 720p 9:16 with image refs, $0.55 with a same-length video ref (Fal, Nov
  2026; check live rates). A voice line is its own ElevenLabs line, not Seedance's native audio.
- Moving characters still need the character sheet in every call (the sheet-bound rule).
- Log every job id in the project's spend notes and `secondunit/CREDITS.md`.
- Through ElevenLabs instead of Fal: its Seedance needs a Pro plan plus ByteDance access approved by their support
  (403 `model_access_denied` until then), and it costs far more credits than Fal's price. Use Fal.
