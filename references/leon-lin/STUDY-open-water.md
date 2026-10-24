# open-water (Leonxlnx/open-water): what is worth taking

Read and tested 2026-10-24 at the repo's main branch (code MIT; the rain and thunder recordings are
Creative Commons, listed in `assets/audio/CREDITS.md`, never copy them). Issue #303.

## Recommendation

Keep it as a reference and a sea/storm plate generator for the day a song needs one, and render it
only on a real GPU. It cannot go through our cloud render: GitHub's runners have no GPU, and in
software WebGL it is far too slow (below). Take its review method now; it is the best version of
"compare to the reference" we have seen.

## It needs a GPU

`render/render.mjs` drives headless Chrome on a GPU (`tools/browser.mjs` launches with
`--use-angle=d3d11`, written for Windows), reads raw RGBA with `gl.readPixels` and pipes it to x264.
It recovers from lost WebGL contexts by reopening the browser, which tells you how hard it works the
card.

Timing test, 2026-10-24: Chromium in a Linux container with SwiftShader (software WebGL), 4 CPUs to
match a GitHub runner, 1280x720, `q=high`. Page setup took 11 s. The calm act at t = 8 s: 15 warm-up
frames took 903 s (60 s each), then 56 s a frame. The storm frame (t = 42 s) was stopped at the
20-minute cap, still in its warm-up. The calm still itself came out right: golden-hour glitter, swell
and cumulus, near photoreal (the clouds a little grainy after only 0.5 s of accumulation, not the
renderer's 4 s). So software WebGL gives the right picture, just far too slowly.

What that costs: a 10 s plate at 30 fps is 300 frames, about 4.7 hours on one runner. Split across
20 slices, each slice also pays a 4 s warm-up (120 frames, about 2 hours), so roughly 50 runner-hours
for 10 s of sea: more than a month of a private repo's included Actions minutes. Not viable.

Where it can run:
- **Modal GPU** (Robin's Modal account already runs Blender 5.2 on CPU). GPU functions need a card on
  the account, which Robin adds. Headless Chrome on NVIDIA under Linux needs EGL or Vulkan flags in
  place of `d3d11`; untested.
- **This Mac's AMD Radeon Pro 5500M**, for a few stills only. Long GPU renders have crashed this Mac
  (2026-10-16), and live mode struggles here (2026-10-23).

## Frames are not a pure function of t

Foam history, cloud accumulation and the camera filters carry state between frames. `render.mjs`
warms up 4 s before its first frame, and a cut to a new act (`App.filmFrame`) first runs 25 s of that
act's sea plus 3 s of frames off-screen. Every cloud slice would pay that warm-up again. Render a plate
in one piece, or in long slices.

## Driving it from a song

Easy. `src/film.js` (98 lines) is three acts of keyframes, `[seconds, { wind, clouds, rain, haze,
swellHs, sunElev, ... }]` for the weather and `[seconds, { yaw, pitch, eye, fov }]` for the camera,
smoothstepped between keys, plus scripted lightning strikes with thunder delayed by distance / 343 m/s.
Replace those times with the song's bar or cue times and the storm follows the music. The URL
parameters (`?preset=storm&wind=14&rain=0.4&elev=&az=`) set a still scene with no timeline.

## Its review method (worth taking now)

`tools/critique.mjs` renders a fixed set of 13 scenes (six film moments and seven presets, including
Beaufort 5, 7 and 9 seen from a ship's deck) at film quality, one browser per scene so a GPU reset
can't take the rest. Then, per the README, an agent review:

1. Two critics per scene, a photographer and an ocean and atmosphere physicist, score each render
   against about 60 reference photographs (Wikimedia Commons, NOAA).
2. A verifier confirms each issue before anyone fixes it.
3. A regression judge compares every scene with the previous round.

It found real faults this way (rain blacking out the day, a khaki storm sea, banded storm bases,
whitecaps unrelated to the crests, waves travelling against the wind). For us:
- A fixed scene set rendered every round is our no-regressions rule made mechanical.
- A critic with a domain (a physicist for a sea, a puppeteer for a rig) finds what a general critic
  misses. Our revision loop's section critics could take one each.
- "A verifier confirms each issue first" is the same refute-before-fix pass cinetic has
  (`STUDY-cinetic.md`). Two of his repos do it; we don't yet.
