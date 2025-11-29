import { css, html, LitElement } from "lit";

if (typeof window !== "undefined") {
  const base = (import.meta?.env?.BASE_URL ?? "/").replace(/\/$/, "") || "/";
  if (!window.__FABLE_BASE_PATH__) {
    window.__FABLE_BASE_PATH__ = base;
  }
}
import "./utils/custom-element-hmr.js";
import { STORIES_KEY } from "./config.js";
import { initRouter, navigateTo, subscribeToRouter } from "./router.js";
import {
  getCurrentArgs,
  getDocsMetadata,
  getIconMetadata,
  getStories,
  getTokenMetadata,
  getView,
  selectStory,
  setStories,
  setTheme,
  setView,
} from "./store/app-store.js";
import { processStories } from "./utils/story-processor.js";
import {
  buildDocsPath,
  buildIconsPath,
  buildTokensPath,
  findStoryBySlugs,
  parseStorySearchParams,
} from "./utils/url-manager.js";

// Import all design system components via barrel file
import "@design-system";

// Import new composed components
import "./components/fable-story-navigator.js";
import "./components/fable-story-preview.js";
import "./components/fable-controls-panel.js";
import "./components/fable-source-drawer.js";
import "./components/fable-docs-view.js";
import "./components/fable-tokens-view.js";
import "./components/fable-icons-view.js";
import "./components/fable-home-view.js";
import "./components/fable-playroom-view.js";
import "./components/fable-playroom-preview.js";
import "./components/fable-playroom-editor.js";
import "./components/fable-playroom-palette.js";

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
    if (event.detail.key === "view") {
      this._currentView = getView();
    }
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

    switch (route.name) {
      case "component": {
        const match = findStoryBySlugs(storiesData, route.params.group, route.params.story);
        if (match) {
          const { args, permutation } = parseStorySearchParams(route.searchParams);
          selectStory(match.groupIndex, match.name, {
            argsOverride: args,
            permutationSelection: permutation,
            syncURL: false,
          });
          setView({ name: "component", params: route.params });
        } else {
          navigateTo("/", { replace: true });
          setView({ name: "home", params: {} });
        }
        break;
      }
      case "docs": {
        const docs = getDocsMetadata();
        if (!docs.length) {
          setView({ name: "docs", params: {} });
          break;
        }
        let doc = docs.find(
          (entry) => entry.section === route.params.section && entry.slug === route.params.slug
        );
        if (!doc) {
          doc = docs.find((entry) => entry.section === route.params.section) || docs[0];
          navigateTo(buildDocsPath(doc.section, doc.slug), { replace: true });
        }
        setView({
          name: "docs",
          params: { section: doc.section, slug: doc.slug, id: doc.id },
        });
        break;
      }
      case "tokens": {
        const tokens = getTokenMetadata();
        const token =
          tokens.find(
            (entry) =>
              entry.id === route.params.category || entry.category === route.params.category
          ) || tokens[0];
        if (token && route.params.category && token.id !== route.params.category) {
          navigateTo(buildTokensPath(token.id), { replace: true });
        }
        setView({ name: "tokens", params: { category: token?.id } });
        break;
      }
      case "icons": {
        const icons = getIconMetadata();
        const icon = icons.find((entry) => entry.id === route.params.iconId) || icons[0];
        if (icon && icon.id !== route.params.iconId) {
          navigateTo(buildIconsPath(icon.id), { replace: true });
        }
        setView({ name: "icons", params: { iconId: icon?.id } });
        break;
      }
      case "playroom":
        setView({ name: "playroom", params: {} });
        break;
      case "home":
        setView({ name: "home", params: {} });
        break;
      default:
        navigateTo("/", { replace: true });
        setView({ name: "home", params: {} });
        break;
    }
  }

  _renderActiveView() {
    switch (this._currentView?.name) {
      case "docs":
        return html`<fable-docs-view class="active"></fable-docs-view>`;
      case "tokens":
        return html`<fable-tokens-view class="active"></fable-tokens-view>`;
      case "icons":
        return html`<fable-icons-view class="active"></fable-icons-view>`;
      case "playroom":
        return html`<fable-playroom-view class="active"></fable-playroom-view>`;
      case "home":
        return html`<fable-home-view class="active"></fable-home-view>`;
      default:
        return html`<fable-story-preview class="active"></fable-story-preview>`;
    }
  }

  render() {
    return html`
      <main>
        <fable-story-navigator></fable-story-navigator>
        <div class="view-host">${this._renderActiveView()}</div>
        <fable-controls-panel></fable-controls-panel>
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
