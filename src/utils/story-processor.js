/**
 * Story processing utilities
 */
class StoryProcessor {
  constructor() {
    this.statusTooltips = {
      alpha: "Early development - APIs may change",
      beta: "Testing phase - Ready for feedback",
      stable: "Production ready - Stable API",
      deprecated: "Being phased out - Use alternatives",
    };
  }

  getDefaultArgs(componentName) {
    const componentClass = customElements.get(componentName);
    if (!componentClass) return {};

    const instance = new componentClass();
    const props = componentClass.properties || {};
    const args = {};

    for (const key in props) {
      if (instance[key] !== undefined) {
        args[key] = instance[key];
      }
    }

    return args;
  }

  toTitleCase(str) {
    return str
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  processStories(stories) {
    // Auto-merge default args from component with meta args
    // Auto-generate title from component name if not provided
    // Auto-extract status from component class
    stories.forEach((story) => {
      if (story.meta?.component) {
        const componentClass = customElements.get(story.meta.component);
        const defaultArgs = this.getDefaultArgs(story.meta.component);
        story.meta.args = { ...defaultArgs, ...story.meta.args };

        // Auto-generate title from component name if not specified
        if (!story.meta.title) {
          story.meta.title = this.toTitleCase(story.meta.component);
        }

        // Auto-extract status from component class if not specified
        if (!story.meta.status && componentClass?.status) {
          story.meta.status = componentClass.status;
        }
      }
    });

    return stories;
  }

  getStorySource(story, storyName) {
    if (!story) return "";

    const storyData = story.stories[storyName];
    const storyFn = typeof storyData === "function" ? storyData : storyData.render;

    // Get the function source code
    const source = storyFn.toString();

    // Format it nicely - remove arrow function wrapper
    let formatted = source
      .replace(/^[^(]*\([^)]*\)\s*=>\s*/, "") // Remove arrow function signature
      .trim();

    // Remove outer braces if it's a block
    if (formatted.startsWith("{") && formatted.endsWith("}")) {
      formatted = formatted.slice(1, -1).trim();
    }

    return formatted;
  }

  getStatusTooltip(status) {
    return this.statusTooltips[status] || status;
  }
}

// Create and export singleton instance
const processor = new StoryProcessor();

// Export methods bound to the singleton instance
export const getDefaultArgs = (componentName) => processor.getDefaultArgs(componentName);
export const toTitleCase = (str) => processor.toTitleCase(str);
export const processStories = (stories) => processor.processStories(stories);
export const getStorySource = (story, storyName) => processor.getStorySource(story, storyName);
export const getStatusTooltip = (status) => processor.getStatusTooltip(status);
