# Brief for look agents (shared)

Project: /Users/robin/Code/novadiem/indieagent/secondunit/mv-projects/bobwiseman-libelous
A code-drawn music-video look test for Bob Wiseman's song "Libelous" (the McLibel case, told as a fairy tale about a king). 0 credits, no generative AI, every frame drawn on a 2D canvas in JS.

Read first: README.md (clock, section map, the captioning rule), STORYBOARD.md (your look's beats), source/libelous.lyrics.txt (the ONLY source of on-screen words), source/lines.json (every sung line with its snapped start/end and per-word onsets), js/common/core.js (shared helpers + page harness).
For reference only (don't edit), a finished look in a sibling project: ../bobwiseman-giulietta-masina/looks/leader.html + js/leader/ (engine pattern, camera, NOTES.md beat list).

## The captioning rule (the point of this round)

The words are hard to make out on the record, so EVERY sung word in your section is on screen, in order, readable at 720p, on its sung onset. The captions are not subtitles laid over a picture: they are made of your look's own material (letterpress in the woodcut, the ad's sing-along in the TV, the transcript in the courtroom). A viewer with the sound off must be able to follow the whole song from your section.
- Words come from source/lines.json (Bob's text, already timed). Never retype them from memory or from Whisper.
- A word appears on (or a hair before, max 2 frames) its onset in lines.json; the line stays readable until at least the next line starts, or 1.2 s after its last word, whichever is later.
- Readable means: at least 44 px cap height at 1920x1080 for the current line, high contrast against what's behind it, never crossed by moving shapes.
- Every line fits its container with margin (fitText / measureText), including at overshoot.

## Build

- looks/<look>.html loading ../js/common/core.js then your own files under js/<look>/ (main.js must call startPage(outCanvas, renderFrame, T0, T1)). Canvas 1920x1080. Include <audio id="a" src="../assets/song.wav">.
- js/<look>/NOTES.md: the beat list with the song times you actually used.
- renderFrame(t) must be PURE: a function of song time t only. No Math.random, no Date, no state between frames. Prove it: render the same t after rendering other times and compare.

## Look rules (Robin's standing feedback)

- Name the look honestly: a 720p still must read as the named style. Texture sprinkled on vector shapes is not the style; build the real mark-making.
- Stage what is sung, on the word. Every vocal flourish gets its own moment.
- One location per stretch, moving forward; quick cuts are framings within it, never hops back and forth.
- Allegory stays allegory: a king, a court, a clown, a burger-shaped thing at most. NO golden arches, no "M" logo, no red-and-yellow clown suit or red hair, no company name anywhere. The song never names the company; neither does the video.
- The couple are stylised stand-ins (a man and a woman with leaflets), never portraits of the real people (Helen Steel, Dave Morris). They were activists, not jailed; no prison imagery.
- Animal-cruelty and "urine and stool" lines: stylised and plain, never gore.
- No title card, no artist/song name card.
- No rhythmic hand/arm motion near a lap.
- Hands: simple and correct (mittens are fine) rather than wrong detailed fingers.
- Describe what the frame shows: when you report, check every claim against the pixels.

## Checking

- Contact sheets: `PAGE=looks/<look>.html node check.mjs out/<look>_sheet.jpg t1 t2 ...` (event frames: every line start, a frame mid-line, every cut). Open and look at them (Read the jpg). Also `node check.mjs --full out/<look>_stills t...` and look at 1:1 crops of the lettering: every word spelled as in lines.json, nothing clipped.
- Then render the section at 720p: `PAGE=looks/<look>.html nice -n 15 node render.mjs <t0> <t1> out/lib_<look>-v1_f<start>-f<end>_24fps_draft.mp4 3 24 0.6667` (frames = round(t*24)). Check duration and frame count with ffprobe, run `tools/badframes.py` on it, and spot-check frames pulled from the MP4 itself.
- The machine is shared and loaded: 3 workers, nice -n 15. Don't touch other projects' folders. Don't commit, push or upload: the parent session does that.

Report back (short): file paths, beat list with times, what you checked, anything you're unsure of, and ms/frame.
