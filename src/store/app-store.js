import { STORIES_KEY, THEME_STORAGE_KEY } from "@config";
import { buildStoryURL } from "@utils";
import {
  HOMEPAGE_HERO_CONTENT,
  HOMEPAGE_HIGHLIGHT_CARDS,
  HOMEPAGE_SPOTLIGHTS,
} from "../config/homepage-content.js";
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
        (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"),
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
      this.state.currentArgs
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

  _findStoryEntryByGroupTitle(title) {
    if (!title) return null;
    const stories = this.getStories();
    for (let i = 0; i < stories.length; i++) {
      if (stories[i]?.meta?.title === title) {
        const storyNames = Object.keys(stories[i].stories || {});
        return { groupIndex: i, storyName: storyNames[0] };
      }
    }
    return null;
  }

  _buildComponentHref(groupTitle) {
    const entry = this._findStoryEntryByGroupTitle(groupTitle);
    if (!entry) return null;
    const { groupIndex, storyName } = entry;
    return buildStoryURL(
      this.state.stories,
      groupIndex,
      storyName,
      this.state.stories[groupIndex]?.meta?.args || {}
    );
  }

  getRecentComponents(limit = 6) {
    const components = this.state.metadata.components || [];
    const sorted = [...components].sort((a, b) => {
      const aDate = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const bDate = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return bDate - aDate;
    });
    const slice = sorted.slice(0, limit);
    return slice.map((meta) => ({
      ...meta,
      updatedAt: meta.updatedAt || meta.createdAt,
      href: this._buildComponentHref(meta.storyGroup),
    }));
  }

  getTaxonomyGroups() {
    const components = this.state.metadata.components || [];
    const counts = new Map();
    components.forEach((meta) => {
      const group = meta.taxonomy?.group || "General";
      counts.set(group, (counts.get(group) || 0) + 1);
    });
    return [...counts.entries()]
      .map(([group, count]) => ({ id: group, label: group, count }))
      .sort((a, b) => b.count - a.count);
  }

  getHeroContent() {
    const componentsCount = this.state.metadata.components?.length || 0;
    const docsCount = this.state.metadata.docs?.length || 0;
    const tokensCount = this.state.metadata.tokens?.length || 0;
    return {
      ...HOMEPAGE_HERO_CONTENT,
      stats: [
        { label: "Components", value: componentsCount },
        { label: "Docs", value: docsCount },
        { label: "Tokens", value: tokensCount },
      ],
    };
  }

  getHighlightCards() {
    return HOMEPAGE_HIGHLIGHT_CARDS;
  }

  getSearchSpotlights() {
    return HOMEPAGE_SPOTLIGHTS;
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
export const getHomepageHeroContent = () => store.getHeroContent();
export const getHomepageHighlightCards = () => store.getHighlightCards();
export const getHomepageRecentComponents = (limit) => store.getRecentComponents(limit);
export const getHomepageTaxonomyGroups = () => store.getTaxonomyGroups();
export const getHomepageSearchSpotlights = () => store.getSearchSpotlights();
