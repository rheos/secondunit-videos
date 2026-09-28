# Wave 1 review: LS1 (method 1) vs LS2 (method 2)

Reviewed 2026-09-28. Both takes are 768x1344, 24 fps, 158 frames (6.59 s). Each take's returned
audio lines up with the stem slice at 0 ms offset (LS1 onset-envelope correlation 0.98).

Files (local, gitignored): `output/review/dream-of-fire_LS1_f1561-f1705_24fps_lipsync.mp4`,
`output/review/dream-of-fire_LS2_f1899-f2043_24fps_lipsync.mp4` (each muxed with the song slice),
`output/review/dream-of-fire_wave1_LS1-vs-LS2_sidebyside.mp4` (LS1 | LS2 | real #23; the first
6 s play LS1's song audio, the next 6 s LS2's), and `output/review/*_mouth_onsets.jpg` (the mouth
region 2 frames after each vocal-stem onset), plus the frame strips.

The automatic mouth check (dark mouth pixels vs vocal RMS) proves nothing here: 0.19 for LS1 and
0.0 for LS2. The dark silhouette defeats it, as expected, so the verdicts below come from the
onset crops and from watching the takes.

## LS1, method 1 (image of real #22 frame 100), hook

- **Sync:** good. The jaw and lips show in profile against the sky and open on the onsets
  (65.39, 65.69, 66.97, 68.17, 69.19 s); the mouth narrows around the pauses. Watch at normal speed
  before calling it word-accurate.
- **Face in shadow:** mostly. The profile, beard and a hint of the nose catch the sky light, so it
  reads as a real backlit silhouette, not a painted void. No front-lit face and no invented features.
- **Look:** it holds his neon (pink sky, purple-black figure, grain), but the flame overlay is
  thinner than in #22. His flame motion can be screened back on locally, as the board planned.
- **Defects:** the first 2 to 3 frames still carry the source frame's wider hat angle before it
  settles. Around frame 150 (after 71.0 s, past the used span) the beard and hair change shape. Both
  sit outside the planned 31/33 spans.
- **My verdict was accept. Robin REJECTED it (2026-09-28):** H3 invented a thick beard in profile, "too clearly not him". No real frame of his face exists, so the singing moves to a veiled still of the character sheet (see the storyboard).

## LS2, method 2 (video reference, the whole real #23 clip), first wake-up line

- **Real motion kept:** yes. The first 2 s track #23 closely (the frame difference grows from 11 to
  about 50 over the clip), with his guitar, hat and medallion moving as in his footage, and the flame
  overlay survives almost as in the original.
- **Sync:** not readable. The head is turned further from camera than in LS1 and the flames cross
  the jaw for most of the clip. In the crops the mouth shows only at 79.4-80.4 s, and after 80.8 s
  the flames cover it. It looks like his footage with a slight head move, not like singing.
- **Face in shadow:** yes, fully.
- **Verdict: reject as a singing shot.** It works as a lightly animated take of #23, but that adds
  nothing to the real clip.

## Outcome

Both takes are rejected. Superseded by the veiled-character plan in STORYBOARD.public.md
(V1/V2 stills from the Wyrd One character sheet, H3 method 1, no profile). The notes below were written
before Robin's review and are superseded.

## Decisions for the next waves (superseded)

- LS3 uses **method 1** (a frame, not the clip), from a real frame where the profile is clear of flames.
- Shots 38/40 (L20-L21) need a lipsync. Option: a method-1 retake from a clear-profile #23 frame
  (early in the clip, e.g. frame 10) for 15 credits, inside the 40-credit retry allowance.
- Spent 30 of the 150 cap.
