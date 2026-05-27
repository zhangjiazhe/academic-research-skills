# Workflow Proposal Authoring Guide

This guide defines how the orchestrator drafts `workflow_proposal.yaml` before JS compilation.

The proposal is model-planned, human-reviewed, and JS-compiled. Do not skip the human review gate.

## When To Draft

Draft `workflow_proposal.yaml` only after:

1. Paper route is known: `毕业论文`, `工科学术论文`, or `计算机会议论文`.
2. Materials have been inspected.
3. Topic, research angle, and core claim have been discussed with the user.

Do not draft the final task graph before material inspection. The graph must reflect the real project, not a generic paper template.

## Required Proposal Contents

Every proposal must include:

- `proposal_id`
- `workflow_name: academic-research-workflow`
- `execution_mode`
- `defaults`
- `planning_basis`
- `stages`

Every stage must include:

- `stage_id`
- `name`
- `called_skill`
- `depends_on`
- `required_inputs`
- `expected_outputs`
- `hard_gates`
- `tasks`

Every task must include:

- `task_id`
- `agent_name`
- `called_skill`
- `can_run_parallel`
- `depends_on`
- `input_artifacts`
- `output_artifacts`
- `prompt`
- `completion_criteria`
- optional `hard_gates`
- optional `handoff`

## Full Detail Review Rule

When presenting a proposal to the user for discussion, show the complete detailed proposal, not only a summary. The presentation must include:

1. Full stage list.
2. Full task list under every stage.
3. Agent assignment for every task.
4. Child skill assignment for every task.
5. Serial dependencies.
6. Parallelizable task groups.
7. Input and output artifacts.
8. Hard gates.
9. Prompt for every task.
10. Completion criteria for every task.

The YAML file itself must be saved as `workflow_proposal.yaml` in the run folder. The chat presentation may be structured as Markdown tables plus selected YAML blocks, but it must be complete enough for the user to audit every task before approval.

## Planning Principles

### Keep The Workflow Task-Specific

Do not use one fixed universal graph. Adapt to:

- paper route
- available code
- available experiments
- available data
- existing drafts
- existing figures/tables
- existing references
- topic/core claim
- contribution type

### Preserve Hard Serial Barriers

The proposal must preserve these serial barriers:

1. Route and material inspection before proposal generation.
2. Topic/core claim confirmation before task graph compilation.
3. Search strategy before source collection.
4. Source collection before source verification.
5. Source verification before Verified Source Corpus.
6. Verified Source Corpus before citation-heavy writing.
7. Framework approval before body drafting.
8. Exact command `开始写作` before body drafting.
9. Pre-review integrity PASS before review.
10. Review before revision.
11. Final integrity PASS before final TeX/PDF.

### Mark Parallel Work Explicitly

Use `can_run_parallel: true` only when the task can run independently after dependencies are satisfied.

Typical parallel groups:

- PubMed / CrossRef / arXiv / DOI lookup searches.
- Source metadata verification split by source batch.
- Code inspection and experiment-result inspection after material inventory.
- Figure/table consistency checks split by artifact.
- Independent reviewer personas.
- Post-revision checks split by citation, data, format, and response traceability.

Do not mark tasks parallel if they write the same output artifact or depend on each other's results.

## Reference Integrity Requirements

Literature discovery and verification tasks must obey:

- `nature-academic-search` is the preferred structured metadata backend.
- `deep-research` performs research synthesis and selection.
- Candidate references without structured provenance stay in `Candidate Sources - Unverified`.
- Only verified sources enter `Verified Source Corpus`.
- Writing tasks may cite only `Verified Source Corpus` or verified user-provided sources.
- No task may complete missing reference metadata from model memory.

## Writing Requirements

Writing tasks must depend on:

- approved framework artifact
- Verified Source Corpus when citations are involved
- `START_WRITING_GATE`

Default output is TeX. Final PDF is generated automatically after final integrity PASS.

## Reviewer Requirements

Review tasks may run independent reviewer personas in parallel. Reviewer feedback blocks only when it requires new experiments, data, or code results unavailable in current materials.

Represent such cases with `REVIEWER_FEASIBILITY_GATE`.

## Proposal Presentation Template

When presenting the proposal to the user, use this order:

1. Proposal identity and planning basis.
2. Complete stage table.
3. Complete task table grouped by stage.
4. Parallel execution groups.
5. Hard gates.
6. Artifact flow.
7. Full `workflow_proposal.yaml` path.
8. Ask the user to approve, revise, or request additions/removals.

Do not compile until the user approves the proposal.
