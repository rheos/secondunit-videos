# Aspect ratios in this project

The 16:9 plate is the master. Every other ratio is added beside it; nothing of the master is edited.

| What | 16:9 (master) | 9:16 |
|---|---|---|
| page | `plate.html` | `plate-9x16.html` (sets `window.PLATE_SIZE = [1080, 1920]` before the kit) |
| shot code | `js/plate.js` | `js/plate-9x16.js` (recomposed: the sankey turned to run down the page) |
| renders | `out/` | `out/`, names end `_9x16.mp4`, 720x1280 |
| check | `node check.mjs 14` | `node check.mjs 14 --page plate-9x16.html` |

Shared and read-only for aspect work: `data/tour.js`, `_in/`, the kit. `js/hand.js` reads the page size from
`window.PLATE_SIZE` (default 1920x1080), so the master draws pixel-identically (checked: PSNR inf at t=14).

**9:16 (issue #488, Nov 10 2026).** Bob's 16:9 post on Instagram was centre-cropped and lost every word. The tall
plate keeps the same chart, season, pens and 32 s schedule. Months run across the top as ticket stubs on a skewer
with hanging tags; provinces sit along the foot as tally rails with signboards; the strip from the sea to the
mountains is the ground at the bottom, the sea under the Maritimes and the mountains under British Columbia.
Lettering stays between y 300 and 1580 and the sign row stops 130 px short of the right edge, clear of the feed's
4:5 crop, the Reels buttons and the caption. Render and encode:

```bash
node ../tools/motion-lab/render.mjs "plate-9x16.html?w=720" 0 32 out/fifty-three-nights_9x16-pic_f00000-f00768_24fps.mp4 --width 720 --height 1280 --workers 3
ffmpeg -i out/fifty-three-nights_9x16-pic_f00000-f00768_24fps.mp4 -i _in/all-dressed-up_206.0-235.0.wav -map 0:v -map 1:a -t 29 \
  -c:v libx264 -profile:v high -crf 23 -maxrate 4.5M -bufsize 9M -pix_fmt yuv420p -color_range tv -g 48 -keyint_min 48 \
  -sc_threshold 0 -movflags +faststart -c:a aac -b:a 192k -ar 48000 out/fifty-three-nights_d2-9x16_f00000-f00696_24fps_9x16.mp4
```

Social clips are encoded Reel-safe (standard range, a keyframe every 2 s): Bob's Me and Jimi verse 3 reel was damaged
after upload, and our 8 s keyframe gap let one bad frame smear 8 s of picture.
