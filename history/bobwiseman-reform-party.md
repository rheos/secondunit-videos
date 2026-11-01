# Reform Party at Burning Man: history

Moved verbatim from the IndieAgent memory `bob-reform-party` on 2026-10-31. Current state and standing rules stay in that memory.

- Look reel 1 (2026-10-14, unlisted, Telegram sent): https://youtu.be/I_E1b3zvfh8 = riso zine (0-61 s), editorial cartoon (73-95), neon playa (122-137), toy theatre (146-174). Little Bob is a shared module, js/common/little-bob.js, in the riso intro and across the theatre stage.
- On Bob's For your review page since 2026-10-15 (item rp-looks-1, Robin's go), listed on #122; not sent on Messenger. Round 2 notes: riso grin shot holds ~15 s; nothing covers the outro yet.

**2026-10-15 art cars (Robin):** neon look v2 adds El Pulpo Mecanico (Duane Flatmo's flame octopus), a galleon and a Cheshire Cat car that fades leaving its grin; refs in source/refs. Reel 2 https://youtu.be/K62WQ4lJ2aA. On Bob's review page as rp-looks-2 since 2026-10-15 (replaced rp-looks-1).

**2026-10-16, after Bob's note on look tests 2** ("not liking these so far... take photos of me and you try making me a dancer?"): Robin doubts a full dancer here (slow, expensive, not a dancey song). Direction being pitched instead: **the boardroom art car**, from a real car Robin saw at Burning Man years ago (maybe False Profit, unsure; don't name any camp). Design per Robin: a big boardroom table covering the whole top of the car so the car is hidden; the driver sits in a hole in the middle of the table; chairs are built out from the table edge so the suits sit in mid-air around it, holding their board meeting as it drives across the playa. Props on the table (Robin): a speakerphone and a whiteboard with charts. Suggested reading: the suits vote while the unseen driver in the middle sets the direction. Bob appears as a Gilliam-style cut-out from his own photos (maybe as the driver). Code-drawn, no paid video. Not yet pitched to Bob.

**2026-10-16 draft 1, Dali boardroom art car (Robin: "just do it", no pitch first):** full song, code-drawn, 0 credits. https://youtu.be/ARGQD4m8DGI (unlisted, Telegram sent). Page looks/dali.html, js/dali/main.js: one 3D playa through a pinhole camera, shots are camera moves (SH list of offsets from the car). Driver = red hat in the hole; Little Bob pops up through it on "little big guy" and walks past the embers at the end. On Bob's review page as rp-dali-draft-1 (replaced rp-looks-2, order kept); #122 row updated. Commits 5df50d5 + 1476292 on reform-party-1 (also branch reform-party-dali), built in a scratch worktree because the shared checkout is dirty. Known soft spots: the "truth" light reads like a sun at 2:15, 14 s static wide opening, riot police are small.

**2026-10-16 draft 2** https://youtu.be/ldst6ELsCkM (rp-dali-draft-2 on his page, replaced draft 1). Robin's notes on draft 1: the real car's chairs were low enough to hop on and off without help (seats now 0.65 m, table 1.15 m), more of them (14 suits), and Burning Man must be busy with lyric-linked things. Audit with Gilliam/Von Ulrich/Nakamura moves: AUDIT-dali-v1.md (giant ear, padlocked mouth, soft clock car, giant chess, gavel from above once, suit column on wheels, crowd with ballots at the burn). three.js judged unnecessary (renderer is already a 3D camera). Commits through e41b55f on reform-party-1.

**2026-10-16 draft 3 (revision loop, all three passes, Robin's pick):** seven sandboxed builders, one per file; code 3fd4603 + flash fix 91924b3 + notes d10a165 on reform-party-1 (PR #129). Cloud-rendered `out/rp_dali-v3_720p.mp4` (copy in ~/Downloads/reform-party-dali-draft3_720p.mp4), opened in VLC; NOT uploaded, Bob's page still on draft 2, waiting on Robin's OK. Per-item changes and known issues at the end of AUDIT-d2.md. Captions now Newsreader Italic from fonts/ (cloud runners have no Didot). Trap: stick shadows under the lens drew as screen-sized blobs and failed the flash check; world.js now skips them within 2.5 m.

**2026-10-16 draft 3 to Bob (Robin's call, "to see if he is even liking the 3D at all"):** https://youtu.be/ffhH8fbP67k unlisted, Telegram sent; on his For your review page as rp-dali-draft-3 (replaced rp-dali-draft-2), asking whether the 3D look works at all; #122 updated. Draft 4 (the real Man, burn night, Black Rock City map; commit 20fe45e) is coded but not rendered: GitHub Actions refused jobs on a rheos billing/spending-limit block. Robin will fix billing, then re-run tools/cloud-render.

**2026-10-16 draft 4 to Bob:** https://youtu.be/i0oxQJsefe0 (cloud render once billing cleared), rp-dali-draft-4 on his page (replaced draft 3; no Bob notes on draft 3), #122 updated. Robin tells Bob himself that the camera work changes next. Next: draft 5, a continuous drone camera (camera builder in out/d5/b1, Robin's words in its brief: always moving, zooms and pans, never still more than 1-2 s, hovering when it does stop).

**2026-10-16 draft 5 (drone camera) rendered:** commit 7aa278f, out/rp_dali-v5_720p.mp4 (copy ~/Downloads/reform-party-dali-draft5-drone_720p.mp4), flash PASS (worst 3/s at 1:42.5), opened in VLC for Robin. Not uploaded; Bob's page still on draft 4.

**2026-10-16 draft 5 to Bob (Robin: "this is much improved"):** https://youtu.be/Pc4jJ1a0MWc unlisted, rp-dali-draft-5 on his page (replaced draft 4; no Bob notes on draft 4), #122 and PR #129 updated. Waiting on Bob's notes.

**2026-10-16 Bob's note on draft 2** (his page): "great thinking making it Dali-like", and at 1:05 pair the first sax lick with a person on a bike who is playing the sax. Robin: build on draft 5. **Draft 6** = draft 5 + that rider (playa.js bmSax/bmSaxInto, SAX_IN = 65.0 from Bob's time, not confirmed by ear; a tracking-shot path in front of the drone, drawn via the playaFront hook so he passes in front of the car). Commit df44aec, cloud render, flash PASS. https://youtu.be/1CIL1Vc8Ydo unlisted, Telegram sent. Not yet on Bob's page (draft 5 still there) pending Robin. Robin on the red hat in the hole: the driver "kind of needs to see where he's going", but "don't worry about him for now".

**2026-10-16 creative audit of draft 7 (Robin: more directors' symbolic philosophy, more lyrics acted, the drone roaming to scenes and impromptu performances):** AUDIT-d7.md (commit d93845b on reform-party-1); ten cold agents (critics A-D + film, guests Gilliam / Von Ulrich / Nakamura / Dali, a playa scout), full files local in out/d7audit/. Root finding: every camera key 0:18-3:17 is an offset from the car, so the car fills 64% of the film and 0 of 39 lines happen in the city. Three guests converged on one spine: the board confiscates what it silences and the vote releases it. Plan in four passes (patch, untie the drone, the real burn, the directors' spine), waiting on Robin's pick.

**2026-10-16 octopus art car (Robin's six photos, source/refs/pulpo):** commit 8145851 on reform-party-1 (on top of the other session's AUDIT-d7.md d93845b); playa.js OCT block, tentacles each on its own crank (Robin). Day crossing 59.5-65.3 reads well; parked in the art-car ring at clock 4.4 at night, fires on the beat but reads small there. Render out/rp_dali-v8-octopus_720p.mp4, flash PASS, opened in VLC; not uploaded. The audit session (draft 7 audit) was told to build on 8145851.

**2026-10-16 draft 9 (Robin picked all four AUDIT-d7 passes, spine = Von Ulrich's Instrument People):** eight sandboxed builders under out/d9/ (map + reports in out/d9/AGENTS.md, brief out/d9/BRIEF.md), merged as commit e827ba5 on reform-party-1 on top of the other session's octopus draft 8 (8145851). New files instruments.js (the five instrument-headed burners, heads confiscated one per lyric, returned on vote 1, framing the Man at vote 4) and scenes.js (city scenes). The camera now has world-anchored key windows (camera.js WINS), so the drone leaves the car. Known: turn rate exceeds 60 deg/s at the bungee dome (~119) and the golden-wide sweep (~86); Dali's ballot grin at 4:03 reads more as a ring.
Draft 9 rendered on GitHub (out/rp_dali-v9_720p.mp4, copy in ~/Downloads, flash PASS worst 2.5/s at 2:07.4, badframes only fades + the protected hat dive), uploaded unlisted https://youtu.be/6uvk_vhw5vk (Telegram sent). NOT on Bob's review page yet (draft 7 still there); Robin's call. The octopus session pushed 874c2d2 on top (empty artcars.js / artpieces.js hooks for Robin's art-car photos); pull before pushing reform-party-1.
The other session then pushed 8d11084 ("draft 10", Robin's art cars: artcars.js, artpieces.js, one-of-a-kind cars/bikes/toppers, small edits in installs/playa/burn/render). The next build from Robin's draft-9 notes must start from 8d11084 or later, and must pull before pushing.

**2026-10-16 draft 10 + audit, PAUSED mid-build (Robin: "pause"):** draft 10 (8d11084, Robin's own art cars and installations from his photos, one-of-a-kind fix) rendered out/rp_dali-v10_720p.mp4, not uploaded; monolith rebuilt as a diamond prism (261e5b6, 163a855). AUDIT-d10.md (6292c0b, b431562): six cold critics on camera smoothness, pass-throughs, permanence, cues; Robin picked passes 0-4, coloured dunce caps instead of white cones (Klan-hood read risk) and cutting the board copies. Pass 0 checks committed (86dfb6e: tools/check-camera.mjs, tools/check-actors.mjs, js/dali/actors.js; draft 10 fails 228 camera ranges). Six builders in out/d12 (map out/d12/AGENTS.md) were stopped early on Robin's pause; sandboxes keep partial edits, nothing merged. Resume = SendMessage to each agent id in AGENTS.md (or restart fresh from out/d12/BRIEF.md).

**2026-10-16 plan (Robin):** draft 10 is being revised; Bob gets draft 11 for review. novadiem.com/video/bob-wiseman shows draft 9 (6uvk_vhw5vk, rheos/novadiem.com#165); swap it to 11 once 11 is uploaded.

**2026-10-17 draft 11 SHIPPED:** https://youtu.be/otzI0l7OtEc (unlisted, Telegram sent), commit a3e1456 on reform-party-1, render bobwiseman-reform-party/out/rp_dali-v11_720p.mp4. The six out/d12 builders were restarted fresh and finished, plus a merge pass. Robin's three notes went in: phone melts in frame (22-27), close pans across 3+ faces on each grin, gag lips central. No fades. On Bob's review page as rp-dali-draft-11 (replaced draft 7; Blender test kept). #122 updated. Flashcheck pass; badframes 47 (v10 52), all fade-in/out. Leftovers for draft 12: Instrument People vs press table at 176-177; whirl cars graze the howl crowd at 190.5/191.5; camera check 59 ranges (marginal/protected). The gag lips at 27.8 are smaller than draft 10's close shot (central, but further away); check Robin's reaction. burn.js holds FG_ST/FG_TR tables of other builders' bodies: if any piece or path moves, rerun out/d12/bBurn/out/dump.mjs and paste the tables in. Still to do: swap novadiem.com/video/bob-wiseman from draft 9 to draft 11.

**2026-10-17:** Bob's page now uses DB review rounds, not .review.json (post with drop.sh round bob spec.json). Draft 11 is round 24 with ask_pick: A = drawn look (otzI0l7OtEc), B = Blender 3D look (9CqA9wvpIIo). Robin wants Bob's look decision now: if Blender wins, freeze the code build as the animatic and export its camera and choreography to Blender; don't leave the translation until the end.

**2026-10-18 draft 12:** Bob picked A, the DRAWN look (no Blender for this song). His notes on 11: female rapper duet partner for the rap (lines 14-26, 123.3-150.5), font less italic/less perfect, outro captions hidden until the last vote line. Built: js/dali/rapper.js (horse head, fire mane, blue Dali gown, drawer plinth on the car's far side, hooks in car.js), Gochi Hand captions with per-word wobble (render.js, CAP_HIDE lines 35-37). https://youtu.be/dPAQAYkLX8U, commit 7d33407, DB round 27. She is small or out of shot in parts of the rap; a camera pass for her close-ups is the likely next note.

**2026-10-18 draft 13:** Robin on d12: rapper had too little camera time (far side, camera wandering), phone melt looked weird and the camera left too fast. Fixed: plinth moved to the near side (RAP_AT), camera opens close on her with two more close stretches; the wars/chips dome swing was cut. Phone mic pods were 60 deg off the corners and floated loose as it sagged (fixed); the melt now starts on 'scientists' and the camera holds on it. https://youtu.be/-_rEFO6-4do, commit c545c05, DB round 28. Watch: the camera swings fast from her into the book shot at 147.

**2026-10-18 draft 14:** Robin's studio note (studio_note 1, 1:28): the camera went under the table while looking at it. camBuild now floors the drone at TOP+.3 (up to .55) within the car's footprint, except within .8 m of the driver's hole. https://youtu.be/kzIeKdHI1zA, commit fd64573.

**2026-10-18 drafts 15-16:** d15 (722f60e, review only): Robin's photos (source/refs/robin-2026-10-18) became art: rice-paddy hat on his chopper, car-boat, Victorian house car (sign left blank), Robot Heart (abstract banner, no face), Gothic arch nave, ONE green octahedron (his photos show one piece from two angles), clock tower with jesters, bucket-head stilt walkers, pagoda Temple (never burns). d16 (b031016) added his six studio notes on d14 (ids 2-7): smoke puff from a pressed button instead of the tape X; camera never under the table (round floor TOP+.35 within 5.9 m easing to +.12 at 45 m, follower brake, soft floor after hover; tools/check-under.mjs scans for it); headless Instrument People wear stand-in cardboard box heads; boom mics reel out; closer on Little Bob at 146. https://youtu.be/qXrWCRcuQdw, DB round 30. Studio notes 1-7 can be ticked Done (only Robin can, on the studio page).

Portal placement is UNDECIDED (Robin is only considering it, 2026-10-18). Placing each one at its own clock bearing (11:11, 12:12, 2:22) on the centre playa would be accurate, but the camera mostly faces the Man, so they could barely show. The open choice: spotlight them, or keep them as brief easter eggs. Do not move them until he decides. He has asked the artist for 3D models.
The film is a fantasy year: all the portals (and every art car) can appear in the same year (Robin, 2026-10-18). The Temple choice is open: draft 15 used his pagoda photo (refs 12.jpg), but it hardly shows.

**2026-10-18 draft 21 brief (Robin):**
- The Temple is now the black-and-white onion-dome gateway tower (refs 22-26). The pagoda moves out to deep playa as an ordinary art piece.
- The fly-out flies straight out with no pause, passing art on both sides, then climbs to the top-down view.
- Everyone who reads as more than a distant figure wears Burning Man costume. Plain clothes look fake.
- The costumed stilt-walker pair from refs 27-28 joins the playa.
- Rule (Robin): no art cars on the promenades or paths.

**2026-10-18 draft 21 SHIPPED:** https://youtu.be/7HcErjEx3yc, commit 7c064a5, DB round 33 (closed round 30). Drafts 17-20 were review-only. In d21:
- the onion-dome Temple, with the fly-out running past deep-playa art and not stopping;
- the pagoda at PAGODA_XZ (362,-430);
- a shared costume helper, burnerDress in world.js;
- the stilt-walker pair, 147-186;
- the portals and head about 237 m from the Man.
Open: whether the portals read at that distance (unchecked); the camera check is at 62 ranges because the fly-out is fast.

**2026-10-18 draft 24 SHIPPED:** https://youtu.be/gJMJ3M9_v1o (8bae275), DB round 34. Drafts 22-24:
- **Phone melt:** draft 21's phone, with only the part over the edge reshaped into a narrow Dali lobe. The first draft 22 moved the phone, rim and camera, and Robin hated it ("only asking you to change the shape").
- **Car details from photos of the real art car** (refs/boardroom-car):
  - black office chairs;
  - megaphones, laptops, mugs, a hula hoop, a thermos and a mirror sign;
  - blue underglow at night.
- **Driver:** the 3D-projected version in draft 23 was broken and Robin was angry. The current one is a flat profile cut-out like the suits: egg head, the fedora seated on it, one arm to a tilted wheel whose top arc shows above the table. Front and back views show the hat only, and he ducks during the hole beats.
- **Lesson:** build characters as 2D cut-outs, never as mixed 3D, and check full-size crops before rendering.

**2026-10-19 Blender look choice on Bob's page:** round 37 "Which look?" (ask_pick): A draft 24 drawn (gJMJ3M9_v1o), B Blender 3D figures (N49JMzgDYYk), C Blender lit cut-out figures (qBX680aJ3i0); B and C are 16.7-31.7 s, built from draft 24's exported state with PBR surfaces, sun shadows and haze (branch reform-party-blender-d24 in rheos/secondunit-videos, folder bobwiseman-reform-party-blender, `--look pbr --chars 3d|cutout`, renders on Modal only, ~$0.70 per 15 s). Rounds 34 and 36 closed. Waiting on Bob's pick.

**2026-10-19 round 38 (replaces 37):** B and C redone as 20 s daylight cuts (16.7-36.7 s, warm bounce fill, sun 7.5, exposure 0.2): B uRCZSceBlVg, C CEN4Cx43d4c; A still draft 24. Known: phone smoke is a solid black blob, suits read grey not navy. Waiting on Bob's pick.

**2026-10-20 draft 28 SHIPPED:** https://youtu.be/oaNmXgiyaF0 (7af4a30 on reform-party-1). It went on his page as round 49, a look pick that replaced round 38, which Bob never answered:
- A = draft 28.
- B and C = the same Blender cuts as before.

Robin: "keep the blender looks there for now.. just update the drawn one".

Bob's notes 21 and 25 are marked applied in round 49. Drafts 25-28, in order:
- **The rapper:** on screen from 2:02 (Bob's note 21).
- **The teeth (buhteeth.js):** wind-up chattering teeth on the "buh buh". They run from 0:37.6, 1:35.5 and 2:52 to 0:55, 1:53 and 3:00, on a 0.3 s clack grid.
  - Robin set the 1:53 and 3:00 ends by ear.
  - The 0:55 end is a guess, at the same point in its refrain.
  - The round asks Bob to pin a note at any run that is off.
- **Little Bob:**
  - Bob asked for the end walk with the piano and Junos to be cut, and draft 25 cut it.
  - Robin then told Bob on Messenger that little Bob is the film's recurring character, like Carol Burnett's janitor, and Bob said "sure". So he is back in the 4:15 slot.
  - The solo Lamplighter that filled the slot in draft 26 is out.
- **How the Lamplighters are built:**
  - burn.js: LL.GAP 2.4, SEG 2, one group per promenade. Far spires light at LL.FAR 187, when none is on screen. On the 12:00, the spires ahead of the walkers light at LL.AHEAD 206.2, during the climb.
  - camera-end.js TRUN.dip: the drone drops to 5.5 m down the middle of the 12:00 road at 201-203.3.
  - The 9:00 group's start was moved 9 s earlier so it misses the organ car.

**2026-10-20 draft 29 SHIPPED (Bob's teeth note on round 49 A: they don't close on the "b", chatter slower than the buhs, need lips):** https://youtu.be/s8Lo1cadmv4 (Novadiem Studio), round 54 on his page (closed 49; posted by the parent session on Robin's go). Branch reform-party-d29, issue #261, PR #262, commit a1ba5c2.
- The buhs are 16th notes (0.15 s at 99.4 bpm); the old teeth ran on 0.3 s. Demucs filed most of the buh attack in no_vocals, and a karaoke split (UVR_MDXNET_KARA_2) didn't isolate them either.
- tools/buh_onsets.py: a clack on every 16th of each run (draft 25 starts, Robin's draft 28 ends), snapped within 20 ms to vocal/no_vocals onsets, written to js/dali/buh-onsets.js. BUH-TAP.html + `--marks` limits the clacks to Robin's held spans if gaps matter.
- buhteeth.js: lips shut one frame before each b, pop open on the syllable, squash and hop (All The Trees' prepare/attack/recover). No tilt (Robin removed it in d25).
- Everything outside the teeth corner is pixel-identical to draft 28.
- Little Bob stays (Robin, 2026-10-20): 2:26 pop-up and the 4:15 walk.

**Bob note 43 (2026-10-20 7:28 pm Pacific, on draft 29, round 54), OPEN:** "better with lips yes. they work with the commencement each time but the buh buh buh finishes each time prior to the chatter. finish @39 and @41 and @43 and @46 you hear it?" So the teeth must STOP when each buh phrase ends (0:39, 0:41, 0:43, 0:46 and the matching ends in the later runs). Draft 30 (8cNxn4FmLk8, round 57, posted ~7:50 pm, only extended the 2:52 run to 3:05) does not address it. Next: draft 31 with phrase-end stops; Robin's BUH-TAP.html hold-key marks are the clean way to get the ends.

**2026-10-20 draft 31 (Bob's note 43), commit a7f209c on reform-party-d29 (PR #262), review cut only:**
- The buhs are one phrase per bar: 11 sixteenths on, which is Bob's "11 times", then 5 off.
- tools/buh_onsets.py ON/BAR builds the clacks.
- Run 1 is 4 phrases, ending 39.1, 41.5, 44.0 and 46.4. Those are Bob's finishes, and the stems' 16th periodicity drops out in the same places.
- Runs 2 and 3 end on whole phrases at 113.8 and 185.5.
- Between phrases the lips rest shut (buhteeth.js buhMouth, gap over 0.4 s).
- The parent session's brief had read note 43 the other way round, as "extend the chatter". Bob's words mean the chatter ran past the buhs.

Studio notes 1-10 and 12 are all applied in drafts 14-19:
- Note 12 (1:23 "clock") is the phone melt.
- Note 11 is In Her Dream's and is done.
- None was ticked on the studio page.

**Draft 31b (f6e8bda on reform-party-d29) replaces 31's guessed ends.** The teeth follow Robin's tap pass of 2026-10-20 on BUH-TAP.html. That page plays each run from its own clip in assets/runN.mp3 (served by `rp-buh-hold` on :8766), because the local server can't seek in one long file.
- He tapped each buh rather than holding. The taps are saved in tools/buh-taps-robin.json, and `buh_onsets.py --taps` builds the clacks from them.
- Taps under 0.5 s apart make one phrase, filled with 16ths from its first tap to its last. A lone tap gets one clack.
- Run 1 is phrases ending 39.4, 41.4, 43.9 and 46.2 (Bob's 39/41/43/46), a short phrase at 47.2-47.9, then single buhs about every 0.6 s to 55.4.

**2026-10-21 draft 31 SHIPPED (Bob's note 43):** https://youtu.be/gmT3G_-n5DM on Novadiem Studio, round 59 on his page, which closed round 57. Note 43 is marked applied. Built from draft 31e, commit 710140e on reform-party-d29 (PR #262).
- Robin painted the buh timing himself in the beat-sync grid (tools/beat-sync).
- His cells are saved in tools/buh-cells-robin.json, and `buh_onsets.py --slots` turns them into the teeth's timing.
- The shape: four long bursts ending 0:39, 0:41, 0:43 and 0:46, then short groups on each beat; the later runs have the same shape.
- To change the timing again, reopen beat-sync with bobwiseman-reform-party/beat-sync.config.js. It starts from the current film.

- **What's on it:** nine art pieces, each with a still and a jump-to time, and makers credited:
  - Harlan Emil's three Transportals;
  - Sean Lang's boardroom car, per Mark Achbar;
  - Duane Flatmo's El Pulpo Mecánico;
  - Robot Heart;
  - the Lamplighters, the Temple and the Man.
  Pieces from Robin's photos say "makers unknown, tell us".
- **Close views:** the portals, the Temple and Robot Heart read small in the cut (portals at most 93 px tall), so their stills were rendered from the film's playa with a hand-placed camera (out/closeview.mjs, which overrides camAt) and are labelled as close views.
- **The /video/bob-wiseman card now shows draft 31,** so the novadiem.com swap is done.

**BurnerSphere thread, 2026-10-21 (Gmail thread 1a1566fbf815cfbf):**
- **Ignacio Farias (8:10 am):** shared a Drive folder of the models, https://drive.google.com/drive/folders/1nTzJGfuTInowRc9skSOlVecxtDskbtA7. It isn't open to rgoodwin@gmail.com, so Robin requested access.
- **Athena (9:56 am):** suggested filming inside BurnerSphere's digital playa and asked whether Robin has tried it.
- **Robin's reply-all:** saved as a Gmail draft, not sent. It gives the spotlight page link, thanks Ignacio, and tells Athena Robin is signed in on the site but hasn't installed the 4.7 GB app.
- **Next:** once access is granted, list the folder and pull the portal models.

**2026-10-22 draft 32 SHIPPED (Bob's notes 46-47 on draft 31, which said the teeth start about half a second after the buh):** https://youtu.be/mZVXXsW1ay4 on Novadiem Studio, round 67, which closed round 59. Notes 46 and 47 are marked applied. Commit 96579aa on reform-party-d29.
- Robin re-edited the grid in beat-sync, which now has run earlier/later-by-a-16th buttons (d76520b). The phrases start earlier: run 1 now opens at 37.31.
- Robin said "publish" before the render landed, so he never watched the rendered cut, only the live preview in the tool.
- The spotlight page still embeds draft 31. Swapping it means changing reformParty.videos[0] in novadiem.com src/data/videos.ts and redeploying.

**2026-10-22 draft 33 SHIPPED:** https://youtu.be/QT5Auk-BWBg on Novadiem Studio, round 68, which closed round 67 (no notes on 67). Commit 7b2f597.
- Robin moved four cells in the beat-sync grid, all between 0:40 and 0:49.
- Only 0:38 to 0:51 was re-rendered locally and spliced into draft 32 by frame number.
- Robin watched the cut before it went up.

- **What's there:** beat-sync with plain-words instructions, his own browser storage, and the clips. It starts from draft 33. Uploaded to R2 under his folder's sync/, so it expires after 30 days; re-upload if the round runs longer.
- **Code:** novadiem-files PR #84 (#83) lets a round's description link into the client's own folder with [label](/<folder>/...). Deployed 2026-10-22.
**Bob, Messenger 2026-10-22 8:37-8:47 pm Pacific, on the buh-buh-buh fix:** "much better", the starts feel right, but the chattering lips keep moving after the singers stop. It is a sharp stop, not a fade: 11 buh's in a row. He'll try the beat-sync tool himself "if you think i can use the tool".

**2026-10-23 the timing tool fixed (Robin: "working in the side panel but not in my chrome"):**
- The cause: the sync files were uploaded with no Cache-Control, so Chrome kept its first copy and never fetched fixes.
- Two bugs were also fixed (180b99f on reform-party-d29):
  - The page now opens on Run 1. Before, it opened blank and Play did nothing until a run was clicked.
  - Replay after a run ends now works. Before, the video froze while the sound played.
- Round 68's link was changed to `...beat-sync.html?c=config.js&v=2` (Robin's OK), so any old cached copy is skipped.
- Bob's downloads page (?files) listed the 12 sync/ files. Since novadiem-files #85/PR #86 (merged 89566c7, deployed 2026-10-23), files in any subfolder of a client folder are served but never listed.

**2026-10-25 draft 34 SHIPPED (Bob's sync-tool grid, notes 52-53 on round 68):** https://youtu.be/MCUtxgXSo8A on Novadiem Studio, round 70 on his page (closed 68). Commits 2782691 + 13437bf on reform-party-d29 (PR #262). Robin watched the cut in VLC before the go.
- Bob pressed Send in beat-sync on 2026-10-24 (note 52, 233 hits) and asked us to copy it to the other two choruses (note 53).
- `tools/buh-cells-bob.json` = his grid as sent, with the four long phrases of runs 2 and 3 trimmed to his run 1 lengths (11, 11, 10, 10 cells, same starts). `buh-cells-robin.json` stays as the record of draft 33. 221 clacks, was 236.
- The short-group tails of runs 2 and 3 were left as draft 33: the vocal stem shows no onset pattern behind his run 1 tail moves (cells he switched off peak higher than the ones he switched on), and the cells he moved onto are already on at the same bar positions in runs 2 and 3.
- Only frames 924-1320, 2310-2516 and 4152-4356 were re-rendered (render.mjs) and spliced into the draft 33 master by frame number (ffmpeg concat filter, one encode, d33 audio copied); verified frame by frame against d33 (encode noise only outside the spans).
- Note 52 marked applied in round 70; note 53 was answered from the notes session on Robin's OK ("we copied your run 1 timing onto the other two choruses, no need to do each one").
- His sync folder: `config.js` now sends to round 70, `buh-onsets.js` starts from draft 34 (both uploaded with `--cache-control no-cache`, but the Worker still serves .js with max-age=14400; the HTML gets no-cache). Round 70's link carries `v=3`. The clips in sync/ were uploaded 2026-10-22/23 and expire 30 days later.
- Spotlight page and the /video/bob-wiseman card still embed draft 31 (novadiem.com src/data/videos.ts).

**2026-10-30 draft 35, POSTED as round 74 (Bob's note 56 on round 70, now applied):** review cut `out/d35/rp_dali-v35c_720p.mp4` in the reform-party-d29 worktree (the old scratch wt under session 59a90a7e), cloud-rendered (--draft, 7 min), open in VLC for Robin. Commits 75078b3..6c6e4d5 on reform-party-d29 (PR #262). Robin has not watched it yet; nothing posted to Bob.
- **Captions:** Bob: "The font. Just bugs me... something wilder? or weirder?" The d34 captions were Gochi Hand (since draft 11), not Newsreader. Instagram Sans is Meta's own brand font and can't go in other people's videos, so the styles are free lookalikes in fonts/. Robin picked **Strong**: Anton caps slanted, white with a dark edge, the whole line up at once, and ViralVision's amber (255,176,59) walking it word by word. Two renders missed this: v35 had no amber (it was bundled into the ViralVision option), and v35b lit only the newest word of the old word-by-word reveal. Robin: "otherwise there is no point of the amber word" (memory dont-bundle-choices).
- `?cap=<name>` on looks/dali.html switches styles for stills: gochi, classic, reel, strong, typewriter, vv, melt, ransom, neon. Lines too long for one row at 80% size wrap onto two rows.
- **Bob's font sheet** (Robin prefers Strong but wants Bob shown wild options): the first A-G sheet was rejected by Robin ("it's all the same font"). The posted one is `out/d35/reform-party-caption-fonts.jpg`, on Bob's page at https://files.novadiem.com/d23bb3f3f30a1172/reform-party/caption-fonts-d35-v2.jpg: A Strong (d35), B Shaman (Bob used it on an album cover), C Arnold Boecklin, D Blazed, E Destroya, F Whizzbang, G American Typewriter, H Dura 3D, every row with the whole line and walking amber. Styles `?cap=shaman|boecklin|blazed|destroya|whizzbang|samarkan|dura3d|amtype`; the fonts come from ~/Documents/fonts into `fonts/wild/`, UNTRACKED on purpose (commercial or unclear licences; Shaman and Boecklin are Linotype, re-saved with fontTools because Chrome rejected the originals; American Typewriter is the Bold face pulled from macOS's AmericanTypewriter.ttc, Apple-bundled ITC font, so a cloud render ships it off the Mac: licence check first). Robin swapped Samarkan for American Typewriter on 2026-10-30 because Bob has been talking about it (round 74's link updated, commit 71f6df5). If Bob picks B-H: copy fonts/wild into the render (a cloud render puts them briefly in a private draft release) and flag the licence to Robin first.
- **The "bow" o (note 56, "buh buh bow"):** on each phrase's last clack the teeth open into a round "o" (js/dali/buhteeth.js bowO). Lined up on their last onset, the 12 long phrases in the vocal stem swell to a peak about 0.25 s after it and are back to baseline by about 0.5 s, so the o holds 0.45 s. It always closes 0.15 s before the next phrase, which comes to about 0.3 s on the short tail groups. Clack timing is unchanged (Bob's grid, buh-cells-bob.json). Checked at all 21 phrase ends in the render.

**2026-10-31 draft 37 BUILT, not uploaded (Bob's note 59 + Messenger of the same morning):** commit a4feae9 on reform-party-d29 (PR #262), review cut `out/d37/rp_dali-v37_720p.mp4`, cloud-rendered (the first run failed on a runner's font install, the rerun passed), flashcheck PASS, open in VLC for Robin.
- **Bow mouth (buhteeth.js):** the jaws drop 30 units (was 18), hole 0.8 of that tall, lips a thin 5.5-unit band round it; lip outline sampled at 72 points (28 gave pointed sides).
- **Ending (bob.js):** END_BOB = false turns little Bob's end walk off (code kept). saxEnd(): the 1:05 sax rider (BM_SAX) rides in screen-space on little Bob's old line (y 994, 128 px/m) from 254.75, coasts through the lick (backing-stem onsets 255.41 to 259.49), pedals off right by 262.4; firelight, rim and long shadow like little Bob's. Cream notes from the bell only during the lick (playa.js). From about 261.5 the burn is alone to the fade.
- **"Without spin" (rapper.js spinDivas, hooked after the roll in render.js):** the horse-headed diva (blue, left, x .105) and a crimson sister (right, x .895), 327 px/m, rise from below the frame on each "without" (lines 6, 13, 34), sing it into their mics, twirl once on "spin", sink as the line ends. The crimson one waits until the chattering teeth have hopped out (refrains 1 and 2). rapFigure takes an options object for this.
- Next: Robin watches; on his go, upload, post round on Bob's page (closes 76), mark note 59 applied.
- **Draft 37b (2026-10-31, Robin: "at the end there are some bikers going by... can we make me on my chopper bike added to that group?"):** ARTCARS `robin-end` (artcars.js, commit bdb85b9): Robin's chopper (rice-paddy hat) rides right to left on z 38.5 at 4.2 m/s among the end's traffic riders (playa riders 10, 12, 16, 20), in at the right edge about 4:18.1, at least 5 m from every rider and burn bike. `front: true` draws him over the fire's glow, which washes the other end riders out (that see-through look is what Robin called "low opacity"); he enters only after the big near silhouettes have left, since a front-layer body would paint over them. Spliced: local render.mjs 257.5-269.0 joined to the d37 cloud master at frame 6180 (seam diff = encode noise), `out/d37/rp_dali-v37b_720p.mp4`, flashcheck PASS, open in VLC. Not uploaded.
- **Draft 37c (2026-10-31):** Robin: the chopper stood out too much, "it should be just as transparent as the other riders.. maybe only slightly less". `robin-end` now rides in the scene under the glow like them, plus `robin-end-lift` (front, alpha .22, noShadow; artcars.js reads e.alpha and e.noShadow) for a touch more. Commit a2ea58c, spliced at frame 6180 as `out/d37/rp_dali-v37c_720p.mp4`, flashcheck PASS, open in VLC. Not uploaded.
- **The divas were our choice, not Bob's:** he never asked for horses. Note 59: "some female or females appeared at the end of each chorus just for the final lyrics 'without spin'"; Messenger: "a female or two or some type of creature". d37 reused the horse-headed rapper diva plus a crimson sister. Robin asked (2026-10-31) whether Bob wanted horses; open whether to keep them.
- **Draft 37d (2026-10-31):** Robin on the horse divas: "i don't think it looks right with the microphones in their hands like that.. they are not the lead", and he had never seen the stilt walkers from his photo (robin-2026-10-18/27-28, playa.js bmStilter, only ever far off at 147-186). spinDivas (rapper.js) now brings them in screen-space at 200 px/m: rainbow walks in from the left edge, purple from the right (waits for the teeth to hop out in refrains 1 and 2), full length in the bottom corners, a full twirl on "spin", a sway through the held note, walk out as the line ends. bmStilter's stripes are flat bands now (round caps read as sausages up close; the far crowd pair changes imperceptibly). Spliced into 37c at frames 1284-1482, 2676-2844, 4524-4740; `out/d37/rp_dali-v37d_720p.mp4`, flashcheck PASS, open in VLC. Not uploaded. Local patches vs the cloud master differ by sub-pixel resampling only.
- **Draft 37e (2026-10-31):** Robin on 37d's walkers: "terrible and all out of proportion... upgrade them to horse quality... the same size as the horses were". New `stiltWoman(j, x0, y0, k, s, t, mouth, wave)` in rapper.js, drawn from his photo at the diva's scale (k = H/3.3, playa 1.15 m below the frame edge, so knees up): real proportions on 1 m stilts, rainbow (flower crown, striped bodysuit, cream vest with orange ruffle and tail, fin cuffs, taped poles) and purple (spiky hair, sequin crop top, pink-piped tattered jacket, pink gloves, hot pants, purple diamond stilt covers with pink piping); closed happy eyes, cheeks, a mouth that sings the backing line, a wave on the held "spin". playa.js bmStilter stays for the far crowd pair. Commit 7c2e87b.
- 37e = 37c plus local patches at 53.5-61.75, 98-103.5, 111.5-118.5, 175.75-180.5, 188.5-197.5; `out/d37/rp_dali-v37e_720p.mp4`, flashcheck PASS, open in VLC. Not uploaded.
- **Draft 37f, characters only (2026-10-31, commit b-series on reform-party-d29):** Robin on 37e: "their costumes still aren't right... their jackets... have a specific cut", "you've cut off their stilts... scale them to that size, not cut their legs off", "iterate on the characters first... before redoing the video". New file js/dali/stiltwomen.js (loaded before rapper.js in looks/dali.html) holds stiltWoman, drawn from the photo with rounded silhouettes (shape() rounds every point unless marked sharp). Rainbow: S-hemmed wrap top of curved stripes, silver piping on the hem, orange fringe outside it, navy lining down her left side, epaulette with silver tubes, bell-bottom striped tights, purple and pink polka-dot fins, splayed taped pegs. Purple: cropped sequin jacket, pink piping down a deep V to a tie under the bust, the fronts running to the body's sides at the waist and flaring into curled tails at the hips, ragged strips on the flare, short cap sleeves, pink gloves, briefs with a thick pink waistband, kite stilt cover with a pink hoop. spinDivas shows them whole at k 175 (the 490 px the diva showed), stilts on the frame's bottom edge. Sheet page: out/stilt-sheet.html + out/sheet.mjs (scratch, gitignored). Sheet sent to Robin; no video rendered yet.
- **Stilt women from the straight-on photo (2026-10-31, commit e975939):** Robin sent a second photo (the pair hand in hand, front on; saved in the session as images/2.jpg and 3.jpg, not yet copied into source/refs). What it showed: the rainbow walker's top is a SYMMETRIC vest split up the middle under a big navy stand-up collar with orange fringe and silver chimes off both tips; her fins are mirrored on both legs (purple out from the knee, pink below); straight taped stilts. The purple walker has TWO kite covers, one per leg, each with its own hoop (the right one with a pink inner panel), fringe off both gloves, a tattered peplum. Sheet `out/d37/stilt_women_sheet_v3.jpg` sent; Robin's verdict pending; video not re-rendered.
- **Rainbow vest, Robin's description (2026-10-31, commit affdd80):** "it does not have black shoulder pads.. the ridge of the front opening is like an hourglass sort of shape with the rainbows making 2 arcs touching at their middles where the top part of the arc becomes the collar", then "the bottom of it also comes out like that into kind of a tail". Drawn as two panels whose front edges are arcs: from a collar tip out past each shoulder, in to touch at the middle (2.1 m), out to a pointed tail past each hip; stripes nest along each arc (offset along the normal), silver piping and orange fringe on the arcs, chimes off the collar tips; navy only inside the upper V at the neck. Sheet v4 sent; Robin's verdict pending; video not re-rendered.
- **Purple jacket front (2026-10-31, Robin sent a crop of it, commit in git log after b0bc9b6):** two continuous pink tubes, each from one side of the collar down a wide V, crossing in an X under the bust (no tie), then round the OPPOSITE flap; the flaps are pink-outlined leaves that swell over the hips to a point at mid thigh; jacket fitted at the waist; midriff and hot pants in the diamond between the flaps; tattered peplum behind. Sheet v5 sent; verdict pending; video not re-rendered.
- Purple flaps hook inward like ant mandibles (Robin), slim, tips over the inner thigh. Sheet v6.
- **Stilt pair motion (2026-10-31, commit 794b3a6):** Robin: "they should come in.. sing their part then spin back out on 'spin'" and "i don't want them to fist pump... something more elegant with their arms". spinDivas (rapper.js, SPIN_PAIR): both come in from the LEFT edge hand in hand as in his photo (rainbow left, purple on her right, x 120 and +0.9 m; the chattering teeth hold the right corner in refrains 1-2, which is why not one per corner), sing "without", the free arm sweeping open to shoulder height (stiltWoman `grace`), and on "spin" let go (`hold`) and spin back out to the left, two full turns in 1.05 s. Clip `out/d37/spin_clip_chorus1_720p.mp4` (52.5-58.5, local) opened in VLC. Robin also said he'd like to build these costumes in Blender sometime (offer card closed unanswered; raise again later, don't re-offer this session).
- Spin-out spans the whole held "spin" (Robin: not off screen until it ends): turns at 1.3/s, steady drift (u^1.6) to just past the left edge. Clip out/d37/spin_clip_chorus1c_720p.mp4.
