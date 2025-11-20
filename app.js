import { css, html, LitElement } from "lit";
import "./components/fablr-button.js";
import "./components/fablr-card.js";
import "./components/fablr-input.js";
import "./components/fablr-link.js";

class FablrApp extends LitElement {
  static styles = css`
    :host {
      display: contents;
    }
    main {
      display: grid;
      grid-template-columns: 250px 1fr 300px;
      height: 100vh;
      gap: 0;
    }
    #sidebar {
      border-right: 1px solid #e0e0e0;
      padding: 20px;
    }
    #preview {
      padding: 20px;
      border-right: 1px solid #e0e0e0;
    }
    #controls-sidebar {
      padding: 20px;
      overflow-y: auto;
    }
    .story-group {
      margin-bottom: 16px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .story-title {
      font-weight: 600;
      margin-bottom: 4px;
    }
    fablr-link {
      display: block;
    }
    .controls {
      margin-top: 0;
      padding-top: 0;
      border-top: none;
    }
    .control {
      margin-bottom: 8px;
    }
    .control label {
      display: grid;
      grid-template-rows: auto auto;
      gap: 6px;
      font-style: italic;

      font-size: 0.9rem;
      margin-bottom: 4px;
    }
    .control input[type="checkbox"] {
      width: 20px;
      height: 20px;
    }
    .control input[type="text"] {
      padding: 6px 8px;
    }
    .control textarea {
      padding: 6px 8px;
      font-family: var(--font-stack);
      font-size: var(--font-body);
      resize: vertical;
    }
    .control input:disabled,
    .control textarea:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `;

  static properties = {
    stories: { type: Array },
    selected: { type: Object },
    currentArgs: { type: Object },
    currentSlots: { type: Object },
    lockedArgs: { type: Object },
  };

  constructor() {
    super();
    this.stories = window.__FABLR_STORIES__ || [];
    this.currentSlots = {};
    this.lockedArgs = {};
    this._initializeFromURL();
    this._setupPopStateListener();
  }

  connectedCallback() {
    super.connectedCallback();
    this._boundPopStateHandler = this._handlePopState.bind(this);
    window.addEventListener("popstate", this._boundPopStateHandler);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("popstate", this._boundPopStateHandler);
  }

  _setupPopStateListener() {
    // Initial setup for handling browser back/forward
    this._boundPopStateHandler = this._handlePopState.bind(this);
  }

  _handlePopState(_event) {
    this._initializeFromURL();
  }

  _initializeFromURL() {
    const params = new URLSearchParams(window.location.search);
    const storyParam = params.get("story");

    if (storyParam && this.stories.length) {
      // Parse story param: "component-slug/story-slug"
      const [componentSlug, storySlug] = storyParam.split("/");

      if (componentSlug && storySlug) {
        // Find the matching story
        let found = false;
        for (let gi = 0; gi < this.stories.length; gi++) {
          const group = this.stories[gi];
          const titleSlug = this._slugify(group.meta.title);

          if (titleSlug === componentSlug) {
            const storyNames = Object.keys(group.stories);
            for (const name of storyNames) {
              if (this._slugify(name) === storySlug) {
                this.selected = { groupIndex: gi, name };

                // Load args from URL params or defaults
                this.currentArgs = { ...(group.meta?.args || {}) };

                // Override with URL params (excluding 'story' param)
                params.forEach((value, key) => {
                  if (key !== "story") {
                    // Parse boolean values
                    if (value === "true") {
                      this.currentArgs[key] = true;
                    } else if (value === "false") {
                      this.currentArgs[key] = false;
                    } else {
                      this.currentArgs[key] = value;
                    }
                  }
                });

                found = true;
                break;
              }
            }
          }
          if (found) break;
        }

        if (!found) {
          this._setDefaultStory();
        }
      } else {
        this._setDefaultStory();
      }
    } else if (this.stories.length) {
      this._setDefaultStory();
    } else {
      this.selected = null;
      this.currentArgs = {};
    }
  }

  _setDefaultStory() {
    const firstGroup = this.stories[0];
    const firstName = Object.keys(firstGroup.stories)[0];
    this.selected = { groupIndex: 0, name: firstName };
    this.currentArgs = { ...(firstGroup.meta?.args || {}) };
    this.currentSlots = { ...(firstGroup.meta?.slots || {}) };
    this._updateURL(false); // Update URL without pushing to history
  }

  _slugify(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  _updateURL(pushState = true) {
    if (!this.selected) return;

    const group = this.stories[this.selected.groupIndex];
    const componentSlug = this._slugify(group.meta.title);
    const storySlug = this._slugify(this.selected.name);

    // Build query string with story param and all args
    const params = new URLSearchParams();
    params.set("story", `${componentSlug}/${storySlug}`);

    Object.entries(this.currentArgs).forEach(([key, value]) => {
      params.set(key, String(value));
    });

    const url = `?${params.toString()}`;

    if (pushState) {
      window.history.pushState(
        {
          groupIndex: this.selected.groupIndex,
          name: this.selected.name,
          args: this.currentArgs,
        },
        "",
        url
      );
    } else {
      window.history.replaceState(
        {
          groupIndex: this.selected.groupIndex,
          name: this.selected.name,
          args: this.currentArgs,
        },
        "",
        url
      );
    }
  }

  selectStory(groupIndex, name) {
    this.selected = { groupIndex, name };
    const group = this.stories[groupIndex];
    const story = group.stories[name];
    const baseArgs = { ...(group.meta?.args || {}) };

    // If story is an object with args function, compute the args
    if (typeof story === "object" && story.args) {
      this.currentArgs = story.args(baseArgs);
    } else {
      this.currentArgs = baseArgs;
    }

    this.currentSlots = { ...(group.meta?.slots || {}) };

    // Merge meta-level and story-level locked args
    this.lockedArgs = {
      ...(group.meta?.lockedArgs || {}),
      ...(typeof story === "object" ? story.lockedArgs || {} : {}),
    };

    this._updateURL(true);
  }

  onArgChange(key, value) {
    this.currentArgs = { ...this.currentArgs, [key]: value };
    this._updateURL(true);
  }

  onSlotChange(key, value) {
    this.currentSlots = { ...this.currentSlots, [key]: value };
  }

  unlockArg(key) {
    this.lockedArgs = { ...this.lockedArgs, [key]: false };
  }

  renderControlsSidebar() {
    if (!this.selected)
      return html`<div id="controls-sidebar">
        <p>Select a story to see controls</p>
      </div>`;
    const group = this.stories[this.selected.groupIndex];
    const argDefs = group.meta?.args || {};
    const slotDefs = group.meta?.slots || {};
    const argKeys = Object.keys(argDefs);
    const slotKeys = Object.keys(slotDefs);
    if (!argKeys.length && !slotKeys.length)
      return html`<div id="controls-sidebar">
        <p>No controls available</p>
      </div>`;
    return html`
      <div id="controls-sidebar">
        <h3>Controls</h3>
        <div class="controls">
          ${argKeys.map((k) => {
            const val = this.currentArgs[k];
            const isLocked = this.lockedArgs[k] === true;
            if (typeof argDefs[k] === "boolean" || typeof val === "boolean") {
              return html`
                <div class="control">
                  <label
                    >${k}${isLocked
                      ? html` <button
                          @click=${() => this.unlockArg(k)}
                          style="font-size: 0.8em; margin-left: 4px;"
                        >
                          🔓
                        </button>`
                      : ""}<input
                      type="checkbox"
                      .checked=${!!val}
                      ?disabled=${isLocked}
                      @change=${(e) => this.onArgChange(k, e.target.checked)}
                  /></label>
                </div>
              `;
            }
            return html`
              <div class="control">
                <label
                  >${k}${isLocked
                    ? html` <button
                        @click=${() => this.unlockArg(k)}
                        style="font-size: 0.8em; margin-left: 4px;"
                      >
                        🔓
                      </button>`
                    : ""}<input
                    type="text"
                    .value=${val ?? ""}
                    ?disabled=${isLocked}
                    @input=${(e) => this.onArgChange(k, e.target.value)}
                /></label>
              </div>
            `;
          })}
          ${slotKeys.map((k) => {
            const val = this.currentSlots[k] ?? slotDefs[k];
            return html`
              <div class="control">
                <label
                  >${k}<textarea
                    .value=${val}
                    @input=${(e) => this.onSlotChange(k, e.target.value)}
                    rows="3"
                  ></textarea>
                </label>
              </div>
            `;
          })}
        </div>
      </div>
    `;
  }

  _getStoryURL(groupIndex, storyName) {
    const group = this.stories[groupIndex];
    const componentSlug = this._slugify(group.meta.title);
    const storySlug = this._slugify(storyName);

    // Get default args for this story
    const defaultArgs = group.meta?.args || {};
    const params = new URLSearchParams();
    params.set("story", `${componentSlug}/${storySlug}`);

    // Add default args to URL
    Object.entries(defaultArgs).forEach(([key, value]) => {
      params.set(key, String(value));
    });

    return `?${params.toString()}`;
  }

  _isActiveStory(groupIndex, storyName) {
    return (
      this.selected &&
      this.selected.groupIndex === groupIndex &&
      this.selected.name === storyName
    );
  }

  renderSidebar() {
    return html`
      <div id="sidebar">
        <h2>Components</h2>
        ${this.stories.map(
          (g, gi) => html`
            <div class="story-group">
              <div class="story-title">${g.meta.title}</div>
              ${Object.keys(g.stories).map(
                (name) => html`
                  <fablr-link
                    href=${this._getStoryURL(gi, name)}
                    ?active=${this._isActiveStory(gi, name)}
                    @click=${() => this.selectStory(gi, name)}
                  >
                    ${name}
                  </fablr-link>
                `
              )}
            </div>
          `
        )}
      </div>
    `;
  }

  renderPreview() {
    if (!this.selected) {
      return html`<div id="preview">
        <h1>Welcome to Fablr</h1>
        <p>
          No stories found — add components with stories in the components/
          folder.
        </p>
      </div>`;
    }
    const group = this.stories[this.selected.groupIndex];
    const story = group.stories[this.selected.name];

    // Support both function and object format
    const storyFn = typeof story === "function" ? story : story.render;

    return html`
      <div id="preview">
        <h3>${group.meta.title} — ${this.selected.name}</h3>
        <div class="story-area">
          ${storyFn(this.currentArgs, this.currentSlots)}
        </div>
      </div>
    `;
  }

  render() {
    return html`
      <main>
        ${this.renderSidebar()} ${this.renderPreview()}
        ${this.renderControlsSidebar()}
      </main>
    `;
  }
}

customElements.define("fablr-app", FablrApp);

const root = document.getElementById("root");
if (root) root.innerHTML = "<fablr-app></fablr-app>";
