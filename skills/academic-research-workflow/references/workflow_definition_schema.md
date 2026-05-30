# Workflow Definition Schema

`workflow.yaml` is the task graph for one run. It is created after intake/material inspection and updated when the plan changes.

Use `scripts/init_run.js` to create the initial file, `scripts/build_workflow.js` to rebuild the default graph, and `scripts/validate_workflow.js` before dispatch.

Use `scripts/next_action.js` to resolve dispatch from `manifest.yaml` plus this graph. `manifest.yaml` is canonical for progress; this file is canonical for dependencies and task-card locations.

## Required Shape

```yaml
workflow_id: "2026-05-27_readable-topic-slug"
workflow_name: "academic-research-workflow"
run_dir: "."
execution_mode: "strict_multi_agent"  # planning / strict_multi_agent / sequential_fallback

defaults:
  target_standard: "highest_feasible"
  target_language: "中文"
  output_format: "tex_pdf"

stages:
  - stage_id: "stage_4_research"
    name: "Research"
    called_skill: "deep-research"
    status: "pending"
    depends_on:
      - "stage_3_workflow_definition"
    required_inputs:
      - "artifacts/topic_claim_brief.yaml"
    expected_outputs:
      - "artifacts/verified_source_corpus.yaml"
      - "artifacts/candidate_sources_unverified.yaml"
    hard_gates:
      - "INTEGRITY_GATE"
    tasks:
      - "agent_tasks/stage_4_pubmed_search.yaml"
      - "agent_tasks/stage_4_crossref_search.yaml"
```

## Dependency Rules

- A stage cannot start until all `depends_on` stages are `completed`.
- A task cannot start until all task-level dependencies are `completed`.
- Completion is read from `manifest.yaml.completed_tasks` and `manifest.yaml.stage_status` first; task-card `status` values are advisory and may be stale after resume.
- A task marked `can_run_parallel: true` must be spawned as a Codex subagent when native subagents are available and strict multi-agent launch is active.
- If native subagents are unavailable, execute the same tasks sequentially and set `execution_mode: sequential_fallback`.

## Parallelization Rules

Parallelize only when tasks are independent and consume stable input artifacts. Typical parallelizable groups:

- Literature searches split by database, keyword family, or subtopic.
- Metadata verification split by source batch.
- Reviewer personas during internal review.
- Post-revision consistency checks split by citation, data, format, and response traceability.

Do not parallelize when a downstream task depends on a single unresolved artifact.
