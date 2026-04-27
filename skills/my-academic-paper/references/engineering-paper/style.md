# Engineering Paper Shared Style Rules

## Scope

These rules are the shared global constraints for the `工科学术论文` route.
They apply across Method, Results, Discussion, Conclusion, Future Work, Introduction, Literature Review, Abstract, figures, tables, equations, and references.

## Wording Rules

1. Define every abbreviation or acronym at first appearance in:
   - the abstract
   - the main text
   - the first figure or table part where it appears
2. Prefer wording such as:
   - `分析了xx`
   - `形成了xx`
   - `验证了xx`
   - `建立了xx`
   - `研究了xx`
   - `构建了xx`
3. Avoid `可能` when it expresses unsupported guessing.
4. Avoid `例如` when it turns a general statement into a selective and incomplete one.
5. Write `本文` / `本章` / `本节`; do not write `本研究`.
6. In Chinese, reduce weak verbs such as `分析` and `选取` when `引入`、`研究`、`建立`、`构建` or other stronger verbs are more accurate.
7. In Results, Discussion, and Conclusion, restrained wording such as `有效` and `准确` is acceptable when supported by evidence.
8. In Method and research-path description, do not use self-evaluative terms such as:
   - `系统`
   - `全面`
   - `综合`
   - `有效`
9. Reduce qualitative prose. Depth should come from quantitative evidence, figures, tables, formulas, and multi-layer study of the research object.
10. Keep all text centered on the paper's main research subject; do not drift into disconnected side comments.
11. Basic disciplinary knowledge does not need extended explanation.
12. Emphasize only the formulas, assumptions, and report content actually needed by this paper.
13. Do not expand famous standard formulas or generic ML formulas unless the paper directly relies on them.
14. Compress report-style text and purely descriptive statistical narration.
15. Avoid repeating background, problem, and significance statements across sections.
16. Important innovation terms, conclusion terms, and professional keywords should appear in earlier headings when appropriate so they can be traced structurally.

## Reference Rules

1. Use real, verified references only.
2. Store references in a dedicated `.bib` file.
3. When references need to be found, expanded, or verified, use upstream `deep-research`; do not fabricate papers.
4. Do not list references unrelated to the paper.
5. Chinese references should target strong journals, ideally `卓越期刊` level or above.
6. English references should preferentially avoid OA-only and MDPI venues when stronger alternatives exist, and should prefer stronger journals such as Q2 or above, or IF > 5 where appropriate.
7. Do not cite trivial common knowledge.
8. Every applied method must be cited.
9. Every cited standard, parameter choice, threshold, and numeric selection basis must be cited.
10. References to equations and second-level figure/table titles must correspond concretely to the body text; if an equation or figure is cited, it must visibly exist in the paper.

## Heading Rules

### Level 1

- The chapter topic must be clear
- The research object should be identifiable
- Verbs are allowed where helpful

### Level 2

- Used for module division
- Verbs are allowed
- Innovation-related headings should explicitly surface the key construct when useful, such as `xxx模型构建`
- The research object may be omitted if clarity remains strong

### Level 3

- Used for specific steps
- Must contain an action verb
- The research object may be omitted if clarity remains strong

### Depth Limit

- Do not use level-4 headings or deeper

## Formatting Rules

### Whole Paper

1. Title: Xiao Er, Songti, bold
2. Level 1 heading: size 4, Songti, bold
3. Level 2 heading: Xiao 4, Heiti, bold
4. Level 3 heading: Xiao 4, Songti, bold
5. Do not use heading levels below level 3
6. Enumerated points use `（1）`, `（2）`, ...
7. Process modeling content uses `step 1: ...`
8. If many symbols are used, create a dedicated symbol table for clarity and usability

### Figures

1. Use JPG or PNG
2. Under single-page layout, unify figure length to 9 cm
3. Use Songti / Times New Roman as required by the paper language and layout rules
4. Figure titles should make the content recognizable and should ideally express several 5W dimensions:
   - who
   - where
   - what
   - how
   - why
5. Every figure must have explanatory text in the main text
6. Subfigure names should be marked after the figure title where relevant
7. Parameters, environments, or settings may be stated in the title where useful

### Tables

1. Experimental result decimals must be unified to four decimal places
2. Table titles should foreground what is being compared or demonstrated

### Equations

1. Equation size and presentation should be consistent throughout the paper
2. Running-text equations should use direct English symbols to keep line spacing consistent
3. When an equation is introduced, also state the assumptions or prerequisites actually needed by the paper

## Anti-Fabrication and Anti-Noise Rules

1. Do not invent papers, venues, years, DOIs, or impact signals.
2. Do not use encyclopedic filler where the field already knows the basics.
3. Do not turn the paper into a report with large blocks of non-analytical description.
4. Do not over-explain someone else's formula when only the used component matters.
5. Do not use narrow examples as if they represented the entire phenomenon.

## Innovation Rules

1. Innovation belongs in the introduction for this track.
2. Focus on technical innovation in:
   - research object
   - method
   - solved problem
   - achieved effect
3. Include quantified support where possible.
4. Do not call simple method stacking a new method.
5. Avoid inflated wording such as:
   - `一套`
   - `全面`
   - `系统`
