#!/usr/bin/env node
/**
 * Custom Linter: Ensures only design system components have styles
 *
 * Rules:
 * - Components in src/design-system/ CAN have `static styles = css`
 * - Components in src/components/ CANNOT have `static styles = css`
 * - Exception: Minimal positioning/layout styles are allowed (e.g., `display: contents`)
 */

import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

interface LintError {
  file: string;
  line: number;
  message: string;
  snippet: string;
}

const errors: LintError[] = [];
const warnings: LintError[] = [];

// Patterns to detect CSS styles in components
const STYLE_PATTERN = /static\s+styles\s*=\s*css`/;
const _ALLOWED_MINIMAL_STYLES = /^\s*:host\s*{\s*display:\s*contents;?\s*}\s*$/m;

async function lintFile(filePath: string, allowStyles: boolean): Promise<void> {
  try {
    const content = await readFile(filePath, "utf-8");
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (STYLE_PATTERN.test(line)) {
        if (!allowStyles) {
          // Check if it's just minimal positioning styles
          const styleBlock = extractStyleBlock(lines, i);

          if (isMinimalStyle(styleBlock)) {
            warnings.push({
              file: filePath,
              line: i + 1,
              message: "Consider removing minimal styles and using design system components",
              snippet: styleBlock,
            });
          } else {
            errors.push({
              file: filePath,
              line: i + 1,
              message:
                "Non-design-system components should not have styles. Use design system components instead.",
              snippet: styleBlock,
            });
          }
        }
      }
    }
  } catch (err) {
    console.error(`Failed to read ${filePath}:`, err);
  }
}

function extractStyleBlock(lines: string[], startIndex: number): string {
  let depth = 0;
  let inTemplate = false;
  let block = "";

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    block += `${line}\n`;

    // Track template literal depth
    for (const char of line) {
      if (char === "`") {
        if (!inTemplate) {
          inTemplate = true;
        } else {
          depth++;
          if (depth === 2) {
            return block;
          }
        }
      }
    }

    // Simple heuristic: if we see the closing backtick and semicolon
    if (line.includes("`;")) {
      return block;
    }

    // Limit extraction to prevent runaway
    if (i - startIndex > 100) {
      return block;
    }
  }

  return block;
}

function isMinimalStyle(styleBlock: string): boolean {
  // Extract just the CSS content between the backticks
  const cssMatch = styleBlock.match(/css`([\s\S]*?)`/);
  if (!cssMatch) return false;

  const cssContent = cssMatch[1].trim();

  // Allow only very minimal styles like `display: contents`
  const minimalPatterns = [
    /^:host\s*{\s*display:\s*contents;?\s*}$/,
    /^:host\s*{\s*display:\s*contents;?\s*}\s*$/,
  ];

  return minimalPatterns.some((pattern) => pattern.test(cssContent));
}

async function lintDirectory(dirPath: string, allowStyles: boolean): Promise<void> {
  try {
    const entries = await readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name);

      if (entry.isDirectory()) {
        await lintDirectory(fullPath, allowStyles);
      } else if (entry.isFile() && entry.name.endsWith(".js")) {
        await lintFile(fullPath, allowStyles);
      }
    }
  } catch (err) {
    console.error(`Failed to read directory ${dirPath}:`, err);
  }
}

async function main() {
  console.log("🔍 Running custom style linter...\n");

  const srcPath = join(process.cwd(), "src");

  // Lint design-system components (styles allowed)
  console.log("✓ Checking design-system components (styles allowed)");
  await lintDirectory(join(srcPath, "design-system"), true);

  // Lint application components (styles NOT allowed)
  console.log("✓ Checking application components (styles not allowed)");
  await lintDirectory(join(srcPath, "components"), false);

  // Report results
  console.log(`\n${"=".repeat(60)}`);

  if (warnings.length > 0) {
    console.log(`\n⚠️  ${warnings.length} warning(s):\n`);
    for (const warning of warnings) {
      console.log(`${warning.file}:${warning.line}`);
      console.log(`  ${warning.message}`);
      console.log(`  ${warning.snippet.trim().split("\n")[0]}`);
      console.log();
    }
  }

  if (errors.length > 0) {
    console.log(`\n❌ ${errors.length} error(s):\n`);
    for (const error of errors) {
      console.log(`${error.file}:${error.line}`);
      console.log(`  ${error.message}`);
      console.log(`  ${error.snippet.trim().split("\n")[0]}`);
      console.log();
    }

    console.log("=".repeat(60));
    console.log("\n💡 Fix: Move styled components to src/design-system/");
    console.log("   or refactor to use existing design system components.\n");

    process.exit(1);
  }

  if (warnings.length === 0 && errors.length === 0) {
    console.log("\n✅ All checks passed! No style violations found.\n");
  } else if (errors.length === 0) {
    console.log("\n✅ No errors found (only warnings).\n");
  }
}

main().catch((err) => {
  console.error("Linter failed:", err);
  process.exit(1);
});
