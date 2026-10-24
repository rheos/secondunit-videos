# 4:5 recompose proposal

**Status (2026-10-13):** Robin chose rows 1 and 2 (kinetic type) only; both are redrawn and composed into the v5 review cut (see ASPECTS.md). Rows 3-5 stay pan and scan.

Plan v3 (`panscan-plan-v3.json`) holds 127 s of the 367 s as a true 864x1080 crop. The rest is shown as a
wider window scaled into the 4:5 frame over a blurred copy ("wide", 113 s) or as the whole 16:9 frame over blur
("fit", 127 s), because a crop would cut burned-in text or the staging. Four stretches carry most of that,
and each can be redrawn for 4:5 under the aspect schema (`js/<chapter>-4x5/` copies of the master's chapter
code, a `<look>-4x5.html` page, renders in `out/4x5/`). The master stays untouched.

| # | Stretch | Time | Now | Why a crop can't hold it | Recompose |
|---|---|---|---|---|---|
| 1 | Kinetic type, section A | 0:00-1:12 (about 60 s not cropped) | mostly fit | lyric lines and the tech-log, BIOS and checklist text run across the whole width (the opening lyric line spans 0.06-0.89 of it) | re-break every line for a 4:5 page in `sections/kinetic` / `bobwiseman-airplane-type`: two or three short lines instead of one long one, same timing, same cues. This is the opening the feed autoplays, so it matters most. |
| 2 | Kinetic type, section K | 5:41-6:07 (about 23 s) | fit / wide | same type system as A | same pass as A |
| 3 | Monologue, section J | 4:42-5:30 (about 42 s) | fit / wide | the subtitle words sit beside the anchorman or run the width (the 4:53-5:05 subtitle line spans 0.13-0.88) | keep the picture as pan and scan, re-lay only the subtitle words for 4:5 in `sections/dream-j` (stack them above or below him) |
| 4 | Riso sax and piano, section F | 2:18.9-2:44.0 (25 s) | fit | piano and sax at opposite sides of the frame | stack the two players (sax over piano) in the riso code |
| 5 | 16-bit dialogue box, G/H | 3:05.9-3:17.0 (11 s) | fit | the old-trucker dialogue box spans 0.10-0.88 | break the box text onto more lines in the 16-bit code |

Together about 160 s. At the schema's rate (about 15 min of builder time per minute, plus review) that is
roughly 40 min of building and a review round. Doing 1 and 2 alone covers half of it and fixes the opening.

Left as wide/fit on purpose (short, or the wide staging is the point): Bob's na-na and doo-doo words, VROOM and
AWAKE (the words fill the frame), the billboard names (Bob's note: his text visible), the riso poster and LIVE grid (0.5 s each), the woodcut
squadron (4.5 s), side-on planes under 1 s.

Full per-shot list: every shot in `panscan-plan-v3.json` with mode wide or fit (its `width` says how wide).
