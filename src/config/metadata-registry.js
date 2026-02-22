import { listComponentMetadata } from "../metadata/components.js";
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
