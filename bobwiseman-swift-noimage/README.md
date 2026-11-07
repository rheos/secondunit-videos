# Swift no-image look test

makevoid's motion-graphics-music-video-skill-noimage (commit 783218d, MIT) on Bob Wiseman's 10,000 Miles, bars 11-27, song 26.6 to 62.5 s. Internal test, issue #437. Nothing has gone to Bob.

`scene/miles.rb` writes the scene. `scene/finish_cues.rb` is the skill's finish template plus this film's sound cues. Lyrics, cues, stems and renders stay in gitignored `work/` and `out/`; word times come from the Chart World test's cues, because forced alignment drifted past 47 s.

Review file: `out/swift-noimage_test01_720p.mp4`.

Timings on the Intel Mac at nice 15: Swift build 2:23, Demucs on 72 s 2:00, render 860 frames at 1080p in 36 to 39 s with JOBS=5, sound and VFX finish about 20 s.
