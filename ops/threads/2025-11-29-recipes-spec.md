# Thread: Recipes Spec Automation

| Field | Value |
| ----- | ----- |
| **Status** | `Done` |
| **Owner** | `codex` |
| **Start Date** | `2025-11-29` |
| **Last Update** | `2025-11-29 02:51 EST` |
| **Related Work** | `docs/specs/recipes.md`, `docs/spec.md`, `src/utils/story-processor.js`, `src/store/app-store.js` |
| **Links** | – |

## Objective

Pivot the recipes spec toward automatic inference: rather than asking authors to hand-write axes metadata, document how the runtime derives recipes directly from stories, component args, and existing source code so that most coverage grids are generated for free.

## Deliverables

- [x] Research current story metadata + processor capabilities to understand inference hooks.
- [x] Update `docs/specs/recipes.md` (and cross-references) to describe the auto-generated workflow, UX, and technical plan.
- [x] Capture open questions + risks around heuristics, overrides, and limits for inferred recipes.

## Timeline

- `2025-11-29 02:25 EST` — **Kickoff**: Logged thread, reviewed existing spec + schema; need to reframe toward code-driven inference per user request.
- `2025-11-29 02:28 EST` — **Spec rewrite**: Replaced `docs/specs/recipes.md` with auto-inference design (analyzer signals, budgets, data model, UX), added open questions, and updated `docs/spec.md` summary to match.
- `2025-11-29 02:36 EST` — **Implementation pass**: Added analyzer + blueprint generation in `src/utils/story-processor.js`, URL/store plumbing for `recipe=` query state, new `fable-recipes-view` UI in the preview panel, and selection syncing via `app-store`. 🎉 Auto recipes now live.
- `2025-11-29 02:48 EST` — **Tab + tooling**: Added preview/recipes tabs inside `fable-story-preview`, wired the new view to only render when selected, and replaced the Biome lint step with a touched-files runner (`scripts/biome-changed.js`) per request.

## Current Risks / Blockers

- Need clarity on heuristics to detect axis-worthy args vs. enumerations without explicit metadata.

## Outcome (fill in when Done)

- Auto recipes spec + implementation landed. Analyzer derives blueprints, preview tab switches across recipes, URL/store wiring syncs selections, and lint now checks touched files only.
