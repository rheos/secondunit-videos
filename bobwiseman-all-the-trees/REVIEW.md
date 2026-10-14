# V5 focused review: grove, camera and branch reveals

Robin asked for an expansive receding grove in the spoken opening, a move down and back up to show the underground connection, both principal people arriving together, and each person's branches withheld until their own declaration. This pass implements those notes in the existing engraving treatment. It does not close the larger v4 brass/performance audit below.

Local review: `REVIEW-v5.html`, with seek buttons and the 40-second excerpt `out/att_alchemy-v5-grove-cues_f00720-f01680_24fps_draft.mp4`. Song 30–70 s; frames [720,1680). Fifty trees populate six depths in a stagger travelling toward the horizon. The four nearest trees connect below ground. The camera begins in a surface framing, moves down over f876–924, then returns over f1038–1082. Both principal people begin arriving at f1178. Sun branch growth spans f1362–1382; moon growth spans f1422–1450, with the first nonzero geometry one frame after each start. Leaves follow those reveals. These phrase estimates need Robin's playback judgment; no listening-confirmed word alignment is claimed.

Validation: the renderer and tests consume the same frame cue block. Every song frame is checked for shared arrival, no premature branch/leaf geometry, and the song/held-pose mapping. Changing a branch cue changes the actual canvas. The full grove contains fifty trees; the camera returns to its original offset; 22 rendered samples repeat exactly after reverse seeks. No resource or JavaScript errors. Visual checks cover the six-depth landscape, root connections, both empty-handed people, each reveal and later-section regression samples. A narrow sky gap at the soil edge was removed before the final render.

The encoded excerpt has 960 frames at 1280×720/24 fps, stereo AAC, no bad/dark frames and no freeze above two seconds. Its 16-image contact strip samples the encoded file every 2.5 seconds. The source audio remains SHA-pinned; decoded windows at song 30, 50 and 59.9 s measure 0 ms offset, with correlations above 0.9997. The motion-lab flash check passes. These checks establish file integrity and deterministic cue behavior, not approval of the staging or musical interpretation. Earlier renders remain preserved. PR #115 remains draft; local-only video, no artist contact.

---

# Latest review: v4 needs a directing revision

Robin’s feedback on 2026-10-13: the film still feels boring and dominated by two characters; he wants a richer ensemble, Mark-informed symbolic action, tighter musical staging, and trumpets concealed before their entrance.

The resulting audit is in AUDIT-v4.html (interactive video-linked findings) and AUDIT-v4.json (structured direction and acceptance checks). Three independent critics reviewed source, actual encoded frames, contact sheets and cue/audio-signal evidence. This was not a continuous playback/listening review. The exact first trumpet onset remains to be verified against the master; neither 12.5 s nor the harmonic detector’s first candidate proves it.

The core failures are continuous playing poses, a nearly always-active synthetic brass envelope, duplicate rigs with identical jobs, repeated sine dancing, little interaction, and one dominant wide framing. Named beat cues are not consumed by the drawing code, so cue validation can pass without moving the visible event. The existing no-freeze and audio-offset passes remain valid as file checks; they do not constitute approval of musical timing, acting or interest.

Recommended direction: the connected grove as a physical comedy. Prove a concealed horn, phrase-led reveal, listener reaction and transferred consequence in approximately 8–32 seconds; verify the true brass entrance first. Then build an enduring root-to-person handoff and partner/bird contact actions. V4 is preserved. No v5 animation has been rendered in this audit pass.

---

# All The Trees: full rough cut v4

Robin requested more of the lead-in before the original 47-second start. V4 adds the complete opening and retains the longer sequence through the end. The local file is `out/att_alchemy-v4-full_f00000-f03674_24fps_draft.mp4`: song frames [0,3674), 0–153.083333 seconds, 153.083333 seconds at 24 fps, 1280×720. The pinned source ends at 153.066 seconds, within the final picture frame. Prior MP4s are preserved.

The new opening inscribes a border on cream paper, turns one engraved face into a six-portrait chart with changing emblems, brings in colour and heralds with the brass, then reveals two trees joined by substantial branching roots. The roots retract before the trees sink, leaving the existing stage ready for the first person. No new source images or paid generation are used.

Two independent read-only critics reviewed opening stills/code and the overall progression against the v3 contact strip. Root offshoots were added to avoid a cable-like connection, and root retreat was separated from the sinking trees to avoid clipped stubs. A follow-up still review confirmed both fixes. The initial portrait now starts closer, settles into its chart position before the second portrait arrives, and retains gentle motion before the brass. Its 300-frame opening prefix was rendered separately and replaces the corresponding frames before the final full-track encode. Entering clouds are clipped to the plate. A brief empty-stage breath before the first person remains a nonblocking polish point; preserving the existing chorus choreography took priority.

## Verification for v4

The random-access audit covers the 3674-frame song/pose mapping and 26 sampled timestamps, including the opening and handoff. It verifies opaque output, no resource/JavaScript errors, deterministic out-of-order seeks, and four unchanged v2 chorus samples. The final encoded export passes: 1280×720, 24 fps, 3674 frames, 153.083333 seconds, stereo AAC; zero bad/dark frames and no freeze longer than two seconds. A 62-image contact strip samples the encoded movie every 2.5 seconds; an 18-image action strip samples the final frame sequence through the opening and handoff.

The source audio hash remains pinned. Decoded 10-second windows starting at 0.000, 76.541667 and 142.983333 seconds have 0 ms measured offset and correlations 0.999918, 0.999706 and 0.999517. This verifies mux continuity, not visual cue alignment. The local take catalogue confirms song frames [0,3674). The code-only GitHub guard passes on the implementation commit; CodeRabbit skips the draft PR.

The added 118 harmonic onset candidates bring the total to 456. The first four portrait entrances use rough opening phrase estimates; the later entrances are editorial staging, not verified spoken-name alignment. All visual word/brass timing remains provisional. Neither still/code review nor audio correlation is a playback/listening assessment.

Keep PR #115 draft. Do not upload the video or contact Bob. No scans, song, stems, lyrics or rendered media are committed.

---

## Prior v3 review record


Current local preview: `out/att_alchemy-v3-long_f01128-f03674_24fps_draft.mp4`. Song time 47.000–153.083333 seconds, end exclusive; frames [1128,3674), 2546 frames at 24 fps. The pinned audio ends at 153.066 seconds, inside the last picture frame. This is a 106.083-second rough cut through the rest of the song. The opening spoken section is not included.

Robin requested a longer view after v2 and noted that some visual cues do not land where he wants them. The longer cut is for judging progression and staging. It does not establish exact word or trumpet synchronization, or final look approval. V1 and v2 MP4s remain available.

## What the extension adds

- Song 79.5–96.3 s: two more people grow into the image and join the root network.
- 96.3–110 s: a heart rises physically from the shared root junction and gains an engraved sun ring; leaves fall near the winter cue.
- 110–122.7 s: cloud trumpeters enlarge, the people retreat under an engraved soil lip, and curved musical lines leave the moving bells to circle the heart.
- 122.7–136 s: four further figures arrive, leaves return, and the eight-person grove shares one root system.
- 136 s to end: birds circle above the grove, the view pulls back to the complete plate, and the picture settles toward paper with the music's ending.

The earlier v2 treatment remains: alternating arm and elbow movement, body sway around planted feet, slight compression, delayed head movement, active cloud angels, and roots 32–44 px wide near the central feet. Source artwork and repairs are documented in SOURCES.md. New figures reuse the existing disclosed historical cut-outs.

## Review completed

Three independent read-only critics inspected current full-resolution section stills and the scene code: community/bridge, brass/grove, and the overall progression. They did not watch or hear playback. Bounded findings were fixed: outward heart rays now sit behind faces; the heart has more clearance from the principal moon; added figures are spaced farther apart and their heads draw in front of crossing branches; explicit clipping restores the heart's hatch strokes; a soil lip covers exposed root starts during the abstract passage. Follow-up inspection confirmed those fixes. The soil lip's lower edge remains a minor polish item.

The final image protects the historical faces and robes, blue/rose central pair, articulated dance, thick joined roots, musical ribbons originating at the bells, and the larger ensemble. No new source images, paid generation, or rendering framework were introduced.

## Technical validation

- Encoded H.264 preview: 1280×720, 24 fps, 2546 frames, 106.083333 seconds; stereo AAC. Both frame scanners report zero bad/dark frames and no freeze longer than two seconds, including the ending.
- Three decoded audio windows at song 47.000, 100.041667 and 142.983333 s show 0 ms measured offset; correlations are 0.999646, 0.999869 and 0.999545. The pinned source and render-copy hashes match. This checks mux continuity, not visual event timing.
- The encoded contact strip has 43 samples at exact 2.5-second intervals, labelled with song time and song-frame number. Heart-rise and instrumental handoff sequences were also inspected from the final rendered frames.

- All 2546 song-frame and pose-frame mappings pass, with poses on twos.
- Twelve sampled times spanning the cut repeat exactly after reverse-order seeks; no resource or JavaScript errors, opaque canvas throughout the sampled render audit.
- Four sampled frames in the earlier v2 passage are pixel-identical to its committed scene implementation (49.5, 57.5, 69.5 and 77 s).
- The source song is SHA-pinned and one continuous audio excerpt is muxed across the full cut. Audio is not joined independently for each chapter.
- JavaScript syntax, Python compilation and the code-only Git guard pass. No scans, lyrics, stems, WAVs or MP4s are committed.

## Timing still to direct

The short action cues come from the issue's approximate song map and local onset estimates. The old word file contains inverted word intervals and has not been approved as exact alignment. The 145 BPM dance pulse is choreography. Brass reactions use 338 harmonic onset candidates over the extended range; other instruments can trigger these candidates. Neither the critics' still reviews nor the audio-offset check establishes that every visual hit matches Robin's preferred word or trumpet timing.

Keep PR #115 draft for Robin's review. Do not upload the video or contact Bob. CodeRabbit skips this draft PR; no independent CodeRabbit approval is claimed.
