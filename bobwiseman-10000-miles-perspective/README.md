# Perspective illusion on 10,000 Miles (look test)

A 10 s seamless loop of an invented BC tour town at winter dusk, on Bob Wiseman's "10,000 Miles" from 41.97 s. A level
telephoto view (1.6 degrees, about 1.3 km back) squashes the main street into a flat drawing; on the first chorus beat it
dolly-zooms open; it swings to an axonometric corner view over the town, opens that into 3D, then turns back down the
street and pulls out to the flat view again. The five road cases stand in a row at the start. While the view is flat they
slide along the camera's own rays into a diagonal down the street, so the dolly reveals a line that wasn't there; they slide
back while the view is flat again at the end. Issue #451.

Method from the perspective-illusion skill in github.com/dotslashsimran/simcraft (no licence: ideas only, none of its code,
templates or cutouts). Everything here is ours: three.js r160 (MIT, `js/lib/`).

## Files

- `js/story.js`: the camera keys and the moving objects, pure functions of t. A shot is { F focus point, W width framed at F,
  fov horizontal lens, yaw, el, sy lens shift }. Holding W while the fov changes is the dolly zoom; the lens moves in
  log(tan(fov/2)). Keys sit on the song's beats (107.7 bpm).
- `js/world.js`: the town (shops, the hall, the lot and van, lamps, trees, mountains) and the cases, queue and piano.
- `js/kit.js`, `js/merge.js`: every static part is a world-space geometry with a part id; parts merge into one mesh per
  material for colour and one mesh with a pid attribute for the ink pass (a few dozen draw calls in all).
- `js/main.js`: two-tone MeshToon shading, hatching only inside cast shadows (world-anchored lines that fade to a flat tint
  when they get denser than about 3 px), warm lamp pools in the shader, ink from part-id and normal edges so the line weight
  doesn't change with distance, and 5 to 32 jittered sub-renders per frame (anti-aliasing plus a 180-degree shutter, the
  count chosen from how far a few probe points move on screen).
- `render.mjs`: frames from headless Chrome (Metal), `FRAMES=0-299 OUT=out/frames node render.mjs`. About 0.3 s a frame on
  this Mac.

## Making the cut

```bash
OUT=out/frames2 FRAMES=0-299 nice -n 10 node render.mjs
ffmpeg -framerate 30 -i out/frames2/f%04d.jpg -ss 41.97 -t 10 -i work/song.mp3 -af "afade=t=in:d=0.12,afade=t=out:st=9.75:d=0.25" -c:v libx264 -preset slow -crf 18 -maxrate 6M -bufsize 12M -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart out/perspective-illusion_test01c_720p.mp4
```

`work/song.mp3` is a copy of `bobwiseman-10000-miles/source/10000-miles.mp3` (sha256 0cc9dd22bb8213d5...), gitignored.

## Checks done on test 01c

freezedetect (0.4 s) and blackdetect find nothing; frame 299 against frame 0 differs no more than two neighbouring frames
do, so the seam holds. Stills checked at full size at every key. Not done: the simcraft blink map, and a listen with picture.
