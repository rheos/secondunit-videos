# 10,000 Miles as one chart (look test)

Issue #402. Bob's verse 1 and chorus 1 (song 8.0-63.1 s) drawn as a single plate: a town cutaway with its five problems, a rocket, and a graph of how big those problems look from up there. The look comes from Robin loving April Zhu's Tinycharts (QUIVER, 2026-11-04). It takes the vocabulary only, cream paper, isometric slab, tiny people, leader-line labels, a live readout; no code, plate or composition of hers. Fonts are Kevin Ngo's (MIT, `fonts/LICENSE-kevin-ngo.txt`).

`js/chart.js` is a pure function of song seconds. Lyrics, audio, stems and cues stay in gitignored `work/`.

```bash
PW_FROM=<path to a package.json with playwright> node render.mjs out/chart-world_test01.mp4
PW_FROM=... node render.mjs x --stills 15.8,19.3,53
```

Timing: `tools/align.py` and `tools/cues.py` on the Demucs vocal stem for verse 1. The aligner can't read "10,000", so the chorus word times are set by hand from faster-whisper on that stem and its phrase gaps.
