# Pipeline State Machine

This document defines the legal states, transitions, and blocking rules for `academic-research-workflow`.

## State Definitions

### Stage States

| State | Description |
|---|---|
| `pending` | Not yet started; waiting for prerequisite tasks or gates |
| `in_progress` | Currently executing |
| `completed` | Completed; deliverables recorded in `manifest.yaml` |
| `skipped` | Explicitly skipped because the stage is not required for this run |
| `blocked` | A hard gate prevents progress |

### Pipeline Global States

| State | Description |
|---|---|
| `initializing` | Creating run folder, manifest, workflow definition, and first task cards |
| `planning` | Material inspection or workflow definition is underway |
| `running` | Executing tasks and stages |
| `awaiting_gate_resolution` | Waiting only because a DESIGN_GATE or BLOCKING_GATE was triggered |
| `paused` | User paused; can resume from `manifest.yaml` |
| `completed` | Final TeX, PDF, and process record produced |
| `aborted` | User explicitly abandoned the run |

## Hard Gates

Only the following gates stop automatic execution:

| Gate | Trigger | Required Resolution |
|---|---|---|
| `ROUTE_GATE` | Paper route is not one of `毕业论文`, `工科学术论文`, `计算机会议论文` | User chooses one route |
| `TOPIC_CLAIM_GATE` | Materials have been inspected and the workflow has derived a topic/core claim | User discusses and confirms or revises the topic/core claim |
| `FRAMEWORK_GATE` | Paper framework is ready | User approves or revises the framework |
| `START_WRITING_GATE` | Body drafting would begin | User sends exact command `开始写作` |
| `INTEGRITY_GATE` | Citation/source/data/figure/table/code-result/claim verification fails | Fix from available evidence, remove/reframe unsupported content, or user supplies missing material |
| `REVIEWER_FEASIBILITY_GATE` | Reviewer asks for experiments/data/code results unavailable in current materials | User supplies new material or authorizes scope change |

Final PDF generation is not a hard gate. After final integrity PASS, Stage 5 produces TeX and compiles PDF automatically.

## Normal Flow

```text
INIT
  -> Stage 0 INTAKE
  -> Stage 1 MATERIAL_INSPECTION
  -> TOPIC_CLAIM_GATE
  -> Stage 2 WORKFLOW_DEFINITION
  -> Stage 3 RESEARCH
  -> Stage 4 WRITING_FRAMEWORK
  -> FRAMEWORK_GATE
  -> START_WRITING_GATE
  -> Stage 5 WRITE
  -> Stage 5.5 PRE_REVIEW_INTEGRITY
  -> Stage 6 REVIEW
  -> Stage 7 REVISE
  -> Stage 6' RE_REVIEW
  -> Stage 7' RE_REVISE if needed
  -> Stage 8 FINAL_INTEGRITY
  -> Stage 9 FINALIZE_TEX_PDF
  -> Stage 10 PROCESS_SUMMARY
  -> END
```

The workflow updates `manifest.yaml` after every task and stage. A normal stage completion creates a PROGRESS update, not a user-confirmation checkpoint.

## Legal Transitions

| From | To | Preconditions | Action |
|---|---|---|---|
| INIT | Stage 0 | Run folder can be created | Create `manifest.yaml`, `workflow.yaml`, `agent_tasks/`, `artifacts/`, `logs/` |
| Stage 0 | Stage 1 | `ROUTE_GATE` resolved | Inspect current paper directory and user-declared material locations |
| Stage 1 | `TOPIC_CLAIM_GATE` | Material inspection complete | Present derived topic, angle, contribution, and core claim |
| `TOPIC_CLAIM_GATE` | Stage 2 | User confirms topic/core claim | Define full workflow graph and task cards |
| Stage 2 | Stage 3 | `workflow.yaml` and task cards exist | Dispatch `deep-research` and `nature-academic-search` backed tasks |
| Stage 3 | Stage 4 | Verified Source Corpus exists | Build writing framework |
| Stage 4 | `FRAMEWORK_GATE` | Framework produced | Present framework for user approval |
| `FRAMEWORK_GATE` | `START_WRITING_GATE` | User approves framework | Wait for exact `开始写作` |
| `START_WRITING_GATE` | Stage 5 | User sends exact `开始写作` | Draft using `my-academic-paper` |
| Stage 5 | Stage 5.5 | Draft produced | Run pre-review integrity verification |
| Stage 5.5 | Stage 6 | Integrity PASS | Dispatch internal review |
| Stage 5.5 | Stage 5.5 retry | Integrity FAIL | Fix, remove, or reframe unsupported material, then reverify |
| Stage 6 | Stage 7 | Review requests are addressable from current materials | Revise automatically |
| Stage 6 | `REVIEWER_FEASIBILITY_GATE` | Review requires unavailable experiments/data/code results | Stop and request missing material or scope decision |
| Stage 7 | Stage 6' | Revision complete | Re-review revised draft |
| Stage 6' | Stage 8 | Accept or minor/addressable issues | Run final integrity |
| Stage 6' | Stage 7' | Major issues addressable from current materials | Re-revise once |
| Stage 6' | `REVIEWER_FEASIBILITY_GATE` | Major issues require unavailable experiments/data/code results | Stop and request missing material or scope decision |
| Stage 7' | Stage 8 | Re-revision complete | Run final integrity |
| Stage 8 | Stage 9 | Final integrity PASS | Generate TeX and compile PDF |
| Stage 8 | Stage 8 retry | Final integrity FAIL | Fix, remove, or reframe unsupported material, then reverify |
| Stage 9 | Stage 10 | TeX and PDF produced | Generate process record |
| Stage 10 | END | Process record produced | Mark manifest completed |

## Prohibited Transitions

| From | To | Reason |
|---|---|---|
| Stage 0 | Stage 3 | Cannot research before route and material inspection |
| Stage 1 | Stage 5 | Cannot write before topic/core claim, workflow definition, framework approval, and `开始写作` |
| Stage 3 | Stage 5 | Cannot write citation-heavy text before Verified Source Corpus exists |
| Stage 5 | Stage 6 | Cannot review before pre-review integrity PASS |
| Stage 6 | Stage 8 | Cannot skip revision when review found addressable substantive issues |
| Stage 7 | Stage 9 | Cannot skip re-review and final integrity |
| Stage 8 | Stage 9 | Cannot finalize when final integrity has unresolved failures |
| Stage 9 | Stage 6 | Cannot roll back to review after finalization without starting a new revision run |

## Material Dependency Matrix

| Material | Produced At | Consumed At | Required |
|---|---|---|---|
| Material inventory | Stage 1 | Stage 2, Stage 4, Stage 5 | Yes |
| Topic/core claim brief | `TOPIC_CLAIM_GATE` | Stage 2 onward | Yes |
| `workflow.yaml` | Stage 2 | All later stages | Yes |
| Task cards | Stage 2 and later | All delegated/sequential tasks | Yes |
| Verified Source Corpus | Stage 3 | Stage 5, integrity checks | Yes for cited sources |
| Candidate Sources - Unverified | Stage 3 | Research triage only | No; cannot be cited |
| Paper framework | Stage 4 | Stage 5 | Yes |
| Draft TeX | Stage 5 | Stage 5.5, Stage 6 | Yes |
| Pre-review integrity report | Stage 5.5 | Stage 6 | Yes |
| Review reports and roadmap | Stage 6 | Stage 7 | Yes |
| Revised draft | Stage 7/7' | Stage 6'/8 | Yes |
| Final integrity report | Stage 8 | Stage 9 | Yes |
| Final TeX and PDF | Stage 9 | Stage 10 / delivery | Yes |

## Multi-Agent Execution

When strict multi-agent launch is active and Codex native subagents are available:

1. Parallelizable tasks must be represented as separate task cards.
2. The orchestrator must start independent Codex subagents with `spawn_agent`.
3. The orchestrator must not wait for subagents until a downstream dependency requires their artifacts.
4. Each returned artifact is validated against the task card before the manifest advances.
5. Each subagent is closed after its result is recorded.

If native subagents are unavailable, the same task graph runs sequentially with the same task cards, gates, artifacts, and manifest updates.

## Exception Handling

### Integrity Failure

Integrity failures block progression. The workflow first tries to fix them from available evidence. If not possible, it removes/reframes unsupported claims or asks the user for missing material.

### Reviewer Requests For New Work

Reviewer comments do not automatically block. They block only when satisfying them requires experiments, data, or code results that are not present and cannot be generated from the current project materials.

### Session Interruption

Resume from `manifest.yaml`; do not rely on conversation memory as the source of truth.

### Passport Reset Boundary

The older passport reset protocol remains optional for cross-session context resets. When enabled, it must not weaken any hard gate. For the full protocol, see [`passport_as_reset_boundary.md`](passport_as_reset_boundary.md).
