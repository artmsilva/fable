import { deepClone, toISODate } from "./utils.js";

const docsMetadata = [
  {
    id: "docs-introduction",
    title: "Introduction",
    kind: "docs",
    description: "Overview of the Fable design system playground and usage.",
    section: "foundations",
    slug: "introduction",
    createdAt: toISODate("2024-05-10"),
    updatedAt: toISODate("2024-05-10"),
    taxonomy: {
      group: "Foundations",
      category: "Docs",
      tags: ["getting-started", "overview"],
      status: "beta",
      platforms: ["web"],
      accessibility: "baseline",
    },
    content: `# Welcome to Fable

Fable is a lightweight story explorer built with Lit web components. Use the navigator to browse components, edit controls, and view live previews.

## Quick start

- Browse the **Components** section for interactive stories.
- Switch to the **Docs** view for long-form guidance.
- Use the **Tokens** and **Icons** tabs to reference the design foundations.

## Principles

1. **Zero-bundler** runtime.
2. **Colocated** stories and metadata.
3. **Shareable** URLs via modern router.`,
  },
  {
    id: "docs-button-guidelines",
    title: "Button Guidelines",
    kind: "docs",
    description: "Design and usage guidance for button components.",
    section: "components",
    slug: "button-guidelines",
    createdAt: toISODate("2024-05-10"),
    updatedAt: toISODate("2024-05-10"),
    taxonomy: {
      group: "Components",
      category: "Docs",
      tags: ["button", "guidelines"],
      status: "beta",
      platforms: ["web"],
      accessibility: "enhanced",
    },
    relatedStories: ["button"],
    content: `# Button usage

- Use primary variant for high-emphasis actions.
- Prefer secondary variant for less prominent choices.

## Accessibility

Ensure aria-labels are provided for icon-only buttons.`,
  },
  {
    id: "docs-color-system",
    title: "Color System",
    kind: "docs",
    description: "Color tokens, semantic palettes, and usage guidance.",
    section: "foundations",
    slug: "color-system",
    createdAt: toISODate("2024-05-12"),
    updatedAt: toISODate("2024-05-12"),
    taxonomy: {
      group: "Foundations",
      category: "Docs",
      tags: ["color", "tokens"],
      status: "beta",
      platforms: ["web"],
      accessibility: "enhanced",
    },
    relatedStories: [],
    content: `# Color architecture

We split color tokens into three layers:

- **Primitives** — raw HSL values (e.g., \`color.base.violet500\`)
- **Semantic roles** — intent-based hooks (e.g., \`color.background.canvas\`)
- **Component aliases** — per-component overrides

## Usage

\`\`\`css
:root {
  --color-surface: var(--token-color-surface);
  --color-cta: var(--token-color-primary);
}
\`\`\`

> Always test semantic colors in high-contrast mode.

## Accessibility

Maintain a minimum 4.5:1 contrast ratio for text. The **Tokens** view lists each role with WCAG guidance.`,
  },
  {
    id: "docs-iconography",
    title: "Iconography",
    kind: "docs",
    description: "Guidelines for using the icon library.",
    section: "foundations",
    slug: "iconography",
    createdAt: toISODate("2024-05-12"),
    updatedAt: toISODate("2024-05-12"),
    taxonomy: {
      group: "Foundations",
      category: "Docs",
      tags: ["icons", "usage"],
      status: "beta",
      platforms: ["web"],
      accessibility: "enhanced",
    },
    relatedStories: [],
    content: `# Icon usage

Icons communicate status and actions. Keep them consistent:

- Prefer the **Outline** style for UI controls.
- Reserve **Filled** icons for status indicators.
- Align to a 24px grid and center within a 16px touch target.

## Accessibility

- Decorative icons: \`aria-hidden="true"\`
- Informative icons: pair with \`aria-label\` or visible text.

## Export

Use the **Icons** route to copy SVG markup or individual paths.`,
  },
];

const docsMetaMap = new Map(docsMetadata.map((doc) => [doc.id, doc]));

export const listDocsMetadata = () => docsMetadata.map(deepClone);

export function getDocsMeta(id) {
  const base = docsMetaMap.get(id);
  if (!base) return null;
  return deepClone(base);
}

export default docsMetadata;
