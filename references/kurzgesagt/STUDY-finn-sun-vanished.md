# Study: Finn Ardley, "If the sun vanished today" (2026-10-24)

Source: https://x.com/finnardley/status/2114188068500508998. 11.6 s, silent, 1920x1080 at 60 fps,
code-drawn with Opus 5.5 per the post. Sampled at 1 and 4 fps on 2026-10-26; times below are screen
seconds, accurate to about 0.25 s.

## Shot list

| Time | What happens |
|---|---|
| 0.0-0.5 | Sun cut off by the left edge, Earth right of centre, small moon below-left. Slow drift. |
| 0.5-1.0 | Leader labels draw on: THE SUN, EARTH. Dot on the body, angled line, flat underline, caps on top. |
| 1.25-3.0 | A spark travels a dashed line from sun to Earth; label 8 MIN 20 SEC on the line. |
| 3.0-4.25 | Labels leave; the sun collapses to a four-point sparkle and goes out. |
| 4.5-7.75 | A countdown, UNTIL EARTH NOTICES, rolls from about 7:33 to 0:00 while a dark disc (the edge of the last light) grows from where the sun was. Small label LAST LIGHT rides its rim. |
| 7.75 | 0:00 turns gold as the dark edge reaches Earth. |
| 8.0-9.0 | The terminator sweeps across Earth; day side goes to night, gold city lights remain. |
| 9.25-11.6 | Card: small caps IF THE SUN VANISHED TODAY, gold "8 minutes", white "of borrowed light". Hold. |

## What makes the look (inference)

- Indigo-to-plum gradient, a fine star field and a few four-point sparkles. Film grain over the whole
  frame, which is what stops the flat fills reading as a corporate vector deck. Take the grain out and
  it looks like clip art.
- Bodies: flat fills, one soft radial highlight, a thin bright rim on the lit side and a darker inner
  edge. The sun adds a faint inner ring, three or four translucent halo rings and faint ray spokes.
  Earth: two greens and an ochre desert, a polar cap, pill-shaped clouds with darker undersides, a
  soft terminator with gold city-light dots on the night side.
- Type: small, wide-tracked capitals in a rounded heavy sans (Nunito or close) on leader lines; the
  line draws first, then the text. One big rounded number per beat; gold marks the number that matters.
- Numbers roll like an odometer with motion blur on the fast digits.
- Motion: slow drift and push-in, a spark on a dashed line, a body collapsing to a point, a wavefront
  sweeping across.
- One fact, one number, one card. The whole clip is in service of "8 minutes".

## Where it goes wrong (fact, from the frames)

1. **The planet is a flat map on a disc.** Continents and clouds keep their shapes right up to the
   limb instead of foreshortening; clouds stop at the edge instead of wrapping round; nothing rotates.
   A sphere needs its features projected: lat/lon to x, y, z, squash each feature by z near the edge,
   hide it when z < 0, turn the longitude with time. Our test does this on its moon (craters).
2. **The numbers disagree with screen time.** The label says 8 MIN 20 SEC, the countdown appears at
   about 7:33 to 7:53 with no reason given for the missing time, and then about 7.5 minutes runs out in
   about 3.25 s of screen time (roughly 140x) with no label saying the clock is sped up. A viewer who
   reads the numbers sees them run at the wrong speed. Fix: either tie every on-screen number to what
   is moving (our odometer is the sound front's position divided by 343 m/s), or label the
   compression in plain words ("SHOWN 10x SLOWER", "1 SECOND = 2 MINUTES").

Smaller: the end card lands at about 9.6 s and holds 2 s, which is fine; the countdown's last
digit blur reads well; the LAST LIGHT label riding the dark rim is the best device in the clip.

## Borrowed into `indieagent-flat-explainer-test`

Gradient night with grain; bodies with one highlight, rim and dark edge (heads, kick drum, moon,
the stage's LED disc as our "sun"); leader labels; spark on a dashed ruler; wavefront (the sound,
plus a near-instant light sweep); odometer with blur; gold on the one number; a final card.
Not borrowed: the sun/Earth subject, the countdown, any layout.
