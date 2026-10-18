# Bob Wiseman: Real Thing (video 4)

Bob's fourth video from his list of six. Issue: rheos/secondunit-videos#15.

- Song: "Real Thing", 2026 single (YouTube qNVcMaxreDI, Indie Pool, released 2026-09-18). A new recording of the song from City of Wood (1993).
- Clock: `source/real-thing-2026.wav`, 48 kHz stereo, 165.854 s, sha256 `908e363494c7fdbefb76bfa0438ac485fa246e1d6af16a73b398514385671980`. 24 fps grid, 3981 song frames.
- Stems: Demucs htdemucs_6s in `source/stems/`. Whisper medium words in `source/words-whisper-medium.json` (timing only; words come from Bob's sheet).
- Audio, stems, lyrics and anything quoting them stay out of git.

## Section map

Frames are song frames, half-open `[start, end)`. "Sung" sections carry the story; instrumental ones go abstract.

| # | Section | Time (s) | Frames | Kind | Notes |
|---|---|---|---|---|---|
| 0 | Intro A | 0.0-5.5 | 0-132 | instrumental | "other" stem alone: reedy, 260-400 Hz fundamentals, likely harmonica |
| 1 | Intro B | 5.5-25.2 | 132-605 | instrumental | guitar + piano enter, drums from 12.5 |
| 2 | Verse 1 | 25.2-49.3 | 605-1183 | sung | refrain line / verse line, twice; harmonica answers in the gaps (36.5-37.8) |
| 3 | Refrain 1 (long) | 49.3-68.9 | 1183-1654 | sung | 51-65 is a held or wordless vocal; Whisper hears no words there |
| 4 | Break | 68.9-81.5 | 1654-1956 | instrumental | guitar, bass, lead line (peak ~1.3 kHz, likely harmonica solo) |
| 5 | Verse 2 | 81.5-105.8 | 1956-2539 | sung | same shape as verse 1 |
| 6 | Refrain 2 (long) | 105.8-125.5 | 2539-3012 | sung | held/wordless 107.7-121 |
| 7 | Turn | 125.5-130.4 | 3012-3130 | instrumental | short, piano + bass |
| 8 | Bridge | 130.4-137.8 | 3130-3307 | sung | drums drop out; the one love line |
| 9 | Turnaround | 137.8-141.5 | 3307-3396 | instrumental | piano + harmonica |
| 10 | Refrain 3 (long) | 141.5-160.6 | 3396-3854 | sung | held/wordless 143-156 |
| 11 | Outro | 160.6-165.9 | 3854-3981 | instrumental | bass + harmonica fade |

## Lyric timing (2026-10-14)

No published lyric sheet exists (bobwiseman.ca, web search). `lyrics-working.txt` (gitignored) is built from Whisper and is timing input only; nothing from it goes on screen except the title.

- `tools/align_sections.py` runs `tools/align.py` (MMS forced alignment, copied from In Her Dream) once per section window, then `tools/onsets.py` snaps to Demucs vocal onsets. Output `work/timing.json` (gitignored). Result: 60/100 words snapped, median +0.04 s, one word off by more than 0.2 s.
- A whole-song alignment stretched "treaty... makes" over 44-57 s and the bridge over 130-152 s. Per-section windows fixed both.
- **Not trustworthy: the middle of each long refrain** (about 51-65, 107-121 and 143-156 s). The vocal stem shows continuous singing there, but the working lyric has only one "Don't wanna settle for less than the real thing" per refrain, so the aligner smears its words across the stretch. Those stretches need Bob's sheet.

## Look tests v1 (2026-10-14, 0 credits)

Concept: real vs fake. The fake is a glossy mid-century tourism brochure; the real is hand-made (marker on cardboard, a pencil line). `index.html` + `js/` (kit, bob, looks); `node render.mjs t0 t1 out.mp4 4 24 0.6667` for 720p, and `node stills.mjs t...` for stills plus a contact sheet.

| Test | Song time | What happens |
|---|---|---|
| A brochure | 25.0-37.8 (verse 1) | Offset-print lake with leaping glossy fish; a big fish and printed sparkles on "real thing"; on "fishless lake" the fish blink out and the lake drains to grey |
| B placards | 81.3-93.3 (verse 2) | Marker placards march past on cardboard; REAL THING slams up full-frame on "real"; a scale placard rises on "decide" and tips hard on "fair" |
| C pencil | 130.0-138.6 (bridge) | One pencil line loops into a heart on "love"; a glossy sticker heart slaps on at "please", then peels and falls on "fake" |
| D tear | 154.5-165.85 (refrain 3 tail + outro) | The brochure rips down the middle on "real thing" to show a marker-painted real lake; little Bob walks through with his toy piano and three Junos |

Little Bob (`js/bob.js`) is the Satisfied Mind / YDLM character redrawn in each look's hand. He walks through A (print) and B and D (marker).

Reel: `out/real-thing-2026_looks-v1_f00600-f03980_24fps_reel.mp4` (1073 frames, 720p; flashcheck PASS, badframes 0). Unlisted for Robin: https://youtu.be/Ax6-Bn4jL40 (not sent to Bob).

## Rotoscope animatic (draft 1, 2026-10-17)

After Bob turned down all four look tests (#165), Robin asked for the whole song storyboarded in animation, in the
"rotoscope dream" look of Airplane on the Highway (Waking Life after the fact). Kit copied from
`bobwiseman-airplane-v1/sections/dream-j` (core, gl, person, roto -> `js/roto/kit.js`); the look shader adds `grey`
and `warm`. Page `roto.html`; `node rstills.mjs <dir> <t...>` for stills; render
`PAGE=roto.html QS=scale=0.6667 node render.mjs 0 165.854 out/<name>.mp4 6 24 0.6667`.

**The rule that carries it:** real things are rotoscoped (they breathe, fills slide under their lines); fake things
are drawn dead still and flat in brochure colours (`fake()` in `js/roto/world.js`). Every "settle for less" image
is a flat thing laid over a living one. The generative ideas so far (brochure, placards, peeling heart, tear to a
real lake) all survive as props inside this one story.

**Story:** a man in a red toque paddles a lake at dawn. A man in a pale blue suit keeps offering him the fake
version: a brochure of the lake, flat fish, a painted sky dropped like a theatre flat, a paper treaty signed by a
hand from the clouds, men painting the grey lake brochure-blue. He pulls the paint off like a tablecloth and puts
his hand in real water. Shore people hold drawn placards (fish, drop, tree, heart; no words). In the office the
blue-suit man offers a shrink-wrapped fish, presses the scales, hides behind smiling masks, pours dirt from a jar of
"air". Out in the dust his paper building blows apart; a shoot comes up; rain; a woman on the far dock is a
cardboard stand-up that falls over on "fake" and she is there behind it. They paddle off as the billboards peel
away, fish jump, the crowd waves, little Bob walks the shore with his Junos, mist closes over the lake.

Shot list with times: `js/roto/shots.js` (25 shots, each commented). Transitions marked `TR` open the next shot
through an iris from an element (the loon ripple, the near water, the ink, the lake-to-table float, the dust, the
raindrop splash).
