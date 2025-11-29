# Thread: Next Steps & Backlog Triage

| Field | Value |
| ----- | ----- |
| **Status** | `Done` |
| **Owner** | `codex` |
| **Start Date** | `2025-11-29` |
| **Last Update** | `2025-11-29 00:23 EST` |
| **Related Work** | `docs/specs/permutations.md`, `docs/specs/search-taxonomy.md`, `docs/specs/design-tokens.md` |
| **Links** | – |

## Objective

Map the next high-impact feature work (permutations, search/taxonomy, tokens) against the current codebase and propose a recommended sequence so implementation can start without context churn.

## Deliverables

- [x] Quick assessment of current state vs. specs for permutations, search/taxonomy, and tokens.
- [x] Ranked recommendation of next engineering tasks with scope notes.
- [x] Agreed next-action item ready to pick up (with owner/status update).

Update this checklist as tasks evolve.

## Timeline

- `2025-11-29 00:18 EST` — **Kickoff**: Started backlog triage thread; no code changes yet. Pending: review specs and code to spot gaps.
- `2025-11-29 00:23 EST` — **Docs story type**: Implemented docs-style stories rendered in preview + toc in controls; added Button “Docs” story as example. Files: `src/components/fable-story-preview.js`, `src/components/fable-controls-panel.js`, `src/design-system/button.js`.
- `2025-11-29 00:28 EST` — **Docs layout polish**: Refined docs page layout with hero, two-column body, and inline TOC support (light DOM so anchors work). Files: `src/design-system/docs-page.js`.
- `2025-11-29 00:30 EST` — **Component docs stories**: Added docs stories with callout shortcode for Badge, Card, and Select; markdown parser now supports `:::callout` blocks. Files: `src/design-system/badge.js`, `src/design-system/card.js`, `src/design-system/select.js`, `src/utils/markdown-renderer.js`.
- `2025-11-29 00:31 EST` — **Story shortcode embeds**: Added `:::story component--StoryName` shortcode to embed live stories in docs. New component `fable-docs-story` renders referenced stories; Button/Card/Select docs now embed defaults. Files: `src/utils/markdown-renderer.js`, `src/design-system/docs-story.js`, `src/design-system/docs-page.js`, `src/design-system/button.js`, `src/design-system/card.js`, `src/design-system/select.js`.
- `2025-11-29 00:33 EST` — **Syntax highlighting**: Added lightweight code highlighting for fenced blocks (JS/TS) with colored tokens; styled code blocks and added Code Block docs story. Files: `src/utils/markdown-renderer.js`, `src/design-system/docs-page.js`, `src/design-system/code-block.js`.
- `2025-11-29 00:37 EST` — **Embed robustness**: Docs story embeds now normalize component/story matching and respond to story state updates (fixes code-block docs embed). Files: `src/design-system/docs-story.js`.
- `2025-11-29 00:39 EST` — **Source drawer guard**: Prevented errors when viewing docs stories by returning safe source strings and hiding source drawer content for docs. Files: `src/utils/story-processor.js`, `src/components/fable-source-drawer.js`.
- `2025-11-29 00:46 EST` — **Code block whitespace**: Code blocks now trim leading/trailing blank lines and common indent (including the component’s slot content) for cleaner rendering. Files: `src/utils/markdown-renderer.js`, `src/design-system/docs-page.js`, `src/design-system/code-block.js`.
- `2025-11-29 00:52 EST` — **Inline HTML snippet**: Button docs markdown now contains fenced HTML showing usage; docs render the snippet inline. Files: `src/metadata/docs.js`.

## Current Risks / Blockers

- None.

## Hand-off Notes

- Thread complete; docs/story infrastructure updated and backlog spec work triaged.

## Outcome (fill in when Done)

- Added docs story system, inline code samples, syntax-highlighting font, and HTML snippet example for Button docs. Ready for next initiatives (permutations/search/tokens).
