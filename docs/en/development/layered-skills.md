---
title: Layered PowerContext Skills
description: Discover intent first, then load only the relevant Memory, Handoff, or Review workflow.
---

# Layered PowerContext Skills

The Skill entry is a small intent router. It explains when to search, list, save, hand off, or inspect candidates; workflow references carry detailed arguments, result interpretation, and approval boundaries.

Ordinary coding and summaries with sufficient current context need neither a Skill load nor a PowerContext call. An explicit operation still needs its real tool and observed result. An agent may call a self-contained tool directly, or load the relevant domain when it needs detail. Reading the router first, loading all domains, and loading before every response are not prerequisites. English and Chinese intent phrases live in actual Skill descriptions.

## Shared source and distributions

`integrations/agent-plugin/powercontext/skills/powercontext-project-context/` owns the shared entry and workflow references. Edit those files directly. `HOST_GUIDANCE` in `src/powercontext/cli/guidance.py` identifies each package and its additional resources. Each host owns its `references/host.md`, which records native Scope selection, resolver commands, and connection facts. The synchronizer preserves that file instead of copying the portable binding.

```text
integrations/agent-plugin/powercontext/
  skills/powercontext-project-context/ -- shared entry and references
  mcp.json ----------------------------- default MCP declaration
                 |
                 v
scripts/integration_guidance_skills.py <--- HOST_GUIDANCE
                 |                    <--- host-owned references/host.md
                 +--> native Skill packages
                 +--> native MCP declaration formats
                              |
                              v
                     host packaging and installation
```

`make integration-guidance` copies the shared resources and adapts MCP declarations for Codex, Claude Code, WorkBuddy, ZCode, Kimi Code, and MiniMax. Each distribution contains its own checked-in files, so an installed package does not depend on another host's package. Evaluation vendors pin immutable shared-source commits for replay.

Skill packages use their actual files and local references for installation checks; no private resource inventory file is required. Installers include auxiliary files such as assets and native metadata, even when the entry does not link to them. Managed-region updates preserve personal text outside those regions and additional user files.

This shares authored guidance and packaged connection defaults. Runtime endpoints, credentials, tool implementations, approval channels, and Scope bindings remain owned by the Server or native adapter. Shared references do not enable every described operation on every host; consult `integrations/capabilities.toml` and the active tool catalog. Kimi configuration requires the current host-binding reference. If it is missing, configuration fails before writing and directs the user to run `powercontext setup kimi-code`. Setup replaces managed regions with the current packaged content while preserving personal text outside those regions and existing settings.

## Host layout

| Hosts | Discoverable entry | Workflow detail |
| --- | --- | --- |
| Codex, Claude Code, WorkBuddy, Kimi Code, portable Agent Plugin, Pi, OpenCode | `powercontext-project-context` | Shared Memory, Handoff, Review, and Experience/Skills references plus host-owned `references/host.md`. |
| Hermes | `powercontext-project-context` | Native discovery from `$HERMES_HOME/skills`. |
| MiniMax | `powercontext-project-context` | Shared workflow references, HTTP boundary guidance, and examples. |
| OpenClaw | `powercontext-project-context` | Shared references; inventory and candidate Review remain unavailable in the native adapter. |
| DSH | `powercontext-project-context` | Native discovery from `$DSH_HOME/skills`. |

File-backed hosts ship references beside the installed entry. OpenCode's npm archive includes the complete Skill directory. WorkBuddy's installer resolves Python and Scope-helper placeholders in all installed Markdown resources. OpenClaw uses the SDK's manifest `skills` directory mechanism. DSH and Hermes install the Skill in their native user Skill directories.

All maintained Skill entries and installation paths use `powercontext-project-context`. Framework adapters and Bub do not expose these Skill entries.

## Workflow boundaries

Memory search finds relevant history; inventory lists a requested collection. An empty search does not authorize listing. Explicit save uses the Memory write; automatic Source capture is not saved Memory. Preserve exact citations on revisions.

Temporary Handoff returns the complete prepared carrier, including required nullable fields and generation receipts. Use each host's actual high-level or capture/activate/finalize workflow. Only an explicit durable-milestone request permits commit. Inspected facts without exact PowerContext citations remain declared claims. Acknowledgement checks current evidence, capability, and authority; it does not prove that work ran.

Review inspection and generation do not grant approval, publication, installation, or execution. Each host retains its actual exposed operations and approval channel. OpenClaw retains private-session and tool-availability gates.

Skill absence does not disable independently sufficient tool guidance. A missing resource must identify its exact Skill/path; a failed operation must identify its name and safe returned reason. Distinguish empty, rejected, unavailable, and unknown outcomes. Do not invent a diagnosis, repeat an unconfirmed write blindly, or claim success without a result.

## Validation

Run `make integration-guidance-check` to reject drift in shared copies and MCP declarations, obsolete packaged resources, and broken local references. This resource check does not establish native tool availability, approval behavior, or resolver execution; host behavior needs separate qualification.

Run `uv run pytest tests/test_layered_skills.py` to inspect OpenCode, OpenClaw, Pi, and DSH npm archives and read their reachable Skill references. Installer regressions exercise actual OpenCode reference copying and WorkBuddy placeholder expansion. Pi's package test uses its SDK Skill loader. OpenClaw's package test invokes `skills list --json` with an isolated profile. These tests are separate from live-model routing evidence.

Export catalogs as described in [tool-routing validation](integration-guidance.md), then opt into resource reads:

```sh
uv run python scripts/evaluate_integration_guidance.py \
  --catalog /tmp/pc-guidance/dsh.json --layered-skills --env-file .env \
  --output /tmp/pc-guidance/layered.json --skill-modes unloaded unavailable
```

Repeat `--catalog` for each host. The evaluator offers an optional reader of the actual shipped resource text and records every requested resource. It does not force a Skill load or a data tool. Unavailable mode exposes no reader. This controlled reader is evaluation infrastructure, not a native host loader or distribution source. MCP-backed catalogs, including MiniMax, do not prove each product's native automatic discovery. Routing and argument validation remain separate from transcript-bound reporting review. Preserve failed observations and evaluation limits.

Explicit `skill_search` and `skill_handoff` probes must successfully read their respective Memory or Handoff workflow before the data operation. Reading only the router, a different domain, or reading after the operation does not qualify. The report records the expected resource and resources read before the operation, preserving any more specific failure. Ordinary requests do not require a Skill read, and unavailable mode still evaluates independently usable tools.

Run-specific configuration, transcripts and findings belong in an evaluation report; the PR records delivery status.
