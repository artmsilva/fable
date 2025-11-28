#!/usr/bin/env node
import { readFile, writeFile, readdir } from "node:fs/promises";
import path from "node:path";
import url from "node:url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const srcDir = path.join(rootDir, "design-system", "icons-src");
const outputPath = path.join(rootDir, "design-system", "icons.json");
const moduleOutPath = path.join(
  rootDir,
  "src",
  "metadata",
  "generated",
  "icons-data.js",
);

const metadata = {
  sun: {
    title: "Sun",
    description: "Sun glyph used for light mode toggles.",
    style: "outline",
    tags: ["icon", "weather"],
  },
  moon: {
    title: "Moon",
    description: "Moon glyph used for dark mode toggles.",
    style: "outline",
    tags: ["icon", "theme"],
  },
  "arrow-right": {
    title: "Arrow Right",
    description: "Chevron arrow pointing right, used in navigation.",
    style: "filled",
    tags: ["icon", "navigation"],
  },
  check: {
    title: "Checkmark",
    description: "Checkmark for success states.",
    style: "outline",
    tags: ["icon", "status"],
  },
  alert: {
    title: "Alert",
    description: "Alert triangle used for warnings.",
    style: "outline",
    tags: ["icon", "warning"],
  },
  edit: {
    title: "Edit",
    description: "Pencil edit icon.",
    style: "outline",
    tags: ["icon", "editor"],
  },
};

const commonTaxonomy = {
  group: "Icons",
  category: "Foundations",
  status: "beta",
  platforms: ["web"],
  accessibility: "baseline",
};

async function parseIconFile(filePath) {
  const svg = await readFile(filePath, "utf8");
  const pathMatch = svg.match(/<path[^>]*d="([^"]+)"/i);
  if (!pathMatch) {
    throw new Error(`No <path> found in ${filePath}`);
  }
  return pathMatch[1];
}

async function main() {
  const files = await readdir(srcDir);
  const icons = [];

  for (const fileName of files) {
    if (!fileName.endsWith(".svg")) continue;
    const slug = fileName.replace(/\.svg$/, "");
    const meta = metadata[slug];
    if (!meta) {
      console.warn(`Skipping ${fileName} (no metadata entry)`);
      continue;
    }
    const svgPath = await parseIconFile(path.join(srcDir, fileName));
    const id = `icon-${slug}`;
    icons.push({
      id,
      title: meta.title,
      kind: "icon",
      description: meta.description,
      svgPath,
      style: meta.style,
      size: 24,
      createdAt: "2024-05-10T00:00:00.000Z",
      updatedAt: "2024-05-10T00:00:00.000Z",
      taxonomy: {
        ...commonTaxonomy,
        tags: meta.tags,
      },
    });
  }

  icons.sort((a, b) => a.title.localeCompare(b.title));
  await writeFile(outputPath, `${JSON.stringify(icons, null, 2)}\n`);
  const moduleContent = `// Generated from design-system/icons.json\nexport default ${JSON.stringify(
    icons,
    null,
    2,
  )};\n`;
  await writeFile(moduleOutPath, moduleContent);
  console.log(`Wrote ${outputPath} (${icons.length} icons)`);
  console.log(`Wrote ${moduleOutPath}`);
}

main().catch((error) => {
  console.error("icons:sync failed", error);
  process.exitCode = 1;
});
