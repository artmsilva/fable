/**
 * URL and routing utilities
 */
class URLManager {
  slugify(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  parseStoryFromURL(stories) {
    const params = new URLSearchParams(window.location.search);
    const storyParam = params.get("story");

    if (!storyParam || !stories.length) {
      return null;
    }

    // Parse story param: "component-slug/story-slug"
    const [componentSlug, storySlug] = storyParam.split("/");

    if (!componentSlug || !storySlug) {
      return null;
    }

    // Find the matching story
    for (let gi = 0; gi < stories.length; gi++) {
      const group = stories[gi];
      const titleSlug = this.slugify(group.meta.title);

      if (titleSlug === componentSlug) {
        const storyNames = Object.keys(group.stories);
        for (const name of storyNames) {
          if (this.slugify(name) === storySlug) {
            // Parse args from URL
            const args = { ...(group.meta?.args || {}) };

            // Override with URL params (excluding 'story' param)
            params.forEach((value, key) => {
              if (key !== "story") {
                // Parse boolean values
                if (value === "true") {
                  args[key] = true;
                } else if (value === "false") {
                  args[key] = false;
                } else {
                  args[key] = value;
                }
              }
            });

            return { groupIndex: gi, name, args };
          }
        }
      }
    }

    return null;
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

  buildStoryURL(stories, groupIndex, storyName, args = {}) {
    const group = stories[groupIndex];
    if (!group) return "";

    const componentSlug = this.slugify(group.meta.title);
    const storySlug = this.slugify(storyName);

    // Build query string with story param and all args
    const params = new URLSearchParams();
    params.set("story", `${componentSlug}/${storySlug}`);

    Object.entries(args).forEach(([key, value]) => {
      params.set(key, String(value));
    });

    return `?${params.toString()}`;
  }

  updateURL(stories, selected, args, pushState = true) {
    if (!selected) return;

    const url = this.buildStoryURL(stories, selected.groupIndex, selected.name, args);

    const state = {
      groupIndex: selected.groupIndex,
      name: selected.name,
      args: args,
    };

    if (pushState) {
      window.history.pushState(state, "", url);
    } else {
      window.history.replaceState(state, "", url);
    }
  }
}

// Create and export singleton instance
const urlManager = new URLManager();

// Export methods bound to the singleton instance
export const slugify = (text) => urlManager.slugify(text);
export const parseStoryFromURL = (stories) => urlManager.parseStoryFromURL(stories);
export const getDefaultStory = (stories) => urlManager.getDefaultStory(stories);
export const buildStoryURL = (stories, groupIndex, storyName, args) =>
  urlManager.buildStoryURL(stories, groupIndex, storyName, args);
export const updateURL = (stories, selected, args, pushState) =>
  urlManager.updateURL(stories, selected, args, pushState);
