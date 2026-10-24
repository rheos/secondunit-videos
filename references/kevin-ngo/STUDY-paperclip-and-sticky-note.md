# Study: "A short film about a paperclip and a sticky note"

Kevin Ngo, posted 2026-10-20 09:40 Pacific (K10 in `works-index.json`).
https://x.com/kevin_t_ngo/status/2112584730856366140
"Every frame drawn in code by Claude Opus 5.5." 1080x1080, 24 fps, 59.6 s, with sound.

Studied 2026-10-20 from the posted MP4: one frame per second, half-second bursts around every
scene change, full-size crops of the desk, the sky and the final heart, and a scene-cut detection
pass (ffmpeg `scene > 0.25`). No frames are committed here; the contact sheets stayed in session
scratch. Watch the post before building on any of this. No "how this was made" reply had been
posted when fetched (2 replies, 4.1k views).

Everything in "What happens" is read off the frames. Where a beat was ambiguous at the sampling
rate it is marked (reading). "The recipes" is our inference about why it works.

## What happens

The cuts land on multiples of 64 frames (2.67 s at 24 fps). Most shots are one unit, the big
moments 1.5 or 2 units. Times below are from the cut detector.

| # | Time | Shot |
|---|---|---|
| S1 | 0:00-2.7 | Office desk at night, wide. Green banker's lamp, a monitor with a yellow sticky note (two dots and a smile) on its top-left corner, a full moon and lit towers in the window. A paperclip stands on the desk and bends itself into a heart; its two eyes sit in the right lobe. **Heart 1.** |
| S2 | 2.7-6.3 | Closer. The note's top corner lifts, its face turns worried. The heart unbends into a tall hook reaching up toward it. |
| S3 | 6.3-8.0 | The note peels off and tumbles past the monitor. The clip stretches as tall as the lamp. |
| S4 | 8.0-10.7 | Wider desk (phone, pen cup). The note drifts right over the desk; the clip, a plain clip again, watches from the mouse mat. |
| S5 | 10.7-13.3 | The clip bends into a bicycle (frame plus two wheels) and rides across the keyboard after the note. |
| S6 | 13.3-16.0 | The desk edge as a cliff. The bicycle brakes at the edge; the note floats down out of frame; a coiled phone cord hangs over the side. |
| S7 | 16.0-18.7 | Tilt down the side of the desk. The clip, now a long hook, slides down the coiled cord toward the floor, radiator and window below. |
| S8 | 18.7-21.3 | Floor. The clip coils into a spring; the note lands on it and bounces (sparkle lines). A robot vacuum slides in from the right. The note is blown up toward the window; the clip ends up riding the vacuum (reading). |
| S9 | 21.3-24.0 | The sill of an open window, seen from below: a stack of paper. A sheet lifts, folds itself into a paper plane in three stages (crease, wings, finished dart) and launches. The clip climbs the window frame as a hook (reading). |
| S10 | 24.0-26.7 | Outside. From here every exterior is a ragged marker rectangle on cream paper (see recipe 8). The clip has bent into a wing shape and flies among paper planes; the note floats over the city. |
| S11 | 26.7-32.0 | The clip-bird and the planes wheel around the note. White darts and V-shaped gulls against vertical navy marker strokes; the office tower's mullion runs up the left edge. |
| S12 | 32.0-34.0 | Wide, from inside the office (chair, printer): through the window the planes fly in a heart formation around the note. **Heart 2.** |
| S13 | 34.0-37.3 | Big close-up, the note fills a third of the frame, smiling; the clip-bird glides past. At 37 s the note's mouth drops open: the planes scatter and it is blown against the tower (reading). |
| S14 | 37.3-41.3 | Tilt up the tower's window frame; exterior of the tower, the note stuck to the glass of a lit window; a long wire with a hooked end comes down from the top left toward it. |
| S15 | 41.3-45.3 | The hook reaches the note's edge and the clip clips itself on (41.5 s). The note's face goes from worry to a smile. Clipped together they float down past the tower, moon above. |
| S16 | 45.3-48.0 | Over an endless city grid in perspective. A thin yellow line appears on the horizon behind them and widens into dawn over about three seconds. |
| S17 | 48.0-50.7 | Dawn: a sky of horizontal lavender and peach marker strokes, the sun on the skyline. Cut to the tower facade in morning light with the pair tiny against it, then the open window from outside. |
| S18 | 50.7-53.7 | The desk at dawn, lavender sky in the window. The note lies flat on the desk in the lamp's pool of light, the clip on its corner. |
| S19 | 53.7-55.3 | Close. The clip's free end is bent into a small heart and stays that way. **Heart 3.** The note has a dog-eared corner and blinks. |
| S20 | 55.3-59.6 | An empty open-plan office with the ceiling lights coming on; back to the desk, wide; "opus 5.5" in small lowercase bottom right; fade to black with the music. |

Sound: a quiet score runs the whole length with regular soft attacks and fades out over the last
three seconds. Judged from the loudness envelope, not by ear; Ngo's other films use scores composed
note by note in code on CC0 orchestra samples (K13, K14), so this one probably is too (inference).

## The recipes

Numbered so a storyboard can cite them (Ngo P01...). The first six are new to our notes; 7-14
sharpen things we already do.

**P01. One body, many tools.** The paperclip never gets hands. Its whole character is that one
wire can re-bend: heart (S1), hook (S2, S7, S14), bicycle (S5), spring (S8), wings (S10-S13), clip
(S15). Every obstacle is solved by a new bend, and the bend is the gag. To use it: pick a character
made of one continuous material (wire, string, ribbon, tape, a guitar cable, a mic lead) and solve
each beat by re-forming it. Ban limbs.

**P02. Pair the shape-shifter with a drifter.** The note can only peel, flutter and stick. It is
moved by air; its agency is its face. A passive partner makes the active one's inventions legible,
and gives the film someone to worry about. Two actives would be noise.

**P03. The climax is the object's job.** A paperclip exists to hold paper. The whole chase ends with
the clip doing exactly that (S15), and the union is literal. Find the character's real function and
make it the emotional payoff, not a metaphor for it.

**P04. The same symbol three times at rising cost.** Heart 1 is a private gesture (the clip bends
itself, 2 s). Heart 2 is orchestrated (a flock of planes in formation, wide shot, 32 s). Heart 3 is
permanent (the clip's end stays bent, 54 s). First and last shots rhyme: same desk, same lamp, one
visible change.

**P05. Desk as landscape.** Desk edge = cliff, phone cord = rope, keyboard = cobbles, robot vacuum =
beast, open window = the way out, a ream of paper = a flock. The camera stays at object height,
so a 60 cm drop reads as a fall from a tower. Nothing in the office is invented; everything is
re-scaled by the point of view.

**P06. The world takes their side.** Sheets fold themselves into planes (S9); the planes flock and
form the heart (S12); dawn arrives while they fall (S16). Once the lovers leave the desk, the
inanimate world helps. Before that it only threatens (failing glue, the edge, the vacuum).

**P07. One colour arc, paid off indoors.** Night is navy and indigo with scattered yellow windows.
Dawn starts as a thin yellow horizon line behind the characters (S16), widens for about 3 s, then
owns a whole shot (S17: horizontal lavender and peach strokes). The pay-off is that the office at
the end is lit lavender (S18): the night was long, and we feel it without a clock. Compare the
paper boat's day-night-dawn arc (K04).

**P08. Paper frame outside, full bleed inside.** Exteriors are drawn as ragged marker-filled
rectangles with cream paper showing at the torn edges (S10-S17). Interiors fill the frame, but their
walls are the same cream as the paper, so the cut from desk to sky reads as one world. The paper is
the office; the sky is a drawing on it. New device for us; cheap to do in canvas (one jagged mask
per exterior shot, same seed for the whole run).

**P09. The lamp pool is home.** The banker's lamp throws a soft ellipse on the desk. The film opens
with the clip inside it and ends with both of them inside it (S18-S19). Light marks home; nobody
says so.

**P10. Faces: two dots and a mouth, on the object's flat plane.** Four states only: content,
worried, open-mouthed shock, happy. They read at 60 px (S16) and at 400 px (S13). The clip's eyes
are two dots inside its loop, and that is enough for it to look at things.

**P11. Follow the prop between shots.** The phone cord carries the camera from desk edge (S6) down
the side (S7) to the floor (S8). The window carries inside to outside (S9 to S10) and back (S17 to
S18). This is our transitions-follow-an-element rule applied to props rather than to morphs.

**P12. Cut on a grid.** Cuts fall on 64-frame multiples (2.67 s). Most shots are one unit; the
chase (S14-S15) takes 1.5 units each. With a score, that is a bar. Our audio-as-clock grid does the
same thing; the lesson is how few shots a minute needs (about 22) when each one has one job.

**P13. One highlight per material.** Brass: a pale band. Chrome wire: one white streak plus a dark
edge. Monitor glass: a diagonal glare band. Sticky note: diagonal pencil hatching in a darker
yellow, a lifted corner showing its lighter underside. Night sky: vertical marker strokes, each tower
a darker vertical bar, windows as scattered yellow rectangles, stars as dots. Dawn sky: horizontal
strokes. Nothing has two tricks.

**P14. Sign it small.** "opus 5.5" in lowercase, bottom right of the last shot, over the fade.

## Where it bears on our films

- **Travel Agent** (`bobwiseman-travel-agent`): already built in his manner and already a
  journey-home. P01 and P03 are the open questions: what is the one material the protagonist is made
  of, and what is its job? P08 would let the travel scenes be drawings on the agent's paper.
- **10,000 Miles**: P07 (one colour arc across the whole distance) and P12.
- **IndieAgent explainers** (ticket stub, guitar pick, set list): P01 and P02 give the ticket stub a
  partner; P05 makes a merch table or a van dashboard the landscape. See the artist-facing-visuals
  rule: musician objects, never tech.
- **Canvas loops**: P04 (three hearts) is a loop structure in disguise: gesture, echo, permanent.
