import type { LitElement } from "lit";
import type { TemplateResult } from "lit";

export interface FableTaxonomy {
  group?: string;
  category?: string;
  tags?: string[];
  status?: string;
  platforms?: string[];
  accessibility?: string;
}

export type StoryArgs = Record<string, unknown>;
export type ArgTypeControl = "select" | "radio" | "boolean" | "range" | "text" | "color";

export interface ArgType {
  control?: ArgTypeControl;
  options?: (string | number | boolean)[];
  min?: number;
  max?: number;
  step?: number;
}

export type StoryFunction = (
  args: StoryArgs,
  slots?: Record<string, string>,
) => TemplateResult;

export interface StoryDefinition {
  args?: StoryArgs | ((baseArgs: StoryArgs) => StoryArgs);
  lockedArgs?: Record<string, boolean | string>;
  render: StoryFunction;
  title?: string;
  description?: string;
  content?: string;
}

export type Story = StoryFunction | StoryDefinition;

export interface RecipeBlueprint {
  axes: Record<string, string[]>;
  template: StoryFunction;
}

export interface FableComponentClass extends CustomElementConstructor {
  title?: string;
  description?: string;
  status?: "alpha" | "beta" | "stable" | "deprecated";
  taxonomy?: FableTaxonomy;
  keywords?: string[];
  args?: StoryArgs;
  argTypes?: Record<string, ArgType>;
  slots?: Record<string, string>;
  lockedArgs?: Record<string, boolean | string>;
  recipeBlueprint?: RecipeBlueprint | null;
  stories?: Record<string, Story>;
}

/**
 * Register a custom element with the Fable workbench.
 * Defines the element, extracts metadata from static class fields,
 * and registers stories for display in the navigator.
 */
export function define(tag: string, componentClass: FableComponentClass): void;
