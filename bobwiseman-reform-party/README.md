# Bob Wiseman: The Reform Party at Burning Man (feat. Serena Ryder)

Bob's next video, named on Messenger 2026-10-14 ("I look forward to this after current pieces conclude"), so it
follows You Don't Love Me, Libelous and Giulietta. Issue: rheos/secondunit-videos#128.

- Song: "The Reform Party at Burning Man (feat. Serena Ryder)", Bob Wiseman. YouTube Topic upload -NW6auOgBNE.
- Clock: `source/reform-party.wav`, 48 kHz stereo, 268.99 s, sha256
  `1505e0c8b87061f6bc0e53fa3df4fb2a8ffa622273b65332ab342c04b584cd09`. 24 fps grid, 6456 song frames. From the
  YouTube audio stream; ask Bob for the WAV before a final.
- Vocal stem: `source/stems/vocals.wav` (Demucs 4.0.1 htdemucs, two stems).
- Words: `source/reform-party.lyrics.txt` is Bob's paste (Messenger 2026-10-14 11:04) with line breaks restored by
  phrase. `source/lines.json` is the timed contract. Audio, stems, lyrics and anything quoting them
  (`js/gen/`) stay out of git.

## What the song is about

Bob (Messenger): he has never been to Burning Man; the title is a metaphor. When the Conservatives won their
majority (Harper, May 2011) he thought they were giddy with power. The lyric lists what followed: federal
scientists
gagged, "no facts without spin", tough-on-crime soundbites and more jails, wars and military spending, a muzzled
press, the paid G20 police (Toronto 2010).

Staging rule: allegory, not portraits. The party is a crowd of suits with rosettes and round faceless heads, and its
effigy (a suit on a scaffold, arms up) is the Man. No real politicians, no party logos or names on screen beyond the
song's own words, no real people's likenesses. The playa is the stage: camps, art cars, fire spinners, the burn.

## Look tests (round 1, 0 credits, code-drawn, 720p)

| Look | Page | Section | Captions are |
|---|---|---|---|
| A risograph festival zine | `looks/riso.html` | intro + verse 1 (sheet lines 0-3) | blue caps on a pink strip, the sung word knocked out |
| B newspaper editorial cartoon | `looks/cartoon.html` | verse 2 (lines 4-6) | the cartoon's italic caption under the ruled panel |
| C the playa at night in neon | `looks/neon.html` | middle stanza (sung lines 14-19); v2 adds art cars: El Pulpo Mecanico, a galleon, a Cheshire Cat car that leaves its grin (refs in source/refs) | neon script flickering on at each onset |
| D Victorian toy theatre | `looks/theatre.html` | last stanza (lines 17-20) | the playbill strip under the stage |

Little Bob with his piano and Junos (Bob 2026-10-11: in every video) walks across the playa in A's intro, printed
on his card and tinted to the zine, and crosses the toy-theatre boards as a cut-out at the end of D.
`js/common/little-bob.js` holds him (drawing copied from You Don't Love Me's outro, itself copied from Satisfied
Mind); any look calls `LITTLE_BOB.draw(g, t, {tIn, tOut, y, h, stop, beats, mode, grade})`.

Every look is a pure function of song time. Shots key off line starts in `js/gen/lines.js`, so a better timing file
moves every cue.

## Look E: the boardroom art car on a Dali playa (draft 1, 2026-10-16)

Bob on look tests 2: "I am not liking these so far." Robin's new direction, built straight to a full draft: the
boardroom art car (from a real car Robin saw at Burning Man; never name a camp) on a Salvador Dali-style playa, because
"burning man really feels like a dali painting". Dali is inspiration only, no copied paintings.

- Page `looks/dali.html`, code `js/dali/main.js`. One 3D world through a pinhole camera: the shot list `SH` is camera
  offsets from the car, and each entry is a move, so nearly every change of shot follows the table through one place.
- The car: a mahogany table covers the whole car (a red skirt hides it); the driver's red hat shows in a hole in the
  middle; seven suits sit on beams out past the edge, propped on crutches. Speakerphone and whiteboard soften through the
  day and hang over the edge. One suit (back row, centre) is a torso of drawers.
- Beats: gavel on "law"; tape across the speakerphone on "can't speak"; tape recorders into the drawer; a beige blind
  rolls down over the blue sky on every "control the blues"; papers wilt over the edge on "news"; grins on "grin"; the
  table spins on "spin"; chart bars become cell bars on "crime"; rings and a bite on "soundbite"; a cloth lifts off model
  cells on "unveiled" and cells on stilts rise on the playa on "jails"; bridge: dime, poor person with a bowl, truth in
  the drawer, chip stacks, wilting boom mics, pie, Little Bob up through the hole on "little big guy", a book, chessboard
  table with knight and rook, riot shields paid in coins, everyone nodding as one on "rehearsed". Outro at night: the
  charts burn, the board votes with both hands, the Man burns and falls, the table rolls off into the dark, and Little
  Bob crosses in front of the embers.
- Render: `PAGE=looks/dali.html node render.mjs 0 268.99 out/rp_dali-v1_720p.mp4 4 24 0.6667` (~13 min locally).

## Commands

    python3 tools/make_lines_js.py                      # source/lines.json -> js/gen/lines.js
    PAGE=looks/riso.html node check.mjs out/sheet.jpg 3 8 12   # contact sheet
    PAGE=looks/riso.html node render.mjs <t0> <t1> out/x.mp4 4 24 0.6667   # 720p review

### Draft 2 (2026-10-16)

Robin's notes on draft 1: the real car's chairs were low enough to hop on and off without help, and there were more of
them; the playa was too sparse for Burning Man. Draft 2 (https://youtu.be/ldst6ELsCkM): table top 1.15 m, seats 0.65 m,
14 suits; camps, lamps, bikes, crowd, fire spinners; lyric installations from the Gilliam / Von Ulrich / Nakamura
audit in `AUDIT-dali-v1.md` (three.js not needed: the renderer is already a 3D camera).

### Draft 3 (2026-10-16)

The revision loop on draft 2: four section critics, a film critic and a guest pass (Gilliam, Von Ulrich, Nakamura),
merged in `AUDIT-d2.md`; Robin picked all three passes; seven builders in sandboxes, one per file (camera.js;
car.js; table.js; playa.js; installs.js; world.js + burn.js + camera-end.js; bob.js + render.js). What changed per
audit item and the known issues are at the end of `AUDIT-d2.md`. Rendered on GitHub
(`tools/cloud-render/cloud-render.sh --draft`, 250 s): `out/rp_dali-v3_720p.mp4`. Captions use Newsreader Italic
from `fonts/` (OFL) so the cloud render matches the Mac. Not uploaded yet; waiting on Robin's OK.
