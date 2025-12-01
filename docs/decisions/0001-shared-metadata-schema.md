# ADR 0001: Shared Metadata Schema

- **Date**: 2024-05-13
- **Status**: Accepted
- **Driver**: Codex

## Context

Upcoming features (recipes, docs stories, homepage discovery, taxonomy + search, tokens, icons) all require reliable metadata about every entity in the system. Historically, component stories exposed a loose `meta` object that only included `title`, `component`, and `args`. Additional metadata (tags, status, timestamps, docs references) is scattered or missing, making it difficult to deliver the new discovery and authoring experiences without duplicating logic.

## Decision

Adopt a single metadata schema shared across stories, docs entries, tokens, and icons. The schema is defined as TypeScript types plus a JSON schema for validation. Every story/doc must export metadata conforming to this contract, and supporting datasets (tokens, icons) must also conform to the shared format. Tooling (dev server, lint task) validates metadata at load time and fails fast on invalid entries.

### Type Definitions

```ts
type EntityKind = "component-story" | "docs" | "token" | "icon";

interface BaseMeta {
  id: string; // unique slug (kebab-case)
  title: string;
  kind: EntityKind;
  description?: string;
  createdAt?: string; // ISO timestamp
  updatedAt?: string; // ISO timestamp
  featured?: boolean;
  keywords?: string[];
  taxonomy?: {
    group: string;          // e.g., "Inputs"
    category: string;       // e.g., "Components" | "Foundations"
    tags: string[];         // free-form but validated against whitelist
    status: "stable" | "beta" | "deprecated";
    platforms: Array<"web" | "ios" | "android">;
    accessibility: "baseline" | "enhanced";
  };
}

interface ComponentStoryMeta extends BaseMeta {
  kind: "component-story";
  component: string; // custom element tag
  storyGroup: string; // e.g., "Button"
  args?: Record<string, unknown>;
  slots?: Record<string, unknown>;
  recipes?: {
    axes: Array<{
      name: string;
      label?: string;
      values: Array<{
        label: string;
        value: string;
        lockedArgs?: Record<string, unknown>;
      }>;
    }>;
    maxCases?: number;
    layout?: "grid" | "list";
  };
}

interface DocsMeta extends BaseMeta {
  kind: "docs";
  section: "foundations" | "components" | "patterns" | string;
  slug: string;
  content?: string;     // inline markdown
  contentUrl?: string;  // lazily fetched markdown
  relatedStories?: string[]; // ids referencing ComponentStoryMeta
}

interface TokenMeta extends BaseMeta {
  kind: "token";
  tokenType: "color" | "dimension" | "font" | "shadow" | "motion";
  value: string;
  attributes?: Record<string, string>;
  deprecated?: boolean;
}

interface IconMeta extends BaseMeta {
  kind: "icon";
  svgPath: string;
  size?: number;
  style: "filled" | "outline" | "duotone";
  introducedIn?: string;
}
```

### Storage & Access

- Component stories continue to export `meta` objects, but now they must satisfy `ComponentStoryMeta`.
- Docs entries can live as `.md` files with frontmatter matching `DocsMeta`.
- Tokens and icons reside in JSON manifests (`design-system/tokens.json`, `design-system/icons.json`) that align with `TokenMeta` and `IconMeta`.
- The dev server loads all metadata into a centralized registry (`src/config/metadata-registry.js`) used by the store, router, search index, and discovery tooling.

### Validation & Tooling

- A JSON Schema derived from the TypeScript definitions lives at `config/metadata.schema.json`.
- New npm script `npm run validate:metadata` invokes a Node validator to parse every meta export and manifest file.
- Dev server validation happens on startup and whenever a metadata file changes; invalid entries block boot with actionable error messages.
- Biome rule or custom lint ensures required fields (`id`, `title`, `taxonomy`) are present and align with allowed taxonomy values defined in `src/config/taxonomy.js`.

## Consequences

### Positive

- Shared schema allows every feature (search, recipes, docs, home) to consume metadata consistently.
- Validation prevents missing fields from reaching production, raising reliability.
- Story authors get autocomplete and type checking in editors via exported TypeScript types.

### Negative / Mitigations

- Slightly higher authoring friction: authors must provide more metadata. Mitigation: create snippets/templates and documentation.
- Build step cost: JSON schema validation adds startup time. Mitigation: cache results and only re-validate changed files.
- Schema evolution requires migration. Mitigation: version schema and include upgrade scripts when fields change.

## Related Work

- `spec.md` (Cross-Cutting Considerations) references this schema as a dependency for new features.
- Feature-specific specs (recipes, docs, homepage, search, tokens, icons) depend on this metadata registry for taxonomy, timestamps, and entity lookups.
