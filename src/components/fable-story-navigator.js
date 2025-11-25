import { getSelectedStory, getStories, selectStory } from "@store";
import { getStatusTooltip } from "@utils";
import { css, html, LitElement } from "lit";
import "@design-system/sidebar.js";
import "@design-system/nav-group.js";
import "@design-system/badge.js";
import "@design-system/link.js";

/**
 * Story Navigator - Left sidebar with navigation
 */
export class FableStoryNavigator extends LitElement {
  static styles = css`
    :host {
      display: contents;
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
              ${
                g.meta.status
                  ? html`<fable-badge
                    slot="title"
                    variant=${g.meta.status}
                    size="condensed"
                    tooltip="${getStatusTooltip(g.meta.status)}"
                    >${g.meta.status}</fable-badge
                  >`
                  : ""
              }
              ${Object.keys(g.stories).map(
                (name) => html`
                  <fable-link
                    href=${this._getStoryHref(gi, name)}
                    ?active=${this._isActiveStory(gi, name)}
                    @click=${(e) => this._handleStoryClick(e, gi, name)}
                  >
                    ${name}
                  </fable-link>
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
