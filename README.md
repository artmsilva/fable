# Fable

Design-system workbench built with Lit and Vite. Fable ships a story explorer, docs surface, and tokens/icons browsers.

Live demo: https://artmsilva.github.io/fable/

## Surface Area

- **Components**: Three-panel layout (navigator → preview → controls/source). Args/slots controls sync to the URL; an auto-generated “Recipes” story lists every recipe inferred from component props, argTypes, and story hints.
- **Playroom (alpha)**: Palette + Monaco-powered editor + live preview and inspector at `/playroom` (legacy prototype, currently disabled in production).

## Stack

- **Vite** (`vite.config.ts`) with a custom import-map plugin (`plugins/import-map-plugin.ts`) to honor aliases from `config/import-map.json`.
- **Lit 3** web components; design-system primitives live under `src/design-system/` and register their own stories.
- **Path-based router** (`src/router.js`) using `URLPattern`; base path is derived from `FABLE_BASE_PATH`.
- **Global store** (`src/store/app-store.js`) drives view state, args/slots, recipes, metadata, and theme.

## Project Layout

- `src/index.html` – Vite entry; sets `__FABLE_BASE_PATH__`.
- `src/app.js` – App shell: initializes stories, store, and router; swaps between story preview and the legacy playroom shell.
- `src/components/` – Shell views (navigator, preview, controls, playroom shell).
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
   - Component `properties` and optional `recipeHints` power auto recipes in `src/utils/story-processor.js`.
2. **Register metadata**:
   - Components: add an entry in `src/metadata/components.js` (id, taxonomy, timestamps, description, `storyGroup`).
   - Docs/tokens/icons metadata workflows have been removed from the current UI; keep entries only if downstream tools still reference them.
3. **Routing**:
   - Story URLs: `/components/:group/:story?prop=value&recipe=axis.value`.

## Deployment Notes

- Builds are static; `dist/` is the deploy artifact.
- The router and asset URLs respect `FABLE_BASE_PATH`; keep it set for subfolder hosts (e.g., GitHub Pages).
- Avoid editing `dist/` manually—run `npm run build` instead.

## Contributing Flow

- Run `npm run check` before committing; include `npm run validate:metadata` when metadata changes.
- Prefer verifying UI locally via `npm run dev` (HMR preserves router state).
- Follow ADR 0002 (greenfield): no legacy URL/schema support is required.
