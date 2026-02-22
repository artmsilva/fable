# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What Is Fable

Design-system workbench built with Lit 3 and Vite. Ships a story explorer, docs surface, and tokens/icons browser. Live demo: https://artmsilva.github.io/fable/

## Commands

```bash
npm run dev              # Vite dev server with HMR at :3000
npm run build            # Static export to dist/
npm run check            # Lint pipeline: style linter + import linter + Biome (changed files only)
npm run check:fix        # Auto-fix Biome issues
npm run validate:metadata  # Validate metadata against config/metadata.schema.json
npm run tokens:sync      # Regenerate CSS vars + data from design-system/tokens.json
npm run icons:sync       # Rebuild icon manifest from design-system/icons-src/ SVGs
```

Run `npm run check` before committing. Add `npm run validate:metadata` when touching `src/metadata/**` or `design-system/`.

## Architecture

**Stack**: Vanilla JS (ES modules) + Lit 3 + Vite 7. No transpiler beyond Vite. Biome for linting/formatting (no ESLint/Prettier).

**Three-pane layout** in `src/app.js`: navigator (left) -> preview (center) -> controls (right).

**State**: Singleton store in `src/store/app-store.js` with exported helper functions. Components listen for `"state-changed"` custom events on `window`. No Redux/MobX.

**Routing**: URLPattern-based router in `src/router.js`. Story URLs: `/components/:group/:story?prop=value&recipe=axis.value`. Base path from `FABLE_BASE_PATH` env var (GitHub Pages support).

**Module aliases** (defined in `config/import-map.json`, resolved by `plugins/import-map-plugin.ts`):
- `@design-system` / `@design-system/*` — primitives and stories
- `@store` — app state
- `@utils` — utility functions
- `@config` — project constants
- `@metadata` — component/docs/tokens/icons registry

## Key Conventions

### Import Rules (enforced by `lint-imports.ts`)
App code (`src/components/`, `src/store/`, `src/utils/`) must use `@`-prefixed aliases for cross-module imports. Relative imports are only allowed within `src/design-system/`.

### Style Boundary (enforced by `lint-styles.ts`)
Only `src/design-system/` components may have `static styles = css\`...\``. App shell components in `src/components/` must not define styles — use design system components instead. Add `@allow-styles` comment to opt out in exceptional cases. No inline `style=` attributes or `this.style` mutations in app components.

### Component Naming
Design system primitives: no prefix (e.g., `fable-button`). App shell components: `fable-` prefix (e.g., `fable-story-navigator`).

### Story Authoring
1. Create component in `src/design-system/<name>.js`
2. Define `meta` via `getComponentStoryMeta()` from `src/metadata/components.js`
3. Export `stories` object (functions or `{ args, render }` format)
4. Push `{ meta, stories }` to `window[STORIES_KEY]` (from `@config`)
5. Import the component in `src/design-system/index.js`

### Biome Formatting
Double quotes, semicolons, 2-space indent, 100-char line width, ES5 trailing commas.

## Greenfield Mindset

Per ADR 0002 (`docs/decisions/0002-greenfield-no-legacy.md`): no legacy URL/schema backward compatibility required. Breaking old URLs or meta schemas is fine — keep current code working and document changes.

## Progress Tracking

Every user request must have a thread log under `ops/threads/`. Copy `ops/threads/TEMPLATE.md`, fill metadata, and register in `ops/threads/README.md`. Update timeline/status when pushing code or hitting blockers.

## Key Paths

- `docs/spec.md` — feature specifications
- `docs/decisions/` — ADRs (metadata schema, greenfield, Vite adoption)
- `docs/specs/` — feature deep dives
- `config/metadata.schema.json` — validation schema for all metadata
- `design-system/tokens.json` — token source (colors, spacing, typography)
- `src/metadata/generated/` — auto-generated data files (do not edit manually)
- `dist/` — build output (do not edit manually)
