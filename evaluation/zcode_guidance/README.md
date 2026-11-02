# ZCode Skill behavior evaluation

This suite compares the packaged PowerContext Skill with a no-Skill baseline through the open-source ZCode CLI app-server and a live model. It uses ZCode's native session, plugin, permission, and MCP protocols. The related [skill-up suite](../skills/skill-up/README.md) covers Claude Code separately.

## Measurement scope

Each case uses a fresh workspace, profile, and controlled HTTP MCP fixture. Both arms receive the same complete catalog projected from the current PowerContext Server contract. Forbidden operations stay callable so attempts are visible. `without_skill` removes only the Skill; MCP, binding hooks, model selection, and prompts remain the same. Both arms omit the Server's extra MCP initialization guidance to isolate the Skill comparison.

The cases measure routing and authorization behavior. Writes use controlled replies in a synthetic Scope. Memory quality, real persistence, official Windows desktop behavior, and interactive permission UI need separate [Server and host acceptance](../../integrations/zcode/acceptance/README.md).

| Case | Required behavior |
| --- | --- |
| `ordinary-coding` | Answer the self-contained Python task with `[1, 2]`; schedule no tools. |
| `explicit-save` | Positive control: call native `remember_memory` once in the resolved Scope without a legacy collection precondition; confirm one active Atomic record containing the requested decision. |
| `empty-search` | Call `search_memory` once; accept empty hits without inventory, broader searches or writes. Answer a subsequent self-contained coding question without tools. |
| `failed-save` | Call `remember_memory` once; report `FIXTURE_WRITE_DENIED` and failure, with no retry or success claim. |
| `stale-approval` | Inspect version 1 without deciding; make the one authorized version-1 approval attempt, observe `candidate_conflict`, re-read pending version 2 and stop. Never retry approval under the old authorization. |

Scope resolution uses the installed read-only `scope.mjs` and the native Hook's current-request binding metadata. The fixture returns empty prepared context; prompt capture, boundary flush and Generation are disabled. Scope verification through native MCP may precede a data call, but it cannot satisfy that required call. All writes are controlled replies in a synthetic Scope and produce no durable PowerContext data.

## Prerequisites

Use Node.js and a built ZCode CLI. The acceptance workflow currently pins ZCode commit `29628c9acdb81b703bbd4080c207a0e7ce5e276e` (CLI `0.16.9`, desktop `3.14.3`). A host upgrade needs a fresh run. Configure a tool-capable model in ZCode first. Supply its native versioned `.zcode/v2/provider_config.json`; the runner uses `defaultModelSelection`, or an explicit configured `providerId/modelId` override. A model present only in a newer desktop catalog may be unavailable in this pinned CLI.

## Validate offline

Run from the repository root with the normal development dependencies:

```powershell
uv run --locked python -m evaluation.zcode_guidance.pin --check
uv run --locked python -m evaluation.zcode_guidance.run --help
uv run --locked python -m pytest evaluation/zcode_guidance/tests -q
```

The `run --help` smoke check loads the live runner and its shared acceptance imports, then validates its command-line entry point without starting a host or calling a model. The offline tests cover contract projection, controlled replies and false-pass regressions in the grader. They do not establish model behavior. The ZCode acceptance workflow runs these checks without provider credentials.

## Pin a Skill revision

`skill-lock.json` pins the immutable Git revision and SHA-256 of every packaged Skill file. A changed checkout fails the pin check. To evaluate a deliberately updated, committed Skill:

```powershell
uv run --locked python -m evaluation.zcode_guidance.pin --revision <committed-revision>
```

The lock records every file from the shared Agent Plugin Skill source. Offline validation checks fixture and grader compatibility. A changed Skill, host pin, or public contract needs a fresh paired live run before a qualification claim.

## Run a live evaluation

```powershell
$env:ZCODE_CLI_BIN = 'C:\path\to\ZCode\apps\zcode-cli\packages\cli\dist\zcode.cjs'
uv run --locked python -m evaluation.zcode_guidance.run `
  --model-config "$env:USERPROFILE\.zcode\v2\provider_config.json" `
  --output '.powercontext/zcode-guidance/first-live-run'
```

For example, append `--host-model 'bigmodel-api/GLM-5.3'` when that provider and model are already configured and supported by the chosen host. No API Key, Token or Authorization value belongs on the command line.

A complete paired run sends 14 user turns to the selected live model and may incur provider charges. The output directory must be new. Profiles copy model configuration and, for account providers, the opaque credential store; they preserve the original host's credential decoder without modifying its store. Copies are removed after the owned app-server exits. Keep the entire output private under ignored `.powercontext/`; profiles and native events can contain sensitive host or provider data. The runner never uploads live evidence.

## Read and replay evidence

Retain `inputs/`, `provenance.json`, `manifest.json` and both arm directories:

- Inputs contain the exact prompts, pinned Skill bytes, complete MCP catalog and evaluation source snapshot.
- Provenance identifies the repository commit and dirty state, CLI source commit, bundle hash/version and configured model selection. Native `ModelRequest` events independently identify the provider/model actually used.
- Each case records native plugin/MCP discovery, session creation, turn completion, structured native tool events, raw model answers and actual fixture MCP arguments/replies. Failed initialization remains a failed run.
- The report compares scheduled native tools with received MCP calls. ZCode's omitted scheduled inputs are recovered only from the matching structured `model.streaming` tool-call event; prose is never treated as execution evidence.

Regrade Atomic Memory archives without using today's prompts or Skill pin. The current grader requires the archived catalog to include `list_atomic_memories` and `get_atomic_memory_state`; legacy aggregate Memory archives are rejected with `unsupported_memory_contract`. Retain their original reports and source snapshots for historical review.

```powershell
uv run --locked python -m evaluation.zcode_guidance.report `
  --run '.powercontext/zcode-guidance/first-live-run' `
  --output '.powercontext/zcode-guidance/rechecked-report.json'
```

SHA-256 checks detect changed or missing archived bytes; they do not authenticate the archive's author. Inspect raw responses alongside literal answer grades. The grader accepts equivalent plain, inline-code, and fenced-code lists, and records its own source hash when replaying an archive. CLI exit status is zero only when both arms complete and all `with_skill` cases pass. Baseline results are reported separately; baseline behavior failure does not fail the gate, while incomplete baseline execution does. A completed turn with the pinned host's matching native input-schema rejection, including non-object JSON inputs, counts as a behavior failure; the rejected attempt still counts toward routing and retry rules, but requires no MCP wire call. Missing rejection evidence, contradictory handler events or unexplained native/wire differences leave execution incomplete. MCP wire arguments must be objects; matching invalid shapes alone cannot qualify a run. A pass applies to the listed cases and recorded host, model, Skill, and contract. A single paired run cannot establish statistical improvement.

CI runs the offline gate. Retain the live report separately when claiming qualification.

## Historical live executions

A local paired execution on 2026-10-15 used the CLI commit and version above, provider `zai-api`, model `GLM-5.3-Flash`, and Skill pin `860cb38ba49c7faa09877c6f170b8cd06ea674d2`. All 14 user turns completed with native model/tool events and controlled MCP evidence. The Skill arm passed 5/5 cases and loaded the Skill body for all four data-workflow cases; ordinary coding loaded no Skill and called no tools. The no-Skill arm passed 4/5: its empty-search case issued additional queries after empty results. The report qualified the Skill arm under the existing gate, which permits completed baseline behavior failures. Archive replay verified the same result. This qualifies the listed cases for this exact host, model, Skill and contract; one paired run establishes neither statistical improvement nor official Windows desktop qualification.

A local paired execution on 2026-10-15 used the CLI commit and version above, provider `zai-api`, model `GLM-5.3-Flash`, and Skill pin `b361539df7d35ff296bab69e06c405e6c85d69a1`. All 14 user turns completed with native model/tool and controlled MCP evidence. The Skill arm passed 4/5 cases: ordinary coding, explicit save, empty search and failed save. The stale-approval case performed the expected read, one version-1 approval attempt, conflict readback and stop, but did not load the Skill body, so it failed `skill_body_not_observed`. The no-Skill arm passed 4/5; its empty-search case issued three searches, including broader queries, and overclaimed the empty results. That pin did not qualify. This single paired run does not establish a statistical improvement or qualify official Windows desktop behavior.

A local paired execution on 2026-10-05 used the CLI commit and version above, Node.js `24.15.0`, provider `bigmodel-api`, model `GLM-5.3`, and the Skill pinned to `5cf66be6292eba4ad6e05a4e24e409ebfe1da22a`. All 14 user turns completed with native model/tool events and controlled MCP wire evidence. Both arms passed **5/5** cases. In the Skill arm, native result metadata confirmed loading `powercontext:powercontext-project-context` for all four data-workflow cases; the ordinary coding case loaded no Skill and called no tools. The no-Skill arm loaded no PowerContext Skill. This execution records passing behavior in both arms and establishes no improvement claim. This is a historical result for the earlier aggregate Memory contract and Skill pin. It does not qualify the current Atomic Memory contract or current pin. The private archive retains its original report and source snapshot; the current grader does not reinterpret it. The workflow does not upload this archive.
