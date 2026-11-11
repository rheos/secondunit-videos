# Bob Wiseman: next shows end card

A 6 s drawn card with Bob's next shows, made to go on the END of a reel he was going to post anyway. His own phone
reels are what his followers like (Nov 2026: house concert 23 likes, street selfie 19; our designed tour plate 4), so
the reel carries the attention and the card carries the dates. Issue #492.

## What it is

One pen-and-pencil admission stub per show: the date on the torn-off end in the month's colour, then venue, city
and billing. Title "Bob Wiseman", "next shows, <span>", "tickets at bobwiseman.ca", and the Fifty-three Nights strip
from the sea to the mountains along the foot. Same pen, pencil, paper and Hershey lettering as
`indieagent-diagram-plate` (`js/hand.js` is that project's, with the page-size line; `js/card.js` reuses its
helpers). Drawn in by 2.6 s, held to 6 s. Up to five stubs; their height shares the space down to y 1490.

Layout rules (1080x1920 units): every word between y 300 and 1580, the band a feed's 4:5 crop keeps and above the
Reels caption; stubs end at x 950, clear of the Reels buttons. The Hershey faces are ASCII, so an accented letter is
set as its base letter plus a pen acute (`wordsA` in `js/card.js`): "Séguin" reads right.

## Data

`tools/next-shows.mjs` reads `_in/shows.json` (gitignored: `list_shows` from the IndieAgent artist agent MCP,
workspace bob-wiseman, saved as `{ shows: [...] }`) and writes `data/shows.js`: booked shows only, and only the
fields his public tour page shows (date, venue, city, region, billing). Fees, contacts and holds never leave `_in/`.
`data/extra.json` adds what his public page has and the DB doesn't (Dec 4 Toronto: "solo", no venue). Check new
dates against https://bobwiseman.ca/?page_id=2305 before a card goes out; the 2027 BC rows have no venues yet.

## Make a card

```bash
tools/blueprint-kit/sync.sh bobwiseman-tour-card          # from the repo root: kit/ (Hershey, diagram.js)
npm install                                               # playwright, uses the installed Chrome
node tools/next-shows.mjs --from 2026-11-12 --to 2026-12-31
node check.mjs 6                                          # words in containers, nothing touching, contrast
node ../tools/motion-lab/render.mjs "card.html?w=720" 0 6 out/tour-card_<span>-pic_f00000-f00144_24fps.mp4 --width 720 --height 1280 --workers 3
ffmpeg -i out/tour-card_<span>-pic_f00000-f00144_24fps.mp4 -f lavfi -i anullsrc=r=48000:cl=stereo -map 0:v -map 1:a -t 6 \
  -c:v libx264 -profile:v high -crf 20 -maxrate 4.5M -bufsize 9M -pix_fmt yuv420p -color_range tv -g 48 -keyint_min 48 \
  -sc_threshold 0 -movflags +faststart -c:a aac -b:a 128k -ar 48000 out/bob-wiseman-next-shows_<span>_9x16.mp4
node still.mjs 6 --w 1080 --out out/still1080            # the Stories still
```

The encode is Reel-safe (standard range, a keyframe every 2 s) and carries a silent stereo track so it splices
cleanly after a clip with sound in Instagram's editor. Open `card.html?play=1` to watch it draw.
