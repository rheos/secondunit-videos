# Quiver: everything we've looked at

One list of every source, idea and look test Robin has sent or we've weighed for the studio, with where it
stands. Check here first when a new link comes in; if it's listed, give the verdict instead of studying it again.
Add a row the same day you look at something, and move it when its status changes.

Tools have their own home with a status per tool: `toolbox/INDEX.md`. Finished looks: `looks/` (and
novadiem.com/video/styles). People we borrow from: `references/<person>/` (Kevin Ngo's works are K01-K44 in
`references/kevin-ngo/works-index.json`). This list links to those rather than repeating them.

**Status:** `next` (queued to test) · `testing` · `adopted` (in our toolkit or method) · `approved` (look test
Robin signed off) · `candidate` (worth a test, not queued) · `parked` (fine, no use for it yet) · `rejected`.

## Queue

| Order | Idea | From | Status | Note |
|---|---|---|---|---|
| 1 | One-spiral-line portrait | Kevin Ngo K29 (Rembrandt after Claude Mellan) | testing | Test 01 rendered 2026-11-01 (Hjeron under the moon, the spiral starts in the moon), waiting on Robin. `hjeron-spiral-portrait/`. |
| 2 | Lyrics lettered into a Rube Goldberg machine | Kevin Ngo K30 (after wustep) | next | A marble runs one machine; each sung line is hand-lettered beside the part it describes; the loop resets on its own story. A lyric-video format. Robin is curious. |
| 3 | Lyric captions: one red key word, boxed term label | Kevin Ngo K31 (plate tectonics music video) | candidate | A caption rule, cheap to try on the next lyric video. |
| 4 | statechart-art pencil kit vs our diagram-plate | Kevin Ngo K24-K26 | candidate | `toolbox/statechart-art-kit.yaml`. Read tools/kit before the next diagram plate. |
| 5 | Stageshow for IndieAgent UI cutaways | Benji Taylor | candidate | `toolbox/stageshow.yaml`. Its virtual clock alone may be worth taking for frame-exact capture of real-time web motion. |

## Looked at

| Date | What | From | Kind | Status | Verdict | Where |
|---|---|---|---|---|---|---|
| 2026-11-01 | Doodles on real footage | Kevin Ngo K28 | look test | approved | Robin: "It lands". Crayon doodles tracked to the camera and to Hjeron, sky doodles behind him. Live on /video/styles. | `looks/doodle-on-footage.yaml`, `hjeron-doodle-on-footage/`, PR #380 |
| 2026-11-01 | Looseleaf pen engine | Kevin Ngo (x.com/kevin_t_ngo/status/2116743334735851819) | tool | adopted | Felt pen beats kit.js's line on stills, boils the same, no render cost; subtle at 720p ("a bit better"). Brush breaks outlines into dashes. Goes into Travel Agent draft 22, cream shots only. | `tools/looseleaf-pen/`, `toolbox/looseleaf-ink.yaml`, PR #367 |
| 2026-11-01 | Stageshow | Benji Taylor (x.com/benjitaylor/status/2116593247854453244) | tool | candidate | Faux product UI skill; default look is SaaS gray, so pair it with a look. | `toolbox/stageshow.yaml` |
| 2026-11-01 | statechart-art | Kevin Ngo | tool | candidate | Pele layouts drawn in pen and pencil, MIT; richer finish than diagram-plate. | `toolbox/statechart-art-kit.yaml` |
| 2026-11-01 | Kevin Ngo's account, Oct 23 to Nov 1 and back catalogue | x.com/kevin_t_ngo | person | adopted | K18-K44 added with what each is for. Best fits: K28 doodles on photos (done), K29 spiral portrait, K30 lyric machine, K31 caption rule. | `references/kevin-ngo/works-index.json`, PRs #369, #371 |
| 2026-11-01 | Benji Taylor's other repos (liveline, drawesome, agentation) | github.com/benjitaylor | tools | parked | A React live line chart, a drawing toolbar, a visual feedback tool for agents. No film use yet. | |
| 2026-10-28 | 0x_mura Rubik's cube, via 0x_kaero's article | x.com/0x_mura/status/2115026640795226402 | source | candidate | The cube is plain three.js; the article's real source, the Anatomy skill, is a candidate for explainers. | `toolbox/anatomy.yaml` |
| 2026-10-28 | satounbd, illustration to 3D | x.com/satounbd/status/2114875593162698894 | source | candidate | See-through cuts one drawing into depth layers; needs a big GPU. | `toolbox/see-through.yaml` |
| 2026-10-28 | Scrolltide | Aman Singh | source | rejected | $299 of scroll-driven website prompts. Web pages, not films. | `toolbox/scrolltide.yaml` |
| 2026-10-28 | Generate-then-trace | seeco's article | method | adopted | A cheap generated clip drives a code rig through MediaPipe pose; for weighted hero moves, not walk cycles. | video-production skill, motion-lab.md; `indieagent-trace-test/` |
| 2026-10-27 | e1genqq, 20 open-source tools | x.com/e1genqq/status/2114445900131013003 | source | adopted | Logged tool by tool. | `toolbox/` (source field) |
| 2026-10-26 | heyrimsha, 10 AI filmmaking repos | x.com/heyrimsha/status/2114672104021148033 | source | adopted | VACE pose is cheaper than Kling (in use); LTX reframe worth a test; rest skipped. | `toolbox/wan-vace.yaml`, `toolbox/ltx-reframe.yaml` |
| 2026-10-22 | Remotion | beamnxw's thread | tool | rejected | Built the same clip in both; same frames and time. HyperFrames keeps the lane; revisit only for React proper. | `oneshow-launch-clip/VERDICT.md`, `toolbox/remotion.yaml` |
| 2026-10-22 | seeco, "What the Viral One-Prompt Videos Are Hiding" | x.com/seeconvm/status/2106096193235259564 | source | adopted | Mostly in house; added generate-then-trace and the blindfold listen. | motion-lab.md |
| 2026-10-20 | beamnxw, "Motion Engineering with Opus 5.5" | x.com/beamnxw/status/2108616740846420354 | source | adopted | Added reference-clip-into-numbers, LAYOUT, scene boundary states. Its $150 launch-clip offer is undecided. | motion-lab.md, #275 |
| 2026-10-11 | Florence, "Opus 5.5 Motion Lab" | x.com/flxrnc/status/2105311836190978392 | source | adopted | The motion-lab tools, brief as numbers, BANNED list, receipts. | `tools/motion-lab/`, `toolbox/motion-lab.yaml` |
