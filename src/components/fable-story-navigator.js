import { css, html, LitElement } from "lit";
import {
  getStories,
  getSelectedStory,
  selectStory,
} from "../store/app-store.js";
import { getStatusTooltip } from "../utils/story-processor.js";
import "../components/sidebar.js";
import "../components/nav-group.js";
import "../components/badge.js";

/**
 * Story Navigator - Left sidebar with navigation
 */
export class FableStoryNavigator extends LitElement {
  static styles = css`
    :host {
      display: contents;
    }
    .story-link {
      color: var(--primary-color);
      text-decoration: none;
      cursor: pointer;
      padding: calc(var(--space-base)) var(--space-2);
      border-radius: var(--space-base);
      transition: background-color 0.2s;
      display: block;
      font-size: var(--font-body);
      font-family: var(--font-stack);
    }
    .story-link:hover {
      background-color: color-mix(
        in srgb,
        var(--primary-color) 10%,
        transparent
      );
      text-decoration: underline;
    }
    .story-link.active {
      background-color: color-mix(
        in srgb,
        var(--primary-color) 15%,
        transparent
      );
      color: var(--primary-color);
      font-weight: 600;
    }
  `;

  static properties = {
    _stories: { state: true },
    _selected: { state: true },
  };

  constructor() {
    super();
    this._stories = getStories();
    this._selected = getSelectedStory();
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
    if (e.detail.key === "stories" || e.detail.key === "selectedStory") {
      this._stories = getStories();
      this._selected = getSelectedStory();
      this.requestUpdate();
    }
  }

  _isActiveStory(groupIndex, storyName) {
    return (
      this._selected &&
      this._selected.groupIndex === groupIndex &&
      this._selected.name === storyName
    );
  }

  _slugify(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  _getStoryHref(groupIndex, storyName) {
    const group = this._stories[groupIndex];
    if (!group) return "#";

    const componentSlug = this._slugify(group.meta.title);
    const storySlug = this._slugify(storyName);
    const defaultArgs = group.meta?.args || {};

    const params = new URLSearchParams();
    params.set("story", `${componentSlug}/${storySlug}`);

    Object.entries(defaultArgs).forEach(([key, value]) => {
      params.set(key, String(value));
    });

    return `?${params.toString()}`;
  }

  _handleStoryClick(e, groupIndex, name) {
    e.preventDefault();
    selectStory(groupIndex, name);
  }

  render() {
    return html`
      <fable-sidebar>
        <h2>Components</h2>
        ${this._stories.map(
          (g, gi) => html`
            <fable-nav-group title=${g.meta.title}>
              ${g.meta.status
                ? html`<fable-badge
                    slot="title"
                    variant=${g.meta.status}
                    size="condensed"
                    tooltip="${getStatusTooltip(g.meta.status)}"
                    >${g.meta.status}</fable-badge
                  >`
                : ""}
              ${Object.keys(g.stories).map(
                (name) => html`
                  <a
                    href=${this._getStoryHref(gi, name)}
                    class="story-link ${this._isActiveStory(gi, name)
                      ? "active"
                      : ""}"
                    @click=${(e) => this._handleStoryClick(e, gi, name)}
                  >
                    ${name}
                  </a>
                `
              )}
            </fable-nav-group>
          `
        )}
      </fable-sidebar>
    `;
  }
}

customElements.define("fable-story-navigator", FableStoryNavigator);
