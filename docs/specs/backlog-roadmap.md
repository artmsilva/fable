# Backlog & Roadmap Transparency Spec

## Overview

Introduce a shared backlog + roadmap surface so consumers can see what features/components are coming next and the team can plan execution inside the app. The solution combines a structured metadata file checked into the repo, store selectors exposed to the UI, and two new panes in the shell (public read-only roadmap and internal prioritization view).

## Goals

1. Track upcoming work across **new components**, **component enhancements**, and **platform capabilities** with consistent metadata.
2. Publish a curated “What’s Next” feed inside the homepage + docs to set expectations for consumers.
3. Provide maintainers with a single list of ready-to-pick tasks filtered by owners, target release, or dependency.
4. Keep roadmap entries versioned in git (no external tool) and validated with schema checks similar to metadata ADR 0001.

### Non-Goals

- Replacing issue trackers (GitHub, Linear) entirely. Those can still store implementation detail.
- Automating sprint planning or effort estimation.
- Integrating user voting/feedback in v1.

## Audiences

- **Consumers**: Designers/devs visiting the site should understand upcoming components or enhancements, grouped by readiness.
- **Maintainers**: Core team needs to quickly see prioritized items, dependencies, and status transitions.

## Data Model

Backlog entries live in `config/backlog.json` (new file). Schema keys:

| Field | Type | Notes |
| ----- | ---- | ----- |
| `id` | string | slug (`component-name-new`, `controls-mini-map`). |
| `title` | string | Short marketing-ready name. |
| `type` | enum | `component`, `feature`, `infrastructure`. |
| `scope` | string | Component name or subsystem (e.g., `fable-recipes`). |
| `status` | enum | `Ideation`, `Design`, `InProgress`, `QA`, `Shipped`. |
| `targetRelease` | string | Calendar quarter or sprint (`2025-Q1`). |
| `impact` | enum | `High`, `Medium`, `Low`. |
| `summary` | string | ≤280 char description. |
| `detailsUrl` | string? | Links to spec (e.g., `docs/specs/component-props-registry.md`). |
| `owner` | string | GitHub handle or squad. |
| `tags` | string[] | `["new-component"]`, `["accessibility"]`. |
| `dependencies` | string[] | IDs referencing other backlog entries. |
| `updatedAt` | ISO string | Audit for sorting. |

Validation: extend `npm run validate:metadata` or add `npm run validate:backlog` to check schema. Failing validation should block commits touching `config/backlog.json`.

## Views

1. **Public Roadmap Panel**
   - Placement: Left column beneath navigator, collapsible `fable-roadmap-panel`.
   - Content: `status` grouped cards for the next 3 releases. Each card shows `title`, `scope`, `targetRelease`, `summary`, `detailsUrl`.
   - Filter: only `status` in `Design`, `InProgress`, `QA`. Hide `Ideation` to avoid over-promising; move `Shipped` to release notes.
   - Interaction: Link to docs/specs or demos; no editing.

2. **Maintainer Backlog View**
   - Access: `/backlog` route (protected behind `?mode=maintainer` flag or local storage toggle).
   - UI: Kanban style columns per status with drag + drop ordering (future). v1 uses tables with sort/search controls.
   - Actions: Quick filters by `type`, `owner`, `impact`, `targetRelease`. Buttons to copy spec links or open GitHub issues.
   - Data: same JSON file, but entire dataset.

3. **Homepage Highlights**
   - Show top 3 `High` impact items on the hero card to tease upcoming work.
   - Provide CTA “View full roadmap” linking to `/backlog`.

## Store & Module Architecture

- Create `src/store/backlog.js` with:
  - `loadBacklog()` to fetch `/config/backlog.json` via Vite static import.
  - Selectors: `selectRoadmapHighlights`, `selectBacklogByStatus`, `selectBacklogFilters`.
  - Derived data caches to avoid recomputing on each render.
- Hook store initialization into `src/app.js` so backlog data loads in parallel with stories/metadata.
- Add `window.__FABLE_BACKLOG__` for debugging similar to stories registry.

## Content Workflow

1. Add/modify entries in `config/backlog.json`.
2. Run `npm run validate:backlog` (new script calling a zod/ajv check).
3. Update relevant specs (`docs/specs/<feature>.md`), link via `detailsUrl`.
4. Optionally create GitHub issue referencing `id`.

To capture “new component” vs “feature enhancement”:
- Use `type`.
- Provide `scope` referencing component folder (e.g., `components/fable-tag`) to highlight breakages.

## Implementation Plan

1. **Schema + Validation**
   - Define JSON schema in `config/backlog.schema.json`.
   - Add Node script `scripts/validate-backlog.mjs`.
   - Extend `package.json` scripts.
2. **Store + Loaders**
   - Build `src/store/backlog.js` with load/selectors.
   - Update `src/app.js` to request backlog data early.
3. **Public Panel**
   - Create `src/components/fable-roadmap-panel.js` using Lit list rendering.
   - Add CSS tokens for status chips.
4. **Backlog View**
   - Add route `/backlog` per router spec.
   - Build `src/components/fable-backlog-view.js` with filters + table.
5. **Docs**
   - Update README and homepage spec with new section referencing backlog.

## Testing Strategy

- Unit tests for backlog selectors using fixture JSON.
- Snapshot test for `fable-roadmap-panel` verifying grouping.
- Manual verification via `npm run dev`: change JSON, confirm UI updates without reload.
- Validation script included in CI.

## Risks

- **Staleness**: Without automation, data may drift. Mitigation: add “Updated X days ago” badge and include backlog updates in release checklist.
- **Over-promising**: Consumers might treat roadmap as contract. Mitigation: add disclaimers + statuses.
- **Performance**: Large backlog file should stay small (<200 items). Lazy load `maintainer` view if necessary.

## Milestones

1. Schema + validation script merged.
2. Store + highlight cards powering homepage.
3. Maintainer backlog view + route.
4. Documentation + release checklist updates.

## Open Questions

- Should maintainer view be behind auth? (Future SSO?).
- Do we want to expose ICS/subscribe feed? (Out of scope for v1 but keep data normalized to enable later.)
