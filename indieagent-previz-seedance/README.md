# Previz into Seedance (test)

Issue #458. Can a shot built in our three.js world steer a painted, generated shot? One 5 s 9:16 shot: our invented
king on the toon-cards terrace, the camera pushing in from behind the gold rail, saying one invented line.

The world and card code are copied from `bobwiseman-toon-cards/` on branch look/toon-cards (PR #425), at its test 02
commit. `js/shot.js` replaces only the camera, cast and timing; `toon.html?shot=king` loads it.

## Pieces

- `out/previz_king_5s.mp4`: the previz, 120 frames at 24 fps, with the line on it. `SHOT=king FRAMES=0-119 OUT=out/previz node render.mjs`.
- `work/line_5s.wav`: the line, read by ElevenLabs (Callum, eleven_multilingual_v2), 2.04 s, starting at 0.7 s.
  The king's mouth in the previz moves from 0.7 to 2.74 s to match.
- `work/sheet/king_sheet.png`: the painted character sheet, GPT Image through Codex, from the previz close-up.
- `work/refs/`: what goes to Seedance: the sheet, three keyframes (frames 0, 60, 119), the previz clip and the line.

## The two runs (not run yet)

Runner: `tools/el-video/el_video.py` (ElevenLabs Python SDK, key from the umbrella's `.env.local`). Jobs:
`jobs/seedance_A.json` and `jobs/seedance_B.json`.

    uv run tools/el-video/el_video.py submit indieagent-previz-seedance/jobs/seedance_A.json
    uv run tools/el-video/el_video.py wait   indieagent-previz-seedance/jobs/seedance_A.json

Blocked 2026-11-08: Robin's ElevenLabs is on Pro and the video API answers, but Seedance returns 403
`model_access_denied` until ElevenLabs support approves ByteDance models. Nothing was charged.

Seedance 2.5 US reference-to-video, 5 s, 720p, 9:16, task reference, with the sheet and the line in both.

- A: the three keyframes as images, as in Danioros's post. About $2.31.
- B: the previz clip as a video reference. About $2.79.

Cap $11 with one retake each (Robin, 2026-11-08). Judge each beside the previz on camera, character, lips and look.

## Run on Fal instead: a Libelous take (2026-11-09)

Robin wanted the money to buy something usable, so the king shot became a real take of Libelous: the opening
5 s of the toon-cards take (song frames f1488-f1608, the king on the terrace, then the royal family and the prince
at his telescope), previzzed by test 02 itself. Fal `bytedance/seedance-2.5/us/reference-to-video`, 720p 9:16,
5 s, no audio (Bob's master stays the sound). Jobs `jobs/lib_A.json` (king sheet + three keyframes) and
`jobs/lib_B.json` (king sheet + the previz clip). About $5.10 together, logged in secondunit/CREDITS.md.

- `out/lib_seed-compare_f01488-f01608_24fps_draft.mp4`: previz, A and B side by side.
- `out/lib_toon-test03{A,B}_f01488-f02324_24fps_draft.mp4`: test 02 with the first 120 frames replaced.

First read: Seedance kept our toon-cards look almost exactly, with softer light; it did not repaint it. A opens
much closer on the king than the previz and cuts back into test 02 cleanly. B copies the middle of the previz
camera most closely but opens on an extreme close-up and ends with the king, not the princess, beside the prince,
so its cut back into test 02 swaps a character.

**Robin's verdict (2026-11-09):** the Seedance shot is better, but too close to our free render to justify the
spend: he'd have to really believe in a video to pay that for so little difference. Paid generation earns its
cost only where it adds what our code can't draw, not as a polish pass on a look we already render.
