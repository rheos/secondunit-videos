# Clap Hands, cut-paper peacock: where it stands (2026-10-15, draft 3)

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
