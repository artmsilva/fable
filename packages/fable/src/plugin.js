import path from "node:path";

/**
 * @param {object} [options]
 * @param {boolean} [options.showBuiltins=false] Show Fable's built-in UI component stories in the navigator.
 */
export function fable(options = {}) {
  const { showBuiltins = false } = options;
  const pkgDir = path.resolve(import.meta.dirname, "..");
  const entryPoint = path.resolve(pkgDir, "src/index.js");
  const styleEntry = path.resolve(pkgDir, "src/style.css");

  return {
    name: "vite-plugin-fable",
    config() {
      return {
        define: {
          __FABLE_SHOW_BUILTINS__: JSON.stringify(showBuiltins),
        },
        resolve: {
          alias: [
            { find: /^fable-workbench\/style\.css$/, replacement: styleEntry },
            { find: /^fable-workbench\/plugin$/, replacement: path.resolve(pkgDir, "src/plugin.js") },
            { find: /^fable-workbench$/, replacement: entryPoint },
          ],
        },
      };
    },
  };
}
