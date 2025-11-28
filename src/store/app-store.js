import { STORIES_KEY, THEME_STORAGE_KEY } from "@config";
import { buildStoryURL } from "@utils";
import { getMetadataRegistry } from "../config/metadata-registry.js";
import { navigateTo } from "../router.js";

/**
 * Central application state store using custom events
 * Components listen for 'state-changed' events on window
 */
class AppStore {
  constructor() {
    this.stateEvents = window;
    this.state = {
      stories: window[STORIES_KEY] || [],
      metadata: getMetadataRegistry(),
      selectedStory: null, // { groupIndex, name }
      currentArgs: {},
      currentSlots: {},
      lockedArgs: {},
      sourceDrawerOpen: false,
      view: { name: "home", params: {} },
      theme:
        localStorage.getItem(THEME_STORAGE_KEY) ||
        (window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"),
    };
  }

  // Dispatch state change event
  notifyStateChange(key) {
    this.stateEvents.dispatchEvent(
      new CustomEvent("state-changed", {
        detail: { key, value: this.state[key] },
      }),
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

  getMetadata() {
    return this.state.metadata;
  }

  getComponentMetadata() {
    return this.state.metadata.components;
  }

  getDocsMetadata() {
    return this.state.metadata.docs;
  }

  getTokenMetadata() {
    return this.state.metadata.tokens;
  }

  getIconMetadata() {
    return this.state.metadata.icons;
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

  getSourceDrawerOpen() {
    return this.state.sourceDrawerOpen;
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
    this.notifyStateChange("stories");
  }

  selectStory(groupIndex, name, options = {}) {
    const { argsOverride, slotsOverride, syncURL = true } = options;
    const story = this.state.stories[groupIndex];
    if (!story) return;

    this.state.selectedStory = { groupIndex, name };

    const storyData = story.stories[name];
    const baseArgs = { ...(story.meta?.args || {}) };

    // If story is an object with args function, compute the args
    if (typeof storyData === "object" && storyData.args) {
      this.state.currentArgs = storyData.args(baseArgs);
    } else {
      this.state.currentArgs = baseArgs;
    }

    if (argsOverride) {
      this.state.currentArgs = { ...this.state.currentArgs, ...argsOverride };
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

    if (syncURL) {
      this._syncURL();
    }
  }

  updateArg(key, value) {
    this.state.currentArgs = { ...this.state.currentArgs, [key]: value };
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
    );
    navigateTo(url, { replace });
  }

  updateSlot(key, value) {
    this.state.currentSlots = { ...this.state.currentSlots, [key]: value };
    this.notifyStateChange("currentSlots");
  }

  unlockArg(key) {
    this.state.lockedArgs = { ...this.state.lockedArgs, [key]: false };
    this.notifyStateChange("lockedArgs");
  }

  toggleSourceDrawer() {
    this.state.sourceDrawerOpen = !this.state.sourceDrawerOpen;
    this.notifyStateChange("sourceDrawerOpen");
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
}

// Create and export singleton instance
const store = new AppStore();

// Export methods bound to the singleton instance
export const getStories = () => store.getStories();
export const getSelectedStory = () => store.getSelectedStory();
export const getMetadata = () => store.getMetadata();
export const getComponentMetadata = () => store.getComponentMetadata();
export const getDocsMetadata = () => store.getDocsMetadata();
export const getTokenMetadata = () => store.getTokenMetadata();
export const getIconMetadata = () => store.getIconMetadata();
export const getCurrentArgs = () => store.getCurrentArgs();
export const getCurrentSlots = () => store.getCurrentSlots();
export const getLockedArgs = () => store.getLockedArgs();
export const getSourceDrawerOpen = () => store.getSourceDrawerOpen();
export const getTheme = () => store.getTheme();
export const setStories = (newStories) => store.setStories(newStories);
export const selectStory = (groupIndex, name, options) =>
  store.selectStory(groupIndex, name, options);
export const updateArg = (key, value) => store.updateArg(key, value);
export const updateSlot = (key, value) => store.updateSlot(key, value);
export const unlockArg = (key) => store.unlockArg(key);
export const toggleSourceDrawer = () => store.toggleSourceDrawer();
export const setTheme = (newTheme) => store.setTheme(newTheme);
export const toggleTheme = () => store.toggleTheme();
export const getCurrentStory = () => store.getCurrentStory();
export const getProcessedSlots = () => store.getProcessedSlots();
export const getView = () => store.getView();
export const setView = (view) => store.setView(view);
