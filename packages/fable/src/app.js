import { css, html, LitElement } from "lit";

if (typeof window !== "undefined") {
  // Set base path from Vite's BASE_URL (supports GitHub Pages deploys)
  const base = (import.meta?.env?.BASE_URL ?? "/").replace(/\/$/, "") || "/";
  if (!window.__FABLE_BASE_PATH__) {
    window.__FABLE_BASE_PATH__ = base;
  }

  // Restore deep-link path saved by 404.html (GitHub Pages SPA fallback)
  const redirectKey = "__FABLE_REDIRECT__";
  const saved = sessionStorage.getItem(redirectKey);
  if (saved) {
    sessionStorage.removeItem(redirectKey);
    const normalizedBase = base.endsWith("/") ? base : `${base}/`;
    const target = saved.startsWith(base)
      ? saved
      : `${normalizedBase}${saved.replace(/^\//, "")}`;
    const current = `${location.pathname}${location.search}${location.hash}`;
    if (target !== current) {
      history.replaceState({}, "", target);
    }
  }
}
import "./utils/custom-element-hmr.js";
import { getAll } from "./registry.js";
import { initRouter, navigateTo, subscribeToRouter } from "./router.js";
import {
  getStories,
  getTheme,
  getView,
  selectStory,
  setStories,
  setTheme,
  setView,
} from "./store/app-store.js";
import { processStories } from "./utils/story-processor.js";
import {
  buildStoryPath,
  findStoryBySlugs,
  getDefaultStory,
  parseStorySearchParams,
} from "./utils/url-manager.js";

// Import all design system components via barrel file
import "../ui/index.js";

// Import composed components
import "./components/fable-story-navigator.js";
import "./components/fable-story-preview.js";

/**
 * Main Fable App - Orchestrates the composed components
 * Uses custom events to listen to store changes
 */
class FableApp extends LitElement {
  static properties = {
    _currentView: { state: true },
  };

  static styles = css`
    :host {
      display: contents;
    }
    main {
      display: grid;
      grid-template-columns: 300px 1fr;
      height: 100vh;
      overflow: hidden;
      gap: var(--space-4);
      position: relative;
    }
    .view-host {
      position: relative;
      overflow-y: auto;
      height: 100vh;
    }
    .view-host::-webkit-scrollbar {
      width: 6px;
    }
    .view-host::-webkit-scrollbar-track {
      background: transparent;
    }
    .view-host::-webkit-scrollbar-thumb {
      background: var(--border-color);
      border-radius: 3px;
    }
    .view-host::-webkit-scrollbar-thumb:hover {
      background: var(--secondary-color);
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
    if (key === "selectedStory") {
      const host = this.shadowRoot?.querySelector(".view-host");
      if (host) host.scrollTop = 0;
    }
  }

  _initializeApp() {
    // Load and process stories from the registry, filtering builtins if configured
    const rawStories = __FABLE_SHOW_BUILTINS__
      ? getAll()
      : getAll().filter((s) => !s.meta?.builtin);
    const processed = processStories(rawStories);
    setStories(processed);

    // Apply the initial theme
    setTheme(getTheme());

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
      const match = findStoryBySlugs(storiesData, route.params.group);
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
      const path = buildStoryPath(storiesData, defaultStory.groupIndex, defaultStory.name);
      navigateTo(path, { replace: true });
      setView({ name: "component", params: {} });
    } else {
      setView({ name: "home", params: {} });
    }
  }

  _renderActiveView() {
    return html`<fable-story-preview class="active"></fable-story-preview>`;
  }

  render() {
    return html`
      <main>
        <fable-story-navigator></fable-story-navigator>
        <div class="view-host">${this._renderActiveView()}</div>
      </main>
    `;
  }
}

customElements.define("fable-app", FableApp);

// Initialize app after all module-level define() calls have run.
// Consumer components imported after "fable-workbench" in their entry
// file register during module evaluation, so we defer to a microtask.
queueMicrotask(() => {
  const root = document.getElementById("root");
  if (root) {
    root.textContent = "";
    root.appendChild(document.createElement("fable-app"));
  }
});

if (import.meta.hot) {
  const componentModules = Object.keys(import.meta.glob("./components/*.js"));
  if (componentModules.length) {
    import.meta.hot.accept(componentModules, () => null);
  }
}
