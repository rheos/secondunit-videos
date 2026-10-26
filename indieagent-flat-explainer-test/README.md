# Flat-vector explainer look test: the back row

13 s, 16:9, silent. A look test of the flat-vector science-explainer language (the Kurzgesagt manner),
prompted by Finn Ardley's code recreation (https://x.com/finnardley/status/2114188068500508998).
Profile: `../references/kurzgesagt/`. Issue rheos/secondunit-videos#333. Every frame is code; no
image or video model.

## The fact

A drummer hits a cymbal. Light reaches the back of a 100 m field in 100 / 299,792,458 = 0.00000033 s.
Sound at 343 m/s (air at about 20 C) takes 100 / 343 = 0.2915 s. So the back row sees the hit about
0.29 s before it hears it: longer than an eighth note at 120 BPM (0.25 s).

## Honest numbers

- The sound is shown 10x slower than real, and the screen says so ("SHOWN 10x SLOWER").
- The odometer is computed every frame from the sound front's radius: metres / 343 m/s. It eases
  the last half millisecond to 0.292, the rounded value, as the front reaches the listener.
- The scale is set so the gold-ringed listener's head is exactly 100 m from the kit; the ruler's
  ticks and the "M" readout use the same scale.
- Light is not slowed (it would take 3.3 microseconds at 10x); it is drawn as a 0.12 s sweep and
  labelled with its real time.

## Shots

| Time | Beat |
|---|---|
| 0-2.8 | Wide: stage with an amber LED disc and a drummer, a crowd to the right, a moon, stars. Labels THE DRUMMER, BACK OF THE FIELD; ruler 0-100 M draws on. Slow push. |
| 2.8 | Wind-up and hit; sparks off the cymbal; light sweeps the field, every rim flares at once. |
| 2.8-5.7 | Sound front crosses; a spark rides the ruler; each head nods as the front passes; odometer rolls 0.000 to 0.292, gold on arrival. |
| 5.9-9.4 | Push in on the listener: SEES THE HIT 0.000 S, HEARS IT 0.292 S LATER. |
| 9.4-13 | Pull back; card: AT THE BACK OF A 100 M FIELD / 0.29 seconds / between seeing the hit and hearing it / LONGER THAN AN EIGHTH NOTE AT 120 BPM. |

Beats Finn's two weak spots: the moon's craters are projected on a turning sphere (they foreshorten at
the limb and wrap round), and every number agrees with the motion or labels the compression.

## Build and render

One canvas drawn by a pure `draw(t)` (any frame renders out of order), driven by a one-tween GSAP
timeline so HyperFrames can seek it. Grain is four seeded noise tiles chosen by frame number.

    npx --yes hyperframes@0.8.174 snapshot . --at 2.9,4.2,5.9,8.4,12.5 --describe false
    npx --yes hyperframes@0.8.174 render . -q high -o out/back-row-delay_d1_720.mp4
    ffmpeg -i out/back-row-delay_d1_720.mp4 -c:v libx264 -crf 23 -maxrate 4.5M -bufsize 9M -pix_fmt yuv420p -an out/back-row-delay_d1_review_720.mp4

Renders at 1280x720, 30 fps, in about 35 s on the Mac (vector explainers stay 720p). Draft 1 is not
yet watched by Robin; it is not on YouTube, the looks catalogue or novadiem.com.
