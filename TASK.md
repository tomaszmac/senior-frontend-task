# Task Notes

## Workflow Used Across Tasks

Each README task was handled as a separate, reviewable slice. I used a lightweight GSD-assisted workflow rather than a full milestone process:

1. Clarify the task with `$gsd-explore`, using the README, project docs, and current code as the source of truth.
2. Create a scoped implementation plan with `$gsd-plan-phase <task-number> --mvp --skip-research`.
3. Review the plan before implementation and adjust it if the task boundaries were unclear.
4. Execute the approved plan with `$gsd-execute-phase <task-number>`, keeping the work limited to the active README task.
5. Run a focused review with `$gsd-code-review <task-number> --depth=standard`.
6. Validate the user-facing behavior with `$gsd-verify-work <task-number>` and manual browser checks where relevant.
7. Update `TASK.md` with the process notes, AI usage, feedback, dependency decisions, and verification results.
8. Run the project checks from the README, mainly `npm run build`, plus targeted browser verification.
9. Stage only the files that belong to the current task.
10. Commit each task separately with a descriptive message, for example `feat: implement task 2 shortest path BFS`.

### AI tools used

- GSD was the main workflow skill. I used it to move from task exploration to planning, implementation, review, verification, and a separate commit for each README task. (available on github)
- Harness Engineering was used at the start to create a compact project map for future agents: `AGENTS.md`, `ARCHITECTURE.md`, `docs/INDEX.md`, and `docs/quality.md`. (personal skill).
- Humanizer was used when writing reviewer-facing notes in `TASK.md`, mainly to keep the AI usage and prompt excerpts concise and natural. (available on github)
- Caveman-style compression was used for short planning and review summaries where a compact handoff was more useful than long prose. (available on github)
- Chrome DevTools MCP was used for browser verification against the local Vite app, including interactive checks for graph behavior, Path mode, and live search. (available on github)

## Task 1 - Refactor + i18n

### Process

- Read `README.md`, `ARCHITECTURE.md`, `docs/INDEX.md`, `docs/quality.md`, and `.planning/phases/01-task-1-refactor-i18n/01-PLAN.md`.
- Extracted duplicated `fmtTime()` into `src/utils/format.js`.
- Moved node type colors and type-label translation keys into `src/utils/types.js`.
- Added `vue-i18n` Composition API setup with Polish as the default locale and English fallback.
- Moved UI copy into `src/locales/en.json` and `src/locales/pl.json`.
- Added an `EN | PL` language switch in the header. It changes locale without reloading the page.
- Left Task 2 BFS and Task 3 live search untouched.
- Kept `src/data/mock.js` unchanged.

### AI Tool Use

Used OpenAI Codex as planning, coding, and review assistant.

Prompt scope given to Codex:

- execute README Task 1 only;
- follow `AGENTS.md` and the project docs;
- do not edit mock data;
- keep changes minimal for the interview task;
- use `TYPE_LABELS` as a type-to-i18n-key map, not as UI copy;
- update `TASK.md`;
- run `npm run build`;
- keep `.idea/` and unrelated planning files out of the Task 1 commit.

What worked well in the AI output:

- It kept the Task 1 implementation scoped and did not implement Task 2/3.
- It separated translatable UI copy from graph/type configuration.
- It preserved the mock data file and used the README-defined build command.
- The follow-up code review found no blocking or warning-level issues.

Feedback given to AI:

- Treat `TYPE_LABELS` as translation keys because Task 1b and Task 1c overlap.
- Move app title, button titles, loading states, empty states, and node type labels into locale JSON.
- Remove completed Task 1 TODO comments while keeping Task 2/3 TODO comments.
- Keep the implementation small and reviewer-friendly.

Selected prompts used:

```text
Use Harness Engineering to create a first-pass harness structure.

Keep it compact. This is a small frontend/Vite project, so do not create empty folder theater.

Create or update:
- AGENTS.md as the short agent entrypoint
- ARCHITECTURE.md as a small code map
- docs/INDEX.md as the docs hub
- docs/quality.md only if useful

First inspect package.json, README.md, src/, and vite.config.js. Use real commands from package.json.
Do not invent build, test, or run commands.

For this kind of fresh task, the right output is probably:

AGENTS.md
ARCHITECTURE.md
docs/
  INDEX.md
  quality.md

Not a large article-style documentation tree. Collapse sections for a small project.
```

```text
Plan README Task 1 as the first implementation phase.

Read the local README and project docs first. Treat Task 1 as one commit containing:
- 1a fmtTime extraction;
- 1b shared type configuration;
- 1c vue-i18n with Polish default locale and EN/PL runtime switch.

Do not plan Task 2 BFS or Task 3 live search yet. Keep the plan detailed enough that another agent can execute it without making product or architecture decisions.
```

```text
Check one technical decision before implementation:
how should TYPE_LABELS work after adding vue-i18n?

README Task 1b asks for TYPE_LABELS and TYPE_COLORS in src/utils/types.js.
README Task 1c says node type labels from TYPE_LABELS must be translated.

```

```text
Execute the plan in .planning/phases/01-task-1-refactor-i18n/01-PLAN.md.

Scope:
- implement README Task 1 only;
- do not edit src/data/mock.js;
- do not implement Task 2 or Task 3;
- update TASK.md with process notes, AI usage, feedback, dependency justification, and verification;
- run npm run build;
- commit one atomic Task 1 change if verification passes.

Keep changes small and reviewer-friendly. Do not stage .idea or unrelated planning files.
```

```text
Run a GSD-style code review for the current Task 1 implementation.

Review the working tree and latest commit for:
- missed README acceptance criteria;
- i18n or pluralization issues;
- dependency/package consistency;
- accidental changes to src/data/mock.js;
- runtime or build problems.

Do not fix code. Write findings with severity and file references, then run npm run build if feasible.
```

### Dependency Justification

Added `vue-i18n@9.14.5` because README Task 1c explicitly requires `vue-i18n` v9 with Composition API support, runtime language switching, and pluralization.

`npm install` warned that v9 is EOL/no longer supported upstream. I stayed on v9 to match the assignment requirement instead of silently upgrading to a newer major version.

### Verification

- `npm run build`: passed with Vite `8.0.5`.
- First sandboxed build hit Windows `spawn EPERM`; rerun outside sandbox passed.
- `src/data/mock.js`: unchanged.
- GSD-style review for Task 1 reported: Critical `0`, Warning `0`, Info `1`; the Info finding was this delivery-log cleanup.

## Task 2 - Shortest Path BFS

### Process

- Read `README.md`, `ARCHITECTURE.md`, `docs/quality.md`, and the `TODO Task 2` block in `Graph.vue`.
- Implemented Path mode inside `Graph.vue`.
- Added a Path toggle overlay on the graph canvas.
- Added two-click path selection: first click chooses the start node, second click chooses the end node and runs BFS.
- Treated graph links as undirected when building the adjacency list.
- Handled `force-graph` link endpoints as either raw slug strings or mutated node objects.
- Highlighted path nodes and links, and dimmed non-path graph elements after a path is found.
- Added a visible start-node ring while Path mode is waiting for the second click.
- Added localized `Path` and `No path found` copy.
- Kept Task 3 search untouched.
- Kept `src/data/mock.js` unchanged.

### AI Tool Use

Used OpenAI Codex as the implementation, review, and browser-verification assistant.

What worked well in the AI output:

- It kept the BFS logic local to `Graph.vue`.
- It handled the `force-graph` mutation case instead of assuming links always keep string endpoints.
- It used stable endpoint-derived link keys for path highlighting.
- The follow-up review caught that the implementation matched the README logic but was missing a clear first-click UX indicator.

Feedback given to AI:

- Keep this limited to README Task 2.
- Do not implement Task 3 search.
- Do not edit `src/data/mock.js`.
- Keep normal node selection behavior when Path mode is off.
- Add a visible marker after the first Path-mode click, because otherwise the user cannot tell which start node was selected.

Selected prompts used:

```text
Implement README Task 2 only.

Add a Path mode in Graph.vue. Two node clicks should choose the start and end,
then run BFS over the graph as an undirected graph. Highlight the shortest path,
dim everything else, and reset the whole path state when Path mode is turned off.

Do not edit src/data/mock.js. Do not implement Task 3.
```

```text
Review the current Task 2 diff against the intended logic.

Check whether Path mode is local to Graph.vue, whether BFS is O(V + E),
whether force-graph-mutated endpoints are handled, and whether normal node
selection still works when Path mode is off.
```

```text
Fix the Path-mode UX gap.

After the first node click, show a clear start-node indicator immediately.
Keep the rest of the graph normal until the second click resolves a full path.
```

### Dependency Justification

No new dependency was added for Task 2. BFS uses the existing local graph data and Vue component state.

### Verification

- `npm run build`: passed with Vite `8.0.5`.
- `git diff -- src/data/mock.js`: empty.
- Browser check with `npm run dev`: Path toggle works, the first clicked node shows a start marker, the second clicked node resolves a highlighted shortest path, and turning Path mode off clears the path state.

## Task 3 - Live Graph Search

### Process

- Read `AGENTS.md`, `README.md`, `ARCHITECTURE.md`, `docs/INDEX.md`, `docs/quality.md`, and `.planning/phases/03-task-3-live-search/PLAN.md`.
- Added a Graph-tab-only header search in `App.vue` beside the graph status.
- Matched only `node.title`, case-insensitively, with whitespace-only input treated as empty search.
- Added live match counting, a clear button, `/` focus, and `Escape` clear.
- Passed the query to `Graph.vue` through `filterQuery`.
- Dimmed non-matching nodes and added a subtle ring for matches.
- Preserved Task 2 Path mode priority so resolved path nodes stay visually strongest even with an active search.
- Added responsive header styles so the search remains visible on narrow widths.
- Kept `src/data/mock.js` unchanged.

### AI Tool Use

Used OpenAI Codex as the implementation and verification assistant.

What worked well in the AI output:

- It kept matching scoped to graph node titles instead of expanding into source or markdown search.
- It kept the search state in `App.vue`, where the header and match counter live.
- It refreshed the settled force-graph canvas when the query changes.
- It kept Path mode and Search mode composable instead of replacing the Task 2 rendering logic.

Feedback given to AI:

- Keep Task 3 scoped and do not refactor unrelated components.
- Do not edit `src/data/mock.js`.
- Preserve Task 2 Path mode behavior.
- Use existing i18n and pluralization patterns.
- Do not add dependencies.

Selected prompt used:

```text
Use the $gsd-execute-phase skill for Task 3 in this workspace.

Implement README Task 3 from the existing plan. Keep search limited to node.title
with case-insensitive matching. Preserve Task 2 Path mode behavior, keep Path
highlighting visually stronger than search dimming, add localized match count
and clear-button copy, verify the change with build and browser checks, update
TASK.md, and commit Task 3 separately if verification passes.
```

### Dependency Justification

No new dependency was added for Task 3. The live search uses Vue state, computed values, and the existing force-graph rendering hooks.

### Verification

- `npm run build`: passed with Vite `8.0.5`.
- Browser check with `npm run dev`: search appears only on the Graph tab, updates the count live, highlights matching title nodes, treats whitespace as empty, shows `0 wyników` for no matches, clears through the clear button and `Escape`, focuses with `/`, and hides on the Sources tab.
- Browser check with `npm run dev`: Path mode still toggles, resolves a shortest path, and remains visually clear with an active search query.
- Browser check with a narrow viewport: header controls wrap without overlap, and the search remains visible and usable.
- `git diff -- src/data/mock.js`: empty.
- `git diff -- package.json package-lock.json`: empty.

## Final Polish Pass

### Process

- Removed stale completed TODO comments from the Vue components so the submitted code no longer looks like unfinished task scaffolding.
- Added cancellation guards to the async detail-panel watchers in `App.vue` and `SourcesView.vue`, so fast selection changes cannot render stale details after the simulated loading delay.
- Extracted repeated UI colors into CSS custom properties in `src/style.css`.
- Updated `Graph.vue` to read canvas/link/search colors from those CSS variables while keeping semantic node colors in `src/utils/types.js`.
- Fixed narrow-viewport detail panels so the close button remains visible when a graph node or source part is selected.
- Kept `src/data/mock.js` unchanged.

### AI Tool Use

Used OpenAI Codex for the review and cleanup pass. A dedicated worker subagent handled the CSS-variable extraction in `style.css` and `Graph.vue`, while the main agent handled stale TODO removal and async watcher hardening.

Prompt scope given to the worker:

```text
Extract repeated UI colors into CSS custom properties in src/style.css.
Update Graph.vue to consume those variables for graph background, links, search
highlight, selected ring, and labels. Preserve the existing visual appearance,
keep TYPE_COLORS for semantic node/path colors, remove stale completed TODO
comments in Graph.vue, do not touch src/data/mock.js, and run npm run build.
```

### Dependency Justification

No new dependency was added for the final polish pass.

### Verification

- `npm run build`: passed with Vite `8.0.5`.
- Browser check at `425px` width: source-part detail panel opens as a full-width overlay and the close button remains visible.
- `rg -n "TODO|Task 1|Task 2|Task 3" src`: no stale task comments remain.
- `git diff -- src/data/mock.js`: empty.

## Earlier Setup Notes

### Harness Structure

Before feature work, I added compact agent/project docs:

- `AGENTS.md`
- `ARCHITECTURE.md`
- `docs/INDEX.md`
- `docs/quality.md`

### Vite Audit Cleanup

Before Task 1, I checked `package.json`, `package-lock.json`, `npm audit`, and Vite/plugin compatibility.

`npm audit` reported moderate vulnerabilities through Vite/esbuild:

- `esbuild <=0.24.2`: dev server request exposure (`GHSA-67mh-4wv8-2f99`);
- `vite <=6.4.1`: optimized dependency source map path traversal (`GHSA-4w7w-66w2-5vf9`).

Risk was mostly dev-server side, especially if the dev server were exposed outside localhost. I upgraded Vite instead of leaving audit warnings because this is a small interview project with a small dependency surface, and a clean audit is easier to review.

Final setup dependency state:

- `vite`: `8.0.5`
- `@vitejs/plugin-vue`: `^6.0.6`

Verification for setup:

- `npm ls vite @vitejs/plugin-vue`: OK, no invalid peer dependency.
- `npm audit`: `found 0 vulnerabilities`.
- `npm run build`: passed with Vite `8.0.5`.
