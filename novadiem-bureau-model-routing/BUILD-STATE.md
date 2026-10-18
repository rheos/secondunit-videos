# Build state: The Casting Board (Inside the Bureau, deep dive 9)

**Draft 1 BUILT 2026-10-18.** Seven plates, 87 s, 720p, kit `paper` theme (The Cold Read's look).
Question: who decides which model does which job? Send it when someone asks "Is it one AI doing
everything?" or "Which model runs the review?"

## Facts used (from ~/Code/novadiem/bureau at origin/main 939f522, read with `git show`; one row also checks a real run's resolved file for its shape)

| On screen | Source |
|---|---|
| Roles and their names (The Conductor, Analizer 2000, The Spellwright, The Architect, The Challenger, Scoot, The Counselor) | docs/model-routing-and-cast.md § The cast and model per agent |
| Each role's default tier: Conductor strong, Analyst standard, Spellwright standard, Architect strong, Challenger strong, Scoot cheap (locked), Counselor frontier | config/model-policy.v2.json `roles.<role>.default_tier`, `roles.scoot.lock` |
| The five tiers, cheap to escalated | config/model-policy.v2.json `tiers`; model-routing-and-cast.md tier table |
| "Start on the cheapest tier that is usually good enough, then escalate on evidence" | model-routing-and-cast.md § Model routing, budget posture |
| At run start: run `scripts/resolve-model-routing.sh`, copy to `RUN_DIR/model-routing.json`, log `runtime` in log.md, read `roles.<role>` at each spawn (the bottom bar) | model-routing-and-cast.md § Model policy (v2 routing), "At run start" 1-4 |
| Policy (role -> tier) plus runtime adapter (tier -> model) resolve the file; one entry per role with tier, model, reasoning effort, fresh context | model-routing-and-cast.md § Model policy; a real resolved file's shape (`roles.challenger`: tier, model, reasoningEffort, freshContextRequired) in nutrifax/.bureau/runs/20260902-admin-console-zine/model-routing.json |
| Claude: cheap haiku, standard sonnet, strong opus, frontier and escalated fable | config/runtimes/claude.json `tiers` |
| Claude has no effort setting; higher tiers ask for more thinking in the spawn prompt | config/runtimes/claude.json `supports_reasoning_effort: false`, frontier and escalated notes |
| One host per run: read `runtime` once and keep that transport for the run; `run-start.sh --runtime openai` starts a Codex run | docs/host-runtime.md (top table and "Do not infer host behavior"); model-routing-and-cast.md § Runtime selection |
| Codex: cheap terra/low, standard terra/medium, strong sol/high, frontier sol/xhigh (escalated astra/max, not drawn) | config/runtimes/openai.json `tiers` |
| openrouter is not a build host: metered API is for non-build passes only, `run-start.sh` refuses it | docs/host-runtime.md § Subscription vs metered API |
| A Challenger rejection escalates the fixer, not the reviewer: first rejection -> strong, second -> escalated; a role already at the target stays where it is | config/model-policy.v2.json `escalation_ladder`; model-routing-and-cast.md § Escalation ladder (Claude) |
| Every fable spawn carries a written `MODEL-OVERRIDE:` reason in the log | model-routing-and-cast.md ("Every fable spawn carries a hand-written reason") |
| Fresh context is tracked separately from model strength; Conductor is the one drawn role without it | model-routing-and-cast.md tier section; model-policy.v2.json `fresh_context_required` |
| A final gate is a fresh cold pass on the same capable tier, not a costlier model; independence comes from the fresh context; escalation only after a review missed something | model-routing-and-cast.md § Escalation ladder (Claude); model-policy.v2.json `roles.challenger.note` |
| thebureau.dev, novadiem.com | README.md "Further reading" (as in films 1 to 8) |

## Changed or simplified, on purpose

- The brief's line was "role, model, effort and host are separate choices". In the docs, model and
  effort are not set directly: they follow from tier and host through the runtime adapter. So the
  film shows role, tier, host and fresh context as the separate choices, and plate V shows a host
  change re-resolving model and effort while the tier column holds. Plate VII's captions say so.
- The brief's "one change in one column doesn't move the others" holds for tier, host and fresh
  context. A host change moves model and effort by design; the film shows that rather than hiding it.
- The Spellwright bounce (plate IV) is illustrative: prompts.md rejected twice by the Challenger.
- Plate V's "next run" resets the Spellwright to its default tier: routing is resolved per run.
- Seven of the 17 roles are drawn. Cursor and Grok hosts, Cursor's three-rung ladder, the Codex
  Spark profile and the legacy Claude tiers are left out.
- Nothing is drawn dashed: every part shown exists on origin/main.
- The bottom bar is run start steps 1-4, then a retry and the next run: the stage of the story,
  not run progress.

## Plates (score seconds)

| Slot | File | Window | Red |
|---|---|---|---|
| m1 | m1-board.html | 0-8.87 | WHO PLAYS EACH PART? |
| m2 | m2-cast.html | 8.87-21.22 | none |
| m3 | m3-resolve.html | 21.22-34.18 | none |
| m4 | m4-bounce.html | 34.18-48.6 | Only the fixer moves. |
| m5 | m5-host.html | 48.6-64.48 | The tiers don't move. |
| m6 | m6-fresh.html | 64.48-75.07 | the fresh context. (lands as the bass thins at ~66 s) |
| m7 | m7-per-run.html | 75.07-87 | Not one AI doing everything. + colophon |

Device: the casting board (`CB` in index.html). Rows are roles; columns are tier, model, effort,
host and fresh context. Plate VII pulls the columns apart.

Score: score-library `bureau-art-pop-bureau-model-routing/take-01.mp3` (sha256 35f96552...103a), no
splice, played at 0.84 volume (the take is -12.4 LUFS). Builds 0-36 s, full 36-66 s, bass thins
66-84 s, decays from 84 s. `beats.json` is librosa's grid (0.5805 s gap, ~103 BPM), extended to
both ends.
