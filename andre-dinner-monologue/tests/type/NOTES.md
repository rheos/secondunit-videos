# type look test: notes

## BANNED

From the brief, kept out from the first render: random glitch everywhere (the tear fires once, on
"dangerous", f961-f975), words sliding in from the side (every word is simply there on its frame; the
only moving text is the brief's sink in SH06 and the stamp's slam), drop shadows, gradients, a second
accent, any plane or aircraft, Matrix rain.

Reached for in the first render and taken out:

- fading words in over 2 frames: it put every word one frame late on its onset; words now land at full on their frame.
- a shader `dim` uniform for sleep mode: it dimmed the dialog with the rest; sleep is a 2D veil under the tape, the LED and the dialog.
- an additive "lift" to pull the dialog back out of the dim: a flat grey slab over the text. Gone.
- `text()` overriding the layer alpha: panels and boxes faded while their labels stayed at full. Alpha now nests.
- the radar panel staying under the dialog to the end: two instruments at once. It folds away at f1122-f1129.
- a dark `#121110` readout strip: badframes.py reads the lower-right quadrant as near black on this ground (see defects). The strip is now the paper grey of the palette, a printed tape.
- hits starting on the onset (gauge, pop-up): the needle met the peg 2 frames after "money", the box was a dot on "dangerous". They start 2-3 frames early and land on the onset.

Motion-lab defaults also kept out: centred everything (the type column is left-set at 48 px; only the
panels are centred), everything fading in at once, fade-and-slide-up, floating particles, lens flares.

## Known defects

- f1169-f1188: the dialog holds 19 frames after "no", not 36. The section ends at f1188 (the brief allows it; the full film keeps the hold).
- f916: the needle is mid-swing (85%) on the onset frame; it is on the peg at f918. Two frames of travel through the onset, by design, but the still at f916 is not yet red.
- f633: "But" is spoken at f633 and is not shown; the serif line starts at "has" (f634). Deliberate (the question starts at "has"), noted because the shot's first frame is bare apart from the roster.
- f1104-f1106: INDIVIDUAL / SURVIVAL, / Wally, are still fading (2 frames) when ASLEEP lands; SURVIVAL's hold could not end earlier (Wally f1066 + 36 = f1102).
- The readout tape and chrome carry interface words that are not in `_in/cues.json`: REV/S, FPS, 720×1280, the SH codes, T+ and F counters, the `×` count mark. Every English word on screen is either a cue word or one the brief names (status, BORED, PROCESS, BOREDOM, BRAINWASHING, MONEY, DANGER, YES, NO, OK on the pop-up's button).
- The brief's rough shot frames (f600, f760, f1010, f1090, f1150) were moved to the snapped cue each shot answers (f626, f741, f1002, f1104, f1130); the brief's shot 4 text starts at "created" (f844), which the cues put inside the brainwashing bar's time, so WORLD TOTALITARIAN GOVERNMENT lands in SH03 and carries into SH04.
- badframes.py measures `scale=32:18,format=gray`, which maps this look's #0a0908 ground to 0 and needs a mean of 12 in the lower-right quadrant: a near-black frame with a dark strip fails every frame. The paper tape is the fix; a dark-tape version of this look cannot pass that scan.
- The glitch tear reaches the paper tape and the chrome (f961-f968): the shader runs on the whole frame.
- No motion blur (`--shutter`) on the spinning loop; the ghost copies stand in for it.

## For the full film

- Keep the grammar: the column for words, instruments in the lower half, the tape as the only lit surface that never lies. Add one instrument per section, never two at once.
- Snap with the same `onsets.py` rule (-0.15/+0.45 s window, sigma 0.2, neighbour-aware); in this section Whisper was 0.05-0.2 s off, not the 0.3-1 s the note warned about. Re-check the window on sections with faster speech.
- The 36-frame hold rule and the three-line column set the real pace: long clauses need the aside slot (serif, 40 px) so the big column is not asked to hold more than three lines.
- Sound: tape ticks on each tape value change, one stamp thud at f567, a soft click when NO greys, mixed well under the voice.
- The tape's frame counter could count the film's own frames from f0, and the SH codes could become the section numbers from LOOKS.md.
- Chrome labels: decide once whether the tape may use interface words outside the transcript (REV/S etc.) or only numbers; this test uses both.
