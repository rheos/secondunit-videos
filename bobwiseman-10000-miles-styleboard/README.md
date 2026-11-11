# 10,000 Miles: style board

Step 1 of the painted-plate test that came out of the Kevin Ngo K45 study (QUIVER queue 4, issue #465). Two
scenes from Bob Wiseman's 10,000 Miles, each painted in three mediums of our own, so Robin picks a medium
before any plate for a film is made. Method: `toolbox/style-board.yaml`; study:
`references/kevin-ngo/STUDY-lantern-paper-sf.md` (recipe L01).

| | Medium | One line |
|---|---|---|
| 1 | Painted paper layers | cut and torn painted papers, layered like a paper theatre |
| 2 | Tour sketchbook | felt-tip line and watercolour wash in a travel sketchbook |
| 3 | Tin toy | lithographed colour on pressed tin, like a wind-up toy |

Scenes: `liftoff` (a toy rocket leaves a town rooftop at dusk) and `town` (the restless main street at night,
one lit window, a cat, the rocket a point of light). No lyrics in any prompt, no people, no lettering.

## Run it

```bash
./paint.sh paper liftoff        # one plate, GPT Image via Codex on the ChatGPT plan, about 70 s, ~21k Codex tokens
python3 board.py                # needs Pillow; writes out/board.png from the six out/*_16x9.png
```

`prompts.json` holds the medium lines, the two scenes and the shared tail; a prompt is medium + scene + tail.
Plates come back 1536x1024 and are centre-cropped to 16:9. `out/` is gitignored.

## Board 1 (Nov 9, 2026)

Six plates, 0 credits, a few minutes with five painting at once. Read at full size:
- Every sign came back blank and nothing drifted photoreal, with no style image attached.
- **Painted paper layers:** torn-edge clouds and hills and backlit windows read as paper; the buildings read
  more as painted card than as separate cut sheets. If Robin picks it, the plate test paints each depth layer
  on its own (sky, far hills, town, near roofs, props on transparent) and pushes "separate sheets with a gap
  and a shadow between them", which is also what the parallax needs.
- **Tour sketchbook:** the loosest and most musical of the three; the deckled page edge on the night plate is a
  free frame. Line weight varies plate to plate, so a film would need a line rule in the prompt.
- **Tin toy:** the strongest single look and the most toy-like rocket; dents and sheen read at 1:1. It suits a
  rocket song but flattens night (everything stays saturated).

Robin's pick: not yet.
