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
