# academic-research-skills

[中文](#中文说明) | [English](#english)

Original upstream repository: [Imbad0202/academic-research-skills](https://github.com/Imbad0202/academic-research-skills)

This repository stores a customized Codex academic research and writing workflow under `skills/`.

## 中文说明

### 仓库说明

这是一个面向学术研究、论文写作、文献真实性控制、审稿、修稿和最终定稿的 Codex skills 仓库。

当前推荐主入口是：

- `academic-research-workflow`

它替代旧版：

- `my-academic-pipeline`

其他 skills 保持原名，作为子 skill 被 `academic-research-workflow` 调度：

- `deep-research`
- `my-academic-paper`
- `academic-paper-reviewer`
- `nature-academic-search`
- 其他 `nature-*` skills

### 目录结构

```text
skills/
├── academic-research-workflow/   # 新版主工作流入口
├── academic-paper-reviewer/
├── deep-research/
├── my-academic-paper/
├── nature-academic-search/       # 结构化文献检索核心依赖
└── my-academic-pipeline/         # legacy，保留兼容
```

### 安装方法

将需要的 skill 复制到本机 Codex skills 目录：

```bash
mkdir -p ~/.codex/skills
cp -R skills/academic-research-workflow ~/.codex/skills/
cp -R skills/deep-research ~/.codex/skills/
cp -R skills/my-academic-paper ~/.codex/skills/
cp -R skills/academic-paper-reviewer ~/.codex/skills/
cp -R skills/nature-academic-search ~/.codex/skills/
```

如果需要其他 Nature 系列辅助 skills，可另外安装对应扩展；本仓库至少包含新版 workflow 必需的 `nature-academic-search`。

### 新版主入口：academic-research-workflow

`academic-research-workflow` 是新版顶层论文工作流控制器。它不直接写论文，而是负责：

- 初始化 run 文件夹
- 创建 `manifest.yaml`
- 创建/编译 `workflow.yaml`
- 创建 `agent_tasks/*.yaml`
- 调度子 skills
- 强制 hard gate
- 维护状态和日志
- 在 Codex 支持 subagents 时强制使用真实多 agent

#### 两级启动方式

规划/初始化模式：

```text
启动 academic-research-workflow
```

严格全自动多 agent 模式：

```text
启动 academic-research-workflow 全自动多agent工作流
```

规划模式会创建 run folder，并停在必要的 intake/design gate。  
全自动多 agent 模式会在 proposal 被确认并编译后，按 task graph 自动执行。

#### 支持的论文类型

初始论文路线必须由用户明确选择：

- `毕业论文`
- `工科学术论文`
- `计算机会议论文`

workflow 不会静默推断论文类型。

#### 默认设置

- 目标标准：按可行的最高标准写
- 目标语言：中文
- 输出格式：TeX，然后编译 PDF
- run 文件夹：当前论文目录下的 `runs/<date_topic>/`
- 状态文件：`manifest.yaml`
- 正式任务图：`workflow.yaml`
- agent 任务单：`agent_tasks/*.yaml`
- 产物目录：`artifacts/`
- 日志目录：`logs/`

### 工作流核心机制

#### 1. Manifest 驱动

每次运行都会创建：

```text
runs/<date_topic>/
├── manifest.yaml
├── workflow.yaml
├── workflow_proposal.yaml
├── agent_tasks/
├── artifacts/
└── logs/
```

`manifest.yaml` 是唯一权威状态记录。对话上下文不是权威状态。

#### 2. Model-Planned Task Graph

完整任务图不是由 JS 写死，而是：

```text
模型生成 workflow_proposal.yaml
        ↓
用户完整审阅和修改
        ↓
JS 校验并编译
        ↓
workflow.yaml + agent_tasks/*.yaml
```

proposal 展示采用完整详细版，必须列出：

- 全部阶段
- 全部任务
- agent 分配
- skill 分配
- 串行依赖
- 并行任务组
- 输入 artifacts
- 输出 artifacts
- hard gates
- 每个 task 的 prompt
- 每个 task 的 completion criteria

#### 3. JS Runtime

`academic-research-workflow/scripts/` 提供无外部依赖的 Node.js runtime：

```text
scripts/
├── init_run.js
├── build_workflow.js
├── validate_workflow_proposal.js
├── compile_task_graph.js
├── validate_manifest.js
├── validate_workflow.js
├── validate_task_card.js
├── advance_stage.js
└── lib/workflow_runtime.js
```

这些脚本负责机械流程：

- 初始化 run
- 校验 manifest
- 校验 proposal
- 编译 task graph
- 校验 workflow
- 校验 task card
- 推进状态
- 记录 blocking gate

模型负责规划，JS 负责校验和冻结。

#### 4. Hard Gate

workflow 只在关键 gate 停下：

- `ROUTE_GATE`
- `TOPIC_CLAIM_GATE`
- `FRAMEWORK_GATE`
- `START_WRITING_GATE`
- `INTEGRITY_GATE`
- `REVIEWER_FEASIBILITY_GATE`

普通阶段完成后不会每一步都等用户确认。

#### 5. 多 agent 规则

如果 Codex 当前环境提供原生 subagent 工具，workflow 必须真实调用：

- `spawn_agent`
- `wait_agent`
- `close_agent`

不能只在 prompt 中写“使用多 agent”。  
如果环境没有 subagent，则按同一个 `workflow.yaml` 顺序执行 fallback，但仍保留 task card、hard gate、artifact 和 manifest 更新。

#### 6. 文献真实性规则

参考文献必须遵守 Verified Source Corpus 边界：

- `nature-academic-search` 负责结构化检索和元数据查找
- PubMed / CrossRef / arXiv / DOI lookup 等工具用于提高真实性
- `deep-research` 负责筛选、综合和形成 `Verified Source Corpus`
- 未验证文献只能进入 `Candidate Sources - Unverified`
- 未验证文献不能进入正文、`.bib`、最终参考文献
- 不允许从模型记忆补全或编造参考文献

### 子 skills 定位

#### deep-research

研究与文献层：

- 研究问题设计
- 文献搜索策略
- 文献筛选
- source verification
- evidence synthesis
- `Verified Source Corpus`

#### nature-academic-search

结构化文献检索/元数据后端：

- PubMed
- CrossRef
- arXiv
- DOI lookup
- citation export
- BibTeX / RIS / NBIB 等参考文献管理

#### my-academic-paper

写作层：

- 毕业论文
- 工科学术论文
- 计算机会议论文
- 框架设计
- TeX 草稿
- 修稿
- 最终 TeX/PDF

#### academic-paper-reviewer

审稿层：

- 多 reviewer 模拟
- Devil's Advocate
- editorial decision
- revision roadmap
- re-review

### 本次重要更新

本次更新的重点是把旧版 `my-academic-pipeline` 升级为新的 `academic-research-workflow`：

- 新增 `academic-research-workflow` skill
- 明确它替代旧版 `my-academic-pipeline`
- 加入 `manifest.yaml` 状态管理
- 加入 `workflow.yaml` 正式任务图
- 加入 `agent_tasks/*.yaml` 标准任务单
- 加入 `workflow_proposal.yaml`
- 引入“模型规划 → 用户审阅 → JS 编译冻结”的任务图流程
- 新增 JS runtime
- 新增 proposal authoring guide
- 新增 proposal review checklist
- 强化多 agent 调度规则
- 强化文献真实性边界
- 强化 hard gate 机制
- 默认中文、TeX、PDF 输出
- 最终 PDF 不再额外确认，final integrity PASS 后自动生成

### 推荐使用方式

只查文献或做综述：

```text
使用 deep-research 做这个主题的文献综述
```

只写论文：

```text
这是工科学术论文，请使用 my-academic-paper 先设计框架
```

审稿：

```text
使用 academic-paper-reviewer 审这篇论文
```

完整流程：

```text
启动 academic-research-workflow
```

完整流程并启用严格多 agent：

```text
启动 academic-research-workflow 全自动多agent工作流
```

---

## English

### Repository Overview

This repository provides customized Codex skills for academic research, writing, reference verification, review, revision, and finalization.

The recommended top-level entry point is:

- `academic-research-workflow`

It replaces the legacy:

- `my-academic-pipeline`

Other skills remain as child skills:

- `deep-research`
- `my-academic-paper`
- `academic-paper-reviewer`
- `nature-academic-search`
- other `nature-*` skills

### Installation

Copy the required skills into your local Codex skills directory:

```bash
mkdir -p ~/.codex/skills
cp -R skills/academic-research-workflow ~/.codex/skills/
cp -R skills/deep-research ~/.codex/skills/
cp -R skills/my-academic-paper ~/.codex/skills/
cp -R skills/academic-paper-reviewer ~/.codex/skills/
cp -R skills/nature-academic-search ~/.codex/skills/
```

### academic-research-workflow

`academic-research-workflow` is the new top-level workflow controller. It coordinates the full academic pipeline without doing substantive research or writing by itself.

It manages:

- run folder initialization
- `manifest.yaml`
- `workflow_proposal.yaml`
- `workflow.yaml`
- `agent_tasks/*.yaml`
- child skill dispatch
- hard gates
- logs and artifacts
- true Codex subagent execution when available

### Launch Commands

Planning / initialization:

```text
启动 academic-research-workflow
```

Strict fully automatic multi-agent workflow:

```text
启动 academic-research-workflow 全自动多agent工作流
```

### Core Design

The full task graph is not hard-coded in JavaScript.

Instead:

```text
Model drafts workflow_proposal.yaml
        ↓
User reviews the complete detailed proposal
        ↓
JS validates and compiles it
        ↓
workflow.yaml + agent_tasks/*.yaml
```

The user receives a complete detailed proposal, including stages, tasks, agents, skills, dependencies, parallel groups, inputs, outputs, hard gates, prompts, and completion criteria.

### JS Runtime

The bundled no-dependency Node.js runtime includes:

```text
scripts/init_run.js
scripts/build_workflow.js
scripts/validate_workflow_proposal.js
scripts/compile_task_graph.js
scripts/validate_manifest.js
scripts/validate_workflow.js
scripts/validate_task_card.js
scripts/advance_stage.js
scripts/lib/workflow_runtime.js
```

The model plans. JS validates and freezes.

### Reference Integrity

References must pass the Verified Source Corpus boundary:

- structured discovery through `nature-academic-search`
- metadata checks through PubMed / CrossRef / arXiv / DOI lookup
- synthesis and filtering through `deep-research`
- unverified sources remain in `Candidate Sources - Unverified`
- unverified sources cannot enter manuscript citations, `.bib`, or final references
- no reference may be completed from model memory

### What Changed In This Update

- Added `academic-research-workflow`
- Added `nature-academic-search` as the structured literature-search dependency
- Marked `my-academic-pipeline` as legacy
- Added manifest-driven workflow state
- Added proposal-driven task graph planning
- Added JS runtime for validation and compilation
- Added standardized task cards
- Added hard gates
- Added strict multi-agent invocation rules
- Strengthened reference authenticity rules
- Added full-detail proposal review workflow
- Defaulted final output to TeX and compiled PDF
