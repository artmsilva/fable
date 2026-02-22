import { register } from "./registry.js";

function toTitleCase(str) {
  return str.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export function define(tag, Class) {
  customElements.define(tag, Class);
  const id = tag.replace(/^fable-/, "");
  const meta = {
    id,
    title: Class.title || toTitleCase(id),
    kind: "component-story",
    builtin: tag.startsWith("fable-"),
    description: Class.description || "",
    component: tag,
    storyGroup: Class.title || toTitleCase(id),
    status: Class.status || "beta",
    taxonomy: {
      group: Class.taxonomy?.group ?? "Components",
      category: Class.taxonomy?.category ?? "Components",
      tags: Class.taxonomy?.tags ?? [],
      status: Class.status ?? "beta",
      platforms: Class.taxonomy?.platforms ?? ["web"],
      accessibility: Class.taxonomy?.accessibility ?? "baseline",
    },
    keywords: Class.keywords ?? [],
    args: Class.args || {},
    argTypes: Class.argTypes || {},
    slots: Class.slots || {},
    lockedArgs: Class.lockedArgs || {},
    recipeBlueprint: Class.recipeBlueprint || null,
  };
  const stories = Class.stories || {};
  register({ meta, stories });
}
