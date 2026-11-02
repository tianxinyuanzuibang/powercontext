---
title: PowerContext 分层 Skill
description: 公共 Skill 资源、宿主绑定和原生分发方式。
---

# PowerContext 分层 Skill

PowerContext 分发一份公共流程 Skill，并为各宿主保留独立的绑定说明。入口 `powercontext-project-context` 将 Agent 指向当前请求需要的细节。每个安装包包含自己的资源，使用时不依赖源码检出目录或其他宿主的包。

系统指引、工具和 Skill 的职责见 [Agent 工具选择与结果报告](integration-guidance.md)。

## 入口与参考文件

`SKILL.md` 包含宿主可发现的名称和描述、意图路由，以及通用的结果和授权规则。参考文件分别说明 Scope 与 Memory、Work Handoff、候选 Review、Experience/Skills。Agent 需要流程细节时读取相关文件；工具描述已充分时可以直接调用。

`references/host.md` 说明安装宿主的 Scope 选择、解析命令和连接事实。各宿主通过这份文件，将公共流程接入自己的 Session 和工作区绑定方式。

## 公共源与发行包

维护源位于 `integrations/agent-plugin/powercontext/`。其中 `skills/powercontext-project-context/` 包含公共 Skill 文件，`mcp.json` 包含打包的默认 MCP 声明。

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

同步脚本复制入口可达的资源和各宿主声明的辅助文件，保留该宿主的 `references/host.md`。Codex、Pi 包含原生 Agent 元数据；Kimi 包含额外的 Experience/Skill 参考文件；MiniMax 包含 HTTP 说明和示例。

MCP 适配逻辑将公共默认声明转换为 Codex、Claude Code、WorkBuddy、ZCode、Kimi Code 和 MiniMax 所需的格式。实际端点和凭据仍由宿主连接配置提供。

`src/powercontext/cli/guidance.py` 中的 `HOST_GUIDANCE` 声明包位置和辅助文件。`make integration-guidance` 同步纳入版本控制的发行副本，`make integration-guidance-check` 检查副本变化、过期资源和失效的本地引用。同步脚本不按 `integrations/capabilities.toml` 选择或改写流程正文；该文件记录宿主支持的能力和 profile。

## 原生发现与绑定

宿主通过原生包声明或 Skill 目录发现统一的 `powercontext-project-context` 入口。DSH 将它安装到 `$DSH_HOME/skills/powercontext-project-context`，Hermes 使用 `$HERMES_HOME/skills/powercontext-project-context`。插件独立提供工具和生命周期集成。

安装器复制 Skill 的实际文件，包括辅助资产和元数据，检查本地引用，并展开宿主绑定所需的安装值。受管理的 Markdown 区域使用打包正文，区域外的个人文本和用户附加文件予以保留。Kimi 将已解析的配置写入 `references/host.md`；安装不完整时，须先刷新安装再配置。

## 能力与权限

公共参考文件描述流程，宿主适配器决定可用操作、Scope 绑定和审批渠道。Agent 遵循当前目录中的准确工具名、输入和返回结构。例如，OpenClaw 随包提供公共参考文件，但不开放 Memory 盘点或候选 Review。

Skill 文件提供指引，执行权限仍由宿主和 Server 控制。Skill 缺失时，Agent 可以继续使用说明已充分的工具；流程或工具缺失时，应说明缺失项，而不是用其他操作模拟。

贡献者验证与模型评测见[指引验证方法与记录](integration-guidance-evaluation.md)。
