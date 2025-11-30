# Fable

Design-system workbench built with Lit and Vite. Fable ships a story explorer, docs surface, tokens/icons browsers, and an in-progress playroom for composing UIs.

Live demo: https://artmsilva.github.io/fable/

## Surface Area

- **Home / discovery**: Hero, highlights, taxonomy chips, and recent component activity sourced from metadata.
- **Components**: Three-panel layout (navigator → preview → controls/source). Args/slots controls sync to the URL; auto permutations grid is generated from component props, argTypes, and story hints.
- **Docs**: Markdown-powered docs entries with ToC, embedded stories, and related metadata.
- **Tokens**: Token groups generated from `design-system/tokens.json` with preview tables.
- **Icons**: Gallery backed by `design-system/icons-src/` + manifest; per-icon deep link.
- **Playroom (alpha)**: Palette + Monaco-powered editor + live preview and inspector at `/playroom`.

## Stack

- **Vite** (`vite.config.ts`) with a custom import-map plugin (`plugins/import-map-plugin.ts`) to honor aliases from `config/import-map.json`.
- **Lit 3** web components; design-system primitives live under `src/design-system/` and register their own stories.
- **Path-based router** (`src/router.js`) using `URLPattern`; base path is derived from `FABLE_BASE_PATH`.
- **Global store** (`src/store/app-store.js`) drives view state, args/slots, permutations, metadata, and theme.

## Project Layout

- `src/index.html` – Vite entry; sets `__FABLE_BASE_PATH__`.
- `src/app.js` – App shell: initializes stories, store, and router; swaps between home/docs/tokens/icons/playroom/story preview.
- `src/components/` – Shell views (navigator, preview, controls, docs/tokens/icons views, playroom).
- `src/design-system/` – Primitive components + stories; barrel export at `src/design-system/index.js`.
- `src/metadata/` – Registry for components/docs/tokens/icons (per ADR 0001). Generated data lives in `src/metadata/generated/`.
- `config/import-map.json` – Source of module aliases consumed by the Vite plugin.
- `config/metadata.schema.json` – Validation schema for all metadata.
- `design-system/` – Token source (`tokens.json`), icon source SVGs (`icons-src/`), and generated manifest (`icons.json`).
- `docs/` – Specs and ADRs describing behavior and decisions.

## Getting Started

```bash
npm install
npm run dev    # HMR at http://localhost:3000
npm run build  # Outputs to dist/ with correct base path
npm run preview
```

Environment:

- `FABLE_BASE_PATH` sets the deployed base (default `/`, GH Pages sets `/<repo>/`).
- `PORT` controls the dev server port (defaults to 3000).

## Scripts & Tooling

- `npm run check` — Lint/style/import checks (Biome + custom linters).
- `npm run check:fix` — Auto-fix Biome issues.
- `npm run validate:metadata` — Validate all metadata against `config/metadata.schema.json` (run when touching `src/metadata/**` or `design-system/{tokens.json,icons-src}`).
- `npm run tokens:sync` — Regenerate `src/design-system/tokens.css` and `src/metadata/generated/tokens-data.js` from `design-system/tokens.json`.
- `npm run icons:sync` — Rebuild `design-system/icons.json` and `src/metadata/generated/icons-data.js` from SVGs in `design-system/icons-src/`.

## Authoring Stories & Metadata

1. **Create a component + stories** in `src/design-system/…`:
   - Define the element and export `meta` using `getComponentStoryMeta(...)` from `src/metadata/components.js`.
   - Add a `stories` object (functions or `{ args, render }`) and push `{ meta, stories }` to `window[STORIES_KEY]` from `src/config.js`.
   - Component `properties` and optional `permutationHints` power auto permutations in `src/utils/story-processor.js`.
2. **Register metadata**:
   - Components: add an entry in `src/metadata/components.js` (id, taxonomy, timestamps, description, `storyGroup`).
   - Docs: add to `src/metadata/docs.js` (section/slug/content/related stories).
   - Tokens/icons: edit `design-system/tokens.json` or add SVGs to `design-system/icons-src/` plus metadata in `scripts/sync-icons.js`, then run the respective sync script.
3. **Routing**:
   - Story URLs: `/components/:group/:story?prop=value&perm=axis.value`.
   - Docs: `/docs/:section/:slug`, Tokens: `/tokens/:id`, Icons: `/icons/:id`, Playroom: `/playroom`, Home: `/`.

## Deployment Notes

- Builds are static; `dist/` is the deploy artifact.
- The router and asset URLs respect `FABLE_BASE_PATH`; keep it set for subfolder hosts (e.g., GitHub Pages).
- Avoid editing `dist/` manually—run `npm run build` instead.

## Contributing Flow

- Run `npm run check` before committing; include `npm run validate:metadata` when metadata changes.
- Prefer verifying UI locally via `npm run dev` (HMR preserves router state).
- Follow ADR 0002 (greenfield): no legacy URL/schema support is required.
