# On-screen lyrics and the verse clips

Bob asked on 2026-10-12 (Messenger): add the lyrics, make them visible, and send the three verses as separate
30-second pieces. Issue rheos/secondunit-videos#104.

## How the captions are made

- **Words** are what is SUNG on the 2026 recording, in Bob's spelling. `source/me-and-jimi.sung.txt` (local, never
  committed) holds every caption line, checked against Whisper large-v3 on the Demucs vocal stem. The recording
  swaps two closing lines against Bob's sheet: verse 2 closes on "remember her name", verse 3 on "ashamed I missed
  that train". Captions follow the recording.
- **Times**: `tools/align_lyrics.py` force-aligns each verse window (torchaudio MMS_FA) to
  `source/stems/htdemucs/me-and-jimi-2026/vocals.wav`, then snaps each word's start to the strongest vocal onset
  nearby (rise in log energy over 40 ms). Writes `source/lines.json` (local). `tools/make_lyrics.mjs` turns it into
  `js/gen/lyrics.js` (gitignored).
- **Look** (`js/lyrics.js`): the line is carved into a paper label block with a black edge, an inner rule and
  stop-cut nicks, in Superclarendon capitals like the video's own signs; her name on the red plate. Each word prints
  on its first song frame with a 3-frame impression; words not yet sung are not on the block. The label is cut to
  the whole line's size, so it never grows while it is read. `core.js` calls `OVERLAY(t)` after the shot and before
  the woodcut shader, so the label prints like the rest of the block and nothing in the shot crosses it.
- **Placement**: bottom centre, inside the print's border. 16:9: 56 px type, label bottom at y 1028. 9:16: 60 px
  type, label bottom at y 1440 and 20 px left of centre, clear of the Reels/Shorts bottom bar and right-hand
  buttons. `CAP_TOP` moves a line to the top where the label would hide what the shot says (16:9, verse 2's last two
  lines: the kids spelling her name).
- **Pan-and-scan** shots in 9:16 (vertical.mjs) set `window.__capCx`; the label is laid out for the tall frame inside
  the crop window.

Pages: `wood-cap.html` (16:9), `wood-9x16-cap.html` (9:16). The uncaptioned pages are unchanged.

## Audit

`node ../tools/motion-lab/audit.mjs wood-cap.html 0 36.5 --spec audit.spec.mjs --margin 0` (and 75.5-112,
151.5-188.5; add `--width 1080 --height 1920` for `wood-9x16-cap.html`). 2026-10-13, both aspects: 115 of 115
words on their onset frame (tolerance 2 early, 1 late), every word inside its label with a 14 px margin, every label
inside the 3% safe area.

## Renders (on ARCH = /Volumes/Bertha/secondunit-archive/mv-projects/bobwiseman-me-and-jimi/out)

The 16:9 master v12 is untouched. Only the frames where a label shows were drawn again:

| What | Song frames | How |
|---|---|---|
| 16:9 caption spans | 0-815, 1856-2660, 3688-4507 | `node render.mjs wood-cap <t0> <t1> out/patch169_f..mp4 4` |
| 9:16 verse spans | 0-822, 1847-2677, 3675-4487 | `node render.mjs wood-9x16-cap <t0> <t1> out/tall_f..mp4 4 24 0 0.6667` |
| 9:16 booth (pan-and-scan, as in the 9:16 master) | 105-239 | `node vertical.mjs wood-cap out/plan-booth.json out/booth_pan_f105-f240.mp4` |

Then `zsh tools/lyrics_deliver.sh` lays the spans over the master frame for frame and cuts the clips:

- `maj_woodcut-v13-lyrics_f0-f6780_24fps_master1080.mp4` (+ `_720p`)
- `9x16/verses/maj_verse{1,2,3}-lyrics-v1_f<start>-f<end>_24fps_9x16.mp4`, 720x1280

| Clip | Song time | Cut |
|---|---|---|
| verse 1 | 0.00-34.29 | the song opens on the first word; ends on the downbeat at 34.30 |
| verse 2 | 76.96-111.58 | 0.6 s of Ellen on stage, cut to Beyonce lands on "Before" (77.58); ends on the downbeat at 111.60 |
| verse 3 | 153.13-187.00 | lead-in on the beat at 153.13 ("I" at 153.91); ends on the cut to the outro |

Audio fades: 0.15 s in (0.02 s on verse 1), 0.35-0.45 s out. No title cards.
