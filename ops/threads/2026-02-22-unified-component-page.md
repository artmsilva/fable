# Thread: Unified Component Page

| Field | Value |
| ----- | ----- |
| **Status** | `Active` |
| **Owner** | `claude` |
| **Start Date** | `2026-02-22` |
| **Last Update** | `2026-02-22` |
| **Related Work** | `src/components/fable-story-preview.js`, `src/app.js`, `src/router.js`, `src/metadata/components.js` |
| **Links** | — |

## Objective

Replace the 3-column layout (navigator | preview | controls + source drawer) with a 2-column layout where a single scrollable component page shows everything: hero, live preview, attributes table, code sample, story gallery, recipes, and docs.

## Deliverables

- [x] Create `fable-attributes-table.js` design system component
- [x] Rewrite `fable-story-preview.js` as unified component page with all sections
- [x] Update `app.js` to 2-column grid, remove controls panel + source drawer
- [x] Add page styles via light-DOM `<style>` injection (shadow DOM boundary fix)
- [x] Flatten navigator — one clickable row per component, no Recipes/Docs sub-links
- [x] Add scroll-to-top on component navigation
- [x] Fix stale code block source (`fable-code-block` `.code` property)
- [x] Design polish — section dividers, uppercase labels, breathing room
- [x] Dynamic component metadata — static class properties replace hardcoded array
- [x] Simplify URLs — `/components/:group` (drop story slug)
- [x] Migrate router to Navigation API (`window.navigation`)
- [ ] Verify GitHub Pages SPA fallback still works with new URL scheme

## Timeline

- `2026-02-22` — **Rearchitecture**: Created attributes table, rewrote story preview as unified page, updated app to 2-column layout, registered in barrel. Build passes.
- `2026-02-22` — **Code block fix**: Added `.code` property to `fable-code-block` to bypass stale slotchange issue.
- `2026-02-22` — **Design review**: Flattened navigator (removed sub-links), added section dividers + uppercase labels, injected styles into light DOM for shadow boundary, scroll reset on nav.
- `2026-02-22` — **Dynamic metadata**: Replaced 350-line hardcoded `componentMetadata` array with `static description` + `static taxonomy` on each component class. Factory reads from `customElements.get()`.
- `2026-02-22` — **URL simplification**: Routes changed from `/components/:group/:story` to `/components/:group`. No more `/default`, `/docs`, `/recipes` suffixes.
- `2026-02-22` — **Navigation API**: Replaced popstate + pushState router with `navigation.addEventListener('navigate')` + `navigation.navigate()`.

## Current Risks / Blockers

- GitHub Pages SPA fallback (`404.html` redirect) needs testing with the new `/components/:group` URL scheme.
- `fable-link` component still has its own `pushState` + `dispatchEvent(PopStateEvent)` in `_handleClick` — the Navigation API intercept handles this now, but the link's internal click handler may be redundant.

## Hand-off Notes

- `fable-controls-panel.js` and `fable-source-drawer.js` are no longer imported but not deleted.
- The component page styles live in `_renderPageStyles()` inside `fable-story-preview.js` because global `style.css` can't reach inside `fable-app`'s shadow DOM. The styles in `style.css` for `.component-page` etc. are now dead — could be cleaned up.
- `listComponentMetadata()` in `src/metadata/components.js` now returns whatever was registered at runtime (populated as components load), not a static array.
