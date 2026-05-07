# Task Notes

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
