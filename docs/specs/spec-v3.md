# Fable Spec v3 — Fresh Start

This living doc captures the **current surface**, the adjacent investments that still remain, and the planned rewrite we’re calling “Spec v3.” Treat it as the temporary source of truth until the new spec ships.

## Current Surface (Live)

1. **Stories + Recipes**  
   - Every component still exports `meta` + `stories` objects that feed the registry, navigator, and auto-recipe generator.  
   - The preview panel renders whichever story you pick; the Recipes story is synthetic and runs the auto-inferred grid with live previews.
2. **Navigator-only flows**  
   - The sidebar is now just components: it finds the first story per group and links directly to the component URL. Search filters the component title/taxonomy tags.  
   - No docs/tokens/icons panes remain; their metadata still exists but the UI no longer surfaces it.
3. **Router**  
   - `URLPattern` now only handles `/components/:group/:story` plus the home redirect. The router boots by selecting the first available story if the path doesn’t match anything else.
4. **Controls panel**  
   - Shown unless the selected story is a synthetic “Recipes” story; when recipes are active the panel hides so screenshots can focus on the grid.
5. **Tokens detail experiment**  
   - Token metadata infrastructure remained while the dedicated view/layout was purged; the detail work lives in the repo for reference but is not currently wired into the shell.

## Outstanding Frictions

- **Handcrafted stories still exist**—they’re registered primarily for metadata, not UX. With the v3 rewrite we expect to drop manual exports and rely solely on compiled recipes + edge-case test cases documented in future specs.  
- **Leftover playroom references**: The legacy playroom shell stays in the app because it’s the current anchor for development, but it’s slated for removal once v3 lands.  
- **Metadata pollution**: Components still require `meta.args`/`meta.storyGroup` and even the tokens/docs manifests; the future spec should clarify what can be dropped vs. what needs preservation for backward compatibility.

## Spec v3 Vision

1. **Recipes-first surface** – Build previews purely from the auto-generated recipe blueprint. Each component story can document edge cases/bugs in a test/spec sheet rather than hand-rolled rendering functions.  
2. **Simplified router** – Path-only navigation stays, but we’ll create a lightweight doc spec that lists canonical permutations for QA, not a navigation hierarchy.  
3. **Doc/test cases** – Introduce a new “v3 doc” format (markdown + metadata) that lists blockers, edge cases, and regression notes per component. These documents will also serve as the primary QA reference once the handbook rewrites.  
4. **Metadata cleanup** – Rationalize the schema so tokens/docs metadata are optional in the MVP; focus on what the new spec needs (e.g., `meta.args`, `recipeHints`, taxonomy tags).  

## Next Steps

- Finalize the v3 spec doc (this placeholder is the staging ground).  
- Once v3 is approved, delete the legacy story registry, re-wire the navigator to the new doc/test format, and drop the playroom shell entirely.  
- Keep this page in the repo until the rewrite ships so contributors have a concise map of what’s live vs. what we’re discarding.
