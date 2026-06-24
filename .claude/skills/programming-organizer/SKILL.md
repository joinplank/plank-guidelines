---
name: programming-organizer
description: >-
  Spec-driven orchestrator. Triggered by "run specs" or /programming-organizer [spec-name].
  Reads spec files from specs/, then runs CodeAgent → TestAgent → ReviewAgent in sequence
  and writes an HTML report to reports/. Use when a spec is ready to implement.
---

# Programming Organizer

Orchestrates spec-driven development: one spec file → three focused agents → one HTML report.

## Trigger

The user says **run specs** or invokes `/programming-organizer [spec-name]`.

- If `$ARGUMENTS` is provided, locate `specs/$ARGUMENTS.md` or the closest match.
- If no argument is given, find all specs in `specs/` that do not yet have a corresponding report in `reports/`. Process them in creation-date order (oldest first).

## Step 0 — Locate and validate the spec

Read the target spec file. A valid spec must contain at least:
- A **Goal** section describing what to build
- **Acceptance criteria** (numbered or bulleted)
- A **Constraints / Context** section

If any section is missing, stop and ask the user to complete the spec before continuing. Do not proceed with an incomplete spec.

Extract the **Tracker** field if present (Linear or Jira issue). It is optional — never block or warn if absent. If found, store it for inclusion in the report header and the print summary.

Print a one-line summary: `▶ Running spec: <filename> — <goal headline>` (append `[<tracker-id>]` if a tracker link was found).

## Step 1 — CodeAgent (Implement)

Delegate to the `code-agent` subagent:

```
Use the code-agent subagent to implement the spec at specs/<filename>.md.
Pass it the full spec content. It should explore the codebase first, then implement.
```

The CodeAgent will:
1. Read the spec and all files it references
2. Explore relevant existing code (service, repo, route layers)
3. Implement the feature following Plank backend/frontend guidelines
4. Make a git commit with a descriptive message

Wait for the CodeAgent to finish. Collect its output summary (files changed, what was implemented).

**On failure:** If CodeAgent exits with unresolved errors, stop the pipeline and report the failure. Do not continue to TestAgent.

## Step 2 — TestAgent (Verify)

Delegate to the `test-agent` subagent:

```
Use the test-agent subagent to write and run tests for the implementation
described in specs/<filename>.md. It should test behavior through public interfaces.
```

The TestAgent will:
1. Read the spec acceptance criteria
2. Write tests that map 1:1 to each criterion (no more, no fewer)
3. Run the test suite and confirm all tests pass
4. Report the count of tests added and the pass/fail result

**On failure:** If tests fail after two fix attempts, continue to ReviewAgent but flag the failure in the report.

## Step 3 — ReviewAgent (Audit)

Delegate to the `review-agent` subagent:

```
Use the review-agent subagent to review the implementation against specs/<filename>.md.
Check every acceptance criterion, look for scope creep, and verify guideline compliance.
```

The ReviewAgent will:
1. Read the spec and the full git diff since the spec was started
2. Verify each acceptance criterion is met
3. Flag any files changed outside the expected scope (scope creep)
4. Check compliance with Plank guidelines (clean architecture, types, no raw SQL, etc.)
5. Return a structured finding list: `{ criterion, status: "met" | "partial" | "missing", note }`

## Step 4 — Generate HTML report

Write the report to `reports/<spec-name>_report.html` using the Plank design system (same CSS variables and component patterns as the guidelines HTML files).

The report must include:

### Report sections

**Header**
- Eyebrow: `Spec Report · <date>`
- Title: the spec goal headline
- If a tracker link is present, render it as a clickable pill below the title (Linear purple `#5E6AD2` or Jira blue `#0052CC` based on the URL domain). If absent, omit the pill entirely — do not show an empty placeholder.
- Summary strip (4 cells): Spec file · Date run · Test result (PASS/FAIL) · Review status (✓ / ⚠ issues)

**Section 01 — Spec**
- Full goal, acceptance criteria, and constraints rendered as cards

**Section 02 — Implementation**
- Files changed (as a code block)
- Key decisions the CodeAgent made
- Git commit reference

**Section 03 — Tests**
- Count of tests added
- Each test name mapped to its acceptance criterion
- Pass/fail badge per criterion

**Section 04 — Review findings**
- Table: Criterion | Status | Note
- Status badges: `met` (green), `partial` (oat), `missing` (clay/red)
- Scope creep list (if any)
- Guideline violations (if any)

**Section 05 — Open items**
- Anything from the spec that was deferred, flagged, or needs follow-up

### Report CSS

Use the exact same design tokens as the project guidelines:

```
--ivory:#FAF9F5  --slate:#141413  --clay:#D97757  --oat:#E3DACC
--olive:#788C5D  --gray-150:#F0EEE6  --gray-300:#D1CFC5
```

Reuse the `.sec-head .num`, `.summary .cell`, `.risks .row`, and `.sev` badge patterns from the existing HTML files. The report should be self-contained (no external dependencies).

## Step 5 — Print summary

After writing the report, print a summary block:

```
▶ Spec:     specs/<filename>.md
  Tracker:  <tracker-id and URL>             (omit this line if no tracker was set)
✓ Code:     <N> files changed — <commit-sha>
✓ Tests:    <N> added, all passing          (or ✗ <N> failing)
✓ Review:   <N>/<total> criteria met        (or ⚠ <N> issues)
→ Report:   reports/<spec-name>_report.html
```

## Spec file format

When the user asks you to create a new spec, use this template:

```markdown
# <Feature name>

## Goal
One sentence describing what this spec builds and why.

## Tracker
<!-- optional: Linear or Jira issue linked to this spec.
     Accepts an issue ID (ENG-123, PROJ-456) or a full URL.
     Leave blank or delete this section if not applicable. -->

## Acceptance criteria
1. <Verifiable criterion — user-facing behavior>
2. <Verifiable criterion>
3. ...

## Constraints / Context
- Relevant files: `src/modules/foo/`
- Must not break: `<existing behavior>`
- Tech constraints: <e.g. no new dependencies, must use existing Prisma client>
- Related: <links to issues, PRs, or other specs>

## Out of scope
- <Explicitly excluded items to prevent scope creep>
```

## Rules

- Never skip a step. CodeAgent → TestAgent → ReviewAgent is always the full sequence.
- Never implement code yourself — delegate to CodeAgent. Do not write a single source file directly.
- Never write tests yourself — delegate to TestAgent.
- If a spec has no acceptance criteria, refuse to run and ask the user to add them.
- Each agent runs in isolation — pass the full spec content in the delegation prompt, not a reference.
- The HTML report is always written even if a step failed; failures are reported in the report.
- On success, all three agent outputs must be summarized in the final print block.
