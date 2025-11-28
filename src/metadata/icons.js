import iconsData from "./generated/icons-data.js";
import { deepClone } from "./utils.js";

const iconsMetadata = iconsData;
const iconMetaMap = new Map(iconsMetadata.map((icon) => [icon.id, icon]));

export const listIconMetadata = () => iconsMetadata.map(deepClone);

export function getIconMeta(id) {
  const base = iconMetaMap.get(id);
  if (!base) return null;
  return deepClone(base);
}

export default iconsMetadata;
