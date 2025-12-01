import { getSelectedStory, getStories } from "@store";
import { buildStoryURL, getStatusTooltip } from "@utils";
import { html, LitElement } from "lit";
import "@design-system/sidebar.js";
import "@design-system/nav-group.js";
import "@design-system/badge.js";
import "@design-system/link.js";
import "@design-system/search-input.js";
import "./fable-theme-toggle.js";
import { AUTO_RECIPES_STORY_NAME } from "../config/recipes.js";
import { navigateTo } from "../router.js";

export class FableStoryNavigator extends LitElement {
  static properties = {
    _stories: { state: true },
    _selected: { state: true },
    _query: { state: true },
  };

  constructor() {
    super();
    this._stories = getStories();
    this._selected = getSelectedStory();
    this._query = "";
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
    const { key } = e.detail;
    if (key === "stories" || key === "selectedStory") {
      this._stories = getStories();
      this._selected = getSelectedStory();
    }
    this.requestUpdate();
  }

  _isActiveStory(groupIndex, storyName) {
    return (
      this._selected &&
      this._selected.groupIndex === groupIndex &&
      this._selected.name === storyName
    );
  }

  _getStoryHref(groupIndex, storyName) {
    const group = this._stories[groupIndex];
    if (!group) return "#";
    return buildStoryURL(this._stories, groupIndex, storyName, group.meta?.args || {});
  }

  _handleStoryClick(event, groupIndex, name) {
    event.preventDefault();
    const href = this._getStoryHref(groupIndex, name);
    navigateTo(href);
  }

  _filterStories() {
    const query = this._query.trim().toLowerCase();
    return this._stories
      .map((group, groupIndex) => ({
        group,
        groupIndex,
        stories: this._resolveStoryNames(group),
      }))
      .filter(({ group }) =>
        query
          ? `${group.meta?.title || ""} ${group.meta?.taxonomy?.group || ""}`
              .toLowerCase()
              .includes(query)
          : true
      );
  }

  _resolveStoryNames(group) {
    const storyNames = Object.keys(group.stories || {});
    if (storyNames.includes(AUTO_RECIPES_STORY_NAME)) {
      return [AUTO_RECIPES_STORY_NAME];
    }
    return storyNames.slice(0, 1);
  }

  _handleSearchInput(event) {
    this._query = event.target.value;
  }

  render() {
    const filteredStories = this._filterStories();
    return html`
      <fable-sidebar>
        <div class="navigator-search">
          <fable-search-input
            placeholder="Search components"
            .value=${this._query}
            @input=${this._handleSearchInput}
          ></fable-search-input>
          <fable-theme-toggle></fable-theme-toggle>
        </div>
        <section class="navigator-section">
          <h2 class="navigator-heading">Components</h2>
          ${
            filteredStories.length === 0
              ? html`<p>No components match "${this._query}".</p>`
              : filteredStories.map(
                  ({ group, groupIndex, stories }) => html`
                    <fable-nav-group title=${group.meta.title}>
                      ${
                        group.meta?.taxonomy?.status
                          ? html`<fable-badge
                              slot="title"
                              variant=${group.meta.taxonomy.status}
                              size="condensed"
                              tooltip=${getStatusTooltip(group.meta.taxonomy.status)}
                              >${group.meta.taxonomy.status}</fable-badge
                            >`
                          : ""
                      }
                      ${stories.map(
                        (name) => html`
                          <fable-link
                            href=${this._getStoryHref(groupIndex, name)}
                            ?active=${this._isActiveStory(groupIndex, name)}
                            @click=${(e) => this._handleStoryClick(e, groupIndex, name)}
                          >
                            ${name}
                          </fable-link>
                        `
                      )}
                    </fable-nav-group>
                  `
                )
          }
        </section>
      </fable-sidebar>
    `;
  }
}

customElements.define("fable-story-navigator", FableStoryNavigator);
