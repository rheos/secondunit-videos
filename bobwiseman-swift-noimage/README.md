# Swift no-image look test

makevoid's motion-graphics-music-video-skill-noimage (commit 783218d, MIT) on Bob Wiseman's 10,000 Miles, bars 11-27, song 26.6 to 62.5 s. Internal test, issue #437. Nothing has gone to Bob.

`scene/miles.rb` writes the scene. `scene/finish_cues.rb` is the skill's finish template plus this film's sound cues. Lyrics, cues, stems and renders stay in gitignored `work/` and `out/`; word times come from the Chart World test's cues, because forced alignment drifted past 47 s.

Review file: `out/swift-noimage_test01_720p.mp4`.

Timings on the Intel Mac at nice 15: Swift build 2:23, Demucs on 72 s 2:00, render 860 frames at 1080p in 36 to 39 s with JOBS=5, sound and VFX finish about 20 s.

## In Her Dream test

`scene/ihd.rb` and `scene/ihd_finish.rb`, project in `work/ihd`, issue #439. Song 125.72 to 162.9 s, review file `out/swift-ihd_test01_720p.mp4`. It doesn't touch the cut-paper film or its 2:40 hand-off, and it hasn't gone to Bob. Clean render 36 s for 37 s, VFX with JOBS=1 about 10 s.

9:16 redraw, Robin's note on Nov 7: `scene/ihd_9x16.rb`, same project and finish script, review file `out/swift-ihd_9x16_test01_720p.mp4`. Recomposed, not cropped: she rises through the taller frame, the ring of friends stretches upright, and the street gets three-storey houses and a road. Same sound cues as the 16:9.
