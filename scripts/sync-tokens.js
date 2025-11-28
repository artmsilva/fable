#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import url from "node:url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const tokensPath = path.join(rootDir, "design-system", "tokens.json");
const cssOutPath = path.join(rootDir, "src", "design-system", "tokens.css");
const moduleOutPath = path.join(rootDir, "src", "metadata", "generated", "tokens-data.js");

const deriveVarName = (token) =>
  token.attributes?.cssVar || `--${token.id.replace(/[^a-z0-9-]/gi, "-").replace(/--+/g, "-")}`;

async function ensureDir(filePath) {
  await mkdir(path.dirname(filePath), { recursive: true });
}

async function main() {
  const raw = await readFile(tokensPath, "utf8");
  const tokens = JSON.parse(raw);

  const declarations = tokens
    .map((token) => {
      const varName = deriveVarName(token);
      return `  ${varName}: ${token.value}; /* ${token.title} */`;
    })
    .join("\n");

  const css = `/* Generated from design-system/tokens.json */\n:root {\n${declarations}\n}\n`;

  await ensureDir(cssOutPath);
  await ensureDir(moduleOutPath);
  await writeFile(cssOutPath, css);

  const jsModule = `// Generated from design-system/tokens.json\nexport default ${JSON.stringify(
    tokens,
    null,
    2
  )};\n`;
  await writeFile(moduleOutPath, jsModule);
  console.log(`Wrote ${cssOutPath}`);
  console.log(`Wrote ${moduleOutPath}`);
}

main().catch((error) => {
  console.error("tokens:sync failed", error);
  process.exitCode = 1;
});
