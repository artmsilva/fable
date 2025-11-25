#!/usr/bin/env node
/**
 * Import Linter: Ensures proper import patterns
 *
 * Rules:
 * - Application components should use import maps (not relative paths)
 * - @design-system, @store, @utils, @config
 * - Design system components can use relative imports within their directory
 * - Prevents inconsistent import patterns
 */

import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

interface LintError {
  file: string;
  line: number;
  message: string;
  snippet: string;
  fix?: string;
}

const errors: LintError[] = [];

// Patterns to detect improper imports
const RELATIVE_DS_IMPORT = /import\s+(.+from\s+)?["']\.\.\/design-system\/([^"']+)["']/g;
const RELATIVE_STORE_IMPORT = /import\s+(.+from\s+)?["']\.\.\/store\/([^"']+)["']/g;
const RELATIVE_UTILS_IMPORT = /import\s+(.+from\s+)?["']\.\.\/utils\/([^"']+)["']/g;
const RELATIVE_CONFIG_IMPORT = /import\s+(.+from\s+)?["']\.\.\/config\.js["']/g;
async function lintFile(filePath: string, isDesignSystem: boolean): Promise<void> {
  try {
    const content = await readFile(filePath, "utf-8");
    const lines = content.split("\n");

    // Skip linting for internal files (they can use relative imports)
    if (isDesignSystem) return;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check design-system imports
      const dsMatches = [...line.matchAll(RELATIVE_DS_IMPORT)];
      for (const match of dsMatches) {
        const fullMatch = match[0];
        const suggestedFix = fullMatch.replace(/["']\.\.\/design-system\//, '"@design-system/');
        errors.push({
          file: filePath,
          line: i + 1,
          message: "Use import map (@design-system/) instead of relative paths",
          snippet: line.trim(),
          fix: suggestedFix,
        });
      }

      // Check store imports
      const storeMatches = [...line.matchAll(RELATIVE_STORE_IMPORT)];
      for (const match of storeMatches) {
        const fullMatch = match[0];
        const suggestedFix = fullMatch.replace(/["']\.\.\/store\/[^"']+["']/, '"@store"');
        errors.push({
          file: filePath,
          line: i + 1,
          message: "Use import map (@store) instead of relative paths",
          snippet: line.trim(),
          fix: suggestedFix,
        });
      }

      // Check utils imports
      const utilsMatches = [...line.matchAll(RELATIVE_UTILS_IMPORT)];
      for (const match of utilsMatches) {
        const fullMatch = match[0];
        const suggestedFix = fullMatch.replace(/["']\.\.\/utils\/[^"']+["']/, '"@utils"');
        errors.push({
          file: filePath,
          line: i + 1,
          message: "Use import map (@utils) instead of relative paths",
          snippet: line.trim(),
          fix: suggestedFix,
        });
      }

      // Check config imports
      const configMatches = [...line.matchAll(RELATIVE_CONFIG_IMPORT)];
      for (const match of configMatches) {
        const fullMatch = match[0];
        const suggestedFix = fullMatch.replace(/["']\.\.\/config\.js["']/, '"@config"');
        errors.push({
          file: filePath,
          line: i + 1,
          message: "Use import map (@config) instead of relative paths",
          snippet: line.trim(),
          fix: suggestedFix,
        });
      }
    }
  } catch (err) {
    console.error(`Failed to read ${filePath}:`, err);
  }
}

async function lintDirectory(dirPath: string, isDesignSystem: boolean): Promise<void> {
  try {
    const entries = await readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name);

      if (entry.isDirectory()) {
        await lintDirectory(fullPath, isDesignSystem);
      } else if (entry.isFile() && entry.name.endsWith(".js")) {
        await lintFile(fullPath, isDesignSystem);
      }
    }
  } catch (err) {
    console.error(`Failed to read directory ${dirPath}:`, err);
  }
}

async function main() {
  console.log("🔍 Running import linter...\n");

  const srcPath = join(process.cwd(), "src");

  // Lint application components (should use @design-system)
  console.log("✓ Checking application components");
  await lintDirectory(join(srcPath, "components"), false);

  // Lint store (should use @utils, @config import maps)
  console.log("✓ Checking store modules");
  await lintDirectory(join(srcPath, "store"), false);

  // Lint utils (should use @config import map)
  console.log("✓ Checking utils modules");
  await lintDirectory(join(srcPath, "utils"), false);

  // Design system can use relative imports (skip linting)
  console.log("✓ Design system (relative imports allowed)");

  // Report results
  console.log(`\n${"=".repeat(60)}`);

  if (errors.length > 0) {
    console.log(`\n❌ ${errors.length} import error(s):\n`);

    for (const error of errors) {
      console.log(`${error.file}:${error.line}`);
      console.log(`  ${error.message}`);
      console.log(`  Found:    ${error.snippet}`);
      if (error.fix) {
        console.log(`  Suggest:  ${error.fix}`);
      }
      console.log();
    }

    console.log("=".repeat(60));
    console.log("\n💡 Fix: Use import maps for all cross-module imports");
    console.log("   @design-system/ @store @utils @config\n");

    process.exit(1);
  }

  console.log("\n✅ All import patterns are correct!\n");
}

main().catch((err) => {
  console.error("Linter failed:", err);
  process.exit(1);
});
