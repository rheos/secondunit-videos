# Bob Wiseman: More

Bob asked for this one on 2026-10-05, ahead of Real Thing (parked). Issue: rheos/secondunit-videos#17.

- Song: "More", 2026 single (YouTube R9W-tDKF5Zs, Indie Pool, released 2026-03-30). A fan-shot live take exists: Hamilton, Something Else Festival 2026 (YouTube eFDh-FC8riE).
- Clock: `source/more-2026.wav`, 48 kHz stereo, 225.234 s, sha256 `e5ef4185c81983f777ad5adeb79a3f3c1936b7a7f76a0fe46fc5ab95d6970a94`. 24 fps grid, 5406 song frames.
- Stems: Demucs htdemucs_6s in `source/stems/`. Whisper medium words in `source/words-whisper-medium.json` (timing only; words come from Bob's sheet).
- Audio, stems, lyrics and anything quoting them stay out of git.

## Section map

Frames are song frames, half-open `[start, end)`. Sung sections carry the story; instrumental ones go abstract.

| # | Section | Time (s) | Frames | Kind | Notes |
|---|---|---|---|---|---|
| 0 | Count-in | 0.0-3.6 | 0-86 | instrumental | percussion only |
| 1 | Verse 1 | 3.6-35.5 | 86-852 | sung | no drums: bass, piano, keys; four "not X, it's Y" lines |
| 2 | Instrumental 1 | 35.5-65.5 | 852-1572 | instrumental | full band and drums enter at 36.5; 30 s |
| 3 | Verse 2 | 65.5-97.5 | 1572-2340 | sung | full band, guitar out; "don't want a little, I want a lot" shape |
| 4 | Chorus 1 | 97.5-129.3 | 2340-3103 | sung | the "more ..." list; loudest vocal of the song at 114-128 |
| 5 | Instrumental 2 | 129.3-158.7 | 3103-3809 | instrumental | full band; a lead line leaks into the vocal stem (no words) |
| 6 | Verse 3 | 158.7-184.9 | 3809-4438 | sung | same "don't want X, I want Y" shape |
| 7 | Chorus 2 | 184.9-214.0 | 4438-5136 | sung | bass and guitar drop out 189-205 (vocal, drums, piano), band back 206 |
| 8 | Ending | 214.0-225.2 | 5136-5406 | sung tail | band stops, last vocal and keys fade |
