# All The Trees, draft 4: the love bridge

Bob on draft 3 (2026-10-18): loves the Python feel, the pull-back and the whale with branches. But the bridge ("oh it's love, oh it's love that keeps us") holds one wide shot for twelve seconds while the heart grows slowly on its tree. He loves the two saints dancing and wants that kept, but asks for a change of angle or a refreshed scene: the heart much bigger much quicker, or something more surreal. His example named real people being shot down. Robin's call: invented figures instead, no real person.

Kept: everything outside 1:36.25 to 1:50.5, the saints dancing, the heart's birth from the root glint, the gold sap, the sun igniting on "sun", the winter light dip and falling leaves.

| Time | Word | What happens |
| --- | --- | --- |
| 1:37.05, 1:38.02 | "love", "love" | The heart pumps up a size on each word, overshooting like a bellows. |
| 1:39.65 | "Oh it's love that we need to know" | Cut to a tilted close-up on the saints dancing. The heart, too big for its cradle, floats up behind them like a balloon, bobbing. |
| 1:40.07 | "love" | Another pump, mid-rise. |
| 1:42.45 | "when the sun shines so hard" | Cut back wide. The heart is now enormous, hanging in the sky behind the saints' sun and moon heads. |
| 1:43.45, 1:44.55 | "love", "sun" | Last pump, then it ignites into a giant heart-sun. |
| 1:46.31 | "when the winter snows" | A puffed-up bewigged statesman and an opera diva with a ship in her wig sail across the sky in front of it. |
| 1:47.62 to 1:47.96 | "winter" | A cherub pops up on the left cloud and fires a snowball cannon, twice. |
| 1:48.34 | "snows" | Both worthies burst into snow, zip about like let-go balloons and drop out of the picture. Snow falls. The cold shrinks the heart back down into its cradle (1:47.96 to 1:49.3), and the cherub ducks away. |
| 1:48.9 to 1:49.35 | | The heart comes back in front of the saints' branches through an iris from its own centre, so nothing pops. |
| 1:50.5 | | Snow is gone; the trumpets take the sky exactly as in draft 3. |

Why these: the cuts give Bob the angle change (the film's first hard cuts outside the theatre). The pumping and the balloon lift answer "much bigger much quicker". The worthies are Gilliam's favourite targets, self-important period figures that burst. The snowballs come from the lyric ("winter snows"), so the surreal beat is tied to the line instead of pasted on.

## Built

`js/alchemy/bridge.js`, loaded after `extended.js`. Hooks in `extended.js`: `A.bridgeLift` (heart scale, lift, behind or in front, iris), `A.bridgeCam` (the close-up), `A.bridgeFront` (worthies, cherub, snow), `A.heartBehind` (the lifted heart drawn before the cast). The heart was split into `heartDisc` and `heartBody`; outside the bridge the hooks are identity. Cut-outs (GPT Image via Codex, style refs: a draft 3 bridge frame and the searcher cut-out): `source/alchemy/bridge/`, packed by `tools/pack_bridge_media.py`.

## QA (2026-10-17)

- Refactor alone: bridge frames pixel-identical to draft 3's code (1:38.5, 1:40.5, 1:44.8, 1:47.5). With the bridge: 0:20, 1:00, 1:32, 1:36.25, 1:50.5, 1:55, 2:04.9 pixel-identical to draft 2b's code.
- Bridge span rendered alone (frames 2310-2651); seam frame 2310 identical to v29's, the last frame within 9/255 max as the snow finishes fading.
- Full cut `out/att_alchemy-d4-full_f00000-f03674_24fps_draft.mp4`: v29 frames to 1:36.25, the bridge, v29 to 2:05, then 2:05 to the end re-rendered from the committed code (identical to `frames_d3b`). Against draft 3's file (320x180 grey): before the bridge mean diff 0.00, after it at most 1.20/255. Audio md5 identical. 0/3674 bad frames.
- Assembly trap: an ffmpeg concat list with per-frame `duration` lines drifts one frame every 2 s (it showed as a 14/255 spike every 48 frames). Assemble from a numbered image sequence (`-framerate 24 -i f_%06d.jpg`) instead.
- Before/after: `out/att_d4_before-after_bridge_left-d3_right-d4.jpg`.

## Draft 4b: the change lands on 1:36 (2026-10-19)

Bob on draft 4: "could the image change precisely on 1:36, the start of the bridge?" The bridge downbeat is 96.000 s, frame 2304 (the strongest onset in both the full mix and the band under 150 Hz; the 145 bpm grid from 110.97 puts it at 96.07). The cut to the tilted close-up moved there from 99.65: it opens low on the root junction as the gold glint arrives and tilts up with the rising heart, then runs on exactly as draft 4 from 99.65. With no cut left at 99.65 to hide it, the heart's move behind the saints now closes as an iris from its own edge (99.65 to 100.15), the reverse of the way home.

QA: only frames 2304-2403 (1:36.000 to 1:40.125) differ from draft 4's frames; every other frame is identical. Full cut `out/att_alchemy-d4b-full_f00000-f03674_24fps_draft.mp4` against draft 4's file: outside that span at most 1.12/255 mean diff (encode noise), audio md5 identical, 0/3674 bad frames.
