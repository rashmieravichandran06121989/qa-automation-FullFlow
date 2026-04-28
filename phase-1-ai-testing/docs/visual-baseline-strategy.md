# Visual baseline strategy (Applitools)

The audit flagged "no baseline branching strategy" as a P0 — easy to wire
Eyes, hard to govern it across a team. This document is the team contract.

## Branching model

| Branch type           | `APPLITOOLS_BRANCH`         | `APPLITOOLS_PARENT_BRANCH` | Behaviour |
|-----------------------|-----------------------------|----------------------------|-----------|
| `main`                | `main`                      | `main`                     | New baselines auto-saved. This is the source of truth. |
| Feature branch (PR)   | `<head_ref>` (e.g. `feat/x`) | `main`                     | Diffs against `main`. New differences require human review in the Applitools dashboard before the PR can merge. |
| Hotfix off `main`     | `<head_ref>`                | `main`                     | Same as feature. |
| Release branch        | `release/<version>`         | `main`                     | Branch baseline forks; subsequent patches in that release line diff against the release baseline, not `main`. |

The master pipeline injects these env vars (see
`.github/workflows/master-pipeline.yml`, the `ai-testing` job). No test code
touches them — branch-aware baselining is a CI concern.

## Reviewer workflow

When Applitools surfaces a diff:

1. The PR author opens the Applitools batch URL (linked from the
   `portfolio-reporter` summary in the PR comment).
2. For each diff, the reviewer answers:
   - **Intentional change?** Accept → new baseline for this branch.
   - **Unintended regression?** Reject → fix code, push again.
   - **Dynamic content?** Add a `Region` ignore → commit the config change.
3. Until every diff is decided, the PR stays blocked. We rely on the
   Applitools "unresolved diffs" status check feeding GitHub's required-checks
   list — see Applitools admin → Apps & Integrations → GitHub.

## What we explicitly do *not* do

- **Auto-accept diffs in CI.** Defeats the point of visual testing.
- **Branch-baseline new features.** The PR author should diff against
  `main` even if it means many "expected" diffs land in the first PR — those
  decisions deserve to be visible in the audit log.
- **Suppress diffs by tightening match levels.** If `Strict` is too strict,
  the right answer is a `Region` exclusion, not `Layout` mode for the whole
  scenario.

## Promoting a baseline change

If `main`'s visual baseline genuinely needs to change (e.g. a brand refresh
landed), the change is reviewed once on `main` after merge. Rolling back is
a `Reset baseline to <commit>` action in the Applitools dashboard — there's
no git artefact to revert. This asymmetry is intentional: visual baselines
are a metadata system, not a code system.

## Local development

Developers running locally without `APPLITOOLS_BRANCH` set will diff against
the personal default branch in their Applitools account. That's fine for
exploration but **never** publish from local — only CI publishes to the
Applitools account that backs the team's status checks. The fixture in
`fixtures/index.ts` enforces this by reading `APPLITOOLS_BATCH_ID` only when
`process.env.CI` is set.
