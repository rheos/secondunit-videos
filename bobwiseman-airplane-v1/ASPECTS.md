# Aspect ratios in this project

The 16:9 1080p master is the master. Every other ratio is ADDED beside it; nothing of the master is edited or replaced.
The project's `out/` lives on the external drive Bertha: `/Volumes/Bertha/secondunit-archive/mv-projects/bobwiseman-airplane-v1/out/`
(master: `Bob Wiseman - Airplane on the Highway (1080p master).mp4`, 8804 frames, sha256 `2fc7756c54718e4a7c4722e94e3cca8716b29c7d2586ff16ba0535f7893fd49f`).

| Ratio | How | Plan | Renders (`out/<r>/`) | Size | Status |
|---|---|---|---|---|---|
| 16:9 | master | n/a | `out/` | 1920x1080 (+ 720p) | signed off 2026-10-04 |
| 9:16 | pan and scan of the master (`bobwiseman-more/tools/panscan.py`) | `aspects/9x16/panscan-plan-v1.json` | `out/9x16/aoh_panscan-v1_..._9x16.mp4` | 720x1280 | on Bob's page 2026-10-08 |
| 4:5 | kinetic sections A + K redrawn (`sections/kinetic/kinetic-4x5.html`, `sections/kinetic/js/ch-4x5/`), the rest pan and scan of the master with windows fitted to the burned-in text (`tools/panscan_4x5.py`), joined by `tools/compose_4x5.py` (#101) | `aspects/4x5/panscan-plan-v4.json` | `out/4x5/aoh_recompose-v5_f00000-f08804_24fps_review-864x1080_4x5.mp4` (v4 = pan and scan only) | 864x1080 (Robin 2026-10-13: final size) | v5 review cut 2026-10-13; v4 on Bob's page + YouTube |

## 4:5, how it is made

```
swiftc -O tools/ocr_frames.swift -o /tmp/ocr_frames
/tmp/ocr_frames <master> ocr_a.jsonl 6 0 4403          # Vision word boxes, every 6th frame (two halves in parallel)
/tmp/ocr_frames <master> ocr_b.jsonl 6 4404 8803
/tmp/ocr_frames <master> ocr_dense.jsonl --frames <list> --fast   # every 2nd frame + shot ends, in non-fit shots with text
python tools/panscan_4x5.py textfit aspects/4x5/panscan-plan-v1.json aspects/4x5/panscan-plan-v4.json \
    --ocr ocr_*.jsonl --hand aspects/4x5/hand-v4.json --move-cut 681:680 3936:3934
python tools/panscan_4x5.py audit aspects/4x5/panscan-plan-v4.json aspects/4x5/audit-v4.json --ocr ocr_*.jsonl
python tools/panscan_4x5.py render <master> aspects/4x5/panscan-plan-v4.json out/4x5/<name>_4x5.mp4 --size 864x1080
python tools/panscan_4x5.py scan out/4x5/<name>_4x5.mp4 scan.json
```

The OCR files hold Bob's lyrics as read off the screen: keep them out of git (audit reports carry word lengths only).

- **Plan v1** (2026-10-12) followed the 9:16 plan's subject tracking shot by shot and set kinetic-type widths from the
  extent of all line art. 136 s crop; 1284 word problems on the OCR'd frames (mostly the corner HUD cut by 1747 px windows).
- **Plan v3** keeps v1's centres as the target and fits each shot to the text: the narrowest width (864, 936, 1008, 1080,
  1200, 1350, 1536, 1728, 1920) whose least-cost path keeps every big word (lyrics, signs, stamps, subtitles) wholly
  inside with 32 px clear, slices no word, and lets HUD rows fall outside. Two cuts moved where the 9:16 cut list was
  late (681 -> 680, 3936 -> 3934). 0 word problems on 3125 OCR'd frames.
- **Plan v4** = v3 plus six by-eye overrides (`aspects/4x5/hand-v4.json`) where the OCR could not see the text that
  matters: the rotated NOTED stamp, STILL NOT A CAR, END OF RECORDING's final G, AWAKE building letter by letter, a
  subtitle sliding in late, and a mirrored subtitle ghost. Each was measured on a full-res master frame. The review
  cut renders v4.
- **crop** = an 864x1080 window. **wide** = a wider window scaled to 864 wide over a blurred copy of itself.
  **fit** = the whole 16:9 frame over blur.

| Section | crop s | wide s | fit s |
|---|---|---|---|
| A kinetic | 12.2 | 19.6 | 40.2 |
| B riso | 11.7 | 7.7 | 3.4 |
| C woodcut | 6.2 | 0.0 | 0.0 |
| D kawaii | 14.7 | 1.4 | 2.3 |
| E woodcut | 1.2 | 6.7 | 4.5 |
| F riso | 2.7 | 6.4 | 30.3 |
| G kawaii | 3.8 | 4.2 | 17.9 |
| H 16-bit | 9.9 | 19.8 | 0.0 |
| I dream | 45.5 | 10.7 | 0.0 |
| J monologue | 7.9 | 25.3 | 16.6 |
| J2 kawaii | 8.7 | 0.0 | 0.0 |
| K kinetic | 2.8 | 11.2 | 11.5 |
| **all (v3; v4 widens six of these shots)** | **127.2** | **112.9** | **126.7** |

## 4:5 recompose (v5)

Robin (2026-10-13): redraw the kinetic type only; 864x1080 is the final size. Sections A (frames 0-1728) and K
(8191-8804) are drawn natively at 864x1080 by `sections/kinetic/kinetic-4x5.html` (sets `window.CANVAS`; `js/core.js`
reads W/H from it, size-neutral for the master), shots in `js/ch-4x5/A1.js A2.js A3.js K.js`, portrait paper and tech
log in `js/kit-4x5.js`, brief in `sections/kinetic/BRIEF-4x5.md`. Render frames, then compose:

```
cd sections/kinetic   # needs js/data.js + js/lyrics.js (gitignored; copy from the main checkout, never symlink)
FRAMES_ONLY=1 node render.mjs kinetic-4x5 f0 f1728 out/none.mp4 3
FRAMES_ONLY=1 node render.mjs kinetic-4x5 f8191 f8804 out/none.mp4 3
python tools/compose_4x5.py out/4x5/<v4 pan and scan>.mp4 <A frames> <K frames> out/4x5/<new>_4x5.mp4
```

The J2 -> K bridge dissolves over frames 8191-8215 in the master, so the compose crossfades the pan and scan into the
redrawn K over those 24 frames. With A and K native, about 207 s of the 367 is a true 4:5 picture; the monologue
subtitles, riso sax/piano and the 16-bit dialogue box stay pan and scan (wide/fit) by Robin's call.
