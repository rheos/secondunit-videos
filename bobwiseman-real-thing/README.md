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
