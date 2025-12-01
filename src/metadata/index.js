import { getTokenMeta, listTokenMetadata } from "./tokens.js";

export {
  getComponentMetadataByComponent,
  getComponentStoryMeta,
  listComponentMetadata,
} from "./components.js";
export { listDocsMetadata } from "./docs.js";
export { listIconMetadata } from "./icons.js";
export { getTokenMeta, listTokenMetadata };

export const getTokenMetadata = () => listTokenMetadata();
