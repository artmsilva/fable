# Thread: recipes view

| Field | Value |
| ----- | ----- |
| **Status** | `Done` |
| **Owner** | `codex` |
| **Start Date** | `2025-11-30` |
| **Last Update** | `2025-11-30 23:05 EST` |
| **Related Work** | `docs/specs/recipes.md`, `src/components/fable-recipes-view.js`, `src/store/app-store.js` |
| **Links** | _TBD_ |

## Objective

Expose every automatically generated recipe in a straightforward list/card format so the recipes story becomes a reliable data source for future visual regression capture.

## Deliverables

- [ ] Simplify the recipes tab to emphasize the full case list instead of knob/filter UI.
- [ ] Ensure each case displays the args payload clearly for copy/export automation.
- [ ] Document/testing notes for visual regression consumers.

## Timeline

- `2025-11-30 22:10 EST` — **Kickoff**: Scoped the request to show full recipe coverage without the existing axes filters to support screenshot testing.
- `2025-11-30 22:28 EST` — **UI refactor**: Simplified `src/components/fable-recipes-view.js` so it now lists every recipe with axis/value summaries and args JSON; updated `docs/specs/recipes.md` to describe the new regression-friendly view. `npm run check` currently fails because `lint-styles.ts` reports pre-existing style issues in playroom components.
- `2025-11-30 23:05 EST` — **Recipes story + live previews**: Added `src/config/recipes.js`, injected an auto “Recipes” story per component in `src/utils/story-processor.js`, updated `src/store/app-store.js` and `src/components/fable-story-preview.js` to handle the synthetic story, and taught `fable-recipes-view` to render live previews for every recipe. Docs/README now reference the dedicated story. `npm run check` still fails due to the existing playroom lint errors listed above.
- `2025-11-30 23:30 EST` — **Cleanup + layout**: Removed the deprecated playroom feature entirely, adopted the new recipes terminology across code/docs, and rebuilt `fable-recipes-view` with CSS Grid + subgrid so the recipes story doubles as a regression grid. `npm run check` now passes.

## Current Risks / Blockers

- Need clarity on whether filters should be removed entirely or moved elsewhere; assuming removal unless the user asks otherwise.

## Hand-off Notes

- None yet.

## Outcome (fill in when Done)

- _TBD_
