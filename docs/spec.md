# Fable Feature Specification

## Product Vision

- Expand Fable into a full design system workbench where teams can discover components, browse documentation, and prototype compositions collaboratively.
- Prioritize richer stories, powerful discovery/navigation, improved authoring/dev workflows, and first-class surfacing of system primitives (tokens, icons).

## Feature Specifications

### Recipes Engine

- **Goal**: Auto-generate recipes by inferring axes/values from component code, meta args, and story definitions so authors never hand-write recipes metadata.
- **User Experience**:
  - `Recipes` tab beside existing controls with an “Auto” badge + axis count.
  - Axis filters show the signal source (enum, boolean, story) and can be toggled to trim the grid.
  - Virtualized grid/list renders every valid combination; selecting a cell syncs preview + URL and exposes copy/CSV/export actions.
- **Technical Approach**:
  - Enhance `processStories` (`src/utils/story-processor.js`) with an `analyzeRecipes` step that inspects `customElements.get(meta.component).properties`, `meta.argTypes`, and `stories` to build a blueprint (`axes`, budget, warnings).
  - Store the blueprint alongside story metadata (`story.meta.recipeBlueprint`) and persist selection state in `app-store`.
  - Extend the router + URL manager to encode `?recipe=variant.beta+disabled.false`, and teach `fable-story-preview` / `fable-recipes-view` how to consume the blueprint.
- **Dependencies**: Router/query parsing (URLPattern spec), virtualization utilities shared with icons grid, optional `recipeHints` author annotations defined in component code (not metadata).

### Docs Story Type

- **Goal**: Support MDX-like documentation stories mixing prose, code, and live examples.
- **User Experience**:
  - Navigator shows “Docs” section entries with hero content, outlines, and embedded live canvases.
  - Docs pages can embed existing stories via helper like `renderStory(storyId)`.
- **Technical Approach**:
  - Accept `meta.type = "docs"` referencing Markdown/MDX content.
  - Implement `<fable-docs-page>` to render Markdown (Markdown-it) with Prism.js highlighting and live story embeds.
  - Allow content to be fetched lazily or bundled as template strings.
- **Dependencies**: Content pipeline, syntax highlighting assets, navigator layout tweaks.

### Homepage / Discovery Page

- **Goal**: Provide a landing experience summarizing components, featured docs, and quick filters.
- **User Experience**:
  - Default route (no story) shows discovery grid: hero, “Recently Added/Updated,” taxonomy chips, search spotlight, quick links to tokens/icons.
- **Technical Approach**:
  - Add router state `view=home`.
  - Store metadata like `meta.updatedAt` in app store to power lists.
  - Home view component consumes taxonomy and search data.
- **Dependencies**: Requires taxonomy data and router updates.

### Search & Taxonomy

- **Goal**: Enable scalable discovery by component, tag, platform, status.
- **User Experience**:
  - Persistent search box with instant results (title/type/tags).
  - Sidebar filter drawer for taxonomy facets (component family, status, platform, accessibility).
- **Technical Approach**:
  - Build in-memory index (Fuse.js or custom) seeded from story metadata.
  - Extend meta with `tags`, `status`, `platforms`; define taxonomy in `src/config.js`.
  - Store selectors filter navigator lists based on active facets.
- **Dependencies**: Navigator UI overhaul, lint/tooling to ensure metadata presence.

### Hot Module Reload

- **Goal**: Preserve controls state while reloading only changed modules during development.
- **User Experience**:
  - On save, app re-renders affected component without losing selected story or controls.
- **Technical Approach**:
  - Enhance dev server SSE to emit `module-update` events with changed paths.
  - Browser client dynamically re-imports modules with cache-busting query.
  - Track module graph to know dependents; fallback to full reload on failure.
- **Dependencies**: Module tracking, runtime patch hooks (guarded `customElements.define`), robust error overlay.

### URL Router with URLPattern

- **Goal**: Replace manual query parsing with declarative router supporting nested paths (`/docs/components/button`).
- **User Experience**:
  - Human-friendly URLs, reliable back/forward navigation, shareable recipe URLs (`/components/button/primary?size=large`).
- **Technical Approach**:
  - Introduce router module using `URLPattern`; map patterns to Home, Docs, Story views.
  - Update URL manager utilities and ensure history synchronization.
  - Provide migration for legacy query params (detect and redirect).
- **Dependencies**: Store integration, tests ensuring canonical URL generation.

### Design Tokens Support

- **Goal**: Surface colors, typography, spacing as first-class citizens with documentation and live inspection.
- **User Experience**:
  - “Tokens” docs page with swatches, copy buttons, usage guidance.
  - Controls auto-complete token names; recipes can reference token sets.
- **Technical Approach**:
  - Store tokens in JSON (e.g., `design-system/tokens.json`) and sync to CSS variables.
  - Build `<fable-token-table>` to render token categories and live previews; read computed styles to stay in sync.
  - Expose tokens to other surfaces (navigator search, docs) via shared data module.
- **Dependencies**: Token source of truth, build script to regenerate CSS + docs.

### Icons Documentation

- **Goal**: Gallery of system icons with names, usage guidance, downloadable SVGs.
- **User Experience**:
  - Grid view with search, size/background toggles, copy-to-clipboard, per-icon detail linking to docs story.
- **Technical Approach**:
  - Import icons from `design-system/icons/*.svg`; auto-generate manifest with metadata.
  - Build `<fable-icon-gallery>` with virtualization for large sets.
  - Provide `npm run icons:sync` script to rebuild manifest from source SVGs.
- **Dependencies**: Integrates with taxonomy (Foundations > Icons) and search index.

## Cross-Cutting Considerations

- **Shared Metadata Schema (ADR 0001)**: Adopt the schema defined in `docs/decisions/0001-shared-metadata-schema.md`, covering component stories, docs entries, tokens, and icons. All features consume the centralized registry, and dev-time validation (JSON Schema + TypeScript types) ensures required fields (`id`, `title`, taxonomy info, timestamps, recipes config) are always present.
- **Persistence (Greenfield)**: Manage URL/localStorage formats for the current iteration only—breaking older links/schemas is acceptable per ADR 0002, but document material changes.
- **Performance**: Virtualization for large grids (recipes, icons). Debounce search queries.
- **Accessibility**: Keyboard/focus management, semantic headings for new views (home, docs).
- **Rollout Strategy**: Phase delivery—foundation (schema/router), discovery/search, rich stories (recipes/docs), primitives (tokens/icons).
