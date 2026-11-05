# Tour piano (look test)

An upright piano in April Zhu's Colorfigures engine (MIT, `js/LICENSE-colorfigures.txt`, `js/core.js` unchanged) with Bob
Wiseman's booked shows as sheet music on the music desk. Issue #409.

Never a player piano. Bob is a pianist, and a piano that plays itself removes him (Robin, 2026-11-04). Nothing here moves or
sounds until someone presses something.

## What it does

- One white key per show, in date order from C1: the tour runs left to right along the keyboard and climbs C major. Pencil
  brackets on the fallboard mark each month's keys.
- Press a key or a note on the score: the key goes down, the hammer hits the string, the date and city show, the score turns
  to that month. Holding the key keeps the note ringing; letting go drops the damper. Other keys play with "Day off".
- A cancelled show is a key that goes down with no note, and its note is crossed out on the score. No current show is
  cancelled; test it with `?cancel=Nelson`.
- See-through shows the action per note: key lever, wippen, hammer, damper, string, plate, soundboard, pedal rod.
- The score is written at the pitch each key plays: treble or bass clef and an octave mark chosen for each system.
- The sound is synthesised in `playNote` with Web Audio, three strings per note. It starts only on a press.

## Running it

Open `piano.html`. It reads `work/shows.js`, a snapshot of the org DB, which stays out of git: refresh it from the IndieAgent
MCP `list_shows` (workspace `bob-wiseman`) in the format at the top of the file. `out/tour-piano_test01.html` is the same page
as one file, built by inlining the three scripts.

`./shots.sh <outdir> "yaw=20" "hit=44" "xr=1&labels=1"` takes stills. URL params: `yaw`, `pitch`, `page`, `hit` (key 0-87, frozen
mid-strike), `cancel`, `pedal`, `xr`, `labels`, plus the engine's `press`.

## Known limits

On a phone the keys are about 3 px wide, too small to pick one with a finger, so a phone viewer uses Next show and the notes on
the score. Most of the BC dates have no venue yet, so the card says "Venue to come". The credit link to Colorfigures stays on
the page.
