# Bob Wiseman: Satisfied Mind

Bob asked for this one next (2026-10-08). Issue: rheos/secondunit-videos#83.

- Song: "Satisfied Mind" (Joe "Red" Hayes / Jack Rhodes, 1954), Bob's 2026 recording (Indie Pool, YouTube yiGJlWxSHNU, released 2026-09-18).
- Clock: `source/satisfied-mind-2026.wav`, 48 kHz stereo, 341.240 s, sha256 `7bfd0fa4f370b48248fbcca9ec30da8cedd5dea844b8fb4f4ea16eabed0875b1`. 24 fps grid, 8190 song frames. From the YouTube audio stream; ask Bob for the WAV.
- Stems: Demucs htdemucs_6s in `source/stems/` (vocals stem for snapping hits to syllable onsets).
- Whisper medium words in `source/words-whisper-medium.json` (timing only; it mishears several lines). Words come from Bob's text in `source/satisfied-mind.lyrics.txt`.
- Audio, stems, lyrics and anything quoting them stay out of git.

## Section map

Frames are song frames, half-open `[start, end)`. Sung sections carry the story; instrumental ones go abstract. Each verse ends on a long held "satisfied mind".

| # | Section | Time (s) | Frames | Kind | Look test |
|---|---|---|---|---|---|
| 0 | Intro | 0.0-5.1 | 0-122 | instrumental | (with verse 1) |
| 1 | Verse 1: fortune lost | 5.1-62.5 | 122-1500 | sung | board game |
| 2 | Verse 2: if I had their money | 62.5-124.0 | 1500-2976 | sung | banknote engraving |
| 3 | Break 1: guitar solo | 124.0-137.5 | 2976-3300 | instrumental | the engraved line plays the solo, paper turns to linen |
| 4 | Verse 3: money can't buy | 137.5-198.0 | 3300-4752 | sung | cross-stitch sampler |
| 5 | Break 2: piano/organ | 198.0-213.0 | 4752-5112 | instrumental | sampler motifs flip into tarot card backs, card-magic shuffle |
| 6 | Verse 4: when my life is over | 213.0-273.0 | 5112-6552 | sung | tarot / wheel of fortune |
| 7 | Verse 5 (= verse 1) | 273.0-328.0 | 6552-7872 | sung | board game again, with every verse's objects in the game |
| 8 | Outro | 328.0-341.25 | 7872-8190 | instrumental | overhead of the whole table, light out on the last hit (~337) |

## Running a look

`PAGE=looks/<look>.html node check.mjs out/sheet.jpg t1 t2 ...` for a contact sheet, `PAGE=looks/<look>.html node render.mjs t0 t1 out/<file>.mp4 3 24 0.6667` for a 720p draft (always on the song grid).
