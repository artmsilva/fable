#!/usr/bin/env node

/**
 * Lint UI components for hardcoded values that should use design tokens.
 *
 * Usage:
 *   node scripts/lint-tokens.js          # report violations
 *   node scripts/lint-tokens.js --fix    # auto-fix with best-match tokens
 *
 * Checks packages/fable/ui/*.js CSS for hardcoded colors, spacing,
 * font sizes, border-radius, box-shadow, and font-family values.
 *
 * Skips:
 *   - Values inside var() fallbacks
 *   - Lines with @allow-hardcoded comment
 */

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const UI_DIR = join(__dirname, "..", "packages", "fable", "ui");
const ROOT = join(__dirname, "..");
const FIX_MODE = process.argv.includes("--fix");

// ── Token maps ──────────────────────────────────────────────────

// Space tokens: --space-base = 0.25rem, --space-N = 0.25rem * N
// So: 1px~2px ≈ space-base, 4px~0.25rem = space-1, 8px~0.5rem = space-2,
// 12px~0.75rem = space-3, 16px~1rem = space-4, 20px~1.25rem = space-5, 24px~1.5rem = space-6
const SPACE_MAP = new Map([
  ["1px", "var(--space-base)"],
  ["2px", "var(--space-base)"],
  ["3px", "var(--space-1)"],
  ["4px", "var(--space-1)"],
  ["5px", "var(--space-1)"],
  ["6px", "var(--space-2)"],
  ["8px", "var(--space-2)"],
  ["10px", "var(--space-3)"],
  ["12px", "var(--space-3)"],
  ["16px", "var(--space-4)"],
  ["20px", "var(--space-5)"],
  ["24px", "var(--space-6)"],
  ["0.25rem", "var(--space-base)"],
  ["0.5rem", "var(--space-2)"],
  ["0.75rem", "var(--space-3)"],
  ["1rem", "var(--space-4)"],
  ["1.25rem", "var(--space-5)"],
  ["1.5rem", "var(--space-6)"],
]);

// Font size tokens
const FONT_SIZE_MAP = new Map([
  ["0.55rem", "var(--font-size-xs)"],
  ["0.6rem", "var(--font-size-xs)"],
  ["0.65rem", "var(--font-size-xs)"],
  ["0.7rem", "var(--font-size-xs)"],
  ["0.75rem", "var(--font-size-xs)"],
  ["0.8rem", "var(--font-size-sm)"],
  ["0.85rem", "var(--font-size-sm)"],
  ["0.875rem", "var(--font-size-sm)"],
  ["0.9rem", "var(--font-size-sm)"],
  ["1rem", "var(--font-body)"],
  ["1.1rem", "var(--font-size-lg)"],
  ["1.125rem", "var(--font-size-lg)"],
  ["1.2rem", "var(--font-size-lg)"],
]);

// Border radius tokens
const RADIUS_MAP = new Map([
  ["2px", "var(--space-base)"],
  ["3px", "var(--space-base)"],
  ["4px", "var(--space-1)"],
  ["6px", "var(--space-2)"],
  ["8px", "var(--space-2)"],
  ["999px", "var(--border-radius-full)"],
]);

// Color tokens — known hex values from the theme
const COLOR_MAP = new Map([
  ["#c4622d", "var(--primary-color)"],
  ["#e8845a", "var(--primary-color)"],
  ["#6b5f52", "var(--text-secondary)"],
  ["#9e8e7e", "var(--text-secondary)"],
  ["#fdfaf5", "var(--bg-primary)"],
  ["#f0ead6", "var(--bg-secondary)"],
  ["#1c1917", "var(--text-primary)"],
  ["#d6cdb8", "var(--border-color)"],
  ["#3d3530", "var(--border-color)"],
  ["#28231f", "var(--bg-secondary)"],
  // Semantic colors from style.css
  ["#b54708", "var(--color-warning-text)"],
  ["#dc3545", "var(--color-error)"],
  // Common hardcoded values found in components
  ["#b83232", "var(--color-error)"],
  ["#f59e0b", "var(--color-warning-text)"],
  ["#ef4444", "var(--color-error)"],
  ["#7c3aed", "var(--syntax-keyword)"],
  ["#16a34a", "var(--syntax-string)"],
  ["#6b7280", "var(--syntax-comment)"],
  ["#d97706", "var(--syntax-number)"],
  ["#f1f1f1", "var(--text-primary)"],
  ["#0f0f0f", "var(--bg-primary)"],
  ["#1fb6ff", "var(--primary-color)"],
]);

// Font family
const FONT_FAMILY_REPLACEMENTS = [
  { pattern: /font-family:\s*"JetBrains Mono"[^;]*/g, replacement: "font-family: var(--font-stack)" },
  { pattern: /font-family:\s*"DM Serif Display"[^;]*/g, replacement: "font-family: var(--font-display)" },
  { pattern: /font-family:\s*"FontWithASyntaxHighlighter"[^;]*/g, replacement: "font-family: var(--font-stack)" },
];

// rgba patterns → shadow token
const RGBA_REPLACEMENTS = [
  { pattern: /rgba\(28,\s*25,\s*23,\s*[\d.]+\)/g, token: "var(--shadow-color)" },
  { pattern: /rgba\(0,\s*0,\s*0,\s*0\.0[0-9]+\)/g, token: "var(--shadow-color)" },
  { pattern: /rgba\(0,\s*0,\s*0,\s*0\.1\d*\)/g, token: "var(--shadow-color)" },
  { pattern: /rgba\(0,\s*0,\s*0,\s*0\.15\)/g, token: "var(--shadow-color)" },
  { pattern: /rgba\(0,\s*0,\s*0,\s*0\.5\)/g, token: "var(--shadow-color)" },
  { pattern: /rgba\(255,\s*255,\s*255,\s*[\d.]+\)/g, token: "var(--shadow-color)" },
];

// ── CSS extraction ──────────────────────────────────────────────

function extractCSSBlocks(source) {
  const blocks = [];
  const regex = /css`([\s\S]*?)`/g;
  let match;
  while ((match = regex.exec(source)) !== null) {
    const cssText = match[1];
    const startOffset = match.index + 4;
    const linesBefore = source.slice(0, startOffset).split("\n").length;
    const lines = cssText.split("\n");
    for (let i = 0; i < lines.length; i++) {
      blocks.push({ text: lines[i], line: linesBefore + i });
    }
  }
  return blocks;
}

// ── Checks ──────────────────────────────────────────────────────

const CHECKS = [
  {
    name: "hardcoded hex color",
    pattern: /#[0-9a-fA-F]{3,8}\b/,
    suggestion: "Use a color token",
  },
  {
    name: "hardcoded rgb/rgba",
    pattern: /\brgba?\(\s*\d/,
    suggestion: "Use var(--shadow-color) or a color token",
  },
  {
    name: "hardcoded hsl/hsla",
    pattern: /\bhsla?\(\s*\d/,
    suggestion: "Use a color token",
  },
  {
    name: "hardcoded font-size",
    pattern: /font-size:\s*[\d.]+(?:px|rem|em)\b/,
    suggestion: "Use var(--font-body/label/size-xs/sm/lg)",
  },
  {
    name: "hardcoded padding",
    pattern: /padding(?:-(?:top|right|bottom|left))?:\s*[\d.]+(?:px|rem|em)\b/,
    suggestion: "Use var(--space-1) through var(--space-6)",
  },
  {
    name: "hardcoded margin",
    pattern: /margin(?:-(?:top|right|bottom|left))?:\s*[\d.]+(?:px|rem|em)\b/,
    suggestion: "Use var(--space-1) through var(--space-6)",
  },
  {
    name: "hardcoded gap",
    pattern: /gap:\s*[\d.]+(?:px|rem|em)\b/,
    suggestion: "Use var(--space-1) through var(--space-6)",
  },
  {
    name: "hardcoded border-radius",
    pattern: /border-radius:\s*[\d.]+(?:px|rem|em)\b/,
    suggestion: "Use var(--space-base/1/2) or var(--border-radius-full)",
  },
  {
    name: "hardcoded font-family",
    pattern: /font-family:\s*["'][A-Z]/,
    suggestion: "Use var(--font-stack) or var(--font-display)",
  },
];

function isAllowlisted(line) {
  const trimmed = line.trim();
  if (trimmed.includes("@allow-hardcoded")) return true;
  if (!trimmed || trimmed.startsWith("/*") || trimmed.startsWith("*") || trimmed.startsWith("//")) return true;
  return false;
}

function isInsideVarFallback(line, matchIndex) {
  const before = line.slice(0, matchIndex);
  let parenDepth = 0;
  for (let i = before.length - 1; i >= 0; i--) {
    if (before[i] === ")") parenDepth++;
    if (before[i] === "(") {
      parenDepth--;
      if (parenDepth < 0) {
        const preceding = before.slice(Math.max(0, i - 10), i).trim();
        if (/var$/.test(preceding) || /color-mix$/.test(preceding)) return true;
        break;
      }
    }
    if (before[i] === "," && parenDepth === 0) {
      const preceding = before.slice(0, i);
      if (/var\s*\(/.test(preceding)) return true;
    }
  }
  return false;
}

function getLineAt(str, offset) {
  const start = str.lastIndexOf("\n", offset - 1) + 1;
  const end = str.indexOf("\n", offset);
  return str.slice(start, end === -1 ? str.length : end);
}

// ── Auto-fix engine ─────────────────────────────────────────────

function applyFixes(source) {
  let result = source;
  let fixCount = 0;

  // Replace hardcoded hex colors (outside var() fallbacks)
  result = result.replace(/(css`[\s\S]*?`)/g, (cssBlock) => {
    let fixed = cssBlock;

    // Font family
    for (const { pattern, replacement } of FONT_FAMILY_REPLACEMENTS) {
      const before = fixed;
      fixed = fixed.replace(pattern, replacement);
      if (fixed !== before) fixCount++;
    }

    // rgba → shadow token
    for (const { pattern, token } of RGBA_REPLACEMENTS) {
      fixed = fixed.replace(pattern, (match, offset) => {
        const line = getLineAt(fixed, offset);
        const localOffset = offset - fixed.lastIndexOf("\n", offset - 1) - 1;
        if (isInsideVarFallback(line, localOffset)) return match;
        fixCount++;
        return token;
      });
    }

    // Hex colors → color tokens
    fixed = fixed.replace(/(:\s*)(#[0-9a-fA-F]{3,8})\b/g, (match, prefix, hex, offset) => {
      const line = getLineAt(fixed, offset);
      const localOffset = offset - fixed.lastIndexOf("\n", offset - 1) - 1;
      if (isInsideVarFallback(line, localOffset)) return match;
      const token = COLOR_MAP.get(hex.toLowerCase());
      if (token) {
        fixCount++;
        return `${prefix}${token}`;
      }
      return match;
    });

    // font-size: <value> → font size token
    fixed = fixed.replace(/font-size:\s*([\d.]+(?:px|rem|em))/g, (match, value) => {
      const token = FONT_SIZE_MAP.get(value);
      if (token) {
        fixCount++;
        return `font-size: ${token}`;
      }
      return match;
    });

    // border-radius: <value> → radius token
    fixed = fixed.replace(/border-radius:\s*([\d.]+(?:px|rem|em))/g, (match, value) => {
      const token = RADIUS_MAP.get(value);
      if (token) {
        fixCount++;
        return `border-radius: ${token}`;
      }
      return match;
    });

    // Spacing properties: padding, margin, gap
    // Handle single values and multi-value shorthand (e.g., "padding: 6px 10px")
    const spacingProps = /(?:padding(?:-(?:top|right|bottom|left))?|margin(?:-(?:top|right|bottom|left))?|gap):\s*/g;
    fixed = fixed.replace(spacingProps, (propMatch) => propMatch); // anchor

    // Single-value spacing
    fixed = fixed.replace(
      /((?:padding(?:-(?:top|right|bottom|left))?|margin(?:-(?:top|right|bottom|left))?|gap):\s*)([\d.]+(?:px|rem|em))\s*;/g,
      (match, prop, value) => {
        const token = SPACE_MAP.get(value);
        if (token) {
          fixCount++;
          return `${prop}${token};`;
        }
        return match;
      },
    );

    // Two-value spacing shorthand (e.g., "padding: 2px 5px;")
    fixed = fixed.replace(
      /((?:padding|margin):\s*)([\d.]+(?:px|rem|em))\s+([\d.]+(?:px|rem|em))\s*;/g,
      (match, prop, v1, v2) => {
        const t1 = SPACE_MAP.get(v1);
        const t2 = SPACE_MAP.get(v2);
        if (t1 && t2) {
          fixCount++;
          return `${prop}${t1} ${t2};`;
        }
        return match;
      },
    );

    return fixed;
  });

  return { result, fixCount };
}

// ── Main ────────────────────────────────────────────────────────

let totalViolations = 0;
let totalFiles = 0;
let totalFixed = 0;

const files = readdirSync(UI_DIR)
  .filter((f) => f.endsWith(".js") && f !== "index.js")
  .sort();

for (const file of files) {
  const filePath = join(UI_DIR, file);
  const source = readFileSync(filePath, "utf8");
  const rel = relative(ROOT, filePath);

  if (FIX_MODE) {
    const { result, fixCount } = applyFixes(source);
    if (fixCount > 0) {
      writeFileSync(filePath, result, "utf8");
      totalFixed += fixCount;
      totalFiles++;
      console.log(`  \x1b[32m✓\x1b[0m ${rel}  \x1b[2m${fixCount} fixed\x1b[0m`);
    }
  } else {
    const cssLines = extractCSSBlocks(source);
    const violations = [];

    for (const { text, line } of cssLines) {
      if (isAllowlisted(text)) continue;
      for (const check of CHECKS) {
        const match = check.pattern.exec(text);
        if (!match) continue;
        if (isInsideVarFallback(text, match.index)) continue;
        violations.push({ line, column: match.index + 1, rule: check.name, suggestion: check.suggestion, snippet: text.trim() });
      }
    }

    if (violations.length) {
      totalFiles++;
      console.log(`\n\x1b[1m${rel}\x1b[0m`);
      for (const v of violations) {
        totalViolations++;
        console.log(`  \x1b[33m${v.line}:${v.column}\x1b[0m  ${v.rule}  \x1b[2m${v.suggestion}\x1b[0m`);
        console.log(`    ${v.snippet}`);
      }
    }
  }
}

if (FIX_MODE) {
  if (totalFixed === 0) {
    console.log("\x1b[32m✓ Nothing to fix.\x1b[0m");
  } else {
    console.log(`\n\x1b[32m✓ Fixed ${totalFixed} value${totalFixed === 1 ? "" : "s"} in ${totalFiles} file${totalFiles === 1 ? "" : "s"}.\x1b[0m`);
    console.log("  Run without --fix to check for remaining violations.\n");
  }
} else if (totalViolations === 0) {
  console.log("\x1b[32m✓ No hardcoded values found in UI components.\x1b[0m");
} else {
  console.log(`\n\x1b[31m✗ ${totalViolations} violation${totalViolations === 1 ? "" : "s"} in ${totalFiles} file${totalFiles === 1 ? "" : "s"}\x1b[0m`);
  console.log("  Run with --fix to auto-replace, or add @allow-hardcoded to opt out.\n");
  process.exit(1);
}
