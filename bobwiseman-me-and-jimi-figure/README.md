# Record player: Colorfigures look test

Me and Jimi verse 3 (song 152.0-191.0 s, 39 s, 720p) drawn with April Zhu's Colorfigures engine. `js/core.js` is her file, unchanged, with its licence in `js/LICENSE-colorfigures.txt` (MIT; the credit stays on screen). `js/player.js` is our model of the machine. `js/film.js` is the film, a pure `seek(songSeconds)` over her scene and camera.

Her pages are interactive, so three things had to change for film: every animation is a function of time rather than a button press, the view is laid out for 1280 x 720, and the buttons became the lyric line.

Inputs live in gitignored `work/`: `lyrics.txt` (from Bob's sheet, in the recording's order), `cues.js`, `section.wav`. Build the cues from the project's Whisper words and vocal stem:

    viralvision-worker/.venv/bin/python tools/cues.py <path to bobwiseman-me-and-jimi>

Render (about 2 minutes for 936 frames):

    PW_FROM=<a checkout with playwright>/package.json node render.mjs out/record-player_test01.mp4
    node render.mjs --stills 155,176.6,187.6
