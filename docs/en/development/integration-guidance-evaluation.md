---
title: Agent guidance evaluation guide and record
description: Run routing and Skill evaluations, interpret their evidence, and inspect recorded measurements.
---

# Agent guidance evaluation guide and record

This guide is for contributors validating PowerContext guidance. The [routing design](integration-guidance.md) defines expected Agent behavior; [layered Skills](layered-skills.md) describes the shared resources and host discovery.

## Evaluation scope

Resource consistency, native host execution, and model behavior are separate checks. Resource checks compare packaged files and references. Native tests exercise discovery and registered tools. Model evaluation measures operation selection, arguments, and final answers against controlled replies. Each result applies to the host, model, Skill, and contract recorded with it.

The [Claude Code skill-up suite](https://github.com/oceanbase/powercontext/blob/master/evaluation/skills/skill-up/README.md) and [ZCode suite](https://github.com/oceanbase/powercontext/blob/master/evaluation/zcode_guidance/README.md) maintain their own setup, pins, and paired with/without-Skill runs. Their READMEs describe their execution and permission fixtures. Keep those results separate from native approval, persistence, memory-quality, and task-outcome measurements.

## Prepare the environment

Use the repository's locked Python development environment and install the dependencies for the host packages being tested. Build OpenClaw before exercising its entry point. Its pinned SDK needs Node 24.15 or newer; `POWERCONTEXT_GUIDANCE_NODE` can select that interpreter for adapter evaluation.

Live evaluation reads `LLM_MODEL`, `OPENAI_LLM_BASE_URL`, and `LLM_API_KEY` from the specified environment file. Keep credentials and private transcripts outside version control.

## Check packaged resources

```sh
make integration-guidance-check
uv run --locked pytest tests/test_layered_skills.py tests/test_guidance_installation.py
```

These checks cover shared-copy drift, obsolete files, local references, packaged resources, and installation. They do not call a model or establish that every external host discovers or executes the Skill.

## Export native catalogs

Set `POWERCONTEXT_GUIDANCE_EXPORT` to an existing directory. The following commands export the model-visible guidance, tools, and Skill metadata from their respective host tests:

```sh
mkdir -p /tmp/pc-guidance
export POWERCONTEXT_GUIDANCE_EXPORT=/tmp/pc-guidance
uv run --locked pytest tests/test_mcp.py
pnpm --dir integrations/dsh/plugins/powercontext/tests/runtime install --frozen-lockfile
pnpm --dir integrations/dsh/plugins/powercontext test:e2e:runtime
pnpm --dir integrations/opencode/plugins/powercontext test
pnpm --dir integrations/pi/plugins/powercontext test
pnpm --dir integrations/openclaw/plugins/memory-powercontext test
```

DSH exports compiled schemas and system context from an actual SDK model request. Its package registration test alone does not export that catalog. Pi uses its SDK Skill loader, and OpenClaw's package test invokes native `skills list --json` with an isolated profile. MCP initialization is checked through a FastMCP client.

Hermes exports native `skills_list` and `skill_view` metadata from an isolated home. Use the source revision pinned by its CI job, Hermes v2026.8.18 (CLI 0.20.4), and retain the export environment variable:

```sh
git clone https://github.com/NousResearch/hermes-agent.git /tmp/pc-hermes
git -C /tmp/pc-hermes checkout e624e9fde561e1add9388384012b295fde669ade
POWERCONTEXT_HERMES_SOURCE=/tmp/pc-hermes uv run --locked pytest tests/e2e/test_hermes_skills.py
```

DSH and Hermes discovery names and descriptions come from the native catalogs. The evaluator supplies packaged reference bodies without replacing that metadata. Hermes provider unit tests do not export a native catalog.

## Run model evaluation

```sh
uv run --locked python scripts/evaluate_integration_guidance.py \
  --catalog /tmp/pc-guidance/dsh.json --env-file .env \
  --output /tmp/pc-guidance/results.json --skill-modes loaded unloaded unavailable
```

Repeat `--catalog` for other hosts. Cases cover ordinary work, sufficient context, search, inventory, saving, previews, Handoff, Review, empty retrieval, failed writes, and a missing save tool in English and Chinese. Legitimate Scope resolution is treated as a prerequisite to the data operation. Tool choice is left to the model.

For multi-turn Handoff, add `--cases handoff handoff_request`. The evaluator checks the sequence through preparation and the complete returned carrier. Ordinary and explicitly temporary transfers must not commit a durable milestone.

To measure reference reads, add `--layered-skills --skill-modes unloaded unavailable`. The optional reader exposes actual packaged text and records requested resources. `skill_search` and `skill_handoff` require the relevant Memory or Handoff reference before the data operation; the entry alone, another domain, or a later read does not pass. Ordinary requests need no Skill read. Unavailable mode provides no reader and checks whether the remaining tool guidance is sufficient.

## Interpret execution evidence

The model evaluator returns controlled replies and performs no real Server writes or generation. Native adapter evaluation runs registered Pi and OpenCode tools and the built OpenClaw entry against controlled HTTP replies, recording translated arguments and wrapped results. Fixture approval does not establish a real interactive approval channel. DSH uses controlled MCP replies here; its SDK export and runtime acceptance are separate checks. MCP catalogs do not establish each product's native Skill discovery.

Handoff validation follows each adapter's actual result shape. Pi and OpenCode finalize `prepare.data` or `activate.data.draft` and return `finalize.data`. Native DSH MCP exposes activation `draft` at the top level and returns the complete finalization result. High-level Pi returns `data.handoff`; OpenClaw, Hermes, and native DSH MCP return `handoff`. The high-level call needs no separate capture or finalization. Required nullable `base`, Scope, exact evidence, and receipts must survive; optional null metadata may be omitted.

Model errors, empty output, truncation, endpoint failures, invalid arguments, and incomplete carriers remain failures. A correct first tool choice alone does not establish a completed workflow or an accurate final answer.

## Review result reporting

`routing_passed` and `arguments_passed` cover operation selection and arguments. Each observation starts with `reporting_passed: null` and `acceptance_passed: false`. Review the recorded calls, controlled replies, and final answer for false success, invented evidence, and unfinished work.

Create a JSON object keyed by each observation's `review_key`. Each value needs a boolean `passed` and a specific nonempty `reason`. Apply the review without another model call:

```sh
uv run --locked python scripts/evaluate_integration_guidance.py \
  --review-report /tmp/pc-guidance/results.json \
  --reporting-review /tmp/pc-guidance/reporting-review.json \
  --output /tmp/pc-guidance/reviewed-results.json
```

The key hashes the exact observation, so changed calls or answers invalidate an earlier review. Live evaluation exits nonzero until reviewed; the review command exits zero only when all observations pass routing, arguments, and reporting. Retain failures, unreviewed observations, catalogs, and transcripts with the run.

## Historical measurements

The following records retain their original inputs, failures, and qualification rules. They do not qualify the current checkout. The 2026-09-09 baseline was upstream `fe4002d37663213294ebffe4c080b6676b1c8014`, measured on Windows with `step-3.7-flash` through the configured StepFun endpoint, temperature 0, a 6,000-token output budget, and automatic tool selection. Fixtures used fictional Aurora facts and an isolated `fixture-scope`.

### 2026-09-15: master `847203dc`

The 2026-09-15 evaluation uses `step-3.7-flash`, temperature 0, automatic tool selection, and fictional Aurora facts. DSH contributes 12 observations from `qualification` (10,000 output tokens); the other eight surfaces contribute 96 observations from `qualification-final` (16,000 tokens). This is a composite of those two batches, not one run.

| Surface | Valid sequence and carrier | After explicit reporting review |
| --- | --- | --- |
| DSH | 12/12 | 12/12 |
| Pi | 12/12 | 12/12 |
| OpenCode | 12/12 | 12/12 |
| OpenClaw | 12/12 | 11/12 |
| Hermes | 12/12 | 12/12 |
| Codex MCP catalog | 12/12 | 12/12 |
| Claude Code MCP catalog | 11/12 | 11/12 |
| WorkBuddy MCP catalog | 12/12 | 12/12 |
| Portable Agent Plugin with MCP | 11/12 | 11/12 |
| Total | 106/108 | 105/108 |

The [raw evidence](https://github.com/knqiufan/powercontext/blob/codex/align-powercontext-tool-routing/e2e/integration-guidance/results/step37-native-20260915.jsonl) retains all 276 observations across five batches, including intermediate failures, catalogs, actual native HTTP payloads, controlled replies, final answers, and transcript-bound review reasons. Reporting review was performed by Codex, not a human reviewer or an automatic truthfulness classifier. Two final Handoff failures mark inspected facts `verified` with empty evidence; diagnostics identify `handoff.state[0].basis/evidence`. Another structurally valid OpenClaw answer changes “no code changes” into “no code changes required”; reporting review rejects that stronger claim.

The separate DSH/Codex reporting sample has 17/24 valid selections and 16/24 after review. All 12 failed-write cases report that nothing was saved. Seven missing-tool cases attempt an unavailable operation or fail to produce a terminal answer. One more answer correctly reports no save but suggests Source capture as an alternative; review rejects it. These failures remain unqualified. Passing deterministic tests does not turn them into model acceptance passes.

Native Handoff measurements execute registered DSH, Pi, OpenCode, and built OpenClaw adapters with controlled transport and fixture approval. They verify actual argument selection, host Scope injection, generated Source identity, and response wrappers. Hermes and MCP catalog cases still use direct controlled replies. No real persistence or generation runs here, and no claim is made about every native host's permission channel or automatic Skill discovery.

Carrier validation follows the HTTP contract: optional null metadata may be omitted, but required nullable `base`, exact evidence, and generation receipts must survive. Some answers include the complete carrier inside a response wrapper. The score establishes carrier presence and reporting accuracy, not strict bare-carrier output formatting. Memory calls now also validate required catalog arguments. Acceptance additionally requires an explicit review bound to the exact transcript hash; unreviewed observations stay incomplete and the evaluation command exits nonzero.

All four native adapter regressions run in their package CI jobs. Local validation passed 28 evaluator regressions, 102 focused evaluator/API/manifest tests, 85 MCP/Hermes tests, and 3 JavaScript operation contract tests. Package suites passed DSH 256, Pi 93, OpenCode 53, and OpenClaw 73 tests; the real DSH SDK runtime suite passed 5 tests. Generated API and JavaScript checks, package type checks/builds, applicable pre-commit hooks, and Linux-platform Python type checking passed. OpenClaw uses Node 24.15.0. Older measurements below retain their original, narrower qualification rules.

### Measured model behavior

The [recorded calls, arguments, controlled results, and replies](https://github.com/oceanbase/powercontext/blob/master/e2e/integration-guidance/results/step37-20260909.jsonl) retain failures. These measurements are **not an all-pass certification**, and a prompt is not an authorization mechanism. The initial matrix uses 11 English/Chinese scenarios with the Skill loaded and unloaded, 44 observations per host. Handoff scores in this matrix measure the first selected operation only; they do not establish successful arguments, execution results, finalization, or the absence of a later commit.

| Surface | Accepted routing / observations |
| --- | --- |
| DSH baseline | 36 / 44 |
| DSH implementation | 41 / 44 |
| Pi | 42 / 44 |
| OpenCode | 41 / 44 |
| OpenClaw | 34 / 44 |
| Codex MCP catalog and Skill | 38 / 44 |
| Claude Code MCP catalog and Skill | 39 / 44 |
| WorkBuddy MCP catalog and Skill | 38 / 44 |
| Hermes | 41 / 44 |
| Portable Agent Plugin Skill with MCP | 35 / 44 |

The DSH baseline's unloaded Skill cases included unnecessary preview retrieval and premature Handoff preparation. The implementation's ordinary work, sufficient context, search, inventory, save, preview, Handoff, Review, empty search, and failed-save cases all passed in that sample (40/40). Its three failures attempted a save tool removed from the evaluation catalog. No calls were executed by this catalog evaluator.

The matrix's Handoff classifier initially accepted only the high-level MCP work-transfer operation. Some recorded failures instead selected valid low-level Source capture; the evaluator accepts both paths. Original observations are retained rather than retrospectively presented as a stronger measured success rate.

Boundary qualification covers sufficient context, inventory, Handoff, preview, and empty search in all three Skill states. It recorded WorkBuddy 30/30, Agent Plugin 29/30, and OpenClaw 27/30. Separate Skill-unavailable runs recorded 125/132 accepted selections across DSH, Pi, OpenCode, Hermes, Codex, and Claude Code. Residual cases include unnecessary preview retrieval, premature Hermes preparation, and missing-tool calls. An OpenClaw catalog regenerated through its actual availability-aware prompt builder recorded 1/2 on missing-save-tool scenarios. OpenClaw has no packaged Skill; its Skill-state labels are repeated catalog conditions, not evidence of Skill loading.

Result reporting was inspected separately. Successful explicit writes produced acknowledgements only after the controlled success; failed writes and empty searches produced corresponding explanations. Some empty searches continued with broader queries or list, which remains visible as a failed bounded scenario. A provider timeout and an empty reply are retained as failures, not excluded to improve the score. Additional description constraints address supplied facts, temporary handoffs, and exact Handoff evidence; broad model compliance remains subject to qualification.

The description-boundary sample recorded **48/48 first-turn selections** for Handoff and preview requests across OpenClaw, Hermes, OpenCode, and the Agent Plugin, in English/Chinese and all three Skill states. It did not continue Handoff calls through tool results or inspect subsequent writes. This score is **not multi-turn Handoff acceptance** and does not qualify exact evidence, finalization, or temporary-versus-durable behavior. Original observations remain available, including failures and missing-tool stress results.

### Multi-turn Handoff qualification

The evaluator validates each model call against the exported catalog and generated HTTP request model, returns contract-valid controlled results, and continues through capture, activation/preparation, and finalization, or the high-level current-work operation. It rejects unavailable tools, foreign Scopes, invalid arguments, invented evidence, altered Drafts, parallel dependent writes, and any commit in a temporary or ordinary transfer request. A pass also requires a terminal answer containing the complete unchanged prepared carrier. Result wording and the truth of the supplied facts still require inspection; these are controlled-result measurements, not native-host execution.

The `handoff` and `handoff_request` cases cover explicitly temporary transfers and ordinary handoff imperatives. The fixture uses the HTTP response field `source`, while evidence wraps it as `{kind: "source", source_ref: source}`. The high-level input uses WorkClaims with `text`, `basis`, and `evidence`; inspected facts without exact existing PowerContext references use `declared` and an empty evidence list. Skill discovery names remain unchanged.

The 2026-09-10 Step 3.7 Flash qualification uses two cases, two languages, and three Skill states per surface. The historical observation for each condition totals **64/96**, composed from the recorded batches below; it is not a single simultaneous run or an all-host acceptance result.

| Surface | Complete sequences / observations | Evidence batch |
| --- | --- | --- |
| Codex MCP catalog | 12/12 | `contract-sequence` |
| Claude Code MCP catalog | 11/12 | `contract-sequence` |
| WorkBuddy MCP catalog | 8/12 | `contract-sequence` |
| Portable Agent Plugin with MCP | 10/12 | `contract-sequence` |
| Hermes | 10/12 | `structured-native-parameters` |
| DSH | 5/12 | `real-dsh-model-request` |
| OpenCode | 3/12 | `structured-native-parameters` |
| Pi | 5/12 | `structured-native-parameters` |

The [raw JSONL evidence](https://github.com/knqiufan/powercontext/blob/bcfdc9fc726021fce3b20a46f3788096794a2b60/e2e/integration-guidance/results/step37-handoff-20260910.jsonl) retains all batches, including the initial WorkClaim probe and intermediate failures. Each batch includes its exported catalogs and model configuration. DSH's final batch uses the actual compiled SDK model request; intermediate DSH catalogs were exported from registration specifications and do not establish that runtime contract. Model calls still receive controlled results in this evaluation, including in the final DSH batch.

Remaining failures include invalid provenance, malformed or unfinished Drafts, and incomplete or changed carriers. That historical exact-carrier check also rejected omitted nullable fields. No commit call occurred in these latest 96 observations, but early failures truncate those sequences and cannot establish the behavior of a later successful continuation. These model scenarios remain unqualified; deterministic schema and runtime regression checks do not convert them into passes.

### Execution and regression evidence

- Actual DSH 0.1.2-rc.1 SDK/host requests contained the system guidance and all 19 native PowerContext tools before a Skill load. The real host suite passed recall, injection, restart recovery, direct errors, and Scope isolation.
- A live Step 3.7 run through the real DSH host selected `pc_remember`. The pinned SDK has no interactive approval channel, so the host rejected the write. The model reported **not saved** and identified the unavailable approval channel. Server inspection confirmed no Memory write. A subsequent explicit search returned the seeded Memory and its exact citation. No forced fixture tool choice was used.
- The existing real Codex acceptance passed actual Memory save, subsequent search, and no false success when the MCP endpoint was unavailable. It used desktop-bundled Codex CLI 0.153.4 with the configured `gpt-6-astra` model, UTF-8 subprocess output, and loopback proxy bypass. The fixture bounds graceful server shutdown.
- DSH package/HTTP tests, Pi package tests including the real CLI, OpenCode and OpenClaw package tests, MCP initialization, Hermes provider tests, API contract checks, and capability-manifest checks protect executable behavior and tool identity. OpenClaw validation uses Node 24.15.0, supported by its pinned SDK.

### Qualification boundary

Registered catalogs and controlled Skill text do not establish automatic Skill discovery or full execution in every external host. MCP-backed catalog measurements share the same Server tools; they are not three independent native CLI execution runs. Missing-tool stress intentionally tests catalog filtering and can elicit model hallucinations even with explicit guidance. Those results remain unqualified; the runtime must reject absent tools and preserve approval checks. Do not mark those model scenarios passed or infer publication, installation, commitment, or execution from generated text.
