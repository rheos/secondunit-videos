# Profile film: the one-administrator beat

An explainer passage for Robin's portfolio film, issue #440, drawn in makevoid's Swift and Metal renderer (`toolbox/swift-noimage-skill.yaml`). It covers one passage of `assistant/portfolio-video/script-v1.txt`, which is still a draft, and is listed in that project's `script-v1-notes.md`.

**Test 02 is current.** `scene/admin_b.rb` flies one camera over a whole product drawn as a wheel of 120 modules and 510 people, timed from `work/voice/pro-01.words.json`. `scene/finish_cues_b.rb` cues sound and VFX from its events, so a new voice take moves the picture and the sound together. The voice is Robin Pro `dhSPGWdizuYfSd4seKkt` on `eleven_v4`, generated Nov 7. Review file: `out/profile-admin-beat_test02_720p.mp4`.

Re-time for a new take: replace the words file, pad the wav to the scene length so the end hold survives (the render stops at the end of the audio), run the scene, render, then the cues, `sfx:mix` and `vfx:render` with `JOBS=1`.

Test 01 (`scene/admin.rb`, `scene/finish_cues.rb`, `out/profile-admin-beat_test01_720p.mp4`) is the flat diagram on an Instant Robin take. Robin, Nov 7: "it could be more impressive."
