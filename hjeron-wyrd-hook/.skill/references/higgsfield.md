# Higgsfield provider

The toolkit can run on a Higgsfield subscription's plan credits in place of Fal. The steps, recipes, reviews, receipts and approval gate are unchanged; only the backend underneath differs. Fal stays the default.

## Select it

- New project: `ruby "${CLAUDE_SKILL_DIR}/scripts/mv.rb" init --project /abs/project --song /abs/song.wav --prompt-file /abs/brief.md --provider higgsfield`. This writes `"provider": "higgsfield"` to `config/project.json`.
- Existing project: add that key, or export `MV_PROVIDER=higgsfield` (the environment wins over the project file).
- `doctor` reports `provider`, `higgsfield_cli`, `higgsfield_login`, `higgsfield_credits` and whether `uv` is available for the local tools.

Authentication is the signed-in `higgsfield` CLI (`higgsfield auth login`, once, by the user). There is no API key and nothing to configure in the plugin; the CLI's own session is used. This spends the account's **plan credits**. The Higgsfield Cloud API is a separately billed product and is not used.

Run Higgsfield tasks through the Ruby CLI directly. The plugin's `music-video` MCP server also accepts them without a Fal key, since a Higgsfield project needs none.

## What maps to what

| Step / recipe | Fal | Higgsfield |
|---|---|---|
| Character sheets, frames (`RefBase`) | `openai/gpt-image-2.5/sunburst` xhigh | `gpt_image_2_5` variant=sunburst quality=xhigh resolution=2k (2688x1520 at 16:9) |
| Pose / framing edits (`Keyframes`, `edit_from`) | GPT Image 2.5 edit | `gpt_image_2_5` with `image_references` |
| `RefTorn`, `image_model: NanoBanana2` | `fal-ai/nano-banana-2` (edit) | `nano_banana_flash` (Nano Banana 2) at 2k |
| Character animation (`Video`, `Shots`, `Clips`) | `minimax/h3-max/image-to-video` 1080P | `minimax_h3_max`, **768p max** |
| `sfx:gen` | Stable Audio 3 SFX | `mirelo_text_to_audio` (prompt + duration only) |
| `audio:transcribe`, overlay words, music review | Fal Whisper (paid) | **local** faster-whisper (`WHISPER_MODEL`, default `small`) |
| `media:stems` | Fal Demucs (paid) | **local** Demucs (`DEMUCS_MODEL`, default `htdemucs`; `htdemucs_ft` matches Fal at about 4x the time) |
| Generated song (`Music`, no `music_from`) | MiniMax Music 3 | not available: supply the song |

Whisper and Demucs run in their own pinned `uv` environments (no credits, no upload). The first run downloads packages and weights, so it takes a few minutes. Their results are cached in `output/local/`. Local Whisper mishears sung words exactly as Fal's does, so correct word timings by listening.

## Constraints that change how you plan

**Lipsync runs in reference mode.** Higgsfield's H3 accepts audio only alongside reference images, and it will not mix references with a start or end frame. So any H3 clip with target audio (`audio: true` shots, `Clips` with `audio_at`, the `Video` step) is sent as `image_references` + `audio_references`, and its end frame is dropped (the log says so). A clip without audio still uses `start_image` / `end_image`. Consequences:

- Lipsync quality is good. The 2026-09-28 probe (a sung vocal stem on a green-screen singer) matched word for word, and the returned audio sat at 0.000s offset.
- Framing is not pinned. The model re-frames the character slightly, so sizes and positions vary between clips. Compositing absorbs this: place and scale each cutout in p5 and check placement at the review boundary, instead of assuming the keyframe's framing.
- Identity can drift a little from the reference. Keep the locked character sheet as the reference for every clip, and review faces in the wave review.
- `END_KEYFRAME` pinning in the `Video` step has no effect on a singing shot.

**768p, not 1080p.** A `VIDEO_RES=1080P` request (the steps' default) renders 768p and logs a warning. Characters composited at medium size over 1080p plates hold up. Plan close-ups knowing they will be soft; upscale selectively only when the plan budgets for it.

**No seeds.** `SEED` is ignored (logged). Regenerate within the retry allowance instead of re-rolling a seed.

**Durations are whole seconds.** H3 durations round up (5.5 becomes 6). The returned clip can run a little longer than requested; steps already take only the frames they need.

## Credits and receipts

Before submitting, every paid call runs `higgsfield generate cost` and records the estimate in its receipt (`output/requests/<sha>.json`: `provider`, `request_id` (the job id), `job_type`, `credits_estimate`). Identical requests resume from the receipt instead of paying again. A job that is still running when the wait times out keeps its receipt, so a rerun resumes that same job. Failed, NSFW-blocked and cancelled jobs are not charged, so their receipt moves to `output/requests/failed/` and the next run submits afresh (rephrase first if a prompt was blocked). `NEW_REQUEST=1` forces a new paid job, as on Fal.

Reference prices on the ultra plan (2026-09-28, from `generate cost`): GPT Image 2.5 xhigh 2k = 4.5 credits; H3 Max 768p = 12.5 credits for 5s, 15 for 6s, 25 for 10s; Mirelo SFX = 0.75.

Media go to the CLI as ids. Local files are uploaded once (cached by content), and a finished job's output feeds the next job by its job id, with no re-upload. The url-to-id map lives in `output/higgsfield/media.json`. Higgsfield keeps outputs for about 7 days, and steps download them immediately.

## Section-first use

Plan Higgsfield runs as song **sections** (the hook, a verse, the drop) with `Pipeline.section(at, frames)`, not as one full-length video. Put a full song through only when the user wants footage to edit. Paid tests beyond a single probe need a deliberate brief: which act, which section, which character or world, and why. Do not spend credits on throwaway subjects.

## Schemas

`openapi:fetch` with the Higgsfield provider saves `higgsfield --json model get <job_type>` for each model to `specs/higgsfield_<job_type>.json`. `openapi:summary` prints them. Once saved, unknown params, bad enum values and missing required params fail before anything is spent. Higgsfield's cross-parameter rules (for example "reference media cannot be mixed with start_image") are enforced by the CLI itself.
