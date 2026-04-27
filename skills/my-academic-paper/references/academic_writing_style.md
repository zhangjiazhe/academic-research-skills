# Academic Writing Style Guide

Used by `draft_writer_agent` and `peer_reviewer_agent`.

## Global Writing Orientation

1. Every sentence must serve the paper's central research subject.
2. Do not drift into side explanations, generic textbook narration, or report-style filler.
3. Depth should come from:
   - quantitative results
   - figures
   - tables
   - formulas
   - multi-layer examination of the research object
4. Do not create artificial depth through long qualitative narration.

## First-Use Definition Rule

1. Every abbreviation or acronym must be defined at first appearance in:
   - the abstract
   - the main text
   - the first figure or table section where it appears
2. If the same abbreviation first appears in a figure or table before the body explains it, define it there as well.

## Preferred and Forbidden Wording

### Preferred Verbs

Prefer wording such as:
- `分析了xx`
- `形成了xx`
- `验证了xx`
- `建立了xx`
- `研究了xx`
- `构建了xx`

### Forbidden or Restricted Wording

1. Avoid `可能` when it signals unsupported speculation rather than evidence-based uncertainty.
2. Avoid `例如` when it weakens coverage and makes the statement look selective or incomplete.
3. In Chinese, reduce shallow verbs such as `分析` and `选取` when stronger verbs such as `引入`、`研究`、`建立`、`构建` are more accurate.
4. Use `本文` / `本章` / `本节`; do not use `本研究`.
5. For Method and research-path description, do not use self-evaluative wording such as:
   - `系统`
   - `全面`
   - `综合`
   - `有效`
6. Only after results exist, Results / Discussion / Conclusion may use restrained evaluative wording such as `有效` or `准确`.

## Precision and Objectivity

1. Results analysis must be objective and comprehensive.
2. Do not generalize from one partial observation.
3. Do not use unsupported speculation.
4. Basic domain knowledge does not need excessive explanation.
5. Emphasize the formulas, assumptions, reports, standards, and conditions that are actually used in this paper.
6. Do not spend space expanding well-known standard formulas or textbook-style background unless that content is directly needed for the paper's reasoning.

## Anti-Report and Anti-Repetition Rules

Do not write:
- science-popularization text
- generic report-style prose
- long qualitative narration of simple descriptive statistics
- overextended explanation of others' formulas when only the used part matters

Also avoid:
- repeated statements of background, problem, and significance
- repeating the same justification in multiple sections with only surface wording changes

## Title and Heading Rules

### Level 1 Headings

- Must clearly express the chapter theme
- The research object should be identifiable
- A verb is allowed when it improves clarity

### Level 2 Headings

- Used for module division
- A verb is allowed
- Innovation-related headings should explicitly contain wording such as `xxx模型构建` when appropriate
- The research object may be omitted if the meaning stays clear

### Level 3 Headings

- Used for concrete steps
- Must contain an action verb
- The research object may be omitted if the meaning stays clear

### Forward-Term Consistency

Important innovation terms, conclusion terms, and core professional terms should appear in earlier headings when appropriate, so readers can trace final claims back to visible structure.

## Paragraph and Section Discipline

1. Keep the narrative centered on the paper's main line.
2. Do not write disconnected sentence chains.
3. Use section structure to support the logic of the whole paper.
4. Where the paper contains process modeling, write:
   - `step 1: ...`
   - `step 2: ...`
5. Where the paper contains enumerated points, use:
   - `（1）`
   - `（2）`
   - `……`

## Terminology and Symbol Handling

1. If the paper contains many symbols, prepare a dedicated symbol table.
2. The symbol table should prioritize usability and readability.
3. Formula notation in running text should use direct English symbols so line spacing stays consistent.

## Citation Discipline

1. Do not cite trivial statements with no substantive academic content.
2. Every applied method must be cited.
3. Every cited standard, threshold, and numeric parameter choice must be cited.
4. References must be real and verified; never fabricate papers.
5. References irrelevant to the current paper must not be listed.

## Figures, Tables, and Equations

1. Figure and table titles should foreground content, not just object labels.
2. A strong title should make at least part of the 5W information visible:
   - who
   - where
   - what
   - how
   - why
3. Every figure must include textual explanation in the main text.
4. Subfigure names should be marked after the figure title where relevant.
5. Parameters, environments, and settings may be stated in figure/table titles when that improves interpretation.
6. Equation formatting should stay visually consistent throughout the paper.

## Core Principles

### 1. Precision
- Use the most specific term available
- Define technical terms on first use
- Avoid ambiguous pronouns without clear antecedents

### 2. Conciseness
- Eliminate filler words and redundant phrases
- One idea per sentence, or clearly connected ideas
- Prefer short sentences for complex ideas

### 3. Objectivity
- Base claims on evidence, not opinion
- Use evidence-based caution rather than vague speculation
- Acknowledge limitations and alternative interpretations when supported

### 4. Formality
- Use full forms
- Use formal academic vocabulary
- Use third person unless discipline conventions clearly support another voice

## Register Adjustment by Discipline

### Sciences (Natural, Applied)
```
Register: Formal, impersonal, method-focused
Voice: Passive voice acceptable when describing operations
Terminology: Precise measurements, SI units, statistical notation
```

### Social Sciences
```
Register: Formal, theory-informed, participant-aware
Voice: Active voice encouraged, first person only when discipline conventions support it
Terminology: Theoretical constructs, operationalized variables
```

### Humanities
```
Register: Formal, argument-driven, interpretive
Voice: Active voice acceptable
Terminology: Close reading vocabulary, theoretical language
```

### Engineering / CS
```
Register: Formal, problem-solution oriented, specification-precise
Voice: Passive acceptable for method; active acceptable for findings and contributions
Terminology: Technical specifications, performance metrics, verified parameter descriptions
```

### Education
```
Register: Formal, practice-oriented, stakeholder-aware
Voice: Active voice
Terminology: Pedagogical concepts, assessment language
```

### Medicine / Health
```
Register: Formal, evidence-hierarchy conscious, clinical precision
Voice: Passive for methods, active for findings
Terminology: Clinical terms, diagnostic criteria, statistical reporting
```

## Tense Usage

| Section | Tense | Example |
|---------|-------|---------|
| Literature review (reporting findings) | Past | "Smith (2024) found that..." |
| Literature review (ongoing state) | Present | "The theory posits that..." |
| Methodology | Past | "Data were collected through..." |
| Results | Past | "The analysis revealed..." |
| Discussion | Present | "These findings suggest..." |
| Conclusion | Present/Future | "This has implications for..." |

## Chinese Academic Writing Notes

1. Use formal written Chinese.
2. Avoid colloquial phrasing.
3. Prefer direct sentence construction over translated-English syntax.
4. Use concise academic expressions rather than repeated explanatory padding.
