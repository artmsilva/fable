import { PROJECT_NAME } from "@config";
import {
  getCurrentArgs,
  getCurrentSlots,
  getProcessedSlots,
  getSelectedStory,
  getStories,
  toggleSourceDrawer,
} from "@store";
import { getStatusTooltip } from "@utils";
import { css, html, LitElement } from "lit";
import "@design-system/preview.js";
import "@design-system/header.js";
import "@design-system/badge.js";
import "@design-system/icon-button.js";

/**
 * Story Preview - Center preview area with header
 */
export class FableStoryPreview extends LitElement {
  static styles = css`
    :host {
      display: contents;
    }
  `;

  static properties = {
    _stories: { state: true },
    _selected: { state: true },
    _args: { state: true },
    _slots: { state: true },
  };

  constructor() {
    super();
    this._stories = getStories();
    this._selected = getSelectedStory();
    this._args = getCurrentArgs();
    this._slots = getCurrentSlots();
    this._handleStateChange = this._handleStateChange.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("state-changed", this._handleStateChange);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("state-changed", this._handleStateChange);
  }

  _handleStateChange(e) {
    const key = e.detail.key;
    if (["stories", "selectedStory", "currentArgs", "currentSlots"].includes(key)) {
      this._stories = getStories();
      this._selected = getSelectedStory();
      this._args = getCurrentArgs();
      this._slots = getCurrentSlots();
      this.requestUpdate();
    }
  }

  _handleSourceClick() {
    toggleSourceDrawer();
  }

  render() {
    if (!this._selected) {
      return html`<fable-preview>
        <h1>Welcome to ${PROJECT_NAME}</h1>
        <p>
          No stories found — add components with stories in the components/
          folder.
        </p>
      </fable-preview>`;
    }

    const group = this._stories[this._selected.groupIndex];
    const story = group.stories[this._selected.name];
    const status = group.meta?.status;

    // Support both function and object format
    const storyFn = typeof story === "function" ? story : story.render;
    const processedSlots = getProcessedSlots();

    return html`
      <div>
        <fable-header>
          <h3>${group.meta.title} — ${this._selected.name}</h3>
          <div style="display: flex; gap: var(--space-2); align-items: center;">
            ${
              status
                ? html`<fable-badge
                  variant=${status}
                  tooltip="${getStatusTooltip(status)}"
                  >${status}</fable-badge
                >`
                : ""
            }
            <fable-icon-button
              aria-label="View source code"
              @click=${this._handleSourceClick}
            >
              🧑‍💻
            </fable-icon-button>
          </div>
        </fable-header>
        <fable-preview>
          <div class="story-area">${storyFn(this._args, processedSlots)}</div>
        </fable-preview>
      </div>
    `;
  }
}

customElements.define("fable-story-preview", FableStoryPreview);
