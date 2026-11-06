# Gemma Luna "Clap Hands" video: history

Moved verbatim from the IndieAgent memory `gemmaluna-clap-hands` on 2026-10-31. Current state and standing rules stay in that memory.

**Direction (2026-10-01):** no character, scenes only; 9:16 first. Robin liked junkyard collage or
watercolour bleed. Project `mv-projects/gemmaluna-clap-hands` (rheos/gemmaluna-clap-hands, archived 2026-10-04; now a folder in rheos/secondunit-videos, see `secondunit-product` (IndieAgent memory)), fresh
plumbing, no Hjeron code (fresh-direction-per-video (video-production skill)). Two probes of 37.7-56.0 s uploaded unlisted:
watercolour https://youtu.be/wSYmciv4t2g, collage https://youtu.be/Rtncca4vNvs. Collage renders are big
(68 MB per 18 s at crf 17; per-frame grain); upload a crf 24 review encode, the full one timed out and
left three stuck "processing" entries on the channel (cp8cI61awR8, mErnOyh-6jg, sEWRhG3HsNE).
The first 7 s of the master is the previous song's tail; "Clap Hands" starts singing at ~26 s.

**Art Nouveau (2026-10-01):** after the two probes Robin said the paint style is still better, and that
Gemma Luna "is really into art nouveaux style". Third probe: Art Nouveau on the brushstroke renderer
(vendored into the project as js/paint.js, MIT): Guimard ironwork and lily-bud lamps, Galle-style
bottle, stained glass, Mucha halos and border, heavy umber contours, no figure.
https://youtu.be/jpgHeO69AOs; v2 profile hands https://youtu.be/jsp6t7PgkUg, v3 three key drawings per clap https://youtu.be/PTHUQ-Chp0U. This is the current front-runner.

**Full draft v1 (2026-10-01):** Robin approved the three-key-drawing hands and said hands need not be on
screen all the time; "go ahead with the rest of it". 11 chapters (c00-c10) painted by five parallel
painter agents from ANIMATION_GUIDE.md + a gitignored STORYBOARD.md; c02 is the probe. Journey: rooftops
> Metro > night tram > window + chorus 1 > storm river + coal steamer > boiler room > avenue of dreams >
clock tower > starry sky > empty theatre > dawn river > last clap, fading to gold at 186. Hands only on
chorus 1, CLAPS[7] (86.8) and the last two claps. Song registered in the catalogue as `gmc`; output
`out/gmc_nouveau-full-v1_f00000-f04464_24fps_composite.mp4` (1 GB, crf 17) plus a crf 27 review encode
(247 MB) that uploaded fine: https://youtu.be/zNeaEQja7mY
**v2 (2026-10-01):** Robin: the first 11 s of the master are still the previous song, so the video starts
at 11.0 (song frame 264; `SEC.start` in core.js) with a 1.5 s picture-only fade from black
(`render.mjs ... 1.5`). 2:55 long. https://youtu.be/rUGKyXGlqIs
**v3 (2026-10-01):** master v2 (`gmc-v2`, 197.0 s) runs to the song's real end. MEASURED: master t=0 =
YouTube 6:41.02 of the set (the yt-dlp section started ~10 s before the asked 6:50; I first assumed it
hadn't and gave Robin a wrong time table). Video = master 11.0 to 197.0 = YouTube 6:52 to 9:58 (Robin's
numbers). 16 claps; c10 has four. Robin then clarified "no characters" meant no Gemma: the song's
characters may come in (`no-performer-not-no-characters` (IndieAgent memory)).
**v4 (2026-10-01):** the song's cast added via a shared kit `js/cast.js` (Lautrec-style rig, ten characters,
turnaround `cast.html`); the rowboat to heaven carries the cast (conductor at the bow with the lantern,
the whole crowd by dawn). Last clap turns into a hand-shadow bird that flies off into the sun (just the
hands, no wrists). First 720p draft (`render.mjs ... 1.5 0.6667`): https://youtu.be/u8W_bUnjd4o

**Full song, 2026-10-15 (START HERE: the project's NEXT-SESSION-peacock.md):** Robin liked v2's direction and
asked for more variation as the song goes on, plus In Her Dream-style match cuts (`transitions-follow-an-element` (IndieAgent memory)).
Built 11.0-197.0: four choruses with different hands (catches on / engine: white gloves, soot hands, both together,
brass row / time and stars: clock hands meet at twelve, constellation hands, Milky Way / letting go: birds, last pair
becomes a bird into the sun), every scene change a match cut. Full draft v1 rendered locally (720x1280, not uploaded);
two fixes (smooth avenue pans, living spotlight) patched in the same day. **Full draft 1 uploaded unlisted:
https://youtu.be/GGcq57B5QZM** (2026-10-15, Telegram sent), awaiting Robin's notes. Branch clap-hands-peacock, draft PR #141.

**Draft 2, Mark Von Ulrich as guest director (2026-10-15):** Robin brought Mark in on draft 1 (`mark-von-ulrich-reference` (IndieAgent memory)):
thinking only (cut-paper look kept), whole film, and took all eleven picks (iron hands holding the Metro lamps, conductor
built from his tools, crowd as one many-armed body under the halo, coal-heap millionaire shovelling himself, the boiler
clapping with its piston arms, one travelling bowler, street clock round the hole, rowboat held in the Milky Way clap,
the theatre's front row of leftovers with the light finding the bowler's seat, ladder of light into the sun, the sun
becoming an open hand). Proposals in the project's MVU-DIRECTION.md (local). **Draft 2: https://youtu.be/V9xNFu7ooiM**
(unlisted, Telegram sent), awaiting notes. PR #141.

**Audit of draft 2 (2026-10-15):** Robin: "i see some errors" (his list not sent yet), "needs development to make it more
engaging", "more art nouveau influence" (he typed "art deco" first and corrected it: Nouveau, NOT Deco). Technical pass
plus four cold section critics and a film-level critic: the project's AUDIT-d2.md (local). Headlines: horseshoe hangs the
lucky way up; last-chorus clap 1 pops in; camera judder in on-twos shots; 29/37 framings centred; choruses 2-4 don't
escalate in framing; the climax goes darker; straight sunburst rays and dotted halo read Deco. Protect list in the audit
(the clock hands meeting at twelve is the best clap). Fix plan: pass 1 PATCH (errors, reads, light arc, Nouveau
surface, living Mucha border), pass 2 RETHINK (camera/layout, punch-ins, per-clap setups, Guimard/Horta architecture).

**Draft 3 (2026-10-15/16):** both audit passes built (errors, reads, Art Nouveau; then engagement and camera). Code
f8c1805 on clap-hands-peacock; uploaded unlisted https://youtu.be/ywgJqjnEjJ4 (Telegram sent), PR #141 updated. Scans
clean, flash at the 3/s limit on the engine clap (1:02.6). Robin's own draft-2 error list still owed; fold it into draft 4.

**Audit of draft 3 (2026-10-16):** Robin had no error list; chose a cold audit, the three known fixes and a Gilliam guest
pass. Project AUDIT-d3.md + GILLIAM-DIRECTION.md (local). Fixes in 5f888f1 (claps 8/15/16 on onset, theatre roundel,
furnace wash). Headlines: dawn town grins (window-eyes + gold-curve smile), 0:55.9 near-white pink flash mid-storm,
climax dims and its sun-hand reads as an urn, ~80% framings still centred, regressions at the Metro hands, chorus 1
crowd, engine clap 3, clock "shine", sun ring. Draft 4 plan: patch, layout rethink, then Robin's pick of Gilliam's top 5.
