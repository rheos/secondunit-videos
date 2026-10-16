# Aspect ratios in this project

The 16:9 film is the master. Every other ratio is added beside it; nothing in the master is edited or replaced.

| What | 16:9 (master) | 4:5 (Instagram and Facebook feed) |
|---|---|---|
| page | `index.html` (1920x1080) | `index-4x5.html` (1080x1350), recomposed, not cropped |
| timing | `vo/timeline.json`, `vo/words.json` | the same files; `vo/embed.py` writes them into both pages |
| audio | `assets/mix.mp3` (gitignored, rebuilt by `vo/mix.py`) | the same file |
| renders | `out/` | `out/4x5/`, names end `_4x5.mp4` |
| draft 5 final | `out/one-show_draft5_720p.mp4` (1280x720) | `out/4x5/one-show_draft5_864x1080_4x5.mp4` (864x1080) |

720p-class files are the finals for the explainers (Robin, 2026-10-15: no 1080p master). The page is drawn at
1080x1350, so render it at full size into a temp file (24 fps, like the master), scale it down with a capped
bitrate, then delete the temp render:

```
npx --yes hyperframes@0.8.162 render -c index-4x5.html -f 24 -o out/4x5/tmp_4x5.mp4
ffmpeg -i out/4x5/tmp_4x5.mp4 -vf scale=864:1080:flags=lanczos -c:v libx264 -preset slow -crf 23 -maxrate 4.5M -bufsize 9M -pix_fmt yuv420p -c:a copy -movflags +faststart out/4x5/<name>_864x1080_4x5.mp4
```

`hyperframes snapshot` and `check` only read `index.html`, so review the 4:5 page from a scratch copy saved as `index.html`.

## How each plate was restacked (draft 5)

The script, the timeline and every cue are the master's; only coordinates changed. Type keeps the master's pixel
sizes, which reads larger on a phone because a 4:5 frame fills the same screen width as a 16:9 one.

- Headlines wrap to two lines on one baseline above the scale (`bottom: 150px`).
- I: the five copies in two rows (three, then two under the gaps), each drawn at the master's size and scaled 0.9; the leads are surveyed elbows down the gaps.
- II: the chat window spans the frame; the four fields sit in a 2x2 grid, region and venue led round the outside.
- III: the chat above, the tour below, the conduit runs down between them with the lock half way; invited people come in from the left, someone else from the right.
- IV: the ticket stands upright (show on top, stub under the perforation), callouts on the left. Plate III's mini tickets and Plate V's small ticket are the same upright shape.
- V: the ticket at the top, the three outputs in one row under it (the master's drawings scaled 0.76).
- VI: the map top left (road squeezed to 0.6 across, 0.7 down), steps 1 and 2 under it, the 9:16 frame on the right with the generate button under it; centre stage is scale 1.25.
- VII: a 2x2 grid, 9:16 and 4:5 on top, 1:1 and 16:9 below, each sitting on its row's baseline.
- Colophon: centred in the frame.
