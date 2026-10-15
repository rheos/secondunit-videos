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
| C the playa at night in neon | `looks/neon.html` | middle stanza (lines 7-11) | neon script flickering on at each onset |
| D Victorian toy theatre | `looks/theatre.html` | last stanza (lines 17-20) | the playbill strip under the stage |

Little Bob with his piano and Junos (Bob 2026-10-11: in every video) walks across the playa in A's intro, printed
on his card and tinted to the zine, and crosses the toy-theatre boards as a cut-out at the end of D.
`js/common/little-bob.js` holds him (drawing copied from You Don't Love Me's outro, itself copied from Satisfied
Mind); any look calls `LITTLE_BOB.draw(g, t, {tIn, tOut, y, h, stop, beats, mode, grade})`.

Every look is a pure function of song time. Shots key off line starts in `js/gen/lines.js`, so a better timing file
moves every cue.

## Commands

    python3 tools/make_lines_js.py                      # source/lines.json -> js/gen/lines.js
    PAGE=looks/riso.html node check.mjs out/sheet.jpg 3 8 12   # contact sheet
    PAGE=looks/riso.html node render.mjs <t0> <t1> out/x.mp4 4 24 0.6667   # 720p review
