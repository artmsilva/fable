/**
 * Component metadata — derived from static properties on component classes.
 *
 * Each design-system component declares its own identity:
 *   static status = "beta";
 *   static description = "...";
 *   static taxonomy = { group: "Inputs", tags: ["button"] };
 *
 * getComponentStoryMeta(id, overrides) reads these at registration time
 * (customElements.define runs before the meta call in every component file).
 */

const registeredMeta = [];

function toTitleCase(str) {
  return str
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Build story meta for a component by reading static fields from its class.
 * Called once per component file, after customElements.define().
 */
export function getComponentStoryMeta(id, overrides = {}) {
  const tagName = overrides.component || `fable-${id}`;
  const cls = customElements.get(tagName);

  const base = {
    id,
    title: toTitleCase(id),
    kind: "component-story",
    description: cls?.description ?? "",
    component: tagName,
    storyGroup: toTitleCase(id),
    taxonomy: {
      group: cls?.taxonomy?.group ?? "Components",
      category: cls?.taxonomy?.category ?? "Components",
      tags: cls?.taxonomy?.tags ?? [],
      status: cls?.status ?? "beta",
      platforms: cls?.taxonomy?.platforms ?? ["web"],
      accessibility: cls?.taxonomy?.accessibility ?? "baseline",
    },
    keywords: cls?.keywords ?? [],
  };

  const merged = { ...base, ...overrides };

  // Register for listComponentMetadata()
  registeredMeta.push(merged);

  return merged;
}

export const listComponentMetadata = () => [...registeredMeta];

export function getComponentMetadataByComponent(tagName) {
  return registeredMeta.find((m) => m.component === tagName) || null;
}

export default registeredMeta;
