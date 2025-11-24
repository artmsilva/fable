import { css, html, LitElement } from "lit";
import { STORIES_KEY } from "./config.js";
import {
  setStories,
  selectStory,
  getStories,
  getSelectedStory,
  getCurrentArgs,
  setTheme,
} from "./store/app-store.js";
import {
  parseStoryFromURL,
  getDefaultStory,
  updateURL,
} from "./utils/url-manager.js";
import { processStories } from "./utils/story-processor.js";

// Import all component library components
import "./components/button.js";
import "./components/card.js";
import "./components/input.js";
import "./components/link.js";
import "./components/select.js";
import "./components/checkbox.js";
import "./components/textarea.js";
import "./components/badge.js";
import "./components/icon-button.js";
import "./components/nav-group.js";
import "./components/sidebar.js";
import "./components/stack.js";
import "./components/header.js";
import "./components/preview.js";
import "./components/drawer.js";

// Import new composed components
import "./components/fable-story-navigator.js";
import "./components/fable-story-preview.js";
import "./components/fable-controls-panel.js";
import "./components/fable-theme-toggle.js";
import "./components/fable-source-drawer.js";

/**
 * Main Fable App - Orchestrates the composed components
 * Uses custom events to listen to store changes
 */
class FableApp extends LitElement {
  static styles = css`
    :host {
      display: contents;
    }
    main {
      display: grid;
      grid-template-columns: 300px 1fr 300px;
      height: 100vh;
      gap: 0;
    }
    main > fable-story-preview {
      border-right: 1px solid var(--border-color);
    }
  `;

  constructor() {
    super();
    this._initializeApp();
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("popstate", this._handlePopState.bind(this));
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("popstate", this._handlePopState.bind(this));
  }

  _initializeApp() {
    // Load and process stories
    const rawStories = window[STORIES_KEY] || [];
    const processed = processStories(rawStories);
    setStories(processed);

    // Initialize theme
    setTheme(
      getStories().length > 0 ? getCurrentArgs().theme || "light" : "light"
    );

    // Initialize from URL or set default
    this._initializeFromURL();
  }

  _initializeFromURL() {
    const storiesData = getStories();

    if (!storiesData.length) {
      return;
    }

    // Try to parse story from URL
    const urlStory = parseStoryFromURL(storiesData);

    if (urlStory) {
      // Found story in URL - select it (this will update currentArgs)
      selectStory(urlStory.groupIndex, urlStory.name);

      // TODO: Override args from URL if needed
      // For now, selectStory handles this

      // Update URL without pushing to history (we're already here)
      updateURL(storiesData, getSelectedStory(), getCurrentArgs(), false);
    } else {
      // No valid story in URL - set default
      const defaultStory = getDefaultStory(storiesData);
      if (defaultStory) {
        selectStory(defaultStory.groupIndex, defaultStory.name);
        updateURL(storiesData, getSelectedStory(), getCurrentArgs(), false);
      }
    }
  }

  _handlePopState(_event) {
    // Re-initialize from URL when browser back/forward is used
    this._initializeFromURL();
  }

  render() {
    return html`
      <main>
        <fable-story-navigator></fable-story-navigator>
        <fable-story-preview></fable-story-preview>
        <fable-controls-panel></fable-controls-panel>
        <fable-theme-toggle></fable-theme-toggle>
        <fable-source-drawer></fable-source-drawer>
      </main>
    `;
  }
}

customElements.define("fable-app", FableApp);

// Initialize app
const root = document.getElementById("root");
if (root) root.innerHTML = "<fable-app></fable-app>";
