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
| `blink3d.js` | `makeBlink` (toon mesh, outline, `face({blink, happy, look, lookY, think})`, a low-poly option for crowds), `makeHarness` (belt, buckle, gear loop, three tools on carabiners), `glyphTexture`, `toonRamp`. |
| `world.js` | Easing (`io`, `back`, `r01`, `pulse`, `typed`), `cameraPath(KEYS)` (word-keyed camera with a slow drift), `panel()` (canvas-texture panels redrawn only on change), `stage(canvas)` (renderer at the canvas's size, fog, light, toon ramp, floor grid). |
| `vo/vo.py`, `vo/align.py` | Record `<project>/vo/script.json` with Chris as one take; faster-whisper word times -> `vo/words.js` (`VO.w(word, n)`) and `_in/voice.wav`. |
| `sfx_earshot.py` | The sound on the picture from earshot's bank (Leon Lin, MIT): one take per cue kind, each hit one frame after its event, mixed under the voice to -14 LUFS. |
| `finish.sh` | Render at 120 fps, blend pairs to 60 fps (motion blur), restore BT.709 tags, then probe, forensics (cues declared) and flashcheck. |
| `sync.sh` | Copy the kit into a project as `<project>/kit/` with a VERSION stamp. Never edit a project's `kit/` by hand. |

## Making a short

```bash
# from the secondunit-videos checkout; a new folder per short, allowlisted in .gitignore
tools/devweb-kit/sync.sh devweb-ep02-<slug>
python3 -I tools/devweb-kit/vo/vo.py devweb-ep02-<slug>                               # vo/script.json -> vo/voice.mp3
<viralvision venv python> -I tools/devweb-kit/vo/align.py devweb-ep02-<slug>          # -> vo/words.js, _in/voice.wav
# build index.html (overlays + clock) and the short's world file, copying devweb-ep01-oner's shape
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
