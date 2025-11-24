import { STORIES_KEY, THEME_STORAGE_KEY } from "../config.js";
import { updateURL } from "../utils/url-manager.js";

/**
 * Central application state using custom events
 * Components listen for 'state-changed' events on window
 */

// Event target for state changes
const stateEvents = window;

// State object
const state = {
  stories: window[STORIES_KEY] || [],
  selectedStory: null, // { groupIndex, name }
  currentArgs: {},
  currentSlots: {},
  lockedArgs: {},
  sourceDrawerOpen: false,
  theme:
    localStorage.getItem(THEME_STORAGE_KEY) ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"),
};

// Dispatch state change event
function notifyStateChange(key) {
  stateEvents.dispatchEvent(
    new CustomEvent("state-changed", {
      detail: { key, value: state[key] },
    })
  );
}

/**
 * Getters - Access state
 */
export function getStories() {
  return state.stories;
}

export function getSelectedStory() {
  return state.selectedStory;
}

export function getCurrentArgs() {
  return state.currentArgs;
}

export function getCurrentSlots() {
  return state.currentSlots;
}

export function getLockedArgs() {
  return state.lockedArgs;
}

export function getSourceDrawerOpen() {
  return state.sourceDrawerOpen;
}

export function getTheme() {
  return state.theme;
}

/**
 * Actions - Functions that modify state and notify listeners
 */

export function setStories(newStories) {
  state.stories = newStories;
  notifyStateChange("stories");
}

export function selectStory(groupIndex, name) {
  const story = state.stories[groupIndex];
  if (!story) return;

  state.selectedStory = { groupIndex, name };

  const storyData = story.stories[name];
  const baseArgs = { ...(story.meta?.args || {}) };

  // If story is an object with args function, compute the args
  if (typeof storyData === "object" && storyData.args) {
    state.currentArgs = storyData.args(baseArgs);
  } else {
    state.currentArgs = baseArgs;
  }

  state.currentSlots = { ...(story.meta?.slots || {}) };

  // Merge meta-level and story-level locked args
  state.lockedArgs = {
    ...(story.meta?.lockedArgs || {}),
    ...(typeof storyData === "object" ? storyData.lockedArgs || {} : {}),
  };

  // Notify all state changes
  notifyStateChange("selectedStory");
  notifyStateChange("currentArgs");
  notifyStateChange("currentSlots");
  notifyStateChange("lockedArgs");

  // Trigger URL update
  _syncURL();
}

export function updateArg(key, value) {
  state.currentArgs = { ...state.currentArgs, [key]: value };
  notifyStateChange("currentArgs");
  _syncURL();
}

function _syncURL() {
  updateURL(state.stories, state.selectedStory, state.currentArgs, true);
}

export function updateSlot(key, value) {
  state.currentSlots = { ...state.currentSlots, [key]: value };
  notifyStateChange("currentSlots");
}

export function unlockArg(key) {
  state.lockedArgs = { ...state.lockedArgs, [key]: false };
  notifyStateChange("lockedArgs");
}

export function toggleSourceDrawer() {
  state.sourceDrawerOpen = !state.sourceDrawerOpen;
  notifyStateChange("sourceDrawerOpen");
}

export function setTheme(newTheme) {
  state.theme = newTheme;
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  notifyStateChange("theme");
}

export function toggleTheme() {
  setTheme(state.theme === "dark" ? "light" : "dark");
}

/**
 * Computed values - Derived from state
 */

export function getCurrentStory() {
  if (!state.selectedStory) return null;
  return state.stories[state.selectedStory.groupIndex];
}

export function getProcessedSlots() {
  if (!state.selectedStory) return {};

  const story = getCurrentStory();
  const slotDefs = story?.meta?.slots || {};
  const processed = {};

  for (const key in slotDefs) {
    processed[key] = state.currentSlots[key] ?? slotDefs[key];
  }

  return processed;
}
