# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What Is Fable

Design-system workbench shipped as a reusable Vite plugin (`fable-workbench`). Built with Lit 3 and Vite 7. Live demo: https://artmsilva.github.io/fable/

## Monorepo Layout

```
packages/
  fable/            # Core library + Vite plugin (npm name: fable-workbench)
    src/             # App shell, router, store, define helper, utilities
    ui/              # Built-in UI primitives (button, card, sidebar, etc.)
  demo/             # Example consumer app (deployed to GitHub Pages)
```

Root `package.json` uses npm workspaces. Scripts delegate to `packages/demo`.

## Commands

```bash
npm run dev              # Vite dev server with HMR at :3000 (runs demo)
npm run build            # Static export to packages/demo/dist/
```

## Architecture

**Stack**: Vanilla JS (ES modules) + Lit 3 + Vite 7. No transpiler beyond Vite. Biome for linting/formatting (no ESLint/Prettier).

**Vite plugin** (`packages/fable/src/plugin.js`): sets up resolve aliases so consumers import `fable-workbench`, `fable-workbench/plugin`, and `fable-workbench/style.css`.

**Package exports** (`packages/fable/package.json`):
- `.` -> `src/index.js` (boots the app shell + exports `define`)
- `./plugin` -> `src/plugin.js` (Vite plugin)
- `./style.css` -> `src/style.css`

**Three-pane layout** in `packages/fable/src/app.js`: navigator (left) -> preview (center) -> controls (right).

**State**: Singleton store in `packages/fable/src/store/app-store.js` with exported helper functions. Components listen for `"state-changed"` custom events on `window`. No Redux/MobX.

**Routing**: URLPattern-based router in `packages/fable/src/router.js`. Story URLs: `/components/:group?prop=value&recipe=axis.value`. Base path lazily resolved from `window.__FABLE_BASE_PATH__` (set by `app.js` from Vite's `import.meta.env.BASE_URL`).

**Component registration**: `define(tag, Class)` in `packages/fable/src/define.js` registers a custom element + extracts metadata (title, args, argTypes, stories, taxonomy) from static class fields.

## Key Conventions

### Consumer API
Consumers create a Vite app, add `fable()` plugin, then `import "fable-workbench"` and use `define()` to register components with stories. See `packages/demo/` for a minimal example.

### Story Authoring
Components declare stories via static fields on the class:
- `static title`, `static description`, `static status`
- `static args`, `static argTypes`, `static slots`
- `static stories = { StoryName: (args) => html\`...\` }`
- `static taxonomy = { group, category, tags }`

Then call `define("my-tag", MyClass)` to register.

### Biome Formatting
Double quotes, semicolons, 2-space indent, 100-char line width, ES5 trailing commas.

## Greenfield Mindset

Per ADR 0002 (`docs/decisions/0002-greenfield-no-legacy.md`): no legacy URL/schema backward compatibility required. Breaking old URLs or meta schemas is fine -- keep current code working and document changes.

## Key Paths

- `packages/fable/src/plugin.js` -- Vite plugin entry
- `packages/fable/src/define.js` -- component registration API
- `packages/fable/src/app.js` -- app shell orchestration
- `packages/fable/src/router.js` -- URLPattern router
- `packages/fable/src/store/app-store.js` -- global state
- `packages/fable/ui/` -- built-in UI primitives
- `packages/demo/` -- example consumer app
- `docs/decisions/` -- ADRs
- `docs/specs/` -- feature deep dives
- `.github/workflows/static.yml` -- GitHub Pages deploy
