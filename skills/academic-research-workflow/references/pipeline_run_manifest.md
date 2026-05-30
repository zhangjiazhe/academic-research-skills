# Pipeline Run Manifest

`manifest.yaml` is the compact canonical state file for one `academic-research-workflow` run. It lives in the current paper/workspace directory inside the run folder.

The manifest is not a transcript. Store detailed agent output, errors, and validation traces in `logs/`, then link those files from the manifest.

## Required Shape

```yaml
pipeline_run_id: "2026-05-27_readable-topic-slug"
workflow_name: "academic-research-workflow"
workflow_version: "3.6.5"
status: "initializing"   # initializing/planning/running/awaiting_gate_resolution/paused/completed/aborted
current_stage: "stage_0_intake"
created_at: "2026-05-27T00:00:00+08:00"
updated_at: "2026-05-27T00:00:00+08:00"

execution_control:
  execution_mode: "strict_multi_agent"  # planning/strict_multi_agent/sequential_fallback
  auto_continue: true
  canonical_state_file: "manifest.yaml"
  resume_policy: "manifest_first"
  stop_conditions:
    - active_gate
    - blocking_issue
    - paused_completed_or_aborted
  user_design_gates_waived: []

paper_profile:
  route: null            # 毕业论文 / 工科学术论文 / 计算机会议论文
  target_standard: "highest_feasible"
  target_language: "中文"
  output_format: "tex_pdf"
  has_data_or_experiments: null
  data_locations: []
  code_locations: []
  experiment_locations: []
  topic: null
  core_claim: null
  contribution_type: null

workflow_files:
  run_dir: "."
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
  stage_5_framework: "pending"
  stage_6_writing: "pending"
  stage_7_integrity: "pending"
  stage_8_review: "pending"
  stage_9_revision: "pending"
  stage_10_final_integrity: "pending"
  stage_11_finalize: "pending"
  stage_12_process_summary: "pending"

active_gates: []
completed_tasks: []
running_tasks: []
blocked_tasks: []

artifacts:
  material_inventory: null
  topic_claim_brief: null
  workflow_proposal: null
  workflow_definition: null
  verified_source_corpus: null
  candidate_sources_unverified: null
  paper_framework: null
  draft_tex: null
  draft_pdf: null
  integrity_report: null
  review_report: null
  revision_report: null
  final_integrity_report: null
  final_tex: null
  final_pdf: null
  process_record_pdf: null

blocking_issues: []
next_action: "complete initial intake"
```

## Update Rules

Use `scripts/advance_stage.js` for mechanical updates when possible.
Use `scripts/next_action.js` at every resume/status boundary to determine the next runnable task(s) from manifest-first state.

After every task:

1. Update `updated_at`.
2. Move the task id into `completed_tasks`, `running_tasks`, or `blocked_tasks`.
3. Record produced artifact paths.
4. Record any gate in `active_gates`.
5. Set `next_action` to the next executable task or required user action.
6. Write detailed output to `logs/` and reference it from the task card or artifact entry.

## Gate Records

```yaml
active_gates:
  - gate_id: "gate_topic_claim_001"
    gate_type: "TOPIC_CLAIM_GATE"
    status: "awaiting_user"
    reason: "Derived topic/core claim requires user discussion before workflow definition."
    required_user_action: "Confirm or revise the proposed topic/core claim."
    created_at: "2026-05-27T00:00:00+08:00"
```

Only DESIGN_GATE and BLOCKING_GATE entries stop execution.

## Resume And Auto-Continue Rules

`manifest.yaml` is authoritative when it conflicts with `workflow.yaml` or task-card `status` fields. In particular, `completed_tasks` and `stage_status` override stale `status: pending` values in task cards.

If `execution_control.auto_continue` is `true`, the orchestrator must continue to the runnable task(s) returned by `scripts/next_action.js` unless one of the recorded `stop_conditions` is present.
