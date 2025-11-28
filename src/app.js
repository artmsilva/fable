import { css, html, LitElement } from "lit";
import { STORIES_KEY } from "./config.js";
import {
  getCurrentArgs,
  getDocsMetadata,
  getSelectedStory,
  getStories,
  selectStory,
  setStories,
  setTheme,
  setView,
  getTokenMetadata,
  getIconMetadata,
  getView,
} from "./store/app-store.js";
import { processStories } from "./utils/story-processor.js";
import {
  buildStoryURL,
  findStoryBySlugs,
  getDefaultStory,
  parseArgsFromSearch,
  buildDocsPath,
  buildTokensPath,
  buildIconsPath,
  slugify,
} from "./utils/url-manager.js";
import { initRouter, navigateTo, subscribeToRouter } from "./router.js";

// Import all design system components via barrel file
import "@design-system";

// Import new composed components
import "./components/fable-story-navigator.js";
import "./components/fable-story-preview.js";
import "./components/fable-controls-panel.js";
import "./components/fable-theme-toggle.js";
import "./components/fable-source-drawer.js";
import "./components/fable-docs-view.js";
import "./components/fable-tokens-view.js";
import "./components/fable-icons-view.js";

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
      gap: 0;
      position: relative;
    }
    .view-host {
      position: relative;
      border-right: 1px solid var(--border-color);
      overflow: hidden;
    }
    .view-host > * {
      position: absolute;
      inset: 0;
      display: flex;
    }
    .view-host > :not(.active) {
      opacity: 0;
      pointer-events: none;
    }
    .view-host > .active {
      opacity: 1;
      pointer-events: auto;
    }
    .theme-toggle-wrapper {
      position: absolute;
      top: 20px;
      right: 20px;
      z-index: 100;
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
    setTheme(
      getStories().length > 0 ? getCurrentArgs().theme || "light" : "light",
    );

    // Router setup
    this._setupRouter();
  }

  _setupRouter() {
    const initialRoute = initRouter();
    this._unsubscribeRouter = subscribeToRouter(
      (route) => this._handleRouteChange(route),
      { immediate: false },
    );
    if (initialRoute) {
      this._handleRouteChange(initialRoute);
    }
  }

  _handleRouteChange(route) {
    const storiesData = getStories();
    if (!storiesData.length) return;

    const ensureDefaultStory = () => {
      const defaultStory = getDefaultStory(storiesData);
      if (!defaultStory) return;
      selectStory(defaultStory.groupIndex, defaultStory.name, {
        syncURL: false,
      });
      const fallbackParams = {
        group: slugify(
          storiesData[defaultStory.groupIndex]?.meta?.title || "component",
        ),
        story: slugify(defaultStory.name),
      };
      setView({ name: "component", params: fallbackParams });
      const defaultUrl = buildStoryURL(
        storiesData,
        defaultStory.groupIndex,
        defaultStory.name,
        defaultStory.args || {},
      );
      navigateTo(defaultUrl, { replace: true });
    };

    switch (route.name) {
      case "component": {
        const match = findStoryBySlugs(
          storiesData,
          route.params.group,
          route.params.story,
        );
        if (match) {
          const args = parseArgsFromSearch(route.searchParams);
          selectStory(match.groupIndex, match.name, {
            argsOverride: args,
            syncURL: false,
          });
          setView({ name: "component", params: route.params });
        } else {
          ensureDefaultStory();
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
          (entry) =>
            entry.section === route.params.section &&
            entry.slug === route.params.slug,
        );
        if (!doc) {
          doc =
            docs.find((entry) => entry.section === route.params.section) ||
            docs[0];
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
          tokens.find((entry) => entry.id === route.params.tokenId) ||
          tokens[0];
        if (token && token.id !== route.params.tokenId) {
          navigateTo(buildTokensPath(token.id), { replace: true });
        }
        setView({ name: "tokens", params: { tokenId: token?.id } });
        break;
      }
      case "icons": {
        const icons = getIconMetadata();
        const icon =
          icons.find((entry) => entry.id === route.params.iconId) || icons[0];
        if (icon && icon.id !== route.params.iconId) {
          navigateTo(buildIconsPath(icon.id), { replace: true });
        }
        setView({ name: "icons", params: { iconId: icon?.id } });
        break;
      }
      case "home":
        ensureDefaultStory();
        setView({ name: "home", params: {} });
        break;
      default:
        ensureDefaultStory();
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
      case "component":
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
        <div class="theme-toggle-wrapper">
          <fable-theme-toggle></fable-theme-toggle>
        </div>
        <fable-source-drawer></fable-source-drawer>
      </main>
    `;
  }
}

customElements.define("fable-app", FableApp);

// Initialize app
const root = document.getElementById("root");
if (root) root.innerHTML = "<fable-app></fable-app>";
