/**
 * URL and routing utilities
 */
class URLManager {
  constructor() {
    this.RECIPE_SEPARATOR = "+";
    this.RECIPE_ASSIGN = ".";
  }

  slugify(text = "") {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  getDefaultStory(stories) {
    if (!stories.length) return null;

    const firstGroup = stories[0];
    const firstName = Object.keys(firstGroup.stories)[0];

    return {
      groupIndex: 0,
      name: firstName,
      args: { ...(firstGroup.meta?.args || {}) },
      slots: { ...(firstGroup.meta?.slots || {}) },
    };
  }

  findStoryBySlugs(stories, componentSlug) {
    if (!stories.length || !componentSlug) return null;

    for (let gi = 0; gi < stories.length; gi++) {
      const group = stories[gi];
      const groupSlug = this.slugify(group.meta.title);
      if (groupSlug !== componentSlug) continue;

      const firstName = Object.keys(group.stories)[0];
      if (firstName) return { groupIndex: gi, name: firstName };
    }

    return null;
  }

  parseArgs(searchParams) {
    return this.parseStorySearchParams(searchParams).args;
  }

  parseStorySearchParams(searchParams) {
    const params =
      typeof searchParams === "string"
        ? new URLSearchParams(searchParams)
        : searchParams || new URLSearchParams();

    const result = {};
    let recipe = null;
    for (const [key, value] of params.entries()) {
      if (key === "recipe") {
        recipe = this.parseRecipeParam(value);
        continue;
      }
      if (key === "auto") continue;
      result[key] = this._coerceValue(value);
    }
    return { args: result, recipe };
  }

  buildStoryPath(stories, groupIndex) {
    const group = stories[groupIndex];
    if (!group) return "/";
    const componentSlug = this.slugify(group.meta.title);
    return `/components/${componentSlug}`;
  }

  buildStoryURL(stories, groupIndex, storyName, args = {}, options = {}) {
    const path = this.buildStoryPath(stories, groupIndex);
    const params = new URLSearchParams();

    Object.entries(args || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.set(key, String(value));
      }
    });

    if (options?.recipe) {
      const encoded = this.serializeRecipe(options.recipe);
      if (encoded) {
        params.set("recipe", encoded);
        params.set("auto", "1");
      }
    }

    const search = params.toString();
    return search ? `${path}?${search}` : path;
  }

  buildDocsPath(section, slug) {
    if (!section || !slug) return "/docs";
    return `/docs/${section}/${slug}`;
  }

  buildTokensPath(tokenId) {
    return tokenId ? `/tokens/${tokenId}` : "/tokens";
  }

  buildIconsPath(iconId) {
    return iconId ? `/icons/${iconId}` : "/icons";
  }

  serializeRecipe(selection = {}) {
    const entries = Object.entries(selection || {}).filter(
      ([, value]) => value !== undefined && value !== null && value !== ""
    );
    if (!entries.length) return "";
    return entries
      .map(
        ([axis, value]) =>
          `${encodeURIComponent(axis)}${this.RECIPE_ASSIGN}${encodeURIComponent(value)}`
      )
      .join(this.RECIPE_SEPARATOR);
  }

  parseRecipeParam(raw = "") {
    if (!raw) return null;
    const selection = {};
    raw
      .split(this.RECIPE_SEPARATOR)
      .filter(Boolean)
      .forEach((pair) => {
        const [axisPart, valuePart] = pair.split(this.RECIPE_ASSIGN);
        if (!axisPart || !valuePart) return;
        const axis = decodeURIComponent(axisPart);
        const value = decodeURIComponent(valuePart);
        if (axis) {
          selection[axis] = value;
        }
      });
    return Object.keys(selection).length ? selection : null;
  }

  _coerceValue(value) {
    if (value === "true") return true;
    if (value === "false") return false;
    if (!Number.isNaN(Number(value)) && value.trim() !== "") {
      return Number(value);
    }
    return value;
  }
}

// Create and export singleton instance
const urlManager = new URLManager();

// Export methods
export const slugify = (text) => urlManager.slugify(text);
export const getDefaultStory = (stories) => urlManager.getDefaultStory(stories);
export const findStoryBySlugs = (stories, componentSlug) =>
  urlManager.findStoryBySlugs(stories, componentSlug);
export const parseStorySearchParams = (searchParams) =>
  urlManager.parseStorySearchParams(searchParams);
export const buildStoryPath = (stories, groupIndex) =>
  urlManager.buildStoryPath(stories, groupIndex);
export const buildStoryURL = (stories, groupIndex, storyName, args, options) =>
  urlManager.buildStoryURL(stories, groupIndex, storyName, args, options);
