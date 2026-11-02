---
title: Layered PowerContext Skills
description: Shared Skill resources, host bindings, and native distribution.
---

# Layered PowerContext Skills

PowerContext distributes one shared workflow Skill with a host-specific binding reference. The entry, `powercontext-project-context`, directs the Agent to the detail needed for its request. Each installed package contains its own resources and can be used independently of the source checkout or another host's package.

The responsibilities of system guidance, tools, and Skills are described in [Agent tool routing and result reporting](integration-guidance.md).

## Entry and references

`SKILL.md` contains the discoverable name and description, intent routing, and common result and authorization rules. Its references cover Scope and Memory, Work Handoff, candidate Review, and Experience/Skills. The Agent reads the relevant reference when it needs workflow detail; a self-contained tool call can use its existing description directly.

`references/host.md` describes the installed host's Scope selection, resolver commands, and connection facts. Keeping this information separate lets each host bind the shared workflow to its native session and workspace model.

## Shared source and distributions

The maintained source is `integrations/agent-plugin/powercontext/`. Its `skills/powercontext-project-context/` directory contains the shared Skill files, and `mcp.json` contains the packaged default MCP declaration.

```text
agent-plugin/powercontext/
  skills/powercontext-project-context/ --> Shared entry and references
  mcp.json ----------------------------> Default MCP declaration
                       |
                       v
             Resource synchronization <--- Package locations and extra resources
                       |              <--- Host-owned references/host.md
                       +--> Native Skill packages
                       +--> Native MCP declaration formats
                                      |
                                      v
                         Host packaging and installation
```

The synchronizer copies the entry's reachable resources and each host's declared auxiliary files. It preserves that host's `references/host.md`. Codex and Pi include native Agent metadata; Kimi includes its additional Experience/Skill reference; MiniMax includes HTTP guidance and examples.

MCP declaration adapters translate the common default into the formats used by Codex, Claude Code, WorkBuddy, ZCode, Kimi Code, and MiniMax. Runtime endpoints and credentials still come from the host's connection configuration.

The package locations and auxiliary files are declared by `HOST_GUIDANCE` in `src/powercontext/cli/guidance.py`. `make integration-guidance` synchronizes the checked-in distribution copies. `make integration-guidance-check` detects changed copies, obsolete resources, and broken local references. The synchronizer does not use `integrations/capabilities.toml` to select or rewrite workflow text; that file describes supported capabilities and profiles.

## Native discovery and binding

Hosts discover the same `powercontext-project-context` entry through their native package declarations or Skill directories. DSH installs it under `$DSH_HOME/skills/powercontext-project-context`; Hermes uses `$HERMES_HOME/skills/powercontext-project-context`. Their plugins continue to provide tools and lifecycle integration independently of Skill discovery.

Installers copy the Skill's actual files, including auxiliary assets and metadata. They validate local references and expand the installation values required by the host binding. Managed Markdown regions receive the packaged text while personal text outside those regions and user-added files are preserved. Kimi stores its resolved configuration in `references/host.md`; an incomplete installation must be refreshed before configuration can write it.

## Capabilities and authority

A shared reference describes a workflow, while the host adapter determines its available operations, Scope binding, and approval path. The Agent follows the active catalog's exact tool names, inputs, and return shapes. For example, OpenClaw does not expose Memory inventory or candidate Review even though those references ship with the shared Skill.

Host permissions and Server authorization govern each operation. Skill files describe how to use those operations. A missing Skill leaves independently sufficient tool guidance usable; a missing workflow or tool must be reported rather than recreated through another operation.

Contributor validation and model evaluation are described in the [guidance evaluation guide and record](integration-guidance-evaluation.md).
