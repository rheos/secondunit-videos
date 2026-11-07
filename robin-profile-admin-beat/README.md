# Profile film: the one-administrator beat

An explainer passage for Robin's portfolio film, issue #440, drawn in makevoid's Swift and Metal renderer (`toolbox/swift-noimage-skill.yaml`). It covers one passage of `assistant/portfolio-video/script-v1.txt`, which is still a draft, and is listed in that project's `script-v1-notes.md`.

**Test 03 is current:** the test 02 picture re-timed to the film narration take, `assistant/portfolio-video/takes/robin-pro-narration-v1.mp3`, from 83.84 to 101.08 s. Review file: `out/profile-admin-beat_test03_720p.mp4`. Its words are in `work/voice/film-v1.words.json`; the scene reads that file unless `ADMIN_WORDS` names another.

**Test 02:** `scene/admin_b.rb` flies one camera over a whole product drawn as a wheel of 120 modules and 510 people, timed from `work/voice/pro-01.words.json`. `scene/finish_cues_b.rb` cues sound and VFX from its events, so a new voice take moves the picture and the sound together. The voice is Robin Pro `dhSPGWdizuYfSd4seKkt` on `eleven_v4`, generated Nov 7. Review file: `out/profile-admin-beat_test02_720p.mp4`.

Re-time for a new take: replace the words file, pad the wav to the scene length so the end hold survives (the render stops at the end of the audio), run the scene, render, then the cues, `sfx:mix` and `vfx:render` with `JOBS=1`.

Test 01 (`scene/admin.rb`, `scene/finish_cues.rb`, `out/profile-admin-beat_test01_720p.mp4`) is the flat diagram on an Instant Robin take. Robin, Nov 7: "it could be more impressive."
