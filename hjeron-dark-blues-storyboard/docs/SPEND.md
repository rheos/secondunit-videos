# SPEND: dream of fire storyboard (hjeron_dark_blues)

**HARD CAP raised to 175** (Robin, picker, 2026-09-28: "Probe + raise cap to 175"). Step 1 of the probe only: the V1 still. The H3 pass waits for his OK.

Approval: Robin 2026-09-28 (relayed by the coordinator): "ok. let's continue". Covers production
of the storyboard under a HARD CAP of 150 credits, wave 1 only for now (LS1 and LS2). No toolkit
project is used, so there is no plan:approve hash; this line is the record.

Only this session's job ids are logged here. Another session (Pnubb) spends the same balance.
`secondunit/CREDITS.md` is not edited from this project.

| time | model | credits | what | job id |
|---|---|---|---|---|
| 2026-09-28 21:04 UTC | minimax_h3_max 6 s 768p 9:16, image ref + audio (method 1) | 15 | LS1, hook, real #22 frame 100 + vocals 65.039-71.039 s. **REJECTED** (Robin: invented beard in profile, not him) | e1d42c7a-dadb-4dcc-8dd3-67e4beb9d866 |
| 2026-09-28 21:04 UTC | minimax_h3_max 6 s 768p 9:16, video ref + audio (method 2) | 15 | LS2, first wake-up line, real #23 clip + vocals 79.134-85.134 s. **REJECTED** (profile, singing not readable) | 61a783cf-5186-4625-bdf6-f08f30c35563 |

Balance 1992.04 before, 1962.04 after (delta 30, matches the two estimates).

| 2026-09-28 21:34 UTC | gpt_image_2_5 sunburst xhigh 2k 9:16 | 4.5 | V1 veiled frontal still (refs: sheet e8a9a2d8, frontal crop b79a988f, real #22 f100 161c2bf6). Made with the PRE-correction prompt (lips may be glimpsed); see review | 8513085f-09f0-4cd4-8cb0-509be585ecf5 |

Balance 1962.04 before, 1957.54 after (delta 4.5).

**Running total: 34.5 of 175.** Production is PAUSED by Robin after wave 1. Next proposed spend,
not submitted: the LS1b probe (V1 veiled still 4.5 + H3 6 s 15 = 19.5), which needs Robin's go.
Spent plus the remaining plan is 140 of 150; see STORYBOARD.public.md, Totals.

## Wave 1: history

The paid step was first blocked in this session by the Claude Code auto-mode classifier
("Real-World Transactions"), before any upload or create ran. The inputs are prepared locally in
`work/wave1/` (gitignored):

- `c22_f100.png`: real #22 frame 100, 1080x1920 (LS1 image reference)
- `c23.mp4`: real #23, the whole 5 s clip (LS2 video reference)
- `vocals_65.039-71.039.mp3`, `vocals_79.134-85.134.mp3`: vocal stem slices at song time
- `mix_*.wav`: the matching full-mix slices for the review muxes

Robin then added a permission rule and wave 1 ran as staged. Commands used (estimate first, 15 credits each):

```sh
higgsfield upload create work/wave1/c22_f100.png            # retry on 520
higgsfield upload create work/wave1/vocals_65.039-71.039.mp3
higgsfield upload create work/wave1/c23.mp4
higgsfield upload create work/wave1/vocals_79.134-85.134.mp3
higgsfield generate cost   minimax_h3_max --duration 6 --aspect_ratio 9:16 --resolution 768p --image <c22 id> --audio <v65 id> --prompt "$(cat work/wave1/LS1.txt)"
higgsfield --json generate create minimax_h3_max ... > work/wave1/LS1.json     # same args
higgsfield generate cost   minimax_h3_max --duration 6 --aspect_ratio 9:16 --resolution 768p --video-references <c23 id> --audio <v79 id> --prompt "$(cat work/wave1/LS2.txt)"
higgsfield --json generate create minimax_h3_max ... > work/wave1/LS2.json
```

The prompt files are rendered from the LS1 and LS2 prompts in the local docs/STORYBOARD.md, with
the lyric lines in them.

Uploads (ids): c22_f100.png 161c2bf6, vocals 65.039 a4cf692a, c23.mp4 ad30e253, vocals 79.134 0c7a20a0.
Receipts: work/wave1/LS1.json, LS2.json, job_*.json (local). Review: docs/reviews/wave1.md.

## Production (Robin 2026-09-28: "don't wait for my review.. take the video to completion", cap 175)

V1 (8513085f) is SUPERSEDED by the real day-take route; kept, not used. LS1c (1d50a97d) is
ACCEPTED as the hook (sepia grade approved as-is; neon grade fixed locally). From here each job is
appended by `tools/gen.py`, which refuses anything that would pass the cap.

| time | model | credits | what | job id |
|---|---|---|---|---|
| 2026-09-28 21:38 UTC | minimax_h3_max 6 s 768p 9:16 | 15 | LS1c: hook, H3 on real day-take frame 27.5 s (upload 36d488ce) + vocals 65.039 s. ACCEPTED | 1d50a97d-9a1f-4c3c-b747-61e95f0264ff |
| 2026-09-28 22:11 UTC | minimax_h3_max | 12.5 | LS3: last wake-up line, real day-take 72.5 s frame, close | 47e57c4c-18b4-4a37-81cd-afd377b84e42 |
| 2026-09-28 22:11 UTC | kling3_0 | 6.0 | A4: smoke serpent ring from real #23 frame 30 | 58f7b6e3-084d-4b21-8137-faa79db0adc8 |
| 2026-09-28 22:11 UTC | gpt_image_2_5 | 4.5 | A3-still: ember Odin eye still: real #39 look, insp16, coat ref, sheet veil | c8a6b284-ce62-4991-add9-e4fe6db2e6e4 |
| 2026-09-28 22:14 UTC | minimax_h3_max | 15.0 | LS2: wake-up lines, real day-take 10.0 s frame, low 3/4 | 7ea06541-ff3a-41d1-83eb-025db58a101c |
| 2026-09-28 22:15 UTC | kling3_0 | 4.5 | C1: continue real #3, him and the wolfdog into smoke | 6960959b-a779-4eb1-8653-5c88283efb0b |
| 2026-09-28 22:14 UTC | kling3_0 | 4.5 | A2: fire ring lights before real #0 ram skull | f97a30f8-fc48-49e0-8853-0813b2b61681 |
| 2026-09-28 22:14 UTC | kling3_0 | 4.5 | A3-anim: ember Odin eye ignites | 71a304db-6c4f-44f6-be0a-df9c60587274 |
| 2026-09-28 22:15 UTC | gpt_image_2_5 | 4.5 | A5-still: rock-wall painting | 0556ece1-13d5-4fd5-8a5b-b68c10b2771b |
| 2026-09-28 22:15 UTC | gpt_image_2_5 | 4.5 | A1-still: moon serpent, man + wolfdog from behind | d875e005-5407-4aa8-921f-0ca8fb062f57 |
| 2026-09-28 22:16 UTC | gpt_image_2_5 | 4.5 | A7-still: forced-perspective guitar in the sand, man + wolfdog | a9adc565-5a58-41a7-a0c1-3e253ef4a87f |
| 2026-09-28 22:16 UTC | gpt_image_2_5 | 4.5 | A6-still: cracked earth, heat, distant man + wolfdog | d8ca3c94-8bd5-41a1-b1c8-be8141b09da2 |
| 2026-09-28 22:18 UTC | kling3_0 | 4.5 | A1-anim: moon serpent walk, man + wolfdog | fcf122b9-f701-42bd-94ac-1f8bbca6741a |
| 2026-09-28 22:18 UTC | kling3_0 | 4.5 | A5-anim: rock-wall painting revealed by firelight | 2998be1e-3aa4-404d-affb-6925393e0808 |
| 2026-09-28 22:18 UTC | kling3_0 | 4.5 | A6-anim: cracks glow and widen | ece730c1-5e1a-4184-adde-2bab11ec71a1 |
| 2026-09-28 22:18 UTC | kling3_0 | 4.5 | A7-anim: forced-perspective guitar push-in | f322f186-300e-41ea-8eb4-f6a46c6321a3 |
| 2026-09-28 22:19 UTC | kling_video_edit | 4.5 | SB2b: scratchboard night wolfdog, real #11 slowed to 0.5x as input (first try failed uncharged) | a9625334-5461-4911-80ef-ceb938ce10d2 |
| 2026-09-28 22:15 UTC | kling_video_edit | 0 | SB2 first try on the 2.0 s #11 clip: FAILED, not charged | 956ba16b-4c28-4832-bf9a-8916da08d7e6 |

**Total after v2: 141.5 of the 175 cap** (balance 1992.04 at the start of wave 1, 1850.54 after the last
job: delta 141.5, matching this table). No retries were needed beyond the uncharged SB2 failure.
| 2026-09-29 00:15 UTC | minimax_h3_max | 15.0 | LSV1: verse singing L1-L2, real day-take 20.0 s frame, 3/4 | 1b5fd44f-1520-49c2-82b2-e5b7dfed156e |
| 2026-09-29 00:15 UTC | minimax_h3_max | 15.0 | LSV2: rattle-section singing L10-L11, real day-take 40.0 s frame, 3/4 | a4e57e94-d18b-40a1-8a01-fd2ae4ddb82a |

**Total after v3: 171.5 of 175** (balance 1850.54 before, 1820.54 after: delta 30).
