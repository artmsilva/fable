#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import path from "node:path";
import url from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import { listComponentMetadata } from "../src/metadata/components.js";
import { listDocsMetadata } from "../src/metadata/docs.js";
import { listIconMetadata } from "../src/metadata/icons.js";
import { listTokenMetadata } from "../src/metadata/tokens.js";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const schemaPath = path.join(rootDir, "config", "metadata.schema.json");

async function loadSchema() {
  const raw = await readFile(schemaPath, "utf8");
  return JSON.parse(raw);
}

function formatErrors(errors = []) {
  return errors
    .map((err) => {
      const instancePath = err.instancePath || "(root)";
      return `${instancePath} ${err.message || "invalid"}${
        err.params ? ` ${JSON.stringify(err.params)}` : ""
      }`;
    })
    .join("\n");
}

async function validate() {
  const schema = await loadSchema();
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  ajv.addSchema(schema, "metadata");

  const validators = {
    components: ajv.compile({
      $ref: `${schema.$id}#/definitions/componentStoryMeta`,
    }),
    docs: ajv.compile({
      $ref: `${schema.$id}#/definitions/docsMeta`,
    }),
    tokens: ajv.compile({
      $ref: `${schema.$id}#/definitions/tokenMeta`,
    }),
    icons: ajv.compile({
      $ref: `${schema.$id}#/definitions/iconMeta`,
    }),
  };

  const registries = [
    { name: "components", data: listComponentMetadata() },
    { name: "docs", data: listDocsMetadata() },
    { name: "tokens", data: listTokenMetadata() },
    { name: "icons", data: listIconMetadata() },
  ];

  let errored = false;

  for (const registry of registries) {
    if (!registry.data.length) continue;

    const validator = validators[registry.name];
    if (!validator) continue;

    for (const meta of registry.data) {
      const valid = validator(meta);
      if (!valid) {
        errored = true;
        console.error(
          `\nMetadata validation failed for ${registry.name} entry "${meta.id}":\n${formatErrors(
            validator.errors
          )}`
        );
      }
    }
  }

  if (errored) {
    process.exitCode = 1;
    console.error("\nMetadata validation failed.");
  } else {
    console.log("Metadata validation passed.");
  }
}

validate().catch((error) => {
  console.error("Metadata validation crashed:", error);
  process.exitCode = 1;
});
