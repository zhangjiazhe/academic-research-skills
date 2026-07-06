---
name: academic-research-workflow
description: "Customized full academic research pipeline from research to custom writing, integrity check, review, revise, re-review, re-revise, final integrity check, and finalize. Coordinates deep-research, my-academic-paper, and academic-paper-reviewer so the original workflow is preserved while the writing stages use the user's thesis/engineering/conference routing rules."
metadata:
  version: "3.6.5"
  last_updated: "2026-05-29"
  depends_on: "deep-research, my-academic-paper, academic-paper-reviewer"
  status: active
  data_access_level: verified_only
  task_type: open-ended
  related_skills:
    - deep-research
    - my-academic-paper
    - academic-paper-reviewer
---

# Academic Research Workflow v3.6.5 — Customized Academic Research Workflow Orchestrator

A lightweight orchestrator that manages the complete academic pipeline from research exploration to final manuscript. It does not perform substantive work — it only detects stages, recommends modes, dispatches skills, manages transitions, and tracks state.

## Workflow Identity

`academic-research-workflow` is the top-level workflow controller. It replaces the former `my-academic-pipeline` role. Other academic skills keep their original names and are called as child skills:

- `deep-research` — research question development, tool-backed reference discovery, source verification, and synthesis
- `my-academic-paper` — route-specific paper planning, drafting, revision, and formatting
- `academic-paper-reviewer` — multi-perspective review and re-review
- `nature-academic-search` — structured reference search / metadata lookup backend
- Other `nature-*` skills — optional specialized support for citation export, figures, data availability, polishing, reading, response letters, and PPT

The workflow must be portable across environments: when native subagents are available, it uses them; when subagents are unavailable, it executes the same task graph sequentially while preserving all gates, artifacts, manifest updates, and verification rules.

## Initial Defaults

Unless the user explicitly overrides them, use the following defaults:

| Field | Default |
|---|---|
| Paper route | Must be one of `毕业论文`, `工科学术论文`, `计算机会议论文`; default assumption is not applied silently, ask the user to choose |
| Target standard | Highest feasible standard for the chosen route; do not ask for journal/conference tier during the first version |
| Target language | Chinese |
| Output format | TeX first, then compile to PDF |
| Run folder location | Current paper/workspace directory |
| Run folder name | Human-readable short name based on date + topic, e.g. `runs/2026-05-27_ai-education-quality-assurance/` |
| Manifest file | `<run_folder>/manifest.yaml` |
| Workflow definition file | `<run_folder>/workflow.yaml` |
| Agent task cards | `<run_folder>/agent_tasks/` |
| Artifacts | `<run_folder>/artifacts/` |
| Logs | `<run_folder>/logs/` |

## Initial Intake Questions

At workflow start, ask only the minimum questions needed to create the first manifest:

1. Which paper route applies: `毕业论文`, `工科学术论文`, or `计算机会议论文`?
2. Do you already have data, experiments, code, figures, tables, or previous notes? If yes, where are they?

Do not ask the user to provide the final topic or core claim as a finished statement. The topic, research angle, and core claim are developed after inspecting the user's materials, experiment results, code, and available evidence, then discussing them with the user.

## Pipeline Run Manifest Contract

Every workflow run must create and maintain a dedicated run folder in the current paper/workspace directory. The manifest is the canonical state record; conversation memory is not authoritative.

For deterministic workflow operations, prefer the bundled JS runtime scripts instead of hand-writing state files:

| Operation | Script |
|---|---|
| Create run folder, `manifest.yaml`, `workflow.yaml`, seed task cards | `scripts/init_run.js` |
| Rebuild `workflow.yaml` and seed task cards | `scripts/build_workflow.js` |
| Validate model-planned workflow proposal | `scripts/validate_workflow_proposal.js` |
| Compile confirmed proposal into `workflow.yaml` + task cards | `scripts/compile_task_graph.js` |
| Validate manifest shape and run folder paths | `scripts/validate_manifest.js` |
| Validate workflow graph shape | `scripts/validate_workflow.js` |
| Validate one task card | `scripts/validate_task_card.js` |
| Resolve the next runnable task(s) from manifest-first state | `scripts/next_action.js` |
| Advance status, current stage, next action, or a blocking gate | `scripts/advance_stage.js` |

The JS runtime is the guardrail for repeatable state operations. The Markdown instructions define policy; the scripts enforce the mechanical parts.

## Model-Planned Task Graph Contract

The full task graph must not be hard-coded by JS. It is created in three steps:

1. **Model planning**: after material inspection and topic/core-claim discussion, the orchestrator drafts `workflow_proposal.yaml`.
2. **Human review gate**: the proposal is shown to the user in complete detail for discussion and revision. The user may change tasks, agents, skills, dependencies, parallelization, hard gates, prompts, and completion criteria.
3. **JS compilation**: after approval, run `scripts/validate_workflow_proposal.js`, then `scripts/compile_task_graph.js` to freeze the proposal into `workflow.yaml` and `agent_tasks/*.yaml`.

JS may validate and compile the confirmed plan; JS must not invent the complete paper workflow on its own.

Before drafting a proposal, read `references/workflow_proposal_authoring_guide.md`. Before compiling, apply `references/workflow_proposal_review_checklist.md`.

Proposal presentation preference: full detailed version. The user must be able to audit every stage, task, agent assignment, child skill, dependency, parallel group, hard gate, prompt, input artifact, output artifact, and completion criterion before approval.

Minimum manifest shape:

```yaml
pipeline_run_id: "<date_topic_slug>"
workflow_name: "academic-research-workflow"
status: "planning"
current_stage: "stage_0_intake"

execution_control:
  execution_mode: "planning"       # planning / strict_multi_agent / sequential_fallback
  auto_continue: false             # true in strict_multi_agent unless explicitly paused
  canonical_state_file: "manifest.yaml"
  resume_policy: "manifest_first"
  stop_conditions:
    - active_gate
    - blocking_issue
    - paused_completed_or_aborted
  user_design_gates_waived: []

paper_profile:
  route: null                  # 毕业论文 / 工科学术论文 / 计算机会议论文
  target_standard: "highest_feasible"
  target_language: "中文"
  output_format: "tex_pdf"
  has_data_or_experiments: null
  data_locations: []
  code_locations: []
  experiment_locations: []
  topic: null                  # derived after inspecting materials and discussion
  core_claim: null             # derived after inspecting materials and discussion
  contribution_type: null

workflow_files:
  manifest: "manifest.yaml"
  workflow_definition: "workflow.yaml"
  agent_tasks_dir: "agent_tasks/"
  artifacts_dir: "artifacts/"
  logs_dir: "logs/"

stage_status:
  stage_0_intake: "pending"
  stage_1_material_inspection: "pending"
  stage_2_topic_and_claim_dialogue: "pending"
  stage_3_workflow_definition: "pending"
  stage_4_research: "pending"
  stage_5_writing: "pending"
  stage_6_integrity: "pending"
  stage_7_review: "pending"
  stage_8_revision: "pending"
  stage_9_final_integrity: "pending"
  stage_10_finalize: "pending"

artifacts:
  workflow_proposal: null
  verified_source_corpus: null
  candidate_sources_unverified: null
  workflow_definition: null
  paper_outline: null
  draft_tex: null
  draft_pdf: null
  integrity_report: null
  review_report: null
  revision_report: null
  final_tex: null
  final_pdf: null

blocking_issues: []
next_action: "complete initial intake"
```

After every task finishes, update `manifest.yaml` before closing the agent/task. Each update must record the completed task, output artifact path, blocking issues, and next executable task. Use `scripts/next_action.js` before deciding whether to ask the user, continue, or dispatch subagents. Keep detailed execution traces in `logs/`; do not let `manifest.yaml` grow into a full transcript.

Detailed schemas:

- `references/pipeline_run_manifest.md`
- `references/workflow_proposal_schema.md`
- `references/workflow_proposal_authoring_guide.md`
- `references/workflow_proposal_review_checklist.md`
- `references/workflow_definition_schema.md`
- `references/agent_task_card_schema.md`

## Codex Runtime Contract

This skill has two launch levels.

**Planning / initialization launch:**

- `启动 academic-research-workflow`
- `初始化 academic-research-workflow`

This creates or updates the run folder, `manifest.yaml`, `workflow.yaml`, and standardized task cards, then stops at any required design/intake gate.

The orchestrator should call:

```bash
node ~/.codex/skills/academic-research-workflow/scripts/init_run.js --workspace <current-paper-dir> --topic <readable-slug> --mode planning
```

**Strict fully automatic multi-agent launch:**

- `启动 academic-research-workflow 全自动多agent工作流`
- `启动论文全流程多agent模式`
- `使用多agent执行 academic-research-workflow`
- Any equivalent instruction that explicitly authorizes `多agent`, `subagents`, `parallel agents`, or `并行 agent`

When strict multi-agent launch is activated:

1. The main Codex assistant acts as the pipeline orchestrator only. It must not collapse the workflow into one long monologue or simulate all agents internally.
2. The orchestrator must initialize or resume state through the JS runtime scripts before dispatching substantive work.
3. If the current Codex environment exposes native subagent tooling, the orchestrator must invoke it for every eligible parallel task. In Codex this means using the native `spawn_agent` / `wait_agent` / `close_agent` tool sequence, not merely writing "run multiple agents" in a prompt.
4. Every spawned agent must receive one standardized task card as its authority, must return a compact artifact, and must be closed after its task is recorded in `manifest.yaml`.
5. The orchestrator must keep stage state, required inputs, produced artifacts, and blocking gates explicit at every transition.
6. If the current environment truly cannot spawn subagents, the orchestrator must state that limitation and run the same `workflow.yaml` sequentially while preserving every task card, blocking gate, verification rule, artifact boundary, and manifest update.
7. "Fully automatic" never means skipping hard gates, integrity checks, route declaration, the verified-corpus boundary, or the `开始写作` command. It means the orchestrator proactively advances through non-blocking work after required gates are satisfied.
8. The orchestrator must persist strict launch intent in `manifest.yaml -> execution_control` with `execution_mode: strict_multi_agent` and `auto_continue: true`. Conversation memory alone is not sufficient authorization.
9. On every resume/status turn, run `scripts/next_action.js <run_dir>` first. If it reports no active gate, no blocking issue, and one or more runnable tasks, dispatch them immediately instead of asking for confirmation.

The orchestrator should call:

```bash
node ~/.codex/skills/academic-research-workflow/scripts/init_run.js --workspace <current-paper-dir> --topic <readable-slug> --mode strict_multi_agent
```

### Manifest-First Auto-Continue Rule

`manifest.yaml` is the canonical state. `workflow.yaml` and `agent_tasks/*.yaml` define the graph, but their local `status: pending` values must not override `manifest.yaml.completed_tasks`, `manifest.yaml.stage_status`, `manifest.yaml.active_gates`, or `manifest.yaml.next_action`.

At the start of any turn that mentions this workflow, including "status", "continue", "为什么停下", or any unrelated follow-up while the pipeline is still running, the orchestrator must:

```bash
node ~/.codex/skills/academic-research-workflow/scripts/validate_manifest.js <run_dir>/manifest.yaml
node ~/.codex/skills/academic-research-workflow/scripts/validate_workflow.js <run_dir>/workflow.yaml
node ~/.codex/skills/academic-research-workflow/scripts/next_action.js <run_dir>
```

If `next_action.js` returns runnable tasks and `auto_continue: true`, the orchestrator must dispatch those tasks. A progress dashboard is informational only; it is not an implicit review gate.

Stop only when one of these is true:

- `active_gates` contains an unresolved gate.
- `blocking_issues` is non-empty.
- `status` is `paused`, `completed`, or `aborted`.
- The user explicitly asks to pause or stop.

### Gate Persistence Rule

Design gates and blocking gates must be separated:

- Design gates: `ROUTE_GATE`, `TOPIC_CLAIM_GATE`, `FRAMEWORK_GATE`, and `START_WRITING_GATE`. These can be resolved by explicit user instructions already present in the run log and should then be recorded in `execution_control.user_design_gates_waived` or the relevant stage log.
- Blocking gates: `INTEGRITY_GATE` and `REVIEWER_FEASIBILITY_GATE`. These are never skipped by "fully automatic" mode. They trigger only after an actual verification/review failure, not before running the verification/review stage.

When the user has already authorized continuing without review gates, do not reinterpret a later progress boundary as a new design gate. Continue until a blocking gate appears.

### Codex Native Multi-Agent Invocation Rule

When eligible parallel tasks exist and Codex native subagents are available, the orchestrator must use the native subagent lifecycle:

1. Create task cards under `agent_tasks/`.
2. Start one Codex subagent per independent task with `spawn_agent`.
3. Pass only the task card plus the minimum referenced artifacts to the subagent.
4. Continue non-overlapping orchestration work while subagents run.
5. Use `wait_agent` only when the next transition depends on returned artifacts.
6. Validate each returned artifact against the task card's `completion_criteria`.
7. Update `manifest.yaml` through `scripts/advance_stage.js` and write the agent log under `logs/`.
8. Close the subagent with `close_agent` after the task is recorded.

If the orchestrator sees parallelizable tasks but does not spawn agents in an environment where `spawn_agent` is available, that is a workflow violation.

### Context Control Rule

To prevent context overflow, each subagent receives only the minimum artifacts required for its task and must return a compact structured artifact. The orchestrator keeps canonical state in handoff artifacts, not in conversational memory alone.

### Verified Corpus Boundary

`deep-research` is the authoritative literature-discovery layer. Stage 2 writing may cite only sources that are present in one of the following:

- a `Verified Source Corpus` produced by `deep-research`
- user-provided sources that have passed verification
- a later integrity-correction artifact that replaces or repairs a source with verification evidence

No writing, review, formatting, or citation agent may invent, complete, or "repair" a reference from model memory. Unverified references may appear only in a `Candidate Sources - Unverified` list and must not enter the paper body, in-text citations, `.bib` file, or final reference list.

### Serial vs Parallel Execution Contract

The following dependencies are hard serial barriers:

1. Route declaration and user goal intake must complete before any writing or research dispatch.
2. Research question, scope, and search strategy must be fixed before source collection.
3. Source collection must complete before source verification.
4. Source verification must complete before sources enter the `Verified Source Corpus`.
5. The `Verified Source Corpus` must exist before citation-heavy writing begins.
6. Paper framework approval and the exact command `开始写作` must occur before body drafting.
7. Stage 2 must complete before Stage 2.5 integrity verification.
8. Stage 2.5 must pass before Stage 3 review.
9. Stage 3 review must complete before Stage 4 revision.
10. Stage 4/4' revision must complete before Stage 4.5 final integrity verification.
11. Stage 4.5 must pass before Stage 5 final formatting.

The following work may be delegated in parallel after its serial prerequisites are satisfied:

- Literature search across independent databases, keyword families, or disciplinary subtopics
- DOI / URL / publisher-page verification for separate source batches
- Source quality grading, theme tagging, and literature matrix construction after source existence is verified
- Argument blueprint construction and visualization planning after the outline is approved
- Abstract drafting and citation-format compliance after the main draft exists
- Independent reviewer personas during Stage 3 and Stage 3'
- Post-revision checks for citation consistency, data consistency, format conformance, and response-letter traceability

**v3.6.3 (opt-in legacy):** Set `ARS_PASSPORT_RESET=1` to promote major progress boundaries or hard gates to context-reset boundaries. Use `resume_from_passport=<hash>` in a fresh session to continue from the recorded stage. See [`references/passport_as_reset_boundary.md`](references/passport_as_reset_boundary.md).

**v2.0 Core Improvements**:
1. **Manifest-driven hard gates** — Each task/stage completion updates `manifest.yaml`; the workflow continues automatically unless a design or blocking gate is triggered
2. **Academic integrity verification** — After paper completion and before review submission, 100% reference and data verification must pass
3. **Two-stage review** — First full review + post-revision focused verification review
4. **Final integrity check** — After revision completion, re-verify all citations and data are 100% correct
5. **Reproducible** — Standardized workflow producing consistent quality assurance each time
6. **Process documentation** — After pipeline completion, automatically generates a "Paper Creation Process Record" PDF documenting the human-AI collaboration history

## Quick Start

**Full workflow (from scratch):**
```
I want to write a research paper on the impact of AI on higher education quality assurance
```
--> academic-research-workflow launches, starting from Stage 1 (RESEARCH)

**Mid-entry (existing paper):**
```
I already have a paper, help me review it
```
--> academic-research-workflow detects mid-entry, starting from Stage 2.5 (INTEGRITY)

**Revision mode (received reviewer feedback):**
```
I received reviewer comments, help me revise
```
--> academic-research-workflow detects, starting from Stage 4 (REVISE)

**Resume from passport (cross-session context reset, opt-in):**
```
resume_from_passport=<hash> [stage=<n>] [mode=<m>]
```
--> Loads the Material Passport (Schema 9), locates the `kind: boundary` entry matching `<hash>`, and confirms it has no later `kind: resume` entry consuming it. If `pending_decision` is set, the decision prompt fires first to capture the user's branch choice for the audit ledger; the prompt is never skipped, even when the user supplies `stage=`. After the prompt (or immediately if no `pending_decision`), the next stage is determined by: (a) `stage=<n>` CLI override if provided, else (b) the matched option's `next_stage`, else (c) the `next` field recorded in the boundary entry. CLI `stage=`/`mode=` overrides win over option routing.
- **Gate (emit)**: `ARS_PASSPORT_RESET=1` must be set in the emitting session. Without the flag, no `kind: boundary` entries are written and there is nothing to resume from.
- **Gate (resume)**: No flag required. Any session can invoke `resume_from_passport=<hash>` against a passport that carries a valid boundary entry matching the hash.
- **Intent**: Invoke in a *fresh* Claude Code session. Resuming within the same session that emitted the boundary provides no token savings and may drop still-live in-session context.
- **Stage**: Any. Resumes at whatever stage the routing rules above determine.
- **Reference**: [`references/passport_as_reset_boundary.md`](references/passport_as_reset_boundary.md) — see §"`resume_from_passport` mode contract".

**Execution flow:**
1. Detect the user's current stage and available materials
2. Recommend the optimal mode for each stage
3. Dispatch the corresponding skill for each stage
4. **After each stage completion, update the manifest and continue automatically unless a hard gate is triggered**
5. Track progress throughout; Pipeline Status Dashboard available at any time

---

## Trigger Conditions

### Trigger Keywords

**English**: academic pipeline, research to paper, full paper workflow, paper pipeline, end-to-end paper, research-to-publication, complete paper workflow

### Non-Trigger Scenarios

| Scenario | Skill to Use |
|----------|-------------|
| Only need to search materials or do a literature review | `deep-research` |
| Only need to write a paper (no research phase needed) | `my-academic-paper` |
| Only need to review a paper | `academic-paper-reviewer` |
| Only need to check citation format | `my-academic-paper` (citation-check mode) |
| Only need to convert paper format | `my-academic-paper` (format-convert mode) |

### Trigger Exclusions

- If the user only needs a single function (just search materials, just check citations), no pipeline is needed — directly trigger the corresponding skill
- If the user is already using a specific mode of a skill, respect that entry point; the pipeline is opt-in
- The pipeline is optional, not mandatory

---

## Pipeline Stages (10 Stages)

| Stage | Name | Skill / Agent Called | Available Modes | Deliverables |
|-------|------|---------------------|----------------|-------------|
| 1 | RESEARCH | `deep-research` | socratic, full, quick | RQ Brief, Methodology, Verified Source Corpus, Candidate Sources - Unverified, Synthesis |
| 2 | WRITE | `my-academic-paper` | plan, full | Paper Draft |
| **2.5** | **INTEGRITY** | **`integrity_verification_agent`** | **pre-review** | **Integrity verification report + corrected paper** |
| 3 | REVIEW | `academic-paper-reviewer` | full (incl. Devil's Advocate) | 5 review reports + Editorial Decision + Revision Roadmap |
| 4 | REVISE | `my-academic-paper` | revision | Revised Draft, Response to Reviewers |
| **3'** | **RE-REVIEW** | **`academic-paper-reviewer`** | **re-review** | **Verification review report: revision response checklist + residual issues** |
| **4'** | **RE-REVISE** | **`my-academic-paper`** | **revision** | **Second revised draft (if needed)** |
| **4.5** | **FINAL INTEGRITY** | **`integrity_verification_agent`** | **final-check** | **Final verification report (must achieve 100% pass to proceed)** |
| 5 | FINALIZE | `my-academic-paper` | format-convert | Final TeX + compiled PDF, generated automatically after final integrity PASS |
| **6** | **PROCESS SUMMARY** | **orchestrator** | **auto** | **Paper creation process record MD + LaTeX to PDF (bilingual)** |

**Parallelization rule**: Within Stage 2, the `my-academic-paper` skill's Phase 1 (literature_strategist_agent) and the `visualization_agent` can operate in parallel after Phase 2 (structure_architect_agent) completes the outline. Specifically:
- Once the outline includes a visualization plan, `visualization_agent` can begin figure generation
- Simultaneously, `argument_builder_agent` can build CER chains
- `draft_writer_agent` waits for both to complete before beginning Phase 4

This mirrors PaperOrchestra's parallel execution of Plot Generation (Step 2) and Literature Review (Step 3) after Outline (Step 1), which reduces overall pipeline latency. In strict multi-agent launch, this parallelization is mandatory when Codex native subagents are available.

---

## Pipeline State Machine

1. **Stage 1 RESEARCH** -> manifest update -> Stage 2 unless a hard gate is triggered
2. **Stage 2 WRITE** -> manifest update -> Stage 2.5
3. **Stage 2.5 INTEGRITY** -> PASS -> Stage 3 (FAIL -> fix and re-verify, max 3 rounds)
4. **Stage 3 REVIEW** -> Accept -> Stage 4.5 / Minor|Major -> Stage 4 / hard-stop only when requested new experiments, data, or code results cannot be produced from existing materials
5. **Stage 4 REVISE** -> manifest update -> Stage 3'
6. **Stage 3' RE-REVIEW** -> Accept|Minor -> Stage 4.5 / Major -> Stage 4' unless blocked by missing experiments/data/code
7. **Stage 4' RE-REVISE** -> manifest update -> Stage 4.5 (no return to review)
8. **Stage 4.5 FINAL INTEGRITY** -> PASS (zero issues) -> Stage 5 (FAIL -> fix and re-verify)
9. **Stage 5 FINALIZE** -> TeX -> compile PDF -> Stage 6 without final user confirmation
10. **Stage 6 PROCESS SUMMARY** -> generate process record MD -> LaTeX -> PDF -> end

See `references/pipeline_state_machine.md` for complete state transition definitions.

---

## Hard Gate And Checkpoint System

⚠️ **IRON RULE — Core rule: After each stage completion, the system must update `manifest.yaml` and continue automatically unless a hard gate is triggered.**

### Checkpoint Types

| Type | When Used | Content |
|------|-----------|---------|
| PROGRESS | Normal stage completion | One-line status, artifact paths, next task; no user confirmation required |
| DESIGN_GATE | Route, derived topic/core claim, writing framework, or `开始写作` boundary | Requires explicit user input |
| BLOCKING_GATE | Integrity FAIL, unverifiable citations/data/claims, or reviewer-required experiments/data/code unavailable in current materials | Cannot be skipped; requires user action or a documented scope change |

### Progress Dashboard (shown at major progress boundaries or on `status`)

```
━━━ Stage [X] [Name] Complete ━━━

Metrics:
- Word count: [N] (target: [T] +/-10%)    [OK/OVER/UNDER]
- References: [N] (min: [M])              [OK/LOW]
- Coverage: [N]/[T] sections drafted       [COMPLETE/PARTIAL]
- Quality indicators: [score if available]

Deliverables:
- [Material 1]
- [Material 2]

Flagged: [any issues detected, or "None"]

Proceeding to Stage [Y] unless a hard gate is listed. You can still:
1. View progress (say "status")
2. Adjust settings
3. Pause pipeline
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Hard Gate Rules

1. **Route gate**: the workflow cannot begin research or writing until the paper route is one of `毕业论文`, `工科学术论文`, or `计算机会议论文`.
2. **Topic/claim gate**: after material inspection, the derived topic and core claim must be discussed with and confirmed by the user.
3. **Framework gate**: the writing framework must be shown to the user and approved before drafting.
4. **Writing command gate**: body drafting must wait for the exact command `开始写作`.
5. **Integrity gate**: citation, source, data, figure, table, code-result, or claim-verification failures block progression until fixed or explicitly scoped out.
6. **Reviewer feasibility gate**: reviewer requests are handled automatically unless they require new experiments, new data collection, or new code results that cannot be produced from current materials.
7. **Finalization rule**: after final integrity PASS, the workflow generates final TeX and compiled PDF automatically; no final PDF confirmation gate is required.

### Self-Check Questions (at every major progress boundary)

Before presenting progress or a hard gate to the user, the orchestrator asks itself:

1. **Citation integrity**: Are there any unverified citations in the latest output?
2. **Sycophantic concession**: Did the latest stage uncritically accept all feedback without pushback?
3. **Quality trajectory**: Is the latest output ≥ the quality of the previous stage? If declining, PAUSE and flag.
4. **Scope discipline**: Did the latest stage add content not requested by the user or the revision roadmap?
5. **Completeness**: Are all required deliverables for this stage present?

If ANY answer raises concern, either fix it automatically from available evidence or convert it into the appropriate hard gate.

---

## Agent Team (4 Agents)

| # | Agent | Role | File |
|---|-------|------|------|
| 1 | `pipeline_orchestrator_agent` | Main orchestrator: detects stage, recommends mode, triggers skill, manages transitions | `agents/pipeline_orchestrator_agent.md` |
| 2 | `state_tracker_agent` | State tracker: records completed stages, produced materials, revision loop count | `agents/state_tracker_agent.md` |
| 3 | `integrity_verification_agent` | Integrity verifier: 100% reference/citation/data verification (blocking) | `agents/integrity_verification_agent.md` |
| 4 | `collaboration_depth_agent` | **Observer (advisory only — never blocks).** Reads dialogue log and scores user-AI collaboration pattern against `shared/collaboration_depth_rubric.md`. Invoked at major progress boundaries and pipeline completion. Based on Wang & Zhang (2026). | `agents/collaboration_depth_agent.md` |

---

## Orchestrator Workflow

### Step 1: INTAKE & DETECTION

```
pipeline_orchestrator_agent analyzes the user's input:

1. What materials does the user have?
   - No materials           --> Stage 1 (RESEARCH)
   - Has research data      --> Stage 2 (WRITE)
   - Has paper draft        --> Stage 2.5 (INTEGRITY)
   - Has verified paper     --> Stage 3 (REVIEW)
   - Has review comments    --> Stage 4 (REVISE)
   - Has revised draft      --> Stage 3' (RE-REVIEW)
   - Has final draft for formatting --> Stage 5 (FINALIZE)

2. What is the user's goal?
   - Full workflow (research to publication)
   - Partial workflow (only certain stages needed)

3. Determine entry point and apply only the required design gates
```

### Step 2: MODE RECOMMENDATION

```
Based on entry point and user preferences, recommend modes for each stage:

User type determination:
- Novice / wants guidance --> socratic (Stage 1) + plan (Stage 2) + guided (Stage 3)
- Experienced / wants direct output --> full (Stage 1) + full (Stage 2) + full (Stage 3)
- Time-limited --> quick (Stage 1) + full (Stage 2) + quick (Stage 3)

Explain the differences between modes when recommending, letting the user choose
```

### Step 3: STAGE EXECUTION

```
Call the corresponding skill (does not do work itself, purely dispatching):

1. Inform the user which Stage is about to begin
2. Load the corresponding skill's SKILL.md
3. Launch the skill with the recommended mode
4. Monitor stage completion status

After completion:
1. Compile deliverables list
2. Update pipeline state (call state_tracker_agent)
3. Update `manifest.yaml`, write logs, and continue unless a DESIGN_GATE or BLOCKING_GATE is triggered
```

### Step 4: TRANSITION

```
After manifest update and gate evaluation:

1. Pass the previous stage's deliverables as input to the next stage
2. Trigger handoff protocol (defined in each skill's SKILL.md):
   - Stage 1  --> 2: deep-research handoff (RQ Brief + Verified Source Corpus + Candidate Sources - Unverified + Synthesis)
   - Stage 2  --> 2.5: Pass complete paper to integrity_verification_agent
   - Stage 2.5 --> 3: Pass verified paper to reviewer
   - Stage 3  --> 4: Pass Revision Roadmap to my-academic-paper revision mode
   - Stage 4  --> 3': Pass revised draft and Response to Reviewers to reviewer
   - Stage 3' --> 4': Pass new Revision Roadmap + R&R Traceability Matrix (Schema 11) to my-academic-paper revision mode
   - Stage 4/4' --> 4.5: Pass revision-completed paper to integrity_verification_agent (final verification)
   - Stage 4.5 --> 5: Pass verified final draft to format-convert mode
3. Begin next stage
```

### Mid-Conversation Reinforcement Protocol

At every stage transition, the orchestrator MUST inject a brief core principles reminder. This prevents context rot in long conversations.

**Template** (adapt to the upcoming stage):

````
--- STAGE TRANSITION: [Current] → [Next] ---

🔄 Core Principles Reinforcement:
1. [Most relevant IRON RULE for the next stage]
2. [Most relevant Anti-Pattern to avoid in the next stage]
3. Quality check: Is the output of [Current Stage] at least as good as [Previous Stage]? If not, PAUSE.

Gate: [PROGRESS/DESIGN_GATE/BLOCKING_GATE] — [What blocks, if anything]
---
````

**Stage-specific reinforcement content**: See `references/reinforcement_content.md` for the full transition → reinforcement focus table.

---

## Integrity Review Protocol

Stage 2.5 (pre-review) and Stage 4.5 (post-revision) verification. 5-phase protocol: references → citation context → statistical data → originality → claims.

⚠️ **IRON RULE**: Stage 4.5 must PASS with zero issues to proceed to Stage 5. Stage 4.5 verifies from scratch independently.

⚠️ **IRON RULE (v3.2)**: Both Stage 2.5 and Stage 4.5 must also run the **AI Research Failure Mode Checklist** — a 7-mode taxonomy extending the citation hallucination checks into implementation bugs, hallucinated results, shortcut reliance, bug-as-insight, methodology fabrication, and pipeline-level frame-lock. If any of the 7 modes is `SUSPECTED`, or if Modes 1/3/5/6 are `INSUFFICIENT EVIDENCE`, the pipeline **blocks** until the issue is fixed from available evidence, explicitly scoped out, or the user supplies missing experiments/data/code. There is no `--no-block` escape hatch. Stage 6 PROCESS SUMMARY then reports the full failure-mode audit log as part of the AI Self-Reflection Report.

> See `references/integrity_review_protocol.md` for the 5-phase citation/claim verification procedures.
> See `references/ai_research_failure_modes.md` for the 7-mode AI research failure checklist and block/override logic.

- [v3.4.0] `compliance_agent` runs mode-aware PRISMA-trAIce + RAISE compliance check; tier-based block semantics. See `shared/compliance_checkpoint_protocol.md`.

---

## Two-Stage Review Protocol

Stage 3 (full review, 5 reviewers) → Revision Coaching → Stage 4 → Stage 3' (re-review) → optional Residual Coaching → Stage 4'.

> See `references/two_stage_review_protocol.md` for detailed stage flows and coaching dialogue limits.

---

## Mid-Entry Protocol

Users can enter from any stage. The orchestrator will:

1. **Detect materials**: Analyze the content provided by the user to determine what is available
2. **Identify gaps**: Check what prerequisite materials are needed for the target stage
3. **Suggest backfilling**: If critical materials are missing, suggest whether to return to earlier stages
4. **Direct entry**: If materials are sufficient, directly start the specified stage

**Important: mid-entry cannot skip Stage 2.5**
- If the user brings a paper and enters directly, go through Stage 2.5 (INTEGRITY) first before Stage 3 (REVIEW)
- Only exception: User can provide a previous integrity verification report and content has not been modified

---

## External Review Protocol

Handles external (human) reviewer feedback integration. 4-step workflow: Intake & Structuring → Strategic Revision Coaching → Revision & Response → Self-Verification.

> See `references/external_review_protocol.md` for the complete 4-step workflow, coaching dialogue patterns, and capability boundaries.

---

## Progress Dashboard

ASCII dashboard shown when the user asks `status`, when a hard gate blocks progress, and at pipeline completion.

> See `references/progress_dashboard_template.md` for the dashboard template.

---

## Revision Loop Management

- Stage 3 (first review) -> Stage 4 (revision) -> Stage 3' (verification review) -> Stage 4' (re-revision, if needed) -> Stage 4.5 (final verification)
- **Maximum 1 round of RE-REVISE** (Stage 4'): If Stage 3' gives Major, enter Stage 4' for revision then proceed directly to Stage 4.5 (no return to review)
- **Pipeline overrides my-academic-paper's max 2 revision rule**: In the pipeline, revisions are limited to Stage 4 + Stage 4' (one round each), replacing my-academic-paper's max 2 rounds rule
- Mark unresolved issues as Acknowledged Limitations
- Provide cumulative revision history (each round's decision, items addressed, unresolved items)

### Early-Stopping Criterion (v3.2)

At the end of each revision round, if **delta < 3 points** on the 0-100 rubric AND **no P0 issues remain**, suggest stopping the revision loop ("converged"). User can override. Hard cap: 2 full revision loops (Stage 4 + Stage 4').

### Budget Transparency (v3.2)

At pipeline start, estimate token cost based on paper length, mode, and cross-model toggle. Record the estimate in `manifest.yaml`. Do not add an extra approval gate unless the user explicitly asks for budget control.

---

## Reproducibility

Every pipeline artifact is versioned, hashed, and auditable.

> See `references/reproducibility_audit.md` for standardized workflow guarantees, audit trail format, and artifact tracking.

---

## Stage 6: Process Summary Protocol

Produces the final process record: paper creation journey, collaboration quality evaluation (6 dimensions, 1-100), and AI self-reflection report.

> See `references/process_summary_protocol.md` for full workflow, required content structure, scoring dimensions, and output specifications.

---

## Collaboration Depth Observer (v3.5.0, advisory only — never blocks)

The `collaboration_depth_agent` observes the user's collaboration pattern with the pipeline. It is **advisory only** and **never blocks** progression. It is `non-blocking` by design and carries `blocking: false` in its frontmatter as a structural guarantee.

**When invoked**: major progress boundaries and after pipeline completion. Integrity gates do not invoke the observer — those are verification concerns and must not be diluted.

**What it does**: reads the dialogue range for the just-completed stage or the whole pipeline, scores the pattern against the canonical rubric at `shared/collaboration_depth_rubric.md`, and emits an advisory artifact/chapter. Dimensions: Delegation Intensity, Cognitive Vigilance, Cognitive Reallocation, Zone Classification (Zone 1 / Zone 2 / Zone 3). Rubric is based on Wang & Zhang (2026) IJETHE 23:11 (DOI 10.1186/s41239-026-00585-x).

**Distinction from existing mechanisms**:

| Mechanism | What it evaluates | Blocking? |
|---|---|---|
| `integrity_verification_agent` (Stages 2.5 / 4.5) | Paper content — references, citations, data | Yes (blocking gate) |
| Stage 6 Collaboration Quality Evaluation (6 dims, 1–100) | AI's self-reflection on its own behaviour | No, but produced once only |
| `collaboration_depth_agent` (this observer) | The **user's** collaboration pattern (delegation intensity, vigilance, reallocation) | **No — never blocks. Advisory only.** |

**Non-blocking guarantees**:
- `blocked_by: collaboration_depth_agent` is never a legal state in `state_tracker`.
- If observer frontmatter ever asserts `blocking: true`, the orchestrator must refuse to dispatch it.

**Cross-model**: when `ARS_CROSS_MODEL` is set, the observer runs on both models and flags any dimension divergence > 2 points. Scores are never silently averaged across models.

> See `agents/collaboration_depth_agent.md` for full scoring procedure and anti-sycophancy discipline; `shared/collaboration_depth_rubric.md` for the canonical 4-dimension rubric.

---

## Anti-Patterns

Explicit prohibitions to prevent common failure modes:

| # | Anti-Pattern | Why It Fails | Correct Behavior |
|---|-------------|-------------|-----------------|
| 1 | **Skipping integrity checks** | "The paper looks fine, skip Stage 2.5/4.5" | Integrity checks are MANDATORY; they cannot be auto-skipped regardless of perceived quality |
| 2 | **Orchestrator doing substantive work** | Pipeline orchestrator writes content or reviews the paper | Orchestrator only dispatches and coordinates; substantive work belongs to the sub-skills |
| 3 | **Prompt-only multi-agent simulation** | Saying "multiple agents will work" without spawning Codex subagents when available | In strict multi-agent launch, use native `spawn_agent` / `wait_agent` / `close_agent` for eligible parallel work |
| 4 | **Quality degradation across stages** | Stage 4 revision is worse than Stage 2 draft because context window is exhausted | If Stage N output quality < Stage N-1, PAUSE and reload core principles before continuing |
| 5 | **Silently dropping reviewer concerns** | Revision addresses 8 of 10 concerns and hopes nobody notices | The R&R tracking table must account for every concern with explicit status |
| 6 | **Re-verifying only known issues at Stage 4.5** | Final integrity check only re-checks Stage 2.5 findings | Stage 4.5 must verify from scratch independently; revision may introduce new issues |
| 7 | **Inflating Collaboration Quality scores** | Giving 90/100 to avoid awkward self-criticism | Honesty first: no inflation, no pleasantries; cite specific evidence for every score |
| 8 | **Bypassing the Failure Mode Checklist block** (v3.2) | "The 7-mode checklist is new, let's skip it this run" | Stage 2.5/4.5 Failure Mode Checklist is MANDATORY and BLOCKING; no `--no-block` flag exists; overrides require user reasoning recorded for Stage 6 |

---

## Quality Standards

| Dimension | Requirement |
|-----------|------------|
| Stage detection | Correctly identify user's current stage and available materials |
| Mode recommendation | Recommend appropriate mode based on user preferences and material status |
| Material handoff | Stage-to-stage handoff materials are complete and correctly formatted |
| State tracking | Pipeline state updated in real time; Progress Dashboard accurate |
| **Hard gates only** | **Routine stages continue after manifest update; only DESIGN_GATE and BLOCKING_GATE stop execution** |
| **Mandatory integrity check** | **Stage 2.5 and 4.5 cannot be skipped, must PASS** |
| **Mandatory failure mode checklist** (v3.2) | **Stage 2.5 and 4.5 must run the 7-mode AI research failure checklist; suspected failures block; overrides require user reasoning** |
| No overstepping | ⚠️ IRON RULE: Orchestrator does not perform substantive research/writing/reviewing, only dispatching |
| No forcing | ⚠️ IRON RULE: User can pause or exit pipeline at any time (but cannot skip integrity checks) |
| Reproducible | Same input follows the same workflow across different sessions |
| **Convergence-aware stopping** (v3.2) | **If delta < 3 points AND no P0 issues, suggest stopping revision loop; user can override** |
| **Budget transparency** (v3.2) | **Token cost estimate recorded in manifest; no extra gate unless requested** |

---

## Error Recovery

| Stage | Error | Handling |
|-------|-------|---------|
| Intake | Cannot determine entry point | Ask user what materials they have and their goal |
| Stage 1 | deep-research not converging | Suggest mode switch (socratic -> full) or narrow scope |
| Stage 2 | Missing research foundation | Suggest returning to Stage 1 to supplement research |
| Stage 2.5 | Still FAIL after 3 correction rounds | List unverifiable items; remove/reframe unsupported content or block for missing material |
| Stage 3 | Review result is Reject | Provide options: major restructuring (Stage 2) or abandon |
| Stage 4 | Revision incomplete on all items | Continue fixing automatically unless missing experiments/data/code are required |
| Stage 3' | Verification still has major issues | Enter Stage 4' for final revision |
| Stage 4' | Issues remain after revision | Mark as Acknowledged Limitations; proceed to Stage 4.5 |
| Stage 4.5 | Final verification FAIL | Fix and re-verify (max 3 rounds) |
| Any | User leaves midway | Save pipeline state; can resume from breakpoint next time |
| Any | Skill execution failure | Save manifest and logs; retry if safe, otherwise block with exact recovery action. Do not skip integrity or failure-mode gates |

---

## Agent File References

| Agent | Definition File |
|-------|----------------|
| pipeline_orchestrator_agent | `agents/pipeline_orchestrator_agent.md` |
| state_tracker_agent | `agents/state_tracker_agent.md` |
| integrity_verification_agent | `agents/integrity_verification_agent.md` |
| collaboration_depth_agent | `agents/collaboration_depth_agent.md` |

---

## Reference Files

| Reference | Purpose |
|-----------|---------|
| `references/pipeline_state_machine.md` | Complete state machine definition: all legal transitions, preconditions, actions |
| `references/plagiarism_detection_protocol.md` | Phase D originality verification protocol + self-plagiarism + AI text characteristics |
| `references/mode_advisor.md` | Unified cross-skill decision tree: maps user intent to optimal skill + mode |
| `references/claim_verification_protocol.md` | Phase E claim verification protocol: claim extraction, source tracing, cross-referencing, verdict taxonomy |
| `references/ai_research_failure_modes.md` | 7-mode AI research failure checklist (Lu 2026), run at Stage 2.5 + 4.5 with blocking behaviour, reported at Stage 6 |
| `references/team_collaboration_protocol.md` | Multi-person team coordination: role definitions, handoff protocol, version control, conflict resolution |
| `references/integrity_review_protocol.md` | Stage 2.5 + 4.5 integrity verification: 5-phase protocol details |
| `references/two_stage_review_protocol.md` | Two-stage review: Stage 3 full review + Stage 3' verification review |
| `references/external_review_protocol.md` | External (human) reviewer feedback: 4-step intake/coaching/revision/verification |
| `references/process_summary_protocol.md` | Stage 6: collaboration quality evaluation + AI self-reflection report |
| `references/reproducibility_audit.md` | Standardized workflow guarantees + audit trail format |
| `references/progress_dashboard_template.md` | ASCII progress dashboard template |
| `references/reinforcement_content.md` | Stage-specific reinforcement focus table for transitions |
| `references/changelog.md` | Full version history |
| `shared/handoff_schemas.md` | Cross-skill data contracts: 9 schemas for all inter-stage handoff artifacts |
| `shared/collaboration_depth_rubric.md` | Collaboration Depth Observer rubric (v1.0): 4 dimensions based on Wang & Zhang (2026) IJETHE 23:11 |

---

## Templates

| Template | Purpose |
|----------|---------|
| `templates/pipeline_status_template.md` | Progress Dashboard output template |

---

## Examples

| Example | Demonstrates |
|---------|-------------|
| `examples/full_pipeline_example.md` | Complete pipeline conversation log (Stage 1-5, with integrity + 2-stage review) |
| `examples/mid_entry_example.md` | Mid-entry example starting from Stage 2.5 (existing paper -> integrity check -> review -> revision -> finalization) |

---

## Output Language

Follows user language. Academic terminology retained in English.

---

## Integration with Other Skills

```
academic-research-workflow dispatches the following skills (does not do work itself):

Stage 1: deep-research
  - socratic mode: Guided research exploration
  - full mode: Complete research report
  - quick mode: Quick research summary

Stage 2: my-academic-paper
  - plan mode: Socratic chapter-by-chapter guidance
  - full mode: Complete paper writing

Stage 2.5: integrity_verification_agent (Mode 1: pre-review)
Stage 4.5: integrity_verification_agent (Mode 2: final-check)

Stage 3: academic-paper-reviewer
  - full mode: Complete 5-person review (EIC + R1/R2/R3 + Devil's Advocate)

Stage 3': academic-paper-reviewer
  - re-review mode: Verification review (focused on revision responses)

Stage 4/4': my-academic-paper (revision mode)
Stage 5: my-academic-paper (format-convert mode)
  - Step 1: Ask user which academic formatting style (APA 7.0 / Chicago / IEEE, etc.)
  - Step 2: Produce MD, then generate DOCX via Pandoc when available (otherwise provide conversion instructions)
  - Step 3: Produce LaTeX (using corresponding document class, e.g., apa7 class for APA 7.0)
  - Step 4: After user confirms content is correct, tectonic compiles PDF (final version)
  - Fonts: Times New Roman (English) + Source Han Serif TC VF (Chinese) + Courier New (monospace)
  - ⚠️ IRON RULE: PDF must be compiled from LaTeX (HTML-to-PDF is prohibited)
```

---

## Related Skills

| Skill | Relationship |
|-------|-------------|
| `deep-research` | Dispatched (Stage 1 research phase) |
| `my-academic-paper` | Dispatched (Stage 2 writing, Stage 4/4' revision, Stage 5 formatting) |
| `academic-paper-reviewer` | Dispatched (Stage 3 first review, Stage 3' verification review) |

---

## Version Info

| Item | Content |
|------|---------|
| Skill Version | 3.6.5 |
| Last Updated | 2026-05-29 |
| Maintainer | Cheng-I Wu |
| Dependent Skills | deep-research v2.0+, my-academic-paper v1.0+, academic-paper-reviewer v1.1+ |
| Role | Full academic research workflow orchestrator |

## Latest Update Result

Version `3.6.5` adds manifest-first continuation for long automatic runs.

- `manifest.yaml` is now the canonical workflow state.
- `scripts/next_action.js <run_dir>` resolves the next runnable task batch before every resume/status/continue decision.
- Stale `workflow.yaml` or `agent_tasks/*.yaml` statuses must not stop the run when the manifest shows that work can continue.
- Progress dashboards are informational only; they are not user-review gates.
- Strict automatic runs continue whenever `auto_continue: true` and no active gate, blocking issue, paused, completed, or aborted state is recorded.

---

## Changelog

> See `references/changelog.md` for full version history.
