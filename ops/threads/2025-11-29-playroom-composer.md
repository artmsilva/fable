# Thread: Playroom Composer Architecture & Implementation

| Field | Value |
| ----- | ----- |
| **Status** | `Active` |
| **Owner** | `codex` |
| **Start Date** | `2025-11-29` |
| **Last Update** | `2025-11-29 16:00 PT` |
| **Related Work** | `docs/specs/playroom.md`, `src/components/`, `src/playroom/` |
| **Links** | `git rev-parse --short HEAD` |

## Objective

Design and implement a comprehensive playroom composer feature for Fable that provides an in-app composition environment where designers and engineers can assemble UIs, experiment with tokens, and share interactive prototypes. The implementation should include a dual-pane editor (code + live preview), component palette, props inspector, and sharing capabilities.

## Deliverables

- [ ] Create detailed playroom architecture document with technical specifications
- [ ] Design DSL parser for HTML-like component syntax with token interpolation
- [ ] Plan component palette integration with existing metadata system
- [ ] Design Monaco editor integration strategy with custom language support
- [ ] Plan sandboxed preview iframe architecture for security
- [ ] Design props inspector with AST synchronization
- [ ] Plan URL sharing and localStorage persistence strategy
- [ ] Create implementation roadmap with milestones and dependencies
- [ ] Implement Phase 1: Basic playroom infrastructure and DSL parser
- [ ] Implement Phase 2: Monaco editor integration and real-time preview
- [ ] Implement Phase 3: Component palette, sandboxed preview, and props inspector
- [ ] Implement Phase 4: URL sharing, persistence, and UI polish

Update this checklist as tasks evolve.

## Timeline

- `2025-11-29 16:00 PT` — **Architecture Complete**: Created comprehensive playroom architecture document covering DSL parser, component palette, Monaco editor integration, sandboxed preview, props inspector, URL sharing, and persistence strategies. Detailed 4-week implementation roadmap with clear milestones and dependencies.
- `2025-11-29 16:00 PT` — **Technical Specifications**: Designed complete technical architecture including security model (sandboxed iframe), performance optimizations (lazy loading, debounced updates), and integration points with existing Fable systems (metadata, store, router).
- `2025-11-29 16:00 PT` — **Implementation Plan**: Created detailed implementation roadmap with weekly phases, specific deliverables, and success criteria for each phase.

## Current Risks / Blockers

- **Bundle Size**: Monaco editor is heavy → mitigated with dynamic CDN loading and lazy initialization
- **Security**: User-generated HTML/JS execution → mitigated with iframe sandboxing and origin validation
- **Performance**: Real-time preview updates → mitigated with debouncing and incremental parsing
- **Browser Support**: URLPattern and modern APIs → acceptable per ADR 0002 greenfield approach

## Hand-off Notes

- **Architecture Complete**: All technical specifications and implementation details are documented in this thread
- **Next Phase**: Ready to begin Phase 1 implementation starting with basic playroom view component and DSL parser
- **Key Files to Create**:
  - `src/components/fable-playroom-view.js` - Main container
  - `src/playroom/dsl-parser.js` - Core DSL parsing logic
  - `src/playroom/monaco-loader.js` - Monaco editor integration
  - `src/components/fable-playroom-palette.js` - Component palette
  - `src/components/fable-playroom-preview.js` - Sandboxed preview
  - `src/components/fable-playroom-inspector.js` - Props inspector
- **Dependencies**: Need to add `htmlparser2` and `lz-string` to package.json
- **Integration Points**: Leverage existing metadata system, store, and router - no breaking changes needed

## Outcome (fill in when Done)

- Result summary + links to merged PRs, demos, or docs.