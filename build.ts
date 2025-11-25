import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename: string = fileURLToPath(import.meta.url);
const __dirname: string = path.dirname(__filename);

const SRC_DIR = path.join(__dirname, "src");
const DIST_DIR = path.join(__dirname, "dist");

interface FileManifest {
  [originalName: string]: string;
}

interface BuildManifest {
  "app.js": string;
  "style.css": string;
  components: FileManifest;
}

/**
 * Generate SHA-256 hash of file content (first 8 characters)
 */
async function generateFileHash(filePath: string): Promise<string> {
  const content = await fs.readFile(filePath);
  return createHash("sha256").update(content).digest("hex").substring(0, 8);
}

/**
 * Get hashed filename from original filename
 */
function getHashedFilename(filename: string, hash: string): string {
  const ext = path.extname(filename);
  const base = path.basename(filename, ext);
  return `${base}.${hash}${ext}`;
}

/**
 * Clean and create dist directory
 */
async function setupDistDirectory(): Promise<void> {
  try {
    await fs.rm(DIST_DIR, { recursive: true, force: true });
  } catch (_error) {
    // Directory might not exist, ignore error
  }
  await fs.mkdir(DIST_DIR, { recursive: true });
  await fs.mkdir(path.join(DIST_DIR, "components"), { recursive: true });
}

/**
 * Copy static assets that don't need fingerprinting
 */
async function copyStaticAssets(): Promise<void> {
  const staticFiles = ["404.html", "favicon.svg", "config.js"];

  for (const file of staticFiles) {
    const src = path.join(SRC_DIR, file);
    const dest = path.join(DIST_DIR, file);

    try {
      await fs.copyFile(src, dest);
      console.log(`✓ Copied ${file}`);
    } catch (_error) {
      // File might not exist, just skip
      console.log(`⚠ Skipped ${file} (not found)`);
    }
  }
}

/**
 * Build module directories with fingerprinting (first pass - just hash)
 */
async function buildModule(moduleName: string, moduleMap: FileManifest): Promise<void> {
  const moduleDir = path.join(SRC_DIR, moduleName);
  const entries = await fs.readdir(moduleDir, { withFileTypes: true });

  await fs.mkdir(path.join(DIST_DIR, moduleName), { recursive: true });

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".js")) continue;

    const srcPath = path.join(moduleDir, entry.name);
    const hash = await generateFileHash(srcPath);
    const hashedName = getHashedFilename(entry.name, hash);

    moduleMap[`./${moduleName}/${entry.name}`] = `./${moduleName}/${hashedName}`;
  }
}

/**
 * Write module files with updated imports (second pass)
 */
async function writeModuleFiles(moduleName: string, moduleMap: FileManifest): Promise<void> {
  const moduleDir = path.join(SRC_DIR, moduleName);
  const entries = await fs.readdir(moduleDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".js")) continue;

    const srcPath = path.join(moduleDir, entry.name);
    const content = await updateImports(srcPath, moduleMap);
    const hashedPath = moduleMap[`./${moduleName}/${entry.name}`];
    const hashedName = hashedPath.split("/").pop() || entry.name;
    const destPath = path.join(DIST_DIR, moduleName, hashedName);

    await fs.writeFile(destPath, content, "utf-8");
    console.log(`✓ Built ${moduleName}/${entry.name} → ${moduleName}/${hashedName}`);
  }
}

/**
 * Build all modules (design-system, store, utils) - two pass approach
 */
async function buildModules(): Promise<FileManifest> {
  const moduleMap: FileManifest = {};
  const modules = ["design-system", "store", "utils"];

  // First pass: generate all hashes
  for (const module of modules) {
    try {
      await buildModule(module, moduleMap);
    } catch (_error) {
      console.log(`⚠ Skipped ${module}/ (not found)`);
    }
  }

  // Second pass: write files with updated imports
  for (const module of modules) {
    try {
      await writeModuleFiles(module, moduleMap);
    } catch (_error) {
      console.log(`⚠ Failed to write ${module}/`);
    }
  }

  return moduleMap;
}

/**
 * Update imports in a file with hashed versions
 */
async function updateImports(filePath: string, moduleMap: FileManifest): Promise<string> {
  let content = await fs.readFile(filePath, "utf-8");

  // Get the directory of the current file for resolving relative imports
  const _fileDir = path.dirname(filePath);
  const _relativeSrcDir = path.relative(__dirname, SRC_DIR);

  for (const [original, hashed] of Object.entries(moduleMap)) {
    // Handle both absolute paths (./store/file.js) and relative paths (./file.js)
    const originalFileName = path.basename(original);
    const hashedFileName = path.basename(hashed);

    // Try exact match first
    const escapedOriginal = original.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    content = content.replace(
      new RegExp(
        `(import\\s+[^"']*["']${escapedOriginal}["']|from\\s+["']${escapedOriginal}["'])`,
        "g"
      ),
      (match) => match.replace(original, hashed)
    );

    // Also try relative path match (for imports within same module)
    // Matches: import "./file.js", from "./file.js", export * from "./file.js"
    content = content.replace(
      new RegExp(`(["'])\\.\\/${originalFileName}\\1`, "g"),
      `$1./${hashedFileName}$1`
    );
  }

  return content;
}

/**
 * Build components with fingerprinting and updated imports
 */
async function buildComponents(moduleMap: FileManifest): Promise<FileManifest> {
  const componentsDir = path.join(SRC_DIR, "components");
  const componentFiles = await fs.readdir(componentsDir);
  const componentMap: FileManifest = {};

  for (const file of componentFiles) {
    if (!file.endsWith(".js")) continue;

    const srcPath = path.join(componentsDir, file);

    // Update imports in component
    const content = await updateImports(srcPath, moduleMap);

    // Generate hash from updated content
    const hash = createHash("sha256").update(content).digest("hex").substring(0, 8);
    const hashedName = getHashedFilename(file, hash);
    const destPath = path.join(DIST_DIR, "components", hashedName);

    await fs.writeFile(destPath, content, "utf-8");
    componentMap[`./components/${file}`] = `./components/${hashedName}`;

    console.log(`✓ Built components/${file} → components/${hashedName}`);
  }

  return componentMap;
}

/**
 * Build app.js with updated imports
 */
async function buildApp(componentMap: FileManifest, moduleMap: FileManifest): Promise<string> {
  const appPath = path.join(SRC_DIR, "app.js");
  let appContent = await fs.readFile(appPath, "utf-8");

  // Combine all maps
  const allMaps = { ...componentMap, ...moduleMap };

  // Replace imports with hashed versions
  for (const [original, hashed] of Object.entries(allMaps)) {
    // Escape special regex characters in the path
    const escapedOriginal = original.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    appContent = appContent.replace(
      new RegExp(`(import\\s+["']${escapedOriginal}["']|from\\s+["']${escapedOriginal}["'])`, "g"),
      (match) => (match.includes("import") ? `import "${hashed}"` : `from "${hashed}"`)
    );
  }

  // Generate hash for modified app.js content
  const appHash = createHash("sha256").update(appContent).digest("hex").substring(0, 8);
  const hashedAppName = getHashedFilename("app.js", appHash);
  const appDestPath = path.join(DIST_DIR, hashedAppName);

  await fs.writeFile(appDestPath, appContent, "utf-8");
  console.log(`✓ Built app.js → ${hashedAppName}`);

  return hashedAppName;
}

/**
 * Build style.css with fingerprinting
 */
async function buildStyles(): Promise<string> {
  const stylePath = path.join(SRC_DIR, "style.css");
  const hash = await generateFileHash(stylePath);
  const hashedName = getHashedFilename("style.css", hash);
  const destPath = path.join(DIST_DIR, hashedName);

  await fs.copyFile(stylePath, destPath);
  console.log(`✓ Built style.css → ${hashedName}`);

  return hashedName;
}

/**
 * Build index.html with updated asset references
 */
async function buildHTML(
  hashedAppName: string,
  hashedStyleName: string,
  moduleMap: FileManifest
): Promise<void> {
  const indexPath = path.join(SRC_DIR, "index.html");
  let htmlContent = await fs.readFile(indexPath, "utf-8");

  // Replace stylesheet reference
  htmlContent = htmlContent.replace(/href="style\.css"/g, `href="${hashedStyleName}"`);

  // Replace script reference
  htmlContent = htmlContent.replace(/src="app\.js"/g, `src="${hashedAppName}"`);

  // Update import map with hashed barrel files and individual components
  const importMapMatch = htmlContent.match(/<script type="importmap">([\s\S]*?)<\/script>/);
  if (importMapMatch) {
    const importMap = JSON.parse(importMapMatch[1]);

    // Update barrel file references in import map
    for (const [original, hashed] of Object.entries(moduleMap)) {
      const importMapPath = original.replace(/^\.\//, "./");
      const hashedPath = hashed.replace(/^\.\//, "./");

      // Update barrel file entries like "@design-system"
      for (const [key, value] of Object.entries(importMap.imports)) {
        if (value === importMapPath) {
          importMap.imports[key] = hashedPath;
        }
      }

      // Add individual component mappings for side-effect imports
      // e.g., "@design-system/button.js" -> "./design-system/button.hash.js"
      if (original.includes("/") && !original.endsWith("/index.js")) {
        const parts = original.replace(/^\.\//, "").split("/");
        if (parts.length === 2) {
          const [moduleName, fileName] = parts;
          const importKey = `@${moduleName}/${fileName}`;
          importMap.imports[importKey] = hashedPath;
        }
      }
    }

    const updatedImportMapJson = JSON.stringify(importMap, null, 2).replace(/^/gm, "      ");
    htmlContent = htmlContent.replace(
      /<script type="importmap">[\s\S]*?<\/script>/,
      `<script type="importmap">\n${updatedImportMapJson}\n    </script>`
    );
  }

  const destPath = path.join(DIST_DIR, "index.html");
  await fs.writeFile(destPath, htmlContent, "utf-8");
  console.log(`✓ Built index.html`);
}

/**
 * Create manifest file for debugging
 */
async function createManifest(
  componentMap: FileManifest,
  hashedAppName: string,
  hashedStyleName: string
): Promise<void> {
  const manifest: BuildManifest = {
    "app.js": hashedAppName,
    "style.css": hashedStyleName,
    components: {},
  };

  for (const [original, hashed] of Object.entries(componentMap)) {
    const originalFile = original.replace("./components/", "");
    const hashedFile = hashed.replace("./components/", "");
    manifest.components[originalFile] = hashedFile;
  }

  const manifestPath = path.join(DIST_DIR, "manifest.json");
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
  console.log(`✓ Created manifest.json`);
}

/**
 * Main build function
 */
async function build(): Promise<void> {
  console.log("🔨 Building fable for production...\n");

  try {
    // Setup
    await setupDistDirectory();

    // Copy static assets
    await copyStaticAssets();

    // Build modules first (they need to be referenced by components)
    const moduleMap = await buildModules();

    // Build components (with updated module imports)
    const componentMap = await buildComponents(moduleMap);

    // Build app.js with updated imports
    const hashedAppName = await buildApp(componentMap, moduleMap);

    // Build styles
    const hashedStyleName = await buildStyles();

    // Build HTML
    await buildHTML(hashedAppName, hashedStyleName, moduleMap);

    // Create manifest
    await createManifest(componentMap, hashedAppName, hashedStyleName);

    console.log("\n✅ Build complete! Output in dist/");
    console.log(`\nFingerprinted files:`);
    console.log(`  - ${hashedStyleName}`);
    console.log(`  - ${hashedAppName}`);
    console.log(`  - ${Object.keys(componentMap).length} component(s)\n`);
  } catch (error) {
    console.error("❌ Build failed:", error);
    process.exit(1);
  }
}

// Run build
build();
