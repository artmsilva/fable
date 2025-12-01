# Component Props Registry Spec

## Overview

Create a unified registry that inventories every prop/attribute/event exposed by Fable components so we can reason about API consistency, detect breaking changes early, and give consumers a searchable reference. The registry is generated from component metadata + stories, checked into the repo, and rendered in-app alongside docs.

## Goals

1. Provide a single machine-readable list of component props/attributes/events across `src/components/**`.
2. Highlight inconsistencies (naming, type, default, required state) before publishing.
3. Surface a searchable UI for consumers plus lint-like tooling for maintainers.
4. Plug into the backlog workflow: future changes reference registry entries to gauge break risk.

### Non-Goals

- Auto-generating full API docs per component (still rely on stories + Markdown).
- Deep runtime inspection of compiled components.
- Tracking CSS custom properties (future).

## Scope

- Lit-based primitives (buttons, dialogs, etc.) and app-shell components (`fable-story-preview`).
- Props (JS properties), reflected attributes, events, slots.
- Story-level controls referencing props (so controls remain synced).

## Data Sources

1. **Component Metadata**: Each component exports `export const props = [...]` (new convention), or extends existing story metadata defined per ADR 0001.
2. **Story Controls**: Stories define argTypes/controls; registry cross-check ensures every control references a declared prop.
3. **Manual Overrides**: YAML/JSON file for edge cases (private props, experimental flags).

## Registry Format

Generated file: `config/props-registry.json`.

```json
{
  "generatedAt": "2025-11-30T18:00:00.000Z",
  "components": [
    {
      "tag": "fable-button",
      "displayName": "Button",
      "status": "stable",
      "path": "src/components/button.js",
      "props": [
        {
          "name": "variant",
          "attribute": "variant",
          "type": "'primary' | 'secondary'",
          "required": false,
          "default": "'primary'",
          "since": "2024.10",
          "description": "Visual style token applied to the button.",
          "controls": ["select"],
          "stories": ["Default", "Destructive"],
          "breakingChangeRisk": "low"
        }
      ],
      "events": [
        { "name": "fable-button:click", "detail": "{ originalEvent: MouseEvent }" }
      ],
      "slots": [
        { "name": "default", "description": "Button label content." }
      ]
    }
  ]
}
```

Schema requirements:

- `status` enum: `experimental`, `beta`, `stable`, `deprecated`.
- `breakingChangeRisk`: derived field using heuristics (required prop removal => high).
- Each prop must map to attribute or explicitly set `attribute: null`.
- Provide `references` array linking to specs/backlog IDs.

## Generation Pipeline

1. **Annotate Components**
   - Each component adds `export const api = { props: [...], events: [...], slots: [...] };`.
   - Provide JSDoc-style comments to minimize duplication.
2. **AST Extractor**
   - New script `scripts/generate-props-registry.mjs`:
     - Uses `@babel/parser` to parse JS modules.
     - Looks for `export const api` or `export const props`.
     - Normalizes type info, merges with defaults.
   - Optionally read `stories` metadata to map controls.
3. **Registry Build**
   - Script outputs `config/props-registry.json` sorted alphabetically.
   - Add to `npm run tokens:sync`-style pipeline: `npm run props:sync`.
4. **Validation**
   - Add `npm run validate:props` ensuring:
     - No duplicate prop names per component.
     - No attribute collisions across components unless flagged.
     - Every prop used in story controls.

## UI & Surfacing

1. **Docs View**
   - Add `/docs/api` route showing searchable table:
     - Filters: component, prop name, status, type.
     - Columns: Prop, Attribute, Type, Default, Status, Since, Description.
   - Provide “copy import snippet” and spec link per component.
2. **Component Detail Tabs**
   - Each component story page gets a “API” tab powered by registry data filtered by `tag`.
3. **Diff View for Maintainers**
   - CLI command `npm run props:diff` comparing registry between git refs to highlight breaking changes.
   - Output consumed in PR template (paste diff summary).

## Store Integration

- New module `src/store/props-registry.js`:
  - Loads JSON via static import.
  - Selectors: `selectPropsByComponent(tag)`, `selectPropsSearch(query)`, `selectBreakingRisk(level)`.
  - Derived mapping `tag -> { props, events, slots }`.
- Extend global window debug: `window.__FABLE_PROPS__`.
- Router update to support `/components/:group/:story?tab=api`.

## Workflow

1. Author component/story changes.
2. Update `api` export (props/events/slots).
3. Run `npm run props:sync` → regenerates registry.
4. Run `npm run validate:props` or `npm run check`.
5. Commit component code + registry diff together.
6. Mention impacted backlog IDs (for roadmap coordination).

## Breaking Change Detection

- `props:diff` script calculates:
  - Removed prop/attribute → `HIGH` risk.
  - Type narrowing or new required prop → `MEDIUM`.
  - Default change → `LOW`.
- Emit markdown summary stored under `ops/diffs/props/<timestamp>.md` for audit (optional).
- Hook script into CI (GitHub Action) commenting on PR.

## Implementation Plan

1. Define schema + TypeScript types (store uses `PropsRegistryEntry`).
2. Update representative components with `api` export to seed data.
3. Build generator + validation scripts.
4. Create docs UI (API route + component tabs).
5. Integrate diff workflow + PR template guidance.

## Testing Strategy

- Unit tests for generator (fixtures in `tests/props-registry/`).
- Golden file test ensuring JSON sorted + deterministic.
- Cypress/Playwright scenario verifying `/docs/api` search.
- Manual verification: edit component prop, run sync, confirm UI updates.

## Risks

- **Drift between code + registry**: solved by gating merges on `npm run props:sync`.
- **Parser fragility**: mitigate by limiting supported export patterns and documenting them.
- **File size**: For many components, JSON may grow; lazy load view using dynamic import.

## Open Questions

- Should slots/events live in same JSON or separate (for caching)? (Current plan: same file.)
- Do we want to expose JSON publicly (download link) for ecosystem tooling? (Likely yes; add `public/api/props.json` copy step.)
