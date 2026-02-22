import type { Plugin } from "vite";

export interface FablePluginOptions {
  /** Show Fable's built-in UI component stories in the navigator. Default: `false`. */
  showBuiltins?: boolean;
}

/**
 * Vite plugin that configures resolve aliases for `fable-workbench` imports.
 * Add to your Vite config's `plugins` array.
 */
export function fable(options?: FablePluginOptions): Plugin;
