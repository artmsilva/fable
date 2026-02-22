# Thread: dead code cleanup

| Field | Value |
| ----- | ----- |
| **Status** | `Done` |
| **Owner** | `claude` |
| **Start Date** | `2026-02-22` |
| **Last Update** | `2026-02-22 04:00 PT` |
| **Related Work** | `src/store/app-store.js`, `src/router.js`, `src/style.css`, `src/config/`, `src/utils/url-manager.js` |
| **Links** | _TBD_ |

## Objective

Remove confirmed-dead exports, CSS classes, and orphaned files left over from the removed homepage view and past refactors. All removals are safe — verified by grep across the full src tree.

## Deliverables

- [x] `app-store.js` — remove 5 homepage methods + 8 dead exports; remove homepage-content.js imports
- [x] `src/config/homepage-content.js` — delete (only consumer was app-store.js)
- [x] `src/router.js` — remove 3 dead exports (`matchRoutePath`, `getRouteDefinitions`, `getCurrentRoute`)
- [x] `src/router/base-path.js` — remove dead `getBasePath` export
- [x] `src/utils/url-manager.js` — remove dead `parseArgsFromSearch` export
- [x] `src/config/metadata-registry.js` — remove 4 dead exports
- [x] `src/style.css` — remove 7 dead CSS blocks (homepage remnants + preview-tab-row)
- [x] `src/design-system/code-syntax-editor.js` — delete (not in barrel, not imported anywhere)

## Timeline

- `2026-02-22 03:00 PT` — **Cleanup pass**: Removed all confirmed-dead exports and orphaned files identified by static analysis.
- `2026-02-22 04:00 PT` — **Complete**: All cuts applied, unused import cleaned up, `npm run check` passes clean.

## Current Risks / Blockers

- None. All removals verified by import/usage grep before cutting.

## Outcome

- All 8 dead exports removed from app-store, router, base-path, url-manager, metadata-registry
- 7 dead CSS blocks removed from style.css (homepage remnants + preview-tab-row)
- 2 orphaned files deleted (homepage-content.js, code-syntax-editor.js)
- Also discovered: `fable-story-navigator .navigator-heading` CSS rule was dead (can't pierce Shadow DOM) — removed
- `npm run check` passes clean
