import path from "node:path";

export function fable() {
  const pkgDir = path.resolve(import.meta.dirname, "..");
  const entryPoint = path.resolve(pkgDir, "src/index.js");
  const styleEntry = path.resolve(pkgDir, "src/style.css");

  return {
    name: "vite-plugin-fable",
    config() {
      return {
        resolve: {
          alias: [
            { find: /^fable\/style\.css$/, replacement: styleEntry },
            { find: /^fable\/plugin$/, replacement: path.resolve(pkgDir, "src/plugin.js") },
            { find: /^fable$/, replacement: entryPoint },
          ],
        },
      };
    },
  };
}
