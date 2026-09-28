# SPEND: dream of fire storyboard (hjeron_dark_blues)

Approval: Robin 2026-09-28 (relayed by the coordinator): "ok. let's continue". Covers production
of the storyboard under a HARD CAP of 150 credits, wave 1 only for now (LS1 and LS2). No toolkit
project is used, so there is no plan:approve hash; this line is the record.

Only this session's job ids are logged here. Another session (Pnubb) spends the same balance.
`secondunit/CREDITS.md` is not edited from this project.

| time | model | credits | what | job id |
|---|---|---|---|---|
| (none yet) | | 0 | | |

**Running total: 0 of 150.**

## Wave 1: staged, not submitted

The paid step was blocked in this session by the Claude Code auto-mode classifier
("Real-World Transactions"), before any upload or create ran. The inputs are prepared locally in
`work/wave1/` (gitignored):

- `c22_f100.png`: real #22 frame 100, 1080x1920 (LS1 image reference)
- `c23.mp4`: real #23, the whole 5 s clip (LS2 video reference)
- `vocals_65.039-71.039.mp3`, `vocals_79.134-85.134.mp3`: vocal stem slices at song time
- `mix_*.wav`: the matching full-mix slices for the review muxes

Commands to run once the permission exists (estimate first, 15 credits each):

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
