# Agent Task Card Schema

Every bounded task in `academic-research-workflow` must have one task card under `agent_tasks/`.

The task card is the authority for spawned subagents and for sequential fallback execution.

Use `scripts/validate_task_card.js` before dispatching a task card to a subagent.

## Required Shape

```yaml
task_id: "stage_4_crossref_search"
stage_id: "stage_4_research"
agent_name: "crossref_search_agent"
called_skill: "nature-academic-search"
status: "pending"       # pending/running/completed/blocked/failed
can_run_parallel: true
depends_on:
  - "stage_3_define_search_strategy"

input_artifacts:
  - "artifacts/search_strategy.yaml"
output_artifacts:
  - "artifacts/crossref_candidates.yaml"
log_file: "logs/stage_4_crossref_search.log"

prompt: |
  Use the search strategy artifact to query CrossRef through structured tools.
  Return only tool-backed candidate references with metadata provenance.

completion_criteria:
  - "Every candidate includes title, authors, year, venue, and DOI or source URL."
  - "Every candidate records the tool/database used for discovery."
  - "No reference may be completed from model memory."
  - "Unverified candidates are marked candidate_only and excluded from Verified Source Corpus."

handoff:
  produced_for:
    - "stage_4_source_verification"
  summary_required: true
```

## Subagent Invocation Rule

When strict multi-agent launch is active and Codex native subagents are available:

1. Spawn one subagent per independent task card.
2. Pass only the task card and required input artifacts.
3. Require the subagent to return a compact structured artifact and list changed/created files.
4. Validate output against `completion_criteria`.
5. Update `manifest.yaml`.
6. Close the subagent.

If no native subagent tool exists, execute the same task card sequentially and record `execution_mode: sequential_fallback` in `workflow.yaml`.

## Blocking Semantics

A task can block the workflow only by producing one of these gate types:

- `ROUTE_GATE`
- `TOPIC_CLAIM_GATE`
- `FRAMEWORK_GATE`
- `START_WRITING_GATE`
- `INTEGRITY_GATE`
- `REVIEWER_FEASIBILITY_GATE`

Routine quality improvements, wording changes, citation supplementation, and formatting fixes do not block.
