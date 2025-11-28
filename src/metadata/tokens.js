import tokensData from "./generated/tokens-data.js";
import { deepClone } from "./utils.js";

const tokensMetadata = tokensData;
const tokenMetaMap = new Map(tokensMetadata.map((token) => [token.id, token]));

export const listTokenMetadata = () => tokensMetadata.map(deepClone);

export function getTokenMeta(id) {
  const base = tokenMetaMap.get(id);
  if (!base) return null;
  return deepClone(base);
}

export default tokensMetadata;
