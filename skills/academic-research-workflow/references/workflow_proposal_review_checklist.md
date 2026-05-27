# Workflow Proposal Review Checklist

Use this checklist before compiling `workflow_proposal.yaml` into `workflow.yaml` and `agent_tasks/*.yaml`.

The user wants full detail, so present the complete proposal for review, not only a summary.

## Required Review Questions

### 1. Scope Fit

- Does the proposal match the selected paper route?
- Does it reflect actual inspected materials?
- Does it avoid asking the user for final topic/core claim before inspection?
- Does it handle existing code, experiments, figures, tables, drafts, and references if present?

### 2. Stage Completeness

- Does the proposal include material inspection?
- Does it include topic/core-claim confirmation?
- Does it include workflow definition and compilation?
- Does it include research / source discovery when needed?
- Does it include framework approval?
- Does it include `开始写作` before body drafting?
- Does it include integrity checks before review and before finalization?
- Does it include review, revision, re-review, final integrity, final TeX/PDF, and process summary when relevant?

### 3. Agent And Skill Assignment

- Does every task have an `agent_name`?
- Does every task have a `called_skill`?
- Are child skills assigned correctly?
- Does the orchestrator avoid doing substantive work itself?
- Are specialized `nature-*` skills used only where appropriate?

### 4. Parallel And Serial Strategy

- Are serial barriers preserved?
- Are parallel tasks truly independent?
- Do parallel tasks avoid writing the same output artifact?
- Are literature searches split sensibly by database, keyword family, or subtopic?
- Are reviewer personas parallelized when possible?
- Are verification batches parallelized only after source collection?

### 5. Artifact Flow

- Does every task declare `input_artifacts`?
- Does every task declare `output_artifacts`?
- Are produced artifacts consumed by later tasks?
- Is `Verified Source Corpus` produced before citation-heavy writing?
- Are unverified candidates kept out of writing and `.bib` outputs?

### 6. Reference Integrity

- Do search tasks use structured tools such as `nature-academic-search`, PubMed, CrossRef, arXiv, or DOI lookup?
- Does `deep-research` handle synthesis and filtering after structured discovery?
- Does source verification happen before sources enter `Verified Source Corpus`?
- Are hallucinated or memory-completed references explicitly forbidden?
- Are candidate-only references excluded from正文、`.bib`、最终参考文献?

### 7. Writing Safety

- Does writing depend on approved framework?
- Does writing depend on `START_WRITING_GATE`?
- Does citation-heavy writing depend on `Verified Source Corpus`?
- Does output default to TeX?
- Does final PDF generation depend on final integrity PASS?

### 8. Review And Revision Safety

- Are reviewer tasks independent where possible?
- Does revision address every review item?
- Does re-review verify the revision rather than re-review from scratch only?
- Does the workflow block only if new experiments/data/code are required and unavailable?

### 9. Hard Gates

Only these gates are allowed:

- `ROUTE_GATE`
- `TOPIC_CLAIM_GATE`
- `FRAMEWORK_GATE`
- `START_WRITING_GATE`
- `INTEGRITY_GATE`
- `REVIEWER_FEASIBILITY_GATE`

Check that gates are neither too weak nor too frequent.

### 10. Compilation Readiness

Before compiling:

- `workflow_proposal.yaml` exists in the run folder.
- User has reviewed the complete detailed proposal.
- User has explicitly approved compilation.
- `validate_workflow_proposal.js` passes.

Only then run:

```bash
node ~/.codex/skills/academic-research-workflow/scripts/compile_task_graph.js workflow_proposal.yaml --run-dir <run_dir>
```

## Approval Options To Present

When review is complete, ask the user to choose one:

- Approve and compile.
- Revise task graph.
- Add/remove tasks.
- Change agent/skill assignment.
- Change parallel/serial strategy.
- Change hard gates.
- Pause workflow construction.
