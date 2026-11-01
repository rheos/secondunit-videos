# Beat sync

Watch a code-drawn element act on the music over the film's real picture, and set its hits on a 16th-note grid with
the mouse. Robin made the Reform Party chattering teeth with it on 2026-10-21 ("this was a really solid tool"), after
taps alone and stem detection both came up short.

Use it when an element has to hit something in the song that detection can't find on its own: a backing voice under
the lead (the "buh buh buh"), a horn stab, a drum fill. Robin hears the part; the page lets him place it on the grid
and see the result at once, without a render in between.

## What Robin sees

- A run button for each passage. Each one plays that stretch of the song with the picture, and the element is drawn
  live on top by the same code the film uses.
- The beat grid under the picture: one cell per 16th note, a thin line on each beat, a thick line on each bar. Gold
  cells are hits. Click to add or remove one; drag to paint several in or out; click the ruler to jump.
- Space plays and pauses. Speed 1, 0.75 or 0.5. Reset puts the run back to where it started. "Run earlier/later by a 16th" moves every hit in the run one cell, for a run that feels late or early as a whole.
- His edits save in the browser as he goes. Claude reads them off the page (`window.BEATSYNC_CELLS`), or he presses
  Copy cells.

## Setting it up for a new project

1. **The grid.** `python -I tools/beat-sync/grid.py grid <song.wav> <project>/js/beat-grid.js --downbeat <s>`.
   Pick a downbeat you can hear, such as where the part starts, so the bar lines land right. Check that the median
   step it prints matches the tempo: one 16th is 15/bpm seconds.
2. **The audio clips.** Cut one per passage, starting a second or two before it:
   `ffmpeg -ss <off> -t <len> -i song.wav -q:a 2 assets/runN.mp3`.
3. **The picture clips.** Render the same spans WITHOUT the element, so the live drawing isn't doubled. Make a copy of
   the look's page that leaves out the element's scripts, and render each span on the cloud:
   `tools/cloud-render/cloud-render.sh --draft <project> looks/<look>-noX.html <off> <off+len> <project>/assets/runN.mp4`.
   The clips come back silent; the page plays the audio clip and keeps the video in step with it.
4. **A config** (`<project>/beat-sync.config.js`) that sets `window.BEATSYNC`:
   - `title`, `storageKey`
   - `scripts`: the element's code and its helpers, in load order
   - `runs`: `[{off, len, audio, video, label?}]` in song seconds
   - `step`: the 16th length
   - `grid()` / `ref()`: the grid times and the downbeat index
   - `initialTimes()`: the hits to start from (taps, detection, or the current film)
   - `setTimes(times)`: hand the edited hit times to the element's code
   - `draw(ctx, t)`: draw the element at song time t on a 1920x1080 canvas (`width`/`height` to change that).

   `bobwiseman-reform-party/beat-sync.config.js` is the worked example (on branch reform-party-d29 until PR #262 merges).
5. **Serve the repo root** with a server that supports range requests, so the timeline can seek. Python's
   http.server can't: the audio restarts from 0:00. Then open
   `/tools/beat-sync/beat-sync.html?c=/<project>/beat-sync.config.js`:
   `npx -y http-server@14.1.1 <repo> -p 8768 -a 127.0.0.1 -c-1`.
6. **Back into the film.** Turn the cells into times with
   `grid.py times <grid.js> cells.json --snap <vocals.wav> <no_vocals.wav>`. Each hit moves to the strongest onset
   within 20 ms, so the rhythm stays even. Then write them wherever the element reads its times. Reform Party does both
   steps in `tools/buh_onsets.py --slots`.

## What we learned on the teeth

- Stems couldn't place the phrase edges. Every 16th had a drum onset as strong as a buh.
- Taps were right in shape but wobbled a 16th or two either side, with no constant lag to subtract.
- Lining the taps up with the bar structure got close.
- Painting the grid while watching got it right.
- Start the page from the best guess you have, so Robin edits rather than builds from nothing.

## Letting the client use it

The page runs from any static host, so a client can use it from their own review folder (Bob, 2026-10-22):

1. Copy beat-sync.html, a config, the element's scripts and the run clips into one folder and upload it under the
   client's drop folder as `<folder>/sync/` (wrangler r2 object put with the right content types and `--cache-control no-cache`; the bucket serves
   byte ranges, so seeking works). Without no-cache the Worker sends no cache header, Chrome keeps the first copy it
   saw, and a fixed page never reaches anyone who opened the old one (2026-10-22: the tool "worked in the side panel
   but not in my Chrome"). Paths in the config are absolute from the host root (`/<folder>/sync/...`).
2. In the config, `intro` replaces the instructions with plain words for the client, `storageKey` keeps their edits
   apart from Robin's, and `send: {url: '/<folder>/review', round, prefix, done}` adds a Send to the studio button.
   It posts the grid as a note on that round with the same fields as the review page's note form, so it pings the
   studio group like any note. The note lists the hits as cell ranges ("Grid: 225-237,242-253,...").
3. Link it from the round's description with `[label](/<folder>/sync/beat-sync.html?c=config.js)` (novadiem-files #83).
4. Turn the note's ranges back into a cells JSON and run the project's converter (Reform Party: tools/buh_onsets.py --slots).

The drop expires objects after 30 days, so re-upload if a round stays open longer. Worked example:
bobwiseman-reform-party/beat-sync.bob.config.js (on branch reform-party-d29 until PR #262 merges).
