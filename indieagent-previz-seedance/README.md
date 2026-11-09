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
