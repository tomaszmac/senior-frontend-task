# Quality Checklist

Use this as the lightweight quality surface for the current repo.

## Mechanical Checks

- Run `npm run build` before claiming implementation is complete.
- Use `npm run dev` for browser verification when checking interactive graph behavior.
- There is no automated test or lint script in `package.json` right now.

## Manual Verification Targets

- Task 1: UI defaults to Polish, language switch changes copy without reload, duplicated time/type helpers are removed, and `src/data/mock.js` is unchanged.
- Task 2: Path mode resets cleanly, treats graph links as undirected, highlights only the shortest path, and handles no-path state.
- Task 3: Search is visible only on the Graph tab, updates match count live, highlights matching nodes, and clears predictably.

## Delivery Constraints

- Update `TASK.md` with process notes, AI tools used, feedback, prompts if useful, and any added-library justification.
- Commit each README task separately.
- Keep added abstractions proportional to this small app.

