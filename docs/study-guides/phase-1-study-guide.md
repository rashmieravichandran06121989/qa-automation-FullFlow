# Phase 1 Study Guide — AI-Assisted Testing

A line-by-line walkthrough of the **qa-ai-automation-framework** Phase 1 deliverable.

> Applitools Eyes  ·  Mabl / Testim  ·  GitHub Copilot  ·  Playwright  ·  Cucumber BDD

**Author:** Rashmie Eravichandran
**Repository:** `qa-ai-automation-framework`
**Last updated:** 25 April 2026

---

## Table of Contents

- [How to Use This Guide](#how-to-use-this-guide)
- [Part I  ·  The Phase 1 Roadmap](#part-i--the-phase-1-roadmap)
- [Part II  ·  Concept Chapters](#part-ii--concept-chapters)
  - [Chapter 1 — Visual AI Testing with Applitools Eyes](#chapter-1--visual-ai-testing-with-applitools-eyes)
  - [Chapter 2 — Self-Healing AI: Mabl, Testim, and Why They Were Dropped](#chapter-2--self-healing-ai-mabl-testim-and-why-they-were-dropped)
  - [Chapter 3 — GitHub Copilot for QA](#chapter-3--github-copilot-for-qa)
  - [Chapter 4 — Deep Practice: Combining the Three Tools](#chapter-4--deep-practice-combining-the-three-tools)
  - [Chapter 5 — Polish, README, and the Public Artefact](#chapter-5--polish-readme-and-the-public-artefact)
- [Part III  ·  Annotated Repository Walkthrough](#part-iii--annotated-repository-walkthrough)
- [Part IV  ·  Exercises](#part-iv--exercises)
- [Part V  ·  Glossary, Cheatsheet, Troubleshooting](#part-v--glossary-cheatsheet-troubleshooting)

---

## How to Use This Guide

This guide is split into five parts so you can read it the way you learn best.

- **Part I — Phase 1 Roadmap.** A two-page recap of the original 10-day plan and how each row maps onto the repository you built.
- **Part II — Concept Chapters.** One chapter per Phase 1 row. Each chapter follows the same shape: What it is → Why it matters → How it shows up in this repo → Pitfalls → Exercises.
- **Part III — Annotated Walkthrough.** Folder-by-folder, file-by-file, line-by-line. Read top to bottom and you will have read every meaningful character of the framework.
- **Part IV — Exercises.** Self-graded drills + a capstone task that asks you to extend the suite to a third demo target.
- **Part V — Glossary, Cheatsheet, Troubleshooting.** Look-up reference for terms, npm scripts, env vars, and common failure modes.

> **Recommended reading order**
> First pass — Part I, then Chapter 1 of Part II (Applitools), then the matching files in Part III. Repeat for each subsequent chapter.
> Second pass — read Part III straight through. By now the concepts are settled, so the walkthrough reinforces them in context.
> Third pass — work the exercises in Part IV. Resist looking back; that is the whole point.

---

## Part I  ·  The Phase 1 Roadmap

Phase 1 of the upskilling plan was a 10-day sprint with a single mandate: stop using AI testing tools experimentally and start using them professionally. Every day had a deliverable that could be pointed at on a public GitHub repo. This part recaps the plan and shows where each row landed in the repository.

### The original ten-day plan

| Days | Focus | Activity | Status |
| ---- | ----- | -------- | ------ |
| 1–2  | Applitools Eyes | Visual AI testing — integrate with the existing Playwright setup. | Done |
| 3–4  | Mabl / Testim   | Explore self-healing tests and how AI handles flaky selectors. | Done — both rejected, written up. |
| 5–6  | GitHub Copilot  | Prompt engineering for test generation, edge cases, and test data. | Done |
| 7–8  | Deep Practice   | Combine Applitools + Copilot — build a full AI-augmented test suite. | Done — this is the entire repo. |
| 9    | Polish Repo     | Clean up GitHub repo, write detailed README, add screenshots. | In progress |
| 10   | Public Profile  | Publish LinkedIn article: 'How I use AI in my test suite' — builds visibility. | Pending |

### How the plan maps onto the repo

You can pin every row of the table above to a concrete location in the framework. The repository was scaffolded with this mapping in mind, so the README ends with an identical table — that table is the receipt.

| Day(s) | Lives in |
| ------ | -------- |
| **1–2  Applitools** | `applitools.config.ts`; `fixtures/index.ts` (the eyes fixture); `@visual`-tagged scenarios across SauceDemo + OrangeHRM. |
| **3–4  Mabl / Testim** | `README.md` → "What I tried and dropped" section. Code-free on purpose: the takeaway was a written verdict, not files. |
| **5–6  Copilot** | `.github/copilot-instructions.md` (the conventions file); `docs/copilot-prompts/` (six prompt receipts). |
| **7–8  Combined suite** | Everything else: `pages/`, `steps/`, `features/`, `fixtures/`, `tests/api/`. |
| **9  Polish** | `README.md` (top-level); `docs/screenshots/README.md` (capture checklist). |
| **10  Public** | External: a LinkedIn article that links back to the repo. The repo is the artifact; the post is the megaphone. |

### What "Phase 1 deliverable" actually means

A working 10-day sprint output is more than a folder of code. The deliverable is three artefacts that need to hang together:

1. **A clean repo.** typecheck, lint, format-check, and the BDD + API suites all green on a fresh clone.
2. **A README a hiring manager can scan in 90 seconds.** Architecture diagram, tech stack, run commands, screenshots, and a section that names the trade-offs you made.
3. **A LinkedIn post.** Public visibility — the receipt that you did the work.

The repo handles 1 and 2. The post is left as exercise 4.5 in Part IV. Reaching the point where the post writes itself is the real goal of the sprint, because by then you have lived with the problems long enough to have something to say.

---

## Part II  ·  Concept Chapters

Each chapter in this part is self-contained. Read one in isolation and you should walk away with the concept, the trade-offs, the relevant lines of code in this repo, and three or four exercises to lock it in.

### Chapter 1  ·  Visual AI Testing with Applitools Eyes

#### 1.1  The problem visual AI exists to solve

A traditional Playwright assertion checks the DOM. It can tell you that the element with selector `[data-test="title"]` contains the text "Products". It cannot tell you that the page logo is missing, that the wrong product image is being served, or that the inventory grid has shifted four pixels left on Firefox. Those are visual regressions — bugs that the DOM-aware assertion has no opinion on, because the DOM is fine.

Visual regression testing is the practice of detecting these bugs by comparing rendered screenshots against an approved baseline. Old-school visual testing was pixel-by-pixel — every anti-aliased font edge produced a "diff", every notification bubble triggered a false positive, and the tests were so noisy nobody trusted them. Visual AI is the modern fix: a service that ignores irrelevant rendering noise (font hinting, sub-pixel rounding, animation frames) and surfaces only meaningful changes.

> **The two-line summary**
> Functional assertions catch what the developer told you to check. Visual AI catches everything else — including bugs the developer never thought to write a test for.

#### 1.2  Applitools Eyes — the moving parts

Applitools Eyes has four concepts that you must know cold to make sense of the code in this repo:

| Term | Meaning |
| ---- | ------- |
| **Checkpoint** | A single visual check at one point in a test, e.g. "the cart page after adding a backpack". Created by calling `eyes.check(name)`. |
| **Baseline** | The first time a checkpoint runs, the rendered output becomes the baseline. Subsequent runs compare against it. Baselines are stored in the Applitools cloud, not in your repo. |
| **Batch** | A group of checkpoints from one test run. Lets the dashboard group everything from a single CI build under one URL. |
| **Diff (Unresolved)** | The dashboard term for "this checkpoint does not match its baseline". A human reviewer either accepts (the change is intentional, baseline updates) or rejects (the change is a bug). |

You will see all four in the code. `applitools.config.ts` constructs the Configuration object that controls them; `fixtures/index.ts` opens an Eyes session per scenario and exposes a `check()` method to step definitions; step files call `eyes.check("name")` at the relevant point.

#### 1.3  Ultrafast Grid — why this is fast

A naive visual test would launch Chrome, take a screenshot, launch Firefox, take another, launch Safari Mobile, take a third — and pay the browser-launch cost three times per checkpoint. The Ultrafast Grid (UFG) flips that. Your test takes one DOM snapshot, ships it to the Applitools cloud, and the cloud renders that snapshot against three browsers in parallel server-side. You get cross-browser visual coverage without paying for a real cross-browser run on your machine.

The implication for this repo: even though only the chromium project runs visual checks locally, the dashboard shows Chrome, Firefox, and Safari Mobile diffs for every checkpoint. The "browsers" you see in `applitools.config.ts` (`BrowserType.CHROME`, `FIREFOX`, `SAFARI`) are UFG render targets, not local browsers.

#### 1.4  How visual checks live in this codebase

Three files own the Applitools surface. Read them in this order:

1. `applitools.config.ts` — declares the batch, validates the API key, and builds the Configuration (which browsers to render, app name, batch handle).
2. `fixtures/index.ts` — the eyes fixture. Opens an Eyes session lazily on first `check()`, closes it cleanly on teardown, and no-ops when the API key is missing.
3. `steps/**/*.steps.ts` — the only place `eyes.check("name")` is called. Step defs stay one-liners; lifecycle lives in the fixture.

A bird's-eye view of the call flow:

```
feature file               → "the SauceDemo login page matches the visual baseline"
step def (steps/...)       → await eyes.check("SauceDemo — inventory after login")
eyes fixture (fixtures/...)→ openEyes() once, then eyes.check() for every call
applitools.config.ts       → buildEyesConfig() supplies the batch + browsers + key
Applitools UFG cloud       → renders DOM snapshot in Chrome / Firefox / Safari Mobile
Applitools dashboard       → diff vs baseline, marked Unresolved if changed
```

#### 1.5  Why `eyes.close(false)` and not `close(true)`

Applitools exposes two close modes. `close(true)` throws an error if the session has unresolved diffs — the test goes red. `close(false)` returns the result without throwing — the test stays green and the diff is reviewed in the dashboard.

This repo deliberately uses `close(false)`. The reasoning is in the README: visual diffs are reviewed by a human in the Applitools UI, not by Playwright. A diff is not always a bug — sometimes it is an intentional design change, and the right action is "Accept and update baseline". Letting `close(false)` flow through means the CI test result reflects only functional correctness; visual review happens out-of-band against the same batch URL.

> **Pitfall**
> If you flip `close(true)` on by mistake, every visual scenario goes red on the first design tweak — even when the change is correct. You will then disable visual checks across the suite and lose all the value. Keep `close(false)`.

#### 1.6  Graceful degradation when the key is missing

The repo runs visually for contributors with an `APPLITOOLS_API_KEY` and runs functionally for everyone else. Three guards make that possible:

- **`visualEnabled`** (in `applitools.config.ts`) is the gate. It checks for a key, rejects the placeholder string, and applies a regex to make sure the key is alphanumeric — that catches the "I left quotes around it in .env" case.
- **`eyes.check()`** (in `fixtures/index.ts`) returns immediately without opening a session when `visualEnabled` is false. The lazy open means a scenario with no `check()` calls never opens an Applitools session at all.
- **`eyes.close(false).catch(() => undefined)`** on teardown — even if close throws (e.g., expired key, network blip), the test does not fail because of it.

A visual test that fails the build because someone forgot to set an env var has crossed a line from useful to actively harmful. Lift this design decision into your professional toolkit.

#### 1.7  Pitfalls

- **Implicit baselines.** The first run of a checkpoint becomes the baseline silently. If you run a buggy build first, the bug is now the baseline. Treat the first run as a calibration pass — review every checkpoint in the dashboard before you trust the next run.
- **Locale and timezone drift.** A page that renders the user's name in a header will diff every test run if the data is faked. Pin those values, or mark the region as ignored in Eyes.
- **Animations.** A loading spinner halfway through its rotation is a visible diff. Wait for the page to settle before calling `check()`, or use Eyes layout regions for the dynamic part.
- **Dashboard hygiene.** Without a batch name, every checkpoint is a separate review. The repo names the batch in `applitools.config.ts` so all SauceDemo + OrangeHRM checkpoints from one CI run land under one URL.

#### 1.8  Exercises

1. Add a fifth visual checkpoint to `features/saucedemo/03-cart-checkout.feature` on the order-overview page (after "User continues to the order overview"). Wire the matching step def. Verify the dashboard shows it under the existing batch.
2. Modify `applitools.config.ts` to add a fourth UFG browser (e.g., Chrome at iPad viewport 1024×768). Run the suite and confirm the dashboard shows the new browser tile alongside Chrome / Firefox / Safari Mobile.
3. Trigger a deliberate diff: hardcode a CSS override in `playwright.config.ts` (`use.colorScheme = 'dark'`), run the visual suite, then walk the dashboard diff workflow (Accept / Reject) for each checkpoint.
4. Self-check: explain in two sentences why `fixtures/index.ts` opens Eyes lazily on the first `check()` instead of in `beforeEach`.

---

### Chapter 2  ·  Self-Healing AI: Mabl, Testim, and Why They Were Dropped

#### 2.1  What "self-healing" means

A self-healing test framework treats locators as best-effort. When the developer ships a button rename — class `.btn-primary` becomes `.button-primary`, or `id=submit` becomes `id=submitButton` — a brittle Playwright test breaks immediately because the selector returns nothing. A self-healing tool pretends nothing happened: it inspects the surrounding DOM, finds the most likely replacement element, and re-pins the selector for the next run.

The pitch is real. Selector maintenance is the tax on UI automation. Anything that reduces it sounds attractive. The catch is what the heuristic costs you, and which world you live in.

#### 2.2  Mabl — the cloud-runner model

Mabl is a SaaS that records browser sessions, infers locators from layout + text + attributes, and runs the resulting flows from Mabl-managed cloud workers. The self-healing happens because Mabl carries multiple "fingerprints" per element and replays in priority order until one matches.

- **Strengths.** Genuinely strong on legacy codebases where you do not own the locators — typical Salesforce / SAP scenarios, government portals, vendor systems where you cannot ask devs to add `data-test` attributes.
- **Weaknesses.** Cloud-runner-per-project pricing model. The tool wants to live in its own UI, not your repo. Hard to wire into a public portfolio repository where any reviewer can clone and run.

#### 2.3  Testim — record-and-playback with AI fingerprints

Testim recorded actions and used a Tricentis-acquired ML model to lock down element identity. Same idea as Mabl but more record-first; you click through the app, it produces the test.

- **What broke.** Attribute-based fingerprints died the moment a Vue component re-rendered and produced new generated class names. The "self-healing" worked once or twice and then gave up.

#### 2.4  The verdict written into this repo

The README's "What I tried and dropped" section is the deliverable for Days 3–4. The reasoning, paraphrased:

> **From the README**
> When you own the locators, stable `data-test` attributes plus Playwright's auto-retry plus Applitools layout matching cover the same ground without an external dependency.

That is the tradeoff that matters. Self-healing is a workaround for the fact that you do not control the front-end. Once you do — and you can ask devs for stable hooks — the workaround becomes net-negative: it hides honest selector regressions you would prefer to surface.

#### 2.5  When you would still pick a self-healing tool

1. Vendor-controlled UI you cannot modify (e.g., Salesforce, ServiceNow, Workday).
2. Legacy app where adding `data-test` means convincing a team that does not exist anymore.
3. Manual QA team building tests without TS/JS skill set, where the record-and-playback workflow is the on-ramp.

None of those are this repo. Hence: rejected, with reasoning written down.

#### 2.6  Exercises

1. Open the SauceDemo cart-page POM. Replace every `[data-test="..."]` selector with a CSS class selector (e.g., `.cart_button`). Run the suite. Note which scenarios break first and why.
2. Reverse the change. Time how long the round-trip took. That is your "what self-healing buys you" budget — multiplied by every selector and every redeploy.
3. Write three sentences explaining when self-healing is worth its trade-offs and when it is a tax. Reference a real product you have tested.

---

### Chapter 3  ·  GitHub Copilot for QA

#### 3.1  Two ways Copilot fails

Copilot defaults to "average open-source code". Average open-source code uses CSS class selectors, mixes Playwright + Cypress idioms, hardcodes credentials, and pulls Faker v8 names that have been deprecated for two years. Without intervention, every completion is a small style regression you have to undo.

There are two interventions in this repo, and both are committed alongside the code:

1. **A conventions file.** `.github/copilot-instructions.md` — Copilot reads this automatically on repo open. Pins locator strategy, actor naming, import paths, the data-source rule.
2. **A prompt library.** `docs/copilot-prompts/` — six markdown files documenting the prompts that produced the framework, what came back the first time, what needed a second pass, and the lesson that stuck.

> **The 20-minute rule**
> Twenty minutes spent writing the conventions file before the first prompt saved correction time on every completion after. If you only do one thing differently when you next start a Copilot-assisted project, do this.

#### 3.2  What lives in the conventions file

You can rebuild the file from this checklist:

- **Locator strategy per target.** "SauceDemo: `[data-test=...]` only. OrangeHRM: `getByRole` / `getByPlaceholder` / `getByLabel`. Never CSS classes, never XPath."
- **Actor and naming.** "User" as the actor in Gherkin, never "tester" or "I". Files in kebab-case, classes in PascalCase, prefixes by target (`sauceLoginPage`, `orangeLoginPage`).
- **Import paths.** Step defs import `{ Given, When, Then }` from `"../../fixtures"` — never from `"playwright-bdd"` directly. POMs import `{ BasePage }` from `"../base-page"`.
- **Data-source rule.** Anything not under test goes through `fixtures/data-factory.ts`. No inline Faker calls in step defs.
- **Assertion style.** `toBe` for exact strings, `toMatchObject` for response shapes, `expect.objectContaining` for "these fields exist" without caring about extras.

#### 3.3  The six prompt patterns

`docs/copilot-prompts/` holds six receipts. They are organised by layer — POMs, features, step defs, test data, API tests, Applitools. The lessons are interchangeable: name the primitive, ask for edge cases by name, list the import paths, paste a usage example.

| File | What it covers + lesson |
| ---- | ---------------------- |
| `01-page-objects.md` | POM scaffolding for SauceDemo + OrangeHRM. **Lesson:** name the primitive (`getByRole`, `getByPlaceholder`) — vague guidance produces CSS selectors. |
| `02-feature-files.md` | Gherkin with positive + negative + edge in one shot. **Lesson:** ask for the negative scenarios by name; Copilot writes happy-path by default. |
| `03-step-defs.md` | Step defs bound to injected POMs. **Lesson:** pin import paths and fixture shape in the prompt — without that, you get `@cucumber/cucumber` imports and inlined `new POM(page)` calls. |
| `04-test-data.md` | Faker builders with override support. **Lesson:** show the call site (`buildCheckoutInfo({postalCode: ""})`) — Copilot writes builder patterns well when you demonstrate the usage you want. |
| `05-api-tests.md` | `APIRequestContext` tests. **Lesson:** assert status code AND body shape every time. Copilot guesses at response payloads otherwise. |
| `06-applitools-integration.md` | Eyes fixture lifecycle. **Lesson:** keep guards out of step defs; the fixture owns the lifecycle. |

#### 3.4  How to read a prompt receipt

Each prompt file follows the same shape:

1. The exact prompt sent (in a fenced block).
2. What Copilot returned the first time. Sometimes correct, sometimes not.
3. Iterations needed — what was wrong, how the prompt was reshaped, what landed on the second attempt.
4. "What I took away" — the durable lesson, in two or three sentences.

That structure is portable. You can use it on any project where Copilot or another LLM-driven assistant is part of the workflow. The receipts double as onboarding for the next maintainer.

#### 3.5  Pitfalls

- **Forgetting Copilot is stochastic.** Two identical prompts produce two slightly different completions. Pin what you can in the conventions file; tolerate the rest.
- **Letting Copilot drift the style.** A team without a conventions file ends up with three different testing styles in the same repo within a month. Lock it before you accept the first suggestion.
- **Trusting the first draft on negative cases.** Edge cases is exactly where Copilot guesses the most. The whole reason every prompt in `docs/copilot-prompts/` spells out the failing inputs is that the first draft never has them.
- **Pasting credentials into prompts.** Anything you type into Copilot Chat may be logged. Use placeholders ("the password env var") and let credentials flow through `config/credentials.ts` at runtime.

#### 3.6  Exercises

1. Read `docs/copilot-prompts/01-page-objects.md` and reproduce the SauceDemo login POM prompt against a fresh file. Compare the output against `pages/saucedemo/login-page.ts`. Note the differences and explain each.
2. Write a fresh prompt to add a POM for the OrangeHRM Time Tracking module (`/.../time/viewMyTimesheet`). Apply the lessons from the file 01 prompt — name the primitives, list the methods, give an example usage.
3. Add a seventh prompt receipt under `docs/copilot-prompts/07-accessibility.md` describing how you would prompt Copilot to add axe-core accessibility checks. Use the same shape as the existing six.
4. Self-check: in one paragraph, describe the difference between a "conventions file" and a "prompt template", and explain why this repo has both.

---

### Chapter 4  ·  Deep Practice: Combining the Three Tools

#### 4.1  The architecture in one paragraph

TypeScript on Node 20 LTS. Playwright 1.44 as the runner. playwright-bdd 8.5 turns `.feature` files into Playwright tests so you keep native parallelism, traces, and the UI-mode debugger. Page objects sit underneath; a fixture file extends Playwright's `test` with one POM per page plus an Applitools eyes wrapper. Faker drives test data via builders. OrangeHRM cookies are cached by `globalSetup` so scenarios start pre-authenticated. ESLint + Prettier on the quality side; GitHub Actions runs a quality gate then a three-browser matrix on every push to main.

#### 4.2  Layer cake

Read top-down — each layer only sees the layer below.

```
┌──────────────────────────────────────────────────────────────────┐
│  features/  (.feature files in Gherkin)                          │
│    Read by product folks. Written in plain English.              │
├──────────────────────────────────────────────────────────────────┤
│  steps/  (TypeScript step definitions)                           │
│    Bind Gherkin phrases to fixture-injected POMs. One-liners.    │
├──────────────────────────────────────────────────────────────────┤
│  fixtures/  (test extension, eyes wrapper, data factory)         │
│    Composes POMs + Applitools into the playwright-bdd test obj.  │
├──────────────────────────────────────────────────────────────────┤
│  pages/  (POM classes)                                           │
│    Encapsulate selectors and actions. Constructor takes Page.    │
├──────────────────────────────────────────────────────────────────┤
│  config/  +  applitools.config.ts  +  playwright.config.ts       │
│    Wires everything to Playwright + Applitools + Node env vars.  │
└──────────────────────────────────────────────────────────────────┘
```

#### 4.3  Why Page Object Model

POM keeps selectors out of test bodies. The first time SauceDemo redeploys and changes a `data-test` value, you change one line in `pages/saucedemo/inventory-page.ts` and every scenario that touches the inventory grid is fixed. Without POM, the same change would mean a grep-and-replace across every step file.

A POM in this repo has three rules: locators are `readonly` class properties; actions return `Promise<void>`; getters return `Promise<T>`. `base-page.ts` holds shared helpers (`waitForVisible`, the OrangeHRM-specific `inputInGroup`) so individual POMs do not reinvent them.

#### 4.4  Why playwright-bdd over native Cucumber

Two ways to run Cucumber-style tests in TypeScript: `@cucumber/cucumber` (the classic library) or `playwright-bdd` (a layer on top of Playwright). This repo picks the second.

- **Native parallelism.** playwright-bdd compiles features into Playwright test objects, so the Playwright runner schedules them. `workers=5` just works.
- **Native traces.** Trace files, screenshots on failure, video on retry — everything Playwright records by default works without extra wiring.
- **UI-mode debugger.** `npx playwright test --ui` shows `.feature` files in the same explorer as native tests; you can replay scenarios step by step.
- **Single test runner.** No second runner to configure. ESLint, format-check, and CI all see one project.

The cost is one indirection: features compile into `.features-gen/` before running. The npm scripts run `npx bddgen` before `npx playwright test` for that reason.

#### 4.5  Why Faker through builders

Two failure modes a real automation suite hits within six months: hardcoded test data ages badly (every scenario uses "Jane Doe", and bugs that only happen with non-ASCII names never surface), and inline Faker calls scatter randomness across the codebase (every reviewer has to reason about which fields are pinned and which are random in every file).

Builders solve both. `fixtures/data-factory.ts` has one function per data shape. Each takes a `Partial<T>` override. Scenarios that pin a single field (postal code = "" for the missing-postal-code edge case) show that pin in the call site; everything else stays randomized. The reviewer reads the override and immediately sees what the scenario is testing.

#### 4.6  Why globalSetup caches the OrangeHRM cookie jar

OrangeHRM's public demo throttles parallel sessions. A 23-scenario suite that re-logs-in before every scenario hits a wall around the third or fourth concurrent worker. `fixtures/orange-storage-state.ts` logs in once via `globalSetup`, persists the cookie jar to `.auth/orangehrm.json`, and Playwright's `storageState` config seeds every BDD context from that file. Per-scenario login drops from ~20s to ~4s.

The fallback matters. If the demo is unreachable when `globalSetup` runs, the function still writes an empty `{cookies: [], origins: []}` state — Playwright throws on context creation if `storageState` points at a missing file. Inside the shared "User is logged in to OrangeHRM as ..." step, a guard checks whether the dashboard is already loaded; if not, it falls back to UI login. Either path arrives at the dashboard, so scenarios are robust to a stale cache.

#### 4.7  Why two demo targets

SauceDemo is the visual-AI showcase: `problem_user` and `visual_user` ship with bugs that DOM assertions cannot see. The whole Applitools pitch falls flat without an app whose bugs are visual.

OrangeHRM is the realistic enterprise target: dropdown-heavy forms, autocomplete typeaheads, search grids, an Angular-flavoured SPA with timing quirks. The same patterns recur in real HRMS / CRM / payroll systems. Practice on OrangeHRM transfers to those engagements.

Two targets prove the framework is portable, not glued to one app. Adding a third would mostly mean another POM folder and another set of step files; the fixture machinery does not change.

#### 4.8  Pitfalls of combining the three

- **Visual checks on flaky pages.** Calling `eyes.check()` before the page settles produces noisy diffs. Wait on a stable element first, then check.
- **Copilot writing the wrong import.** Even with the conventions file, Copilot sometimes drops `import { Given } from "playwright-bdd"`. The conventions file says "import from `../../fixtures`". Catch this in code review.
- **Faker drift across runs.** A scenario that fails 1 in 50 because the generated postal code happens to start with 0 is a real bug, not a flake. Faker does its job; the test must accept that randomness.

#### 4.9  Exercises

1. Trace the full execution path for one scenario: `features/saucedemo/01-login.feature` → "User logs in successfully as standard_user". Open every file the scenario touches, in execution order. Annotate each line that the scenario reaches.
2. Add a third demo target: PracticeSoftwareTesting (`https://practicesoftwaretesting.com`). Scaffold `features/pst/`, `pages/pst/`, `steps/pst/`. Reuse the conventions. Write one happy-path scenario end-to-end.
3. Switch one OrangeHRM scenario from `storageState` fast-path to UI login. Time both. Document the delta in `tasks/lessons.md` (create the file if it does not exist).

---

### Chapter 5  ·  Polish, README, and the Public Artefact

#### 5.1  What a hiring-grade README looks like

A README is read three ways: (1) by a hiring manager scanning for 90 seconds, (2) by a dev cloning the repo to run it, (3) by a future maintainer (you, six months from now) trying to remember what a decision was for. The repo's README serves all three with a fixed structure. Memorise it; reuse it.

1. One-paragraph intro that names the stack and the why.
2. "What's in the box" — a table of surfaces (UI, BDD, API), targets, coverage counts, wall-clock numbers.
3. Architecture diagram (mermaid renders inline on GitHub). One flow diagram, one sequence diagram showing the visual-regression pipeline.
4. Stack — TypeScript, Node, Playwright, playwright-bdd, Applitools, Faker, ESLint, Prettier, Allure, GitHub Actions.
5. "Two things worth calling out" — the design decisions you would defend in an interview. `storageState` fast-path and centralised credentials are the two highlighted here.
6. Verification — the local gate to run before push. Reproducible commands.
7. Run-locally-from-VSCode — clone, install, copy `.env.example`, `code .`. Three lines anyone can follow.
8. Screenshots — VSCode tree, terminal pass, Playwright report, Applitools dashboard, Applitools diff, Copilot suggestion, CI run.
9. "What I tried and dropped" — Mabl / Testim writeup. Shows judgment. Hiring panels read this before they read code.
10. Test coverage breakdown — one paragraph per surface (SauceDemo / OrangeHRM / API).
11. Copilot integration — what was committed and where, in two paragraphs.
12. Project layout — the file tree, annotated.
13. CI summary — workflow trigger, jobs, secrets.
14. Env vars table.
15. Troubleshooting — three or four real failure modes with diagnostics.
16. Phase 1 plan-to-repo mapping — proves the deliverable hits the spec.
17. "What's next" — next-sprint backlog. Shows you know what is missing.

#### 5.2  Why screenshots

A screenshot proves the suite ran on your machine. A README without them is a claim; with them it is evidence. The seven shots in `docs/screenshots/README.md` are the ones that have the highest signal: the tree (proves the layout matches the description), the terminal run (proves it goes green), the Playwright report (proves traces are wired), the Applitools dashboard (proves visual is real), the Applitools diff (the money shot — visual AI catching a real bug), the Copilot ghost text (proves you actually use Copilot), and the GitHub Actions matrix (proves CI is green across browsers).

> **Capture order**
> Take all seven in one sitting after a single clean run. Saving them across multiple runs invites visual drift between shots.

#### 5.3  Anatomy of the LinkedIn post

Day 10 is the megaphone. The post is short, opinionated, and points at the repo. A workable shape:

1. Hook — one-line claim. "Most QA roles I see ask for AI-augmented testing experience and most candidates have no portfolio piece for it."
2. What you built — one paragraph naming the stack.
3. What surprised you — name a real surprise. Conventions file vs. raw prompts is a strong candidate.
4. What you dropped — Mabl/Testim verdict in two sentences. Shows judgment.
5. Repo link, with the badge row and the README screenshot inline.
6. Call to action — invite questions or critique. Replies are the real growth signal.

#### 5.4  Pitfalls

- **Posting before the README is right.** Hiring managers click the link first. If the README looks unfinished, the post does too.
- **Hidden secrets.** Double-check `.env` is gitignored before push. Search the repo for the literal key string before publishing.
- **Stale screenshots.** A README that shows yesterday's test counts when the suite has grown loses trust. Re-shoot when the numbers change.

#### 5.5  Exercises

1. Re-read the repo's README and rate every section against the seventeen-item checklist in 5.1. List anything missing or out of order.
2. Capture the seven screenshots in `docs/screenshots/`. Compare yours to the README's expectations — do they all show what the README claims they show?
3. Draft the LinkedIn post (300–400 words). Save it as `tasks/linkedin-draft.md` (create the folder if needed). Reading the draft again the next day before posting is part of the exercise.

---

## Part III  ·  Annotated Repository Walkthrough

This part is a structured tour. Every folder has a sub-section; every file has a "what it is" sentence and a line-by-line breakdown of every meaningful line. Pay attention to "every line that produces an action".

### 3.1  The complete file tree

Files generated at runtime (`allure-report/`, `playwright-report/`, `test-results/`, `.features-gen/`, `.auth/`, `node_modules/`) are excluded; everything else is committed source.

```
qa-ai-automation-framework/
├── .claude/                            (local Claude Code permissions; not part of the suite)
│   └── settings.local.json
├── .env                                (gitignored — copy from .env.example)
├── .eslintrc.cjs
├── .gitignore
├── .github/
│   └── workflows/playwright.yml        (CI — quality gate + 3-browser matrix)
├── .prettierignore
├── .prettierrc
├── .vscode/
│   ├── extensions.json                 (recommended extensions)
│   └── settings.json                   (workspace settings)
├── README.md                           (the public face of the repo)
├── applitools.config.ts                (Eyes Configuration + visualEnabled gate)
├── config/
│   └── credentials.ts                  (env-overridable creds)
├── docs/
│   ├── copilot-prompts/                (six prompt receipts)
│   └── screenshots/                    (README hero shots)
├── features/
│   ├── orangehrm/                      (4 .feature files)
│   └── saucedemo/                      (4 .feature files)
├── fixtures/
│   ├── data-factory.ts                 (Faker builders)
│   ├── index.ts                        (test extension + eyes fixture)
│   └── orange-storage-state.ts         (globalSetup → caches Admin cookies)
├── package-lock.json
├── package.json
├── pages/
│   ├── base-page.ts                    (shared helpers)
│   ├── orangehrm/                      (5 POMs)
│   └── saucedemo/                      (4 POMs)
├── playwright.config.ts                (test runner config)
├── steps/
│   ├── orangehrm/                      (4 step files)
│   ├── saucedemo/                      (3 step files)
│   └── shared.steps.ts                 (cross-target Givens)
├── tests/
│   └── api/                            (jsonplaceholder REST tests)
└── tsconfig.json
```

### 3.2  Root configuration files

#### 3.2.1  package.json

The npm manifest. Names the project, declares dependencies, and exposes the scripts everyone runs. Notable lines below.

```json
{
  "name": "qa-ai-automation-framework",
  "version": "1.0.0",
  "engines": { "node": ">=20" },
  "scripts": {
    "test":              "npx bddgen && npx playwright test --project='bdd:chromium' --grep-invert @flaky",
    "test:bdd":          "npx bddgen && npx playwright test --project='bdd:chromium' --grep-invert @flaky",
    "test:api":          "npx playwright test --project=api",
    "report:allure":     "allure generate allure-results --clean -o allure-report && allure open allure-report",
    "report:allure:clean":"rm -rf allure-results allure-report",
    "lint":              "eslint . --ext .ts",
    "format:check":      "prettier --check \"**/*.{ts,js,json,md,yml,yaml}\"",
    "typecheck":         "tsc --noEmit"
  },
  "devDependencies": {
    "@applitools/eyes-playwright": "^1.37.0",
    "@faker-js/faker":              "^10.4.0",
    "@playwright/test":             "^1.44.0",
    "@types/node":                  "^20.0.0",
    "@typescript-eslint/eslint-plugin":"^7.0.0",
    "@typescript-eslint/parser":    "^7.0.0",
    "allure-commandline":           "^2.38.1",
    "allure-playwright":            "^3.7.1",
    "dotenv":                       "^17.3.1",
    "eslint":                       "^8.57.0",
    "eslint-plugin-playwright":     "^1.6.2",
    "playwright-bdd":               "^8.5.0",
    "prettier":                     "^3.2.5",
    "typescript":                   "^5.4.0"
  }
}
```

- `engines.node ">=20"` — pins Node 20+. Both Playwright 1.44 and the Applitools UFG client require it.
- `scripts.test / test:bdd` — both run `npx bddgen` first (compiles features into `.features-gen/`) then the Playwright runner. `--grep-invert @flaky` excludes the Apply-Leave scenarios from the default gate.
- `scripts.test:api` — uses the `api` Playwright project (no browser, just `APIRequestContext`). ~5s wall-clock.
- `scripts.report:allure` — generates a richer Allure dashboard from `allure-results/`. Optional; default reporter is the built-in HTML.
- `scripts.lint / format:check / typecheck` — the local quality gate. CI runs the same three before the test matrix.
- devDependencies — every entry has a job. `@applitools/eyes-playwright` is the Eyes SDK; `@faker-js/faker` powers the data factory; `playwright-bdd` bridges Gherkin to Playwright; `allure-playwright` is the optional richer reporter; `dotenv` loads `.env` into `process.env` at start.

#### 3.2.2  tsconfig.json

TypeScript compiler options. The repo never emits JS — typecheck is the contract.

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "outDir": "./dist",
    "rootDir": ".",
    "baseUrl": ".",
    "paths": {
      "@pages/*": ["pages/*"],
      "@tests/*": ["tests/*"]
    }
  },
  "include": ["**/*.ts"],
  "exclude": [
    "node_modules", "dist", ".features-gen", "allure-results",
    "allure-report", "playwright-report", "test-results", "server"
  ]
}
```

- `"target": "ES2022"` — modern syntax (await at top level, class fields, error.cause).
- `"module": "commonjs"` — Node's default. Playwright runs commonjs without an experimental flag.
- `"strict": true` — turns on every strict subflag. Catches null bugs and implicit any.
- `"resolveJsonModule": true` — lets allure-playwright + others import JSON config without a separate type declaration.
- `"paths"` — `@pages/*` and `@tests/*` aliases. Currently only declared, not heavily used; reserved for future imports.
- `"exclude"` — generated folders (`.features-gen`, `allure-*`, `playwright-report`) and the Phase 2 server folder.

#### 3.2.3  .eslintrc.cjs

Lint rules. The `.cjs` extension forces commonjs even though `package.json` otherwise lets you write ESM.

Key configuration:

- `parserOptions.project` → `./tsconfig.json` so type-aware rules (`no-floating-promises`, `no-misused-promises`) actually fire.
- `no-floating-promises` / `no-misused-promises` — the two rules that catch most Playwright bugs. Forgetting an `await` on `page.goto()` is the canonical floating promise.
- `quotes` / `semi` / `max-len` off — Prettier owns formatting.
- Two overrides — `steps/` and `fixtures/` relax `no-standalone-expect` because the Playwright plugin sees them as standalone modules; `pages/` relaxes the wait-strategy rules because POMs use `waitFor` / `waitForLoadState` legitimately.

#### 3.2.4  .prettierrc / .prettierignore

Formatter rules. `.prettierrc` is plain JSON; `.prettierignore` matches gitignore syntax.

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf",
  "bracketSpacing": true
}
```

All defaults except `trailingComma: "all"` (helps git diffs) and `endOfLine: "lf"` (so Windows clones do not flip every line).

#### 3.2.5  .gitignore

The two gitignore lines that matter most are `.env` (the API key) and `.auth/` (the cached cookie jar). Both contain credentials. Either accidentally committed is a security incident; the .gitignore is the seatbelt.

#### 3.2.6  .vscode/ — workspace defaults

`extensions.json` recommends six extensions. VSCode prompts contributors to install them on first open. `settings.json` wires Prettier as the default formatter and runs ESLint `--fix` on save.

- Recommended extensions: `ms-playwright.playwright` (Test Explorer + traces), `dbaeumer.vscode-eslint` (in-editor lint), `esbenp.prettier-vscode` (formatter), `cucumberopen.cucumber-official` (Gherkin highlighting), `github.copilot` + `copilot-chat`.
- `settings.json`: `editor.formatOnSave: true`; `source.fixAll.eslint` on save; `cucumberautocomplete.steps` points at `steps/**/*.ts` so the Cucumber extension can resolve step references in `.feature` files.

### 3.3  playwright.config.ts

The runner config. Reads `.env` via dotenv, defines four projects (three BDD browsers + one API), wires `globalSetup`, and calibrates timeouts/workers based on the CI flag.

```ts
import { defineConfig, devices } from '@playwright/test';
import { defineBddProject } from 'playwright-bdd';
import { resolve } from 'node:path';
import * as dotenv from 'dotenv';

dotenv.config();

const BASE_URL = process.env.BASE_URL ?? 'https://www.saucedemo.com';
const ORANGEHRM_BASE_URL =
  process.env.ORANGEHRM_BASE_URL ?? 'https://opensource-demo.orangehrmlive.com';
const API_BASE_URL =
  process.env.API_BASE_URL ?? 'https://jsonplaceholder.typicode.com';

const isCI = !!process.env.CI;
const ORANGE_STORAGE_STATE = resolve('.auth/orangehrm.json');

export default defineConfig({
  testDir: './tests',
  globalSetup: require.resolve('./fixtures/orange-storage-state.ts'),
  timeout: isCI ? 180_000 : 60_000,
  expect: { timeout: isCI ? 30_000 : 10_000 },
  fullyParallel: true,
  retries: isCI ? 2 : 1,
  workers: isCI ? 1 : 5,
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
    ['allure-playwright', { outputFolder: 'allure-results' }],
  ],
  use: {
    baseURL: BASE_URL,
    headless: true,
    viewport: { width: 1280, height: 720 },
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
    actionTimeout: isCI ? 30_000 : 15_000,
    navigationTimeout: isCI ? 60_000 : 30_000,
  },
  projects: [
    {
      ...defineBddProject({
        name: 'bdd:chromium',
        features: 'features/**/*.feature',
        steps: ['fixtures/index.ts', 'steps/**/*.ts'],
      }),
      use: { ...devices['Desktop Chrome'], storageState: ORANGE_STORAGE_STATE },
    },
    /* …same shape for bdd:firefox and bdd:webkit… */
    { name: 'api', testDir: './tests/api',
      use: { baseURL: API_BASE_URL, storageState: undefined } },
  ],
});

export { ORANGEHRM_BASE_URL };
```

- `dotenv.config()` — loads `.env` into `process.env` before any of the env-dependent constants below it are evaluated. Position matters; called too late, BASE_URL fallbacks fire even when `.env` has values.
- `BASE_URL / ORANGEHRM_BASE_URL / API_BASE_URL` — env-overridable defaults. Same pattern means Docker, CI, and local all read from one place.
- `isCI` — single source of truth for "are we running in GitHub Actions". Used four times below for timeout, expect, retries, workers.
- `globalSetup` — points at `fixtures/orange-storage-state.ts`. Runs once per Playwright invocation, before any test.
- `timeout / expect.timeout` — CI machines are slower than local; 3× and 3× respectively prevents false failures on cold starts.
- `workers: isCI ? 1 : 5` — serial in CI on purpose. The OrangeHRM public demo throttles parallel sessions hard enough that workers=5 in CI costs more time than it saves.
- `reporter [html, list, allure-playwright]` — three reporters. HTML is the default, list is the live console output, allure-playwright produces the richer Allure JSON.
- `use.screenshot / video / trace` — only-on-failure / retain-on-failure / on-first-retry. The combination produces forensic data on flake without inflating storage on green runs.
- `use.viewport 1280×720` — matches the Eyes browser viewports in `applitools.config.ts`. Drift between Playwright viewport and Eyes viewport produces baseline noise.
- Three BDD projects + one `api` project. The BDD projects share `storageState` so every Gherkin scenario starts pre-authenticated against OrangeHRM. The api project sets `storageState` to `undefined` so its requests do not carry stale cookies.

### 3.4  applitools.config.ts

The Eyes side of the runner config. Three concerns: build the batch, gate visual checks behind a real key, and produce a Configuration object the fixture can apply.

```ts
import {
  BatchInfo, Configuration, BrowserType, ScreenOrientation,
} from '@applitools/eyes-playwright';

export const applitoolsBatch = new BatchInfo({
  name: 'SauceDemo + OrangeHRM AI-Augmented Suite',
});

const apiKey = process.env.APPLITOOLS_API_KEY;
export const visualEnabled =
  !!apiKey &&
  apiKey !== 'your-applitools-api-key-here' &&
  /^[A-Za-z0-9]+$/.test(apiKey);

export function buildEyesConfig(): Configuration {
  const config = new Configuration();
  if (visualEnabled && apiKey) config.setApiKey(apiKey);
  config.setBatch(applitoolsBatch);
  config.addBrowser({ width: 1280, height: 720, name: BrowserType.CHROME });
  config.addBrowser({ width: 1280, height: 720, name: BrowserType.FIREFOX });
  config.addBrowser({
    width: 375, height: 812, name: BrowserType.SAFARI,
    screenOrientation: ScreenOrientation.PORTRAIT,
  });
  config.setAppName('qa-ai-automation-framework');
  return config;
}
```

- `applitoolsBatch` — single `BatchInfo` for the whole suite run. Every checkpoint opened later attaches to it, so the dashboard groups them under one URL.
- `visualEnabled` — the gate. Three checks: key exists, key is not the `.env.example` placeholder, key is alphanumeric. The regex catches "I left quotes around it" — a real failure mode on first setup.
- `buildEyesConfig` — fresh `Configuration` per call. `setApiKey` + `setBatch` + three `addBrowser` entries is the minimum viable Configuration for UFG.
- `addBrowser × 3` — Chrome 1280×720, Firefox 1280×720, Safari Mobile 375×812. UFG renders the captured DOM against each. The Safari viewport matches an iPhone X portrait window.
- `setAppName` — the dashboard groups checkpoints by app first, then batch, then browser.

### 3.5  config/credentials.ts

The single import path for usernames and passwords across the codebase. Env var first, demo default second.

```ts
export const credentials = {
  sauceDemo: {
    users: {
      standard:           'standard_user',
      lockedOut:          'locked_out_user',
      problem:            'problem_user',
      performanceGlitch:  'performance_glitch_user',
      error:              'error_user',
      visual:             'visual_user',
    },
    password: process.env.SAUCEDEMO_PASSWORD ?? 'secret_sauce',
  },
  orangeHRM: {
    admin: {
      username: process.env.ORANGEHRM_ADMIN_USER ?? 'Admin',
      password: process.env.ORANGEHRM_ADMIN_PASSWORD ?? 'admin123',
    },
  },
} as const;
```

- Six SauceDemo test users — each maps to a documented public demo identity. `problem` and `visual` are the buggy identities used by the visual-regression scenarios.
- `??` operator — nullish coalescing. `process.env` values are strings or `undefined`; `""` is a valid string and `??` does not fall through. `??` is the right operator (`||` would treat empty string as "use default").
- `as const` — narrows every property to its literal type. `credentials.sauceDemo.users.standard` is the literal string `"standard_user"`, not the broader `string` type.

### 3.6  fixtures/  — the composition layer

Three files. `fixtures/index.ts` is the public surface (`test`, `Given`/`When`/`Then`). `data-factory.ts` is the data layer. `orange-storage-state.ts` is the `globalSetup` hook.

#### 3.6.1  fixtures/index.ts

Extends Playwright's `test` object with one fixture per POM plus an eyes wrapper. Step files import `{ Given, When, Then }` from this file — not from `playwright-bdd` directly — so every step has the full POM bench available in destructure.

```ts
import { test as base, createBdd } from 'playwright-bdd';
import { Eyes, VisualGridRunner, Target, type CheckSettings } from '@applitools/eyes-playwright';
import type { Page, TestInfo } from '@playwright/test';

import { SauceLoginPage }     from '../pages/saucedemo/login-page';
import { SauceInventoryPage } from '../pages/saucedemo/inventory-page';
import { SauceCartPage }      from '../pages/saucedemo/cart-page';
import { SauceCheckoutPage }  from '../pages/saucedemo/checkout-page';
import { OrangeLoginPage, OrangeDashboardPage, OrangePIMPage,
         OrangeAdminUsersPage, OrangeLeavePage } from '../pages/orangehrm/...';

import { buildEyesConfig, visualEnabled } from '../applitools.config';

export interface VisualEyes {
  check(name: string, target?: CheckSettings): Promise<void>;
}

async function openEyes(page: Page, testTitle: string): Promise<Eyes> {
  const runner = new VisualGridRunner({ testConcurrency: 5 });
  const eyes = new Eyes(runner);
  eyes.setConfiguration(buildEyesConfig());
  await eyes.open(page, 'qa-ai-automation-framework', testTitle);
  return eyes;
}

export const test = base.extend<PageObjects>({
  sauceLoginPage:     async ({ page }, use) => { await use(new SauceLoginPage(page)); },
  sauceInventoryPage: async ({ page }, use) => { await use(new SauceInventoryPage(page)); },
  /* …same for every POM… */

  eyes: async ({ page }, use, testInfo: TestInfo) => {
    const state: { eyes: Eyes | null } = { eyes: null };
    const wrapper: VisualEyes = {
      async check(name, target) {
        if (!visualEnabled) return;
        if (!state.eyes) state.eyes = await openEyes(page, testInfo.title);
        await state.eyes.check(name, target ?? Target.window().fully());
      },
    };
    await use(wrapper);
    if (state.eyes) {
      await state.eyes.close(false).catch(() => undefined);
    }
  },
});

export const { Given, When, Then, Before, After } = createBdd(test);
```

- `test as base` — the base Playwright test from `playwright-bdd`. Extending it preserves Playwright fixtures (page, request, browser) and adds the BDD-specific machinery.
- `VisualGridRunner({ testConcurrency: 5 })` — UFG runner with five concurrent server-side renders. Tunes throughput against your Applitools plan limits.
- `openEyes(page, testTitle)` — helper that creates `Eyes` against the runner, applies the `Configuration`, and calls `open()`. `open()` is the call that registers a session in the dashboard.
- `PageObjects` type — TypeScript shape of every fixture this file injects. `test.extend<PageObjects>()` gives every step file an exhaustive autocomplete list.
- `use(new SauceLoginPage(page))` — Playwright fixture lifecycle: build the value, hand it to the test via `use()`, then any code after `use()` is teardown. Here there is nothing after `use()`, so teardown is a no-op for POMs.
- `eyes wrapper` — the shape that step defs see. No open / close — just `check()`. The wrapper internally tracks the underlying `Eyes` session via the state holder.
- `state holder` — a `let eyes: Eyes | null = null` would lose its TypeScript narrowing inside the closure. Wrapping in an object preserves the narrowing because `state.eyes` can be reassigned without breaking the surrounding scope.
- `if (!visualEnabled) return` — the gate again. No key, no session opened, nothing on the dashboard. The functional assertions in the same step still run.
- `Target.window().fully()` — the default checkpoint target. Captures the entire viewport scrolled. A step that wants partial-region or layout matching can pass its own target.
- `await use(wrapper)` — hand control to the test. After every Given/When/Then in the scenario has run, control returns here and proceeds to teardown.
- `eyes.close(false).catch(...)` — the chapter's big design call. `close(false)` means diffs are dashboard-reviewed, not test-reviewed; `.catch` swallows any close error so a stale session never fails the suite.
- `createBdd(test)` — produces `Given` / `When` / `Then` bound to this extended test. Step files importing from `"../../fixtures"` get the same fixture bench inside their step bodies.

#### 3.6.2  fixtures/data-factory.ts

Faker-backed builders. Every randomized value the suite uses is produced here.

```ts
import { faker } from '@faker-js/faker';

export function formatOrangeDate(date: Date): string {
  const yyyy = date.getFullYear();
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${yyyy}-${dd}-${mm}`;
}

export function buildCheckoutInfo(overrides: Partial<CheckoutInfo> = {}): CheckoutInfo {
  return {
    firstName: faker.person.firstName(),
    lastName:  faker.person.lastName(),
    postalCode: faker.location.zipCode('#####'),
    ...overrides,
  };
}

export function buildEmployee(overrides: Partial<EmployeeInput> = {}): EmployeeInput {
  return {
    firstName: faker.person.firstName(),
    lastName:  faker.person.lastName(),
    employeeId: faker.string.numeric(6),
    ...overrides,
  };
}

export function buildLeaveRequest(overrides: Partial<LeaveRequest> = {}): LeaveRequest {
  const from = new Date();
  from.setDate(from.getDate() + 14);
  const to = new Date(from);
  to.setDate(to.getDate() + 1);
  return {
    leaveType: 'Vacation',
    fromDate: formatOrangeDate(from),
    toDate:   formatOrangeDate(to),
    comment:  `Auto-generated portfolio test — ${faker.word.adjective()} trip`,
    ...overrides,
  };
}

export function buildUser(overrides: Partial<UserCredentials> = {}): UserCredentials { ... }
export function buildCreditCard(overrides: Partial<CreditCardInfo> = {}): CreditCardInfo { ... }
```

- `formatOrangeDate` — produces `YYYY-DD-MM`, the format OrangeHRM's date widget expects (note: not the standard `YYYY-MM-DD`; OrangeHRM is unusual here). `padStart` prevents single-digit months/days.
- `buildCheckoutInfo` — three SauceDemo checkout fields. The 5-digit `zipCode` pattern matches US-style postal codes.
- `Partial<T>` overrides + spread — the killer pattern. `buildCheckoutInfo({ postalCode: "" })` keeps faked first/last name, pins postal to empty. The scenario reads cleanly: "fake everything except the field under test".
- `buildLeaveRequest` — leave starts ~14 days from today (avoids colliding with the demo's pre-seeded approved leave) and runs 2 days. `leaveType` is `"Vacation"` as a partial match — the demo prefixes it with a code that drifts between resets, so partial match survives.
- `buildUser / buildCreditCard` — declared for future API + UI reuse. The CRUD API tests already use `buildUser` to seed the post title.

#### 3.6.3  fixtures/orange-storage-state.ts

`globalSetup`. Runs once before any test, logs in to OrangeHRM as Admin, persists the cookie jar to `.auth/orangehrm.json`. Every BDD project then seeds its context from that file.

```ts
import { chromium, type FullConfig } from '@playwright/test';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { credentials } from '../config/credentials';

export const ORANGE_STORAGE_STATE = resolve('.auth/orangehrm.json');
const ORANGEHRM_BASE_URL =
  process.env.ORANGEHRM_BASE_URL ?? 'https://opensource-demo.orangehrmlive.com';
const EMPTY_STATE = JSON.stringify({ cookies: [], origins: [] });

export default async function globalSetup(_: FullConfig): Promise<void> {
  mkdirSync(dirname(ORANGE_STORAGE_STATE), { recursive: true });
  if (!existsSync(ORANGE_STORAGE_STATE)) {
    writeFileSync(ORANGE_STORAGE_STATE, EMPTY_STATE);
  }
  try {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(`${ORANGEHRM_BASE_URL}/web/index.php/auth/login`, { timeout: 30_000 });
    await page.getByPlaceholder('Username').fill(credentials.orangeHRM.admin.username);
    await page.getByPlaceholder('Password').fill(credentials.orangeHRM.admin.password);
    await page.getByRole('button', { name: 'Login' }).click();
    await page.getByRole('heading', { name: 'Dashboard' }).waitFor({ timeout: 30_000 });

    await context.storageState({ path: ORANGE_STORAGE_STATE });
    await browser.close();
    console.log(`[globalSetup] OrangeHRM storageState cached → ${ORANGE_STORAGE_STATE}`);
  } catch (err) {
    process.stderr.write(
      `[globalSetup] OrangeHRM storageState failed, using empty state: ${(err as Error).message ?? err}\n`,
    );
  }
}
```

- `mkdirSync({recursive: true}) + write EMPTY_STATE if missing` — Playwright throws at context creation if `storageState` points at a missing file. Writing an empty shell first means even the failure path has a valid file on disk. The login attempt below either overwrites it with a real session or leaves the empty shell in place.
- `try/catch around login` — when the public demo is unreachable (DNS, throttling, scheduled downtime), the test suite still runs. Scenarios fall back to UI login via the guard in `shared.steps.ts`.
- `chromium.launch() + newContext() + newPage()` — explicit browser lifecycle inside `globalSetup`; this code is not inside a test, so no test fixture is in scope.
- `context.storageState({ path })` — captures cookies + localStorage + sessionStorage to disk. This file is what every BDD project subsequently reads via `use.storageState` in `playwright.config`.
- `process.stderr.write` — written to stderr instead of `console.error` so CI log parsing tools that scan stderr for issues still see the warning, but test output stays clean.

### 3.7  pages/  — Page Object Models

Nine POMs across two folders, plus `base-page.ts` at the root. SauceDemo POMs lean on `data-test` attributes; OrangeHRM POMs lean on `getByRole` / `getByPlaceholder` / `getByLabel` because OrangeHRM does not expose `data-test`.

#### 3.7.1  pages/base-page.ts

Common helpers shared across every POM. Constructor takes `Page`; subclasses store it as protected.

```ts
export class BasePage {
  protected readonly page: Page;
  constructor(page: Page) { this.page = page; }

  async navigate(path: string = '/'): Promise<void> {
    await this.page.goto(path);
    await this.page.waitForLoadState('load');
  }

  async waitForVisible(locator: Locator, timeout = 10_000): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  async scrollToElement(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  protected inputInGroup(labelText: string): Locator {
    return this.page
      .locator('.oxd-input-group')
      .filter({ hasText: labelText })
      .locator('input').first();
  }

  protected selectWrapperInGroup(labelText: string): Locator {
    return this.page
      .locator('.oxd-input-group')
      .filter({ hasText: labelText })
      .locator('.oxd-select-wrapper').first();
  }
}
```

- `navigate` — `goto` + `waitForLoadState('load')`. Deliberately not `'networkidle'` — networkidle hangs on pages with long-lived connections (OAuth iframes, WebSockets, analytics beacons that never finish).
- `waitForVisible` — explicit visibility wait with a default 10s timeout. Default is generous enough for slow CI but short enough to fail fast on a real bug.
- `inputInGroup` — the OrangeHRM-specific helper. OrangeHRM puts labels in a sibling wrapper of the input, so the naive `label:has-text(x) >> input` pattern does not resolve. Scoping to `.oxd-input-group` + filter by text is the reliable shape.
- `selectWrapperInGroup` — same idea for OrangeHRM's Vue selects. The click handler is bound to `.oxd-select-wrapper`, not the inner `.oxd-select-text`, so clicking the text under load lands outside the handler.

#### 3.7.2  pages/saucedemo/login-page.ts

```ts
export class SauceLoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly errorDismissButton: Locator;
  readonly loginLogo: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput        = page.locator('[data-test="username"]');
    this.passwordInput        = page.locator('[data-test="password"]');
    this.loginButton          = page.locator('[data-test="login-button"]');
    this.errorMessage         = page.locator('[data-test="error"]');
    this.errorDismissButton   = page.locator('[data-test="error-button"]');
    this.loginLogo            = page.locator('.login_logo');
  }

  async open(): Promise<void> {
    await this.navigate('/');
    await this.waitForVisible(this.loginButton);
  }

  async loginAs(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async getErrorMessage(): Promise<string> {
    await this.waitForVisible(this.errorMessage);
    return (await this.errorMessage.textContent())?.trim() ?? '';
  }
}
```

- Six readonly `Locator` fields — every selector lives in the constructor. Tests cannot reach into `page.locator` directly without going through the POM, so a SauceDemo selector change is a one-line edit here.
- All selectors are `[data-test="..."]`. SauceDemo ships data-test attributes on every interactive element. Using them anywhere else (CSS classes, XPath) is a code-review failure on this codebase — the convention is the protection.
- `open()` — navigates to `"/"` (resolves against `playwright.config use.baseURL = "https://www.saucedemo.com"`) then waits on the login button so subsequent fills do not race the page render.
- `loginAs(username, password)` — three actions; awaits each. The fill + fill + click sequence is the canonical happy path for SauceDemo login.
- `getErrorMessage` — waits for visibility, reads `textContent`, trims, falls back to empty string. The optional chain + nullish coalesce handles the textContent-can-be-null TypeScript shape without a runtime cost.

#### 3.7.3  pages/saucedemo/inventory-page.ts

The grid you land on after login. Adds + removes items by deriving the data-test slug from the product name; sort dropdown takes one of four codes.

```ts
export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

export class SauceInventoryPage extends BasePage {
  readonly pageTitle:      Locator;   // [data-test="title"]
  readonly inventoryItems: Locator;   // [data-test="inventory-item"]
  readonly itemNames:      Locator;   // [data-test="inventory-item-name"]
  readonly itemPrices:     Locator;   // [data-test="inventory-item-price"]
  readonly sortDropdown:   Locator;   // [data-test="product-sort-container"]
  readonly shoppingCartLink:  Locator;
  readonly shoppingCartBadge: Locator;
  readonly burgerMenuButton:  Locator;  // #react-burger-menu-btn
  readonly logoutLink:        Locator;

  async expectLoaded()    { await expect(this.pageTitle).toHaveText('Products'); }
  async getItemCount()    { return this.inventoryItems.count(); }
  async addItemToCartByName(name)    { await this.page.locator(`[data-test="add-to-cart-${this.slugify(name)}"]`).click(); }
  async removeItemFromCartByName(n)  { await this.page.locator(`[data-test="remove-${this.slugify(n)}"]`).click(); }
  async getCartBadgeCount()          { /* 0 if no badge, otherwise number */ }
  async openCart()                   { await this.shoppingCartLink.click(); }
  async sortBy(option: SortOption)   { await this.sortDropdown.selectOption(option); }
  async getItemNamesInOrder()        { return ...textContents().map(trim); }
  async getItemPricesInOrder()       { return ...textContents().map(p => Number(p.replace('$',''))); }
  async logout()                     { burger → wait → click logoutLink; }
  private slugify(name)              { return name.toLowerCase().replace(/\s+/g, '-'); }
}
```

- `SortOption` — exact strings SauceDemo expects in the sort dropdown. Typed as a union so step files cannot pass a typo.
- `addItemToCartByName / removeItemFromCartByName` — the only two methods in the codebase that build a selector at call time. The slug derivation is mechanical (lowercase + replace whitespace with hyphen) and it matches what SauceDemo ships.
- `getCartBadgeCount` — null-safe count. The badge is absent when count is 0; checking `count() === 0` first prevents textContent on a missing element.
- `sortBy` — `selectOption` takes the `SortOption` directly because SauceDemo's `<select>` values match.
- `getItemPricesInOrder` — strips the `$` prefix and converts to number. Returns numbers so step defs can compare them with sort comparators.

#### 3.7.4  pages/saucedemo/cart-page.ts

Minimal POM — checkout button, item count, item names, remove-by-name, continue-shopping. The remove-by-name builds the same slug pattern as the inventory POM.

- Selectors: `[data-test="title"]` (page title), `[data-test="inventory-item"]`, `[data-test="inventory-item-name"]`, `[data-test="checkout"]`, `[data-test="continue-shopping"]`.
- Methods: `expectLoaded` (assert title === "Your Cart"), `getItemCount`, `getItemNames`, `removeItem(productName)`, `proceedToCheckout`, `continueShopping`.

#### 3.7.5  pages/saucedemo/checkout-page.ts

Three logical steps in one class — customer info, overview, complete. SauceDemo ships them as three URL routes (`/checkout-step-one`, `/-step-two`, `/-complete`) but the POM treats them as one because every selector is unique across the three pages.

- Step-one fields: `firstName`, `lastName`, `postalCode` inputs + `continue` / `cancel` / `error`.
- Step-two fields: `finish` button + `subtotal-label` / `tax-label` / `total-label`.
- Complete fields: `complete-header` (asserted "Thank you for your order!"), `complete-text`, `back-to-products`.
- `CheckoutInfo` — the typed shape consumed by `buildCheckoutInfo` in `fixtures/data-factory.ts`. The interface lives in this POM file because the page owns the field set; the factory imports the type.

#### 3.7.6  pages/orangehrm/login-page.ts

```ts
import { ORANGEHRM_BASE_URL } from '../../playwright.config';

export class OrangeLoginPage extends BasePage {
  readonly usernameInput: Locator;        // page.getByPlaceholder('Username')
  readonly passwordInput: Locator;        // page.getByPlaceholder('Password')
  readonly loginButton:   Locator;        // page.getByRole('button', { name: 'Login' })
  readonly errorAlert:    Locator;        // .oxd-alert-content-text
  readonly requiredFieldError: Locator;   // .oxd-input-field-error-message

  async open(): Promise<void> {
    await this.page.goto(`${ORANGEHRM_BASE_URL}/web/index.php/auth/login`);
    await this.page.waitForLoadState('load');
    if (!this.page.url().includes('/auth/login')) {
      // storageState seeded an Admin cookie — bounce through logout
      await this.page.goto(`${ORANGEHRM_BASE_URL}/web/index.php/auth/logout`);
      await this.page.waitForLoadState('load');
    }
    await this.waitForVisible(this.loginButton);
  }

  async loginAs(username: string, password: string): Promise<void> {
    if (username) await this.usernameInput.fill(username);
    if (password) await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
```

- OrangeHRM does not expose `data-test`, so the constructor uses ARIA primitives: `getByPlaceholder` for the username and password inputs, `getByRole("button", { name: "Login" })` for the submit. The error alert and required-field hooks are CSS class names — the only stable hooks OrangeHRM publishes for those.
- `open()` — the storageState fast-path bites here. If a login-feature scenario opens the login page while the cookie jar still has an Admin cookie, OrangeHRM redirects to `/dashboard/index`. The `if`-block bounces through `/auth/logout` to land back on the login form.
- `loginAs` — the empty-string guard is intentional. `fill("")` on an already-empty field does not fire OrangeHRM's "touched" state and the required-field validation never triggers. Skipping the fill on empty exercises the validation path.

#### 3.7.7  pages/orangehrm/dashboard-page.ts

The post-login landing. Two patterns worth pulling out: the non-throwing `isLoaded` variant, and the URL-change-based `navigateToModule`.

```ts
export class OrangeDashboardPage extends BasePage {
  readonly header:      Locator;  // page.getByRole('heading', { name: 'Dashboard' })
  readonly sidebarNav:  Locator;  // .oxd-sidepanel
  readonly userDropdown: Locator; // .oxd-userdropdown-tab
  readonly logoutLink:   Locator; // page.getByRole('menuitem', { name: 'Logout' })

  async expectLoaded() { await expect(this.header).toBeVisible({ timeout: 20_000 }); }

  async isLoaded(timeout = 5_000): Promise<boolean> {
    try { await this.header.waitFor({ state: 'visible', timeout }); return true; }
    catch { return false; }
  }

  async navigateToModule(name: string): Promise<void> {
    await this.sidebarNav.waitFor({ state: 'visible', timeout: 15_000 });
    const item = this.sidebarNav.locator('a.oxd-main-menu-item').filter({ hasText: name });
    await item.waitFor({ state: 'visible', timeout: 10_000 });
    const startUrl = this.page.url();
    await item.click();
    await this.page.waitForURL(
      (url) => url.toString() !== startUrl &&
              !url.toString().endsWith('/dashboard/index'),
      { timeout: 15_000 },
    );
    await this.page.waitForLoadState('domcontentloaded');
  }
}
```

- `isLoaded` — non-throwing. Used by the shared "User is logged in to OrangeHRM as Admin" step to short-circuit UI login when storageState is fresh. `expectLoaded` is the strict variant for steps that assert the dashboard.
- `navigateToModule` — three layers of waits. (1) Wait for the sidebar to render at all — on cold storageState it paints a tick after the heading. (2) Wait for the specific menu item with the matching label. (3) After click, wait for the URL to change away from `/dashboard/index`. The URL-change wait is the only reliable cross-module completion marker because the post-nav heading text differs per module (PIM → "Employee Information", Leave → "Leave List", Admin → "User Management").
- The `sidebarNav` uses `.oxd-sidepanel` (CSS class) because OrangeHRM does not give the sidebar an `aria-label`. Documented in the comment so the next maintainer does not "fix" it.

#### 3.7.8  pages/orangehrm/admin-users-page.ts

Admin → User Management. Filter by role / status, run a search, assert results. The dropdown click pattern here is the canonical OrangeHRM pattern — every Vue select in OrangeHRM uses the same shape.

```ts
async filterByRole(role: UserRole): Promise<void> {
  await this.userRoleDropdown.click({ force: true, timeout: 10_000 });
  await this.page.locator('.oxd-select-option')
    .filter({ hasText: role }).first().click();
}

async search(): Promise<void> {
  await this.searchButton.click();
  await this.page.waitForLoadState('domcontentloaded');
  await this.page.locator('.oxd-table-card, :text("No Records Found")')
    .first().waitFor({ state: 'visible', timeout: 15_000 });
}
```

- `click({ force: true })` — Vue select wrappers sometimes have pointer-events quirks when an animation is mid-frame. `force: true` bypasses Playwright's actionability check on this exact click. ESLint is configured to warn (not error) on `force: true` so reviewers see the warning and judge each instance.
- `search()`'s "OR" wait — `.oxd-table-card, :text("No Records Found")` is a comma-separated CSS selector that matches whichever appears first. Avoids the fail-when-empty case where waiting only on `.oxd-table-card` hangs.

#### 3.7.9  pages/orangehrm/pim-page.ts

Personnel Information Management. Two flows: add an employee, search the employee list. The autocomplete dance in `searchByName` is the noteworthy section.

```ts
async searchByName(name: string): Promise<void> {
  await this.searchEmployeeNameInput.first().fill(name);
  // OrangeHRM's name filter is a typeahead — typing raw text and
  // clicking Search filters by exact match (zero rows). The real
  // flow is: type → wait for the autocomplete dropdown → click an
  // option → then Search.
  const firstOption = this.page.locator('.oxd-autocomplete-option').first();
  await firstOption.waitFor({ state: 'visible', timeout: 8_000 });
  await firstOption.click();
  await this.searchButton.click();
  await this.page.waitForLoadState('domcontentloaded');
}
```

The lesson: when the under-test app uses an autocomplete typeahead, the test must mirror the user's real flow. Calling search with a typed string the user never selected returns no results because the backend filter is keyed on selection, not text. This is a class of bug that hits anyone testing modern SPAs with typeaheads.

#### 3.7.10  pages/orangehrm/leave-page.ts

Apply Leave. The whole feature is `@flaky` — see chapter 4. The POM matches the working Admin filter pattern; the flake is in the demo, not the locator strategy.

- `leaveTypeText` targets the inner `.oxd-select-text` div, not the wrapper. Its bounding box is reliably hit-testable; the wrapper sometimes isn't around the chevron icon.
- `selectLeaveType` has a fallback: if the requested type is not in the demo's leave-type catalogue, the POM picks the first non-placeholder option. Lets the rest of the flow exercise even if the catalogue drifts. This is a defensible compromise on a demo target — at work you would want a hard fail here.
- `setDateRange` — fill + Enter (commit) + Escape (close any popover) for each of From and To. The Escape between fields is what prevents the second click being intercepted by a lingering calendar widget.

### 3.8  features/  — Gherkin

Eight feature files. SauceDemo holds login, inventory, cart-checkout, and visual-regression. OrangeHRM holds login, employee-management, admin-user-search, leave-request. The visual-regression feature exists specifically because Applitools needs an app whose bugs are visual.

#### 3.8.1  features/saucedemo/01-login.feature

```gherkin
@SauceDemo @SauceDemo-login
Feature: SauceDemo — User authentication

  Background:
    Given User opens the SauceDemo login page

  @visual
  Scenario: User logs in successfully as standard_user
    When User logs in as "standard_user" with password "secret_sauce"
    Then User lands on the SauceDemo inventory page
    And the SauceDemo login page matches the visual baseline

  Scenario: Locked-out user is blocked from logging in
    When User logs in as "locked_out_user" with password "secret_sauce"
    Then User sees the SauceDemo login error "Epic sadface: Sorry, this user has been locked out."

  Scenario: Invalid password is rejected
    When User logs in as "standard_user" with password "wrong_password"
    Then User sees the SauceDemo login error "Epic sadface: Username and password do not match any user in this service"

  Scenario: Empty username triggers validation
    When User logs in as "" with password "secret_sauce"
    Then User sees the SauceDemo login error "Epic sadface: Username is required"
```

- `@SauceDemo @SauceDemo-login` — feature-level tags. Lets you target whole groups: `--grep @SauceDemo` runs everything against this target, `--grep @SauceDemo-login` narrows to one feature. Hierarchical naming (the second tag is a subset of the first) keeps the Cucumber Open extension's suggested-tag list useful.
- `@visual` — scenario-level tag on the happy path only. The visual checkpoint runs only here — the negative scenarios do not need a baseline.
- Background — runs before every scenario in the feature. Keeps the "open the login page" boilerplate out of every scenario.
- Four scenarios: positive ("standard_user happy path"), negative ("locked_out_user", "invalid password"), edge ("empty username"). The four-angle pattern is what a hiring panel will look for. One scenario per file is a smell.
- Verbatim error strings. SauceDemo's "Epic sadface" prefix is part of its product personality and changes infrequently — paraphrasing here would silently let a wording drift through.

#### 3.8.2  features/saucedemo/02-inventory.feature

A Scenario Outline drives the four sort modes through one scenario. Plus a count assertion and a visual baseline.

```gherkin
  Scenario Outline: User sorts the inventory by <sort_label>
    When User sorts the inventory by "<sort_code>"
    Then the inventory order matches "<sort_code>"

    Examples:
      | sort_label            | sort_code |
      | Name (A to Z)         | az        |
      | Name (Z to A)         | za        |
      | Price (low to high)   | lohi      |
      | Price (high to low)   | hilo      |
```

- One Scenario Outline + four Examples rows = four runs. Reads as a single story; produces four checkpoints in the report.
- Step-def implementation handles all four codes — switch on alpha vs price, sort the array, compare. The step file matches "the inventory order matches" against any sort_code; the data drives the assertion.

#### 3.8.3  features/saucedemo/03-cart-checkout.feature

Three scenarios: add/remove cart, full checkout (visual), missing-postal-code edge.

- The third scenario is the override-pattern showcase: `first name "Rashmie", last name "E", postal code ""` pins postal to empty while keeping name fields populated. The scenario fails for the right reason, not because of two missing fields.
- The visual checkpoint is on the order-complete page (after "Thank you for your order!"). Catching a regression in the post-checkout confirmation is high-signal — that's the screen users see immediately after spending money.

#### 3.8.4  features/saucedemo/04-visual-regression.feature

The Phase 1 deliverable's headline scenario. Two SauceDemo identities (`problem_user`, `visual_user`) ship with intentional visual bugs. Functional assertions pass; only Applitools catches them.

```gherkin
  Scenario: problem_user shows incorrect product images that visual AI catches
    Given User is logged in to SauceDemo as "problem_user"
    And User is on the SauceDemo inventory page
    Then the inventory grid shows 6 items
    And the SauceDemo inventory page matches the visual baseline

  Scenario: visual_user shows subtle layout shifts that visual AI catches
    Given User is logged in to SauceDemo as "visual_user"
    ...
```

- `problem_user` — every product image is the same dog photo. DOM is fine, layout is fine, the count is 6, names are correct. Only a visual diff catches it.
- `visual_user` — subtle layout perturbations: elements shifted a few pixels, wrong sort order applied. Functional sort assertion would fail in the inventory feature, but in this feature we deliberately do not assert sort, so only Applitools catches the drift.
- This is the feature you point at when someone asks "why visual AI". Without it, the answer is theoretical; with it, you have a runnable proof.

#### 3.8.5  features/orangehrm/01-login.feature

- Three scenarios: positive ("Admin happy path"), negative ("invalid credentials"), edge ("empty username and password trigger required-field validation").
- The required-field assertion is "at least 2 errors" rather than exactly 2 — OrangeHRM occasionally renders an extra "field is required" element on slow paint. Allowing >= keeps the test green when the under-test app is slow without losing the signal that validation fired.
- Visual baseline only on the happy path, same convention as SauceDemo login.

#### 3.8.6  features/orangehrm/02-employee-management.feature

- Two scenarios: add an employee with generated data (visual baseline on the personal-details page), search the employee list by name "a".
- "a" as the search term is deliberate — it is the loosest filter that still exercises the autocomplete-then-search flow. The assertion is "at least 1 result" so the test stays green across demo resets.

#### 3.8.7  features/orangehrm/03-admin-user-search.feature

- Three scenarios: filter by role, filter by status, reset clears filters. All three end with "User list shows at least 1 result" — concrete enough to catch a broken filter, lenient enough to survive demo resets.

#### 3.8.8  features/orangehrm/04-leave-request.feature

- `@flaky` on the feature level. Two scenarios: apply leave with valid data, submit the empty form to surface validation. The flake is the form's Leave Type select rendering via XHR at unpredictable times on the shared public demo.
- Run with `--grep @flaky --workers=1 --headed` against a warm demo. Default `npm run test:bdd` uses `--grep-invert @flaky` so the gate stays deterministic.

### 3.9  steps/  — Glue between Gherkin and POMs

Eight files. Three SauceDemo step files (one per feature except visual-regression which reuses the inventory steps), four OrangeHRM step files, and one `shared.steps.ts` for cross-target Givens.

#### 3.9.1  steps/saucedemo/01-login.steps.ts

```ts
import { expect } from '@playwright/test';
import { Given, When, Then } from '../../fixtures';

Given('User opens the SauceDemo login page', async ({ sauceLoginPage }) => {
  await sauceLoginPage.open();
});

When(
  'User logs in as {string} with password {string}',
  async ({ sauceLoginPage }, username: string, password: string) => {
    await sauceLoginPage.loginAs(username, password);
  },
);

Then(
  'User lands on the SauceDemo inventory page',
  async ({ sauceInventoryPage }) => {
    await sauceInventoryPage.expectLoaded();
  },
);

Then(
  'User sees the SauceDemo login error {string}',
  async ({ sauceLoginPage }, expectedError: string) => {
    const actual = await sauceLoginPage.getErrorMessage();
    expect(actual).toBe(expectedError);
  },
);

Then(
  'the SauceDemo login page matches the visual baseline',
  async ({ eyes }) => {
    await eyes.check('SauceDemo — inventory after login');
  },
);
```

- `import { Given, When, Then } from "../../fixtures"` — the conventions file says exactly this. Importing from `playwright-bdd` directly bypasses the extended fixtures and the eyes wrapper.
- `async ({ sauceLoginPage }, ...)` — playwright-bdd destructures fixtures from the first argument; positional args from the `{string}`/`{int}` matchers come after.
- `expect(actual).toBe(expectedError)` — exact-string match. The feature file lists the verbatim error; `toContain` would let a wording drift through.
- `eyes.check("SauceDemo — inventory after login")` — single line. Lifecycle is in the fixture; the step is one statement. Removing visual coverage from this scenario in future would mean deleting the And-line in the `.feature` and this Then-step. No third file to touch.

#### 3.9.2  steps/saucedemo/02-inventory.steps.ts

```ts
When(
  'User sorts the inventory by {string}',
  async ({ sauceInventoryPage }, sortCode: string) => {
    await sauceInventoryPage.sortBy(sortCode as SortOption);
  },
);

Then(
  'the inventory order matches {string}',
  async ({ sauceInventoryPage }, sortCode: string) => {
    if (sortCode === 'az' || sortCode === 'za') {
      const names = await sauceInventoryPage.getItemNamesInOrder();
      const sorted = [...names].sort();
      expect(names).toEqual(sortCode === 'az' ? sorted : sorted.reverse());
      return;
    }
    const prices = await sauceInventoryPage.getItemPricesInOrder();
    const sorted = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(sortCode === 'lohi' ? sorted : sorted.reverse());
  },
);
```

- `sortCode as SortOption` — the cast is safe because the `.feature` file is the only producer of these values and it produces only the four valid codes. The cast also surfaces the contract — the step expects one of four strings.
- Two-arm switch on whether the sort is alpha (sort the names) or numeric (sort the prices). One step covers all four sort modes.

#### 3.9.3  steps/saucedemo/03-cart-checkout.steps.ts

- Eleven step bindings, the largest step file in the SauceDemo set. Covers add/remove, open cart, proceed to checkout, fill (generated and explicit), continue, finish, complete-confirmation, visual checkpoint, and the missing-postal-code error.
- `User fills the checkout form with generated personal information` — calls `buildCheckoutInfo()` with no overrides. Faked names + faked postal.
- `User fills the checkout form with first name, last name, postal code` — explicit values. The scenario's pinned values flow straight through.

#### 3.9.4  steps/orangehrm/01-login.steps.ts

- Five bindings: open the login page, log in, assert dashboard, assert error, assert at-least-N required-field errors, visual baseline.
- `expect(count).toBeGreaterThanOrEqual(min)` — the lenient assertion that survives the OrangeHRM "extra error pip on slow paint" case.

#### 3.9.5  steps/orangehrm/02-employee-management.steps.ts

- `User fills the employee form with generated data` calls `buildEmployee()` — first name, last name, 6-digit numeric employee id.
- "User searches the employee list by name" passes through to `orangePIMPage.searchByName`, which runs the autocomplete dance.

#### 3.9.6  steps/orangehrm/03-admin-user-search.steps.ts

- Five bindings — filter by role, filter by status, run search, reset, assert at-least-N results. Each filter step calls `expectLoaded()` first to make sure the search form has rendered before clicking the dropdown.

#### 3.9.7  steps/orangehrm/04-leave-request.steps.ts

- Four bindings: open Apply form, apply with generated data, submit empty form, assert success / assert at-least-N validation errors.

#### 3.9.8  steps/shared.steps.ts

```ts
Given(
  'User is logged in to OrangeHRM as {string}',
  async ({ page, orangeLoginPage, orangeDashboardPage }, username: string) => {
    const isAdmin = username === credentials.orangeHRM.admin.username;
    if (isAdmin) {
      await page.goto(`${ORANGEHRM_BASE_URL}/web/index.php/dashboard/index`);
      if (await orangeDashboardPage.isLoaded(8_000)) return;
    }
    await orangeLoginPage.open();
    const password = isAdmin ? credentials.orangeHRM.admin.password : '';
    await orangeLoginPage.loginAs(username, password);
    await orangeDashboardPage.expectLoaded();
  },
);
```

- The fast-path branch is the storageState payoff. Goto `/dashboard/index`; if `isLoaded` returns true within 8s, the cookie jar is fresh and we return immediately. No UI login.
- Fallback uses the OrangeHRM login POM. The non-Admin branch passes an empty password — irrelevant because the demo only accepts Admin/admin123.
- Same file holds the SauceDemo logged-in shorthand and the "User navigates to the {string} module" Given used by every OrangeHRM module-feature.

### 3.10  tests/api/  — REST contract tests

Three Playwright API specs running against `jsonplaceholder.typicode.com`. No browser, no auth, no axios. Pure `APIRequestContext`. The "api" project in `playwright.config.ts` wires them into the same runner the BDD suite uses.

#### 3.10.1  Why jsonplaceholder

SauceDemo is browser-only. OrangeHRM's REST endpoints rely on UI session cookies, are not documented, and get wiped every few hours. reqres.in moved to a paid tier in 2024 — public demo keys started returning 401 mid-build. jsonplaceholder.typicode.com has been running since 2013, accepts writes and echoes them back, and is the API used in the React/Vue/Angular tutorials. It is good enough for contract testing and a stable target for a public CI gate.

#### 3.10.2  tests/api/users.api.test.ts

```ts
test.describe('jsonplaceholder — users (read)', () => {
  test('GET /users returns the user list', async ({ request }) => {
    const res = await request.get('/users');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
    for (const user of body) {
      expect(user).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          name: expect.any(String),
          username: expect.any(String),
          email: expect.any(String),
          address: expect.objectContaining({ city: expect.any(String) }),
          company: expect.objectContaining({ name: expect.any(String) }),
        }),
      );
    }
  });

  test('GET /users/1 returns a single user', async ({ request }) => {
    const res = await request.get('/users/1');
    expect(res.status()).toBe(200);
    expect(await res.json()).toMatchObject({
      id: 1, name: expect.any(String),
      email: expect.stringContaining('@'),
    });
  });

  test('GET /users/9999 returns 404', async ({ request }) => {
    const res = await request.get('/users/9999');
    expect(res.status()).toBe(404);
    expect(await res.json()).toEqual({});
  });
});
```

- `request` fixture — Playwright's built-in `APIRequestContext`. No axios import. The `api` project in `playwright.config` configures `use.baseURL = API_BASE_URL` so `request.get("/users")` resolves against the env-overridable base URL.
- `expect.objectContaining` — assert "these fields exist" without caring about extras. The right idiom for contract testing where the upstream may add fields you do not consume.
- Loop over `body` to assert the shape on every item. A failure on item 5 is reported with the index in the error, so debugging is easy.
- Three tests cover read happy path, single read, and 404. Status code AND body shape on every test — the lesson from `docs/copilot-prompts/05-api-tests.md`.

#### 3.10.3  tests/api/users-crud.api.test.ts

```ts
test.describe('jsonplaceholder — posts (CRUD)', () => {
  test('POST /posts creates a post', async ({ request }) => {
    const user = buildUser();
    const payload = {
      title: `Portfolio test — ${user.username}`,
      body: 'Generated by the qa-ai-automation-framework test suite.',
      userId: 1,
    };
    const res = await request.post('/posts', { data: payload });
    expect(res.status()).toBe(201);
    expect(await res.json()).toMatchObject({ ...payload, id: expect.any(Number) });
  });

  test('PATCH /posts/:id partially updates a post', async ({ request }) => {
    const payload = { title: 'Patched title only' };
    const res = await request.patch('/posts/1', { data: payload });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({ id: 1, title: payload.title });
    expect(body.body).toBeDefined();      // untouched field still present
    expect(body.userId).toBeDefined();    // untouched field still present
  });

  test('DELETE /posts/:id returns 200 with an empty payload', async ({ request }) => {
    const res = await request.delete('/posts/1');
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({});
  });
});
```

- `buildUser()` from the data factory — uses the real Faker pipeline, not a hardcoded title. Every run produces a fresh title; the test still passes because we assert shape + id, not title content.
- `PATCH untouched-field assert` — `body.body` and `body.userId` must remain defined. If jsonplaceholder ever lost that behaviour, this test catches it. This is what "contract testing" looks like: assert the invariants, not just the changes you sent.
- `DELETE returns 200 with {}` — not 204 No Content, not `{ success: true }`. jsonplaceholder's actual behaviour. Pinning the empty-object payload protects against a future client lib that assumes truthy payloads.

#### 3.10.4  tests/api/auth.api.test.ts

jsonplaceholder has no login endpoint, so this file stands in for what auth contract tests look like — shape asserts against the user + posts relationship.

- `GET /users/:id` — asserts the fields a real auth response would populate (username, email matching `@`, phone). Not a real auth contract; it is the closest shape jsonplaceholder offers.
- `GET /users/:id/posts` — asserts every returned post has `userId === 1`. Analogous to "every resource in the response belongs to the authenticated user" — the canonical IDOR-prevention check.
- `GET /users/9999/posts` — returns 200 with an empty array. The negative-auth stand-in: "no auth, no resources". jsonplaceholder does not return 404 for missing users' posts; it returns `[]`. The test pins that.

#### 3.10.5  tests/api/README.md

Documents the why-not-other-APIs reasoning, the file/test breakdown, how to point at a real API at work (swap `API_BASE_URL` + add `extraHTTPHeaders` to the api project), and the run commands.

### 3.11  .github/workflows/playwright.yml

CI. One workflow file. Triggered only on push to main and on `workflow_dispatch`. Two jobs: a quality gate, then a 3-browser test matrix that depends on the quality gate.

```yaml
name: CI

on:
  push: { branches: [main] }
  workflow_dispatch:

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  quality:
    name: Lint + Typecheck + Format
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run format:check
      - run: npm run lint
      - run: npm run typecheck

  test:
    name: Test (${{ matrix.browser }})
    needs: quality
    runs-on: ubuntu-latest
    timeout-minutes: 30
    strategy:
      fail-fast: false
      matrix: { browser: [chromium, firefox, webkit] }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - id: pw
        run: |
          v=$(node -p "require('@playwright/test/package.json').version")
          echo "version=$v" >> "$GITHUB_OUTPUT"
      - uses: actions/cache@v4
        with:
          path: ~/.cache/ms-playwright
          key: pw-${{ runner.os }}-${{ steps.pw.outputs.version }}-${{ matrix.browser }}
      - run: npx playwright install --with-deps ${{ matrix.browser }}
      - name: Run BDD suite
        env: { APPLITOOLS_API_KEY: ${{ secrets.APPLITOOLS_API_KEY }} }
        run: |
          npx bddgen
          npx playwright test --project=bdd:${{ matrix.browser }} --grep-invert @flaky
      - if: matrix.browser == 'chromium'
        run: npm run test:api
      - if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report-${{ matrix.browser }}
          path: playwright-report/
          retention-days: 14
```

- `on.push.branches: [main]` + `workflow_dispatch` — two triggers. Push-to-main is the gate; `workflow_dispatch` lets you re-run from the Actions tab without committing.
- `concurrency.cancel-in-progress: true` — pushing a second commit to main while the first is still running cancels the first. Saves CI minutes when you push fixes in quick succession.
- Two jobs: `quality` (10 min cap) → `test` (30 min cap, `needs: quality`). The quality gate is fast, so a style or type error fails before the matrix even starts.
- `strategy.fail-fast: false` — one browser failing does not cancel the other two. You see all three results in one run.
- `actions/cache@v4` keyed on Playwright version + matrix.browser — caches the ~300 MB of browser binaries by resolved version. Fresh runs hit the cache; version bumps invalidate cleanly.
- `npx playwright install --with-deps ${{ matrix.browser }}` — installs only the matrix browser, not all three. Lighter download per matrix leg.
- `APPLITOOLS_API_KEY: ${{ secrets.APPLITOOLS_API_KEY }}` — repo secret. Available to forks only if the maintainer explicitly opts in. Without the secret, `visualEnabled` is false and visual checks self-skip — same graceful degradation as local.
- `test:api` runs only on chromium — the API tests do not need a browser; running them on three matrix legs would be wasted minutes.
- `upload-artifact` with `if: always()` — uploads the Playwright HTML report and Allure JSON even when tests fail. Failed runs are exactly when you most want the artefacts.

### 3.12  docs/copilot-prompts/  — Day 5–6 receipts

Six markdown files, each documenting the prompt that produced a layer of the framework. Read them in order and you will see the conventions file pay off across every prompt.

| File | Content + lesson |
| ---- | ---------------- |
| `README.md` | Index. Lists the six files and the three durable lessons (conventions file > raw capability; prompts travel; ask for edge cases by name). |
| `01-page-objects.md` | POM scaffolding. SauceDemo prompt (`data-test`) and OrangeHRM prompt (`getByRole` / `getByPlaceholder`). Lesson: name the primitive in the prompt; vague guidance produces CSS. |
| `02-feature-files.md` | Gherkin generation. SauceDemo login (4 scenarios) and cart-checkout (3 scenarios with the missing-postal-code edge). Lesson: ask for edge cases by name. |
| `03-step-defs.md` | Step-def generation bound to fixture-injected POMs. Lesson: pin import paths and fixture shape. |
| `04-test-data.md` | Faker-backed builders. Lesson: show the call site (`buildCheckoutInfo({postalCode: ""})`) — Copilot writes builder patterns well when shown the usage. |
| `05-api-tests.md` | jsonplaceholder API tests. Lesson: assert status code AND body shape every time. |
| `06-applitools-integration.md` | Eyes fixture lifecycle. Lesson: keep guards out of step defs; the fixture owns lifecycle. |

#### 3.12.1  Reading order

1. Start with `README.md` — it sets the frame.
2. Read `01-page-objects.md`, then look at `pages/saucedemo/login-page.ts`. The output of the prompt is exactly that file.
3. Read `02-feature-files.md`, then look at `features/saucedemo/01-login.feature`.
4. Read `03-step-defs.md`, then look at `steps/saucedemo/01-login.steps.ts`.
5. Read `04-test-data.md`, then look at `fixtures/data-factory.ts`.
6. Read `05-api-tests.md`, then look at `tests/api/users.api.test.ts`.
7. Read `06-applitools-integration.md`, then look at `fixtures/index.ts` (the eyes fixture inside `test.extend`).

> **Why this order matters**
> Each prompt receipt is paired with a real file in the repo. Reading the prompt then the file is how you internalise the durable bit — the prompt — instead of just memorising the output.

### 3.13  docs/screenshots/  — README hero shots

Eight files, including a README that lists what each screenshot proves and how to capture it. The README's capture checklist is the deliverable; the screenshots themselves get refreshed every time the suite materially changes.

| File | What it proves |
| ---- | -------------- |
| `01-vscode-project.png` | VSCode tree expanded so `features/`, `pages/`, `tests/` are visible. |
| `02-vscode-test-run.png` | Terminal pane + Test Explorer mid-pass while the list is green. |
| `03-playwright-report.png` | `npx playwright show-report` — suite overview screen. |
| `04-allure-report.png` | Allure dashboard summary view. |
| `04-applitools-dashboard.png` | Applitools batch tile listing all browsers. |
| `05-applitools-diff.png` | Unresolved diff against the baseline. The money shot. |
| `06-copilot-suggestion.png` | Ghost text mid-suggestion in a step file. |
| `07-ci-run.png` | Passing GitHub Actions matrix run, jobs expanded. |

---

## Part IV  ·  Exercises

Mixed difficulty. Anything marked "self-check" you can answer without opening the editor; anything else expects a code change. Resist the urge to peek at the answer in Part III until you have tried.

### Concept exercises

1. **(Applitools)** Explain the difference between `close(true)` and `close(false)` and which one this repo uses, plus why.
2. **(Applitools)** The repo gates visual checks behind a regex `/^[A-Za-z0-9]+$/`. Why? What real failure mode does that catch?
3. **(Mabl/Testim)** Name two app categories where you would pick a self-healing tool over Playwright + `data-test`. Justify each in two sentences.
4. **(Copilot)** The conventions file pins five things explicitly. Without looking at `.github/copilot-instructions.md`, list them.
5. **(Copilot)** `docs/copilot-prompts/04-test-data.md` says "show the call site". Explain why that produces better builders than describing the override pattern in prose.
6. **(Combined)** Why does the repo use `playwright-bdd` instead of `@cucumber/cucumber`? Two concrete benefits.

### Code exercises

1. **(POM)** Add a new method `getCheckoutTotalAsNumber()` to `pages/saucedemo/checkout-page.ts` that returns the order total as a number (strip "$", strip "Total: ", convert). Add a step def for "the SauceDemo order total is greater than {int}" and a scenario that uses it.
2. **(Visual)** Add a fifth visual checkpoint to `features/saucedemo/03-cart-checkout.feature` on the order-overview page. Wire the step def. Verify the dashboard shows it under the existing batch.
3. **(Data)** Add `buildAddress()` to `fixtures/data-factory.ts` (street, city, state, zip). Use it in a new SauceDemo checkout scenario that fills first name, last name, and a generated address (note: SauceDemo does not have an address field — make this scenario hit the order-complete page even with the unused address, and assert the address is in the post-checkout summary).
4. **(API)** Add `tests/api/posts.api.test.ts` that exercises `GET /posts` (list), `GET /posts/:id`, and `GET /posts?userId=1` (filter by query string). Assert status + body shape on every test.
5. **(CI)** Update `.github/workflows/playwright.yml` to run `@flaky` scenarios on a separate `workflow_dispatch` trigger only. Quote the exact YAML changes.
6. **(Copilot)** Add `docs/copilot-prompts/07-accessibility.md` following the same shape as the existing six. The prompt should ask Copilot to add axe-core checks to a step file. Include the lesson learned section.

### Capstone

Extend the framework to a third demo target: PracticeSoftwareTesting (`https://practicesoftwaretesting.com`). The mandate is: keep the existing patterns. No new conventions. The conventions file should not change.

1. **(Scaffold)** Create `features/pst/`, `pages/pst/`, `steps/pst/`. Add a `config/credentials.ts` entry for PST.
2. **(POMs)** Add `LoginPage` and `ProductsPage` POMs. Use the locator strategy that matches the app — inspect the DOM and pick `data-test` if available, ARIA otherwise.
3. **(Features)** Write `features/pst/01-login.feature` covering positive, negative, and edge cases — same shape as `features/saucedemo/01-login.feature`.
4. **(Steps)** Write the step file. Import from `"../../fixtures"`. Bind to the new POMs.
5. **(Visual)** Add one `@visual` scenario on the products page after login. Use the existing eyes fixture; do not modify `applitools.config.ts`.
6. **(Verify)** typecheck → lint → format-check → test:bdd. All four green before declaring done.
7. **(Document)** Update `README.md`'s Test Coverage section to include PST. Add to the Phase 1 plan-to-repo mapping table if relevant.

---

## Part V  ·  Glossary, Cheatsheet, Troubleshooting

### 5.1  Glossary

| Term | Meaning |
| ---- | ------- |
| **APIRequestContext** | Playwright's built-in HTTP client. Used by the `api` project in `tests/api/`. Replaces axios / node-fetch / supertest in this codebase. |
| **Applitools Eyes** | A visual AI testing service. Captures DOM snapshots and renders them server-side against approved baselines, surfacing only meaningful diffs. |
| **Background** | Gherkin keyword. Steps that run before every scenario in the same feature file. |
| **Baseline** | In Applitools: the approved screenshot a checkpoint is compared against. Stored in the Applitools cloud, not the repo. |
| **Batch** | Applitools concept. Groups checkpoints from one suite run under a single dashboard URL. |
| **BDD** | Behaviour-Driven Development. The practice of writing test specifications in plain language (Gherkin) that product stakeholders can read. |
| **Checkpoint** | A single `eyes.check()` call. Opens or reuses an Eyes session, ships a DOM snapshot, compares against baseline. |
| **Cucumber** | BDD framework family. Reads Gherkin `.feature` files and runs them against TypeScript step definitions. This repo uses `playwright-bdd`, a Cucumber-compatible variant on top of Playwright. |
| **data-test** | Convention for stable test hooks. SauceDemo ships `[data-test="..."]` attributes on every interactive element. Preferred over CSS classes because devs do not refactor them. |
| **Diff (Unresolved)** | Applitools dashboard term. A checkpoint whose render does not match its baseline. A reviewer Accepts (baseline updates) or Rejects (logs as a bug). |
| **Faker** | NPM library that produces realistic-looking randomized data. `faker.person.firstName()`, `faker.location.zipCode()`, etc. The repo wraps it in builder functions in `fixtures/data-factory.ts`. |
| **Fixture** | Playwright concept. Named per-test resource provided via `test.extend`. This repo declares one fixture per POM plus an `eyes` fixture. |
| **getByRole / getByPlaceholder / getByLabel** | Playwright ARIA-aware locators. Resolve elements by their accessible name and role. Preferred for apps that do not expose `data-test`. |
| **Gherkin** | The English-style domain-specific language Cucumber reads. Given/When/Then/And/But on every line. |
| **globalSetup** | Playwright config option. Runs once before any test, before any worker boots. Used here to cache the OrangeHRM cookie jar. |
| **Page Object Model (POM)** | Pattern. Encapsulates the selectors and actions of one page in a class. Tests interact with the POM, not `page.locator(...)`. |
| **playwright-bdd** | NPM package that compiles `.feature` files into Playwright tests, preserving native parallelism, traces, and the UI-mode debugger. |
| **Scenario Outline** | Gherkin keyword. A scenario that runs once per row in an Examples table. |
| **Self-healing** | Test framework feature where the runner inspects the DOM at run time and re-pins broken selectors. Mabl, Testim. Rejected in this repo because `data-test` + Playwright auto-retry covers the same ground without an external dependency. |
| **storageState** | Playwright concept. A JSON file containing cookies + localStorage + sessionStorage. Lets contexts boot pre-authenticated. |
| **Step definition** | TypeScript function bound to a Gherkin phrase. Lives in `steps/`. Imports `Given`/`When`/`Then` from `"../../fixtures"`. |
| **Tag** | Gherkin metadata starting with `@`. Lets the runner filter scenarios. Examples in this repo: `@SauceDemo`, `@OrangeHRM`, `@visual`, `@flaky`. |
| **Trace** | Playwright recording. Captured on first retry; viewable with `npx playwright show-trace`. Includes DOM snapshots, screenshots, and network at every action. |
| **Ultrafast Grid (UFG)** | Applitools cloud render farm. One DOM snapshot fans out to multiple browser/viewport combinations server-side. Replaces local cross-browser runs. |
| **Visual regression** | A bug that changes how a page renders without changing its DOM. The class of bug visual AI tools exist to catch. |

### 5.2  npm script cheatsheet

| Command | What it does |
| ------- | ------------ |
| `npm run test` | Default — `bddgen` + chromium BDD, excluding `@flaky`. ~55s. |
| `npm run test:bdd` | Same as `test`. Explicit alias. |
| `npm run test:api` | API project only. ~5s, no browser. |
| `npm run lint` | ESLint over `.ts` files. |
| `npm run format:check` | Prettier check (no fix). Mirrors the CI gate. |
| `npm run typecheck` | `tsc --noEmit`. No JS produced. |
| `npm run report:allure` | Build + open the Allure dashboard from `allure-results/`. |
| `npm run report:allure:clean` | Wipe `allure-results` + `allure-report`. Use before re-running for a clean dashboard. |
| `npx bddgen` | Compile `features/**/*.feature` into `.features-gen/`. Required before any non-script playwright invocation. |
| `npx playwright test --project=bdd:chromium --grep @SauceDemo` | Run only SauceDemo scenarios on chromium. |
| `npx playwright test --project=bdd:chromium --grep @flaky --workers=1 --headed` | Debug the `@flaky` scenarios with a real browser, serial. |
| `npx playwright show-report` | Open the HTML report from the most recent run. |
| `npx playwright show-trace path/to/trace.zip` | Replay a trace from `test-results/`. |

### 5.3  Environment variables

| Variable | Purpose |
| -------- | ------- |
| `APPLITOOLS_API_KEY` | Unset → visual checks self-skip. Set → checks fire. Reject placeholders + non-alphanumeric values. |
| `BASE_URL` | Default `https://www.saucedemo.com`. Override to point at staging. |
| `ORANGEHRM_BASE_URL` | Default `https://opensource-demo.orangehrmlive.com`. Override for self-hosted instances. |
| `API_BASE_URL` | Default `https://jsonplaceholder.typicode.com`. |
| `SAUCEDEMO_PASSWORD` | Default `secret_sauce`. Override for a non-public SauceDemo instance. |
| `ORANGEHRM_ADMIN_USER` / `_PASSWORD` | Defaults `Admin` / `admin123`. |
| `CI` | Auto-set by GitHub Actions. Triggers slower-but-stable timeouts and `workers=1` in `playwright.config`. |

### 5.4  Troubleshooting

| Symptom | Diagnosis + fix |
| ------- | --------------- |
| **Visual checks do not fire** | Likely causes: `APPLITOOLS_API_KEY` unset, key still equals the `.env.example` placeholder, or quotes are wrapping the key in `.env`. **Fix:** copy the real key from eyes.applitools.com → Account → API Key. Paste raw — no surrounding quotes. Confirm `visualEnabled` in `applitools.config.ts` is true on import. |
| **OrangeHRM scenarios fall through to UI login every time** | Stale `.auth/orangehrm.json` or session rotated. **Fix:** delete `.auth/orangehrm.json` and re-run. `globalSetup` rebuilds it. |
| **OrangeHRM scenarios time out under parallel load** | The public demo throttles concurrent sessions hard. **Fix:** locally use `--workers=1` for OrangeHRM-only runs. CI is already serial. |
| **`npx playwright test` fails with "no test files found"** | Forgot to run `npx bddgen`. Features have not been compiled yet. **Fix:** `npx bddgen`, then re-run. Or use the npm scripts which do this automatically. |
| **`@flaky` scenarios are red on default `test:bdd` runs** | `test:bdd` should pass `--grep-invert @flaky`. Check `package.json` scripts. Run `@flaky` scenarios explicitly: `npx bddgen && npx playwright test --project=bdd:chromium --grep @flaky --workers=1 --headed`. |
| **Applitools dashboard shows duplicate checkpoints** | Most likely cause: the eyes fixture is opening more than one Eyes session per scenario. **Fix:** confirm `fixtures/index.ts` uses the lazy `state.eyes` pattern. The first `check()` opens; subsequent `check()`s reuse. |
| **CI fails with "no playwright-bdd config"** | `defineBddProject` must run inside the Playwright config's `projects` array; it is not a separate config file in this setup. Confirm `playwright.config.ts` has the spread + `defineBddProject` pattern intact. |
| **tsc passes locally but lint fails in CI** | Local Node version drift. format-check might pass on Node 18 but fail on the Node 20 runner. **Fix:** confirm `engines.node` in `package.json` matches your local Node. `nvm use 20` before pushing. |

### 5.5  Where to go next

The repo's "What's next" section names four follow-up sprints. Pick the one that best fits the role you are interviewing for and prototype it as a side branch:

- **axe-core accessibility checks.** Ten lines to wire in. Strong signal for a quality role; opens a conversation about WCAG conformance criteria you have actually worked with.
- **Plugin boundary for targets.** Adding a third target today still requires editing `fixtures/index.ts`. A `Target` interface each POM set implements would let new targets plug in without touching the core. Architecture signal.
- **Flake telemetry.** Emit per-scenario flake rates to a committed JSON snapshot. Lets the `@flaky` tag stop being a label and start being data.
- **Session health-check fixture.** Ping `/api/v2/dashboard/employees` in a worker `beforeEach` to catch stale `storageState` before the scenario spends a second on it.

### 5.6  A final word

Phase 1 is not the deliverable. The deliverable is the habit it builds — that you decide whether a tool earns its line in the stack, write down what you tried, and ship something a stranger can clone and run. The repo is the receipt; the LinkedIn post is the megaphone; the next role is the payoff.

Take the lessons forward. Phase 2 is API-Agent automation, Phase 3 is observability — both will be easier because the muscles you built here transfer.

— *end of guide* —
