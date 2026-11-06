# cinetic (Leonxlnx/cinetic): what is worth taking

Read-only study, 2026-10-24. Shallow clone, commit ecfa660 (5:18 pm Fri Oct 17 Pacific), plugin version 1.1.0. Nothing was installed or run except my own read-only Python over its JSON file.

Licence checked: MIT, "Copyright (c) 2026 Leonxlnx", in `LICENSE` and an identical `skills/cinetic/LICENSE.txt`. Anything we copy keeps that notice, the way `tools/motion-lab/vendor/LICENSE-*.md` already does for Remotion.

## Recommendation

Do not install it as a skill. Borrow four things: the pixel and audio QA scripts (`forensics.py`, `av-audit.py`, `probe.py`, `check-sync.py`), the verifier "refute before you fix" pass with its P0/P1/P2 severity, the text-flow numbers, and a filtered copy of the technique library with the `pick.py` draw. Drop the hard-ban palette and type rules, the Remotion render path, the earshot scoring and the 60 fps mandate.

Why: its QA scripts measure the encoded MP4, so they work on our HyperFrames films and our canvas looks without changes, and they cover failure classes our checklist only handles by eye (pops, stalls, ghost frames, judder, banding, LUFS and A/V lag). The skill as a whole is built for 20 to 45 s SaaS launch films with an invented brand and a generated score. Our explainers run about 90 s with a voiceover, our IndieAgent palette is cream and tan (banned outright), our artist videos lean on serif and warm looks, and our songs are the clock at 24 fps. Its own evaluation is honest about the payoff: the neutral blind judge picked cinetic in 7 of 23 comparisons, at about three times the time and tokens of a plain run (`docs/evaluation.md`).

## 1. How it flows, brief to ship

Everything is in `skills/cinetic/SKILL.md` (533 lines). Each step writes a file and ends at a gate that is a command.

- **Step 0, intake** writes `BRIEF.md`: product, format row from the table in SKILL.md §1 (launch 20 to 45 s, feature 8 to 30 s, loop, sting, walkthrough), engine (Remotion by default, HyperFrames if asked), pace (calm by default, crisp on request), and the hard bans copied in word for word, because the critics are later prompted with this file. `scripts/new-film.sh` scaffolds from `assets/remotion-starter/` or `assets/hyperframes-starter/`. Gate: a spec line such as `1920x1080@60, 30s, 100BPM, pace: calm, audio: earshot kit (calm), no music`.
- **Step 1, concept** writes `TREATMENT.md` (template `assets/TREATMENT.md`, guidance `references/concept-and-story.md`). Three concepts through three lenses: the product's verb made literal, the viewer's pain made visible, a formal device (relay object, bookend, one unbroken move). Pick one and one **story device**: an object the product owns that travels through every shot, never blinks out at a cut, and ideally becomes the mark at the end. Then three tests: deletion (remove the value beats; if it still "works" it was a feature tour), specificity (would the film be just as true of a dumber product?), feature word (would a muted stranger name the feature?).
- **The draw.** `scripts/pick.py --format launch --energy calm --seconds 30 --json out/qa/picks.json` draws about one technique per 3.5 s (calm) or 2.5 s from `assets/library/techniques.json`, filling slots in a per-format category order (`ORDER` in pick.py). Weights: role (workhorse 3, accent 2, signature 1) times proof (1 + evidence/4, capped at 3) times energy fit; a calm draw never takes a high-energy entry. The seed is printed so the plan is reproducible. Rules: build only what the concept can carry, reroll a misfit at most twice with a written reason, never add a move the draw did not give you. Correction to the brief we were given: the draw does not guarantee two films share no moves. It is weighted random; `--avoid previous-picks.json` is the switch that excludes the last film's ids.
- **Step 2, brand** writes `src/brand/tokens.ts` and a mark: three adjectives, then typeface, stage, accent; 6 to 10 mark directions on one sheet; a "misread test" at 64 px; `scripts/palette.py` refuses a banned hue. Starter stand-ins carry `// cinetic:placeholder` and the linter errors until they are gone.
- **Step 3, timeline** writes `src/timeline.ts` (or `timeline.js` in HyperFrames): `BPM`, `FPS`, `b(bar, beat, sub)`, `ACT`, `CUE`, and `COPY` as one entry per text fragment via `line()` or `chain(id, 'build'|'replace', ...)`. This one file drives the picture, the cue export for sound, and the QA scripts. Gate: `scripts/grid-check.ts` (grid placement, reading holds, 72 f event gap, word budget, fragment and chain rules, copy share).
- **Step 4, build** act by act from motion tokens (`src/lib/anim.ts`, mirrored in the HyperFrames `motion.js` to 1e-5). Gate: `scripts/lint-film.mjs` clean, `scripts/layout-audit.sh` with 0 safe-area, overlap or word-count violations, written notes per act contact sheet.
- **Step 5, sound**: `scripts/export-cues.ts` computes sync frames from the picture code (spring contact, 50% pop, 97% settle), then an earshot sound kit (`scripts/audio/kit.py`, a separate repo, Leonxlnx/earshot) and `scripts/audio/score.py` build and master the soundtrack. Gate: LUFS target ±0.5, true peak, no stacked hits, every sound has a visible cause.
- **Step 6, render**: `scripts/render.sh` (Remotion) or `scripts/hf-finish.sh` (HyperFrames): PNG frames, one x264 encode at CRF 14, BT.709 tags, ffmpeg mux, then `probe.py` and `check-sync.py` as hard gates. Motion blur by sub-frame accumulation (`accumulate.py`), with a speed ceiling of 60 to 80 px/f measured by `measure-speed.py`.
- **Step 7, review loop** (`references/review-loop.md`): render a preview, run `forensics.py` and `av-audit.py`, make 12 fps watch sheets and a 480 px legibility sheet, then four critic lenses from `assets/critics/` (director, forensics, sound-sync, and art-copy-ui in round 1 only), each returning `{issues:[{id, priority, frame, problem, fix:{file, change}}], overall, score}`. Then the **verifier** (`assets/critics/verifier.md`) tries to refute every P0 and P1 from frames and code before anyone fixes it. Fix by impact per minute, re-render only the touched acts.
- **Ship gate** (SKILL.md §8): an 11-dimension rubric (idea and device, hook, copy and type, colour and brand, composition, motion, transitions, pacing, product truth, sound and sync, finish) with every dimension at 3 or more, Finish and Sync at 5, mean at least 4.2; no open P0; every script passing; stop after 5 rounds and say what you would still change.
- **Step 8, deliver** with `deliver.sh`: poster from the last frame, variants re-laid out from the same timeline (never cropped), deliverables at the top of the folder and QA in `qa/`.

## 2. The technique library

273 entries in `assets/library/techniques.json` (readable form: `references/technique-library.md`, 3,116 lines). Each entry has a summary, a code recipe, timing at 60 fps, use-when, avoid-when, formats, energy, role and an evidence count. Roles: 124 workhorse, 96 accent, 53 signature. 34 entries have evidence 0 and 34 rely on a look the house bans (they are drawn with a ban-safe variant).

| Category | Count | Not in motion-lab or hyperframes-animation (my call) |
|---|---|---|
| typography_motion | 25 | 12 |
| color_and_light | 25 | 15 |
| pacing_structure | 23 | 15 |
| transition | 22 | 11 |
| camera | 22 | 6 |
| product_demo | 22 | 12 |
| texture_and_finish | 20 | 14 |
| micro_interaction | 20 | 9 |
| ui_choreography | 19 | 11 |
| logo_and_end_card | 18 | 10 |
| data_and_numbers | 17 | 7 |
| layout_and_composition | 16 | 10 |
| depth_and_3d | 14 | 11 |
| opening_hook | 10 | 5 |
| **Total** | **273** | **148** |

How I judged "have it": a named rule or blueprint in `~/.claude/skills/hyperframes-animation` (48 rules, 22 blueprints, the transitions catalogue, `techniques.md`), a hyperframes-keyframes pattern (punch-in, Ken Burns, whip/match handoff), motion-lab (`motion.js` eases and springs, parallax and hold numbers, the vendored RPaths/RNoise/RShapes, `--shutter` blur), or a rule in video-production's art direction and our memories (object match-cuts, punch-in on the key word, light arc, holds breathe, drone drift). Be honest about the 148: many are small refinements a careful build would do anyway, and a good third are SaaS furniture (command palettes, tab indicators, ghost autocomplete) with little use for musicians.

### What we already have, or nearly (125)

Exact or near duplicates, so not worth importing as moves (their timing numbers can still be read for reference):
- Camera: living hold, breathing zoom (multi-phase-camera), punch-in insert, detail first then pull back (zoom-out-workspace-reveal), hero push with yaw and cursor whip orbit (camera-journey, 3d-camera-flight), isolating push (coordinate-target-zoom plus depth-of-field-blur), reactive reframe and lead follow (camera-cursor-tracking), crane push, crash zoom (css-scale zoom through), impact kick (near: Swift VFX `shake`), parallax truck (motion-lab 1.0/0.5/0.2), seamless loop drift (near: `ML.loopPhase` plus RNoise), pull out from inside the object (near: zoom-out-workspace-reveal), depth-field fly-through.
- Colour: mono with one accent, theme flip (theme-crossfade-morph), palette shift as context (near: our light arc), accent hit envelope (near: asr-keyword-glow without the glow), specular, rim and tone-band sweeps (gradient-text-sweep, registry shimmer), living gradient stage (ambient-glow-bloom), light swell bridge (css-light), drain the stage (depth-of-field dim).
- Data: count-up, status pill, metric cold open, hero bar pull-back, bar cards, line draw with tracking head (svg-path-draw plus RPaths), constant-speed bar sweep, linked control counters (control-target-sync), digit reel (vertical-spring-ticker), ring gauge (dataviz-countup).
- Depth: card fan and scatter (depth-scatter-assemble), orbit ring collapse (orbit-3d-entry, constellation-hub), 3D flip swap (css-3d).
- Layout: swarm burst (overwhelm-surround), hub and spoke (constellation-hub), one centred subject, subtract to one (near: clutter-shove), live split (panel-edit-live-sync), vertical band stack (near: our 4:5 and 9:16 relayouts).
- Logo: mark slides, name follows; macro pull-out; seed stroke build; device becomes the mark (our transitions-follow-an-element); the product clears the stage; bookend replay (near); lockup living hold; mark glint turn.
- Micro: focus ring, in-place rewrite (discrete-text-sequence), chip bloom (anchored-layout-expand), pill-to-icon morph (card-morph-anchor), guide cursor (cursor-click-ripple), radial dash burst (css-marker burst), spinner to check (agent-progress-theater), drag lift seat (cursor-drag), badge bump, focus caret (context-sensitive-cursor), drag-select highlight (css-marker).
- Hooks: macro scramble (hacker-flip-3d), quiet intro drop, cursor into a search field (prompt-type-submit-generate), pile-up (overwhelm-surround), click starts the film (cta-morph-press).
- Pacing: breath envelope, locked camera holds, luma act map and continuity thread and oner morph chain (near: our light arc and match-cut rules), single camera journey (spatial-pan-stations), beat-quantized chunks (kinetic-beat-slam), score mapped to acts (our score library).
- Product: device rise, tilted plane flattens (3d-page-scroll), agent status then answer, fast prompt, skeleton fill (grid-card-assemble), runway flyover, chart scrub (chart-scrub-readout), terminal bursts, diff hunks, presence cursors (multi-cursor-choreography).
- Texture: speed-gated blur (`--shutter`, motion-blur-streak), mixed-media grade, global grain, UI micro-ticks, feathered edge mask (near), halftone shading (our riso looks).
- Transitions: velocity handoff (techniques.md §10), scale-through, anchor overlay (fixed-anchor-cycle), shape match cut, dot relay, defocus cut (css-blur), path relay, iris from a glyph (near: circle iris), band wipe and stepped column fill (css-cover), conveyor line swap.
- Type: slot roller, masked baseline rise and centre-out unmask (clip-path masks), blur-to-focus rise, in-place light-up (our lyric highlighting), staggered word roll, word slams and multi-direction assembly (kinetic-beat-slam), oversize slide-in, scramble decode, front restyle sweep, slice glitch (chromatic-glitch), scaled echo (3d-text-depth-layers).
- UI: orbit gather, clutter pile-up, card grid arrival, live reflow, row cascade (waterfall-entry), push-aside (reactive-displacement), container morph, progress spine.

### What we do not have (148)

- Camera (6): dolly surge with a foreground pass, push-in with a roll swing, pull-back that lands an event, off-frame whip relay, fit-to-content follow, zoom-out hop between areas.
- Colour and light (15): one-hue light ramp, accent ground saved for claims, single inversion card, ink resolve on arrival, accent on the newest arrival, rising colour wash carrier, tilt-linked sheen, duotone until featured, key-light edge hairline, brightness rides the move, now/was/next tone ladder, graphic softens into the stage, rolling band flood, stage-tinted shadows, type solidity arc.
- Data (7): companion glyph swap mid-count, tucked unit label, flag cascade then one chosen, top-to-bottom row refresh, before-to-after delta chip, unit grid tally, area-true ratio comparison.
- Depth (11): pinned label over a swapping world, spotlit tilted object, folded channel that unfolds, peek-launch-recede, edge-on coin snapping face-on, extruded slab, impact morph with floor ripple, icon lifts into a 3D hero, cube turn to a blank face, press tilt that hides a swap, exploded layer stack.
- Layout (10): arc carousel, hero icon becomes an inline glyph, headline over a ghost of the UI, icon-led ragged stack, mark set as a word, caption in the subject's negative space, opposite-corner caption relay, symmetric flank, words part for an inserted object, bento cell takeover.
- Logo and end card (10): reverse type with the group centred, dark slam and spin, liquid blob into the mark, staircase echo morph, words part while the URL types in, card shrinks to a pill with words closing in, CTA gaps close, stop-motion brand strobe (would fail our flashcheck if pushed), hot accent cools to the neutral mark, device ticks inside the lockup.
- Micro (9): anticipation dip before an unlock, one-element tell before an event, velocity-stretch dot, shared highlight walking a menu, stretchy tab indicator, launch hop that never lands, two-beat confirm cascade, send as a ghosted handoff, cursor glyph follows context.
- Opening hook (5): four live cells from frame 2, mark builds then is thrown into a macro of itself, oversize line flies through then restarts small, finished result first then rewind, cut in mid-word and pull back.
- Pacing (15): the one long hold, hard stop into a silent sign-off, four-sequence launch structure, image act then type act, each repeat runs faster, fixed-length ask with a variable answer, two empty frames after a cut, music hole then slam, silent UI over a steady bed, accelerando into the climax, loop seam hidden at a motion peak, silence as the default bed, long-tailed beat lengths, one screen direction per act, machine on the grid and hands off it.
- Product demo (12): hard swap on the cause frame, generated view resolves from soft, headline becomes the product input, mark docks into the app, editing with the product's own UI, shared element survives the page change, flick scroll lands the target, one native control as the demo, pin field pull-back, before/after drag divider, ghost suggestion accepted with a key, list narrows with each keystroke.
- Texture (14): stepped cadence on twos for one layer, low-luma photo plate, stipple only in lit ramps, dot-matrix silhouette, scanline transmutation, locked-state mosaic, intersecting ring field, brushed micro-streaks, glyph-grid shock pulse, gobo studio shadows, fog floor, hairline edge plus key shadow, stepped mosaic resolve, wireframe-to-product scan.
- Transitions (11): polarity flip cut, giant word punch-out, portal zoom with aspect morph, horizon rise, product surface cover wipe, reveal by subtraction, motion-masked swap, tip-back exit, envelope-matched type cut, angle change on a shared drift, select and retype swap.
- Typography (12): phrase clamp at a junction, time-boxed type-on, re-centring line build, reading-order exit, blur-swap rescale, hard-step edits that act out the copy, shared-letter morph, words spill from behind a mark, vertical word stack, slice-band glyph assembly, quiet type swells on the drop, animated line re-break.
- UI choreography (11): path fractures into a fan, stalled state by dimming, fanned stack into slots, lens list scroll, toss into a bin, outline-led insert, spawn from the anchor point, shell first then contents, top insert pushes the list down, drag to reorder with siblings making way, genie launch from an icon.

### The 10 most useful for IndieAgent explainers and artist videos

1. **Pin field pull-back** (`pd-pin-field-pullback`). A map pulls back over 50 f, tour-date pins drop about 11 f each, 2 to 6 f apart, in the accent and relax to ink over 24 f; a card grows out of the pin the cursor picks. This is Bob's 53-show tour and the GigCaravan route as a single shot, made from a musician object (a show), not a diagram.
2. **Fit-to-content follow** (`cam-fit-bounds-follow`). As a route or plan builds node by node, the camera widens just enough to keep every node in frame (follow coefficient 0.06 to 0.08 per frame, zoom at most 1.2% per frame, 12% margin). Opens close and legible on the first stop, ends on the whole tour. Pairs with 1.
3. **Now, was, next tone ladder** (`cl-read-state-tone-ladder`). The item being read at full ink, read items at about 40%, upcoming at about 24%; promote in 6 f, demote in 10 f. Works for tour stop lists in explainers and for lyric lines in artist videos.
4. **Accent on the newest arrival** (`cl-accent-on-newest`, evidence 6, among the best-proven entries). Whatever just arrived wears the accent, then relaxes to neutral over 20 to 40 f, so colour says "just happened". Our One Show red (#C8341E) is made for this.
5. **Words part for an inserted object** (`lc-gap-open-insert`). Inside a finished line the words slide apart over 16 f and an object pops into the gap: "your [ticket stub] sells itself". It is exactly the artist-facing rule in our memory (show the ticket stub, not the database).
6. **Machine on the grid, hands off it** (`ps-machine-grid-human-gaps`). Agent actions tick on a metronome (every 15 f, identical reveals) while the human's cursor moves at uneven gaps (4, 15, 18 f). That one timing contrast tells "the agent does the booking admin, you do the music" with no words.
7. **Each repeat runs faster** (`ps-faster-each-repeat`). The first show added plays at full length, the second at 0.6x, later ones ratchet (gaps 26, 14, 12, 8, 8, 4, 4 f). Stops the "add show, add show, add show" stretch going dead.
8. **Motion-masked swap** (`tr-motion-masked-swap`). Copy or a photo changes on the frame something else moves fastest, so the change hides inside motion. Useful in explainers for cycling examples, and in artist videos for swapping a figure or prop mid-whip without a cut.
9. **Angle change on a shared drift** (`tr-drift-matched-angle-cut`). A hard cut to a new angle of the same object while the slow push carries on at the same rate (at least 30 degrees of angle change, centre offset at most 40 px). A calm cut that fits our "drone camera, never snaps" rule and code-drawn 3D looks.
10. **Finished result first, then rewind** (`oh-result-first-rewind`). Open on the finished state (a full tour poster, a sold-out stub), hold 40 f, rewind visibly over 36 to 48 f to the empty start. Evidence 0 in their library, so test it, but it suits a "here's where you end up" explainer hook.

Close behind: one screen direction per act (`ps-direction-per-act`), the one-element tell before an event (`mi-pre-event-tell`), press tilt that hides a swap (`d3-press-tilt-swap`), top insert pushes the list down (`ui-top-insert-push`, bookings arriving), before/after drag divider (`pd-before-after-drag-wipe`, DIY EPK against IndieAgent).

## 3. Its checks next to our review checklist

### What cinetic checks that we do not

- **Pixel forensics on the encoded file** (`scripts/forensics.py`, 1,195 lines, needs only ffmpeg, numpy and opencv). Single-frame pops, stalls (a repeated frame between moving ones), frozen holds over 48 to 72 f, ghost frames, border slivers, judder (whole-pixel stairs on slow moves), sharpness steps, banding, compression smear on flat fields, a weak hook, loop seams, and determinism (`--against b.mp4`, render twice and compare). Designed cuts and freezes are declared so they don't flag. Our nearest tools are `badframes.py` (black lower-right quadrant only), `flashcheck.py`, and motion-lab's onion and speed views, which work per probed element in canvas looks only. The One Show VERDICT notes the motion-lab audit "cannot run" on either DOM build; forensics would.
- **Audio against picture, measured** (`av-audit.py`): each onset against its cue within ±2 f, per stem so the bed can't hide a late effect; systematic lag; stray effects; whoosh apex; strong picture peaks with no sound; integrated LUFS, true peak at or under -1 dBTP, loudness range; payoff loudness. We have the rules in prose ("hits 1 frame after", "decode the MP4 to check sync", phone-band mixcheck) but no loudness or true-peak gate.
- **A delivery spec gate** (`probe.py`, `check-sync.py`): size, fps, duration ±1 f, yuv420p, BT.709 tags, AAC 48 kHz, A/V lag at most 48 samples by cross-correlation. We have none of the colour-tag or lag checks.
- **Text flow as numbers** (grid-check plus the director lens): at most 8 words of film copy visible on any frame, thoughts over 4 words split into 1 to 4 word fragments with 30 to 90 f of picture between them, never two lines arriving together, copy on at most 65% of frames, at least 1.5 s with no text in every 10 s, text being read moves at most about 3 px/f, labelled chips under 20 px/f. Our "hold after the last word" covers only the hold.
- **Refute before fixing** (`verifier.md`): every P0 and P1 is treated as a claim and checked against frames and code; an issue is dropped if wrong, exaggerated, invisible at normal speed, already fixed, or if the fix would make things worse. Plus a clear severity scale (P0 key beat or story, P1 visible on a normal viewing, P2 only on pause) and a fixed JSON shape with a code-level fix. Our art-direction §6 has cold critics who may not edit, but nobody checks the critics.
- **Hook rules**: frame 0 composed and moving, problem felt by 1 s, something visibly changes about every second, the product named by a quarter of the runtime.
- **Motion physics**: overshoot only on a true landing and at most 2 per film; entrances decay and exits accelerate; scale interpolated in log space; a speed ceiling of 60 to 80 px/f before blur turns a move into stepped copies; seams either both at rest or velocity-matched; a crossfade never dips through black.
- **Data truth asserts**: every UI label derived from one data module with asserts on weekdays, counts, plurals and sums. For tour dates this is directly useful: a "Fri Nov 7" that is a Thursday is exactly the kind of mistake Bob would catch.
- **Mid-film thumbnail colour check** (D11): at 480 px, does any brand colour show?
- **Delivery folder hygiene**: deliverables at the top, QA in `qa/`.

### What we check that cinetic does not

- **No regressions against the last approved cut**, and artist notes are additive. cinetic only says "do not re-report fixed issues"; it never compares against a version a client approved.
- **Characters**: keep the approved drawing, lock characters per world before paid transitions, style rules don't override copied styles, props need real geometry, copy the sheet detail. cinetic has no characters at all.
- **Full-size inspection**: check every instance at 1:1, full-res crops of every close-up and low angle, check frames before a full render. cinetic grabs the fastest frames at full size and uses a 480 px legibility sheet, but has no per-instance rule.
- **Describe what the frame shows**: every caption claim checked against pixels.
- **Text fits its container**, measured, overshoot frame included. cinetic's layout-audit checks safe area, overlap and word count, and only in Remotion.
- **Flash safety**: `flashcheck.py` (WCAG 2.3.1, 3 flashes a second). cinetic has no flash check, and its brand-strobe technique and polarity-flip cuts could trip one.
- **The audio is the clock**: a fixed song or voiceover pinned by hash, words from the source, times from the audio. cinetic writes its own score to its own BPM and has no voiceover path; it says "visual, not narrated".
- **Pipeline hygiene**: verify concat per section, never overwrite a file Robin has open, patch instead of re-render (cinetic's `--frames` splice is the same idea), draft at 720p, vector explainers final at 720p, 9:16 at 720x1280. cinetic insists on 1080p60 masters at CRF 14 with motion blur, the opposite stance.
- **Art direction**: the "reads as" test on full-res crops (broader than cinetic's 64 px mark misread test), climax as the biggest and brightest image (cinetic's "biggest peak at 75 to 90%" is the same idea in energy terms), a light arc across the film, plant the payoff early.

## 4. Remotion versus HyperFrames, and what installing it would change

**Engine tie.** Remotion is the default and the better-supported path. The craft rules and the timing kit are mirrored in HyperFrames (`assets/hyperframes-starter/motion.js`, 338 lines, and `timeline.js`, same names and numbers), `grid-check.ts` runs on `timeline.js`, `lint-film.mjs` reads HTML, and `hf-finish.sh` does the PNG render, CRF 14 encode, mux and gates. Remotion-only: `layout-audit.sh` (safe area, overlap, words per frame, covered text), `sheet.py --comp`, `render.sh` with adaptive motion blur, and the `src/fx` primitives (Chain, TypeOn, RackFocus and so on). HyperFrames blur is capped at 4 sub-frames at 60 fps, so the skill itself says films faster than about 18 px/f "belong in Remotion". Engine-free: `forensics.py`, `av-audit.py`, `probe.py`, `check-sync.py`, `sheet.py` on an MP4, `pick.py`, `palette.py`, `dither-gradient.py`.

**What installing it would change.**
- **Trigger collision.** Its description claims "any video, animation, motion graphic or animated demo made with Remotion, HyperFrames, HTML/GSAP", which overlaps the `hyperframes` skill (which calls itself the mandatory entry point and defaults to HyperFrames), `video-production`, `motion-graphics`, `general-video` and `faceless-explainer`. Two skills would bid for every video ask, and cinetic would steer toward Remotion, reversing the 2026-10-22 decision recorded in `references/motion-lab.md` (HyperFrames keeps the DOM lane).
- **HyperFrames version.** It pins `hyperframes@0.8.79` in `hf-finish.sh` and the starter; our projects pin 0.8.162. `HF_CLI` overrides it, but its "checked against 0.8.79" notes may be stale against ours.
- **Hard bans against our looks.** The IndieAgent explainers use paper #F5EEE1 and #F2EADB with tan #E2D4BA and #8A7350: all inside its banned beige/cream/tan region (HB5), so every critic would raise a P0 unless each line carries a `cinetic:brand-supplied` marker. Artist looks (woodcut, engraving, stained glass, cut paper, charcoal) routinely use serif type, warm palettes, glow and particles, all banned.
- **Frame rate and resolution.** 60 fps for anything with UI or text ("24 fps is never right for UI") against our 24 fps song grid and 30 fps explainers; 1080p60 blurred masters against our 720p rule. The blur pass is 7 to 15 minutes for 10 s on 4 CPUs by its own estimate, which on this Intel Mac collides with "long renders go off the Mac".
- **Sound.** It expects earshot (a second repo in its own venv) and a generated score; it has no slot for an ElevenLabs voiceover or for a song that is the clock.
- **Format.** Launch films cap at 45 s and walkthroughs at 90 s; our explainers run 90 to 95 s with narration, close to its walkthrough row but against its "visual, not narrated" bar.
- **Install side effects.** None hidden that I found: no hooks in `.claude-plugin/plugin.json`, no network calls in the scripts beyond `npx` and ffmpeg. It needs Node 22+, Python with opencv, librosa and pyloudnorm. Worth knowing: its HyperFrames notes say `hyperframes init` installs the vendor's skills into `~/.claude/skills` unless `HYPERFRAMES_SKIP_SKILLS=1`, which is how ours arrived.

## 5. Recommendation, with names

Borrow, don't install. Specifically:

1. **`forensics.py`** into `tools/motion-lab/` (with the MIT notice), retuned for 24 and 30 fps (its holds and spikes are stated in frames at 60) and run on every review MP4 next to `badframes.py` and `flashcheck.py`. By its stated rules it should flag both the "More" worker fault (a frame that differs from two agreeing neighbours is its "ghost" fail) and a dead stretch like the 3.5 s one `hyperframes check` found in the One Show launch clip, on the encoded file, in either lane. Not tested: I did not run it.
2. **`probe.py`, `check-sync.py` and `av-audit.py`** as the finishing gate for anything with a voiceover or score (explainers, Shadow Tales, promos): BT.709 tags, A/V lag, LUFS and true peak. For songs, run only the spec and lag parts.
3. **The verifier pass and the severity scale** into `revision-loop.md`: critics report P0/P1/P2 with a frame and a code-level fix, then one cold verifier tries to refute each P0 and P1 before builders spend time on them.
4. **The text-flow numbers** into motion-lab's Numbers table and the hold check: words visible per frame, fragment chains for long thoughts, copy share at most about 65%, a text-free 1.5 s in every 10 s, reading text at most 3 px/f.
5. **The library and the draw**, filtered: keep `techniques.json` and `pick.py` as a reference for explainers, minus the 125 entries we already cover and the ban-dependent ones, and use `--avoid` with the previous IndieAgent film's picks so the series stops repeating moves. Start with the ten above.
6. **The taste catalogue's non-colour sections** (`references/taste-and-slop.md` A, F, G, I, K, L: feature tour, borrowed props, motion physics, seam stutter, UI data truth, dead holds, pixel stairs) as BANNED-list seeds for explainer briefs.

Drop: the colour and type hard bans, the Remotion render path, earshot scoring, the 60 fps and 1080p-master defaults, and the brand-invention step (our clients bring their own).
