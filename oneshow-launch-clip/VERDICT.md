# Verdict: Remotion vs HyperFrames on one 20 s launch clip

One brief (`BRIEF.md`), one spec file (`shared/spec.json`), two builds. Issue rheos/secondunit-videos#294,
PR #295. Written 2026-10-22 after my own audit round, before Robin's notes; his call decides whether
anything below changes. Times are Pacific; the full timeline is `docs/RECEIPTS.md`.

## The two cuts

| | Remotion | HyperFrames |
|---|---|---|
| Review MP4 (720 x 720, 30 fps, 600 frames, silent) | `remotion/out/oneshow_remotion_d1_720.mp4` | `hyperframes/renders/oneshow_hyperframes_d1b_720.mp4` |
| 1080 master it was scaled from | `remotion/out/oneshow_remotion_d1_1080.mp4` | `hyperframes/renders/oneshow_hyperframes_d1b_1080.mp4` |
| Stills at 60, 195, 210, 234, 540 | `remotion/out/stills-final/element-NNN.png` | `hyperframes/out/stills-final/at-Ns.png` (2, 6.5, 7, 7.8, 18 s) |
| Stills with the brief's boxes and measured widths | `remotion/out/stills-debug/` (234, 540) | `hyperframes/out/stills-debug2/` (7.8 s, 18 s) |
| Source | `remotion/src/Launch.tsx` (one file, 480 lines with the debug overlay) | `hyperframes/index.html` (one file, 300 lines with the debug overlay) |

Both builds read every frame, colour, box and line of copy from `shared/spec.json`. Frame for frame
they match to text antialiasing: PSNR between the two builds' stills is 31 to 38 dB, every sampled
flat colour is identical to the hex, and every measured line reports the same width in both
(headline 678 of 936 px, stub city 341 of 440, serial 86 of 140, closing line 309 of 936).

## Robin's reaction

Robin watched both review cuts, the Remotion d1 and the HyperFrames d1b 720 x 720 MP4s, back to back in
one VLC window on 2026-10-22 at about 5:35 pm (the whole 20 s of each, no stills), and said: "looks
about the same." That is the designed result: both builds read the same spec, so the picture was never
the thing being compared. No round 2 is spent on making them differ; the comparison stands on the
non-picture measures below (time, rounds, reuse, render and cloud path, the vendor skill).

## Gates

| Gate | Remotion | HyperFrames |
|---|---|---|
| Text fits its container (measured, canvas `measureText` in a debug overlay, both builds) | 12 of 12 lines inside their box | 12 of 12, same numbers |
| Hold after the last word, from the cue data | stub readable at 233, cut at 420: 187 frames = 6.23 s (readHold 3.2 s). Closing line settled 456, end 599: 4.77 s (readHold 1.7 s) | same numbers (same spec) |
| Every hit on its frame (PSNR between consecutive frames of the review MP4) | 193 to 194: 68 dB (still), 194 to 195: 33 dB (press lands), stub region 208 to 209: 68 dB then 209 to 210: 38 dB (the stub's first frame is 210), 419 to 420: 16 dB (the cut), 233 to 235: 70 dB (readable, still) | 73, 35, 72 then 39, 16, 68 dB |
| flashcheck.py | PASS, worst 1 flash in a second (the cut) | PASS, worst 0.5 |
| Vendor check | `tsc` and eslint clean | `hyperframes check`: 0 errors; warnings: silent film, 15 labels under its 28 px phone floor, a 3.5 s dead stretch after round 1 |
| Motion-lab audit | cannot run (below) | cannot run (below) |

## Time from empty folder to an approved-looking cut

Both builds took the same session, about 27 minutes each from scaffold to a cut I would show, and
the two were interleaved, so the honest reading is "one evening for both", not two separate clocks.

| Step | Remotion | HyperFrames |
|---|---|---|
| Scaffold | `npx create-video --yes --blank`: 1 min 10 s (npm install) | `hyperframes init --resolution square`: seconds; `add` x 4: seconds each |
| Vendor skills | `npx remotion skills add` was silent without a TTY; `npx skills add remotion-dev/skills -a claude-code -y` installed 12 skills into `remotion/.claude/skills` (copied, 2.9 MB) | already installed globally (`hyperframes`, `-core`, `-animation`, `-cli`, `motion-graphics`) |
| Reading the skill before writing | router + markup reference + timing, sequencing, compositions, fonts, measuring: about 8 min | router + core contract + motion-graphics workflow + director, builder, webpage module + 4 rules + 2 blueprints + 4 components: about 15 min |
| Writing the build | 10 min (one file) | 6 min (one file, with the Remotion structure already decided, so this number is flattered) |
| First stills | 106 s for 8 frames (first run: bundle, headless Chrome, fonts); 6 s on the second run | 7 s for 8 frames (`snapshot --at`) |
| Round 1, both builds | 4 min | 3 min |
| Review render | 21 s for 600 frames at 1080; `--scale 0.6666667` refused (non-integer height), so ffmpeg scaled to 720 in 2 s | 22 s render (capture 13.7 s on 5 workers, setup 5 s), 26 s wall with npx; no downscale flag (`--resolution` only upscales), ffmpeg to 720 in 2 s |

## Correction rounds

One round, from my own stills, the same two creative notes applied to both builds (four-field form in
`docs/RECEIPTS.md`): the card's lower half was blank for 5.6 s (now a dashed NEXT SHOW slot the stub
grows over), and nothing moved during the 6.2 s hold (now the new show files itself into the list at
frame 300). HyperFrames' craft check had flagged the second one on its own ("dead_stretch 6.00 s");
Remotion has no such check. Neither change was harder in one framework than the other: 20 lines of JSX
with two `interpolate` calls, 14 lines of HTML plus two timeline lines.

Technical fixes in the round: Remotion 2 (eslint rejects `from={0}`; `--scale` must land on integer
pixels), HyperFrames 3 (my CSS `font` shorthand reset the line heights, so text sat at the top of its
box and neither lint nor the layout audit noticed; `data-composition-variables` belongs on `<html>`;
two tweens without a named ease ran on GSAP's default `power1.out` where Remotion's interpolate is
linear). Robin's notes, when they come, go in the receipts as round 2.

## How reusable the pieces are afterwards

- **The cursor press.** Remotion: `Cursor` and `Button` are components; their keyframes read the spec's
  event frames, so dropping them into the next film means passing frames as props (a 10 minute
  change) and importing the file. HyperFrames: the press is six timeline lines plus one CSS rule and
  the cursor SVG; copy and paste, then edit the seconds. The registry has `press-ripple`, but it is a
  self-contained dark pill with its own cursor, its own envelope and a cursor that exits off stage,
  so for a brief with fixed frames it was reference code, not a drop-in. Same for `spring-pop`,
  `typewriter` (its clip mechanism was borrowed, in `ch` units) and `cta-lockup`.
- **The card entrance.** One `spring()` call in Remotion; in HyperFrames the same damping-ratio
  formula as a custom GSAP ease (GSAP has no spring ease in core). Both are five lines; both copy.
- **The measured debug overlay** (boxes plus measured widths, the text-fit gate) copies as is in
  both; it is the piece I would keep for every DOM film, whichever framework.
- **The shared spec** is the real reusable part: both builds consumed the same JSON, and the brief's
  "brief as numbers" template produced it directly.

## Render time and the path to a cloud render

Equal locally: 21 s against 22 s for 600 frames at 1080, both on hardware GPU capture. Remotion's
first run pays about 100 s once (bundle, headless shell download). Neither renders 720 from a 1080
composition natively, so the house 720p draft rule means a 1080 render plus ffmpeg in both.

- **HyperFrames**: `tools/cloud-render/cloud-render.sh --draft oneshow-launch-clip/hyperframes index.html 0 20`
  should work today unchanged: render-slice.mjs already injects the HyperFrames runtime and seeks
  with `__player.renderSeek`, proven on GigCaravan (2,160 frames in 158 s). The only new thing is a
  project folder two levels deep; the script takes `<project> <page>`, so `oneshow-launch-clip/hyperframes`
  as the project name is worth one test. HeyGen also hosts `hyperframes cloud render` (an account).
- **Remotion**: no path in our tools. Options: (1) a GitHub Actions job running `npx remotion render`
  per slice with `--frames=a-b` and the same join (Remotion's docs have a GitHub Actions example;
  half a day with the slicing); (2) Remotion Lambda (AWS, our account exists for billing only) or
  Cloud Run; (3) their hosted render in Studio. Remotion is free for teams of up to three; a company
  licence applies past that.

## How the vendor skill guided the build

**Remotion.** The router is short and the markup rules were all useful and all applied: `interpolate`
inline in `style`, `scale` and `translate` as individual properties, `fps` from `useVideoConfig`,
`@remotion/google-fonts` so the render waits for fonts, `measureText` for fitting, `Sequence` as the
timing boundary. It wanted Studio open before writing a line ("the user wants to see an interactive
preview") and told me not to render unless asked; this was an autonomous run with nobody watching,
so I skipped Studio and rendered. Its layout rule says a 1080 wide headline is 84 px or more; the
brief said 56 and the brief won. It offers no layout, contrast or motion audit: the text-fit gate was
mine to build. eslint caught one thing.

**HyperFrames.** The front door is heavy for a 20 s silent clip: an intent interview, a workflow
install, usage checks, a shot-plan IR and a director-builder subagent split that I ran single-handed.
Past the door the tools earned their place: `catalog --query` found four relevant components in
seconds without an account; `snapshot --at` is the fastest stills tool we have (7 s for 8 frames);
`check` ran lint, runtime, layout, motion, contrast and a craft pass in 8 s and its craft pass raised
a real note I then fixed (the dead stretch), plus a phone-readability floor that the explainer
series' 13 px labels do fail. Its weak spots: components are self-contained units with their own
dark theme, not parts; `add` takes one item per call; `snapshot` cannot take `--variables` (the debug
stills needed a copied project); Google Fonts over a `<link>` render but lint reminds you every time;
the lint did not see my line-height slip. Both skills push against pixel layouts (flex and padding
in both); a numbers brief is a pixel layout by design, and both frameworks took it without complaint.

## The motion-lab audit, and what an adapter would take

Neither build can report probes today. `audit.mjs` on the HyperFrames page: `window.__frameJPEG is not
a function`, then the page's own script throws because `window.__timelines` only exists inside the
HyperFrames runtime. On Remotion there is no page to open: the composition lives behind
`npx remotion render`.

- **HyperFrames adapter**: what `tools/cloud-render/render-slice.mjs` already does (inject the runtime
  from jsDelivr, wait for `__player`, seek with `renderSeek(t)`) plus a DOM probe: after each seek,
  read `getBoundingClientRect()` of every element carrying `data-probe="name"` and
  `data-probe-in="#container"` into `window.__probeLog` in motion.js's record shape, and fire events
  from attribute predicates (`data-probe-event="stub: opacity > 0"`) against the previous frame. The
  audit never uses the JPEG, so `__frameJPEG` can return a 1 px data URL. About 150 lines in
  `frames.mjs` (an `openHyperframes` beside `openLook`), half a day with the example page as the test.
  The same DOM probe would serve the explainer series.
- **Remotion adapter**: either drive the bundle (`npx remotion bundle`) in Playwright through the
  renderer's internal `window.remotion_setFrame` (undocumented, version-bound), or wrap
  `@remotion/renderer`'s browser session (`RenderInternals`), also internal. A day, and it breaks
  on upgrades. The honest alternative is in-composition: the debug prop already measures text and
  could write a JSON report into the DOM for a per-frame `remotion still` to carry out, at a frame
  per second of wall time.

## What broke

- Remotion: `npx remotion skills add` did nothing without a TTY (it shells out to `npx skills add
  remotion-dev/skills --yes` and waits for an agent pick); `--scale=0.6666667` was refused because the
  height came out 720.00004; the first stills run took 106 s; `from={0}` is an eslint error.
- HyperFrames: `add a b c` refuses more than one item; the variable declaration on the root `div`
  was ignored (the reference says `<html>`); `snapshot` has no `--variables`; the registry's
  `press-ripple` and `spring-pop` could not be dropped in as they are; and two of my tweens ran on
  GSAP's default ease until I named them, which is a parity lesson rather than a bug: name every
  ease, "none" included.
- Shared: my CSS `font` shorthand slip, caught only by eye on the stills.

## Recommendation

**HyperFrames keeps the DOM lane. Remotion is not worth carrying as a second framework for this kind of
clip.** On the same brief it produced the same frames in the same time with the same corrections, and
gave nothing back that the brief needed: no audit, no layout gate, no stills tool faster than
`snapshot`, and no path into our cloud render or the motion-lab audit without an adapter bound to
internal APIs. HyperFrames is the same shape as our Canvas looks (a page plus a seek), which is why
`cloud-render.sh` already renders it and why the audit adapter is half a day of DOM probing that
would also serve the explainer series. Remotion's real strengths are elsewhere: React components as
the unit of reuse, Studio editing that writes back to source, TypeScript, Lambda. They would matter
if we rendered an existing React product UI as itself, or inherited a Remotion project from a client.
For 20 second product clips drawn from a numbers brief, one DOM framework is enough, and we have it.

What I would carry over from this trial regardless of framework: the shared spec file as the only
source of frames and copy, the measured debug overlay as the text-fit gate, and "name every ease".
