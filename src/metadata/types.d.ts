export type EntityKind = "component-story" | "docs" | "token" | "icon";

export interface TaxonomyMeta {
  group: string;
  category: string;
  tags: string[];
  status: "stable" | "beta" | "alpha" | "deprecated";
  platforms: Array<"web" | "ios" | "android">;
  accessibility: "baseline" | "enhanced";
}

export interface BaseMeta {
  id: string;
  title: string;
  kind: EntityKind;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  featured?: boolean;
  keywords?: string[];
  taxonomy?: TaxonomyMeta;
}

export interface ComponentStoryMeta extends BaseMeta {
  kind: "component-story";
  component: string;
  storyGroup: string;
  args?: Record<string, unknown>;
  slots?: Record<string, unknown>;
  permutations?: {
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

export interface DocsMeta extends BaseMeta {
  kind: "docs";
  section: string;
  slug: string;
  content?: string;
  contentUrl?: string;
  relatedStories?: string[];
}

export interface TokenMeta extends BaseMeta {
  kind: "token";
  tokenType: "color" | "dimension" | "font" | "shadow" | "motion";
  value: string;
  attributes?: Record<string, string>;
  deprecated?: boolean;
}

export interface IconMeta extends BaseMeta {
  kind: "icon";
  svgPath: string;
  size?: number;
  style: "filled" | "outline" | "duotone";
  introducedIn?: string;
}
