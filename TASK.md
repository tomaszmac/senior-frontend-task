# Task Notes

## Process
- Checked `package.json`, `package-lock.json`, `npm audit`, and Vite/plugin compatibility before dependency update.

## AI Tool Use

Used OpenAI Codex as coding/review assistant.

Asked Codex to:

## Feedback Given To AI

## Dependency Notes

### Vite

`npm audit` reported moderate vulnerabilities through Vite/esbuild:

- `esbuild <=0.24.2`: dev server request exposure (`GHSA-67mh-4wv8-2f99`);
- `vite <=6.4.1`: optimized dependency source map path traversal (`GHSA-4w7w-66w2-5vf9`).

Risk mostly dev-server side, not production bundle from `npm run build`.
Risk highest when dev server exposed outside localhost, for example `vite --host`.

I upgraded Vite instead of leaving audit warnings because this is small interview project, small dependency surface, and clean audit is easier to review.
I did not blindly use `npm audit fix --force`; Vite 8 is major upgrade, so compatibility was checked.

Final dependency state:

- `vite`: `8.0.5`
- `@vitejs/plugin-vue`: `^6.0.6`

`@vitejs/plugin-vue` was upgraded too because old `5.2.4` peer range supported only Vite `^5.0.0 || ^6.0.0`.

### vue-i18n

If added for Task 1c: required by assignment for Composition API i18n, runtime language switch, and pluralization.

## Verification

- `npm ls vite @vitejs/plugin-vue`: OK, no invalid peer dependency.
- `npm audit`: `found 0 vulnerabilities`.
- `npm run build`: passed with Vite `8.0.5`.
- `src/data/mock.js`: must remain unchanged.

## Harness Structure

Short setup commit before feature work.

- Inspected `package.json`, `README.md`, `src/`, and `vite.config.js`.
- Added compact agent/project docs: `AGENTS.md`, `ARCHITECTURE.md`, `docs/INDEX.md`, and `docs/quality.md`.
