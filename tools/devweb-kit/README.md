# devweb kit

The shared parts of the devweb shorts: narrated vertical films about building with AI, published as **devweb**
(the video side of devweb.org). Series plan, episode list and mascot sheets: `~/Code/novadiem/assistant/ideas/devweb-shorts/`
(Robin's local assistant repo). Reference build: `devweb-ep01-oner/` ("An AI never runs a tool").

## The standard (Robin, 2026-10-29)

**One Three.js world, one continuous camera.** Blink, the mascot, anchors the world. The camera travels between
stations keyed to the narrator's words and never cuts. Each short has one mass moment (ep 1: a field of 34 Blinks
running their loops). Type sits on top as a DOM overlay: the hook, short caption fragments, a slam or two. The finish
is 1080x1920 at 60 fps with motion blur.

- **Blink** is a living text cursor: one squishy mint shape, a dark visor, glowing pill eyes, a tilde sprout, **no
  hands**. The model only writes; the harness (a belt with tools on carabiners) does the acting. Toon shaded, never
  a full 3D render.
- **Narrator:** Chris on ElevenLabs eleven_v4. Every cue sits on one of his words.
- **Palette:** bg `#0d1117`; green `#6ad08a` = the model and "good"; blue `#4f93d6` = tools; amber `#d6a45a` = results
  and output; red `#e0675a` = the failure. A request card is always black with a green outline and green text, the
  same look as the JSON it came from (Robin, ep 1 note at 0:15); a result card is always amber.
- **Topics borrowed from other channels** are covered in our own words and never credited, and no title echoes theirs.

## What is in the kit

| File | What it does |
|---|---|
| `blink-geo.js` | Blink as maths: a superellipsoid body, the visor, eyes, smile and sprout on its surface (proportions measured off the GPT turnaround). `window.BLINK`. |
| `blink3d.js` | `makeBlink` (toon mesh, outline, `face({blink, happy, look, lookY, think, skew, eager})` (skew: a side-eye; eager: wide eyes and a grin), a low-poly option for crowds), `makeHarness` (belt, buckle, gear loop, three tools on carabiners), `glyphTexture`, `toonRamp`. |
| `world.js` | Easing (`io`, `back`, `r01`, `pulse`, `typed`), `cameraPath(KEYS)` (word-keyed camera with a slow drift), `panel()` (canvas-texture panels redrawn only on change), `stage(canvas)` (renderer at the canvas's size, fog, light, toon ramp, floor grid). |
| `vo/tighten.py` | Cuts a take's pauses to the look bible's numbers, keeping the raw take as `vo/voice.raw.mp3`. |
| `vo/vo.py`, `vo/align.py` | Record `<project>/vo/script.json` with Chris as one take; faster-whisper word times -> `vo/words.js` (`VO.w(word, n)`) and `_in/voice.wav`. |
| `sfx_earshot.py` | The sound on the picture from earshot's bank (Leon Lin, MIT): one take per cue kind, each hit one frame after its event, mixed under the voice to -14 LUFS. |
| `finish.sh` | Render at 120 fps, blend pairs to 60 fps (motion blur), restore BT.709 tags, then probe, forensics (cues declared) and flashcheck. |
| `camera-check.mjs` | The camera measured in node, no browser: every key projected to 1080x1920 the way three.js does it. Share of frames the camera moves, holds, one row per move, Blink's visor in shot, overlays against props, prop edges on frame edges, empty frames. Reads the episode's `camera-set.mjs`. |
| `check-graybox.mjs` | The gray box's pass or fail: anchors resolve, keys in order, the camera targets above, overlay timing and margins, banned on-screen words, imports and station exports. The episode adds its own checks. |
| `templates/` | `camera-set.mjs`, `camera-check.mjs`, `check-graybox.mjs` to copy into a new episode. Episode 6's are the worked example. |
| `sync.sh` | Copy the kit into a project as `<project>/kit/` with a VERSION stamp. Never edit a project's `kit/` by hand. |

## Making a short

```bash
# from the secondunit-videos checkout; a new folder per short, allowlisted in .gitignore
tools/devweb-kit/sync.sh devweb-ep02-<slug>
python3 -I tools/devweb-kit/vo/vo.py devweb-ep02-<slug>                               # vo/script.json -> vo/voice.mp3
<viralvision venv python> -I tools/devweb-kit/vo/tighten.py devweb-ep02-<slug>        # pauses: 0.22 s at a stop, 0.15 s at a comma
<viralvision venv python> -I tools/devweb-kit/vo/align.py devweb-ep02-<slug>          # -> vo/words.js, _in/voice.wav
# build index.html (overlays + clock) and the short's world file, copying devweb-ep01-oner's shape
cp tools/devweb-kit/templates/*.mjs devweb-ep02-<slug>/                               # then fill camera-set.mjs with the episode's props
node devweb-ep02-<slug>/check-graybox.mjs                                             # PASS before the animatic goes to Robin
node tools/blueprint-kit/cues.mjs devweb-ep02-<slug>                                  # -> cues.json (BP.CUES)
EARSHOT=<earshot clone> <viralvision venv python> -I tools/devweb-kit/sfx_earshot.py devweb-ep02-<slug>
CINETIC=<cinetic clone>/skills/cinetic/scripts tools/devweb-kit/finish.sh devweb-ep02-<slug> devweb-ep02
```

Iterate with `npx hyperframes@0.8.162 snapshot --at ...` (contact sheets) before rendering; a full finish takes about
15 minutes on this Mac for a 45 s short.

## Rules learned on episode 1

- **Author the composition at 1080x1920.** HyperFrames' `--resolution` only upsamples by whole numbers (720 -> 1080 is
  refused). Type authored on a 720x1280 stage can be scaled 1.5x as vectors; the WebGL canvas renders at full size.
- **The blur step drops BT.709 tags.** `finish.sh` puts them back with `setparams`; probe fails without it.
- **Declare the cues to forensics.** Typed characters look like one-frame pops otherwise.
- **A fading mesh must not write depth.** A near-invisible belt sliding past the visor hid the card for a third of a
  second (forensics caught it). Fade with `depthWrite = opacity > 0.98`.
- **Fading a group fades every material it shares.** Give crowds and clones their own materials.
- **ParametricGeometry winding:** run `u` backwards or the faces point inward and the outline shell covers the body.
- **Size canvas panels for their longest text.** Text past the edge is cut, not wrapped.
- **No one-frame swaps.** Expression changes (eyes to thinking dots) crossfade over about 0.1 s.
- **A tool call is a real call.** The harness takes the request, the tool runs it against a service, the answer comes
  back as text: show the tool working (Robin, ep 1 note at 0:18), not a tile that just glows.
- **Frame for portrait.** Stack stations vertically (question, reply, Blink) rather than side by side, and keep the
  bottom 220 px for captions.
- **A GSAP tween on an element whose transform is also written by hand overrides it.** Keep hand-driven transforms on
  elements GSAP never touches.

## Rules learned on episode 2

- **Set every transform from t on every frame; never `multiplyScalar` or `+=` onto last frame's value.** Snapshots seek
  each frame fresh, so they look right, while the finish renders frames in order and the state piles up. On ep 2 a
  file's stamp pulse multiplied its scale each frame and a giant page washed out 35 to 41.7 s of the first finish; only
  forensics' pop at the far end gave it away. Reset (`scale.setScalar(1)`, `position.copy(...)`) before any branch
  that adjusts it.
- **Frame the camera outside the props.** A key that sits inside a gate post or over a bin reads as a wall of colour;
  check every key on the contact sheet, and route long camera travels around Blink and the stations, not through them.
- **No article URLs on screen** (Robin, draft 2). The end card is the `~/devweb` mark over the whole world, nothing else.
- **No long devweb URLs in the YouTube description either** (Robin, 2026-10-30: "make sure it's not put long urls to
  devweb articles in the video"). At most plain `devweb.org`; never an `/articles/...` path. Ep 2 draft 4 (jBQhfAUXluU)
  went up with the full article URL in its description before this rule.

## Rules learned on episode 3

- **Keep a long straight edge off the frame's outer few pixels.** Forensics' border check fails a run of frames where
  the outer 1-3 px differ from the pixels just inside: on ep 3 the server's blue trim bars sat on the frame edge in four
  shots while the camera drifted. Frame with a margin past any trim, bar or panel edge, top and bottom as well as the
  sides.
- **Two panels in one plane z-fight.** A card standing on a pulled-out drawer at the drawer face's depth flickered in
  hatched stripes (ghosts and spikes at 22-24 s). Keep 0.1 units of clearance between facing panels.
- **No per-frame shake.** A 14 Hz position jitter on a "glitching" card read as one-frame ghosts. Glitch the content
  (values swapping every 0.1 s), not the position.
- **Park props the camera passes close to.** From a pulled-back wall shot, the idle stamp and the server's label
  became dark blurred blobs at the frame's foot. Retract a prop between its moments, or fade it by camera height.
- **sfx_earshot now limits after loudnorm** (-2 dBFS). Single-pass loudnorm plus the AAC encode put ep 3's stamp hits
  at -0.7 dBTP and probe failed.
- **Snap the closing words to the voice.** Whisper put "make" 0.56 s early, before a silence; check the energy
  envelope around every slam and stamp.
- **Check a flight path against every solid it passes.** A card's bezier from Blink to the wall dipped into the
  server's body for a frame and vanished (a 58-point spike). Sample the path and keep it out of every box it crosses.
- **Ease every face value between keys.** Switching Blink from one gaze and smile to another at a time boundary is a
  one-frame jump; forensics flags it as a spike in the frame's centre. Key lookY, look, happy and skew and ease
  between them.
- **A panel that holds still between lines needs a float.** A board showing one word for 1.3 s read as a frozen
  player (forensics' hold check). A slow bob, scale breath or yaw is enough.

## Rules learned on episode 6

- **The picture acts out the narration** (Robin, 2026-11-05, on a finish that had passed every check: "it's boring.
  even the needle which is front and center does not move to the other side"). When the narrator says a thing changed,
  the main prop changes on that word. A prop that several stations watch gets one schedule in `timeline.js`
  (`NEEDLE_SWINGS`, `needlePos(t)` in ep 6) and the prop, Blink and `cues.js` all read it.
- **The camera moves in about 30 % of frames**, with a push on each beat and a move in the hook's first 3 s.
  `camera-check.mjs` projects every key in node and prints the share, and `check-graybox.mjs` fails outside 27-36 %
  or with no move in the first 3 s. Both are in the kit since episode 6; an episode supplies `camera-set.mjs` (its
  props as boxes, and when each is on screen). Run them before the animatic goes to Robin.
- **The checks need two things from the episode's files.** `world.js` keeps its camera keys between `// KEYS-BEGIN` and
  `// KEYS-END` as `[time, position, target, fov, expected time, "subject"]`, and `timeline.js` exports `ANCHORS` as
  `{ name: [word, n, offset, expected time] }` beside `T`.
- **Blink wears the harness only when the film shows it working** (Robin, 2026-11-04). Leave `makeHarness` out
  otherwise; a request card just comes out from Blink.
- **Words on screen are plain.** Ep 6 dropped mode, optional, fts, vector, hybrid, query, param and argument for
  `keywords (old)` and `meaning (new)` after Robin could not follow the animatic.
- **The 120 fps render runs on GitHub.** `CR_MASTER=1 CR_FPS=120 tools/cloud-render/cloud-render.sh --tall <project>
  index.html 0 <end> <raw.mp4> 10` gives 1080x1920; `RAW=<raw.mp4> tools/devweb-kit/finish.sh <project> <name>` then
  blends and checks without rendering. Drafts: `CR_FPS=30 CR_HOLD=20 ... --tall`, 8 slices, about 4.5 minutes.
- **Fix a finish with a patch.** Render only the changed seconds at 120 fps on one runner, splice them into the raw by
  frame number (ffmpeg concat filter, `trim=start_frame:end_frame`, crf 12), finish again. Whoever made the change
  proves in node that frames outside the window are identical.
- **Don't edit `cloud-render.sh` while a render is running.** zsh reads the script as it goes; an edit mid-run failed
  the last steps of a render that had already finished.
- **Runners stall in apt.** On most multi-slice runs 2-4 runners sit 10-40 minutes in `apt-get` before drawing a
  frame. Timeouts and retries in the workflow did not cure it. Unsolved; fewer slices lose less.
- **Per-episode effect levels** go in `<project>/sfx-gains.json` (dB per effect name, `null` to drop one);
  `sfx_earshot.py` reads it when it is there.
- **Declare blinks as cues.** A blink is a real one-frame change and forensics calls it a spike. `cues.js` adds an
  `eye` cue for each entry in `BLINKS`; two blinks 0.12 s apart still read as a flutter, so space them.
- **A sheet or card that appears starts transparent.** A material created opaque showed for one frame before its
  fade began (the log sheet); set opacity 0 at creation and fade with motion.
- **Pauses are per narrator.** 0.22 s stops sounded "all cut up" on Robin's cloned voice; that take uses 0.40 s at a
  stop and 0.28 s at a comma (`"tighten"` in `script.json`). A/B a new voice by ear.
