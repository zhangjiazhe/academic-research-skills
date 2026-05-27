# Workflow Proposal Schema

`workflow_proposal.yaml` is the model-planned draft task graph. It is created after material inspection and topic/core-claim discussion, then reviewed with the user before compilation.

The proposal is flexible and task-specific. JS does not invent the workflow; JS validates and freezes the confirmed proposal into `workflow.yaml` and `agent_tasks/*.yaml`.

Use:

```bash
node ~/.codex/skills/academic-research-workflow/scripts/validate_workflow_proposal.js workflow_proposal.yaml
node ~/.codex/skills/academic-research-workflow/scripts/compile_task_graph.js workflow_proposal.yaml --run-dir <run_dir>
```

## Required Shape

```yaml
proposal_id: "2026-05-27_topic_plan_v1"
workflow_name: "academic-research-workflow"
execution_mode: "strict_multi_agent"

defaults:
  target_standard: "highest_feasible"
  target_language: "中文"
  output_format: "tex_pdf"

planning_basis:
  paper_route: "计算机会议论文"
  material_inventory: "artifacts/material_inventory.yaml"
  topic_claim_brief: "artifacts/topic_claim_brief.yaml"

stages:
  - stage_id: "stage_4_research"
    name: "Research"
    called_skill: "deep-research"
    depends_on:
      - "stage_3_workflow_definition"
    required_inputs:
      - "artifacts/topic_claim_brief.yaml"
    expected_outputs:
      - "artifacts/verified_source_corpus.yaml"
      - "artifacts/candidate_sources_unverified.yaml"
    hard_gates: []
    tasks:
      - task_id: "stage_4_crossref_search"
        agent_name: "crossref_search_agent"
        called_skill: "nature-academic-search"
        can_run_parallel: true
        depends_on: []
        input_artifacts:
          - "artifacts/search_strategy.yaml"
        output_artifacts:
          - "artifacts/crossref_candidates.yaml"
        prompt: |
          Search CrossRef using the approved strategy. Return only tool-backed metadata.
        completion_criteria:
          - "Every candidate has title, authors, year, venue, and DOI or source URL."
          - "No reference may be completed from model memory."
```

## Human Review Gate

The orchestrator must show the proposal to the user before compiling it.

The user may change:

- stage order
- task list
- agent assignment
- child skill assignment
- parallel vs serial strategy
- hard gates
- prompts
- completion criteria

Only after user approval may the orchestrator run `compile_task_graph.js`.

## Compiler Checks

The compiler rejects:

- missing `proposal_id`
- wrong `workflow_name`
- invalid `execution_mode`
- duplicate `stage_id`
- duplicate `task_id`
- unknown stage/task dependencies
- invalid hard gate names
- tasks missing agent, skill, inputs, outputs, prompt, or completion criteria
- writing tasks that do not reference a Verified Source Corpus dependency/artifact

## Design Principle

Model plans the workflow. Human confirms the workflow. JS freezes and enforces the workflow.
