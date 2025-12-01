import { AUTO_RECIPES_STORY_NAME, AUTO_RECIPES_STORY_TYPE } from "../config/recipes.js";
import { slugify } from "./url-manager.js";

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
    this.MAX_AXES = 4;
    this.MAX_CASES = 48;
    this.SIGNAL_WEIGHTS = {
      enum: 1,
      argType: 0.7,
      story: 0.4,
      boolean: 0.3,
      hint: 0.9,
      default: 0.2,
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

  toTitleCase(str = "") {
    return str
      .split(/[-_\s]+/g)
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  processStories(stories) {
    stories.forEach((story) => {
      if (story.meta?.component) {
        const componentClass = customElements.get(story.meta.component);
        const defaultArgs = this.getDefaultArgs(story.meta.component);
        story.meta.args = { ...defaultArgs, ...story.meta.args };

        if (!story.meta.title) {
          story.meta.title = this.toTitleCase(story.meta.component);
        }

        if (!story.meta.status && componentClass?.status) {
          story.meta.status = componentClass.status;
        }
      }

      const blueprint = this._analyzeRecipes(story);
      if (blueprint) {
        story.meta.recipeBlueprint = blueprint;
        story.meta.hasAutoRecipes = blueprint.axes.length > 0;
        if (blueprint.cases.length) {
          this._ensureRecipesStory(story);
        }
      }
    });

    return stories;
  }

  _analyzeRecipes(group) {
    const meta = group?.meta || {};
    const componentName = meta.component;
    const componentClass = componentName ? customElements.get(componentName) : null;
    const hints = componentClass?.recipeHints || {};
    const skipSet = new Set((hints.skip || []).map((name) => String(name)));

    const baseArgs = { ...(meta.args || {}) };
    const lockedArgs = { ...(meta.lockedArgs || {}) };
    const axisMap = new Map();

    const ensureAxis = (id, type = "enum") => {
      if (!id || skipSet.has(id)) return null;
      if (!axisMap.has(id)) {
        axisMap.set(id, {
          id,
          label: this.toTitleCase(id),
          type,
          values: new Map(),
        });
      }
      const axis = axisMap.get(id);
      if (type === "boolean" && axis.type !== "enum") {
        axis.type = "boolean";
      }
      return axis;
    };

    const addAxisValue = (axis, value, config = {}) => {
      if (!axis) return;
      const { args = { [axis.id]: value }, source = "enum", weight = 0.5 } = config;
      const key = this._valueKey(value, args);
      const entry = axis.values.get(key) || {
        id: slugify(`${axis.id}-${key}`),
        value,
        label: config.label || this._formatValueLabel(value),
        args: {},
        confidence: 0,
        sources: new Set(),
      };
      entry.args = { ...entry.args, ...args };
      entry.sources.add(source);
      entry.confidence = Math.min(1, entry.confidence + weight);
      if (config.label) {
        entry.label = config.label;
      }
      axis.values.set(key, entry);
    };

    // Component enums / booleans
    if (componentClass?.properties) {
      Object.entries(componentClass.properties).forEach(([key, prop]) => {
        if (skipSet.has(key)) return;
        if (Array.isArray(prop.enum) && prop.enum.length) {
          const axis = ensureAxis(key, "enum");
          prop.enum.forEach((value) => {
            addAxisValue(axis, value, {
              source: "component enum",
              weight: this.SIGNAL_WEIGHTS.enum,
            });
          });
        } else if (prop.type === Boolean && lockedArgs[key] !== true && !skipSet.has(key)) {
          const axis = ensureAxis(key, "boolean");
          [true, false].forEach((boolVal) => {
            addAxisValue(axis, boolVal, {
              source: "boolean",
              weight: this.SIGNAL_WEIGHTS.boolean,
            });
          });
        }
      });
    }

    // Meta argTypes options
    if (meta.argTypes) {
      Object.entries(meta.argTypes).forEach(([key, argType]) => {
        if (!Array.isArray(argType?.options) || skipSet.has(key)) return;
        const axis = ensureAxis(key, "enum");
        argType.options.forEach((value) => {
          addAxisValue(axis, value, {
            source: "argTypes",
            weight: this.SIGNAL_WEIGHTS.argType,
          });
        });
      });
    }

    // Story-provided args variants
    const stories = group?.stories || {};
    const baseStoryArgs = { ...(meta.args || {}) };
    Object.values(stories).forEach((storyDef) => {
      if (typeof storyDef === "object" && typeof storyDef.args === "function") {
        try {
          const resolved = storyDef.args(baseStoryArgs);
          Object.entries(resolved || {}).forEach(([key, value]) => {
            if (skipSet.has(key) || value === undefined) return;
            if (typeof value === "object") return;
            const axis = ensureAxis(key, "derived");
            addAxisValue(axis, value, {
              source: "story args",
              weight: this.SIGNAL_WEIGHTS.story,
            });
          });
        } catch {
          // Ignore individual story errors to keep rest of analyzer running
        }
      }
    });

    // Hints include
    if (hints.include) {
      Object.entries(hints.include).forEach(([key, list]) => {
        if (!Array.isArray(list)) return;
        const axis = ensureAxis(key, "hint");
        list.forEach((item) => {
          if (typeof item === "object" && item !== null) {
            addAxisValue(axis, item.value ?? item.id ?? item.label, {
              label: item.label,
              args: item.args || { [key]: item.value ?? item.id },
              source: "hint",
              weight: this.SIGNAL_WEIGHTS.hint,
            });
          } else {
            addAxisValue(axis, item, {
              source: "hint",
              weight: this.SIGNAL_WEIGHTS.hint,
            });
          }
        });
      });
    }

    // Seed default/base args into existing axes
    Object.entries(baseArgs).forEach(([key, value]) => {
      if (!axisMap.has(key) || value === undefined) return;
      addAxisValue(axisMap.get(key), value, {
        source: "default",
        weight: this.SIGNAL_WEIGHTS.default,
      });
    });

    let axes = [...axisMap.values()]
      .map((axis) => this._finalizeAxis(axis))
      .filter((axis) => axis.values.length > 1);

    const blueprint = {
      storyId: meta.id || slugify(meta.title || meta.component || `story-${Date.now()}`),
      axes,
      baseArgs,
      lockedArgs,
      budget: {
        maxAxes: this.MAX_AXES,
        maxCases: this.MAX_CASES,
        estimatedCases: axes.reduce((acc, axis) => acc * axis.values.length, 1),
        dropped: [],
      },
      warnings: [],
      cases: [],
    };

    if (!axes.length) {
      blueprint.warnings.push("No suitable args detected for auto recipes.");
      return blueprint;
    }

    // Trim axes if needed
    if (axes.length > this.MAX_AXES) {
      axes = axes.sort((a, b) => b.totalConfidence - a.totalConfidence).slice(0, this.MAX_AXES);
      blueprint.budget.dropped.push("Axis count trimmed to stay within budget.");
      blueprint.axes = axes;
    }

    let estimatedCases = axes.reduce((acc, axis) => acc * axis.values.length, 1);
    while (estimatedCases > this.MAX_CASES && axes.length > 1) {
      const weakest = axes.reduce(
        (lowest, axis) => (axis.totalConfidence < lowest.totalConfidence ? axis : lowest),
        axes[0]
      );
      axes = axes.filter((axis) => axis !== weakest);
      blueprint.budget.dropped.push(`Dropped axis "${weakest.label}" to keep grid performant.`);
      estimatedCases = axes.reduce((acc, axis) => acc * axis.values.length, 1);
    }

    blueprint.axes = axes;
    blueprint.budget.estimatedCases = estimatedCases;
    blueprint.cases = this._buildRecipeCases(axes, baseArgs);

    if (!blueprint.cases.length) {
      blueprint.warnings.push("No valid recipe cases generated.");
    }

    return blueprint;
  }

  _buildRecipeCases(axes, baseArgs) {
    if (!axes.length) return [];
    const cases = [];
    const traverse = (axisIndex, selection, argsAcc, confidenceSum) => {
      if (cases.length >= this.MAX_CASES) {
        return;
      }
      if (axisIndex >= axes.length) {
        const label = axes
          .map((axis) => {
            const valueId = selection[axis.id];
            const match = axis.values.find((val) => val.id === valueId);
            return match ? `${axis.label}: ${match.label}` : "";
          })
          .filter(Boolean)
          .join(" • ");
        const avgConfidence = confidenceSum / axes.length;
        cases.push({
          id: slugify(
            Object.entries(selection)
              .map(([axisId, valueId]) => `${axisId}-${valueId}`)
              .join("-")
          ),
          selection: { ...selection },
          args: { ...argsAcc },
          label,
          confidence: Number(avgConfidence.toFixed(2)),
        });
        return;
      }

      const axis = axes[axisIndex];
      axis.values.forEach((value) => {
        traverse(
          axisIndex + 1,
          { ...selection, [axis.id]: value.id },
          { ...argsAcc, ...value.args },
          confidenceSum + value.confidence
        );
      });
    };

    traverse(0, {}, { ...baseArgs }, 0);
    return cases;
  }

  _valueKey(value, args) {
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      return String(value);
    }
    return JSON.stringify(args || value);
  }

  _formatValueLabel(value) {
    if (typeof value === "boolean") {
      return value ? "True" : "False";
    }
    if (typeof value === "number") {
      return String(value);
    }
    if (typeof value === "string") {
      return this.toTitleCase(value);
    }
    return "Variant";
  }

  _finalizeAxis(axis) {
    const values = [...axis.values.values()].map((entry) => ({
      id: entry.id,
      value: entry.value,
      label: entry.label,
      args: entry.args,
      sources: Array.from(entry.sources),
      confidence: Number(entry.confidence.toFixed(2)),
    }));
    const totalConfidence =
      values.reduce((sum, value) => sum + value.confidence, 0) / (values.length || 1);
    return {
      id: axis.id,
      label: axis.label,
      type: axis.type,
      values,
      totalConfidence,
    };
  }

  _ensureRecipesStory(group) {
    if (!group?.stories || group.stories[AUTO_RECIPES_STORY_NAME]) {
      return;
    }
    group.stories[AUTO_RECIPES_STORY_NAME] = {
      type: AUTO_RECIPES_STORY_TYPE,
      title: AUTO_RECIPES_STORY_NAME,
      auto: true,
    };
  }

  getStorySource(story, storyName) {
    if (!story || !storyName) return "";

    const storyData = story.stories?.[storyName];
    if (!storyData) return "";

    if (storyData.type === "docs" || story.meta?.type === "docs") {
      return typeof storyData.content === "string"
        ? storyData.content
        : story.meta?.content || "Docs story — no render function.";
    }

    const storyFn =
      typeof storyData === "function"
        ? storyData
        : typeof storyData?.render === "function"
          ? storyData.render
          : null;

    if (!storyFn) return "";

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
