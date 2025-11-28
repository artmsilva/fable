/**
 * URL and routing utilities
 */
class URLManager {
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

  findStoryBySlugs(stories, componentSlug, storySlug) {
    if (!stories.length || !componentSlug || !storySlug) return null;

    for (let gi = 0; gi < stories.length; gi++) {
      const group = stories[gi];
      const groupSlug = this.slugify(group.meta.title);
      if (groupSlug !== componentSlug) continue;

      const storyNames = Object.keys(group.stories);
      for (const name of storyNames) {
        if (this.slugify(name) === storySlug) {
          return { groupIndex: gi, name };
        }
      }
    }

    return null;
  }

  parseArgs(searchParams) {
    const params =
      typeof searchParams === "string"
        ? new URLSearchParams(searchParams)
        : searchParams || new URLSearchParams();

    const result = {};
    for (const [key, value] of params.entries()) {
      if (value === "true") {
        result[key] = true;
      } else if (value === "false") {
        result[key] = false;
      } else if (!Number.isNaN(Number(value)) && value.trim() !== "") {
        result[key] = Number(value);
      } else {
        result[key] = value;
      }
    }
    return result;
  }

  buildStoryPath(stories, groupIndex, storyName) {
    const group = stories[groupIndex];
    if (!group) return "/";
    const componentSlug = this.slugify(group.meta.title);
    const storySlug = this.slugify(storyName);
    return `/components/${componentSlug}/${storySlug}`;
  }

  buildStoryURL(stories, groupIndex, storyName, args = {}) {
    const path = this.buildStoryPath(stories, groupIndex, storyName);
    const params = new URLSearchParams();

    Object.entries(args).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.set(key, String(value));
      }
    });

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
}

// Create and export singleton instance
const urlManager = new URLManager();

// Export methods bound to the singleton instance
export const slugify = (text) => urlManager.slugify(text);
export const getDefaultStory = (stories) => urlManager.getDefaultStory(stories);
export const findStoryBySlugs = (stories, componentSlug, storySlug) =>
  urlManager.findStoryBySlugs(stories, componentSlug, storySlug);
export const parseArgsFromSearch = (searchParams) => urlManager.parseArgs(searchParams);
export const buildStoryPath = (stories, groupIndex, storyName) =>
  urlManager.buildStoryPath(stories, groupIndex, storyName);
export const buildStoryURL = (stories, groupIndex, storyName, args) =>
  urlManager.buildStoryURL(stories, groupIndex, storyName, args);
export const buildDocsPath = (section, slug) => urlManager.buildDocsPath(section, slug);
export const buildTokensPath = (tokenId) => urlManager.buildTokensPath(tokenId);
export const buildIconsPath = (iconId) => urlManager.buildIconsPath(iconId);
