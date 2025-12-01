# ADR 0002: Greenfield Scope (No Backward Compatibility)

- **Date**: 2024-05-13
- **Status**: Accepted
- **Driver**: Codex

## Context

Fable is currently a sandbox for rapid experimentation. Earlier planning documents referenced legacy URL formats, metadata drift from past prototypes, and general backward compatibility concerns. Maintaining compatibility with older story schemas or URLs slows iteration and complicates the upcoming feature work (router rewrite, metadata overhaul). Stakeholders confirmed that the codebase is effectively greenfield and experimentation speed is the priority.

## Decision

Drop all legacy/backward compatibility requirements. Treat the current repository as a fresh foundation where we can evolve APIs, metadata, and URL structures freely. Any breaking change to stories, metadata, or routes is acceptable as long as the current branch builds and the new behavior is documented.

### Policies

- No work should be spent building migration layers for deprecated schemas or URLs.
- Dev server needs only to serve the current routes; no legacy query handling.
- Metadata validation covers only the new schema; older `meta` shapes are unsupported.
- Feature specs should assume greenfield assumptions and can remove references to backward compatibility.

## Consequences

- **Positive**: Simpler codepaths, faster feature delivery, smaller surface for bugs tied to legacy formats.
- **Negative**: External links based on older demos may break. This is acceptable per stakeholders. Document any major breaking change in release notes for awareness.

## Related Documents

- `docs/spec.md` cross-cutting considerations updated to remove backward compatibility notes.
- `AGENTS.md` instructs future agents to assume greenfield context and ignore legacy constraints.
