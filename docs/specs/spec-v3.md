# Fable Spec v3 — Clean Slate Brief

This document is the only source of truth for any agent landing on the future rewrite. Assume the current repository is empty: there are no stories, navigators, docs pages, or token/ icon viewers yet. Your job is to build Spec v3 from the ground up.

## Intent

1. **Recipes as the only experience** – Every component is surfaced through its inferred recipes. Agents should design a preview shell that renders the auto-generated grid, highlights the currently selected recipe (with confidence/signals), and hides any auxiliary controls so the grid itself can be captured for QA.
2. **Minimal navigator** – Build a slim sidebar that lists component families (lettered/taxonomy groups optional), exposes a search over component names/tags, and focuses navigation on the recipes per component. No docs/tokens/icons navigation needs to exist in this spec.
3. **Single router** – Support exactly one route pattern: `/components/:group/:story`. Include a fallback that loads the first component when nothing matches, but there is no concept of `/docs`, `/tokens`, or `/icons`.

## Metadata contract

- Each component needs a minimal metadata record: `id`, `title`, `taxonomy` (group/tags/status), `args` defaults, and the recipe hints (enum/boolean derivations).  
- No docs/tokens/icons manifests are required—if a future feature needs them, it gets documented in a follow-up spec (not here).  
- The metadata format should explicitly call out any edge-case test cases or open bugs so they can be surfaced alongside the recipes view.

## Doc/test-case format

1. Create a new Markdown-based spec per component that lists:
   - Edge cases or regressions observed while exercising the recipes grid.  
   - Steps to reproduce, including props/recipes combinations, and whether the case is blocked or deferred.  
   - Any additional notes for the QA team (visual anomalies, performance concerns, accessibility issues).  
2. Link these specs from the navigator cards/titles so agents can quickly reference “what else to test.”

## Implementation expectations

- Build the recipes layout first: cards showing signals, axis values, and previews.  
- Layer in the navigator, router, and metadata loader so the shell can start picking a component and rendering its recipes.  
- As soon as the recipes view works, document its edge cases in the new Markdown specs and treat those docs as the living test cases moving forward.

Keep this brief in the repository until Spec v3 ships; once the rewrite is complete, this doc can serve as the “mission statement” for the next phase.
