---
title: PowerContext 分层 Skill
description: 先识别请求意图，再按需读取 Memory、Handoff 或 Review 的详细流程。
---

# PowerContext 分层 Skill

Skill 入口负责简短路由：什么时候搜索、盘点、保存、交接或查看候选；参考文件负责参数、结果解释和审批边界。

普通编码和上下文充分的概括不需要加载 Skill，也不需要 PowerContext 调用。明确操作仍须调用实际工具并检查结果。
参数已明确时可以直接调用；需要流程细节时只读取相关领域。不要求先读入口、一次加载全部领域或每轮响应前加载。
中英文触发意图写在宿主实际可见的 Skill 描述中。

## 公共源与发行包

`integrations/agent-plugin/powercontext/skills/powercontext-project-context/` 维护公共入口与流程参考文件，
直接编辑其中的内容。`src/powercontext/cli/guidance.py` 中的 `HOST_GUIDANCE` 声明各宿主包及其附加资源。
每个宿主独立维护 `references/host.md`，记录原生 Scope 选择、解析命令和连接事实；同步脚本保留该文件，
不会用可移植包的绑定说明覆盖它。

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

`make integration-guidance` 复制公共资源，并为 Codex、Claude Code、WorkBuddy、ZCode、Kimi Code 和 MiniMax
转换 MCP 声明。各发行包仍包含独立且纳入版本控制的文件，安装后不依赖其他宿主的包。
评估副本固定公共源的不可变提交，用于回放。

Skill 包根据实际文件和本地引用进行安装检查，不要求私有资源清单文件。安装器会携带资产和原生元数据等
未被入口链接的辅助文件。更新受管理区域时，保留区域外的个人文本及用户附加文件。

共享范围包括编写的指引和打包的默认连接声明。实际端点、凭据、工具实现、审批渠道与 Scope 绑定仍由 Server
或原生适配器负责。公共参考文件不代表每个宿主都开放其中的所有操作；以 `integrations/capabilities.toml`
和当前工具目录为准。Kimi 配置要求当前的宿主绑定参考文件；文件缺失时，在写入前提示运行
`powercontext setup kimi-code`。setup 使用当前发布内容替换受管理区域，保留区域外的个人文本及已有配置。

## 宿主组织

| 宿主 | 可发现入口 | 详细流程 |
| --- | --- | --- |
| Codex、Claude Code、WorkBuddy、Kimi Code、可移植 Agent Plugin、Pi、OpenCode | `powercontext-project-context` | 公共 Memory、Handoff、Review、Experience/Skills 参考文件，以及宿主自有的 `references/host.md`。 |
| Hermes | `powercontext-project-context` | 从 `$HERMES_HOME/skills` 原生发现。 |
| MiniMax | `powercontext-project-context` | 公共流程参考、HTTP 边界说明和示例。 |
| OpenClaw | `powercontext-project-context` | 公共参考文件；原生适配器仍不支持盘点和候选 Review。 |
| DSH | `powercontext-project-context` | 从 `$DSH_HOME/skills` 原生发现。 |

文件型宿主将参考文件随入口一起安装。OpenCode 的 npm 包包含完整 Skill 目录；
WorkBuddy 安装器替换所有已安装 Markdown 中的 Python 和 Scope helper 占位符；OpenClaw 使用 SDK 的 manifest
`skills` 目录机制。DSH 和 Hermes 将 Skill 安装到宿主的原生用户 Skill 目录。

各宿主的 Skill 入口和安装路径统一使用 `powercontext-project-context`。框架适配器和 Bub 不提供这些 Skill 入口。

## 流程边界

搜索用于相关历史，盘点用于明确请求的集合。空搜索不授权盘点。明确保存须使用 Memory 写入，自动接收 Source 不能算作
已保存 Memory。修改条目时保留精确引用。

临时交接须返回完整准备载体，包括必需的可空字段和生成回执。使用各宿主实际支持的高级操作或捕获、激活、完成流程。
仅明确要求持久里程碑时才能 commit。已检查事实如果没有精确 PowerContext 引用，仍使用 declared 声明。
接收确认要检查当前证据、能力和权限；确认回执不是工作已执行的证明。

查看或生成候选不授权批准、发布、安装或执行。各宿主保留实际工具和审批渠道。OpenClaw 保留私密会话与工具可用性限制。

Skill 缺失不影响已有完整工具指引。参考文件缺失时说明精确 Skill/路径，操作失败时说明具体操作与安全的返回原因。
区分空结果、拒绝、不可用和未知状态，不猜测根因，不盲目重试结果未确认的写入，也不无依据声称成功。

## 验证

`make integration-guidance-check` 检查公共副本与 MCP 声明漂移、过期的打包资源和失效的本地引用。
此资源检查不能证明原生工具可用、审批生效或解析器已执行，宿主行为需要单独验收。

`uv run pytest tests/test_layered_skills.py` 检查 OpenCode、OpenClaw、Pi 和 DSH 的 npm 包，读取其中可达的
Skill 参考文件。安装器回归实际执行 OpenCode 参考文件复制和 WorkBuddy 占位符替换。Pi 包测试调用 SDK Skill 加载器；
OpenClaw 包测试在隔离配置中执行 `skills list --json`。
这些测试与模型路由证据分别记录。

按[工具路由验证](integration-guidance.md)导出目录，再启用可选资源读取：

```sh
uv run python scripts/evaluate_integration_guidance.py \
  --catalog /tmp/pc-guidance/dsh.json --layered-skills --env-file .env \
  --output /tmp/pc-guidance/layered.json --skill-modes unloaded unavailable
```

重复 `--catalog` 可覆盖其他宿主。评估器提供读取实际打包文本的可选工具，记录每次请求，不强制加载 Skill 或调用数据工具。
unavailable 模式不提供读取工具。此受控读取器是评估设施，不是宿主原生加载器或分发源。MiniMax 等 MCP 目录验证不能
证明各产品原生自动发现行为。路由和参数检查与绑定转录的结果审查分别验收，保留失败观察和评估限制。

明确要求读取的 `skill_search` 和 `skill_handoff` 探针，必须在业务操作前成功读取对应的 Memory 或 Handoff 流程。
只读入口、读错领域或操作后补读均不能通过。报告列出预期资源和操作前实际读取的资源，并保留更具体的失败原因。
普通请求不强制读取 Skill；Skill 不可用时仍验证可以独立使用的工具。

具体运行配置、转录和观察结果放在评估报告中，PR 记录交付状态。
