# On-screen lyrics and the verse clips

Bob asked on 2026-10-13 for the same package as Me and Jimi (#104): the lyrics on screen, and the three verses as
separate short vertical pieces. Issue rheos/secondunit-videos#117. Method copied from `bobwiseman-me-and-jimi/docs/LYRICS.md`.

## Words and times

- **Words** are Bob's text as sung, in his spelling (`source/giulietta-masina.sung.txt`, local, never committed). His
  sheet spells one word "stagefight"; the recording sounds like "stage fright". The captions keep his spelling until he
  or Robin says otherwise.
- **Times**: `source/giulietta-masina.timed.txt` (local) holds every word's onset, picked from vocal-stem onsets (rise in
  log energy over 40 ms) and sibilance, because MMS_FA forced alignment (`tools/align_lyrics.py`) slid on this legato
  stem. `tools/build_lines.py` writes `source/lines.json`; `tools/make_lyrics.mjs` writes `js/gen/lyrics.js` (gitignored).
- **Checked 2026-10-13**: each verse opens on a long held "Giulietta" of about 2.9 s, then her surname. The kite look's
  notes call the 5.89 s phrase wordless; it is not. Verse 1's vocal (5.6 s on) correlates with verse 3's (89.5 s on) at
  0.99 on the energy envelope, offset 83.90 s, and the dream look measured verse 3's syllables from 89.84. Verse 2
  matches at offset 56.92 s. The rest agrees with MMS_FA within 0.25 s, except the legato words, where the table's
  times sit on sibilance and Whisper large-v3 runs 0.3 to 1 s early as usual.

## Look

`js/lyrics/cap.js`, loaded after the approved look's own scripts; the look files are not edited.

- **Film looks** (kite, dream, leader): burned-in subtitles in the dream's style: white Helvetica Neue, dark edge, faint
  glow. In kite and dream they print inside the film (the look's own `drawSubs` is replaced), so they weave with the gate.
  The chant stays italic, as the dream set it. 16:9: 56 px. 9:16: 40 px on the 720 x 1280 frame.
- **Poster**: a cream paper snipe pasted on the poster, each word brushed on in the poster's own red lettering
  (`brushLettering`) on its onset, left to right over 3 frames. The snipe is cut to the whole line, so it never grows.
- Each word shows from its onset frame; a line shows from 0.25 s before its first word to its hide time.

## Placement: never over a face

Every drawn head reports a box (`js/lyrics/faces-<look>.js` wraps the look's head functions; the poster reports its
painted heads from the layout through the camera; the leader counts a whole picture with people in it as a face).
`tools/place_captions.mjs <look> <wide|tall>` scans every captioned frame and writes `js/lyrics/cap-place.js`: per line,
the cheapest spot clear of every head (+14 px) on every frame. A caption moves only on a cut. Subtitles stay within 80 px
of centre, bottom first, then top; snipes may go anywhere on the poster.

Hand-measured boxes, where the generic box was too generous to leave any spot:
- kite, her face: forehead at -0.84 r, chin at 0.96 r (`js/kite/people.js`). The box is -1.0 r to +1.06 r, so a
  subtitle can sit over her hair in the 9:16 close.
- poster, the star head: chin measured at 0.79 r on f860; box ends at 0.88 r.
- poster, the crying close (f1040-1077): face measured on f1040 and f1077 (x to 1400, growing to 1450). 16:9: the snipe
  stands in the red field beside her cheek, three rows. 9:16: the shot is all face, so it plays with no caption
  (`CAP_GAPS`); "crying" printed 1.3 s before the cut, and "played" (onset f1076) prints on f1078, the cut back: 2 frames
  (83 ms) late, one over the audit's tolerance. The 9:16 audit reports it; it is the one known exception.

## 9:16

No recomposed 9:16 exists, so the tall frame is a pan-and-scan: a 607.5 x 1080 window of the 16:9 frame, scaled to
720 x 1280, with the caption drawn on the tall frame at its own size. `tools/panscan_plan.mjs <look> <t0> <t1>` holds
one window per shot on the heads (or on the dark figure against the sky where no head shows) and pans across a shot
only when its subject travels further than the window. Hand edits in `aspects/9x16/panscan-edits-v1.json` (the poster
close on her eye and tear; the poster "at the Oscars" shot on the statuette strip). `node tools/plan_js.mjs` after any
change. Caption area: x 30-640, y 150-1030, clear of the Reels/Shorts bottom bar and the right-hand buttons.

## Audit

`node work/tools/motion-lab/audit.mjs looks/<look>-cap.html <t0> <t1> --spec audit.spec.mjs --margin 0` (spans: kite
0-34, poster 34-60, dream 60-92.5, leader 92.5-139.05; 9:16 pages with `--width 720 --height 1280` over the clip spans).
2026-10-13, 16:9: 83 of 83 words on their onset frame (tolerance 2 early, 1 late), every word inside its block,
no block on a face on any frame. 9:16, over the clip spans: the same, except "played" 2 frames late (above).

## Renders and delivery

`zsh tools/lyrics_render.sh` renders only the spans where a caption shows (16:9: f136-816, 816-1427, 1456-1851,
2148-2220, 2220-3087, at the v4 draft's 720p) and the three 9:16 clip spans. `zsh tools/lyrics_deliver.sh` lays the 16:9
spans over the v4 master frame for frame (the master is read, never written) and cuts the clips:

| Clip | Song frames | Song time | Cut |
|---|---|---|---|
| verse 1 (kite dream) | 109-786 | 4.54-32.75 | on the cut at 4.54 (guitar pulse); ends in the breath after the long last note |
| verse 2 (the poster) | 786-1440 | 32.75-60.0 | 0.15 s before "Giulietta" over the kite going dark; ends as the dream begins |
| verse 3 (the countdown) | 2150-3108 | 89.58-129.5 | 0.17 s before "Giulietta" on the beach; the whole verse, 39.9 s (Robin's call) |

Audio fades 0.05-0.12 s in, 0.25-0.5 s out. No title cards.

`tools/lyrics_check.py <master> <lyric cut>` compares the two frame by frame: anything that differs must be one
caption-sized region, and nothing may differ where no caption shows.

## Outputs and checks (2026-10-13)

| File | Size | Frames |
|---|---|---|
| `out/gm_looks-v4-lyrics-v1_f00000-f03337_24fps_draft.mp4` | 1280x720 | 3337 |
| `out/9x16/verses/gm_verse1-lyrics-v1_f00109-f00786_24fps_9x16.mp4` | 720x1280 | 677 (28.2 s) |
| `out/9x16/verses/gm_verse2-lyrics-v1_f00786-f01440_24fps_9x16.mp4` | 720x1280 | 654 (27.25 s) |
| `out/9x16/verses/gm_verse3-lyrics-v1_f02150-f03108_24fps_9x16.mp4` | 720x1280 | 958 (39.9 s) |

- The v4 master's sha256 is unchanged after delivery.
- `tools/lyrics_check.py`: 0 suspect frames. Every difference from the master is one caption-sized region, and nothing
  differs where no caption shows, the ten span seams included. (Per-pixel, the patches differ from the master by encode
  noise on grain and edges: the master is two encode generations deep, the patches one.)
- `tools/badframes.py`: the 16:9 cut flags the same 118 frames as the master (the designed blacks); the clips flag only
  the kite's fade to black (verse 2, f809-815), the poster tearing into the dark (f1432) and the dream's cut to black
  into the leader (verse 3, f2216-2224).
- `flashcheck.py`: the three clips pass. The 16:9 cut fails at 131.88 s (4.5 flashes in a second, the flapping leader
  tail in the outro), exactly as the approved v4 master does, outside every caption span.
- 1:1 caption crops at 720p in both aspects: every word inside its block with margin.

## Finals (2026-10-14, after Bob's sign-off)

Bob approved Giulietta on Messenger, 2026-10-14: "I am good with giulietta, if you could render 1080, 740, and 9x16
with lyrics on screen" (740 = 720p). `zsh tools/finals.sh` makes all three into `out/finals/`:

| File | Size | Frames | Bytes |
|---|---|---|---|
| `gm_looks-v4-lyrics-final_f00000-f03337_24fps_1080p.mp4` | 1920x1080, crf 17 | 3337 | 431 MB |
| `gm_looks-v4-lyrics-final_f00000-f03337_24fps_720p.mp4` | 1280x720, crf 18 | 3337 | 167 MB |
| `gm_looks-v4-lyrics-final_f00000-f03337_24fps_9x16.mp4` | 720x1280, crf 23, max 4.5 Mb/s | 3337 | 51 MB |

- **16:9 is not redrawn.** The page always draws at 1920x1080, so the v4 master's own frames (`out/frames_looks_*`,
  the dream's f1440-1850 from the v3 render the master reused) and the caption spans (`out/frames_cap/*-cap_*`) are
  native 1080p already. The 1080p final is those frames, encoded once; the 720p final is the same frames scaled down
  once (cleaner than the v1 lyric cut, which was an overlay on the 720p master, two encodes deep). The frame
  sequences are hard links in `work/finals/`, so a later render that clears an `out/frames_*` folder can't change them.
- **9:16 full song** (no 1080x1920: the house rule is 720x1280 for phone ratios, and the window is only 607.5 px of
  the 16:9 frame). The verse spans are the delivered clips' own frames; three spans were new: kite f0-109, the whole
  dream f1440-2220 and the leader tail f3108-3337. The pan-and-scan plan was extended over them
  (`tools/panscan_plan.mjs`), with the seams pinned to the delivered windows (kite 1241 px at 4.0 s, leader 958 px at
  129.5 s).
- **Bug found and fixed:** the dream's shot table for the tools (`js/lyrics/faces-dream.js`, `capShot`) read `SH`,
  which still holds the old kite dream's cuts after 77.1 s. The page draws the beach (`BEACH_SHOTS`: 77.1, 80.89,
  84.58, 86.87, 88.39, 89.84), so on the beach the window changed where nothing cut and held across real cuts. It now
  reads the beach's cuts. Only the tools read `capShot`, so no 16:9 frame changes. Consequence: the shore shot
  (f2122-2157) pans 494 -> 304, and the first 4 frames of verse 3 (f2150-2153) sit a few px off the delivered clip.
- **Hand edit:** the farm's boy close (f1744-1797) holds at x 820. The proposal panned toward the small doll on the
  right and slid his face out of the window by f1796 (`aspects/9x16/panscan-edits-v1.json`).
- Dream captions re-placed for 9:16 (`place_captions.mjs dream tall`): line 13 sits mid-frame (y 594) over the dark
  above the girl's head, since both the top and bottom spots touch a head in that shot.

Checks (2026-10-14):
- Frames: 3337 in every final, the same as the v4 master; audio 139.041 s, video 139.042 s. The v4 master's sha256 is
  unchanged (904af40f...).
- `tools/finals_check.py`: the 1080p and 720p finals against the approved v1 lyric cut, frame by frame at 720p: 0
  frames with a block over 22 levels (median mean |diff| 1.1 to 1.2, encode noise). `tools/lyrics_check.py` against
  the v4 master: 0 suspect frames (everything that differs is a caption).
- `tools/verse_check.py`: the full 9:16 against the delivered verse clips: verse 1 and 2 identical on every frame;
  verse 3 differs on f2150-2153 only (above).
- Audit, 9:16 dream f1440-2220: 19 of 19 words on onset, all words in their blocks, no block on a face (780 frames).
  The verse spans are the audited, delivered frames. The known exception stands: "played" prints 2 frames late
  (f1078, the cut back from the caption-free poster crying close, which is all face in 9:16). Printing it on time
  would put it on her face, so it stays.
- `badframes.py`: 16:9 flags only the master's designed blacks. The 9:16 also flags dark crops in the dream (the
  oval portrait f1667-1689, the boy close f1781-1805); all checked by eye: real picture, no mis-scaled frame.
- `flashcheck.py`: all three fail at 131.88 s only (4.5 flashes in a second, the flapping leader tail), exactly as the
  approved v4 master does. Not changed: the picture must match the approved cut.
- Open: Bob's sheet spells "stagefight", the recording sings "stage fright". The finals keep his spelling.
