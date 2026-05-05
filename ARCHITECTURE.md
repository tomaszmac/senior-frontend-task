# Architecture

This project is a single-page Vue 3 app built with Vite. It visualizes a local wiki-style knowledge graph and source-file metadata.

## Runtime Flow

- `index.html` loads the Vite app.
- `src/main.js` mounts `src/App.vue`.
- `src/App.vue` owns the top-level tab state, selected graph node, and selected detail panel.
- `src/data/mock.js` is the local data source for graph nodes, links, source files, and source parts.

## UI Map

- `src/components/Graph.vue` renders the graph canvas with `force-graph`.
- `src/components/ChunkPanel.vue` renders selected node details, related chunks, markdown body, and source references.
- `src/components/SourcesView.vue` renders source-file cards and part tables.
- `src/components/PartPanel.vue` renders selected source-part details.
- `src/style.css` contains the global dark theme and component styling.

## Current Boundaries

- Data access is intentionally local and synchronous-looking, with small simulated loading delays in the UI.
- Graph interactions live in `Graph.vue`; app-level selection state lives in `App.vue`.
- Formatting/type configuration is currently duplicated in components and is expected to move into `src/utils/` as part of Task 1.
- Internationalization files and setup do not exist yet; Task 1c should add them without hardcoding UI copy in templates.

## Invariants

- Treat links in the graph as task data from `src/data/mock.js`; do not mutate the source file to solve UI tasks.
- Use README-defined commands only: `npm run dev` and `npm run build`.
- Keep new structure small. Add docs or folders only when they hold active project truth.

