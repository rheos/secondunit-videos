# Parity: Travel Agent draft 21 vs the cleanline port

Old = draft 21 as it shipped (`bobwiseman-travel-agent/looks/film.html` on branch `travel-agent-21`, 63c70ac). New = `bobwiseman-travel-agent-cl/film.html` on cleanline. Both drawn in the same Chrome by `cleanline/bin/compare.mjs`, which hashes each page's RGBA after `drawFrame` and diffs every pixel of any frame whose hash differs.

## Result

On Chrome's software canvas (`CL_GPU=0`) every frame checked is pixel-identical, in all three looks:

| Run | Frames | Identical |
|---|---:|---:|
| fieldguide + blueprint, first frame of every cut and every sung line | 127 | 127 |
| fieldguide + blueprint, one frame per second across the song (every 24th frame) | 404 | 404 |
| armink (`?look=arm` vs `?look=armink`), every cut and line start | 127 | 127 |
| armink on plain paper (`&ground=plain`), every cut | 122 | 122 |
| draft 15 plain line (`?ink=1`), every cut | 122 | 122 |

Sheets for the event-frame run: `event-frames-cpu/sheet_*.jpg` (old | new | changed pixels, one row per frame). Per-frame tables: each folder's `report.md`.

## The frames that differ, and why

On the GPU canvas, the default for renders, the event-frame run shows 4 of 127 frames differing (`event-frames-gpu/report.md`): f3844, f5023, f5293, f7911, each by 1 level out of 255 on 1 to 7 pixels. Not the port:

- The old page against itself shows the same 4 frames differing by the same amount (`gpu-noise/old-vs-old-127-frames.md`), and so does the new page against itself.
- Rerun on just those 4 frames, the count changes from run to run (3, then 2 differing), and the pixels move (`gpu-noise/old-vs-new.jpg`, `gpu-noise/new-vs-new.jpg`: rings mark each one). They sit on anti-aliased edges, the corridor wheel's segments and one sun ray.
- On the software canvas the same frames are identical.

So it is Chrome's GPU rasteriser varying by one level on a handful of edge pixels between two pages drawing the same frame. Invisible, and present in the old film already. For proofs, use `CL_GPU=0`.

## Also checked

- Cloud render (`tools/cloud-render/cloud-render.sh --draft bobwiseman-travel-agent-cl film.html 95 105`, workflow from this branch): 240 frames, 0 bad, matches the local frame at f2400 apart from the label font Linux substitutes (as for every cloud render).
- Preview player: `?t=95.5` opens at f2292, the bar scrubs, `.` steps a frame, shift-left jumps 10 s, the O'Hara echo appears at 292.58 s from the clock's `ohara` cue list. No console errors.
