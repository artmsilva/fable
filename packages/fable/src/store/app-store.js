import { THEME_STORAGE_KEY } from "../config.js";
import { buildStoryURL } from "../utils/url-manager.js";
import { AUTO_RECIPES_STORY_TYPE } from "../config/recipes.js";
import { navigateTo } from "../router.js";

/**
 * Central application state store using custom events
 * Components listen for 'state-changed' events on window
 */
class AppStore {
  constructor() {
    this.stateEvents = window;
    this.state = {
      stories: [],
      selectedStory: null, // { groupIndex, name }
      currentArgs: {},
      currentSlots: {},
      lockedArgs: {},
      view: { name: "home", params: {} },
      theme:
        localStorage.getItem(THEME_STORAGE_KEY) ||
        (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"),
      selectedRecipe: null,
      recipeSelections: {},
    };
  }

  // Dispatch state change event
  notifyStateChange(key) {
    this.stateEvents.dispatchEvent(
      new CustomEvent("state-changed", {
        detail: { key, value: this.state[key] },
      })
    );
  }

  /**
   * Getters - Access state
   */
  getStories() {
    return this.state.stories;
  }

  getSelectedStory() {
    return this.state.selectedStory;
  }

  getCurrentArgs() {
    return this.state.currentArgs;
  }

  getCurrentSlots() {
    return this.state.currentSlots;
  }

  getLockedArgs() {
    return this.state.lockedArgs;
  }

  getTheme() {
    return this.state.theme;
  }

  getView() {
    return this.state.view;
  }

  /**
   * Actions - Methods that modify state and notify listeners
   */
  setStories(newStories) {
    this.state.stories = newStories;
    this.state.recipeSelections = {};
    this.state.selectedRecipe = null;
    this.notifyStateChange("stories");
    this.notifyStateChange("selectedRecipe");
  }

  selectStory(groupIndex, name, options = {}) {
    const { argsOverride, slotsOverride, syncURL = true, recipeSelection = null } = options;
    const story = this.state.stories[groupIndex];
    if (!story) return;

    this.state.selectedStory = { groupIndex, name };

    const storyData = story.stories[name];
    const isAutoRecipesStory = storyData?.type === AUTO_RECIPES_STORY_TYPE;
    const baseArgs = { ...(story.meta?.args || {}) };
    const storyKey = this._buildStoryKey(groupIndex, name);
    const blueprint = this._getRecipeBlueprint(groupIndex);

    // If story is an object with args function, compute the args
    if (typeof storyData === "object" && storyData.args) {
      this.state.currentArgs = storyData.args(baseArgs);
    } else {
      this.state.currentArgs = baseArgs;
    }

    if (argsOverride) {
      this.state.currentArgs = { ...this.state.currentArgs, ...argsOverride };
    }

    const normalizedPerm = isAutoRecipesStory
      ? null
      : this._normalizeRecipeSelection(blueprint, recipeSelection) ||
        this.state.recipeSelections[storyKey] ||
        null;
    if (normalizedPerm && blueprint) {
      const recipeArgs = this._getRecipeArgs(blueprint, normalizedPerm);
      this.state.currentArgs = { ...this.state.currentArgs, ...recipeArgs };
      this.state.recipeSelections[storyKey] = normalizedPerm;
      this.state.selectedRecipe = normalizedPerm;
    } else {
      this.state.selectedRecipe = null;
    }

    this.state.currentSlots = { ...(story.meta?.slots || {}) };
    if (slotsOverride) {
      this.state.currentSlots = {
        ...this.state.currentSlots,
        ...slotsOverride,
      };
    }

    // Merge meta-level and story-level locked args
    this.state.lockedArgs = {
      ...(story.meta?.lockedArgs || {}),
      ...(typeof storyData === "object" ? storyData.lockedArgs || {} : {}),
    };

    // Notify all state changes
    this.notifyStateChange("selectedStory");
    this.notifyStateChange("currentArgs");
    this.notifyStateChange("currentSlots");
    this.notifyStateChange("lockedArgs");
    this.notifyStateChange("selectedRecipe");

    if (syncURL) {
      this._syncURL();
    }
  }

  updateArg(key, value) {
    this.state.currentArgs = { ...this.state.currentArgs, [key]: value };
    this._clearRecipeSelection();
    this.notifyStateChange("currentArgs");
    this._syncURL();
  }

  _syncURL(replace = false) {
    if (!this.state.selectedStory) return;
    const url = buildStoryURL(
      this.state.stories,
      this.state.selectedStory.groupIndex,
      this.state.selectedStory.name,
      this.state.currentArgs,
      { recipe: this.state.selectedRecipe }
    );
    navigateTo(url, { replace });
  }

  unlockArg(key) {
    this.state.lockedArgs = { ...this.state.lockedArgs, [key]: false };
    this.notifyStateChange("lockedArgs");
  }

  setView(view) {
    this.state.view = view;
    this.notifyStateChange("view");
  }

  setTheme(newTheme) {
    this.state.theme = newTheme;
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    this.notifyStateChange("theme");
  }

  toggleTheme() {
    this.setTheme(this.state.theme === "dark" ? "light" : "dark");
  }

  /**
   * Computed values - Derived from state
   */
  getCurrentStory() {
    if (!this.state.selectedStory) return null;
    return this.state.stories[this.state.selectedStory.groupIndex];
  }

  getProcessedSlots() {
    if (!this.state.selectedStory) return {};

    const story = this.getCurrentStory();
    const slotDefs = story?.meta?.slots || {};
    const processed = {};

    for (const key in slotDefs) {
      processed[key] = this.state.currentSlots[key] ?? slotDefs[key];
    }

    return processed;
  }

  _getRecipeBlueprint(groupIndex) {
    const group = this.state.stories[groupIndex];
    return group?.meta?.recipeBlueprint || null;
  }

  _buildStoryKey(groupIndex, storyName) {
    return `${groupIndex}:${storyName}`;
  }

  _buildStoryKeyFromSelected() {
    if (!this.state.selectedStory) return null;
    return this._buildStoryKey(this.state.selectedStory.groupIndex, this.state.selectedStory.name);
  }

  _normalizeRecipeSelection(blueprint, selection) {
    if (!blueprint || !selection) return null;
    const normalized = {};
    let matched = 0;
    const entries = Array.isArray(selection) ? selection : Object.entries(selection);
    blueprint.axes.forEach((axis) => {
      const found = entries.find(([axisId]) => axisId === axis.id || axisId === axis.label);
      if (!found) return;
      const [, valueId] = found;
      const match = axis.values.find(
        (candidate) =>
          candidate.id === valueId ||
          candidate.value === valueId ||
          String(candidate.value) === String(valueId)
      );
      if (match) {
        normalized[axis.id] = match.id;
        matched += 1;
      }
    });
    return matched ? normalized : null;
  }

  _getRecipeArgs(blueprint, selection) {
    const args = {};
    if (!blueprint || !selection) return args;
    blueprint.axes.forEach((axis) => {
      const valueId = selection[axis.id];
      const match = axis.values.find((value) => value.id === valueId);
      if (match?.args) {
        Object.assign(args, match.args);
      }
    });
    return args;
  }

  _clearRecipeSelection() {
    const storyKey = this._buildStoryKeyFromSelected();
    if (storyKey) {
      delete this.state.recipeSelections[storyKey];
    }
    if (this.state.selectedRecipe) {
      this.state.selectedRecipe = null;
      this.notifyStateChange("selectedRecipe");
    }
  }

  getSelectedRecipe() {
    return this.state.selectedRecipe;
  }

  getCurrentRecipeBlueprint() {
    if (!this.state.selectedStory) return null;
    return this._getRecipeBlueprint(this.state.selectedStory.groupIndex);
  }

  selectRecipe(selection, options = {}) {
    if (!this.state.selectedStory) return;
    const { syncURL = true } = options;
    const blueprint = this._getRecipeBlueprint(this.state.selectedStory.groupIndex);
    if (!blueprint) return;
    const normalized = this._normalizeRecipeSelection(blueprint, selection);
    if (!normalized) return;
    const storyKey = this._buildStoryKeyFromSelected();
    if (storyKey) {
      this.state.recipeSelections[storyKey] = normalized;
    }
    this.state.selectedRecipe = normalized;
    const recipeArgs = this._getRecipeArgs(blueprint, normalized);
    this.state.currentArgs = { ...this.state.currentArgs, ...recipeArgs };
    this.notifyStateChange("selectedRecipe");
    this.notifyStateChange("currentArgs");
    if (syncURL) {
      this._syncURL();
    }
  }
}

// Create and export singleton instance
const store = new AppStore();

// Export methods bound to the singleton instance
export const getStories = () => store.getStories();
export const getSelectedStory = () => store.getSelectedStory();
export const getCurrentArgs = () => store.getCurrentArgs();
export const getCurrentSlots = () => store.getCurrentSlots();
export const getLockedArgs = () => store.getLockedArgs();
export const getTheme = () => store.getTheme();
export const getSelectedRecipe = () => store.getSelectedRecipe();
export const getCurrentRecipeBlueprint = () => store.getCurrentRecipeBlueprint();
export const setStories = (newStories) => store.setStories(newStories);
export const selectStory = (groupIndex, name, options) =>
  store.selectStory(groupIndex, name, options);
export const updateArg = (key, value) => store.updateArg(key, value);

export const unlockArg = (key) => store.unlockArg(key);
export const setTheme = (newTheme) => store.setTheme(newTheme);
export const toggleTheme = () => store.toggleTheme();
export const getProcessedSlots = () => store.getProcessedSlots();
export const getView = () => store.getView();
export const setView = (view) => store.setView(view);
