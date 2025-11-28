import { getComponentMetadataByComponent, listComponentMetadata } from "../metadata/components.js";
import { listDocsMetadata } from "../metadata/docs.js";
import { listIconMetadata } from "../metadata/icons.js";
import { listTokenMetadata } from "../metadata/tokens.js";

const registry = {
  components: listComponentMetadata(),
  docs: listDocsMetadata(),
  tokens: listTokenMetadata(),
  icons: listIconMetadata(),
};

export const getMetadataRegistry = () => registry;

export const getAllComponentMetadata = () => registry.components;
export const getAllDocsMetadata = () => registry.docs;
export const getAllTokenMetadata = () => registry.tokens;
export const getAllIconMetadata = () => registry.icons;

export function findComponentMetaByComponent(tagName) {
  return getComponentMetadataByComponent(tagName);
}
