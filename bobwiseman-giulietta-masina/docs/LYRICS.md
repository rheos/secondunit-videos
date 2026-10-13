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
