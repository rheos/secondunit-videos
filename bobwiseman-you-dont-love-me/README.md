# Bob Wiseman: You Don't Love Me

Bob asked for this one after Giulietta Masina (2026-10-09, "and then this if possible"). Issue: rheos/secondunit-videos#91.

- Song: "You Don't Love Me" (Bob Wiseman). YouTube F0VD5RKgtSE (Bob Wiseman - Topic, uploaded 2023-11-07), 3:53.
- Clock: `source/you-dont-love-me.wav` (copy at `assets/song.wav`), 48 kHz stereo, 233.040 s, sha256 `a6d2030aa8ce171fcfb8b0e06ae698ac3152bb36507029535152796163ee5821`. 24 fps grid, 5593 song frames. From the YouTube audio stream; ask Bob for the WAV.
- Whisper medium words in `source/words-whisper-medium.json` (timing only: it hears "cover fair" for "confess", "novice days" for "no bee sting", "some the sandy path", "without a care" for "without a king", and misses "ba bum bum bum"). Words come from Bob's text in `source/you-dont-love-me.lyrics.txt`.
- Audio, stems, lyrics and anything quoting them stay out of git.

## What the song is about

The singer is a woman ("doctor asks me girl") stuck on someone who doesn't love her back. Every line gets a backing "[you don't love me]", sung twice. The images: making the mountains confess, a cliff edge, an evil spell, a doctor, laughing at winter, a record company jab, a tea leaf reader's prophecy (shun the sandy path, sleep on rocks), a cracked glass heart, a flower raised in the desert that sings, waiting years for a king.

Running device across every look: each backing "you don't love me" plucks a petal off a daisy (loves me, loves me not, always landing on not).

## Section map

Frames are song frames, half-open `[start, end)`. Sung sections carry the story; instrumental ones go abstract. Boundaries are from Whisper, to be snapped on the vocal stem.

| # | Section | Time (s) | Frames | Kind | Look test |
|---|---|---|---|---|---|
| 0 | Intro | 0.0-22.0 | 0-528 | instrumental | abstract |
| 1 | Verse 1: the mountains, the cliff, the spell | 22.0-71.7 | 528-1720 | sung | survey map (topographic sheet, contours, hachures) |
| 2 | Verse 2: the doctor, winter, record company | 71.7-118.3 | 1720-2838 | sung | medical chart (anatomy plates, pharmacy labels) |
| 3 | Bridge: the tea leaf reader + "ba bum bum bum" | 118.3-151.0 | 2838-3624 | sung, then instrumental | teacup (looking down into the cup, leaves form the images) |
| 4 | Verse 3: spell it out, cracked glass heart, desert flower | 151.0-214.0 | 3624-5136 | sung | stained glass (cracks on "crack in the glass") |
| 5 | Outro | 214.0-233.04 | 5136-5593 | sung tail, instrumental | abstract |

## Running a look

`PAGE=looks/<look>.html node check.mjs out/sheet.jpg t1 t2 ...` for a contact sheet, `PAGE=looks/<look>.html node render.mjs t0 t1 out/<file>.mp4 3 24 0.6667` for a 720p draft (always on the song grid). Every frame is a pure function of song time t (`js/common/core.js`).

## Audit (motion-lab)

The glass pages report the daisy (`petal#<n>` as each petal starts to fall, song-wide index, and how many
petals are still on) and the drawn text against its container (scroll letters including their pop, glass
tags, the reading box, the price tag) through `PROBE` (js/common/core.js; does nothing outside an audit).
`audit.spec.mjs` takes the 27 drop times from the three timing files and checks the pages agree: every page
shows 27 minus the drops so far on every frame, and each petal falls on its frame. Run one page's range from
a folder that has Playwright, with rheos/secondunit-videos `tools/motion-lab/`:

    node <tools>/motion-lab/audit.mjs looks/glass.html 151 233.04 --spec audit.spec.mjs

2026-10-11, whole song (glass-v1 0-71.67, glass-v2 71.67-118.33, glass-bridge 118.33-151, glass 151-233.04):
27 of 27 petals fall on their frames, the count agrees across all four pages on all 5593 frames, and every
piece of text fits its container. One flag, not a defect: a glass tag's first pop-in frame (645) is drawn at
24% scale, where the fixed 4 px margin is tight. The bridge draws no daisy or text, so only the song-wide count
applies there. The probe lines in the files that quote the lyric (scenes, v1-scenes, v2-scenes, v2-main) are
local only, like those files.
