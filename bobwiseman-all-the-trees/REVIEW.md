# Alchemical look test — review notes

Local review cut: `out/att_alchemy-v2_f01128-f01908_24fps_draft.mp4`. Song time 47.000–79.500 seconds; end exclusive. Look approval is still Robin's decision. The full film has not been started.

## What is in this cut

Sun and moon figures become person-trees, coloured blue and rose with gamboge and silver heads. Branches emerge from articulated hands; roots reveal and meet underground. Engraved cloud heralds remain present throughout. Birds gain halos and trumpets, land in the boughs, depart and return. Wind, sun and winter appear as moving roundels. Historical source ink, contemporary repair and original code drawing are distinguished in `SOURCES.md`.

## V2 direction from Robin

The performance now has alternating arm swings, independent elbow movement, approximately five degrees of body sway each way around planted feet, a small compression on the dance pulse, and a delayed head response. The companions have different phases. Both cloud angels rock by approximately six degrees each way, with stronger trumpet-arm and wing movement. The approximate 145 BPM pulse is choreography, not a verified beat grid.

Branch origins use the same shoulder, elbow and body transforms as the hands. Perches are actual branch endpoints that follow the dance; the moon bird uses an outer branch to keep the face readable. Distal arms draw in front of the robes during inward swings.

The root network uses filled, tapered wood silhouettes with bark grain and thicker forks. Main roots are 32–44 px across near the feet instead of the old 6 px strokes, tapering to 11–15 px at their shared endpoints. Existing v1 media is retained for comparison.

## Completed checks, 2026-10-13

- Encoded file: 1280 × 720, H.264, 24 fps, exactly 780 frames and 32.500 seconds; stereo AAC audio.
- Original `scan.py`: zero bad corner frames, zero dark frames, no frozen run over two seconds. The additional encoded audit also checks a trailing freeze at the end.
- Random-access render audit: repeated timestamp produces identical JPEG SHA-256 after seeking to other times; every song frame maps correctly to [1128,1908), with poses on twos; zero resource or JavaScript errors; complete opaque canvas.
- Fixed Canvas readback mode prevents Chromium from changing rasterization after repeated exports. Historical PNGs are embedded as local data URLs by the preparation script, keeping file-URL exports origin-clean without weakening browser security.
- Pinned source audio and render copy retain the recorded SHA-256. Decoded preview versus source 47.000–79.500 s: 0 ms measured lag, correlation 0.9997024 (AAC encoding accounts for the small difference).
- V1 established figure arrival, branches, leaf wash, companion entrance, root join, bird landing and roundels. V2 checks include a nine-pose dance strip and full-resolution arm/hand joins at the swing extremes, root growth, and revised perches. An initial moon-face overlap and hidden low hand were corrected before the final render.
- The 720p contact sheet samples the encoded video at frames 0,60,…,720: thirteen images at exactly 2.5-second intervals, labelled with song time and song-frame number.
- Code-only commit: no scans, generated images, song, stems, lyrics or MP4 in Git. The rejected marquetry implementation remains available for comparison.

The staged cue schedule follows the issue's approximate word positions: entrance 49.083, head accent 50.708, bare branches around 53, arm rise from 55.9, green wash from 57.583, companion 60.375, roots joining by 63.75, birds 64.667, halos 65.792, landing from 68.45 and settled by 69.3, roundels from 71.875 / 72.875 / 73.75, departure 75.292, return 77.708. Pose quantization adds at most 1/12 second. These are not a substitute for force alignment to Robin's corrected lyrics.

## Still provisional

Brass animation uses 109 onset candidates across the entire test span, derived from the no-vocals stem using 400–2500 Hz band limiting, harmonic/percussive separation, locally normalized positive spectral flux and peak picking. The diagnostic spectrogram was checked for whole-span coverage. Other harmonic instruments can also cause these peaks; no isolated-trumpet transcription or by-ear verification is claimed. A listening pass should correct false attacks and missed brass notes before a full-film timing lock.

Robin's look review is the next gate under #119. Keep PR #115 draft. Do not upload the film or contact Bob. CodeRabbit's current draft-PR status is a skip, not an independent review approval.
