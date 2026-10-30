# devweb episode 1: "An AI never runs a tool"

The demo short for the devweb channel (the video side of devweb.org): 720x1280, 30 fps, about 48.6 s, narrated by
George (ElevenLabs v4), captions burned in. Series plan, look kit and episode list live in
`~/Code/novadiem/assistant/ideas/devweb-shorts/` (README.md, episodes.md, episodes-ranked.md: this is #1, ranked 1st).
It is also the first film to use the borrowed parts of the Leon Lin study (`references/leon-lin/`): cinetic's technique
draw and QA scripts, and earshot's sound bank.

## Facts

Every claim maps to devweb's glossary entry `content/glossary/tool-calling-loop.mdx` (devweb repo): "A model does not
run a tool. It emits a request to run one, the harness runs it, and the result comes back as more context. The loop is
that handoff, repeated until the model stops asking." and "The rest of the harness decides what the model may do."
The weather call, Nelson, 4°C and rain, and `rm notes.md` are synthetic examples.

## Pipeline

1. `vo/vo.py` records the script as one continuous take (587 characters, 43.6 s).
2. `vo/align.py` (faster-whisper small.en, timing only) -> `vo/words.js` (`VO.w(word, n)`) and `_in/voice.wav`, voice
   placed at 0.6 s, 4.4 s tail for the end card.
3. `index.html`: one root composition; every cue is on a word of George's.
4. `node ../tools/blueprint-kit/cues.mjs .` -> `cues.json` (111 cues).
5. `EARSHOT=<earshot clone> <viralvision venv python> -I sfx_earshot.py` -> `_in/sfx.wav`, `_in/mix.wav`
   (-14 LUFS, -1.5 dBTP).
6. Render: `npx hyperframes@0.8.162 render -f 30 -q draft` under the shared render lock.

## Look

The devweb look kit (series README, "Look: four treatments"): beat I kinetic type, II camera dive, III isometric
machine, IV light in the wires, V kinetic type and the end mark. Green is the model, blue tools, amber results, red the
failure; the request card is always white.

## The cinetic draw (seed 101, `pick.py --format feature --energy calm --seconds 48`)

Kept, retold in this film's objects:

| Pick | Where |
|---|---|
| `oh-cropped-word-pull-back` | frame 0 sits at 3.2x on "runs", first glyph cut by the edge; log-space pull back to the line |
| `ty-blur-focus-word-rise` | "It can't." / "It only writes text." and every caption phrase |
| `mi-send-ghost-handoff` | the JSON card lifts off as a white card and leaves its ghost in the reply |
| `tr-path-relay` | that card carries the eye from the chat down into the machine |
| `cl-ink-resolve` | the result card rises grey off the weather tool and resolves to amber |
| `ui-progress-spine-steps` | retold as the loop's three steps: Ask. Run. Read. |
| `cam-lead-follow` | the loop layer leans after the packet (0.08 of its offset) |
| `le-device-becomes-mark` | the white request card comes back and becomes the `~/devweb` mark |

Dropped: `pd-single-control-hero`, `ui-live-reflow` (no product control or resizing UI here), `dn-answer-card-bars`
(no numbers in this episode), `lc-live-split-view` (the machine says it better). Added by hand from the study's top
ten: `ps-faster-each-repeat` (the "again and again" laps run 0.62, 0.42, 0.30 s).

## Findings

- **earshot's sound bank runs natively on this Intel Mac.** `earshot sfx render` imports only numpy and soundfile,
  so `PYTHONPATH=<clone> <viralvision venv python> -m earshot sfx render <id>` works with no Docker image and no
  PyTorch. The study assumed the 3.1 GB Docker image; that is only needed for the model-based commands (`timeline`,
  `find`, `critique`).
- `hyperframes check` flags the isometric faces as `escaped_container` and the cards on the iso floor as overlaps:
  expected for CSS 3D (the faces are rotated out of their parent's plane).
- A GSAP tween on an element whose transform is also written by hand (the hook's zoom camera) overrides the hand-written
  transform. Keep hand-driven transforms on elements GSAP never touches.
