# Study: "A paper boat goes on a journey"

Kevin Ngo, posted 2026-10-18 20:30 Pacific (K04 in `works-index.json`). Subscriber post: study only,
never republish, and no frames are committed here.
https://x.com/kevin_t_ngo/status/2112023450340757997
"Claude Opus 5.5 drew every frame of this animation using JavaScript." 1080x1080, 24 fps, 60.0 s,
with sound.

Studied 2026-10-21 from the posted MP4 (read from the post in Robin's signed-in browser, because the
public fxtwitter API cannot see subscriber posts): one frame per second as two contact sheets,
full-size crops of the opening sill, the heron's reflection and the lantern water, a frame strip
across one cut, and a cut-detection pass. At ffmpeg `scene > 0.25` the detector finds nothing,
because the cuts change place but keep the boat, the water and the value range. At 0.08 it finds 25
changes, about every 2.5 s. The cuts are hard cuts, not dissolves (checked frame by frame across the
bridge-to-heron cut at 8.2 s). No "how this was made" reply had been posted when fetched. K10 (the
paperclip) is studied in `STUDY-paperclip-and-sticky-note.md`; recipes here continue its numbering.

Everything in "What happens" is read off the frames. "The recipes" is our inference about why it
works.

## What happens

Times are from the 1 fps sheets, so each is good to about a second.

| # | Time | Shot |
|---|---|---|
| B1 | 0-3 | A canal house: cream wall, blue window, red geraniums on the sill. A black cat with one white paw sits beside a folded paper boat with a goldfish drawn on its sail. The canal below mirrors the wall. |
| B2 | 3-4 | Close-up of the cat's face and paw on the sill, about twice the scale. |
| B3 | 4-7 | Wide again. The cat lies down and the boat is on the water, drifting off; the cat leans over to watch it go. The house next door is pink with a green door. |
| B4 | 7-8 | A canal bridge seen head-on, washing on a line overhead; the arch and its reflection make a full ring, the boat in it. |
| B5 | 8-11 | A polder: green hill, three windmills, a heron standing in the water. Hill, mills and heron all mirrored upside down. Locked camera; the boat drifts left to right under the heron. |
| B6 | 11-13 | A forest river in white water; the boat tips between mossy rocks. |
| B7 | 13-15 | The lip of a waterfall, seen side-on: the boat at the edge, mist below. |
| B8 | 15-19 | The fall from below, then its plunge pool: cloud-shaped mist, palms, the boat bobbing out of the spray. |
| B9 | 19-21 | Jungle: giant pink hibiscus, red parrots in a row on a branch, a fallen petal on the water. |
| B10 | 21-24 | Dark jungle pool under a light shaft, one hibiscus, blue butterflies settling on the boat. |
| B11 | 24-27 | Dusk, purple and pink: a pagoda skyline, the water full of lit lotus lanterns. The boat is one lantern among them. |
| B12 | 27-29 | Night sea, full moon, the boat leaving a glowing wake; a black cloud bank moves in. |
| B13 | 29-32 | Storm: rain streaks, a lightning flicker, a dark swell. The boat rides one wave, then only ripples are left. |
| B14 | 32-33 | Underwater, dark green: the boat sinking, bubbles rising from it. |
| B15 | 33-36 | A waterspout drops from the clouds and lifts the boat off the sea. |
| B16 | 36-40 | Above the clouds under the full moon: the boat sails across the cloud tops as if they were water, past a shooting star, smaller and smaller. |
| B17 | 40-42 | A hole opens in the clouds; through it, far below, a dark landscape with a winding river. The boat sits at the edge. |
| B18 | 42-44 | Cut home: the same window at night, lit from inside, the cat sitting up and watching the sky. The moon's reflection lies in the canal. |
| B19 | 44-47 | The boat floats down past a cloud bank toward the dark land and its river. |
| B20 | 47-49 | Dawn: horizontal bands of violet, pink and peach, a pale moon, the boat gliding down through them. |
| B21 | 49-50 | A town at dawn, pastel rows of houses and a green church spire; the boat sails over the roofs. |
| B22 | 50-53 | The house again in pink dawn light. The cat is asleep, curled on the sill; the boat lands beside it. |
| B23 | 53-55 | Close-up, the same scale as B2: the cat's white paw reaches out and touches the boat. |
| B24 | 55-60 | Wide. The light warms from pink to the cream daylight of B1, and the last frame is the opening composition, except the cat is now asleep with the boat tucked against it. |

Sound: mean -18.7 dB, peaks at -1 dB, judged from the levels only, not by ear.

## The look

- **Flat colour with a fine speckle over everything.** Every fill is one flat value with a sparse
  grain of lighter and darker dots, the same grain in every shot, so 22 places read as one set of
  prints. No gradients, except sky bands made of flat stripes (B20) and soft pools around the moon.
- **Ink only where it matters.** The cat, the boat and the sill carry a thin warm-dark outline.
  Scenery (hills, walls, trees, clouds) has no outline at all; edges are where two flat colours meet.
  Compare P10-P13 in the paperclip film, which outlines everything solid in marker.
- **Shadows as hard flat shapes.** The sill casts a darker trapezoid on the wall (B1); there is no
  blur anywhere.
- **Water mirrors the scene.** See P15.
- **One constant prop.** The boat never changes its drawing: white folded paper, two pale grey facet
  shades, a small orange goldfish with three bubbles on the sail. See P16.
- **Palette by place.** Each location gets its own small palette (cream and teal; polder green and
  sky blue; jungle magenta and dark green; dusk violet and lantern pink; night navy; storm grey), and
  the film's whole range runs day, dusk, night, storm, night, dawn, day.

## The recipes

Numbered after the paperclip study's P01-P14, so a storyboard can cite either.

**P15. Put every place on water and mirror it.** Every shot except two (underwater, above the
clouds) has water in its lower part, and the water shows the scene above it redrawn upside down:
the wall's bricks (B1), the bridge arch closing into a ring (B4), the hill, windmills and heron
(B5), the pagoda skyline (B11). The reflection is lighter and cooler than the original and is cut
by thin horizontal gaps; point lights (lanterns, windows, the moon) reflect as dashed horizontal
bars rather than a mirrored shape (B11, B18). The water is the one ground that runs from a canal to
a jungle to the open sea, so it carries continuity. Cheap in canvas: draw the scene, draw it again
flipped below the waterline at reduced alpha with a tint, then mask it with a few horizontal gap
lines.

**P16. One prop never changes.** Everything else in the frame is replaced every 2.5 s, but the boat
stays the same drawing at roughly the same size, low and near the middle of the frame. That
constant is why the hard cuts never feel disorienting. Pick the one thing the audience follows and
freeze its design; let the world do the changing.

**P17. Each place is one postcard.** One location per shot, one palette, one signature creature or
prop (heron, parrots, butterflies, lanterns, moon), a locked camera, and the boat drifting through.
That is how about 22 places fit in 60 s: each is one readable image, held for a single grid unit,
then gone. No place gets a second shot except the waterfall (lip, fall, pool) and the clouds.

**P18. Home keeps time.** One cut back to the cat (B18), sitting up at the lit window at night,
watching the sky. It is the only shot away from the boat. It says the partner is waiting and that a
whole night has passed, and it sets up the return. Compare the paperclip film's lamp pool (P09).

**P19. Peril, then the world lifts.** The storm sinks the boat (B13-B14); a waterspout, the storm's
own weapon, lifts it into the sky (B15); it sails on the clouds as if they were sea (B16) and comes
down through a hole in them (B17). The escalation goes as far as the impossible and then turns
gently downward toward home. This is P06 (the world takes their side), with the turn made by the
thing that caused the danger.

**P20. End on the first frame.** The last shot is the opening composition with one change (the cat
asleep, the boat tucked in) and the light walks back from dawn pink to the opening's cream daylight
(B22-B24). The film can loop into itself. The paperclip film rhymes its first and last shots (P04);
this one makes them the same frame, which is the loop structure our Canvas loops need, at film
length.

**P21. Bracket with two close-ups.** The only close-ups are B2 and B23, both on the cat's paw, at the
same scale. The journey between them is all wide shots. The two close-ups are the emotion; the
middle is the adventure.

**P22. The cut grid is 2.5 s.** Changes land about every 2.5 s (60 frames at 24 fps); the bigger
places hold two or three units (polder, plunge pool, lanterns, clouds). See P12 for the paperclip
film's 64-frame grid.

## Where it bears on our films

- **Travel Agent** (`bobwiseman-travel-agent`): the same journey-out, journey-home premise, already
  in his manner (the `fieldguide` look). P16 (one constant prop through every place) and P17 (each
  destination as one postcard) are the open moves; P20 would let the ending land back on the first
  frame.
- **Canvas loops**: P20 is a full-film loop; P15 reflections cost little and give every loop a
  second image for free.
- **10,000 Miles**: P17 for the places the song names, P22 for the grid.
- **IndieAgent explainers**: a ticket stub or a guitar case as the constant prop (P16) travelling
  through the venues of a tour, one postcard each, home at the end. Musician objects only (see the
  artist-facing-visuals rule).
- **Closest looks we have**: `fieldguide` (Travel Agent: flat fills, grain, code-drawn). None of our
  catalogue looks uses mirrored water as a rule (only `wakinglife`, a rotoscope look, mentions
  reflections).
