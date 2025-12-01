import { css, html, LitElement } from "lit";

if (typeof window !== "undefined") {
  const base = (import.meta?.env?.BASE_URL ?? "/").replace(/\/$/, "") || "/";
  if (!window.__FABLE_BASE_PATH__) {
    window.__FABLE_BASE_PATH__ = base;
  }
}
import "./utils/custom-element-hmr.js";
import { AUTO_RECIPES_STORY_TYPE } from "./config/recipes.js";
import { STORIES_KEY } from "./config.js";
import { initRouter, navigateTo, subscribeToRouter } from "./router.js";
import {
  getCurrentArgs,
  getSelectedStory,
  getStories,
  getView,
  selectStory,
  setStories,
  setTheme,
  setView,
} from "./store/app-store.js";
import { processStories } from "./utils/story-processor.js";
import { findStoryBySlugs, getDefaultStory, parseStorySearchParams } from "./utils/url-manager.js";

// Import all design system components via barrel file
import "@design-system";

// Import new composed components
import "./components/fable-story-navigator.js";
import "./components/fable-story-preview.js";
import "./components/fable-controls-panel.js";
import "./components/fable-source-drawer.js";
// Removed docs/tokens/icons/home views
// Playroom feature removed

/**
 * Main Fable App - Orchestrates the composed components
 * Uses custom events to listen to store changes
 */
class FableApp extends LitElement {
  static properties = {
    _currentView: { state: true },
    _isRecipeStory: { state: true },
  };

  static styles = css`
    :host {
      display: contents;
    }
    main {
      display: grid;
      grid-template-columns: 300px 1fr 300px;
      height: 100vh;
      overflow: hidden;
      gap: var(--space-4);
      position: relative;
    }
    .view-host {
      position: relative;
      border-right: 1px solid var(--border-color);
      overflow-y: auto;
      height: 100vh;
    }
    .view-host > :not(.active) {
      opacity: 0;
      pointer-events: none;
    }
    .view-host > .active {
      opacity: 1;
      pointer-events: auto;
    }
  `;

  constructor() {
    super();
    this._unsubscribeRouter = null;
    this._handleStoreChange = this._handleStoreChange.bind(this);
    this._currentView = getView();
    this._isRecipeStory = this._computeIsRecipeStory();
    this._initializeApp();
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("state-changed", this._handleStoreChange);
    this._currentView = getView();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._unsubscribeRouter) {
      this._unsubscribeRouter();
      this._unsubscribeRouter = null;
    }
    window.removeEventListener("state-changed", this._handleStoreChange);
  }

  _handleStoreChange(event) {
    const key = event.detail.key;
    if (key === "view") {
      this._currentView = getView();
    }
    if (key === "selectedStory" || key === "stories") {
      this._isRecipeStory = this._computeIsRecipeStory();
    }
  }

  _computeIsRecipeStory() {
    const selected = getSelectedStory();
    if (!selected) return false;
    const stories = getStories();
    const group = stories[selected.groupIndex];
    const story = group?.stories?.[selected.name];
    return story?.type === AUTO_RECIPES_STORY_TYPE;
  }

  _initializeApp() {
    // Load and process stories
    const rawStories = window[STORIES_KEY] || [];
    const processed = processStories(rawStories);
    setStories(processed);

    // Initialize theme
    setTheme(getStories().length > 0 ? getCurrentArgs().theme || "light" : "light");

    // Router setup
    this._setupRouter();
  }

  _setupRouter() {
    const initialRoute = initRouter();
    this._unsubscribeRouter = subscribeToRouter((route) => this._handleRouteChange(route), {
      immediate: false,
    });
    if (initialRoute) {
      this._handleRouteChange(initialRoute);
    }
  }

  _handleRouteChange(route) {
    const storiesData = getStories();
    if (!storiesData.length) return;

    if (route.name === "component") {
      const match = findStoryBySlugs(storiesData, route.params.group, route.params.story);
      if (match) {
        const { args, recipe } = parseStorySearchParams(route.searchParams);
        selectStory(match.groupIndex, match.name, {
          argsOverride: args,
          recipeSelection: recipe,
          syncURL: false,
        });
        setView({ name: "component", params: route.params });
        return;
      }
    }

    // fallback to first story
    const defaultStory = getDefaultStory(storiesData);
    if (defaultStory) {
      selectStory(defaultStory.groupIndex, defaultStory.name, { syncURL: false });
      const path = `/components/${defaultStory.groupIndex}/${defaultStory.name}`;
      navigateTo(path, { replace: true });
      setView({ name: "component", params: {} });
    } else {
      navigateTo("/", { replace: true });
    }
  }

  _renderActiveView() {
    return html`<fable-story-preview class="active"></fable-story-preview>`;
  }

  render() {
    const hideControls = this._currentView?.name === "component" && this._isRecipeStory === true;
    return html`
      <main>
        <fable-story-navigator></fable-story-navigator>
        <div class="view-host">${this._renderActiveView()}</div>
        ${hideControls ? "" : html`<fable-controls-panel></fable-controls-panel>`}
        <fable-source-drawer></fable-source-drawer>
      </main>
    `;
  }
}

customElements.define("fable-app", FableApp);

// Initialize app
const root = document.getElementById("root");
if (root) root.innerHTML = "<fable-app></fable-app>";

if (import.meta.hot) {
  const componentModules = Object.keys(import.meta.glob("./components/*.js"));
  if (componentModules.length) {
    import.meta.hot.accept(componentModules, () => null);
  }
}
