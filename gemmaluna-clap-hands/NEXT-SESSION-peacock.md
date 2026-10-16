# Clap Hands, cut-paper peacock: where it stands (2026-10-16, draft 4)

Read this first, then `STORYBOARD-peacock.md` (local only, gitignored) for the look bible, the four-chorus arc
and every hand-off.

## Done

- Full song built, 11.0-197.0: `peacock.html` + `js/peacock/` (kit, registry, nouveau, props, shots.js for
  verse 1 + chorus 1, s00-intro, s03-verse2, s04-engine, s05-avenue, s06-clock, s07-stars, s08-theatre,
  s09-dawn, s10-letgo). `js/data.js` (local, gitignored) supplies the beat grid.
- Robin's notes applied: hands only visit for their clap and every repeat adds more or different hands; each
  chorus uses hands in a new way (catches on / engine / time and stars / letting go); every scene change is a
  match cut on one element (see the storyboard table).
- Full draft v1 rendered: `out/peacock/gmc-v2_peacock-cutpaper-full-v1_f00264-f04728_24fps_review-720p.mp4`
  (720x1280, 186.0 s, 4464 frames, 35 MB). Scan: no bad frames besides the 1.5 s fade from black. NOT uploaded.
- Code pushed to branch `clap-hands-peacock`, draft PR rheos/secondunit-videos#141 (issue #140). The commit
  worktree is in this session's scratchpad (`.../scratchpad/wt-gmc`); make a fresh one if it's gone.

## Full draft 1 (2026-10-15)

`out/peacock/gmc-v2_peacock-cutpaper-full-v2_f00264-f04728_24fps_review-720p.mp4` = v1 with the avenue (smooth
pans) and theatre (living spotlight) spans re-rendered and spliced in. Scanned: no bad frames besides the fade
from black, no frozen runs, seamless splices; all 14 hand-offs checked on a contact sheet. Uploaded unlisted as
"Clap Hands, cut paper peacock, full draft 1": https://youtu.be/GGcq57B5QZM (link sent to Telegram).

## Full draft 2: Mark Von Ulrich as guest director (2026-10-15)

Robin brought Mark in on draft 1: thinking only (the film keeps its cut-paper look), the whole film, and asked for
all eleven of his picks. Proposals and the protect list: `MVU-DIRECTION.md` (local only). Built and rendered:
`out/peacock/gmc-v2_peacock-cutpaper-full-d2_f00264-f04728_24fps_review-720p.mp4`. Scanned clean, flash check
PASS (worst 2.5/s), no frozen runs, before/after vs draft 1 at the 11 changes plus 6 protected moments
(unchanged), lamp hand-off rechecked. Uploaded unlisted: https://youtu.be/V9xNFu7ooiM (Telegram sent).
Waiting on Robin's notes.

## Still open

- Gemma Luna's consent is not on record; unlisted review only.
- Not watched end to end with sound yet; claps were checked on contact sheets at their frames only.

## Audit of draft 2 (2026-10-15) - START HERE for draft 3

`AUDIT-d2.md` (local only): Robin's notes on top (errors still to list, more engaging, more Art Nouveau, NOT Deco),
the themes, the merged protect list, the fix plan (pass 1 PATCH, pass 2 RETHINK) and every finding. Draft 2's code is
frozen at commit 40e5251 for side-by-side checks.

## Full draft 3 (2026-10-15)

Both passes of the audit plan, built in one go (Robin: "the errors, reads and Art Nouveau first, then the
engagement and camera rethink"). Code: commits 78fd761 and f8c1805 on `clap-hands-peacock` (the render matches f8c1805 exactly).

- Errors: horseshoe hangs the hard-luck way (open end down); last chorus cuts to the sun 0.8 s before clap 1 so
  the pair rises; every shot draws on ones (no camera judder); steamers, theatre props and the rowboat move in
  instead of popping; no stair "E"; no rain inside the tram; hands kept inside the border; hatch-to-avenue moon
  matched; waterfront to deck is a match on the lamp; flashes capped at .4.
- Reads: calyx iron hands with lily buds, a crowd under a night sky with a moon head, whiplash lightning to the
  river, a visible storm moon, an S-necked heron on a real lamp, a mirrored soot print, a flat street clock with a
  hole, a legible bowler, pistol grip, helmet with banknote, crook cane, footprints, star-and-line constellation
  hands, a hand-shadow dog, a bentwood chair, a coiled tuba, sun-paper corona sleeves.
- Nouveau: a living Mucha border on every frame (mosaic band, plants that bloom on each chorus), whiplash quill
  rays instead of straight Deco rays, a per-scene halo ornament (lace, rose, peacock, zodiac, poppy, sunflower),
  a real Guimard Metro, Horta stair, Tiffany/Gallé glass, Nouveau facades instead of grids.
- Engagement: per-clap framings in choruses 2-4 matched on their shared disc, punch-ins on the key word of
  every vignette, objects on thirds, a camera plan for the dawn, the Milky Way clap at twice the size.
- Light arc: night behind the chorus 1 crowd, a cold moonlit clock, the climax brightens to gold.
- Climax: the sun becomes an open Nouveau hand rising from the river (the Metro's iron-hand drawing), the
  hand-bird flies into its palm, the light fills the frame.
- Payoffs planted: rowboat among the steamers, horseshoe back right way up on the boat at dawn, heron leads the band.

Not changed, for Robin's ear: three claps may land 4-5 frames early by the vocal stem (video 1:15.8, 2:57.9,
3:01.9 = song 86.8, 188.867, 192.933). Robin's own error list from draft 2 has not arrived yet; fold it in when
it does.

Rendered locally (the last full local render: future ones go through `tools/cloud-render`, see issue #155 for 9:16):
`out/peacock/gmc-v2_peacock-cutpaper-full-d3_f00264-f04728_24fps_review-720p.mp4` (720x1280, 186.0 s, 4464 frames,
45 MB). Scanned: no bad frames besides the fade from black; flash check PASS (worst 3/s at 1:02.6, the engine clap,
right at the limit); no frozen runs except a 1.6 s near-hold at 2:18.1-2:19.7 (the spotlight resting on the jeans
before the "pistol" punch-in, the rail still swaying). Before/after vs draft 2 on 32 matched frames: every change
lands as listed, nothing protected got worse. Worth a look: in the theatre the lace roundel on the backdrop sits
behind the jeans and the helmet, so the spotlit props read against a busy disc. Uploaded unlisted:
https://youtu.be/ywgJqjnEjJ4 (Telegram sent). Waiting on Robin's error list and notes.

## Audit of draft 3 (2026-10-16) - START HERE for draft 4

Robin had no error list for draft 3 and asked how to find improvements. He chose a cold audit, the three known fixes,
and a Terry Gilliam guest pass. `AUDIT-d3.md` (local only): themes, merged protect list, a three-pass plan for draft 4,
and the five critics' reports. `GILLIAM-DIRECTION.md` (local only): one proposal per section, the stiff thing is
official time, top 5 picks (clock weight on "time", the overspeeding governor, always another millionaire, the moon's
pips become stars, the bowler flies off as a bird).

Already in the code for draft 4 (checked on short local renders in `out/peacock/d4-check/`): claps 8, 15, 16 moved onto
the sung onset (86.958, 189.042, 193.042); the theatre roundel sinks into the dark after the shadow play; a lighter,
slower gold wash at the furnace match cut (confirm with the full-film flash check). Draft 4 renders through
`tools/cloud-render/cloud-render.sh --draft --tall` (PR #159 merged), not on the Mac.

### Draft 4: scope decided, build paused (2026-10-16)

Robin chose ALL THREE passes from AUDIT-d3.md: the patch pass, the layout rethink, and Gilliam's top 5 plus the
helmet-and-banknote pair (6A + 9A). Render through `tools/cloud-render/cloud-render.sh --draft --tall`. He paused
before the build started; nothing beyond commit 5f888f1 is in the code.

Planned build: parallel builder agents in the main checkout, one per file group, none touching another's files, no
commits or full renders by builders (contact sheets only, `node check-peacock.mjs <out.jpg> t1 t2 ...`, song time):
1. shared: `nouveau.js` (border tesserae ordered between gold rules, stems 8-10 px, shoulder blooms on choruses;
   `rays()` at full opacity in gold, not muddy goldDeep) and a new `calyxHand()` that both the Metro and the sun-hand use.
2. 0:00-0:46 `s00-intro.js`, `shots.js`: Metro calyx hands opening on the flicker, motion hook, Guimard arch and
   cartouche, bud glow, calyx lantern, horseshoe framing, keyhole windows, clap 2 framing, crowd arms, halo luma <=130.
3. 0:46-1:19 `s03-verse2.js`, `s04-engine.js`: the 0:55.9 flash and pink wash, window "V", bolts, rowboat, heron,
   furnace layout, always-another-millionaire (Gilliam 4A), engine clap setups with the machine in view, clap 3
   regression, the governor (5A), Horta stair.
4. 1:19-1:58 `s05-avenue.js`, `s06-clock.js`, `props.js`: pistol, helmet, footprints, helmet swallows the note (6A),
   clock shine, cold wash, drift to a third, hands not meeting early, the clock weight on "time" (7A), street clock,
   rowboat read, twelve-clap framing, zodiac glyphs.
5. 1:58-2:12 `s07-stars.js`: Milky Way hands, chorus framing, constellation hands, the moon's pips become stars (8A).
6. 2:12-2:34 `s08-theatre.js`: dog, spill light, chair, seat, plume, jeans contrast, helmet spits the note (9A).
7. 2:34-3:06 `s09-dawn.js`, `s10-letgo.js`: grinning town, sun inside the arch, sweep, boat pop and rim, horseshoe,
   heron, sun on a third, sunflower corona, climax sky gold, last pair size, calyx sun-hand, hand-bird <=40%, ring
   round the sun, the bowler flies off as a bird (11A).
Then: review every section on sheets, cloud render, scan + flash check + before/after vs draft 3, upload unlisted.

## Draft 4 built (2026-10-16) - START HERE

Robin took the work back from the takeover session and picked seven parallel builders. Each worked in its own copy
of the page (`out/d4/b1..b7`, local) and owned its own files; the coordinator merged them, checked every hand-off on a
sheet, and committed 35e8696 on `clap-hands-peacock`. Brief and builder map: this session's scratchpad (`d4/BRIEF.md`,
`d4/AGENTS.md`); the builders' reports are summed up in the commit message.

- b1 shared kit (`nouveau.js`): `calyxHand(x, y, sc, open, o)` (anchor = wrist, palm centre 0.5 above, returns
  {x, y, r}; skins 'iron' and 'gold'), used by the Metro, the tram piers, the quay lamp and the sun-hand; the ordered
  Mucha border; rays() now opaque gold (alpha = reach, not opacity); soot hands and print.
- b2 intro + chorus 1 (`s00`, `shots.js`): hook from frame 1 (`beatClock`), Guimard arch + METROPOLITAIN plate, calyx
  lamps, calyx lantern, whole horseshoe, glazed windows, "bottle" punch, crowd arms, `HALO_NIGHT` (also used by s03).
- b3 storm + engine (`s03`, `s04`): no 0:55.9 flash, bolts, rowboat, heron plumes, furnace on a third
  (`furnaceFire`), 4A top hats, per-clap engine setups, 5A governor, Horta stair. Storm quills removed.
- b4 avenue + clock (`s05`, `s06`, `props.js`): revolver grip, great helm with `helmet(s, note, jaw, swallow)` and 6A,
  `banknote()`, shoe prints, `clockFace(..., pips, lit, haloR)` with zodiac roundels, cold teal tower, 7A weight and
  see-saw, street clock with a real hole, bigger twelve clap.
- b5 stars (`s07`): per-clap moon framings, star-and-line hands, 8A hour marks to stars, Milky Way hands.
- b6 theatre (`s08`): hand-shadow dog, bentwood chair, no spill, 9A note spat onto the top hat. `GRIP = false`.
- b7 dawn + last chorus (`s09`, `s10`): no faces, `dawnCorona()` sunflower, climax held gold, 11A bowler bird,
  calyx sun-hand at sc 420, the 165.0 boundary 40 px offset fixed.

**Draft 4: https://youtu.be/URVy7QmfzRE** (unlisted, Telegram sent), `out/peacock/gmc-v2_peacock-cutpaper-full-d4_...mp4`.
Scanned: 4464 frames, 186.0 s, only the 2 head-fade frames flat, no frozen runs, flash check PASS (worst 2.5/s at 1:31.5);
before/after vs draft 3 at 24 protected and 16 changed moments (`out/peacock/d4-protect-1/2.jpg`, `d4-changed.jpg`): no
regressions. Waiting on Robin's notes.

Rendered on GitHub (270 s for 20 slices) with `tools/cloud-render/cloud-render.sh --draft --tall` from a throwaway worktree at origin/main
(the shared checkout's main is old and has other sessions' edits: never pull there). Copy peacock.html, js/data.js,
js/peacock/ and assets/song.wav into that worktree's project folder first.

Known, not fixed: the intro sky's teal quills read a bit like a web; the last chorus stays centred (every framing there
is a clap); one spin frame at 118.58 shows both clock hands near twelve.

