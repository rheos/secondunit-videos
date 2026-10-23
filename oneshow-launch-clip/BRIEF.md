# One Show launch clip: the brief as numbers

One 20 second product clip, built twice from this file: once in Remotion (`remotion/`), once in
HyperFrames (`hyperframes/`). Same copy, same assets, same typeface, same event frames, so the
frames compare 1:1. Template: `tools/motion-lab/README.md` "The brief as numbers". Issue
rheos/secondunit-videos#294. Both builds read `shared/spec.json` (frames, copy, palette, layout);
this file is the human version of the same numbers.

```text
GOAL: an artist sees their own tour screen, adds one show, and gets a ticket stub back: one show,
      entered once. They should feel "that is all it takes" and read the IndieAgent name at the end.
OUTPUT: 1080 x 1080, 30 fps, 600 frames (frame 0 to 599), silent. Review render at 720 x 720.
TIME: 20.0 s x 30 fps = 600 frames; no loop; no music, so no BPM. Event frames are fixed:
      headline fully in by 18; card settled by 42; cursor reaches the button at 180; press at 195
      (down 195 to 198, release 198 to 212); stub appears at 210; stub readable by 234 (text at full
      opacity, scale settled); closing cut at 420 (hard cut); logo settled by 435, wordmark by 450,
      line by 456; end at 599.
LOOK: the explainer series palette (indieagent-one-show): paper #F2EADB with the edge #E2D4BA,
      line #8A7350, ink #1E1A14, label #5E4E33, card #F5EEE1, the one accent red #C8341E (text on
      paper #A82B18). Typeface Archivo (800 headline and city, 600 venue, 500 line) and JetBrains Mono
      (400 fields and date, 500 serial), from Google Fonts in both builds. The IndieAgent mark
      (assets/indieagent-mark.svg: #1C222D square, #E8A33D dot) keeps its own colours.
      No gradients except the paper's radial edge. Line weight 1.6 px on the card, 1 px hairlines.
LAYOUT: origin top-left, 1080 x 1080 canvas, outer margin 72 (safe area).
      headline      x 72   y 96   w 936  h 72    Archivo 800 56 px, centred, one line, ink
      card          x 140  y 220  w 800  h 640   rx 16, fill card, stroke line 1.6; title bar h 44,
                                                 label "YOUR TOUR" 15 px at x 168 y 248
      list column   x 172  y 300  w 300          three mini tickets 300 x 64, step 78, mono 16 px
      date field    x 520  y 300  w 388  h 56    label "DATE" 13 px above at y 290, mono 20 px value
      venue field   x 520  y 400  w 388  h 56    label "VENUE" at y 390
      button        x 520  y 492  w 388  h 72    rx 10, accent fill, "Add show" Archivo 600 24 px paper
      stub          x 190  y 620  w 700  h 200   notched ticket, perforation at x 690, stroke 2 px
        date line   x 220  y 668                 mono 26 px "THU · NOV 12 · 2026"
        city        x 220  y 735                 Archivo 800 54 px "NELSON, BC"
        venue       x 220  y 780                 Archivo 600 26 px "THE ROYAL"
        admit       x 720  y 668                 label 14 px "ADMIT ONE"
        no.         x 720  y 740                 label 14 px "NO."
        serial      x 720  y 795                 mono 500 48 px "054", accent text
      cursor        36 px tall arrow, ink fill, paper outline 2 px, hot spot at the tip
      closing card  logo 160 x 160 centred at (540, 440); wordmark "IndieAgent" Archivo 800 64 px
                    centred, baseline y 590; line "Your tour, kept straight." Archivo 500 30 px label
                    colour, baseline y 650
      layer order, back to front: paper, card, list, fields, button, ripple, stub, cursor, headline
MOTION: easings by name; springs as damping ratio + Hz; durations in frames at 30 fps.
      headline in      0 to 18     opacity 0 to 1, y +16 to 0, outExpo
      card in          12 to 42    scale 0.96 to 1, opacity 0 to 1, spring 0.85 at 2 Hz (no bounce
                                   visible), list and fields ride with the card
      cursor enters    54 to 72    from (1000, 1000) to the date field (560, 328), outQuint
      click date       78          cursor scale 0.86 for 3 frames and back, caret appears
      type "NOV 12"    84 to 108   4 frames per character, steps, caret blinks every 15 frames
      cursor to venue  110 to 124  outQuint
      click venue      126
      type venue       130 to 164  "The Royal, Nelson" 17 characters at 2 frames each
      cursor to button 166 to 180  outQuint, lands 6 px right and 4 px below the button centre
      hover            182         button darkens 6% (feedback), cursor holds
      press            195 to 198  linear: button scale 0.94, cursor scale 0.86, together
      release          198 to 212  back.out 1.6 on both; one ripple ring from the click point, scale
                                   0 to 4, opacity 1 to 0, power2.out, 199 to 217
      form clears      212         fields empty over 6 frames
      cursor parks     204 to 218  outQuint to (990, 905), clear of the stub
      stub in          210 to 231  scale 0.6 to 1, y +24 to 0, opacity 0 to 1, power3.out, origin
                                   top centre (it grows out of the button); text in 216 to 234
      hold             234 to 420  nothing moves (186 frames = 6.2 s; readHold of the stub's five
                                   lines is 0.3 x 9 words + 0.5 = 3.2 s)
      closing cut      420         hard cut to paper
      logo in          420 to 435  scale 0.6 to 1, opacity, power3.out
      wordmark in      438 to 450  opacity, y +12 to 0, outExpo
      line in          444 to 456  same
      hold             456 to 599  143 frames = 4.8 s (readHold 1.7 s)
SHOTS: one locked shot for the screen (0 to 419), the cursor is the only actor and the stub the only
      hero; one locked shot for the closing card (420 to 599). No camera moves. The screen's
      outgoing state: stub settled, cursor parked, form empty. The closing card's incoming state:
      blank paper, nothing carried over (a hard cut).
KEEP: the explainer's ticket shape (notched perforation), its palette and type, the mark's colours.
BANNED: purple or blue gradients, glow and lens flares, floating particles, drop shadows under the
      card, everything fading in at once, fade-and-slide-up on every element, the cursor teleporting,
      a bouncy back.out on any entrance (only the press release may overshoot), text moving while it
      is read, a camera push on the press, a database or spreadsheet anywhere on screen, the words
      "sync", "database", "workspace".
QA: stills at 60, 195, 210, 234, 540 from each build at 1080 (frames 194, 209 and 233 too, to prove
      each hit lands on its frame and not before); text fits its container at 234 and 540 with the
      containers outlined (debug mode in both builds); the hold after the last word from the cue
      data (above); flashcheck on both review MP4s; motion-lab audit attempted on both; then the
      720 x 720 review MP4s, both opened in one VLC window for Robin.
```

## Longest-copy check (before the motion pass)

| Box | Copy | Width at size | Available | Limit recorded |
|---|---|---|---|---|
| headline | "One show. Entered once." (23 chars, Archivo 800 56 px) | about 700 px | 936 px | 30 characters, one line |
| date field | "NOV 12" (mono 20 px, 12 px per char) | 72 px | 356 px | 29 characters |
| venue field | "The Royal, Nelson" (17 chars) | 204 px | 356 px | 29 characters |
| stub city | "NELSON, BC" (Archivo 800 54 px, about 0.62 em per char) | about 335 px | 470 px | 13 characters |
| stub venue | "THE ROYAL" (Archivo 600 26 px) | about 150 px | 470 px | 28 characters |
| stub date | "THU · NOV 12 · 2026" (mono 26 px, 19 chars) | 296 px | 470 px | 30 characters |
| closing line | "Your tour, kept straight." (Archivo 500 30 px) | about 360 px | 936 px | 55 characters |

The real typeface is checked in a rendered frame at 234 and 540 (weight and spacing, not the CSS), with
the containers outlined. A copy change re-renders the landing frame before any motion is judged.

## Copy (the only source of on-screen words)

- Headline: `One show. Entered once.`
- Card title: `YOUR TOUR`
- List: `OCT 30 · KAMLOOPS`, `NOV 5 · KELOWNA`, `NOV 8 · REVELSTOKE`
- Field labels: `DATE`, `VENUE`; typed values `NOV 12`, `The Royal, Nelson`
- Button: `Add show`
- Stub: `THU · NOV 12 · 2026`, `NELSON, BC`, `THE ROYAL`, `ADMIT ONE`, `NO.`, `054`
- Closing: `IndieAgent`, `Your tour, kept straight.`

The tour is the explainer's fictional BC leg (Kamloops to Nelson), not a real artist's dates.

## Assets

- `assets/indieagent-mark.svg`: the IndieAgent mark from indieagent-ai/public/brand, used as is.
- No screenshots: One Show is the name of the artist agent (tour dates through ChatGPT and the MCP),
  not an app with screens, and my.indieagent.ai is a login-gated account page. The "screen" is drawn
  in the explainer series' own system (the Plate III tour window and the Plate IV ticket).
- No audio, no paid generation.
