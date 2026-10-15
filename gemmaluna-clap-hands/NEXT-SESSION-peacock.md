# Clap Hands, cut-paper peacock: where it stands (paused 2026-10-15)

Read this first, then `STORYBOARD-peacock.md` (local only, gitignored) for the look bible, the four-chorus arc
and every hand-off.

## Done

- Full song built, 11.0-197.0: `peacock.html` + `js/peacock/` (kit, registry, nouveau, props, shots.js for
  verse 1 + chorus 1, s00-intro, s03-verse2, s04-engine, s05-avenue, s06-clock, s07-stars, s08-theatre,
  s09-dawn, s10-letgo). `js/data.js` (local, gitignored) supplies the beat grid.
- Robin's notes applied: hands only visit for their clap and every repeat adds more or different hands; each
  chorus uses hands in a new way (catches on / engine / time and stars / letting go); every scene change is a
  match cut on one element (see the storyboard table).
- Full draft v1 rendered: `out/peacock/gmc-v2_peacock-cutpaper-full-v1_f00264-f04728_24fps_review-720p.mp4`
  (720x1280, 186.0 s, 4464 frames, 35 MB). Scan: no bad frames besides the 1.5 s fade from black. NOT uploaded.
- Code pushed to branch `clap-hands-peacock`, draft PR rheos/secondunit-videos#141 (issue #140). The commit
  worktree is in this session's scratchpad (`.../scratchpad/wt-gmc`); make a fresh one if it's gone.

## In progress when paused

Two fixes are in the code (in the main checkout, NOT yet pushed and NOT yet in the v1 mp4):
1. `s05-avenue.js`: the avenue renders smooth (it judders on twos during the fast pans) and the pans are a bit longer.
2. `s08-theatre.js`: the spotlight breathes and drifts, dust turns in the beam, the jeans and helmet move a
   little (the jeans and helmet holds were frozen for ~2.4 s each).

The patch render was stopped before splicing. To finish: re-render only frames 1889-2419 (avenue) and
3156-3706 (theatre, through dawn's 0.4 s fade-in), copy them into `out/frames_peacock_11_197/` at those
indexes, re-encode the whole frame set with the song (same ffmpeg line as `render-peacock.mjs`: scale 720:1280,
crf 23, maxrate 4.5M, bufsize 9M, audio `-ss 11 -t 186` from assets/song.wav), name it `...full-v2...`, scan,
watch the hand-offs, then upload unlisted with `secondunit-worker/yt_upload.py` (run it through
`uv run --with google-api-python-client --with google-auth-oauthlib --with requests python ...`) and push
the two files to the branch.

## Still open

- Gemma Luna's consent is not on record; unlisted review only.
- Not watched end to end with sound yet; claps were checked on contact sheets at their frames only.
