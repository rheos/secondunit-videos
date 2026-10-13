# Aspect ratios in this project

The 16:9 1080p master is the master. Every other ratio is ADDED beside it; nothing of the master is edited or replaced.
The project's `out/` lives on the external drive Bertha: `/Volumes/Bertha/secondunit-archive/mv-projects/bobwiseman-airplane-v1/out/`
(master: `Bob Wiseman - Airplane on the Highway (1080p master).mp4`, 8804 frames, sha256 `2fc7756c54718e4a7c4722e94e3cca8716b29c7d2586ff16ba0535f7893fd49f`).

| Ratio | How | Plan | Renders (`out/<r>/`) | Size | Status |
|---|---|---|---|---|---|
| 16:9 | master | n/a | `out/` | 1920x1080 (+ 720p) | signed off 2026-10-04 |
| 9:16 | pan and scan of the master (`bobwiseman-more/tools/panscan.py`) | `aspects/9x16/panscan-plan-v1.json` | `out/9x16/aoh_panscan-v1_..._9x16.mp4` | 720x1280 | on Bob's page 2026-10-08 |
| 4:5 | pan and scan of the master, windows fitted to the burned-in text (`tools/panscan_4x5.py`, #101) | `aspects/4x5/panscan-plan-v3.json` | `out/4x5/aoh_panscan-v3_f00000-f08804_24fps_review-864x1080_4x5.mp4` | 864x1080 review | review cut 2026-10-13; recompose proposal in `aspects/4x5/RECOMPOSE.md` |

## 4:5, how it is made

```
swiftc -O tools/ocr_frames.swift -o /tmp/ocr_frames
/tmp/ocr_frames <master> ocr_a.jsonl 6 0 4403          # Vision word boxes, every 6th frame (two halves in parallel)
/tmp/ocr_frames <master> ocr_b.jsonl 6 4404 8803
/tmp/ocr_frames <master> ocr_dense.jsonl --frames <list> --fast   # every 2nd frame + shot ends, in non-fit shots with text
python tools/panscan_4x5.py textfit aspects/4x5/panscan-plan-v1.json aspects/4x5/panscan-plan-v3.json \
    --ocr ocr_*.jsonl --move-cut 681:680 3936:3934
python tools/panscan_4x5.py audit aspects/4x5/panscan-plan-v3.json aspects/4x5/audit-v3.json --ocr ocr_*.jsonl
python tools/panscan_4x5.py render <master> aspects/4x5/panscan-plan-v3.json out/4x5/<name>_4x5.mp4 --size 864x1080
python tools/panscan_4x5.py scan out/4x5/<name>_4x5.mp4 scan.json
```

The OCR files hold Bob's lyrics as read off the screen: keep them out of git (audit reports carry word lengths only).

- **Plan v1** (2026-10-12) followed the 9:16 plan's subject tracking shot by shot and set kinetic-type widths from the
  extent of all line art. 136 s crop; 1284 word problems on the OCR'd frames (mostly the corner HUD cut by 1747 px windows).
- **Plan v3** keeps v1's centres as the target and fits each shot to the text: the narrowest width (864, 936, 1008, 1080,
  1200, 1350, 1536, 1728, 1920) whose least-cost path keeps every big word (lyrics, signs, stamps, subtitles) wholly
  inside with 32 px clear, slices no word, and lets HUD rows fall outside. Two cuts moved where the 9:16 cut list was
  late (681 -> 680, 3936 -> 3934). 0 word problems on 3125 OCR'd frames.
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
| **all** | **127.2** | **112.9** | **126.7** |

Recompose (per-ratio shot code under the schema in `secondunit/CLAUDE.md`) is proposed for the kinetic type, the
monologue subtitles, the riso sax/piano two-shot and the 16-bit dialogue box; see `aspects/4x5/RECOMPOSE.md`.
Final size (864x1080 like the phone rule, or 1080x1350) is Robin's call before a final.
