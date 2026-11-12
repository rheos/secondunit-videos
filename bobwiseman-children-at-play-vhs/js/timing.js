// timing.js · every hit in song seconds, measured from the audio (Demucs vocal stem onsets and accompaniment
// onsets, work/), never by eye. Labels name the hit, not the sung words: the lyric stays out of git.
// Song: Bob Wiseman, "children at play" (Giulietta Masina at the Oscars Crying, 2013), SHA-256 64ca875e...fdff.
// Section: song 0.00 to 39.50 s (frames 0 to 948 on the 24 fps grid).
window.TIMING = {
  start: 0.0, end: 39.5,
  tapeBlue: [0.0, 1.25],      // VCR blue screen with PLAY
  tapeSnow: [1.25, 1.50],     // heads find the tape: snow
  pictureIn: 1.50,            // the song and the picture start together; tracking band rolls up and out
  osdOff: 3.6,                // PLAY leaves the screen
  line1: 1.50,                // first sung word (held to 5.26): swing at its front peak
  line2: 7.34,                // second phrase starts: the camera starts looking (pan)
  line2end: 10.08,            // last word of it: zoom in on the slide
  slideGo: 10.40,             // the boy lets go at the top of the slide
  line3: 16.30,               // third phrase: pan, searching
  line3find: 18.06,           // push in
  line3end: 20.65,
  cut: 377 / 24,              // in-camera record restart on the accompaniment onset at 15.71 s (frame 377)
  line4: 25.39,               // fourth phrase: whip pan to the big tree
  line4laugh: 26.98,          // the sun hat pokes out from the trunk
  line5: 33.39,               // fifth phrase: the camera holds on the tree
  line5peek: 34.55,           // the hider leans out
  line5out: 35.08,            // steps out
  line5run: 35.59,            // runs toward the camera (last word, held to 38.47)
  waveAt: 37.77,              // stops and waves, on the bar line
  beat: 0.6955,               // average beat (86.3 BPM), rubato around 11 to 15 s
};
