export const HOMEPAGE_HERO_CONTENT = {
  eyebrow: "Design System Workbench",
  title: "Welcome to Fable",
  description:
    "Discover components, docs, and primitives from a single canvas. Start with guidance, then jump into live stories or foundations with one click.",
  ctas: [
    {
      label: "Browse Docs",
      href: "/docs/foundations/introduction",
      variant: "primary",
    },
    {
      label: "Explore Tokens",
      href: "/tokens",
      variant: "ghost",
    },
  ],
};

export const HOMEPAGE_HIGHLIGHT_CARDS = [
  {
    id: "featured-doc",
    label: "Featured Doc",
    title: "Button Guidelines",
    description: "Rationale, anatomy, and live samples for button patterns.",
    href: "/docs/components/button-guidelines",
    accent: "Docs",
  },
  {
    id: "tokens",
    label: "Foundations",
    title: "Design Tokens",
    description: "Browse colors, typography, and spacing primitives in one place.",
    href: "/tokens",
    accent: "Tokens",
  },
  {
    id: "icons",
    label: "Assets",
    title: "Icon Library",
    description: "Search, filter, and copy SVG snippets for every platform asset.",
    href: "/icons",
    accent: "Icons",
  },
];

export const HOMEPAGE_SPOTLIGHTS = [
  {
    id: "search-button",
    query: "button",
    description: "See all button stories, docs, and states.",
    href: "/components/button/primary",
  },
  {
    id: "search-forms",
    query: "forms",
    description: "Quickly jump to inputs and validation patterns.",
    href: "/components/input/default",
  },
  {
    id: "search-icons",
    query: "icons",
    description: "Open the iconography docs and gallery.",
    href: "/docs/foundations/iconography",
  },
];
