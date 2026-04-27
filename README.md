# academic-research-skills

[中文](#中文说明) | [English](#english)

Original upstream repository: [Imbad0202/academic-research-skills](https://github.com/Imbad0202/academic-research-skills)

This repository stores four Codex skills under the `skills/` directory:

- `deep-research`
- `academic-paper-reviewer`
- `my-academic-paper`
- `my-academic-pipeline`

---

## 中文说明

### 仓库说明

这个仓库用于保存一套面向学术研究与论文写作的 Codex skills。  
其中：

- `deep-research`：负责研究、文献检索、事实核查与综述
- `academic-paper-reviewer`：负责审稿与复审
- `my-academic-paper`：负责按自定义规则写论文
- `my-academic-pipeline`：负责把研究、写作、审稿、修稿串成完整流程

其中 `my-academic-paper` 和 `my-academic-pipeline` 是在原版能力基础上做的定制化版本；`deep-research` 和 `academic-paper-reviewer` 目前保留原版主体能力，用作这套流程中的研究与审稿模块。

---

### 目录结构

```text
skills/
├── academic-paper-reviewer/
├── deep-research/
├── my-academic-paper/
└── my-academic-pipeline/
```

---

### 1. deep-research

#### 功能

`deep-research` 是研究入口 skill，主要用于：

- 研究选题澄清
- 研究问题设计
- 文献检索与筛选
- 文献综述与系统性回顾
- 事实核查
- 方法设计
- 研究报告输出

它更像“研究助理团队”，而不是论文写作器。

#### 怎么使用

适合在你还没有成稿、还在找方向或补文献时使用。常见输入方式：

```text
Research the impact of AI on higher education quality assurance
```

```text
Guide my research on building facade semantic segmentation
```

```text
帮我做建筑立面语义分割的文献综述
```

#### 在这套仓库里的定位

在这套定制工作流里，`deep-research` 还承担一个额外职责：

- 当 `my-academic-paper` 需要“寻找参考文献、补充参考文献、核查参考文献真实性”时，会把检索任务上交给 `deep-research`

也就是说：

- `deep-research` 负责找文献、验文献
- `my-academic-paper` 负责把文献放进论文里

#### 相对原版做了什么修改

- 当前仓库中保留的是原版主体能力
- 没有重写其内部研究逻辑
- 主要修改发生在与 `my-academic-paper` / `my-academic-pipeline` 的协同调用关系上

---

### 2. academic-paper-reviewer

#### 功能

`academic-paper-reviewer` 是审稿 skill，主要用于：

- 投稿前模拟审稿
- 方法部分专项检查
- 修稿后的复审
- 给出结构化修改建议
- 生成编辑意见与 revision roadmap

它会模拟多位不同视角的审稿人，而不是只给单一评价。

#### 怎么使用

当你已经有初稿或修订稿时使用。常见输入方式：

```text
Review this paper
```

```text
Help me check the methodology of this paper
```

```text
Re-review this revised manuscript
```

#### 在这套仓库里的定位

在这套仓库中，它是固定的审稿模块，通常由以下两种方式触发：

- 单独调用，直接审稿
- 由 `my-academic-pipeline` 在 REVIEW / RE-REVIEW 阶段调用

#### 相对原版做了什么修改

- 当前仓库中保留的是原版主体能力
- 没有重写其核心审稿结构
- 它主要作为定制工作流中的标准审稿器使用

---

### 3. my-academic-paper

#### 功能

`my-academic-paper` 是本仓库最核心的定制写作 skill。  
它负责根据用户明确声明的论文类型，按不同路线组织写作。

当前支持 3 条路线：

- `毕业论文`
- `工科学术论文`
- `计算机会议论文`

#### 怎么使用

使用时必须先明确说出论文类型，skill 不能自行判断。  
推荐输入方式：

```text
这是工科学术论文。我的研究是……请先帮我整理框架
```

```text
这是毕业论文。我的题目是……
```

然后它会按固定流程工作：

1. 读取材料
2. 复述你的工作
3. 给出整体写作框架
4. 等你确认
5. 只有你明确说 `开始写作`，才进入正文写作

#### 工科学术论文路线的特点

内部写作顺序固定为：

1. Method
2. Results
3. Discussion
4. Conclusion
5. Future Work
6. Introduction

但最终成稿顺序会自动整理成正规论文排布：

1. Introduction
2. Method
3. Results
4. Discussion
5. Conclusion
6. Future Work

并且已经加入了你定制的规则，包括：

- Method 要批判其他方法局限
- 参数、尺度、权重要有依据
- Results 必须定量 + 定性，且每个结果都要分析
- Discussion 不能引入新结果
- Conclusion 使用固定结论模板
- Future Work 要先写研究不足，再接展望
- Introduction 的背景段要落回本研究，并遵守引用规则

#### 毕业论文路线的特点

毕业论文路线采用“按章写作”的方式：

- 每章包含：`章前言`、`正文`、`章小结`
- 实际写作顺序是：`正文 -> 章小结 -> 章前言`
- 正文内部由多个小节组成
- 每个小节遵循：`节前言 -> 方法 -> 结果 -> 讨论`
- 所有常规章写完后，再写结论章，最后写引言

#### 相对原版做了什么修改

`my-academic-paper` 是在原版 `academic-paper` 基础上定制出来的，主要修改包括：

- 删除“自动推断论文类型”的空间，改为必须由用户明确声明：
  - `毕业论文`
  - `工科学术论文`
  - `计算机会议论文`
- 增加“写作前审批门”：
  - 先复述工作
  - 先给框架
  - 必须等待 `开始写作`
- 将工科学术论文与毕业论文的规则拆成独立目录维护：
  - `references/engineering-paper/`
  - `references/graduate-thesis/`
- 增加了针对标题、参考文献、排版、图表、公式、引用位置、用词的全局约束
- 明确把参考文献检索任务交给 `deep-research`

---

### 4. my-academic-pipeline

#### 功能

`my-academic-pipeline` 是整套流程的总调度 skill。  
它负责把研究、写作、审稿、修稿、复审、定稿串起来。

核心流程如下：

1. Research
2. Write
3. Integrity Check
4. Review
5. Revise
6. Re-review
7. Re-revise
8. Final Integrity Check
9. Finalize

#### 怎么使用

适合你想从研究一直走到成稿，而不想手动切换 skill 时使用。常见输入方式：

```text
I want a full academic pipeline for my topic
```

```text
Help me go from research to paper
```

```text
我已经有初稿了，帮我继续后面的审稿和修稿流程
```

#### 在这套仓库里的调用关系

它本身不负责真正写内容，而是负责调度：

- 研究阶段调用 `deep-research`
- 写作阶段调用 `my-academic-paper`
- 审稿阶段调用 `academic-paper-reviewer`
- 修稿阶段再次调用 `my-academic-paper`

#### 相对原版做了什么修改

`my-academic-pipeline` 是在原版 `academic-pipeline` 基础上定制出来的，主要修改包括：

- 保留原有“研究 -> 写作 -> 审稿 -> 修稿”的总结构
- 将原版写作阶段替换为 `my-academic-paper`
- 因此整个 pipeline 会自动继承你的：
  - 论文类型声明规则
  - 框架先确认规则
  - `开始写作` 启动规则
  - 工科 / 毕业论文的专用写作规范

---

### 推荐使用方式

如果你只想补文献或查证：

- 用 `deep-research`

如果你已经准备开始写：

- 用 `my-academic-paper`

如果你已经有稿子，想审稿：

- 用 `academic-paper-reviewer`

如果你想从研究一直走到投稿前完整闭环：

- 用 `my-academic-pipeline`

---

## English

### Repository Overview

This repository stores a Codex-based academic workflow composed of four skills:

- `deep-research`
- `academic-paper-reviewer`
- `my-academic-paper`
- `my-academic-pipeline`

Among them:

- `deep-research` handles literature search, research design, synthesis, and fact-checking
- `academic-paper-reviewer` handles peer review and re-review
- `my-academic-paper` is the customized writing skill
- `my-academic-pipeline` is the end-to-end orchestrator

`my-academic-paper` and `my-academic-pipeline` are customized derivatives of the upstream project. `deep-research` and `academic-paper-reviewer` are currently preserved as the original base modules and used as research/review components inside the customized workflow.

---

### Directory Layout

```text
skills/
├── academic-paper-reviewer/
├── deep-research/
├── my-academic-paper/
└── my-academic-pipeline/
```

---

### 1. deep-research

#### What it does

`deep-research` is the research-entry skill. It is used for:

- topic clarification
- research question formulation
- literature search and screening
- literature review and systematic review
- fact-checking
- methodology design
- academic research report generation

It acts as a research assistant team rather than a paper drafting tool.

#### How to use it

Use it when you are still exploring the topic, building a literature base, or checking claims. Example prompts:

```text
Research the impact of AI on higher education quality assurance
```

```text
Guide my research on building facade semantic segmentation
```

```text
Help me build a literature review on facade parsing
```

#### How it is used in this repository

Inside this customized workflow, `deep-research` also serves as the upstream reference-discovery layer:

- when `my-academic-paper` needs to search for references
- when citations need to be expanded
- when a citation needs to be verified as real

So the division of labor is:

- `deep-research` finds and verifies sources
- `my-academic-paper` integrates those sources into the manuscript

#### What was changed from the original

- The core research logic is preserved from the upstream version
- No major rewrite was applied to its internal workflow
- The main change is how it is coordinated with `my-academic-paper` and `my-academic-pipeline`

---

### 2. academic-paper-reviewer

#### What it does

`academic-paper-reviewer` is the review skill. It is used for:

- pre-submission peer review
- methodology-focused review
- re-review after revision
- structured editorial feedback
- revision roadmap generation

It simulates multiple reviewers with different perspectives instead of producing a single generic judgment.

#### How to use it

Use it when you already have a draft or a revised manuscript. Example prompts:

```text
Review this paper
```

```text
Help me check the methodology of this paper
```

```text
Re-review this revised manuscript
```

#### How it is used in this repository

In this repository, it is the fixed review module and is usually used in two ways:

- directly, as a standalone review tool
- indirectly, when `my-academic-pipeline` reaches the REVIEW or RE-REVIEW stages

#### What was changed from the original

- The core review structure is preserved from the upstream version
- No major rewrite was applied to its main review logic
- It mainly serves as the standard reviewer inside the customized workflow

---

### 3. my-academic-paper

#### What it does

`my-academic-paper` is the central customized writing skill in this repository.  
It organizes drafting according to a user-declared paper route.

It currently supports three explicit routes:

- `毕业论文`
- `工科学术论文`
- `计算机会议论文`

#### How to use it

You must explicitly state the paper type. The skill is not allowed to infer it automatically. Recommended examples:

```text
这是工科学术论文。我的研究是……请先帮我整理框架
```

```text
这是毕业论文。我的题目是……
```

Then the workflow is:

1. read the materials
2. restate the user's work
3. propose the overall writing framework
4. wait for confirmation
5. only begin drafting after the exact command `开始写作`

#### Engineering-paper route

Its internal drafting order is fixed as:

1. Method
2. Results
3. Discussion
4. Conclusion
5. Future Work
6. Introduction

But the final assembled paper is reordered into standard presentation order:

1. Introduction
2. Method
3. Results
4. Discussion
5. Conclusion
6. Future Work

This route already includes custom constraints such as:

- Method must critique the limitations of alternative methods
- parameters, scales, and weights must be justified
- Results must be quantitative plus concise qualitative interpretation
- every result must be analyzed
- Discussion must not introduce new results
- Conclusion follows a fixed engineering-paper summary structure
- Future Work must start from limitations before moving to outlook
- Introduction background paragraphs must connect back to the present study

#### Graduate-thesis route

The graduate-thesis route uses chapter-based writing:

- each chapter contains `章前言`, `正文`, and `章小结`
- actual writing order is `正文 -> 章小结 -> 章前言`
- the body can contain multiple subsections
- each subsection follows `节前言 -> Method -> Results -> Discussion`
- after all regular chapters are done, the conclusion chapter is written, and the introduction is written last

#### What was changed from the original

`my-academic-paper` is a customized derivative of the original `academic-paper` skill. Major changes include:

- removal of route inference; the user must explicitly declare:
  - `毕业论文`
  - `工科学术论文`
  - `计算机会议论文`
- addition of a pre-writing approval gate:
  - restate the work first
  - propose the framework first
  - wait for `开始写作`
- engineering-paper and graduate-thesis rules were split into maintainable directories:
  - `references/engineering-paper/`
  - `references/graduate-thesis/`
- global constraints were added for title style, references, formatting, figures, formulas, citation placement, and wording
- reference discovery was explicitly handed off to `deep-research`

---

### 4. my-academic-pipeline

#### What it does

`my-academic-pipeline` is the top-level workflow orchestrator.  
It connects research, writing, review, revision, re-review, and finalization.

Its core flow is:

1. Research
2. Write
3. Integrity Check
4. Review
5. Revise
6. Re-review
7. Re-revise
8. Final Integrity Check
9. Finalize

#### How to use it

Use it when you want the full research-to-paper workflow without manually switching skills. Example prompts:

```text
I want a full academic pipeline for my topic
```

```text
Help me go from research to paper
```

```text
I already have a draft. Help me continue with review and revision.
```

#### Internal dispatch logic

This skill does not do the substantive research or writing itself. It dispatches other skills:

- `deep-research` for the research stage
- `my-academic-paper` for the writing stage
- `academic-paper-reviewer` for the review stage
- `my-academic-paper` again for revision and final writing stages

#### What was changed from the original

`my-academic-pipeline` is a customized derivative of the original `academic-pipeline`. Major changes include:

- preserving the original high-level research -> write -> review -> revise structure
- replacing the original writing stage with `my-academic-paper`
- therefore inheriting all custom writing rules automatically, including:
  - explicit route declaration
  - framework-first approval
  - `开始写作` as the drafting gate
  - engineering-paper and graduate-thesis specific writing constraints

---

### Recommended Usage

If you only need literature search or fact-checking:

- use `deep-research`

If you are ready to draft a paper:

- use `my-academic-paper`

If you already have a draft and want review:

- use `academic-paper-reviewer`

If you want a full research-to-paper pipeline:

- use `my-academic-pipeline`
