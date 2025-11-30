# Thread: <concise name>

| Field | Value |
| ----- | ----- |
| **Status** | `Done` |
| **Owner** | `codex` |
| **Start Date** | `2025-11-29` |
| **Last Update** | `2025-11-30 00:18 EST` |
| **Related Work** | `README.md`, `docs/spec.md`, `docs/decisions/0001-shared-metadata-schema.md`, `src/app.js` |
| **Links** | `n/a` |

## Objective

Rewrite `README.md` to reflect the current architecture (Vite, Lit components, router), available views (home, docs, tokens, icons, playroom), metadata workflow, and dev tooling. Outcome: a concise, accurate README that orients new contributors without stale guidance.

## Deliverables

- [x] Capture current surface area (features, architecture, scripts, metadata tooling) from code/docs.
- [x] Produce updated README content with setup, usage, authoring, and validation guidance.
- [x] Verify formatting/links and note testing performed.

Update this checklist as tasks evolve.

## Timeline

- `2025-11-29 23:58 EST` &mdash; **Kickoff**: Reviewed AGENTS onboarding + existing README; scanned `src/app.js`, router, store, metadata schema/spec to scope updates.
- `2025-11-30 00:00 EST` &mdash; **Docs**: Rewrote `README.md` to match current surface (home/docs/tokens/icons/playroom, router, metadata registry, Vite/import-map tooling, scripts).
- `2025-11-30 00:01 EST` &mdash; **Review**: Sanity-checked README links/sections; no automated tests run (docs-only change).

## Current Risks / Blockers

- None yet.

## Hand-off Notes

- Keep README concise; ensure commands and feature descriptions match Vite/import-map setup and metadata registry.

## Outcome (fill in when Done)

- README refreshed to reflect current architecture, views, metadata tooling, and scripts.
