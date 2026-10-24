# Bob Wiseman: Giulietta Masina at the Oscars Crying

Bob asked for this one next (2026-10-09). Issue: rheos/secondunit-videos#89.

- Song: "Giulietta Masina at the Oscars Crying" (Bob Wiseman), title track of his record. YouTube 9hnF0D_MOuE (Indie Pool, "Released on: 2013-01-24").
- Clock: `source/giulietta-masina.wav`, 48 kHz stereo, 139.046 s, sha256 `fe1623e61d44ded7db6113ecc7af67804106908ebf40fba0c558e1233be6f72f`. 24 fps grid, 3337 song frames. From the YouTube audio stream; ask Bob for the WAV.
- Whisper medium words in `source/words-whisper-medium.json` (timing only: it hears "Marzina", "pension plans" as "of pension plans", "life mission" as "life may shun you", and misses "asa nisi masa"). Words come from Bob's text in `source/giulietta-masina.lyrics.txt`.
- Audio, stems, lyrics and anything quoting them stay out of git.

## What the song is about

Giulietta Masina, actor, married to Federico Fellini for 50 years. The lines point at real things: Cabiria (Nights of Cabiria, 1957, the prostitute who keeps her heart; Oscar for Best Foreign Language Film), "asa nisi masa" (the childhood magic phrase in 8½), the clowns (La Strada, I Clowns), and her crying in the audience at the 1993 Oscars when Fellini got his honorary award. Verse 3 is a numbered list that ends on "eight and a half". Their son died as a newborn in 1945: stage that line gently, no baby on screen.

## Section map

Frames are song frames, half-open `[start, end)`. Sung sections carry the story; instrumental ones go abstract. Boundaries are from Whisper, to be snapped on the vocal stem.

| # | Section | Time (s) | Frames | Kind |
|---|---|---|---|---|
| 0 | Intro | 0.0-9.0 | 0-216 | instrumental |
| 1 | Verse 1: at the Oscars crying | 9.0-34.0 | 216-816 | sung |
| 2 | Verse 2: the part of a prostitute (Cabiria) | 34.0-60.0 | 816-1440 | sung |
| 3 | "asa nisi masa" + guitar break | 60.0-92.5 | 1440-2220 | mostly instrumental (exact line time TBD) |
| 4 | Verse 3: the count, one to eight and a half | 92.5-129.5 | 2220-3108 | sung |
| 5 | Outro | 129.5-139.05 | 3108-3337 | instrumental |
