# Brief for look agents (shared)

Project: /Users/robin/Code/novadiem/indieagent/secondunit/mv-projects/bobwiseman-giulietta-masina
A code-drawn music-video look test for Bob Wiseman's song "Giulietta Masina at the Oscars Crying". 0 credits, no generative AI, every frame drawn on a 2D canvas in JS.

Read first: README.md (clock, section map), STORYBOARD.md (your look's beats), source/giulietta-masina.lyrics.txt (the ONLY source of on-screen words), js/common/core.js (shared helpers + page harness).
For reference only (don't edit), a finished look in a sibling project: ../bobwiseman-satisfied-mind/looks/crossstitch.html + js/crossstitch/ (engine pattern, camera, NOTES.md beat list).

Build:
- looks/<look>.html loading ../js/common/core.js then your own files under js/<look>/ (main.js must call startPage(outCanvas, renderFrame, T0, T1)). Canvas 1920x1080. Include <audio id="a" src="../assets/song.wav">.
- js/<look>/NOTES.md: the beat list with the song times you actually used.
- renderFrame(t) must be PURE: a function of song time t only. No Math.random, no Date, no state between frames. Prove it: render the same t after rendering other times and compare.

Timing:
- Frames are on the 24 fps song grid. Whisper times in source/words-whisper-medium.json run 0.3-1 s early.
- When source/stems/vocals.wav exists (Demucs is running; check), snap every sung hit to its onset (rise in log energy over 40 ms, strongest peak within about +/-0.6 s of the Whisper time). Python with numpy: ~/Code/novadiem/indieagent/viralvision/viralvision-worker/.venv/bin/python. Use guitar onsets on the full mix for instrumental hits.
- Stage what is sung, on the word. Every vocal flourish gets its own moment.

Look rules (Robin's standing feedback):
- Name the look honestly: a 720p still must read as the named style. Texture sprinkled on vector shapes is not the style; build the real mark-making (halftone dot screen, gouache modelling, litho misregister, leader scratches).
- Every word or number inside a sign/box/frame fits with margin, even at overshoot: measure with measureText (fitText in core.js), never eyeball.
- One location per stretch, moving forward; quick cuts are framings within it, never hops back and forth.
- Giulietta Masina and Fellini were real people (both dead). Draw stylised stand-ins (short dark hair, big eyes for her; big man in a dark suit for him), never a portrait attempt. No title card, no artist/song name card.
- No rhythmic hand/arm motion near a lap (it read sexual on a past video). The Cabiria beats are comic and tender, nothing sexual.
- Describe what the frame shows: when you report, check every claim against the pixels.
- Hands: draw them simply and correctly (mitten shapes are fine) rather than wrong detailed fingers.

Checking:
- Contact sheets: `PAGE=looks/<look>.html node check.mjs out/<look>_sheet.jpg t1 t2 ...` (event frames: every cut, every line start, peaks). Open and look at them (Read the jpg). Also `node check.mjs --full out/<look>_stills t...` and look at 1:1 crops of faces, hands and lettering.
- Then render the section at 720p: `PAGE=looks/<look>.html nice -n 15 node render.mjs <t0> <t1> out/gm_<look>-v1_f<start>-f<end>_24fps_draft.mp4 3 24 0.6667` (frames = round(t*24)). Check the file's duration and frame count with ffprobe, and spot-check frames pulled from the MP4 itself.
- The machine is shared and heavily loaded: use 3 workers and nice -n 15. Don't touch other projects' folders. Don't commit, push or upload: the parent session does that.

Report back (short): the file paths, the beat list with times, what you checked, anything you're unsure of, and ms/frame.
