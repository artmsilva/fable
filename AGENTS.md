# Agent Onboarding Guide

Welcome to Fable. This guide orients autonomous/LLM-based assistants so they can work safely and productively inside the repo.

## Repo Snapshot

- **Framework**: Vanilla JS + Lit web components, zero bundlers.
- **Entry Points**:
  - `src/index.html` – app bootstrap + import map.
  - `src/app.js` – Lit orchestration of navigator, preview, controls.
  - `src/store/` – shared state + selectors.
  - `src/components/` – design system primitives and composables with colocated stories.
  - `server.ts` – custom dev server with SSE live reload (planned HMR).
- **Docs & Specs**: `docs/spec.md` (overview) and `docs/specs/*.md` for feature deep dives. Architecture decisions live under `docs/decisions/`.

## Development Scripts

- `npm run dev` – custom dev server with live reload at `http://localhost:3000`.
- `npm run check` / `npm run check:fix` – Biome lint/format (no extra deps needed).
- `npm run build` (if present) – static export for GitHub Pages.
- `npm run validate:metadata` – validate schema compliance (ADR 0001) before landing metadata changes.
- `npm run tokens:sync` – regenerate CSS variables from `design-system/tokens.json`.
- `npm run icons:sync` – rebuild `design-system/icons.json` from SVGs in `design-system/icons-src/`.

## Story Authoring Pattern

1. Create component in `src/components/<name>.js`.
2. Define `meta` + `stories` arrays per README pattern, adhering to shared schema (`docs/decisions/0001-shared-metadata-schema.md`).
3. Import component in `src/app.js` and ensure window registry updated.

## Testing / Validation Expectations

- Prefer manual browser verification via `npm run dev`. Automated tests are minimal today; document manual steps in PR description.
- Run Biome checks before committing. No Prettier/ESLint.
- When touching metadata, run `npm run validate:metadata`; follow schema from ADR 0001.

## File Conventions

- Use ES modules, no bundler-specific APIs.
- CSS variables live in `src/style.css` until tokens pipeline lands.
- Keep components prefix-free (no `fable-` for design system primitives, yes for app shell components).
- Stories register themselves via `window.__FABLE_STORIES__`.

## Agent Safety Checklist

1. **Read Existing Changes**: Worktree may contain user edits; never revert unrelated modifications.
2. **Respect Zero-Bundler**: Avoid adding webpack/vite etc. Use native imports/CDN for dependencies.
3. **Greenfield Mindset**: ADR 0002 establishes that we ignore legacy/backward compatibility. Feel free to break old URLs/meta schemas—just keep current code working and document changes.
4. **Docs First**: Update specs/ADRs alongside code when introducing new behaviors.
5. **Testing**: Document what was tested. If unable to run tests, explain why.
6. **Files to Avoid**: Do not edit `dist/` directly; it is generated.

## Architecture Highlights

- UI structured as three-pane layout (`fable-story-navigator`, `fable-story-preview`, `fable-controls-panel`).
- Global store uses simple module-level state with helper functions; no Redux/MobX.
- Dev server (Node 20+ TypeScript) handles static files, SSE reload, MIME types, and prevents directory traversal.
- URL handling currently uses query params but slated for URLPattern router (`docs/specs/router.md`).

## Future Work References

- Feature roadmaps and detailed specs: `docs/specs/`.
- Shared metadata schema ADR: `docs/decisions/0001-shared-metadata-schema.md`.
- Use these docs to understand dependencies before coding.

## Communication Etiquette

- When uncertain, ask clarifying questions referencing file paths.
- Summaries should cite affected files with line numbers when possible.
- Keep responses concise; CLI handles formatting.

Happy shipping! Let this document evolve—agents should append notes when workflows change.
