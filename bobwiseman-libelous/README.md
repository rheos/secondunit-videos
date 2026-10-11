# Bob Wiseman: Libelous

Bob asked for this one on 2026-10-11 ("always wished i could make a video of this lyric"). Issue: rheos/secondunit-videos#93.

- Song: "Libelous" (Bob Wiseman), from *More Work Songs (From The Planet of The Apes)*, 2023. YouTube K6alSn6hzMw (Indie Pool).
- Clock: `source/libelous.wav`, 48 kHz stereo, 340.44 s, sha256 `5fc27740030d8e07c3c51703db9fe29b5230d51e11b77dd6a727ea0430099cbf`. 24 fps grid, 8171 song frames. From the YouTube audio stream; ask Bob for the WAV.
- Vocal stem: `source/stems/vocals.wav` (Demucs 4.0.1 htdemucs, two stems).
- Words: `source/libelous.lyrics.txt` is Bob's sheet (line breaks restored where the paste merged lines). `source/libelous.sung.txt` adds the outro repeats the record has and the sheet doesn't. `source/lines.json` is the timed contract: every sung line with start, end and per-word onsets.
- Audio, stems, lyrics and anything quoting them stay out of git.

## Captions are the video

Robin (2026-10-11): the words are hard to make out, so the whole song is captioned, in a creative way. Every sung word is on screen, timed to its onset, made of each look's own material (letterpress, TV sing-along, typed leaflet, court transcript), not subtitles laid on top.

How the timing was made (work/align.py, work/build_lines.py): Whisper on the full mix falls apart after 4:00 (it hallucinates a repeating verse), which proves Robin's point. So Bob's own text is force-aligned to the vocal stem with torchaudio MMS_FA (CTC), in windows where the global pass drifted (70.6-95.9, 261.3-272.25, 271.8-296.6). Line starts were checked against Whisper word times on the stem; they agree within about 0.4 s. Lines marked `"approx": true` (2 at 4:25-4:32 and the 8-line outro from 296.4) are spread by hand from Whisper anchors: check them by ear before a final.

The record's outro repeats the last line of the sheet: three times, a held shout of the title, twice more, the title once more. Whisper hears it badly, so the exact count is an ear-check item.

## What the song is about

The McLibel case. Helen Steel and Dave Morris, activists with London Greenpeace (a small group, not Greenpeace International), handed out a leaflet critical of McDonald's. McDonald's sued them for libel in 1990. The trial ran 313 days, the longest in English history; they had no jury and no legal aid and represented themselves. In 1997 the judge found some of the leaflet's claims true (children exploited by advertising, low wages, cruelty to animals) and the rest libellous, and fined them £60,000 (cut to £40,000 on appeal; never paid). In 2005 the European Court of Human Rights ruled that the UK had violated their rights to a fair trial and to free expression. They were never jailed (Bob's message says so; the lyric doesn't).

The song tells it as a fairy tale: a king, his plan, his fist. The video keeps that allegory: no company name, no arches, no Ronald colours. The couple are stand-ins, not portraits.

## Section map

Frames are song frames, half-open `[start, end)`. The song is sung almost wall to wall: only a 13.9 s intro and an 11 s tail are instrumental.

| # | Stanza | Time (s) | Frames |
|---|---|---|---|
| 0 | Intro | 0.0-13.9 | 0-334 |
| 1 | The king's chain (king, plan, fist, man, mouth, shareholders, cash) | 13.9-34.42 | 334-826 |
| 2 | The dictators' ball | 34.42-48.38 | 826-1161 |
| 3 | The land deal | 48.38-62.08 | 1161-1490 |
| 4 | The king breathes easy | 62.08-75.42 | 1490-1810 |
| 5 | Farmers evicted, cattle, poison, the forest | 75.42-95.92 | 1810-2302 |
| 6 | Rapunzel, the clown ad, the children's party | 95.92-123.13 | 2302-2955 |
| 7 | Tons of ink: the "Nutritional Facts" book | 123.13-165.08 | 2955-3962 |
| 8 | The workers | 165.08-198.13 | 3962-4755 |
| 9 | Factory farms | 198.13-213.46 | 4755-5123 |
| 10 | The couple and their fact sheet | 213.46-240.92 | 5123-5782 |
| 11 | One Tuesday: the king's legal teams | 240.92-261.5 | 5782-6276 |
| 12 | The case, the judge, "their view of" | 261.5-296.33 | 6276-7112 |
| 13 | Verdict and the "Libelous" refrain | 296.33-329.5 | 7112-7908 |
| 14 | Tail | 329.5-340.44 | 7908-8171 |

## Look tests (round 1, 0 credits, code-drawn, 720p)

| Look | Section | Time (s) | Frames | Captions are |
|---|---|---|---|---|
| woodcut: chapbook nursery rhyme | intro + 1 | 0.0-34.42 | 0-826 | letterpress lines under each woodcut, the chain growing like The House That Jack Built |
| tv: 1970s Saturday-morning TV | 6 | 95.92-123.13 | 2302-2955 | the kids' show caption strip, then a bouncing-ball sing-along for the jingle |
| leaflet: photocopied fact sheet | 10 | 213.46-240.92 | 5123-5782 | typed onto the leaflet as it's made, copied, handed out |
| court: courtroom sketch artist | 12 + first refrain line | 261.5-302.75 | 6276-7266 | the court transcript, line-numbered, with speaker labels |

## Caption audit (motion-lab)

Every look reports each sung word's first frame (`word#<line>.<word>`) and its box against its container
through `PROBE` (js/common/core.js; does nothing outside an audit). `audit.spec.mjs` builds the brief from
`source/lines.json`: every word on its onset frame, at most 2 frames early and 1 late. Run one look's range
from a folder that has Playwright, with rheos/secondunit-videos `tools/motion-lab/`:

    node <tools>/motion-lab/audit.mjs looks/court.html 261.5 302.75 --spec audit.spec.mjs

2026-10-11, all five looks: 453 of 453 words on their onsets, every caption inside its page, band, strip,
window or sheet. Two "in frame" flags, both by design: the sing-along band carries its last line off the
tube as it slides out (frames 2841-2844), and the school strips sit about 29 px from the bottom, 1 to 3 px
inside a 3% safe line. Use `--safe 0.05` for tv (the tube crops 3% a side).
